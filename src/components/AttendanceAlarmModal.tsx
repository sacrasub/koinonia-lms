'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Volume2, VolumeX, CheckCircle2, ExternalLink, X, 
  Clock, Sparkles, FileText, AlertCircle
} from 'lucide-react';
import { Aula } from '@/types';
import { getCurrentBrasiliaMinutes } from '@/lib/timeUtils';
import { getAulasByTurma } from '@/lib/mockData';
import { INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';
import { trackEvent } from '@/services/telemetryService';
import { getAulaCanceladaStatus, isAulaCanceladaHoje } from '@/services/aulaCanceladaService';

interface AttendanceAlarmModalProps {
  userEmail: string;
  currentRole: string;
}

export const AttendanceAlarmModal: React.FC<AttendanceAlarmModalProps> = ({
  userEmail,
  currentRole,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeAula, setActiveAula] = useState<Aula | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const alarmPlayedRef = useRef<Record<string, boolean>>({});

  const normalizedEmail = (userEmail || '').toLowerCase().trim();

  // Função para tocar som harmônico suave (Web Audio API)
  const playHarmonicChime = () => {
    if (isMuted || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playTone = (freq: number, delay: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      };

      // Sequência harmônica suave: Dó (523Hz) -> Mi (659Hz) -> Sol (784Hz) -> Dó Alto (1046Hz)
      playTone(523.25, 0, 0.8);
      playTone(659.25, 0.15, 0.9);
      playTone(783.99, 0.3, 1.0);
      playTone(1046.50, 0.45, 1.4);
    } catch (e) {
      console.warn('Web Audio API chime não suportado ou bloqueado pelo navegador:', e);
    }
  };

  useEffect(() => {
    // Alarme exclusivo para perfil de aluno
    if (currentRole !== 'aluno' || !normalizedEmail) return;

    const checkAttendanceSchedule = () => {
      const auth = INITIAL_AUTHORIZED_USERS[normalizedEmail];
      let turmaIdx = 1;
      if (auth && auth.turmaIdx !== undefined) turmaIdx = auth.turmaIdx;
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(`lms_profile_${normalizedEmail}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.turmaIdx !== undefined) turmaIdx = Number(parsed.turmaIdx);
          }
        } catch (e) {}
      }

      const now = new Date();
      const daysMap = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const currentDay = daysMap[now.getDay()];
      const currentBrtMinutes = getCurrentBrasiliaMinutes();
      const todayDateStr = now.toISOString().split('T')[0];
      const todayFormatted = now.toLocaleDateString('pt-BR');

      const currentTurmaAulas = getAulasByTurma(turmaIdx);
      const todayClasses = currentTurmaAulas.filter(
        (a) => a.day_of_week && a.day_of_week.includes(currentDay)
      );

      const liveNow = todayClasses.find((a) => {
        if (a.start_time && a.end_time && a.attendance_form_url) {
          const [sh, sm] = a.start_time.split(':').map(Number);
          const [eh, em] = a.end_time.split(':').map(Number);
          const startM = sh * 60 + sm;
          const endM = eh * 60 + em;
          const halfM = startM + Math.floor((endM - startM) / 2);

          // Dispara a partir dos 50% da aula até o fim da aula
          return currentBrtMinutes >= halfM && currentBrtMinutes <= endM;
        }
        return false;
      });

      if (liveNow) {
        // Bloqueia disparo se a aula estiver cancelada hoje
        const isCancelada =
          isAulaCanceladaHoje(liveNow.disciplina_id || liveNow.id, liveNow.disciplina_name, userEmail) ||
          getAulaCanceladaStatus(
            liveNow.disciplina_id || liveNow.id,
            liveNow.disciplina_name,
            todayFormatted
          );
        if (isCancelada) {
          setIsOpen(false);
          return;
        }

        const alarmKey = `${liveNow.id}_${todayDateStr}`;
        const alreadyDismissed = typeof window !== 'undefined' && 
          sessionStorage.getItem(`lms_attendance_alarm_dismissed_${alarmKey}`) === 'true';

        if (!alreadyDismissed && !alarmPlayedRef.current[alarmKey]) {
          alarmPlayedRef.current[alarmKey] = true;
          setActiveAula(liveNow);
          setIsOpen(true);
          playHarmonicChime();

          // Notificação nativa do navegador (se autorizada)
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`📋 Lista de Presença: ${liveNow.disciplina_name}`, {
                body: 'Metade da aula atingida! Não se esqueça de assinar a chamada oficial.',
                icon: '/favicon.ico',
              });
            } catch (_) {}
          }
        }
      }
    };

    checkAttendanceSchedule();
    const interval = setInterval(checkAttendanceSchedule, 15000); // Checa a cada 15s

    const handleCanceladaEvent = () => {
      setIsOpen(false);
      checkAttendanceSchedule();
    };
    window.addEventListener('lms_aula_cancelada_updated', handleCanceladaEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('lms_aula_cancelada_updated', handleCanceladaEvent);
    };
  }, [normalizedEmail, currentRole]);

  if (!isOpen || !activeAula) return null;

  const handleDismiss = () => {
    const todayDateStr = new Date().toISOString().split('T')[0];
    const alarmKey = `${activeAula.id}_${todayDateStr}`;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`lms_attendance_alarm_dismissed_${alarmKey}`, 'true');
    }
    setIsOpen(false);
  };

  const handleOpenForm = () => {
    if (activeAula.attendance_form_url) {
      window.open(activeAula.attendance_form_url, '_blank');
      trackEvent('meet', 'attendance_alarm_opened', activeAula.disciplina_name, {}, normalizedEmail, 'aluno');
    }
    handleDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-emerald-200 flex flex-col relative">
        
        {/* Barra Superior Decorativa */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 blur-xl"></div>

          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Ícone de Alarme com Animação Vibrante */}
          <div className="w-16 h-16 rounded-3xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white mx-auto shadow-lg relative animate-bounce">
            <Bell className="w-8 h-8 text-amber-300 animate-swing" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
            </span>
          </div>

          <div className="mt-3">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
              ⏰ Alarme de Presença
            </span>
            <h3 className="text-xl font-black text-white mt-1 leading-tight">
              Hora de Assinar a Presença!
            </h3>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Metade da aula atingida. Confirme sua frequência acadêmica.
            </p>
          </div>
        </div>

        {/* Informações da Aula */}
        <div className="p-5 sm:p-6 space-y-4 text-center">
          
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-800">Disciplina Atual</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Aula Ao Vivo
              </span>
            </div>

            <div className="font-black text-base text-slate-900 leading-snug">
              {activeAula.disciplina_name}
            </div>

            <div className="text-xs text-slate-600 flex items-center justify-between pt-1 border-t border-emerald-100">
              <span>Docente: <strong>{activeAula.professor_name || 'Corpo Docente'}</strong></span>
              <span>Monitor: <strong>{activeAula.monitor_name || 'Monitoria'}</strong></span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            O formulário oficial do <strong>Google Forms</strong> já está aberto para receber a confirmação dos estudantes presentes na sala virtual.
          </p>

          {/* Botões de Ação */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleOpenForm}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer ring-2 ring-emerald-400/30"
            >
              <FileText className="w-5 h-5 shrink-0" />
              <span>Assinar Lista de Presença Agora</span>
              <ExternalLink className="w-4 h-4 shrink-0 opacity-80" />
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition cursor-pointer"
            >
              Já assinei / Lembrar mais tarde
            </button>
          </div>

          {/* Controle de Áudio */}
          <div className="pt-2 flex items-center justify-center gap-2 text-slate-400 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setIsMuted(!isMuted);
                if (isMuted) playHarmonicChime();
              }}
              className="hover:text-slate-700 flex items-center gap-1 transition cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isMuted ? 'Som do alarme desativado' : 'Som do alarme ativo'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
