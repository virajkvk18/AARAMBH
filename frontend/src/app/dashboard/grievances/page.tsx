"use client";

import React, { useState } from "react";
import {
  MessageSquareWarning,
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Send,
  X,
  ShieldAlert,
} from "lucide-react";
import { useEnterpriseStore } from "@/store/enterpriseStore";
import { useLanguage } from "@/context/LanguageContext";

export default function GrievancesPage() {
  const { t } = useLanguage();
  const { grievanceTickets, addGrievanceTicket, resolveGrievanceTicket } = useEnterpriseStore();

  const [showModal, setShowModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDept, setTicketDept] = useState("Maharashtra Pollution Control Board");
  const [ticketDetails, setTicketDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDetails.trim()) return;

    addGrievanceTicket({
      subject: ticketSubject,
      category: ticketDept,
      description: ticketDetails,
      status: "in_progress",
    });

    setSubmitted(true);
    setTimeout(() => {
      setShowModal(false);
      setSubmitted(false);
      setTicketSubject("");
      setTicketDetails("");
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0E5E0] pb-6 mb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-xs font-bold uppercase tracking-wider mb-2">
              <MessageSquareWarning className="w-3.5 h-3.5 text-[#FE7251]" />
              <span>{t("grievances_title") || "Grievance & Dispute Redressal"}</span>
            </div>
            <h1 className="text-2xl font-black text-[#16060E] tracking-tight">
              Dispute Redressal & Officer Query Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Time-bound statutory resolution for delays, inspection queries, or payment reconciliations under Maharashtra RTS Act 2015.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold shadow-xs cursor-pointer shrink-0 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t("raise_grievance") || "Raise New Ticket"}</span>
          </button>
        </div>

        {/* Live Grievance Tickets List from Store */}
        <div className="space-y-4">
          {grievanceTickets && grievanceTickets.length > 0 ? (
            grievanceTickets.map((ticket) => {
              const isResolved = ticket.status === "resolved";

              return (
                <div
                  key={ticket.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    isResolved
                      ? "bg-white border-[#F0E5E0]"
                      : "bg-[#FFF9F5] border-[#FED17A] shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-xs font-bold ${isResolved ? "text-slate-700" : "text-[#9B2A48]"}`}>
                      TICKET #{ticket.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isResolved
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-[#FFF2DF] text-[#9B2A48] border-[#FED17A]"
                      }`}
                    >
                      {isResolved ? "Resolved ✓" : "In Progress"}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#16060E]">{ticket.subject}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {ticket.details || ticket.description}
                  </p>

                  <div className="pt-2 border-t border-[#FED17A]/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[#886A75] text-[11px]">
                      Department: <strong>{ticket.department || ticket.category}</strong> • Date: {ticket.date || ticket.createdAt}
                    </span>

                    {!isResolved && (
                      <button
                        type="button"
                        onClick={() => resolveGrievanceTicket(ticket.id, "Resolved via Portal Desk")}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                      >
                        Mark Resolved ✓
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-[#FED17A] bg-[#FFF9F5] text-center text-xs text-slate-500">
              No active grievances or officer queries logged.
            </div>
          )}
        </div>
      </div>

      {/* Raise Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#FED17A] shadow-2xl relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-[#9B2A48]">
                <Sparkles className="w-4 h-4 text-[#FE7251]" />
                <span className="text-xs font-bold uppercase tracking-wider">Statutory Escalation</span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-xl font-black text-[#16060E] mb-1">Raise Grievance or Query</h3>
            <p className="text-xs text-slate-500 mb-6">
              Your ticket will be recorded in the portal state and routed directly to the designated nodal department officer.
            </p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-[#FFF2DF] border border-[#FED17A] text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#9B2A48] mx-auto" />
                <h4 className="text-sm font-bold text-[#16060E]">Grievance Ticket Created!</h4>
                <p className="text-xs text-[#886A75]">Your grievance has been recorded with a 72-hour RTS Act SLA.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-1">
                    Target Department
                  </label>
                  <select
                    value={ticketDept}
                    onChange={(e) => setTicketDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                  >
                    <option value="MIDC">MIDC Land Allotment</option>
                    <option value="MPCB">Maharashtra Pollution Control Board (MPCB)</option>
                    <option value="FIRE">Directorate of Maharashtra Fire Services</option>
                    <option value="DISH">Directorate of Industrial Safety & Health (DISH)</option>
                    <option value="MSEDCL">Maharashtra State Electricity Distribution (MSEDCL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-1">
                    Subject / Summary
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clarification on Effluent Treatment Plant standard"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-1">
                    Detailed Description
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide reference numbers, application IDs, or specific statutory questions..."
                    value={ticketDetails}
                    onChange={(e) => setTicketDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#F0E5E0]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Grievance</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

