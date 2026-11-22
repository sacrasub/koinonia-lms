import { NextRequest, NextResponse } from 'next/server';
import type { LessonAiRefinement, LessonDossierData } from '@/types/lessonDossier';

export const dynamic = 'force-dynamic';

interface LessonDossierAiRequestBody {
  dossier: LessonDossierData;
  provider?: 'auto' | 'gemini' | 'openai' | 'native';
  gemini_api_key?: string;
  openai_api_key?: string;
  openai_model?: string;
}

function buildLessonPrompt(dossier: LessonDossierData): string {
  const momentsText = dossier.linhaDoTempo
    .map(
      (m) =>
        `[${String(m.ordem).padStart(2, '0')}] (${m.categoria}${
          m.timestamp ? ` • ${m.timestamp}` : ''
        }) ${m.titulo}: ${m.detalhamento}`
    )
    .join('\n\n');

  const refsText = dossier.referenciasBiblicas
    .map((r) => `• ${r.referencia}: ${r.contexto}`)
    .join('\n');

  const examText = dossier.pontosDeProva
    .map((p) => `• ${p.titulo}: ${p.detalhe}`)
    .join('\n');

  return `Você é um professor de Teologia e pedagogo especialista em síntese acadêmica para seminário teológico.
Analise os registros reais e cronológicos da aula abaixo e produza um guia de aprofundamento didático, fiel ao que foi ministrado em sala, organizado para estudo eficiente.

DADOS DA AULA:
- Disciplina: ${dossier.disciplinaShortName} (${dossier.disciplinaCode})
- Aula: ${dossier.aulaNum} (Unidade ${dossier.unidade}) • Data: ${dossier.dateBr}
- Docente: ${dossier.professor}
- Tema: ${dossier.theme}
- Panorama Inicial: ${dossier.panorama.resumoCurado}
- Síntese Geral: ${dossier.panorama.sinteseGeral}

LINHA DO TEMPO CRONOLÓGICA DA AULA:
${momentsText}

REFERÊNCIAS BÍBLICAS CITADAS:
${refsText || 'Nenhuma listada explicitamente.'}

PONTOS DO GUIA DA PROVA (AV2):
${examText || 'Consultar síntese da disciplina.'}

REGRAS ESTRITAS:
1. Seja 100% fiel ao conteúdo ocorrido nesta aula; não invente autores ou eventos ausentes do registro.
2. Escreva em português acadêmico claro, direto e didático.
3. Organize de forma que o aluno entenda rapidamente o fio condutor lógico do início ao fim da aula.

Responda OBRIGATORIAMENTE em JSON válido exatamente com esta estrutura:
{
  "sinteseDidatica": "Texto corrido de 2 parágrafos articulando o que foi ensinado nesta aula, como o professor progrediu do problema inicial à conclusão bíblica.",
  "fioCondutor": ["Passo lógico 1 da aula...", "Passo lógico 2...", "Passo lógico 3...", "Passo lógico 4..."],
  "glossarioConceitos": [
    { "termo": "Conceito ou Técnica-chave 1", "definicao": "Explicação objetiva de acordo com a aula" }
  ],
  "dicasDeProva": ["O que observar para responder questões sobre esta aula..."],
  "aplicacaoMinisterial": "Síntese prática de como aplicar o conteúdo desta aula no ministério pastoral e na igreja local."
}`;
}

function sanitizeRefinementJson(
  raw: Record<string, unknown>,
  usedProvider: string,
  usedModel: string,
  fallback: LessonAiRefinement
): LessonAiRefinement {
  const sinteseDidatica =
    typeof raw.sinteseDidatica === 'string' && raw.sinteseDidatica.trim().length > 20
      ? raw.sinteseDidatica.trim()
      : fallback.sinteseDidatica;

  const fioCondutor = Array.isArray(raw.fioCondutor)
    ? raw.fioCondutor.map((x) => String(x).trim()).filter(Boolean).slice(0, 8)
    : fallback.fioCondutor;

  const glossarioConceitos = Array.isArray(raw.glossarioConceitos)
    ? raw.glossarioConceitos
        .filter((x): x is { termo?: unknown; definicao?: unknown } => Boolean(x) && typeof x === 'object')
        .map((x) => ({
          termo: String(x.termo || '').trim(),
          definicao: String(x.definicao || '').trim(),
        }))
        .filter((x) => x.termo && x.definicao)
        .slice(0, 8)
    : fallback.glossarioConceitos;

  const dicasDeProva = Array.isArray(raw.dicasDeProva)
    ? raw.dicasDeProva.map((x) => String(x).trim()).filter(Boolean).slice(0, 6)
    : fallback.dicasDeProva;

  const aplicacaoMinisterial =
    typeof raw.aplicacaoMinisterial === 'string' && raw.aplicacaoMinisterial.trim().length > 15
      ? raw.aplicacaoMinisterial.trim()
      : fallback.aplicacaoMinisterial;

  return {
    sinteseDidatica,
    fioCondutor: fioCondutor.length > 0 ? fioCondutor : fallback.fioCondutor,
    glossarioConceitos:
      glossarioConceitos.length > 0 ? glossarioConceitos : fallback.glossarioConceitos,
    dicasDeProva: dicasDeProva.length > 0 ? dicasDeProva : fallback.dicasDeProva,
    aplicacaoMinisterial,
    usedProvider,
    usedModel,
    generatedAt: new Date().toISOString(),
  };
}

function buildNativeRefinement(dossier: LessonDossierData): LessonAiRefinement {
  const moments = dossier.linhaDoTempo || [];
  const topMoments = moments.slice(0, 5);
  const opening = moments[0];
  const closing = moments[moments.length - 1];

  const sinteseParts: string[] = [];
  if (dossier.panorama.resumoCurado) {
    sinteseParts.push(dossier.panorama.resumoCurado);
  }
  if (dossier.panorama.sinteseGeral && dossier.panorama.sinteseGeral !== dossier.panorama.resumoCurado) {
    sinteseParts.push(dossier.panorama.sinteseGeral);
  }
  if (opening && closing && moments.length >= 2) {
    sinteseParts.push(
      `Na condução cronológica da aula (${dossier.professor}), o encontro partiu de "${opening.titulo}" e avançou ao longo de ${moments.length} blocos até culminar em "${closing.titulo}".`
    );
  }

  const fioCondutor = topMoments.map(
    (m) => `${String(m.ordem).padStart(2, '0')}. [${m.fase}] ${m.titulo} — ${m.resumoCurto}`
  );

  const glossarioConceitos = moments
    .filter((m) => m.categoria === 'Ensino Central' || m.categoria === 'Exegese Bíblica' || m.categoria === 'Aplicação Pastoral')
    .slice(0, 5)
    .map((m) => ({
      termo: m.titulo,
      definicao: m.pontosChave[0] || m.resumoCurto,
    }));

  const dicasDeProva = [
    ...(dossier.pontosDeProva || []).slice(0, 3).map((p) => `${p.titulo}: ${p.detalhe}`),
    ...(dossier.referenciasBiblicas.length > 0
      ? [
          `Textos bíblicos-chave cobrados ou analisados nesta aula: ${dossier.referenciasBiblicas
            .slice(0, 5)
            .map((r) => r.referencia)
            .join('; ')}.`,
        ]
      : []),
  ];

  const pastoralMoment =
    moments.find((m) => m.categoria === 'Aplicação Pastoral' || m.categoria === 'Estudo de Caso') ||
    closing;

  const aplicacaoMinisterial = pastoralMoment
    ? `${pastoralMoment.titulo}: ${pastoralMoment.detalhamento}`
    : `Aplicar os princípios bíblicos e teológicos de ${dossier.disciplinaShortName} no ensino fiel da Palavra e no cuidado pastoral da igreja local.`;

  return {
    sinteseDidatica: sinteseParts.join('\n\n'),
    fioCondutor: fioCondutor.length > 0 ? fioCondutor : [dossier.theme],
    glossarioConceitos:
      glossarioConceitos.length > 0
        ? glossarioConceitos
        : [{ termo: dossier.theme, definicao: dossier.panorama.sinteseGeral || dossier.panorama.resumoCurado }],
    dicasDeProva:
      dicasDeProva.length > 0
        ? dicasDeProva
        : [`Relacione os tópicos centrais da Aula ${dossier.aulaNum} ao guia de revisão da Unidade ${dossier.unidade}.`],
    aplicacaoMinisterial,
    usedProvider: 'native',
    usedModel: 'Organizador Teológico Estruturado',
    generatedAt: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LessonDossierAiRequestBody;
    const { dossier, provider = 'auto', gemini_api_key, openai_api_key, openai_model = 'gpt-4o-mini' } = body;

    if (!dossier || !dossier.disciplinaId || !dossier.aulaNum) {
      return NextResponse.json(
        { success: false, error: 'Dados da aula ausentes para organização por IA.' },
        { status: 400 }
      );
    }

    const fallback = buildNativeRefinement(dossier);

    if (provider === 'native') {
      return NextResponse.json({ success: true, data: fallback });
    }

    const activeOpenAiKey = openai_api_key?.trim() || process.env.OPENAI_API_KEY;
    const activeGeminiKey =
      gemini_api_key?.trim() ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    const prompt = buildLessonPrompt(dossier);

    // 1. Tenta Gemini primeiro (ou se selecionado) quando chave está disponível
    if ((provider === 'gemini' || provider === 'auto') && activeGeminiKey) {
      const candidateModels = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];
      for (const model of candidateModels) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeGeminiKey}`,
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
          if (res.ok) {
            const data = await res.json();
            const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (txt) {
              const parsed = JSON.parse(txt) as Record<string, unknown>;
              return NextResponse.json({
                success: true,
                data: sanitizeRefinementJson(parsed, 'gemini', model, fallback),
              });
            }
          }
        } catch (err) {
          console.warn(`[lesson-dossier] Falha Gemini (${model}):`, err);
        }
      }
    }

    // 2. Tenta OpenAI se selecionado ou no modo automático com chave OpenAI
    if ((provider === 'openai' || provider === 'auto') && activeOpenAiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeOpenAiKey}`,
          },
          body: JSON.stringify({
            model: openai_model || 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'Você é um assistente pedagógico teológico. Responda exclusivamente em JSON válido.',
              },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
            max_tokens: 2500,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const txt = data?.choices?.[0]?.message?.content;
          if (txt) {
            const parsed = JSON.parse(txt) as Record<string, unknown>;
            return NextResponse.json({
              success: true,
              data: sanitizeRefinementJson(parsed, 'openai', openai_model || 'gpt-4o-mini', fallback),
            });
          }
        }
      } catch (err) {
        console.warn('[lesson-dossier] Falha OpenAI:', err);
      }
    }

    // 3. Fallback nativo determinístico (nunca deixa o aluno sem resposta)
    return NextResponse.json({ success: true, data: fallback });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao organizar detalhamento da aula.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
