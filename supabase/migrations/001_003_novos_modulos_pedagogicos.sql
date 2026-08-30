-- ============================================================
-- MIGRATION 001: RPG Pastoral Simulador
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS rpg_sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao_contexto TEXT NOT NULL,
  disciplina_id TEXT NOT NULL,
  disciplina_name TEXT NOT NULL,
  sala_meet_id TEXT,
  etiqueta_digital TEXT DEFAULT 'Mantenha camera aberta. Respeite o papel do colega. Fale em primeira pessoa durante a simulacao.',
  status TEXT DEFAULT 'ativa' CHECK (status IN ('rascunho', 'ativa', 'encerrada')),
  created_by_email TEXT NOT NULL,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rpg_papeis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sessao_id UUID NOT NULL REFERENCES rpg_sessoes(id) ON DELETE CASCADE,
  nome_papel TEXT NOT NULL,
  stakeholder_tipo TEXT DEFAULT 'personagem' CHECK (stakeholder_tipo IN ('personagem', 'facilitador', 'observador')),
  descricao_publica TEXT,
  instrucoes_secretas TEXT NOT NULL,
  objetivos_conflito TEXT NOT NULL,
  dicas_de_postura TEXT,
  atribuido_a_email TEXT,
  atribuido_a_nome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rpg_fichas_aluno (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  papel_id UUID NOT NULL REFERENCES rpg_papeis(id) ON DELETE CASCADE,
  sessao_id UUID NOT NULL REFERENCES rpg_sessoes(id) ON DELETE CASCADE,
  aluno_email TEXT NOT NULL,
  aluno_nome TEXT,
  status_participacao TEXT DEFAULT 'pendente' CHECK (status_participacao IN ('pendente', 'em_andamento', 'concluido')),
  reflexao_pos_simulacao TEXT,
  auto_avaliacao_empatia INTEGER CHECK (auto_avaliacao_empatia BETWEEN 1 AND 5),
  auto_avaliacao_argumentacao INTEGER CHECK (auto_avaliacao_argumentacao BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (sessao_id, aluno_email)
);

CREATE INDEX IF NOT EXISTS idx_rpg_sessoes_disciplina ON rpg_sessoes(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_rpg_papeis_sessao ON rpg_papeis(sessao_id);
CREATE INDEX IF NOT EXISTS idx_rpg_papeis_email ON rpg_papeis(atribuido_a_email);
CREATE INDEX IF NOT EXISTS idx_rpg_fichas_email ON rpg_fichas_aluno(aluno_email);
CREATE INDEX IF NOT EXISTS idx_rpg_fichas_sessao ON rpg_fichas_aluno(sessao_id);

-- ============================================================
-- MIGRATION 002: Portfolio Mediador e Rubricas Qualitativas
-- ============================================================

CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_email TEXT NOT NULL,
  aluno_nome TEXT,
  disciplina_id TEXT NOT NULL,
  disciplina_name TEXT NOT NULL,
  titulo_artefato TEXT NOT NULL,
  descricao_artefato TEXT,
  tipo_artefato TEXT DEFAULT 'ensaio' CHECK (tipo_artefato IN ('ensaio', 'esboco_sermao', 'audio', 'video', 'mapa_mental', 'projeto', 'reflexao', 'outro')),
  url_artefato_drive TEXT,
  drive_file_id TEXT,
  autoavaliacao_texto TEXT,
  status TEXT DEFAULT 'enviado' CHECK (status IN ('rascunho', 'enviado', 'avaliado', 'revisao')),
  semana_referencia INTEGER CHECK (semana_referencia BETWEEN 1 AND 16),
  avaliacao_tipo TEXT DEFAULT 'AV1' CHECK (avaliacao_tipo IN ('AV1', 'AV2', 'formativa', 'recuperacao')),
  nota_final NUMERIC(4,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rubricas_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  criterio_nome TEXT NOT NULL,
  criterio_descricao TEXT,
  nivel_desempenho TEXT CHECK (nivel_desempenho IN ('insatisfatorio', 'em_desenvolvimento', 'proficiente', 'excelente')),
  nota_atribuida NUMERIC(4,2) NOT NULL CHECK (nota_atribuida BETWEEN 0 AND 10),
  peso_criterio NUMERIC(3,2) DEFAULT 1.0,
  feedback_qualitativo_tutor TEXT NOT NULL,
  monitor_email TEXT NOT NULL,
  monitor_nome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolios_aluno ON portfolios(aluno_email);
CREATE INDEX IF NOT EXISTS idx_portfolios_disciplina ON portfolios(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_status ON portfolios(status);
CREATE INDEX IF NOT EXISTS idx_rubricas_portfolio ON rubricas_feedback(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_rubricas_monitor ON rubricas_feedback(monitor_email);

-- ============================================================
-- MIGRATION 003: Modo de Avaliacao Metacognitivo
-- ============================================================

DO $$ BEGIN
  CREATE TYPE assessment_mode_enum AS ENUM (
    'STRICT',
    'RESTRICTIVE_COMPENSATION',
    'SOFT_COMPENSATION'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS alunos_matriculas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_email TEXT NOT NULL,
  aluno_nome TEXT,
  semester TEXT NOT NULL DEFAULT '2026.2',
  turma_id TEXT,
  assessment_mode assessment_mode_enum NOT NULL DEFAULT 'SOFT_COMPENSATION',
  assessment_mode_justificativa TEXT,
  assessment_mode_updated_at TIMESTAMPTZ DEFAULT NOW(),
  data_matricula TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'trancado', 'concluido', 'desistencia')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(aluno_email, semester)
);

CREATE TABLE IF NOT EXISTS historico_assessment_mode (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_email TEXT NOT NULL,
  aluno_nome TEXT,
  modo_anterior assessment_mode_enum,
  modo_novo assessment_mode_enum NOT NULL,
  justificativa TEXT,
  semester TEXT DEFAULT '2026.2',
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matriculas_email ON alunos_matriculas(aluno_email);
CREATE INDEX IF NOT EXISTS idx_historico_email ON historico_assessment_mode(aluno_email);

INSERT INTO alunos_matriculas (aluno_email, aluno_nome, semester, assessment_mode)
VALUES ('sacrasub@gmail.com', 'Administrador', '2026.2', 'SOFT_COMPENSATION')
ON CONFLICT (aluno_email, semester) DO NOTHING;
