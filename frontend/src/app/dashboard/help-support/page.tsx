"use client";

import React from "react";
import { MessageSquareWarning, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function HelpSupportPage() {
  const { t } = useLanguage();

  const faqs = [
    { q: "How to submit a new application?", a: "Navigate to the KYA Wizard and follow the steps." },
    { q: "What documents are required for pre‑validation?", a: "Refer to the Document Vault checklist for required PDFs." },
    { q: "How to track my application status?", a: "Use the Application Status page under Monitoring." },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs">
        <h1 className="text-2xl font-black text-[#16060E] mb-4">
          {t("help_support_title") || "Help & Support"}
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          Frequently asked questions and guidance for using the AARAMBH Officer Console.
        </p>
        <div className="space-y-4">
          {faqs.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-[#F0E5E0] bg-[#FFF9F5]">
              <h3 className="font-medium text-[#16060E] mb-1">{item.q}</h3>
              <p className="text-xs text-[#886A75]">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
