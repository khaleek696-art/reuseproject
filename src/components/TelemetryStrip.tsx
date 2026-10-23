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
              className="flex items-center justify-between rounded-none border-2 border-[#2a2a2a] bg-[#1c1b1b] px-4 py-2.5 shadow-[0_3px_0_0_#0f0f0f]"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-none bg-[#0e0e0e] text-[#8bd6b6] border border-[#2a2a2a]">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-['Silkscreen'] uppercase tracking-wider text-white leading-tight">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-[#89938d] font-mono">
                    {item.detail}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-none bg-[#065f46]/30 px-2.5 py-0.5 border border-[#8bd6b6]/30">
                <span className="h-1.5 w-1.5 rounded-none bg-[#8bd6b6] animate-pulse" />
                <span className="text-[9px] font-['Silkscreen'] text-[#8bd6b6] uppercase tracking-wider">
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
