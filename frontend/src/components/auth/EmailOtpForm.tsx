"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Mail, MailCheck, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailOtpFormProps {
  onSuccess: () => void;
  showSignupHint?: boolean;
  initialEmail?: string;
  onSendCode?: (email: string) => Promise<string | null>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailOtpForm({
  onSuccess,
  showSignupHint = false,
  initialEmail = "",
  onSendCode,
}: EmailOtpFormProps) {
  const { signInWithEmailOtp, verifyEmailOtp } = useAuth();

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
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
    setResendCooldown(30);
  };

  const handleVerify = async () => {
    setError(null);
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Please enter the 6-digit code from your email.");
      return;
    }
    setVerifying(true);
    const err = await verifyEmailOtp(email, code);
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
          ? "That code is invalid or has expired. Request a new one."
          : err
      );
      return;
    }
    onSuccess();
  };

  return (
    <div className="space-y-3">
      {showSignupHint && (
        <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-900 text-xs leading-relaxed">
          New here? Just enter your email — we&apos;ll create your account and log you in automatically.
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="otp-email">Email Address</Label>
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
          <div className="space-y-1">
            <Label htmlFor="otp-code">6-Digit Code</Label>
            <Input
              id="otp-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ""));
                setError(null);
              }}
              placeholder="••••••"
              className="text-center font-mono text-lg tracking-[0.4em]"
            />
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
                Verifying…
              </>
            ) : (
              <>
                <MailCheck className="w-4 h-4" />
                Verify &amp; Login
              </>
            )}
          </Button>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSendCode}
              disabled={resendCooldown > 0 || sending}
              className="text-xs font-medium text-[#FE7251] hover:underline cursor-pointer disabled:pointer-events-none disabled:text-slate-400"
            >
              {resendCooldown > 0
                ? `Resend code (${resendCooldown}s)`
                : sending
                ? "Sending…"
                : "Resend code"}
            </button>
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