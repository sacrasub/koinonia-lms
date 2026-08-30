import { supabase } from '@/lib/supabaseClient';
import { UserRole } from '@/types';

export interface AulaCanceladaItem {
  id: string; // Ex: "canc_disc-1_28-08-2026"
  disciplina_id: string;
  disciplina_name: string;
  aula_num?: number;
  data_aula: string; // DD/MM/YYYY
  motivo: string;
  autor_nome: string;
  autor_email: string;
  autor_role: UserRole;
  criado_em: string;
  ativo: boolean;
}

const STORAGE_KEY = 'lms_aulas_canceladas_v1';

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

/**
 * Normaliza chave de aula cancelada
 */
export function buildCanceladaKey(disciplinaIdOrName: string, dataAula: string): string {
  const safeName = (disciplinaIdOrName || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const safeDate = (dataAula || '').replace(/[^0-9]/g, '-');
  return `canc_${safeName}_${safeDate}`;
}

/**
 * Consulta se uma aula está cancelada para determinada data
 */
export function getAulaCanceladaStatus(disciplinaId: string, disciplinaName: string, dataAula: string): AulaCanceladaItem | null {
  const map = getLocalCanceladas();
  const keyById = buildCanceladaKey(disciplinaId, dataAula);
  const keyByName = buildCanceladaKey(disciplinaName, dataAula);

  const item = map[keyById] || map[keyByName];
  if (item && item.ativo) return item;

  // Busca genérica por nome e data
  const found = Object.values(map).find(
    (c) =>
      c.ativo &&
      c.data_aula === dataAula &&
      (c.disciplina_id === disciplinaId || c.disciplina_name.toLowerCase().trim() === disciplinaName.toLowerCase().trim())
  );
  return found || null;
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

  try {
    await supabase.from('lms_aulas_canceladas').update({
      ativo: false,
      updated_at: new Date().toISOString(),
    }).eq('id', key);
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
