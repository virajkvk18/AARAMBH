"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      {/* Top Banner: Single-Window Statutory Guarantee */}
      <div className="bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-[#FE7251] shrink-0" />
              <span>
                <strong className="text-white font-semibold">{t("footer.enforcement_title", "Statutory SLA Enforcement")}</strong>: {t("footer.enforcement_desc", "Clearances governed by the Maharashtra Right to Public Services Act, 2015 with deemed approval provisions.")}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-slate-400">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-200 font-medium">{t("footer.state_gateway", "State Gateway: 100% Operational")}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Enterprise Footer Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: AARAMBH Identity */}
          <div className="lg:col-span-2 space-y-4 pr-0 lg:pr-6">
            <div className="flex items-center space-x-3">
              <Image src="/aarambh-logo-new.png" alt="AARAMBH Logo" width={36} height={36} className="w-9 h-9 object-contain" />
              <div>
                <span className="text-lg font-bold tracking-tight text-white block">
                  AARAMBH
                </span>
                <span className="text-[11px] font-medium text-slate-400 block tracking-wide uppercase">
                  {t("footer.sw_facilitation", "Single Window Industrial Facilitation")}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {t("footer.desc_full", "The unified digital gateway by the Government of Maharashtra for industrial planning, statutory clearances, common application processing, and verified government incentive schemes.")}
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-300 pt-1">
              <ShieldCheck className="w-4 h-4 text-[#FE7251]" />
              <span>{t("footer.digilocker_line", "Integrated with DigiLocker & National Single Window System")}</span>
            </div>

            {/* Language Selection */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                {t("footer.portal_language", "Portal Language:")}
              </span>
              <div className="inline-flex items-center bg-slate-800 border border-slate-700 rounded-md p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    language === "en"
                      ? "bg-[#FE7251] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("mr")}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    language === "mr"
                      ? "bg-[#FE7251] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  मराठी
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("hi")}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    language === "hi"
                      ? "bg-[#FE7251] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: For Businesses */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 border-b border-slate-800 pb-2">
              {t("footer.for_businesses", "For Businesses")}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard/kya" className="text-slate-400 hover:text-white transition-colors block">
                  {t("footer.plan_project", "Plan Your Project")}
                </Link>
              </li>
              <li>
                <Link href="/#approvals" className="text-slate-400 hover:text-white transition-colors block">
                  {t("footer.approvals_licences", "Approvals & Licences")}
                </Link>
              </li>
              <li>
                <Link href="/#incentives" className="text-slate-400 hover:text-white transition-colors block">
                  {t("footer.incentives_psi", "Incentives (PSI 2019)")}
                </Link>
              </li>
              <li>
                <Link href="/#compliance" className="text-slate-400 hover:text-white transition-colors block">
                  {t("footer.compliance", "Compliance & Readiness")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/sla" className="text-slate-400 hover:text-white transition-colors block">
                  {t("footer.track_applications", "Track Applications")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/caf" className="text-slate-400 hover:text-white transition-colors block">
                  {t("footer.common_app_form", "Common Application Form")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Government Departments */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 border-b border-slate-800 pb-2">
              {t("footer.statutory_bodies", "Statutory Bodies")}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://midcindia.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
                >
                  <span>{t("footer.midc", "MIDC Industrial Parks")}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://mpcb.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
                >
                  <span>{t("footer.mpcb", "MPCB Pollution Control")}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://mahafireservice.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
                >
                  <span>{t("footer.fire_services", "Maharashtra Fire Services")}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://dish.maharashtra.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
                >
                  <span>{t("footer.dish", "DISH Industrial Safety")}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.nsws.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
                >
                  <span>{t("footer.nsws", "National Single Window (NSWS)")}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Support & Grievances */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 border-b border-slate-800 pb-2">
              {t("footer.support_desk", "Support & Desk")}
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#FE7251] shrink-0 mt-0.5" />
                <span className="text-slate-400 leading-tight">
                  {t("footer.address", "Industries & Labour Department, Mantralaya, Mumbai - 400032.")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#FE7251] shrink-0" />
                <span className="text-slate-400">
                  {t("footer.toll_free", "Toll-Free:")}{" "}
                  <a href="tel:18001208040" className="text-slate-200 font-mono hover:underline font-semibold">
                    1800-120-8040
                  </a>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#FE7251] shrink-0" />
                <a href="mailto:support.aarambh@maharashtra.gov.in" className="text-slate-400 hover:text-white hover:underline truncate">
                  support.aarambh@maharashtra.gov.in
                </a>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard/grievances"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-medium text-[11px] transition-colors"
                >
                  {t("footer.grievance_desk", "Grievance & Dispute Desk")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="bg-slate-950 border-t border-slate-800/80 py-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>
            {t("footer.copyright", "© 2026 AARAMBH Single Window Industrial Facilitation Portal. Government of Maharashtra.")}
          </p>
          <div className="flex items-center space-x-4 text-[11px]">
            <span className="hover:text-white transition-colors cursor-default">{t("footer.accessibility", "Accessibility")}</span>
            <span className="text-slate-700">|</span>
            <span className="hover:text-white transition-colors cursor-default">{t("footer.privacy", "Privacy Policy")}</span>
            <span className="text-slate-700">|</span>
            <span className="hover:text-white transition-colors cursor-default">{t("footer.terms", "Terms of Use")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
