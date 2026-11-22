import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import ts from 'typescript';
import { PDFParse } from 'pdf-parse';

const ROOT = process.cwd();

const CANONICAL_DISCIPLINAS = [
  {
    id: 'disc-1',
    num: '01',
    code: 'HIS-202',
    legacyCodes: [],
    name: '01 - História do Congregacionalismo - Ary Júnior',
    shortName: 'História do Congregacionalismo',
    prof: 'Profº Ary Júnior',
    dayOfWeek: 'Terça-feira',
    time: '19:00 – 20:25',
    defaultBib: 'Mateus 18:15-20; Atos 15:1-29; 1 Pedro 2:9',
  },
  {
    id: 'disc-2',
    num: '02',
    code: 'HIS-102',
    legacyCodes: [],
    name: '02 - História do Pensamento Cristão II - Hilário Bispo',
    shortName: 'História do Pensamento Cristão II',
    prof: 'Profº Hilário Bispo',
    dayOfWeek: 'Terça-feira',
    time: '20:35 – 22:00',
    defaultBib: '1 Timóteo 4:16; Tito 1:9; Romanos 1:16-17; Judas 1:3',
  },
  {
    id: 'disc-3',
    num: '03',
    code: 'ACO-202',
    legacyCodes: [],
    name: '03 - Aconselhamento Bíblico II - Uilian Santos',
    shortName: 'Aconselhamento Bíblico II',
    prof: 'Profº Uilian Santos',
    dayOfWeek: 'Quarta-feira',
    time: '19:00 – 20:25',
    defaultBib: 'Provérbios 18:13; Romanos 15:14; Salmos 130; Hebreus 6:19',
  },
  {
    id: 'disc-4',
    num: '04',
    code: 'DIR-101',
    legacyCodes: [],
    name: '04 - Direitos Humanos - Cleiton Barbirato',
    shortName: 'Direitos Humanos',
    prof: 'Profº Cleiton Barbirato',
    dayOfWeek: 'Quarta-feira',
    time: '20:35 – 22:00',
    defaultBib: 'Gênesis 1:26-27; Miqueias 6:8; Deuteronômio 10:18-19',
  },
  {
    id: 'disc-5',
    num: '05',
    code: 'ETC-201',
    legacyCodes: ['ETI-201'],
    name: '05 - Ética Cristã - Karoline Evangelista',
    shortName: 'Ética Cristã',
    prof: 'Profª Karoline Evangelista',
    dayOfWeek: 'Quinta-feira',
    time: '19:00 – 20:25',
    defaultBib: 'Êxodo 20:1-17; Mateus 5:17-48; Romanos 12:1-2',
  },
  {
    id: 'disc-6',
    num: '06',
    code: 'NT-301',
    legacyCodes: [],
    name: '06 - Novo Testamento III - Epístolas Gerais - Marcio Leal',
    shortName: 'Novo Testamento III (Epístolas)',
    prof: 'Profº Marcio Leal',
    dayOfWeek: 'Quinta-feira',
    time: '20:35 – 22:00',
    defaultBib: 'Tiago 1–5; 1 Pedro 1–5; 2 Pedro 1–3; 1–3 João; Judas',
  },
  {
    id: 'disc-7',
    num: '07',
    code: 'MIS-202',
    legacyCodes: ['PRI-202'],
    name: '07 - Plantação e Revitalização de Igrejas II - Thácyto Lessa',
    shortName: 'Plantação & Revitalização II',
    prof: 'Profº Thácyto Lessa',
    dayOfWeek: 'Sexta-feira',
    time: '19:00 – 20:00',
    defaultBib: 'Atos 2:42-47; Mateus 16:18; Efésios 4:11-16',
  },
  {
    id: 'disc-8',
    num: '08',
    code: 'TCC-101',
    legacyCodes: [],
    name: '08 - TCC I - Gabriela Leal',
    shortName: 'TCC I',
    prof: 'Profª Gabriela Leal',
    dayOfWeek: 'Sexta-feira',
    time: '20:00 – 21:00',
    defaultBib: 'Eclesiastes 12:9-12; Lucas 1:1-4; 2 Timóteo 2:15',
  },
  {
    id: 'disc-9',
    num: '09',
    code: 'AFR-101',
    legacyCodes: ['CAB-201'],
    name: '09 - História da Cultura Afro Brasileira e Indígena - Alexsandro',
    shortName: 'Cultura Afro & Indígena',
    prof: 'Profº Alexsandro de Oliveira Silva',
    dayOfWeek: 'Sexta-feira',
    time: 'Modular (4 Videoaulas Gravadas)',
    defaultBib: 'Gênesis 1:26-28; Atos 17:26; Gálatas 3:28; Tiago 2:1-9',
  },
];

const DISC_BY_ID = Object.fromEntries(CANONICAL_DISCIPLINAS.map((d) => [d.id, d]));

const PDF_PREFIX_MAP = {
  his: 'disc-1',
  hpc: 'disc-2',
  acon: 'disc-3',
  dh: 'disc-4',
  eti: 'disc-5',
  nt3: 'disc-6',
  pri: 'disc-7',
  tcc: 'disc-8',
};

const PT_MONTHS = {
  jan: '01',
  fev: '02',
  mar: '03',
  abr: '04',
  mai: '05',
  jun: '06',
  jul: '07',
  ago: '08',
  set: '09',
  out: '10',
  nov: '11',
  dez: '12',
};

function isoToBr(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function brToIso(br) {
  const clean = br.replace(/^~/, '').trim();
  const m = clean.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function getSlotDateIso(aulaNum, dayOfWeek) {
  const start = new Date(2026, 7, 11); // 11/08/2026
  const offsets = {
    'Terça-feira': 0,
    'Quarta-feira': 1,
    'Quinta-feira': 2,
    'Sexta-feira': 3,
  };
  const off = offsets[dayOfWeek] ?? 0;
  const dt = new Date(start);
  dt.setDate(start.getDate() + (aulaNum - 1) * 7 + off);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function loadDossieAv2() {
  const filePath = path.join(ROOT, 'src/data/dossieAv2_2026_2.ts');
  const src = fs.readFileSync(filePath, 'utf8');
  const out = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  const mod = { exports: {} };
  const fn = new Function('exports', 'require', 'module', out.outputText);
  fn(mod.exports, () => ({}), mod);
  return mod.exports.DOSSIE_AV2_2026_2;
}

async function getServiceAccountToken() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return null;
  const env = fs.readFileSync(envPath, 'utf8');
  const email = (env.match(/GOOGLE_SERVICE_ACCOUNT_EMAIL=(.+)/) || [])[1]?.trim().replace(/^["']|["']$/g, '');
  let key = (env.match(/GOOGLE_PRIVATE_KEY=(.+)/) || [])[1]?.trim().replace(/^["']|["']$/g, '');
  if (!email || !key) return null;
  key = key.replace(/\\n/g, '\n');

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claim = Buffer.from(
    JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/documents.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  ).toString('base64url');
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  const signature = signer.sign(key, 'base64url');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claim}.${signature}`,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token || null;
}

function scrubText(text) {
  if (!text) return '';
  return text
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '')
    .replace(/\(\s*\d{1,2}:\d{2}(?::\d{2})?\s*\)/g, '')
    .replace(/A pessoa participante\s+/gi, '')
    .replace(/\bProfessor virtual\b/gi, '')
    .replace(/\bconvidad[oa]s?\b/gi, '')
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '')
    .replace(/📝\s*Observações/gi, '')
    .replace(/[{}]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();
}

function isAdminNoise(str) {
  const low = str.toLowerCase();
  const noisePatterns = [
    /falhas? técnicas/,
    /problemas? técnicos/,
    /verificações de conectividade/,
    /dados móveis/,
    /câmera desligada/,
    /câmeras abertas?.*microfone/,
    /lista de presença/,
    /assinar lista/,
    /formulário de presença/,
    /preencher a lista/,
    /áudio.*test/,
    /problemas de áudio/,
    /interromperam a aula/,
    /reunião encerrada por/,
    /envio do link da sala/,
    /confirmaram recepção/,
    /link do meet/,
    /abrir câmera/,
  ];
  // Only filter out pure technical/attendance chatter if it lacks theological/academic keywords
  const hasAcademic =
    /(teolog|bíbl|escritur|igreja|crist|doutrina|históri|exeg|aconselham|ética|direito|tcc|abnt|afro|indíg|quilomb|reforma|calvino|lutero|barth|schleiermacher|bultmann|kierkegaard|kalley|hebreus|tiago|pedro|joão|mandamento|salmo|roman|espírito|deus|jesus|pastor|evangel|missão|revitaliz|puritan|barmen|humano|onu|lei|constitui|racismo|cuidado)/i.test(
      low
    );
  if (hasAcademic) return false;
  return noisePatterns.some((re) => re.test(low));
}

function isAdminActionItem(str) {
  const low = str.toLowerCase();
  const personalOrOffTopicPatterns = [
    /\bapartamentos?\b/,
    /\baluguel\b/,
    /\bcamar[ãa]o\b/,
    /\bpreparar refei[çc][ãa]o\b/,
    /\bpassagem a[ée]rea\b/,
    /\balarme da igreja\b/,
    /\bmanter alarme\b/,
    /\bchamar o marido\b/,
    /\bindica[çc][ãa]o de camila\b|\bindicar camila\b/,
    /\bimpress[ãa]o de envelopes\b/,
    /\bcirurgia de jo[ãa]o\b/,
    /\bquadro de sa[úu]de\b/,
    /\bassuntos pendentes\b/,
    /\binstalar google agenda\b/,
  ];
  if (personalOrOffTopicPatterns.some((rx) => rx.test(low))) {
    return true;
  }

  const logisticsPatterns = [
    /^postar material:/,
    /subir o conte[úu]do da aula na pasta/,
    /^disponibilizar (material|materiais|arquivo|slides)/,
    /disponibilizar materiais did[áa]ticos:\s*upload dos slides/,
    /publicar slides:/,
    /adicionar espaco no drive|liberar espaco/,
    /configurar transcri[çc][ãa]o/,
    /assinar presen[çc]a|registre sua presen[çc]a|lista de presen[çc]a|assinar lista|formul[áa]rio de presen[çc]a|preencher presen[çc]a/,
    /enviar lista acad[êe]mica/,
    /coletar assinatura/,
    /enviar notas:\s*encaminhar as notas/,
    /liberar prova:/,
    /^enviar pdf:/,
    /confirmar aula:\s*confirmar.*haver[áa] aula/,
    /^organizar materiais:\s*acessar o aplicativo/,
    /^compartilhar link de v[íi]deo:/,
    /enviar contato do autor|divulgar contato/,
    /solicitar isen[çc][ãa]o:\s*entrar em contato diretamente com a diretora/,
    /endere[çc]o de e-mail estudantil/,
    /corrigir material did[áa]tico/,
    /preparar slides:\s*elaborar novos materiais de apresenta[çc][ãa]o/,
    /entregar todos os slides da disciplina/,
    /incluir o conte[úu]do da aula na plataforma/,
    /carregar o material da aula na plataforma/,
    /subir grava[çc][ãa]o|disponibilizar grava[çc][ãa]o|link da grava[çc][ãa]o/,
    /^comparar|^conferir.*haver[áa] aula/,
  ];
  return logisticsPatterns.some((rx) => rx.test(low));
}

function extractBiblicalReferences(text, fallback = '') {
  if (!text) return fallback;
  const books = [
    'Gênesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronômio',
    'Josué', 'Juízes', 'Rute', '1 Samuel', '2 Samuel', '1 Reis', '2 Reis',
    '1 Crônicas', '2 Crônicas', 'Esdras', 'Neemias', 'Ester', 'Jó',
    'Salmos', 'Salmo', 'Provérbios', 'Eclesiastes', 'Cantares',
    'Isaías', 'Jeremias', 'Lamentações', 'Ezequiel', 'Daniel',
    'Oseias', 'Joel', 'Amós', 'Obadias', 'Jonas', 'Miqueias',
    'Naum', 'Habacuque', 'Sofonias', 'Ageu', 'Zacarias', 'Malaquias',
    'Mateus', 'Marcos', 'Lucas', 'João', 'Atos', 'Romanos',
    '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios', 'Filipenses',
    'Colossenses', '1 Tessalonicenses', '2 Tessalonicenses',
    '1 Timóteo', '2 Timóteo', 'Tito', 'Filemom', 'Hebreus', 'Tiago',
    '1 Pedro', '2 Pedro', '1 João', '2 João', '3 João', 'Judas', 'Apocalipse',
    'Gn', 'Êx', 'Ex', 'Lv', 'Nm', 'Dt', 'Js', 'Jz', 'Sl', 'Pv', 'Is', 'Jr', 'Ez', 'Dn',
    'Mt', 'Mc', 'Lc', 'Jo', 'At', 'Rm', '1 Co', '2 Co', 'Gl', 'Ef', 'Fp', 'Cl', '1 Tm', '2 Tm', 'Tt', 'Hb', 'Tg', '1 Pe', '2 Pe', 'Jd', 'Ap'
  ];
  const escaped = books.map((b) => b.replace(/\s+/g, '\\s+')).join('|');
  const rx = new RegExp(`\\b(${escaped})\\s+(?:cap[íi]tulos?\\s+)?\\d+(?:\\s*[,:\\-–e]\\s*(?:vers[íi]culos?\\s+)?\\d+)*`, 'gi');
  const found = [];
  const seen = new Set();
  for (const m of text.matchAll(rx)) {
    const clean = m[0].replace(/\s+/g, ' ').replace(/capítulo\s+/i, '').replace(/versículo\s+/i, ':').trim();
    const norm = clean.toLowerCase();
    if (!seen.has(norm) && clean.length >= 4 && clean.length <= 45) {
      seen.add(norm);
      found.push(clean);
    }
    if (found.length >= 6) break;
  }
  return found.length > 0 ? found.join('; ') : fallback;
}

function parseDocDateIso(rawText) {
  const head = rawText.slice(0, 600);
  const m = head.match(/\b(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\.?\s+(\d{1,2}),\s*(2026)\b/i);
  if (!m) return null;
  const mo = PT_MONTHS[m[1].toLowerCase()];
  if (!mo) return null;
  return `${m[3]}-${mo}-${m[2].padStart(2, '0')}`;
}

function parseGeminiStructuredDoc(rawText) {
  // Cut before raw Transcription section so no verbose dialogue / transcript is included
  let cutText = rawText;
  const transIdx = rawText.search(/\r?\n\s*(?:📖\s*)?Transcrição\s*\r?\n/);
  if (transIdx > 150) {
    cutText = rawText.slice(0, transIdx);
  } else {
    const transWordIdx = rawText.search(/\nTranscrição\s*\n/);
    if (transWordIdx > 150) cutText = rawText.slice(0, transWordIdx);
  }

  const rawLines = cutText.split(/\r?\n/).map((l) => l.replace(/\t+/g, ' ').trim());
  const lines = [];
  for (const l of rawLines) {
    if (!l) {
      lines.push('');
      continue;
    }
    if (/^--\s*\d+\s+of\s+\d+\s*--$/i.test(l)) continue;
    if (/^📝\s*Observações$/i.test(l)) continue;
    if (l.includes('@') && !/^Resumo$/i.test(l) && l.length < 300) {
      // Remove email addresses from line; skip if nothing meaningful remains
      const stripped = scrubText(l);
      if (!stripped || stripped.length < 4) continue;
      lines.push(stripped);
      continue;
    }
    if (/^(Anexos|Registros da reunião)\b/i.test(l) && l.length < 140) continue;
    if (/^(Gravação|Transcrição)\s*(Gravação|Transcrição)?$/i.test(l)) continue;
    lines.push(l);
  }

  // Locate sections: Resumo, Próximas etapas, Detalhes
  let idxResumo = lines.findIndex((l) => /^Resumo$/i.test(l));
  let idxProximas = lines.findIndex((l) => /^Próximas etapas$/i.test(l));
  let idxDetalhes = lines.findIndex((l) => /^Detalhes$/i.test(l));

  if (idxResumo === -1) {
    // Fallback: start after title/date header (first 4 non-empty lines)
    idxResumo = 0;
  }

  const endResumo =
    idxProximas > idxResumo
      ? idxProximas
      : idxDetalhes > idxResumo
      ? idxDetalhes
      : lines.length;

  const resumoBlock = lines.slice(idxResumo + 1, endResumo);

  // Merge wrapped lines inside paragraphs, separating blocks cleanly
  const isHeadingCandidate = (line, nextLine) => {
    if (!line || line.length > 72) return false;
    if (/[.,;:!?]$/.test(line)) return false;
    if (/^[\*●•\-a-zà-ú]/.test(line)) return false;
    // Never treat a wrapped sentence ending in preposition/article/conjunction as a heading
    if (/\b(de|da|do|das|dos|e|o|a|os|as|em|no|na|nos|nas|com|para|por|sobre|que|como|um|uma|ao|à|às|aos|ou|entre|após)$/i.test(line)) {
      return false;
    }
    // Never split if next line starts with lowercase or looks like continuation
    if (nextLine && /^[a-zà-ú0-9\(]/.test(nextLine)) return false;
    // Overview sentences usually begin with these openings; treat them as paragraphs
    if (/^(O encontro|A aula|Reunião |Debate |A discussão|A sessão|Apresentação |O professor|Os participantes|Nesta aula)/i.test(line)) {
      return false;
    }
    return true;
  };

  const resumoChunks = [];
  let buf = [];
  const flushBuf = () => {
    if (buf.length > 0) {
      resumoChunks.push(buf.join(' '));
      buf = [];
    }
  };
  for (let li = 0; li < resumoBlock.length; li++) {
    const l = resumoBlock[li];
    const nextNonEmpty = resumoBlock.slice(li + 1).find((x) => x.length > 0) || '';
    if (!l) {
      flushBuf();
    } else if (buf.length === 0 && isHeadingCandidate(l, nextNonEmpty) && nextNonEmpty.length > 20) {
      // Check if previous line right before this had no blank line vs paragraph: still only emit heading if we have body right below
      resumoChunks.push(`__H__:${l}`);
    } else {
      buf.push(l);
    }
  }
  flushBuf();

  // First paragraph inside Resumo is always the overview, even if short; pair remaining __H__ headings with bodies
  let resumoGeral = '';
  const topicos = [];
  let i = 0;
  while (i < resumoChunks.length) {
    const cur = resumoChunks[i];
    if (cur.startsWith('__H__:')) {
      const title = scrubText(cur.slice(6));
      let bodyParts = [];
      i++;
      while (i < resumoChunks.length && !resumoChunks[i].startsWith('__H__:')) {
        bodyParts.push(scrubText(resumoChunks[i]));
        i++;
      }
      const body = bodyParts.join(' ').trim();
      if (title && body && !isAdminNoise(title + ' ' + body)) {
        topicos.push({ titulo: title, texto: body });
      }
    } else {
      const cleaned = scrubText(cur);
      if (cleaned && cleaned.length > 25 && !/^(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\./i.test(cleaned)) {
        if (!resumoGeral) {
          resumoGeral = cleaned;
        } else if (resumoGeral.length < 320) {
          resumoGeral += ' ' + cleaned;
        }
      }
      i++;
    }
  }

  // Extract Próximas etapas
  const proximasEtapas = [];
  if (idxProximas !== -1) {
    const endProx = idxDetalhes > idxProximas ? idxDetalhes : lines.length;
    const proxLines = lines.slice(idxProximas + 1, endProx);
    const items = [];
    let curItem = '';
    for (const l of proxLines) {
      if (!l) {
        if (curItem) {
          items.push(curItem);
          curItem = '';
        }
        continue;
      }
      if (/^[\*●•-]\s+/.test(l) || /^\[/.test(l)) {
        if (curItem) items.push(curItem);
        curItem = l.replace(/^[\*●•-]\s+/, '');
      } else {
        curItem = curItem ? `${curItem} ${l}` : l;
      }
    }
    if (curItem) items.push(curItem);
    for (const it of items) {
      const clean = scrubText(it).replace(/^\[[^\]]+\]\s*/, '');
      if (clean && !isAdminActionItem(clean) && proximasEtapas.length < 4) {
        proximasEtapas.push(clean.length > 210 ? clean.slice(0, 207) + '...' : clean);
      }
    }
  }

  // Extract Detalhes bullets as extra topics (or primary topics if Resumo lacked subheadings)
  if (idxDetalhes !== -1) {
    const detLines = lines.slice(idxDetalhes + 1);
    const bullets = [];
    let curBullet = '';
    for (const l of detLines) {
      if (!l) continue;
      if (/^[●\*•-]\s+/.test(l)) {
        if (curBullet) bullets.push(curBullet);
        curBullet = l.replace(/^[●\*•-]\s+/, '');
      } else if (curBullet) {
        curBullet += ' ' + l;
      }
    }
    if (curBullet) bullets.push(curBullet);

    for (const b of bullets) {
      if (topicos.length >= 7) break;
      const colonIdx = b.indexOf(':');
      let titulo = '';
      let texto = '';
      if (colonIdx > 4 && colonIdx < 85) {
        titulo = scrubText(b.slice(0, colonIdx));
        texto = scrubText(b.slice(colonIdx + 1));
      } else {
        titulo = 'Ponto Abordado em Aula';
        texto = scrubText(b);
      }
      if (!texto || texto.length < 30 || isAdminNoise(titulo + ' ' + texto)) continue;
      // Avoid duplicating existing topic title
      const dup = topicos.some(
        (t) =>
          t.titulo.toLowerCase().includes(titulo.toLowerCase().slice(0, 18)) ||
          titulo.toLowerCase().includes(t.titulo.toLowerCase().slice(0, 18))
      );
      if (dup) continue;
      topicos.push({
        titulo,
        texto: texto.length > 340 ? texto.slice(0, 337) + '...' : texto,
      });
    }
  }

  // Trim topics cleanly
  const trimmedTopicos = topicos.slice(0, 7).map((t) => ({
    titulo: t.titulo.length > 90 ? t.titulo.slice(0, 87) + '...' : t.titulo,
    texto: t.texto.length > 340 ? t.texto.slice(0, 337) + '...' : t.texto,
  }));

  // Build expanded resumoGeral by combining initial overview + 1-2 topic highlights if short
  if (resumoGeral.length < 240 && trimmedTopicos.length > 0) {
    const extra = trimmedTopicos
      .slice(0, 3)
      .map((t) => `${t.titulo}: ${t.texto}`)
      .join(' ');
    resumoGeral = resumoGeral ? `${resumoGeral} ${extra}` : extra;
  }
  if (resumoGeral.length > 680) {
    const cut = resumoGeral.slice(0, 675);
    const lastPeriod = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
    resumoGeral = lastPeriod > 350 ? cut.slice(0, lastPeriod + 1) : cut + '...';
  }

  return {
    resumoGeral,
    topicos: trimmedTopicos,
    proximasEtapas,
    bibRaw: scrubText(cutText),
  };
}

function buildFallbackFromDossie(disc, aula) {
  const tokens = (aula.resumo || '')
    .toLowerCase()
    .replace(/[^a-zà-ú0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !['sobre', 'para', 'como', 'pela', 'pelo', 'entre', 'com', 'aulas', 'aula', 'unidade', 'analise', 'análise'].includes(w));

  const matchedGuide = [];
  for (const g of disc.guiaRevisao || []) {
    const hay = `${g.titulo} ${g.detalhe}`.toLowerCase();
    const hits = tokens.filter((t) => hay.includes(t)).length;
    if (hits >= 1) {
      matchedGuide.push({ hits, titulo: g.titulo, texto: g.detalhe });
    }
  }
  matchedGuide.sort((a, b) => b.hits - a.hits);

  const selectedTopicos = (matchedGuide.length >= 2 ? matchedGuide : (disc.guiaRevisao || []).slice(0, 3))
    .slice(0, 5)
    .map((g) => ({
      titulo: g.titulo,
      texto: g.texto || g.detalhe,
    }));

  const parts = [aula.resumo];
  if (selectedTopicos.length > 0) {
    parts.push(
      `Pontos de aprofundamento vinculados à unidade: ${selectedTopicos
        .slice(0, 2)
        .map((t) => `${t.titulo} (${t.texto})`)
        .join(' ')}`
    );
  }
  if (disc.textosBase) {
    parts.push(`Base documental da avaliação: ${disc.textosBase}`);
  }
  let resumoGeral = parts.join(' ');
  if (resumoGeral.length > 680) {
    const cut = resumoGeral.slice(0, 675);
    const lp = cut.lastIndexOf('. ');
    resumoGeral = lp > 350 ? cut.slice(0, lp + 1) : cut + '...';
  }

  return {
    resumoGeral,
    topicos: selectedTopicos,
    proximasEtapas: disc.textosBase ? [`Revisar: ${disc.textosBase}`] : [],
    bibRaw: `${aula.resumo} ${selectedTopicos.map((t) => t.texto).join(' ')}`,
  };
}

async function main() {
  const dossie = loadDossieAv2();
  const token = await getServiceAccountToken();
  if (!token) throw new Error('Service Account token unavailable');

  const recordsByKey = new Map(); // `${disciplinaId}::${dateIso}` -> record

  // 1. Parse all 33 local PDFs (Unidade 1)
  const pdfDir = path.join(ROOT, 'public/gemini-notes');
  const pdfFiles = fs.readdirSync(pdfDir).filter((f) => f.endsWith('.pdf')).sort();
  console.log(`Reading ${pdfFiles.length} local PDFs...`);

  const groupedPdfs = new Map();
  for (const file of pdfFiles) {
    const m = file.match(/^([a-z0-9]+)_aula(\d+)(?:_p\d+)?_(\d{4}-\d{2}-\d{2})\.pdf$/i);
    if (!m) {
      console.warn('Skipping unrecognized PDF name:', file);
      continue;
    }
    const [, prefix, aulaStr, dateIso] = m;
    const disciplinaId = PDF_PREFIX_MAP[prefix.toLowerCase()];
    if (!disciplinaId) continue;

    const parser = new PDFParse({ data: fs.readFileSync(path.join(pdfDir, file)) });
    const parsedPdf = await parser.getText();
    await parser.destroy();

    const parsedDoc = parseGeminiStructuredDoc(parsedPdf.text);
    const key = `${disciplinaId}::${dateIso}`;
    const existing = groupedPdfs.get(key);
    if (existing) {
      // Merge Part 2 (hpc_aula1_p2) cleanly into Part 1
      existing.resumoGeral = existing.resumoGeral || parsedDoc.resumoGeral;
      for (const t of parsedDoc.topicos) {
        if (existing.topicos.length < 7 && !existing.topicos.some((e) => e.titulo === t.titulo)) {
          existing.topicos.push(t);
        }
      }
      for (const p of parsedDoc.proximasEtapas) {
        if (existing.proximasEtapas.length < 4 && !existing.proximasEtapas.includes(p)) {
          existing.proximasEtapas.push(p);
        }
      }
      existing.bibRaw += ' ' + parsedDoc.bibRaw;
    } else {
      groupedPdfs.set(key, {
        disciplinaId,
        aulaNum: Number(aulaStr),
        unidade: 1,
        dateIso,
        dateBr: isoToBr(dateIso),
        geminiUrl: `/gemini-notes/${file}`,
        sourceType: 'pdf',
        ...parsedDoc,
      });
    }
  }

  for (const [key, item] of groupedPdfs.entries()) {
    const discMeta = DISC_BY_ID[item.disciplinaId];
    const themeTitle =
      item.topicos[0]?.titulo && item.topicos[0].titulo !== 'Ponto Abordado em Aula'
        ? `Aula ${item.aulaNum} • ${item.topicos[0].titulo}`
        : `Aula ${item.aulaNum} • ${discMeta.shortName} (${item.dateBr})`;
    recordsByKey.set(key, {
      id: `cornell-gemini-${item.disciplinaId}-${item.dateIso}`,
      disciplinaId: item.disciplinaId,
      aulaNum: item.aulaNum,
      unidade: 1,
      dateIso: item.dateIso,
      dateBr: item.dateBr,
      theme: themeTitle.length > 110 ? themeTitle.slice(0, 107) + '...' : themeTitle,
      resumoGeral: item.resumoGeral,
      topicos: item.topicos,
      proximasEtapas: item.proximasEtapas,
      referenciasBiblicas: extractBiblicalReferences(item.bibRaw, discMeta.defaultBib),
      geminiUrl: item.geminiUrl,
      sourceType: 'pdf',
    });
  }
  console.log(`Processed ${groupedPdfs.size} unique Unidade 1 lessons.`);

  // 2. Process Unidade 2 & disc-9 from dossieAv2_2026_2.ts + Google Docs API
  let gdocSuccess = 0;
  let gdocFallback = 0;

  const tasks = [];
  for (const disc of dossie) {
    const discMeta = DISC_BY_ID[disc.disciplinaId];
    if (!discMeta) continue;
    for (const aula of disc.aulasUnidade2) {
      tasks.push({ disc, discMeta, aula });
    }
  }

  // Fetch all Google Docs in controlled parallel batches
  const batchSize = 8;
  for (let i = 0; i < tasks.length; i += batchSize) {
    const chunk = tasks.slice(i, i + batchSize);
    await Promise.all(
      chunk.map(async ({ disc, discMeta, aula }) => {
        // Compute canonical dateIso
        let dateIso = brToIso(aula.dataAprox);
        let docData = null;

        if (aula.geminiUrl) {
          const docIdMatch = aula.geminiUrl.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
          if (docIdMatch) {
            const docId = docIdMatch[1];
            try {
              const r = await fetch(
                `https://www.googleapis.com/drive/v3/files/${docId}/export?mimeType=text/plain`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (r.ok) {
                const rawTxt = await r.text();
                const parsed = parseGeminiStructuredDoc(rawTxt);
                if (parsed.resumoGeral || parsed.topicos.length > 0) {
                  docData = parsed;
                  const docDate = parseDocDateIso(rawTxt);
                  if (docDate) {
                    // Use docDate if valid 2026 date
                    dateIso = docDate;
                  }
                  gdocSuccess++;
                }
              }
            } catch (_) {}
          }
        }

        // Fallback if disc-9 modular videoaula or private Google Doc (404/401)
        if (!dateIso) {
          dateIso = getSlotDateIso(aula.aulaNum, discMeta.dayOfWeek);
        }

        const isDossieFallback = !docData;
        if (!docData) {
          docData = buildFallbackFromDossie(disc, aula);
          gdocFallback++;
        }

        // Always make sure resumoGeral leads cleanly with substantive summary and enriches with aula.resumo if needed
        let resumoGeral = docData.resumoGeral || aula.resumo;
        if (aula.resumo && resumoGeral.length < 220 && !resumoGeral.includes(aula.resumo.slice(0, 30))) {
          resumoGeral = `${aula.resumo} ${resumoGeral}`.trim();
        }
        if (resumoGeral.length > 720) {
          const cut = resumoGeral.slice(0, 715);
          const lp = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
          resumoGeral = lp > 360 ? cut.slice(0, lp + 1) : cut + '...';
        }

        const firstTopicTitle = docData.topicos[0]?.titulo;
        const cleanSummarySnippet = aula.resumo.split(';')[0].split(':')[0].trim();
        const themeTitle =
          firstTopicTitle && firstTopicTitle !== 'Ponto Abordado em Aula' && firstTopicTitle.length > 8
            ? `Aula ${aula.aulaNum} • ${firstTopicTitle}`
            : `Aula ${aula.aulaNum} • ${cleanSummarySnippet}`;

        const key = `${disc.disciplinaId}::${dateIso}`;
        recordsByKey.set(key, {
          id: `cornell-gemini-${disc.disciplinaId}-${dateIso}`,
          disciplinaId: disc.disciplinaId,
          aulaNum: aula.aulaNum,
          unidade: disc.disciplinaId === 'disc-9' ? 2 : 2,
          dateIso,
          dateBr: isoToBr(dateIso),
          theme: themeTitle.length > 110 ? themeTitle.slice(0, 107) + '...' : themeTitle,
          resumoGeral,
          topicos: docData.topicos,
          proximasEtapas: docData.proximasEtapas,
          referenciasBiblicas: extractBiblicalReferences(
            `${aula.resumo} ${docData.bibRaw}`,
            discMeta.defaultBib
          ),
          geminiUrl: aula.geminiUrl,
          videoUrl: aula.videoUrl,
          sourceType: isDossieFallback ? 'dossie' : 'gdoc',
        });
      })
    );
  }

  console.log(`Google Docs parsed: ${gdocSuccess}, Dossie enriched fallback: ${gdocFallback}`);

  const allRecords = Array.from(recordsByKey.values()).sort((a, b) => {
    if (a.disciplinaId !== b.disciplinaId) return a.disciplinaId.localeCompare(b.disciplinaId);
    return a.aulaNum - b.aulaNum;
  });

  // Final strict audit for any stray email addresses
  const serializedRecords = JSON.stringify(allRecords, null, 2);
  const strayEmails = serializedRecords.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [];
  if (strayEmails.length > 0) {
    console.warn('Warning: found email-like strings:', strayEmails);
  }

  const tsContent = `/**
 * ============================================================================
 * KOINONIA LMS — REPOSITÓRIO SSOT DE AULAS GEMINI & CADERNO CORNELL (2026.2)
 * ============================================================================
 * Arquivo gerado automaticamente a partir das anotações reais do Google Meet
 * (Unidade 1 em PDF + Unidade 2 em Google Docs) e do Dossiê AV2.
 * Zero-Waste Egress: 100% estático (0 bytes de leitura no Supabase).
 */

import type { CornellNote } from '@/types';

export interface CanonicalDisciplinaMeta {
  id: string;
  num: string;
  code: string;
  legacyCodes: string[];
  name: string;
  shortName: string;
  prof: string;
  dayOfWeek: string;
  time: string;
  defaultBib: string;
}

export const CANONICAL_DISCIPLINAS: CanonicalDisciplinaMeta[] = ${JSON.stringify(CANONICAL_DISCIPLINAS, null, 2)};

export interface GeminiAulaTopico {
  titulo: string;
  texto: string;
}

export interface GeminiAulaCornellData {
  id: string;
  disciplinaId: string;
  aulaNum: number;
  unidade: 1 | 2;
  dateIso: string;
  dateBr: string;
  theme: string;
  resumoGeral: string;
  topicos: GeminiAulaTopico[];
  proximasEtapas: string[];
  referenciasBiblicas: string;
  geminiUrl?: string;
  videoUrl?: string;
  sourceType: 'pdf' | 'gdoc' | 'dossie';
}

export const GEMINI_AULAS_CORNELL: GeminiAulaCornellData[] = ${serializedRecords};

const META_BY_ID = new Map<string, CanonicalDisciplinaMeta>(
  CANONICAL_DISCIPLINAS.map((d) => [d.id, d])
);

function normalizeDateToIso(dateStr?: string): string {
  if (!dateStr) return '';
  const clean = dateStr.replace(/^~/, '').trim();
  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(clean)) return clean;
  const br = clean.match(/(\\d{2})\\/(\\d{2})\\/(\\d{4})/);
  if (br) return \`\${br[3]}-\${br[2]}-\${br[1]}\`;
  return clean;
}

export function getCanonicalDisciplinaMeta(disciplinaId: string): CanonicalDisciplinaMeta | undefined {
  return META_BY_ID.get(disciplinaId);
}

export function getGeminiAulasForDisciplina(disciplinaId: string): GeminiAulaCornellData[] {
  if (!disciplinaId) return [];
  return GEMINI_AULAS_CORNELL.filter((a) => a.disciplinaId === disciplinaId);
}

export function getGeminiAulaRecord(
  disciplinaId: string,
  aulaNum?: number,
  dateIsoOrBr?: string
): GeminiAulaCornellData | undefined {
  if (!disciplinaId) return undefined;
  const targetIso = normalizeDateToIso(dateIsoOrBr);
  if (targetIso) {
    const byDate = GEMINI_AULAS_CORNELL.find(
      (a) => a.disciplinaId === disciplinaId && a.dateIso === targetIso
    );
    if (byDate) return byDate;
  }
  if (aulaNum !== undefined) {
    return GEMINI_AULAS_CORNELL.find(
      (a) => a.disciplinaId === disciplinaId && a.aulaNum === aulaNum
    );
  }
  return undefined;
}

export function buildCornellNoteFromGeminiAula(aula: GeminiAulaCornellData): CornellNote {
  const meta = META_BY_ID.get(aula.disciplinaId);
  const cuesList: string[] = [];

  if (aula.topicos.length > 0) {
    aula.topicos.slice(0, 4).forEach((t, idx) => {
      const prefix = idx % 2 === 0 ? '❓' : '💡';
      cuesList.push(\`\${prefix} \${idx + 1}. \${t.titulo} — como sintetizar e aplicar este ponto?\`);
    });
  } else {
    cuesList.push(\`❓ 1. Qual a tese central desenvolvida na Aula \${aula.aulaNum} de \${meta?.shortName || 'Disciplina'}?\`);
  }
  if (aula.referenciasBiblicas) {
    cuesList.push(\`📖 Referências Bíblicas: \${aula.referenciasBiblicas}\`);
  }
  cuesList.push('🎯 Aplicação Pastoral: como este ensino molda a prática ministerial e a defesa confessional?');

  const notesSections: string[] = [];
  if (aula.topicos.length > 0) {
    aula.topicos.forEach((t, idx) => {
      notesSections.push(\`📌 \${idx + 1}. \${t.titulo.toUpperCase()}\\n   ↳ \${t.texto}\`);
    });
  } else {
    notesSections.push(\`📌 1. SÍNTESE ESTRUTURADA DA AULA \${aula.aulaNum}\\n   ↳ \${aula.resumoGeral}\`);
  }

  if (aula.proximasEtapas.length > 0) {
    notesSections.push(
      \`📌 PRÓXIMAS ETAPAS & LEITURAS ORIENTADAS\\n\${aula.proximasEtapas.map((p) => \`   • \${p}\`).join('\\n')}\`
    );
  }

  const aiTextLines: string[] = [
    \`Resumo Gemini IA • Aula \${aula.aulaNum} (\${aula.dateBr})\`,
    \`Disciplina: \${meta?.shortName || aula.disciplinaId} • \${meta?.prof || ''}\`,
    '',
    'Resumo:',
    aula.resumoGeral,
  ];
  if (aula.topicos.length > 0) {
    aula.topicos.forEach((t) => {
      aiTextLines.push('', \`\${t.titulo}:\`, t.texto);
    });
  }
  if (aula.proximasEtapas.length > 0) {
    aiTextLines.push('', 'Próximas Etapas & Leituras Orientadas:');
    aula.proximasEtapas.forEach((p) => aiTextLines.push(\`• \${p}\`));
  }

  return {
    id: aula.id,
    date: aula.dateIso,
    disciplina_name: meta?.name || aula.disciplinaId,
    disciplina_code: meta?.code || 'TEO-2026',
    professor_name: meta?.prof || 'Corpo Docente',
    theme: aula.theme,
    biblical_references: aula.referenciasBiblicas || meta?.defaultBib || '',
    cues: cuesList.join('\\n\\n'),
    notes: notesSections.join('\\n\\n'),
    summary: aula.resumoGeral,
    ai_summary_url: aula.geminiUrl || aula.videoUrl || '',
    ai_summary_text: aiTextLines.join('\\n'),
    tags: [
      meta?.shortName || 'Disciplina',
      \`Aula \${aula.aulaNum}\`,
      'Gemini IA',
      'Auto-Cornell',
    ],
  };
}

let cachedAutoNotes: Record<string, CornellNote> | null = null;

export function getAllAutoGeneratedCornellNotes(): Record<string, CornellNote> {
  if (!cachedAutoNotes) {
    const map: Record<string, CornellNote> = {};
    for (const aula of GEMINI_AULAS_CORNELL) {
      map[aula.id] = buildCornellNoteFromGeminiAula(aula);
    }
    cachedAutoNotes = map;
  }
  return cachedAutoNotes;
}

export function buildCornellDeepLinkUrl(
  disciplinaId: string,
  dateIso?: string,
  aulaNum?: number
): string {
  const params = new URLSearchParams();
  params.set('tab', 'aluno-caderno');
  if (disciplinaId) params.set('disciplina', disciplinaId);
  if (dateIso) params.set('date', dateIso);
  if (aulaNum !== undefined) params.set('aula', String(aulaNum));
  return \`/?\${params.toString()}\`;
}
`;

  const outPath = path.join(ROOT, 'src/data/geminiAulasCornell.ts');
  fs.writeFileSync(outPath, tsContent, 'utf8');
  const sizeKb = (Buffer.byteLength(tsContent, 'utf8') / 1024).toFixed(1);
  console.log(`Generated ${outPath}: ${allRecords.length} lessons (${sizeKb} KB), strayEmails=${strayEmails.length}`);

  // Summary per discipline
  for (const d of CANONICAL_DISCIPLINAS) {
    const sub = allRecords.filter((r) => r.disciplinaId === d.id);
    console.log(
      `  ${d.id} (${d.shortName}): total=${sub.length} | U1=${sub.filter((x) => x.unidade === 1).length} | U2=${sub.filter((x) => x.unidade === 2).length} | aulas=[${sub.map((x) => `${x.aulaNum}:${x.dateIso}`).join(', ')}]`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
