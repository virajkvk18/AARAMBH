"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const { loginAsApplicant, loginAsOfficer, loginWithDigiLocker } = useAuth();
  const { t } = useLanguage();

  const [activeRole, setActiveRole] = useState<"applicant" | "officer">("applicant");
  const [email, setEmail] = useState("investor@smartelectronics.in");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [officerDept, setOfficerDept] = useState("MIDC Industrial Clearances");
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (activeRole === "applicant") {
      loginAsApplicant(
        email,
        "Sanjay Deshmukh",
        "Maharashtra Solvents & Chemicals Pvt Ltd",
        {},
        redirectTo
      );
    } else {
      loginAsOfficer(
        email,
        officerDept,
        redirectTo.startsWith("/dashboard/officer") ? redirectTo : "/dashboard/officer-workspace"
      );
    }
  };

  const handleForgotPassword = () => {
    setResetNotice(`Password reset instructions and security OTP have been dispatched to ${email || "your registered email"}.`);
    setTimeout(() => {
      setResetNotice(null);
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-[#16060E] bg-topo-pattern py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Top Left Branding */}
      <div className="w-full max-w-6xl mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <img src="/aarambh-logo-new.png" alt="AARAMBH Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white font-sans">
              AARAMBH
            </span>
            <span className="text-[10px] font-semibold text-[#FFCA7C] uppercase tracking-wider">
              {t("topbar.portal_title", "Govt. of Maharashtra Single Window")}
            </span>
          </div>
        </Link>

        {/* Quick Role Toggle */}
        <div className="flex items-center bg-[#250C19] p-1 rounded-xl border border-[#521C35]">
          <button
            type="button"
            onClick={() => setActiveRole("applicant")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRole === "applicant"
                ? "bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white shadow-sm"
                : "text-[#C4A89C] hover:text-white"
            }`}
          >
            {t("auth.investor_login", "Investor Login")}
          </button>
          <button
            type="button"
            onClick={() => setActiveRole("officer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRole === "officer"
                ? "bg-[#FFCA7C] text-[#18080E] shadow-sm font-black"
                : "text-[#C4A89C] hover:text-white"
            }`}
          >
            {t("auth.officer_login", "Dept. Officer")}
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Card */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-[#36101E] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: White Sign In Form */}
        <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            <h1 className="text-3xl font-black text-[#18080E] tracking-tight">
              {t("auth.sign_in", "Sign In")}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {t("auth.sign_in_sub", "To access your dashboard and apply for approvals.")}
            </p>

            {/* Officer Dept Selector if Officer */}
            {activeRole === "officer" && (
              <div className="mt-5 p-3 rounded-xl bg-[#FFF2DF] border border-[#FED17A]">
                <label className="block text-[11px] font-bold text-[#9B2A48] uppercase tracking-wider mb-1">
                  Department Authority
                </label>
                <select
                  value={officerDept}
                  onChange={(e) => setOfficerDept(e.target.value)}
                  className="w-full bg-white text-xs font-bold text-slate-800 p-2 rounded-lg border border-[#FED17A] focus:outline-none"
                >
                  <option value="MIDC Industrial Clearances">MIDC (Land & Building Plan)</option>
                  <option value="MPCB Environmental Cell">MPCB (Pollution Control Board)</option>
                  <option value="Maharashtra Fire Directorate">State Fire Services</option>
                  <option value="Directorate of Industrial Safety (DISH)">DISH (Factory Licensing)</option>
                </select>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("auth.email", "Email Address")}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@enterprise.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#FE7251] focus:ring-2 focus:ring-[#FE7251]/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("auth.password", "Password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#FE7251] focus:ring-2 focus:ring-[#FE7251]/20 focus:outline-none transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons: Sign In (Coral/Burgundy Gradient) & Forgot Password */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#82213B] hover:to-[#E85E3E] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
                >
                  {t("auth.sign_in", "Sign In")}
                </button>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-bold text-[#9B2A48] hover:text-[#FE7251] hover:underline cursor-pointer"
                >
                  {t("auth.forgot_password", "Forgot Password?")}
                </button>
              </div>

              {resetNotice && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resetNotice}</span>
                </div>
              )}
            </form>

            {/* Fast Track DigiLocker Option for Applicants */}
            {activeRole === "applicant" && (
              <div className="mt-6 pt-5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => loginWithDigiLocker(redirectTo)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#FE7251]" />
                  <span>{t("auth.digilocker_login", "Login with DigiLocker Account")}</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Warm Sand Strip */}
          <div className="mt-8 -mx-8 sm:-mx-12 -mb-8 sm:-mb-12 p-4 bg-[#FFF7F0] border-t border-[#F0E5E0] text-center">
            <span className="text-xs text-slate-700">
              {t("auth.no_account", "Don't have an account?")}{" "}
              <Link href="/signup" className="font-bold text-[#FE7251] hover:underline ml-1">
                {t("auth.signup_now", "Sign Up Now")}
              </Link>
            </span>
          </div>
        </div>

        {/* Right Side: Deep Burgundy Showcase */}
        <div className="lg:col-span-7 bg-[#190710] bg-topo-pattern text-white p-8 sm:p-12 flex flex-col justify-between border-l border-[#36101E]">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              We have
            </h2>
            <div className="flex items-center space-x-2 mt-1 text-sm font-bold">
              <span className="text-[#FFCA7C]">36 Districts</span>
              <span className="text-[#521C35]">∿</span>
              <span className="text-[#FE7251]">18 State Regulatory Departments</span>
            </div>

            {/* Grid of Official Maharashtra Regulatory Authorities */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
              <div className="p-3 rounded-xl bg-[#250C19]/80 border border-[#521C35] flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#FFCA7C]/20 text-[#FFCA7C] flex items-center justify-center font-bold text-xs">
                  MH
                </div>
                <div>
                  <p className="font-bold text-white">Govt. of Maharashtra</p>
                  <p className="text-[9px] text-[#C4A89C]">Industries Dept.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#250C19]/80 border border-[#521C35] flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#FE7251]/20 text-[#FE7251] flex items-center justify-center font-bold text-xs">
                  MIDC
                </div>
                <div>
                  <p className="font-bold text-white">MIDC Corporation</p>
                  <p className="text-[9px] text-[#C4A89C]">Land & Estate</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#250C19]/80 border border-[#521C35] flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#9B2A48]/40 text-[#FFCA7C] flex items-center justify-center font-bold text-xs">
                  MPCB
                </div>
                <div>
                  <p className="font-bold text-white">MPCB Pollution Board</p>
                  <p className="text-[9px] text-[#C4A89C]">Environmental CTE/CTO</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#250C19]/80 border border-[#521C35] flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#FE7251]/20 text-[#FE7251] flex items-center justify-center font-bold text-xs">
                  FIRE
                </div>
                <div>
                  <p className="font-bold text-white">Fire Services</p>
                  <p className="text-[9px] text-[#C4A89C]">Provisional NOC</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#250C19]/80 border border-[#521C35] flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#9B2A48]/40 text-[#FFCA7C] flex items-center justify-center font-bold text-xs">
                  DISH
                </div>
                <div>
                  <p className="font-bold text-white">DISH Safety</p>
                  <p className="text-[9px] text-[#C4A89C]">Factory License</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#250C19]/80 border border-[#521C35] flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#FFCA7C]/20 text-[#FFCA7C] flex items-center justify-center font-bold text-xs">
                  MSEDCL
                </div>
                <div>
                  <p className="font-bold text-white">MSEDCL Power</p>
                  <p className="text-[9px] text-[#C4A89C]">Grid Connectivity</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#250C19]/80 border border-[#521C35] flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#FE7251]/20 text-[#FE7251] flex items-center justify-center font-bold text-xs">
                  WATER
                </div>
                <div>
                  <p className="font-bold text-white">Water Resources</p>
                  <p className="text-[9px] text-[#C4A89C]">Bulk Water Quota</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#250C19]/80 border border-[#521C35] flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#9B2A48]/40 text-[#FFCA7C] flex items-center justify-center font-bold text-xs">
                  FDA
                </div>
                <div>
                  <p className="font-bold text-white">FDA Maharashtra</p>
                  <p className="text-[9px] text-[#C4A89C]">Pharma & Food</p>
                </div>
              </div>
            </div>

            {/* Interlinked National Single Window Banner */}
            <div className="mt-8 p-4 rounded-2xl bg-[#250C19]/90 border border-[#521C35] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-5 h-5 text-[#FE7251] shrink-0" />
                <p className="text-xs text-[#EFE4DC]">
                  Interlinked with <strong className="text-white">National Single Window System (NSWS)</strong> & DigiLocker for instant CIN/PAN pre-population.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#36101E] text-[11px] text-[#C4A89C] flex items-center justify-between">
            <span>Toll-Free Support: 1800-120-8040</span>
            <span>Government of Maharashtra</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#16060E] flex items-center justify-center text-white">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
