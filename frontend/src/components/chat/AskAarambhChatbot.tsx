"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Minimize2,
  Maximize2,
  RefreshCw,
  Building2,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

const INITIAL_SUGGESTIONS = [
  "I'm 19 years old, can I start a business?",
  "How do I apply for MIDC Land in Pune?",
  "What is the statutory SLA for MPCB Consent?",
  "How does Deemed Approval work under the RTS Act?",
  "What subsidies are offered in PSI 2019 scheme?",
];

const INITIAL_GREETING: Message = {
  id: "welcome-msg",
  role: "assistant",
  content:
    "Hi, I'm **AARAMBH** — your Maharashtra Single Window clearance assistant. Ask me about MIDC, MPCB, Fire NOC, DISH licensing, PSI 2019 incentives, or SLA timelines for your application.",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

export default function AskAarambhChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch response");
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.content || "I couldn't process your request right now. Please try again or contact the Investor Helpline at 1800-120-8040.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: unknown) {
      console.error("Chat error:", err);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Unable to process your request at this moment. Please try asking again or contact the Single Window Investor Helpline at **1800-120-8040**.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_GREETING]);
  };

  // Render clean formatting (headers, bold, lists)
  const renderMessageContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // Header formatters
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="font-bold text-slate-900 text-xs mt-2 mb-1">
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={idx} className="font-black text-slate-900 text-sm mt-2 mb-1">
            {line.replace("## ", "")}
          </h3>
        );
      }
      if (line.startsWith("---")) {
        return <hr key={idx} className="my-2 border-slate-200" />;
      }

      // Bold & Italic formatter
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-bold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return (
            <em key={pIdx} className="italic text-slate-700">
              {part.slice(1, -1)}
            </em>
          );
        }
        return part;
      });

      if (line.startsWith("• ") || line.startsWith("- ")) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs leading-relaxed my-0.5">
            {formattedLine}
          </li>
        );
      }

      if (line.trim() === "") {
        return <div key={idx} className="h-1.5"></div>;
      }

      return (
        <p key={idx} className="text-xs leading-relaxed my-0.5">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <>
      {/* 1. Floating Trigger Pill (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center space-x-3 px-5 py-3 rounded-full bg-[#0B1728] hover:bg-[#0E2038] text-white shadow-2xl border-2 border-amber-400/80 hover:border-amber-400 hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            {/* Pulse icon */}
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#00A859] flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 animate-ping"></span>
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black tracking-wider text-white">
                  AARAMBH
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  Online
                </span>
              </div>
              <span className="text-[10px] text-slate-300">
                Single Window Clearance Assistant
              </span>
            </div>
          </button>
        </div>
      )}

      {/* 2. Interactive Chat Window */}
      {isOpen && (
        <div
          className={`fixed right-4 sm:right-6 bottom-6 z-50 w-[92vw] sm:w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in zoom-in-95 ${
            isMinimized ? "h-16" : "h-[620px] max-h-[88vh]"
          }`}
        >
          {/* Header */}
          <div className="bg-[#0B1728] bg-topo-pattern text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-700 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#00A859] text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-black text-white tracking-wide">
                    AARAMBH
                  </h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Live Assistant
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Govt. of Maharashtra Single Window Portal
                </p>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset Conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Maximize" : "Minimize"}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                        msg.role === "user"
                          ? "bg-[#0B1728] text-white"
                          : "bg-[#00A859] text-white"
                      }`}
                    >
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs ${
                        msg.role === "user"
                          ? "bg-[#0B1728] text-white rounded-tr-none"
                          : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                      }`}
                    >
                      <div className="space-y-1">
                        {renderMessageContent(msg.content)}
                      </div>
                      <span
                        className={`text-[9px] mt-1.5 block text-right ${
                          msg.role === "user" ? "text-slate-400" : "text-slate-400"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {loading && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-[#00A859] text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-xs flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00A859] animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-[#00A859] animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 rounded-full bg-[#00A859] animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-[11px] text-slate-500 font-medium ml-1">
                        AARAMBH is consulting statutory records...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips (Visible when only initial greeting exists) */}
              {messages.length <= 1 && (
                <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 flex flex-nowrap overflow-x-auto gap-1.5 shrink-0 scrollbar-none">
                  {INITIAL_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSendMessage(suggestion)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:text-[#00A859] text-slate-700 text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Footer */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                <div className="flex items-end gap-2">
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about age eligibility, MIDC, MPCB CTE, Fire NOC..."
                    className="flex-1 max-h-24 min-h-[40px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:border-[#00A859] focus:ring-1 focus:ring-[#00A859] focus:outline-none resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim() || loading}
                    className="w-10 h-10 rounded-xl bg-[#00A859] hover:bg-[#008F4C] text-white flex items-center justify-center shrink-0 shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400 px-1">
                  <span>Single Window Clearance Portal</span>
                  <span>Govt. of Maharashtra</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
