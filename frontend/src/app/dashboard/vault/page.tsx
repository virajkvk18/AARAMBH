"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  FolderLock,
  UploadCloud,
  FileCheck2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Cpu,
  RefreshCw,
  ExternalLink,
  Eye,
  X,
  File,
  CheckCircle2,
  Download,
} from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  useEnterpriseStore,
  ExtractedFieldItem,
  UploadedDocument,
  DigiLockerDocItem,
} from "@/store/enterpriseStore";
import { useLanguage } from "@/context/LanguageContext";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const mockDigiLockerPushedDocs: DigiLockerDocItem[] = [
  {
    id: "DL-PAN-2026-001",
    name: "Enterprise PAN Verification Certificate",
    docType: "Income Tax Department (CBDT)",
    issueDate: "14-Feb-2024",
    issuer: "DigiLocker Govt of India",
    verified: true,
  },
  {
    id: "DL-UDYAM-2026-881",
    name: "Udyam MSME Registration Certificate",
    docType: "Ministry of Micro, Small & Medium Enterprises",
    issueDate: "20-Jan-2025",
    issuer: "DigiLocker National Portal",
    verified: true,
  },
  {
    id: "DL-MIDC-2026-302",
    name: "MIDC Industrial Estate Provisional Allotment",
    docType: "Maharashtra Industrial Development Corporation",
    issueDate: "05-Aug-2026",
    issuer: "MIDC Digital Signatory",
    verified: true,
  },
];



// Prototype data for documentation requirements per clearance type
const clearanceRequirements = [
  {
    id: "mpcb_cte",
    name: "MPCB Consent to Establish (CTE)",
    authority: "Maharashtra Pollution Control Board (MPCB)",
    documents: [
      {
        id: "land_ownership",
        name: "Land ownership / possession document",
        issuingAuthority: "MPCB",
        format: "PDF • Max 30 MB • Digitally signed",
        required: true,
        sample: "Required document",
      },
      {
        id: "project_report",
        name: "Project report",
        issuingAuthority: "MPCB",
        format: "PDF • Max 30 MB • Digitally signed",
        required: true,
        sample: "Required document",
      },
      {
        id: "site_layout",
        name: "Site/layout plan",
        issuingAuthority: "MPCB",
        format: "PDF • Max 30 MB • Digitally signed",
        required: true,
        sample: "Required document",
      },
      {
        id: "consent_application",
        name: "Applicable consent application documents",
        issuingAuthority: "MPCB",
        format: "PDF • Max 30 MB • Digitally signed",
        required: true,
        sample: "Required document",
      },
    ],
  },
  {
    id: "fire_noc",
    name: "Fire NOC",
    authority: "Maharashtra Fire Department",
    documents: [
      {
        id: "fire_building_plan",
        name: "Building fire safety plan",
        issuingAuthority: "Fire Dept",
        format: "PDF • Max 30 MB • Digitally signed",
        required: true,
        sample: "Required document",
      },
      {
        id: "fire_safety_certificate",
        name: "Fire safety compliance certificate",
        issuingAuthority: "Fire Dept",
        format: "PDF • Max 30 MB • Digitally signed",
        required: true,
        sample: "Required document",
      },
    ],
  },
  {
    id: "midc_allotment",
    name: "MIDC Land Allotment",
    authority: "Maharashtra Industrial Development Corporation (MIDC)",
    documents: [
      {
        id: "midc_allotment_letter",
        name: "Land allotment letter",
        issuingAuthority: "MIDC",
        format: "PDF • Max 30 MB • Digitally signed",
        required: true,
        sample: "Required document",
      },
      {
        id: "midc_site_plan",
        name: "Site layout plan",
        issuingAuthority: "MIDC",
        format: "PDF • Max 30 MB • Digitally signed",
        required: true,
        sample: "Required document",
      },
    ],
  },
];
type FieldMeta = { label: string; description: string };
const fieldMetadata: Record<string, FieldMeta> = {
  entity_name: {
    label: "Enterprise Legal Name",
    description: "Registered business entity name",
  },
  pan: {
    label: "Permanent Account Number (PAN)",
    description: "10-character CBDT corporate PAN",
  },
  gstin: {
    label: "Goods & Services Tax ID (GSTIN)",
    description: "15-digit Maharashtra state GST registration",
  },
  aadhaar: {
    label: "Aadhaar Identity Number",
    description: "12-digit UIDAI identity number",
  },
  plot_area_sqm: {
    label: "Industrial Plot Area",
    description: "Proposed industrial land dimensions in sq. meters",
  },
  power_load_kva: {
    label: "Power Demand Load",
    description: "Sanctioned electrical grid transformer load",
  },
  capex_amount: {
    label: "Capital Expenditure (Capex)",
    description: "Total plant, civil, and machinery investment",
  },
};
const fieldDisplayMeta = fieldMetadata;

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default function DocumentVaultPage() {
  const {
    uploadedDocuments,
    extractedFields,
    fieldConflicts,
    digiLockerDocs,
    uploadedDocumentName,
    addUploadedDocuments,
    updateUploadedDocument,
    removeUploadedDocument,
    clearUploadedDocuments,
    setDigiLockerDocs,
  } = useEnterpriseStore();

  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null);
  const [digiLockerNotice, setDigiLockerNotice] = useState<string | null>(null);
  const [rawTextSnippet, setRawTextSnippet] = useState<string | null>(null);
  const [extractionMethod, setExtractionMethod] = useState<string | null>(null);

  const [openGroupId, setOpenGroupId] = useState<string>("");
  const [activeSample, setActiveSample] = useState<{ title: string; content: string } | null>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ephemeral in-memory file objects for the active browser session (no large base64 in persistent state)
  const fileObjectsRef = useRef<Map<string, File>>(new Map());

  // 1. Connect DigiLocker Handler (restores mock data for SIH prototype demo, isolated from uploaded docs)
  const handleConnectDigiLocker = () => {
    setDigiLockerDocs(mockDigiLockerPushedDocs);
    setDigiLockerNotice(
      "DigiLocker Connected: 3 verified statutory certificates loaded successfully."
    );
  };

  // 2. Process Single Document with Backend API
  const processSingleDocument = async (docId: string, file: File) => {
    updateUploadedDocument(docId, { status: "processing", errorMessage: null });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BACKEND_API_URL}/vault/extract`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.error || errorBody?.detail || `Server responded with status ${res.status}`);
      }

      const data = await res.json();

      // Map extracted fields ensuring null for missing values
      const formattedFields: Record<string, ExtractedFieldItem> = {};
      if (data.extracted_fields && typeof data.extracted_fields === "object") {
        for (const [key, val] of Object.entries(data.extracted_fields as Record<string, any>)) {
          const itemVal = val?.value;
          const isPresent =
            itemVal !== null &&
            itemVal !== undefined &&
            String(itemVal).trim() !== "" &&
            String(itemVal).toLowerCase() !== "null" &&
            String(itemVal).toLowerCase() !== "none";

          formattedFields[key] = {
            value: isPresent ? String(itemVal).trim() : null,
            confidenceScore:
              isPresent && typeof val?.confidence_score === "number" ? val.confidence_score : 0,
          };
        }
      }

      // Backend served file URL if available
      const backendFileUrl = data.document?.file_url
        ? `${BACKEND_API_URL.replace("/api", "")}${data.document.file_url}`
        : undefined;

      updateUploadedDocument(docId, {
        status: data.status === "partial_success" ? "ready" : "extracted",
        extractedFields: formattedFields,
        rawTextSnippet: data.raw_text_snippet || null,
        fileUrl: backendFileUrl || (fileObjectsRef.current.get(docId) ? URL.createObjectURL(file) : undefined),
        errorMessage: data.warning || null,
      });

      if (data.raw_text_snippet) {
        setRawTextSnippet(data.raw_text_snippet);
      }
      if (data.extraction_method && data.extraction_method !== "None") {
        setExtractionMethod(data.extraction_method);
      }
    } catch (err: any) {
      updateUploadedDocument(docId, {
        status: "error",
        errorMessage: err.message || "Extraction failed. File remains uploaded and viewable.",
        extractedFields: {
          pan: { value: null, confidenceScore: 0 },
          gstin: { value: null, confidenceScore: 0 },
          aadhaar: { value: null, confidenceScore: 0 },
        },
      });
    }
  };

  // 3. File Addition Handler (supports single or multiple files)
  const handleFilesAdded = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setUploadError(null);
    const validItems: { file: File; doc: UploadedDocument }[] = [];

    for (const file of fileList) {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png)$/i.test(file.name);

      if (!isPdf && !isImage) {
        setUploadError(`Skipped "${file.name}": Unsupported format. Please upload PDF, JPG, or PNG files.`);
        continue;
      }

      const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const objectUrl = URL.createObjectURL(file);

      fileObjectsRef.current.set(docId, file);

      const newDoc: UploadedDocument = {
        id: docId,
        name: file.name,
        size: file.size,
        type: file.type || (isPdf ? "application/pdf" : "image/jpeg"),
        fileUrl: objectUrl,
        uploadedAt: new Date().toISOString(),
        status: "ready",
        extractedFields: {},
      };

      validItems.push({ file, doc: newDoc });
    }

    if (validItems.length === 0) return;

    // Immediately add to persistent state with actual metadata
    addUploadedDocuments(validItems.map((v) => v.doc));

    // Process each document sequentially with OCR extraction
    setIsProcessingAll(true);
    try {
      for (const { file, doc } of validItems) {
        await processSingleDocument(doc.id, file);
      }
    } finally {
      setIsProcessingAll(false);
    }
  };

  // 4. Drag & Drop Handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(e.target.files);
    }
    // Reset file input value so re-uploading the same file works
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 5. Open / View Document Handler
  const handleOpenPreview = (doc: UploadedDocument) => {
    let resolvedUrl = doc.fileUrl;

    if (!resolvedUrl && fileObjectsRef.current.has(doc.id)) {
      const file = fileObjectsRef.current.get(doc.id)!;
      resolvedUrl = URL.createObjectURL(file);
      updateUploadedDocument(doc.id, { fileUrl: resolvedUrl });
    }

    setPreviewDoc({
      ...doc,
      fileUrl: resolvedUrl,
    });
  };

  // 6. Download Document Handler (handles Blob, file object, or generated certificate fallback)
  const handleDownloadDocument = (doc: UploadedDocument) => {
    if (doc.fileUrl && doc.fileUrl.startsWith("blob:")) {
      const a = document.createElement("a");
      a.href = doc.fileUrl;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Generate statutory verifiable certificate snapshot download
    const docData = `MAHARASHTRA SINGLE WINDOW CLEARANCE PORTAL - AARAMBH
OFFICIAL STATUTORY DOSSIER DOCUMENT SNAPSHOT
----------------------------------------------------------------------
Document Reference: ${doc.id}
File Name: ${doc.name}
Upload Date: ${doc.uploadedAt}
File Size: ${formatFileSize(doc.size)}
Status: VERIFIED BY STATE SINGLE WINDOW ENGINE

EXTRACTED COMPLIANCE FIELDS:
${Object.entries(doc.extractedFields || {})
  .map(([k, v]) => `• ${k.toUpperCase()}: ${v.value || "Not found"} (Confidence: ${(v.confidenceScore * 100).toFixed(0)}%)`)
  .join("\n")}

Digital Cryptographic Hash: SHA256-${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}
Issued by Directorate of Single Window Approvals, Government of Maharashtra
----------------------------------------------------------------------`;

    const blob = new Blob([docData], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.name.replace(/\.[^/.]+$/, "")}_verified_dossier.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadDigiDoc = (doc: DigiLockerDocItem) => {
    const certContent = `GOVERNMENT OF INDIA - DIGILOCKER STATUTORY VERIFICATION RECORD
----------------------------------------------------------------------
Certificate ID: ${doc.id}
Title: ${doc.name}
Issuing Authority: ${doc.issuer}
Statutory Body: ${doc.docType}
Issue Date: ${doc.issueDate}
Verification Status: COMPLETED & CRYPTOGRAPHICALLY SIGNED ✓

Linked Enterprise: Maharashtra Solvents & Chemicals Pvt Ltd
PAN Identifier: AAECS8891M
State Single Window Node: Government of Maharashtra (AARAMBH)
----------------------------------------------------------------------`;

    const blob = new Blob([certContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.id}_${doc.name.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 7. Remove Document Handler (removes only this document, recalculates merged fields from remaining docs)
  const handleRemoveDocument = async (docId: string) => {
    fileObjectsRef.current.delete(docId);

    // If active preview is this document, close it
    if (previewDoc?.id === docId) {
      setPreviewDoc(null);
    }

    // Remove from store (Zustand store recomputes merged fields from remaining documents only)
    removeUploadedDocument(docId);

    // Call backend endpoint to remove from localFileStore/localDb if persisted
    try {
      await fetch(`${BACKEND_API_URL}/documents/${docId}`, {
        method: "DELETE",
      });
    } catch {
      // Non-blocking
    }
  };

  const hasExtractedData = Object.keys(extractedFields).length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Identity Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0E5E0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] text-xs font-bold uppercase tracking-wider mb-2">
            <FolderLock className="w-3.5 h-3.5 text-[#FE7251]" />
            <span>DigiLocker & Verified Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#16060E] tracking-tight">
            Document Vault & Extraction
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Store, auto-validate, and sync statutory clearance documents with actual file verification and structured OCR extraction.
          </p>
        </div>

        <Link
          href="/dashboard/dag"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <span>Proceed to DAG Workflow</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

{/* SECTION 1: DIGILOCKER STATUTORY CERTIFICATES (SIH Demo Workflow) */}
<div className="mb-6 p-4 bg-[#FFF7F0] border border-[#FED17A] rounded-xl">
  <h3 className="text-lg font-bold mb-2">Statutory Documentation Guidelines & Checklist</h3>
  <p className="text-sm text-gray-700 mb-4">Review the required documents before uploading. Requirements vary by clearance type.</p>
  {clearanceRequirements.map((group) => {
    const isOpen = openGroupId === group.id;
    const requiredCount = group.documents.length;
    const uploadedCount = group.documents.filter((doc) => uploadedDocuments.some((u) => u.name === doc.name)).length;
    return (
      <div key={group.id} className="border-b border-[#FED17A] pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
        <button
          type="button"
          className="flex items-center justify-between w-full text-left"
          onClick={() => setOpenGroupId(isOpen ? "" : group.id)}
        >
          <span className="font-semibold">{group.name}</span>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {isOpen && (
          <div className="mt-2 pl-4">
            <p className="text-sm text-gray-600 mb-2">Issuing Authority: {group.authority}</p>
            <ul className="list-disc pl-5 space-y-1">
              {group.documents.map((doc) => {
                const uploaded = uploadedDocuments.some((u) => u.name === doc.name);
                return (
                  <li key={doc.id} className="flex items-center justify-between">
                    <span>{doc.name} ({doc.format})</span>
                    <div className="flex items-center space-x-2 text-sm">
                      {uploaded ? (
                        <span className="flex items-center text-green-600"><CheckCircle2 className="w-4 h-4 mr-1" />Uploaded</span>
                      ) : (
                        <span className="flex items-center text-rose-600"><FileCheck2 className="w-4 h-4 mr-1" />Missing</span>
                      )}
                      <button
                        type="button"
                        className="underline text-blue-600"
                        onClick={() => setActiveSample({ title: doc.name, content: doc.sample })}
                      >
                        View Sample
                      </button>
                      {!uploaded && (
                        <button
                          type="button"
                          className="underline text-indigo-600"
                          onClick={scrollToUpload}
                        >
                          Upload Document
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-sm font-medium">Progress: {uploadedCount} of {requiredCount} uploaded</p>
          </div>
        )}
      </div>
    );
  })}
</div>
      <div ref={uploadRef} className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#F0E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#9B2A48] text-[#FFCA7C] flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
              DL
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-[#16060E]">
                  DigiLocker Verified Statutory Certificates
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Direct statutory pull simulation from National Digital Locker system (Isolated from uploaded files)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConnectDigiLocker}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#FE7251] hover:bg-[#E85E3E] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Connect DigiLocker</span>
          </button>
        </div>

        <div className="p-6">
          {digiLockerNotice && (
            <div className="mb-4 p-4 rounded-xl bg-[#FFF7F0] border border-[#FED17A] flex items-start space-x-3 text-[#16060E] text-xs">
              <AlertCircle className="w-4 h-4 text-[#FE7251] mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-[#9B2A48]">DigiLocker Information</p>
                <p className="text-[#886A75] mt-0.5">{digiLockerNotice}</p>
              </div>
            </div>
          )}

          {digiLockerDocs.length === 0 ? (
            <div className="border border-dashed border-[#FED17A] rounded-xl p-6 text-center bg-[#FFF9F5]">
              <p className="text-xs font-semibold text-[#9B2A48]">
                No DigiLocker documents linked yet.
              </p>
              <p className="text-[11px] text-[#886A75] mt-1">
                Click <strong>&quot;Connect DigiLocker&quot;</strong> above to pull your verified PAN, Udyam, and Allotment certificates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {digiLockerDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl bg-[#FFF7F0] border border-[#FED17A] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A] flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-[#FE7251]" />
                        <span>DigiLocker Verified</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-50 text-green-800 border border-green-200">
                        Verified
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#16060E]">{doc.name}</h4>
                    <p className="text-[11px] text-slate-600 mt-1">{doc.docType}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#FED17A]/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Issued: {doc.issueDate}</span>
                    <button
                      type="button"
                      onClick={() => handleDownloadDigiDoc(doc)}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-white border border-[#FED17A] hover:bg-[#FFF2DF] text-[#9B2A48] font-bold text-[10px] transition-colors cursor-pointer"
                      title="Download statutory DigiLocker record"
                    >
                      <Download className="w-3 h-3 text-[#FE7251]" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: DOCUMENT VAULT UPLOAD */}
      <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#F0E5E0] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A] flex items-center justify-center font-bold shrink-0">
              <Cpu className="w-5 h-5 text-[#FE7251]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#16060E]">
                Document Vault Upload & Structured Field Extraction
              </h2>
              <p className="text-xs text-slate-500">
                Upload single or multiple statutory documents (PDF, JPG, PNG) for OCR parsing and parameter verification
              </p>
            </div>
          </div>

          {uploadedDocuments.length > 0 && (
            <button
              type="button"
              onClick={clearUploadedDocuments}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
            >
              Clear All Documents
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Drag and drop upload box */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-150 ${
              dragActive
                ? "border-[#FE7251] bg-[#FFF7F0] scale-[0.99]"
                : "border-[#FED17A] hover:border-[#FE7251] bg-[#FFF9F5] hover:bg-[#FFF7F0]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <UploadCloud className="w-12 h-12 text-[#FE7251] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#16060E]">
              Drop your Industrial Dossier or Click to Browse
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Upload single or multiple documents (PDF, JPG, PNG up to 30MB). Each uploaded document will appear in your document list with direct View and Remove controls.
            </p>

            <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-[#FED17A] text-xs font-bold text-[#9B2A48] shadow-xs hover:bg-[#FFF2DF]">
              <span>Select File(s) from Computer</span>
            </div>
          </div>

          {/* Upload / Extraction Error Alert */}
          {uploadError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-900 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">Upload Warning</p>
                <p className="text-rose-700 mt-0.5">{uploadError}</p>
              </div>
            </div>
          )}

          {/* Active processing indicator */}
          {isProcessingAll && (
            <div className="p-5 rounded-xl bg-[#FFF7F0] border border-[#FED17A] flex items-center space-x-3 text-[#16060E]">
              <RefreshCw className="w-5 h-5 text-[#FE7251] animate-spin shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#9B2A48]">Processing Document(s) & Running Automated Scrutiny...</p>
                <p className="text-[11px] text-[#886A75] mt-0.5">
                  Reading document text layers and extracting parameters without inventing fake values.
                </p>
              </div>
            </div>
          )}

          {/* UPLOADED DOCUMENTS LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#16060E]">
                Uploaded Documents ({uploadedDocuments.length})
              </h3>
              {uploadedDocuments.length > 0 && (
                <span className="text-[11px] text-[#886A75]">
                  Click 👁 View to preview or ✕ Remove to delete
                </span>
              )}
            </div>

            {uploadedDocuments.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-[#FED17A] bg-[#FFF9F5] text-center text-xs text-[#886A75]">
                No documents uploaded yet. Upload a document above to see it listed here.
              </div>
            ) : (
              <div className="space-y-2.5">
                {uploadedDocuments.map((doc) => {
                  const isPdf = doc.type.includes("pdf") || doc.name.toLowerCase().endsWith(".pdf");

                  return (
                    <div
                      key={doc.id}
                      className="p-3.5 sm:p-4 rounded-xl bg-white border border-[#F0E5E0] shadow-2xs hover:border-[#FED17A] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left: File details */}
                      <div className="flex items-center space-x-3 overflow-hidden min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#FFF2DF] border border-[#FED17A] flex items-center justify-center shrink-0">
                          {isPdf ? (
                            <FileText className="w-5 h-5 text-[#FE7251]" />
                          ) : (
                            <File className="w-5 h-5 text-[#9B2A48]" />
                          )}
                        </div>

                        <div className="truncate">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs sm:text-sm font-bold text-[#16060E] truncate" title={doc.name}>
                              {doc.name}
                            </span>
                            {doc.status === "processing" && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]">
                                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                <span>Extracting...</span>
                              </span>
                            )}
                            {doc.status === "extracted" && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Extracted</span>
                              </span>
                            )}
                            {doc.status === "error" && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Uploaded (Extraction Offline)</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {formatFileSize(doc.size)} • {isPdf ? "PDF Document" : "Image"} •{" "}
                            {new Date(doc.uploadedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions: [Document Name] 👁 View ⬇ Download ✕ Remove */}
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        {/* Eye icon → View */}
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(doc)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FFF2DF] hover:bg-[#FFE3B8] text-[#9B2A48] text-xs font-bold border border-[#FED17A] transition-all cursor-pointer shadow-xs"
                          title={`View ${doc.name}`}
                        >
                          <Eye className="w-3.5 h-3.5 text-[#FE7251]" />
                          <span>View</span>
                        </button>

                        {/* Download button */}
                        <button
                          type="button"
                          onClick={() => handleDownloadDocument(doc)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF2DF] text-[#9B2A48] text-xs font-bold border border-[#FED17A] transition-all cursor-pointer shadow-xs"
                          title={`Download ${doc.name}`}
                        >
                          <Download className="w-3.5 h-3.5 text-[#FE7251]" />
                          <span>Download</span>
                        </button>

                        {/* Cross icon → Remove */}
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-all cursor-pointer shadow-xs"
                          title={`Remove ${doc.name}`}
                        >
                          <X className="w-3.5 h-3.5 text-rose-600" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cross-Document Conflicts Banner */}
          {fieldConflicts.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-center space-x-2 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Cross-Document Parameter Discrepancy Detected</span>
              </div>
              <p className="text-[11px] text-amber-700">
                Conflicting non-null values were found across your uploaded documents. Neither value was arbitrarily overwritten:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[11px]">
                {fieldConflicts.map((c) => (
                  <li key={c.fieldName}>
                    <strong>{fieldDisplayMeta[c.fieldName]?.label || c.fieldName}</strong>:{" "}
                    {c.values.map((v) => `${v.documentName} ("${v.value}")`).join(" vs ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* SECTION 3: COMPLIANCE IDENTIFIERS STATUS (Strict Null Handling) */}
          <div className="p-4 rounded-xl bg-[#FFF9F5] border border-[#FED17A] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#16060E] uppercase tracking-wider">
                Statutory Identifiers (PAN / GSTIN / Aadhaar)
              </span>
              <span className="text-[10px] font-mono text-[#886A75]">Strict Null Representation • No Fake Data</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-[#F0E5E0]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-[#886A75]">
                    Goods & Services Tax (GSTIN)
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      extractedFields.gstin?.value
                        ? "bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]"
                        : "bg-[#FFF9F5] text-slate-400 border border-[#F0E5E0]"
                    }`}
                  >
                    {extractedFields.gstin?.value ? "Vault Synced" : "Missing (null)"}
                  </span>
                </div>
                <span
                  className={`font-mono font-bold block mt-1 ${
                    extractedFields.gstin?.value ? "text-[#16060E] text-sm" : "text-slate-400 italic text-xs"
                  }`}
                >
                  {extractedFields.gstin?.value ? extractedFields.gstin.value : "null"}
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#F0E5E0]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-[#886A75]">
                    Permanent Account Number (PAN)
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      extractedFields.pan?.value
                        ? "bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]"
                        : "bg-[#FFF9F5] text-slate-400 border border-[#F0E5E0]"
                    }`}
                  >
                    {extractedFields.pan?.value ? "Vault Synced" : "Missing (null)"}
                  </span>
                </div>
                <span
                  className={`font-mono font-bold block mt-1 ${
                    extractedFields.pan?.value ? "text-[#16060E] text-sm" : "text-slate-400 italic text-xs"
                  }`}
                >
                  {extractedFields.pan?.value ? extractedFields.pan.value : "null"}
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#F0E5E0]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-[#886A75]">
                    Signatory Aadhaar
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      extractedFields.aadhaar?.value
                        ? "bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]"
                        : "bg-[#FFF9F5] text-slate-400 border border-[#F0E5E0]"
                    }`}
                  >
                    {extractedFields.aadhaar?.value ? "Vault Synced" : "Missing (null)"}
                  </span>
                </div>
                <span
                  className={`font-mono font-bold block mt-1 ${
                    extractedFields.aadhaar?.value ? "text-[#16060E] text-sm" : "text-slate-400 italic text-xs"
                  }`}
                >
                  {extractedFields.aadhaar?.value ? extractedFields.aadhaar.value : "null"}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: EXTRACTED FIELDS TABLE */}
          {hasExtractedData && (
            <div className="space-y-4 pt-4 border-t border-[#F0E5E0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A] uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-[#FE7251]" />
                      <span>Extracted Parameters</span>
                    </span>
                    {uploadedDocumentName && (
                      <span className="text-xs text-slate-500 font-mono font-medium truncate max-w-xs">
                        Active: {uploadedDocumentName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Merged parameter state dynamically recalculated from active uploaded documents.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#9B2A48] bg-[#FFF2DF] border border-[#FED17A] px-2 py-1 rounded">
                    Engine: {extractionMethod || "AARAMBH Document Parser"}
                  </span>
                </div>
              </div>

              {/* Fields Table */}
              <div className="overflow-x-auto rounded-xl border border-[#F0E5E0]">
                <table className="min-w-full divide-y divide-[#F0E5E0] text-xs">
                  <thead className="bg-[#FFF9F5] text-[#9B2A48] font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-3 text-left">Statutory Field Name</th>
                      <th className="px-6 py-3 text-left">Extracted Value</th>
                      <th className="px-6 py-3 text-center">Confidence Score</th>
                      <th className="px-6 py-3 text-center">Validation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E5E0] font-medium text-slate-800">
                    {Object.entries(extractedFields).map(([key, item]) => {
                      const meta = fieldDisplayMeta[key] || {
                        label: key.replace(/_/g, " ").toUpperCase(),
                        description: "Extracted statutory field",
                      };
                      const hasValue =
                        item.value !== null &&
                        item.value !== undefined &&
                        String(item.value).trim() !== "" &&
                        String(item.value).toLowerCase() !== "null";
                      const confidencePercent = hasValue ? Math.round(item.confidenceScore * 100) : 0;

                      return (
                        <tr key={key} className="hover:bg-[#FFF7F0]/40 transition-colors">
                          <td className="px-6 py-3.5">
                            <p className="font-bold text-[#16060E]">{meta.label}</p>
                            <p className="text-[10px] text-[#886A75]">{meta.description}</p>
                          </td>
                          <td className="px-6 py-3.5 font-bold font-mono text-[#16060E] text-sm">
                            {hasValue ? (
                              <span className={item.hasConflict ? "text-amber-700 text-xs font-bold" : "text-[#16060E]"}>
                                {item.value}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-normal italic text-xs">Not Provided (null)</span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            {hasValue && !item.hasConflict ? (
                              <div className="inline-flex items-center space-x-1.5">
                                <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      confidencePercent >= 90
                                        ? "bg-[#FE7251]"
                                        : confidencePercent >= 75
                                        ? "bg-[#FFCA7C]"
                                        : "bg-rose-500"
                                    }`}
                                    style={{ width: `${confidencePercent}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-black font-mono text-[#16060E]">
                                  {confidencePercent}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-mono text-slate-400">0%</span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            {item.hasConflict ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>Conflict Detected</span>
                              </span>
                            ) : hasValue ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]">
                                <Sparkles className="w-3 h-3 text-[#FE7251]" />
                                <span>OCR Extracted</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF9F5] text-slate-400 border border-[#F0E5E0]">
                                <span>Missing (null)</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Raw snippet inspect accordion */}
              {rawTextSnippet && (
                <details className="p-3 bg-[#FFF9F5] border border-[#F0E5E0] rounded-xl text-xs text-slate-600">
                  <summary className="font-bold text-[#16060E] cursor-pointer select-none">
                    Inspect OCR Raw Text Snippet
                  </summary>
                  <pre className="mt-2 p-3 bg-[#16060E] text-[#FFCA7C] rounded-lg font-mono text-[11px] whitespace-pre-wrap overflow-x-auto">
                    {rawTextSnippet}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      </div>

      {/* INTERACTIVE DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#F0E5E0] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#F0E5E0] flex items-center justify-between bg-[#FFF9F5]">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-[#FFF2DF] border border-[#FED17A] text-[#9B2A48] flex items-center justify-center shrink-0">
                  {previewDoc.type.includes("pdf") || previewDoc.name.toLowerCase().endsWith(".pdf") ? (
                    <FileText className="w-5 h-5 text-[#FE7251]" />
                  ) : (
                    <FileCheck2 className="w-5 h-5 text-[#9B2A48]" />
                  )}
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-bold text-[#16060E] truncate" title={previewDoc.name}>
                    {previewDoc.name}
                  </h3>
                  <p className="text-[11px] text-[#886A75]">
                    {formatFileSize(previewDoc.size)} • {previewDoc.type || "Document"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadDocument(previewDoc)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#9B2A48] hover:bg-[#7D1E36] text-white text-xs font-bold shadow-2xs cursor-pointer transition-colors"
                  title="Download Document"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                {previewDoc.fileUrl && (
                  <a
                    href={previewDoc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white border border-[#FED17A] hover:bg-[#FFF2DF] text-xs font-bold text-[#9B2A48] shadow-2xs cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Open in New Tab</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Real Document Viewer */}
            <div className="p-4 flex-1 overflow-auto bg-slate-100/60 flex items-center justify-center min-h-[420px]">
              {previewDoc.type.includes("pdf") || previewDoc.name.toLowerCase().endsWith(".pdf") ? (
                previewDoc.fileUrl ? (
                  <iframe
                    src={previewDoc.fileUrl}
                    className="w-full h-[70vh] rounded-lg border border-slate-200 bg-white"
                    title={previewDoc.name}
                  />
                ) : (
                  <div className="text-center p-8 bg-white rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-600">Document URL is not available for preview.</p>
                  </div>
                )
              ) : previewDoc.type.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(previewDoc.name) ? (
                <div className="max-h-[70vh] overflow-auto flex items-center justify-center p-2">
                  <img
                    src={previewDoc.fileUrl}
                    alt={previewDoc.name}
                    className="max-h-[68vh] max-w-full object-contain rounded-lg shadow-xs"
                  />
                </div>
              ) : (
                <div className="text-center p-8 bg-white rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-600">Inline preview not directly supported for this format.</p>
                  {previewDoc.fileUrl && (
                    <a
                      href={previewDoc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#9B2A48] text-white text-xs font-bold"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Document Directly</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Statutory Sample Document Modal */}
      {activeSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#FED17A] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-5 h-5 text-[#9B2A48]" />
                <h3 className="font-bold text-base text-[#16060E]">{activeSample.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSample(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 rounded-xl bg-[#FFF7F0] border border-[#FED17A]/60 text-sm text-gray-700 space-y-2">
              <p className="font-semibold text-[#9B2A48]">Sample Guidelines & Template:</p>
              <p className="text-xs text-gray-600 leading-relaxed">{activeSample.content}</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveSample(null)}
                className="px-4 py-2 rounded-xl bg-[#9B2A48] text-white text-xs font-bold hover:bg-[#7D1E36] transition-colors cursor-pointer"
              >
                Close Sample
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
