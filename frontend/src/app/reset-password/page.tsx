"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Mail,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getBrowserSupabaseClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, updatePassword } = useAuth();
  usePageTitle("Reset Password | AARAMBH");

  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Detect recovery mode from URL searchParams, hash, or Supabase event
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }

    const code = searchParams.get("code") || searchParams.get("token");
    if (code) {
      setStep("reset");
    }

    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setStep("reset");
    }

    const s = getBrowserSupabaseClient();
    if (!s) return;

    const {
      data: { subscription },
    } = s.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStep("reset");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const err = await resetPassword(email);
      if (err) {
        setError(err);
        return;
      }
      setMessage("Password recovery email sent! Please check your inbox for instructions to reset your password.");
    } catch (err: any) {
      setError(err.message || "Failed to process password reset request.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const err = await updatePassword(password);
      if (err) {
        setError(err);
        return;
      }

      setMessage("Password updated successfully! Redirecting to sign in...");
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
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
              Govt. of Maharashtra Single Window
            </span>
          </div>
        </Link>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-md shadow-md border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FE7251] flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                {step === "request" ? "Reset Password" : "Set New Password"}
              </CardTitle>
              <CardDescription className="text-xs">
                {step === "request"
                  ? "Enter your registered email to receive a password reset link"
                  : "Enter a secure new password for your account"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {step === "request" ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="reset-email">Registered Email Address</Label>
                <div className="relative">
                  <Input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@enterprise.com"
                    className="pl-9"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                {isLoading ? "Sending Reset Email..." : "Send Reset Email"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <Input
                  id="confirm-new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                {isLoading ? "Updating Password..." : "Update Password"}
              </Button>

              <button
                type="button"
                onClick={() => setStep("request")}
                className="text-xs text-slate-500 hover:text-slate-800 w-full text-center mt-2 flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Request another reset link</span>
              </button>
            </form>
          )}
        </CardContent>

        <CardFooter className="pt-2 border-t border-slate-100 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#FE7251] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
