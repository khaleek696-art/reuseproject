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
          className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 font-bold transition-all ${
            isSaved ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-white text-slate-600 border-slate-200"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${isSaved ? "fill-rose-500" : ""}`} />
          <span>{isSaved ? "Saved" : "Save Asset"}</span>
        </button>
      </div>

      {/* HIGH-VALUE RISK WARNING BANNER (SCREEN 6) */}
      {isHighValue && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 shadow-2xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-black text-amber-950 uppercase tracking-wide">
              High-Value Equipment Risk Protocol Active
            </div>
            <p className="leading-relaxed">
              Additional government ID verification, encrypted serial number check, and mutual 6-digit Redis OTP handoff are strictly required for this rental. Zero unauthorized substitutions.
            </p>
          </div>
        </div>
      )}

      {/* Main Layout (Left Details, Right Sticky Widget) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Media & Specifications (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo Gallery */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-xs">
            <div className="relative aspect-[16/10] w-full">
              <img
                src={resource.photos[activePhotoIdx] || resource.photos[0] || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80";
                }}
                alt={resource.title}
                className="h-full w-full object-cover"
              />
              <span className="absolute top-3 left-3 rounded-xl bg-slate-950/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                Condition: {resource.condition.replace("_", " ").toUpperCase()}
              </span>
            </div>

            {resource.photos.length > 1 && (
              <div className="flex gap-2 p-3 bg-white border-t border-slate-100">
                {resource.photos.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative h-16 w-20 rounded-xl overflow-hidden border-2 transition-all ${
                      activePhotoIdx === idx ? "border-emerald-600 ring-2 ring-emerald-600/20" : "opacity-60"
                    }`}
                  >
                    <img src={p} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Specs Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                  {categoryMeta?.name || resource.category}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-700" />
                  {resource.location.campus} &bull; Approx. 2.26 km away
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {resource.title}
              </h1>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {resource.description}
            </p>

            {/* Specifications */}
            {resource.features && (
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Verified Technical Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {resource.features.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-200 font-medium text-slate-800"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Usage Guidelines */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs">
              <div className="font-bold text-slate-900 mb-1">Equipment Care Protocol:</div>
              <p className="text-slate-600 leading-relaxed">
                {resource.instructions} Return with battery charged. Mutual Redis OTP generated upon return handoff.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Widget (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-20 rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-xl space-y-5">
            {/* Header: Price & Security Deposit */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Daily Rental Rate
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {formatPrice(resource.pricePerDay)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Refundable Deposit
                </div>
                <div className="text-sm font-bold text-emerald-800">
                  ₹{resource.deposit} (Held in Escrow)
                </div>
              </div>
            </div>

            {/* Fulfillment Mode: Delivery vs Pickup */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Handoff Fulfillment Mode
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFulfillmentMode("courier")}
                  className={`flex items-center justify-center gap-1.5 p-3 rounded-xl border transition-all ${
                    fulfillmentMode === "courier"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Truck className="h-4 w-4" />
                  <span>Cargo Courier (+₹40)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentMode("pickup")}
                  className={`flex items-center justify-center gap-1.5 p-3 rounded-xl border transition-all ${
                    fulfillmentMode === "pickup"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  <span>Direct Peer Pickup (₹0)</span>
                </button>
              </div>
            </div>

            {/* Duration Selector */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Rental Duration</span>
                <span>{days} {days === 1 ? "day" : "days"}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-2 bg-slate-50">
                <button
                  onClick={() => setDays(Math.max(1, days - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 font-bold"
                >
                  -
                </button>
                <div className="flex-1 text-center font-black text-sm">
                  {days} Days
                </div>
                <button
                  onClick={() => setDays(Math.min(14, days + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Escrow Breakdown Box */}
            <div className="rounded-2xl bg-slate-50 p-4 space-y-2 text-xs border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Rental Fee (₹{rate} &times; {days}d)</span>
                <span className="font-semibold text-slate-800">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Refundable Deposit (Escrow lock)</span>
                <span className="font-semibold text-slate-800">₹{deposit}</span>
              </div>
              {fulfillmentMode === "courier" && (
                <div className="flex justify-between text-slate-600">
                  <span>Hyperlocal Cargo Bike Courier</span>
                  <span className="font-semibold text-slate-800">₹40</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-sm">
                <span>Total Escrow Hold</span>
                <span className="text-emerald-800">₹{totalEscrow}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                * Deposit automatically unlocks upon verified return OTP handoff.
              </div>
            </div>

            {/* OWNER CARD (SCREEN 6) */}
            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Equipment Owner
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={owner.avatar}
                    alt={owner.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">{owner.name}</div>
                    <div className="text-[10px] text-emerald-800 font-bold">
                      Established Trust ★ {owner.trustScore} (12 reviews)
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 text-[10px] font-bold text-emerald-800">
                  <span className="rounded bg-white px-1.5 py-0.5 border border-slate-200">✓ ID</span>
                  <span className="rounded bg-white px-1.5 py-0.5 border border-slate-200">✓ Phone</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            {isMine ? (
              <Link
                href="/dashboard?tab=listings"
                className="w-full block text-center rounded-2xl bg-emerald-50 border border-emerald-300 py-3.5 text-sm font-bold text-emerald-900 shadow-sm hover:bg-emerald-100 transition-all"
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
                className="w-full rounded-2xl bg-emerald-800 hover:bg-emerald-900 py-3.5 text-sm font-bold text-white shadow-md active:scale-95 transition-all"
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
    </div>
  );
}
