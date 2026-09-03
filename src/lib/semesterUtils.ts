import { Disciplina } from '@/types';

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

export interface AulaEmAndamentoInfo {
  disciplinaId: string;
  disciplinaName: string;
  aulaNum: number;
  dataAula: string;
  googleMeetUrl?: string;
  dayOfWeek: string;
  startBRT: string;
  endBRT: string;
  isHappeningNow: boolean;
}

/**
 * Identifica a aula em andamento agora no Seminário com base no horário de Brasília (BRT) e na grade semanal
 */
export function getAulaEmAndamentoHoje(allDisciplinas: Disciplina[]): AulaEmAndamentoInfo | null {
  if (!allDisciplinas || allDisciplinas.length === 0) return null;

  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const now = new Date();
  const brtString = now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
  const brtDate = new Date(brtString);
  const currentDayIndex = brtDate.getDay();
  const currentMinutes = brtDate.getHours() * 60 + brtDate.getMinutes();

  // Se for fim de semana ou segunda, projeta para Terça-feira (início das aulas)
  let targetDay = days[currentDayIndex];
  if (currentDayIndex === 0 || currentDayIndex === 1 || currentDayIndex === 6) {
    targetDay = 'Terça-feira';
  }

  const weekIndex = getCurrentWeekIndex();
  const aulaNum = Math.max(1, Math.min(16, weekIndex + 1));

  // Filtra disciplinas do dia da Turma A (ou as 9 disciplinas principais)
  const discsToday = allDisciplinas.filter((d) => {
    const dDay = (d.day_of_week || '').toLowerCase();
    const tDay = targetDay.toLowerCase();
    return dDay.includes(tDay) || tDay.includes(dDay.split(' ')[0]);
  });

  if (discsToday.length === 0) {
    const first = allDisciplinas[0];
    return {
      disciplinaId: first.id,
      disciplinaName: first.name,
      aulaNum,
      dataAula: getDateForLesson(weekIndex, first.day_of_week),
      googleMeetUrl: first.google_meet_url,
      dayOfWeek: first.day_of_week,
      startBRT: first.start_time || '19:00',
      endBRT: first.end_time || '20:25',
      isHappeningNow: false,
    };
  }

  // Ordena por horário de início
  discsToday.sort((a, b) => {
    const [hA, mA] = (a.start_time || '19:00').split(':').map(Number);
    const [hB, mB] = (b.start_time || '19:00').split(':').map(Number);
    return (hA * 60 + mA) - (hB * 60 + mB);
  });

  let chosenDisc = discsToday[0];
  let isHappeningNow = false;

  for (let i = 0; i < discsToday.length; i++) {
    const d = discsToday[i];
    const [startH, startM] = (d.start_time || '19:00').split(':').map(Number);
    const [endH, endM] = (d.end_time || '20:25').split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    // Se estiver no intervalo da aula (com 20 min de antecedência e até 10 min após o encerramento)
    if (currentMinutes >= (startMin - 20) && currentMinutes <= (endMin + 10)) {
      chosenDisc = d;
      isHappeningNow = true;
      break;
    }
  }

  // Se não estiver exatamente no horário de nenhuma, mas for depois do fim da primeira aula (ex: 20:30 em diante)
  if (!isHappeningNow && discsToday.length > 1) {
    const [firstEndH, firstEndM] = (discsToday[0].end_time || '20:25').split(':').map(Number);
    const firstEndMin = firstEndH * 60 + firstEndM;
    if (currentMinutes >= firstEndMin) {
      chosenDisc = discsToday[1];
    }
  }

  const calculatedDate = getDateForLesson(weekIndex, chosenDisc.day_of_week);

  return {
    disciplinaId: chosenDisc.id,
    disciplinaName: chosenDisc.name,
    aulaNum,
    dataAula: calculatedDate,
    googleMeetUrl: chosenDisc.google_meet_url,
    dayOfWeek: chosenDisc.day_of_week,
    startBRT: chosenDisc.start_time || '19:00',
    endBRT: chosenDisc.end_time || '22:00',
    isHappeningNow,
  };
}
