import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

interface TransformRequestBody {
  url?: string;
  text?: string;
  disciplina_name?: string;
  disciplina_code?: string;
  professor_name?: string;
  date?: string;
  provider?: 'auto' | 'openai' | 'gemini' | 'native';
  openai_api_key?: string;
  openai_model?: string;
  gemini_api_key?: string;
}

/**
 * Extrai o ID de um arquivo do Google Docs a partir de uma URL.
 */
function extractGoogleDocId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (fileMatch && fileMatch[1]) return fileMatch[1];
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];
  return null;
}

/**
 * Autentica com a Google Service Account via JWT e obtém token OAuth2.
 */
async function getServiceAccountToken(): Promise<string | null> {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!serviceAccountEmail || !privateKey) return null;

  try {
    privateKey = privateKey.replace(/\\n/g, '\n');
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const claim = Buffer.from(
      JSON.stringify({
        iss: serviceAccountEmail,
        scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/documents.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
      })
    ).toString('base64url');

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(`${header}.${claim}`);
    const signature = signer.sign(privateKey, 'base64url');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: `${header}.${claim}.${signature}`,
      }),
    });

    if (!tokenResponse.ok) {
      console.warn('Erro ao obter token da Service Account:', await tokenResponse.text());
      return null;
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token || null;
  } catch (err) {
    console.warn('Exceção ao gerar token JWT:', err);
    return null;
  }
}

/**
 * Baixa o texto do documento no Google Docs usando a Service Account ou export público.
 */
async function fetchGoogleDocText(docId: string): Promise<string | null> {
  // 1. Tenta baixar autenticado via Service Account (Google Drive Export API)
  const token = await getServiceAccountToken();
  if (token) {
    try {
      const exportUrl = `https://www.googleapis.com/drive/v3/files/${docId}/export?mimeType=text/plain`;
      const res = await fetch(exportUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 10) return text;
      }
    } catch (e) {
      console.warn('Falha no export autenticado do Drive:', e);
    }
  }

  // 2. Fallback: Tenta baixar como export público caso o link tenha permissão de leitura
  try {
    const publicExportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
    const res = await fetch(publicExportUrl);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 10 && !text.includes('<!DOCTYPE html>')) {
        return text;
      }
    }
  } catch (e) {
    console.warn('Falha no export público do Google Docs:', e);
  }

  return null;
}

/**
 * Limpa ruídos de e-mails, logs de presença e metadados técnicos do Google Meet.
 */
function cleanMeetNoise(raw: string): string[] {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const cleaned: string[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Filtra lista de e-mails dos participantes da reunião
    if (line.includes('@') && (line.includes('.com') || line.includes('.br') || line.includes('.edu'))) {
      continue;
    }
    if (lower.startsWith('convidado') || lower.startsWith('convidados') || lower.includes('professor virtual')) {
      continue;
    }
    // Filtra cabeçalhos técnicos do Google Docs / Meet
    if (lower.includes('registros da reunião') || (lower.includes('transcrição') && lower.includes('gravação'))) {
      continue;
    }
    if (lower.startsWith('anexos') && line.length < 50) {
      continue;
    }
    if (lower.startsWith('criado por:') || lower.startsWith('data:') && line.length < 20) {
      continue;
    }

    cleaned.push(line);
  }

  return cleaned;
}

/**
 * Extrai blocos lógicos estruturados do texto da transcrição.
 */
interface SectionBlock {
  title: string;
  items: string[];
}

function parseBlocksFromCleanLines(lines: string[]): SectionBlock[] {
  const blocks: SectionBlock[] = [];
  let currentBlock: SectionBlock | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = line.startsWith('-') || line.startsWith('•') || line.startsWith('*') || line.startsWith('→');
    const isNumbered = /^\d+[\.\)]\s+/.test(line);
    const isShortHeader = line.length <= 65 && !line.endsWith('.') && !isBullet && !isNumbered;
    const isSpecialHeader = /^(resumo|planejamento|metodologia|estrutura|debate|tópicos|impacto|próximas etapas|tarefas|bibliografia|ação|action items|conteúdo|contexto)/i.test(line);

    if (isNumbered || isShortHeader || isSpecialHeader) {
      if (currentBlock && currentBlock.items.length > 0) {
        blocks.push(currentBlock);
      }
      currentBlock = {
        title: line.replace(/^[-•*\d\.\)]\s*/, '').replace(/[:#]/g, '').trim(),
        items: [],
      };
    } else {
      if (!currentBlock) {
        currentBlock = { title: 'Tópicos Abordados', items: [] };
      }
      const cleanItem = line.replace(/^[-•*]\s*/, '').trim();
      if (cleanItem.length > 0) {
        currentBlock.items.push(cleanItem);
      }
    }
  }

  if (currentBlock && currentBlock.items.length > 0) {
    blocks.push(currentBlock);
  }

  return blocks;
}

/**
 * Pós-processa e formata a resposta do modelo para garantir espaçamento visual e remoção de seções administrativas.
 */
function sanitizeAndFormatCornellOutput(data: any): {
  theme: string;
  biblical_references: string;
  cues: string;
  notes: string;
  summary: string;
} {
  let theme = (data.theme || '').trim();
  let biblical = (data.biblical_references || '').trim();
  let cues = (data.cues || '').trim();
  let notes = (data.notes || '').trim();
  let summary = (data.summary || '').trim();

  // 1. Formata Cues com espaçamento generoso
  cues = cues
    .replace(/\s*(❓|💡|🎯)\s*(\d+[\.\)])?/g, '\n\n$1 ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // 2. Remove seções administrativas ou de ementa (ex: 16 encontros, critérios de avaliação) que possam ter sobrado
  const notesSections = notes.split(/(?=📌\s*\d*)/g).filter(Boolean);
  const cleanSections: string[] = [];
  let sectionCounter = 1;

  for (const sec of notesSections) {
    const lowerSec = sec.toLowerCase();
    // Filtra se a seção for puramente sobre estrutura de 16 encontros / provas / ementa do curso
    if (
      (lowerSec.includes('estrutura da disciplina') ||
        lowerSec.includes('critérios avaliativos') ||
        lowerSec.includes('planejamento pedagógico') ||
        lowerSec.includes('avaliação e metodologia')) &&
      (lowerSec.includes('16 encontro') || lowerSec.includes('provas escritas') || lowerSec.includes('8 pontos'))
    ) {
      continue;
    }

    // Renumera e formata o título
    let formattedSec = sec
      .replace(/^📌\s*\d*[\.\)]?\s*/, `📌 ${sectionCounter}. `)
      .replace(/,\s*•/g, '\n•')
      .replace(/,\s*↳/g, '\n   ↳')
      .trim();

    cleanSections.push(formattedSec);
    sectionCounter++;
  }

  notes = cleanSections.length > 0 ? cleanSections.join('\n\n') : notes;

  // 3. Formata Notes com espaçamento entre tópicos
  notes = notes
    .replace(/(📌\s*\d+[\.\)]?\s*[^\n]+)/g, '$1\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return {
    theme,
    biblical_references: biblical,
    cues,
    notes,
    summary,
  };
}

/**
 * Transforma o texto usando a API da OpenAI (ChatGPT / GPT-4o / GPT-4.1 / GPT-5.5).
 */
async function transformWithOpenAiApi(
  rawText: string,
  disciplina: string,
  professor: string,
  date: string,
  apiKey: string,
  model: string = 'gpt-4o'
) {
  const prompt = `Você é um professor titular e especialista teológico acadêmico no Método Cornell de Anotações e Pedagogia Universitária.
Analise a transcrição/resumo abaixo da aula de "${disciplina}" (Docente: ${professor}, Data: ${date}).

Transforme o conteúdo em uma folha completa, profunda e IMPECAVELMENTE ORGANIZADA no Método Cornell.
A leitura, visualização e estudo devem ser EXTREMAMENTE AGRADÁVEIS, com espaçamentos generosos entre blocos de ideias, quebras de linha duplas e indicadores visuais elegantes.

⚠️ REGRAS CRÍTICAS DE CONTEÚDO E RELEVÂNCIA TEOLÓGICA:
1. PROIBIDO CRIAR SEÇÕES DE ESTRUTURA DO CURSO: NUNCA crie uma seção sobre "Estrutura da Disciplina", "Apresentação da Ementa", "16 Encontros", "Critérios de Avaliação", "Provas" ou recados de início/fim de aula. Se a gravação contiver comentários de abertura sobre cronograma ou chamadas, IGNORE-OS TOTALMENTE.
2. FOQUE 100% NO CONTEÚDO TEOLÓGICO/HISTÓRICO MINISTRADO NESTA AULA: Estruture as anotações EXCLUSIVAMENTE sobre os conceitos teológicos, doutrinas, teses, autores citados (ex: Jeremiah Burroughs, puritanos, reformadores, pais da igreja), debates exegéticos, evolução histórica e passagens bíblicas analisadas.
3. ABRANGÊNCIA TOTAL DA TRANSCRIÇÃO (INÍCIO, MEIO E FIM): Esta transcrição reflete uma aula completa. Não resuma apenas o início. Percorra a transcrição inteira e extraia com profundidade os argumentos, distinções doutrinárias e conclusões desenvolvidas ao longo de toda a aula.

DIRETRIZES DE FORMATAÇÃO E ESPAÇAMENTO:

1. THEME: Título temático acadêmico, específico e robusto da matéria ministrada.

2. BIBLICAL_REFERENCES: Todos os textos bíblicos citados ou que fundamentam a matéria (ex: "Atos 1:15; Atos 6:2-5; 1 Coríntios 5; Atos 20:17, 28; Filipenses 1:1").

3. CUES (Coluna da Esquerda - 30% / Pistas & Perguntas):
   - Separe CADA pergunta ou conceito com DUAS QUEBRAS DE LINHA (\n\n) para ficarem bem espaçadas e fáceis de ler.
   - Use indicadores visuais padronizados no início de cada item:
     ❓ 1. [Pergunta de Auto-Teste / Active Recall sobre os temas da aula]
     
     💡 2. [Conceito-Chave / Doutrina Teológica / Termo Exegético Central]
     
     ❓ 3. [Pergunta Hermenêutica / Discussão Bíblica e Contextual]
     
     🎯 4. [Aplicação Pastoral e Prática Ministerial na Igreja Local]
   - Forneça de 5 a 8 pistas/perguntas claras, profundas e bem espaçadas sobre o texto fornecido.

4. NOTES (Coluna da Direita - 70% / Anotações de Aula Estruturadas):
   - Divida em 4 a 6 seções temáticas de alto valor acadêmico (ex: 📌 1. [TEMA DOUTRINÁRIO / HISTÓRICO 1], 📌 2. [TEMA 2]...).
   - Deixe SEMPRE uma linha em branco antes de cada título de seção e entre blocos de tópicos.
   - Use marcadores hierárquicos detalhados com recuo para cada argumento:
     • Ideia Central / Argumento:
       ↳ Argumento detalhado do docente ou citação
       ↳ Desdobramento conceitual ou exemplo histórico
       ↳ Texto bíblico ou fundamentação teológica
   - Mantenha linhas arejadas e ricas para não sobrecarregar visualmente quem vai estudar.

5. SUMMARY (Faixa Basal Inferior / Resumo Global e Conclusão):
   - Redija um resumo executivo COMPLETO, FLUIDO e DENSO de 1 a 2 parágrafos sólidos (4 a 6 frases bem articuladas e finalizadas com ponto final).
   - Deve sintetizar a tese teológica central da aula, os argumentos debatidos e a aplicação prática para a liderança eclesiástica.
   - NUNCA use frases inacabadas ou sentenças cortadas.

Texto da Aula / Transcrição a transformar:
${rawText}

Responda OBRIGATORIAMENTE em JSON válido com as seguintes chaves:
{
  "theme": "...",
  "biblical_references": "...",
  "cues": "...",
  "notes": "...",
  "summary": "..."
}`;

  // Mapeia modelos para garantir compatibilidade
  let selectedModel = model;
  if (model === 'gpt-4.1' || model === 'gpt-5.5') {
    selectedModel = 'gpt-4o'; // Fallback para modelos de ponta disponíveis
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: selectedModel || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente acadêmico de teologia e especialista no Método Cornell. Responda exclusivamente em formato JSON válido com resumos completos, profundos, fiéis ao conteúdo teológico ministrado e sem seções de metodologia/cronograma de 16 encontros.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 3500,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${errData?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const jsonText = data.choices?.[0]?.message?.content;
  if (!jsonText) throw new Error('Resposta vazia da API da OpenAI.');

  const parsed = JSON.parse(jsonText);
  return sanitizeAndFormatCornellOutput(parsed);
}

/**
 * Transforma o texto usando a API do Gemini caso chave de API esteja configurada.
 */
async function transformWithGeminiApi(
  rawText: string,
  disciplina: string,
  professor: string,
  date: string,
  apiKey: string
) {
  const prompt = `Você é um professor titular e especialista teológico acadêmico no Método Cornell de Anotações e Pedagogia Universitária.
Analise a transcrição/resumo abaixo da aula de "${disciplina}" (Docente: ${professor}, Data: ${date}).

Transforme o conteúdo em uma folha completa, profunda e IMPECAVELMENTE ORGANIZADA no Método Cornell.
A leitura, visualização e estudo devem ser EXTREMAMENTE AGRADÁVEIS, com espaçamentos generosos entre blocos de ideias, quebras de linha duplas e indicadores visuais elegantes.

⚠️ REGRAS CRÍTICAS DE CONTEÚDO E RELEVÂNCIA TEOLÓGICA:
1. PROIBIDO CRIAR SEÇÕES DE ESTRUTURA DO CURSO: NUNCA crie uma seção sobre "Estrutura da Disciplina", "Apresentação da Ementa", "16 Encontros", "Critérios de Avaliação", "Provas" ou recados de início/fim de aula. Se a gravação contiver comentários de abertura sobre cronograma ou chamadas, IGNORE-OS TOTALMENTE.
2. FOQUE 100% NO CONTEÚDO TEOLÓGICO/HISTÓRICO MINISTRADO NESTA AULA: Estruture as anotações EXCLUSIVAMENTE sobre os conceitos teológicos, doutrinas, teses, autores citados (ex: Jeremiah Burroughs, puritanos, reformadores, pais da igreja), debates exegéticos, evolução histórica e passagens bíblicas analisadas.
3. ABRANGÊNCIA TOTAL DA TRANSCRIÇÃO (INÍCIO, MEIO E FIM): Esta transcrição reflete uma aula completa. Não resuma apenas o início. Percorra a transcrição inteira e extraia com profundidade os argumentos, distinções doutrinárias e conclusões desenvolvidas ao longo de toda a aula.

DIRETRIZES DE FORMATAÇÃO E ESPAÇAMENTO:

1. THEME: Título temático acadêmico, claro e robusto da aula.

2. BIBLICAL_REFERENCES: Todos os textos bíblicos citados ou que fundamentam a matéria (ex: "Atos 1:15; Atos 6:2-5; 1 Coríntios 5; Atos 20:17, 28; Filipenses 1:1").

3. CUES (Coluna da Esquerda - 30% / Pistas & Perguntas):
   - Separe CADA pergunta ou conceito com DUAS QUEBRAS DE LINHA (\n\n) para ficarem bem espaçadas e fáceis de ler.
   - Use indicadores visuais padronizados no início de cada item:
     ❓ 1. [Pergunta de Auto-Teste / Active Recall baseada no texto desta aula]
     
     💡 2. [Conceito-Chave / Doutrina Central debatida nesta aula]
     
     ❓ 3. [Pergunta Hermenêutica / Discussão Bíblica desta aula]
     
     🎯 4. [Aplicação Prática Ministerial referente ao tema da aula]
   - Forneça de 5 a 8 pistas/perguntas claras e bem espaçadas.

4. NOTES (Coluna da Direita - 70% / Anotações de Aula Estruturadas):
   - Divida em 4 a 6 seções temáticas de alto valor acadêmico (ex: 📌 1. [TEMA DOUTRINÁRIO / HISTÓRICO 1], 📌 2. [TEMA 2]...).
   - Deixe SEMPRE uma linha em branco antes de cada título de seção e entre blocos de tópicos.
   - Use marcadores hierárquicos com recuo e quebras de linha claras para cada argumento:
     • Ideia Central / Fundamentação:
       ↳ Argumento detalhado do docente
       ↳ Citação exegética ou texto bíblico
   - Mantenha linhas arejadas para facilitar a leitura.

5. SUMMARY (Faixa Basal Inferior / Resumo Global e Conclusão):
   - Redija um resumo executivo COMPLETO, FLUIDO e DENSO de 1 a 2 parágrafos sólidos (4 a 6 frases bem articuladas e finalizadas com ponto final).
   - Deve apresentar a síntese global da aula: a tese teológica central, os principais argumentos debatidos e a conclusão/aplicação pastoral prática.
   - NUNCA use frases inacabadas ou sentenças cortadas.

Texto da Aula / Transcrição a transformar:
${rawText}

Responda OBRIGATORIAMENTE em JSON válido:
{
  "theme": "...",
  "biblical_references": "...",
  "cues": "...",
  "notes": "...",
  "summary": "..."
}`;

  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
  ];

  let lastError: Error | null = null;

  for (const model of candidateModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          return sanitizeAndFormatCornellOutput(parsed);
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        lastError = new Error(errJson?.error?.message || response.statusText);
      }
    } catch (e: any) {
      lastError = e;
    }
  }

  throw lastError || new Error('Não foi possível gerar conteúdo via API do Gemini.');
}

/**
 * Motor Heurístico Teológico Avançado (Deep Theological Cornell Engine).
 * Processa integralmente o documento sem truncar, gerando anotações dinâmicas a partir do texto real.
 */
function transformWithTheologicalParser(
  rawText: string,
  disciplina: string,
  professor: string,
  date: string
) {
  const cleanedLines = cleanMeetNoise(rawText);
  const blocks = parseBlocksFromCleanLines(cleanedLines);

  // 1. Extração de Referências Bíblicas no texto completo
  const bibleRegex = /\b(Gênesis|Êxodo|Levítico|Números|Deuteronômio|Josué|Juízes|Rute|1\s?Samuel|2\s?Samuel|1\s?Reis|2\s?Reis|1\s?Crônicas|2\s?Crônicas|Esdras|Neemias|Ester|Jó|Salmos?|Provérbios?|Eclesiastes|Cantares|Isaías|Jeremias|Lamentações|Ezequiel|Daniel|Oseias|Joel|Amós|Obadias|Jonas|Miqueias|Naum|Habacuque|Sofonias|Ageu|Zacarias|Malaquias|Mateus|Marcos|Lucas|João|Atos|Romanos|1\s?Coríntios|2\s?Coríntios|Gálatas|Efésios|Filipenses|Colossenses|1\s?Tessalonicenses|2\s?Tessalonicenses|1\s?Timóteo|2\s?Timóteo|Tito|Filemom|Hebreus|Tiago|1\s?Pedro|2\s?Pedro|1\s?João|2\s?João|3\s?João|Judas|Apocalipse)\s+\d+(:[\d,-]+)?/gi;
  const biblicalMatches = Array.from(new Set(rawText.match(bibleRegex) || []));
  const biblicalReferences = biblicalMatches.length > 0
    ? biblicalMatches.map(b => b.trim().replace(/,$/, '')).join('; ')
    : '';

  // 2. Extração e Elaboração do Resumo Executivo (Summary)
  let executiveSummary = '';
  const summaryBlock = blocks.find((b) =>
    b.title.toLowerCase().includes('resumo executivo') ||
    b.title.toLowerCase().includes('resumo') ||
    b.title.toLowerCase().includes('síntese')
  );

  if (summaryBlock && summaryBlock.items.length > 0) {
    executiveSummary = summaryBlock.items.join(' ');
  }

  if (!executiveSummary || executiveSummary.length < 30) {
    const firstParagraphs = cleanedLines.filter(l => l.length > 30 && !l.toLowerCase().includes('resumo')).slice(0, 3);
    if (firstParagraphs.length > 0) {
      executiveSummary = firstParagraphs.join(' ');
    } else {
      executiveSummary = `A aula de ${disciplina} (${date}) conduzida pelo(a) ${professor} articulou os pontos centrais da matéria, analisando os tópicos e aprofundando o debate teológico.`;
    }
  }

  // 3. Montagem das Anotações de Aula Estruturadas (Notes - 70%) com Espaçamento e Indicadores
  const notesSections: string[] = [];
  let sectionIndex = 1;

  for (const block of blocks) {
    if (block.title.toLowerCase().includes('resumo executivo')) continue;

    const formattedTitle = `📌 ${sectionIndex}. ${block.title.toUpperCase()}`;
    const itemsFormatted = block.items.map((item, idx) => {
      if (idx === 0) {
        return `• ${item}`;
      }
      return `   ↳ ${item}`;
    });

    if (itemsFormatted.length > 0) {
      notesSections.push(`${formattedTitle}\n\n${itemsFormatted.join('\n')}`);
      sectionIndex++;
    }
  }

  // Se nenhum bloco com cabeçalhos foi detectado, agrupa as linhas em parágrafos temáticos
  if (notesSections.length === 0) {
    const chunkSize = Math.max(3, Math.ceil(cleanedLines.length / 3));
    for (let i = 0; i < cleanedLines.length; i += chunkSize) {
      const chunk = cleanedLines.slice(i, i + chunkSize);
      const title = `📌 ${sectionIndex}. TÓPICO ${sectionIndex}`;
      const items = chunk.map((line, idx) => idx === 0 ? `• ${line}` : `   ↳ ${line}`);
      notesSections.push(`${title}\n\n${items.join('\n')}`);
      sectionIndex++;
    }
  }

  // 4. Criação Dinâmica de Pistas & Perguntas de Auto-Teste (Cues - 30%) a partir dos blocos reais
  const cues: string[] = [];
  let cueCount = 1;

  blocks.forEach((block) => {
    if (cueCount <= 6 && block.title && !block.title.toLowerCase().includes('resumo')) {
      cues.push(`❓ ${cueCount}. O que foi discutido a respeito de "${block.title}"?`);
      cueCount++;
      if (block.items.length > 0 && cueCount <= 6) {
        cues.push(`💡 ${cueCount}. Conceito-Chave: ${block.items[0].substring(0, 120)}`);
        cueCount++;
      }
    }
  });

  if (cues.length < 3) {
    cues.push(`❓ 1. Qual a tese central e os principais argumentos desta aula de ${disciplina}?`);
    cues.push(`💡 2. Quais são os conceitos-chave ou doutrinas teológicas examinadas neste encontro?`);
    cues.push(`🎯 3. Como aplicar as conclusões desta aula na prática ministerial e eclesiástica?`);
    cues.push(`❓ 4. Pergunta de Auto-Teste: Explique com suas próprias palavras o conteúdo debatido nesta aula.`);
  }

  // 5. Identificação do Tema
  let theme = '';
  const firstSignificantBlock = blocks.find(b => b.title && b.title.length > 5 && !b.title.toLowerCase().includes('resumo'));
  if (firstSignificantBlock) {
    theme = firstSignificantBlock.title;
  }
  if (!theme || theme.length < 6) {
    theme = `Conteúdo Temático de ${disciplina} (${date})`;
  }

  return {
    theme,
    biblical_references: biblicalReferences,
    cues: cues.join('\n\n'),
    notes: notesSections.join('\n\n'),
    summary: executiveSummary,
  };
}

/**
 * Sanitiza e converte qualquer campo retornado pela IA para texto puro.
 */
function sanitizeFieldToString(field: any): string {
  if (field === null || field === undefined) return '';
  if (Array.isArray(field)) {
    return field
      .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item).trim()))
      .filter(Boolean)
      .join('\n\n');
  }
  if (typeof field === 'object') {
    return Object.values(field)
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join('\n\n');
  }
  return String(field).replace(/\\n/g, '\n').trim();
}

/**
 * Pós-processador para Pistas e Perguntas (Cues - 30%):
 * Garante que cada pergunta fique em sua própria linha, com quebra dupla (\n\n) e sem vírgulas conectivas.
 */
function formatCuesText(raw: any): string {
  let text = sanitizeFieldToString(raw);
  if (!text) return '';

  // Substitui vírgulas antes de indicadores visuais ou numeração
  text = text.replace(/,\s*(❓|💡|🎯|•|\d+[\.\)])/g, '\n\n$1');
  text = text.replace(/(❓|💡|🎯)/g, '\n\n$1');

  const rawLines = text
    .split('\n')
    .map((l) => l.trim().replace(/^,/, '').replace(/,$/, '').trim())
    .filter(Boolean);

  const formattedCues: string[] = [];

  for (const line of rawLines) {
    // Se ainda houver itens separados por vírgula interna
    const subParts = line.split(/,\s*(?=[❓💡🎯•]|\d+[\.\)])/);
    for (const part of subParts) {
      const cleanPart = part.trim().replace(/^,/, '').replace(/,$/, '').trim();
      if (cleanPart) {
        formattedCues.push(cleanPart);
      }
    }
  }

  return formattedCues.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Pós-processador para Anotações de Aula (Notes - 70%):
 * Garante que títulos de seções (📌), tópicos (•) e desdobramentos (   ↳ )
 * fiquem em linhas isoladas, perfeitamente hierarquizados e sem vírgulas no meio.
 */
function formatNotesText(raw: any): string {
  let text = sanitizeFieldToString(raw);
  if (!text) return '';

  // Converte vírgulas antes de tópicos em quebras de linha reais
  text = text.replace(/,\s*(📌|\d+[\.\)])/g, '\n\n$1');
  text = text.replace(/,\s*•\s*/g, '\n\n• ');
  text = text.replace(/,\s*↳\s*/g, '\n   ↳ ');
  text = text.replace(/,\s*-\s*/g, '\n   ↳ ');

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const formattedSections: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].replace(/^,/, '').replace(/,$/, '').trim();

    // Se uma linha tiver múltiplos marcadores colados
    if (rawLine.includes(',•') || rawLine.includes(', ↳') || rawLine.includes(',📌')) {
      const splitItems = rawLine
        .replace(/,\s*📌/g, '\n\n📌')
        .replace(/,\s*•/g, '\n\n•')
        .replace(/,\s*↳/g, '\n   ↳')
        .split('\n');
      for (const item of splitItems) {
        const cleanItem = item.trim();
        if (cleanItem) formattedSections.push(cleanItem);
      }
      continue;
    }

    if (rawLine.startsWith('📌')) {
      formattedSections.push(`\n${rawLine}\n`);
    } else if (rawLine.startsWith('•')) {
      formattedSections.push(`\n${rawLine}`);
    } else if (rawLine.startsWith('↳') || rawLine.startsWith('->') || rawLine.startsWith('-')) {
      const cleanSub = rawLine.replace(/^[↳\->\s]+/, '').trim();
      formattedSections.push(`   ↳ ${cleanSub}`);
    } else {
      formattedSections.push(rawLine);
    }
  }

  return formattedSections.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Pós-processador para Resumo Consolidado (Summary):
 * Garante que a síntese e os tópicos conclusivos tenham quebras de linha limpas e nenhuma frase inacabada.
 */
function formatSummaryText(raw: any): string {
  let text = sanitizeFieldToString(raw);
  if (!text) return '';

  text = text.replace(/,\s*•\s*/g, '\n\n• ');
  text = text.replace(/•\s*/g, '\n• ');
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  // Remove quebras vazias ou dois pontos soltos no final
  text = text.replace(/(\n?•\s*)+$/, '');
  text = text.replace(/,\s*$/, '.');
  if (text.endsWith(':') || text.endsWith('enfatizou:') || text.endsWith('destacando:')) {
    text = text.replace(/[:\s]+$/, '.');
  }

  return text;
}

export async function POST(req: NextRequest) {
  try {
    const body: TransformRequestBody = await req.json();
    const {
      url,
      text,
      disciplina_name = 'Teologia',
      disciplina_code = 'TEO-2026',
      professor_name = 'Corpo Docente',
      date = new Date().toISOString().split('T')[0],
      provider = 'auto',
      openai_api_key,
      openai_model = 'gpt-4o',
      gemini_api_key,
    } = body;

    let contentToProcess = text || '';

    // Se uma URL do Google Docs foi fornecida, tenta obter o texto do documento
    if (url && (!contentToProcess || contentToProcess.trim().length < 20)) {
      const docId = extractGoogleDocId(url);
      if (docId) {
        const fetchedDocText = await fetchGoogleDocText(docId);
        if (fetchedDocText) {
          contentToProcess = fetchedDocText;
        }
      }
    }

    // Se ainda não houver texto suficiente, retorna instruções para o usuário
    if (!contentToProcess || contentToProcess.trim().length < 15) {
      if (url) {
        return NextResponse.json({
          success: false,
          error: 'Não foi possível ler o conteúdo do link do Google Docs automaticamente (o documento pode estar privado). Por favor, copie e cole o texto do resumo no campo abaixo para transformá-lo.',
          needTextPaste: true,
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: 'Informe um link válido do Google Docs ou cole o texto do resumo/transcrição da aula.',
      }, { status: 400 });
    }

    // Identifica chaves disponíveis
    const activeOpenAiKey = openai_api_key || process.env.OPENAI_API_KEY;
    const activeGeminiKey = gemini_api_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    let result;
    let usedProvider = 'native';
    let usedModel = 'Deep Theological Cornell Engine';

    // 1. Tenta OpenAI se selecionado ou no modo automático com chave OpenAI
    if (provider === 'openai' || (provider === 'auto' && activeOpenAiKey)) {
      if (activeOpenAiKey) {
        try {
          result = await transformWithOpenAiApi(
            contentToProcess,
            disciplina_name,
            professor_name,
            date,
            activeOpenAiKey,
            openai_model
          );
          usedProvider = 'openai';
          usedModel = openai_model || 'gpt-4o';
        } catch (openAiErr) {
          console.warn('Falha na API OpenAI:', openAiErr);
        }
      }
    }

    // 2. Tenta Gemini se selecionado ou no modo automático (se OpenAI não foi usado/falhou)
    if (!result && (provider === 'gemini' || (provider === 'auto' && activeGeminiKey))) {
      if (activeGeminiKey) {
        try {
          result = await transformWithGeminiApi(
            contentToProcess,
            disciplina_name,
            professor_name,
            date,
            activeGeminiKey
          );
          usedProvider = 'gemini';
          usedModel = 'gemini-2.5-flash';
        } catch (geminiError) {
          console.warn('Falha na API Gemini, usando motor teológico profundo:', geminiError);
        }
      }
    }

    // 3. Fallback ou Motor Nativo
    if (!result) {
      result = transformWithTheologicalParser(
        contentToProcess,
        disciplina_name,
        professor_name,
        date
      );
      usedProvider = 'native';
      usedModel = 'Deep Theological Cornell Engine';
    }

    // Aplica normalização e separação rigorosa de linhas em branco e recuos
    const formattedCues = formatCuesText(result.cues);
    const formattedNotes = formatNotesText(result.notes);
    const formattedSummary = formatSummaryText(result.summary);

    return NextResponse.json({
      success: true,
      data: {
        theme: result.theme || `Aula de ${disciplina_name} (${date})`,
        biblical_references: result.biblical_references || '',
        cues: formattedCues,
        notes: formattedNotes,
        summary: formattedSummary,
        sourceText: contentToProcess,
        usedProvider,
        usedModel,
      },
    });
  } catch (error: any) {
    console.error('Erro na rota /api/ai/transform-cornell:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao processar resumo no Método Cornell.',
      },
      { status: 500 }
    );
  }
}
