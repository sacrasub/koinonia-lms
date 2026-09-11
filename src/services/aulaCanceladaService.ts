import { supabase } from '@/lib/supabaseClient';
import { UserRole } from '@/types';

export type TipoProvidencia = 'cancelamento' | 'aula_dupla' | 'substituicao';

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
  // Campos de Providência Docente (Aula Dupla / Substituição)
  tipo_providencia?: TipoProvidencia;
  substituto_disciplina_id?: string;
  substituto_disciplina_name?: string;
  substituto_professor_name?: string;
  substituto_meet_url?: string;
  substituto_presenca_url?: string;
  substituto_observacoes?: string;
  // Campos de Aula Gravada & Trabalho em PDF (Aviso Unificado)
  video_url?: string;
  arquivo_url?: string;
  arquivo_nome?: string;
  trabalho_instrucoes?: string;
  trabalho_prazo?: string;
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
 * Extrai o núcleo semântico do nome da disciplina removendo prefixos ("09 - ") e sufixos de professores (" - Alexsandro" / " - Emerson Silva")
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
  if (directItem && directItem.ativo) return hydrateCanceladaItem(directItem);

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

  return found ? hydrateCanceladaItem(found) : null;
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
  if (cancelStatus) return hydrateCanceladaItem(cancelStatus);

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

    if (canceladoAmplo) return hydrateCanceladaItem(canceladoAmplo);
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
  return Object.values(map).filter((c) => c.ativo).map((c) => hydrateCanceladaItem(c)!);
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
  tipoProvidencia?: TipoProvidencia;
  videoUrl?: string;
  arquivoUrl?: string;
  arquivoNome?: string;
  trabalhoInstrucoes?: string;
  trabalhoPrazo?: string;
}): Promise<AulaCanceladaItem> {
  const key = buildCanceladaKey(params.disciplinaId, params.dataAula);
  const motivoFormatado = formatProvidenciaMotivo({
    tipoProvidencia: params.tipoProvidencia || 'cancelamento',
    motivoTexto: params.motivo,
    videoUrl: params.videoUrl,
    arquivoUrl: params.arquivoUrl,
    arquivoNome: params.arquivoNome,
    trabalhoInstrucoes: params.trabalhoInstrucoes,
    trabalhoPrazo: params.trabalhoPrazo,
  });

  const item: AulaCanceladaItem = {
    id: key,
    disciplina_id: params.disciplinaId,
    disciplina_name: params.disciplinaName,
    aula_num: params.aulaNum,
    data_aula: params.dataAula,
    motivo: motivoFormatado,
    autor_nome: params.autorNome,
    autor_email: params.autorEmail,
    autor_role: params.autorRole,
    criado_em: new Date().toISOString(),
    ativo: true,
    tipo_providencia: params.tipoProvidencia || 'cancelamento',
    video_url: params.videoUrl,
    arquivo_url: params.arquivoUrl,
    arquivo_nome: params.arquivoNome,
    trabalho_instrucoes: params.trabalhoInstrucoes,
    trabalho_prazo: params.trabalhoPrazo,
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
      motivo: motivoFormatado,
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

/**
 * Serializa dados de providência dentro do campo motivo para compatibilidade absoluta com o Supabase
 */
export function formatProvidenciaMotivo(params: {
  tipoProvidencia: TipoProvidencia;
  motivoTexto: string;
  substitutoDisciplinaId?: string;
  substitutoDisciplinaName?: string;
  substitutoProfessorName?: string;
  substitutoMeetUrl?: string;
  substitutoPresencaUrl?: string;
  substitutoObservacoes?: string;
  videoUrl?: string;
  arquivoUrl?: string;
  arquivoNome?: string;
  trabalhoInstrucoes?: string;
  trabalhoPrazo?: string;
}): string {
  const hasExtra = params.tipoProvidencia !== 'cancelamento' ||
    Boolean(params.videoUrl || params.arquivoUrl || params.arquivoNome || params.trabalhoInstrucoes || params.trabalhoPrazo);

  if (!hasExtra) {
    return params.motivoTexto.trim() || 'Imprevisto com o corpo docente. Aula suspensa nesta data.';
  }

  const meta = {
    tipo: params.tipoProvidencia,
    sub_disc_id: params.substitutoDisciplinaId || '',
    sub_disc_name: params.substitutoDisciplinaName || '',
    sub_prof_name: params.substitutoProfessorName || '',
    sub_meet_url: params.substitutoMeetUrl || '',
    sub_presenca_url: params.substitutoPresencaUrl || '',
    sub_obs: params.substitutoObservacoes || '',
    video_url: params.videoUrl || '',
    arquivo_url: params.arquivoUrl || '',
    arquivo_nome: params.arquivoNome || '',
    trabalho_instrucoes: params.trabalhoInstrucoes || '',
    trabalho_prazo: params.trabalhoPrazo || '',
  };

  return `[PROVIDENCIA_JSON]:${JSON.stringify(meta)}[FIM] ${params.motivoTexto.trim()}`;
}

/**
 * Deserializa o campo motivo caso contenha metadados de providência
 */
export function parseProvidenciaMotivo(motivoRaw: string): {
  motivoLimpo: string;
  tipoProvidencia: TipoProvidencia;
  substitutoDisciplinaId?: string;
  substitutoDisciplinaName?: string;
  substitutoProfessorName?: string;
  substitutoMeetUrl?: string;
  substitutoPresencaUrl?: string;
  substitutoObservacoes?: string;
  videoUrl?: string;
  arquivoUrl?: string;
  arquivoNome?: string;
  trabalhoInstrucoes?: string;
  trabalhoPrazo?: string;
} {
  if (!motivoRaw) {
    return { motivoLimpo: '', tipoProvidencia: 'cancelamento' };
  }

  if (motivoRaw.startsWith('[PROVIDENCIA_JSON]:')) {
    try {
      const fimIdx = motivoRaw.indexOf('[FIM]');
      if (fimIdx > -1) {
        const jsonStr = motivoRaw.substring('[PROVIDENCIA_JSON]:'.length, fimIdx);
        const meta = JSON.parse(jsonStr);
        const motivoLimpo = motivoRaw.substring(fimIdx + 5).trim();
        return {
          motivoLimpo,
          tipoProvidencia: (meta.tipo as TipoProvidencia) || 'cancelamento',
          substitutoDisciplinaId: meta.sub_disc_id,
          substitutoDisciplinaName: meta.sub_disc_name,
          substitutoProfessorName: meta.sub_prof_name,
          substitutoMeetUrl: meta.sub_meet_url,
          substitutoPresencaUrl: meta.sub_presenca_url,
          substitutoObservacoes: meta.sub_obs,
          videoUrl: meta.video_url || '',
          arquivoUrl: meta.arquivo_url || '',
          arquivoNome: meta.arquivo_nome || '',
          trabalhoInstrucoes: meta.trabalho_instrucoes || '',
          trabalhoPrazo: meta.trabalho_prazo || '',
        };
      }
    } catch (e) {}
  }

  return {
    motivoLimpo: motivoRaw,
    tipoProvidencia: 'cancelamento',
  };
}

/**
 * Hidrata item de aula cancelada preenchendo campos internos a partir do motivo serializado
 */
export function hydrateCanceladaItem(item: AulaCanceladaItem | null): AulaCanceladaItem | null {
  if (!item) return null;
  if (item.motivo && item.motivo.startsWith('[PROVIDENCIA_JSON]:')) {
    const parsed = parseProvidenciaMotivo(item.motivo);
    return {
      ...item,
      tipo_providencia: item.tipo_providencia || parsed.tipoProvidencia,
      substituto_disciplina_id: item.substituto_disciplina_id || parsed.substitutoDisciplinaId,
      substituto_disciplina_name: item.substituto_disciplina_name || parsed.substitutoDisciplinaName,
      substituto_professor_name: item.substituto_professor_name || parsed.substitutoProfessorName,
      substituto_meet_url: item.substituto_meet_url || parsed.substitutoMeetUrl,
      substituto_presenca_url: item.substituto_presenca_url || parsed.substitutoPresencaUrl,
      substituto_observacoes: item.substituto_observacoes || parsed.substitutoObservacoes,
      video_url: item.video_url || parsed.videoUrl,
      arquivo_url: item.arquivo_url || parsed.arquivoUrl,
      arquivo_nome: item.arquivo_nome || parsed.arquivoNome,
      trabalho_instrucoes: item.trabalho_instrucoes || parsed.trabalhoInstrucoes,
      trabalho_prazo: item.trabalho_prazo || parsed.trabalhoPrazo,
    };
  }
  return item;
}

/**
 * Registra uma providência de aula (aula dupla, substituição ou suspensão/aula gravada com trabalho)
 */
export async function registrarProvidenciaAula(params: {
  disciplinaId: string;
  disciplinaName: string;
  aulaNum?: number;
  dataAula: string;
  tipoProvidencia: TipoProvidencia;
  motivo: string;
  autorNome: string;
  autorEmail: string;
  autorRole: UserRole;
  substitutoDisciplinaId?: string;
  substitutoDisciplinaName?: string;
  substitutoProfessorName?: string;
  substitutoMeetUrl?: string;
  substitutoPresencaUrl?: string;
  substitutoObservacoes?: string;
  videoUrl?: string;
  arquivoUrl?: string;
  arquivoNome?: string;
  trabalhoInstrucoes?: string;
  trabalhoPrazo?: string;
}): Promise<AulaCanceladaItem> {
  const key = buildCanceladaKey(params.disciplinaId, params.dataAula);
  const motivoFormatado = formatProvidenciaMotivo({
    tipoProvidencia: params.tipoProvidencia,
    motivoTexto: params.motivo,
    substitutoDisciplinaId: params.substitutoDisciplinaId,
    substitutoDisciplinaName: params.substitutoDisciplinaName,
    substitutoProfessorName: params.substitutoProfessorName,
    substitutoMeetUrl: params.substitutoMeetUrl,
    substitutoPresencaUrl: params.substitutoPresencaUrl,
    substitutoObservacoes: params.substitutoObservacoes,
    videoUrl: params.videoUrl,
    arquivoUrl: params.arquivoUrl,
    arquivoNome: params.arquivoNome,
    trabalhoInstrucoes: params.trabalhoInstrucoes,
    trabalhoPrazo: params.trabalhoPrazo,
  });

  const item: AulaCanceladaItem = {
    id: key,
    disciplina_id: params.disciplinaId,
    disciplina_name: params.disciplinaName,
    aula_num: params.aulaNum,
    data_aula: params.dataAula,
    motivo: motivoFormatado,
    autor_nome: params.autorNome,
    autor_email: params.autorEmail,
    autor_role: params.autorRole,
    criado_em: new Date().toISOString(),
    ativo: true,
    tipo_providencia: params.tipoProvidencia,
    substituto_disciplina_id: params.substitutoDisciplinaId,
    substituto_disciplina_name: params.substitutoDisciplinaName,
    substituto_professor_name: params.substitutoProfessorName,
    substituto_meet_url: params.substitutoMeetUrl,
    substituto_presenca_url: params.substitutoPresencaUrl,
    substituto_observacoes: params.substitutoObservacoes,
    video_url: params.videoUrl,
    arquivo_url: params.arquivoUrl,
    arquivo_nome: params.arquivoNome,
    trabalho_instrucoes: params.trabalhoInstrucoes,
    trabalho_prazo: params.trabalhoPrazo,
  };

  const map = getLocalCanceladas();
  map[key] = item;
  saveLocalCanceladas(map);

  // Sincroniza com Supabase
  try {
    await supabase.from('lms_aulas_canceladas').upsert({
      id: key,
      disciplina_id: params.disciplinaId,
      disciplina_name: params.disciplinaName,
      aula_num: params.aulaNum,
      data_aula: params.dataAula,
      motivo: motivoFormatado,
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
      payload: { 
        key, 
        disciplinaName: params.disciplinaName, 
        dataAula: params.dataAula,
        tipoProvidencia: params.tipoProvidencia,
        substitutoDisciplinaName: params.substitutoDisciplinaName,
      }
    });
  } catch (e) {}

  return item;
}

/**
 * Consulta se uma aula possui uma providência ativa hoje (aula dupla ou substituição)
 */
export function getProvidenciaAtivaHoje(disciplinaId: string, disciplinaName: string): AulaCanceladaItem | null {
  const cancelStatus = isAulaCanceladaHoje(disciplinaId, disciplinaName);
  if (cancelStatus && cancelStatus.tipo_providencia && cancelStatus.tipo_providencia !== 'cancelamento') {
    return cancelStatus;
  }
  // Se veio do Supabase sem os campos desempacotados, desempacota
  if (cancelStatus && cancelStatus.motivo && cancelStatus.motivo.startsWith('[PROVIDENCIA_JSON]:')) {
    const parsed = parseProvidenciaMotivo(cancelStatus.motivo);
    return {
      ...cancelStatus,
      tipo_providencia: parsed.tipoProvidencia,
      substituto_disciplina_id: parsed.substitutoDisciplinaId,
      substituto_disciplina_name: parsed.substitutoDisciplinaName,
      substituto_professor_name: parsed.substitutoProfessorName,
      substituto_meet_url: parsed.substitutoMeetUrl,
      substituto_presenca_url: parsed.substitutoPresencaUrl,
      substituto_observacoes: parsed.substitutoObservacoes,
    };
  }
  return null;
}

let lastCanceladasFetchTime = 0;
const CANCELADAS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de cache

/**
 * Sincroniza do Supabase com decodificação automática de providências
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
        const parsed = parseProvidenciaMotivo(row.motivo || '');
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
          tipo_providencia: parsed.tipoProvidencia,
          substituto_disciplina_id: parsed.substitutoDisciplinaId,
          substituto_disciplina_name: parsed.substitutoDisciplinaName,
          substituto_professor_name: parsed.substitutoProfessorName,
          substituto_meet_url: parsed.substitutoMeetUrl,
          substituto_presenca_url: parsed.substitutoPresencaUrl,
          substituto_observacoes: parsed.substitutoObservacoes,
        };
      });
      saveLocalCanceladas(map);
    }
  } catch (e) {}
}
