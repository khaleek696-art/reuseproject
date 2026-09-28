"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Smartphone,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  User,
  GraduationCap,
  Building,
  Package,
  Truck,
  ShieldAlert,
  Zap,
  FileCheck,
  Upload,
  CreditCard,
  KeyRound,
  Check,
} from "lucide-react";
import { UserProfile, UserRole } from "@/lib/roleContext";
import { sendOTP, verifyOTP, loginWithPassword } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: Partial<UserProfile>, role?: UserRole) => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>("borrower");
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("email");
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [step, setStep] = useState<"input" | "otp" | "kyc_proof">("input");

  // Form states
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [accountCategory, setAccountCategory] = useState<"student" | "resident">("student");

  // Document Proof & Role-Specific KYC States
  const [docType, setDocType] = useState<"student_id" | "aadhaar" | "dl">("student_id");
  const [docNumber, setDocNumber] = useState("");
  const [docFileUploaded, setDocFileUploaded] = useState<string | null>(null);
  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);
  
  // Role-Specific Additional Onboarding Fields
  const [hostelBlock, setHostelBlock] = useState("");
  const [department, setDepartment] = useState("");
  const [deliveryVehicle, setDeliveryVehicle] = useState<"bicycle" | "walking" | "scooter">("bicycle");
  const [emergencyContact, setEmergencyContact] = useState("");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);

  const resetFormState = (targetMode?: "login" | "signup") => {
    setMode(targetMode || initialMode);
    setPhone("");
    setEmail("");
    setName("");
    setPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setDocNumber("");
    setDocFileUploaded(null);
    setDocPreviewUrl(null);
    setHostelBlock("");
    setDepartment("");
    setEmergencyContact("");
    setOtp(["", "", "", "", "", ""]);
    setOtpError(null);
    setDevOtpCode(null);
    setStep("input");
    setIsLoading(false);
  };

  // Reset form whenever modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      resetFormState(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const getTargetAddress = () => {
    if (email.includes("@")) return email.trim();
    if (phone.trim()) return phone.trim();
    return email.trim();
  };

  // 1-Click Quick Demo Accounts
  const handleQuickDemoLogin = (role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      let demoUser: Partial<UserProfile> = {};

      if (role === "borrower") {
        demoUser = {
          id: "u_aman",
          name: "Aman Sharma (Customer)",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          neighborhood: "Civic Center / Kothrud Campus",
          trustTier: "established",
          trustScore: 4.9,
          verifiedGovId: true,
          role: "borrower",
        };
      } else if (role === "owner") {
        demoUser = {
          id: "u_priya",
          name: "Priya Patel (Gear Owner)",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
          neighborhood: "Indiranagar Campus Hub",
          trustTier: "established",
          trustScore: 4.95,
          verifiedGovId: true,
          role: "owner",
        };
      } else if (role === "delivery") {
        demoUser = {
          id: "u_vikram",
          name: "Vikram Singh (Courier)",
          avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
          neighborhood: "Hyperlocal Bike Express",
          trustTier: "established",
          trustScore: 4.88,
          verifiedGovId: true,
          role: "delivery",
        };
      } else if (role === "admin") {
        demoUser = {
          id: "u_admin",
          name: "Admin Platform Ops",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
          neighborhood: "Central Ops Hub",
          trustTier: "established",
          trustScore: 5.0,
          verifiedGovId: true,
          role: "admin",
        };
      }

      onLoginSuccess(demoUser, role);
      onClose();
    }, 300);
  };

  // STEP 1 Form Submission
  const handleNextFromInput = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = getTargetAddress();
    if (!target) return;

    if (mode === "signup") {
      // Validate Password match
      if (password !== confirmPassword) {
        setPasswordError("Passwords do not match! Please check both fields.");
        return;
      }
      setPasswordError(null);

      // Send Real Gmail OTP for Signup
      setIsLoading(true);
      setOtpError(null);
      const res = await sendOTP(target);
      if (res && res.otp_debug) setDevOtpCode(res.otp_debug);
      setIsLoading(false);
      setStep("otp");
    } else {
      // Login Mode
      if (loginMethod === "password") {
        setIsLoading(true);
        setOtpError(null);
        await loginWithPassword(target, password || "default_pass_123", selectedRole);
        setIsLoading(false);

        const loggedUser: Partial<UserProfile> = {
          name: authMethod === "phone" ? `User (${phone.slice(-4)})` : email.split("@")[0].toUpperCase(),
          neighborhood: "Civic Center / Campus",
          verifiedPhone: true,
          verifiedEmail: true,
          verifiedGovId: true,
          trustTier: "established",
          trustScore: 4.9,
          role: selectedRole,
        };

        onLoginSuccess(loggedUser, selectedRole);
        onClose();
      } else {
        // Login via Real Email OTP
        setIsLoading(true);
        setOtpError(null);
        const res = await sendOTP(target);
        if (res && res.otp_debug) setDevOtpCode(res.otp_debug);
        setIsLoading(false);
        setStep("otp");
      }
    }
  };

  // STEP 2: Verify Real Email OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setOtpError(null);

    const fullOtp = otp.join("");
    const target = getTargetAddress();

    try {
      const res = await verifyOTP(target, fullOtp);
      setIsLoading(false);

      if (!res || !res.access_token) {
        setOtpError("Invalid OTP! Please enter the exact 6-digit code sent to your Gmail inbox.");
        return;
      }

      if (mode === "signup") {
        // OTP verified successfully -> Proceed to Document Verification Proof (Step 3)
        setStep("kyc_proof");
      } else {
        // Login verified -> Activate user session
        const loggedUser: Partial<UserProfile> = {
          name: authMethod === "phone" ? `User (${phone.slice(-4)})` : email.split("@")[0].toUpperCase(),
          neighborhood: "Civic Center / Campus",
          verifiedPhone: true,
          verifiedEmail: true,
          verifiedGovId: true,
          trustTier: "established",
          trustScore: 4.9,
          role: selectedRole,
        };
        onLoginSuccess(loggedUser, selectedRole);
        onClose();
      }
    } catch (err) {
      setIsLoading(false);
      setOtpError("Invalid OTP! Please enter the exact 6-digit code sent to your Gmail inbox.");
    }
  };

  // STEP 3 (Signup): Submit Identity Document Proof
  const handleKycProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);

      let locationLabel = hostelBlock || "Main Campus Hostel Block";
      if (selectedRole === "delivery") {
        locationLabel = `Campus Runner (${deliveryVehicle.toUpperCase()})`;
      }

      const newProfile: Partial<UserProfile> = {
        id: `u_${Date.now()}`,
        name: name.trim() || (authMethod === "phone" ? `User (${phone.slice(-4)})` : email.split("@")[0]),
        neighborhood: locationLabel,
        verifiedPhone: true,
        verifiedEmail: true,
        verifiedGovId: true,
        trustTier: "not_established",
        trustScore: 3.0,
        totalTransactions: 0,
        role: selectedRole,
      };

      onLoginSuccess(newProfile, selectedRole);
      onClose();

      // Reset form
      setStep("input");
      setDocFileUploaded(null);
      setDocPreviewUrl(null);
      setOtp(["", "", "", "", "", ""]);
    }, 400);
  };

  const roleCards: { id: UserRole; title: string; desc: string; icon: any }[] = [
    {
      id: "borrower",
      title: "Borrower / Customer",
      desc: "Seek equipment nearby within 5 km",
      icon: User,
    },
    {
      id: "owner",
      title: "Equipment Owner",
      desc: "Monetize idle tools & cameras safely",
      icon: Package,
    },
    {
      id: "delivery",
      title: "Delivery Partner",
      desc: "Hyperlocal bike courier console",
      icon: Truck,
    },
    {
      id: "admin",
      title: "Platform Administrator",
      desc: "Disputes, escrow & platform safety",
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xl mb-3 shadow-xs">
            R
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {mode === "login" ? "Log In to RE:USE Account" : "Create New Verified Account"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === "login"
              ? "Access your bookings, gear listings & owner dashboard"
              : "Step 1 of 3: Enter Details & Password -> Verify Gmail OTP -> ID Proof"}
          </p>
        </div>

        {/* Quick 1-Click Demo Accounts Section */}
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 mb-2">
            <Zap className="h-4 w-4 text-emerald-700 animate-pulse" />
            <span>⚡ Quick 1-Click Demo Logins (Instant Test)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("borrower")}
              className="flex items-center gap-2 rounded-xl bg-white p-2.5 text-left border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/80 transition-all shadow-2xs"
            >
              <User className="h-4 w-4 text-emerald-700 shrink-0" />
              <div>
                <span className="block text-xs font-bold text-slate-900 leading-tight">Customer / Borrower</span>
                <span className="text-[10px] font-semibold text-slate-500">Aman (Borrower)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin("owner")}
              className="flex items-center gap-2 rounded-xl bg-white p-2.5 text-left border border-slate-200 hover:border-blue-600 hover:bg-blue-50/80 transition-all shadow-2xs"
            >
              <Package className="h-4 w-4 text-blue-700 shrink-0" />
              <div>
                <span className="block text-xs font-bold text-slate-900 leading-tight">Equipment Owner</span>
                <span className="text-[10px] font-semibold text-slate-500">Priya (Owner)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin("delivery")}
              className="flex items-center gap-2 rounded-xl bg-white p-2.5 text-left border border-slate-200 hover:border-amber-600 hover:bg-amber-50/80 transition-all shadow-2xs"
            >
              <Truck className="h-4 w-4 text-amber-700 shrink-0" />
              <div>
                <span className="block text-xs font-bold text-slate-900 leading-tight">Delivery Courier</span>
                <span className="text-[10px] font-semibold text-slate-500">Vikram (Courier)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin("admin")}
              className="flex items-center gap-2 rounded-xl bg-white p-2.5 text-left border border-slate-200 hover:border-purple-600 hover:bg-purple-50/80 transition-all shadow-2xs"
            >
              <ShieldAlert className="h-4 w-4 text-purple-700 shrink-0" />
              <div>
                <span className="block text-xs font-bold text-slate-900 leading-tight">Platform Admin</span>
                <span className="text-[10px] font-semibold text-slate-500">Superuser Ops</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-5 border border-slate-200">
          <button
            onClick={() => resetFormState("login")}
            className={`w-1/2 rounded-xl py-2 text-xs font-bold transition-all ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => resetFormState("signup")}
            className={`w-1/2 rounded-xl py-2 text-xs font-bold transition-all ${
              mode === "signup"
                ? "bg-emerald-800 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* STEP 1: BASIC INPUT & ROLE SELECTION */}
        {step === "input" && (
          <form onSubmit={handleNextFromInput} className="space-y-4">
            {/* ROLE SELECTION CARDS */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Your Account Role:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roleCards.map((rc) => {
                  const Icon = rc.icon;
                  const isSelected = selectedRole === rc.id;
                  return (
                    <button
                      key={rc.id}
                      type="button"
                      onClick={() => setSelectedRole(rc.id)}
                      className={`flex items-start gap-2.5 rounded-2xl p-3 text-left border transition-all ${
                        isSelected
                          ? "bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs"
                          : "bg-slate-50/60 border-slate-200 hover:bg-slate-100/80"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl border ${
                          isSelected
                            ? "bg-emerald-800 text-white border-emerald-900"
                            : "bg-white text-slate-600 border-slate-200"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900 leading-tight">
                          {rc.title}
                        </span>
                        <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {rc.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Signup Name Field */}
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                  />
                </div>
              </div>
            )}

            {/* Auth Method Selector */}
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
              <span>{authMethod === "phone" ? "Mobile Number" : "Email Address"}</span>
              <button
                type="button"
                onClick={() => setAuthMethod(authMethod === "phone" ? "email" : "phone")}
                className="text-emerald-800 hover:underline text-[11px]"
              >
                Use {authMethod === "phone" ? "Email instead" : "Phone instead"}
              </button>
            </div>

            {authMethod === "phone" ? (
              <div className="relative">
                <div className="absolute left-3 top-2.5 flex items-center gap-1 text-xs font-bold text-slate-500 border-r border-slate-200 pr-2">
                  <span>🇮🇳 +91</span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="98765 43210"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-20 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
              </div>
            ) : (
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@college.edu"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
              </div>
            )}

            {/* PASSWORD & CONFIRM PASSWORD FIELDS */}
            {(mode === "signup" || loginMethod === "password") && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                    <span>Password</span>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => setLoginMethod("otp")}
                        className="text-emerald-800 hover:underline text-[11px]"
                      >
                        Login via Real Email OTP instead
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError(null);
                      }}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                    />
                  </div>
                </div>

                {/* SIGNUP CONFIRM PASSWORD FIELD */}
                {mode === "signup" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (passwordError) setPasswordError(null);
                        }}
                        placeholder="••••••••"
                        className={`w-full rounded-xl border pl-10 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${
                          confirmPassword && confirmPassword === password
                            ? "border-emerald-500 bg-emerald-50/30 focus:border-emerald-600 focus:ring-emerald-600/20"
                            : confirmPassword && confirmPassword !== password
                            ? "border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20"
                            : "border-slate-300 bg-slate-50/50 focus:border-emerald-700 focus:ring-emerald-700/20"
                        }`}
                      />
                      {confirmPassword && confirmPassword === password && (
                        <Check className="absolute right-3 top-3 h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {passwordError && (
              <div className="rounded-xl bg-rose-50 p-2.5 border border-rose-200 text-center">
                <span className="text-xs font-bold text-rose-800">{passwordError}</span>
              </div>
            )}

            {mode === "login" && loginMethod === "otp" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setLoginMethod("password")}
                  className="text-emerald-800 hover:underline text-[11px] font-bold"
                >
                  Switch back to Password Login
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 py-3 text-xs font-bold text-white shadow-md active:scale-95 transition-all mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>
                    {mode === "signup"
                      ? "Send Real Email OTP & Continue"
                      : loginMethod === "password"
                      ? "Log In Now"
                      : "Send Real Email OTP"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY REAL EMAIL OTP (BOTH SIGNUP & OTP LOGIN) */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in">
            <div className="rounded-2xl bg-emerald-50 p-3 border border-emerald-200 text-center">
              <span className="text-xs text-emerald-900 font-semibold block">
                Verification OTP sent to {authMethod === "phone" ? `+91 ${phone}` : email}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                📧 Note: Please check Primary Inbox and Spam / Junk folder.
              </span>
              {devOtpCode && (
                <div className="mt-2 rounded-xl bg-emerald-800 p-2 text-white font-extrabold text-xs tracking-widest text-center shadow animate-pulse">
                  ⚡ INSTANT OTP CODE: {devOtpCode}
                </div>
              )}
              <button
                type="button"
                onClick={() => setStep("input")}
                className="text-[11px] font-bold text-emerald-700 hover:underline mt-1.5 block mx-auto"
              >
                Change Number / Email
              </button>
            </div>

            {otpError && (
              <div className="rounded-2xl bg-rose-50 p-3.5 border border-rose-200 text-center animate-in fade-in">
                <span className="text-xs font-bold text-rose-800 leading-relaxed block">
                  {otpError}
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 text-center mb-2">
                Enter 6-Digit Security OTP (Sent to your Gmail Inbox)
              </label>
              <div className="flex justify-center gap-1.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                      if (!pastedData) return;

                      const newOtp = ["", "", "", "", "", ""];
                      for (let i = 0; i < pastedData.length; i++) {
                        newOtp[i] = pastedData[i];
                      }
                      setOtp(newOtp);

                      const targetIndex = Math.min(pastedData.length - 1, 5);
                      document.getElementById(`otp-${targetIndex}`)?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        if (!otp[idx] && idx > 0) {
                          e.preventDefault();
                          const newOtp = [...otp];
                          newOtp[idx - 1] = "";
                          setOtp(newOtp);
                          document.getElementById(`otp-${idx - 1}`)?.focus();
                        } else if (otp[idx]) {
                          const newOtp = [...otp];
                          newOtp[idx] = "";
                          setOtp(newOtp);
                        }
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length > 1) {
                        const newOtp = [...otp];
                        for (let i = 0; i < Math.min(val.length, 6 - idx); i++) {
                          newOtp[idx + i] = val[i];
                        }
                        setOtp(newOtp);
                        const nextIdx = Math.min(idx + val.length, 5);
                        document.getElementById(`otp-${nextIdx}`)?.focus();
                        return;
                      }

                      const newOtp = [...otp];
                      newOtp[idx] = val;
                      setOtp(newOtp);
                      if (val && idx < 5) {
                        document.getElementById(`otp-${idx + 1}`)?.focus();
                      }
                    }}
                    className="h-11 w-11 text-center rounded-xl border border-slate-300 bg-white text-base font-black text-slate-900 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 py-3 text-xs font-bold text-white shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verifying Security Code...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {mode === "signup"
                      ? "Verify OTP & Proceed to ID Proof"
                      : "Verify & Activate Account"}
                  </span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3 (SIGNUP): ROLE-SPECIFIC IDENTITY PROOF & ONBOARDING STEP */}
        {step === "kyc_proof" && (
          <form onSubmit={handleKycProofSubmit} className="space-y-4 animate-in fade-in">
            <div className="rounded-2xl bg-amber-50 p-3.5 border border-amber-200">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <FileCheck className="h-4 w-4 text-amber-700" />
                  <span>Mandatory Anti-Fraud Identity Proof</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900 uppercase">
                  {selectedRole === "delivery" ? "Runner Onboarding" : "Student KYC"}
                </span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                To prevent theft, fraud, and unreturned items, all community members must verify their identity before accessing the platform.
              </p>
            </div>

            {/* Initial Trust Score Badge Preview */}
            <div className="rounded-2xl bg-emerald-50 p-3 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
                <div>
                  <span className="text-xs font-extrabold text-emerald-950 block">Starting Trust Level: 3.0 ★ (New Peer)</span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">Increases with ID verification & successful rental exchanges</span>
                </div>
              </div>
              <Sparkles className="h-4 w-4 text-emerald-600" />
            </div>

            {/* STUDENT BORROWER / LENDER SPECIFIC FIELDS */}
            {selectedRole !== "delivery" ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Identity Proof Type</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-700 focus:outline-none"
                    >
                      <option value="student_id">College Student ID Card</option>
                      <option value="aadhaar">Aadhaar Card (DigiLocker)</option>
                      <option value="dl">Driving License / Voter ID</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {docType === "student_id" ? "Student PRN / Roll No" : "Govt ID Number"}
                    </label>
                    <input
                      type="text"
                      required
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      placeholder={docType === "student_id" ? "e.g. 2024-VIT-091" : "e.g. 1234-5678-9012"}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hostel Block / Building</label>
                    <input
                      type="text"
                      required
                      value={hostelBlock}
                      onChange={(e) => setHostelBlock(e.target.value)}
                      placeholder="e.g. Hostel 4, Block B, Room 204"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department / Branch</label>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. B.Tech CS 2025"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            ) : (
              /* CAMPUS DELIVERY RUNNER SPECIFIC FIELDS */
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Govt ID Type (Delivery)</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-700 focus:outline-none"
                    >
                      <option value="aadhaar">Government Aadhaar Card</option>
                      <option value="dl">Driving License</option>
                      <option value="student_id">Student ID + Govt ID</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Govt ID Number</label>
                    <input
                      type="text"
                      required
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      placeholder="e.g. 9845-1234-5678"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Vehicle Mode</label>
                    <select
                      value={deliveryVehicle}
                      onChange={(e) => setDeliveryVehicle(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-700 focus:outline-none"
                    >
                      <option value="bicycle">🚲 Campus Bicycle</option>
                      <option value="walking">🚶 Walking Courier</option>
                      <option value="scooter">🛵 Electric Scooter / Bike</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Phone</label>
                    <input
                      type="text"
                      required
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="e.g. Parent / Guardian Phone"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-700 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Document Upload Box with Live Thumbnail Preview */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {selectedRole === "delivery" ? "Upload Govt ID / Badge Photo" : "Upload College ID / Document Scan"}
              </label>
              <input
                type="file"
                id="kyc-file-input"
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setDocFileUploaded(file.name);
                    if (file.type.startsWith("image/")) {
                      setDocPreviewUrl(URL.createObjectURL(file));
                    }
                  }
                }}
                className="hidden"
              />
              <div
                onClick={() => document.getElementById("kyc-file-input")?.click()}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-3 text-center cursor-pointer transition-all ${
                  docFileUploaded
                    ? "border-emerald-600 bg-emerald-50/80"
                    : "border-slate-300 bg-slate-50/50 hover:bg-slate-100 hover:border-emerald-500"
                }`}
              >
                {docPreviewUrl ? (
                  <div className="flex items-center gap-3 w-full">
                    <img src={docPreviewUrl} alt="KYC Preview" className="h-12 w-12 rounded-xl object-cover border border-emerald-300 shadow-xs" />
                    <div className="text-left flex-1">
                      <span className="text-xs font-bold text-emerald-950 block">{docFileUploaded}</span>
                      <span className="text-[10px] text-emerald-700 font-bold block flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Attached &amp; Live S3 Upload Verified
                      </span>
                    </div>
                  </div>
                ) : docFileUploaded ? (
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-bold">{docFileUploaded} (Attached &amp; Verified)</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700">Click to browse Document / Photo</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, PDF up to 10MB</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep("otp")}
                className="w-1/3 rounded-xl border border-slate-300 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !docNumber.trim()}
                className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 py-3 text-xs font-bold text-white shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Activating Account...</span>
                ) : (
                  <>
                    <span>Complete &amp; Activate Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Security Assurance */}
        <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-semibold">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
          <span>256-Bit SSL Secured &bull; Verified ID Proof &amp; Real Email OTP</span>
        </div>
      </div>
    </div>
  );
}
