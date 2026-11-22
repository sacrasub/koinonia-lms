import {
  AlignmentType,
  BorderStyle,
  Document,
  Header,
  ImageRun,
  Packer,
  PageNumber,
  Paragraph,
  SectionType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  convertMillimetersToTwip,
} from 'docx';
import { AbntArticleDocument } from '@/types/abntArticle';
import {
  SEMINARIO_LOGO_PATH,
  UNIMB_LOGO_PATH,
} from '@/data/abntTemplates';
import {
  parseBoldSegments,
  slugifyFileName,
  sortReferencesAlphabetically,
} from '@/lib/abntFormatter';

export interface AbntDocxLogos {
  unimb?: Uint8Array;
  seminario?: Uint8Array;
}

const A4_WIDTH_TWIP = convertMillimetersToTwip(210);
const A4_HEIGHT_TWIP = convertMillimetersToTwip(297);
const MARGIN_TOP_TWIP = convertMillimetersToTwip(30);
const MARGIN_LEFT_TWIP = convertMillimetersToTwip(30);
const MARGIN_BOTTOM_TWIP = convertMillimetersToTwip(20);
const MARGIN_RIGHT_TWIP = convertMillimetersToTwip(20);
const INDENT_125_TWIP = convertMillimetersToTwip(12.5);
const INDENT_400_TWIP = convertMillimetersToTwip(40);
const INDENT_800_TWIP = convertMillimetersToTwip(80);

function detectImageTypeFromBytes(bytes: Uint8Array): 'png' | 'jpg' {
  if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'png';
  }
  return 'jpg';
}

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; type: 'png' | 'jpg' } | null {
  try {
    if (!dataUrl || !dataUrl.includes(',')) return null;
    const [meta, base64] = dataUrl.split(',', 2);
    if (!base64) return null;
    const isPng = meta.toLowerCase().includes('image/png');
    if (typeof atob === 'function') {
      const bin = atob(base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      return { bytes, type: isPng ? 'png' : 'jpg' };
    }
    if (typeof Buffer !== 'undefined') {
      const buf = Buffer.from(base64, 'base64');
      return { bytes: new Uint8Array(buf), type: isPng ? 'png' : 'jpg' };
    }
    return null;
  } catch {
    return null;
  }
}

function makeBoldTextRuns(text: string, font: string, sizeHalfPts = 24): TextRun[] {
  return parseBoldSegments(text).map(
    (seg) =>
      new TextRun({
        text: seg.text,
        bold: seg.bold,
        font,
        size: sizeHalfPts,
        color: '000000',
      })
  );
}

/**
 * Constrói o objeto `Document` completo no padrão ABNT (A4, margens 3/3/2/2 cm,
 * espaçamento 1,5, citação longa 4 cm em 10pt, referências alinhadas à esquerda e imagens).
 */
export function buildAbntDocxDocument(
  doc: AbntArticleDocument,
  logoInput?: Uint8Array | AbntDocxLogos
): Document {
  const font = doc.formatting.fontFamily === 'Times New Roman' ? 'Times New Roman' : 'Arial';
  const firstLineIndent = doc.formatting.firstLineIndentCm === 1.25 ? INDENT_125_TWIP : 0;
  const logoLayout = doc.formatting.logoLayout || 'both';
  const logos: AbntDocxLogos =
    logoInput instanceof Uint8Array
      ? { unimb: logoInput }
      : logoInput || {};

  const sortedAuthors = doc.authors
    .map((a) => a.fullName.trim().toUpperCase())
    .filter(Boolean);
  const safeAuthors = sortedAuthors.length > 0 ? sortedAuthors : ['SEMINARISTA AUTOR'];
  const sortedRefs = sortReferencesAlphabetically(doc.references);

  const pageConfig = {
    size: {
      width: A4_WIDTH_TWIP,
      height: A4_HEIGHT_TWIP,
    },
    margin: {
      top: MARGIN_TOP_TWIP,
      left: MARGIN_LEFT_TWIP,
      bottom: MARGIN_BOTTOM_TWIP,
      right: MARGIN_RIGHT_TWIP,
    },
  };

  const preTextualChildren: (Paragraph | Table)[] = [];
  let hasPreTextual = false;

  const pushPageBreakBeforeNext = () => {
    if (hasPreTextual) {
      preTextualChildren.push(new Paragraph({ pageBreakBefore: true, children: [] }));
    }
    hasPreTextual = true;
  };

  // 1. CAPA
  if (doc.formatting.showCover) {
    pushPageBreakBeforeNext();

    if (doc.formatting.showLogo) {
      const noBorder = {
        style: BorderStyle.NONE,
        size: 0,
        color: 'FFFFFF',
      };

      if (logoLayout === 'both' && logos.seminario && logos.unimb) {
        preTextualChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: noBorder,
              bottom: noBorder,
              left: noBorder,
              right: noBorder,
              insideHorizontal: noBorder,
              insideVertical: noBorder,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 180 },
                        children: [
                          new ImageRun({
                            type: detectImageTypeFromBytes(logos.seminario),
                            data: logos.seminario,
                            transformation: { width: 132, height: 96 },
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 180 },
                        children: [
                          new ImageRun({
                            type: detectImageTypeFromBytes(logos.unimb),
                            data: logos.unimb,
                            transformation: { width: 110, height: 101 },
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      } else {
        const singleLogo =
          logoLayout === 'stc'
            ? logos.seminario || logos.unimb
            : logos.unimb || logos.seminario;
        if (singleLogo && singleLogo.length > 0) {
          preTextualChildren.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 180 },
              children: [
                new ImageRun({
                  type: detectImageTypeFromBytes(singleLogo),
                  data: singleLogo,
                  transformation:
                    logoLayout === 'stc'
                      ? { width: 132, height: 96 }
                      : { width: 110, height: 101 },
                }),
              ],
            })
          );
        }
      }
    }

    const cleanDiscCover = (doc.disciplinaName || '').replace(/^\d+\s*-\s*/, '').trim();
    const showDiscBlock = Boolean(doc.formatting.showDisciplinaOnCover && cleanDiscCover);

    preTextualChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: 300, before: 240, after: 60 },
        children: [
          new TextRun({
            text: (doc.institutionName || 'CENTRO UNIVERSITÁRIO MACIÇO DE BATURITÉ – UNIMB').toUpperCase(),
            bold: true,
            font,
            size: 24,
            color: '000000',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: 300, after: showDiscBlock ? 900 : 1600 },
        children: [
          new TextRun({
            text: (doc.courseName || 'CURSO DE BACHARELADO EM TEOLOGIA').toUpperCase(),
            bold: true,
            font,
            size: 24,
            color: '000000',
          }),
        ],
      })
    );

    if (showDiscBlock) {
      preTextualChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { line: 300, after: doc.professorName?.trim() ? 60 : 900 },
          children: [
            new TextRun({
              text: cleanDiscCover.toUpperCase(),
              bold: true,
              font,
              size: 24,
              color: '000000',
            }),
          ],
        })
      );
      if (doc.professorName?.trim()) {
        preTextualChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 300, after: 900 },
            children: [
              new TextRun({
                text: doc.professorName.trim().toUpperCase(),
                bold: true,
                font,
                size: 24,
                color: '000000',
              }),
            ],
          })
        );
      }
    }

    safeAuthors.forEach((author, idx) => {
      const isLast = idx === safeAuthors.length - 1;
      const authorText =
        showDiscBlock && idx === 0
          ? `${safeAuthors.length > 1 ? 'ALUNOS' : 'ALUNO'}: ${author}`
          : author;
      preTextualChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { line: 300, after: isLast ? (showDiscBlock ? 1800 : 2400) : 80 },
          children: [
            new TextRun({
              text: authorText,
              bold: true,
              font,
              size: 24,
              color: '000000',
            }),
          ],
        })
      );
    });

    preTextualChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: 360, after: 3400 },
        children: [
          new TextRun({
            text: (doc.title || 'TÍTULO DO TRABALHO').toUpperCase(),
            bold: true,
            font,
            size: 26,
            color: '000000',
          }),
          ...(doc.subtitle?.trim()
            ? [
                new TextRun({
                  text: `: ${doc.subtitle.trim()}`,
                  bold: false,
                  font,
                  size: 26,
                  color: '000000',
                }),
              ]
            : []),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: 280, after: 40 },
        children: [
          new TextRun({
            text: (doc.city || 'BATURITÉ – CE').toUpperCase(),
            bold: true,
            font,
            size: 24,
            color: '000000',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: 280, after: 0 },
        children: [
          new TextRun({
            text: doc.year || '2026',
            bold: true,
            font,
            size: 24,
            color: '000000',
          }),
        ],
      })
    );
  }

  // 2. FOLHA DE ROSTO
  if (doc.formatting.showTitlePage) {
    pushPageBreakBeforeNext();
    safeAuthors.forEach((author, idx) => {
      const isLast = idx === safeAuthors.length - 1;
      preTextualChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { line: 300, after: isLast ? 2200 : 80 },
          children: [
            new TextRun({
              text: author,
              bold: true,
              font,
              size: 24,
              color: '000000',
            }),
          ],
        })
      );
    });

    preTextualChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: 360, after: 1400 },
        children: [
          new TextRun({
            text: (doc.title || 'TÍTULO DO TRABALHO').toUpperCase(),
            bold: true,
            font,
            size: 26,
            color: '000000',
          }),
          ...(doc.subtitle?.trim()
            ? [
                new TextRun({
                  text: `: ${doc.subtitle.trim()}`,
                  bold: false,
                  font,
                  size: 26,
                  color: '000000',
                }),
              ]
            : []),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: INDENT_800_TWIP },
        spacing: { line: 240, after: 120 },
        children: [
          new TextRun({
            text: doc.academicNatureNote || '',
            font,
            size: 20,
            color: '000000',
          }),
        ],
      }),
      ...(doc.professorName?.trim()
        ? [
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              indent: { left: INDENT_800_TWIP },
              spacing: { line: 240, after: 2200 },
              children: [
                new TextRun({
                  text: `Orientação / Docente: ${doc.professorName.trim()}`,
                  font,
                  size: 20,
                  color: '000000',
                }),
              ],
            }),
          ]
        : [
            new Paragraph({
              spacing: { after: 2200 },
              children: [],
            }),
          ]),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: 280, after: 40 },
        children: [
          new TextRun({
            text: (doc.city || 'BATURITÉ – CE').toUpperCase(),
            bold: true,
            font,
            size: 24,
            color: '000000',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: 280, after: 0 },
        children: [
          new TextRun({
            text: doc.year || '2026',
            bold: true,
            font,
            size: 24,
            color: '000000',
          }),
        ],
      })
    );
  }

  // 3. SUMÁRIO
  if (doc.formatting.showToc) {
    pushPageBreakBeforeNext();
    preTextualChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: 360, after: 360 },
        children: [
          new TextRun({
            text: 'SUMÁRIO',
            bold: true,
            font,
            size: 24,
            color: '000000',
          }),
        ],
      })
    );

    doc.sections.forEach((sec) => {
      preTextualChildren.push(
        new Paragraph({
          spacing: { line: 360, after: 80 },
          children: [
            new TextRun({
              text: `${sec.numberLabel} ${sec.title.toUpperCase()}`,
              bold: true,
              font,
              size: 24,
              color: '000000',
            }),
          ],
        })
      );
      sec.blocks
        .filter((b) => b.type === 'subheading')
        .forEach((b) => {
          if (b.type === 'subheading') {
            preTextualChildren.push(
              new Paragraph({
                indent: { left: INDENT_125_TWIP },
                spacing: { line: 360, after: 60 },
                children: [
                  new TextRun({
                    text: `${b.numberLabel} ${b.title}`,
                    font,
                    size: 24,
                    color: '000000',
                  }),
                ],
              })
            );
          }
        });
    });

    if (sortedRefs.length > 0) {
      preTextualChildren.push(
        new Paragraph({
          spacing: { line: 360, after: 80 },
          children: [
            new TextRun({
              text: 'REFERÊNCIAS',
              bold: true,
              font,
              size: 24,
              color: '000000',
            }),
          ],
        })
      );
    }

    doc.attachments.forEach((att) => {
      const kind = att.kind === 'apendice' ? 'APÊNDICE' : 'ANEXO';
      preTextualChildren.push(
        new Paragraph({
          spacing: { line: 360, after: 80 },
          children: [
            new TextRun({
              text: `${kind} ${att.letter} — ${att.title.toUpperCase()}`,
              bold: true,
              font,
              size: 24,
              color: '000000',
            }),
          ],
        })
      );
    });
  }

  // 4. RESUMO & ABSTRACT (NBR 6028)
  if (doc.formatting.showAbstract) {
    pushPageBreakBeforeNext();
    preTextualChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: 360, after: 300 },
        children: [
          new TextRun({
            text: 'RESUMO',
            bold: true,
            font,
            size: 24,
            color: '000000',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 240, after: 220 },
        children: [
          new TextRun({
            text: doc.resumo?.trim() || '(Resumo ainda não redigido.)',
            font,
            size: 24,
            color: '000000',
          }),
        ],
      })
    );

    if (doc.palavrasChave?.trim()) {
      preTextualChildren.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line: 240, after: 480 },
          children: [
            new TextRun({
              text: 'Palavras-chave: ',
              bold: true,
              font,
              size: 24,
              color: '000000',
            }),
            new TextRun({
              text: doc.palavrasChave.trim(),
              font,
              size: 24,
              color: '000000',
            }),
          ],
        })
      );
    }

    if (doc.abstractEn?.trim()) {
      preTextualChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { line: 360, before: 360, after: 300 },
          children: [
            new TextRun({
              text: 'ABSTRACT',
              bold: true,
              font,
              size: 24,
              color: '000000',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { line: 240, after: 220 },
          children: [
            new TextRun({
              text: doc.abstractEn.trim(),
              font,
              size: 24,
              color: '000000',
            }),
          ],
        })
      );

      if (doc.keywordsEn?.trim()) {
        preTextualChildren.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 240, after: 240 },
            children: [
              new TextRun({
                text: 'Keywords: ',
                bold: true,
                font,
                size: 24,
                color: '000000',
              }),
              new TextRun({
                text: doc.keywordsEn.trim(),
                font,
                size: 24,
                color: '000000',
              }),
            ],
          })
        );
      }
    }
  }

  // 5. CORPO TEXTUAL + PÓS-TEXTUAIS
  const bodyChildren: (Paragraph | Table)[] = [];
  let figCounter = 0;
  let tabCounter = 0;

  doc.sections.forEach((sec, secIdx) => {
    bodyChildren.push(
      new Paragraph({
        spacing: { before: secIdx === 0 ? 0 : 280, after: 180, line: 360 },
        children: [
          new TextRun({
            text: `${sec.numberLabel} ${sec.title.toUpperCase()}`,
            bold: true,
            font,
            size: 24,
            color: '000000',
          }),
        ],
      })
    );

    sec.blocks.forEach((blk) => {
      switch (blk.type) {
        case 'paragraph': {
          const paras = (blk.text || '')
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean);
          paras.forEach((p) => {
            bodyChildren.push(
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                indent: { firstLine: firstLineIndent },
                spacing: { line: 360, after: 140 },
                children: [
                  new TextRun({
                    text: p,
                    font,
                    size: 24,
                    color: '000000',
                  }),
                ],
              })
            );
          });
          break;
        }

        case 'long_quote': {
          bodyChildren.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              indent: { left: INDENT_400_TWIP },
              spacing: { line: 240, before: 160, after: 180 },
              children: [
                new TextRun({
                  text: `${blk.text.trim()}${blk.citation?.trim() ? ` ${blk.citation.trim()}` : ''}`,
                  font,
                  size: 20,
                  color: '000000',
                }),
              ],
            })
          );
          break;
        }

        case 'subheading': {
          bodyChildren.push(
            new Paragraph({
              spacing: { line: 360, before: 200, after: 120 },
              children: [
                new TextRun({
                  text: `${blk.numberLabel} ${blk.title}`,
                  bold: true,
                  font,
                  size: 24,
                  color: '000000',
                }),
              ],
            })
          );
          break;
        }

        case 'table': {
          tabCounter++;
          const colCount = Math.max(1, blk.headers.length);
          const colWidth = Math.floor(8500 / colCount);
          const horizontalBorder = {
            style: BorderStyle.SINGLE,
            size: 6,
            color: '000000',
          };
          const noBorder = {
            style: BorderStyle.NONE,
            size: 0,
            color: 'FFFFFF',
          };

          bodyChildren.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 180, after: 80, line: 240 },
              children: [
                new TextRun({
                  text: `Tabela ${tabCounter} — ${blk.title || 'Dados'}`,
                  bold: true,
                  font,
                  size: 21,
                  color: '000000',
                }),
              ],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  tableHeader: true,
                  children: blk.headers.map(
                    (h) =>
                      new TableCell({
                        width: { size: colWidth, type: WidthType.DXA },
                        borders: {
                          top: horizontalBorder,
                          bottom: horizontalBorder,
                          left: noBorder,
                          right: noBorder,
                        },
                        children: [
                          new Paragraph({
                            spacing: { line: 240, before: 60, after: 60 },
                            children: [
                              new TextRun({
                                text: h,
                                bold: true,
                                font,
                                size: 20,
                                color: '000000',
                              }),
                            ],
                          }),
                        ],
                      })
                  ),
                }),
                ...blk.rows.map(
                  (row) =>
                    new TableRow({
                      children: row.map(
                        (cell) =>
                          new TableCell({
                            width: { size: colWidth, type: WidthType.DXA },
                            borders: {
                              top: horizontalBorder,
                              bottom: horizontalBorder,
                              left: noBorder,
                              right: noBorder,
                            },
                            children: [
                              new Paragraph({
                                spacing: { line: 240, before: 50, after: 50 },
                                children: [
                                  new TextRun({
                                    text: cell,
                                    font,
                                    size: 20,
                                    color: '000000',
                                  }),
                                ],
                              }),
                            ],
                          })
                      ),
                    })
                ),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 180, line: 240 },
              children: [
                new TextRun({
                  text: `Fonte: ${blk.source || 'Elaborado pelo autor.'}`,
                  font,
                  size: 20,
                  color: '000000',
                }),
              ],
            })
          );
          break;
        }

        case 'figure': {
          const parsedImg = dataUrlToBytes(blk.imageDataUrl);
          if (!parsedImg) break;
          figCounter++;
          bodyChildren.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 180, after: 80, line: 240 },
              children: [
                new TextRun({
                  text: `Figura ${figCounter} — ${blk.title || 'Ilustração'}`,
                  bold: true,
                  font,
                  size: 21,
                  color: '000000',
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 },
              children: [
                new ImageRun({
                  type: parsedImg.type,
                  data: parsedImg.bytes,
                  transformation: { width: 440, height: 290 },
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 180, line: 240 },
              children: [
                new TextRun({
                  text: `Fonte: ${blk.source || 'Arquivo do autor.'}`,
                  font,
                  size: 20,
                  color: '000000',
                }),
              ],
            })
          );
          break;
        }
      }
    });
  });

  // 6. REFERÊNCIAS (NBR 6023)
  if (sortedRefs.length > 0) {
    bodyChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        spacing: { line: 360, after: 300 },
        children: [
          new TextRun({
            text: 'REFERÊNCIAS',
            bold: true,
            font,
            size: 24,
            color: '000000',
          }),
        ],
      })
    );

    sortedRefs.forEach((ref) => {
      bodyChildren.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line: 240, after: 220 },
          children: makeBoldTextRuns(ref.formattedText, font, 24),
        })
      );
    });
  }

  // 7. APÊNDICES & ANEXOS
  doc.attachments.forEach((att) => {
    const kindLabel = att.kind === 'apendice' ? 'APÊNDICE' : 'ANEXO';
    bodyChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        spacing: { line: 360, after: 280 },
        children: [
          new TextRun({
            text: `${kindLabel} ${att.letter} — ${att.title.toUpperCase()}`,
            bold: true,
            font,
            size: 24,
            color: '000000',
          }),
        ],
      })
    );

    if (att.description?.trim()) {
      bodyChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: firstLineIndent },
          spacing: { line: 360, after: 180 },
          children: [
            new TextRun({
              text: att.description.trim(),
              font,
              size: 24,
              color: '000000',
            }),
          ],
        })
      );
    }

    if (att.imageDataUrl) {
      const parsedImg = dataUrlToBytes(att.imageDataUrl);
      if (parsedImg) {
        bodyChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 80 },
            children: [
              new ImageRun({
                type: parsedImg.type,
                data: parsedImg.bytes,
                transformation: { width: 460, height: 320 },
              }),
            ],
          })
        );
        if (att.imageSource?.trim()) {
          bodyChildren.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 180, line: 240 },
              children: [
                new TextRun({
                  text: `Fonte: ${att.imageSource.trim()}`,
                  font,
                  size: 20,
                  color: '000000',
                }),
              ],
            })
          );
        }
      }
    }
  });

  const sections = [];

  if (preTextualChildren.length > 0) {
    sections.push({
      properties: {
        page: pageConfig,
      },
      children: preTextualChildren,
    });
  }

  const pageNumberParagraph = new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [
      new TextRun({
        children: [PageNumber.CURRENT],
        font,
        size: 20,
        color: '000000',
      }),
    ],
  });

  sections.push({
    properties: {
      ...(preTextualChildren.length > 0 ? { type: SectionType.NEXT_PAGE } : {}),
      page: pageConfig,
    },
    headers: {
      default: new Header({
        children: [pageNumberParagraph],
      }),
    },
    children: bodyChildren.length > 0 ? bodyChildren : [new Paragraph({ children: [] })],
  });

  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font,
            size: 24,
            color: '000000',
          },
        },
      },
    },
    sections,
  });
}

async function fetchLogoBytes(path: string): Promise<Uint8Array | undefined> {
  try {
    const res = await fetch(path);
    if (!res.ok) return undefined;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return undefined;
  }
}

export async function downloadAbntDocx(doc: AbntArticleDocument): Promise<void> {
  const logos: AbntDocxLogos = {};
  if (doc.formatting.showLogo) {
    const layout = doc.formatting.logoLayout || 'both';
    const [unimb, seminario] = await Promise.all([
      layout === 'both' || layout === 'unimb' ? fetchLogoBytes(UNIMB_LOGO_PATH) : Promise.resolve(undefined),
      layout === 'both' || layout === 'stc' ? fetchLogoBytes(SEMINARIO_LOGO_PATH) : Promise.resolve(undefined),
    ]);
    logos.unimb = unimb;
    logos.seminario = seminario;
  }

  const wordDoc = buildAbntDocxDocument(doc, logos);
  const blob = await Packer.toBlob(wordDoc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const prefix = doc.formatting.institutionPreset === 'koinonia' ? 'Koinonia' : 'UniMB';
  link.download = `${prefix}_ABNT_${slugifyFileName(doc.title)}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
