"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Award, FileCheck2, ShieldCheck, Clock, ArrowRight } from "lucide-react";
import DeemedCertificateModal, {
  type DeemedCertificateData,
} from "@/components/certificates/DeemedCertificateModal";

export interface DeemedEligibleClearance {
  id: string;
  name: string;
  department: string;
  slaDays: number;
  daysElapsed: number;
  applicationRef: string;
  enterpriseName: string;
}

interface ApplicationStatusCardProps {
  clearance: DeemedEligibleClearance | null;
  className?: string;
}

function pseudoSha256Hex(input: string): string {
  let h1 = 0x6a09e667;
  let h2 = 0xbb67ae85;
  let h3 = 0x3c6ef372;
  let h4 = 0xa54ff53a;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = (Math.imul(h1 ^ c, 2654435761) >>> 0);
    h2 = (Math.imul(h2 ^ (c << 7), 1597334677) >>> 0);
    h3 = (Math.imul(h3 ^ (c >> 2), 2246822519) >>> 0);
    h4 = (Math.imul(h4 ^ c, 3266489917) >>> 0);
  }
  const chunk = (n: number) =>
    n.toString(16).padStart(8, "0") + n.toString(16).padStart(8, "0");
  const body =
    chunk(h1 ^ h3) + chunk(h2 ^ h4) + chunk(h4 ^ h2) + chunk(h3 ^ h1);
  return body.slice(0, 64);
}

export default function ApplicationStatusCard({
  clearance,
  className = "",
}: ApplicationStatusCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const certData = useMemo<DeemedCertificateData | null>(() => {
    if (!clearance) return null;
    const base = `${clearance.applicationRef}|${clearance.name}|${clearance.department}`;
    return {
      applicationRef: clearance.applicationRef,
      enterpriseName: clearance.enterpriseName,
      clearanceName: clearance.name,
      department: clearance.department,
      slaDays: clearance.slaDays,
      deemedFrom: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      deemedRandomHash: pseudoSha256Hex(base),
    };
  }, [clearance]);

  if (!clearance) return null;

  const overdueBy = Math.max(0, clearance.daysElapsed - clearance.slaDays);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className={`rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 text-emerald-950 shadow-md shadow-emerald-100 ${className}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-200">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                Deemed Approved under Maharashtra RTS Act 2015 (Section 10)
              </span>
              <h3 className="text-base sm:text-lg font-black text-emerald-950 tracking-tight mt-2">
                {clearance.name}
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5" />
                {clearance.department}
              </p>
              <p className="text-[11px] text-emerald-700 mt-2 flex items-center gap-1.5 bg-white/70 border border-emerald-200 rounded-lg px-2.5 py-1.5 w-fit">
                <Clock className="w-3.5 h-3.5" />
                Statutory SLA of {clearance.slaDays} working days elapsed ·{" "}
                <strong>{overdueBy} days over</strong> — automatic deemed grant triggered
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-200 transition-colors cursor-pointer shrink-0"
          >
            Download Provisional Clearance Certificate (QR-Verified) 📄
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <DeemedCertificateModal
        open={modalOpen}
        data={certData}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}