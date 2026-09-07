import React from "react";
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

export default function Footer() {
  return (
    <footer className="bg-[#0B1728] text-slate-300 border-t border-slate-800 text-sm">
      {/* Top Banner: Quick Single-Window Assurance */}
      <div className="bg-[#060D17] border-b border-slate-800/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-[#00A859] shrink-0" />
              <span>
                <strong className="text-white">Deemed Approval Guarantee</strong>: Time-bound clearance enforcement under the Maharashtra Right to Public Services Act.
              </span>
            </div>
            <div className="flex items-center space-x-4 text-slate-400">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00A859] animate-pulse"></span>
                <span className="text-slate-300 font-medium">Gateway Status: All Systems Operational</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Footer Grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: AARAMBH Single Window Portal Identity */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#060D17] border border-slate-700 flex items-center justify-center shadow-inner">
                <div className="flex items-center space-x-1">
                  <span className="w-3 h-3 rounded-full bg-[#00A859]"></span>
                  <span className="w-3 h-3 rounded-full bg-white"></span>
                </div>
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white block">
                  AARAMBH
                </span>
                <span className="text-[10px] font-medium text-amber-400 block tracking-wide uppercase">
                  Govt. of Maharashtra Single Window
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated single-window investment clearance gateway orchestrating statutory approvals across MIDC, MPCB, DISH, Fire Services, and Energy utilities.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-300 pt-1">
              <ShieldCheck className="w-4 h-4 text-[#00A859]" />
              <span>DigiLocker & National Single Window Interlinked</span>
            </div>
          </div>

          {/* Column 2: Organization & Services */}
          <div>
            <h3 className="text-white font-bold text-xs tracking-wider uppercase mb-4 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Quick Services</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB800]"></span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Know Your Approvals (KYA Wizard)
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Document Vault (AI & DigiLocker)
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Multi-Department DAG Orchestrator
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Statutory SLA & Deemed Tracker
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Package Scheme of Incentives (PSI 2019)
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Investor Grievance Redressal Desk
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Others & Policies */}
          <div>
            <h3 className="text-white font-bold text-xs tracking-wider uppercase mb-4 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Policies & Acts</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A859]"></span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Maharashtra Right to Public Services Act
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Maharashtra Industrial Policy
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Terms of Service & Data Privacy
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Hyperlinking & Copyright Policy
                </span>
              </li>
              <li>
                <a
                  href="https://www.nsws.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-slate-400 hover:text-amber-300 transition-colors"
                >
                  <span>National Single Window System (NSWS)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Government of Maharashtra Contact Block */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xs tracking-wider uppercase border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Contact Desk</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB800]"></span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Industries & Skill Development Department, 3rd Floor, Mantralaya, Madam Cama Road, Mumbai - 400032.
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#00A859] shrink-0" />
                <span>Toll-Free Helpline: <strong className="text-amber-300 font-mono">1800-120-8040</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>support.aarambh@maharashtra.gov.in</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright and Legal Bar */}
      <div className="bg-[#060D17] border-t border-slate-800/90 py-4">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>
            © 2026 AARAMBH Single Window Portal. Government of Maharashtra. All Rights Reserved.
          </p>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Last Updated: September 2026</span>
            <span className="text-slate-600">|</span>
            <span className="text-[#00A859] font-medium">Security Audited (CERT-In Empanelled)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
