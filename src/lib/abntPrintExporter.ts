import { AbntArticleDocument } from '@/types/abntArticle';
import { INSTITUTION_PRESETS } from '@/data/abntTemplates';
import {
  parseBoldSegments,
  sortReferencesAlphabetically,
} from '@/lib/abntFormatter';

function escapeHtml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderBoldHtml(text: string): string {
  return parseBoldSegments(text)
    .map((seg) => (seg.bold ? `<strong>${escapeHtml(seg.text)}</strong>` : escapeHtml(seg.text)))
    .join('');
}

function resolveAbsoluteLogoUrl(doc: AbntArticleDocument): string {
  const relPath =
    INSTITUTION_PRESETS[doc.formatting.institutionPreset]?.logoPath || '/brasao-unimb.png';
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${relPath}`;
  }
  return relPath;
}

/**
 * Gera HTML A4 puro no padrão ABNT e dispara a caixa de impressão nativa / Salvar em PDF
 * em um iframe oculto e isolado (sem vazamento do tema dark ou da interface do LMS).
 */
export async function printAbntArticleAsPdf(doc: AbntArticleDocument): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const fontCss =
    doc.formatting.fontFamily === 'Times New Roman'
      ? '"Times New Roman", Times, serif'
      : 'Arial, Helvetica, sans-serif';
  const indentCss = `${doc.formatting.firstLineIndentCm}cm`;
  const sortedAuthors = doc.authors
    .map((a) => a.fullName.trim().toUpperCase())
    .filter(Boolean);
  const authorsDisplay =
    sortedAuthors.length > 0 ? sortedAuthors : ['SEMINARISTA AUTOR'];
  const sortedRefs = sortReferencesAlphabetically(doc.references);
  const logoSrc = resolveAbsoluteLogoUrl(doc);

  const pagesHtml: string[] = [];

  // 1. CAPA
  if (doc.formatting.showCover) {
    pagesHtml.push(`
      <section class="abnt-page page-break cover-page">
        <div class="cover-top">
          ${
            doc.formatting.showLogo
              ? `<img src="${escapeHtml(logoSrc)}" alt="Brasão Institucional" class="inst-logo" />`
              : ''
          }
          <p class="inst-line"><strong>${escapeHtml(doc.institutionName.toUpperCase())}</strong></p>
          <p class="inst-line"><strong>${escapeHtml(doc.courseName.toUpperCase())}</strong></p>
        </div>
        <div class="cover-authors">
          ${authorsDisplay.map((name) => `<p class="author-line"><strong>${escapeHtml(name)}</strong></p>`).join('')}
        </div>
        <div class="cover-title">
          <p class="title-main"><strong>${escapeHtml(doc.title.toUpperCase())}</strong>${doc.subtitle?.trim() ? `: ${escapeHtml(doc.subtitle.trim())}` : ''}</p>
        </div>
        <div class="cover-bottom">
          <p><strong>${escapeHtml(doc.city.toUpperCase())}</strong></p>
          <p><strong>${escapeHtml(doc.year)}</strong></p>
        </div>
      </section>
    `);
  }

  // 2. FOLHA DE ROSTO
  if (doc.formatting.showTitlePage) {
    pagesHtml.push(`
      <section class="abnt-page page-break cover-page">
        <div class="cover-authors" style="margin-top: 0;">
          ${authorsDisplay.map((name) => `<p class="author-line"><strong>${escapeHtml(name)}</strong></p>`).join('')}
        </div>
        <div class="cover-title">
          <p class="title-main"><strong>${escapeHtml(doc.title.toUpperCase())}</strong>${doc.subtitle?.trim() ? `: ${escapeHtml(doc.subtitle.trim())}` : ''}</p>
        </div>
        <div class="nature-box">
          <p>${escapeHtml(doc.academicNatureNote)}</p>
          ${doc.professorName ? `<p style="margin-top: 8pt;">Orientação/Docente: ${escapeHtml(doc.professorName)}</p>` : ''}
        </div>
        <div class="cover-bottom">
          <p><strong>${escapeHtml(doc.city.toUpperCase())}</strong></p>
          <p><strong>${escapeHtml(doc.year)}</strong></p>
        </div>
      </section>
    `);
  }

  // 3. SUMÁRIO
  if (doc.formatting.showToc) {
    const tocItems = doc.sections.flatMap((sec) => {
      const items = [
        `<li class="toc-main"><span><strong>${escapeHtml(sec.numberLabel)} ${escapeHtml(sec.title.toUpperCase())}</strong></span></li>`,
      ];
      sec.blocks
        .filter((b) => b.type === 'subheading')
        .forEach((b) => {
          if (b.type === 'subheading') {
            items.push(
              `<li class="toc-sub"><span>${escapeHtml(b.numberLabel)} ${escapeHtml(b.title)}</span></li>`
            );
          }
        });
      return items;
    });

    if (sortedRefs.length > 0) {
      tocItems.push(`<li class="toc-main"><span><strong>REFERÊNCIAS</strong></span></li>`);
    }
    doc.attachments.forEach((att) => {
      const kindLabel = att.kind === 'apendice' ? 'APÊNDICE' : 'ANEXO';
      tocItems.push(
        `<li class="toc-main"><span><strong>${kindLabel} ${escapeHtml(att.letter)} — ${escapeHtml(att.title.toUpperCase())}</strong></span></li>`
      );
    });

    pagesHtml.push(`
      <section class="abnt-page page-break">
        <h2 class="centered-heading">SUMÁRIO</h2>
        <ul class="toc-list">${tocItems.join('')}</ul>
      </section>
    `);
  }

  // 4. RESUMO & ABSTRACT
  if (doc.formatting.showAbstract) {
    pagesHtml.push(`
      <section class="abnt-page page-break">
        <h2 class="centered-heading">RESUMO</h2>
        <p class="abstract-text">${escapeHtml(doc.resumo || '(Resumo ainda não redigido.)')}</p>
        ${
          doc.palavrasChave?.trim()
            ? `<p class="keywords-line"><strong>Palavras-chave:</strong> ${escapeHtml(doc.palavrasChave.trim())}</p>`
            : ''
        }
        ${
          doc.abstractEn?.trim()
            ? `
          <h2 class="centered-heading" style="margin-top: 28pt;">ABSTRACT</h2>
          <p class="abstract-text">${escapeHtml(doc.abstractEn.trim())}</p>
          ${
            doc.keywordsEn?.trim()
              ? `<p class="keywords-line"><strong>Keywords:</strong> ${escapeHtml(doc.keywordsEn.trim())}</p>`
              : ''
          }
        `
            : ''
        }
      </section>
    `);
  }

  // 5. CORPO TEXTUAL + REFERÊNCIAS
  let figCounter = 0;
  let tabCounter = 0;

  const sectionsHtml = doc.sections
    .map((sec, idx) => {
      const blocksHtml = sec.blocks
        .map((blk) => {
          switch (blk.type) {
            case 'paragraph': {
              const paras = (blk.text || '')
                .split(/\n{2,}/)
                .map((p) => p.trim())
                .filter(Boolean);
              return paras
                .map((p) => `<p class="body-paragraph">${escapeHtml(p)}</p>`)
                .join('');
            }
            case 'long_quote':
              return `<blockquote class="long-quote">${escapeHtml(blk.text)}${
                blk.citation?.trim() ? ` ${escapeHtml(blk.citation.trim())}` : ''
              }</blockquote>`;
            case 'subheading':
              return `<h3 class="sub-heading">${escapeHtml(blk.numberLabel)} ${escapeHtml(blk.title)}</h3>`;
            case 'table': {
              tabCounter++;
              return `
                <div class="table-wrapper">
                  <p class="caption-top">Tabela ${tabCounter} — ${escapeHtml(blk.title || 'Dados')}</p>
                  <table class="abnt-table">
                    <thead>
                      <tr>${blk.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                      ${blk.rows
                        .map(
                          (row) =>
                            `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
                        )
                        .join('')}
                    </tbody>
                  </table>
                  <p class="caption-source">Fonte: ${escapeHtml(blk.source || 'Elaborado pelo autor.')}</p>
                </div>
              `;
            }
            case 'figure': {
              if (!blk.imageDataUrl) return '';
              figCounter++;
              return `
                <div class="figure-wrapper">
                  <p class="caption-top">Figura ${figCounter} — ${escapeHtml(blk.title || 'Ilustração')}</p>
                  <img src="${blk.imageDataUrl}" alt="${escapeHtml(blk.title || 'Figura')}" class="body-figure" />
                  <p class="caption-source">Fonte: ${escapeHtml(blk.source || 'Arquivo do autor.')}</p>
                </div>
              `;
            }
          }
        })
        .join('');

      return `
        <div class="section-block ${idx > 0 ? 'section-spacer' : ''}">
          <h2 class="section-heading">${escapeHtml(sec.numberLabel)} ${escapeHtml(sec.title.toUpperCase())}</h2>
          ${blocksHtml}
        </div>
      `;
    })
    .join('');

  pagesHtml.push(`
    <section class="abnt-page ${sortedRefs.length > 0 ? 'page-break' : ''}">
      ${sectionsHtml}
    </section>
  `);

  if (sortedRefs.length > 0) {
    pagesHtml.push(`
      <section class="abnt-page ${doc.attachments.length > 0 ? 'page-break' : ''}">
        <h2 class="centered-heading">REFERÊNCIAS</h2>
        <div class="refs-list">
          ${sortedRefs.map((r) => `<p class="ref-item">${renderBoldHtml(r.formattedText)}</p>`).join('')}
        </div>
      </section>
    `);
  }

  doc.attachments.forEach((att, idx) => {
    const kindLabel = att.kind === 'apendice' ? 'APÊNDICE' : 'ANEXO';
    const isLast = idx === doc.attachments.length - 1;
    pagesHtml.push(`
      <section class="abnt-page ${isLast ? '' : 'page-break'}">
        <h2 class="centered-heading">${kindLabel} ${escapeHtml(att.letter)} — ${escapeHtml(att.title.toUpperCase())}</h2>
        ${
          att.description?.trim()
            ? `<p class="body-paragraph">${escapeHtml(att.description.trim())}</p>`
            : ''
        }
        ${
          att.imageDataUrl
            ? `
          <div class="figure-wrapper">
            <img src="${att.imageDataUrl}" alt="${escapeHtml(att.title)}" class="body-figure" />
            ${
              att.imageSource?.trim()
                ? `<p class="caption-source">Fonte: ${escapeHtml(att.imageSource.trim())}</p>`
                : ''
            }
          </div>
        `
            : ''
        }
      </section>
    `);
  });

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(doc.title)}</title>
  <style>
    @page {
      size: A4;
      margin: 3cm 2cm 2cm 3cm;
    }
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #000000;
      font-family: ${fontCss};
      font-size: 12pt;
      line-height: 1.5;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    .cover-page {
      min-height: 24.5cm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
    }
    .inst-logo {
      max-height: 78px;
      width: auto;
      margin: 0 auto 10pt auto;
      display: block;
    }
    .inst-line {
      margin: 0 0 3pt 0;
      font-size: 12pt;
      line-height: 1.35;
    }
    .cover-authors {
      margin-top: 2.5cm;
    }
    .author-line {
      margin: 0 0 4pt 0;
      font-size: 12pt;
    }
    .cover-title {
      margin: 3cm 0;
    }
    .title-main {
      font-size: 13pt;
      line-height: 1.4;
      margin: 0;
    }
    .nature-box {
      margin-left: 8cm;
      text-align: justify;
      font-size: 10pt;
      line-height: 1.15;
    }
    .nature-box p {
      margin: 0;
    }
    .cover-bottom p {
      margin: 0 0 3pt 0;
      font-size: 12pt;
      line-height: 1.35;
    }
    .centered-heading {
      text-align: center;
      font-size: 12pt;
      font-weight: bold;
      margin: 0 0 18pt 0;
      text-transform: uppercase;
    }
    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .toc-main {
      margin: 6pt 0;
      font-size: 12pt;
    }
    .toc-sub {
      margin: 4pt 0 4pt 1.25cm;
      font-size: 12pt;
    }
    .abstract-text {
      text-align: justify;
      line-height: 1.15;
      margin: 0 0 14pt 0;
      text-indent: 0;
    }
    .keywords-line {
      text-align: left;
      line-height: 1.2;
      margin: 0;
    }
    .section-spacer {
      margin-top: 22pt;
    }
    .section-heading {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 0 0 12pt 0;
    }
    .sub-heading {
      font-size: 12pt;
      font-weight: bold;
      margin: 14pt 0 8pt 0;
    }
    .body-paragraph {
      text-align: justify;
      text-indent: ${indentCss};
      line-height: 1.5;
      margin: 0 0 8pt 0;
    }
    .long-quote {
      margin: 12pt 0 12pt 4cm;
      font-size: 10pt;
      line-height: 1.15;
      text-align: justify;
    }
    .table-wrapper, .figure-wrapper {
      margin: 14pt 0;
      break-inside: avoid;
      text-align: center;
    }
    .caption-top {
      font-size: 10.5pt;
      font-weight: bold;
      margin: 0 0 6pt 0;
      text-align: center;
    }
    .caption-source {
      font-size: 10pt;
      margin: 6pt 0 0 0;
      text-align: center;
    }
    .abnt-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
      line-height: 1.25;
      text-align: left;
    }
    .abnt-table th, .abnt-table td {
      padding: 5pt 6pt;
      border-top: 1px solid #111;
      border-bottom: 1px solid #111;
    }
    .abnt-table thead th {
      border-top: 1.5px solid #000;
      border-bottom: 1.5px solid #000;
      font-weight: bold;
    }
    .body-figure {
      max-width: 100%;
      max-height: 12cm;
      width: auto;
      height: auto;
      margin: 0 auto;
      display: block;
    }
    .ref-item {
      text-align: left;
      line-height: 1.15;
      margin: 0 0 12pt 0;
      text-indent: 0;
    }
  </style>
</head>
<body>
  ${pagesHtml.join('\n')}
</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return;
  }

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  await new Promise((resolve) => setTimeout(resolve, 350));

  try {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  } finally {
    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch {}
    }, 1500);
  }
}
