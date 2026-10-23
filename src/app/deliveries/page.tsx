"use client";

import React, { useState } from "react";
import {
  Truck,
  MapPin,
  ShieldCheck,
  Star,
  CheckCircle2,
  Lock,
  ArrowRight,
  Navigation,
  Clock,
  IndianRupee,
  KeyRound,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useRole } from "@/lib/roleContext";
import { RedisOtpModal } from "@/components/RedisOtpModal";

export default function DeliveriesPage() {
  const { role, setRole, isDeliveryOnDuty, setIsDeliveryOnDuty } = useRole();
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [jobAccepted, setJobAccepted] = useState(false);

  if (role !== "delivery") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#065f46]/30 text-[#8bd6b6] border-2 border-[#065f46] shadow-[0_4px_0_0_#003828] mb-6">
          <Truck className="h-8 w-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white font-['Silkscreen'] tracking-wide mb-2 uppercase">
          Delivery Partner Console Restricted
        </h2>
        <p className="text-xs sm:text-sm text-[#bec9c2] mb-6">
          This section is for Hyperlocal Delivery Partners to accept dispatch jobs, verify single-use OTP handoffs, and earn delivery fees.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setRole("delivery")}
            className="w-full sm:w-auto rounded-xl bg-[#065f46] hover:bg-[#047857] px-6 py-3 text-xs font-bold text-white uppercase tracking-wider border-2 border-[#047857] shadow-[0_4px_0_0_#003828] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            Switch to Delivery Partner Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2a2a2a] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#065f46]/30 px-2.5 py-0.5 text-xs font-mono font-bold text-[#8bd6b6] border border-[#065f46] mb-1">
            <Truck className="h-3.5 w-3.5" />
            <span>SCREEN 8: Hyperlocal Delivery Partner Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-pixel tracking-wider uppercase">
            Hyperlocal Courier &amp; Physical Custody
          </h1>
          <p className="text-xs sm:text-sm text-[#bec9c2] mt-0.5">
            Single-use Redis OTP custody verification &bull; Zero fraud, verified chain of custody.
          </p>
        </div>

        {/* DELIVERY PARTNER STATUS BAR */}
        <div className="flex items-center gap-4 bg-[#1c1b1b] p-3 rounded-2xl border-2 border-[#2a2a2a] shadow-[0_4px_0_0_#0f0f0f]">
          <div>
            <div className="text-xs font-bold text-white">Vikram Courier (Cargo Bike)</div>
            <div className="text-[10px] text-[#89938d] font-semibold flex items-center gap-2">
              <span className="text-[#8bd6b6] font-bold">4.9 ★ Rating</span>
              <span>&bull;</span>
              <span>Today&apos;s Payout: <strong className="text-white">₹450</strong></span>
            </div>
          </div>

          {/* Large Emerald Duty Toggle */}
          <button
            onClick={() => setIsDeliveryOnDuty(!isDeliveryOnDuty)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider font-mono border transition-all cursor-pointer ${
              isDeliveryOnDuty
                ? "bg-[#065f46] text-white border-[#047857] shadow-[0_2px_0_0_#003828]"
                : "bg-[#201f1f] text-[#89938d] border-[#353534]"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isDeliveryOnDuty ? "bg-[#8bd6b6] animate-pulse" : "bg-[#89938d]"
              }`}
            />
            <span>{isDeliveryOnDuty ? "ON DUTY (Online)" : "OFF DUTY (Offline)"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Active Task & Available Jobs Dispatch Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Dispatch Feed & Map Radar (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* AVAILABLE JOBS RADAR (SCREEN 8) */}
          <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-[0_6px_0_0_#0f0f0f]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-[#8bd6b6] animate-ping" />
                <h3 className="font-bold text-sm text-white font-['Silkscreen'] tracking-wide uppercase">
                  Available Dispatch Jobs Radar (Within 4 km)
                </h3>
              </div>
              <span className="rounded-lg bg-[#0e0e0e] px-2.5 py-0.5 text-xs font-mono font-bold text-[#8bd6b6] border border-[#2a2a2a]">
                1 Task Found
              </span>
            </div>

            {/* Visual Simulated Route Card */}
            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 mb-4 shadow-[inset_1px_1px_0_#202020]">
              <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
                <span>Task #DISP-7819 &bull; Camera Handoff</span>
                <span className="text-[#8bd6b6] font-black text-sm font-mono">Payout: ₹40</span>
              </div>

              {/* Waypoint Route */}
              <div className="space-y-3 relative my-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#065f46] text-[#8bd6b6] border border-[#047857] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    A
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Pickup: Equipment Owner (Aman Sharma)</div>
                    <div className="text-[11px] text-[#89938d]">Lane 4, Ideal Colony, Kothrud Campus (1.2 km away)</div>
                  </div>
                </div>

                <div className="ml-3 h-6 border-l-2 border-dashed border-[#065f46]" />

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#201f1f] text-[#e5e2e1] border border-[#353534] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    B
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Dropoff: Borrower (Rahul Verma)</div>
                    <div className="text-[11px] text-[#89938d]">COEP Heritage Lawn, Shivajinagar (2.0 km transit)</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#89938d] pt-2 border-t border-[#2a2a2a] font-mono">
                <span>Total Route: 3.2 km (approx 12 mins via cargo bike)</span>
                <span className="text-[#bec9c2]">Equipment: Canon EOS 5D Mark IV Kit</span>
              </div>
            </div>

            {/* CTA */}
            {!jobAccepted ? (
              <button
                onClick={() => setJobAccepted(true)}
                disabled={!isDeliveryOnDuty}
                className="w-full rounded-xl bg-[#065f46] hover:bg-[#047857] py-3.5 text-xs sm:text-sm font-bold text-white uppercase tracking-wider border-2 border-[#047857] shadow-[0_4px_0_0_#003828] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 cursor-pointer"
              >
                Accept Delivery Task (Lock Courier Claim)
              </button>
            ) : (
              <div className="rounded-xl bg-[#065f46]/30 border-2 border-[#065f46] p-3 text-center text-xs font-bold text-[#8bd6b6]">
                ✓ Task Claimed! Proceed to Pickup Point A to verify physical custody.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Physical Custody Inspection & OTP (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-[0_6px_0_0_#0f0f0f] space-y-4">
            <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 font-['Silkscreen']">
                <Lock className="h-3.5 w-3.5 text-[#8bd6b6]" />
                <span>Chain of Custody Protocol</span>
              </span>
              <span className="rounded-md bg-[#0e0e0e] border border-[#2a2a2a] px-2 py-0.5 text-[10px] font-mono font-bold text-[#8bd6b6]">
                Enforced in UI
              </span>
            </div>

            <p className="text-xs text-[#bec9c2] leading-relaxed">
              Delivery partners never blindly accept parcels. You must physically inspect the equipment serial number against the encrypted registry and verify the single-use Redis OTP provided by the owner.
            </p>

            <div className="rounded-xl bg-[#141414] p-4 border border-[#2a2a2a] space-y-2 text-xs shadow-[inset_1px_1px_0_#202020]">
              <div className="font-bold text-white">Active Task Custody Verification:</div>
              <div className="text-[#bec9c2] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#8bd6b6]" />
                <span>Single-use 6-digit OTP (TTL 15m)</span>
              </div>
              <div className="text-[#bec9c2] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#8bd6b6]" />
                <span>Encrypted serial check (#CN-5D-8821)</span>
              </div>
              <div className="text-[#bec9c2] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#8bd6b6]" />
                <span>Immediate escrow transit release</span>
              </div>
            </div>

            <button
              onClick={() => setIsOtpOpen(true)}
              className="w-full rounded-xl bg-[#065f46] hover:bg-[#047857] py-3.5 text-xs sm:text-sm font-bold text-white uppercase tracking-wider border-2 border-[#047857] shadow-[0_4px_0_0_#003828] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="h-4 w-4 text-[#8bd6b6]" />
              <span>Launch 6-Digit Redis OTP Console</span>
            </button>
          </div>
        </div>
      </div>

      <RedisOtpModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        itemTitle="Canon EOS 5D Mark IV DSLR Kit"
        encryptedSerial="#CN-5D-8821"
      />
    </div>
  );
}
