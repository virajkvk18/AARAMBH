"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Building2,
  Factory,
  Flame,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  FileText,
  Eye,
  Trash2,
  AlertCircle,
  Clock,
  Coins,
  FileCheck2,
  Printer,
  ChevronRight,
  Save,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Info,
  Building,
  User,
  Check,
  Layers,
  FolderLock,
} from "lucide-react";
import {
  getApprovalConfig,
  ApprovalConfig,
  FormFieldConfig,
  DocumentRequirementConfig,
} from "@/data/approvalsRegistry";
import { useEnterpriseStore, UploadedDocument } from "@/store/enterpriseStore";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  buildAutofillSuggestions,
  summarizeAutofill,
  applyAutofill,
  saveFilingRecord,
  getPreviousFiling,
  estimateTimeSavedMinutes,
  SOURCE_META,
  AutofillReport,
} from "@/lib/formAutofill";

const VAULT_MATCH_STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "under",
  "act",
  "form",
  "certificate",
  "documents",
  "document",
  "plan",
  "policy",
  "note",
]);

function matchVaultDocument(title: string, vaultDocs: UploadedDocument[]): UploadedDocument | null {
  const keywords = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !VAULT_MATCH_STOPWORDS.has(w));

  let best: UploadedDocument | null = null;
  let bestScore = 0;
  vaultDocs.forEach((doc) => {
    const name = `${doc.name} ${(doc.extractedFields && Object.keys(doc.extractedFields).join(" ")) || ""}`.toLowerCase();
    let score = 0;
    keywords.forEach((kw) => {
      if (name.includes(kw)) score += 1;
    });
    if (score > bestScore) {
      bestScore = score;
      best = doc;
    }
  });
  return bestScore >= 1 ? best : null;
}

interface UploadedFileRecord {
  file?: File;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  previewUrl?: string;
  fromVault?: boolean;
}

export default function ApplyApprovalPage({
  params,
}: {
  params: Promise<{ approvalId: string }>;
}) {
  const resolvedParams = use(params);
  const approvalId = resolvedParams.approvalId;
  const config = getApprovalConfig(approvalId);
  usePageTitle(config?.meta?.title ? `${config.meta.title} | AARAMBH` : "Apply | AARAMBH");

  const { t } = useLanguage();
  const { user } = useAuth();
  const enterpriseStore = useEnterpriseStore();

  // Active step: 1: Applicant, 2: Business, 3: Project, 4: Compliance, 5: Documents, 6: Review
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedRef, setSubmittedRef] = useState<string>("");
  const [submissionTime, setSubmissionTime] = useState<string>("");
  const [slaTargetDate, setSlaTargetDate] = useState<string>("");

  // Form State
  const [formData, setFormData] = useState<Record<string, any>>({
    // Step 1: Applicant
    applicantName: "",
    applicantDesignation: "Director",
    applicantEmail: "",
    applicantMobile: "",
    applicantAadhaar: "",
    commAddress: "",
    commCity: "Pune",
    commPincode: "",

    // Step 2: Business
    businessName: "",
    constitutionType: "Private Limited Company",
    businessPan: "",
    businessGstin: "",
    udyamNumber: "",
    regOfficeAddress: "",
    incorporationDate: "",

    // Review legal declaration
    declarationAgreed: false,
  });

  // Step 4: Compliance checkboxes
  const [complianceAgreed, setComplianceAgreed] = useState<Record<string, boolean>>({});

  // Step 5: Document Uploads
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFileRecord>>({});

  // Feedback & Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftSavedToast, setDraftSavedToast] = useState<string | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);

  // AI Autofill & Cross-Filing Reconciliation
  const [autofillReport, setAutofillReport] = useState<AutofillReport | null>(null);
  const [previousFilingDate, setPreviousFilingDate] = useState<string | null>(null);
  const [showAutofill, setShowAutofill] = useState<boolean>(true);
  const [autofillToast, setAutofillToast] = useState<string | null>(null);

  // Initialize config defaults and check for saved draft
  useEffect(() => {
    if (!config) return;

    // Set default values for approval-specific fields
    const initialValues: Record<string, any> = {};
    config.projectFields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initialValues[field.id] = field.defaultValue;
      } else if (field.type === "select" && field.options && field.options.length > 0) {
        initialValues[field.id] = field.options[0].value;
      } else {
        initialValues[field.id] = "";
      }
    });

    // Initialize compliance checkboxes
    const initialCompliance: Record<string, boolean> = {};
    config.complianceDeclarations.forEach((item) => {
      initialCompliance[item.id] = false;
    });
    setComplianceAgreed((prev) => ({ ...initialCompliance, ...prev }));

    // Check localStorage for draft
    try {
      const draftKey = `aarambh_app_draft_${config.meta.id}`;
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formData) {
          setFormData((prev) => ({ ...prev, ...initialValues, ...parsed.formData }));
          if (parsed.complianceAgreed) setComplianceAgreed(parsed.complianceAgreed);
          setHasRestoredDraft(true);
        }
      } else {
        // Pre-populate with enterprise store or user if empty
        prefillFromStore(initialValues);
      }
    } catch {
      prefillFromStore(initialValues);
    }

    // AI Autofill: merge Master CAF, OCR vault & previous-filing suggestions into empty fields
    const result = buildAutofillSuggestions({
      user,
      store: useEnterpriseStore.getState(),
      approvalId: config.meta.id,
    });
    setAutofillReport(summarizeAutofill(result.entries, result.conflicts));
    setPreviousFilingDate(getPreviousFiling(config.meta.id)?.submittedAt ?? null);
    setFormData((prev) => ({
      ...prev,
      ...applyAutofill(prev, result.entries),
    }));
    setAutofillToast(null);
  }, [config?.meta.id, user]);

  const prefillFromStore = (initialProjectValues?: Record<string, any>) => {
    const updates: Record<string, any> = { ...initialProjectValues };

    if (user) {
      if (user.name) updates.applicantName = user.name;
      if (user.email) updates.applicantEmail = user.email;
      if (user.phone) updates.applicantMobile = user.phone;
      if (user.enterpriseName) updates.businessName = user.enterpriseName;
      if (user.panNumber) updates.businessPan = user.panNumber;
      if (user.addressLine1) updates.commAddress = user.addressLine1;
      if (user.pinCode) updates.commPincode = user.pinCode;
      if (user.district) updates.commCity = user.district;
    }

    if (enterpriseStore) {
      // Pull extracted or master CAF company data
      if (enterpriseStore.extractedFields?.entity_name?.value) {
        updates.businessName = enterpriseStore.extractedFields.entity_name.value;
      } else if (enterpriseStore.masterCAF?.companyDetails?.companyName) {
        updates.businessName = enterpriseStore.masterCAF.companyDetails.companyName;
      }

      if (enterpriseStore.extractedFields?.pan?.value) {
        updates.businessPan = enterpriseStore.extractedFields.pan.value;
      } else if (enterpriseStore.masterCAF?.companyDetails?.pan) {
        updates.businessPan = enterpriseStore.masterCAF.companyDetails.pan;
      }

      if (enterpriseStore.extractedFields?.gstin?.value) {
        updates.businessGstin = enterpriseStore.extractedFields.gstin.value;
      } else if (enterpriseStore.masterCAF?.companyDetails?.gstin) {
        updates.businessGstin = enterpriseStore.masterCAF.companyDetails.gstin;
      }

      if (enterpriseStore.masterCAF?.companyDetails?.signatoryName) {
        updates.applicantName = enterpriseStore.masterCAF.companyDetails.signatoryName;
      }
      if (enterpriseStore.masterCAF?.companyDetails?.signatoryEmail) {
        updates.applicantEmail = enterpriseStore.masterCAF.companyDetails.signatoryEmail;
      }
      if (enterpriseStore.masterCAF?.companyDetails?.signatoryMobile) {
        updates.applicantMobile = enterpriseStore.masterCAF.companyDetails.signatoryMobile;
      }
      if (enterpriseStore.masterCAF?.locationDetails?.address) {
        updates.commAddress = enterpriseStore.masterCAF.locationDetails.address;
        updates.regOfficeAddress = enterpriseStore.masterCAF.locationDetails.address;
      }
      if (enterpriseStore.masterCAF?.locationDetails?.pincode) {
        updates.commPincode = enterpriseStore.masterCAF.locationDetails.pincode;
      }
      if (enterpriseStore.masterCAF?.locationDetails?.district) {
        updates.commCity = enterpriseStore.masterCAF.locationDetails.district;
      }

      // Specs
      if (enterpriseStore.capexCr) updates.capexFixedAssets = enterpriseStore.capexCr;
      if (enterpriseStore.powerLoadKva) updates.powerLoadRequired = enterpriseStore.powerLoadKva;
      if (enterpriseStore.powerLoadKva) updates.installedMotivePowerHp = enterpriseStore.powerLoadKva;
      if (enterpriseStore.waterDemandKld) updates.waterRequirementCmd = enterpriseStore.waterDemandKld;
      if (enterpriseStore.waterDemandKld) updates.freshWaterConsumption = enterpriseStore.waterDemandKld;
      if (enterpriseStore.workforceSize) updates.proposedEmployment = enterpriseStore.workforceSize;
      if (enterpriseStore.workforceSize) updates.maxDailyWorkers = enterpriseStore.workforceSize;

      if (enterpriseStore.locationZone) {
        if (config?.meta.id === "midc-land-allotment") {
          const matched = config.projectFields
            .find((f) => f.id === "industrialZone")
            ?.options?.find((opt) =>
              opt.label.toLowerCase().includes(enterpriseStore.locationZone.toLowerCase())
            );
          if (matched) updates.industrialZone = matched.value;
        }
      }
    }

    setFormData((prev) => ({ ...prev, ...updates }));
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Statutory Approval Not Found</h1>
          <p className="text-sm text-slate-600 mb-6">
            The requested clearance ID <code className="bg-slate-100 px-2 py-1 rounded text-rose-600 font-mono">{approvalId}</code> is not currently active in the Maharashtra Single Window System.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9B2A48] text-white font-medium text-sm hover:bg-[#82213B] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> View All Statutory Approvals
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle Field Changes & Sync with Single Window Master CAF
  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));

    // Propagate changes to enterpriseStore masterCAF & formData for seamless cross-form auto-fetch
    if (fieldId === "businessName" || fieldId === "businessPan" || fieldId === "businessGstin") {
      enterpriseStore.updateMasterCAF({
        companyDetails: {
          ...enterpriseStore.masterCAF.companyDetails,
          ...(fieldId === "businessName" ? { companyName: value } : {}),
          ...(fieldId === "businessPan" ? { pan: value } : {}),
          ...(fieldId === "businessGstin" ? { gstin: value } : {}),
        },
      });
    } else if (fieldId === "commAddress" || fieldId === "commPincode" || fieldId === "commCity") {
      enterpriseStore.updateMasterCAF({
        locationDetails: {
          ...enterpriseStore.masterCAF.locationDetails,
          ...(fieldId === "commAddress" ? { address: value } : {}),
          ...(fieldId === "commPincode" ? { pincode: value } : {}),
          ...(fieldId === "commCity" ? { district: value } : {}),
        },
      });
    } else if (fieldId === "capexFixedAssets") {
      const num = parseFloat(value) || 0;
      enterpriseStore.setFormData({ capexCr: num });
    } else if (fieldId === "powerLoadRequired" || fieldId === "installedMotivePowerHp") {
      const num = parseFloat(value) || 0;
      enterpriseStore.setFormData({ powerLoadKva: num });
    } else if (fieldId === "waterRequirementCmd" || fieldId === "freshWaterConsumption") {
      const num = parseFloat(value) || 0;
      enterpriseStore.setFormData({ waterDemandKld: num });
    }

    if (errors[fieldId]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }
  };

  // Handle Compliance Toggle
  const handleComplianceToggle = (id: string) => {
    setComplianceAgreed((prev) => ({ ...prev, [id]: !prev[id] }));
    if (errors[`comp_${id}`]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[`comp_${id}`];
        return copy;
      });
    }
  };

  // Handle Document Upload
  const handleFileUpload = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit. Please upload an optimized file.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const newRecord: UploadedFileRecord = {
      file,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      previewUrl,
    };

    setUploadedFiles((prev) => ({
      ...prev,
      [docId]: newRecord,
    }));

    if (errors[`doc_${docId}`]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[`doc_${docId}`];
        return copy;
      });
    }
  };

  // Handle Document Removal
  const handleRemoveFile = (docId: string) => {
    setUploadedFiles((prev) => {
      const copy = { ...prev };
      if (copy[docId]?.previewUrl) {
        URL.revokeObjectURL(copy[docId].previewUrl);
      }
      delete copy[docId];
      return copy;
    });
  };

  // Save Draft to LocalStorage
  const handleSaveDraft = () => {
    try {
      const draftKey = `aarambh_app_draft_${config.meta.id}`;
      const draftData = {
        approvalId: config.meta.id,
        savedAt: new Date().toISOString(),
        formData,
        complianceAgreed,
        uploadedFileNames: Object.keys(uploadedFiles).map((k) => ({
          docId: k,
          name: uploadedFiles[k].name,
        })),
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      setDraftSavedToast(`Application draft saved successfully at ${new Date().toLocaleTimeString()}`);
      setTimeout(() => setDraftSavedToast(null), 4000);
    } catch {
      alert("Failed to save draft to browser storage.");
    }
  };

  // Validate Specific Step
  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.applicantName?.trim()) newErrors.applicantName = "Full Name of authorized applicant is required";
      if (!formData.applicantEmail?.trim() || !formData.applicantEmail.includes("@")) {
        newErrors.applicantEmail = "Valid official email address is required";
      }
      if (!formData.applicantMobile?.trim() || formData.applicantMobile.length < 10) {
        newErrors.applicantMobile = "Valid 10-digit mobile number is required";
      }
      if (!formData.commAddress?.trim()) newErrors.commAddress = "Communication address is required";
      if (!formData.commPincode?.trim() || formData.commPincode.length !== 6) {
        newErrors.commPincode = "6-digit postal PIN code is required";
      }
    }

    if (stepNumber === 2) {
      if (!formData.businessName?.trim()) newErrors.businessName = "Registered enterprise name is required";
      if (!formData.businessPan?.trim() || formData.businessPan.length !== 10) {
        newErrors.businessPan = "Valid 10-character Income Tax PAN is required";
      }
      if (!formData.regOfficeAddress?.trim()) newErrors.regOfficeAddress = "Registered office address is required";
    }

    if (stepNumber === 3) {
      config.projectFields.forEach((field) => {
        if (field.required && (!formData[field.id] || String(formData[field.id]).trim() === "")) {
          newErrors[field.id] = `${field.label} is mandatory`;
        }
      });
    }

    if (stepNumber === 4) {
      config.complianceDeclarations.forEach((item) => {
        if (item.mandatory && !complianceAgreed[item.id]) {
          newErrors[`comp_${item.id}`] = "You must agree to this statutory undertaking to proceed";
        }
      });
    }

    if (stepNumber === 5) {
      config.documents.forEach((doc) => {
        if (doc.mandatory && !uploadedFiles[doc.id]) {
          newErrors[`doc_${doc.id}`] = `Mandatory document "${doc.title}" must be uploaded`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step Navigation
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify all steps
    for (let s = 1; s <= 5; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    if (!formData.declarationAgreed) {
      setErrors((prev) => ({
        ...prev,
        declarationAgreed: "You must confirm the legal truthfulness declaration before submitting",
      }));
      return;
    }

    // Generate Official Reference Number
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const newRef = `MH-SWS-2026-${config.meta.departmentCode}-${randomSuffix}`;
    const now = new Date();
    const submissionFormatted = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Compute SLA target date
    const target = new Date();
    target.setDate(target.getDate() + config.meta.slaDays);
    const targetFormatted = target.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    setSubmittedRef(newRef);
    setSubmissionTime(submissionFormatted);
    setSlaTargetDate(targetFormatted);
    setIsSubmitted(true);

    // Remember this filing for AI autofill in future applications
    saveFilingRecord(config.meta.id, formData);

    // Save to enterpriseStore if available
    try {
      enterpriseStore.submitApplication(newRef);
      // Remove draft
      localStorage.removeItem(`aarambh_app_draft_${config.meta.id}`);
    } catch {
      // Ignore store errors
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Dynamic fee calculation
  const feeInfo = config.feeCalculator
    ? config.feeCalculator(formData)
    : { baseFee: 20000, cess: 3600, total: 23600, explanation: "Standard statutory processing fee + 18% GST." };

  // Icon mapping
  const renderDepartmentIcon = () => {
    switch (config.meta.iconName) {
      case "Building2":
        return <Building2 className="w-8 h-8 text-[#9B2A48]" />;
      case "Factory":
        return <Factory className="w-8 h-8 text-[#9B2A48]" />;
      case "Flame":
        return <Flame className="w-8 h-8 text-[#9B2A48]" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-8 h-8 text-[#9B2A48]" />;
      default:
        return <Layers className="w-8 h-8 text-[#9B2A48]" />;
    }
  };

  const stepsList = [
    { num: 1, label: "Applicant", desc: "Identity & Contact" },
    { num: 2, label: "Business", desc: "Entity & Tax Profile" },
    { num: 3, label: "Project Details", desc: "Clearance Specs" },
    { num: 4, label: "Compliance", desc: "Statutory Undertakings" },
    { num: 5, label: "Documents", desc: "Digital Uploads" },
    { num: 6, label: "Review & Submit", desc: "Final Verification" },
  ];

  // ==========================================================================
  // SUBMISSION CONFIRMATION VIEW
  // ==========================================================================
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Printable Header Container */}
          <div className="bg-white rounded-3xl border border-[#F0E5E0] shadow-xl overflow-hidden print:border-none print:shadow-none">
            {/* Success Banner */}
            <div className="bg-slate-900 text-white p-8 sm:p-10 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-lg">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider mb-2 border border-white/20">
                      <Sparkles className="w-3.5 h-3.5 text-[#FED17A]" /> Official Government Receipt
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      Application Successfully Submitted!
                    </h1>
                    <p className="text-sm text-slate-300 mt-1">
                      {config.meta.title} • {config.meta.department}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right bg-black/20 p-4 rounded-2xl border border-white/10 backdrop-blur-xs">
                  <span className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold block">
                    Statutory SLA Guarantee
                  </span>
                  <span className="text-2xl font-black text-[#FE7251]">
                    {config.meta.slaDays} Working Days
                  </span>
                  <span className="text-xs text-slate-300 block mt-0.5">
                    RTS Act 2015 Compliance
                  </span>
                </div>
              </div>
            </div>

            {/* Official Reference & Key Metrics */}
            <div className="p-6 sm:p-8 border-b border-[#F0E5E0] bg-[#FFF9F6]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#F0E5E0] shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wide">
                    Application Reference No.
                  </span>
                  <span className="text-base font-bold text-[#9B2A48] font-mono select-all">
                    {submittedRef}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#F0E5E0] shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wide">
                    Submission Timestamp
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {submissionTime}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#F0E5E0] shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wide">
                    Target SLA Decision Date
                  </span>
                  <span className="text-sm font-bold text-emerald-700">
                    {slaTargetDate}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#F0E5E0] shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wide">
                    Scrutiny Desk Status
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Desk 1 - Document Scrutiny
                  </span>
                </div>
              </div>
            </div>

            {/* Applicant & Application Summary */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#9B2A48]" /> Applicant Particulars
                  </h3>
                  <div className="text-sm space-y-1.5">
                    <p className="font-bold text-slate-900">{formData.applicantName}</p>
                    <p className="text-slate-600">{formData.applicantDesignation}</p>
                    <p className="text-slate-600 font-mono text-xs">{formData.applicantEmail} • {formData.applicantMobile}</p>
                    <p className="text-slate-600 text-xs mt-2">{formData.commAddress}, {formData.commCity} - {formData.commPincode}</p>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#9B2A48]" /> Registered Enterprise
                  </h3>
                  <div className="text-sm space-y-1.5">
                    <p className="font-bold text-slate-900">{formData.businessName}</p>
                    <p className="text-slate-600">{formData.constitutionType}</p>
                    <p className="text-slate-600 text-xs">
                      PAN: <span className="font-mono font-bold">{formData.businessPan}</span> {formData.businessGstin && `• GSTIN: ${formData.businessGstin}`}
                    </p>
                    <p className="text-slate-600 text-xs mt-2">{formData.regOfficeAddress}</p>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" /> Attached Statutory Dossier ({Object.keys(uploadedFiles).length} Files)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.keys(uploadedFiles).map((docId) => {
                    const docConfig = config.documents.find((d) => d.id === docId);
                    const file = uploadedFiles[docId];
                    return (
                      <div
                        key={docId}
                        className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FileText className="w-4 h-4 text-[#9B2A48] shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-semibold text-slate-800 truncate">
                              {docConfig?.title || docId}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                          VERIFIED
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Statutory Fee Slip */}
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-amber-950 block">Statutory Treasury Challan Generated</span>
                  <span className="text-amber-800">{feeInfo.explanation}</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-amber-950 block font-mono">
                    ₹{feeInfo.total.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                    Direct Challan Generated
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 print:hidden">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4" /> Print / Save Official Receipt
              </button>

              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/dag"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors"
                >
                  Track in Parallel DAG <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/apply"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Apply Another Clearance
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // MULTI-STEP APPLICATION FORM RUNNER
  // ==========================================================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Toast Notification */}
      {draftSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{draftSavedToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs text-[#E0C7BC] mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-500" />
            <Link href="/apply" className="hover:text-white transition-colors">
              Statutory Clearances
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-500" />
            <span className="text-[#FED17A] font-semibold truncate max-w-xs sm:max-w-md">
              {config.meta.title}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center p-3 shrink-0 shadow-inner">
                {renderDepartmentIcon()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FE7251]/20 text-[#FED17A] border border-[#FE7251]/30 text-[11px] font-bold uppercase tracking-wider">
                    {config.meta.departmentCode} • {config.meta.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10 text-[11px] font-medium">
                    {config.meta.act}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {config.meta.title}
                </h1>
                <p className="text-xs sm:text-sm text-[#E0C7BC] mt-1 max-w-3xl leading-relaxed">
                  {config.meta.description}
                </p>
              </div>
            </div>

            {/* SLA & Fee Badges */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-xs text-center min-w-[120px]">
                <span className="text-[10px] font-bold text-[#FED17A] uppercase tracking-wider block">
                  Statutory SLA
                </span>
                <span className="text-xl font-extrabold text-white block mt-0.5">
                  {config.meta.slaDays} Days
                </span>
                <span className="text-[10px] text-slate-400 block">RTS Act 2015</span>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-xs text-center min-w-[140px]">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                  Est. Treasury Fee
                </span>
                <span className="text-sm font-bold text-white block mt-1 truncate">
                  ₹{feeInfo.total.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-emerald-400 block font-medium">Online Challan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Navigation Bar */}
      <div className="bg-white border-b border-[#F0E5E0] sticky top-20 z-30 shadow-xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-3 gap-2 sm:gap-4">
            {stepsList.map((step) => {
              const isCurrent = currentStep === step.num;
              const isPast = currentStep > step.num;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    if (isPast) setCurrentStep(step.num);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all shrink-0 ${
                    isCurrent
                      ? "bg-[#9B2A48]/10 text-[#9B2A48] font-bold border border-[#9B2A48]/20"
                      : isPast
                      ? "text-slate-700 hover:bg-slate-50 cursor-pointer"
                      : "text-slate-400 cursor-not-allowed opacity-60"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCurrent
                        ? "bg-[#9B2A48] text-white shadow-xs"
                        : isPast
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </div>
                  <div className="hidden md:block">
                    <span className="text-xs font-bold block leading-tight">{step.label}</span>
                    <span className="text-[10px] text-slate-500 block leading-none mt-0.5">{step.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Work Area (8 cols) */}
          <div className="lg:col-span-8">
            {/* Draft Notification Banner */}
            {hasRestoredDraft && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    A previously saved draft was restored for <strong>{config.meta.title}</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem(`aarambh_app_draft_${config.meta.id}`);
                    setHasRestoredDraft(false);
                    window.location.reload();
                  }}
                  className="font-bold text-amber-700 hover:underline shrink-0"
                >
                  Discard Draft
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* AI Autofill & Cross-Filing Reconciliation Panel */}
              {autofillReport && (
                <div className="mb-6 rounded-2xl border border-[#FED17A] bg-white shadow-xs overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowAutofill((s) => !s)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[#FFFDF9] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A] flex items-center justify-center shrink-0">
                        <Sparkles className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          AI Autofill & Cross-Filing Reconciliation
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {autofillReport.prefilledCount} fields auto-suggested from{" "}
                          {Object.values(autofillReport.sourceCounts).filter((c) => c > 0).length} source
                          {Object.values(autofillReport.sourceCounts).filter((c) => c > 0).length > 1 ? "s" : ""}
                          {autofillReport.conflicts.length > 0
                            ? ` • ${autofillReport.conflicts.length} field conflict${autofillReport.conflicts.length > 1 ? "s" : ""} detected`
                            : undefined}
                          {previousFilingDate
                            ? ` • previously filed ${new Date(previousFilingDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}`
                            : undefined}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFF2DF] text-[11px] font-bold text-[#9B2A48]">
                        Saves ~{estimateTimeSavedMinutes(autofillReport.entries)} min of typing
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 text-slate-400 transition-transform ${showAutofill ? "rotate-90" : ""}`}
                      />
                    </div>
                  </button>

                  {showAutofill && (
                    <div className="px-5 pb-5 pt-1 border-t border-[#F0E5E0]">
                      {/* Source summary chips */}
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        {(Object.keys(autofillReport.sourceCounts) as (keyof typeof SOURCE_META)[])
                          .filter((key) => autofillReport.sourceCounts[key] > 0)
                          .map((key) => (
                            <span
                              key={key}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600"
                            >
                              {SOURCE_META[key].short} × {autofillReport.sourceCounts[key]}
                            </span>
                          ))}
                      </div>

                      {/* Conflicts */}
                      {autofillReport.conflicts.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-[11px] font-bold text-[#9B2A48] uppercase tracking-wider">
                            Cross-source discrepancies — review before submit
                          </p>
                          {autofillReport.conflicts.slice(0, 3).map((c) => (
                            <div
                              key={c.fieldKey}
                              className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900"
                            >
                              <p className="text-xs font-bold">{c.label}</p>
                              <p className="text-[11px] mt-1 text-amber-800 leading-relaxed">
                                {c.values.map((v) => `${v.label} says “${v.value}”`).join(" • ")}
                                {c.diffPercent > 0 && c.diffPercent < 100
                                  ? ` (diff ${c.diffPercent.toFixed(1)}%)`
                                  : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Suggested fields */}
                      <ul className="mt-4 divide-y divide-slate-100">
                        {autofillReport.entries.slice(0, 14).map((entry) => {
                          const current = formData[entry.fieldKey];
                          const isEmpty = current === undefined || current === null || String(current).trim() === "";
                          const isApplied = !isEmpty && String(current) === String(entry.value);
                          return (
                            <li key={entry.fieldKey} className="flex items-center justify-between gap-3 py-2.5">
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{entry.label}</p>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {isApplied ? `Prefilled: ${String(entry.value)}` : "Will auto-fill empty field"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                  {SOURCE_META[entry.source].short} {Math.round(entry.confidence * 100)}%
                                </span>
                                {isApplied ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                                  </span>
                                ) : isEmpty ? (
                                  <span className="text-[10px] font-bold text-slate-400">Pending</span>
                                ) : (
                                  <span className="text-[10px] font-bold text-amber-600">You changed</span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (!autofillReport) return;
                            setFormData((prev) => ({ ...prev, ...applyAutofill(prev, autofillReport.entries) }));
                            setAutofillToast("Autofill applied — blank fields filled from your past filings.");
                            setTimeout(() => setAutofillToast(null), 4000);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Re-apply suggested values
                        </button>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Autofill sources: Master CAF, OCR vault documents, and this approval&apos;s previous filings. It never
                          overwrites values you entered.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {autofillToast && (
                <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  {autofillToast}
                </div>
              )}
              {/* ========================================================== */}
              {/* STEP 1: APPLICANT DETAILS */}
              {/* ========================================================== */}
              {currentStep === 1 && (
                <div className="bg-white rounded-3xl border border-[#F0E5E0] p-6 sm:p-8 shadow-xs">
                  <div className="border-b border-[#F0E5E0] pb-5 mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-[#9B2A48]" /> Step 1: Authorized Applicant & Signatory Details
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Provide identity and communication particulars of the legal signatory submitting this clearance.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => prefillFromStore()}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#9B2A48]" /> Auto-Fill from Profile
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Full Name of Authorized Signatory <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.applicantName || ""}
                        onChange={(e) => handleInputChange("applicantName", e.target.value)}
                        placeholder="e.g. Rajesh S. Kulkarni"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border ${
                          errors.applicantName ? "border-rose-400 bg-rose-50/20" : "border-slate-200 bg-white"
                        } focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48]`}
                      />
                      {errors.applicantName && <p className="text-[11px] text-rose-500 mt-1">{errors.applicantName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Designation / Capacity <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.applicantDesignation || "Director"}
                        onChange={(e) => handleInputChange("applicantDesignation", e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48]"
                      >
                        <option value="Director">Director (Pvt Ltd / Public Ltd)</option>
                        <option value="Designated Partner">Designated Partner (LLP)</option>
                        <option value="Managing Partner">Managing Partner (Partnership Firm)</option>
                        <option value="Sole Proprietor">Sole Proprietor</option>
                        <option value="Authorized Representative">Authorized Signatory (Power of Attorney Holder)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Official Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.applicantEmail || ""}
                        onChange={(e) => handleInputChange("applicantEmail", e.target.value)}
                        placeholder="e.g. rajesh@apexindustries.in"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border ${
                          errors.applicantEmail ? "border-rose-400 bg-rose-50/20" : "border-slate-200 bg-white"
                        } focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48]`}
                      />
                      {errors.applicantEmail && <p className="text-[11px] text-rose-500 mt-1">{errors.applicantEmail}</p>}
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Statutory notices will be dispatched here.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Mobile Number (10 Digits) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={formData.applicantMobile || ""}
                        onChange={(e) => handleInputChange("applicantMobile", e.target.value)}
                        placeholder="e.g. 9822012345"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border ${
                          errors.applicantMobile ? "border-rose-400 bg-rose-50/20" : "border-slate-200 bg-white"
                        } focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48] font-mono`}
                      />
                      {errors.applicantMobile && <p className="text-[11px] text-rose-500 mt-1">{errors.applicantMobile}</p>}
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Used for RTS SMS inspection OTP alerts.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Aadhaar / Photo ID Reference Number (Optional)
                      </label>
                      <input
                        type="text"
                        maxLength={16}
                        value={formData.applicantAadhaar || ""}
                        onChange={(e) => handleInputChange("applicantAadhaar", e.target.value)}
                        placeholder="e.g. XXXX-XXXX-1234"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Communication District / City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.commCity || "Pune"}
                        onChange={(e) => handleInputChange("commCity", e.target.value)}
                        placeholder="e.g. Pune"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Communication / Postal Address <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={formData.commAddress || ""}
                        onChange={(e) => handleInputChange("commAddress", e.target.value)}
                        placeholder="e.g. Plot 40, MIDC Industrial Area Phase 1, Chakan, Taluka Khed, District Pune"
                        className={`w-full px-4 py-2 text-sm rounded-xl border ${
                          errors.commAddress ? "border-rose-400 bg-rose-50/20" : "border-slate-200 bg-white"
                        } focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48]`}
                      />
                      {errors.commAddress && <p className="text-[11px] text-rose-500 mt-1">{errors.commAddress}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Postal PIN Code (6 Digits) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={formData.commPincode || ""}
                        onChange={(e) => handleInputChange("commPincode", e.target.value)}
                        placeholder="e.g. 410501"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border ${
                          errors.commPincode ? "border-rose-400 bg-rose-50/20" : "border-slate-200 bg-white"
                        } focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48] font-mono`}
                      />
                      {errors.commPincode && <p className="text-[11px] text-rose-500 mt-1">{errors.commPincode}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* STEP 2: BUSINESS & ENTERPRISE DETAILS */}
              {/* ========================================================== */}
              {currentStep === 2 && (
                <div className="bg-white rounded-3xl border border-[#F0E5E0] p-6 sm:p-8 shadow-xs">
                  <div className="border-b border-[#F0E5E0] pb-5 mb-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Building className="w-5 h-5 text-[#9B2A48]" /> Step 2: Commercial Enterprise & Statutory Tax Profile
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Legal entity classification, PAN, and corporate registration details for government records.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Full Registered Legal Entity / Company Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.businessName || ""}
                        onChange={(e) => handleInputChange("businessName", e.target.value)}
                        placeholder="e.g. Apex Precision Engineering Private Limited"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border ${
                          errors.businessName ? "border-rose-400 bg-rose-50/20" : "border-slate-200 bg-white"
                        } focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48] font-semibold`}
                      />
                      {errors.businessName && <p className="text-[11px] text-rose-500 mt-1">{errors.businessName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Legal Constitution Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.constitutionType || "Private Limited Company"}
                        onChange={(e) => handleInputChange("constitutionType", e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48]"
                      >
                        <option value="Private Limited Company">Private Limited Company (Pvt Ltd)</option>
                        <option value="Public Limited Company">Public Limited Company</option>
                        <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                        <option value="Partnership Firm">Registered Partnership Firm</option>
                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                        <option value="Government / PSU">State / Central PSU Enterprise</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Entity Permanent Account Number (PAN) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        value={formData.businessPan || ""}
                        onChange={(e) => handleInputChange("businessPan", e.target.value.toUpperCase())}
                        placeholder="e.g. AAACA1234D"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border ${
                          errors.businessPan ? "border-rose-400 bg-rose-50/20" : "border-slate-200 bg-white"
                        } focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48] font-mono uppercase`}
                      />
                      {errors.businessPan && <p className="text-[11px] text-rose-500 mt-1">{errors.businessPan}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        GSTIN (Goods & Services Tax ID)
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        value={formData.businessGstin || ""}
                        onChange={(e) => handleInputChange("businessGstin", e.target.value.toUpperCase())}
                        placeholder="e.g. 27AAACA1234D1Z5"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48] font-mono uppercase"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Maharashtra state code prefix: 27</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Udyam Registration / CIN Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.udyamNumber || ""}
                        onChange={(e) => handleInputChange("udyamNumber", e.target.value)}
                        placeholder="e.g. UDYAM-MH-26-0012345 or U29100MH2021PTC123456"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48] font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Registered Corporate Office Address <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={formData.regOfficeAddress || ""}
                        onChange={(e) => handleInputChange("regOfficeAddress", e.target.value)}
                        placeholder="e.g. Floor 4, Synergy Business Tower, Senapati Bapat Road, Pune - 411016"
                        className={`w-full px-4 py-2 text-sm rounded-xl border ${
                          errors.regOfficeAddress ? "border-rose-400 bg-rose-50/20" : "border-slate-200 bg-white"
                        } focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48]`}
                      />
                      {errors.regOfficeAddress && <p className="text-[11px] text-rose-500 mt-1">{errors.regOfficeAddress}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* STEP 3: PROJECT SPECIFICATIONS (DYNAMIC CLEARANCE FIELDS) */}
              {/* ========================================================== */}
              {currentStep === 3 && (
                <div className="bg-white rounded-3xl border border-[#F0E5E0] p-6 sm:p-8 shadow-xs">
                  <div className="border-b border-[#F0E5E0] pb-5 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          {renderDepartmentIcon()} Step 3: {config.meta.title} — Technical Specifications
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Tailored technical parameters required by {config.meta.department} for scrutiny.
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A] text-xs font-bold shrink-0">
                        {config.projectFields.length} Required Parameters
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {config.projectFields.map((field) => {
                      const isSpan2 = field.colSpan === 2 || field.type === "textarea";
                      const hasError = !!errors[field.id];

                      return (
                        <div key={field.id} className={isSpan2 ? "sm:col-span-2" : ""}>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            {field.label} {field.required && <span className="text-rose-500">*</span>}
                            {field.unit && <span className="text-slate-400 font-normal ml-1">({field.unit})</span>}
                          </label>

                          {field.type === "select" ? (
                            <select
                              value={formData[field.id] || ""}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              className={`w-full px-4 py-2.5 text-sm rounded-xl border ${
                                hasError ? "border-rose-400 bg-rose-50/20" : "border-slate-200 bg-white"
                              } focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48]`}
                            >
                              {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : field.type === "textarea" ? (
                            <textarea
                              rows={3}
                              value={formData[field.id] || ""}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              placeholder={field.placeholder}
                              className={`w-full px-4 py-2.5 text-sm rounded-xl border ${
                                hasError ? "border-rose-400 bg-rose-50/20" : "border-slate-200 bg-white"
                              } focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48]`}
                            />
                          ) : (
                            <input
                              type={field.type}
                              value={formData[field.id] || ""}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              placeholder={field.placeholder}
                              className={`w-full px-4 py-2.5 text-sm rounded-xl border ${
                                hasError ? "border-rose-400 bg-rose-50/20" : "border-slate-200 bg-white"
                              } focus:outline-hidden focus:ring-2 focus:ring-[#9B2A48]/20 focus:border-[#9B2A48]`}
                            />
                          )}

                          {field.helperText && (
                            <span className="text-[11px] text-slate-500 mt-1 block">{field.helperText}</span>
                          )}
                          {hasError && <p className="text-[11px] text-rose-500 mt-1">{errors[field.id]}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* STEP 4: STATUTORY COMPLIANCE DECLARATIONS */}
              {/* ========================================================== */}
              {currentStep === 4 && (
                <div className="bg-white rounded-3xl border border-[#F0E5E0] p-6 sm:p-8 shadow-xs">
                  <div className="border-b border-[#F0E5E0] pb-5 mb-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FileCheck2 className="w-5 h-5 text-emerald-600" /> Step 4: Statutory Legal Undertakings
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Affirmative undertakings mandated under the governing legislation for {config.meta.department}.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {config.complianceDeclarations.map((item) => {
                      const isChecked = !!complianceAgreed[item.id];
                      const hasError = !!errors[`comp_${item.id}`];

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleComplianceToggle(item.id)}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                            isChecked
                              ? "bg-emerald-50/50 border-emerald-300 shadow-xs"
                              : hasError
                              ? "bg-rose-50/30 border-rose-300"
                              : "bg-[#F8FAFC] border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // handled by parent onClick
                              className="w-5 h-5 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-slate-900">{item.title}</span>
                                <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                  {item.statutoryAct}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                              {hasError && (
                                <p className="text-[11px] text-rose-500 mt-1.5 font-semibold">
                                  {errors[`comp_${item.id}`]}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* STEP 5: REAL DOCUMENT UPLOADS */}
              {/* ========================================================== */}
              {currentStep === 5 && (
                <div className="bg-white rounded-3xl border border-[#F0E5E0] p-6 sm:p-8 shadow-xs">
                  <div className="border-b border-[#F0E5E0] pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <UploadCloud className="w-5 h-5 text-[#9B2A48]" /> Step 5: Statutory Document Dossier
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Upload digitally signed certificates, drawings, and reports (PDF up to 10MB each).
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700">
                      <span>
                        {Object.keys(uploadedFiles).length} of {config.documents.filter((d) => d.mandatory).length} Mandatory Files Attached
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {config.documents.map((doc) => {
                      const fileRecord = uploadedFiles[doc.id];
                      const isUploaded = !!fileRecord;
                      const hasError = !!errors[`doc_${doc.id}`];
                      const vaultMatch = matchVaultDocument(doc.title, enterpriseStore.uploadedDocuments || []);

                      return (
                        <div
                          key={doc.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            isUploaded
                              ? "bg-emerald-50/30 border-emerald-300"
                              : hasError
                              ? "bg-rose-50/20 border-rose-300"
                              : "bg-[#F8FAFC] border-slate-200"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">{doc.title}</span>
                                {doc.mandatory ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 uppercase">
                                    Mandatory
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                                    Optional
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">{doc.description}</p>
                              <span className="text-[11px] text-slate-400 block">
                                Formats: {doc.allowedFormats.join(", ")} • Max {doc.maxSizeMb} MB
                              </span>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              {isUploaded ? (
                                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-emerald-200 shadow-xs">
                                  <div className="text-left">
                                    <p className="text-xs font-bold text-emerald-800 truncate max-w-[140px] sm:max-w-[180px]">
                                      {fileRecord.name}
                                    </p>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {fileRecord.fromVault ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#9B2A48]">
                                          <CheckCircle2 className="w-3 h-3" /> Reused from Vault
                                        </span>
                                      ) : (
                                        `${(fileRecord.size / 1024 / 1024).toFixed(2)} MB`
                                      )}
                                    </span>
                                  </div>

                                  {fileRecord.previewUrl && (
                                    <a
                                      href={fileRecord.previewUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                                      title="View Document"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </a>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFile(doc.id)}
                                    className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors"
                                    title="Remove Document"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {vaultMatch && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setUploadedFiles((prev) => ({
                                          ...prev,
                                          [doc.id]: {
                                            name: vaultMatch.name,
                                            size: vaultMatch.size || 0,
                                            type: vaultMatch.type || "application/pdf",
                                            uploadedAt:
                                              vaultMatch.uploadedAt || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                                            previewUrl: vaultMatch.fileUrl || "",
                                            fromVault: true,
                                          },
                                        }));
                                        if (errors[`doc_${doc.id}`]) {
                                          setErrors((prev) => {
                                            const copy = { ...prev };
                                            delete copy[`doc_${doc.id}`];
                                            return copy;
                                          });
                                        }
                                      }}
                                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#9B2A48]/20 bg-[#FFF7F0] hover:bg-[#FFF2DF] text-xs font-bold text-[#9B2A48] transition-all cursor-pointer"
                                      title="Reuse a document already parsed & verified in your Vault"
                                    >
                                      <FolderLock className="w-4 h-4 text-[#FE7251]" />
                                      <span className="hidden sm:inline">Reuse from Vault</span>
                                      <span className="text-[10px] font-mono text-[#886A75] truncate max-w-[120px]">
                                        {vaultMatch.name}
                                      </span>
                                    </button>
                                  )}

                                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-[#9B2A48]/30 hover:border-[#9B2A48] bg-white hover:bg-[#9B2A48]/5 text-xs font-bold text-[#9B2A48] transition-all cursor-pointer">
                                    <UploadCloud className="w-4 h-4" />
                                    <span>Choose File</span>
                                    <input
                                      type="file"
                                      accept={doc.allowedFormats.join(",")}
                                      onChange={(e) => handleFileUpload(doc.id, e)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>

                          {hasError && (
                            <p className="text-[11px] text-rose-500 mt-2 font-semibold">
                              {errors[`doc_${doc.id}`]}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* STEP 6: REVIEW & SUBMIT */}
              {/* ========================================================== */}
              {currentStep === 6 && (
                <div className="bg-white rounded-3xl border border-[#F0E5E0] p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="border-b border-[#F0E5E0] pb-5">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FileCheck2 className="w-5 h-5 text-[#9B2A48]" /> Step 6: Review & Statutory Confirmation
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Review all consolidated particulars before transmitting your clearance application to {config.meta.department}.
                    </p>
                  </div>

                  {/* Group 1: Applicant & Entity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Applicant Details</span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-[11px] font-bold text-[#9B2A48] hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{formData.applicantName}</p>
                      <p className="text-xs text-slate-600">{formData.applicantDesignation}</p>
                      <p className="text-xs text-slate-600 font-mono mt-1">{formData.applicantEmail} • {formData.applicantMobile}</p>
                      <p className="text-xs text-slate-500 mt-1">{formData.commAddress}, {formData.commCity} - {formData.commPincode}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Business Entity</span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-[11px] font-bold text-[#9B2A48] hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{formData.businessName}</p>
                      <p className="text-xs text-slate-600">{formData.constitutionType}</p>
                      <p className="text-xs text-slate-600 font-mono mt-1">PAN: {formData.businessPan} {formData.businessGstin && `• GSTIN: ${formData.businessGstin}`}</p>
                      <p className="text-xs text-slate-500 mt-1">{formData.regOfficeAddress}</p>
                    </div>
                  </div>

                  {/* Group 2: Project Specifications Highlights */}
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Project Clearance Specifications</span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-[11px] font-bold text-[#9B2A48] hover:underline"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      {config.projectFields.slice(0, 6).map((field) => (
                        <div key={field.id} className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">
                            {field.label}
                          </span>
                          <span className="font-bold text-slate-800 block mt-0.5 truncate">
                            {String(formData[field.id] || "—")} {field.unit && <span className="font-normal text-slate-500">{field.unit}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Group 3: Attached Documents */}
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Attached Dossier Files</span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(5)}
                        className="text-[11px] font-bold text-[#9B2A48] hover:underline"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {Object.keys(uploadedFiles).length > 0 ? (
                        Object.keys(uploadedFiles).map((docId) => {
                          const docConfig = config.documents.find((d) => d.id === docId);
                          return (
                            <span
                              key={docId}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {docConfig?.title || docId}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-rose-500 font-semibold">
                          No documents uploaded yet. Mandatory documents must be attached.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Group 4: Fee & Treasury Estimate */}
                  <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-700" />
                        <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                          Statutory Treasury Challan Fee Calculation
                        </span>
                      </div>
                      <p className="text-xs text-amber-800 mt-1">{feeInfo.explanation}</p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xl font-extrabold text-amber-950 block font-mono">
                        ₹{feeInfo.total.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Base: ₹{feeInfo.baseFee.toLocaleString("en-IN")} + GST: ₹{feeInfo.cess.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Legal Declaration Checkbox */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white">
                    <label className="flex items-start gap-3.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.declarationAgreed || false}
                        onChange={(e) => handleInputChange("declarationAgreed", e.target.checked)}
                        className="w-5 h-5 mt-0.5 rounded text-[#9B2A48] focus:ring-[#9B2A48] cursor-pointer shrink-0"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Solemn Statutory Affidavit & Declaration
                        </span>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          I hereby solemnly affirm that all information, specifications, and uploaded documents submitted herein are true, genuine, and correct to the best of my knowledge and belief under the Maharashtra Right to Services Act, 2015 and Section 199/200 of the Indian Penal Code. I understand that any false statement or suppression of material facts shall render this application invalid and subject the entity to statutory prosecution.
                        </p>
                      </div>
                    </label>
                    {errors.declarationAgreed && (
                      <p className="text-[11px] text-rose-500 mt-2 font-semibold">
                        {errors.declarationAgreed}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons Bar */}
              <div className="mt-8 flex items-center justify-between gap-4">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-xs"
                    >
                      <ArrowLeft className="w-4 h-4" /> Previous Step
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-xs"
                  >
                    <Save className="w-4 h-4 text-slate-500" /> Save Draft
                  </button>

                  {currentStep < 6 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Save & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-extrabold uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Transmit Application to {config.meta.departmentCode}</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Right Sidebar: Clearance Dossier & Helplines (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Department Summary Card */}
            <div className="bg-white rounded-3xl border border-[#F0E5E0] p-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-[#F0E5E0] pb-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFF2DF] border border-[#FED17A] flex items-center justify-center shrink-0">
                  {renderDepartmentIcon()}
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Clearance Authority</h3>
                  <p className="text-sm font-bold text-slate-900">{config.meta.departmentCode}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Department Name:</span>
                  <span className="font-semibold text-slate-800">{config.meta.department}</span>
                </div>

                <div>
                  <span className="text-slate-400 block">Governing Act:</span>
                  <span className="font-semibold text-slate-800">{config.meta.act}</span>
                </div>

                <div>
                  <span className="text-slate-400 block">Permit Validity:</span>
                  <span className="font-semibold text-slate-800">{config.meta.validityYears || "5 Years"}</span>
                </div>

                <div>
                  <span className="text-slate-400 block">Official Portal:</span>
                  <a
                    href={config.meta.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#9B2A48] font-bold hover:underline"
                  >
                    <span>{config.meta.officialWebsite.replace("https://", "")}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <span className="text-slate-400 block">Officer Helpline:</span>
                  <span className="font-mono font-bold text-slate-800">{config.meta.helpline}</span>
                </div>
              </div>
            </div>

            {/* Checklist Progress Card */}
            <div className="bg-[#16060E] text-white rounded-3xl p-6 shadow-md border border-[#36101E]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#FED17A] mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FE7251]" /> Application Checklist
              </h3>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Applicant Profile</span>
                  {formData.applicantName ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <span className="text-slate-500">Pending</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span>Entity & Tax Details</span>
                  {formData.businessName && formData.businessPan ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <span className="text-slate-500">Pending</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span>Technical Specs</span>
                  {formData[config.projectFields[0]?.id] ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> In Progress
                    </span>
                  ) : (
                    <span className="text-slate-500">Pending</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span>Statutory Undertakings</span>
                  <span>{Object.values(complianceAgreed).filter(Boolean).length} / {config.complianceDeclarations.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Dossier Uploads</span>
                  <span>{Object.keys(uploadedFiles).length} / {config.documents.filter((d) => d.mandatory).length} Mandatory</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 text-[11px] text-[#E0C7BC]">
                <p>
                  * Applications are automatically bound by Maharashtra Right to Services Act 2015 SLA timers upon submission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
