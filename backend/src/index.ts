import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";

import {
  isSupabaseConfigured,
  localDb,
  localFileStore,
  initializeDagNodesForEnterprise,
  DbEnterprise,
  DbDocument,
  DbExtractedField,
  DbDagNode,
  DbFiling,
} from "./supabase";

import {
  getEnterprise,
  upsertEnterprise,
  insertDocument,
  listDocuments,
  getDocument,
  deleteDocument,
  upsertExtractedFields,
  listExtractedFields,
  deleteExtractedFieldsByDocument,
  listDagNodes,
  upsertDagNodes,
  listFilings,
  upsertFiling,
  uploadDocumentFile,
  now,
} from "./db";

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

import {
  MasterCAFPayload,
  DepartmentDeltas,
} from "./caf/cafSchema";
import {
  previewCAFMapping,
  submitUnifiedCAF,
} from "./caf/integrationGateway";
import {
  evaluatePolicyIncentives,
  MAHARASHTRA_DISTRICT_TALUKAS,
  SECTOR_POLICY_REGISTRY,
} from "./rules/policyRulesEngine";
import {
  generateClearanceWorkflow,
} from "./rules/workflowRuleEngine";

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

app.use(cors());
app.use(express.json());

// Configure Multer for in-memory file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB limit
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "aarambh-backend-gateway",
    timestamp: new Date().toISOString(),
    supabase_connected: isSupabaseConfigured,
    ai_service_url: AI_SERVICE_URL,
  });
});

// ==========================================
// 1. ENTERPRISE PROFILE REST ENDPOINTS
// ==========================================

/**
 * POST /api/enterprise
 * Create / Upsert enterprise profile and initialize DAG pipeline
 */
app.post("/api/enterprise", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      id = "ENT-MH-2026-8891",
      name = "Maharashtra Solvents & Chemicals Pvt Ltd",
      sector = "Chemical Manufacturing",
      location_zone = "Chakan MIDC (Pune)",
      capex_cr = 25.0,
      power_load_kva = 150.0,
      water_demand_kld = 20.0,
      workforce_size = 75,
      risk_track = "orange",
      is_assessed = true,
    } = req.body;

    const enterpriseData: DbEnterprise = {
      id,
      name,
      sector,
      location_zone,
      capex_cr: Number(capex_cr),
      power_load_kva: Number(power_load_kva),
      water_demand_kld: Number(water_demand_kld),
      workforce_size: Number(workforce_size),
      risk_track,
      is_assessed: Boolean(is_assessed),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Persist enterprise profile (Supabase when configured, local cache otherwise)
    await upsertEnterprise(enterpriseData);

    // 2. Initialize DAG nodes if not present (and persist them so they survive restarts)
    const existingNodes = await listDagNodes(id);
    if (existingNodes.length === 0) {
      await upsertDagNodes(initializeDagNodesForEnterprise(id));
    }

    res.json({
      status: "success",
      message: "Enterprise profile persisted successfully",
      enterprise: enterpriseData,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to save enterprise profile" });
  }
});

/**
 * GET /api/enterprise/:id
 */
app.get("/api/enterprise/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    // Read from Supabase (cache updated too) or local cache
    let enterprise = await getEnterprise(id);

    if (!enterprise) {
      // Fallback default for demo mode
      enterprise = localDb.enterprises.get("ENT-MH-2026-8891") || null;
    }

    // Get extracted fields for enterprise (from vault OCR / prevalidation)
    const fields = await listExtractedFields(id);

    res.json({
      status: "success",
      enterprise,
      extracted_fields: fields,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch enterprise" });
  }
});

// ==========================================
// 2. DOCUMENTS & VAULT REST ENDPOINTS
// ==========================================

/**
 * POST /api/documents
 * Persist document metadata and extracted fields
 */
app.post("/api/documents", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      enterprise_id = "ENT-MH-2026-8891",
      file_name,
      file_type = "application/pdf",
      source = "UPLOAD",
      verification_status = "VERIFIED",
      raw_text_snippet = "",
      extracted_fields = {},
    } = req.body;

    const docId = `DOC-${Date.now().toString(36).toUpperCase()}`;

    const docRecord: DbDocument = {
      id: docId,
      enterprise_id,
      file_name,
      file_type,
      source,
      verification_status,
      raw_text_snippet,
      created_at: new Date().toISOString(),
    };

    // Persist document metadata (database first, local cache second)
    await insertDocument(docRecord);

    // Save extracted fields
    const savedFields: DbExtractedField[] = [];
    for (const [key, item] of Object.entries(extracted_fields as Record<string, any>)) {
      const fieldRecord: DbExtractedField = {
        id: `EF-${docId}-${key}`,
        enterprise_id,
        document_id: docId,
        field_name: key,
        field_value: item?.value ? String(item.value) : "",
        confidence_score: typeof item?.confidenceScore === "number" ? item.confidenceScore : 0.9,
        created_at: new Date().toISOString(),
      };
      savedFields.push(fieldRecord);
    }
    await upsertExtractedFields(savedFields);

    res.json({
      status: "success",
      document: docRecord,
      extracted_fields: savedFields,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to persist document" });
  }
});

/**
 * GET /api/documents
 * Fetch all documents for an enterprise
 */
app.get("/api/documents", async (req: Request, res: Response): Promise<void> => {
  try {
    const enterpriseId = (req.query.enterprise_id as string) || "ENT-MH-2026-8891";
    const docs = await listDocuments(enterpriseId);
    res.json({
      status: "success",
      documents: docs,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch documents" });
  }
});

/**
 * GET /api/documents/:id/file
 * Serve actual uploaded document file directly
 */
app.get("/api/documents/:id/file", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const doc = await getDocument(id);

    // Files persisted to Supabase Storage are served via their public URL
    if (doc?.file_url && /^https?:\/\//.test(doc.file_url)) {
      res.redirect(doc.file_url);
      return;
    }

    const file = localFileStore.get(id);

    if (!file) {
      res.status(404).json({ error: "Document file not found or expired from session cache." });
      return;
    }

    res.setHeader("Content-Type", file.mimetype);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(file.filename)}"`
    );
    res.send(file.buffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to stream document file" });
  }
});

/**
 * DELETE /api/documents/:id
 * Remove document, stored file buffer, and associated extracted fields
 */
app.delete("/api/documents/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const existed = await deleteDocument(id);
    localFileStore.delete(id);

    // Delete associated extracted fields for this document (DB + cache)
    await deleteExtractedFieldsByDocument(id);

    res.json({
      status: "success",
      message: "Document removed successfully",
      id,
      existed,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete document" });
  }
});

// ==========================================
// 3. DAG WORKFLOW REST ENDPOINTS
// ==========================================

/**
 * GET /api/dag/:enterpriseId
 * Retrieve live DAG nodes with their statuses
 */
app.get("/api/dag/:enterpriseId", async (req: Request, res: Response): Promise<void> => {
  try {
    const enterpriseId = String(req.params.enterpriseId);

    // Fetch from Supabase first (cache updated), fall back to local cache
    let nodes = await listDagNodes(enterpriseId);

    if (nodes.length === 0) {
      nodes = initializeDagNodesForEnterprise(enterpriseId);
      await upsertDagNodes(nodes);
    }

    res.json({
      status: "success",
      enterprise_id: enterpriseId,
      nodes,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch DAG nodes" });
  }
});

/**
 * PATCH /api/dag/:nodeId/approve
 * Approve a DAG node and automatically unlock child/grandchild nodes
 */
app.patch("/api/dag/:nodeId/approve", async (req: Request, res: Response): Promise<void> => {
  try {
    const nodeId = String(req.params.nodeId);
    const { enterprise_id = "ENT-MH-2026-8891" } = req.body;

    // Ensure enterprise nodes exist
    let nodes = await listDagNodes(enterprise_id);
    if (nodes.length === 0) {
      nodes = initializeDagNodesForEnterprise(enterprise_id);
      await upsertDagNodes(nodes);
    }

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    // 1. Update target node to approved
    const targetNode = nodeMap.get(nodeId);
    if (targetNode) {
      targetNode.status = "approved";
      targetNode.updated_at = now();
    }

    // 2. Dependency evaluation
    // If Root is approved -> unlock all 3 parallel children
    if (nodeId === "node-root") {
      ["node-mpcb", "node-fire", "node-water"].forEach((childId) => {
        const childNode = nodeMap.get(childId);
        if (childNode && childNode.status === "locked") {
          childNode.status = "active";
          childNode.updated_at = now();
        }
      });
    }

    // Check if ALL 3 children are approved -> unlock Grandchild (node-dish)
    const mpcb = nodeMap.get("node-mpcb");
    const fire = nodeMap.get("node-fire");
    const water = nodeMap.get("node-water");
    const dish = nodeMap.get("node-dish");

    if (
      mpcb?.status === "approved" &&
      fire?.status === "approved" &&
      water?.status === "approved" &&
      dish &&
      dish.status === "locked"
    ) {
      dish.status = "active";
      dish.updated_at = now();
    }

    // 3. Persist the whole pipeline (database first, cache second)
    await upsertDagNodes(nodes);

    res.json({
      status: "success",
      message: `Node ${nodeId} approved and dependencies evaluated`,
      nodes,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to approve DAG node" });
  }
});

// ==========================================
// 5. FILINGS (CROSS-FILING AUTOFILL MEMORY)
// ==========================================

/**
 * POST /api/filings
 * Persist a submitted application form so future filings can auto-fill from it
 */
app.post("/api/filings", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      enterprise_id = "ENT-MH-2026-8891",
      approval_id,
      form = {},
      status = "submitted",
    } = req.body;

    if (!approval_id) {
      res.status(400).json({ error: "Invalid request: 'approval_id' is required." });
      return;
    }

    const filing: DbFiling = {
      id: `FIL-${Date.now().toString(36).toUpperCase()}`,
      enterprise_id,
      approval_id,
      form,
      status,
      created_at: now(),
    };
    await upsertFiling(filing);

    res.json({
      status: "success",
      filing,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to save filing" });
  }
});

/**
 * GET /api/filings
 * Fetch previous filings (optionally scoped to one approval)
 */
app.get("/api/filings", async (req: Request, res: Response): Promise<void> => {
  try {
    const enterprise_id = (req.query.enterprise_id as string) || "ENT-MH-2026-8891";
    const approval_id = req.query.approval_id as string | undefined;
    const filings = await listFilings(enterprise_id, approval_id);

    res.json({
      status: "success",
      filings,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch filings" });
  }
});

// ==========================================
// 4. VAULT EXTRACTION PROXY
// ==========================================

type AiExtractionResponse = {
  status: string;
  file_name: string;
  file_type: string;
  raw_text_snippet: string;
  extracted_fields: Record<string, { value?: unknown; confidence_score?: unknown }>;
  extraction_method: string;
};

async function persistVaultExtraction(
  extraction: AiExtractionResponse,
  docId: string,
  fileUrl: string,
  enterpriseId: string,
  file?: { buffer: Buffer; mimetype: string; filename: string }
): Promise<{
  document: DbDocument;
  extracted_fields: DbExtractedField[];
}> {

  // Persist the binary to Supabase Storage when available (fallback: local buffer cache)
  let uploadedUrl: string | null = null;
  if (file) {
    uploadedUrl = await uploadDocumentFile(docId, file.buffer, file.mimetype, file.filename);
    if (!uploadedUrl) {
      localFileStore.set(docId, {
        buffer: file.buffer,
        mimetype: file.mimetype,
        filename: file.filename,
      });
    }
  }

  const resolvedFileUrl = uploadedUrl || fileUrl;
  const document: DbDocument = {
    id: docId,
    enterprise_id: enterpriseId,
    file_name: extraction.file_name,
    file_type: extraction.file_type || "application/octet-stream",
    source: "UPLOAD",
    verification_status: "AI_EXTRACTED",
    raw_text_snippet: extraction.raw_text_snippet || "",
    created_at: new Date().toISOString(),
    file_url: resolvedFileUrl,
    file_path: uploadedUrl || undefined,
  };
  await insertDocument(document);

  const extracted_fields = Object.entries(extraction.extracted_fields).map(([field_name, item]) => {
    const confidence = typeof item.confidence_score === "number" ? item.confidence_score : 0;
    const record: DbExtractedField = {
      id: `EF-${docId}-${field_name}`,
      enterprise_id: enterpriseId,
      document_id: docId,
      field_name,
      field_value: item.value == null ? "" : String(item.value),
      confidence_score: confidence,
      created_at: new Date().toISOString(),
    };
    return record;
  });
  await upsertExtractedFields(extracted_fields);

  return { document, extracted_fields };
}

/**
 * Proxy route POST /api/vault/extract
 */
app.post("/api/vault/extract", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file provided in form field 'file'" });
      return;
    }

    const { originalname, mimetype, buffer } = req.file;
    const isPdf = mimetype === "application/pdf" || originalname.toLowerCase().endsWith(".pdf");
    const isSupportedImage = ["image/jpeg", "image/png"].includes(mimetype);
    if (!isPdf && !isSupportedImage) {
      res.status(415).json({ error: "Unsupported file type. Upload a PDF, JPG, or PNG document." });
      return;
    }

    const docId = `DOC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const enterpriseId = typeof req.body?.enterprise_id === "string" && req.body.enterprise_id.trim() !== ""
      ? req.body.enterprise_id
      : undefined;
    localFileStore.set(docId, {
      buffer,
      mimetype,
      filename: originalname,
    });
    const fileUrl = `/api/documents/${docId}/file`;

    try {
      const formData = new FormData();
      formData.append("file", buffer, {
        filename: originalname,
        contentType: mimetype,
      });

      const aiResponse = await axios.post(`${AI_SERVICE_URL}/extract`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 120000,
      });

      const extraction = aiResponse.data as AiExtractionResponse;
      if (
        extraction?.status !== "success" ||
        !extraction.file_name ||
        !extraction.extracted_fields ||
        typeof extraction.extracted_fields !== "object"
      ) {
        res.status(502).json({ error: "AI service returned an invalid extraction response." });
        return;
      }

      const persisted = await persistVaultExtraction(
        extraction,
        docId,
        fileUrl,
        enterpriseId || "ENT-MH-2026-8891",
        { buffer, mimetype, filename: originalname }
      );
      res.status(200).json({ ...extraction, document: persisted.document });
    } catch (aiErr: any) {
      const aiDetail = aiErr.response?.data?.detail || aiErr.response?.data?.error;
      
      // Store document in localDb so it remains viewable and manageable even if AI service is offline
      const fallbackDoc: DbDocument = {
        id: docId,
        enterprise_id: enterpriseId || "ENT-MH-2026-8891",
        file_name: originalname,
        file_type: mimetype,
        source: "UPLOAD",
        verification_status: "UPLOADED",
        raw_text_snippet: "",
        created_at: new Date().toISOString(),
        file_url: fileUrl,
      };
      await insertDocument(fallbackDoc);

      res.status(200).json({
        status: "partial_success",
        file_name: originalname,
        file_type: mimetype,
        raw_text_snippet: "",
        extracted_fields: {
          entity_name: { value: null, confidence_score: 0 },
          pan: { value: null, confidence_score: 0 },
          gstin: { value: null, confidence_score: 0 },
          aadhaar: { value: null, confidence_score: 0 },
          plot_area_sqm: { value: null, confidence_score: 0 },
          power_load_kva: { value: null, confidence_score: 0 },
          capex_amount: { value: null, confidence_score: 0 },
        },
        extraction_method: "None",
        document: fallbackDoc,
        warning: aiDetail || "AI extraction was not available, but document is stored and viewable.",
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: "Failed to process the document." });
  }
});

// ==========================================
// 6. SYSTEM INTEGRATION GATEWAY (CAF & ADAPTERS)
// ==========================================

/**
 * POST /api/caf/preview
 * Auto-maps Master CAF + Delta inputs into department payloads with % auto-fill stats
 */
app.post("/api/caf/preview", (req: Request, res: Response): void => {
  try {
    const {
      caf,
      deltas = {},
      departments = ["mpcb", "fire", "midc", "dish"],
    } = req.body;

    if (!caf || !caf.companyDetails) {
      res.status(400).json({ error: "Invalid request: 'caf' master object is required." });
      return;
    }

    const preview = previewCAFMapping(caf as MasterCAFPayload, deltas as DepartmentDeltas, departments);
    res.json({
      status: "success",
      preview,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate CAF preview" });
  }
});

/**
 * POST /api/caf/submit
 * Parallel Multi-Department Dispatcher across state and central gateways
 */
app.post("/api/caf/submit", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      caf,
      deltas = {},
      departments = ["mpcb", "fire", "midc", "dish"],
      enterprise_id = "ENT-MH-2026-8891",
    } = req.body;

    if (!caf || !caf.companyDetails) {
      res.status(400).json({ error: "Invalid request: 'caf' master object is required." });
      return;
    }

    const submissionResult = await submitUnifiedCAF(
      caf as MasterCAFPayload,
      deltas as DepartmentDeltas,
      departments
    );

    // Synchronize DAG pipeline nodes with the new CAF submission
    const existingNodes = await listDagNodes(enterprise_id);
    if (existingNodes.length === 0) {
      await upsertDagNodes(initializeDagNodesForEnterprise(enterprise_id));
    }

    // Persist / refresh enterprise profile from the CAF payload
    await upsertEnterprise({
      id: enterprise_id,
      name: caf.companyDetails.companyName,
      sector: caf.projectSpecs.sector || "General Manufacturing",
      location_zone: caf.locationDetails.midcZoneName || `${caf.locationDetails.district}, Maharashtra`,
      capex_cr: (caf.projectSpecs.capitalInvestmentInr || 0) / 10000000,
      power_load_kva: caf.projectSpecs.powerRequirementKw || 100,
      water_demand_kld: caf.projectSpecs.waterRequirementKlpd || 10,
      workforce_size: caf.projectSpecs.totalOccupants || 50,
      risk_track: (caf.projectSpecs.hazardCategory?.toLowerCase() === "red" ? "red" : caf.projectSpecs.hazardCategory?.toLowerCase() === "green" ? "green" : "orange"),
      is_assessed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    res.status(200).json(submissionResult);
  } catch (err: any) {
    console.error("CAF Unified Submission error:", err);
    res.status(500).json({ error: err.message || "Failed to dispatch unified application" });
  }
});

/**
 * GET /api/caf/receipt/:ref
 * Download / view unified statutory acknowledgment receipt
 */
app.get("/api/caf/receipt/:ref", (req: Request, res: Response): void => {
  try {
    const ref = String(req.params.ref);
    const receiptText = `========================================================================
     GOVERNMENT OF MAHARASHTRA • INDUSTRY & LABOUR DEPARTMENT
        SINGLE WINDOW CLEARANCE SYSTEM (AARAMBH 2.0 PORTAL)
           UNIFIED COMMON APPLICATION FORM (CAF) RECEIPT
========================================================================

Master Application Ref : ${ref}
Filing Date & Time     : ${new Date().toISOString()}
Filing Type            : Combined Multi-Department Statutory Fast-Track
Statutory Protection   : Maharashtra Right to Public Services Act (RTS 2015)

------------------------------------------------------------------------
INTEGRATED DEPARTMENT DISPATCH SUMMARY:
------------------------------------------------------------------------
1. Maharashtra Pollution Control Board (MPCB)
   • Clearance: Consent to Establish (CTE)
   • Tracking ID: MPCB-TRK-2026-${Math.floor(1000 + Math.random() * 9000)}
   • Statutory SLA: 30 Working Days
   • Mode: Direct REST API (https://api.mpcb.gov.in/v1/applications/submit)

2. Maharashtra Fire Services (MahaFire)
   • Clearance: Provisional Fire NOC
   • Tracking ID: MAHAFIRE-TRK-2026-${Math.floor(1000 + Math.random() * 9000)}
   • Statutory SLA: 14 Working Days
   • Mode: Direct REST API (https://api.mahafire.gov.in/v1/noc-apply)

3. Maharashtra Industrial Development Corporation (MIDC)
   • Clearance: Industrial Land Lease & Building Sanction
   • Tracking ID: MIDC-TRK-2026-${Math.floor(1000 + Math.random() * 9000)}
   • Statutory SLA: 15 Working Days
   • Mode: Direct REST API (https://api.midcindia.org/v2/plan-sanction/submit)

4. Directorate of Industrial Safety & Health (DISH)
   • Clearance: Factory Safety & Operational License
   • Tracking ID: DISH-TRK-2026-${Math.floor(1000 + Math.random() * 9000)}
   • Statutory SLA: 10 Working Days
   • Mode: Webhook Event Dispatch (https://dish.maharashtra.gov.in/api/v1/factory-reg)

------------------------------------------------------------------------
DEEMED APPROVAL CLAUSE (RTS ACT 2015):
If any competent authority fails to issue a formal query or approval 
within the specified statutory SLA working days, the clearance certificate 
shall be deemed granted automatically by law without further notice.
========================================================================
`;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="AARAMBH_CAF_Receipt_${ref}.txt"`);
    res.send(receiptText);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to generate receipt." });
  }
});

// ==========================================
// 8. MAHARASHTRA STATUTORY & POLICY RULES ENGINE ENDPOINTS
// ==========================================

/**
 * Evaluates fiscal incentives, power subsidies, and SGST IPS under Maharashtra GRs
 */
app.post("/api/rules/evaluate", (req: Request, res: Response) => {
  try {
    const {
      sector = "general_manufacturing",
      district = "Pune",
      taluka,
      capexCr = 10,
      workforceSize = 50,
      powerLoadKw = 100,
      isScStOrWoman = false,
      isExpansion = false,
      isGreenCertified = false,
    } = req.body;

    const result = evaluatePolicyIncentives({
      sector,
      district,
      taluka,
      capexCr: Number(capexCr),
      workforceSize: Number(workforceSize),
      powerLoadKw: Number(powerLoadKw),
      isScStOrWoman: Boolean(isScStOrWoman),
      isExpansion: Boolean(isExpansion),
      isGreenCertified: Boolean(isGreenCertified),
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to evaluate policy incentives" });
  }
});

/**
 * Evaluates statutory clearance workflow and generates dynamic DAG with critical path
 */
app.post("/api/rules/workflow", (req: Request, res: Response) => {
  try {
    const {
      sector = "general_manufacturing",
      hazardCategory = "Orange",
      powerLoadKw = 100,
      buildingHeightMeters = 12,
      occupantsCount = 50,
      boilerInstalled = false,
      isMidcLand = true,
    } = req.body;

    const workflow = generateClearanceWorkflow({
      sector,
      hazardCategory,
      powerLoadKw: Number(powerLoadKw),
      buildingHeightMeters: Number(buildingHeightMeters),
      occupantsCount: Number(occupantsCount),
      boilerInstalled: Boolean(boilerInstalled),
      isMidcLand: Boolean(isMidcLand),
    });

    res.json({
      success: true,
      data: workflow,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to generate clearance workflow" });
  }
});

/**
 * Returns list of all ingested Maharashtra Industrial Policies
 */
app.get("/api/rules/policies", (_req: Request, res: Response) => {
  res.json({
    success: true,
    policies: Object.values(SECTOR_POLICY_REGISTRY),
  });
});

/**
 * Returns talukas and their PSI classification for a given district
 */
app.get("/api/rules/talukas/:district", (req: Request, res: Response) => {
  const rawDistrict = req.params.district;
  const districtName = Array.isArray(rawDistrict) ? rawDistrict[0] : (rawDistrict || "");
  const match = MAHARASHTRA_DISTRICT_TALUKAS.find(
    (d) => d.district.toLowerCase() === districtName.toLowerCase()
  );
  if (!match) {
    return res.status(404).json({ success: false, error: "District not found in Maharashtra classification" });
  }
  res.json({
    success: true,
    district: match.district,
    division: match.division,
    talukas: match.talukas,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AARAMBH Backend Gateway running on http://localhost:${PORT}`);
});
