"use client";

import React, { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Clock,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  X,
  Plus,
  ArrowRight,
  Search,
  Check,
  Star,
  MessageSquare,
  Bot,
  Zap,
  SlidersHorizontal,
  Scale,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { MOCK_RESOURCES, MOCK_USERS, CATEGORIES } from "@/data/mockData";
import { CategoryId, Resource, User } from "@/lib/types";
import { formatDistance, formatPrice, haversine } from "@/lib/utils";
import { BookingModal } from "@/components/BookingModal";
import { ChatDrawer } from "@/components/ChatDrawer";
import { useRole } from "@/lib/roleContext";

// Comprehensive English & Hinglish Stopwords to avoid false matches
const STOP_WORDS = new Set([
  "i", "need", "want", "looking", "for", "a", "an", "the", "near", "this", "that",
  "under", "around", "with", "in", "on", "at", "to", "is", "of", "please", "can",
  "get", "give", "me", "urgent", "saturday", "sunday", "weekend", "today", "tomorrow",
  "campus", "college", "good", "best", "and", "or", "some", "item", "gear", "equipment",
  // Hinglish / Hindi colloquialisms
  "chahiye", "mujhe", "mera", "meri", "kya", "hai", "ho", "hoga", "din", "ke", "liye",
  "se", "me", "mein", "par", "pe", "koi", "bhi", "accha", "sasta", "batao", "dikhao"
]);

const CATEGORY_MAP: Record<string, string[]> = {
  tech: ["camera", "dslr", "sony", "canon", "nikon", "lens", "photo", "cinema", "gopro", "vlog", "tripod", "mic", "microphone", "audio", "speaker", "sound", "headphone"],
  tools: ["drill", "tool", "hardware", "dewalt", "bosch", "hammer", "wrench", "screwdriver", "saw", "plier", "repair", "driver"],
  spaces: ["tent", "camping", "camp", "outdoor", "sleeping", "bag", "bonfire", "trek", "backpack"],
  projector: ["projector", "screen", "display", "monitor", "beamer", "movie"],
  laptop: ["laptop", "macbook", "computer", "pc", "ipad", "tablet", "notebook"],
  books: ["book", "notes", "textbook", "study", "engineering", "novel"],
  transport: ["cycle", "bike", "scooter", "bicycle"],
  food: ["fryer", "oven", "grill", "pot", "kitchen", "blender"],
};

function MatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const promptParam = searchParams.get("prompt");

  const [prompt, setPrompt] = useState(
    promptParam || "I need a professional DSLR camera near campus this Saturday under ₹600."
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const { resources, isLoggedIn, openAuthModal } = useRole();

  const handleStartBooking = (res: Resource) => {
    if (!isLoggedIn) {
      openAuthModal("login");
      return;
    }
    setSelectedResourceForBooking(res);
    setIsBookingOpen(true);
  };

  const [selectedResourceForBooking, setSelectedResourceForBooking] =
    useState<Resource | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState({ name: "Priya Patel", role: "Owner", title: "Equipment" });
  const [isComparing, setIsComparing] = useState(false);

  const examplePrompts = [
    "📷 I need a professional DSLR camera near campus this Saturday under ₹600.",
    "🎥 4K Cinema Camera under ₹800 near campus this Saturday",
    "🔊 Wireless Mic & Podcast Kit for weekend video shoot",
    "🏕️ 2-Person Waterproof Camping Tent with Sleeping Bags",
    "📽️ HD Projector & Portable Screen for hostel movie night",
    "🔧 Cordless Drill & Impact Driver Toolkit for room DIY",
  ];

  // Sync prompt state if URL query param changes
  useEffect(() => {
    if (promptParam) {
      setPrompt(promptParam);
    }
  }, [promptParam]);

  // Use live database resources + campus catalog
  const activeResources = useMemo(() => {
    return resources && resources.length > 0 ? resources : MOCK_RESOURCES;
  }, [resources]);

  // 1. Dynamic Natural Language Intent Extraction (Clean & Simple)
  const parsedAIIntent = useMemo(() => {
    const text = (prompt || "").toLowerCase().trim();

    // Budget extraction
    let budget = 2500;
    const budgetMatch =
      text.match(/under\s*₹?\s*(\d+)/i) ||
      text.match(/below\s*₹?\s*(\d+)/i) ||
      text.match(/₹\s*(\d+)/i) ||
      text.match(/<\s*₹?\s*(\d+)/i) ||
      text.match(/(\d+)\s*(?:rs|inr|rupees)/i);
    if (budgetMatch && budgetMatch[1]) {
      budget = parseInt(budgetMatch[1], 10);
    }

    // Detected category intent
    let targetCategory: string | null = null;
    for (const [cat, words] of Object.entries(CATEGORY_MAP)) {
      if (words.some((w) => text.includes(w))) {
        targetCategory = cat;
        break;
      }
    }

    // Clean keywords (remove stopwords & punctuation)
    const cleanTokens = text
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((k) => k.length > 1 && !STOP_WORDS.has(k) && !/^\d+$/.test(k));

    return { budget, targetCategory, keywords: cleanTokens };
  }, [prompt]);

  // 2. Intelligent Scoring Across Active Live Resources
  const { topMatch, otherMatches, hasDirectMatches } = useMemo(() => {
    const userLat = 18.5204;
    const userLng = 73.8567;
    const { budget, targetCategory, keywords } = parsedAIIntent;

    // Score every candidate resource
    const scoredList = activeResources.map((resource) => {
      const owner = MOCK_USERS.find((u) => u.id === resource.ownerId) || {
        id: resource.ownerId,
        name: "Verified Campus Owner",
        college: resource.location?.campus || "Pune Campus",
        trustScore: 4.8,
      };

      const titleLower = resource.title.toLowerCase();
      const descLower = (resource.description || "").toLowerCase();
      const catLower = (resource.category || "").toLowerCase();
      const featuresLower = (resource.features || []).map((f) => f.toLowerCase()).join(" ");

      let matchScore = 0;
      const matchedTerms: string[] = [];

      // A. Keyword matching
      keywords.forEach((kw) => {
        if (titleLower.includes(kw)) {
          matchScore += 45;
          matchedTerms.push(kw);
        } else if (catLower.includes(kw)) {
          matchScore += 30;
          matchedTerms.push(kw);
        } else if (descLower.includes(kw) || featuresLower.includes(kw)) {
          matchScore += 18;
          matchedTerms.push(kw);
        }
      });

      // B. Category match
      if (targetCategory && (catLower.includes(targetCategory) || targetCategory.includes(catLower))) {
        matchScore += 35;
        if (!matchedTerms.includes(targetCategory)) {
          matchedTerms.push(targetCategory);
        }
      }

      // C. Budget score
      const isUnderBudget = resource.pricePerDay <= budget;
      if (isUnderBudget) {
        matchScore += 15;
      } else {
        matchScore -= 10;
      }

      // D. Spatial distance
      const distanceKm = haversine(userLat, userLng, resource.location.lat, resource.location.lng);
      if (distanceKm <= 2.0) matchScore += 10;
      else if (distanceKm <= 5.0) matchScore += 5;

      // Direct match qualification (at least 1 title/category hit)
      const isDirectMatch = matchedTerms.length > 0;

      // Realistic score normalization:
      // Direct matches: 70% to 98%
      // Non-direct fallbacks: 30% to 55%
      let finalScore = 40;
      if (isDirectMatch) {
        finalScore = Math.min(99, Math.max(70, Math.round(50 + matchScore * 0.4)));
      } else {
        finalScore = Math.max(25, Math.min(55, Math.round(30 + (isUnderBudget ? 15 : 0) + (distanceKm < 3 ? 10 : 0))));
      }

      return {
        resource,
        owner,
        distanceKm,
        finalScore,
        isDirectMatch,
        matchedTerms,
        isUnderBudget,
      };
    });

    // Check if any direct match exists
    const directMatches = scoredList.filter((item) => item.isDirectMatch);
    const hasMatches = directMatches.length > 0;

    // If direct matches exist, sort them by score
    // Otherwise, present top catalog items as campus recommendations (clearly labeled)
    const sortedCandidates = hasMatches
      ? directMatches.sort((a, b) => b.finalScore - a.finalScore)
      : scoredList
          .sort((a, b) => (b.isUnderBudget ? 1 : 0) - (a.isUnderBudget ? 1 : 0) || a.distanceKm - b.distanceKm)
          .slice(0, 4);

    return {
      topMatch: sortedCandidates[0] || null,
      otherMatches: sortedCandidates.slice(1, 4),
      hasDirectMatches: hasMatches,
    };
  }, [parsedAIIntent, activeResources]);

  const handleRunAISearch = (targetPrompt: string) => {
    setIsExtracting(true);
    setPrompt(targetPrompt);
    router.push(`/matches?prompt=${encodeURIComponent(targetPrompt)}`);
    setTimeout(() => {
      setIsExtracting(false);
    }, 300);
  };

  const openChatForOwner = (ownerName: string, title: string) => {
    setChatTarget({
      name: ownerName,
      role: "Verified Equipment Owner",
      title: title,
    });
    setIsChatOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner — Dark Mode Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2a2a2a] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20 mb-2">
            <Bot className="h-4 w-4 text-emerald-400" />
            <span>AI Hyperlocal Match Assistant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AI Smart Matches &amp; Specs Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time semantic matching across budget, campus distance, and verified owner trust
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsComparing(!isComparing)}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
              isComparing
                ? "bg-emerald-800 text-white border-emerald-700 shadow-sm"
                : "bg-[#201f1f] text-slate-200 border-[#2a2a2a] hover:bg-[#282828] hover:text-white"
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>{isComparing ? "Hide Comparison" : "Compare Side-by-Side"}</span>
          </button>

          <Link
            href="/resources"
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            <span>Catalog View</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* SEARCH BOX & EXAMPLE PROMPTS — Dark Themed Container */}
      <div className="rounded-3xl border border-[#2a2a2a] bg-[#1c1b1b] p-5 sm:p-6 shadow-xl space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunAISearch(prompt);
          }}
          className="flex flex-col sm:flex-row items-center gap-2.5"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what equipment you need (e.g. DSLR camera, drill, tent under ₹500)..."
              className="w-full rounded-2xl border border-[#333333] bg-[#141414] py-3 pl-10 pr-4 text-xs sm:text-sm font-semibold text-white placeholder-slate-500 focus:bg-[#181818] focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isExtracting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md active:scale-95 transition-all shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {isExtracting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-emerald-300" />
                <span>AI Parsing Semantics...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-emerald-300" />
                <span>AI Match Search</span>
              </>
            )}
          </button>
        </form>

        {/* 1-Click Example Prompts */}
        <div className="pt-2 border-t border-[#2a2a2a]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Try 1-Click Example Prompts:
          </span>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((ex, idx) => {
              const cleanText = ex.replace(/^[^\w]+/, "").trim();
              const isSelected = prompt === cleanText;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleRunAISearch(cleanText)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all text-left cursor-pointer ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold"
                      : "border-[#333333] bg-[#222222] text-slate-300 hover:border-emerald-500/50 hover:bg-[#282828] hover:text-white"
                  }`}
                >
                  {ex}
                </button>
              );
            })}
          </div>
        </div>

        {/* Extracted Intent Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2a2a2a]">
          <span className="text-xs font-bold text-slate-400">Extracted Criteria:</span>
          {parsedAIIntent.keywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20"
            >
              <span>+ {kw}</span>
            </span>
          ))}
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
            <span>Budget &le; ₹{parsedAIIntent.budget}/day</span>
          </span>
          {parsedAIIntent.targetCategory && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/20 uppercase">
              <span>Category: {parsedAIIntent.targetCategory}</span>
            </span>
          )}
        </div>
      </div>

      {/* NO DIRECT MATCH NOTICE (HONEST & USER-FRIENDLY STATE) */}
      {!hasDirectMatches && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 flex items-start gap-3.5 text-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm">
            <h4 className="font-bold text-amber-300">
              No exact match found for &ldquo;{prompt}&rdquo; in current campus inventory
            </h4>
            <p className="text-amber-200/90 leading-relaxed">
              We couldn&apos;t find an exact item matching all keywords. Showing top available gear on campus below as recommended alternatives:
            </p>
          </div>
        </div>
      )}

      {/* AI INTELLIGENT MATCH ANALYSIS BOX */}
      {topMatch && (
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950 via-[#1c1b1b] to-[#171717] p-6 sm:p-8 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">
                  {hasDirectMatches ? "Why AI Selected This Top Match" : "Recommended Campus Alternative"}
                </h3>
                <span className="text-xs text-slate-300">
                  Semantic match analysis for &ldquo;{prompt.slice(0, 60)}{prompt.length > 60 ? "..." : ""}&rdquo;
                </span>
              </div>
            </div>

            <span
              className={`rounded-full px-3.5 py-1 text-xs font-black border ${
                hasDirectMatches
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
              }`}
            >
              {topMatch.finalScore}% {hasDirectMatches ? "Match Score" : "Relevance"}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-4xl">
            {hasDirectMatches ? (
              <>
                &ldquo;Matched <strong className="text-emerald-300">{topMatch.resource.title}</strong> listed by verified owner{" "}
                <strong className="text-emerald-300">{topMatch.owner.name}</strong>. It is located{" "}
                <strong>{topMatch.distanceKm.toFixed(1)} km</strong> away on campus, matches your requirement for{" "}
                <strong>{topMatch.matchedTerms.join(", ") || prompt}</strong>, and is available at{" "}
                <strong>₹{topMatch.resource.pricePerDay}/day</strong>{" "}
                ({topMatch.isUnderBudget ? "within your budget limit" : "slightly above target budget"}).&rdquo;
              </>
            ) : (
              <>
                &ldquo;While an exact match for &lsquo;{prompt}&rsquo; isn&apos;t listed yet,{" "}
                <strong className="text-amber-300">{topMatch.resource.title}</strong> is one of our highest-rated campus resources, located{" "}
                <strong>{topMatch.distanceKm.toFixed(1)} km</strong> away with a verified owner (★ {topMatch.owner.trustScore}).&rdquo;
              </>
            )}
          </p>

          {/* Score Breakdown Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="rounded-xl bg-[#222222] p-2.5 border border-[#333333] text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Proximity Distance</span>
              <span className="text-sm font-black text-emerald-300">{topMatch.distanceKm.toFixed(1)} km away</span>
            </div>

            <div className="rounded-xl bg-[#222222] p-2.5 border border-[#333333] text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Daily Rental Rate</span>
              <span className="text-sm font-black text-emerald-300">₹{topMatch.resource.pricePerDay}/day</span>
            </div>

            <div className="rounded-xl bg-[#222222] p-2.5 border border-[#333333] text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Owner Trust</span>
              <span className="text-sm font-black text-emerald-300">★ {topMatch.owner.trustScore} Verified</span>
            </div>

            <div className="rounded-xl bg-[#222222] p-2.5 border border-[#333333] text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Match Status</span>
              <span className="text-sm font-black text-emerald-300">
                {hasDirectMatches ? `${topMatch.finalScore}% Match` : "Campus Alternative"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARISON VIEW (TOGGLEABLE) */}
      {isComparing && (
        <div className="rounded-3xl border border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-xl space-y-4 animate-in fade-in">
          <h3 className="font-black text-white text-lg flex items-center gap-2">
            <Scale className="h-5 w-5 text-emerald-400" />
            <span>Side-by-Side Gear Comparison</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[topMatch, otherMatches[0]].filter(Boolean).map((item, idx) => (
              <div key={item!.resource.id} className="rounded-2xl border border-[#333333] p-4 space-y-3 bg-[#171717]">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-black">
                    {idx === 0 ? "Option A (Top Match)" : "Option B (Alternative)"}
                  </span>
                  <span className="text-sm font-black text-white">₹{item!.resource.pricePerDay}/day</span>
                </div>

                <img
                  src={item!.resource.photos[0]}
                  alt={item!.resource.title}
                  className="w-full h-40 rounded-xl object-cover border border-[#2a2a2a]"
                />
                <h4 className="font-bold text-white text-base">{item!.resource.title}</h4>

                <div className="space-y-1.5 text-xs text-slate-300 border-t border-[#2a2a2a] pt-2">
                  <div className="flex justify-between">
                    <span>Distance:</span>
                    <strong className="text-white">{item!.distanceKm.toFixed(1)} km away</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Deposit:</span>
                    <strong className="text-white">₹{item!.resource.deposit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Owner Trust:</span>
                    <strong className="text-emerald-400">★ {item!.owner.trustScore} Verified</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleStartBooking(item!.resource)}
                  className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white py-2 text-xs font-bold transition-all cursor-pointer"
                >
                  Select This Gear
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOP MATCH HERO CARD */}
      {topMatch && (
        <div className="rounded-3xl border border-emerald-500/30 bg-[#1c1b1b] p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-4 right-4 rounded-full bg-emerald-700 text-white px-3.5 py-1 text-xs font-black shadow-md flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-emerald-300 text-emerald-300" />
            <span>
              {hasDirectMatches ? `#1 BEST MATCH (${topMatch.finalScore}%)` : `TOP RECOMMENDED (${topMatch.finalScore}%)`}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Image */}
            <div className="lg:col-span-1">
              <img
                src={topMatch.resource.photos[0]}
                alt={topMatch.resource.title}
                className="w-full h-56 rounded-2xl object-cover border border-[#2a2a2a] shadow-md"
              />
            </div>

            {/* Info */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase border border-emerald-500/20">
                  {topMatch.resource.category} &bull; {topMatch.distanceKm.toFixed(1)} km away
                </span>
                <h2 className="text-2xl font-black text-white mt-2">
                  {topMatch.resource.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  {topMatch.resource.description}
                </p>
              </div>

              {/* Match Highlights Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#141414] p-3.5 rounded-2xl border border-[#2a2a2a] text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>₹{topMatch.resource.pricePerDay}/day rate</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Within {topMatch.distanceKm.toFixed(1)} km radius</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Verified Owner (★ {topMatch.owner.trustScore})</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleStartBooking(topMatch.resource)}
                  className="rounded-xl bg-emerald-700 hover:bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Book Equipment Now (₹{topMatch.resource.pricePerDay}/day)
                </button>

                <button
                  onClick={() => openChatForOwner(topMatch.owner.name, topMatch.resource.title)}
                  className="flex items-center gap-1.5 rounded-xl border border-[#333333] bg-[#222222] px-4 py-3 text-xs font-bold text-slate-200 hover:bg-[#2a2a2a] hover:text-white transition-colors cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 text-emerald-400" />
                  <span>Chat with Owner</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALTERNATIVE MATCHES GRID */}
      {otherMatches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-white">
            {hasDirectMatches ? "Other Relevant Match Options" : "More Campus Equipment Available"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherMatches.map((item) => (
              <div
                key={item.resource.id}
                className="rounded-3xl border border-[#2a2a2a] bg-[#1c1b1b] p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all"
              >
                <div>
                  <div className="relative mb-3">
                    <img
                      src={item.resource.photos[0]}
                      alt={item.resource.title}
                      className="w-full h-44 rounded-2xl object-cover border border-[#2a2a2a]"
                    />
                    <span className="absolute top-2 right-2 rounded-full bg-black/80 text-white px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-xs border border-white/10">
                      {item.finalScore}% {item.isDirectMatch ? "Match" : "Score"}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {item.resource.category}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1 line-clamp-1">
                    {item.resource.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {item.resource.description}
                  </p>
                </div>

                <div className="border-t border-[#2a2a2a] pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-white">
                      ₹{item.resource.pricePerDay}
                    </span>
                    <span className="text-[10px] text-slate-400"> / day</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedResourceForBooking(item.resource);
                      setIsBookingOpen(true);
                    }}
                    className="rounded-xl bg-emerald-700 hover:bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer transition-all"
                  >
                    View &amp; Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      {selectedResourceForBooking && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedResourceForBooking(null);
          }}
          resource={selectedResourceForBooking}
        />
      )}

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        recipientName={chatTarget.name}
        recipientRole={chatTarget.role}
        resourceTitle={chatTarget.title}
      />
    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading AI matches...</div>}>
      <MatchesContent />
    </Suspense>
  );
}
