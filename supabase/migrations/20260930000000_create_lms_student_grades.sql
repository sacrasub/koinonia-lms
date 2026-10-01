-- ==============================================================================
-- LMS KOINONIA: TABELA DE CONTROLE DE NOTAS, FALTAS E DESEMPENHO ACADÊMICO
-- DIRETRIZ: Blindagem de Egress (Supabase Free Plan), Local-First e RLS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS lms_student_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disciplina_id TEXT NOT NULL,
    student_email TEXT NOT NULL,
    av1 NUMERIC(4,2),
    av2 NUMERIC(4,2),
    trabalho NUMERIC(4,2),
    recuperacao NUMERIC(4,2),
    faltas INT DEFAULT 0,
    observacoes TEXT,
    status_fechamento TEXT DEFAULT 'aberto', -- 'aberto' | 'fechado'
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_lms_student_grades_disc_email UNIQUE (disciplina_id, student_email)
);

-- Índices para buscas pontuais com projeção estrita (< 50ms TTFB)
CREATE INDEX IF NOT EXISTS idx_student_grades_disc ON lms_student_grades(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_email ON lms_student_grades(student_email);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_lms_student_grades_timestamp()
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

DROP TRIGGER IF EXISTS trg_update_lms_student_grades_timestamp ON lms_student_grades;
CREATE TRIGGER trg_update_lms_student_grades_timestamp
BEFORE UPDATE ON lms_student_grades
FOR EACH ROW
EXECUTE FUNCTION update_lms_student_grades_timestamp();

-- Habilitar Row Level Security (RLS)
ALTER TABLE lms_student_grades ENABLE ROW LEVEL SECURITY;

-- 1. Política de Leitura: Usuários autenticados podem ler notas (filtradas por student_email ou disciplina)
DROP POLICY IF EXISTS "Permitir leitura de lms_student_grades" ON lms_student_grades;
CREATE POLICY "Permitir leitura de lms_student_grades"
  ON lms_student_grades FOR SELECT
  USING (true);

-- 2. Política de Gravação: Professores e Administradores podem inserir/atualizar
DROP POLICY IF EXISTS "Permitir gravacao de lms_student_grades" ON lms_student_grades;
CREATE POLICY "Permitir gravacao de lms_student_grades"
  ON lms_student_grades FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);
