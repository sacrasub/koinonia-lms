'use client';

import React from 'react';
import { AbntArticleDocument } from '@/types/abntArticle';
import { INSTITUTION_PRESETS } from '@/data/abntTemplates';
import { parseBoldSegments, sortReferencesAlphabetically } from '@/lib/abntFormatter';

interface AbntPreviewDocumentProps {
  doc: AbntArticleDocument;
}

function BoldInline({ text }: { text: string }) {
  const segments = parseBoldSegments(text);
  return (
    <>
      {segments.map((seg, idx) =>
        seg.bold ? <strong key={idx}>{seg.text}</strong> : <React.Fragment key={idx}>{seg.text}</React.Fragment>
      )}
    </>
  );
}

export const AbntPreviewDocument: React.FC<AbntPreviewDocumentProps> = ({ doc }) => {
  const fontFamilyCss =
    doc.formatting.fontFamily === 'Times New Roman'
      ? '"Times New Roman", Times, serif'
      : 'Arial, Helvetica, sans-serif';
  const indentCss = `${doc.formatting.firstLineIndentCm}cm`;
  const logoSrc =
    INSTITUTION_PRESETS[doc.formatting.institutionPreset]?.logoPath || '/brasao-unimb.png';

  const authorsDisplay = doc.authors
    .map((a) => a.fullName.trim().toUpperCase())
    .filter(Boolean);
  const safeAuthors = authorsDisplay.length > 0 ? authorsDisplay : ['SEMINARISTA AUTOR'];
  const sortedRefs = sortReferencesAlphabetically(doc.references);

  let figIndex = 0;
  let tabIndex = 0;

  const sheetBaseStyle: React.CSSProperties = {
    fontFamily: fontFamilyCss,
    fontSize: '12pt',
    lineHeight: 1.5,
    color: '#000000',
    backgroundColor: '#ffffff',
  };

  return (
    <div
      data-preserve-light="true"
      data-preserve-color="true"
      data-preserve-border="true"
      className="abnt-print-sheet space-y-6"
    >
      {/* 1. CAPA */}
      {doc.formatting.showCover && (
        <div
          data-preserve-light="true"
          data-preserve-color="true"
          style={sheetBaseStyle}
          className="bg-white text-black border border-slate-300 shadow-sm mx-auto max-w-[210mm] min-h-[260mm] px-[12mm] sm:px-[25mm] py-[20mm] flex flex-col justify-between text-center rounded-sm"
        >
          <div className="space-y-1.5">
            {doc.formatting.showLogo && (
              <img
                src={logoSrc}
                alt="Brasão Institucional"
                className="h-20 w-auto mx-auto mb-3 object-contain"
              />
            )}
            <p style={{ color: '#000000' }} className="font-bold uppercase tracking-wide text-[12pt] leading-snug">
              {doc.institutionName || 'CENTRO UNIVERSITÁRIO MACIÇO DE BATURITÉ – UNIMB'}
            </p>
            <p style={{ color: '#000000' }} className="font-bold uppercase tracking-wide text-[12pt] leading-snug">
              {doc.courseName || 'CURSO DE BACHARELADO EM TEOLOGIA'}
            </p>
          </div>

          <div className="space-y-1 my-10">
            {safeAuthors.map((name, i) => (
              <p key={i} style={{ color: '#000000' }} className="font-bold uppercase text-[12pt]">
                {name}
              </p>
            ))}
          </div>

          <div className="my-12">
            <p style={{ color: '#000000' }} className="font-bold uppercase text-[13pt] leading-snug">
              {doc.title || 'TÍTULO DO TRABALHO'}
              {doc.subtitle?.trim() ? (
                <span className="font-normal normal-case">: {doc.subtitle.trim()}</span>
              ) : null}
            </p>
          </div>

          <div className="space-y-0.5">
            <p style={{ color: '#000000' }} className="font-bold uppercase text-[12pt]">
              {doc.city || 'BATURITÉ – CE'}
            </p>
            <p style={{ color: '#000000' }} className="font-bold text-[12pt]">
              {doc.year || '2026'}
            </p>
          </div>
        </div>
      )}

      {/* 2. FOLHA DE ROSTO */}
      {doc.formatting.showTitlePage && (
        <div
          data-preserve-light="true"
          data-preserve-color="true"
          style={sheetBaseStyle}
          className="bg-white text-black border border-slate-300 shadow-sm mx-auto max-w-[210mm] min-h-[260mm] px-[12mm] sm:px-[25mm] py-[20mm] flex flex-col justify-between text-center rounded-sm"
        >
          <div className="space-y-1">
            {safeAuthors.map((name, i) => (
              <p key={i} style={{ color: '#000000' }} className="font-bold uppercase text-[12pt]">
                {name}
              </p>
            ))}
          </div>

          <div className="my-10">
            <p style={{ color: '#000000' }} className="font-bold uppercase text-[13pt] leading-snug">
              {doc.title || 'TÍTULO DO TRABALHO'}
              {doc.subtitle?.trim() ? (
                <span className="font-normal normal-case">: {doc.subtitle.trim()}</span>
              ) : null}
            </p>
          </div>

          <div className="ml-auto w-full sm:w-1/2 text-justify text-[10pt] leading-[1.2] space-y-2">
            <p style={{ color: '#000000' }}>{doc.academicNatureNote}</p>
            {doc.professorName && (
              <p style={{ color: '#000000' }}>Orientação / Docente: {doc.professorName}</p>
            )}
          </div>

          <div className="space-y-0.5 mt-12">
            <p style={{ color: '#000000' }} className="font-bold uppercase text-[12pt]">
              {doc.city || 'BATURITÉ – CE'}
            </p>
            <p style={{ color: '#000000' }} className="font-bold text-[12pt]">
              {doc.year || '2026'}
            </p>
          </div>
        </div>
      )}

      {/* 3. SUMÁRIO */}
      {doc.formatting.showToc && (
        <div
          data-preserve-light="true"
          data-preserve-color="true"
          style={sheetBaseStyle}
          className="bg-white text-black border border-slate-300 shadow-sm mx-auto max-w-[210mm] px-[12mm] sm:px-[25mm] py-[20mm] rounded-sm space-y-4"
        >
          <h2 style={{ color: '#000000' }} className="text-center font-bold uppercase text-[12pt]">
            SUMÁRIO
          </h2>
          <div className="space-y-1.5 text-[12pt]">
            {doc.sections.map((sec) => (
              <React.Fragment key={sec.id}>
                <p style={{ color: '#000000' }} className="font-bold uppercase">
                  {sec.numberLabel} {sec.title}
                </p>
                {sec.blocks
                  .filter((b) => b.type === 'subheading')
                  .map((b) =>
                    b.type === 'subheading' ? (
                      <p key={b.id} style={{ color: '#000000' }} className="pl-6">
                        {b.numberLabel} {b.title}
                      </p>
                    ) : null
                  )}
              </React.Fragment>
            ))}
            {sortedRefs.length > 0 && (
              <p style={{ color: '#000000' }} className="font-bold uppercase">
                REFERÊNCIAS
              </p>
            )}
            {doc.attachments.map((att) => (
              <p key={att.id} style={{ color: '#000000' }} className="font-bold uppercase">
                {att.kind === 'apendice' ? 'APÊNDICE' : 'ANEXO'} {att.letter} — {att.title}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 4. RESUMO & ABSTRACT */}
      {doc.formatting.showAbstract && (
        <div
          data-preserve-light="true"
          data-preserve-color="true"
          style={sheetBaseStyle}
          className="bg-white text-black border border-slate-300 shadow-sm mx-auto max-w-[210mm] px-[12mm] sm:px-[25mm] py-[20mm] rounded-sm space-y-4"
        >
          <h2 style={{ color: '#000000' }} className="text-center font-bold uppercase text-[12pt]">
            RESUMO
          </h2>
          <p style={{ color: '#000000', lineHeight: 1.15 }} className="text-justify">
            {doc.resumo.trim() || '(Resumo ainda não redigido.)'}
          </p>
          {doc.palavrasChave.trim() && (
            <p style={{ color: '#000000', lineHeight: 1.2 }}>
              <strong>Palavras-chave:</strong> {doc.palavrasChave.trim()}
            </p>
          )}

          {doc.abstractEn.trim() && (
            <div className="pt-6 space-y-3">
              <h2 style={{ color: '#000000' }} className="text-center font-bold uppercase text-[12pt]">
                ABSTRACT
              </h2>
              <p style={{ color: '#000000', lineHeight: 1.15 }} className="text-justify">
                {doc.abstractEn.trim()}
              </p>
              {doc.keywordsEn.trim() && (
                <p style={{ color: '#000000', lineHeight: 1.2 }}>
                  <strong>Keywords:</strong> {doc.keywordsEn.trim()}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. CORPO DO TEXTO */}
      <div
        data-preserve-light="true"
        data-preserve-color="true"
        style={sheetBaseStyle}
        className="bg-white text-black border border-slate-300 shadow-sm mx-auto max-w-[210mm] px-[12mm] sm:px-[25mm] py-[20mm] rounded-sm space-y-6"
      >
        {doc.sections.map((sec) => (
          <div key={sec.id} className="space-y-3">
            <h2 style={{ color: '#000000' }} className="font-bold uppercase text-[12pt]">
              {sec.numberLabel} {sec.title}
            </h2>
            {sec.blocks.map((blk) => {
              if (blk.type === 'paragraph') {
                const paras = (blk.text || '')
                  .split(/\n{2,}/)
                  .map((p) => p.trim())
                  .filter(Boolean);
                if (paras.length === 0) {
                  return (
                    <p
                      key={blk.id}
                      style={{ color: '#64748b', textIndent: indentCss }}
                      className="italic text-[11pt]"
                    >
                      (Seção ainda sem texto redigido.)
                    </p>
                  );
                }
                return paras.map((p, pIdx) => (
                  <p
                    key={`${blk.id}-${pIdx}`}
                    style={{ color: '#000000', textIndent: indentCss }}
                    className="text-justify"
                  >
                    {p}
                  </p>
                ));
              }

              if (blk.type === 'long_quote') {
                return (
                  <blockquote
                    key={blk.id}
                    style={{
                      color: '#000000',
                      fontSize: '10pt',
                      lineHeight: 1.15,
                    }}
                    className="ml-8 sm:ml-[4cm] text-justify my-3"
                  >
                    {blk.text}
                    {blk.citation?.trim() ? ` ${blk.citation.trim()}` : ''}
                  </blockquote>
                );
              }

              if (blk.type === 'subheading') {
                return (
                  <h3 key={blk.id} style={{ color: '#000000' }} className="font-bold text-[12pt] pt-2">
                    {blk.numberLabel} {blk.title}
                  </h3>
                );
              }

              if (blk.type === 'table') {
                tabIndex++;
                return (
                  <div key={blk.id} className="my-4 space-y-1.5">
                    <p style={{ color: '#000000' }} className="text-center font-bold text-[10.5pt]">
                      Tabela {tabIndex} — {blk.title || 'Dados'}
                    </p>
                    <div className="overflow-x-auto">
                      <table
                        style={{ color: '#000000', fontSize: '10pt', lineHeight: 1.25 }}
                        className="w-full border-collapse text-left"
                      >
                        <thead>
                          <tr>
                            {blk.headers.map((h, i) => (
                              <th
                                key={i}
                                style={{ borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000', color: '#000' }}
                                className="px-2 py-1.5 font-bold"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {blk.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  style={{ borderBottom: '1px solid #333', color: '#000' }}
                                  className="px-2 py-1.5"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p style={{ color: '#000000' }} className="text-center text-[10pt]">
                      Fonte: {blk.source || 'Elaborado pelo autor.'}
                    </p>
                  </div>
                );
              }

              if (blk.type === 'figure' && blk.imageDataUrl) {
                figIndex++;
                return (
                  <div key={blk.id} className="my-4 text-center space-y-1.5">
                    <p style={{ color: '#000000' }} className="font-bold text-[10.5pt]">
                      Figura {figIndex} — {blk.title || 'Ilustração'}
                    </p>
                    <img
                      src={blk.imageDataUrl}
                      alt={blk.title || 'Figura ABNT'}
                      className="max-h-72 w-auto mx-auto object-contain"
                    />
                    <p style={{ color: '#000000' }} className="text-[10pt]">
                      Fonte: {blk.source || 'Arquivo do autor.'}
                    </p>
                  </div>
                );
              }

              return null;
            })}
          </div>
        ))}
      </div>

      {/* 6. REFERÊNCIAS */}
      {sortedRefs.length > 0 && (
        <div
          data-preserve-light="true"
          data-preserve-color="true"
          style={sheetBaseStyle}
          className="bg-white text-black border border-slate-300 shadow-sm mx-auto max-w-[210mm] px-[12mm] sm:px-[25mm] py-[20mm] rounded-sm space-y-4"
        >
          <h2 style={{ color: '#000000' }} className="text-center font-bold uppercase text-[12pt]">
            REFERÊNCIAS
          </h2>
          <div className="space-y-3 text-left" style={{ lineHeight: 1.15 }}>
            {sortedRefs.map((ref) => (
              <p key={ref.id} style={{ color: '#000000' }}>
                <BoldInline text={ref.formattedText} />
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 7. APÊNDICES & ANEXOS */}
      {doc.attachments.map((att) => (
        <div
          key={att.id}
          data-preserve-light="true"
          data-preserve-color="true"
          style={sheetBaseStyle}
          className="bg-white text-black border border-slate-300 shadow-sm mx-auto max-w-[210mm] px-[12mm] sm:px-[25mm] py-[20mm] rounded-sm space-y-4"
        >
          <h2 style={{ color: '#000000' }} className="text-center font-bold uppercase text-[12pt]">
            {att.kind === 'apendice' ? 'APÊNDICE' : 'ANEXO'} {att.letter} — {att.title}
          </h2>
          {att.description?.trim() && (
            <p style={{ color: '#000000', textIndent: indentCss }} className="text-justify">
              {att.description.trim()}
            </p>
          )}
          {att.imageDataUrl && (
            <div className="text-center space-y-1.5 pt-2">
              <img
                src={att.imageDataUrl}
                alt={att.title}
                className="max-h-96 w-auto mx-auto object-contain"
              />
              {att.imageSource?.trim() && (
                <p style={{ color: '#000000' }} className="text-[10pt]">
                  Fonte: {att.imageSource.trim()}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
