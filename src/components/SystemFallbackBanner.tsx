"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, RefreshCw, X } from "lucide-react";

export type FallbackState = "healthy" | "ai_degraded" | "vector_degraded" | "no_courier";

export function SystemFallbackBanner() {
  const [state, setState] = useState<FallbackState>("healthy");
  const [isDismissed, setIsDismissed] = useState(false);
  const [showTester, setShowTester] = useState(false);

  if (state === "healthy" && !showTester) return null;

  return (
    <div className="w-full mb-4">
      {state !== "healthy" && !isDismissed && (
        <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-900 shadow-2xs mb-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <div>
              {state === "ai_degraded" && (
                <span>
                  <strong>Graceful Fallback Active:</strong> AI extraction is currently degraded. Serving standard keyword-based matching pipeline without interruption.
                </span>
              )}
              {state === "vector_degraded" && (
                <span>
                  <strong>Spatial Search Fallback:</strong> Qdrant vector similarity is offline. Candidates are being retrieved directly via PostgreSQL PostGIS spatial indexing.
                </span>
              )}
              {state === "no_courier" && (
                <span>
                  <strong>Hyperlocal Routing Update:</strong> No cargo bike delivery partner active within 3km. Direct peer self-pickup with mutual OTP verification is enabled.
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setState("healthy")}
              className="text-[11px] font-bold text-amber-700 underline hover:text-amber-800"
            >
              Restore Healthy State
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="rounded p-1 text-amber-600 hover:bg-amber-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Resilience State Tester for Judges / Demos */}
      <div className="flex items-center justify-between py-1 text-[11px] text-slate-400">
        <button
          onClick={() => setShowTester(!showTester)}
          className="flex items-center gap-1 font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <span>Screen 12 Architecture Resilience &amp; Fallback Tester</span>
          {showTester ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {showTester && (
          <div className="flex items-center gap-1.5 animate-in fade-in">
            <span className="font-semibold text-slate-500">Simulate:</span>
            <button
              onClick={() => {
                setState("healthy");
                setIsDismissed(false);
              }}
              className={`rounded px-2 py-0.5 font-bold ${
                state === "healthy" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              Healthy
            </button>
            <button
              onClick={() => {
                setState("ai_degraded");
                setIsDismissed(false);
              }}
              className={`rounded px-2 py-0.5 font-bold ${
                state === "ai_degraded" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              AI Offline
            </button>
            <button
              onClick={() => {
                setState("vector_degraded");
                setIsDismissed(false);
              }}
              className={`rounded px-2 py-0.5 font-bold ${
                state === "vector_degraded" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              Vector Offline
            </button>
            <button
              onClick={() => {
                setState("no_courier");
                setIsDismissed(false);
              }}
              className={`rounded px-2 py-0.5 font-bold ${
                state === "no_courier" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              Courier Offline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
