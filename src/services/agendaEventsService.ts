'use client';

import { GoogleAgendaEvent, GOOGLE_AGENDA_EVENTS } from './googleAgendaService';
import { getPlanoEstudosForTurma } from './planoEstudosService';
import { getAnnouncements } from './announcementsService';
import { getSafeStreamUrl } from '@/lib/videoUtils';
import { getGravacoesForDisciplina } from './gravacoesService';

export type EventCategory = 'aula' | 'entregavel' | 'aviso' | 'evento_pessoal' | 'dia_especial';

export interface CalendarUniversalEvent {
  id: string;
  title: string;
  description?: string;
  dateStr: string; // 'YYYY-MM-DD'
  startTime?: string; // '19:00'
  endTime?: string;   // '20:25'
  isAllDay?: boolean;
  category: EventCategory;
  colorTag: string; // Hexadecimal
  bgClass?: string;
  borderClass?: string;
  textClass?: string;
  meetUrl?: string;
  videoUrl?: string;
  driveUrl?: string;
  disciplinaId?: string;
  disciplinaCode?: string;
  professorName?: string;
  monitorName?: string;
  isCustomStudentEvent?: boolean;
  userEmail?: string;
  location?: string;
}

const STORAGE_CUSTOM_EVENTS_KEY = 'lms_custom_student_calendar_events_v1';

// Mapeamento das 16 Semanas do Semestre 2026.2 (Terça a Sexta)
// Início: 11 de Agosto de 2026 | Término: 27 de Novembro / 02 de Dezembro de 2026
export const SEMESTRE_2026_2_DATES: { dateStr: string; dayOfWeek: string; dayIndex: number; aulaNum: number }[] = [];

(() => {
  // Gera as datas oficiais das 16 aulas de Terça a Sexta no semestre 2026.2
  // Terça: 11/08, 18/08, 25/08, 01/09, 08/09 (compensação), 15/09, 22/09, 29/09, 06/10, 13/10, 20/10, 27/10, 03/11, 10/11, 17/11, 24/11
  const startTuesday = new Date(2026, 7, 11); // 11 de Agosto de 2026

  for (let week = 0; week < 16; week++) {
    // Terça (dia base + week*7)
    const terDate = new Date(startTuesday);
    terDate.setDate(startTuesday.getDate() + (week * 7));
    
    // Quarta (+1)
    const quaDate = new Date(terDate);
    quaDate.setDate(terDate.getDate() + 1);

    // Quinta (+2)
    const quiDate = new Date(terDate);
    quiDate.setDate(terDate.getDate() + 2);

    // Sexta (+3)
    const sexDate = new Date(terDate);
    sexDate.setDate(terDate.getDate() + 3);

    const fmt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    SEMESTRE_2026_2_DATES.push(
      { dateStr: fmt(terDate), dayOfWeek: 'Terça-feira', dayIndex: 2, aulaNum: week + 1 },
      { dateStr: fmt(quaDate), dayOfWeek: 'Quarta-feira', dayIndex: 3, aulaNum: week + 1 },
      { dateStr: fmt(quiDate), dayOfWeek: 'Quinta-feira', dayIndex: 4, aulaNum: week + 1 },
      { dateStr: fmt(sexDate), dayOfWeek: 'Sexta-feira', dayIndex: 5, aulaNum: week + 1 }
    );
  }
})();

// Feriados e Dias Letivos Especiais
export const DIAS_ESPECIAIS_2026_2: CalendarUniversalEvent[] = [
  {
    id: 'dia-esp-01',
    title: 'Aula Normal — Compensação Feriado 07/09',
    description: 'Aula normal para compensação do feriado da Independência do Brasil, evitando prejuízo na carga horária.',
    dateStr: '2026-09-08',
    isAllDay: true,
    category: 'dia_especial',
    colorTag: '#f59e0b',
  },
  {
    id: 'dia-esp-02',
    title: 'Aula Normal — Compensação Feriado 12/10',
    description: 'Aula normal para compensação do feriado nacional de 12/10, garantindo o cronograma de 16 aulas.',
    dateStr: '2026-10-13',
    isAllDay: true,
    category: 'dia_especial',
    colorTag: '#f59e0b',
  },
  {
    id: 'dia-esp-03',
    title: 'Aula Normal — Compensação Feriado 02/11',
    description: 'Aula normal para compensação do feriado de Finados, garantindo a carga horária integral.',
    dateStr: '2026-11-03',
    isAllDay: true,
    category: 'dia_especial',
    colorTag: '#f59e0b',
  },
];

// Eventos Pessoais Salvos pelo Aluno
export function getCustomStudentEvents(userEmail?: string): CalendarUniversalEvent[] {
  if (typeof window === 'undefined') return [];
  const normalized = (userEmail || 'default').toLowerCase().trim();
  try {
    const raw = localStorage.getItem(`${STORAGE_CUSTOM_EVENTS_KEY}_${normalized}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomStudentEvents(events: CalendarUniversalEvent[], userEmail?: string): void {
  if (typeof window === 'undefined') return;
  const normalized = (userEmail || 'default').toLowerCase().trim();
  try {
    localStorage.setItem(`${STORAGE_CUSTOM_EVENTS_KEY}_${normalized}`, JSON.stringify(events));
    window.dispatchEvent(new CustomEvent('lms_calendar_events_updated', { detail: events }));
  } catch (e) {
    console.error('Erro ao salvar eventos do aluno:', e);
  }
}

export function addCustomStudentEvent(
  event: Omit<CalendarUniversalEvent, 'id' | 'isCustomStudentEvent' | 'category'>,
  userEmail?: string
): CalendarUniversalEvent {
  const newEv: CalendarUniversalEvent = {
    ...event,
    id: `cust-ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    category: 'evento_pessoal',
    isCustomStudentEvent: true,
    userEmail: userEmail?.toLowerCase().trim(),
    colorTag: event.colorTag || '#8b5cf6',
  };

  const current = getCustomStudentEvents(userEmail);
  const updated = [...current, newEv];
  saveCustomStudentEvents(updated, userEmail);
  return newEv;
}

export function updateCustomStudentEvent(
  event: CalendarUniversalEvent,
  userEmail?: string
): void {
  const current = getCustomStudentEvents(userEmail);
  const updated = current.map((e) => (e.id === event.id ? event : e));
  saveCustomStudentEvents(updated, userEmail);
}

export function deleteCustomStudentEvent(
  eventId: string,
  userEmail?: string
): void {
  const current = getCustomStudentEvents(userEmail);
  const updated = current.filter((e) => e.id !== eventId);
  saveCustomStudentEvents(updated, userEmail);
}

/**
 * Agrega e unifica TODOS os eventos do semestre:
 * 1. Aulas semanais geradas para cada semana do semestre 2026.2
 * 2. Prazos e entregáveis do Plano de Estudos (AV1, AV2, TCC)
 * 3. Dias Letivos Especiais / Compensações
 * 4. Eventos e lembretes criados pelo aluno
 */
export function getAllCalendarUniversalEvents(userEmail?: string, turmaId: string = 'turma-a'): CalendarUniversalEvent[] {
  const events: CalendarUniversalEvent[] = [];

  // 1. Gera as instâncias das Aulas Semanais para todo o calendário do semestre 2026.2
  for (const dateItem of SEMESTRE_2026_2_DATES) {
    const dayClasses = GOOGLE_AGENDA_EVENTS.filter((e) => e.dayOfWeek === dateItem.dayOfWeek);

    for (const cls of dayClasses) {
      // Busca gravação correspondente se houver
      const recs = getGravacoesForDisciplina(cls.disciplinaId, cls.title);
      const matchingRec = recs.find((r) => r.aula_num === dateItem.aulaNum) || (recs.length > 0 ? recs[recs.length - 1] : undefined);

      events.push({
        id: `aula-${cls.id}-${dateItem.dateStr}`,
        title: `${cls.title} (Aula ${dateItem.aulaNum})`,
        description: cls.description,
        dateStr: dateItem.dateStr,
        startTime: cls.startTime,
        endTime: cls.endTime,
        category: 'aula',
        colorTag: cls.colorTag || '#2563eb',
        meetUrl: cls.googleMeetUrl,
        videoUrl: matchingRec ? getSafeStreamUrl(matchingRec.video_url) : undefined,
        driveUrl: cls.driveFolderUrl,
        disciplinaId: cls.disciplinaId,
        disciplinaCode: cls.code,
        professorName: cls.professorName,
        monitorName: cls.monitorName,
        location: 'Google Meet',
      });
    }
  }

  // 2. Entregáveis do Plano de Estudos da Turma
  const plano = getPlanoEstudosForTurma(0);
  if (plano && Array.isArray(plano.entregaveis)) {
    for (const ent of plano.entregaveis) {
      const dStr = ent.dataISO || (ent.dataLimite ? ent.dataLimite.split(' ')[0] : '2026-09-01');

      events.push({
        id: `entregavel-${ent.id}`,
        title: `📝 ${ent.titulo}`,
        description: `${ent.descricao || ''} (${ent.disciplina})`,
        dateStr: dStr,
        startTime: '23:59',
        isAllDay: true,
        category: 'entregavel',
        colorTag: '#d97706', // amber
        disciplinaCode: ent.disciplina,
        disciplinaId: ent.disciplinaId,
      });
    }
  }

  // 3. Dias Letivos Especiais / Feriados
  events.push(...DIAS_ESPECIAIS_2026_2);

  // 4. Eventos e Lembretes Pessoais do Aluno
  const studentEvents = getCustomStudentEvents(userEmail);
  events.push(...studentEvents);

  return events;
}
