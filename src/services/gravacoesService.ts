import { GravacaoAulaItem } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { extractDriveFileId as extractDriveFileIdUtil } from '@/lib/videoUtils';

const STORAGE_KEY = 'lms_gravacoes_v1';
const CLOUD_TITLE_KEY = 'lms_gravacoes_cloud_v1';
const ACTIVE_RECORDINGS_STORAGE_KEY = 'lms_active_recordings_v1';
const ACTIVE_RECORDINGS_CLOUD_TITLE = 'lms_active_recordings_cloud_v1';

export const OFFICIAL_DRIVE_RECORDINGS_FOLDER = 'https://drive.google.com/drive/folders/1hWiyU1z5AUM8VIdBsYmRf3iEYrhYDQ7w';
export const OFFICIAL_DRIVE_FOLDER_ID = '1hWiyU1z5AUM8VIdBsYmRf3iEYrhYDQ7w';

export interface ActiveRecordingSession {
  key: string; // Ex: "disc-1_aula_3_2026-08-26" ou "esc-ter-1"
  disciplinaId: string;
  disciplinaName: string;
  aulaNum: number;
  dataAula: string;
  recordedByName: string;
  recordedByEmail: string;
  startedAt: string; // ISO string
  status: 'recording' | 'completed';
}

// Gravações oficiais pré-carregadas para visualização imediata em qualquer dispositivo (15 aulas)
export const INITIAL_GRAVACOES_SEED: GravacaoAulaItem[] = [
  {
    id: 'rec-seed-aula3-his',
    disciplina_id: 'disc-1',
    disciplina_name: 'História do Congregacionalismo',
    aula_num: 3,
    data_aula: '25/08/2026',
    title: 'Aula 3 • História do Congregacionalismo (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1o03WW9pk6DQWTcgTs13MkLTrjP2GpTMI/view',
    drive_file_id: '1o03WW9pk6DQWTcgTs13MkLTrjP2GpTMI',
    recorded_by_name: 'Monitora Camila / Coordenação',
    recorded_by_role: 'monitor',
    recorded_by_email: 'camila@gmail.com',
    duration_formatted: '01:25:00',
    duration_seconds: 5100,
    is_restricted_lms: true,
    created_at: '25/08/2026',
  },
  {
    id: 'rec-seed-aula3-dir',
    disciplina_id: 'disc-4',
    disciplina_name: 'Direitos Humanos',
    aula_num: 3,
    data_aula: '26/08/2026',
    title: 'Aula 3 • Direitos Humanos (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/16Nfst-Da9-WNQneOWeX3iTaTbXkhMY4j/view?usp=drive_link',
    drive_file_id: '16Nfst-Da9-WNQneOWeX3iTaTbXkhMY4j',
    recorded_by_name: 'Cristiano Sacramento',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '26/08/2026',
  },
  {
    id: 'rec-seed-aula3-tcc',
    disciplina_id: 'disc-8',
    disciplina_name: 'TCC I',
    aula_num: 3,
    data_aula: '28/08/2026',
    title: 'Aula 3 • TCC I (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1f-9i-TpqaZhzoLyrxg6flM6CHTsAOWPj/view',
    drive_file_id: '1f-9i-TpqaZhzoLyrxg6flM6CHTsAOWPj',
    recorded_by_name: 'Cristiano Sacramento',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '28/08/2026',
  },
  {
    id: 'rec-seed-aula3-aco',
    disciplina_id: 'disc-3',
    disciplina_name: 'Aconselhamento Bíblico II',
    aula_num: 3,
    data_aula: '26/08/2026',
    title: 'Aula 3 • Aconselhamento Bíblico II (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1O3pf9XJQ5pZGI8Mn7q0yqA19-6GcCsCy/view',
    drive_file_id: '1O3pf9XJQ5pZGI8Mn7q0yqA19-6GcCsCy',
    recorded_by_name: 'Cristiano Sacramento / Monitoria',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '26/08/2026',
  },
  {
    id: 'rec-seed-aula3-pri',
    disciplina_id: 'disc-7',
    disciplina_name: 'Plantação e Revitalização de Igrejas II',
    aula_num: 3,
    data_aula: '28/08/2026',
    title: 'Aula 3 • Plantação e Revitalização de Igrejas II (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/150PGpMsyfJb_eM_4OfPUfr3oh5EhW1OU/view?usp=drive_link',
    drive_file_id: '150PGpMsyfJb_eM_4OfPUfr3oh5EhW1OU',
    recorded_by_name: 'Monitora Camila / Coordenação',
    recorded_by_role: 'monitor',
    recorded_by_email: 'camilagbalbi@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '28/08/2026',
  },
  {
    id: 'rec-seed-aula3-nt3',
    disciplina_id: 'disc-6',
    disciplina_name: 'Novo Testamento III - Epístolas Gerais',
    aula_num: 3,
    data_aula: '27/08/2026',
    title: 'Aula 3 • Novo Testamento III - Epístolas Gerais (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1iBQGPbiKj8kFVTA9yAS-pQj06a8jAbwz/view',
    drive_file_id: '1iBQGPbiKj8kFVTA9yAS-pQj06a8jAbwz',
    recorded_by_name: 'Monitora Camila / Coordenação',
    recorded_by_role: 'monitor',
    recorded_by_email: 'camilagbalbi@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '27/08/2026',
  },
  {
    id: 'rec-seed-aula3-hpc',
    disciplina_id: 'disc-2',
    disciplina_name: 'História do Pensamento Cristão II',
    aula_num: 3,
    data_aula: '25/08/2026',
    title: 'Aula 3 • História do Pensamento Cristão II (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1bqjPqCWD1Sv5yBssjix0lUqYBYXMEio0/view?usp=drive_link',
    drive_file_id: '1bqjPqCWD1Sv5yBssjix0lUqYBYXMEio0',
    recorded_by_name: 'Cristiano Sacramento / Monitoria',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '25/08/2026',
  },
  {
    id: 'rec-seed-aula3-etc',
    disciplina_id: 'disc-5',
    disciplina_name: 'Ética Cristã',
    aula_num: 3,
    data_aula: '27/08/2026',
    title: 'Aula 3 • Ética Cristã (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC/view',
    drive_file_id: '1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC',
    recorded_by_name: 'Monitora Rosiane',
    recorded_by_role: 'monitor',
    recorded_by_email: 'rosianelcs73@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '27/08/2026',
  },
  {
    id: 'rec-seed-aula3-afr',
    disciplina_id: 'disc-9',
    disciplina_name: 'História da Cultura Afro Brasileira e Indígena',
    aula_num: 3,
    data_aula: '28/08/2026',
    title: 'Aula 3 • História da Cultura Afro Brasileira e Indígena (Gravação HD)',
    video_url: 'https://drive.google.com/drive/folders/1mCp4ZCawhIekLJl3_bcoPiThAqwdzlty?usp=drive_link',
    drive_file_id: '1mCp4ZCawhIekLJl3_bcoPiThAqwdzlty',
    recorded_by_name: 'Cristiano Sacramento',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '28/08/2026',
  },
  {
    id: 'rec-1788042267784-hf135',
    disciplina_id: 'disc-7',
    disciplina_name: 'Plantação e Revitalização de Igrejas II',
    aula_num: 2,
    data_aula: '21/08/2026',
    title: 'Aula 2 • Plantação e Revitalização de Igrejas II (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/10RogTFhXueTAab43iq9q8YphZ5wYiHOY/view?usp=drive_link',
    drive_file_id: '10RogTFhXueTAab43iq9q8YphZ5wYiHOY',
    recorded_by_name: 'Cristiano Sacramento',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '29/08/2026',
  },
  {
    id: 'rec-1788042234924-ksp1i',
    disciplina_id: 'disc-7',
    disciplina_name: 'Plantação e Revitalização de Igrejas II',
    aula_num: 1,
    data_aula: '14/08/2026',
    title: 'Aula 1 • Plantação e Revitalização de Igrejas II (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1qcieEltcCaz7OQOfNBF_Fntfng_ALvta/view?usp=drive_link',
    drive_file_id: '1qcieEltcCaz7OQOfNBF_Fntfng_ALvta',
    recorded_by_name: 'Cristiano Sacramento',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '29/08/2026',
  },
  {
    id: 'rec-1788042201024-44b0o',
    disciplina_id: 'disc-6',
    disciplina_name: 'Novo Testamento III - Epístolas Gerais',
    aula_num: 1,
    data_aula: '13/08/2026',
    title: 'Aula 1 • Novo Testamento III - Epístolas Gerais (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1o_nVApXOXgwYcd-Aw6fKBGzHY_D2bYvV/view?usp=drive_link',
    drive_file_id: '1o_nVApXOXgwYcd-Aw6fKBGzHY_D2bYvV',
    recorded_by_name: 'Cristiano Sacramento',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '29/08/2026',
  },
  {
    id: 'rec-1788042147579-4m9jt',
    disciplina_id: 'disc-2',
    disciplina_name: 'História do Pensamento Cristão II',
    aula_num: 1,
    data_aula: '11/08/2026',
    title: 'Aula 1 • História do Pensamento Cristão II (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1NUGn7pyGR_E3zNBoID07X9C7fSjqIEoI/view?usp=drive_link',
    drive_file_id: '1NUGn7pyGR_E3zNBoID07X9C7fSjqIEoI',
    recorded_by_name: 'Cristiano Sacramento',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '29/08/2026',
  },
  {
    id: 'rec-1788042118901-q3chx',
    disciplina_id: 'disc-1',
    disciplina_name: 'História do Congregacionalismo',
    aula_num: 1,
    data_aula: '11/08/2026',
    title: 'Aula 1 • História do Congregacionalismo (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1UzDyO4u4ysUzBtIG3PnAQUrfOAnpc8kx/view?usp=drive_link',
    drive_file_id: '1UzDyO4u4ysUzBtIG3PnAQUrfOAnpc8kx',
    recorded_by_name: 'Cristiano Sacramento',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '29/08/2026',
  },
  {
    id: 'rec-1788042032628-9j1vg',
    disciplina_id: 'disc-4',
    disciplina_name: 'Direitos Humanos',
    aula_num: 1,
    data_aula: '12/08/2026',
    title: 'Aula 1 • Direitos Humanos (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1Efb3ZJQvIIG5O_A1I9bOU-8aJz8XTxNd/view?usp=drive_link',
    drive_file_id: '1Efb3ZJQvIIG5O_A1I9bOU-8aJz8XTxNd',
    recorded_by_name: 'Cristiano Sacramento',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '29/08/2026',
  },
];

// Reexporta para retrocompatibilidade
export function extractDriveFileId(url: string): string | null {
  return extractDriveFileIdUtil(url);
}

// Formata segundos em HH:MM:SS
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return hours > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Converte data no formato DD/MM/YYYY ou ISO para timestamp numérico
 */
export function parseDateBRToTimestamp(dateStr?: string): number {
  if (!dateStr) return 0;
  const parts = dateStr.trim().split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  }
  const t = new Date(dateStr).getTime();
  return isNaN(t) ? 0 : t;
}

/**
 * Ordena lista de gravações em ordem cronológica decrescente (da aula mais recente para a mais antiga)
 */
export function sortGravacoesChronologicalDesc(list: GravacaoAulaItem[]): GravacaoAulaItem[] {
  return [...list].sort((a, b) => {
    const tA = parseDateBRToTimestamp(a.data_aula || a.created_at);
    const tB = parseDateBRToTimestamp(b.data_aula || b.created_at);
    
    // 1. Data mais recente primeiro
    if (tB !== tA) {
      return tB - tA;
    }
    
    // 2. Desempate: Maior número de aula primeiro (Aula 3 > Aula 2 > Aula 1)
    const aulaA = Number(a.aula_num) || 0;
    const aulaB = Number(b.aula_num) || 0;
    if (aulaB !== aulaA) {
      return aulaB - aulaA;
    }
    
    // 3. Desempate: Nome da disciplina alfabético
    return (a.disciplina_name || '').localeCompare(b.disciplina_name || '');
  });
}

/**
 * Ordena lista de gravações de uma disciplina em ordem cronológica crescente (Aula 1 -> Aula 2 -> Aula 3)
 */
export function sortGravacoesChronologicalAsc(list: GravacaoAulaItem[]): GravacaoAulaItem[] {
  return [...list].sort((a, b) => {
    // 1. Número da aula crescente (Aula 1 antes de Aula 2)
    const tA = new Date(a.created_at || a.data_aula || 0).getTime();
    const tB = new Date(b.created_at || b.data_aula || 0).getTime();
    return tA - tB;
  });
}

const DELETED_GRAVACOES_STORAGE_KEY = 'lms_deleted_gravacoes_ids_v1';
const DELETED_GRAVACOES_CLOUD_TITLE = 'lms_deleted_gravacoes_cloud_v1';

export function getDeletedGravacoesIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_GRAVACOES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function markGravacaoAsDeleted(id: string): void {
  if (typeof window === 'undefined' || !id) return;
  try {
    const current = getDeletedGravacoesIds();
    if (!current.includes(id)) {
      const updated = [...current, id];
      localStorage.setItem(DELETED_GRAVACOES_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {}
}

/**
 * Mescla duas listas de gravações evitando duplicidades por ID ou por (disciplina + aula_num)
 * e ordena cronologicamente da mais recente para a mais antiga, respeitando itens deletados.
 */
function mergeGravacoesLists(primary: GravacaoAulaItem[], fallback: GravacaoAulaItem[]): GravacaoAulaItem[] {
  const deletedIds = new Set(getDeletedGravacoesIds());
  const map = new Map<string, GravacaoAulaItem>();

  // 1. Insere fallback (ex: seeds oficiais) desde que não tenham sido excluídos
  fallback.forEach((item) => {
    if (!item || !item.id || deletedIds.has(item.id)) return;
    map.set(item.id, item);
    if (item.disciplina_id && item.aula_num) {
      map.set(`${item.disciplina_id}_${item.aula_num}`, item);
    }
  });

  // 2. Sobrescreve com itens primários (ex: atualizações locais/nuvem) desde que não tenham sido excluídos
  primary.forEach((item) => {
    if (!item || !item.id || deletedIds.has(item.id)) return;
    map.set(item.id, item);
    if (item.disciplina_id && item.aula_num) {
      map.set(`${item.disciplina_id}_${item.aula_num}`, item);
    }
  });

  // Retorna itens únicos
  const uniqueItems = Array.from(new Map(Array.from(map.values()).map((g) => [g.id, g])).values())
    .filter((g) => !deletedIds.has(g.id));

  const cleaned = uniqueItems.map((item) => ({
    ...item,
    title: (item.title || '')
      .replace(/\(Gravação Oficial HD\)/gi, '(Gravação HD)')
      .replace(/Gravação Oficial HD/gi, 'Gravação HD')
      .replace(/Gravação Oficial/gi, 'Gravação da Aula'),
  }));

  // Retorna ordenado em ordem cronológica decrescente
  return sortGravacoesChronologicalDesc(cleaned);
}

export function getAllGravacoes(): GravacaoAulaItem[] {
  const deletedIds = new Set(getDeletedGravacoesIds());
  if (typeof window === 'undefined') {
    return sortGravacoesChronologicalDesc(INITIAL_GRAVACOES_SEED.filter((g) => !deletedIds.has(g.id)));
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const filteredSeed = INITIAL_GRAVACOES_SEED.filter((g) => !deletedIds.has(g.id));
      const sortedSeed = sortGravacoesChronologicalDesc(filteredSeed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedSeed));
      return sortedSeed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const filteredParsed = parsed.filter((g) => !deletedIds.has(g.id));
      const filteredSeed = INITIAL_GRAVACOES_SEED.filter((g) => !deletedIds.has(g.id));
      const merged = mergeGravacoesLists(filteredParsed, filteredSeed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    const sortedSeed = sortGravacoesChronologicalDesc(INITIAL_GRAVACOES_SEED.filter((g) => !deletedIds.has(g.id)));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedSeed));
    return sortedSeed;
  } catch (e) {
    console.error('Erro ao ler gravações salvas:', e);
    return sortGravacoesChronologicalDesc(INITIAL_GRAVACOES_SEED.filter((g) => !deletedIds.has(g.id)));
  }
}

export function getGravacoesForDisciplina(disciplinaId: string, disciplinaName?: string): GravacaoAulaItem[] {
  const all = getAllGravacoes();
  const targetId = (disciplinaId || '').toLowerCase().trim();
  const targetName = (disciplinaName || '').toLowerCase().trim();

  const filtered = all.filter((g) => {
    const gId = (g.disciplina_id || '').toLowerCase().trim();
    const gName = (g.disciplina_name || '').toLowerCase().trim();

    // 1. Correspondência exata por ID
    if (targetId && gId === targetId) return true;

    // 2. Correspondência exata por nome
    if (targetName && gName === targetName) return true;

    // 3. Correspondência cruzada de nome/código (ex: TCC I, Direitos Humanos)
    if (targetName && gName && (gName.includes(targetName) || targetName.includes(gName))) return true;

    return false;
  });

  // Dentro da disciplina, as aulas são exibidas em ordem sequencial (Aula 1, Aula 2, Aula 3...)
  return sortGravacoesChronologicalAsc(filtered);
}

export function getGravacaoForAula(disciplinaId: string, aulaNum: number, disciplinaName?: string): GravacaoAulaItem | undefined {
  const matchedList = getGravacoesForDisciplina(disciplinaId, disciplinaName);
  return matchedList.find((g) => g.aula_num === aulaNum);
}

export function addGravacao(item: Omit<GravacaoAulaItem, 'id' | 'created_at'>): GravacaoAulaItem {
  const all = getAllGravacoes();
  const driveId = extractDriveFileId(item.video_url);

  const newItem: GravacaoAulaItem = {
    ...item,
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    drive_file_id: driveId || item.drive_file_id,
    is_restricted_lms: true,
    created_at: new Date().toLocaleDateString('pt-BR'),
  };

  // Se já existir uma gravação para a mesma aula e disciplina, atualiza
  const existingIdx = all.findIndex(
    (g) => (g.disciplina_id === item.disciplina_id || g.disciplina_name.toLowerCase().trim() === item.disciplina_name.toLowerCase().trim()) && g.aula_num === item.aula_num
  );

  let updatedList: GravacaoAulaItem[];
  if (existingIdx >= 0) {
    updatedList = [...all];
    updatedList[existingIdx] = newItem;
  } else {
    updatedList = [newItem, ...all];
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent('lms_gravacoes_updated', { detail: newItem }));
      syncGravacoesToCloud(updatedList);
    } catch (e) {
      console.error('Erro ao salvar gravação local:', e);
    }
  }

  return newItem;
}

export function updateGravacao(id: string, patch: Partial<GravacaoAulaItem>): GravacaoAulaItem | null {
  const all = getAllGravacoes();
  const index = all.findIndex((g) => g.id === id);
  if (index < 0) return null;

  const driveId = patch.video_url ? extractDriveFileId(patch.video_url) : all[index].drive_file_id;

  const updated: GravacaoAulaItem = {
    ...all[index],
    ...patch,
    drive_file_id: (driveId || all[index].drive_file_id) || undefined,
  };

  const updatedList = [...all];
  updatedList[index] = updated;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent('lms_gravacoes_updated', { detail: updated }));
      syncGravacoesToCloud(updatedList);
    } catch (e) {
      console.error('Erro ao atualizar gravação:', e);
    }
  }

  return updated;
}

export function deleteGravacao(id: string): void {
  markGravacaoAsDeleted(id);
  const deletedIds = new Set(getDeletedGravacoesIds());
  deletedIds.add(id);

  const all = getAllGravacoes();
  const updated = all.filter((g) => g.id !== id && !deletedIds.has(g.id));

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('lms_gravacoes_updated', { detail: updated }));
      syncGravacoesToCloud(updated, id);
    } catch (e) {
      console.error('Erro ao deletar gravação:', e);
    }
  }
}

/**
 * Persiste as gravações no Supabase via API Route do servidor e fallback no cliente
 */
export async function syncGravacoesToCloud(list: GravacaoAulaItem[], deletedId?: string): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    window.dispatchEvent(new CustomEvent('lms_sync_in_progress', { detail: { resource: 'gravacoes' } }));
  } catch (e) {}

  const deletedIds = getDeletedGravacoesIds();

  // 1. Sincroniza via API Route backend (/api/gravacoes)
  try {
    const res = await fetch('/api/gravacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ list, deletedId, deletedIds }),
    });
    if (res.ok) {
      window.dispatchEvent(new CustomEvent('lms_sync_completed', { detail: { resource: 'gravacoes', success: true } }));
      return;
    }
  } catch (apiErr) {
    console.warn('Fallback: tentando salvar direto no Supabase client:', apiErr);
  }

  // 2. Fallback: salva direto no cliente Supabase
  try {
    const jsonStr = JSON.stringify(list);
    const { data: existing } = await supabase
      .from('materiais')
      .select('id')
      .eq('title', CLOUD_TITLE_KEY)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('materiais')
        .update({ file_url: jsonStr })
        .eq('id', existing[0].id);
    } else {
      await supabase.from('materiais').insert([
        {
          disciplina_id: null,
          title: CLOUD_TITLE_KEY,
          file_url: jsonStr,
          is_native_upload: false,
        },
      ]);
    }

    if (deletedIds.length > 0) {
      const delJson = JSON.stringify(deletedIds);
      const { data: existingDel } = await supabase
        .from('materiais')
        .select('id')
        .eq('title', DELETED_GRAVACOES_CLOUD_TITLE)
        .limit(1);

      if (existingDel && existingDel.length > 0) {
        await supabase
          .from('materiais')
          .update({ file_url: delJson })
          .eq('id', existingDel[0].id);
      } else {
        await supabase.from('materiais').insert([
          {
            disciplina_id: null,
            title: DELETED_GRAVACOES_CLOUD_TITLE,
            file_url: delJson,
            is_native_upload: false,
          },
        ]);
      }
    }

    window.dispatchEvent(new CustomEvent('lms_sync_completed', { detail: { resource: 'gravacoes', success: true } }));
  } catch (err) {
    console.warn('Erro ao salvar gravações no Supabase client:', err);
    window.dispatchEvent(new CustomEvent('lms_sync_completed', { detail: { resource: 'gravacoes', success: false } }));
  }
}

const GRAVACOES_LAST_FETCH_KEY = 'lms_gravacoes_last_fetch_ts';
const GRAVACOES_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos de cache inteligente para economizar tráfego do Supabase

let gravacoesInFlightPromise: Promise<GravacaoAulaItem[]> | null = null;

/**
 * Busca gravações salvas na nuvem e mescla com gravações locais dando prioridade aos dados da nuvem.
 * Utiliza cache TTL e desduplicação de promessas em trânsito para economizar requisições ao Supabase.
 */
export async function fetchGravacoesFromCloud(force: boolean = false): Promise<GravacaoAulaItem[]> {
  if (typeof window === 'undefined') return getAllGravacoes();

  const lastFetch = Number(localStorage.getItem(GRAVACOES_LAST_FETCH_KEY) || 0);
  const now = Date.now();
  if (!force && now - lastFetch < GRAVACOES_CACHE_TTL_MS) {
    return getAllGravacoes();
  }

  if (gravacoesInFlightPromise) {
    return gravacoesInFlightPromise;
  }

  gravacoesInFlightPromise = (async () => {
    try {
      let cloudList: GravacaoAulaItem[] | null = null;

      // 1. Busca via API Route backend (/api/gravacoes)
      try {
        const res = await fetch('/api/gravacoes', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.deletedIds)) {
            data.deletedIds.forEach((id: string) => markGravacaoAsDeleted(id));
          }
          if (data && Array.isArray(data.gravacoes) && data.gravacoes.length > 0) {
            cloudList = data.gravacoes;
          }
        }
      } catch (e) {
        console.warn('Aviso ao consultar /api/gravacoes:', e);
      }

      // 2. Fallback via cliente Supabase se a API não retornou
      if (!cloudList) {
        try {
          // Busca IDs excluídos salvos no Supabase
          const { data: delData } = await supabase
            .from('materiais')
            .select('file_url')
            .eq('title', DELETED_GRAVACOES_CLOUD_TITLE)
            .limit(1);

          if (delData && delData.length > 0 && delData[0].file_url) {
            const parsedDel = JSON.parse(delData[0].file_url);
            if (Array.isArray(parsedDel)) {
              parsedDel.forEach((id: string) => markGravacaoAsDeleted(id));
            }
          }

          const { data, error } = await supabase
            .from('materiais')
            .select('file_url')
            .eq('title', CLOUD_TITLE_KEY)
            .limit(1);

          if (!error && data && data.length > 0 && data[0].file_url) {
            const parsed: GravacaoAulaItem[] = JSON.parse(data[0].file_url);
            if (Array.isArray(parsed) && parsed.length > 0) {
              cloudList = parsed;
            }
          }
        } catch (err) {
          console.warn('Erro ao buscar gravações do Supabase client:', err);
        }
      }

      // 3. Mescla dando PRIORIDADE à Nuvem sobre o cache local antigo do celular/navegador
      const localList = getAllGravacoes();
      const sourceList = cloudList && cloudList.length > 0 ? cloudList : INITIAL_GRAVACOES_SEED;
      
      const mergedList = mergeGravacoesLists(sourceList, localList);

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedList));
        localStorage.setItem(GRAVACOES_LAST_FETCH_KEY, String(Date.now()));
        window.dispatchEvent(new CustomEvent('lms_gravacoes_updated', { detail: mergedList }));
      }

      return mergedList;
    } finally {
      gravacoesInFlightPromise = null;
    }
  })();

  return gravacoesInFlightPromise;
}

// =========================================================================
// GESTÃO DE GRAVAÇÕES ATIVAS EM TEMPO REAL (BLOQUEIO CONCORRENTE ENTRE MONITORES)
// =========================================================================

/**
 * Lê sessões de gravação ativas locais
 */
export function getActiveRecordings(): ActiveRecordingSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ACTIVE_RECORDINGS_STORAGE_KEY);
    if (!raw) return [];
    const list: ActiveRecordingSession[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    // Filtra gravações que iniciaram há mais de 3.5 horas (expiração automática)
    const now = Date.now();
    const valid = list.filter((s) => {
      const started = new Date(s.startedAt).getTime();
      return s.status === 'recording' && now - started < 3.5 * 60 * 60 * 1000;
    });

    const sanitized = valid.map((s) => {
      if (s.recordedByName?.includes('Robson') || s.recordedByEmail?.includes('sacra') || s.recordedByEmail?.includes('riffocristianmision')) {
        return { ...s, recordedByName: 'Monitor Cristiano' };
      }
      return s;
    });

    return sanitized;
  } catch (e) {
    return [];
  }
}

/**
 * Busca sessões de gravação ativas no Supabase (sincronização entre múltiplos navegadores/dispositivos)
 */
export async function fetchActiveRecordingsFromCloud(): Promise<ActiveRecordingSession[]> {
  if (typeof window === 'undefined') return getActiveRecordings();
  try {
    const { data, error } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', ACTIVE_RECORDINGS_CLOUD_TITLE)
      .limit(1);

    if (!error && data && data.length > 0 && data[0].file_url) {
      const parsed: ActiveRecordingSession[] = JSON.parse(data[0].file_url);
      if (Array.isArray(parsed)) {
        const now = Date.now();
        const valid = parsed.filter((s) => {
          const started = new Date(s.startedAt).getTime();
          return s.status === 'recording' && now - started < 3.5 * 60 * 60 * 1000;
        });

        const sanitized = valid.map((s) => {
          if (s.recordedByName?.includes('Robson') || s.recordedByEmail?.includes('sacra') || s.recordedByEmail?.includes('riffocristianmision')) {
            return { ...s, recordedByName: 'Monitor Cristiano' };
          }
          return s;
        });

        localStorage.setItem(ACTIVE_RECORDINGS_STORAGE_KEY, JSON.stringify(sanitized));
        window.dispatchEvent(new CustomEvent('lms_active_recordings_updated', { detail: sanitized }));
        return sanitized;
      }
    }
  } catch (err) {
    console.warn('Aviso ao sincronizar gravações ativas da nuvem:', err);
  }
  return getActiveRecordings();
}

/**
 * Registra o início de uma gravação ativa na nuvem para bloquear os demais monitores
 */
export async function startActiveRecording(
  session: Omit<ActiveRecordingSession, 'startedAt' | 'status'>
): Promise<ActiveRecordingSession> {
  const current = getActiveRecordings();
  const newSession: ActiveRecordingSession = {
    ...session,
    startedAt: new Date().toISOString(),
    status: 'recording',
  };

  const filtered = current.filter((s) => s.key !== session.key);
  const updated = [newSession, ...filtered];

  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTIVE_RECORDINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lms_active_recordings_updated', { detail: updated }));
  }

  // Sincroniza no Supabase imediatamente
  try {
    const jsonStr = JSON.stringify(updated);
    const { data: existing } = await supabase
      .from('materiais')
      .select('id')
      .eq('title', ACTIVE_RECORDINGS_CLOUD_TITLE)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('materiais')
        .update({ file_url: jsonStr })
        .eq('id', existing[0].id);
    } else {
      await supabase.from('materiais').insert([
        {
          disciplina_id: null,
          title: ACTIVE_RECORDINGS_CLOUD_TITLE,
          file_url: jsonStr,
          is_native_upload: false,
        },
      ]);
    }
  } catch (err) {
    console.warn('Aviso ao sincronizar lock de gravação ativa:', err);
  }

  return newSession;
}

/**
 * Finaliza ou cancela uma gravação ativa, liberando a aula
 */
export async function stopActiveRecording(key: string): Promise<void> {
  const current = getActiveRecordings();
  const updated = current.filter((s) => s.key !== key);

  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTIVE_RECORDINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lms_active_recordings_updated', { detail: updated }));
  }

  try {
    const jsonStr = JSON.stringify(updated);
    const { data: existing } = await supabase
      .from('materiais')
      .select('id')
      .eq('title', ACTIVE_RECORDINGS_CLOUD_TITLE)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('materiais')
        .update({ file_url: jsonStr })
        .eq('id', existing[0].id);
    }
  } catch (err) {
    console.warn('Aviso ao remover lock de gravação ativa:', err);
  }
}

/**
 * Força a liberação de todas as gravações ativas (útil para limpar sessões órfãs)
 */
export async function clearAllActiveRecordings(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTIVE_RECORDINGS_STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('lms_active_recordings_updated', { detail: [] }));
  }

  try {
    const { data: existing } = await supabase
      .from('materiais')
      .select('id')
      .eq('title', ACTIVE_RECORDINGS_CLOUD_TITLE)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('materiais')
        .update({ file_url: JSON.stringify([]) })
        .eq('id', existing[0].id);
    }
  } catch (err) {
    console.warn('Aviso ao limpar todas as gravações ativas:', err);
  }
}

/**
 * Força a liberação de uma gravação específica por disciplina e aula
 */
export async function forceClearActiveRecordingForAula(disciplinaId: string, aulaNum?: number): Promise<void> {
  const current = getActiveRecordings();
  const updated = current.filter((s) => {
    if (aulaNum !== undefined) {
      return !(s.disciplinaId === disciplinaId && s.aulaNum === aulaNum);
    }
    return s.disciplinaId !== disciplinaId;
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTIVE_RECORDINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lms_active_recordings_updated', { detail: updated }));
  }

  try {
    const jsonStr = JSON.stringify(updated);
    const { data: existing } = await supabase
      .from('materiais')
      .select('id')
      .eq('title', ACTIVE_RECORDINGS_CLOUD_TITLE)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('materiais')
        .update({ file_url: jsonStr })
        .eq('id', existing[0].id);
    }
  } catch (err) {
    console.warn('Aviso ao liberar gravação ativa por disciplina:', err);
  }
}

/**
 * Verifica se uma aula específica já está sendo gravada por outro monitor
 */
export function isAulaBeingRecordedByOther(
  disciplinaId: string,
  aulaNum: number,
  currentEmail: string
): ActiveRecordingSession | undefined {
  const list = getActiveRecordings();
  const normEmail = (currentEmail || '').toLowerCase().trim();
  return list.find(
    (s) =>
      s.disciplinaId === disciplinaId &&
      s.aulaNum === aulaNum &&
      s.status === 'recording' &&
      s.recordedByEmail.toLowerCase().trim() !== normEmail
  );
}

/**
 * Verifica se uma aula específica já está sendo gravada por qualquer monitor
 */
export function getActiveRecordingForAula(
  disciplinaIdOrTitle: string,
  aulaNum?: number
): ActiveRecordingSession | undefined {
  const list = getActiveRecordings();
  return list.find((s) => {
    const matchDisc =
      s.disciplinaId === disciplinaIdOrTitle ||
      s.disciplinaName.toLowerCase().includes(disciplinaIdOrTitle.toLowerCase()) ||
      disciplinaIdOrTitle.toLowerCase().includes(s.disciplinaName.toLowerCase());
    const matchNum = aulaNum ? s.aulaNum === aulaNum : true;
    return matchDisc && matchNum && s.status === 'recording';
  });
}

export interface UploadRecordingOptions {
  videoFileOrBlob: Blob | File;
  fileName?: string;
  disciplinaId: string;
  disciplinaName: string;
  aulaNum?: number;
  dataAula?: string;
  recordedByName?: string;
  recordedByEmail?: string;
  recordedByRole?: string;
  durationSeconds?: number;
  title?: string;
  folderId?: string;
  onProgress?: (percent: number, statusText?: string) => void;
}

/**
 * Upload direto de arquivos grandes para o Google Drive (Bypassa o limite de 4.5MB da Vercel)
 */
export async function uploadLargeRecordingDirectToDrive(
  options: UploadRecordingOptions
): Promise<{
  success: boolean;
  gravacao: GravacaoAulaItem;
  driveFileId: string;
  webViewLink: string;
}> {
  const {
    videoFileOrBlob,
    fileName = 'aula_gravada.webm',
    disciplinaId,
    disciplinaName,
    aulaNum = 1,
    dataAula = new Date().toLocaleDateString('pt-BR'),
    recordedByName = 'Monitoria UIECB',
    recordedByEmail = 'monitor@uiecbead.com.br',
    recordedByRole = 'monitor',
    durationSeconds = 0,
    title,
    folderId = OFFICIAL_DRIVE_FOLDER_ID,
    onProgress,
  } = options;

  const fileSize = videoFileOrBlob.size;
  const mimeType = videoFileOrBlob.type || 'video/webm';

  // 1. Inicia Resumable Upload no backend (apenas metadados JSON < 1KB)
  const initRes = await fetch('/api/drive/init-resumable-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName,
      fileSize,
      mimeType,
      disciplinaId,
      disciplinaName,
      aulaNum,
      recordedByName,
      folderId,
    }),
  });

  if (!initRes.ok) {
    const errJson = await initRes.json().catch(() => ({}));
    throw new Error(errJson.error || `Erro ${initRes.status} ao iniciar sessão no Google Drive`);
  }

  const { uploadUrl } = await initRes.json();
  if (!uploadUrl) {
    throw new Error('URL de upload direto não retornada pelo servidor.');
  }

  // 2. Envia os bytes diretamente do navegador para o Google Drive
  const driveData = await new Promise<{ id: string; webViewLink?: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', mimeType);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const resJson = JSON.parse(xhr.responseText);
          resolve(resJson);
        } catch (e) {
          resolve({ id: `drive-${Date.now()}` });
        }
      } else {
        reject(new Error(`Erro ${xhr.status} ao enviar bytes para o Google Drive: ${xhr.statusText || xhr.responseText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Falha de rede ao conectar com o Google Drive.'));
    };

    xhr.send(videoFileOrBlob);
  });

  const driveFileId = driveData.id;
  const webViewLink = driveData.webViewLink || `https://drive.google.com/file/d/${driveFileId}/view`;

  // 3. Finaliza a indexação da gravação no Supabase e no LMS
  const finalizeRes = await fetch('/api/drive/finalize-recording', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      driveFileId,
      webViewLink,
      disciplinaId,
      disciplinaName,
      aulaNum,
      dataAula,
      recordedByName,
      recordedByEmail,
      recordedByRole,
      durationSeconds,
      title,
    }),
  });

  const result = await finalizeRes.json().catch(() => ({}));
  const finalGravacao: GravacaoAulaItem = result.gravacao || {
    id: `rec-${Date.now()}`,
    disciplina_id: disciplinaId,
    disciplina_name: disciplinaName,
    aula_num: aulaNum,
    data_aula: dataAula,
    title: title || `Aula ${aulaNum} • ${disciplinaName} (Gravação HD)`,
    video_url: webViewLink,
    drive_file_id: driveFileId,
    recorded_by_name: recordedByName,
    recorded_by_email: recordedByEmail,
    recorded_by_role: (recordedByRole as any) || 'monitor',
    duration_seconds: durationSeconds,
    duration_formatted: formatDuration(durationSeconds),
    is_restricted_lms: true,
    created_at: new Date().toLocaleDateString('pt-BR'),
  };

  addGravacao(finalGravacao);

  return {
    success: true,
    gravacao: finalGravacao,
    driveFileId,
    webViewLink,
  };
}

/**
 * Envia o vídeo gravado diretamente para a pasta oficial do Google Drive via rota de backend
 */
export async function uploadRecordingToGoogleDrive(formData: FormData): Promise<{
  success: boolean;
  gravacao: GravacaoAulaItem;
  driveFileId: string;
  webViewLink: string;
}> {
  const videoFile = formData.get('video') as Blob | File | null;
  if (!videoFile) throw new Error('Nenhum arquivo de vídeo.');

  return uploadLargeRecordingDirectToDrive({
    videoFileOrBlob: videoFile,
    fileName: (videoFile as File).name || (formData.get('title') as string) || 'aula.webm',
    disciplinaId: (formData.get('disciplinaId') as string) || 'disc-1',
    disciplinaName: (formData.get('disciplinaName') as string) || 'Aula',
    aulaNum: Number(formData.get('aulaNum') || 1),
    dataAula: (formData.get('dataAula') as string) || new Date().toLocaleDateString('pt-BR'),
    recordedByName: (formData.get('recordedByName') as string) || 'Monitoria UIECB',
    recordedByEmail: (formData.get('recordedByEmail') as string) || 'monitor@uiecbead.com.br',
    recordedByRole: (formData.get('recordedByRole') as string) || 'monitor',
    durationSeconds: Number(formData.get('durationSeconds') || 0),
    title: (formData.get('title') as string) || undefined,
    folderId: (formData.get('folderId') as string) || OFFICIAL_DRIVE_FOLDER_ID,
  });
}

if (typeof window !== 'undefined') {
  // Busca inicial protegida por TTL (não consome banda se já estiver em cache)
  fetchGravacoesFromCloud();
  fetchActiveRecordingsFromCloud();

  // Polling suave a cada 5 minutos para sincronismo de estado entre monitores
  setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      fetchActiveRecordingsFromCloud();
    }
  }, 300000); // 5 minutos
}
