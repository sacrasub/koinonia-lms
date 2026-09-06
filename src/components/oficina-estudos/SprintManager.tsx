'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  SprintSemanal,
  ChecklistItem,
  EixoTematicoId
} from '@/types/oficinaEstudos';
import { oficinaEstudosService } from '@/services/oficinaEstudosService';
import {
  CheckCircle2,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Clock,
  BookOpen,
  Sparkles,
  Flame,
  Award,
  ChevronRight,
  ExternalLink,
  Target,
  Compass,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SprintManagerProps {
  onOpenCornellWithBook?: (autor: string, obra: string, eixo: EixoTematicoId) => void;
  onShowToast: (msg: string) => void;
}

export const SprintManager: React.FC<SprintManagerProps> = ({
  onOpenCornellWithBook,
  onShowToast,
}) => {
  const [sprints, setSprints] = useState<SprintSemanal[]>(() => oficinaEstudosService.getSprints());
  const [selectedSprintId, setSelectedSprintId] = useState<string>('semana-1');

  // Cronômetro / Pomodoro integrado
  const [pomodoroDuration, setPomodoroDuration] = useState<number>(7200); // Padrão 2h (7200s)
  const [timeLeft, setTimeLeft] = useState<number>(7200);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'regressivo' | 'livre'>('regressivo');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeSprint = sprints.find((s) => s.id === selectedSprintId) || sprints[0];

  // Cálculo de progresso do checklist
  const totalItems = activeSprint.checklist.length;
  const completedItems = activeSprint.checklist.filter((c) => c.lido).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Formatação de segundos para hh:mm:ss
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Efeito do Cronômetro / Pomodoro
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (timerMode === 'regressivo') {
            if (prev <= 1) {
              setIsRunning(false);
              clearInterval(timerRef.current!);
              onShowToast('🎉 Parabéns! Ciclo de foco acadêmico completado com louvor!');
              // Registra o tempo estipulado no sprint ativo
              const updated = oficinaEstudosService.addStudyTime(selectedSprintId, pomodoroDuration);
              setSprints(updated);
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timerMode, selectedSprintId, pomodoroDuration, onShowToast]);

  const handleToggleChecklist = (itemId: string) => {
    const updated = oficinaEstudosService.toggleChecklistItem(selectedSprintId, itemId);
    setSprints(updated);
    const item = activeSprint.checklist.find((c) => c.id === itemId);
    if (item && !item.lido) {
      onShowToast(`✓ Leitura concluída: "${item.titulo}"`);
    }
  };

  const handleSetPreset = (seconds: number) => {
    setIsRunning(false);
    setTimerMode('regressivo');
    setPomodoroDuration(seconds);
    setTimeLeft(seconds);
    onShowToast(`Timer configurado para ${Math.round(seconds / 60)} minutos.`);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(pomodoroDuration);
  };

  const handleSavePartialTime = () => {
    if (timeLeft < pomodoroDuration && timerMode === 'regressivo') {
      const elapsed = pomodoroDuration - timeLeft;
      if (elapsed > 30) {
        const updated = oficinaEstudosService.addStudyTime(selectedSprintId, elapsed);
        setSprints(updated);
        onShowToast(`+${Math.round(elapsed / 60)} min acumulados no Sprint!`);
        setTimeLeft(pomodoroDuration);
        setIsRunning(false);
      }
    }
  };

  const getEixoBadge = (eixo: EixoTematicoId) => {
    switch (eixo) {
      case 'historico':
        return { label: 'Eixo 1 • Histórico', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
      case 'teorico':
        return { label: 'Eixo 2 • Teórico-Pedagógico', color: 'bg-blue-500/10 text-blue-300 border-blue-500/30' };
      case 'eclesiologico':
        return { label: 'Eixo 3 • Eclesiológico', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
      case 'inovacao':
        return { label: 'Eixo 4 • Inovação & Tele-proximidade', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
    }
  };

  const badge = getEixoBadge(activeSprint.eixo);

  return (
    <div className="space-y-6">
      {/* 1. SELETOR DE SPRINTS (4 SEMANAS DE IMERSÃO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sprints.map((sprint) => {
          const isSelected = sprint.id === selectedSprintId;
          const sTotal = sprint.checklist.length;
          const sDone = sprint.checklist.filter((c) => c.lido).length;
          const sPct = sTotal > 0 ? Math.round((sDone / sTotal) * 100) : 0;
          const hoursTotal = (sprint.tempo_estudado_segundos / 3600).toFixed(1);

          return (
            <button
              key={sprint.id}
              onClick={() => {
                setSelectedSprintId(sprint.id);
                setIsRunning(false);
              }}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-amber-400/60 shadow-xl shadow-blue-950/40'
                  : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    isSelected
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Semana {sprint.numero}
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  {hoursTotal}h / {sprint.meta_horas}h
                </span>
              </div>

              <h4 className="font-black text-white text-sm line-clamp-1 group-hover:text-amber-300 transition-colors">
                {sprint.subtitulo}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {sprint.foco_autores}
              </p>

              {/* Mini barra de progresso */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-bold mb-1 text-slate-400">
                  <span>Leituras</span>
                  <span className={sPct === 100 ? 'text-emerald-400' : 'text-amber-400'}>
                    {sDone}/{sTotal} ({sPct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      sPct === 100
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-amber-500 to-blue-500'
                    }`}
                    style={{ width: `${sPct}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. PAINEL PRINCIPAL DO SPRINT SELECIONADO & POMODORO ACADÊMICO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUNA ESQUERDA/MEIO (2/3): DETALHES DO EIXO E CHECKLIST DE LEITURA */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-bold bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Meta Semanal: {activeSprint.meta_horas} horas de imersão</span>
              </div>
            </div>

            <h3 className="text-xl font-black text-white tracking-tight">
              {activeSprint.titulo}: {activeSprint.subtitulo}
            </h3>

            <div className="mt-2 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">Objetivo de Metacognição: </strong>
                {activeSprint.objetivo}
              </div>
            </div>

            {/* BARRA DE PROGRESSO DESTAQUE */}
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-blue-950/40 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className={`w-4 h-4 ${progressPercent === 100 ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                    Progresso de Leitura & Fichamento
                  </span>
                </div>
                <span className="text-sm font-black text-amber-400">
                  {progressPercent}% Concluído
                </span>
              </div>
              <div className="h-3 w-full bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    progressPercent === 100
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-md shadow-emerald-500/40'
                      : 'bg-gradient-to-r from-amber-500 via-amber-400 to-blue-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* LISTA DE LEITURAS E CHECKLIST */}
            <div className="mt-6 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Textos Chave & Checklist Metodológico ({completedItems}/{totalItems})</span>
              </h4>

              <div className="space-y-2.5">
                {activeSprint.checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      item.lido
                        ? 'bg-slate-950/40 border-emerald-500/30 text-slate-300'
                        : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 text-white'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => handleToggleChecklist(item.id)}
                        className="mt-0.5 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        {item.lido ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500 hover:text-amber-400" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-bold ${item.lido ? 'line-through text-slate-500' : 'text-white'}`}>
                            {item.titulo}
                          </span>
                          {item.paginas_recomendadas && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                              {item.paginas_recomendadas}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.descricao}
                        </p>
                      </div>
                    </div>

                    {/* Ação para Fichar no Cornell */}
                    {onOpenCornellWithBook && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onOpenCornellWithBook(
                            item.autor_referencia,
                            item.titulo,
                            activeSprint.eixo
                          )
                        }
                        className="shrink-0 border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs rounded-xl flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Fichar no Cornell</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (1/3): CRONÔMETRO POMODORO ACADÊMICO */}
        <div className="space-y-4">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                <h4 className="font-black text-white text-sm uppercase tracking-wider">
                  Imersão & Foco
                </h4>
              </div>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full">
                Sessão de Estudo
              </span>
            </div>

            {/* Display do Timer Gigante */}
            <div className="text-center py-5 bg-slate-950/80 rounded-2xl border border-slate-800/80 shadow-inner">
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow">
                {formatTime(timeLeft)}
              </div>
              <p className="text-[11px] font-bold text-slate-400 mt-2">
                {isRunning ? '⏳ Sessão ativa — processando leitura densa' : '⏸️ Timer pausado'}
              </p>
            </div>

            {/* Controles do Timer */}
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                className={`font-black text-xs px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Iniciar Foco</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleResetTimer}
                title="Reiniciar Timer"
                className="border-slate-700 bg-slate-800 text-slate-300 hover:text-white rounded-xl"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                onClick={handleSavePartialTime}
                title="Salvar tempo decorrido no sprint atual"
                className="border-slate-700 bg-slate-800 text-slate-200 hover:text-amber-400 text-xs rounded-xl"
              >
                Salvar Horas
              </Button>
            </div>

            {/* Presets Recomendados */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Presets de Bloco Acadêmico
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSetPreset(1500)} // 25 min
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors"
                >
                  25 min (Pomodoro)
                </button>
                <button
                  onClick={() => handleSetPreset(3000)} // 50 min
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors"
                >
                  50 min (Leitura)
                </button>
                <button
                  onClick={() => handleSetPreset(7200)} // 2 horas
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors"
                >
                  2 Horas (Imersão)
                </button>
                <button
                  onClick={() => handleSetPreset(10800)} // 3 horas
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition-colors"
                >
                  3 Horas (Meta)
                </button>
              </div>
            </div>

            {/* Registro de Tempo Acumulado */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Acumulado no Sprint {activeSprint.numero}:</span>
              <span className="font-bold text-amber-400">
                {(activeSprint.tempo_estudado_segundos / 3600).toFixed(1)} horas
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
