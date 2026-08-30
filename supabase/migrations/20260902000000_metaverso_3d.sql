-- =========================================================================
-- MÓDULO 8: AMBIENTES DE IMERSÃO 3D (O METAVERSO TEOLÓGICO)
-- Fundamentação: Tele-Presença Espacial + Arqueologia e Geografia Bíblica
-- =========================================================================

-- 1. Cenários 3D / Mundos Virtuais Cadastrados
CREATE TABLE IF NOT EXISTS lms_metaverso_cenarios (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo              TEXT NOT NULL,
  periodo_historico   TEXT NOT NULL,
  disciplina_id       TEXT NOT NULL,
  disciplina_name     TEXT,
  descricao           TEXT NOT NULL,
  imagem_capa         TEXT NOT NULL,
  modelo_tipo         TEXT NOT NULL CHECK (modelo_tipo IN ('webgl_nativo', 'sketchfab_embed', 'tour_360', 'link_metaverso')),
  modelo_url          TEXT NOT NULL,
  hotspots            JSONB DEFAULT '[]'::jsonb,
  missoes             JSONB DEFAULT '[]'::jsonb,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Progresso de Exploração dos Alunos (Missões e Tempo de Imersão)
CREATE TABLE IF NOT EXISTS lms_metaverso_exploracoes (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cenario_id             UUID REFERENCES lms_metaverso_cenarios(id) ON DELETE CASCADE,
  aluno_email            TEXT NOT NULL,
  aluno_nome             TEXT NOT NULL,
  hotspots_visitados     TEXT[] DEFAULT '{}',
  missoes_completadas    TEXT[] DEFAULT '{}',
  tempo_imersao_segundos INTEGER DEFAULT 0,
  reflexao_aluno         TEXT,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cenario_id, aluno_email)
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_metaverso_cenarios_disciplina ON lms_metaverso_cenarios(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_metaverso_cenarios_periodo    ON lms_metaverso_cenarios(periodo_historico);
CREATE INDEX IF NOT EXISTS idx_metaverso_exploracoes_cenario ON lms_metaverso_exploracoes(cenario_id);
CREATE INDEX IF NOT EXISTS idx_metaverso_exploracoes_aluno   ON lms_metaverso_exploracoes(aluno_email);

-- Row Level Security
ALTER TABLE lms_metaverso_cenarios    ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_metaverso_exploracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Leitura autenticada de cenarios metaverso"
  ON lms_metaverso_cenarios FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Escrita autenticada de cenarios metaverso"
  ON lms_metaverso_cenarios FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Leitura autenticada de exploracoes metaverso"
  ON lms_metaverso_exploracoes FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Escrita autenticada de exploracoes metaverso"
  ON lms_metaverso_exploracoes FOR ALL USING (auth.role() = 'authenticated');
