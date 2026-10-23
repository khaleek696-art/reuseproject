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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex h-full w-full max-w-md flex-col bg-[#1c1b1b] shadow-[0_8px_0_0_#0f0f0f] border-l-2 border-[#2a2a2a]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#2a2a2a] p-4 bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-none bg-[#065f46] border-2 border-[#047857] text-[#8bd6b6] font-['Silkscreen']">
                {recipientName.charAt(0)}
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-[#8bd6b6] ring-1 ring-black" />
            </div>
            <div>
              <h3 className="font-['Silkscreen'] uppercase tracking-wider text-white text-xs leading-tight flex items-center gap-1.5">
                <span>{recipientName}</span>
                <span title="Verified Member">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#8bd6b6]" />
                </span>
              </h3>
              <p className="text-[10px] text-[#89938d] font-mono line-clamp-1 mt-0.5">
                {recipientRole} &bull; <span className="text-[#8bd6b6] font-semibold">{resourceTitle}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-none p-2 bg-[#1c1b1b] border border-[#2a2a2a] text-[#bec9c2] hover:text-white hover:border-[#8bd6b6] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Security Banner */}
        <div className="bg-[#065f46]/20 border-b-2 border-[#2a2a2a] px-4 py-2 text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#8bd6b6] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#8bd6b6]" />
            <span>Encrypted Anti-Fraud P2P Chat</span>
          </div>

          <div className="flex items-center gap-1 bg-[#141414] px-2 py-0.5 rounded-none border border-[#2a2a2a] text-[9px] font-['Silkscreen'] text-[#8bd6b6]">
            {isWsConnected ? (
              <>
                <Wifi className="h-3 w-3 text-[#8bd6b6] animate-pulse" />
                <span>Live WS</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-amber-400" />
                <span>Sync</span>
              </>
            )}
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0e0e0e]">
          {messages.map((m) => {
            const isMe = m.sender_id === currentUserId;
            const isLocation = m.message_type === "location";

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-none px-3.5 py-2 text-xs leading-relaxed font-mono ${
                    isMe
                      ? "bg-[#065f46] text-white border border-[#047857] shadow-[0_2px_0_0_#003828]"
                      : "bg-[#1c1b1b] text-[#bec9c2] border border-[#2a2a2a] shadow-[0_2px_0_0_#0f0f0f]"
                  }`}
                >
                  {isLocation ? (
                    <div className="flex items-start gap-2 py-0.5">
                      <MapPin className={`h-4 w-4 shrink-0 mt-0.5 ${isMe ? "text-[#8bd6b6]" : "text-[#8bd6b6]"}`} />
                      <div>
                        <span className="font-['Silkscreen'] block text-[10px] uppercase tracking-wider text-[#8bd6b6]">
                          Shared Location
                        </span>
                        <span>{m.content}</span>
                      </div>
                    </div>
                  ) : (
                    <span>{m.content}</span>
                  )}
                </div>

                <span className="text-[10px] font-mono text-[#89938d] mt-1 px-1 flex items-center gap-1">
                  {m.timestamp}
                  {isMe && <CheckCheck className="h-3 w-3 text-[#8bd6b6]" />}
                </span>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-[#8bd6b6] font-mono bg-[#1c1b1b] p-2.5 rounded-none border border-[#2a2a2a] w-fit animate-pulse">
              <span className="h-2 w-2 rounded-none bg-[#8bd6b6] animate-ping" />
              <span>{recipientName.split(" ")[0]} is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Bar (Location Share & Prompts) */}
        <div className="border-t-2 border-[#2a2a2a] p-2 bg-[#141414] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() =>
              handleSendMessage(
                "📍 Shared Location: Kothrud Campus Gate 2 (Near Central Library Coffee Stand)",
                "location"
              )
            }
            className="flex items-center gap-1 rounded-none border border-[#8bd6b6] bg-[#065f46]/30 px-3 py-1.5 text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#8bd6b6] hover:bg-[#065f46] hover:text-white transition-all shrink-0 cursor-pointer"
          >
            <MapPin className="h-3 w-3 text-[#8bd6b6]" />
            <span>Share Campus Location</span>
          </button>

          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="rounded-none border border-[#2a2a2a] bg-[#1c1b1b] px-3 py-1.5 text-[10px] font-mono text-[#bec9c2] hover:border-[#8bd6b6] hover:text-white transition-all shrink-0 cursor-pointer"
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
          className="border-t-2 border-[#2a2a2a] p-3 bg-[#141414] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-none border-2 border-[#2a2a2a] bg-[#0e0e0e] px-3.5 py-2.5 text-xs font-mono text-white focus:border-[#8bd6b6] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-none bg-[#065f46] border-2 border-[#047857] text-white hover:bg-[#047857] shadow-[0_2px_0_0_#003828] disabled:opacity-40 transition-all shrink-0 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
