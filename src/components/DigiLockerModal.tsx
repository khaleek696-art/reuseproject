"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  X,
  Smartphone,
  FileText,
  CreditCard,
  GraduationCap,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useRole } from "@/lib/roleContext";

interface DigiLockerModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function DigiLockerModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onSuccess: propOnSuccess,
}: DigiLockerModalProps) {
  const {
    isDigiLockerModalOpen,
    closeDigiLockerModal,
    verifyDigiLocker,
    currentUser,
    isDigiLockerVerified,
  } = useRole();

  // Support both context-controlled and prop-controlled invocation
  const isOpen = propIsOpen !== undefined ? propIsOpen : isDigiLockerModalOpen;
  const handleClose = () => {
    if (propOnClose) propOnClose();
    else closeDigiLockerModal();
  };

  // Steps: "consent" | "otp" | "verifying" | "success"
  const [step, setStep] = useState<"consent" | "otp" | "verifying" | "success">("consent");
  
  // 6-digit OTP states
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState<number>(45);
  const [otpError, setOtpError] = useState<string>("");

  // Demo generated OTP
  const demoOtp = "784912";

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep("consent");
      setOtpDigits(["", "", "", "", "", ""]);
      setTimer(45);
      setOtpError("");
    }
  }, [isOpen]);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setOtpError("");

    // Auto-advance focus
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleAutoFillDemoOtp = () => {
    const chars = demoOtp.split("");
    setOtpDigits(chars);
    setOtpError("");
    inputRefs.current[5]?.focus();
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otpDigits.join("");
    if (enteredOtp.length < 6) {
      setOtpError("Please enter the complete 6-digit OTP code");
      return;
    }

    setStep("verifying");
    setTimeout(() => {
      // Complete DigiLocker verification dynamically
      verifyDigiLocker({
        aadhaarMasked: "4129",
        panMasked: "4312X",
        studentIdMasked: "2023CSB1109",
      });
      setStep("success");
      if (propOnSuccess) propOnSuccess();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#1c1b1b] border-2 border-[#2a2a2a] shadow-2xl overflow-hidden text-[#e5e2e1]">
        
        {/* Tricolor National Ribbon Header */}
        <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-[#FF9933]"></div>
          <div className="h-full w-1/3 bg-[#FFFFFF]"></div>
          <div className="h-full w-1/3 bg-[#138808]"></div>
        </div>

        {/* Modal Top Bar: Official DigiLocker Branding */}
        <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between bg-[#171717]">
          <div className="flex items-center gap-3">
            {/* DigiLocker Cloud Symbol */}
            <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-black shadow-xs">
              <span className="text-lg">🇮🇳</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-wide text-white">DigiLocker</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded border border-blue-400/30 uppercase tracking-wider">
                  Govt. of India
                </span>
              </div>
              <p className="text-[10px] text-slate-400">National Digital Identity &amp; Document Gateway</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#252525] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* STEP 1: DOCUMENT CONSENT & VERIFICATION GATE */}
        {step === "consent" && (
          <div className="p-6 space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20 mb-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Zero-Fraud Campus Trust Protocol</span>
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white font-pixel tracking-wider uppercase">
                Authorize RE:USE with DigiLocker
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                RE:USE circular sharing connects with official Government of India registries to verify identity, eliminate equipment theft, and waive 75% security deposit.
              </p>
            </div>

            {/* 3 Document Cards to be Fetched */}
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-[#222222] border border-[#2e2e2e] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>UIDAI Aadhaar Card</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800">Ready</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Masked: XXXX XXXX 4129 &bull; Name: {currentUser.name}
                    </div>
                  </div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#222222] border border-[#2e2e2e] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Income Tax PAN Record</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800">Ready</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Masked PAN: XXXXX4312X &bull; Financial Identity
                    </div>
                  </div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#222222] border border-[#2e2e2e] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Campus Student ID (ABC ID)</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800">Ready</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      ID: 2023CSB1109 &bull; Campus: {currentUser.neighborhood || "Campus Hub"}
                    </div>
                  </div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="rounded-2xl bg-[#171717] p-3 border border-[#2a2a2a] text-[11px] text-slate-400 flex items-start gap-2.5 leading-relaxed">
              <Lock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>MeitY &amp; IT Act 2000 Compliant:</strong> RE:USE receives only encrypted verification tokens. Your biometrics and sensitive credentials are never stored.
              </span>
            </div>

            {/* Action CTA Button */}
            <button
              onClick={() => setStep("otp")}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-700 hover:from-blue-600 hover:to-emerald-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Send 6-Digit DigiLocker OTP</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STEP 2: 6-DIGIT OTP VERIFICATION SCREEN */}
        {step === "otp" && (
          <div className="p-6 space-y-5 animate-in fade-in duration-150">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-3">
                <Smartphone className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-black text-white">Enter DigiLocker Security OTP</h2>
              <p className="text-xs text-slate-400 mt-1">
                A single-use 6-digit OTP has been dispatched to your Aadhaar-linked mobile:
              </p>
              <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                +91 &bull;&bull;&bull;&bull;&bull;&bull; 8712
              </div>
            </div>

            {/* 6-Digit OTP Box Grid */}
            <div className="flex justify-center gap-2 sm:gap-3 py-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="h-12 w-11 sm:h-14 sm:w-12 rounded-2xl border-2 border-[#2e2e2e] bg-[#141414] text-center font-mono text-xl font-bold text-white shadow-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              ))}
            </div>

            {/* Error Message */}
            {otpError && (
              <div className="rounded-xl bg-red-950/40 border border-red-500/30 p-2.5 text-xs text-red-300 text-center font-semibold">
                {otpError}
              </div>
            )}

            {/* 1-Click Demo Auto-fill Helper */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={handleAutoFillDemoOtp}
                className="text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>⚡ Auto-fill Demo OTP ({demoOtp})</span>
              </button>

              <span className="text-[11px] text-slate-400">
                {timer > 0 ? `Resend code in ${timer}s` : (
                  <button onClick={() => setTimer(45)} className="text-blue-400 font-bold hover:underline">
                    Resend OTP
                  </button>
                )}
              </span>
            </div>

            {/* Verify CTA */}
            <button
              onClick={handleVerifyOtp}
              className="w-full rounded-2xl bg-emerald-700 hover:bg-emerald-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Authorize &amp; Link DigiLocker</span>
              <ShieldCheck className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STEP 3: LOADING / VERIFYING ANIMATION */}
        {step === "verifying" && (
          <div className="p-12 text-center space-y-4 animate-in fade-in duration-150">
            <div className="mx-auto h-16 w-16 rounded-3xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center animate-spin">
              <RefreshCw className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Validating with UIDAI Registry</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Verifying digital cryptographic signatures for Aadhaar &amp; PAN via DigiLocker Trust Gateway...
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: VERIFICATION SUCCESS */}
        {step === "success" && (
          <div className="p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="mx-auto h-16 w-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30 uppercase tracking-wider mb-2">
                ✓ Government Verified
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                DigiLocker Identity Verified!
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                Your legal identity has been successfully validated. Zero-theft escrow privileges and 75% security deposit waiver are now active on your account.
              </p>
            </div>

            {/* Issued Credentials Summary Card */}
            <div className="rounded-2xl bg-[#141414] p-4 border border-[#2a2a2a] text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#222222] pb-2">
                <span className="text-slate-400">Verified Citizen</span>
                <span className="font-bold text-white">{currentUser.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#222222] pb-2">
                <span className="text-slate-400">UIDAI Aadhaar Status</span>
                <span className="font-mono text-emerald-400 font-bold">XXXX-XXXX-4129 (VERIFIED)</span>
              </div>
              <div className="flex justify-between border-b border-[#222222] pb-2">
                <span className="text-slate-400">Income Tax PAN Status</span>
                <span className="font-mono text-emerald-400 font-bold">XXXXX4312X (VERIFIED)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">PeerTrust Score Impact</span>
                <span className="font-bold text-amber-400">★ 5.0 PeerTrust (Top Tier)</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full rounded-2xl bg-emerald-700 hover:bg-emerald-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Continue to RE:USE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
// RE:USE — Modular Circular Economy Architecture
