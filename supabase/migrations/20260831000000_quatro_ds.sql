-- =========================================================================
-- MÓDULO 6: TRILHA DE ENSINAGEM SOCRÁTICA — OS QUATRO Ds DE JESUS
-- Fundamentação: Andragogia (Knowles, 1980) + Inov-Ativa (Moran, 2018)
-- =========================================================================

-- Trilhas criadas por professores, vinculadas a uma disciplina
CREATE TABLE IF NOT EXISTS lms_quatro_ds_trilhas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disciplina_id   TEXT NOT NULL,       -- ID da disciplina do LMS
  disciplina_name TEXT,                -- Nome desnormalizado para exibição
  titulo          TEXT NOT NULL,       -- Título da trilha (ex: "A Pesca Milagrosa")
  descricao       TEXT,                -- Contexto geral da trilha
  professor_email TEXT NOT NULL,
  aula_referencia TEXT,                -- Ex: "Aula 3 — Hermenêutica Narrativa"
  publicado       BOOLEAN DEFAULT TRUE,
  -- D1: Desejo (Indagação)
  d1_titulo       TEXT NOT NULL DEFAULT 'Pergunta de Indagação',
  d1_conteudo     TEXT NOT NULL DEFAULT 'O que você faria se...?',
  -- D2: Desestruturação (Paradoxo)
  d2_titulo       TEXT NOT NULL DEFAULT 'O Paradoxo',
  d2_conteudo     TEXT NOT NULL DEFAULT 'Mas e se a sua resposta anterior fosse parte do problema?',
  -- D3: Desafio (Praxis)
  d3_titulo       TEXT NOT NULL DEFAULT 'Seu Desafio Prático',
  d3_conteudo     TEXT NOT NULL DEFAULT 'Em 3 parágrafos, descreva sua estratégia para...',
  -- D4: Decisão (Comprometimento vocacional)
  d4_titulo       TEXT NOT NULL DEFAULT 'Sua Decisão',
  d4_conteudo     TEXT NOT NULL DEFAULT 'Qual verdade você leva desta trilha para sua vida ministerial?',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Respostas dos alunos — uma por estágio por trilha (upsert seguro)
CREATE TABLE IF NOT EXISTS lms_quatro_ds_respostas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trilha_id   UUID REFERENCES lms_quatro_ds_trilhas(id) ON DELETE CASCADE,
  aluno_email TEXT NOT NULL,
  aluno_nome  TEXT,
  estagio     TEXT NOT NULL CHECK (estagio IN ('d1_desejo','d2_desestruturacao','d3_desafio','d4_decisao')),
  conteudo    TEXT NOT NULL,
  completado  BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trilha_id, aluno_email, estagio)
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_qds_trilhas_disciplina ON lms_quatro_ds_trilhas(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_qds_trilhas_professor  ON lms_quatro_ds_trilhas(professor_email);
CREATE INDEX IF NOT EXISTS idx_qds_respostas_trilha   ON lms_quatro_ds_respostas(trilha_id);
CREATE INDEX IF NOT EXISTS idx_qds_respostas_aluno    ON lms_quatro_ds_respostas(aluno_email);

-- Row Level Security (Políticas Abertas para LMS)
ALTER TABLE lms_quatro_ds_trilhas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_quatro_ds_respostas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura autenticada de trilhas" ON lms_quatro_ds_trilhas;
DROP POLICY IF EXISTS "Escrita autenticada de trilhas" ON lms_quatro_ds_trilhas;
DROP POLICY IF EXISTS "Permissao total trilhas" ON lms_quatro_ds_trilhas;
DROP POLICY IF EXISTS "Leitura de trilhas para todos" ON lms_quatro_ds_trilhas;
DROP POLICY IF EXISTS "Escrita de trilhas por professores autenticados" ON lms_quatro_ds_trilhas;

CREATE POLICY "Leitura de trilhas para todos"
  ON lms_quatro_ds_trilhas FOR SELECT
  USING (true);

CREATE POLICY "Escrita de trilhas por professores autenticados"
  ON lms_quatro_ds_trilhas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Leitura autenticada de respostas" ON lms_quatro_ds_respostas;
DROP POLICY IF EXISTS "Escrita autenticada de respostas" ON lms_quatro_ds_respostas;
DROP POLICY IF EXISTS "Permissao total respostas" ON lms_quatro_ds_respostas;
DROP POLICY IF EXISTS "Leitura de respostas 4ds para todos" ON lms_quatro_ds_respostas;
DROP POLICY IF EXISTS "Escrita de respostas 4ds para autenticados" ON lms_quatro_ds_respostas;

CREATE POLICY "Leitura de respostas 4ds para todos"
  ON lms_quatro_ds_respostas FOR SELECT
  USING (true);

CREATE POLICY "Escrita de respostas 4ds para autenticados"
  ON lms_quatro_ds_respostas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

