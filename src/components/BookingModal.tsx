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
  const { createBooking, isLoggedIn, openAuthModal } = useRole();

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900">Authentication Required</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
              To borrow equipment and protect peer owners via Escrow Vault, please Log In or Sign Up first.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                onClose();
                openAuthModal("login");
              }}
              className="w-full rounded-2xl bg-emerald-800 hover:bg-emerald-900 py-3 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
            >
              Log In to Borrow Equipment
            </button>
            <button
              onClick={() => {
                onClose();
                openAuthModal("signup");
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
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
  const deposit = resource.deposit;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 max-h-[94vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 1. ORDER DETAILS & BORROW SETUP STEP */}
        {step === "details" && (
          <div className="p-6">
            {/* Header */}
            <div className="mb-5">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                Peer-to-Peer Campus Escrow
              </span>
              <h3 className="mt-2 text-xl font-black text-slate-900 leading-tight">
                Request to Borrow
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {resource.title}
              </p>
            </div>

            {/* Item preview bar */}
            <div className="flex items-center gap-3.5 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80 mb-5">
              <img
                src={resource.photos[0]}
                alt={resource.title}
                className="h-16 w-16 rounded-xl object-cover border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {resource.title}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Owner:{" "}
                  <span className="font-semibold text-slate-800">
                    {owner?.name || "Rahul Sharma"}
                  </span>{" "}
                  ({owner?.trustScore || "4.9"} ⭐)
                </div>
                <div className="text-xs font-bold text-emerald-700 mt-1">
                  {formatPrice(resource.pricePerDay)}
                </div>
              </div>
            </div>

            {/* Days Duration Counter */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Borrow Duration (Days)
              </label>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-2 bg-slate-50/50">
                <span className="text-xs font-medium text-slate-600 pl-2">
                  Number of days:
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDays((d) => Math.max(1, d - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 active:scale-95"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-black text-sm text-slate-900">
                    {days}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDays((d) => Math.min(14, d + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Meeting Spot Selector */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Campus Handover Spot
              </label>
              <select
                value={selectedMeetingSpot}
                onChange={(e) => setSelectedMeetingSpot(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none"
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

            {/* Price Breakdown Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50 p-4 mb-6 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>
                  Rental Rate ({formatPrice(rate)} × {days} days)
                </span>
                <span className="font-semibold text-slate-800">
                  ₹{subtotal}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Refundable Security Deposit</span>
                <span className="font-semibold text-slate-800">
                  ₹{deposit}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Peer Protection Fee</span>
                <span className="font-semibold text-emerald-700">
                  ₹{platformFee}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>Total Payable at Checkout</span>
                <span className="text-emerald-700">₹{grandTotal}</span>
              </div>
              <div className="text-[10px] text-slate-400 italic">
                * Security deposit is released immediately upon verified return.
              </div>
            </div>

            {/* Proceed Button */}
            <button
              onClick={handleStartPayment}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 py-3.5 text-sm font-bold text-white shadow-md active:scale-95 transition-all"
            >
              <span>Proceed to Razorpay Checkout (₹{grandTotal})</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 2. AUTHENTIC RAZORPAY PAYMENT GATEWAY STEP */}
        {step === "payment_gateway" && (
          <div className="animate-in fade-in duration-200">
            {/* Authentic Razorpay Navy Dark Header */}
            <div className="bg-[#0c2540] text-white p-5 rounded-t-3xl mb-5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-white font-black text-sm tracking-wider">
                  RZP
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-white tracking-wide">RE:USE Campus Escrow</h3>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-400/30">
                      SECURED
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5">
                    <Lock className="h-3 w-3 text-emerald-400 inline" />
                    <span>256-Bit SSL Encrypted Payment Gateway</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-300 block font-bold uppercase tracking-wider">Total Amount</span>
                <span className="text-xl font-black text-emerald-400">₹{grandTotal}</span>
              </div>
            </div>

            <div className="px-6 pb-6">
              {/* Error Message Box */}
              {formError && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-800 border border-red-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
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
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === "upi_gpay"
                      ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Smartphone className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">
                        Razorpay Direct UPI (GPay / PhonePe / BHIM)
                      </span>
                      <span className="text-[10px] text-slate-500">Pay using your UPI ID or VPA</span>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${paymentMethod === "upi_gpay" ? "border-emerald-700 bg-emerald-800 text-white" : "border-slate-300"}`}>
                    {paymentMethod === "upi_gpay" && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </div>

                {paymentMethod === "upi_gpay" && (
                  <div className="ml-4 pl-4 border-l-2 border-emerald-600 space-y-2 animate-in fade-in">
                    <label className="block text-[11px] font-bold text-slate-700">Enter Your UPI ID / VPA</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value);
                          setFormError("");
                        }}
                        placeholder="e.g. mobile@upi or username@okaxis"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-700 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Supported: GPay, PhonePe, Paytm, BHIM</span>
                      <button
                        type="button"
                        onClick={() => setUpiId("student@okaxis")}
                        className="text-emerald-700 font-bold hover:underline"
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
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === "upi_qr"
                      ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                      <QrCode className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">Scan &amp; Pay QR Code</span>
                      <span className="text-[10px] text-slate-500">Scan QR Code from any UPI App</span>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${paymentMethod === "upi_qr" ? "border-emerald-700 bg-emerald-800 text-white" : "border-slate-300"}`}>
                    {paymentMethod === "upi_qr" && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Option 3: Credit / Debit Card */}
                <div
                  onClick={() => {
                    setPaymentMethod("card");
                    setFormError("");
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === "card"
                      ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <CreditCard className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">Debit / Credit Card</span>
                      <span className="text-[10px] text-slate-500">Visa, MasterCard, RuPay, Maestro</span>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${paymentMethod === "card" ? "border-emerald-700 bg-emerald-800 text-white" : "border-slate-300"}`}>
                    {paymentMethod === "card" && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <div className="ml-4 pl-4 border-l-2 border-emerald-600 space-y-2.5 animate-in fade-in">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-bold text-slate-700">Card Number</label>
                        <button
                          type="button"
                          onClick={() => {
                            setCardNumber("4111 1111 1111 1111");
                            setCardExpiry("12/28");
                            setCardCvv("888");
                          }}
                          className="text-[10px] text-emerald-700 font-bold hover:underline"
                        >
                          + Auto-fill Test Card
                        </button>
                      </div>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 XXXX XXXX 8921"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="CVV"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900"
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
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === "netbanking"
                      ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                      <Building2 className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">Net Banking</span>
                      <span className="text-[10px] text-slate-500">HDFC, SBI, ICICI, Axis, Kotak Bank</span>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${paymentMethod === "netbanking" ? "border-emerald-700 bg-emerald-800 text-white" : "border-slate-300"}`}>
                    {paymentMethod === "netbanking" && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </div>

                {paymentMethod === "netbanking" && (
                  <div className="ml-4 pl-4 border-l-2 border-emerald-600 animate-in fade-in">
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-bold text-slate-800"
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
                  className="text-[11px] font-bold text-blue-700 hover:underline inline-flex items-center gap-1 py-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>{isLoadingRazorpay ? "Loading SDK..." : "Or launch Official Razorpay JS Popup Window"}</span>
                </button>
              </div>

              {/* Escrow Lock Notice */}
              <div className="rounded-2xl bg-slate-900 p-3.5 text-white mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Lock className="h-4 w-4 text-emerald-400" />
                  <span>Escrow Hold Deposit: ₹{deposit}</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  100% Refundable
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="w-1/3 rounded-2xl border border-slate-300 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleProceedToOtp}
                  className="w-2/3 flex items-center justify-center gap-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 py-3.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
                >
                  <Zap className="h-4 w-4 text-emerald-300" />
                  <span>Pay ₹{grandTotal} via Razorpay</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. BANK 3D SECURE OTP VERIFICATION STEP */}
        {step === "otp_verification" && (
          <div className="animate-in zoom-in-95 duration-200">
            <div className="bg-[#0c2540] text-white p-5 rounded-t-3xl mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-300">
                  3D Secure Bank Verification
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">Razorpay Auth</span>
            </div>

            <div className="px-6 pb-6 text-center">
              {/* Error Message */}
              {formError && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-800 border border-red-200 flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 mb-3 border border-blue-200">
                <Building2 className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Authorize Bank Payment</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Enter the Bank SMS OTP sent to your phone to authorize ₹{grandTotal}.
              </p>

              <form onSubmit={handleVerifyBankOtp} className="mt-6 max-w-xs mx-auto space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      Bank SMS OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setBankOtp("123456");
                        setFormError("");
                      }}
                      className="text-[10px] font-bold text-emerald-700 hover:underline"
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
                    className="w-full text-center text-2xl font-mono font-black tracking-widest rounded-2xl border-2 border-emerald-600 bg-emerald-50/50 py-3 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-300 placeholder:font-sans placeholder:text-base placeholder:tracking-normal"
                    placeholder="Enter 6-digit OTP"
                    required
                  />
                  <span className="block text-[10px] text-slate-400 mt-1 font-semibold text-right">
                    Default Test OTP: <code className="text-emerald-700 font-bold">123456</code>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 py-3.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  {isVerifyingOtp ? (
                    <span>Authorizing &amp; Locking Escrow...</span>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Submit OTP &amp; Authorize ₹{grandTotal}</span>
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
              <span className="absolute h-full w-full rounded-full bg-emerald-500/30 animate-ping" />
              <div className="h-16 w-16 rounded-full border-4 border-emerald-800 border-t-transparent animate-spin" />
              <Lock className="absolute h-6 w-6 text-emerald-800" />
            </div>

            <h3 className="text-xl font-black text-slate-900">
              Processing Razorpay Payment...
            </h3>
            <p className="mt-2 text-xs font-semibold text-slate-500 max-w-xs mx-auto leading-relaxed">
              Verifying transaction and locking ₹{deposit} Security Deposit in RE:USE Escrow Vault...
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-900 border border-emerald-200">
              <Sparkles className="h-4 w-4 text-emerald-700 animate-spin" />
              <span>Generating Secure Handover Verification Code...</span>
            </div>
          </div>
        )}

        {/* 5. CONFIRMED RECEIPT & OTP SCREEN */}
        {step === "confirmed" && (
          <div className="p-6 text-center py-4 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 mb-3 animate-bounce">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-900 border border-emerald-300 mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Razorpay Verified &bull; {txnId}</span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Request Confirmed &amp; Reserved!
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Your payment of ₹{grandTotal} was verified. ₹{deposit} Security Deposit is held safely in Escrow.
            </p>

            {/* Secure Handover OTP Box */}
            <div className="mt-5 rounded-3xl bg-slate-950 p-6 text-white shadow-xl border border-slate-800 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <KeyRound className="h-4 w-4" />
                <span>Handover Verification OTP</span>
              </div>
              <div className="mt-3 font-mono text-4xl sm:text-5xl font-black tracking-widest text-emerald-400">
                {handoverOtp}
              </div>
              <div className="mt-3 text-[11px] text-slate-400 font-medium max-w-xs mx-auto">
                Share this 6-digit code with {owner?.name || "owner"} when you physically inspect and receive the item.
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200">
              <div className="flex items-center justify-center gap-1 font-semibold text-slate-800">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>Meeting Spot: {selectedMeetingSpot}</span>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="mt-5 w-full rounded-2xl bg-emerald-800 hover:bg-emerald-900 py-3.5 text-xs font-bold text-white shadow-md transition-all"
            >
              Done &amp; View in My Borrowings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
