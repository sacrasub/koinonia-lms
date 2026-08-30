import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '../src/lib/bibliotecaData.json');

// Atraso configurável
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Autores conhecidos para correções automáticas de nomes em parênteses ou pastas
const KNOWN_AUTHORS_MAP = {
  'barclay': 'William Barclay',
  'stott': 'John Stott',
  'calvino': 'João Calvino',
  'lutero': 'Martinho Lutero',
  'sproul': 'R. C. Sproul',
  'piper': 'John Piper',
  'macarthur': 'John MacArthur',
  'lloyd-jones': 'D. M. Lloyd-Jones',
  'keller': 'Tim Keller',
  'shedd': 'Russell Shedd',
  'charnock': 'Stephen Charnock',
  'edwards': 'Jonathan Edwards',
  'owen': 'John Owen',
  'pink': 'A. W. Pink',
  'hodge': 'Charles Hodge',
  'bavinck': 'Herman Bavinck',
  'berkhof': 'Louis Berkhof',
  'packer': 'J. I. Packer',
  'tozer': 'A. W. Tozer',
  'lewis': 'C. S. Lewis',
  'champlin': 'R. N. Champlin',
  'aquino': 'Tomás de Aquino',
  'agostinho': 'Agostinho de Hipona',
  'nicodemus': 'Augustus Nicodemus',
  'lopes': 'Hernandes Dias Lopes',
};

// Limpa e normaliza título e autor
function sanitizeTitleAndAuthor(title, originalAuthor, category = '') {
  let cleanTitle = (title || '')
    .replace(/\.pdf$/i, '')
    .replace(/\.epub$/i, '')
    .replace(/\[.*?\]/g, '') // remove [PDFDrive], [Scan], etc
    .replace(/_BARCLAY/gi, '')
    .replace(/\(completo\)/gi, '')
    .replace(/\(comentário\)/gi, '')
    .replace(/\(comentario\)/gi, '')
    .replace(/PDFDrive/gi, '')
    .trim();

  let cleanAuthor = (originalAuthor || '').trim();
  if (
    !cleanAuthor || 
    cleanAuthor.toLowerCase() === 'sem autor' || 
    cleanAuthor.toLowerCase() === 'autor desconhecido' ||
    cleanAuthor.toLowerCase() === 'desconhecido'
  ) {
    cleanAuthor = '';
  }

  // Tenta extrair autor de parênteses no final do título: "Mateus (Barclay)" -> Título: "Mateus", Autor: "Barclay"
  const parenMatch = cleanTitle.match(/^(.*?)\s*\(([^)]+)\)$/);
  if (parenMatch) {
    const insideParen = parenMatch[2].trim();
    const beforeParen = parenMatch[1].trim();
    
    // Se dentro do parênteses não for volume/ano/edição, provável que seja autor
    if (!insideParen.match(/^(vol|ano|ed|livro|\d+)/i)) {
      cleanTitle = beforeParen;
      if (!cleanAuthor) {
        cleanAuthor = insideParen;
      }
    }
  }

  // Tenta extrair autor separado por hífen: "O Evangelho - John Stott"
  const hyphenMatch = cleanTitle.match(/^(.*?)\s*[-–—]\s*([^-–—]+)$/);
  if (hyphenMatch && !cleanAuthor) {
    const candidateAuthor = hyphenMatch[2].trim();
    if (candidateAuthor.length > 2 && !candidateAuthor.match(/^(vol|volume|parte|livro|\d+)/i)) {
      // Se tiver mais de uma palavra ou for um autor conhecido
      if (candidateAuthor.includes(' ') || KNOWN_AUTHORS_MAP[candidateAuthor.toLowerCase()]) {
        cleanTitle = hyphenMatch[1].trim();
        cleanAuthor = candidateAuthor;
      }
    }
  }

  // Normaliza autores conhecidos
  const lowerAuthor = cleanAuthor.toLowerCase();
  for (const [key, fullName] of Object.entries(KNOWN_AUTHORS_MAP)) {
    if (lowerAuthor === key || lowerAuthor.includes(key)) {
      cleanAuthor = fullName;
      break;
    }
  }

  return { cleanTitle, cleanAuthor };
}

// Fetch com tratamento de Rate Limit (HTTP 429) e Backoff Exponencial
async function fetchWithRetry(url, maxRetries = 4) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        attempt++;
        const waitSeconds = attempt * 12; // 12s, 24s, 36s, 48s
        console.log(`   ⏳ Rate limit atingido (429). Pausando por ${waitSeconds}s antes de tentar novamente...`);
        await delay(waitSeconds * 1000);
        continue;
      }

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      if (attempt >= maxRetries - 1) throw err;
      attempt++;
      await delay(3000);
    }
  }
  return null;
}

// Executa busca no Google Books com 3 níveis de fallback (Cascata)
async function searchGoogleBooks(cleanTitle, cleanAuthor, apiKey) {
  const keyParam = apiKey ? `&key=${apiKey}` : '';

  // 1ª Tentativa: Título exato + Autor (se houver)
  if (cleanAuthor) {
    const q1 = `intitle:${encodeURIComponent(cleanTitle)}+inauthor:${encodeURIComponent(cleanAuthor)}`;
    const url1 = `https://www.googleapis.com/books/v1/volumes?q=${q1}&maxResults=1&langRestrict=pt${keyParam}`;
    const data1 = await fetchWithRetry(url1);
    if (data1?.items?.length > 0) {
      return { item: data1.items[0], method: 'Título + Autor' };
    }
  }

  // 2ª Tentativa: Apenas intitle com título limpo
  const q2 = `intitle:${encodeURIComponent(cleanTitle)}`;
  const url2 = `https://www.googleapis.com/books/v1/volumes?q=${q2}&maxResults=1&langRestrict=pt${keyParam}`;
  const data2 = await fetchWithRetry(url2);
  if (data2?.items?.length > 0) {
    return { item: data2.items[0], method: 'Somente Título' };
  }

  // 3ª Tentativa: Busca textual aberta (Fuzzy do Google)
  const fullSearch = cleanAuthor ? `${cleanTitle} ${cleanAuthor}` : cleanTitle;
  const q3 = encodeURIComponent(fullSearch);
  const url3 = `https://www.googleapis.com/books/v1/volumes?q=${q3}&maxResults=1&langRestrict=pt${keyParam}`;
  const data3 = await fetchWithRetry(url3);
  if (data3?.items?.length > 0) {
    return { item: data3.items[0], method: 'Busca Ampla' };
  }

  return null;
}

async function run() {
  console.log('📖 Carregando bibliotecaData.json...');
  const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
  let books = [];
  try {
    books = JSON.parse(rawData);
  } catch (e) {
    console.error('❌ Erro ao fazer parse do JSON:', e);
    return;
  }

  // Filtrar livros que ainda não possuem descrição ou capa
  const booksToEnrich = books.filter(b => !b.description || !b.cover_url);
  
  console.log(`\n======================================================`);
  console.log(`📚 Total de livros no acervo: ${books.length}`);
  console.log(`🔍 Livros aguardando enriquecimento: ${booksToEnrich.length}`);
  console.log(`======================================================\n`);

  if (booksToEnrich.length === 0) {
    console.log('🎉 Todos os livros do acervo já estão enriquecidos!');
    return;
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (apiKey) {
    console.log('🔑 Chave da API do Google Books detectada no ambiente.');
  } else {
    console.log('⚠️ Nenhuma GOOGLE_BOOKS_API_KEY configurada. Usando cota padrão.');
  }

  let successCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;

  for (let i = 0; i < booksToEnrich.length; i++) {
    const book = booksToEnrich[i];
    const { cleanTitle, cleanAuthor } = sanitizeTitleAndAuthor(book.title, book.author, book.category);

    console.log(`[${i + 1}/${booksToEnrich.length}] 🔎 "${cleanTitle}" ${cleanAuthor ? `(Autor: ${cleanAuthor})` : ''}`);

    try {
      const result = await searchGoogleBooks(cleanTitle, cleanAuthor, apiKey);

      if (!result || !result.item) {
        console.log(`   -> ❌ Não encontrado no Google Books.`);
        notFoundCount++;
        await delay(1200);
        continue;
      }

      const volumeInfo = result.item.volumeInfo;
      let updated = false;

      // Atualiza Capa
      if (!book.cover_url && volumeInfo.imageLinks) {
        let coverUrl = volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail;
        if (coverUrl) {
          coverUrl = coverUrl.replace('http:', 'https:').replace('&edge=curl', '');
          book.cover_url = coverUrl;
          updated = true;
        }
      }

      // Atualiza Descrição / Sinopse
      if (!book.description && volumeInfo.description) {
        book.description = volumeInfo.description;
        updated = true;
      }

      // Atualiza Autor se estava sem autor e a API forneceu o autor real
      if ((!book.author || book.author === 'Sem Autor' || book.author === 'Autor Desconhecido') && volumeInfo.authors && volumeInfo.authors.length > 0) {
        book.author = volumeInfo.authors.join(', ');
        updated = true;
      }

      // Outros Metadados
      if (!book.publisher && volumeInfo.publisher) {
        book.publisher = volumeInfo.publisher;
        updated = true;
      }

      if (!book.pages && volumeInfo.pageCount) {
        book.pages = volumeInfo.pageCount;
        updated = true;
      }

      if (!book.year && volumeInfo.publishedDate) {
        const yearMatch = volumeInfo.publishedDate.match(/^(\d{4})/);
        if (yearMatch) {
          book.year = yearMatch[1];
          updated = true;
        }
      }

      if (!book.isbn && volumeInfo.industryIdentifiers) {
        const isbn13 = volumeInfo.industryIdentifiers.find(it => it.type === 'ISBN_13');
        const isbn10 = volumeInfo.industryIdentifiers.find(it => it.type === 'ISBN_10');
        if (isbn13) book.isbn = isbn13.identifier;
        else if (isbn10) book.isbn = isbn10.identifier;
        if (isbn13 || isbn10) updated = true;
      }

      if (updated) {
        console.log(`   -> ✅ Atualizado via [${result.method}]! (${book.cover_url ? '🖼️ Capa' : ''} ${book.description ? '📝 Sinopse' : ''} ${book.author ? `👤 ${book.author}` : ''})`);
        successCount++;
        // Salva incrementalmente de forma segura
        fs.writeFileSync(DATA_PATH, JSON.stringify(books, null, 2));
      } else {
        console.log(`   -> ⚠️ Livro localizado, mas sem novos campos relevantes.`);
      }

    } catch (error) {
      console.log(`   -> ❌ Erro ao processar: ${error.message}`);
      errorCount++;
    }

    // Intervalo de segurança para não disparar o rate limit
    await delay(1200);
  }

  console.log('\n=====================================');
  console.log('📊 RESUMO DO ENRIQUECIMENTO INTELIGENTE:');
  console.log(`- ✅ Sucessos (Atualizados): ${successCount}`);
  console.log(`- 🔍 Não Encontrados: ${notFoundCount}`);
  console.log(`- ❌ Erros de API: ${errorCount}`);
  console.log('=====================================\n');
}

run();
