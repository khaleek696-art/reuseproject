import React from "react";
import { IndianRupee, RefreshCw, Leaf, Trees, ArrowUpRight } from "lucide-react";
import { COMMUNITY_IMPACT } from "@/data/mockData";
import Link from "next/link";

export function ImpactBar() {
  const stats = [
    {
      label: "Student Money Saved",
      value: `₹${(COMMUNITY_IMPACT.totalMoneySaved / 100000).toFixed(1)} Lakhs+`,
      subtext: "vs buying brand new gear",
      icon: IndianRupee,
      accent: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Active Peer Reuses",
      value: `${COMMUNITY_IMPACT.totalResourcesReused.toLocaleString("en-IN")}+`,
      subtext: "zero-waste exchanges",
      icon: RefreshCw,
      accent: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      label: "Carbon (CO₂) Cut",
      value: `~${COMMUNITY_IMPACT.totalCO2Avoided.toLocaleString("en-IN")} kg`,
      subtext: "manufacturing emissions avoided",
      icon: Leaf,
      accent: "text-teal-600 bg-teal-50 border-teal-200",
    },
    {
      label: "Equivalent Tree Impact",
      value: `~${Math.round(COMMUNITY_IMPACT.totalCO2Avoided / 20)} Trees`,
      subtext: "annual carbon absorption offset",
      icon: Trees,
      accent: "text-green-600 bg-green-50 border-green-200",
    },
  ];

  return (
    <div className="w-full">
      <div className="rounded-none border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 sm:p-8 shadow-[0_6px_0_0_#0f0f0f]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#8bd6b6] bg-[#065f46]/30 px-3 py-1 rounded-none border border-[#8bd6b6]/30 mb-2">
              <span className="flex h-1.5 w-1.5 rounded-none bg-[#8bd6b6] animate-pulse" />
              <span>Real-Time Community Ledger</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-pixel uppercase tracking-wider text-white">
              Measurable Climate &amp; Pocket Impact
            </h3>
          </div>

          <Link
            href="/dashboard?tab=impact"
            className="flex items-center gap-1.5 text-xs font-['Silkscreen'] uppercase tracking-wider text-[#8bd6b6] hover:text-white transition-colors self-start sm:self-auto"
          >
            <span>Personal Impact</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="rounded-none bg-[#141414] p-5 border-2 border-[#2a2a2a] shadow-[0_4px_0_0_#0f0f0f] hover:border-[#8bd6b6] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex rounded-none p-2 bg-[#0e0e0e] border border-[#2a2a2a] text-[#8bd6b6]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[9px] font-['Silkscreen'] text-[#89938d] uppercase">
                    #Live
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-pixel font-bold text-white tracking-wider">
                  {stat.value}
                </div>
                <div className="text-xs font-mono font-bold text-[#8bd6b6] mt-2">
                  {stat.label}
                </div>
                <div className="text-[10px] text-[#89938d] font-mono mt-0.5">
                  {stat.subtext}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
