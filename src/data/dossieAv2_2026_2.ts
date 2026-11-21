/**
 * ============================================================================
 * KOINONIA LMS — DOSSIÊ OFICIAL SEMANA DA AV2 & TCC I (2026.2)
 * ============================================================================
 * Fonte estática (Zero-Waste Egress = 0 bytes no Supabase) consolidada a partir
 * das transcrições das aulas da Unidade 2 e materiais do NotebookLM Oficial.
 */

export const OFFICIAL_NOTEBOOKLM_URL =
  'https://notebook.google.com/notebook/562f2cd7-e3c7-4490-a224-3fb851078d96';

export interface AulaUnidade2Item {
  aulaNum: number;
  dataAprox: string;
  resumo: string;
  geminiUrl?: string;
}

export interface TopicoRevisaoItem {
  titulo: string;
  detalhe: string;
}

export interface SimuladoQuestao {
  id: string;
  enunciado: string;
  alternativas: { letra: 'A' | 'B' | 'C' | 'D'; texto: string }[];
  gabarito: 'A' | 'B' | 'C' | 'D';
  justificativa: string;
}

export interface LinkBaseAv2 {
  label: string;
  url: string;
  tipo: 'texto' | 'pdf' | 'drive' | 'meet' | 'email';
  destaque?: boolean;
}

export type DiaAv2Filtro = 'all' | 'ter-24' | 'qua-25' | 'qui-26' | 'sex-27' | 'tcc-04';

export interface DossieAv2Disciplina {
  disciplinaId: string;
  ordem: number;
  nome: string;
  nomeCurto: string;
  professor: string;
  diaGrupo: Exclude<DiaAv2Filtro, 'all'>;
  diaLabel: string;
  dataISO: string;
  dataExtenso: string;
  horarioBRT: string;
  horarioTabatinga: string;
  formatoCurto: string;
  formatoCompleto: string;
  peso: string;
  consulta: string;
  trabalhoExtra: string;
  canalEnvio: string;
  textosBase?: string;
  linksBase?: LinkBaseAv2[];
  alertaDestaque?: string;
  cor: {
    accent: string;
    bg: string;
    border: string;
    badge: string;
    text: string;
  };
  aulasUnidade2: AulaUnidade2Item[];
  guiaRevisao: TopicoRevisaoItem[];
  mapaMental: string;
  simulado: SimuladoQuestao[];
}

export const DOSSIE_AV2_2026_2: DossieAv2Disciplina[] = [
  {
    disciplinaId: 'disc-1',
    ordem: 1,
    nome: 'História do Congregacionalismo',
    nomeCurto: 'Hist. Congregacionalismo',
    professor: 'Profº Ary Júnior',
    diaGrupo: 'ter-24',
    diaLabel: 'Terça • 24/11',
    dataISO: '2026-11-24',
    dataExtenso: '24/11/2026 (Terça-feira)',
    horarioBRT: '19:00 – 20:25 (Brasília)',
    horarioTabatinga: '17:00 – 18:25 (Tabatinga)',
    formatoCurto: '10 V/F',
    formatoCompleto: 'Prova com 10 afirmações para julgamento em Verdadeiro (V) ou Falso (F).',
    peso: 'Peso 10,0: 2 primeiras questões de autodeclaração (participação/leitura = 2,0 pts) + 8 questões de conteúdo histórico/teológico (8,0 pts).',
    consulta: 'Prova individual SEM CONSULTA, realizada no horário de aula com câmeras abertas.',
    trabalhoExtra: 'Não há trabalho escrito complementar.',
    canalEnvio: 'Link oficial via Google Forms disponibilizado no início da aula.',
    textosBase:
      '3 textos enviados pelo professor no WhatsApp: (1) Síntese do Congregacionalismo Brasileiro; (2) Síntese dos 28 Artigos; (3) Análise analítica ampla dos 28 Artigos.',
    linksBase: [
      {
        label: '(1) Síntese do Congregacionalismo Brasileiro',
        url: 'https://aryqueirozjr.com.br/historia-identidade-congregacionalismo-brasileiro/',
        tipo: 'texto',
        destaque: true,
      },
      {
        label: '(2) Síntese dos 28 Artigos (Breve Exposição)',
        url: 'https://aryqueirozjr.com.br/vida-teologia-drkalley-parte-2/',
        tipo: 'texto',
        destaque: true,
      },
      {
        label: '(3) Análise Analítica Ampla: 150 Anos dos 28 Artigos',
        url: 'https://aryqueirozjr.com.br/150-anos-breve-exposicao-doutrinas-kalley/',
        tipo: 'texto',
        destaque: true,
      },
      {
        label: 'Complementar: Vida e Teologia do Dr. Kalley (Parte 1)',
        url: 'https://aryqueirozjr.com.br/vida-teologia-drkalley/',
        tipo: 'texto',
      },
      {
        label: 'PDF: Os 28 Artigos da Breve Exposição',
        url: 'https://drive.google.com/open?id=1waocn4PsQ79Rw6iCxuZmueVgPnN_kcG7&usp=drive_copy',
        tipo: 'pdf',
      },
      {
        label: 'Sala da Prova (Google Meet)',
        url: 'https://meet.google.com/sef-ggpp-bbn',
        tipo: 'meet',
      },
      {
        label: 'Pasta da Disciplina (Google Drive)',
        url: 'https://drive.google.com/open?id=19Y8Nv2Yvx1V-m4E5y5fUWOo5e8DZzeji&usp=drive_copy',
        tipo: 'drive',
      },
    ],
    alertaDestaque:
      '10 afirmações V/F: as 2 primeiras são autodeclaração de participação e leitura dos 3 textos obrigatórios (2,0 pts) + 8 de conteúdo (8,0 pts). Câmeras abertas e sem consulta.',
    cor: {
      accent: 'bg-sky-600',
      bg: 'bg-sky-500/10 dark:bg-sky-950/30',
      border: 'border-sky-300 dark:border-sky-800',
      badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200',
      text: 'text-sky-700 dark:text-sky-300',
    },
    aulasUnidade2: [
      {
        aulaNum: 9,
        dataAprox: '~06/10/2026',
        resumo:
          'Devolutiva e correção comentada da AV1; introdução à Unidade 2 sobre o Congregacionalismo no Brasil, conversão, formação médica e primeiras atividades de Robert Reid Kalley na Escócia.',
        geminiUrl:
          'https://docs.google.com/document/d/1SMYzyOHEFRtDWfNcnfN6u274xaRfiDtZQwxOMt2T49M/edit',
      },
      {
        aulaNum: 10,
        dataAprox: '~13/10/2026',
        resumo:
          'A missão pioneira do Dr. Kalley na Ilha da Madeira, o sucesso evangelístico, as perseguições civis e religiosas de 1843 a 1846 e a fuga dramática dos convertidos.',
        geminiUrl:
          'https://docs.google.com/document/d/19OA-kkDNv6T02-2KmJSZU1TwBUctCEJdI1RGNTZ2Hlw/edit',
      },
      {
        aulaNum: 11,
        dataAprox: '~20/10/2026',
        resumo:
          'Chegada de Robert e Sarah Kalley ao Brasil (1855), estabelecimento em Petrópolis e a organização da histórica Igreja Evangélica Fluminense (1858).',
        geminiUrl:
          'https://docs.google.com/document/d/1Uix9VsejGbtSt-P30Wk8g9tVQe84pQrXax22yh3Y4Mw/edit',
      },
      {
        aulaNum: 12,
        dataAprox: '~27/10/2026',
        resumo:
          'Expansão missionária caleiana no Nordeste com a fundação da Igreja Evangélica Pernambucana (1873) e convocação da congregação para formular uma declaração de fé (1874-1875).',
        geminiUrl:
          'https://docs.google.com/document/d/1Kc4aCpxigVaTgRncC_YysuKmjnO9N-c0DHySAFoGpY4/edit',
      },
      {
        aulaNum: 13,
        dataAprox: '~10/11/2026',
        resumo:
          'Análise exegética e histórica dos 28 Artigos de Fé da Breve Exposição: Artigos 1 a 10 cobrindo Bibliologia, Teologia Própria, Criação e Queda (Federalismo em Adão).',
        geminiUrl:
          'https://docs.google.com/document/d/1Ku9I4Y1jOTe0EV4qmL3_6B2LLjfKwjcBNwJneLx8cMw/edit',
      },
      {
        aulaNum: 14,
        dataAprox: '~17/11/2026',
        resumo:
          'Conclusão dos 28 Artigos (Cristologia, Soteriologia, ritos no Artigo 24 e escatologia) e organização denominacional: Help for Brazil, UEA e convenção de 1913 ("Igrejas Indenominacionais do Brasil").',
        geminiUrl:
          'https://docs.google.com/document/d/1gvg7E0kf0cakBge6lHp_cKToXM86S_utejmoQ0_0X9w/edit',
      },
    ],
    guiaRevisao: [
      {
        titulo: 'Dr. Robert Reid Kalley (1809–1888)',
        detalhe:
          'Médico escocês presbiteriano de nascimento que adotou a eclesiologia congregacional independente na prática missionária.',
      },
      {
        titulo: 'Sarah Poulton Wilson Kalley',
        detalhe:
          'Esposa de Kalley, vinda de família puritana congregacional inglesa; compositora de dezenas de Salmos e Hinos e incentivadora do modelo de governo local.',
      },
      {
        titulo: 'Igreja Evangélica Pernambucana (19/10/1873)',
        detalhe:
          'Fundada por Kalley em Recife, sendo a primeira igreja evangélica de brasileiros nativos no Nordeste.',
      },
      {
        titulo: 'A Gênese dos 28 Artigos (1874–1876)',
        detalhe:
          'Kalley convocou a congregação fluminense para que todos soubessem o que financiavam e criam. O texto inicial tinha 27 artigos sem o artigo 4º e sem versículos, adicionados depois em debate democrático em assembleia.',
      },
      {
        titulo: 'Artigo 13 vs. Artigo 14 (Refutação do Arminianismo)',
        detalhe:
          'O Artigo 13 trata da oferta universal e gratuita da salvação a todos, enquanto o Artigo 14 estabelece a expiação eficaz e a soberania da graça salvadora no coração dos eleitos.',
      },
      {
        titulo: 'Artigo 24 (Cessação dos Ritos e Refutação Dispensacionalista)',
        detalhe:
          'Afirma expressamente que os ritos judaicos mosaicos cessaram de forma definitiva com a vinda de Cristo, restando apenas dois ritos cristãos: Batismo e Ceia do Senhor (incompatível com retorno de sacrifícios milenares terrenos).',
      },
      {
        titulo: 'Help for Brazil e UEA',
        detalhe:
          'Sociedades missionárias britânicas que sustentaram o envio de novos obreiros ao Brasil após a partida dos Kalley.',
      },
      {
        titulo: '1913 e as "Igrejas Indenominacionais do Brasil"',
        detalhe:
          'Criação da denominação com 13 igrejas; evitou-se a palavra "Congregacional" para fugir da pecha de liberalismo teológico, unitarianismo e universalismo que contaminava igrejas irmãs da Inglaterra e dos EUA.',
      },
    ],
    mapaMental: `HISTÓRIA DO CONGREGACIONALISMO (BRASIL)
├── Pioneiros
│   ├── Dr. Robert Reid Kalley (Médico, Independente praticante)
│   └── Sarah Poulton Kalley (Tradição congregacional inglesa, Hinódia)
├── Marcos Fundacionais
│   ├── Igreja Evangélica Fluminense (1858, Rio de Janeiro)
│   └── Igreja Evangélica Pernambucana (19/10/1873, 1ª do Nordeste nativo)
├── A Breve Exposição das Doutrinas Fundamentais (1875-1876)
│   ├── Processo de Confecção (Aprovação democrática da membresia)
│   ├── Artigos 11-14: Soteriologia da Graça (Oferta livre + Graça Eficaz)
│   └── Artigo 24: Dois ritos cristãos perpétuos (Batismo e Ceia)
└── Estruturação Denominacional
    ├── Agências Missionárias (Help for Brazil / UEA)
    └── 1913: União das "Igrejas Indenominacionais do Brasil" (13 igrejas)`,
    simulado: [
      {
        id: 'sim-disc1-q1',
        enunciado:
          'Quanto à confecção original dos 28 Artigos de Fé elaborados pelo Dr. Robert Kalley para a Igreja Evangélica Fluminense, é correto afirmar:',
        alternativas: [
          {
            letra: 'A',
            texto:
              'Kalley redigiu o documento e o impôs clericalmente à membresia sem necessidade de consulta em assembleia.',
          },
          {
            letra: 'B',
            texto:
              'O texto original foi apresentado com 27 artigos, sem o atual artigo quarto e sem referências bíblicas, que foram incluídos após debate da congregação.',
          },
          {
            letra: 'C',
            texto:
              'O documento era uma reprodução literal e integral dos 39 Artigos da Igreja Anglicana.',
          },
          {
            letra: 'D',
            texto:
              'Os 28 Artigos foram elaborados com o objetivo explícito de fundar uma hierarquia diocesana nacional no Brasil.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'Em 1875, Kalley apresentou uma minuta preliminar de 27 artigos à congregação; o artigo 4º e as referências bíblicas foram adicionados posteriormente.',
      },
      {
        id: 'sim-disc1-q2',
        enunciado:
          'A organização da primeira denominação de igrejas caleianas no Brasil, ocorrida em 1913, adotou a nomenclatura oficial de "Igrejas Indenominacionais do Brasil" pelo seguinte motivo histórico:',
        alternativas: [
          {
            letra: 'A',
            texto: 'As igrejas pretendiam fundir-se com a Igreja Metodista Episcopal.',
          },
          {
            letra: 'B',
            texto:
              'Houve proibição constitucional republicana do uso do nome congregacional.',
          },
          {
            letra: 'C',
            texto:
              'Os pioneiros evitaram a palavra "congregacional" para afastar a pecha de teologia liberal, unitarismo e universalismo que maculava igrejas homônimas na Europa e nos EUA.',
          },
          {
            letra: 'D',
            texto:
              'As congregações rejeitavam a autonomia da igreja local e queriam um episcopado central.',
          },
        ],
        gabarito: 'C',
        justificativa:
          'O termo congregacional foi temporariamente evitado para não vincular a pureza da fé brasileira à contaminação liberal das igrejas congregacionais anglo-saxãs.',
      },
      {
        id: 'sim-disc1-q3',
        enunciado:
          'O Artigo 24 da Breve Exposição é fundamental na teologia de Kalley porque estabelece expressamente que:',
        alternativas: [
          {
            letra: 'A',
            texto:
              'Os ritos judaicos mosaicos cessaram definitivamente com a vinda de Cristo, permanecendo na igreja apenas o Batismo e a Ceia do Senhor.',
          },
          {
            letra: 'B',
            texto:
              'Os sacrifícios de sangue do Antigo Testamento devem ser restabelecidos em um milênio terreno literal.',
          },
          {
            letra: 'C',
            texto:
              'Existem sete sacramentos necessários à salvação na igreja visível.',
          },
          {
            letra: 'D',
            texto:
              'A ceia e o batismo foram ordenanças transitórias que cessaram na era apostólica.',
          },
        ],
        gabarito: 'A',
        justificativa:
          'O Artigo 24 afirma a cessação definitiva das sombras mosaicas e a fixação exclusiva de dois ritos cristãos.',
      },
      {
        id: 'sim-disc1-q4',
        enunciado:
          'Sobre a fundação da Igreja Evangélica Pernambucana, é correto afirmar:',
        alternativas: [
          {
            letra: 'A',
            texto:
              'Foi plantada por colonos escoceses exclusivamente para celebrações no idioma inglês.',
          },
          {
            letra: 'B',
            texto:
              'Foi organizada em 19 de outubro de 1873 pelo Dr. Kalley, sendo a primeira igreja evangélica de brasileiros nativos no Nordeste.',
          },
          {
            letra: 'C',
            texto:
              'Nasceu a partir de uma cisão com a Igreja Presbiteriana de Recife em 1913.',
          },
          {
            letra: 'D',
            texto:
              'Teve como primeiro pastor ordenado o missionário britânico Richard Holden.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'Em 19/10/1873, o Dr. Kalley organizou a comunidade recifense com irmãos nativos brasileiros.',
      },
      {
        id: 'sim-disc1-q5',
        enunciado:
          'Analisando a eclesiologia e o governo da igreja sob o ministério do Dr. Kalley no Brasil, o Profº Ary Júnior demonstra que:',
        alternativas: [
          {
            letra: 'A',
            texto:
              'Kalley permaneceu governando as igrejas sob o modelo presbiterial estrito com sínodos detentores de poder judicial sobre as congregações.',
          },
          {
            letra: 'B',
            texto:
              'Kalley adotou uma eclesiologia congregacional independente, com assembleias democráticas soberanas e autonomia plena de cada igreja local.',
          },
          {
            letra: 'C',
            texto:
              'Kalley estabeleceu bispos distritais nas províncias do Rio de Janeiro e Pernambuco.',
          },
          {
            letra: 'D',
            texto:
              'Kalley proibiu a participação de membros leigos em quaisquer decisões administrativas ou doutrinárias.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'O governo das igrejas caleianas era exercido pela congregação reunida democraticamente em assembleia autônoma.',
      },
    ],
  },
  {
    disciplinaId: 'disc-2',
    ordem: 2,
    nome: 'História do Pensamento Cristão II',
    nomeCurto: 'Pensamento Cristão II',
    professor: 'Profº Hilário Bispo',
    diaGrupo: 'ter-24',
    diaLabel: 'Terça • 24/11',
    dataISO: '2026-11-24',
    dataExtenso: '24/11/2026 (Terça-feira)',
    horarioBRT: '20:35 – 22:00 (Brasília)',
    horarioTabatinga: '18:35 – 20:00 (Tabatinga)',
    formatoCurto: '10 Questões Forms',
    formatoCompleto: 'Prova objetiva com 10 questões de múltipla escolha via Google Forms.',
    peso: 'Peso 10,0: 10 questões valendo 1,0 ponto cada = 10,0 pontos integrais (correção automática e nota imediata).',
    consulta: 'Prova individual SEM CONSULTA.',
    trabalhoExtra:
      'Não há trabalho na AV2 (o trabalho de pesquisa ABNT sobre o Iluminismo integrou a nota da AV1).',
    canalEnvio: 'Link liberado no chat do Google Meet durante o horário de aula.',
    linksBase: [
      {
        label: 'Sala da Prova (Google Meet — link no chat)',
        url: 'https://meet.google.com/cxj-yetd-xpf',
        tipo: 'meet',
        destaque: true,
      },
      {
        label: 'Pasta PWP Slides (Aulas 6 a 16)',
        url: 'https://drive.google.com/drive/folders/1nzJ_soSOyypR47_vlR3mHLNCh0YKUTEj',
        tipo: 'drive',
        destaque: true,
      },
      {
        label: 'Pasta da Disciplina (Google Drive)',
        url: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy',
        tipo: 'drive',
      },
    ],
    alertaDestaque:
      '10 questões objetivas no Google Forms às 20:35 (BRT), sem consulta, com correção e nota imediatas. Foco em Schleiermacher, Karl Barth, Barmen (1934), Kierkegaard e Bultmann.',
    cor: {
      accent: 'bg-purple-600',
      bg: 'bg-purple-500/10 dark:bg-purple-950/30',
      border: 'border-purple-300 dark:border-purple-800',
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200',
      text: 'text-purple-700 dark:text-purple-300',
    },
    aulasUnidade2: [
      {
        aulaNum: 9,
        dataAprox: '~06/10/2026',
        resumo:
          'O impacto do Iluminismo e o surgimento do Liberalismo Teológico; Friedrich Schleiermacher e o sentimento de absoluta dependência de Deus.',
        geminiUrl:
          'https://docs.google.com/document/d/1gwe3NgkR7EzAJ7F_GLIXwLP07oLO8KNgphP33PhfaMw/edit',
      },
      {
        aulaNum: 10,
        dataAprox: '~13/10/2026',
        resumo:
          'Os avivamentos do século XVIII (Jonathan Edwards e George Whitefield) como bastiões doutrinários e espirituais frente à secularização.',
        geminiUrl:
          'https://docs.google.com/document/d/11wqEdqKGnnjvKDiKhVIK3ALmeaMWUVwYuEhWa67IqKw/edit',
      },
      {
        aulaNum: 11,
        dataAprox: '~20/10/2026',
        resumo:
          'Karl Barth e o colapso do otimismo liberal na Primeira Guerra; a redescoberta da transcendência de Deus na Carta aos Romanos.',
        geminiUrl:
          'https://docs.google.com/document/d/1tI3jrEMgEaMS775bKmWJSp9-hznZUKVkVrFM4mJOI1U/edit',
      },
      {
        aulaNum: 12,
        dataAprox: '~03/11/2026',
        resumo:
          'O existencialismo cristão de Søren Kierkegaard contra a frieza estatal e o documento profético da Declaração Teológica de Barmen (1934) contra a nazificação da igreja.',
        geminiUrl:
          'https://docs.google.com/document/d/1I-JzKyFBGHu4c0DOEGHCjpoNKq-1pUydzAxnuieqlFI/edit',
      },
      {
        aulaNum: 13,
        dataAprox: '~10/11/2026',
        resumo:
          'Panorama comparativo dos séculos XIX e XX: ceticismo de Bultmann (desmitologização) versus a fidelidade das Confissões Reformadas e a inerrância bíblica.',
        geminiUrl:
          'https://docs.google.com/document/d/1_sz99xNWRRztk760jNlwOWv_N6twhRRpyM9q8tqBfeE/edit',
      },
      {
        aulaNum: 14,
        dataAprox: '~17/11/2026',
        resumo:
          'Revisão e síntese metodológica da AV2: como correlacionar autores, épocas históricas e a preservação da autoridade soberana das Escrituras.',
        geminiUrl:
          'https://docs.google.com/document/d/11LmcdzMLOqeE_kro08Q10rkWrhgEkpT6jRiqFT5OSZ4/edit',
      },
    ],
    guiaRevisao: [
      {
        titulo: 'Friedrich Schleiermacher (1768–1834)',
        detalhe:
          'O "pai da teologia liberal"; definiu a religião não como dogma ou moralidade, mas como a consciência/sentimento de absoluta dependência do Infinito (Gefühl).',
      },
      {
        titulo: 'Crítica Reformada a Schleiermacher',
        detalhe:
          'A experiência humana substituiu a revelação objetiva, tornando a teologia subjetiva e relativista.',
      },
      {
        titulo: 'Karl Barth (1886–1968)',
        detalhe:
          'Teólogo da Neo-ortodoxia / Teologia Dialética; rompeu com o liberalismo alemão ao constatar o apoio de seus professores ao militarismo imperial; recolocou a revelação de Deus e a cristologia no centro.',
      },
      {
        titulo: 'Declaração Teológica de Barmen (1934)',
        detalhe:
          'Redigida majoritariamente por Karl Barth pela Igreja Confessante alemã, rejeitando que o Estado nazista ou Hitler fossem fontes de revelação divina concorrentes a Jesus Cristo.',
      },
      {
        titulo: 'Søren Kierkegaard (1813–1855)',
        detalhe:
          'Crítico implacável da Igreja da Dinamarca; ensinou que a fé cristã exige angústia, decisão existencial e discipulado autêntico, e não mero pertencimento social.',
      },
      {
        titulo: 'Rudolf Bultmann (1884–1976)',
        detalhe:
          'Defensor do método da desmitologização, alegando que o homem moderno não pode crer no mundo mítico de milagres e na ressurreição física do Novo Testamento.',
      },
      {
        titulo: 'Efeitos Noéticos do Pecado',
        detalhe:
          'Ensino reformado de que a mente e a razão humana foram corrompidas pela Queda, necessitando da iluminação soberana do Espírito Santo para compreender a revelação.',
      },
    ],
    mapaMental: `HISTÓRIA DO PENSAMENTO CRISTÃO II (UNIDADE 2)
├── Liberalismo Teológico (Sécs. XVIII-XIX)
│   ├── Friedrich Schleiermacher (Religião = Sentimento de dependência)
│   └── Crítica: Deslocamento da Revelação Objetiva para a Subjetividade Humana
├── Contestadores e Defesa Reformada Confessional
│   ├── Charles Hodge e B. B. Warfield (Autoridade e Inerrância Bíblica)
│   └── J. Gresham Machen (Cristianismo vs. Liberalismo como religiões distintas)
├── A Reação do Século XX (Teologia Dialética)
│   ├── Karl Barth ("Deus é Deus no céu, o homem é homem na terra")
│   └── Declaração de Barmen (1934: Resistência contra a idolatria nazista)
└── Existencialismo Cristão e Desmitologização
    ├── Søren Kierkegaard (Decisão pessoal contra o conformismo da cristandade)
    └── Rudolf Bultmann (Crítica radical e desmitologização dos milagres)`,
    simulado: [
      {
        id: 'sim-disc2-q1',
        enunciado:
          'Na obra Discursos sobre a Religião (1799), Friedrich Schleiermacher buscou defender o cristianismo perante os céticos da modernidade definindo a essência da religião como:',
        alternativas: [
          {
            letra: 'A',
            texto: 'A aceitação cega e incondicional dos dogmas da Igreja Católica Romana.',
          },
          {
            letra: 'B',
            texto: 'A prática da caridade moral estritamente regida pelo imperativo categórico de Kant.',
          },
          {
            letra: 'C',
            texto: 'O sentimento ou consciência interior de dependência absoluta do Infinito.',
          },
          {
            letra: 'D',
            texto: 'A especulação metafísica baseada na física newtoniana.',
          },
        ],
        gabarito: 'C',
        justificativa:
          'Para Schleiermacher, a religião é a intuição e o sentimento imediato do universo, desvinculada de proposições doutrinárias formais.',
      },
      {
        id: 'sim-disc2-q2',
        enunciado:
          'A principal objeção da ortodoxia reformada confessional contra a proposta teológica de Schleiermacher consiste no fato de que:',
        alternativas: [
          { letra: 'A', texto: 'Ele defendeu a monarquia absoluta na Alemanha.' },
          {
            letra: 'B',
            texto:
              'Ele deslocou o fundamento da fé da revelação bíblica objetiva de Deus para a experiência subjetiva do indivíduo.',
          },
          {
            letra: 'C',
            texto: 'Ele negou a utilização da língua alemã nas liturgias dominicais.',
          },
          {
            letra: 'D',
            texto: 'Ele ensinou a necessidade de retorno às ordenanças do Antigo Testamento.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'Ao centrar a teologia na experiência religiosa humana, a revelação bíblica perde seu caráter de autoridade normativa sobre a consciência.',
      },
      {
        id: 'sim-disc2-q3',
        enunciado:
          'A Declaração Teológica de Barmen, redigida em 1934 no contexto da ascensão do totalitarismo na Alemanha, representou:',
        alternativas: [
          {
            letra: 'A',
            texto: 'A capitulação dos teólogos protestantes à política do Terceiro Reich.',
          },
          {
            letra: 'B',
            texto:
              'A proclamação exclusiva de Jesus Cristo como a única Palavra de Deus a ser obedecida, rejeitando a ideologia nazista como fonte de revelação eclesiástica.',
          },
          {
            letra: 'C',
            texto:
              'A fusão oficial da Igreja Luterana com o Partido Nacional-Socialista dos "Cristãos Alemães".',
          },
          {
            letra: 'D',
            texto: 'A proibição do ensino do Novo Testamento nos seminários germânicos.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'Barmen afirmou que Jesus Cristo é a única Palavra viva de Deus, proibindo o Estado de usurpar o senhorio sobre a igreja.',
      },
      {
        id: 'sim-disc2-q4',
        enunciado:
          'O teólogo do século XX que confrontou o otimismo antropocêntrico do liberalismo teológico ao reafirmar a absoluta transcendência e alteridade divina em seu comentário da Epístola aos Romanos foi:',
        alternativas: [
          { letra: 'A', texto: 'Rudolf Bultmann.' },
          { letra: 'B', texto: 'Albrecht Ritschl.' },
          { letra: 'C', texto: 'Karl Barth.' },
          { letra: 'D', texto: 'Adolf von Harnack.' },
        ],
        gabarito: 'C',
        justificativa:
          'Karl Barth foi a voz central da teologia dialética, recolocando a iniciativa e a soberania da revelação divina no centro.',
      },
      {
        id: 'sim-disc2-q5',
        enunciado:
          'Søren Kierkegaard destacou-se no pensamento cristão do século XIX por desenvolver uma vigorosa crítica ao cristianismo de seu tempo, afirmando que:',
        alternativas: [
          {
            letra: 'A',
            texto:
              'A fé genuína não se confunde com a cidadania confortável na cristandade estatal, mas exige compromisso pessoal, decisão existencial e cruz.',
          },
          {
            letra: 'B',
            texto: 'O cristianismo verdadeiro só é alcançado pela obediência mecânica aos ritos de Roma.',
          },
          {
            letra: 'C',
            texto:
              'A razão científica pura é perfeitamente suficiente para provar todos os dogmas do evangelho.',
          },
          {
            letra: 'D',
            texto:
              'Não há necessidade de conversão ou arrependimento pessoal para ser um discípulo de Cristo.',
          },
        ],
        gabarito: 'A',
        justificativa:
          'Kierkegaard denunciou a conformidade passiva da igreja dinamarquesa, enfatizando a necessidade de uma entrega existencial pessoal a Cristo.',
      },
    ],
  },
  {
    disciplinaId: 'disc-3',
    ordem: 3,
    nome: 'Aconselhamento Bíblico II',
    nomeCurto: 'Aconselhamento Bíblico II',
    professor: 'Profº Uilian Santos',
    diaGrupo: 'qua-25',
    diaLabel: 'Quarta • 25/11',
    dataISO: '2026-11-25',
    dataExtenso: '25/11/2026 (Quarta-feira)',
    horarioBRT: '19:00 – 20:25 (Brasília)',
    horarioTabatinga: '17:00 – 18:25 (Tabatinga)',
    formatoCurto: 'Forms (Slides)',
    formatoCompleto: 'Prova objetiva via Google Forms com correção e nota automáticas após o envio.',
    peso: 'Peso 10,0: Questões de múltipla escolha valendo 10,0 pontos integrais.',
    consulta: 'Prova individual baseada estritamente nos slides das aulas disponibilizados no Drive.',
    trabalhoExtra: 'Não há trabalho acadêmico escrito (método tradicional do professor).',
    canalEnvio: 'Link direto do Google Forms disponibilizado no início da aula.',
    linksBase: [
      {
        label: 'Sala da Prova (Google Meet)',
        url: 'https://meet.google.com/ifv-zsdd-gjx',
        tipo: 'meet',
        destaque: true,
      },
      {
        label: 'Slides: ACONSELHAMENTO II.pptx (18/11)',
        url: 'https://drive.google.com/file/d/1YsA-o51KHmFGMFQ0EYmM6GgniVq6kiGQ/view',
        tipo: 'pdf',
        destaque: true,
      },
      {
        label: 'Pasta da Disciplina (Google Drive)',
        url: 'https://drive.google.com/open?id=1BUr0R4pLQjTt01ID8XjYKIBlZhAtaWcx&usp=drive_copy',
        tipo: 'drive',
      },
    ],
    alertaDestaque:
      'Prova 100% restrita aos slides da Unidade 2 no Drive, sem trabalho escrito e com nota automática após o envio. Revise as 5 Áreas do Inventário, paralinguística e Esperança Bíblica.',
    cor: {
      accent: 'bg-amber-600',
      bg: 'bg-amber-500/10 dark:bg-amber-950/30',
      border: 'border-amber-300 dark:border-amber-800',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
      text: 'text-amber-700 dark:text-amber-300',
    },
    aulasUnidade2: [
      {
        aulaNum: 8,
        dataAprox: '~07/10/2026',
        resumo:
          'Devolutiva comentada da AV1; metodologia da coleta de dados através de perguntas abertas, escuta atenta e cuidados contra uma postura inquisitória.',
        geminiUrl:
          'https://docs.google.com/document/d/1ScuCYlpgK66clRDWEyX1UsYNgqt3RXlDz2hPp87XnGw/edit',
      },
      {
        aulaNum: 9,
        dataAprox: '~14/10/2026',
        resumo:
          'Conduta em demandas complexas de gabinete; estudo de caso sobre crises existenciais, integridade e o limite do gabinete pastoral.',
        geminiUrl:
          'https://docs.google.com/document/d/1zmR8MIsk7bOJbTz9V2ttu6l-MsWeQhLKXzmtLe63mXw/edit',
      },
      {
        aulaNum: 10,
        dataAprox: '~21/10/2026',
        resumo:
          'Fundamentação bíblica sobre sexualidade e casamento à luz de Romanos 1; a centralidade do Evangelho como única força de restauração espiritual.',
        geminiUrl:
          'https://docs.google.com/document/d/1pt7-izAE3LUG6ldEWG4Mwk9oklvlgRuCJkSQVW5ne40/edit',
      },
      {
        aulaNum: 11,
        dataAprox: '~28/10/2026',
        resumo:
          'O perigo das "falsas esperanças" no aconselhamento; crítica ao pensamento mágico devocional e a injeção da verdadeira esperança do Evangelho.',
        geminiUrl:
          'https://docs.google.com/document/d/15YRhOK7KEpH-YV0V-fkfTddxVymzA52PrZsvG_fvuis/edit',
      },
      {
        aulaNum: 12,
        dataAprox: '~04/11/2026',
        resumo:
          'Esperança bíblica versus passividade humana; refutação do erro de orar sem tomar atitudes práticas e a soberania de Deus.',
        geminiUrl:
          'https://docs.google.com/document/d/1Viw3fiPpgyLAFmed3ZHD475YZizI3Shbbhln4QrSViA/edit',
      },
      {
        aulaNum: 13,
        dataAprox: '~11/11/2026',
        resumo:
          'Esperança escatológica e o plano redentivo global (o "já e o ainda não"); estudos de caso em dilemas conjugais e disciplina restauradora.',
        geminiUrl:
          'https://docs.google.com/document/d/19JSpAgBBeapOIjkjVRL6Vy4sCes2tJt0SR9OaomudjE/edit',
      },
      {
        aulaNum: 14,
        dataAprox: '~18/11/2026',
        resumo:
          'As Escrituras Sagradas como clímax inegociável do aconselhamento (Salmo 130:5 e os discípulos de Emaús em Lc 24); encerramento do semestre.',
        geminiUrl:
          'https://docs.google.com/document/d/1QWa3tF0XwKnByxdtM_a80MZYL6KZD4VEGAe5xmlSGQo/edit',
      },
    ],
    guiaRevisao: [
      {
        titulo: 'As 5 Áreas do Inventário do Coração',
        detalhe:
          '(1) Físico: sono, alimentação, rotina, enfermidades e medicamentos; (2) Recursos: condição espiritual (crente verdadeiro?), rede familiar, capacidade intelectual e financeira; (3) Emoções: fúria, medo, tristeza ou ansiedade como sintomas de ídolos ocultos (Gn 4:5-6); (4) Ações: o que faz e o que omite; (5) Conceitos e Crenças: o que crê sobre Deus, pecado, graça e responsabilidade.',
      },
      {
        titulo: 'Comunicação Não Verbal e Paralinguística',
        detalhe:
          'Postura corporal, olhar, suspiros, hesitações e tom de voz que denunciam culpa, medo ou vergonha (ref. Adão e Eva escondendo-se em Gn 3:8).',
      },
      {
        titulo: 'O Erro do "Guru" e dos Versículos Despejados',
        detalhe:
          'O conselheiro bíblico não dá ordens mágicas nem joga versículos soltos como curativos superficiais; ele ouve pacientemente e faz perguntas diagnósticas que levam o aconselhado a enxergar o próprio coração.',
      },
      {
        titulo: 'Esperança Bíblica versus Falsa Esperança',
        detalhe:
          'A esperança cristã não é otimismo ingênuo ("vai dar tudo certo nesta vida terrena"), mas a ancoragem nas promessas firmes e eternas de Deus reveladas no Evangelho.',
      },
      {
        titulo: 'Aconselhamento e Discipulado',
        detalhe:
          'Quando a pessoa que procura ajuda não é convertida, o aconselhamento torna-se essencialmente uma oportunidade de evangelização e discipulado.',
      },
      {
        titulo: 'Suficiência das Escrituras (Salmo 130:5 e Lc 24:32)',
        detalhe:
          'Somente a Palavra de Deus iluminada pelo Espírito tem o poder de queimar o coração, derrubar ídolos e produzir santificação duradoura.',
      },
    ],
    mapaMental: `PRÁTICA DO ACONSELHAMENTO BÍBLICO II
├── Coleta de Dados (O Inventário do Coração)
│   ├── Físico (Sono, medicação, alimentação)
│   ├── Recursos (Fé autêntica, maturidade, apoio familiar)
│   ├── Emoções (Termômetro do coração / Ídolos ocultos - Gn 4)
│   ├── Ações (Práticas e omissões cotidianas)
│   └── Conceitos (Visão sobre Deus, pecado e perdão)
├── Postura do Conselheiro
│   ├── Escuta Ativa (Uma boa pergunta nasce de um bom ouvido)
│   ├── Rejeição do papel de "Guru" (Não assumir decisões alheias)
│   └── Observação Paralinguística (Linguagem corporal e tom de voz)
└── O Fundamento Terapêutico Bíblico
    ├── Falsa Esperança (Pensamento mágico / Oração passiva)
    ├── Esperança Cristã Real (Fincada no Reino de Deus e nas promessas)
    └── Centralidade das Escrituras (Salmo 130:5 / Discípulos de Emaús)`,
    simulado: [
      {
        id: 'sim-disc3-q1',
        enunciado:
          'Ao estruturar o inventário do coração para compreender a demanda de um aconselhado no gabinete, o conselheiro bíblico deve investigar as seguintes 5 áreas essenciais:',
        alternativas: [
          {
            letra: 'A',
            texto: 'Astrologia, temperamento ancestral, carma, hipnose e passado infantil.',
          },
          {
            letra: 'B',
            texto: 'Estado físico, recursos disponíveis, emoções, ações e conceitos/crenças.',
          },
          {
            letra: 'C',
            texto:
              'Rendimento bancário, orientação política, ficha criminal, clubes e preferências esportivas.',
          },
          {
            letra: 'D',
            texto: 'Apenas o histórico de oração e o pagamento de dízimos.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'O professor ensinou categoricamente que o inventário avalia Físico, Recursos, Emoções, Ações e Conceitos.',
      },
      {
        id: 'sim-disc3-q2',
        enunciado:
          'Na análise das emoções durante as sessões de aconselhamento (usando o exemplo bíblico de Caim em Gênesis 4:5-6), o professor Uilian enfatiza que as emoções devem ser tratadas como:',
        alternativas: [
          {
            letra: 'A',
            texto: 'Entidades espirituais malignas que precisam ser expulsas em todas as ocasiões.',
          },
          {
            letra: 'B',
            texto: 'Fatores irrelevantes que devem ser completamente ignorados pelo conselheiro.',
          },
          {
            letra: 'C',
            texto:
              'Indicadores e termômetros da alma que revelam os ídolos e motivações ocultas do coração humano.',
          },
          {
            letra: 'D',
            texto: 'Doenças puramente genéticas sem nenhuma relação com o pecado.',
          },
        ],
        gabarito: 'C',
        justificativa:
          'As emoções revelam o que governa e idolatra o coração da pessoa diante das circunstâncias.',
      },
      {
        id: 'sim-disc3-q3',
        enunciado:
          'Um dos erros mais comuns e perigosos do conselheiro inexperiente, criticado nas aulas práticas de gabinete, é:',
        alternativas: [
          {
            letra: 'A',
            texto: 'Ouvir pacientemente a dor do irmão antes de formular intervenções.',
          },
          {
            letra: 'B',
            texto:
              'Assumir uma postura de "guru", buscando respostas imediatas e jogando versículos bíblicos soltos sem compreender o contexto real da pessoa.',
          },
          {
            letra: 'C',
            texto:
              'Reconhecer suas próprias limitações e dizer humildemente "eu não sei a resposta para essa tragédia".',
          },
          {
            letra: 'D',
            texto:
              'Encaminhar o aconselhado ao médico caso haja evidências de patologias clínicas graves.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'O conselheiro não deve agir como guru nem usar versículos descontextualizados como fórmula mágica imediata.',
      },
      {
        id: 'sim-disc3-q4',
        enunciado:
          'Sobre a transmissão de esperança no processo de aconselhamento bíblico, o professor Uilian adverte que a "falsa esperança" caracteriza-se por:',
        alternativas: [
          {
            letra: 'A',
            texto:
              'Prometer alívio mundano garantido, curas imediatas ou alimentar ilusões que desviam a pessoa do enfrentamento bíblico da realidade.',
          },
          {
            letra: 'B',
            texto:
              'Lembrar o aconselhado de que Deus faz cooperar todas as coisas para o bem dos que o amam.',
          },
          {
            letra: 'C',
            texto: 'Fundamentar a transformação na santificação progressiva operada pelo Espírito Santo.',
          },
          {
            letra: 'D',
            texto: 'Ensinar a soberania e a misericórdia de Deus reveladas na cruz de Cristo.',
          },
        ],
        gabarito: 'A',
        justificativa:
          'A falsa esperança apoia-se em pensamento mágico, ilusões temporais e promessas que a Palavra de Deus não faz.',
      },
      {
        id: 'sim-disc3-q5',
        enunciado:
          'Conforme a exposição do Salmo 130:5 e da narrativa dos discípulos no caminho de Emaús (Lucas 24:32), o clímax e o verdadeiro poder de transformação no aconselhamento repousam:',
        alternativas: [
          { letra: 'A', texto: 'Na eloqüência técnica e na sabedoria humana do conselheiro.' },
          { letra: 'B', texto: 'No confinamento do indivíduo a técnicas de regressão hipnótica.' },
          {
            letra: 'C',
            texto:
              'Na centralidade e no estudo diligente das Sagradas Escrituras, pois somente elas fazem queimar o coração e restauram a mente.',
          },
          { letra: 'D', texto: 'Na aprovação social dos membros da comunidade religiosa.' },
        ],
        gabarito: 'C',
        justificativa:
          'Sem as Escrituras como padrão normativo de fé, o aconselhamento torna-se mero esforço secular ineficaz ("enxugar gelo").',
      },
    ],
  },
  {
    disciplinaId: 'disc-4',
    ordem: 4,
    nome: 'Direitos Humanos',
    nomeCurto: 'Direitos Humanos',
    professor: 'Profº Cleiton Barbirato',
    diaGrupo: 'qua-25',
    diaLabel: 'Quarta • 25/11',
    dataISO: '2026-11-25',
    dataExtenso: '25/11/2026 (Quarta-feira)',
    horarioBRT: '19:00 – 23:59 (Janela do Link • Brasília)',
    horarioTabatinga: '17:00 – 21:59 (Tabatinga)',
    formatoCurto: '10 Questões (Peso 10)',
    formatoCompleto: 'Prova objetiva com 10 questões de múltipla escolha via Google Forms.',
    peso: 'Peso 10,0: A prova vale os 10,0 pontos integrais.',
    consulta: 'Prova individual SEM CONSULTA.',
    trabalhoExtra:
      'NÃO haverá trabalho escrito complementar na AV2! O professor cancelou o trabalho de 2 pontos da segunda etapa, concentrando toda a nota na prova objetiva.',
    canalEnvio: 'Link direto do Google Forms disponibilizado no horário oficial (janela 19:00 às 23:59 BRT).',
    textosBase:
      '100% extraída do arquivo consolidado de 52 slides pós-AV1 disponibilizado na pasta do Drive.',
    linksBase: [
      {
        label: 'Aula 07 — Slides Pós-AV1 (PDF)',
        url: 'https://drive.google.com/file/d/1wNWgudlsB0Xg5acI7qxll0h9-rfpSXAS/view',
        tipo: 'pdf',
        destaque: true,
      },
      {
        label: 'Aula 08 — Slides Pós-AV1 (PDF)',
        url: 'https://drive.google.com/file/d/1asyRutF_5tCDZqHnExfrF8l1JIiC4xcx/view',
        tipo: 'pdf',
        destaque: true,
      },
      {
        label: 'Aula 09 — Slides Pós-AV1 (PDF)',
        url: 'https://drive.google.com/file/d/1wbcEUivsqWPDsnY4DKOmxIXSEX-fiq6e/view',
        tipo: 'pdf',
        destaque: true,
      },
      {
        label: 'Sala Google Meet',
        url: 'https://meet.google.com/uva-zmav-rds',
        tipo: 'meet',
      },
      {
        label: 'Pasta da Disciplina (Google Drive)',
        url: 'https://drive.google.com/open?id=1fPSmFUBNzrzK--n3NDKOdMR5HWk25AV7&usp=drive_copy',
        tipo: 'drive',
      },
    ],
    alertaDestaque:
      'ATENÇÃO MÁXIMA: O trabalho escrito complementar (peso 2) da AV2 foi CANCELADO! A prova objetiva no Forms vale os 10,0 pontos integrais (janela 19h–23:59 BRT), 100% baseada no arquivo de 52 slides pós-AV1.',
    cor: {
      accent: 'bg-rose-600',
      bg: 'bg-rose-500/10 dark:bg-rose-950/30',
      border: 'border-rose-300 dark:border-rose-800',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
      text: 'text-rose-700 dark:text-rose-300',
    },
    aulasUnidade2: [
      {
        aulaNum: 8,
        dataAprox: '~07/10/2026',
        resumo:
          'Devolutiva comentada da AV1; introdução à sistemática de proteção dos direitos fundamentais no Brasil pela Constituição Federal de 1988.',
        geminiUrl:
          'https://docs.google.com/document/d/1-ddZB6qd2ajhKqEOHaqQG-sUqamoq_Ba8HTRdvR0orc/edit',
      },
      {
        aulaNum: 9,
        dataAprox: '~14/10/2026',
        resumo:
          'A estrutura da ONU, a Carta de 1945 e a composição do Conselho de Segurança (15 membros, com 5 membros permanentes e poder de veto).',
        geminiUrl:
          'https://docs.google.com/document/d/1CjT12m6_gcTll_LqF7j6MPXpFjRP4AjWPzu-En4R0Xc/edit',
      },
      {
        aulaNum: 10,
        dataAprox: '~21/10/2026',
        resumo:
          'Direitos Humanos em espécie: o Direito à Vida em suas dimensões vertical e horizontal e a tutela jurídica do nascituro.',
        geminiUrl:
          'https://docs.google.com/document/d/12xr5g31EYSxe3RrlqlaVKlEwZp8aT2kHDhCGfciDMtM/edit',
      },
      {
        aulaNum: 11,
        dataAprox: '~28/10/2026',
        resumo:
          'Inviolabilidade da vida e dignidade humana perante os dilemas biomédicos da eutanásia, distanásia e cuidados paliativos.',
        geminiUrl:
          'https://docs.google.com/document/d/1BteQvptuhZnjGaBG2DtSyjKXLcIrEM16gHhGg3cx7oY/edit',
      },
      {
        aulaNum: 12,
        dataAprox: '~04/11/2026',
        resumo:
          'O Direito à Igualdade (Art. 5º da CF/88); diferenciação dogmática entre igualdade formal e material (equidade); o dever de acessibilidade eclesiástica.',
        geminiUrl:
          'https://docs.google.com/document/d/1YaYYHMlUoUAXW7OZ2Nk7qkXZGGwKhuIhwoMb3cszZWU/edit',
      },
      {
        aulaNum: 13,
        dataAprox: '~11/11/2026',
        resumo:
          'Integridade física e psíquica; vedação absoluta à tortura; direitos da personalidade (honra objetiva/subjetiva, imagem e privacidade) e laicidade estatal.',
        geminiUrl:
          'https://docs.google.com/document/d/1mMxMeEvCuWSJTr2H3D_uD2nBQokcFedsPZ7CeJlqmvI/edit',
      },
      {
        aulaNum: 14,
        dataAprox: '~18/11/2026',
        resumo:
          'Síntese final dos 52 slides consolidados; esclarecimento das regras da AV2 (peso 10 integral na prova) e encerramento do semestre.',
        geminiUrl:
          'https://docs.google.com/document/d/1MxeIKhKmGCvPiy-XN9zNGMyIdnYiPlFi1RCHUQMbpKc/edit',
      },
    ],
    guiaRevisao: [
      {
        titulo: 'Artigo 5º da Constituição Federal de 1988',
        detalhe:
          'Garante a brasileiros e estrangeiros residentes a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade (Cláusula Pétrea imutável por emenda).',
      },
      {
        titulo: 'Igualdade Formal vs. Equidade (Material)',
        detalhe:
          'A igualdade formal trata todos de maneira idêntica na lei; a equidade trata desigualmente os desiguais na medida de suas desigualdades para proporcionar justiça real (ex.: caixotes para assistir ao jogo).',
      },
      {
        titulo: 'Discriminação Positiva / Ações Afirmativas',
        detalhe:
          'Políticas públicas legítimas que favorecem grupos vulneráveis historicamente desfavorecidos (ex.: Lei Maria da Penha, cotas, atendimento prioritário a idosos e pessoas com deficiência).',
      },
      {
        titulo: 'Estrutura da ONU e Conselho de Segurança',
        detalhe:
          'Composto por 15 membros: 5 permanentes com direito de veto (EUA, Rússia, China, França e Reino Unido) e 10 membros rotativos eleitos por 2 anos.',
      },
      {
        titulo: 'Incorporação de Tratados Internacionais (Art. 5º, § 3º da CF/88)',
        detalhe:
          'Tratados sobre direitos humanos aprovados em cada Casa do Congresso Nacional, em dois turnos, por três quintos dos votos, equivalem a Emendas Constitucionais no ápice da Pirâmide de Kelsen.',
      },
      {
        titulo: 'Dimensão Vertical vs. Horizontal',
        detalhe:
          'Vertical: o indivíduo buscando proteção contra os arbítrios e o poder punitivo do Estado (jus puniendi). Horizontal: aplicação dos direitos fundamentais nas relações entre particulares e instituições privadas.',
      },
      {
        titulo: 'Direito à Honra, Imagem e Privacidade',
        detalhe:
          'Direitos da personalidade invioláveis; a honra subjetiva relaciona-se à autoestima íntima, enquanto a honra objetiva refere-se à reputação social perante a comunidade.',
      },
    ],
    mapaMental: `DIREITOS HUMANOS (AV2 - PROFº CLEITON)
├── Fundamentos Constitucionais Brasileiros (CF/88)
│   ├── Artigo 5º (Direitos e Garantias Fundamentais - Cláusula Pétrea)
│   └── Pirâmide de Kelsen & Tratados (§ 3º do Art. 5º = Peso de Emenda)
├── O Princípio da Igualdade
│   ├── Igualdade Formal (Todos iguais perante o texto da lei)
│   └── Equidade / Isonomia Material (Discriminação positiva / Inclusão)
├── Sistema Internacional (ONU)
│   ├── Carta de 1945 & DUDH de 1948 (Dignidade Universal)
│   └── Conselho de Segurança (15 países / 5 permanentes com veto)
└── Direitos Humanos em Espécie
    ├── Direito à Vida (Dimensões Vertical e Horizontal / Tutela do Nascituro)
    ├── Integridade Física e Psíquica (Vedação absoluta à tortura)
    └── Personalidade (Honra subjetiva/objetiva, Imagem e Privacidade)`,
    simulado: [
      {
        id: 'sim-disc4-q1',
        enunciado:
          'Conforme estabelecido no artigo 5º, § 3º da Constituição Federal de 1988, os tratados e convenções internacionais sobre direitos humanos que forem aprovados em cada Casa do Congresso Nacional, em dois turnos, por três quintos dos votos dos respectivos membros, serão equivalentes a:',
        alternativas: [
          { letra: 'A', texto: 'Leis ordinárias federais.' },
          { letra: 'B', texto: 'Medidas provisórias presidenciais.' },
          { letra: 'C', texto: 'Emendas constitucionais.' },
          { letra: 'D', texto: 'Decretos regulamentares municipais.' },
        ],
        gabarito: 'C',
        justificativa:
          'Essa regra de votação qualificada eleva os tratados de direitos humanos ao nível constitucional no topo da pirâmide jurídica brasileira.',
      },
      {
        id: 'sim-disc4-q2',
        enunciado:
          'Na lição do Profº Cleiton Barbirato sobre o Direito à Igualdade, a aplicação do princípio da equidade (ou isonomia material) fundamenta-se na seguinte premissa jurídica:',
        alternativas: [
          {
            letra: 'A',
            texto:
              'Todas as pessoas devem receber exatamente os mesmos recursos e tratamentos, independentemente de suas condições físicas, econômicas ou sociais.',
          },
          {
            letra: 'B',
            texto:
              'O Estado deve tratar desigualmente as pessoas desiguais, na exata medida de suas desigualdades, para garantir oportunidades e acessos reais e justos.',
          },
          {
            letra: 'C',
            texto:
              'As minorias vulneráveis possuem direitos absolutos e irrestritos para descumprir as normas gerais de trânsito e tributação.',
          },
          {
            letra: 'D',
            texto:
              'A igualdade perante a lei impede a concessão de gratuidade ou preferência a idosos e pessoas com deficiência.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'A equidade corrige as assimetrias fáticas do ponto de partida individual para produzir justiça material real.',
      },
      {
        id: 'sim-disc4-q3',
        enunciado:
          'O Conselho de Segurança da Organização das Nações Unidas (ONU), responsável primordial pela manutenção da paz e da segurança internacional, possui a seguinte composição institucional:',
        alternativas: [
          {
            letra: 'A',
            texto: '50 países membros com mandatos vitalícios e votos estritamente igualitários.',
          },
          {
            letra: 'B',
            texto:
              '15 membros no total, sendo 5 membros permanentes detentores de poder de veto e 10 membros não permanentes eleitos periodicamente.',
          },
          {
            letra: 'C',
            texto: 'Apenas países do continente europeu e da América do Norte.',
          },
          {
            letra: 'D',
            texto: '1 membro de cada denominação religiosa cristã global.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'O Conselho é integrado por 15 nações, das quais 5 são permanentes (EUA, Rússia, China, Reino Unido e França) com poder de veto unilateral.',
      },
      {
        id: 'sim-disc4-q4',
        enunciado:
          'Quando um cidadão aciona o Poder Judiciário para impedir que agentes policiais do Estado invadam seu domicílio sem mandado judicial ou praticem tortura, está exercendo a proteção dos direitos fundamentais em sua dimensão:',
        alternativas: [
          { letra: 'A', texto: 'Horizontal.' },
          { letra: 'B', texto: 'Vertical.' },
          { letra: 'C', texto: 'Consuetudinária.' },
          { letra: 'D', texto: 'Eclesiástica.' },
        ],
        gabarito: 'B',
        justificativa:
          'A dimensão vertical regula a contenção do poder do Estado frente aos direitos e liberdades do cidadão.',
      },
      {
        id: 'sim-disc4-q5',
        enunciado:
          'Sobre os direitos da personalidade estudados na disciplina, a distinção clássica entre a honra subjetiva e a honra objetiva reside no fato de que:',
        alternativas: [
          {
            letra: 'A',
            texto:
              'A honra subjetiva diz respeito ao sentimento íntimo de dignidade e autoestima do indivíduo, enquanto a honra objetiva refere-se à reputação e à consideração social perante terceiros.',
          },
          {
            letra: 'B',
            texto:
              'A honra subjetiva só pertence a governantes civis, enquanto a objetiva pertence ao cidadão comum.',
          },
          {
            letra: 'C',
            texto:
              'A honra objetiva pode ser violada sem que haja qualquer dano moral indenizável.',
          },
          {
            letra: 'D',
            texto:
              'O direito brasileiro não tutela a privacidade de pastores ou ministros religiosos.',
          },
        ],
        gabarito: 'A',
        justificativa:
          'A honra subjetiva é o juízo íntimo de si próprio, e a honra objetiva é o juízo e respeito da sociedade pela pessoa.',
      },
    ],
  },
  {
    disciplinaId: 'disc-5',
    ordem: 5,
    nome: 'Ética Cristã',
    nomeCurto: 'Ética Cristã',
    professor: 'Profª Karoline Evangelista',
    diaGrupo: 'qui-26',
    diaLabel: 'Quinta • 26/11',
    dataISO: '2026-11-26',
    dataExtenso: '26/11/2026 (Quinta-feira)',
    horarioBRT: '19:00 – 20:25 (Brasília)',
    horarioTabatinga: '17:00 – 18:25 (Tabatinga)',
    formatoCurto: 'Sem Prova Escrita',
    formatoCompleto: 'NÃO HAVERÁ PROVA ESCRITA NA AV2 — Aula de encerramento e conferência de notas.',
    peso: 'Peso 10,0: Avaliação semestral 100% integralizada e unificada nos Seminários dos Dez Mandamentos (22/10 a 19/11/2026, notas individuais de oratória, domínio do tema e slides).',
    consulta: 'Não aplicável (sem prova escrita na AV2).',
    trabalhoExtra: 'Seminários já apresentados entre 22/10 e 19/11/2026. Em 26/11: devolutiva final e conferência de notas.',
    canalEnvio: 'Encontro ao vivo no Google Meet (19:00 BRT) para devolutiva e conferência de notas.',
    linksBase: [
      {
        label: 'Sala da Devolutiva ao Vivo (Google Meet — 19:00 BRT)',
        url: 'https://meet.google.com/ypd-yzwg-nrw',
        tipo: 'meet',
        destaque: true,
      },
      {
        label: 'Pasta da Disciplina (Google Drive)',
        url: 'https://drive.google.com/open?id=1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC&usp=drive_copy',
        tipo: 'drive',
      },
    ],
    alertaDestaque:
      'NÃO haverá prova escrita na AV2! A nota semestral foi 100% integralizada nos Seminários dos Dez Mandamentos. O encontro de 26/11 (19:00 BRT) será para encerramento, devolutiva e conferência de notas.',
    cor: {
      accent: 'bg-yellow-500',
      bg: 'bg-yellow-500/10 dark:bg-yellow-950/30',
      border: 'border-yellow-400 dark:border-yellow-800',
      badge: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/60 dark:text-yellow-200',
      text: 'text-yellow-700 dark:text-yellow-300',
    },
    aulasUnidade2: [
      {
        aulaNum: 9,
        dataAprox: '~08/10/2026',
        resumo:
          'Alinhamento metodológico e divisão final dos grupos para os Seminários sobre o Decálogo com base no Catecismo Maior de Westminster.',
        geminiUrl:
          'https://docs.google.com/document/d/1w2xGUl8Ru7sSkltPpWN34rnPLkSCF-prX-1WO8XUXDI/edit',
      },
      {
        aulaNum: 10,
        dataAprox: '~22/10/2026',
        resumo:
          '1ª Rodada dos Seminários: O 1º e o 2º Mandamentos (o culto exclusivo a Deus versus idolatria de imagens e ritos pagãos).',
        geminiUrl:
          'https://docs.google.com/document/d/1Z1Tf7d25ZP6oaP4cM6Oy99Iz-uGu8uKLElKrgP8X8QE/edit',
      },
      {
        aulaNum: 11,
        dataAprox: '~29/10/2026',
        resumo:
          '2ª Rodada dos Seminários: O 3º e o 4º Mandamentos (a reverência ao Nome santo de Deus e a teologia do descanso no Dia do Senhor).',
        geminiUrl:
          'https://docs.google.com/document/d/1fNjlqWCj4F5N4PB_v03Q3-szv66roDyhy_nVRchv2uo/edit',
      },
      {
        aulaNum: 12,
        dataAprox: '~05/11/2026',
        resumo:
          '3ª Rodada dos Seminários: O 5º e o 6º Mandamentos (a honra a pais e autoridades civis e a santidade inegociável da vida humana contra o homicídio).',
        geminiUrl:
          'https://docs.google.com/document/d/1wYqtYlp27mvSlmeRK8dx2zWI0D7QFkKQJcmtP8pKN9c/edit',
      },
      {
        aulaNum: 13,
        dataAprox: '~12/11/2026',
        resumo:
          '4ª Rodada dos Seminários: O 7º e o 8º Mandamentos (a pureza matrimonial/fidelidade e a integridade da propriedade alheia contra o furto).',
        geminiUrl:
          'https://docs.google.com/document/d/1ZyK4GLfnI6nWyPRcJRbI2va4mclULoJJK6K3AtXcat4/edit',
      },
      {
        aulaNum: 14,
        dataAprox: '~19/11/2026',
        resumo:
          '5ª Rodada dos Seminários: O 9º e o 10º Mandamentos (o testemunho veraz na sociedade e o combate à cobiça interior); fechamento das avaliações práticas.',
        geminiUrl:
          'https://docs.google.com/document/d/1n45zbNB16cgYba0VB3IvoeTI_PESNZbq0bvlNOsComQ/edit',
      },
    ],
    guiaRevisao: [
      {
        titulo: 'Catecismo Maior de Westminster (Q. 91 a 150)',
        detalhe:
          'O manual confessional definitivo utilizado na disciplina para interpretar a extensão moral dos Dez Mandamentos.',
      },
      {
        titulo: 'Regras Hermenêuticas do Decálogo (Q. 99 do CMW)',
        detalhe:
          'A lei de Deus é perfeita e obriga o homem integral (corpo, mente, afetos e atos). Onde um pecado é proibido, o dever oposto é mandado; onde um dever é mandado, o pecado oposto é proibido. O que é mandado/proibido a nós devemos promover/evitar nos outros.',
      },
      {
        titulo: 'Norman Geisler e as 6 Matrizes Éticas',
        detalhe:
          'Antinomismo (sem normas), Generalismo (normas sem universalidade), Situacionismo (só o amor importa), Absolutismo Não Qualificado (sem conflitos reais), Absolutismo Conflitante (mal menor + perdão) e Absolutismo Graduado (dever moral superior sem culpa).',
      },
      {
        titulo: 'Absolutismo Graduado na Prática',
        detalhe:
          'Diante de conflitos inevitáveis em um mundo caído, Deus estabeleceu uma hierarquia de mandamentos morais (misericórdia e vida superam a mentira circunstancial, como nas parteiras hebreias em Êxodo 1 e Raabe em Josué 2).',
      },
      {
        titulo: 'Bioética da Vida Humana (6º Mandamento)',
        detalhe:
          'O feto é pessoa humana completa dotada de Imago Dei desde a concepção (Sl 139:13-16; Jr 1:5); o aborto é repudiado como violação direta do sexto mandamento.',
      },
      {
        titulo: 'Bioética do Fim da Vida',
        detalhe:
          'Rejeição da eutanásia ativa e do suicídio assistido; aceitação da ortotanásia e dos cuidados paliativos para alívio da dor sem obstinação terapêutica (distanásia).',
      },
      {
        titulo: 'Pena Capital e Guerra Justa',
        detalhe:
          'Fundamentadas em Romanos 13:4 e Gênesis 9:6 como espada legítima conferida exclusivamente ao Estado para refrear o mal e punir o crime gravoso.',
      },
    ],
    mapaMental: `ÉTICA CRISTÃ & DECÁLOGO (PROFª KAROLINE)
├── Sistemas Éticos (Norman Geisler)
│   ├── Modelos Relativistas (Antinomismo, Situacionismo, Utilitarismo)
│   └── Absolutismo Graduado (Hierarquia bíblica de deveres morais: o bem maior)
├── Hermenêutica do Decálogo (Catecismo Maior de Westminster)
│   ├── Lei Espiritual (Julga pensamentos, motivos e ações)
│   └── Princípio da Correlação (Proibição de pecado = Mandato do dever oposto)
└── Aplicações Bioéticas e Sociais
    ├── Início da Vida (Santidade desde a fecundação / Imago Dei)
    ├── Fim da Vida (Cuidados paliativos vs. Eutanásia e Distanásia)
    └── Ética Política (Submissão à autoridade civil até o limite da desobediência a Deus)`,
    simulado: [
      {
        id: 'sim-disc5-q1',
        enunciado:
          'Conforme as regras estabelecidas pelo Catecismo Maior de Westminster (Pergunta 99) para a correta compreensão da lei moral nos Dez Mandamentos:',
        alternativas: [
          {
            letra: 'A',
            texto: 'Cada mandamento aplica-se exclusivamente a atos corporais exteriores observáveis.',
          },
          {
            letra: 'B',
            texto:
              'Onde um dever é expressamente ordenado por Deus, o pecado oposto é proibido; e onde um pecado é proibido, o dever oposto é ordenado.',
          },
          {
            letra: 'C',
            texto: 'A lei moral do Decálogo foi abolida e substituída pelo amor subjetivo na Nova Aliança.',
          },
          {
            letra: 'D',
            texto: 'As proibições divinas vinculam apenas os líderes eclesiásticos ordenados.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'O princípio da correlação determina que proibir um erro implica ordenar a virtude oposta, e vice-versa.',
      },
      {
        id: 'sim-disc5-q2',
        enunciado:
          'Na abordagem do Absolutismo Graduado de Norman Geisler, adotada pela disciplina como matriz do absolutismo cristão, quando duas leis morais entram em conflito inevitável em um mundo corrompido pela queda:',
        alternativas: [
          {
            letra: 'A',
            texto: 'O cristão é livre para quebrar qualquer um dos mandamentos sem nenhum peso de consciência.',
          },
          {
            letra: 'B',
            texto: 'O crente deve pecar deliberadamente escolhendo o mal menor e depois solicitar o perdão de Cristo.',
          },
          {
            letra: 'C',
            texto:
              'O crente tem a obrigação moral de obedecer ao mandamento de maior hierarquia diante de Deus (o bem maior), ficando isento de culpa moral diante do Senhor.',
          },
          {
            letra: 'D',
            texto: 'O cristão deve cometer suicídio para não desobedecer a nenhuma norma bíblica.',
          },
        ],
        gabarito: 'C',
        justificativa:
          'O absolutismo graduado sustenta que existem deveres morais superiores (ex.: preservar a vida de inocentes em detrimento de dizer a verdade a assassinos).',
      },
      {
        id: 'sim-disc5-q3',
        enunciado:
          'No estudo bioético sobre o sexto mandamento ("Não matarás"), a fé cristã confessional rejeita terminantemente o aborto porque:',
        alternativas: [
          {
            letra: 'A',
            texto: 'A vida humana é uma concessão do Estado que se inicia apenas no momento da maioridade civil.',
          },
          {
            letra: 'B',
            texto:
              'A Bíblia ensina que o embrião e o feto são seres humanos plenamente vivos e criados à imagem e semelhança de Deus desde a fecundação.',
          },
          {
            letra: 'C',
            texto: 'Os animais possuem prioridade de preservação biológica em relação aos fetos humanos.',
          },
          {
            letra: 'D',
            texto: 'O mandamento se aplica apenas a pessoas adultas com independência financeira.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'A Escritura atribui dignidade de pessoa humana ao nascituro desde a concepção (Sl 139:13; Jr 1:5).',
      },
      {
        id: 'sim-disc5-q4',
        enunciado:
          'Quanto às decisões éticas hospitalares no estágio terminal da vida humana, a distinção entre a eutanásia e a recusa da obstinação terapêutica (distanásia) reside em:',
        alternativas: [
          {
            letra: 'A',
            texto:
              'A eutanásia consiste na ação ou omissão deliberada para provocar a morte precoce do enfermo, enquanto a cessação da obstinação aceita o limite natural da morte, oferecendo cuidados paliativos com dignidade.',
          },
          {
            letra: 'B',
            texto: 'Ambas são formas idênticas de assassinato repudiadas pela medicina moderna.',
          },
          {
            letra: 'C',
            texto: 'A distanásia é uma ordenança bíblica para prolongar artificialmente o sofrimento a qualquer custo.',
          },
          {
            letra: 'D',
            texto: 'O cristão deve rejeitar qualquer forma de analgésico ou anestésico durante o tratamento terminal.',
          },
        ],
        gabarito: 'A',
        justificativa:
          'A ética cristã condena tirar a vida ativamente (eutanásia), mas apoia a dignidade do descanso sem tortura mecânica desproporcional (ortotanásia).',
      },
      {
        id: 'sim-disc5-q5',
        enunciado:
          'Em relação ao quinto mandamento ("Honra a teu pai e a tua mãe"), o Catecismo Maior de Westminster estende seu significado ético para além dos pais biológicos, abrangendo:',
        alternativas: [
          { letra: 'A', texto: 'Apenas os avós e padrinhos de batismo.' },
          {
            letra: 'B',
            texto:
              'Todas as relações hierárquicas legítimas na sociedade, incluindo superiores de idade, patrões, magistrados civis e líderes eclesiásticos.',
          },
          {
            letra: 'C',
            texto: 'Exclusivamente os governantes que compartilham da mesma denominação eclesiástica.',
          },
          { letra: 'D', texto: 'Nenhum outro indivíduo fora do núcleo familiar biológico direto.' },
        ],
        gabarito: 'B',
        justificativa:
          'O CMW ensina que "pai e mãe" representam todos os superiores em família, igreja e sociedade civil.',
      },
    ],
  },
  {
    disciplinaId: 'disc-6',
    ordem: 6,
    nome: 'Novo Testamento III — Epístolas Gerais',
    nomeCurto: 'NT III — Epístolas Gerais',
    professor: 'Profº Marcio Leal',
    diaGrupo: 'qui-26',
    diaLabel: 'Quinta • 26/11',
    dataISO: '2026-11-26',
    dataExtenso: '26/11/2026 (Quinta-feira)',
    horarioBRT: '20:35 – 22:00 (Brasília)',
    horarioTabatinga: '18:35 – 20:00 (Tabatinga)',
    formatoCurto: '10 Questões Forms',
    formatoCompleto: 'Prova objetiva via Google Forms com questões de múltipla escolha.',
    peso: 'Peso 10,0: 10 questões objetivas valendo 1,0 ponto cada = 10,0 pontos integrais.',
    consulta: 'Prova individual SEM CONSULTA.',
    trabalhoExtra: 'Não há trabalho escrito complementar.',
    canalEnvio: 'Link direto disponibilizado na sala virtual no horário de aula.',
    textosBase:
      'Slides do professor e o livro-texto Introdução ao Novo Testamento (D. A. Carson, Douglas J. Moo e Leon Morris).',
    linksBase: [
      {
        label: 'Slides: Epístolas Católicas — Judas e Cartas Joaninas (PDF)',
        url: 'https://drive.google.com/file/d/1nvzRiGitV--EW7fqpfWRHbfF5u2H1WYc/view',
        tipo: 'pdf',
        destaque: true,
      },
      {
        label: 'Slides: Epístolas Católicas — Tiago, I e II Pedro (PDF)',
        url: 'https://drive.google.com/file/d/1LKsJqGgWvgkv_A1pwL9_E1p-qV9Cdgrr/view',
        tipo: 'pdf',
        destaque: true,
      },
      {
        label: 'Slides: Epístola aos Hebreus (PDF)',
        url: 'https://drive.google.com/file/d/1Npvc_RTAcfHgh8cjywa091DmMMfMLoUm/view',
        tipo: 'pdf',
      },
      {
        label: 'Livro-Texto: Introdução ao NT (Carson, Moo & Morris)',
        url: 'https://drive.google.com/open?id=1ofgq2tGJt-Lj6F2A4vgZOdVYqJKFyhgT&usp=drive_copy',
        tipo: 'pdf',
        destaque: true,
      },
      {
        label: 'Sala da Prova (Google Meet)',
        url: 'https://meet.google.com/nyn-xjqk-vky',
        tipo: 'meet',
      },
      {
        label: 'Pasta da Disciplina (Google Drive)',
        url: 'https://drive.google.com/open?id=1ppsv5caJVbHw-1RwhHu8nxBmqFT9Wm9P&usp=drive_copy',
        tipo: 'drive',
      },
    ],
    alertaDestaque:
      'Prova objetiva de 10 questões no Forms às 20:35 (BRT), sem consulta. Foco nos slides + Carson/Moo/Morris: 1 e 2 Pedro, Judas e 1, 2 e 3 João (além de síntese de Hebreus e Tiago).',
    cor: {
      accent: 'bg-indigo-600',
      bg: 'bg-indigo-500/10 dark:bg-indigo-950/30',
      border: 'border-indigo-300 dark:border-indigo-800',
      badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200',
      text: 'text-indigo-700 dark:text-indigo-300',
    },
    aulasUnidade2: [
      {
        aulaNum: 8,
        dataAprox: '~08/10/2026',
        resumo:
          'Devolutiva da AV1; introdução às Epístolas de Pedro e a contextualização da perseguição sob o Império Romano.',
        geminiUrl:
          'https://docs.google.com/document/d/1IiEdNvD7Pu2n9gTSQc7t2aMU_-31twD3vF0u8F9yJJM/edit',
      },
      {
        aulaNum: 9,
        dataAprox: '~15/10/2026',
        resumo:
          '1 Pedro: autoria do apóstolo Pedro com a mediação estilística de Silvano (Silas); envio a partir de Roma ("Babilônia", 1Pe 5:13) aos crentes da diáspora.',
      },
      {
        aulaNum: 10,
        dataAprox: '~22/10/2026',
        resumo:
          '1 Pedro: a teologia da "esperança viva", santidade como sacerdócio real de Deus e o testemunho ético do crente no ambiente social pagão.',
        geminiUrl:
          'https://docs.google.com/document/d/1Kq80omtq6u75kaI3x9nrvQfnHZBgPnfGydPMpN6XKGM/edit',
      },
      {
        aulaNum: 11,
        dataAprox: '~29/10/2026',
        resumo:
          '2 Pedro: o testamento de despedida do apóstolo diante do martírio iminente e a denúncia profética contra falsos mestres libertinos.',
      },
      {
        aulaNum: 12,
        dataAprox: '~05/11/2026',
        resumo:
          '2 Pedro: a defesa da segunda vinda (Parusia); refutação dos escarnecedores e a demonstração de que a demora de Cristo é paciência de Deus visando ao arrependimento (2Pe 3:9).',
        geminiUrl:
          'https://docs.google.com/document/d/18ykCo3NYtT1JTBkWw0GLBZO9hkawUP6d9VK_S6Y6Mgo/edit',
      },
      {
        aulaNum: 13,
        dataAprox: '~12/11/2026',
        resumo:
          'A Epístola de Judas: identidade do autor (irmão de Tiago e de Jesus); combate à licenciosidade moral e alusões às tradições judaicas apócrifas.',
        geminiUrl:
          'https://docs.google.com/document/d/1CzhxUexq8v-WnXg_O5Vh6N9Jdfu5yym4ohDKW_oVAUw/edit',
      },
      {
        aulaNum: 14,
        dataAprox: '~19/11/2026',
        resumo:
          'As Cartas de 1, 2 e 3 João: combate ao docetismo e proto-gnosticismo; os testes da verdadeira comunhão e o fechamento do semestre para a AV2.',
        geminiUrl:
          'https://docs.google.com/document/d/14pJY-VuipYA9Hkv7tRJBxsyw8S5ySzZzwHMDWK9CVRQ/edit',
      },
    ],
    guiaRevisao: [
      {
        titulo: 'Epístola aos Hebreus',
        detalhe:
          'Estilo homilético (sermão em forma de epístola); autoria humana anônima; anterior a 70 d.C. (sacrifícios em vigor); destinação aos cristãos judeus de Roma (Hb 13:24); supremacia absoluta de Cristo sobre anjos, Moisés, Josué e Arão.',
      },
      {
        titulo: 'Carta de Tiago',
        detalhe:
          'Autoria de Tiago (irmão de Jesus, líder em Jerusalém); datação primitiva (45 a 49 d.C.); sabedoria prática com 54 imperativos; harmonia com Paulo (Paulo combate o legalismo antes da salvação; Tiago combate o antinomismo hipócrita sem frutos).',
      },
      {
        titulo: '1 Pedro (Esperança Viva no Sofrimento)',
        detalhe:
          'Escrita com Silvano a partir de Roma ("Babilônia"); exorta os cristãos peregrinos a manterem conduta ilibada sob difamação hostil, lembrando que o sofrimento purifica a fé como ouro refinado no fogo.',
      },
      {
        titulo: '2 Pedro (Alerta contra Falsos Mestres e a Parusia)',
        detalhe:
          'Pedro combate hereges internos que ensinavam libertinagem e zombavam da segunda vinda; em 2Pe 3:9 ensina que o Senhor não retarda a promessa, mas é paciente visando ao arrependimento.',
      },
      {
        titulo: 'O Conhecimento Pleno (Epignosis)',
        detalhe:
          'Em 2 Pedro, a verdadeira arma contra a corrupção herética e o desvio moral é o crescimento no verdadeiro conhecimento salvífico de Jesus Cristo (2Pe 1:3; 3:18).',
      },
      {
        titulo: 'Carta de Judas',
        detalhe:
          'Escrita pelo irmão de Tiago para instar a igreja a batalhar ardentemente pela fé entregue aos santos, denunciando indivíduos carnais que transformavam a graça em libertinagem.',
      },
      {
        titulo: 'Cartas Joaninas (1, 2 e 3 João)',
        detalhe:
          'Escritas pelo apóstolo João para refutar o docetismo (que negava a encarnação física real de Jesus); apresenta três testes do crente genuíno: doutrina correta, obediência moral e amor fraterno.',
      },
    ],
    mapaMental: `EPÍSTOLAS GERAIS & HEBREUS (PROFº MARCIO LEAL)
├── Hebreus (O Sermão Homilético)
│   ├── Destinação: Judeus crentes em Roma (antes de 70 d.C.)
│   └── Supremacia Absoluta: Cristo Superior a Moisés, Anjos e Levi
├── Tiago (A Fé Prática)
│   ├── Autor: Tiago, irmão do Senhor (Líder da Igreja de Jerusalém)
│   └── Tese: Fé sem obras é morta (Combate direto ao antinomismo)
├── As Epístolas Petrianas
│   ├── 1 Pedro (Esperança viva dos peregrinos sob perseguição em Roma)
│   └── 2 Pedro (Combate aos escarnecedores da Parusia / A paciência em 2Pe 3:9)
└── Judas e as Cartas Joaninas
    ├── Judas (Batalhar pela fé contra apóstatas libertinos)
    └── 1, 2 e 3 João (Refutação do Docetismo: Cristo veio em carne real)`,
    simulado: [
      {
        id: 'sim-disc6-q1',
        enunciado:
          'Na Epístola aos Hebreus, o argumento teológico central desenvolvido pelo autor para desestimular os destinatários a retornarem aos antigos sacrifícios do judaísmo fundamenta-se:',
        alternativas: [
          {
            letra: 'A',
            texto: 'Na superioridade da Lei cerimonial sobre as palavras dos apóstolos.',
          },
          {
            letra: 'B',
            texto:
              'Na absoluta e eterna supremacia de Jesus Cristo como sumo sacerdote perfeito da Nova Aliança, cujo sacrifício único e definitivo aperfeiçoou para sempre os santificados.',
          },
          {
            letra: 'C',
            texto: 'Na necessidade de reconstruir o Templo de Jerusalém com pedras sagradas.',
          },
          {
            letra: 'D',
            texto: 'No anúncio de que os anjos governam o mundo vindouro.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'Hebreus demonstra que Cristo é superior aos profetas, anjos, Moisés e Arão, tendo oferecido sacrifício único e eterno.',
      },
      {
        id: 'sim-disc6-q2',
        enunciado:
          'A aparente contradição teológica entre o apóstolo Paulo (justificação pela fé sem as obras da lei) e o apóstolo Tiago (fé sem obras é morta) é resolvida exegética e historicamente ao compreender-se que:',
        alternativas: [
          {
            letra: 'A',
            texto: 'Tiago e Paulo romperam relações institucionais definitivamente no Concílio de Jerusalém.',
          },
          {
            letra: 'B',
            texto:
              'Paulo estava combatendo o legalismo meritório anterior à justificação, enquanto Tiago combatia o antinomismo que presumia uma fé vazia sem evidências de vida transformada.',
          },
          {
            letra: 'C',
            texto: 'A epístola de Tiago não foi inspirada pelo Espírito Santo e deve ser expurgada do cânon.',
          },
          {
            letra: 'D',
            texto: 'Paulo abandonou a doutrina da graça no final de seu ministério pastoral.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'Ambos se harmonizam perfeitamente: somos salvos somente pela fé, mas a fé salvadora nunca permanece sozinha (produz boas obras).',
      },
      {
        id: 'sim-disc6-q3',
        enunciado:
          'Em 1 Pedro 5:13, a saudação enviada pela igreja que está em "Babilônia" é consensualmente interpretada pelos estudiosos e confirmada nas aulas do Profº Marcio Leal como:',
        alternativas: [
          {
            letra: 'A',
            texto: 'Uma referência geográfica literal à cidade mesopotâmica em ruínas no território do atual Iraque.',
          },
          {
            letra: 'B',
            texto:
              'Uma designação cifrada e metafórica da capital do Império Romano (Roma), centro do paganismo e da perseguição social contra a igreja.',
          },
          {
            letra: 'C',
            texto: 'Um símbolo místico da cidade de Jerusalém ocupada por tropas islâmicas.',
          },
          {
            letra: 'D',
            texto: 'Uma cidade imaginária criada pelos Pais Apostólicos.',
          },
        ],
        gabarito: 'B',
        justificativa:
          '"Babilônia" era o codinome cristão primitivo para Roma imperial corrupta onde Pedro e Silvano ministravam.',
      },
      {
        id: 'sim-disc6-q4',
        enunciado:
          'Diante do ceticismo de falsos mestres que zombavam da promessa da segunda vinda indagando "onde está a promessa da sua vinda?", o apóstolo em 2 Pedro 3:9 refuta o erro ensinando que:',
        alternativas: [
          {
            letra: 'A',
            texto: 'A segunda vinda de Jesus já havia acontecido espiritualmente no dia de Pentecostes.',
          },
          {
            letra: 'B',
            texto:
              'O Senhor não retarda a sua promessa, mas é longânimo e paciente para com os homens, não querendo que ninguém pereça, mas que todos cheguem ao arrependimento.',
          },
          {
            letra: 'C',
            texto: 'Deus abandonou os planos de redenção para a criação material.',
          },
          {
            letra: 'D',
            texto: 'A terra continuará existindo eternamente sem nenhum juízo de fogo.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'A aparente demora não é lentidão, mas a paciência e graça de Deus aguardando a salvação dos eleitos.',
      },
      {
        id: 'sim-disc6-q5',
        enunciado:
          'As Epístolas Joaninas (1, 2 e 3 João) foram redigidas com o propósito imediato de advertir as congregações contra a heresia do docetismo, cuja tese central afirmava:',
        alternativas: [
          { letra: 'A', texto: 'Que Jesus Cristo não havia ressuscitado dos mortos.' },
          {
            letra: 'B',
            texto:
              'Que Jesus não possuía um corpo humano físico e material real, tendo apenas a aparência ou fantasma de homem.',
          },
          { letra: 'C', texto: 'Que os apóstolos eram deuses disfarçados de seres humanos.' },
          {
            letra: 'D',
            texto: 'Que a Lei de Moisés deveria ser observada obrigatoriamente por todos os gentios convertidos.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'O docetismo (do grego dokein, parecer) negava a verdadeira encarnação humana de Cristo, heresia veementemente combatida em 1 João 4:2-3.',
      },
    ],
  },
  {
    disciplinaId: 'disc-7',
    ordem: 7,
    nome: 'Plantação e Revitalização de Igrejas II',
    nomeCurto: 'Plantação & Revitalização II',
    professor: 'Profº Thácyto Lessa',
    diaGrupo: 'sex-27',
    diaLabel: 'Sexta • 27/11',
    dataISO: '2026-11-27',
    dataExtenso: '27/11/2026 (Sexta-feira)',
    horarioBRT: 'A partir das 19:00 (Brasília)',
    horarioTabatinga: '17:00 (Tabatinga)',
    formatoCurto: 'Consulta Livre + Resumo 12p',
    formatoCompleto:
      'DUPLA ATIVIDADE: (1) Prova Teórica Online (AV2) via Google Forms às 19:00; (2) Entrega do Resumo do livro A Treliça e a Videira (AV1).',
    peso: 'Prova teórica compõe a AV2 (0–10) + Resumo de 12 páginas compõe a AV1 (0–10).',
    consulta:
      'PROVA AV2 COM CONSULTA LIVRE E ABERTA aos slides, anotações pessoais e ao PDF consolidado oficial da disciplina.',
    trabalhoExtra:
      'Entrega de resumo estruturado de 12 páginas no total (estritamente 1 página digitada por capítulo da obra A Treliça e a Videira, de Colin Marshall e Tony Payne).',
    canalEnvio:
      'Prova: Google Forms às 19:00 BRT. Trabalho: enviar arquivo (PDF ou Word) até 23:59 de 27/11/2026 para thacyto@gmail.com.',
    linksBase: [
      {
        label: 'Sala da Prova (Google Meet — 19:00 BRT)',
        url: 'https://meet.google.com/jwb-wpvc-pzm',
        tipo: 'meet',
        destaque: true,
      },
      {
        label: 'Enviar Trabalho por E-mail (thacyto@gmail.com)',
        url: 'mailto:thacyto@gmail.com?subject=Trabalho%20AV2%20-%20Planta%C3%A7%C3%A3o%20e%20Revitaliza%C3%A7%C3%A3o%20II',
        tipo: 'email',
        destaque: true,
      },
      {
        label: 'Pasta da Disciplina (Google Drive)',
        url: 'https://drive.google.com/open?id=1nzXIDnWvvrxSgXQULaSvDGdVr32L_xP8&usp=drive_copy',
        tipo: 'drive',
      },
    ],
    alertaDestaque:
      'DUPLA ENTREGA EM 27/11: Prova AV2 às 19:00 com CONSULTA LIVRE (slides, anotações e PDF consolidado) + envio do Resumo digitado de 12 páginas de "A Treliça e a Videira" (PDF ou Word) até 23:59 para thacyto@gmail.com.',
    cor: {
      accent: 'bg-emerald-600',
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
      border: 'border-emerald-300 dark:border-emerald-800',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
      text: 'text-emerald-700 dark:text-emerald-300',
    },
    aulasUnidade2: [
      {
        aulaNum: 8,
        dataAprox: '~09/10/2026',
        resumo:
          'Devolutiva do questionário de leitura da AV1 (O Que é a Igreja?, de R. C. Sproul) e introdução ao diagnóstico das patologias de declínio eclesial.',
        geminiUrl:
          'https://docs.google.com/document/d/19nnfw9HsfjDxdE6yx4glueKYZW9NMqexeTvtSo8KOzw/edit',
      },
      {
        aulaNum: 9,
        dataAprox: '~16/10/2026',
        resumo:
          'Os 4 Ps da Revitalização Pastoral: Pregar (exposição bíblica vibrante), Piedade (santidade da liderança), Pastorear (cuidado individual) e Perseverar (resiliência ministerial).',
        geminiUrl:
          'https://docs.google.com/document/d/1p90BhDK1MudLADtl6xBSSE-K5QWr_z4QgyGk0YpAL1c/edit',
      },
      {
        aulaNum: 10,
        dataAprox: '~23/10/2026',
        resumo:
          'Modelos de governo e discipulado: a transição do pastor centralizador burocrático para uma liderança plural e capacitadora do rebanho.',
        geminiUrl:
          'https://docs.google.com/document/d/1jvZb_7cO5hDhAPq_3eS5znOtkQBySC6-LqNSPOtHcU0/edit',
      },
      {
        aulaNum: 11,
        dataAprox: '~30/10/2026',
        resumo:
          'Os conceitos centrais do livro A Treliça e a Videira: como manter as estruturas eclesiásticas a serviço do ministério relacional de proclamar a Palavra de Deus.',
        geminiUrl:
          'https://docs.google.com/document/d/1PRf_AE2Q6eoQKk_e_oDpNFPQ23koQSaFP9Ev0WJvdPA/edit',
      },
      {
        aulaNum: 12,
        dataAprox: '~06/11/2026',
        resumo:
          'O gerenciamento de resistências e conflitos na revitalização de igrejas tradicionais sem provocar cismas ou rupturas destrutivas.',
        geminiUrl:
          'https://docs.google.com/document/d/1UFG0ufUtVOwDJEBXn72eE6xETnshS-sdu3sbWA-HZmQ/edit',
      },
      {
        aulaNum: 13,
        dataAprox: '~13/11/2026',
        resumo:
          'Organização do PDF oficial consolidado para consulta da prova da AV2 e detalhamento do formato do resumo de 12 páginas.',
        geminiUrl:
          'https://docs.google.com/document/d/1jooWD7YG-2GZWIDfINg5_Ac9MWjRAspEwQsTnSk9e3o/edit',
      },
      {
        aulaNum: 14,
        dataAprox: '~20/11/2026',
        resumo:
          'Conclusão das dinâmicas pastorais de revitalização e plantação de congregações autônomas; encerramento preparatório para a AV2.',
      },
    ],
    guiaRevisao: [
      {
        titulo: 'Os 4 Ps da Revitalização Pastoral',
        detalhe:
          '(1) Pregar: exposição fiel, vibrante e cristocêntrica da Bíblia; (2) Piedade: santidade de vida pessoal do pastor, oração e dependência do Espírito; (3) Pastorear: cuidado relacional individualizado; (4) Perseverar: paciência a longo prazo perante resistências.',
      },
      {
        titulo: 'Plantação vs. Manutenção vs. Revitalização',
        detalhe:
          'Plantação: nascimento de nova igreja do zero; Manutenção: estado burocrático focado em programas sem conversões ou maturidade; Revitalização: restauração intencional de uma igreja histórica viva em declínio grave.',
      },
      {
        titulo: 'A Metáfora da Treliça e da Videira',
        detalhe:
          'Treliça (Estrutura): prédios, orçamentos, organogramas, programas e estatutos — sustenta mas não gera vida. Videira (Vida Espiritual): falar a Palavra de Deus no poder do Espírito através de evangelismo, oração e discipulado.',
      },
      {
        titulo: 'A Mudança de Mentalidade Pastoral (Ef 4:11-12)',
        detalhe:
          'Transição do modelo de "pastor como único funcionário prestador de serviços" para "pastor como treinador de fazedores de discípulos".',
      },
      {
        titulo: 'As 9 Marcas de uma Igreja Saudável (Mark Dever)',
        detalhe:
          'Pregação Expositiva, Teologia Bíblica, Compreensão do Evangelho, Conversão Bíblica, Evangelismo Bíblico, Membresia Consciente, Disciplina Eclesiástica, Discipulado e Liderança Bíblica.',
      },
      {
        titulo: 'As Três Marcas da Igreja Verdadeira (R. C. Sproul e Reformadores)',
        detalhe:
          '(1) Fiel proclamação da Palavra de Deus; (2) Ministração correta das ordenanças/sacramentos (Batismo e Ceia); (3) Exercício da disciplina eclesiástica restauradora.',
      },
    ],
    mapaMental: `PLANTAÇÃO E REVITALIZAÇÃO II (PROFº THÁCYTO LESSA)
├── Os 4 Ps da Revitalização Pastoral
│   ├── Pregar (Pregação bíblica expositiva viva)
│   ├── Piedade (Santidade pessoal e vida de oração do pastor)
│   ├── Pastorear (Acompanhamento individual e pastoreio relacional)
│   └── Perseverar (Paciência diante da oposição e tempo de maturação)
├── Diagnóstico e Mudança de Mentalidade
│   ├── Plantação (Do zero) vs. Manutenção (Burocracia) vs. Revitalização (Cura)
│   └── O Pastor como Treinador de Obreiros (Efésios 4:11-12)
└── A Treliça e a Videira (Marshall & Payne)
    ├── A Treliça (Estrutura, comitês, orçamento e administração necessária)
    └── O Trabalho da Videira (Pessoas, evangelismo, discipulado e oração)`,
    simulado: [
      {
        id: 'sim-disc7-q1',
        enunciado:
          'No processo de restauração espiritual de uma igreja local estagnada, os "4 Ps da Revitalização Pastoral" ensinados na disciplina compreendem:',
        alternativas: [
          { letra: 'A', texto: 'Política, Poder, Propaganda e Prosperidade.' },
          { letra: 'B', texto: 'Pregar, Piedade, Pastorear e Perseverar.' },
          { letra: 'C', texto: 'Programas, Planejamento, Patrimônio e Premiações.' },
          { letra: 'D', texto: 'Presbitério, Psicologia, Prédios e Publicações.' },
        ],
        gabarito: 'B',
        justificativa:
          'Os 4 Ps são as colunas pastorais ensinadas pelo Profº Thácyto para revitalizar uma congregação em declínio.',
      },
      {
        id: 'sim-disc7-q2',
        enunciado:
          'A distinção teológica e prática central apresentada no livro A Treliça e a Videira reside na compreensão de que:',
        alternativas: [
          {
            letra: 'A',
            texto: 'A treliça gera frutos espirituais automáticos, tornando dispensável o trabalho com pessoas.',
          },
          {
            letra: 'B',
            texto:
              'A treliça representa a infraestrutura e os programas necessários, enquanto a videira representa o crescimento das pessoas pelo ministério relacional da Palavra de Deus.',
          },
          {
            letra: 'C',
            texto:
              'As igrejas devem demolir seus templos e queimar seus orçamentos para viver exclusivamente sem estruturas físicas.',
          },
          {
            letra: 'D',
            texto:
              'Somente o pastor titular possui a chamada divina para evangelizar e orar na comunidade local.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'A obra adverte que o foco do ministério deve ser cultivar a videira (pessoas), mantendo a treliça (estrutura) apenas como suporte e não como fim.',
      },
      {
        id: 'sim-disc7-q3',
        enunciado:
          'A tentação comum de igrejas que caem no estado estéril de "manutenção" consiste em:',
        alternativas: [
          {
            letra: 'A',
            texto:
              'Gastar todo o tempo, energia e orçamento consertando e mantendo a treliça administrativa, enquanto a videira seca por falta de cuidado discipular e oração.',
          },
          {
            letra: 'B',
            texto: 'Plantar novas congregações em bairros periféricos não alcançados.',
          },
          {
            letra: 'C',
            texto: 'Investir excessivamente no envio de obreiros e missionários transculturais.',
          },
          {
            letra: 'D',
            texto: 'Exercer a disciplina bíblica com rigor e amor com vistas à restauração do faltoso.',
          },
        ],
        gabarito: 'A',
        justificativa:
          'A manutenção é a síndrome institucional de manter programas e burocracia funcionando sem conversão ou discipulado de vidas.',
      },
      {
        id: 'sim-disc7-q4',
        enunciado:
          'De acordo com Efésios 4:11-12 e o ensino da disciplina sobre a mudança de mentalidade no ministério pastoral, o papel primordial do pastor na liderança é:',
        alternativas: [
          {
            letra: 'A',
            texto: 'Ser o único provedor centralizador de todos os serviços religiosos, visitas e decisões eclesiásticas.',
          },
          {
            letra: 'B',
            texto:
              'Equipar e treinar os santos para o desempenho do seu ministério, formando fazedores de discípulos.',
          },
          {
            letra: 'C',
            texto: 'Substituir os presbíteros e diáconos pela contratação de consultorias empresariais seculares.',
          },
          {
            letra: 'D',
            texto:
              'Evitar qualquer tipo de confronto ou exortação bíblica para não perder a aprovação dos membros da diretoria.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'O pastor bíblico atua como treinador capacitador para que todo o corpo de Cristo desempenhe o ministério mútuo.',
      },
      {
        id: 'sim-disc7-q5',
        enunciado:
          'Conforme a exposição do livro O Que é a Igreja?, de R. C. Sproul, a igreja visível é descrita como uma comunidade mista porque:',
        alternativas: [
          {
            letra: 'A',
            texto:
              'Nela convivem simultaneamente crentes verdadeiros regenerados e pessoas que professam a fé de forma meramente hipócrita (o joio e o trigo).',
          },
          {
            letra: 'B',
            texto: 'Ela reúne diferentes partidos políticos em torno da mesma mesa litúrgica.',
          },
          {
            letra: 'C',
            texto: 'Não há nenhuma exigência de conversão ou batismo para assumir a membresia comungante.',
          },
          {
            letra: 'D',
            texto: 'Os apóstolos ensinaram que o pecado não existe mais no coração do homem.',
          },
        ],
        gabarito: 'A',
        justificativa:
          'A igreja visível é mista terrena, ao passo que a igreja invisível é formada exclusivamente pelo número exato dos eleitos conhecidos infalivelmente por Deus.',
      },
    ],
  },
  {
    disciplinaId: 'disc-8',
    ordem: 8,
    nome: 'TCC I — Trabalho de Conclusão de Curso I',
    nomeCurto: 'TCC I (Artigo Final)',
    professor: 'Profª Gabriela Leal',
    diaGrupo: 'tcc-04',
    diaLabel: 'Sexta • 04/12',
    dataISO: '2026-12-04',
    dataExtenso: '04/12/2026 (Sexta-feira)',
    horarioBRT: 'Até às 23:59 (Brasília)',
    horarioTabatinga: 'Até às 21:59 (Tabatinga)',
    formatoCurto: 'Artigo 20–25 págs',
    formatoCompleto:
      'Entrega do Artigo Científico Completo formatado rigorosamente nas normas ABNT e Manual da FMB/UNIMB (20 a 25 páginas no total).',
    peso: 'Artigo Monográfico ABNT / Nota Final de Conclusão de TCC I.',
    consulta: 'PROIBIÇÃO EXPRESSA do uso de Inteligência Artificial para redação e vedação total ao plágio.',
    trabalhoExtra:
      'Escrita formal e impessoal em 3ª pessoa ou voz apassivada (vedada 1ª pessoa do singular ou plural).',
    canalEnvio:
      'Envio do arquivo em formato digital (PDF e Word) na plataforma acadêmica / e-mail da orientadora (gabriela.lealg7757@gmail.com).',
    linksBase: [
      {
        label: 'Enviar TCC I por E-mail (gabriela.lealg7757@gmail.com)',
        url: 'mailto:gabriela.lealg7757@gmail.com?subject=Entrega%20Final%20TCC%20I%20-%202026.2',
        tipo: 'email',
        destaque: true,
      },
      {
        label: 'Sala de Orientação (Google Meet)',
        url: 'https://meet.google.com/jnz-hkqd-edc',
        tipo: 'meet',
      },
      {
        label: 'Pasta da Disciplina (Google Drive)',
        url: 'https://drive.google.com/open?id=1f-9i-TpqaZhzoLyrxg6flM6CHTsAOWPj&usp=drive_copy',
        tipo: 'drive',
      },
    ],
    alertaDestaque:
      'Entrega final em 04/12/2026 até 23:59: Artigo com extensão estrita de 20 a 25 páginas (da capa às referências), em PDF e Word, 100% impessoal (3ª pessoa) e rigorosamente SEM uso de IA ou plágio.',
    cor: {
      accent: 'bg-fuchsia-600',
      bg: 'bg-fuchsia-500/10 dark:bg-fuchsia-950/30',
      border: 'border-fuchsia-300 dark:border-fuchsia-800',
      badge: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/60 dark:text-fuchsia-200',
      text: 'text-fuchsia-700 dark:text-fuchsia-300',
    },
    aulasUnidade2: [
      {
        aulaNum: 8,
        dataAprox: '~09/10/2026',
        resumo:
          'Devolutiva dos pré-projetos aprovados da AV1; orientação de transição definitiva para a redação do artigo científico final.',
        geminiUrl:
          'https://docs.google.com/document/d/1mANDz_crlvKLbTE-UDDX9t9GjiCu5cPfO6pqP_813bE/edit',
      },
      {
        aulaNum: 9,
        dataAprox: '~16/10/2026',
        resumo:
          'Metodologia Científica Aplicada à Teologia: classificação da pesquisa (qualitativa, bibliográfica, documental e histórico-descritiva).',
      },
      {
        aulaNum: 10,
        dataAprox: '~23/10/2026',
        resumo:
          'Redação dos capítulos de Desenvolvimento: o diálogo entre autores com citações diretas curtas, diretas longas (recuo de 4 cm) e paráfrases.',
        geminiUrl:
          'https://docs.google.com/document/d/1op8PfbAYUEXkMsYk05A2Wn8LGrWsVrUNIedIB5OX7ks/edit',
      },
      {
        aulaNum: 11,
        dataAprox: '~30/10/2026',
        resumo:
          'O princípio da Impessoalidade Acadêmica: eliminação de expressões devocionais pessoais ("eu penso", "meu trabalho") e o rigor semântico teológico.',
        geminiUrl:
          'https://docs.google.com/document/d/1Hv7A1JHsNEQY2BhnFCZfbf_LUBu8Vpb0_NyB_T8mFSE/edit',
      },
      {
        aulaNum: 12,
        dataAprox: '~06/11/2026',
        resumo:
          'Redação das Considerações Finais: fechamento dos objetivos específicos sem introdução de citações teóricas inéditas.',
        geminiUrl:
          'https://docs.google.com/document/d/1z4tSB5VQ4DyD2KWvIV4pFR_8Cdh-B7Hy1IDCxqVxFa0/edit',
      },
      {
        aulaNum: 13,
        dataAprox: '~13/11/2026',
        resumo:
          'Elaboração dos elementos pré-textuais por último: estrutura do Resumo e Abstract (150 a 500 palavras em parágrafo único) e da Introdução definitiva.',
        geminiUrl:
          'https://docs.google.com/document/d/1XTq-zk-3TRNqujyrpQERGI_uAlj8RYJZ3YCrhBXBqE0/edit',
      },
      {
        aulaNum: 14,
        dataAprox: '~20/11/2026',
        resumo:
          'Revisão de formatação pré-entrega: normas ABNT NBR 6023 para referências bibliográficas alfabéticas e o checklist de 20 a 25 laudas.',
      },
    ],
    guiaRevisao: [
      {
        titulo: 'Extensão Rígida de 20 a 25 Páginas',
        detalhe:
          'O artigo não pode ter menos de 20 nem mais de 25 páginas completas (da capa às referências).',
      },
      {
        titulo: 'Ordem Cronológica Recomendada de Redação',
        detalhe:
          'Metodologia → Desenvolvimento dos Capítulos (Fundamentação Teórica) → Considerações Finais → Introdução e Resumo/Abstract (redigidos por último, após a conclusão do texto).',
      },
      {
        titulo: 'Linguagem Científica Impessoal',
        detalhe:
          'Terceira pessoa do singular ou voz passiva pronominal ("observa-se", "constata-se", "pretende-se demonstrar"). Jamais utilizar "eu acho", "minha opinião" ou "percebemos".',
      },
      {
        titulo: 'Regras de Citação ABNT (NBR 10520)',
        detalhe:
          'Direta Curta (até 3 linhas): no parágrafo, entre aspas duplas, com autor, ano e página (SOBRENOME, 2026, p. 45). Direta Longa (+3 linhas): bloco destacado com recuo de 4 cm da margem esquerda, fonte 10, espaçamento simples e SEM aspas. Indireta (Paráfrase): exige autor e ano (SOBRENOME, 2026).',
      },
      {
        titulo: 'Estrutura do Resumo Acadêmico (NBR 6028)',
        detalhe:
          'Parágrafo único contínuo de 150 a 500 palavras, espaçamento simples, contendo tema, objetivo geral, metodologia, principais resultados e conclusão, seguido de 3 a 5 palavras-chave separadas por ponto final.',
      },
      {
        titulo: 'Normas de Referências Bibliográficas (NBR 6023)',
        detalhe:
          'Alinhadas estritamente à margem esquerda, espaçamento simples interno, separadas por 1 espaço em branco, ordenadas em ordem alfabética pelo sobrenome do autor e com título da obra em negrito.',
      },
      {
        titulo: 'Ética e Vedação ao Plágio e IA',
        detalhe:
          'Todo conceito alheio não creditado configura plágio passível de anulação da nota; é expressamente vedado o uso de IA como redatora de texto acadêmico.',
      },
    ],
    mapaMental: `ARTIGO CIENTÍFICO FINAL DE TCC I (PROFª GABRIELA LEAL)
├── Estrutura do Artigo (20 a 25 Páginas no total)
│   ├── Pré-Textuais (Capa FMB, Folha de Rosto, Resumo/Abstract com Palavras-chave)
│   ├── Textuais (Introdução, Metodologia, Seções de Desenvolvimento, Considerações Finais)
│   └── Pós-Textuais (Referências Bibliográficas em ordem alfabética)
├── Padrão de Linguagem e Redação
│   ├── Impessoalidade Absoluta (Voz passiva: "observa-se", "analisa-se")
│   └── Proibição de Plágio e de Escrita por Inteligência Artificial
└── Regras de Citação (ABNT)
    ├── Direta Curta (Até 3 linhas / No corpo do texto / Entre aspas)
    ├── Direta Longa (Mais de 3 linhas / Recuo de 4 cm / Fonte 10 / Sem aspas)
    └── Indireta (Paráfrase livre com citação de Autor e Ano)`,
    simulado: [
      {
        id: 'sim-disc8-q1',
        enunciado:
          'Quanto à extensão obrigatória estabelecida pela Profª Gabriela Leal para o Artigo Científico Final da disciplina de TCC I, o trabalho completo deve ter:',
        alternativas: [
          { letra: 'A', texto: 'Exatamente 10 páginas, sem contar a capa.' },
          {
            letra: 'B',
            texto: 'Entre 20 e 25 páginas no total (contando elementos pré-textuais, corpo do artigo e referências).',
          },
          { letra: 'C', texto: 'Mínimo de 40 páginas encadernadas em capa dura.' },
          { letra: 'D', texto: 'Não há limite mínimo ou máximo de laudas.' },
        ],
        gabarito: 'B',
        justificativa:
          'O padrão exigido pela faculdade e pela professora é de 20 a 25 laudas completas.',
      },
      {
        id: 'sim-disc8-q2',
        enunciado:
          'Na redação científica de um trabalho de conclusão de curso em Teologia, o padrão de linguagem acadêmica exige estritamente:',
        alternativas: [
          {
            letra: 'A',
            texto: 'O uso prioritário da primeira pessoa do singular para demonstrar convicção devocional ("eu creio", "minha opinião").',
          },
          {
            letra: 'B',
            texto: 'O uso da linguagem impessoal em terceira pessoa ou voz passiva ("constata-se", "analisa-se", "o presente estudo propõe").',
          },
          {
            letra: 'C',
            texto: 'Linguagem coloquial informal repleta de gírias e expressões devocionais populares.',
          },
          { letra: 'D', texto: 'Narrativa em formato de diário de oração pessoal.' },
        ],
        gabarito: 'B',
        justificativa:
          'A impessoalidade científica assegura o distanciamento crítico e o rigor metodológico da pesquisa.',
      },
      {
        id: 'sim-disc8-q3',
        enunciado:
          'Uma citação direta com mais de três linhas no corpo de um artigo acadêmico (segundo as normas da ABNT e o Manual da FMB) deve ser formatada da seguinte maneira:',
        alternativas: [
          {
            letra: 'A',
            texto: 'Entre aspas duplas, em fonte tamanho 14 e alinhamento centralizado.',
          },
          {
            letra: 'B',
            texto:
              'Em bloco destacado com recuo de 4 cm da margem esquerda, fonte tamanho 10, espaçamento entrelinhas simples e sem aspas.',
          },
          {
            letra: 'C',
            texto: 'Em itálico, no mesmo parágrafo, sem qualquer indicação de página ou autor.',
          },
          {
            letra: 'D',
            texto: 'Em nota de rodapé no final da página sem constar nas referências bibliográficas.',
          },
        ],
        gabarito: 'B',
        justificativa:
          'Citações com mais de 3 linhas exigem recuo de 4 cm, redução da fonte para tamanho 10, espaçamento simples e dispensa de aspas.',
      },
      {
        id: 'sim-disc8-q4',
        enunciado:
          'Conforme as diretrizes metodológicas da disciplina, a Introdução e o Resumo/Abstract do artigo científico devem ser redigidos:',
        alternativas: [
          { letra: 'A', texto: 'Antes da definição do tema e dos objetivos do trabalho.' },
          {
            letra: 'B',
            texto:
              'Por último, após o desenvolvimento completo dos capítulos e das considerações finais, pois é quando se tem clareza de todo o percurso e conclusões alcançadas.',
          },
          { letra: 'C', texto: 'Exclusivamente no primeiro dia de aula do semestre letivo.' },
          { letra: 'D', texto: 'Por um autor externo sem vínculo com a pesquisa teológica.' },
        ],
        gabarito: 'B',
        justificativa:
          'Só é possível introduzir e resumir com precisão uma pesquisa após seus resultados e considerações finais estarem totalmente redigidos.',
      },
      {
        id: 'sim-disc8-q5',
        enunciado:
          'Na elaboração da lista de Referências Bibliográficas no final do artigo (conforme a norma ABNT NBR 6023), as obras citadas no texto devem ser organizadas:',
        alternativas: [
          { letra: 'A', texto: 'Em ordem cronológica decrescente da data de publicação dos livros.' },
          {
            letra: 'B',
            texto:
              'Por ordem alfabética estrita pelo sobrenome do primeiro autor, com alinhamento à margem esquerda e título da obra destacado em negrito.',
          },
          { letra: 'C', texto: 'Pela preferência doutrinária ou denominação de cada teólogo citado.' },
          { letra: 'D', texto: 'Aleatoriamente de acordo com a memória do estudante.' },
        ],
        gabarito: 'B',
        justificativa:
          'As referências seguem alinhamento à esquerda, entrelinhas simples, destaque no título e ordenação estritamente alfabética pelo sobrenome do autor.',
      },
    ],
  },
];
