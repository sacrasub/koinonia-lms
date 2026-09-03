-- ============================================================
-- MIGRATION 20260904: Criação Definitiva das Tabelas de Telemetria e Auditoria
-- Copie e cole este código no Supabase Dashboard > SQL Editor e clique em 'RUN'
-- ============================================================

-- 1. Tabela de Sessões de Usuários (Auditoria e Telemetria Global)
CREATE TABLE IF NOT EXISTS public.lms_user_sessions (
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

-- Índices de Alta Performance para Auditoria e Filtros
CREATE INDEX IF NOT EXISTS idx_lms_sessions_email ON public.lms_user_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_started_at ON public.lms_user_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_role ON public.lms_user_sessions(user_role);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_device ON public.lms_user_sessions(device_type);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_is_active ON public.lms_user_sessions(is_active);

-- 2. Tabela de Eventos de Telemetria de Uso (Product Analytics)
CREATE TABLE IF NOT EXISTS public.lms_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'aluno',
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  label TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de Performance para Métricas
CREATE INDEX IF NOT EXISTS idx_lms_events_category ON public.lms_analytics_events(category);
CREATE INDEX IF NOT EXISTS idx_lms_events_timestamp ON public.lms_analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_lms_events_user_email ON public.lms_analytics_events(user_email);

-- 3. Habilita RLS com Políticas Permissivas para Chave Anon e Autenticados
-- (Visitantes em tela de bloqueio e alunos matriculados precisam registrar acessos)
ALTER TABLE public.lms_user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de sessions para todos" ON public.lms_user_sessions;
CREATE POLICY "Permitir leitura de sessions para todos"
  ON public.lms_user_sessions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir escrita de sessions para todos" ON public.lms_user_sessions;
CREATE POLICY "Permitir escrita de sessions para todos"
  ON public.lms_user_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura de events para todos" ON public.lms_analytics_events;
CREATE POLICY "Permitir leitura de events para todos"
  ON public.lms_analytics_events FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir escrita de events para todos" ON public.lms_analytics_events;
CREATE POLICY "Permitir escrita de events para todos"
  ON public.lms_analytics_events FOR ALL
  USING (true)
  WITH CHECK (true);
