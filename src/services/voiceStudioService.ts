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

export const VOICESTUDIO_STORAGE_KEY = 'lms_voicestudio_settings_v1';

export const DEFAULT_VOICESTUDIO_SETTINGS: VoiceStudioSettings = {
  engineMode: 'auto',
  serverUrl: 'http://127.0.0.1:3900',
  useServerProxy: false,
  apiKey: '',
  sharePin: '',
  model: 'omnivoice',
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
  { id: 'omnivoice', owned_by: 'VoiceStudio (Padrão)' },
  { id: 'voxcpm2', owned_by: 'VoiceStudio Engine' },
  { id: 'cosyvoice', owned_by: 'VoiceStudio Engine' },
  { id: 'kittentts', owned_by: 'VoiceStudio Engine (Leve/CPU)' },
  { id: 'moss-tts-nano', owned_by: 'VoiceStudio Engine' },
  { id: 'mlx-audio', owned_by: 'VoiceStudio Apple Silicon' },
  { id: 'tts-1', owned_by: 'Alias OpenAI → Engine Ativa' },
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

export function loadVoiceStudioSettings(): VoiceStudioSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_VOICESTUDIO_SETTINGS };
  try {
    const raw = localStorage.getItem(VOICESTUDIO_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_VOICESTUDIO_SETTINGS };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_VOICESTUDIO_SETTINGS };
    return {
      ...DEFAULT_VOICESTUDIO_SETTINGS,
      ...parsed,
      speed: clampNumber(parsed.speed, 0.25, 4.0, DEFAULT_VOICESTUDIO_SETTINGS.speed),
      browserPitch: clampNumber(parsed.browserPitch, 0.5, 2.0, 1.0),
      browserVolume: clampNumber(parsed.browserVolume, 0.1, 1.0, 1.0),
      seed: parsed.seed !== null && parsed.seed !== undefined && parsed.seed !== '' ? Number(parsed.seed) : null,
      guidanceScale:
        parsed.guidanceScale !== null && parsed.guidanceScale !== undefined && parsed.guidanceScale !== ''
          ? Number(parsed.guidanceScale)
          : null,
      numStep:
        parsed.numStep !== null && parsed.numStep !== undefined && parsed.numStep !== ''
          ? Number(parsed.numStep)
          : null,
    };
  } catch {
    return { ...DEFAULT_VOICESTUDIO_SETTINGS };
  }
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
      return `Se o VoiceStudio já está rodando localmente, inicie-o com OMNIVOICE_ALLOWED_ORIGINS="${pageOrigin},http://localhost:3000" para liberar requisições CORS desta página.`;
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

export async function testVoiceStudioConnection(
  settings: VoiceStudioSettings
): Promise<VoiceStudioConnectionResult> {
  const baseUrl = normalizeServerUrl(settings.serverUrl);
  const health = await callVoiceStudioJson<Record<string, unknown>>('health', '/health', settings, 5000);

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

  return {
    ok: true,
    statusCode: health.status,
    activeEngine: String(health.data?.engine || health.data?.active_engine || 'VoiceStudio'),
    device: health.data?.device ? String(health.data.device) : undefined,
    voices: rawVoices.length > 0 ? rawVoices : DEFAULT_VOICESTUDIO_VOICES,
    models: rawModels.length > 0 ? rawModels : DEFAULT_VOICESTUDIO_MODELS,
  };
}

export function buildSpeechRequestPayload(text: string, settings: VoiceStudioSettings): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    model: (settings.model || 'omnivoice').trim(),
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
  timeoutMs = 20000
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
