"use client";

import React, { useState } from "react";
import { X, ShieldCheck, CheckCircle2, AlertCircle, KeyRound, Lock } from "lucide-react";

interface RedisOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  itemTitle?: string;
  encryptedSerial?: string;
}

export function RedisOtpModal({
  isOpen,
  onClose,
  onSuccess,
  itemTitle = "Canon EOS 5D Mark IV Kit",
  encryptedSerial = "#CN-5D-8821",
}: RedisOtpModalProps) {
  const [digits, setDigits] = useState(["5", "8", "2", "9", "1", "4"]);
  const [checkedItems, setCheckedItems] = useState({
    condition: true,
    accessories: true,
    serial: true,
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const updated = [...digits];
    updated[index] = value;
    setDigits(updated);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsConfirmed(true);
      if (onSuccess) onSuccess();
    }, 700);
  };

  const allChecked = checkedItems.condition && checkedItems.accessories && checkedItems.serial;
  const otpCode = digits.join("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-none bg-[#1c1b1b] p-6 sm:p-8 shadow-[0_8px_0_0_#0f0f0f] border-2 border-[#2a2a2a]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-none p-2 bg-[#141414] border border-[#2a2a2a] text-[#bec9c2] hover:text-white hover:border-[#8bd6b6] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {!isConfirmed ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-none bg-[#065f46] border border-[#047857] text-[#8bd6b6]">
                <KeyRound className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#8bd6b6]">
                Redis Single-Use OTP (TTL 15m)
              </span>
            </div>

            <h3 className="text-base font-['Silkscreen'] uppercase tracking-wider text-white">
              Verify Physical Custody Handoff
            </h3>
            <p className="text-xs text-[#bec9c2] font-mono mt-1">
              Enter the single-use 6-digit code provided by the Equipment Owner upon pickup for <span className="font-semibold text-white">{itemTitle}</span>.
            </p>

            {/* 6 Individual Numeric Boxes */}
            <div className="my-6">
              <label className="block text-center text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-3">
                6-Digit Authorization Code
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    id={`redis-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                      if (!pastedData) return;

                      const newDigits = ["", "", "", "", "", ""];
                      for (let idx = 0; idx < pastedData.length; idx++) {
                        newDigits[idx] = pastedData[idx];
                      }
                      setDigits(newDigits);

                      const targetIndex = Math.min(pastedData.length - 1, 5);
                      document.getElementById(`redis-otp-${targetIndex}`)?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        if (!digits[i] && i > 0) {
                          e.preventDefault();
                          const newDigits = [...digits];
                          newDigits[i - 1] = "";
                          setDigits(newDigits);
                          document.getElementById(`redis-otp-${i - 1}`)?.focus();
                        } else if (digits[i]) {
                          const newDigits = [...digits];
                          newDigits[i] = "";
                          setDigits(newDigits);
                        }
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length > 1) {
                        const newDigits = [...digits];
                        for (let idx = 0; idx < Math.min(val.length, 6 - i); idx++) {
                          newDigits[i + idx] = val[idx];
                        }
                        setDigits(newDigits);
                        const nextIdx = Math.min(i + val.length, 5);
                        document.getElementById(`redis-otp-${nextIdx}`)?.focus();
                        return;
                      }

                      handleDigitChange(i, val);
                      if (val && i < 5) {
                        document.getElementById(`redis-otp-${i + 1}`)?.focus();
                      }
                    }}
                    className="h-12 w-11 sm:h-14 sm:w-12 text-center text-xl sm:text-2xl font-['Silkscreen'] rounded-none border-2 border-[#2a2a2a] bg-[#0e0e0e] text-[#8bd6b6] focus:border-[#8bd6b6] focus:outline-none"
                  />
                ))}
              </div>
            </div>

            {/* Custody Checklist */}
            <div className="rounded-none bg-[#141414] p-4 border-2 border-[#2a2a2a] mb-6 font-mono">
              <h4 className="text-[10px] font-['Silkscreen'] text-[#8bd6b6] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#8bd6b6]" />
                <span>Physical Custody Inspection Checklist</span>
              </h4>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 text-[#bec9c2] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems.condition}
                    onChange={(e) =>
                      setCheckedItems({ ...checkedItems, condition: e.target.checked })
                    }
                    className="rounded-none border-[#2a2a2a] accent-[#065f46] h-4 w-4"
                  />
                  <span>Lens, body &amp; optical sensor free of visible damage</span>
                </label>

                <label className="flex items-center gap-2 text-[#bec9c2] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems.accessories}
                    onChange={(e) =>
                      setCheckedItems({ ...checkedItems, accessories: e.target.checked })
                    }
                    className="rounded-none border-[#2a2a2a] accent-[#065f46] h-4 w-4"
                  />
                  <span>Original battery, protective strap &amp; charger present</span>
                </label>

                <label className="flex items-center gap-2 text-[#bec9c2] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems.serial}
                    onChange={(e) =>
                      setCheckedItems({ ...checkedItems, serial: e.target.checked })
                    }
                    className="rounded-none border-[#2a2a2a] accent-[#065f46] h-4 w-4"
                  />
                  <span>
                    Serial number matches encrypted registry (<strong className="text-[#8bd6b6]">{encryptedSerial}</strong>)
                  </span>
                </label>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleVerify}
              disabled={isVerifying || !allChecked || otpCode.length < 6}
              className="w-full flex items-center justify-center gap-2 rounded-none bg-[#065f46] border-2 border-[#047857] shadow-[0_4px_0_0_#003828] hover:bg-[#047857] py-3.5 text-xs font-['Silkscreen'] uppercase tracking-wider text-white active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? (
                <span>Validating Hash...</span>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-[#8bd6b6]" />
                  <span>Verify OTP &amp; Confirm Custody</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-none bg-[#065f46]/30 text-[#8bd6b6] border-2 border-[#8bd6b6] shadow-[0_4px_0_0_#003828] mb-4">
              <CheckCircle2 className="h-8 w-8 text-[#8bd6b6]" />
            </div>
            <h3 className="text-base font-['Silkscreen'] uppercase tracking-wider text-white">
              Custody Transfer Authorized!
            </h3>
            <p className="mt-1 text-xs text-[#bec9c2] font-mono max-w-sm mx-auto">
              Redis OTP validated. Chain of custody timestamp recorded. Escrow safety protocols activated for this rental period.
            </p>

            <button
              onClick={onClose}
              className="mt-6 w-full rounded-none bg-[#141414] border-2 border-[#2a2a2a] py-3 text-xs font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] hover:text-white hover:border-[#8bd6b6] transition-all cursor-pointer"
            >
              Close Console
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
// RE:USE — Modular Circular Economy Architecture
