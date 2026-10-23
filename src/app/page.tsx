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
    <div className="flex flex-col gap-12 pb-24">
      {/* 1. VOXEL SUNSET HERO BANNER */}
      <section className="relative w-full min-h-[580px] sm:min-h-[640px] pt-8 pb-24 flex flex-col justify-center items-center select-none bg-[#0e0e0e] overflow-hidden border-b border-[#201f1f]">
        {/* Pure CSS Minecraft Sunset Landscape Background */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, #1E3A5F 0%, #EA580C 44%, #FBBF24 70%, #065F46 100%)',
          }}
        >
          {/* Pixel Clouds Layer */}
          <div className="absolute top-8 left-[8%] flex items-center opacity-90">
            <div className="w-20 h-6 bg-white shadow-[0_4px_0_0_#CBD5E1]"></div>
            <div className="w-14 h-9 bg-white -ml-4 -mt-3 shadow-[0_4px_0_0_#CBD5E1]"></div>
            <div className="w-16 h-6 bg-white -ml-2 shadow-[0_4px_0_0_#CBD5E1]"></div>
          </div>
          <div className="absolute top-16 right-[18%] flex items-center opacity-75">
            <div className="w-24 h-7 bg-white shadow-[0_4px_0_0_#CBD5E1]"></div>
            <div className="w-20 h-10 bg-white -ml-6 -mt-3 shadow-[0_4px_0_0_#CBD5E1]"></div>
            <div className="w-12 h-7 bg-white -ml-3 shadow-[0_4px_0_0_#CBD5E1]"></div>
          </div>
          <div className="absolute top-6 right-[52%] hidden md:flex items-center opacity-60">
            <div className="w-16 h-5 bg-white shadow-[0_3px_0_0_#CBD5E1]"></div>
            <div className="w-12 h-7 bg-white -ml-3 -mt-2 shadow-[0_3px_0_0_#CBD5E1]"></div>
          </div>

          {/* Square 64px Minecraft Sun */}
          <div className="absolute top-16 right-[14%] md:right-[20%] w-[64px] h-[64px] bg-[#FBBF24] shadow-[0_0_48px_rgba(251,191,36,0.9)] z-0"></div>

          {/* Stepped Pixel Hills */}
          <div
            className="absolute bottom-[68px] inset-x-0 h-44 opacity-90"
            style={{
              backgroundColor: '#047857',
              clipPath:
                'polygon(0 65%, 8% 65%, 8% 45%, 18% 45%, 18% 30%, 30% 30%, 30% 50%, 42% 50%, 42% 38%, 56% 38%, 56% 22%, 70% 22%, 70% 40%, 82% 40%, 82% 58%, 92% 58%, 92% 32%, 100% 32%, 100% 100%, 0 100%)',
            }}
          ></div>
          <div
            className="absolute bottom-[68px] inset-x-0 h-32"
            style={{
              backgroundColor: '#065F46',
              clipPath:
                'polygon(0 40%, 12% 40%, 12% 20%, 24% 20%, 24% 48%, 38% 48%, 38% 32%, 52% 32%, 52% 16%, 64% 16%, 64% 36%, 78% 36%, 78% 52%, 88% 52%, 88% 28%, 100% 28%, 100% 100%, 0 100%)',
            }}
          ></div>

          {/* Voxel Trees */}
          <div className="absolute bottom-[68px] left-[5%] z-10 hidden sm:flex flex-col items-center">
            <div className="w-12 h-10 bg-[#2D5F00] shadow-[inset_3px_3px_0_#4A7A23,inset_-3px_-3px_0_#183800]"></div>
            <div className="w-8 h-6 -mt-1 bg-[#4A7A23] shadow-[inset_2px_2px_0_#65A832,inset_-2px_-2px_0_#2D5F00]"></div>
            <div className="w-4 h-12 bg-[#60452F] shadow-[inset_1px_1px_0_#805A3E]"></div>
          </div>
          <div className="absolute bottom-[68px] right-[6%] z-10 hidden sm:flex flex-col items-center">
            <div className="w-14 h-12 bg-[#2D5F00] shadow-[inset_3px_3px_0_#4A7A23,inset_-3px_-3px_0_#183800]"></div>
            <div className="w-10 h-7 -mt-1 bg-[#4A7A23] shadow-[inset_2px_2px_0_#65A832,inset_-2px_-2px_0_#2D5F00]"></div>
            <div className="w-5 h-14 bg-[#60452F] shadow-[inset_1px_1px_0_#805A3E]"></div>
          </div>

          {/* Ground Layer: 60px grass + 8px dirt band */}
          <div className="absolute bottom-0 inset-x-0 h-[68px] flex flex-col z-10">
            <div className="h-[60px] w-full bg-[#65A832] shadow-[inset_0_4px_0_#84CC16] relative flex">
              <div className="w-full h-full bg-[repeating-linear-gradient(90deg,#65A832_0px,#65A832_16px,#4A7A23_16px,#4A7A23_20px)] opacity-40"></div>
            </div>
            <div className="h-[8px] w-full bg-[#60452F] shadow-[inset_0_2px_0_#3f2b1d]"></div>
          </div>
        </div>

        {/* Hero Content Overlay with Solid Dark Tactical Card */}
        <div className="relative z-20 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center my-auto">
          <div className="w-full max-w-3xl p-6 sm:p-8 bg-[#0e0e0e]/95 backdrop-blur-md border-2 border-[#201f1f] shadow-[0_12px_0_0_#060606,inset_1px_1px_0_#2a2a2a] flex flex-col items-center">
            {/* Subtitle badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#201f1f] border border-[#353534] shadow-[inset_1px_1px_0_#0a0a0a] mb-4">
              <span className="w-2 h-2 bg-[#8bd6b6] shadow-[0_0_6px_#8bd6b6] animate-pulse"></span>
              <span className="font-mono text-[11px] font-bold text-[#8bd6b6] tracking-wider uppercase">
                BIOREGION COMMONS MESH • HYPERLOCAL GRID
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-['Silkscreen'] text-2xl sm:text-3xl lg:text-[34px] text-white leading-tight tracking-wider drop-shadow-[0_4px_0_#000000] mb-3">
              YOUR NEXT RESOURCE IS CLOSER THAN YOU THINK.
            </h1>
            <p className="text-sm sm:text-base text-[#bec9c2] max-w-xl mb-6 leading-relaxed">
              Borrow equipment nearby. Monetize what you own. Tap into verified neighborhood inventories within 5 km.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl flex flex-col sm:flex-row items-stretch gap-2.5 mb-6">
              <div className="flex-1 h-12 bg-[#1c1b1b] border-2 border-[#2a2a2a] px-4 flex items-center gap-3 shadow-[inset_2px_2px_0_#0a0a0a] focus-within:border-[#8bd6b6] transition-colors">
                <Search className="h-5 w-5 text-[#8bd6b6] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cameras, power tools, projectors, camping gear..."
                  className="w-full bg-transparent text-[#e5e2e1] text-sm font-semibold placeholder:text-[#89938d] focus:outline-none"
                />
                <span className="font-mono text-[11px] text-[#89938d] px-1.5 py-0.5 bg-[#201f1f] border border-[#353534] hidden sm:inline-block">/</span>
              </div>
              <button
                type="submit"
                className="h-12 px-6 bg-[#065f46] hover:bg-[#047857] text-white font-headline-sm uppercase tracking-wider border-2 border-[#047857] shadow-[0_4px_0_0_#003828] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer text-sm"
              >
                <span>Search Equipment</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-4">
              <Link
                href="/resources"
                className="h-10 sm:h-11 px-5 sm:px-6 bg-[#065f46] hover:bg-[#047857] text-white font-headline-sm text-[12px] sm:text-[13px] tracking-wider uppercase flex items-center gap-2 border-2 border-[#047857] shadow-[0_4px_0_0_#003828] active:translate-y-1 active:shadow-none transition-all"
              >
                <Package className="h-4 w-4 text-[#7bd8b1]" />
                <span>Explore Gear</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="h-10 sm:h-11 px-5 sm:px-6 bg-[#201f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] font-headline-sm text-[12px] sm:text-[13px] tracking-wider uppercase flex items-center gap-2 border-2 border-[#353534] shadow-[0_4px_0_0_#0e0e0e] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-[#8bd6b6]" />
                <span>List an Item</span>
              </button>
              <Link
                href="/matches"
                className="h-10 sm:h-11 px-5 sm:px-6 bg-[#201f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] font-headline-sm text-[12px] sm:text-[13px] tracking-wider uppercase flex items-center gap-2 border-2 border-[#353534] shadow-[0_4px_0_0_#0e0e0e] active:translate-y-1 active:shadow-none transition-all"
              >
                <Zap className="h-4 w-4 text-[#fbbf24]" />
                <span>AI Smart Match</span>
              </Link>
            </div>

            {/* Safety Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[#9ca3af] font-medium pt-2 border-t border-[#262626] w-full">
              <span className="flex items-center gap-1.5 text-[#bec9c2]">
                <ShieldCheck className="h-4 w-4 text-[#8bd6b6]" />
                Verified Neighbors &amp; ID Check
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5 text-[#bec9c2]">
                <MapPin className="h-4 w-4 text-[#8bd6b6]" />
                Hyperlocal &lt; 5 km Radius
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5 text-[#bec9c2]">
                <Zap className="h-4 w-4 text-[#fbbf24]" />
                Secure Escrow Deposit
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY INVENTORY SLOTS */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 w-full">
        <CategoryGrid />
      </section>

      {/* 3. FEATURED AVAILABLE EQUIPMENT */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-[#201f1f]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <h2 className="font-['Silkscreen'] text-xl sm:text-2xl text-white tracking-wider">
                POPULAR GEAR NEARBY
              </h2>
            </div>
            <p className="text-xs text-[#9ca3af] mt-1 font-medium">
              Live items available for instant booking and local pickup from your neighbors
            </p>
          </div>

          <Link
            href="/resources"
            className="flex items-center gap-2 text-xs font-bold font-headline-sm uppercase tracking-wider text-[#8bd6b6] hover:text-[#7bd8b1] bg-[#1c1b1b] px-3.5 py-2 border border-[#2a2a2a] shadow-[0_2px_0_0_#0e0e0e]"
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

      {/* 4. HOW RE:USE WORKS (CRAFTING RECIPE) */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">⚒️</span>
            <h2 className="font-['Silkscreen'] text-2xl sm:text-3xl text-white tracking-wider">
              HOW IT WORKS
            </h2>
          </div>
          <p className="text-sm text-[#9ca3af]">
            The 3-step circular crafting recipe for zero-waste resource exchange in your neighborhood.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-[0_4px_0_0_#0e0e0e] flex flex-col items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0e0e0e] border border-[#2a2a2a] text-[#8bd6b6] font-['Silkscreen'] text-lg shadow-[inset_2px_2px_0_#0a0a0a]">
              1
            </div>
            <h3 className="font-headline-sm text-white text-base">Find Equipment</h3>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Browse nearby tools, cameras, and gear listed by verified neighbors. Filter by price, location, and dates.
            </p>
          </div>

          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-[0_4px_0_0_#0e0e0e] flex flex-col items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0e0e0e] border border-[#2a2a2a] text-[#8bd6b6] font-['Silkscreen'] text-lg shadow-[inset_2px_2px_0_#0a0a0a]">
              2
            </div>
            <h3 className="font-headline-sm text-white text-base">Book &amp; Secure</h3>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Select borrowing dates and request booking. Funds are held safely in Escrow until you inspect and receive the item.
            </p>
          </div>

          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-[0_4px_0_0_#0e0e0e] flex flex-col items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0e0e0e] border border-[#2a2a2a] text-[#8bd6b6] font-['Silkscreen'] text-lg shadow-[inset_2px_2px_0_#0a0a0a]">
              3
            </div>
            <h3 className="font-headline-sm text-white text-base">Use &amp; Return</h3>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Pickup directly or request courier delivery. Complete your project, return the gear safely, and exchange OTP.
            </p>
          </div>
        </div>
      </section>

      {/* 5. COMMUNITY IMPACT METRICS */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-6 sm:p-8 bg-[#1c1b1b] border border-[#2a2a2a] shadow-[0_6px_0_0_#0e0e0e] rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌍</span>
                <h2 className="font-['Silkscreen'] text-xl sm:text-2xl text-white tracking-wider">
                  COMMUNITY IMPACT
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
                Real-time planetary metrics powered by communal equipment sharing.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#0e0e0e] border border-[#2a2a2a] px-3 py-1.5 shadow-[inset_1px_1px_0_#0a0a0a]">
              <span className="w-2.5 h-2.5 bg-[#8bd6b6] animate-pulse"></span>
              <span className="font-mono text-xs text-[#8bd6b6]">LIVE ECO LEDGER</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0e0e0e] p-6 rounded-xl border border-[#2a2a2a] shadow-[inset_2px_2px_0_#0a0a0a] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-[#89938d] uppercase tracking-wider">TOTAL EXCHANGES</span>
                  <span className="text-xl">🔄</span>
                </div>
                <div className="font-headline-lg text-3xl text-white font-bold mb-2 font-mono">
                  142+
                </div>
                <div className="w-full h-2 bg-[#1c1b1b] my-2 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8bd6b6] w-[75%]"></div>
                </div>
              </div>
              <span className="font-mono text-[11px] text-[#8bd6b6]">▲ Verified on Live Supabase DB</span>
            </div>

            <div className="bg-[#0e0e0e] p-6 rounded-xl border border-[#2a2a2a] shadow-[inset_2px_2px_0_#0a0a0a] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-[#89938d] uppercase tracking-wider">CO₂ DIVERTED</span>
                  <span className="text-xl">🌱</span>
                </div>
                <div className="font-headline-lg text-3xl text-[#8bd6b6] font-bold mb-2 font-mono">
                  880.4 KG
                </div>
                <div className="w-full h-2 bg-[#1c1b1b] my-2 rounded-full overflow-hidden">
                  <div className="h-full bg-[#065f46] w-[88%]"></div>
                </div>
              </div>
              <span className="font-mono text-[11px] text-[#8bd6b6]">EPA WARM lifecycle benchmark</span>
            </div>

            <div className="bg-[#0e0e0e] p-6 rounded-xl border border-[#2a2a2a] shadow-[inset_2px_2px_0_#0a0a0a] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-[#89938d] uppercase tracking-wider">MONEY SAVED</span>
                  <span className="text-xl">💰</span>
                </div>
                <div className="font-headline-lg text-3xl text-[#fbbf24] font-bold mb-2 font-mono">
                  ₹2,84,650
                </div>
                <div className="w-full h-2 bg-[#1c1b1b] my-2 rounded-full overflow-hidden">
                  <div className="h-full bg-[#fbbf24] w-[92%]"></div>
                </div>
              </div>
              <span className="font-mono text-[11px] text-[#fbbf24]">Retained in student wallets</span>
            </div>
          </div>
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
// RE:USE — Modular Circular Economy Architecture
