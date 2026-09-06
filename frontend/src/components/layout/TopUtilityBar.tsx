"use client";

import React, { useState } from "react";
import { PhoneCall, Globe, Volume2, ChevronDown } from "lucide-react";

export default function TopUtilityBar() {
  const [fontSizeLevel, setFontSizeLevel] = useState<"sm" | "base" | "lg">("base");
  const [lang, setLang] = useState<"en" | "mr">("en");
  const [langOpen, setLangOpen] = useState(false);

  const handleFontSize = (level: "sm" | "base" | "lg") => {
    setFontSizeLevel(level);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (level === "sm") {
        root.style.fontSize = "14px";
      } else if (level === "lg") {
        root.style.fontSize = "18px";
      } else {
        root.style.fontSize = "16px";
      }
    }
  };

  return (
    <div className="w-full bg-[#0F172A] text-slate-300 text-xs border-b border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
        {/* Left: Helpline & Gov Identity */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 font-medium text-slate-200">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline">Govt. of Maharashtra</span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-400">Single Window Portal</span>
          </div>

          <div className="hidden lg:flex items-center space-x-1.5 text-slate-300 hover:text-white transition-colors">
            <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
            <span>Helpline: <strong className="text-white font-semibold">1800-120-8040</strong> (9:00 AM - 6:00 PM)</span>
          </div>
        </div>

        {/* Right: Accessibility & Language */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Screen Reader Access */}
          <button
            type="button"
            className="hidden sm:flex items-center space-x-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Screen Reader Access"
            onClick={() => alert("Screen Reader Access enabled.")}
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Screen Reader</span>
          </button>

          {/* Text Size Accessibility Controls (A- / A / A+) */}
          <div className="flex items-center border border-slate-700 rounded overflow-hidden bg-slate-900/60">
            <button
              type="button"
              onClick={() => handleFontSize("sm")}
              className={`px-2 py-0.5 text-xs font-semibold hover:bg-slate-700 transition-colors ${
                fontSizeLevel === "sm" ? "bg-indigo-600 text-white" : "text-slate-300"
              }`}
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => handleFontSize("base")}
              className={`px-2 py-0.5 text-xs font-semibold border-x border-slate-700 hover:bg-slate-700 transition-colors ${
                fontSizeLevel === "base" ? "bg-indigo-600 text-white" : "text-slate-300"
              }`}
              title="Normal Font Size"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => handleFontSize("lg")}
              className={`px-2 py-0.5 text-xs font-semibold hover:bg-slate-700 transition-colors ${
                fontSizeLevel === "lg" ? "bg-indigo-600 text-white" : "text-slate-300"
              }`}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Language Selector Dropdown (English / Marathi) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium">{lang === "en" ? "English" : "मराठी"}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langOpen && (
              <div
                className="absolute right-0 mt-1 w-28 bg-[#1E293B] border border-slate-700 rounded-md shadow-lg py-1 z-50 text-xs"
                onMouseLeave={() => setLangOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setLang("en");
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-indigo-600 hover:text-white transition-colors ${
                    lang === "en" ? "text-indigo-400 font-semibold" : "text-slate-200"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLang("mr");
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-indigo-600 hover:text-white transition-colors ${
                    lang === "mr" ? "text-indigo-400 font-semibold" : "text-slate-200"
                  }`}
                >
                  मराठी
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
