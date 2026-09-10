import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function extractDriveFileId(driveUrlOrId: string): string | null {
  if (!driveUrlOrId) return null;
  const match = driveUrlOrId.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                driveUrlOrId.match(/id=([a-zA-Z0-9_-]+)/) ||
                driveUrlOrId.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) return match[1];
  if (!driveUrlOrId.startsWith('http') && !driveUrlOrId.startsWith('custom-') && !driveUrlOrId.startsWith('18-whatsapp') && !driveUrlOrId.startsWith('rec-book-')) {
    return driveUrlOrId;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const driveIdOrUrl = body.driveId || body.drive_url || body.pdfUrl || '';
    const fileId = extractDriveFileId(driveIdOrUrl);

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'ID ou link do Google Drive não identificado.' },
        { status: 400 }
      );
    }

    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
    
    // Timeout de 25 segundos para download
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const driveRes = await fetch(downloadUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    clearTimeout(timeoutId);

    if (!driveRes.ok) {
      return NextResponse.json(
        { success: false, error: `Falha ao baixar PDF do Google Drive (HTTP ${driveRes.status})` },
        { status: 502 }
      );
    }

    const arrayBuf = await driveRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    if (!buffer || buffer.length === 0) {
      return NextResponse.json(
        { success: false, error: 'O arquivo PDF retornado está vazio.' },
        { status: 400 }
      );
    }

    // Instancia o parser de PDF
    const parser = new PDFParse({ data: buffer });
    await (parser as any).load?.();
    const textData = await parser.getText();

    const totalPages = textData.total || (textData.pages ? textData.pages.length : 0);
    const rawPages = textData.pages || [];

    // Limpa e formata o texto de cada folha
    const formattedPages: string[] = [];
    let totalTextChars = 0;

    for (let i = 0; i < rawPages.length; i++) {
      const page = rawPages[i];
      const pageText = (page.text || '')
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      totalTextChars += pageText.length;
      if (pageText.length > 0) {
        formattedPages.push(pageText);
      } else {
        formattedPages.push(`[Página ${i + 1} - Sem camada de texto digital / Imagem escaneada]`);
      }
    }

    // Se o total de caracteres de texto digital for quase zero, é um fac-símile escaneado
    const isScanned = totalTextChars < 60;

    return NextResponse.json({
      success: true,
      fileId,
      totalPages,
      isScanned,
      pages: isScanned ? [] : formattedPages,
      message: isScanned
        ? 'Este livro é uma digitalização fac-símile (imagens escaneadas sem camada de texto digital selecionável).'
        : `Sucesso: ${formattedPages.length} páginas extraídas com texto digital.`,
    });

  } catch (err: any) {
    console.error('Erro na extração de páginas do PDF:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro interno ao processar PDF' },
      { status: 500 }
    );
  }
}
