"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  FolderLock,
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Building2,
  Cpu,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  useEnterpriseStore,
  ExtractedFieldItem,
  DigiLockerDocItem,
} from "@/store/enterpriseStore";

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

const fieldDisplayMeta: Record<string, { label: string; description: string }> = {
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

export default function DocumentVaultPage() {
  const {
    extractedFields,
    digiLockerDocs,
    uploadedDocumentName,
    setExtractedFields,
    setDigiLockerDocs,
  } = useEnterpriseStore();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeFileName, setActiveFileName] = useState<string | null>(uploadedDocumentName);
  const [rawTextSnippet, setRawTextSnippet] = useState<string | null>(null);
  const [extractionMethod, setExtractionMethod] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Connect DigiLocker Handler
  const handleConnectDigiLocker = () => {
    // Populate verified documents
    setDigiLockerDocs(mockDigiLockerPushedDocs);
  };

  // 2. Real File Upload & AI Extraction Handler
  const processUploadedFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setActiveFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Call Backend Proxy API (which proxies to Python FastAPI / fallback)
      const res = await fetch(`${BACKEND_API_URL}/vault/extract`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.error || errorBody?.detail || `API extraction failed with status: ${res.status}`);
      }

      const data = await res.json();

      if (data.extracted_fields) {
        const formatted: Record<string, ExtractedFieldItem> = {};
        for (const [k, v] of Object.entries(data.extracted_fields as Record<string, any>)) {
          formatted[k] = {
            value: v.value || null,
            confidenceScore: typeof v.confidence_score === "number" ? v.confidence_score : 0.85,
          };
        }

        setExtractedFields(formatted, file.name);
        setRawTextSnippet(data.raw_text_snippet || null);
        setExtractionMethod(data.extraction_method || "AARAMBH AI Document Extraction");
      } else {
        throw new Error("No extracted fields returned from extraction engine");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(
        err.message || "Failed to process document. Please ensure the file is a valid PDF/Image."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const selectFile = (file: File) => {
    setUploadError(null);
    setSelectedFile(file);
    setActiveFileName(file.name);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectFile(e.dataTransfer.files[0]);
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
    if (e.target.files && e.target.files[0]) {
      selectFile(e.target.files[0]);
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
            <span>DigiLocker & AI-Verified Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#16060E] tracking-tight">
            Document Vault & Extraction
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Store, auto-validate, and sync statutory clearances documents with automated OCR and structured parameter verification.
          </p>
        </div>

        <Link
          href="/dashboard/dag"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#7D1E36] hover:to-[#E55B3B] text-white text-xs font-bold shadow-md shadow-[#FE7251]/20 transition-all shrink-0"
        >
          <span>Proceed to DAG Workflow</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* SECTION 1: DIGILOCKER DOCUMENTS */}
      <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#F0E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#9B2A48] text-[#FFCA7C] flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
              DL
            </div>
            <div>
              <h2 className="text-base font-bold text-[#16060E]">
                DigiLocker Verified Statutory Certificates
              </h2>
              <p className="text-xs text-slate-500">
                Direct statutory pull from National Digital Locker system (Aadhaar/PAN linked)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConnectDigiLocker}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#7D1E36] hover:to-[#E55B3B] text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Connect DigiLocker</span>
          </button>
        </div>

        <div className="p-6">
          {digiLockerDocs.length === 0 ? (
            <div className="border border-dashed border-[#FED17A] rounded-xl p-6 text-center bg-[#FFF9F5]">
              <p className="text-xs font-semibold text-[#9B2A48]">
                No DigiLocker documents linked yet.
              </p>
              <p className="text-[11px] text-[#886A75] mt-1">
                Click <strong>&quot;Connect DigiLocker&quot;</strong> above to pull verified PAN, Udyam, and Allotment certificates.
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
                      <span className="text-[10px] font-mono text-slate-400">{doc.id}</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#16060E]">{doc.name}</h4>
                    <p className="text-[11px] text-slate-600 mt-1">{doc.docType}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#FED17A]/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Issued: {doc.issueDate}</span>
                    <span className="text-[#9B2A48] font-bold">100% Authentic</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: AI VAULT UPLOAD */}
      <div className="bg-white rounded-2xl border border-[#F0E5E0] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#F0E5E0] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A] flex items-center justify-center font-bold shrink-0">
              <Cpu className="w-5 h-5 text-[#FE7251]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#16060E]">
                AI Vault Upload & Structured Field Extraction
              </h2>
              <p className="text-xs text-slate-500">
                Upload PDF blueprints, lease deeds, or project DPRs for automated OCR parsing and parameter verification
              </p>
            </div>
          </div>
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
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <UploadCloud className="w-12 h-12 text-[#FE7251] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#16060E]">
              Drop your Industrial Dossier or Click to Browse
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Accepts PDF, JPG, PNG up to 30MB. Automatically verified and extracted with optical character recognition.
            </p>

            <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-[#FED17A] text-xs font-bold text-[#9B2A48] shadow-xs hover:bg-[#FFF2DF]">
              <span>Select File from Computer</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-xs text-slate-500 flex-1">
              {selectedFile
                ? `Selected: ${selectedFile.name}`
                : "Select a PDF, JPG, or PNG document to begin."}
            </p>
            <button
              type="button"
              onClick={() => selectedFile && processUploadedFile(selectedFile)}
              disabled={!selectedFile || isUploading}
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2A48] via-[#FE7251] to-[#FE7251] hover:from-[#7D1E36] hover:to-[#E55B3B] disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-all"
            >
              <Cpu className="w-4 h-4" />
              <span>{isUploading ? "Processing…" : "Process with AI"}</span>
            </button>
          </div>

          {/* Loading Indicator */}
          {isUploading && (
            <div className="p-5 rounded-xl bg-[#FFF7F0] border border-[#FED17A] flex items-center space-x-3 text-[#16060E]">
              <RefreshCw className="w-5 h-5 text-[#FE7251] animate-spin shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#9B2A48]">Processing Document & Running Automated Scrutiny...</p>
                <p className="text-[11px] text-[#886A75] mt-0.5">
                  Parsing text layer and structuring regulatory parameters for pre-validation.
                </p>
              </div>
            </div>
          )}

          {/* Error Indicator */}
          {uploadError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-900 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">Extraction Failed</p>
                <p className="text-rose-700 mt-0.5">{uploadError}</p>
              </div>
            </div>
          )}

          {/* SECTION 3: EXTRACTED FIELDS TABLE */}
          {hasExtractedData && (
            <div className="space-y-4 pt-4 border-t border-[#F0E5E0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A] uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-[#FE7251]" />
                      <span>AI Extracted Payload</span>
                    </span>
                    {activeFileName && (
                      <span className="text-xs text-slate-500 font-mono font-medium truncate max-w-xs">
                        Source: {activeFileName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Structured extraction stored into shared <code>enterpriseStore</code>.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#9B2A48] bg-[#FFF2DF] border border-[#FED17A] px-2 py-1 rounded">
                    Engine: {extractionMethod || "AARAMBH AI Parser"}
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
                      const confidencePercent = Math.round(item.confidenceScore * 100);

                      return (
                        <tr key={key} className="hover:bg-[#FFF7F0]/40 transition-colors">
                          <td className="px-6 py-3.5">
                            <p className="font-bold text-[#16060E]">{meta.label}</p>
                            <p className="text-[10px] text-slate-400">{meta.description}</p>
                          </td>
                          <td className="px-6 py-3.5 font-bold font-mono text-[#16060E] text-sm">
                            {item.value || (
                              <span className="text-slate-400 font-normal italic">Not Found in Document</span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-center">
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
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF2DF] text-[#9B2A48] border border-[#FED17A]">
                              <Sparkles className="w-3 h-3 text-[#FE7251]" />
                              <span>AI Extracted</span>
                            </span>
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
    </div>
  );
}
