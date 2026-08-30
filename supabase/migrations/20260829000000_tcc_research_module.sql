-- =========================================================================
-- LMS-UIECB: MIGRATION PARA COLETA DE DADOS E PESQUISA EMPÍRICA DO TCC
-- Pilares: Distância Transacional, Metodologias Ativas (RPG), Autodeterminação e Avaliação Mediadora
-- =========================================================================

-- 1. Tabela de Pesquisas Científicas (Surveys)
CREATE TABLE IF NOT EXISTS tcc_pesquisas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    alvo TEXT NOT NULL DEFAULT 'AMBOS' CHECK (alvo IN ('ALUNO', 'PROFESSOR', 'AMBOS')),
    ativa BOOLEAN NOT NULL DEFAULT true,
    pilar_principal TEXT DEFAULT 'GERAL',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela de Perguntas
CREATE TABLE IF NOT EXISTS tcc_perguntas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pesquisa_id UUID NOT NULL REFERENCES tcc_pesquisas(id) ON DELETE CASCADE,
    ordem INT NOT NULL DEFAULT 1,
    texto_pergunta TEXT NOT NULL,
    pilar_tcc TEXT NOT NULL DEFAULT 'GERAL' CHECK (pilar_tcc IN ('DISTANCIA_TRANSACIONAL', 'METODOLOGIAS_ATIVAS_RPG', 'AUTODETERMINACAO', 'AVALIACAO_MEDIADORA', 'GERAL')),
    tipo TEXT NOT NULL DEFAULT 'LIKERT_5' CHECK (tipo IN ('LIKERT_5', 'MULTIPLA_ESCOLHA', 'DISCURSIVA')),
    opcoes JSONB DEFAULT '[]'::jsonb,
    obrigatoria BOOLEAN DEFAULT true,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela de Respostas Coletadas dos Alunos e Docentes
CREATE TABLE IF NOT EXISTS tcc_respostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pesquisa_id UUID NOT NULL REFERENCES tcc_pesquisas(id) ON DELETE CASCADE,
    pergunta_id UUID NOT NULL REFERENCES tcc_perguntas(id) ON DELETE CASCADE,
    usuario_email TEXT NOT NULL,
    usuario_role TEXT NOT NULL DEFAULT 'aluno',
    resposta_escala INT CHECK (resposta_escala BETWEEN 1 AND 5),
    resposta_texto TEXT,
    respondido_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de alta performance para análises estatísticas
CREATE INDEX IF NOT EXISTS idx_tcc_respostas_pesquisa ON tcc_respostas(pesquisa_id);
CREATE INDEX IF NOT EXISTS idx_tcc_respostas_pergunta ON tcc_respostas(pergunta_id);
CREATE INDEX IF NOT EXISTS idx_tcc_respostas_usuario ON tcc_respostas(usuario_email);
CREATE INDEX IF NOT EXISTS idx_tcc_perguntas_pesquisa ON tcc_perguntas(pesquisa_id);

-- 4. Inserção de Pesquisa Baseline Inicial com 8 Perguntas Validadas para o TCC
INSERT INTO tcc_pesquisas (id, titulo, descricao, alvo, ativa, pilar_principal)
VALUES (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'Pesquisa de Impacto Pedagógico: Distância Transacional e Metodologias Ativas (LMS-UIECB 2026.2)',
    'Questionário empírico para avaliação do impacto das metodologias ativas, autonomia no ambiente virtual e avaliação mediadora no Seminário Teológico.',
    'AMBOS',
    true,
    'DISTANCIA_TRANSACIONAL'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO tcc_perguntas (id, pesquisa_id, ordem, texto_pergunta, pilar_tcc, tipo, obrigatoria)
VALUES
    ('b1111111-1111-4111-8111-111111111111', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 1, 'O acesso estruturado aos materiais no Google Drive e ao Hub da Matéria reduziu sua sensação de isolamento ou confusão no curso?', 'DISTANCIA_TRANSACIONAL', 'LIKERT_5', true),
    ('b2222222-2222-4222-8222-222222222222', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 2, 'O uso do Caderno Cornell integrado ajudou na sua autonomia de síntese e estudo autodirigido?', 'AUTODETERMINACAO', 'LIKERT_5', true),
    ('b3333333-3333-4333-8333-333333333333', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 3, 'A dinâmica do Simulador Pastoral RPG aumentou seu engajamento prático e senso de comunhão (koinonia) durante as aulas?', 'METODOLOGIAS_ATIVAS_RPG', 'LIKERT_5', true),
    ('b4444444-4444-4444-8444-444444444444', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 4, 'A resolução de dilemas ético-pastorais em equipe facilitou a assimilação da teologia aplicada?', 'METODOLOGIAS_ATIVAS_RPG', 'LIKERT_5', true),
    ('b5555555-5555-4555-8555-555555555555', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 5, 'O acompanhamento formativo por rubricas mediadoras proporcionou um feedback mais claro do que notas numéricas tradicionais?', 'AVALIACAO_MEDIADORA', 'LIKERT_5', true),
    ('b6666666-6666-4666-8666-666666666666', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 6, 'Como você avalia sua motivação intrínseca ao utilizar os recursos interativos da plataforma?', 'AUTODETERMINACAO', 'LIKERT_5', true),
    ('b7777777-7777-4777-8777-777777777777', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 7, 'Quais ferramentas do LMS (Cornell, RPG, Biblioteca, Meet) mais contribuíram para aproximar você dos colegas e professores?', 'GERAL', 'DISCURSIVA', false),
    ('b8888888-8888-4888-8888-888888888888', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 8, 'Deixe suas sugestões ou observações críticas sobre como a tecnologia pode diminuir ainda mais a distância transacional no Seminário:', 'GERAL', 'DISCURSIVA', false)
ON CONFLICT (id) DO NOTHING;
