import fs from 'fs';
import https from 'https';
import crypto from 'crypto';

const env = fs.readFileSync('.env.local', 'utf-8');
const email = env.match(/GOOGLE_SERVICE_ACCOUNT_EMAIL=(.+)/)?.[1]?.trim();
let keyMatch = env.match(/GOOGLE_PRIVATE_KEY="?([\s\S]+?)"?\n[A-Z_]+=/);
let key = keyMatch ? keyMatch[1] : env.match(/GOOGLE_PRIVATE_KEY=(.+)/)?.[1];
key = key.replace(/\\n/g, '\n').replace(/"/g, '').trim();

function getJwt() {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const claim = Buffer.from(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  })).toString('base64url');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(header + '.' + claim);
  const signature = sign.sign(key, 'base64url');
  return header + '.' + claim + '.' + signature;
}

function postRequest(url, headers, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'POST', headers }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function getRequest(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'GET', headers }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('1. Autenticando com Google Drive API via Service Account...');
  const tokenRes = await postRequest('https://oauth2.googleapis.com/token', 
    { 'Content-Type': 'application/x-www-form-urlencoded' },
    'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + getJwt()
  );
  
  const tokenData = JSON.parse(tokenRes.body);
  const token = tokenData.access_token;
  if (!token) {
    console.error('Erro ao obter token:', tokenData);
    process.exit(1);
  }
  console.log('Token obtido com sucesso.');

  const rootFolderId = '1qpHLjy3pcnf--FWSpg8jiTcRru5bkQEf';
  console.log(`2. Listando estrutura de arquivos e pastas recursivamente sob ${rootFolderId}...`);

  // Vamos mapear todas as pastas e arquivos
  let allFiles = [];
  let pageToken = null;
  let page = 1;

  // Busca todos os arquivos acessíveis pela Service Account
  do {
    const params = new URLSearchParams({
      pageSize: '1000',
      fields: 'nextPageToken,files(id,name,size,md5Checksum,mimeType,parents,createdTime,modifiedTime)',
      q: "trashed = false"
    });
    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    const url = `https://www.googleapis.com/drive/v3/files?${params.toString()}`;
    const res = await getRequest(url, { 'Authorization': `Bearer ${token}` });
    const data = JSON.parse(res.body);

    if (data.files) {
      allFiles.push(...data.files);
      console.log(`  Página ${page}: +${data.files.length} itens acumulados (Total: ${allFiles.length})...`);
    } else {
      console.error('Resposta inesperada:', data);
      break;
    }

    pageToken = data.nextPageToken;
    page++;
  } while (pageToken);

  console.log(`\nTotal de itens no Google Drive: ${allFiles.length}`);

  // Salva o catálogo bruto para análise
  const outPath = 'data/drive_files_catalog.json';
  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(allFiles, null, 2), 'utf-8');
  console.log(`Catálogo salvo com sucesso em ${outPath}!`);
}

main().catch(console.error);
