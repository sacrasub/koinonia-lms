'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, User, BookOpen, 
  CheckCircle2, Circle, AlertTriangle, FileText, 
  ChevronLeft, ChevronRight, X, ExternalLink, 
  Mail, Copy, Check, Sparkles, Filter, List, 
  Grid, ArrowRight, Share2, Award, Info, AlertCircle
} from 'lucide-react';
import { saveChecklistTasks } from '@/services/studentSyncService';

import { 
  AVALIACOES_2026_2 as SSOT_AVALIACOES_2026_2, 
  defaultSemesterTasks as SSOT_defaultSemesterTasks,
  CRONOGRAMA_OFICIAL_2026_2
} from '@/data/avaliacoes2026_2';
import type { 
  AvaliacaoEvento, 
  KanbanTask, 
  CronogramaConsolidadoItem 
} from '@/data/avaliacoes2026_2';

export type { AvaliacaoEvento, KanbanTask, CronogramaConsolidadoItem };
export { CRONOGRAMA_OFICIAL_2026_2 };

export const AVALIACOES_2026_2: AvaliacaoEvento[] = SSOT_AVALIACOES_2026_2;
export const defaultSemesterTasks: KanbanTask[] = SSOT_defaultSemesterTasks;

export function normalizeToIsoDate(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  // Se for no formato DD/MM/YYYY
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  // Se for formato ISO com hora (ex: 2026-09-04T00:00:00)
  if (trimmed.includes('T')) {
    return trimmed.split('T')[0];
  }
  // Se for formato YYYY-M-D
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  return trimmed;
}

export function formatIsoToDataTexto(isoDate: string): string {
  if (!isoDate) return 'Data a definir';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const monthName = monthNames[month - 1] || '';
    const dateObj = new Date(year, month - 1, day);
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const dayOfWeek = dayNames[dateObj.getDay()] || '';
    return `${String(day).padStart(2, '0')} de ${monthName} de ${year} (${dayOfWeek})`;
  }
  return isoDate;
}

interface CalendarioAcademicoProps {
  userEmail?: string;
  onBack?: () => void;
}

const MESES_SEMESTRE = [
  { index: 7, nome: 'Agosto', ano: 2026 },
  { index: 8, nome: 'Setembro', ano: 2026 },
  { index: 9, nome: 'Outubro', ano: 2026 },
  { index: 10, nome: 'Novembro', ano: 2026 },
  { index: 11, nome: 'Dezembro', ano: 2026 }
];

const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

export const CalendarioAcademico: React.FC<CalendarioAcademicoProps> = ({
  userEmail,
  onBack
}) => {
  const normalizedEmail = (userEmail || 'aluno@koinonia.edu.br').toLowerCase().trim();

  // Estado do mês ativo: Abre por padrão no mês corrente de 2026 (ou Outubro se fora do semestre)
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const now = new Date();
      if (now.getFullYear() === 2026 && now.getMonth() >= 7 && now.getMonth() <= 11) {
        return now.getMonth();
      }
    }
    return 9; // Outubro (0-indexed = 9) por padrão: Semana decisiva de avaliações
  });
  const [currentYear] = useState<number>(2026);
  const [viewMode, setViewMode] = useState<'grade' | 'lista'>('grade');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');

  // Clique 1: Modal com Todos os Prazos do Dia Selecionado
  const [selectedDayModal, setSelectedDayModal] = useState<{
    dayNumber: number;
    date: Date;
    dateString: string;
    dataTexto: string;
    events: AvaliacaoEvento[];
  } | null>(null);

  // Clique 2: Modal Compacto (Popup Resumo)
  const [popupEvento, setPopupEvento] = useState<AvaliacaoEvento | null>(null);

  // Clique 3: Painel Lateral / Drawer (Passo a Passo Completo)
  const [drawerEvento, setDrawerEvento] = useState<AvaliacaoEvento | null>(null);

  // Checklists persistidos no localStorage: record de booleans por evento e índice de passo
  const [checklistMap, setChecklistMap] = useState<Record<string, Record<number, boolean>>>({});
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedResumo, setCopiedResumo] = useState<boolean>(false);

  // Carrega tarefas adicionais do Kanban (ex: tarefas criadas pelo aluno ou trabalhos extras)
  const [extraKanbanEvents, setExtraKanbanEvents] = useState<AvaliacaoEvento[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncKanbanIntoCalendar = () => {
      try {
        const kanbanKey = `lms_checklist_${normalizedEmail}`;
        const raw = localStorage.getItem(kanbanKey);
        let tasks: KanbanTask[] = [];
        if (raw) {
          tasks = JSON.parse(raw);
        } else {
          tasks = defaultSemesterTasks;
        }

        const extras: AvaliacaoEvento[] = [];
        tasks.forEach((t) => {
          const isAlreadyInOfficial = AVALIACOES_2026_2.some((ev) => ev.id === t.id || ev.id === t.assessmentId);
          if (!isAlreadyInOfficial && t.dueDate) {
            const badge: 'PROVA' | 'TRABALHO' | 'SEMINÁRIO' | 'RESUMO' | 'ATIVIDADE' | 'ARTIGO' =
              t.type?.includes('Prova') ? 'PROVA'
              : t.type?.includes('Seminário') ? 'SEMINÁRIO'
              : t.type?.includes('Resumo') ? 'RESUMO'
              : t.type?.includes('TCC') ? 'ARTIGO'
              : t.type?.includes('Atividade') ? 'ATIVIDADE'
              : 'TRABALHO';

            const normalizedDueDate = normalizeToIsoDate(t.dueDate);
            const dataTextoFormatted = formatIsoToDataTexto(normalizedDueDate);

            extras.push({
              id: t.id,
              disciplina: t.subject || 'Atividade Acadêmica',
              disciplinaShort: (t.subject || 'Atividade').length > 25 ? (t.subject || 'Atividade').slice(0, 22) + '...' : (t.subject || 'Atividade'),
              professor: t.professor || 'Docente Responsável',
              tipo: t.title,
              tipoBadge: badge,
              dataLimite: normalizedDueDate,
              dataTexto: dataTextoFormatted,
              horario: 'Consulte orientações da disciplina',
              peso: t.priority === 'Máxima' ? 'Prioridade Máxima' : 'Prioridade Normal',
              regras: t.strategyNote ? [t.strategyNote] : ['Seguir as orientações docentes.'],
              passoAPasso: t.subtasks && t.subtasks.length > 0 ? t.subtasks.map((st: any) => st.text) : ['Planejamento', 'Execução', 'Revisão', 'Entrega'],
              bibliografia: {},
              canalEnvio: { tipo: 'plataforma' },
              cor: {
                bg: badge === 'PROVA' ? 'bg-amber-500/10' : badge === 'RESUMO' ? 'bg-emerald-500/10' : badge === 'SEMINÁRIO' ? 'bg-yellow-500/10' : badge === 'ARTIGO' ? 'bg-fuchsia-500/10' : badge === 'ATIVIDADE' ? 'bg-teal-500/10' : 'bg-indigo-500/10',
                text: badge === 'PROVA' ? 'text-amber-300' : badge === 'RESUMO' ? 'text-emerald-300' : badge === 'SEMINÁRIO' ? 'text-yellow-300' : badge === 'ARTIGO' ? 'text-fuchsia-300' : badge === 'ATIVIDADE' ? 'text-teal-300' : 'text-indigo-300',
                border: badge === 'PROVA' ? 'border-amber-500/30' : badge === 'RESUMO' ? 'border-emerald-500/30' : badge === 'SEMINÁRIO' ? 'border-yellow-500/30' : badge === 'ARTIGO' ? 'border-fuchsia-500/30' : badge === 'ATIVIDADE' ? 'border-teal-500/30' : 'border-indigo-500/30',
                pillBg: badge === 'PROVA' ? 'bg-amber-600 hover:bg-amber-500 text-white' : badge === 'RESUMO' ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : badge === 'SEMINÁRIO' ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold' : badge === 'ARTIGO' ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white' : badge === 'ATIVIDADE' ? 'bg-teal-600 hover:bg-teal-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white',
                dot: badge === 'PROVA' ? 'bg-amber-400' : badge === 'RESUMO' ? 'bg-emerald-300' : badge === 'SEMINÁRIO' ? 'bg-amber-300' : badge === 'ARTIGO' ? 'bg-fuchsia-400' : badge === 'ATIVIDADE' ? 'bg-teal-300' : 'bg-indigo-400',
                badgeBg: badge === 'PROVA' ? 'bg-amber-500/20' : badge === 'RESUMO' ? 'bg-emerald-500/20' : badge === 'SEMINÁRIO' ? 'bg-yellow-500/20' : badge === 'ARTIGO' ? 'bg-fuchsia-500/20' : badge === 'ATIVIDADE' ? 'bg-teal-500/20' : 'bg-indigo-500/20',
                badgeText: badge === 'PROVA' ? 'text-amber-300' : badge === 'RESUMO' ? 'text-emerald-300' : badge === 'SEMINÁRIO' ? 'text-yellow-300' : badge === 'ARTIGO' ? 'text-fuchsia-300' : badge === 'ATIVIDADE' ? 'text-teal-300' : 'text-indigo-300',
              }
            });
          }
        });
        setExtraKanbanEvents(extras);
      } catch (_) {}
    };

    syncKanbanIntoCalendar();
    window.addEventListener('koinonia_assessment_progress_updated', syncKanbanIntoCalendar);
    window.addEventListener('lms_student_sync_updated', syncKanbanIntoCalendar);
    window.addEventListener('storage', syncKanbanIntoCalendar);
    return () => {
      window.removeEventListener('koinonia_assessment_progress_updated', syncKanbanIntoCalendar);
      window.removeEventListener('lms_student_sync_updated', syncKanbanIntoCalendar);
      window.removeEventListener('storage', syncKanbanIntoCalendar);
    };
  }, [normalizedEmail]);

  const allCalendarEvents = useMemo(() => {
    const combined = [...AVALIACOES_2026_2, ...extraKanbanEvents];
    return combined.sort((a, b) => (a.dataLimite || '').localeCompare(b.dataLimite || ''));
  }, [extraKanbanEvents]);

  // Carregar checklists do localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initialChecklists: Record<string, Record<number, boolean>> = {};
    const kanbanKey = `lms_checklist_${normalizedEmail}`;
    const kanbanTasksMap: Record<string, any> = {};
    try {
      const rawKanban = localStorage.getItem(kanbanKey);
      const kTasks = rawKanban ? JSON.parse(rawKanban) : defaultSemesterTasks;
      kTasks.forEach((t: any) => {
        if (t.id) kanbanTasksMap[t.id] = t;
        if (t.assessmentId) kanbanTasksMap[t.assessmentId] = t;
      });
    } catch (_) {}

    allCalendarEvents.forEach((ev) => {
      const storageKey = `koinonia_checklist_${normalizedEmail}_${ev.id}`;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          initialChecklists[ev.id] = JSON.parse(raw);
        } else {
          // Inicializa a partir das subtasks do Kanban se existirem
          const kTask = kanbanTasksMap[ev.id];
          const checks: Record<number, boolean> = {};
          if (kTask) {
            if (kTask.status === 'done') {
              ev.passoAPasso.forEach((_, idx) => {
                checks[idx] = true;
              });
            } else if (kTask.subtasks && kTask.subtasks.length > 0) {
              kTask.subtasks.forEach((st: any, idx: number) => {
                checks[idx] = !!st.done;
              });
            }
            try {
              localStorage.setItem(storageKey, JSON.stringify(checks));
            } catch (_) {}
          }
          initialChecklists[ev.id] = checks;
        }
      } catch (_) {
        initialChecklists[ev.id] = {};
      }
    });
    setChecklistMap(initialChecklists);
  }, [normalizedEmail, allCalendarEvents]);

  // Concluir toda a avaliação de uma vez e sincronizar com o Kanban
  const handleCompleteAssessment = (evento: AvaliacaoEvento) => {
    const allChecks: Record<number, boolean> = {};
    evento.passoAPasso.forEach((_, idx) => {
      allChecks[idx] = true;
    });

    setChecklistMap((prev) => ({
      ...prev,
      [evento.id]: allChecks,
    }));

    if (typeof window !== 'undefined') {
      const storageKey = `koinonia_checklist_${normalizedEmail}_${evento.id}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(allChecks));
      } catch (_) {}

      try {
        const kanbanKey = `lms_checklist_${normalizedEmail}`;
        const rawKanban = localStorage.getItem(kanbanKey);
        let kanbanTasks: any[] = [];
        try {
          kanbanTasks = rawKanban ? JSON.parse(rawKanban) : [];
        } catch (_) {}

        let found = false;
        const updatedKanban = kanbanTasks.map((t) => {
          if (t.assessmentId === evento.id || t.id === evento.id) {
            found = true;
            const updatedSubtasks = t.subtasks && t.subtasks.length > 0
              ? t.subtasks.map((st: any) => ({ ...st, done: true }))
              : evento.passoAPasso.map((p, idx) => ({ id: `st-${evento.id}-${idx}`, text: p, done: true }));
            return { ...t, status: 'done', subtasks: updatedSubtasks };
          }
          return t;
        });

        if (!found) {
          const newTask = {
            id: evento.id,
            assessmentId: evento.id,
            title: evento.tipo,
            subject: evento.disciplina,
            professor: evento.professor,
            dueDate: evento.dataLimite,
            priority: 'Máxima',
            type: evento.tipoBadge === 'PROVA' ? 'Prova Objetiva' : evento.tipoBadge === 'TRABALHO' ? 'Trabalho Escrito' : evento.tipoBadge === 'SEMINÁRIO' ? 'Seminário em Grupo' : evento.tipoBadge === 'RESUMO' ? 'Resumo Crítico' : evento.tipoBadge === 'ARTIGO' ? 'TCC' : 'Atividade Modular',
            status: 'done',
            strategyNote: `${evento.dataTexto} • ${evento.horario}. ${evento.peso}`,
            subtasks: evento.passoAPasso.map((p, idx) => ({ id: `st-${evento.id}-${idx}`, text: p, done: true })),
          };
          updatedKanban.push(newTask);
        }

        localStorage.setItem(kanbanKey, JSON.stringify(updatedKanban));
        saveChecklistTasks(normalizedEmail, updatedKanban);
      } catch (_) {}

      window.dispatchEvent(
        new CustomEvent('koinonia_assessment_progress_updated', {
          detail: {
            source: 'calendario',
            assessmentId: evento.id,
            status: 'done',
            allSteps: allChecks,
          },
        })
      );
    }

    setDrawerEvento(null);
  };

  // Alternar checkbox do passo a passo
  const toggleChecklistStep = (eventoId: string, stepIdx: number) => {
    setChecklistMap((prev) => {
      const currentEvChecks = { ...(prev[eventoId] || {}) };
      const newDone = !currentEvChecks[stepIdx];
      currentEvChecks[stepIdx] = newDone;
      const updated = { ...prev, [eventoId]: currentEvChecks };
      
      if (typeof window !== 'undefined') {
        const storageKey = `koinonia_checklist_${normalizedEmail}_${eventoId}`;
        try {
          localStorage.setItem(storageKey, JSON.stringify(currentEvChecks));
        } catch (_) {}

        // Sincroniza em tempo real com o Quadro Kanban (Checklist do Aluno)
        try {
          const kanbanKey = `lms_checklist_${normalizedEmail}`;
          const rawKanban = localStorage.getItem(kanbanKey);
          let kanbanTasks: any[] = [];
          try {
            kanbanTasks = rawKanban ? JSON.parse(rawKanban) : [];
          } catch (_) {}

          let found = false;
          const updatedKanban = kanbanTasks.map((t) => {
            if (t.assessmentId === eventoId || t.id === eventoId) {
              found = true;
              const updatedSubtasks = t.subtasks && t.subtasks.length > 0 ? t.subtasks.map((st: any, idx: number) =>
                idx === stepIdx ? { ...st, done: newDone } : st
              ) : [];
              const doneCount = updatedSubtasks.filter((st: any) => st.done).length;
              const newStatus =
                doneCount === updatedSubtasks.length && updatedSubtasks.length > 0
                  ? 'done'
                  : doneCount > 0
                  ? 'doing'
                  : 'todo';
              return { ...t, subtasks: updatedSubtasks, status: newStatus };
            }
            return t;
          });

          if (!found) {
            const ev = allCalendarEvents.find((e) => e.id === eventoId);
            if (ev) {
              const subtasks = ev.passoAPasso.map((p, idx) => ({
                id: `st-${ev.id}-${idx}`,
                text: p,
                done: idx === stepIdx ? newDone : !!currentEvChecks[idx],
              }));
              const doneCount = subtasks.filter((st) => st.done).length;
              const newStatus =
                doneCount === subtasks.length && subtasks.length > 0
                  ? 'done'
                  : doneCount > 0
                  ? 'doing'
                  : 'todo';

              const newTask = {
                id: ev.id,
                assessmentId: ev.id,
                title: ev.tipo,
                subject: ev.disciplina,
                professor: ev.professor,
                dueDate: ev.dataLimite,
                priority: 'Máxima',
                type: ev.tipoBadge === 'PROVA' ? 'Prova Objetiva' : ev.tipoBadge === 'TRABALHO' ? 'Trabalho Escrito' : ev.tipoBadge === 'SEMINÁRIO' ? 'Seminário em Grupo' : ev.tipoBadge === 'RESUMO' ? 'Resumo Crítico' : ev.tipoBadge === 'ARTIGO' ? 'TCC' : 'Atividade Modular',
                status: newStatus,
                strategyNote: `${ev.dataTexto} • ${ev.horario}. ${ev.peso}`,
                subtasks,
              };
              updatedKanban.push(newTask);
            }
          }

          localStorage.setItem(kanbanKey, JSON.stringify(updatedKanban));
          saveChecklistTasks(normalizedEmail, updatedKanban);
        } catch (_) {}

        // Dispara evento para atualização instantânea em componentes ativos
        window.dispatchEvent(new CustomEvent('koinonia_assessment_progress_updated', {
          detail: {
            source: 'calendario',
            assessmentId: eventoId,
            stepIdx,
            done: newDone,
            allSteps: currentEvChecks
          }
        }));
      }
      return updated;
    });
  };

  // Listener para sincronização bidirecional em tempo real vinda do Quadro Kanban
  useEffect(() => {
    const handleAssessmentSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail || customEvent.detail.source === 'calendario') return;
      const { assessmentId } = customEvent.detail;
      if (!assessmentId) return;

      const storageKey = `koinonia_checklist_${normalizedEmail}_${assessmentId}`;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const checks = JSON.parse(raw);
          setChecklistMap((prev) => ({
            ...prev,
            [assessmentId]: checks,
          }));
        }
      } catch (_) {}
    };

    window.addEventListener('koinonia_assessment_progress_updated', handleAssessmentSync);
    return () => {
      window.removeEventListener('koinonia_assessment_progress_updated', handleAssessmentSync);
    };
  }, [normalizedEmail]);

  const getEventProgress = (evento: AvaliacaoEvento) => {
    const checks = checklistMap[evento.id] || {};
    const total = evento.passoAPasso.length;
    if (total === 0) return { completed: 0, total: 0, percent: 0 };
    let completed = 0;
    for (let i = 0; i < total; i++) {
      if (checks[i]) completed++;
    }
    const percent = Math.round((completed / total) * 100);
    return { completed, total, percent };
  };

  // Lista única de disciplinas para filtro
  const disciplinasList = useMemo(() => {
    const map = new Map<string, string>();
    allCalendarEvents.forEach((ev) => {
      map.set(ev.disciplina, ev.disciplinaShort);
    });
    return Array.from(map.entries()).map(([full, short]) => ({ full, short }));
  }, [allCalendarEvents]);

  // Eventos filtrados
  const filteredEvents = useMemo(() => {
    if (selectedDiscipline === 'all') return allCalendarEvents;
    return allCalendarEvents.filter((ev) => ev.disciplina === selectedDiscipline);
  }, [selectedDiscipline, allCalendarEvents]);

  // Navegação entre meses
  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => (prev > 7 ? prev - 1 : 7));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev < 11 ? prev + 1 : 11));
  };

  const handleGoToday = () => {
    const today = new Date();
    const m = today.getMonth();
    if (m >= 7 && m <= 11) {
      setCurrentMonthIndex(m);
    } else {
      setCurrentMonthIndex(8); // Default Setembro
    }
  };

  // Matriz de Dias do Mês (Grade do Google Agenda: 7 colunas)
  const calendarDays = useMemo(() => {
    const formatToYmd = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const firstDay = new Date(currentYear, currentMonthIndex, 1);
    const lastDay = new Date(currentYear, currentMonthIndex + 1, 0);

    const startingDayOfWeek = firstDay.getDay(); // 0 = Domingo, 1 = Segunda...
    const totalDaysInMonth = lastDay.getDate();

    // Dias do mês anterior para completar a primeira linha
    const prevMonthLastDay = new Date(currentYear, currentMonthIndex, 0).getDate();
    const days: {
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      dateString: string; // YYYY-MM-DD
      events: AvaliacaoEvento[];
    }[] = [];

    // Preenchimento dos dias anteriores
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(currentYear, currentMonthIndex - 1, d);
      const str = formatToYmd(prevDate);
      const evs = filteredEvents.filter((e) => e.dataLimite === str);
      days.push({
        date: prevDate,
        dayNumber: d,
        isCurrentMonth: false,
        dateString: str,
        events: evs
      });
    }

    // Dias do mês atual
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const currDate = new Date(currentYear, currentMonthIndex, d);
      const str = formatToYmd(currDate);
      
      // Tratamento especial para o Seminário de Ética Cristã que abrange quintas-feiras de 22/10 a 19/11
      const evs = filteredEvents.filter((e) => {
        if (e.id === 'aval-8-etica-crista-seminario') {
          // Quintas-feiras entre 22/10/2026 e 19/11/2026
          const dayOfWeek = currDate.getDay();
          const isQuinta = dayOfWeek === 4;
          const time = currDate.getTime();
          const startRange = new Date(2026, 9, 22).getTime();
          const endRange = new Date(2026, 10, 19).getTime();
          return isQuinta && time >= startRange && time <= endRange;
        }
        return e.dataLimite === str;
      });

      days.push({
        date: currDate,
        dayNumber: d,
        isCurrentMonth: true,
        dateString: str,
        events: evs
      });
    }

    // Dias do próximo mês para completar os blocos de 7 (35 ou 42 células)
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remainingDays; d++) {
      const nextDate = new Date(currentYear, currentMonthIndex + 1, d);
      const str = formatToYmd(nextDate);
      const evs = filteredEvents.filter((e) => e.dataLimite === str);
      days.push({
        date: nextDate,
        dayNumber: d,
        isCurrentMonth: false,
        dateString: str,
        events: evs
      });
    }

    return days;
  }, [currentYear, currentMonthIndex, filteredEvents]);

  const activeMonthData = MESES_SEMESTRE.find((m) => m.index === currentMonthIndex) || MESES_SEMESTRE[1];

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const handleCopyResumo = (evento: AvaliacaoEvento) => {
    const texto = `📋 *${evento.disciplina}*\n` +
      `👤 Professor: ${evento.professor}\n` +
      `📅 Prazo: ${evento.dataTexto} — ${evento.horario}\n` +
      `🎯 Tipo: ${evento.tipo}\n` +
      `⚖️ Peso: ${evento.peso}\n\n` +
      `📝 *Passo a Passo de Execução:*\n` +
      evento.passoAPasso.map((p, idx) => `${idx + 1}. ${p}`).join('\n') +
      `\n\n📌 *Regras Principais:*\n` +
      evento.regras.map((r) => `• ${r}`).join('\n') +
      (evento.canalEnvio.destinatario ? `\n\n✉️ Envio: ${evento.canalEnvio.destinatario}` : '');

    navigator.clipboard.writeText(texto);
    setCopiedResumo(true);
    setTimeout(() => setCopiedResumo(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. BARRA DE CABEÇALHO ESTILO GOOGLE AGENDA */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl text-white space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Voltar ao Painel Geral"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
            )}
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                  Agenda Acadêmica
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Semestre 2026.2
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Calendário de Trabalhos e Avaliações
              </h2>
            </div>
          </div>

          {/* CONTROLES DE NAVEGAÇÃO ENTRE MESES */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleGoToday}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer active:scale-95"
            >
              Hoje
            </button>
            
            <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={currentMonthIndex <= 7}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs sm:text-sm font-black px-3 min-w-[120px] text-center text-white">
                {activeMonthData.nome} {activeMonthData.ano}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                disabled={currentMonthIndex >= 11}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* SELETOR DE MODO GRADE / LISTA */}
            <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('grade')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'grade'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" /> Grade
              </button>
              <button
                type="button"
                onClick={() => setViewMode('lista')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'lista'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" /> Linha do Tempo
              </button>
            </div>
          </div>
        </div>

        {/* 2. ATALHOS DIRETOS PARA CADA MÊS (AGOSTO A DEZEMBRO) & FILTRO POR DISCIPLINA */}
        <div className="pt-2 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              Meses:
            </span>
            {MESES_SEMESTRE.map((m) => {
              const isActive = m.index === currentMonthIndex;
              return (
                <button
                  key={m.index}
                  type="button"
                  onClick={() => setCurrentMonthIndex(m.index)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  {m.nome}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Todas as Disciplinas (12 Avaliações)</option>
              {disciplinasList.map((d) => (
                <option key={d.full} value={d.full}>
                  {d.short}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. VISÃO 1: GRADE MENSAL ESTILO GOOGLE AGENDA */}
      {viewMode === 'grade' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-5 shadow-2xl overflow-hidden">
          {/* DIAS DA SEMANA */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
            {DIAS_SEMANA.map((dia, idx) => (
              <div
                key={dia}
                className={`py-2 text-[10px] sm:text-xs font-black tracking-wider uppercase ${
                  idx === 0 || idx === 6 ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {dia}
              </div>
            ))}
          </div>

          {/* DIAS DO CALENDÁRIO */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((cDay, idx) => {
              const hasEvents = cDay.events.length > 0;
              const isToday = (() => {
                const now = new Date();
                return (
                  cDay.date.getDate() === now.getDate() &&
                  cDay.date.getMonth() === now.getMonth() &&
                  cDay.date.getFullYear() === now.getFullYear()
                );
              })();

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (hasEvents) {
                      setSelectedDayModal({
                        dayNumber: cDay.dayNumber,
                        date: cDay.date,
                        dateString: cDay.dateString,
                        dataTexto: cDay.events[0]?.dataTexto || `${cDay.dayNumber} de ${activeMonthData.nome} de ${activeMonthData.ano}`,
                        events: cDay.events
                      });
                    }
                  }}
                  className={`min-h-[85px] sm:min-h-[125px] rounded-2xl p-1.5 sm:p-2.5 flex flex-col justify-between border transition relative ${
                    !cDay.isCurrentMonth
                      ? 'bg-slate-950/40 border-slate-800/40 text-slate-600 opacity-60'
                      : isToday
                      ? 'bg-blue-950/20 border-blue-500/50 shadow-inner'
                      : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                  } ${hasEvents ? 'cursor-pointer hover:bg-slate-800/80 hover:shadow-lg' : ''}`}
                >
                  {/* CABEÇALHO DO DIA */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-black rounded-lg w-6 h-6 flex items-center justify-center ${
                        isToday
                          ? 'bg-blue-600 text-white font-black shadow-md'
                          : cDay.isCurrentMonth
                          ? 'text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {cDay.dayNumber}
                    </span>

                    {hasEvents && (
                      <span className="hidden sm:inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {cDay.events.length} {cDay.events.length === 1 ? 'prazo' : 'prazos'}
                      </span>
                    )}
                  </div>

                  {/* PÍLULAS DE EVENTOS (ESTILO GOOGLE AGENDA) */}
                  <div className="space-y-1 sm:space-y-1.5 mt-1 overflow-hidden">
                    {cDay.events.slice(0, 2).map((ev) => {
                      const prog = getEventProgress(ev);
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDayModal({
                              dayNumber: cDay.dayNumber,
                              date: cDay.date,
                              dateString: cDay.dateString,
                              dataTexto: cDay.events[0]?.dataTexto || `${cDay.dayNumber} de ${activeMonthData.nome} de ${activeMonthData.ano}`,
                              events: cDay.events
                            });
                          }}
                          className={`w-full text-left px-1.5 sm:px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-between gap-1 shadow-xs truncate cursor-pointer ${ev.cor.pillBg}`}
                        >
                          <span className="truncate">
                            <strong className="font-extrabold mr-1">[{ev.tipoBadge}]</strong>
                            {ev.disciplinaShort}
                          </span>
                          {prog.total > 0 && prog.percent === 100 && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-200 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}

                    {cDay.events.length > 2 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayModal({
                            dayNumber: cDay.dayNumber,
                            date: cDay.date,
                            dateString: cDay.dateString,
                            dataTexto: cDay.events[0]?.dataTexto || `${cDay.dayNumber} de ${activeMonthData.nome} de ${activeMonthData.ano}`,
                            events: cDay.events
                          });
                        }}
                        className="text-[10px] font-extrabold text-blue-400 hover:text-blue-300 pl-1 block text-left"
                      >
                        +{cDay.events.length - 2} mais...
                      </button>
                    )}
                  </div>

                  {/* INDICADOR INFERIOR EM DISPOSITIVOS MÓVEIS */}
                  {hasEvents && (
                    <div className="sm:hidden flex items-center justify-center gap-1 mt-1">
                      {cDay.events.map((ev) => (
                        <span key={ev.id} className={`w-1.5 h-1.5 rounded-full ${ev.cor.dot}`} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. VISÃO 2: LINHA DO TEMPO CRONOLÓGICA (LISTA DETALHADA) */}
      {viewMode === 'lista' && (
        <div className="space-y-3">
          {filteredEvents.map((evento, index) => {
            const prog = getEventProgress(evento);
            return (
              <div
                key={evento.id}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-3xl p-5 shadow-xl transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center flex-shrink-0 text-white font-black">
                    <span className="text-[10px] text-blue-400 uppercase font-mono">
                      {evento.dataLimite.split('-')[1] === '09' ? 'SET' : evento.dataLimite.split('-')[1] === '10' ? 'OUT' : evento.dataLimite.split('-')[1] === '11' ? 'NOV' : 'DEZ'}
                    </span>
                    <span className="text-lg leading-none mt-0.5">
                      {evento.dataLimite.split('-')[2]}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${evento.cor.badgeBg} ${evento.cor.badgeText}`}>
                        {evento.tipoBadge}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {evento.dataTexto} • {evento.horario}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white">
                      {evento.disciplina}
                    </h3>
                    <p className="text-xs text-slate-400">
                      <strong className="text-slate-300">Docente:</strong> {evento.professor} • <strong className="text-slate-300">Tipo:</strong> {evento.tipo}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {/* MINI PROGRESSO */}
                  <div className="bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700 flex items-center justify-between sm:justify-start gap-3">
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-slate-400 block">Progresso</span>
                      <span className="text-xs font-black text-blue-300">
                        {prog.completed}/{prog.total} passos
                      </span>
                    </div>
                    <div className="w-12 bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${prog.percent}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPopupEvento(evento)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold rounded-xl border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Resumo Rápido
                  </button>

                  <button
                    type="button"
                    onClick={() => setDrawerEvento(evento)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Passo a Passo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TODOS OS PRAZOS DO DIA SELECIONADO                                 */}
      {/* ========================================================================= */}
      {selectedDayModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl text-white flex flex-col max-h-[90vh]">
            {/* CABEÇALHO DO DIA */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex flex-col items-center justify-center font-black flex-shrink-0 shadow-inner">
                  <span className="text-[10px] uppercase font-mono tracking-wider">{activeMonthData.nome.substring(0, 3)}</span>
                  <span className="text-xl leading-none mt-0.5">{selectedDayModal.dayNumber}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                      {selectedDayModal.events.length} {selectedDayModal.events.length === 1 ? 'Prazo neste dia' : 'Prazos neste dia'}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      Semestre 2026.2
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {selectedDayModal.dataTexto}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Selecione um dos prazos abaixo para abrir os detalhes e o checklist:
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDayModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition cursor-pointer flex-shrink-0"
              >
                ✕
              </button>
            </div>

            {/* LISTA DE PRAZOS DO DIA */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {selectedDayModal.events.map((ev) => {
                const prog = getEventProgress(ev);
                return (
                  <div
                    key={ev.id}
                    onClick={() => {
                      // Ao clicar no prazo do dia, abre o Drawer de detalhes
                      setDrawerEvento(ev);
                    }}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${ev.cor.bg} ${ev.cor.border} hover:scale-[1.01] hover:shadow-xl hover:border-blue-400/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${ev.cor.badgeBg} ${ev.cor.badgeText}`}>
                          {ev.tipoBadge}
                        </span>
                        <span className="text-xs font-mono text-blue-300 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {ev.horario}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-white group-hover:text-blue-300 transition">
                        {ev.disciplina}
                      </h4>

                      <p className="text-xs text-slate-300">
                        Docente: <strong className="text-white">{ev.professor}</strong> • <span className="text-amber-300 font-medium">{ev.peso}</span>
                      </p>

                      <p className="text-xs text-slate-400 line-clamp-1">
                        {ev.tipo}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/50 flex-shrink-0">
                      {prog.total > 0 && (
                        <span className="text-[11px] font-extrabold text-blue-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                          {prog.completed}/{prog.total} concluídos
                        </span>
                      )}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPopupEvento(ev);
                          }}
                          className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          Resumo
                        </button>
                        <span className="text-xs font-extrabold text-white bg-blue-600 group-hover:bg-blue-500 px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1">
                          Ver Detalhes <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RODAPÉ DO MODAL DO DIA */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDayModal(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLIQUE 2: POPUP RESUMO (MODAL COMPACTO AO CLICAR EM RESUMO)               */}
      {/* ========================================================================= */}
      <PopupResumoAvaliacao
        evento={popupEvento}
        checklistMap={checklistMap}
        onClose={() => setPopupEvento(null)}
        onOpenDrawer={(ev) => {
          setPopupEvento(null);
          setDrawerEvento(ev);
        }}
      />

      {/* ========================================================================= */}
      {/* CLIQUE 3: PAINEL LATERAL / DRAWER (SLIDE-OVER COM GUIA COMPLETO)          */}
      {/* ========================================================================= */}
      <DrawerAvaliacao
        evento={drawerEvento}
        checklistMap={checklistMap}
        onToggleStep={toggleChecklistStep}
        onCompleteAssessment={handleCompleteAssessment}
        onClose={() => setDrawerEvento(null)}
      />
    </div>
  );
};

// ============================================================================
// COMPONENTES EXPORTADOS PARA DUAL-VIEW (USADOS NO CALENDÁRIO E NO QUADRO KANBAN)
// ============================================================================

export interface PopupResumoAvaliacaoProps {
  evento: AvaliacaoEvento | null;
  checklistMap: Record<string, Record<number, boolean>>;
  onClose: () => void;
  onOpenDrawer: (evento: AvaliacaoEvento) => void;
}

export const PopupResumoAvaliacao: React.FC<PopupResumoAvaliacaoProps> = ({
  evento,
  checklistMap,
  onClose,
  onOpenDrawer,
}) => {
  if (!evento) return null;

  const checks = checklistMap[evento.id] || {};
  const total = evento.passoAPasso.length;
  let completed = 0;
  for (let i = 0; i < total; i++) {
    if (checks[i]) completed++;
  }
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-white space-y-0">
        {/* TOPO COM IDENTIFICAÇÃO DA DISCIPLINA */}
        <div className={`p-5 border-b border-slate-800 flex items-start justify-between gap-3 ${evento.cor.bg}`}>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${evento.cor.badgeBg} ${evento.cor.badgeText}`}>
                {evento.tipoBadge}
              </span>
              <span className="text-xs font-bold text-slate-300">
                Semestre 2026.2
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {evento.disciplina}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ministrada por: <strong className="text-white">{evento.professor}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* CONTEÚDO PRINCIPAL DO RESUMO */}
        <div className="p-5 sm:p-6 space-y-4 text-sm">
          {/* BANNER DE PRORROGAÇÃO SE APLICÁVEL */}
          {(evento.id === 'aval-6-direitos-humanos-prova' || evento.dataLimite === '2026-10-04') && (
            <div className="p-3.5 bg-amber-500/20 border-2 border-amber-500/50 rounded-2xl flex items-start gap-3 text-xs text-amber-200 shadow-sm">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-300 font-bold text-sm">📢 Prazo Prorrogado Oficialmente!</strong>
                <span className="leading-relaxed">
                  A Prova Objetiva AV1 (08 pontos) foi estendida para <strong>04/10/2026 (Domingo) às 23:59</strong> via Google Forms sem consulta. O trabalho dissertativo (02 pontos) encerrou em 30/09 às 23:59.
                </span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-400 block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> Prazo e Horário
              </span>
              <p className="text-xs font-extrabold text-white mt-1">
                {evento.dataTexto}
              </p>
              <p className="text-[11px] text-blue-300 font-mono mt-0.5">
                {evento.horario}
              </p>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-400 block flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" /> Peso / Pontuação
              </span>
              <p className="text-xs font-bold text-slate-200 mt-1">
                {evento.peso}
              </p>
            </div>
          </div>

          {/* TIPO E DESCRIÇÃO SINTÉTICA */}
          <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/60 space-y-1.5">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Tipo da Avaliação
            </span>
            <p className="text-xs font-semibold text-slate-200 leading-relaxed">
              {evento.tipo}
            </p>
          </div>

          {/* PROGRESSO NO CHECKLIST */}
          <div className="bg-blue-950/30 border border-blue-500/30 p-3.5 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black text-blue-200 block">
                Seu Checklist de Preparação
              </span>
              <span className="text-[11px] text-slate-400">
                {completed} de {total} etapas concluídas ({percent}%)
              </span>
            </div>
            <div className="w-24 bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="p-5 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenDrawer(evento)}
            className="w-full sm:flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Ver Passo a Passo Completo</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export interface DrawerAvaliacaoProps {
  evento: AvaliacaoEvento | null;
  checklistMap: Record<string, Record<number, boolean>>;
  onToggleStep: (eventoId: string, stepIdx: number) => void;
  onCompleteAssessment?: (evento: AvaliacaoEvento) => void;
  onClose: () => void;
}

export const DrawerAvaliacao: React.FC<DrawerAvaliacaoProps> = ({
  evento,
  checklistMap,
  onToggleStep,
  onCompleteAssessment,
  onClose,
}) => {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedResumo, setCopiedResumo] = useState<boolean>(false);

  if (!evento) return null;

  const checks = checklistMap[evento.id] || {};
  const total = evento.passoAPasso.length;
  let completed = 0;
  for (let i = 0; i < total; i++) {
    if (checks[i]) completed++;
  }
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const handleCopyResumo = (ev: AvaliacaoEvento) => {
    const texto = `📋 *${ev.disciplina}*\n` +
      `👤 Professor: ${ev.professor}\n` +
      `📅 Prazo: ${ev.dataTexto} — ${ev.horario}\n` +
      `🎯 Tipo: ${ev.tipo}\n` +
      `⚖️ Peso: ${ev.peso}\n\n` +
      `📝 *Passo a Passo de Execução:*\n` +
      ev.passoAPasso.map((p, idx) => `${idx + 1}. ${p}`).join('\n') +
      `\n\n📌 *Regras Principais:*\n` +
      ev.regras.map((r) => `• ${r}`).join('\n') +
      (ev.canalEnvio.destinatario ? `\n\n✉️ Envio: ${ev.canalEnvio.destinatario}` : '');

    navigator.clipboard.writeText(texto);
    setCopiedResumo(true);
    setTimeout(() => setCopiedResumo(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex justify-end animate-in fade-in duration-300">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full flex flex-col shadow-2xl text-white animate-in slide-in-from-right duration-300">
        {/* TOPO DO DRAWER */}
        <div className={`p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 ${evento.cor.bg}`}>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${evento.cor.badgeBg} ${evento.cor.badgeText}`}>
                {evento.tipoBadge}
              </span>
              <span className="text-xs font-bold text-slate-300">
                Guia Oficial de Execução
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {evento.disciplina}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Profº <strong className="text-white">{evento.professor}</strong> • {evento.tipo}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-base transition cursor-pointer"
            title="Fechar painel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPO DO DRAWER COM SCROLL */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* BANNER DE PRORROGAÇÃO SE APLICÁVEL */}
          {(evento.id === 'aval-6-direitos-humanos-prova' || evento.dataLimite === '2026-10-04') && (
            <div className="p-4 bg-amber-500/20 border-2 border-amber-500/50 rounded-2xl flex items-start gap-3 text-xs text-amber-200 shadow-sm">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-300 font-bold text-sm mb-1">📢 Prazo Prorrogado Oficialmente!</strong>
                <p className="leading-relaxed">
                  A Prova Objetiva AV1 (08 pontos) foi estendida para <strong>04/10/2026 (Domingo) às 23:59</strong> via Google Forms sem consulta. O trabalho dissertativo (02 pontos) encerrou em 30/09 às 23:59.
                </p>
              </div>
            </div>
          )}
          {/* BANNER DE PRAZO E PONTUAÇÃO */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> Data Limite e Horário:
              </span>
              <p className="text-sm font-black text-white mt-0.5">
                {evento.dataTexto}
              </p>
              <p className="text-xs text-blue-300 font-mono mt-0.5">
                {evento.horario}
              </p>
            </div>

            <div className="sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700">
              <span className="text-[11px] font-bold text-slate-400 block flex items-center sm:justify-end gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" /> Peso na Média:
              </span>
              <p className="text-xs font-extrabold text-amber-300 mt-0.5">
                {evento.peso}
              </p>
            </div>
          </div>

          {/* 1. GUIA PASSO A PASSO COM CHECKLIST INTERATIVO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Passo a Passo de Execução (Checklist)
              </h3>
              <span className="text-xs font-extrabold text-blue-400">
                {completed}/{total} ({percent}%)
              </span>
            </div>

            <div className="space-y-2">
              {evento.passoAPasso.map((passo, sIdx) => {
                const isChecked = Boolean(checklistMap[evento.id]?.[sIdx]);
                return (
                  <div
                    key={sIdx}
                    onClick={() => onToggleStep(evento.id, sIdx)}
                    className={`p-3.5 rounded-2xl border transition flex items-start gap-3 cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 flex-shrink-0 cursor-pointer"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                      )}
                    </button>
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-black uppercase text-slate-400 block">
                        Etapa {sIdx + 1}
                      </span>
                      <p className={`text-xs sm:text-sm leading-relaxed ${isChecked ? 'line-through opacity-80' : 'font-medium'}`}>
                        {passo}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. REGRAS RÍGIDAS DE FORMATAÇÃO E CRITÉRIOS */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Regras Rígidas de Formatação e Critérios
            </h3>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2 text-xs">
              {evento.regras.map((regra, rIdx) => (
                <div key={rIdx} className="flex items-start gap-2 text-amber-200">
                  <span className="text-amber-400 font-black">•</span>
                  <p className="leading-relaxed">{regra}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. BIBLIOGRAFIA E LIVROS EXIGIDOS */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Bibliografia e Livros Exigidos
            </h3>
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 space-y-3 text-xs">
              {evento.bibliografia.obrigatoria && evento.bibliografia.obrigatoria.length > 0 && (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block mb-1.5">
                    Leitura Obrigatória:
                  </span>
                  <ul className="space-y-1 text-slate-200">
                    {evento.bibliografia.obrigatoria.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-1.5">
                        <span className="text-blue-400 font-bold">➔</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {evento.bibliografia.recomendada && evento.bibliografia.recomendada.length > 0 && (
                <div className="pt-2 border-t border-slate-700">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1.5">
                    Leitura Recomendada / Complementar:
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {evento.bibliografia.recomendada.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">➔</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 4. CANAL E INSTRUÇÕES DE ENVIO */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              Canal e Instruções de Envio
            </h3>
            <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-2xl p-4 space-y-3 text-xs">
              {evento.canalEnvio.destinatario && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-900 rounded-xl border border-indigo-500/30">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">E-mail para Submissão:</span>
                    <span className="font-mono text-xs font-black text-indigo-300">
                      {evento.canalEnvio.destinatario}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyEmail(evento.canalEnvio.destinatario!)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {copiedEmail === evento.canalEnvio.destinatario ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" /> E-mail Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copiar E-mail
                      </>
                    )}
                  </button>
                </div>
              )}

              {evento.canalEnvio.assunto && (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 block">Assunto Obrigatório do E-mail:</span>
                  <span className="font-mono text-xs font-black text-amber-300">
                    "{evento.canalEnvio.assunto}"
                  </span>
                </div>
              )}

              {evento.canalEnvio.observacao && (
                <p className="text-slate-300 leading-relaxed">
                  {evento.canalEnvio.observacao}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RODAPÉ DO DRAWER COM AÇÕES */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleCopyResumo(evento)}
            className="w-full sm:flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            {copiedResumo ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> Resumo Copiado!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" /> Copiar Resumo
              </>
            )}
          </button>

          {onCompleteAssessment && (
            <button
              type="button"
              onClick={() => onCompleteAssessment(evento)}
              className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluir Avaliação (100%)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
