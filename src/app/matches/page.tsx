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
} from "lucide-react";
import { MOCK_RESOURCES, MOCK_USERS, CATEGORIES } from "@/data/mockData";
import { CategoryId, Resource, User } from "@/lib/types";
import { formatDistance, formatPrice, haversine } from "@/lib/utils";
import { BookingModal } from "@/components/BookingModal";
import { ChatDrawer } from "@/components/ChatDrawer";
import { useRole } from "@/lib/roleContext";

function MatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const promptParam = searchParams.get("prompt");

  const [prompt, setPrompt] = useState(
    promptParam || "I need a professional DSLR camera near campus this Saturday under ₹600."
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const { algorithmWeights, isLoggedIn, openAuthModal } = useRole();

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
  const [chatTarget, setChatTarget] = useState({ name: "Priya Patel", role: "Owner", title: "DSLR Camera" });
  const [isComparing, setIsComparing] = useState(false);

  const examplePrompts = [
    "🎥 4K Cinema Camera under ₹800 near campus this Saturday",
    "🔊 Wireless Mic & Podcast Kit for weekend video shoot",
    "🏕️ 2-Person Waterproof Camping Tent with Sleeping Bags",
    "📽️ HD Projector & Portable Screen for hostel movie night",
  ];

  // Sync prompt state if URL query param changes
  useEffect(() => {
    if (promptParam) {
      setPrompt(promptParam);
    }
  }, [promptParam]);

  // Dynamically parse prompt to extract AI features and budget limit
  const parsedAIIntent = useMemo(() => {
    const text = prompt.toLowerCase();

    let budget = 1000;
    const budgetMatch = text.match(/under ₹?(\d+)/i) || text.match(/₹(\d+)/i);
    if (budgetMatch && budgetMatch[1]) {
      budget = parseInt(budgetMatch[1], 10);
    }

    const dynamicFeatures: string[] = [];
    if (text.includes("4k")) dynamicFeatures.push("4K Video");
    if (text.includes("dual")) dynamicFeatures.push("Dual SD Slots");
    if (text.includes("waterproof") || text.includes("tent")) dynamicFeatures.push("Waterproof Shield");
    if (text.includes("wireless") || text.includes("mic")) dynamicFeatures.push("2.4GHz Wireless");
    if (text.includes("hd") || text.includes("projector")) dynamicFeatures.push("1080p HD Display");
    if (text.includes("autofocus") || text.includes("dslr")) dynamicFeatures.push("Fast Autofocus");

    if (dynamicFeatures.length === 0) {
      dynamicFeatures.push("Verified Gear", "Campus Handoff");
    }

    return { budget, features: dynamicFeatures };
  }, [prompt]);

  // Perform Dynamic AI Semantic Matching across MOCK_RESOURCES
  const rankedCandidates = useMemo(() => {
    const userLat = 18.5204;
    const userLng = 73.8567;
    const q = prompt.toLowerCase();

    // Keywords extraction
    const keywords = q.replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/).filter((k) => k.length > 2);

    let matchedList = MOCK_RESOURCES.filter((resource) => {
      const fullText = `${resource.title} ${resource.description} ${resource.category} ${resource.instructions}`.toLowerCase();
      // Match if title, category or description contains prompt keywords
      return keywords.some((kw) => fullText.includes(kw));
    });

    // Fallback to all resources if query is broad
    if (matchedList.length === 0) {
      matchedList = MOCK_RESOURCES;
    }

    return matchedList
      .map((resource) => {
        const owner = MOCK_USERS.find((u) => u.id === resource.ownerId) || MOCK_USERS[0];
        const distanceKm = haversine(userLat, userLng, resource.location.lat, resource.location.lng);

        const locationScore = distanceKm <= 1 ? 100 : distanceKm <= 3 ? 95 : distanceKm <= 5 ? 80 : 50;
        const budgetScore = resource.pricePerDay <= parsedAIIntent.budget ? 100 : 70;
        const compScore = q.split(" ").some((w) => resource.title.toLowerCase().includes(w)) ? 95 : 75;
        const trustScore = Math.round((owner.trustScore / 5.0) * 100);

        const w = algorithmWeights;
        const totalWeight = w.location + w.time + w.budget + w.compatibility + w.trust;
        const rawScore =
          (locationScore * w.location +
            100 * w.time +
            budgetScore * w.budget +
            compScore * w.compatibility +
            trustScore * w.trust) /
          totalWeight;

        const finalScore = Math.min(99, Math.max(78, Math.round(rawScore)));

        return {
          resource,
          owner,
          distanceKm,
          finalScore,
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 4);
  }, [prompt, parsedAIIntent, algorithmWeights]);

  const topMatch = rankedCandidates[0];
  const otherMatches = rankedCandidates.slice(1);

  const handleRunAISearch = (targetPrompt: string) => {
    setIsExtracting(true);
    setPrompt(targetPrompt);
    router.push(`/matches?prompt=${encodeURIComponent(targetPrompt)}`);
    setTimeout(() => {
      setIsExtracting(false);
    }, 500);
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
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-900 border border-emerald-200 mb-2">
            <Bot className="h-4 w-4 text-emerald-700" />
            <span>AI Hyperlocal Match Assistant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            AI Smart Matches &amp; Specs Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Intelligent semantic matching across budget, neighborhood distance, and verified trust
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsComparing(!isComparing)}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
              isComparing
                ? "bg-emerald-800 text-white border-emerald-900 shadow-sm"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>{isComparing ? "Hide Comparison" : "Compare Side-by-Side"}</span>
          </button>

          <Link
            href="/resources"
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900"
          >
            <span>Catalog View</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* SEARCH BOX & EXAMPLE PROMPTS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
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
              placeholder="Describe what equipment you need in natural language..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isExtracting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 px-6 py-3 text-xs font-bold text-white shadow-md active:scale-95 transition-all shrink-0 disabled:opacity-50"
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
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Try 1-Click Example Prompts:
          </span>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((ex, idx) => {
              const cleanText = ex.replace(/^[^\w]+/, "").trim();
              return (
                <button
                  key={idx}
                  onClick={() => handleRunAISearch(cleanText)}
                  className="rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-900 transition-all text-left"
                >
                  {ex}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500">Extracted Features:</span>
          {parsedAIIntent.features.map((feat) => (
            <span
              key={feat}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200"
            >
              <span>+ {feat}</span>
            </span>
          ))}
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 border border-blue-200">
            <span>Budget &lt; ₹{parsedAIIntent.budget}/day</span>
          </span>
        </div>
      </div>

      {/* AI INTELLIGENT MATCH ANALYSIS BOX */}
      {topMatch && (
        <div className="rounded-3xl border border-emerald-300 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">Why AI Selected This Top Match</h3>
                <span className="text-xs text-slate-300">Semantic match analysis for &ldquo;{prompt}&rdquo;</span>
              </div>
            </div>

            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-300 border border-emerald-500/30">
              {topMatch.finalScore}% Match Score
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-4xl">
            &ldquo;We matched <strong className="text-emerald-300">{topMatch.resource.title}</strong> listed by verified owner <strong className="text-emerald-300">{topMatch.owner.name}</strong>. It is located <strong>{topMatch.distanceKm.toFixed(1)} km</strong> away, matches your query for <strong>{prompt.slice(0, 45)}...</strong>, and is listed at <strong>₹{topMatch.resource.pricePerDay}/day</strong>.&rdquo;
          </p>

          {/* Score Breakdown Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="rounded-xl bg-white/10 p-2.5 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Proximity Distance</span>
              <span className="text-sm font-black text-emerald-300">{topMatch.distanceKm.toFixed(1)} km away</span>
            </div>

            <div className="rounded-xl bg-white/10 p-2.5 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Daily Rental Rate</span>
              <span className="text-sm font-black text-emerald-300">₹{topMatch.resource.pricePerDay}/day</span>
            </div>

            <div className="rounded-xl bg-white/10 p-2.5 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Owner Rating</span>
              <span className="text-sm font-black text-emerald-300">★ {topMatch.owner.trustScore} Verified</span>
            </div>

            <div className="rounded-xl bg-white/10 p-2.5 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Semantic Match</span>
              <span className="text-sm font-black text-emerald-300">{topMatch.finalScore}% Match</span>
            </div>
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARISON VIEW (TOGGLEABLE) */}
      {isComparing && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg space-y-4 animate-in fade-in">
          <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
            <Scale className="h-5 w-5 text-emerald-700" />
            <span>Side-by-Side Gear Comparison</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rankedCandidates.slice(0, 2).map((item, idx) => (
              <div key={item.resource.id} className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-black">
                    {idx === 0 ? "Option A (Top Match)" : "Option B (Alternative)"}
                  </span>
                  <span className="text-sm font-black text-slate-900">₹{item.resource.pricePerDay}/day</span>
                </div>

                <img src={item.resource.photos[0]} alt={item.resource.title} className="w-full h-40 rounded-xl object-cover" />
                <h4 className="font-bold text-slate-900 text-base">{item.resource.title}</h4>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-2">
                  <div className="flex justify-between">
                    <span>Distance:</span>
                    <strong className="text-slate-900">{item.distanceKm.toFixed(1)} km away</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Deposit:</span>
                    <strong className="text-slate-900">₹{item.resource.deposit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Owner Trust:</span>
                    <strong className="text-emerald-700">★ {item.owner.trustScore} Verified</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleStartBooking(item.resource)}
                  className="w-full rounded-xl bg-emerald-800 text-white py-2 text-xs font-bold hover:bg-emerald-900"
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
        <div className="rounded-3xl border-2 border-emerald-600/40 bg-gradient-to-r from-emerald-50/60 via-white to-white p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute top-4 right-4 rounded-full bg-emerald-800 text-white px-3.5 py-1 text-xs font-black shadow-xs flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-emerald-300 text-emerald-300" />
            <span>#1 BEST MATCH ({topMatch.finalScore}%)</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Image */}
            <div className="lg:col-span-1">
              <img
                src={topMatch.resource.photos[0]}
                alt={topMatch.resource.title}
                className="w-full h-56 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
            </div>

            {/* Info */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase border border-emerald-200">
                  {topMatch.resource.category} &bull; {topMatch.distanceKm.toFixed(1)} km away
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  {topMatch.resource.title}
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {topMatch.resource.description}
                </p>
              </div>

              {/* Match Highlights Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>₹{topMatch.resource.pricePerDay}/day rate</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Within {topMatch.distanceKm.toFixed(1)} km radius</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Verified Owner (★ {topMatch.owner.trustScore})</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleStartBooking(topMatch.resource)}
                  className="rounded-xl bg-emerald-800 hover:bg-emerald-900 px-6 py-3 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
                >
                  Book Equipment Now (₹{topMatch.resource.pricePerDay}/day)
                </button>

                <button
                  onClick={() => openChatForOwner(topMatch.owner.name, topMatch.resource.title)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <MessageSquare className="h-4 w-4 text-emerald-700" />
                  <span>Chat with Owner</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALTERNATIVE MATCHES GRID */}
      {otherMatches.length > 0 && (
        <div>
          <h3 className="text-xl font-black text-slate-900 mb-4">Other Good Match Options</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherMatches.map((item) => (
              <div
                key={item.resource.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all"
              >
                <div>
                  <div className="relative mb-3">
                    <img
                      src={item.resource.photos[0]}
                      alt={item.resource.title}
                      className="w-full h-44 rounded-2xl object-cover border border-slate-100"
                    />
                    <span className="absolute top-2 right-2 rounded-full bg-slate-900/90 text-white px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-xs">
                      {item.finalScore}% Match
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {item.resource.category}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1 line-clamp-1">
                    {item.resource.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {item.resource.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-900">
                      ₹{item.resource.pricePerDay}
                    </span>
                    <span className="text-[10px] text-slate-400"> / day</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedResourceForBooking(item.resource);
                      setIsBookingOpen(true);
                    }}
                    className="rounded-xl bg-emerald-800 hover:bg-emerald-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs"
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
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading AI matches...</div>}>
      <MatchesContent />
    </Suspense>
  );
}
