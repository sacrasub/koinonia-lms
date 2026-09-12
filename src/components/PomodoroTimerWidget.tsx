'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Clock, Sparkles, Volume2, Bell, CheckCircle2, Flame, Minimize2, Maximize2 } from 'lucide-react';

type PomodoroMode = 'focus' | 'short_break' | 'long_break';

const MODE_TIMES: Record<PomodoroMode, number> = {
  focus: 25 * 60,       // 25 min
  short_break: 5 * 60,  // 5 min
  long_break: 15 * 60,  // 15 min
};

const MODE_LABELS: Record<PomodoroMode, { title: string; color: string; badge: string }> = {
  focus: { title: 'Foco Teológico', color: 'from-blue-600 to-indigo-700', badge: 'bg-blue-100 text-blue-800' },
  short_break: { title: 'Pausa Curta', color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-100 text-emerald-800' },
  long_break: { title: 'Pausa Longa', color: 'from-purple-500 to-pink-600', badge: 'bg-purple-100 text-purple-800' },
};

export const PomodoroTimerWidget: React.FC = () => {
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_TIMES.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedCycles, setCompletedCycles] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const today = new Date().toISOString().slice(0, 10);
      const saved = localStorage.getItem(`lms_pomodoro_cycles_${today}`);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sintetizador de áudio nativo (Web Audio API - zero download / zero egress)
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Acorde Maior de Celebração)
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.6);
      });
    } catch (e) {}
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playChime();

            // Ao terminar foco: incrementa ciclos e sugere pausa
            if (mode === 'focus') {
              const nextCycles = completedCycles + 1;
              setCompletedCycles(nextCycles);
              if (typeof window !== 'undefined') {
                const today = new Date().toISOString().slice(0, 10);
                localStorage.setItem(`lms_pomodoro_cycles_${today}`, String(nextCycles));
              }
              const nextMode: PomodoroMode = nextCycles % 4 === 0 ? 'long_break' : 'short_break';
              setMode(nextMode);
              return MODE_TIMES[nextMode];
            } else {
              setMode('focus');
              return MODE_TIMES.focus;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, completedCycles]);

  const switchMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_TIMES[newMode]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODE_TIMES[mode]);
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      const nextMode = (completedCycles + 1) % 4 === 0 ? 'long_break' : 'short_break';
      switchMode(nextMode);
    } else {
      switchMode('focus');
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalTime = MODE_TIMES[mode];
  const progressPercent = Math.round(((totalTime - timeLeft) / totalTime) * 100);

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition-all text-xs font-bold"
        title="Abrir Cronômetro Pomodoro"
      >
        <Clock className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
        <span>{formattedTime}</span>
        <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-md font-black">
          {MODE_LABELS[mode].title.split(' ')[0]}
        </span>
        <Maximize2 className="w-3 h-3 ml-1 opacity-70" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* Topo do Widget */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Pomodoro de Estudos</span>
              {completedCycles > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold flex items-center gap-0.5">
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {completedCycles} {completedCycles === 1 ? 'ciclo' : 'ciclos'}
                </span>
              )}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-slate-400">
              Método de foco intervalado para leitura e elaboração acadêmica.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsMinimized(true)}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          title="Minimizar Widget"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Seletores de Modo */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
        <button
          onClick={() => switchMode('focus')}
          className={`py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
            mode === 'focus'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          25 min Foco
        </button>
        <button
          onClick={() => switchMode('short_break')}
          className={`py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
            mode === 'short_break'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          5 min Pausa
        </button>
        <button
          onClick={() => switchMode('long_break')}
          className={`py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
            mode === 'long_break'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          15 min Pausa
        </button>
      </div>

      {/* Timer Display */}
      <div className="text-center py-2 space-y-1">
        <div className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
          {formattedTime}
        </div>
        <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400">
          {MODE_LABELS[mode].title} • {progressPercent}% concluído
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full bg-gradient-to-r ${MODE_LABELS[mode].color} rounded-full transition-all duration-300`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Controles de Ação */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <button
          onClick={handleReset}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition cursor-pointer"
          title="Reiniciar Tempo"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-6 py-2.5 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95 ${
            isRunning
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-white" />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Iniciar Foco</span>
            </>
          )}
        </button>

        <button
          onClick={handleSkip}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition cursor-pointer"
          title="Avançar para Próxima Etapa"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
