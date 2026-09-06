import { supabase } from '@/lib/supabaseClient';
import { UserRole } from '@/types';

export interface AulaCanceladaItem {
  id: string; // Ex: "canc_disc-1_28-08-2026"
  disciplina_id: string;
  disciplina_name: string;
  aula_num?: number;
  data_aula: string; // DD/MM/YYYY ou YYYY-MM-DD
  motivo: string;
  autor_nome: string;
  autor_email: string;
  autor_role: UserRole;
  criado_em: string;
  ativo: boolean;
}

const STORAGE_KEY = 'lms_aulas_canceladas_v1';

/**
 * Normaliza qualquer formato de data para comparação robusta (ex: "04/09/2026", "4/9/2026", "2026-09-04")
 */
export function normalizeDateStr(d: string): string {
  if (!d) return '';
  const clean = d.trim();
  // Se estiver no formato YYYY-MM-DD
  if (clean.includes('-') && clean.split('-')[0].length === 4) {
    const [y, m, day] = clean.split('-');
    return `${Number(day)}/${Number(m)}/${y}`;
  }
  // Se estiver no formato DD/MM/YYYY ou D/M/YYYY
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      return `${Number(parts[0])}/${Number(parts[1])}/${parts[2]}`;
    }
  }
  return clean;
}

/**
 * Normaliza o nome da disciplina para comparação sem ruídos de acentos, pontuação e maiúsculas
 */
export function normalizeDiscName(n: string): string {
  return (n || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Extrai o núcleo semântico do nome da disciplina removendo prefixos ("09 - ") e sufixos de professores (" - Emerson Silva")
 */
export function cleanDiscName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^\s*\d+\s*[-–—]\s*/, '')
    .replace(/\s*[-–—]\s*(prof[ªº]?\s*)?[a-z\s]+$/i, '')
    .replace(/[^a-z0-9]/g, '');
}

function getLocalCanceladas(): Record<string, AulaCanceladaItem> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalCanceladas(data: Record<string, AulaCanceladaItem>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('lms_aula_cancelada_updated'));
  } catch (e) {}
}

// Configura listener de storage nativo para sincronizar abas do mesmo navegador
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      window.dispatchEvent(new CustomEvent('lms_aula_cancelada_updated'));
    }
  });

  // Canal Realtime ultra-leve para broadcast entre dispositivos (0 egress)
  try {
    const channel = supabase.channel('lms_aulas_realtime');
    channel
      .on('broadcast', { event: 'aula_cancelada_sync' }, () => {
        fetchAulasCanceladasFromCloud(true);
      })
      .subscribe();
  } catch (err) {}
}

/**
 * Normaliza chave de aula cancelada
 */
export function buildCanceladaKey(disciplinaIdOrName: string, dataAula: string): string {
  const safeName = cleanDiscName(disciplinaIdOrName) || normalizeDiscName(disciplinaIdOrName);
  const safeDate = normalizeDateStr(dataAula).replace(/[^0-9]/g, '-');
  return `canc_${safeName}_${safeDate}`;
}

/**
 * Consulta se uma aula está cancelada para determinada data com tolerância total a formatos
 */
export function getAulaCanceladaStatus(disciplinaId: string, disciplinaName: string, dataAula: string): AulaCanceladaItem | null {
  const map = getLocalCanceladas();
  const normDate = normalizeDateStr(dataAula);
  const cleanTargetName = cleanDiscName(disciplinaName);
  const cleanTargetId = cleanDiscName(disciplinaId);
  const normName = normalizeDiscName(disciplinaName);
  const normId = normalizeDiscName(disciplinaId);

  const keyById = buildCanceladaKey(disciplinaId, dataAula);
  const keyByName = buildCanceladaKey(disciplinaName, dataAula);

  const directItem = map[keyById] || map[keyByName];
  if (directItem && directItem.ativo) return directItem;

  // Busca genérica tolerante a variações de data e nomes
  const found = Object.values(map).find((c) => {
    if (!c.ativo) return false;
    const cDate = normalizeDateStr(c.data_aula);
    const cCleanName = cleanDiscName(c.disciplina_name);
    const cCleanId = cleanDiscName(c.disciplina_id);
    const cNormName = normalizeDiscName(c.disciplina_name);
    const cNormId = normalizeDiscName(c.disciplina_id);

    const matchDate = cDate === normDate || c.data_aula === dataAula;
    const matchDisc = 
      (cleanTargetName && cCleanName && (cleanTargetName === cCleanName || cleanTargetName.includes(cCleanName) || cCleanName.includes(cleanTargetName))) ||
      (cleanTargetId && cCleanId && cleanTargetId === cCleanId) ||
      (normId && cNormId === normId) ||
      (normName && cNormName === normName) ||
      (normName && cNormName.includes(normName)) ||
      (cNormName && normName.includes(cNormName));

    return matchDate && matchDisc;
  });

  return found || null;
}

/**
 * Verifica se a aula informada está configurada como 'não haverá aula' hoje,
 * tanto pelo cancelamento oficial (docência/monitoria) quanto por marcação de 'Não Houve Aula' no painel
 */
export function isAulaCanceladaHoje(disciplinaId: string, disciplinaName: string, userEmail?: string): AulaCanceladaItem | null {
  const now = new Date();
  const localDate = now.toLocaleDateString('pt-BR');
  
  // Data em Brasília
  let brtDate = localDate;
  try {
    brtDate = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(now);
  } catch (e) {}

  // 1. Checagem direta pelo serviço oficial de cancelamento nas datas de hoje
  const cancelStatus =
    getAulaCanceladaStatus(disciplinaId, disciplinaName, localDate) ||
    getAulaCanceladaStatus(disciplinaId, disciplinaName, brtDate);
  if (cancelStatus) return cancelStatus;

  // 2. Checagem ampla em toda a lista ativa de aulas canceladas
  const map = getLocalCanceladas();
  const targetClean = cleanDiscName(disciplinaName) || cleanDiscName(disciplinaId);
  const targetNorm = normalizeDiscName(disciplinaName);

  if (targetClean) {
    const canceladoAmplo = Object.values(map).find((c) => {
      if (!c.ativo) return false;
      const cClean = cleanDiscName(c.disciplina_name) || cleanDiscName(c.disciplina_id);
      const isSameDisc = cClean === targetClean || cClean.includes(targetClean) || targetClean.includes(cClean);
      if (!isSameDisc) return false;

      // Valida se a data do cancelamento é hoje
      const cNormDate = normalizeDateStr(c.data_aula);
      return cNormDate === normalizeDateStr(localDate) || cNormDate === normalizeDateStr(brtDate);
    });

    if (canceladoAmplo) return canceladoAmplo;
  }

  // 3. Checagem no attendance do aluno ('nao_houve') no localStorage
  if (typeof window !== 'undefined') {
    try {
      const keysToCheck: string[] = [];
      if (userEmail) {
        keysToCheck.push(`lms_attendance_${userEmail.toLowerCase().trim()}`);
      }
      // Varre possíveis registros de presença salvos
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('lms_attendance_')) {
          keysToCheck.push(k);
        }
      }

      for (const storageKey of keysToCheck) {
        const raw = localStorage.getItem(storageKey);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        for (const [attendanceKey, statusVal] of Object.entries(parsed)) {
          if (statusVal === 'nao_houve') {
            const cleanAttKey = cleanDiscName(attendanceKey);
            if (cleanAttKey && (cleanAttKey === targetClean || cleanAttKey.includes(targetClean) || targetClean.includes(cleanAttKey))) {
              return {
                id: `canc_attendance_${disciplinaId}`,
                disciplina_id: disciplinaId,
                disciplina_name: disciplinaName,
                data_aula: localDate,
                motivo: 'Configurado como Não Houve Aula nesta data.',
                autor_nome: 'Aluno / Monitoria',
                autor_email: userEmail || '',
                autor_role: 'aluno',
                criado_em: new Date().toISOString(),
                ativo: true,
              };
            }
          }
        }
      }
    } catch (e) {}
  }

  return null;
}

/**
 * Retorna todas as aulas canceladas ativas
 */
export function getAllAulasCanceladas(): AulaCanceladaItem[] {
  const map = getLocalCanceladas();
  return Object.values(map).filter((c) => c.ativo);
}

/**
 * Registra o cancelamento de uma aula com motivo informado
 */
export async function cancelarAula(params: {
  disciplinaId: string;
  disciplinaName: string;
  aulaNum?: number;
  dataAula: string;
  motivo: string;
  autorNome: string;
  autorEmail: string;
  autorRole: UserRole;
}): Promise<AulaCanceladaItem> {
  const key = buildCanceladaKey(params.disciplinaId, params.dataAula);
  const item: AulaCanceladaItem = {
    id: key,
    disciplina_id: params.disciplinaId,
    disciplina_name: params.disciplinaName,
    aula_num: params.aulaNum,
    data_aula: params.dataAula,
    motivo: params.motivo.trim() || 'Imprevisto com o corpo docente. Aula suspensa nesta data.',
    autor_nome: params.autorNome,
    autor_email: params.autorEmail,
    autor_role: params.autorRole,
    criado_em: new Date().toISOString(),
    ativo: true,
  };

  const map = getLocalCanceladas();
  map[key] = item;
  saveLocalCanceladas(map);

  // Sincroniza com Supabase se disponível
  try {
    await supabase.from('lms_aulas_canceladas').upsert({
      id: key,
      disciplina_id: params.disciplinaId,
      disciplina_name: params.disciplinaName,
      aula_num: params.aulaNum,
      data_aula: params.dataAula,
      motivo: item.motivo,
      autor_nome: params.autorNome,
      autor_email: params.autorEmail,
      autor_role: params.autorRole,
      ativo: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    // Dispara broadcast Realtime para todos os outros clientes conectados
    const channel = supabase.channel('lms_aulas_realtime');
    await channel.send({
      type: 'broadcast',
      event: 'aula_cancelada_sync',
      payload: { key, disciplinaName: params.disciplinaName, dataAula: params.dataAula }
    });
  } catch (e) {
    // Fallback offline garantido
  }

  return item;
}

/**
 * Reativa uma aula cancelada (desfaz o cancelamento)
 */
export async function reativarAula(disciplinaId: string, dataAula: string): Promise<void> {
  const key = buildCanceladaKey(disciplinaId, dataAula);
  const map = getLocalCanceladas();
  if (map[key]) {
    map[key].ativo = false;
    saveLocalCanceladas(map);
  }

  // Também desativa qualquer chave pelo nome caso tenha sido gerada diferente
  Object.values(map).forEach((item) => {
    if (
      (item.disciplina_id === disciplinaId || normalizeDiscName(item.disciplina_name) === normalizeDiscName(disciplinaId)) &&
      normalizeDateStr(item.data_aula) === normalizeDateStr(dataAula)
    ) {
      item.ativo = false;
    }
  });
  saveLocalCanceladas(map);

  try {
    await supabase.from('lms_aulas_canceladas').update({
      ativo: false,
      updated_at: new Date().toISOString(),
    }).eq('id', key);

    const channel = supabase.channel('lms_aulas_realtime');
    await channel.send({
      type: 'broadcast',
      event: 'aula_cancelada_sync',
      payload: { key, reativada: true }
    });
  } catch (e) {}
}

let lastCanceladasFetchTime = 0;
const CANCELADAS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de cache

/**
 * Sincroniza do Supabase
 */
export async function fetchAulasCanceladasFromCloud(force: boolean = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastCanceladasFetchTime < CANCELADAS_CACHE_TTL_MS) {
    return;
  }

  try {
    const { data, error } = await supabase
      .from('lms_aulas_canceladas')
      .select('*')
      .eq('ativo', true);

    lastCanceladasFetchTime = Date.now();

    if (!error && data) {
      const map = getLocalCanceladas();
      data.forEach((row: any) => {
        map[row.id] = {
          id: row.id,
          disciplina_id: row.disciplina_id,
          disciplina_name: row.disciplina_name,
          aula_num: row.aula_num,
          data_aula: row.data_aula,
          motivo: row.motivo,
          autor_nome: row.autor_nome,
          autor_email: row.autor_email,
          autor_role: row.autor_role,
          criado_em: row.created_at || row.updated_at,
          ativo: row.ativo,
        };
      });
      saveLocalCanceladas(map);
    }
  } catch (e) {}
}
