"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  ShieldCheck,
  Star,
  Clock,
  ArrowUpRight,
  Heart,
} from "lucide-react";
import { Resource, User } from "@/lib/types";
import { formatDistance, formatPrice, haversine } from "@/lib/utils";
import { MOCK_USERS } from "@/data/mockData";
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
  const [imgSrc, setImgSrc] = useState(resource.photos?.[0] || FALLBACK_PHOTO);

  React.useEffect(() => {
    setImgSrc(resource.photos?.[0] || FALLBACK_PHOTO);
  }, [resource.photos]);

  const isMine =
    Boolean(currentUser) &&
    (resource.ownerId === currentUser.id ||
      resource.ownerId === currentUser.name ||
      propOwner?.id === currentUser.id ||
      propOwner?.name === currentUser.name ||
      (currentUser.id !== "u_khaleeq" && resource.id.startsWith("r_")));

  const owner = isMine
    ? {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        trustScore: currentUser.trustScore || 4.9,
        isVerified: true,
      }
    : propOwner ||
      MOCK_USERS.find((u) => u.id === resource.ownerId) ||
      MOCK_USERS[0];

  const distance = haversine(
    userCoords.lat,
    userCoords.lng,
    resource.location.lat,
    resource.location.lng
  );

  const conditionMeta = conditionMap[resource.condition] || conditionMap.good;
  const isFree = resource.pricePerDay === 0;

  return (
    <div className="card-hover-lift group relative flex flex-col rounded-2xl border border-[#2a2a2a] bg-[#201f1f] p-3 shadow-[0_4px_0_0_#0e0e0e] hover:shadow-[0_6px_0_0_#003828] hover:border-[#353534] transition-all">
      {/* Top Accent Stripe */}
      <div className="h-1 w-full bg-[#65A832] rounded-t-sm -mt-1 mb-2.5 opacity-90"></div>

      {/* Visual Media Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#0e0e0e] shadow-[inset_2px_2px_0_#0e0e0e,inset_-2px_-2px_0_#2a2a2a]">
        <img
          src={imgSrc}
          onError={() => setImgSrc(FALLBACK_PHOTO)}
          alt={resource.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Floating Glass Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Condition tag */}
          <span
            className={`pointer-events-auto inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider backdrop-blur-md bg-[#0e0e0e]/90 border ${conditionMeta.badgeClass}`}
          >
            {conditionMeta.label}
          </span>

          {/* Quick Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-lg bg-[#0e0e0e]/80 backdrop-blur-md border border-[#2a2a2a] text-[#bec9c2] shadow-sm hover:scale-110 active:scale-95 transition-all"
            aria-label="Save item"
          >
            <Heart
              className={`h-3.5 w-3.5 ${
                isLiked ? "fill-rose-500 text-rose-500" : "text-[#bec9c2]"
              }`}
            />
          </button>
        </div>

        {/* Bottom Distance & Handover Hours Tag */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono text-white pointer-events-none">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#0e0e0e]/90 px-2 py-0.5 backdrop-blur-md border border-[#2a2a2a] text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8bd6b6] animate-pulse" />
            <MapPin className="h-3 w-3 text-[#8bd6b6]" />
            <span>{formatDistance(distance)}</span>
          </span>

          {resource.availableFrom && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#0e0e0e]/90 px-2 py-0.5 backdrop-blur-md border border-[#2a2a2a] text-[10px] text-[#fbbf24]">
              <Clock className="h-2.5 w-2.5 text-[#fbbf24]" />
              <span>{resource.availableFrom}-{resource.availableTo}</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Body Details */}
      <div className="flex flex-1 flex-col pt-3 px-1 pb-1">
        {/* Category & Title */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold text-[#8bd6b6] uppercase tracking-wider">
            {resource.category}
          </span>
          {isFree && (
            <span className="rounded bg-[#065f46] px-1.5 py-0.5 text-[9px] font-extrabold text-[#8bd6b6] uppercase tracking-wider">
              100% Free
            </span>
          )}
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
              {isFree ? "Free" : formatPrice(resource.pricePerDay)}/day
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
            <span className="text-xs font-semibold text-[#bec9c2] line-clamp-1">
              {owner.name.split(" ")[0]}
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
  );
}
