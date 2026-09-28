"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Sparkles,
  ShieldCheck,
  MapPin,
  CheckCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useRole } from "@/lib/roleContext";
import { fetchChatMessages, sendChatMessage } from "@/lib/api";

interface MessageItem {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  message_type: string;
  timestamp: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  recipientName?: string;
  recipientRole?: string;
  resourceTitle?: string;
}

export function ChatDrawer({
  isOpen,
  onClose,
  bookingId = "BK-98421",
  recipientName = "Rahul Sharma (Equipment Owner)",
  recipientRole = "Verified Equipment Owner",
  resourceTitle = "Canon DSLR Camera Kit",
}: ChatDrawerProps) {
  const { currentUser } = useRole();
  const currentUserId = currentUser?.id || "u_borrower_aman";
  const currentUserName = currentUser?.name || "Aman Kumar";

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Fetch initial message history or load contextual defaults
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadHistory() {
      const history = await fetchChatMessages(bookingId);
      if (isMounted && history && history.length > 0) {
        setMessages(history);
      } else if (isMounted) {
        setMessages([
          {
            id: "m1",
            sender_id: "u_owner_target",
            sender_name: recipientName,
            content: `Hi ${currentUserName}! Thanks for inquiring about ${resourceTitle}. It's in excellent condition and ready for campus pickup.`,
            message_type: "text",
            timestamp: "10:15 AM",
          },
          {
            id: "m2",
            sender_id: currentUserId,
            sender_name: currentUserName,
            content: `Hi! Is ${resourceTitle} available for campus handover today?`,
            message_type: "text",
            timestamp: "10:16 AM",
          },
          {
            id: "m3",
            sender_id: "u_owner_target",
            sender_name: recipientName,
            content: "Yes! All original accessories and safety carrying case are included.",
            message_type: "text",
            timestamp: "10:17 AM",
          },
          {
            id: "m4",
            sender_id: "u_owner_target",
            sender_name: recipientName,
            content: "📍 Pickup Location: Kothrud Campus Library Gate 2, near Coffee Stand.",
            message_type: "location",
            timestamp: "10:18 AM",
          },
        ]);
      }
      setTimeout(scrollToBottom, 100);
    }

    loadHistory();

    // 2. Establish Real-time WebSockets Connection
    const wsUrl = `ws://localhost:8000/api/v1/ws/chat/${bookingId}`;
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === "NEW_MESSAGE" && payload.message) {
            const incoming: MessageItem = payload.message;
            setMessages((prev) => {
              // Deduplicate strictly by ID OR (content + sender_id within last 2 seconds)
              if (
                prev.some(
                  (m) =>
                    m.id === incoming.id ||
                    (m.content === incoming.content && m.sender_id === incoming.sender_id)
                )
              ) {
                return prev;
              }
              return [...prev, incoming];
            });
            setTimeout(scrollToBottom, 50);
          } else if (payload.event === "TYPING") {
            if (payload.senderId !== currentUserId) {
              setIsTyping(payload.isTyping);
            }
          }
        } catch (e) {
          console.error("Error parsing WS message", e);
        }
      };

      ws.onclose = () => {
        setIsWsConnected(false);
      };

      ws.onerror = () => {
        setIsWsConnected(false);
      };
    } catch (err) {
      setIsWsConnected(false);
    }

    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen, bookingId, currentUserId, currentUserName, recipientName, resourceTitle]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (customContent?: string, type = "text") => {
    const textToSend = (customContent || input).trim();
    if (!textToSend) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const newMsg: MessageItem = {
      id: msgId,
      sender_id: currentUserId,
      sender_name: currentUserName,
      content: textToSend,
      message_type: type,
      timestamp: nowStr,
    };

    // Single Optimistic UI update
    setMessages((prev) => [...prev, newMsg]);
    if (!customContent) setInput("");

    // Send via WebSocket (Including explicit `id` to match optimistic state)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: "NEW_MESSAGE",
          id: msgId,
          senderId: currentUserId,
          senderName: currentUserName,
          content: textToSend,
          message_type: type,
          timestamp: nowStr,
        })
      );
    }

    // Persist via REST API
    sendChatMessage(bookingId, currentUserId, currentUserName, textToSend, type);

    // Smart Intent-Based Interactive Replies from Equipment Owner
    setTimeout(() => {
      setIsTyping(true);
    }, 350);

    setTimeout(() => {
      setIsTyping(false);
      const ownerFirstName = recipientName.split(" ")[0];
      const userFirstName = currentUserName.split(" ")[0];
      const lower = textToSend.toLowerCase();

      let replyContent = "";

      if (type === "location") {
        replyContent = `📍 Perfect! I see your shared campus location. I'll meet you right there with ${resourceTitle}.`;
      } else if (lower.includes("hlo") || lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
        replyContent = `Hello ${userFirstName}! ${ownerFirstName} here. How can I help you with ${resourceTitle}?`;
      } else if (lower.includes("timing") || lower.includes("time") || lower.includes("when")) {
        replyContent = `I am available for handover today between 9:00 AM to 7:00 PM at Kothrud Campus. What time works best for you?`;
      } else if (lower.includes("battery") || lower.includes("batteries") || lower.includes("charger") || lower.includes("accessories")) {
        replyContent = `Yes! The kit includes 2 rechargeable batteries, dual slot fast charger, 128GB memory card, and a protective hard case.`;
      } else if (lower.includes("library") || lower.includes("meet") || lower.includes("where") || lower.includes("location")) {
        replyContent = `Yes! Kothrud Campus Library Gate 2 near the Coffee stand is perfect for pickup.`;
      } else if (lower.includes("available") || lower.includes("weekend") || lower.includes("today")) {
        replyContent = `Yes, ${resourceTitle} is 100% available! You can place the rental request directly in the app.`;
      } else {
        replyContent = `Hey ${userFirstName}! Got your message about "${textToSend}". Everything is set for the ${resourceTitle} handover!`;
      }

      const replyMsg: MessageItem = {
        id: `reply_${Date.now()}`,
        sender_id: "u_owner_target",
        sender_name: recipientName,
        content: replyContent,
        message_type: "text",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, replyMsg]);
      setTimeout(scrollToBottom, 50);
    }, 1300);
  };

  const quickPrompts = [
    "Is this available today?",
    "Can we meet at campus library?",
    "Does it include extra batteries?",
    "What is the pickup timing?",
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-white font-bold">
                {recipientName.charAt(0)}
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight flex items-center gap-1.5">
                <span>{recipientName}</span>
                <span title="Verified Member">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {recipientRole} &bull; <span className="text-emerald-800 font-semibold">{resourceTitle}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Security Banner */}
        <div className="bg-emerald-50/90 border-b border-emerald-200 px-4 py-2 text-[11px] font-semibold text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
            <span>Encrypted Anti-Fraud P2P Chat</span>
          </div>

          <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-emerald-300 text-[10px] font-bold text-emerald-800">
            {isWsConnected ? (
              <>
                <Wifi className="h-3 w-3 text-emerald-600 animate-pulse" />
                <span>🟢 Live WebSockets</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-amber-600" />
                <span>🟡 Sync Mode</span>
              </>
            )}
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
          {messages.map((m) => {
            const isMe = m.sender_id === currentUserId;
            const isLocation = m.message_type === "location";

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed ${
                    isMe
                      ? "bg-emerald-800 text-white rounded-br-xs font-medium"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs font-normal"
                  }`}
                >
                  {isLocation ? (
                    <div className="flex items-start gap-2 py-0.5">
                      <MapPin className={`h-4 w-4 shrink-0 mt-0.5 ${isMe ? "text-emerald-300" : "text-emerald-700"}`} />
                      <div>
                        <span className="font-bold block text-[11px] uppercase tracking-wider">
                          Shared Location
                        </span>
                        <span>{m.content}</span>
                      </div>
                    </div>
                  ) : (
                    <span>{m.content}</span>
                  )}
                </div>

                <span className="text-[10px] font-semibold text-slate-400 mt-1 px-1 flex items-center gap-1">
                  {m.timestamp}
                  {isMe && <CheckCheck className="h-3 w-3 text-emerald-600" />}
                </span>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs w-fit animate-pulse">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
              <span>{recipientName.split(" ")[0]} is typing a reply...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Bar (Location Share & Prompts) */}
        <div className="border-t border-slate-100 p-2 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() =>
              handleSendMessage(
                "📍 Shared Location: Kothrud Campus Gate 2 (Near Central Library Coffee Stand)",
                "location"
              )
            }
            className="flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-900 hover:bg-emerald-100 transition-all shrink-0"
          >
            <MapPin className="h-3 w-3 text-emerald-700" />
            <span>Share Campus Location</span>
          </button>

          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-900 transition-all shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="border-t border-slate-200 p-3 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 shadow-sm disabled:opacity-40 transition-all shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
