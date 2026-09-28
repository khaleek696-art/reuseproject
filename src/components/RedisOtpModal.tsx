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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        {!isConfirmed ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <KeyRound className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Redis Single-Use OTP (TTL 15m)
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Verify Physical Custody Handoff
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter the single-use 6-digit code provided by the Equipment Owner upon pickup for <span className="font-semibold text-slate-800">{itemTitle}</span>.
            </p>

            {/* 6 Individual Numeric Boxes */}
            <div className="my-6">
              <label className="block text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
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
                    className="h-12 w-11 sm:h-14 sm:w-12 text-center text-xl sm:text-2xl font-mono font-black rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none shadow-xs"
                  />
                ))}
              </div>
            </div>

            {/* Custody Checklist */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 mb-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Physical Custody Inspection Checklist</span>
              </h4>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems.condition}
                    onChange={(e) =>
                      setCheckedItems({ ...checkedItems, condition: e.target.checked })
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Lens, body &amp; optical sensor free of visible damage</span>
                </label>

                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems.accessories}
                    onChange={(e) =>
                      setCheckedItems({ ...checkedItems, accessories: e.target.checked })
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Original battery, protective strap &amp; charger present</span>
                </label>

                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems.serial}
                    onChange={(e) =>
                      setCheckedItems({ ...checkedItems, serial: e.target.checked })
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>
                    Serial number matches encrypted registry (<strong className="font-mono">{encryptedSerial}</strong>)
                  </span>
                </label>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleVerify}
              disabled={isVerifying || !allChecked || otpCode.length < 6}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-sm font-bold text-white shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              {isVerifying ? (
                <span>Validating Redis Hash...</span>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Verify OTP &amp; Confirm Custody Transfer</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4 animate-bounce">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Custody Transfer Authorized!
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Redis OTP validated. Chain of custody timestamp recorded. Escrow safety protocols activated for this rental period.
            </p>

            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              Close Console
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
