'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Video, ExternalLink, Download, 
  Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Share2, 
  Filter, Users, Phone, FolderOpen, FileText, Check, Copy,
  Settings, RefreshCw, X, Save, Bookmark, Plus, Edit2, Trash2,
  Tag, AlertCircle, Eye, MapPin, Layers, List, Grid, LayoutGrid
} from 'lucide-react';
import { 
  GoogleAgendaEvent, 
  GOOGLE_AGENDA_EVENTS, 
  getEventsByDay, 
  getLiveEventNow,
  getUserRSVP,
  generateGoogleCalendarUrl,
  downloadIcsFile,
  downloadFullSemesterIcsFile,
  getCustomCalendarUrl,
  saveCustomCalendarUrl
} from '@/services/googleAgendaService';
import { 
  CalendarUniversalEvent, 
  getAllCalendarUniversalEvents, 
  addCustomStudentEvent, 
  updateCustomStudentEvent, 
  deleteCustomStudentEvent,
  EventCategory 
} from '@/services/agendaEventsService';
import { GoogleAgendaEventModal } from '@/components/GoogleAgendaEventModal';
import { VideoPlayerModal } from '@/components/VideoPlayerModal';
import { getLocalTimeZoneInfo } from '@/lib/timeUtils';
import { getGravacoesForDisciplina } from '@/services/gravacoesService';
import { getSafeStreamUrl } from '@/lib/videoUtils';

interface GoogleAgendaViewProps {
  userEmail?: string;
  onTabChange?: (tab: string) => void;
  compact?: boolean;
  currentRole?: 'aluno' | 'professor' | 'monitor' | 'admin';
}

type CalendarViewMode = 'mes' | 'semana' | 'programacao' | 'grade_fixa';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAY_FULL_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export const GoogleAgendaView: React.FC<GoogleAgendaViewProps> = ({
  userEmail,
  onTabChange,
  compact = false,
  currentRole = 'aluno',
}) => {
  const normalizedEmail = (userEmail || 'sacrasub@gmail.com').toLowerCase().trim();
  const tzInfo = useMemo(() => getLocalTimeZoneInfo(), []);

  // Data de Navegação do Calendário (Padrão: Agosto de 2026 ou data atual)
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Se estivermos em 2026, usa hoje, senão inicializa em Agosto/2026 (Semestre 2026.2)
    const now = new Date();
    if (now.getFullYear() === 2026) return now;
    return new Date(2026, 7, 25); // 25 de Agosto de 2026
  });

  const [viewMode, setViewMode] = useState<CalendarViewMode>('semana');
  const [selectedUniversalEvent, setSelectedUniversalEvent] = useState<CalendarUniversalEvent | null>(null);
  const [selectedAgendaEvent, setSelectedAgendaEvent] = useState<GoogleAgendaEvent | null>(null);
  const [liveInfo, setLiveInfo] = useState(() => getLiveEventNow());
  const [activeDayFilter, setActiveDayFilter] = useState<string>('todos');
  const [copiedMeetId, setCopiedMeetId] = useState<string | null>(null);

  // Filtros de Categoria de Eventos
  const [visibleCategories, setVisibleCategories] = useState<Record<EventCategory, boolean>>({
    aula: true,
    entregavel: true,
    aviso: true,
    evento_pessoal: true,
    dia_especial: true,
  });

  // Modal de Criação / Edição de Evento pelo Aluno
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDate, setFormDate] = useState<string>('2026-08-25');
  const [formStartTime, setFormStartTime] = useState<string>('18:00');
  const [formEndTime, setFormEndTime] = useState<string>('19:00');
  const [formIsAllDay, setFormIsAllDay] = useState<boolean>(false);
  const [formColor, setFormColor] = useState<string>('#3b82f6');
  const [formDesc, setFormDesc] = useState<string>('');
  const [formLocation, setFormLocation] = useState<string>('Google Meet / LMS');

  // Player de Vídeo Seguro
  const [activeVideoModal, setActiveVideoModal] = useState<{
    isOpen: boolean;
    title: string;
    videoUrl: string;
    disciplinaName?: string;
    aulaNum?: number;
  } | null>(null);

  // Agenda Pessoal do Aluno
  const [customCalendarUrl, setCustomCalendarUrl] = useState<string>(() => getCustomCalendarUrl(normalizedEmail));
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [tempCalendarUrl, setTempCalendarUrl] = useState<string>('');
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Lista agregada de eventos atualizada
  const [allEvents, setAllEvents] = useState<CalendarUniversalEvent[]>(() => 
    getAllCalendarUniversalEvents(normalizedEmail)
  );

  useEffect(() => {
    const refresh = () => {
      setAllEvents(getAllCalendarUniversalEvents(normalizedEmail));
    };
    refresh();
    window.addEventListener('lms_calendar_events_updated', refresh);
    window.addEventListener('lms_plano_estudos_updated', refresh);
    return () => {
      window.removeEventListener('lms_calendar_events_updated', refresh);
      window.removeEventListener('lms_plano_estudos_updated', refresh);
    };
  }, [normalizedEmail]);

  // Atualiza status ao vivo a cada 60s
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveInfo(getLiveEventNow());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyMeet = (e: React.MouseEvent, event: GoogleAgendaEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(event.googleMeetUrl);
    setCopiedMeetId(event.id);
    setSyncStatusMsg('Link do Google Meet copiado!');
    setTimeout(() => {
      setCopiedMeetId(null);
      setSyncStatusMsg(null);
    }, 2500);
  };

  const handleSaveCalendarSettings = () => {
    saveCustomCalendarUrl(tempCalendarUrl, normalizedEmail);
    setCustomCalendarUrl(tempCalendarUrl.trim());
    setIsSettingsModalOpen(false);
    setSyncStatusMsg('Agenda pessoal sincronizada com sucesso!');
    setTimeout(() => setSyncStatusMsg(null), 3000);
  };

  const handleDownloadFullSchedule = () => {
    downloadFullSemesterIcsFile();
    setSyncStatusMsg('Arquivo .ICS da Grade 2026.2 baixado! Abra no Google Calendar.');
    setTimeout(() => setSyncStatusMsg(null), 4000);
  };

  // Navegação no Calendário (Mês ou Semana)
  const handlePrev = () => {
    if (viewMode === 'semana') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'semana') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    if (now.getFullYear() === 2026) {
      setCurrentDate(now);
    } else {
      setCurrentDate(new Date(2026, 7, 25)); // 25 de Agosto de 2026
    }
  };

  // Mapeamento dos 7 Dias da Semana Selecionada
  const weekDaysGrid = useMemo(() => {
    const sunday = new Date(currentDate);
    sunday.setDate(currentDate.getDate() - currentDate.getDay());

    const days: { date: Date; dateStr: string; dayNum: number; dayName: string; dayFullName: string; isToday: boolean }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);

      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${d.getFullYear()}-${mStr}-${dStr}`;

      const now = new Date();
      const isToday = now.getFullYear() === d.getFullYear() && now.getMonth() === d.getMonth() && now.getDate() === d.getDate();

      days.push({
        date: d,
        dateStr,
        dayNum: d.getDate(),
        dayName: WEEKDAY_NAMES[i],
        dayFullName: WEEKDAY_FULL_NAMES[i],
        isToday,
      });
    }

    return days;
  }, [currentDate]);

  // Título Dinâmico do Cabeçalho (Mês ou Intervalo da Semana)
  const headerDateTitle = useMemo(() => {
    if (viewMode === 'semana') {
      const first = weekDaysGrid[0];
      const last = weekDaysGrid[6];
      if (first && last) {
        if (first.date.getMonth() === last.date.getMonth()) {
          return `${first.dayNum} a ${last.dayNum} de ${MONTH_NAMES[first.date.getMonth()]} de ${first.date.getFullYear()}`;
        }
        return `${first.dayNum} de ${MONTH_NAMES[first.date.getMonth()]} – ${last.dayNum} de ${MONTH_NAMES[last.date.getMonth()]} de ${last.date.getFullYear()}`;
      }
    }
    return `${MONTH_NAMES[currentDate.getMonth()]} de ${currentDate.getFullYear()}`;
  }, [currentDate, viewMode, weekDaysGrid]);

  // Abre criação de evento em data específica
  const handleOpenCreateForDate = (dateStr: string) => {
    setEditingEventId(null);
    setFormTitle('');
    setFormDate(dateStr);
    setFormStartTime('18:00');
    setFormEndTime('19:00');
    setFormIsAllDay(false);
    setFormColor('#3b82f6');
    setFormDesc('');
    setFormLocation('Google Meet / LMS');
    setIsCreateModalOpen(true);
  };

  // Salva evento criado/editado pelo aluno
  const handleSaveStudentEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingEventId) {
      updateCustomStudentEvent({
        id: editingEventId,
        title: formTitle.trim(),
        dateStr: formDate,
        startTime: formIsAllDay ? undefined : formStartTime,
        endTime: formIsAllDay ? undefined : formEndTime,
        isAllDay: formIsAllDay,
        colorTag: formColor,
        description: formDesc.trim(),
        location: formLocation.trim() || undefined,
        category: 'evento_pessoal',
        isCustomStudentEvent: true,
        userEmail: normalizedEmail,
      }, normalizedEmail);
      setSyncStatusMsg('Evento atualizado na sua Google Agenda!');
    } else {
      addCustomStudentEvent({
        title: formTitle.trim(),
        dateStr: formDate,
        startTime: formIsAllDay ? undefined : formStartTime,
        endTime: formIsAllDay ? undefined : formEndTime,
        isAllDay: formIsAllDay,
        colorTag: formColor,
        description: formDesc.trim(),
        location: formLocation.trim() || undefined,
      }, normalizedEmail);
      setSyncStatusMsg('Novo evento adicionado à sua Google Agenda!');
    }

    setIsCreateModalOpen(false);
    setSelectedUniversalEvent(null);
    setTimeout(() => setSyncStatusMsg(null), 3000);
  };

  // Deleta evento pessoal do aluno
  const handleDeleteStudentEvent = (eventId: string) => {
    if (confirm('Deseja realmente remover este evento da sua agenda?')) {
      deleteCustomStudentEvent(eventId, normalizedEmail);
      setSelectedUniversalEvent(null);
      setSyncStatusMsg('Evento removido com sucesso!');
      setTimeout(() => setSyncStatusMsg(null), 3000);
    }
  };

  // Mapeamento dos Dias do Mês Selecionado
  const monthDaysGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 a 6
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const grid: { date: Date; dateStr: string; isCurrentMonth: boolean; dayNum: number }[] = [];

    // Dias do mês anterior para completar a primeira semana
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      grid.push({
        date: d,
        dateStr: `${d.getFullYear()}-${mStr}-${dStr}`,
        isCurrentMonth: false,
        dayNum: daysInPrevMonth - i,
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const d = new Date(year, month, day);
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      grid.push({
        date: d,
        dateStr: `${year}-${mStr}-${dStr}`,
        isCurrentMonth: true,
        dayNum: day,
      });
    }

    // Dias do próximo mês para completar 35 ou 42 células
    const remaining = (7 - (grid.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(year, month + 1, day);
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      grid.push({
        date: d,
        dateStr: `${d.getFullYear()}-${mStr}-${dStr}`,
        isCurrentMonth: false,
        dayNum: day,
      });
    }

    return grid;
  }, [currentDate]);

  // Filtra eventos por visibilidade de categoria
  const filteredEventsList = useMemo(() => {
    return allEvents.filter((ev) => visibleCategories[ev.category]);
  }, [allEvents, visibleCategories]);

  // Indexação de eventos por dateStr para busca rápida
  const eventsByDateMap = useMemo(() => {
    const map: Record<string, CalendarUniversalEvent[]> = {};
    for (const ev of filteredEventsList) {
      if (!map[ev.dateStr]) map[ev.dateStr] = [];
      map[ev.dateStr].push(ev);
    }
    return map;
  }, [filteredEventsList]);

  // Eventos para o modo de Programação (ordenados cronologicamente)
  const scheduledEvents = useMemo(() => {
    return [...filteredEventsList].sort((a, b) => {
      if (a.dateStr !== b.dateStr) return a.dateStr.localeCompare(b.dateStr);
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
  }, [filteredEventsList]);

  const eventsByDayGrade = useMemo(() => getEventsByDay(), []);

  const dayColumns = [
    {
      day: 'Terça-feira',
      badge: '2 Aulas',
      bgClass: 'bg-blue-50/50',
      borderClass: 'border-blue-200/80',
      headerText: 'text-blue-900',
      badgeBg: 'bg-blue-200/60 text-blue-800',
      cardBorder: 'border-blue-100 hover:border-blue-300',
      timeTagBg: 'bg-blue-100 text-blue-700',
      events: eventsByDayGrade['Terça-feira'] || []
    },
    {
      day: 'Quarta-feira',
      badge: '2 Aulas',
      bgClass: 'bg-emerald-50/50',
      borderClass: 'border-emerald-200/80',
      headerText: 'text-emerald-900',
      badgeBg: 'bg-emerald-200/60 text-emerald-800',
      cardBorder: 'border-emerald-100 hover:border-emerald-300',
      timeTagBg: 'bg-emerald-100 text-emerald-700',
      events: eventsByDayGrade['Quarta-feira'] || []
    },
    {
      day: 'Quinta-feira',
      badge: '2 Aulas',
      bgClass: 'bg-purple-50/50',
      borderClass: 'border-purple-200/80',
      headerText: 'text-purple-900',
      badgeBg: 'bg-purple-200/60 text-purple-800',
      cardBorder: 'border-purple-100 hover:border-purple-300',
      timeTagBg: 'bg-purple-100 text-purple-700',
      events: eventsByDayGrade['Quinta-feira'] || []
    },
    {
      day: 'Sexta-feira',
      badge: '3 Aulas',
      bgClass: 'bg-amber-50/50',
      borderClass: 'border-amber-200/80',
      headerText: 'text-amber-900',
      badgeBg: 'bg-amber-200/60 text-amber-800',
      cardBorder: 'border-amber-100 hover:border-amber-300',
      timeTagBg: 'bg-amber-100 text-amber-800',
      events: eventsByDayGrade['Sexta-feira'] || []
    },
  ];

  const filteredColumns = activeDayFilter === 'todos'
    ? dayColumns
    : dayColumns.filter(c => c.day === activeDayFilter);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR NO ESTILO OFICIAL DO GOOGLE CALENDAR                    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/90 shadow-sm space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* LADO ESQUERDO: Ícone Google Calendar + Botão Criar + Navegação Mês */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            
            {/* Ícone Oficial do Google Calendar */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col items-center justify-center overflow-hidden">
                <div className="w-full bg-blue-600 text-white text-[9px] font-black text-center py-0.5 uppercase tracking-tighter">
                  {WEEKDAY_NAMES[currentDate.getDay()]}
                </div>
                <div className="text-sm font-black text-slate-800 leading-none py-1">
                  {currentDate.getDate()}
                </div>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight flex items-center gap-1.5">
                  <span>Google Agenda</span>
                  <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    2026.2
                  </span>
                </h1>
                <p className="text-[11px] text-gray-500 font-medium">
                  {tzInfo.timeZone} ({tzInfo.gmtOffset})
                </p>
              </div>
            </div>

            {/* BOTÃO + CRIAR EVENTO (GOOGLE CALENDAR FAB) */}
            <button
              onClick={() => handleOpenCreateForDate(new Date().toISOString().split('T')[0])}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-gray-50 text-slate-800 font-bold text-xs border border-gray-300/80 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer group"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 via-red-500 to-amber-400 flex items-center justify-center text-white text-xs font-black shadow-2xs">
                +
              </div>
              <span>Criar Evento</span>
            </button>

            {/* BOTÃO HOJE & SETAS DE NAVEGAÇÃO */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleGoToday}
                className="px-3 py-1.5 rounded-xl border border-gray-300 text-slate-700 hover:bg-gray-100 font-bold text-xs transition cursor-pointer"
              >
                Hoje
              </button>
              <button
                onClick={handlePrev}
                title="Período anterior"
                className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                title="Próximo período"
                className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* TÍTULO DO MÊS OU INTERVALO DA SEMANA */}
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              {headerDateTitle}
            </h2>
          </div>

          {/* LADO DIREITO: SELETOR DE MODO DE VISUALIZAÇÃO & EXPORTAÇÕES */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Seletor de Modo (Mês / Semana / Programação / Grade Fixa) */}
            <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200 text-xs font-bold">
              <button
                onClick={() => setViewMode('mes')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  viewMode === 'mes' ? 'bg-white text-blue-700 shadow-xs font-black' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Mês</span>
              </button>
              <button
                onClick={() => setViewMode('semana')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  viewMode === 'semana' ? 'bg-white text-blue-700 shadow-xs font-black' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Semana</span>
              </button>
              <button
                onClick={() => setViewMode('programacao')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  viewMode === 'programacao' ? 'bg-white text-blue-700 shadow-xs font-black' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Programação</span>
              </button>
              <button
                onClick={() => setViewMode('grade_fixa')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  viewMode === 'grade_fixa' ? 'bg-white text-blue-700 shadow-xs font-black' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grade 2026.2</span>
              </button>
            </div>

            {/* Exportar .ICS */}
            <button
              onClick={handleDownloadFullSchedule}
              title="Baixar arquivo unificado .ICS de todas as aulas para sincronizar no Google Agenda / Apple Calendar"
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar .ICS</span>
            </button>

            {/* Abrir Google Agenda Pessoal */}
            <a
              href={customCalendarUrl || 'https://calendar.google.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Google Agenda</span>
            </a>

            {/* Configurar Agenda Pessoal */}
            <button
              onClick={() => {
                setTempCalendarUrl(customCalendarUrl);
                setIsSettingsModalOpen(true);
              }}
              title="Configurar URL pessoal da sua agenda do Google"
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FEEDBACK DE STATUS / SINCRONIZAÇÃO */}
        {syncStatusMsg && (
          <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        {/* FILTROS RÁPIDOS DE CATEGORIAS (Aulas, Entregáveis, Lembretes, Feriados) */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100 text-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3 text-gray-400" />
            <span>Exibir:</span>
          </span>

          {[
            { cat: 'aula' as EventCategory, label: 'Aulas 2026.2', color: 'bg-blue-600 text-white' },
            { cat: 'entregavel' as EventCategory, label: 'Prazos & Entregáveis', color: 'bg-amber-500 text-white' },
            { cat: 'evento_pessoal' as EventCategory, label: 'Meus Eventos & Lembretes', color: 'bg-purple-600 text-white' },
            { cat: 'dia_especial' as EventCategory, label: 'Dias Letivos / Feriados', color: 'bg-orange-500 text-white' },
          ].map(({ cat, label, color }) => (
            <button
              key={cat}
              onClick={() => setVisibleCategories((prev) => ({ ...prev, [cat]: !prev[cat] }))}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1.5 cursor-pointer ${
                visibleCategories[cat]
                  ? `${color} shadow-2xs`
                  : 'bg-gray-100 text-gray-400 line-through opacity-70'
              }`}
            >
              <span>{visibleCategories[cat] ? '✓' : '✕'}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. VISÃO 1: MÊS (GRADE MENSAL COMPLETA DO GOOGLE CALENDAR)                */}
      {/* ========================================================================= */}
      {viewMode === 'mes' && (
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden">
          
          {/* Cabeçalho dos 7 Dias da Semana */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-slate-50 text-center py-2.5 text-xs font-black text-slate-700 uppercase tracking-wider">
            {WEEKDAY_NAMES.map((w, idx) => (
              <div key={w} className={idx === 0 || idx === 6 ? 'text-gray-400' : ''}>
                {w}
              </div>
            ))}
          </div>

          {/* Grade de Células dos Dias */}
          <div className="grid grid-cols-7 divide-x divide-y divide-gray-200">
            {monthDaysGrid.map(({ date, dateStr, isCurrentMonth, dayNum }, idx) => {
              const dayEvents = eventsByDateMap[dateStr] || [];
              const isToday = (() => {
                const now = new Date();
                return (
                  now.getFullYear() === date.getFullYear() &&
                  now.getMonth() === date.getMonth() &&
                  now.getDate() === date.getDate()
                );
              })();

              return (
                <div
                  key={`${dateStr}-${idx}`}
                  onClick={() => handleOpenCreateForDate(dateStr)}
                  className={`min-h-[105px] sm:min-h-[120px] p-1.5 sm:p-2 transition-colors flex flex-col justify-between group cursor-pointer ${
                    isCurrentMonth ? 'bg-white hover:bg-blue-50/30' : 'bg-slate-50/60 text-gray-400'
                  } ${isToday ? 'ring-2 ring-blue-500/30 bg-blue-50/20' : ''}`}
                >
                  {/* Número do Dia + Botão + Adicionar */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-gray-400'
                      }`}
                    >
                      {dayNum}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCreateForDate(dateStr);
                      }}
                      title="Adicionar evento neste dia"
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 text-xs font-black p-0.5 transition"
                    >
                      +
                    </button>
                  </div>

                  {/* Lista de Pílulas de Eventos do Dia */}
                  <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUniversalEvent(ev);
                        }}
                        style={{ backgroundColor: ev.colorTag }}
                        className="text-[10px] text-white font-bold px-1.5 py-0.5 rounded-md truncate shadow-2xs hover:brightness-110 transition flex items-center justify-between gap-1"
                      >
                        <span className="truncate">{ev.title}</span>
                        {ev.startTime && <span className="opacity-90 text-[9px] shrink-0 font-mono">{ev.startTime}</span>}
                      </div>
                    ))}

                    {dayEvents.length > 3 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewMode('programacao');
                        }}
                        className="text-[9px] font-black text-blue-600 hover:underline cursor-pointer pt-0.5"
                      >
                        +{dayEvents.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2.5 VISÃO: SEMANA (7 COLUNAS DA SEMANA COM EVENTOS E ATALHOS)             */}
      {/* ========================================================================= */}
      {viewMode === 'semana' && (
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Grid className="w-5 h-5 text-blue-600" />
              <span>Visão Semanal • {headerDateTitle}</span>
            </h3>
            <span className="text-xs font-bold text-gray-500">
              7 dias • Domingo a Sábado
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            {weekDaysGrid.map((dayItem) => {
              const dayEvents = eventsByDateMap[dayItem.dateStr] || [];

              return (
                <div
                  key={dayItem.dateStr}
                  className={`rounded-2xl p-3 border transition-all flex flex-col justify-between min-h-[320px] ${
                    dayItem.isToday
                      ? 'bg-blue-50/40 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 ring-2 ring-blue-400/20'
                      : 'bg-slate-50/70 dark:bg-slate-900/80 border-gray-200/80 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Cabeçalho do Dia */}
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-slate-800">
                      <div>
                        <div className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase">
                          {dayItem.dayName}
                        </div>
                        <div className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              dayItem.isToday
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {dayItem.dayNum}
                          </span>
                          {dayItem.isToday && (
                            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase">Hoje</span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenCreateForDate(dayItem.dateStr)}
                        title={`Adicionar compromisso em ${dayItem.dayNum}/${dayItem.date.getMonth() + 1}`}
                        className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white border border-gray-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center transition shadow-2xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Lista de Eventos do Dia */}
                    <div className="space-y-2">
                      {dayEvents.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-[11px] font-semibold">
                          Sem aulas ou entregas
                        </div>
                      ) : (
                        dayEvents.map((ev) => (
                          <div
                            key={ev.id}
                            onClick={() => setSelectedUniversalEvent(ev)}
                            className="bg-white dark:bg-slate-800/90 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-2xs hover:border-blue-300 transition cursor-pointer space-y-1.5 group"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span
                                style={{ backgroundColor: ev.colorTag }}
                                className="text-[9px] text-white font-extrabold px-1.5 py-0.2 rounded font-mono"
                              >
                                {ev.startTime || 'Dia todo'}
                              </span>
                              <span className={`text-[8px] font-black uppercase px-1 rounded ${
                                ev.category === 'aula'
                                  ? 'bg-blue-100 text-blue-800'
                                  : ev.category === 'entregavel'
                                  ? 'bg-amber-100 text-amber-800'
                                  : ev.category === 'dia_especial'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {ev.category === 'evento_pessoal' ? 'Pessoal' : ev.category}
                              </span>
                            </div>

                            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug line-clamp-2">
                              {ev.title}
                            </div>

                            {ev.professorName && (
                              <div className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                                👨‍🏫 {ev.professorName}
                              </div>
                            )}

                            {/* Atalhos Rápidos */}
                            <div className="flex items-center gap-1 pt-1 border-t border-gray-100 dark:border-slate-700/60">
                              {ev.meetUrl && (
                                <a
                                  href={ev.meetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded text-[10px] font-bold flex items-center gap-1"
                                >
                                  <Video className="w-2.5 h-2.5" />
                                  <span>Meet</span>
                                </a>
                              )}
                              {ev.videoUrl && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveVideoModal({
                                      isOpen: true,
                                      title: ev.title,
                                      videoUrl: ev.videoUrl!,
                                      disciplinaName: ev.disciplinaCode,
                                    });
                                  }}
                                  className="px-2 py-0.5 bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-100 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                                >
                                  <span>REC</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenCreateForDate(dayItem.dateStr)}
                    className="w-full mt-2 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 hover:dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 text-[11px] font-bold rounded-lg border border-dashed border-gray-300 dark:border-slate-700 transition text-center cursor-pointer"
                  >
                    + Adicionar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VISÃO 3: PROGRAMAÇÃO (AGENDA LINEAR CRONOLÓGICA)                        */}
      {/* ========================================================================= */}
      {viewMode === 'programacao' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <List className="w-5 h-5 text-blue-600" />
              <span>Programação Completa • Aulas, Prazos & Eventos</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {scheduledEvents.length} eventos no total
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {scheduledEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedUniversalEvent(ev)}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div
                    style={{ backgroundColor: ev.colorTag }}
                    className="w-3 h-12 rounded-full shrink-0 mt-0.5"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-slate-900 group-hover:text-blue-900 transition">
                        {ev.title}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        ev.category === 'aula'
                          ? 'bg-blue-100 text-blue-900'
                          : ev.category === 'entregavel'
                          ? 'bg-amber-100 text-amber-900'
                          : ev.category === 'dia_especial'
                          ? 'bg-orange-100 text-orange-900'
                          : 'bg-purple-100 text-purple-900'
                      }`}>
                        {ev.category.replace('_', ' ')}
                      </span>
                    </div>
                    {ev.description && (
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {ev.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium">
                      <span>📅 {ev.dateStr}</span>
                      {ev.startTime && <span>⏰ {ev.startTime} – {ev.endTime || ''}</span>}
                      {ev.professorName && <span>👨‍🏫 {ev.professorName}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {ev.meetUrl && (
                    <a
                      href={ev.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Meet</span>
                    </a>
                  )}
                  {ev.videoUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveVideoModal({
                          isOpen: true,
                          title: ev.title,
                          videoUrl: ev.videoUrl!,
                          disciplinaName: ev.disciplinaCode,
                        });
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Gravação</span>
                    </button>
                  )}
                  {ev.isCustomStudentEvent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStudentEvent(ev.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      title="Excluir evento pessoal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VISÃO 3: GRADE FIXA SEMANAL 2026.2 (4 COLUNAS TERÇA A SEXTA)           */}
      {/* ========================================================================= */}
      {viewMode === 'grade_fixa' && (
        <div className="space-y-4">
          
          {/* Filtro por Dia */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'todos', label: 'Toda a Semana' },
              { id: 'Terça-feira', label: 'Terça' },
              { id: 'Quarta-feira', label: 'Quarta' },
              { id: 'Quinta-feira', label: 'Quinta' },
              { id: 'Sexta-feira', label: 'Sexta' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDayFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeDayFilter === tab.id
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid das 4 Colunas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredColumns.map((col) => (
              <div
                key={col.day}
                className={`${col.bgClass} rounded-2xl p-4 sm:p-5 border ${col.borderClass} space-y-4 flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                    <h3 className={`text-sm font-extrabold ${col.headerText} uppercase tracking-wider`}>
                      {col.day}
                    </h3>
                    <span className={`text-[10px] font-bold ${col.badgeBg} px-2.5 py-0.5 rounded-full`}>
                      {col.badge}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {col.events.map((event) => {
                      const rsvp = getUserRSVP(event.id);
                      return (
                        <div
                          key={event.id}
                          onClick={() => setSelectedAgendaEvent(event)}
                          className={`group bg-white p-3.5 rounded-2xl border ${col.cardBorder} shadow-sm space-y-2 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold ${col.timeTagBg} px-2 py-0.5 rounded-md`}>
                              {event.startTime} – {event.endTime}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {rsvp === 'yes' && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Presença confirmada" />
                              )}
                              <span className="text-[10px] text-gray-400 group-hover:text-blue-600 font-medium flex items-center gap-0.5">
                                <span>Ver</span>
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>

                          <div className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                            {event.title}
                          </div>

                          <div className="text-[11px] text-gray-500 font-medium flex items-center justify-between">
                            <span className="truncate max-w-[120px]">{event.professorName}</span>
                            
                            <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                              {(() => {
                                const gravacoes = getGravacoesForDisciplina(event.disciplinaId, event.title);
                                const latest = gravacoes.length > 0 ? gravacoes[gravacoes.length - 1] : null;

                                if (latest) {
                                  return (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveVideoModal({
                                          isOpen: true,
                                          title: latest.title,
                                          videoUrl: getSafeStreamUrl(latest.video_url),
                                          disciplinaName: event.title.split('-')[0].trim(),
                                          aulaNum: latest.aula_num,
                                        });
                                      }}
                                      title={`Assistir Aula Gravada (${latest.title})`}
                                      className="p-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-0.5 cursor-pointer"
                                    >
                                      <Video className="w-3.5 h-3.5 text-red-600" />
                                      <span className="text-[9px] font-extrabold pr-0.5">REC</span>
                                    </button>
                                  );
                                }
                                return null;
                              })()}

                              <a
                                href={event.googleMeetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                title="Entrar no Google Meet direto"
                                className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              >
                                <Video className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={(e) => handleCopyMeet(e, event)}
                                title="Copiar link do Meet"
                                className="p-1 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                              >
                                {copiedMeetId === event.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: CRIAR / EDITAR EVENTO PESSOAL DO ALUNO                          */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <span>{editingEventId ? 'Editar Compromisso' : 'Adicionar Evento na Google Agenda'}</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudentEvent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título do Evento</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Grupo de Estudo TCC, Revisão de Prova..."
                  className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Início</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    disabled={formIsAllDay}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-medium disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Término</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    disabled={formIsAllDay}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-medium disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allDayCheck"
                  checked={formIsAllDay}
                  onChange={(e) => setFormIsAllDay(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="allDayCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Evento o dia inteiro
                </label>
              </div>

              {/* Seletor de Cor Google Calendar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Cor do Evento</label>
                <div className="flex items-center gap-2">
                  {[
                    { hex: '#3b82f6', label: 'Azul' },
                    { hex: '#10b981', label: 'Verde' },
                    { hex: '#f59e0b', label: 'Âmbar' },
                    { hex: '#8b5cf6', label: 'Roxo' },
                    { hex: '#ef4444', label: 'Vermelho' },
                    { hex: '#06b6d4', label: 'Ciano' },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setFormColor(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        formColor === c.hex ? 'ring-3 ring-offset-2 ring-slate-800 scale-110' : 'hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Localização / Link</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Ex: Google Meet, Sala 02, Discord..."
                  className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição / Anotações</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Detalhes ou metas para este evento..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: DETALHES DO EVENTO UNIVERSAL CLICADO NO CALENDÁRIO               */}
      {/* ========================================================================= */}
      {selectedUniversalEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#202124] text-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-gray-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-gray-800 pb-3 gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  style={{ backgroundColor: selectedUniversalEvent.colorTag }}
                  className="w-4 h-4 rounded-md shrink-0"
                />
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white">
                    {selectedUniversalEvent.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {selectedUniversalEvent.dateStr} {selectedUniversalEvent.startTime ? `às ${selectedUniversalEvent.startTime}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUniversalEvent(null)}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {selectedUniversalEvent.description && (
              <p className="text-xs text-gray-300 leading-relaxed bg-gray-800/60 p-3 rounded-2xl border border-gray-700/60">
                {selectedUniversalEvent.description}
              </p>
            )}

            {/* Ações Específicas de Aula (Meet e Gravação) */}
            {selectedUniversalEvent.meetUrl && (
              <div className="space-y-2 pt-1">
                <a
                  href={selectedUniversalEvent.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#8ab4f8] text-[#202124] font-bold text-xs rounded-2xl shadow-md hover:bg-[#aecbfa] transition"
                >
                  <Video className="w-4 h-4" />
                  <span>Entrar com o Google Meet</span>
                </a>
              </div>
            )}

            {selectedUniversalEvent.videoUrl && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveVideoModal({
                      isOpen: true,
                      title: selectedUniversalEvent.title,
                      videoUrl: selectedUniversalEvent.videoUrl!,
                      disciplinaName: selectedUniversalEvent.disciplinaCode,
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs rounded-2xl shadow-md hover:brightness-110 transition cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>▶ Assistir Aula Gravada no LMS (HD)</span>
                </button>
              </div>
            )}

            {/* Ações para Eventos Criados pelo Aluno */}
            {selectedUniversalEvent.isCustomStudentEvent && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
                <button
                  onClick={() => handleDeleteStudentEvent(selectedUniversalEvent.id)}
                  className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/70 text-red-300 rounded-xl text-xs font-bold border border-red-800/60 transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
                <button
                  onClick={() => {
                    setEditingEventId(selectedUniversalEvent.id);
                    setFormTitle(selectedUniversalEvent.title);
                    setFormDate(selectedUniversalEvent.dateStr);
                    setFormStartTime(selectedUniversalEvent.startTime || '18:00');
                    setFormEndTime(selectedUniversalEvent.endTime || '19:00');
                    setFormIsAllDay(selectedUniversalEvent.isAllDay || false);
                    setFormColor(selectedUniversalEvent.colorTag);
                    setFormDesc(selectedUniversalEvent.description || '');
                    setFormLocation(selectedUniversalEvent.location || '');
                    setSelectedUniversalEvent(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL OFICIAL DO EVENTO GOOGLE AGENDA (GRADE FIXA) */}
      <GoogleAgendaEventModal
        isOpen={selectedAgendaEvent !== null}
        onClose={() => setSelectedAgendaEvent(null)}
        event={selectedAgendaEvent}
        currentRole={currentRole}
        onOpenCornell={(disciplinaId) => {
          if (onTabChange) onTabChange('aluno-caderno');
        }}
        onOpenDrive={(driveUrl) => {
          window.open(driveUrl, '_blank');
        }}
      />

      {/* MODAL DE CONFIGURAÇÃO DA AGENDA PESSOAL INDIVIDUAL */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <span>Configurar Google Agenda Pessoal</span>
              </h3>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Vincule a URL direta da sua Google Agenda individual para acesso rápido no botão do topo.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Link da sua Agenda Google:</label>
              <input
                type="url"
                value={tempCalendarUrl}
                onChange={(e) => setTempCalendarUrl(e.target.value)}
                placeholder="https://calendar.google.com/calendar/u/0/r"
                className="w-full p-3 bg-slate-50 border border-gray-300 rounded-2xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCalendarSettings}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Configuração</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PLAYER DE VÍDEO SEGURO NATIVO DO LMS */}
      {activeVideoModal && (
        <VideoPlayerModal
          isOpen={activeVideoModal.isOpen}
          onClose={() => setActiveVideoModal(null)}
          title={activeVideoModal.title}
          videoUrl={activeVideoModal.videoUrl}
          disciplinaName={activeVideoModal.disciplinaName}
          aulaNum={activeVideoModal.aulaNum}
        />
      )}

    </div>
  );
};
