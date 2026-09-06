-- Initial AARAMBH Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Profile Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT CHECK (role IN ('APPLICANT', 'OFFICER', 'ADMIN')) DEFAULT 'APPLICANT',
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enterprises
CREATE TABLE IF NOT EXISTS public.enterprises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    pan TEXT NOT NULL,
    gstin TEXT,
    udyam_reg_no TEXT,
    registered_address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Applications
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_number TEXT UNIQUE NOT NULL,
    enterprise_id UUID REFERENCES public.enterprises(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_title TEXT NOT NULL,
    sector TEXT NOT NULL,
    investment_amount NUMERIC,
    status TEXT CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUERY_RAISED', 'APPROVED', 'REJECTED')) DEFAULT 'DRAFT',
    caf_data JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Department Clearances
CREATE TABLE IF NOT EXISTS public.clearances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    clearance_type TEXT NOT NULL,
    status TEXT CHECK (status IN ('PENDING', 'IN_PROGRESS', 'QUERY_RAISED', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
    sla_days INT DEFAULT 15,
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_officer UUID REFERENCES public.profiles(id),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Documents
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    source TEXT CHECK (source IN ('UPLOAD', 'DIGILOCKER')) DEFAULT 'UPLOAD',
    ocr_extracted_data JSONB,
    verification_status TEXT CHECK (verification_status IN ('PENDING', 'VERIFIED', 'MISMATCH', 'REJECTED')) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
