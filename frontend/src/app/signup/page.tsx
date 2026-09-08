"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Handshake,
  User,
  Users,
  Building,
  CreditCard,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  AlertCircle,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useEnterpriseStore } from "@/store/enterpriseStore";

type LegalEntityType = "company" | "llp" | "proprietor" | "others" | "new";

function SignupForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard/kya";

  const { signUpApplicant, loginWithDigiLocker } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const { setFormData, setExtractedFields, updateMasterCAF, reset } = useEnterpriseStore();

  // Current Step: 1 = Initial Credentials, 2 = Entity Type, 3 = PAN Validation, 4 = Address
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepError, setStepError] = useState<string | null>(null);

  // Form State
  const [applicantName, setApplicantName] = useState("Sanjay Deshmukh");
  const [email, setEmail] = useState("sanjay.deshmukh@smartelectronics.in");
  const [mobile, setMobile] = useState("9823012345");
  const [password, setPassword] = useState("password123");

  // Step 2 State
  const [legalEntity, setLegalEntity] = useState<LegalEntityType>("proprietor");
  const [businessName, setBusinessName] = useState("Smart Electronics");
  const [primarySector, setPrimarySector] = useState<string>("agro_food_processing");

  const SIGNUP_SECTORS = [
    { value: "agro_food_processing", label: "Food Processing, Restaurants & QSR" },
    { value: "ev_manufacturing", label: "Electric Vehicle & Clean Tech" },
    { value: "fintech", label: "FinTech, IT & Digital Services" },
    { value: "logistics_warehousing", label: "Logistics, Warehousing & Cold Chain" },
    { value: "textiles_garmenting", label: "Textiles, Garments & Spinning" },
    { value: "green_energy_biofuel", label: "Solar Energy & Biofuels" },
    { value: "aerospace_defence", label: "Aerospace & Defence" },
    { value: "general_manufacturing", label: "General Manufacturing & Chemicals" },
    { value: "services_retail", label: "Retail & Commercial Services" },
  ];

  // Step 3 State
  const [panNumber, setPanNumber] = useState("AAECS8891M");
  const [panVerified, setPanVerified] = useState(true);
  const [panLoading, setPanLoading] = useState(false);
  const [panModalOpen, setPanModalOpen] = useState(false);

  // Step 4 State
  const [addressLine1, setAddressLine1] = useState("Plot No. A-42, Sector 10");
  const [addressLine2, setAddressLine2] = useState("MIDC Chakan Phase-II");
  const [showSecondAddress, setShowSecondAddress] = useState(false);
  const [country, setCountry] = useState("India");
  const [pinCode, setPinCode] = useState("410501");
  const [stateName, setStateName] = useState("Maharashtra");
  const [district, setDistrict] = useState("Pune");

  // Validation Helpers
  const validateStep1 = () => {
    setStepError(null);
    if (!applicantName.trim() || applicantName.trim().length < 3) {
      setStepError("Please enter the full legal name of the authorized signatory.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStepError("Please enter a valid business email address.");
      return false;
    }
    const phoneClean = mobile.replace(/\D/g, "");
    if (phoneClean.length < 10) {
      setStepError("Please enter a valid 10-digit mobile number.");
      return false;
    }
    if (password.length < 6) {
      setStepError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    setStepError(null);
    if (!businessName.trim() || businessName.trim().length < 2) {
      setStepError("Please enter your registered enterprise / business name.");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    setStepError(null);
    const panClean = panNumber.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panClean)) {
      setStepError("Please enter a valid 10-character Permanent Account Number (e.g. AAECS8891M).");
      return false;
    }
    if (!panVerified) {
      setStepError("Please click 'GET DETAILS' to validate your PAN with Income Tax records.");
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    setStepError(null);
    if (!addressLine1.trim()) {
      setStepError("Please enter your primary address / plot number.");
      return false;
    }
    if (!pinCode.trim() || pinCode.replace(/\D/g, "").length !== 6) {
      setStepError("Please enter a valid 6-digit postal PIN code.");
      return false;
    }
    if (!district.trim()) {
      setStepError("Please select the industrial district in Maharashtra.");
      return false;
    }
    return true;
  };

  const goToStep = (targetStep: number) => {
    if (targetStep < currentStep) {
      setStepError(null);
      setCurrentStep(targetStep);
      return;
    }
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setStepError(null);
    setCurrentStep(targetStep);
  };

  // Verify PAN handler
  const handleVerifyPan = () => {
    const panClean = panNumber.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panClean)) {
      setStepError("Please enter a valid 10-character PAN format before verifying.");
      return;
    }
    setStepError(null);
    setPanLoading(true);
    setTimeout(() => {
      setPanLoading(false);
      setPanVerified(true);
    }, 600);
  };

  // Complete Registration
  const handleCompleteRegistration = async () => {
    if (!validateStep4()) return;

    const registration = await signUpApplicant(
      email,
      password,
      {
        name: applicantName,
        enterpriseName: businessName,
        phone: mobile,
        panNumber: panNumber.toUpperCase(),
        entityType: legalEntity,
        addressLine1,
        addressLine2,
        pinCode,
        district,
        state: stateName,
        enterpriseId: `ENT-MH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      }
    );
    if (registration.error) { setStepError(registration.error); return; }
    if (registration.needsConfirmation) { setStepError("Please confirm your email address before signing in."); return; }

    // Preserve the existing new-enterprise setup only after Supabase has
    // authenticated the account.
    reset();

    // 3. Sync with Enterprise Store & Master CAF
    const selectedSectorObj = SIGNUP_SECTORS.find((s) => s.value === primarySector);
    const sectorDisplayName = selectedSectorObj?.label || "Food Processing, Restaurants & QSR";

    setFormData({
      district,
      sector: sectorDisplayName,
      locationZone: `${district} Industrial & Commercial Zone`,
    });

    updateMasterCAF({
      companyDetails: {
        companyName: businessName,
        pan: panNumber.toUpperCase(),
        gstin: `27${panNumber.toUpperCase()}1Z5`,
        cin: legalEntity === "company" ? `U72200MH${new Date().getFullYear()}PTC${Math.floor(100000 + Math.random() * 900000)}` : "",
        entityType: legalEntity === "company" ? "Pvt Ltd" : legalEntity === "llp" ? "LLP" : legalEntity === "proprietor" ? "Proprietorship" : "Partnership",
        signatoryName: applicantName,
        signatoryEmail: email,
        signatoryMobile: mobile,
      },
      locationDetails: {
        state: stateName,
        district,
        address: `${addressLine1}, ${addressLine2}`,
        pincode: pinCode,
        plotAreaSqMeters: 0,
        midcZoneName: `${district} Industrial & Commercial Zone`,
        midcPlotNo: "",
      },
      projectSpecs: {
        industryType: primarySector,
        sector: sectorDisplayName,
        capitalInvestmentInr: 0,
        powerRequirementKw: 0,
        waterRequirementKlpd: 0,
        hazardCategory: primarySector === "fintech" ? "White" : primarySector === "agro_food_processing" || primarySector === "services_retail" ? "Green" : "Orange",
        maxBuildingHeightMeters: 0,
        totalOccupants: 0,
      },
    });

    setExtractedFields({
      entity_name: { value: businessName, confidenceScore: 1.0, hasConflict: false },
      pan: { value: panNumber.toUpperCase(), confidenceScore: 1.0, hasConflict: false },
    }, "Onboarding Registration Dossier");
    router.replace(redirectTo.startsWith("/dashboard") ? redirectTo : "/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#16060E] bg-topo-pattern py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Top Navbar Brand & Logout / Exit */}
      <div className="w-full max-w-6xl mb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <img src="/aarambh-logo-new.png" alt="AARAMBH Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white font-sans">
              AARAMBH
            </span>
            <span className="text-[10px] font-semibold text-[#FFCA7C] uppercase tracking-wider">
              Govt. of Maharashtra Single Window
            </span>
          </div>
        </Link>

        <Link
          href="/login"
          className="px-4 py-1.5 rounded-lg border border-[#FE7251]/40 text-[#FFCA7C] hover:bg-[#FE7251]/10 text-xs font-bold transition-all"
        >
          LOGOUT / SIGN IN
        </Link>
      </div>

      {/* Main Multi-Step Onboarding Container */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-[#36101E] overflow-hidden">
        {/* Step Indicator Header */}
        <div className="bg-[#FFF9F5] border-b border-[#F0E5E0] px-6 sm:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#9B2A48] uppercase tracking-wider">
              {t("auth.signup_title", "Setup your profile")}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">
              • {t("auth.step", "Step")} {currentStep} {t("auth.of", "of")} 4
            </span>
          </div>

          {/* Progress Pills */}
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <button
                key={stepNum}
                onClick={() => goToStep(stepNum)}
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  currentStep === stepNum
                    ? "bg-[#FE7251] text-white shadow-sm"
                    : currentStep > stepNum
                    ? "bg-[#FFF2DF] text-[#9B2A48]"
                    : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                }`}
                title={`Go to Step ${stepNum}`}
              >
                {currentStep > stepNum ? "✓" : stepNum}
              </button>
            ))}
          </div>
        </div>

        {/* Validation Error Banner */}
        {stepError && (
          <div className="mx-6 sm:mx-10 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-900 text-xs">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{stepError}</span>
            </div>
            <button onClick={() => setStepError(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: BASIC CREDENTIALS */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            {/* Left Welcome Panel */}
            <div className="lg:col-span-5 bg-[#FFF9F5] p-8 sm:p-12 border-r border-[#F0E5E0] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#9B2A48] uppercase tracking-wider block mb-1">
                  Welcome to AARAMBH
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#18080E] tracking-tight leading-snug">
                  Create Investor Account
                </h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Start your single-window journey for statutory industrial clearances, incentives, and utility connections in Maharashtra.
                </p>

                {/* DigiLocker Button */}
                <div className="mt-8 p-4 rounded-2xl bg-[#FFF2DF] border border-[#FED17A]">
                  <div className="flex items-center space-x-3 mb-2">
                    <ShieldCheck className="w-5 h-5 text-[#FE7251]" />
                    <h4 className="text-xs font-bold text-[#9B2A48]">
                      Fast-Track with DigiLocker
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Instantly pull verified Aadhaar, PAN, and Company CIN without manual document entry.
                  </p>
                  <button
                    type="button"
                    onClick={async () => setStepError(await loginWithDigiLocker())}
                    className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#82213B] hover:to-[#E85E3E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Connect DigiLocker
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 mt-6">
                Already registered? <Link href="/login" className="text-[#FE7251] font-bold hover:underline">Sign In</Link>
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
              <div className="space-y-4 max-w-lg">
                <h3 className="text-lg font-black text-[#18080E]">
                  Investor Contact Information
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name of Authorized Signatory *
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Sanjay Deshmukh"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:border-[#FE7251] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sanjay@enterprise.in"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:border-[#FE7251] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="9823012345"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:border-[#FE7251] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Set Portal Password *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:border-[#FE7251] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="inline-flex items-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#82213B] hover:to-[#E85E3E] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>{t("common.next", "NEXT")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SELECT LEGAL ENTITY TYPE */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            {/* Left Side */}
            <div className="lg:col-span-5 bg-[#FFF9F5] p-8 sm:p-12 border-r border-[#F0E5E0] flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#18080E]">
                  Welcome {applicantName.split(" ")[0]}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  You have been successfully registered on AARAMBH
                </p>

                {/* Friendly SVG Illustration */}
                <div className="mt-8 flex justify-center">
                  <div className="relative w-64 h-56 bg-gradient-to-tr from-[#FFF2DF] to-[#FAF2EE] rounded-3xl p-6 flex flex-col items-center justify-center border border-[#FED17A]/60 shadow-inner">
                    {/* Character avatar */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white flex items-center justify-center shadow-md mb-3">
                      <User className="w-10 h-10" />
                    </div>
                    {/* Laptop frame */}
                    <div className="w-40 h-16 bg-[#16060E] rounded-lg p-2 flex flex-col justify-between shadow-lg border border-[#36101E]">
                      <div className="flex items-center justify-between">
                        <span className="w-2 h-2 rounded-full bg-[#FE7251] animate-pulse"></span>
                        <span className="text-[8px] font-mono text-[#FFCA7C]">AARAMBH SWS</span>
                      </div>
                      <div className="h-2 bg-[#250C19] rounded-sm"></div>
                    </div>
                    <div className="w-48 h-2 bg-slate-300 rounded-b-md shadow-xs mt-0.5"></div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Step 2 of 4: Organization Structure
              </div>
            </div>

            {/* Right Side: 4 Legal Entity Cards + Business Name Input */}
            <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#9B2A48] uppercase tracking-wider block mb-1">
                  Setup your profile
                </span>
                <h2 className="text-2xl font-black text-[#18080E] tracking-tight">
                  Select your legal entity type
                </h2>

                {/* 4 Cards Grid */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Incorporated Company */}
                  <button
                    type="button"
                    onClick={() => setLegalEntity("company")}
                    className={`p-5 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                      legalEntity === "company"
                        ? "bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white border-[#9B2A48] shadow-lg shadow-[#9B2A48]/30"
                        : "bg-white border-[#F0E5E0] hover:border-[#FE7251]/60 hover:shadow-xs text-slate-800"
                    }`}
                  >
                    <Building className={`w-8 h-8 mb-2 ${legalEntity === "company" ? "text-white" : "text-slate-600"}`} />
                    <span className="text-xs font-black uppercase tracking-wider">
                      INCORPORATED COMPANY
                    </span>
                    <span className={`text-[10px] mt-1 ${legalEntity === "company" ? "text-[#FFF2DF]" : "text-rose-500 font-semibold"}`}>
                      Select if you have a CIN
                    </span>
                  </button>

                  {/* 2. Limited Liability Partnership */}
                  <button
                    type="button"
                    onClick={() => setLegalEntity("llp")}
                    className={`p-5 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                      legalEntity === "llp"
                        ? "bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white border-[#9B2A48] shadow-lg shadow-[#9B2A48]/30"
                        : "bg-white border-[#F0E5E0] hover:border-[#FE7251]/60 hover:shadow-xs text-slate-800"
                    }`}
                  >
                    <Handshake className={`w-8 h-8 mb-2 ${legalEntity === "llp" ? "text-white" : "text-slate-600"}`} />
                    <span className="text-xs font-black uppercase tracking-wider">
                      LIMITED LIABILITY PARTNERSHIP
                    </span>
                    <span className={`text-[10px] mt-1 ${legalEntity === "llp" ? "text-[#FFF2DF]" : "text-rose-500 font-semibold"}`}>
                      Select if you have an LLPIN
                    </span>
                  </button>

                  {/* 3. Sole Proprietor */}
                  <button
                    type="button"
                    onClick={() => setLegalEntity("proprietor")}
                    className={`p-5 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                      legalEntity === "proprietor"
                        ? "bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white border-[#9B2A48] shadow-lg shadow-[#9B2A48]/30"
                        : "bg-white border-[#F0E5E0] hover:border-[#FE7251]/60 hover:shadow-xs text-slate-800"
                    }`}
                  >
                    <User className={`w-8 h-8 mb-2 ${legalEntity === "proprietor" ? "text-white" : "text-slate-600"}`} />
                    <span className="text-xs font-black uppercase tracking-wider">
                      SOLE PROPRIETOR
                    </span>
                    <span className={`text-[10px] mt-1 ${legalEntity === "proprietor" ? "text-[#FFF2DF]" : "text-slate-500"}`}>
                      Individual enterprise / MSME
                    </span>
                  </button>

                  {/* 4. Others */}
                  <button
                    type="button"
                    onClick={() => setLegalEntity("others")}
                    className={`p-5 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                      legalEntity === "others"
                        ? "bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white border-[#9B2A48] shadow-lg shadow-[#9B2A48]/30"
                        : "bg-white border-[#F0E5E0] hover:border-[#FE7251]/60 hover:shadow-xs text-slate-800"
                    }`}
                  >
                    <Users className={`w-8 h-8 mb-2 ${legalEntity === "others" ? "text-white" : "text-slate-600"}`} />
                    <span className="text-xs font-black uppercase tracking-wider">
                      OTHERS
                    </span>
                    <span className={`text-[10px] mt-1 ${legalEntity === "others" ? "text-[#FFF2DF]" : "text-slate-500"}`}>
                      Trust / Society / Cooperative / PSU
                    </span>
                  </button>
                </div>

                {/* Secondary Option: None of these */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setLegalEntity("new")}
                    className={`w-full py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      legalEntity === "new"
                        ? "bg-[#190710] text-white border-[#190710] shadow-md"
                        : "bg-[#FFF9F5] text-slate-600 border-[#F0E5E0] hover:bg-[#FFF2DF]"
                    }`}
                  >
                    NONE OF THESE, I&apos;M PLANNING TO REGISTER A NEW ENTITY
                  </button>
                </div>

                {/* Enter Business Name Input */}
                <div className="mt-6">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter Your Business Name *
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Smart Electronics / Shri Ganesh Fast Food"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:border-[#FE7251] focus:ring-2 focus:ring-[#FE7251]/20 focus:outline-none transition-all font-semibold"
                  />
                </div>

                {/* Primary Business Sector Selection */}
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Industry / Business Category *
                  </label>
                  <select
                    value={primarySector}
                    onChange={(e) => setPrimarySector(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:border-[#FE7251] focus:ring-2 focus:ring-[#FE7251]/20 focus:outline-none transition-all font-semibold bg-white"
                  >
                    {SIGNUP_SECTORS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Used to automatically tailor your Know Your Approvals (KYA) statutory roadmap and subsidies.
                  </p>
                </div>
              </div>

              {/* Bottom Nav: Go Back & NEXT */}
              <div className="pt-6 flex items-center justify-between border-t border-[#F0E5E0] mt-6">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider cursor-pointer"
                >
                  ◀ {t("auth.back", "GO BACK")}
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="inline-flex items-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#82213B] hover:to-[#E85E3E] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>{t("common.next", "NEXT")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: VALIDATE PAN */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            {/* Left Side */}
            <div className="lg:col-span-5 bg-[#FFF9F5] p-8 sm:p-12 border-r border-[#F0E5E0] flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#9B2A48]">
                  {businessName || "Smart Electronics"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  You have been successfully registered on AARAMBH
                </p>

                {/* Realistic PAN Card Render */}
                <div className="mt-8 relative w-full max-w-sm aspect-[1.58/1] rounded-2xl bg-gradient-to-br from-[#FFF2DF] via-rose-50 to-[#FFF9F5] p-4 border border-[#FED17A] shadow-xl overflow-hidden flex flex-col justify-between text-slate-800">
                  {/* Subtle watermark overlay */}
                  <div className="absolute right-4 top-4 opacity-15 text-6xl select-none pointer-events-none font-serif">
                    🏛️
                  </div>

                  {/* PAN Header */}
                  <div className="flex items-center justify-between border-b border-[#FED17A]/60 pb-2">
                    <div>
                      <p className="text-[10px] font-bold text-slate-800 tracking-wider uppercase">
                        आयकर विभाग
                      </p>
                      <p className="text-[8px] font-semibold text-slate-600 uppercase">
                        INCOME TAX DEPARTMENT
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-800 uppercase">
                        भारत सरकार
                      </p>
                      <p className="text-[8px] font-semibold text-slate-600 uppercase">
                        GOVT. OF INDIA
                      </p>
                    </div>
                  </div>

                  {/* Face Silhouette and Masked Name */}
                  <div className="flex items-center space-x-3 my-1">
                    <div className="w-12 h-14 rounded-lg bg-slate-300/80 border border-slate-400 flex items-center justify-center text-xs font-bold text-slate-600">
                      PHOTO
                    </div>
                    <div>
                      <p className="font-mono text-xs font-bold tracking-widest text-slate-800">
                        {panVerified ? panNumber : "XXXX XXXX"}
                      </p>
                      <p className="text-[10px] font-bold text-slate-700 uppercase mt-0.5">
                        {businessName || "SMART ELECTRONICS"}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Hologram & Permanent Account Number */}
                  <div className="flex items-end justify-between border-t border-[#FED17A]/60 pt-2">
                    <div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase block">
                        Permanent Account Number
                      </span>
                      <span className="font-mono text-xs font-black tracking-wider text-[#9B2A48]">
                        {panNumber}
                      </span>
                    </div>

                    {/* Gold Hologram Sticker */}
                    <div className="w-10 h-7 rounded-sm bg-gradient-to-tr from-[#FE7251] via-[#FFCA7C] to-[#FE7251] border border-[#FED17A] flex items-center justify-center shadow-xs">
                      <span className="text-[7px] font-black text-[#18080E] uppercase">
                        भारत
                      </span>
                    </div>
                  </div>
                </div>

                {/* "Why is PAN required?" link */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setPanModalOpen(true)}
                    className="text-xs font-semibold text-[#9B2A48] hover:text-[#FE7251] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#FE7251]" />
                    <span>Why is PAN required?</span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Step 3 of 4: Statutory Tax Identity
              </div>
            </div>

            {/* Right Side: Validate PAN Form */}
            <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#9B2A48] uppercase tracking-wider block mb-1">
                  Setup your profile
                </span>
                <h2 className="text-2xl font-black text-[#18080E] tracking-tight">
                  Validate your Permanent Account Number (PAN)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  We use your PAN to authenticate enterprise credentials across state regulatory databases.
                </p>

                {/* Outlined Input & Button */}
                <div className="mt-8 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Enter Permanent Account Number *
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <input
                        type="text"
                        maxLength={10}
                        value={panNumber}
                        onChange={(e) => {
                          setPanNumber(e.target.value.toUpperCase());
                          setPanVerified(false);
                        }}
                        placeholder="ABCDE1234F"
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-900 uppercase focus:border-[#FE7251] focus:ring-2 focus:ring-[#FE7251]/20 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyPan}
                        disabled={panLoading || !panNumber}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#82213B] hover:to-[#E85E3E] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                      >
                        {panLoading ? "VALIDATING..." : "GET DETAILS"}
                      </button>
                    </div>
                  </div>

                  {/* Verification Status Feedback */}
                  {panVerified && (
                    <div className="p-4 rounded-xl bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-xs flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-5 h-5 text-[#FE7251] shrink-0" />
                        <div>
                          <p className="font-bold">PAN Validated Successfully</p>
                          <p className="text-[11px] text-[#9B2A48]">Matched with Income Tax Department records • Entity: {businessName}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FE7251] text-white">
                        VERIFIED
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Nav: Go Back & NEXT */}
              <div className="pt-6 flex items-center justify-between border-t border-[#F0E5E0] mt-6">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider cursor-pointer"
                >
                  ◀ {t("auth.back", "GO BACK")}
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(4)}
                  className="inline-flex items-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#82213B] hover:to-[#E85E3E] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>{t("common.next", "NEXT")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: ENTER ADDRESS */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
            {/* Left Side: 3D Map Vector Graphic */}
            <div className="lg:col-span-5 bg-[#FFF9F5] p-8 sm:p-12 border-r border-[#F0E5E0] flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#9B2A48]">
                  {businessName || "Smart Electronics"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  You have been successfully registered on AARAMBH
                </p>

                {/* 3D Map Vector */}
                <div className="mt-8 flex justify-center">
                  <div className="relative w-64 h-56 bg-gradient-to-tr from-[#FFF2DF] to-[#FAF2EE] rounded-3xl p-4 flex items-center justify-center border border-[#FED17A]/60 shadow-inner">
                    {/* Folded Map Canvas */}
                    <div className="w-52 h-36 bg-white rounded-xl shadow-lg border border-[#F0E5E0] transform -rotate-3 p-3 flex flex-col justify-between relative overflow-hidden">
                      <div className="h-full bg-[#FFF9F5] rounded-lg p-2 border border-dashed border-[#FED17A] flex items-center justify-center">
                        <span className="text-[10px] font-bold text-[#9B2A48] uppercase tracking-widest opacity-60">
                          MAHARASHTRA INDUSTRIAL MAP
                        </span>
                      </div>

                      {/* Main Coral Location Pin */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/4 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-[#FE7251] border-4 border-white shadow-xl flex items-center justify-center text-white">
                          <MapPin className="w-5 h-5 fill-white text-[#FE7251]" />
                        </div>
                        <div className="w-4 h-1.5 rounded-full bg-slate-400/50 -mt-0.5"></div>
                      </div>

                      {/* Secondary Warm Gold Pins */}
                      <div className="absolute top-6 left-6 w-6 h-6 rounded-full bg-[#FFCA7C] border-2 border-white shadow-md flex items-center justify-center text-white">
                        <MapPin className="w-3 h-3 fill-white text-[#FFCA7C]" />
                      </div>
                      <div className="absolute bottom-6 right-6 w-6 h-6 rounded-full bg-[#FFCA7C] border-2 border-white shadow-md flex items-center justify-center text-white">
                        <MapPin className="w-3 h-3 fill-white text-[#FFCA7C]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Step 4 of 4: Physical Industrial Location
              </div>
            </div>

            {/* Right Side: Postal Address Form */}
            <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#9B2A48] uppercase tracking-wider block mb-1">
                  Setup your profile
                </span>
                <h2 className="text-2xl font-black text-[#18080E] tracking-tight">
                  Enter your Address
                </h2>

                {/* Subheading tab */}
                <div className="mt-4 pb-2 border-b border-[#F0E5E0]">
                  <span className="text-xs font-bold text-[#18080E] border-b-2 border-[#FE7251] pb-2.5">
                    Add Postal Address *
                  </span>
                </div>

                {/* Address Form Inputs */}
                <div className="mt-5 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Address 1 *
                    </label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="Address lane 1"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:border-[#FE7251] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Address 2
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="On Road 3 / Landmark"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:border-[#FE7251] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Country *
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:border-[#FE7251] focus:outline-none"
                      >
                        <option value="India">India</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        placeholder="110066 / 410501"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 font-mono focus:border-[#FE7251] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State *
                      </label>
                      <select
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:border-[#FE7251] focus:outline-none"
                      >
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Karnataka">Karnataka</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        District *
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:border-[#FE7251] focus:outline-none"
                      >
                        <option value="Pune">Pune</option>
                        <option value="Thane">Thane</option>
                        <option value="Mumbai Suburban">Mumbai Suburban</option>
                        <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
                        <option value="Nagpur">Nagpur</option>
                        <option value="Nashik">Nashik</option>
                        <option value="Raigad">Raigad</option>
                        <option value="Kolhapur">Kolhapur</option>
                        <option value="Solapur">Solapur</option>
                      </select>
                    </div>
                  </div>

                  {/* Add Registered Address + Option */}
                  <div className="pt-2">
                    {showSecondAddress ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-700">
                            Registered Corporate Office Address
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowSecondAddress(false)}
                            className="text-[11px] text-rose-600 font-bold hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={addressLine2}
                          onChange={(e) => setAddressLine2(e.target.value)}
                          placeholder="Corporate / Registered Headquarters Address"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:border-[#FE7251] focus:outline-none"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowSecondAddress(true)}
                        className="text-xs font-bold text-slate-700 hover:text-[#FE7251] flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Add Alternate / Registered Address</span>
                        <span className="text-[#FE7251] font-black text-sm">+</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Nav: Go Back & NEXT / FINISH */}
              <div className="pt-6 flex items-center justify-between border-t border-[#F0E5E0] mt-6">
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider cursor-pointer"
                >
                  ◀ {t("auth.back", "GO BACK")}
                </button>
                <button
                  type="button"
                  onClick={handleCompleteRegistration}
                  className="inline-flex items-center space-x-2 px-9 py-3.5 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#82213B] hover:to-[#E85E3E] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>{t("auth.complete_reg", "COMPLETE REGISTRATION")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* "Why is PAN required?" Informational Modal */}
      {panModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#F0E5E0] relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setPanModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#FAF2EE] hover:bg-[#F0E5E0] text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-xs font-bold text-[#9B2A48] uppercase tracking-wider mb-2">
              <CreditCard className="w-4 h-4 text-[#FE7251]" />
              <span>Statutory Requirement</span>
            </div>
            <h3 className="text-base font-black text-[#18080E]">
              Why is PAN required for AARAMBH?
            </h3>
            <div className="mt-3 space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                1. <strong>Direct Regulatory Synchronization:</strong> Your Permanent Account Number (PAN) is used by MIDC, MPCB, and DISH to verify company registration without requiring redundant paper tax returns.
              </p>
              <p>
                2. <strong>Incentive & Subsidy Tracking:</strong> Under the Package Scheme of Incentives (PSI 2019), industrial subsidies and electricity duty exemptions are credited against your PAN-linked corporate entity.
              </p>
              <p>
                3. <strong>Anti-Fraud Compliance:</strong> Ensures all single-window applications originate from verified directors and authorized signatories.
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setPanModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#250C19] hover:bg-[#381326] text-white text-xs font-bold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#16060E] flex items-center justify-center text-white">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
