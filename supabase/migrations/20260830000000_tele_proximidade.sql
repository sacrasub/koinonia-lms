-- =========================================================================
-- MÓDULO 5: TELE-PROXIMIDADE (LEARNING ANALYTICS ANTI-EVASÃO)
-- Fundamentação: Tele-Social Presença (TSP) — Chryssa Themelis, 2022
-- =========================================================================

-- Tabela de Alertas de Isolamento: persiste alertas gerados pelo sistema
-- e ações pedagógicas tomadas pelos professores/monitores
CREATE TABLE IF NOT EXISTS lms_isolation_alerts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_email       TEXT NOT NULL,
  aluno_nome        TEXT,
  nivel_risco       TEXT NOT NULL CHECK (nivel_risco IN ('critico', 'atencao', 'monitorar')),
  dias_sem_login    INTEGER DEFAULT 0,
  dias_sem_forum    INTEGER DEFAULT 0,
  dias_sem_oracao   INTEGER DEFAULT 0,
  score_engajamento INTEGER DEFAULT 0,  -- 0-100
  ultima_atividade  TIMESTAMPTZ,
  professor_email   TEXT,               -- Quem recebeu/atuou no alerta
  acao_tomada       TEXT,               -- Registro narrativo da ação pedagógica
  resolvido         BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_isolation_alerts_aluno    ON lms_isolation_alerts(aluno_email);
CREATE INDEX IF NOT EXISTS idx_isolation_alerts_nivel    ON lms_isolation_alerts(nivel_risco);
CREATE INDEX IF NOT EXISTS idx_isolation_alerts_resolvido ON lms_isolation_alerts(resolvido);
CREATE INDEX IF NOT EXISTS idx_isolation_alerts_created  ON lms_isolation_alerts(created_at DESC);

-- Row Level Security (aberto para leitura por autenticados)
ALTER TABLE lms_isolation_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Leitura autenticada de alertas"
  ON lms_isolation_alerts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Escrita autenticada de alertas"
  ON lms_isolation_alerts FOR ALL
  USING (auth.role() = 'authenticated');
