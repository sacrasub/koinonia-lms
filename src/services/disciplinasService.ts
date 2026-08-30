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
 * Retorna as disciplinas filtradas para o usuário:
 * - Se for 'admin', retorna todas as disciplinas
 * - Se for 'professor', retorna apenas as disciplinas atribuídas a ele por professor_email ou correspondência de perfil
 */
export function getDisciplinasForUser(userEmail?: string, userRole?: UserRole): Disciplina[] {
  const all = getAllDisciplinas();
  if (!userEmail) return all;

  const normalized = userEmail.toLowerCase().trim();

  // Admins possuem visão e controle global sobre todas as matérias
  if (userRole === 'admin' || normalized === 'sacrasub@gmail.com' || normalized === 'sacrasub03@gmail.com' || normalized === 'tondedez@gmail.com' || normalized === 'ead@uiecbead.com.br') {
    return all;
  }

  // Verifica se é professor
  const userProfile = INITIAL_AUTHORIZED_USERS[normalized];
  const isProf = userRole === 'professor' || (userProfile && userProfile.roles.includes('professor'));

  if (!isProf) {
    return all;
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

export function getMateriaisForDisciplinas(disciplinaIds: string[]): Material[] {
  const all = getAllMateriais();
  if (!disciplinaIds || disciplinaIds.length === 0) return all;
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

export function getAvaliacoesForDisciplinas(disciplinaIds: string[]): Avaliacao[] {
  const all = getAllAvaliacoes();
  if (!disciplinaIds || disciplinaIds.length === 0) return all;
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
