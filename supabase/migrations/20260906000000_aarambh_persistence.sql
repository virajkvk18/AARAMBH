-- =========================================================
-- AARAMBH Industrial Single Window Clearance Portal Schema
-- Supabase PostgreSQL Migration for Realtime Persistence
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enterprises Profile Table
CREATE TABLE IF NOT EXISTS public.enterprises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sector TEXT NOT NULL,
    location_zone TEXT NOT NULL,
    capex_cr NUMERIC NOT NULL DEFAULT 25.0,
    power_load_kva NUMERIC NOT NULL DEFAULT 150.0,
    water_demand_kld NUMERIC NOT NULL DEFAULT 20.0,
    workforce_size INT NOT NULL DEFAULT 75,
    risk_track TEXT CHECK (risk_track IN ('green', 'orange', 'red')) DEFAULT 'orange',
    is_assessed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Documents Table (Uploaded & DigiLocker)
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY DEFAULT ('DOC-' || substr(md5(random()::text), 1, 8)),
    enterprise_id TEXT REFERENCES public.enterprises(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    source TEXT CHECK (source IN ('UPLOAD', 'DIGILOCKER')) DEFAULT 'UPLOAD',
    verification_status TEXT CHECK (verification_status IN ('PENDING', 'VERIFIED', 'MISMATCH', 'REJECTED')) DEFAULT 'VERIFIED',
    raw_text_snippet TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Extracted Fields Table (Per Document / Enterprise)
CREATE TABLE IF NOT EXISTS public.extracted_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id TEXT REFERENCES public.enterprises(id) ON DELETE CASCADE,
    document_id TEXT REFERENCES public.documents(id) ON DELETE SET NULL,
    field_name TEXT NOT NULL,
    field_value TEXT,
    confidence_score NUMERIC DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(enterprise_id, field_name)
);

-- 4. Applications (CAF Lifecycle)
CREATE TABLE IF NOT EXISTS public.applications (
    id TEXT PRIMARY KEY DEFAULT ('MH-CAF-' || to_char(now(), 'YYYY') || '-' || substr(md5(random()::text), 1, 5)),
    enterprise_id TEXT REFERENCES public.enterprises(id) ON DELETE CASCADE,
    application_number TEXT UNIQUE NOT NULL,
    project_title TEXT NOT NULL,
    status TEXT CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUERY_RAISED', 'APPROVED', 'REJECTED')) DEFAULT 'SUBMITTED',
    caf_data JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. DAG Workflow Nodes Table (For live parallel orchestration & Realtime Sync)
CREATE TABLE IF NOT EXISTS public.dag_nodes (
    id TEXT PRIMARY KEY, -- e.g. "node-root", "node-mpcb"
    enterprise_id TEXT REFERENCES public.enterprises(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    sla_days INT NOT NULL,
    status TEXT CHECK (status IN ('locked', 'active', 'approved')) DEFAULT 'locked',
    stage TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. DAG Edges Table
CREATE TABLE IF NOT EXISTS public.dag_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id TEXT REFERENCES public.enterprises(id) ON DELETE CASCADE,
    source_node TEXT NOT NULL,
    target_node TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Supabase Realtime replication on active tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.enterprises, public.documents, public.extracted_fields, public.dag_nodes;
  END IF;
END $$;
