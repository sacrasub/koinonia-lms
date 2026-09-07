import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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

async function getAccessToken() {
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

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const { access_token } = await tokenRes.json();
  return access_token;
}

async function listFolder(folderId, folderName, token) {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,webViewLink,size)&pageSize=100`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();
  console.log(`\n=== PASTA: ${folderName} (${data.files?.length || 0} itens) ===`);
  (data.files || []).forEach((f, idx) => {
    console.log(`  [${idx + 1}] ${f.name} (${f.mimeType})`);
    console.log(`      ID: ${f.id} | Link: ${f.webViewLink}`);
  });
  return data.files || [];
}

async function run() {
  const token = await getAccessToken();

  const subfolders = [
    { id: '1AS9YceV_sP4gnluH5O4l3-Sq3dSomxR7', name: '01 - FONTES 2026' },
    { id: '1w_t2SRFwwRL_mYMwzIPhZPVkVy-xlLa7', name: '02 - TEMAS APROFUNDADOS' },
  ];

  const allFound = [];

  for (const sf of subfolders) {
    const files = await listFolder(sf.id, sf.name, token);
    allFound.push(...files);

    // Se houver subpastas de terceiro nível
    for (const f of files) {
      if (f.mimeType === 'application/vnd.google-apps.folder') {
        const subFiles = await listFolder(f.id, `${sf.name} > ${f.name}`, token);
        allFound.push(...subFiles);
      }
    }
  }

  fs.writeFileSync(
    path.join(process.cwd(), 'scripts', 'tcc_drive_fontes.json'),
    JSON.stringify(allFound, null, 2)
  );
  console.log('\nSalvo em scripts/tcc_drive_fontes.json!');
}

run();
