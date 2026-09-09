import { LivroRecomendadoDisciplina } from '@/types';

export const INITIAL_LIVROS_RECOMENDADOS: LivroRecomendadoDisciplina[] = [
  // ==========================================
  // HISTÓRIA DO CONGREGACIONALISMO (disc-1)
  // ==========================================
  {
    id: 'livro-his-1',
    disciplina_id: 'disc-1',
    disciplina_name: 'História do Congregacionalismo',
    book_title: 'Congregacionalismo: origens e contribuições sociais da democracia protestante',
    book_author: 'Pastor Hidauro Campos',
    book_url: 'https://drive.google.com/open?id=19Y8Nv2Yvx1V-m4E5y5fUWOo5e8DZzeji&usp=drive_copy',
    category: '21 - História do Congregacionalismo e Tradição Reformada',
    notes: 'Indicação literária oficial do Profº Ary Júnior. Trata das origens e raízes da democracia congregacional.',
    added_by_name: 'Profº Ary Júnior',
    added_by_role: 'professor',
    created_at: '2026-08-11T10:00:00Z',
  },
  {
    id: 'livro-his-2',
    disciplina_id: 'disc-1',
    disciplina_name: 'História do Congregacionalismo',
    book_title: 'Declaração de Fé da UIECB: Princípios e Doutrinas Congregacionais',
    book_author: 'União das Igrejas Evangélicas Congregacionais do Brasil (UIECB)',
    book_url: 'https://drive.google.com/open?id=19Y8Nv2Yvx1V-m4E5y5fUWOo5e8DZzeji&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-declaracao-de-fe-congre',
    category: '21 - História do Congregacionalismo e Tradição Reformada',
    notes: 'Documento oficial com os 28 artigos de fé das Igrejas Evangélicas Congregacionais do Brasil.',
    added_by_name: 'Profº Ary Júnior',
    added_by_role: 'professor',
    created_at: '2026-08-11T10:10:00Z',
  },
  {
    id: 'livro-his-3',
    disciplina_id: 'disc-1',
    disciplina_name: 'História do Congregacionalismo',
    book_title: 'História dos Congregacionais no Brasil',
    book_author: 'Salomão Ginsburg / Arquivo UIECB',
    book_url: 'https://drive.google.com/open?id=19Y8Nv2Yvx1V-m4E5y5fUWOo5e8DZzeji&usp=drive_copy',
    category: '21 - História do Congregacionalismo e Tradição Reformada',
    notes: 'Bibliografia base para o estudo da Unidade 2 (Vertente Congregacional Brasileira).',
    added_by_name: 'Profº Ary Júnior',
    added_by_role: 'professor',
    created_at: '2026-08-11T10:15:00Z',
  },

  // ==========================================
  // HISTÓRIA DO PENSAMENTO CRISTÃO II (disc-2)
  // ==========================================
  {
    id: 'livro-hpc-1',
    disciplina_id: 'disc-2',
    disciplina_name: 'História do Pensamento Cristão II',
    book_title: 'A Missão de Deus: Revelando o plano redentor das Escrituras',
    book_author: 'Christopher J. H. Wright',
    book_url: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-missao-de-deus',
    category: '08 - Missões e Evangelismo',
    notes: 'Obra recomendada pelo Profº Hilário Bispo para aprofundamento na teologia bíblica da missão.',
    added_by_name: 'Profº Hilário Bispo',
    added_by_role: 'professor',
    created_at: '2026-08-11T11:00:00Z',
  },
  {
    id: 'livro-hpc-2',
    disciplina_id: 'disc-2',
    disciplina_name: 'História do Pensamento Cristão II',
    book_title: 'A Missão do Povo de Deus: Uma teologia bíblica da missão da Igreja',
    book_author: 'Christopher J. H. Wright',
    book_url: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-missao-do-povo-de-deus',
    category: '08 - Missões e Evangelismo',
    notes: 'Visão bíblica sobre o chamado e a identidade da Igreja no mundo moderno.',
    added_by_name: 'Profº Hilário Bispo',
    added_by_role: 'professor',
    created_at: '2026-08-11T11:05:00Z',
  },
  {
    id: 'livro-hpc-3',
    disciplina_id: 'disc-2',
    disciplina_name: 'História do Pensamento Cristão II',
    book_title: 'Os Puritanos: Suas Origens e Seus Sucessores',
    book_author: 'D. Martyn Lloyd-Jones',
    book_url: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-puritanos-origens-e-sucessores-lloyd-jones',
    category: '06 - Teologia Histórica e Patrística',
    notes: 'Coletânea magistral de conferências puritanas e história reformada recomendada pelo Profº Hilário Bispo.',
    added_by_name: 'Profº Hilário Bispo',
    added_by_role: 'professor',
    created_at: '2026-08-11T11:10:00Z',
  },
  {
    id: 'livro-hpc-4',
    disciplina_id: 'disc-2',
    disciplina_name: 'História do Pensamento Cristão II',
    book_title: 'Santos no Mundo: Os Puritanos como Realmente Eram',
    book_author: 'Leland Ryken',
    book_url: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-santos-no-mundo-ryken',
    category: '06 - Teologia Histórica e Patrística',
    notes: 'Exame histórico e teológico sobre a influência puritana na cosmovisão e ética cristã.',
    added_by_name: 'Profº Hilário Bispo',
    added_by_role: 'professor',
    created_at: '2026-08-11T11:15:00Z',
  },
  {
    id: 'livro-hpc-5',
    disciplina_id: 'disc-2',
    disciplina_name: 'História do Pensamento Cristão II',
    book_title: 'O Livro dos Mártires: História das Perseguições e do Testemunho Cristão',
    book_author: 'John Foxe',
    book_url: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-livro-dos-martires',
    category: '06 - Teologia Histórica e Patrística',
    notes: 'Monumento histórico do martírio e da perseverança cristã desde a igreja primitiva até a Reforma.',
    added_by_name: 'Profº Hilário Bispo',
    added_by_role: 'professor',
    created_at: '2026-08-11T11:20:00Z',
  },

  // ==========================================
  // ACONSELHAMENTO BÍBLICO II (disc-3)
  // ==========================================
  {
    id: 'livro-aco-1',
    disciplina_id: 'disc-3',
    disciplina_name: 'Aconselhamento Bíblico II',
    book_title: 'Ego Transformado: A verdadeira humildade cristã',
    book_author: 'Timothy Keller',
    book_url: 'https://drive.google.com/open?id=1BUr0R4pLQjTt01ID8XjYKIBlZhAtaWcx&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-ego-transformado',
    is_mandatory: true,
    category: '16 - Aconselhamento Bíblico e Cuidado da Alma',
    notes: '⭐ LEITURA OBRIGATÓRIA: Exigido pelo Profº Uilian Santos para amadurecimento teológico e autoconhecimento dos conselheiros.',
    added_by_name: 'Profº Uilian Santos',
    added_by_role: 'professor',
    created_at: '2026-08-12T10:00:00Z',
  },
  {
    id: 'livro-aco-2',
    disciplina_id: 'disc-3',
    disciplina_name: 'Aconselhamento Bíblico II',
    book_title: 'Lutero como Conselheiro Espiritual: Cartas de Conforto e Cuidado Pastoral',
    book_author: 'Theodore G. Tappert / Martinho Lutero',
    book_url: 'https://drive.google.com/open?id=1BUr0R4pLQjTt01ID8XjYKIBlZhAtaWcx&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-lutero-como-conselheiro-espiritual',
    category: '16 - Aconselhamento Bíblico e Cuidado da Alma',
    notes: 'Obra recomendada pelo Profº Uilian Santos sobre o cuidado pastoral e conforto de almas em crise.',
    added_by_name: 'Profº Uilian Santos',
    added_by_role: 'professor',
    created_at: '2026-08-12T10:15:00Z',
  },
  {
    id: 'livro-aco-3',
    disciplina_id: 'disc-3',
    disciplina_name: 'Aconselhamento Bíblico II',
    book_title: 'Aconselhamento Cristão: Depressão, Ansiedade, Crises e Suicídio',
    book_author: 'Gary R. Collins',
    book_url: 'https://drive.google.com/open?id=1BUr0R4pLQjTt01ID8XjYKIBlZhAtaWcx&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-aconselhamento-cristao-collins',
    category: '16 - Aconselhamento Bíblico e Cuidado da Alma',
    notes: 'Clássico fundamental recomendado pelo Profº Uilian Santos para intervenção em crises emocionais e depressão.',
    added_by_name: 'Profº Uilian Santos',
    added_by_role: 'professor',
    created_at: '2026-08-12T10:30:00Z',
  },
  {
    id: 'livro-aco-4',
    disciplina_id: 'disc-3',
    disciplina_name: 'Aconselhamento Bíblico II',
    book_title: 'Aconselhamento a partir da Cruz: O poder do evangelho no cuidado das almas',
    book_author: 'Elyse M. Fitzpatrick e Dennis E. Johnson',
    book_url: 'https://drive.google.com/open?id=1BUr0R4pLQjTt01ID8XjYKIBlZhAtaWcx&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-aconselhamento-a-partir-da-cruz',
    category: '16 - Aconselhamento Bíblico e Cuidado da Alma',
    notes: 'Obra recomendada sobre a aplicação da graça do evangelho no ministério de aconselhamento bíblico.',
    added_by_name: 'Profº Uilian Santos',
    added_by_role: 'professor',
    created_at: '2026-08-12T10:45:00Z',
  },

  // ==========================================
  // DIREITOS HUMANOS (disc-4)
  // ==========================================
  {
    id: 'livro-dir-1',
    disciplina_id: 'disc-4',
    disciplina_name: 'Direitos Humanos',
    book_title: 'Compêndio de Direitos Humanos, Cidadania e Dignidade da Pessoa Humana',
    book_author: 'Profº Cleiton Barbirato (Org.)',
    book_url: 'https://drive.google.com/open?id=1fPSmFUBNzrzK--n3NDKOdMR5HWk25AV7&usp=drive_copy',
    category: '14 - Sociologia e Ciências Afins',
    notes: 'Toda a bibliografia obrigatória (textos, slides e materiais jurídicos) fornecida digitalmente e sem custos na pasta.',
    added_by_name: 'Profº Cleiton Barbirato',
    added_by_role: 'professor',
    created_at: '2026-08-12T11:00:00Z',
  },

  // ==========================================
  // ÉTICA CRISTÃ (disc-5)
  // ==========================================
  {
    id: 'livro-eti-1',
    disciplina_id: 'disc-5',
    disciplina_name: 'Ética Cristã',
    book_title: 'Catecismo Maior de Westminster Comentado: Exposição Doutrinária',
    book_author: 'Johannes G. Vos / Assembleia de Westminster',
    book_url: 'https://drive.google.com/open?id=1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-catecismo-maior-westminster-comentado',
    is_mandatory: true,
    category: '04 - Teologia Sistemática',
    notes: '⭐ BASE OFICIAL DOS SEMINÁRIOS: Exposição detalhada dos Dez Mandamentos para os seminários práticos de 22/10 a 19/11.',
    added_by_name: 'Profª Karoline Evangelista',
    added_by_role: 'professor',
    created_at: '2026-08-13T10:00:00Z',
  },
  {
    id: 'livro-eti-2',
    disciplina_id: 'disc-5',
    disciplina_name: 'Ética Cristã',
    book_title: 'O Catecismo Maior de Westminster: Texto Oficial e Exposição dos Dez Mandamentos',
    book_author: 'Assembleia de Westminster (1647)',
    book_url: 'https://drive.google.com/open?id=1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-catecismo-maior-westminster-oficial',
    category: '04 - Teologia Sistemática',
    notes: 'Documento confessional histórico padrão utilizado como base nos seminários em grupo.',
    added_by_name: 'Profª Karoline Evangelista',
    added_by_role: 'professor',
    created_at: '2026-08-13T10:10:00Z',
  },
  {
    id: 'livro-eti-3',
    disciplina_id: 'disc-5',
    disciplina_name: 'Ética Cristã',
    book_title: 'Ética Cristã: Opções e Questões Contemporâneas',
    book_author: 'Norman L. Geisler (Ed. Vida Nova)',
    book_url: 'https://drive.google.com/open?id=1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC&usp=drive_copy',
    is_mandatory: true,
    category: '11 - Ética Cristã e Bioética',
    notes: '⭐ LIVRO-TEXTO PRINCIPAL: Base bibliográfica da matéria indicada pela Profª Karoline Evangelista.',
    added_by_name: 'Profª Karoline Evangelista',
    added_by_role: 'professor',
    created_at: '2026-08-13T10:15:00Z',
  },
  {
    id: 'livro-eti-4',
    disciplina_id: 'disc-5',
    disciplina_name: 'Ética Cristã',
    book_title: 'Pecados Espetaculares: E o propósito de Deus para a glória de Cristo',
    book_author: 'John Piper',
    book_url: 'https://drive.google.com/open?id=1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-pecados-espetaculares-piper',
    category: '04 - Teologia Sistemática',
    notes: 'Reflexão teológica e ética sobre a soberania divina em meio a dilemas morais complexos.',
    added_by_name: 'Profª Karoline Evangelista',
    added_by_role: 'professor',
    created_at: '2026-08-13T10:20:00Z',
  },

  // ==========================================
  // NOVO TESTAMENTO III - EPÍSTOLAS GERAIS (disc-6)
  // ==========================================
  {
    id: 'livro-nt-1',
    disciplina_id: 'disc-6',
    disciplina_name: 'Novo Testamento III - Epístolas Gerais',
    book_title: 'Introdução ao Novo Testamento',
    book_author: 'D. A. Carson, Douglas J. Moo e Leon Morris (Ed. Vida Nova)',
    book_url: 'https://drive.google.com/open?id=1ppsv5caJVbHw-1RwhHu8nxBmqFT9Wm9P&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-introducao-ao-novo-testamento-carson',
    is_mandatory: true,
    category: '02 - Exegese e Hermenêutica',
    notes: '⭐ LIVRO-BASE PRINCIPAL: Obra referencial recomendada pelo Profº Marcio Leal para a bateria de 150 questões.',
    added_by_name: 'Profº Marcio Leal',
    added_by_role: 'professor',
    created_at: '2026-08-13T11:00:00Z',
  },

  // ==========================================
  // PLANTAÇÃO E REVITALIZAÇÃO DE IGREJAS II (disc-7)
  // ==========================================
  {
    id: 'livro-pla-1',
    disciplina_id: 'disc-7',
    disciplina_name: 'Plantação e Revitalização de Igrejas II',
    book_title: 'A Treliça e a Videira: A mentalidade bíblica para o crescimento da igreja',
    book_author: 'Colin Marshall e Tony Payne',
    book_url: 'https://drive.google.com/open?id=1nzXIDnWvvrxSgXQULaSvDGdVr32L_xP8&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-trelica-e-a-videira',
    is_mandatory: true,
    category: '18 - Educação Cristã e Discipulado',
    notes: '⭐ LEITURA E RESUMO OBRIGATÓRIO: Base da AV1 (resumo de 1 página por capítulo, total de 12 páginas, entrega até 27/11).',
    added_by_name: 'Profº Thácyto Lessa',
    added_by_role: 'professor',
    created_at: '2026-08-14T10:00:00Z',
  },
  {
    id: 'livro-pla-2',
    disciplina_id: 'disc-7',
    disciplina_name: 'Plantação e Revitalização de Igrejas II',
    book_title: 'Projeto Videira: Guia de Estudo e Discipulado Prático',
    book_author: 'Tony Payne e Colin Marshall',
    book_url: 'https://drive.google.com/open?id=1nzXIDnWvvrxSgXQULaSvDGdVr32L_xP8&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-projeto-videira-guia-estudo',
    category: '18 - Educação Cristã e Discipulado',
    notes: 'Material prático de estudo e aplicação eclesiástica para discipulado intencional.',
    added_by_name: 'Profº Thácyto Lessa',
    added_by_role: 'professor',
    created_at: '2026-08-14T10:05:00Z',
  },
  {
    id: 'livro-pla-3',
    disciplina_id: 'disc-7',
    disciplina_name: 'Plantação e Revitalização de Igrejas II',
    book_title: 'Projeto Videira: Manual de Implantação e Revitalização Ministerial',
    book_author: 'Tony Payne e Colin Marshall',
    book_url: 'https://drive.google.com/open?id=1nzXIDnWvvrxSgXQULaSvDGdVr32L_xP8&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-projeto-videira-manual',
    category: '18 - Educação Cristã e Discipulado',
    notes: 'Manual estratégico para pastores e líderes na transformação e revitalização de igrejas locais.',
    added_by_name: 'Profº Thácyto Lessa',
    added_by_role: 'professor',
    created_at: '2026-08-14T10:10:00Z',
  },
  {
    id: 'livro-pla-4',
    disciplina_id: 'disc-7',
    disciplina_name: 'Plantação e Revitalização de Igrejas II',
    book_title: 'Lealdade e Deslealdade: Princípios de Liderança e Caráter no Ministério',
    book_author: 'Dag Heward-Mills',
    book_url: 'https://drive.google.com/open?id=1nzXIDnWvvrxSgXQULaSvDGdVr32L_xP8&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-lealdade-e-deslealdade',
    category: '17 - Liderança e Administração Eclesiástica',
    notes: 'Princípios práticos de liderança ministerial, fidelidade e dinâmica de trabalho em equipe.',
    added_by_name: 'Profº Thácyto Lessa',
    added_by_role: 'professor',
    created_at: '2026-08-14T10:15:00Z',
  },

  // ==========================================
  // TRABALHO DE CONCLUSÃO DE CURSO I - TCC I (disc-8)
  // ==========================================
  {
    id: 'livro-tcc-1',
    disciplina_id: 'disc-8',
    disciplina_name: 'TCC I',
    book_title: 'Manual e Modelo Estruturado de Projeto de Pesquisa para TCC Teológico',
    book_author: 'Profª Gabriela Leal / Corpo Docente UIECB',
    book_url: 'https://drive.google.com/open?id=1f-9i-TpqaZhzoLyrxg6flM6CHTsAOWPj&usp=drive_copy',
    biblioteca_book_id: '18-whatsapp-tcc-projeto-diretrizes',
    is_mandatory: true,
    category: '01 - Bíblia e Referência',
    notes: '⭐ DIRETRIZES OFICIAIS: Modelos de Capa, Sumário, Objetivos no infinitivo, Justificativa e Cronograma ABNT.',
    added_by_name: 'Profª Gabriela Leal',
    added_by_role: 'professor',
    created_at: '2026-08-14T11:00:00Z',
  },
  // ==========================================
  // HISTÓRIA DA CULTURA AFRO BRASILEIRA E INDÍGENA (disc-9)
  // ==========================================
  {
    id: 'livro-cab-1',
    disciplina_id: 'disc-9',
    disciplina_name: 'História da Cultura Afro Brasileira e Indígena',
    book_title: 'Coletânea de Textos Étnico-Raciais e Cultura Indígena no Brasil',
    book_author: 'Profº Alexsandro (Org.)',
    book_url: 'https://drive.google.com/drive/folders/1mCp4ZCawhIekLJl3_bcoPiThAqwdzlty?usp=drive_link',
    category: '14 - Sociologia e Ciências Afins',
    notes: 'Textos, artigos e leis que fundamentam o debate sobre etnia, fé e história nacional.',
    added_by_name: 'Profº Alexsandro',
    added_by_role: 'professor',
    created_at: '2026-08-14T11:15:00Z',
  },
];

const STORAGE_KEY = 'lms_livros_recomendados_v4';

export function getAllLivrosRecomendados(): LivroRecomendadoDisciplina[] {
  if (typeof window === 'undefined') return INITIAL_LIVROS_RECOMENDADOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LIVROS_RECOMENDADOS));
      return INITIAL_LIVROS_RECOMENDADOS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const seedMap = new Map(INITIAL_LIVROS_RECOMENDADOS.map((s) => [s.id, s]));
      let hasChanges = false;
      const updatedList = parsed.map((item: LivroRecomendadoDisciplina) => {
        if (seedMap.has(item.id)) {
          const seed = seedMap.get(item.id)!;
          if (
            seed.book_url !== item.book_url ||
            seed.biblioteca_book_id !== item.biblioteca_book_id ||
            seed.is_mandatory !== item.is_mandatory ||
            seed.notes !== item.notes ||
            seed.book_title !== item.book_title
          ) {
            hasChanges = true;
            return {
              ...item,
              book_title: seed.book_title,
              book_author: seed.book_author,
              book_url: seed.book_url,
              biblioteca_book_id: seed.biblioteca_book_id,
              is_mandatory: seed.is_mandatory,
              category: seed.category,
              notes: seed.notes,
              disciplina_id: seed.disciplina_id,
              disciplina_name: seed.disciplina_name,
            };
          }
        }
        return item;
      });

      const existingIds = new Set(updatedList.map((item: LivroRecomendadoDisciplina) => item.id));
      const missingSeeds = INITIAL_LIVROS_RECOMENDADOS.filter((seed) => !existingIds.has(seed.id));
      if (missingSeeds.length > 0) {
        hasChanges = true;
        updatedList.push(...missingSeeds);
      }

      if (hasChanges) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      }
      return updatedList;
    }
    return INITIAL_LIVROS_RECOMENDADOS;
  } catch (e) {
    console.error('Erro ao ler livros recomendados:', e);
    return INITIAL_LIVROS_RECOMENDADOS;
  }
}

export function saveAllLivrosRecomendados(list: LivroRecomendadoDisciplina[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('lms_livros_recomendados_updated', { detail: list }));
  } catch (e) {
    console.error('Erro ao salvar livros recomendados:', e);
  }
}

export function getLivrosRecomendadosForDisciplina(disciplinaId: string): LivroRecomendadoDisciplina[] {
  const all = getAllLivrosRecomendados();
  if (!disciplinaId) return all;
  return all.filter((item) => item.disciplina_id === disciplinaId);
}

export function addLivroRecomendado(
  item: Omit<LivroRecomendadoDisciplina, 'id' | 'created_at'>
): LivroRecomendadoDisciplina {
  const newItem: LivroRecomendadoDisciplina = {
    ...item,
    id: `livro-rec-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  const current = getAllLivrosRecomendados();
  const next = [newItem, ...current];
  saveAllLivrosRecomendados(next);
  return newItem;
}

export function updateLivroRecomendado(
  updated: LivroRecomendadoDisciplina
): void {
  const current = getAllLivrosRecomendados();
  const next = current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item));
  saveAllLivrosRecomendados(next);
}

export function deleteLivroRecomendado(id: string): void {
  const current = getAllLivrosRecomendados();
  const next = current.filter((item) => item.id !== id);
  saveAllLivrosRecomendados(next);
}
