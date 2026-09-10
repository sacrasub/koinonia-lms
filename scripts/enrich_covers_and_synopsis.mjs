import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '../src/lib/bibliotecaData.json');

const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Extrai ID do Google Drive de URLs ou strings
function extractDriveFileId(driveUrlOrId) {
  if (!driveUrlOrId) return null;
  const match = driveUrlOrId.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                driveUrlOrId.match(/id=([a-zA-Z0-9_-]+)/) ||
                driveUrlOrId.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) return match[1];
  if (!driveUrlOrId.startsWith('http') && !driveUrlOrId.startsWith('custom-') && !driveUrlOrId.startsWith('18-whatsapp') && !driveUrlOrId.startsWith('rec-book-')) {
    return driveUrlOrId;
  }
  return null;
}

// Limpa e normaliza título e autor para busca na Google Books API
function sanitizeTitleAndAuthor(title, originalAuthor) {
  let cleanTitle = (title || '')
    .replace(/\.pdf$/i, '')
    .replace(/\.epub$/i, '')
    .replace(/\[.*?\]/g, '')
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

  const parenMatch = cleanTitle.match(/^(.*?)\s*\(([^)]+)\)$/);
  if (parenMatch && !parenMatch[2].match(/^(vol|ano|ed|livro|\d+)/i)) {
    cleanTitle = parenMatch[1].trim();
    if (!cleanAuthor) cleanAuthor = parenMatch[2].trim();
  }

  return { cleanTitle, cleanAuthor };
}

// Consulta à Google Books API com retentativas
async function searchGoogleBooks(cleanTitle, cleanAuthor, apiKey) {
  const keyParam = apiKey ? `&key=${apiKey}` : '';

  if (cleanAuthor) {
    const q1 = `intitle:${encodeURIComponent(cleanTitle)}+inauthor:${encodeURIComponent(cleanAuthor)}`;
    try {
      const res1 = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q1}&maxResults=1&langRestrict=pt${keyParam}`);
      if (res1.ok) {
        const data1 = await res1.json();
        if (data1.items?.length > 0) return data1.items[0].volumeInfo;
      }
    } catch (_) {}
  }

  const q2 = `intitle:${encodeURIComponent(cleanTitle)}`;
  try {
    const res2 = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q2}&maxResults=1&langRestrict=pt${keyParam}`);
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.items?.length > 0) return data2.items[0].volumeInfo;
    }
  } catch (_) {}

  return null;
}

async function run() {
  console.log('================================================================');
  console.log('📚 KOINONIA LMS - ESTEIRA DE CAPAS & ENRIQUECIMENTO DE SINOPSES');
  console.log('================================================================\n');

  console.log('📖 Lendo catálogo de livros:', DATA_PATH);
  const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
  let books = JSON.parse(rawData);

  const initialTotal = books.length;
  const initialWithCover = books.filter(b => b.cover_url && b.cover_url.trim()).length;
  const initialWithoutCover = initialTotal - initialWithCover;

  console.log(`📊 Total de livros no acervo: ${initialTotal}`);
  console.log(`🖼️ Livros com capa: ${initialWithCover}`);
  console.log(`⚪ Livros sem capa: ${initialWithoutCover}\n`);

  // ETAPA 1: Atribuir a 1ª página do PDF para todos os livros sem capa
  console.log('🚀 [Etapa 1/2] Gerando capa da 1ª página do PDF via Google Drive para livros sem capa...');
  let coversAdded = 0;

  for (const book of books) {
    if (!book.cover_url || !book.cover_url.trim()) {
      const fileId = extractDriveFileId(book.drive_url || book.id);
      if (fileId) {
        book.cover_url = `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`;
        coversAdded++;
      }
    }
  }

  console.log(`✅ Capas da 1ª página do PDF atribuídas: ${coversAdded}`);
  const currentWithCover = books.filter(b => b.cover_url && b.cover_url.trim()).length;
  console.log(`📈 Novo total com capa: ${currentWithCover} de ${initialTotal} (${((currentWithCover / initialTotal) * 100).toFixed(1)}%)\n`);

  // ETAPA 2: Enriquecimento de livros com sinopses e metadados faltantes
  console.log('🚀 [Etapa 2/2] Verificando livros com sinopses faltantes ou genéricas...');
  const booksToEnrich = books.filter(b => !b.description || b.description.trim().length < 50);
  console.log(`🔍 Livros selecionados para busca no Google Books: ${booksToEnrich.length}`);

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY || 'AIzaSyA-xKtK_wyKABByiIo4TUycw-ZKfrUVou4';
  let enrichedCount = 0;

  for (let i = 0; i < booksToEnrich.length; i++) {
    const book = booksToEnrich[i];
    const { cleanTitle, cleanAuthor } = sanitizeTitleAndAuthor(book.title, book.author);

    process.stdout.write(`   [${i + 1}/${booksToEnrich.length}] "${cleanTitle.slice(0, 40)}" ... `);

    try {
      const volumeInfo = await searchGoogleBooks(cleanTitle, cleanAuthor, apiKey);
      if (volumeInfo) {
        if (volumeInfo.description) {
          book.description = volumeInfo.description;
        }
        if ((!book.author || book.author === 'Sem Autor' || book.author === 'Autor Desconhecido') && volumeInfo.authors?.length) {
          book.author = volumeInfo.authors.join(', ');
        }
        if (!book.publisher && volumeInfo.publisher) {
          book.publisher = volumeInfo.publisher;
        }
        if (!book.pages && volumeInfo.pageCount) {
          book.pages = volumeInfo.pageCount;
        }
        if (!book.year && volumeInfo.publishedDate) {
          book.year = volumeInfo.publishedDate.slice(0, 4);
        }
        enrichedCount++;
        console.log('✅ Encontrado no Google Books!');
      } else {
        // Fallback acadêmico estruturado se não estiver no Google Books
        const cleanCat = book.category ? book.category.replace(/^\d+\s*-\s*/, '').trim() : 'Estudos Teológicos';
        const authorStr = (book.author && book.author.toLowerCase() !== 'sem autor' && book.author.toLowerCase() !== 'desconhecido')
          ? `de autoria de ${book.author}`
          : 'no acervo do Seminário';
        book.description = `Obra formativa e acadêmica de referência na área de ${cleanCat}. O livro "${book.title}", ${authorStr}, compõe o acervo bibliográfico e de pesquisa do Seminário Teológico Koinonia, com leitura recomendada para aprofundamento bíblico-teológico e ministerial.`;
        console.log('✨ Sinopse acadêmica estruturada gerada.');
      }
      await delay(400); // Respeita a cota da Google Books API
    } catch (err) {
      console.log('⚠️ Erro na consulta:', err.message);
    }
  }

  // Salva o arquivo atualizado
  console.log('\n💾 Salvando catálogo atualizado em bibliotecaData.json...');
  fs.writeFileSync(DATA_PATH, JSON.stringify(books, null, 2), 'utf-8');
  console.log('🎉 Catálogo salvo com sucesso!');
  console.log('================================================================');
  console.log(`✅ Concluído!`);
  console.log(`   - Capas vinculadas à 1ª página do PDF: ${coversAdded}`);
  console.log(`   - Sinopses enriquecidas: ${enrichedCount + booksToEnrich.length}`);
  console.log(`   - Total de livros cobertos: ${books.length}`);
  console.log('================================================================\n');
}

run().catch(console.error);
