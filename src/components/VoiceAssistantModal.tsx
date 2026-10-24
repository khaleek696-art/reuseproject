"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Mic,
  X,
  Keyboard,
  Globe,
  ArrowRight,
  Bot,
  User as UserIcon,
  ShoppingBag,
  Volume2,
  Sparkles,
} from "lucide-react";
import { Conversation } from "@elevenlabs/client";
import { MOCK_RESOURCES } from "@/data/mockData";
import { useRole } from "@/lib/roleContext";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  matchedAction?: {
    type: "explore" | "faq" | "dashboard";
    title: string;
    query?: string;
    maxPrice?: number;
    url: string;
  };
}

interface ActiveConversation {
  endSession: () => Promise<void>;
  sendUserMessage?: (text: string) => void;
  setMicMuted?: (isMuted: boolean) => void;
}

const AGENT_ID =
  process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ||
  "agent_4601m5mjftz3frxsyx6yq47mrgcf";

export function VoiceAssistantModal() {
  const router = useRouter();
  const { resources } = useRole();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"speaking" | "listening" | "idle">("idle");
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [liveInterim, setLiveInterim] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<"Hinglish" | "Hindi" | "English">("Hinglish");
  const [conversationInstance, setConversationInstance] = useState<ActiveConversation | null>(null);
  const [voiceEngine, setVoiceEngine] = useState<"elevenlabs" | "browser">("browser");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [shouldAutoStart, setShouldAutoStart] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "ai",
      text: "Namaste! I am your RE:USE Voice Co-Pilot. Tap the microphone and tell me what you need — e.g., 'Mujhe ₹500 ke andar DSLR camera chahiye'.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [audioLevels, setAudioLevels] = useState<number[]>([
    25, 38, 55, 72, 88, 100, 92, 78, 60, 60, 78, 92, 100, 88, 72, 55, 38, 25
  ]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const visualizerStreamRef = useRef<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiSpokenPhrasesRef = useRef<Array<{ text: string; time: number }>>([]);
  const aiSpeakingRef = useRef<boolean>(false);
  const aiFinishedSpeakingTimeRef = useRef<number>(0);
  const unmuteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentModeRef = useRef<"speaking" | "listening" | "idle">("idle");
  const convRef = useRef<ActiveConversation | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isBrowserListeningRef = useRef<boolean>(false);

  // Mount check for createPortal SSR safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        stopVoiceSession();
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mode]);

  // Listen for custom global event to open Voice Assistant
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setShouldAutoStart(true);
    };
    window.addEventListener("open-voice-assistant", handleOpen);

    // Preload system voices
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    return () => {
      window.removeEventListener("open-voice-assistant", handleOpen);
    };
  }, []);

  // Live WebAudio visualizer analyzer
  const startVisualizer = async () => {
    try {
      if (typeof window === "undefined") return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      visualizerStreamRef.current = stream;

      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const loop = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        const newLevels: number[] = [];
        const barCount = 18;
        const step = Math.max(1, Math.floor(dataArray.length / barCount));
        for (let i = 0; i < barCount; i++) {
          const raw = dataArray[i * step] || 0;
          const curve = Math.sin((i / (barCount - 1)) * Math.PI);
          const amplified = (raw / 255) * 85 + (curve * 15);
          const pct = Math.max(18, Math.min(100, Math.round(amplified)));
          newLevels.push(pct);
        }
        setAudioLevels(newLevels);
        animFrameRef.current = requestAnimationFrame(loop);
      };

      loop();
    } catch (e) {
      console.warn("Visualizer start notice:", e);
    }
  };

  const stopVisualizer = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.warn("Close audio ctx notice:", e);
      }
      audioContextRef.current = null;
    }
    if (visualizerStreamRef.current) {
      try {
        visualizerStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {
        console.warn("Stop stream notice:", e);
      }
      visualizerStreamRef.current = null;
    }
    setAudioLevels([25, 38, 55, 72, 88, 100, 92, 78, 60, 60, 78, 92, 100, 88, 72, 55, 38, 25]);
  };

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      isBrowserListeningRef.current = false;
      stopVisualizer();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          console.warn("Cancel speech error:", e);
        }
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("Recognition stop error:", e);
        }
      }
      if (unmuteTimeoutRef.current) {
        clearTimeout(unmuteTimeoutRef.current);
      }
      if (conversationInstance) {
        try {
          conversationInstance.endSession();
        } catch (e) {
          console.warn("Session cleanup error:", e);
        }
      }
    };
  }, [conversationInstance]);

  // Intelligent item & budget parser to drive screen actions and deep catalog lookup
  // Intelligent item & budget parser to drive screen actions and deep catalog lookup (Bilingual: Hindi & English)
  const analyzeQueryForActions = (text: string) => {
    const lower = text.toLowerCase();
    let query = "";
    let maxPrice: number | undefined = undefined;

    // Normalize Devanagari numerals ०-९ to standard digits 0-9
    const devanagariDigits: { [key: string]: string } = {
      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
      '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
    };
    const normalizedDigits = lower.replace(/[०-९]/g, (d) => devanagariDigits[d] || d);

    // Detect price numbers (e.g. 500, 1000, 2000 in English or Hindi)
    const priceMatch =
      normalizedDigits.match(/(?:₹|rs|rs\.|inr|rupaye|rupees|under|below|tak|budget|अंडर|नीचे|तक|रुपये|रुपए|बजट)\s*(\d+)/i) ||
      normalizedDigits.match(/(\d+)\s*(?:₹|rs|rs\.|rupaye|rupees|tak|अंडर|नीचे|तक|रुपये|रुपए|बजट)/i) ||
      normalizedDigits.match(/\b(\d{3,5})\b/);
    if (priceMatch && priceMatch[1]) {
      maxPrice = parseInt(priceMatch[1], 10);
    }

    // Comprehensive category & item keyword dictionary (English, Hinglish, & Devanagari Hindi)
    if (
      lower.includes("tool") ||
      lower.includes("टूल") ||
      lower.includes("टूल्स") ||
      lower.includes("औजार") ||
      lower.includes("drill") ||
      lower.includes("ड्रिल") ||
      lower.includes("bosch") ||
      lower.includes("stanley") ||
      lower.includes("multimeter") ||
      lower.includes("screwdriver")
    ) {
      query = "tool";
    } else if (
      lower.includes("textbook") ||
      lower.includes("clrs") ||
      lower.includes("gate") ||
      lower.includes("notes") ||
      lower.includes("kitab") ||
      lower.includes("किताब") ||
      lower.includes("किताबें") ||
      lower.includes("पुस्तक") ||
      lower.includes("पुस्तकें") ||
      lower.includes("बुक") ||
      lower.includes("बुक्स") ||
      (lower.includes("book") && !lower.includes("macbook"))
    ) {
      query = "book";
    } else if (
      lower.includes("camera") ||
      lower.includes("dslr") ||
      lower.includes("कैमरा") ||
      lower.includes("कैमरे") ||
      lower.includes("डीएसएलआर") ||
      lower.includes("canon") ||
      lower.includes("nikon") ||
      lower.includes("sony") ||
      lower.includes("lens") ||
      lower.includes("लेंस") ||
      lower.includes("gopro")
    ) {
      query = "camera";
    } else if (
      lower.includes("laptop") ||
      lower.includes("लैपटॉप") ||
      lower.includes("macbook") ||
      lower.includes("मैकबुक") ||
      lower.includes("computer") ||
      lower.includes("कंप्यूटर") ||
      lower.includes("dell") ||
      lower.includes("thinkpad")
    ) {
      query = "laptop";
    } else if (
      lower.includes("projector") ||
      lower.includes("प्रोजेक्टर") ||
      lower.includes("screen") ||
      lower.includes("स्क्रीन") ||
      lower.includes("epson") ||
      lower.includes("viewsonic")
    ) {
      query = "projector";
    } else if (
      lower.includes("speaker") ||
      lower.includes("स्पीकर") ||
      lower.includes("audio") ||
      lower.includes("ऑडियो") ||
      lower.includes("sound") ||
      lower.includes("साउंड") ||
      lower.includes("bose") ||
      lower.includes("soundlink") ||
      lower.includes("bluetooth")
    ) {
      query = "speaker";
    } else if (
      lower.includes("mic") ||
      lower.includes("माइक") ||
      lower.includes("microphone") ||
      lower.includes("माइक्रोफोन") ||
      lower.includes("rode") ||
      lower.includes("podcast")
    ) {
      query = "microphone";
    } else if (
      lower.includes("cycle") ||
      lower.includes("साइकिल") ||
      lower.includes("साइकल") ||
      lower.includes("bicycle") ||
      lower.includes("bike") ||
      lower.includes("बाइक") ||
      lower.includes("rockrider") ||
      lower.includes("trek")
    ) {
      query = "bicycle";
    } else if (
      lower.includes("tent") ||
      lower.includes("टेंट") ||
      lower.includes("camp") ||
      lower.includes("कैंप") ||
      lower.includes("camping") ||
      lower.includes("quechua")
    ) {
      query = "tent";
    } else if (
      lower.includes("light") ||
      lower.includes("लाइट") ||
      lower.includes("ring light") ||
      lower.includes("रिंग लाइट") ||
      lower.includes("led")
    ) {
      query = "light";
    } else if (
      lower.includes("gimbal") ||
      lower.includes("गिम्बल") ||
      lower.includes("stabilizer") ||
      lower.includes("osmo")
    ) {
      query = "gimbal";
    } else if (
      lower.includes("air fryer") ||
      lower.includes("kitchen") ||
      lower.includes("किचन") ||
      lower.includes("blender") ||
      lower.includes("fryer")
    ) {
      query = "kitchen";
    } else if (
      lower.includes("calc") ||
      lower.includes("calculator") ||
      lower.includes("कैलकुलेटर") ||
      lower.includes("casio")
    ) {
      query = "calculator";
    } else if (
      lower.includes("drone") ||
      lower.includes("ड्रोन") ||
      lower.includes("dji")
    ) {
      query = "drone";
    } else {
      // Dynamic fallback: check if any title or category in catalog is mentioned
      const catalog = resources.length > 0 ? resources : MOCK_RESOURCES;
      const cleanWords = lower
        .replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 2 && !["kya", "hai", "mujhe", "chahiye", "available", "batao", "please", "rent", "pe", "lena", "aur", "koi", "under", "tak", "provide", "provides", "द", "को", "के", "में", "चाहिए"].includes(w));
      for (const word of cleanWords) {
        const found = catalog.find((r) => r.title.toLowerCase().includes(word) || r.category.toLowerCase().includes(word));
        if (found) {
          query = word;
          break;
        }
      }
    }

    if (query) {
      // Find matching items from current resources
      const catalog = resources.length > 0 ? resources : MOCK_RESOURCES;
      const matched = catalog.filter((r) => {
        if (query === "tool") {
          const matchCat = r.category === "tools";
          const matchPrice = maxPrice ? (r.pricePerDay ?? (r as any).dailyRate ?? 0) <= maxPrice : true;
          return matchCat && matchPrice;
        }
        if (query === "book") {
          const matchCat = r.category === "books" || /\bbooks?\b/i.test(r.title.replace(/macbook/gi, ""));
          const matchPrice = maxPrice ? (r.pricePerDay ?? (r as any).dailyRate ?? 0) <= maxPrice : true;
          return matchCat && matchPrice;
        }
        const matchTitle = r.title.toLowerCase().includes(query) || r.category.toLowerCase().includes(query) || (r.description && r.description.toLowerCase().includes(query));
        const matchPrice = maxPrice ? (r.pricePerDay ?? (r as any).dailyRate ?? 0) <= maxPrice : true;
        return matchTitle && matchPrice;
      });

      let url = `/explore?q=${encodeURIComponent(query)}`;
      if (query === "tool") {
        url = maxPrice ? `/explore?category=tools&maxPrice=${maxPrice}` : `/explore?category=tools`;
      } else if (query === "book") {
        url = maxPrice ? `/explore?category=books&q=book&maxPrice=${maxPrice}` : `/explore?category=books&q=book`;
      } else if (query === "laptop") {
        url = maxPrice ? `/explore?category=laptop&maxPrice=${maxPrice}` : `/explore?category=laptop`;
      } else if (query === "camera") {
        url = maxPrice ? `/explore?q=camera&maxPrice=${maxPrice}` : `/explore?q=camera`;
      } else if (query === "projector") {
        url = maxPrice ? `/explore?category=projector&maxPrice=${maxPrice}` : `/explore?category=projector`;
      } else if (query === "bicycle") {
        url = maxPrice ? `/explore?category=transport&maxPrice=${maxPrice}` : `/explore?category=transport`;
      } else if (query === "tent") {
        url = maxPrice ? `/explore?category=spaces&q=tent&maxPrice=${maxPrice}` : `/explore?category=spaces&q=tent`;
      } else if (maxPrice) {
        url = `/explore?q=${encodeURIComponent(query)}&maxPrice=${maxPrice}`;
      }

      const priceTag = maxPrice ? `under ₹${maxPrice}` : "available now";

      return {
        type: "explore" as const,
        title: `Found ${matched.length || 1} ${query} items ${priceTag} on Explore Map`,
        query,
        maxPrice,
        url,
        matchedCount: matched.length,
        firstMatch: matched[0],
      };
    }

    if (lower.includes("deposit") || lower.includes("escrow") || lower.includes("refund") || lower.includes("fraud") || lower.includes("safe") || lower.includes("security")) {
      return {
        type: "faq" as const,
        title: "100% Escrow Security Deposit & Fraud Protection Policy",
        url: "/bookings",
      };
    }

    if (lower.includes("dashboard") || lower.includes("return") || lower.includes("borrowing") || lower.includes("my gear")) {
      return {
        type: "dashboard" as const,
        title: "Open Your Active Borrowings & Returns in Dashboard",
        url: "/dashboard?tab=borrowings",
      };
    }

    return undefined;
  };

  // Web Audio pleasant notification chime ("ding!" for speaking turn, soft beep for stop)
  const playChime = (type: "listening" | "stop") => {
    if (typeof window === "undefined") return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "listening") {
        // Uplifting gentle two-tone chime (520Hz -> 784Hz)
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else {
        // Soft single note acknowledgement (580Hz -> 420Hz)
        osc.type = "sine";
        osc.frequency.setValueAtTime(580, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Language Detection Engine (Pure Hindi vs Pure English vs Hinglish)
  type DetectedLang = "hindi" | "english" | "hinglish";

  const detectLanguage = (text: string): DetectedLang => {
    // 1. Devanagari script presence -> Pure Hindi
    if (/[\u0900-\u097F]/.test(text)) {
      return "hindi";
    }

    const lower = text.toLowerCase().trim();

    // 2. Strong Hindi phonetic markers
    const hindiPhoneticWords = [
      "chahiye", "hai", "hain", "kya", "kyu", "kyon", "kaise", "kisko", "kahan", "kitna", "kitne",
      "batao", "bataiye", "suno", "namaste", "shukriya", "dhanyawad", "rupaye", "rupayee",
      "paisa", "paise", "milega", "milegi", "mil", "de", "do", "karna", "karne", "hoga",
      "hogi", "bhi", "aur", "pe", "par", "mein", "mera", "meri", "humara", "aap", "tum",
      "saaman", "chij", "chijein", "bolo", "boliye", "wapas", "karo", "nahi", "nhi", "lena", "dhoondho"
    ];

    const words = lower.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
    const hindiWordCount = words.filter((w) => hindiPhoneticWords.includes(w)).length;

    // 3. English structural indicators
    const englishMarkers = [
      "the", "is", "are", "i", "need", "want", "looking", "for", "how", "much", "what",
      "where", "can", "get", "borrow", "rent", "show", "me", "available", "under", "price",
      "of", "camera", "laptop", "drill", "projector", "bicycle", "tent", "microphone", "please",
      "help", "deposit", "cost", "safe", "return", "hello", "hi", "rate", "drone"
    ];
    const englishWordCount = words.filter((w) => englishMarkers.includes(w)).length;

    if (hindiWordCount >= 2 || (words.length <= 4 && hindiWordCount >= 1)) {
      return "hinglish";
    }

    if (englishWordCount >= 2 && hindiWordCount === 0) {
      return "english";
    }

    if (selectedLanguage === "Hindi") return "hindi";
    if (selectedLanguage === "English") return "english";
    return "hinglish";
  };

  // Generate localized response mirroring the user's spoken language
  const generateLocalizedReply = (
    rawText: string,
    action: any,
    lang: DetectedLang
  ): { reply: string; speechLang: "hi-IN" | "en-IN" } => {
    const q = rawText.toLowerCase();

    // ===================== PURE HINDI (शुद्ध हिन्दी) =====================
    if (lang === "hindi") {
      // Broad items query
      if (
        q.includes("क्या क्या") ||
        q.includes("कौन कौन") ||
        q.includes("उपलब्ध") ||
        q.includes("सामान") ||
        q.includes("चीजें") ||
        q.includes("लिस्ट")
      ) {
        return {
          reply: "हमारे पास कैमरे, लैपटॉप, साइकिलें, माइक्रोफोन, कैंपिंग टेंट, ब्लूटूथ स्पीकर, टूल्स और इंजीनियरिंग की किताबें उपलब्ध हैं। आपको क्या चाहिए?",
          speechLang: "hi-IN",
        };
      }
      // Price / Rent
      if (q.includes("किराया") || q.includes("दाम") || q.includes("रेट") || q.includes("रुपये") || q.includes("पैसे") || q.includes("कितना")) {
        if (action && action.firstMatch) {
          const item = action.firstMatch;
          const rate = item.pricePerDay ?? item.dailyRate ?? 250;
          return {
            reply: `${item.title} का किराया ₹${rate} प्रतिदिन है और सुरक्षा डिपॉज़िट ₹${item.deposit || 500} है।`,
            speechLang: "hi-IN",
          };
        }
        return {
          reply: "दैनिक किराया ₹90 प्रतिदिन से शुरू होता है (जैसे एलईडी लाइट ₹90, साइकिल ₹150, टूल्स ₹200, कैमरा ₹250, लैपटॉप ₹450)। आप किसी भी सामान का नाम पूछ सकते हैं!",
          speechLang: "hi-IN",
        };
      }
      // Security deposit / Escrow
      if (q.includes("डिपॉजिट") || q.includes("एस्क्रो") || q.includes("सुरक्षित") || q.includes("धोखा") || q.includes("सुरक्षा")) {
        return {
          reply: "आपकी सुरक्षा राशि रेज़रपे एस्क्रो में 100% सुरक्षित रहती है। सामान वापस करने पर 4-अंकों के ओटीपी सत्यापन के तुरंत बाद राशि वापस मिल जाती है।",
          speechLang: "hi-IN",
        };
      }
      // Return / Handover / OTP
      if (q.includes("वापस") || q.includes("लौटाना") || q.includes("ओटीपी")) {
        return {
          reply: "सामान लेने और लौटाने दोनों समय 4-अंकों का ओटीपी लगता है, जिससे धोखाधड़ी बिल्कुल नहीं हो सकती।",
          speechLang: "hi-IN",
        };
      }
      // How to borrow
      if (q.includes("कैसे") || q.includes("प्रक्रिया") || q.includes("लेना")) {
        return {
          reply: "एक्सप्लोर मैप पर सामान चुनें और 'रिक्वेस्ट बॉरो' दबाएं। ओनर की मंजूरी के बाद एस्क्रो डिपॉज़िट जमा करें और कैंपस पिकअप पॉइंट से सामान ले लें।",
          speechLang: "hi-IN",
        };
      }
      // Greetings
      if (q.includes("नमस्ते") || q.includes("प्रणाम") || q.includes("हेलो") || q.includes("सुनो")) {
        return {
          reply: "नमस्ते! मैं आपका रीयूज़ वॉयस को-पायलट हूँ। आपको कॉलेज कैंपस में क्या सामान किराए पर चाहिए?",
          speechLang: "hi-IN",
        };
      }
      // Matched item
      if (action?.type === "explore") {
        const match = action.firstMatch;
        const count = action.matchedCount || 1;
        const priceStr = action.maxPrice ? `₹${action.maxPrice} के बजट में` : "";
        if (match) {
          const rate = match.pricePerDay ?? match.dailyRate ?? 250;
          return {
            reply: `आपके लिए ${priceStr} ${action.query} (जैसे ${match.title}) मिल गए हैं, किराया मात्र ₹${rate}/दिन। नीचे 'View' बटन दबाकर मैप पर देखें।`,
            speechLang: "hi-IN",
          };
        }
        return {
          reply: `आपके लिए ${priceStr} ${action.query} के ${count} आइटम उपलब्ध हैं। नीचे 'View' बटन दबाकर देखें।`,
          speechLang: "hi-IN",
        };
      }
      // Fallback
      const cleanKw = rawText.replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, "").trim();
      return {
        reply: `मैंने एक्सप्लोर स्क्रीन पर '${cleanKw}' सर्च कर दिया है। आप स्क्रीन पर देख सकते हैं।`,
        speechLang: "hi-IN",
      };
    }

    // ===================== PURE ENGLISH =====================
    if (lang === "english") {
      // Broad items query
      if (
        q.includes("what is available") ||
        q.includes("what items") ||
        q.includes("available items") ||
        q.includes("list") ||
        q.includes("catalog") ||
        q.includes("what can i borrow")
      ) {
        return {
          reply: "We have DSLR Cameras, Laptops, Bicycles, Microphones, Camping Tents, Bluetooth Speakers, Power Tools, and Engineering Textbooks available. What would you like to borrow?",
          speechLang: "en-IN",
        };
      }
      // Price / Rent
      if (q.includes("rent") || q.includes("price") || q.includes("rate") || q.includes("cost") || q.includes("how much")) {
        if (action && action.firstMatch) {
          const item = action.firstMatch;
          const rate = item.pricePerDay ?? item.dailyRate ?? 250;
          return {
            reply: `${item.title} is available for ₹${rate} per day with a ₹${item.deposit || 500} refundable deposit.`,
            speechLang: "en-IN",
          };
        }
        return {
          reply: "Daily rental rates start from ₹90 per day (LED lights ₹90, Bicycles ₹150, Tools ₹200, Cameras ₹250, Laptops ₹450). You can ask for any specific gear!",
          speechLang: "en-IN",
        };
      }
      // Escrow / Security deposit
      if (q.includes("deposit") || q.includes("escrow") || q.includes("safe") || q.includes("fraud") || q.includes("security") || q.includes("refund")) {
        return {
          reply: "Security deposits are held 100% safely in Razorpay Escrow. Once the item is verified upon return via a 4-digit OTP, your deposit is refunded immediately.",
          speechLang: "en-IN",
        };
      }
      // Return / Handover / OTP
      if (q.includes("return") || q.includes("handover") || q.includes("otp")) {
        return {
          reply: "Physical handover and return are verified using a 4-digit OTP between owner and borrower for 100% fraud protection.",
          speechLang: "en-IN",
        };
      }
      // How to borrow
      if (q.includes("how to") || q.includes("process") || q.includes("borrow")) {
        return {
          reply: "Select an item on the Explore map, click 'Request Borrow', complete the Escrow deposit after owner approval, and pick up your gear from the campus hotspot.",
          speechLang: "en-IN",
        };
      }
      // Greetings
      if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
        return {
          reply: "Hello! I am your RE:USE Voice Co-Pilot. What equipment would you like to borrow on campus today?",
          speechLang: "en-IN",
        };
      }
      // Matched item
      if (action?.type === "explore" && action.firstMatch) {
        const match = action.firstMatch;
        const rate = match.pricePerDay ?? match.dailyRate ?? 250;
        return {
          reply: `${match.title} is available for ₹${rate} per day. I have filtered it on your screen.`,
          speechLang: "en-IN",
        };
      }
      // Fallback
      const cleanKw = rawText.replace(/[^a-zA-Z0-9\s]/g, "").trim();
      return {
        reply: `I have filtered the search for '${cleanKw}' on your Explore screen. Please check the available gear.`,
        speechLang: "en-IN",
      };
    }

    // ===================== HINGLISH =====================
    // Broad items query
    if (
      q.includes("kya kya") ||
      q.includes("koun koun") ||
      q.includes("kon kon") ||
      q.includes("available hai") ||
      q.includes("kya mil") ||
      q.includes("list") ||
      q.includes("chijein")
    ) {
      return {
        reply: "Humare paas Cameras, Laptops, Bicycles, Microphones, Tents, Bluetooth Speakers, Power Tools, aur Engineering Books sab available hain! Aapko kya chahiye?",
        speechLang: "hi-IN",
      };
    }
    // Price / Rent
    if (q.includes("rent kitna") || q.includes("price kitna") || q.includes("rate kya") || q.includes("kitne rupaye") || q.includes("how much") || q.includes("cost")) {
      if (action && action.firstMatch) {
        const item = action.firstMatch;
        const rate = item.pricePerDay ?? item.dailyRate ?? 250;
        return {
          reply: `${item.title} ka rent ₹${rate} per day hai, aur security deposit ₹${item.deposit || 500} hai.`,
          speechLang: "hi-IN",
        };
      }
      return {
        reply: "Daily rental rates ₹90 se shuru hote hain (jaise LED lights ₹90, Bicycles ₹150, Tools ₹200, Cameras ₹250, Laptops ₹450). Kisi bhi item ka naam lekar pooch sakte hain!",
        speechLang: "hi-IN",
      };
    }
    // Security deposit / Escrow
    if (q.includes("deposit") || q.includes("escrow") || q.includes("safe") || q.includes("fraud") || q.includes("refund") || q.includes("paisa") || q.includes("security")) {
      return {
        reply: "Security deposit 100% safe Razorpay Escrow me rehta hai. Return ke waqt 4-digit OTP verify hote hi deposit turant refund ho jata hai.",
        speechLang: "hi-IN",
      };
    }
    // Return / Handover / OTP
    if (q.includes("return") || q.includes("wapas") || q.includes("handover") || q.includes("otp")) {
      return {
        reply: "Handover aur return dono time 4-digit OTP generate hota hai. Dono users verify karte hain tabhi transaction complete hota hai.",
        speechLang: "hi-IN",
      };
    }
    // How to borrow
    if (q.includes("kaise le") || q.includes("how to borrow") || q.includes("process") || q.includes("booking")) {
      return {
        reply: "Explore screen par item select karke 'Request Borrow' click karein. Owner approve karega, phir deposit pay karke campus pickup spot se collect kar lein.",
        speechLang: "hi-IN",
      };
    }
    // Greetings
    if (q.includes("hi") || q.includes("hello") || q.includes("namaste") || q.includes("suno") || q.includes("hey")) {
      return {
        reply: "Namaste! Main aapka RE:USE Voice Co-Pilot hoon. Aapko campus me jo bhi gear ya equipment chahiye, boliye hum dhoondh denge!",
        speechLang: "hi-IN",
      };
    }
    // Matched item
    if (action?.type === "explore" && action.firstMatch) {
      const match = action.firstMatch;
      const rate = match.pricePerDay ?? match.dailyRate ?? 250;
      return {
        reply: `${match.title} ₹${rate} per day me available hai. Screen par filter kar diya hai.`,
        speechLang: "hi-IN",
      };
    }
    // Fallback
    const cleanKeyword = rawText.replace(/[^a-zA-Z0-9\s]/g, "").trim();
    return {
      reply: `Maine explore screen par '${cleanKeyword}' search filter kar diya hai. Aap screen par check kar sakte hain.`,
      speechLang: "hi-IN",
    };
  };

  // Formulate reply and trigger speech output when user finishes talking
  const handleUserVoiceQuery = (transcript: string) => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (currentModeRef.current === "speaking" || aiSpeakingRef.current) return;
    const userLower = transcript.toLowerCase();

    // Anti-self-loop filter: check if user speech matches recent AI speech
    for (const item of aiSpokenPhrasesRef.current) {
      if (Date.now() - item.time < 20000) {
        if (item.text.includes(userLower) || (userLower.length > 8 && userLower.includes(item.text))) {
          return; // Dropped self-echo
        }
      }
    }

    // Play soft chime indicating speech received
    playChime("stop");

    const action = analyzeQueryForActions(transcript);
    const detectedLang = detectLanguage(transcript);
    const { reply, speechLang } = generateLocalizedReply(transcript, action, detectedLang);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: transcript,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      matchedAction: action,
    };

    setMessages((prev) => [...prev, userMsg]);

    if (action?.type === "explore") {
      router.push(action.url);
    }

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: "ai",
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      matchedAction: action,
    };

    setMessages((prev) => [...prev, aiMsg]);

    // Speak reply mirroring the language of user
    speakBrowserText(reply, speechLang);
  };

  // Helper to start/restart speech recognition cleanly with a fresh instance
  const startContinuousRecognition = () => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setErrorMsg("Browser Speech Recognition not supported in this browser. Please use keyboard mode below.");
      setIsTypingMode(true);
      return;
    }

    // Cleanly teardown any prior instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {
        console.warn("Cleanup prior rec notice:", e);
      }
      recognitionRef.current = null;
    }

    if (!isBrowserListeningRef.current || currentModeRef.current === "speaking" || aiSpeakingRef.current) {
      return;
    }

    try {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = selectedLanguage === "Hindi" ? "hi-IN" : "en-IN";

      rec.onstart = () => {
        setIsConnected(true);
        setMode("listening");
        currentModeRef.current = "listening";
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onresult = (event: any) => {
        if (currentModeRef.current === "speaking" || aiSpeakingRef.current) {
          return;
        }

        let interim = "";
        let finalStr = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0]?.transcript || "";
          if (event.results[i].isFinal) {
            finalStr += trans;
          } else {
            interim += trans;
          }
        }

        const candidate = (finalStr || interim).trim();

        if (interim.trim()) {
          setLiveInterim(interim.trim());
        }

        // Fast path 1: Instant recognition if final arrived
        if (finalStr.trim().length >= 2) {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          setLiveInterim("");
          handleUserVoiceQuery(finalStr.trim());
          return;
        }

        // Fast path 2: Instant pause detection — 600ms silence debouncer
        if (candidate.length >= 3) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (currentModeRef.current === "listening" && !aiSpeakingRef.current && candidate.length >= 2) {
              setLiveInterim("");
              handleUserVoiceQuery(candidate);
            }
          }, 600);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onerror = (e: any) => {
        console.warn("Speech recognition notice:", e?.error);
        if (e?.error === "not-allowed") {
          setErrorMsg("Microphone permission denied. Please allow microphone access in your browser.");
        }
      };

      rec.onend = () => {
        if (isBrowserListeningRef.current && currentModeRef.current !== "speaking" && !aiSpeakingRef.current) {
          setTimeout(() => {
            if (isBrowserListeningRef.current && currentModeRef.current !== "speaking" && !aiSpeakingRef.current) {
              startContinuousRecognition();
            }
          }, 200);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn("startContinuousRecognition error:", err);
    }
  };



  // Browser SpeechSynthesis Voice Player (0 credits, unlimited, instant)
  const speakBrowserText = (text: string, forceLang?: "hi-IN" | "en-IN") => {
    if (typeof window === "undefined") return;

    // Clean text of markdown, asterisks, brackets
    const cleanText = text
      .replace(/\[[a-zA-Z0-9_\s-]+\]/g, "")
      .replace(/\*[^*]+\*/g, "")
      .replace(/[#_~`()]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) return;

    // Save into history to prevent echo detection
    aiSpokenPhrasesRef.current.push({
      text: cleanText.toLowerCase(),
      time: Date.now(),
    });

    // MUTE / ABORT MIC while speaking so speakers don't feed into microphone
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {
        console.warn("Rec abort notice:", e);
      }
      recognitionRef.current = null;
    }

    setMode("speaking");
    currentModeRef.current = "speaking";
    aiSpeakingRef.current = true;

    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();

        const utterance = new SpeechSynthesisUtterance(cleanText);

        // Select matching installed voice matching detected language
        const targetLang = forceLang || (selectedLanguage === "Hindi" ? "hi-IN" : "en-IN");
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const matchedVoice =
            targetLang.startsWith("hi")
              ? voices.find((v) => v.lang.startsWith("hi")) ||
                voices.find((v) => v.lang.includes("IN")) ||
                voices[0]
              : voices.find((v) => v.lang.startsWith("en-IN")) ||
                voices.find((v) => v.lang.includes("en-US")) ||
                voices.find((v) => v.lang.startsWith("en")) ||
                voices[0];

          if (matchedVoice) {
            utterance.voice = matchedVoice;
            utterance.lang = matchedVoice.lang;
          }
        } else {
          utterance.lang = targetLang;
        }

        utterance.rate = 1.15;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
          setMode("speaking");
          currentModeRef.current = "speaking";
          aiSpeakingRef.current = true;
        };

        utterance.onend = () => {
          setMode("idle");
          currentModeRef.current = "idle";
          aiSpeakingRef.current = false;
          aiFinishedSpeakingTimeRef.current = Date.now();
          // Fast 200ms grace silence delay before listening again with fresh recognition
          setTimeout(() => {
            if (isBrowserListeningRef.current) {
              setMode("listening");
              currentModeRef.current = "listening";
              playChime("listening"); // Audible Chime "Ding!" for turn-to-speak
              startContinuousRecognition();
            }
          }, 200);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        utterance.onerror = (err: any) => {
          if (err?.error === "canceled" || err?.error === "interrupted") {
            return;
          }
          console.warn("SpeechSynthesis notice:", err?.error);
          setMode("idle");
          currentModeRef.current = "idle";
          aiSpeakingRef.current = false;
          setTimeout(() => {
            if (isBrowserListeningRef.current) {
              setMode("listening");
              currentModeRef.current = "listening";
              playChime("listening");
              startContinuousRecognition();
            }
          }, 200);
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (e) {
        console.warn("Speech synthesis error:", e);
      }
    }

    // Fallback if speechSynthesis is not available
    setTimeout(() => {
      setMode("idle");
      currentModeRef.current = "idle";
      aiSpeakingRef.current = false;
      setTimeout(() => {
        if (isBrowserListeningRef.current) {
          setMode("listening");
          currentModeRef.current = "listening";
          playChime("listening");
          startContinuousRecognition();
        }
      }, 200);
    }, 1200);
  };

  // Browser Speech Recognition Engine (Unlimited Free Quota)
  const startBrowserVoiceSession = () => {
    setErrorMsg(null);
    setIsConnecting(false);
    setIsConnected(true);
    setVoiceEngine("browser");
    setMode("listening");
    currentModeRef.current = "listening";
    isBrowserListeningRef.current = true;
    startVisualizer();
    playChime("listening"); // Audible Chime "Ding!" on initial mic activation
    startContinuousRecognition();
  };

  // Auto-start listening immediately on modal open for instant zero-click voice response
  useEffect(() => {
    if (isOpen && shouldAutoStart) {
      setShouldAutoStart(false);
      startBrowserVoiceSession();
    }
  }, [isOpen, shouldAutoStart]);

  // Start Voice Session (Attempts ElevenLabs first, transparently falls back to Browser Voice Engine if quota is exceeded)
  const startVoiceSession = async () => {
    setErrorMsg(null);
    setIsConnecting(true);

    if (voiceEngine === "browser") {
      startBrowserVoiceSession();
      return;
    }

    try {
      // Quick permission check probe — immediately closed to release device
      try {
        const probeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        probeStream.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn("Probe stream notice:", e);
      }

      setVoiceEngine("elevenlabs");

      const conv = await Conversation.startSession({
        agentId: AGENT_ID,
        connectionType: "websocket",
        stripAudioTags: true,
        onConversationCreated: (createdConv: ActiveConversation) => {
          convRef.current = createdConv;
        },
        onConnect: () => {
          setIsConnected(true);
          setIsConnecting(false);
          setMode("listening");
          currentModeRef.current = "listening";
        },
        onDisconnect: () => {
          setIsConnected(false);
          setMode("idle");
          currentModeRef.current = "idle";
          aiSpeakingRef.current = false;
        },
        onError: (err: unknown) => {
          console.warn("ElevenLabs error:", err);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const errAny = err as any;
          const raw = (errAny?.message || errAny?.name || String(err) || "").toLowerCase();
          if (
            raw.includes("quota") ||
            raw.includes("credit") ||
            raw.includes("session") ||
            raw.includes("error")
          ) {
            console.log("ElevenLabs quota/error: activating Browser AI Voice Engine");
            startBrowserVoiceSession();
            return;
          }
          setErrorMsg(raw || "Mic or Connection Error");
          setIsConnected(false);
          setIsConnecting(false);
          setMode("idle");
          currentModeRef.current = "idle";
          aiSpeakingRef.current = false;
        },
        onModeChange: ({ mode }: { mode: "speaking" | "listening" }) => {
          setMode(mode);
          currentModeRef.current = mode;

          if (mode === "speaking") {
            aiSpeakingRef.current = true;
            if (unmuteTimeoutRef.current) {
              clearTimeout(unmuteTimeoutRef.current);
              unmuteTimeoutRef.current = null;
            }
            // Hardware/worklet mic mute during AI speech
            if (convRef.current && typeof convRef.current.setMicMuted === "function") {
              try {
                convRef.current.setMicMuted(true);
              } catch (e) {
                console.warn("setMicMuted mute error:", e);
              }
            }
          } else if (mode === "listening") {
            aiSpeakingRef.current = false;
            aiFinishedSpeakingTimeRef.current = Date.now();

            // Mute grace delay: wait 450ms before unmuting mic so room speaker reverberations completely decay
            if (unmuteTimeoutRef.current) clearTimeout(unmuteTimeoutRef.current);
            unmuteTimeoutRef.current = setTimeout(() => {
              if (!aiSpeakingRef.current && convRef.current && typeof convRef.current.setMicMuted === "function") {
                try {
                  convRef.current.setMicMuted(false);
                } catch (e) {
                  console.warn("setMicMuted unmute error:", e);
                }
              }
            }, 450);
          }
        },
        onMessage: (payload: { message: string; source?: "user" | "ai"; role?: string }) => {
          const { message, source, role } = payload;
          if (!message || !message.trim()) return;

          // Strip any emotion markers like [happy], [warmly], [excited], asterisks *smiles*, and XML/SSML tags
          const cleanedText = message
            .replace(/\[[a-zA-Z0-9_\s-]+\]/g, "")
            .replace(/\*[^*]+\*/g, "")
            .replace(/<[^>]+>/g, "")
            .trim();
          if (!cleanedText) return;

          // Determine actual sender: role 'agent' or source 'ai' is ALWAYS AI
          const isAgent = source === "ai" || role === "agent" || role === "assistant";

          if (isAgent) {
            // Register AI utterance into rolling history for acoustic echo comparison
            aiSpokenPhrasesRef.current.push({
              text: cleanedText.toLowerCase(),
              time: Date.now(),
            });
            if (aiSpokenPhrasesRef.current.length > 25) {
              aiSpokenPhrasesRef.current.shift();
            }

            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString() + Math.random(),
                sender: "ai",
                text: cleanedText,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
            return;
          }

          // === USER TRANSCRIPT VERIFICATION & ANTI-ECHO FILTER ===
          // 1. If AI is currently speaking, user microphone is hearing laptop speakers -> DROP
          if (aiSpeakingRef.current || currentModeRef.current === "speaking") {
            return;
          }

          // 2. Check timing & acoustic bleed from recently finished AI speech
          const timeSinceAiSpoke = Date.now() - aiFinishedSpeakingTimeRef.current;
          const userLower = cleanedText.toLowerCase();

          // Extract meaningful words (>2 characters)
          const userWords = userLower
            .split(/\s+/)
            .map((w) => w.replace(/[^a-z0-9]/g, ""))
            .filter((w) => w.length > 2);

          for (const item of aiSpokenPhrasesRef.current) {
            // Check against phrases spoken within the last 30 seconds
            if (Date.now() - item.time < 30000) {
              // Direct substring containment match
              if (item.text.includes(userLower) || (userLower.length > 10 && userLower.includes(item.text))) {
                return;
              }

              // Word overlap detection: if 35%+ of user words appear in recent AI speech and within echo window
              if (userWords.length > 0) {
                const matchingWords = userWords.filter((w) => item.text.includes(w));
                const overlap = matchingWords.length / userWords.length;
                if (overlap >= 0.35 && timeSinceAiSpoke < 3500) {
                  return;
                }
              }
            }
          }

          // Ignore echoes of initial welcome message
          const initWelcome = "namaste i am your reuse voice co pilot powered by elevenlabs ai".toLowerCase();
          if (initWelcome.includes(userLower) && userLower.length > 6) {
            return;
          }

          const action = analyzeQueryForActions(cleanedText);

          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + Math.random(),
              sender: "user",
              text: cleanedText,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              matchedAction: action,
            },
          ]);

          // If user asked to view or search on screen, auto navigate if explore page query is explicit
          if (action?.type === "explore") {
            router.push(action.url);
          }
        },
        clientTools: {
          filter_catalog: async ({ query, max_price }: { query?: string; max_price?: number }) => {
            const url = max_price
              ? `/explore?q=${encodeURIComponent(query || "")}&maxPrice=${max_price}`
              : `/explore?q=${encodeURIComponent(query || "")}`;
            router.push(url);
            return `Successfully filtered catalog for ${query || "items"} under ₹${max_price || "any price"}. Products are now visible on user screen.`;
          },
        },
      });

      convRef.current = conv;
      setConversationInstance(conv);
    } catch (err: unknown) {
      console.warn("ElevenLabs Voice Session notice:", err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errAny = err as any;
      const msg = (errAny?.message || errAny?.name || String(err) || "").toLowerCase();
      if (
        msg.includes("quota") ||
        msg.includes("credit") ||
        msg.includes("session") ||
        msg.includes("error")
      ) {
        console.log("ElevenLabs quota reached at startup: switching to Browser AI Voice Engine");
        startBrowserVoiceSession();
        return;
      }
      setErrorMsg(msg || "Microphone access denied or network issue");
      setIsConnecting(false);
      setIsConnected(false);
      setMode("idle");
    }
  };

  // Stop current voice session
  const stopVoiceSession = async () => {
    isBrowserListeningRef.current = false;
    stopVisualizer();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn("Cancel speech error:", e);
      }
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Recognition stop error:", e);
      }
      recognitionRef.current = null;
    }
    if (unmuteTimeoutRef.current) {
      clearTimeout(unmuteTimeoutRef.current);
      unmuteTimeoutRef.current = null;
    }
    aiSpeakingRef.current = false;
    if (conversationInstance) {
      try {
        await conversationInstance.endSession();
      } catch (e) {
        console.warn("Error ending session:", e);
      }
    }
    setConversationInstance(null);
    setIsConnected(false);
    setMode("idle");
    currentModeRef.current = "idle";
  };

  // Handle manual text message (Type instead)
  const handleSendTextMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim()) return;

    const query = textInput.trim();
    const action = analyzeQueryForActions(query);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      matchedAction: action,
    };

    setMessages((prev) => [...prev, userMsg]);
    setTextInput("");

    if (action?.type === "explore") {
      router.push(action.url);
    }

    // If connected to ElevenLabs voice session, send user message to voice agent
    if (conversationInstance && typeof conversationInstance.sendUserMessage === "function") {
      try {
        conversationInstance.sendUserMessage(query);
      } catch (err) {
        console.warn("Could not send text to ElevenLabs voice session:", err);
      }
    } else {
      // Offline fallback text reply
      setTimeout(() => {
        let reply = "";
        const q = query.toLowerCase();
        if (
          q.includes("kya kya") ||
          q.includes("koun koun") ||
          q.includes("available hai") ||
          q.includes("what is available") ||
          q.includes("list")
        ) {
          reply = "Humare paas Cameras, Laptops, Bicycles, Microphones, Tents, Bluetooth Speakers, Power Tools, aur Engineering Books sab available hain! Aapko kya chahiye?";
        } else if (q.includes("rent kitna") || q.includes("price") || q.includes("rate") || q.includes("cost")) {
          if (action && (action as any).firstMatch) {
            const item = (action as any).firstMatch;
            const rate = item.pricePerDay ?? item.dailyRate ?? 250;
            reply = `${item.title} ka rent ₹${rate} per day hai, aur security deposit ₹${item.deposit || 500} hai.`;
          } else {
            reply = "Daily rental rates ₹90 se shuru hote hain (jaise LED lights ₹90, Bicycles ₹150, Tools ₹200, Cameras ₹250, Laptops ₹450). Kisi bhi item ka naam lekar pooch sakte hain!";
          }
        } else if (q.includes("deposit") || q.includes("escrow") || q.includes("safe") || q.includes("fraud") || q.includes("refund")) {
          reply = "Security deposit 100% safe Razorpay Escrow me rehta hai. Return ke waqt 4-digit OTP verify hote hi deposit turant refund ho jata hai.";
        } else if (action?.type === "explore") {
          const match = (action as any).firstMatch;
          if (match) {
            const rate = match.pricePerDay ?? match.dailyRate ?? 250;
            reply = `${match.title} ₹${rate} per day me available hai. Screen par filter kar diya hai.`;
          } else {
            reply = `Found ${action.query} items under ₹${action.maxPrice || "budget"}. Screen par map filter ho gaya hai.`;
          }
        } else {
          reply = `Maine screen par '${query}' search filter kar diya hai.`;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            matchedAction: action,
          },
        ]);
      }, 600);
    }
  };

  if (!mounted || !isOpen) return null;

  const content = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999999,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopVoiceSession();
          setIsOpen(false);
        }
      }}
    >
      <div
        style={{
          backgroundColor: "#111413",
          border: "2px solid #065f46",
          borderRadius: "24px",
          boxShadow: "0 25px 70px -15px rgba(0, 0, 0, 0.98), 0 0 40px rgba(6, 95, 70, 0.35)",
          width: "100%",
          maxWidth: "560px",
          height: "640px",
          maxHeight: "92vh",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          color: "#ffffff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar: Clean, spacious, and responsive */}
        <div
          style={{
            backgroundColor: "#0b0e0c",
            borderBottom: "1px solid #1f2923",
            padding: "12px 16px",
          }}
          className="flex items-center justify-between gap-3 shrink-0"
        >
          {/* Left Brand & Status Indicator */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-400 shadow-inner shrink-0">
              <Bot className="h-5 w-5" />
              {isConnected && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white tracking-wide whitespace-nowrap">
                  RE:USE Voice AI
                </h3>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                  {voiceEngine === "browser" ? "⚡ Live" : "ElevenLabs"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-[170px] sm:max-w-[240px]">
                {isConnecting
                  ? "Connecting mic..."
                  : isConnected
                  ? mode === "speaking"
                    ? "🎙️ Assistant speaking..."
                    : "👂 Listening to you..."
                  : "Tap mic to speak"}
              </p>
            </div>
          </div>

          {/* Right Controls: Compact Language Dropdown & High-Contrast Close */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Selection Pill */}
            <div className="flex items-center gap-1.5 rounded-xl bg-[#18201b] px-2.5 py-1 text-xs font-mono text-slate-300 border border-[#2b3930]">
              <Globe className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as "Hinglish" | "Hindi" | "English")}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs pr-1"
              >
                <option value="Hinglish" className="bg-[#18201b] text-white">Hinglish</option>
                <option value="Hindi" className="bg-[#18201b] text-white">हिन्दी</option>
                <option value="English" className="bg-[#18201b] text-white">English</option>
              </select>
            </div>

            {/* High-Contrast Close Button */}
            <button
              onClick={() => {
                stopVoiceSession();
                setIsOpen(false);
              }}
              className="flex items-center justify-center h-8 w-8 rounded-xl bg-red-950/40 hover:bg-red-800 text-red-300 hover:text-white border border-red-500/50 transition-all cursor-pointer"
              title="Close Voice Assistant (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Central Audio Waveform & Status Section */}
        <div
          style={{
            backgroundColor: "#0d110f",
            borderBottom: "1px solid #1f2923",
            padding: "14px 18px",
          }}
          className="flex flex-col items-center justify-center text-center shrink-0"
        >
          {errorMsg && (
            <div className="w-full mb-3 px-3 py-2 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs text-center font-mono">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Dedicated Engine Switcher & Speaker Test Strip */}
          <div className="w-full flex items-center justify-between gap-2 max-w-sm mx-auto mb-3 text-[11px] font-mono">
            <button
              onClick={() => {
                stopVoiceSession();
                setVoiceEngine((prev) => (prev === "browser" ? "elevenlabs" : "browser"));
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 cursor-pointer transition-colors whitespace-nowrap text-[11px]"
              title="Click to toggle between Unlimited Voice AI and ElevenLabs"
            >
              <Sparkles className="h-3 w-3 text-emerald-400 shrink-0" />
              <span>{voiceEngine === "browser" ? "⚡ Unlimited Voice AI" : "ElevenLabs Ultra AI"}</span>
            </button>

            <button
              onClick={() =>
                speakBrowserText(
                  selectedLanguage === "Hindi"
                    ? "नमस्ते! आपकी आवाज़ और स्पीकर बिल्कुल सही काम कर रहे हैं।"
                    : "Namaste! Your audio speaker is working loud and clear."
                )
              }
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c221e] hover:bg-[#28322c] text-slate-300 hover:text-white border border-[#2e3a32] cursor-pointer transition-colors whitespace-nowrap text-[11px]"
              title="Click to test sound from speakers"
            >
              <Volume2 className="h-3 w-3 text-emerald-400 shrink-0" />
              <span>Test Sound</span>
            </button>
          </div>

          {/* Voice State Visualization */}
          <div className="relative w-full flex flex-col items-center justify-center">
            {mode === "speaking" ? (
              /* Assistant Speaking: Active dynamic cyan soundwave equalizer */
              <div className="flex flex-col items-center gap-2.5 w-full max-w-sm mx-auto">
                <div className="w-full px-4 py-2 rounded-xl bg-cyan-950/70 border border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                  <div className="text-center">
                    <span className="text-xs sm:text-sm font-bold font-sans tracking-tight text-cyan-200 block whitespace-nowrap">
                      Speaking...
                    </span>
                    <span className="text-[10px] font-sans text-cyan-300/80 font-normal">
                      RE:USE Co-Pilot is responding
                    </span>
                  </div>
                </div>

                {/* Cyan Soundwave Chamber */}
                <div className="w-full flex items-center justify-center gap-1.5 h-16 px-6 py-2 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 shadow-[0_0_25px_rgba(34,211,238,0.25)]">
                  {[25, 45, 75, 95, 65, 85, 100, 70, 90, 90, 70, 100, 85, 65, 95, 75, 45, 25].map((val, idx) => (
                    <div
                      key={idx}
                      className="w-1.5 rounded-full bg-gradient-to-t from-cyan-600 via-cyan-400 to-teal-200 shadow-[0_0_10px_rgba(34,211,238,0.7)] animate-pulse transition-all duration-150"
                      style={{
                        height: `${val}%`,
                        animationDelay: `${idx * 60}ms`,
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={stopVoiceSession}
                  className="text-[11px] font-mono text-slate-400 hover:text-red-400 underline transition-colors cursor-pointer"
                >
                  Tap to stop audio playback
                </button>
              </div>
            ) : mode === "listening" ? (
              /* User Turn to Speak: Glowing Emerald Reactive Wave */
              <div className="flex flex-col items-center gap-2.5 w-full max-w-sm mx-auto">
                <div className="w-full px-4 py-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                  <div className="text-center">
                    <span className="text-xs sm:text-sm font-bold font-sans tracking-tight text-emerald-200 block whitespace-nowrap">
                      Listening to your voice...
                    </span>
                    <span className="text-[10px] font-sans text-emerald-300/80 font-normal">
                      Speak naturally in Hindi, English, or Hinglish
                    </span>
                  </div>
                </div>

                {/* Real-Time Reactive Wave Chamber */}
                <div className="w-full flex flex-col items-center justify-center py-3 px-5 rounded-2xl bg-emerald-950/50 border border-emerald-500/35 shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                  <div className="flex items-center justify-center gap-1.5 h-14 w-full mb-2">
                    {audioLevels.map((val, idx) => (
                      <div
                        key={idx}
                        className="w-1.5 rounded-full bg-gradient-to-t from-emerald-600 via-emerald-400 to-teal-200 shadow-[0_0_10px_rgba(52,211,153,0.7)] transition-all duration-75"
                        style={{ height: `${Math.max(16, val)}%` }}
                      />
                    ))}
                  </div>

                  {/* Pulsing Mic Button inside Wave Chamber */}
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-14 w-14 rounded-full bg-emerald-400 opacity-35" />
                    <button
                      onClick={stopVoiceSession}
                      className="relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.7)] border-2 border-emerald-300 transition-all cursor-pointer"
                      title="Microphone is listening... Tap to pause"
                    >
                      <Mic className="h-6 w-6 text-slate-950 animate-bounce" />
                    </button>
                  </div>
                </div>

                {/* Live Speech Interim Bubble */}
                {liveInterim ? (
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-400/60 text-emerald-200 text-xs font-mono shadow-md animate-pulse max-w-full truncate">
                    🗣️ &ldquo;{liveInterim}...&rdquo;
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-300 font-medium text-center">
                    Speak your need now — e.g. &ldquo;Mujhe DSLR camera chahiye ₹500 me&rdquo;
                  </p>
                )}

                <button
                  onClick={stopVoiceSession}
                  className="text-[10px] font-mono text-slate-400 hover:text-red-400 underline transition-colors cursor-pointer"
                >
                  Tap mic or click here to stop
                </button>
              </div>
            ) : (
              /* Idle / Start Mic Button */
              <div className="flex flex-col items-center gap-2.5 w-full max-w-sm mx-auto">
                <div className="w-full flex flex-col items-center justify-center py-3 px-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  {/* Ambient Soundwave preview */}
                  <div className="flex items-center justify-center gap-1.5 h-12 w-full opacity-60 mb-2">
                    {[20, 35, 55, 75, 90, 100, 85, 65, 50, 50, 65, 85, 100, 90, 75, 55, 35, 20].map((val, idx) => (
                      <div
                        key={idx}
                        className="w-1.5 rounded-full bg-gradient-to-t from-emerald-600/70 via-emerald-400/80 to-teal-300/90 animate-pulse"
                        style={{
                          height: `${val}%`,
                          animationDelay: `${idx * 75}ms`,
                          animationDuration: "1.5s",
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={startVoiceSession}
                    disabled={isConnecting}
                    className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-900/50 border-2 border-emerald-400/50 active:scale-95 transition-all cursor-pointer"
                    title="Tap to start voice co-pilot"
                  >
                    {isConnecting ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Mic className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                </div>

                <span className="text-xs font-mono text-emerald-300 font-bold">
                  {isConnecting ? "Connecting microphone..." : "👆 Tap microphone to speak"}
                </span>
                <p className="text-[11px] text-slate-400 font-medium text-center">
                  Try: &ldquo;Mujhe ₹500 ke andar camera chahiye&rdquo; or &ldquo;Find books&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Quick Voice Suggestions */}
          {!isConnected && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-mono">
              <span className="text-slate-400 text-[10px] shrink-0">Try asking:</span>
              <button
                onClick={() => {
                  setTextInput("Find DSLR camera under ₹500 near campus");
                  setIsTypingMode(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#18201b] hover:bg-[#232f28] text-emerald-300 border border-[#2b3930] transition-colors cursor-pointer whitespace-nowrap"
              >
                📷 &ldquo;Camera under ₹500&rdquo;
              </button>
              <button
                onClick={() => {
                  setTextInput("Laptop for 2 days under ₹1000");
                  setIsTypingMode(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#18201b] hover:bg-[#232f28] text-emerald-300 border border-[#2b3930] transition-colors cursor-pointer whitespace-nowrap"
              >
                💻 &ldquo;Laptop under ₹1000&rdquo;
              </button>
              <button
                onClick={() => {
                  setTextInput("How does security deposit refund work?");
                  setIsTypingMode(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#18201b] hover:bg-[#232f28] text-emerald-300 border border-[#2b3930] transition-colors cursor-pointer whitespace-nowrap"
              >
                🔒 &ldquo;Deposit Refund&rdquo;
              </button>
            </div>
          )}
        </div>

        {/* Live Conversation Transcript */}
        <div
          style={{
            backgroundColor: "#111413",
          }}
          className="flex-1 p-4 overflow-y-auto space-y-3"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`flex gap-2 max-w-[85%] ${
                  m.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-xl flex items-center justify-center text-xs shrink-0 mt-1 ${
                    m.sender === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-[#1f2421] text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {m.sender === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div
                  className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    m.sender === "user"
                      ? "bg-emerald-600 text-white rounded-tr-none shadow-md"
                      : "bg-[#1a201c] border border-[#28332c] text-[#e0e6e2] rounded-tl-none shadow-inner"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* Interactive Screen Navigation Action Card */}
                  {m.matchedAction && (
                    <div className="mt-2.5 p-3 rounded-xl bg-[#0f1411] border border-emerald-500/30 flex items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-[11px] font-bold text-white leading-tight">
                            {m.matchedAction.title}
                          </p>
                          <p className="text-[9px] text-emerald-400/80 font-mono mt-0.5">
                            Verified campus lender • Escrow protected
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsOpen(false);
                          router.push(m.matchedAction!.url);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0 transition-all cursor-pointer"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  <span className="block text-[9px] font-mono text-slate-400 mt-1 text-right">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Switcher & Input Section */}
        <div
          style={{
            backgroundColor: "#0b0e0c",
            borderTop: "1px solid #1f2923",
            padding: "12px 16px",
          }}
          className="flex flex-col gap-2 shrink-0"
        >
          {isTypingMode ? (
            <form onSubmit={handleSendTextMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your need (e.g. 'DSLR camera ₹500')..."
                className="flex-1 bg-[#151a17] border border-[#2b3830] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Send
              </button>
            </form>
          ) : null}

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <button
              onClick={() => setIsTypingMode(!isTypingMode)}
              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <Keyboard className="h-3.5 w-3.5" />
              <span>{isTypingMode ? "Hide Keyboard" : "Type instead"}</span>
            </button>

            {isConnected ? (
              <button
                onClick={stopVoiceSession}
                className="text-red-400 hover:text-red-300 font-mono text-[11px] underline cursor-pointer"
              >
                Stop Voice Session
              </button>
            ) : (
              <span className="font-mono text-[10px] text-slate-500">
                Press Esc or click outside to close
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
