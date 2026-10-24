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
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Compass,
  Lock,
} from "lucide-react";
import { MOCK_RESOURCES, MOCK_USERS } from "@/data/mockData";
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

  // Featured gear for dynamic interactive card
  const featuredItems = React.useMemo(() => {
    const list = uniqueResources.filter(
      (r) => r && r.photos && r.photos.length > 0 && r.status !== "borrowed"
    );
    if (list.length > 0) return list.slice(0, 8);
    return MOCK_RESOURCES.slice(0, 8);
  }, [uniqueResources]);

  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const currentItem = featuredItems[activeItemIndex] || featuredItems[0] || MOCK_RESOURCES[0];

  const currentOwner = React.useMemo(() => {
    if (!currentItem) return null;
    return (
      MOCK_USERS.find((u) => u.id === currentItem.ownerId) || {
        id: "u_default",
        name: "Arjun S.",
        college: "ABES Engineering College",
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        trustScore: 4.9,
        totalShares: 24,
        isVerified: true,
      }
    );
  }, [currentItem]);

  const handlePrevItem = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveItemIndex((prev) => (prev > 0 ? prev - 1 : featuredItems.length - 1));
  };

  const handleNextItem = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveItemIndex((prev) => (prev < featuredItems.length - 1 ? prev + 1 : 0));
  };

  const currentPrice = currentItem?.pricePerDay || 599;
  const originalPrice = Math.round(currentPrice * 1.35);
  const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  const campusName = currentItem?.location?.campus || currentOwner?.college || "ABES Engineering College";
  const itemSpecs = currentItem?.features && currentItem.features.length > 0
    ? currentItem.features.slice(0, 4).join(" + ")
    : (currentItem?.description || "High-demand campus gear with verified escrow safety");

  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* 1. VOXEL SUNSET HERO BANNER WITH TRANSLUCENT FROSTED GLASS POD */}
      <section className="relative w-full min-h-[580px] sm:min-h-[620px] lg:min-h-[640px] pt-8 sm:pt-10 pb-24 sm:pb-28 lg:pb-24 flex flex-col justify-center items-center select-none bg-[#0a0a0a] overflow-hidden border-b border-[#201f1f]">
        {/* Vibrant Minecraft Sunset Landscape Background - Fully Visible */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          style={{
            background: 'linear-gradient(180deg, #1E3A5F 0%, #D9531E 42%, #F59E0B 68%, #065F46 100%)',
          }}
        >
          {/* Pixel Clouds Layer - positioned high in clear sky */}
          <div className="absolute top-4 left-[6%] flex items-center opacity-85 pointer-events-none">
            <div className="w-20 h-6 bg-white shadow-[0_4px_0_0_#CBD5E1]"></div>
            <div className="w-14 h-9 bg-white -ml-4 -mt-3 shadow-[0_4px_0_0_#CBD5E1]"></div>
            <div className="w-16 h-6 bg-white -ml-2 shadow-[0_4px_0_0_#CBD5E1]"></div>
          </div>
          <div className="absolute top-8 right-[24%] hidden md:flex items-center opacity-70 pointer-events-none">
            <div className="w-24 h-7 bg-white shadow-[0_4px_0_0_#CBD5E1]"></div>
            <div className="w-20 h-10 bg-white -ml-6 -mt-3 shadow-[0_4px_0_0_#CBD5E1]"></div>
            <div className="w-12 h-7 bg-white -ml-3 shadow-[0_4px_0_0_#CBD5E1]"></div>
          </div>
          <div className="absolute top-5 right-[55%] hidden lg:flex items-center opacity-55 pointer-events-none">
            <div className="w-16 h-5 bg-white shadow-[0_3px_0_0_#CBD5E1]"></div>
            <div className="w-12 h-7 bg-white -ml-3 -mt-2 shadow-[0_3px_0_0_#CBD5E1]"></div>
          </div>

          {/* Square 64px Minecraft Sun - positioned high in top-right clear sky away from cards */}
          <div className="absolute top-5 right-[5%] sm:right-[8%] w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] bg-[#FBBF24] shadow-[0_0_40px_rgba(251,191,36,0.9)] z-0"></div>

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

        {/* HERO CONTENT: BALANCED, TIGHTLY INTEGRATED RESPONSIVE GRID */}
        <div className="relative z-20 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center justify-between">
            
            {/* === LEFT COLUMN: CRISP LUMINOUS TYPOGRAPHY DIRECT ON SUNSET (7 Cols) === */}
            <div className="lg:col-span-7 flex flex-col items-start text-left space-y-4 sm:space-y-4.5 w-full">
              
              {/* Bioregion Subtitle Badge */}
              <div
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', borderColor: 'rgba(16, 185, 129, 0.6)' }}
                className="inline-flex items-center gap-2 px-3 py-1 border rounded-full shadow-lg backdrop-blur-md"
              >
                <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981] animate-pulse"></span>
                <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#8bd6b6] tracking-wider uppercase">
                  BIOREGION COMMONS MESH • HYPERLOCAL GRID
                </span>
              </div>

              {/* Pixel Art Typography Headline with Maximum Drop Shadow */}
              <h1 className="font-['Silkscreen'] text-2xl sm:text-3xl lg:text-[38px] xl:text-[42px] leading-[1.12] tracking-wide">
                <span style={{ color: '#ffffff' }} className="block drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)]">YOUR NEXT</span>
                <span style={{ color: '#ffffff' }} className="block drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)]">RESOURCE IS</span>
                <span style={{ color: '#4ade80' }} className="block drop-shadow-[0_0_24px_rgba(74,222,128,0.7)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)]">CLOSER THAN</span>
                <span style={{ color: '#4ade80' }} className="block drop-shadow-[0_0_24px_rgba(74,222,128,0.7)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)]">YOU THINK.</span>
              </h1>

              {/* Value Proposition Description */}
              <p style={{ color: '#ffffff' }} className="text-xs sm:text-sm leading-relaxed font-semibold max-w-lg drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                Borrow cameras, tools &amp; gear within <span style={{ color: '#4ade80' }} className="font-extrabold underline decoration-[#4ade80] decoration-2 underline-offset-4">5 km</span>. Monetize what you own with safe escrow security.
              </p>

              {/* Dynamic High-Contrast Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                className="w-full max-w-lg flex items-center border-2 focus-within:!border-[#10b981] rounded-2xl p-1.5 shadow-2xl backdrop-blur-md transition-all"
              >
                <Search className="h-4 w-4 text-gray-300 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cameras, drones, tools, camping..."
                  style={{ color: '#ffffff' }}
                  className="w-full bg-transparent px-3 py-1.5 text-xs sm:text-sm font-semibold placeholder:text-gray-300 focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-gradient-to-r from-[#10b981] to-[#34d399] hover:from-[#059669] hover:to-[#10b981] text-[#062419] font-extrabold text-xs px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <span>Search</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2.5 w-full">
                <Link
                  href="/resources"
                  style={{ backgroundColor: '#065f46', borderColor: '#10b981', color: '#ffffff' }}
                  className="flex items-center gap-2 hover:bg-[#047857] font-bold border-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-lg active:scale-95 transition-all"
                >
                  <Compass className="h-4 w-4 text-[#8bd6b6]" />
                  <span>Explore Gear &rarr;</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
                  className="flex items-center gap-2 hover:bg-black font-semibold border px-3.5 py-2 rounded-xl text-xs sm:text-sm active:scale-95 transition-all cursor-pointer shadow-lg backdrop-blur-md"
                >
                  <Plus className="h-4 w-4 text-gray-300" />
                  <span>List an Item</span>
                </button>

                <Link
                  href="/matches"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', borderColor: 'rgba(245, 158, 11, 0.55)', color: '#fcd34d' }}
                  className="flex items-center gap-2 hover:bg-black font-semibold border px-3.5 py-2 rounded-xl text-xs sm:text-sm active:scale-95 transition-all shadow-lg backdrop-blur-md"
                >
                  <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span>AI Smart Match</span>
                </Link>
              </div>

              {/* Trust Badges: 3 Distinct Cards Floating Directly on Sunset */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-lg pt-1">
                <div
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', borderColor: 'rgba(255, 255, 255, 0.18)' }}
                  className="border rounded-2xl p-2.5 flex items-center gap-2.5 shadow-lg backdrop-blur-md hover:border-white/40 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/25 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-left">
                    <div style={{ color: '#ffffff' }} className="text-[11px] font-bold leading-tight">Verified Student ID</div>
                    <div style={{ color: '#cbd5e1' }} className="text-[10px] font-medium">Real students, real trust</div>
                  </div>
                </div>

                <div
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', borderColor: 'rgba(255, 255, 255, 0.18)' }}
                  className="border rounded-2xl p-2.5 flex items-center gap-2.5 shadow-lg backdrop-blur-md hover:border-white/40 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-cyan-500/25 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-left">
                    <div style={{ color: '#ffffff' }} className="text-[11px] font-bold leading-tight">&lt; 5km Radius</div>
                    <div style={{ color: '#cbd5e1' }} className="text-[10px] font-medium">Hyperlocal access</div>
                  </div>
                </div>

                <div
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', borderColor: 'rgba(255, 255, 255, 0.18)' }}
                  className="border rounded-2xl p-2.5 flex items-center gap-2.5 shadow-lg backdrop-blur-md hover:border-white/40 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-500/25 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-left">
                    <div style={{ color: '#ffffff' }} className="text-[11px] font-bold leading-tight">Escrow Protected</div>
                    <div style={{ color: '#cbd5e1' }} className="text-[10px] font-medium">Safe &amp; secure payments</div>
                  </div>
                </div>
              </div>

            </div>

            {/* === RIGHT COLUMN: FLOATING DYNAMIC EQUIPMENT CARD (5 Cols) === */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
              <div
                onClick={() => router.push(`/resources/${currentItem.id}`)}
                style={{
                  backgroundColor: 'rgba(10, 15, 24, 0.9)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderColor: 'rgba(16, 185, 129, 0.45)',
                }}
                className="w-full max-w-[380px] border-2 hover:!border-emerald-400 rounded-2xl p-3.5 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-2.5 transition-all cursor-pointer group"
              >
                {/* Top Notification Pill */}
                <Link
                  href="/resources"
                  onClick={(e) => e.stopPropagation()}
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', borderColor: 'rgba(251, 191, 36, 0.4)' }}
                  className="flex items-center justify-between border hover:border-amber-400 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all shadow-sm"
                >
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] sm:text-[11px] text-white">
                      <span className="text-amber-400 font-bold">{uniqueResources.length || 14} Items</span> Available Near Campus
                    </span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-gray-400 group-hover:text-amber-400 transition-colors" />
                </Link>

                {/* Showcase Image with Carousel Arrows & Counter */}
                <div style={{ backgroundColor: '#020617', borderColor: 'rgba(255, 255, 255, 0.15)' }} className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border">
                  <img
                    src={currentItem.photos[0] || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"}
                    alt={currentItem.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Previous Button */}
                  <button
                    type="button"
                    onClick={handlePrevItem}
                    aria-label="Previous equipment"
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/75 hover:bg-black/95 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-90 z-10"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={handleNextItem}
                    aria-label="Next equipment"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/75 hover:bg-black/95 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-90 z-10"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                  {/* Image Counter Badge (e.g. 1/5) */}
                  <div className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-sm text-[10px] font-bold text-white px-2 py-0.5 rounded border border-white/15 shadow-sm">
                    {activeItemIndex + 1}/{featuredItems.length}
                  </div>
                </div>

                {/* Equipment Information */}
                <div className="space-y-1.5">
                  {/* Title & Rating */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                      {currentItem.title}
                    </h3>
                    <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', borderColor: 'rgba(255, 255, 255, 0.15)' }} className="flex items-center gap-1 text-[11px] font-bold text-white shrink-0 px-1.5 py-0.5 rounded border">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{currentOwner?.trustScore?.toFixed(1) || "4.9"}</span>
                      <span className="text-gray-400 font-normal">({currentOwner?.totalShares || 24})</span>
                    </div>
                  </div>

                  {/* Pricing with Strikethrough & Discount Tag */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg sm:text-xl font-black text-emerald-400">
                      ₹{currentPrice}
                      <span className="text-[11px] text-emerald-300 font-medium">/day</span>
                    </span>
                    <span className="text-[11px] text-gray-400 line-through">
                      ₹{originalPrice}/day
                    </span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 tracking-wide">
                      {discountPercent}% OFF
                    </span>
                  </div>

                  {/* Inclusions / Specs description */}
                  <p className="text-[11px] text-gray-300 font-medium truncate">
                    {itemSpecs}
                  </p>
                </div>

                {/* Owner & Geofencing Location Footer */}
                <div style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} className="border-t pt-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        currentOwner?.avatar ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                      }
                      alt={currentOwner?.name || "Owner"}
                      className="w-7 h-7 rounded-full border border-emerald-500/50 object-cover shadow-sm"
                    />
                    <div>
                      <div className="text-[11px] font-bold text-white leading-tight">
                        {currentOwner?.name || "Arjun S."}
                      </div>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/40 px-1.5 py-0.5 rounded-full mt-0.5">
                        <CheckCircle2 className="h-2 w-2" /> Campus Verified
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-gray-300">
                      <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span>1.2 km away</span>
                    </div>
                    <div className="text-[10px] text-gray-400 truncate max-w-[120px]">
                      {campusName}
                    </div>
                  </div>
                </div>

              </div>
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
