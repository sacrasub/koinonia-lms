'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Video, Copy, Check, Phone, Users, FolderOpen, 
  FileText, Calendar, MoreVertical, Edit2, Trash2, 
  ExternalLink, Mail, ChevronDown, ChevronUp, Download,
  CheckCircle2, HelpCircle, XCircle, Share2, Sparkles,
  BookOpen, Clock
} from 'lucide-react';
import { 
  GoogleAgendaEvent, 
  RSVPStatus, 
  getUserRSVP, 
  saveUserRSVP, 
  generateGoogleCalendarUrl, 
  downloadIcsFile 
} from '@/services/googleAgendaService';

interface GoogleAgendaEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: GoogleAgendaEvent | null;
  onOpenCornell?: (disciplinaId: string) => void;
  onOpenDrive?: (driveUrl: string) => void;
}

export const GoogleAgendaEventModal: React.FC<GoogleAgendaEventModalProps> = ({
  isOpen,
  onClose,
  event,
  onOpenCornell,
  onOpenDrive
}) => {
  const [copiedMeet, setCopiedMeet] = useState<boolean>(false);
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [showGuestsList, setShowGuestsList] = useState<boolean>(false);
  const [showMorePhones, setShowMorePhones] = useState<boolean>(false);
  const [rsvp, setRsvp] = useState<RSVPStatus>('yes');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setRsvp(getUserRSVP(event.id));
      setShowMoreMenu(false);
      setShowGuestsList(false);
      setShowMorePhones(false);
      setFeedbackMessage(null);
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleCopyMeet = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(event.googleMeetUrl);
    setCopiedMeet(true);
    setTimeout(() => setCopiedMeet(false), 2000);
  };

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${event.phoneBridge} PIN: ${event.phonePin}`);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleRsvp = (status: RSVPStatus) => {
    setRsvp(status);
    saveUserRSVP(event.id, status);
    
    if (status === 'yes') {
      setFeedbackMessage('✅ Presença confirmada! Notificação ativada.');
    } else if (status === 'maybe') {
      setFeedbackMessage('⚠️ Resposta salva como "Talvez". Você receberá lembretes.');
    } else if (status === 'no') {
      setFeedbackMessage('ℹ️ Resposta salva como "Não". Lembre-se de assistir à gravação.');
    }
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      {/* CARD DO EVENTO NO ESTILO GOOGLE CALENDAR (DARK THEME NATIVO) */}
      <div 
        className="relative w-full max-w-lg bg-[#202124] text-[#e8eaed] rounded-3xl shadow-2xl border border-gray-700/80 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO COM AÇÕES */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: event.colorTag }} />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {event.code} • Google Agenda
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-400">
            {/* Adicionar à Agenda Real */}
            <a
              href={generateGoogleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              title="Adicionar à minha conta do Google Agenda"
              className="p-2 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
            >
              <Calendar className="w-4 h-4" />
            </a>

            {/* Menu de Mais Opções */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                title="Mais opções"
                className="p-2 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 top-10 w-60 bg-[#2d2e30] border border-gray-700 rounded-2xl shadow-xl py-2 z-50 text-xs">
                  <a
                    href={generateGoogleCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-700/70 text-gray-200"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-400" />
                    <span>Adicionar ao Google Agenda</span>
                  </a>
                  <button
                    onClick={() => {
                      downloadIcsFile(event);
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-700/70 text-gray-200"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                    <span>Baixar arquivo de calendário (.ics)</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Aula: ${event.title}\nHorário: ${event.dayOfWeek}, ${event.startTime} - ${event.endTime}\nGoogle Meet: ${event.googleMeetUrl}\nTelefone: ${event.phoneBridge} PIN: ${event.phonePin}`
                      );
                      setShowMoreMenu(false);
                      setFeedbackMessage('📋 Detalhes da aula copiados!');
                      setTimeout(() => setFeedbackMessage(null), 3000);
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-700/70 text-gray-200"
                  >
                    <Share2 className="w-4 h-4 text-purple-400" />
                    <span>Copiar resumo para WhatsApp</span>
                  </button>
                </div>
              )}
            </div>

            {/* Fechar */}
            <button
              onClick={onClose}
              title="Fechar"
              className="p-2 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CORPO ROLÁVEL */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* TÍTULO E RECORRÊNCIA */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="w-4 h-4 rounded-md mt-1 shrink-0" style={{ backgroundColor: event.colorTag }} />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {event.title}
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Docente: <strong className="text-gray-200">{event.professorName}</strong> • Monitoria: <span className="text-gray-300">{event.monitorName}</span>
                </p>
              </div>
            </div>

            {/* HORÁRIO & DATA */}
            <div className="pl-7 text-xs sm:text-sm text-gray-300 space-y-0.5">
              <p className="font-semibold text-gray-100 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>{event.dayOfWeek} · {event.startTime} – {event.endTime}</span>
              </p>
              <p className="text-gray-400 text-xs pl-5">
                {event.recurrenceRule}
              </p>
            </div>
          </div>

          {/* BOTÃO PRINCIPAL: ENTRAR COM O GOOGLE MEET */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-3">
              {/* Ícone de Câmera Meet Amarelo/Multicolor */}
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <Video className="w-4 h-4 text-amber-400" />
              </div>

              {/* Botão Pílula Google Meet */}
              <div className="flex items-center gap-2 flex-1">
                <a
                  href={event.googleMeetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#8ab4f8] text-[#202124] font-bold text-sm hover:bg-[#aecbfa] transition-all shadow-md active:scale-98"
                >
                  <Video className="w-4 h-4" />
                  <span>Entrar com o Google Meet</span>
                </a>

                {/* Botão Copiar Link Meet */}
                <button
                  onClick={handleCopyMeet}
                  title="Copiar link da videochamada"
                  className="p-2.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700 shrink-0"
                >
                  {copiedMeet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pl-11 text-xs text-gray-400 flex items-center justify-between">
              <span className="font-mono text-gray-300">{event.googleMeetCode}</span>
              {copiedMeet && <span className="text-emerald-400 text-[11px] font-semibold animate-fadeIn">Link copiado!</span>}
            </div>
          </div>

          {/* PARTICIPAR POR TELEFONE */}
          <div className="flex items-start gap-3 text-xs sm:text-sm">
            <Phone className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
            <div className="space-y-1 flex-1">
              <p className="font-semibold text-gray-200">Participar por telefone</p>
              <div className="flex items-center justify-between gap-2 text-xs text-gray-300 bg-gray-800/60 p-2.5 rounded-xl border border-gray-700/60">
                <span>{event.phoneBridge} PIN: {event.phonePin}</span>
                <button 
                  onClick={handleCopyPhone}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Copiar número e PIN"
                >
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                onClick={() => setShowMorePhones(!showMorePhones)}
                className="text-xs text-[#8ab4f8] hover:underline inline-flex items-center gap-1 mt-1 font-medium"
              >
                <span>Mais números de telefone</span>
                {showMorePhones ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showMorePhones && (
                <div className="mt-2 p-3 bg-gray-800/90 rounded-xl border border-gray-700 text-xs space-y-1.5 text-gray-300 animate-fadeIn">
                  <p>• São Paulo (BR): +55 11 4933-5763</p>
                  <p>• Rio de Janeiro (BR): +55 21 3958-0000</p>
                  <p>• Belo Horizonte (BR): +55 31 3958-9560</p>
                  <p>• Porto Alegre (BR): +55 51 4560-7412</p>
                  <p className="text-[11px] text-gray-400 pt-1">Use o mesmo PIN: <strong className="text-gray-200">{event.phonePin}</strong></p>
                </div>
              )}
            </div>
          </div>

          {/* CONVIDADOS & MONITORIA */}
          <div className="flex items-start gap-3 text-xs sm:text-sm">
            <Users className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-200">{event.totalGuests} convidados</p>
                  <p className="text-xs text-gray-400">{event.confirmedGuests}: sim, {event.pendingGuests}: pendente</p>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={`mailto:${event.organizerEmail}?subject=Dúvida sobre a aula: ${encodeURIComponent(event.title)}`}
                    title="Enviar e-mail para o organizador"
                    className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setShowGuestsList(!showGuestsList)}
                    className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                    title="Ver detalhes dos convidados"
                  >
                    {showGuestsList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {showGuestsList && (
                <div className="mt-2 p-3 bg-gray-800/80 rounded-xl border border-gray-700 text-xs space-y-2 text-gray-300 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-gray-700/60 pb-1.5">
                    <span className="font-bold text-gray-200">Organizador / Coordenação</span>
                    <span className="text-[11px] text-emerald-400 font-semibold">{event.organizerEmail}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{event.professorName} (Docente)</span>
                    <span className="text-[11px] text-emerald-400 font-semibold">Sim</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{event.monitorName} (Monitoria UIECB)</span>
                    <span className="text-[11px] text-emerald-400 font-semibold">Sim</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Turma 2026.2 (Discentes matriculados)</span>
                    <span className="text-[11px] text-blue-400 font-semibold">28 alunos</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ANEXOS & MATERIAIS DE ESTUDO (GOOGLE DRIVE & CORNELL DOCS) */}
          <div className="flex items-start gap-3 text-xs sm:text-sm">
            <FolderOpen className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
            <div className="flex-1 space-y-2">
              <p className="font-semibold text-gray-200">Materiais & Anotações Integradas</p>
              
              <div className="flex flex-wrap gap-2.5">
                {/* Chip 1: Drive Folder */}
                <a
                  href={event.driveFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition-colors group"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 group-hover:scale-110 transition-transform" />
                  <span className="truncate max-w-[140px]">{event.title.split('-')[0]} (Drive)</span>
                  <ExternalLink className="w-3 h-3 text-gray-400 ml-1" />
                </a>

                {/* Chip 2: Caderno Cornell */}
                <button
                  onClick={() => {
                    if (onOpenCornell) onOpenCornell(event.disciplinaId);
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 text-blue-200 text-xs font-medium border border-blue-800/60 transition-colors group"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>Anotações Cornell</span>
                </button>

                {/* Chip 3: Formulário de Presença */}
                <a
                  href={event.attendanceFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 text-xs font-medium border border-emerald-800/60 transition-colors group"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Lista de Presença</span>
                </a>
              </div>
            </div>
          </div>

          {/* ORGANIZADOR / CALENDÁRIO */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="font-mono text-gray-300">{event.organizerEmail}</span>
          </div>

        </div>

        {/* FEEDBACK TEMPORÁRIO */}
        {feedbackMessage && (
          <div className="px-6 py-2 bg-emerald-900/60 border-t border-emerald-700/60 text-emerald-200 text-xs text-center font-bold animate-fadeIn">
            {feedbackMessage}
          </div>
        )}

        {/* BARRA INFERIOR DE RSVP: "VOCÊ VAI?" */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-[#1e1f21] border-t border-gray-800">
          <div className="text-xs font-medium text-gray-300">
            <span>Você vai?</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleRsvp('yes')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-full text-xs font-bold transition-all ${
                rsvp === 'yes'
                  ? 'bg-[#8ab4f8] text-[#202124] shadow-md'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              Sim
            </button>

            <button
              onClick={() => handleRsvp('no')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-full text-xs font-bold transition-all ${
                rsvp === 'no'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              Não
            </button>

            <button
              onClick={() => handleRsvp('maybe')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-full text-xs font-bold transition-all ${
                rsvp === 'maybe'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              Talvez
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
