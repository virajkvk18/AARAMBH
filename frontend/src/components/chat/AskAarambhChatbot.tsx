"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Utensils,
  Store,
  Factory,
  Flame,
  ArrowRight,
  Compass,
  FileText,
  ExternalLink,
  Layers,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  userQueryContext?: string;
}

interface ActionItem {
  url: string;
  title: string;
  subtitle?: string;
}

const DASHBOARD_SUGGESTIONS_MAP: Record<string, string[]> = {
  en: [
    "I'm starting a fast food restaurant business",
    "What approvals do I need for my industry?",
    "How to set up an EV manufacturing unit?",
    "Am I eligible for PSI 2019 incentives?",
    "How do I apply for MIDC land allotment?",
    "Explain MPCB CTE vs CTO requirements",
  ],
  mr: [
    "मी फास्ट फूड / रेस्टॉरंट व्यवसाय सुरू करत आहे",
    "माझ्या उद्योगासाठी कोणते परवाने आवश्यक आहेत?",
    "महाराष्ट्रात ईव्ही उत्पादन प्रकल्प कसा सुरू करावा?",
    "मी PSI २०१९ अनुदानासाठी पात्र आहे का?",
    "MIDC जमीन आणि इमारत परवानगी कशी मिळवावी?",
    "MPCB संमतीसाठी वैधानिक SLA दिवस किती आहेत?",
  ],
  hi: [
    "मैं एक फास्ट फूड / रेस्टोरेंट व्यवसाय शुरू कर रहा हूँ",
    "मेरे उद्योग के लिए कौन से अनुमोदन आवश्यक हैं?",
    "महाराष्ट्र में ईवी विनिर्माण संयंत्र कैसे स्थापित करें?",
    "क्या मैं PSI 2019 सब्सिडी के लिए पात्र हूँ?",
    "MIDC भूमि और भवन निर्माण स्वीकृति के लिए कैसे आवेदन करें?",
    "MPCB प्रदूषण सहमति का वैधानिक SLA क्या है?",
  ],
};

const LANDING_SUGGESTIONS_MAP: Record<string, string[]> = {
  en: [
    "What is AARAMBH Single Window Portal?",
    "What are the benefits under PSI 2019?",
    "How does Maharashtra EV Policy 2021 work?",
    "What is Deemed Approval under RTS Act 2015?",
    "Explain MPCB CTE vs CTO approvals",
    "How does the Investor Grievance mechanism work?",
  ],
  mr: [
    "आरंभ एक खिडकी पोर्टल काय आहे?",
    "PSI २०१९ अंतर्गत कोणते फायदे मिळतात?",
    "महाराष्ट्र ईव्ही धोरण २०२१ कसे कार्य करते?",
    "RTS कायदा २०१५ अंतर्गत डीम्ड मंजुरी काय आहे?",
    "MPCB संमती आणि परवानग्यांची माहिती द्या",
    "गुंतवणूकदार तक्रार निवारण कसे कार्य करते?",
  ],
  hi: [
    "आरंभ सिंगल विंडो पोर्टल क्या है?",
    "PSI 2019 के तहत क्या लाभ मिलते हैं?",
    "महाराष्ट्र ईवी नीति 2021 कैसे काम करती है?",
    "RTS अधिनियम 2015 के तहत डीम्ड अनुमोदन क्या है?",
    "MPCB सहमति और अनुमोदन की जानकारी दें",
    "निवेशक शिकायत निवारण कैसे काम करता है?",
  ],
};

const DASHBOARD_WELCOME_MAP: Record<string, string> = {
  en: "Hi, I'm **AARAMBH** — your Maharashtra Single Window clearance assistant. Ask me about starting any business (like restaurants, EV, factories, warehouses), clearances (FSSAI, MIDC, MPCB, Fire NOC, DISH), or direct application approvals!",
  mr: "नमस्कार! मी **आरंभ** — आपला महाराष्ट्र एक खिडकी परवाना सहाय्यक. मला कोणत्याही व्यवसायाची सुरुवात (उदा. रेस्टॉरंट, ईव्ही, फॅक्टरी, वेअरहाऊस), थेट परवाने अर्ज किंवा सबसिडीबद्दल विचारा!",
  hi: "नमस्ते! मैं **आरंभ** — आपका महाराष्ट्र सिंगल विंडो क्लीयरेंस सहायक। मुझसे कोई भी व्यवसाय शुरू करने (जैसे रेस्टोरेंट, ईवी, फैक्ट्री, गोदाम), सीधे आवेदन अनुमोदन या सब्सिडी के बारे में पूछें!",
};

const LANDING_WELCOME_MAP: Record<string, string> = {
  en: "Hi, I'm **AARAMBH** — your Maharashtra Single Window clearance assistant. Ask me about industrial policies (PSI 2019, EV 2021, Logistics 2024), statutory clearances, MIDC zones, or RTS Act deemed approval timelines.",
  mr: "नमस्कार! मी **आरंभ** — आपला महाराष्ट्र एक खिडकी परवाना सहाय्यक. मला औद्योगिक धोरणे (PSI २०१९, ईव्ही २०२१, लॉजिस्टिक २०२४), विविध परवाने, MIDC झोन किंवा RTS कायद्याबद्दल विचारा.",
  hi: "नमस्ते! मैं **आरंभ** — आपका महाराष्ट्र सिंगल विंडो क्लीयरेंस सहायक। मुझसे औद्योगिक नीतियों (PSI 2019, ईवी 2021, लॉजिस्टिक्स 2024), अनुमोदनों, MIDC क्षेत्रों या RTS अधिनियम के बारे में पूछें।",
};

function extractActionItems(
  content: string,
  userQuery?: string,
  enableActions: boolean = true
): { cleanContent: string; actions: ActionItem[] } {
  const actions: ActionItem[] = [];
  const actionRegex = /\[action:([^|\]]+)\|([^|\]]+)(?:\|([^\]]*))?\]/g;

  if (enableActions) {
    let match;
    while ((match = actionRegex.exec(content)) !== null) {
      const url = match[1]?.trim();
      const title = match[2]?.trim();
      const subtitle = match[3]?.trim();
      if (url && title && !actions.some((a) => a.url === url)) {
        actions.push({ url, title, subtitle });
      }
    }
  }

  // Clean out any [action:...] tags from the message text so it renders as clean prose
  const cleanContent = content.replace(actionRegex, "").trim();

  // If actions are disabled (landing page), return clean text with zero action buttons
  if (!enableActions) {
    return { cleanContent, actions: [] };
  }

  // Intelligent heuristic fallback only when enableActions is true (dashboard context)
  if (actions.length === 0) {
    const combinedText = `${userQuery || ""} ${content}`.toLowerCase();

    // Food / Restaurant / Cafe / Bakery / Cloud Kitchen / Fast Food
    if (
      combinedText.includes("restaurant") ||
      combinedText.includes("food") ||
      combinedText.includes("fast food") ||
      combinedText.includes("cafe") ||
      combinedText.includes("hotel") ||
      combinedText.includes("kitchen") ||
      combinedText.includes("bakery") ||
      combinedText.includes("eating house") ||
      combinedText.includes("catering") ||
      combinedText.includes("qsr") ||
      combinedText.includes("eatery") ||
      combinedText.includes("रेस्टॉरंट") ||
      combinedText.includes("खाद्य") ||
      combinedText.includes("हॉटेल") ||
      combinedText.includes("रेस्टोरेंट") ||
      combinedText.includes("भोजनालय")
    ) {
      actions.push(
        {
          url: "/apply/fssai-food-license",
          title: "Apply for FSSAI Food Business License",
          subtitle: "FDA Maharashtra • 14 Days Statutory SLA",
        },
        {
          url: "/apply/gumasta-license",
          title: "Apply for Gumasta Shop Act Registration",
          subtitle: "Labour Department • 7 Days Statutory SLA",
        },
        {
          url: "/apply/fire-safety-noc",
          title: "Apply for Fire Safety NOC",
          subtitle: "Directorate of Fire Services • 10 Days SLA",
        },
        {
          url: "/dashboard/kya",
          title: "Run Restaurant KYA Checklist",
          subtitle: "Know Your Approvals Statutory Roadmap",
        }
      );
    }
    // EV / Battery / Clean Energy
    else if (
      combinedText.includes("electric vehicle") ||
      combinedText.includes("ev ") ||
      combinedText.includes("battery") ||
      combinedText.includes("charging station") ||
      combinedText.includes("solar") ||
      combinedText.includes("ईव्ही")
    ) {
      actions.push(
        {
          url: "/apply/mpcb-consent",
          title: "Apply for MPCB Consent to Establish (CTE)",
          subtitle: "MPCB • 21 Days Statutory SLA",
        },
        {
          url: "/apply/dish-factory-license",
          title: "Apply for DISH Factory License",
          subtitle: "DISH Maharashtra • 15 Days SLA",
        },
        {
          url: "/dashboard/kya",
          title: "Check EV Policy 2021 Subsidies",
          subtitle: "Package Scheme of Incentives (D+ Mega Status)",
        }
      );
    }
    // Manufacturing / Factory / Industrial / Engineering / Chemical / Pharma
    else if (
      combinedText.includes("factory") ||
      combinedText.includes("manufacturing") ||
      combinedText.includes("industry") ||
      combinedText.includes("plant") ||
      combinedText.includes("chemical") ||
      combinedText.includes("pharma") ||
      combinedText.includes("textile") ||
      combinedText.includes("engineering") ||
      combinedText.includes("कारखाना") ||
      combinedText.includes("उत्पादन") ||
      combinedText.includes("फैक्ट्री")
    ) {
      actions.push(
        {
          url: "/apply/dish-factory-license",
          title: "Apply for DISH Factory License",
          subtitle: "DISH Maharashtra • 15 Days SLA",
        },
        {
          url: "/apply/mpcb-consent",
          title: "Apply for MPCB Consent to Establish",
          subtitle: "MPCB • 21 Days Statutory SLA",
        },
        {
          url: "/apply/midc-land-allotment",
          title: "Apply for MIDC Land Allotment",
          subtitle: "MIDC • 15 Days SLA",
        },
        {
          url: "/apply/fire-safety-noc",
          title: "Apply for Fire Safety NOC",
          subtitle: "Directorate of Fire Services • 10 Days SLA",
        }
      );
    }
    // Warehouse / Logistics Hub
    else if (
      combinedText.includes("warehouse") ||
      combinedText.includes("logistics") ||
      combinedText.includes("godown") ||
      combinedText.includes("storage park") ||
      combinedText.includes("वेअरहाऊस") ||
      combinedText.includes("गोदाम")
    ) {
      actions.push(
        {
          url: "/apply/midc-land-allotment",
          title: "Apply for MIDC Logistics Land Plot",
          subtitle: "MIDC • 15 Days SLA",
        },
        {
          url: "/apply/fire-safety-noc",
          title: "Apply for Fire Safety NOC",
          subtitle: "Directorate of Fire Services • 10 Days SLA",
        },
        {
          url: "/apply/gumasta-license",
          title: "Apply for Gumasta Registration",
          subtitle: "Labour Department • 7 Days SLA",
        },
        {
          url: "/dashboard/kya",
          title: "Logistics Policy 2024 Incentives",
          subtitle: "FSI 3-5 & Capital Subsidies",
        }
      );
    }
  }

  return { cleanContent, actions };
}

function getActionIcon(url: string) {
  if (url.includes("fssai") || url.includes("food")) {
    return <Utensils className="w-3.5 h-3.5 text-amber-600" />;
  }
  if (url.includes("gumasta") || url.includes("shop")) {
    return <Store className="w-3.5 h-3.5 text-emerald-600" />;
  }
  if (url.includes("dish") || url.includes("factory")) {
    return <Factory className="w-3.5 h-3.5 text-blue-600" />;
  }
  if (url.includes("mpcb")) {
    return <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />;
  }
  if (url.includes("midc") || url.includes("land")) {
    return <Building2 className="w-3.5 h-3.5 text-indigo-600" />;
  }
  if (url.includes("fire")) {
    return <Flame className="w-3.5 h-3.5 text-rose-600" />;
  }
  if (url.includes("kya")) {
    return <Compass className="w-3.5 h-3.5 text-[#FE7251]" />;
  }
  if (url.includes("prevalidation")) {
    return <Sparkles className="w-3.5 h-3.5 text-purple-600" />;
  }
  return <ArrowRight className="w-3.5 h-3.5 text-[#9B2A48]" />;
}

export default function AskAarambhChatbot() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/apply");

  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const welcomeText = isDashboard
    ? DASHBOARD_WELCOME_MAP[language] || DASHBOARD_WELCOME_MAP.en
    : LANDING_WELCOME_MAP[language] || LANDING_WELCOME_MAP.en;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: welcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update greeting when language or dashboard context switches if no user chat history yet
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        const text = isDashboard
          ? DASHBOARD_WELCOME_MAP[language] || DASHBOARD_WELCOME_MAP.en
          : LANDING_WELCOME_MAP[language] || LANDING_WELCOME_MAP.en;
        return [
          {
            id: "welcome-msg",
            role: "assistant",
            content: text,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ];
      }
      return prev;
    });
  }, [language, isDashboard]);

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
        content:
          data.content ||
          (language === "mr"
            ? "सध्या आपल्या विनंतीवर प्रक्रिया करता आली नाही. कृपया पुन्हा प्रयत्न करा किंवा १८००-१२०-८०४० वर संपर्क साधा."
            : language === "hi"
            ? "वर्तमान में आपके अनुरोध को संसाधित नहीं किया जा सका। कृपया पुनः प्रयास करें या 1800-120-8040 पर संपर्क करें।"
            : "I couldn't process your request right now. Please try again or contact the Investor Helpline at 1800-120-8040."),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        userQueryContext: query.trim(),
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
        content: err instanceof Error ? err.message : errorFallback,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        userQueryContext: query.trim(),
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
    const text = isDashboard
      ? DASHBOARD_WELCOME_MAP[language] || DASHBOARD_WELCOME_MAP.en
      : LANDING_WELCOME_MAP[language] || LANDING_WELCOME_MAP.en;

    setMessages([
      {
        id: "welcome-msg",
        role: "assistant",
        content: text,
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

  const suggestions = isDashboard
    ? DASHBOARD_SUGGESTIONS_MAP[language] || DASHBOARD_SUGGESTIONS_MAP.en
    : LANDING_SUGGESTIONS_MAP[language] || LANDING_SUGGESTIONS_MAP.en;

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
              <span className="text-xs font-bold tracking-wide text-white">Ask AARAMBH</span>
            </div>
          </button>
        </div>
      )}

      {/* 2. Interactive Chat Window */}
      {isOpen && (
        <div
          className={`fixed right-3 sm:right-5 bottom-5 z-50 w-[92vw] sm:w-[390px] bg-white rounded-2xl shadow-2xl border border-[#F0E5E0] overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in zoom-in-95 ${
            isMinimized ? "h-14" : "h-[560px] max-h-[85vh]"
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
                  <h3 className="text-xs font-black text-white tracking-wide">AARAMBH</h3>
                  <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-[#FE7251]/20 text-[#FFCA7C] border border-[#FE7251]/30">
                    {isDashboard ? "Smart AI Advisory" : "General Helpdesk"}
                  </span>
                </div>
                <p className="text-[9px] text-[#C4A89C]">Single Window Statutory Assistant</p>
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
                {messages.map((msg) => {
                  const { cleanContent, actions } =
                    msg.role === "assistant" && msg.id !== "welcome-msg"
                      ? extractActionItems(msg.content, msg.userQueryContext, isDashboard)
                      : { cleanContent: msg.content.replace(/\[action:([^|\]]+)\|([^|\]]+)(?:\|([^\]]*))?\]/g, "").trim(), actions: [] };

                  return (
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
                        className={`max-w-[88%] rounded-xl p-3 text-xs shadow-xs ${
                          msg.role === "user"
                            ? "bg-[#9B2A48] text-white rounded-tr-none"
                            : "bg-white text-slate-800 border border-[#F0E5E0] rounded-tl-none"
                        }`}
                      >
                        <div className="space-y-1">{renderMessageContent(cleanContent)}</div>

                        {/* Interactive Direct Navigation Action Buttons (Only rendered when inside Dashboard / Apply) */}
                        {isDashboard && actions && actions.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-[#F0E5E0] space-y-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#9B2A48] uppercase tracking-wider">
                              <Sparkles className="w-3 h-3 text-[#FE7251]" />
                              <span>Direct Approvals & Statutory Clearance</span>
                            </div>
                            <div className="grid grid-cols-1 gap-1.5">
                              {actions.map((act, aIdx) => (
                                <Link
                                  key={aIdx}
                                  href={act.url}
                                  className="group flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-[#FFF9F6] to-white hover:from-[#FFF0E6] hover:to-[#FFF7F0] border border-[#FED17A]/70 hover:border-[#FE7251] shadow-xs hover:shadow-sm transition-all duration-150 text-left"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                    <div className="w-7 h-7 rounded-md bg-white border border-[#FED17A]/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                                      {getActionIcon(act.url)}
                                    </div>
                                    <div className="min-w-0">
                                      <span className="text-[11px] font-bold text-slate-900 group-hover:text-[#9B2A48] line-clamp-1">
                                        {act.title}
                                      </span>
                                      {act.subtitle && (
                                        <span className="text-[9px] text-slate-500 block truncate">
                                          {act.subtitle}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#9B2A48]/10 text-[9px] font-bold text-[#9B2A48] group-hover:bg-[#9B2A48] group-hover:text-white shrink-0 transition-colors">
                                    <span>Apply</span>
                                    <ArrowRight className="w-2.5 h-2.5" />
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        <span
                          className={`text-[9px] mt-1.5 block text-right ${
                            msg.role === "user" ? "text-rose-200" : "text-slate-400"
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

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
                        {language === "mr"
                          ? "आरंभ माहिती तपासत आहे..."
                          : language === "hi"
                          ? "आरंभ जानकारी की जांच कर रहा है..."
                          : "AARAMBH is consulting official records..."}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips (Visible when only initial greeting exists) */}
              {messages.length <= 1 && (
                <div className="px-3 py-2 bg-[#FFF7F0] border-t border-[#F0E5E0] flex flex-nowrap overflow-x-auto gap-1 shrink-0 scrollbar-none">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSendMessage(suggestion)}
                      className="px-2.5 py-1 rounded-md bg-white border border-[#FED17A] hover:border-[#FE7251] hover:text-[#9B2A48] text-slate-700 text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-xs"
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
                    placeholder={
                      isDashboard
                        ? t("chat.placeholder_dash", "Ask about clearances, MIDC zones, PSI subsidies, or approvals...")
                        : t("chat.placeholder_general", "Ask any question about Maharashtra Single Window clearances...")
                    }
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
                  <span>
                    {language === "mr"
                      ? "महाराष्ट्र शासन"
                      : language === "hi"
                      ? "महाराष्ट्र सरकार"
                      : "Govt. of Maharashtra"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
