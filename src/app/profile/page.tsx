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
} from "lucide-react";
import { useRole } from "@/lib/roleContext";

export default function ProfilePage() {
  const { currentUser, isLoggedIn, openAuthModal } = useRole();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [conditionRating, setConditionRating] = useState(5);
  const [commRating, setCommRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-700 border border-slate-200 mb-6">
          <User className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Authentication Required
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Aapne sign out / log out kar liya hai. Apni profile aur verification badges access karne ke liye log in karein.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => openAuthModal("login")}
            className="w-full sm:w-auto rounded-xl bg-emerald-800 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-900 transition-all"
          >
            Log In to Your Account
          </button>
          <Link
            href="/resources"
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Browse Public Catalog
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setIsReviewModalOpen(false);
      setComment("");
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* PROFILE HEADER (SCREEN 10) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-20 w-20 rounded-3xl object-cover ring-4 ring-emerald-500/20"
              />
              <span
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm"
                title="Verified Member"
              >
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{currentUser.name}</h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  Member since Oct 2023
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>{currentUser.neighborhood}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-white shadow-xs"
          >
            <MessageSquare className="h-4 w-4 text-emerald-400" />
            <span>Leave a Rental Review</span>
          </button>
        </div>
      </div>

      {/* MANDATORY RULE 2: SEPARATE IDENTITY VERIFICATION FROM BEHAVIORAL TRUST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Identity Badges */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Identity Verification Credentials</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              Level 3 Verified
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="font-bold text-slate-800">Government ID Verified</span>
              </div>
              <span className="text-slate-400 text-[11px]">Passport / Aadhar Verified</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="font-bold text-slate-800">Phone &amp; SMS 2FA Verified</span>
              </div>
              <span className="text-slate-400 text-[11px]">+91 &bull;&bull;&bull;&bull;&bull; 9182</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="font-bold text-slate-800">Institutional Email Verified</span>
              </div>
              <span className="text-slate-400 text-[11px]">aman@campus.edu</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
            * Identity verification confirms individual legal identification but does not measure peer behavior. Behavioral trust is tracked separately below.
          </p>
        </div>

        {/* Card 2: Behavioral Trust Badges */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>Behavioral PeerTrust Record</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              Established Trust ★★★★★
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <div className="text-slate-400 font-semibold">Completed Rentals</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {currentUser.totalTransactions} Exchanges
              </div>
              <div className="text-[10px] text-emerald-700 font-bold mt-1">Zero disputes</div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <div className="text-slate-400 font-semibold">On-Time Returns</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {currentUser.ontimeReturnRate}%
              </div>
              <div className="text-[10px] text-emerald-700 font-bold mt-1">100% Reliability</div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <div className="text-slate-400 font-semibold">Cancellation Rate</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {currentUser.cancellationRate}%
              </div>
              <div className="text-[10px] text-emerald-700 font-bold mt-1">Flawless custody</div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <div className="text-slate-400 font-semibold">Trust Score</div>
              <div className="text-2xl font-black text-emerald-800 mt-1">
                ★ {currentUser.trustScore} / 5.0
              </div>
              <div className="text-[10px] text-slate-400 mt-1">PeerTrust weighted</div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
            * PeerTrust is algorithmically weighted by reviewer credibility and volume dampening.
          </p>
        </div>
      </div>

      {/* REVIEW SUBMISSION MODAL (SCREEN 10) */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
            {reviewSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3 animate-bounce" />
                <h3 className="text-xl font-black text-slate-900">Review Submitted!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  PeerTrust credibility weights have updated the community ledger.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <h3 className="text-lg font-black text-slate-900">
                  Submit Reciprocal Rental Review
                </h3>
                <p className="text-xs text-slate-500">
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
                    className="rounded-xl bg-emerald-800 hover:bg-emerald-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs"
                  >
                    Submit Review
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
