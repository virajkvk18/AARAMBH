"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Landmark,
  Building,
  Factory,
  Flame,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { loginAsApplicant, loginAsOfficer, loginWithDigiLocker } = useAuth();

  const [activeRole, setActiveRole] = useState<"applicant" | "officer">("applicant");
  const [email, setEmail] = useState("investor@smartelectronics.in");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [officerDept, setOfficerDept] = useState("MIDC Industrial Clearances");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (activeRole === "applicant") {
      loginAsApplicant(
        email,
        "Sanjay Deshmukh",
        "Smart Electronics Maharashtra Ltd"
      );
    } else {
      loginAsOfficer(email, officerDept);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1728] bg-topo-pattern py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Top Left Branding */}
      <div className="w-full max-w-6xl mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#060D17] border border-slate-700 flex items-center justify-center shadow-inner">
            <div className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-[#00A859]"></span>
              <span className="w-3 h-3 rounded-full bg-white"></span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white font-sans">
              AARAMBH
            </span>
            <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
              Govt. of Maharashtra Single Window
            </span>
          </div>
        </Link>

        {/* Quick Role Toggle */}
        <div className="flex items-center bg-[#0E2038] p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setActiveRole("applicant")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRole === "applicant"
                ? "bg-[#00A859] text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Investor Login
          </button>
          <button
            type="button"
            onClick={() => setActiveRole("officer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRole === "officer"
                ? "bg-amber-500 text-[#0B1728] shadow-sm font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Dept. Officer
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Card (Matching Image 1: media_1788757339327.png) */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-700 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: White Sign In Form */}
        <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            <h1 className="text-3xl font-black text-[#0B1728] tracking-tight">
              Sign In
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              To access your dashboard and apply for approvals.
            </p>

            {/* Officer Dept Selector if Officer */}
            {activeRole === "officer" && (
              <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                  Department Authority
                </label>
                <select
                  value={officerDept}
                  onChange={(e) => setOfficerDept(e.target.value)}
                  className="w-full bg-white text-xs font-bold text-slate-800 p-2 rounded-lg border border-amber-300 focus:outline-none"
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
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@enterprise.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#00A859] focus:ring-2 focus:ring-[#00A859]/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#00A859] focus:ring-2 focus:ring-[#00A859]/20 focus:outline-none transition-all pr-10"
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

              {/* Action Buttons: Sign In (Orange) & Forgot Password */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => alert("Password reset instructions have been sent to your registered email.")}
                  className="text-xs font-bold text-[#1E40AF] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </form>

            {/* Fast Track DigiLocker Option for Applicants */}
            {activeRole === "applicant" && (
              <div className="mt-6 pt-5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={loginWithDigiLocker}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#006699]" />
                  <span>Login with DigiLocker Account</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Cream Strip (Image 1) */}
          <div className="mt-8 -mx-8 sm:-mx-12 -mb-8 sm:-mb-12 p-4 bg-[#FFFBEB] border-t border-amber-200/80 text-center">
            <span className="text-xs text-slate-700">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-bold text-[#D97706] hover:underline ml-1">
                Sign Up Now
              </Link>
            </span>
          </div>
        </div>

        {/* Right Side: Navy Showcase (Image 1: Ministries & State Regulatory Seals) */}
        <div className="lg:col-span-7 bg-[#0E2038] bg-topo-pattern text-white p-8 sm:p-12 flex flex-col justify-between border-l border-slate-800">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              We have
            </h2>
            <div className="flex items-center space-x-2 mt-1 text-sm font-bold">
              <span className="text-[#FFB800]">36 Districts</span>
              <span className="text-slate-500">∿</span>
              <span className="text-[#00A859]">18 State Regulatory Departments</span>
            </div>

            {/* Grid of Official Maharashtra Regulatory Authorities */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/80 flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                  MH
                </div>
                <div>
                  <p className="font-bold text-white">Govt. of Maharashtra</p>
                  <p className="text-[9px] text-slate-400">Industries Dept.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/80 flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                  MIDC
                </div>
                <div>
                  <p className="font-bold text-white">MIDC Corporation</p>
                  <p className="text-[9px] text-slate-400">Land & Estate</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/80 flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs">
                  MPCB
                </div>
                <div>
                  <p className="font-bold text-white">MPCB Pollution Board</p>
                  <p className="text-[9px] text-slate-400">Environmental CTE/CTO</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/80 flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-xs">
                  FIRE
                </div>
                <div>
                  <p className="font-bold text-white">Fire Services</p>
                  <p className="text-[9px] text-slate-400">Provisional NOC</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/80 flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                  DISH
                </div>
                <div>
                  <p className="font-bold text-white">DISH Safety</p>
                  <p className="text-[9px] text-slate-400">Factory License</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/80 flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                  MSEDCL
                </div>
                <div>
                  <p className="font-bold text-white">MSEDCL Power</p>
                  <p className="text-[9px] text-slate-400">Grid Connectivity</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/80 flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  WATER
                </div>
                <div>
                  <p className="font-bold text-white">Water Resources</p>
                  <p className="text-[9px] text-slate-400">Bulk Water Quota</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/80 flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
                  FDA
                </div>
                <div>
                  <p className="font-bold text-white">FDA Maharashtra</p>
                  <p className="text-[9px] text-slate-400">Pharma & Food</p>
                </div>
              </div>
            </div>

            {/* Interlinked National Single Window Banner */}
            <div className="mt-8 p-4 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-5 h-5 text-[#00A859] shrink-0" />
                <p className="text-xs text-slate-300">
                  Interlinked with <strong className="text-white">National Single Window System (NSWS)</strong> & DigiLocker for instant CIN/PAN pre-population.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Toll-Free Support: 1800-120-8040</span>
            <span>Government of Maharashtra</span>
          </div>
        </div>
      </div>
    </div>
  );
}
