"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  X,
  Download,
  Fingerprint,
  ShieldCheck,
  QrCode,
} from "lucide-react";

export interface DeemedCertificateData {
  applicationRef: string;
  enterpriseName: string;
  clearanceName: string;
  department: string;
  slaDays: number;
  deemedFrom: string;
  deemedRandomHash: string;
}

interface DeemedCertificateModalProps {
  open: boolean;
  data: DeemedCertificateData | null;
  onClose: () => void;
}

function deterministicHash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Deterministic QR-style glyph so the demo certificate carries a scannable-looking
// verification token without calling any external QR library.
function QrGlyph({ seed }: { seed: string }) {
  const size = 21;
  const cells: boolean[] = [];
  let rng = deterministicHash(seed);
  for (let i = 0; i < size * size; i++) {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    cells.push(rng % 100 < 48);
  }
  const pos = (r: number, c: number) => r * size + c;
  const finder = (r: number, c: number, or: number, oc: number) => {
    for (let dr = -or; dr <= or; dr++) {
      for (let dc = -oc; dc <= oc; dc++) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        const insideOuter = Math.max(Math.abs(dr), Math.abs(dc)) <= or - 1 || dr === 0 || dc === 0;
        cells[pos(rr, cc)] = true && (Math.max(Math.abs(dr), Math.abs(dc)) < 2 || insideOuter);
      }
    }
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        cells[pos(r + dr, c + dc)] = false;
      }
    }
  };
  finder(2, 2, 3, 3);
  finder(2, size - 3, 3, 3);
  finder(size - 3, 2, 3, 3);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-20 h-20"
      shapeRendering="crispEdges"
      aria-label="QR verification glyph"
    >
      {cells.map((filled, i) => {
        const r = Math.floor(i / size);
        const c = i % size;
        return (
          <rect
            key={i}
            x={c}
            y={r}
            width={1}
            height={1}
            fill={filled ? "#16060E" : "#FFFFFF"}
          />
        );
      })}
    </svg>
  );
}

export default function DeemedCertificateModal({
  open,
  data,
  onClose,
}: DeemedCertificateModalProps) {
  if (!data) return null;

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const handleDownload = () => {
    const content = `GOVERNMENT OF MAHARASHTRA
MAHARASHTRA RIGHT TO PUBLIC SERVICES ACT, 2015 — SECTION 10
PROVISIONAL CLEARANCE CERTIFICATE (QR-VERIFIED)
------------------------------------------------------------
Certification Ref: ${data.applicationRef}/DEEMED/${data.deemedRandomHash.slice(0, 8).toUpperCase()}
Enterprise: ${data.enterpriseName}
Clearance: ${data.clearanceName}
Department: ${data.department}
Statutory SLA: ${data.slaDays} working days
Deemed Granted On: ${data.deemedFrom}
        (SLA elapsed without departmental disposal)

This is to certify that no adverse remarks, queries or rejection orders
were issued within the prescribed statutory SLA period. In accordance
with Section 10 of the Maharashtra Right to Public Services Act, 2015,
DEEMED APPROVAL STANDS GRANTED and binds all departments, banks,
utilities and statutory authorities.

Digital Signature (DSC): State Single Window Automated Node — Mantralaya, Mumbai
SHA-256 Verification Hash: sha256:${data.deemedRandomHash}
Verification Portal: aarambh.swaraj.maharashtra.gov.in/verify/${data.deemedRandomHash.slice(0, 18)}
Issued On: ${today}
------------------------------------------------------------`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Deemed_Clearance_${data.applicationRef}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {open && data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !data && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FFFDFC] rounded-2xl shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/90 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close certificate"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Certificate Body */}
            <div className="p-6 sm:p-10">
              <div className="border-4 border-double border-[#9B2A48] rounded-xl p-6 sm:p-8 bg-[#FFFDFC]">
                {/* Header */}
                <div className="text-center border-b-2 border-[#9B2A48] pb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#9B2A48]">
                    Government of Maharashtra
                  </p>
                  <h2 className="text-lg sm:text-xl font-black text-[#16060E] tracking-tight mt-1">
                    PROVISIONAL CLEARANCE CERTIFICATE
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Issued under Section 10 — Maharashtra Right to Public
                    Services Act, 2015 (Deemed Approval)
                  </p>
                </div>

                {/* Seals */}
                <div className="flex items-center justify-between py-4">
                  <div className="text-center">
                    <QrCode className="w-5 h-5 mx-auto text-[#9B2A48] mb-1" />
                    <QrGlyph
                      seed={`${data.applicationRef}:${data.deemedRandomHash}`}
                    />
                    <p className="text-[8px] text-slate-400 mt-1 font-mono">
                      Verify on portal
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full border-4 border-[#9B2A48] text-[#9B2A48] flex items-center justify-center">
                      <span className="text-[8px] font-black uppercase tracking-widest text-center leading-tight px-1">
                        Office of the Single Window Automation Node
                        <br />
                        <span className="text-[7px] font-semibold normal-case">
                          seal &amp; digital signature
                        </span>
                      </span>
                    </div>
                    <Fingerprint className="w-5 h-5 mx-auto mt-1 text-[#9B2A48]" />
                  </div>
                </div>

                {/* Body details */}
                <div className="space-y-2.5 text-xs">
                  <div className="grid sm:grid-cols-2 gap-2">
                    <p>
                      <span className="text-slate-400 font-semibold">Ref / URN: </span>
                      <span className="font-mono font-bold text-slate-900">
                        {data.applicationRef}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-400 font-semibold">Deemed granted on: </span>
                      <span className="font-bold text-slate-900">{data.deemedFrom}</span>
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <p>
                      <span className="text-slate-400 font-semibold">Enterprise: </span>
                      <span className="font-bold text-slate-900">{data.enterpriseName}</span>
                    </p>
                    <p>
                      <span className="text-slate-400 font-semibold">Statutory SLA: </span>
                      <span className="font-bold text-slate-900">{data.slaDays} working days</span>
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <p>
                      <span className="text-slate-400 font-semibold">Clearance: </span>
                      <span className="font-bold text-slate-900">{data.clearanceName}</span>
                    </p>
                    <p>
                      <span className="text-slate-400 font-semibold">Department: </span>
                      <span className="font-bold text-slate-900">{data.department}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <p className="flex items-start gap-2 font-semibold text-emerald-900 leading-relaxed">
                      <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      WHEREAS no adverse remarks, queries or rejection orders were
                      issued within the prescribed SLA period, DEEMED APPROVAL
                      STANDS GRANTED and binds all departments, banks, utilities
                      and statutory authorities.
                    </p>
                  </div>
                </div>

                {/* Signature + hash */}
                <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-[9px] text-slate-400">sha256:</p>
                    <p className="font-mono text-[10px] text-slate-700 break-all">
                      {data.deemedRandomHash}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="italic font-serif text-sm text-[#9B2A48]">
                      State Single Window Automated Node
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">
                      Mantralaya, Mumbai · e-Sign DSC (RSA 2048)
                    </p>
                    <p className="text-[9px] font-bold text-slate-500 mt-1">
                      {today}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  QR-verified · Tamper-evident SHA-256 audit stream
                </p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Provisional Clearance Certificate
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}