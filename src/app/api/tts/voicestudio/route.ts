import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ProxyRequestBody {
  action: 'health' | 'voices' | 'models' | 'speech';
  serverUrl: string;
  apiKey?: string;
  sharePin?: string;
  payload?: Record<string, unknown>;
}

const BLOCKED_HOSTS = new Set([
  '169.254.169.254',
  'metadata.google.internal',
  'metadata.goog',
  'metadata',
  '100.100.100.200',
]);

function isLoopbackHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '127.1' ||
    h === '[::1]' ||
    h === '::1' ||
    h === '0.0.0.0'
  );
}

function validateRemoteServerUrl(rawUrl: string): { ok: true; baseUrl: string } | { ok: false; error: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { ok: false, error: 'URL do servidor VoiceStudio não informada.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { ok: false, error: 'URL do servidor VoiceStudio inválida.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'Protocolo inválido. Use http:// ou https://.' };
  }

  const host = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.startsWith('169.254.')) {
    return { ok: false, error: 'Endereço de destino não permitido pelo proxy.' };
  }

  if (isLoopbackHost(host) && process.env.VERCEL === '1') {
    return {
      ok: false,
      error:
        'Endereços locais (127.0.0.1 / localhost) devem ser acessados diretamente pelo navegador sem o proxy em nuvem. Desmarque "Usar Proxy do Servidor".',
    };
  }

  const baseUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/+$/, '');
  return { ok: true, baseUrl };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ProxyRequestBody;
    const { action, serverUrl, apiKey, sharePin, payload } = body || {};

    const validation = validateRemoteServerUrl(serverUrl);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const base = validation.baseUrl;
    const headers: Record<string, string> = {};
    if (apiKey && apiKey.trim()) {
      headers.Authorization = `Bearer ${apiKey.trim()}`;
    }
    if (sharePin && sharePin.trim()) {
      headers['X-OmniVoice-Pin'] = sharePin.trim();
    }

    const timeoutMs = action === 'speech' ? 45000 : 8000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      if (action === 'health' || action === 'voices' || action === 'models') {
        const endpointPath =
          action === 'health'
            ? '/health'
            : action === 'voices'
            ? '/v1/audio/voices'
            : '/v1/models';

        const upstream = await fetch(`${base}${endpointPath}`, {
          method: 'GET',
          headers,
          signal: controller.signal,
          cache: 'no-store',
        });

        const text = await upstream.text();
        let parsed: unknown = null;
        try {
          parsed = text ? JSON.parse(text) : {};
        } catch {
          parsed = { detail: text || upstream.statusText };
        }

        return NextResponse.json(parsed, { status: upstream.status });
      }

      if (action === 'speech') {
        if (!payload || typeof payload !== 'object') {
          return NextResponse.json({ error: 'Payload de síntese ausente.' }, { status: 400 });
        }

        const upstream = await fetch(`${base}/v1/audio/speech`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!upstream.ok) {
          const errText = await upstream.text();
          let errJson: unknown = null;
          try {
            errJson = errText ? JSON.parse(errText) : { error: upstream.statusText };
          } catch {
            errJson = { error: errText || upstream.statusText };
          }
          return NextResponse.json(errJson, { status: upstream.status });
        }

        const audioBuffer = await upstream.arrayBuffer();
        const contentType = upstream.headers.get('content-type') || 'audio/mpeg';

        return new NextResponse(audioBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'no-store',
          },
        });
      }

      return NextResponse.json({ error: 'Ação inválida para VoiceStudio.' }, { status: 400 });
    } finally {
      clearTimeout(timer);
    }
  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    const message = isAbort
      ? 'Tempo limite esgotado ao aguardar resposta do servidor VoiceStudio.'
      : err instanceof Error
      ? err.message
      : 'Erro ao comunicar com o servidor VoiceStudio.';
    return NextResponse.json({ error: message }, { status: isAbort ? 504 : 502 });
  }
}
