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

