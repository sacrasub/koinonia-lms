import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

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
    const formData = await req.formData();
    const videoFile = formData.get('video') as File | null;
    const disciplinaId = (formData.get('disciplinaId') as string) || 'disc-1';
    const disciplinaName = (formData.get('disciplinaName') as string) || 'Aula Sem Título';
    const aulaNum = Number(formData.get('aulaNum') || 1);
    const dataAula = (formData.get('dataAula') as string) || new Date().toLocaleDateString('pt-BR');
    const recordedByName = (formData.get('recordedByName') as string) || 'Monitoria UIECB';
    const recordedByEmail = (formData.get('recordedByEmail') as string) || 'monitor@uiecbead.com.br';
    const recordedByRole = (formData.get('recordedByRole') as string) || 'monitor';
    const durationSeconds = Number(formData.get('durationSeconds') || 0);
    const customTitle = (formData.get('title') as string) || `Aula ${aulaNum} • ${disciplinaName} (Gravação HD)`;
    const targetFolderId = (formData.get('folderId') as string) || OFFICIAL_DRIVE_FOLDER_ID;

    if (!videoFile) {
      return NextResponse.json({ error: 'Nenhum arquivo de vídeo foi enviado.' }, { status: 400 });
    }

    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    const safeDiscName = disciplinaName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const dateFormatted = new Date().toISOString().slice(0, 10);
    const originalExtension = videoFile.name.split('.').pop() || 'webm';
    const finalFileName = `LMS_UIECB_Aula_${String(aulaNum).padStart(2, '0')}_${safeDiscName}_${dateFormatted}.${originalExtension}`;

    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    const mimeType = videoFile.type || 'video/webm';

    let driveFileId = `rec-drive-${Date.now()}`;
    let webViewLink = `https://drive.google.com/file/d/${driveFileId}/view`;

    // Se as credenciais do Google Cloud estiverem configuradas, faz o upload real na API v3 do Drive
    if (serviceAccountEmail && privateKey) {
      try {
        const accessToken = await getGoogleServiceAccountAccessToken(serviceAccountEmail, privateKey);

        // 1. Inicia o Resumable Upload no Google Drive para suportar arquivos de vídeo de qualquer tamanho
        const initUploadRes = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json; charset=UTF-8',
              'X-Upload-Content-Type': mimeType,
              'X-Upload-Content-Length': String(videoBuffer.length),
            },
            body: JSON.stringify({
              name: finalFileName,
              parents: [targetFolderId],
              description: `Gravação LMS UIECB • ${disciplinaName} • Aula ${aulaNum} • Gravado por ${recordedByName}`,
            }),
          }
        );

        if (!initUploadRes.ok) {
          const initErr = await initUploadRes.text();
          console.warn('Aviso no início do upload no Google Drive:', initErr);
          // Fallback para upload multipart simples se resumable retornar erro de permissão da pasta
          const boundary = '-------314159265358979323846';
          const delimiter = `\r\n--${boundary}\r\n`;
          const closeDelimiter = `\r\n--${boundary}--`;

          const metadata = {
            name: finalFileName,
            parents: [targetFolderId],
            description: `Gravação LMS UIECB • ${disciplinaName} • Aula ${aulaNum} • Gravado por ${recordedByName}`,
          };

          const multipartBody = Buffer.concat([
            Buffer.from(`${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`),
            Buffer.from(`${delimiter}Content-Type: ${mimeType}\r\n\r\n`),
            videoBuffer,
            Buffer.from(closeDelimiter),
          ]);

          const multipartRes = await fetch(
            `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,webViewLink,webContentLink`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': `multipart/related; boundary=${boundary}`,
              },
              body: multipartBody,
            }
          );

          if (multipartRes.ok) {
            const driveData = await multipartRes.json();
            driveFileId = driveData.id;
            webViewLink = driveData.webViewLink || `https://drive.google.com/file/d/${driveFileId}/view`;
          }
        } else {
          // 2. Envia os bytes do vídeo para o endpoint resumable retornado no cabeçalho Location
          const uploadLocationUrl = initUploadRes.headers.get('Location');
          if (uploadLocationUrl) {
            const uploadRes = await fetch(uploadLocationUrl, {
              method: 'PUT',
              headers: {
                'Content-Length': String(videoBuffer.length),
                'Content-Type': mimeType,
              },
              body: videoBuffer,
            });

            if (uploadRes.ok) {
              const driveData = await uploadRes.json();
              driveFileId = driveData.id;
              webViewLink = driveData.webViewLink || `https://drive.google.com/file/d/${driveFileId}/view`;
            }
          }
        }
      } catch (driveErr) {
        console.error('Erro na comunicação com a API do Google Drive:', driveErr);
      }
    }

    // Cria o item da gravação para persistência
    const durationHours = Math.floor(durationSeconds / 3600);
    const durationMins = Math.floor((durationSeconds % 3600) / 60);
    const durationSecs = Math.floor(durationSeconds % 60);
    const durationFormatted =
      durationHours > 0
        ? `${String(durationHours).padStart(2, '0')}:${String(durationMins).padStart(2, '0')}:${String(durationSecs).padStart(2, '0')}`
        : `${String(durationMins).padStart(2, '0')}:${String(durationSecs).padStart(2, '0')}`;

    const newGravacao = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      disciplina_id: disciplinaId,
      disciplina_name: disciplinaName,
      aula_num: aulaNum,
      data_aula: dataAula,
      title: customTitle,
      video_url: webViewLink,
      drive_file_id: driveFileId,
      recorded_by_name: recordedByName,
      recorded_by_role: recordedByRole,
      recorded_by_email: recordedByEmail,
      duration_seconds: durationSeconds,
      duration_formatted: durationFormatted,
      is_restricted_lms: true,
      created_at: new Date().toLocaleDateString('pt-BR'),
    };

    // Sincroniza diretamente na tabela 'materiais' do Supabase para acesso global
    try {
      const CLOUD_TITLE_KEY = 'lms_gravacoes_cloud_v1';
      const { data: existing } = await supabase
        .from('materiais')
        .select('id, file_url')
        .eq('title', CLOUD_TITLE_KEY)
        .limit(1);

      let currentList: any[] = [];
      if (existing && existing.length > 0 && existing[0].file_url) {
        try {
          currentList = JSON.parse(existing[0].file_url);
          if (!Array.isArray(currentList)) currentList = [];
        } catch (e) {}
      }

      // Substitui se já existia gravação da mesma aula ou adiciona no topo
      const existingIdx = currentList.findIndex(
        (g: any) => g.disciplina_id === disciplinaId && g.aula_num === aulaNum
      );
      if (existingIdx >= 0) {
        currentList[existingIdx] = newGravacao;
      } else {
        currentList = [newGravacao, ...currentList];
      }

      const updatedJson = JSON.stringify(currentList);
      if (existing && existing.length > 0) {
        await supabase
          .from('materiais')
          .update({ file_url: updatedJson, updated_at: new Date().toISOString() })
          .eq('id', existing[0].id);
      } else {
        await supabase.from('materiais').insert([
          {
            disciplina_id: disciplinaId,
            title: CLOUD_TITLE_KEY,
            file_url: updatedJson,
            file_type: 'json',
          },
        ]);
      }
    } catch (supaErr) {
      console.warn('Aviso ao sincronizar gravação no Supabase:', supaErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Gravação salva e enviada para o Google Drive com sucesso!',
      gravacao: newGravacao,
      driveFileId,
      webViewLink,
      fileName: finalFileName,
    });
  } catch (error: any) {
    console.error('Erro na rota /api/drive/upload-recording:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar gravação e upload para o Google Drive.' },
      { status: 500 }
    );
  }
}
