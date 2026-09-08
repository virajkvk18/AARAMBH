import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";

import {
  supabase,
  isSupabaseConfigured,
  localDb,
  localFileStore,
  initializeDagNodesForEnterprise,
  DbEnterprise,
  DbDocument,
  DbExtractedField,
  DbDagNode,
} from "./supabase";

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

import {
  MasterCAFPayload,
  DepartmentDeltas,
} from "./caf/cafSchema";
import {
  previewCAFMapping,
  submitUnifiedCAF,
} from "./caf/integrationGateway";

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

    // 1. Save to localDb
    localDb.enterprises.set(id, enterpriseData);

    // Initialize DAG nodes if not present
    const existingNodes = Array.from(localDb.dagNodes.values()).filter(
      (n) => n.enterprise_id === id
    );
    if (existingNodes.length === 0) {
      initializeDagNodesForEnterprise(id);
    }

    // 2. Sync to Supabase if configured
    if (supabase) {
      try {
        await supabase.from("enterprises").upsert({
          id,
          name,
          sector,
          location_zone,
          capex_cr,
          power_load_kva,
          water_demand_kld,
          workforce_size,
          risk_track,
          is_assessed,
          updated_at: new Date().toISOString(),
        });
      } catch (sbErr) {
        console.warn("Supabase enterprise sync warning:", sbErr);
      }
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

    // Check localDb
    let enterprise = localDb.enterprises.get(id);

    // Try Supabase if available
    if (supabase && !enterprise) {
      const { data, error } = await supabase
        .from("enterprises")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        enterprise = data as DbEnterprise;
        localDb.enterprises.set(id, enterprise);
      }
    }

    if (!enterprise) {
      // Fallback default
      enterprise = localDb.enterprises.get("ENT-MH-2026-8891");
    }

    // Get extracted fields for enterprise
    const fields = Array.from(localDb.extractedFields.values()).filter(
      (f) => f.enterprise_id === id
    );

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

    localDb.documents.set(docId, docRecord);

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
      localDb.extractedFields.set(`${enterprise_id}:${key}`, fieldRecord);
      savedFields.push(fieldRecord);
    }

    // Sync to Supabase
    if (supabase) {
      try {
        await supabase.from("documents").insert({
          id: docId,
          enterprise_id,
          file_name,
          file_type,
          source,
          verification_status,
          raw_text_snippet,
        });

        if (savedFields.length > 0) {
          await supabase.from("extracted_fields").upsert(
            savedFields.map((f) => ({
              enterprise_id: f.enterprise_id,
              document_id: f.document_id,
              field_name: f.field_name,
              field_value: f.field_value,
              confidence_score: f.confidence_score,
            }))
          );
        }
      } catch (sbErr) {
        console.warn("Supabase document sync warning:", sbErr);
      }
    }

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
    const docs = Array.from(localDb.documents.values()).filter(
      (d) => d.enterprise_id === enterpriseId
    );
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
app.get("/api/documents/:id/file", (req: Request, res: Response): void => {
  try {
    const id = String(req.params.id);
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
    const existed = localDb.documents.delete(id);
    localFileStore.delete(id);

    // Delete associated extracted fields for this document
    for (const [key, field] of localDb.extractedFields.entries()) {
      if (field.document_id === id) {
        localDb.extractedFields.delete(key);
      }
    }

    if (supabase) {
      try {
        await supabase.from("documents").delete().eq("id", id);
        await supabase.from("extracted_fields").delete().eq("document_id", id);
      } catch (sbErr) {
        console.warn("Supabase document delete warning:", sbErr);
      }
    }

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

    // 1. Fetch from localDb
    let nodes = Array.from(localDb.dagNodes.values()).filter(
      (n) => n.enterprise_id === enterpriseId
    );

    // 2. Fetch from Supabase if configured
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("dag_nodes")
          .select("*")
          .eq("enterprise_id", enterpriseId);
        if (!error && data && data.length > 0) {
          nodes = data as DbDagNode[];
          // Update localDb cache
          nodes.forEach((n) => localDb.dagNodes.set(`${enterpriseId}:${n.id}`, n));
        }
      } catch (sbErr) {
        console.warn("Supabase DAG fetch warning:", sbErr);
      }
    }

    if (nodes.length === 0) {
      nodes = initializeDagNodesForEnterprise(enterpriseId);
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
    let nodes = Array.from(localDb.dagNodes.values()).filter(
      (n) => n.enterprise_id === enterprise_id
    );
    if (nodes.length === 0) {
      nodes = initializeDagNodesForEnterprise(enterprise_id);
    }

    // 1. Update target node to approved
    const targetKey = `${enterprise_id}:${nodeId}`;
    const targetNode = localDb.dagNodes.get(targetKey);
    if (targetNode) {
      targetNode.status = "approved";
      targetNode.updated_at = new Date().toISOString();
      localDb.dagNodes.set(targetKey, targetNode);
    }

    // 2. Dependency evaluation
    // If Root is approved -> unlock all 3 parallel children
    if (nodeId === "node-root") {
      ["node-mpcb", "node-fire", "node-water"].forEach((childId) => {
        const childNode = localDb.dagNodes.get(`${enterprise_id}:${childId}`);
        if (childNode && childNode.status === "locked") {
          childNode.status = "active";
          childNode.updated_at = new Date().toISOString();
          localDb.dagNodes.set(`${enterprise_id}:${childId}`, childNode);
        }
      });
    }

    // Check if ALL 3 children are approved -> unlock Grandchild (node-dish)
    const mpcb = localDb.dagNodes.get(`${enterprise_id}:node-mpcb`);
    const fire = localDb.dagNodes.get(`${enterprise_id}:node-fire`);
    const water = localDb.dagNodes.get(`${enterprise_id}:node-water`);
    const dish = localDb.dagNodes.get(`${enterprise_id}:node-dish`);

    if (
      mpcb?.status === "approved" &&
      fire?.status === "approved" &&
      water?.status === "approved" &&
      dish &&
      dish.status === "locked"
    ) {
      dish.status = "active";
      dish.updated_at = new Date().toISOString();
      localDb.dagNodes.set(`${enterprise_id}:node-dish`, dish);
    }

    // 3. Sync all updated nodes to Supabase Realtime table
    const allUpdatedNodes = Array.from(localDb.dagNodes.values()).filter(
      (n) => n.enterprise_id === enterprise_id
    );

    if (supabase) {
      try {
        await supabase.from("dag_nodes").upsert(
          allUpdatedNodes.map((n) => ({
            id: n.id,
            enterprise_id: n.enterprise_id,
            name: n.name,
            department: n.department,
            sla_days: n.sla_days,
            status: n.status,
            stage: n.stage,
            updated_at: n.updated_at,
          }))
        );
      } catch (sbErr) {
        console.warn("Supabase realtime node sync warning:", sbErr);
      }
    }

    res.json({
      status: "success",
      message: `Node ${nodeId} approved and dependencies evaluated`,
      nodes: allUpdatedNodes,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to approve DAG node" });
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

function persistVaultExtraction(
  extraction: AiExtractionResponse,
  docId: string,
  fileUrl: string
): {
  document: DbDocument;
  extracted_fields: DbExtractedField[];
} {
  const enterpriseId = "ENT-MH-2026-8891";
  const document: DbDocument = {
    id: docId,
    enterprise_id: enterpriseId,
    file_name: extraction.file_name,
    file_type: extraction.file_type || "application/octet-stream",
    source: "UPLOAD",
    verification_status: "AI_EXTRACTED",
    raw_text_snippet: extraction.raw_text_snippet || "",
    created_at: new Date().toISOString(),
    file_url: fileUrl,
  };
  localDb.documents.set(docId, document);

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
    localDb.extractedFields.set(`${enterpriseId}:${docId}:${field_name}`, record);
    return record;
  });

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

      const persisted = persistVaultExtraction(extraction, docId, fileUrl);
      res.status(200).json({ ...extraction, document: persisted.document });
    } catch (aiErr: any) {
      const aiDetail = aiErr.response?.data?.detail || aiErr.response?.data?.error;
      
      // Store document in localDb so it remains viewable and manageable even if AI service is offline
      const fallbackDoc: DbDocument = {
        id: docId,
        enterprise_id: "ENT-MH-2026-8891",
        file_name: originalname,
        file_type: mimetype,
        source: "UPLOAD",
        verification_status: "UPLOADED",
        raw_text_snippet: "",
        created_at: new Date().toISOString(),
        file_url: fileUrl,
      };
      localDb.documents.set(docId, fallbackDoc);

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
    const existingNodes = Array.from(localDb.dagNodes.values()).filter(
      (n) => n.enterprise_id === enterprise_id
    );
    if (existingNodes.length === 0) {
      initializeDagNodesForEnterprise(enterprise_id);
    }

    // Persist application in localDb
    localDb.enterprises.set(enterprise_id, {
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

app.listen(PORT, () => {
  console.log(`🚀 AARAMBH Backend Gateway running on http://localhost:${PORT}`);
});
