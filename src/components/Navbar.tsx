"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Activity,
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
  } = useRole();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(target)) {
        setRoleDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close all menus when navigating
  useEffect(() => {
    setRoleDropdownOpen(false);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const rolesList: { id: UserRole; title: string; desc: string }[] = [
    { id: "borrower", title: "Borrower Mode", desc: "Seek local gear within 5km" },
    { id: "owner", title: "Resource Owner", desc: "Monetize idle equipment safely" },
    { id: "delivery", title: "Delivery Partner", desc: "Hyperlocal courier console" },
    { id: "admin", title: "Platform Administrator", desc: "Safety, escrow & weights" },
  ];

  const getNavLinksForRole = (currentRole: UserRole) => {
    switch (currentRole) {
      case "borrower":
        return [
          { name: "Explore Gear", href: "/resources", icon: Compass },
          { name: "AI Matches", href: "/matches", icon: Sparkles },
          { name: "DemandPulse", href: "/demandpulse", icon: Activity },
          { name: "My Bookings", href: "/bookings", icon: Package },
          { name: "Impact", href: "/impact", icon: Heart },
        ];
      case "owner":
        return [
          { name: "My Dashboard", href: "/dashboard", icon: Package },
          { name: "DemandPulse", href: "/demandpulse", icon: Activity },
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
          { name: "DemandPulse", href: "/demandpulse", icon: Activity },
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
      <header className="sticky top-0 z-50 w-full bg-[#171717] transition-all border-b border-[#222222]">
        {/* Main Header Bar */}
        <div className="h-16 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              className="flex items-center group transition-transform duration-200 hover:scale-[1.03] active:scale-95"
              title="RE:USE — Hyperlocal Resource Sharing"
            >
              <img
                src="/logo.png"
                alt="RE:USE"
                className="h-10 sm:h-11 md:h-12 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                loading="eager"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links — Clean, Non-wrapping, High Contrast */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`whitespace-nowrap flex items-center gap-2 px-3 xl:px-3.5 py-2 rounded-xl text-xs xl:text-[13px] font-bold tracking-wide transition-all duration-150 ${
                    isActive
                      ? "bg-[#065F46] text-white shadow-xs border border-[#047857]"
                      : "text-slate-300 hover:text-white hover:bg-[#201f1f]"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#8bd6b6]" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Tools & Role Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Persona / Role Switcher */}
            <div className="relative" ref={roleDropdownRef}>
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center bg-[#201f1f] hover:bg-[#262626] border border-[#047857] hover:border-[#8bd6b6] px-3 py-1.5 gap-2 rounded-xl shadow-xs transition-all cursor-pointer"
                title="Switch User Role"
              >
                <span className="w-2 h-2 rounded-full bg-[#8bd6b6] shadow-[0_0_8px_#8bd6b6] animate-pulse"></span>
                <span className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#e5e2e1]">
                  {role === "borrower" && "Borrower"}
                  {role === "owner" && "Owner"}
                  {role === "delivery" && "Courier"}
                  {role === "admin" && "Admin"}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-[#bec9c2] transition-transform duration-200 ${roleDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#1c1b1b] p-2 shadow-2xl border border-[#2a2a2a] z-50 animate-in fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#8bd6b6] border-b border-[#262626] mb-1">
                    Ecosystem Persona Switcher
                  </div>
                  {rolesList.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleRoleSelect(r.id)}
                      className={`w-full text-left p-2.5 text-xs rounded-xl transition-colors flex flex-col cursor-pointer ${
                        role === r.id
                          ? "bg-[#065f46] text-white font-bold border border-[#047857]"
                          : "hover:bg-[#262626] text-[#bec9c2]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold tracking-wide uppercase">{r.title}</span>
                        {role === r.id && (
                          <span className="text-[10px] font-mono font-black text-[#8bd6b6]">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#89938d] mt-0.5">
                        {r.desc}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* List Equipment Action CTA — ONLY visible for Resource Owner role */}
            {role === "owner" && (
              <button
                type="button"
                onClick={() => {
                  if (!isLoggedIn) {
                    openAuthModal("login");
                    return;
                  }
                  if (onOpenShareModal) onOpenShareModal();
                  else router.push("/resources?action=list");
                }}
                className="hidden sm:flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white border border-emerald-500/40 px-3.5 py-1.5 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <PlusCircle className="h-4 w-4 text-[#8bd6b6]" />
                <span className="whitespace-nowrap">List Equipment</span>
              </button>
            )}

            {/* Auth Controls / User Profile */}
            {isLoggedIn ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#2a2a2a] hover:border-[#047857] bg-[#1e1e1e] hover:bg-[#252525] transition-all cursor-pointer"
                  title={`Signed in as ${currentUser.name}`}
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/30"
                  />
                  <span className="hidden xl:inline text-xs font-bold uppercase tracking-wider text-slate-200 max-w-[90px] truncate">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 hidden sm:block transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#1c1b1b] p-2 shadow-2xl border border-[#2a2a2a] z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-[#262626] mb-1">
                      <span className="block text-xs font-bold text-white uppercase truncate">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#8bd6b6]">
                        ★ {currentUser.trustScore || 4.9} Verified Peer
                      </span>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold tracking-wide uppercase text-slate-300 hover:bg-[#262626] hover:text-white transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-[#8bd6b6]" />
                      <span>My Trust Profile</span>
                    </Link>

                    <Link
                      href="/bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold tracking-wide uppercase text-slate-300 hover:bg-[#262626] hover:text-white transition-colors"
                    >
                      <Package className="h-3.5 w-3.5 text-[#8bd6b6]" />
                      <span>My Bookings</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        router.push("/");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold tracking-wide uppercase text-rose-400 hover:bg-[#2a1a1a] hover:text-rose-300 transition-colors mt-1 border-t border-[#262626] cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5 text-rose-400" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-[#222222] hover:bg-[#2a2a2a] border border-[#333333] transition-all cursor-pointer"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal("signup")}
                  className="rounded-xl px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 shadow-xs transition-all cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-[#201f1f] border border-[#2a2a2a] hover:border-emerald-500/50 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Stepped Grass & Dirt Divider Underneath */}
        <div className="w-full flex flex-col pointer-events-none select-none">
          <div className="h-1 w-full bg-[#65A832] relative overflow-hidden flex">
            <div className="w-full h-full bg-[linear-gradient(90deg,#65A832_0%,#4A7A23_50%,#65A832_100%)] bg-[length:16px_4px]"></div>
          </div>
          <div className="h-1.5 w-full bg-[#60452F] shadow-[0_2px_0_0_#0e0e0e]"></div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b-2 border-[#201f1f] bg-[#171717] px-4 pt-4 pb-6 shadow-2xl animate-in slide-in-from-top-2 space-y-4">
            {/* Role Switcher in Mobile Drawer */}
            <div className="bg-[#201f1f] p-3 rounded-2xl border border-[#2a2a2a]">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8bd6b6] mb-2">
                Switch Ecosystem Role
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {rolesList.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      handleRoleSelect(r.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl text-left transition-all text-[11px] font-bold uppercase tracking-wider cursor-pointer ${
                      role === r.id
                        ? "bg-[#065f46] text-white border border-[#047857] shadow-xs"
                        : "bg-[#0e0e0e] text-slate-300 border border-[#2a2a2a] hover:bg-[#252525]"
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
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (!isLoggedIn) {
                    openAuthModal("login");
                    return;
                  }
                  if (onOpenShareModal) onOpenShareModal();
                  else router.push("/resources?action=list");
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white border border-emerald-500/40 py-2.5 text-xs font-bold uppercase tracking-wider shadow-xs active:scale-95 transition-all"
              >
                <PlusCircle className="h-4 w-4 text-[#8bd6b6]" />
                <span>+ List Equipment</span>
              </button>
            )}

            {/* Mobile Nav Links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-colors ${
                      isActive
                        ? "bg-[#065f46] text-white border border-[#047857]"
                        : "text-slate-300 hover:bg-[#201f1f] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? "text-[#8bd6b6]" : "text-slate-400"}`} />
                      <span>{link.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Profile / Auth Controls */}
            {isLoggedIn ? (
              <div className="border-t border-[#2a2a2a] pt-3 space-y-2">
                <div className="flex items-center gap-2.5 px-1">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30"
                  />
                  <div>
                    <div className="text-xs font-bold text-white uppercase">{currentUser.name}</div>
                    <div className="text-[10px] text-[#8bd6b6] font-mono">{currentUser.neighborhood}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    router.push("/");
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2a1a1a] border border-[#4a2020] py-2 text-xs font-bold uppercase tracking-wider text-rose-400 hover:bg-[#351e1e] transition-colors"
                >
                  <LogOut className="h-4 w-4 text-rose-400" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 border-t border-[#2a2a2a] pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("login");
                  }}
                  className="w-full rounded-xl bg-[#201f1f] hover:bg-[#2a2a2a] text-white border border-[#353534] py-2.5 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("signup");
                  }}
                  className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500/50 py-2.5 text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
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
