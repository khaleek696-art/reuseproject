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
      className={`group relative overflow-hidden rounded-none border-2 transition-all duration-300 bg-[#1c1b1b] p-5 sm:p-6 ${
        isTopMatch
          ? "border-[#8bd6b6] shadow-[0_6px_0_0_#0f0f0f]"
          : "border-[#2a2a2a] shadow-[0_4px_0_0_#0f0f0f] hover:border-[#8bd6b6]"
      }`}
    >
      {/* Top Banner & Rank Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          {rank === 1 ? (
            <span className="inline-flex items-center gap-1.5 rounded-none bg-[#065f46] border border-[#047857] px-3 py-1 text-[10px] font-['Silkscreen'] uppercase tracking-wider text-white shadow-[0_2px_0_0_#003828]">
              <span className="text-amber-400">🏆</span> #1 TOP AI MATCH
            </span>
          ) : rank === 2 ? (
            <span className="inline-flex items-center gap-1 rounded-none bg-[#141414] border border-[#2a2a2a] px-2.5 py-0.5 text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2]">
              🥈 #2 HIGH AFFINITY
            </span>
          ) : (
            <span className="inline-flex items-center rounded-none bg-[#141414] border border-[#2a2a2a] px-2 py-0.5 text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#89938d]">
              #{rank} ALTERNATIVE
            </span>
          )}

          <span className="text-xs font-mono text-[#89938d] hidden sm:inline">
            5-Factor Groq Algorithm
          </span>
        </div>

        {/* Circular / Radial Score Highlight */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-lg sm:text-xl font-pixel font-bold text-white leading-none">
              {factors.finalScore}%
            </div>
            <div className="text-[9px] font-['Silkscreen'] uppercase tracking-wider text-[#8bd6b6]">
              Match Score
            </div>
          </div>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-none bg-[#065f46]/30 border border-[#8bd6b6] text-[#8bd6b6]">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Grid: Photo + Specs + Actions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Photo with aspect ratio — Complete Uncropped Studio View */}
        <div className="relative md:col-span-3 aspect-square md:aspect-[4/3] rounded-none overflow-hidden bg-[#141414] border-2 border-[#2a2a2a] flex items-center justify-center p-2.5 shadow-[0_3px_0_0_#0f0f0f]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#242424_0%,_#0f0f0f_100%)] pointer-events-none" />
          <img
            src={resource.photos[0]}
            alt={resource.title}
            className="relative z-10 max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
          />
        </div>

        {/* Center Details */}
        <div className="md:col-span-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-none bg-[#141414] border border-[#2a2a2a] px-2 py-0.5 text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#8bd6b6]">
              {resource.category}
            </span>
            <span className="text-xs font-['Silkscreen'] text-[#8bd6b6]">
              {formatPrice(resource.pricePerDay)}
            </span>
          </div>

          <Link
            href={`/resource/${resource.id}`}
            className="text-sm sm:text-base font-['Silkscreen'] uppercase tracking-wider text-white hover:text-[#8bd6b6] transition-colors line-clamp-1"
          >
            {resource.title}
          </Link>

          {/* Owner chip */}
          <div className="mt-1 flex items-center gap-2 text-xs font-mono text-[#bec9c2]">
            <span className="font-semibold text-white">
              {owner.name}
            </span>
            {owner.isVerified && (
              <span className="inline-flex items-center gap-0.5 text-[#8bd6b6] text-[10px] font-bold">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            )}
            <span className="text-[#3a3a3a]">&bull;</span>
            <span className="text-[#89938d] text-[11px]">{owner.college}</span>
          </div>

          {/* AI Explanation Tag */}
          <div className="mt-3 rounded-none bg-[#141414] p-2.5 border border-[#2a2a2a] text-[11px] font-mono text-[#bec9c2] leading-relaxed flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#8bd6b6] shrink-0 mt-0.5" />
            <span>{getAiReasoning()}</span>
          </div>

          {/* 4 Multi-Factor Score Bars */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
            <div className="rounded-none bg-[#141414] p-2 border border-[#2a2a2a]">
              <div className="text-[#89938d]">Distance (30%)</div>
              <div className="font-bold text-white mt-0.5">
                {formatDistance(factors.distanceKm)}
              </div>
              <div className="h-1 w-full bg-[#2a2a2a] rounded-none mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-[#065f46] rounded-none"
                  style={{ width: `${factors.distanceScore}%` }}
                />
              </div>
            </div>

            <div className="rounded-none bg-[#141414] p-2 border border-[#2a2a2a]">
              <div className="text-[#89938d]">Time (25%)</div>
              <div className="font-bold text-white mt-0.5">
                {factors.timeOverlapPercentage}% Overlap
              </div>
              <div className="h-1 w-full bg-[#2a2a2a] rounded-none mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-[#065f46] rounded-none"
                  style={{ width: `${factors.timeScore}%` }}
                />
              </div>
            </div>

            <div className="rounded-none bg-[#141414] p-2 border border-[#2a2a2a]">
              <div className="text-[#89938d]">Budget (15%)</div>
              <div className="font-bold text-white mt-0.5">
                {resource.pricePerDay === 0 ? "FREE" : `₹${resource.pricePerDay}/d`}
              </div>
              <div className="h-1 w-full bg-[#2a2a2a] rounded-none mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-[#065f46] rounded-none"
                  style={{ width: `${factors.budgetScore}%` }}
                />
              </div>
            </div>

            <div className="rounded-none bg-[#141414] p-2 border border-[#2a2a2a]">
              <div className="text-[#89938d]">Trust (20%)</div>
              <div className="font-bold text-white mt-0.5">
                {owner.trustScore} / 5.0 ⭐
              </div>
              <div className="h-1 w-full bg-[#2a2a2a] rounded-none mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-[#8bd6b6] rounded-none"
                  style={{ width: `${factors.trustScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Column */}
        <div className="md:col-span-3 flex flex-col gap-2 md:border-l-2 md:border-[#2a2a2a] md:pl-5">
          <button
            onClick={() => onRequestBorrow(match)}
            className="w-full flex items-center justify-center gap-1.5 rounded-none bg-[#065f46] border-2 border-[#047857] shadow-[0_4px_0_0_#003828] hover:bg-[#047857] py-3 text-xs font-['Silkscreen'] uppercase tracking-wider text-white active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <span>Request Borrow</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <Link
            href={`/resource/${resource.id}`}
            className="w-full flex items-center justify-center rounded-none bg-[#141414] border-2 border-[#2a2a2a] py-2.5 text-xs font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] hover:text-white hover:border-[#8bd6b6] transition-colors text-center"
          >
            View Details
          </Link>

          <div className="text-center text-[10px] text-[#89938d] font-mono mt-1">
            Deposit: ₹{resource.deposit} &bull; OTP Handover
          </div>
        </div>
      </div>
    </div>
  );
}
// RE:USE — Modular Circular Economy Architecture
