import { BibliotecaBook } from '@/types';
import rawBooksData from '@/lib/bibliotecaData.json';

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
    id: '18-whatsapp-declaracao-de-fe-congre',
    title: 'Declaração de Fé da UIECB: Princípios e Doutrinas Congregacionais',
    author: 'União das Igrejas Evangélicas Congregacionais do Brasil (UIECB)',
    category: '21 - História do Congregacionalismo e Tradição Reformada',
    size: 1244947,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/LIVRETO - DECLARAÇÃO DE FÉ.pdf',
    drive_url: 'https://drive.google.com/open?id=19Y8Nv2Yvx1V-m4E5y5fUWOo5e8DZzeji&usp=drive_copy',
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
    id: '18-whatsapp-missao-de-deus',
    title: 'A Missão de Deus: Revelando o plano redentor das Escrituras',
    author: 'Christopher J. H. Wright',
    category: '08 - Missões e Evangelismo',
    size: 2950430,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/A MISSÃO de DEUS.pdf',
    drive_url: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy',
    description: 'Obra referencial sobre a teologia bíblica da missão de Deus ao longo do cânon bíblico. Recomendado pelo Profº Hilário Bispo.',
    added_by_name: 'Profº Hilário Bispo',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18-whatsapp-missao-do-povo-de-deus',
    title: 'A Missão do Povo de Deus: Uma teologia bíblica da missão da Igreja',
    author: 'Christopher J. H. Wright',
    category: '08 - Missões e Evangelismo',
    size: 8926696,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/A MISSÃO do POVO de DEUS.pdf',
    drive_url: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy',
    description: 'Visão bíblica profunda sobre o chamado, a identidade e a missão do povo de Deus no mundo. Recomendado pelo Profº Hilário Bispo.',
    added_by_name: 'Profº Hilário Bispo',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18-whatsapp-puritanos-origens-e-sucessores-lloyd-jones',
    title: 'Os Puritanos: Suas Origens e Seus Sucessores',
    author: 'D. Martyn Lloyd-Jones',
    category: '06 - Teologia Histórica e Patrística',
    size: 5840000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'História do Pensamento Cristão II/Os Puritanos Lloyd Jones.pdf',
    drive_url: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy',
    description: 'Coletânea magistral de conferências puritanas e história reformada recomendada pelo Profº Hilário Bispo.',
    added_by_name: 'Profº Hilário Bispo',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18-whatsapp-santos-no-mundo-ryken',
    title: 'Santos no Mundo: Os Puritanos como Realmente Eram',
    author: 'Leland Ryken',
    category: '06 - Teologia Histórica e Patrística',
    size: 4720000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'História do Pensamento Cristão II/Santos no Mundo Leland Ryken.pdf',
    drive_url: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy',
    description: 'Exame histórico e teológico sobre a influência puritana na cosmovisão e ética cristã. Recomendado pelo Profº Hilário Bispo.',
    added_by_name: 'Profº Hilário Bispo',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18-whatsapp-livro-dos-martires',
    title: 'O Livro dos Mártires: História das Perseguições e do Testemunho Cristão',
    author: 'John Foxe',
    category: '06 - Teologia Histórica e Patrística',
    size: 14200000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/O Livro dos Mártires.pdf',
    drive_url: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy',
    description: 'Monumento histórico do martírio e da perseverança cristã desde a igreja primitiva até a Reforma. Recomendado pelo Profº Hilário Bispo.',
    added_by_name: 'Profº Hilário Bispo',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18-whatsapp-ego-transformado',
    title: 'Ego Transformado: A verdadeira humildade cristã',
    author: 'Timothy Keller',
    category: '16 - Aconselhamento Bíblico e Cuidado da Alma',
    size: 934820,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/Ego Transformado.pdf',
    drive_url: 'https://drive.google.com/open?id=1BUr0R4pLQjTt01ID8XjYKIBlZhAtaWcx&usp=drive_copy',
    description: '⭐ LEITURA OBRIGATÓRIA em Aconselhamento Bíblico II (Profº Uilian Santos) para autoconhecimento e maturidade.',
    added_by_name: 'Profº Uilian Santos',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18-whatsapp-lutero-como-conselheiro-espiritual',
    title: 'Lutero como Conselheiro Espiritual: Cartas de Conforto e Cuidado Pastoral',
    author: 'Theodore G. Tappert / Martinho Lutero',
    category: '16 - Aconselhamento Bíblico e Cuidado da Alma',
    size: 2140643,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/Lutero Como Conselheiro Espiritual.pdf',
    drive_url: 'https://drive.google.com/open?id=1BUr0R4pLQjTt01ID8XjYKIBlZhAtaWcx&usp=drive_copy',
    description: 'Cartas e orientações pastorais de Lutero para o tratamento espiritual de ansiedade, tentação e luto. Recomendado pelo Profº Uilian Santos.',
    added_by_name: 'Profº Uilian Santos',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18-whatsapp-aconselhamento-cristao-collins',
    title: 'Aconselhamento Cristão: Depressão, Ansiedade, Crises e Suicídio',
    author: 'Gary R. Collins',
    category: '16 - Aconselhamento Bíblico e Cuidado da Alma',
    size: 23152869,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/ACONSELHAMENTO CRISTÃO.pdf',
    drive_url: 'https://drive.google.com/open?id=1BUr0R4pLQjTt01ID8XjYKIBlZhAtaWcx&usp=drive_copy',
    description: 'Manual abrangente para conselheiros pastorais em situações críticas e emocionais profundas. Recomendado pelo Profº Uilian Santos.',
    added_by_name: 'Profº Uilian Santos',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18-whatsapp-aconselhamento-a-partir-da-cruz',
    title: 'Aconselhamento a partir da Cruz: O power do evangelho no cuidado das almas',
    author: 'Elyse M. Fitzpatrick e Dennis E. Johnson',
    category: '16 - Aconselhamento Bíblico e Cuidado da Alma',
    size: 4197918,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/Aconselhamento a partir da cruz.pdf',
    drive_url: 'https://drive.google.com/open?id=1BUr0R4pLQjTt01ID8XjYKIBlZhAtaWcx&usp=drive_copy',
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
    id: '18-whatsapp-catecismo-maior-westminster-comentado',
    title: 'Catecismo Maior de Westminster Comentado: Exposição Doutrinária',
    author: 'Johannes G. Vos / Assembleia de Westminster',
    category: '04 - Teologia Sistemática',
    size: 9386158,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/Catecismo Maior Westminster Comentado.pdf',
    drive_url: 'https://drive.google.com/open?id=1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC&usp=drive_copy',
    description: '⭐ BASE OFICIAL DOS SEMINÁRIOS: Exposição detalhada dos Dez Mandamentos para os seminários de Ética Cristã (Profª Karoline Evangelista).',
    added_by_name: 'Profª Karoline Evangelista',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18-whatsapp-catecismo-maior-westminster-oficial',
    title: 'O Catecismo Maior de Westminster: Texto Oficial e Exposição dos Dez Mandamentos',
    author: 'Assembleia de Westminster (1647)',
    category: '04 - Teologia Sistemática',
    size: 1957501,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/O CATECISMO MAIOR DE WESTMINSTER.pdf',
    drive_url: 'https://drive.google.com/open?id=1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC&usp=drive_copy',
    description: 'Símbolo confessional histórico reformado utilizado como base oficial nos seminários de Ética Cristã (Profª Karoline Evangelista).',
    added_by_name: 'Profª Karoline Evangelista',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18-whatsapp-etica-crista-geisler',
    title: 'Ética Cristã: Opções e Questões Contemporâneas',
    author: 'Norman L. Geisler (Ed. Vida Nova)',
    category: '11 - Ética Cristã e Bioética',
    size: 8940000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'Ética Cristã/Ética Cristã Geisler.pdf',
    drive_url: 'https://drive.google.com/open?id=1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC&usp=drive_copy',
    description: '⭐ LIVRO-TEXTO PRINCIPAL: Base bibliográfica da matéria indicada pela Profª Karoline Evangelista.',
    added_by_name: 'Profª Karoline Evangelista',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18-whatsapp-pecados-espetaculares-piper',
    title: 'Pecados Espetaculares: E o propósito de Deus para a glória de Cristo',
    author: 'John Piper',
    category: '04 - Teologia Sistemática',
    size: 3420000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'Ética Cristã/Pecados Espetaculares Piper.pdf',
    drive_url: 'https://drive.google.com/open?id=1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC&usp=drive_copy',
    description: 'Reflexão teológica e ética sobre a soberania divina em meio a dilemas morais complexos. Recomendado pela Profª Karoline Evangelista.',
    added_by_name: 'Profª Karoline Evangelista',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18-whatsapp-introducao-ao-novo-testamento-carson',
    title: 'Introdução ao Novo Testamento',
    author: 'D. A. Carson, Douglas J. Moo e Leon Morris (Ed. Vida Nova)',
    category: '02 - Exegese e Hermenêutica',
    size: 39212096,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/Introdução ao novo testamento.pdf',
    drive_url: 'https://drive.google.com/open?id=1ppsv5caJVbHw-1RwhHu8nxBmqFT9Wm9P&usp=drive_copy',
    description: '⭐ LIVRO-BASE PRINCIPAL da disciplina Novo Testamento III - Epístolas Gerais (Profº Marcio Leal).',
    added_by_name: 'Profº Marcio Leal',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18-whatsapp-trelica-e-a-videira',
    title: 'A Treliça e a Videira: A mentalidade bíblica para o crescimento da igreja',
    author: 'Colin Marshall e Tony Payne',
    category: '18 - Educação Cristã e Discipulado',
    size: 1756184,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/A TRELIÇA e a Videira.pdf',
    drive_url: 'https://drive.google.com/open?id=1nzXIDnWvvrxSgXQULaSvDGdVr32L_xP8&usp=drive_copy',
    description: '⭐ LEITURA E RESUMO OBRIGATÓRIO (AV1 de Plantação e Revitalização de Igrejas II - Profº Thácyto Lessa).',
    added_by_name: 'Profº Thácyto Lessa',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18-whatsapp-projeto-videira-guia-estudo',
    title: 'Projeto Videira: Guia de Estudo e Discipulado Prático',
    author: 'Tony Payne e Colin Marshall',
    category: '18 - Educação Cristã e Discipulado',
    size: 2840000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'Plantação e Revitalização de Igrejas II/Projeto Videira Guia de Estudo.pdf',
    drive_url: 'https://drive.google.com/open?id=1nzXIDnWvvrxSgXQULaSvDGdVr32L_xP8&usp=drive_copy',
    description: 'Material prático de estudo e aplicação eclesiástica para discipulado intencional. Recomendado pelo Profº Thácyto Lessa.',
    added_by_name: 'Profº Thácyto Lessa',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18-whatsapp-projeto-videira-manual',
    title: 'Projeto Videira: Manual de Implantação e Revitalização Ministerial',
    author: 'Tony Payne e Colin Marshall',
    category: '18 - Educação Cristã e Discipulado',
    size: 4950000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'Plantação e Revitalização de Igrejas II/Projeto Videira Manual.pdf',
    drive_url: 'https://drive.google.com/open?id=1nzXIDnWvvrxSgXQULaSvDGdVr32L_xP8&usp=drive_copy',
    description: 'Manual estratégico para pastores e líderes na transformação e revitalização de igrejas locais. Recomendado pelo Profº Thácyto Lessa.',
    added_by_name: 'Profº Thácyto Lessa',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18-whatsapp-lealdade-e-deslealdade',
    title: 'Lealdade e Deslealdade: Princípios de Liderança e Caráter no Ministério',
    author: 'Dag Heward-Mills',
    category: '17 - Liderança e Administração Eclesiástica',
    size: 1533907,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: '18 - WhatsApp Seminário/Lealdade e Deslealdade - Dag Heward Mills.pdf',
    drive_url: 'https://drive.google.com/open?id=1nzXIDnWvvrxSgXQULaSvDGdVr32L_xP8&usp=drive_copy',
    description: 'Princípios de liderança cristã, unidade ministerial e compromisso com o corpo de Cristo. Recomendado pelo Profº Thácyto Lessa.',
    added_by_name: 'Profº Thácyto Lessa',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: '18-whatsapp-tcc-projeto-diretrizes',
    title: 'Manual e Modelo Estruturado de Projeto de Pesquisa para TCC Teológico',
    author: 'Profª Gabriela Leal / Corpo Docente UIECB',
    category: '01 - Bíblia e Referência',
    size: 1850000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'TCC I/Manual de Projeto TCC UIECB.pdf',
    drive_url: 'https://drive.google.com/open?id=1f-9i-TpqaZhzoLyrxg6flM6CHTsAOWPj&usp=drive_copy',
    description: '⭐ DIRETRIZES OFICIAIS: Modelos de Capa, Sumário, Objetivos no infinitivo, Justificativa e Cronograma ABNT. Recomendado pela Profª Gabriela Leal.',
    added_by_name: 'Profª Gabriela Leal',
    added_by_role: 'professor',
    is_custom: false,
  },
  {
    id: 'rec-book-cab-1',
    title: 'Coletânea de Textos Étnico-Raciais e Cultura Indígena no Brasil',
    author: 'Profº Emerson Silva (Org.)',
    category: '14 - Sociologia e Ciências Afins',
    size: 3890000,
    date: '2026-08-25T20:00:00.000Z',
    mime: 'application/pdf',
    path: 'História da Cultura Afro Brasileira e Indígena/Coletânea de Textos.pdf',
    drive_url: 'https://drive.google.com/open?id=13vp8jOcvdtH13O2iauyvsaTCw7DwiPIa&usp=drive_copy',
    description: 'Textos, artigos e leis que fundamentam o debate sobre etnia, fé e história nacional. Recomendado pelo Profº Emerson Silva.',
    added_by_name: 'Profº Emerson Silva',
    added_by_role: 'professor',
    is_custom: false,
  },
];

// Livros padrão carregados do JSON estático (acervo real indexado da pasta FMB no Google Drive)
const rawBaseBooks: BibliotecaBook[] = (rawBooksData as BibliotecaBook[]).map((b) => ({
  ...b,
  is_custom: false,
  in_library: true,
  is_available: true,
}));

// Montagem inicial unificada: a verdade absoluta do acervo é estritamente os livros reais com PDF
const baseBooksMap = new Map<string, BibliotecaBook>();

// 1. Inserir todos os livros reais do acervo
rawBaseBooks.forEach((book) => {
  baseBooksMap.set(book.id, book);
});

// 2. Cruzar com recomendações dos professores:
// Se a obra recomendada EXISTE no acervo real, enriquece a descrição e autoria sem sobrescrever o link do PDF!
// Se a obra recomendada NÃO existe no acervo real, NÃO é inserida no acervo da biblioteca (evita falsos positivos).
PROFESSOR_RECOMMENDED_LIBRARY_BOOKS.forEach((rec) => {
  const normRecTitle = (rec.title || '').toLowerCase().trim();
  
  // Procura no acervo real por ID ou Título aproximado
  let matchedBook: BibliotecaBook | undefined;
  for (const book of baseBooksMap.values()) {
    if (book.id === rec.id || book.id === rec.drive_url) {
      matchedBook = book;
      break;
    }
    const normBookTitle = (book.title || '').toLowerCase().trim();
    if (normBookTitle === normRecTitle || (normRecTitle.length > 8 && normBookTitle.includes(normRecTitle))) {
      matchedBook = book;
      break;
    }
  }

  if (matchedBook) {
    // Atualiza o livro real com as anotações do professor, preservando o drive_url real do PDF
    baseBooksMap.set(matchedBook.id, {
      ...matchedBook,
      description: rec.description || matchedBook.description,
      added_by_name: rec.added_by_name || matchedBook.added_by_name,
      added_by_role: rec.added_by_role || matchedBook.added_by_role,
      in_library: true,
      is_available: true,
    });
  }
  // Se não encontrou no acervo, NÃO insere na biblioteca digital!
});

// Extrair lista final dos livros efetivamente disponíveis no acervo
const baseBooks: BibliotecaBook[] = Array.from(baseBooksMap.values());

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
  const mergedBase = baseBooks.map((b) => {
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
