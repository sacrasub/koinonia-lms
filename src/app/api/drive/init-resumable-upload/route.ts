import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const OFFICIAL_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_RECORDINGS_FOLDER_ID || '1hWiyU1z5AUM8VIdBsYmRf3iEYrhYDQ7w';

/**
 * Gera token de acesso OAuth2 para a Service Account usando RSA-SHA256
 */
async function getGoogleServiceAccountAccessToken(
  clientEmail: string,
  privateKey: string,
  scopes: string[] = ['https://www.googleapis.com/auth/drive']
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: clientEmail,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encode = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsignedToken = `${encode(header)}.${encode(claimSet)}`;

  const formattedKey = privateKey.replace(/\\n/g, '\n');
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  const signature = signer.sign(formattedKey, 'base64url');

  const signedJwt = `${unsignedToken}.${signature}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signedJwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    throw new Error(`Falha na autenticação da Service Account com o Google: ${errText}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fileName,
      fileSize,
      mimeType = 'video/webm',
      disciplinaId = 'disc-1',
      disciplinaName = 'Aula Sem Título',
      aulaNum = 1,
      recordedByName = 'Monitoria UIECB',
      folderId = OFFICIAL_DRIVE_FOLDER_ID,
    } = body;

    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!serviceAccountEmail || !privateKey) {
      return NextResponse.json(
        { error: 'Credenciais da Service Account do Google não configuradas no servidor.' },
        { status: 500 }
      );
    }

    const safeDiscName = (disciplinaName || 'Aula').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const dateFormatted = new Date().toISOString().slice(0, 10);
    const extension = (fileName || 'video.webm').split('.').pop() || 'webm';
    const finalFileName = `LMS_UIECB_Aula_${String(aulaNum).padStart(2, '0')}_${safeDiscName}_${dateFormatted}.${extension}`;

    const accessToken = await getGoogleServiceAccountAccessToken(serviceAccountEmail, privateKey);
    const origin = req.headers.get('origin') || 'https://koinonialms.vercel.app';

    // Inicia a sessão de Resumable Upload no Google Drive
    const initUploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': mimeType,
          'X-Upload-Content-Length': String(fileSize || 0),
          Origin: origin,
        },
        body: JSON.stringify({
          name: finalFileName,
          parents: [folderId || OFFICIAL_DRIVE_FOLDER_ID],
          description: `Gravação LMS UIECB • ${disciplinaName} • Aula ${aulaNum} • Gravado por ${recordedByName}`,
        }),
      }
    );

    if (!initUploadRes.ok) {
      const errText = await initUploadRes.text();
      console.error('Erro ao iniciar Resumable Upload no Google Drive:', errText);
      let userFriendlyMsg = `Google Drive recusou início da sessão de upload: ${errText}`;
      if (
        errText.includes('storageQuotaExceeded') ||
        errText.includes('Service Accounts do not have storage quota') ||
        errText.includes('usageLimits')
      ) {
        userFriendlyMsg = 'Cota do Google Drive: A conta de serviço não possui cota própria de armazenamento. O vídeo foi salvo com segurança no seu computador e você pode enviá-lo para a pasta oficial do Drive.';
      }
      return NextResponse.json(
        { error: userFriendlyMsg },
        { status: initUploadRes.status }
      );
    }

    const uploadLocationUrl = initUploadRes.headers.get('Location');
    if (!uploadLocationUrl) {
      return NextResponse.json(
        { error: 'Google Drive não retornou a URL de sessão de upload.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      uploadUrl: uploadLocationUrl,
      fileName: finalFileName,
      folderId: folderId || OFFICIAL_DRIVE_FOLDER_ID,
    });
  } catch (error: any) {
    console.error('Erro na rota /api/drive/init-resumable-upload:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao inicializar sessão de upload no Google Drive.' },
      { status: 500 }
    );
  }
}
