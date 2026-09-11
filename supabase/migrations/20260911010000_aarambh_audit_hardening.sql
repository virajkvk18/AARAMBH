-- ==============================================================================
-- AARAMBH Audit & Hardening Migration
-- Additive Schema Updates & Comprehensive Row-Level Security
-- ==============================================================================

-- 1. Extend profiles with applicant identity and address fields
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS entity_type TEXT,
    ADD COLUMN IF NOT EXISTS pan_number TEXT,
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS district TEXT,
    ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Maharashtra',
    ADD COLUMN IF NOT EXISTS pincode TEXT;

-- 2. Update handle_new_user trigger to populate extended profile fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, email, full_name, phone, role, department, 
        entity_type, pan_number, address, city, district, state, pincode
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'phone',
        UPPER(COALESCE(NEW.raw_user_meta_data->>'role', 'APPLICANT')),
        NEW.raw_user_meta_data->>'department',
        NEW.raw_user_meta_data->>'entity_type',
        NEW.raw_user_meta_data->>'pan_number',
        NEW.raw_user_meta_data->>'address',
        NEW.raw_user_meta_data->>'city',
        NEW.raw_user_meta_data->>'district',
        COALESCE(NEW.raw_user_meta_data->>'state', 'Maharashtra'),
        NEW.raw_user_meta_data->>'pincode'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can select their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Officers and admins can view profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

    CREATE POLICY "Users can select their own profile"
        ON public.profiles FOR SELECT
        USING (
            auth.uid() = id
            OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('OFFICER', 'ADMIN')
        );

    CREATE POLICY "Users can insert their own profile"
        ON public.profiles FOR INSERT
        WITH CHECK (auth.uid() = id);

    CREATE POLICY "Users can update their own profile"
        ON public.profiles FOR UPDATE
        USING (auth.uid() = id);
END $$;

-- 4. Row Level Security for enterprises
ALTER TABLE public.enterprises ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "enterprises own" ON public.enterprises;
    DROP POLICY IF EXISTS "enterprises_select" ON public.enterprises;
    DROP POLICY IF EXISTS "enterprises_insert" ON public.enterprises;
    DROP POLICY IF EXISTS "enterprises_update" ON public.enterprises;

    CREATE POLICY "enterprises_select"
        ON public.enterprises FOR SELECT
        USING (
            user_id = auth.uid()
            OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('OFFICER', 'ADMIN')
        );

    CREATE POLICY "enterprises_insert"
        ON public.enterprises FOR INSERT
        WITH CHECK (user_id = auth.uid());

    CREATE POLICY "enterprises_update"
        ON public.enterprises FOR UPDATE
        USING (user_id = auth.uid());
END $$;

-- 5. Row Level Security for applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "applications_select" ON public.applications;
    DROP POLICY IF EXISTS "applications_insert" ON public.applications;
    DROP POLICY IF EXISTS "applications_update" ON public.applications;

    CREATE POLICY "applications_select"
        ON public.applications FOR SELECT
        USING (
            user_id = auth.uid()
            OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('OFFICER', 'ADMIN')
        );

    CREATE POLICY "applications_insert"
        ON public.applications FOR INSERT
        WITH CHECK (user_id = auth.uid());

    CREATE POLICY "applications_update"
        ON public.applications FOR UPDATE
        USING (
            user_id = auth.uid()
            OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('OFFICER', 'ADMIN')
        );
END $$;

-- 6. Row Level Security for clearances
ALTER TABLE public.clearances ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "clearances_select" ON public.clearances;
    DROP POLICY IF EXISTS "clearances_insert" ON public.clearances;
    DROP POLICY IF EXISTS "clearances_update" ON public.clearances;

    CREATE POLICY "clearances_select"
        ON public.clearances FOR SELECT
        USING (
            application_id IN (SELECT id FROM public.applications WHERE user_id = auth.uid())
            OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('OFFICER', 'ADMIN')
        );

    CREATE POLICY "clearances_insert"
        ON public.clearances FOR INSERT
        WITH CHECK (
            application_id IN (SELECT id FROM public.applications WHERE user_id = auth.uid())
            OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('OFFICER', 'ADMIN')
        );

    CREATE POLICY "clearances_update"
        ON public.clearances FOR UPDATE
        USING (
            assigned_officer = auth.uid()
            OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
        );
END $$;

-- 7. Row Level Security for documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "documents_select" ON public.documents;
    DROP POLICY IF EXISTS "documents_insert" ON public.documents;
    DROP POLICY IF EXISTS "documents_update" ON public.documents;
    DROP POLICY IF EXISTS "documents_delete" ON public.documents;

    CREATE POLICY "documents_select"
        ON public.documents FOR SELECT
        USING (
            enterprise_id IN (SELECT id FROM public.enterprises WHERE user_id = auth.uid())
            OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('OFFICER', 'ADMIN')
        );

    CREATE POLICY "documents_insert"
        ON public.documents FOR INSERT
        WITH CHECK (
            enterprise_id IN (SELECT id FROM public.enterprises WHERE user_id = auth.uid())
        );

    CREATE POLICY "documents_update"
        ON public.documents FOR UPDATE
        USING (
            enterprise_id IN (SELECT id FROM public.enterprises WHERE user_id = auth.uid())
            OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('OFFICER', 'ADMIN')
        );

    CREATE POLICY "documents_delete"
        ON public.documents FOR DELETE
        USING (
            enterprise_id IN (SELECT id FROM public.enterprises WHERE user_id = auth.uid())
        );
END $$;

-- 8. Row Level Security for extracted_fields
ALTER TABLE public.extracted_fields ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "extracted_fields_all" ON public.extracted_fields;

    CREATE POLICY "extracted_fields_all"
        ON public.extracted_fields FOR ALL
        USING (
            enterprise_id IN (SELECT id FROM public.enterprises WHERE user_id = auth.uid())
            OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('OFFICER', 'ADMIN')
        );
END $$;

-- 9. Row Level Security for DAG workflow (dag_nodes, dag_edges)
ALTER TABLE public.dag_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dag_edges ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "dag_nodes_all" ON public.dag_nodes;
    DROP POLICY IF EXISTS "dag_edges_all" ON public.dag_edges;

    CREATE POLICY "dag_nodes_all"
        ON public.dag_nodes FOR ALL
        USING (
            enterprise_id IN (SELECT id FROM public.enterprises WHERE user_id = auth.uid())
            OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('OFFICER', 'ADMIN')
        );

    CREATE POLICY "dag_edges_all"
        ON public.dag_edges FOR ALL
        USING (
            enterprise_id IN (SELECT id FROM public.enterprises WHERE user_id = auth.uid())
            OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('OFFICER', 'ADMIN')
        );
END $$;
