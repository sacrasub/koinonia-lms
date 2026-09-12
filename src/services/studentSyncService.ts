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
  lastSyncedAt?: string;
}

const EVENT_NAME = 'lms_student_sync_updated';
const notesDebounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
const pendingUpserts: Record<string, any> = {};
const localNotesPending: Record<string, Record<string, string>> = {};
const studentDataInFlight: Record<string, Promise<any> | undefined> = {};

export function getNormalizedEmail(userEmail?: string): string {
  if (!userEmail || userEmail.trim() === '') return '';
  return userEmail.toLowerCase().trim();
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
      const studentNotes = rawNotes.textNotes ? rawNotes.textNotes : rawNotes;
      const cornellNotes = rawNotes.cornellNotes || {};
      const lessonAttendanceStatus = rawNotes.lessonAttendanceStatus || {};

      return {
        completedLessons: row.completed_lessons || {},
        lessonAttendanceStatus: lessonAttendanceStatus || {},
        studentNotes: studentNotes || {},
        cornellNotes: cornellNotes || {},
        portalProfile: row.portal_profile || null,
        checklistTasks: row.checklist_tasks || null,
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
        };

        // Migra automaticamente em background para a tabela dedicada student_sync
        (async () => {
          try {
            await supabase.from('student_sync').upsert(
              {
                email,
                completed_lessons: legacyResult.completedLessons,
                student_notes: {
                  textNotes: legacyResult.studentNotes,
                  cornellNotes: legacyResult.cornellNotes,
                  lessonAttendanceStatus: legacyResult.lessonAttendanceStatus,
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

/**
 * Upsert na nuvem.
 * Persiste na tabela dedicada student_sync (SSOT oficial) e users.
 * Elimina o double-upsert na tabela materiais, economizando 50% de egress de gravação.
 */
async function upsertToCloud(
  email: string,
  patch: Partial<{
    completed_lessons: Record<string, boolean>;
    student_notes: Record<string, string>;
    cornell_notes: Record<string, CornellNote>;
    portal_profile: any;
    checklist_tasks: any[];
  }>
): Promise<void> {
  if (!email) return;

  try {
    window.dispatchEvent(new CustomEvent('lms_sync_in_progress', { detail: { resource: 'student_data' } }));
  } catch (e) {}

  // Enfileira localmente em caso de falha de rede
  pendingUpserts[email] = { ...(pendingUpserts[email] || {}), ...patch };

  try {
    // Usa dados do cache local (SSOT instantânea no cliente) para mesclar sem download redundante
    const local = readLocalCache(email);

    const mergedPayload = {
      completedLessons: patch.completed_lessons !== undefined
        ? { ...local.completedLessons, ...patch.completed_lessons }
        : local.completedLessons,
      studentNotes: patch.student_notes !== undefined
        ? { ...local.studentNotes, ...patch.student_notes }
        : local.studentNotes,
      cornellNotes: patch.cornell_notes !== undefined
        ? { ...(local.cornellNotes || {}), ...patch.cornell_notes }
        : (local.cornellNotes || {}),
      portalProfile: patch.portal_profile !== undefined
        ? patch.portal_profile
        : local.portalProfile,
      checklistTasks: patch.checklist_tasks !== undefined
        ? patch.checklist_tasks
        : local.checklistTasks,
      updatedAt: new Date().toISOString(),
    };

    // 1. Grava exclusivamente na tabela dedicada 'student_sync' (SSOT de alto desempenho)
    const notesPayload = {
      textNotes: mergedPayload.studentNotes || {},
      cornellNotes: mergedPayload.cornellNotes || {},
      lessonAttendanceStatus: local.lessonAttendanceStatus || {},
    };

    const { error: syncErr } = await supabase.from('student_sync').upsert(
      {
        email,
        completed_lessons: mergedPayload.completedLessons,
        student_notes: notesPayload,
        portal_profile: mergedPayload.portalProfile,
        checklist_tasks: mergedPayload.checklistTasks,
        updated_at: mergedPayload.updatedAt,
      },
      { onConflict: 'email' }
    );

    const cloudSaved = !syncErr;

    // 2. Atualiza perfil do usuário na tabela 'users' se houver alteração
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

    if (cloudSaved) {
      delete pendingUpserts[email];
      try {
        window.dispatchEvent(new CustomEvent('lms_sync_completed', { detail: { resource: 'student_data', success: true } }));
      } catch (e) {}
    }
  } catch (err) {
    console.warn('[StudentSync] Exceção no upsert da nuvem:', err);
    try {
      window.dispatchEvent(new CustomEvent('lms_sync_completed', { detail: { resource: 'student_data', success: false } }));
    } catch (e) {}
  }
}

async function flushPendingUpserts(email: string): Promise<void> {
  if (!pendingUpserts[email]) return;
  const payload = { ...pendingUpserts[email] };
  try {
    await upsertToCloud(email, payload);
  } catch (err) {
    console.warn('[StudentSync] Exceção ao drenar fila:', err);
  }
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
  }
}

// ---------------------------------------------------------------------------
// API PÚBLICA
// ---------------------------------------------------------------------------

const STUDENT_DATA_CACHE_TTL_MS = 8 * 60 * 1000; // 8 minutos de cache inteligente para preservação de Egress

/**
 * Busca os dados do aluno. A Nuvem é a Fonte Única de Verdade (SSOT).
 * Se a busca na nuvem for bem sucedida, atualiza o cache local de forma prioritária.
 * Se a nuvem falhar (offline), usa o cache local como fallback.
 * Utiliza cache TTL e desduplicação em trânsito para economizar requisições e tráfego do Supabase.
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

  const lastFetchKey = `lms_student_sync_last_fetch_${email}`;
  const lastFetch = Number(localStorage.getItem(lastFetchKey) || 0);
  const now = Date.now();
  if (!force && now - lastFetch < STUDENT_DATA_CACHE_TTL_MS) {
    return { ...local, lastSyncedAt: new Date().toISOString() };
  }

  if (studentDataInFlight[email]) {
    return studentDataInFlight[email];
  }

  studentDataInFlight[email] = (async () => {
    try {
      const cloud = await loadFromCloud(email);

      // A Nuvem (Supabase DB) é a Fonte Única de Verdade (SSOT).
      const hasCloudData =
        Object.keys(cloud.completedLessons).length > 0 ||
        (cloud.lessonAttendanceStatus && Object.keys(cloud.lessonAttendanceStatus).length > 0) ||
        Object.keys(cloud.studentNotes).length > 0 ||
        (cloud.cornellNotes && Object.keys(cloud.cornellNotes).length > 0) ||
        cloud.portalProfile !== null ||
        cloud.checklistTasks !== null;

      const completedLessons = hasCloudData ? cloud.completedLessons : local.completedLessons;
      const lessonAttendanceStatus = (cloud.lessonAttendanceStatus && Object.keys(cloud.lessonAttendanceStatus).length > 0)
        ? { ...(local.lessonAttendanceStatus || {}), ...cloud.lessonAttendanceStatus }
        : (local.lessonAttendanceStatus || {});

      // Blindagem de notas durante a digitação:
      let studentNotes = cloud.studentNotes || {};
      if (localNotesPending[email]) {
        studentNotes = { ...studentNotes, ...localNotesPending[email] };
      } else if (local.studentNotes && Object.keys(local.studentNotes).length > 0) {
        studentNotes = { ...cloud.studentNotes, ...local.studentNotes };
      } else if (!hasCloudData) {
        studentNotes = local.studentNotes;
      }

      const cornellNotes = (cloud.cornellNotes && Object.keys(cloud.cornellNotes).length > 0)
        ? { ...(local.cornellNotes || {}), ...cloud.cornellNotes }
        : (local.cornellNotes || {});

      // DADOS BIOGRÁFICOS / PERFIL: A nuvem tem prioridade absoluta sobre o cache antigo do celular
      const portalProfile = cloud.portalProfile !== null ? cloud.portalProfile : local.portalProfile;
      const checklistTasks = cloud.checklistTasks !== null ? cloud.checklistTasks : local.checklistTasks;

      const merged = { completedLessons, lessonAttendanceStatus, studentNotes, cornellNotes, portalProfile, checklistTasks };
      
      // Atualiza o cache local (localStorage) com os dados recém-chegados da nuvem
      writeLocalCache(email, merged);
      safeLocalStorageSet(`lms_student_sync_last_fetch_${email}`, String(Date.now()));

      try {
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { email, source: 'cloud_sync' } }));
      } catch (e) {}

      return { ...merged, lastSyncedAt: new Date().toISOString() };
    } finally {
      delete studentDataInFlight[email];
    }
  })();

  return studentDataInFlight[email];
}

export async function saveLessonAttendanceStatus(
  userEmail: string,
  itemKey: string,
  status: LessonAttendanceStatus
): Promise<Record<string, LessonAttendanceStatus>> {
  const email = getNormalizedEmail(userEmail);
  const local = readLocalCache(email);
  const updated = { ...(local.lessonAttendanceStatus || {}), [itemKey]: status };

  if (typeof window !== 'undefined') {
    safeLocalStorageSet(`lms_attendance_status_${email}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { email, type: 'attendance_status' } }));
  }

  await upsertToCloud(email, {
    completed_lessons: local.completedLessons,
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

  // Armazena no buffer de edição local pendente para blindar contra race conditions
  localNotesPending[email] = studentNotes;

  if (typeof window !== 'undefined') {
    safeLocalStorageSet(`lms_notes_${email}`, JSON.stringify(studentNotes));
  }

  if (notesDebounceTimers[email]) {
    clearTimeout(notesDebounceTimers[email]);
    delete notesDebounceTimers[email];
  }

  if (immediate) {
    upsertToCloud(email, { student_notes: studentNotes }).then(() => {
      delete localNotesPending[email];
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(EVENT_NAME, { detail: { email, type: 'notes_saved' } })
        );
      }
    });
    return;
  }

  notesDebounceTimers[email] = setTimeout(async () => {
    await upsertToCloud(email, { student_notes: studentNotes });
    delete notesDebounceTimers[email];
    delete localNotesPending[email];
  }, 1500);
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

  if (typeof window !== 'undefined') {
    safeLocalStorageSet(
      `lms_checklist_${email}`,
      JSON.stringify(tasks)
    );
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { email } })
    );
  }

  await upsertToCloud(email, { checklist_tasks: tasks });
}

const cornellDebounceTimers: Record<string, NodeJS.Timeout> = {};

export async function saveCornellNote(
  userEmail: string,
  note: CornellNote,
  immediate: boolean = false
): Promise<void> {
  const email = getNormalizedEmail(userEmail);
  if (!email || !note.id) return;

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
    await upsertToCloud(email, { cornell_notes: updatedNotes });
    delete cornellDebounceTimers[email];
  }, 1500);
}

export async function saveAllCornellNotes(
  userEmail: string,
  notes: Record<string, CornellNote>
): Promise<void> {
  const email = getNormalizedEmail(userEmail);
  if (!email) return;

  if (typeof window !== 'undefined') {
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
 * 1. Leitura imediata
 * 2. Eventos de foco, mudança de visibilidade e armazenamento local
 * 3. Polling automático a cada 5 segundos se a aba estiver visível (garante sync PC ↔ Celular sem recarregar)
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
    if (notesDebounceTimers[email]) {
      clearTimeout(notesDebounceTimers[email]);
      delete notesDebounceTimers[email];
    }
  };
}

/**
 * Chamado quando a sessão OAuth é estabelecida.
 */
export async function onSessionRestored(userEmail: string): Promise<void> {
  const email = getNormalizedEmail(userEmail);
  if (!email) return;

  await flushPendingUpserts(email);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { email, type: 'session_restored' } })
    );
  }
}
