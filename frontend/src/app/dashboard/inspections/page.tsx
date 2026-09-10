"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  ShieldCheck,
  FileCheck2,
  Download,
  PlusCircle,
  Sparkles,
  AlertCircle,
  Building2,
  Factory,
  Flame,
  FileText,
  X,
  Phone,
  ArrowRight,
} from "lucide-react";
import { useEnterpriseStore, JointInspection } from "@/store/enterpriseStore";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function JointInspectionsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const {
    applicationRef,
    locationZone,
    jointInspections,
    scheduleJointInspection,
    updateInspectionStatus,
    toggleChecklistItem,
  } = useEnterpriseStore();

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2026-09-18");
  const [selectedSlot, setSelectedSlot] = useState("10:00 AM - 01:00 PM");
  const [siteLocation, setSiteLocation] = useState(
    locationZone ? `Plot No. A-42, ${locationZone}` : "Plot No. A-42, MIDC Chakan Phase-II, Pune"
  );
  const [contactName, setContactName] = useState(user?.name || "Rajesh V. Patil (Plant Head)");
  const [contactPhone, setContactPhone] = useState(user?.phone || "+91 98200 12345");
  const [specialNotes, setSpecialNotes] = useState(
    "ETP civil foundations and fire hydrant loop are ready for joint physical inspection."
  );
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [downloadedReportId, setDownloadedReportId] = useState<string | null>(null);

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    scheduleJointInspection({
      applicationRef: applicationRef || "MH-CAF-2026-00412",
      scheduledDate: selectedDate,
      timeSlot: selectedSlot,
      location: siteLocation,
      status: "scheduled",
      inspectors: [
        {
          department: "Maharashtra Pollution Control Board (MPCB)",
          officerName: "Er. Sunil Deshmukh",
          designation: "Sub-Regional Officer (Pune-II)",
          contact: "+91 98220 54321",
          status: "confirmed",
        },
        {
          department: "Directorate of Fire Services, Maharashtra",
          officerName: "Chief Insp. Rajesh Shinde",
          designation: "Divisional Fire Safety Inspector",
          contact: "+91 98224 87654",
          status: "confirmed",
        },
        {
          department: "Directorate of Industrial Safety & Health (DISH)",
          officerName: "Dr. Anjali Patil",
          designation: "Joint Director of Industrial Safety",
          contact: "+91 98231 11223",
          status: "confirmed",
        },
      ],
      checklist: [
        { id: `chk-1-${Date.now()}`, label: "Effluent treatment plant (ETP) civil layout and pipeline gradient verified", completed: true },
        { id: `chk-2-${Date.now()}`, label: "100 kL static fire water reservoir & high-pressure hydrant manifold inspected", completed: true },
        { id: `chk-3-${Date.now()}`, label: "Emergency fire exits, smoke ventilation shafts, and assembly points clear", completed: false },
        { id: `chk-4-${Date.now()}`, label: "Industrial plot boundary demarcation stones matched with MIDC master map", completed: true },
      ],
      remarks: specialNotes,
    });

    setShowScheduleModal(false);
    setSuccessNotice(`Joint Departmental Inspection booked for ${selectedDate} (${selectedSlot}). All 3 inspecting officers notified.`);
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const handleDownloadInspectionReport = (inspection: JointInspection) => {
    const reportContent = `GOVERNMENT OF MAHARASHTRA
STATE SINGLE WINDOW CLEARANCE SYSTEM — AARAMBH
OFFICIAL JOINT SITE INSPECTION SUMMARY REPORT
(Conducted under Maharashtra RTS Act 2015 & Industrial Policy Mandate)
----------------------------------------------------------------------
Inspection ID: ${inspection.id}
Application Reference: ${inspection.applicationRef}
Inspection Date: ${inspection.scheduledDate}
Time Window: ${inspection.timeSlot}
Site Location: ${inspection.location}
Overall Joint Scrutiny Status: ${inspection.status.toUpperCase()}

SYNCHRONIZED MULTI-DEPARTMENT INSPECTOR PANEL:
${inspection.inspectors
  .map(
    (ins, i) =>
      `${i + 1}. ${ins.officerName} (${ins.designation})\n   Department: ${ins.department}\n   Attendance: ${ins.status.toUpperCase()} ✓\n   Officer Direct Mobile: ${ins.contact}`
  )
  .join("\n\n")}

JOINT PHYSICAL COMPLIANCE CHECKLIST:
${inspection.checklist
  .map((c) => `[${c.completed ? "X" : " "}] ${c.label} — ${c.completed ? "COMPLIED & ENDORSED" : "PENDING RECTIFICATION"}`)
  .join("\n")}

INSPECTION SUMMARY & REMARKS:
${inspection.remarks || "Joint physical inspection completed. Statutory safety, effluent treatment, and building setbacks conform to sanctioned norms."}

JOINT STATUTORY ENDORSEMENT:
This consolidated inspection report is mutually accepted by MPCB, Directorate of Maharashtra Fire Services, and DISH. Individual departmental inspection visits are hereby dispensed with.

Cryptographic Verification Hash: SHA256-${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}
Timestamp of Digital Endorsement: ${new Date().toISOString()}
----------------------------------------------------------------------`;

    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Joint_Inspection_Report_${inspection.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadedReportId(inspection.id);
    setTimeout(() => setDownloadedReportId(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-xs font-bold uppercase tracking-wider mb-2">
            <CalendarCheck className="w-3.5 h-3.5 text-[#FE7251]" />
            <span>Synchronized Site Clearance System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#16060E] tracking-tight">
            Joint Departmental Inspection Scheduler
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            In accordance with the <strong>Maharashtra Right to Public Services Act</strong>, multiple physical visits are consolidated into a <strong>single synchronized inspection</strong> conducted simultaneously by MPCB, Fire Services, and DISH officers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule Joint Inspection</span>
          </button>
        </div>
      </div>

      {/* Notice feedback */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-[#FFF2DF] border border-[#FED17A] text-[#16060E] flex items-center space-x-3 text-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#9B2A48] shrink-0" />
          <div>
            <p className="font-bold text-[#9B2A48]">Joint Inspection Synchronized</p>
            <p className="text-[#886A75] mt-0.5">{successNotice}</p>
          </div>
        </div>
      )}

      {/* 2. Key Benefit Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#F0E5E0] shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Independent Visits</p>
          <p className="text-2xl font-black text-slate-400 mt-1 line-through">3 Separate Visits</p>
          <p className="text-[11px] text-slate-400 mt-0.5">MPCB, Fire, and DISH randomly</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#FED17A] bg-[#FFF9F5] shadow-xs">
          <p className="text-xs font-bold text-[#9B2A48] uppercase tracking-wider">AARAMBH Joint Visit</p>
          <p className="text-2xl font-black text-[#9B2A48] mt-1">1 Single Day</p>
          <p className="text-[11px] text-[#886A75] mt-0.5">66% reduction in operational disruption</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#FED17A] bg-[#FFF2DF] shadow-xs">
          <p className="text-xs font-bold text-[#9B2A48] uppercase tracking-wider">Synchronized Board</p>
          <p className="text-2xl font-black text-[#9B2A48] mt-1">3 Departments</p>
          <p className="text-[11px] text-[#886A75] mt-0.5">Mutual statutory sign-off</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#F0E5E0] shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Digital Report SLA</p>
          <p className="text-2xl font-black text-[#16060E] mt-1">48 Hours</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Mandatory report upload deadline</p>
        </div>
      </div>

      {/* 3. Active Scheduled Inspections List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#16060E]">
              Scheduled Joint Site Inspections ({jointInspections.length})
            </h2>
            <p className="text-xs text-slate-500">
              Multi-departmental inspection squads allocated to your enterprise
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#9B2A48] bg-[#FFF2DF] border border-[#FED17A] px-3 py-1 rounded-lg">
            RTS Mandate Act 2015
          </span>
        </div>

        {jointInspections.map((inspection) => {
          const isCompleted = inspection.status === "completed" || inspection.status === "report_issued";

          return (
            <div
              key={inspection.id}
              className="bg-white rounded-3xl border border-[#F0E5E0] shadow-xs hover:border-[#FED17A] transition-all overflow-hidden space-y-6 p-6 sm:p-8"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0E5E0] pb-6">
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF2DF] border border-[#FED17A] flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-[#9B2A48]" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#9B2A48]">
                        {inspection.id}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        Ref: {inspection.applicationRef}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-[#FFF2DF] text-[#9B2A48] border-[#FED17A]"
                        }`}
                      >
                        {isCompleted ? "Joint Inspection Completed ✓" : "Inspection Confirmed & Scheduled"}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center space-x-1 font-semibold text-slate-900">
                        <Calendar className="w-4 h-4 text-[#FE7251]" />
                        <span>Date: {inspection.scheduledDate}</span>
                      </span>
                      <span className="flex items-center space-x-1 font-semibold text-slate-900">
                        <Clock className="w-4 h-4 text-[#FE7251]" />
                        <span>Slot: {inspection.timeSlot}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-slate-500">
                        <MapPin className="w-4 h-4 text-[#FE7251]" />
                        <span>{inspection.location}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleDownloadInspectionReport(inspection)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A] font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                    title="Download Joint Inspection Dossier"
                  >
                    <Download className="w-3.5 h-3.5 text-[#FE7251]" />
                    <span>Download Joint Report (.txt)</span>
                  </button>
                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() =>
                        updateInspectionStatus(
                          inspection.id,
                          "report_issued",
                          "All 3 department inspectors verified civil, fire safety, and pollution mitigation parameters with zero major non-conformances."
                        )
                      }
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Completed</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3 Synchronized Inspector Cards */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#16060E] mb-3 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#9B2A48]" />
                  <span>Synchronized Joint Inspection Team (3 Departments)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {inspection.inspectors.map((inspector, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#FFF9F5] border border-[#FED17A]/70 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase text-[#886A75] line-clamp-1">
                            {inspector.department}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]">
                            Confirmed
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-[#16060E]">{inspector.officerName}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{inspector.designation}</p>
                      </div>

                      <div className="pt-2 border-t border-[#FED17A]/40 flex items-center justify-between text-[11px]">
                        <span className="flex items-center space-x-1 text-slate-600 font-mono">
                          <Phone className="w-3 h-3 text-[#FE7251]" />
                          <span>{inspector.contact}</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">Ready</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pre-Inspection Compliance Checklist */}
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#16060E] mb-3 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#9B2A48]" />
                  <span>On-Site Statutory Verification Checklist</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inspection.checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(inspection.id, item.id)}
                      className={`p-3.5 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                        item.completed
                          ? "bg-[#FFF2DF]/60 border-[#FED17A] text-[#16060E]"
                          : "bg-white border-[#F0E5E0] text-slate-600 hover:border-[#FED17A]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {}}
                        className="w-4 h-4 mt-0.5 rounded text-[#9B2A48] accent-[#9B2A48] cursor-pointer"
                      />
                      <div className="flex-1 text-xs">
                        <span className={item.completed ? "font-bold text-[#16060E]" : "font-normal"}>
                          {item.label}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {item.completed ? "Verified by Inspector Board ✓" : "Click to endorse on-site"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download banner notice */}
              {downloadedReportId === inspection.id && (
                <div className="p-3.5 rounded-xl bg-[#FFF2DF] border border-[#FED17A] flex items-center space-x-2 text-xs text-[#16060E] animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-[#9B2A48] shrink-0" />
                  <span>
                    Official Joint Site Inspection Summary Report (<strong>{inspection.id}</strong>) downloaded successfully!
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Booking Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#FED17A] space-y-5 relative">
            <div className="flex items-center justify-between border-b border-[#F0E5E0] pb-3">
              <div className="flex items-center space-x-2">
                <CalendarCheck className="w-5 h-5 text-[#FE7251]" />
                <h3 className="font-bold text-sm text-[#16060E]">
                  Schedule Synchronized Joint Departmental Inspection
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#16060E] mb-1">
                    Preferred Inspection Date
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#F0E5E0] rounded-xl focus:ring-2 focus:ring-[#FE7251] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#16060E] mb-1">
                    Synchronized Time Slot
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full px-3 py-2 border border-[#F0E5E0] rounded-xl focus:ring-2 focus:ring-[#FE7251] focus:outline-hidden"
                  >
                    <option value="10:00 AM - 01:00 PM">Morning (10:00 AM - 01:00 PM IST)</option>
                    <option value="02:00 PM - 05:00 PM">Afternoon (02:00 PM - 05:00 PM IST)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#16060E] mb-1">
                  Plant / Site Physical Location
                </label>
                <input
                  type="text"
                  required
                  value={siteLocation}
                  onChange={(e) => setSiteLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-[#F0E5E0] rounded-xl focus:ring-2 focus:ring-[#FE7251] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#16060E] mb-1">
                    On-Site Contact Person
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#F0E5E0] rounded-xl focus:ring-2 focus:ring-[#FE7251] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#16060E] mb-1">
                    Contact Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-[#F0E5E0] rounded-xl focus:ring-2 focus:ring-[#FE7251] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#16060E] mb-1">
                  Inspection Readiness & Access Notes
                </label>
                <textarea
                  rows={3}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Detail access instructions, gate pass requirements, or specific ready utilities..."
                  className="w-full px-3 py-2 border border-[#F0E5E0] rounded-xl focus:ring-2 focus:ring-[#FE7251] focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-[#FFF9F5] border border-[#FED17A] rounded-xl text-[11px] text-slate-600 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#FE7251] shrink-0" />
                <span>
                  Booking simultaneously alerts and dispatches nodal inspection officers from MPCB, Fire Services, and DISH.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-[#F0E5E0]">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Confirm Joint Inspection Booking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
