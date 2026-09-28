import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { ScoredMatch } from "@/lib/types";
import { formatDistance, formatPrice } from "@/lib/utils";

interface MatchCardProps {
  match: ScoredMatch;
  rank: number;
  onRequestBorrow: (match: ScoredMatch) => void;
}

export function MatchCard({ match, rank, onRequestBorrow }: MatchCardProps) {
  const { resource, owner, factors } = match;
  const isTopMatch = rank === 1;

  // Custom AI explanation based on factors
  const getAiReasoning = () => {
    if (factors.finalScore >= 90) {
      return `Outstanding match: within ${formatDistance(factors.distanceKm)} walking radius with ${factors.timeOverlapPercentage}% time availability and a verified ${owner.trustScore}★ owner.`;
    }
    if (factors.finalScore >= 80) {
      return `Strong candidate: matches category & target budget with reliable ${owner.trustScore}★ PeerTrust reputation.`;
    }
    return `Alternative option: slight variance in distance (${formatDistance(factors.distanceKm)}) or availability schedule.`;
  };

  return (
    <div
      className={`card-hover-lift group relative overflow-hidden rounded-3xl border transition-all duration-300 bg-white p-5 sm:p-6 ${
        isTopMatch
          ? "border-emerald-500/40 shadow-xl shadow-emerald-500/[0.04] ring-1 ring-emerald-500/20"
          : "border-slate-900/[0.07] shadow-xs hover:border-slate-300"
      }`}
    >
      {/* Top Banner & Rank Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {rank === 1 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white shadow-2xs">
              <span className="text-amber-400">🏆</span> #1 TOP AI MATCH
            </span>
          ) : rank === 2 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
              🥈 #2 High Affinity
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              #{rank} Alternative
            </span>
          )}

          <span className="text-xs font-medium text-slate-400 hidden sm:inline">
            Module B Weighted Engine
          </span>
        </div>

        {/* Circular / Radial Score Highlight */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-lg sm:text-xl font-black text-slate-950 leading-none">
              {factors.finalScore}%
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Match Score
            </div>
          </div>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Grid: Photo + Specs + Actions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Photo with aspect ratio */}
        <div className="md:col-span-3 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80">
          <img
            src={resource.photos[0]}
            alt={resource.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Center Details */}
        <div className="md:col-span-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              {resource.category}
            </span>
            <span className="text-xs font-black text-slate-900">
              {formatPrice(resource.pricePerDay)}
            </span>
          </div>

          <Link
            href={`/resource/${resource.id}`}
            className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1"
          >
            {resource.title}
          </Link>

          {/* Owner chip */}
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">
              {owner.name}
            </span>
            {owner.isVerified && (
              <span className="inline-flex items-center gap-0.5 text-emerald-700 text-[11px] font-bold">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            )}
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-400 text-[11px]">{owner.college}</span>
          </div>

          {/* AI Explanation Tag */}
          <div className="mt-3 rounded-xl bg-slate-50 p-2.5 border border-slate-200/60 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>{getAiReasoning()}</span>
          </div>

          {/* 4 Multi-Factor Score Bars */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <div className="rounded-xl bg-slate-50 p-2 border border-slate-200/60">
              <div className="text-slate-400 font-medium">Distance (30%)</div>
              <div className="font-bold text-slate-900 mt-0.5">
                {formatDistance(factors.distanceKm)}
              </div>
              <div className="h-1 w-full bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${factors.distanceScore}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-2 border border-slate-200/60">
              <div className="text-slate-400 font-medium">Time Overlap (25%)</div>
              <div className="font-bold text-slate-900 mt-0.5">
                {factors.timeOverlapPercentage}% Overlap
              </div>
              <div className="h-1 w-full bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${factors.timeScore}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-2 border border-slate-200/60">
              <div className="text-slate-400 font-medium">Budget Fit (15%)</div>
              <div className="font-bold text-slate-900 mt-0.5">
                {resource.pricePerDay === 0 ? "FREE" : `₹${resource.pricePerDay}/d`}
              </div>
              <div className="h-1 w-full bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${factors.budgetScore}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-2 border border-slate-200/60">
              <div className="text-slate-400 font-medium">PeerTrust (20%)</div>
              <div className="font-bold text-slate-900 mt-0.5">
                {owner.trustScore} / 5.0 ⭐
              </div>
              <div className="h-1 w-full bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${factors.trustScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Column */}
        <div className="md:col-span-3 flex flex-col gap-2 md:border-l md:border-slate-100 md:pl-5">
          <button
            onClick={() => onRequestBorrow(match)}
            className="w-full flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs sm:text-sm font-bold text-white shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <span>Request to Borrow</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <Link
            href={`/resource/${resource.id}`}
            className="w-full flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-800 transition-colors"
          >
            View Details &amp; Calendar
          </Link>

          <div className="text-center text-[10px] text-slate-400 mt-1">
            Deposit: ₹{resource.deposit} &bull; OTP Handover
          </div>
        </div>
      </div>
    </div>
  );
}
