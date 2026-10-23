"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  RotateCcw,
  SlidersHorizontal,
  X,
  PackageOpen,
  LayoutGrid,
  MapPin,
  Compass,
} from "lucide-react";
import { MOCK_RESOURCES, MOCK_USERS, CATEGORIES } from "@/data/mockData";
import { CategoryId, Resource } from "@/lib/types";
import { haversine } from "@/lib/utils";
import dynamic from "next/dynamic";
import { SearchBar } from "@/components/SearchBar";
import { FilterSidebar, FilterState } from "@/components/FilterSidebar";
import { ResourceCard } from "@/components/ResourceCard";

import { useRole } from "@/lib/roleContext";

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

const defaultFilters: FilterState = {
  maxDistance: 25,
  minPrice: 0,
  maxPrice: 5000,
  freeOnly: false,
  minTrust: 2.0,
  conditions: [],
  sortBy: "nearest",
};

const USER_COORDS = { lat: 18.5204, lng: 73.8567 };

function ExploreContent() {
  const searchParams = useSearchParams();
  const categoryParam = (searchParams.get("category") as CategoryId) || "all";
  const queryParam = searchParams.get("q") || "";

  const { resources } = useRole();
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">(categoryParam);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const usersMap = useMemo(
    () => new Map(MOCK_USERS.map((u) => [u.id, u])),
    []
  );

  const uniqueResources = useMemo(() => {
    const seen = new Set<string>();
    const list: Resource[] = [];
    for (const r of resources) {
      if (r && r.id && !seen.has(r.id)) {
        seen.add(r.id);
        list.push(r);
      }
    }
    return list;
  }, [resources]);

  // SEARCH & FILTER PIPELINE
  const filteredResources = useMemo(() => {
    return uniqueResources.filter((res) => {
      // STEP 1: Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = res.title.toLowerCase().includes(q);
        const matchesDesc = res.description.toLowerCase().includes(q);
        const matchesCat = res.category.toLowerCase().includes(q);
        const matchesFeatures = res.features?.some((f: string) => f.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesFeatures) {
          return false;
        }
      }

      // STEP 2: Category Filter
      if (selectedCategory !== "all" && res.category !== selectedCategory) {
        return false;
      }

      // STEP 3: Distance Filter (Haversine)
      const dist = haversine(
        USER_COORDS.lat,
        USER_COORDS.lng,
        res.location.lat,
        res.location.lng
      );
      if (filters.maxDistance < 25 && dist > filters.maxDistance) {
        return false;
      }

      // STEP 4: Price Filter
      if (filters.freeOnly) {
        if (res.pricePerDay !== 0) return false;
      } else {
        if (res.pricePerDay < filters.minPrice || res.pricePerDay > filters.maxPrice) {
          return false;
        }
      }

      // STEP 5: Trust Filter
      const owner = usersMap.get(res.ownerId);
      const ownerTrust = owner ? owner.trustScore : 4.0;
      if (ownerTrust < filters.minTrust) {
        return false;
      }

      // Condition Check
      if (filters.conditions.length > 0 && !filters.conditions.includes(res.condition)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const distA = haversine(USER_COORDS.lat, USER_COORDS.lng, a.location.lat, a.location.lng);
      const distB = haversine(USER_COORDS.lat, USER_COORDS.lng, b.location.lat, b.location.lng);
      const ownerA = usersMap.get(a.ownerId)?.trustScore || 4.0;
      const ownerB = usersMap.get(b.ownerId)?.trustScore || 4.0;

      switch (filters.sortBy) {
        case "nearest":
          return distA - distB;
        case "price_low":
          return a.pricePerDay - b.pricePerDay;
        case "price_high":
          return b.pricePerDay - a.pricePerDay;
        case "trust":
          return ownerB - ownerA;
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [uniqueResources, searchQuery, selectedCategory, filters, usersMap]);

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setSelectedCategory("all");
    setSearchQuery("");
  };

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (filters.maxDistance < 10 ? 1 : 0) +
    (filters.freeOnly || filters.maxPrice < 1000 ? 1 : 0) +
    (filters.minTrust > 2.0 ? 1 : 0) +
    filters.conditions.length;

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Title */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-pixel tracking-wider">
              CAMPUS RESOURCE GRID
            </h1>
            <span className="rounded-md bg-[#065f46] px-2.5 py-0.5 text-xs font-mono font-bold text-[#8bd6b6] border border-[#047857]">
              {filteredResources.length} Items Found
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
            Filter by walking distance, price, verified PeerTrust, and condition in your radius.
          </p>
        </div>

        {/* View Switcher & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          {/* Grid vs Map View Switcher */}
          <div className="flex bg-[#1c1b1b] p-1 rounded-xl border border-[#2a2a2a]">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold font-headline-sm uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#065f46] text-white shadow-xs border border-[#047857]"
                  : "text-[#bec9c2] hover:text-white"
              }`}
            >
              <LayoutGrid className="h-4 w-4 text-[#8bd6b6]" />
              <span>Catalog Grid</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold font-headline-sm uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === "map"
                  ? "bg-[#065f46] text-white shadow-xs border border-[#047857]"
                  : "text-[#bec9c2] hover:text-white"
              }`}
            >
              <MapPin className="h-4 w-4 text-[#fbbf24]" />
              <span>Spatial Radar Map</span>
            </button>
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="flex items-center gap-2 rounded-xl bg-[#1c1b1b] border border-[#2a2a2a] px-4 py-2.5 text-xs font-bold text-[#e5e2e1] shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#8bd6b6]" />
              <span>Filters ({activeFiltersCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by title, keyword, model (e.g. Canon DSLR, Decathlon, MacBook)..."
        />
      </div>

      {/* Category Pills Bar */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold font-headline-sm uppercase tracking-wider transition-all cursor-pointer ${
            selectedCategory === "all"
              ? "bg-[#065f46] text-white border border-[#047857] shadow-xs"
              : "bg-[#1c1b1b] text-[#bec9c2] border border-[#2a2a2a] hover:border-[#353534] hover:bg-[#252525]"
          }`}
        >
          All Resources ({uniqueResources.length})
        </button>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold font-headline-sm uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? "bg-[#065f46] text-white border border-[#047857] shadow-xs"
                  : "bg-[#1c1b1b] text-[#bec9c2] border border-[#2a2a2a] hover:border-[#353534] hover:bg-[#252525]"
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] font-mono rounded px-1.5 py-0.2 ${
                  isSelected ? "bg-white/20 text-white" : "bg-[#0e0e0e] text-[#89938d]"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Filter Badges */}
      {activeFiltersCount > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl bg-[#1c1b1b] border border-[#2a2a2a] p-3 text-xs">
          <span className="font-mono font-bold text-[#89938d]">Active Filters:</span>
          {selectedCategory !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#0e0e0e] px-2.5 py-1 font-semibold text-[#e5e2e1] border border-[#2a2a2a]">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory("all")}>
                <X className="h-3 w-3 text-slate-400 hover:text-white" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#0e0e0e] px-2.5 py-1 font-semibold text-[#e5e2e1] border border-[#2a2a2a]">
              Query: &quot;{searchQuery}&quot;
              <button onClick={() => setSearchQuery("")}>
                <X className="h-3 w-3 text-slate-400 hover:text-white" />
              </button>
            </span>
          )}
          {filters.maxDistance < 10 && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#0e0e0e] px-2.5 py-1 font-semibold text-[#e5e2e1] border border-[#2a2a2a]">
              Distance: ≤ {filters.maxDistance} km
              <button onClick={() => setFilters({ ...filters, maxDistance: 10 })}>
                <X className="h-3 w-3 text-slate-400 hover:text-white" />
              </button>
            </span>
          )}
          {filters.freeOnly && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#065f46]/30 px-2.5 py-1 font-semibold text-[#8bd6b6] border border-[#065f46]">
              Free Only
              <button onClick={() => setFilters({ ...filters, freeOnly: false })}>
                <X className="h-3 w-3 text-[#8bd6b6] hover:text-white" />
              </button>
            </span>
          )}
          {filters.minTrust > 2.0 && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#2a2004] px-2.5 py-1 font-semibold text-[#fbbf24] border border-[#4a3505]">
              Min Trust: {filters.minTrust}⭐
              <button onClick={() => setFilters({ ...filters, minTrust: 2.0 })}>
                <X className="h-3 w-3 text-[#fbbf24] hover:text-white" />
              </button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="ml-auto font-bold text-[#8bd6b6] hover:underline cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Container: Map View vs Grid View */}
      {viewMode === "map" ? (
        <div className="space-y-4">
          <InteractiveMap
            resources={filteredResources}
            userLat={USER_COORDS.lat}
            userLng={USER_COORDS.lng}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20">
              <FilterSidebar
                filters={filters}
                onChange={setFilters}
                onReset={handleResetFilters}
                totalResultsCount={filteredResources.length}
              />
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="lg:hidden col-span-1 mb-4">
              <FilterSidebar
                filters={filters}
                onChange={setFilters}
                onReset={handleResetFilters}
                totalResultsCount={filteredResources.length}
              />
            </div>
          )}

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredResources.map((res) => (
                  <ResourceCard key={res.id} resource={res} userCoords={USER_COORDS} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#1c1b1b] p-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0e0e0e] border border-[#2a2a2a] text-[#8bd6b6] mb-4 shadow-[inset_2px_2px_0_#0a0a0a]">
                  <PackageOpen className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold font-headline-sm text-white">
                  No matching resources found
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#9ca3af] max-w-sm mx-auto">
                  Try widening your distance radius or clearing some filters to see
                  more items nearby.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#065f46] hover:bg-[#047857] px-4 py-2 text-xs font-bold font-headline-sm uppercase tracking-wider text-white border border-[#047857] shadow-[0_2px_0_0_#003828] active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-500">
          Loading catalog...
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
// RE:USE — Modular Circular Economy Architecture
