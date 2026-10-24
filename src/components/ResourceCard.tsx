"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  ShieldCheck,
  Star,
  Clock,
  ArrowUpRight,
  Heart,
  ZoomIn,
  X,
} from "lucide-react";
import { Resource, User } from "@/lib/types";
import { formatDistance, formatPrice, haversine } from "@/lib/utils";
import { MOCK_USERS, MOCK_RESOURCES } from "@/data/mockData";
import { useRole } from "@/lib/roleContext";

interface ResourceCardProps {
  resource: Resource;
  owner?: User;
  userCoords?: { lat: number; lng: number };
}

const conditionMap = {
  brand_new: { label: "Brand New", badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  like_new: { label: "Like New", badgeClass: "bg-emerald-500/20 text-[#8bd6b6] border-emerald-500/30" },
  good: { label: "Good Condition", badgeClass: "bg-amber-500/20 text-[#fbbf24] border-amber-500/30" },
  fair: { label: "Functional", badgeClass: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
};

const FALLBACK_PHOTO = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80";

export function ResourceCard({
  resource,
  owner: propOwner,
  userCoords = { lat: 18.5204, lng: 73.8567 },
}: ResourceCardProps) {
  const { currentUser } = useRole();
  const [isLiked, setIsLiked] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState(resource.photos?.[0] || FALLBACK_PHOTO);

  React.useEffect(() => {
    setImgSrc(resource.photos?.[0] || FALLBACK_PHOTO);
  }, [resource.photos]);

  const isMine =
    Boolean(currentUser) &&
    Boolean(currentUser.id) &&
    (
      (Boolean(resource.ownerId) && (resource.ownerId === currentUser.id || resource.ownerId === currentUser.name)) ||
      (Boolean(propOwner?.id) && (propOwner?.id === currentUser.id || propOwner?.name === currentUser.name))
    );

  const owner = useMemo(() => {
    if (isMine) {
      return {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        trustScore: currentUser.trustScore || 4.9,
        isVerified: true,
      };
    }
    if (propOwner) return propOwner;

    // 1. Direct ID match in MOCK_USERS
    const foundUser = MOCK_USERS.find(
      (u) => u.id === resource.ownerId || u.name === resource.ownerId
    );
    if (foundUser) return foundUser;

    // 2. Check if resource.ownerName is a valid real person's name
    const rawName = (resource.ownerName || "").trim();
    const isPlaceholder =
      !rawName ||
      rawName.toLowerCase().includes("verified") ||
      rawName.toLowerCase().includes("campus lender") ||
      rawName.toLowerCase().includes("owner");

    if (!isPlaceholder) {
      return {
        id: resource.ownerId || "u_owner_custom",
        name: rawName,
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
        trustScore: 4.8,
        isVerified: true,
      };
    }

    // 3. Match from MOCK_RESOURCES by resource.id
    const mockRes = MOCK_RESOURCES.find((m) => m.id === resource.id);
    if (mockRes) {
      const mockOwner = MOCK_USERS.find((u) => u.id === mockRes.ownerId);
      if (mockOwner) return mockOwner;
    }

    // 4. Deterministic mapping based on equipment title / category
    const title = (resource.title || "").toLowerCase();
    if (title.includes("macbook") || title.includes("laptop")) {
      return MOCK_USERS.find((u) => u.id === "u4") || MOCK_USERS[4]; // Sneha Patel
    }
    if (title.includes("calculator") || title.includes("casio")) {
      return MOCK_USERS.find((u) => u.id === "u1") || MOCK_USERS[1]; // Rahul Sharma
    }
    if (title.includes("tent") || title.includes("camp") || title.includes("outdoor")) {
      return MOCK_USERS.find((u) => u.id === "u5") || MOCK_USERS[5]; // Rohan Deshmukh
    }
    if (title.includes("drill") || title.includes("tool")) {
      return MOCK_USERS.find((u) => u.id === "u11") || MOCK_USERS[11]; // Devendra Patil
    }
    if (title.includes("camera") || title.includes("dslr") || title.includes("lens") || title.includes("sony") || title.includes("canon")) {
      return MOCK_USERS.find((u) => u.id === "u1") || MOCK_USERS[1]; // Rahul Sharma
    }
    if (title.includes("speaker") || title.includes("bose") || title.includes("mic") || title.includes("audio") || title.includes("acoustic")) {
      return MOCK_USERS.find((u) => u.id === "u6") || MOCK_USERS[6]; // Ananya Iyer
    }
    if (title.includes("projector") || title.includes("epson")) {
      return MOCK_USERS.find((u) => u.id === "u7") || MOCK_USERS[7]; // Vikram Joshi
    }

    // 5. Default fallback to Rahul Sharma
    return MOCK_USERS.find((u) => u.id === "u1") || MOCK_USERS[1];
  }, [isMine, currentUser, propOwner, resource]);

  const distance = haversine(
    userCoords.lat,
    userCoords.lng,
    resource.location.lat,
    resource.location.lng
  );

  const conditionMeta = conditionMap[resource.condition] || conditionMap.good;
  const isFree = resource.pricePerDay === 0;

  return (
    <>
      <div className="card-hover-lift group relative flex flex-col rounded-2xl border border-[#2a2a2a] bg-[#201f1f] p-3 shadow-[0_4px_0_0_#0e0e0e] hover:shadow-[0_6px_0_0_#003828] hover:border-[#353534] transition-all">
      {/* Top Accent Stripe */}
      <div className="h-1 w-full bg-[#65A832] rounded-t-sm -mt-1 mb-2.5 opacity-90"></div>

      {/* Visual Media Container — 100% Uncropped Studio Stage with Lightbox */}
      <div
        onClick={() => setIsZoomOpen(true)}
        className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#141414] shadow-[inset_2px_2px_0_#0e0e0e,inset_-2px_-2px_0_#2a2a2a] border border-[#262626] flex items-center justify-center p-3 group/img cursor-pointer"
        title="Click to view full uncropped image"
      >
        {/* Studio Stage Radial Backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#242424_0%,_#0f0f0f_100%)] pointer-events-none" />

        {/* Main Product Image — Complete Uncropped & Razor Sharp */}
        <img
          src={imgSrc}
          onError={() => setImgSrc(FALLBACK_PHOTO)}
          alt={resource.title}
          className="relative z-10 max-h-full max-w-full object-contain transition-transform duration-300 group-hover/img:scale-105 drop-shadow-md"
          loading="lazy"
        />

        {/* Top Floating Glass Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-20">
          {/* Condition tag */}
          <span
            className={`pointer-events-auto inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider backdrop-blur-md bg-[#0e0e0e]/90 border ${conditionMeta.badgeClass}`}
          >
            {conditionMeta.label}
          </span>

          {/* Quick Actions (Zoom + Heart) */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomOpen(true);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0e0e0e]/85 backdrop-blur-md border border-[#2a2a2a] text-[#bec9c2] shadow-sm hover:scale-110 hover:text-white active:scale-95 transition-all cursor-pointer"
              title="Inspect Full Photo"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0e0e0e]/85 backdrop-blur-md border border-[#2a2a2a] text-[#bec9c2] shadow-sm hover:scale-110 active:scale-95 transition-all cursor-pointer"
              aria-label="Save item"
            >
              <Heart
                className={`h-3.5 w-3.5 ${
                  isLiked ? "fill-rose-500 text-rose-500" : "text-[#bec9c2]"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Card Body Details */}
      <div className="flex flex-1 flex-col pt-3 px-1 pb-1">
        {/* Metadata Row: Category + Distance + Handover Hours (Unobstructed) */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-[#8bd6b6] uppercase tracking-wider">
              {resource.category}
            </span>
            {isFree && (
              <span className="rounded bg-[#065f46] px-1.5 py-0.5 text-[9px] font-extrabold text-[#8bd6b6] uppercase tracking-wider">
                100% Free
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span className="inline-flex items-center gap-1 text-[#8bd6b6]">
              <MapPin className="h-3 w-3" />
              <span>{formatDistance(distance)}</span>
            </span>
            {resource.availableFrom && (
              <span className="inline-flex items-center gap-1 text-[#fbbf24]">
                <Clock className="h-2.5 w-2.5" />
                <span>{resource.availableFrom}-{resource.availableTo}</span>
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <Link
          href={`/resource/${resource.id}`}
          className="text-sm font-bold font-headline-sm text-[#e5e2e1] hover:text-[#8bd6b6] transition-colors line-clamp-1 leading-snug"
        >
          {resource.title}
        </Link>

        {/* Short Specs / Description */}
        <p className="mt-1 text-xs text-[#9ca3af] line-clamp-2 leading-relaxed font-normal">
          {resource.description}
        </p>

        {/* Rate & Deposit Inset Wells */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <div className="bg-[#1c1b1b] p-2 rounded-lg border border-[#2a2a2a] shadow-[inset_1px_1px_0_#0e0e0e]">
            <div className="text-[10px] font-mono uppercase text-[#89938d]">Daily Rate</div>
            <div className="text-xs font-mono font-bold text-[#fbbf24]">
              {isFree ? "Free" : formatPrice(resource.pricePerDay)}
            </div>
          </div>
          <div className="bg-[#1c1b1b] p-2 rounded-lg border border-[#2a2a2a] shadow-[inset_1px_1px_0_#0e0e0e]">
            <div className="text-[10px] font-mono uppercase text-[#89938d]">Lock Deposit</div>
            <div className="text-xs font-mono font-bold text-[#e5e2e1] truncate">
              🔒 ₹{resource.deposit || Math.round((resource.pricePerDay || 100) * 2.5)}
            </div>
          </div>
        </div>

        {/* Footer: Owner Trust + CTA */}
        <div className="mt-auto pt-2.5 border-t border-[#2a2a2a] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <img
                src={owner.avatar}
                alt={owner.name}
                className="h-6 w-6 rounded-full object-cover ring-1 ring-[#3a3a3a]"
              />
              {owner.isVerified && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#065f46] text-white">
                  <ShieldCheck className="h-1.5 w-1.5" />
                </span>
              )}
            </div>
            <span
              className="text-xs font-semibold text-[#bec9c2] truncate max-w-[100px] sm:max-w-[125px]"
              title={owner.name}
            >
              {owner.name}
            </span>
            <div className="flex items-center gap-0.5 rounded bg-[#2a2004] px-1.5 py-0.5 text-[10px] font-bold text-[#fbbf24] border border-[#4a3505]">
              <Star className="h-2.5 w-2.5 fill-[#fbbf24] text-[#fbbf24]" />
              <span>{owner.trustScore}</span>
            </div>
          </div>

          {/* Borrow CTA vs Owner's Listing Badge */}
          {isMine ? (
            <Link
              href={`/resource/${resource.id}`}
              className="flex items-center gap-1 rounded-lg bg-[#065f46]/30 hover:bg-[#065f46]/50 border border-[#065f46] px-2.5 py-1 text-xs font-bold text-[#8bd6b6] transition-all"
            >
              <span>Your Item</span>
              <ArrowUpRight className="h-3 w-3 text-[#8bd6b6]" />
            </Link>
          ) : (
            <Link
              href={`/resource/${resource.id}`}
              className="flex items-center gap-1 rounded-lg bg-[#065f46] hover:bg-[#047857] text-white border border-[#047857] px-2.5 py-1 text-xs font-bold font-headline-sm uppercase tracking-wider transition-all shadow-[0_2px_0_0_#003828] active:translate-y-0.5"
            >
              <span>Borrow</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>

      {/* Full-Screen High-Resolution Lightbox Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute -top-12 right-0 flex items-center gap-1.5 rounded-full bg-[#1c1b1b] border border-[#333] px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-600 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span>Close View</span>
            </button>
            <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#101010] p-3 shadow-2xl flex items-center justify-center max-h-[82vh] overflow-hidden">
              <img
                src={imgSrc}
                alt={resource.title}
                className="max-h-[78vh] max-w-full object-contain rounded-xl drop-shadow-2xl"
              />
            </div>
            <div className="mt-3 text-center">
              <h3 className="text-sm font-bold text-white font-mono">{resource.title}</h3>
              <p className="text-[11px] text-[#8bd6b6] font-mono">100% Original High-Resolution Uncropped Gear Photo</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
// RE:USE — Modular Circular Economy Architecture
