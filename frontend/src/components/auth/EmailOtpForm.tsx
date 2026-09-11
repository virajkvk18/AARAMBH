"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Mail, MailCheck, Send, Edit2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailOtpFormProps {
  onSuccess: () => void;
  showSignupHint?: boolean;
  initialEmail?: string;
  initialCodeSent?: boolean;
  otpType?: "email" | "signup";
  onSendCode?: (email: string) => Promise<string | null>;
  onChangeEmail?: () => void;
  verifyButtonText?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailOtpForm({
  onSuccess,
  showSignupHint = false,
  initialEmail = "",
  initialCodeSent = false,
  otpType = "email",
  onSendCode,
  onChangeEmail,
  verifyButtonText,
}: EmailOtpFormProps) {
  const { signInWithEmailOtp, verifyEmailOtp } = useAuth();

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(initialCodeSent);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState<string | null>(
    initialCodeSent ? "Enter the 6-digit code sent to your email" : null
  );
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(initialCodeSent ? 60 : 0);

  // Sync initialEmail when changed from parent
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  // 60-second countdown for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const emailIsValid = EMAIL_REGEX.test(email.trim());

  const handleSendCode = async () => {
    setError(null);
    setMessage(null);
    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setSending(true);
    const err = onSendCode ? await onSendCode(email) : await signInWithEmailOtp(email);
    setSending(false);
    if (err) {
      setError(err);
      return;
    }
    setCodeSent(true);
    setMessage(`Code sent to ${email.trim().toLowerCase()} — check your inbox.`);
    setResendCooldown(60);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      setCode(pasted);
    }
  };

  const handleChangeEmail = () => {
    setError(null);
    setMessage(null);
    setCode("");
    if (onChangeEmail) {
      onChangeEmail();
    } else {
      setCodeSent(false);
    }
  };

  const handleVerify = async () => {
    setError(null);
    const cleanCode = code.trim();
    if (cleanCode.length !== 6) {
      setError("Please enter the 6-digit code from your email.");
      return;
    }
    setVerifying(true);
    const err = await verifyEmailOtp(email, cleanCode, otpType);
    setVerifying(false);
    if (err) {
      const normalized = err.toLowerCase();
      const isTokenProblem =
        normalized.includes("expired") ||
        normalized.includes("invalid") ||
        normalized.includes("mismatch") ||
        normalized.includes("token");
      setError(
        isTokenProblem
          ? "That 6-digit code is invalid or has expired. Please check your email or request a new code."
          : err
      );
      return;
    }
    onSuccess();
  };

  const defaultButtonText = otpType === "signup" ? "Verify & Register" : "Verify & Sign In";

  return (
    <div className="space-y-4">
      {showSignupHint && !codeSent && (
        <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-900 text-xs leading-relaxed">
          New here? Just enter your email — we&apos;ll create your account and log you in automatically.
        </div>
      )}

      {/* Email Input Field */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="otp-email" className="text-xs font-semibold text-slate-700">Email Address</Label>
          {codeSent && (
            <button
              type="button"
              onClick={handleChangeEmail}
              className="text-xs text-[#FE7251] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Change email</span>
            </button>
          )}
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            id="otp-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setCodeSent(false);
              setMessage(null);
              setError(null);
            }}
            placeholder="name@enterprise.com"
            disabled={codeSent}
            className="pl-9"
          />
        </div>
      </div>

      {!codeSent ? (
        <Button
          type="button"
          className="w-full"
          size="lg"
          onClick={handleSendCode}
          disabled={!emailIsValid || sending}
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending code…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Code
            </>
          )}
        </Button>
      ) : (
        <>
          {/* 6-Digit Code Input */}
          <div className="space-y-1">
            <Label htmlFor="otp-code" className="text-xs font-semibold text-slate-700">
              6-Digit Code
            </Label>
            <Input
              id="otp-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onPaste={handlePaste}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(val);
                setError(null);
              }}
              placeholder="••••••"
              className="text-center font-mono text-xl tracking-[0.5em] font-semibold"
              autoFocus
            />
            <p className="text-[11px] text-slate-500 text-center mt-1">
              Enter the 6-digit numeric verification code sent to your inbox
            </p>
          </div>

          <Button
            type="button"
            className="w-full"
            size="lg"
            onClick={handleVerify}
            disabled={code.trim().length !== 6 || verifying}
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying code…
              </>
            ) : (
              <>
                <MailCheck className="w-4 h-4" />
                {verifyButtonText || defaultButtonText}
              </>
            )}
          </Button>

          {/* Resend & Change Email Row */}
          <div className="flex items-center justify-between text-xs pt-1 px-1">
            <button
              type="button"
              onClick={handleChangeEmail}
              className="text-slate-500 hover:text-slate-900 underline cursor-pointer"
            >
              Change email
            </button>

            {resendCooldown > 0 ? (
              <span className="text-slate-400 font-medium">
                Resend code in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sending}
                className="text-[#FE7251] font-semibold hover:underline cursor-pointer"
              >
                {sending ? "Sending…" : "Resend Code"}
              </button>
            )}
          </div>
        </>
      )}

      {message && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}