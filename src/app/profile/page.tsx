"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  MessageSquare,
  AlertCircle,
  Award,
  User,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useRole } from "@/lib/roleContext";
import { TrustLensPanel } from "@/components/TrustLensPanel";
import { submitReviewApi } from "@/lib/api";

export default function ProfilePage() {
  const {
    currentUser,
    isLoggedIn,
    openAuthModal,
    isDigiLockerVerified,
    digiLockerData,
    openDigiLockerModal,
    resetDigiLocker,
  } = useRole();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [conditionRating, setConditionRating] = useState(5);
  const [commRating, setCommRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <div className="rounded-none bg-[#1c1b1b] border-2 border-[#2a2a2a] p-8 text-center shadow-[0_6px_0_0_#0f0f0f] space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-none bg-[#141414] text-[#8bd6b6] border-2 border-[#2a2a2a] shadow-[0_3px_0_0_#0f0f0f]">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-['Silkscreen'] uppercase tracking-wider text-white mb-2">
              Authentication Required
            </h2>
            <p className="text-xs text-[#bec9c2] font-mono leading-relaxed">
              Aapne sign out / log out kar liya hai. Apni profile aur verification badges access karne ke liye log in karein.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openAuthModal("login")}
              className="w-full sm:w-auto px-6 py-3 rounded-none bg-[#065f46] border-2 border-[#047857] text-white font-['Silkscreen'] text-xs uppercase tracking-wider shadow-[0_4px_0_0_#003828] hover:bg-[#047857] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              Log In to Account
            </button>
            <Link
              href="/resources"
              className="w-full sm:w-auto px-6 py-3 rounded-none bg-[#141414] border-2 border-[#2a2a2a] text-[#bec9c2] font-['Silkscreen'] text-xs uppercase tracking-wider shadow-[0_4px_0_0_#0f0f0f] hover:text-white hover:border-[#8bd6b6] transition-all text-center"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitReviewApi({
        booking_id: "bk_seed_101",
        reviewee_id: currentUser.id === "u_borrower_aman" ? "u_owner_rahul" : "u_borrower_aman",
        rating,
        condition_rating: conditionRating,
        communication_rating: commRating,
        comment,
      });
    } catch (e) {
      // Graceful demo handling
    } finally {
      setIsSubmitting(false);
      setReviewSubmitted(true);
      setTimeout(() => {
        setReviewSubmitted(false);
        setIsReviewModalOpen(false);
        setComment("");
      }, 1200);
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* PROFILE HEADER (SCREEN 10) */}
      <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 sm:p-8 shadow-[0_6px_0_0_#0f0f0f]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-20 w-20 rounded-2xl object-cover ring-4 ring-[#065f46]/40 border-2 border-[#2a2a2a]"
              />
              <span
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#065f46] text-[#8bd6b6] border border-[#047857] shadow-sm"
                title="Verified Member"
              >
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white font-['Silkscreen'] tracking-wide">{currentUser.name}</h1>
                <span className="rounded-lg bg-[#065f46]/40 px-2.5 py-0.5 text-xs font-mono font-bold text-[#8bd6b6] border border-[#065f46]">
                  Member since Oct 2023
                </span>
              </div>
              <p className="text-xs text-[#bec9c2] mt-1 flex items-center gap-1.5 font-mono">
                <MapPin className="h-3.5 w-3.5 text-[#8bd6b6]" />
                <span>{currentUser.neighborhood}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#065f46] hover:bg-[#047857] px-4 py-2.5 text-xs font-bold text-white uppercase tracking-wider border-2 border-[#047857] shadow-[0_4px_0_0_#003828] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <MessageSquare className="h-4 w-4 text-[#8bd6b6]" />
            <span>Leave a Rental Review</span>
          </button>
        </div>
      </div>

      {/* MANDATORY RULE 2: SEPARATE IDENTITY VERIFICATION FROM BEHAVIORAL TRUST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Identity Badges */}
        <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-[0_6px_0_0_#0f0f0f] space-y-4">
          <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 font-['Silkscreen']">
              <ShieldCheck className="h-4 w-4 text-[#8bd6b6]" />
              <span>Identity Verification Credentials</span>
            </h3>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
              isDigiLockerVerified
                ? "text-[#8bd6b6] bg-[#065f46]/40 border-[#065f46]"
                : "text-[#fbbf24] bg-[#2a2004] border-[#4a3505]"
            }`}>
              {isDigiLockerVerified ? "Level 4 (DigiLocker Verified)" : "Level 2 (KYC Pending)"}
            </span>
          </div>

          {/* DYNAMIC DIGILOCKER GOVERNMENT KYC CARD */}
          {isDigiLockerVerified ? (
            <div className="p-4 rounded-xl bg-[#141414] border-2 border-[#065f46] shadow-[inset_1px_1px_0_#202020] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🇮🇳</span>
                  <div>
                    <span className="font-bold text-xs text-white block font-['Silkscreen']">
                      DigiLocker Government Verified
                    </span>
                    <span className="text-[10px] text-[#89938d] font-mono">
                      Issued: {digiLockerData?.verifiedAt || "Oct 2026"} &bull; Token #{digiLockerData?.certificateId || "DL-98124"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#8bd6b6] bg-[#065f46] px-2.5 py-0.5 rounded-md border border-[#047857]">
                  ✓ Active UIDAI &amp; PAN
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[#1c1b1b] border border-[#2a2a2a]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#89938d] font-bold uppercase font-mono">UIDAI Aadhaar</span>
                    <CheckCircle2 className="h-3 w-3 text-[#8bd6b6]" />
                  </div>
                  <div className="font-mono font-bold text-white mt-0.5">
                    XXXX-XXXX-{digiLockerData?.aadhaarMasked || "4129"}
                  </div>
                  <div className="text-[10px] text-[#bec9c2] truncate">{currentUser.name}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#1c1b1b] border border-[#2a2a2a]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#89938d] font-bold uppercase font-mono">Income Tax PAN</span>
                    <CheckCircle2 className="h-3 w-3 text-[#8bd6b6]" />
                  </div>
                  <div className="font-mono font-bold text-white mt-0.5">
                    XXXXX{digiLockerData?.panMasked || "4312X"}
                  </div>
                  <div className="text-[10px] text-[#bec9c2]">Legal Tax Identity Verified</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#2a2a2a]">
                <span className="text-[#8bd6b6] font-bold flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#8bd6b6]" />
                  <span>75% Deposit Waiver Active on All Rentals</span>
                </span>
                <button
                  type="button"
                  onClick={resetDigiLocker}
                  className="text-[10px] text-[#89938d] hover:text-[#f87171] font-semibold underline cursor-pointer font-mono"
                  title="Reset for testing"
                >
                  Reset Demo
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#141414] border border-[#2a2a2a] shadow-[inset_1px_1px_0_#202020] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🇮🇳</span>
                  <div>
                    <span className="font-bold text-xs text-white block font-['Silkscreen']">
                      Connect with DigiLocker
                    </span>
                    <span className="text-[10px] text-[#89938d]">
                      National Digital Identity &amp; KYC Gateway
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#fbbf24] bg-[#2a2004] px-2 py-0.5 rounded-md border border-[#4a3505]">
                  KYC Pending ⚠️
                </span>
              </div>

              <p className="text-[11px] text-[#bec9c2] leading-relaxed">
                Link your DigiLocker to verify official Aadhaar, PAN &amp; College ID. Eliminates theft risk, boosts PeerTrust to 5.0★, and unlocks a <strong className="text-[#8bd6b6]">75% security deposit waiver</strong> on all equipment!
              </p>

              <button
                type="button"
                onClick={openDigiLockerModal}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#065f46] hover:bg-[#047857] py-2.5 text-xs font-bold text-white uppercase tracking-wider border-2 border-[#047857] shadow-[0_3px_0_0_#003828] active:translate-y-0.5 transition-all cursor-pointer"
              >
                <span>🇮🇳 Launch DigiLocker Verification</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Secondary Institutional & Phone Verifications */}
          <div className="space-y-2.5 text-xs pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#141414] border border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#8bd6b6]" />
                <span className="font-bold text-white">Campus Student Enrollment</span>
              </div>
              <span className="text-[#89938d] font-mono text-[11px]">{currentUser.neighborhood || "Campus Hub"}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#141414] border border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#8bd6b6]" />
                <span className="font-bold text-white">Phone &amp; SMS 2FA Verified</span>
              </div>
              <span className="text-[#89938d] font-mono text-[11px]">+91 &bull;&bull;&bull;&bull;&bull; 8712</span>
            </div>
          </div>

          <p className="text-[11px] text-[#89938d] leading-relaxed pt-1">
            * Legal identity verification protects gear owners and campus community. Raw biometric data is never stored on RE:USE servers.
          </p>
        </div>

        {/* Card 2: Behavioral Trust Badges */}
        <div className="rounded-2xl border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-[0_6px_0_0_#0f0f0f] space-y-4">
          <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 font-['Silkscreen']">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>Behavioral PeerTrust Record</span>
            </h3>
            <span className="text-[10px] font-mono font-bold text-[#8bd6b6] bg-[#065f46]/40 border border-[#065f46] px-2 py-0.5 rounded-md">
              Established Trust ★★★★★
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-[#141414] p-4 border border-[#2a2a2a] shadow-[inset_1px_1px_0_#202020]">
              <div className="text-[#89938d] font-semibold font-mono">Completed Rentals</div>
              <div className="text-xl sm:text-2xl font-bold text-white mt-1 font-pixel">
                {currentUser.totalTransactions} Exchanges
              </div>
              <div className="text-[10px] text-[#8bd6b6] font-bold mt-1 font-mono">Zero disputes</div>
            </div>

            <div className="rounded-xl bg-[#141414] p-4 border border-[#2a2a2a] shadow-[inset_1px_1px_0_#202020]">
              <div className="text-[#89938d] font-semibold font-mono">On-Time Returns</div>
              <div className="text-xl sm:text-2xl font-bold text-white mt-1 font-pixel">
                {currentUser.ontimeReturnRate}%
              </div>
              <div className="text-[10px] text-[#8bd6b6] font-bold mt-1 font-mono">100% Reliability</div>
            </div>

            <div className="rounded-xl bg-[#141414] p-4 border border-[#2a2a2a] shadow-[inset_1px_1px_0_#202020]">
              <div className="text-[#89938d] font-semibold font-mono">Cancellation Rate</div>
              <div className="text-xl sm:text-2xl font-bold text-white mt-1 font-pixel">
                {currentUser.cancellationRate}%
              </div>
              <div className="text-[10px] text-[#8bd6b6] font-bold mt-1 font-mono">Flawless custody</div>
            </div>

            <div className="rounded-xl bg-[#141414] p-4 border border-[#2a2a2a] shadow-[inset_1px_1px_0_#202020]">
              <div className="text-[#89938d] font-semibold font-mono">Trust Score</div>
              <div className="text-xl sm:text-2xl font-black text-[#8bd6b6] mt-1 font-mono">
                ★ {currentUser.trustScore} / 5.0
              </div>
              <div className="text-[10px] text-[#89938d] mt-1 font-mono">PeerTrust weighted</div>
            </div>
          </div>

          <p className="text-[11px] text-[#89938d] leading-relaxed pt-2">
            * PeerTrust is algorithmically weighted by reviewer credibility and volume dampening.
          </p>
        </div>
      </div>

      {/* TRUSTLENS: REPUTATION CONFIDENCE ENGINE */}
      <TrustLensPanel userId={currentUser.id} userName={currentUser.name} />

      {/* REVIEW SUBMISSION MODAL (SCREEN 10) */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#1c1b1b] p-6 sm:p-8 shadow-2xl border-2 border-[#2a2a2a]">
            {reviewSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-[#8bd6b6] mx-auto mb-3 animate-bounce" />
                <h3 className="text-lg font-bold text-white font-['Silkscreen'] tracking-wide uppercase">Review Submitted!</h3>
                <p className="text-xs text-[#bec9c2] mt-1">
                  PeerTrust credibility weights have updated the community ledger.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <h3 className="text-base font-bold text-white font-['Silkscreen'] tracking-wide uppercase">
                  Submit Reciprocal Rental Review
                </h3>
                <p className="text-xs text-[#bec9c2]">
                  Gated to completed physical rentals &bull; Both parties review mutually.
                </p>

                {/* Overall Rating */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Overall Experience (1–5 Stars)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className={`p-2 rounded-xl border text-xs font-black transition-all ${
                          rating >= s
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        ★ {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition Rating */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Equipment Condition (1–5)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setConditionRating(s)}
                        className={`p-2 rounded-xl border text-xs font-black transition-all ${
                          conditionRating >= s
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Reciprocal Review Comments
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe item condition, battery status, and timeliness of handover..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-emerald-800 hover:bg-emerald-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting Review..." : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
