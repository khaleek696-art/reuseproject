import React from "react";
import { Database, Zap, Cpu, CheckCircle2 } from "lucide-react";

export function TelemetryStrip() {
  const telemetry = [
    {
      title: "PostgreSQL + PostGIS",
      status: "Ready",
      detail: "Spatial Indexing (ST_DWithin 25km)",
      icon: Database,
    },
    {
      title: "Redis OTP Cache",
      status: "Ready",
      detail: "Single-Use 6-Digit TTL Expiry",
      icon: Zap,
    },
    {
      title: "Qdrant Vector DB",
      status: "Ready",
      detail: "Cosine Similarity Embeddings",
      icon: Cpu,
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {telemetry.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {item.detail}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                  {item.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
