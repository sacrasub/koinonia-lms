export type VoiceStudioEngineMode = 'auto' | 'voicestudio' | 'browser';
export type VoiceStudioResponseFormat = 'mp3' | 'wav' | 'opus';

export interface VoiceStudioVoiceItem {
  voice_id: string;
  name: string;
  type?: string;
  language?: string | null;
  description?: string;
}

export interface VoiceStudioModelItem {
  id: string;
  owned_by?: string;
}

export interface VoiceStudioSettings {
  engineMode: VoiceStudioEngineMode;
  serverUrl: string;
  useServerProxy: boolean;
  apiKey: string;
  sharePin: string;
  model: string;
  voice: string;
  language: string;
  speed: number;
  responseFormat: VoiceStudioResponseFormat;
  instruct: string;
  voiceDescription: string;
  denoise: boolean;
  seed: number | null;
  guidanceScale: number | null;
  numStep: number | null;
  browserVoiceURI: string;
  browserPitch: number;
  browserVolume: number;
  cleanMarkdownBeforeRead: boolean;
  enableSelectionPopup: boolean;
}

export interface VoiceStudioConnectionResult {
  ok: boolean;
  statusCode?: number;
  activeEngine?: string;
  device?: string;
  voices: VoiceStudioVoiceItem[];
  models: VoiceStudioModelItem[];
  error?: string;
  corsHint?: string;
}

export type VoiceStudioSharedSettings = Omit<VoiceStudioSettings, 'apiKey' | 'sharePin'>;

export interface VoiceStudioPlatformDefaults {
  version: number;
  updatedAt: string;
  updatedBy?: string;
  settings: VoiceStudioSharedSettings;
}

export interface VoiceStudioUserOverridesState {
  overrides: Partial<VoiceStudioSettings>;
  updatedAt?: string;
  migratedFromV1?: boolean;
}

export const VOICESTUDIO_STORAGE_KEY = 'lms_voicestudio_settings_v1';
export const VOICESTUDIO_GLOBAL_CACHE_KEY = 'lms_voicestudio_platform_defaults_v1';
export const VOICESTUDIO_GLOBAL_FETCH_TS_KEY = 'lms_voicestudio_platform_defaults_ts';
export const VOICESTUDIO_OVERRIDE_KEY = 'lms_voicestudio_user_overrides_v2';
export const PLATFORM_DEFAULTS_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 horas (Blindagem de Egress)

export const DEFAULT_VOICESTUDIO_SETTINGS: VoiceStudioSettings = {
  engineMode: 'auto',
  serverUrl: 'http://127.0.0.1:3900',
  useServerProxy: false,
  apiKey: '',
  sharePin: '',
  model: 'tts-1',
  voice: 'default',
  language: 'pt',
  speed: 1.0,
  responseFormat: 'mp3',
  instruct: '',
  voiceDescription: '',
  denoise: false,
  seed: null,
  guidanceScale: null,
  numStep: null,
  browserVoiceURI: '',
  browserPitch: 1.0,
  browserVolume: 1.0,
  cleanMarkdownBeforeRead: true,
  enableSelectionPopup: true,
};

export const DEFAULT_VOICESTUDIO_MODELS: VoiceStudioModelItem[] = [
  { id: 'tts-1', owned_by: 'Automático → Engine Ativa no VoiceStudio' },
  { id: 'sherpa-onnx', owned_by: 'Sherpa-ONNX / Piper pt-BR Miro High (Ultra-rápida & Natural • CPU)' },
  { id: 'omnivoice-gguf', owned_by: 'OmniVoice GGUF (Vulkan AMD/Intel & CPU leve)' },
  { id: 'supertonic3', owned_by: 'Supertonic-3 (ONNX Leve CPU)' },
  { id: 'omnivoice', owned_by: 'VoiceStudio PyTorch (Padrão)' },
  { id: 'voxcpm2', owned_by: 'VoiceStudio Engine' },
  { id: 'cosyvoice', owned_by: 'VoiceStudio Engine' },
  { id: 'kittentts', owned_by: 'VoiceStudio Engine (Leve/CPU)' },
  { id: 'moss-tts-nano', owned_by: 'MOSS-TTS-Nano (Clonagem de Voz • pt-BR • CPU)' },
  { id: 'mlx-audio', owned_by: 'VoiceStudio Apple Silicon' },
  { id: 'tts-1-hd', owned_by: 'Alias OpenAI HD → Engine Ativa' },
];

export const DEFAULT_VOICESTUDIO_VOICES: VoiceStudioVoiceItem[] = [
  {
    voice_id: 'default',
    name: 'Padrão da Engine Ativa (default)',
    type: 'builtin',
    description: 'Usa a voz padrão do modelo carregado no VoiceStudio',
  },
  { voice_id: 'alloy', name: 'Alloy (Alias OpenAI)', type: 'openai_alias' },
  { voice_id: 'nova', name: 'Nova (Alias OpenAI)', type: 'openai_alias' },
  { voice_id: 'onyx', name: 'Onyx (Alias OpenAI)', type: 'openai_alias' },
  { voice_id: 'shimmer', name: 'Shimmer (Alias OpenAI)', type: 'openai_alias' },
  { voice_id: 'echo', name: 'Echo (Alias OpenAI)', type: 'openai_alias' },
  { voice_id: 'fable', name: 'Fable (Alias OpenAI)', type: 'openai_alias' },
  { voice_id: 'ash', name: 'Ash (Alias OpenAI)', type: 'openai_alias' },
  { voice_id: 'coral', name: 'Coral (Alias OpenAI)', type: 'openai_alias' },
  { voice_id: 'sage', name: 'Sage (Alias OpenAI)', type: 'openai_alias' },
];

export const STYLE_INSTRUCT_PRESETS: { label: string; value: string }[] = [
  {
    label: 'Didático & Claro',
    value: 'Tom didático de professor universitário, articulação clara e ritmo pausado.',
  },
  {
    label: 'Devocional & Sereno',
    value: 'Voz calma, acolhedora, reverente e serena para leitura teológica.',
  },
  {
    label: 'Revisão Ágil AV2',
    value: 'Tom objetivo, firme e energético para revisão rápida de pontos de prova.',
  },
  {
    label: 'Acadêmico Formal',
    value: 'Entonação acadêmica formal, precisa e solene para leitura de artigo científico.',
  },
];

export function normalizeServerUrl(url: string): string {
  const trimmed = (url || '').trim().replace(/\/+$/, '');
  return trimmed || DEFAULT_VOICESTUDIO_SETTINGS.serverUrl;
}

export function isLoopbackServerUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeServerUrl(url));
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '127.1' ||
      host === '[::1]' ||
      host === '::1' ||
      host === '0.0.0.0'
    );
  } catch {
    return /^(https?:\/\/)?(localhost|127\.0\.0\.1|\[::1\])/i.test(url || '');
  }
}

export function shouldUseRemoteProxy(settings: VoiceStudioSettings): boolean {
  return settings.useServerProxy && !isLoopbackServerUrl(settings.serverUrl);
}

export function sanitizePlatformVoiceDefaults(raw: unknown): VoiceStudioSharedSettings {
  const src = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const validMode: VoiceStudioEngineMode =
    src.engineMode === 'auto' || src.engineMode === 'voicestudio' || src.engineMode === 'browser'
      ? src.engineMode
      : DEFAULT_VOICESTUDIO_SETTINGS.engineMode;

  const validFormat: VoiceStudioResponseFormat =
    src.responseFormat === 'mp3' || src.responseFormat === 'wav' || src.responseFormat === 'opus'
      ? src.responseFormat
      : DEFAULT_VOICESTUDIO_SETTINGS.responseFormat;

  let serverUrl = DEFAULT_VOICESTUDIO_SETTINGS.serverUrl;
  if (typeof src.serverUrl === 'string' && src.serverUrl.trim()) {
    try {
      const parsed = new URL(normalizeServerUrl(src.serverUrl));
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        serverUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/+$/, '');
      }
    } catch {
      serverUrl = DEFAULT_VOICESTUDIO_SETTINGS.serverUrl;
    }
  }

  const useServerProxy = isLoopbackServerUrl(serverUrl) ? false : Boolean(src.useServerProxy);
  const rawModel = typeof src.model === 'string' ? src.model.trim() : '';
  const model = rawModel || DEFAULT_VOICESTUDIO_SETTINGS.model;
  const rawVoice = typeof src.voice === 'string' ? src.voice.trim() : '';
  const voice = rawVoice || DEFAULT_VOICESTUDIO_SETTINGS.voice;
  const rawLang = typeof src.language === 'string' ? src.language.trim() : '';
  const language = rawLang || DEFAULT_VOICESTUDIO_SETTINGS.language;

  const parseNullableInt = (v: unknown, min: number, max: number): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return Math.min(max, Math.max(min, Math.trunc(n)));
  };

  const parseNullableFloat = (v: unknown, min: number, max: number): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return Math.min(max, Math.max(min, n));
  };

  return {
    engineMode: validMode,
    serverUrl,
    useServerProxy,
    model,
    voice,
    language,
    speed: clampNumber(src.speed, 0.5, 2.0, DEFAULT_VOICESTUDIO_SETTINGS.speed),
    responseFormat: validFormat,
    instruct: typeof src.instruct === 'string' ? src.instruct.trim().slice(0, 500) : '',
    voiceDescription: typeof src.voiceDescription === 'string' ? src.voiceDescription.trim().slice(0, 500) : '',
    denoise: Boolean(src.denoise),
    seed: parseNullableInt(src.seed, 0, 2147483647),
    guidanceScale: parseNullableFloat(src.guidanceScale, 0.1, 20),
    numStep: parseNullableInt(src.numStep, 1, 64),
    browserVoiceURI: typeof src.browserVoiceURI === 'string' ? src.browserVoiceURI.slice(0, 240) : '',
    browserPitch: clampNumber(src.browserPitch, 0.5, 2.0, DEFAULT_VOICESTUDIO_SETTINGS.browserPitch),
    browserVolume: clampNumber(src.browserVolume, 0.1, 1.0, DEFAULT_VOICESTUDIO_SETTINGS.browserVolume),
    cleanMarkdownBeforeRead:
      typeof src.cleanMarkdownBeforeRead === 'boolean'
        ? src.cleanMarkdownBeforeRead
        : DEFAULT_VOICESTUDIO_SETTINGS.cleanMarkdownBeforeRead,
    enableSelectionPopup:
      typeof src.enableSelectionPopup === 'boolean'
        ? src.enableSelectionPopup
        : DEFAULT_VOICESTUDIO_SETTINGS.enableSelectionPopup,
  };
}

function sanitizeUserOverrides(raw: unknown): Partial<VoiceStudioSettings> {
  if (!raw || typeof raw !== 'object') return {};
  const src = raw as Record<string, unknown>;
  const out: Partial<VoiceStudioSettings> = {};

  if (src.engineMode === 'auto' || src.engineMode === 'voicestudio' || src.engineMode === 'browser') {
    out.engineMode = src.engineMode;
  }
  if (typeof src.serverUrl === 'string' && src.serverUrl.trim()) {
    out.serverUrl = normalizeServerUrl(src.serverUrl);
  }
  if (typeof src.useServerProxy === 'boolean') {
    out.useServerProxy = src.useServerProxy;
  }
  if (typeof src.apiKey === 'string') out.apiKey = src.apiKey;
  if (typeof src.sharePin === 'string') out.sharePin = src.sharePin;
  if (typeof src.model === 'string' && src.model.trim()) out.model = src.model.trim();
  if (typeof src.voice === 'string' && src.voice.trim()) out.voice = src.voice.trim();
  if (typeof src.language === 'string' && src.language.trim()) out.language = src.language.trim();
  if (src.speed !== undefined) out.speed = clampNumber(src.speed, 0.25, 4.0, 1.0);
  if (src.responseFormat === 'mp3' || src.responseFormat === 'wav' || src.responseFormat === 'opus') {
    out.responseFormat = src.responseFormat;
  }
  if (typeof src.instruct === 'string') out.instruct = src.instruct.slice(0, 500);
  if (typeof src.voiceDescription === 'string') out.voiceDescription = src.voiceDescription.slice(0, 500);
  if (typeof src.denoise === 'boolean') out.denoise = src.denoise;
  if ('seed' in src) {
    out.seed = src.seed !== null && src.seed !== undefined && src.seed !== '' ? Number(src.seed) : null;
  }
  if ('guidanceScale' in src) {
    out.guidanceScale =
      src.guidanceScale !== null && src.guidanceScale !== undefined && src.guidanceScale !== ''
        ? Number(src.guidanceScale)
        : null;
  }
  if ('numStep' in src) {
    out.numStep =
      src.numStep !== null && src.numStep !== undefined && src.numStep !== '' ? Number(src.numStep) : null;
  }
  if (typeof src.browserVoiceURI === 'string') out.browserVoiceURI = src.browserVoiceURI.slice(0, 240);
  if (src.browserPitch !== undefined) out.browserPitch = clampNumber(src.browserPitch, 0.5, 2.0, 1.0);
  if (src.browserVolume !== undefined) out.browserVolume = clampNumber(src.browserVolume, 0.1, 1.0, 1.0);
  if (typeof src.cleanMarkdownBeforeRead === 'boolean') {
    out.cleanMarkdownBeforeRead = src.cleanMarkdownBeforeRead;
  }
  if (typeof src.enableSelectionPopup === 'boolean') {
    out.enableSelectionPopup = src.enableSelectionPopup;
  }

  return out;
}

export function getFactoryPlatformDefaults(): VoiceStudioPlatformDefaults {
  return {
    version: 1,
    updatedAt: '',
    updatedBy: 'Padrão Oficial da Plataforma',
    settings: sanitizePlatformVoiceDefaults(DEFAULT_VOICESTUDIO_SETTINGS),
  };
}

export function loadPlatformDefaultsCache(): VoiceStudioPlatformDefaults {
  const factory = getFactoryPlatformDefaults();
  if (typeof window === 'undefined') return factory;
  try {
    const raw = localStorage.getItem(VOICESTUDIO_GLOBAL_CACHE_KEY);
    if (!raw) return factory;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return factory;
    return {
      version: Number(parsed.version) || 1,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
      updatedBy: typeof parsed.updatedBy === 'string' ? parsed.updatedBy : factory.updatedBy,
      settings: sanitizePlatformVoiceDefaults(parsed.settings || parsed),
    };
  } catch {
    return factory;
  }
}

export function savePlatformDefaultsCache(defaults: VoiceStudioPlatformDefaults): void {
  if (typeof window === 'undefined') return;
  try {
    const sanitized: VoiceStudioPlatformDefaults = {
      version: Number(defaults.version) || Date.now(),
      updatedAt: defaults.updatedAt || new Date().toISOString(),
      updatedBy: defaults.updatedBy || 'Administração Koinonia',
      settings: sanitizePlatformVoiceDefaults(defaults.settings),
    };
    localStorage.setItem(VOICESTUDIO_GLOBAL_CACHE_KEY, JSON.stringify(sanitized));
    localStorage.setItem(VOICESTUDIO_GLOBAL_FETCH_TS_KEY, String(Date.now()));
  } catch {
    // ignora quota de localStorage
  }
}

export async function fetchPlatformDefaultsFromCloud(force = false): Promise<VoiceStudioPlatformDefaults> {
  const cached = loadPlatformDefaultsCache();
  if (typeof window === 'undefined') return cached;

  if (!force) {
    const lastFetch = Number(localStorage.getItem(VOICESTUDIO_GLOBAL_FETCH_TS_KEY) || 0);
    if (lastFetch > 0 && Date.now() - lastFetch < PLATFORM_DEFAULTS_CACHE_TTL_MS) {
      return cached;
    }
  }

  try {
    const endpoint = force ? '/api/tts/voicestudio/defaults?fresh=1' : '/api/tts/voicestudio/defaults';
    const res = await fetch(endpoint, { method: 'GET', cache: force ? 'no-store' : 'default' });
    if (!res.ok) return cached;
    const json = await res.json().catch(() => null);
    if (!json?.defaults) return cached;

    const normalized: VoiceStudioPlatformDefaults = {
      version: Number(json.defaults.version) || 1,
      updatedAt: typeof json.defaults.updatedAt === 'string' ? json.defaults.updatedAt : '',
      updatedBy:
        typeof json.defaults.updatedBy === 'string'
          ? json.defaults.updatedBy
          : 'Padrão Oficial da Plataforma',
      settings: sanitizePlatformVoiceDefaults(json.defaults.settings),
    };
    savePlatformDefaultsCache(normalized);
    return normalized;
  } catch {
    return cached;
  }
}

export async function publishPlatformDefaultsToCloud(
  settings: VoiceStudioSettings,
  accessToken: string,
  updatedByName?: string
): Promise<{ ok: boolean; defaults?: VoiceStudioPlatformDefaults; error?: string }> {
  try {
    const res = await fetch('/api/tts/voicestudio/defaults', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        settings: sanitizePlatformVoiceDefaults(settings),
        updatedByName,
      }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.defaults) {
      return {
        ok: false,
        error: json?.error || `Erro HTTP ${res.status} ao salvar padrão global.`,
      };
    }

    const saved: VoiceStudioPlatformDefaults = {
      version: Number(json.defaults.version) || Date.now(),
      updatedAt: typeof json.defaults.updatedAt === 'string' ? json.defaults.updatedAt : new Date().toISOString(),
      updatedBy:
        typeof json.defaults.updatedBy === 'string' ? json.defaults.updatedBy : updatedByName || 'Admin',
      settings: sanitizePlatformVoiceDefaults(json.defaults.settings),
    };
    savePlatformDefaultsCache(saved);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lms_voicestudio_platform_defaults_updated', { detail: saved }));
    }
    return { ok: true, defaults: saved };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha de rede ao publicar padrão global.',
    };
  }
}

export function saveUserVoiceOverrides(overrides: Partial<VoiceStudioSettings>): void {
  if (typeof window === 'undefined') return;
  try {
    const clean = sanitizeUserOverrides(overrides);
    const state: VoiceStudioUserOverridesState = {
      overrides: clean,
      updatedAt: new Date().toISOString(),
      migratedFromV1: true,
    };
    localStorage.setItem(VOICESTUDIO_OVERRIDE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[VoiceStudio] Não foi possível salvar sobrescritas do usuário:', err);
  }
}

export function clearUserVoiceOverrides(): void {
  if (typeof window === 'undefined') return;
  try {
    const state: VoiceStudioUserOverridesState = {
      overrides: {},
      updatedAt: new Date().toISOString(),
      migratedFromV1: true,
    };
    localStorage.setItem(VOICESTUDIO_OVERRIDE_KEY, JSON.stringify(state));
  } catch {
    // ignora
  }
}

export function loadUserVoiceOverrides(): Partial<VoiceStudioSettings> {
  if (typeof window === 'undefined') return {};
  try {
    const rawV2 = localStorage.getItem(VOICESTUDIO_OVERRIDE_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as VoiceStudioUserOverridesState;
      if (parsed && typeof parsed === 'object' && parsed.overrides) {
        return sanitizeUserOverrides(parsed.overrides);
      }
      return {};
    }

    // Migração única de lms_voicestudio_settings_v1 para v2:
    // Preserva URL customizada, credenciais, estilo e voz escolhida no navegador,
    // mas descarta model:'omnivoice' e speed legados para herdar o padrão global oficial.
    const rawV1 = localStorage.getItem(VOICESTUDIO_STORAGE_KEY);
    const migrated: Partial<VoiceStudioSettings> = {};
    if (rawV1) {
      try {
        const v1 = JSON.parse(rawV1) as Record<string, unknown>;
        if (v1 && typeof v1 === 'object') {
          if (typeof v1.serverUrl === 'string' && v1.serverUrl.trim()) {
            const normUrl = normalizeServerUrl(v1.serverUrl);
            if (normUrl !== DEFAULT_VOICESTUDIO_SETTINGS.serverUrl) {
              migrated.serverUrl = normUrl;
              migrated.useServerProxy = isLoopbackServerUrl(normUrl) ? false : Boolean(v1.useServerProxy);
            }
          }
          if (typeof v1.apiKey === 'string' && v1.apiKey.trim()) migrated.apiKey = v1.apiKey;
          if (typeof v1.sharePin === 'string' && v1.sharePin.trim()) migrated.sharePin = v1.sharePin;
          if (typeof v1.instruct === 'string' && v1.instruct.trim()) migrated.instruct = v1.instruct.slice(0, 500);
          if (typeof v1.voiceDescription === 'string' && v1.voiceDescription.trim()) {
            migrated.voiceDescription = v1.voiceDescription.slice(0, 500);
          }
          if (typeof v1.browserVoiceURI === 'string' && v1.browserVoiceURI.trim()) {
            migrated.browserVoiceURI = v1.browserVoiceURI;
          }
          if (v1.engineMode === 'browser' || v1.engineMode === 'voicestudio') {
            migrated.engineMode = v1.engineMode;
          }
        }
      } catch {
        // ignora V1 inválido
      }
    }
    saveUserVoiceOverrides(migrated);
    return migrated;
  } catch {
    return {};
  }
}

export function resolveEffectiveVoiceStudioSettings(
  platformDefaults: VoiceStudioPlatformDefaults,
  overrides: Partial<VoiceStudioSettings>
): VoiceStudioSettings {
  const merged = {
    ...DEFAULT_VOICESTUDIO_SETTINGS,
    ...platformDefaults.settings,
    ...overrides,
  };
  const normUrl = normalizeServerUrl(merged.serverUrl);
  return {
    ...merged,
    serverUrl: normUrl,
    useServerProxy: isLoopbackServerUrl(normUrl) ? false : Boolean(merged.useServerProxy),
    speed: clampNumber(merged.speed, 0.25, 4.0, DEFAULT_VOICESTUDIO_SETTINGS.speed),
    browserPitch: clampNumber(merged.browserPitch, 0.5, 2.0, DEFAULT_VOICESTUDIO_SETTINGS.browserPitch),
    browserVolume: clampNumber(merged.browserVolume, 0.1, 1.0, DEFAULT_VOICESTUDIO_SETTINGS.browserVolume),
  };
}

export function loadVoiceStudioSettings(): VoiceStudioSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_VOICESTUDIO_SETTINGS };
  return resolveEffectiveVoiceStudioSettings(loadPlatformDefaultsCache(), loadUserVoiceOverrides());
}

export function saveVoiceStudioSettings(settings: VoiceStudioSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VOICESTUDIO_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('lms_voicestudio_settings_updated', { detail: settings }));
  } catch (err) {
    console.warn('[VoiceStudio] Não foi possível salvar preferências locais:', err);
  }
}

function clampNumber(val: unknown, min: number, max: number, fallback: number): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function normalizeTextForSpeech(raw: string, cleanMarkdown = true): string {
  if (!raw) return '';
  let text = String(raw).replace(/\r\n/g, '\n');

  if (!cleanMarkdown) {
    return text.replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ').trim();
  }

  // Remove URLs cruas para não soletrar https barra barra...
  text = text.replace(/https?:\/\/[^\s)]+/gi, '');

  // Remove emojis e símbolos visuais decorativos frequentes na plataforma
  text = text.replace(
    /[📌❓💡🎯✨📖↳•🎙️🔊📋⚪🟢🔴🟡🟣🔵🔥⚡🏆✅❌⚠️⚙️🪄📄🎓📚🗂️📂🎬💬🕒📅]/gu,
    ' '
  );

  // Remove linhas separadoras e cabeçalhos markdown
  text = text
    .replace(/={3,}|-{3,}|_{3,}/g, ' ')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*→]+\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1');

  // Converte quebras de linha em pausas suaves quando não terminam em pontuação
  const lines = text
    .split('\n')
    .map((l) => l.replace(/\s{2,}/g, ' ').trim())
    .filter(Boolean);

  const normalizedLines = lines.map((line) => {
    if (/[.!?;:]$/.test(line)) return line;
    return `${line}.`;
  });

  return normalizedLines.join(' ').replace(/\s{2,}/g, ' ').trim();
}

export function splitTextIntoSpeechChunks(text: string, maxChars = 1100): string[] {
  const clean = (text || '').trim();
  if (!clean) return [];
  if (clean.length <= maxChars) return [clean];

  const sentences = clean.split(/(?<=[.!?;])\s+/);
  const chunks: string[] = [];
  let buffer = '';

  const pushLongSegment = (seg: string) => {
    let rest = seg.trim();
    while (rest.length > maxChars) {
      let splitAt = rest.lastIndexOf(', ', maxChars);
      if (splitAt < maxChars * 0.4) splitAt = rest.lastIndexOf(' ', maxChars);
      if (splitAt < maxChars * 0.3) splitAt = maxChars;
      chunks.push(rest.slice(0, splitAt).trim());
      rest = rest.slice(splitAt).trim();
    }
    if (rest) {
      buffer = rest;
    }
  };

  for (const sentence of sentences) {
    const s = sentence.trim();
    if (!s) continue;

    if (s.length > maxChars) {
      if (buffer) {
        chunks.push(buffer.trim());
        buffer = '';
      }
      pushLongSegment(s);
      continue;
    }

    const candidate = buffer ? `${buffer} ${s}` : s;
    if (candidate.length <= maxChars) {
      buffer = candidate;
    } else {
      if (buffer) chunks.push(buffer.trim());
      buffer = s;
    }
  }

  if (buffer.trim()) {
    chunks.push(buffer.trim());
  }

  return chunks;
}

export function buildVoiceStudioAuthHeaders(settings: VoiceStudioSettings): Record<string, string> {
  const headers: Record<string, string> = {};
  const key = (settings.apiKey || '').trim();
  const pin = (settings.sharePin || '').trim();
  if (key) {
    headers.Authorization = `Bearer ${key}`;
  }
  if (pin) {
    headers['X-OmniVoice-Pin'] = pin;
  }
  return headers;
}

function createSignalWithTimeout(timeoutMs: number, externalSignal?: AbortSignal): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('Tempo limite excedido ao conectar ao VoiceStudio.')), timeoutMs);
  const onExternalAbort = () => {
    controller.abort(externalSignal?.reason || new Error('Cancelado pelo usuário.'));
  };
  if (externalSignal) {
    if (externalSignal.aborted) {
      onExternalAbort();
    } else {
      externalSignal.addEventListener('abort', onExternalAbort, { once: true });
    }
  }
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      if (externalSignal) {
        externalSignal.removeEventListener('abort', onExternalAbort);
      }
    },
  };
}

function detectCorsOrMixedContentHint(serverUrl: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const pageOrigin = window.location.origin;
  const normalizedTarget = normalizeServerUrl(serverUrl);
  if (pageOrigin.startsWith('https://') && normalizedTarget.startsWith('http://')) {
    if (isLoopbackServerUrl(normalizedTarget)) {
      return `Se o VoiceStudio já está instalado, defina OMNIVOICE_ALLOWED_ORIGINS="${pageOrigin},https://koinonialms.vercel.app,http://localhost:3902,http://127.0.0.1:3902,app://voicestudio" nas variáveis do usuário e abra o app VoiceStudio.`;
    }
    return 'Navegadores bloqueiam HTTP remoto dentro de páginas HTTPS (Mixed Content). Use uma URL HTTPS (Tailscale Funnel, Cloudflare Tunnel ou Nginx TLS) ou ative "Usar Proxy do Servidor".';
  }
  return `Confirme se o VoiceStudio está ativo em ${normalizedTarget} e com OMNIVOICE_ALLOWED_ORIGINS incluindo ${pageOrigin}.`;
}

async function callVoiceStudioJson<T>(
  action: 'health' | 'voices' | 'models',
  path: string,
  settings: VoiceStudioSettings,
  timeoutMs = 5000
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const baseUrl = normalizeServerUrl(settings.serverUrl);
  const { signal, cleanup } = createSignalWithTimeout(timeoutMs);

  try {
    if (shouldUseRemoteProxy(settings)) {
      const res = await fetch('/api/tts/voicestudio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          serverUrl: baseUrl,
          apiKey: settings.apiKey || undefined,
          sharePin: settings.sharePin || undefined,
        }),
        signal,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          error: json?.error || json?.detail || res.statusText,
        };
      }
      return { ok: true, status: res.status, data: json as T };
    }

    const res = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      headers: buildVoiceStudioAuthHeaders(settings),
      signal,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: json?.error?.message || json?.detail || res.statusText,
      };
    }
    return { ok: true, status: res.status, data: json as T };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha de rede';
    return { ok: false, status: 0, error: msg };
  } finally {
    cleanup();
  }
}

const healthProbeCache = new Map<
  string,
  { ok: boolean; activeEngine?: string; checkedAt: number }
>();

export function invalidateVoiceStudioHealthProbe(serverUrl?: string): void {
  if (serverUrl) {
    healthProbeCache.delete(normalizeServerUrl(serverUrl));
  } else {
    healthProbeCache.clear();
  }
}

export async function probeVoiceStudioStatus(
  settings: VoiceStudioSettings,
  timeoutMs = 1200
): Promise<{ ok: boolean; activeEngine?: string }> {
  const key = normalizeServerUrl(settings.serverUrl);
  const cached = healthProbeCache.get(key);
  const now = Date.now();
  if (cached) {
    const ttl = cached.ok ? 30_000 : 60_000;
    if (now - cached.checkedAt < ttl) {
      return { ok: cached.ok, activeEngine: cached.activeEngine };
    }
  }

  const health = await callVoiceStudioJson<Record<string, unknown>>('health', '/health', settings, timeoutMs);
  const activeEngine = health.ok
    ? String(health.data?.engine || health.data?.active_engine || '')
    : undefined;
  healthProbeCache.set(key, { ok: health.ok, activeEngine, checkedAt: Date.now() });
  return { ok: health.ok, activeEngine };
}

export async function probeVoiceStudioHealth(
  settings: VoiceStudioSettings,
  timeoutMs = 1200
): Promise<boolean> {
  const status = await probeVoiceStudioStatus(settings, timeoutMs);
  return status.ok;
}

export async function testVoiceStudioConnection(
  settings: VoiceStudioSettings
): Promise<VoiceStudioConnectionResult> {
  const baseUrl = normalizeServerUrl(settings.serverUrl);
  const health = await callVoiceStudioJson<Record<string, unknown>>('health', '/health', settings, 5000);
  const probedEngine = health.ok
    ? String(health.data?.engine || health.data?.active_engine || '')
    : undefined;
  healthProbeCache.set(baseUrl, { ok: health.ok, activeEngine: probedEngine, checkedAt: Date.now() });

  if (!health.ok) {
    return {
      ok: false,
      statusCode: health.status,
      voices: DEFAULT_VOICESTUDIO_VOICES,
      models: DEFAULT_VOICESTUDIO_MODELS,
      error: health.status === 401
        ? 'Autenticação recusada (401). Verifique a API Key ou Share PIN de 6 dígitos.'
        : health.error || `Não foi possível conectar em ${baseUrl}.`,
      corsHint: health.status === 0 ? detectCorsOrMixedContentHint(baseUrl) : undefined,
    };
  }

  const [voicesRes, modelsRes] = await Promise.all([
    callVoiceStudioJson<{ voices?: VoiceStudioVoiceItem[]; data?: VoiceStudioVoiceItem[] }>(
      'voices',
      '/v1/audio/voices',
      settings,
      5000
    ),
    callVoiceStudioJson<{ data?: VoiceStudioModelItem[] }>(
      'models',
      '/v1/models',
      settings,
      5000
    ),
  ]);

  const rawVoices = voicesRes.ok
    ? voicesRes.data?.voices || voicesRes.data?.data || []
    : [];
  const rawModels = modelsRes.ok && Array.isArray(modelsRes.data?.data)
    ? modelsRes.data.data
    : [];

  // Filtra IDs exclusivos de ASR/STT retornados por /v1/models e preserva descrições amigáveis
  const defaultMeta = new Map(DEFAULT_VOICESTUDIO_MODELS.map((m) => [m.id, m.owned_by]));
  const filteredServerModels = rawModels
    .filter((m) => m && typeof m.id === 'string' && !/^(whisper|gpt-4o-.*transcribe)/i.test(m.id))
    .map((m) => ({
      id: m.id,
      owned_by: defaultMeta.get(m.id) || m.owned_by,
    }));

  return {
    ok: true,
    statusCode: health.status,
    activeEngine: String(health.data?.engine || health.data?.active_engine || 'VoiceStudio'),
    device: health.data?.device ? String(health.data.device) : undefined,
    voices: rawVoices.length > 0 ? rawVoices : DEFAULT_VOICESTUDIO_VOICES,
    models: filteredServerModels.length > 0 ? filteredServerModels : DEFAULT_VOICESTUDIO_MODELS,
  };
}

export function buildSpeechRequestPayload(text: string, settings: VoiceStudioSettings): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    model: (settings.model || 'tts-1').trim(),
    input: text.slice(0, 4096),
    voice: (settings.voice || 'default').trim(),
    response_format: settings.responseFormat || 'mp3',
    speed: clampNumber(settings.speed, 0.25, 4.0, 1.0),
  };

  const lang = (settings.language || '').trim();
  if (lang && lang !== 'auto') {
    payload.language = lang;
  }
  const instruct = (settings.instruct || '').trim();
  if (instruct) {
    payload.instruct = instruct;
    payload.instructions = instruct;
  }
  const desc = (settings.voiceDescription || '').trim();
  if (desc) {
    payload.description = desc;
  }
  if (settings.denoise) {
    payload.denoise = true;
  }
  if (settings.seed !== null && Number.isFinite(settings.seed)) {
    payload.seed = Math.trunc(settings.seed);
  }
  if (settings.guidanceScale !== null && Number.isFinite(settings.guidanceScale)) {
    payload.guidance_scale = settings.guidanceScale;
  }
  if (settings.numStep !== null && Number.isFinite(settings.numStep)) {
    payload.num_step = Math.trunc(settings.numStep);
  }

  return payload;
}

export async function synthesizeVoiceStudioChunk(
  text: string,
  settings: VoiceStudioSettings,
  externalSignal?: AbortSignal,
  timeoutMs = 180000
): Promise<{ blob: Blob; mimeType: string }> {
  const baseUrl = normalizeServerUrl(settings.serverUrl);
  const payload = buildSpeechRequestPayload(text, settings);
  const { signal, cleanup } = createSignalWithTimeout(timeoutMs, externalSignal);

  try {
    let res: Response;
    if (shouldUseRemoteProxy(settings)) {
      res = await fetch('/api/tts/voicestudio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'speech',
          serverUrl: baseUrl,
          apiKey: settings.apiKey || undefined,
          sharePin: settings.sharePin || undefined,
          payload,
        }),
        signal,
      });
    } else {
      res = await fetch(`${baseUrl}/v1/audio/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildVoiceStudioAuthHeaders(settings),
        },
        body: JSON.stringify(payload),
        signal,
      });
    }

    if (!res.ok) {
      let errMsg = `Erro ${res.status} ao gerar áudio no VoiceStudio`;
      try {
        const errJson = await res.json();
        errMsg = errJson?.error?.message || errJson?.error || errJson?.detail || errMsg;
      } catch {
        // resposta não-JSON
      }
      throw new Error(errMsg);
    }

    const mimeType = res.headers.get('content-type') || 'audio/mpeg';
    const blob = await res.blob();
    if (!blob || blob.size === 0) {
      throw new Error('VoiceStudio retornou áudio vazio.');
    }
    return { blob, mimeType };
  } finally {
    cleanup();
  }
}
