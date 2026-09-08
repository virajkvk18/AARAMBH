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
import { useLanguage } from "@/context/LanguageContext";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

const SUGGESTIONS_MAP: Record<string, string[]> = {
  en: [
    "I'm 19 years old, can I start a business?",
    "How do I apply for MIDC Land in Pune?",
    "What is the statutory SLA for MPCB Consent?",
    "How does Deemed Approval work under the RTS Act?",
    "What subsidies are offered in PSI 2019 scheme?",
  ],
  mr: [
    "माझे वय १९ वर्षे आहे, मी उद्योग सुरू करू शकतो का?",
    "पुणे चाकण MIDC मध्ये जमीन कशी मिळवावी?",
    "MPCB संमतीसाठी वैधानिक SLA दिवस किती आहेत?",
    "लोकसेवा हक्क कायद्यांतर्गत मानिव मंजुरी कशी मिळते?",
    "PSI २०१९ योजनेअंतर्गत कोणते अनुदान मिळते?",
  ],
  hi: [
    "मेरी आयु 19 वर्ष है, क्या मैं उद्योग शुरू कर सकता हूँ?",
    "पुणे चाकण MIDC में भूमि आवंटन के लिए कैसे आवेदन करें?",
    "MPCB प्रदूषण सहमति का वैधानिक SLA क्या है?",
    "RTS कानून के तहत डीम्ड अप्रूवल कैसे काम करता है?",
    "PSI 2019 योजना में कौन सी सब्सिडी उपलब्ध हैं?",
  ],
};

const WELCOME_MAP: Record<string, string> = {
  en: "Hi, I'm **AARAMBH** — your Maharashtra Single Window clearance assistant. Ask me about MIDC, MPCB, Fire NOC, DISH licensing, PSI 2019 incentives, or SLA timelines for your application.",
  mr: "नमस्कार! मी **आरंभ** — आपला महाराष्ट्र एक खिडकी परवाना सहाय्यक. मला MIDC जमीन, MPCB प्रदूषण परवाना, अग्निशमन NOC, DISH फॅक्टरी परवाना, PSI २०१९ सबसिडी किंवा SLA मुदतीबद्दल विचारा.",
  hi: "नमस्ते! मैं **आरंभ** — आपका महाराष्ट्र सिंगल विंडो क्लीयरेंस सहायक। मुझसे MIDC भूमि, MPCB सहमति, फायर NOC, DISH फैक्ट्री लाइसेंस, PSI 2019 सब्सिडी या SLA समयसीमा के बारे में पूछें।",
};

export default function AskAarambhChatbot() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: WELCOME_MAP[language] || WELCOME_MAP.en,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update greeting when language switches if no user chat history yet
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: "welcome-msg",
            role: "assistant",
            content: WELCOME_MAP[language] || WELCOME_MAP.en,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ];
      }
      return prev;
    });
  }, [language]);

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
      const history = [...messages, userMessage]
        .filter((m) => !m.id.startsWith("err-"))
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const savedKey = typeof window !== "undefined" ? localStorage.getItem("aarambh_groq_api_key") : null;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          userApiKey: savedKey || undefined,
          language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch response from AARAMBH advisory service");
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.content || (language === "mr" ? "सध्या आपल्या विनंतीवर प्रक्रिया करता आली नाही. कृपया पुन्हा प्रयत्न करा किंवा १८००-१२०-८०४० वर संपर्क साधा." : language === "hi" ? "वर्तमान में आपके अनुरोध को संसाधित नहीं किया जा सका। कृपया पुनः प्रयास करें या 1800-120-8040 पर संपर्क करें।" : "I couldn't process your request right now. Please try again or contact the Investor Helpline at 1800-120-8040."),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: unknown) {
      console.error("Chat error:", err);
      const errorFallback =
        language === "mr"
          ? "या क्षणी आपल्या विनंतीवर प्रक्रिया करण्यात अडचण येत आहे. कृपया पुन्हा विचारून पहा किंवा १८००-१२०-८०४० वर संपर्क साधा."
          : language === "hi"
          ? "इस समय आपके अनुरोध को संसाधित करने में असमर्थ। कृपया पुनः प्रयास करें या 1800-120-8040 पर संपर्क करें।"
          : "Unable to process your request at this moment. Please try asking again or contact the Single Window Investor Helpline at 1800-120-8040.";

      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: (err instanceof Error ? err.message : errorFallback),
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
    setMessages([
      {
        id: "welcome-msg",
        role: "assistant",
        content: WELCOME_MAP[language] || WELCOME_MAP.en,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
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
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center space-x-2.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#82213B] hover:to-[#E85E3E] text-white shadow-xl shadow-[#9B2A48]/30 border border-[#FED17A]/40 hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            {/* Logo Container */}
            <div className="relative flex items-center justify-center">
              <img src="/aarambh-logo-new.png" alt="AARAMBH Logo" className="w-7 h-7 object-contain" />
              <span className="w-2 h-2 rounded-full bg-[#FFCA7C] absolute -top-0.5 -right-0.5 animate-ping opacity-75"></span>
            </div>

            <div className="flex items-center space-x-1.5 pr-1">
              <span className="text-xs font-bold tracking-wide text-white">
                Ask AARAMBH
              </span>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-[#FFF2DF] border border-white/30 uppercase tracking-wider">
                AI
              </span>
            </div>
          </button>
        </div>
      )}

      {/* 2. Interactive Chat Window */}
      {isOpen && (
        <div
          className={`fixed right-3 sm:right-5 bottom-5 z-50 w-[88vw] sm:w-[370px] bg-white rounded-2xl shadow-2xl border border-[#F0E5E0] overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in zoom-in-95 ${
            isMinimized ? "h-14" : "h-[520px] max-h-[80vh]"
          }`}
        >
          {/* Header */}
          <div className="bg-[#16060E] text-white px-4 py-3 flex items-center justify-between border-b border-[#36101E] shrink-0">
            <div className="flex items-center space-x-2.5">
              {/* Logo */}
              <div className="w-8 h-8 rounded-lg bg-[#250C19] border border-[#521C35] text-black flex items-center justify-center shadow-xs">
                <img src="/aarambh-logo-new.png" alt="AARAMBH Logo" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-xs font-black text-white tracking-wide">
                    AARAMBH
                  </h3>
                  <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-[#FE7251]/20 text-[#FFCA7C] border border-[#FE7251]/30">
                    Govt. AI
                  </span>
                </div>
                <p className="text-[9px] text-[#C4A89C]">
                  Single Window Clearance Assistant
                </p>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center space-x-0.5">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset Conversation"
                className="p-1.5 rounded-lg text-[#C4A89C] hover:text-white hover:bg-[#250C19] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Maximize" : "Minimize"}
                className="p-1.5 rounded-lg text-[#C4A89C] hover:text-white hover:bg-[#250C19] transition-colors cursor-pointer"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1.5 rounded-lg text-[#C4A89C] hover:text-[#FE7251] hover:bg-[#250C19] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Body */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#FCFAF8]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white"
                          : "bg-[#16060E] text-[#FFCA7C] border border-[#36101E]"
                      }`}
                    >
                      {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[85%] rounded-xl p-3 text-xs shadow-xs ${
                        msg.role === "user"
                          ? "bg-[#9B2A48] text-white rounded-tr-none"
                          : "bg-white text-slate-800 border border-[#F0E5E0] rounded-tl-none"
                      }`}
                    >
                      <div className="space-y-1">
                        {renderMessageContent(msg.content)}
                      </div>
                      <span
                        className={`text-[9px] mt-1 block text-right ${
                          msg.role === "user" ? "text-rose-200" : "text-slate-400"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {loading && (
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#16060E] text-[#FFCA7C] border border-[#36101E] flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-white border border-[#F0E5E0] rounded-xl rounded-tl-none p-2.5 shadow-xs flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FE7251] animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FE7251] animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FE7251] animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-[10px] text-slate-500 font-medium ml-1">
                        {language === "mr" ? "आरंभ वैधानिक नियमावली तपासत आहे..." : language === "hi" ? "आरंभ वैधानिक रिकॉर्ड की जांच कर रहा है..." : "AARAMBH is consulting statutory records..."}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips (Visible when only initial greeting exists) */}
              {messages.length <= 1 && (
                <div className="px-3 py-2 bg-[#FFF7F0] border-t border-[#F0E5E0] flex flex-nowrap overflow-x-auto gap-1 shrink-0 scrollbar-none">
                  {(SUGGESTIONS_MAP[language] || SUGGESTIONS_MAP.en).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSendMessage(suggestion)}
                      className="px-2 py-1 rounded-md bg-white border border-[#FED17A] hover:border-[#FE7251] hover:text-[#9B2A48] text-slate-700 text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Footer */}
              <div className="p-2.5 bg-white border-t border-[#F0E5E0] shrink-0">
                <div className="flex items-end gap-1.5">
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("chat.placeholder", "Ask about clearances, MIDC zones, PSI subsidies, or SLAs...")}
                    className="flex-1 max-h-20 min-h-[36px] px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:border-[#FE7251] focus:ring-1 focus:ring-[#FE7251] focus:outline-none resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim() || loading}
                    className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#82213B] hover:to-[#E85E3E] text-white flex items-center justify-center shrink-0 shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[8px] text-slate-400 px-0.5">
                  <span>{t("topbar.portal_title", "Single Window Clearance Portal")}</span>
                  <span>{language === "mr" ? "महाराष्ट्र शासन" : language === "hi" ? "महाराष्ट्र सरकार" : "Govt. of Maharashtra"}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
