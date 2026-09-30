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
      if (dist > filters.maxDistance) {
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
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Explore Campus Resources
            </h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              {filteredResources.length} Found
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Filter by walking distance, price, verified PeerTrust, and condition.
          </p>
        </div>

        {/* View Switcher & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          {/* Grid vs Map View Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="h-4 w-4 text-emerald-700" />
              <span>Catalog Grid</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                viewMode === "map"
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MapPin className="h-4 w-4 text-emerald-300" />
              <span>Campus Map Radar</span>
            </button>
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-xs"
            >
              <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
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
          className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
            selectedCategory === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          All Resources ({MOCK_RESOURCES.length})
        </button>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] rounded-full px-1.5 py-0.2 ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
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
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-100/70 p-3 text-xs">
          <span className="font-bold text-slate-600">Active Filters:</span>
          {selectedCategory !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 font-semibold text-slate-800 border border-slate-200 shadow-2xs">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory("all")}>
                <X className="h-3 w-3 text-slate-400 hover:text-slate-600" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 font-semibold text-slate-800 border border-slate-200 shadow-2xs">
              Query: &quot;{searchQuery}&quot;
              <button onClick={() => setSearchQuery("")}>
                <X className="h-3 w-3 text-slate-400 hover:text-slate-600" />
              </button>
            </span>
          )}
          {filters.maxDistance < 10 && (
            <span className="inline-flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 font-semibold text-slate-800 border border-slate-200 shadow-2xs">
              Distance: ≤ {filters.maxDistance} km
              <button onClick={() => setFilters({ ...filters, maxDistance: 10 })}>
                <X className="h-3 w-3 text-slate-400 hover:text-slate-600" />
              </button>
            </span>
          )}
          {filters.freeOnly && (
            <span className="inline-flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 font-semibold text-emerald-800 border border-emerald-200 shadow-2xs">
              Free Only
              <button onClick={() => setFilters({ ...filters, freeOnly: false })}>
                <X className="h-3 w-3 text-emerald-600 hover:text-emerald-800" />
              </button>
            </span>
          )}
          {filters.minTrust > 2.0 && (
            <span className="inline-flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 font-semibold text-amber-800 border border-amber-200 shadow-2xs">
              Min Trust: {filters.minTrust}⭐
              <button onClick={() => setFilters({ ...filters, minTrust: 2.0 })}>
                <X className="h-3 w-3 text-amber-600 hover:text-amber-800" />
              </button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="ml-auto font-bold text-emerald-700 hover:underline"
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
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 mb-4">
                  <PackageOpen className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  No matching resources found
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  Try widening your distance radius or clearing some filters to see
                  more items nearby.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all"
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
