"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Building,
  CheckCircle2,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="bg-[#14050B] text-[#E0C7BC] border-t border-[#36101E] text-sm">
      {/* Top Banner: Single-Window Statutory Guarantee */}
      <div className="bg-[#0D0307] border-b border-[#2D0D19]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2 text-[#EFE4DC]">
              <CheckCircle2 className="w-4 h-4 text-[#FE7251] shrink-0" />
              <span>
                <strong className="text-white font-semibold">Statutory SLA Enforcement</strong>: Clearances governed by the Maharashtra Right to Public Services Act, 2015 with deemed approval provisions.
              </span>
            </div>
            <div className="flex items-center space-x-4 text-[#C4A89C]">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[#FFE8DE] font-medium">State Gateway: 100% Operational</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Enterprise Footer Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: AARAMBH Identity */}
          <div className="lg:col-span-2 space-y-4 pr-0 lg:pr-6">
            <div className="flex items-center space-x-3">
              <img src="/aarambh-logo-new.png" alt="AARAMBH Logo" className="w-10 h-10 object-contain" />
              <div>
                <span className="text-xl font-black tracking-tight text-white block">
                  AARAMBH
                </span>
                <span className="text-[11px] font-semibold text-[#FFCA7C] block tracking-wide uppercase">
                  Single Window Industrial Facilitation
                </span>
              </div>
            </div>
            <p className="text-xs text-[#C4A89C] leading-relaxed max-w-sm">
              The unified digital gateway by the Government of Maharashtra for industrial planning, statutory clearances, common application processing, and verified government incentive schemes.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#FFE8DE] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#FE7251]" />
              <span>Integrated with DigiLocker & National Single Window System</span>
            </div>

            {/* Language Selection */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                Portal Language:
              </span>
              <div className="inline-flex items-center bg-[#250C19] border border-[#FED17A]/30 rounded-lg p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                    language === "en"
                      ? "bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white"
                      : "text-[#C4A89C] hover:text-[#FFCA7C]"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("mr")}
                  className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                    language === "mr"
                      ? "bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white"
                      : "text-[#C4A89C] hover:text-[#FFCA7C]"
                  }`}
                >
                  मराठी
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("hi")}
                  className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                    language === "hi"
                      ? "bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white"
                      : "text-[#C4A89C] hover:text-[#FFCA7C]"
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: For Businesses */}
          <div>
            <h3 className="text-white font-bold text-xs tracking-wider uppercase mb-4 border-b border-[#36101E] pb-2 flex items-center justify-between">
              <span>For Businesses</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FE7251]"></span>
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/dashboard/kya" className="text-[#C4A89C] hover:text-[#FFCA7C] transition-colors block">
                  Plan Your Project
                </Link>
              </li>
              <li>
                <Link href="/#approvals" className="text-[#C4A89C] hover:text-[#FFCA7C] transition-colors block">
                  Approvals & Licences
                </Link>
              </li>
              <li>
                <Link href="/#incentives" className="text-[#C4A89C] hover:text-[#FFCA7C] transition-colors block">
                  Incentives (PSI 2019)
                </Link>
              </li>
              <li>
                <Link href="/#compliance" className="text-[#C4A89C] hover:text-[#FFCA7C] transition-colors block">
                  Compliance & Readiness
                </Link>
              </li>
              <li>
                <Link href="/dashboard/sla" className="text-[#C4A89C] hover:text-[#FFCA7C] transition-colors block">
                  Track Applications
                </Link>
              </li>
              <li>
                <Link href="/dashboard/caf" className="text-[#C4A89C] hover:text-[#FFCA7C] transition-colors block">
                  Common Application Form
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Government Departments */}
          <div>
            <h3 className="text-white font-bold text-xs tracking-wider uppercase mb-4 border-b border-[#36101E] pb-2 flex items-center justify-between">
              <span>Statutory Bodies</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFCA7C]"></span>
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="https://midcindia.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-[#C4A89C] hover:text-[#FFCA7C] transition-colors"
                >
                  <span>MIDC Industrial Parks</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://mpcb.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-[#C4A89C] hover:text-[#FFCA7C] transition-colors"
                >
                  <span>MPCB Pollution Control</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://mahafireservice.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-[#C4A89C] hover:text-[#FFCA7C] transition-colors"
                >
                  <span>Maharashtra Fire Services</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://dish.maharashtra.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-[#C4A89C] hover:text-[#FFCA7C] transition-colors"
                >
                  <span>DISH Industrial Safety</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.nsws.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-[#C4A89C] hover:text-[#FFCA7C] transition-colors"
                >
                  <span>National Single Window (NSWS)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Support & Grievances */}
          <div>
            <h3 className="text-white font-bold text-xs tracking-wider uppercase mb-4 border-b border-[#36101E] pb-2 flex items-center justify-between">
              <span>Support & Desk</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FE7251]"></span>
            </h3>

            <div className="space-y-3 text-xs text-[#EFE4DC]">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#FFCA7C] shrink-0 mt-0.5" />
                <span>
                  Industries & Labour Department, Mantralaya, Mumbai - 400032.
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#FE7251] shrink-0" />
                <span>
                  Toll-Free:{" "}
                  <a href="tel:18001208040" className="text-[#FFCA7C] font-mono hover:underline font-bold">
                    1800-120-8040
                  </a>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#FFCA7C] shrink-0" />
                <a href="mailto:support.aarambh@maharashtra.gov.in" className="hover:text-[#FFCA7C] hover:underline truncate">
                  support.aarambh@maharashtra.gov.in
                </a>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard/grievances"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#250C19] border border-[#521C35] text-[#FFCA7C] hover:text-white font-semibold text-[11px] transition-colors"
                >
                  Grievance & Dispute Desk
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="bg-[#0D0307] border-t border-[#2D0D19] py-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#C4A89C]">
          <p>
            © 2026 AARAMBH Single Window Industrial Facilitation Portal. Government of Maharashtra.
          </p>
          <div className="flex items-center space-x-4 text-[11px]">
            <Link href="/dashboard/sla" className="hover:text-white transition-colors">Accessibility</Link>
            <span className="text-[#521C35]">|</span>
            <Link href="/dashboard/vault" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-[#521C35]">|</span>
            <Link href="/dashboard/grievances" className="hover:text-white transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
