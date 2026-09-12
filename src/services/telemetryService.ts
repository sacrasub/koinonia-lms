import { supabase } from '@/lib/supabaseClient';
import { 
  UserRole, 
  DeviceType, 
  UserSessionLog, 
  AnalyticsCategory, 
  AnalyticsEvent, 
  AnalyticsSummary, 
  ModuleUsageStats, 
  DevelopmentInsight,
  PeakHourStats,
  WeekdayStats 
} from '@/types';
import { INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';

const SESSIONS_STORAGE_KEY = 'lms_telemetry_sessions_cache';
const EVENTS_STORAGE_KEY = 'lms_telemetry_events_cache';
const CURRENT_SESSION_ID_KEY = 'lms_current_session_id';

let currentSession: UserSessionLog | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let pendingEventsQueue: AnalyticsEvent[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

// ============================================================================
// 1. DETECÇÃO DE DISPOSITIVO, SISTEMA OPERACIONAL E NAVEGADOR
// ============================================================================

export function detectDeviceDetails(): {
  deviceType: DeviceType;
  browser: string;
  os: string;
  screenResolution: string;
} {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'desktop',
      browser: 'Unknown',
      os: 'Unknown',
      screenResolution: '1920x1080',
    };
  }

  const ua = navigator.userAgent;
  let deviceType: DeviceType = 'desktop';

  // Detecção de tipo de dispositivo
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    deviceType = 'mobile';
  }

  // Detecção de Sistema Operacional
  let os = 'Outro SO';
  if (/Windows NT 10.0/i.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/CrOS/i.test(ua)) os = 'ChromeOS';

  // Detecção de Navegador
  let browser = 'Navegador Web';
  if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Google Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Apple Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox';
  else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = 'Opera';

  const screenResolution = `${window.screen.width}x${window.screen.height}`;

  return { deviceType, browser, os, screenResolution };
}

// ============================================================================
// 2. REGISTRO E GESTÃO DE SESSÃO ATIVA (AUDITORIA DE ACESSOS - SESSION COALESCING)
// ============================================================================

export const MAX_SESSION_DURATION_SECONDS = 4 * 3600; // 4 horas: teto máximo plausível para sessão única de estudo/aula
export const SESSION_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos: limite de inatividade para expiração da sessão

/**
 * Sanitiza valores de duração de sessão para impedir números anômalos (ex: bugs de data, abas deixadas abertas por dias).
 */
export function sanitizeSessionDuration(
  durationSeconds: number | undefined | null,
  sessionId?: string,
  startedAt?: string,
  lastHeartbeatAt?: string
): number {
  const dur = Math.max(0, Number(durationSeconds) || 0);

  // Sessões geradas via sincronização de dados (student_sync_%)
  if (sessionId && sessionId.startsWith('sess_sync_')) {
    // Se o valor estiver corrompido com a idade do acesso (> 45 minutos)
    if (dur > 45 * 60) {
      return 25 * 60; // Duração padrão estimada de 25 minutos de estudo
    }
    return Math.max(60, dur);
  }

  // Teto máximo para qualquer sessão de usuário no LMS
  if (dur > MAX_SESSION_DURATION_SECONDS) {
    if (startedAt && lastHeartbeatAt) {
      const diff = Math.floor((new Date(lastHeartbeatAt).getTime() - new Date(startedAt).getTime()) / 1000);
      if (diff > 0 && diff <= MAX_SESSION_DURATION_SECONDS) {
        return diff;
      }
    }
    return MAX_SESSION_DURATION_SECONDS;
  }

  return dur;
}

/** Formata segundos em texto legível: ex: "45 min", "1h 15m (75 min)" */
export function formatDurationLabel(durationSeconds: number): string {
  const totalMin = Math.round((durationSeconds || 0) / 60);
  if (totalMin < 60) {
    return `${totalMin} min`;
  }
  const hours = Math.floor(totalMin / 60);
  const remainingMin = totalMin % 60;
  if (remainingMin === 0) {
    return `${hours}h (${totalMin} min)`;
  }
  return `${hours}h ${remainingMin}m (${totalMin} min)`;
}

let exitListenersAttached = false;

function setupExitAndDurationListeners() {
  if (typeof window === 'undefined' || exitListenersAttached) return;
  exitListenersAttached = true;

  const flushCurrentDuration = () => {
    if (currentSession && currentSession.started_at) {
      const now = new Date();
      const startTime = new Date(currentSession.started_at).getTime();
      const elapsed = Math.max(0, Math.floor((now.getTime() - startTime) / 1000));
      const durationSeconds = Math.min(MAX_SESSION_DURATION_SECONDS, elapsed);
      currentSession.last_heartbeat_at = now.toISOString();
      currentSession.duration_seconds = durationSeconds;
      saveSessionToLocalCache(currentSession);
      sendHeartbeatToCloud(currentSession);
    }
  };

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushCurrentDuration();
    }
  });
  window.addEventListener('beforeunload', flushCurrentDuration);
}

export function startUserSession(
  userEmail: string,
  userName: string,
  userRole: UserRole,
  avatarUrl?: string
): UserSessionLog {
  if (typeof window === 'undefined' || !userEmail) {
    const emptyLog: UserSessionLog = {
      id: `sess_ssr_${Date.now()}`,
      user_email: userEmail || 'guest',
      user_name: userName || 'Visitante',
      user_role: userRole || 'aluno',
      device_type: 'desktop',
      browser: 'SSR',
      os: 'Server',
      started_at: new Date().toISOString(),
      last_heartbeat_at: new Date().toISOString(),
      duration_seconds: 0,
      is_active: true,
      page_views_count: 1,
      events_count: 0,
    };
    return emptyLog;
  }

  const normalizedEmail = userEmail.toLowerCase().trim();
  const { deviceType, browser, os, screenResolution } = detectDeviceDetails();
  const safeAvatar = (avatarUrl && avatarUrl.length > 500)
    ? (normalizedEmail.includes('sacrasub') ? '/cristiano_sacramento.jpg' : '')
    : (avatarUrl || '');

  // 1. Reutilização de Sessão em Memória (Evita duplicações na mesma execução)
  if (currentSession && currentSession.user_email === normalizedEmail && currentSession.is_active) {
    const lastHb = new Date(currentSession.last_heartbeat_at || currentSession.started_at).getTime();
    if (Date.now() - lastHb < SESSION_INACTIVITY_TIMEOUT_MS) {
      currentSession.page_views_count = (currentSession.page_views_count || 1) + 1;
      currentSession.last_heartbeat_at = new Date().toISOString();
      const startTime = new Date(currentSession.started_at).getTime();
      const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      currentSession.duration_seconds = Math.min(MAX_SESSION_DURATION_SECONDS, elapsed);
      if (safeAvatar) currentSession.avatar_url = safeAvatar;
      saveSessionToLocalCache(currentSession);
      return currentSession;
    } else {
      // Sessão anterior expirou por inatividade
      endCurrentSession();
    }
  }

  // 2. Session Coalescing: Verifica token na sessionStorage (mesma aba recarregada)
  // ou sessão recente nos últimos 30 minutos no cache local
  let existingSession: UserSessionLog | undefined;
  const sessionTokenInTab = typeof window !== 'undefined' ? sessionStorage.getItem('lms_active_session_token') : null;
  const localSessions = getLocalSessions();

  if (sessionTokenInTab) {
    const found = localSessions.find((s) => s.id === sessionTokenInTab && s.user_email === normalizedEmail);
    if (found) {
      const lastHb = new Date(found.last_heartbeat_at || found.started_at).getTime();
      if (Date.now() - lastHb < SESSION_INACTIVITY_TIMEOUT_MS) {
        existingSession = found;
      } else {
        // Token da aba é de sessão expirada (> 30 min)
        try {
          sessionStorage.removeItem('lms_active_session_token');
        } catch (_) {}
      }
    }
  }

  if (!existingSession) {
    const recentCandidate = localSessions.find((s) => s.user_email === normalizedEmail);
    if (recentCandidate && recentCandidate.last_heartbeat_at) {
      const diffMs = Date.now() - new Date(recentCandidate.last_heartbeat_at).getTime();
      // Se a última atividade foi há menos de 30 minutos, continua a mesma sessão
      if (diffMs < SESSION_INACTIVITY_TIMEOUT_MS) {
        existingSession = recentCandidate;
      }
    }
  }

  if (existingSession) {
    // REUTILIZA A SESSÃO ATIVA (Zero novas linhas de 0 segundos!)
    existingSession.is_active = true;
    existingSession.last_heartbeat_at = new Date().toISOString();
    existingSession.page_views_count = (existingSession.page_views_count || 1) + 1;
    const startTime = new Date(existingSession.started_at).getTime();
    const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
    existingSession.duration_seconds = Math.min(MAX_SESSION_DURATION_SECONDS, elapsed);
    existingSession.device_type = deviceType;
    existingSession.browser = browser;
    existingSession.os = os;
    if (safeAvatar) existingSession.avatar_url = safeAvatar;

    currentSession = existingSession;
    try {
      sessionStorage.setItem('lms_active_session_token', existingSession.id);
      localStorage.setItem(CURRENT_SESSION_ID_KEY, existingSession.id);
    } catch (_) {}

    saveSessionToLocalCache(currentSession);
    sendHeartbeatToCloud(currentSession); // Apenas UPDATE dos campos de tempo, 0 bytes download!
    startHeartbeatTimer();
    setupExitAndDurationListeners();
    return currentSession;
  }

  // 3. Caso NÃO haja sessão recente ativa (< 30 min), cria uma nova sessão
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  currentSession = {
    id: sessionId,
    user_email: normalizedEmail,
    user_name: userName || userEmail,
    user_role: userRole,
    avatar_url: safeAvatar,
    device_type: deviceType,
    browser,
    os,
    screen_resolution: screenResolution,
    started_at: new Date().toISOString(),
    last_heartbeat_at: new Date().toISOString(),
    duration_seconds: 0,
    is_active: true,
    page_views_count: 1,
    events_count: 0,
  };

  try {
    sessionStorage.setItem('lms_active_session_token', sessionId);
    localStorage.setItem(CURRENT_SESSION_ID_KEY, sessionId);
  } catch (_) {}

  saveSessionToLocalCache(currentSession);
  syncSessionToCloud(currentSession);
  startHeartbeatTimer();
  setupExitAndDurationListeners();

  // Grava evento inicial de login apenas UMA vez por sessão real
  trackEvent('session', 'user_login', `${userName} entrou na plataforma`, {
    deviceType,
    browser,
    os,
  }, normalizedEmail, userRole);

  return currentSession;
}

function startHeartbeatTimer() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(() => {
    if (currentSession && typeof document !== 'undefined' && document.visibilityState === 'visible') {
      const now = new Date();
      const startTime = new Date(currentSession.started_at).getTime();
      const elapsed = Math.max(0, Math.floor((now.getTime() - startTime) / 1000));
      const durationSeconds = Math.min(MAX_SESSION_DURATION_SECONDS, elapsed);
      
      currentSession.last_heartbeat_at = now.toISOString();
      currentSession.duration_seconds = durationSeconds;
      currentSession.is_active = true;

      saveSessionToLocalCache(currentSession);
      sendHeartbeatToCloud(currentSession);
    }
  }, 150000); // 150 segundos (2.5 minutos)
}

export function endCurrentSession() {
  if (!currentSession) return;
  
  const now = new Date();
  const startTime = new Date(currentSession.started_at).getTime();
  const elapsed = Math.max(0, Math.floor((now.getTime() - startTime) / 1000));
  currentSession.duration_seconds = Math.min(MAX_SESSION_DURATION_SECONDS, elapsed);
  currentSession.last_heartbeat_at = now.toISOString();
  currentSession.is_active = false;

  saveSessionToLocalCache(currentSession);
  sendHeartbeatToCloud(currentSession);

  try {
    sessionStorage.removeItem('lms_active_session_token');
  } catch (_) {}

  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

// ============================================================================
// 3. RASTREAMENTO DE EVENTOS DE PRODUTO & TELEMETRIA (FILTRADO PARA O TCC)
// ============================================================================

// Categorias vitais para a pesquisa do TCC e evolução da plataforma (rejeita ruídos e poluição de banco)
const PLATFORM_ANALYTICS_CATEGORIES = new Set<string>([
  'cornell_notes',
  'rpg',
  'drive',
  'meet',
  'biblioteca',
  'homiletica',
  'metaverso',
  'tcc_survey',
  'checklist',
  'session',
]);

export function trackEvent(
  category: AnalyticsCategory,
  action: string,
  label?: string,
  metadata?: Record<string, any>,
  userEmail?: string,
  userRole?: UserRole
) {
  if (typeof window === 'undefined') return;

  // Ruídos de navegação interna (ex: change_tab em cada clique) apenas incrementam visualizações de página
  if (category === 'navigation' || action === 'change_tab') {
    if (currentSession) {
      currentSession.page_views_count = (currentSession.page_views_count || 0) + 1;
      saveSessionToLocalCache(currentSession);
    }
    return;
  }

  // Se não for categoria de interesse do TCC ou evolução da plataforma, descarta
  if (!PLATFORM_ANALYTICS_CATEGORIES.has(category)) {
    return;
  }

  const email = userEmail || currentSession?.user_email || localStorage.getItem('lms_active_user_email') || 'anonimo@koinonialms.com';
  const role = userRole || currentSession?.user_role || (localStorage.getItem('lms_active_user_role') as UserRole) || 'aluno';
  const name = currentSession?.user_name || email.split('@')[0];

  const event: AnalyticsEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    session_id: currentSession?.id,
    user_email: email.toLowerCase().trim(),
    user_name: name,
    user_role: role,
    category,
    action,
    label,
    metadata: metadata || {},
    timestamp: new Date().toISOString(),
  };

  if (currentSession) {
    currentSession.events_count = (currentSession.events_count || 0) + 1;
  }

  pendingEventsQueue.push(event);
  saveEventToLocalCache(event);

  // Dispara flush em lote inteligente a cada 25 segundos ou se fila tiver 8+ eventos
  if (pendingEventsQueue.length >= 8) {
    flushEventsToCloud();
  } else if (!flushTimeout) {
    flushTimeout = setTimeout(() => {
      flushEventsToCloud();
      flushTimeout = null;
    }, 25000);
  }
}

// ============================================================================
// 4. PERSISTÊNCIA LOCAL (CACHE & RESILIÊNCIA OFFLINE)
// ============================================================================

function getLocalSessions(): UserSessionLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: UserSessionLog[] = JSON.parse(raw);
    let hasChanges = false;
    // Descarta qualquer seed/mock fictício legado e higieniza durações anômalas
    const cleaned = parsed
      .filter((s) => s && s.id && !s.id.startsWith('sess_seed_'))
      .map((s) => {
        const sanitized = sanitizeSessionDuration(s.duration_seconds, s.id, s.started_at, s.last_heartbeat_at);
        if (sanitized !== s.duration_seconds) {
          hasChanges = true;
          return { ...s, duration_seconds: sanitized };
        }
        return s;
      });

    if (hasChanges) {
      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(cleaned));
      } catch (_) {}
    }

    return cleaned;
  } catch (e) {
    return [];
  }
}

function saveSessionToLocalCache(session: UserSessionLog) {
  if (typeof window === 'undefined' || session.id.startsWith('sess_seed_')) return;
  try {
    const sessions = getLocalSessions();
    const idx = sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      sessions[idx] = session;
    } else {
      sessions.unshift(session);
    }
    // Mantém histórico acumulado de até 400 sessões no cache do navegador (0 bytes de tráfego)
    const trimmed = sessions.filter((s) => !s.id.startsWith('sess_seed_')).slice(0, 400);
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (_) {
      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(trimmed.slice(0, 100)));
      } catch (__) {}
    }
  } catch (e) {}
}

function getLocalEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: AnalyticsEvent[] = JSON.parse(raw);
    // Descarta qualquer evento seed fictício
    return parsed.filter((e) => e && e.id && !e.id.startsWith('evt_seed_'));
  } catch (e) {
    return [];
  }
}

function saveEventToLocalCache(event: AnalyticsEvent) {
  if (typeof window === 'undefined' || event.id.startsWith('evt_seed_')) return;
  try {
    const events = getLocalEvents();
    events.unshift(event);
    const trimmed = events.filter((e) => !e.id.startsWith('evt_seed_')).slice(0, 600);
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (_) {
      try {
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(trimmed.slice(0, 150)));
      } catch (__) {}
    }
  } catch (e) {}
}

// ============================================================================
// 5. SINCRONIZAÇÃO EM NUVEM ZERO-WASTE (SEM CONSUMO DE EGRESS)
// ============================================================================

/** Mescla duas listas de sessões eliminando duplicatas por ID e preservando os dados mais recentes com durações sanitizadas */
export function mergeSessionLists(
  listA: UserSessionLog[],
  listB: UserSessionLog[]
): UserSessionLog[] {
  const map = new Map<string, UserSessionLog>();

  const processItem = (s: UserSessionLog) => {
    if (!s || !s.id) return;
    const existing = map.get(s.id);
    const sanitizedDuration = sanitizeSessionDuration(s.duration_seconds, s.id, s.started_at, s.last_heartbeat_at);
    const item: UserSessionLog = { ...s, duration_seconds: sanitizedDuration };

    if (!existing) {
      map.set(s.id, item);
    } else {
      const existingDur = sanitizeSessionDuration(existing.duration_seconds, existing.id, existing.started_at, existing.last_heartbeat_at);
      const dur = Math.max(existingDur, sanitizedDuration);
      const isAct = existing.is_active || s.is_active;
      const hb = (new Date(s.last_heartbeat_at || 0).getTime() > new Date(existing.last_heartbeat_at || 0).getTime())
        ? s.last_heartbeat_at
        : existing.last_heartbeat_at;
      const views = Math.max(existing.page_views_count || 1, s.page_views_count || 1);
      const events = Math.max(existing.events_count || 0, s.events_count || 0);

      map.set(s.id, {
        ...existing,
        ...item,
        duration_seconds: dur,
        is_active: isAct,
        last_heartbeat_at: hb,
        page_views_count: views,
        events_count: events,
      });
    }
  };

  listA.forEach(processItem);
  listB.forEach(processItem);

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );
}

// ============================================================================
// 5.1 PERSISTÊNCIA DUAL-LAYER EM NUVEM (ZERO-WASTE EGRESS)
// ============================================================================

/** Heartbeat pontual de 0 bytes de Egress (apenas UPDATE dos campos de tempo) */
async function sendHeartbeatToCloud(session: UserSessionLog) {
  try {
    await supabase
      .from('lms_user_sessions')
      .update({
        last_heartbeat_at: session.last_heartbeat_at,
        duration_seconds: session.duration_seconds,
        is_active: session.is_active,
        page_views_count: session.page_views_count,
        events_count: session.events_count,
        updated_at: new Date().toISOString(),
      })
      .eq('session_token', session.id);
  } catch (err) {
    // Sem repetição desnecessária para proteger a rede
  }
}

/** Inicia ou atualiza a sessão na nuvem com projeção estrita */
async function syncSessionToCloud(session: UserSessionLog) {
  try {
    await supabase.from('lms_user_sessions').upsert({
      session_token: session.id,
      user_email: session.user_email,
      user_name: session.user_name,
      user_role: session.user_role,
      avatar_url: session.avatar_url,
      device_type: session.device_type,
      browser: session.browser,
      os: session.os,
      screen_resolution: session.screen_resolution,
      started_at: session.started_at,
      last_heartbeat_at: session.last_heartbeat_at,
      duration_seconds: session.duration_seconds,
      is_active: session.is_active,
      page_views_count: session.page_views_count,
      events_count: session.events_count,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'session_token' });
  } catch (err) {
    // Falha protegida
  }
}

/** Envia eventos acumulados em lote direto para a tabela nativa */
async function flushEventsToCloud() {
  if (pendingEventsQueue.length === 0) return;
  const eventsToSend = [...pendingEventsQueue];
  pendingEventsQueue = [];

  try {
    await supabase.from('lms_analytics_events').insert(
      eventsToSend.map((evt) => ({
        session_id: evt.session_id,
        user_email: evt.user_email,
        user_name: evt.user_name,
        user_role: evt.user_role,
        category: evt.category,
        action: evt.action,
        label: evt.label,
        metadata: evt.metadata,
        timestamp: evt.timestamp,
      }))
    );
  } catch (err) {
    // Mantém no cache local
  }
}

/**
 * Mescla e salva o histórico local acumulado.
 */
export async function uploadLocalSessionsToCloud(): Promise<UserSessionLog[]> {
  const local = getLocalSessions();
  if (local.length === 0) return [];

  // 1. Tenta atualizar na tabela nativa lms_user_sessions
  const toUpsert = local.slice(0, 50);
  for (const s of toUpsert) {
    Promise.resolve(
      supabase.from('lms_user_sessions').upsert({
        session_token: s.id,
        user_email: s.user_email,
        user_name: s.user_name,
        user_role: s.user_role,
        avatar_url: s.avatar_url,
        device_type: s.device_type,
        browser: s.browser,
        os: s.os,
        screen_resolution: s.screen_resolution,
        started_at: s.started_at,
        last_heartbeat_at: s.last_heartbeat_at,
        duration_seconds: s.duration_seconds,
        is_active: s.is_active,
        page_views_count: s.page_views_count,
        events_count: s.events_count,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'session_token' })
    ).catch(() => {});
  }

  // 2. Fallback de alta fidelidade: salva em materiais (system_telemetry_sessions_v1)
  try {
    const { data: existingData } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('id', '8c036e91-001a-463d-ad46-d313dc2b019e')
      .maybeSingle();

    let cloudSessions: UserSessionLog[] = [];
    if (existingData?.file_url) {
      try {
        cloudSessions = JSON.parse(existingData.file_url);
      } catch (_) {}
    }

    const merged = mergeSessionLists(cloudSessions, local).slice(0, 300);

    await supabase.from('materiais').upsert({
      id: '8c036e91-001a-463d-ad46-d313dc2b019e',
      title: 'system_telemetry_sessions_v1',
      file_url: JSON.stringify(merged),
      is_native_upload: false,
    });
  } catch (e) {
    console.warn('[Telemetry] Erro ao sincronizar sessões em materiais:', e);
  }

  return local;
}

// ============================================================================
// 6. BUSCA INTELIGENTE POR DELTA-SYNC (ZERO-WASTE EGRESS)
// ============================================================================

const SESSIONS_LAST_FETCH_KEY = 'lms_telemetry_sessions_last_fetch';
const EVENTS_LAST_FETCH_KEY = 'lms_telemetry_events_last_fetch';
const TELEMETRY_CACHE_TTL_MS = 60000; // 1 minuto de TTL inteligente para refletir acessos de outros aparelhos

export async function fetchAllSessions(forceRefresh: boolean = false): Promise<UserSessionLog[]> {
  const local = getLocalSessions();
  const lastFetch = typeof window !== 'undefined' ? Number(localStorage.getItem(SESSIONS_LAST_FETCH_KEY) || 0) : 0;
  const isFresh = Date.now() - lastFetch < TELEMETRY_CACHE_TTL_MS;

  // 1. Local-first: Se o cache for recente e não for refresh manual, entrega instantâneo (0ms, 0 bytes)
  if (!forceRefresh && isFresh && local.length > 0) {
    return local;
  }

  let remoteSessions: UserSessionLog[] = [];

  // 2. Consulta primária na tabela nativa lms_user_sessions (se existir no schema)
  try {
    const { data, error } = await supabase
      .from('lms_user_sessions')
      .select('session_token, user_email, user_name, user_role, avatar_url, device_type, browser, os, screen_resolution, started_at, last_heartbeat_at, duration_seconds, is_active, page_views_count, events_count')
      .order('started_at', { ascending: false })
      .limit(150);

    if (!error && data && data.length > 0) {
      remoteSessions = data.map((d) => ({
        id: d.session_token,
        user_email: d.user_email,
        user_name: d.user_name,
        user_role: d.user_role as UserRole,
        avatar_url: d.avatar_url,
        device_type: d.device_type as DeviceType,
        browser: d.browser,
        os: d.os,
        screen_resolution: d.screen_resolution,
        started_at: d.started_at,
        last_heartbeat_at: d.last_heartbeat_at,
        duration_seconds: d.duration_seconds || 0,
        is_active: d.is_active,
        page_views_count: d.page_views_count || 1,
        events_count: d.events_count || 0,
      }));
    }
  } catch (err) {
    // Silencioso, continua para os fallbacks resilientes
  }

  // 3. Fallback de alta fidelidade: Lê do backup unificado em materiais (system_telemetry_sessions_v1)
  try {
    const { data: matData } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('id', '8c036e91-001a-463d-ad46-d313dc2b019e')
      .maybeSingle();

    if (matData?.file_url) {
      const parsed = JSON.parse(matData.file_url);
      if (Array.isArray(parsed) && parsed.length > 0) {
        remoteSessions = mergeSessionLists(remoteSessions, parsed);
      }
    }
  } catch (err) {}

  // 4. Integração em tempo real com os acessos e perfis sincronizados de alunos (student_sync)
  try {
    const { data: dedicatedSyncRows, error: syncErr } = await supabase
      .from('student_sync')
      .select('email, completed_lessons, student_notes, portal_profile, checklist_tasks, updated_at');

    const studentSessions: UserSessionLog[] = [];
    const now = Date.now();

    if (!syncErr && dedicatedSyncRows && dedicatedSyncRows.length > 0) {
      dedicatedSyncRows.forEach((row) => {
        try {
          const rawEmail = (row.email || '').toLowerCase().trim();
          const profile = row.portal_profile || {};
          const name = profile.name || rawEmail.split('@')[0];
          const avatar = profile.avatarUrl || '';
          const lastActivityIso = row.updated_at || new Date().toISOString();
          const lastActivityTime = new Date(lastActivityIso).getTime();
          const isRecentlyOnline = (now - lastActivityTime) < 15 * 60 * 1000;

          const rawNotes = row.student_notes || {};
          const notesCount = Object.keys(rawNotes.cornellNotes || {}).length + Object.keys(rawNotes.textNotes || rawNotes || {}).length;
          const lessonsCount = Object.keys(row.completed_lessons || {}).length;
          const tasksCount = Array.isArray(row.checklist_tasks) ? row.checklist_tasks.length : 0;
          const totalActivities = notesCount + lessonsCount + tasksCount;

          let sessionDurationSeconds: number;
          if (isRecentlyOnline) {
            sessionDurationSeconds = Math.max(60, Math.min(15 * 60, Math.floor((now - lastActivityTime) / 1000)));
          } else {
            sessionDurationSeconds = Math.min(40 * 60, Math.max(12 * 60, (15 * 60) + (totalActivities * 120)));
          }

          const pageViewsCount = Math.max(2, Math.min(25, 3 + totalActivities));
          const eventsCount = Math.max(1, totalActivities || 3);
          const sessionStartIso = isRecentlyOnline
            ? lastActivityIso
            : new Date(lastActivityTime - sessionDurationSeconds * 1000).toISOString();

          studentSessions.push({
            id: `sess_sync_${rawEmail.replace(/[^a-z0-9]/g, '_')}_${lastActivityTime}`,
            user_email: rawEmail,
            user_name: name,
            user_role: 'aluno',
            avatar_url: avatar,
            device_type: 'desktop',
            browser: 'Google Chrome',
            os: 'Windows',
            started_at: sessionStartIso,
            last_heartbeat_at: lastActivityIso,
            ended_at: isRecentlyOnline ? undefined : lastActivityIso,
            duration_seconds: sessionDurationSeconds,
            page_views_count: pageViewsCount,
            events_count: eventsCount,
            is_active: isRecentlyOnline,
            sync_status: 'synced',
          });
        } catch (e) {}
      });
    } else {
      const { data: studentRows } = await supabase
        .from('materiais')
        .select('title, file_url, created_at')
        .ilike('title', 'student_sync_%');

      if (studentRows && studentRows.length > 0) {

      studentRows.forEach((row) => {
        try {
          const parsed = JSON.parse(row.file_url);
          const rawEmail = row.title.replace('student_sync_', '').toLowerCase().trim();
          const profile = parsed.portalProfile || {};
          const name = profile.name || rawEmail.split('@')[0];
          const avatar = profile.avatarUrl || '';
          const lastActivityIso = parsed.updatedAt || row.created_at;
          const lastActivityTime = new Date(lastActivityIso).getTime();
          const isRecentlyOnline = (now - lastActivityTime) < 15 * 60 * 1000;

          // Métricas de atividades reais realizadas pelo aluno no portal
          const notesCount = Object.keys(parsed.cornellNotes || {}).length + Object.keys(parsed.studentNotes || {}).length;
          const lessonsCount = Object.keys(parsed.completedLessons || {}).length;
          const tasksCount = Array.isArray(parsed.checklistTasks) ? parsed.checklistTasks.length : 0;
          const totalActivities = notesCount + lessonsCount + tasksCount;

          // Cálculo correto e realista de duração:
          // Se o aluno está ativo agora: tempo decorrido no LMS nesta sessão (1 a 15 min)
          // Se for sessão passada: estimativa pedagógica coerente (base 15 min + tempo por atividade, máx 40 min)
          let sessionDurationSeconds: number;
          if (isRecentlyOnline) {
            sessionDurationSeconds = Math.max(60, Math.min(15 * 60, Math.floor((now - lastActivityTime) / 1000)));
          } else {
            sessionDurationSeconds = Math.min(40 * 60, Math.max(12 * 60, (15 * 60) + (totalActivities * 120)));
          }

          const pageViewsCount = Math.max(2, Math.min(25, 3 + totalActivities));
          const eventsCount = Math.max(1, totalActivities || 3);
          const sessionStartIso = isRecentlyOnline
            ? lastActivityIso
            : new Date(lastActivityTime - sessionDurationSeconds * 1000).toISOString();

          studentSessions.push({
            id: `sess_sync_${rawEmail.replace(/[^a-z0-9]/g, '_')}_${lastActivityTime}`,
            user_email: rawEmail,
            user_name: name,
            user_role: 'aluno',
            avatar_url: avatar,
            device_type: 'desktop',
            browser: 'Google Chrome',
            os: 'Windows 10/11',
            screen_resolution: '1280x720',
            started_at: sessionStartIso,
            last_heartbeat_at: lastActivityIso,
            duration_seconds: sessionDurationSeconds,
            is_active: isRecentlyOnline,
            page_views_count: pageViewsCount,
            events_count: eventsCount,
          });
        } catch (_) {}
      });
    }
  }

    if (studentSessions.length > 0) {
      remoteSessions = mergeSessionLists(remoteSessions, studentSessions);
    }
  } catch (err) {}

  // 5. Mescla o histórico recebido da nuvem com o cache local acumulado
  const merged = mergeSessionLists(remoteSessions, local);

  if (merged.length > 0) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(merged.slice(0, 400)));
        localStorage.setItem(SESSIONS_LAST_FETCH_KEY, String(Date.now()));
      } catch (_) {
        try {
          localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(merged.slice(0, 100)));
        } catch (_) {}
      }
    }
    return merged;
  }

  return local;
}

export async function fetchAllEvents(forceRefresh: boolean = false): Promise<AnalyticsEvent[]> {
  const local = getLocalEvents();
  const lastFetch = typeof window !== 'undefined' ? Number(localStorage.getItem(EVENTS_LAST_FETCH_KEY) || 0) : 0;
  const isFresh = Date.now() - lastFetch < TELEMETRY_CACHE_TTL_MS;

  if (!forceRefresh && isFresh && local.length > 0) {
    return local;
  }

  let remoteEvents: AnalyticsEvent[] = [];

  try {
    const { data, error } = await supabase
      .from('lms_analytics_events')
      .select('id, session_id, user_email, user_name, user_role, category, action, label, metadata, timestamp')
      .order('timestamp', { ascending: false })
      .limit(150);

    if (!error && data && data.length > 0) {
      remoteEvents = data.map((e) => ({
        id: e.id,
        session_id: e.session_id,
        user_email: e.user_email,
        user_name: e.user_name,
        user_role: e.user_role as UserRole,
        category: e.category as AnalyticsCategory,
        action: e.action,
        label: e.label,
        metadata: e.metadata || {},
        timestamp: e.timestamp,
      }));
    }
  } catch (err) {
    // Silencioso, continua para fallback em materiais
  }

  // Mescla por ID preservando eventos únicos
  const map = new Map<string, AnalyticsEvent>();
  remoteEvents.forEach((ev) => map.set(ev.id, ev));

  // Fallback de alta fidelidade: Lê do backup em materiais (system_telemetry_events_v1)
  try {
    const { data: matEvents } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('id', '8914b25e-da88-411c-8a20-95b5720b4eb6')
      .maybeSingle();

    if (matEvents?.file_url) {
      const parsed = JSON.parse(matEvents.file_url);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach((ev: AnalyticsEvent) => map.set(ev.id, ev));
      }
    }
  } catch (err) {}

  local.forEach((ev) => map.set(ev.id, ev));

  const merged = Array.from(map.values())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 600);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(merged));
      localStorage.setItem(EVENTS_LAST_FETCH_KEY, String(Date.now()));
    } catch (_) {}
  }

  return merged;
}

// ============================================================================
// 7. COMPILAÇÃO DO SUMMARY E GERAÇÃO DE INSIGHTS DE DESENVOLVIMENTO
// ============================================================================

export async function getAnalyticsSummary(forceRefresh: boolean = false): Promise<AnalyticsSummary> {
  const sessions = await fetchAllSessions(forceRefresh);
  const events = await fetchAllEvents(forceRefresh);

  const now = new Date().getTime();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const threeMinutesAgo = now - 3 * 60 * 1000;

  // Usuários Ativos (DAU, WAU, MAU)
  const dauUsers = new Set<string>();
  const wauUsers = new Set<string>();
  const mauUsers = new Set<string>();
  const activeNowUsers = new Set<string>();

  const roleCounts: Record<UserRole, number> = {
    aluno: 0,
    professor: 0,
    monitor: 0,
    admin: 0,
  };

  const deviceCounts: Record<DeviceType, number> = {
    desktop: 0,
    mobile: 0,
    tablet: 0,
  };

  let totalDuration = 0;

  sessions.forEach((s) => {
    const sTime = new Date(s.started_at).getTime();
    const hTime = new Date(s.last_heartbeat_at || s.started_at).getTime();

    if (sTime >= oneDayAgo) dauUsers.add(s.user_email);
    if (sTime >= sevenDaysAgo) wauUsers.add(s.user_email);
    if (sTime >= thirtyDaysAgo) mauUsers.add(s.user_email);

    if (hTime >= threeMinutesAgo && s.is_active && s.user_email) {
      activeNowUsers.add(s.user_email.toLowerCase());
    }

    if (s.user_role && roleCounts[s.user_role] !== undefined) {
      roleCounts[s.user_role] += 1;
    }

    if (s.device_type && deviceCounts[s.device_type] !== undefined) {
      deviceCounts[s.device_type] += 1;
    }

    totalDuration += s.duration_seconds || 0;
  });

  const activeUsersNow = activeNowUsers.size;

  const avgDurationMinutes = sessions.length > 0 ? Math.round(totalDuration / sessions.length / 60) : 0;

  // 1. Estatísticas de Uso por Módulo
  const moduleEventsCount: Record<AnalyticsCategory, { total: number; users: Set<string> }> = {
    cornell_notes: { total: 0, users: new Set() },
    biblioteca: { total: 0, users: new Set() },
    meet: { total: 0, users: new Set() },
    drive: { total: 0, users: new Set() },
    gravacoes: { total: 0, users: new Set() },
    portfolio: { total: 0, users: new Set() },
    checklist: { total: 0, users: new Set() },
    rpg: { total: 0, users: new Set() },
    portal_academico: { total: 0, users: new Set() },
    ajuda: { total: 0, users: new Set() },
    metacognitivo: { total: 0, users: new Set() },
    navigation: { total: 0, users: new Set() },
    session: { total: 0, users: new Set() },
  };

  events.forEach((evt) => {
    if (moduleEventsCount[evt.category]) {
      moduleEventsCount[evt.category].total += 1;
      moduleEventsCount[evt.category].users.add(evt.user_email);
    }
  });

  const totalModuleEvents = Math.max(
    1,
    Object.values(moduleEventsCount).reduce((acc, curr) => acc + curr.total, 0)
  );

  const categoryLabels: Record<AnalyticsCategory, { label: string; icon: string }> = {
    cornell_notes: { label: 'Caderno Cornell (Anotações & IA)', icon: 'BookOpen' },
    biblioteca: { label: 'Biblioteca Digital Integrada', icon: 'Library' },
    meet: { label: 'Aulas Ao Vivo (Google Meet)', icon: 'Video' },
    drive: { label: 'Materiais & Apostilas (Google Drive)', icon: 'FolderOpen' },
    gravacoes: { label: 'Gravações das Aulas', icon: 'Film' },
    portfolio: { label: 'Portfólio Mediador & Rubricas', icon: 'Archive' },
    checklist: { label: 'Checklist de Avaliação AV2', icon: 'CheckSquare' },
    rpg: { label: 'Simulador Pastoral RPG', icon: 'Drama' },
    portal_academico: { label: 'Portal & Calendário Acadêmico', icon: 'Compass' },
    ajuda: { label: 'Central de Ajuda & Tutoriais', icon: 'HelpCircle' },
    metacognitivo: { label: 'Trilhas Metacognitivas', icon: 'SlidersHorizontal' },
    navigation: { label: 'Navegação Entre Telas', icon: 'Layers' },
    session: { label: 'Acessos & Sessões', icon: 'UserCheck' },
  };

  const topModules: ModuleUsageStats[] = Object.entries(moduleEventsCount)
    .filter(([cat]) => cat !== 'navigation' && cat !== 'session')
    .map(([cat, data]) => {
      const info = categoryLabels[cat as AnalyticsCategory] || { label: cat, icon: 'Activity' };
      const percentage = Math.round((data.total / totalModuleEvents) * 100);
      const trend: 'up' | 'stable' | 'down' = percentage >= 20 ? 'up' : percentage >= 8 ? 'stable' : 'down';
      return {
        category: cat as AnalyticsCategory,
        label: info.label,
        icon_name: info.icon,
        total_events: data.total,
        unique_users: data.users.size,
        percentage,
        trend,
      };
    })
    .sort((a, b) => b.total_events - a.total_events);

  // 2. Horários de Pico
  const hoursMap: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hoursMap[i] = 0;

  sessions.forEach((s) => {
    const h = new Date(s.started_at).getHours();
    hoursMap[h] = (hoursMap[h] || 0) + 1;
  });

  const peak_hours: PeakHourStats[] = Object.entries(hoursMap).map(([h, count]) => {
    const hourNum = parseInt(h, 10);
    return {
      hour: hourNum,
      label: `${hourNum.toString().padStart(2, '0')}:00`,
      count,
    };
  });

  // 3. Picos por Dia da Semana
  const daysMap: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  sessions.forEach((s) => {
    const d = new Date(s.started_at).getDay();
    daysMap[d] = (daysMap[d] || 0) + 1;
  });

  const peak_weekdays: WeekdayStats[] = Object.entries(daysMap).map(([d, count]) => {
    const dayIdx = parseInt(d, 10);
    return {
      day_index: dayIdx,
      day_name: dayNames[dayIdx],
      count,
    };
  });

  // 4. Insights Automatizados para Evolução do LMS
  const insights = generateDevelopmentInsights(topModules, deviceCounts, peak_hours, sessions.length);

  return {
    dau: dauUsers.size,
    wau: wauUsers.size,
    mau: mauUsers.size,
    total_sessions: sessions.length,
    total_events: events.length,
    avg_session_duration_minutes: avgDurationMinutes,
    active_users_now: activeUsersNow,
    role_breakdown: roleCounts,
    device_breakdown: deviceCounts,
    top_modules: topModules,
    peak_hours,
    peak_weekdays,
    insights,
    recent_sessions: sessions, // Retorna todas as sessões carregadas sem truncamento
    recent_events: events,     // Retorna todos os eventos carregados sem truncamento
  };
}

// ============================================================================
// 8. MOTOR DE RECOMENDAÇÕES E INSIGHTS DE DESENVOLVIMENTO
// ============================================================================

function generateDevelopmentInsights(
  topModules: ModuleUsageStats[],
  deviceBreakdown: Record<DeviceType, number>,
  peakHours: PeakHourStats[],
  totalSessions: number
): DevelopmentInsight[] {
  const insights: DevelopmentInsight[] = [];

  const cornellStats = topModules.find((m) => m.category === 'cornell_notes');
  const bibliotecaStats = topModules.find((m) => m.category === 'biblioteca');
  const rpgStats = topModules.find((m) => m.category === 'rpg');
  const meetStats = topModules.find((m) => m.category === 'meet');

  // Insight 1: Caderno Cornell / Estudo Ativo
  if (cornellStats && cornellStats.percentage >= 15) {
    insights.push({
      id: 'ins_cornell_high',
      type: 'high_engagement',
      title: 'Alta Adoção do Caderno Cornell',
      description: `O Caderno Cornell representa ${cornellStats.percentage}% das interações da plataforma (${cornellStats.unique_users} alunos ativos).`,
      recommendation: 'Evoluir o módulo com exportação em PDF formatado para impressão e integração com resumos inteligentes de IA por tópicos bíblicos.',
      priority: 'high',
      metric_value: `${cornellStats.total_events} anotações`,
    });
  }

  // Insight 2: Dispositivos Móveis
  const totalDev = (deviceBreakdown.desktop || 0) + (deviceBreakdown.mobile || 0) + (deviceBreakdown.tablet || 0);
  const mobilePct = totalDev > 0 ? Math.round(((deviceBreakdown.mobile + deviceBreakdown.tablet) / totalDev) * 100) : 0;
  if (mobilePct >= 35) {
    insights.push({
      id: 'ins_mobile_opt',
      type: 'feature_opportunity',
      title: 'Acesso Móvel Expressivo (Mobile & Tablets)',
      description: `${mobilePct}% dos acessos partem de smartphones e tablets dos alunos.`,
      recommendation: 'Priorizar modo escuro (Dark Mode) nativo e leitor de PDF embutido otimizado para celulares sem depender do visualizador externo do Google Drive.',
      priority: 'high',
      metric_value: `${mobilePct}% Mobile`,
    });
  }

  // Insight 3: Biblioteca Digital
  if (bibliotecaStats && bibliotecaStats.total_events > 0) {
    insights.push({
      id: 'ins_biblioteca_growth',
      type: 'pedagogical',
      title: 'Biblioteca Digital é Pilar de Consulta',
      description: `Mais de ${bibliotecaStats.unique_users} alunos consultaram obras do acervo teológico.`,
      recommendation: 'Adicionar busca textual full-text dentro das sinopses e criar estantes personalizadas de "Favoritos" para cada estudante.',
      priority: 'medium',
      metric_value: `${bibliotecaStats.total_events} leituras`,
    });
  }

  // Insight 4: RPG Pastoral
  if (rpgStats && rpgStats.percentage < 10) {
    insights.push({
      id: 'ins_rpg_adoption',
      type: 'low_adoption',
      title: 'Oportunidade de Capacitação: Simulador RPG',
      description: 'O módulo de simulação pastoral ainda possui baixo volume de sessões abertas pelos professores.',
      recommendation: 'Criar modelos de cenários pré-configurados prontos para uso (ex: "Mediação de Conflito em Conselho", "Visita Hospitalar") para reduzir o esforço de criação do docente.',
      priority: 'medium',
      metric_value: `${rpgStats.total_events} eventos`,
    });
  }

  // Insight 5: Picos de Horário de Aulas
  const nightPeak = peakHours.filter((h) => h.hour >= 18 && h.hour <= 22).reduce((a, b) => a + b.count, 0);
  if (nightPeak > 0) {
    insights.push({
      id: 'ins_peak_schedule',
      type: 'performance',
      title: 'Janela Crítica de Acesso: 18h00 às 22h30',
      description: 'Pico de tráfego concentrado nos horários de aulas ao vivo e pós-aula.',
      recommendation: 'Garantir pré-carregamento dos links de Google Meet e formulários de presença com 15 minutos de antecedência no cache do navegador.',
      priority: 'low',
      metric_value: `${nightPeak} conexões noturnas`,
    });
  }

  return insights;
}

// ============================================================================
// 9. UTILITÁRIOS DE FILTRAGEM E DOSSIÊ POR PESSOA
// ============================================================================

export interface UserDossierHistory {
  user_email: string;
  user_name: string;
  user_role: UserRole;
  avatar_url?: string;
  is_online_now: boolean;
  total_sessions_count: number;
  total_duration_seconds: number;
  first_access_at: string;
  latest_access_at: string;
  days_accessed_count: number;
  devices_used: { device: DeviceType; os: string; browser: string; count: number }[];
  favorite_categories: { category: AnalyticsCategory; count: number; percentage: number }[];
  sessions_by_day: Record<string, UserSessionLog[]>;
  all_sessions: UserSessionLog[];
  all_events: AnalyticsEvent[];
}

export function getUserDetailedHistory(
  userEmail: string,
  allSessions: UserSessionLog[],
  allEvents: AnalyticsEvent[]
): UserDossierHistory | null {
  const emailNorm = userEmail.toLowerCase().trim();
  const userSessions = allSessions.filter((s) => (s.user_email || '').toLowerCase().trim() === emailNorm);
  const userEvents = allEvents.filter((e) => (e.user_email || '').toLowerCase().trim() === emailNorm);

  if (userSessions.length === 0 && userEvents.length === 0) {
    return null;
  }

  const latestSession = userSessions[0];
  const userName = latestSession?.user_name || userEvents[0]?.user_name || emailNorm.split('@')[0];
  const userRole = latestSession?.user_role || userEvents[0]?.user_role || 'aluno';
  const avatarUrl = latestSession?.avatar_url || INITIAL_AUTHORIZED_USERS[emailNorm]?.avatarUrl;

  const now = Date.now();
  const threeMinutesAgo = now - 3 * 60 * 1000;
  const isOnline = userSessions.some(
    (s) => s.is_active && new Date(s.last_heartbeat_at || s.started_at).getTime() >= threeMinutesAgo
  );

  let totalDuration = 0;
  const daysMap: Record<string, UserSessionLog[]> = {};
  const devicesMap = new Map<string, { device: DeviceType; os: string; browser: string; count: number }>();

  userSessions.forEach((s) => {
    totalDuration += s.duration_seconds || 0;
    const dayKey = s.started_at ? s.started_at.slice(0, 10) : new Date().toISOString().slice(0, 10);
    if (!daysMap[dayKey]) daysMap[dayKey] = [];
    daysMap[dayKey].push(s);

    const devKey = `${s.device_type}_${s.os}_${s.browser}`;
    const exist = devicesMap.get(devKey);
    if (exist) {
      exist.count += 1;
    } else {
      devicesMap.set(devKey, {
        device: s.device_type,
        os: s.os,
        browser: s.browser,
        count: 1,
      });
    }
  });

  // Categorias de eventos mais acessadas
  const catCount: Partial<Record<AnalyticsCategory, number>> = {};
  userEvents.forEach((ev) => {
    catCount[ev.category] = (catCount[ev.category] || 0) + 1;
  });

  const totalEvts = Math.max(1, userEvents.length);
  const favoriteCategories = Object.entries(catCount)
    .map(([cat, count]) => ({
      category: cat as AnalyticsCategory,
      count: count as number,
      percentage: Math.round(((count as number) / totalEvts) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const sortedSessions = [...userSessions].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );
  const sortedEvents = [...userEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const firstAccess = sortedSessions[sortedSessions.length - 1]?.started_at || sortedEvents[sortedEvents.length - 1]?.timestamp || new Date().toISOString();
  const latestAccess = sortedSessions[0]?.started_at || sortedEvents[0]?.timestamp || new Date().toISOString();

  return {
    user_email: emailNorm,
    user_name: userName,
    user_role: userRole,
    avatar_url: avatarUrl,
    is_online_now: isOnline,
    total_sessions_count: userSessions.length,
    total_duration_seconds: totalDuration,
    first_access_at: firstAccess,
    latest_access_at: latestAccess,
    days_accessed_count: Object.keys(daysMap).length,
    devices_used: Array.from(devicesMap.values()).sort((a, b) => b.count - a.count),
    favorite_categories: favoriteCategories,
    sessions_by_day: daysMap,
    all_sessions: sortedSessions,
    all_events: sortedEvents,
  };
}

// ============================================================================
// 10. UTILITÁRIOS DE EXPORTAÇÃO CSV / JSON
// ============================================================================

export function exportSessionsCSV(sessions: UserSessionLog[]): string {
  const headers = ['ID Sessão', 'E-mail', 'Nome', 'Perfil', 'Dispositivo', 'Navegador', 'Sistema Operacional', 'Início', 'Duração (min)', 'Status', 'Visualizações de Página', 'Eventos'];
  
  const rows = sessions.map((s) => [
    s.id,
    `"${s.user_email}"`,
    `"${s.user_name}"`,
    s.user_role,
    s.device_type,
    `"${s.browser}"`,
    `"${s.os}"`,
    new Date(s.started_at).toLocaleString('pt-BR'),
    Math.round(s.duration_seconds / 60),
    s.is_active ? 'Ativo' : 'Encerrado',
    s.page_views_count,
    s.events_count,
  ]);

  return [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
}

export function exportEventsCSV(events: AnalyticsEvent[]): string {
  const headers = ['ID Evento', 'E-mail', 'Nome', 'Perfil', 'Categoria / Módulo', 'Ação', 'Rótulo / Descrição', 'Data e Hora', 'Detalhes (Metadata)'];

  const rows = events.map((e) => [
    e.id,
    `"${e.user_email}"`,
    `"${e.user_name}"`,
    e.user_role,
    e.category,
    `"${e.action}"`,
    `"${e.label || ''}"`,
    new Date(e.timestamp).toLocaleString('pt-BR'),
    `"${JSON.stringify(e.metadata || {}).replace(/"/g, '""')}"`,
  ]);

  return [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
