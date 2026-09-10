import {
  supabase,
  localDb,
  DbEnterprise,
  DbDocument,
  DbExtractedField,
  DbDagNode,
  DbFiling,
} from "./supabase";

export function now(): string {
  return new Date().toISOString();
}

function logErr(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

// ---------------------------------------------------------------------------
// Row mappers (Supabase schema <-> in-memory types)
// ---------------------------------------------------------------------------

function mapEnterpriseRow(row: any): DbEnterprise {
  return {
    id: String(row.id),
    name: row.name,
    sector: row.sector ?? "",
    location_zone: row.location_zone ?? "",
    capex_cr: Number(row.capex_cr ?? 0),
    power_load_kva: Number(row.power_load_kva ?? 0),
    water_demand_kld: Number(row.water_demand_kld ?? 0),
    workforce_size: Number(row.workforce_size ?? 0),
    risk_track: row.risk_track ?? "orange",
    is_assessed: Boolean(row.is_assessed),
    user_id: row.user_id ?? undefined,
    entity_type: row.entity_type ?? undefined,
    pan: row.pan ?? undefined,
    gstin: row.gstin ?? undefined,
    udyam_reg_no: row.udyam_reg_no ?? undefined,
    registered_address: row.registered_address ?? undefined,
    created_at: row.created_at ?? now(),
    updated_at: row.updated_at ?? now(),
  };
}

function enterpriseToRow(ent: DbEnterprise) {
  return {
    id: ent.id,
    name: ent.name,
    sector: ent.sector,
    location_zone: ent.location_zone,
    capex_cr: ent.capex_cr,
    power_load_kva: ent.power_load_kva,
    water_demand_kld: ent.water_demand_kld,
    workforce_size: ent.workforce_size,
    risk_track: ent.risk_track,
    is_assessed: ent.is_assessed,
    user_id: ent.user_id ?? null,
    entity_type: ent.entity_type ?? null,
    pan: ent.pan ?? null,
    gstin: ent.gstin ?? null,
    udyam_reg_no: ent.udyam_reg_no ?? null,
    registered_address: ent.registered_address ?? null,
    updated_at: now(),
  };
}

function mapDocumentRow(row: any): DbDocument {
  return {
    id: String(row.id),
    enterprise_id: String(row.enterprise_id),
    file_name: row.file_name,
    file_type: row.file_type ?? "application/octet-stream",
    source: row.source ?? "UPLOAD",
    verification_status: row.verification_status ?? "UPLOADED",
    raw_text_snippet: row.raw_text_snippet ?? "",
    created_at: row.created_at ?? now(),
    file_url: row.file_url ?? row.file_path ?? undefined,
    file_path: row.file_path ?? undefined,
    application_id: row.application_id ?? undefined,
    document_type: row.document_type ?? undefined,
    ocr_extracted_data: row.ocr_extracted_data ?? undefined,
  };
}

function documentToRow(doc: DbDocument) {
  return {
    id: doc.id,
    enterprise_id: doc.enterprise_id,
    file_name: doc.file_name,
    file_type: doc.file_type,
    source: doc.source,
    verification_status: doc.verification_status,
    raw_text_snippet: doc.raw_text_snippet ?? "",
    file_path: doc.file_path ?? doc.file_url ?? null,
    file_url: doc.file_url ?? null,
    application_id: doc.application_id ?? null,
    document_type: doc.document_type ?? null,
    ocr_extracted_data: doc.ocr_extracted_data ?? null,
  };
}

function mapExtractedFieldRow(row: any): DbExtractedField {
  return {
    id: String(row.id),
    enterprise_id: String(row.enterprise_id),
    document_id: String(row.document_id),
    field_name: row.field_name,
    field_value: row.field_value ?? "",
    confidence_score: Number(row.confidence_score ?? 0),
    created_at: row.created_at ?? now(),
  };
}

function mapDagNodeRow(row: any): DbDagNode {
  return {
    id: String(row.id),
    enterprise_id: String(row.enterprise_id),
    name: row.name,
    department: row.department ?? "",
    sla_days: Number(row.sla_days ?? 0),
    status: row.status ?? "locked",
    stage: row.stage ?? "",
    updated_at: row.updated_at ?? now(),
  };
}

function mapFilingRow(row: any): DbFiling {
  return {
    id: String(row.id),
    enterprise_id: String(row.enterprise_id),
    approval_id: row.approval_id ?? "",
    form: row.form ?? {},
    status: row.status ?? "submitted",
    created_at: row.created_at ?? now(),
  };
}

// ---------------------------------------------------------------------------
// Enterprises
// ---------------------------------------------------------------------------

export async function getEnterprise(id: string): Promise<DbEnterprise | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("enterprises").select("*").eq("id", id).single();
      if (!error && data) {
        const ent = mapEnterpriseRow(data);
        localDb.enterprises.set(id, ent);
        return ent;
      }
    } catch (e) {
      console.warn("db.getEnterprise error:", logErr(e));
    }
  }
  return localDb.enterprises.get(id) || null;
}

export async function upsertEnterprise(ent: DbEnterprise): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase.from("enterprises").upsert(enterpriseToRow(ent), { onConflict: "id" });
      if (error) console.warn("db.upsertEnterprise error:", error.message);
    } catch (e) {
      console.warn("db.upsertEnterprise exc:", logErr(e));
    }
  }
  localDb.enterprises.set(ent.id, { ...ent, updated_at: now() });
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export async function insertDocument(doc: DbDocument): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase.from("documents").insert(documentToRow(doc));
      if (error) console.warn("db.insertDocument error:", error.message);
    } catch (e) {
      console.warn("db.insertDocument exc:", logErr(e));
    }
  }
  localDb.documents.set(doc.id, { ...doc });
}

export async function listDocuments(enterpriseId: string): Promise<DbDocument[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("enterprise_id", enterpriseId)
        .order("created_at", { ascending: false });
      if (!error && Array.isArray(data)) {
        const docs = data.map(mapDocumentRow);
        docs.forEach((d) => localDb.documents.set(d.id, d));
        return docs;
      }
    } catch (e) {
      console.warn("db.listDocuments error:", logErr(e));
    }
  }
  return Array.from(localDb.documents.values()).filter((d) => d.enterprise_id === enterpriseId);
}

export async function getDocument(id: string): Promise<DbDocument | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("documents").select("*").eq("id", id).single();
      if (!error && data) {
        const doc = mapDocumentRow(data);
        localDb.documents.set(id, doc);
        return doc;
      }
    } catch (e) {
      console.warn("db.getDocument error:", logErr(e));
    }
  }
  return localDb.documents.get(id) || null;
}

export async function deleteDocument(id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) console.warn("db.deleteDocument error:", error.message);
    } catch (e) {
      console.warn("db.deleteDocument exc:", logErr(e));
    }
  }
  return localDb.documents.delete(id);
}

// ---------------------------------------------------------------------------
// Extracted fields (OCR vault)
// ---------------------------------------------------------------------------

export async function upsertExtractedFields(fields: DbExtractedField[]): Promise<void> {
  if (fields.length === 0) return;
  if (supabase) {
    try {
      const { error } = await supabase.from("extracted_fields").upsert(
        fields.map((f) => ({
          id: f.id,
          enterprise_id: f.enterprise_id,
          document_id: f.document_id,
          field_name: f.field_name,
          field_value: f.field_value,
          confidence_score: f.confidence_score,
        })),
        { onConflict: "id" }
      );
      if (error) console.warn("db.upsertExtractedFields error:", error.message);
    } catch (e) {
      console.warn("db.upsertExtractedFields exc:", logErr(e));
    }
  }
  fields.forEach((f) => localDb.extractedFields.set(f.id, { ...f }));
}

export async function listExtractedFields(enterpriseId: string): Promise<DbExtractedField[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("extracted_fields")
        .select("*")
        .eq("enterprise_id", enterpriseId);
      if (!error && Array.isArray(data)) {
        const fields = data.map(mapExtractedFieldRow);
        fields.forEach((f) => localDb.extractedFields.set(f.id, f));
        return fields;
      }
    } catch (e) {
      console.warn("db.listExtractedFields error:", logErr(e));
    }
  }
  return Array.from(localDb.extractedFields.values()).filter((f) => f.enterprise_id === enterpriseId);
}

export async function deleteExtractedFieldsByDocument(documentId: string): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase.from("extracted_fields").delete().eq("document_id", documentId);
      if (error) console.warn("db.deleteExtractedFieldsByDocument error:", error.message);
    } catch (e) {
      console.warn("db.deleteExtractedFieldsByDocument exc:", logErr(e));
    }
  }
  for (const [key, f] of localDb.extractedFields.entries()) {
    if (f.document_id === documentId) localDb.extractedFields.delete(key);
  }
}

// ---------------------------------------------------------------------------
// DAG workflow nodes
// ---------------------------------------------------------------------------

export async function listDagNodes(enterpriseId: string): Promise<DbDagNode[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("dag_nodes")
        .select("*")
        .eq("enterprise_id", enterpriseId);
      if (!error && Array.isArray(data)) {
        const nodes = data.map(mapDagNodeRow);
        nodes.forEach((n) => localDb.dagNodes.set(`${enterpriseId}:${n.id}`, n));
        return nodes;
      }
    } catch (e) {
      console.warn("db.listDagNodes error:", logErr(e));
    }
  }
  return Array.from(localDb.dagNodes.values()).filter((n) => n.enterprise_id === enterpriseId);
}

export async function upsertDagNodes(nodes: DbDagNode[]): Promise<void> {
  if (nodes.length === 0) return;
  if (supabase) {
    try {
      const { error } = await supabase.from("dag_nodes").upsert(
        nodes.map((n) => ({
          id: n.id,
          enterprise_id: n.enterprise_id,
          name: n.name,
          department: n.department,
          sla_days: n.sla_days,
          status: n.status,
          stage: n.stage,
          updated_at: n.updated_at,
        })),
        { onConflict: "id" }
      );
      if (error) console.warn("db.upsertDagNodes error:", error.message);
    } catch (e) {
      console.warn("db.upsertDagNodes exc:", logErr(e));
    }
  }
  nodes.forEach((n) => localDb.dagNodes.set(`${n.enterprise_id}:${n.id}`, { ...n }));
}

// ---------------------------------------------------------------------------
// Filings (autofill memory from past applications)
// ---------------------------------------------------------------------------

export async function listFilings(enterpriseId: string, approvalId?: string): Promise<DbFiling[]> {
  let dbFilings: DbFiling[] = [];
  if (supabase) {
    try {
      let query = supabase.from("filings").select("*").eq("enterprise_id", enterpriseId);
      if (approvalId) query = query.eq("approval_id", approvalId);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && Array.isArray(data)) {
        dbFilings = data.map(mapFilingRow);
        dbFilings.forEach((f) => localDb.filings.set(f.id, f));
      }
    } catch (e) {
      console.warn("db.listFilings error:", logErr(e));
    }
  }
  if (dbFilings.length > 0) return dbFilings;
  return Array.from(localDb.filings.values()).filter(
    (f) => f.enterprise_id === enterpriseId && (!approvalId || f.approval_id === approvalId)
  );
}

export async function upsertFiling(filing: DbFiling): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase.from("filings").upsert(
        {
          id: filing.id,
          enterprise_id: filing.enterprise_id,
          approval_id: filing.approval_id,
          form: filing.form,
          status: filing.status,
          created_at: filing.created_at ?? now(),
        },
        { onConflict: "id" }
      );
      if (error) console.warn("db.upsertFiling error:", error.message);
    } catch (e) {
      console.warn("db.upsertFiling exc:", logErr(e));
    }
  }
  localDb.filings.set(filing.id, { ...filing, created_at: filing.created_at ?? now() });
}

// ---------------------------------------------------------------------------
// File storage (Supabase Storage "documents" bucket with local fallback)
// ---------------------------------------------------------------------------

export async function uploadDocumentFile(
  docId: string,
  buffer: Buffer,
  mimetype: string,
  filename: string
): Promise<string | null> {
  if (!supabase) return null;
  try {
    const filePath = `${docId}/${filename}`;
    const { error } = await supabase.storage
      .from("documents")
      .upload(filePath, buffer, { contentType: mimetype, upsert: true });
    if (error) {
      console.warn("db.uploadDocumentFile error (is a 'documents' bucket created?):", error.message);
      return null;
    }
    const { data } = supabase.storage.from("documents").getPublicUrl(filePath);
    return data?.publicUrl || null;
  } catch (e) {
    console.warn("db.uploadDocumentFile exc:", logErr(e));
    return null;
  }
}