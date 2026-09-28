"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  MapPin,
  Compass,
  Star,
  Navigation,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Radio,
  RotateCcw,
} from "lucide-react";
import { Resource } from "@/lib/types";
import { haversine } from "@/lib/utils";
import { ChatDrawer } from "@/components/ChatDrawer";
import { BookingModal } from "@/components/BookingModal";

interface InteractiveMapProps {
  resources: Resource[];
  onSelectResource?: (res: Resource) => void;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
}

export function InteractiveMap({
  resources = [],
  onSelectResource,
  userLat = 18.5204,
  userLng = 73.8567,
  maxDistance = 10,
}: InteractiveMapProps) {
  const [selectedResId, setSelectedResId] = useState<string | null>(null);
  const [selectedDistFilter, setSelectedDistFilter] = useState<number>(maxDistance);

  // Sync selected distance when prop changes
  useEffect(() => {
    setSelectedDistFilter(maxDistance);
  }, [maxDistance]);

  // Set default selected resource
  useEffect(() => {
    if (resources && resources.length > 0) {
      if (!selectedResId || !resources.some((r) => r.id === selectedResId)) {
        setSelectedResId(resources[0].id);
      }
    } else {
      setSelectedResId(null);
    }
  }, [resources, selectedResId]);

  // Modals state for map pin actions
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Filter resources by radius if user clicks radius pill inside map
  const displayResources = useMemo(() => {
    if (!resources || !Array.isArray(resources)) return [];
    return resources.filter((res) => {
      const dist = haversine(userLat, userLng, res.location.lat, res.location.lng);
      return dist <= selectedDistFilter;
    });
  }, [resources, userLat, userLng, selectedDistFilter]);

  const selectedRes = useMemo(() => {
    if (!selectedResId) return displayResources[0] || resources[0] || null;
    return (
      displayResources.find((r) => r.id === selectedResId) ||
      resources.find((r) => r.id === selectedResId) ||
      displayResources[0] ||
      resources[0] ||
      null
    );
  }, [selectedResId, displayResources, resources]);

  // Relative coordinate calculator (clamps position safely inside map container)
  const getMapPosition = (lat: number, lng: number) => {
    const latDiff = lat - userLat;
    const lngDiff = lng - userLng;

    // Scale diff into percentage coordinates
    const scale = 320;
    const leftPct = 50 + lngDiff * scale;
    const topPct = 50 - latDiff * scale;

    return {
      top: `${Math.min(85, Math.max(15, topPct))}%`,
      left: `${Math.min(85, Math.max(15, leftPct))}%`,
    };
  };

  return (
    <div className="relative w-full min-h-[580px] h-[580px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl select-none">
      {/* 1. FUTURISTIC DARK CAMPUS VECTOR GRID CANVAS */}
      <div className="absolute inset-0 bg-slate-950">
        {/* Grid dots background */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-75" />

        {/* SVG Campus Roads & Distance Concentric Circles */}
        <svg className="absolute inset-0 h-full w-full stroke-slate-800/80 fill-none pointer-events-none" opacity="0.65">
          <circle cx="50%" cy="50%" r="90" strokeDasharray="4 4" stroke="#1e293b" strokeWidth="1.5" />
          <circle cx="50%" cy="50%" r="180" strokeDasharray="4 4" stroke="#1e293b" strokeWidth="1.5" />
          <circle cx="50%" cy="50%" r="260" strokeDasharray="4 4" stroke="#0f172a" strokeWidth="1.5" />

          {/* Campus Roads */}
          <path d="M 0,290 L 1200,290" stroke="#334155" strokeWidth="2.5" />
          <path d="M 500,0 L 500,600" stroke="#334155" strokeWidth="2.5" />
          <path d="M 100,100 L 900,500" stroke="#1e293b" strokeWidth="1.5" />
          <path d="M 100,500 L 900,100" stroke="#1e293b" strokeWidth="1.5" />
        </svg>

        {/* 360-Degree Rotating Radar Scanner Beam */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[580px] w-[580px] rounded-full pointer-events-none opacity-25">
          <div className="h-full w-full rounded-full bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(16,185,129,0.45)_360deg)] animate-[spin_6s_linear_infinite]" />
        </div>
      </div>

      {/* 2. TOP HEADER RADAR CONTROL BAR */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-900/90 backdrop-blur-md px-3.5 py-2 text-white border border-slate-700 shadow-lg">
            <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-black tracking-tight">Campus Spatial Radar</span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
              {displayResources.length} Items Active
            </span>
          </div>

          {/* Radius Filter Pills */}
          <div className="hidden sm:flex rounded-2xl bg-slate-900/90 backdrop-blur-md p-1 border border-slate-700 shadow-lg">
            {[1, 3, 5, 10, 25].map((dist) => (
              <button
                key={dist}
                onClick={() => setSelectedDistFilter(dist)}
                className={`rounded-xl px-2.5 py-1 text-[11px] font-extrabold transition-all ${
                  selectedDistFilter === dist
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {dist} km
              </button>
            ))}
          </div>
        </div>

        {/* User Location Indicator Badge */}
        <div className="flex items-center gap-2 rounded-2xl bg-slate-900/90 backdrop-blur-md px-3 py-1.5 border border-slate-700 text-xs font-bold text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping" />
          <span>Campus Center (18.5204° N)</span>
        </div>
      </div>

      {/* 3. USER CURRENT POSITION MARKER (BLUE PULSE) */}
      <div
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={getMapPosition(userLat, userLng)}
      >
        <div className="relative flex items-center justify-center">
          <span className="absolute h-12 w-12 rounded-full bg-blue-500/30 animate-ping" />
          <span className="h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow-xl" />
          <span className="absolute top-5 bg-slate-900/95 text-blue-300 text-[9px] font-black px-2 py-0.5 rounded-md border border-blue-500/40 shadow-lg whitespace-nowrap">
            📍 You Are Here
          </span>
        </div>
      </div>

      {/* 4. INTERACTIVE MAP PINS CONTAINER */}
      <div className="relative w-full h-full">
        {displayResources.map((res) => {
          const isSelected = selectedRes?.id === res.id;
          const pos = getMapPosition(res.location.lat, res.location.lng);
          const distanceKm = haversine(userLat, userLng, res.location.lat, res.location.lng).toFixed(1);

          return (
            <div
              key={res.id}
              onClick={() => {
                setSelectedResId(res.id);
                if (onSelectResource) onSelectResource(res);
              }}
              style={pos}
              className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                isSelected ? "scale-110 z-40" : "hover:scale-105"
              }`}
            >
              {/* Floating Price Badge */}
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold shadow-2xl border backdrop-blur-md transition-all ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-400 ring-4 ring-emerald-500/40"
                    : "bg-slate-900/95 text-slate-100 border-slate-700 hover:border-emerald-500"
                }`}
              >
                <MapPin className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-emerald-400"}`} />
                <span>₹{res.pricePerDay}/day</span>
                <span className="text-[10px] opacity-75 font-medium">({distanceKm}km)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. RADAR EMPTY STATE OVERLAY (IF NO MATCHED ITEMS IN RADIUS) */}
      {displayResources.length === 0 && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xs p-6 text-center">
          <div className="h-14 w-14 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-3 shadow-xl">
            <Compass className="h-7 w-7 text-emerald-400 animate-spin" />
          </div>
          <h3 className="text-base font-black text-white tracking-tight">
            No equipment found within {selectedDistFilter} km radius
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
            Try expanding your search radius to 5 km or resetting category filters to view nearby equipment pins.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDistFilter(10)}
              className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 text-xs font-bold shadow-md transition-all"
            >
              Expand Radius to 10 km
            </button>
            <button
              onClick={() => setSelectedDistFilter(25)}
              className="rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 px-4 py-2 text-xs font-bold transition-all"
            >
              Show All Campus Gear
            </button>
          </div>
        </div>
      )}

      {/* 6. SELECTED RESOURCE PREVIEW DRAWER (BOTTOM ITEM CARD) */}
      {selectedRes && (
        <div className="absolute bottom-4 left-4 right-4 z-40 mx-auto max-w-2xl rounded-3xl bg-white/95 backdrop-blur-md p-4 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={selectedRes.photos && selectedRes.photos[0] ? selectedRes.photos[0] : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80"}
                alt={selectedRes.title || "Resource"}
                className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shrink-0"
              />

              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider border border-emerald-300">
                    {selectedRes.category}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {haversine(userLat, userLng, selectedRes.location.lat, selectedRes.location.lng).toFixed(1)} km walking distance
                  </span>
                </div>

                <h4 className="text-sm font-black text-slate-900 line-clamp-1 mt-0.5">
                  {selectedRes.title}
                </h4>

                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-extrabold text-slate-900 text-sm">
                    ₹{selectedRes.pricePerDay} <span className="text-[10px] font-normal text-slate-500">/day</span>
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 font-bold text-slate-700">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    4.9 PeerTrust
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors shadow-xs"
              >
                <MessageSquare className="h-4 w-4 text-emerald-700" />
                <span>Chat Owner</span>
              </button>

              <button
                onClick={() => setIsBookingOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 px-4 py-2 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
              >
                <span>Book Item</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMBEDDED MODALS TRIGGERED FROM MAP PIN ACTIONS */}
      {selectedRes && (
        <>
          <ChatDrawer
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            recipientName="Verified Equipment Owner"
            recipientRole="Verified Equipment Owner"
            resourceTitle={selectedRes.title}
          />

          <BookingModal
            isOpen={isBookingOpen}
            onClose={() => setIsBookingOpen(false)}
            resource={selectedRes}
            onSuccess={() => alert(`Booking request placed for ${selectedRes.title}!`)}
          />
        </>
      )}
    </div>
  );
}
