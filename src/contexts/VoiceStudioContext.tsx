'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_VOICESTUDIO_MODELS,
  DEFAULT_VOICESTUDIO_SETTINGS,
  DEFAULT_VOICESTUDIO_VOICES,
  VoiceStudioConnectionResult,
  VoiceStudioModelItem,
  VoiceStudioSettings,
  VoiceStudioVoiceItem,
  loadVoiceStudioSettings,
  normalizeTextForSpeech,
  saveVoiceStudioSettings,
  splitTextIntoSpeechChunks,
  synthesizeVoiceStudioChunk,
  testVoiceStudioConnection,
} from '@/services/voiceStudioService';

export interface SpeakOptions {
  id: string;
  title: string;
  text: string;
  overrideSettings?: Partial<VoiceStudioSettings>;
}

interface VoiceStudioContextValue {
  settings: VoiceStudioSettings;
  updateSettings: (patch: Partial<VoiceStudioSettings>) => void;
  resetSettings: () => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  connectionStatus: VoiceStudioConnectionResult | null;
  isTestingConnection: boolean;
  refreshConnection: (customSettings?: VoiceStudioSettings) => Promise<VoiceStudioConnectionResult>;
  availableVoices: VoiceStudioVoiceItem[];
  availableModels: VoiceStudioModelItem[];
  browserVoices: SpeechSynthesisVoice[];
  isSpeaking: boolean;
  isPaused: boolean;
  isLoading: boolean;
  activeSourceId: string | null;
  activeTitle: string;
  activeEngineUsed: 'voicestudio' | 'browser' | null;
  fallbackNotice: string | null;
  errorMessage: string | null;
  chunks: string[];
  currentChunkIndex: number;
  speak: (opts: SpeakOptions) => Promise<void>;
  toggleSpeak: (opts: SpeakOptions) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  nextChunk: () => void;
  prevChunk: () => void;
  cycleSpeed: () => void;
  clearMessages: () => void;
}

const VoiceStudioContext = createContext<VoiceStudioContextValue | null>(null);

const SPEED_STEPS = [0.85, 1.0, 1.15, 1.3, 1.5];

export const VoiceStudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<VoiceStudioSettings>(DEFAULT_VOICESTUDIO_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<VoiceStudioConnectionResult | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<VoiceStudioVoiceItem[]>(DEFAULT_VOICESTUDIO_VOICES);
  const [availableModels, setAvailableModels] = useState<VoiceStudioModelItem[]>(DEFAULT_VOICESTUDIO_MODELS);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState('');
  const [activeEngineUsed, setActiveEngineUsed] = useState<'voicestudio' | 'browser' | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [chunks, setChunks] = useState<string[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);

  const sessionIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioObjectUrlRef = useRef<string | null>(null);
  const prefetchCacheRef = useRef<Map<number, Promise<{ blob: Blob; mimeType: string }>>>(new Map());
  const activeChunksRef = useRef<string[]>([]);
  const activeSettingsRef = useRef<VoiceStudioSettings>(DEFAULT_VOICESTUDIO_SETTINGS);
  const currentModeRef = useRef<'voicestudio' | 'browser' | null>(null);
  const browserChunkIdxRef = useRef(0);

  useEffect(() => {
    const loaded = loadVoiceStudioSettings();
    setSettings(loaded);
    activeSettingsRef.current = loaded;

    const handleExternalUpdate = (e: Event) => {
      const detail = (e as CustomEvent<VoiceStudioSettings>).detail;
      if (detail) {
        setSettings(detail);
        activeSettingsRef.current = detail;
      }
    };
    window.addEventListener('lms_voicestudio_settings_updated', handleExternalUpdate);
    return () => {
      window.removeEventListener('lms_voicestudio_settings_updated', handleExternalUpdate);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const raw = window.speechSynthesis.getVoices() || [];
      const sorted = [...raw].sort((a, b) => {
        const aPt = a.lang.toLowerCase().startsWith('pt') ? 0 : 1;
        const bPt = b.lang.toLowerCase().startsWith('pt') ? 0 : 1;
        if (aPt !== bPt) return aPt - bPt;
        const aBr = a.lang.toLowerCase() === 'pt-br' ? 0 : 1;
        const bBr = b.lang.toLowerCase() === 'pt-br' ? 0 : 1;
        if (aBr !== bBr) return aBr - bBr;
        return a.name.localeCompare(b.name);
      });
      setBrowserVoices(sorted);
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const cleanupPlaybackResources = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    prefetchCacheRef.current.clear();

    if (audioRef.current) {
      try {
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.pause();
        audioRef.current.src = '';
      } catch {}
      audioRef.current = null;
    }

    if (audioObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(audioObjectUrlRef.current);
      } catch {}
      audioObjectUrlRef.current = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }, []);

  useEffect(() => {
    return () => {
      sessionIdRef.current += 1;
      cleanupPlaybackResources();
    };
  }, [cleanupPlaybackResources]);

  const stop = useCallback(() => {
    sessionIdRef.current += 1;
    cleanupPlaybackResources();
    currentModeRef.current = null;
    activeChunksRef.current = [];
    setIsSpeaking(false);
    setIsPaused(false);
    setIsLoading(false);
    setActiveSourceId(null);
    setActiveTitle('');
    setActiveEngineUsed(null);
    setChunks([]);
    setCurrentChunkIndex(0);
    setFallbackNotice(null);
    setErrorMessage(null);
  }, [cleanupPlaybackResources]);

  const pickBestBrowserVoice = useCallback(
    (effectiveSettings: VoiceStudioSettings): SpeechSynthesisVoice | null => {
      if (browserVoices.length === 0) return null;
      if (effectiveSettings.browserVoiceURI) {
        const matched = browserVoices.find((v) => v.voiceURI === effectiveSettings.browserVoiceURI);
        if (matched) return matched;
      }
      const ptBrNatural = browserVoices.find(
        (v) =>
          v.lang.toLowerCase() === 'pt-br' &&
          /(natural|neural|online|microsoft|google)/i.test(v.name)
      );
      if (ptBrNatural) return ptBrNatural;
      const ptBrAny = browserVoices.find((v) => v.lang.toLowerCase().startsWith('pt-br'));
      if (ptBrAny) return ptBrAny;
      const ptAny = browserVoices.find((v) => v.lang.toLowerCase().startsWith('pt'));
      return ptAny || browserVoices[0] || null;
    },
    [browserVoices]
  );

  const playBrowserChunkAt = useCallback(
    (index: number, sessionId: number, effectiveSettings: VoiceStudioSettings) => {
      if (sessionIdRef.current !== sessionId) return;
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setErrorMessage('Seu navegador não suporta leitura por voz (Web Speech API).');
        setIsLoading(false);
        setIsSpeaking(false);
        return;
      }

      const list = activeChunksRef.current;
      if (index < 0 || index >= list.length) {
        stop();
        return;
      }

      window.speechSynthesis.cancel();
      currentModeRef.current = 'browser';
      browserChunkIdxRef.current = index;
      setCurrentChunkIndex(index);
      setActiveEngineUsed('browser');
      setIsLoading(false);
      setIsSpeaking(true);
      setIsPaused(false);

      const utterance = new SpeechSynthesisUtterance(list[index]);
      const chosenVoice = pickBestBrowserVoice(effectiveSettings);
      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang || 'pt-BR';
      } else {
        utterance.lang =
          effectiveSettings.language === 'en'
            ? 'en-US'
            : effectiveSettings.language === 'es'
            ? 'es-ES'
            : 'pt-BR';
      }

      utterance.rate = Math.min(2.0, Math.max(0.5, effectiveSettings.speed || 1.0));
      utterance.pitch = effectiveSettings.browserPitch || 1.0;
      utterance.volume = effectiveSettings.browserVolume || 1.0;

      utterance.onend = () => {
        if (sessionIdRef.current !== sessionId) return;
        const nextIdx = index + 1;
        if (nextIdx < activeChunksRef.current.length) {
          playBrowserChunkAt(nextIdx, sessionId, activeSettingsRef.current);
        } else {
          stop();
        }
      };

      utterance.onerror = (ev) => {
        if (sessionIdRef.current !== sessionId) return;
        if (ev.error === 'interrupted' || ev.error === 'canceled') return;
        setErrorMessage(`Erro na leitura pelo navegador (${ev.error}).`);
        setIsSpeaking(false);
        setIsLoading(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [pickBestBrowserVoice, stop]
  );

  const playVoiceStudioChunkAt = useCallback(
    async (index: number, sessionId: number, effectiveSettings: VoiceStudioSettings) => {
      if (sessionIdRef.current !== sessionId) return;
      const list = activeChunksRef.current;
      if (index < 0 || index >= list.length) {
        stop();
        return;
      }

      currentModeRef.current = 'voicestudio';
      setCurrentChunkIndex(index);
      setIsLoading(true);
      setIsPaused(false);

      const controller = abortControllerRef.current || new AbortController();
      abortControllerRef.current = controller;

      const getChunkPromise = (idx: number, timeoutMs: number) => {
        const cached = prefetchCacheRef.current.get(idx);
        if (cached) return cached;
        const p = synthesizeVoiceStudioChunk(
          list[idx],
          effectiveSettings,
          controller.signal,
          timeoutMs
        );
        prefetchCacheRef.current.set(idx, p);
        return p;
      };

      try {
        const timeoutMs =
          index === 0 && effectiveSettings.engineMode === 'auto' ? 7500 : 30000;
        const { blob } = await getChunkPromise(index, timeoutMs);

        if (sessionIdRef.current !== sessionId) return;

        // Pré-carrega o próximo bloco em background enquanto este toca
        if (index + 1 < list.length) {
          void getChunkPromise(index + 1, 30000).catch(() => {
            prefetchCacheRef.current.delete(index + 1);
          });
        }

        if (audioObjectUrlRef.current) {
          URL.revokeObjectURL(audioObjectUrlRef.current);
          audioObjectUrlRef.current = null;
        }
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.onended = null;
          audioRef.current.onerror = null;
        }

        const objUrl = URL.createObjectURL(blob);
        audioObjectUrlRef.current = objUrl;

        const audio = new Audio(objUrl);
        audioRef.current = audio;
        setActiveEngineUsed('voicestudio');
        setFallbackNotice(null);
        setErrorMessage(null);
        setIsLoading(false);
        setIsSpeaking(true);
        setIsPaused(false);

        audio.onended = () => {
          if (sessionIdRef.current !== sessionId) return;
          prefetchCacheRef.current.delete(index);
          const nextIdx = index + 1;
          if (nextIdx < activeChunksRef.current.length) {
            void playVoiceStudioChunkAt(nextIdx, sessionId, activeSettingsRef.current);
          } else {
            stop();
          }
        };

        audio.onerror = () => {
          if (sessionIdRef.current !== sessionId) return;
          setErrorMessage('Falha ao reproduzir o áudio gerado pelo VoiceStudio.');
          setIsSpeaking(false);
          setIsLoading(false);
        };

        await audio.play();
      } catch (err: unknown) {
        if (sessionIdRef.current !== sessionId) return;
        const aborted =
          (err instanceof Error && err.name === 'AbortError') ||
          abortControllerRef.current?.signal.aborted;
        if (aborted) return;

        const msg = err instanceof Error ? err.message : 'VoiceStudio indisponível.';
        if (effectiveSettings.engineMode === 'auto') {
          setFallbackNotice('VoiceStudio offline ou bloqueado — usando voz neural do navegador.');
          playBrowserChunkAt(index, sessionId, effectiveSettings);
        } else {
          setErrorMessage(msg);
          setIsLoading(false);
          setIsSpeaking(false);
        }
      }
    },
    [playBrowserChunkAt, stop]
  );

  const speak = useCallback(
    async ({ id, title, text, overrideSettings }: SpeakOptions) => {
      const mergedSettings: VoiceStudioSettings = {
        ...activeSettingsRef.current,
        ...(overrideSettings || {}),
      };
      activeSettingsRef.current = mergedSettings;

      const normalized = normalizeTextForSpeech(text, mergedSettings.cleanMarkdownBeforeRead);
      if (!normalized) {
        setErrorMessage('Não há texto legível neste conteúdo.');
        return;
      }

      const nextChunks = splitTextIntoSpeechChunks(
        normalized,
        mergedSettings.engineMode === 'browser' ? 650 : 1200
      );
      if (nextChunks.length === 0) return;

      const nextSession = sessionIdRef.current + 1;
      sessionIdRef.current = nextSession;
      cleanupPlaybackResources();
      abortControllerRef.current = new AbortController();

      activeChunksRef.current = nextChunks;
      setChunks(nextChunks);
      setCurrentChunkIndex(0);
      setActiveSourceId(id);
      setActiveTitle(title || 'Leitura em Voz Alta');
      setFallbackNotice(null);
      setErrorMessage(null);
      setIsPaused(false);

      if (mergedSettings.engineMode === 'browser') {
        playBrowserChunkAt(0, nextSession, mergedSettings);
      } else {
        await playVoiceStudioChunkAt(0, nextSession, mergedSettings);
      }
    },
    [cleanupPlaybackResources, playBrowserChunkAt, playVoiceStudioChunkAt]
  );

  const toggleSpeak = useCallback(
    async (opts: SpeakOptions) => {
      if (activeSourceId === opts.id && (isSpeaking || isLoading)) {
        stop();
        return;
      }
      await speak(opts);
    },
    [activeSourceId, isLoading, isSpeaking, speak, stop]
  );

  const pause = useCallback(() => {
    if (currentModeRef.current === 'voicestudio' && audioRef.current) {
      audioRef.current.pause();
      setIsPaused(true);
    } else if (
      currentModeRef.current === 'browser' &&
      typeof window !== 'undefined' &&
      'speechSynthesis' in window
    ) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (currentModeRef.current === 'voicestudio' && audioRef.current) {
      void audioRef.current.play();
      setIsPaused(false);
    } else if (
      currentModeRef.current === 'browser' &&
      typeof window !== 'undefined' &&
      'speechSynthesis' in window
    ) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const nextChunk = useCallback(() => {
    const target = currentChunkIndex + 1;
    if (target >= activeChunksRef.current.length) return;
    const session = sessionIdRef.current;
    if (currentModeRef.current === 'voicestudio') {
      void playVoiceStudioChunkAt(target, session, activeSettingsRef.current);
    } else if (currentModeRef.current === 'browser') {
      playBrowserChunkAt(target, session, activeSettingsRef.current);
    }
  }, [currentChunkIndex, playBrowserChunkAt, playVoiceStudioChunkAt]);

  const prevChunk = useCallback(() => {
    const target = Math.max(0, currentChunkIndex - 1);
    const session = sessionIdRef.current;
    if (currentModeRef.current === 'voicestudio') {
      void playVoiceStudioChunkAt(target, session, activeSettingsRef.current);
    } else if (currentModeRef.current === 'browser') {
      playBrowserChunkAt(target, session, activeSettingsRef.current);
    }
  }, [currentChunkIndex, playBrowserChunkAt, playVoiceStudioChunkAt]);

  const updateSettings = useCallback((patch: Partial<VoiceStudioSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      activeSettingsRef.current = next;
      saveVoiceStudioSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    const fresh = { ...DEFAULT_VOICESTUDIO_SETTINGS };
    setSettings(fresh);
    activeSettingsRef.current = fresh;
    saveVoiceStudioSettings(fresh);
  }, []);

  const cycleSpeed = useCallback(() => {
    const cur = settings.speed || 1.0;
    const idx = SPEED_STEPS.findIndex((s) => Math.abs(s - cur) < 0.05);
    const nextSpeed = SPEED_STEPS[(idx + 1) % SPEED_STEPS.length];
    updateSettings({ speed: nextSpeed });
    if (currentModeRef.current === 'voicestudio' && audioRef.current) {
      // Ajusta playbackRate imediatamente no chunk em curso sem reiniciar áudio
      audioRef.current.playbackRate = Math.min(2.0, Math.max(0.5, nextSpeed / Math.max(0.25, cur)));
    }
  }, [settings.speed, updateSettings]);

  const refreshConnection = useCallback(
    async (customSettings?: VoiceStudioSettings) => {
      const targetSettings = customSettings || activeSettingsRef.current;
      setIsTestingConnection(true);
      try {
        const res = await testVoiceStudioConnection(targetSettings);
        setConnectionStatus(res);
        setAvailableVoices(res.voices);
        setAvailableModels(res.models);
        return res;
      } finally {
        setIsTestingConnection(false);
      }
    },
    []
  );

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);
  const clearMessages = useCallback(() => {
    setFallbackNotice(null);
    setErrorMessage(null);
  }, []);

  return (
    <VoiceStudioContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        isSettingsOpen,
        openSettings,
        closeSettings,
        connectionStatus,
        isTestingConnection,
        refreshConnection,
        availableVoices,
        availableModels,
        browserVoices,
        isSpeaking,
        isPaused,
        isLoading,
        activeSourceId,
        activeTitle,
        activeEngineUsed,
        fallbackNotice,
        errorMessage,
        chunks,
        currentChunkIndex,
        speak,
        toggleSpeak,
        pause,
        resume,
        stop,
        nextChunk,
        prevChunk,
        cycleSpeed,
        clearMessages,
      }}
    >
      {children}
    </VoiceStudioContext.Provider>
  );
};

export function useVoiceStudio(): VoiceStudioContextValue {
  const ctx = useContext(VoiceStudioContext);
  if (!ctx) {
    throw new Error('useVoiceStudio deve ser usado dentro de VoiceStudioProvider.');
  }
  return ctx;
}
