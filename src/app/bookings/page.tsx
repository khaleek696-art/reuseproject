"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Package,
  KeyRound,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  FileText,
  MessageSquare,
  Lock,
  ArrowRight,
  RotateCcw,
  Zap,
} from "lucide-react";
import { useRole, LiveBooking } from "@/lib/roleContext";
import { RedisOtpModal } from "@/components/RedisOtpModal";
import { ReturnOtpRefundModal } from "@/components/ReturnOtpRefundModal";
import { ChatDrawer } from "@/components/ChatDrawer";
import { RentalAgreementModal } from "@/components/RentalAgreementModal";

function BookingsContent() {
  const searchParams = useSearchParams();
  const { role, currentUser, bookings, updateBookingStage, advanceBookingStage } = useRole();
  const initialTab = searchParams.get("tab") === "requests" || role === "owner" ? "owner" : "borrower";

  const [activeTab, setActiveTab] = useState<"borrower" | "owner">(initialTab);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedBookingForModal, setSelectedBookingForModal] = useState<LiveBooking | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState({ name: "Priya Patel", role: "Owner", title: "Equipment" });

  const [isContractOpen, setIsContractOpen] = useState(false);
  const [contractOwner, setContractOwner] = useState("Priya Patel");

  const [lastRefundTxn, setLastRefundTxn] = useState("");

  const stageList = [
    { title: "REQUESTED", desc: "Borrower requested equipment" },
    { title: "ACCEPTED", desc: "Owner approved & locked dates" },
    { title: "ACTIVE IN TRANSIT", desc: "Physical courier pickup verified" },
    { title: "RETURNED", desc: "Equipment handed back to owner" },
    { title: "COMPLETED", desc: "Deposit released & rental finalized" },
  ];

  const handleOpenChat = (recipientName: string, recipientRole: string, title: string) => {
    setChatRecipient({ name: recipientName, role: recipientRole, title });
    setIsChatOpen(true);
  };

  const handleOpenContract = (ownerName: string) => {
    setContractOwner(ownerName);
    setIsContractOpen(true);
  };

  const handleOpenRefundModal = (booking: LiveBooking) => {
    setSelectedBookingForModal(booking);
    setIsRefundModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Bookings &amp; Rentals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track active borrowings, OTP handoffs, and instant deposit refund status
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("borrower")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "borrower"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            My Rentals (Borrower) ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("owner")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "owner"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Incoming Requests (Owner) ({bookings.length})
          </button>
        </div>
      </div>

      {/* Success Notification Banner if Refund Released */}
      {lastRefundTxn && (
        <div className="mb-6 rounded-2xl bg-emerald-50 p-4 border border-emerald-300 text-emerald-950 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-black uppercase tracking-wider text-emerald-800">
                Deposit Refund Verified &bull; {lastRefundTxn}
              </span>
              <span className="text-xs text-emerald-900 font-medium">
                Security Deposit has been released directly to borrower&apos;s UPI account. Escrow Vault closed.
              </span>
            </div>
          </div>
          <span className="text-xs font-bold bg-emerald-600 text-white px-3 py-1 rounded-lg">
            ✓ COMPLETED
          </span>
        </div>
      )}

      {/* TAB 1: BORROWER VIEW */}
      {activeTab === "borrower" && (
        <div className="space-y-6">
          {bookings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-900">No Active Borrowings Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You haven&apos;t booked any equipment yet. Explore local cameras, tools, projectors, and gear near you.
              </p>
            </div>
          ) : (
            bookings.map((booking) => {
              const currentStageIndex = booking.stageIndex ?? 0;

              return (
                <div key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                  {/* Booking Title & Actions Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
                    <div className="flex items-center gap-4">
                      {booking.resourceImage && (
                        <img
                          src={booking.resourceImage}
                          alt={booking.resourceTitle}
                          className="h-14 w-14 rounded-2xl object-cover border border-slate-200"
                        />
                      )}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Active Booking #{booking.id}
                        </span>
                        <h3 className="text-xl font-black text-slate-900">
                          {booking.resourceTitle}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Owner: {booking.ownerName} &bull; Courier: Vikram Cargo Bike
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleOpenContract(booking.ownerName)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span>View Contract</span>
                      </button>

                      <button
                        onClick={() => handleOpenChat(booking.ownerName, "Equipment Owner", booking.resourceTitle)}
                        className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4 text-emerald-700" />
                        <span>Chat Owner</span>
                      </button>

                      {/* INSTANT DEPOSIT REFUND RELEASE BUTTON */}
                      {currentStageIndex < 4 ? (
                        <button
                          onClick={() => handleOpenRefundModal(booking)}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 px-4 py-2 text-xs font-bold text-white shadow-xs active:scale-95 transition-all"
                        >
                          <Zap className="h-4 w-4 text-emerald-300" />
                          <span>Verify Return &amp; Release Deposit (₹{booking.deposit})</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 px-3.5 py-2 text-xs font-bold">
                          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                          <span>Completed &amp; Deposit Refunded</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* INTERACTIVE 5-STAGE CUSTODY PROGRESS STEPPER */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Rental Custody Progress (Click Stage Card to Advance)
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateBookingStage(booking.id, 0)}
                          className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Reset Stage</span>
                        </button>
                        {currentStageIndex < 4 && (
                          <button
                            onClick={() => advanceBookingStage(booking.id)}
                            className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1"
                          >
                            <span>Next Stage 0{currentStageIndex + 2}</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 5 Stage Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {stageList.map((s, idx) => {
                        const isCompleted = idx < currentStageIndex;
                        const isActive = idx === currentStageIndex;

                        return (
                          <div
                            key={idx}
                            onClick={() => updateBookingStage(booking.id, idx)}
                            className={`cursor-pointer rounded-2xl p-3.5 border text-center transition-all duration-300 ${
                              isActive
                                ? "bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-600/30 shadow-xs"
                                : isCompleted
                                ? "bg-slate-50 border-emerald-400 text-emerald-900"
                                : "bg-slate-50/50 border-slate-200 text-slate-400 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <div className="text-[10px] font-mono font-black tracking-wider">
                              {isCompleted ? "✓ DONE" : `STAGE 0${idx + 1}`}
                            </div>
                            <div className="text-xs font-black mt-1">{s.title}</div>
                            <div className="text-[10px] mt-1 line-clamp-1 text-slate-500">
                              {s.desc}
                            </div>

                            {isActive && (
                              <div className="mt-1.5 text-[9px] font-black text-emerald-700 animate-pulse bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block">
                                ● CURRENT ACTIVE
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* DYNAMIC ESCROW BREAKDOWN BOX WITH REFUND TRIGGER */}
                  <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Verified Smart Escrow Vault</span>
                      </span>
                      {currentStageIndex === 4 ? (
                        <span className="rounded px-2.5 py-1 text-[10px] font-extrabold bg-emerald-600 text-white">
                          ✓ Deposit ₹{booking.deposit} Refund Released via Razorpay
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenRefundModal(booking)}
                          className="rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold px-3 py-1 shadow-xs transition-all flex items-center gap-1"
                        >
                          <Zap className="h-3 w-3 text-emerald-300" />
                          <span>Instant Refund ₹{booking.deposit}</span>
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Daily Rate</span>
                        <span className="font-bold text-slate-900">₹{booking.pricePerDay} / day</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Refundable Deposit</span>
                        <span className="font-bold text-slate-900">₹{booking.deposit}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Security Deposit Hold</span>
                        <span className={`font-bold ${currentStageIndex === 4 ? "line-through text-slate-400" : "text-emerald-800"}`}>
                          ₹{booking.deposit}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Escrow Vault</span>
                        <span className="font-extrabold text-slate-900 text-sm">₹{booking.totalEscrow}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: OWNER VIEW */}
      {activeTab === "owner" && (
        <div className="space-y-6">
          {bookings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-900">No Incoming Requests Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                When campus peers request to borrow your listed equipment, rental requests will appear here for your approval.
              </p>
            </div>
          ) : (
            bookings.map((booking) => {
              const stageIndex = booking.stageIndex ?? 0;
              const isApproved = stageIndex > 0;

              return (
                <div key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      {booking.resourceImage && (
                        <img
                          src={booking.resourceImage}
                          alt={booking.resourceTitle}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-200"
                        />
                      )}
                      <div>
                        <h3 className="font-black text-slate-900 text-base">
                          Incoming Rental Request #{booking.id}
                        </h3>
                        <span className="text-xs text-slate-500 font-semibold">
                          Borrower: <span className="text-slate-900 font-bold">{booking.borrowerName}</span>
                        </span>
                      </div>
                    </div>

                    <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold border ${
                      isApproved 
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                        : "bg-amber-100 text-amber-900 border-amber-300"
                    }`}>
                      {isApproved ? `✓ ${booking.statusText}` : "Awaiting Owner Approval"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-900 block">
                        {booking.borrowerName} requested: <span className="text-emerald-800 font-black">{booking.resourceTitle}</span>
                      </span>
                      <span className="text-xs text-slate-500 block">
                        Rate: ₹{booking.pricePerDay}/day &bull; Deposit Escrow: ₹{booking.deposit} &bull; Total: ₹{booking.totalEscrow}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isApproved && (
                        <button
                          onClick={() => advanceBookingStage(booking.id)}
                          className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-900 shadow-xs flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                          <span>Approve &amp; Accept Request</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenChat(booking.borrowerName, "Borrower", booking.resourceTitle)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Message Borrower
                      </button>
                      <button
                        onClick={() => handleOpenRefundModal(booking)}
                        className="rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 px-4 py-2 text-xs font-bold hover:bg-emerald-100 shadow-xs flex items-center gap-1 transition-colors"
                      >
                        <Zap className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Verify Return &amp; Refund</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODALS & DRAWERS */}
      <RedisOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={() => {
          if (selectedBookingForModal) {
            advanceBookingStage(selectedBookingForModal.id);
          }
        }}
      />

      <ReturnOtpRefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        itemTitle={selectedBookingForModal?.resourceTitle || "Equipment"}
        borrowerName={selectedBookingForModal?.borrowerName || "Borrower"}
        depositAmount={selectedBookingForModal?.deposit || 1500}
        onSuccess={(refundTxnId) => {
          if (selectedBookingForModal) {
            updateBookingStage(selectedBookingForModal.id, 4); // Stage 5 COMPLETED
          }
          setLastRefundTxn(refundTxnId);
        }}
      />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        recipientName={chatRecipient.name}
        recipientRole={chatRecipient.role}
        resourceTitle={chatRecipient.title}
      />

      <RentalAgreementModal
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
        borrowerName={currentUser.name}
        ownerName={contractOwner}
      />
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading bookings...</div>}>
      <BookingsContent />
    </Suspense>
  );
}
