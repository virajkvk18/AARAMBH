"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, FileSearch, Info } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";

export default function TrackApplicationPage() {
  usePageTitle("Track Your Application | AARAMBH");
  const [appId, setAppId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <section className="bg-slate-900 text-white border-b border-slate-800 py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium uppercase tracking-wider mb-3">
              Application Status
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Track Existing Application
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Check the live status of your submitted clearances, statutory SLA countdowns and desk reviews.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label htmlFor="appId" className="text-xs font-semibold text-slate-700 block mb-1.5">
                Application / Acknowledgement ID
              </label>
              <input
                id="appId"
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="e.g. AARAMBH-MH-2026-001452"
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]/30 focus:border-[#FE7251]"
              />
            </div>

            <Button type="submit" className="w-full">
              <Search className="w-4 h-4" />
              <span>Check Status</span>
            </Button>
          </form>

          {submitted && (
            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    <strong>Status lookup is not yet available without signing in.</strong> Submit an online
                    application or{" "}
                    <Link href="/login" className="font-semibold text-[#9B2A48] hover:underline">
                      sign in
                    </Link>{" "}
                    to track clearances in real time from your dashboard. Having trouble? Contact the Single
                    Window Helpdesk with your application ID.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9B2A48] hover:underline"
                >
                  <span>Sign In to Track in Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2.5 text-xs text-slate-500">
            <FileSearch className="w-4 h-4 text-[#FE7251] shrink-0" />
            <p>
              Where is my application ID? It is shown in your acknowledgement email and on the
              confirmation screen after submitting a clearance.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}