-- =========================================================================
-- MÓDULO 7: ESTÚDIO DE PRÁTICA HOMILÉTICA E ACONSELHAMENTO
-- Fundamentação: Instrução por Pares (Mazur) + Avaliação Mediadora (Hoffmann)
-- =========================================================================

-- 1. Práticas Homiléticas / Sermões e Aconselhamentos Gravados
CREATE TABLE IF NOT EXISTS lms_homiletica_praticas (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_email         TEXT NOT NULL,
  aluno_nome          TEXT NOT NULL,
  aluno_avatar        TEXT,
  disciplina_id       TEXT NOT NULL,
  disciplina_name     TEXT,
  titulo              TEXT NOT NULL,
  tipo_pratica        TEXT NOT NULL CHECK (tipo_pratica IN ('homiletica', 'aconselhamento', 'devocional')),
  texto_biblico       TEXT,
  esboco_resumo       TEXT,
  midia_tipo          TEXT NOT NULL CHECK (midia_tipo IN ('audio', 'video', 'link_externo')),
  midia_url           TEXT,
  duracao_segundos    INTEGER DEFAULT 0,
  status              TEXT NOT NULL DEFAULT 'publicado' CHECK (status IN ('rascunho', 'publicado', 'arquivado')),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Avaliações por Pares (Peer Review entre Alunos)
CREATE TABLE IF NOT EXISTS lms_homiletica_peer_reviews (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pratica_id            UUID REFERENCES lms_homiletica_praticas(id) ON DELETE CASCADE,
  revisor_email         TEXT NOT NULL,
  revisor_nome          TEXT NOT NULL,
  nota_fidelidade       INTEGER CHECK (nota_fidelidade BETWEEN 1 AND 5),
  nota_comunicacao      INTEGER CHECK (nota_comunicacao BETWEEN 1 AND 5),
  nota_aplicacao        INTEGER CHECK (nota_aplicacao BETWEEN 1 AND 5),
  ponto_forte           TEXT,
  oportunidade_melhoria TEXT,
  comentario_geral      TEXT NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pratica_id, revisor_email)
);

-- 3. Avaliação Docente / Rubrica Mediadora (Professores e Monitores)
CREATE TABLE IF NOT EXISTS lms_homiletica_avaliacoes_docente (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pratica_id          UUID REFERENCES lms_homiletica_praticas(id) ON DELETE CASCADE,
  avaliador_email     TEXT NOT NULL,
  avaliador_nome      TEXT NOT NULL,
  avaliador_role      TEXT NOT NULL,
  nota_exegese        NUMERIC(4,2),
  nota_estrutura      NUMERIC(4,2),
  nota_postura        NUMERIC(4,2),
  nota_final          NUMERIC(4,2),
  feedback_mediador   TEXT NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pratica_id, avaliador_email)
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_homiletica_praticas_disciplina ON lms_homiletica_praticas(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_homiletica_praticas_aluno      ON lms_homiletica_praticas(aluno_email);
CREATE INDEX IF NOT EXISTS idx_homiletica_praticas_tipo       ON lms_homiletica_praticas(tipo_pratica);
CREATE INDEX IF NOT EXISTS idx_homiletica_peer_reviews_pratica ON lms_homiletica_peer_reviews(pratica_id);
CREATE INDEX IF NOT EXISTS idx_homiletica_peer_reviews_revisor ON lms_homiletica_peer_reviews(revisor_email);
CREATE INDEX IF NOT EXISTS idx_homiletica_docente_pratica     ON lms_homiletica_avaliacoes_docente(pratica_id);

-- Row Level Security
ALTER TABLE lms_homiletica_praticas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_homiletica_peer_reviews      ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_homiletica_avaliacoes_docente ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Leitura autenticada de praticas"
  ON lms_homiletica_praticas FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Escrita autenticada de praticas"
  ON lms_homiletica_praticas FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Leitura autenticada de peer reviews"
  ON lms_homiletica_peer_reviews FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Escrita autenticada de peer reviews"
  ON lms_homiletica_peer_reviews FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Leitura autenticada de avaliacoes docente"
  ON lms_homiletica_avaliacoes_docente FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Escrita autenticada de avaliacoes docente"
  ON lms_homiletica_avaliacoes_docente FOR ALL USING (auth.role() = 'authenticated');
