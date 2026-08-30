'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Clock, Video, ExternalLink, Download, 
  Sparkles, CheckCircle2, ChevronRight, Share2, 
  Filter, Users, Phone, FolderOpen, FileText, Check, Copy,
  Settings, RefreshCw, X, Save, Bookmark
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
import { GoogleAgendaEventModal } from '@/components/GoogleAgendaEventModal';
import { getLocalTimeZoneInfo } from '@/lib/timeUtils';

interface GoogleAgendaViewProps {
  userEmail?: string;
  onTabChange?: (tab: string) => void;
  compact?: boolean;
}

export const GoogleAgendaView: React.FC<GoogleAgendaViewProps> = ({
  userEmail,
  onTabChange,
  compact = false
}) => {
  const normalizedEmail = (userEmail || 'sacrasub@gmail.com').toLowerCase().trim();
  const tzInfo = useMemo(() => getLocalTimeZoneInfo(), []);
  const [selectedEvent, setSelectedEvent] = useState<GoogleAgendaEvent | null>(null);
  const [liveInfo, setLiveInfo] = useState(() => getLiveEventNow());
  const [activeDayFilter, setActiveDayFilter] = useState<string>('todos');
  const [copiedMeetId, setCopiedMeetId] = useState<string | null>(null);

  // Agenda Pessoal do Aluno
  const [customCalendarUrl, setCustomCalendarUrl] = useState<string>(() => getCustomCalendarUrl(normalizedEmail));
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [tempCalendarUrl, setTempCalendarUrl] = useState<string>('');
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Atualiza status ao vivo a cada 60s
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveInfo(getLiveEventNow());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveCalendarSettings = () => {
    saveCustomCalendarUrl(tempCalendarUrl, normalizedEmail);
    setCustomCalendarUrl(tempCalendarUrl.trim());
    setIsSettingsModalOpen(false);
    setSyncStatusMsg('Agenda pessoal salva com sucesso!');
    setTimeout(() => setSyncStatusMsg(null), 3000);
  };

  const handleDownloadFullSchedule = () => {
    downloadFullSemesterIcsFile();
    setSyncStatusMsg('Arquivo .ICS da Grade 2026.2 baixado! Abra no Google Calendar / Apple Calendar.');
    setTimeout(() => setSyncStatusMsg(null), 4000);
  };

  const eventsByDay = useMemo(() => getEventsByDay(), []);

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
      events: eventsByDay['Terça-feira'] || []
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
      events: eventsByDay['Quarta-feira'] || []
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
      events: eventsByDay['Quinta-feira'] || []
    },
    {
      day: 'Sexta-feira',
      badge: '3 Aulas',
      bgClass: 'bg-amber-50/50',
      borderClass: 'border-amber-200/80',
      headerText: 'text-amber-900',
      badgeBg: 'bg-amber-200/60 text-amber-800',
      cardBorder: 'border-amber-100 hover:border-amber-300',
      timeTagBg: 'bg-amber-100 text-amber-700',
      events: eventsByDay['Sexta-feira'] || []
    }
  ];

  const handleCardClick = (event: GoogleAgendaEvent) => {
    setSelectedEvent(event);
  };

  const handleCopyMeet = (e: React.MouseEvent, event: GoogleAgendaEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(event.googleMeetUrl);
    setCopiedMeetId(event.id);
    setTimeout(() => setCopiedMeetId(null), 2000);
  };

  const filteredColumns = activeDayFilter === 'todos' 
    ? dayColumns 
    : dayColumns.filter((c) => c.day === activeDayFilter);

  const activeCalendarTargetUrl = customCalendarUrl || 'https://calendar.google.com/';

  return (
    <div className="space-y-6">
      {/* CARD PRINCIPAL DA AGENDA */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-200/80 shadow-sm space-y-6">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                <Calendar className="w-5 h-5" />
              </span>
              <span>Google Agenda Semanal • Grade 2026.2</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Horários, links do Google Meet e materiais organizados de Terça a Sexta-feira com o fuso {tzInfo.gmtOffset}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Download da Grade Completa .ICS */}
            <button
              onClick={handleDownloadFullSchedule}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs transition-all border border-blue-200 shadow-xs cursor-pointer"
              title="Baixar arquivo .ICS com todas as 9 disciplinas para importar no seu Google Agenda com 1 clique"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sincronizar Todas (.ICS)</span>
            </button>

            {/* Configurar Agenda Pessoal */}
            <button
              onClick={() => {
                setTempCalendarUrl(customCalendarUrl);
                setIsSettingsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-all border border-gray-200 cursor-pointer"
              title="Personalizar o link da sua agenda própria do Google"
            >
              <Settings className="w-3.5 h-3.5 text-gray-600" />
              <span>{customCalendarUrl ? 'Agenda Configurada' : 'Minha Agenda'}</span>
            </button>

            {/* Abrir Google Agenda Externa */}
            <a
              href={activeCalendarTargetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{customCalendarUrl ? 'Abrir Minha Agenda' : 'Abrir Google Agenda'}</span>
            </a>
          </div>
        </div>

        {/* Notificação de Sucesso */}
        {syncStatusMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        {/* BANNER DE AULA AO VIVO / PRÓXIMA AULA */}
        {liveInfo.isLive && liveInfo.currentEvent && (
          <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-pulse">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <span className="w-3.5 h-3.5 rounded-full bg-white animate-ping shrink-0" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
                  AO VIVO AGORA
                </span>
                <h3 className="text-base sm:text-lg font-bold mt-1">
                  {liveInfo.currentEvent.title}
                </h3>
                <p className="text-xs text-rose-100">
                  {liveInfo.currentEvent.dayOfWeek} • {liveInfo.currentEvent.startTime} às {liveInfo.currentEvent.endTime}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={liveInfo.currentEvent.googleMeetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-rose-700 font-black text-xs hover:bg-rose-50 transition-all shadow-md"
              >
                <Video className="w-4 h-4" />
                <span>Entrar no Google Meet</span>
              </a>
              <button
                onClick={() => setSelectedEvent(liveInfo.currentEvent)}
                className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-all"
              >
                Ver Detalhes
              </button>
            </div>
          </div>
        )}

        {/* FILTRO RÁPIDO DE DIAS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <span className="text-xs text-gray-400 font-bold mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar:</span>
          </span>
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

        {/* GRID DAS 4 COLUNAS DE DIAS (OU COLUNA SELECIONADA) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredColumns.map((col) => (
            <div
              key={col.day}
              className={`${col.bgClass} rounded-2xl p-4 sm:p-5 border ${col.borderClass} space-y-4 flex flex-col justify-between`}
            >
              <div className="space-y-3">
                {/* CABEÇALHO DO DIA */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                  <h3 className={`text-sm font-extrabold ${col.headerText} uppercase tracking-wider`}>
                    {col.day}
                  </h3>
                  <span className={`text-[10px] font-bold ${col.badgeBg} px-2.5 py-0.5 rounded-full`}>
                    {col.badge}
                  </span>
                </div>

                {/* LISTA DE AULAS DO DIA */}
                <div className="space-y-3">
                  {col.events.map((event) => {
                    const rsvp = getUserRSVP(event.id);
                    return (
                      <div
                        key={event.id}
                        onClick={() => handleCardClick(event)}
                        className={`group bg-white p-3.5 rounded-2xl border ${col.cardBorder} shadow-sm space-y-2 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5`}
                      >
                        {/* TAG DE HORÁRIO + STATUS */}
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold ${col.timeTagBg} px-2 py-0.5 rounded-md`}>
                            {event.startTime} – {event.endTime}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {rsvp === 'yes' && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Presença confirmada" />
                            )}
                            <span 
                              className="text-[10px] text-gray-400 group-hover:text-blue-600 font-medium flex items-center gap-0.5"
                              title="Clique para ver o card do Google Agenda"
                            >
                              <span>Ver</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>

                        {/* TÍTULO DA DISCIPLINA */}
                        <div className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                          {event.title}
                        </div>

                        {/* DOCENTE */}
                        <div className="text-[11px] text-gray-500 font-medium flex items-center justify-between">
                          <span>{event.professorName}</span>
                          
                          {/* BOTÃO RÁPIDO DE GOOGLE MEET */}
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
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

              {/* DICA DE CLIQUE */}
              <div className="pt-2 text-[10px] text-gray-400 text-center font-medium">
                Clique na aula para abrir o card do Google Agenda
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* MODAL OFICIAL DO EVENTO GOOGLE AGENDA */}
      <GoogleAgendaEventModal
        isOpen={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        onOpenCornell={(disciplinaId) => {
          if (onTabChange) onTabChange('aluno-caderno');
        }}
        onOpenDrive={(driveUrl) => {
          window.open(driveUrl, '_blank');
        }}
      />

      {/* MODAL DE CONFIGURAÇÃO DA AGENDA PESSOAL INDIVIDUAL */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Settings className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    Configurar Minha Google Agenda
                  </h3>
                  <p className="text-xs text-gray-500">
                    Vincule seu calendário pessoal do Google
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                Você pode colar a URL direta da sua <strong>Google Agenda pessoal</strong> ou de um calendário secundário da turma. O botão <em>"Abrir Minha Agenda"</em> abrirá seu link configurado automaticamente.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  URL da Sua Agenda Pessoal do Google:
                </label>
                <input
                  type="url"
                  placeholder="https://calendar.google.com/calendar/u/0/r..."
                  value={tempCalendarUrl}
                  onChange={(e) => setTempCalendarUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Deixe em branco para usar a página inicial padrão do Google Calendar.
                </span>
              </div>

              {/* Bloco de Sincronização em Lote */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-950">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Sincronização Rápida de Todas as 9 Disciplinas</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Baixe o arquivo <strong>.ICS da Grade Completa</strong> para adicionar todas as aulas semanais (Terça a Sexta) de uma só vez no Google Agenda do seu celular ou computador.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadFullSchedule();
                    setIsSettingsModalOpen(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Arquivo .ICS da Grade 2026.2</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setTempCalendarUrl('');
                  saveCustomCalendarUrl('', normalizedEmail);
                  setCustomCalendarUrl('');
                  setIsSettingsModalOpen(false);
                  setSyncStatusMsg('Agenda restaurada para o padrão oficial.');
                  setTimeout(() => setSyncStatusMsg(null), 3000);
                }}
                className="text-xs font-bold text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Restaurar Padrão
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSaveCalendarSettings}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm cursor-pointer"
                >
                  Salvar Configuração
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
