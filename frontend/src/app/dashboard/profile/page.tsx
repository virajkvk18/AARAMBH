"use client";

import React from "react";
import { User, Building2, Mail, Phone, ShieldCheck, CheckCircle2, FileBadge2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-4 border-b border-slate-100 pb-6 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-indigo-400 flex items-center justify-center font-black text-2xl shadow-md">
            {user?.name ? user.name[0].toUpperCase() : "A"}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A]">{user?.name || "Investor Profile"}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.enterpriseName || "Maharashtra Solvents & Chemicals Ltd"} • {user?.email}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#059669] border border-emerald-200">
                Active Verified Profile
              </span>
              {user?.isDigiLockerVerified && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  DigiLocker Linked
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase">Enterprise Single Window ID</span>
            <p className="font-mono font-bold text-slate-900 text-sm">{user?.enterpriseId || "ENT-MH-2026-8891"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase">Role / Access Tier</span>
            <p className="font-bold text-slate-900 capitalize text-sm">{user?.role || "applicant"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase">Registered Sector</span>
            <p className="font-bold text-slate-900">Chemicals & Industrial Solvents</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase">Industrial Zone (MIDC)</span>
            <p className="font-bold text-slate-900">Chakan Phase-II Industrial Estate, Pune</p>
          </div>
        </div>
      </div>
    </div>
  );
}
