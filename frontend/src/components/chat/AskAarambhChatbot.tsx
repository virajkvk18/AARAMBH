"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Mic,
  Square,
  Volume2,
  VolumeX,
  RefreshCw,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Utensils,
  Store,
  Factory,
  Flame,
  ArrowRight,
  Compass,
  Zap,
  BookOpen,
  Award,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  userQueryContext?: string;
  lang?: "en" | "mr" | "hi";
}

interface ActionItem {
  url: string;
  title: string;
  subtitle?: string;
}

interface ISpeechRecognitionAlternative {
  transcript: string;
}

interface ISpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: ISpeechRecognitionAlternative;
}

interface ISpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: ISpeechRecognitionResult;
  };
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

function detectQuestionLanguage(text: string): "en" | "mr" | "hi" {
  if (!/[\u0900-\u097F]/.test(text)) return "en";
  if (text.includes("\u0933")) return "mr";
  const hiWords = ["हैं", "क्या", "और", "में", "सकते", "चाहिए", "करने", "कीजिए", "जाए", "है"];
  const mrWords = ["आहे", "आहेत", "मध्ये", "साठी", "नाही", "येथे", "झाले", "करण्यासाठी", "होईल", "राहील"];
  let hiScore = 0;
  let mrScore = 0;
  for (const w of hiWords) if (text.includes(w)) hiScore++;
  for (const w of mrWords) if (text.includes(w)) mrScore++;
  if (mrScore > 0 && mrScore >= hiScore) return "mr";
  return "hi";
}

function stripActionTags(text: string): string {
  return text.replace(/\[action:[^\]]*\]/g, "").trim();
}

function pickSpeechVoice(lang: "en" | "mr" | "hi"): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();

  const score = (v: SpeechSynthesisVoice): number => {
    const vlang = v.lang.toLowerCase().replace("_", "-");
    const name = v.name.toLowerCase();
    if (lang === "en") {
      if (vlang.startsWith("en-in") || name.includes("india")) {
        if (vlang.startsWith("en-in")) return 100;
        if (name.includes("india") && vlang.startsWith("en-")) return 90;
        if (name.includes("india")) return 70;
      }
      if (vlang.startsWith("en-gb")) return 60;
      if (vlang.startsWith("en-us")) return 40;
      if (vlang.startsWith("en")) return 20;
      return 0;
    }
    if (lang === "mr") {
      if (vlang.startsWith("mr")) return 100;
      if (name.includes("marathi")) return 95;
      if (vlang.startsWith("hi")) return 50;
      return 0;
    }
    if (vlang.startsWith("hi")) return 100;
    if (name.includes("hindi")) return 95;
    return 0;
  };

  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -1;
  for (const v of voices) {
    const s = score(v);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  return best;
}

const TOPIC_SHORTCUTS = [
  {
    icon: Utensils,
    title: "Food & Restaurants",
    query: "What approvals do I need to start a fast food restaurant or cafe?",
    badge: "FSSAI & Gumasta",
    color: "text-amber-700 bg-amber-50 border-amber-200",
  },
  {
    icon: Zap,
    title: "EV & Clean Tech",
    query: "What subsidies and clearances apply for EV and battery manufacturing?",
    badge: "EV Policy 2021",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    icon: Factory,
    title: "Manufacturing & DISH",
    query: "How do I obtain DISH factory building plan and operating license?",
    badge: "Factories Act",
    color: "text-blue-700 bg-blue-50 border-blue-200",
  },
  {
    icon: Award,
    title: "PSI 2019 Subsidies",
    query: "Explain Gross SGST refund (IPS), electricity duty exemption, and capital subsidies under PSI 2019.",
    badge: "Package Scheme",
    color: "text-purple-700 bg-purple-50 border-purple-200",
  },
  {
    icon: Building2,
    title: "MIDC Land Allotment",
    query: "What is the procedure for MIDC plot allotment and building plan sanction?",
    badge: "15 Days SLA",
    color: "text-indigo-700 bg-indigo-50 border-indigo-200",
  },
  {
    icon: ShieldCheck,
    title: "MPCB CTE vs CTO",
    query: "Explain difference between MPCB Consent to Establish (CTE) and Consent to Operate (CTO).",
    badge: "Pollution Control",
    color: "text-teal-700 bg-teal-50 border-teal-200",
  },
];

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
  en: "Hi! I'm **AARAMBH AI** — your dedicated Maharashtra Single Window clearance assistant. You can ask me about starting any business (like restaurants, EV, factories, warehouses), required clearances (FSSAI, MIDC, MPCB, Fire NOC, DISH), or direct application approvals.",
  mr: "नमस्कार! मी **आरंभ AI** — आपला महाराष्ट्र एक खिडकी परवाना सहाय्यक. मला कोणत्याही व्यवसायाची सुरुवात (उदा. रेस्टॉरंट, ईव्ही, फॅक्टरी, वेअरहाऊस), आवश्यक परवाने किंवा थेट अर्जांबद्दल विचारा.",
  hi: "नमस्ते! मैं **आरंभ AI** — आपका महाराष्ट्र सिंगल विंडो क्लीयरेंस सहायक। मुझसे कोई भी व्यवसाय शुरू करने (जैसे रेस्टोरेंट, ईवी, फैक्ट्री, गोदाम), आवश्यक अनुमोदन या सीधे आवेदन के बारे में पूछें।",
};

const LANDING_WELCOME_MAP: Record<string, string> = {
  en: "Hi! I'm **AARAMBH AI** — your Maharashtra Single Window clearance advisor. Ask me anything about industrial policies (PSI 2019, EV 2021, Logistics 2024), statutory clearances, MIDC zones, or RTS Act deemed approval timelines.",
  mr: "नमस्कार! मी **आरंभ AI** — आपला महाराष्ट्र एक खिडकी परवाना मार्गदर्शक. मला औद्योगिक धोरणे (PSI २०१९, ईव्ही २०२१, लॉजिस्टिक २०२४), विविध परवाने, MIDC झोन किंवा RTS कायद्याबद्दल विचारा.",
  hi: "नमस्ते! मैं **आरंभ AI** — आपका महाराष्ट्र सिंगल विंडो क्लीयरेंस सलाहकार। मुझसे औद्योगिक नीतियों (PSI 2019, ईवी 2021, लॉजिस्टिक्स 2024), अनुमोदनों, MIDC क्षेत्रों या RTS अधिनियम के बारे में पूछें।",
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
    return <Utensils className="w-4 h-4 text-amber-600" />;
  }
  if (url.includes("gumasta") || url.includes("shop")) {
    return <Store className="w-4 h-4 text-emerald-600" />;
  }
  if (url.includes("dish") || url.includes("factory")) {
    return <Factory className="w-4 h-4 text-blue-600" />;
  }
  if (url.includes("mpcb")) {
    return <ShieldCheck className="w-4 h-4 text-teal-600" />;
  }
  if (url.includes("midc") || url.includes("land")) {
    return <Building2 className="w-4 h-4 text-indigo-600" />;
  }
  if (url.includes("fire")) {
    return <Flame className="w-4 h-4 text-rose-600" />;
  }
  if (url.includes("kya")) {
    return <Compass className="w-4 h-4 text-[#FE7251]" />;
  }
  if (url.includes("prevalidation")) {
    return <Sparkles className="w-4 h-4 text-purple-600" />;
  }
  return <ArrowRight className="w-4 h-4 text-[#9B2A48]" />;
}

export default function AskAarambhChatbot() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/apply");

  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageIdRef = useRef(0);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const transcriptRef = useRef("");

  const getSpeechRecognition = (): ISpeechRecognition | null => {
    if (typeof window === "undefined") return null;
    const w = window as unknown as {
      SpeechRecognition?: new () => ISpeechRecognition;
      webkitSpeechRecognition?: new () => ISpeechRecognition;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    return Ctor ? new Ctor() : null;
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  };

  const toggleListening = () => {
    if (listening) {
      stopListening();
      return;
    }
    const recognition = getSpeechRecognition();
    if (!recognition) return;
    recognitionRef.current = recognition;
    transcriptRef.current = "";
    recognition.lang = language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          transcriptRef.current += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setInput(transcriptRef.current + interim);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };

    recognition.onerror = () => {
      recognitionRef.current = null;
      setListening(false);
    };

    try {
      recognition.start();
      setListening(true);
    } catch {
      recognitionRef.current = null;
      setListening(false);
    }
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const speakText = (text: string, lang: "en" | "mr" | "hi", id?: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const clean = stripActionTags(text);
    if (!clean) return;
    window.speechSynthesis.cancel();
    setSpeakingId(id || null);
    const utterance = new SpeechSynthesisUtterance(clean);
    const voice = pickSpeechVoice(lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = lang === "mr" ? "hi-IN" : lang === "hi" ? "hi-IN" : "en-IN";
    }
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    setSpeakingId(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled((prev) => {
      if (prev) stopSpeaking();
      return !prev;
    });
  };

  const handleClose = () => {
    stopSpeaking();
    setIsOpen(false);
  };

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const warm = () => {
      window.speechSynthesis.getVoices();
    };
    warm();
    window.speechSynthesis.addEventListener("voiceschanged", warm);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", warm);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
        setSpeakingId(null);
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string, forcedLang?: "en" | "mr" | "hi") => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const detectedLang = forcedLang || detectQuestionLanguage(query.trim());

    const userMessage: Message = {
      id: `user-${++messageIdRef.current}`,
      role: "user",
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      lang: detectedLang,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) {
      setInput("");
      if (inputRef.current) inputRef.current.style.height = "auto";
    }
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
          language: detectedLang,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch response from AARAMBH advisory service");
      }

      const replyText =
        data.content ||
        (detectedLang === "mr"
          ? "सध्या आपल्या विनंतीवर प्रक्रिया करता आली नाही. कृपया पुन्हा प्रयत्न करा किंवा १८००-१२०-८०४० वर संपर्क साधा."
          : detectedLang === "hi"
          ? "वर्तमान में आपके अनुरोध को संसाधित नहीं किया जा सका। कृपया पुनः प्रयास करें या 1800-120-8040 पर संपर्क करें।"
          : "I couldn't process your request right now. Please try again or contact the Investor Helpline at 1800-120-8040.");

      const botMessage: Message = {
        id: `bot-${++messageIdRef.current}`,
        role: "assistant",
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        userQueryContext: query.trim(),
        lang: detectedLang,
      };

      setMessages((prev) => [...prev, botMessage]);
      if (voiceEnabled) speakText(replyText, detectedLang, botMessage.id);
    } catch (err: unknown) {
      console.error("Chat error:", err);
      const errorFallback =
        detectedLang === "mr"
          ? "या क्षणी आपल्या विनंतीवर प्रक्रिया करण्यात अडचण येत आहे. कृपया पुन्हा विचारून पहा किंवा १८००-१२०-८०४० वर संपर्क साधा."
          : detectedLang === "hi"
          ? "इस समय आपके अनुरोध को संसाधित करने में असमर्थ। कृपया पुनः प्रयास करें या 1800-120-8040 पर संपर्क करें।"
          : "Unable to process your request at this moment. Please try asking again or contact the Single Window Investor Helpline at 1800-120-8040.";

      const errorMessage: Message = {
        id: `err-${++messageIdRef.current}`,
        role: "assistant",
        content: err instanceof Error ? err.message : errorFallback,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        userQueryContext: query.trim(),
        lang: detectedLang,
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
    stopSpeaking();
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
          <h4 key={idx} className="font-bold text-slate-900 text-sm mt-3 mb-1">
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={idx} className="font-black text-slate-900 text-base mt-3 mb-1.5 border-b border-slate-100 pb-1">
            {line.replace("## ", "")}
          </h3>
        );
      }
      if (line.startsWith("---")) {
        return <hr key={idx} className="my-2.5 border-slate-200" />;
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
          <li key={idx} className="ml-5 list-disc text-xs sm:text-sm leading-relaxed my-1 text-slate-700">
            {formattedLine}
          </li>
        );
      }

      if (line.trim() === "") {
        return <div key={idx} className="h-2"></div>;
      }

      return (
        <p key={idx} className="text-xs sm:text-sm leading-relaxed my-1 text-slate-800">
          {formattedLine}
        </p>
      );
    });
  };

  const suggestions = isDashboard
    ? DASHBOARD_SUGGESTIONS_MAP[language] || DASHBOARD_SUGGESTIONS_MAP.en
    : LANDING_SUGGESTIONS_MAP[language] || LANDING_SUGGESTIONS_MAP.en;

  const autoResizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  };

  return (
    <>
      {/* 1. Floating Trigger Pill (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 animate-in fade-in duration-200">
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            aria-label="Open AARAMBH AI assistant"
            className="group flex items-center space-x-2.5 px-4 py-3 rounded-full bg-[#FE7251] hover:bg-[#E85E3E] text-white shadow-lg transition-colors cursor-pointer"
          >
            {/* Logo Container */}
            <div className="relative flex items-center justify-center">
              <img src="/aarambh-logo-new.png" alt="AARAMBH Logo" className="w-7 h-7 object-contain" />
            </div>

            <div className="flex flex-col text-left pr-1">
              <span className="text-xs font-bold tracking-wide text-white uppercase">Ask AARAMBH</span>
              <span className="text-[10px] text-orange-100 font-medium leading-none">Single Window Assistant</span>
            </div>
          </button>
        </div>
      )}

      {/* 2. Minimized Compact Pill (Bottom Right Dock) */}
      {isOpen && isMinimized && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 animate-in fade-in duration-200">
          <div className="flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-xl">
            <img src="/aarambh-logo-new.png" alt="AARAMBH Logo" className="w-5 h-5 object-contain" />
            <div className="flex items-center space-x-1.5 pr-2">
              <span className="text-xs font-semibold text-white">AARAMBH Assistant</span>
              {listening && <span title="Listening..."><Mic className="w-3 h-3 text-red-400 animate-pulse" /></span>}
              {loading && !listening && (
                <span title="Replying...">
                  <span className="inline-flex items-center gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-[#FE7251] animate-bounce"></span>
                    <span className="w-1 h-1 rounded-full bg-[#FE7251] animate-bounce [animation-delay:0.15s]"></span>
                    <span className="w-1 h-1 rounded-full bg-[#FE7251] animate-bounce [animation-delay:0.3s]"></span>
                  </span>
                </span>
              )}
            </div>
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="Expand Chat"
              aria-label="Expand chat"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="p-1 rounded-md bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Spacious, Systematic Big Chat Window Modal */}
      {isOpen && !isMinimized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-200 ${
              isMaximized
                ? "w-[98vw] h-[95dvh]"
                : "w-full max-w-5xl h-[85dvh] max-h-[calc(100dvh-2rem)] sm:min-h-[540px]"
            }`}
          >
            {/* --- Top Header Bar --- */}
            <div className="bg-slate-900 text-white px-5 sm:px-6 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <img src="/aarambh-logo-new.png" alt="AARAMBH Logo" className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-sm font-bold text-white tracking-wide">
                      AARAMBH <span className="text-[#FE7251]">AI Assistant</span>
                    </h2>
                    <span className="hidden sm:inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {isDashboard ? "Statutory Rules Engine" : "Single Window Helpdesk"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Government of Maharashtra • Industrial Clearances, Subsidies & Approvals
                  </p>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Start a new conversation"
                  aria-label="Start a new conversation"
                  className="inline-flex items-center gap-1.5 pl-2 pr-2 sm:pl-2.5 sm:pr-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer text-xs font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Chat</span>
                </button>

                <div className="flex items-center rounded-lg border border-slate-700/60 bg-slate-800/50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsMinimized(true)}
                    title="Minimize to dock"
                    aria-label="Minimize chat to dock"
                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/70 transition-colors cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-px h-4 bg-slate-700/60"></span>
                  <button
                    type="button"
                    onClick={() => setIsMaximized(!isMaximized)}
                    title={isMaximized ? "Exit full screen" : "Full screen"}
                    aria-label={isMaximized ? "Exit full screen" : "Full screen"}
                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/70 transition-colors cursor-pointer"
                  >
                    {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                  <span className="w-px h-4 bg-slate-700/60"></span>
                  <button
                    type="button"
                    onClick={handleClose}
                    title="Close (Esc)"
                    aria-label="Close chat (Esc)"
                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* --- Main 2-Pane Body --- */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Systematic Knowledge Sidebar (Visible on md+ screens) */}
              <div className="hidden md:flex w-72 lg:w-80 shrink-0 border-r border-slate-200 bg-slate-50/60 flex-col justify-between p-4 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#FE7251]" />
                      <span>Quick Guidance Topics</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Select a topic for instant statutory requirements and guidance:
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {TOPIC_SHORTCUTS.map((top, idx) => {
                      const IconComp = top.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(top.query, language)}
                          className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                                <IconComp className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-medium text-slate-800 group-hover:text-[#FE7251]">
                                {top.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600">
                              {top.badge}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Statutory Guarantee Badge */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs mt-4">
                  <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Maharashtra RTS Act 2015</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Time-bound statutory guarantee. If the competent department does not decide within SLA, application is deemed approved.
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Helpline: 1800-120-8040</span>
                    <span className="text-emerald-700 font-medium">Active</span>
                  </div>
                </div>
              </div>

              {/* Right Main Conversation Area */}
              <div className="flex-1 flex flex-col justify-between bg-slate-50/30 overflow-hidden">
                {/* Messages Body */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                  {messages.map((msg) => {
                    const displayedContent = msg.id === "welcome-msg" ? welcomeText : msg.content;
                    const { cleanContent, actions } =
                      msg.role === "assistant" && msg.id !== "welcome-msg"
                        ? extractActionItems(displayedContent, msg.userQueryContext, isDashboard)
                        : {
                            cleanContent: displayedContent,
                            actions: [],
                          };

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 ${
                          msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            msg.role === "user"
                              ? "bg-[#FE7251] text-white"
                              : "bg-slate-900 text-white"
                          }`}
                        >
                          {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`max-w-[85%] min-w-0 break-words rounded-xl p-3.5 text-xs sm:text-sm ${
                            msg.role === "user"
                              ? "bg-[#FE7251] text-white rounded-tr-none"
                              : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs"
                          }`}
                        >
                          <div className="space-y-1">{renderMessageContent(cleanContent)}</div>

                          {/* Direct Clearance Action Cards (Only inside Dashboard / Apply) */}
                          {isDashboard && actions && actions.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5 text-[#FE7251]" />
                                <span>Direct Approvals & Clearance Links</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {actions.map((act, aIdx) => (
                                  <Link
                                    key={aIdx}
                                    href={act.url}
                                    className="group flex items-center justify-between p-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#FE7251] shadow-2xs transition-colors text-left"
                                  >
                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                      <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                                        {getActionIcon(act.url)}
                                      </div>
                                      <div className="min-w-0">
                                        <span className="text-xs font-semibold text-slate-900 group-hover:text-[#FE7251] line-clamp-1">
                                          {act.title}
                                        </span>
                                        {act.subtitle && (
                                          <span className="text-[10px] text-slate-500 block truncate">
                                            {act.subtitle}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 group-hover:bg-[#FE7251] text-slate-700 group-hover:text-white text-[10px] font-semibold shrink-0 transition-colors">
                                      <span>Apply</span>
                                      <ArrowRight className="w-3 h-3" />
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-1.5 flex items-center justify-between gap-2">
                            <span
                              className={`text-[10px] block text-right ${
                                msg.role === "user" ? "text-orange-100" : "text-slate-400"
                              }`}
                            >
                              {msg.timestamp}
                            </span>
                            {msg.role === "assistant" && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (speakingId === msg.id) {
                                    stopSpeaking();
                                  } else {
                                    speakText(
                                      msg.content,
                                      msg.lang || detectQuestionLanguage(msg.content),
                                      msg.id
                                    );
                                  }
                                }}
                                title={speakingId === msg.id ? "Stop" : "Listen to this reply"}
                                aria-label={speakingId === msg.id ? "Stop reading this reply" : "Listen to this reply"}
                                className={`inline-flex items-center gap-1 text-[10px] transition-colors cursor-pointer ${
                                  speakingId === msg.id
                                    ? "text-[#FE7251] hover:text-[#E85E3E]"
                                    : "text-slate-400 hover:text-[#FE7251]"
                                }`}
                              >
                                {speakingId === msg.id ? (
                                  <VolumeX className="w-3 h-3" />
                                ) : (
                                  <Volume2 className="w-3 h-3" />
                                )}
                                <span>{speakingId === msg.id ? "Stop" : "Listen"}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Loading State */}
                  {loading && (
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 animate-pulse">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl rounded-tl-none p-3 shadow-xs flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-[#FE7251] animate-bounce"></span>
                        <span className="w-2 h-2 rounded-full bg-[#FE7251] animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 rounded-full bg-[#FE7251] animate-bounce [animation-delay:0.4s]"></span>
                        <span className="text-xs text-slate-600 font-medium ml-1">
                          {language === "mr"
                            ? "आरंभ अधिकृत शासन नियमावली तपासत आहे..."
                            : language === "hi"
                            ? "आरंभ आधिकारिक शासन अभिलेखों की जांच कर रहा है..."
                            : "Consulting statutory clearance rules..."}
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Chips */}
                {messages.length <= 1 && (
                  <div className="px-4 sm:px-6 py-2 bg-white border-t border-slate-200 flex flex-nowrap overflow-x-auto gap-2 shrink-0">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSendMessage(suggestion)}
                        className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 border border-slate-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Bottom Input Console */}
                <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={input}
                      onChange={(e) => {
                      setInput(e.target.value);
                      autoResizeTextarea(e.target);
                    }}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        isDashboard
                          ? t("chat.placeholder_dash", "Ask about restaurant approvals, EV policy, MIDC land, or PSI 2019...")
                          : t("chat.placeholder_general", "Ask any question about Maharashtra Single Window clearances...")
                      }
                      className="flex-1 max-h-32 min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#FE7251] focus:ring-1 focus:ring-[#FE7251] focus:outline-hidden resize-none leading-relaxed"
                    />
                    <button
                      type="button"
                      onClick={toggleListening}
                      disabled={loading}
                      title={listening ? "Stop voice input" : "Speak your question"}
                      aria-label={listening ? "Stop voice input" : "Speak your question"}
                      className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 border ${
                        listening
                          ? "bg-red-500 hover:bg-red-600 text-white border-red-500 animate-pulse"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300"
                      }`}
                    >
                      {listening ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={!input.trim() || loading}
                      className="h-10 px-4 rounded-lg bg-[#FE7251] hover:bg-[#E85E3E] text-white flex items-center justify-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 font-medium text-xs shadow-xs"
                    >
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between gap-2 flex-wrap text-[10px] text-slate-400 px-0.5">
                    <span>Press <strong>Enter ↵</strong> to send, <strong>Shift + Enter</strong> for newline</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={toggleVoice}
                        title={voiceEnabled ? "Voice replies on — click to mute" : "Voice replies off — click to enable"}
                        aria-pressed={voiceEnabled}
                        className={`inline-flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                          voiceEnabled ? "text-[#FE7251]" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {voiceEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                        <span>{voiceEnabled ? "Voice ON" : "Voice OFF"}</span>
                      </button>
                      <span className="hidden md:inline">{t("topbar.portal_title", "Single Window Clearance Portal")} • {language === "mr" ? "महाराष्ट्र शासन" : language === "hi" ? "महाराष्ट्र सरकार" : "Govt. of Maharashtra"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
