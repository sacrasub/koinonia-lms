import { BibliotecaBook } from '@/types';

export const BIBLIOTECA_ROOT_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1qpHLjy3pcnf--FWSpg8jiTcRru5bkQEf?usp=sharing';
export const BIBLIOTECA_PROFESSOR_SUGGESTIONS_FOLDER_URL = 'https://drive.google.com/drive/folders/1ZYlVXv5MTJNQZJB7WVrjGJmHd7ceauG1';

const CUSTOM_BOOKS_STORAGE_KEY = 'lms_custom_books_v1';
const OVERRIDDEN_DRIVE_URLS_KEY = 'lms_book_overrides_v1';

/**
 * Catálogo Oficial de Livros Recomendados e Sugeridos pelo Corpo Docente da UIECB
 * Preenchidos e cruzados com a pasta de livros sugeridos pelos professores
 */
export const PROFESSOR_RECOMMENDED_LIBRARY_BOOKS: BibliotecaBook[] = [
  {
    id: 'rec-book-his-1',
    title: 'Congregacionalismo: origens e contribuições sociais da democracia protestante',
    author: 'Pastor Hidauro Campos',
    category: '21 - História do Congregacionalismo e Tradição Reformada',
    size: 2450000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'História do Congregacionalismo/Congregacionalismo Hidauro Campos.pdf',
    drive_url: 'https://drive.google.com/open?id=19Y8Nv2Yvx1V-m4E5y5fUWOo5e8DZzeji&usp=drive_copy',
    description: 'Indicação literária oficial do Profº Ary Júnior. Trata das origens e raízes da democracia congregacional.',
    added_by_name: 'Profº Ary Júnior',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'fmb_cf9eeb597c03',
    title: 'Declaração de Fé da UIECB: Princípios e Doutrinas Congregacionais',
    author: 'União das Igrejas Evangélicas Congregacionais do Brasil (UIECB)',
    category: '21 - História do Congregacionalismo e Tradição Reformada',
    size: 1244947,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/LIVRETO - DECLARAÇÃO DE FÉ.pdf',
    drive_url: 'https://drive.google.com/file/d/1odPOD9m9ztZXJAY17H9nwyQQuYto-vui/view?usp=drivesdk',
    description: 'Documento oficial com os 28 artigos de fé das Igrejas Evangélicas Congregacionais do Brasil. Recomendado pelo Profº Ary Júnior.',
    added_by_name: 'Profº Ary Júnior',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'rec-book-his-3',
    title: 'História dos Congregacionais no Brasil',
    author: 'Salomão Ginsburg / Arquivo UIECB',
    category: '21 - História do Congregacionalismo e Tradição Reformada',
    size: 3120000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'História do Congregacionalismo/História dos Congregacionais no Brasil.pdf',
    drive_url: 'https://drive.google.com/open?id=19Y8Nv2Yvx1V-m4E5y5fUWOo5e8DZzeji&usp=drive_copy',
    description: 'Bibliografia base para o estudo da Unidade 2 (Vertente Congregacional Brasileira). Recomendado pelo Profº Ary Júnior.',
    added_by_name: 'Profº Ary Júnior',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'fmb_1847cbe6fec2',
    title: 'A Missão de Deus: Revelando o plano redentor das Escrituras',
    author: 'Christopher J. H. Wright',
    category: '08 - Missões e Evangelismo',
    size: 2950430,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/A MISSÃO de DEUS.pdf',
    drive_url: 'https://drive.google.com/file/d/1s9KwYttby1gr17zA_wsDAyS37UKmvhxO/view?usp=drivesdk',
    description: 'Obra referencial sobre a teologia bíblica da missão de Deus ao longo do cânon bíblico. Recomendado pelo Profº Hilário Bispo.',
    added_by_name: 'Profº Hilário Bispo',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18QyUJJ88O4Tmhz0Hk8uf_EhHNmmErWNi',
    title: 'A Missão do Povo de Deus: Uma teologia bíblica da missão da Igreja',
    author: 'Christopher J. H. Wright',
    category: '08 - Missões e Evangelismo',
    size: 8926696,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/A MISSÃO do POVO de DEUS.pdf',
    drive_url: 'https://drive.google.com/file/d/18QyUJJ88O4Tmhz0Hk8uf_EhHNmmErWNi/view?usp=drivesdk',
    description: 'Visão bíblica profunda sobre o chamado, a identidade e a missão do povo de Deus no mundo. Recomendado pelo Profº Hilário Bispo.',
    added_by_name: 'Profº Hilário Bispo',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'fmb_9d513e960a54',
    title: 'Os Puritanos: Suas Origens e Seus Sucessores',
    author: 'D. Martyn Lloyd-Jones',
    category: '06 - Teologia Histórica e Patrística',
    size: 5840000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'História do Pensamento Cristão II/Os Puritanos Lloyd Jones.pdf',
    drive_url: 'https://drive.google.com/file/d/1Edz8VaptjTk1YZV8bvFYTblMLB-SURjH/view?usp=drivesdk',
    description: 'Coletânea magistral de conferências puritanas e história reformada recomendada pelo Profº Hilário Bispo.',
    added_by_name: 'Profº Hilário Bispo',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'fmb_308a2a3383ab',
    title: 'Santos no Mundo: Os Puritanos como Realmente Eram',
    author: 'Leland Ryken',
    category: '06 - Teologia Histórica e Patrística',
    size: 4720000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'História do Pensamento Cristão II/Santos no Mundo Leland Ryken.pdf',
    drive_url: 'https://drive.google.com/file/d/15c_iAsgJo5T_8yQLeRieiQpKKbag2YYM/view?usp=drivesdk',
    description: 'Exame histórico e teológico sobre a influência puritana na cosmovisão e ética cristã. Recomendado pelo Profº Hilário Bispo.',
    added_by_name: 'Profº Hilário Bispo',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '1fChnOz-_OMMQ4YEl4_ybYVbmi8K2FTdb',
    title: 'O Livro dos Mártires: História das Perseguições e do Testemunho Cristão',
    author: 'John Foxe',
    category: '06 - Teologia Histórica e Patrística',
    size: 14200000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/O Livro dos Mártires.pdf',
    drive_url: 'https://drive.google.com/file/d/1fChnOz-_OMMQ4YEl4_ybYVbmi8K2FTdb/view?usp=drivesdk',
    description: 'Monumento histórico do martírio e da perseverança cristã desde a igreja primitiva até a Reforma. Recomendado pelo Profº Hilário Bispo.',
    added_by_name: 'Profº Hilário Bispo',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'fmb_837f708e6064',
    title: 'Ego Transformado: A verdadeira humildade cristã',
    author: 'Timothy Keller',
    category: '16 - Aconselhamento Bíblico e Cuidado da Alma',
    size: 934820,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/Ego Transformado.pdf',
    drive_url: 'https://drive.google.com/file/d/1MwgW6nKeX1b-Bd6ot_m5y3LCIh1LM_id/view?usp=drivesdk',
    description: '⭐ LEITURA OBRIGATÓRIA em Aconselhamento Bíblico II (Profº Uilian Santos) para autoconhecimento e maturidade.',
    added_by_name: 'Profº Uilian Santos',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'fmb_ab871c994bec',
    title: 'Lutero como Conselheiro Espiritual: Cartas de Conforto e Cuidado Pastoral',
    author: 'Theodore G. Tappert / Martinho Lutero',
    category: '16 - Aconselhamento Bíblico e Cuidado da Alma',
    size: 2140643,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/Lutero Como Conselheiro Espiritual.pdf',
    drive_url: 'https://drive.google.com/file/d/1Umxq-c5cv6VoFYD6w00QD-BKs5Vt5PGb/view?usp=drivesdk',
    description: 'Cartas e orientações pastorais de Lutero para o tratamento espiritual de ansiedade, tentação e luto. Recomendado pelo Profº Uilian Santos.',
    added_by_name: 'Profº Uilian Santos',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '1cRFEHgU1O1emoehE1Fwdr8MrCeGoxB9L_2991',
    title: 'Aconselhamento Cristão: Depressão, Ansiedade, Crises e Suicídio',
    author: 'Gary R. Collins',
    category: '16 - Aconselhamento Bíblico e Cuidado da Alma',
    size: 23152869,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/ACONSELHAMENTO CRISTÃO.pdf',
    drive_url: 'https://drive.google.com/file/d/1-WMGzLE1r1B_7gabCLXBwg7u01UiAQ4B/view?usp=drivesdk',
    description: 'Manual abrangente para conselheiros pastorais em situações críticas e emocionais profundas. Recomendado pelo Profº Uilian Santos.',
    added_by_name: 'Profº Uilian Santos',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '1EZxiGqOQJ_3vttGZRFOsSfsclYV3lK2e',
    title: 'Aconselhamento a partir da Cruz: O poder do evangelho no cuidado das almas',
    author: 'Elyse M. Fitzpatrick e Dennis E. Johnson',
    category: '16 - Aconselhamento Bíblico e Cuidado da Alma',
    size: 4197918,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/Aconselhamento a partir da cruz.pdf',
    drive_url: 'https://drive.google.com/file/d/15FTDt2QtK4XX-Z5FyKF9fFPzoGf4nk09/view?usp=drivesdk',
    description: 'Abordagem pastoral cristocêntrica para cuidado e conforto espiritual centrada na cruz de Cristo. Recomendado pelo Profº Uilian Santos.',
    added_by_name: 'Profº Uilian Santos',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'rec-book-dir-1',
    title: 'Compêndio de Direitos Humanos, Cidadania e Dignidade da Pessoa Humana',
    author: 'Profº Cleiton Barbirato (Org.)',
    category: '14 - Sociologia e Ciências Afins',
    size: 5120000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'Direitos Humanos/Compêndio de Direitos Humanos.pdf',
    drive_url: 'https://drive.google.com/open?id=1fPSmFUBNzrzK--n3NDKOdMR5HWk25AV7&usp=drive_copy',
    description: 'Toda a bibliografia obrigatória e textos de apoio da disciplina Direitos Humanos fornecidos digitalmente pelo Profº Cleiton Barbirato.',
    added_by_name: 'Profº Cleiton Barbirato',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'fmb_2e65013ce8cf',
    title: 'Catecismo Maior de Westminster Comentado: Exposição Doutrinária',
    author: 'Johannes G. Vos / Assembleia de Westminster',
    category: '04 - Teologia Sistemática',
    size: 9386158,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '17 - Recomendados/Catecismo Maior Westminster Comentado.pdf',
    drive_url: 'https://drive.google.com/file/d/1GR7IcQv9YrcNmbgjY_dKz6U0EK5mMcKv/view?usp=drivesdk',
    description: '⭐ BASE OFICIAL DOS SEMINÁRIOS: Exposição detalhada dos Dez Mandamentos para os seminários de Ética Cristã (Profª Karoline Evangelista).',
    added_by_name: 'Profª Karoline Evangelista',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'fmb_d4d28638014e',
    title: 'O Catecismo Maior de Westminster: Texto Oficial e Exposição dos Dez Mandamentos',
    author: 'Assembleia de Westminster (1647)',
    category: '04 - Teologia Sistemática',
    size: 1957501,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '17 - Recomendados/O Catecismo Maior de Westminster.pdf',
    drive_url: 'https://drive.google.com/file/d/14nL60p5-Gs150PAPH904hItyNDRLbFhm/view?usp=drivesdk',
    description: 'Símbolo confessional histórico reformado utilizado como base oficial nos seminários de Ética Cristã (Profª Karoline Evangelista).',
    added_by_name: 'Profª Karoline Evangelista',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'fmb_972b8e205f00',
    title: 'Ética Cristã: Opções e Questões Contemporâneas',
    author: 'Norman L. Geisler (Ed. Vida Nova)',
    category: '11 - Ética Cristã e Bioética',
    size: 8940000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'Ética Cristã/Ética Cristã Geisler.pdf',
    drive_url: 'https://drive.google.com/file/d/1ZVcqg_-YbdKXxjRiRkZ6PP9_2-dPQ47o/view?usp=drivesdk',
    description: '⭐ LIVRO-TEXTO PRINCIPAL: Base bibliográfica da matéria indicada pela Profª Karoline Evangelista.',
    added_by_name: 'Profª Karoline Evangelista',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '1ePjuhGPuMcA_st-CBXOBJ3m3fHe-6kR8',
    title: 'Pecados Espetaculares: E o propósito de Deus para a glória de Cristo',
    author: 'John Piper',
    category: '04 - Teologia Sistemática',
    size: 3420000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'Ética Cristã/Pecados Espetaculares Piper.pdf',
    drive_url: 'https://drive.google.com/file/d/1ePjuhGPuMcA_st-CBXOBJ3m3fHe-6kR8/view?usp=drivesdk',
    description: 'Reflexão teológica e ética sobre a soberania divina em meio a dilemas morais complexos. Recomendado pela Profª Karoline Evangelista.',
    added_by_name: 'Profª Karoline Evangelista',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '1bqPhMnDVckT_V2LYQBu7ctc_vLrY9QDR_1513',
    title: 'Introdução ao Novo Testamento',
    author: 'D. A. Carson, Douglas J. Moo e Leon Morris (Ed. Vida Nova)',
    category: '02 - Exegese e Hermenêutica',
    size: 39212096,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/Introdução ao novo testamento.pdf',
    drive_url: 'https://drive.google.com/file/d/1JHGupwF8vlgKh8NagWGlAsz5Ej54f4bS/view?usp=drivesdk',
    description: '⭐ LIVRO-BASE PRINCIPAL da disciplina Novo Testamento III - Epístolas Gerais (Profº Marcio Leal).',
    added_by_name: 'Profº Marcio Leal',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '1Nq43UDBay4TGJK5Rr90_W6HLCmEoqlLB_2950',
    title: 'A Treliça e a Videira: A mentalidade bíblica para o crescimento da igreja',
    author: 'Colin Marshall e Tony Payne',
    category: '18 - Educação Cristã e Discipulado',
    size: 1756184,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/A TRELIÇA e a Videira.pdf',
    drive_url: 'https://drive.google.com/file/d/1g81Qo58bMpVVBMmLZPddzBzY3VGbiCmk/view?usp=drivesdk',
    description: '⭐ LEITURA E RESUMO OBRIGATÓRIO (AV1 de Plantação e Revitalização de Igrejas II - Profº Thácyto Lessa).',
    added_by_name: 'Profº Thácyto Lessa',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '12BKgg1QOMEjSdOMY6yqKqtic2X4DG8W4',
    title: 'Projeto Videira: Guia de Estudo e Discipulado Prático',
    author: 'Tony Payne e Colin Marshall',
    category: '18 - Educação Cristã e Discipulado',
    size: 2840000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'Plantação e Revitalização de Igrejas II/Projeto Videira Guia de Estudo.pdf',
    drive_url: 'https://drive.google.com/file/d/1wTT7lhGVdoTV7n9B421pzvR6ikC-ktpF/view?usp=drivesdk',
    description: 'Material prático de estudo e aplicação eclesiástica para discipulado intencional. Recomendado pelo Profº Thácyto Lessa.',
    added_by_name: 'Profº Thácyto Lessa',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '1LQfzlgxEDMnJKb4c9NoX26uLK_9pGprT',
    title: 'Projeto Videira: Manual de Implantação e Revitalização Ministerial',
    author: 'Tony Payne e Colin Marshall',
    category: '18 - Educação Cristã e Discipulado',
    size: 4950000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'Plantação e Revitalização de Igrejas II/Projeto Videira Manual.pdf',
    drive_url: 'https://drive.google.com/file/d/1F4b9lZu_F9TE6baD3xRWn1h6sDHJ4YQZ/view?usp=drivesdk',
    description: 'Manual estratégico para pastores e líderes na transformação e revitalização de igrejas locais. Recomendado pelo Profº Thácyto Lessa.',
    added_by_name: 'Profº Thácyto Lessa',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'fmb_45639a77ee6e',
    title: 'Lealdade e Deslealdade: Princípios de Liderança e Caráter no Ministério',
    author: 'Dag Heward-Mills',
    category: '17 - Liderança e Administração Eclesiástica',
    size: 1533907,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/Lealdade e Deslealdade - Dag Heward Mills.pdf',
    drive_url: 'https://drive.google.com/file/d/1LRTD5GvfL2wT1G2zafSnyJOLfW2-999X/view?usp=drivesdk',
    description: 'Princípios de liderança cristã, unidade ministerial e compromisso com o corpo de Cristo. Recomendado pelo Profº Thácyto Lessa.',
    added_by_name: 'Profº Thácyto Lessa',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'fmb_9ea00f102250',
    title: 'Manual e Modelo Estruturado de Projeto de Pesquisa para TCC Teológico',
    author: 'Profª Gabriela Leal / Corpo Docente UIECB',
    category: '01 - Bíblia e Referência',
    size: 1850000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'TCC I/Manual de Projeto TCC UIECB.pdf',
    drive_url: 'https://drive.google.com/file/d/1YxYW8gjofdV-C6YVCEMolo3uUzmZigXV/view?usp=drivesdk',
    description: '⭐ DIRETRIZES OFICIAIS: Modelos de Capa, Sumário, Objetivos no infinitivo, Justificativa e Cronograma ABNT. Recomendado pela Profª Gabriela Leal.',
    added_by_name: 'Profª Gabriela Leal',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'rec-book-cab-almeida',
    title: 'Racismo Estrutural',
    author: 'Silvio Luiz de Almeida',
    category: '14 - Sociologia e Ciências Afins',
    size: 2000000,
    date: '2026-09-02T10:00:00.000Z',
    mime: 'application/pdf',
    path: 'História da Cultura Afro Brasileira e Indígena/Materiais de Consulta/ALMEIDA, Silvio Luiz de. Racismo estrutural. São Paulo; Pólen, 2019.pdf',
    drive_url: 'https://drive.google.com/file/d/16rdpImaEpz6DXn1C8kh0zkZ6URDg1eur/view?usp=drive_link',
    description: 'Obra fundamental de referência acadêmica sobre as bases institucionais, econômicas e históricas do racismo na sociedade brasileira.',
    added_by_name: 'Profº Alexsandro',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'rec-book-cab-piper',
    title: 'O Racismo, a Cruz e o Cristão',
    author: 'John Piper',
    category: '06 - Teologia Prática e Pastoral',
    size: 2700000,
    date: '2026-09-02T10:00:00.000Z',
    mime: 'application/pdf',
    path: 'História da Cultura Afro Brasileira e Indígena/Materiais de Consulta/O Racismo a cruz e o cristão - John Piper.pdf',
    drive_url: 'https://drive.google.com/file/d/1WNjboeBQAMNNtPXaNhbqJgqwoXREGibK/view?usp=drive_link',
    description: 'Tratado teológico e bíblico demonstrando como o Evangelho de Cristo e a obra da Cruz confrontam e superam o preconceito racial e promovem a harmonia étnica no Reino de Deus.',
    added_by_name: 'Profº Alexsandro',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'rec-book-cab-mccaulley',
    title: 'Uma Leitura Negra: Teologia Bíblica e Esperança',
    author: 'Esau McCaulley',
    category: '02 - Exegese e Hermenêutica',
    size: 914000,
    date: '2026-09-02T10:00:00.000Z',
    mime: 'application/pdf',
    path: 'História da Cultura Afro Brasileira e Indígena/Materiais de Consulta/Uma leitura negra - Esau McCaulley.pdf',
    drive_url: 'https://drive.google.com/file/d/1J1uA14oG1VhEi8yKA5_kRO6yBO66zwo4/view?usp=drive_link',
    description: 'Leitura bíblica e exegética a partir da tradição eclesial negra e da fidelidade ao texto sagrado, destacando justiça, reconciliação e esperança cristã.',
    added_by_name: 'Profº Alexsandro',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'rec-book-cab-davi',
    title: 'A Religião Mais Negra do Brasil',
    author: 'Marco Davi de Oliveira',
    category: '08 - História da Igreja',
    size: 583000,
    date: '2026-09-02T10:00:00.000Z',
    mime: 'application/pdf',
    path: 'História da Cultura Afro Brasileira e Indígena/Materiais de Consulta/Marco Davi de Oliveira - A Religiao Mais Negra do Brasil.pdf',
    drive_url: 'https://drive.google.com/file/d/1ZtmufFidRJ6jPD6fSlKMLk9Nyl-qYzgd/view?usp=drive_link',
    description: 'Investigação sociológica e pastoral sobre a adesão e protagonismo da população negra nas igrejas evangélicas e pentecostais do Brasil.',
    added_by_name: 'Profº Alexsandro',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'rec-book-cab-krenak',
    title: 'Ideias Para Adiar o Fim do Mundo',
    author: 'Ailton Krenak',
    category: '14 - Sociologia e Ciências Afins',
    size: 1200000,
    date: '2026-09-02T10:00:00.000Z',
    mime: 'application/pdf',
    path: 'História da Cultura Afro Brasileira e Indígena/Materiais de Consulta/ideias-para-adiar-o-fim-do-mundo.pdf',
    drive_url: 'https://drive.google.com/file/d/1fSt47y2ia1JKjx3F1NAJvuBPotVUVfPM/view?usp=drive_link',
    description: 'Reflexão crítica indígena sobre a relação com a criação, a terra, a preservação ambiental e a diversidade da experiência humana.',
    added_by_name: 'Profº Alexsandro',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'rec-book-cab-conversando',
    title: 'Conversando Sobre o Racismo',
    author: 'Coletânea Teológica e Pastoral',
    category: '14 - Sociologia e Ciências Afins',
    size: 365000,
    date: '2026-09-02T10:00:00.000Z',
    mime: 'application/pdf',
    path: 'História da Cultura Afro Brasileira e Indígena/Materiais de Consulta/44.39-conversando-sobre-o-racismo.pdf',
    drive_url: 'https://drive.google.com/file/d/16BQg9NqMWBa_EkPzfx-TDdkp3FCx1gqj/view?usp=drive_link',
    description: 'Subsídios para debates em grupos de estudo, escolas dominicais e ministérios da igreja local sobre antirracismo e inclusão cristã.',
    added_by_name: 'Profº Alexsandro',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'rec-book-cab-nilma',
    title: 'Movimento Negro Educador: Saberes Construídos nas Lutas por Emancipação',
    author: 'Nilma Lino Gomes',
    category: '14 - Sociologia e Ciências Afins',
    size: 292000,
    date: '2026-09-02T10:00:00.000Z',
    mime: 'application/pdf',
    path: 'História da Cultura Afro Brasileira e Indígena/Materiais de Consulta/Movimento Negro Educador.pdf',
    drive_url: 'https://drive.google.com/file/d/1tcN9qxToyDwmH926LTI6lqNgoNuEg_kO/view?usp=drive_link',
    description: 'Estudo pedagógico sobre a produção de saberes e práticas emancipatórias da comunidade negra e suas contribuições para a educação nacional.',
    added_by_name: 'Profº Alexsandro',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'rec-book-cab-indio',
    title: 'O Índio Brasileiro: O Que Você Precisa Saber Sobre os Povos Indígenas',
    author: 'FUNAI / Ministério da Justiça',
    category: '14 - Sociologia e Ciências Afins',
    size: 4600000,
    date: '2026-09-02T10:00:00.000Z',
    mime: 'application/pdf',
    path: 'História da Cultura Afro Brasileira e Indígena/Materiais de Consulta/O indio brasileiro.pdf',
    drive_url: 'https://drive.google.com/file/d/14EJi7_sbCY3SrV-jw8DDg-Ua1IMoKAFg/view?usp=drive_link',
    description: 'Panorama histórico, cultural, geográfico e jurídico dos povos originários no Brasil contemporâneo.',
    added_by_name: 'Profº Alexsandro',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'rec-book-cab-mec',
    title: 'Resolução CNE/CP Nº 4/2016 — Obrigatoriedade e Diretrizes Étnico-Raciais',
    author: 'Conselho Nacional de Educação / MEC',
    category: '14 - Sociologia e Ciências Afins',
    size: 131000,
    date: '2026-09-02T10:00:00.000Z',
    mime: 'application/pdf',
    path: 'História da Cultura Afro Brasileira e Indígena/Materiais de Consulta/Resolução 4 MEC 2016 obrigatoriedade.pdf',
    drive_url: 'https://drive.google.com/file/d/1fxdFMBZCGFhPFRTYp9jUnsC2oqdAXG86/view?usp=drive_link',
    description: 'Marco regulatório oficial que fundamenta a obrigatoriedade da temática da história e cultura afro-brasileira e indígena na formação superior.',
    added_by_name: 'Profº Alexsandro',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'rec-book-cab-plano',
    title: 'Plano de Curso Oficial (UIECB) — História e Cultura Afro-Brasileira e Indígena',
    author: 'Profº Alexsandro / UIECB',
    category: '01 - Bíblia e Referência',
    size: 150000,
    date: '2026-09-07T10:00:00.000Z',
    mime: 'application/pdf',
    path: 'História da Cultura Afro Brasileira e Indígena/Plano_de_Curso_Historia_e_Cultura_Afro_Brasileira_e_Indigena_UIECB.pdf',
    drive_url: 'https://drive.google.com/file/d/1SRp2jrhskT_7UGdYNHHjFr-0MZieEAts/view?usp=drive_link',
    description: 'Ementa oficial, metodologia do módulo de 4 aulas, cronograma e instruções da avaliação final.',
    added_by_name: 'Profº Alexsandro',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'rec-book-cab-slides',
    title: 'Slides Oficiais das Aulas (UIECB) — História e Cultura Afro-Brasileira e Indígena',
    author: 'Profº Alexsandro',
    category: '01 - Bíblia e Referência',
    size: 1300000,
    date: '2026-09-07T10:00:00.000Z',
    mime: 'application/pdf',
    path: 'História da Cultura Afro Brasileira e Indígena/SLIDES_Historia_e_Cultura_Afro_Brasileira_e_Indigena_UIECB.pdf',
    drive_url: 'https://drive.google.com/file/d/1YxNvCVH0uksr63Ct-dZJ3Xcd1Zyd523S/view?usp=drive_link',
    description: 'Slides expositivos das 4 videoaulas modulares ministradas pelo docente.',
    added_by_name: 'Profº Alexsandro',
    added_by_role: 'professor',
    is_custom: false,
  },
];

// Montagem inicial unificada: inicia com obras recomendadas oficiais e enriquece sob demanda via API
const baseBooksMap = new Map<string, BibliotecaBook>();

// Inserir inicialmente as recomendações do corpo docente
PROFESSOR_RECOMMENDED_LIBRARY_BOOKS.forEach((rec) => {
  baseBooksMap.set(rec.id, {
    ...rec,
    in_library: true,
    is_available: true,
  });
});

let isFetchingApiBooks = false;
let apiBooksLoaded = false;

/**
 * Busca o acervo completo da Biblioteca Digital via API Route /api/biblioteca
 * sem embutir 4.9 MB de JSON no bundle estático do cliente
 */
export async function fetchBibliotecaBooksFromApi(): Promise<BibliotecaBook[]> {
  if (apiBooksLoaded) {
    return Array.from(baseBooksMap.values());
  }
  if (isFetchingApiBooks) {
    return Array.from(baseBooksMap.values());
  }

  isFetchingApiBooks = true;
  try {
    const res = await fetch('/api/biblioteca?limit=all');
    if (!res.ok) throw new Error('Falha ao carregar catálogo da biblioteca');
    const data = await res.json();
    if (data && data.success && Array.isArray(data.books)) {
      data.books.forEach((book: BibliotecaBook) => {
        if (!baseBooksMap.has(book.id)) {
          baseBooksMap.set(book.id, book);
        } else {
          const existing = baseBooksMap.get(book.id)!;
          baseBooksMap.set(book.id, {
            ...book,
            description: existing.description || book.description,
            added_by_name: existing.added_by_name || book.added_by_name,
            added_by_role: existing.added_by_role || book.added_by_role,
          });
        }
      });
      apiBooksLoaded = true;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lms_biblioteca_updated'));
      }
    }
  } catch (err) {
    console.warn('[Biblioteca] Erro ao carregar acervo remoto:', err);
  } finally {
    isFetchingApiBooks = false;
  }
  return Array.from(baseBooksMap.values());
}

/**
 * Retorna URLs sobrescritas para livros padrão
 */
export function getBookOverrides(): Record<string, { drive_url?: string; title?: string }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(OVERRIDDEN_DRIVE_URLS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Atualiza o link do Google Drive de qualquer livro no acervo
 */
export function updateBookDriveUrl(bookId: string, driveUrl: string): void {
  updateBibliotecaBook(bookId, { drive_url: driveUrl });
}

/**
 * Atualiza dados completos de um livro (título, autor, descrição, capa, link, categoria)
 */
export function updateBibliotecaBook(
  bookId: string,
  updatedData: Partial<BibliotecaBook>
): void {
  if (typeof window === 'undefined') return;
  try {
    // Se for custom
    const custom = getCustomBooks();
    const customIndex = custom.findIndex((b) => b.id === bookId);
    if (customIndex >= 0) {
      custom[customIndex] = { ...custom[customIndex], ...updatedData };
      saveCustomBooks(custom);
      return;
    }

    // Se for livro base
    const overrides = getBookOverrides();
    overrides[bookId] = { ...(overrides[bookId] || {}), ...updatedData };
    localStorage.setItem(OVERRIDDEN_DRIVE_URLS_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent('lms_biblioteca_updated'));
  } catch (e) {
    console.error('Erro ao atualizar livro:', e);
  }
}

/**
 * Retorna todos os livros customizados adicionados por usuários (professores, monitores e admins)
 */
export function getCustomBooks(): BibliotecaBook[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_BOOKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Erro ao ler livros customizados:', e);
    return [];
  }
}

/**
 * Salva a lista de livros customizados no localStorage e dispara evento reativo
 */
export function saveCustomBooks(list: BibliotecaBook[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_BOOKS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('lms_biblioteca_updated', { detail: list }));
  } catch (e) {
    console.error('Erro ao salvar livros customizados:', e);
  }
}

/**
 * Retorna todos os livros do acervo (Livros customizados + Livros base recomendados e catalogados)
 */
export function getAllBibliotecaBooks(): BibliotecaBook[] {
  const custom = getCustomBooks();
  const overrides = getBookOverrides();
  const mergedBase = Array.from(baseBooksMap.values()).map((b) => {
    if (overrides[b.id]) {
      return { ...b, ...overrides[b.id] };
    }
    return b;
  });
  return [...custom, ...mergedBase];
}

/**
 * Adiciona um novo livro ao acervo da Biblioteca Digital
 */
export function addCustomBook(
  book: Omit<BibliotecaBook, 'id' | 'created_at' | 'is_custom'>
): BibliotecaBook {
  let fileId = `custom-book-${Date.now()}`;
  
  // Se for um link do Google Drive, tenta extrair o ID do arquivo para manter compatibilidade
  if (book.drive_url) {
    const driveMatch = book.drive_url.match(/\/d\/([a-zA-Z0-9_-]+)/) || book.drive_url.match(/id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      fileId = driveMatch[1];
    }
  }

  const newBook: BibliotecaBook = {
    ...book,
    id: fileId,
    is_custom: true,
    created_at: new Date().toISOString(),
  };

  const currentCustom = getCustomBooks();
  const updated = [newBook, ...currentCustom];
  saveCustomBooks(updated);
  return newBook;
}

/**
 * Remove um livro customizado do acervo
 */
export function deleteCustomBook(id: string): void {
  const currentCustom = getCustomBooks();
  const updated = currentCustom.filter((b) => b.id !== id);
  saveCustomBooks(updated);
}

const CUSTOM_CATEGORIES_STORAGE_KEY = 'lms_custom_categories_v1';

/**
 * Retorna todas as categorias customizadas cadastradas pelo usuário
 */
export function getCustomCategories(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Erro ao ler categorias customizadas:', e);
    return [];
  }
}

/**
 * Cadastra e persiste uma nova categoria no localStorage e notifica os ouvintes
 */
export function saveCustomCategory(category: string): string[] {
  if (typeof window === 'undefined' || !category || !category.trim()) return getCustomCategories();
  const trimmed = category.trim();
  const current = getCustomCategories();
  if (!current.includes(trimmed)) {
    const updated = [...current, trimmed];
    try {
      localStorage.setItem(CUSTOM_CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('lms_biblioteca_updated'));
    } catch (e) {
      console.error('Erro ao salvar categoria customizada:', e);
    }
    return updated;
  }
  return current;
}

/**
 * Remove uma categoria customizada
 */
export function deleteCustomCategory(category: string): void {
  if (typeof window === 'undefined') return;
  const current = getCustomCategories();
  const updated = current.filter((c) => c !== category);
  localStorage.setItem(CUSTOM_CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('lms_biblioteca_updated'));
}

/**
 * Lista curada de categorias teológicas e ministeriais recomendadas para o acervo do Seminário
 */
export const DEFAULT_BIBLIOTECA_CATEGORIES: string[] = [
  '01 - Bíblia e Referência',
  '02 - Exegese e Hermenêutica',
  '03 - Comentários Bíblicos',
  '04 - Teologia Sistemática',
  '05 - Teologia Bíblica',
  '06 - Teologia Histórica e Patrística',
  '07 - Teologia Pastoral e Pregação',
  '08 - Missões e Evangelismo',
  '09 - Vida Cristã e Espiritualidade',
  '10 - Apologética e Filosofia',
  '11 - Ética Cristã e Bioética',
  '12 - História das Religiões e Seitas',
  '13 - Doutrinas Específicas',
  '14 - Sociologia e Ciências Afins',
  '15 - Homilética e Oratória Sacra',
  '16 - Aconselhamento Bíblico e Cuidado da Alma',
  '17 - Liderança e Administração Eclesiástica',
  '18 - Educação Cristã e Discipulado',
  '19 - Línguas Bíblicas (Hebraico, Grego e Aramaico)',
  '20 - Arqueologia, Geografia e Cultura Bíblica',
  '21 - História do Congregacionalismo e Tradição Reformada',
  '22 - Louvor, Adoração e Hinologia Sacra',
  '23 - Escatologia Bíblica',
  '24 - Teologia Contemporânea e Pós-Modernidade',
];

/**
 * Retorna as categorias disponíveis (mesclando categorias padrão sugeridas, livros do catálogo e categorias customizadas)
 */
export function getBibliotecaCategories(): string[] {
  const all = getAllBibliotecaBooks();
  const customCats = getCustomCategories();
  const rawCats = Array.from(
    new Set([
      ...DEFAULT_BIBLIOTECA_CATEGORIES,
      ...all.map((b) => b.category),
      ...customCats
    ])
  ).filter(Boolean);

  return rawCats.sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' }));
}
