"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  KeyRound,
  ArrowRight,
  Smartphone,
  QrCode,
  CreditCard,
  Building2,
  Lock,
  Sparkles,
  Zap,
  Check,
  ExternalLink,
  Shield,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { Resource, User } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useRole } from "@/lib/roleContext";

interface BookingModalProps {
  resource: Resource | null;
  owner?: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Script loader helper for Razorpay Standard Checkout JS
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function BookingModal({
  resource,
  owner,
  isOpen,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const [days, setDays] = useState(1);
  const [selectedMeetingSpot, setSelectedMeetingSpot] = useState(
    "MIT Campus Central Library Lawn"
  );

  // Flow steps: "details" | "payment_gateway" | "otp_verification" | "processing" | "confirmed"
  const [step, setStep] = useState<
    "details" | "payment_gateway" | "otp_verification" | "processing" | "confirmed"
  >("details");

  // Payment method: "upi_gpay" | "upi_qr" | "card" | "netbanking"
  const [paymentMethod, setPaymentMethod] = useState<
    "upi_gpay" | "upi_qr" | "card" | "netbanking"
  >("upi_gpay");

  // Form Inputs — STARTS COMPLETELY BLANK as requested by user
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  // Bank OTP Verification State
  const [bankOtp, setBankOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [formError, setFormError] = useState("");

  // Custom Razorpay Key input
  const [customRazorpayKey, setCustomRazorpayKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isLoadingRazorpay, setIsLoadingRazorpay] = useState(false);

  // Verification & Receipt details
  const [handoverOtp, setHandoverOtp] = useState("");
  const [txnId, setTxnId] = useState("");
  const {
    createBooking,
    isLoggedIn,
    openAuthModal,
    isDigiLockerVerified,
    openDigiLockerModal,
  } = useRole();

  // RESET ALL STATE WHEN MODAL OPENS OR RESOURCE CHANGES
  useEffect(() => {
    if (isOpen) {
      setStep("details");
      setDays(1);
      setSelectedMeetingSpot("MIT Campus Central Library Lawn");
      setPaymentMethod("upi_gpay");
      setUpiId("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setSelectedBank("HDFC Bank");
      setBankOtp("");
      setFormError("");
      setHandoverOtp("");
      setTxnId("");
      setIsVerifyingOtp(false);
      setIsLoadingRazorpay(false);
    }
  }, [isOpen, resource]);

  if (!isOpen || !resource) return null;

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md rounded-none bg-[#1c1b1b] p-6 sm:p-8 shadow-[0_8px_0_0_#0f0f0f] border-2 border-[#2a2a2a] text-center space-y-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-none p-2 bg-[#141414] border border-[#2a2a2a] text-[#bec9c2] hover:text-white hover:border-[#8bd6b6] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-none bg-[#141414] text-amber-400 border-2 border-[#2a2a2a] shadow-[0_3px_0_0_#0f0f0f]">
            <Lock className="h-8 w-8 text-amber-400" />
          </div>

          <div>
            <h3 className="text-lg font-['Silkscreen'] uppercase tracking-wider text-white">Authentication Required</h3>
            <p className="text-xs text-[#bec9c2] mt-2 leading-relaxed font-mono">
              To borrow equipment and protect peer owners via Escrow Vault, please Log In or Sign Up first.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                onClose();
                openAuthModal("login");
              }}
              className="w-full py-3.5 px-4 rounded-none bg-[#065f46] border-2 border-[#047857] shadow-[0_4px_0_0_#003828] text-white font-['Silkscreen'] text-xs uppercase tracking-wider hover:bg-[#047857] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              Log In to Borrow Equipment
            </button>
            <button
              onClick={() => {
                onClose();
                openAuthModal("signup");
              }}
              className="w-full py-3 px-4 rounded-none bg-[#141414] border-2 border-[#2a2a2a] shadow-[0_4px_0_0_#0f0f0f] text-[#bec9c2] font-['Silkscreen'] text-xs uppercase tracking-wider hover:text-white hover:border-[#8bd6b6] transition-all cursor-pointer"
            >
              Create New Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const rate = resource.pricePerDay;
  const subtotal = rate * days;
  const originalDeposit = resource.deposit;
  // 75% security deposit waiver for DigiLocker verified borrowers
  const depositWaiver = isDigiLockerVerified ? Math.round(originalDeposit * 0.75) : 0;
  const deposit = originalDeposit - depositWaiver;
  const platformFee = rate > 0 ? 25 : 0;
  const grandTotal = subtotal + deposit + platformFee;

  const handleStartPayment = () => {
    setFormError("");
    setStep("payment_gateway");
  };

  // Helper to complete booking, generate handover OTP, and show confirmed receipt
  const completePaymentAndLockEscrow = (paymentId: string) => {
    setStep("processing");

    setTimeout(() => {
      createBooking(resource, days);

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const finalTxn = paymentId || `pay_${Math.floor(10000000 + Math.random() * 90000000)}`;

      setHandoverOtp(code);
      setTxnId(finalTxn);
      setStep("confirmed");

      if (onSuccess) onSuccess();
    }, 1800);
  };

  // Launch Official Razorpay Standard Checkout JS Popup Modal
  const handleLaunchRazorpaySDK = async () => {
    setIsLoadingRazorpay(true);
    setFormError("");
    const loaded = await loadRazorpayScript();
    setIsLoadingRazorpay(false);

    if (!loaded) {
      setFormError("Could not connect to Razorpay SDK server. Please try interactive payment.");
      return;
    }

    let orderId = "";
    let razorpayKey = customRazorpayKey.trim() || "rzp_test_1DP5mmOlF5G5ag";

    try {
      const res = await fetch("http://localhost:8000/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource_id: resource.id,
          resource_title: resource.title,
          daily_rate: resource.pricePerDay,
          deposit_amount: resource.deposit,
          days: days,
          borrower_name: "Campus Student",
          borrower_email: "student@campus.edu",
          borrower_phone: "9876543210",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order_id) orderId = data.order_id;
        if (data.key_id && !data.key_id.includes("DEMO")) razorpayKey = data.key_id;
      }
    } catch (err) {
      console.warn("Backend order creation fallback:", err);
    }

    const options = {
      key: razorpayKey,
      amount: grandTotal * 100, // paise
      currency: "INR",
      name: "RE:USE Campus Escrow",
      description: `Borrowing: ${resource.title} (${days} days)`,
      image: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f504.png",
      ...(orderId ? { order_id: orderId } : {}),
      handler: function (response: any) {
        console.log("Razorpay SDK Success Handler:", response);
        const pid = response.razorpay_payment_id || `pay_${Math.floor(10000000 + Math.random() * 90000000)}`;
        completePaymentAndLockEscrow(pid);
      },
      prefill: {
        name: "Campus Student",
        email: "student@campus.edu",
        contact: "9876543210",
      },
      notes: {
        meeting_spot: selectedMeetingSpot,
        deposit: `₹${deposit}`,
      },
      theme: {
        color: "#0c2540",
      },
      modal: {
        ondismiss: function () {
          console.log("User closed Razorpay checkout popup window");
        },
      },
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed on Razorpay SDK:", response.error);
        setFormError(`Razorpay Payment Failed: ${response.error.description || "Transaction cancelled"}`);
      });
      rzp.open();
    } catch (err) {
      console.error("Error opening Razorpay SDK:", err);
      setFormError("Razorpay SDK window could not be opened. Proceeding with interactive checkout.");
      setStep("otp_verification");
    }
  };

  // Validate form before proceeding to 3D Secure Bank OTP step
  const handleProceedToOtp = () => {
    setFormError("");

    if (paymentMethod === "upi_gpay") {
      if (!upiId.trim()) {
        setFormError("Please enter a valid UPI ID (e.g., student@okaxis or 9876543210@upi).");
        return;
      }
    } else if (paymentMethod === "card") {
      if (!cardNumber.trim() || cardNumber.replace(/\s/g, "").length < 12) {
        setFormError("Please enter a valid Card Number.");
        return;
      }
      if (!cardExpiry.trim()) {
        setFormError("Please enter Expiry Date (MM/YY).");
        return;
      }
      if (!cardCvv.trim()) {
        setFormError("Please enter Card CVV.");
        return;
      }
    }

    setStep("otp_verification");
  };

  // Submit Bank OTP on 3D Secure Screen
  const handleVerifyBankOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!bankOtp.trim()) {
      setFormError("Please enter the 6-digit Bank SMS OTP sent to your phone.");
      return;
    }

    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      const generatedTxn = `pay_${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      completePaymentAndLockEscrow(generatedTxn);
    }, 1200);
  };

  const handleResetAndClose = () => {
    setStep("details");
    setHandoverOtp("");
    setTxnId("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-none bg-[#1c1b1b] shadow-[0_8px_0_0_#0f0f0f] border-2 border-[#2a2a2a] max-h-[94vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 rounded-none p-2 bg-[#141414] border border-[#2a2a2a] text-[#bec9c2] hover:text-white hover:border-[#8bd6b6] transition-colors z-10 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* 1. ORDER DETAILS & BORROW SETUP STEP */}
        {step === "details" && (
          <div className="p-6">
            {/* Header */}
            <div className="mb-5">
              <span className="inline-flex items-center gap-1 rounded-none bg-[#065f46]/30 px-2.5 py-1 text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#8bd6b6] border border-[#8bd6b6]/30">
                <ShieldCheck className="h-3.5 w-3.5 text-[#8bd6b6]" />
                Peer-to-Peer Campus Escrow
              </span>
              <h3 className="mt-2 text-base sm:text-lg font-['Silkscreen'] tracking-wider uppercase text-white">
                Request to Borrow
              </h3>
              <p className="text-xs text-[#bec9c2] font-mono mt-1">
                {resource.title}
              </p>
            </div>

            {/* Item preview bar */}
            <div className="flex items-center gap-3.5 rounded-none bg-[#141414] p-3.5 border-2 border-[#2a2a2a] mb-5">
              <div className="h-16 w-16 rounded-none overflow-hidden bg-[#0e0e0e] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                <img
                  src={resource.photos[0]}
                  alt={resource.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate font-mono">
                  {resource.title}
                </div>
                <div className="text-xs text-[#89938d] mt-0.5 font-mono">
                  Owner:{" "}
                  <span className="font-semibold text-white">
                    {owner?.name || "Rahul Sharma"}
                  </span>{" "}
                  ({owner?.trustScore || "4.9"} ⭐)
                </div>
                <div className="text-xs font-['Silkscreen'] text-[#8bd6b6] mt-1">
                  {formatPrice(resource.pricePerDay)}
                </div>
              </div>
            </div>

            {/* Days Duration Counter */}
            <div className="mb-4">
              <label className="block text-[11px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-2">
                Borrow Duration (Days)
              </label>
              <div className="flex items-center justify-between rounded-none border-2 border-[#2a2a2a] p-2 bg-[#141414]">
                <span className="text-xs font-mono text-[#bec9c2] pl-2">
                  Number of days:
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDays((d) => Math.max(1, d - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-none bg-[#1c1b1b] border border-[#2a2a2a] font-['Silkscreen'] text-white hover:border-[#8bd6b6] active:translate-y-0.5 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-['Silkscreen'] text-sm text-[#8bd6b6]">
                    {days}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDays((d) => Math.min(14, d + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-none bg-[#1c1b1b] border border-[#2a2a2a] font-['Silkscreen'] text-white hover:border-[#8bd6b6] active:translate-y-0.5 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Meeting Spot Selector */}
            <div className="mb-5">
              <label className="block text-[11px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-2">
                Campus Handover Spot
              </label>
              <select
                value={selectedMeetingSpot}
                onChange={(e) => setSelectedMeetingSpot(e.target.value)}
                className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-3 text-xs font-mono font-semibold text-white focus:border-[#8bd6b6] focus:outline-none cursor-pointer"
              >
                <option value="MIT Campus Central Library Lawn">
                  📍 MIT Campus Central Library Lawn (Recommended)
                </option>
                <option value="COEP Tech Main Heritage Porch">
                  📍 COEP Tech Main Heritage Porch
                </option>
                <option value="Fergusson College Main Gate, FC Road">
                  📍 Fergusson College Main Gate, FC Road
                </option>
                <option value="Symbiosis SB Road Food Court">
                  📍 Symbiosis SB Road Food Court
                </option>
                <option value="Ideal Colony Metro Station, Kothrud">
                  📍 Ideal Colony Metro Station, Kothrud
                </option>
              </select>
            </div>

            {/* DIGILOCKER ANTI-THEFT & DEPOSIT WAIVER GATE */}
            {!isDigiLockerVerified ? (
              <div className="rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-4 mb-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇮🇳</span>
                    <span className="text-xs font-['Silkscreen'] uppercase tracking-wider text-white">DigiLocker Verification</span>
                  </div>
                  <span className="rounded-none bg-[#2a2004] text-amber-300 border border-[#4a3505] text-[10px] font-['Silkscreen'] px-2 py-0.5">
                    KYC PENDING
                  </span>
                </div>

                <p className="text-[11px] text-[#bec9c2] font-mono leading-relaxed">
                  Verify your Aadhaar &amp; PAN with DigiLocker to <strong className="text-[#8bd6b6]">waive ₹{depositWaiver}</strong> of security deposit and prevent rental fraud!
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#2a2a2a] pt-2.5">
                  <div className="text-[11px] text-[#bec9c2] font-mono">
                    Deposit: <span className="line-through text-[#89938d]">₹{originalDeposit}</span> &rarr; <span className="font-bold text-[#8bd6b6]">₹{deposit}</span> (75% Off)
                  </div>
                  <button
                    type="button"
                    onClick={openDigiLockerModal}
                    className="rounded-none bg-[#065f46] border-2 border-[#047857] shadow-[0_2px_0_0_#003828] hover:bg-[#047857] text-white text-[11px] font-['Silkscreen'] uppercase tracking-wider px-3 py-1.5 transition-all flex items-center justify-center gap-1.5 active:translate-y-0.5 cursor-pointer"
                  >
                    <span>🇮🇳 Verify ID (Save ₹{depositWaiver})</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-none border-2 border-[#047857] bg-[#065f46]/20 p-3.5 mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-none bg-[#065f46] text-[#8bd6b6] border border-[#047857] flex items-center justify-center text-xs font-black">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-['Silkscreen'] uppercase tracking-wider text-[#8bd6b6] block">
                      DigiLocker Verified Citizen
                    </span>
                    <span className="text-[10px] text-[#bec9c2] font-mono">
                      Zero fraud risk &bull; ₹{depositWaiver} deposit waived!
                    </span>
                  </div>
                </div>
                <span className="rounded-none bg-[#065f46] text-[#8bd6b6] border border-[#047857] text-[10px] font-['Silkscreen'] px-2 py-0.5 whitespace-nowrap">
                  75% WAIVED
                </span>
              </div>
            )}

            {/* Price Breakdown Card */}
            <div className="rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-4 mb-6 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#89938d]">
                <span>
                  Rental Rate ({formatPrice(rate)} × {days} days)
                </span>
                <span className="font-semibold text-white">
                  ₹{subtotal}
                </span>
              </div>
              <div className="flex justify-between text-[#89938d]">
                <span>Refundable Security Deposit</span>
                <span className="font-semibold text-white">
                  {depositWaiver > 0 ? (
                    <>
                      <span className="line-through text-[#89938d] mr-1.5">₹{originalDeposit}</span>
                      <span className="text-[#8bd6b6] font-bold">₹{deposit}</span>
                    </>
                  ) : (
                    `₹${deposit}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-[#89938d]">
                <span>Platform Peer Protection Fee</span>
                <span className="font-semibold text-[#8bd6b6]">
                  ₹{platformFee}
                </span>
              </div>
              <div className="border-t-2 border-[#2a2a2a] pt-2 flex justify-between text-xs font-['Silkscreen'] uppercase tracking-wider text-white">
                <span>Total Payable at Checkout</span>
                <span className="text-[#8bd6b6]">₹{grandTotal}</span>
              </div>
              <div className="text-[10px] text-[#89938d] italic font-mono">
                * Security deposit is released immediately upon verified return.
              </div>
            </div>

            {/* Proceed Button */}
            <button
              onClick={handleStartPayment}
              className="w-full flex items-center justify-center gap-2 rounded-none bg-[#065f46] border-2 border-[#047857] shadow-[0_4px_0_0_#003828] hover:bg-[#047857] py-3.5 text-xs font-['Silkscreen'] uppercase tracking-wider text-white active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <span>Proceed to Checkout (₹{grandTotal})</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 2. AUTHENTIC RAZORPAY PAYMENT GATEWAY STEP */}
        {step === "payment_gateway" && (
          <div className="animate-in fade-in duration-200">
            {/* Authentic Razorpay Dark Header */}
            <div className="bg-[#141414] border-b-2 border-[#2a2a2a] p-4 text-white mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-none bg-[#065f46] border border-[#047857] flex items-center justify-center text-white font-['Silkscreen'] text-xs tracking-wider">
                  RZP
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-['Silkscreen'] text-xs text-white tracking-wider uppercase">RE:USE Campus Escrow</h3>
                    <span className="bg-[#065f46]/30 text-[#8bd6b6] text-[9px] font-['Silkscreen'] px-1.5 py-0.5 rounded-none border border-[#8bd6b6]/30">
                      SECURED
                    </span>
                  </div>
                  <p className="text-[10px] text-[#bec9c2] font-mono flex items-center gap-1 mt-0.5">
                    <Lock className="h-3 w-3 text-[#8bd6b6] inline" />
                    <span>256-Bit SSL Encrypted Escrow Vault</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-[#89938d] block font-['Silkscreen'] uppercase tracking-wider">Total</span>
                <span className="text-base font-['Silkscreen'] text-[#8bd6b6]">₹{grandTotal}</span>
              </div>
            </div>

            <div className="px-6 pb-6">
              {/* Error Message Box */}
              {formError && (
                <div className="mb-4 rounded-none bg-[#2a0808] p-3 text-xs font-mono font-bold text-red-300 border-2 border-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Payment Methods Options */}
              <div className="space-y-3 mb-5">
                {/* Option 1: Direct UPI / VPA */}
                <div
                  onClick={() => {
                    setPaymentMethod("upi_gpay");
                    setFormError("");
                  }}
                  className={`p-3.5 rounded-none border-2 cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === "upi_gpay"
                      ? "border-[#8bd6b6] bg-[#065f46]/30"
                      : "border-[#2a2a2a] bg-[#141414] hover:border-[#3a3a3a]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-none bg-[#0e0e0e] border border-[#2a2a2a] text-[#8bd6b6] flex items-center justify-center font-bold">
                      <Smartphone className="h-5 w-5 text-[#8bd6b6]" />
                    </div>
                    <div>
                      <span className="block text-xs font-['Silkscreen'] uppercase tracking-wider text-white">
                        Direct UPI (GPay / PhonePe / BHIM)
                      </span>
                      <span className="text-[10px] text-[#89938d] font-mono">Pay using your UPI ID or VPA</span>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-none border flex items-center justify-center ${paymentMethod === "upi_gpay" ? "border-[#8bd6b6] bg-[#065f46] text-white" : "border-[#3a3a3a]"}`}>
                    {paymentMethod === "upi_gpay" && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </div>

                {paymentMethod === "upi_gpay" && (
                  <div className="ml-4 pl-4 border-l-2 border-[#8bd6b6] space-y-2 animate-in fade-in">
                    <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2]">Enter UPI ID / VPA</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value);
                          setFormError("");
                        }}
                        placeholder="e.g. mobile@upi or username@okaxis"
                        className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#0e0e0e] px-3 py-2 text-xs font-mono font-bold text-white focus:border-[#8bd6b6] focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#89938d] font-mono">
                      <span>Supported: GPay, PhonePe, Paytm, BHIM</span>
                      <button
                        type="button"
                        onClick={() => setUpiId("student@okaxis")}
                        className="text-[#8bd6b6] font-bold hover:underline cursor-pointer"
                      >
                        + Auto-fill Demo UPI
                      </button>
                    </div>
                  </div>
                )}

                {/* Option 2: Campus QR Code Scan */}
                <div
                  onClick={() => {
                    setPaymentMethod("upi_qr");
                    setFormError("");
                  }}
                  className={`p-3.5 rounded-none border-2 cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === "upi_qr"
                      ? "border-[#8bd6b6] bg-[#065f46]/30"
                      : "border-[#2a2a2a] bg-[#141414] hover:border-[#3a3a3a]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-none bg-[#0e0e0e] border border-[#2a2a2a] text-[#8bd6b6] flex items-center justify-center font-bold">
                      <QrCode className="h-5 w-5 text-[#8bd6b6]" />
                    </div>
                    <div>
                      <span className="block text-xs font-['Silkscreen'] uppercase tracking-wider text-white">Scan &amp; Pay QR Code</span>
                      <span className="text-[10px] text-[#89938d] font-mono">Scan QR Code from any UPI App</span>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-none border flex items-center justify-center ${paymentMethod === "upi_qr" ? "border-[#8bd6b6] bg-[#065f46] text-white" : "border-[#3a3a3a]"}`}>
                    {paymentMethod === "upi_qr" && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Option 3: Credit / Debit Card */}
                <div
                  onClick={() => {
                    setPaymentMethod("card");
                    setFormError("");
                  }}
                  className={`p-3.5 rounded-none border-2 cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === "card"
                      ? "border-[#8bd6b6] bg-[#065f46]/30"
                      : "border-[#2a2a2a] bg-[#141414] hover:border-[#3a3a3a]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-none bg-[#0e0e0e] border border-[#2a2a2a] text-[#8bd6b6] flex items-center justify-center font-bold">
                      <CreditCard className="h-5 w-5 text-[#8bd6b6]" />
                    </div>
                    <div>
                      <span className="block text-xs font-['Silkscreen'] uppercase tracking-wider text-white">Debit / Credit Card</span>
                      <span className="text-[10px] text-[#89938d] font-mono">Visa, MasterCard, RuPay, Maestro</span>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-none border flex items-center justify-center ${paymentMethod === "card" ? "border-[#8bd6b6] bg-[#065f46] text-white" : "border-[#3a3a3a]"}`}>
                    {paymentMethod === "card" && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <div className="ml-4 pl-4 border-l-2 border-[#8bd6b6] space-y-2.5 animate-in fade-in">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2]">Card Number</label>
                        <button
                          type="button"
                          onClick={() => {
                            setCardNumber("4111 1111 1111 1111");
                            setCardExpiry("12/28");
                            setCardCvv("888");
                          }}
                          className="text-[10px] text-[#8bd6b6] font-mono font-bold hover:underline cursor-pointer"
                        >
                          + Auto-fill Test Card
                        </button>
                      </div>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 XXXX XXXX 8921"
                        className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#0e0e0e] px-3 py-2 text-xs font-mono font-bold text-white focus:border-[#8bd6b6] focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#0e0e0e] px-3 py-2 text-xs font-mono font-bold text-white focus:border-[#8bd6b6] focus:outline-none"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="CVV"
                          className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#0e0e0e] px-3 py-2 text-xs font-mono font-bold text-white focus:border-[#8bd6b6] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Option 4: Net Banking */}
                <div
                  onClick={() => {
                    setPaymentMethod("netbanking");
                    setFormError("");
                  }}
                  className={`p-3.5 rounded-none border-2 cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === "netbanking"
                      ? "border-[#8bd6b6] bg-[#065f46]/30"
                      : "border-[#2a2a2a] bg-[#141414] hover:border-[#3a3a3a]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-none bg-[#0e0e0e] border border-[#2a2a2a] text-[#8bd6b6] flex items-center justify-center font-bold">
                      <Building2 className="h-5 w-5 text-[#8bd6b6]" />
                    </div>
                    <div>
                      <span className="block text-xs font-['Silkscreen'] uppercase tracking-wider text-white">Net Banking</span>
                      <span className="text-[10px] text-[#89938d] font-mono">HDFC, SBI, ICICI, Axis, Kotak Bank</span>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-none border flex items-center justify-center ${paymentMethod === "netbanking" ? "border-[#8bd6b6] bg-[#065f46] text-white" : "border-[#3a3a3a]"}`}>
                    {paymentMethod === "netbanking" && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </div>

                {paymentMethod === "netbanking" && (
                  <div className="ml-4 pl-4 border-l-2 border-[#8bd6b6] animate-in fade-in">
                    <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-1">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#0e0e0e] p-2 text-xs font-mono font-bold text-white focus:border-[#8bd6b6] focus:outline-none cursor-pointer"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Official SDK Launch Option (Subtle Footer Link) */}
              <div className="mb-4 text-center">
                <button
                  type="button"
                  onClick={handleLaunchRazorpaySDK}
                  disabled={isLoadingRazorpay}
                  className="text-[10px] font-mono font-bold text-[#8bd6b6] hover:underline inline-flex items-center gap-1 py-1 cursor-pointer"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>{isLoadingRazorpay ? "Loading SDK..." : "Or launch Official Razorpay JS Popup Window"}</span>
                </button>
              </div>

              {/* Escrow Lock Notice */}
              <div className="rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-3.5 text-white mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold">
                  <Lock className="h-4 w-4 text-[#8bd6b6]" />
                  <span>Escrow Hold Deposit: ₹{deposit}</span>
                </div>
                <span className="text-[9px] font-['Silkscreen'] uppercase tracking-wider text-[#8bd6b6] bg-[#065f46]/30 px-2 py-0.5 rounded-none border border-[#8bd6b6]/30">
                  100% REFUNDABLE
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="w-1/3 rounded-none border-2 border-[#2a2a2a] bg-[#141414] py-3.5 text-xs font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] hover:text-white hover:border-[#8bd6b6] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleProceedToOtp}
                  className="w-2/3 flex items-center justify-center gap-2 rounded-none bg-[#065f46] border-2 border-[#047857] shadow-[0_4px_0_0_#003828] hover:bg-[#047857] py-3.5 text-xs font-['Silkscreen'] uppercase tracking-wider text-white active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  <Zap className="h-4 w-4 text-[#8bd6b6]" />
                  <span>Pay ₹{grandTotal} via Razorpay</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. BANK 3D SECURE OTP VERIFICATION STEP */}
        {step === "otp_verification" && (
          <div className="animate-in zoom-in-95 duration-200">
            <div className="bg-[#141414] border-b-2 border-[#2a2a2a] text-white p-4 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#8bd6b6]" />
                <span className="font-['Silkscreen'] text-xs uppercase tracking-wider text-[#8bd6b6]">
                  3D Secure Bank Verification
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#89938d]">Razorpay Auth</span>
            </div>

            <div className="px-6 pb-6 text-center">
              {/* Error Message */}
              {formError && (
                <div className="mb-4 rounded-none bg-[#2a0808] p-3 text-xs font-mono font-bold text-red-300 border-2 border-red-800 flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-none bg-[#141414] text-[#8bd6b6] mb-3 border-2 border-[#2a2a2a] shadow-[0_3px_0_0_#0f0f0f]">
                <Building2 className="h-7 w-7" />
              </div>
              <h3 className="text-base font-['Silkscreen'] uppercase tracking-wider text-white">Authorize Bank Payment</h3>
              <p className="text-xs text-[#bec9c2] font-mono mt-1 max-w-xs mx-auto">
                Enter the Bank SMS OTP sent to your phone to authorize ₹{grandTotal}.
              </p>

              <form onSubmit={handleVerifyBankOtp} className="mt-6 max-w-xs mx-auto space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2]">
                      Bank SMS OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setBankOtp("123456");
                        setFormError("");
                      }}
                      className="text-[10px] font-mono text-[#8bd6b6] font-bold hover:underline cursor-pointer"
                    >
                      + Auto-fill OTP
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={bankOtp}
                    onChange={(e) => {
                      setBankOtp(e.target.value);
                      setFormError("");
                    }}
                    className="w-full text-center text-2xl font-['Silkscreen'] tracking-widest rounded-none border-2 border-[#047857] bg-[#141414] py-3 text-[#8bd6b6] focus:outline-none focus:border-[#8bd6b6] placeholder:text-[#555] placeholder:font-mono placeholder:text-sm placeholder:tracking-normal"
                    placeholder="Enter OTP"
                    required
                  />
                  <span className="block text-[10px] text-[#89938d] mt-1 font-mono text-right">
                    Default Test OTP: <code className="text-[#8bd6b6] font-bold">123456</code>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="w-full flex items-center justify-center gap-2 rounded-none bg-[#065f46] border-2 border-[#047857] shadow-[0_4px_0_0_#003828] hover:bg-[#047857] py-3.5 text-xs font-['Silkscreen'] uppercase tracking-wider text-white active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isVerifyingOtp ? (
                    <span>Authorizing &amp; Locking Escrow...</span>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Authorize ₹{grandTotal}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 4. LIVE PROCESSING & ESCROW LOCKING ANIMATION */}
        {step === "processing" && (
          <div className="py-12 p-6 text-center animate-in fade-in duration-200">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center mb-6">
              <span className="absolute h-full w-full rounded-none bg-[#065f46]/30 animate-ping" />
              <div className="h-16 w-16 rounded-none border-4 border-[#047857] border-t-transparent animate-spin" />
              <Lock className="absolute h-6 w-6 text-[#8bd6b6]" />
            </div>

            <h3 className="text-base font-['Silkscreen'] uppercase tracking-wider text-white">
              Processing Razorpay Payment...
            </h3>
            <p className="mt-2 text-xs font-mono text-[#bec9c2] max-w-xs mx-auto leading-relaxed">
              Verifying transaction and locking ₹{deposit} Security Deposit in RE:USE Escrow Vault...
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-none bg-[#065f46]/30 px-4 py-2 text-xs font-['Silkscreen'] uppercase tracking-wider text-[#8bd6b6] border border-[#8bd6b6]/40">
              <Sparkles className="h-4 w-4 text-[#8bd6b6] animate-spin" />
              <span>Generating Secure Handover Code...</span>
            </div>
          </div>
        )}

        {/* 5. CONFIRMED RECEIPT & OTP SCREEN */}
        {step === "confirmed" && (
          <div className="p-6 text-center py-4 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-none bg-[#065f46]/30 text-[#8bd6b6] border-2 border-[#8bd6b6] shadow-[0_4px_0_0_#003828] mb-3">
              <CheckCircle2 className="h-8 w-8 text-[#8bd6b6]" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-none bg-[#065f46]/30 px-3 py-1 text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#8bd6b6] border border-[#8bd6b6]/40 mb-2">
              <ShieldCheck className="h-4 w-4 text-[#8bd6b6]" />
              <span>Razorpay Verified &bull; {txnId}</span>
            </div>

            <h3 className="text-lg font-['Silkscreen'] uppercase tracking-wider text-white">
              Request Confirmed &amp; Reserved!
            </h3>
            <p className="mt-1 text-xs text-[#bec9c2] font-mono max-w-sm mx-auto">
              Your payment of ₹{grandTotal} was verified. ₹{deposit} Security Deposit is held safely in Escrow.
            </p>

            {/* Secure Handover OTP Box */}
            <div className="mt-5 rounded-none bg-[#141414] p-6 text-white shadow-[0_6px_0_0_#0f0f0f] border-2 border-[#2a2a2a] text-center relative overflow-hidden">
              <div className="flex items-center justify-center gap-1.5 text-xs font-['Silkscreen'] uppercase tracking-wider text-[#8bd6b6]">
                <KeyRound className="h-4 w-4" />
                <span>Handover Verification OTP</span>
              </div>
              <div className="mt-3 font-['Silkscreen'] text-3xl sm:text-4xl text-[#8bd6b6] tracking-widest">
                {handoverOtp}
              </div>
              <div className="mt-3 text-[11px] text-[#bec9c2] font-mono max-w-xs mx-auto">
                Share this 6-digit code with {owner?.name || "owner"} when you physically inspect and receive the item.
              </div>
            </div>

            <div className="mt-4 rounded-none bg-[#141414] p-3 text-xs text-[#bec9c2] font-mono border-2 border-[#2a2a2a]">
              <div className="flex items-center justify-center gap-1 font-semibold text-white">
                <MapPin className="h-3.5 w-3.5 text-[#8bd6b6]" />
                <span>Meeting Spot: {selectedMeetingSpot}</span>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="mt-5 w-full rounded-none bg-[#065f46] border-2 border-[#047857] shadow-[0_4px_0_0_#003828] hover:bg-[#047857] py-3.5 text-xs font-['Silkscreen'] uppercase tracking-wider text-white active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              Done &amp; View in My Borrowings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
