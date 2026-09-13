"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bot,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEnterpriseStore } from "@/store/enterpriseStore";
import { useLanguage } from "@/context/LanguageContext";
import type { NodeStatus } from "@/app/dashboard/dag/page";
import OfficerReviewConsole, {
  type ReviewCase,
} from "@/components/officer/OfficerReviewConsole";
import AskAarambhOfficerChatbot from "@/components/chat/AskAarambhOfficerChatbot";

// Map console queue refs to DAG node ids so the approval flow persists through
// the existing backend node-approval endpoint.
const NODE_BY_REF: Record<string, string> = {
  "MH-CAF-2026-00412": "node-root",
  "MH-CAF-2026-00398": "node-mpcb",
  "MH-CAF-2026-00385": "node-fire",
};

export default function OfficerWorkspacePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const {
    updateDAGNodeStatus,
    setDAGNodeStatuses,
  } = useEnterpriseStore();

  const [approvedRefs, setApprovedRefs] = useState<string[]>([]);

  if (user?.role !== "OFFICER" && user?.role !== "ADMIN") {
    return (
      <div className="bg-white rounded-2xl p-8 border border-[#FED17A] text-center max-w-lg mx-auto shadow-xs">
        <ShieldCheck className="w-12 h-12 text-[#9B2A48] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#16060E]">{t("officer_restricted") || "Restricted Officer Access"}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {t("officer_restricted_desc") || "This workspace is exclusively for verified Department Scrutiny Officers. Toggle 'Officer View' in the top bar to test."}
        </p>
      </div>
    );
  }

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const handleApprove = async (item: ReviewCase) => {
    setApprovedRefs((prev) => [...prev, item.ref]);
    const nodeId = NODE_BY_REF[item.ref];
    if (nodeId) {
      // Optimistic local bump keeps UI instant...
      updateDAGNodeStatus(nodeId, "approved");
      // ...but backend is authoritative: persist with the authenticated enterprise,
      // then reconcile the store from the nodes returned in the PATCH response.
      try {
        const res = await fetch(`${BACKEND_API_URL}/dag/${nodeId}/approve`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enterprise_id: user?.enterpriseId }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.error || data?.message || `Approval failed (HTTP ${res.status})`);
        }

        // Backend returned nodes are the source of truth — reconcile the store.
        if (data?.nodes && Array.isArray(data.nodes)) {
          const authoritative: Record<string, NodeStatus> = {};
          data.nodes.forEach((n: { id?: string; status?: string }) => {
            if (n.id && n.status) authoritative[n.id] = n.status as NodeStatus;
          });
          if (Object.keys(authoritative).length > 0) {
            setDAGNodeStatuses(authoritative);
          }
        }
      } catch (err) {
        console.error("Failed to persist DAG approval:", err);
        alert(
          `⚠️ Approval could not be persisted to the backend.\n\n${err instanceof Error ? err.message : "Unknown error"}\n\nThe optimistic local state was set, but it may not survive a refresh.`
        );
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FE7251]" />
              <span>{t("officer_console") || "Department Officer Scrutiny Console"}</span>
              </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#16060E] tracking-tight">
              Officer Review
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              {user?.department || "MIDC Industrial Clearances"} — Review incoming Common Application Forms (CAF), verify OCR field extractions, conduct inspection reports, raise formal queries, or issue digital approval certificates.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/dag"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#FFF7F0] hover:bg-[#FFF2DF] text-[#9B2A48] text-xs font-bold border border-[#FED17A] transition-colors"
            >
              <span>View Live DAG</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Notice feedback */}
        {approvedRefs.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center space-x-3 text-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-900">Endorsements recorded in this session</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                {approvedRefs.length} application(s) endorsed: {approvedRefs.join(", ")}. DAG state reconciled from the authoritative backend where deployed.
              </p>
            </div>
          </div>
        )}

        {/* Risk-Stratified Review Console */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#FE7251]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-[#16060E]">
              Risk-Stratified Review Console
            </h2>
            <span className="text-[10px] text-slate-400">
              OCR-vs-form pre-validation built in
            </span>
          </div>
          <OfficerReviewConsole onApprove={handleApprove} />
        </div>

        {/* AARAMBH Officer Chatbot */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-4 h-4 text-[#FE7251]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-[#16060E]">
              AARAMBH Officer Bot
            </h2>
            <span className="text-[10px] text-slate-400">
              Scrutiny assistant — same Groq API key as the portal chatbot
            </span>
          </div>
          <AskAarambhOfficerChatbot department={user?.department} />
        </div>
      </div>
    </div>
  );
}