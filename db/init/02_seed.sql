-- Seed data for development

-- Create default system user
INSERT INTO users (id, email, name, role, theatre) VALUES
  ('00000000-0000-0000-0000-000000000001', 'system@cortex-arsenal.local', 'System', 'admin', 'Global'),
  ('00000000-0000-0000-0000-000000000002', 'admin@cortex-arsenal.local', 'Admin User', 'admin', 'Global'),
  ('00000000-0000-0000-0000-000000000003', 'user@cortex-arsenal.local', 'Test User', 'user', 'NAM')
ON CONFLICT (email) DO NOTHING;

-- Sample projects (migrated from existing projects.json)
INSERT INTO projects (
  name, description, link, repo, product, theatre, usecase, language,
  status, submitted_by, github_api_enabled, tags, published_at
) VALUES
  (
    'XSIAM Alert Enrichment Framework',
    'Automated alert enrichment using threat intelligence APIs and machine learning',
    'https://github.com/example/xsiam-enrichment',
    'example/xsiam-enrichment',
    'Cortex XSIAM',
    'NAM',
    'Security Operations',
    'Python',
    'published',
    '00000000-0000-0000-0000-000000000001',
    true,
    ARRAY['automation', 'threat-intelligence', 'enrichment'],
    NOW() - INTERVAL '30 days'
  ),
  (
    'XDR Mobile Threat Dashboard',
    'Interactive dashboard for visualizing mobile endpoint threats',
    'https://github.com/example/xdr-dashboard',
    'example/xdr-dashboard',
    'Cortex XDR',
    'EMEA',
    'Threat Detection',
    'TypeScript',
    'published',
    '00000000-0000-0000-0000-000000000001',
    true,
    ARRAY['dashboard', 'visualization', 'mobile'],
    NOW() - INTERVAL '15 days'
  )
ON CONFLICT (name) DO NOTHING;

-- Sample incubation project
INSERT INTO incubation_projects (
  project_id, status, target, maturity_score, nominated_by, review_notes
)
SELECT 
  id, 
  'ready', 
  'pre-sales', 
  92,
  '00000000-0000-0000-0000-000000000002',
  'Ready for pre-sales promotion. Excellent documentation and test coverage.'
FROM projects 
WHERE name = 'XSIAM Alert Enrichment Framework'
ON CONFLICT (project_id) DO NOTHING;

-- Sample audit log entries
INSERT INTO audit_log (action, resource_type, resource_id, user_id, user_email, metadata)
SELECT 
  'create', 
  'project', 
  id,
  submitted_by,
  'system@cortex-arsenal.local',
  jsonb_build_object('source', 'migration', 'version', '1.0')
FROM projects
WHERE status = 'published';
