import {
  AbntArticleDocument,
  AbntInstitutionPreset,
  AbntSection,
  AbntTemplateType,
} from '@/types/abntArticle';
import { Disciplina } from '@/types';

export const SEMINARIO_LOGO_PATH = '/logo-seminario-congregacional.png';
export const UNIMB_LOGO_PATH = '/brasao-unimb.png';

export interface AbntInstitutionPresetConfig {
  id: AbntInstitutionPreset;
  label: string;
  logoPath: string;
  institutionName: string;
  courseName: string;
  unitName: string;
  city: string;
}

export const INSTITUTION_PRESETS: Record<AbntInstitutionPreset, AbntInstitutionPresetConfig> = {
  unimb: {
    id: 'unimb',
    label: 'UniMB (Oficial)',
    logoPath: '/brasao-unimb.png',
    institutionName: 'CENTRO UNIVERSITÁRIO MACIÇO DE BATURITÉ – UNIMB',
    courseName: 'CURSO DE BACHARELADO EM TEOLOGIA',
    unitName: 'Seminário Teológico Koinonia (UIECB)',
    city: 'BATURITÉ – CE',
  },
  koinonia: {
    id: 'koinonia',
    label: 'Seminário Koinonia (UIECB)',
    logoPath: '/logo-koinonia-lms.png',
    institutionName: 'SEMINÁRIO TEOLÓGICO KOINONIA – UIECB',
    courseName: 'CURSO DE BACHARELADO EM TEOLOGIA',
    unitName: 'Centro Universitário Maciço de Baturité – UniMB',
    city: 'BATURITÉ – CE',
  },
};

export interface AbntTemplateCardInfo {
  id: AbntTemplateType;
  name: string;
  normaBadge: string;
  metaLabel: string;
  description: string;
}

export const ABNT_TEMPLATE_CARDS: AbntTemplateCardInfo[] = [
  {
    id: 'artigo_tcc',
    name: 'Artigo Científico / TCC',
    normaBadge: 'ABNT NBR 6022',
    metaLabel: '20–25 págs • Sem 1ª pessoa',
    description:
      'Capa, Folha de Rosto, Resumo/Abstract, Introdução, Metodologia, Fundamentação Teórica, Resultados, Considerações Finais e Referências.',
  },
  {
    id: 'trabalho_academico',
    name: 'Trabalho Acadêmico / Pesquisa',
    normaBadge: 'ABNT NBR 14724',
    metaLabel: '5–10 págs • Sumário completo',
    description:
      'Modelo padrão para pesquisas dissertativas de disciplinas semestrais: Capa, Folha de Rosto, Sumário, Introdução, Desenvolvimento e Conclusão.',
  },
  {
    id: 'estudo_caso',
    name: 'Trabalho Aplicado / Estudo de Caso',
    normaBadge: 'ABNT Enxuto (1–5 laudas)',
    metaLabel: '2 laudas • 3 partes práticas',
    description:
      'Ideal para atividades objetivas (como AFR-101 ou resenhas curtas): Contextualização da situação-problema, Análise Bíblica/Autores e Proposta de Ação.',
  },
  {
    id: 'resumo_livro',
    name: 'Resumo Estruturado por Capítulos',
    normaBadge: 'Fichamento / Síntese',
    metaLabel: '1 pág por capítulo',
    description:
      'Organizado em Apresentação da Obra e capítulos numerados expansíveis (+ Adicionar Capítulo). Ideal para sínteses de livros integrais.',
  },
  {
    id: 'projeto_pesquisa',
    name: 'Projeto de Pesquisa Acadêmica',
    normaBadge: 'ABNT NBR 15287',
    metaLabel: 'Objetivos + Tabela Cronograma',
    description:
      'Tema, Problema, Objetivos (Geral/Específicos), Justificativa, Referencial Teórico, Metodologia e Tabela de Cronograma pré-configurada.',
  },
];

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildSectionsForTemplate(templateType: AbntTemplateType): AbntSection[] {
  switch (templateType) {
    case 'artigo_tcc':
      return [
        {
          id: makeId('sec'),
          numberLabel: '1',
          title: 'INTRODUÇÃO',
          guideHint:
            'Apresente o tema delimitado, o problema de pesquisa, a justificativa acadêmica/ministerial, os objetivos e a síntese da estrutura do artigo (recomenda-se revisar ao final).',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
        {
          id: makeId('sec'),
          numberLabel: '2',
          title: 'METODOLOGIA',
          guideHint:
            'Classifique o tipo de pesquisa (bibliográfica, documental, qualitativa, histórico-descritiva), procedimentos de coleta e critérios de análise em 3ª pessoa impessoal.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
        {
          id: makeId('sec'),
          numberLabel: '3',
          title: 'FUNDAMENTAÇÃO TEÓRICA',
          guideHint:
            'Desenvolva o diálogo crítico com as Escrituras e com os autores clássicos e contemporâneos, utilizando citações diretas curtas e longas (recuo 4 cm) e paráfrases.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
        {
          id: makeId('sec'),
          numberLabel: '4',
          title: 'RESULTADOS E DISCUSSÃO',
          guideHint:
            'Analise os achados bíblico-teológicos ou dados de campo à luz do referencial teórico construído na seção anterior.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
        {
          id: makeId('sec'),
          numberLabel: '5',
          title: 'CONSIDERAÇÕES FINAIS',
          guideHint:
            'Retome o problema e cada objetivo específico mostrando se foram alcançados, sem introduzir novas citações teóricas inéditas.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
      ];

    case 'trabalho_academico':
      return [
        {
          id: makeId('sec'),
          numberLabel: '1',
          title: 'INTRODUÇÃO',
          guideHint:
            'Contextualize o tema proposto pelo docente, delimite o recorte histórico/teológico e indique o objetivo central da pesquisa.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
        {
          id: makeId('sec'),
          numberLabel: '2',
          title: 'DESENVOLVIMENTO',
          guideHint:
            'Exponha os argumentos principais com rigor conceitual, inserindo subtítulos numerados (2.1, 2.2) sempre que precisar organizar subtópicos.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
        {
          id: makeId('sec'),
          numberLabel: '3',
          title: 'CONCLUSÃO',
          guideHint:
            'Sintetize as principais contribuições identificadas durante o estudo e sua relevância teológica e eclesial.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
      ];

    case 'estudo_caso':
      return [
        {
          id: makeId('sec'),
          numberLabel: '1',
          title: 'DESCRIÇÃO E CONTEXTUALIZAÇÃO DA SITUAÇÃO-PROBLEMA',
          guideHint:
            'Apresente o cenário concreto analisado e descreva o problema ou impacto gerado para a igreja local, comunidade ou missão.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
        {
          id: makeId('sec'),
          numberLabel: '2',
          title: 'ANÁLISE BÍBLICO-TEOLÓGICA E DIÁLOGO COM OS AUTORES',
          guideHint:
            'Fundamente sua análise crítica em passagens bíblicas pertinentes e em pelo menos dois autores estudados na disciplina.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
        {
          id: makeId('sec'),
          numberLabel: '3',
          title: 'PROPOSTA DE AÇÃO PASTORAL E ECLESIAL CONCRETA',
          guideHint:
            'Apresente práticas aplicáveis, éticas e realistas que possam ser executadas por pastores, lideranças ou igrejas locais.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
      ];

    case 'resumo_livro':
      return [
        {
          id: makeId('sec'),
          numberLabel: '1',
          title: 'APRESENTAÇÃO DA OBRA E TESE CENTRAL',
          guideHint:
            'Identifique autor(es), contexto editorial, propósito do livro e a tese central defendida ao longo da obra.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
        {
          id: makeId('sec'),
          numberLabel: '2',
          title: 'CAPÍTULO 1 — SÍNTESE ANALÍTICA',
          guideHint: 'Resuma fielmente os argumentos centrais e aplicações do Capítulo 1.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
        {
          id: makeId('sec'),
          numberLabel: '3',
          title: 'CAPÍTULO 2 — SÍNTESE ANALÍTICA',
          guideHint: 'Resuma fielmente os argumentos centrais e aplicações do Capítulo 2.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
        {
          id: makeId('sec'),
          numberLabel: '4',
          title: 'CONSIDERAÇÕES CRÍTICAS E APLICAÇÃO MINISTERIAL',
          guideHint: 'Avalie a relevância prática da obra para o ministério cristão contemporâneo.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
      ];

    case 'projeto_pesquisa':
      return [
        {
          id: makeId('sec'),
          numberLabel: '1',
          title: 'TEMA E PROBLEMA DE PESQUISA',
          guideHint: 'Defina o tema delimitado e formule a pergunta norteadora da pesquisa.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
        {
          id: makeId('sec'),
          numberLabel: '2',
          title: 'OBJETIVOS (GERAL E ESPECÍFICOS)',
          guideHint: 'Redija os objetivos com verbos no infinitivo (analisar, investigar, comparar).',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
        {
          id: makeId('sec'),
          numberLabel: '3',
          title: 'JUSTIFICATIVA',
          guideHint: 'Demonstre a relevância teológica, acadêmica e pastoral do tema.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
        {
          id: makeId('sec'),
          numberLabel: '4',
          title: 'REFERENCIAL TEÓRICO PRELIMINAR',
          guideHint: 'Apresente os autores e fontes bíblico-teológicas que fundamentarão o estudo.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
        {
          id: makeId('sec'),
          numberLabel: '5',
          title: 'METODOLOGIA',
          guideHint: 'Descreva a abordagem, técnicas de pesquisa e critérios de análise.',
          blocks: [{ id: makeId('blk'), type: 'paragraph', text: '' }],
        },
        {
          id: makeId('sec'),
          numberLabel: '6',
          title: 'CRONOGRAMA DE EXECUÇÃO',
          guideHint: 'Distribua as etapas da pesquisa ao longo das semanas ou meses previstos.',
          blocks: [
            {
              id: makeId('blk'),
              type: 'table',
              title: 'Cronograma de Execução da Pesquisa',
              source: 'Elaborado pelo autor (2026).',
              headers: ['Etapa da Pesquisa', 'Período Previsto', 'Status'],
              rows: [
                ['Levantamento bibliográfico e fichamentos', 'Mês 1', 'Em andamento'],
                ['Coleta / Análise bíblico-documental', 'Mês 2', 'Previsto'],
                ['Redação dos capítulos e revisão ABNT', 'Mês 3', 'Previsto'],
                ['Entrega final ao orientador', 'Mês 4', 'Previsto'],
              ],
            },
          ],
        },
      ];
  }
}

export function createArticleFromTemplate(
  templateType: AbntTemplateType,
  options: {
    userEmail: string;
    userName?: string;
    disciplina?: Disciplina | null;
  }
): AbntArticleDocument {
  const now = new Date().toISOString();
  const preset = INSTITUTION_PRESETS.unimb;
  const cleanUserName = (options.userName || 'SEMINARISTA AUTOR').trim();
  const discName = options.disciplina?.name || 'Disciplina do Curso de Teologia';
  const profName = options.disciplina?.professor_name || 'Professor(a) da Disciplina';
  const profEmail = options.disciplina?.professor_email || '';

  const templateMeta: Record<
    AbntTemplateType,
    {
      title: string;
      natureNote: string;
      showCover: boolean;
      showTitlePage: boolean;
      showToc: boolean;
      showAbstract: boolean;
      showDisciplinaOnCover: boolean;
      targetMinPages?: number;
      targetMaxPages?: number;
      restrictFirstPerson: boolean;
    }
  > = {
    artigo_tcc: {
      title: 'TÍTULO DO ARTIGO CIENTÍFICO EM TEOLOGIA',
      natureNote: `Artigo Científico apresentado ao ${preset.courseName} do ${preset.institutionName} (${preset.unitName}), como requisito parcial da disciplina ${discName}, sob orientação de ${profName}.`,
      showCover: true,
      showTitlePage: true,
      showToc: true,
      showAbstract: true,
      showDisciplinaOnCover: false,
      targetMinPages: 20,
      targetMaxPages: 25,
      restrictFirstPerson: true,
    },
    trabalho_academico: {
      title: `TRABALHO ACADÊMICO — ${discName.toUpperCase()}`,
      natureNote: `Trabalho acadêmico apresentado ao ${preset.courseName} do ${preset.institutionName} (${preset.unitName}), como requisito avaliativo da disciplina ${discName}, ministrada por ${profName}.`,
      showCover: true,
      showTitlePage: true,
      showToc: true,
      showAbstract: false,
      showDisciplinaOnCover: true,
      targetMinPages: 5,
      targetMaxPages: 10,
      restrictFirstPerson: true,
    },
    estudo_caso: {
      title: `TRABALHO APLICADO — ${discName.toUpperCase()}`,
      natureNote: `Trabalho final aplicado apresentado à disciplina ${discName}, do ${preset.courseName} (${preset.institutionName} / ${preset.unitName}), sob avaliação de ${profName}.`,
      showCover: true,
      showTitlePage: false,
      showToc: false,
      showAbstract: false,
      showDisciplinaOnCover: true,
      targetMinPages: 2,
      targetMaxPages: 3,
      restrictFirstPerson: false,
    },
    resumo_livro: {
      title: 'RESUMO ANALÍTICO POR CAPÍTULOS DA OBRA ESTUDADA',
      natureNote: `Resumo estruturado apresentado como requisito parcial da disciplina ${discName}, no ${preset.courseName} do ${preset.institutionName} (${preset.unitName}), ministrada por ${profName}.`,
      showCover: true,
      showTitlePage: true,
      showToc: true,
      showAbstract: false,
      showDisciplinaOnCover: true,
      targetMinPages: 10,
      targetMaxPages: 14,
      restrictFirstPerson: false,
    },
    projeto_pesquisa: {
      title: 'PROJETO DE PESQUISA EM TEOLOGIA',
      natureNote: `Projeto de pesquisa apresentado ao ${preset.courseName} do ${preset.institutionName} (${preset.unitName}), no âmbito da disciplina ${discName}, sob orientação de ${profName}.`,
      showCover: true,
      showTitlePage: true,
      showToc: true,
      showAbstract: false,
      showDisciplinaOnCover: false,
      targetMinPages: 6,
      targetMaxPages: 12,
      restrictFirstPerson: true,
    },
  };

  const meta = templateMeta[templateType];

  return {
    id: makeId('abnt'),
    userEmail: (options.userEmail || 'aluno_padrao').toLowerCase().trim(),
    templateType,
    disciplinaId: options.disciplina?.id || undefined,
    disciplinaName: discName,
    professorName: profName,
    professorEmail: profEmail,
    institutionName: preset.institutionName,
    courseName: preset.courseName,
    unitName: preset.unitName,
    city: preset.city,
    year: String(new Date().getFullYear()),
    title: meta.title,
    subtitle: '',
    academicNatureNote: meta.natureNote,
    authors: [
      {
        id: makeId('aut'),
        fullName: cleanUserName.toUpperCase(),
        registration: '',
      },
    ],
    resumo: '',
    palavrasChave: '',
    abstractEn: '',
    keywordsEn: '',
    sections: buildSectionsForTemplate(templateType),
    references: [],
    attachments: [],
    formatting: {
      fontFamily: 'Arial',
      firstLineIndentCm: 1.25,
      showLogo: true,
      logoLayout: 'both',
      showDisciplinaOnCover: meta.showDisciplinaOnCover,
      institutionPreset: 'unimb',
      showCover: meta.showCover,
      showTitlePage: meta.showTitlePage,
      showToc: meta.showToc,
      showAbstract: meta.showAbstract,
      targetMinPages: meta.targetMinPages,
      targetMaxPages: meta.targetMaxPages,
      restrictFirstPerson: meta.restrictFirstPerson,
    },
    isLocked: false,
    createdAt: now,
    updatedAt: now,
  };
}
