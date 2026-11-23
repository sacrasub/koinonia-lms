'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getAuthorizedUserInfo } from '@/lib/authConfig';
import {
  DEFAULT_VOICESTUDIO_MODELS,
  DEFAULT_VOICESTUDIO_SETTINGS,
  DEFAULT_VOICESTUDIO_VOICES,
  VOICESTUDIO_OVERRIDE_KEY,
  VoiceStudioConnectionResult,
  VoiceStudioModelItem,
  VoiceStudioPlatformDefaults,
  VoiceStudioSettings,
  VoiceStudioVoiceItem,
  buildAudioDownloadFilename,
  clearUserVoiceOverrides,
  fetchPlatformDefaultsFromCloud,
  getFactoryPlatformDefaults,
  invalidateVoiceStudioHealthProbe,
  loadPlatformDefaultsCache,
  loadUserVoiceOverrides,
  mergeMp3Blobs,
  normalizeTextForSpeech,
  probeVoiceStudioStatus,
  publishPlatformDefaultsToCloud,
  resolveEffectiveVoiceStudioSettings,
  saveUserVoiceOverrides,
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

export interface PlatformSaveStatus {
  type: 'success' | 'error';
  message: string;
}

interface VoiceStudioContextValue {
  settings: VoiceStudioSettings;
  platformDefaults: VoiceStudioPlatformDefaults;
  hasCustomOverrides: boolean;
  isAdminUser: boolean;
  isSavingPlatformDefaults: boolean;
  platformSaveStatus: PlatformSaveStatus | null;
  updateSettings: (patch: Partial<VoiceStudioSettings>) => void;
  resetSettings: () => void;
  saveCurrentAsPlatformDefaults: () => Promise<boolean>;
  syncPlatformDefaults: (force?: boolean) => Promise<void>;
  clearPlatformSaveStatus: () => void;
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
  isDownloadingAudio: boolean;
  downloadProgress: { completed: number; total: number } | null;
  downloadStatusMessage: string | null;
  lastDownloadedFile: { url: string; filename: string; sizeBytes: number; blob: Blob } | null;
  downloadCurrentAudio: () => Promise<void>;
  cancelAudioDownload: () => void;
  shareDownloadedAudio: () => Promise<void>;
}

const VoiceStudioContext = createContext<VoiceStudioContextValue | null>(null);

const SPEED_STEPS = [0.85, 1.0, 1.15, 1.3, 1.5];

const MASTER_ADMIN_EMAILS = new Set([
  'sacrasub@gmail.com',
  'sacrasub03@gmail.com',
  'riffocristianmision@gmail.com',
]);

function detectAdminFromStorage(fallbackEmail?: string | null): boolean {
  if (typeof window === 'undefined') return false;
  const email = (fallbackEmail || localStorage.getItem('lms_active_user_email') || '')
    .toLowerCase()
    .trim();
  if (!email) return false;
  if (MASTER_ADMIN_EMAILS.has(email)) return true;
  const authInfo = getAuthorizedUserInfo(email);
  return Boolean(authInfo.isAuthorized && authInfo.user?.roles?.includes('admin'));
}

function computeHasCustomOverrides(
  defaults: VoiceStudioPlatformDefaults,
  overrides: Partial<VoiceStudioSettings>
): boolean {
  for (const [rawKey, val] of Object.entries(overrides)) {
    if (val === undefined) continue;
    const key = rawKey as keyof VoiceStudioSettings;
    if (key === 'apiKey' || key === 'sharePin') {
      if (typeof val === 'string' && val.trim().length > 0) return true;
      continue;
    }
    const baseVal = defaults.settings[key as keyof typeof defaults.settings];
    if (val !== baseVal) return true;
  }
  return false;
}

export const VoiceStudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [platformDefaults, setPlatformDefaults] = useState<VoiceStudioPlatformDefaults>(() =>
    getFactoryPlatformDefaults()
  );
  const [settings, setSettings] = useState<VoiceStudioSettings>(DEFAULT_VOICESTUDIO_SETTINGS);
  const [hasCustomOverrides, setHasCustomOverrides] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isSavingPlatformDefaults, setIsSavingPlatformDefaults] = useState(false);
  const [platformSaveStatus, setPlatformSaveStatus] = useState<PlatformSaveStatus | null>(null);

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
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ completed: number; total: number } | null>(null);
  const [downloadStatusMessage, setDownloadStatusMessage] = useState<string | null>(null);
  const [lastDownloadedFile, setLastDownloadedFile] = useState<{
    url: string;
    filename: string;
    sizeBytes: number;
    blob: Blob;
  } | null>(null);

  const sessionIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioObjectUrlRef = useRef<string | null>(null);
  const prefetchCacheRef = useRef<Map<number, Promise<{ blob: Blob; mimeType: string }>>>(new Map());
  const generatedBlobsRef = useRef<Map<number, { blob: Blob; mimeType: string }>>(new Map());
  const downloadAbortRef = useRef<AbortController | null>(null);
  const lastDownloadUrlRef = useRef<string | null>(null);
  const activeChunksRef = useRef<string[]>([]);
  const platformDefaultsRef = useRef<VoiceStudioPlatformDefaults>(getFactoryPlatformDefaults());
  const userOverridesRef = useRef<Partial<VoiceStudioSettings>>({});
  const activeSettingsRef = useRef<VoiceStudioSettings>(DEFAULT_VOICESTUDIO_SETTINGS);
  const currentModeRef = useRef<'voicestudio' | 'browser' | null>(null);
  const browserChunkIdxRef = useRef(0);

  const applyResolvedState = useCallback(
    (nextDefaults: VoiceStudioPlatformDefaults, nextOverrides: Partial<VoiceStudioSettings>) => {
      platformDefaultsRef.current = nextDefaults;
      userOverridesRef.current = nextOverrides;
      const effective = resolveEffectiveVoiceStudioSettings(nextDefaults, nextOverrides);
      activeSettingsRef.current = effective;
      setPlatformDefaults(nextDefaults);
      setSettings(effective);
      setHasCustomOverrides(computeHasCustomOverrides(nextDefaults, nextOverrides));
      saveVoiceStudioSettings(effective);
      return effective;
    },
    []
  );

  const syncPlatformDefaults = useCallback(
    async (force = false) => {
      const fresh = await fetchPlatformDefaultsFromCloud(force);
      applyResolvedState(fresh, userOverridesRef.current);
    },
    [applyResolvedState]
  );

  useEffect(() => {
    const cachedDefaults = loadPlatformDefaultsCache();
    const loadedOverrides = loadUserVoiceOverrides();
    applyResolvedState(cachedDefaults, loadedOverrides);
    setIsAdminUser(detectAdminFromStorage());

    let mounted = true;
    fetchPlatformDefaultsFromCloud(false).then((fresh) => {
      if (!mounted) return;
      applyResolvedState(fresh, userOverridesRef.current);
    });

    const handleGlobalUpdated = (e: Event) => {
      const detail = (e as CustomEvent<VoiceStudioPlatformDefaults>).detail;
      if (detail) {
        applyResolvedState(detail, userOverridesRef.current);
      }
    };

    const handleRbacUpdated = () => {
      setIsAdminUser(detectAdminFromStorage());
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === VOICESTUDIO_OVERRIDE_KEY) {
        applyResolvedState(platformDefaultsRef.current, loadUserVoiceOverrides());
      } else if (e.key === 'lms_active_user_email' || e.key === 'lms_authorized_users_db') {
        setIsAdminUser(detectAdminFromStorage());
      }
    };

    const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdminUser(detectAdminFromStorage(session?.user?.email));
    });

    window.addEventListener('lms_voicestudio_platform_defaults_updated', handleGlobalUpdated);
    window.addEventListener('lms_rbac_updated', handleRbacUpdated);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      mounted = false;
      authSub?.subscription?.unsubscribe();
      window.removeEventListener('lms_voicestudio_platform_defaults_updated', handleGlobalUpdated);
      window.removeEventListener('lms_rbac_updated', handleRbacUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [applyResolvedState]);

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

  const cleanupDownloadState = useCallback(() => {
    if (downloadAbortRef.current) {
      downloadAbortRef.current.abort();
      downloadAbortRef.current = null;
    }
    generatedBlobsRef.current.clear();
    if (lastDownloadUrlRef.current) {
      try {
        URL.revokeObjectURL(lastDownloadUrlRef.current);
      } catch {}
      lastDownloadUrlRef.current = null;
    }
    setIsDownloadingAudio(false);
    setDownloadProgress(null);
    setDownloadStatusMessage(null);
    setLastDownloadedFile(null);
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
      cleanupDownloadState();
    };
  }, [cleanupDownloadState, cleanupPlaybackResources]);

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
      const isPtBr = (v: SpeechSynthesisVoice) => v.lang.toLowerCase() === 'pt-br';
      const isNatural = (v: SpeechSynthesisVoice) =>
        /(natural|neural|online|microsoft|google)/i.test(v.name);
      const isMalePtBr = (v: SpeechSynthesisVoice) =>
        /(antonio|antônio|fabio|fábio|donato|humberto|julio|júlio|nicolau|valerio|valério|daniel|ricardo|felipe|rafael|tiago|thiago|lucas|masculin|male)/i.test(
          v.name
        );

      const ptBrNaturalMale = browserVoices.find((v) => isPtBr(v) && isNatural(v) && isMalePtBr(v));
      if (ptBrNaturalMale) return ptBrNaturalMale;
      const ptBrAnyMale = browserVoices.find((v) => isPtBr(v) && isMalePtBr(v));
      if (ptBrAnyMale) return ptBrAnyMale;
      const ptBrNatural = browserVoices.find((v) => isPtBr(v) && isNatural(v));
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
        ).then((res) => {
          if (sessionIdRef.current === sessionId) {
            generatedBlobsRef.current.set(idx, res);
          }
          return res;
        });
        prefetchCacheRef.current.set(idx, p);
        return p;
      };

      try {
        if (index === 0 && effectiveSettings.engineMode === 'auto') {
          const status = await probeVoiceStudioStatus(effectiveSettings, 1200);
          if (sessionIdRef.current !== sessionId) return;
          if (!status.ok) {
            setFallbackNotice('Usando voz neural do navegador (pt-BR).');
            playBrowserChunkAt(index, sessionId, effectiveSettings);
            return;
          }
        }

        const { blob } = await getChunkPromise(index, 180000);

        if (sessionIdRef.current !== sessionId) return;

        // Pré-carrega o próximo bloco em background enquanto este toca
        if (index + 1 < list.length) {
          void getChunkPromise(index + 1, 180000).catch(() => {
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
        const userAborted = Boolean(abortControllerRef.current?.signal.aborted);
        if (userAborted) return;

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

      const nextSession = sessionIdRef.current + 1;
      sessionIdRef.current = nextSession;
      cleanupPlaybackResources();
      cleanupDownloadState();
      abortControllerRef.current = new AbortController();

      setCurrentChunkIndex(0);
      setActiveSourceId(id);
      setActiveTitle(title || 'Leitura em Voz Alta');
      setFallbackNotice(null);
      setErrorMessage(null);
      setIsPaused(false);

      if (mergedSettings.engineMode === 'browser') {
        const nextChunks = splitTextIntoSpeechChunks(normalized, 650);
        if (nextChunks.length === 0) return;
        activeChunksRef.current = nextChunks;
        setChunks(nextChunks);
        playBrowserChunkAt(0, nextSession, mergedSettings);
        return;
      }

      setIsLoading(true);
      const status = await probeVoiceStudioStatus(mergedSettings, 1200).catch(() => ({
        ok: false,
        activeEngine: undefined,
      }));
      if (sessionIdRef.current !== nextSession) return;

      if (!status.ok && mergedSettings.engineMode === 'auto') {
        const browserChunks = splitTextIntoSpeechChunks(normalized, 650);
        if (browserChunks.length === 0) {
          setIsLoading(false);
          return;
        }
        activeChunksRef.current = browserChunks;
        setChunks(browserChunks);
        setFallbackNotice('Usando voz neural do navegador (pt-BR).');
        playBrowserChunkAt(0, nextSession, mergedSettings);
        return;
      }

      const modelId = (mergedSettings.model || '').trim().toLowerCase();
      const isOpenAiAlias =
        !modelId || modelId === 'tts-1' || modelId === 'tts-1-hd' || modelId.startsWith('gpt-4o');
      const resolvedEngine = (isOpenAiAlias ? status.activeEngine || '' : modelId).toLowerCase();
      const isFastCpuEngine = resolvedEngine === 'sherpa-onnx' || resolvedEngine === 'kittentts';
      const chunkSize = isFastCpuEngine ? 950 : 280;

      const nextChunks = splitTextIntoSpeechChunks(normalized, chunkSize);
      if (nextChunks.length === 0) {
        setIsLoading(false);
        return;
      }

      activeChunksRef.current = nextChunks;
      setChunks(nextChunks);
      await playVoiceStudioChunkAt(0, nextSession, mergedSettings);
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

  const updateSettings = useCallback(
    (patch: Partial<VoiceStudioSettings>) => {
      const nextOverrides: Partial<VoiceStudioSettings> = {
        ...userOverridesRef.current,
        ...patch,
      };
      if (nextOverrides.apiKey === '') delete nextOverrides.apiKey;
      if (nextOverrides.sharePin === '') delete nextOverrides.sharePin;

      saveUserVoiceOverrides(nextOverrides);
      applyResolvedState(platformDefaultsRef.current, nextOverrides);

      if (
        patch.serverUrl !== undefined ||
        patch.useServerProxy !== undefined ||
        patch.apiKey !== undefined ||
        patch.sharePin !== undefined
      ) {
        invalidateVoiceStudioHealthProbe();
      }
    },
    [applyResolvedState]
  );

  const resetSettings = useCallback(() => {
    clearUserVoiceOverrides();
    applyResolvedState(platformDefaultsRef.current, {});
    setPlatformSaveStatus(null);
    invalidateVoiceStudioHealthProbe();
  }, [applyResolvedState]);

  const saveCurrentAsPlatformDefaults = useCallback(async (): Promise<boolean> => {
    setIsSavingPlatformDefaults(true);
    setPlatformSaveStatus(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setPlatformSaveStatus({
          type: 'error',
          message:
            'Sessão expirada. Faça login novamente com sua conta Admin para atualizar o padrão global.',
        });
        return false;
      }

      const actorName =
        session.user?.user_metadata?.full_name ||
        session.user?.user_metadata?.name ||
        session.user?.email;

      const res = await publishPlatformDefaultsToCloud(
        activeSettingsRef.current,
        session.access_token,
        actorName
      );

      if (!res.ok || !res.defaults) {
        setPlatformSaveStatus({
          type: 'error',
          message: res.error || 'Não foi possível salvar o padrão global.',
        });
        return false;
      }

      const keptSecrets: Partial<VoiceStudioSettings> = {};
      if (userOverridesRef.current.apiKey) keptSecrets.apiKey = userOverridesRef.current.apiKey;
      if (userOverridesRef.current.sharePin) keptSecrets.sharePin = userOverridesRef.current.sharePin;

      saveUserVoiceOverrides(keptSecrets);
      applyResolvedState(res.defaults, keptSecrets);
      setPlatformSaveStatus({
        type: 'success',
        message:
          'Padrão global atualizado! Todos os usuários herdarão esta configuração automaticamente.',
      });
      return true;
    } finally {
      setIsSavingPlatformDefaults(false);
    }
  }, [applyResolvedState]);

  const clearPlatformSaveStatus = useCallback(() => setPlatformSaveStatus(null), []);

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
      invalidateVoiceStudioHealthProbe(targetSettings.serverUrl);
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

  const openSettings = useCallback(() => {
    setIsSettingsOpen(true);
    setPlatformSaveStatus(null);
    setIsAdminUser(detectAdminFromStorage());
    void syncPlatformDefaults(false);
    const cur = activeSettingsRef.current;
    if (!connectionStatus && cur.engineMode !== 'browser') {
      void refreshConnection(cur);
    }
  }, [connectionStatus, refreshConnection, syncPlatformDefaults]);

  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  const triggerBrowserDownload = useCallback((url: string, filename: string) => {
    if (typeof document === 'undefined') return;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        document.body.removeChild(a);
      } catch {}
    }, 100);
  }, []);

  const cancelAudioDownload = useCallback(() => {
    if (downloadAbortRef.current) {
      downloadAbortRef.current.abort();
      downloadAbortRef.current = null;
    }
    setIsDownloadingAudio(false);
    setDownloadProgress(null);
    setDownloadStatusMessage('Download do MP3 cancelado.');
  }, []);

  const downloadCurrentAudio = useCallback(async () => {
    if (isDownloadingAudio) return;
    const list = [...activeChunksRef.current];
    if (list.length === 0) return;

    if (lastDownloadedFile) {
      triggerBrowserDownload(lastDownloadedFile.url, lastDownloadedFile.filename);
      return;
    }

    const dlController = new AbortController();
    downloadAbortRef.current = dlController;
    setIsDownloadingAudio(true);
    setDownloadProgress({ completed: 0, total: list.length });
    setDownloadStatusMessage(null);

    try {
      const effective = activeSettingsRef.current;
      const status = await probeVoiceStudioStatus(effective, 1500);
      if (dlController.signal.aborted) return;

      if (!status.ok) {
        setDownloadStatusMessage(
          'Para baixar em MP3, mantenha o VoiceStudio aberto no PC (a voz nativa do navegador não exporta arquivo de áudio).'
        );
        return;
      }

      const mp3Settings: VoiceStudioSettings = {
        ...effective,
        responseFormat: 'mp3',
      };
      const isAlreadyMp3 = (effective.responseFormat || 'mp3') === 'mp3';
      const orderedBlobs: Blob[] = [];

      for (let i = 0; i < list.length; i++) {
        if (dlController.signal.aborted) {
          return;
        }

        const cachedChunk = generatedBlobsRef.current.get(i);
        let chunkBlob: Blob | null = null;

        if (cachedChunk && /mpeg|mp3/i.test(cachedChunk.mimeType)) {
          chunkBlob = cachedChunk.blob;
        } else if (isAlreadyMp3 && prefetchCacheRef.current.has(i)) {
          try {
            const prefetched = await prefetchCacheRef.current.get(i);
            if (prefetched && /mpeg|mp3/i.test(prefetched.mimeType)) {
              generatedBlobsRef.current.set(i, prefetched);
              chunkBlob = prefetched.blob;
            }
          } catch {
            // regera abaixo com dlController
          }
        }

        if (!chunkBlob) {
          const generated = await synthesizeVoiceStudioChunk(
            list[i],
            mp3Settings,
            dlController.signal,
            180000
          );
          if (dlController.signal.aborted) {
            return;
          }
          if (isAlreadyMp3) {
            generatedBlobsRef.current.set(i, generated);
          }
          chunkBlob = generated.blob;
        }

        orderedBlobs.push(chunkBlob);
        setDownloadProgress({ completed: i + 1, total: list.length });
      }

      if (dlController.signal.aborted) return;

      const mergedBlob = await mergeMp3Blobs(orderedBlobs);
      const filename = buildAudioDownloadFilename(activeTitle || 'Audio_Koinonia_LMS');

      if (lastDownloadUrlRef.current) {
        try {
          URL.revokeObjectURL(lastDownloadUrlRef.current);
        } catch {}
      }
      const url = URL.createObjectURL(mergedBlob);
      lastDownloadUrlRef.current = url;
      setLastDownloadedFile({ url, filename, sizeBytes: mergedBlob.size, blob: mergedBlob });
      triggerBrowserDownload(url, filename);

      const kb = Math.round(mergedBlob.size / 1024);
      const sizeLabel = kb >= 1024 ? `${(mergedBlob.size / (1024 * 1024)).toFixed(1)} MB` : `${kb} KB`;
      setDownloadStatusMessage(`MP3 baixado (${sizeLabel})! Pronto para enviar no WhatsApp.`);
    } catch (err: unknown) {
      if (dlController.signal.aborted) return;
      const msg = err instanceof Error ? err.message : 'Não foi possível gerar o MP3 completo.';
      setDownloadStatusMessage(msg);
    } finally {
      if (downloadAbortRef.current === dlController) {
        downloadAbortRef.current = null;
      }
      setIsDownloadingAudio(false);
      setDownloadProgress(null);
    }
  }, [activeTitle, isDownloadingAudio, lastDownloadedFile, triggerBrowserDownload]);

  const shareDownloadedAudio = useCallback(async () => {
    if (!lastDownloadedFile) return;
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        const file = new File([lastDownloadedFile.blob], lastDownloadedFile.filename, {
          type: 'audio/mpeg',
        });
        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: activeTitle || 'Áudio Koinonia LMS',
            files: [file],
          });
          return;
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }
    triggerBrowserDownload(lastDownloadedFile.url, lastDownloadedFile.filename);
  }, [activeTitle, lastDownloadedFile, triggerBrowserDownload]);

  const clearMessages = useCallback(() => {
    setFallbackNotice(null);
    setErrorMessage(null);
    cleanupDownloadState();
  }, [cleanupDownloadState]);

  return (
    <VoiceStudioContext.Provider
      value={{
        settings,
        platformDefaults,
        hasCustomOverrides,
        isAdminUser,
        isSavingPlatformDefaults,
        platformSaveStatus,
        updateSettings,
        resetSettings,
        saveCurrentAsPlatformDefaults,
        syncPlatformDefaults,
        clearPlatformSaveStatus,
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
        isDownloadingAudio,
        downloadProgress,
        downloadStatusMessage,
        lastDownloadedFile,
        downloadCurrentAudio,
        cancelAudioDownload,
        shareDownloadedAudio,
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
