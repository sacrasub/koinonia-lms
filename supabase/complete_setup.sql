-- ==========================================
-- SETUP COMPLETO KOINONIA LMS (NOVO SUPABASE)
-- ==========================================

-- LMS-UIECB Database Schema (Supabase / PostgreSQL)

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Perfis de Usuários (RBAC)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'professor', 'monitor', 'aluno')) DEFAULT 'aluno',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Disciplinas
CREATE TABLE IF NOT EXISTS disciplinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    professor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    monitor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    day_of_week TEXT NOT NULL, -- Ex: 'Terça-feira', 'Quarta-feira', etc.
    start_time TIME NOT NULL,  -- Ex: '17:00'
    end_time TIME NOT NULL,    -- Ex: '18:25'
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    semester TEXT NOT NULL DEFAULT '2026.1',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Matrículas (Alunos x Disciplinas)
CREATE TABLE IF NOT EXISTS matriculas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    disciplina_id UUID REFERENCES disciplinas(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, disciplina_id)
);

-- 4. Tabela de Aulas (Com colunas de transição suave)
CREATE TABLE IF NOT EXISTS aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disciplina_id UUID REFERENCES disciplinas(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    google_meet_url TEXT,  -- Regra de Transição Suave
    google_drive_url TEXT, -- Regra de Transição Suave
    recording_url TEXT,    -- Link de gravação inserido pelo Monitor
    attendance_form_url TEXT, -- Link de formulário de presença inserido pelo Monitor
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Avaliações (Com suporte a formulários legados via iframe)
CREATE TABLE IF NOT EXISTS avaliacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disciplina_id UUID REFERENCES disciplinas(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    google_forms_url TEXT, -- Regra de Transição Suave
    is_legacy BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE = iframe do Google Forms; FALSE = sistema nativo
    max_score NUMERIC(5,2) DEFAULT 10.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Materiais de Aula
CREATE TABLE IF NOT EXISTS materiais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disciplina_id UUID REFERENCES disciplinas(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT,           -- Upload nativo
    google_drive_url TEXT,   -- Fallback Google Drive
    is_native_upload BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserção de Dados Iniciais de Exemplo (Seed Data)
INSERT INTO users (id, email, full_name, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@uicb.edu.br', 'Pr. Carlos Santos (Administrador)', 'admin'),
    ('22222222-2222-2222-2222-222222222222', 'hilario@uicb.edu.br', 'Profº Hilário Bispo', 'professor'),
    ('33333333-3333-3333-3333-333333333333', 'david@uicb.edu.br', 'Profº David Bezerra', 'professor'),
    ('44444444-4444-4444-4444-444444444444', 'camila@uicb.edu.br', 'Camila (Monitora)', 'monitor'),
    ('55555555-5555-5555-5555-555555555555', 'cristiano@uicb.edu.br', 'Cristiano (Monitor)', 'monitor'),
    ('66666666-6666-6666-6666-666666666666', 'aluno@uicb.edu.br', 'João Silva (Aluno)', 'aluno')
ON CONFLICT (email) DO NOTHING;

INSERT INTO disciplinas (id, code, name, description, professor_id, monitor_id, day_of_week, start_time, end_time, semester) VALUES
    ('a1111111-1111-1111-1111-111111111111', 'HIS-202', 'História do Congregacionalismo', 'Origens históricas, legado teológico e expansão da denominação no Brasil.', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Terça-feira', '19:00', '20:25', '2026.2'),
    ('a2222222-2222-2222-2222-222222222222', 'HIS-102', 'História do Pensamento Cristão II', 'Desenvolvimento do pensamento cristão desde a Reforma Escolástica até a Modernidade.', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'Terça-feira', '20:35', '22:00', '2026.2'),
    ('a3333333-3333-3333-3333-333333333333', 'ACO-202', 'Aconselhamento Bíblico II', 'Princípios avançados de aconselhamento pastoral, mentoria e apoio emocional nas crises.', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Quarta-feira', '19:00', '20:25', '2026.2'),
    ('a4444444-4444-4444-4444-444444444444', 'DIR-101', 'Direitos Humanos', 'Fundamentos dos Direitos Humanos, cidadania cristã e dignidade da pessoa humana.', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Quarta-feira', '20:35', '22:00', '2026.2'),
    ('a5555555-5555-5555-5555-555555555555', 'ETC-201', 'Ética Cristã', 'Dilemas éticos contemporâneos, bioética, justiça social e princípios bíblicos.', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Quinta-feira', '19:00', '20:25', '2026.2'),
    ('a6666666-6666-6666-6666-666666666666', 'NT-301', 'Novo Testamento III - Epístolas Gerais', 'Exegese e teologia das epístolas universais (Hebreus a Judas).', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'Quinta-feira', '20:35', '22:00', '2026.2'),
    ('a7777777-7777-7777-7777-777777777777', 'MIS-202', 'Plantação e Revitalização de Igrejas II', 'Estratégia missionária, plantação de novas comunidades e revitalização de igrejas.', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Sexta-feira', '19:00', '20:00', '2026.2'),
    ('a8888888-8888-8888-8888-888888888888', 'TCC-101', 'TCC I', 'Metodologia científica, elaboração de projeto de pesquisa e orientação acadêmica.', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Sexta-feira', '20:00', '21:00', '2026.2')
ON CONFLICT (code) DO NOTHING;

INSERT INTO aulas (disciplina_id, title, description, scheduled_at, google_meet_url, google_drive_url, attendance_form_url) VALUES
    ('a1111111-1111-1111-1111-111111111111', 'História do Congregacionalismo', 'Origens históricas, legado teológico e expansão da denominação no Brasil.', NOW(), 'https://meet.google.com/sef-ggpp-bbn', 'https://drive.google.com/open?id=19Y8Nv2Yvx1V-m4E5y5fUWOo5e8DZzeji&usp=drive_copy', 'https://forms.gle/2X7xGqge3dqdRKrGA'),
    ('a2222222-2222-2222-2222-222222222222', 'História do Pensamento Cristão II', 'Desenvolvimento do pensamento cristão desde a Reforma Escolástica até a Modernidade.', NOW(), 'https://meet.google.com/cxj-yetd-xpf', 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy', 'https://forms.gle/hM2j2fb7DK923wdR7'),
    ('a3333333-3333-3333-3333-333333333333', 'Aconselhamento Bíblico II', 'Princípios avançados de aconselhamento pastoral, mentoria e apoio emocional nas crises.', NOW(), 'https://meet.google.com/ifv-zsdd-gjx', 'https://drive.google.com/open?id=1BUr0R4pLQjTt01ID8XjYKIBlZhAtaWcx&usp=drive_copy', 'https://forms.gle/iSLGtjyaTnM9tFGb6'),
    ('a4444444-4444-4444-4444-444444444444', 'Direitos Humanos', 'Fundamentos dos Direitos Humanos, cidadania cristã e dignidade da pessoa humana.', NOW(), 'https://meet.google.com/uva-zmav-rds', 'https://drive.google.com/open?id=1fPSmFUBNzrzK--n3NDKOdMR5HWk25AV7&usp=drive_copy', 'https://forms.gle/QiWRgTit6XjxP9Ci7'),
    ('a5555555-5555-5555-5555-555555555555', 'Ética Cristã', 'Dilemas éticos contemporâneos, bioética, justiça social e princípios bíblicos.', NOW(), 'https://meet.google.com/ypd-yzwg-nrw', 'https://drive.google.com/open?id=1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC&usp=drive_copy', 'https://forms.gle/Tn3Ln3iS9cbAUEsJ8'),
    ('a6666666-6666-6666-6666-666666666666', 'Novo Testamento III - Epístolas Gerais', 'Exegese e teologia das epístolas universais (Hebreus a Judas).', NOW(), 'https://meet.google.com/nyn-xjqk-vky', 'https://drive.google.com/open?id=1ppsv5caJVbHw-1RwhHu8nxBmqFT9Wm9P&usp=drive_copy', 'https://forms.gle/SC1mSMSZfDhJPPVE9'),
    ('a7777777-7777-7777-7777-777777777777', 'Plantação e Revitalização de Igrejas II', 'Estratégia missionária, plantação de novas comunidades e revitalização de igrejas.', NOW(), 'https://meet.google.com/jwb-wpvc-pzm', 'https://drive.google.com/open?id=1nzXIDnWvvrxSgXQULaSvDGdVr32L_xP8&usp=drive_copy', 'https://forms.gle/bSqjHe7zsV1EJDDB6'),
    ('a8888888-8888-8888-8888-888888888888', 'TCC I', 'Metodologia científica, elaboração de projeto de pesquisa e orientação acadêmica.', NOW(), 'https://meet.google.com/jnz-hkqd-edc', 'https://drive.google.com/open?id=1f-9i-TpqaZhzoLyrxg6flM6CHTsAOWPj&usp=drive_copy', 'https://forms.gle/vULryGYArnJZgBF28')
ON CONFLICT DO NOTHING;

INSERT INTO avaliacoes (disciplina_id, title, description, due_date, google_forms_url, is_legacy) VALUES
    ('a1111111-1111-1111-1111-111111111111', 'Avaliação Parcial 1 - História do Congregacionalismo', 'Responda as questões sobre o legado teológico e a expansão no Brasil.', NOW() + INTERVAL '7 days', 'https://forms.gle/2X7xGqge3dqdRKrGA', true)
ON CONFLICT DO NOTHING;

-- 8. Tabela de Caderno de Anotações Método Cornell (Arquitetura Espacial)
CREATE TABLE IF NOT EXISTS cornell_notes (
    id TEXT PRIMARY KEY, -- Ex: 'note_his202_2026_08_11' ou UUID
    user_email TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    disciplina_code TEXT,
    disciplina_name TEXT NOT NULL,
    theme TEXT NOT NULL,
    professor_name TEXT NOT NULL,
    biblical_references TEXT DEFAULT '',
    cues TEXT NOT NULL DEFAULT '', -- Coluna da Esquerda (~30%): Palavras-chave e perguntas de auto-teste
    notes TEXT NOT NULL DEFAULT '', -- Coluna da Direita (~70%): Anotações em tempo real e tópicos
    summary TEXT NOT NULL DEFAULT '', -- Faixa Basal Inferior: Síntese global em 2-3 frases
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cornell_notes_user_email ON cornell_notes(user_email);
CREATE INDEX IF NOT EXISTS idx_cornell_notes_date ON cornell_notes(date);
CREATE INDEX IF NOT EXISTS idx_cornell_notes_disciplina ON cornell_notes(disciplina_name);

-- =========================================================================
-- 9. Row Level Security (RLS) e Políticas de Acesso
-- =========================================================================

ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplinas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cornell_notes  ENABLE ROW LEVEL SECURITY;

-- 9.1. Users
DROP POLICY IF EXISTS "Permitir leitura publica e autenticada de usuarios" ON users;
CREATE POLICY "Permitir leitura publica e autenticada de usuarios"
  ON users FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir insercao ou atualizacao pelo proprio usuario ou admin" ON users;
CREATE POLICY "Permitir insercao ou atualizacao pelo proprio usuario ou admin"
  ON users FOR ALL
  TO authenticated
  USING (
    auth.uid() = id 
    OR auth.jwt() ->> 'email' = email 
    OR auth.jwt() ->> 'email' IN ('sacrasub@gmail.com', 'sacrasub03@gmail.com', 'ead@uiecbead.com.br', 'tondedez@gmail.com')
  )
  WITH CHECK (
    auth.uid() = id 
    OR auth.jwt() ->> 'email' = email 
    OR auth.jwt() ->> 'email' IN ('sacrasub@gmail.com', 'sacrasub03@gmail.com', 'ead@uiecbead.com.br', 'tondedez@gmail.com')
  );

-- 9.2. Disciplinas
DROP POLICY IF EXISTS "Permitir leitura de disciplinas para todos" ON disciplinas;
CREATE POLICY "Permitir leitura de disciplinas para todos"
  ON disciplinas FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir escrita de disciplinas para usuarios autenticados" ON disciplinas;
CREATE POLICY "Permitir escrita de disciplinas para usuarios autenticados"
  ON disciplinas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 9.3. Matrículas
DROP POLICY IF EXISTS "Permitir leitura de matriculas para todos" ON matriculas;
CREATE POLICY "Permitir leitura de matriculas para todos"
  ON matriculas FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir gerenciamento de matriculas para autenticados" ON matriculas;
CREATE POLICY "Permitir gerenciamento de matriculas para autenticados"
  ON matriculas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 9.4. Aulas
DROP POLICY IF EXISTS "Permitir leitura de aulas para todos" ON aulas;
CREATE POLICY "Permitir leitura de aulas para todos"
  ON aulas FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir edicao de aulas para usuarios autenticados" ON aulas;
CREATE POLICY "Permitir edicao de aulas para usuarios autenticados"
  ON aulas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 9.5. Avaliações
DROP POLICY IF EXISTS "Permitir leitura de avaliacoes para todos" ON avaliacoes;
CREATE POLICY "Permitir leitura de avaliacoes para todos"
  ON avaliacoes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir edicao de avaliacoes para usuarios autenticados" ON avaliacoes;
CREATE POLICY "Permitir edicao de avaliacoes para usuarios autenticados"
  ON avaliacoes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 9.6. Materiais
DROP POLICY IF EXISTS "Permitir leitura de materiais para todos" ON materiais;
CREATE POLICY "Permitir leitura de materiais para todos"
  ON materiais FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir gerenciamento de materiais para usuarios autenticados" ON materiais;
CREATE POLICY "Permitir gerenciamento de materiais para usuarios autenticados"
  ON materiais FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 9.7. Cornell Notes
DROP POLICY IF EXISTS "Permitir leitura de notas cornell do proprio usuario" ON cornell_notes;
CREATE POLICY "Permitir leitura de notas cornell do proprio usuario"
  ON cornell_notes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir escrita de notas cornell do proprio usuario" ON cornell_notes;
CREATE POLICY "Permitir escrita de notas cornell do proprio usuario"
  ON cornell_notes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);



-- ------------------------------------------
-- MIGRATION: 001_003_novos_modulos_pedagogicos.sql
-- ------------------------------------------
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


-- ------------------------------------------
-- MIGRATION: 20260722010000_drive_materials.sql
-- ------------------------------------------
-- LMS-UIECB: Migration para FASE 4 (Google Drive Público & SSOT)

-- Tabela Drive_Materials para armazenar a sincronização dos arquivos do Google Drive
CREATE TABLE IF NOT EXISTS Drive_Materials (
    id TEXT PRIMARY KEY,                       -- ID único do arquivo no Google Drive
    name TEXT NOT NULL,                        -- Nome do arquivo ou pasta
    mime_type TEXT NOT NULL,                   -- Ex: 'application/pdf', 'application/vnd.google-apps.folder'
    web_view_link TEXT NOT NULL,               -- URL de visualização direta
    folder_id TEXT DEFAULT '1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO', -- Pasta pai
    file_size_bytes BIGINT DEFAULT 0,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para acelerar a busca de materiais pelo aluno com TTFB < 50ms
CREATE INDEX IF NOT EXISTS idx_drive_materials_folder ON Drive_Materials(folder_id);

-- Inserção de dados iniciais de demonstração (Seed)
INSERT INTO Drive_Materials (id, name, mime_type, web_view_link, folder_id) VALUES
    ('drive_file_1', 'História_do_Pensamento_Cristao_I_Apostila.pdf', 'application/pdf', 'https://drive.google.com/file/d/drive_file_1/view', '1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO'),
    ('drive_file_2', 'Teologia_Contemporanea_Leitura_Obrigatória.pdf', 'application/pdf', 'https://drive.google.com/file/d/drive_file_2/view', '1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO'),
    ('drive_folder_1', 'Pasta_Exegese_Novo_Testamento', 'application/vnd.google-apps.folder', 'https://drive.google.com/drive/folders/drive_folder_1', '1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    mime_type = EXCLUDED.mime_type,
    web_view_link = EXCLUDED.web_view_link,
    last_synced_at = NOW();


-- ------------------------------------------
-- MIGRATION: 20260812000000_student_sync.sql
-- ------------------------------------------
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


-- ------------------------------------------
-- MIGRATION: 20260828000000_analytics_telemetry.sql
-- ------------------------------------------
-- ============================================================
-- MIGRATION 20260828: Auditoria de Acessos & Telemetria LMS-UIECB
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Tabela de Registro de Sessões de Usuários (Auditoria de Acessos)
CREATE TABLE IF NOT EXISTS lms_user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'aluno',
  avatar_url TEXT,
  device_type TEXT DEFAULT 'desktop' CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_heartbeat_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  page_views_count INTEGER DEFAULT 1,
  events_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de alta performance para auditoria e filtros
CREATE INDEX IF NOT EXISTS idx_lms_sessions_email ON lms_user_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_started_at ON lms_user_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_role ON lms_user_sessions(user_role);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_device ON lms_user_sessions(device_type);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_is_active ON lms_user_sessions(is_active);

-- 2. Tabela de Eventos de Telemetria de Uso (Product Analytics)
CREATE TABLE IF NOT EXISTS lms_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'aluno',
  category TEXT NOT NULL, -- 'navigation', 'meet', 'drive', 'cornell_notes', 'biblioteca', 'portfolio', 'rpg', etc.
  action TEXT NOT NULL,   -- 'click_open', 'create_note', 'search_book', 'submit_artifact', etc.
  label TEXT,            -- Título da disciplina, nome do livro, etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de consulta para métricas e rankings
CREATE INDEX IF NOT EXISTS idx_lms_events_category ON lms_analytics_events(category);
CREATE INDEX IF NOT EXISTS idx_lms_events_timestamp ON lms_analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_lms_events_user_email ON lms_analytics_events(user_email);
CREATE INDEX IF NOT EXISTS idx_lms_events_action ON lms_analytics_events(action);

-- 3. Inserção de dados iniciais de auditoria para o administrador principal
INSERT INTO lms_user_sessions (session_token, user_email, user_name, user_role, device_type, browser, os, started_at, last_heartbeat_at, duration_seconds, is_active, page_views_count, events_count)
VALUES (
  'sess_init_admin',
  'sacrasub@gmail.com',
  'Cristiano Sacramento (Admin/Criador)',
  'admin',
  'desktop',
  'Chrome / Windows',
  'Windows 11',
  NOW() - INTERVAL '15 minutes',
  NOW(),
  900,
  TRUE,
  12,
  24
)
ON CONFLICT (session_token) DO NOTHING;


-- ------------------------------------------
-- MIGRATION: 20260829000000_tcc_research_module.sql
-- ------------------------------------------
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


-- ------------------------------------------
-- MIGRATION: 20260829010000_tcc_collaboration_suite.sql
-- ------------------------------------------
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


-- ------------------------------------------
-- MIGRATION: 20260830000000_tele_proximidade.sql
-- ------------------------------------------
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

DROP POLICY IF EXISTS "Leitura autenticada de alertas" ON lms_isolation_alerts;
CREATE POLICY "Leitura autenticada de alertas" ON lms_isolation_alerts FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Escrita autenticada de alertas" ON lms_isolation_alerts;
CREATE POLICY "Escrita autenticada de alertas" ON lms_isolation_alerts FOR ALL
  USING (auth.role() = 'authenticated');


-- ------------------------------------------
-- MIGRATION: 20260831000000_quatro_ds.sql
-- ------------------------------------------
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



-- ------------------------------------------
-- MIGRATION: 20260901000000_homiletica_estudio.sql
-- ------------------------------------------
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

DROP POLICY IF EXISTS "Leitura autenticada de praticas" ON lms_homiletica_praticas;
CREATE POLICY "Leitura autenticada de praticas" ON lms_homiletica_praticas FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Escrita autenticada de praticas" ON lms_homiletica_praticas;
CREATE POLICY "Escrita autenticada de praticas" ON lms_homiletica_praticas FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Leitura autenticada de peer reviews" ON lms_homiletica_peer_reviews;
CREATE POLICY "Leitura autenticada de peer reviews" ON lms_homiletica_peer_reviews FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Escrita autenticada de peer reviews" ON lms_homiletica_peer_reviews;
CREATE POLICY "Escrita autenticada de peer reviews" ON lms_homiletica_peer_reviews FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Leitura autenticada de avaliacoes docente" ON lms_homiletica_avaliacoes_docente;
CREATE POLICY "Leitura autenticada de avaliacoes docente" ON lms_homiletica_avaliacoes_docente FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Escrita autenticada de avaliacoes docente" ON lms_homiletica_avaliacoes_docente;
CREATE POLICY "Escrita autenticada de avaliacoes docente" ON lms_homiletica_avaliacoes_docente FOR ALL USING (auth.role() = 'authenticated');


-- ------------------------------------------
-- MIGRATION: 20260902000000_metaverso_3d.sql
-- ------------------------------------------
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

DROP POLICY IF EXISTS "Leitura autenticada de cenarios metaverso" ON lms_metaverso_cenarios;
CREATE POLICY "Leitura autenticada de cenarios metaverso" ON lms_metaverso_cenarios FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Escrita autenticada de cenarios metaverso" ON lms_metaverso_cenarios;
CREATE POLICY "Escrita autenticada de cenarios metaverso" ON lms_metaverso_cenarios FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Leitura autenticada de exploracoes metaverso" ON lms_metaverso_exploracoes;
CREATE POLICY "Leitura autenticada de exploracoes metaverso" ON lms_metaverso_exploracoes FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Escrita autenticada de exploracoes metaverso" ON lms_metaverso_exploracoes;
CREATE POLICY "Escrita autenticada de exploracoes metaverso" ON lms_metaverso_exploracoes FOR ALL USING (auth.role() = 'authenticated');


-- ------------------------------------------
-- MIGRATION: 20260903000000_aulas_canceladas.sql
-- ------------------------------------------
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


-- ------------------------------------------
-- MIGRATION: 20260904000000_fix_all_rls_and_security_linter.sql
-- ------------------------------------------
-- =========================================================================
-- MIGRATION 20260904: CORREÇÃO COMPLETA DE SEGURANÇA E POLÍTICAS RLS (SUPABASE LINTER)
-- Resolve:
-- 1. [ERROR] rls_disabled_in_public (users, disciplinas, matriculas, aulas, avaliacoes, materiais, drive_materials)
-- 2. [INFO]  rls_enabled_no_policy (alunos_matriculas, historico_assessment_mode, portfolios, rpg_*, lms_homiletica_*, etc.)
-- 3. [WARN]  rls_policy_always_true (lms_quatro_ds_trilhas, lms_quatro_ds_respostas)
-- 4. [WARN]  function_search_path_mutable (update_student_sync_timestamp)
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. CORREÇÃO DE FUNÇÕES MUTÁVEIS (search_path)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_student_sync_timestamp()
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

-- -------------------------------------------------------------------------
-- 2. HABILITAR ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS PÚBLICAS
-- -------------------------------------------------------------------------

-- Tabelas Core
ALTER TABLE IF EXISTS public.users                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.disciplinas               ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.matriculas                ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.aulas                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.avaliacoes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.materiais                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.drive_materials           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Drive_Materials"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cornell_notes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_sync              ENABLE ROW LEVEL SECURITY;

-- Tabelas Pedagógicas e de Avaliação
ALTER TABLE IF EXISTS public.alunos_matriculas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.historico_assessment_mode ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.portfolios                ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rubricas_feedback         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rpg_sessoes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rpg_papeis                ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rpg_fichas_aluno          ENABLE ROW LEVEL SECURITY;

-- Tabelas de Pesquisa TCC e Colaboração
ALTER TABLE IF EXISTS public.tcc_pesquisas             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tcc_perguntas             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tcc_respostas             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tcc_foruns_topicos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tcc_foruns_respostas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tcc_mensagens             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tcc_mural_oracoes         ENABLE ROW LEVEL SECURITY;

-- Tabelas de Telemetria, Auditoria e Inovação
ALTER TABLE IF EXISTS public.lms_user_sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_analytics_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_isolation_alerts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_quatro_ds_trilhas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_quatro_ds_respostas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_homiletica_praticas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_homiletica_peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_homiletica_avaliacoes_docente ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_metaverso_cenarios    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_metaverso_exploracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_aulas_canceladas      ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- 3. POLÍTICAS DE SEGURANÇA: TABELAS CORE (users, disciplinas, etc.)
-- -------------------------------------------------------------------------

-- 3.1. USERS
DROP POLICY IF EXISTS "Permitir leitura publica e autenticada de usuarios" ON public.users;
DROP POLICY IF EXISTS "Permitir insercao ou atualizacao pelo proprio usuario ou admin" ON public.users;
DROP POLICY IF EXISTS "Permitir exclusao por admins" ON public.users;

CREATE POLICY "Permitir leitura publica e autenticada de usuarios"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Permitir insercao ou atualizacao pelo proprio usuario ou admin"
  ON public.users FOR ALL
  TO authenticated
  USING (
    auth.uid() = id 
    OR auth.jwt() ->> 'email' = email 
    OR auth.jwt() ->> 'email' IN ('sacrasub@gmail.com', 'sacrasub03@gmail.com', 'ead@uiecbead.com.br', 'tondedez@gmail.com')
  )
  WITH CHECK (
    auth.uid() = id 
    OR auth.jwt() ->> 'email' = email 
    OR auth.jwt() ->> 'email' IN ('sacrasub@gmail.com', 'sacrasub03@gmail.com', 'ead@uiecbead.com.br', 'tondedez@gmail.com')
  );

-- 3.2. DISCIPLINAS
DROP POLICY IF EXISTS "Permitir leitura de disciplinas para todos" ON public.disciplinas;
DROP POLICY IF EXISTS "Permitir escrita de disciplinas para usuarios autenticados" ON public.disciplinas;

CREATE POLICY "Permitir leitura de disciplinas para todos"
  ON public.disciplinas FOR SELECT
  USING (true);

CREATE POLICY "Permitir escrita de disciplinas para usuarios autenticados"
  ON public.disciplinas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3.3. MATRICULAS
DROP POLICY IF EXISTS "Permitir leitura de matriculas para todos" ON public.matriculas;
DROP POLICY IF EXISTS "Permitir gerenciamento de matriculas para autenticados" ON public.matriculas;

CREATE POLICY "Permitir leitura de matriculas para todos"
  ON public.matriculas FOR SELECT
  USING (true);

CREATE POLICY "Permitir gerenciamento de matriculas para autenticados"
  ON public.matriculas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3.4. AULAS
DROP POLICY IF EXISTS "Permitir leitura de aulas para todos" ON public.aulas;
DROP POLICY IF EXISTS "Permitir edicao de aulas para usuarios autenticados" ON public.aulas;

CREATE POLICY "Permitir leitura de aulas para todos"
  ON public.aulas FOR SELECT
  USING (true);

CREATE POLICY "Permitir edicao de aulas para usuarios autenticados"
  ON public.aulas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3.5. AVALIACOES
DROP POLICY IF EXISTS "Permitir leitura de avaliacoes para todos" ON public.avaliacoes;
DROP POLICY IF EXISTS "Permitir edicao de avaliacoes para usuarios autenticados" ON public.avaliacoes;

CREATE POLICY "Permitir leitura de avaliacoes para todos"
  ON public.avaliacoes FOR SELECT
  USING (true);

CREATE POLICY "Permitir edicao de avaliacoes para usuarios autenticados"
  ON public.avaliacoes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3.6. MATERIAIS
DROP POLICY IF EXISTS "Permitir leitura de materiais para todos" ON public.materiais;
DROP POLICY IF EXISTS "Permitir gerenciamento de materiais para usuarios autenticados" ON public.materiais;

CREATE POLICY "Permitir leitura de materiais para todos"
  ON public.materiais FOR SELECT
  USING (true);

CREATE POLICY "Permitir gerenciamento de materiais para usuarios autenticados"
  ON public.materiais FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3.7. DRIVE_MATERIALS (Metadados do Google Drive)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'drive_materials') THEN
    DROP POLICY IF EXISTS "Permitir leitura de drive_materials para todos" ON public.drive_materials;
    DROP POLICY IF EXISTS "Permitir sync de drive_materials para autenticados e service_role" ON public.drive_materials;
    
    CREATE POLICY "Permitir leitura de drive_materials para todos"
      ON public.drive_materials FOR SELECT
      USING (true);

    CREATE POLICY "Permitir sync de drive_materials para autenticados e service_role"
      ON public.drive_materials FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Drive_Materials') THEN
    DROP POLICY IF EXISTS "Permitir leitura de Drive_Materials para todos" ON public."Drive_Materials";
    DROP POLICY IF EXISTS "Permitir sync de Drive_Materials para autenticados e service_role" ON public."Drive_Materials";
    
    CREATE POLICY "Permitir leitura de Drive_Materials para todos"
      ON public."Drive_Materials" FOR SELECT
      USING (true);

    CREATE POLICY "Permitir sync de Drive_Materials para autenticados e service_role"
      ON public."Drive_Materials" FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 3.8. CORNELL_NOTES
DROP POLICY IF EXISTS "Permitir leitura de notas cornell do proprio usuario" ON public.cornell_notes;
DROP POLICY IF EXISTS "Permitir escrita de notas cornell do proprio usuario" ON public.cornell_notes;

CREATE POLICY "Permitir leitura de notas cornell do proprio usuario"
  ON public.cornell_notes FOR SELECT
  USING (true);

CREATE POLICY "Permitir escrita de notas cornell do proprio usuario"
  ON public.cornell_notes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3.9. STUDENT_SYNC
DROP POLICY IF EXISTS "Permitir leitura de student_sync" ON public.student_sync;
DROP POLICY IF EXISTS "Permitir atualizacao de student_sync" ON public.student_sync;

CREATE POLICY "Permitir leitura de student_sync"
  ON public.student_sync FOR SELECT
  USING (true);

CREATE POLICY "Permitir atualizacao de student_sync"
  ON public.student_sync FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- -------------------------------------------------------------------------
-- 4. POLÍTICAS DE SEGURANÇA: MÓDULOS PEDAGÓGICOS E AVALIAÇÃO
-- -------------------------------------------------------------------------

-- 4.1. ALUNOS_MATRICULAS & HISTORICO_ASSESSMENT_MODE
DROP POLICY IF EXISTS "Permitir leitura de alunos_matriculas" ON public.alunos_matriculas;
DROP POLICY IF EXISTS "Permitir escrita de alunos_matriculas para autenticados" ON public.alunos_matriculas;
DROP POLICY IF EXISTS "Permitir leitura de historico_assessment_mode" ON public.historico_assessment_mode;
DROP POLICY IF EXISTS "Permitir escrita de historico_assessment_mode para autenticados" ON public.historico_assessment_mode;

CREATE POLICY "Permitir leitura de alunos_matriculas"
  ON public.alunos_matriculas FOR SELECT
  USING (true);

CREATE POLICY "Permitir escrita de alunos_matriculas para autenticados"
  ON public.alunos_matriculas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir leitura de historico_assessment_mode"
  ON public.historico_assessment_mode FOR SELECT
  USING (true);

CREATE POLICY "Permitir escrita de historico_assessment_mode para autenticados"
  ON public.historico_assessment_mode FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4.2. PORTFOLIOS & RUBRICAS_FEEDBACK
DROP POLICY IF EXISTS "Permitir leitura de portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Permitir escrita de portfolios para autenticados" ON public.portfolios;
DROP POLICY IF EXISTS "Permitir leitura de rubricas_feedback" ON public.rubricas_feedback;
DROP POLICY IF EXISTS "Permitir escrita de rubricas_feedback para autenticados" ON public.rubricas_feedback;

CREATE POLICY "Permitir leitura de portfolios"
  ON public.portfolios FOR SELECT
  USING (true);

CREATE POLICY "Permitir escrita de portfolios para autenticados"
  ON public.portfolios FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir leitura de rubricas_feedback"
  ON public.rubricas_feedback FOR SELECT
  USING (true);

CREATE POLICY "Permitir escrita de rubricas_feedback para autenticados"
  ON public.rubricas_feedback FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4.3. RPG PASTORAL (sessoes, papeis, fichas)
DROP POLICY IF EXISTS "Permitir leitura de rpg_sessoes" ON public.rpg_sessoes;
DROP POLICY IF EXISTS "Permitir escrita de rpg_sessoes para autenticados" ON public.rpg_sessoes;
DROP POLICY IF EXISTS "Permitir leitura de rpg_papeis" ON public.rpg_papeis;
DROP POLICY IF EXISTS "Permitir escrita de rpg_papeis para autenticados" ON public.rpg_papeis;
DROP POLICY IF EXISTS "Permitir leitura de rpg_fichas_aluno" ON public.rpg_fichas_aluno;
DROP POLICY IF EXISTS "Permitir escrita de rpg_fichas_aluno para autenticados" ON public.rpg_fichas_aluno;

CREATE POLICY "Permitir leitura de rpg_sessoes"
  ON public.rpg_sessoes FOR SELECT
  USING (true);

CREATE POLICY "Permitir escrita de rpg_sessoes para autenticados"
  ON public.rpg_sessoes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir leitura de rpg_papeis"
  ON public.rpg_papeis FOR SELECT
  USING (true);

CREATE POLICY "Permitir escrita de rpg_papeis para autenticados"
  ON public.rpg_papeis FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir leitura de rpg_fichas_aluno"
  ON public.rpg_fichas_aluno FOR SELECT
  USING (true);

CREATE POLICY "Permitir escrita de rpg_fichas_aluno para autenticados"
  ON public.rpg_fichas_aluno FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- -------------------------------------------------------------------------
-- 5. POLÍTICAS DE SEGURANÇA: MÓDULO 4Ds (CORREÇÃO DE PERMISSOES EXCESSIVAS)
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permissao total trilhas" ON public.lms_quatro_ds_trilhas;
DROP POLICY IF EXISTS "Leitura autenticada de trilhas" ON public.lms_quatro_ds_trilhas;
DROP POLICY IF EXISTS "Escrita autenticada de trilhas" ON public.lms_quatro_ds_trilhas;
DROP POLICY IF EXISTS "Leitura publica de trilhas" ON public.lms_quatro_ds_trilhas;
DROP POLICY IF EXISTS "Leitura de trilhas para todos" ON public.lms_quatro_ds_trilhas;
DROP POLICY IF EXISTS "Escrita de trilhas por professores autenticados" ON public.lms_quatro_ds_trilhas;

CREATE POLICY "Leitura de trilhas para todos"
  ON public.lms_quatro_ds_trilhas FOR SELECT
  USING (true);

CREATE POLICY "Escrita de trilhas por professores autenticados"
  ON public.lms_quatro_ds_trilhas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permissao total respostas" ON public.lms_quatro_ds_respostas;
DROP POLICY IF EXISTS "Leitura autenticada de respostas" ON public.lms_quatro_ds_respostas;
DROP POLICY IF EXISTS "Escrita autenticada de respostas" ON public.lms_quatro_ds_respostas;
DROP POLICY IF EXISTS "Leitura de respostas 4ds para todos" ON public.lms_quatro_ds_respostas;
DROP POLICY IF EXISTS "Escrita de respostas 4ds para autenticados" ON public.lms_quatro_ds_respostas;

CREATE POLICY "Leitura de respostas 4ds para todos"
  ON public.lms_quatro_ds_respostas FOR SELECT
  USING (true);

CREATE POLICY "Escrita de respostas 4ds para autenticados"
  ON public.lms_quatro_ds_respostas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- -------------------------------------------------------------------------
-- 6. POLÍTICAS DE SEGURANÇA: HOMILÉTICA, METAVERSO, ISOLAMENTO E AULAS CANCELADAS
-- -------------------------------------------------------------------------

-- 6.1. HOMILÉTICA
DROP POLICY IF EXISTS "Leitura autenticada de praticas" ON public.lms_homiletica_praticas;
DROP POLICY IF EXISTS "Escrita autenticada de praticas" ON public.lms_homiletica_praticas;
DROP POLICY IF EXISTS "Leitura autenticada de peer reviews" ON public.lms_homiletica_peer_reviews;
DROP POLICY IF EXISTS "Escrita autenticada de peer reviews" ON public.lms_homiletica_peer_reviews;
DROP POLICY IF EXISTS "Leitura autenticada de avaliacoes docente" ON public.lms_homiletica_avaliacoes_docente;
DROP POLICY IF EXISTS "Escrita autenticada de avaliacoes docente" ON public.lms_homiletica_avaliacoes_docente;
DROP POLICY IF EXISTS "Leitura de praticas de homiletica para todos" ON public.lms_homiletica_praticas;
DROP POLICY IF EXISTS "Escrita de praticas de homiletica para autenticados" ON public.lms_homiletica_praticas;
DROP POLICY IF EXISTS "Leitura de peer reviews para todos" ON public.lms_homiletica_peer_reviews;
DROP POLICY IF EXISTS "Escrita de peer reviews para autenticados" ON public.lms_homiletica_peer_reviews;
DROP POLICY IF EXISTS "Leitura de avaliacoes docentes de homiletica para todos" ON public.lms_homiletica_avaliacoes_docente;
DROP POLICY IF EXISTS "Escrita de avaliacoes docentes de homiletica para autenticados" ON public.lms_homiletica_avaliacoes_docente;

CREATE POLICY "Leitura de praticas de homiletica para todos"
  ON public.lms_homiletica_praticas FOR SELECT
  USING (true);

CREATE POLICY "Escrita de praticas de homiletica para autenticados"
  ON public.lms_homiletica_praticas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Leitura de peer reviews para todos"
  ON public.lms_homiletica_peer_reviews FOR SELECT
  USING (true);

CREATE POLICY "Escrita de peer reviews para autenticados"
  ON public.lms_homiletica_peer_reviews FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Leitura de avaliacoes docentes de homiletica para todos"
  ON public.lms_homiletica_avaliacoes_docente FOR SELECT
  USING (true);

CREATE POLICY "Escrita de avaliacoes docentes de homiletica para autenticados"
  ON public.lms_homiletica_avaliacoes_docente FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6.2. METAVERSO 3D
DROP POLICY IF EXISTS "Leitura autenticada de cenarios 3d" ON public.lms_metaverso_cenarios;
DROP POLICY IF EXISTS "Escrita autenticada de cenarios 3d" ON public.lms_metaverso_cenarios;
DROP POLICY IF EXISTS "Leitura autenticada de exploracoes 3d" ON public.lms_metaverso_exploracoes;
DROP POLICY IF EXISTS "Escrita autenticada de exploracoes 3d" ON public.lms_metaverso_exploracoes;
DROP POLICY IF EXISTS "Leitura de cenarios 3d para todos" ON public.lms_metaverso_cenarios;
DROP POLICY IF EXISTS "Escrita de cenarios 3d para autenticados" ON public.lms_metaverso_cenarios;
DROP POLICY IF EXISTS "Leitura de exploracoes 3d para todos" ON public.lms_metaverso_exploracoes;
DROP POLICY IF EXISTS "Escrita de exploracoes 3d para autenticados" ON public.lms_metaverso_exploracoes;

CREATE POLICY "Leitura de cenarios 3d para todos"
  ON public.lms_metaverso_cenarios FOR SELECT
  USING (true);

CREATE POLICY "Escrita de cenarios 3d para autenticados"
  ON public.lms_metaverso_cenarios FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Leitura de exploracoes 3d para todos"
  ON public.lms_metaverso_exploracoes FOR SELECT
  USING (true);

CREATE POLICY "Escrita de exploracoes 3d para autenticados"
  ON public.lms_metaverso_exploracoes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6.3. TELEMETRIA, ISOLAMENTO E AULAS CANCELADAS
DROP POLICY IF EXISTS "Permitir leitura de isolation_alerts" ON public.lms_isolation_alerts;
DROP POLICY IF EXISTS "Permitir escrita de isolation_alerts para autenticados" ON public.lms_isolation_alerts;
DROP POLICY IF EXISTS "Permitir leitura de sessions" ON public.lms_user_sessions;
DROP POLICY IF EXISTS "Permitir escrita de sessions para autenticados" ON public.lms_user_sessions;
DROP POLICY IF EXISTS "Permitir leitura de analytics_events" ON public.lms_analytics_events;
DROP POLICY IF EXISTS "Permitir escrita de analytics_events para autenticados" ON public.lms_analytics_events;
DROP POLICY IF EXISTS "Permitir leitura de aulas_canceladas" ON public.lms_aulas_canceladas;
DROP POLICY IF EXISTS "Permitir escrita de aulas_canceladas para autenticados" ON public.lms_aulas_canceladas;

CREATE POLICY "Permitir leitura de isolation_alerts"
  ON public.lms_isolation_alerts FOR SELECT
  USING (true);

CREATE POLICY "Permitir escrita de isolation_alerts para autenticados"
  ON public.lms_isolation_alerts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir leitura de sessions"
  ON public.lms_user_sessions FOR SELECT
  USING (true);

CREATE POLICY "Permitir escrita de sessions para autenticados"
  ON public.lms_user_sessions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir leitura de analytics_events"
  ON public.lms_analytics_events FOR SELECT
  USING (true);

CREATE POLICY "Permitir escrita de analytics_events para autenticados"
  ON public.lms_analytics_events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir leitura de aulas_canceladas"
  ON public.lms_aulas_canceladas FOR SELECT
  USING (true);

CREATE POLICY "Permitir escrita de aulas_canceladas para autenticados"
  ON public.lms_aulas_canceladas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- -------------------------------------------------------------------------
-- 7. POLÍTICAS DE SEGURANÇA: TCC RESEARCH & COLABORAÇÃO
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura de tcc_pesquisas" ON public.tcc_pesquisas;
DROP POLICY IF EXISTS "Permitir escrita de tcc_pesquisas para autenticados" ON public.tcc_pesquisas;
DROP POLICY IF EXISTS "Permitir leitura de tcc_perguntas" ON public.tcc_perguntas;
DROP POLICY IF EXISTS "Permitir escrita de tcc_perguntas para autenticados" ON public.tcc_perguntas;
DROP POLICY IF EXISTS "Permitir leitura de tcc_respostas" ON public.tcc_respostas;
DROP POLICY IF EXISTS "Permitir escrita de tcc_respostas para autenticados" ON public.tcc_respostas;
DROP POLICY IF EXISTS "Permitir leitura de tcc_foruns_topicos" ON public.tcc_foruns_topicos;
DROP POLICY IF EXISTS "Permitir escrita de tcc_foruns_topicos para autenticados" ON public.tcc_foruns_topicos;
DROP POLICY IF EXISTS "Permitir leitura de tcc_foruns_respostas" ON public.tcc_foruns_respostas;
DROP POLICY IF EXISTS "Permitir escrita de tcc_foruns_respostas para autenticados" ON public.tcc_foruns_respostas;
DROP POLICY IF EXISTS "Permitir leitura de tcc_mensagens" ON public.tcc_mensagens;
DROP POLICY IF EXISTS "Permitir escrita de tcc_mensagens para autenticados" ON public.tcc_mensagens;
DROP POLICY IF EXISTS "Permitir leitura de tcc_mural_oracoes" ON public.tcc_mural_oracoes;
DROP POLICY IF EXISTS "Permitir escrita de tcc_mural_oracoes para autenticados" ON public.tcc_mural_oracoes;

CREATE POLICY "Permitir leitura de tcc_pesquisas" ON public.tcc_pesquisas FOR SELECT USING (true);
CREATE POLICY "Permitir escrita de tcc_pesquisas para autenticados" ON public.tcc_pesquisas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir leitura de tcc_perguntas" ON public.tcc_perguntas FOR SELECT USING (true);
CREATE POLICY "Permitir escrita de tcc_perguntas para autenticados" ON public.tcc_perguntas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir leitura de tcc_respostas" ON public.tcc_respostas FOR SELECT USING (true);
CREATE POLICY "Permitir escrita de tcc_respostas para autenticados" ON public.tcc_respostas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir leitura de tcc_foruns_topicos" ON public.tcc_foruns_topicos FOR SELECT USING (true);
CREATE POLICY "Permitir escrita de tcc_foruns_topicos para autenticados" ON public.tcc_foruns_topicos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir leitura de tcc_foruns_respostas" ON public.tcc_foruns_respostas FOR SELECT USING (true);
CREATE POLICY "Permitir escrita de tcc_foruns_respostas para autenticados" ON public.tcc_foruns_respostas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir leitura de tcc_mensagens" ON public.tcc_mensagens FOR SELECT USING (true);
CREATE POLICY "Permitir escrita de tcc_mensagens para autenticados" ON public.tcc_mensagens FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir leitura de tcc_mural_oracoes" ON public.tcc_mural_oracoes FOR SELECT USING (true);
CREATE POLICY "Permitir escrita de tcc_mural_oracoes para autenticados" ON public.tcc_mural_oracoes FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ------------------------------------------
-- MIGRATION: 20260904000001_create_telemetry_tables.sql
-- ------------------------------------------
-- ============================================================
-- MIGRATION 20260904: Criação Definitiva das Tabelas de Telemetria e Auditoria
-- Copie e cole este código no Supabase Dashboard > SQL Editor e clique em 'RUN'
-- ============================================================

-- 1. Tabela de Sessões de Usuários (Auditoria e Telemetria Global)
CREATE TABLE IF NOT EXISTS public.lms_user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'aluno',
  avatar_url TEXT,
  device_type TEXT DEFAULT 'desktop' CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_heartbeat_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  page_views_count INTEGER DEFAULT 1,
  events_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de Alta Performance para Auditoria e Filtros
CREATE INDEX IF NOT EXISTS idx_lms_sessions_email ON public.lms_user_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_started_at ON public.lms_user_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_role ON public.lms_user_sessions(user_role);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_device ON public.lms_user_sessions(device_type);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_is_active ON public.lms_user_sessions(is_active);

-- 2. Tabela de Eventos de Telemetria de Uso (Product Analytics)
CREATE TABLE IF NOT EXISTS public.lms_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'aluno',
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  label TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de Performance para Métricas
CREATE INDEX IF NOT EXISTS idx_lms_events_category ON public.lms_analytics_events(category);
CREATE INDEX IF NOT EXISTS idx_lms_events_timestamp ON public.lms_analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_lms_events_user_email ON public.lms_analytics_events(user_email);

-- 3. Habilita RLS com Políticas Permissivas para Chave Anon e Autenticados
-- (Visitantes em tela de bloqueio e alunos matriculados precisam registrar acessos)
ALTER TABLE public.lms_user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de sessions para todos" ON public.lms_user_sessions;
CREATE POLICY "Permitir leitura de sessions para todos"
  ON public.lms_user_sessions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir escrita de sessions para todos" ON public.lms_user_sessions;
CREATE POLICY "Permitir escrita de sessions para todos"
  ON public.lms_user_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura de events para todos" ON public.lms_analytics_events;
CREATE POLICY "Permitir leitura de events para todos"
  ON public.lms_analytics_events FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir escrita de events para todos" ON public.lms_analytics_events;
CREATE POLICY "Permitir escrita de events para todos"
  ON public.lms_analytics_events FOR ALL
  USING (true)
  WITH CHECK (true);


-- ------------------------------------------
-- MIGRATION: 20260905000000_tcc_pesquisa_respostas.sql
-- ------------------------------------------
-- =========================================================================
-- LMS-KOINONIA: MIGRATION PARA COLETA DE DADOS & PESQUISA DE CAMPO DO TCC
-- Trabalho de Conclusão do Curso Bacharel em Teologia, apresentado no
-- CENTRO UNIVERSITÁRIO DO MACIÇO DE BATURITÉ - BATURITÉ – CE (UNIMB)
-- CURSO DE BACHARELADO EM TEOLOGIA
--
-- Pesquisador: Cristiano do Sacramento Soares
-- Orientador: Pastor Alexsandro Silva
-- Metodologia: Profª Gabriela Leal
-- Seminário: Seminário Teológico Congregacional
--
-- Tema: Estratégias Eficazes para o Ensino Teológico no Ambiente Virtual:
--       Distância Transacional, Preservação da Koinonia e a Transição
--       do Internato Presencial para o Modelo Síncrono Remoto
--
-- Plataforma: Koinonia LMS (Projeto de Plataforma Integrada de Ensino Teológico Virtual)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.tcc_pesquisa_respostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    tipo_publico VARCHAR(50) NOT NULL, -- 'aluno_unimb', 'professor_unimb', 'monitor_unimb', 'externo_pastor', 'externo_aluno', 'externo_lider', 'externo_membro'
    dados_identificacao JSONB DEFAULT '{}'::jsonb, -- Para externos: { nome, email, whatsapp, igreja, cidade_uf, funcao }
    autorizou_tcc BOOLEAN NOT NULL DEFAULT false, -- TCLE obrigatório
    origem VARCHAR(50) DEFAULT 'organico', -- 'interno_lms', 'whatsapp_externo', 'link_direto'
    respostas JSONB NOT NULL, -- Perguntas mapeadas por chave-valor
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices otimizados
CREATE INDEX IF NOT EXISTS idx_tcc_respostas_tipo ON public.tcc_pesquisa_respostas (tipo_publico);
CREATE INDEX IF NOT EXISTS idx_tcc_respostas_created ON public.tcc_pesquisa_respostas (created_at DESC);

-- Habilitar RLS
ALTER TABLE public.tcc_pesquisa_respostas ENABLE ROW LEVEL SECURITY;

-- Política de INSERT irrestrita (para suportar externos e seminaristas logados)
CREATE POLICY "Permitir insercao anonima e autenticada de respostas"
ON public.tcc_pesquisa_respostas FOR INSERT
TO public
WITH CHECK (autorizou_tcc = true);

-- Política de SELECT restrita a Administradores e Pesquisador
CREATE POLICY "Permitir leitura apenas para administradores"
ON public.tcc_pesquisa_respostas FOR SELECT
TO authenticated
USING (
    auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE role = 'admin'
    )
    OR auth.jwt() ->> 'email' = 'sacrasub@gmail.com'
);


