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

export interface DigiLockerData {
  aadhaarMasked: string;
  panMasked: string;
  studentIdMasked: string;
  verifiedAt: string;
  certificateId: string;
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
  updateBookingStage: (bookingId: string, stageIndex: number) => void;
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
  isDigiLockerVerified: boolean;
  digiLockerData: DigiLockerData | null;
  verifyDigiLocker: (data?: Partial<DigiLockerData>) => void;
  resetDigiLocker: () => void;
  isDigiLockerModalOpen: boolean;
  openDigiLockerModal: () => void;
  closeDigiLockerModal: () => void;
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");
  const [isDeliveryOnDuty, setIsDeliveryOnDuty] = useState<boolean>(true);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // DigiLocker Government ID State (Persisted in localStorage)
  const [isDigiLockerVerified, setIsDigiLockerVerified] = useState<boolean>(false);
  const [digiLockerData, setDigiLockerData] = useState<DigiLockerData | null>(null);
  const [isDigiLockerModalOpen, setIsDigiLockerModalOpen] = useState<boolean>(false);

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

  // Load session from localStorage on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedAuth = localStorage.getItem("reuse_is_logged_in");
        if (savedAuth === "true") {
          setIsLoggedIn(true);
          const savedUser = localStorage.getItem("reuse_user_data");
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser((prev) => ({ ...prev, ...parsedUser }));
          }
        } else {
          setIsLoggedIn(false);
        }

        const savedDigi = localStorage.getItem("reuse_digilocker_verified");
        if (savedDigi === "true") {
          setIsDigiLockerVerified(true);
          const savedData = localStorage.getItem("reuse_digilocker_data");
          if (savedData) {
            setDigiLockerData(JSON.parse(savedData));
          }
        }
      } catch (e) {
        console.error("Failed to load saved session:", e);
      }
    }
  }, []);

  // Sync with FastAPI backend on mount (Fetch live listings directly from Cloud Database)
  useEffect(() => {
    async function syncWithBackend() {
      const isHealthy = await checkBackendHealth();
      setIsBackendConnected(isHealthy);
      
      const apiRes = await fetchResourcesApi();
      if (apiRes && Array.isArray(apiRes) && apiRes.length > 0) {
        const normalizeCategory = (cat: string): CategoryId => {
          const c = (cat || "").toLowerCase();
          if (c.includes("camera") || c.includes("photo") || c.includes("tech") || c.includes("electronic") || c.includes("gadget")) return "tech";
          if (c.includes("laptop") || c.includes("comput") || c.includes("macbook")) return "laptop";
          if (c.includes("project") || c.includes("monitor") || c.includes("screen")) return "projector";
          if (c.includes("tool") || c.includes("drill") || c.includes("hardware")) return "tools";
          if (c.includes("book") || c.includes("study") || c.includes("read")) return "books";
          if (c.includes("transport") || c.includes("bike") || c.includes("scoot") || c.includes("cycle")) return "transport";
          if (c.includes("food") || c.includes("kitchen")) return "food";
          if (c.includes("space") || c.includes("camp") || c.includes("event") || c.includes("outdoor")) return "spaces";
          return "tech";
        };

        const formattedRes: Resource[] = apiRes.map((r: any) => ({
          id: r.id,
          ownerId: r.ownerId || "u_owner_global",
          title: r.title,
          category: normalizeCategory(r.category),
          condition: (r.condition || "like_new") as Condition,
          description: r.description || "Clean working condition.",
          pricePerDay: r.dailyRate || r.pricePerDay || 500,
          deposit: r.deposit || 1500,
          availableFrom: "09:00 AM",
          availableTo: "09:00 PM",
          instructions: "Handle with care and return on time.",
          location: {
            lat: r.lat ? Number(r.lat) : 18.5204,
            lng: r.lng ? Number(r.lng) : 73.8567,
            campus: r.neighborhood || "Campus District",
            address: r.neighborhood || "Campus District",
          },
          photos: r.photos && r.photos.length > 0 ? r.photos : ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"],
          status: r.isAvailable ? "active" : "borrowed",
          createdAt: "2026-09-25",
        }));
        
        // Helper to load locally saved listings
        const getLocalListings = (): Resource[] => {
          try {
            const saved = localStorage.getItem("reuse_user_listings");
            return saved ? JSON.parse(saved) : [];
          } catch {
            return [];
          }
        };

        const localListings = getLocalListings();

        // Merge: Live database items take priority by ID, combined with local listings and campus catalog
        const apiIds = new Set(formattedRes.map((r) => r.id));
        const mergedCatalog = [
          ...formattedRes,
          ...localListings.filter((l) => !apiIds.has(l.id)),
          ...MOCK_RESOURCES.filter((m) => !apiIds.has(m.id)),
        ];
        setResources(mergedCatalog);
      } else {
        // Fallback: If backend is not yet reachable or cold starting, load local listings + catalog
        try {
          const saved = localStorage.getItem("reuse_user_listings");
          const localListings: Resource[] = saved ? JSON.parse(saved) : [];
          if (localListings.length > 0) {
            const localIds = new Set(localListings.map((l) => l.id));
            setResources([
              ...localListings,
              ...MOCK_RESOURCES.filter((m) => !localIds.has(m.id)),
            ]);
          }
        } catch {}
      }
    }
    syncWithBackend();
  }, []);

  const addResource = async (newRes: Resource) => {
    // 1. Optimistically show on UI immediately
    setResources((prev) => {
      if (prev.some((r) => r.id === newRes.id)) {
        return prev;
      }
      return [newRes, ...prev];
    });

    // 2. Persist in localStorage so page refreshes never lose newly uploaded items
    try {
      const saved = localStorage.getItem("reuse_user_listings");
      const list: Resource[] = saved ? JSON.parse(saved) : [];
      if (!list.some((r) => r.id === newRes.id)) {
        localStorage.setItem("reuse_user_listings", JSON.stringify([newRes, ...list]));
      }
    } catch (e) {
      console.warn("Could not cache listing to localStorage:", e);
    }

    // 3. Save directly to Central Cloud FastAPI Backend & PostgreSQL Database
    const API_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://reuse-backend-cbc3.onrender.com/api/v1";

    try {
      const res = await fetch(`${API_URL}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newRes.title,
          category: newRes.category,
          condition: newRes.condition,
          description: newRes.description,
          dailyRate: newRes.pricePerDay,
          deposit: newRes.deposit,
          neighborhood: newRes.location.campus || newRes.location.address || "Campus",
          lat: newRes.location.lat,
          lng: newRes.location.lng,
          photos: newRes.photos,
          ownerName: user.name || "Verified Owner",
        }),
      });

      if (res.ok) {
        // Fetch fresh list from database so all clients are strictly in sync
        const apiRes = await fetchResourcesApi();
        if (apiRes && Array.isArray(apiRes) && apiRes.length > 0) {
          const formattedRes: Resource[] = apiRes.map((r: any) => ({
            id: r.id,
            ownerId: r.ownerId || "u_owner_global",
            title: r.title,
            category: (r.category || "tech") as CategoryId,
            condition: (r.condition || "like_new") as Condition,
            description: r.description || "Clean working condition.",
            pricePerDay: r.dailyRate || r.pricePerDay || 500,
            deposit: r.deposit || 1500,
            availableFrom: "09:00 AM",
            availableTo: "09:00 PM",
            instructions: "Handle with care and return on time.",
            location: {
              lat: r.lat || 18.5204,
              lng: r.lng || 73.8567,
              campus: r.neighborhood || "Campus District",
              address: r.neighborhood || "Campus District",
            },
            photos: r.photos && r.photos.length > 0 ? r.photos : ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"],
            status: r.isAvailable ? "active" : "borrowed",
            createdAt: "2026-09-25",
          }));

          const apiIds = new Set(formattedRes.map((r) => r.id));
          const savedLocal = (() => {
            try {
              const s = localStorage.getItem("reuse_user_listings");
              return s ? JSON.parse(s) : [];
            } catch {
              return [];
            }
          })();

          // Merge: Live database items + local items + mock resources (nothing gets lost!)
          const mergedCatalog = [
            ...formattedRes,
            ...savedLocal.filter((l: Resource) => !apiIds.has(l.id)),
            ...MOCK_RESOURCES.filter((m) => !apiIds.has(m.id)),
          ];
          setResources(mergedCatalog);
        }
      }
    } catch (e) {
      console.error("Global Cloud Backend Sync failed:", e);
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

  const updateBookingStage = (bookingId: string, stageIndex: number) => {
    const stageTexts = [
      "Requested",
      "Accepted & Locked",
      "In Transit (Pickup Verified)",
      "Returned (Verification Pending)",
      "Completed & Deposit Released",
    ];
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              stageIndex: Math.max(0, Math.min(4, stageIndex)),
              statusText: stageTexts[Math.max(0, Math.min(4, stageIndex))],
            }
          : b
      )
    );
  };

  const resolveDispute = (disputeId: string) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === disputeId ? { ...d, status: "resolved" } : d))
    );
  };

  const login = (userData?: Partial<UserProfile>, newRole?: UserRole) => {
    setIsLoggedIn(true);
    if (userData || newRole) {
      setUser((prev) => {
        const updated = {
          ...prev,
          ...userData,
          role: newRole || prev.role,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("reuse_is_logged_in", "true");
          localStorage.setItem("reuse_user_data", JSON.stringify(updated));
        }
        return updated;
      });
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem("reuse_is_logged_in", "true");
      }
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("reuse_is_logged_in");
      localStorage.removeItem("reuse_user_data");
    }
  };

  const openAuthModal = (mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const activeDisputesCount = disputes.filter((d) => d.status === "pending").length;

  const verifyDigiLocker = (customData?: Partial<DigiLockerData>) => {
    const verifiedRecord: DigiLockerData = {
      aadhaarMasked: customData?.aadhaarMasked || "4129",
      panMasked: customData?.panMasked || "4312X",
      studentIdMasked: customData?.studentIdMasked || "2023CSB1109",
      verifiedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      certificateId: `DL-UIDAI-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    };
    setIsDigiLockerVerified(true);
    setDigiLockerData(verifiedRecord);
    setUser((prev) => ({
      ...prev,
      verifiedGovId: true,
      trustScore: 5.0,
      trustTier: "established",
    }));
    if (typeof window !== "undefined") {
      localStorage.setItem("reuse_digilocker_verified", "true");
      localStorage.setItem("reuse_digilocker_data", JSON.stringify(verifiedRecord));
    }
  };

  const resetDigiLocker = () => {
    setIsDigiLockerVerified(false);
    setDigiLockerData(null);
    setUser((prev) => ({
      ...prev,
      verifiedGovId: false,
      trustScore: 4.8,
    }));
    if (typeof window !== "undefined") {
      localStorage.removeItem("reuse_digilocker_verified");
      localStorage.removeItem("reuse_digilocker_data");
    }
  };

  const openDigiLockerModal = () => setIsDigiLockerModalOpen(true);
  const closeDigiLockerModal = () => setIsDigiLockerModalOpen(false);

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
        updateBookingStage,
        disputes,
        resolveDispute,
        activeDisputesCount,
        algorithmWeights,
        setAlgorithmWeights,
        isDeliveryOnDuty,
        setIsDeliveryOnDuty,
        isBackendConnected,
        isDigiLockerVerified,
        digiLockerData,
        verifyDigiLocker,
        resetDigiLocker,
        isDigiLockerModalOpen,
        openDigiLockerModal,
        closeDigiLockerModal,
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
