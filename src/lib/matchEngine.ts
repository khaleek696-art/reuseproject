import { Resource, User, SeekerNeed, ScoredMatch, MatchScoreFactors } from "./types";
import { haversine, getTimeOverlap } from "./utils";

/**
 * Calculates individual scoring factors and the weighted final match score
 * for a specific resource given a seeker's need.
 */
export function calculateMatchScore(
  need: SeekerNeed,
  resource: Resource,
  owner: User
): MatchScoreFactors {
  // --- FACTOR 1: Distance (Weight: 30%) ---
  const distanceKm = haversine(
    need.userLocation.lat,
    need.userLocation.lng,
    resource.location.lat,
    resource.location.lng
  );

  let distanceScore = 20;
  if (distanceKm <= 1.0) {
    distanceScore = 100;
  } else if (distanceKm <= 2.0) {
    distanceScore = 90;
  } else if (distanceKm <= 3.0) {
    distanceScore = 75;
  } else if (distanceKm <= 5.0) {
    distanceScore = 50;
  } else if (distanceKm <= 10.0) {
    distanceScore = 30;
  } else {
    distanceScore = 15;
  }

  // --- FACTOR 2: Time Overlap (Weight: 25%) ---
  let timeScore = 100;
  let timeOverlapPercentage = 100;
  if (need.timeFrom && need.timeTo && resource.availableFrom && resource.availableTo) {
    timeOverlapPercentage = getTimeOverlap(
      need.timeFrom,
      need.timeTo,
      resource.availableFrom,
      resource.availableTo
    );
    timeScore = timeOverlapPercentage;
  }

  // --- FACTOR 3: Budget Fit (Weight: 15%) ---
  const price = resource.pricePerDay;
  const budget = need.budget;
  let budgetScore = 20;

  if (price === 0) {
    budgetScore = 100; // Free item is always optimal
  } else if (budget <= 0) {
    budgetScore = price === 0 ? 100 : 50;
  } else if (price <= budget) {
    budgetScore = 100;
  } else if (price <= budget * 1.2) {
    budgetScore = 70;
  } else if (price <= budget * 1.5) {
    budgetScore = 40;
  } else {
    budgetScore = 20;
  }

  // --- FACTOR 4: PeerTrust Score (Weight: 20%) ---
  const trustScore = Math.min(100, Math.round((owner.trustScore / 5.0) * 100));

  // --- FACTOR 5: Category & Keyword Relevance (Weight: 10%) ---
  const queryLower = (need.query || "").toLowerCase().trim();
  const titleLower = resource.title.toLowerCase();
  const descLower = resource.description.toLowerCase();
  const catMatches = need.category === "all" || resource.category === need.category;
  const queryInTitle = queryLower ? titleLower.includes(queryLower) : false;
  const queryInDesc = queryLower ? descLower.includes(queryLower) : false;

  let categoryScore = 40;
  if (catMatches && queryInTitle) {
    categoryScore = 100;
  } else if (catMatches && queryInDesc) {
    categoryScore = 85;
  } else if (catMatches || queryInTitle) {
    categoryScore = 70;
  } else if (queryInDesc) {
    categoryScore = 50;
  }

  // --- STEP 3: Weighted Combination ---
  const rawFinalScore =
    0.30 * distanceScore +
    0.25 * timeScore +
    0.15 * budgetScore +
    0.20 * trustScore +
    0.10 * categoryScore;

  const finalScore = Math.round(rawFinalScore * 10) / 10;

  return {
    distanceKm,
    distanceScore,
    timeOverlapPercentage,
    timeScore,
    budgetScore,
    trustScore,
    categoryScore,
    finalScore,
  };
}

/**
 * MODULE B: AI Smart Matching Pipeline
 * Pre-filters resources, executes 5-factor scoring, and returns ranked matches
 */
export function getTopMatches(
  need: SeekerNeed,
  allResources: Resource[],
  allUsers: User[]
): ScoredMatch[] {
  const usersMap = new Map<string, User>(allUsers.map((u) => [u.id, u]));
  const maxRadius = need.maxDistanceKm ?? 15;
  const queryTerms = (need.query || "").toLowerCase().split(/\s+/).filter(Boolean);

  // STEP 1: PRE-FILTER
  const candidateResources = allResources.filter((resource) => {
    // 1. Must be active
    if (resource.status !== "active") return false;

    // 2. Distance check (within max radius)
    const dist = haversine(
      need.userLocation.lat,
      need.userLocation.lng,
      resource.location.lat,
      resource.location.lng
    );
    if (dist > maxRadius) return false;

    // 3. Category / Keyword relevance pre-filter
    if (need.category !== "all" && resource.category !== need.category) {
      // If user typed specific search terms, allow cross-category match if text strongly matches
      if (queryTerms.length > 0) {
        const titleLower = resource.title.toLowerCase();
        const matchesQuery = queryTerms.some((t) => titleLower.includes(t));
        if (!matchesQuery) return false;
      } else {
        return false;
      }
    }

    // 4. If query exists, at least some keyword relevance or same category
    if (queryTerms.length > 0) {
      const titleLower = resource.title.toLowerCase();
      const descLower = resource.description.toLowerCase();
      const catLower = resource.category.toLowerCase();
      const hasMatch = queryTerms.some(
        (term) =>
          titleLower.includes(term) ||
          descLower.includes(term) ||
          catLower.includes(term)
      );
      if (!hasMatch && need.category === "all") return false;
    }

    return true;
  });

  // STEP 2 & 3: SCORE EACH CANDIDATE
  const scoredMatches: ScoredMatch[] = candidateResources.map((resource) => {
    const defaultUser: User = {
      id: resource.ownerId,
      name: "Campus Sharer",
      college: "Pune University",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      trustScore: 4.2,
      totalShares: 12,
      totalBorrows: 4,
      isVerified: true,
      phoneVerified: true,
      collegeVerified: true,
      disputesCount: 0,
      location: resource.location,
    };

    const owner = usersMap.get(resource.ownerId) || defaultUser;
    const factors = calculateMatchScore(need, resource, owner);

    return {
      resource,
      owner,
      factors,
    };
  });

  // STEP 4: RANK & RETURN
  return scoredMatches.sort((a, b) => b.factors.finalScore - a.factors.finalScore);
}
