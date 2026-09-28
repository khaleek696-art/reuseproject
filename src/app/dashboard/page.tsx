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
          r.id.startsWith("r_")
      );
    }
    return resources.filter(
      (r) =>
        r.ownerId === contextUser.id ||
        r.ownerId === contextUser.name ||
        r.id.startsWith(`r_${contextUser.id}`)
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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-700 border border-slate-200 mb-6">
          <UserIcon className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Authentication Required
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Aapne sign out / log out kar liya hai. Apne dashboard, listings aur borrowings access karne ke liye log in karein.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => openAuthModal("login")}
            className="w-full sm:w-auto rounded-xl bg-emerald-800 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-900 transition-all"
          >
            Log In to Your Account
          </button>
          <Link
            href="/resources"
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700 border border-emerald-200 mb-6">
          <PlusCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Resource Owner Dashboard
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          This dashboard allows Resource Owners to manage gear listings, track active borrowings, monitor earnings, and view eco-impact stats.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setRole("owner")}
            className="w-full sm:w-auto rounded-xl bg-emerald-800 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-900 transition-all"
          >
            Switch to Resource Owner Mode
          </button>
          <Link
            href="/resources"
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-20 w-20 rounded-3xl object-cover ring-4 ring-emerald-500/20"
              />
              <span
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm"
                title="Verified Campus Peer"
              >
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">
                  {currentUser.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${trustBreakdown.badge.bgClass} ${trustBreakdown.badge.colorClass} ${trustBreakdown.badge.borderClass}`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {trustBreakdown.badge.label}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {currentUser.college} • Member since Feb 2024
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/80">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  <span>{trustBreakdown.score} PeerTrust</span>
                </span>
                <span>{currentUser.totalShares} Shared</span>
                <span>•</span>
                <span>{currentUser.totalBorrows} Borrowed</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">0 Disputes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Share New Item</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 border-t border-slate-100 pt-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "impact", label: "🌟 Eco Impact & Savings" },
            { id: "listings", label: `📦 My Shared Listings (${myListings.length})` },
            { id: "borrowings", label: `🔄 My Borrowings (${borrowings.length})` },
            { id: "reviews", label: "⭐ PeerTrust Breakdown" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-xs">
              <div className="flex items-center justify-between text-emerald-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Personal Savings
                </span>
                <span className="rounded-xl bg-white p-2 text-emerald-600 shadow-xs">
                  <IndianRupee className="h-5 w-5" />
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900">₹8,500</div>
              <p className="mt-1 text-xs text-slate-500">
                Saved compared to retail purchase or renting commercial equipment.
              </p>
            </div>

            <div className="rounded-3xl border border-blue-200 bg-blue-50/50 p-6 shadow-xs">
              <div className="flex items-center justify-between text-blue-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Resources Reused
                </span>
                <span className="rounded-xl bg-white p-2 text-blue-600 shadow-xs">
                  <RefreshCw className="h-5 w-5" />
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900">
                12 Items
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Kept out of storage and put to productive use in community projects.
              </p>
            </div>

            <div className="rounded-3xl border border-teal-200 bg-teal-50/50 p-6 shadow-xs">
              <div className="flex items-center justify-between text-teal-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  CO₂ Footprint Avoided
                </span>
                <span className="rounded-xl bg-white p-2 text-teal-600 shadow-xs">
                  <Trees className="h-5 w-5" />
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900">
                ~22 kg CO₂
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Equivalent to planting 1 full-grown sapling this semester.
              </p>
            </div>
          </div>

          {/* Impact Badges Earned */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Sustainability Achievements & Badges
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3.5 rounded-2xl bg-amber-50/60 p-4 border border-amber-200/80">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white font-black text-xl shadow-xs">
                  🏆
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Resource Hero
                  </h4>
                  <p className="text-xs text-slate-500">
                    Completed 20+ peer exchanges with 100% positive feedback.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl bg-emerald-50/60 p-4 border border-emerald-200/80">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-xl shadow-xs">
                  🛡️
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Trusted Sharer
                  </h4>
                  <p className="text-xs text-slate-500">
                    Zero disputes recorded across 43 campus transactions.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl bg-teal-50/60 p-4 border border-teal-200/80">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white font-black text-xl shadow-xs">
                  🌍
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Eco Warrior
                  </h4>
                  <p className="text-xs text-slate-500">
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
            <h3 className="text-lg font-bold text-slate-900">
              Active Resource Listings ({myListings.length})
            </h3>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Another Item</span>
            </button>
          </div>

          {myListings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 mb-4">
                <PlusCircle className="h-7 w-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">
                No Equipment Listed Yet
              </h4>
              <p className="text-xs text-slate-500 mb-5 max-w-md mx-auto">
                Aapne abhi tak koi equipment list nahi kiya hai. Apne idle gear ko list karke earning start karein!
              </p>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-900 transition-all"
              >
                <PlusCircle className="h-4 w-4 text-emerald-300" />
                <span>+ List Your First Equipment</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myListings.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-all"
                >
                  <img
                    src={res.photos[0] || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80";
                    }}
                    alt={res.title}
                    className="h-20 w-24 rounded-2xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Active
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {formatPrice(res.pricePerDay)}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 truncate mt-1">
                      {res.title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Deposit: ₹{res.deposit} • Handover: {res.availableFrom}-
                      {res.availableTo}
                    </p>
                  </div>
                  <Link
                    href={`/resource/${res.id}`}
                    className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
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
          <h3 className="text-lg font-bold text-slate-900">
            Handover Status & Current Loans ({borrowings.length})
          </h3>

          {borrowings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 mb-4">
                <Package className="h-7 w-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">
                No Active Borrowings
              </h4>
              <p className="text-xs text-slate-500 mb-5 max-w-md mx-auto">
                Aapne abhi tak koi equipment borrow nahi kiya hai. Catalog me camera, laptops & tools borrow karne ke liye browse karein!
              </p>
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all"
              >
                <Compass className="h-4 w-4 text-slate-300" />
                <span>Explore Equipment Catalog</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {borrowings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-xs gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          b.status.includes("Active")
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {b.status}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Owner: {b.owner}
                      </span>
                    </div>
                    <h4 className="font-black text-base text-slate-900 mt-1">
                      {b.item}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {b.dates} • Total: ₹{b.totalPaid}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      📍 {b.pickupSpot}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Handover OTP
                      </span>
                      <div className="font-mono text-lg font-black text-emerald-700">
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
          <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/40 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <h3 className="font-black text-base text-slate-900">
                MODULE C: PeerTrust Credibility Algorithm in Action
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {trustBreakdown.explanation} Reviews from high-credibility peers
              count for more; suspicious accounts or low-trust raters are dampened.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="rounded-2xl bg-white p-3 border border-amber-200/80 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-semibold">
                  1. Raw Weighted Avg
                </div>
                <div className="font-black text-slate-900 text-lg">
                  {trustBreakdown.weightedAvg} / 5.0
                </div>
              </div>
              <div className="rounded-2xl bg-white p-3 border border-amber-200/80 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-semibold">
                  2. Volume Factor
                </div>
                <div className="font-black text-slate-900 text-lg">
                  {trustBreakdown.volumeFactor} (100%)
                </div>
              </div>
              <div className="rounded-2xl bg-white p-3 border border-amber-200/80 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-semibold">
                  3. Total Txns
                </div>
                <div className="font-black text-slate-900 text-lg">
                  {trustBreakdown.totalTransactions} Exchanges
                </div>
              </div>
              <div className="rounded-2xl bg-white p-3 border border-amber-200/80 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-semibold">
                  4. Final Trust Score
                </div>
                <div className="font-black text-emerald-700 text-lg">
                  ⭐ {trustBreakdown.score}
                </div>
              </div>
            </div>
          </div>

          {/* Incoming Reviews List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900">
              Verified Peer Reviews Received ({reviewsList.filter(r => r.revieweeId === "u_khaleeq").length})
            </h4>

            {reviewsList
              .filter((r) => r.revieweeId === "u_khaleeq")
              .map((rev) => {
                const reviewer = MOCK_USERS.find((u) => u.id === rev.reviewerId);
                return (
                  <div
                    key={rev.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            reviewer?.avatar ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                          }
                          alt={reviewer?.name || "Peer"}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {reviewer?.name || "Campus Peer"}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {reviewer?.college} • Rater Trust: {reviewer?.trustScore || "4.0"} ⭐
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 pl-10">
                      &quot;{rev.comment}&quot;
                    </p>
                    <div className="text-[10px] text-slate-400 pl-10 mt-1">
                      For item: <span className="font-semibold">{rev.itemTitle}</span> • {formatDate(rev.date)}
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
