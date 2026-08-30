-- LMS-UIECB: Migration para Sincronização em Tempo Real entre Dispositivos (PC & Celular)

CREATE TABLE IF NOT EXISTS student_sync (
    email TEXT PRIMARY KEY,
    completed_lessons JSONB DEFAULT '{}'::jsonb,
    student_notes JSONB DEFAULT '{}'::jsonb,
    portal_profile JSONB DEFAULT '{}'::jsonb,
    checklist_tasks JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice no e-mail para consultas ultra-rápidas (TTFB < 50ms)
CREATE INDEX IF NOT EXISTS idx_student_sync_email ON student_sync(email);

-- Trigger para atualizar automaticamente o updated_at em cada UPSERT
CREATE OR REPLACE FUNCTION update_student_sync_timestamp()
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

DROP TRIGGER IF EXISTS trg_update_student_sync_timestamp ON student_sync;
CREATE TRIGGER trg_update_student_sync_timestamp
BEFORE UPDATE ON student_sync
FOR EACH ROW
EXECUTE FUNCTION update_student_sync_timestamp();

-- Habilitar RLS e criar políticas
ALTER TABLE student_sync ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de student_sync" ON student_sync;
CREATE POLICY "Permitir leitura de student_sync"
  ON student_sync FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir atualizacao de student_sync" ON student_sync;
CREATE POLICY "Permitir atualizacao de student_sync"
  ON student_sync FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
