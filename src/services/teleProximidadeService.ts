/**
 * teleProximidadeService.ts
 * =========================================================================
 * MÓDULO 5: TELE-PROXIMIDADE (Learning Analytics Anti-Evasão)
 *
 * Fundamentação Teórica: Tele-Social Presença (TSP) — Chryssa Themelis, 2022
 * "A comunhão e o sucesso de um ambiente virtual dependem da frequência das
 * interações sociais síncronas e assíncronas para gerar confiança e grupo coeso."
 *
 * Este serviço:
 * 1. Lê dados das fontes existentes (sessões, eventos, fórum, oração)
 * 2. Calcula o Score de Engajamento (0-100) por aluno
 * 3. Determina o Nível de Risco com base em thresholds pedagógicos
 * 4. Persiste alertas na tabela lms_isolation_alerts (Supabase)
 * 5. Exporta dados CSV para evidências empíricas do TCC
 * =========================================================================
 */

import { supabase } from '@/lib/supabaseClient';
import { INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';
import {
  NivelRiscoIsolamento,
  PerfilEngajamentoAluno,
  AlertaIsolamento,
  TeleProximidadeSummary,
} from '@/types';

// ============================================================================
// CONSTANTES E THRESHOLDS PEDAGÓGICOS
// ============================================================================

/** Dias sem login que disparam cada nível de alerta */
const THRESHOLD_CRITICO_DIAS = 7;
const THRESHOLD_ATENCAO_DIAS = 3;

/** Scores de engajamento para cada nível */
const SCORE_CRITICO_MAX = 20;
const SCORE_ATENCAO_MAX = 45;
const SCORE_MONITORAR_MAX = 70;

/** Pesos de cada componente no score total (soma = 100) */
const PESO_LOGIN = 40;
const PESO_FORUM = 25;
const PESO_ORACAO = 15;
const PESO_MEET_DRIVE = 20;

/** Chave de cache local para resiliência offline */
const CACHE_KEY = 'lms_tele_proximidade_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutos

// ============================================================================
// HELPERS DE TEMPO
// ============================================================================

function diasDesde(isoTimestamp?: string | null): number {
  if (!isoTimestamp) return 999;
  const diff = Date.now() - new Date(isoTimestamp).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function isoMinus7Days(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString();
}

function isoMinus14Days(): string {
  const d = new Date();
  d.setDate(d.getDate() - 14);
  return d.toISOString();
}

// ============================================================================
// ALGORITMO DE SCORE DE ENGAJAMENTO (0-100)
// ============================================================================

/**
 * Calcula o score de engajamento composto baseado nos 4 componentes da TSP.
 *
 * Componente 1 — Login (peso: 40pts)
 *   - Logou nos últimos 7 dias: 40 pts
 *   - Logou nos últimos 14 dias: 20 pts
 *   - Nunca/mais de 14 dias: 0 pts
 *
 * Componente 2 — Fórum (peso: 25pts)
 *   - ≥3 interações nos últimos 7 dias: 25 pts
 *   - 1-2 interações: 12 pts
 *   - 0 interações: 0 pts
 *
 * Componente 3 — Mural de Oração (peso: 15pts)
 *   - ≥2 interações nos últimos 7 dias: 15 pts
 *   - 1 interação: 8 pts
 *   - 0 interações: 0 pts
 *
 * Componente 4 — Meet / Drive (peso: 20pts)
 *   - ≥2 acessos nos últimos 7 dias: 20 pts
 *   - 1 acesso: 10 pts
 *   - 0 acessos: 0 pts
 */
function calcularScore(
  diasSemLogin: number,
  forum7d: number,
  oracoes7d: number,
  meetDrive7d: number,
): number {
  // Componente 1: Login
  let scoreLogin = 0;
  if (diasSemLogin <= 7) scoreLogin = PESO_LOGIN;
  else if (diasSemLogin <= 14) scoreLogin = Math.round(PESO_LOGIN * 0.5);

  // Componente 2: Fórum
  let scoreForum = 0;
  if (forum7d >= 3) scoreForum = PESO_FORUM;
  else if (forum7d >= 1) scoreForum = Math.round(PESO_FORUM * 0.5);

  // Componente 3: Oração
  let scoreOracao = 0;
  if (oracoes7d >= 2) scoreOracao = PESO_ORACAO;
  else if (oracoes7d >= 1) scoreOracao = Math.round(PESO_ORACAO * 0.5);

  // Componente 4: Meet/Drive
  let scoreMeet = 0;
  if (meetDrive7d >= 2) scoreMeet = PESO_MEET_DRIVE;
  else if (meetDrive7d >= 1) scoreMeet = Math.round(PESO_MEET_DRIVE * 0.5);

  return scoreLogin + scoreForum + scoreOracao + scoreMeet;
}

function determinarNivelRisco(
  diasSemLogin: number,
  score: number,
): NivelRiscoIsolamento {
  if (diasSemLogin >= THRESHOLD_CRITICO_DIAS || score <= SCORE_CRITICO_MAX) {
    return 'critico';
  }
  if (diasSemLogin >= THRESHOLD_ATENCAO_DIAS || score <= SCORE_ATENCAO_MAX) {
    return 'atencao';
  }
  if (score <= SCORE_MONITORAR_MAX) {
    return 'monitorar';
  }
  return 'engajado';
}

// ============================================================================
// FONTE DE DADOS: LISTA DE ALUNOS MONITORADOS
// ============================================================================

/**
 * Retorna a lista de e-mails de todos os alunos autorizados no sistema.
 * Filtramos pelo papel 'aluno' usando a lista em memória como fallback.
 */
async function getAlunosMonitorados(): Promise<Array<{ email: string; nome: string; avatar?: string }>> {
  // 1. Tenta buscar alunos diretamente do Supabase (tabela users)
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email, full_name, avatar_url')
      .eq('role', 'aluno');

    if (!error && data && data.length > 0) {
      return data.map((u) => ({
        email: u.email,
        nome: u.full_name || u.email.split('@')[0],
        avatar: u.avatar_url || undefined,
      }));
    }
  } catch (_) {
    // fallthrough para lista local
  }

  // 2. Fallback: usa lista em memória filtrada por papel 'aluno'
  return Object.values(INITIAL_AUTHORIZED_USERS)
    .filter((u) => u.defaultRole === 'aluno' || (u.roles && u.roles.includes('aluno') && u.roles.length === 1))
    .map((u) => ({
      email: u.email,
      nome: u.name || u.email.split('@')[0],
      avatar: u.avatarUrl || undefined,
    }));
}

// ============================================================================
// COLETA DE DADOS: SESSÕES (LOGINS)
// ============================================================================

async function getSessoesAluno(
  email: string,
  desde: string,
): Promise<{ ultima_sessao: string | null; count: number }> {
  try {
    const { data, error } = await supabase
      .from('lms_user_sessions')
      .select('started_at, last_heartbeat_at')
      .eq('user_email', email.toLowerCase())
      .gte('started_at', desde)
      .order('started_at', { ascending: false });

    if (error || !data) throw error;

    const ultima = data[0]?.last_heartbeat_at || data[0]?.started_at || null;
    return { ultima_sessao: ultima, count: data.length };
  } catch (_) {
    // Fallback: verifica localStorage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('lms_telemetry_sessions_cache');
        if (raw) {
          const sessions = JSON.parse(raw) as Array<{ user_email: string; started_at: string; last_heartbeat_at: string }>;
          const minhas = sessions.filter(
            (s) => s.user_email.toLowerCase() === email.toLowerCase()
              && new Date(s.started_at) >= new Date(desde),
          );
          const ultima = minhas[0]?.last_heartbeat_at || minhas[0]?.started_at || null;
          return { ultima_sessao: ultima, count: minhas.length };
        }
      } catch (_) {}
    }
    return { ultima_sessao: null, count: 0 };
  }
}

// ============================================================================
// COLETA DE DADOS: EVENTOS DE TELEMETRIA (MEET / DRIVE)
// ============================================================================

async function getEventosMeetDriveAluno(
  email: string,
  desde: string,
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('lms_analytics_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_email', email.toLowerCase())
      .in('category', ['meet', 'drive'])
      .gte('timestamp', desde);

    if (error) throw error;
    return count || 0;
  } catch (_) {
    // Fallback: localStorage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('lms_telemetry_events_cache');
        if (raw) {
          const events = JSON.parse(raw) as Array<{ user_email: string; category: string; timestamp: string }>;
          return events.filter(
            (e) => e.user_email.toLowerCase() === email.toLowerCase()
              && (e.category === 'meet' || e.category === 'drive')
              && new Date(e.timestamp) >= new Date(desde),
          ).length;
        }
      } catch (_) {}
    }
    return 0;
  }
}

// ============================================================================
// COLETA DE DADOS: FÓRUM (TÓPICOS + RESPOSTAS)
// ============================================================================

async function getForumAluno(email: string, desde: string): Promise<number> {
  try {
    const emailLower = email.toLowerCase();

    const [topicsRes, repliesRes] = await Promise.all([
      supabase
        .from('lms_forum_topics')
        .select('id', { count: 'exact', head: true })
        .eq('autor_email', emailLower)
        .gte('criado_em', desde),
      supabase
        .from('lms_forum_replies')
        .select('id', { count: 'exact', head: true })
        .eq('autor_email', emailLower)
        .gte('criado_em', desde),
    ]);

    const topics = topicsRes.count || 0;
    const replies = repliesRes.count || 0;
    return topics + replies;
  } catch (_) {
    // Fallback: localStorage cache do collaborationService
    if (typeof window !== 'undefined') {
      try {
        let total = 0;
        const rawTopics = localStorage.getItem('lms_collab_topics_cache');
        if (rawTopics) {
          const topics = JSON.parse(rawTopics) as Array<{ autor_email: string; criado_em: string }>;
          total += topics.filter(
            (t) => t.autor_email.toLowerCase() === email.toLowerCase()
              && new Date(t.criado_em) >= new Date(desde),
          ).length;
        }
        const rawReplies = localStorage.getItem('lms_collab_replies_cache');
        if (rawReplies) {
          const replies = JSON.parse(rawReplies) as Array<{ autor_email: string; criado_em: string }>;
          total += replies.filter(
            (r) => r.autor_email.toLowerCase() === email.toLowerCase()
              && new Date(r.criado_em) >= new Date(desde),
          ).length;
        }
        return total;
      } catch (_) {}
    }
    return 0;
  }
}

// ============================================================================
// COLETA DE DADOS: MURAL DE ORAÇÃO (PEDIDOS + INTERCESSÕES)
// ============================================================================

async function getOracoesAluno(email: string, desde: string): Promise<number> {
  try {
    const emailLower = email.toLowerCase();
    let total = 0;

    // Pedidos criados pelo aluno
    const { count: pedidos } = await supabase
      .from('lms_prayer_cards')
      .select('id', { count: 'exact', head: true })
      .eq('autor_email', emailLower)
      .gte('criado_em', desde);
    total += pedidos || 0;

    // Intercessões (o e-mail está dentro do array intercessores)
    const { data: cards } = await supabase
      .from('lms_prayer_cards')
      .select('intercessores, criado_em')
      .gte('criado_em', desde);

    if (cards) {
      total += cards.filter((c) =>
        Array.isArray(c.intercessores) &&
        c.intercessores.some((e: string) => e.toLowerCase() === emailLower),
      ).length;
    }

    return total;
  } catch (_) {
    // Fallback: localStorage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('lms_collab_prayers_cache');
        if (raw) {
          const cards = JSON.parse(raw) as Array<{
            autor_email: string;
            intercessores: string[];
            criado_em: string;
          }>;
          return cards.filter(
            (c) =>
              new Date(c.criado_em) >= new Date(desde) &&
              (c.autor_email.toLowerCase() === email.toLowerCase() ||
                c.intercessores.some((e) => e.toLowerCase() === email.toLowerCase())),
          ).length;
        }
      } catch (_) {}
    }
    return 0;
  }
}

// ============================================================================
// FUNÇÃO PRINCIPAL: CALCULAR PERFIL DE ENGAJAMENTO
// ============================================================================

async function calcularPerfilAluno(
  aluno: { email: string; nome: string; avatar?: string },
): Promise<PerfilEngajamentoAluno> {
  const desde7d = isoMinus7Days();
  const desde14d = isoMinus14Days();

  // Coleta paralela de dados (performance)
  const [sessoes7d, sessoes14d, meetDrive7d, forum7d, oracoes7d, forum14d] =
    await Promise.all([
      getSessoesAluno(aluno.email, desde7d),
      getSessoesAluno(aluno.email, desde14d),
      getEventosMeetDriveAluno(aluno.email, desde7d),
      getForumAluno(aluno.email, desde7d),
      getOracoesAluno(aluno.email, desde7d),
      getForumAluno(aluno.email, desde14d),
    ]);

  // Data da última atividade (a mais recente entre sessão e eventos)
  const ultimaAtividade = sessoes7d.ultima_sessao || sessoes14d.ultima_sessao || undefined;
  const diasSemLogin = diasDesde(ultimaAtividade);

  // Score atual (7 dias)
  const score7d = calcularScore(diasSemLogin, forum7d, oracoes7d, meetDrive7d);

  // Score período anterior (14 dias - estima "semana passada")
  const score14d = calcularScore(
    diasDesde(sessoes14d.ultima_sessao),
    Math.max(0, forum14d - forum7d),
    0, // não temos dado segregado de oração por período anterior
    0,
  );

  // Tendência comparativa
  let tendencia: 'melhorando' | 'estavel' | 'piorando' = 'estavel';
  if (score7d > score14d + 10) tendencia = 'melhorando';
  else if (score7d < score14d - 10) tendencia = 'piorando';

  const nivelRisco = determinarNivelRisco(diasSemLogin, score7d);

  return {
    aluno_email: aluno.email.toLowerCase(),
    aluno_nome: aluno.nome,
    avatar_url: aluno.avatar,
    nivel_risco: nivelRisco,
    score_engajamento: score7d,
    ultima_sessao: sessoes7d.ultima_sessao || sessoes14d.ultima_sessao || undefined,
    dias_sem_login: diasSemLogin,
    total_eventos_7d: sessoes7d.count,
    total_forum_7d: forum7d,
    total_oracoes_7d: oracoes7d,
    total_meet_joins_7d: meetDrive7d,
    ultima_atividade: ultimaAtividade,
    tendencia,
  };
}

// ============================================================================
// FUNÇÃO PÚBLICA: CALCULAR SUMMARY COMPLETO
// ============================================================================

/**
 * Calcula o resumo completo de Tele-Proximidade para todos os alunos.
 * Inclui cache local de 10 minutos para evitar sobrecarga do Supabase.
 */
export async function getTeleProximidadeSummary(
  forceRefresh = false,
): Promise<TeleProximidadeSummary> {
  // Verifica cache
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as { ts: number; data: TeleProximidadeSummary };
        if (Date.now() - cached.ts < CACHE_TTL_MS) {
          return cached.data;
        }
      }
    } catch (_) {}
  }

  const alunos = await getAlunosMonitorados();
  const perfis = await Promise.all(alunos.map(calcularPerfilAluno));

  // Busca alertas abertos persistidos
  let alertasAbertos: AlertaIsolamento[] = [];
  try {
    const { data } = await supabase
      .from('lms_isolation_alerts')
      .select('*')
      .eq('resolvido', false)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) alertasAbertos = data as AlertaIsolamento[];
  } catch (_) {}

  const summary: TeleProximidadeSummary = {
    total_alunos_monitorados: perfis.length,
    alunos_criticos: perfis.filter((p) => p.nivel_risco === 'critico').length,
    alunos_atencao: perfis.filter((p) => p.nivel_risco === 'atencao').length,
    alunos_monitorar: perfis.filter((p) => p.nivel_risco === 'monitorar').length,
    alunos_engajados: perfis.filter((p) => p.nivel_risco === 'engajado').length,
    taxa_engajamento_geral:
      perfis.length > 0
        ? Math.round(
            perfis.reduce((acc, p) => acc + p.score_engajamento, 0) / perfis.length,
          )
        : 0,
    perfis: perfis.sort((a, b) => a.score_engajamento - b.score_engajamento), // Mais críticos primeiro
    alertas_abertos: alertasAbertos,
  };

  // Salva no cache local
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: summary }));
    } catch (_) {}
  }

  // Auto-gera alertas para alunos críticos que ainda não têm alerta aberto
  autoGerarAlertas(summary.perfis, alertasAbertos).catch(() => {});

  return summary;
}

// ============================================================================
// AUTO-GERAÇÃO DE ALERTAS (IDEMPOTENTE)
// ============================================================================

async function autoGerarAlertas(
  perfis: PerfilEngajamentoAluno[],
  alertasExistentes: AlertaIsolamento[],
): Promise<void> {
  const emailsComAlertaAberto = new Set(
    alertasExistentes.map((a) => a.aluno_email.toLowerCase()),
  );

  const novasEntradas = perfis
    .filter(
      (p) =>
        (p.nivel_risco === 'critico' || p.nivel_risco === 'atencao') &&
        !emailsComAlertaAberto.has(p.aluno_email.toLowerCase()),
    )
    .map((p) => ({
      aluno_email: p.aluno_email,
      aluno_nome: p.aluno_nome,
      nivel_risco: p.nivel_risco,
      dias_sem_login: p.dias_sem_login,
      dias_sem_forum: p.total_forum_7d === 0 ? 7 : 0,
      dias_sem_oracao: p.total_oracoes_7d === 0 ? 7 : 0,
      score_engajamento: p.score_engajamento,
      ultima_atividade: p.ultima_atividade || null,
      resolvido: false,
    }));

  if (novasEntradas.length === 0) return;

  try {
    await supabase.from('lms_isolation_alerts').insert(novasEntradas);
  } catch (_) {
    // Silencioso — não bloqueia a UI
  }
}

// ============================================================================
// AÇÃO PEDAGÓGICA: REGISTRAR CONTATO COM ALUNO
// ============================================================================

/**
 * Professores e monitores registram a ação tomada para resgatar o aluno.
 */
export async function registrarAcaoPedagogica(
  alertaId: string,
  professorEmail: string,
  acaoTomada: string,
  marcarResolvido: boolean,
): Promise<void> {
  const update: Record<string, unknown> = {
    professor_email: professorEmail,
    acao_tomada: acaoTomada,
    updated_at: new Date().toISOString(),
  };
  if (marcarResolvido) update.resolvido = true;

  const { error } = await supabase
    .from('lms_isolation_alerts')
    .update(update)
    .eq('id', alertaId);

  if (error) throw new Error(`Erro ao registrar ação: ${error.message}`);

  // Invalida cache local
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (_) {}
  }
}

// ============================================================================
// EXPORTAÇÃO CSV (EVIDÊNCIA EMPÍRICA PARA TCC)
// ============================================================================

/**
 * Gera CSV com todos os perfis de engajamento para uso como dado empírico no TCC.
 * Segue metodologia de Learning Analytics (Themelis, 2022).
 */
export function exportarTSPCsv(perfis: PerfilEngajamentoAluno[]): string {
  const headers = [
    'Email do Aluno',
    'Nome',
    'Nível de Risco TSP',
    'Score de Engajamento (0-100)',
    'Dias Sem Login',
    'Interações no Fórum (7d)',
    'Interações no Mural de Oração (7d)',
    'Acessos Meet/Drive (7d)',
    'Última Atividade',
    'Tendência',
  ].join(',');

  const rows = perfis.map((p) =>
    [
      `"${p.aluno_email}"`,
      `"${p.aluno_nome}"`,
      `"${p.nivel_risco}"`,
      p.score_engajamento,
      p.dias_sem_login === 999 ? '"Nunca logou"' : p.dias_sem_login,
      p.total_forum_7d,
      p.total_oracoes_7d,
      p.total_meet_joins_7d,
      p.ultima_atividade ? `"${new Date(p.ultima_atividade).toLocaleString('pt-BR')}"` : '"Sem registro"',
      `"${p.tendencia}"`,
    ].join(','),
  );

  return [headers, ...rows].join('\n');
}

export function downloadTSPCsv(perfis: PerfilEngajamentoAluno[]): void {
  const csv = exportarTSPCsv(perfis);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `lms_tele_proximidade_tsp_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
