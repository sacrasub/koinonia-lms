'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Video, Clock, FileText, Sparkles, FolderOpen, ChevronDown, 
  ChevronUp, Check, Copy, ExternalLink, CheckCircle2, AlertCircle,
  Mic, Ban
} from 'lucide-react';
import { Aula } from '@/types';
import { 
  getCurrentBrasiliaMinutes, 
  convertBRTToLocalTime, 
  getLocalTimeZoneInfo,
  TimeZoneInfo
} from '@/lib/timeUtils';
import { getAulasByTurma } from '@/lib/mockData';
import { INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';
import { trackEvent } from '@/services/telemetryService';
import { getAulaCanceladaStatus, isAulaCanceladaHoje, AulaCanceladaItem } from '@/services/aulaCanceladaService';

interface LiveAulaGlobalBannerProps {
  userEmail: string;
  onTabChange?: (tabId: string) => void;
  isInsideMainList?: boolean; // Se estiver na lista principal de disciplinas, ajusta o padding
}

export const LiveAulaGlobalBanner: React.FC<LiveAulaGlobalBannerProps> = ({
  userEmail,
  onTabChange,
  isInsideMainList = false,
}) => {
  const normalizedEmail = (userEmail || '').toLowerCase().trim();

  // Informações de Turma e Perfil
  const [studentTurmaIdx, setStudentTurmaIdx] = useState<number>(() => {
    const auth = INITIAL_AUTHORIZED_USERS[normalizedEmail];
    if (auth && auth.turmaIdx !== undefined) return auth.turmaIdx;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`lms_profile_${normalizedEmail}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.turmaIdx !== undefined) return Number(parsed.turmaIdx);
        }
      } catch (e) {}
    }
    return 1;
  });

  const [activeLiveAula, setActiveLiveAula] = useState<Aula | null>(null);
  const [canceladaInfo, setCanceladaInfo] = useState<AulaCanceladaItem | null>(null);
  const [isPreLive, setIsPreLive] = useState<boolean>(false);
  const [minutesToStart, setMinutesToStart] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Escuta atualizações de perfil
  useEffect(() => {
    const handleProfileUpd = () => {
      const auth = INITIAL_AUTHORIZED_USERS[normalizedEmail];
      let tIdx = 1;
      if (auth && auth.turmaIdx !== undefined) tIdx = auth.turmaIdx;
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(`lms_profile_${normalizedEmail}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.turmaIdx !== undefined) tIdx = Number(parsed.turmaIdx);
          }
        } catch (e) {}
      }
      setStudentTurmaIdx(tIdx);
    };

    window.addEventListener('lms_student_sync_updated', handleProfileUpd);
    return () => window.removeEventListener('lms_student_sync_updated', handleProfileUpd);
  }, [normalizedEmail]);

  // Checagem periódica e ultra-leve (0 rede) da aula ao vivo
  useEffect(() => {
    const checkLiveStatus = () => {
      const now = new Date();
      const daysMap = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const currentDay = daysMap[now.getDay()];
      const currentBrtMinutes = getCurrentBrasiliaMinutes();
      const todayFormatted = now.toLocaleDateString('pt-BR');

      const currentTurmaAulas = getAulasByTurma(studentTurmaIdx ?? 1);
      const todayClasses = currentTurmaAulas.filter(
        (a) => a.day_of_week && a.day_of_week.includes(currentDay)
      );

      if (todayClasses.length === 0) {
        setActiveLiveAula(null);
        setCanceladaInfo(null);
        setIsPreLive(false);
        setMinutesToStart(0);
        return;
      }

      // 1. Verifica primeiro se QUALQUER aula de hoje da turma está com status de cancelamento
      for (const todayAula of todayClasses) {
        const cancelStatus =
          isAulaCanceladaHoje(todayAula.disciplina_id || todayAula.id, todayAula.disciplina_name, userEmail) ||
          getAulaCanceladaStatus(todayAula.disciplina_id || todayAula.id, todayAula.disciplina_name, todayFormatted);
        if (cancelStatus) {
          setActiveLiveAula(todayAula);
          setCanceladaInfo(cancelStatus);
          setIsPreLive(false);
          setMinutesToStart(0);
          return;
        }
      }

      // Identifica aula ativa (incluindo janela de 15 minutos de antecedência)
      const liveNow = todayClasses.find((a) => {
        if (a.start_time && a.end_time) {
          const [sh, sm] = a.start_time.split(':').map(Number);
          const [eh, em] = a.end_time.split(':').map(Number);
          const startM = sh * 60 + sm;
          const endM = eh * 60 + em;
          return currentBrtMinutes >= (startM - 15) && currentBrtMinutes <= endM;
        }
        return false;
      });

      if (liveNow && liveNow.start_time && liveNow.end_time) {
        // Checa se a aula atual está cancelada
        const cancelStatus =
          isAulaCanceladaHoje(liveNow.disciplina_id || liveNow.id, liveNow.disciplina_name, userEmail) ||
          getAulaCanceladaStatus(liveNow.disciplina_id || liveNow.id, liveNow.disciplina_name, todayFormatted);

        if (cancelStatus) {
          setActiveLiveAula(liveNow);
          setCanceladaInfo(cancelStatus);
          setIsPreLive(false);
          setMinutesToStart(0);
          return;
        }

        setActiveLiveAula(liveNow);
        setCanceladaInfo(null);

        const [sh, sm] = liveNow.start_time.split(':').map(Number);
        const [eh, em] = liveNow.end_time.split(':').map(Number);
        const startM = sh * 60 + sm;
        const endM = eh * 60 + em;

        // Pré-carregamento proativo (Janela 18h00 - 22h30): Salva links no cache local e pré-aquece conexões
        try {
          if (typeof window !== 'undefined') {
            const cachePayload = {
              disciplina_name: liveNow.disciplina_name,
              google_meet_url: liveNow.google_meet_url,
              presence_form_url: (liveNow as any).presence_form_url || (liveNow as any).google_forms_url || '',
              start_time: liveNow.start_time,
              end_time: liveNow.end_time,
              cached_at: new Date().toISOString(),
            };
            localStorage.setItem('lms_cached_live_links', JSON.stringify(cachePayload));

            // Injeta preconnect para acelerar TTFB no smartphone dos alunos
            if (typeof document !== 'undefined') {
              if (!document.getElementById('lms-preconnect-meet')) {
                const linkMeet = document.createElement('link');
                linkMeet.id = 'lms-preconnect-meet';
                linkMeet.rel = 'preconnect';
                linkMeet.href = 'https://meet.google.com';
                document.head.appendChild(linkMeet);
              }
              if (!document.getElementById('lms-preconnect-forms')) {
                const linkForms = document.createElement('link');
                linkForms.id = 'lms-preconnect-forms';
                linkForms.rel = 'preconnect';
                linkForms.href = 'https://docs.google.com';
                document.head.appendChild(linkForms);
              }
            }
          }
        } catch (_) {}

        if (currentBrtMinutes < startM) {
          setIsPreLive(true);
          setMinutesToStart(Math.max(1, startM - currentBrtMinutes));
          setProgressPercent(0);
        } else {
          setIsPreLive(false);
          setMinutesToStart(0);
          const totalDuration = endM - startM;
          const elapsed = currentBrtMinutes - startM;
          const pct = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
          setProgressPercent(pct);
        }
        return;
      }

      setActiveLiveAula(null);
      setCanceladaInfo(null);
      setIsPreLive(false);
      setMinutesToStart(0);
    };

    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 10000); // 10 segundos matemática local
    window.addEventListener('lms_aula_cancelada_updated', checkLiveStatus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('lms_aula_cancelada_updated', checkLiveStatus);
    };
  }, [studentTurmaIdx]);

  if (!activeLiveAula) return null;

  const is50PercentReached = progressPercent >= 50;

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenCornell = () => {
    if (onTabChange) {
      onTabChange('aluno-caderno');
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lms_change_tab', { detail: 'aluno-caderno' }));
    }
    setTimeout(() => {
      const todayIso = new Date().toISOString().split('T')[0];
      window.dispatchEvent(new CustomEvent('lms_open_cornell_note', {
        detail: {
          disciplina_name: activeLiveAula.disciplina_name,
          disciplina_code: activeLiveAula.code || 'TEO-2026',
          professor_name: activeLiveAula.professor_name || 'Corpo Docente',
          date: todayIso,
          theme: `Aula Ao Vivo • ${activeLiveAula.disciplina_name}`,
        }
      }));
    }, 150);
  };

  const handleOpenLiveTranscriber = () => {
    if (!activeLiveAula) return;
    trackEvent('cornell_notes', 'open_live_transcriber_from_banner', activeLiveAula.disciplina_name, {}, normalizedEmail, 'aluno');
    if (onTabChange) {
      onTabChange('aluno-caderno');
    }
    setTimeout(() => {
      const todayIso = new Date().toISOString().split('T')[0];
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lms_open_transcriber', {
          detail: {
            disciplina_name: activeLiveAula.disciplina_name,
            disciplina_code: activeLiveAula.code || 'TEO-2026',
            date: todayIso,
          }
        }));
      }
    }, 150);
  };

  if (canceladaInfo) {
    return (
      <div data-tour="live-banner" className={`w-full mb-5 animate-in fade-in slide-in-from-top-3 duration-300 ${isInsideMainList ? 'mt-0' : ''}`}>
        <div className="p-4 sm:p-5 rounded-3xl border-2 border-red-300 bg-gradient-to-br from-red-50 via-white to-rose-50/80 shadow-md text-slate-900 space-y-3">
          {/* Cabeçalho do Card Cancelada */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full font-black text-xs uppercase bg-red-600 text-white flex items-center gap-1.5 shadow-xs">
                <Ban className="w-3.5 h-3.5" />
                <span>🚫 AULA CANCELADA HOJE</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-200">
                {canceladaInfo.data_aula}
              </span>
            </div>

            <span className="text-[11px] font-mono font-bold text-red-700 bg-red-50/90 px-2.5 py-1 rounded-lg border border-red-200">
              Registrado por: {canceladaInfo.autor_nome}
            </span>
          </div>

          {/* Nome da Disciplina e Motivo */}
          <div className="space-y-1.5">
            <h3 className="font-black text-base sm:text-lg text-red-950">
              {canceladaInfo.disciplina_name}
            </h3>
            <div className="p-3 bg-white/90 rounded-2xl border border-red-200 shadow-2xs">
              <span className="text-xs font-bold text-red-900 block mb-0.5">Motivo informado pela monitoria / docência:</span>
              <p className="text-xs text-red-950 font-medium leading-relaxed italic">
                "{canceladaInfo.motivo}"
              </p>
            </div>
            <p className="text-[11px] text-red-700 flex items-center gap-1.5 pt-0.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>A transmissão ao vivo no Google Meet e o formulário de presença estão suspensos nesta data.</span>
            </p>
          </div>

          {/* Ações de Estudo Alternativo */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-red-100">
            <button
              type="button"
              onClick={handleOpenCornell}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Acessar Caderno de Estudos Cornell</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-tour="live-banner" className={`w-full mb-5 animate-in fade-in slide-in-from-top-3 duration-300 ${isInsideMainList ? 'mt-0' : ''}`}>
      <div className={`p-4 sm:p-5 rounded-3xl border shadow-md transition-all duration-300 relative overflow-hidden ${
        is50PercentReached
          ? 'bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/90 border-emerald-300 ring-2 ring-emerald-500/20'
          : isPreLive
          ? 'bg-gradient-to-br from-blue-50/95 via-white to-indigo-50/90 border-blue-300 ring-2 ring-blue-500/20'
          : 'bg-gradient-to-br from-red-50/90 via-white to-blue-50/90 border-red-300 ring-2 ring-red-500/20'
      }`}>
        
        {/* Cabeçalho do Card */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            <span className="flex h-3 w-3 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                is50PercentReached ? 'bg-emerald-400' : 'bg-red-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                is50PercentReached ? 'bg-emerald-500' : 'bg-red-500'
              }`}></span>
            </span>

            <span className="flex items-center gap-1.5 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] tracking-wider uppercase inline-flex items-center gap-1 shadow-xs ${
                isPreLive 
                  ? 'bg-blue-600 text-white animate-pulse' 
                  : 'bg-red-600 text-white animate-pulse'
              }`}>
                {isPreLive ? `🔴 Sala Aberta • Inicia em ${minutesToStart} min` : '🔴 Aula Ao Vivo em Andamento'}
              </span>
              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1 shadow-2xs">
                ⚡ Links Prontos (Pré-carregados)
              </span>
            </span>

            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
              Aula Ativa: <span className="text-blue-700 font-black">{activeLiveAula.disciplina_name}</span>
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200 transition shrink-0 cursor-pointer"
            title={isCollapsed ? 'Expandir Card de Aula Ao Vivo' : 'Recolher Card'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Metadados e Horário */}
        <div className="text-xs text-slate-600 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>Professor(a): <strong>{activeLiveAula.professor_name || 'Corpo Docente'}</strong></span>
          <span>•</span>
          <span>Monitor(a): <strong>{activeLiveAula.monitor_name || 'Monitoria'}</strong></span>
          <span>•</span>
          <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
            ⏰ Horário: {activeLiveAula.start_time ? convertBRTToLocalTime(activeLiveAula.start_time) : ''} – {activeLiveAula.end_time ? convertBRTToLocalTime(activeLiveAula.end_time) : ''}
          </span>
          <span className="text-slate-400 text-[11px]">
            (Base Brasília: {activeLiveAula.start_time} – {activeLiveAula.end_time} BRT)
          </span>
        </div>

        {/* Conteúdo Expansível */}
        {!isCollapsed && (
          <div className="mt-3 space-y-3 pt-3 border-t border-slate-200/60 animate-in fade-in duration-200">
            
            {/* Barra de Progresso da Aula */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  {isPreLive ? 'Sala liberada com 15 min de antecedência' : 'Duração da Aula'}
                </span>
                <span className={`font-black px-2 py-0.5 rounded-md text-[11px] ${
                  is50PercentReached 
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' 
                    : isPreLive
                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  {isPreLive ? `Início oficial em ${minutesToStart} min` : `${progressPercent}% da aula percorrida`}
                </span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden p-0.5 border border-slate-300/60 shadow-inner relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400/80 z-10"></div>
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${
                    is50PercentReached 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                      : isPreLive
                      ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                      : 'bg-gradient-to-r from-amber-400 to-blue-500'
                  }`}
                  style={{ width: `${isPreLive ? 100 : progressPercent}%` }}
                />
              </div>
            </div>

            {/* Ações e Links Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-1">
              {/* Botão Entrar no Google Meet */}
              {activeLiveAula.google_meet_url && (
                <a
                  href={activeLiveAula.google_meet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackEvent('meet', 'join_live_banner', activeLiveAula.disciplina_name, {}, normalizedEmail, 'aluno');
                  }}
                  className="px-3 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Video className="w-4 h-4 shrink-0" />
                  <span>Entrar no Google Meet</span>
                </a>
              )}

              {/* Botão Lista de Presença */}
              {activeLiveAula.attendance_form_url ? (
                <a
                  href={activeLiveAula.attendance_form_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackEvent('meet', 'attendance_banner_click', activeLiveAula.disciplina_name, {}, normalizedEmail, 'aluno');
                  }}
                  className={`px-3 py-2.5 font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${
                    is50PercentReached
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{is50PercentReached ? 'Assinar Lista de Presença' : 'Lista de Presença (Forms)'}</span>
                </a>
              ) : null}

              {/* Botão Transcrever ao Vivo */}
              <button
                type="button"
                onClick={handleOpenLiveTranscriber}
                className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs"
                title="Abrir transcrição em tempo real da aula"
              >
                <Mic className="w-3.5 h-3.5 text-red-600 shrink-0 animate-pulse" />
                <span>Transcrever ao Vivo</span>
              </button>

              {/* Botão Caderno Cornell IA */}
              <button
                type="button"
                onClick={handleOpenCornell}
                className="px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Caderno Cornell IA</span>
              </button>

              {/* Botão Pasta do Drive */}
              {activeLiveAula.google_drive_url && (
                <a
                  href={activeLiveAula.google_drive_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Pasta no Google Drive</span>
                </a>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
