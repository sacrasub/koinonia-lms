-- =========================================================================
-- LMS-UIECB: MIGRATION PARA A SUÍTE DE INTERAÇÃO E COLABORAÇÃO DISCENTE
-- Módulos: Fóruns Acadêmicos (P&R/Temáticos), Mensageria Direta e Mural de Oração Koinonia
-- =========================================================================

-- 1. Tabela de Tópicos do Fórum
CREATE TABLE IF NOT EXISTS tcc_foruns_topicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disciplina_id TEXT NOT NULL,
    autor_email TEXT NOT NULL,
    autor_nome TEXT NOT NULL,
    autor_role TEXT NOT NULL DEFAULT 'aluno',
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'TEMATICO' CHECK (tipo IN ('TEMATICO', 'P_E_R', 'LIVRE_KOINONIA')),
    fixado BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela de Respostas e Debates do Fórum
CREATE TABLE IF NOT EXISTS tcc_foruns_respostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topico_id UUID NOT NULL REFERENCES tcc_foruns_topicos(id) ON DELETE CASCADE,
    autor_email TEXT NOT NULL,
    autor_nome TEXT NOT NULL,
    autor_role TEXT NOT NULL DEFAULT 'aluno',
    conteudo TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela de Mensagens Privadas (Direct Messages / Chat Síncrono)
CREATE TABLE IF NOT EXISTS tcc_mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    remetente_email TEXT NOT NULL,
    remetente_nome TEXT NOT NULL,
    destinatario_email TEXT NOT NULL,
    destinatario_nome TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    lida BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabela de Mural de Oração e Partilha Espiritual (Mural de Koinonia)
CREATE TABLE IF NOT EXISTS tcc_mural_oracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    autor_email TEXT NOT NULL,
    autor_nome TEXT NOT NULL,
    autor_cargo TEXT NOT NULL DEFAULT 'Seminarista',
    categoria TEXT NOT NULL DEFAULT 'ORACAO' CHECK (categoria IN ('ORACAO', 'GRATIDAO', 'MISSAO')),
    pedido_oracao TEXT NOT NULL,
    intercessores JSONB NOT NULL DEFAULT '[]'::jsonb,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de Alta Performance para Tempo Real e Consultas
CREATE INDEX IF NOT EXISTS idx_tcc_foruns_topicos_disc ON tcc_foruns_topicos(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_tcc_foruns_respostas_topico ON tcc_foruns_respostas(topico_id);
CREATE INDEX IF NOT EXISTS idx_tcc_mensagens_rem_dest ON tcc_mensagens(remetente_email, destinatario_email);
CREATE INDEX IF NOT EXISTS idx_tcc_mensagens_dest_lida ON tcc_mensagens(destinatario_email, lida);
CREATE INDEX IF NOT EXISTS idx_tcc_mural_oracoes_data ON tcc_mural_oracoes(criado_em DESC);

-- 5. Seed Inicial de Demonstração Comunitária e Acadêmica
INSERT INTO tcc_foruns_topicos (id, disciplina_id, autor_email, autor_nome, autor_role, titulo, conteudo, tipo, fixado)
VALUES 
    (
        'f1111111-1111-4111-8111-111111111111', 
        'global-koinonia', 
        'sacrasub@gmail.com', 
        'Cristiano (Admin)', 
        'admin', 
        '☕ Espaço Koinonia: Apresentações e Boas-Vindas ao Semestre 2026.2', 
        'Irmãos seminaristas e professores, usem este espaço livre para compartilhar de onde vocês são, suas congregações locais e expectativas para este semestre acadêmico!', 
        'LIVRE_KOINONIA', 
        true
    ),
    (
        'f2222222-2222-4222-8222-222222222222', 
        'teologia-sistematica-1', 
        'hilario@seminario.com', 
        'Prof. Hilário', 
        'professor', 
        '⚖️ [Fórum P&R] O Dilema da Graça Irresistível e a Responsabilidade Humana', 
        'Poste sua reflexão autoral de até 300 palavras sobre como conciliar a soberania divina e o livre arbítrio na soteriologia bíblica. Atenção: você só visualizará as respostas dos colegas após enviar a sua contribuição.', 
        'P_E_R', 
        false
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO tcc_mural_oracoes (id, autor_email, autor_nome, autor_cargo, categoria, pedido_oracao, intercessores)
VALUES
    (
        'e1111111-1111-4111-8111-111111111111',
        'sacrasub@gmail.com',
        'Cristiano da Silva',
        'Coordenador Acadêmico',
        'ORACAO',
        'Peço oração pela capacitação dos nossos professores e pela saúde dos seminaristas neste início de módulo intensivo.',
        '["aluno1@uiecbead.com.br", "hilario@seminario.com"]'::jsonb
    ),
    (
        'e2222222-2222-4222-8222-222222222222',
        'rosiane@seminario.com',
        'Rosiane (Monitora)',
        'Monitora de Turma',
        'GRATIDAO',
        'Louvado seja Deus pela acolhida da turma e pelo engajamento nas primeiras aulas síncronas do Meet!',
        '["sacrasub@gmail.com"]'::jsonb
    )
ON CONFLICT (id) DO NOTHING;
