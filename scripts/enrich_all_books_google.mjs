import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '../src/lib/bibliotecaData.json');
const ENV_PATH = path.join(__dirname, '../.env.local');

// 1. Lê API Key do .env.local
let apiKey = '';
if (fs.existsSync(ENV_PATH)) {
  const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
  const match = envContent.match(/NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=(.+)/);
  if (match) {
    apiKey = match[1].trim();
  }
}

console.log(`=======================================================`);
console.log(`🚀 ENRIQUECIMENTO COMPLETO: GOOGLE BOOKS AUTO-FILL & CAPAS`);
console.log(`🔑 Chave Google Books detectada: ${apiKey ? apiKey.substring(0, 10) + '...' : 'Sem chave (cota padrão)'}`);
console.log(`=======================================================\n`);

const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Mapeamento de autores teológicos célebres para máxima precisão
const FAMOUS_THEOLOGIANS = [
  'Hernandes Dias Lopes', 'R. C. Sproul', 'John MacArthur', 'Timothy Keller', 'Tim Keller',
  'John Stott', 'John Piper', 'Martinho Lutero', 'João Calvino', 'Charles Spurgeon', 'C. H. Spurgeon',
  'A. W. Tozer', 'C. S. Lewis', 'D. Martyn Lloyd-Jones', 'William Barclay', 'Augustus Nicodemus',
  'Russell Shedd', 'Herman Bavinck', 'Louis Berkhof', 'Charles Hodge', 'Jonathan Edwards',
  'John Owen', 'Stephen Charnock', 'A. W. Pink', 'J. I. Packer', 'Tomás de Aquino', 'Agostinho',
  'F. F. Bruce', 'Gordon Fee', 'D. A. Carson', 'Douglas Moo', 'Leon Morris', 'Millard Erickson',
  'Wayne Grudem', 'Norman Geisler', 'Bruce Waltke', 'Samuel J. Schultz', 'Warren Wiersbe'
];

function sanitizeTitleAndAuthor(title, author, bookPath) {
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

  // Se o título contiver " - ", extrai autor e título
  if (cleanTitle.includes(' - ')) {
    const parts = cleanTitle.split(' - ');
    if (parts.length >= 2) {
      const part1 = parts[0].trim();
      const part2 = parts.slice(1).join(' - ').trim();
      // Verifica se part1 parece ser autor
      if (!cleanAuthor && part1.length > 2 && part1.length < 40) {
        cleanAuthor = part1;
        cleanTitle = part2;
      }
    }
  }

  // Verifica se o autor ou título é um teólogo famoso presente no caminho
  if (!cleanAuthor && bookPath) {
    for (const theo of FAMOUS_THEOLOGIANS) {
      if (bookPath.toLowerCase().includes(theo.toLowerCase())) {
        cleanAuthor = theo;
        break;
      }
    }
  }

  return { cleanTitle, cleanAuthor };
}

async function searchGoogleBooks(cleanTitle, cleanAuthor, maxRetries = 3) {
  const keyParam = apiKey ? `&key=${apiKey}` : '';

  // Estratégia em cascata:
  // 1. Título exato + Autor
  // 2. Título limpo + Autor
  // 3. Somente título
  let queries = [];
  if (cleanAuthor) {
    queries.push(`intitle:${encodeURIComponent(cleanTitle)}+inauthor:${encodeURIComponent(cleanAuthor)}`);
    queries.push(`${encodeURIComponent('"' + cleanTitle + '" ' + cleanAuthor)}`);
    queries.push(`${encodeURIComponent(cleanTitle + ' ' + cleanAuthor)}`);
  }
  queries.push(`intitle:${encodeURIComponent(cleanTitle)}`);
  queries.push(`${encodeURIComponent(cleanTitle)}`);

  for (const q of queries) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&langRestrict=pt${keyParam}`;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const res = await fetch(url);
        if (res.status === 429) {
          console.log(`   ⏳ Rate limit (429). Pausando ${attempt * 10 + 6}s...`);
          await delay((attempt * 10 + 6) * 1000);
          continue;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data?.items?.length > 0) {
          const item = data.items[0];
          // Validação mínima de relevância
          if (item.volumeInfo?.title) {
            return item;
          }
        }
        break;
      } catch (err) {
        if (attempt === maxRetries - 1) break;
        await delay(1500);
      }
    }
  }
  return null;
}

async function main() {
  const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
  let books = JSON.parse(rawData);

  // Seleciona livros que ainda não possuem capa OU cuja descrição seja genérica
  const candidates = books.filter(b => {
    const isGenericDesc = !b.description || b.description.startsWith('Obra de referência acadêmica em');
    return !b.cover_url || isGenericDesc;
  });

  console.log(`Total de livros no acervo: ${books.length}`);
  console.log(`Livros com capa já existentes: ${books.filter(b => b.cover_url).length}`);
  console.log(`Livros elegíveis para enriquecimento: ${candidates.length}\n`);

  if (candidates.length === 0) {
    console.log('✅ Todos os livros do acervo já estão 100% enriquecidos!');
    return;
  }

  let updatedCount = 0;
  let notFoundCount = 0;
  let coversAdded = 0;
  let descsAdded = 0;
  let batchSaves = 0;

  const t0 = Date.now();

  for (let i = 0; i < candidates.length; i++) {
    const book = candidates[i];
    const { cleanTitle, cleanAuthor } = sanitizeTitleAndAuthor(book.title, book.author, book.path);

    const prefix = `[${i + 1}/${candidates.length}]`;
    const searchLabel = cleanAuthor ? `"${cleanTitle}" • ${cleanAuthor}` : `"${cleanTitle}"`;

    try {
      const item = await searchGoogleBooks(cleanTitle, cleanAuthor);

      if (item && item.volumeInfo) {
        const v = item.volumeInfo;
        let modified = false;

        // 1. Capa em alta resolução
        if (!book.cover_url && v.imageLinks) {
          let cover = v.imageLinks.thumbnail || v.imageLinks.smallThumbnail || v.imageLinks.medium || v.imageLinks.large;
          if (cover) {
            cover = cover.replace('http:', 'https:').replace('&edge=curl', '');
            book.cover_url = cover;
            coversAdded++;
            modified = true;
          }
        }

        // 2. Sinopse / Descrição
        const isGeneric = !book.description || book.description.startsWith('Obra de referência acadêmica em');
        if (isGeneric && v.description) {
          book.description = v.description;
          descsAdded++;
          modified = true;
        }

        // 3. Autor oficial
        if ((!book.author || book.author.includes('Diversos') || book.author === 'Autor Desconhecido') && v.authors?.length > 0) {
          book.author = v.authors.join(', ');
          modified = true;
        }

        // 4. Editora
        if (!book.publisher && v.publisher) {
          book.publisher = v.publisher;
          modified = true;
        }

        // 5. Páginas
        if (!book.pages && v.pageCount) {
          book.pages = v.pageCount;
          modified = true;
        }

        // 6. Ano
        if (!book.year && v.publishedDate) {
          const yMatch = v.publishedDate.match(/^(\d{4})/);
          if (yMatch) {
            book.year = yMatch[1];
            modified = true;
          }
        }

        // 7. ISBN
        if (!book.isbn && v.industryIdentifiers) {
          const isbn13 = v.industryIdentifiers.find(it => it.type === 'ISBN_13');
          const isbn10 = v.industryIdentifiers.find(it => it.type === 'ISBN_10');
          if (isbn13) book.isbn = isbn13.identifier;
          else if (isbn10) book.isbn = isbn10.identifier;
          if (isbn13 || isbn10) modified = true;
        }

        if (modified) {
          updatedCount++;
          console.log(`${prefix} ✅ ENCONTRADO: ${searchLabel}`);
          console.log(`      -> ${book.cover_url ? '🖼️ Capa ' : ''}${v.publisher ? `🏢 ${v.publisher} ` : ''}${v.pageCount ? `📄 ${v.pageCount}p ` : ''}`);
        } else {
          console.log(`${prefix} ⚠️ Localizado mas sem novas propriedades: ${searchLabel}`);
        }
      } else {
        notFoundCount++;
        // Log discreto para não poluir
        if (notFoundCount % 10 === 0) {
          console.log(`${prefix} 🔍 Progresso: ${i + 1}/${candidates.length} (${updatedCount} enriquecidos, ${notFoundCount} não encontrados no Google Books)...`);
        }
      }

      // Salva periodicamente a cada 20 livros atualizados
      if (updatedCount > 0 && updatedCount % 20 === 0 && batchSaves !== updatedCount) {
        fs.writeFileSync(DATA_PATH, JSON.stringify(books, null, 2), 'utf-8');
        batchSaves = updatedCount;
        const elapsedMin = ((Date.now() - t0) / 60000).toFixed(1);
        console.log(`\n💾 [CHECKPOINT] ${updatedCount} livros salvos em bibliotecaData.json! (${elapsedMin}m decorridos)\n`);
      }

    } catch (err) {
      console.log(`${prefix} ❌ Erro: ${err.message}`);
    }

    // Intervalo de respeito à API
    await delay(350);
  }

  // Salvamento final
  fs.writeFileSync(DATA_PATH, JSON.stringify(books, null, 2), 'utf-8');

  const totalMin = ((Date.now() - t0) / 60000).toFixed(1);
  console.log(`\n=======================================================`);
  console.log(`🎉 ENRIQUECIMENTO CONCLUÍDO EM ${totalMin} MINUTOS!`);
  console.log(`- 📚 Livros Atualizados no Total: ${updatedCount}`);
  console.log(`- 🖼️ Novas Capas em Alta Resolução: ${coversAdded}`);
  console.log(`- 📝 Novas Sinopses Oficiais: ${descsAdded}`);
  console.log(`- 🔍 Livros Não Localizados: ${notFoundCount}`);
  console.log(`=======================================================\n`);
}

main().catch(console.error);
