import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type AbntAiAction =
  | 'draft_section'
  | 'rewrite_impersonal'
  | 'expand_theological'
  | 'generate_abstract'
  | 'format_reference';

interface AbntAssistRequestBody {
  action: AbntAiAction;
  title?: string;
  subtitle?: string;
  disciplinaName?: string;
  sectionTitle?: string;
  currentText?: string;
  userNotes?: string;
  sectionsSummary?: string;
  rawReference?: string;
  openaiApiKey?: string;
  geminiApiKey?: string;
}

function buildPrompts(body: AbntAssistRequestBody): { system: string; user: string } {
  const {
    action,
    title = 'Artigo Acadêmico em Teologia',
    subtitle = '',
    disciplinaName = 'Teologia',
    sectionTitle = '',
    currentText = '',
    userNotes = '',
    sectionsSummary = '',
    rawReference = '',
  } = body;

  const baseSystem =
    'Você é um orientador metodológico e professor titular de Teologia especialista em redação científica ABNT (NBR 6022, 14724, 10520, 6028 e 6023). ' +
    'Escreva sempre em português culto do Brasil, utilizando rigorosamente linguagem científica impessoal em 3ª pessoa ("observa-se", "constata-se", "analisa-se", "evidencia-se") e evitando 1ª pessoa ("eu", "nós", "acho"). ' +
    'Responda exclusivamente em JSON válido conforme o esquema solicitado.';

  switch (action) {
    case 'draft_section':
      return {
        system: baseSystem,
        user: `Redija um texto acadêmico sólido, bem estruturado em 2 a 4 parágrafos dissertativos (separados por \\n\\n) para a seção "${sectionTitle}" do trabalho intitulado "${title}${subtitle ? `: ${subtitle}` : ''}", na disciplina "${disciplinaName}".

Ideias / tópicos fornecidos pelo seminarista:
${userNotes || currentText || 'Desenvolver argumentação introdutória e teologicamente fundamentada sobre o tema.'}

Responda exclusivamente em JSON válido:
{
  "text": "Parágrafos redigidos no padrão científico ABNT (3ª pessoa impessoal)",
  "notes": "Breve observação de revisão para o autor"
}`,
      };

    case 'rewrite_impersonal':
      return {
        system: baseSystem,
        user: `Reescreva o texto acadêmico abaixo convertendo qualquer expressão em 1ª pessoa ("eu", "nós", "acho", "meu") ou tom informal para linguagem científica estritamente impessoal ABNT (3ª pessoa / voz passiva pronominal), preservando integralmente os argumentos teológicos, autores e referências bíblicas originais.

Disciplina: ${disciplinaName} | Seção: ${sectionTitle}
Texto original:
${currentText || userNotes}

Responda exclusivamente em JSON válido:
{
  "text": "Texto reescrito em 3ª pessoa impessoal",
  "notes": "Principais ajustes de impessoalidade realizados"
}`,
      };

    case 'expand_theological':
      return {
        system: baseSystem,
        user: `Aprofunde teológica e academicamente o texto abaixo mantendo a fidelidade à tese apresentada, elevando a coesão argumentativa, a precisão conceitual bíblico-teológica e a formalidade ABNT (3ª pessoa impessoal), na disciplina "${disciplinaName}" (Seção: "${sectionTitle}").

Texto base:
${currentText}

Orientações extras do seminarista:
${userNotes || 'Aprofundar argumentação e conectar ideias com rigor acadêmico.'}

Responda exclusivamente em JSON válido:
{
  "text": "Texto aprofundado em parágrafos bem articulados (separados por \\n\\n)",
  "notes": "Resumo do aprofundamento sugerido"
}`,
      };

    case 'generate_abstract':
      return {
        system: baseSystem,
        user: `Com base no título e no conteúdo das seções do trabalho abaixo, elabore:
1. RESUMO em português (ABNT NBR 6028): parágrafo ÚNICO contínuo entre 150 e 280 palavras contendo contextualização, objetivo, metodologia, principais desenvolvimentos e conclusão em 3ª pessoa.
2. PALAVRAS-CHAVE: 3 a 5 descritores separados por ponto final e com iniciais maiúsculas (ex: "Teologia Sistemática. Eclesiologia. Reforma Protestante.").
3. ABSTRACT em inglês: tradução acadêmica fiel em parágrafo único.
4. KEYWORDS: 3 a 5 keywords equivalentes separadas por ponto final.

Título: ${title}${subtitle ? `: ${subtitle}` : ''}
Disciplina: ${disciplinaName}
Síntese do conteúdo:
${sectionsSummary || userNotes || 'Trabalho acadêmico no curso de Bacharelado em Teologia.'}

Responda exclusivamente em JSON válido:
{
  "resumo": "...",
  "palavrasChave": "...",
  "abstractEn": "...",
  "keywordsEn": "..."
}`,
      };

    case 'format_reference':
      return {
        system: baseSystem,
        user: `Converta a indicação bibliográfica solta abaixo para o formato estrito da ABNT NBR 6023, identificando os campos estruturados e destacando o título da obra principal entre **asteriscos duplos** para negrito (ex: SOBRENOME, Nome. **Título da obra**: subtítulo. Cidade: Editora, Ano.).

Referência informada pelo aluno:
${rawReference || userNotes || currentText}

Responda exclusivamente em JSON válido:
{
  "type": "livro | capitulo | artigo | biblia | site | livre",
  "authors": "SOBRENOME, Prenome",
  "title": "Título principal",
  "subtitle": "Subtítulo se houver ou vazio",
  "containerTitle": "Revista ou livro coletânea se houver",
  "edition": "ex: 2. ed. ou vazio",
  "city": "Cidade",
  "publisher": "Editora",
  "year": "Ano",
  "pages": "ex: 45-62 ou vazio",
  "url": "URL se houver ou vazio",
  "accessDate": "ex: 21 nov. 2026 ou vazio",
  "formattedText": "Referência completa pronta em NBR 6023 com **Título** em negrito"
}`,
      };
  }
}

async function callOpenAi(system: string, user: string, apiKey: string): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.35,
      max_tokens: 2400,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI status ${response.status}`);
  }
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI retornou resposta vazia.');
  return JSON.parse(content);
}

async function callGemini(system: string, user: string, apiKey: string): Promise<any> {
  const models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];
  let lastErr: Error | null = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${system}\n\n${user}` }] }],
            generationConfig: {
              temperature: 0.35,
              responseMimeType: 'application/json',
            },
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) return JSON.parse(rawText);
      } else {
        lastErr = new Error(`Gemini ${model} status ${response.status}`);
      }
    } catch (e: any) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Gemini indisponível.');
}

/**
 * Fallback estruturado local para garantir resposta útil mesmo quando nenhuma chave
 * de LLM externa está configurada no ambiente.
 */
function buildNativeAcademicFallback(body: AbntAssistRequestBody) {
  const title = body.title || 'Tema Teológico';
  const disc = body.disciplinaName || 'Teologia';
  const section = body.sectionTitle || 'Desenvolvimento';
  const raw = (body.currentText || body.userNotes || '').trim();

  if (body.action === 'rewrite_impersonal') {
    const rewritten = (raw || 'Texto analisado sob perspectiva teológica.')
      .replace(/\b[Ee]u acho que\b/g, 'Observa-se que')
      .replace(/\b[Ee]u penso que\b/g, 'Constata-se que')
      .replace(/\b[Ee]u acredito que\b/g, 'Argumenta-se que')
      .replace(/\b[Pp]ercebemos que\b/g, 'Verifica-se que')
      .replace(/\b[Cc]oncluímos que\b/g, 'Conclui-se que')
      .replace(/\b[Nn]osso trabalho\b/gi, 'o presente estudo')
      .replace(/\b[Mm]eu trabalho\b/gi, 'o presente estudo')
      .replace(/\b[Mm]inha pesquisa\b/gi, 'a presente pesquisa')
      .replace(/\b[Nn]ós analisamos\b/gi, 'analisa-se')
      .replace(/\b[Ee]u\b/g, 'o pesquisador');
    return {
      text: rewritten,
      notes: 'Aplicada conversão nativa para 3ª pessoa impessoal (configure GEMINI_API_KEY ou OPENAI_API_KEY para reescrita semântica completa).',
    };
  }

  if (body.action === 'generate_abstract') {
    return {
      resumo: `O presente trabalho investiga o tema "${title}" no âmbito da disciplina ${disc}, buscando analisar seus fundamentos bíblico-teológicos, implicações históricas e relevância para a práxis pastoral contemporânea. A pesquisa adota metodologia qualitativa de revisão bibliográfica e documental, dialogando com fontes primárias das Escrituras e literatura teológica especializada selecionada ao longo do curso. Os resultados examinados demonstram a centralidade da coerência doutrinária aliada à responsabilidade eclesial, evidenciando caminhos aplicáveis às comunidades locais. Conclui-se que a abordagem estruturada segundo os critérios acadêmicos possibilita uma síntese consistente entre reflexão confessional e atuação ministerial.`,
      palavrasChave: `${disc.split(' - ')[0].trim()}. Teologia. Prática Pastoral. Escrituras Sagradas.`,
      abstractEn: `This paper investigates the topic "${title}" within the course ${disc}, aiming to analyze its biblical-theological foundations, historical implications, and relevance to contemporary pastoral praxis. The research adopts a qualitative methodology based on bibliographic and documentary review, engaging primary scriptural sources and specialized theological literature. The analyzed findings highlight the centrality of doctrinal coherence combined with ecclesial responsibility, demonstrating practical paths for local Christian communities.`,
      keywordsEn: `Theology. Pastoral Praxis. Biblical Studies. Church History.`,
    };
  }

  if (body.action === 'format_reference') {
    const clean = (body.rawReference || raw || 'AUTOR, Nome. Título da Obra. Local: Editora, 2026.').trim();
    return {
      type: 'livre',
      authors: clean.split('.')[0] || 'AUTOR, Sobrenome',
      title: clean,
      year: '2026',
      formattedText: clean,
    };
  }

  const seedIdea = raw || `aspectos centrais pertinentes à seção ${section} no contexto de ${disc}`;
  return {
    text:
      `No âmbito da seção referente a ${section.toLowerCase()}, observa-se a necessidade de examinar criticamente ${seedIdea}. A reflexão teológica rigorosa demanda a articulação entre o texto bíblico em seu contexto histórico-redentivo e o diálogo responsável com a tradição cristã e os autores contemporâneos estudados em ${disc}.\n\n` +
      `Sob essa perspectiva analítica, evidencia-se que o estudo sistemático do tema contribui para superar leituras superficiais, oferecendo parâmetros éticos e doutrinários consistentes para a atuação pastoral e acadêmica.`,
    notes: 'Estrutura inicial gerada pelo motor acadêmico nativo (configure GEMINI_API_KEY ou OPENAI_API_KEY para geração personalizada avançada).',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AbntAssistRequestBody;
    if (!body?.action) {
      return NextResponse.json(
        { success: false, error: 'Ação do assistente ABNT não informada.' },
        { status: 400 }
      );
    }

    const openAiKey = body.openaiApiKey || process.env.OPENAI_API_KEY;
    const geminiKey =
      body.geminiApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    const { system, user } = buildPrompts(body);
    let data: any = null;
    let usedProvider = 'native';

    if (openAiKey) {
      try {
        data = await callOpenAi(system, user, openAiKey);
        usedProvider = 'openai';
      } catch (e) {
        console.warn('[ABNT Assist] Falha OpenAI:', e);
      }
    }

    if (!data && geminiKey) {
      try {
        data = await callGemini(system, user, geminiKey);
        usedProvider = 'gemini';
      } catch (e) {
        console.warn('[ABNT Assist] Falha Gemini:', e);
      }
    }

    if (!data) {
      data = buildNativeAcademicFallback(body);
      usedProvider = 'native';
    }

    return NextResponse.json({
      success: true,
      usedProvider,
      data,
    });
  } catch (error: any) {
    console.error('[ABNT Assist] Erro:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro interno no Assistente ABNT.' },
      { status: 500 }
    );
  }
}
