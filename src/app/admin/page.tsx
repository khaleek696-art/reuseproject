"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Users,
  Package,
  Truck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Lock,
  Layers,
  Search,
} from "lucide-react";
import { useRole } from "@/lib/roleContext";
import { MOCK_USERS, MOCK_RESOURCES } from "@/data/mockData";

export default function AdminPage() {
  const { role, setRole, algorithmWeights, setAlgorithmWeights, activeDisputesCount } = useRole();
  const [activeTab, setActiveTab] = useState<
    "kpis" | "users" | "delisting" | "escrow" | "deliveries" | "disputes" | "weights"
  >("weights");

  // Dispute resolution state
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeResolved, setDisputeResolved] = useState(false);

  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 mb-6">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Administrator Access Restricted
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          This area is reserved for Platform Administrators to manage escrow holds, dispute arbitration, and matching algorithm parameters.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setRole("admin")}
            className="w-full sm:w-auto rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all"
          >
            Switch to Platform Admin Mode
          </button>
        </div>
      </div>
    );
  }

  const handleWeightChange = (key: keyof typeof algorithmWeights, val: number) => {
    setAlgorithmWeights((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleResetWeights = () => {
    setAlgorithmWeights({
      location: 25,
      time: 25,
      budget: 20,
      compatibility: 20,
      trust: 10,
    });
  };

  const totalWeight =
    algorithmWeights.location +
    algorithmWeights.time +
    algorithmWeights.budget +
    algorithmWeights.compatibility +
    algorithmWeights.trust;

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* RESTRICTED ADMIN HEADER (SCREEN 11) */}
      <div className="rounded-3xl border border-slate-900 bg-slate-950 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Central Administrative Console
                </h1>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 uppercase">
                  Superuser Access
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage escrow holds, physical handoff disputes, and live 5-factor mathematical weights.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-xs font-bold text-amber-300">
              ⚠️ {activeDisputesCount} Active Escrow Disputes
            </span>
          </div>
        </div>

        {/* ADMIN TABS */}
        <div className="mt-6 border-t border-slate-800 pt-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "kpis", label: "📊 Overview KPIs" },
            { id: "disputes", label: `⚠️ Disputes & Escrow (${activeDisputesCount})` },
            { id: "users", label: "👥 Users & Moderation" },
            { id: "weights", label: "⚙️ Search Weights" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: DYNAMIC ALGORITHM WEIGHT SLIDERS (SCREEN 11) */}
      {activeTab === "weights" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-700" />
                <h3 className="text-lg font-black text-slate-900">
                  Dynamic Deterministic Match Weights
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Real-time weights used by Module B to rank candidates retrieved from Qdrant vector search.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                totalWeight === 100 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
              }`}>
                Sum of Weights: {totalWeight}%
              </span>
              <button
                onClick={handleResetWeights}
                className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset (25/25/20/20/10)</span>
              </button>
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-900">1. Spatial Location Weight</span>
                <span className="text-emerald-800 font-black">{algorithmWeights.location}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={algorithmWeights.location}
                onChange={(e) => handleWeightChange("location", Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Prioritizes walking and biking distance via Haversine / PostGIS.
              </p>
            </div>

            {/* Time */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-900">2. Time Overlap Weight</span>
                <span className="text-emerald-800 font-black">{algorithmWeights.time}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={algorithmWeights.time}
                onChange={(e) => handleWeightChange("time", Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Calculates availability window overlap percentage.
              </p>
            </div>

            {/* Budget */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-900">3. Budget Fit Weight</span>
                <span className="text-emerald-800 font-black">{algorithmWeights.budget}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={algorithmWeights.budget}
                onChange={(e) => handleWeightChange("budget", Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Scores 100% if item rate is within borrower budget.
              </p>
            </div>

            {/* Compatibility */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-900">4. Compatibility &amp; Features Weight</span>
                <span className="text-emerald-800 font-black">{algorithmWeights.compatibility}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={algorithmWeights.compatibility}
                onChange={(e) => handleWeightChange("compatibility", Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Matches required tags (4K, Dual card slots, specific mounts).
              </p>
            </div>

            {/* Trust */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 md:col-span-2">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-900">5. PeerTrust Score Weight</span>
                <span className="text-emerald-800 font-black">{algorithmWeights.trust}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={algorithmWeights.trust}
                onChange={(e) => handleWeightChange("trust", Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Weights owner community reputation and verified return track record.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DISPUTES & ESCROW RESOLUTION (SCREEN 11) */}
      {activeTab === "disputes" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900">
              Pending Escrow Disputes &amp; Chain of Custody Claims
            </h3>
            <span className="text-xs text-slate-500">2 cases awaiting arbitration</span>
          </div>

          {/* Dispute Card */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-amber-950">
              <span>Dispute #DSP-401 &bull; Canon EOS 5D Mark IV Kit</span>
              <span>Escrow Hold: ₹1,500</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>Owner Report:</strong> &ldquo;Borrower returned equipment 3 hours late and battery strap was missing during courier physical OTP handoff.&rdquo;
            </p>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">Parties: Aman Sharma (Owner) vs Rahul Verma (Borrower)</span>
              <button
                onClick={() => setIsDisputeModalOpen(true)}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow-xs"
              >
                Arbitrate Dispute &amp; Release Escrow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE RESOLUTION MODAL (SCREEN 11) */}
      {isDisputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
            {disputeResolved ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-2 animate-bounce" />
                <h3 className="text-xl font-black text-slate-900">Dispute Resolved &amp; Escrow Released</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Funds transferred according to platform arbitration guidelines.
                </p>
                <button
                  onClick={() => {
                    setDisputeResolved(false);
                    setIsDisputeModalOpen(false);
                  }}
                  className="mt-5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900">
                  Escrow Arbitration Console
                </h3>
                <p className="text-xs text-slate-500">
                  Review courier physical custody report and allocate the ₹1,500 security deposit.
                </p>

                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-800">Courier Custody Log:</div>
                  <div className="text-slate-600">&bull; Handover OTP verified at 16:42. Battery present, strap confirmed missing.</div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setDisputeResolved(true)}
                    className="w-full rounded-xl bg-emerald-800 hover:bg-emerald-900 py-3 text-xs font-bold text-white shadow-xs"
                  >
                    Release ₹1,200 to Borrower + Award ₹300 Strap Replacement to Owner
                  </button>
                  <button
                    onClick={() => setDisputeResolved(true)}
                    className="w-full rounded-xl border border-slate-200 hover:bg-slate-50 py-3 text-xs font-bold text-slate-700"
                  >
                    Full Refund of ₹1,500 to Borrower
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
