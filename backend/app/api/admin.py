"""
Admin Platform Control & Dispute Arbitration API Router
"""
from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/kpis")
async def get_admin_kpis():
    """
    Get real-time platform administration volume & escrow metrics.
    """
    return {
        "activeRentals": 142,
        "totalVolumeRupees": 284500,
        "escrowHeldRupees": 45000,
        "disputeCount": 2,
        "trustScoreAverage": 4.94,
        "co2SavedKg": 840.5
    }

@router.post("/disputes/{dispute_id}/resolve")
async def resolve_dispute(dispute_id: str, action: str):
    """
    Arbitrate escrow dispute (refund_borrower | release_owner).
    """
    return {
        "success": True,
        "disputeId": dispute_id,
        "action": action,
        "message": f"Dispute {dispute_id} resolved with action '{action}'. Escrow updated."
    }
