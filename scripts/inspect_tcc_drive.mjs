import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Ler .env.local manualmente
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  if (!match) return null;
  let val = match[1].trim();
  if (val.startsWith('"') && val.endsWith('"')) {
    val = val.slice(1, -1).replace(/\\n/g, '\n');
  }
  return val;
}

const serviceAccountEmail = getEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL');
const privateKey = getEnv('GOOGLE_PRIVATE_KEY');
const targetFolderId = '1vHSvT4AcuAtZpE1yedw7OuMmcTKUyvNX';

console.log('Alvo Folder ID:', targetFolderId);
console.log('Service Account:', serviceAccountEmail);

async function inspectFolder() {
  try {
    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const jwtClaimSet = Buffer.from(
      JSON.stringify({
        iss: serviceAccountEmail,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
      })
    ).toString('base64url');

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(`${jwtHeader}.${jwtClaimSet}`);
    const signature = sign.sign(privateKey, 'base64url');
    const assertion = `${jwtHeader}.${jwtClaimSet}.${signature}`;

    console.log('Obtendo access_token do Google OAuth...');
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
    });

    if (!tokenRes.ok) {
      const errTxt = await tokenRes.text();
      console.error('Falha ao obter token:', errTxt);
      return;
    }

    const { access_token } = await tokenRes.json();
    console.log('Token obtido com sucesso!');

    // 1. Detalhes da pasta
    const folderRes = await fetch(`https://www.googleapis.com/drive/v3/files/${targetFolderId}?fields=id,name,mimeType,webViewLink`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const folderData = await folderRes.json();
    console.log('\n--- DETALHES DA PASTA ---');
    console.log(JSON.stringify(folderData, null, 2));

    // 2. Arquivos dentro da pasta
    const filesRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${targetFolderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,webViewLink,size,webContentLink,createdTime)&pageSize=100`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    const filesData = await filesRes.json();
    console.log('\n--- ARQUIVOS ENCONTRADOS ---');
    console.log(`Total: ${filesData.files?.length || 0} itens`);
    (filesData.files || []).forEach((f, idx) => {
      console.log(`[${idx + 1}] ${f.name} (${f.mimeType}) - ID: ${f.id}`);
      console.log(`    Link: ${f.webViewLink}`);
    });

    // Salvar resultado em JSON para uso nos serviços do LMS
    fs.writeFileSync(
      path.join(process.cwd(), 'scripts', 'tcc_drive_files.json'),
      JSON.stringify(filesData.files || [], null, 2)
    );
    console.log('\nSalvo em scripts/tcc_drive_files.json!');
  } catch (err) {
    console.error('Erro geral:', err);
  }
}

inspectFolder();
