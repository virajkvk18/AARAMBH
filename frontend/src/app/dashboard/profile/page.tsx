"use client";

import React from "react";
import {
  User,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  FileBadge2,
  Sparkles,
  CreditCard,
  MapPin,
  Cpu,
  Layers,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEnterpriseStore } from "@/store/enterpriseStore";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const {
    sector,
    locationZone,
    capexCr,
    powerLoadKva,
    applicationRef,
    applicationStatus,
    extractedFields,
  } = useEnterpriseStore();

  const pan = user?.panNumber || extractedFields.pan?.value || "AAECS8891M";
  const gstin = extractedFields.gstin?.value || "27AAECS8891M1Z8";
  const aadhaar = extractedFields.aadhaar?.value || (user?.isDigiLockerVerified ? "XXXXXXXX8891" : "Not Linked");

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-5 border-b border-[#F0E5E0] pb-6 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9B2A48] to-[#FE7251] text-[#FFCA7C] flex items-center justify-center font-black text-2xl shadow-md shrink-0">
            {user?.name ? user.name[0].toUpperCase() : "M"}
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-black text-[#16060E]">
              {user?.name || "Enterprise Signatory"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.enterpriseName || extractedFields.entity_name?.value || "Maharashtra Solvents & Chemicals Pvt Ltd"} • {user?.email || "investor@maharashtra-solvents.com"}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A] flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-[#FE7251]" />
                <span>Active Verified Entity</span>
              </span>
              {user?.isDigiLockerVerified && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF7F0] text-[#9B2A48] border border-[#FED17A] flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-[#FE7251]" />
                  <span>DigiLocker Linked</span>
                </span>
              )}
              {applicationRef && (
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#9B2A48] text-[#FFCA7C]">
                  CAF: {applicationRef}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] space-y-1">
            <span className="text-[#886A75] font-bold uppercase text-[10px] flex items-center space-x-1">
              <Building2 className="w-3 h-3 text-[#FE7251]" />
              <span>{t("profile_enterprise_id") || "Enterprise ID"}</span>
            </span>
            <p className="font-mono font-bold text-[#9B2A48] text-sm">
              {user?.enterpriseId || "ENT-MH-2026-8891"}
            </p>
          </div>

          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] space-y-1">
            <span className="text-[#886A75] font-bold uppercase text-[10px] flex items-center space-x-1">
              <User className="w-3 h-3 text-[#FE7251]" />
              <span>{t("profile_role") || "Role / Access Tier"}</span>
            </span>
            <p className="font-bold text-[#16060E] capitalize text-sm">
              {user?.role === "officer" ? `Nodal Scrutiny Officer (${user.department || "MIDC"})` : "Authorized Industrial Investor"}
            </p>
          </div>

          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] space-y-1">
            <span className="text-[#886A75] font-bold uppercase text-[10px] flex items-center space-x-1">
              <CreditCard className="w-3 h-3 text-[#FE7251]" />
              <span>Enterprise PAN</span>
            </span>
            <p className="font-mono font-bold text-[#16060E] text-sm">{pan}</p>
          </div>

          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] space-y-1">
            <span className="text-[#886A75] font-bold uppercase text-[10px] flex items-center space-x-1">
              <FileBadge2 className="w-3 h-3 text-[#FE7251]" />
              <span>Maharashtra GSTIN</span>
            </span>
            <p className="font-mono font-bold text-[#16060E] text-sm">{gstin}</p>
          </div>

          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] space-y-1">
            <span className="text-[#886A75] font-bold uppercase text-[10px] flex items-center space-x-1">
              <Layers className="w-3 h-3 text-[#FE7251]" />
              <span>{t("profile_sector") || "Industry Sector"}</span>
            </span>
            <p className="font-bold text-[#16060E]">{sector || "Chemical Manufacturing & Solvents"}</p>
          </div>

          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] space-y-1">
            <span className="text-[#886A75] font-bold uppercase text-[10px] flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-[#FE7251]" />
              <span>{t("profile_location") || "Industrial Zone (MIDC)"}</span>
            </span>
            <p className="font-bold text-[#16060E]">{locationZone || "Chakan Phase-II Industrial Area, Pune"}</p>
          </div>

          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] space-y-1">
            <span className="text-[#886A75] font-bold uppercase text-[10px] flex items-center space-x-1">
              <Phone className="w-3 h-3 text-[#FE7251]" />
              <span>Contact Phone</span>
            </span>
            <p className="font-bold text-[#16060E]">{user?.phone || "+91 98200 12345"}</p>
          </div>

          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] space-y-1">
            <span className="text-[#886A75] font-bold uppercase text-[10px] flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-[#FE7251]" />
              <span>Sanctioned Power Load & Capex</span>
            </span>
            <p className="font-bold text-[#16060E]">
              {powerLoadKva || 250} kVA • ₹{capexCr || 35} Crores
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

