"use client";
// RE:USE Dashboard Component

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Star,
  Trees,
  IndianRupee,
  RefreshCw,
  ArrowUpRight,
  PlusCircle,
  Sparkles,
  Package,
  Compass,
  User as UserIcon,
} from "lucide-react";
import {
  MOCK_USERS,
  MOCK_RESOURCES,
  MOCK_REVIEWS,
} from "@/data/mockData";
import { Review, Resource, User } from "@/lib/types";
import { computeTrustScore } from "@/lib/trustEngine";
import { formatPrice, formatDate } from "@/lib/utils";
import { AddResourceModal } from "@/components/AddResourceModal";
import { useRole } from "@/lib/roleContext";

function DashboardContent() {
  const searchParams = useSearchParams();
  const { role, setRole, resources, addResource, currentUser: contextUser, isLoggedIn, openAuthModal } = useRole();
  const initialTab =
    (searchParams.get("tab") as "impact" | "listings" | "borrowings" | "reviews") ||
    "impact";

  const [activeTab, setActiveTab] = useState<
    "impact" | "listings" | "borrowings" | "reviews"
  >(initialTab);

  // Derive user listings dynamically from roleContext resources
  const myListings = useMemo(() => {
    const isDemo = contextUser.id === "u_khaleeq" || contextUser.name?.includes("Khaleeq");
    if (isDemo) {
      return resources.filter(
        (r) =>
          r.ownerId === "u_khaleeq" ||
          r.ownerId === "u1" ||
          (Boolean(contextUser.name) && r.ownerId === contextUser.name)
      );
    }
    return resources.filter(
      (r) =>
        (Boolean(contextUser.id) && r.ownerId === contextUser.id) ||
        (Boolean(contextUser.name) && r.ownerId === contextUser.name)
    );
  }, [resources, contextUser]);

  // Derive borrowings: empty for new users until they borrow an item
  const borrowings = useMemo(() => {
    const isDemo = contextUser.id === "u_khaleeq" || contextUser.name?.includes("Khaleeq");
    if (!isDemo) {
      return [];
    }
    return [
      {
        id: "b1",
        item: "Canon DSLR 200D with Kit Lens",
        owner: "Rahul Sharma",
        dates: "Oct 5 - Oct 7, 2025",
        dailyRate: 250,
        totalPaid: 775,
        otp: "648-912",
        status: "Active Borrow",
        pickupSpot: "MIT Campus Central Library Lawn",
      },
      {
        id: "b2",
        item: "Bosch Professional Impact Drill Kit",
        owner: "Devendra Patil",
        dates: "Sep 20 - Sep 22, 2025",
        dailyRate: 0,
        totalPaid: 0,
        otp: "891-304",
        status: "Returned & Verified",
        pickupSpot: "VIT Pune Campus Gate",
      },
    ];
  }, [contextUser]);

  // Construct dynamic User object from active logged-in session
  const currentUser: User = useMemo(() => {
    const isDemo = contextUser.id === "u_khaleeq" || contextUser.name?.includes("Khaleeq");
    return {
      id: contextUser.id || "u_owner",
      name: contextUser.name || "Resource Owner",
      college: contextUser.neighborhood || "Campus Hub",
      avatar: contextUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      trustScore: contextUser.trustScore || (isDemo ? 4.9 : 5.0),
      totalShares: isDemo ? 28 : myListings.length,
      totalBorrows: isDemo ? 15 : borrowings.length,
      isVerified: true,
      phoneVerified: contextUser.verifiedPhone ?? true,
      collegeVerified: true,
      disputesCount: 0,
      location: { lat: 18.5204, lng: 73.8567, campus: contextUser.neighborhood || "Campus Hub" },
      joinedDate: isDemo ? "Feb 2024" : "Sep 2026",
    };
  }, [contextUser, myListings.length, borrowings.length]);

  const [reviewsList, setReviewsList] = useState<Review[]>(MOCK_REVIEWS);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Compute live PeerTrust Breakdown (Module C)
  const trustBreakdown = useMemo(() => {
    return computeTrustScore(currentUser, reviewsList, MOCK_USERS);
  }, [currentUser, reviewsList]);

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1c1b1b] text-[#8bd6b6] border-2 border-[#2a2a2a] shadow-[0_4px_0_0_#0f0f0f] mb-6">
          <UserIcon className="h-8 w-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white font-['Silkscreen'] tracking-wide mb-2 uppercase">
          Authentication Required
        </h2>
        <p className="text-xs sm:text-sm text-[#bec9c2] mb-6">
          Aapne sign out / log out kar liya hai. Apne dashboard, listings aur borrowings access karne ke liye log in karein.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => openAuthModal("login")}
            className="w-full sm:w-auto rounded-xl bg-[#065f46] hover:bg-[#047857] px-6 py-3 text-xs font-bold text-white uppercase tracking-wider border-2 border-[#047857] shadow-[0_4px_0_0_#003828] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            Log In to Your Account
          </button>
          <Link
            href="/resources"
            className="w-full sm:w-auto rounded-xl border-2 border-[#353534] bg-[#201f1f] hover:bg-[#2a2a2a] px-6 py-3 text-xs font-bold text-[#e5e2e1] uppercase tracking-wider shadow-[0_4px_0_0_#0e0e0e] active:translate-y-1 active:shadow-none transition-all"
          >
            Browse Public Catalog
          </Link>
        </div>
      </div>
    );
  }

  if (role !== "owner") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#065f46]/30 text-[#8bd6b6] border-2 border-[#065f46] shadow-[0_4px_0_0_#003828] mb-6">
          <PlusCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white font-['Silkscreen'] tracking-wide mb-2 uppercase">
          Resource Owner Dashboard
        </h2>
        <p className="text-xs sm:text-sm text-[#bec9c2] mb-6">
          This dashboard allows Resource Owners to manage gear listings, track active borrowings, monitor earnings, and view eco-impact stats.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setRole("owner")}
            className="w-full sm:w-auto rounded-xl bg-[#065f46] hover:bg-[#047857] px-6 py-3 text-xs font-bold text-white uppercase tracking-wider border-2 border-[#047857] shadow-[0_4px_0_0_#003828] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            Switch to Resource Owner Mode
          </button>
          <Link
            href="/resources"
            className="w-full sm:w-auto rounded-xl border-2 border-[#353534] bg-[#201f1f] hover:bg-[#2a2a2a] px-6 py-3 text-xs font-bold text-[#e5e2e1] uppercase tracking-wider shadow-[0_4px_0_0_#0e0e0e] active:translate-y-1 active:shadow-none transition-all"
          >
            Browse Equipment Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Handle adding a listing
  const handleAddResource = (newRes: Resource) => {
    addResource(newRes);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 sm:p-8 shadow-[0_6px_0_0_#0f0f0f] mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-20 w-20 rounded-2xl object-cover ring-4 ring-[#065f46]/40 border-2 border-[#2a2a2a]"
              />
              <span
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#065f46] text-[#8bd6b6] border border-[#047857] shadow-sm"
                title="Verified Campus Peer"
              >
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white font-['Silkscreen'] tracking-wide">
                  {currentUser.name}
                </h1>
                <span
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-mono font-bold bg-[#065f46]/40 text-[#8bd6b6] border border-[#065f46]"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {trustBreakdown.badge.label}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#bec9c2] font-medium mt-0.5">
                {currentUser.college} • Member since Feb 2024
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#89938d]">
                <span className="flex items-center gap-1 text-[#fbbf24] bg-[#2a2004] px-2 py-0.5 rounded-lg border border-[#4a3505]">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  <span>{trustBreakdown.score} PeerTrust</span>
                </span>
                <span className="text-[#e5e2e1]">{currentUser.totalShares} Shared</span>
                <span>•</span>
                <span className="text-[#e5e2e1]">{currentUser.totalBorrows} Borrowed</span>
                <span>•</span>
                <span className="text-[#8bd6b6] font-bold">0 Disputes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#065f46] hover:bg-[#047857] px-4 py-2.5 text-xs sm:text-sm font-bold text-white uppercase tracking-wider border-2 border-[#047857] shadow-[0_4px_0_0_#003828] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Share New Item</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 border-t border-[#2a2a2a] pt-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "impact", label: "🌟 Eco Impact & Savings" },
            { id: "listings", label: `📦 My Shared Listings (${myListings.length})` },
            { id: "borrowings", label: `🔄 My Borrowings (${borrowings.length})` },
            { id: "reviews", label: "⭐ PeerTrust Breakdown" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer uppercase tracking-wider font-['Silkscreen'] ${
                activeTab === tab.id
                  ? "bg-[#065f46] text-white border border-[#047857] shadow-[0_2px_0_0_#003828]"
                  : "bg-[#201f1f] text-[#89938d] hover:text-[#e5e2e1] border border-[#2a2a2a]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: ECO IMPACT & SAVINGS */}
      {activeTab === "impact" && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-[0_4px_0_0_#0f0f0f]">
              <div className="flex items-center justify-between text-[#8bd6b6] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  Personal Savings
                </span>
                <span className="rounded-xl bg-[#0e0e0e] p-2 text-[#8bd6b6] shadow-xs border border-[#2a2a2a]">
                  <IndianRupee className="h-5 w-5" />
                </span>
              </div>
              <div className="text-3xl font-bold text-white font-pixel tracking-wide">₹8,500</div>
              <p className="mt-1 text-xs text-[#bec9c2] font-medium">
                Saved compared to retail purchase or renting commercial equipment.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-[0_4px_0_0_#0f0f0f]">
              <div className="flex items-center justify-between text-[#7bd8b1] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  Resources Reused
                </span>
                <span className="rounded-xl bg-[#0e0e0e] p-2 text-[#7bd8b1] shadow-xs border border-[#2a2a2a]">
                  <RefreshCw className="h-5 w-5" />
                </span>
              </div>
              <div className="text-3xl font-bold text-white font-pixel tracking-wide">
                12 Items
              </div>
              <p className="mt-1 text-xs text-[#bec9c2] font-medium">
                Kept out of storage and put to productive use in community projects.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-[0_4px_0_0_#0f0f0f]">
              <div className="flex items-center justify-between text-[#8bd6b6] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  CO₂ Footprint Avoided
                </span>
                <span className="rounded-xl bg-[#0e0e0e] p-2 text-[#8bd6b6] shadow-xs border border-[#2a2a2a]">
                  <Trees className="h-5 w-5" />
                </span>
              </div>
              <div className="text-3xl font-bold text-white font-pixel tracking-wide">
                ~22 kg CO₂
              </div>
              <p className="mt-1 text-xs text-[#bec9c2] font-medium">
                Equivalent to planting 1 full-grown sapling this semester.
              </p>
            </div>
          </div>

          {/* Impact Badges Earned */}
          <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-[0_4px_0_0_#0f0f0f]">
            <h3 className="text-base font-bold text-white font-['Silkscreen'] tracking-wide uppercase mb-4">
              Sustainability Achievements &amp; Badges
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3.5 rounded-xl bg-[#141414] p-4 border border-[#2a2a2a] shadow-[inset_1px_1px_0_#202020]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2a2004] text-[#fbbf24] border border-[#4a3505] font-black text-xl shadow-xs">
                  🏆
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white font-['Silkscreen'] tracking-wide">
                    Resource Hero
                  </h4>
                  <p className="text-xs text-[#bec9c2]">
                    Completed 20+ peer exchanges with 100% positive feedback.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-xl bg-[#141414] p-4 border border-[#2a2a2a] shadow-[inset_1px_1px_0_#202020]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#065f46] text-[#8bd6b6] border border-[#047857] font-black text-xl shadow-xs">
                  🛡️
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white font-['Silkscreen'] tracking-wide">
                    Trusted Sharer
                  </h4>
                  <p className="text-xs text-[#bec9c2]">
                    Zero disputes recorded across 43 campus transactions.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-xl bg-[#141414] p-4 border border-[#2a2a2a] shadow-[inset_1px_1px_0_#202020]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#065f46] text-[#7bd8b1] border border-[#047857] font-black text-xl shadow-xs">
                  🌍
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white font-['Silkscreen'] tracking-wide">
                    Eco Warrior
                  </h4>
                  <p className="text-xs text-[#bec9c2]">
                    Avoided &gt; 20 kg of manufacturing carbon footprint.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY SHARED LISTINGS */}
      {activeTab === "listings" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white font-['Silkscreen'] tracking-wider uppercase">
              Active Resource Listings ({myListings.length})
            </h3>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8bd6b6] hover:text-white uppercase tracking-wider font-mono cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 text-[#8bd6b6]" />
              <span>Add Another Item</span>
            </button>
          </div>

          {myListings.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#2a2a2a] bg-[#1c1b1b] p-12 text-center shadow-[0_4px_0_0_#0f0f0f]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0e0e0e] text-[#8bd6b6] border border-[#2a2a2a] mb-4">
                <PlusCircle className="h-7 w-7" />
              </div>
              <h4 className="text-base font-bold text-white font-['Silkscreen'] tracking-wide mb-1">
                No Equipment Listed Yet
              </h4>
              <p className="text-xs text-[#bec9c2] mb-5 max-w-md mx-auto">
                Aapne abhi tak koi equipment list nahi kiya hai. Apne idle gear ko list karke earning start karein!
              </p>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#065f46] hover:bg-[#047857] px-5 py-2.5 text-xs font-bold text-white uppercase tracking-wider border-2 border-[#047857] shadow-[0_4px_0_0_#003828] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                <PlusCircle className="h-4 w-4 text-[#8bd6b6]" />
                <span>+ List Your First Equipment</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myListings.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center gap-4 rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-4 shadow-[0_4px_0_0_#0f0f0f] hover:border-[#353534] transition-all"
                >
                  <div className="h-20 w-24 rounded-xl bg-[#0e0e0e] border border-[#2a2a2a] flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-[inset_1px_1px_0_#202020]">
                    <img
                      src={res.photos[0] || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80";
                      }}
                      alt={res.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-[#065f46]/40 px-2 py-0.5 text-[10px] font-mono font-bold text-[#8bd6b6] border border-[#065f46]">
                        Active
                      </span>
                      <span className="text-xs font-bold text-[#8bd6b6] font-mono">
                        {formatPrice(res.pricePerDay)}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white truncate mt-1">
                      {res.title}
                    </h4>
                    <p className="text-xs text-[#89938d]">
                      Deposit: ₹{res.deposit} • Handover: {res.availableFrom}-
                      {res.availableTo}
                    </p>
                  </div>
                  <Link
                    href={`/resource/${res.id}`}
                    className="rounded-xl bg-[#201f1f] border border-[#353534] p-2 text-[#e5e2e1] hover:bg-[#2a2a2a]"
                    title="View Public Page"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY BORROWINGS */}
      {activeTab === "borrowings" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm sm:text-base font-bold text-white font-['Silkscreen'] tracking-wider uppercase">
            Handover Status &amp; Current Loans ({borrowings.length})
          </h3>

          {borrowings.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#2a2a2a] bg-[#1c1b1b] p-12 text-center shadow-[0_4px_0_0_#0f0f0f]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0e0e0e] text-[#8bd6b6] border border-[#2a2a2a] mb-4">
                <Package className="h-7 w-7" />
              </div>
              <h4 className="text-base font-bold text-white font-['Silkscreen'] tracking-wide mb-1">
                No Active Borrowings
              </h4>
              <p className="text-xs text-[#bec9c2] mb-5 max-w-md mx-auto">
                Aapne abhi tak koi equipment borrow nahi kiya hai. Catalog me camera, laptops &amp; tools borrow karne ke liye browse karein!
              </p>
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[#353534] bg-[#201f1f] hover:bg-[#2a2a2a] px-5 py-2.5 text-xs font-bold text-[#e5e2e1] uppercase tracking-wider shadow-[0_4px_0_0_#0e0e0e] active:translate-y-1 active:shadow-none transition-all"
              >
                <Compass className="h-4 w-4 text-[#8bd6b6]" />
                <span>Explore Equipment Catalog</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {borrowings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-5 shadow-[0_4px_0_0_#0f0f0f] gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-bold border ${
                          b.status.includes("Active")
                            ? "bg-[#2a2004] text-[#fbbf24] border-[#4a3505]"
                            : "bg-[#065f46]/40 text-[#8bd6b6] border-[#065f46]"
                        }`}
                      >
                        {b.status}
                      </span>
                      <span className="text-xs text-[#bec9c2] font-medium">
                        Owner: {b.owner}
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-white mt-1">
                      {b.item}
                    </h4>
                    <p className="text-xs text-[#89938d] mt-0.5 font-mono">
                      {b.dates} • Total: ₹{b.totalPaid}
                    </p>
                    <p className="text-[11px] text-[#89938d] mt-1">
                      📍 {b.pickupSpot}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#0e0e0e] border border-[#2a2a2a] p-3 text-center shadow-[inset_1px_1px_0_#202020]">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#89938d]">
                        Handover OTP
                      </span>
                      <div className="font-mono text-lg font-black text-[#8bd6b6]">
                        {b.otp}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PEERTRUST & REVIEWS BREAKDOWN (MODULE C) */}
      {activeTab === "reviews" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Module C Mathematical Explainer Box */}
          <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-[0_4px_0_0_#0f0f0f]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-[#8bd6b6]" />
              <h3 className="font-bold text-base text-white font-['Silkscreen'] tracking-wide uppercase">
                MODULE C: PeerTrust Credibility Algorithm in Action
              </h3>
            </div>
            <p className="text-xs text-[#bec9c2] leading-relaxed mb-4">
              {trustBreakdown.explanation} Reviews from high-credibility peers
              count for more; suspicious accounts or low-trust raters are dampened.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="rounded-xl bg-[#141414] p-3 border border-[#2a2a2a] shadow-[inset_1px_1px_0_#202020]">
                <div className="text-[11px] text-[#89938d] font-semibold font-mono">
                  1. Raw Weighted Avg
                </div>
                <div className="font-black text-white text-lg font-mono">
                  {trustBreakdown.weightedAvg} / 5.0
                </div>
              </div>
              <div className="rounded-xl bg-[#141414] p-3 border border-[#2a2a2a] shadow-[inset_1px_1px_0_#202020]">
                <div className="text-[11px] text-[#89938d] font-semibold font-mono">
                  2. Volume Factor
                </div>
                <div className="font-black text-white text-lg font-mono">
                  {trustBreakdown.volumeFactor} (100%)
                </div>
              </div>
              <div className="rounded-xl bg-[#141414] p-3 border border-[#2a2a2a] shadow-[inset_1px_1px_0_#202020]">
                <div className="text-[11px] text-[#89938d] font-semibold font-mono">
                  3. Total Txns
                </div>
                <div className="font-black text-white text-lg font-mono">
                  {trustBreakdown.totalTransactions} Exchanges
                </div>
              </div>
              <div className="rounded-xl bg-[#141414] p-3 border border-[#2a2a2a] shadow-[inset_1px_1px_0_#202020]">
                <div className="text-[11px] text-[#89938d] font-semibold font-mono">
                  4. Final Trust Score
                </div>
                <div className="font-black text-[#8bd6b6] text-lg font-mono">
                  ⭐ {trustBreakdown.score}
                </div>
              </div>
            </div>
          </div>

          {/* Incoming Reviews List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-['Silkscreen'] tracking-wide uppercase">
              Verified Peer Reviews Received ({reviewsList.filter(r => r.revieweeId === "u_khaleeq").length})
            </h4>

            {reviewsList
              .filter((r) => r.revieweeId === "u_khaleeq")
              .map((rev) => {
                const reviewer = MOCK_USERS.find((u) => u.id === rev.reviewerId);
                return (
                  <div
                    key={rev.id}
                    className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-4 shadow-[0_4px_0_0_#0f0f0f]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            reviewer?.avatar ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                          }
                          alt={reviewer?.name || "Peer"}
                          className="h-8 w-8 rounded-full object-cover border border-[#2a2a2a]"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">
                            {reviewer?.name || "Campus Peer"}
                          </div>
                          <div className="text-[10px] text-[#89938d]">
                            {reviewer?.college} • Rater Trust: {reviewer?.trustScore || "4.0"} ⭐
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 rounded-md bg-[#2a2004] px-2 py-0.5 text-xs font-bold text-[#fbbf24] border border-[#4a3505]">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#bec9c2] pl-10">
                      &quot;{rev.comment}&quot;
                    </p>
                    <div className="text-[10px] text-[#89938d] pl-10 mt-1 font-mono">
                      For item: <span className="font-semibold text-white">{rev.itemTitle}</span> • {formatDate(rev.date)}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Share Modal */}
      <AddResourceModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onAddResource={handleAddResource}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-500">
          Loading dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
// RE:USE — Modular Circular Economy Architecture
