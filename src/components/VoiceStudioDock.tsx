'use client';

import React, { useEffect, useState } from 'react';
import {
  AudioLines,
  Loader2,
  Pause,
  Play,
  Settings,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useVoiceStudio } from '@/contexts/VoiceStudioContext';
import { VoiceStudioSettingsModal } from '@/components/VoiceStudioSettingsModal';

interface SelectionPopupState {
  text: string;
  top: number;
  left: number;
}

export const VoiceStudioDock: React.FC = () => {
  const {
    settings,
    isSettingsOpen,
    openSettings,
    isSpeaking,
    isPaused,
    isLoading,
    activeTitle,
    activeEngineUsed,
    fallbackNotice,
    errorMessage,
    chunks,
    currentChunkIndex,
    speak,
    pause,
    resume,
    stop,
    nextChunk,
    prevChunk,
    cycleSpeed,
    clearMessages,
  } = useVoiceStudio();

  const [selectionPopup, setSelectionPopup] = useState<SelectionPopupState | null>(null);

  // Detecta seleção de texto em qualquer lugar da plataforma para exibir botão flutuante "Ouvir seleção"
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSelectionCheck = (ev: Event) => {
      if (!settings.enableSelectionPopup || isSettingsOpen) {
        setSelectionPopup(null);
        return;
      }

      const target = ev.target as HTMLElement | null;
      if (target && target.closest('[data-voicestudio-dock="true"], [data-voicestudio-modal="true"]')) {
        return;
      }

      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) {
          setSelectionPopup(null);
          return;
        }
        const selectedText = sel.toString().trim();
        if (selectedText.length < 8) {
          setSelectionPopup(null);
          return;
        }

        const anchorEl =
          sel.anchorNode instanceof Element ? sel.anchorNode : sel.anchorNode?.parentElement;
        if (anchorEl?.closest('[data-voicestudio-modal="true"]')) {
          setSelectionPopup(null);
          return;
        }

        try {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) {
            setSelectionPopup(null);
            return;
          }
          const top = Math.max(12, rect.top - 44);
          const left = Math.min(
            window.innerWidth - 170,
            Math.max(12, rect.left + rect.width / 2 - 75)
          );
          setSelectionPopup({ text: selectedText, top, left });
        } catch {
          setSelectionPopup(null);
        }
      }, 20);
    };

    const handleScrollOrBlur = () => setSelectionPopup(null);

    document.addEventListener('mouseup', handleSelectionCheck);
    document.addEventListener('keyup', handleSelectionCheck);
    window.addEventListener('scroll', handleScrollOrBlur, { passive: true });
    return () => {
      document.removeEventListener('mouseup', handleSelectionCheck);
      document.removeEventListener('keyup', handleSelectionCheck);
      window.removeEventListener('scroll', handleScrollOrBlur);
    };
  }, [isSettingsOpen, settings.enableSelectionPopup]);

  const handleReadSelection = () => {
    if (!selectionPopup) return;
    const text = selectionPopup.text;
    setSelectionPopup(null);
    window.getSelection()?.removeAllRanges();
    void speak({
      id: 'global-text-selection',
      title: 'Trecho selecionado',
      text,
    });
  };

  const showMiniPlayer = isLoading || isSpeaking || isPaused || Boolean(errorMessage);
  const currentTextPreview = chunks[currentChunkIndex] || '';
  const totalChunks = chunks.length;

  return (
    <>
      <VoiceStudioSettingsModal />

      {/* POPUP FLUTUANTE "OUVIR SELEÇÃO" */}
      {selectionPopup && !isSettingsOpen && (
        <div
          data-voicestudio-dock="true"
          style={{ top: `${selectionPopup.top}px`, left: `${selectionPopup.left}px` }}
          className="fixed z-[75] animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleReadSelection}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-extrabold shadow-xl border border-indigo-400/50 cursor-pointer active:scale-95"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Ouvir seleção</span>
          </button>
        </div>
      )}

      {/* MINI-PLAYER FLUTUANTE DE LEITURA (ancorado à esquerda para não colidir com o Chat à direita) */}
      {showMiniPlayer && (
        <div
          data-voicestudio-dock="true"
          className="fixed bottom-20 md:bottom-5 left-3 sm:left-5 z-[60] w-[calc(100vw-24px)] sm:w-[390px] bg-slate-950/95 text-white backdrop-blur-md rounded-2xl border border-indigo-500/40 shadow-2xl p-3.5 space-y-2.5 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Topo: título + badge motor + fechar */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/25 text-indigo-200 border border-indigo-400/30">
                  <AudioLines className="w-3 h-3 text-amber-300" />
                  {activeEngineUsed === 'browser'
                    ? 'Voz do Navegador'
                    : 'VoiceStudio TTS'}
                </span>
                {totalChunks > 1 && (
                  <span className="text-[10px] font-mono text-slate-300">
                    Parte {currentChunkIndex + 1}/{totalChunks}
                  </span>
                )}
              </div>
              <h4 className="text-xs font-extrabold text-white truncate mt-1">
                {activeTitle || 'Leitura em Voz Alta'}
              </h4>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={openSettings}
                title="Ajustar configurações de voz (VoiceStudio)"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white transition cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  stop();
                  clearMessages();
                }}
                title="Fechar reprodutor"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/80 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Erro ou aviso de fallback */}
          {errorMessage ? (
            <div className="p-2 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <p>{errorMessage}</p>
                <button
                  type="button"
                  onClick={openSettings}
                  className="text-[10px] font-black text-amber-300 underline cursor-pointer"
                >
                  Abrir Estúdio de Voz para configurar
                </button>
              </div>
            </div>
          ) : (
            <>
              {fallbackNotice && (
                <p className="text-[10px] text-amber-300 font-semibold leading-snug">
                  {fallbackNotice}
                </p>
              )}

              {currentTextPreview && (
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {currentTextPreview}
                </p>
              )}

              {/* Controles de mídia */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={prevChunk}
                    disabled={currentChunkIndex === 0 || isLoading}
                    title="Trecho anterior"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition cursor-pointer"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>

                  {isLoading ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Gerando áudio...</span>
                    </span>
                  ) : isPaused ? (
                    <button
                      type="button"
                      onClick={resume}
                      title="Continuar"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Continuar</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={pause}
                      title="Pausar"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pausar</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={nextChunk}
                    disabled={currentChunkIndex >= totalChunks - 1 || isLoading}
                    title="Próximo trecho"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition cursor-pointer"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={stop}
                    title="Parar leitura"
                    className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white transition cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={cycleSpeed}
                  title="Alterar velocidade de leitura"
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-amber-300 transition cursor-pointer"
                >
                  {settings.speed.toFixed(2).replace(/0$/, '')}x
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
