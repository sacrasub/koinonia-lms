import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
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

/**
 * Autentica com a Google Cloud Service Account via JWT assinado (RS256)
 * para acessar PDFs da pasta restrita do seminário ou de drives protegidos.
 */
async function getServiceAccountToken(): Promise<string | null> {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!serviceAccountEmail || !privateKey) return null;

  try {
    privateKey = privateKey.replace(/\\n/g, '\n');
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const claim = Buffer.from(
      JSON.stringify({
        iss: serviceAccountEmail,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
      })
    ).toString('base64url');

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(`${header}.${claim}`);
    const signature = signer.sign(privateKey, 'base64url');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: `${header}.${claim}.${signature}`,
      }),
    });

    if (!tokenResponse.ok) {
      console.warn('Falha na troca de JWT token da Service Account:', await tokenResponse.text());
      return null;
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token || null;
  } catch (err) {
    console.warn('Exceção ao gerar token JWT de Service Account:', err);
    return null;
  }
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

    let buffer: Buffer | null = null;

    // 1. Tenta download autenticado via Google Cloud Service Account
    const accessToken = await getServiceAccountToken();
    if (accessToken) {
      try {
        const driveApiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        const res = await fetch(driveApiUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const ab = await res.arrayBuffer();
          buffer = Buffer.from(ab);
        }
      } catch (err) {
        console.warn('Tentativa via Service Account API falhou, tentando fallback público:', err);
      }
    }

    // 2. Fallback: download direto com cabeçalhos de navegador
    if (!buffer || buffer.length === 0) {
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const driveRes = await fetch(downloadUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      clearTimeout(timeoutId);

      if (driveRes.ok) {
        const contentType = driveRes.headers.get('content-type') || '';
        // Se retornar HTML (ex: tela de confirmação de vírus do Google Drive ou login), não é PDF
        if (!contentType.includes('text/html')) {
          const arrayBuf = await driveRes.arrayBuffer();
          buffer = Buffer.from(arrayBuf);
        }
      }
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Não foi possível baixar os dados do PDF diretamente. O arquivo pode requerer permissão individual no Google Drive.',
          fileId
        },
        { status: 422 }
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
        ? 'Este livro é uma digitalização fac-símile (imagens escaneadas sem camada de texto digital).'
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
