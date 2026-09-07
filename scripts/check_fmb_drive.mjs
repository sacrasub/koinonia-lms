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

const req = https.request('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const data = JSON.parse(body);
    const token = data.access_token;
    if (!token) {
      console.error('Falha ao obter token:', data);
      return;
    }
    
    // Pasta que o usuário enviou
    const folderId = '1qpHLjy3pcnf--FWSpg8jiTcRru5bkQEf';
    https.get(`https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,mimeType,capabilities`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }, (fRes) => {
      let fBody = '';
      fRes.on('data', d => fBody += d);
      fRes.on('end', () => {
        console.log('STATUS PASTA:', fRes.statusCode);
        console.log('DADOS:', fBody);

        if (fRes.statusCode === 200) {
          // Lista as subpastas imediatas
          https.get(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType)&pageSize=50`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }, (sRes) => {
            let sBody = '';
            sRes.on('data', d => sBody += d);
            sRes.on('end', () => {
              console.log('SUBPASTAS ENCONTRADAS:');
              console.log(sBody);
            });
          });
        }
      });
    });
  });
});

req.write('grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + getJwt());
req.end();
