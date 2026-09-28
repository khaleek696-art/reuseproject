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
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Hyperlocal Resource Sharing That Heals Our Planet
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            By shifting from individual ownership to shared access, our campus community prevents redundant manufacturing, diverts electronics from landfills, and preserves student savings.
          </p>
        </div>
      </div>

      {/* SHAREABLE SUSTAINABILITY CERTIFICATE CARD */}
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-md shrink-0">
              <Award className="h-7 w-7 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  {currentUser.name}&apos;s Campus Sustainability Badge
                </h3>
                <span className="rounded-full bg-emerald-200/60 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-900 border border-emerald-300 uppercase">
                  Level 2 Eco-Member
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                Verified zero-waste contributor &bull; 39.5 kg CO2e avoided &bull; 14 equipment sharing transactions completed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadCert}
              className="flex items-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
            >
              <Download className="h-4 w-4" />
              <span>{certDownloaded ? "Downloaded!" : "Download Certificate (PDF)"}</span>
            </button>
            <button
              onClick={() => alert("Certificate link copied! Ready to post on LinkedIn/Socials.")}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Share2 className="h-4 w-4 text-slate-500" />
              <span>Share Badge</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KEY METRIC CARDS (ROW 1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Resources Shared */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Resources Shared</span>
            <span className="rounded bg-emerald-50 p-1.5 text-emerald-700">
              <RefreshCw className="h-4 w-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900">14</div>
          <div className="text-xs text-slate-500 mt-1">Cataloged active community items</div>
        </div>

        {/* Card 2: Successful Rentals */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Successful Rentals</span>
            <span className="rounded bg-blue-50 p-1.5 text-blue-700">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900">9</div>
          <div className="text-xs text-slate-500 mt-1">Completed borrower bookings</div>
        </div>

        {/* Card 3: Money Saved */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Community Money Saved</span>
            <span className="rounded bg-emerald-50 p-1.5 text-emerald-700">
              <IndianRupee className="h-4 w-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900">₹21,220</div>
          <div className="text-xs text-slate-500 mt-1">Versus buying brand new equipment</div>
        </div>

        {/* Card 4: Utilization Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Asset Utilization Rate</span>
            <span className="rounded bg-amber-50 p-1.5 text-amber-700">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900">35.7%</div>
          <div className="text-xs text-slate-500 mt-1">Idle inventory activated for reuse</div>
        </div>
      </div>

      {/* ENVIRONMENTAL SAVINGS HIGHLIGHT CARD (ROW 2 - RULE 6 ENFORCED) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Verified Environmental Avoidance
            </h2>
            {/* MANDATORY RULE 6: ESTIMATE BADGE */}
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-black text-amber-900 uppercase tracking-wider border border-amber-300">
              ESTIMATE
            </span>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Based on pilot campus borrow cycles
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-emerald-50/70 p-6 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-1">
              <Trees className="h-4 w-4 text-emerald-700" />
              <span>Carbon Emissions Avoided</span>
            </div>
            <div className="text-4xl font-black text-emerald-950">
              39.5 kg CO2e Avoided
            </div>
            <p className="text-xs text-emerald-800 mt-2">
              Avoided manufacturing emissions across pilot rentals through peer sharing.
            </p>
          </div>

          <div className="rounded-2xl bg-teal-50/70 p-6 border border-teal-200">
            <div className="flex items-center gap-2 text-teal-900 text-xs font-bold uppercase tracking-wider mb-1">
              <Leaf className="h-4 w-4 text-teal-700" />
              <span>Landfill Waste Diverted</span>
            </div>
            <div className="text-4xl font-black text-teal-950">
              10 kg Waste Diverted
            </div>
            <p className="text-xs text-teal-800 mt-2">
              E-waste and single-use packaging eliminated through verified circular handoffs.
            </p>
          </div>
        </div>

        {/* METHODOLOGY NOTICE BOX */}
        <div className="rounded-2xl bg-amber-50/80 p-4 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Methodology &amp; Assumptions:</strong> Environmental impact metrics are estimated based on equipment reuse benchmarks (~3.2 kg CO2e avoided and ~2.1 kg manufacturing waste diverted per rental day compared to purchasing newly manufactured equipment). RE:USE does not fabricate precise claims without certified ISO 14044 lifecycle assessment (LCA).
          </div>
        </div>

        {/* CATEGORY SHARING DISTRIBUTION */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Carbon Avoidance by Category Distribution
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>📸 Photography &amp; Cameras</span>
                <span className="font-bold text-slate-900">12.5 kg CO2e</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: "31%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>⚡ Power Tools &amp; Hardware</span>
                <span className="font-bold text-slate-900">9.0 kg CO2e</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: "23%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>💻 Electronics, Laptops &amp; Projectors</span>
                <span className="font-bold text-slate-900">18.0 kg CO2e</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: "46%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
