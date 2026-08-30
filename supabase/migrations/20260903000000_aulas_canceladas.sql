-- ==============================================================================
-- MIGRATION: Módulo de Aviso de Cancelamento / Suspensão de Aulas
-- ==============================================================================

CREATE TABLE IF NOT EXISTS lms_aulas_canceladas (
  id TEXT PRIMARY KEY,
  disciplina_id TEXT NOT NULL,
  disciplina_name TEXT NOT NULL,
  aula_num INTEGER,
  data_aula TEXT NOT NULL, -- DD/MM/YYYY
  motivo TEXT NOT NULL,
  autor_nome TEXT NOT NULL,
  autor_email TEXT NOT NULL,
  autor_role TEXT NOT NULL DEFAULT 'monitor',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lms_aulas_canceladas_disc_date 
  ON lms_aulas_canceladas (disciplina_id, data_aula);

ALTER TABLE lms_aulas_canceladas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura publica de aulas canceladas"
  ON lms_aulas_canceladas
  FOR SELECT
  USING (true);

CREATE POLICY "Permitir escrita de aulas canceladas por usuarios autenticados"
  ON lms_aulas_canceladas
  FOR ALL
  USING (true)
  WITH CHECK (true);
