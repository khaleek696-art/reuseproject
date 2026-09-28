import { Review, User } from "./types";

export interface TrustBadge {
  label: string;
  tier: "highly_trusted" | "trusted" | "building_trust" | "restricted";
  colorClass: string;
  bgClass: string;
  borderClass: string;
  icon: string;
}

export interface TrustBreakdown {
  score: number;
  badge: TrustBadge;
  weightedAvg: number;
  volumeFactor: number;
  totalTransactions: number;
  reviewsCount: number;
  credibleReviewsCount: number;
  explanation: string;
}

/**
 * Returns badge classification based on PeerTrust score
 */
export function getTrustBadge(score: number): TrustBadge {
  if (score >= 4.5) {
    return {
      label: "Highly Trusted",
      tier: "highly_trusted",
      colorClass: "text-emerald-700",
      bgClass: "bg-emerald-50",
      borderClass: "border-emerald-300",
      icon: "ShieldCheck",
    };
  }
  if (score >= 3.5) {
    return {
      label: "Trusted",
      tier: "trusted",
      colorClass: "text-amber-700",
      bgClass: "bg-amber-50",
      borderClass: "border-amber-300",
      icon: "Shield",
    };
  }
  if (score >= 2.0) {
    return {
      label: "Building Trust",
      tier: "building_trust",
      colorClass: "text-orange-700",
      bgClass: "bg-orange-50",
      borderClass: "border-orange-300",
      icon: "TrendingUp",
    };
  }
  return {
    label: "Restricted",
    tier: "restricted",
    colorClass: "text-rose-700",
    bgClass: "bg-rose-50",
    borderClass: "border-rose-300",
    icon: "AlertCircle",
  };
}

/**
 * MODULE C: PeerTrust Calculator
 * Implements rater-credibility weighting and volume dampening
 */
export function computeTrustScore(
  user: User,
  allReviews: Review[],
  allUsers: User[]
): TrustBreakdown {
  const userReviews = allReviews.filter((r) => r.revieweeId === user.id);
  const usersMap = new Map<string, User>(allUsers.map((u) => [u.id, u]));

  // Default baseline for brand new accounts with no reviews
  if (userReviews.length === 0) {
    const totalTxns = user.totalShares + user.totalBorrows;
    const baseScore = user.isVerified ? 4.0 : 3.5;
    return {
      score: baseScore,
      badge: getTrustBadge(baseScore),
      weightedAvg: baseScore,
      volumeFactor: Math.min(1.0, totalTxns / 20),
      totalTransactions: totalTxns,
      reviewsCount: 0,
      credibleReviewsCount: 0,
      explanation: "New community member verified via campus credentials.",
    };
  }

  // STEP 2: Weight each review by rater's credibility score
  let weightedSum = 0;
  let weightTotal = 0;
  let credibleCount = 0;

  userReviews.forEach((review) => {
    const reviewer = usersMap.get(review.reviewerId);
    // If reviewer not found, default to modest credibility 2.5
    const raterTrust = reviewer ? reviewer.trustScore : 2.5;

    // Filter out suspicious/low impact noise: higher weight to trusted members
    weightedSum += review.rating * raterTrust;
    weightTotal += raterTrust;

    if (raterTrust >= 3.5) {
      credibleCount++;
    }
  });

  const weightedAvg = weightTotal > 0 ? weightedSum / weightTotal : 4.0;

  // STEP 3: Volume Context Factor
  // totalTransactions = shares + borrows
  const totalTransactions = user.totalShares + user.totalBorrows;
  const volumeFactor = Math.min(1.0, Math.max(0.1, totalTransactions / 20));

  // STEP 4: Final Trust Score
  // trustScore = weightedAvg * (0.6 + 0.4 * volumeFactor)
  const rawScore = weightedAvg * (0.6 + 0.4 * volumeFactor);
  const finalScore = Math.min(5.0, Math.max(1.0, Math.round(rawScore * 10) / 10));

  const explanation =
    volumeFactor >= 0.9
      ? `High-confidence score based on ${totalTransactions} verified transactions and ${credibleCount} high-credibility reviews.`
      : `Score calibrated for building reputation (${totalTransactions}/20 transactions completed).`;

  return {
    score: finalScore,
    badge: getTrustBadge(finalScore),
    weightedAvg: Math.round(weightedAvg * 10) / 10,
    volumeFactor: Math.round(volumeFactor * 100) / 100,
    totalTransactions,
    reviewsCount: userReviews.length,
    credibleReviewsCount: credibleCount,
    explanation,
  };
}
