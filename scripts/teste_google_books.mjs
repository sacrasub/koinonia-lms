import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '../src/lib/bibliotecaData.json');
const ENV_PATH = path.join(__dirname, '../.env.local');

// Lê chave de API do .env.local
let apiKey = '';
if (fs.existsSync(ENV_PATH)) {
  const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
  const match = envContent.match(/NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=(.+)/);
  if (match) {
    apiKey = match[1].trim();
  }
}

console.log(`Chave Google Books: ${apiKey ? apiKey.substring(0, 10) + '...' : 'Não encontrada'}`);

const delay = (ms) => new Promise(res => setTimeout(res, ms));

function sanitizeTitleAndAuthor(title, author) {
  let cleanTitle = (title || '')
    .replace(/\.pdf$/i, '')
    .replace(/\.epub$/i, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?z-lib.*?\)/gi, '')
    .replace(/\(.*?\)/g, '')
    .replace(/_BARCLAY/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  let cleanAuthor = (author || '').trim();
  if (
    !cleanAuthor ||
    cleanAuthor.toLowerCase() === 'sem autor' ||
    cleanAuthor.toLowerCase() === 'autor desconhecido' ||
    cleanAuthor.toLowerCase() === 'desconhecido' ||
    cleanAuthor.toLowerCase().includes('não especificado') ||
    cleanAuthor.toLowerCase() === 'diversos'
  ) {
    cleanAuthor = '';
  }

  // Se o título contiver " - ", tenta separar autor e título se autor estiver vazio
  if (!cleanAuthor && cleanTitle.includes(' - ')) {
    const parts = cleanTitle.split(' - ');
    if (parts.length === 2) {
      cleanAuthor = parts[0].trim();
      cleanTitle = parts[1].trim();
    }
  }

  return { cleanTitle, cleanAuthor };
}

async function searchGoogleBooks(cleanTitle, cleanAuthor, maxRetries = 3) {
  const keyParam = apiKey ? `&key=${apiKey}` : '';

  // Nível 1: Título + Autor
  let queries = [];
  if (cleanAuthor) {
    queries.push(`intitle:${encodeURIComponent(cleanTitle)}+inauthor:${encodeURIComponent(cleanAuthor)}`);
    queries.push(`${encodeURIComponent(cleanTitle + ' ' + cleanAuthor)}`);
  }
  queries.push(`intitle:${encodeURIComponent(cleanTitle)}`);

  for (const q of queries) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&langRestrict=pt${keyParam}`;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const res = await fetch(url);
        if (res.status === 429) {
          console.log(`   ⏳ Rate limit (429). Aguardando ${attempt * 10 + 5}s...`);
          await delay((attempt * 10 + 5) * 1000);
          continue;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data?.items?.length > 0) {
          return data.items[0];
        }
        break; // Não encontrou com essa query, tenta a próxima
      } catch (err) {
        if (attempt === maxRetries - 1) break;
        await delay(2000);
      }
    }
  }
  return null;
}

async function main() {
  console.log('=== TESTE DE AUTO-PREENCHIMENTO GOOGLE BOOKS ===');
  const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
  const books = JSON.parse(rawData);

  const missingCover = books.filter(b => !b.cover_url);
  console.log(`Total de livros: ${books.length}`);
  console.log(`Livros sem capa: ${missingCover.length}`);

  // Testa os primeiros 10
  const sample = missingCover.slice(0, 10);
  let found = 0;

  for (let i = 0; i < sample.length; i++) {
    const b = sample[i];
    const { cleanTitle, cleanAuthor } = sanitizeTitleAndAuthor(b.title, b.author);
    console.log(`\n[${i + 1}/10] Buscando: "${cleanTitle}" | Autor: "${cleanAuthor}"`);
    const item = await searchGoogleBooks(cleanTitle, cleanAuthor);
    if (item && item.volumeInfo) {
      const v = item.volumeInfo;
      const cover = v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail;
      console.log(`   ✅ ENCONTRADO: ${v.title} (${v.authors?.join(', ') || 'Sem autor'})`);
      console.log(`      Capa: ${cover ? 'SIM' : 'NÃO'} | Editora: ${v.publisher || 'N/A'} | Páginas: ${v.pageCount || 'N/A'}`);
      found++;
    } else {
      console.log(`   ❌ Não localizado.`);
    }
    await delay(600);
  }

  console.log(`\nTaxa de sucesso na amostra: ${found}/10 (${found * 10}%)`);
}

main().catch(console.error);
