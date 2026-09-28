"use client";

import React from "react";
import {
  X,
  ShieldCheck,
  FileText,
  Lock,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Building,
} from "lucide-react";
import { Resource } from "@/lib/types";

interface RentalAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource?: Resource;
  borrowerName?: string;
  ownerName?: string;
}

export function RentalAgreementModal({
  isOpen,
  onClose,
  resource,
  borrowerName = "Aman Sharma",
  ownerName = "Priya Patel",
}: RentalAgreementModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">Digital Shared Equipment Contract</h2>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-300 uppercase">
                Legal Binding
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Contract ID: #REUSE-AGR-2026-90412 &bull; Verified Chain of Custody
            </p>
          </div>
        </div>

        {/* Document Body */}
        <div className="space-y-5 text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/60 p-5 rounded-2xl border border-slate-200">
          {/* Parties Section */}
          <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Resource Owner (Lender)
              </span>
              <span className="font-bold text-slate-900 text-sm block">{ownerName}</span>
              <span className="text-[11px] text-emerald-700 font-semibold">[✓ Verified Govt ID &amp; Bank Linked]</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Borrower (Recipient)
              </span>
              <span className="font-bold text-slate-900 text-sm block">{borrowerName}</span>
              <span className="text-[11px] text-emerald-700 font-semibold">[✓ Aadhaar / Student ID Verified]</span>
            </div>
          </div>

          {/* Asset Specs */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Equipment &amp; Hardware Details
            </span>
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 text-sm block">
                {resource?.title || "Sony FX3 4K Cinema Camera Kit"}
              </span>
              <span className="text-xs text-slate-500 block">
                Encrypted Serial Hash: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">AES256-904128-SFX3</code>
              </span>
              <span className="text-xs text-slate-600 block">
                Security Deposit Hold: ₹{resource?.deposit || 1500} (Held in Smart Escrow)
              </span>
            </div>
          </div>

          {/* Mandatory Safety Terms */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Terms &amp; Physical Handoff Protocol
            </span>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
              <li>Custody is transferred only upon entering the <strong>6-digit Redis OTP</strong> at physical pickup.</li>
              <li>Borrower assumes full physical custody until the <strong>Return OTP</strong> is submitted by owner.</li>
              <li>Late returns exceeding 2 hours incur standard hourly escrow adjustments.</li>
              <li>Any loss or unreturned property is subject to automatic Escrow Security Deposit forfeiture and legal escalation.</li>
            </ul>
          </div>

          {/* Verification Signatures */}
          <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              <span>Digital Cryptographic Signature Verified</span>
            </div>
            <span className="text-slate-400">Timestamp: 2026-09-24 21:53:00 IST</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={() => alert("Agreement PDF Download Started")}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
          >
            <span>Acknowledge &amp; Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
