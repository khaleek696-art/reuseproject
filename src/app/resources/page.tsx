"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  Filter,
  PlusCircle,
  MapPin,
  Calendar,
  IndianRupee,
  ShieldCheck,
  RotateCcw,
  Search,
  LayoutGrid,
  Map,
  MessageSquare,
} from "lucide-react";
import { MOCK_RESOURCES, MOCK_USERS, CATEGORIES } from "@/data/mockData";
import { CategoryId, Condition, Resource } from "@/lib/types";
import { haversine } from "@/lib/utils";
import dynamic from "next/dynamic";
import { ResourceCard } from "@/components/ResourceCard";
import { AddResourceModal } from "@/components/AddResourceModal";
import { ChatDrawer } from "@/components/ChatDrawer";
import { useRole } from "@/lib/roleContext";

// Dynamically import InteractiveMap with ssr: false to prevent Next.js SSR hydration suppression
const InteractiveMap = dynamic(
  () => import("@/components/InteractiveMap").then((mod) => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[580px] rounded-3xl bg-slate-950 flex flex-col items-center justify-center text-white border border-slate-800 shadow-2xl">
        <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-bold tracking-wider text-emerald-400">Loading Campus Spatial Radar Map...</span>
      </div>
    ),
  }
);

function ResourcesContent() {
  const searchParams = useSearchParams();
  const catParam = (searchParams.get("category") as CategoryId) || "all";
  const queryParam = searchParams.get("q") || "";
  const actionParam = searchParams.get("action");

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">(catParam);
  const [maxDistance, setMaxDistance] = useState(25.0); // Default 25 km to cover all campus items
  const [priceRange, setPriceRange] = useState(5000);
  const [trustFilter, setTrustFilter] = useState<"all" | "verified" | "high_trust">("all");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isShareModalOpen, setIsShareModalOpen] = useState(actionParam === "list");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<{ name: string; role: string; title: string }>({
    name: "Priya Patel",
    role: "Equipment Owner",
    title: "Sony FX3 4K Cinema Camera Kit",
  });

  const { resources, addResource, role } = useRole();

  // Sync URL search parameters whenever they change
  React.useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearchQuery(q);
    }
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat as CategoryId);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    const userLat = 18.5204;
    const userLng = 73.8567;

    // Guaranteed deduplication of resources array by ID
    const seenIds = new Set<string>();
    const uniqueResources: Resource[] = [];
    for (const r of resources) {
      if (!seenIds.has(r.id)) {
        seenIds.add(r.id);
        uniqueResources.push(r);
      }
    }

    return uniqueResources.filter((res) => {
      // Category
      if (selectedCategory !== "all" && res.category !== selectedCategory) {
        return false;
      }

      // Search Query Matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = res.title.toLowerCase().includes(q);
        const matchesDesc = res.description.toLowerCase().includes(q);
        const matchesCat = res.category.toLowerCase().includes(q);
        const matchesFeatures = res.features?.some((f) => f.toLowerCase().includes(q));

        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesFeatures) {
          return false;
        }
      }

      // PostGIS Radius
      const dist = haversine(userLat, userLng, res.location.lat, res.location.lng);
      if (dist > maxDistance) return false;

      // Price Range
      if (res.pricePerDay > priceRange) return false;

      // Trust requirement filter
      const owner = MOCK_USERS.find((u) => u.id === res.ownerId);
      if (trustFilter === "verified" && !owner?.isVerified) return false;
      if (trustFilter === "high_trust" && (!owner || owner.trustScore < 4.5)) return false;

      return true;
    });
  }, [resources, selectedCategory, searchQuery, maxDistance, priceRange, trustFilter]);

  const handleReset = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setMaxDistance(5.0);
    setPriceRange(3000);
    setTrustFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const openChatForRes = (res: Resource) => {
    const owner = MOCK_USERS.find((u) => u.id === res.ownerId);
    setChatTarget({
      name: owner?.name || "Equipment Owner",
      role: "Verified Resource Owner",
      title: res.title,
    });
    setIsChatOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Explore Local Equipment ({filtered.length} Items Available)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verified equipment available within {maxDistance} km radius
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid vs Map View Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === "map"
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Map className="h-3.5 w-3.5" />
              <span>Radar Map View</span>
            </button>
          </div>

          {/* List Gear Button — ONLY visible for Resource Owner role */}
          {role === "owner" && (
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="h-4 w-4 text-emerald-300" />
              <span>+ List Gear</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Bar: Search & Category Pills */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog by title, lens, tool, model..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs sm:text-sm font-medium focus:border-emerald-600 focus:outline-none shadow-2xs"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold shrink-0 transition-all ${
              selectedCategory === "all"
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            All Items
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold shrink-0 transition-all ${
                selectedCategory === c.id
                  ? "bg-emerald-800 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Grid/Map */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTERS SIDEBAR */}
        <div className="lg:col-span-1 space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-black text-sm text-slate-900 flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-emerald-800" />
              <span>Refine Filters</span>
            </span>
            <button
              onClick={handleReset}
              className="text-[11px] font-bold text-slate-400 hover:text-emerald-800 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Date Picker Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-emerald-800" />
              <span>Borrowing Dates Availability</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-700 focus:bg-white focus:outline-none"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-700 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* PostGIS Radius Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-800" />
                <span>Radius Distance</span>
              </span>
              <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {maxDistance} km
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              step={0.5}
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
              className="w-full accent-emerald-800"
            />
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1">
                <IndianRupee className="h-3.5 w-3.5 text-emerald-800" />
                <span>Max Daily Rate</span>
              </span>
              <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ₹{priceRange}/day
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={5000}
              step={100}
              value={priceRange}
              onChange={(e) => setPriceRange(parseInt(e.target.value))}
              className="w-full accent-emerald-800"
            />
          </div>

          {/* Trust Level Requirement */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-800" />
              <span>Owner Trust Level</span>
            </label>
            <div className="space-y-1.5">
              {[
                { id: "all", label: "All Verified Owners" },
                { id: "verified", label: "Govt ID Verified Only" },
                { id: "high_trust", label: "High Trust (★ 4.5+ Rating)" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTrustFilter(t.id as any)}
                  className={`w-full text-left rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                    trustFilter === t.id
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-300"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS: GRID VIEW OR MAP VIEW */}
        <div className="lg:col-span-3">
          {viewMode === "map" ? (
            <InteractiveMap
              resources={filtered}
              onSelectResource={(res) => openChatForRes(res)}
              maxDistance={maxDistance}
            />
          ) : (
            <>
              {filtered.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
                  <Compass className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900">No resources matched your filters</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try expanding your radius distance or resetting category filters.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-4 rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-bold"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((res, idx) => (
                    <div key={`${res.id}-${idx}`} className="relative group">
                      <ResourceCard resource={res} />
                      {/* Chat trigger button */}
                      <button
                        onClick={() => openChatForRes(res)}
                        className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md hover:bg-emerald-800 hover:text-white transition-all"
                        title="Chat with Owner"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODALS & DRAWERS */}
      <AddResourceModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onAddResource={(newRes) => addResource(newRes)}
      />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        recipientName={chatTarget.name}
        recipientRole={chatTarget.role}
        resourceTitle={chatTarget.title}
      />
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading catalog...</div>}>
      <ResourcesContent />
    </Suspense>
  );
}
