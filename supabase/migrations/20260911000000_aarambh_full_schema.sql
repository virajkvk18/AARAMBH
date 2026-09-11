-- ==============================================================================
-- AARAMBH Full Schema — Single Consolidated Migration
-- Maharashtra Industrial Single Window Clearance Portal
-- ==============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Profiles (auth-linked)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT CHECK (role IN ('APPLICANT', 'OFFICER', 'ADMIN')) DEFAULT 'APPLICANT',
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enterprises (merged legal-identity + industrial-parameters)
CREATE TABLE public.enterprises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    entity_type TEXT DEFAULT 'Private Limited',
    pan TEXT,
    gstin TEXT,
    udyam_reg_no TEXT,
    registered_address JSONB,
    sector TEXT,
    capex_cr NUMERIC DEFAULT 25.0,
    power_load_kva NUMERIC DEFAULT 150.0,
    water_demand_kld NUMERIC DEFAULT 20.0,
    workforce_size INT DEFAULT 75,
    risk_track TEXT CHECK (risk_track IN ('green', 'orange', 'red')) DEFAULT 'orange',
    is_assessed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Applications (CAF lifecycle)
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_number TEXT UNIQUE NOT NULL,
    enterprise_id UUID REFERENCES public.enterprises(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    project_title TEXT NOT NULL,
    sector TEXT NOT NULL,
    investment_amount NUMERIC,
    status TEXT CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUERY_RAISED', 'APPROVED', 'REJECTED')) DEFAULT 'SUBMITTED',
    caf_data JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Department Clearances
CREATE TABLE public.clearances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    clearance_type TEXT NOT NULL,
    status TEXT CHECK (status IN ('PENDING', 'IN_PROGRESS', 'QUERY_RAISED', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
    sla_days INT DEFAULT 15,
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_officer UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Documents (vault + application docs)
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id UUID REFERENCES public.enterprises(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
    document_type TEXT,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_path TEXT,
    source TEXT CHECK (source IN ('UPLOAD', 'DIGILOCKER')) DEFAULT 'UPLOAD',
    ocr_extracted_data JSONB,
    verification_status TEXT CHECK (verification_status IN ('PENDING', 'VERIFIED', 'MISMATCH', 'REJECTED')) DEFAULT 'VERIFIED',
    raw_text_snippet TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Extracted Fields (auto-fill / document intelligence)
CREATE TABLE public.extracted_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id UUID REFERENCES public.enterprises(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    field_name TEXT NOT NULL,
    field_value TEXT,
    confidence_score NUMERIC DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(enterprise_id, field_name)
);

-- 8. DAG Workflow Nodes
CREATE TABLE public.dag_nodes (
    id TEXT NOT NULL,
    enterprise_id UUID REFERENCES public.enterprises(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    sla_days INT NOT NULL,
    status TEXT CHECK (status IN ('locked', 'active', 'approved')) DEFAULT 'locked',
    stage TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (enterprise_id, id)
);

-- 9. DAG Workflow Edges
CREATE TABLE public.dag_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id UUID REFERENCES public.enterprises(id) ON DELETE CASCADE,
    source_node TEXT NOT NULL,
    target_node TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_enterprises_user_id ON public.enterprises(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_enterprise_id ON public.applications(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_documents_enterprise_id ON public.documents(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_extracted_fields_enterprise_id ON public.extracted_fields(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_dag_nodes_enterprise_id ON public.dag_nodes(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_dag_edges_enterprise_id ON public.dag_edges(enterprise_id);

-- 11. Row Level Security on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 12. Auto-create profile row on new auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone, role, department)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'phone',
        upper(coalesce(NEW.raw_user_meta_data->>'role', 'applicant')),
        NEW.raw_user_meta_data->>'department'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 13. Enable Supabase Realtime on active tables
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE
            public.enterprises,
            public.documents,
            public.extracted_fields,
            public.dag_nodes,
            public.applications,
            public.clearances;
    END IF;
END $$;
