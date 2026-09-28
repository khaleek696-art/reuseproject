"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Search,
  CheckCircle2,
  Package,
  Layers,
  Zap,
} from "lucide-react";
import { MOCK_RESOURCES } from "@/data/mockData";
import { Resource } from "@/lib/types";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ResourceCard } from "@/components/ResourceCard";
import { AddResourceModal } from "@/components/AddResourceModal";
import { useRole } from "@/lib/roleContext";

export default function HomePage() {
  const router = useRouter();
  const { resources, addResource } = useRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/resources?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/resources");
    }
  };

  const handleAddResource = (newRes: Resource) => {
    addResource(newRes);
  };

  const uniqueResources = React.useMemo(() => {
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

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px]">
          <div className="max-w-3xl mx-auto text-center">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-900 shadow-2xs mb-5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Hyperlocal Circular Marketplace</span>
            </div>

            {/* Display Title */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
              Borrow equipment nearby.{" "}
              <span className="text-emerald-800 underline decoration-emerald-500/40 decoration-4">
                Monetize what you own.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto">
              Access high-quality cameras, tools, projectors, camping gear, and electronics from verified neighbors within 5 km.
            </p>

            {/* Clean Simple Search Box */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 mx-auto max-w-2xl relative flex flex-col sm:flex-row items-center rounded-2xl border border-slate-300 bg-white p-2 shadow-lg focus-within:border-emerald-700 focus-within:ring-4 focus-within:ring-emerald-700/10 transition-all gap-2"
            >
              <div className="pl-3 text-slate-400 flex items-center gap-2 self-start sm:self-center pt-2 sm:pt-0">
                <Search className="h-5 w-5 text-emerald-700" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cameras, power tools, projectors, camping gear..."
                className="w-full bg-transparent px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 px-6 py-3 text-sm font-bold text-white shadow-md active:scale-95 transition-all shrink-0"
              >
                <span>Search Equipment</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Safety Badges */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1 text-slate-700">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                Verified Neighbors &amp; Govt ID
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 text-slate-700">
                <MapPin className="h-4 w-4 text-emerald-700" />
                Hyperlocal &lt; 5 km Radius
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 text-slate-700">
                <Zap className="h-4 w-4 text-emerald-700" />
                Secure Payment Escrow
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SIMPLE HOW IT WORKS SECTION */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">How RE:USE Works</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Simple, safe, and transparent 3-step rental process</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-black">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">Find Equipment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Browse nearby tools, cameras, and gear listed by verified neighbors. Filter by price, location, and dates.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-black">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">Book &amp; Secure</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select borrowing dates and request booking. Funds are held safely in Escrow until you inspect and receive the item.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-black">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">Use &amp; Return</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pickup directly or request courier delivery. Complete your project, return the gear safely, and leave a review.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY GRID */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 w-full">
        <CategoryGrid />
      </section>

      {/* 4. FEATURED AVAILABLE EQUIPMENT */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Popular Equipment Nearby
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Available for instant booking and local pickup</p>
          </div>

          <Link
            href="/resources"
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900"
          >
            <span>View All Gear ({uniqueResources.length})</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {uniqueResources.slice(0, 8).map((res, idx) => (
            <ResourceCard key={`${res.id}-${idx}`} resource={res} />
          ))}
        </div>
      </section>

      {/* LIST A RESOURCE MODAL */}
      <AddResourceModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onAddResource={handleAddResource}
      />
    </div>
  );
}
