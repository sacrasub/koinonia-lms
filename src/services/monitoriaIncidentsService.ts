'use client';

export interface DiretrizAcesso {
  id: string;
  data: string;
  timestamp: string;
  emissor: string;
  titulo: string;
  descricao: string;
  tipo: 'bloqueio' | 'contingencia' | 'comunicado_diretoria' | 'inversao_grade';
  prioridade: 'alta' | 'media' | 'informativa';
  escopo?: string;
}

export interface OcorrenciaMonitoria {
  id: string;
  data: string;
  timestamp: string;
  monitor: string;
  tipo: 'relatorio_diario' | 'liberacao_acesso' | 'aluno_nao_identificado' | 'problema_tecnico';
  alunoNome?: string;
  alunoEmail?: string;
  disciplina?: string;
  descricao: string;
  status: 'resolvido' | 'pendente_validacao' | 'em_analise';
}

const STORAGE_DIRETRIZES_KEY = 'lms_monitoria_diretrizes_v1';
const STORAGE_OCORRENCIAS_KEY = 'lms_monitoria_ocorrencias_v1';

export const INITIAL_DIRETRIZES: DiretrizAcesso[] = [
  {
    id: 'RULE-001',
    data: '2026-08-25',
    timestamp: '17:02',
    emissor: 'Robert FMB Seminário Congregacional',
    titulo: 'Bloqueio estrito de solicitações não identificadas',
    descricao: 'Bloquear a entrada nas salas virtuais de todos os participantes externos ou não identificados que pedirem solicitação. Casos atípicos devem ser redirecionados para suporte com Robert no privado.',
    tipo: 'bloqueio',
    prioridade: 'alta',
  },
  {
    id: 'RULE-002',
    data: '2026-08-27',
    timestamp: '17:11',
    emissor: 'Robert FMB Seminário Congregacional',
    titulo: 'Permissão de entrada com contingenciamento manual',
    descricao: 'Aceitar os alunos que solicitarem entrada no dia em caso de impossibilidade técnica de validação prévia. É obrigatória a anotação manual de nome do aluno e disciplina correspondente para auditoria futura.',
    tipo: 'contingencia',
    prioridade: 'alta',
  },
  {
    id: 'ANN-001',
    data: '2026-08-21',
    timestamp: '13:37',
    emissor: 'Robert FMB Seminário Congregacional / Diretora Karla',
    titulo: 'Aulas ao vivo de Homilética 2',
    descricao: 'A partir da próxima semana haverá aula de Homilética 2 ao vivo. A Diretora Karla (Direção STC) colocará um comunicado oficial no grupo em breve.',
    tipo: 'comunicado_diretoria',
    prioridade: 'media',
    escopo: 'Turma B / Fim de Semana',
  },
  {
    id: 'ANN-002',
    data: '2026-08-22',
    timestamp: '08:35',
    emissor: 'STC Diretora Karla DIREÇÃO',
    titulo: 'Envio pontual dos links de aula',
    descricao: 'Lembrete aos monitores para postarem o link de acesso da aula de Novo Testamento com o Pr. Alex com antecedência no grupo de alunos.',
    tipo: 'comunicado_diretoria',
    prioridade: 'media',
  },
  {
    id: 'ANN-003',
    data: '2026-08-28',
    timestamp: '18:05',
    emissor: 'Robert FMB Seminário Congregacional',
    titulo: 'Inversão na grade de aulas (Sábado Matutino)',
    descricao: 'Inversão nas aulas da manhã de sábado para a turma do final de semana. Comunicado de suporte enviado por e-mail e encaminhado no grupo de alunos.',
    tipo: 'inversao_grade',
    prioridade: 'alta',
    escopo: 'Turma Fim de Semana',
  },
];

export const INITIAL_OCORRENCIAS: OcorrenciaMonitoria[] = [
  {
    id: 'INC-001',
    data: '29/08/2026',
    timestamp: '11:50',
    monitor: 'Monitoria Plantão FDS (+55 61 8143-3313)',
    tipo: 'relatorio_diario',
    descricao: 'Plantão matutino concluído com tranquilidade. Nenhum estudante necessitou de concessão ou liberação manual de acesso durante o período.',
    status: 'resolvido',
  },
  {
    id: 'INC-002',
    data: '29/08/2026',
    timestamp: '12:14',
    monitor: 'Monitoria Plantão FDS (+55 61 8143-3313)',
    tipo: 'liberacao_acesso',
    alunoNome: 'Adriana Cláudia',
    alunoEmail: 'adrianaclaudia@gmail.com',
    disciplina: 'Aulas de Fim de Semana',
    descricao: 'Solicitação de acesso na sala virtual. Validada e autorizada no diretório acadêmico com e-mail cadastrado.',
    status: 'resolvido',
  },
];

export function getDiretrizes(): DiretrizAcesso[] {
  if (typeof window === 'undefined') return INITIAL_DIRETRIZES;
  try {
    const raw = localStorage.getItem(STORAGE_DIRETRIZES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_DIRETRIZES_KEY, JSON.stringify(INITIAL_DIRETRIZES));
      return INITIAL_DIRETRIZES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DIRETRIZES;
  } catch {
    return INITIAL_DIRETRIZES;
  }
}

export function saveDiretrizes(list: DiretrizAcesso[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_DIRETRIZES_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('lms_monitoria_diretrizes_updated', { detail: list }));
  } catch (e) {
    console.error('Erro ao salvar diretrizes:', e);
  }
}

export function addDiretriz(d: Omit<DiretrizAcesso, 'id'>): DiretrizAcesso {
  const nova: DiretrizAcesso = {
    ...d,
    id: `DIR-${Date.now()}`,
  };
  const current = getDiretrizes();
  const next = [nova, ...current];
  saveDiretrizes(next);
  return nova;
}

export function getOcorrencias(): OcorrenciaMonitoria[] {
  if (typeof window === 'undefined') return INITIAL_OCORRENCIAS;
  try {
    const raw = localStorage.getItem(STORAGE_OCORRENCIAS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_OCORRENCIAS_KEY, JSON.stringify(INITIAL_OCORRENCIAS));
      return INITIAL_OCORRENCIAS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_OCORRENCIAS;
  } catch {
    return INITIAL_OCORRENCIAS;
  }
}

export function saveOcorrencias(list: OcorrenciaMonitoria[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_OCORRENCIAS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('lms_monitoria_ocorrencias_updated', { detail: list }));
  } catch (e) {
    console.error('Erro ao salvar ocorrencias:', e);
  }
}

export function addOcorrencia(o: Omit<OcorrenciaMonitoria, 'id'>): OcorrenciaMonitoria {
  const nova: OcorrenciaMonitoria = {
    ...o,
    id: `INC-${Date.now()}`,
  };
  const current = getOcorrencias();
  const next = [nova, ...current];
  saveOcorrencias(next);
  return nova;
}
