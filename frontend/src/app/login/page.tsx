"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Mail,
  Lock,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { loginAsApplicant, loginAsOfficer, loginWithDigiLocker } = useAuth();

  const [activeTab, setActiveTab] = useState<"business" | "officer">("business");

  // Business User State
  const [businessIdentifier, setBusinessIdentifier] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");

  // Officer State
  const [officerEmail, setOfficerEmail] = useState("");
  const [officerPassword, setOfficerPassword] = useState("");
  const [officerDept, setOfficerDept] = useState("MIDC Industrial Clearances");

  // Handlers
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessIdentifier.trim()) return;
    setOtpSent(true);
    setOtpError("");
    setOtpValue("123456"); // Pre-fill mock OTP for smooth demo experience
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.trim() !== "123456" && otpValue.trim().length < 4) {
      setOtpError("Invalid OTP. Please enter 123456 for testing.");
      return;
    }
    loginAsApplicant(
      businessIdentifier.includes("@") ? businessIdentifier : `${businessIdentifier}@enterprise.in`,
      "Mahesh Deshmukh",
      "Deshmukh Precision Engineering Ltd"
    );
  };

  const handleOfficerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerEmail.trim() || !officerPassword.trim()) return;
    loginAsOfficer(officerEmail, officerDept);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      {/* Top Identity Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0F172A] border border-slate-700 text-white font-black text-2xl shadow-md mb-3 text-indigo-400">
          आ
        </div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
          AARAMBH Single Window Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Dept. of Skills, Employment, Entrepreneurship & Innovation, Govt. of Maharashtra
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Tab Switcher (Business User vs Officer Login) */}
        <div className="flex border-b border-slate-200 bg-slate-50/80">
          <button
            type="button"
            onClick={() => {
              setActiveTab("business");
              setOtpSent(false);
            }}
            className={`flex-1 py-3.5 px-4 text-center text-xs sm:text-sm font-bold transition-colors border-b-2 flex items-center justify-center space-x-2 ${
              activeTab === "business"
                ? "border-[#4F46E5] text-[#4F46E5] bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Business User Login</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("officer")}
            className={`flex-1 py-3.5 px-4 text-center text-xs sm:text-sm font-bold transition-colors border-b-2 flex items-center justify-center space-x-2 ${
              activeTab === "officer"
                ? "border-[#4F46E5] text-[#4F46E5] bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Department Officer Login</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* BUSINESS USER TAB */}
          {activeTab === "business" && (
            <div className="space-y-6">
              {/* Fast-Track DigiLocker Login Button */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    // TODO: replace with real DigiLocker OAuth flow
                    loginWithDigiLocker();
                  }}
                  className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-900 font-bold text-sm shadow-xs transition-all duration-150 group cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-md bg-[#006699] text-white flex items-center justify-center font-black text-xs">
                    DL
                  </div>
                  <span>Instant Login via DigiLocker</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-200/70 text-blue-900 uppercase">
                    Verified
                  </span>
                </button>
              </div>

              {/* Separator */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">
                  or email / mobile otp
                </span>
                <div className="border-t border-slate-200 w-full"></div>
              </div>

              {/* OTP Flow */}
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label
                      htmlFor="businessIdentifier"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Registered Email or Mobile Number
                    </label>
                    <div className="relative rounded-lg shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="businessIdentifier"
                        type="text"
                        required
                        value={businessIdentifier}
                        onChange={(e) => setBusinessIdentifier(e.target.value)}
                        placeholder="investor@enterprise.com or 9876543210"
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      An OTP will be dispatched to your registered contact details.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all duration-150 cursor-pointer"
                  >
                    <span>Send Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">OTP Sent Successfully</p>
                      <p className="text-emerald-700 text-[11px] mt-0.5">
                        Dispatched to <strong>{businessIdentifier}</strong>. For demonstration, use demo code: <strong>123456</strong>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="otpValue"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Enter 6-Digit OTP
                    </label>
                    <div className="relative rounded-lg shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        id="otpValue"
                        type="text"
                        maxLength={6}
                        required
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                        placeholder="123456"
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 tracking-widest font-mono font-bold placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    {otpError && (
                      <p className="mt-1 text-xs text-rose-600 font-medium flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{otpError}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-slate-500 hover:text-slate-800 underline"
                    >
                      Change Contact
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpValue("123456");
                        alert("Mock OTP re-sent: 123456");
                      }}
                      className="text-[#4F46E5] font-semibold hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all duration-150 cursor-pointer"
                  >
                    <span>Verify & Login to Investor Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Sign Up Footer Link */}
              <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
                New Investor on AARAMBH?{" "}
                <Link
                  href="/signup"
                  className="font-bold text-[#4F46E5] hover:underline"
                >
                  Create Business Account
                </Link>
              </div>
            </div>
          )}

          {/* OFFICER TAB */}
          {activeTab === "officer" && (
            <form onSubmit={handleOfficerLogin} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Authorized Personnel Only:</strong> Access restricted to verified department officers (MIDC, MPCB, Fire, DISH, Energy).
                </span>
              </div>

              <div>
                <label
                  htmlFor="officerDept"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Department / Authority
                </label>
                <select
                  id="officerDept"
                  value={officerDept}
                  onChange={(e) => setOfficerDept(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="MIDC Industrial Clearances">MIDC - Industrial Land & Planning</option>
                  <option value="MPCB Environmental Board">MPCB - Maharashtra Pollution Control Board</option>
                  <option value="State Directorate of Fire Services">State Directorate of Fire & Emergency Services</option>
                  <option value="DISH Directorate of Industrial Safety">DISH - Factory & Boiler Safety</option>
                  <option value="MSEDCL Energy Distribution">MSEDCL - Power Feasibility</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="officerEmail"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Official Govt Email ID
                </label>
                <div className="relative rounded-lg shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="officerEmail"
                    type="email"
                    required
                    value={officerEmail}
                    onChange={(e) => setOfficerEmail(e.target.value)}
                    placeholder="officer.name@maharashtra.gov.in"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="officerPassword"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Security Password
                </label>
                <div className="relative rounded-lg shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="officerPassword"
                    type="password"
                    required
                    value={officerPassword}
                    onChange={(e) => setOfficerPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-sm shadow-md transition-all duration-150 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Secure Officer Login</span>
              </button>
            </form>
          )}
        </div>

        {/* Card Footer Security Note */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>256-Bit SSL Encrypted Session</span>
          </span>
          <Link href="/helpdesk" className="text-indigo-600 hover:underline">
            Need Help Logging In?
          </Link>
        </div>
      </div>
    </div>
  );
}
