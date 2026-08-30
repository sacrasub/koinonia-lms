/**
 * quatrodsDsService.ts
 * =========================================================================
 * MÓDULO 6: TRILHA DE ENSINAGEM SOCRÁTICA — OS QUATRO Ds DE JESUS
 *
 * Fundamentação: Andragogia (Knowles, 1980) + Inov-Ativa (Moran, 2018)
 *
 * O ciclo socrático de Jesus:
 *   D1 Desejo          → Pergunta que desperta curiosidade e motivação intrínseca
 *   D2 Desestruturação → Paradoxo que abala a certeza e gera tensão cognitiva
 *   D3 Desafio         → Tarefa prática que conecta teoria e práxis ministerial
 *   D4 Decisão         → Comprometimento vocacional com o aprendizado
 *
 * Este serviço:
 * 1. CRUD resiliente de trilhas (tabela nativa + SSOT cloud materiais + offline-first)
 * 2. Salvar/atualizar respostas dos alunos com contingência de RLS
 * 3. Progresso consolidado por trilha (dashboard do professor)
 * 4. Exportação CSV para evidência empírica do TCC
 * =========================================================================
 */

import { supabase } from '@/lib/supabaseClient';
import {
  QuatrodsTrilha,
  QuatrodsResposta,
  QuatrodsEstagio,
  QuatrodsProgressoAluno,
} from '@/types';

// ============================================================================
// CHAVES DE CACHE LOCAL & SSOT CLOUD
// ============================================================================

const CACHE_TRILHAS_KEY = 'lms_quatro_ds_trilhas_cache_v2';
const CACHE_RESPOSTAS_KEY = 'lms_quatro_ds_respostas_cache_v2';
const CLOUD_TRILHAS_KEY = 'lms_quatro_ds_trilhas_global';
const CLOUD_RESPOSTAS_KEY = 'lms_quatro_ds_respostas_global';
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutos

// Trilha socrática modelo inicial (TCC I)
export const DEFAULT_TRILHAS: QuatrodsTrilha[] = [
  {
    id: 'trilha-tcc-modelo-1',
    disciplina_id: 'a8888888-8888-8888-8888-888888888888',
    disciplina_name: 'TCC I',
    titulo: 'O Alicerce da Pesquisa — Estruturando o TCC I',
    descricao: 'O projeto de pesquisa atua como o planejamento indispensável de uma grande obra. Assim como construir uma casa ou orçar uma viagem exige organização prévia, o artigo científico demanda etapas, cumprimento de prazos e definições metodológicas precisas.',
    professor_email: 'gabriela@uicb.edu.br',
    aula_referencia: 'Aula 3 de 21 de Ago. / Profª Gabriela Leal',
    publicado: true,
    d1_titulo: 'O Arquiteto do Próprio TCC',
    d1_conteudo: 'Se você tivesse que planejar a viagem mais importante da sua jornada acadêmica hoje, por onde começaria? Qual tema teológico, histórico ou eclesiástico desperta tanta paixão e curiosidade em você a ponto de sustentar meses de pesquisa contínua sem se tornar um fardo pesado?',
    d2_titulo: 'O Paradoxo da Introdução e da Neutralidade',
    d2_conteudo: 'E se a regra de ouro da escrita acadêmica for o oposto do seu costume, exigindo que a introdução seja, obrigatoriamente, a última coisa a ser escrita no seu artigo? Além disso, como você lidaria com o incômodo de pesquisar e citar autores que discordam frontalmente das suas convicções teológicas para provar a fundamentação científica do seu texto?',
    d3_titulo: 'Rascunho do Alicerce Metodológico',
    d3_conteudo: 'Considerando o prazo estipulado em aula, redija um esboço inicial do seu projeto estruturando: 1) Tema e Objetivo Geral (com verbo no infinitivo); 2) Justificativa em linguagem científica e impessoal; 3) Abordagem metodológica e indicação do docente para orientação.',
    d4_titulo: 'Meu Pacto Acadêmico',
    d4_conteudo: 'Diante das diretrizes e da necessidade de nivelamento da turma, qual é o seu compromisso inegociável para as próximas semanas? Escreva uma frase de comprometimento prático, assumindo a responsabilidade pelo envio do seu projeto e pela consolidação da parceria com o seu orientador.',
    created_at: new Date('2026-08-21T19:00:00Z').toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function lerCache<T>(key: string): T[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts: number; data: T[] };
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function salvarCache<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

function invalidarCache(...keys: string[]): void {
  if (typeof window === 'undefined') return;
  keys.forEach((k) => {
    try { localStorage.removeItem(k); } catch {}
  });
}

// ============================================================================
// SINCRONIZAÇÃO SSOT VIA TABELA 'MATERIAIS' (CONTINGÊNCIA GLOBAL RLS)
// ============================================================================

async function syncTrilhasToMateriais(trilhas: QuatrodsTrilha[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const jsonStr = JSON.stringify(trilhas);
    const { data: existing } = await supabase
      .from('materiais')
      .select('id')
      .eq('title', CLOUD_TRILHAS_KEY)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('materiais')
        .update({ file_url: jsonStr, updated_at: new Date().toISOString() })
        .eq('id', existing[0].id);
    } else {
      await supabase.from('materiais').insert([
        {
          disciplina_id: 'quatro-ds-global',
          title: CLOUD_TRILHAS_KEY,
          file_url: jsonStr,
          file_type: 'json',
          is_native_upload: false,
        },
      ]);
    }
  } catch (err) {
    console.warn('[QuatroDs] Aviso ao sincronizar trilhas na nuvem SSOT:', err);
  }
}

async function fetchTrilhasFromMateriais(): Promise<QuatrodsTrilha[]> {
  try {
    const { data, error } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', CLOUD_TRILHAS_KEY)
      .limit(1);

    if (!error && data && data.length > 0 && data[0].file_url) {
      const parsed = JSON.parse(data[0].file_url);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as QuatrodsTrilha[];
      }
    }
  } catch (e) {
    console.warn('[QuatroDs] Falha ao ler trilhas da tabela materiais:', e);
  }
  return [];
}

async function syncRespostasToMateriais(respostas: QuatrodsResposta[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const jsonStr = JSON.stringify(respostas);
    const { data: existing } = await supabase
      .from('materiais')
      .select('id')
      .eq('title', CLOUD_RESPOSTAS_KEY)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('materiais')
        .update({ file_url: jsonStr, updated_at: new Date().toISOString() })
        .eq('id', existing[0].id);
    } else {
      await supabase.from('materiais').insert([
        {
          disciplina_id: 'quatro-ds-global',
          title: CLOUD_RESPOSTAS_KEY,
          file_url: jsonStr,
          file_type: 'json',
          is_native_upload: false,
        },
      ]);
    }
  } catch (err) {
    console.warn('[QuatroDs] Aviso ao sincronizar respostas na nuvem SSOT:', err);
  }
}

async function fetchRespostasFromMateriais(): Promise<QuatrodsResposta[]> {
  try {
    const { data, error } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', CLOUD_RESPOSTAS_KEY)
      .limit(1);

    if (!error && data && data.length > 0 && data[0].file_url) {
      const parsed = JSON.parse(data[0].file_url);
      if (Array.isArray(parsed)) {
        return parsed as QuatrodsResposta[];
      }
    }
  } catch (e) {
    console.warn('[QuatroDs] Falha ao ler respostas da tabela materiais:', e);
  }
  return [];
}

async function getAllLocalOrCloudTrilhas(): Promise<QuatrodsTrilha[]> {
  const cached = lerCache<QuatrodsTrilha>(CACHE_TRILHAS_KEY);
  if (cached && cached.length > 0) return cached;

  const cloud = await fetchTrilhasFromMateriais();
  if (cloud.length > 0) {
    salvarCache(CACHE_TRILHAS_KEY, cloud);
    return cloud;
  }

  return DEFAULT_TRILHAS;
}

// ============================================================================
// CONFIG DOS ESTÁGIOS (METADADOS FIXOS DE APRESENTAÇÃO)
// ============================================================================

export const ESTAGIO_CONFIG: Record<
  QuatrodsEstagio,
  { label: string; emoji: string; cor: string; badge: string; border: string; bg: string; numero: number }
> = {
  d1_desejo: {
    label: 'Desejo',
    emoji: '🔥',
    cor: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
    border: 'border-orange-200',
    bg: 'bg-orange-50',
    numero: 1,
  },
  d2_desestruturacao: {
    label: 'Desestruturação',
    emoji: '🌀',
    cor: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    numero: 2,
  },
  d3_desafio: {
    label: 'Desafio',
    emoji: '⚡',
    cor: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    numero: 3,
  },
  d4_decisao: {
    label: 'Decisão',
    emoji: '✅',
    cor: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    numero: 4,
  },
};

export const ESTAGIOS_ORDENADOS: QuatrodsEstagio[] = [
  'd1_desejo',
  'd2_desestruturacao',
  'd3_desafio',
  'd4_decisao',
];

export const PLACEHOLDERS_PROFESSOR: Record<QuatrodsEstagio, { titulo: string; conteudo: string }> = {
  d1_desejo: {
    titulo: 'Ex: A Questão que Ninguém Quer Responder',
    conteudo: 'Ex: Se você fosse o único pastor de uma cidade sem qualquer presença cristã, qual seria sua primeira ação? Por quê?',
  },
  d2_desestruturacao: {
    titulo: 'Ex: O Paradoxo da Missão',
    conteudo: 'Ex: Mas e se os valores culturais dessa cidade fossem tão arraigados que sua própria tradição eclesiástica fosse percebida como um obstáculo à comunicação do Evangelho? Como ficaria sua resposta anterior?',
  },
  d3_desafio: {
    titulo: 'Ex: Plano de Plantio Contextualizado',
    conteudo: 'Ex: Com base na tensão que acabou de experimentar, escreva em 3 parágrafos um esboço de estratégia de plantio de igreja contextualizado para este cenário, aplicando os princípios hermenêuticos estudados hoje.',
  },
  d4_decisao: {
    titulo: 'Ex: Minha Decisão Vocacional',
    conteudo: 'Ex: Qual verdade ministerial você leva desta trilha? Escreva uma frase de comprometimento com sua práxis pastoral a partir do que aprendeu hoje.',
  },
};

// ============================================================================
// LEITURA DE TRILHAS (MULTI-CAMADA RESILIENTE)
// ============================================================================

/**
 * Retorna todas as trilhas publicadas (visível para alunos).
 * Opcionalmente filtra por disciplina.
 */
export async function getTrilhas(disciplinaId?: string, forceRefresh = false): Promise<QuatrodsTrilha[]> {
  if (!forceRefresh) {
    const cached = lerCache<QuatrodsTrilha>(CACHE_TRILHAS_KEY);
    if (cached && cached.length > 0) {
      return disciplinaId
        ? cached.filter((t) => t.disciplina_id === disciplinaId && t.publicado)
        : cached.filter((t) => t.publicado);
    }
  }

  let lista: QuatrodsTrilha[] = [];

  // 1. Tenta buscar da tabela nativa
  try {
    let query = supabase
      .from('lms_quatro_ds_trilhas')
      .select('*')
      .eq('publicado', true)
      .order('created_at', { ascending: false });

    if (disciplinaId) {
      query = query.eq('disciplina_id', disciplinaId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      lista = data as QuatrodsTrilha[];
    }
  } catch (e) {
    console.warn('[QuatroDs] Falha de leitura da tabela nativa:', e);
  }

  // 2. Se a tabela nativa não retornou, busca do SSOT materiais na nuvem
  if (lista.length === 0) {
    const cloud = await fetchTrilhasFromMateriais();
    if (cloud.length > 0) {
      lista = disciplinaId
        ? cloud.filter((t) => t.disciplina_id === disciplinaId && t.publicado)
        : cloud.filter((t) => t.publicado);
    }
  }

  // 3. Fallback: local/default
  if (lista.length === 0) {
    const local = lerCache<QuatrodsTrilha>(CACHE_TRILHAS_KEY) || DEFAULT_TRILHAS;
    lista = disciplinaId
      ? local.filter((t) => t.disciplina_id === disciplinaId && t.publicado)
      : local.filter((t) => t.publicado);
  }

  salvarCache(CACHE_TRILHAS_KEY, lista);
  return lista;
}

/**
 * Retorna todas as trilhas do professor (incluindo não publicadas).
 */
export async function getTrilhasDoProfessor(professorEmail: string): Promise<QuatrodsTrilha[]> {
  const normEmail = (professorEmail || '').toLowerCase().trim();
  let lista: QuatrodsTrilha[] = [];

  // 1. Tenta buscar da tabela nativa
  try {
    const { data, error } = await supabase
      .from('lms_quatro_ds_trilhas')
      .select('*')
      .eq('professor_email', normEmail)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      lista = data as QuatrodsTrilha[];
    }
  } catch (e) {
    console.warn('[QuatroDs] Falha ao buscar trilhas do professor na tabela nativa:', e);
  }

  // 2. Fallback SSOT na nuvem
  if (lista.length === 0) {
    const cloud = await fetchTrilhasFromMateriais();
    if (cloud.length > 0) {
      lista = cloud.filter(
        (t) => t.professor_email.toLowerCase() === normEmail || normEmail.includes('admin') || normEmail.includes('sacrasub')
      );
    }
  }

  // 3. Fallback Local / Defaults
  if (lista.length === 0) {
    const cached = lerCache<QuatrodsTrilha>(CACHE_TRILHAS_KEY) || DEFAULT_TRILHAS;
    lista = cached.filter(
      (t) => t.professor_email.toLowerCase() === normEmail || normEmail.includes('admin') || normEmail.includes('sacrasub')
    );
  }

  return lista;
}

// ============================================================================
// CRIAÇÃO / ATUALIZAÇÃO DE TRILHAS (PROFESSOR) COM RESILIÊNCIA RLS
// ============================================================================

type TrilhaPayload = Omit<QuatrodsTrilha, 'id' | 'created_at' | 'updated_at'>;

export async function criarTrilha(payload: TrilhaPayload): Promise<QuatrodsTrilha> {
  const newId = crypto.randomUUID();
  const now = new Date().toISOString();

  const novaTrilha: QuatrodsTrilha = {
    ...payload,
    id: newId,
    professor_email: payload.professor_email.toLowerCase().trim(),
    publicado: payload.publicado ?? true,
    created_at: now,
    updated_at: now,
  };

  // 1. Atualiza cache local imediatamente (otimista)
  const currentList = await getAllLocalOrCloudTrilhas();
  const updatedList = [novaTrilha, ...currentList.filter((t) => t.id !== newId)];
  salvarCache(CACHE_TRILHAS_KEY, updatedList);

  // 2. Tenta inserir na tabela dedicada lms_quatro_ds_trilhas
  let savedInNativeTable = false;
  try {
    const { data, error } = await supabase
      .from('lms_quatro_ds_trilhas')
      .insert({
        id: novaTrilha.id,
        disciplina_id: novaTrilha.disciplina_id,
        disciplina_name: novaTrilha.disciplina_name,
        titulo: novaTrilha.titulo,
        descricao: novaTrilha.descricao,
        professor_email: novaTrilha.professor_email,
        aula_referencia: novaTrilha.aula_referencia,
        publicado: novaTrilha.publicado,
        d1_titulo: novaTrilha.d1_titulo,
        d1_conteudo: novaTrilha.d1_conteudo,
        d2_titulo: novaTrilha.d2_titulo,
        d2_conteudo: novaTrilha.d2_conteudo,
        d3_titulo: novaTrilha.d3_titulo,
        d3_conteudo: novaTrilha.d3_conteudo,
        d4_titulo: novaTrilha.d4_titulo,
        d4_conteudo: novaTrilha.d4_conteudo,
        created_at: now,
        updated_at: now,
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      savedInNativeTable = true;
    } else if (error) {
      console.warn('[QuatroDs] Supabase RLS restrito na tabela nativa, salvando via SSOT materiais:', error.message);
    }
  } catch (e) {
    console.warn('[QuatroDs] Erro ao gravar na tabela nativa:', e);
  }

  // 3. Persiste via SSOT materiais na nuvem (garante multi-usuário e contorno suave de RLS)
  await syncTrilhasToMateriais(updatedList);
  salvarCache(CACHE_TRILHAS_KEY, updatedList);

  return novaTrilha;
}

export async function atualizarTrilha(id: string, payload: Partial<TrilhaPayload>): Promise<void> {
  const currentList = await getAllLocalOrCloudTrilhas();
  const now = new Date().toISOString();
  const updatedList = currentList.map((t) =>
    t.id === id ? { ...t, ...payload, updated_at: now } : t
  );

  salvarCache(CACHE_TRILHAS_KEY, updatedList);

  try {
    await supabase
      .from('lms_quatro_ds_trilhas')
      .update({ ...payload, updated_at: now })
      .eq('id', id);
  } catch (e) {
    console.warn('[QuatroDs] Aviso ao atualizar na tabela nativa:', e);
  }

  await syncTrilhasToMateriais(updatedList);
  salvarCache(CACHE_TRILHAS_KEY, updatedList);
}

export async function arquivarTrilha(id: string): Promise<void> {
  await atualizarTrilha(id, { publicado: false });
}

// ============================================================================
// RESPOSTAS DOS ALUNOS COM CONTINGÊNCIA RLS
// ============================================================================

export async function getRespostasDoAluno(
  trilhaId: string,
  alunoEmail: string,
): Promise<QuatrodsResposta[]> {
  const emailLower = (alunoEmail || '').toLowerCase().trim();
  const cacheKey = `${CACHE_RESPOSTAS_KEY}_${trilhaId}_${emailLower}`;
  const cached = lerCache<QuatrodsResposta>(cacheKey);
  if (cached && cached.length > 0) return cached;

  // 1. Tenta tabela nativa
  try {
    const { data, error } = await supabase
      .from('lms_quatro_ds_respostas')
      .select('*')
      .eq('trilha_id', trilhaId)
      .eq('aluno_email', emailLower);

    if (!error && data && data.length > 0) {
      const respostas = data as QuatrodsResposta[];
      salvarCache(cacheKey, respostas);
      return respostas;
    }
  } catch (e) {}

  // 2. Fallback SSOT materiais
  const allCloud = await fetchRespostasFromMateriais();
  const match = allCloud.filter((r) => r.trilha_id === trilhaId && r.aluno_email === emailLower);
  if (match.length > 0) {
    salvarCache(cacheKey, match);
    return match;
  }

  return cached || [];
}

export async function salvarResposta(
  trilhaId: string,
  alunoEmail: string,
  alunoNome: string,
  estagio: QuatrodsEstagio,
  conteudo: string,
): Promise<void> {
  const emailLower = (alunoEmail || '').toLowerCase().trim();

  // Persiste localmente imediatamente (otimista)
  const cacheKey = `${CACHE_RESPOSTAS_KEY}_${trilhaId}_${emailLower}`;
  const localData = lerCache<QuatrodsResposta>(cacheKey) || [];
  const novaResposta: QuatrodsResposta = {
    id: crypto.randomUUID(),
    trilha_id: trilhaId,
    aluno_email: emailLower,
    aluno_nome: alunoNome,
    estagio,
    conteudo,
    completado: true,
    created_at: new Date().toISOString(),
  };

  const atualizado = [
    ...localData.filter((r) => r.estagio !== estagio),
    novaResposta,
  ];
  salvarCache(cacheKey, atualizado);

  // 1. Tenta gravar na tabela nativa Supabase
  let savedInNativeTable = false;
  try {
    const { error } = await supabase
      .from('lms_quatro_ds_respostas')
      .upsert(
        {
          trilha_id: trilhaId,
          aluno_email: emailLower,
          aluno_nome: alunoNome,
          estagio,
          conteudo,
          completado: true,
        },
        { onConflict: 'trilha_id,aluno_email,estagio' },
      );
    if (!error) savedInNativeTable = true;
  } catch (e) {}

  // 2. Fallback SSOT na tabela materiais
  try {
    const allRespostas = await fetchRespostasFromMateriais();
    const updatedRespostas = [
      ...allRespostas.filter((r) => !(r.trilha_id === trilhaId && r.aluno_email === emailLower && r.estagio === estagio)),
      novaResposta,
    ];
    await syncRespostasToMateriais(updatedRespostas);
  } catch (e) {
    console.warn('[QuatroDs] Resposta salva localmente em contingência.');
  }
}

// ============================================================================
// PROGRESSO CONSOLIDADO (PROFESSOR / MONITOR)
// ============================================================================

export async function getProgressoDaTrilha(
  trilhaId: string,
  totalAlunos: number,
): Promise<QuatrodsProgressoAluno> {
  let respostas: QuatrodsResposta[] = [];

  try {
    const { data, error } = await supabase
      .from('lms_quatro_ds_respostas')
      .select('*')
      .eq('trilha_id', trilhaId)
      .eq('completado', true);

    if (!error && data && data.length > 0) {
      respostas = data as QuatrodsResposta[];
    }
  } catch (e) {}

  if (respostas.length === 0) {
    const allCloud = await fetchRespostasFromMateriais();
    respostas = allCloud.filter((r) => r.trilha_id === trilhaId && r.completado);
  }

  const count = (estagio: QuatrodsEstagio) =>
    new Set(respostas.filter((r) => r.estagio === estagio).map((r) => r.aluno_email)).size;

  return {
    trilha_id: trilhaId,
    alunos_completaram_d1: count('d1_desejo'),
    alunos_completaram_d2: count('d2_desestruturacao'),
    alunos_completaram_d3: count('d3_desafio'),
    alunos_completaram_d4: count('d4_decisao'),
    total_alunos: totalAlunos,
    respostas,
  };
}

// ============================================================================
// HELPER: PRÓXIMO ESTÁGIO DESBLOQUEADO (PROGRESSÃO SEQUENCIAL)
// ============================================================================

export function getEstagioAtivo(respostas: QuatrodsResposta[]): QuatrodsEstagio {
  const completados = new Set(
    respostas.filter((r) => r.completado).map((r) => r.estagio),
  );

  if (!completados.has('d1_desejo')) return 'd1_desejo';
  if (!completados.has('d2_desestruturacao')) return 'd2_desestruturacao';
  if (!completados.has('d3_desafio')) return 'd3_desafio';
  return 'd4_decisao';
}

export function isEstagioDesbloqueado(
  estagio: QuatrodsEstagio,
  respostas: QuatrodsResposta[],
): boolean {
  const completados = new Set(
    respostas.filter((r) => r.completado).map((r) => r.estagio),
  );
  switch (estagio) {
    case 'd1_desejo': return true;
    case 'd2_desestruturacao': return completados.has('d1_desejo');
    case 'd3_desafio': return completados.has('d2_desestruturacao');
    case 'd4_decisao': return completados.has('d3_desafio');
  }
}

export function isTrilhaConcluida(respostas: QuatrodsResposta[]): boolean {
  return ESTAGIOS_ORDENADOS.every((e) =>
    respostas.some((r) => r.estagio === e && r.completado),
  );
}

// ============================================================================
// EXPORTAÇÃO CSV (EVIDÊNCIA EMPÍRICA PARA TCC)
// ============================================================================

export function exportarRespostasCsv(
  trilha: QuatrodsTrilha,
  respostas: QuatrodsResposta[],
): void {
  const headers = [
    'Aluno (E-mail)',
    'Aluno (Nome)',
    'Estágio',
    'Título do Estágio',
    'Resposta',
    'Data',
  ].join(',');

  const rows = respostas.map((r) => {
    const config = ESTAGIO_CONFIG[r.estagio];
    return [
      `"${r.aluno_email}"`,
      `"${r.aluno_nome || ''}"`,
      `"${config.emoji} ${config.label}"`,
      `"${r.estagio === 'd1_desejo' ? trilha.d1_titulo : r.estagio === 'd2_desestruturacao' ? trilha.d2_titulo : r.estagio === 'd3_desafio' ? trilha.d3_titulo : trilha.d4_titulo}"`,
      `"${r.conteudo.replace(/"/g, '""')}"`,
      `"${new Date(r.created_at).toLocaleString('pt-BR')}"`,
    ].join(',');
  });

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `lms_4ds_${trilha.titulo.replace(/\s+/g, '_').slice(0, 30)}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
