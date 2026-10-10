"""
TrustLens Reputation Confidence & Review Pydantic Schemas
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class ReviewCreate(BaseModel):
    booking_id: str
    reviewee_id: str
    rating: float = Field(..., ge=1.0, le=5.0, description="Overall experience rating (1.0 - 5.0)")
    condition_rating: Optional[float] = Field(5.0, ge=1.0, le=5.0)
    communication_rating: Optional[float] = Field(5.0, ge=1.0, le=5.0)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: str
    booking_id: str
    reviewer_id: str
    reviewee_id: str
    rating: float
    condition_rating: float
    communication_rating: float
    comment: Optional[str] = None
    is_eligible: bool
    created_at: datetime

    class Config:
        from_attributes = True

class StressTestResult(BaseModel):
    baseline_rating: Optional[float] = None
    tested_rating: Optional[float] = None
    rating_sensitivity: Optional[float] = None
    excluded_group_size: int = 0
    excluded_counterparty_count: int = 0
    status: str  # "evaluated" | "insufficient_reviews_for_stress_test"
    explanation: str

class TrustLensResponse(BaseModel):
    user_id: str
    eligible_review_count: int
    average_rating: Optional[float] = None
    completed_rental_count: int
    distinct_counterparty_count: int
    reputation_confidence: str  # "insufficient_evidence" | "limited_evidence" | "moderate_evidence" | "stronger_evidence"
    confidence_headline: str
    stress_test: StressTestResult
    reason_codes: List[str]
    explanations: List[str]
    analyzed_at: datetime

class AdminTrustDiagnostic(BaseModel):
    user_id: str
    total_reviews_raw: int
    eligible_reviews: int
    ineligible_reviews_filtered: int
    disputed_transactions_count: int
    network_density: float
    top_counterparty_share: float
    graph_edge_count: int
    details: dict
