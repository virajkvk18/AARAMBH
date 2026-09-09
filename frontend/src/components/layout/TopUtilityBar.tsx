"use client";

import React, { useState } from "react";
import { Landmark, Globe } from "lucide-react";
import { useLanguage, Language } from "@/context/LanguageContext";

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
    <div className="w-full bg-[#14050B] text-slate-300 text-[11px] border-b border-[#250C19] z-50 select-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
        {/* Left: Government of Maharashtra Statement */}
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-full bg-[#250C19] border border-[#FED17A]/40 flex items-center justify-center text-[10px] text-[#FFCA7C] font-bold shrink-0">
            <Landmark className="w-3 h-3 text-[#FFCA7C]" />
          </div>
          <span className="font-semibold text-[#FFF2DF] text-xs tracking-wide">
            {t("topbar.gov_statement")}
          </span>
        </div>

        {/* Right: Accessibility & 3-Language Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4 text-slate-300">
          <span className="text-[10px] text-[#C4A89C] hidden sm:inline">
            {t("topbar.portal_title")}
          </span>

          {/* Accessibility Font Size Toggle */}
          <button
            type="button"
            onClick={toggleFontSize}
            className="flex items-center space-x-0.5 px-2 py-0.5 rounded bg-[#250C19] hover:bg-[#3D1420] text-[#FFCA7C] border border-[#FED17A]/30 transition-colors cursor-pointer font-bold text-[10px]"
            title={t("topbar.text_size")}
            suppressHydrationWarning
          >
            <span>{fontSizeLevel === "base" ? "A+" : fontSizeLevel === "lg" ? "A-" : "A"}</span>
          </button>

          {/* 3-Language Selector: English | मराठी | हिंदी */}
          <div className="flex items-center bg-[#250C19] border border-[#FED17A]/30 rounded-lg p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                language === "en"
                  ? "bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white shadow-xs"
                  : "text-[#C4A89C] hover:text-[#FFCA7C]"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage("mr")}
              className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                language === "mr"
                  ? "bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white shadow-xs"
                  : "text-[#C4A89C] hover:text-[#FFCA7C]"
              }`}
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => setLanguage("hi")}
              className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                language === "hi"
                  ? "bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white shadow-xs"
                  : "text-[#C4A89C] hover:text-[#FFCA7C]"
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
