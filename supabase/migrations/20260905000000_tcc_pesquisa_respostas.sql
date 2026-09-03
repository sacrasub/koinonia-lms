-- =========================================================================
-- LMS-KOINONIA: MIGRATION PARA COLETA DE DADOS & PESQUISA DE CAMPO DO TCC
-- Trabalho de Conclusão de Curso em Teologia: Cristiano Sacramento Soares
-- Seminário Teológico Koinonia (UNIB / UIECB)
-- Tema: Estratégias Eficazes para o Ensino Teológico no Ambiente Virtual:
--       Distância Transacional, Preservação da Koinonia e a Transição
--       do Internato Presencial para o Modelo Síncrono Remoto
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.tcc_pesquisa_respostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    tipo_publico VARCHAR(50) NOT NULL, -- 'aluno_unib', 'professor_unib', 'monitor_unib', 'externo_pastor', 'externo_aluno', 'externo_lider', 'externo_membro'
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
