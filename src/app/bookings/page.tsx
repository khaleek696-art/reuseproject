"use client";

import React, { useState, useEffect, Suspense } from "react";
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
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Calendar,
  IndianRupee,
  UserCheck,
  ChevronRight,
  Award,
} from "lucide-react";
import { useRole, LiveBooking } from "@/lib/roleContext";
import { RedisOtpModal } from "@/components/RedisOtpModal";
import { ReturnOtpRefundModal } from "@/components/ReturnOtpRefundModal";
import { ChatDrawer } from "@/components/ChatDrawer";
import { RentalAgreementModal } from "@/components/RentalAgreementModal";

function BookingsContent() {
  const searchParams = useSearchParams();
  const {
    role,
    setRole,
    currentUser,
    bookings,
    updateBookingStage,
    advanceBookingStage,
    resetBookingsDemo,
  } = useRole();

  // URL param or context role determines the initial tab
  const paramTab = searchParams.get("tab") === "requests" ? "owner" : null;
  const [activeTab, setActiveTab] = useState<"borrower" | "owner">(
    paramTab || (role === "owner" ? "owner" : "borrower")
  );

  // Sync activeTab when role changes from the Navbar dropdown
  useEffect(() => {
    if (role === "owner" || role === "borrower") {
      setActiveTab(role);
    }
  }, [role]);

  // Handle switching tabs: sync local view and global role context
  const handleTabSwitch = (newTab: "borrower" | "owner") => {
    setActiveTab(newTab);
    setRole(newTab);
  };

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedBookingForModal, setSelectedBookingForModal] = useState<LiveBooking | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState({
    name: "Priya Patel",
    role: "Owner",
    title: "Equipment",
  });

  const [isContractOpen, setIsContractOpen] = useState(false);
  const [contractOwner, setContractOwner] = useState("Priya Patel");
  const [contractBorrower, setContractBorrower] = useState("Khaleeq Ahmad");

  const [lastRefundTxn, setLastRefundTxn] = useState("");
  const [copiedOtpId, setCopiedOtpId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedOtpId(id);
      setTimeout(() => setCopiedOtpId(null), 2000);
    }
  };

  const stageList = [
    { num: "01", title: "REQUESTED", desc: "Borrower escrow deposit held", activeLabel: "Awaiting Owner" },
    { num: "02", title: "ACCEPTED", desc: "Dates locked & Pickup OTP generated", activeLabel: "Ready for Pickup" },
    { num: "03", title: "ACTIVE RENTAL", desc: "Physical OTP verified; gear in use", activeLabel: "In Custody" },
    { num: "04", title: "RETURN HANDOFF", desc: "Item returned; inspection pending", activeLabel: "Inspection Pending" },
    { num: "05", title: "COMPLETED", desc: "Return verified; deposit refunded", activeLabel: "Deposit Refunded" },
  ];

  const handleOpenChat = (recipientName: string, recipientRole: string, title: string) => {
    setChatRecipient({ name: recipientName, role: recipientRole, title });
    setIsChatOpen(true);
  };

  const handleOpenContract = (ownerName: string, borrowerName: string) => {
    setContractOwner(ownerName);
    setContractBorrower(borrowerName);
    setIsContractOpen(true);
  };

  const handleOpenHandoverModal = (booking: LiveBooking) => {
    setSelectedBookingForModal(booking);
    setIsOtpModalOpen(true);
  };

  const handleOpenRefundModal = (booking: LiveBooking) => {
    setSelectedBookingForModal(booking);
    setIsRefundModalOpen(true);
  };

  // 1. Filter bookings where current user is the borrower
  const borrowerBookings = bookings.filter(
    (b) =>
      b.borrowerName === currentUser.name ||
      b.borrowerName === "Khaleeq Ahmad" ||
      b.id === "BK-98421"
  );

  // 2. Filter bookings where current user is the owner (lending equipment out)
  const ownerBookings = bookings.filter(
    (b) =>
      b.ownerName === currentUser.name ||
      b.ownerName === "Khaleeq Ahmad" ||
      b.ownerName === "Verified Owner" ||
      b.id === "BK-77219"
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Banner & Persona Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#2a2a2a] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-none bg-[#065f46]/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#8bd6b6] border border-[#065f46] uppercase">
              <ShieldCheck className="h-3 w-3 text-[#8bd6b6]" />
              <span>Escrow-Guaranteed Peer Handoff</span>
            </span>
            <span className="text-xs text-[#89938d] font-mono hidden sm:inline">
              &bull; 4-Digit Mutual Verification
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-pixel tracking-wider uppercase">
            {activeTab === "borrower" ? "My Borrowings & Rentals" : "Owner Equipment Lending Desk"}
          </h1>
          <p className="text-xs sm:text-sm text-[#bec9c2] mt-0.5">
            {activeTab === "borrower"
              ? "Track equipment you are renting from campus peers. View pickup OTP, monitor active custody, and track deposit refund."
              : "Manage incoming requests from students to borrow your listed gear. Approve dates, verify physical handoff, and authorize refunds."}
          </p>
        </div>

        {/* Dynamic Role / Desk Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-[#141414] p-1 rounded-none border-2 border-[#2a2a2a] w-full sm:w-auto shadow-[0_4px_0_0_#0f0f0f]">
            <button
              onClick={() => handleTabSwitch("borrower")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-none px-4 py-2.5 text-xs font-bold transition-all uppercase tracking-wider font-pixel cursor-pointer ${
                activeTab === "borrower"
                  ? "bg-[#065f46] text-white border-2 border-[#047857] shadow-[0_2px_0_0_#003828]"
                  : "text-[#89938d] hover:text-[#e5e2e1]"
              }`}
            >
              <span>🎒 Borrower Desk</span>
              <span className={`px-1.5 py-0.2 rounded-none text-[10px] font-mono ${
                activeTab === "borrower" ? "bg-[#003828] text-[#8bd6b6]" : "bg-[#201f1f] text-[#89938d]"
              }`}>
                {borrowerBookings.length}
              </span>
            </button>

            <button
              onClick={() => handleTabSwitch("owner")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-none px-4 py-2.5 text-xs font-bold transition-all uppercase tracking-wider font-pixel cursor-pointer ${
                activeTab === "owner"
                  ? "bg-[#065f46] text-white border-2 border-[#047857] shadow-[0_2px_0_0_#003828]"
                  : "text-[#89938d] hover:text-[#e5e2e1]"
              }`}
            >
              <span>💼 Owner Desk</span>
              <span className={`px-1.5 py-0.2 rounded-none text-[10px] font-mono ${
                activeTab === "owner" ? "bg-[#003828] text-[#8bd6b6]" : "bg-[#201f1f] text-[#89938d]"
              }`}>
                {ownerBookings.length}
              </span>
            </button>
          </div>

          <button
            onClick={() => resetBookingsDemo()}
            title="Reset demo bookings state"
            className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-[#89938d] hover:text-white px-2.5 py-2 rounded-none border border-[#2a2a2a] bg-[#141414] cursor-pointer transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Role State Banner */}
      <div className="rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-none bg-[#065f46] text-[#8bd6b6] border border-[#047857] flex items-center justify-center font-bold">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[#89938d] font-mono">Active Persona:</span>{" "}
            <span className="font-bold text-white font-pixel uppercase">
              {currentUser.name} ({activeTab === "borrower" ? "Borrower Mode" : "Owner Mode"})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-[#bec9c2]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-none bg-[#8bd6b6] inline-block animate-pulse" />
            Escrow Status: Razorpay Vault Active
          </span>
          <span className="hidden sm:inline text-[#3a3a3a]">|</span>
          <span className="hidden sm:inline text-[#89938d]">
            Redis TTL: 15 min OTP window
          </span>
        </div>
      </div>

      {/* Success Notification Banner if Refund Released */}
      {lastRefundTxn && (
        <div className="rounded-none bg-[#065f46]/20 p-4 border-2 border-[#047857] text-[#8bd6b6] flex items-center justify-between animate-in fade-in shadow-[0_4px_0_0_#003828]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-none bg-[#065f46] text-[#8bd6b6] flex items-center justify-center font-bold border border-[#047857]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-bold font-pixel uppercase tracking-wider text-[#8bd6b6]">
                Deposit Refund Verified &bull; {lastRefundTxn}
              </span>
              <span className="text-xs text-[#bec9c2]">
                Security Deposit has been refunded directly to borrower&apos;s UPI ID via Razorpay Escrow. Vault closed.
              </span>
            </div>
          </div>
          <span className="text-xs font-bold font-pixel bg-[#065f46] text-white px-3 py-1 rounded-none border border-[#047857]">
            ✓ COMPLETED
          </span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 🎒 TAB 1: BORROWER VIEW (Only items being rented by the user)      */}
      {/* =================================================================== */}
      {activeTab === "borrower" && (
        <div className="space-y-6">
          {borrowerBookings.length === 0 ? (
            <div className="rounded-none border-2 border-dashed border-[#2a2a2a] bg-[#1c1b1b] p-12 text-center shadow-[0_4px_0_0_#0f0f0f]">
              <Package className="mx-auto h-12 w-12 text-[#89938d] mb-3" />
              <h3 className="text-base font-bold text-white font-pixel tracking-wider uppercase">
                No Active Borrowings Found
              </h3>
              <p className="text-xs text-[#bec9c2] mt-1 max-w-sm mx-auto font-mono">
                You haven&apos;t rented any equipment yet. Explore local cameras, laptops, tools, and projectors in your campus mesh.
              </p>
            </div>
          ) : (
            borrowerBookings.map((booking) => {
              const currentStageIndex = booking.stageIndex ?? 0;
              const handoverOtp = booking.handoverOtp || "582914";
              const returnOtp = booking.returnOtp || "849201";

              return (
                <div
                  key={booking.id}
                  className="rounded-none border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 sm:p-7 shadow-[0_6px_0_0_#0f0f0f] space-y-6"
                >
                  {/* Top Bar: Item Meta + Borrower Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2a2a2a] pb-5">
                    <div className="flex items-center gap-4">
                      {booking.resourceImage && (
                        <div className="h-16 w-16 rounded-none bg-[#0e0e0e] border-2 border-[#2a2a2a] flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-[inset_2px_2px_0_#000]">
                          <img
                            src={booking.resourceImage}
                            alt={booking.resourceTitle}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8bd6b6] bg-[#065f46]/30 px-2 py-0.5 border border-[#065f46]">
                            ACTIVE BORROWING #{booking.id}
                          </span>
                          <span className="text-[10px] font-mono text-[#89938d]">
                            Due: {booking.endDate || "Tomorrow 08:00 PM"}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white font-pixel tracking-wider mt-1 uppercase">
                          {booking.resourceTitle}
                        </h3>
                        <p className="text-xs text-[#bec9c2] mt-0.5">
                          Equipment Owner: <span className="text-white font-bold">{booking.ownerName}</span> &bull; Courier: Vikram Cargo Bike
                        </p>
                      </div>
                    </div>

                    {/* Borrower Top Actions (No owner controls!) */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => handleOpenContract(booking.ownerName, booking.borrowerName)}
                        className="flex items-center gap-1.5 rounded-none border-2 border-[#353534] bg-[#141414] hover:bg-[#201f1f] px-3.5 py-2 text-xs font-bold text-[#e5e2e1] uppercase tracking-wider font-pixel shadow-[0_2px_0_0_#0f0f0f] transition-colors cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 text-[#89938d]" />
                        <span>Contract</span>
                      </button>

                      <button
                        onClick={() =>
                          handleOpenChat(booking.ownerName, "Equipment Owner", booking.resourceTitle)
                        }
                        className="flex items-center gap-1.5 rounded-none border-2 border-[#065f46] bg-[#065f46]/30 hover:bg-[#065f46]/50 px-3.5 py-2 text-xs font-bold text-[#8bd6b6] uppercase tracking-wider font-pixel shadow-[0_2px_0_0_#003828] transition-colors cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-[#8bd6b6]" />
                        <span>Chat Owner</span>
                      </button>

                      {/* Demo simulation shortcut for testing next stage without blocking */}
                      {currentStageIndex < 4 && (
                        <button
                          onClick={() => advanceBookingStage(booking.id)}
                          className="flex items-center gap-1 rounded-none border border-[#353534] bg-[#141414] hover:bg-[#201f1f] px-2.5 py-2 text-[10px] font-mono text-[#89938d] hover:text-white transition-colors cursor-pointer"
                          title="Simulate step advance for quick demo testing"
                        >
                          <span>Simulate Next</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* REALISTIC 5-STAGE CUSTODY PROGRESS TIMELINE (Informative, non-arbitrary) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#8bd6b6]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-white font-pixel">
                          Rental Custody Lifecycle Timeline
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#8bd6b6]">
                        Stage 0{currentStageIndex + 1} of 05 &bull; {stageList[currentStageIndex]?.title}
                      </span>
                    </div>

                    {/* Stepper Timeline Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {stageList.map((s, idx) => {
                        const isCompleted = idx < currentStageIndex;
                        const isActive = idx === currentStageIndex;

                        return (
                          <div
                            key={idx}
                            className={`rounded-none p-3 border-2 text-center transition-all ${
                              isActive
                                ? "bg-[#065f46]/30 border-[#8bd6b6] text-white shadow-[0_4px_0_0_#003828]"
                                : isCompleted
                                ? "bg-[#141414] border-[#047857] text-[#8bd6b6]"
                                : "bg-[#141414]/40 border-[#262626] text-[#89938d] opacity-50"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                              <span>STAGE {s.num}</span>
                              {isCompleted && <span className="text-[#8bd6b6]">✓ DONE</span>}
                              {isActive && <span className="text-[#8bd6b6] animate-pulse">● LIVE</span>}
                            </div>
                            <div className="text-xs font-bold font-pixel tracking-wider">{s.title}</div>
                            <div className="text-[10px] mt-1 text-[#bec9c2] line-clamp-1">
                              {s.desc}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* DYNAMIC BORROWER ACTION CARD (Depends on current stage) */}
                  <div className="rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-5 space-y-4">
                    {/* STAGE 0: REQUESTED */}
                    {currentStageIndex === 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-amber-400 font-pixel text-xs font-bold uppercase">
                            <Clock className="h-4 w-4" />
                            <span>Awaiting Owner Approval</span>
                          </div>
                          <p className="text-xs text-[#bec9c2]">
                            Your rental request has been sent to <strong className="text-white">{booking.ownerName}</strong>. 
                            Your deposit of ₹{booking.deposit} is held securely in Razorpay Smart Escrow.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenChat(booking.ownerName, "Owner", booking.resourceTitle)}
                            className="rounded-none bg-[#065f46] hover:bg-[#047857] px-4 py-2.5 text-xs font-bold text-white font-pixel uppercase tracking-wider border-2 border-[#047857] shadow-[0_3px_0_0_#003828] cursor-pointer"
                          >
                            Message {booking.ownerName}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STAGE 1: ACCEPTED -> BORROWER HAS PICKUP OTP */}
                    {currentStageIndex === 1 && (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[#8bd6b6] font-pixel text-xs font-bold uppercase">
                              <CheckCircle2 className="h-4 w-4 text-[#8bd6b6]" />
                              <span>Booking Accepted &bull; Physical Handover OTP Generated</span>
                            </div>
                            <p className="text-xs text-[#bec9c2]">
                              <strong className="text-white">{booking.ownerName}</strong> accepted your request! 
                              Show the 6-digit OTP below to the owner or courier partner when receiving the physical gear.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => advanceBookingStage(booking.id)}
                              className="rounded-none bg-[#065f46] hover:bg-[#047857] px-4 py-2.5 text-xs font-bold text-white font-pixel uppercase tracking-wider border-2 border-[#047857] shadow-[0_3px_0_0_#003828] cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="h-4 w-4 text-[#8bd6b6]" />
                              <span>Confirm Physical Reception</span>
                            </button>
                          </div>
                        </div>

                        {/* Big 6-Digit Pickup OTP Box */}
                        <div className="rounded-none bg-[#0e0e0e] p-4 border-2 border-[#065f46] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#89938d] block">
                              Single-Use Physical Pickup OTP (Show to Owner/Courier)
                            </span>
                            <div className="text-2xl sm:text-3xl font-pixel font-bold tracking-widest text-[#8bd6b6] mt-1">
                              {handoverOtp}
                            </div>
                            <span className="text-[10px] font-mono text-[#bec9c2]">
                              Valid for 15 minutes via Redis token registry &bull; Prevents theft
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(handoverOtp, `pickup-${booking.id}`)}
                            className="flex items-center justify-center gap-1.5 rounded-none bg-[#141414] hover:bg-[#201f1f] border border-[#2a2a2a] px-3.5 py-2 text-xs font-mono text-[#bec9c2] hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
                          >
                            {copiedOtpId === `pickup-${booking.id}` ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-[#8bd6b6]" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy OTP</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STAGE 2: IN CUSTODY / ACTIVE RENTAL */}
                    {currentStageIndex === 2 && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[#8bd6b6] font-pixel text-xs font-bold uppercase">
                            <Sparkles className="h-4 w-4 text-[#8bd6b6]" />
                            <span>Equipment in Your Active Custody</span>
                          </div>
                          <p className="text-xs text-[#bec9c2]">
                            Physical handover verified! You are currently using this equipment. 
                            When you are finished, click below to initiate return handoff.
                          </p>
                        </div>
                        <button
                          onClick={() => advanceBookingStage(booking.id)}
                          className="rounded-none bg-[#065f46] hover:bg-[#047857] px-4 py-2.5 text-xs font-bold text-white font-pixel uppercase tracking-wider border-2 border-[#047857] shadow-[0_3px_0_0_#003828] cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <Package className="h-4 w-4 text-[#8bd6b6]" />
                          <span>📦 Initiate Equipment Return</span>
                        </button>
                      </div>
                    )}

                    {/* STAGE 3: RETURN HANDOFF IN PROGRESS */}
                    {currentStageIndex === 3 && (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-amber-400 font-pixel text-xs font-bold uppercase">
                              <RotateCcw className="h-4 w-4 text-amber-400" />
                              <span>Return Handoff in Progress &bull; Awaiting Owner Inspection</span>
                            </div>
                            <p className="text-xs text-[#bec9c2]">
                              You have handed the equipment back to <strong className="text-white">{booking.ownerName}</strong>. 
                              Provide the Return OTP below so the owner can verify condition and release your ₹{booking.deposit} deposit.
                            </p>
                          </div>
                        </div>

                        {/* Big 6-Digit Return OTP Box */}
                        <div className="rounded-none bg-[#0e0e0e] p-4 border-2 border-amber-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#89938d] block">
                              Your Return Verification OTP (Share with {booking.ownerName})
                            </span>
                            <div className="text-2xl sm:text-3xl font-pixel font-bold tracking-widest text-[#fbbf24] mt-1">
                              {returnOtp}
                            </div>
                            <span className="text-[10px] font-mono text-[#bec9c2]">
                              Once {booking.ownerName} inputs this code, ₹{booking.deposit} deposit will instantly refund to your UPI ID
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(returnOtp, `return-${booking.id}`)}
                            className="flex items-center justify-center gap-1.5 rounded-none bg-[#141414] hover:bg-[#201f1f] border border-[#2a2a2a] px-3.5 py-2 text-xs font-mono text-[#bec9c2] hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
                          >
                            {copiedOtpId === `return-${booking.id}` ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-[#8bd6b6]" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy Return OTP</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STAGE 4: COMPLETED & REFUNDED */}
                    {currentStageIndex === 4 && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[#8bd6b6] font-pixel text-xs font-bold uppercase">
                            <CheckCircle2 className="h-4 w-4 text-[#8bd6b6]" />
                            <span>Rental Completed &bull; Deposit Refunded via Escrow</span>
                          </div>
                          <p className="text-xs text-[#bec9c2]">
                            Inspection verified cleanly! Your ₹{booking.deposit} security deposit was refunded directly to your UPI ID. 
                            Thank you for participating in circular campus sharing!
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-none bg-[#065f46] text-white px-3.5 py-2 text-xs font-bold font-pixel uppercase tracking-wider border border-[#047857]">
                            ✓ Closed &amp; Settled
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DYNAMIC ESCROW VAULT BREAKDOWN */}
                  <div className="rounded-none bg-[#141414] p-5 border-2 border-[#2a2a2a] shadow-[inset_1px_1px_0_#1f1f1f] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-2.5">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-pixel">
                        <Lock className="h-3.5 w-3.5 text-[#8bd6b6]" />
                        <span>Verified Razorpay Smart Escrow Vault</span>
                      </span>
                      {currentStageIndex === 4 ? (
                        <span className="rounded-none px-2.5 py-1 text-[10px] font-mono font-bold bg-[#065f46] text-[#8bd6b6] border border-[#047857]">
                          ✓ Deposit ₹{booking.deposit} Refund Released to You
                        </span>
                      ) : (
                        <span className="rounded-none px-2.5 py-1 text-[10px] font-mono font-bold bg-[#201f1f] text-[#bec9c2] border border-[#2a2a2a]">
                          🔒 Security Deposit Locked in Escrow
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[#89938d] block text-[10px] uppercase">Daily Rate</span>
                        <span className="font-bold text-white">₹{booking.pricePerDay} / day</span>
                      </div>
                      <div>
                        <span className="text-[#89938d] block text-[10px] uppercase">Refundable Deposit</span>
                        <span className="font-bold text-white">₹{booking.deposit}</span>
                      </div>
                      <div>
                        <span className="text-[#89938d] block text-[10px] uppercase">Deposit Status</span>
                        <span className={`font-bold ${currentStageIndex === 4 ? "text-[#8bd6b6]" : "text-[#fbbf24]"}`}>
                          {currentStageIndex === 4 ? "✓ Refunded to UPI" : `Held in Vault (₹${booking.deposit})`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#89938d] block text-[10px] uppercase">Total Escrow Vault</span>
                        <span className="font-bold text-[#8bd6b6] text-sm">₹{booking.totalEscrow}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 💼 TAB 2: OWNER VIEW (Only borrow requests for user's listed gear) */}
      {/* =================================================================== */}
      {activeTab === "owner" && (
        <div className="space-y-6">
          {ownerBookings.length === 0 ? (
            <div className="rounded-none border-2 border-dashed border-[#2a2a2a] bg-[#1c1b1b] p-12 text-center shadow-[0_4px_0_0_#0f0f0f]">
              <Package className="mx-auto h-12 w-12 text-[#89938d] mb-3" />
              <h3 className="text-base font-bold text-white font-pixel tracking-wider uppercase">
                No Incoming Lending Requests Yet
              </h3>
              <p className="text-xs text-[#bec9c2] mt-1 max-w-sm mx-auto font-mono">
                When students in your campus mesh request to borrow your listed equipment, their requests will appear here for your approval and handoff.
              </p>
            </div>
          ) : (
            ownerBookings.map((booking) => {
              const currentStageIndex = booking.stageIndex ?? 0;
              const isApproved = currentStageIndex > 0;
              const rentalPayout = booking.totalEscrow - booking.deposit;

              return (
                <div
                  key={booking.id}
                  className="rounded-none border-2 border-[#2a2a2a] bg-[#1c1b1b] p-6 sm:p-7 shadow-[0_6px_0_0_#0f0f0f] space-y-6"
                >
                  {/* Top Bar: Item Meta + Owner Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2a2a2a] pb-5">
                    <div className="flex items-center gap-4">
                      {booking.resourceImage && (
                        <div className="h-16 w-16 rounded-none bg-[#0e0e0e] border-2 border-[#2a2a2a] flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-[inset_2px_2px_0_#000]">
                          <img
                            src={booking.resourceImage}
                            alt={booking.resourceTitle}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#fbbf24] bg-[#2a2004] px-2 py-0.5 border border-[#4a3505]">
                            INCOMING BORROW REQUEST #{booking.id}
                          </span>
                          <span className="text-[10px] font-mono text-[#89938d]">
                            Period: {booking.startDate || "Tomorrow"} &bull; {booking.endDate || "2 Days"}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white font-pixel tracking-wider mt-1 uppercase">
                          {booking.resourceTitle}
                        </h3>
                        <p className="text-xs text-[#bec9c2] mt-0.5">
                          Borrower: <span className="text-white font-bold">{booking.borrowerName}</span> &bull; Campus District: Ideal Colony, Kothrud
                        </p>
                      </div>
                    </div>

                    {/* Owner Top Actions */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => handleOpenContract(booking.ownerName, booking.borrowerName)}
                        className="flex items-center gap-1.5 rounded-none border-2 border-[#353534] bg-[#141414] hover:bg-[#201f1f] px-3.5 py-2 text-xs font-bold text-[#e5e2e1] uppercase tracking-wider font-pixel shadow-[0_2px_0_0_#0f0f0f] transition-colors cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 text-[#89938d]" />
                        <span>Contract</span>
                      </button>

                      <button
                        onClick={() =>
                          handleOpenChat(booking.borrowerName, "Borrower", booking.resourceTitle)
                        }
                        className="flex items-center gap-1.5 rounded-none border-2 border-[#065f46] bg-[#065f46]/30 hover:bg-[#065f46]/50 px-3.5 py-2 text-xs font-bold text-[#8bd6b6] uppercase tracking-wider font-pixel shadow-[0_2px_0_0_#003828] transition-colors cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-[#8bd6b6]" />
                        <span>Message Borrower</span>
                      </button>

                      {/* Demo simulation shortcut for testing next stage */}
                      {currentStageIndex < 4 && (
                        <button
                          onClick={() => advanceBookingStage(booking.id)}
                          className="flex items-center gap-1 rounded-none border border-[#353534] bg-[#141414] hover:bg-[#201f1f] px-2.5 py-2 text-[10px] font-mono text-[#89938d] hover:text-white transition-colors cursor-pointer"
                          title="Simulate step advance for quick demo testing"
                        >
                          <span>Simulate Next</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* REALISTIC 5-STAGE CUSTODY PROGRESS TIMELINE (Informative, non-arbitrary) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#8bd6b6]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-white font-pixel">
                          Owner Equipment Custody Chain
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#8bd6b6]">
                        Stage 0{currentStageIndex + 1} of 05 &bull; {stageList[currentStageIndex]?.title}
                      </span>
                    </div>

                    {/* Stepper Timeline Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {stageList.map((s, idx) => {
                        const isCompleted = idx < currentStageIndex;
                        const isActive = idx === currentStageIndex;

                        return (
                          <div
                            key={idx}
                            className={`rounded-none p-3 border-2 text-center transition-all ${
                              isActive
                                ? "bg-[#065f46]/30 border-[#8bd6b6] text-white shadow-[0_4px_0_0_#003828]"
                                : isCompleted
                                ? "bg-[#141414] border-[#047857] text-[#8bd6b6]"
                                : "bg-[#141414]/40 border-[#262626] text-[#89938d] opacity-50"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                              <span>STAGE {s.num}</span>
                              {isCompleted && <span className="text-[#8bd6b6]">✓ DONE</span>}
                              {isActive && <span className="text-[#8bd6b6] animate-pulse">● LIVE</span>}
                            </div>
                            <div className="text-xs font-bold font-pixel tracking-wider">{s.title}</div>
                            <div className="text-[10px] mt-1 text-[#bec9c2] line-clamp-1">
                              {s.desc}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* DYNAMIC OWNER ACTION CARD (Real state actions only!) */}
                  <div className="rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-5 space-y-4">
                    {/* STAGE 0: REQUESTED -> OWNER APPROVES OR DECLINES */}
                    {currentStageIndex === 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-amber-400 font-pixel text-xs font-bold uppercase">
                            <AlertCircle className="h-4 w-4" />
                            <span>Action Required: Approve Rental Request</span>
                          </div>
                          <p className="text-xs text-[#bec9c2]">
                            <strong className="text-white">{booking.borrowerName}</strong> has deposited ₹{booking.totalEscrow} into escrow and requested your gear. 
                            Approve the booking to generate the physical handover OTP.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => advanceBookingStage(booking.id)}
                            className="rounded-none bg-[#065f46] hover:bg-[#047857] px-4 py-2.5 text-xs font-bold text-white font-pixel uppercase tracking-wider border-2 border-[#047857] shadow-[0_3px_0_0_#003828] cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="h-4 w-4 text-[#8bd6b6]" />
                            <span>✓ Approve &amp; Accept Request</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STAGE 1: ACCEPTED -> OWNER VERIFIES PHYSICAL PICKUP OTP */}
                    {currentStageIndex === 1 && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[#8bd6b6] font-pixel text-xs font-bold uppercase">
                            <KeyRound className="h-4 w-4 text-[#8bd6b6]" />
                            <span>Ready for Physical Handover &bull; Enter Borrower Pickup OTP</span>
                          </div>
                          <p className="text-xs text-[#bec9c2]">
                            When handing over the physical equipment to <strong className="text-white">{booking.borrowerName}</strong> or courier, 
                            verify their 6-digit OTP to authenticate custody transfer.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenHandoverModal(booking)}
                            className="rounded-none bg-[#065f46] hover:bg-[#047857] px-4 py-2.5 text-xs font-bold text-white font-pixel uppercase tracking-wider border-2 border-[#047857] shadow-[0_3px_0_0_#003828] cursor-pointer flex items-center gap-1.5"
                          >
                            <KeyRound className="h-4 w-4 text-[#8bd6b6]" />
                            <span>🔑 Verify Pickup OTP</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STAGE 2: IN CUSTODY / ACTIVE RENTAL */}
                    {currentStageIndex === 2 && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[#8bd6b6] font-pixel text-xs font-bold uppercase">
                            <Sparkles className="h-4 w-4 text-[#8bd6b6]" />
                            <span>Equipment in Borrower Custody</span>
                          </div>
                          <p className="text-xs text-[#bec9c2]">
                            Your equipment is currently rented to <strong className="text-white">{booking.borrowerName}</strong>. 
                            You will be notified when they initiate the return handoff.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenChat(booking.borrowerName, "Borrower", booking.resourceTitle)}
                            className="rounded-none border-2 border-[#2a2a2a] bg-[#201f1f] hover:bg-[#2a2a2a] px-4 py-2 text-xs font-bold text-[#e5e2e1] font-pixel uppercase tracking-wider cursor-pointer"
                          >
                            Message {booking.borrowerName}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STAGE 3: RETURN HANDOFF -> OWNER INSPECTS AND RELEASES REFUND */}
                    {currentStageIndex === 3 && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-amber-400 font-pixel text-xs font-bold uppercase">
                            <RotateCcw className="h-4 w-4 text-amber-400" />
                            <span>Equipment Returned &bull; Action Required: Inspect &amp; Release Deposit</span>
                          </div>
                          <p className="text-xs text-[#bec9c2]">
                            <strong className="text-white">{booking.borrowerName}</strong> returned the gear. 
                            Inspect equipment condition and enter their 6-digit Return OTP to release the ₹{booking.deposit} deposit.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenRefundModal(booking)}
                            className="rounded-none bg-[#065f46] hover:bg-[#047857] px-4 py-2.5 text-xs font-bold text-white font-pixel uppercase tracking-wider border-2 border-[#047857] shadow-[0_3px_0_0_#003828] cursor-pointer flex items-center gap-1.5"
                          >
                            <Zap className="h-4 w-4 text-[#8bd6b6]" />
                            <span>⚡ Verify Return &amp; Release Deposit (₹{booking.deposit})</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STAGE 4: COMPLETED & REFUNDED */}
                    {currentStageIndex === 4 && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[#8bd6b6] font-pixel text-xs font-bold uppercase">
                            <CheckCircle2 className="h-4 w-4 text-[#8bd6b6]" />
                            <span>Rental Completed &bull; Payout Released to Your Wallet</span>
                          </div>
                          <p className="text-xs text-[#bec9c2]">
                            Deposit was refunded to <strong className="text-white">{booking.borrowerName}</strong>, 
                            and your net rental fee of ₹{rentalPayout} was credited to your owner wallet.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-none bg-[#065f46] text-white px-3.5 py-2 text-xs font-bold font-pixel uppercase tracking-wider border border-[#047857]">
                            ✓ Rental Finalized
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OWNER FINANCIAL SUMMARY BOX */}
                  <div className="rounded-none bg-[#141414] p-5 border-2 border-[#2a2a2a] shadow-[inset_1px_1px_0_#1f1f1f] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-2.5">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-pixel">
                        <Lock className="h-3.5 w-3.5 text-[#8bd6b6]" />
                        <span>Owner Financial Ledger &bull; Escrow Breakdown</span>
                      </span>
                      <span className="rounded-none px-2.5 py-1 text-[10px] font-mono font-bold bg-[#065f46]/30 text-[#8bd6b6] border border-[#065f46]">
                        {currentStageIndex === 4 ? `✓ Net Payout ₹${rentalPayout} Credited` : `Net Payout Expected: ₹${rentalPayout}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[#89938d] block text-[10px] uppercase">Daily Rate</span>
                        <span className="font-bold text-white">₹{booking.pricePerDay} / day</span>
                      </div>
                      <div>
                        <span className="text-[#89938d] block text-[10px] uppercase">Borrower Deposit</span>
                        <span className="font-bold text-white">₹{booking.deposit}</span>
                      </div>
                      <div>
                        <span className="text-[#89938d] block text-[10px] uppercase">Deposit Status</span>
                        <span className={`font-bold ${currentStageIndex === 4 ? "text-[#8bd6b6]" : "text-[#fbbf24]"}`}>
                          {currentStageIndex === 4 ? "✓ Refunded to Borrower" : "Held in Escrow"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#89938d] block text-[10px] uppercase">Your Net Earnings</span>
                        <span className="font-bold text-[#8bd6b6] text-sm">₹{rentalPayout}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODALS & DRAWERS                                                   */}
      {/* =================================================================== */}

      {/* Redis Pickup Handover OTP Modal (For Owner to verify Borrower's OTP) */}
      <RedisOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        itemTitle={selectedBookingForModal?.resourceTitle || "Equipment"}
        onSuccess={() => {
          if (selectedBookingForModal) {
            advanceBookingStage(selectedBookingForModal.id);
          }
        }}
      />

      {/* Return OTP & Deposit Refund Modal (For Owner to verify return condition & release deposit) */}
      <ReturnOtpRefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        bookingId={selectedBookingForModal?.id || "BK-98421"}
        itemTitle={selectedBookingForModal?.resourceTitle || "Equipment"}
        borrowerName={selectedBookingForModal?.borrowerName || "Borrower"}
        depositAmount={selectedBookingForModal?.deposit || 1500}
        onSuccess={(refundTxnId) => {
          if (selectedBookingForModal) {
            updateBookingStage(selectedBookingForModal.id, 4); // Stage 5: COMPLETED
          }
          setLastRefundTxn(refundTxnId);
        }}
      />

      {/* Real-Time Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        recipientName={chatRecipient.name}
        recipientRole={chatRecipient.role}
        resourceTitle={chatRecipient.title}
      />

      {/* Digital Rental Contract Modal */}
      <RentalAgreementModal
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
        borrowerName={contractBorrower}
        ownerName={contractOwner}
      />
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-mono">Loading bookings desk...</div>}>
      <BookingsContent />
    </Suspense>
  );
}
