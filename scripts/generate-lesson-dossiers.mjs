import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import ts from 'typescript';
import { PDFParse } from 'pdf-parse';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public/lesson-dossiers');

const CANONICAL_DISCIPLINAS = [
  {
    id: 'disc-1',
    num: '01',
    code: 'HIS-202',
    name: '01 - História do Congregacionalismo - Ary Júnior',
    shortName: 'História do Congregacionalismo',
    prof: 'Profº Ary Júnior',
    defaultBib: 'Mateus 18:15-20; Atos 15:1-29; 1 Pedro 2:9',
  },
  {
    id: 'disc-2',
    num: '02',
    code: 'HIS-102',
    name: '02 - História do Pensamento Cristão II - Hilário Bispo',
    shortName: 'História do Pensamento Cristão II',
    prof: 'Profº Hilário Bispo',
    defaultBib: '1 Timóteo 4:16; Tito 1:9; Romanos 1:16-17; Judas 1:3',
  },
  {
    id: 'disc-3',
    num: '03',
    code: 'ACO-202',
    name: '03 - Aconselhamento Bíblico II - Uilian Santos',
    shortName: 'Aconselhamento Bíblico II',
    prof: 'Profº Uilian Santos',
    defaultBib: 'Provérbios 18:13; Romanos 15:14; Salmos 130; Hebreus 6:19',
  },
  {
    id: 'disc-4',
    num: '04',
    code: 'DIR-101',
    name: '04 - Direitos Humanos - Cleiton Barbirato',
    shortName: 'Direitos Humanos',
    prof: 'Profº Cleiton Barbirato',
    defaultBib: 'Gênesis 1:26-27; Miqueias 6:8; Deuteronômio 10:18-19',
  },
  {
    id: 'disc-5',
    num: '05',
    code: 'ETC-201',
    name: '05 - Ética Cristã - Karoline Evangelista',
    shortName: 'Ética Cristã',
    prof: 'Profª Karoline Evangelista',
    defaultBib: 'Êxodo 20:1-17; Mateus 5:17-48; Romanos 12:1-2',
  },
  {
    id: 'disc-6',
    num: '06',
    code: 'NT-301',
    name: '06 - Novo Testamento III - Epístolas Gerais - Marcio Leal',
    shortName: 'Novo Testamento III (Epístolas)',
    prof: 'Profº Marcio Leal',
    defaultBib: 'Tiago 1–5; 1 Pedro 1–5; 2 Pedro 1–3; 1–3 João; Judas',
  },
  {
    id: 'disc-7',
    num: '07',
    code: 'MIS-202',
    name: '07 - Plantação e Revitalização de Igrejas II - Thácyto Lessa',
    shortName: 'Plantação & Revitalização II',
    prof: 'Profº Thácyto Lessa',
    defaultBib: 'Atos 2:42-47; Mateus 16:18; Efésios 4:11-16',
  },
  {
    id: 'disc-8',
    num: '08',
    code: 'TCC-101',
    name: '08 - TCC I - Gabriela Leal',
    shortName: 'TCC I',
    prof: 'Profª Gabriela Leal',
    defaultBib: 'Eclesiastes 12:9-12; Lucas 1:1-4; 2 Timóteo 2:15',
  },
  {
    id: 'disc-9',
    num: '09',
    code: 'AFR-101',
    name: '09 - História da Cultura Afro Brasileira e Indígena - Alexsandro',
    shortName: 'Cultura Afro & Indígena',
    prof: 'Profº Alexsandro de Oliveira Silva',
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

function loadTsExports(relPath) {
  const full = path.join(ROOT, relPath);
  const src = fs.readFileSync(full, 'utf8');
  const out = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  const mod = { exports: {} };
  new Function('exports', 'require', 'module', out.outputText)(mod.exports, () => ({}), mod);
  return mod.exports;
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
  const signature = crypto.createSign('RSA-SHA256').update(`${header}.${claim}`).sign(key, 'base64url');

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

function normalizeProfessorNames(text) {
  if (!text) return '';
  return text
    .replace(/\b(?:o\s+professor|professor)\s+uilian\s+santos\b/gi, 'Profº Uilian Santos')
    .replace(/\builian\s+santos\b/gi, 'Profº Uilian Santos')
    .replace(/\b(?:o\s+professor|professor|pastor)\s+ary\s+j[úu]nior\b/gi, 'Profº Ary Júnior')
    .replace(/\bary\s+j[úu]nior\b/gi, 'Profº Ary Júnior')
    .replace(/\b(?:o\s+professor|professor)\s+hil[áa]rio\s+bispo\b/gi, 'Profº Hilário Bispo')
    .replace(/\bhil[áa]rio\s+bispo\b/gi, 'Profº Hilário Bispo')
    .replace(/\b(?:o\s+professor|professor)\s+cleiton\s+barbirato\b/gi, 'Profº Cleiton Barbirato')
    .replace(/\bcleiton\s+barbirato\b/gi, 'Profº Cleiton Barbirato')
    .replace(/\b(?:a\s+professora|professora)\s+karoline\s+evangelista\b/gi, 'Profª Karoline Evangelista')
    .replace(/\bkaroline\s+evangelista\b/gi, 'Profª Karoline Evangelista')
    .replace(/\b(?:o\s+professor|professor)\s+m[áa]rcio\s+leal\b/gi, 'Profº Marcio Leal')
    .replace(/\bm[áa]rcio\s+leal\b/gi, 'Profº Marcio Leal')
    .replace(/\bmarcio\s+leal\b/gi, 'Profº Marcio Leal')
    .replace(/\b(?:o\s+professor|professor)\s+th[áa]cyto\s+lessa\b/gi, 'Profº Thácyto Lessa')
    .replace(/\bth[áa]cyto\s+lessa\b/gi, 'Profº Thácyto Lessa')
    .replace(/\b(?:a\s+professora|professora)\s+gabriela\s+leal\b/gi, 'Profª Gabriela Leal')
    .replace(/\bgabriela\s+leal\b/gi, 'Profª Gabriela Leal');
}

function scrubText(text) {
  if (!text) return '';
  const cleaned = text
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
  return normalizeProfessorNames(cleaned);
}

function extractTimestampFromBlock(raw) {
  const matches = [...(raw || '').matchAll(/\(\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*\)/g)];
  if (matches.length === 0) return undefined;
  return matches[matches.length - 1][1];
}

function parseDurationSeconds(tsStr) {
  if (!tsStr) return 0;
  const parts = tsStr.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function formatDurationLabel(seconds) {
  if (!seconds || seconds < 60) return undefined;
  const mins = Math.round(seconds / 60);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `~${h}h${String(m).padStart(2, '0')}min`;
  return `~${mins}min`;
}

function isLogisticalBlock(title, body) {
  const lowTitle = (title || '').toLowerCase();
  const lowAll = `${title} ${body}`.toLowerCase();

  // Always remove non-academic personal/logistical noise
  if (
    /custos de moradia/i.test(lowTitle) ||
    /pesquisar apartamentos|opções de aluguel|camarão sem pimenta|passagem aérea|alarme da igreja|impressão de envelopes/i.test(lowAll)
  ) {
    return true;
  }
  if (/^encerramento da aula.*lista de presença/i.test(lowTitle) || /lista de presença.*antes do fechamento/i.test(lowAll)) {
    return true;
  }
  if (/^(verificações de conectividade|problemas técnicos|atualizações técnicas|chamada inicial)/i.test(lowTitle)) {
    return true;
  }
  if (
    /(lista de presença|instabilidade na conexão|problemas técnicos de áudio|câmera desligada|abertura da chamada)/.test(lowAll) &&
    !/(teolog|bíbl|escritur|igreja|crist|doutrina|históri|exeg|aconselham|ética|direito|tcc|abnt|afro|indíg|reforma|evangel|salmo|roman|mateus|hebreus|gênesis|esperança|inventário|pecado|oração)/.test(lowAll)
  ) {
    return true;
  }
  return false;
}

function cutBeforeTranscript(rawText) {
  if (!rawText) return '';
  let cutIdx = rawText.length;

  const markers = [
    /\r?\n\s*Revise as anotações do Gemini para checar/i,
    /\r?\n\s*Como está a qualidade de destas observações/i,
    /\r?\n\s*(?:📖\s*)?Transcrição\s*\r?\n/i,
    /\r?\n[^\n]{3,120}-\s*Transcrição\s*\r?\n\s*\d{2}:\d{2}:\d{2}/i,
  ];
  for (const rx of markers) {
    const m = rawText.match(rx);
    if (m && m.index !== undefined && m.index > 150 && m.index < cutIdx) {
      cutIdx = m.index;
    }
  }
  return rawText.slice(0, cutIdx);
}

const BIBLE_BOOKS = [
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
const BIBLE_RX = new RegExp(
  `\\b(${BIBLE_BOOKS.map((b) => b.replace(/\s+/g, '\\s+')).join('|')})\\s+(?:cap[íi]tulos?\\s+)?\\d+(?:\\s*[,:\\-–e]\\s*(?:vers[íi]culos?\\s+)?\\d+)*`,
  'gi'
);

function extractBlockBibleRefs(text) {
  if (!text) return [];
  const found = [];
  const seen = new Set();
  for (const m of text.matchAll(BIBLE_RX)) {
    const clean = m[0]
      .replace(/\s+/g, ' ')
      .replace(/capítulo\s+/i, '')
      .replace(/versículo\s+/i, ':')
      .replace(/[,.;:]+$/, '')
      .trim();
    const norm = clean.toLowerCase();
    if (!seen.has(norm) && clean.length >= 4 && clean.length <= 45) {
      seen.add(norm);
      found.push(clean);
    }
    if (found.length >= 5) break;
  }
  return found;
}

function splitSentences(text) {
  if (!text) return [];
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12);
}

function classifyMoment(title, body, idx, total) {
  const combined = `${title} ${body}`.toLowerCase();
  let categoria = 'Ensino Central';
  if (
    /(estudo de caso|caso hipot[ée]tico|testemunho|relato de caso|exemplific|ilustra[çc][ãa]o|presen[çc]a inesperada|atendimento a)/.test(
      combined
    )
  ) {
    categoria = 'Estudo de Caso';
  } else if (
    /(exegese|texto b[íi]blico|tradu[çc][õo]es b[íi]blicas|vers[íi]culo|an[áa]lise de roman|an[áa]lise de g[êe]nesis|hermen[êe]ut|passagem|evangelho de)/.test(
      combined
    ) ||
    extractBlockBibleRefs(body).length >= 2
  ) {
    categoria = 'Exegese Bíblica';
  } else if (
    /(debate|discuss[ãa]o|perspectivas|cr[íi]tica [àa]|participantes|contribu|questionamento|concorda|opini[ãa]o)/.test(
      combined
    )
  ) {
    categoria = 'Debate em Turma';
  } else if (
    /(hist[óo]ric|s[ée]culo|reforma|iluminismo|puritan|calvino|lutero|barth|schleiermacher|bultmann|kalley|barmen|confiss[ãa]o|despatologiza|origem)/.test(
      combined
    )
  ) {
    categoria = 'Contexto Histórico';
  } else if (
    /(gabinete|aplica[çc][ãa]o|aconselhamento|acolhimento|pastoral|igreja local|disciplina eclesi[áa]stica|minist[ée]rio|regenera[çc][ãa]o|discipulado|ora[çc][ãa]o)/.test(
      combined
    )
  ) {
    categoria = 'Aplicação Pastoral';
  }

  let fase = 'Desenvolvimento Teológico';
  const ratio = total > 1 ? idx / (total - 1) : 0;
  if (idx === 0 && (ratio <= 0.2 || /(abertura|introdu[çc][ãa]o|contexto inicial|revis[ãa]o|boas-vindas)/i.test(title))) {
    fase = 'Abertura & Contexto';
  } else if (categoria === 'Estudo de Caso' || categoria === 'Debate em Turma') {
    fase = 'Casos & Debate';
  } else if (idx >= total - 1 || categoria === 'Aplicação Pastoral' || /(fundamento|aplica[çc][ãa]o|conclus|perspectiva escatol)/i.test(title)) {
    fase = 'Síntese & Aplicação';
  }

  return { categoria, fase };
}

function parseDetailedDoc(rawText) {
  const cut = cutBeforeTranscript(rawText);
  const rawLines = cut.split(/\r?\n/).map((l) => l.replace(/\t+/g, ' ').trim());

  const cleanLines = [];
  for (const l of rawLines) {
    if (!l) {
      cleanLines.push('');
      continue;
    }
    if (/^--\s*\d+\s+of\s+\d+\s*--$/i.test(l)) continue;
    if (/^📝\s*Observações$/i.test(l)) continue;
    if (l.includes('@') && l.length < 400) {
      const s = scrubText(l);
      if (!s || s.length < 5) continue;
      cleanLines.push(s);
      continue;
    }
    if (/^(Anexos|Registros da reunião)\b/i.test(l) && l.length < 140) continue;
    if (/^(Gravação|Transcrição)\s*(Gravação|Transcrição)?$/i.test(l)) continue;
    cleanLines.push(l);
  }

  const idxResumo = cleanLines.findIndex((l) => /^Resumo$/i.test(l));
  const idxProximas = cleanLines.findIndex((l) => /^Próximas etapas$/i.test(l));
  const idxDetalhes = cleanLines.findIndex((l) => /^Detalhes$/i.test(l));

  // Overview text
  const startOverview = idxResumo >= 0 ? idxResumo + 1 : 0;
  const endOverview =
    idxProximas > startOverview
      ? idxProximas
      : idxDetalhes > startOverview
      ? idxDetalhes
      : cleanLines.length;

  const resumoParagraphs = [];
  let pBuf = [];
  for (const line of cleanLines.slice(startOverview, endOverview)) {
    if (!line) {
      if (pBuf.length > 0) {
        resumoParagraphs.push(scrubText(pBuf.join(' ')));
        pBuf = [];
      }
    } else {
      pBuf.push(line);
    }
  }
  if (pBuf.length > 0) {
    resumoParagraphs.push(scrubText(pBuf.join(' ')));
  }

  // Raw Detalhes lines
  let detailBlocksRaw = [];
  if (idxDetalhes !== -1) {
    const detText = cleanLines.slice(idxDetalhes + 1).join('\n');
    if (/_{5,}/.test(detText)) {
      // Google Docs format: blocks separated by underscores
      detailBlocksRaw = detText
        .split(/_{5,}/)
        .map((b) => b.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim())
        .filter((b) => b.length > 35);
    } else {
      // PDF format: bullets starting with ● / • / * or short Heading: Body
      const detLines = cleanLines.slice(idxDetalhes + 1);
      let cur = '';
      for (const l of detLines) {
        if (!l) continue;
        if (/^[●•\*]\s+/.test(l)) {
          if (cur) detailBlocksRaw.push(cur.trim());
          cur = l.replace(/^[●•\*]\s+/, '');
        } else {
          cur = cur ? `${cur} ${l}` : l;
        }
      }
      if (cur) detailBlocksRaw.push(cur.trim());
    }
  }

  const parsedMoments = [];
  let maxSeconds = 0;

  for (const rawBlock of detailBlocksRaw) {
    const ts = extractTimestampFromBlock(rawBlock);
    if (ts) {
      maxSeconds = Math.max(maxSeconds, parseDurationSeconds(ts));
    }

    const colonIdx = rawBlock.indexOf(':');
    let title = '';
    let body = '';
    if (colonIdx >= 4 && colonIdx <= 125) {
      title = scrubText(rawBlock.slice(0, colonIdx)).replace(/^[-•●*\s]+/, '');
      body = scrubText(rawBlock.slice(colonIdx + 1));
    } else {
      const sents = splitSentences(scrubText(rawBlock));
      title = sents[0]?.slice(0, 85) || 'Momento da Aula';
      body = scrubText(rawBlock);
    }

    if (!title || !body || body.length < 30) continue;
    if (isLogisticalBlock(title, body)) continue;

    parsedMoments.push({
      titulo: title,
      detalhamento: body,
      timestamp: ts,
    });
  }

  return {
    sinteseGeral: resumoParagraphs.filter((p) => p.length > 15).join(' '),
    rawMoments: parsedMoments,
    duracaoEstimada: formatDurationLabel(maxSeconds),
  };
}

function buildDossierObject(baseRecord, parsedSource, dossieDisc, dossieAula) {
  const discMeta = DISC_BY_ID[baseRecord.disciplinaId];
  const momentosSrc = [...(parsedSource?.rawMoments || [])];

  // Fallback / supplement if parsedSource had few or no Detalhes blocks
  if (momentosSrc.length === 0) {
    for (const t of baseRecord.topicos || []) {
      momentosSrc.push({
        titulo: normalizeProfessorNames(t.titulo),
        detalhamento: normalizeProfessorNames(t.texto),
        timestamp: undefined,
      });
    }
  }
  if (momentosSrc.length === 0) {
    momentosSrc.push({
      titulo: baseRecord.theme,
      detalhamento: normalizeProfessorNames(baseRecord.resumoGeral || dossieAula?.resumo || ''),
      timestamp: undefined,
    });
  }

  const total = momentosSrc.length;
  const linhaDoTempo = momentosSrc.map((m, idx) => {
    const sentences = splitSentences(m.detalhamento);
    const resumoCurto = sentences[0] || m.detalhamento;
    const pontosChave = sentences.slice(0, 4);
    const { categoria, fase } = classifyMoment(m.titulo, m.detalhamento, idx, total);
    const refsNoBloco = extractBlockBibleRefs(`${m.titulo}. ${m.detalhamento}`);

    return {
      ordem: idx + 1,
      ...(m.timestamp ? { timestamp: m.timestamp } : {}),
      fase,
      categoria,
      titulo: m.titulo,
      resumoCurto,
      detalhamento: m.detalhamento,
      pontosChave: pontosChave.length > 0 ? pontosChave : [m.detalhamento],
      referenciasNoBloco: refsNoBloco,
    };
  });

  // Cases & Debates extracted from timeline
  const casosEDebates = linhaDoTempo
    .filter((m) => m.categoria === 'Estudo de Caso' || m.categoria === 'Debate em Turma')
    .map((m) => ({
      titulo: m.titulo,
      relato: m.detalhamento,
      ...(m.timestamp ? { timestamp: m.timestamp } : {}),
    }));

  // Biblical references with matching sentence context
  const bibMap = new Map();
  const allSearchableTexts = [
    ...linhaDoTempo.map((m) => m.detalhamento),
    baseRecord.resumoGeral || '',
  ];
  for (const txt of allSearchableTexts) {
    for (const sent of splitSentences(txt)) {
      const refs = extractBlockBibleRefs(sent);
      for (const r of refs) {
        const key = r.toLowerCase();
        if (!bibMap.has(key)) {
          bibMap.set(key, { referencia: r, contexto: sent });
        }
      }
    }
  }
  if (bibMap.size === 0 && baseRecord.referenciasBiblicas) {
    for (const r of baseRecord.referenciasBiblicas.split(';').map((s) => s.trim()).filter(Boolean)) {
      bibMap.set(r.toLowerCase(), {
        referencia: r,
        contexto: `Base bíblica trabalhada na disciplina ${discMeta.shortName}.`,
      });
    }
  }

  // Exam points matched from Dossiê AV2
  const topicWords = new Set(
    `${baseRecord.theme} ${baseRecord.resumoGeral} ${linhaDoTempo.map((m) => m.titulo).join(' ')}`
      .toLowerCase()
      .replace(/[^a-zà-ú0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 5)
  );
  const scoredExamPoints = (dossieDisc?.guiaRevisao || []).map((g) => {
    const hay = `${g.titulo} ${g.detalhe}`.toLowerCase();
    let score = 0;
    for (const w of topicWords) {
      if (hay.includes(w)) score += 1;
    }
    return { titulo: g.titulo, detalhe: g.detalhe, score };
  });
  scoredExamPoints.sort((a, b) => b.score - a.score);
  const pontosDeProva = scoredExamPoints.slice(0, 3).map(({ titulo, detalhe }) => ({ titulo, detalhe }));

  // Review Questions (Active Recall)
  const perguntasRevisao = linhaDoTempo.slice(0, 5).map((m) => ({
    pergunta: `O que foi ensinado e concluído sobre "${m.titulo}" nesta aula?`,
    dicaResposta: m.pontosChave.slice(0, 2).join(' '),
  }));

  const resumoCurado =
    dossieAula?.resumo ||
    baseRecord.resumoGeral ||
    linhaDoTempo[0]?.resumoCurto ||
    '';

  const sinteseGeral =
    parsedSource?.sinteseGeral && parsedSource.sinteseGeral.length > 40
      ? parsedSource.sinteseGeral
      : baseRecord.resumoGeral || resumoCurado;

  const mapaRapido = linhaDoTempo.slice(0, 6).map((m) => `${m.titulo}: ${m.resumoCurto}`);

  return {
    id: `${baseRecord.disciplinaId}-aula-${baseRecord.aulaNum}`,
    disciplinaId: baseRecord.disciplinaId,
    disciplinaName: discMeta.name,
    disciplinaShortName: discMeta.shortName,
    disciplinaCode: discMeta.code,
    professor: discMeta.prof,
    aulaNum: baseRecord.aulaNum,
    unidade: baseRecord.unidade,
    dateIso: baseRecord.dateIso,
    dateBr: baseRecord.dateBr,
    theme: baseRecord.theme,
    ...(baseRecord.geminiUrl ? { geminiUrl: baseRecord.geminiUrl } : {}),
    ...(baseRecord.videoUrl || dossieAula?.videoUrl
      ? { videoUrl: baseRecord.videoUrl || dossieAula?.videoUrl }
      : {}),
    sourceType: parsedSource?.sourceType || 'dossie',
    panorama: {
      resumoCurado,
      sinteseGeral,
      mapaRapido,
      ...(parsedSource?.duracaoEstimada ? { duracaoEstimada: parsedSource.duracaoEstimada } : {}),
      totalBlocos: linhaDoTempo.length,
    },
    linhaDoTempo,
    casosEDebates,
    referenciasBiblicas: Array.from(bibMap.values()).slice(0, 10),
    pontosDeProva,
    perguntasRevisao,
    encaminhamentos: baseRecord.proximasEtapas || [],
  };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const { GEMINI_AULAS_CORNELL } = loadTsExports('src/data/geminiAulasCornell.ts');
  const { DOSSIE_AV2_2026_2 } = loadTsExports('src/data/dossieAv2_2026_2.ts');
  const token = await getServiceAccountToken();

  console.log(`Loaded ${GEMINI_AULAS_CORNELL.length} lessons. Service Account token: ${token ? 'OK' : 'UNAVAILABLE'}`);

  // Pre-parse all U1 local PDFs grouped by disciplinaId::dateIso
  const pdfDir = path.join(ROOT, 'public/gemini-notes');
  const pdfFiles = fs.readdirSync(pdfDir).filter((f) => f.endsWith('.pdf')).sort();
  const pdfParsedByKey = new Map();

  for (const file of pdfFiles) {
    const m = file.match(/^([a-z0-9]+)_aula(\d+)(?:_p\d+)?_(\d{4}-\d{2}-\d{2})\.pdf$/i);
    if (!m) continue;
    const [, prefix, , dateIso] = m;
    const discId = PDF_PREFIX_MAP[prefix.toLowerCase()];
    if (!discId) continue;

    const parser = new PDFParse({ data: fs.readFileSync(path.join(pdfDir, file)) });
    const parsedPdf = await parser.getText();
    await parser.destroy();

    const parsedDoc = parseDetailedDoc(parsedPdf.text);
    const key = `${discId}::${dateIso}`;
    const prev = pdfParsedByKey.get(key);
    if (prev) {
      for (const mom of parsedDoc.rawMoments) {
        if (!prev.rawMoments.some((e) => e.titulo === mom.titulo)) {
          prev.rawMoments.push(mom);
        }
      }
      if (!prev.sinteseGeral && parsedDoc.sinteseGeral) prev.sinteseGeral = parsedDoc.sinteseGeral;
      if (!prev.duracaoEstimada && parsedDoc.duracaoEstimada) prev.duracaoEstimada = parsedDoc.duracaoEstimada;
    } else {
      pdfParsedByKey.set(key, {
        ...parsedDoc,
        sourceType: 'pdf',
      });
    }
  }
  console.log(`Parsed ${pdfParsedByKey.size} unique U1 PDF sets.`);

  // Fetch Google Docs for records having docs.google.com/document URL
  const gdocParsedById = new Map();
  if (token) {
    const docRecords = GEMINI_AULAS_CORNELL.filter((r) =>
      String(r.geminiUrl || '').includes('docs.google.com/document/d/')
    );
    const batchSize = 8;
    for (let i = 0; i < docRecords.length; i += batchSize) {
      const batch = docRecords.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (rec) => {
          const match = rec.geminiUrl.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
          if (!match) return;
          try {
            const res = await fetch(
              `https://www.googleapis.com/drive/v3/files/${match[1]}/export?mimeType=text/plain`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) return;
            const rawTxt = await res.text();
            const parsedDoc = parseDetailedDoc(rawTxt);
            if (parsedDoc.rawMoments.length > 0 || parsedDoc.sinteseGeral.length > 30) {
              gdocParsedById.set(rec.id, {
                ...parsedDoc,
                sourceType: 'google-doc',
              });
            }
          } catch (_) {}
        })
      );
    }
  }
  console.log(`Parsed ${gdocParsedById.size} U2 Google Docs via Service Account.`);

  const indexEntries = [];
  const strayEmails = [];

  for (const rec of GEMINI_AULAS_CORNELL) {
    const dossieDisc = DOSSIE_AV2_2026_2.find((d) => d.disciplinaId === rec.disciplinaId);
    const dossieAula = (dossieDisc?.aulasUnidade2 || []).find((a) => a.aulaNum === rec.aulaNum);

    const parsedSource =
      gdocParsedById.get(rec.id) ||
      pdfParsedByKey.get(`${rec.disciplinaId}::${rec.dateIso}`) || {
        sinteseGeral: rec.resumoGeral,
        rawMoments: [],
        sourceType: 'dossie',
      };

    const dossier = buildDossierObject(rec, parsedSource, dossieDisc, dossieAula);
    const jsonStr = JSON.stringify(dossier, null, 2);

    const emails = jsonStr.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g);
    if (emails) {
      strayEmails.push({ id: dossier.id, emails });
    }

    const outFile = path.join(OUT_DIR, `${dossier.disciplinaId}-aula-${dossier.aulaNum}.json`);
    fs.writeFileSync(outFile, jsonStr, 'utf8');

    indexEntries.push({
      id: dossier.id,
      disciplinaId: dossier.disciplinaId,
      disciplinaShortName: dossier.disciplinaShortName,
      aulaNum: dossier.aulaNum,
      unidade: dossier.unidade,
      dateIso: dossier.dateIso,
      dateBr: dossier.dateBr,
      theme: dossier.theme,
      totalBlocos: dossier.panorama.totalBlocos,
      ...(dossier.panorama.duracaoEstimada ? { duracaoEstimada: dossier.panorama.duracaoEstimada } : {}),
      sourceType: dossier.sourceType,
    });
  }

  indexEntries.sort((a, b) => a.disciplinaId.localeCompare(b.disciplinaId) || a.aulaNum - b.aulaNum);
  fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(indexEntries, null, 2), 'utf8');

  console.log(`Generated ${indexEntries.length} lesson dossiers in ${OUT_DIR}. strayEmails=${strayEmails.length}`);
  if (strayEmails.length > 0) {
    console.error('STRAY EMAILS FOUND:', JSON.stringify(strayEmails));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
