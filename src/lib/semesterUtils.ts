export interface SemesterWeek {
  weekNumber: number; // 1 a 16
  startDate: Date;
  endDate: Date;
  label: string; // Ex: "Semana 1 (11/08 a 14/08/2026)"
  formattedStart: string; // "11/08"
  formattedEnd: string; // "14/08"
}

// Início oficial do Semestre Letivo 2026.2: Terça-feira, 11 de Agosto de 2026
const SEMESTER_2026_2_START = new Date(2026, 7, 11); // Mês 7 = Agosto (0-indexed)

const DAY_OFFSET_MAP: Record<string, number> = {
  'Terça-feira': 0,
  'Quarta-feira': 1,
  'Quinta-feira': 2,
  'Sexta-feira': 3,
};

/**
 * Gera as 16 semanas letivas do Semestre 2026.2
 */
export function getSemester2026Weeks(): SemesterWeek[] {
  const weeks: SemesterWeek[] = [];
  const start = new Date(SEMESTER_2026_2_START);

  for (let i = 0; i < 16; i++) {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + i * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 3); // Sexta-feira (+3 dias)

    const startDayStr = String(weekStart.getDate()).padStart(2, '0');
    const startMonthStr = String(weekStart.getMonth() + 1).padStart(2, '0');

    const endDayStr = String(weekEnd.getDate()).padStart(2, '0');
    const endMonthStr = String(weekEnd.getMonth() + 1).padStart(2, '0');

    weeks.push({
      weekNumber: i + 1,
      startDate: weekStart,
      endDate: weekEnd,
      formattedStart: `${startDayStr}/${startMonthStr}`,
      formattedEnd: `${endDayStr}/${endMonthStr}`,
      label: `Semana ${i + 1} (${startDayStr}/${startMonthStr} a ${endDayStr}/${endMonthStr}/2026)`,
    });
  }

  return weeks;
}

/**
 * Identifica o índice da semana atual (0 a 15) com base no dia de hoje
 */
export function getCurrentWeekIndex(): number {
  const weeks = getSemester2026Weeks();
  const now = new Date();

  // Se estiver antes do início do semestre
  if (now < weeks[0].startDate) {
    return 0;
  }

  // Se estiver após o fim do semestre
  if (now > weeks[15].endDate) {
    return 15;
  }

  for (let i = 0; i < weeks.length; i++) {
    const w = weeks[i];
    // Ajusta o fim da semana para o fim do domingo correspondente
    const weekBoundaryEnd = new Date(w.startDate);
    weekBoundaryEnd.setDate(w.startDate.getDate() + 6);
    weekBoundaryEnd.setHours(23, 59, 59);

    if (now >= w.startDate && now <= weekBoundaryEnd) {
      return i;
    }
  }

  return 0;
}

/**
 * Calcula a data exata no formato DD/MM/YYYY para um determinado dia da semana em uma semana letiva específica
 */
export function getDateForLesson(weekIndex: number, dayOfWeek?: string): string {
  const weeks = getSemester2026Weeks();
  const validWeekIndex = Math.max(0, Math.min(15, weekIndex));
  const weekStart = new Date(weeks[validWeekIndex].startDate);

  const cleanDay = (dayOfWeek || 'Terça-feira').split(' ')[0].replace(',', '');
  let offset = 0;
  if (dayOfWeek) {
    for (const [key, val] of Object.entries(DAY_OFFSET_MAP)) {
      if (dayOfWeek.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(cleanDay.toLowerCase())) {
        offset = val;
        break;
      }
    }
  }

  const lessonDate = new Date(weekStart);
  lessonDate.setDate(weekStart.getDate() + offset);

  if (weekIndex >= 16) {
    lessonDate.setDate(lessonDate.getDate() + (weekIndex - 15) * 7);
  }

  const dayStr = String(lessonDate.getDate()).padStart(2, '0');
  const monthStr = String(lessonDate.getMonth() + 1).padStart(2, '0');
  const yearStr = lessonDate.getFullYear();

  return `${dayStr}/${monthStr}/${yearStr}`;
}

/**
 * Calcula a data curta de referência no formato DD/MM para exibição compacta nas pílulas de aula
 */
export function getShortDateForLesson(weekIndex: number, dayOfWeek?: string): string {
  const weeks = getSemester2026Weeks();
  const validWeekIndex = Math.max(0, Math.min(15, weekIndex));
  const weekStart = new Date(weeks[validWeekIndex].startDate);

  const cleanDay = (dayOfWeek || 'Terça-feira').split(' ')[0].replace(',', '');
  let offset = 0;
  if (dayOfWeek) {
    for (const [key, val] of Object.entries(DAY_OFFSET_MAP)) {
      if (dayOfWeek.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(cleanDay.toLowerCase())) {
        offset = val;
        break;
      }
    }
  }

  const lessonDate = new Date(weekStart);
  lessonDate.setDate(weekStart.getDate() + offset);

  if (weekIndex >= 16) {
    lessonDate.setDate(lessonDate.getDate() + (weekIndex - 15) * 7);
  }

  const dayStr = String(lessonDate.getDate()).padStart(2, '0');
  const monthStr = String(lessonDate.getMonth() + 1).padStart(2, '0');

  return `${dayStr}/${monthStr}`;
}
