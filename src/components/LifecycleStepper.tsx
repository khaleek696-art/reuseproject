"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, ChevronRight, Info } from "lucide-react";

export function LifecycleStepper() {
  const [activeStep, setActiveStep] = useState(3); // Default at "MATCH"

  const stages = [
    { num: 1, name: "NEED", desc: "Borrower expresses raw intent or project requirement in conversational text." },
    { num: 2, name: "UNDERSTAND", desc: "AI extracts category, dates, budget limit, radius, and required equipment features." },
    { num: 3, name: "FIND", desc: "PostGIS spatial index pulls idle local candidate listings within target radius." },
    { num: 4, name: "MATCH", desc: "Deterministic 5-factor scoring ranks candidates with transparent mathematical weights." },
    { num: 5, name: "TRUST", desc: "Behavioral trust check: verified IDs, completed returns, dispute history, rater credibility." },
    { num: 6, name: "BOOK", desc: "Funds held in escrow. Equipment calendar auto-locks to prevent double-booking." },
    { num: 7, name: "DELIVER", desc: "Single-use 6-digit Redis OTP verified upon physical handoff by courier or peer." },
    { num: 8, name: "USE", desc: "Borrower operates equipment with verified chain of custody and care guidelines." },
    { num: 9, name: "RETURN", desc: "Return OTP verification and condition inspection. Escrow deposit automatically releases." },
    { num: 10, name: "REVIEW", desc: "Reciprocal credibility rating updates both users' PeerTrust scores." },
  ];

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Circular Operating Model
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            10-Stage Resource Lifecycle Chain
          </h3>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Click any phase to inspect the protocol
        </div>
      </div>

      {/* Horizontal Stepper Chain */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 no-scrollbar">
        {stages.map((st, i) => {
          const isSelected = activeStep === i;
          const isPast = i < activeStep;
          return (
            <React.Fragment key={st.num}>
              <button
                onClick={() => setActiveStep(i)}
                className={`group flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all shrink-0 border ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : isPast
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black ${
                    isSelected
                      ? "bg-emerald-400 text-slate-950"
                      : isPast
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-300 text-slate-700"
                  }`}
                >
                  {st.num}
                </span>
                <span>{st.name}</span>
              </button>

              {i < stages.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Active Phase Details Card */}
      <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-200/80 flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-xs shrink-0">
          {stages[activeStep].num}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Phase {stages[activeStep].num}: {stages[activeStep].name} Protocol
            </h4>
            <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
              Active in Architecture
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {stages[activeStep].desc}
          </p>
        </div>
      </div>
    </div>
  );
}
