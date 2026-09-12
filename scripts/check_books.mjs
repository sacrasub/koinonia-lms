import fs from 'fs';

const bibData = JSON.parse(fs.readFileSync('src/lib/bibliotecaData.json', 'utf8'));
const lrContent = fs.readFileSync('src/services/livrosRecomendadosService.ts', 'utf8');
const bsContent = fs.readFileSync('src/services/bibliotecaService.ts', 'utf8');

// Extrai PROFESSOR_RECOMMENDED_LIBRARY_BOOKS
const profBooks = [];
const profRegex = /{\s*id:\s*['"]([^'"]+)['"][\s\S]*?title:\s*['"]([^'"]+)['"][\s\S]*?path:\s*['"]([^'"]+)['"][\s\S]*?drive_url:\s*['"]([^'"]+)['"]/g;
let pm;
while ((pm = profRegex.exec(bsContent)) !== null) {
  profBooks.push({
    id: pm[1],
    title: pm[2],
    path: pm[3],
    drive_url: pm[4]
  });
}

console.log('--- PROFESSOR_RECOMMENDED_LIBRARY_BOOKS in bibliotecaService.ts ---');
console.log('Total:', profBooks.length);
profBooks.forEach(b => {
  console.log(`ID: ${b.id} | Title: ${b.title.slice(0, 45)} | Path: ${b.path} | DriveUrl: ${b.drive_url}`);
});

// Extrai INITIAL_LIVROS_RECOMENDADOS
const lrBooks = [];
const lrRegex = /{\s*id:\s*['"]([^'"]+)['"][\s\S]*?disciplina_id:\s*['"]([^'"]+)['"][\s\S]*?disciplina_name:\s*['"]([^'"]+)['"][\s\S]*?book_title:\s*['"]([^'"]+)['"][\s\S]*?book_url:\s*['"]([^'"]+)['"](?:[\s\S]*?biblioteca_book_id:\s*['"]([^'"]+)['"])?[\s\S]*?}/g;
let lm;
while ((lm = lrRegex.exec(lrContent)) !== null) {
  lrBooks.push({
    id: lm[1],
    disciplina_id: lm[2],
    disciplina_name: lm[3],
    book_title: lm[4],
    book_url: lm[5],
    biblioteca_book_id: lm[6] || null
  });
}

console.log('\n--- INITIAL_LIVROS_RECOMENDADOS in livrosRecomendadosService.ts ---');
console.log('Total:', lrBooks.length);
lrBooks.forEach(b => {
  console.log(`ID: ${b.id} | Disc: ${b.disciplina_name.slice(0, 25)} | Title: ${b.book_title.slice(0, 40)} | BibId: ${b.biblioteca_book_id} | Url: ${b.book_url}`);
});
