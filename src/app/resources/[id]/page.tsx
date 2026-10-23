"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  Truck,
  UserCheck,
  Lock,
  Layers,
  Heart,
  ZoomIn,
  X,
} from "lucide-react";
import { MOCK_RESOURCES, MOCK_USERS, CATEGORIES } from "@/data/mockData";
import { User } from "@/lib/types";
import { formatDistance, formatPrice, haversine } from "@/lib/utils";
import { BookingModal } from "@/components/BookingModal";
import { useRole } from "@/lib/roleContext";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResourceDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { resources, currentUser, isLoggedIn, openAuthModal } = useRole();

  const resource = resources.find((r) => r.id === id) || MOCK_RESOURCES.find((r) => r.id === id) || resources[0] || MOCK_RESOURCES[0];
  const isMine =
    Boolean(currentUser) &&
    (resource.ownerId === currentUser.id ||
      resource.ownerId === currentUser.name ||
      (currentUser.id !== "u_khaleeq" && resource.id.startsWith("r_")));

  const owner: User = isMine
    ? {
        id: currentUser.id,
        name: currentUser.name,
        college: currentUser.neighborhood || "Campus Hub",
        avatar: currentUser.avatar,
        trustScore: currentUser.trustScore || 4.9,
        totalShares: 14,
        totalBorrows: 8,
        isVerified: true,
        phoneVerified: true,
        collegeVerified: true,
        disputesCount: 0,
        location: { lat: 18.5204, lng: 73.8567, campus: currentUser.neighborhood || "Campus Hub" },
      }
    : MOCK_USERS.find((u) => u.id === resource.ownerId) || MOCK_USERS[0];
  const categoryMeta = CATEGORIES.find((c) => c.id === resource.category);

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [days, setDays] = useState(1);
  const [fulfillmentMode, setFulfillmentMode] = useState<"pickup" | "courier">("courier");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);

  // High-value check (> ₹10,000 asset value, or cameras / laptops / projectors)
  const isHighValue =
    resource.category === "tech" ||
    resource.category === "laptop" ||
    resource.deposit >= 1000;

  const rate = resource.pricePerDay;
  const subtotal = rate * days;
  const deposit = resource.deposit;
  const deliveryFee = fulfillmentMode === "courier" ? 40 : 0;
  const totalEscrow = subtotal + deposit + deliveryFee;

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Link href="/resources" className="flex items-center gap-1 font-bold text-slate-700 hover:text-emerald-800">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Spatial Catalog</span>
          </Link>
          <span>/</span>
          <span className="capitalize">{categoryMeta?.name || resource.category}</span>
          <span>/</span>
          <span className="font-semibold text-slate-900 truncate max-w-xs">{resource.title}</span>
        </div>

        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`flex items-center gap-1 rounded-xl border-2 px-3 py-1.5 font-bold transition-all uppercase tracking-wider font-mono cursor-pointer ${
            isSaved
              ? "bg-[#2a1414] text-[#f87171] border-[#5a2020]"
              : "bg-[#1c1b1b] text-[#e5e2e1] border-[#2a2a2a] hover:bg-[#252525]"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${isSaved ? "fill-rose-500" : ""}`} />
          <span>{isSaved ? "Saved" : "Save Asset"}</span>
        </button>
      </div>

      {/* HIGH-VALUE RISK WARNING BANNER (SCREEN 6) */}
      {isHighValue && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-[#2a2004] border-2 border-[#4a3505] p-4 text-xs text-[#fbbf24] shadow-[0_4px_0_0_#0f0f0f]">
          <AlertTriangle className="h-5 w-5 text-[#fbbf24] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-white uppercase tracking-wider font-['Silkscreen']">
              High-Value Equipment Risk Protocol Active
            </div>
            <p className="leading-relaxed text-[#bec9c2]">
              Additional government ID verification, encrypted serial number check, and mutual 6-digit Redis OTP handoff are strictly required for this rental. Zero unauthorized substitutions.
            </p>
          </div>
        </div>
      )}

      {/* Main Layout (Left Details, Right Sticky Widget) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Media & Specifications (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo Gallery — Uncropped Studio Presentation */}
          <div className="overflow-hidden rounded-2xl border-2 border-[#2a2a2a] bg-[#121212] shadow-[0_6px_0_0_#0f0f0f]">
            <div
              onClick={() => setIsLightBoxOpen(true)}
              className="relative min-h-[360px] sm:min-h-[440px] aspect-[4/3] sm:aspect-[16/10] w-full flex items-center justify-center overflow-hidden p-4 cursor-pointer group"
              title="Click to view original uncropped photo"
            >
              {/* Studio Stage Radial Backdrop */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#242424_0%,_#0f0f0f_100%)] pointer-events-none" />

              {/* Main Product Image — Complete Uncropped & Razor Sharp */}
              <img
                src={resource.photos[activePhotoIdx] || resource.photos[0] || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80";
                }}
                alt={resource.title}
                className="relative z-10 max-h-[400px] max-w-full object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
              />

              {/* Condition Badge */}
              <span className="absolute top-3 left-3 rounded-xl bg-black/85 px-3 py-1 text-xs font-mono font-bold text-[#8bd6b6] backdrop-blur-md border border-[#2a2a2a] z-20">
                Condition: {resource.condition.replace("_", " ").toUpperCase()}
              </span>

              {/* Inspect Full Photo Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightBoxOpen(true);
                }}
                className="absolute top-3 right-3 flex items-center gap-1.5 rounded-xl bg-black/85 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md border border-[#2a2a2a] hover:bg-[#065f46] transition-colors z-20 cursor-pointer shadow-sm"
              >
                <ZoomIn className="h-3.5 w-3.5 text-[#8bd6b6]" />
                <span className="hidden sm:inline">Inspect HD</span>
              </button>
            </div>

            {resource.photos.length > 1 && (
              <div className="flex gap-2 p-3 bg-[#161616] border-t border-[#262626]">
                {resource.photos.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative h-16 w-20 rounded-xl overflow-hidden border-2 transition-all bg-[#101010] flex items-center justify-center p-1 ${
                      activePhotoIdx === idx ? "border-[#065f46] ring-2 ring-[#065f46]/30" : "opacity-60 border-[#2a2a2a]"
                    }`}
                  >
                    <img src={p} alt="" className="max-h-full max-w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Specs Card */}
          <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-[0_6px_0_0_#0f0f0f] space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-md bg-[#065f46]/40 px-2 py-0.5 text-xs font-mono font-bold text-[#8bd6b6] border border-[#065f46]">
                  {categoryMeta?.name || resource.category}
                </span>
                <span className="text-xs text-[#89938d] flex items-center gap-1 font-mono">
                  <MapPin className="h-3 w-3 text-[#8bd6b6]" />
                  {resource.location.campus} &bull; Approx. 2.26 km away
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white font-pixel tracking-wider uppercase">
                {resource.title}
              </h1>
            </div>

            <p className="text-sm text-[#bec9c2] leading-relaxed font-normal">
              {resource.description}
            </p>

            {/* Specifications */}
            {resource.features && (
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#bec9c2] mb-2 font-mono">
                  Verified Technical Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {resource.features.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-xl bg-[#141414] p-2.5 border border-[#2a2a2a] font-medium text-[#e5e2e1] shadow-[inset_1px_1px_0_#202020]"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[#8bd6b6] shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Usage Guidelines */}
            <div className="rounded-xl bg-[#141414] p-4 border border-[#2a2a2a] text-xs shadow-[inset_1px_1px_0_#202020]">
              <div className="font-bold text-white mb-1 font-mono uppercase tracking-wider">Equipment Care Protocol:</div>
              <p className="text-[#bec9c2] leading-relaxed">
                {resource.instructions} Return with battery charged. Mutual Redis OTP generated upon return handoff.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Booking Widget (Responsive Sticky on Desktop) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="lg:sticky lg:top-20 relative top-0 rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-4 sm:p-6 shadow-[0_8px_0_0_#0f0f0f] space-y-5">
            {/* Header: Price & Security Deposit */}
            <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#89938d]">
                  Daily Rental Rate
                </div>
                <div className="text-2xl font-bold text-white font-pixel tracking-wide">
                  {formatPrice(resource.pricePerDay)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#89938d]">
                  Refundable Deposit
                </div>
                <div className="text-sm font-bold text-[#8bd6b6] font-mono">
                  ₹{resource.deposit} (Held in Escrow)
                </div>
              </div>
            </div>

            {/* Fulfillment Mode: Delivery vs Pickup */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#89938d] mb-2 font-mono">
                Handoff Fulfillment Mode
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFulfillmentMode("courier")}
                  className={`flex items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer uppercase tracking-wider font-mono ${
                    fulfillmentMode === "courier"
                      ? "border-[#8bd6b6] bg-[#065f46]/40 text-white shadow-[0_2px_0_0_#003828]"
                      : "border-[#2a2a2a] bg-[#141414] text-[#89938d] hover:text-[#e5e2e1]"
                  }`}
                >
                  <Truck className="h-4 w-4" />
                  <span>Courier (+₹40)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentMode("pickup")}
                  className={`flex items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer uppercase tracking-wider font-mono ${
                    fulfillmentMode === "pickup"
                      ? "border-[#8bd6b6] bg-[#065f46]/40 text-white shadow-[0_2px_0_0_#003828]"
                      : "border-[#2a2a2a] bg-[#141414] text-[#89938d] hover:text-[#e5e2e1]"
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  <span>Peer Pickup (₹0)</span>
                </button>
              </div>
            </div>

            {/* Duration Selector */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#bec9c2] mb-1.5 font-mono">
                <span>Rental Duration</span>
                <span>{days} {days === 1 ? "day" : "days"}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-[#2a2a2a] p-2 bg-[#141414] shadow-[inset_1px_1px_0_#202020]">
                <button
                  onClick={() => setDays(Math.max(1, days - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#201f1f] border border-[#353534] font-bold text-white hover:bg-[#2a2a2a] cursor-pointer"
                >
                  -
                </button>
                <div className="flex-1 text-center font-black text-sm text-white font-mono">
                  {days} Days
                </div>
                <button
                  onClick={() => setDays(Math.min(14, days + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#201f1f] border border-[#353534] font-bold text-white hover:bg-[#2a2a2a] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Escrow Breakdown Box */}
            <div className="rounded-xl bg-[#141414] p-4 space-y-2 text-xs border border-[#2a2a2a] shadow-[inset_1px_1px_0_#202020]">
              <div className="flex justify-between text-[#89938d]">
                <span>Rental Fee (₹{rate} &times; {days}d)</span>
                <span className="font-semibold text-white font-mono">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[#89938d]">
                <span>Refundable Deposit (Escrow lock)</span>
                <span className="font-semibold text-white font-mono">₹{deposit}</span>
              </div>
              {fulfillmentMode === "courier" && (
                <div className="flex justify-between text-[#89938d]">
                  <span>Hyperlocal Cargo Bike Courier</span>
                  <span className="font-semibold text-white font-mono">₹40</span>
                </div>
              )}
              <div className="border-t border-[#2a2a2a] pt-2 flex justify-between font-black text-sm">
                <span className="text-white font-['Silkscreen']">Total Escrow Hold</span>
                <span className="text-[#8bd6b6] font-mono">₹{totalEscrow}</span>
              </div>
              <div className="text-[10px] text-[#89938d]">
                * Deposit automatically unlocks upon verified return OTP handoff.
              </div>
            </div>

            {/* OWNER CARD (SCREEN 6) */}
            <div className="rounded-xl bg-[#141414] p-3.5 border border-[#2a2a2a] shadow-[inset_1px_1px_0_#202020]">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#89938d] mb-2">
                Equipment Owner
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={owner.avatar}
                    alt={owner.name}
                    className="h-10 w-10 rounded-xl object-cover ring-2 ring-[#065f46]/40 border border-[#2a2a2a]"
                  />
                  <div>
                    <div className="font-bold text-xs text-white">{owner.name}</div>
                    <div className="text-[10px] text-[#8bd6b6] font-bold font-mono">
                      Established Trust ★ {owner.trustScore} (12 reviews)
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 text-[10px] font-bold text-[#8bd6b6] font-mono">
                  <span className="rounded bg-[#0e0e0e] px-1.5 py-0.5 border border-[#2a2a2a]">✓ ID</span>
                  <span className="rounded bg-[#0e0e0e] px-1.5 py-0.5 border border-[#2a2a2a]">✓ Phone</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            {isMine ? (
              <Link
                href="/dashboard?tab=listings"
                className="w-full block text-center rounded-xl bg-[#065f46]/30 border-2 border-[#065f46] py-3.5 text-xs sm:text-sm font-bold text-[#8bd6b6] uppercase tracking-wider font-['Silkscreen'] hover:bg-[#065f46]/50 transition-all"
              >
                You Own This Equipment (Manage Listing)
              </Link>
            ) : (
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    openAuthModal("login");
                    return;
                  }
                  setIsBookingOpen(true);
                }}
                className="w-full rounded-xl bg-[#065f46] hover:bg-[#047857] py-3.5 text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-['Silkscreen'] border-2 border-[#047857] shadow-[0_4px_0_0_#003828] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                Request Booking
              </button>
            )}
          </div>
        </div>
      </div>

      <BookingModal
        resource={resource}
        owner={owner}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      {/* Full-Screen High-Resolution Lightbox Modal */}
      {isLightBoxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setIsLightBoxOpen(false)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsLightBoxOpen(false)}
              className="absolute -top-12 right-0 flex items-center gap-1.5 rounded-full bg-[#1c1b1b] border border-[#333] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-600 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span>Close View</span>
            </button>
            <div className="rounded-3xl border-2 border-[#2a2a2a] bg-[#101010] p-4 shadow-2xl flex items-center justify-center max-h-[84vh] overflow-hidden">
              <img
                src={resource.photos[activePhotoIdx] || resource.photos[0]}
                alt={resource.title}
                className="max-h-[80vh] max-w-full object-contain rounded-2xl drop-shadow-2xl"
              />
            </div>
            <div className="mt-3 text-center">
              <h3 className="text-base font-bold text-white font-mono">{resource.title}</h3>
              <p className="text-xs text-[#8bd6b6] font-mono">Photo {activePhotoIdx + 1} of {resource.photos.length} &bull; 100% Uncropped Original</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
