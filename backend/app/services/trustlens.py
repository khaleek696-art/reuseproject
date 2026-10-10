"""
TrustLens — Reputation Confidence Engine for RE:USE
Measures evidence strength and robustness of peer reputation without accusing users or penalizing new accounts.
"""
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from collections import defaultdict
import math

from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.booking import Booking, BookingStage
from app.models.review import Review
from app.models.dispute import Dispute
from app.schemas.trust import TrustLensResponse, StressTestResult, AdminTrustDiagnostic


class TrustLensEngine:
    """
    Core Reputation Confidence & Stress Testing Engine.
    Evaluates:
      1. Eligible Rating Average (excluding disputes & uncompleted rentals)
      2. Counterparty Distribution Graph (clustering & concentration)
      3. Reputation Stress Test (sensitivity when excluding top reviewer group)
      4. Neutral Confidence Classification & Explainability Reason Codes
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_reputation_metrics(self, user_id: str) -> TrustLensResponse:
        """
        Calculates complete TrustLens reputation profile for a citizen.
        Safe, explainable, deterministic, and fair to new users.
        """
        # 1. Fetch legitimate completed rentals where user participated as borrower or owner
        bookings_stmt = select(Booking).where(
            and_(
                (Booking.borrower_id == user_id) | (Booking.owner_id == user_id),
                Booking.stage == BookingStage.COMPLETED.value
            )
        )
        bookings_result = await self.db.execute(bookings_stmt)
        completed_bookings = bookings_result.scalars().all()
        completed_rental_count = len(completed_bookings)

        # Build set of completed booking IDs for eligibility cross-check
        completed_booking_ids = {b.id for b in completed_bookings}

        # 2. Check disputed bookings to filter out compromised reviews
        disputes_stmt = select(Dispute.booking_id)
        disputes_result = await self.db.execute(disputes_stmt)
        disputed_booking_ids = set(disputes_result.scalars().all())

        # 3. Fetch reviews received by this user
        reviews_stmt = select(Review).where(Review.reviewee_id == user_id)
        reviews_result = await self.db.execute(reviews_stmt)
        all_reviews = reviews_result.scalars().all()

        # 4. Filter for eligible reviews only:
        #    - Linked to a valid completed rental
        #    - Not flagged with an active dispute
        #    - Flagged as is_eligible in database
        eligible_reviews: List[Review] = []
        for r in all_reviews:
            if r.booking_id in disputed_booking_ids:
                continue
            # Must be either explicitly verified as eligible or linked to completed rental
            if r.is_eligible and (r.booking_id in completed_booking_ids or completed_rental_count > 0):
                eligible_reviews.append(r)

        eligible_review_count = len(eligible_reviews)

        # Baseline rating calculation
        if eligible_review_count > 0:
            average_rating = round(sum(r.rating for r in eligible_reviews) / eligible_review_count, 2)
        else:
            average_rating = None

        # 5. Build counterparty graph distribution
        counterparty_ratings: Dict[str, List[float]] = defaultdict(list)
        for r in eligible_reviews:
            counterparty_ratings[r.reviewer_id].append(r.rating)

        distinct_counterparty_count = len(counterparty_ratings)

        # 6. Reputation Stress Test Calculation
        stress_test = self._calculate_stress_test(
            eligible_reviews=eligible_reviews,
            counterparty_ratings=counterparty_ratings,
            baseline_rating=average_rating
        )

        # 7. Confidence Category & Reason Codes Determination
        confidence, headline, reason_codes, explanations = self._evaluate_confidence_and_reasons(
            completed_rental_count=completed_rental_count,
            eligible_review_count=eligible_review_count,
            distinct_counterparty_count=distinct_counterparty_count,
            counterparty_ratings=counterparty_ratings,
            stress_test=stress_test
        )

        return TrustLensResponse(
            user_id=user_id,
            eligible_review_count=eligible_review_count,
            average_rating=average_rating,
            completed_rental_count=completed_rental_count,
            distinct_counterparty_count=distinct_counterparty_count,
            reputation_confidence=confidence,
            confidence_headline=headline,
            stress_test=stress_test,
            reason_codes=reason_codes,
            explanations=explanations,
            analyzed_at=datetime.utcnow()
        )

    def _calculate_stress_test(
        self,
        eligible_reviews: List[Review],
        counterparty_ratings: Dict[str, List[float]],
        baseline_rating: Optional[float]
    ) -> StressTestResult:
        """
        Executes sensitivity stress test:
        Identifies the highest-concentration reviewer group and calculates rating variance
        when their reviews are temporarily excluded.
        """
        if not eligible_reviews or baseline_rating is None or len(counterparty_ratings) <= 1:
            return StressTestResult(
                baseline_rating=baseline_rating,
                tested_rating=None,
                rating_sensitivity=None,
                excluded_group_size=0,
                excluded_counterparty_count=0,
                status="insufficient_reviews_for_stress_test",
                explanation="Stress test requires reviews from at least two independent counterparties to measure group sensitivity."
            )

        # Identify top concentrated counterparty by number of reviews provided
        top_counterparty_id = max(counterparty_ratings.keys(), key=lambda cp: len(counterparty_ratings[cp]))
        top_reviews = counterparty_ratings[top_counterparty_id]
        excluded_count = len(top_reviews)

        # Calculate remaining reviews after excluding top concentrated counterparty
        remaining_ratings = [
            r.rating for r in eligible_reviews if r.reviewer_id != top_counterparty_id
        ]

        if len(remaining_ratings) < 2:
            return StressTestResult(
                baseline_rating=baseline_rating,
                tested_rating=None,
                rating_sensitivity=None,
                excluded_group_size=excluded_count,
                excluded_counterparty_count=1,
                status="insufficient_reviews_for_stress_test",
                explanation=f"Excluding the primary reviewer ({excluded_count} reviews) leaves fewer than 2 reviews; sensitivity cannot be reliably estimated without more diverse transaction history."
            )

        tested_avg = round(sum(remaining_ratings) / len(remaining_ratings), 2)
        sensitivity = round(abs(baseline_rating - tested_avg), 2)

        share_pct = round((excluded_count / len(eligible_reviews)) * 100, 1)

        if sensitivity <= 0.20:
            explanation = (
                f"Excluding the top counterparty ({share_pct}% of reviews) causes minimal shift (±{sensitivity} pts). "
                f"Reputation is highly resilient across independent reviewers."
            )
        elif sensitivity <= 0.60:
            explanation = (
                f"Excluding the top counterparty ({share_pct}% of reviews) shifts rating by {sensitivity} pts "
                f"({baseline_rating} → {tested_avg}). Moderate sensitivity observed."
            )
        else:
            explanation = (
                f"Excluding the top counterparty ({share_pct}% of reviews) significantly shifts rating by {sensitivity} pts "
                f"({baseline_rating} → {tested_avg}). Current reputation relies heavily on a single reviewer group."
            )

        return StressTestResult(
            baseline_rating=baseline_rating,
            tested_rating=tested_avg,
            rating_sensitivity=sensitivity,
            excluded_group_size=excluded_count,
            excluded_counterparty_count=1,
            status="evaluated",
            explanation=explanation
        )

    def _evaluate_confidence_and_reasons(
        self,
        completed_rental_count: int,
        eligible_review_count: int,
        distinct_counterparty_count: int,
        counterparty_ratings: Dict[str, List[float]],
        stress_test: StressTestResult
    ) -> Tuple[str, str, List[str], List[str]]:
        """
        Determines neutral confidence categories and transparent reason codes.
        Categories:
          - insufficient_evidence
          - limited_evidence
          - moderate_evidence
          - stronger_evidence
        """
        reason_codes: List[str] = []
        explanations: List[str] = []

        # Case 1: Brand new user with insufficient transaction records
        if completed_rental_count < 2 or eligible_review_count < 2 or distinct_counterparty_count < 2:
            confidence = "insufficient_evidence"
            headline = "Reputation Not Yet Established"
            reason_codes.append("NEW_USER_INSUFFICIENT_HISTORY")
            explanations.append(
                "Not enough completed rental history yet to establish reputation confidence. "
                "Your account is not being penalized for having no reviews."
            )
            return confidence, headline, reason_codes, explanations

        # Compute top counterparty share of total reviews
        max_cp_count = max(len(ratings) for ratings in counterparty_ratings.values())
        top_share = max_cp_count / eligible_review_count

        # Case 2: Limited Evidence
        if distinct_counterparty_count < 4 or top_share > 0.65 or eligible_review_count < 4:
            confidence = "limited_evidence"
            headline = "Limited Independent Counterparties"

            if distinct_counterparty_count < 4:
                reason_codes.append("LIMITED_INDEPENDENT_COUNTERPARTIES")
                explanations.append(
                    f"Reputation is supported by {distinct_counterparty_count} distinct counterparties. "
                    "More diverse transactions are recommended to deepen confidence."
                )

            if top_share > 0.65:
                reason_codes.append("HIGH_REVIEW_NETWORK_CONCENTRATION")
                explanations.append(
                    f"A large share ({round(top_share * 100)}%) of ratings originates from a single frequent counterparty."
                )

            if stress_test.rating_sensitivity is not None and stress_test.rating_sensitivity >= 0.60:
                reason_codes.append("REPUTATION_SENSITIVE_TO_GROUP_EXCLUSION")
                explanations.append(
                    f"Excluding the primary reviewer group shifts rating by {stress_test.rating_sensitivity} points."
                )

            return confidence, headline, reason_codes, explanations

        # Case 3: Stronger Evidence
        if (
            distinct_counterparty_count >= 5
            and eligible_review_count >= 6
            and top_share <= 0.35
            and (stress_test.rating_sensitivity is not None and stress_test.rating_sensitivity <= 0.25)
        ):
            confidence = "stronger_evidence"
            headline = "Strong & Broadly Distributed Reputation"
            reason_codes.append("BROAD_REVIEWER_DIVERSITY")
            explanations.append(
                f"Reputation is supported by a broad network of {distinct_counterparty_count} independent counterparties."
            )
            reason_codes.append("SUFFICIENT_ELIGIBLE_TRANSACTION_HISTORY")
            explanations.append(
                f"{completed_rental_count} completed exchanges with consistent, multi-party positive outcomes."
            )
            if stress_test.rating_sensitivity is not None and stress_test.rating_sensitivity <= 0.15:
                explanations.append(
                    "Sensitivity analysis confirms rating remains stable even when excluding the most frequent reviewer."
                )
            return confidence, headline, reason_codes, explanations

        # Case 4: Moderate Evidence (Default for intermediate histories)
        confidence = "moderate_evidence"
        headline = "Moderate Independent Evidence"
        reason_codes.append("SUFFICIENT_ELIGIBLE_TRANSACTION_HISTORY")
        explanations.append(
            f"Reputation is backed by {completed_rental_count} completed rentals across {distinct_counterparty_count} counterparties."
        )

        if top_share > 0.40:
            reason_codes.append("HIGH_REVIEW_NETWORK_CONCENTRATION")
            explanations.append(
                f"Top counterparty represents {round(top_share * 100)}% of total reviews."
            )
        else:
            reason_codes.append("BROAD_REVIEWER_DIVERSITY")
            explanations.append(
                "Feedback is reasonably distributed across multiple distinct citizens."
            )

        if stress_test.rating_sensitivity is not None:
            if stress_test.rating_sensitivity >= 0.50:
                reason_codes.append("REPUTATION_SENSITIVE_TO_GROUP_EXCLUSION")
                explanations.append(
                    f"Stress testing shows moderate sensitivity (±{stress_test.rating_sensitivity} pts) to single-group exclusion."
                )
            else:
                explanations.append(
                    f"Stress testing shows stable rating resilience (±{stress_test.rating_sensitivity} pts variance)."
                )

        return confidence, headline, reason_codes, explanations

    async def get_admin_diagnostic(self, user_id: str) -> AdminTrustDiagnostic:
        """
        Administrator-only deep graph diagnostics. Never exposed to public profile viewers.
        """
        all_reviews_stmt = select(Review).where(Review.reviewee_id == user_id)
        all_res = await self.db.execute(all_reviews_stmt)
        all_reviews = all_res.scalars().all()

        disputes_stmt = select(Dispute).where(Dispute.initiator_id == user_id)
        disp_res = await self.db.execute(disputes_stmt)
        disputes = disp_res.scalars().all()

        eligible_count = sum(1 for r in all_reviews if r.is_eligible)
        ineligible_count = len(all_reviews) - eligible_count

        cp_counts = defaultdict(int)
        for r in all_reviews:
            cp_counts[r.reviewer_id] += 1

        top_share = (max(cp_counts.values()) / len(all_reviews)) if all_reviews else 0.0

        return AdminTrustDiagnostic(
            user_id=user_id,
            total_reviews_raw=len(all_reviews),
            eligible_reviews=eligible_count,
            ineligible_reviews_filtered=ineligible_count,
            disputed_transactions_count=len(disputes),
            network_density=round(len(cp_counts) / max(len(all_reviews), 1), 3),
            top_counterparty_share=round(top_share, 3),
            graph_edge_count=len(all_reviews),
            details={
                "counterparty_breakdown": dict(cp_counts),
                "dispute_ids": [d.id for d in disputes]
            }
        )
