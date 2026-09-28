export type CategoryId =
  | "tech"
  | "laptop"
  | "projector"
  | "tools"
  | "books"
  | "transport"
  | "food"
  | "spaces";

export type Condition = "brand_new" | "like_new" | "good" | "fair";

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
  campus?: string;
}

export interface User {
  id: string;
  name: string;
  college: string;
  avatar: string;
  trustScore: number; // 0.0 - 5.0
  totalShares: number;
  totalBorrows: number;
  isVerified: boolean;
  phoneVerified: boolean;
  collegeVerified: boolean;
  disputesCount: number;
  location: GeoLocation;
  bio?: string;
  joinedDate?: string;
}

export interface Review {
  id: string;
  revieweeId: string;
  reviewerId: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  itemTitle?: string;
}

export interface Resource {
  id: string;
  ownerId: string;
  title: string;
  category: CategoryId;
  condition: Condition;
  description: string;
  photos: string[];
  pricePerDay: number; // 0 for FREE
  deposit: number;
  availableFrom: string; // ISO or time string
  availableTo: string;
  availableDays?: string[];
  instructions: string;
  location: GeoLocation;
  status: "active" | "borrowed" | "maintenance";
  createdAt: string;
  features?: string[];
}

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  iconName: string;
  count: number;
  color: string;
  bgColor: string;
  description: string;
}

export interface CommunityImpact {
  totalMoneySaved: number;
  totalResourcesReused: number;
  totalCO2Avoided: number;
}

export interface SeekerNeed {
  query: string;
  category: CategoryId | "all";
  date: string;
  timeFrom: string;
  timeTo: string;
  budget: number;
  userLocation: GeoLocation;
  maxDistanceKm?: number;
}

export interface MatchScoreFactors {
  distanceKm: number;
  distanceScore: number; // 0-100
  timeOverlapPercentage: number;
  timeScore: number; // 0-100
  budgetScore: number; // 0-100
  trustScore: number; // 0-100
  categoryScore: number; // 0-100
  finalScore: number; // 0-100
}

export interface ScoredMatch {
  resource: Resource;
  owner: User;
  factors: MatchScoreFactors;
}
