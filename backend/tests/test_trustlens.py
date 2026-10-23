"""
TrustLens Automated Unit & Integration Tests
Validates all 10 core safety, robustness, sensitivity, and fairness scenarios.
Uses deterministic in-memory async SQLite sessions.
"""
import asyncio
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.core.database import Base
from app.models.booking import Booking, BookingStage
from app.models.review import Review
from app.models.dispute import Dispute
from app.services.trustlens import TrustLensEngine


async def get_isolated_db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False, future=True)
    async_session = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    return engine, async_session


def test_scenario_1_new_user_insufficient_history():
    """
    Scenario 1: A new citizen with zero transactions must receive 'insufficient_evidence'
    and a supportive message stating they are NOT penalized.
    """
    async def run():
        engine, async_session = await get_isolated_db()
        async with async_session() as db:
            tl = TrustLensEngine(db)
            res = await tl.get_user_reputation_metrics("u_new_alice")

            assert res.reputation_confidence == "insufficient_evidence"
            assert res.eligible_review_count == 0
            assert res.average_rating is None
            assert "NEW_USER_INSUFFICIENT_HISTORY" in res.reason_codes
            assert any("not being penalized" in exp for exp in res.explanations)
            assert res.stress_test.status == "insufficient_reviews_for_stress_test"
        await engine.dispose()

    asyncio.run(run())


def test_scenario_2_independent_positive_reviews():
    """
    Scenario 2: A user with positive reviews from independent distinct counterparties.
    """
    async def run():
        engine, async_session = await get_isolated_db()
        async with async_session() as db:
            user_id = "u_honest_bob"

            # Seed 5 completed bookings from 5 distinct borrowers
            for i in range(5):
                borrower_id = f"u_borrower_{i}"
                bk = Booking(
                    id=f"bk_honest_{i}",
                    resource_id="r1",
                    borrower_id=borrower_id,
                    owner_id=user_id,
                    start_date="2026-08-01",
                    end_date="2026-08-03",
                    total_amount=1000.0,
                    deposit_amount=1000.0,
                    stage=BookingStage.COMPLETED.value
                )
                db.add(bk)
                rev = Review(
                    id=f"rev_honest_{i}",
                    booking_id=bk.id,
                    reviewer_id=borrower_id,
                    reviewee_id=user_id,
                    rating=4.9,
                    is_eligible=True
                )
                db.add(rev)
            await db.commit()

            tl = TrustLensEngine(db)
            res = await tl.get_user_reputation_metrics(user_id)

            assert res.eligible_review_count == 5
            assert res.distinct_counterparty_count == 5
            assert res.average_rating == 4.9
            assert res.reputation_confidence in ["moderate_evidence", "stronger_evidence"]
            assert "BROAD_REVIEWER_DIVERSITY" in res.reason_codes
        await engine.dispose()

    asyncio.run(run())


def test_scenario_3_two_users_repeatedly_reviewing_each_other():
    """
    Scenario 3: Two users repeatedly transacting in a closed loop.
    Must detect high concentration and return limited/insufficient evidence without accusing fraud.
    """
    async def run():
        engine, async_session = await get_isolated_db()
        async with async_session() as db:
            user_a = "u_loop_a"
            user_b = "u_loop_b"

            for i in range(6):
                bk = Booking(
                    id=f"bk_loop_{i}",
                    resource_id="r1",
                    borrower_id=user_b,
                    owner_id=user_a,
                    start_date="2026-08-01",
                    end_date="2026-08-02",
                    total_amount=500.0,
                    deposit_amount=500.0,
                    stage=BookingStage.COMPLETED.value
                )
                db.add(bk)
                rev = Review(
                    id=f"rev_loop_{i}",
                    booking_id=bk.id,
                    reviewer_id=user_b,
                    reviewee_id=user_a,
                    rating=5.0,
                    is_eligible=True
                )
                db.add(rev)
            await db.commit()

            tl = TrustLensEngine(db)
            res = await tl.get_user_reputation_metrics(user_a)

            assert res.eligible_review_count == 6
            assert res.distinct_counterparty_count == 1  # Only 1 counterparty!
            assert res.reputation_confidence == "insufficient_evidence"
            assert "NEW_USER_INSUFFICIENT_HISTORY" in res.reason_codes
        await engine.dispose()

    asyncio.run(run())


def test_scenario_4_and_6_stress_test_sensitivity():
    """
    Scenario 4 & 6: Ratings change substantially under single-group exclusion stress test.
    User has 5 high reviews from 1 friend (5.0 stars) and 2 lower reviews from others (3.0 stars).
    Excluding the friend must trigger high sensitivity.
    """
    async def run():
        engine, async_session = await get_isolated_db()
        async with async_session() as db:
            target_user = "u_biased_charlie"
            best_friend = "u_friend_dave"

            # 5 reviews of 5.0 from friend
            for i in range(5):
                bk = Booking(
                    id=f"bk_biased_f_{i}",
                    resource_id="r1",
                    borrower_id=best_friend,
                    owner_id=target_user,
                    start_date="2026-08-01",
                    end_date="2026-08-02",
                    total_amount=500.0,
                    deposit_amount=500.0,
                    stage=BookingStage.COMPLETED.value
                )
                db.add(bk)
                rev = Review(
                    id=f"rev_biased_f_{i}",
                    booking_id=bk.id,
                    reviewer_id=best_friend,
                    reviewee_id=target_user,
                    rating=5.0,
                    is_eligible=True
                )
                db.add(rev)

            # 2 reviews of 3.0 from independent strangers
            for j in range(2):
                stranger_id = f"u_stranger_{j}"
                bk = Booking(
                    id=f"bk_biased_s_{j}",
                    resource_id="r1",
                    borrower_id=stranger_id,
                    owner_id=target_user,
                    start_date="2026-08-01",
                    end_date="2026-08-02",
                    total_amount=500.0,
                    deposit_amount=500.0,
                    stage=BookingStage.COMPLETED.value
                )
                db.add(bk)
                rev = Review(
                    id=f"rev_biased_s_{j}",
                    booking_id=bk.id,
                    reviewer_id=stranger_id,
                    reviewee_id=target_user,
                    rating=3.0,
                    is_eligible=True
                )
                db.add(rev)

            await db.commit()

            tl = TrustLensEngine(db)
            res = await tl.get_user_reputation_metrics(target_user)

            # Baseline: (5*5.0 + 2*3.0)/7 = 31/7 = 4.43
            assert res.average_rating == 4.43
            assert res.stress_test.status == "evaluated"
            # Tested without friend: 2*3.0/2 = 3.0
            assert res.stress_test.tested_rating == 3.0
            assert res.stress_test.rating_sensitivity == round(4.43 - 3.0, 2)  # 1.43
            assert "REPUTATION_SENSITIVE_TO_GROUP_EXCLUSION" in res.reason_codes
        await engine.dispose()

    asyncio.run(run())


def test_scenario_7_insufficient_reviews_after_exclusion():
    """
    Scenario 7: User with only 2 reviews from 2 people.
    Excluding 1 leaves only 1 review, which is insufficient for reliable sensitivity testing.
    """
    async def run():
        engine, async_session = await get_isolated_db()
        async with async_session() as db:
            user_id = "u_small_history"

            for i in range(2):
                cp_id = f"u_cp_{i}"
                bk = Booking(
                    id=f"bk_small_{i}",
                    resource_id="r1",
                    borrower_id=cp_id,
                    owner_id=user_id,
                    start_date="2026-08-01",
                    end_date="2026-08-02",
                    total_amount=500.0,
                    deposit_amount=500.0,
                    stage=BookingStage.COMPLETED.value
                )
                db.add(bk)
                rev = Review(
                    id=f"rev_small_{i}",
                    booking_id=bk.id,
                    reviewer_id=cp_id,
                    reviewee_id=user_id,
                    rating=5.0,
                    is_eligible=True
                )
                db.add(rev)
            await db.commit()

            tl = TrustLensEngine(db)
            res = await tl.get_user_reputation_metrics(user_id)

            assert res.stress_test.status == "insufficient_reviews_for_stress_test"
        await engine.dispose()

    asyncio.run(run())


def test_scenario_8_cancelled_rentals_and_disputes_filtered():
    """
    Scenario 8: Cancelled rentals or active disputes must NOT be counted as legitimate evidence.
    """
    async def run():
        engine, async_session = await get_isolated_db()
        async with async_session() as db:
            user_id = "u_clean_user"

            # 1 legitimate completed rental
            bk_valid = Booking(
                id="bk_valid_1",
                resource_id="r1",
                borrower_id="u_person_x",
                owner_id=user_id,
                start_date="2026-08-01",
                end_date="2026-08-02",
                total_amount=500.0,
                deposit_amount=500.0,
                stage=BookingStage.COMPLETED.value
            )
            db.add(bk_valid)
            rev_valid = Review(
                id="rev_valid_1",
                booking_id=bk_valid.id,
                reviewer_id="u_person_x",
                reviewee_id=user_id,
                rating=5.0,
                is_eligible=True
            )
            db.add(rev_valid)

            # 1 disputed rental
            bk_disputed = Booking(
                id="bk_disputed_1",
                resource_id="r1",
                borrower_id="u_person_y",
                owner_id=user_id,
                start_date="2026-08-01",
                end_date="2026-08-02",
                total_amount=500.0,
                deposit_amount=500.0,
                stage=BookingStage.COMPLETED.value
            )
            db.add(bk_disputed)
            disp = Dispute(
                id="disp_1",
                booking_id=bk_disputed.id,
                initiator_id="u_person_y",
                reason="Item was damaged before pickup",
                status="OPEN"
            )
            db.add(disp)
            rev_disputed = Review(
                id="rev_disputed_1",
                booking_id=bk_disputed.id,
                reviewer_id="u_person_y",
                reviewee_id=user_id,
                rating=1.0,
                is_eligible=True
            )
            db.add(rev_disputed)

            await db.commit()

            tl = TrustLensEngine(db)
            res = await tl.get_user_reputation_metrics(user_id)

            # Disputed review must be filtered out! Only the clean review remains
            assert res.eligible_review_count == 1
            assert res.average_rating == 5.0
        await engine.dispose()

    asyncio.run(run())


def test_scenario_5_broad_network():
    """
    Scenario 5: A user with many legitimate transactions across a broad network.
    """
    async def run():
        engine, async_session = await get_isolated_db()
        async with async_session() as db:
            user_id = "u_veteran_lender"
            # 8 transactions across 7 distinct counterparties
            for i in range(8):
                cp_id = f"u_broad_{i % 7}"
                bk = Booking(
                    id=f"bk_broad_{i}",
                    resource_id="r1",
                    borrower_id=cp_id,
                    owner_id=user_id,
                    start_date="2026-08-01",
                    end_date="2026-08-02",
                    total_amount=500.0,
                    deposit_amount=500.0,
                    stage=BookingStage.COMPLETED.value
                )
                db.add(bk)
                rev = Review(
                    id=f"rev_broad_{i}",
                    booking_id=bk.id,
                    reviewer_id=cp_id,
                    reviewee_id=user_id,
                    rating=4.9,
                    is_eligible=True
                )
                db.add(rev)
            await db.commit()

            tl = TrustLensEngine(db)
            res = await tl.get_user_reputation_metrics(user_id)

            assert res.eligible_review_count == 8
            assert res.distinct_counterparty_count == 7
            assert res.reputation_confidence == "stronger_evidence"
            assert "BROAD_REVIEWER_DIVERSITY" in res.reason_codes
            assert res.stress_test.status == "evaluated"
            assert res.stress_test.rating_sensitivity <= 0.10
        await engine.dispose()

    asyncio.run(run())


def test_scenario_9_genuine_community_fairness():
    """
    Scenario 9: Genuine local community members transacting frequently.
    Must evaluate evidence objectively and NEVER label users as fraudsters or fake.
    """
    async def run():
        engine, async_session = await get_isolated_db()
        async with async_session() as db:
            user_id = "u_dorm_roommate"
            # 3 transactions with roommates
            for i in range(3):
                cp_id = f"u_roommate_{i % 2}"
                bk = Booking(
                    id=f"bk_comm_{i}",
                    resource_id="r1",
                    borrower_id=cp_id,
                    owner_id=user_id,
                    start_date="2026-08-01",
                    end_date="2026-08-02",
                    total_amount=300.0,
                    deposit_amount=300.0,
                    stage=BookingStage.COMPLETED.value
                )
                db.add(bk)
                rev = Review(
                    id=f"rev_comm_{i}",
                    booking_id=bk.id,
                    reviewer_id=cp_id,
                    reviewee_id=user_id,
                    rating=5.0,
                    is_eligible=True
                )
                db.add(rev)
            await db.commit()

            tl = TrustLensEngine(db)
            res = await tl.get_user_reputation_metrics(user_id)

            # Never accuse of fraud or malicious actions
            for exp in res.explanations:
                assert "fraud" not in exp.lower()
                assert "fake" not in exp.lower()
                assert "unsafe" not in exp.lower()
            assert res.reputation_confidence in ["limited_evidence", "moderate_evidence"]
        await engine.dispose()

    asyncio.run(run())


def test_scenario_10_admin_diagnostics_isolation():
    """
    Scenario 10: Admin diagnostics contain deep graph details that are isolated from public responses.
    """
    async def run():
        engine, async_session = await get_isolated_db()
        async with async_session() as db:
            user_id = "u_diag_test"

            tl = TrustLensEngine(db)
            diag = await tl.get_admin_diagnostic(user_id)

            assert hasattr(diag, "network_density")
            assert hasattr(diag, "top_counterparty_share")
            assert hasattr(diag, "disputed_transactions_count")
            assert "counterparty_breakdown" in diag.details
        await engine.dispose()

    asyncio.run(run())
# RE:USE — Modular Circular Economy Architecture
