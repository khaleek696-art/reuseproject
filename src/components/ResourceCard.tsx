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
  brand_new: { label: "Brand New", badgeClass: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  like_new: { label: "Like New", badgeClass: "bg-emerald-500/10 text-emerald-800 border-emerald-500/20" },
  good: { label: "Good Condition", badgeClass: "bg-amber-500/10 text-amber-800 border-amber-500/20" },
  fair: { label: "Functional", badgeClass: "bg-slate-500/10 text-slate-700 border-slate-500/20" },
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
    <div className="card-hover-lift group relative flex flex-col rounded-3xl border border-slate-900/[0.08] bg-white p-3 shadow-xs hover:border-slate-900/20 transition-all">
      {/* Visual Media Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100">
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
            className={`pointer-events-auto inline-flex items-center rounded-xl px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-white/90 border shadow-xs ${conditionMeta.badgeClass}`}
          >
            {conditionMeta.label}
          </span>

          {/* Quick Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-slate-600 shadow-sm hover:scale-110 active:scale-95 transition-all"
            aria-label="Save item"
          >
            <Heart
              className={`h-4 w-4 ${
                isLiked ? "fill-rose-500 text-rose-500" : "text-slate-700"
              }`}
            />
          </button>
        </div>

        {/* Bottom Distance & Handover Hours Tag */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-semibold text-white pointer-events-none">
          <span className="inline-flex items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1 backdrop-blur-md shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <MapPin className="h-3 w-3 text-emerald-300" />
            <span>{formatDistance(distance)}</span>
          </span>

          {resource.availableFrom && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1 backdrop-blur-md shadow-xs text-[10px]">
              <Clock className="h-2.5 w-2.5 text-amber-300" />
              <span>{resource.availableFrom}-{resource.availableTo}</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Body Details */}
      <div className="flex flex-1 flex-col pt-3 px-1.5 pb-1">
        {/* Pricing & Category Line */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-base font-black tracking-tight ${
                isFree ? "text-emerald-700" : "text-slate-950"
              }`}
            >
              {formatPrice(resource.pricePerDay)}
            </span>
            {isFree && (
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-800 uppercase tracking-wider">
                100% Free
              </span>
            )}
          </div>

          <span className="text-[11px] font-bold text-slate-400 capitalize">
            {resource.category}
          </span>
        </div>

        {/* Title */}
        <Link
          href={`/resource/${resource.id}`}
          className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 leading-snug"
        >
          {resource.title}
        </Link>

        {/* Short Specs / Description */}
        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
          {resource.description}
        </p>

        {/* Footer: Owner Trust + Borrow CTA */}
        <div className="mt-auto pt-3 border-t border-slate-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <img
                src={owner.avatar}
                alt={owner.name}
                className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-200"
              />
              {owner.isVerified && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <ShieldCheck className="h-1.5 w-1.5" />
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-slate-700 line-clamp-1">
              {owner.name.split(" ")[0]}
            </span>
            <div className="flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200/50">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-500" />
              <span>{owner.trustScore}</span>
            </div>
          </div>

          {/* Borrow CTA vs Owner's Listing Badge */}
          {isMine ? (
            <Link
              href={`/resource/${resource.id}`}
              className="flex items-center gap-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 text-xs font-bold text-emerald-800 transition-all"
            >
              <span>Your Listing</span>
              <ArrowUpRight className="h-3 w-3 text-emerald-700" />
            </Link>
          ) : (
            <Link
              href={`/resource/${resource.id}`}
              className="flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-950 hover:text-white px-2.5 py-1 text-xs font-bold text-slate-800 transition-all active:scale-95"
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
