"use client";

import React, { useState } from "react";
import { Landmark } from "lucide-react";

export default function TopUtilityBar() {
  const [fontSizeLevel, setFontSizeLevel] = useState<"sm" | "base" | "lg">("base");
  const [lang, setLang] = useState<"en" | "mr">("en");

  const toggleFontSize = () => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (fontSizeLevel === "base") {
        root.style.fontSize = "17px";
        setFontSizeLevel("lg");
      } else if (fontSizeLevel === "lg") {
        root.style.fontSize = "15px";
        setFontSizeLevel("sm");
      } else {
        root.style.fontSize = "16px";
        setFontSizeLevel("base");
      }
    }
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === "en" ? "mr" : "en"));
  };

  return (
    <div className="w-full bg-[#060D17] text-slate-300 text-[11px] border-b border-slate-800/80 z-50 select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
        {/* Left: Government of Maharashtra Statement */}
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-amber-400 font-bold shrink-0">
            <Landmark className="w-3 h-3 text-amber-400" />
          </div>
          <span className="font-semibold text-slate-200 text-xs tracking-wide">
            महाराष्ट्र शासन • Government of Maharashtra
          </span>
        </div>

        {/* Right: Accessibility & Language Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4 text-slate-300">
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Single Window Clearance Portal
          </span>

          {/* Accessibility Font Size Toggle (↑A) */}
          <button
            type="button"
            onClick={toggleFontSize}
            className="flex items-center space-x-0.5 px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title="Adjust Text Size"
          >
            <span className="text-[11px] font-bold">↑A</span>
          </button>

          {/* Language Toggle (अ / A) */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-200 hover:text-white font-bold transition-colors cursor-pointer"
            title="Switch Language"
          >
            <span className="text-amber-400">अ</span>
            <span className="text-slate-500">/</span>
            <span>A</span>
          </button>
        </div>
      </div>
    </div>
  );
}
