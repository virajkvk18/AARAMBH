"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PhoneCall, Globe, Landmark } from "lucide-react";

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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">
        {/* Left: Maharashtra Gov Department Identifier (Reference Image 1) */}
        <div className="flex items-center space-x-3">
          {/* Emblem representation */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-amber-400 font-bold shrink-0">
              <Landmark className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex flex-col text-[10px] leading-tight text-slate-300">
              <span className="font-semibold text-slate-200">
                कौशल्य, रोजगार, उद्योजकता आणि नाविन्यता विभाग
              </span>
              <span className="text-slate-400 text-[9px] uppercase tracking-wider hidden sm:inline">
                DEPT. OF SKILLS & INNOVATION, GOVT. OF MAHARASHTRA
              </span>
            </div>
          </div>
        </div>

        {/* Center: Helpdesk Helpline (Golden Highlight like NSWS) */}
        <div className="hidden md:flex items-center space-x-1.5 font-medium text-slate-300">
          <span className="font-bold text-amber-400">Help |</span>
          <span>Helpdesk-1800-120-8040 [Mon - Sat, 9AM- 6PM]</span>
        </div>

        {/* Right: NSWS Utility Links + Accessibility + Language */}
        <div className="flex items-center space-x-4 sm:space-x-5 text-slate-300">
          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/faqs" className="hover:text-white transition-colors">
              FAQs
            </Link>
            <Link href="/user-guide" className="hover:text-white transition-colors">
              Guide
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/tutorials" className="hover:text-white transition-colors">
              Video Tutorials
            </Link>
          </div>

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
