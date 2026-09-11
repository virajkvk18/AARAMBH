"use client";

import React, { useState } from "react";
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
  Edit3,
  X,
  Save,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEnterpriseStore } from "@/store/enterpriseStore";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const {
    sector,
    locationZone,
    district: storedDistrict,
    capexCr,
    powerLoadKva,
    applicationRef,
    applicationStatus,
    extractedFields,
    masterCAF,
    updateMasterCAF,
    setFormData,
  } = useEnterpriseStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || masterCAF.companyDetails.signatoryName || "");
  const [editEmail, setEditEmail] = useState(user?.email || masterCAF.companyDetails.signatoryEmail || "");
  const [editPhone, setEditPhone] = useState(user?.phone || masterCAF.companyDetails.signatoryMobile || "");
  const [editCompanyName, setEditCompanyName] = useState(user?.enterpriseName || masterCAF.companyDetails.companyName || "");
  const [editPan, setEditPan] = useState(user?.panNumber || masterCAF.companyDetails.pan || "");
  const [editGstin, setEditGstin] = useState(extractedFields.gstin?.value || masterCAF.companyDetails.gstin || "");
  const [editAddress, setEditAddress] = useState(user?.addressLine1 || masterCAF.locationDetails.address || "");
  const [editDistrict, setEditDistrict] = useState(user?.district || storedDistrict || masterCAF.locationDetails.district || "");

  // Synchronize edit form whenever user or masterCAF updates
  React.useEffect(() => {
    if (user) {
      if (user.name) setEditName(user.name);
      if (user.email) setEditEmail(user.email);
      if (user.phone) setEditPhone(user.phone);
      if (user.enterpriseName) setEditCompanyName(user.enterpriseName);
      if (user.panNumber) setEditPan(user.panNumber);
      if (user.addressLine1) setEditAddress(user.addressLine1);
      if (user.district) setEditDistrict(user.district);
    }
  }, [user]);

  const pan = user?.panNumber || masterCAF.companyDetails.pan || extractedFields.pan?.value || "Not Provided";
  const gstin = extractedFields.gstin?.value || masterCAF.companyDetails.gstin || "Not Provided";
  const companyName = user?.enterpriseName || masterCAF.companyDetails.companyName || "Your Enterprise";
  const signatoryName = user?.name || masterCAF.companyDetails.signatoryName || "Authorized Signatory";

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const profileError = await updateProfile({
      name: editName,
      enterpriseName: editCompanyName,
      phone: editPhone,
      panNumber: editPan.toUpperCase(),
      addressLine1: editAddress,
      district: editDistrict,
      enterpriseId: user?.enterpriseId || "ENT-MH-2026-8891",
    });
    if (profileError) return;

    // 2. Update Master CAF in Enterprise Store
    updateMasterCAF({
      companyDetails: {
        ...masterCAF.companyDetails,
        companyName: editCompanyName,
        pan: editPan.toUpperCase(),
        gstin: editGstin.toUpperCase(),
        signatoryName: editName,
        signatoryEmail: editEmail,
        signatoryMobile: editPhone,
      },
      locationDetails: {
        ...masterCAF.locationDetails,
        address: editAddress,
        district: editDistrict,
      },
    });

    setFormData({
      district: editDistrict,
      locationZone: `${editDistrict} Industrial Zone`,
    });

    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0E5E0] pb-6 mb-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-[#FE7251] text-white flex items-center justify-center font-black text-2xl shadow-xs shrink-0">
              {signatoryName ? signatoryName[0].toUpperCase() : "M"}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#16060E]">
                My Business Profile
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {signatoryName ? `${signatoryName} • ` : ""}{companyName} • {user?.email || "No email"}
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

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#FFF9F5] hover:bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile Details</span>
          </button>
        </div>

        {/* Profile Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] space-y-1">
            <span className="text-[#886A75] font-bold uppercase text-[10px] flex items-center space-x-1">
              <Building2 className="w-3 h-3 text-[#FE7251]" />
              <span>Enterprise ID</span>
            </span>
            <p className="font-mono font-bold text-[#9B2A48] text-sm">
              {user?.enterpriseId || (user?.id ? `ENT-MH-${user.id.slice(0, 8).toUpperCase()}` : "Not Assigned")}
            </p>
          </div>

          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] space-y-1">
            <span className="text-[#886A75] font-bold uppercase text-[10px] flex items-center space-x-1">
              <User className="w-3 h-3 text-[#FE7251]" />
              <span>Role / Access Tier</span>
            </span>
            <p className="font-bold text-[#16060E] capitalize text-sm">
              {user?.role === "OFFICER" ? `Nodal Scrutiny Officer (${user.department || "MIDC"})` : "Authorized Industrial Signatory"}
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
              <span>Industry Sector</span>
            </span>
            <p className="font-bold text-[#16060E]">{sector || "Not Specified"}</p>
          </div>

          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] space-y-1">
            <span className="text-[#886A75] font-bold uppercase text-[10px] flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-[#FE7251]" />
              <span>Registered Address / Location</span>
            </span>
            <p className="font-bold text-[#16060E]">{user?.addressLine1 || masterCAF.locationDetails.address || locationZone || "Not Provided"}</p>
          </div>

          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] space-y-1">
            <span className="text-[#886A75] font-bold uppercase text-[10px] flex items-center space-x-1">
              <Phone className="w-3 h-3 text-[#FE7251]" />
              <span>Contact Phone</span>
            </span>
            <p className="font-bold text-[#16060E]">{user?.phone || masterCAF.companyDetails.signatoryMobile || "Not Provided"}</p>
          </div>

          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#F0E5E0] space-y-1">
            <span className="text-[#886A75] font-bold uppercase text-[10px] flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-[#FE7251]" />
              <span>Sanctioned Power Load & Capex</span>
            </span>
            <p className="font-bold text-[#16060E]">
              {powerLoadKva ? `${powerLoadKva} kVA` : "Pending Assessment"} • {capexCr ? `₹${capexCr} Crores` : "Pending Assessment"}
            </p>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsEditing(false)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#F0E5E0] space-y-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#F0E5E0] pb-4">
              <div>
                <h3 className="text-lg font-black text-[#16060E]">Edit Investor Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">Update authorized enterprise credentials & legal registry data</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-name" className="block font-bold text-[#16060E] uppercase mb-1">Signatory Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#FE7251]"
                  />
                </div>

                <div>
                  <label htmlFor="edit-company" className="block font-bold text-[#16060E] uppercase mb-1">Company / Enterprise Name</label>
                  <input
                    id="edit-company"
                    type="text"
                    value={editCompanyName}
                    onChange={(e) => setEditCompanyName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#FE7251]"
                  />
                </div>

                <div>
                  <label htmlFor="edit-email" className="block font-bold text-[#16060E] uppercase mb-1">Email Address</label>
                  <input
                    id="edit-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#FE7251]"
                  />
                </div>

                <div>
                  <label htmlFor="edit-phone" className="block font-bold text-[#16060E] uppercase mb-1">Contact Phone</label>
                  <input
                    id="edit-phone"
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#FE7251]"
                  />
                </div>

                <div>
                  <label htmlFor="edit-pan" className="block font-bold text-[#16060E] uppercase mb-1">Corporate PAN</label>
                  <input
                    id="edit-pan"
                    type="text"
                    value={editPan}
                    onChange={(e) => setEditPan(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-[#FE7251]"
                  />
                </div>

                <div>
                  <label htmlFor="edit-gstin" className="block font-bold text-[#16060E] uppercase mb-1">Maharashtra GSTIN</label>
                  <input
                    id="edit-gstin"
                    type="text"
                    value={editGstin}
                    onChange={(e) => setEditGstin(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-[#FE7251]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-district" className="block font-bold text-[#16060E] uppercase mb-1">District</label>
                <input
                  id="edit-district"
                  type="text"
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#FE7251]"
                />
              </div>

              <div>
                <label htmlFor="edit-address" className="block font-bold text-[#16060E] uppercase mb-1">Plot / Factory Address</label>
                <textarea
                  id="edit-address"
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FFFDFC] border border-[#F0E5E0] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#FE7251]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#F0E5E0]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
