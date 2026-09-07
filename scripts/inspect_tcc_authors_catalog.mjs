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

const authorFolders = [
  { num: 1, name: 'GANDRA & BAADE', id: '1VUezmw-gTBGyx1N_vKBhV5q1qmKDseFL' },
  { num: 2, name: 'MODES (2020)', id: '167qMfbEHpIFRnbttr-iS2RnSC_BliXzU' },
  { num: 3, name: 'MODES ET AL (2022)', id: '1KSi2x3Kg41qK32qyKsr5A5wy8jQPpX91' },
  { num: 4, name: 'REBLIN (2014)', id: '1CwhnhoEsBVbssGQ_P_uIqAFCbDY6gycj' },
  { num: 5, name: 'ESPÍRITO SANTO (2009)', id: '129punskN0VraVOvZNtDmA3gK_z0PHnfo' },
  { num: 6, name: 'SOUZA, Lidiane (2016)', id: '1moddqIb9UwEHZAm_lCWBspHyMsc5BnPL' },
  { num: 7, name: 'OLIVEIRA, David (2012)', id: '1ZeUgN4rwg12Ih5foV0lC8MzzPZdjWjIv' },
  { num: 8, name: 'MOORE & KEARSLEY (2011)', id: '1GkU1dJppukLUuO4_QBZHsQ2f4_TDPPAN' },
  { num: 9, name: 'GARRISON ET AL (2000)', id: '1pyHg2sDwvLfdIYuicfwno62bHqx8RYsb' },
  { num: 10, name: 'THEMELIS (2021)', id: '1RvUG12-fVXlyc9QC6_tXPEtEkxl9GXG2' },
  { num: 11, name: 'DOMINGUES (2016)', id: '1bcKrTgoeFOoxR9EQUxgJgnkt33o3gJea' },
  { num: 12, name: 'FILATRO & CAVALCANTI (2019)', id: '1QRHHKpgkzUhT2mWlaQoczZL9EZPh-sgY' },
  { num: 13, name: 'GIULLIANO, Thomas (2017)', id: '1nJUITIpMkz93SJlZU3JrmNHeNpHflUqp' },
  { num: 14, name: 'LAKATOS & MARCONI (2017)', id: '1sG2Djc2siv1cx5C-BeOoN0w1snVWFqHm' },
  { num: 15, name: 'MINAYO (2014)', id: '1rc1liVlPBXF8rX1rpdsyABev5cgydg2e' },
  { num: 16, name: 'SOARES, Cristiano (2026)', id: '1hMjti7Jj_WkDKdvIfIiQEk0ZaZMwMKWE' },
];

async function run() {
  const token = await getAccessToken();
  const catalog = [];

  for (const af of authorFolders) {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${af.id}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,webViewLink,size)&pageSize=50`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    console.log(`\n[${af.num}] ${af.name} (${data.files?.length || 0} arquivos):`);
    const files = (data.files || []).map((f) => {
      console.log(`    -> ${f.name} (ID: ${f.id})`);
      return {
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        webViewLink: f.webViewLink,
        size: f.size,
      };
    });

    catalog.push({
      authorKey: af.name,
      folderId: af.id,
      files,
    });
  }

  fs.writeFileSync(
    path.join(process.cwd(), 'scripts', 'tcc_drive_catalog_complete.json'),
    JSON.stringify(catalog, null, 2)
  );
  console.log('\n✓ Catálogo completo salvo em scripts/tcc_drive_catalog_complete.json!');
}

run();
