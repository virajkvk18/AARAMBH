"use client";

import React, { useState } from "react";
import { MessageSquareWarning, PlusCircle, CheckCircle2, Clock, AlertCircle, Sparkles, Send } from "lucide-react";

export default function GrievancesPage() {
  const [showModal, setShowModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDept, setTicketDept] = useState("Maharashtra Pollution Control Board");
  const [ticketDetails, setTicketDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setShowModal(false);
      setSubmitted(false);
      setTicketSubject("");
      setTicketDetails("");
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0E5E0] pb-6 mb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-xs font-bold uppercase tracking-wider mb-2">
              <MessageSquareWarning className="w-3.5 h-3.5 text-[#FE7251]" />
              <span>Grievance & Dispute Desk</span>
            </div>
            <h1 className="text-2xl font-black text-[#16060E] tracking-tight">
              Dispute Redressal & Officer Query Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Time-bound statutory resolution for delays, inspection queries, or payment reconciliations under Maharashtra RTS Act.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#7D1E36] hover:to-[#E55B3B] text-white text-xs font-bold shadow-md shadow-[#FE7251]/20 cursor-pointer shrink-0 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Raise New Ticket</span>
          </button>
        </div>

        {/* Existing Query / Grievance Card */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#FFF9F5] border border-[#FED17A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#9B2A48]">TICKET #GRV-2026-098</span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]">
                Under Active Scrutiny
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#16060E]">
              Provisional Fire NOC - Clarification on Underground Static Tank Capacity
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              State Fire Directorate requested civil cross-sectional blueprint for 100kL underground storage tank. Scrutiny response due within statutory deadline.
            </p>
            <div className="pt-2 border-t border-[#FED17A]/40 flex items-center justify-between text-xs">
              <span className="text-[#886A75] text-[11px]">Raised by Directorate of Maharashtra Fire Services</span>
              <span className="font-bold text-[#9B2A48] text-[11px]">Response SLA: 3 Working Days</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#F0E5E0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#16060E]">TICKET #GRV-2026-042</span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]">
                Resolved & Closed ✓
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#16060E]">
              MIDC Land Allotment Boundary Coordinates Confirmation
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Zonal sub-division verified with Chakan industrial estate GIS survey map. Deemed boundary approval endorsed.
            </p>
            <div className="pt-2 border-t border-[#F0E5E0] flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px]">Department: MIDC Chakan Sub-Division</span>
              <span className="text-[11px] font-semibold text-[#9B2A48]">Closed on 18-Feb-2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Raise Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#FED17A] shadow-2xl relative">
            <div className="flex items-center space-x-2 text-[#9B2A48] mb-2">
              <Sparkles className="w-4 h-4 text-[#FE7251]" />
              <span className="text-xs font-bold uppercase tracking-wider">Statutory Escalation</span>
            </div>
            <h3 className="text-xl font-black text-[#16060E] mb-1">Raise Grievance or Officer Query</h3>
            <p className="text-xs text-slate-500 mb-6">Your ticket will be routed directly to the designated nodal officer.</p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-[#FFF2DF] border border-[#FED17A] text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#9B2A48] mx-auto" />
                <h4 className="text-sm font-bold text-[#16060E]">Grievance Ticket Created!</h4>
                <p className="text-xs text-[#886A75]">Ticket #GRV-2026-114 has been recorded with a 72-hour RTS Act SLA.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-1">Target Department</label>
                  <select
                    value={ticketDept}
                    onChange={(e) => setTicketDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                  >
                    <option value="MIDC">MIDC Land Allotment</option>
                    <option value="MPCB">Maharashtra Pollution Control Board (MPCB)</option>
                    <option value="FIRE">Directorate of Maharashtra Fire Services</option>
                    <option value="DISH">Directorate of Industrial Safety & Health (DISH)</option>
                    <option value="MSEDCL">Maharashtra State Electricity Distribution (MSEDCL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-1">Subject / Clear Query Summary</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clarification on Effluent Treatment Plant standard"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16060E] uppercase tracking-wider mb-1">Detailed Description</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide reference numbers, application IDs, or specific statutory questions..."
                    value={ticketDetails}
                    onChange={(e) => setTicketDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#FE7251]"
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
                    className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#7D1E36] hover:to-[#E55B3B] text-white text-xs font-bold shadow-md shadow-[#FE7251]/20 cursor-pointer"
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
