"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EmailOtpForm from "@/components/auth/EmailOtpForm";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const { signIn, loginWithDigiLocker, loginWithGoogle } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  usePageTitle("Sign In | AARAMBH");

  const [activeRole, setActiveRole] = useState<"APPLICANT" | "OFFICER">("APPLICANT");
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [officerDept, setOfficerDept] = useState("MIDC Industrial Clearances");
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const error = await signIn(email, password, activeRole, activeRole === "OFFICER" ? officerDept : undefined);
    if (error) {
      setAuthError(error);
      return;
    }
    router.replace(redirectTo.startsWith("/dashboard") ? redirectTo : "/dashboard");
  };

  const handleDigiLockerLogin = async () => {
    setAuthError(null);
    const err = await loginWithDigiLocker();
    if (err) {
      setAuthError(err);
      return;
    }
    router.replace(redirectTo.startsWith("/dashboard") ? redirectTo : "/dashboard");
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    const err = await loginWithGoogle();
    if (err) {
      setAuthError(err);
      return;
    }
    router.replace(redirectTo.startsWith("/dashboard") ? redirectTo : "/dashboard");
  };

  const handleForgotPassword = () => {
    setResetNotice(`Password reset is currently handled by the administrator. Please contact admin@aarambh.gov.in to request a password reset.`);
    setTimeout(() => {
      setResetNotice(null);
    }, 8000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      {/* Top Branding */}
      <div className="w-full max-w-md mb-6 text-center">
        <Link href="/" className="inline-flex items-center space-x-2.5 group mb-2">
          <Image src="/aarambh-logo-new.png" alt="AARAMBH Logo" width={36} height={36} className="w-9 h-9 object-contain" />
          <div className="text-left">
            <span className="text-xl font-bold tracking-tight text-slate-900 block font-sans">
              AARAMBH
            </span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
              {t("brand.govt_single_window", "Govt. of Maharashtra Single Window")}
            </span>
          </div>
        </Link>
      </div>

      {/* Main Login Card */}
      <Card className="w-full max-w-md shadow-md border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                {t("auth.sign_in", "Sign In")}
              </CardTitle>
              <CardDescription className="mt-1">
                {t("auth.sign_in_sub", "Access your Single Window workspace")}
              </CardDescription>
            </div>

            {/* Role Toggle Pill */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveRole("APPLICANT")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeRole === "APPLICANT"
                    ? "bg-[#FE7251] text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t("auth.investor_login", "Investor")}
              </button>
              <button
                type="button"
                onClick={() => setActiveRole("OFFICER")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeRole === "OFFICER"
                    ? "bg-[#FE7251] text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t("auth.officer_login", "Officer")}
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Login Method Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setLoginMethod("password")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                loginMethod === "password"
                  ? "bg-[#FE7251] text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("otp")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                loginMethod === "otp"
                  ? "bg-[#FE7251] text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Email Code (OTP)
            </button>
          </div>

          {loginMethod === "password" ? (
          <>
          {/* Officer Dept Selector */}
          {activeRole === "OFFICER" && (
            <div className="p-3 rounded-lg bg-orange-50/50 border border-orange-200 space-y-1">
              <Label className="text-slate-700">Department Authority</Label>
              <select
                value={officerDept}
                onChange={(e) => setOfficerDept(e.target.value)}
                className="w-full bg-white text-xs font-medium text-slate-800 p-2 rounded-md border border-slate-300 focus:outline-hidden focus:border-[#FE7251]"
              >
                <option value="MIDC Industrial Clearances">MIDC (Land & Building Plan)</option>
                <option value="MPCB Environmental Cell">MPCB (Pollution Control Board)</option>
                <option value="Maharashtra Fire Directorate">State Fire Services</option>
                <option value="Directorate of Industrial Safety (DISH)">DISH (Factory Licensing)</option>
              </select>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="login-email">{t("auth.email", "Email Address")}</Label>
              <Input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@enterprise.com"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">{t("auth.password", "Password")}</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-[#FE7251] hover:underline cursor-pointer"
                >
                  {t("auth.forgot_password", "Forgot Password?")}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pr-10"
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

            {authError && <p className="text-xs text-rose-600 font-medium">{authError}</p>}

            {resetNotice && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resetNotice}</span>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              {t("auth.sign_in", "Sign In")}
            </Button>
          </form>
          </>
          ) : (
            <div className="pt-2">
              <EmailOtpForm
                onSuccess={() =>
                  router.replace(redirectTo.startsWith("/dashboard") ? redirectTo : "/dashboard")
                }
              />
            </div>
          )}

          {/* Single Sign-On Options */}
          {activeRole === "APPLICANT" && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200"></div>
                <span className="shrink mx-2 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{t("auth.or_continue", "Or continue with")}</span>
                <div className="grow border-t border-slate-200"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center space-x-2"
                onClick={handleDigiLockerLogin}
              >
                <ShieldCheck className="w-4 h-4 text-[#FE7251]" />
                <span>{t("auth.digilocker_login", "Sign in with DigiLocker")}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center space-x-2"
                onClick={handleGoogleLogin}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{t("auth.google_login", "Sign in with Google")}</span>
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-2 border-t border-slate-100 justify-center">
          <span className="text-xs text-slate-600">
            {t("auth.no_account", "Don't have an account?")}{" "}
            <Link href="/signup" className="font-semibold text-[#FE7251] hover:underline ml-1">
              {t("auth.signup_now", "Register Enterprise")}
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
