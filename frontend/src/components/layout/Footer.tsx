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
  Award,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#14050B] text-[#E0C7BC] border-t border-[#36101E] text-sm">
      {/* Top Banner: Quick Single-Window Assurance */}
      <div className="bg-[#0D0307] border-b border-[#2D0D19]">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2 text-[#EFE4DC]">
              <CheckCircle2 className="w-4 h-4 text-[#FE7251] shrink-0" />
              <span>
                <strong className="text-white font-semibold">Deemed Approval Guarantee</strong>: Time-bound clearance enforcement under the Maharashtra Right to Public Services Act.
              </span>
            </div>
            <div className="flex items-center space-x-4 text-[#C4A89C]">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FE7251] animate-pulse"></span>
                <span className="text-[#FFE8DE] font-medium">Gateway Status: All Systems Operational</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Footer Grid */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: AARAMBH Single Window Portal Identity */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/aarambh-logo-new.png" alt="AARAMBH Logo" className="w-10 h-10 object-contain" />
              <div>
                <span className="text-lg font-black tracking-tight text-white block">
                  AARAMBH
                </span>
                <span className="text-[10px] font-semibold text-[#FFCA7C] block tracking-wide uppercase">
                  {t("nav.portal_sub")}
                </span>
              </div>
            </div>
            <p className="text-xs text-[#C4A89C] leading-relaxed">
              {t("footer.desc")}
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#FFE8DE] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#FE7251]" />
              <span>DigiLocker & National Single Window Interlinked</span>
            </div>
          </div>

          {/* Column 2: Organization & Services */}
          <div>
            <h3 className="text-white font-bold text-xs tracking-wider uppercase mb-4 border-b border-[#36101E] pb-2 flex items-center justify-between">
              <span>Quick Services</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FE7251]"></span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard/kya" className="text-[#C4A89C] hover:text-[#FFCA7C] transition-colors block">
                  Know Your Approvals (KYA Wizard)
                </Link>
              </li>
              <li>
                <Link href="/dashboard/vault" className="text-[#C4A89C] hover:text-[#FFCA7C] transition-colors block">
                  Document Vault & DigiLocker
                </Link>
              </li>
              <li>
                <Link href="/dashboard/dag" className="text-[#C4A89C] hover:text-[#FFCA7C] transition-colors block">
                  Multi-Department DAG Orchestrator
                </Link>
              </li>
              <li>
                <Link href="/dashboard/sla" className="text-[#C4A89C] hover:text-[#FFCA7C] transition-colors block">
                  Statutory SLA & Deemed Tracker
                </Link>
              </li>
              <li>
                <Link href="/dashboard/kya" className="text-[#C4A89C] hover:text-[#FFCA7C] transition-colors block">
                  Package Scheme of Incentives (PSI 2019)
                </Link>
              </li>
              <li>
                <Link href="/dashboard/grievances" className="text-[#C4A89C] hover:text-[#FFCA7C] transition-colors block">
                  Investor Grievance Redressal Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Others & Policies */}
          <div>
            <h3 className="text-white font-bold text-xs tracking-wider uppercase mb-4 border-b border-[#36101E] pb-2 flex items-center justify-between">
              <span>Policies & Acts</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFCA7C]"></span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard/sla" className="text-[#C4A89C] hover:text-[#FFCA7C] transition-colors block">
                  Maharashtra Right to Public Services Act
                </Link>
              </li>
              <li>
                <Link href="/dashboard/kya" className="text-[#C4A89C] hover:text-[#FFCA7C] transition-colors block">
                  Maharashtra Industrial Policy (PSI 2019)
                </Link>
              </li>
              <li>
                <Link href="/dashboard/vault" className="text-[#C4A89C] hover:text-[#FFCA7C] transition-colors block">
                  Terms of Service & Data Privacy
                </Link>
              </li>
              <li>
                <Link href="/dashboard/grievances" className="text-[#C4A89C] hover:text-[#FFCA7C] transition-colors block">
                  Hyperlinking & Grievance Policy
                </Link>
              </li>
              <li>
                <a
                  href="https://www.nsws.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-[#C4A89C] hover:text-[#FFCA7C] transition-colors"
                >
                  <span>National Single Window System (NSWS)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Government of Maharashtra Contact Block */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xs tracking-wider uppercase border-b border-[#36101E] pb-2 flex items-center justify-between">
              <span>Contact Desk</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FE7251]"></span>
            </h3>

            <div className="space-y-2.5 text-xs text-[#EFE4DC]">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#FFCA7C] shrink-0 mt-0.5" />
                <span>
                  Industries & Skill Development Department, 3rd Floor, Mantralaya, Madam Cama Road, Mumbai - 400032.
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#FE7251] shrink-0" />
                <span>
                  Toll-Free Helpline:{" "}
                  <a href="tel:18001208040" className="text-[#FFCA7C] font-mono hover:underline font-bold">
                    1800-120-8040
                  </a>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#FFCA7C] shrink-0" />
                <a href="mailto:support.aarambh@maharashtra.gov.in" className="hover:text-[#FFCA7C] hover:underline">
                  support.aarambh@maharashtra.gov.in
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright and Legal Bar */}
      <div className="bg-[#0D0307] border-t border-[#2D0D19] py-4">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#C4A89C]">
          <p>
            © 2026 AARAMBH Single Window Portal. Government of Maharashtra. All Rights Reserved.
          </p>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Last Updated: September 2026</span>
            <span className="text-[#521C35]">|</span>
            <span className="text-[#FE7251] font-medium">Security Audited (CERT-In Empanelled)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
