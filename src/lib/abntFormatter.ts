import {
  AbntArticleDocument,
  AbntContentBlock,
  AbntReference,
  AbntSection,
} from '@/types/abntArticle';

export interface BoldSegment {
  text: string;
  bold: boolean;
}

/**
 * Converte marcadores **trecho** em segmentos tipados para renderizar negrito
 * tanto no preview HTML/React quanto nos Runs do Word (.docx).
 */
export function parseBoldSegments(input: string): BoldSegment[] {
  if (!input) return [{ text: '', bold: false }];
  const parts = input.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return { text: part.slice(2, -2), bold: true };
    }
    return { text: part, bold: false };
  });
}

export function stripMarkdownBold(input: string): string {
  return (input || '').replace(/\*\*([^*]+)\*\*/g, '$1').trim();
}

export function countWords(text: string): number {
  const cleaned = stripMarkdownBold(text).replace(/\s+/g, ' ').trim();
  if (!cleaned) return 0;
  return cleaned.split(' ').length;
}

/**
 * Formata uma referência segundo a ABNT NBR 6023 utilizando **Título** em negrito.
 */
export function formatAbntReference(
  ref: Omit<AbntReference, 'id' | 'formattedText'> & { id?: string; formattedText?: string }
): string {
  if (ref.type === 'livre') {
    return (ref.formattedText || ref.title || '').trim();
  }

  const authors = (ref.authors || '').trim().replace(/\.$/, '');
  const title = (ref.title || '').trim().replace(/\.$/, '');
  const subtitle = (ref.subtitle || '').trim().replace(/\.$/, '');
  const fullTitle = subtitle ? `**${title}**: ${subtitle}` : `**${title}**`;
  const year = (ref.year || 's.d.').trim();
  const city = (ref.city || '').trim();
  const publisher = (ref.publisher || '').trim();
  const edition = (ref.edition || '').trim();

  switch (ref.type) {
    case 'livro': {
      const parts: string[] = [];
      if (authors) parts.push(`${authors}.`);
      parts.push(`${fullTitle}.`);
      if (edition) parts.push(`${edition}.`);
      const pubSegment = [city ? `${city}:` : '', publisher, year].filter(Boolean).join(' ').trim();
      if (pubSegment) parts.push(`${pubSegment}.`);
      return parts.join(' ').replace(/\s+/g, ' ').trim();
    }

    case 'capitulo': {
      const container = (ref.containerTitle || '').trim().replace(/\.$/, '');
      const pages = (ref.pages || '').trim();
      const parts: string[] = [];
      if (authors) parts.push(`${authors}.`);
      parts.push(`${title}${subtitle ? `: ${subtitle}` : ''}.`);
      if (container) parts.push(`In: **${container}**.`);
      if (edition) parts.push(`${edition}.`);
      const pubSegment = [
        city ? `${city}:` : '',
        publisher,
        year,
        pages ? `, p. ${pages}` : '',
      ]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+,/g, ',')
        .trim();
      if (pubSegment) parts.push(`${pubSegment}.`);
      return parts.join(' ').replace(/\s+/g, ' ').trim();
    }

    case 'artigo': {
      const journal = (ref.containerTitle || '').trim().replace(/\.$/, '');
      const pages = (ref.pages || '').trim();
      const parts: string[] = [];
      if (authors) parts.push(`${authors}.`);
      parts.push(`${title}${subtitle ? `: ${subtitle}` : ''}.`);
      if (journal) parts.push(`**${journal}**,`);
      if (city) parts.push(`${city},`);
      if (pages) parts.push(`p. ${pages},`);
      parts.push(`${year}.`);
      if (ref.url?.trim()) {
        parts.push(`Disponível em: ${ref.url.trim()}.`);
        if (ref.accessDate?.trim()) parts.push(`Acesso em: ${ref.accessDate.trim()}.`);
      }
      return parts.join(' ').replace(/\s+/g, ' ').trim();
    }

    case 'biblia': {
      const versionTitle = title || 'BÍBLIA';
      const sub = subtitle || 'Português. Bíblia Sagrada';
      const pubSegment = [city ? `${city}:` : '', publisher, year].filter(Boolean).join(' ').trim();
      return `${versionTitle.toUpperCase()}. **${sub}**. ${edition ? `${edition}. ` : ''}${pubSegment ? `${pubSegment}.` : ''}`
        .replace(/\s+/g, ' ')
        .trim();
    }

    case 'site': {
      const siteTitle = (ref.containerTitle || '').trim();
      const parts: string[] = [];
      if (authors) parts.push(`${authors}.`);
      parts.push(`${fullTitle}.`);
      if (siteTitle) parts.push(`${siteTitle},`);
      parts.push(`${year}.`);
      if (ref.url?.trim()) parts.push(`Disponível em: ${ref.url.trim()}.`);
      if (ref.accessDate?.trim()) parts.push(`Acesso em: ${ref.accessDate.trim()}.`);
      return parts.join(' ').replace(/\s+/g, ' ').trim();
    }

    default:
      return (ref.formattedText || title).trim();
  }
}

export function sortReferencesAlphabetically(refs: AbntReference[]): AbntReference[] {
  return [...refs].sort((a, b) => {
    const ka = stripMarkdownBold(a.formattedText || a.authors || a.title).toLowerCase();
    const kb = stripMarkdownBold(b.formattedText || b.authors || b.title).toLowerCase();
    return ka.localeCompare(kb, 'pt-BR', { sensitivity: 'base' });
  });
}

export interface FirstPersonSample {
  sectionTitle: string;
  term: string;
  excerpt: string;
}

const FIRST_PERSON_REGEX = /\b(eu|meu|minha|meus|minhas|comigo|acho|penso|acredito|entendo|creio|nós|nosso|nossa|nossos|nossas|percebemos|concluímos|analisamos|observamos)\b/gi;

export function detectFirstPersonMatches(sections: AbntSection[]): {
  count: number;
  samples: FirstPersonSample[];
} {
  const samples: FirstPersonSample[] = [];
  let count = 0;

  for (const sec of sections) {
    for (const blk of sec.blocks) {
      if (blk.type !== 'paragraph') continue;
      const text = blk.text || '';
      if (!text.trim()) continue;
      let match: RegExpExecArray | null;
      FIRST_PERSON_REGEX.lastIndex = 0;
      while ((match = FIRST_PERSON_REGEX.exec(text)) !== null) {
        count++;
        if (samples.length < 8) {
          const start = Math.max(0, match.index - 24);
          const end = Math.min(text.length, match.index + match[0].length + 28);
          samples.push({
            sectionTitle: `${sec.numberLabel} ${sec.title}`.trim(),
            term: match[0],
            excerpt: `${start > 0 ? '...' : ''}${text.slice(start, end).trim()}${end < text.length ? '...' : ''}`,
          });
        }
      }
    }
  }

  return { count, samples };
}

export interface AbntAuditCheck {
  id: string;
  label: string;
  passed: boolean;
  severity: 'ok' | 'warn' | 'info';
  detail?: string;
}

export interface AbntAuditResult {
  progressPercent: number;
  completedBlocks: number;
  totalBlocks: number;
  wordCount: number;
  estimatedPages: number;
  abstractWordCount: number;
  firstPersonCount: number;
  firstPersonSamples: FirstPersonSample[];
  checks: AbntAuditCheck[];
}

function getBlockTextLength(blk: AbntContentBlock): number {
  switch (blk.type) {
    case 'paragraph':
      return countWords(blk.text);
    case 'long_quote':
      return countWords(blk.text);
    case 'subheading':
      return countWords(blk.title);
    case 'table':
      return blk.rows.reduce((acc, row) => acc + row.reduce((a, cell) => a + countWords(cell), 0), 0);
    case 'figure':
      return blk.imageDataUrl ? 12 : 0;
  }
}

export function auditAbntArticle(doc: AbntArticleDocument): AbntAuditResult {
  const authorFilled = doc.authors.some((a) => a.fullName.trim().length >= 3);
  const titleFilled = doc.title.trim().length >= 5 && !doc.title.includes('TÍTULO DO ARTIGO');
  const institutionFilled = doc.institutionName.trim().length >= 5;
  const abstractWordCount = countWords(doc.resumo);
  const abstractValid = !doc.formatting.showAbstract || (abstractWordCount >= 150 && abstractWordCount <= 500);

  let bodyWords = 0;
  let filledSections = 0;
  let tableCount = 0;
  let figureCount = 0;

  for (const sec of doc.sections) {
    let secWords = 0;
    for (const blk of sec.blocks) {
      if (blk.type === 'table') tableCount++;
      if (blk.type === 'figure' && blk.imageDataUrl) figureCount++;
      secWords += getBlockTextLength(blk);
    }
    bodyWords += secWords;
    if (secWords >= 12) filledSections++;
  }

  const refWords = doc.references.reduce((acc, r) => acc + countWords(r.formattedText), 0);
  const attWords = doc.attachments.reduce((acc, a) => acc + countWords(a.title) + countWords(a.description), 0);
  const totalWords = bodyWords + (doc.formatting.showAbstract ? abstractWordCount : 0) + refWords + attWords;

  // Estimativa realista de laudas ABNT (12pt espaçamento 1,5 ~ 280 palavras/pág + páginas fixas pré/pós)
  const preTextualPages =
    (doc.formatting.showCover ? 1 : 0) +
    (doc.formatting.showTitlePage ? 1 : 0) +
    (doc.formatting.showToc ? 1 : 0) +
    (doc.formatting.showAbstract ? 1 : 0);
  const bodyPages = Math.max(1, Math.ceil((bodyWords + tableCount * 85 + figureCount * 110) / 280));
  const refPages = doc.references.length > 0 ? Math.max(1, Math.ceil(doc.references.length / 14)) : 0;
  const attPages = doc.attachments.length;
  const estimatedPages = preTextualPages + bodyPages + refPages + attPages;

  const { count: firstPersonCount, samples: firstPersonSamples } = detectFirstPersonMatches(doc.sections);
  const hasReferences = doc.references.length > 0;

  const minPages = doc.formatting.targetMinPages;
  const maxPages = doc.formatting.targetMaxPages;
  const withinPageRange =
    !minPages && !maxPages
      ? true
      : (!minPages || estimatedPages >= minPages) && (!maxPages || estimatedPages <= maxPages);

  const checks: AbntAuditCheck[] = [
    {
      id: 'author',
      label: doc.authors.length > 1 ? `${doc.authors.length} autores identificados` : 'Autor oficial preenchido',
      passed: authorFilled,
      severity: authorFilled ? 'ok' : 'warn',
    },
    {
      id: 'title',
      label: 'Título oficial definido',
      passed: titleFilled,
      severity: titleFilled ? 'ok' : 'warn',
    },
    {
      id: 'institution',
      label: 'Cabeçalho institucional preenchido',
      passed: institutionFilled,
      severity: institutionFilled ? 'ok' : 'warn',
    },
    ...(doc.formatting.showAbstract
      ? [
          {
            id: 'abstract',
            label: `Resumo NBR 6028 (${abstractWordCount}/150–500 palavras)`,
            passed: abstractValid,
            severity: (abstractValid ? 'ok' : 'warn') as 'ok' | 'warn',
          },
        ]
      : []),
    {
      id: 'sections',
      label: `Seções redigidas (${filledSections}/${doc.sections.length})`,
      passed: doc.sections.length > 0 && filledSections === doc.sections.length,
      severity: doc.sections.length > 0 && filledSections === doc.sections.length ? 'ok' : 'warn',
    },
    {
      id: 'references',
      label: `Referências NBR 6023 (${doc.references.length} ${doc.references.length === 1 ? 'obra' : 'obras'})`,
      passed: hasReferences,
      severity: hasReferences ? 'ok' : 'warn',
    },
    ...(minPages || maxPages
      ? [
          {
            id: 'pages',
            label: `Extensão estimada ~${estimatedPages} pág${maxPages ? ` (meta ${minPages || 1}–${maxPages})` : ''}`,
            passed: withinPageRange,
            severity: (withinPageRange ? 'ok' : 'info') as 'ok' | 'info',
          },
        ]
      : []),
    ...(doc.formatting.restrictFirstPerson
      ? [
          {
            id: 'impersonal',
            label:
              firstPersonCount === 0
                ? 'Impessoalidade (3ª pessoa) OK'
                : `${firstPersonCount} termo(s) em 1ª pessoa detectado(s)`,
            passed: firstPersonCount === 0,
            severity: (firstPersonCount === 0 ? 'ok' : 'warn') as 'ok' | 'warn',
          },
        ]
      : []),
  ];

  const coreChecks = checks.filter((c) => c.id !== 'pages');
  const completedBlocks = coreChecks.filter((c) => c.passed).length;
  const totalBlocks = coreChecks.length;
  const progressPercent = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

  return {
    progressPercent,
    completedBlocks,
    totalBlocks,
    wordCount: totalWords,
    estimatedPages,
    abstractWordCount,
    firstPersonCount,
    firstPersonSamples,
    checks,
  };
}

export function slugifyFileName(input: string): string {
  const clean = (input || 'artigo-abnt')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return clean || 'artigo-abnt';
}

export function buildProfessorMailto(doc: AbntArticleDocument): string {
  const to = (doc.professorEmail || '').trim();
  const authorNames = doc.authors.map((a) => a.fullName.trim()).filter(Boolean).join(', ');
  const subject = `[${doc.disciplinaName || 'Trabalho ABNT'}] ${doc.title} — ${authorNames || 'Aluno'}`;
  const body =
    `Prezado(a) ${doc.professorName || 'Docente'},\n\n` +
    `Segue em anexo o arquivo acadêmico "${doc.title}" referente à disciplina ${doc.disciplinaName}.\n` +
    `Autor(es): ${authorNames || 'Seminarista'}\n` +
    `Instituição: ${doc.institutionName}\n\n` +
    `Atenciosamente,\n${authorNames || 'Seminarista'}`;
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Redimensiona e comprime uma imagem no cliente (máx 1000px largura, JPEG 0.78)
 * garantindo tamanho reduzido (< 180 KB) para proteger o Egress do Supabase Free Plan.
 */
export async function compressImageForAbnt(
  file: File,
  maxWidth = 1000,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo de imagem.'));
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const img = new Image();
      img.onerror = () => reject(new Error('Arquivo selecionado não é uma imagem válida.'));
      img.onload = () => {
        try {
          const scale = img.width > maxWidth ? maxWidth / img.width : 1;
          const targetWidth = Math.max(1, Math.round(img.width * scale));
          const targetHeight = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          // Fundo branco para evitar fundo preto ao converter PNG transparente para JPEG
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          let compressed = canvas.toDataURL('image/jpeg', quality);
          if (compressed.length > 260000) {
            compressed = canvas.toDataURL('image/jpeg', 0.6);
          }
          resolve(compressed);
        } catch (err) {
          reject(err);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
