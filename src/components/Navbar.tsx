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
    { id: "delivery", title: "Delivery Partner", desc: "Hyperlocal courier console" },
    { id: "admin", title: "Platform Administrator", desc: "Safety, escrow & weights" },
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
      <header className="sticky top-0 z-50 w-full bg-[#171717] transition-all">
        {/* Main Header Bar */}
        <div className="h-16 max-w-[1440px] mx-auto px-4 lg:px-6 flex items-center justify-between gap-3">
          {/* Brand Logo with Minecraft Voxel Block */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              {/* Voxel Grass/Dirt Block Icon */}
              <div className="w-8 h-8 rounded-none border border-[#2d5f00] relative overflow-hidden flex flex-col shadow-[inset_1px_1px_0_#94db5e,inset_-1px_-1px_0_#183800] bg-[#60452F]">
                <div className="h-4 w-full bg-[#65A832] relative flex">
                  <div className="absolute bottom-0 left-1 w-1.5 h-1.5 bg-[#4A7A23]"></div>
                  <div className="absolute bottom-[-2px] left-3 w-1.5 h-1.5 bg-[#65A832]"></div>
                  <div className="absolute bottom-[-1px] left-5 w-1.5 h-1.5 bg-[#4A7A23]"></div>
                </div>
                <div className="h-4 w-full bg-[#60452F] relative">
                  <div className="absolute top-1 left-2 w-1 h-1 bg-[#3f2b1d]"></div>
                  <div className="absolute top-2 left-5 w-1 h-1 bg-[#805a3e]"></div>
                </div>
              </div>
              <span className="font-['Silkscreen'] text-lg font-bold tracking-wider text-[#65A832] group-hover:text-[#8bd6b6] transition-colors">
                RE:USE
              </span>
            </Link>

            {/* FastAPI Backend Connection Live Badge */}
            {isBackendConnected && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#201f1f] border border-[#047857] text-[#8bd6b6] font-mono text-[10px] tracking-wider uppercase shadow-[inset_1px_1px_0_#0a0a0a]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8bd6b6] animate-pulse"></span>
                FastAPI Live
              </span>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center h-16">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`h-16 flex items-center gap-2 px-3.5 xl:px-4 font-headline-sm uppercase tracking-wider text-[12px] xl:text-[13px] transition-colors ${
                    isActive
                      ? "bg-[#065f46] text-white font-bold shadow-[inset_0_-3px_0_0_#8bd6b6]"
                      : "text-[#bec9c2] hover:text-white hover:bg-[#201f1f]"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-[#8bd6b6]" : "text-[#89938d]"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Tools & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Persona / Role Switcher in Voxel Tactical Well */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="relative flex items-center bg-[#201f1f] border-2 border-[#047857] px-2.5 py-1.5 gap-2 shadow-[inset_2px_2px_0_#0e0e0e,inset_-2px_-2px_0_#2a2a2a] cursor-pointer hover:border-[#8bd6b6] transition-colors"
                title="Switch User Role"
              >
                <span className="w-2 h-2 rounded-full bg-[#8bd6b6] shadow-[0_0_6px_#8bd6b6] animate-pulse"></span>
                <span className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#e5e2e1]">
                  {role === "borrower" && "Borrower"}
                  {role === "owner" && "Owner"}
                  {role === "delivery" && "Courier"}
                  {role === "admin" && "Admin"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-[#bec9c2]" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-none bg-[#1c1b1b] p-2 shadow-[0_8px_0_0_#0e0e0e] border-2 border-[#2a2a2a] z-50 animate-in fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#8bd6b6] border-b border-[#262626] mb-1">
                    Ecosystem Persona Switcher
                  </div>
                  {rolesList.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleRoleSelect(r.id)}
                      className={`w-full text-left p-2.5 text-xs transition-colors flex flex-col cursor-pointer ${
                        role === r.id
                          ? "bg-[#065f46] text-white font-bold border border-[#047857]"
                          : "hover:bg-[#262626] text-[#bec9c2]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-headline-sm uppercase tracking-wider">{r.title}</span>
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
                className="flex items-center gap-1.5 bg-[#065F46] hover:bg-[#047857] text-white border-2 border-[#047857] px-3 py-1.5 font-headline-sm uppercase tracking-wider shadow-[0_4px_0_0_#003828] active:translate-y-0.5 active:shadow-[0_2px_0_0_#003828] transition-all cursor-pointer text-xs"
              >
                <span className="text-[#FBBF24] font-bold text-base leading-none">+</span>
                <span className="font-headline-sm text-[12px] tracking-wider leading-none text-white hidden sm:inline">
                  List Equipment
                </span>
              </button>
            )}

            {/* Auth Controls / User Profile */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="relative p-1 border-2 border-[#60452F] hover:border-[#8bd6b6] bg-[#1a1a1a] shadow-[inset_1px_1px_0_#0F0F0F] transition-colors cursor-pointer flex items-center gap-2"
                  title={`Signed in as ${currentUser.name}`}
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                  />
                  <span className="hidden xl:inline text-xs font-headline-sm uppercase text-[#e5e2e1]">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="h-3 w-3 text-[#bec9c2] hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-none bg-[#1c1b1b] p-2 shadow-[0_8px_0_0_#0e0e0e] border-2 border-[#2a2a2a] z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-[#262626] mb-1">
                      <span className="block text-xs font-bold text-white font-headline-sm uppercase">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#8bd6b6]">
                        ★ {currentUser.trustScore || 4.9} Verified Peer
                      </span>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-headline-sm uppercase tracking-wider text-[#bec9c2] hover:bg-[#262626] hover:text-white transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-[#8bd6b6]" />
                      <span>My Trust Profile</span>
                    </Link>

                    <Link
                      href="/bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-headline-sm uppercase tracking-wider text-[#bec9c2] hover:bg-[#262626] hover:text-white transition-colors"
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
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-headline-sm uppercase tracking-wider text-rose-400 hover:bg-[#2a1a1a] hover:text-rose-300 transition-colors mt-1 border-t border-[#262626] cursor-pointer"
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
                  className="bg-[#201f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] font-headline-sm uppercase text-xs px-3 py-1.5 border-2 border-[#353534] shadow-[0_2px_0_0_#0e0e0e] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal("signup")}
                  className="bg-[#065f46] hover:bg-[#047857] text-white font-headline-sm uppercase text-xs px-3.5 py-1.5 border-2 border-[#047857] shadow-[0_2px_0_0_#003828] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#bec9c2] hover:text-white bg-[#201f1f] border border-[#2a2a2a] cursor-pointer"
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
          <div className="md:hidden border-b-2 border-[#201f1f] bg-[#171717] px-4 pt-3 pb-6 shadow-2xl animate-in slide-in-from-top-2 space-y-4">
            {/* Role Switcher in Mobile Drawer */}
            <div className="bg-[#201f1f] p-3 border-2 border-[#2a2a2a]">
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
                    className={`p-2.5 text-left transition-all text-[11px] font-headline-sm uppercase tracking-wider cursor-pointer ${
                      role === r.id
                        ? "bg-[#065f46] text-white border border-[#047857] shadow-[0_2px_0_0_#003828]"
                        : "bg-[#0e0e0e] text-[#bec9c2] border border-[#2a2a2a] hover:bg-[#252525]"
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
                className="w-full flex items-center justify-center gap-2 bg-[#065F46] hover:bg-[#047857] text-white border-2 border-[#047857] py-2.5 text-xs font-headline-sm uppercase tracking-wider shadow-[0_4px_0_0_#003828] active:translate-y-0.5"
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
                    className={`flex items-center justify-between px-3 py-2.5 text-xs font-headline-sm uppercase tracking-wider transition-colors ${
                      isActive
                        ? "bg-[#065f46] text-white border border-[#047857]"
                        : "text-[#bec9c2] hover:bg-[#201f1f] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-[#8bd6b6]" />
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
                    className="w-8 h-8 rounded-full object-cover border border-[#047857]"
                  />
                  <div>
                    <div className="text-xs font-bold text-white font-headline-sm uppercase">{currentUser.name}</div>
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
                  className="w-full flex items-center justify-center gap-2 bg-[#2a1a1a] border border-[#4a2020] py-2 text-xs font-headline-sm uppercase tracking-wider text-rose-400"
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
                  className="w-full bg-[#201f1f] text-white border-2 border-[#353534] py-2.5 text-xs font-headline-sm uppercase tracking-wider"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("signup");
                  }}
                  className="w-full bg-[#065f46] text-white border-2 border-[#047857] py-2.5 text-xs font-headline-sm uppercase tracking-wider shadow-[0_2px_0_0_#003828]"
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
