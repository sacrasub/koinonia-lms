import fs from 'fs';

const bibData = JSON.parse(fs.readFileSync('src/lib/bibliotecaData.json', 'utf8'));

function search(term) {
  const norm = term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return bibData.filter(b => b.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(norm));
}

console.log('--- Lealdade ---', search('leal').map(b => ({ id: b.id, title: b.title, url: b.drive_url })));
console.log('--- Dag Heward ---', search('heward').map(b => ({ id: b.id, title: b.title, url: b.drive_url })));
console.log('--- Hidauro ---', search('hidauro').map(b => ({ id: b.id, title: b.title, url: b.drive_url })));
console.log('--- Campos ---', search('campos').slice(0, 5).map(b => ({ id: b.id, title: b.title, url: b.drive_url })));
console.log('--- Ginsburg ---', search('ginsburg').map(b => ({ id: b.id, title: b.title, url: b.drive_url })));
console.log('--- Salamao ---', search('salamao').map(b => ({ id: b.id, title: b.title, url: b.drive_url })));
console.log('--- Barbirato ---', search('barbirato').map(b => ({ id: b.id, title: b.title, url: b.drive_url })));
console.log('--- Direitos ---', search('direito').slice(0, 5).map(b => ({ id: b.id, title: b.title, url: b.drive_url })));
console.log('--- Modelo ---', search('modelo').map(b => ({ id: b.id, title: b.title, url: b.drive_url })));
console.log('--- Monografia / Pesquisa ---', search('pesquisa').slice(0, 5).map(b => ({ id: b.id, title: b.title, url: b.drive_url })));
