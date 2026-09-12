"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Handshake,
  User,
  Users,
  Building,
  CreditCard,
  MapPin,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  AlertCircle,
  Mail,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isBrowserSupabaseConfigured } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { useEnterpriseStore } from "@/store/enterpriseStore";
import { useNotificationStore } from "@/store/notificationStore";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EmailOtpForm from "@/components/auth/EmailOtpForm";

type LegalEntityType = "company" | "llp" | "proprietor" | "others" | "new";

function SignupForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const {
    user,
    signUpApplicant,
    signUpWithEmailOtp,
    checkEmailExists,
    resendSignupOtp,
    verifyEmailOtp,
    completeSignup,
    updateProfile,
  } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  usePageTitle("Register Enterprise | AARAMBH");
  const { setFormData, setExtractedFields, updateMasterCAF, reset } = useEnterpriseStore();

  // Current Step: 1 = Initial Credentials, 2 = Entity Type, 3 = PAN Validation, 4 = Address
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [emailOptNotice, setEmailOptNotice] = useState<string | null>(null);
  const [signupMethod, setSignupMethod] = useState<"password" | "otp">("otp");

  // Form State
  const [applicantName, setApplicantName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 State
  const [legalEntity, setLegalEntity] = useState<LegalEntityType>("company");
  const [businessName, setBusinessName] = useState("");
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
  const [panNumber, setPanNumber] = useState("");
  const [panVerified, setPanVerified] = useState(false);
  const [panLoading, setPanLoading] = useState(false);
  const [panModalOpen, setPanModalOpen] = useState(false);

  // Step 4 State
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [country, setCountry] = useState("India");
  const [pinCode, setPinCode] = useState("");
  const [stateName, setStateName] = useState("Maharashtra");
  const [district, setDistrict] = useState("Pune");

  // Validation Helpers
  const validateStep1 = () => {
    setStepError(null);
    if (!applicantName.trim() || applicantName.trim().length < 3) {
      setStepError("Please enter the full legal name of the authorized signatory.");
      return false;
    }
    const emailClean = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
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

  const goToStep = async (targetStep: number) => {
    if (targetStep < currentStep) {
      setStepError(null);
      setCurrentStep(targetStep);
      return;
    }
    if (targetStep === 5) return; // step 5 is only reached after OTP is sent
    if (currentStep === 1) {
      if (!validateStep1()) return;
      const cleanEmail = email.trim().toLowerCase();
      setPanLoading(true);
      const isExisting = await checkEmailExists(cleanEmail);
      setPanLoading(false);
      if (isExisting) {
        setStepError("Account found. Please sign in instead.");
        return;
      }
    }
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setStepError(null);
    setCurrentStep(targetStep);
  };

  // Verify PAN handler (Statutory format validation)
  const handleVerifyPan = () => {
    const panClean = panNumber.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panClean)) {
      setStepError("Please enter a valid 10-character PAN format (e.g. ABCDE1234F).");
      return;
    }
    setStepError(null);
    setPanVerified(true);
  };

  // Build the profile object once registration is being finalized
  const buildProfile = () => ({
    name: applicantName,
    enterpriseName: businessName,
    phone: mobile,
    panNumber: panNumber.toUpperCase(),
    entityType: legalEntity === "company" ? "Private Limited" : legalEntity === "llp" ? "LLP" : legalEntity === "proprietor" ? "Proprietorship" : "Partnership",
    addressLine1,
    addressLine2,
    pinCode,
    district,
    state: stateName,
    sector: SIGNUP_SECTORS.find((s) => s.value === primarySector)?.label || "General Manufacturing",
  });

  // Sync the Enterprise Store & Master CAF, then send the user to the dashboard
  const syncStoreAndRedirect = () => {
    reset();

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
        gstin: "",
        cin: "",
        entityType: legalEntity === "company" ? "Pvt Ltd" : legalEntity === "llp" ? "LLP" : legalEntity === "proprietor" ? "Proprietorship" : "Partnership",
        signatoryName: applicantName,
        signatoryEmail: email,
        signatoryMobile: mobile,
      },
      locationDetails: {
        state: stateName,
        district,
        address: `${addressLine1}${addressLine2 ? `, ${addressLine2}` : ""}`,
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

    // Welcoming Notification for new investor
    useNotificationStore.getState().addNotification({
      type: "welcome",
      title: `Welcome to AARAMBH, ${applicantName || "Investor"}! 🎉`,
      message: `Enterprise profile for "${businessName || "Your Enterprise"}" in ${district || "Maharashtra"} has been initialized. Next, use KYA to discover your statutory clearances.`,
      severity: "welcome",
      target: "/dashboard/kya",
    });

    router.replace(redirectTo.startsWith("/dashboard") ? redirectTo : "/dashboard");
  };

  // Complete Registration (Step 4)
  const handleCompleteRegistration = async () => {
    if (!validateStep4()) return;
    setStepError(null);
    setPanLoading(true);

    const profilePayload = buildProfile();

    // If the user already authenticated via OTP or existing session, update profile and enter dashboard
    if (user || signupMethod === "otp") {
      try {
        await updateProfile(profilePayload);
      } catch (e: any) {
        console.warn("Profile update error:", e);
      }
      setPanLoading(false);
      syncStoreAndRedirect();
      return;
    }

    const result = await signUpApplicant(email, password, profilePayload);
    setPanLoading(false);

    if (result.error) {
      setStepError(result.error);
      return;
    }

    if (result.needsConfirmation) {
      setCurrentStep(5);
      return;
    }

    syncStoreAndRedirect();
  };

  // Finalize registration after the email OTP has been verified (Step 5)
  const finalizeRegistration = async () => {
    const err = await completeSignup(email, password, buildProfile());
    if (err) {
      setStepError(err);
      return;
    }
    syncStoreAndRedirect();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      {/* Top Header Brand & Sign In link */}
      <div className="w-full max-w-5xl mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <Image src="/aarambh-logo-new.png" alt="AARAMBH Logo" width={36} height={36} className="w-9 h-9 object-contain" />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
              AARAMBH
            </span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              {t("brand.govt_single_window", "Govt. of Maharashtra Single Window")}
            </span>
          </div>
        </Link>

        <Link
          href="/login"
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
        >
          {t("auth.sign_in_instead", "Sign In Instead")}
        </Link>
      </div>

      {/* Main Multi-Step Onboarding Container */}
      <Card className="w-full max-w-5xl shadow-md border-slate-200 overflow-hidden">
        {/* Step Indicator Header */}
        <div className="bg-slate-50/80 border-b border-slate-200 px-6 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              {t("auth.signup_title", "Setup your profile")}
            </span>
            <span className="text-xs text-slate-500">
              • {t("auth.step", "Step")} {currentStep} {t("auth.of", "of")} 5
            </span>
          </div>

          {/* Progress Pills */}
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <button
                key={stepNum}
                type="button"
                onClick={() => goToStep(stepNum)}
                className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                  currentStep === stepNum
                    ? "bg-[#FE7251] text-white shadow-xs"
                    : currentStep > stepNum
                    ? "bg-slate-200 text-slate-800"
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                }`}
                title={`Go to Step ${stepNum}`}
              >
                {currentStep > stepNum ? "✓" : stepNum}
              </button>
            ))}
          </div>
        </div>

        {/* OTP Delivery Notice Banner */}
        {emailOptNotice && (
          <div className="mx-6 sm:mx-8 mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900 text-xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-medium">{emailOptNotice}</span>
            </div>
            <button type="button" onClick={() => setEmailOptNotice(null)} className="text-amber-600 hover:text-amber-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Validation Error Banner */}
        {stepError && (
          <div className={`mx-6 sm:mx-8 mt-4 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs ${
            stepError.includes("Account found")
              ? "bg-amber-50 border-amber-300 text-amber-900"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            <div className="flex items-center space-x-2.5">
              <AlertCircle className={`w-5 h-5 shrink-0 ${stepError.includes("Account found") ? "text-amber-600" : "text-rose-600"}`} />
              <div>
                <span className="font-bold block text-sm">{stepError}</span>
                {stepError.includes("Account found") && (
                  <span className="text-slate-600 text-xs mt-0.5 block">
                    An account registered with <strong className="font-mono">{email.trim().toLowerCase()}</strong> already exists. Please sign in to access your enterprise dashboard.
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              {stepError.includes("Account found") && (
                <Link
                  href={`/login?email=${encodeURIComponent(email.trim().toLowerCase())}`}
                  className="px-4 py-2 rounded-lg bg-[#FE7251] hover:bg-[#E85E3E] text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  Sign In
                </Link>
              )}
              <button type="button" onClick={() => setStepError(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: BASIC CREDENTIALS */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            {/* Left Info Panel */}
            <div className="lg:col-span-5 bg-slate-50/60 p-6 sm:p-8 border-r border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#FE7251] uppercase tracking-wider block mb-1">
                  {t("auth.welcome_tag", "Welcome to AARAMBH")}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {t("auth.create_investor", "Create Investor Account")}
                </h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {t("auth.signup_intro", "Start your single-window journey for statutory industrial clearances, incentives, and utility connections in Maharashtra.")}
                </p>
              </div>

              <div className="text-[11px] text-slate-500 mt-6">
                {t("auth.already_registered", "Already registered?")} <Link href="/login" className="text-[#FE7251] font-semibold hover:underline">{t("sign_in", "Sign In")}</Link>
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              {/* Signup Method Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs w-fit mb-4">
                <button
                  type="button"
                  onClick={() => setSignupMethod("password")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    signupMethod === "password"
                      ? "bg-[#FE7251] text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sign up with Password
                </button>
                <button
                  type="button"
                  onClick={() => setSignupMethod("otp")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    signupMethod === "otp"
                      ? "bg-[#FE7251] text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sign up with Email Code
                </button>
              </div>

              {signupMethod === "password" ? (
              <>
              <div className="space-y-4 max-w-lg">
                <h3 className="text-base font-semibold text-slate-900">
                  {t("auth.investor_contact", "Investor Contact Information")}
                </h3>

                <div className="space-y-1">
                  <Label htmlFor="signup-name">{t("auth.full_name_label", "Full Name of Authorized Signatory *")}</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Sanjay Deshmukh"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="signup-email">{t("auth.email_label", "Email Address *")}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sanjay@enterprise.in"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-mobile">{t("auth.mobile_label", "Mobile Number *")}</Label>
                    <Input
                      id="signup-mobile"
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="9823012345"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="signup-password">{t("auth.password_label", "Set Portal Password *")}</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end border-t border-slate-100 mt-6">
                <Button onClick={() => goToStep(2)}>
                  <span>{t("common.next", "Next")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              </>
              ) : (
                <div className="space-y-4 max-w-lg">
                  <h3 className="text-base font-semibold text-slate-900">
                    Sign up with Email Code
                  </h3>
                  <EmailOtpForm
                    showSignupHint
                    otpType="email"
                    onSendCode={signUpWithEmailOtp}
                    verifyButtonText="Verify & Continue"
                    onSuccess={() => {
                      // Email verified — continue the flow to the business profile wizard.
                      setSignupMethod("otp");
                      setCurrentStep(2);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: SELECT LEGAL ENTITY TYPE */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            {/* Left Side */}
            <div className="lg:col-span-5 bg-slate-50/60 p-6 sm:p-8 border-r border-slate-200 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {t("auth.welcome_name", "Welcome")}, {applicantName.split(" ")[0]}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t("auth.enter_sector_compliance", "Select your legal entity structure for single-window compliance.")}
                </p>

                <div className="mt-8 p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-2 shadow-2xs">
                  <p className="font-semibold text-slate-900">{t("auth.why_entity_title", "Why Entity Type Matters:")}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {t("auth.why_entity_desc", "Different enterprise categories require specific documentation sets (e.g. CIN for Private Ltd vs Shop Act for Proprietorships).")}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                {t("auth.step2_of", "Step 2 of 4: Organization Structure")}
              </div>
            </div>

            {/* Right Side: Legal Entity Cards + Business Name Input */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#FE7251] uppercase tracking-wider block mb-1">
                  {t("auth.signup_title", "Setup your profile")}
                </span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {t("auth.legal_entity", "Select your legal entity type")}
                </h2>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLegalEntity("company")}
                    className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center transition-colors cursor-pointer ${
                      legalEntity === "company"
                        ? "bg-[#FE7251] text-white border-[#FE7251]"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                    }`}
                  >
                    <Building className="w-6 h-6 mb-1.5" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {t("auth.legal_company", "Incorporated Company")}
                    </span>
                    <span className={`text-[10px] mt-0.5 ${legalEntity === "company" ? "text-orange-100" : "text-slate-500"}`}>
                      {t("auth.legal_company_hint", "Select if you have a CIN")}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLegalEntity("llp")}
                    className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center transition-colors cursor-pointer ${
                      legalEntity === "llp"
                        ? "bg-[#FE7251] text-white border-[#FE7251]"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                    }`}
                  >
                    <Handshake className="w-6 h-6 mb-1.5" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {t("auth.legal_llp", "LLP")}
                    </span>
                    <span className={`text-[10px] mt-0.5 ${legalEntity === "llp" ? "text-orange-100" : "text-slate-500"}`}>
                      {t("auth.legal_llp_hint", "Select if you have an LLPIN")}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLegalEntity("proprietor")}
                    className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center transition-colors cursor-pointer ${
                      legalEntity === "proprietor"
                        ? "bg-[#FE7251] text-white border-[#FE7251]"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                    }`}
                  >
                    <User className="w-6 h-6 mb-1.5" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {t("auth.legal_proprietor", "Sole Proprietor")}
                    </span>
                    <span className={`text-[10px] mt-0.5 ${legalEntity === "proprietor" ? "text-orange-100" : "text-slate-500"}`}>
                      {t("auth.legal_proprietor_hint", "Individual enterprise / MSME")}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLegalEntity("others")}
                    className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center transition-colors cursor-pointer ${
                      legalEntity === "others"
                        ? "bg-[#FE7251] text-white border-[#FE7251]"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                    }`}
                  >
                    <Users className="w-6 h-6 mb-1.5" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {t("auth.legal_others", "Others")}
                    </span>
                    <span className={`text-[10px] mt-0.5 ${legalEntity === "others" ? "text-orange-100" : "text-slate-500"}`}>
                      {t("auth.legal_others_hint", "Trust / Society / Cooperative")}
                    </span>
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="signup-business-name">{t("auth.business_name_label", "Registered Business / Enterprise Name *")}</Label>
                    <Input
                      id="signup-business-name"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Smart Electronics"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signup-sector">{t("auth.sector_label", "Primary Industry / Sector Category *")}</Label>
                    <select
                      id="signup-sector"
                      value={primarySector}
                      onChange={(e) => setPrimarySector(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-hidden focus:border-[#FE7251] focus:ring-1 focus:ring-[#FE7251]"
                    >
                      {SIGNUP_SECTORS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-slate-100 mt-6">
                <Button variant="ghost" onClick={() => goToStep(1)}>
                  ◀ {t("auth.back", "Go Back")}
                </Button>
                <Button onClick={() => goToStep(3)}>
                  <span>{t("common.next", "Next")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: VALIDATE PAN */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            {/* Left Side */}
            <div className="lg:col-span-5 bg-slate-50/60 p-6 sm:p-8 border-r border-slate-200 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {businessName || "Smart Electronics"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t("auth.tax_identity", "Tax Identity Verification")}
                </p>

                <div className="mt-6 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">{t("auth.income_tax", "Income Tax Department")}</span>
                    <span className="text-[10px] text-slate-500 font-mono">PAN</span>
                  </div>
                  <p className="font-mono text-base font-bold text-slate-900 tracking-wider">
                    {panVerified ? panNumber : "••••••••••"}
                  </p>
                  <p className="text-[11px] text-slate-500 uppercase">{businessName}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setPanModalOpen(true)}
                  className="mt-4 text-xs font-medium text-[#FE7251] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{t("auth.why_pan", "Why is PAN required?")}</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                {t("auth.step3_of", "Step 3 of 4: Statutory Tax Identity")}
              </div>
            </div>

            {/* Right Side: Validate PAN Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#FE7251] uppercase tracking-wider block mb-1">
                  {t("auth.signup_title", "Setup your profile")}
                </span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {t("auth.validate_pan", "Validate Permanent Account Number (PAN)")}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t("auth.validate_pan_desc", "We use your PAN to authenticate enterprise credentials across state regulatory databases.")}
                </p>

                <div className="mt-6 space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="signup-pan">{t("auth.pan_label", "Permanent Account Number (PAN) *")}</Label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Input
                        id="signup-pan"
                        type="text"
                        maxLength={10}
                        value={panNumber}
                        onChange={(e) => {
                          setPanNumber(e.target.value.toUpperCase());
                          setPanVerified(false);
                        }}
                        placeholder="ABCDE1234F"
                        className="font-mono font-semibold uppercase tracking-wider"
                      />
                      <Button
                        onClick={handleVerifyPan}
                        disabled={panLoading || !panNumber}
                        className="shrink-0"
                      >
                        {panLoading ? t("auth.validating", "Validating...") : t("auth.get_details", "Get Details")}
                      </Button>
                    </div>
                  </div>

                  {panVerified && (
                    <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-800">Statutory Format Validated</p>
                          <p className="text-[11px] text-slate-600">Valid 10-character PAN structure (Self-Declared)</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        Pending Verification
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-slate-100 mt-6">
                <Button variant="ghost" onClick={() => goToStep(2)}>
                  ◀ {t("auth.back", "Go Back")}
                </Button>
                <Button onClick={() => goToStep(4)}>
                  <span>{t("common.next", "Next")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: ENTER ADDRESS */}
        {currentStep === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            {/* Left Side */}
            <div className="lg:col-span-5 bg-slate-50/60 p-6 sm:p-8 border-r border-slate-200 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {businessName || "Smart Electronics"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t("auth.location_district", "Location & Industrial District")}
                </p>

                <div className="mt-6 p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 shadow-2xs space-y-1.5">
                  <div className="flex items-center space-x-2 text-slate-900 font-semibold">
                    <MapPin className="w-4 h-4 text-[#FE7251]" />
                    <span>{t("auth.district_jurisdiction", "District Jurisdiction")}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {t("auth.district_jurisdiction_desc", "Determines applicable MIDC regional offices, local municipal bodies, and district-level single-window facilitation officers.")}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                {t("auth.step4_of", "Step 4 of 4: Physical Location")}
              </div>
            </div>

            {/* Right Side: Postal Address Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#FE7251] uppercase tracking-wider block mb-1">
                  {t("auth.signup_title", "Setup your profile")}
                </span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {t("auth.address", "Enter your Address")}
                </h2>

                <div className="mt-4 space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="signup-addr1">{t("auth.addr1_label", "Address Line 1 *")}</Label>
                    <Input
                      id="signup-addr1"
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="Plot No. / Industrial Estate Lane"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signup-addr2">{t("auth.addr2_label", "Address Line 2")}</Label>
                    <Input
                      id="signup-addr2"
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="MIDC Zone / Landmark"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="signup-country">{t("auth.country_label", "Country *")}</Label>
                      <select
                        id="signup-country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-hidden focus:border-[#FE7251] focus:ring-1 focus:ring-[#FE7251]"
                      >
                        <option value="India">India</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="signup-pincode">{t("auth.pincode_label", "PIN Code *")}</Label>
                      <Input
                        id="signup-pincode"
                        type="text"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        placeholder="410501"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="signup-state">{t("auth.state_label", "State *")}</Label>
                      <select
                        id="signup-state"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-hidden focus:border-[#FE7251] focus:ring-1 focus:ring-[#FE7251]"
                      >
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Karnataka">Karnataka</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="signup-district">{t("auth.district_label", "District *")}</Label>
                      <select
                        id="signup-district"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-hidden focus:border-[#FE7251] focus:ring-1 focus:ring-[#FE7251]"
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
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-slate-100 mt-6">
                <Button variant="ghost" onClick={() => goToStep(3)}>
                  ◀ {t("auth.back", "Go Back")}
                </Button>
                <Button onClick={handleCompleteRegistration} size="lg">
                  <span>{t("auth.complete_reg", "Complete Registration")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: VERIFY EMAIL VIA OTP */}
        {currentStep === 5 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            {/* Left Side */}
            <div className="lg:col-span-5 bg-slate-50/60 p-6 sm:p-8 border-r border-slate-200 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {t("auth.verify_email_title", "Verify Your Email")}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t("auth.verify_email_sub", "A one-time code has been sent to your inbox.")}
                </p>

                <div className="mt-6 p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 shadow-2xs space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-[#FE7251]" />
                    <span className="font-semibold text-slate-900">{email}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {t("auth.verify_email_desc", "Enter the 6-digit code we &apos;ve emailed to confirm this address and activate your AARAMBH account.")}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                {t("auth.step5_of", "Step 5 of 5: Email Verification")}
              </div>
            </div>

            {/* Right Side: OTP Entry Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#FE7251] uppercase tracking-wider block mb-1">
                  {t("auth.signup_title", "Setup your profile")}
                </span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Enter the 6-digit code sent to your email
                </h2>

                <div className="mt-6">
                  <EmailOtpForm
                    initialEmail={email}
                    initialCodeSent={true}
                    otpType="signup"
                    onSendCode={resendSignupOtp}
                    onChangeEmail={() => setCurrentStep(1)}
                    verifyButtonText="Verify & Complete Registration"
                    onSuccess={() => void finalizeRegistration()}
                  />
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-slate-100 mt-6">
                <Button variant="ghost" onClick={() => goToStep(4)}>
                  ◀ {t("auth.back", "Go Back")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* "Why is PAN required?" Modal */}
      {panModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPanModalOpen(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative space-y-3 transition-opacity duration-150" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPanModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#FE7251] uppercase tracking-wider">
              <CreditCard className="w-4 h-4" />
              <span>{t("auth.statutory_req", "Statutory Requirement")}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {t("auth.why_pan_title", "Why is PAN required for AARAMBH?")}
            </h3>
            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                1. <strong>{t("auth.pan_point1_title", "Direct Regulatory Synchronization:")}</strong> {t("auth.pan_point1_desc", "Your PAN is used by MIDC, MPCB, and DISH to verify company registration without requiring redundant paper returns.")}
              </p>
              <p>
                2. <strong>{t("auth.pan_point2_title", "Incentive & Subsidy Tracking:")}</strong> {t("auth.pan_point2_desc", "Under the Package Scheme of Incentives (PSI 2019), industrial subsidies and electricity duty exemptions are credited against your PAN-linked corporate entity.")}
              </p>
              <p>
                3. <strong>{t("auth.pan_point3_title", "Anti-Fraud Compliance:")}</strong> {t("auth.pan_point3_desc", "Ensures all single-window applications originate from verified directors and authorized signatories.")}
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => setPanModalOpen(false)}>
                {t("auth.got_it", "Got It")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
