"use client";

import React, { useState } from "react";
import { Landmark } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TopUtilityBar() {
  const [fontSizeLevel, setFontSizeLevel] = useState<"sm" | "base" | "lg">("base");
  const { language, setLanguage, t } = useLanguage();

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

  return (
    <div className="w-full shrink-0 bg-slate-900 text-slate-300 text-[11px] border-b border-slate-800 z-50 select-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
        {/* Left: Government of Maharashtra Statement */}
        <div className="flex items-center space-x-2">
          <Landmark className="w-3.5 h-3.5 text-[#FE7251] shrink-0" />
          <span className="font-medium text-slate-200 text-xs tracking-wide">
            {t("topbar.gov_statement")}
          </span>
        </div>

        {/* Right: Accessibility & 3-Language Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4 text-slate-300">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {t("topbar.portal_title")}
          </span>

          {/* Accessibility Font Size Toggle */}
          <button
            type="button"
            onClick={toggleFontSize}
            className="flex items-center px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer font-semibold text-[10px]"
            title={t("topbar.text_size")}
            suppressHydrationWarning
          >
            <span>{fontSizeLevel === "base" ? "A+" : fontSizeLevel === "lg" ? "A-" : "A"}</span>
          </button>

          {/* 3-Language Selector: English | मराठी | हिंदी */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-md p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                language === "en"
                  ? "bg-[#FE7251] text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage("mr")}
              className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                language === "mr"
                  ? "bg-[#FE7251] text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => setLanguage("hi")}
              className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                language === "hi"
                  ? "bg-[#FE7251] text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
