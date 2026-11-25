import { supabase } from '@/lib/supabaseClient';
import { CornellNote } from '@/types';

export type LessonAttendanceStatus = 'presente' | 'reposicao' | 'nao_houve' | 'pendente';

export interface StudentSyncData {
  completedLessons: Record<string, boolean>;
  lessonAttendanceStatus?: Record<string, LessonAttendanceStatus>;
  studentNotes: Record<string, string>;
  cornellNotes?: Record<string, CornellNote>;
  portalProfile: {
    periodoNum?: number;
    turmaIdx?: number;
    autoMarkPrevious?: boolean;
    completedSubjects?: string[];
    [key: string]: any;
  } | null;
  checklistTasks: any[] | null;
  av2SimuladoAnswers?: Record<string, 'A' | 'B' | 'C' | 'D'>;
  planoChecklist?: string[];
  livrosLidos?: string[];
  lastSyncedAt?: string;
}

export const SYNC_AUTH_REQUIRED_EVENT = 'lms_sync_auth_required';

type DirtyField =
  | 'checklist'
  | 'av2Simulado'
  | 'plano'
  | 'progress'
  | 'attendance'
  | 'notes'
  | 'cornell'
  | 'profile';

interface LocalSyncMeta {
  dirty?: Partial<Record<DirtyField, boolean>>;
  updatedAt?: number;
}

type StudentSyncPatch = Partial<{
  completed_lessons: Record<string, boolean>;
  student_notes: Record<string, string>;
  cornell_notes: Record<string, CornellNote>;
  attendance_status: Record<string, LessonAttendanceStatus>;
  av2_simulado: Record<string, 'A' | 'B' | 'C' | 'D'>;
  plano_checklist: string[];
  livros_lidos: string[];
  portal_profile: any;
  checklist_tasks: any[];
}>;

const EVENT_NAME = 'lms_student_sync_updated';
const RESERVED_NOTES_KEYS = new Set([
  'textNotes',
  'cornellNotes',
  'lessonAttendanceStatus',
  'av2Simulado',
  'planoChecklist',
  'livrosLidos',
]);

const notesDebounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
const av2DebounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
const planoDebounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
const cornellDebounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
const pendingUpserts: Record<string, StudentSyncPatch> = {};
const localNotesPending: Record<string, Record<string, string>> = {};
const studentDataInFlight: Record<string, Promise<StudentSyncData> | undefined> = {};
const syncAuthRequiredMap: Record<string, boolean> = {};
let lifecycleFlushRegistered = false;

export function getNormalizedEmail(userEmail?: string): string {
  if (!userEmail || userEmail.trim() === '') return '';
  return userEmail.toLowerCase().trim();
}

export function isLegacyChecklistTasks(tasks: any[] | null | undefined): boolean {
  if (!Array.isArray(tasks) || tasks.length === 0) return false;
  return !tasks.some((t: any) => Boolean(t && t.assessmentId));
}

export function getSyncAuthRequired(userEmail?: string): boolean {
  const email = getNormalizedEmail(userEmail);
  if (email) return !!syncAuthRequiredMap[email];
  return Object.values(syncAuthRequiredMap).some(Boolean);
}

function setSyncAuthRequired(email: string, required: boolean): void {
  if (!email) return;
  const prev = !!syncAuthRequiredMap[email];
  syncAuthRequiredMap[email] = required;
  if (typeof window !== 'undefined' && prev !== required) {
    try {
      window.dispatchEvent(
        new CustomEvent(SYNC_AUTH_REQUIRED_EVENT, { detail: { email, required } })
      );
    } catch {}
  }
}

function getLocalSyncMetaKey(email: string): string {
  return `lms_sync_local_meta_${email}`;
}

function readLocalSyncMeta(email: string): LocalSyncMeta {
  if (typeof window === 'undefined' || !email) return {};
  try {
    const raw = localStorage.getItem(getLocalSyncMetaKey(email));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {}
  return {};
}

function markLocalDirty(email: string, fields: DirtyField[]): void {
  if (typeof window === 'undefined' || !email || fields.length === 0) return;
  const current = readLocalSyncMeta(email);
  const nextDirty: Partial<Record<DirtyField, boolean>> = { ...(current.dirty || {}) };
  for (const f of fields) nextDirty[f] = true;
  safeLocalStorageSet(
    getLocalSyncMetaKey(email),
    JSON.stringify({ dirty: nextDirty, updatedAt: Date.now() })
  );
}

function clearLocalDirty(email: string, fields: DirtyField[]): void {
  if (typeof window === 'undefined' || !email || fields.length === 0) return;
  const current = readLocalSyncMeta(email);
  if (!current.dirty) return;
  const nextDirty: Partial<Record<DirtyField, boolean>> = { ...current.dirty };
  for (const f of fields) delete nextDirty[f];
  safeLocalStorageSet(
    getLocalSyncMetaKey(email),
    JSON.stringify({ dirty: nextDirty, updatedAt: Date.now() })
  );
}

export function mirrorChecklistTasksToLegacyKeys(
  userEmail: string,
  tasks: any[] | null | undefined
): void {
  const email = getNormalizedEmail(userEmail);
  if (typeof window === 'undefined' || !email || !Array.isArray(tasks)) return;
  for (const task of tasks) {
    if (!task) continue;
    const assessmentId =
      task.assessmentId ||
      (typeof task.id === 'string' && task.id.startsWith('aval-') ? task.id : undefined);
    if (!assessmentId) continue;

    const checks: Record<number, boolean> = {};
    if (Array.isArray(task.subtasks) && task.subtasks.length > 0) {
      const allDone = task.status === 'done' || task.status === 'archived';
      task.subtasks.forEach((st: any, idx: number) => {
        checks[idx] = allDone ? true : Boolean(st?.done);
      });
    }

    safeLocalStorageSet(
      `koinonia_checklist_${email}_${assessmentId}`,
      JSON.stringify(checks)
    );
  }
}

function ensureLifecycleFlushRegistered(): void {
  if (lifecycleFlushRegistered || typeof window === 'undefined') return;
  lifecycleFlushRegistered = true;
  window.addEventListener('pagehide', () => {
    flushAllPendingStudentSync().catch(() => {});
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushAllPendingStudentSync().catch(() => {});
    }
  });
}

function extractPlainTextNotes(rawNotes: any): Record<string, string> {
  if (!rawNotes || typeof rawNotes !== 'object') return {};
  if (rawNotes.textNotes && typeof rawNotes.textNotes === 'object') {
    return rawNotes.textNotes;
  }
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawNotes)) {
    if (!RESERVED_NOTES_KEYS.has(k) && typeof v === 'string') {
      clean[k] = v;
    }
  }
  return clean;
}

// ---------------------------------------------------------------------------
// CLOUD — Tabela `student_sync`
// ---------------------------------------------------------------------------

async function loadFromCloud(
  email: string
): Promise<Omit<StudentSyncData, 'lastSyncedAt'>> {
  const empty: Omit<StudentSyncData, 'lastSyncedAt'> = {
    completedLessons: {},
    lessonAttendanceStatus: {},
    studentNotes: {},
    cornellNotes: {},
    portalProfile: null,
    checklistTasks: null,
    av2SimuladoAnswers: {},
    planoChecklist: [],
    livrosLidos: [],
  };

  if (!email) return empty;

  try {
    // 1. Consulta prioritária na tabela dedicada 'student_sync' (SSOT)
    const { data: syncData, error: syncError } = await supabase
      .from('student_sync')
      .select('completed_lessons, student_notes, portal_profile, checklist_tasks, updated_at')
      .eq('email', email)
      .limit(1);

    if (!syncError && syncData && syncData.length > 0) {
      const row = syncData[0];
      const rawNotes = row.student_notes || {};

      // Suporte a formato empacotado e formato plano legado
      const studentNotes = extractPlainTextNotes(rawNotes);
      const cornellNotes = rawNotes.cornellNotes && typeof rawNotes.cornellNotes === 'object' ? rawNotes.cornellNotes : {};
      const lessonAttendanceStatus = rawNotes.lessonAttendanceStatus && typeof rawNotes.lessonAttendanceStatus === 'object' ? rawNotes.lessonAttendanceStatus : {};
      const av2SimuladoAnswers = rawNotes.av2Simulado && typeof rawNotes.av2Simulado === 'object' ? rawNotes.av2Simulado : {};
      const planoChecklist = Array.isArray(rawNotes.planoChecklist) ? rawNotes.planoChecklist : [];
      const livrosLidos = Array.isArray(rawNotes.livrosLidos) ? rawNotes.livrosLidos : [];

      return {
        completedLessons: row.completed_lessons || {},
        lessonAttendanceStatus,
        studentNotes,
        cornellNotes,
        portalProfile: row.portal_profile || null,
        checklistTasks: row.checklist_tasks || null,
        av2SimuladoAnswers,
        planoChecklist,
        livrosLidos,
      };
    }

    // 2. Fallback de Migração: Se ainda não estiver em student_sync, lê da tabela legada 'materiais'
    const syncKey = `student_sync_${email}`;
    const { data, error } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', syncKey)
      .limit(1);

    if (!error && data && data.length > 0 && data[0].file_url) {
      try {
        const parsed = JSON.parse(data[0].file_url);
        const legacyResult = {
          completedLessons: parsed.completedLessons || {},
          lessonAttendanceStatus: parsed.lessonAttendanceStatus || {},
          studentNotes: parsed.studentNotes || {},
          cornellNotes: parsed.cornellNotes || {},
          portalProfile: parsed.portalProfile || null,
          checklistTasks: parsed.checklistTasks || null,
          av2SimuladoAnswers: parsed.av2SimuladoAnswers || {},
          planoChecklist: Array.isArray(parsed.planoChecklist) ? parsed.planoChecklist : [],
          livrosLidos: Array.isArray(parsed.livrosLidos) ? parsed.livrosLidos : [],
        };

        // Migra automaticamente em background para a tabela dedicada student_sync (se autenticado)
        (async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return;
            await supabase.from('student_sync').upsert(
              {
                email,
                completed_lessons: legacyResult.completedLessons,
                student_notes: {
                  textNotes: legacyResult.studentNotes,
                  cornellNotes: legacyResult.cornellNotes,
                  lessonAttendanceStatus: legacyResult.lessonAttendanceStatus,
                  av2Simulado: legacyResult.av2SimuladoAnswers,
                  planoChecklist: legacyResult.planoChecklist,
                  livrosLidos: legacyResult.livrosLidos,
                },
                portal_profile: legacyResult.portalProfile,
                checklist_tasks: legacyResult.checklistTasks,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'email' }
            );
          } catch {}
        })();

        return legacyResult;
      } catch (parseErr) {
        console.warn('[StudentSync] Erro ao parsear dados da nuvem legada:', parseErr);
      }
    }

    return empty;
  } catch (err) {
    console.warn('[StudentSync] Exceção ao ler da nuvem:', err);
    return empty;
  }
}

async function ensureActiveSupabaseSession(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return true;
    const { data: refreshed } = await supabase.auth.refreshSession();
    return Boolean(refreshed?.session?.access_token);
  } catch {
    return false;
  }
}

function isRlsOrAuthError(err: any): boolean {
  if (!err) return false;
  const code = String(err.code || '');
  const status = Number(err.status || 0);
  const msg = String(err.message || '').toLowerCase();
  return code === '42501' || status === 401 || status === 403 || msg.includes('row-level security') || msg.includes('permission denied');
}

/**
 * Upsert seletivo na nuvem (`student_sync`).
 * Verifica sessão autenticada (evita erro silencioso RLS 42501),
 * atualiza apenas as colunas modificadas e mantém dirty flags caso offline/expirado.
 */
async function upsertToCloud(
  email: string,
  patch: StudentSyncPatch
): Promise<boolean> {
  if (!email) return false;
  ensureLifecycleFlushRegistered();

  try {
    window.dispatchEvent(new CustomEvent('lms_sync_in_progress', { detail: { resource: 'student_data' } }));
  } catch {}

  pendingUpserts[email] = { ...(pendingUpserts[email] || {}), ...patch };

  try {
    const hasSession = await ensureActiveSupabaseSession();
    if (!hasSession) {
      console.warn('[StudentSync] Sessão Supabase ausente/expirada; alterações preservadas localmente para envio posterior.');
      setSyncAuthRequired(email, true);
      try {
        window.dispatchEvent(
          new CustomEvent('lms_sync_completed', {
            detail: { resource: 'student_data', success: false, reason: 'auth_required' },
          })
        );
      } catch {}
      return false;
    }

    const local = readLocalCache(email);
    const nowIso = new Date().toISOString();
    const partialColumns: Record<string, any> = { updated_at: nowIso };
    const fieldsToClear: DirtyField[] = [];

    if (patch.completed_lessons !== undefined) {
      partialColumns.completed_lessons = {
        ...local.completedLessons,
        ...patch.completed_lessons,
      };
      fieldsToClear.push('progress');
    }

    if (patch.portal_profile !== undefined) {
      partialColumns.portal_profile = patch.portal_profile;
      fieldsToClear.push('profile');
    }

    if (patch.checklist_tasks !== undefined) {
      partialColumns.checklist_tasks = patch.checklist_tasks;
      fieldsToClear.push('checklist');
    }

    const hasNotesPatch =
      patch.student_notes !== undefined ||
      patch.cornell_notes !== undefined ||
      patch.attendance_status !== undefined ||
      patch.av2_simulado !== undefined ||
      patch.plano_checklist !== undefined ||
      patch.livros_lidos !== undefined;

    if (hasNotesPatch) {
      const mergedStudentNotes =
        patch.student_notes !== undefined
          ? { ...local.studentNotes, ...patch.student_notes }
          : local.studentNotes || {};
      const mergedCornellNotes =
        patch.cornell_notes !== undefined
          ? { ...(local.cornellNotes || {}), ...patch.cornell_notes }
          : local.cornellNotes || {};
      const mergedAttendance =
        patch.attendance_status !== undefined
          ? { ...(local.lessonAttendanceStatus || {}), ...patch.attendance_status }
          : local.lessonAttendanceStatus || {};
      const mergedAv2Simulado =
        patch.av2_simulado !== undefined
          ? patch.av2_simulado
          : local.av2SimuladoAnswers || {};
      const mergedPlanoChecklist =
        patch.plano_checklist !== undefined
          ? patch.plano_checklist
          : local.planoChecklist || [];
      const mergedLivrosLidos =
        patch.livros_lidos !== undefined
          ? patch.livros_lidos
          : local.livrosLidos || [];

      partialColumns.student_notes = {
        textNotes: mergedStudentNotes,
        cornellNotes: mergedCornellNotes,
        lessonAttendanceStatus: mergedAttendance,
        av2Simulado: mergedAv2Simulado,
        planoChecklist: mergedPlanoChecklist,
        livrosLidos: mergedLivrosLidos,
      };

      if (patch.student_notes !== undefined) fieldsToClear.push('notes');
      if (patch.cornell_notes !== undefined) fieldsToClear.push('cornell');
      if (patch.attendance_status !== undefined) fieldsToClear.push('attendance');
      if (patch.av2_simulado !== undefined) fieldsToClear.push('av2Simulado');
      if (patch.plano_checklist !== undefined || patch.livros_lidos !== undefined) {
        fieldsToClear.push('plano');
      }
    }

    // 1. Update seletivo apenas nas colunas modificadas (evita sobrescrever outras colunas com cache antigo)
    let { data: updatedRows, error: syncErr } = await supabase
      .from('student_sync')
      .update(partialColumns)
      .eq('email', email)
      .select('email');

    if (syncErr && isRlsOrAuthError(syncErr)) {
      await supabase.auth.refreshSession().catch(() => {});
      const retry = await supabase
        .from('student_sync')
        .update(partialColumns)
        .eq('email', email)
        .select('email');
      updatedRows = retry.data;
      syncErr = retry.error;
    }

    // 2. Se o aluno ainda não possui linha em student_sync, cria via upsert completo
    if (!syncErr && (!updatedRows || updatedRows.length === 0)) {
      const notesFallbackPayload = partialColumns.student_notes || {
        textNotes: local.studentNotes || {},
        cornellNotes: local.cornellNotes || {},
        lessonAttendanceStatus: local.lessonAttendanceStatus || {},
        av2Simulado: local.av2SimuladoAnswers || {},
        planoChecklist: local.planoChecklist || [],
        livrosLidos: local.livrosLidos || [],
      };

      const fullRow = {
        email,
        completed_lessons: partialColumns.completed_lessons ?? local.completedLessons ?? {},
        student_notes: notesFallbackPayload,
        portal_profile: partialColumns.portal_profile !== undefined ? partialColumns.portal_profile : local.portalProfile,
        checklist_tasks: partialColumns.checklist_tasks !== undefined ? partialColumns.checklist_tasks : local.checklistTasks,
        updated_at: nowIso,
      };

      const insertRes = await supabase
        .from('student_sync')
        .upsert(fullRow, { onConflict: 'email' });
      syncErr = insertRes.error;
    }

    if (syncErr) {
      const authFailed = isRlsOrAuthError(syncErr);
      if (authFailed) setSyncAuthRequired(email, true);
      console.warn('[StudentSync] Falha ao persistir em student_sync:', syncErr.message || syncErr);
      try {
        window.dispatchEvent(
          new CustomEvent('lms_sync_completed', {
            detail: {
              resource: 'student_data',
              success: false,
              reason: authFailed ? 'auth_required' : 'db_error',
            },
          })
        );
      } catch {}
      return false;
    }

    // 3. Atualiza perfil do usuário na tabela 'users' se houver alteração
    if (patch.portal_profile) {
      const p = patch.portal_profile;
      try {
        await supabase
          .from('users')
          .upsert(
            {
              email: email,
              full_name: p.name || email,
              avatar_url: p.avatarUrl || null,
            },
            { onConflict: 'email' }
          );
      } catch {}
    }

    delete pendingUpserts[email];
    clearLocalDirty(email, fieldsToClear);
    setSyncAuthRequired(email, false);

    try {
      window.dispatchEvent(
        new CustomEvent('lms_sync_completed', { detail: { resource: 'student_data', success: true } })
      );
    } catch {}
    return true;
  } catch (err) {
    console.warn('[StudentSync] Exceção no upsert da nuvem:', err);
    try {
      window.dispatchEvent(
        new CustomEvent('lms_sync_completed', { detail: { resource: 'student_data', success: false } })
      );
    } catch {}
    return false;
  }
}

async function flushPendingUpserts(email: string): Promise<void> {
  if (!email) return;

  const local = readLocalCache(email);
  const meta = readLocalSyncMeta(email);
  const dirty = meta.dirty || {};
  const payload: StudentSyncPatch = { ...(pendingUpserts[email] || {}) };

  if (dirty.checklist && local.checklistTasks && payload.checklist_tasks === undefined) {
    payload.checklist_tasks = local.checklistTasks;
  }
  if (dirty.av2Simulado && local.av2SimuladoAnswers && payload.av2_simulado === undefined) {
    payload.av2_simulado = local.av2SimuladoAnswers;
  }
  if (dirty.plano && payload.plano_checklist === undefined && payload.livros_lidos === undefined) {
    payload.plano_checklist = local.planoChecklist || [];
    payload.livros_lidos = local.livrosLidos || [];
  }
  if (dirty.progress && payload.completed_lessons === undefined) {
    payload.completed_lessons = local.completedLessons;
  }
  if (dirty.attendance && local.lessonAttendanceStatus && payload.attendance_status === undefined) {
    payload.attendance_status = local.lessonAttendanceStatus;
  }
  if (dirty.notes && payload.student_notes === undefined) {
    payload.student_notes = local.studentNotes;
  }
  if (dirty.cornell && local.cornellNotes && payload.cornell_notes === undefined) {
    payload.cornell_notes = local.cornellNotes;
  }
  if (dirty.profile && local.portalProfile && payload.portal_profile === undefined) {
    payload.portal_profile = local.portalProfile;
  }

  if (Object.keys(payload).length === 0) return;

  try {
    await upsertToCloud(email, payload);
  } catch (err) {
    console.warn('[StudentSync] Exceção ao drenar fila:', err);
  }
}

export async function flushAllPendingStudentSync(userEmail?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const targetEmail = getNormalizedEmail(
    userEmail || localStorage.getItem('lms_active_user_email') || ''
  );
  if (!targetEmail) return;

  if (av2DebounceTimers[targetEmail]) {
    clearTimeout(av2DebounceTimers[targetEmail]);
    delete av2DebounceTimers[targetEmail];
    pendingUpserts[targetEmail] = {
      ...(pendingUpserts[targetEmail] || {}),
      av2_simulado: readLocalCache(targetEmail).av2SimuladoAnswers || {},
    };
  }
  if (planoDebounceTimers[targetEmail]) {
    clearTimeout(planoDebounceTimers[targetEmail]);
    delete planoDebounceTimers[targetEmail];
    const local = readLocalCache(targetEmail);
    pendingUpserts[targetEmail] = {
      ...(pendingUpserts[targetEmail] || {}),
      plano_checklist: local.planoChecklist || [],
      livros_lidos: local.livrosLidos || [],
    };
  }
  if (notesDebounceTimers[targetEmail]) {
    clearTimeout(notesDebounceTimers[targetEmail]);
    delete notesDebounceTimers[targetEmail];
    pendingUpserts[targetEmail] = {
      ...(pendingUpserts[targetEmail] || {}),
      student_notes: localNotesPending[targetEmail] || readLocalCache(targetEmail).studentNotes,
    };
  }
  if (cornellDebounceTimers[targetEmail]) {
    clearTimeout(cornellDebounceTimers[targetEmail]);
    delete cornellDebounceTimers[targetEmail];
    pendingUpserts[targetEmail] = {
      ...(pendingUpserts[targetEmail] || {}),
      cornell_notes: readLocalCache(targetEmail).cornellNotes || {},
    };
  }

  await flushPendingUpserts(targetEmail);
}

// ---------------------------------------------------------------------------
// CACHE LOCAL
// ---------------------------------------------------------------------------

function readLocalCache(
  email: string
): Omit<StudentSyncData, 'lastSyncedAt'> {
  const result: Omit<StudentSyncData, 'lastSyncedAt'> = {
    completedLessons: {},
    lessonAttendanceStatus: {},
    studentNotes: {},
    cornellNotes: {},
    portalProfile: null,
    checklistTasks: null,
    av2SimuladoAnswers: {},
    planoChecklist: [],
    livrosLidos: [],
  };
  if (typeof window === 'undefined' || !email) return result;
  try {
    const p = localStorage.getItem(`lms_progress_${email}`);
    if (p) result.completedLessons = JSON.parse(p);
    const att = localStorage.getItem(`lms_attendance_status_${email}`);
    if (att) result.lessonAttendanceStatus = JSON.parse(att);
    const n = localStorage.getItem(`lms_notes_${email}`);
    if (n) result.studentNotes = JSON.parse(n);
    const c = localStorage.getItem(`lms_cornell_notes_${email}`);
    if (c) result.cornellNotes = JSON.parse(c);
    const prof = localStorage.getItem(`lms_profile_${email}`);
    if (prof) result.portalProfile = JSON.parse(prof);
    const chk = localStorage.getItem(`lms_checklist_${email}`);
    if (chk) result.checklistTasks = JSON.parse(chk);
    const av2 = localStorage.getItem(`lms_av2_simulado_v1_${email}`);
    if (av2) {
      const parsedAv2 = JSON.parse(av2);
      if (parsedAv2 && typeof parsedAv2 === 'object') {
        result.av2SimuladoAnswers = parsedAv2;
      }
    }
    const planoChk = localStorage.getItem(`lms_plano_checklist_${email}`);
    if (planoChk) {
      const parsedPlano = JSON.parse(planoChk);
      if (Array.isArray(parsedPlano)) result.planoChecklist = parsedPlano;
    }
    const livros = localStorage.getItem(`lms_livros_lidos_${email}`);
    if (livros) {
      const parsedLivros = JSON.parse(livros);
      if (Array.isArray(parsedLivros)) result.livrosLidos = parsedLivros;
    }
  } catch (e) {
    console.warn('[StudentSync] Erro ao ler cache local:', e);
  }
  return result;
}

/**
 * Limpa caches secundários e temporários para liberar cota do localStorage
 */
export function cleanupBulkyLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToPurge = [
      'lms_telemetry_events_cache',
      'lms_telemetry_sessions_cache',
      'lms_events_history',
      'lms_sessions_history',
      'lms_collab_topics_cache',
      'lms_collab_replies_cache',
      'lms_collab_prayers_cache',
      'lms_collab_read_receipts',
      'lms_telemetry_cache_v1',
      'lms_active_session_data',
    ];
    for (const k of keysToPurge) {
      localStorage.removeItem(k);
    }
  } catch (_) {}
}

/**
 * Grava no localStorage com proteção contra QuotaExceededError e fallback resiliente
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    // 1. Tenta limpar caches não críticos
    cleanupBulkyLocalStorage();
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (retryErr: any) {
      // 2. Se for um perfil e contiver uma imagem base64 pesada (>30KB), salva localmente sem o avatar para preservar os dados vitais
      if (key.startsWith('lms_profile_')) {
        try {
          const parsed = JSON.parse(value);
          if (parsed && parsed.avatarUrl && parsed.avatarUrl.length > 30000) {
            parsed.avatarUrl = '';
            localStorage.setItem(key, JSON.stringify(parsed));
            return true;
          }
        } catch (_) {}
      }
      console.warn(`[StudentSync] Aviso: Cota local cheia ao salvar chave "${key}". Os dados continuam salvos na Nuvem.`);
      return false;
    }
  }
}

function writeLocalCache(
  email: string,
  data: Omit<StudentSyncData, 'lastSyncedAt'>
): void {
  if (typeof window === 'undefined' || !email) return;

  safeLocalStorageSet(
    `lms_progress_${email}`,
    JSON.stringify(data.completedLessons || {})
  );

  if (data.lessonAttendanceStatus !== undefined) {
    safeLocalStorageSet(
      `lms_attendance_status_${email}`,
      JSON.stringify(data.lessonAttendanceStatus || {})
    );
  }

  safeLocalStorageSet(
    `lms_notes_${email}`,
    JSON.stringify(data.studentNotes || {})
  );

  if (data.cornellNotes !== undefined) {
    safeLocalStorageSet(
      `lms_cornell_notes_${email}`,
      JSON.stringify(data.cornellNotes || {})
    );
  }

  if (data.portalProfile !== null && data.portalProfile !== undefined) {
    safeLocalStorageSet(
      `lms_profile_${email}`,
      JSON.stringify(data.portalProfile)
    );
  }

  if (data.checklistTasks !== null && data.checklistTasks !== undefined) {
    safeLocalStorageSet(
      `lms_checklist_${email}`,
      JSON.stringify(data.checklistTasks)
    );
    mirrorChecklistTasksToLegacyKeys(email, data.checklistTasks);
  }

  if (data.av2SimuladoAnswers !== undefined) {
    safeLocalStorageSet(
      `lms_av2_simulado_v1_${email}`,
      JSON.stringify(data.av2SimuladoAnswers || {})
    );
  }

  if (data.planoChecklist !== undefined) {
    safeLocalStorageSet(
      `lms_plano_checklist_${email}`,
      JSON.stringify(Array.isArray(data.planoChecklist) ? data.planoChecklist : [])
    );
  }

  if (data.livrosLidos !== undefined) {
    safeLocalStorageSet(
      `lms_livros_lidos_${email}`,
      JSON.stringify(Array.isArray(data.livrosLidos) ? data.livrosLidos : [])
    );
  }
}

// ---------------------------------------------------------------------------
// API PÚBLICA
// ---------------------------------------------------------------------------

const STUDENT_DATA_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutos de cache para preservação de Egress

/**
 * Busca os dados do aluno. A Nuvem é a Fonte Única de Verdade (SSOT),
 * com proteção contra perda de progresso local pendente ou legado na nuvem.
 * Utiliza cache TTL de 3 min, bypass único no boot da sessão e desduplicação em trânsito.
 */
export async function fetchStudentData(
  userEmail: string,
  force: boolean = false
): Promise<StudentSyncData> {
  const email = getNormalizedEmail(userEmail);
  const local = readLocalCache(email);

  if (!email) {
    return { ...local, lastSyncedAt: new Date().toISOString() };
  }

  ensureLifecycleFlushRegistered();

  const hasSyncParam =
    typeof window !== 'undefined' && window.location.search.includes('sync=1');
  if (hasSyncParam && typeof window !== 'undefined') {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('sync');
      window.history.replaceState({}, '', url.toString());
    } catch {}
  }

  let isBootFetch = false;
  if (typeof window !== 'undefined') {
    try {
      const bootKey = `lms_sync_boot_${email}`;
      if (!sessionStorage.getItem(bootKey)) {
        isBootFetch = true;
        sessionStorage.setItem(bootKey, '1');
      }
    } catch {}
  }

  const lastFetchKey = `lms_student_sync_last_fetch_${email}`;
  const lastFetch = Number((typeof window !== 'undefined' ? localStorage.getItem(lastFetchKey) : '0') || 0);
  const now = Date.now();
  if (!force && !hasSyncParam && !isBootFetch && now - lastFetch < STUDENT_DATA_CACHE_TTL_MS) {
    return { ...local, lastSyncedAt: new Date().toISOString() };
  }

  if (studentDataInFlight[email]) {
    return studentDataInFlight[email];
  }

  studentDataInFlight[email] = (async () => {
    try {
      const cloud = await loadFromCloud(email);
      const localMeta = readLocalSyncMeta(email);
      const dirty = localMeta.dirty || {};
      const uploadPatch: StudentSyncPatch = {};

      const hasCloudData =
        Object.keys(cloud.completedLessons).length > 0 ||
        (cloud.lessonAttendanceStatus && Object.keys(cloud.lessonAttendanceStatus).length > 0) ||
        Object.keys(cloud.studentNotes).length > 0 ||
        (cloud.cornellNotes && Object.keys(cloud.cornellNotes).length > 0) ||
        cloud.portalProfile !== null ||
        cloud.checklistTasks !== null ||
        (cloud.av2SimuladoAnswers && Object.keys(cloud.av2SimuladoAnswers).length > 0) ||
        (cloud.planoChecklist && cloud.planoChecklist.length > 0) ||
        (cloud.livrosLidos && cloud.livrosLidos.length > 0);

      // 1. Aulas concluídas & presença
      let completedLessons = hasCloudData ? cloud.completedLessons : local.completedLessons;
      if (dirty.progress && Object.keys(local.completedLessons).length > 0) {
        completedLessons = { ...cloud.completedLessons, ...local.completedLessons };
        uploadPatch.completed_lessons = completedLessons;
      }

      const lessonAttendanceStatus =
        dirty.attendance && local.lessonAttendanceStatus
          ? { ...(cloud.lessonAttendanceStatus || {}), ...local.lessonAttendanceStatus }
          : cloud.lessonAttendanceStatus && Object.keys(cloud.lessonAttendanceStatus).length > 0
          ? { ...(local.lessonAttendanceStatus || {}), ...cloud.lessonAttendanceStatus }
          : local.lessonAttendanceStatus || {};
      if (dirty.attendance) {
        uploadPatch.attendance_status = lessonAttendanceStatus;
      }

      // 2. Notas de texto e Cornell
      let studentNotes = cloud.studentNotes || {};
      if (localNotesPending[email]) {
        studentNotes = { ...studentNotes, ...localNotesPending[email] };
      } else if (dirty.notes && local.studentNotes && Object.keys(local.studentNotes).length > 0) {
        studentNotes = { ...cloud.studentNotes, ...local.studentNotes };
        uploadPatch.student_notes = studentNotes;
      } else if (local.studentNotes && Object.keys(local.studentNotes).length > 0) {
        studentNotes = { ...cloud.studentNotes, ...local.studentNotes };
      } else if (!hasCloudData) {
        studentNotes = local.studentNotes;
      }

      let cornellNotes =
        cloud.cornellNotes && Object.keys(cloud.cornellNotes).length > 0
          ? { ...(local.cornellNotes || {}), ...cloud.cornellNotes }
          : local.cornellNotes || {};
      if (dirty.cornell && local.cornellNotes) {
        cornellNotes = { ...(cloud.cornellNotes || {}), ...local.cornellNotes };
        uploadPatch.cornell_notes = cornellNotes;
      }

      // 3. Perfil
      let portalProfile = cloud.portalProfile !== null ? cloud.portalProfile : local.portalProfile;
      if (dirty.profile && local.portalProfile) {
        portalProfile = local.portalProfile;
        uploadPatch.portal_profile = portalProfile;
      }

      // 4. Checklist / Kanban (protege checklist moderno local contra lista legada ou vazia da nuvem)
      const localHasModernChecklist =
        Array.isArray(local.checklistTasks) &&
        local.checklistTasks.length > 0 &&
        !isLegacyChecklistTasks(local.checklistTasks);
      const cloudChecklistIsMissingOrLegacy =
        !Array.isArray(cloud.checklistTasks) ||
        cloud.checklistTasks.length === 0 ||
        isLegacyChecklistTasks(cloud.checklistTasks);

      let checklistTasks: any[] | null;
      if (pendingUpserts[email]?.checklist_tasks !== undefined) {
        checklistTasks = pendingUpserts[email].checklist_tasks!;
      } else if (
        (dirty.checklist && Array.isArray(local.checklistTasks) && local.checklistTasks.length > 0) ||
        (localHasModernChecklist && cloudChecklistIsMissingOrLegacy)
      ) {
        checklistTasks = local.checklistTasks;
        uploadPatch.checklist_tasks = local.checklistTasks!;
      } else if (cloud.checklistTasks !== null) {
        checklistTasks = cloud.checklistTasks;
      } else {
        checklistTasks = local.checklistTasks;
      }

      // 5. Simulados AV2 (Operação AV2)
      const localAv2 = local.av2SimuladoAnswers || {};
      const cloudAv2 = cloud.av2SimuladoAnswers || {};
      const localAv2Count = Object.keys(localAv2).length;
      const cloudAv2Count = Object.keys(cloudAv2).length;

      let av2SimuladoAnswers: Record<string, 'A' | 'B' | 'C' | 'D'>;
      if (pendingUpserts[email]?.av2_simulado !== undefined) {
        av2SimuladoAnswers = pendingUpserts[email].av2_simulado!;
      } else if (
        (dirty.av2Simulado && localAv2Count > 0) ||
        (localAv2Count > 0 && cloudAv2Count === 0)
      ) {
        av2SimuladoAnswers = localAv2;
        uploadPatch.av2_simulado = localAv2;
      } else if (cloudAv2Count > 0) {
        av2SimuladoAnswers = cloudAv2;
      } else {
        av2SimuladoAnswers = localAv2;
      }

      // 6. Plano de Estudos (checklist de entregáveis + livros lidos)
      const localPlano = local.planoChecklist || [];
      const cloudPlano = cloud.planoChecklist || [];
      let planoChecklist: string[];
      if (pendingUpserts[email]?.plano_checklist !== undefined) {
        planoChecklist = pendingUpserts[email].plano_checklist!;
      } else if ((dirty.plano && localPlano.length > 0) || (localPlano.length > 0 && cloudPlano.length === 0)) {
        planoChecklist = localPlano;
        uploadPatch.plano_checklist = localPlano;
      } else if (cloudPlano.length > 0) {
        planoChecklist = cloudPlano;
      } else {
        planoChecklist = localPlano;
      }

      const localLivros = local.livrosLidos || [];
      const cloudLivros = cloud.livrosLidos || [];
      let livrosLidos: string[];
      if (pendingUpserts[email]?.livros_lidos !== undefined) {
        livrosLidos = pendingUpserts[email].livros_lidos!;
      } else if ((dirty.plano && localLivros.length > 0) || (localLivros.length > 0 && cloudLivros.length === 0)) {
        livrosLidos = localLivros;
        uploadPatch.livros_lidos = localLivros;
      } else if (cloudLivros.length > 0) {
        livrosLidos = cloudLivros;
      } else {
        livrosLidos = localLivros;
      }

      const merged = {
        completedLessons,
        lessonAttendanceStatus,
        studentNotes,
        cornellNotes,
        portalProfile,
        checklistTasks,
        av2SimuladoAnswers,
        planoChecklist,
        livrosLidos,
      };

      writeLocalCache(email, merged);
      safeLocalStorageSet(`lms_student_sync_last_fetch_${email}`, String(Date.now()));

      try {
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { email, source: 'cloud_sync' } }));
      } catch {}

      if (Object.keys(uploadPatch).length > 0) {
        upsertToCloud(email, uploadPatch).catch(() => {});
      }

      return { ...merged, lastSyncedAt: new Date().toISOString() };
    } finally {
      delete studentDataInFlight[email];
    }
  })();

  return studentDataInFlight[email]!;
}

export async function saveLessonAttendanceStatus(
  userEmail: string,
  itemKey: string,
  status: LessonAttendanceStatus
): Promise<Record<string, LessonAttendanceStatus>> {
  const email = getNormalizedEmail(userEmail);
  const local = readLocalCache(email);
  const updated = { ...(local.lessonAttendanceStatus || {}), [itemKey]: status };

  if (typeof window !== 'undefined' && email) {
    markLocalDirty(email, ['attendance']);
    safeLocalStorageSet(`lms_attendance_status_${email}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { email, type: 'attendance_status' } }));
  }

  await upsertToCloud(email, {
    attendance_status: updated,
  });

  return updated;
}

export async function saveCompletedLessons(
  userEmail: string,
  completedLessons: Record<string, boolean>
): Promise<void> {
  const email = getNormalizedEmail(userEmail);
  if (!email) return;

  if (typeof window !== 'undefined') {
    markLocalDirty(email, ['progress']);
    safeLocalStorageSet(
      `lms_progress_${email}`,
      JSON.stringify(completedLessons)
    );
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { email } })
    );
  }

  await upsertToCloud(email, { completed_lessons: completedLessons });
}

export function saveStudentNotes(
  userEmail: string,
  studentNotes: Record<string, string>,
  immediate: boolean = false
): void {
  const email = getNormalizedEmail(userEmail);
  if (!email) return;

  ensureLifecycleFlushRegistered();
  localNotesPending[email] = studentNotes;

  if (typeof window !== 'undefined') {
    markLocalDirty(email, ['notes']);
    safeLocalStorageSet(`lms_notes_${email}`, JSON.stringify(studentNotes));
  }

  if (notesDebounceTimers[email]) {
    clearTimeout(notesDebounceTimers[email]);
    delete notesDebounceTimers[email];
  }

  if (immediate) {
    upsertToCloud(email, { student_notes: studentNotes }).then((ok) => {
      if (ok) delete localNotesPending[email];
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(EVENT_NAME, { detail: { email, type: 'notes_saved' } })
        );
      }
    });
    return;
  }

  notesDebounceTimers[email] = setTimeout(async () => {
    delete notesDebounceTimers[email];
    const ok = await upsertToCloud(email, { student_notes: studentNotes });
    if (ok) delete localNotesPending[email];
  }, 3000);
}

const ALL_SUBJECT_PERIOD_MAP: Record<string, number> = {
  // 1º Período
  'Introdução à Teologia': 1, 'Bibliologia': 1, 'Antigo Testamento I - Pentateuco': 1, 'Novo Testamento I - Evangelhos': 1, 'Metodologia Científica': 1,
  // 2º Período
  'Teontologia e Hamartologia': 2, 'Hermenêutica Bíblica': 2, 'Antigo Testamento II - Livros Históricos': 2, 'Novo Testamento II - Atos e Epístolas Paulinas': 2, 'História da Igreja I': 2,
  // 3º Período
  'Cristologia e Soteriologia': 3, 'Pneumatologia': 3, 'História da Igreja II': 3, 'Homilética I': 3, 'Grego Instrumental I': 3,
  // 4º Período
  'Eclesiologia e Angelologia': 4, 'Homilética II': 4, 'Hebraico Instrumental I': 4, 'Teologia Pastoral': 4,
  // 5º Período
  'Escatologia Bíblica': 5, 'Aconselhamento Bíblico I': 5, 'História do Pensamento Cristão I': 5, 'Hebraico Instrumental II': 5, 'Missiologia Teórica': 5,
  // 6º Período
  'Apologética Cristã': 6, 'Liturgia e Cânticos da Igreja': 6, 'Exegese do Antigo Testamento': 6, 'Exegese do Novo Testamento': 6,
  // 7º Período
  'História do Congregacionalismo': 7, 'História do Pensamento Cristão II': 7, 'Aconselhamento Bíblico II': 7, 'Direitos Humanos': 7, 'Ética Cristã': 7, 'Novo Testamento III - Epístolas Gerais': 7, 'Plantação e Revitalização de Igrejas II': 7, 'TCC I': 7, 'História da Cultura Afro Brasileira e Indígena': 7,
  // 8º Período
  'TCC II': 8, 'Estágio Pastoral Supervisado': 8, 'Teologia Contemporânea': 8,
};

export function parsePeriodoToNum(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 7;
  const str = String(val);
  if (str.includes('1º') || str === '1') return 1;
  if (str.includes('2º') || str === '2') return 2;
  if (str.includes('3º') || str === '3') return 3;
  if (str.includes('4º') || str === '4') return 4;
  if (str.includes('5º') || str === '5') return 5;
  if (str.includes('6º') || str === '6') return 6;
  if (str.includes('7º') || str === '7') return 7;
  if (str.includes('8º') || str === '8') return 8;
  if (str.includes('Básico') || str.includes('basico')) return 0;
  return 7;
}

export function formatPeriodoNumToLabel(num: number): string {
  if (num === 0) return 'Curso Básico de Teologia';
  if (num === 1) return '1º Período - Ingressantes';
  if (num === 2) return '2º Período';
  if (num === 3) return '3º Período - Veteranos';
  if (num === 4) return '4º Período';
  if (num === 5) return '5º Período';
  if (num === 6) return '6º Período';
  if (num === 7) return '7º Período - Formandos';
  if (num === 8) return '8º Período - Formandos';
  return `${num}º Período`;
}

export function getAutoMarkedPreviousSubjects(periodoNum: number): string[] {
  if (periodoNum > 1 && periodoNum <= 8) {
    return Object.keys(ALL_SUBJECT_PERIOD_MAP).filter(
      (sName) => ALL_SUBJECT_PERIOD_MAP[sName] < periodoNum
    );
  }
  return [];
}

export async function savePortalProfile(
  userEmail: string,
  portalProfile: any
): Promise<void> {
  const email = getNormalizedEmail(userEmail);
  if (!email) return;

  const rawPNum = portalProfile.periodoNum !== undefined ? portalProfile.periodoNum : portalProfile.periodo;
  const periodoNum = parsePeriodoToNum(rawPNum);
  const autoMarkPrevious = portalProfile.autoMarkPrevious !== undefined ? portalProfile.autoMarkPrevious : true;

  let completedSubjects = portalProfile.completedSubjects || [];
  if (autoMarkPrevious) {
    const autoPrev = getAutoMarkedPreviousSubjects(periodoNum);
    completedSubjects = Array.from(new Set([...completedSubjects, ...autoPrev]));
  }

  const normalizedProfile = {
    ...portalProfile,
    periodoNum,
    periodo: formatPeriodoNumToLabel(periodoNum),
    autoMarkPrevious,
    completedSubjects,
  };

  if (typeof window !== 'undefined') {
    markLocalDirty(email, ['profile']);
    safeLocalStorageSet(
      `lms_profile_${email}`,
      JSON.stringify(normalizedProfile)
    );
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { email } })
    );
  }

  await upsertToCloud(email, { portal_profile: normalizedProfile });
}

export async function saveChecklistTasks(
  userEmail: string,
  tasks: any[]
): Promise<void> {
  const email = getNormalizedEmail(userEmail);
  if (!email) return;

  pendingUpserts[email] = { ...(pendingUpserts[email] || {}), checklist_tasks: tasks };

  if (typeof window !== 'undefined') {
    markLocalDirty(email, ['checklist']);
    safeLocalStorageSet(
      `lms_checklist_${email}`,
      JSON.stringify(tasks)
    );
    mirrorChecklistTasksToLegacyKeys(email, tasks);
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { email } })
    );
  }

  await upsertToCloud(email, { checklist_tasks: tasks });
}

export function saveAv2SimuladoAnswers(
  userEmail: string,
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>,
  immediate: boolean = false
): void {
  const email = getNormalizedEmail(userEmail);
  if (!email) return;

  ensureLifecycleFlushRegistered();
  pendingUpserts[email] = { ...(pendingUpserts[email] || {}), av2_simulado: answers };

  if (typeof window !== 'undefined') {
    markLocalDirty(email, ['av2Simulado']);
    safeLocalStorageSet(
      `lms_av2_simulado_v1_${email}`,
      JSON.stringify(answers || {})
    );
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { email, type: 'av2_simulado_saved' } })
    );
  }

  if (av2DebounceTimers[email]) {
    clearTimeout(av2DebounceTimers[email]);
    delete av2DebounceTimers[email];
  }

  if (immediate) {
    upsertToCloud(email, { av2_simulado: answers }).catch(() => {});
    return;
  }

  av2DebounceTimers[email] = setTimeout(async () => {
    delete av2DebounceTimers[email];
    await upsertToCloud(email, { av2_simulado: answers });
  }, 3000);
}

export function savePlanoEstudosProgress(
  userEmail: string,
  patch: { planoChecklist?: string[]; livrosLidos?: string[] },
  immediate: boolean = false
): void {
  const email = getNormalizedEmail(userEmail);
  if (!email) return;

  ensureLifecycleFlushRegistered();

  if (typeof window !== 'undefined') {
    markLocalDirty(email, ['plano']);
    if (patch.planoChecklist !== undefined) {
      safeLocalStorageSet(
        `lms_plano_checklist_${email}`,
        JSON.stringify(patch.planoChecklist)
      );
    }
    if (patch.livrosLidos !== undefined) {
      safeLocalStorageSet(
        `lms_livros_lidos_${email}`,
        JSON.stringify(patch.livrosLidos)
      );
    }
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { email, type: 'plano_estudos_saved' } })
    );
  }

  const local = readLocalCache(email);
  const nextPlano = patch.planoChecklist !== undefined ? patch.planoChecklist : local.planoChecklist || [];
  const nextLivros = patch.livrosLidos !== undefined ? patch.livrosLidos : local.livrosLidos || [];

  pendingUpserts[email] = {
    ...(pendingUpserts[email] || {}),
    plano_checklist: nextPlano,
    livros_lidos: nextLivros,
  };

  if (planoDebounceTimers[email]) {
    clearTimeout(planoDebounceTimers[email]);
    delete planoDebounceTimers[email];
  }

  if (immediate) {
    upsertToCloud(email, {
      plano_checklist: nextPlano,
      livros_lidos: nextLivros,
    }).catch(() => {});
    return;
  }

  planoDebounceTimers[email] = setTimeout(async () => {
    delete planoDebounceTimers[email];
    await upsertToCloud(email, {
      plano_checklist: nextPlano,
      livros_lidos: nextLivros,
    });
  }, 3000);
}

export async function saveCornellNote(
  userEmail: string,
  note: CornellNote,
  immediate: boolean = false
): Promise<void> {
  const email = getNormalizedEmail(userEmail);
  if (!email || !note.id) return;

  ensureLifecycleFlushRegistered();
  const currentLocal = readLocalCache(email);
  const updatedNotes = {
    ...(currentLocal.cornellNotes || {}),
    [note.id]: {
      ...note,
      user_email: email,
      updated_at: note.updated_at || new Date().toISOString(),
    }
  };

  if (typeof window !== 'undefined') {
    markLocalDirty(email, ['cornell']);
    safeLocalStorageSet(
      `lms_cornell_notes_${email}`,
      JSON.stringify(updatedNotes)
    );
    if (immediate) {
      window.dispatchEvent(
        new CustomEvent(EVENT_NAME, { detail: { email, type: 'cornell_note_saved', noteId: note.id } })
      );
    }
  }

  if (cornellDebounceTimers[email]) {
    clearTimeout(cornellDebounceTimers[email]);
    delete cornellDebounceTimers[email];
  }

  if (immediate) {
    await upsertToCloud(email, { cornell_notes: updatedNotes });
    return;
  }

  cornellDebounceTimers[email] = setTimeout(async () => {
    delete cornellDebounceTimers[email];
    await upsertToCloud(email, { cornell_notes: updatedNotes });
  }, 3000);
}

export async function saveAllCornellNotes(
  userEmail: string,
  notes: Record<string, CornellNote>
): Promise<void> {
  const email = getNormalizedEmail(userEmail);
  if (!email) return;

  if (typeof window !== 'undefined') {
    markLocalDirty(email, ['cornell']);
    safeLocalStorageSet(
      `lms_cornell_notes_${email}`,
      JSON.stringify(notes)
    );
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { email, type: 'cornell_notes_all_saved' } })
    );
  }

  await upsertToCloud(email, { cornell_notes: notes });
}

export async function deleteCornellNote(
  userEmail: string,
  noteId: string
): Promise<void> {
  const email = getNormalizedEmail(userEmail);
  if (!email || !noteId) return;

  const currentLocal = readLocalCache(email);
  const updated = { ...(currentLocal.cornellNotes || {}) };
  delete updated[noteId];

  if (typeof window !== 'undefined') {
    markLocalDirty(email, ['cornell']);
    safeLocalStorageSet(
      `lms_cornell_notes_${email}`,
      JSON.stringify(updated)
    );
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { email, type: 'cornell_note_deleted', noteId } })
    );
  }

  await upsertToCloud(email, { cornell_notes: updated });
}

/**
 * Inscreve o componente para sincronização automática.
 * Inclui:
 * 1. Leitura imediata (com boot bypass único na sessão)
 * 2. Eventos de foco, mudança de visibilidade e armazenamento local
 * 3. Polling suave a cada 5 minutos com preservação de Egress
 */
export function subscribeToStudentSync(
  userEmail: string,
  onSync: (data: StudentSyncData) => void
): () => void {
  const email = getNormalizedEmail(userEmail);
  if (!email) return () => {};

  let destroyed = false;

  const sync = () => {
    if (destroyed) return;
    fetchStudentData(email)
      .then((data) => {
        if (!destroyed) onSync(data);
      })
      .catch(() => {});
  };

  // Sync imediato ao montar o componente
  sync();

  if (typeof window === 'undefined') return () => { destroyed = true; };

  const handleCustomEvent = () => sync();
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key && e.key.includes(email)) sync();
  };
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') sync();
  };
  const handleFocus = () => sync();

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleFocus);

  // Polling suave a cada 5 minutos com preservação de Egress
  const pollInterval = setInterval(() => {
    if (!destroyed && typeof document !== 'undefined' && document.visibilityState === 'visible') {
      sync();
    }
  }, 300000); // 5 minutos

  return () => {
    destroyed = true;
    clearInterval(pollInterval);
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleFocus);
  };
}

/**
 * Chamado quando a sessão OAuth é estabelecida ou renovada.
 */
export async function onSessionRestored(userEmail: string): Promise<void> {
  const email = getNormalizedEmail(userEmail);
  if (!email) return;

  await flushAllPendingStudentSync(email);
  await fetchStudentData(email, true);
}
