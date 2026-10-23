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
    <div className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-[0_6px_0_0_#0f0f0f]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-none bg-[#065f46]/30 px-2.5 py-0.5 text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#8bd6b6] border border-[#8bd6b6]/30 mb-1">
            Circular Operating Model
          </div>
          <h3 className="text-base font-['Silkscreen'] uppercase tracking-wider text-white">
            10-Stage Resource Lifecycle Chain
          </h3>
        </div>
        <div className="text-xs text-[#89938d] font-mono">
          Click any phase to inspect protocol
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
                className={`group flex items-center gap-1.5 rounded-none px-3 py-2 text-xs font-['Silkscreen'] uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#065f46] text-white border-2 border-[#047857] shadow-[0_2px_0_0_#003828]"
                    : isPast
                    ? "bg-[#141414] text-[#8bd6b6] border border-[#047857]"
                    : "bg-[#141414] text-[#89938d] border border-[#2a2a2a] hover:text-white"
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-none text-[9px] font-mono font-black ${
                    isSelected
                      ? "bg-[#8bd6b6] text-black"
                      : isPast
                      ? "bg-[#065f46] text-white"
                      : "bg-[#2a2a2a] text-[#89938d]"
                  }`}
                >
                  {st.num}
                </span>
                <span>{st.name}</span>
              </button>

              {i < stages.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-[#3a3a3a] shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Active Phase Details Card */}
      <div className="mt-4 rounded-none bg-[#141414] p-4 border-2 border-[#2a2a2a] flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-none bg-[#065f46] border border-[#047857] text-[#8bd6b6] font-['Silkscreen'] text-xs shrink-0">
          {stages[activeStep].num}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-['Silkscreen'] text-white uppercase tracking-wider">
              Phase {stages[activeStep].num}: {stages[activeStep].name} Protocol
            </h4>
            <span className="rounded-none bg-[#065f46]/30 px-1.5 py-0.5 text-[9px] font-['Silkscreen'] uppercase text-[#8bd6b6] border border-[#8bd6b6]/30">
              Active Architecture
            </span>
          </div>
          <p className="text-xs text-[#bec9c2] font-mono mt-1.5 leading-relaxed">
            {stages[activeStep].desc}
          </p>
        </div>
      </div>
    </div>
  );
}
// RE:USE — Modular Circular Economy Architecture
