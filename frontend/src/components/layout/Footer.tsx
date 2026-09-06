import React from "react";
import Link from "next/link";
import {
  MapPin,
  Mail,
  Phone,
  ShieldAlert,
  ExternalLink,
  Building,
  CheckCircle2,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-slate-300 border-t border-slate-800 text-sm">
      {/* Top Banner: Quick Single-Window Assurance */}
      <div className="bg-[#1E293B] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Deemed Approval Guarantee</strong>: In-principle statutory timelines enforced under Maharashtra Right to Public Services Act.
              </span>
            </div>
            <div className="flex items-center space-x-4 text-slate-400">
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>System Status: Fully Operational</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
          {/* Column 1: Organization */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4 border-b border-slate-700/60 pb-2">
              Organization
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="hover:text-indigo-400 transition-colors">
                  About AARAMBH Single Window
                </Link>
              </li>
              <li>
                <Link href="/user-guide" className="hover:text-indigo-400 transition-colors">
                  Investor User Guide & Manual
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-indigo-400 transition-colors">
                  Frequently Asked Questions (FAQs)
                </Link>
              </li>
              <li>
                <Link href="/grievance" className="hover:text-indigo-400 transition-colors">
                  Grievance Redressal & Support
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-400 transition-colors">
                  Contact Department Officers
                </Link>
              </li>
              <li>
                <Link href="/act-rules" className="hover:text-indigo-400 transition-colors">
                  Industrial Policies & Acts
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Others */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4 border-b border-slate-700/60 pb-2">
              Others & Policies
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/terms" className="hover:text-indigo-400 transition-colors">
                  Terms of Service & Usage
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-400 transition-colors">
                  Privacy Policy & Data Security
                </Link>
              </li>
              <li>
                <Link href="/hyperlinking-policy" className="hover:text-indigo-400 transition-colors">
                  Hyperlinking Policy
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="hover:text-indigo-400 transition-colors">
                  Copyright & Intellectual Property
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="hover:text-indigo-400 transition-colors">
                  Portal Sitemap
                </Link>
              </li>
              <li>
                <a
                  href="https://www.nsws.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-indigo-400 transition-colors text-slate-400"
                >
                  <span>National Single Window System (NSWS)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Government Address Block with Emblem Placeholders */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm tracking-wider uppercase border-b border-slate-700/60 pb-2">
              Government of Maharashtra
            </h3>

            {/* Emblem / Department Badges */}
            <div className="flex items-center space-x-3 pt-1">
              {/* State Emblem Placeholder */}
              <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700 rounded-lg p-2">
                <div className="w-9 h-9 rounded-md bg-[#0F172A] border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400">
                  <Building className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-[11px] leading-tight text-slate-300">
                  <span className="font-semibold text-white block">Govt. of Maharashtra</span>
                  <span className="text-slate-400">Dept. of Skills & Innovation</span>
                </div>
              </div>

              {/* DPIIT / National Badge Placeholder */}
              <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700 rounded-lg p-2">
                <div className="w-9 h-9 rounded-md bg-[#0F172A] border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400">
                  <Building className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-[11px] leading-tight text-slate-300">
                  <span className="font-semibold text-white block">DPIIT Aligned</span>
                  <span className="text-slate-400">Single Window Portal</span>
                </div>
              </div>
            </div>

            {/* Address & Official Contact */}
            <div className="space-y-2 text-xs text-slate-300 pt-2">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  3rd Floor, Mantralaya, Madam Cama Road, Nariman Point, Mumbai - 400032, Maharashtra, India.
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>+91-22-2202-7300 / Toll Free: 1800-120-8040</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>support.aarambh@maharashtra.gov.in</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright and Legal Bar */}
      <div className="bg-[#0A0F1D] border-t border-slate-800/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>
            © 2026 AARAMBH Single Window Clearance Portal. Designed & Maintained by Govt. of Maharashtra.
          </p>
          <div className="flex items-center space-x-4">
            <span>Last Updated: September 2026</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Security Audited (CERT-In Empanelled)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
