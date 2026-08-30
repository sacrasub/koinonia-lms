-- ============================================================
-- MIGRATION 20260828: Auditoria de Acessos & Telemetria LMS-UIECB
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Tabela de Registro de Sessões de Usuários (Auditoria de Acessos)
CREATE TABLE IF NOT EXISTS lms_user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'aluno',
  avatar_url TEXT,
  device_type TEXT DEFAULT 'desktop' CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_heartbeat_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  page_views_count INTEGER DEFAULT 1,
  events_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de alta performance para auditoria e filtros
CREATE INDEX IF NOT EXISTS idx_lms_sessions_email ON lms_user_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_started_at ON lms_user_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_role ON lms_user_sessions(user_role);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_device ON lms_user_sessions(device_type);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_is_active ON lms_user_sessions(is_active);

-- 2. Tabela de Eventos de Telemetria de Uso (Product Analytics)
CREATE TABLE IF NOT EXISTS lms_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'aluno',
  category TEXT NOT NULL, -- 'navigation', 'meet', 'drive', 'cornell_notes', 'biblioteca', 'portfolio', 'rpg', etc.
  action TEXT NOT NULL,   -- 'click_open', 'create_note', 'search_book', 'submit_artifact', etc.
  label TEXT,            -- Título da disciplina, nome do livro, etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de consulta para métricas e rankings
CREATE INDEX IF NOT EXISTS idx_lms_events_category ON lms_analytics_events(category);
CREATE INDEX IF NOT EXISTS idx_lms_events_timestamp ON lms_analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_lms_events_user_email ON lms_analytics_events(user_email);
CREATE INDEX IF NOT EXISTS idx_lms_events_action ON lms_analytics_events(action);

-- 3. Inserção de dados iniciais de auditoria para o administrador principal
INSERT INTO lms_user_sessions (session_token, user_email, user_name, user_role, device_type, browser, os, started_at, last_heartbeat_at, duration_seconds, is_active, page_views_count, events_count)
VALUES (
  'sess_init_admin',
  'sacrasub@gmail.com',
  'Cristiano Sacramento (Admin/Criador)',
  'admin',
  'desktop',
  'Chrome / Windows',
  'Windows 11',
  NOW() - INTERVAL '15 minutes',
  NOW(),
  900,
  TRUE,
  12,
  24
)
ON CONFLICT (session_token) DO NOTHING;
