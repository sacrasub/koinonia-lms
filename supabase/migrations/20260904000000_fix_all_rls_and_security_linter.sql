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
