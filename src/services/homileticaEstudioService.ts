/**
 * homileticaEstudioService.ts
 * =========================================================================
 * MÓDULO 7: ESTÚDIO DE PRÁTICA HOMILÉTICA E ACONSELHAMENTO (PEER INSTRUCTION)
 *
 * Fundamentação Teórica:
 *   - Instrução por Pares (Eric Mazur)
 *   - Avaliação Formativa e Mediadora (Jussara Hoffmann)
 *   - Microaprendizagem e Prática Ministerial EaD (Lidiane Souza)
 *
 * Funcionalidades:
 *   1. Cadastro e listagem de práticas gravadas (áudio/vídeo/link)
 *   2. Registro de avaliação formativa entre pares (Peer Review 1-5 estrelas)
 *   3. Rubrica de avaliação mediadora docente (Professores e Monitores)
 *   4. Métricas estatísticas de evolução da oratória para o TCC
 *   5. Suporte offline-first via localStorage
 *   6. Exportação de dados consolidados em CSV para pesquisa científica
 * =========================================================================
 */

import { supabase } from '@/lib/supabaseClient';
import {
  PraticaHomiletica,
  PeerReviewHomiletica,
  AvaliacaoDocenteHomiletica,
  ResumoEstatisticoHomiletica,
  TipoPraticaHomiletica,
  TipoMidiaPratica,
} from '@/types';

const CACHE_PRATICAS_KEY = 'lms_homiletica_praticas_cache_v1';
const CACHE_REVIEWS_KEY = 'lms_homiletica_reviews_cache_v1';
const CACHE_DOCENTES_KEY = 'lms_homiletica_docentes_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutos

// ============================================================================
// HELPERS DE CACHE LOCAL
// ============================================================================

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
    try {
      localStorage.removeItem(k);
    } catch {}
  });
}

// ============================================================================
// DADOS MOCK INICIAIS (Para demonstração e quando o banco estiver vazio)
// ============================================================================

const SEED_PRATICAS: PraticaHomiletica[] = [
  {
    id: 'seed-hom-1',
    aluno_email: 'sacrasub03@gmail.com',
    aluno_nome: 'Cristiano Sacramento (Aluno Turma A)',
    aluno_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    disciplina_id: 'disc-homiletica-1',
    disciplina_name: 'Homilética e Oratória Sacra',
    titulo: 'A Certeza da Esperança Viva na Tribulação',
    tipo_pratica: 'homiletica',
    texto_biblico: 'Romanos 8:28-39',
    esboco_resumo: '1. O Propósito Soberano do Chamado (v.28-30)\n2. O Amor Inabalável de Deus em Cristo (v.31-35)\n3. Mais que Vencedores na Práxis Cristã (v.36-39)',
    midia_tipo: 'audio',
    midia_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-10781.mp3',
    duracao_segundos: 420,
    status: 'publicado',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    peer_reviews_count: 3,
    media_fidelidade: 4.8,
    media_comunicacao: 4.5,
    media_aplicacao: 4.7,
    media_geral_pares: 4.67,
  },
  {
    id: 'seed-hom-2',
    aluno_email: 'aluno.lucas@uiecbead.com.br',
    aluno_nome: 'Lucas Silva Evangelista',
    aluno_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    disciplina_id: 'disc-aconselhamento-1',
    disciplina_name: 'Aconselhamento Pastoral e Cuidado da Alma',
    titulo: 'Simulação de Escuta Empática: Lidando com o Luto e a Crise de Fé',
    tipo_pratica: 'aconselhamento',
    texto_biblico: 'Salmo 23; 2 Coríntios 1:3-7',
    esboco_resumo: '1. Validação do Sentimento de Dor\n2. Presença Compassiva antes do Discurso Racional\n3. Recondução à Promessa da Presença do Bom Pastor',
    midia_tipo: 'link_externo',
    midia_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duracao_segundos: 360,
    status: 'publicado',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    peer_reviews_count: 2,
    media_fidelidade: 5.0,
    media_comunicacao: 4.8,
    media_aplicacao: 4.9,
    media_geral_pares: 4.9,
  }
];

const SEED_REVIEWS: PeerReviewHomiletica[] = [
  {
    id: 'seed-rev-1',
    pratica_id: 'seed-hom-1',
    revisor_email: 'tondedez@gmail.com',
    revisor_nome: 'Ton de Dez',
    nota_fidelidade: 5,
    nota_comunicacao: 4,
    nota_aplicacao: 5,
    ponto_forte: 'Excelente fidelidade ao contexto exegético de Romanos 8 e ênfase cristocêntrica.',
    oportunidade_melhoria: 'Trabalhar um pouco mais as variações de tom de voz nas transições dos tópicos.',
    comentario_geral: 'Sermão muito edificante, clareza lógica impecável e ótima aplicação para a igreja local.',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  }
];

// ============================================================================
// CONSULTAS E LISTAGENS
// ============================================================================

export async function getPraticas(disciplinaId?: string, forceRefresh = false): Promise<PraticaHomiletica[]> {
  if (!forceRefresh) {
    const cached = lerCache<PraticaHomiletica>(CACHE_PRATICAS_KEY);
    if (cached && cached.length > 0) {
      return disciplinaId ? cached.filter((p) => p.disciplina_id === disciplinaId) : cached;
    }
  }

  try {
    let query = supabase
      .from('lms_homiletica_praticas')
      .select('*, lms_homiletica_peer_reviews(*), lms_homiletica_avaliacoes_docente(*)')
      .eq('status', 'publicado')
      .order('created_at', { ascending: false });

    if (disciplinaId) {
      query = query.eq('disciplina_id', disciplinaId);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (data && data.length > 0) {
      const formatadas: PraticaHomiletica[] = data.map((item: any) => {
        const reviews: PeerReviewHomiletica[] = item.lms_homiletica_peer_reviews || [];
        const avaliacaoDocente = item.lms_homiletica_avaliacoes_docente?.[0] || undefined;

        let mediaFid = 0;
        let mediaCom = 0;
        let mediaApl = 0;
        let mediaGeral = 0;

        if (reviews.length > 0) {
          mediaFid = reviews.reduce((acc, r) => acc + (r.nota_fidelidade || 0), 0) / reviews.length;
          mediaCom = reviews.reduce((acc, r) => acc + (r.nota_comunicacao || 0), 0) / reviews.length;
          mediaApl = reviews.reduce((acc, r) => acc + (r.nota_aplicacao || 0), 0) / reviews.length;
          mediaGeral = (mediaFid + mediaCom + mediaApl) / 3;
        }

        return {
          id: item.id,
          aluno_email: item.aluno_email,
          aluno_nome: item.aluno_nome,
          aluno_avatar: item.aluno_avatar,
          disciplina_id: item.disciplina_id,
          disciplina_name: item.disciplina_name,
          titulo: item.titulo,
          tipo_pratica: item.tipo_pratica as TipoPraticaHomiletica,
          texto_biblico: item.texto_biblico,
          esboco_resumo: item.esboco_resumo,
          midia_tipo: item.midia_tipo as TipoMidiaPratica,
          midia_url: item.midia_url,
          duracao_segundos: item.duracao_segundos || 0,
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          peer_reviews_count: reviews.length,
          media_fidelidade: Number(mediaFid.toFixed(1)),
          media_comunicacao: Number(mediaCom.toFixed(1)),
          media_aplicacao: Number(mediaApl.toFixed(1)),
          media_geral_pares: Number(mediaGeral.toFixed(2)),
          avaliacao_docente: avaliacaoDocente,
        };
      });

      salvarCache(CACHE_PRATICAS_KEY, formatadas);
      return formatadas;
    }
  } catch (err) {
    console.warn('[HomileticaService] Supabase indisponível, usando fallback local.');
  }

  // Fallback para SEED inicial
  salvarCache(CACHE_PRATICAS_KEY, SEED_PRATICAS);
  return disciplinaId ? SEED_PRATICAS.filter((p) => p.disciplina_id === disciplinaId) : SEED_PRATICAS;
}

export async function getPeerReviewsDaPratica(praticaId: string): Promise<PeerReviewHomiletica[]> {
  try {
    const { data, error } = await supabase
      .from('lms_homiletica_peer_reviews')
      .select('*')
      .eq('pratica_id', praticaId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as PeerReviewHomiletica[];
    }
  } catch {}

  const local = lerCache<PeerReviewHomiletica>(CACHE_REVIEWS_KEY) || SEED_REVIEWS;
  return local.filter((r) => r.pratica_id === praticaId);
}

// ============================================================================
// CRIAÇÃO E PUBLICAÇÃO DE PRÁTICA
// ============================================================================

export interface NovaPraticaPayload {
  aluno_email: string;
  aluno_nome: string;
  aluno_avatar?: string;
  disciplina_id: string;
  disciplina_name?: string;
  titulo: string;
  tipo_pratica: TipoPraticaHomiletica;
  texto_biblico?: string;
  esboco_resumo?: string;
  midia_tipo: TipoMidiaPratica;
  midia_url?: string;
  duracao_segundos?: number;
}

export async function publicarPratica(payload: NovaPraticaPayload): Promise<PraticaHomiletica> {
  const novaPratica: PraticaHomiletica = {
    id: crypto.randomUUID(),
    aluno_email: payload.aluno_email.toLowerCase(),
    aluno_nome: payload.aluno_nome,
    aluno_avatar: payload.aluno_avatar,
    disciplina_id: payload.disciplina_id,
    disciplina_name: payload.disciplina_name,
    titulo: payload.titulo,
    tipo_pratica: payload.tipo_pratica,
    texto_biblico: payload.texto_biblico,
    esboco_resumo: payload.esboco_resumo,
    midia_tipo: payload.midia_tipo,
    midia_url: payload.midia_url,
    duracao_segundos: payload.duracao_segundos || 0,
    status: 'publicado',
    created_at: new Date().toISOString(),
    peer_reviews_count: 0,
    media_fidelidade: 0,
    media_comunicacao: 0,
    media_aplicacao: 0,
    media_geral_pares: 0,
  };

  // Salva no cache local imediatamente
  const cached = lerCache<PraticaHomiletica>(CACHE_PRATICAS_KEY) || SEED_PRATICAS;
  salvarCache(CACHE_PRATICAS_KEY, [novaPratica, ...cached]);

  // Persiste no Supabase
  try {
    const { data, error } = await supabase
      .from('lms_homiletica_praticas')
      .insert({
        id: novaPratica.id,
        aluno_email: novaPratica.aluno_email,
        aluno_nome: novaPratica.aluno_nome,
        aluno_avatar: novaPratica.aluno_avatar,
        disciplina_id: novaPratica.disciplina_id,
        disciplina_name: novaPratica.disciplina_name,
        titulo: novaPratica.titulo,
        tipo_pratica: novaPratica.tipo_pratica,
        texto_biblico: novaPratica.texto_biblico,
        esboco_resumo: novaPratica.esboco_resumo,
        midia_tipo: novaPratica.midia_tipo,
        midia_url: novaPratica.midia_url,
        duracao_segundos: novaPratica.duracao_segundos,
        status: 'publicado',
      })
      .select()
      .single();

    if (!error && data) {
      invalidarCache(CACHE_PRATICAS_KEY);
      return data as PraticaHomiletica;
    }
  } catch (err) {
    console.warn('[HomileticaService] Prática salva localmente (offline).');
  }

  return novaPratica;
}

// ============================================================================
// AVALIAÇÃO POR PARES (PEER REVIEW)
// ============================================================================

export interface NovoPeerReviewPayload {
  pratica_id: string;
  revisor_email: string;
  revisor_nome: string;
  nota_fidelidade: number;
  nota_comunicacao: number;
  nota_aplicacao: number;
  ponto_forte?: string;
  oportunidade_melhoria?: string;
  comentario_geral: string;
}

export async function salvarPeerReview(payload: NovoPeerReviewPayload): Promise<PeerReviewHomiletica> {
  const novoReview: PeerReviewHomiletica = {
    id: crypto.randomUUID(),
    pratica_id: payload.pratica_id,
    revisor_email: payload.revisor_email.toLowerCase(),
    revisor_nome: payload.revisor_nome,
    nota_fidelidade: payload.nota_fidelidade,
    nota_comunicacao: payload.nota_comunicacao,
    nota_aplicacao: payload.nota_aplicacao,
    ponto_forte: payload.ponto_forte,
    oportunidade_melhoria: payload.oportunidade_melhoria,
    comentario_geral: payload.comentario_geral,
    created_at: new Date().toISOString(),
  };

  // Salva no cache local
  const cachedReviews = lerCache<PeerReviewHomiletica>(CACHE_REVIEWS_KEY) || SEED_REVIEWS;
  const filtered = cachedReviews.filter(
    (r) => !(r.pratica_id === payload.pratica_id && r.revisor_email === payload.revisor_email.toLowerCase())
  );
  salvarCache(CACHE_REVIEWS_KEY, [novoReview, ...filtered]);
  invalidarCache(CACHE_PRATICAS_KEY);

  // Upsert no Supabase
  try {
    await supabase.from('lms_homiletica_peer_reviews').upsert(
      {
        pratica_id: payload.pratica_id,
        revisor_email: payload.revisor_email.toLowerCase(),
        revisor_nome: payload.revisor_nome,
        nota_fidelidade: payload.nota_fidelidade,
        nota_comunicacao: payload.nota_comunicacao,
        nota_aplicacao: payload.nota_aplicacao,
        ponto_forte: payload.ponto_forte,
        oportunidade_melhoria: payload.oportunidade_melhoria,
        comentario_geral: payload.comentario_geral,
      },
      { onConflict: 'pratica_id,revisor_email' }
    );
  } catch (err) {
    console.warn('[HomileticaService] Peer review salvo localmente (offline).');
  }

  return novoReview;
}

// ============================================================================
// AVALIAÇÃO DOCENTE MEDIADORA
// ============================================================================

export interface NovaAvaliacaoDocentePayload {
  pratica_id: string;
  avaliador_email: string;
  avaliador_nome: string;
  avaliador_role: string;
  nota_exegese: number;
  nota_estrutura: number;
  nota_postura: number;
  feedback_mediador: string;
}

export async function salvarAvaliacaoDocente(payload: NovaAvaliacaoDocentePayload): Promise<AvaliacaoDocenteHomiletica> {
  const notaFinal = Number(((payload.nota_exegese * 0.4) + (payload.nota_estrutura * 0.3) + (payload.nota_postura * 0.3)).toFixed(2));

  const novaAvaliacao: AvaliacaoDocenteHomiletica = {
    id: crypto.randomUUID(),
    pratica_id: payload.pratica_id,
    avaliador_email: payload.avaliador_email.toLowerCase(),
    avaliador_nome: payload.avaliador_nome,
    avaliador_role: payload.avaliador_role,
    nota_exegese: payload.nota_exegese,
    nota_estrutura: payload.nota_estrutura,
    nota_postura: payload.nota_postura,
    nota_final: notaFinal,
    feedback_mediador: payload.feedback_mediador,
    created_at: new Date().toISOString(),
  };

  invalidarCache(CACHE_PRATICAS_KEY);

  try {
    await supabase.from('lms_homiletica_avaliacoes_docente').upsert(
      {
        pratica_id: payload.pratica_id,
        avaliador_email: payload.avaliador_email.toLowerCase(),
        avaliador_nome: payload.avaliador_nome,
        avaliador_role: payload.avaliador_role,
        nota_exegese: payload.nota_exegese,
        nota_estrutura: payload.nota_estrutura,
        nota_postura: payload.nota_postura,
        nota_final: notaFinal,
        feedback_mediador: payload.feedback_mediador,
      },
      { onConflict: 'pratica_id,avaliador_email' }
    );
  } catch (err) {
    console.warn('[HomileticaService] Avaliação docente salva em fallback.');
  }

  return novaAvaliacao;
}

// ============================================================================
// MÉTRICAS CIENTÍFICAS E EXPORTAÇÃO CSV PARA O TCC
// ============================================================================

export async function getResumoEstatisticoHomiletica(): Promise<ResumoEstatisticoHomiletica> {
  const praticas = await getPraticas();
  const totalPraticas = praticas.length;
  const totalReviews = praticas.reduce((acc, p) => acc + (p.peer_reviews_count || 0), 0);
  const totalDocentes = praticas.filter((p) => !!p.avaliacao_docente).length;

  const praticasComReview = praticas.filter((p) => (p.peer_reviews_count || 0) > 0);
  const mediaFid = praticasComReview.length > 0
    ? praticasComReview.reduce((acc, p) => acc + (p.media_fidelidade || 0), 0) / praticasComReview.length
    : 0;
  const mediaCom = praticasComReview.length > 0
    ? praticasComReview.reduce((acc, p) => acc + (p.media_comunicacao || 0), 0) / praticasComReview.length
    : 0;
  const mediaApl = praticasComReview.length > 0
    ? praticasComReview.reduce((acc, p) => acc + (p.media_aplicacao || 0), 0) / praticasComReview.length
    : 0;

  return {
    total_praticas: totalPraticas,
    total_peer_reviews: totalReviews,
    total_avaliacoes_docentes: totalDocentes,
    media_geral_fidelidade: Number(mediaFid.toFixed(2)),
    media_geral_comunicacao: Number(mediaCom.toFixed(2)),
    media_geral_aplicacao: Number(mediaApl.toFixed(2)),
    praticas_com_mais_reviews: [...praticas].sort((a, b) => (b.peer_reviews_count || 0) - (a.peer_reviews_count || 0)).slice(0, 5),
  };
}

export function exportarPesquisaHomileticaCSV(praticas: PraticaHomiletica[]): void {
  const headers = [
    'ID Prática',
    'Aluno (Nome)',
    'Aluno (E-mail)',
    'Disciplina',
    'Tipo Prática',
    'Título',
    'Texto Bíblico',
    'Tipo Mídia',
    'Duração (segundos)',
    'Total Peer Reviews',
    'Média Fidelidade (1-5)',
    'Média Comunicação (1-5)',
    'Média Aplicação (1-5)',
    'Média Geral Pares',
    'Nota Docente Final',
    'Data Publicação',
  ].join(',');

  const rows = praticas.map((p) => [
    `"${p.id}"`,
    `"${p.aluno_nome}"`,
    `"${p.aluno_email}"`,
    `"${p.disciplina_name || ''}"`,
    `"${p.tipo_pratica}"`,
    `"${p.titulo.replace(/"/g, '""')}"`,
    `"${p.texto_biblico || ''}"`,
    `"${p.midia_tipo}"`,
    p.duracao_segundos,
    p.peer_reviews_count || 0,
    p.media_fidelidade || 0,
    p.media_comunicacao || 0,
    p.media_aplicacao || 0,
    p.media_geral_pares || 0,
    p.avaliacao_docente?.nota_final || 'N/A',
    `"${new Date(p.created_at).toLocaleString('pt-BR')}"`,
  ].join(','));

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `lms_pesquisa_homiletica_peer_instruction_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
