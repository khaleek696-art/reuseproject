"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MOCK_RESOURCES } from "@/data/mockData";
import { Resource, CategoryId, Condition } from "@/lib/types";
import {
  checkBackendHealth,
  fetchResourcesApi,
  advanceStageApi,
} from "@/lib/api";

export type UserRole = "borrower" | "owner" | "delivery" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  trustTier: "established" | "not_established";
  trustScore?: number; // only if established
  totalTransactions: number;
  ontimeReturnRate: number;
  cancellationRate: number;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
  verifiedGovId: boolean;
  neighborhood: string;
  role: UserRole;
}

export interface LiveBooking {
  id: string;
  resourceTitle: string;
  resourceImage: string;
  ownerName: string;
  borrowerName: string;
  pricePerDay: number;
  deposit: number;
  totalEscrow: number;
  stageIndex: number; // 0 to 4
  statusText: string;
}

export interface LiveDispute {
  id: string;
  title: string;
  ownerName: string;
  borrowerName: string;
  escrowHold: number;
  reportReason: string;
  status: "pending" | "resolved";
}

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  isLoggedIn: boolean;
  login: (userData?: Partial<UserProfile>, role?: UserRole) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
  authModalMode: "login" | "signup";
  resources: Resource[];
  addResource: (newRes: Resource) => void;
  bookings: LiveBooking[];
  createBooking: (res: Resource, days?: number) => void;
  advanceBookingStage: (bookingId: string) => void;
  disputes: LiveDispute[];
  resolveDispute: (disputeId: string) => void;
  activeDisputesCount: number;
  algorithmWeights: {
    location: number;
    time: number;
    budget: number;
    compatibility: number;
    trust: number;
  };
  setAlgorithmWeights: React.Dispatch<
    React.SetStateAction<{
      location: number;
      time: number;
      budget: number;
      compatibility: number;
      trust: number;
    }>
  >;
  isDeliveryOnDuty: boolean;
  setIsDeliveryOnDuty: (val: boolean) => void;
  isBackendConnected: boolean;
}

const defaultUser: UserProfile = {
  id: "u_khaleeq",
  name: "Khaleeq Ahmad",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  trustTier: "established",
  trustScore: 4.9,
  totalTransactions: 14,
  ontimeReturnRate: 100,
  cancellationRate: 0,
  verifiedEmail: true,
  verifiedPhone: true,
  verifiedGovId: true,
  neighborhood: "Civic Center / Kothrud Campus",
  role: "borrower",
};

const initialBookings: LiveBooking[] = [
  {
    id: "BK-98421",
    resourceTitle: "Canon EOS 5D Mark IV Kit with 24-70mm Lens",
    resourceImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80",
    ownerName: "Priya Patel",
    borrowerName: "Khaleeq Ahmad",
    pricePerDay: 850,
    deposit: 1500,
    totalEscrow: 3200,
    stageIndex: 2, // STAGE 03 (ACTIVE IN TRANSIT)
    statusText: "In Courier Transit",
  },
];

const initialDisputes: LiveDispute[] = [
  {
    id: "DSP-401",
    title: "Canon EOS 5D Mark IV Kit",
    ownerName: "Priya Patel",
    borrowerName: "Rahul Verma",
    escrowHold: 1600,
    reportReason: "Borrower returned equipment 3 hours late and battery strap was missing during courier physical OTP handoff.",
    status: "pending",
  },
];

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("borrower");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");
  const [isDeliveryOnDuty, setIsDeliveryOnDuty] = useState<boolean>(true);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Live Application State Store with localStorage Persistence
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);

  const [bookings, setBookings] = useState<LiveBooking[]>(initialBookings);
  const [disputes, setDisputes] = useState<LiveDispute[]>(initialDisputes);

  const [algorithmWeights, setAlgorithmWeights] = useState({
    location: 25,
    time: 25,
    budget: 20,
    compatibility: 20,
    trust: 10,
  });

  // Load custom resources from localStorage on client mount (with automatic deduplication)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("reuse_custom_resources");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Deduplicate stored custom items by ID
            const seen = new Set<string>();
            const cleanParsed: Resource[] = [];
            for (const item of parsed) {
              if (item && item.id && !seen.has(item.id)) {
                seen.add(item.id);
                cleanParsed.push(item);
              }
            }

            // Overwrite localStorage with clean deduplicated items
            localStorage.setItem("reuse_custom_resources", JSON.stringify(cleanParsed));

            setResources((prev) => {
              const customIds = new Set(cleanParsed.map((r: Resource) => r.id));
              const filteredPrev = prev.filter((r) => !customIds.has(r.id));
              return [...cleanParsed, ...filteredPrev];
            });
          }
        }
      } catch (e) {
        console.error("Failed to load saved custom resources:", e);
      }
    }
  }, []);

  // Sync with FastAPI backend on mount
  useEffect(() => {
    async function syncWithBackend() {
      const isHealthy = await checkBackendHealth();
      setIsBackendConnected(isHealthy);
      if (isHealthy) {
        const apiRes = await fetchResourcesApi();
        if (apiRes && Array.isArray(apiRes)) {
          const formattedRes: Resource[] = apiRes.map((r: any) => ({
            id: r.id,
            ownerId: r.ownerId,
            title: r.title,
            category: (r.category || "tech") as CategoryId,
            condition: (r.condition || "like_new") as Condition,
            description: r.description || "Clean working condition.",
            pricePerDay: r.dailyRate,
            deposit: r.deposit,
            availableFrom: "09:00 AM",
            availableTo: "09:00 PM",
            instructions: "Handle with care and return on time.",
            location: {
              lat: r.lat || 18.5204,
              lng: r.lng || 73.8567,
              campus: r.neighborhood || "Campus District",
              address: r.neighborhood || "Campus District",
            },
            photos: r.photos || ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"],
            status: r.isAvailable ? "active" : "borrowed",
            createdAt: "2026-09-25",
          }));
          
          setResources((prev) => {
            const customOnly = prev.filter((r) => r.id.startsWith("r_"));
            const customIds = new Set(customOnly.map((r) => r.id));
            const filteredApi = formattedRes.filter((r) => !customIds.has(r.id));
            return [...customOnly, ...filteredApi];
          });
        }
      }
    }
    syncWithBackend();
  }, []);

  const addResource = async (newRes: Resource) => {
    setResources((prev) => {
      if (prev.some((r) => r.id === newRes.id)) {
        return prev;
      }
      const updated = [newRes, ...prev];
      if (typeof window !== "undefined") {
        try {
          const customOnly = updated.filter((r) => r.id.startsWith("r_"));
          localStorage.setItem("reuse_custom_resources", JSON.stringify(customOnly));
        } catch (e) {
          console.error("Failed to persist custom resource:", e);
        }
      }
      return updated;
    });

    // Async push to FastAPI backend
    if (isBackendConnected) {
      try {
        await fetch("http://localhost:8000/api/v1/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newRes.title,
            category: newRes.category,
            condition: newRes.condition,
            dailyRate: newRes.pricePerDay,
            deposit: newRes.deposit,
            neighborhood: newRes.location.campus || newRes.location.address || "Campus",
            lat: newRes.location.lat,
            lng: newRes.location.lng,
          }),
        });
      } catch (e) {
        console.error("Backend sync failed:", e);
      }
    }
  };

  const createBooking = async (res: Resource, days = 2) => {
    const subtotal = res.pricePerDay * days;
    const totalEscrow = subtotal + res.deposit;

    const newBooking: LiveBooking = {
      id: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      resourceTitle: res.title,
      resourceImage: res.photos[0] || "",
      ownerName: "Verified Owner",
      borrowerName: user.name,
      pricePerDay: res.pricePerDay,
      deposit: res.deposit,
      totalEscrow: totalEscrow,
      stageIndex: 0,
      statusText: "Booking Requested",
    };

    setBookings((prev) => [newBooking, ...prev]);

    if (isBackendConnected) {
      try {
        await fetch("http://localhost:8000/api/v1/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resourceId: res.id,
            days: days,
            subtotal: subtotal,
            deposit: res.deposit,
          }),
        });
      } catch (e) {
        console.error("Backend booking sync failed:", e);
      }
    }
  };

  const advanceBookingStage = async (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const nextStage = Math.min(b.stageIndex + 1, 4);
          const stageTexts = [
            "Requested",
            "Accepted & Locked",
            "In Transit (Pickup Verified)",
            "Returned (Verification Pending)",
            "Completed & Deposit Released",
          ];
          return {
            ...b,
            stageIndex: nextStage,
            statusText: stageTexts[nextStage],
          };
        }
        return b;
      })
    );

    if (isBackendConnected) {
      await advanceStageApi(bookingId, "next");
    }
  };

  const resolveDispute = (disputeId: string) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === disputeId ? { ...d, status: "resolved" } : d))
    );
  };

  const login = (userData?: Partial<UserProfile>, newRole?: UserRole) => {
    setIsLoggedIn(true);
    if (userData || newRole) {
      setUser((prev) => ({
        ...prev,
        ...userData,
        role: newRole || prev.role,
      }));
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const openAuthModal = (mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const activeDisputesCount = disputes.filter((d) => d.status === "pending").length;

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        currentUser: user,
        isLoggedIn,
        login,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
        resources,
        addResource,
        bookings,
        createBooking,
        advanceBookingStage,
        disputes,
        resolveDispute,
        activeDisputesCount,
        algorithmWeights,
        setAlgorithmWeights,
        isDeliveryOnDuty,
        setIsDeliveryOnDuty,
        isBackendConnected,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
