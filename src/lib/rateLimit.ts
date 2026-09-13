/**
 * Motor de Rate Limiting em Memória (Zero-Waste Egress Architecture)
 * Utiliza o algoritmo de Janela Deslizante (Sliding Window Counter) em memória volátil.
 * Não consome banco de dados nem gera tráfego de rede (0 bytes no Supabase).
 */

interface RateLimitRecord {
  count: number;
  firstRequestTime: number;
}

// Armazenamento em memória volátil isolado por identificador (IP ou rota)
const memoryStore = new Map<string, RateLimitRecord>();

// Intervalo de limpeza automática para evitar memory leak em processos longos (a cada 5 minutos)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredRecords(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of memoryStore.entries()) {
    if (now - record.firstRequestTime > windowMs * 2) {
      memoryStore.delete(key);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Verifica e contabiliza uma requisição para o identificador fornecido.
 *
 * @param identifier Identificador único (ex: IP do cliente ou IP + rota)
 * @param maxRequests Limite máximo de requisições permitidas na janela (padrão: 5)
 * @param windowSeconds Tamanho da janela em segundos (padrão: 600 = 10 minutos)
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowSeconds: number = 600
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  cleanupExpiredRecords(windowMs);

  const existing = memoryStore.get(identifier);

  if (!existing) {
    memoryStore.set(identifier, {
      count: 1,
      firstRequestTime: now,
    });
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetSeconds: windowSeconds,
    };
  }

  // Verifica se a janela expirou
  const elapsedTime = now - existing.firstRequestTime;

  if (elapsedTime > windowMs) {
    // Reseta janela para nova rodada
    memoryStore.set(identifier, {
      count: 1,
      firstRequestTime: now,
    });
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetSeconds: windowSeconds,
    };
  }

  // Janela ainda ativa
  if (existing.count >= maxRequests) {
    const remainingTimeSeconds = Math.ceil((windowMs - elapsedTime) / 1000);
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetSeconds: Math.max(1, remainingTimeSeconds),
    };
  }

  // Incrementa contador
  existing.count += 1;
  const remaining = Math.max(0, maxRequests - existing.count);
  const remainingTimeSeconds = Math.ceil((windowMs - elapsedTime) / 1000);

  return {
    success: true,
    limit: maxRequests,
    remaining,
    resetSeconds: Math.max(1, remainingTimeSeconds),
  };
}

/**
 * Extrai o melhor endereço IP do cliente a partir dos cabeçalhos da requisição
 */
export function getClientIp(req: Request | any): string {
  try {
    const headers = req.headers;
    const getHeader = (name: string) => {
      if (typeof headers.get === 'function') return headers.get(name);
      return headers[name.toLowerCase()] || headers[name];
    };

    const xForwardedFor = getHeader('x-forwarded-for');
    if (xForwardedFor) {
      // Pega o primeiro IP da lista de proxies
      const first = xForwardedFor.split(',')[0].trim();
      if (first) return first;
    }

    const realIp = getHeader('x-real-ip');
    if (realIp) return realIp.trim();

    const cfIp = getHeader('cf-connecting-ip');
    if (cfIp) return cfIp.trim();
  } catch (_) {}

  return '127.0.0.1';
}
