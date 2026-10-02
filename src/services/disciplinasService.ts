import { Disciplina, Material, Avaliacao, UserRole } from '@/types';
import { mockDisciplinas, mockMateriais, mockAvaliacoes } from '@/lib/mockData';
import { INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';

const DISCIPLINAS_STORAGE_KEY = 'lms_disciplinas_v1';
const MATERIAIS_STORAGE_KEY = 'lms_materiais_v1';
const AVALIACOES_STORAGE_KEY = 'lms_avaliacoes_v1';

// ==========================================
// DISCIPLINAS
// ==========================================

export function getAllDisciplinas(): Disciplina[] {
  if (typeof window === 'undefined') {
    return mockDisciplinas;
  }

  try {
    const raw = localStorage.getItem(DISCIPLINAS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DISCIPLINAS_STORAGE_KEY, JSON.stringify(mockDisciplinas));
      return mockDisciplinas;
    }
    const parsed: Disciplina[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(DISCIPLINAS_STORAGE_KEY, JSON.stringify(mockDisciplinas));
      return mockDisciplinas;
    }
    
    // Auto-correção para disciplina 09 caso o cache do navegador contenha dados legados
    const seedDisc9 = mockDisciplinas.find(d => d.id === 'disc-9');
    let hasLegacyData = false;
    const synced = parsed.map(item => {
      if (item.id === 'disc-9' && seedDisc9 && (item.professor_name?.includes('Emerson') || item.name?.includes('Emerson'))) {
        hasLegacyData = true;
        return {
          ...item,
          name: seedDisc9.name,
          professor_name: seedDisc9.professor_name,
          google_drive_url: seedDisc9.google_drive_url,
          code: seedDisc9.code,
        };
      }
      return item;
    });

    if (hasLegacyData) {
      localStorage.setItem(DISCIPLINAS_STORAGE_KEY, JSON.stringify(synced));
      return synced;
    }

    return parsed;
  } catch (e) {
    console.error('Erro ao carregar disciplinas do storage:', e);
    return mockDisciplinas;
  }
}

export function saveAllDisciplinas(list: Disciplina[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DISCIPLINAS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('lms_disciplinas_updated', { detail: list }));
  } catch (e) {
    console.error('Erro ao salvar disciplinas no storage:', e);
  }
}

export function updateDisciplina(updated: Disciplina): void {
  const current = getAllDisciplinas();
  const index = current.findIndex((d) => d.id === updated.id);
  let nextList: Disciplina[];
  if (index >= 0) {
    nextList = [...current];
    nextList[index] = { ...nextList[index], ...updated };
  } else {
    nextList = [...current, updated];
  }
  saveAllDisciplinas(nextList);
}

/**
 * Retorna o índice da turma da disciplina com fallback resiliente
 * 0: Fim de Semana (5º), 1: Turma A (7º), 2: Turma B (3º), 3: Curso Básico
 */
export function getDisciplinaTurmaIdx(d: Disciplina): number {
  if (d.turma_idx !== undefined && d.turma_idx !== null) return Number(d.turma_idx);
  if (d.id?.startsWith('disc-b-') || d.code?.startsWith('INT-') || d.code?.startsWith('HER-') || d.code?.startsWith('DIS-')) return 2;
  if (d.id?.startsWith('disc-fds-') || d.code?.startsWith('GRE-') || d.code?.startsWith('EXE-')) return 0;
  if (d.id?.startsWith('disc-bas-') || d.code?.startsWith('BAS-')) return 3;
  return 1;
}

/**
 * Retorna as disciplinas de uma turma específica com base nas matérias ativas
 */
export function getDisciplinasByTurmaFromService(turmaIdx: number = 1): Disciplina[] {
  const all = getAllDisciplinas();
  const filtered = all.filter((d) => getDisciplinaTurmaIdx(d) === turmaIdx);
  if (filtered.length > 0) return filtered;
  return all.filter((d) => getDisciplinaTurmaIdx(d) === 1);
}

/**
 * Retorna as disciplinas configuradas no perfil individual de cada aluno:
 * 1. Se o perfil possuir matérias explicitamente personalizadas (`customDisciplinas` ou `enrolledDisciplinas`), retorna essas.
 * 2. Caso contrário, retorna estritamente as matérias da turma configurada no perfil do aluno (`turmaIdx`).
 */
export function getDisciplinasForStudent(userEmail?: string): Disciplina[] {
  const all = getAllDisciplinas();
  if (!userEmail) return all.filter((d) => getDisciplinaTurmaIdx(d) === 1);

  const normalized = userEmail.toLowerCase().trim();
  let studentTurma = 1;
  let customDisciplinas: string[] | undefined = undefined;

  const authUser = INITIAL_AUTHORIZED_USERS[normalized];
  if (authUser && authUser.turmaIdx !== undefined) {
    studentTurma = authUser.turmaIdx;
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`lms_profile_${normalized}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.turmaIdx !== undefined) studentTurma = Number(parsed.turmaIdx);
        if (Array.isArray(parsed.customDisciplinas) && parsed.customDisciplinas.length > 0) {
          customDisciplinas = parsed.customDisciplinas;
        } else if (Array.isArray(parsed.enrolledDisciplinas) && parsed.enrolledDisciplinas.length > 0) {
          customDisciplinas = parsed.enrolledDisciplinas;
        }
      }
      const portalStored = localStorage.getItem(`lms_user_portal_profile_${normalized}`);
      if (portalStored) {
        const parsed = JSON.parse(portalStored);
        if (parsed.turmaIdx !== undefined) studentTurma = Number(parsed.turmaIdx);
        if (!customDisciplinas) {
          if (Array.isArray(parsed.customDisciplinas) && parsed.customDisciplinas.length > 0) {
            customDisciplinas = parsed.customDisciplinas;
          } else if (Array.isArray(parsed.enrolledDisciplinas) && parsed.enrolledDisciplinas.length > 0) {
            customDisciplinas = parsed.enrolledDisciplinas;
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao ler perfil do aluno:', e);
    }
  }

  if (customDisciplinas && customDisciplinas.length > 0) {
    const customSet = new Set(customDisciplinas.map((id) => id.toLowerCase().trim()));
    const matched = all.filter((d) => 
      customSet.has(d.id.toLowerCase().trim()) || 
      customSet.has(d.name.toLowerCase().trim()) ||
      customSet.has(d.code.toLowerCase().trim())
    );
    if (matched.length > 0) return matched;
  }

  const turmaFiltered = all.filter((d) => getDisciplinaTurmaIdx(d) === studentTurma);
  if (turmaFiltered.length > 0) return turmaFiltered;

  return all.filter((d) => getDisciplinaTurmaIdx(d) === 1);
}

/**
 * Retorna as disciplinas filtradas para o usuário:
 * - Se for 'admin', retorna todas as disciplinas
 * - Se for 'professor', retorna apenas as disciplinas atribuídas a ele por professor_email ou correspondência de perfil
 * - Se for 'aluno', retorna as disciplinas configuradas no perfil individual do aluno
 */
export function getDisciplinasForUser(userEmail?: string, userRole?: UserRole): Disciplina[] {
  const all = getAllDisciplinas();
  if (!userEmail) return all;

  const normalized = userEmail.toLowerCase().trim();

  // Admins possuem visão e controle global sobre todas as matérias
  if (userRole === 'admin') {
    return all;
  }

  // Se for aluno, retorna as matérias da turma/perfil individual do aluno
  if (userRole === 'aluno') {
    return getDisciplinasForStudent(userEmail);
  }

  // Verifica se é professor
  const userProfile = INITIAL_AUTHORIZED_USERS[normalized];
  const isProf = userRole === 'professor' || (userProfile && userProfile.roles.includes('professor'));

  if (!isProf) {
    return getDisciplinasForStudent(userEmail);
  }

  // Filtra por email exato do professor na disciplina
  const matched = all.filter((d) => d.professor_email && d.professor_email.toLowerCase().trim() === normalized);

  if (matched.length > 0) {
    return matched;
  }

  // Fallback por correspondência de nome cadastrado
  if (userProfile && userProfile.name) {
    const profNameLower = userProfile.name.toLowerCase();
    const byName = all.filter((d) => {
      const dName = d.professor_name.toLowerCase();
      return profNameLower.includes(dName) || dName.includes(profNameLower);
    });
    if (byName.length > 0) return byName;
  }

  return [];
}

// ==========================================
// MATERIAIS DE ESTUDO
// ==========================================

export function getAllMateriais(): Material[] {
  if (typeof window === 'undefined') {
    return mockMateriais;
  }

  try {
    const raw = localStorage.getItem(MATERIAIS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MATERIAIS_STORAGE_KEY, JSON.stringify(mockMateriais));
      return mockMateriais;
    }
    const parsed: Material[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(MATERIAIS_STORAGE_KEY, JSON.stringify(mockMateriais));
      return mockMateriais;
    }

    // Auto-migração: Se o cache antigo tiver o disc-8 mapeado para Plantação e Revitalização
    const hasOutdatedSeed = parsed.some(
      (m) =>
        (m.id === 'mat-2026-8' && m.disciplina_name?.includes('Plantação')) ||
        (m.id === 'mat-2026-1' && m.disciplina_name?.includes('Aconselhamento'))
    );

    if (hasOutdatedSeed) {
      // Mescla os materiais adicionados pelo usuário com o novo seed corrigido
      const userCustomMats = parsed.filter((m) => !m.id.startsWith('mat-2026-'));
      const fixedList = [...mockMateriais, ...userCustomMats];
      localStorage.setItem(MATERIAIS_STORAGE_KEY, JSON.stringify(fixedList));
      return fixedList;
    }

    // Auto-migração e merge contínuo: se houver novos materiais em mockMateriais não presentes no cache
    const existingIds = new Set(parsed.map((m) => m.id));
    const missingSeeds = mockMateriais.filter((m) => !existingIds.has(m.id));
    if (missingSeeds.length > 0) {
      const merged = [...parsed, ...missingSeeds];
      localStorage.setItem(MATERIAIS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }

    return parsed;
  } catch (e) {
    console.error('Erro ao ler materiais:', e);
    return mockMateriais;
  }
}

export function saveAllMateriais(list: Material[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MATERIAIS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('lms_materials_updated', { detail: list }));
  } catch (e) {
    console.error('Erro ao salvar materiais:', e);
  }
}

export function getMateriaisForDisciplinas(disciplinaIds?: string[]): Material[] {
  const all = getAllMateriais();
  if (disciplinaIds === undefined) return all;
  if (disciplinaIds.length === 0) return [];
  const set = new Set(disciplinaIds);
  return all.filter((m) => set.has(m.disciplina_id));
}

export function addMaterial(material: Omit<Material, 'id' | 'created_at'>): Material {
  const newMat: Material = {
    ...material,
    id: `mat-${Date.now()}`,
    created_at: new Date().toLocaleDateString('pt-BR'),
  };
  const current = getAllMateriais();
  const next = [newMat, ...current];
  saveAllMateriais(next);
  return newMat;
}

export function updateMaterial(id: string, patch: Partial<Material>): Material | null {
  const current = getAllMateriais();
  const idx = current.findIndex((m) => m.id === id);
  if (idx < 0) return null;

  const updated: Material = {
    ...current[idx],
    ...patch,
  };
  const next = [...current];
  next[idx] = updated;
  saveAllMateriais(next);
  return updated;
}

export function deleteMaterial(id: string): void {
  const current = getAllMateriais();
  const next = current.filter((m) => m.id !== id);
  saveAllMateriais(next);
}

// ==========================================
// AVALIAÇÕES
// ==========================================

export function getAllAvaliacoes(): Avaliacao[] {
  if (typeof window === 'undefined') {
    return mockAvaliacoes;
  }

  try {
    const raw = localStorage.getItem(AVALIACOES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AVALIACOES_STORAGE_KEY, JSON.stringify(mockAvaliacoes));
      return mockAvaliacoes;
    }
    const parsed: Avaliacao[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(AVALIACOES_STORAGE_KEY, JSON.stringify(mockAvaliacoes));
      return mockAvaliacoes;
    }
    // Mescla itens do mockAvaliacoes que ainda não estejam presentes no storage do usuário
    const existingIds = new Set(parsed.map((p) => p.id));
    const missing = mockAvaliacoes.filter((m) => !existingIds.has(m.id));
    if (missing.length > 0) {
      const merged = [...parsed, ...missing];
      localStorage.setItem(AVALIACOES_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (e) {
    console.error('Erro ao ler avaliações:', e);
    return mockAvaliacoes;
  }
}

export function saveAllAvaliacoes(list: Avaliacao[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AVALIACOES_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('lms_avaliacoes_updated', { detail: list }));
  } catch (e) {
    console.error('Erro ao salvar avaliações:', e);
  }
}

export function getAvaliacoesForDisciplinas(disciplinaIds?: string[]): Avaliacao[] {
  const all = getAllAvaliacoes();
  if (disciplinaIds === undefined) return all;
  if (disciplinaIds.length === 0) return [];
  const set = new Set(disciplinaIds);
  return all.filter((a) => set.has(a.disciplina_id));
}

export function addAvaliacao(avaliacao: Omit<Avaliacao, 'id'>): Avaliacao {
  const newAv: Avaliacao = {
    ...avaliacao,
    id: `av-${Date.now()}`,
  };
  const current = getAllAvaliacoes();
  const next = [newAv, ...current];
  saveAllAvaliacoes(next);
  return newAv;
}

export function deleteAvaliacao(id: string): void {
  const current = getAllAvaliacoes();
  const next = current.filter((a) => a.id !== id);
  saveAllAvaliacoes(next);
}
