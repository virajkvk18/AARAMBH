"use client";

import React from "react";
import { User, Building2, Mail, Phone, ShieldCheck, CheckCircle2, FileBadge2, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs">
        <div className="flex items-center space-x-4 border-b border-[#F0E5E0] pb-6 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9B2A48] to-[#FE7251] text-[#FFCA7C] flex items-center justify-center font-black text-2xl shadow-md">
            {user?.name ? user.name[0].toUpperCase() : "A"}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#16060E]">{user?.name || "Investor Profile"}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.enterpriseName || "Maharashtra Solvents & Chemicals Ltd"} • {user?.email}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]">
                Active Verified Profile
              </span>
              {user?.isDigiLockerVerified && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF7F0] text-[#9B2A48] border border-[#FED17A]">
                  DigiLocker Linked
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] space-y-1">
            <span className="text-[#886A75] font-bold uppercase text-[10px]">Enterprise Single Window ID</span>
            <p className="font-mono font-bold text-[#9B2A48] text-sm">{user?.enterpriseId || "ENT-MH-2026-8891"}</p>
          </div>
          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] space-y-1">
            <span className="text-[#886A75] font-bold uppercase text-[10px]">Role / Access Tier</span>
            <p className="font-bold text-[#16060E] capitalize text-sm">{user?.role || "applicant"}</p>
          </div>
          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] space-y-1">
            <span className="text-[#886A75] font-bold uppercase text-[10px]">Registered Sector</span>
            <p className="font-bold text-[#16060E]">Chemicals & Industrial Solvents</p>
          </div>
          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] space-y-1">
            <span className="text-[#886A75] font-bold uppercase text-[10px]">Industrial Zone (MIDC)</span>
            <p className="font-bold text-[#16060E]">Chakan Phase-II Industrial Estate, Pune</p>
          </div>
        </div>
      </div>
    </div>
  );
}
