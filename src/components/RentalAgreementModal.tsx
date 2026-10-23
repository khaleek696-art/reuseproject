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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-none bg-[#1c1b1b] p-6 sm:p-8 shadow-[0_8px_0_0_#0f0f0f] border-2 border-[#2a2a2a] animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-none p-2 bg-[#141414] border border-[#2a2a2a] text-[#bec9c2] hover:text-white hover:border-[#8bd6b6] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b-2 border-[#2a2a2a] pb-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-none bg-[#065f46] border-2 border-[#047857] text-[#8bd6b6]">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-['Silkscreen'] uppercase tracking-wider text-white">Digital Equipment Contract</h2>
              <span className="rounded-none bg-[#065f46]/30 px-2 py-0.5 text-[9px] font-['Silkscreen'] uppercase tracking-wider text-[#8bd6b6] border border-[#8bd6b6]/30">
                BINDING
              </span>
            </div>
            <p className="text-[10px] text-[#89938d] font-mono mt-0.5">
              Contract ID: #REUSE-AGR-2026-90412 &bull; Verified Chain of Custody
            </p>
          </div>
        </div>

        {/* Document Body */}
        <div className="space-y-5 text-xs text-[#bec9c2] leading-relaxed font-mono bg-[#141414] p-5 rounded-none border-2 border-[#2a2a2a]">
          {/* Parties Section */}
          <div className="grid grid-cols-2 gap-4 border-b border-[#2a2a2a] pb-4">
            <div>
              <span className="text-[9px] font-['Silkscreen'] uppercase tracking-wider text-[#89938d] block mb-1">
                Owner (Lender)
              </span>
              <span className="font-bold text-white text-xs block">{ownerName}</span>
              <span className="text-[10px] text-[#8bd6b6] font-mono">[✓ Verified Govt ID &amp; Bank Linked]</span>
            </div>
            <div>
              <span className="text-[9px] font-['Silkscreen'] uppercase tracking-wider text-[#89938d] block mb-1">
                Borrower (Recipient)
              </span>
              <span className="font-bold text-white text-xs block">{borrowerName}</span>
              <span className="text-[10px] text-[#8bd6b6] font-mono">[✓ Aadhaar / Student ID Verified]</span>
            </div>
          </div>

          {/* Asset Specs */}
          <div>
            <span className="text-[9px] font-['Silkscreen'] uppercase tracking-wider text-[#89938d] block mb-1">
              Equipment Details
            </span>
            <div className="bg-[#0e0e0e] p-3 rounded-none border border-[#2a2a2a] space-y-1">
              <span className="font-['Silkscreen'] text-white text-xs block">
                {resource?.title || "Sony FX3 4K Cinema Camera Kit"}
              </span>
              <span className="text-[11px] text-[#89938d] block font-mono">
                Encrypted Serial Hash: <code className="bg-[#1c1b1b] px-1 py-0.5 rounded-none font-mono text-[10px] text-[#8bd6b6]">AES256-904128-SFX3</code>
              </span>
              <span className="text-[11px] text-[#bec9c2] block font-mono">
                Security Deposit Hold: ₹{resource?.deposit || 1500} (Held in Smart Escrow)
              </span>
            </div>
          </div>

          {/* Mandatory Safety Terms */}
          <div className="space-y-2">
            <span className="text-[9px] font-['Silkscreen'] uppercase tracking-wider text-[#89938d] block">
              Terms &amp; Physical Handoff Protocol
            </span>
            <ul className="space-y-1.5 list-disc pl-4 text-[#bec9c2] text-[11px]">
              <li>Custody is transferred only upon entering the <strong className="text-white">6-digit Redis OTP</strong> at physical pickup.</li>
              <li>Borrower assumes full physical custody until the <strong className="text-white">Return OTP</strong> is submitted by owner.</li>
              <li>Late returns exceeding 2 hours incur standard hourly escrow adjustments.</li>
              <li>Any loss or unreturned property is subject to automatic Escrow Security Deposit forfeiture and legal escalation.</li>
            </ul>
          </div>

          {/* Verification Signatures */}
          <div className="border-t border-[#2a2a2a] pt-3 flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-1.5 text-[#8bd6b6] font-['Silkscreen'] uppercase">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#8bd6b6]" />
              <span>Digital Signature Verified</span>
            </div>
            <span className="text-[#89938d]">Timestamp: 2026-09-24 21:53:00 IST</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={() => alert("Agreement PDF Download Started")}
            className="flex items-center gap-2 rounded-none border-2 border-[#2a2a2a] bg-[#141414] px-4 py-2.5 text-xs font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] hover:text-white hover:border-[#8bd6b6] transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-none bg-[#065f46] border-2 border-[#047857] shadow-[0_4px_0_0_#003828] hover:bg-[#047857] px-5 py-2.5 text-xs font-['Silkscreen'] uppercase tracking-wider text-white active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <span>Acknowledge &amp; Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
// RE:USE — Modular Circular Economy Architecture
