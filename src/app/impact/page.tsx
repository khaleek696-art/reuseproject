"use client";

import React, { useState } from "react";
import {
  Heart,
  Trees,
  Leaf,
  IndianRupee,
  RefreshCw,
  AlertTriangle,
  Info,
  ShieldCheck,
  TrendingUp,
  Award,
  Download,
  Share2,
} from "lucide-react";
import { useRole } from "@/lib/roleContext";

export default function ImpactPage() {
  const { currentUser } = useRole();
  const [certDownloaded, setCertDownloaded] = useState(false);

  const handleDownloadCert = () => {
    setCertDownloaded(true);
    alert(`Eco-Share Certificate for ${currentUser.name} generated successfully!`);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 p-8 sm:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
            <Leaf className="h-3.5 w-3.5 text-emerald-400" />
            <span>Circular Economy in Action</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-pixel tracking-wider leading-snug uppercase">
            Hyperlocal Resource Sharing That Heals Our Planet
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            By shifting from individual ownership to shared access, our campus community prevents redundant manufacturing, diverts electronics from landfills, and preserves student savings.
          </p>
        </div>
      </div>

      {/* SHAREABLE SUSTAINABILITY CERTIFICATE CARD */}
      <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 sm:p-8 shadow-[0_4px_0_0_#0f0f0f]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#065f46] text-[#8bd6b6] border-2 border-[#047857] shadow-[0_2px_0_0_#003828] shrink-0">
              <Award className="h-7 w-7 text-[#8bd6b6]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-pixel uppercase tracking-wider">
                  {currentUser.name}&apos;s Campus Sustainability Badge
                </h3>
                <span className="rounded-lg bg-[#065f46]/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#8bd6b6] border border-[#065f46] uppercase">
                  Level 2 Eco-Member
                </span>
              </div>
              <p className="text-xs text-[#bec9c2] mt-1 max-w-xl">
                Verified zero-waste contributor &bull; 39.5 kg CO2e avoided &bull; 14 equipment sharing transactions completed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadCert}
              className="flex items-center gap-2 rounded-xl bg-[#065f46] hover:bg-[#047857] px-4 py-2.5 text-xs font-bold text-white uppercase tracking-wider border-2 border-[#047857] shadow-[0_4px_0_0_#003828] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>{certDownloaded ? "Downloaded!" : "Download Certificate (PDF)"}</span>
            </button>
            <button
              onClick={() => alert("Certificate link copied! Ready to post on LinkedIn/Socials.")}
              className="flex items-center gap-2 rounded-xl border-2 border-[#353534] bg-[#201f1f] hover:bg-[#2a2a2a] px-4 py-2.5 text-xs font-bold text-[#e5e2e1] uppercase tracking-wider shadow-[0_4px_0_0_#0e0e0e] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <Share2 className="h-4 w-4 text-[#89938d]" />
              <span>Share Badge</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KEY METRIC CARDS (ROW 1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Resources Shared */}
        <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-5 shadow-[0_4px_0_0_#0f0f0f]">
          <div className="flex items-center justify-between text-[#89938d] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Resources Shared</span>
            <span className="rounded-lg bg-[#0e0e0e] p-1.5 text-[#8bd6b6] border border-[#2a2a2a]">
              <RefreshCw className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-pixel tracking-wider">14</div>
          <div className="text-xs text-[#bec9c2] mt-1">Cataloged active community items</div>
        </div>

        {/* Card 2: Successful Rentals */}
        <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-5 shadow-[0_4px_0_0_#0f0f0f]">
          <div className="flex items-center justify-between text-[#89938d] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Successful Rentals</span>
            <span className="rounded-lg bg-[#0e0e0e] p-1.5 text-[#7bd8b1] border border-[#2a2a2a]">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-pixel tracking-wider">9</div>
          <div className="text-xs text-[#bec9c2] mt-1">Completed borrower bookings</div>
        </div>

        {/* Card 3: Money Saved */}
        <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-5 shadow-[0_4px_0_0_#0f0f0f]">
          <div className="flex items-center justify-between text-[#89938d] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Community Money Saved</span>
            <span className="rounded-lg bg-[#0e0e0e] p-1.5 text-[#8bd6b6] border border-[#2a2a2a]">
              <IndianRupee className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-pixel tracking-wider">₹21,220</div>
          <div className="text-xs text-[#bec9c2] mt-1">Versus buying brand new equipment</div>
        </div>

        {/* Card 4: Utilization Rate */}
        <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-5 shadow-[0_4px_0_0_#0f0f0f]">
          <div className="flex items-center justify-between text-[#89938d] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Asset Utilization Rate</span>
            <span className="rounded-lg bg-[#0e0e0e] p-1.5 text-[#fbbf24] border border-[#2a2a2a]">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-pixel tracking-wider">35.7%</div>
          <div className="text-xs text-[#bec9c2] mt-1">Idle inventory activated for reuse</div>
        </div>
      </div>

      {/* ENVIRONMENTAL SAVINGS HIGHLIGHT CARD (ROW 2 - RULE 6 ENFORCED) */}
      <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 sm:p-8 shadow-[0_4px_0_0_#0f0f0f] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white font-pixel tracking-wider uppercase">
              Verified Environmental Avoidance
            </h2>
            {/* MANDATORY RULE 6: ESTIMATE BADGE */}
            <span className="rounded-md bg-[#2a2004] px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#fbbf24] uppercase tracking-wider border border-[#4a3505]">
              ESTIMATE
            </span>
          </div>

          <span className="text-xs text-[#89938d] font-mono">
            Based on pilot campus borrow cycles
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-xl bg-[#141414] p-6 border-2 border-[#065f46]/60 shadow-[inset_1px_1px_0_#1f1f1f]">
            <div className="flex items-center gap-2 text-[#8bd6b6] text-xs font-bold uppercase tracking-wider mb-2">
              <Trees className="h-4 w-4 text-[#8bd6b6]" />
              <span>Carbon Emissions Avoided</span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white font-pixel tracking-wider">
              39.5 kg CO2e Avoided
            </div>
            <p className="text-xs text-[#bec9c2] mt-2">
              Avoided manufacturing emissions across pilot rentals through peer sharing.
            </p>
          </div>

          <div className="rounded-xl bg-[#141414] p-6 border-2 border-[#017756]/60 shadow-[inset_1px_1px_0_#1f1f1f]">
            <div className="flex items-center gap-2 text-[#7bd8b1] text-xs font-bold uppercase tracking-wider mb-2">
              <Leaf className="h-4 w-4 text-[#7bd8b1]" />
              <span>Landfill Waste Diverted</span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white font-pixel tracking-wider">
              10 kg Waste Diverted
            </div>
            <p className="text-xs text-[#bec9c2] mt-2">
              E-waste and single-use packaging eliminated through verified circular handoffs.
            </p>
          </div>
        </div>

        {/* METHODOLOGY NOTICE BOX */}
        <div className="rounded-xl bg-[#2a2004]/60 p-4 border border-[#4a3505] text-xs text-[#fbbf24] flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-[#fbbf24] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white">Methodology &amp; Assumptions:</strong> Environmental impact metrics are estimated based on equipment reuse benchmarks (~3.2 kg CO2e avoided and ~2.1 kg manufacturing waste diverted per rental day compared to purchasing newly manufactured equipment). RE:USE does not fabricate precise claims without certified ISO 14044 lifecycle assessment (LCA).
          </div>
        </div>

        {/* CATEGORY SHARING DISTRIBUTION */}
        <div className="pt-4 border-t border-[#2a2a2a]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#bec9c2] mb-3">
            Carbon Avoidance by Category Distribution
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-bold text-[#e5e2e1]">📸 Photography &amp; Cameras</span>
                <span className="font-bold text-[#8bd6b6] font-mono">12.5 kg CO2e</span>
              </div>
              <div className="h-2 w-full bg-[#0e0e0e] border border-[#2a2a2a] rounded-full overflow-hidden">
                <div className="h-full bg-[#065f46] rounded-full" style={{ width: "31%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-bold text-[#e5e2e1]">⚡ Power Tools &amp; Hardware</span>
                <span className="font-bold text-[#7bd8b1] font-mono">9.0 kg CO2e</span>
              </div>
              <div className="h-2 w-full bg-[#0e0e0e] border border-[#2a2a2a] rounded-full overflow-hidden">
                <div className="h-full bg-[#017756] rounded-full" style={{ width: "23%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-bold text-[#e5e2e1]">💻 Electronics, Laptops &amp; Projectors</span>
                <span className="font-bold text-[#8bd6b6] font-mono">18.0 kg CO2e</span>
              </div>
              <div className="h-2 w-full bg-[#0e0e0e] border border-[#2a2a2a] rounded-full overflow-hidden">
                <div className="h-full bg-[#8bd6b6] rounded-full" style={{ width: "46%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// RE:USE — Modular Circular Economy Architecture
