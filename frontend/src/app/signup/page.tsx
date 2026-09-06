"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Mail,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  CreditCard,
  FileBadge2,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { loginAsApplicant, loginWithDigiLocker } = useAuth();

  const [enterpriseName, setEnterpriseName] = useState("");
  const [signatoryName, setSignatoryName] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [sector, setSector] = useState("Manufacturing & Engineering");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enterpriseName || !signatoryName || !email) return;

    loginAsApplicant(email, signatoryName, enterpriseName);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      {/* Top Identity Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0F172A] border border-slate-700 text-white font-black text-2xl shadow-md mb-3 text-indigo-400">
          आ
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          New Investor Registration
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Create your verified Single Window Common Investor Profile for seamless clearances in Maharashtra.
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* DigiLocker Fast Track Banner */}
        <div className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-b border-blue-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#006699] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                DL
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-blue-950">
                  Fast-Track with DigiLocker
                </h4>
                <p className="text-[11px] text-blue-800">
                  Auto-fill enterprise details, PAN, and Aadhaar identity in seconds.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                // TODO: replace with real DigiLocker OAuth flow
                loginWithDigiLocker();
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#006699] hover:bg-[#005580] text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              Sign Up via DigiLocker
            </button>
          </div>
        </div>

        {/* Standard Manual Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Enterprise Name */}
            <div className="sm:col-span-2">
              <label
                htmlFor="enterpriseName"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Enterprise / Company Legal Name *
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  id="enterpriseName"
                  type="text"
                  required
                  value={enterpriseName}
                  onChange={(e) => setEnterpriseName(e.target.value)}
                  placeholder="e.g. Maharashtra Precision Auto Parts Pvt Ltd"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Authorized Signatory */}
            <div>
              <label
                htmlFor="signatoryName"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Authorized Signatory *
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  id="signatoryName"
                  type="text"
                  required
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  placeholder="e.g. Rajesh Patil"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Enterprise PAN */}
            <div>
              <label
                htmlFor="panNumber"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Enterprise PAN *
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  id="panNumber"
                  type="text"
                  maxLength={10}
                  required
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 uppercase font-mono placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Official Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Official Email Address *
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@enterprise.com"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label
                htmlFor="mobile"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Mobile Number (for OTP) *
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <input
                  id="mobile"
                  type="tel"
                  maxLength={10}
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Sector / Industry */}
            <div className="sm:col-span-2">
              <label
                htmlFor="sector"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Industry Sector
              </label>
              <select
                id="sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Manufacturing & Engineering">Manufacturing & Engineering</option>
                <option value="Chemicals & Pharmaceuticals">Chemicals & Pharmaceuticals</option>
                <option value="Information Technology & ITES">Information Technology & ITES</option>
                <option value="Food Processing & Agro-tech">Food Processing & Agro-tech</option>
                <option value="Textiles & Garments">Textiles & Garments</option>
                <option value="Automobile & EV Components">Automobile & EV Components</option>
                <option value="Renewable Energy & Power">Renewable Energy & Power</option>
              </select>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start space-x-2 pt-2">
            <input
              id="agreeTerms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <label htmlFor="agreeTerms" className="text-xs text-slate-600 leading-snug">
              I agree to the{" "}
              <span className="text-slate-600">Terms of Service</span>{" "}
              and declare that all details provided are accurate under the Maharashtra Industrial Single Window Act.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!agreeTerms}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] disabled:bg-slate-300 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all duration-150 cursor-pointer"
          >
            <span>Register & Continue to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Existing Account Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 text-center text-xs text-slate-600">
          Already registered on AARAMBH or NSWS?{" "}
          <Link href="/login" className="font-bold text-[#4F46E5] hover:underline">
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
}
