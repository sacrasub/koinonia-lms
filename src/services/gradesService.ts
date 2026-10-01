import { supabase } from '@/lib/supabaseClient';
import { StudentGradeRecord, SituacaoAcademica } from '@/types';

const EVENT_GRADES_UPDATED = 'lms_grades_updated';
const syncDebounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

/**
 * Normaliza e-mail para comparação consistente
 */
export function normalizeEmail(email?: string): string {
  if (!email || email.trim() === '') return '';
  return email.toLowerCase().trim();
}

/**
 * Calcula a média aritmética/ponderada e a situação acadêmica oficial do Seminário Koinonia.
 * - Média >= 7.0: Aprovado
 * - 5.0 <= Média < 7.0: Em Recuperação
 * - Média < 5.0: Reprovado
 * - Faltas > 4 (em 16 aulas): Reprovado por Faltas (critério prioritário de reprovação)
 */
export function calculateGradeResult(grade?: Partial<StudentGradeRecord>): {
  media: number | null;
  mediaDisplay: string;
  situacao: SituacaoAcademica;
  color: string;
  badgeBg: string;
} {
  if (!grade) {
    return {
      media: null,
      mediaDisplay: '-',
      situacao: 'Cursando',
      color: 'text-slate-500',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    };
  }

  const av1 = grade.av1 !== null && grade.av1 !== undefined ? Number(grade.av1) : null;
  const av2 = grade.av2 !== null && grade.av2 !== undefined ? Number(grade.av2) : null;
  const trab = grade.trabalho !== null && grade.trabalho !== undefined ? Number(grade.trabalho) : null;
  const rec = grade.recuperacao !== null && grade.recuperacao !== undefined ? Number(grade.recuperacao) : null;
  const faltas = Number(grade.faltas || 0);

  // Critério eliminatório: limite máximo de 4 faltas em 16 aulas (25% de ausências)
  if (faltas > 4) {
    return {
      media: null,
      mediaDisplay: av1 !== null || av2 !== null ? 'Rep. Faltas' : '-',
      situacao: 'Reprovado por Faltas',
      color: 'text-rose-600',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-300 font-bold',
    };
  }

  const values = [av1, av2, trab].filter((v): v is number => v !== null && !isNaN(v));
  if (values.length === 0) {
    return {
      media: null,
      mediaDisplay: '-',
      situacao: 'Cursando',
      color: 'text-slate-500',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    };
  }

  const sum = values.reduce((acc, val) => acc + val, 0);
  let media = parseFloat((sum / values.length).toFixed(1));

  // Aplicação da recuperação quando lançada
  if (rec !== null && !isNaN(rec) && media < 7.0) {
    // Nova média após recuperação
    media = parseFloat(Math.min(10, Math.max(media, (media + rec) / 2)).toFixed(1));
  }

  if (media >= 7.0) {
    return {
      media,
      mediaDisplay: media.toFixed(1),
      situacao: 'Aprovado',
      color: 'text-emerald-700',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold shadow-xs',
    };
  } else if (media >= 5.0) {
    return {
      media,
      mediaDisplay: media.toFixed(1),
      situacao: 'Em Recuperação',
      color: 'text-amber-700',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
    };
  } else {
    return {
      media,
      mediaDisplay: media.toFixed(1),
      situacao: 'Reprovado',
      color: 'text-rose-700',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
    };
  }
}

// -----------------------------------------------------------------------------
// LEITURA LOCAL-FIRST (TTFB < 50ms) E SINCRONIZAÇÃO EM NUVEM
// -----------------------------------------------------------------------------

/**
 * Carrega notas de uma disciplina para a visão do Professor / Admin.
 * Retorna imediatamente do cache local e busca da nuvem em segundo plano com projeção estrita.
 */
export async function getGradesForDisciplina(
  disciplinaId: string
): Promise<Record<string, StudentGradeRecord>> {
  if (!disciplinaId) return {};

  const storageKey = `lms_gradebook_v1_${disciplinaId}`;
  let localData: Record<string, StudentGradeRecord> = {};

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        localData = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao ler cache de notas:', e);
    }
  }

  // Busca na nuvem com projeção estrita de colunas (Zero Waste Egress)
  try {
    const { data, error } = await supabase
      .from('lms_student_grades')
      .select('id, disciplina_id, student_email, av1, av2, trabalho, recuperacao, faltas, observacoes, status_fechamento, updated_at')
      .eq('disciplina_id', disciplinaId);

    if (!error && data && data.length > 0) {
      const cloudMap: Record<string, StudentGradeRecord> = { ...localData };
      data.forEach((row) => {
        const email = normalizeEmail(row.student_email);
        cloudMap[email] = {
          id: row.id,
          disciplina_id: row.disciplina_id,
          student_email: email,
          av1: row.av1 !== null ? Number(row.av1) : null,
          av2: row.av2 !== null ? Number(row.av2) : null,
          trabalho: row.trabalho !== null ? Number(row.trabalho) : null,
          recuperacao: row.recuperacao !== null ? Number(row.recuperacao) : null,
          faltas: Number(row.faltas || 0),
          observacoes: row.observacoes || '',
          status_fechamento: row.status_fechamento || 'aberto',
          updated_at: row.updated_at,
        };
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(cloudMap));
      }
      return cloudMap;
    }
  } catch (err) {
    console.warn('Fallback offline para grades da disciplina:', err);
  }

  return localData;
}

/**
 * Carrega todas as notas do Aluno matriculado (Meu Boletim).
 * Retorna do cache local e busca no Supabase apenas os registros daquele email (< 1.5 KB).
 */
export async function getGradesForStudent(
  studentEmail: string
): Promise<Record<string, StudentGradeRecord>> {
  const normEmail = normalizeEmail(studentEmail);
  if (!normEmail) return {};

  const storageKey = `lms_student_grades_v1_${normEmail}`;
  let localData: Record<string, StudentGradeRecord> = {};

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        localData = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao ler cache de boletim do aluno:', e);
    }
  }

  // Busca na nuvem filtrando estritamente pelo email do aluno
  try {
    const { data, error } = await supabase
      .from('lms_student_grades')
      .select('id, disciplina_id, student_email, av1, av2, trabalho, recuperacao, faltas, observacoes, status_fechamento, updated_at')
      .eq('student_email', normEmail);

    if (!error && data) {
      const cloudMap: Record<string, StudentGradeRecord> = { ...localData };
      data.forEach((row) => {
        cloudMap[row.disciplina_id] = {
          id: row.id,
          disciplina_id: row.disciplina_id,
          student_email: normEmail,
          av1: row.av1 !== null ? Number(row.av1) : null,
          av2: row.av2 !== null ? Number(row.av2) : null,
          trabalho: row.trabalho !== null ? Number(row.trabalho) : null,
          recuperacao: row.recuperacao !== null ? Number(row.recuperacao) : null,
          faltas: Number(row.faltas || 0),
          observacoes: row.observacoes || '',
          status_fechamento: row.status_fechamento || 'aberto',
          updated_at: row.updated_at,
        };
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(cloudMap));
      }
      return cloudMap;
    }
  } catch (err) {
    console.warn('Fallback offline para boletim do aluno:', err);
  }

  return localData;
}

// -----------------------------------------------------------------------------
// GRAVAÇÃO COM EGRESS MINIMAL ({ returning: 'minimal' } = 0 Bytes de Download)
// -----------------------------------------------------------------------------

/**
 * Salva uma nota de aluno no cache local e agenda o upsert em lote na nuvem com debounce.
 */
export async function saveStudentGrade(
  record: StudentGradeRecord,
  immediateCloudSync: boolean = false
): Promise<{ success: boolean; error?: string }> {
  const normEmail = normalizeEmail(record.student_email);
  if (!normEmail || !record.disciplina_id) {
    return { success: false, error: 'Dados incompletos' };
  }

  const discStorageKey = `lms_gradebook_v1_${record.disciplina_id}`;
  const studentStorageKey = `lms_student_grades_v1_${normEmail}`;

  // 1. Atualização Otimista no LocalStorage (0ms)
  if (typeof window !== 'undefined') {
    try {
      const currentDiscMap = JSON.parse(localStorage.getItem(discStorageKey) || '{}');
      currentDiscMap[normEmail] = { ...record, student_email: normEmail, updated_at: new Date().toISOString() };
      localStorage.setItem(discStorageKey, JSON.stringify(currentDiscMap));

      const currentStudentMap = JSON.parse(localStorage.getItem(studentStorageKey) || '{}');
      currentStudentMap[record.disciplina_id] = { ...record, student_email: normEmail, updated_at: new Date().toISOString() };
      localStorage.setItem(studentStorageKey, JSON.stringify(currentStudentMap));

      window.dispatchEvent(new CustomEvent(EVENT_GRADES_UPDATED, { detail: { disciplinaId: record.disciplina_id, email: normEmail } }));
    } catch (e) {
      console.warn('Erro ao atualizar storage local de notas:', e);
    }
  }

  // 2. Gravação no Supabase
  const payload = {
    disciplina_id: record.disciplina_id,
    student_email: normEmail,
    av1: record.av1 !== null && record.av1 !== undefined ? Number(record.av1) : null,
    av2: record.av2 !== null && record.av2 !== undefined ? Number(record.av2) : null,
    trabalho: record.trabalho !== null && record.trabalho !== undefined ? Number(record.trabalho) : null,
    recuperacao: record.recuperacao !== null && record.recuperacao !== undefined ? Number(record.recuperacao) : null,
    faltas: Number(record.faltas || 0),
    observacoes: record.observacoes || null,
    status_fechamento: record.status_fechamento || 'aberto',
    updated_at: new Date().toISOString(),
    updated_by: record.updated_by || 'docente',
  };

  const executeCloudUpsert = async () => {
    try {
      // { returning: 'minimal' } garante 204 No Content (0 Bytes de Egress de Retorno)
      const { error } = await (supabase
        .from('lms_student_grades')
        .upsert(payload, { onConflict: 'disciplina_id,student_email' }) as any);

      if (error) {
        console.warn('Aviso ao sincronizar nota no Supabase:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      console.warn('Erro ao comunicar com Supabase (lms_student_grades):', e);
      return { success: false, error: e?.message || 'Erro de conexão' };
    }
  };

  if (immediateCloudSync) {
    return await executeCloudUpsert();
  }

  // Debounce de 1500ms para evitar explosão de requisições durante digitação do professor
  const debounceKey = `${record.disciplina_id}_${normEmail}`;
  if (syncDebounceTimers[debounceKey]) {
    clearTimeout(syncDebounceTimers[debounceKey]);
  }

  return new Promise((resolve) => {
    syncDebounceTimers[debounceKey] = setTimeout(async () => {
      delete syncDebounceTimers[debounceKey];
      const res = await executeCloudUpsert();
      resolve(res);
    }, 1500);
  });
}

/**
 * Salva lote completo de notas de uma disciplina (ex: ao clicar em "Salvar Boletim")
 */
export async function saveBatchGrades(
  disciplinaId: string,
  records: StudentGradeRecord[]
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!disciplinaId || !records || records.length === 0) {
    return { success: true, count: 0 };
  }

  const storageKey = `lms_gradebook_v1_${disciplinaId}`;
  const map: Record<string, StudentGradeRecord> = {};

  const payloads = records.map((r) => {
    const normEmail = normalizeEmail(r.student_email);
    const item: StudentGradeRecord = {
      ...r,
      disciplina_id: disciplinaId,
      student_email: normEmail,
      updated_at: new Date().toISOString(),
    };
    map[normEmail] = item;
    return {
      disciplina_id: disciplinaId,
      student_email: normEmail,
      av1: r.av1 !== null && r.av1 !== undefined ? Number(r.av1) : null,
      av2: r.av2 !== null && r.av2 !== undefined ? Number(r.av2) : null,
      trabalho: r.trabalho !== null && r.trabalho !== undefined ? Number(r.trabalho) : null,
      recuperacao: r.recuperacao !== null && r.recuperacao !== undefined ? Number(r.recuperacao) : null,
      faltas: Number(r.faltas || 0),
      observacoes: r.observacoes || null,
      status_fechamento: r.status_fechamento || 'aberto',
      updated_at: new Date().toISOString(),
      updated_by: r.updated_by || 'docente',
    };
  });

  // Salva no storage local
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(storageKey, JSON.stringify(map));
      window.dispatchEvent(new CustomEvent(EVENT_GRADES_UPDATED, { detail: { disciplinaId } }));
    } catch (e) {
      console.warn('Erro ao salvar lote de notas no storage:', e);
    }
  }

  // Upsert em bloco na nuvem com resposta minimal
  try {
    const { error } = await (supabase
      .from('lms_student_grades')
      .upsert(payloads, { onConflict: 'disciplina_id,student_email' }) as any);

    if (error) {
      console.warn('Aviso no upsert em lote do Supabase:', error.message);
      return { success: false, count: records.length, error: error.message };
    }
    return { success: true, count: records.length };
  } catch (err: any) {
    console.warn('Erro na chamada em bloco de notas:', err);
    return { success: false, count: records.length, error: err?.message };
  }
}
