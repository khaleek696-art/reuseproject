"use client";

import { API_ROOT_URL } from "@/lib/api";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  MessageSquare,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export function AIChatDrawer() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "👋 **Welcome to RE:USE Chatbot powered by Groq Llama-3.3 AI!**\n\nAsk me anything! For example: *\"Find a laptop or camera near MIT campus\"* or *\"How does deposit refund work?\"*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  if (!mounted) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMsg;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg("");
    setIsLoading(true);

    try {
      // 1. Primary: Call Next.js API route /api/ai/chat (direct Groq Llama-3.3 API execution)
      let res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      // 2. Secondary fallback: Python FastAPI backend endpoint
      if (!res.ok) {
        res = await fetch(`${API_ROOT_URL}/api/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: query,
            history: messages.map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text,
            })),
          }),
        });
      }

      if (res.ok) {
        const data = await res.json();
        const aiReply = data.reply || data.response || "I am RE:USE AI. How can I assist your campus borrowing today?";
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("Failed to reach Groq API endpoint");
      }
    } catch (e: any) {
      console.warn("AI Chat API call fallback:", e);
      // Smart dynamic response generator fallback
      let reply = "🤖 **RE:USE Chatbot**\n\n";
      const q = query.toLowerCase();

      if (q.includes("laptop") || q.includes("macbook") || q.includes("computer")) {
        reply += "📍 **Available Laptop Near Campus:**\n" +
          "• **Apple MacBook Pro M2 (16GB RAM, 512GB SSD)** — ₹1,200/day (Deposit: ₹3,000)\n" +
          "• Owner: Vikram Shah (4.9 ⭐ PeerTrust) • *Symbiosis SB Road*\n" +
          "• Includes: Original Charger & Protective Sleeve.\n\n" +
          "💡 *Instant reservation available under Explore Gear!*";
      } else if (q.includes("camera") || q.includes("dslr") || q.includes("canon")) {
        reply += "📍 **Found Item Near MIT Library Lawn:**\n" +
          "• **Canon EOS 5D Mark IV Kit** — ₹850/day (Deposit: ₹1,500)\n" +
          "• Owner: Priya Patel (4.9 ⭐ PeerTrust)\n" +
          "• Includes: Dual batteries, 128GB card & lens.";
      } else if (q.includes("drill") || q.includes("tool") || q.includes("bosch")) {
        reply += "📍 **Found Item Near COEP Heritage Porch:**\n" +
          "• **Bosch Professional Impact Drill Kit** — ₹350/day (Deposit: ₹800)\n" +
          "• Owner: Devendra Patil (4.8 ⭐ PeerTrust)\n" +
          "• Includes: Masonry bits & auxiliary handle.";
      } else if (q.includes("deposit") || q.includes("escrow") || q.includes("refund")) {
        reply += "🔒 **Security Deposit Escrow Policy:**\n\n" +
          "1. Deposit is locked in **RE:USE Escrow Vault** via Razorpay during checkout.\n" +
          "2. Upon returning the item, owner verifies the 6-Digit Return OTP on `/bookings`.\n" +
          "3. Your deposit is **instantly refunded back** to your UPI account!";
      } else if (q.includes("hlo") || q.includes("hello") || q.includes("hi") || q.includes("hey")) {
        reply += "Hello there! 👋 I am RE:USE Chatbot. Tell me what equipment you need to borrow today (e.g. laptop, camera, projector, drill), or ask me about deposit refunds!";
      } else if (q.includes("how are u") || q.includes("how are you")) {
        reply += "I'm doing great and ready to help you find equipment nearby! What item are you looking for on campus today?";
      } else {
        reply += `I received your query: *"${query}"*\n\n` +
          "RE:USE Chatbot connects campus students with peer equipment (Cameras, Laptops, Calculators, Projectors, Power Tools) near MIT, COEP, FC Road, and Symbiosis campuses.\n\n" +
          "How can I assist your rental search today?";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <>
      {/* FLOATING BOT BUTTON STRICTLY IN RIGHT BOTTOM CORNER */}
      <button
        onClick={() => setIsOpen(true)}
        title="RE:USE Chatbot"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          top: "auto",
          left: "auto",
          zIndex: 999999,
        }}
        className="flex items-center gap-2 rounded-full bg-emerald-800 hover:bg-emerald-900 px-4 py-2.5 text-white shadow-2xl border-2 border-white/20 active:scale-95 transition-all cursor-pointer"
      >
        <div className="relative flex items-center justify-center">
          <Bot className="h-4 w-4 text-emerald-200" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
        </div>
        <span className="text-xs font-bold tracking-wide text-white">
          RE:USE Chatbot
        </span>
      </button>

      {/* DRAWER MODAL */}
      {isOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9999999 }}
          className="flex items-end sm:items-center justify-end sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full sm:w-[420px] h-[82vh] sm:h-[580px] rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">RE:USE Chatbot</h3>
                  <p className="text-[10px] text-emerald-400 font-medium mt-0.5">
                    Groq Llama-3.3 AI &bull; Always Online
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="bg-slate-50 p-2.5 border-b border-slate-200 flex gap-2 overflow-x-auto no-scrollbar text-xs">
              <button
                onClick={() => handleSendMessage("Find a DSLR camera under ₹1000 near MIT campus")}
                className="shrink-0 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors"
              >
                📷 DSLR Camera
              </button>
              <button
                onClick={() => handleSendMessage("I need a laptop for 2 days near Symbiosis")}
                className="shrink-0 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors"
              >
                💻 MacBook Laptop
              </button>
              <button
                onClick={() => handleSendMessage("How does security deposit refund work?")}
                className="shrink-0 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors"
              >
                🔒 Deposit Refund Info
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.sender === "ai" && (
                    <div className="h-7 w-7 rounded-xl bg-emerald-800 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-emerald-800 text-white font-medium rounded-tr-xs"
                        : "bg-white text-slate-900 border border-slate-200/90 shadow-2xs rounded-tl-xs whitespace-pre-wrap"
                    }`}
                  >
                    <div>{m.text}</div>
                    <span
                      className={`block text-[9px] mt-1.5 font-mono ${
                        m.sender === "user" ? "text-emerald-200 text-right" : "text-slate-400"
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>

                  {m.sender === "user" && (
                    <div className="h-7 w-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
                  <Sparkles className="h-4 w-4 text-emerald-600 animate-spin" />
                  <span>Groq Llama 3.3 generating reply...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputMsg.trim() || isLoading}
                  className="rounded-2xl bg-emerald-800 hover:bg-emerald-900 p-2.5 text-white shadow-xs disabled:opacity-40 active:scale-95 transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return createPortal(content, document.body);
}
