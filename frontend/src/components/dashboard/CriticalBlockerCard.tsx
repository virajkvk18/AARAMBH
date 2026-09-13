"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertOctagon,
  ArrowRight,
  FileUp,
  CheckCircle2,
  X,
  Scale,
} from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";

export interface CriticalBlocker {
  id: string;
  title: string;
  legalCitation: string;
  blockingAuthority: string;
  statuteRef: string;
  actionLabel: string;
  clearanceName: string;
}

interface CriticalBlockerCardProps {
  blocker: CriticalBlocker;
  onResubmitted?: (blocker: CriticalBlocker) => void;
  className?: string;
}

export default function CriticalBlockerCard({
  blocker,
  onResubmitted,
  className = "",
}: CriticalBlockerCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setModalOpen(false);
      setFileName(null);
      useNotificationStore.getState().addNotification({
        type: "caf",
        title: "Blueprint resubmitted for statutory review",
        message: `${blocker.clearanceName} — corrected blueprint received. Fresh statutory SLA clock started for DISH scrutiny.`,
        severity: "success",
        target: "/dashboard/dag",
      });
      onResubmitted?.(blocker);
    }, 650);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className={`relative overflow-hidden rounded-2xl border border-[#2B1226] bg-[#16060E] text-white shadow-lg shadow-black/20 ${className}`}
      >
        {/* Glowing red/amber left border */}
        <span className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-rose-500 via-amber-400 to-rose-500 shadow-[0_0_16px_rgba(244,63,94,0.9)]" />

        <div className="p-5 sm:p-6 pl-7">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/40 text-[10px] font-black uppercase tracking-wider">
              <AlertOctagon className="w-3.5 h-3.5" />
              Action Required · Query Pending
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/40 text-[10px] font-black uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              {blocker.statuteRef}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
            🚨 {blocker.title}
          </h3>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-3xl">
            <span className="font-bold text-rose-300">
              {blocker.blockingAuthority} —{" "}
            </span>
            <span className="italic">{blocker.legalCitation}</span>
          </p>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-black shadow-md shadow-rose-900/40 transition-colors cursor-pointer"
            >
              {blocker.actionLabel}
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-slate-500">
              Statutory clock paused until corrective submission is received.
            </span>
          </div>
        </div>
      </motion.div>

      {/* Resubmission Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !submitting && setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#FED17A] space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-wider ring-1 ring-rose-200">
                    <FileUp className="w-3 h-3" />
                    Corrective Resubmission
                  </p>
                  <h3 className="text-base font bold text-slate-900 mt-2">
                    {blocker.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {blocker.clearanceName} · {blocker.blockingAuthority}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-40"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FFF7F0] border border-[#FED17A] text-[11px] text-slate-700 space-y-1.5">
                <p className="font-bold text-[#9B2A48]">Required correction</p>
                <p className="leading-relaxed">
                  The revised architectural elevation plan must show{" "}
                  <strong>emergency egress stairwell dimensions</strong> as
                  required under Section 38 of the Factories Act 1948. A
                  dimensioned north-facing elevation + typical floor plan is
                  acceptable.
                </p>
              </div>

              <label className="block">
                <span className="text-xs font-bold text-slate-700">
                  Upload corrected blueprint (PDF/DWG)
                </span>
                <input
                  type="file"
                  accept=".pdf,.dwg,.jpg,.png"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                  className="mt-1.5 w-full text-xs text-slate-500 file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FFF2DF] file:text-[#9B2A48] hover:file:bg-[#FFE3B8] cursor-pointer"
                />
              </label>

              {fileName && (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {fileName} queued for digital submission.
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !fileName}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-black shadow-xs transition-colors cursor-pointer disabled:opacity-40"
                >
                  {submitting ? "Submitting…" : "Submit Corrected Blueprint"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}