"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  MapPin,
  PlusCircle,
  Menu,
  X,
  ShieldCheck,
  Compass,
  Search,
  Truck,
  ShieldAlert,
  ChevronDown,
  User,
  Package,
  Heart,
  LogOut,
  LogIn,
} from "lucide-react";
import { useRole, UserRole } from "@/lib/roleContext";
import { AuthModal } from "@/components/AuthModal";

interface NavbarProps {
  onOpenShareModal?: () => void;
}

export function Navbar({ onOpenShareModal }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    role,
    setRole,
    currentUser,
    isLoggedIn,
    login,
    logout,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    authModalMode,
    isBackendConnected,
  } = useRole();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const rolesList: { id: UserRole; title: string; desc: string }[] = [
    { id: "borrower", title: "Borrower Mode", desc: "Seek local gear within 5km" },
    { id: "owner", title: "Resource Owner", desc: "Monetize idle equipment safely" },
    { id: "delivery", title: "Delivery Partner", desc: "Hyperlocal bike courier console" },
    { id: "admin", title: "Platform Administrator", desc: "Safety, escrow & algorithm weights" },
  ];

  const getNavLinksForRole = (currentRole: UserRole) => {
    switch (currentRole) {
      case "borrower":
        return [
          { name: "Explore Gear", href: "/resources", icon: Compass },
          { name: "AI Matches", href: "/matches", icon: Sparkles },
          { name: "My Bookings", href: "/bookings", icon: Package },
          { name: "Impact", href: "/impact", icon: Heart },
        ];
      case "owner":
        return [
          { name: "My Dashboard", href: "/dashboard", icon: Package },
          { name: "Explore Gear", href: "/resources", icon: Compass },
          { name: "Rental Requests", href: "/bookings?tab=requests", icon: Sparkles },
          { name: "Impact", href: "/impact", icon: Heart },
        ];
      case "delivery":
        return [
          { name: "Deliveries Console", href: "/deliveries", icon: Truck },
          { name: "Impact", href: "/impact", icon: Heart },
        ];
      case "admin":
        return [
          { name: "Admin Console", href: "/admin", icon: ShieldAlert },
          { name: "Impact", href: "/impact", icon: Heart },
        ];
      default:
        return [
          { name: "Explore Gear", href: "/resources", icon: Compass },
          { name: "AI Matches", href: "/matches", icon: Sparkles },
          { name: "My Bookings", href: "/bookings", icon: Package },
        ];
    }
  };

  const navLinks = getNavLinksForRole(role);

  const handleRoleSelect = (newRole: UserRole) => {
    setRole(newRole);
    setRoleDropdownOpen(false);
    if (newRole === "delivery") router.push("/deliveries");
    else if (newRole === "admin") router.push("/admin");
    else if (newRole === "owner") router.push("/dashboard");
    else if (newRole === "borrower") router.push("/resources");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all">
        {/* Top Header Bar */}
        <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-white font-black text-lg shadow-sm transition-transform group-hover:scale-105">
                R
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight text-slate-900 font-sans leading-none">
                  RE<span className="text-emerald-600">:</span>USE
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                  Hyperlocal Marketplace
                </span>
              </div>
            </Link>

            {/* FastAPI Backend Connection Live Badge */}
            {isBackendConnected && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                FastAPI Live
              </span>
            )}
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-emerald-50 text-emerald-900 font-extrabold border border-emerald-200/60"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isActive ? "text-emerald-700" : "text-slate-400"
                    }`}
                  />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* ROLE SWITCHER DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 hover:border-slate-300 transition-colors shadow-2xs"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="capitalize">
                  {role === "borrower" && "Borrower Mode"}
                  {role === "owner" && "Owner Mode"}
                  {role === "delivery" && "Delivery Partner"}
                  {role === "admin" && "Platform Admin"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50 animate-in fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Role Switcher
                  </div>
                  {rolesList.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleRoleSelect(r.id)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex flex-col ${
                        role === r.id
                          ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{r.title}</span>
                        {role === r.id && (
                          <span className="text-[10px] font-black text-emerald-700">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {r.desc}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* List Resource CTA — ONLY visible for Resource Owner role */}
            {role === "owner" && (
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    openAuthModal("login");
                    return;
                  }
                  if (onOpenShareModal) onOpenShareModal();
                  else router.push("/resources?action=list");
                }}
                className="hidden sm:flex items-center gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs active:scale-95 transition-all"
              >
                <PlusCircle className="h-3.5 w-3.5 text-emerald-300" />
                <span>List Gear</span>
              </button>
            )}

            {/* USER PROFILE OR LOGIN BUTTON */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="relative">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500/30"
                    />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs"
                      title="Verified Identity"
                    >
                      <ShieldCheck className="h-2 w-2" />
                    </span>
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">
                      ★ 4.9 Verified
                    </span>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <span className="block text-xs font-bold text-slate-900">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        {currentUser.neighborhood}
                      </span>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="h-4 w-4 text-emerald-700" />
                      <span>My Trust Profile</span>
                    </Link>

                    <Link
                      href="/bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Package className="h-4 w-4 text-emerald-700" />
                      <span>My Bookings</span>
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        router.push("/");
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-slate-100"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal("login")}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuthModal("signup")}
                  className="rounded-xl bg-emerald-800 hover:bg-emerald-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs active:scale-95 transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 shadow-xl animate-in slide-in-from-top-2 space-y-4">
            {/* Role Switcher in Mobile Drawer */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Switch Ecosystem Role
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                {rolesList.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      handleRoleSelect(r.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-2 rounded-xl text-left transition-all text-[11px] ${
                      role === r.id
                        ? "bg-emerald-800 text-white font-extrabold shadow-2xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="truncate">{r.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* List Gear CTA for Resource Owner in Mobile Drawer */}
            {role === "owner" && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (!isLoggedIn) {
                    openAuthModal("login");
                    return;
                  }
                  if (onOpenShareModal) onOpenShareModal();
                  else router.push("/resources?action=list");
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 py-2.5 text-xs font-bold text-white shadow-xs"
              >
                <PlusCircle className="h-4 w-4 text-emerald-300" />
                <span>+ List Equipment Asset</span>
              </button>
            )}

            {/* Nav Links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold ${
                      isActive
                        ? "bg-emerald-50 text-emerald-900 font-extrabold border border-emerald-200/60"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-emerald-700" />
                      <span>{link.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Profile / Auth Controls */}
            {isLoggedIn ? (
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex items-center gap-2 px-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">{currentUser.neighborhood}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    router.push("/");
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-50 border border-rose-200 py-2 text-xs font-bold text-rose-700"
                >
                  <LogOut className="h-4 w-4 text-rose-600" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("login");
                  }}
                  className="w-full rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("signup");
                  }}
                  className="w-full rounded-xl bg-emerald-800 py-2.5 text-xs font-bold text-white shadow-xs"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onLoginSuccess={(u, r) => {
          login(u, r);
          const targetRole = r || u.role || "borrower";
          if (targetRole === "delivery") router.push("/deliveries");
          else if (targetRole === "owner") router.push("/dashboard");
          else if (targetRole === "admin") router.push("/admin");
          else router.push("/explore");
        }}
        initialMode={authModalMode}
      />
    </>
  );
}
