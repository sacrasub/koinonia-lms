-- ==============================================================================
-- LMS KOINONIA: TABELA DE ARTIGOS E TRABALHOS ACADÊMICOS NO PADRÃO ABNT
-- DIRETRIZ: Blindagem de Egress (Supabase Free Plan), Local-First e RLS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS lms_abnt_articles (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    title TEXT NOT NULL,
    template_type TEXT NOT NULL,
    disciplina_id TEXT,
    disciplina_name TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    word_count INT DEFAULT 0,
    estimated_pages INT DEFAULT 1,
    content_json JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice composto para consulta pontual de metadados por aluno (TTFB < 50ms)
CREATE INDEX IF NOT EXISTS idx_lms_abnt_articles_email_updated
    ON lms_abnt_articles(user_email, updated_at DESC);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_lms_abnt_articles_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_lms_abnt_articles_timestamp ON lms_abnt_articles;
CREATE TRIGGER trg_update_lms_abnt_articles_timestamp
BEFORE UPDATE ON lms_abnt_articles
FOR EACH ROW
EXECUTE FUNCTION update_lms_abnt_articles_timestamp();

-- Habilitar Row Level Security (RLS)
ALTER TABLE lms_abnt_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de lms_abnt_articles" ON lms_abnt_articles;
CREATE POLICY "Permitir leitura de lms_abnt_articles"
  ON lms_abnt_articles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir gravacao de lms_abnt_articles" ON lms_abnt_articles;
CREATE POLICY "Permitir gravacao de lms_abnt_articles"
  ON lms_abnt_articles FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);
