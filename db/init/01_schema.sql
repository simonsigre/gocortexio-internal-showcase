-- Cortex Pre-Sales Arsenal Database Schema
-- PostgreSQL 16

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'champion')) DEFAULT 'user',
  theatre TEXT CHECK (theatre IN ('NAM', 'EMEA', 'JAPAC', 'LATAM', 'Global')),
  department TEXT,
  okta_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Projects table (main published projects)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  link TEXT NOT NULL,
  repo TEXT,
  
  -- Categorization
  product TEXT NOT NULL CHECK (product IN (
    'Cortex XSIAM', 'Cortex XDR', 'Cortex XSOAR', 'Prisma Cloud', 'Strata'
  )),
  theatre TEXT CHECK (theatre IN ('NAM', 'EMEA', 'JAPAC', 'LATAM', 'Global')),
  usecase TEXT,
  language TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN (
    'draft', 'submitted', 'in-review', 'approved', 'published', 'rejected', 'archived'
  )) DEFAULT 'draft',
  
  -- Ownership
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Documentation (JSONB for flexibility)
  readme JSONB,
  setup JSONB,
  deployment JSONB,
  api JSONB,
  troubleshooting JSONB,
  
  -- Media
  media JSONB,
  gallery JSONB[],
  
  -- GitHub Integration
  github_api_enabled BOOLEAN DEFAULT false,
  stars INTEGER,
  forks INTEGER,
  license TEXT,
  last_updated TIMESTAMPTZ,
  
  -- AI Enhancement
  ai_enhanced BOOLEAN DEFAULT false,
  ai_quality_score INTEGER CHECK (ai_quality_score BETWEEN 0 AND 100),
  ai_suggestions JSONB,
  
  -- Tags
  tags TEXT[] DEFAULT '{}',
  technical_stack TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Submissions table (draft submissions before approval)
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Submission data
  data JSONB NOT NULL,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN (
    'draft', 'pending-review', 'in-review', 'approved', 'rejected', 'needs-work'
  )) DEFAULT 'draft',
  
  -- Ownership
  submitted_by UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Review
  review_notes TEXT,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ
);

-- Incubation projects table
CREATE TABLE incubation_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN (
    'nominated', 'in-review', 'ready', 'promoted', 'declined'
  )) DEFAULT 'nominated',
  
  -- Target
  target TEXT NOT NULL CHECK (target IN (
    'pre-sales', 'regional-nam', 'regional-emea', 'regional-japac', 'global'
  )),
  
  -- Maturity
  maturity_score INTEGER CHECK (maturity_score BETWEEN 0 AND 100),
  review_notes TEXT,
  
  -- Nomination
  nominated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  champion UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Promotion
  promotion_date DATE,
  promoted_at TIMESTAMPTZ,
  promoted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email TEXT,
  
  changes JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  ip_address INET,
  user_agent TEXT
);

-- Uploaded files table
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  
  storage_path TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'uploads',
  cdn_url TEXT,
  
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  
  processed BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_theatre ON users(theatre);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_product ON projects(product);
CREATE INDEX idx_projects_theatre ON projects(theatre);
CREATE INDEX idx_projects_submitted_by ON projects(submitted_by);
CREATE INDEX idx_projects_tags ON projects USING GIN(tags);
CREATE INDEX idx_projects_technical_stack ON projects USING GIN(technical_stack);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_published_at ON projects(published_at DESC NULLS LAST);

CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_submitted_by ON submissions(submitted_by);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);

CREATE INDEX idx_incubation_status ON incubation_projects(status);
CREATE INDEX idx_incubation_target ON incubation_projects(target);
CREATE INDEX idx_incubation_project_id ON incubation_projects(project_id);

CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

CREATE INDEX idx_uploaded_files_project ON uploaded_files(project_id);
CREATE INDEX idx_uploaded_files_submission ON uploaded_files(submission_id);
CREATE INDEX idx_uploaded_files_uploaded_by ON uploaded_files(uploaded_by);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at 
  BEFORE UPDATE ON submissions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incubation_projects_updated_at 
  BEFORE UPDATE ON incubation_projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO arsenal_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO arsenal_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO arsenal_user;
