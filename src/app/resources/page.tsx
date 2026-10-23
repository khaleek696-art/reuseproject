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
      if (maxDistance < 25 && dist > maxDistance) return false;

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[#201f1f] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-pixel tracking-wider">
              EXPLORE LOCAL GEAR
            </h1>
            <span className="rounded-md bg-[#065f46] px-2.5 py-0.5 text-xs font-mono font-bold text-[#8bd6b6] border border-[#047857]">
              {filtered.length} Items Available
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1 font-medium">
            Verified equipment available within {maxDistance} km radius in your neighborhood mesh.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid vs Map View Switcher */}
          <div className="flex bg-[#1c1b1b] p-1 rounded-xl border border-[#2a2a2a]">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold font-headline-sm uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#065f46] text-white shadow-sm border border-[#047857]"
                  : "text-[#bec9c2] hover:text-white"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5 text-[#8bd6b6]" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold font-headline-sm uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === "map"
                  ? "bg-[#065f46] text-white shadow-sm border border-[#047857]"
                  : "text-[#bec9c2] hover:text-white"
              }`}
            >
              <Map className="h-3.5 w-3.5 text-[#fbbf24]" />
              <span>Radar Map View</span>
            </button>
          </div>

          {/* List Gear Button — ONLY visible for Resource Owner role */}
          {role === "owner" && (
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#065f46] hover:bg-[#047857] px-4 py-2 text-xs sm:text-sm font-bold font-headline-sm uppercase tracking-wider text-white border border-[#047857] shadow-[0_2px_0_0_#003828] active:translate-y-0.5 transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 text-[#8bd6b6]" />
              <span>+ List Gear</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Bar: Search & Category Pills */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8bd6b6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog by title, lens, tool, model..."
            className="w-full rounded-xl border border-[#2a2a2a] bg-[#1c1b1b] py-3 pl-10 pr-4 text-xs sm:text-sm font-medium text-[#e5e2e1] placeholder:text-[#89938d] focus:border-[#8bd6b6] focus:outline-none shadow-[inset_2px_2px_0_#0a0a0a]"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold font-headline-sm uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[#065f46] text-white border border-[#047857]"
                : "bg-[#1c1b1b] border border-[#2a2a2a] text-[#bec9c2] hover:bg-[#252525]"
            }`}
          >
            All Items
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold font-headline-sm uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? "bg-[#065f46] text-white border border-[#047857]"
                  : "bg-[#1c1b1b] border border-[#2a2a2a] text-[#bec9c2] hover:bg-[#252525]"
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
        <div className="lg:col-span-1 space-y-6 rounded-2xl border border-[#2a2a2a] bg-[#1c1b1b] p-5 shadow-[0_4px_0_0_#0e0e0e] h-fit">
          <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
            <span className="font-headline-sm uppercase tracking-wider text-sm text-white flex items-center gap-1.5 font-bold">
              <Filter className="h-4 w-4 text-[#8bd6b6]" />
              <span>Refine Filters</span>
            </span>
            <button
              onClick={handleReset}
              className="text-[11px] font-bold text-slate-400 hover:text-[#8bd6b6] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Date Picker Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold font-headline-sm uppercase tracking-wider text-[#bec9c2] flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-[#8bd6b6]" />
              <span>Borrowing Dates</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-[#2a2a2a] bg-[#0e0e0e] px-2 py-1.5 text-[11px] font-mono font-semibold text-[#e5e2e1] focus:border-[#8bd6b6] focus:outline-none"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-[#2a2a2a] bg-[#0e0e0e] px-2 py-1.5 text-[11px] font-mono font-semibold text-[#e5e2e1] focus:border-[#8bd6b6] focus:outline-none"
              />
            </div>
          </div>

          {/* PostGIS Radius Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[#bec9c2] flex items-center gap-1 font-headline-sm uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5 text-[#8bd6b6]" />
                <span>Radius Distance</span>
              </span>
              <span className="text-[#8bd6b6] bg-[#065f46]/30 px-2 py-0.5 rounded border border-[#065f46] font-mono">
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
              className="w-full accent-[#8bd6b6] cursor-pointer"
            />
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[#bec9c2] flex items-center gap-1 font-headline-sm uppercase tracking-wider">
                <IndianRupee className="h-3.5 w-3.5 text-[#fbbf24]" />
                <span>Max Daily Rate</span>
              </span>
              <span className="text-[#fbbf24] bg-[#2a2004] px-2 py-0.5 rounded border border-[#4a3505] font-mono">
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
              className="w-full accent-[#fbbf24] cursor-pointer"
            />
          </div>

          {/* Trust Level Requirement */}
          <div className="space-y-2">
            <label className="block text-xs font-bold font-headline-sm uppercase tracking-wider text-[#bec9c2] flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#8bd6b6]" />
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
                  className={`w-full text-left rounded-lg px-3 py-2 text-xs font-bold font-mono transition-all cursor-pointer ${
                    trustFilter === t.id
                      ? "bg-[#065f46] text-white border border-[#047857]"
                      : "bg-[#0e0e0e] border border-[#2a2a2a] text-[#bec9c2] hover:bg-[#1a1a1a]"
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
                <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#1c1b1b] p-12 text-center">
                  <Compass className="h-10 w-10 text-[#8bd6b6] mx-auto mb-3" />
                  <h3 className="text-base font-bold font-headline-sm text-white">No resources matched your filters</h3>
                  <p className="text-xs text-[#9ca3af] mt-1 max-w-sm mx-auto">
                    Try expanding your radius distance or resetting category filters.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-4 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white border border-[#047857] px-4 py-2 text-xs font-bold font-headline-sm uppercase tracking-wider shadow-[0_2px_0_0_#003828] active:translate-y-0.5 transition-all cursor-pointer"
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
                        className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-none bg-[#141414]/90 text-[#bec9c2] border border-[#2a2a2a] shadow-[0_2px_0_0_#0f0f0f] hover:bg-[#065f46] hover:text-white hover:border-[#8bd6b6] transition-all cursor-pointer"
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
