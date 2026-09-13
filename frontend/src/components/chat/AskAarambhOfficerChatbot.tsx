"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  ShieldCheck,
  Bot,
  User,
  Sparkles,
  RotateCcw,
} from "lucide-react";

interface OfficerMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface OfficerChatProps {
  department?: string;
  officerName?: string;
}

const OFFICER_QUICK_PROMPTS = [
  "Summarize my pending CAF scrutiny queue",
  "RTS Act 2015 deemed approval — SLA timeline rules",
  "Draft a query letter for missing documents",
  "Which PSI 2019 zone applies to Nashik?",
];

// Minimal safe renderer: bold markers + bullet/persona-safe line breaks only.
function renderContent(content: string): React.ReactNode[] {
  return content.split("\n").map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return null;
    const isBullet = /^[-*•]\s+/.test(trimmed);
    const body = trimmed.replace(/^[-*•]\s+/, "");
    const parts = body.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={j} className="font-bold text-[#16060E]">
          {part.slice(2, -2)}
        </strong>
      ) : (
        span(j, part)
      )
    );
    if (isBullet) {
      return (
        <div key={i} className="flex items-start space-x-1.5">
          <span className="mt-0.5 w-1 h-1 rounded-full bg-[#FE7251] shrink-0" />
          <span>{parts}</span>
        </div>
      );
    }
    return <div key={i}>{parts}</div>;
  });
}

function span(key: number, text: string) {
  return <span key={key}>{text}</span>;
}

export default function AskAarambhOfficerChatbot({
  department = "MIDC Industrial Clearances",
}: OfficerChatProps) {
  const [messages, setMessages] = useState<OfficerMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Namaskar. AARAMBH Officer bot has loaded the ${department} scrutiny ruleset. Ask me to summarize the queue, check SLA deadlines, draft queries, or verify a clearance policy.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef(1);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, loading]);

  const send = async (override?: string) => {
    const content = (override ?? input).trim();
    if (!content || loading) return;
    setInput("");
    setError(null);

    const userMsg: OfficerMessage = {
      id: `u-${seqRef.current++}`,
      role: "user",
      content,
    };
    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          language: "en",
          chatType: "officer",
          officerContext: {
            department,
            console: "Officer Review Console",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "Officer bot could not reach the advisory service."
        );
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${seqRef.current++}`,
          role: "assistant",
          content: data.content || "No response received.",
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Oops — something went wrong. Please retry."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Namaskar. AARAMBH Officer bot has loaded the ${department} scrutiny ruleset. Ask me to summarize the queue, check SLA deadlines, draft queries, or verify a clearance policy.`,
      },
    ]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-[480px] rounded-2xl border border-[#F0E5E0] bg-white shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F0E5E0] bg-gradient-to-r from-[#FFF7F0] to-white shrink-0">
        <div className="flex items-center space-x-2.5">
          <span className="w-9 h-9 rounded-xl bg-[#9B2A48] text-[#FFCA7C] flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5" />
          </span>
          <div>
            <p className="text-sm font-black text-[#16060E] flex items-center gap-1.5">
              AARAMBH Officer Bot
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-[#9B2A48] bg-[#FFF2DF] border border-[#FED17A] px-1.5 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5" /> {department}
              </span>
            </p>
            <p className="text-[10px] text-slate-500">
              Department scrutiny assistant • Groq-backed via .env.local key
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={resetConversation}
          title="Reset conversation"
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#9B2A48] hover:bg-[#FFF2DF] transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FFFDFC]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2 ${m.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
          >
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                m.role === "user"
                  ? "bg-slate-200 text-slate-600"
                  : "bg-[#9B2A48] text-[#FFCA7C]"
              }`}
            >
              {m.role === "user" ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <Bot className="w-3.5 h-3.5" />
              )}
            </span>
            <div
              className={`max-w-[85%] text-xs leading-relaxed px-3.5 py-2.5 rounded-2xl ${
                m.role === "user"
                  ? "bg-[#FE7251] text-white rounded-tr-sm"
                  : "bg-white border border-[#F0E5E0] text-slate-700 rounded-tl-sm"
              }`}
            >
              {m.role === "assistant"
                ? renderContent(m.content)
                : m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 pl-10">
            <span className="w-2 h-2 rounded-full bg-[#FE7251] animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-[#FE7251] animate-bounce [animation-delay:120ms]" />
            <span className="w-2 h-2 rounded-full bg-[#FE7251] animate-bounce [animation-delay:240ms]" />
          </div>
        )}
      </div>

      {/* Quick prompts */}
      <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
        {OFFICER_QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={loading}
            onClick={() => send(q)}
            className="text-[10px] font-semibold text-[#9B2A48] bg-[#FFF7F0] hover:bg-[#FFF2DF] border border-[#FED17A] rounded-full px-2.5 py-1 transition-colors cursor-pointer disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {error && (
        <p className="px-4 pb-1 text-[10px] text-rose-600 font-medium bg-[#FFFDFC] shrink-0">
          ⚠️ {error}
        </p>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="flex items-center space-x-2 px-3 py-2.5 border-t border-[#F0E5E0] bg-white shrink-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the scrutiny queue, SLA deadlines, policies…"
          className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251] placeholder:text-slate-400"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-9 h-9 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}