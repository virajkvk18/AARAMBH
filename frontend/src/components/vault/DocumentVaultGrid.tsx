"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Download,
  FileQuestion,
} from "lucide-react";

export type VaultDocStatus =
  | "ACTIVE_VALID"
  | "EXPIRING_SOON"
  | "EXPIRED"
  | "PENDING_REVIEW";

export interface VaultCertificateDoc {
  id: string;
  name: string;
  issuingAuthority: string;
  issueDate: string;
  expiresAt?: string;
  status?: VaultDocStatus;
  fileUrl?: string;
}

const STATUS_META: Record<
  VaultDocStatus,
  {
    label: string;
    chipClass: string;
    dotClass: string;
  }
> = {
  ACTIVE_VALID: {
    label: "ACTIVE VALID",
    chipClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  EXPIRING_SOON: {
    label: "EXPIRING SOON",
    chipClass: "bg-amber-50 text-amber-800 border-amber-200",
    dotClass: "bg-amber-500",
  },
  EXPIRED: {
    label: "EXPIRED",
    chipClass: "bg-rose-50 text-rose-800 border-rose-200",
    dotClass: "bg-rose-500",
  },
  PENDING_REVIEW: {
    label: "PENDING REVIEW",
    chipClass: "bg-violet-50 text-violet-800 border-violet-200",
    dotClass: "bg-violet-500",
  },
};

export function computeDocStatus(
  doc: Pick<VaultCertificateDoc, "status" | "expiresAt">
): VaultDocStatus {
  if (doc.status) return doc.status;
  if (!doc.expiresAt) return "PENDING_REVIEW";
  const millis = new Date(doc.expiresAt).getTime() - Date.now();
  const days = millis / 86400000;
  if (days <= 0) return "EXPIRED";
  if (days <= 30) return "EXPIRING_SOON";
  return "ACTIVE_VALID";
}

function daysRemainingText(expiresAt?: string): string | null {
  if (!expiresAt) return null;
  const millis = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(millis / 86400000);
  if (days <= 0) return "Renewal overdue";
  if (days === 1) return "Expires in 1 day";
  return `Expires in ${days} days`;
}

interface DocumentVaultGridProps {
  documents: VaultCertificateDoc[];
  onView?: (doc: VaultCertificateDoc) => void;
  onDownload?: (doc: VaultCertificateDoc) => void;
  className?: string;
}

export default function DocumentVaultGrid({
  documents,
  onView,
  onDownload,
  className = "",
}: DocumentVaultGridProps) {
  const enriched = useMemo(
    () =>
      documents.map((doc) => ({
        ...doc,
        status: computeDocStatus(doc),
      })),
    [documents]
  );

  const alerts = enriched.filter(
    (d) => d.status === "EXPIRING_SOON" || d.status === "EXPIRED"
  );

  const alertCounts = {
    expiring: enriched.filter((d) => d.status === "EXPIRING_SOON").length,
    expired: enriched.filter((d) => d.status === "EXPIRED").length,
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Alert Banner */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-900"
        >
          <span className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-rose-800">
              Statutory Compliance Warning
            </p>
            <p className="text-xs font-medium mt-1 leading-relaxed">
              {alertCounts.expired > 0
                ? "⚠️ Statutory Compliance Warning: " +
                  alerts
                    .slice(0, 2)
                    .map((d) => d.name)
                    .join(" and ") +
                  ` ${alertCounts.expired > 0 ? "have lapsed" : "require renewal"} — action needed immediately.`
                : `⚠️ Statutory Compliance Warning: ${alerts
                    .slice(0, 2)
                    .map((d) => d.name)
                    .join(" and ")} require renewal within 14 days.`}
            </p>
          </div>
        </motion.div>
      )}

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {enriched.map((doc, idx) => {
          const meta = STATUS_META[doc.status];
          const statusText = daysRemainingText(doc.expiresAt);
          const IconComp =
            doc.status === "EXPIRED"
              ? AlertTriangle
              : doc.status === "EXPIRING_SOON"
              ? Clock
              : doc.status === "PENDING_REVIEW"
              ? FileQuestion
              : CheckCircle2;
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * idx, duration: 0.3 }}
              className="rounded-2xl border border-slate-200 bg-white shadow-xs p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${meta.chipClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
                  {meta.label}
                </span>
                <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {doc.name}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {doc.issuingAuthority}
                </p>
              </div>

              <div className="text-[10px] text-slate-500 space-y-0.5">
                <p>Issued: {doc.issueDate}</p>
                {statusText && (
                  <p className="flex items-center gap-1 font-semibold">
                    <IconComp
                      className={`w-3 h-3 ${
                        doc.status === "EXPIRED"
                          ? "text-rose-500"
                          : doc.status === "EXPIRING_SOON"
                          ? "text-amber-500"
                          : "text-emerald-500"
                      }`}
                    />
                    <span
                      className={
                        doc.status === "EXPIRED"
                          ? "text-rose-700"
                          : doc.status === "EXPIRING_SOON"
                          ? "text-amber-700"
                          : "text-slate-600"
                      }
                    >
                      {doc.expiresAt ? `${statusText} · ${doc.expiresAt}` : statusText}
                    </span>
                  </p>
                )}
              </div>

              <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                {/* Expiry countdown bar */}
                <div className="flex-1 mr-3">
                  {doc.expiresAt && doc.status !== "ACTIVE_VALID" && (
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full ${
                          doc.status === "EXPIRED"
                            ? "bg-rose-500"
                            : "bg-amber-400"
                        }`}
                        style={{
                          width: `${
                            doc.status === "EXPIRED" ? 100 : 30
                          }%`,
                        }}
                      />
                    </div>
                  )}
                  {!doc.expiresAt && (
                    <span className="text-[10px] text-violet-600 font-semibold">
                      Under statutory review
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onView && (
                    <button
                      type="button"
                      onClick={() => onView(doc)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#FE7251] hover:border-[#FE7251] transition-colors cursor-pointer"
                      aria-label={`View ${doc.name}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDownload && (
                    <button
                      type="button"
                      onClick={() => onDownload(doc)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#FE7251] hover:border-[#FE7251] transition-colors cursor-pointer"
                      aria-label={`Download ${doc.name}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}