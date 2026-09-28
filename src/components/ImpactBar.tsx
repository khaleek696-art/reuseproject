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
      <div className="rounded-3xl border border-slate-900/[0.08] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80 mb-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Community Ledger</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Measurable Climate &amp; Pocket Impact
            </h3>
          </div>

          <Link
            href="/dashboard?tab=impact"
            className="flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-emerald-700 self-start sm:self-auto"
          >
            <span>View Personal Impact &amp; Badges</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="card-hover-lift rounded-2xl bg-slate-50/70 p-5 border border-slate-200/70 shadow-2xs hover:bg-white hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex rounded-xl p-2 border ${stat.accent}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold">
                    #LiveMetric
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1">
                  {stat.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
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
