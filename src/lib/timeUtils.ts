/**
 * Utilitários de Conversão de Fuso Horário (Horário Base: Brasília / UTC-3)
 */

export interface TimeZoneInfo {
  timeZone: string;
  gmtOffset: string;
  isBRT: boolean;
}

export function getLocalTimeZoneInfo(): TimeZoneInfo {
  if (typeof window === 'undefined') {
    return { timeZone: 'America/Sao_Paulo', gmtOffset: 'GMT-3', isBRT: true };
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
  const now = new Date();
  const offsetMinutes = -now.getTimezoneOffset();
  const offsetHours = offsetMinutes / 60;
  const gmtOffset = `GMT${offsetHours >= 0 ? '+' : ''}${offsetHours}`;
  const isBRT = offsetHours === -3;

  return { timeZone, gmtOffset, isBRT };
}

/**
 * Converte um horário de Brasília (ex: "19:00") para o horário local do navegador do aluno.
 */
export function convertBRTToLocalTime(hhmm: string): string {
  if (!hhmm || !hhmm.includes(':')) return hhmm;
  
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);

  // Obtém data de hoje no formato ISO com offset -03:00 (Brasília)
  const todayStr = new Date().toISOString().split('T')[0];
  const dateBRT = new Date(`${todayStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00-03:00`);

  return dateBRT.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * Formata um intervalo de horário de Brasília (ex: "19:00 – 20:25") para o horário local.
 */
export function formatBRTRangeToLocal(rangeStr: string): { localRange: string; brtRange: string; isDifferent: boolean } {
  if (!rangeStr) return { localRange: '', brtRange: '', isDifferent: false };

  const timeMatches = rangeStr.match(/(\d{2}:\d{2})\s*[–-]\s*(\d{2}:\d{2})/);
  if (!timeMatches) {
    return { localRange: rangeStr, brtRange: rangeStr, isDifferent: false };
  }

  const [, startBRT, endBRT] = timeMatches;
  const startLocal = convertBRTToLocalTime(startBRT);
  const endLocal = convertBRTToLocalTime(endBRT);
  const localRange = `${startLocal} – ${endLocal}`;
  const brtRange = `${startBRT} – ${endBRT}`;
  const isDifferent = localRange !== brtRange;

  return { localRange, brtRange, isDifferent };
}

/**
 * Retorna o horário atual do sistema convertido para o equivalente em minutos do dia de Brasília (0 a 1439).
 */
export function getCurrentBrasiliaMinutes(): number {
  const now = new Date();
  // Formata o horário atual em Brasília
  const brtTimeStr = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false });
  const [h, m] = brtTimeStr.split(':').map(Number);
  return h * 60 + m;
}
