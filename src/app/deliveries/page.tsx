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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700 border border-emerald-200 mb-6">
          <Truck className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Delivery Partner Console Restricted
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          This section is for Hyperlocal Delivery Partners to accept dispatch jobs, verify single-use OTP handoffs, and earn delivery fees.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setRole("delivery")}
            className="w-full sm:w-auto rounded-xl bg-emerald-800 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-900 transition-all"
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
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200 mb-1">
            <Truck className="h-3.5 w-3.5" />
            <span>SCREEN 8: Hyperlocal Delivery Partner Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Hyperlocal Courier &amp; Physical Custody
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Single-use Redis OTP custody verification &bull; Zero fraud, verified chain of custody.
          </p>
        </div>

        {/* DELIVERY PARTNER STATUS BAR */}
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="text-xs font-bold text-slate-900">Vikram Courier (Cargo Bike)</div>
            <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-2">
              <span className="text-emerald-700 font-bold">4.9 ★ Rating</span>
              <span>&bull;</span>
              <span>Today&apos;s Payout: <strong>₹450</strong></span>
            </div>
          </div>

          {/* Large Emerald Duty Toggle */}
          <button
            onClick={() => setIsDeliveryOnDuty(!isDeliveryOnDuty)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              isDeliveryOnDuty
                ? "bg-emerald-800 text-white shadow-xs"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isDeliveryOnDuty ? "bg-emerald-400 animate-pulse" : "bg-slate-400"
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
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Available Dispatch Jobs Radar (Within 4 km)
                </h3>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                1 Task Found
              </span>
            </div>

            {/* Visual Simulated Route Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
                <span>Task #DISP-7819 &bull; Camera Handoff</span>
                <span className="text-emerald-800 font-black text-sm">Payout: ₹40</span>
              </div>

              {/* Waypoint Route */}
              <div className="space-y-3 relative my-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    A
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Pickup: Equipment Owner (Aman Sharma)</div>
                    <div className="text-[11px] text-slate-500">Lane 4, Ideal Colony, Kothrud Campus (1.2 km away)</div>
                  </div>
                </div>

                <div className="ml-3 h-6 border-l-2 border-dashed border-emerald-400" />

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    B
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Dropoff: Borrower (Rahul Verma)</div>
                    <div className="text-[11px] text-slate-500">COEP Heritage Lawn, Shivajinagar (2.0 km transit)</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                <span>Total Route: 3.2 km (approx 12 mins via cargo bike)</span>
                <span>Equipment: Canon EOS 5D Mark IV Kit</span>
              </div>
            </div>

            {/* CTA */}
            {!jobAccepted ? (
              <button
                onClick={() => setJobAccepted(true)}
                disabled={!isDeliveryOnDuty}
                className="w-full rounded-2xl bg-emerald-800 hover:bg-emerald-900 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                Accept Delivery Task (Lock Courier Claim)
              </button>
            ) : (
              <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-3 text-center text-xs font-bold text-emerald-900">
                ✓ Task Claimed! Proceed to Pickup Point A to verify physical custody.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Physical Custody Inspection & OTP (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-700" />
                <span>Chain of Custody Protocol</span>
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                Enforced in UI
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Delivery partners never blindly accept parcels. You must physically inspect the equipment serial number against the encrypted registry and verify the single-use Redis OTP provided by the owner.
            </p>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900">Active Task Custody Verification:</div>
              <div className="text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Single-use 6-digit OTP (TTL 15m)</span>
              </div>
              <div className="text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Encrypted serial check (#CN-5D-8821)</span>
              </div>
              <div className="text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Immediate escrow transit release</span>
              </div>
            </div>

            <button
              onClick={() => setIsOtpOpen(true)}
              className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="h-4 w-4 text-emerald-400" />
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
