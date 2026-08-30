/**
 * Utilitários para formatação e máscara de números de telefone e celular
 * phoneUtils.ts
 * Koinonia-LMS - Seminário Teológico
 */

/**
 * Remove todos os caracteres não numéricos.
 * Se o número tiver DDI do Brasil (55) e mais de 11 dígitos, remove o 55 inicial para padronização.
 */
export function cleanPhoneNumber(value: string | undefined | null): string {
  if (!value) return '';
  let digits = value.toString().replace(/\D/g, '');

  // Se o usuário colou com +55 e o total ficou com 12 ou 13 dígitos (55 + DDD + 8 ou 9 dígitos)
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    digits = digits.slice(2);
  }

  // Limita ao máximo de 11 dígitos (DDD + 9 dígitos)
  return digits.slice(0, 11);
}

/**
 * Aplica máscara dinâmica de celular / telefone brasileiro:
 * - 10 dígitos: (XX) XXXX-XXXX (Telefone fixo)
 * - 11 dígitos: (XX) XXXXX-XXXX (Celular / WhatsApp)
 * - Enquanto digita: formata com parênteses, espaço e hífen progressivamente.
 */
export function formatPhone(value: string | undefined | null): string {
  if (!value) return '';
  const digits = cleanPhoneNumber(value);
  if (!digits) return '';

  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // 11 dígitos: (XX) XXXXX-XXXX
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Gera link direto para conversa no WhatsApp (wa.me)
 */
export function getWhatsAppUrl(value: string | undefined | null, text?: string): string {
  if (!value) return '';
  const digits = cleanPhoneNumber(value);
  if (!digits) return '';

  const fullNumber = digits.startsWith('55') ? digits : `55${digits}`;
  const baseUrl = `https://wa.me/${fullNumber}`;
  return text ? `${baseUrl}?text=${encodeURIComponent(text)}` : baseUrl;
}
