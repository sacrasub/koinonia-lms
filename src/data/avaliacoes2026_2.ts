/**
 * =======================================================================
 * KOINONIA LMS — FONTE ÚNICA DE VERDADE (SINGLE SOURCE OF TRUTH)
 * CRONOGRAMA, PRAZOS E AVALIAÇÕES OFICIAIS — SEMESTRE 2026.2
 * =======================================================================
 * 
 * Este arquivo centraliza todas as definições avaliativas, prazos,
 * critérios de formatação e diretrizes acadêmicas homologadas para o 
 * semestre letivo 2026.2 do Seminário Teológico Koinonia.
 * 
 * Componentes consumidores obrigatórios:
 * - CalendarioAcademico.tsx
 * - TrabalhosAvaliacoes.tsx / ChecklistAV2Page.tsx
 * - AlunoPanel.tsx (Widgets de avaliações, modais e avisos)
 * - PlanoEstudosPage.tsx e planoEstudosService.ts
 */

export interface PassoAcao {
  label: string;
  kind: 'external' | 'av2' | 'hub' | 'abnt' | 'email';
  url?: string;
  disciplinaId?: string;
  av2SubTab?: 'regras' | 'guia' | 'mapa' | 'simulado';
  variant?: 'pdf' | 'drive' | 'meet' | 'texto' | 'av2' | 'hub' | 'abnt' | 'email';
}

export function resolvePassoAcaoHref(
  acao: PassoAcao,
  fallbackDisciplinaId?: string
): string | null {
  const targetDiscId = acao.disciplinaId || fallbackDisciplinaId;
  if (acao.kind === 'av2' && targetDiscId) {
    return `/?tab=operacao-av2&disciplina=${encodeURIComponent(targetDiscId)}&subtab=${encodeURIComponent(acao.av2SubTab || 'guia')}`;
  }
  if (acao.kind === 'hub' && targetDiscId) {
    return `/?tab=disciplina-detalhe&disciplina=${encodeURIComponent(targetDiscId)}`;
  }
  if (acao.kind === 'abnt') {
    return '/artigos-abnt';
  }
  if (acao.url) {
    return acao.url;
  }
  return null;
}

export interface AvaliacaoEvento {
  id: string;
  disciplinaId?: string;
  disciplina: string;
  disciplinaShort: string;
  professor: string;
  tipo: string;
  tipoBadge: 'PROVA' | 'TRABALHO' | 'SEMINÁRIO' | 'RESUMO' | 'ATIVIDADE' | 'ARTIGO';
  dataLimite: string; // YYYY-MM-DD
  dataTexto: string;
  horario: string;
  peso: string;
  isArchived?: boolean;
  regras: string[];
  passoAPasso: string[];
  passoAcoes?: Record<number, PassoAcao[]>;
  bibliografia: {
    obrigatoria?: string[];
    recomendada?: string[];
  };
  canalEnvio: {
    tipo: 'email' | 'forms' | 'meet' | 'plataforma' | 'presencial';
    destinatario?: string;
    assunto?: string;
    observacao?: string;
    linkUrl?: string;
  };
  cor: {
    bg: string;
    text: string;
    border: string;
    pillBg: string;
    dot: string;
    badgeBg: string;
    badgeText: string;
  };
}

export type KanbanStatus = 'todo' | 'doing' | 'done' | 'archived';

export interface KanbanTask {
  id: string;
  assessmentId?: string;
  title: string;
  subject: string;
  professor: string;
  dueDate: string; // YYYY-MM-DD
  priority: 'Máxima' | 'Média' | 'Normal';
  type: 'Trabalho Escrito' | 'Portfólio' | 'Prova Objetiva' | 'Resumo Crítico' | 'Estudo de Caso' | 'TCC' | 'Seminário em Grupo' | 'Atividade Modular' | string;
  status: KanbanStatus;
  manualStatus?: KanbanStatus;
  strategyNote: string;
  subtasks: { id: string; text: string; done: boolean }[];
}

export interface CronogramaConsolidadoItem {
  id: string;
  dataLimite: string;
  dataISO: string;
  disciplina: string;
  disciplinaId: string;
  docente: string;
  tipoAtividade: string;
  statusPeso: string;
  isEncerrado?: boolean;
  isArchived?: boolean;
  isHoje?: boolean;
  isProrrogado?: boolean;
}

export const ARCHIVED_AV1_ASSESSMENT_IDS = new Set<string>([
  'aval-0-tcc1-projeto-pesquisa',
  'aval-2-congregacionalismo-av1',
  'aval-3-pensamento-cristao-av1',
  'aval-4-aconselhamento-av1',
  'aval-5-direitos-humanos-trabalho',
  'aval-7-nt3-epistolas-av1',
  'aval-6-direitos-humanos-prova',
]);

/**
 * 15 ITENS DO CRONOGRAMA OFICIAL CONSOLIDADO (BASE DE DADOS HOMOLOGADA 2026.2)
 */
export const CRONOGRAMA_OFICIAL_2026_2: CronogramaConsolidadoItem[] = [
  {
    id: 'cron-01-tcc-projeto',
    dataLimite: '04/09/2026 (Sex)',
    dataISO: '2026-09-04',
    disciplina: 'TCC I',
    disciplinaId: 'disc-8',
    docente: 'Profª Gabriela Leal',
    tipoAtividade: 'Entrega do Projeto de Pesquisa Estruturado ABNT',
    statusPeso: 'Concluído',
    isEncerrado: true,
    isArchived: true,
  },
  {
    id: 'cron-02-his-av1',
    dataLimite: '29/09/2026 (Ter)',
    dataISO: '2026-09-29',
    disciplina: 'Hist. do Congregacionalismo',
    disciplinaId: 'disc-1',
    docente: 'Profº Ary Júnior',
    tipoAtividade: 'Prova Escrita AV1 (Origem Mundial)',
    statusPeso: 'Concluído (Peso 8,0)',
    isEncerrado: true,
    isArchived: true,
  },
  {
    id: 'cron-03-hpc-av1',
    dataLimite: '29/09/2026 (Ter)',
    dataISO: '2026-09-29',
    disciplina: 'Hist. do Pensamento Cristão II',
    disciplinaId: 'disc-2',
    docente: 'Profº Hilário Bispo',
    tipoAtividade: 'Trabalho Acadêmico AV1 (Iluminismo & Modernidade)',
    statusPeso: 'Concluído',
    isEncerrado: true,
    isArchived: true,
  },
  {
    id: 'cron-04-aco-av1',
    dataLimite: '30/09/2026 (Qua)',
    dataISO: '2026-09-30',
    disciplina: 'Aconselhamento Bíblico II',
    disciplinaId: 'disc-3',
    docente: 'Profº Uilian Santos',
    tipoAtividade: 'Prova Objetiva AV1 (Google Forms)',
    statusPeso: 'Concluído',
    isEncerrado: true,
    isArchived: true,
  },
  {
    id: 'cron-05-dir-trabalho-av1',
    dataLimite: '30/09/2026 (Qua)',
    dataISO: '2026-09-30',
    disciplina: 'Direitos Humanos',
    disciplinaId: 'disc-4',
    docente: 'Profº Cleiton Barbirato',
    tipoAtividade: 'Trabalho Dissertativo AV1 (1 lauda)',
    statusPeso: 'Concluído (Peso 2,0)',
    isEncerrado: true,
    isArchived: true,
  },
  {
    id: 'cron-06-nt3-av1',
    dataLimite: '01/10/2026 (Qui)',
    dataISO: '2026-10-01',
    disciplina: 'NT III — Epístolas Gerais',
    disciplinaId: 'disc-6',
    docente: 'Profº Marcio Leal',
    tipoAtividade: 'Prova Objetiva AV1 (Hebreus a 2 Pedro)',
    statusPeso: 'Concluído',
    isEncerrado: true,
    isArchived: true,
  },
  {
    id: 'cron-07-dir-prova-av1',
    dataLimite: '04/10/2026 (Dom)',
    dataISO: '2026-10-04',
    disciplina: 'Direitos Humanos',
    disciplinaId: 'disc-4',
    docente: 'Profº Cleiton Barbirato',
    tipoAtividade: 'Prova Objetiva AV1 (Google Forms)',
    statusPeso: 'Concluído (Peso 8,0)',
    isEncerrado: true,
    isArchived: true,
  },
  {
    id: 'cron-08-etc-seminarios',
    dataLimite: '22/10 a 19/11/2026',
    dataISO: '2026-10-22',
    disciplina: 'Ética Cristã',
    disciplinaId: 'disc-5',
    docente: 'Profª Karoline Evangelista',
    tipoAtividade: 'Seminários dos Dez Mandamentos',
    statusPeso: 'Concluído (Individual)',
    isEncerrado: true,
  },
  {
    id: 'cron-09-dam-exame',
    dataLimite: '07/11/2026 (Sáb)',
    dataISO: '2026-11-07',
    disciplina: 'Exame DAM / UIECB',
    disciplinaId: 'disc-dam',
    docente: 'Diretoria Regional',
    tipoAtividade: 'Prova Objetiva Presencial (09:00 - 12:00)',
    statusPeso: 'Concluído (UIECB)',
    isEncerrado: true,
  },
  {
    id: 'cron-10-his-av2',
    dataLimite: '24/11/2026 (Ter)',
    dataISO: '2026-11-24',
    disciplina: 'Hist. do Congregacionalismo',
    disciplinaId: 'disc-1',
    docente: 'Profº Ary Júnior',
    tipoAtividade: 'Prova V/F AV2 — 10 afirmações (2 autodecl. + 8 conteúdo)',
    statusPeso: '19:00–20:25 BRT (Sem Consulta)',
  },
  {
    id: 'cron-11-hpc-av2',
    dataLimite: '24/11/2026 (Ter)',
    dataISO: '2026-11-24',
    disciplina: 'Hist. do Pensamento Cristão II',
    disciplinaId: 'disc-2',
    docente: 'Profº Hilário Bispo',
    tipoAtividade: 'Prova AV2 — 10 Questões Forms (Liberalismo & Séc. XX)',
    statusPeso: '20:35–22:00 BRT (Peso 10,0)',
  },
  {
    id: 'cron-12-aco-av2',
    dataLimite: '25/11/2026 (Qua)',
    dataISO: '2026-11-25',
    disciplina: 'Aconselhamento Bíblico II',
    disciplinaId: 'disc-3',
    docente: 'Profº Uilian Santos',
    tipoAtividade: 'Prova Objetiva AV2 (Google Forms • Slides U2)',
    statusPeso: '19:00–20:25 BRT (Sem Trabalho)',
  },
  {
    id: 'cron-13-dir-av2',
    dataLimite: '25/11/2026 (Qua)',
    dataISO: '2026-11-25',
    disciplina: 'Direitos Humanos',
    disciplinaId: 'disc-4',
    docente: 'Profº Cleiton Barbirato',
    tipoAtividade: 'Prova Objetiva AV2 (Peso 10,0 — Trabalho Cancelado)',
    statusPeso: '19:00–23:59 BRT (52 Slides pós-AV1)',
  },
  {
    id: 'cron-13b-etc-av2',
    dataLimite: '26/11/2026 (Qui)',
    dataISO: '2026-11-26',
    disciplina: 'Ética Cristã',
    disciplinaId: 'disc-5',
    docente: 'Profª Karoline Evangelista',
    tipoAtividade: 'Encerramento & Notas (Sem Prova Escrita AV2)',
    statusPeso: '19:00–20:25 BRT (100% Seminários)',
  },
  {
    id: 'cron-13c-nt3-av2',
    dataLimite: '26/11/2026 (Qui)',
    dataISO: '2026-11-26',
    disciplina: 'NT III — Epístolas Gerais',
    disciplinaId: 'disc-6',
    docente: 'Profº Marcio Leal',
    tipoAtividade: 'Prova Objetiva AV2 (10 Questões Forms)',
    statusPeso: '20:35–22:00 BRT (Peso 10,0)',
  },
  {
    id: 'cron-14-pla-resumo-av2',
    dataLimite: '27/11/2026 (Sex)',
    dataISO: '2026-11-27',
    disciplina: 'Plantação e Revitalização II',
    disciplinaId: 'disc-7',
    docente: 'Profº Thácyto Lessa',
    tipoAtividade: 'Prova AV2 Consulta Livre (19h) + Resumo 12 pág até 23:59',
    statusPeso: 'AV1 (Resumo) + AV2 (Consulta Livre)',
  },
  {
    id: 'cron-14b-afro-av2',
    dataLimite: '28/11/2026 (Sáb)',
    dataISO: '2026-11-28',
    disciplina: 'Cultura Afro-Brasileira e Indígena (AFR-101)',
    disciplinaId: 'disc-9',
    docente: 'Profº Alexsandro de Oliveira Silva',
    tipoAtividade: 'Trabalho Final Aplicado (2 laudas • Sem Prova Escrita)',
    statusPeso: 'Até 23:59 BRT (prof.alexsandro@gmail.com)',
  },
  {
    id: 'cron-15-tcc-artigo',
    dataLimite: '04/12/2026 (Sex)',
    dataISO: '2026-12-04',
    disciplina: 'TCC I',
    disciplinaId: 'disc-8',
    docente: 'Profª Gabriela Leal',
    tipoAtividade: 'Entrega Final do Artigo (20 a 25 pág • PDF e Word)',
    statusPeso: 'Até 23:59 BRT (Sem IA)',
  },
];

/**
 * AVALIACOES OFICIAIS COM METADADOS COMPLETOS PARA O CALENDÁRIO VISUAL, MODAIS E DRAWERS
 */
export const AVALIACOES_2026_2: AvaliacaoEvento[] = [
  {
    id: 'aval-0-tcc1-projeto-pesquisa',
    isArchived: true,
    disciplina: 'Trabalho de Conclusão de Curso I (TCC I)',
    disciplinaShort: 'TCC I (Projeto de Pesquisa)',
    professor: 'Profª Gabriela Leal',
    tipo: 'Entrega Final do Projeto de Pesquisa (ABNT)',
    tipoBadge: 'TRABALHO',
    dataLimite: '2026-09-04',
    dataTexto: '04 de Setembro de 2026 (Sexta-feira)',
    horario: 'Encerrado às 23:59',
    peso: 'Marco Metodológico de Acompanhamento (AV1) — Concluído',
    regras: [
      'Prazo rígido de duas semanas: Capa, Sumário, Objetivos (Geral e 2-3 Específicos no infinitivo), Justificativa, Referencial Teórico e Cronograma em tabela.',
      'Introdução por último.',
      'Linguagem impessoal (3ª pessoa) e rigorosamente sem Inteligência Artificial.'
    ],
    passoAPasso: [
      'Definir título provisório, justificativa e objetivos no infinitivo.',
      'Construir referencial teórico com normas ABNT e cronograma em tabela.',
      'Revisar impessoalidade (3ª pessoa), ausência de IA e anexos de pesquisa de campo.'
    ],
    bibliografia: {
      obrigatoria: [
        'Manual de Trabalhos Acadêmicos da Faculdade Maciço do Baturité (FMB)',
        'Normas ABNT vigentes para projetos de pesquisa científica'
      ]
    },
    canalEnvio: {
      tipo: 'email',
      destinatario: 'gabriela.lealg7757@gmail.com',
      assunto: 'Projeto de Pesquisa ABNT - TCC I - [Nome do Aluno]',
      observacao: 'Envio em PDF ou DOCX para o e-mail da professora orientadora.'
    },
    cor: {
      bg: 'bg-fuchsia-500/10',
      text: 'text-fuchsia-300',
      border: 'border-fuchsia-500/30',
      pillBg: 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white',
      dot: 'bg-fuchsia-400',
      badgeBg: 'bg-fuchsia-500/20',
      badgeText: 'text-fuchsia-300'
    }
  },
  {
    id: 'aval-2-congregacionalismo-av1',
    isArchived: true,
    disciplina: 'História do Congregacionalismo',
    disciplinaShort: 'História Congregacionalismo',
    professor: 'Profº Ary Júnior',
    tipo: 'Prova Escrita (AV1) + Leitura Obrigatória + Frequência',
    tipoBadge: 'PROVA',
    dataLimite: '2026-09-29',
    dataTexto: '29 de Setembro de 2026 (Terça-feira)',
    horario: '18:30 às 20:25 (Durante o horário de aula)',
    peso: 'Nota da 1ª Unidade = 10,0 pontos (Prova: 8,0 | Câmera aberta: 1,0 | Leitura: 1,0)',
    regras: [
      'Uso obrigatório de câmera ligada durante toda a aula e no momento da avaliação.',
      'Questão declaratória direta na prova sobre a leitura dos textos obrigatórios (critério de honestidade acadêmica).'
    ],
    passoAPasso: [
      'Acessar os links dos 4 a 6 textos em PDF compartilhados pelo professor no chat/drive da turma.',
      'Realizar a leitura integral dos textos abordando a Reforma Inglesa, Puritans, Separatistas/Independentes, Henry Jacob, Viagem do Mayflower, Plataforma de Cambridge e Assembleia de Westminster.',
      'Conectar-se no horário da aula no dia 29/09/2026 com a câmera aberta.',
      'Preencher a avaliação escrita e marcar a confirmação de leitura dos textos indicados.'
    ],
    bibliografia: {
      obrigatoria: [
        'Textos 1 a 4+ em PDF disponibilizados via Google Drive pelo Profº Ary Júnior'
      ],
      recomendada: [
        '"Congregacionalismo: origens e contribuições sociais da democracia protestante" (Profº Idauro Campos)',
        '"A Verdadeira Natureza de uma Igreja Evangélica" (John Owen)'
      ]
    },
    canalEnvio: {
      tipo: 'forms',
      observacao: 'Aplicação ao vivo na sala virtual via formulário do Google Forms disponibilizado no horário da aula.'
    },
    cor: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-300',
      border: 'border-sky-500/30',
      pillBg: 'bg-sky-600 hover:bg-sky-500 text-white',
      dot: 'bg-sky-400',
      badgeBg: 'bg-sky-500/20',
      badgeText: 'text-sky-300'
    }
  },
  {
    id: 'aval-3-pensamento-cristao-av1',
    isArchived: true,
    disciplina: 'História do Pensamento Cristão II',
    disciplinaShort: 'Pensamento Cristão II',
    professor: 'Profº Hilário Bispo',
    tipo: 'Trabalho Escrito de Pesquisa Acadêmica ABNT (AV1)',
    tipoBadge: 'TRABALHO',
    dataLimite: '2026-09-29',
    dataTexto: '29 de Setembro de 2026 (Terça-feira)',
    horario: '20:30 (Data da Prova AV1)',
    peso: 'Nota integral da AV1 (0,0 a 10,0). Não entrega exige avaliação substitutiva (AV3)',
    regras: [
      'Formato: Individual ou em grupo de no máximo 2 a 3 integrantes.',
      'Extensão obrigatória: Mínimo de 5 a 6 páginas de conteúdo.',
      'Normas formais: Formatação rigorosa nas normas da ABNT.',
      'Exigência de delimitação: O tema deve ser devidamente delimitado sobre Iluminismo & Modernidade.'
    ],
    passoAPasso: [
      'Definir a composição do trabalho (individual ou grupo de até 3 alunos).',
      'Revisar os slides fornecidos na primeira aula sobre a estrutura e os requisitos do trabalho.',
      'Estruturar a pesquisa cobrindo o tema Iluminismo e Modernidade: Racionalismo (Descartes), Empirismo (Locke, Kant), autonomia da razão vs. revelação.',
      'Redigir o texto com no mínimo 5 a 6 páginas no padrão ABNT.',
      'Entregar o trabalho na data da prova (29/09/2026).'
    ],
    bibliografia: {
      obrigatoria: [
        'Slides e anotações das aulas do Profº Hilário Bispo',
        'Obras de René Descartes, John Locke, Immanuel Kant e David Hume'
      ],
      recomendada: [
        '"Raízes da Dúvida"',
        'Sermões de Jonathan Edwards ("Pecadores nas mãos de um Deus irado")'
      ]
    },
    canalEnvio: {
      tipo: 'email',
      destinatario: 'hilario.graca@catolica.edu.br',
      assunto: 'Trabalho de Pesquisa AV1 - Pensamento Cristão II - [Nomes dos Alunos]',
      observacao: 'Submissão por e-mail até o dia 29/09/2026.'
    },
    cor: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-300',
      border: 'border-purple-500/30',
      pillBg: 'bg-purple-600 hover:bg-purple-500 text-white',
      dot: 'bg-purple-400',
      badgeBg: 'bg-purple-500/20',
      badgeText: 'text-purple-300'
    }
  },
  {
    id: 'aval-4-aconselhamento-av1',
    isArchived: true,
    disciplina: 'Aconselhamento Bíblico II',
    disciplinaShort: 'Aconselhamento Bíblico II',
    professor: 'Profº Uilian Santos',
    tipo: 'Prova Objetiva Online via Google Forms (Sem Trabalho Escrito)',
    tipoBadge: 'PROVA',
    dataLimite: '2026-09-30',
    dataTexto: '30 de Setembro de 2026 (Quarta-feira)',
    horario: '19:00 às 20:25 (Durante a aula)',
    peso: 'Nota integral da AV1 (0,0 a 10,0) — Correção automática',
    regras: [
      'Prova composta exclusivamente por questões objetivas de múltipla escolha via Google Forms.',
      'Rigorosamente SEM CONSULTA a materiais externos durante a realização.',
      'Conteúdo cobrado estritamente restrito às informações contidas nos slides apresentados.',
      'A correção e a nota são geradas automaticamente após o envio do formulário.'
    ],
    passoAPasso: [
      'Estudar os slides das aulas 1 a 6 disponibilizados na pasta da disciplina.',
      'Fixar os tópicos centrais: Suficiência das Escrituras vs. Terapias/Psicologia, Aconselhamento no Livro de Jó, Pecado e Ídolos do Coração, e as 5 Áreas do Inventário.',
      'Acessar o link do Google Forms disponibilizado no dia 30/09/2026 no horário de aula.',
      'Preencher as questões objetivas e clicar em enviar para receber a nota automática.'
    ],
    bibliografia: {
      obrigatoria: [
        'Slides e apresentações oficiais do Profº Uilian Santos (Aulas 1 a 6)'
      ],
      recomendada: [
        '"Lutero como conselheiro espiritual" (Ed. Vida Nova)',
        '"Aconselhamento Cristão" (Gary Collins)',
        '"Aconselhamento a partir da cruz"',
        '"Ego Transformado" (Timothy Keller)'
      ]
    },
    canalEnvio: {
      tipo: 'forms',
      observacao: 'Link do Google Forms encaminhado no grupo da turma e na sala virtual do Google Meet.'
    },
    cor: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-300',
      border: 'border-amber-500/30',
      pillBg: 'bg-amber-600 hover:bg-amber-500 text-white',
      dot: 'bg-amber-400',
      badgeBg: 'bg-amber-500/20',
      badgeText: 'text-amber-300'
    }
  },
  {
    id: 'aval-5-direitos-humanos-trabalho',
    isArchived: true,
    disciplina: 'Direitos Humanos',
    disciplinaShort: 'Direitos Humanos (Trabalho)',
    professor: 'Profº Cleiton Barbirato',
    tipo: 'Trabalho Dissertativo AV1: Desigualdade Social e Privilégios (1 lauda)',
    tipoBadge: 'TRABALHO',
    dataLimite: '2026-09-30',
    dataTexto: '30 de Setembro de 2026 (Quarta-feira)',
    horario: 'Prazo Encerrado em 30/09/2026 às 23:59',
    peso: 'Peso 2,0 na composição da AV1 (Soma com os 8,0 pontos da Prova Forms)',
    regras: [
      'Status: Encerrado em 30/09/2026 às 23:59.',
      'Extensão máxima: Exatamente até 1 lauda (1 página A4).',
      'Fonte: Times New Roman, tamanho 12, espaçamento 1,5 entre linhas.',
      'Tema: "Desigualdade social e privilégios conforme vídeo da aula de 26/09/2026. Discutir a importância da igreja como agente de transformação social".',
      'Envio por e-mail para cleitonpb@gmail.com com assunto obrigatório: "Trabalho para composição de nota".',
      'Proibição estrita: Rigorosamente proibido o uso de Inteligência Artificial ou cópias.'
    ],
    passoAPasso: [
      'Assistir ao vídeo indicado pelo professor ("A corrida da vida / Pergunta aos jovens sobre privilégios").',
      'Refletir sobre a desigualdade social e o papel da Igreja como agente de transformação.',
      'Redigir texto dissertativo de até 1 página em Times New Roman 12, espaçamento 1,5.',
      'Enviar o arquivo por e-mail para cleitonpb@gmail.com com assunto "Trabalho para composição de nota".'
    ],
    bibliografia: {
      obrigatoria: [
        'Vídeo de apoio "A Corrida da Vida / Desigualdade Social e Privilégios"',
        'Declaração Universal dos Direitos Humanos (1948)',
        'Slides da disciplina de Direitos Humanos'
      ]
    },
    canalEnvio: {
      tipo: 'email',
      destinatario: 'cleitonpb@gmail.com',
      assunto: 'Trabalho para composição de nota',
      observacao: 'Encerrado em 30/09/2026. Vale 2,0 pontos na composição da AV1.'
    },
    cor: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-300',
      border: 'border-rose-500/30',
      pillBg: 'bg-rose-600 hover:bg-rose-500 text-white',
      dot: 'bg-rose-400',
      badgeBg: 'bg-rose-500/20',
      badgeText: 'text-rose-300'
    }
  },
  {
    id: 'aval-7-nt3-epistolas-av1',
    isArchived: true,
    disciplina: 'Novo Testamento III — Epístolas Gerais',
    disciplinaShort: 'NT III (Prova Objetiva)',
    professor: 'Profº Marcio Leal',
    tipo: 'Prova Objetiva Online via Google Forms (Hebreus a 2 Pedro)',
    tipoBadge: 'PROVA',
    dataLimite: '2026-10-01',
    dataTexto: '01 de Outubro de 2026 (Quinta-feira)',
    horario: 'Hoje às 23:59 (Durante e após a aula)',
    peso: 'Nota integral da AV1 (0,0 a 10,0) — Prova Hoje',
    regras: [
      'Prova Objetiva Online realizada via formulário Google Forms.',
      'Conteúdo cobrado: Epístolas de Hebreus, Tiago, 1 Pedro e 2 Pedro.',
      'Data e Prazo Limite: 01/10/2026 (Quinta-feira) às 23:59.',
      'Câmeras abertas durante a explicação inicial das diretrizes da prova.'
    ],
    passoAPasso: [
      'Revisar anotações de aula e slides sobre Hebreus, Tiago, 1 Pedro e 2 Pedro.',
      'Estudar introduções especiais, autoria, destinatários e propósitos das epístolas bíblicas.',
      'Acessar o formulário Google Forms disponibilizado pelo professor no dia 01/10/2026.',
      'Responder às questões objetivas e submeter antes das 23:59 de hoje.'
    ],
    bibliografia: {
      obrigatoria: [
        '"Introdução ao Novo Testamento" (D. A. Carson, Douglas J. Moo e Leon L. Morris)',
        'Texto bíblico das Epístolas Gerais (Hebreus, Tiago, 1 Pedro, 2 Pedro)'
      ]
    },
    canalEnvio: {
      tipo: 'forms',
      observacao: 'Link do Google Forms disponibilizado no chat da aula e liberado para envio até 23:59 de hoje.'
    },
    cor: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-300',
      border: 'border-indigo-500/30',
      pillBg: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      dot: 'bg-indigo-400',
      badgeBg: 'bg-indigo-500/20',
      badgeText: 'text-indigo-300'
    }
  },
  {
    id: 'aval-6-direitos-humanos-prova',
    isArchived: true,
    disciplina: 'Direitos Humanos',
    disciplinaShort: 'Direitos Humanos (Prova Forms)',
    professor: 'Profº Cleiton Barbirato',
    tipo: 'Prova Objetiva AV1 via Google Forms (Prazo Prorrogado)',
    tipoBadge: 'PROVA',
    dataLimite: '2026-10-04',
    dataTexto: '04 de Outubro de 2026 (Domingo)',
    horario: 'Até às 23:59 (Prazo Prorrogado Oficialmente)',
    peso: 'Peso 8,0 (Vale até 8,0 pontos da nota da AV1)',
    regras: [
      '📢 PRAZO PRORROGADO OFICIALMENTE: O prazo para a Prova Objetiva AV1 foi estendido para domingo, 04/10/2026 às 23:59.',
      'Aplicação via Google Forms: Prova 100% objetiva de múltipla escolha.',
      'Rigorosamente SEM CONSULTA a materiais externos, anotações, constituição ou Inteligência Artificial.',
      'Composição da AV1: 8,0 pontos (Prova Objetiva Forms) + 2,0 pontos (Trabalho Dissertativo individual).'
    ],
    passoAPasso: [
      'Estudar a apostila digital composta por todos os slides disponibilizados na pasta do curso.',
      'Revisar conteúdos centrais: Conceito de Direitos Humanos, Dignidade da Pessoa Humana, Mínimo Existencial, Declaração Universal de 1948, Gerações/Dimensões dos Direitos, Jusnaturalismo, Positivismo, Pirâmide de Kelsen e Cláusulas Pétreas.',
      'Acessar o link do Google Forms disponível até o dia 04/10/2026 às 23:59.',
      'Responder às questões objetivas sem consulta e clicar em submeter.'
    ],
    bibliografia: {
      obrigatoria: [
        'Slides oficiais do curso (disponíveis na pasta do Google Drive da disciplina)',
        'Declaração Universal dos Direitos Humanos (1948)'
      ]
    },
    canalEnvio: {
      tipo: 'forms',
      observacao: 'Link do Google Forms ativo para realização até domingo, 04/10/2026 às 23:59.'
    },
    cor: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-300',
      border: 'border-rose-500/30',
      pillBg: 'bg-rose-700 hover:bg-rose-600 text-white',
      dot: 'bg-rose-300',
      badgeBg: 'bg-rose-500/20',
      badgeText: 'text-rose-300'
    }
  },
  {
    id: 'aval-8-etica-crista-seminario',
    disciplina: 'Ética Cristã',
    disciplinaShort: 'Ética Cristã (Seminários)',
    professor: 'Profª Karoline Evangelista',
    tipo: 'Seminários Práticos em Grupo — Os Dez Mandamentos (AV1/AV2)',
    tipoBadge: 'SEMINÁRIO',
    dataLimite: '2026-10-22',
    dataTexto: '22 de Outubro a 19 de Novembro de 2026 (Quintas-feiras)',
    horario: '18:45 às 20:25 (30 min por grupo / 10 min por orador)',
    peso: 'Nota estritamente individual (avaliação de pesquisa, slides e oratória na tribuna)',
    regras: [
      'Seminários Práticos em Grupo sobre os Dez Mandamentos baseados no Catecismo Maior de Westminster e Norman Geisler.',
      'Período Oficial: De 22/10/2026 a 19/11/2026 (nas quintas-feiras de aula).',
      'Dinâmica: 30 minutos por grupo (quartetos com 10 minutos cronometrados por orador).',
      'A nota é estritamente individual avaliando domínio bíblico-teológico, oratória e aplicação contemporânea.',
      'ATENÇÃO: No dia 01/10/2026 não há avaliação ou entrega (trata-se de aula expositiva regular sobre pena de morte e guerras).'
    ],
    passoAPasso: [
      'Reunir-se com a equipe definida em sala e confirmar o mandamento sorteado (1º ao 10º Mandamento).',
      'Estudar a seção correspondente do Catecismo Maior de Westminster (deveres exigidos e pecados proibidos).',
      'Consultar a obra "Ética Cristã" de Norman Geisler para contextualizar com dilemas morais contemporâneos.',
      'Montar os slides da apresentação em conjunto com o grupo.',
      'Treinar a exposição oral individual com cronômetro para respeitar os 10 minutos por orador no dia agendado.'
    ],
    bibliografia: {
      obrigatoria: [
        'Catecismo Maior de Westminster (Seção sobre os Dez Mandamentos)',
        '"Ética Cristã: Opções e Questões Contemporâneas" (Norman L. Geisler — Ed. Vida Nova)'
      ],
      recomendada: [
        '"O Cristão e as Questões Éticas da Atualidade" (Walter C. Kaiser Jr.)'
      ]
    },
    canalEnvio: {
      tipo: 'meet',
      observacao: 'Apresentação oral ao vivo via Google Meet nas quintas-feiras de 22/10 a 19/11/2026.'
    },
    cor: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-300',
      border: 'border-yellow-500/30',
      pillBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold',
      dot: 'bg-amber-300',
      badgeBg: 'bg-yellow-500/20',
      badgeText: 'text-yellow-300'
    }
  },
  {
    id: 'aval-dam-exame-presencial',
    disciplina: 'Exame DAM / UIECB',
    disciplinaShort: 'Exame DAM (Presencial)',
    professor: 'Diretoria Regional',
    tipo: 'Prova Objetiva Presencial (09:00 - 12:00)',
    tipoBadge: 'PROVA',
    dataLimite: '2026-11-07',
    dataTexto: '07 de Novembro de 2026 (Sábado)',
    horario: '09:00 às 12:00 (Presencial)',
    peso: 'Avaliação Denominacional Oficial UIECB',
    regras: [
      'Exame denominacional presencial obrigatório para estudantes dos cursos de teologia do Seminário Koinonia / UIECB.',
      'Horário rígido: Início às 09:00 e encerramento às 12:00.',
      'Conteúdo cobrado: Doutrinas Bíblicas Fundamentais, História Eclesiástica e Prática Pastoral.'
    ],
    passoAPasso: [
      'Revisar as matérias basilares do currículo teológico (Doutrina, Bíblia, História do Congregacionalismo).',
      'Comparecer ao local designado pela Diretoria Regional com 30 minutos de antecedência munido de documento de identidade com foto.',
      'Realizar a prova presencial e assinar a lista oficial de presença.'
    ],
    bibliografia: {
      obrigatoria: [
        'Manual de Doutrinas e Práticas da UIECB',
        'Breve Declaração de Fé dos Congregacionais'
      ]
    },
    canalEnvio: {
      tipo: 'presencial',
      observacao: 'Aplicação presencial sob coordenação da Diretoria Regional da UIECB.'
    },
    cor: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-300',
      border: 'border-blue-500/30',
      pillBg: 'bg-blue-600 hover:bg-blue-500 text-white',
      dot: 'bg-blue-400',
      badgeBg: 'bg-blue-500/20',
      badgeText: 'text-blue-300'
    }
  },
  {
    id: 'aval-his-av2-brasil',
    disciplinaId: 'disc-1',
    disciplina: 'História do Congregacionalismo',
    disciplinaShort: 'Hist. Congregacionalismo (AV2)',
    professor: 'Profº Ary Júnior',
    tipo: 'Prova AV2 (10 Afirmações V/F): Congregacionalismo no Brasil',
    tipoBadge: 'PROVA',
    dataLimite: '2026-11-24',
    dataTexto: '24 de Novembro de 2026 (Terça-feira)',
    horario: '19:00 – 20:25 (Brasília) • 17:00 – 18:25 (Tabatinga)',
    peso: 'Peso 10,0: 2 afirmações de autodeclaração (participação/leitura = 2,0 pts) + 8 questões históricas/teológicas (8,0 pts)',
    regras: [
      'Formato: 10 afirmações para julgamento em Verdadeiro (V) ou Falso (F) via Google Forms.',
      '2 primeiras questões: autodeclaração de participação/frequência e leitura dos 3 textos obrigatórios (1,0 pt cada = 2,0 pts).',
      '8 questões seguintes: conteúdo histórico e teológico (1,0 pt cada = 8,0 pts).',
      'Prova individual SEM CONSULTA, com câmeras abertas e sem trabalho escrito complementar.'
    ],
    passoAPasso: [
      'Ler os 3 textos obrigatórios no WhatsApp: (1) Síntese do Congregacionalismo Brasileiro; (2) Síntese dos 28 Artigos; (3) Análise analítica ampla dos 28 Artigos.',
      'Revisar Robert & Sarah Kalley, Igreja Fluminense (1858), Pernambucana (19/10/1873), Artigos 13-14 e 24, Help for Brazil, UEA e 1913.',
      'Conectar-se com câmera aberta às 19:00 BRT no dia 24/11/2026 e responder às 10 afirmações V/F no Google Forms.'
    ],
    passoAcoes: {
      0: [
        { label: '(1) Síntese Congregacionalismo', kind: 'external', url: 'https://aryqueirozjr.com.br/historia-identidade-congregacionalismo-brasileiro/', variant: 'texto' },
        { label: '(2) Síntese 28 Artigos', kind: 'external', url: 'https://aryqueirozjr.com.br/vida-teologia-drkalley-parte-2/', variant: 'texto' },
        { label: '(3) Análise 150 Anos 28 Artigos', kind: 'external', url: 'https://aryqueirozjr.com.br/150-anos-breve-exposicao-doutrinas-kalley/', variant: 'texto' },
        { label: 'PDF: 28 Artigos', kind: 'external', url: 'https://drive.google.com/open?id=1waocn4PsQ79Rw6iCxuZmueVgPnN_kcG7&usp=drive_copy', variant: 'pdf' },
      ],
      1: [
        { label: 'Guia de Revisão AV2', kind: 'av2', disciplinaId: 'disc-1', av2SubTab: 'guia', variant: 'av2' },
        { label: 'Simulado AV2 (V/F e Questões)', kind: 'av2', disciplinaId: 'disc-1', av2SubTab: 'simulado', variant: 'av2' },
      ],
      2: [
        { label: 'Sala da Prova (Google Meet)', kind: 'external', url: 'https://meet.google.com/sef-ggpp-bbn', variant: 'meet' },
      ],
    },
    bibliografia: {
      obrigatoria: [
        '1. Síntese do Congregacionalismo Brasileiro (WhatsApp)',
        '2. Síntese dos 28 Artigos da Breve Exposição (WhatsApp)',
        '3. Análise analítica ampla dos 28 Artigos (WhatsApp)'
      ]
    },
    canalEnvio: {
      tipo: 'forms',
      observacao: 'Link oficial via Google Forms disponibilizado no início da aula (19:00 BRT).'
    },
    cor: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-300',
      border: 'border-sky-500/30',
      pillBg: 'bg-sky-700 hover:bg-sky-600 text-white',
      dot: 'bg-sky-300',
      badgeBg: 'bg-sky-500/20',
      badgeText: 'text-sky-300'
    }
  },
  {
    id: 'aval-hpc-av2-liberalismo',
    disciplinaId: 'disc-2',
    disciplina: 'História do Pensamento Cristão II',
    disciplinaShort: 'Pensamento Cristão II (AV2)',
    professor: 'Profº Hilário Bispo',
    tipo: 'Prova Objetiva AV2 (10 Questões): Teologia Liberal e Século XX',
    tipoBadge: 'PROVA',
    dataLimite: '2026-11-24',
    dataTexto: '24 de Novembro de 2026 (Terça-feira)',
    horario: '20:35 – 22:00 (Brasília) • 18:35 – 20:00 (Tabatinga)',
    peso: 'Peso 10,0: 10 questões valendo 1,0 ponto cada (correção automática e nota imediata)',
    regras: [
      'Prova objetiva com 10 questões de múltipla escolha via Google Forms.',
      'Prova individual SEM CONSULTA. Não há trabalho extra na AV2.',
      'Conteúdo: Friedrich Schleiermacher, Avivamentos séc. XVIII, Karl Barth, Declaração de Barmen (1934), Søren Kierkegaard, Rudolf Bultmann e Efeitos Noéticos do Pecado.'
    ],
    passoAPasso: [
      'Revisar os resumos e slides das Aulas 9 a 14 sobre Liberalismo Teológico e Teologia Contemporânea.',
      'Correlacionar autores (Schleiermacher, Barth, Kierkegaard, Bultmann, Machen) com suas teses principais.',
      'Acessar o link do Google Forms no chat do Meet em 24/11/2026 às 20:35 BRT e submeter.'
    ],
    passoAcoes: {
      0: [
        { label: 'Pasta PWP Slides (Aulas 6–16)', kind: 'external', url: 'https://drive.google.com/drive/folders/1nzJ_soSOyypR47_vlR3mHLNCh0YKUTEj', variant: 'drive' },
        { label: 'Pasta da Disciplina (Drive)', kind: 'external', url: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy', variant: 'drive' },
      ],
      1: [
        { label: 'Guia de Revisão AV2', kind: 'av2', disciplinaId: 'disc-2', av2SubTab: 'guia', variant: 'av2' },
        { label: 'Mapa Mental AV2', kind: 'av2', disciplinaId: 'disc-2', av2SubTab: 'mapa', variant: 'av2' },
      ],
      2: [
        { label: 'Sala da Prova (Google Meet)', kind: 'external', url: 'https://meet.google.com/cxj-yetd-xpf', variant: 'meet' },
      ],
    },
    bibliografia: {
      obrigatoria: [
        'Apostila oficial e slides das Aulas 9 a 14 (Profº Hilário Bispo)'
      ]
    },
    canalEnvio: {
      tipo: 'forms',
      observacao: 'Link liberado no chat do Google Meet às 20:35 BRT com correção imediata.'
    },
    cor: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-300',
      border: 'border-purple-500/30',
      pillBg: 'bg-purple-700 hover:bg-purple-600 text-white',
      dot: 'bg-purple-300',
      badgeBg: 'bg-purple-500/20',
      badgeText: 'text-purple-300'
    }
  },
  {
    id: 'aval-aco-av2-final',
    disciplinaId: 'disc-3',
    disciplina: 'Aconselhamento Bíblico II',
    disciplinaShort: 'Aconselhamento Bíblico II (AV2)',
    professor: 'Profº Uilian Santos',
    tipo: 'Prova Objetiva AV2 via Google Forms (Restrita aos Slides)',
    tipoBadge: 'PROVA',
    dataLimite: '2026-11-25',
    dataTexto: '25 de Novembro de 2026 (Quarta-feira)',
    horario: '19:00 – 20:25 (Brasília) • 17:00 – 18:25 (Tabatinga)',
    peso: 'Peso 10,0 integrais — correção e nota automáticas (Sem trabalho escrito)',
    regras: [
      'Prova objetiva de múltipla escolha via Google Forms baseada estritamente nos slides do Drive.',
      'Não há trabalho acadêmico escrito.',
      'Temas centrais: As 5 Áreas do Inventário do Coração (Físico, Recursos, Emoções, Ações, Conceitos), paralinguística, erro do "guru", falsa esperança vs. esperança bíblica e Salmo 130:5 / Lc 24:32.'
    ],
    passoAPasso: [
      'Estudar todos os slides das Aulas 8 a 14 disponibilizados na pasta do Drive.',
      'Memorizar as 5 áreas do Inventário do Coração e o contraste entre falsa esperança e esperança cristã.',
      'Acessar o Google Forms em 25/11/2026 às 19:00 BRT e submeter.'
    ],
    passoAcoes: {
      0: [
        { label: 'Slides: ACONSELHAMENTO II.pptx', kind: 'external', url: 'https://drive.google.com/file/d/1YsA-o51KHmFGMFQ0EYmM6GgniVq6kiGQ/view', variant: 'pdf' },
        { label: 'Pasta da Disciplina (Drive)', kind: 'external', url: 'https://drive.google.com/open?id=1BUr0R4pLQjTt01ID8XjYKIBlZhAtaWcx&usp=drive_copy', variant: 'drive' },
      ],
      1: [
        { label: 'Guia de Revisão AV2', kind: 'av2', disciplinaId: 'disc-3', av2SubTab: 'guia', variant: 'av2' },
        { label: 'Simulado AV2', kind: 'av2', disciplinaId: 'disc-3', av2SubTab: 'simulado', variant: 'av2' },
      ],
      2: [
        { label: 'Sala da Prova (Google Meet)', kind: 'external', url: 'https://meet.google.com/ifv-zsdd-gjx', variant: 'meet' },
      ],
    },
    bibliografia: {
      obrigatoria: [
        'Slides das aulas da Unidade 2 disponibilizados no Google Drive (Profº Uilian Santos)'
      ]
    },
    canalEnvio: {
      tipo: 'forms',
      observacao: 'Link direto do Google Forms disponibilizado no início da aula (19:00 BRT).'
    },
    cor: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-300',
      border: 'border-amber-500/30',
      pillBg: 'bg-amber-700 hover:bg-amber-600 text-white',
      dot: 'bg-amber-300',
      badgeBg: 'bg-amber-500/20',
      badgeText: 'text-amber-300'
    }
  },
  {
    id: 'aval-dir-av2-prova-trabalho',
    disciplinaId: 'disc-4',
    disciplina: 'Direitos Humanos',
    disciplinaShort: 'Direitos Humanos (AV2)',
    professor: 'Profº Cleiton Barbirato',
    tipo: 'Prova Objetiva AV2 via Forms (10 Questões • Trabalho Cancelado)',
    tipoBadge: 'PROVA',
    dataLimite: '2026-11-25',
    dataTexto: '25 de Novembro de 2026 (Quarta-feira)',
    horario: '19:00 – 23:59 (Janela Brasília) • 17:00 – 21:59 (Tabatinga)',
    peso: 'Peso 10,0 integrais na Prova Forms (Trabalho escrito complementar de 2 pts CANCELADO)',
    regras: [
      '⚠️ ATENÇÃO MÁXIMA: NÃO haverá trabalho escrito complementar na AV2! O professor cancelou o trabalho de 2 pontos.',
      '10 questões de múltipla escolha via Google Forms valendo os 10,0 pontos integrais.',
      'Prova individual SEM CONSULTA, com janela de acesso das 19:00 às 23:59 (Brasília).',
      'Base da Prova: 100% extraída do arquivo consolidado de 52 slides pós-AV1 na pasta do Drive.'
    ],
    passoAPasso: [
      'Baixar e revisar integralmente o arquivo consolidado de 52 slides pós-AV1 no Google Drive.',
      'Fixar: Art. 5º e § 3º da CF/88 (Emendas Constitucionais), Igualdade Formal vs. Equidade, Ações Afirmativas, Conselho de Segurança da ONU (15 / 5 com veto), Dimensão Vertical vs. Horizontal e Honra Subjetiva/Objetiva.',
      'Acessar o Google Forms dentro da janela oficial (19:00 às 23:59 BRT) em 25/11/2026.'
    ],
    passoAcoes: {
      0: [
        { label: 'Aula 07 Slides (PDF)', kind: 'external', url: 'https://drive.google.com/file/d/1wNWgudlsB0Xg5acI7qxll0h9-rfpSXAS/view', variant: 'pdf' },
        { label: 'Aula 08 Slides (PDF)', kind: 'external', url: 'https://drive.google.com/file/d/1asyRutF_5tCDZqHnExfrF8l1JIiC4xcx/view', variant: 'pdf' },
        { label: 'Aula 09 Slides (PDF)', kind: 'external', url: 'https://drive.google.com/file/d/1wbcEUivsqWPDsnY4DKOmxIXSEX-fiq6e/view', variant: 'pdf' },
        { label: 'Pasta da Disciplina (Drive)', kind: 'external', url: 'https://drive.google.com/open?id=1fPSmFUBNzrzK--n3NDKOdMR5HWk25AV7&usp=drive_copy', variant: 'drive' },
      ],
      1: [
        { label: 'Guia de Revisão AV2', kind: 'av2', disciplinaId: 'disc-4', av2SubTab: 'guia', variant: 'av2' },
        { label: 'Simulado AV2', kind: 'av2', disciplinaId: 'disc-4', av2SubTab: 'simulado', variant: 'av2' },
      ],
      2: [
        { label: 'Sala Google Meet', kind: 'external', url: 'https://meet.google.com/uva-zmav-rds', variant: 'meet' },
        { label: 'Regras & Janela AV2', kind: 'av2', disciplinaId: 'disc-4', av2SubTab: 'regras', variant: 'av2' },
      ],
    },
    bibliografia: {
      obrigatoria: [
        'Arquivo consolidado de 52 slides pós-AV1 (Google Drive da disciplina)'
      ]
    },
    canalEnvio: {
      tipo: 'forms',
      observacao: 'Janela do Google Forms aberta das 19:00 às 23:59 BRT em 25/11/2026 (sem envio de trabalho escrito).'
    },
    cor: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-300',
      border: 'border-rose-500/30',
      pillBg: 'bg-rose-800 hover:bg-rose-700 text-white',
      dot: 'bg-rose-400',
      badgeBg: 'bg-rose-500/20',
      badgeText: 'text-rose-300'
    }
  },
  {
    id: 'aval-etc-av2-encerramento',
    disciplinaId: 'disc-5',
    disciplina: 'Ética Cristã',
    disciplinaShort: 'Ética Cristã (Encerramento)',
    professor: 'Profª Karoline Evangelista',
    tipo: 'Encerramento & Conferência de Notas (Sem Prova Escrita na AV2)',
    tipoBadge: 'SEMINÁRIO',
    dataLimite: '2026-11-26',
    dataTexto: '26 de Novembro de 2026 (Quinta-feira)',
    horario: '19:00 – 20:25 (Brasília) • 17:00 – 18:25 (Tabatinga)',
    peso: 'Peso 10,0: Nota integralizada nos Seminários dos Dez Mandamentos (22/10 a 19/11)',
    regras: [
      '⚠️ NÃO HAVERÁ PROVA ESCRITA NA AV2.',
      'A avaliação semestral foi 100% integralizada e unificada nos Seminários dos Dez Mandamentos.',
      'Encontro de 26/11 às 19:00 BRT dedicado à devolutiva final dos seminários e conferência de notas.'
    ],
    passoAPasso: [
      'Participar da aula de encerramento ao vivo em 26/11/2026 às 19:00 BRT.',
      'Conferir sua nota individual dos seminários com a Profª Karoline Evangelista.',
      'Revisar o guia do Catecismo Maior (Q. 99) e Absolutismo Graduado de Geisler caso precise de revisão.'
    ],
    passoAcoes: {
      0: [
        { label: 'Sala da Devolutiva (Google Meet)', kind: 'external', url: 'https://meet.google.com/ypd-yzwg-nrw', variant: 'meet' },
      ],
      1: [
        { label: 'Hub da Disciplina', kind: 'hub', disciplinaId: 'disc-5', variant: 'hub' },
      ],
      2: [
        { label: 'Guia de Revisão AV2', kind: 'av2', disciplinaId: 'disc-5', av2SubTab: 'guia', variant: 'av2' },
        { label: 'Pasta da Disciplina (Drive)', kind: 'external', url: 'https://drive.google.com/open?id=1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC&usp=drive_copy', variant: 'drive' },
      ],
    },
    bibliografia: {
      obrigatoria: [
        'Catecismo Maior de Westminster (Q. 91 a 150)',
        'Ética Cristã: Opções e Questões Contemporâneas (Norman Geisler)'
      ]
    },
    canalEnvio: {
      tipo: 'meet',
      observacao: 'Encontro ao vivo no Google Meet para encerramento e conferência de notas.'
    },
    cor: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-300',
      border: 'border-yellow-500/30',
      pillBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold',
      dot: 'bg-amber-300',
      badgeBg: 'bg-yellow-500/20',
      badgeText: 'text-yellow-300'
    }
  },
  {
    id: 'aval-nt3-av2-epistolas',
    disciplinaId: 'disc-6',
    disciplina: 'Novo Testamento III — Epístolas Gerais',
    disciplinaShort: 'NT III — Epístolas Gerais (AV2)',
    professor: 'Profº Marcio Leal',
    tipo: 'Prova Objetiva AV2 (10 Questões): Epístolas Gerais',
    tipoBadge: 'PROVA',
    dataLimite: '2026-11-26',
    dataTexto: '26 de Novembro de 2026 (Quinta-feira)',
    horario: '20:35 – 22:00 (Brasília) • 18:35 – 20:00 (Tabatinga)',
    peso: 'Peso 10,0: 10 questões objetivas valendo 1,0 ponto cada (Google Forms)',
    regras: [
      'Prova objetiva via Google Forms com 10 questões de múltipla escolha.',
      'Prova individual SEM CONSULTA.',
      'Conteúdo: 1 Pedro (Silvano, "Babilônia", esperança viva), 2 Pedro (falsos mestres, epignosis, Parusia em 2Pe 3:9), Judas, 1-3 João (combate ao docetismo) e síntese de Hebreus e Tiago.'
    ],
    passoAPasso: [
      'Revisar os slides das Aulas 8 a 14 e os capítulos correspondentes em Carson, Moo e Morris.',
      'Conferir os contrastes entre Paulo e Tiago, o significado de Babilônia (1Pe 5:13) e o combate ao docetismo em 1-3 João.',
      'Acessar o Google Forms no horário da aula em 26/11/2026 às 20:35 BRT e responder sem consulta.'
    ],
    passoAcoes: {
      0: [
        { label: 'Slides: Judas & Joaninas (PDF)', kind: 'external', url: 'https://drive.google.com/file/d/1nvzRiGitV--EW7fqpfWRHbfF5u2H1WYc/view', variant: 'pdf' },
        { label: 'Slides: Tiago, 1-2 Pedro (PDF)', kind: 'external', url: 'https://drive.google.com/file/d/1LKsJqGgWvgkv_A1pwL9_E1p-qV9Cdgrr/view', variant: 'pdf' },
        { label: 'Livro Carson, Moo & Morris', kind: 'external', url: 'https://drive.google.com/open?id=1ofgq2tGJt-Lj6F2A4vgZOdVYqJKFyhgT&usp=drive_copy', variant: 'pdf' },
        { label: 'Pasta da Disciplina (Drive)', kind: 'external', url: 'https://drive.google.com/open?id=1ppsv5caJVbHw-1RwhHu8nxBmqFT9Wm9P&usp=drive_copy', variant: 'drive' },
      ],
      1: [
        { label: 'Guia de Revisão AV2', kind: 'av2', disciplinaId: 'disc-6', av2SubTab: 'guia', variant: 'av2' },
        { label: 'Simulado AV2', kind: 'av2', disciplinaId: 'disc-6', av2SubTab: 'simulado', variant: 'av2' },
      ],
      2: [
        { label: 'Sala da Prova (Google Meet)', kind: 'external', url: 'https://meet.google.com/nyn-xjqk-vky', variant: 'meet' },
      ],
    },
    bibliografia: {
      obrigatoria: [
        'Slides oficiais do Profº Marcio Leal (Unidade 2)',
        'Introdução ao Novo Testamento (D. A. Carson, Douglas J. Moo e Leon Morris)'
      ]
    },
    canalEnvio: {
      tipo: 'forms',
      observacao: 'Link direto disponibilizado na sala virtual às 20:35 BRT em 26/11/2026.'
    },
    cor: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-300',
      border: 'border-indigo-500/30',
      pillBg: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      dot: 'bg-indigo-400',
      badgeBg: 'bg-indigo-500/20',
      badgeText: 'text-indigo-300'
    }
  },
  {
    id: 'aval-9-plantacao-resumo-livro',
    disciplinaId: 'disc-7',
    disciplina: 'Plantação e Revitalização de Igrejas II',
    disciplinaShort: 'Plantação (Prova Consulta Livre + Resumo 12p)',
    professor: 'Profº Thácyto Lessa',
    tipo: 'Prova AV2 com Consulta Livre (19h) + Resumo 12 pág (até 23:59)',
    tipoBadge: 'RESUMO',
    dataLimite: '2026-11-27',
    dataTexto: '27 de Novembro de 2026 (Sexta-feira)',
    horario: '19:00 BRT (Prova) / Até 23:59 BRT (Envio do Resumo) • 17:00 (Tabatinga)',
    peso: 'AV1 (Resumo 12 pág, 0-10) + AV2 (Prova Online com Consulta Livre, 0-10)',
    regras: [
      'DUPLA ATIVIDADE EM 27/11/2026:',
      '1. PROVA TEÓRICA ONLINE (AV2): Liberada via Google Forms a partir das 19:00 BRT com CONSULTA LIVRE E ABERTA aos slides, anotações pessoais e PDF consolidado oficial.',
      '2. TRABALHO DO LIVRO (AV1): Resumo DIGITADO de 12 páginas (1 folha por capítulo de "A Treliça e a Videira", de Colin Marshall e Tony Payne).',
      'Canal de Envio do Trabalho: Enviar arquivo (PDF ou Word) até 23:59 de 27/11/2026 para thacyto@gmail.com.'
    ],
    passoAPasso: [
      'Ler os 12 capítulos do livro "A Treliça e a Videira" e elaborar 1 página digitada por capítulo (total de 12 páginas).',
      'Realizar a Prova AV2 online às 19:00 BRT consultando livremente slides, anotações e o PDF consolidado.',
      'Enviar o resumo em PDF ou Word para thacyto@gmail.com até as 23:59 de 27/11/2026.'
    ],
    passoAcoes: {
      0: [
        { label: 'Redigir no Criador ABNT', kind: 'abnt', variant: 'abnt' },
        { label: 'Pasta da Disciplina (Drive)', kind: 'external', url: 'https://drive.google.com/open?id=1nzXIDnWvvrxSgXQULaSvDGdVr32L_xP8&usp=drive_copy', variant: 'drive' },
      ],
      1: [
        { label: 'Sala da Prova (Google Meet)', kind: 'external', url: 'https://meet.google.com/jwb-wpvc-pzm', variant: 'meet' },
        { label: 'Guia de Revisão AV2', kind: 'av2', disciplinaId: 'disc-7', av2SubTab: 'guia', variant: 'av2' },
      ],
      2: [
        { label: 'Enviar E-mail (thacyto@gmail.com)', kind: 'email', url: 'mailto:thacyto@gmail.com?subject=Resumo%20Trelica%20e%20a%20Videira%20-%20Plantacao%20II', variant: 'email' },
      ],
    },
    bibliografia: {
      obrigatoria: [
        '"A Treliça e a Videira" (Colin Marshall e Tony Payne)',
        'PDF consolidado oficial e slides das Aulas 8 a 14 do Profº Thácyto Lessa'
      ]
    },
    canalEnvio: {
      tipo: 'email',
      destinatario: 'thacyto@gmail.com',
      assunto: 'Resumo Treliça e a Videira - Plantação II - [Seu Nome]',
      observacao: 'Prova no Forms às 19:00 (consulta livre); envio do resumo (PDF ou Word) para thacyto@gmail.com até 23:59 de 27/11/2026.'
    },
    cor: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-300',
      border: 'border-emerald-500/30',
      pillBg: 'bg-emerald-700 hover:bg-emerald-600 text-white',
      dot: 'bg-emerald-300',
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-300'
    }
  },
  {
    id: 'aval-afro-av2-trabalho',
    disciplinaId: 'disc-9',
    disciplina: 'História e Cultura Afro-Brasileira e Indígena (AFR-101)',
    disciplinaShort: 'Cultura Afro & Indígena (2 Laudas)',
    professor: 'Profº Alexsandro de Oliveira Silva',
    tipo: 'Avaliação Única — Trabalho Final Aplicado (2 laudas • Sem Prova Escrita)',
    tipoBadge: 'TRABALHO',
    dataLimite: '2026-11-28',
    dataTexto: '28 de Novembro de 2026 (Sábado)',
    horario: 'Até às 23:59 BRT (21:59 Tabatinga)',
    peso: 'Avaliação Única (100% da nota semestral: assistir às 4 videoaulas + Trabalho Individual de 2 laudas — sem prova escrita)',
    regras: [
      'DISCIPLINA MODULAR GRAVADA (4 videoaulas de ~1h20 cada): NÃO possui prova escrita convencional (nem AV1 nem AV2 por formulário).',
      'Extensão obrigatória: Produção individual textual de EXATAMENTE 2 laudas (duas páginas).',
      'Tema/Proposta: Analisar uma questão ou situação-problema étnico-racial concreta e propor uma aplicação pastoral ou eclesial responsável.',
      'Estrutura interna obrigatória (3 partes): (1) Descrição da situação e contextualização; (2) Análise fundamentada (Bíblia: Gn 1:26-28, At 17:26, Gl 3:28 ou Tg 2:1-9 + pelo menos 2 autores estudados no curso); (3) Proposta de ação concreta aplicável por pastores, igrejas locais ou missionários.',
      'Canal exclusivo e prazo final: Enviar para prof.alexsandro@gmail.com até 28/11/2026 (Sábado).'
    ],
    passoAPasso: [
      'Assistir integralmente às 4 videoaulas gravadas na pasta oficial do Google Drive (~1h20 cada).',
      'Parte 1: Escolher uma questão ou situação-problema étnico-racial concreta (ex.: equipe missionária que impõe padrões externos em comunidade quilombola ou indígena) e descrever seu impacto para a igreja local/missão.',
      'Partes 2 e 3: Redigir em exatamente 2 laudas a análise fundamentada na Bíblia (Gn 1:26-28, At 17:26, Gl 3:28, Tg 2:1-9) e em pelo menos 2 autores do curso, concluindo com uma proposta de ação pastoral/eclesial realista.',
      'Enviar o trabalho individual exclusivamente para prof.alexsandro@gmail.com até 28/11/2026.'
    ],
    passoAcoes: {
      0: [
        { label: 'Pasta Oficial do Módulo (Drive)', kind: 'external', url: 'https://drive.google.com/drive/folders/1mCp4ZCawhIekLJl3_bcoPiThAqwdzlty?usp=drive_link', variant: 'drive' },
        { label: 'Videoaula 1', kind: 'external', url: 'https://drive.google.com/file/d/1ypH0nSMA6E02c2enTzeLSacRhY8q9n05/view?usp=drive_link', variant: 'meet' },
        { label: 'Videoaula 2', kind: 'external', url: 'https://drive.google.com/file/d/1zMrGk_T-658PSVDXk14qb4VsFcqNtfzq/view?usp=drive_link', variant: 'meet' },
        { label: 'Videoaula 3', kind: 'external', url: 'https://drive.google.com/file/d/1cdcDrVmHoPmet3oA2Bib6hhz_ugzBxaK/view?usp=drive_link', variant: 'meet' },
        { label: 'Videoaula 4', kind: 'external', url: 'https://drive.google.com/file/d/1gSk3mjti0WC5PCDDpv0DRdtQ0x2hB_yw/view?usp=drive_link', variant: 'meet' },
      ],
      1: [
        { label: 'Guia & Autores na Operação AV2', kind: 'av2', disciplinaId: 'disc-9', av2SubTab: 'guia', variant: 'av2' },
      ],
      2: [
        { label: 'Redigir no Criador ABNT (2 laudas)', kind: 'abnt', variant: 'abnt' },
      ],
      3: [
        { label: 'Enviar E-mail (prof.alexsandro@gmail.com)', kind: 'email', url: 'mailto:prof.alexsandro@gmail.com?subject=Trabalho%20Final%20Aplicado%20(AFR-101)', variant: 'email' },
      ],
    },
    bibliografia: {
      obrigatoria: [
        '4 Videoaulas Gravadas na Pasta Oficial do Google Drive (Profº Alexsandro de Oliveira Silva)',
        'Textos Bíblicos de referência: Gn 1:26-28, At 17:26, Gl 3:28 e Tg 2:1-9',
        'Citar pelo menos 2 autores estudados: Silvio Almeida (Racismo Estrutural); Gersem dos Santos Luciano Baniwa (O Índio Brasileiro); Esau McCaulley (Uma Leitura Negra); Marco Davi de Oliveira (A Religião Mais Negra do Brasil); Nilma Lino Gomes (Movimento Negro Educador); Ailton Krenak (Ideias para Adiar o Fim do Mundo); John Piper (O Racismo, a Cruz e o Cristão)'
      ]
    },
    canalEnvio: {
      tipo: 'email',
      destinatario: 'prof.alexsandro@gmail.com',
      assunto: 'Trabalho Final Aplicado (AFR-101) - [Seu Nome]',
      observacao: 'Envio individual exclusivo para prof.alexsandro@gmail.com até 28/11/2026 (Sábado) — 2 laudas.'
    },
    cor: {
      bg: 'bg-teal-500/10',
      text: 'text-teal-300',
      border: 'border-teal-500/30',
      pillBg: 'bg-teal-700 hover:bg-teal-600 text-white',
      dot: 'bg-teal-300',
      badgeBg: 'bg-teal-500/20',
      badgeText: 'text-teal-300'
    }
  },
  {
    id: 'aval-12-tcc1-artigo-final',
    disciplinaId: 'disc-8',
    disciplina: 'TCC I - Trabalho de Conclusão de Curso I',
    disciplinaShort: 'TCC I (Artigo Científico ABNT)',
    professor: 'Profª Gabriela Leal',
    tipo: 'Entrega Final do Artigo Científico Completo (20 a 25 páginas)',
    tipoBadge: 'ARTIGO',
    dataLimite: '2026-12-04',
    dataTexto: '04 de Dezembro de 2026 (Sexta-feira)',
    horario: 'Até às 23:59 BRT (21:59 Tabatinga)',
    peso: 'Artigo Monográfico ABNT / Nota Final de Conclusão de TCC I',
    regras: [
      'EXTENSÃO ESTRITA OBRIGATÓRIA: Entre 20 e 25 páginas no total (incluindo pré-textuais, textuais e pós-textuais).',
      'Estrutura: Capa FMB, Folha de Rosto, Resumo/Abstract (150-500 palavras, parágrafo único, 3-5 palavras-chave), Introdução, Metodologia, Desenvolvimento, Considerações Finais e Referências em ordem alfabética (NBR 6023).',
      'Citações (NBR 10520): Direta curta (até 3 linhas entre aspas) e Direta longa (+3 linhas: recuo 4 cm, fonte 10, simples, sem aspas).',
      'Linguagem formal e impessoal em 3ª pessoa ou voz passiva (vedada 1ª pessoa).',
      'PROIBIÇÃO EXPRESSA do uso de Inteligência Artificial e vedação total ao plágio. Envio em PDF e Word.'
    ],
    passoAPasso: [
      'Concluir Metodologia, Desenvolvimento e Considerações Finais na ordem metodológica recomendada.',
      'Redigir Introdução e Resumo/Abstract (150-500 palavras) por último, revisando extensão total (20 a 25 páginas).',
      'Conferir impessoalidade (3ª pessoa), citações ABNT (NBR 10520) e Referências alfabéticas (NBR 6023).',
      'Enviar o artigo completo em PDF e Word até 04/12/2026 às 23:59 para gabriela.lealg7757@gmail.com.'
    ],
    passoAcoes: {
      0: [
        { label: 'Abrir Criador de Artigos ABNT', kind: 'abnt', variant: 'abnt' },
        { label: 'Pasta TCC I (Drive)', kind: 'external', url: 'https://drive.google.com/open?id=1f-9i-TpqaZhzoLyrxg6flM6CHTsAOWPj&usp=drive_copy', variant: 'drive' },
      ],
      1: [
        { label: 'Guia de Normas ABNT (AV2)', kind: 'av2', disciplinaId: 'disc-8', av2SubTab: 'guia', variant: 'av2' },
      ],
      2: [
        { label: 'Simulado & Checklist ABNT', kind: 'av2', disciplinaId: 'disc-8', av2SubTab: 'simulado', variant: 'av2' },
        { label: 'Sala de Orientação (Meet)', kind: 'external', url: 'https://meet.google.com/jnz-hkqd-edc', variant: 'meet' },
      ],
      3: [
        { label: 'Enviar E-mail (gabriela.lealg7757@gmail.com)', kind: 'email', url: 'mailto:gabriela.lealg7757@gmail.com?subject=Artigo%20Cientifico%20Final%20-%20TCC%20I', variant: 'email' },
      ],
    },
    bibliografia: {
      obrigatoria: [
        'Manual de Trabalhos Acadêmicos da Faculdade Maciço do Baturité (FMB/UNIMB)',
        'Normas ABNT vigentes (NBR 6022, NBR 6023, NBR 6028 e NBR 10520)'
      ]
    },
    canalEnvio: {
      tipo: 'email',
      destinatario: 'gabriela.lealg7757@gmail.com',
      assunto: 'Artigo Científico Final - TCC I - [Nome do Aluno]',
      observacao: 'Envio em formato digital (PDF e Word) na plataforma/e-mail da orientadora até 04/12/2026 às 23:59.'
    },
    cor: {
      bg: 'bg-fuchsia-500/10',
      text: 'text-fuchsia-300',
      border: 'border-fuchsia-500/30',
      pillBg: 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white',
      dot: 'bg-fuchsia-400',
      badgeBg: 'bg-fuchsia-500/20',
      badgeText: 'text-fuchsia-300'
    }
  }
];

/**
 * Constrói a lista de subtarefas diretamente a partir do `passoAPasso` oficial (SSOT),
 * garantindo 100% de identidade entre Card Kanban, Drawer e Calendário.
 */
function buildOfficialSubtasks(
  assessmentId: string,
  doneByDefault = false
): { id: string; text: string; done: boolean }[] {
  const ev = AVALIACOES_2026_2.find((item) => item.id === assessmentId);
  if (!ev) return [];
  return ev.passoAPasso.map((text, idx) => ({
    id: `st-${assessmentId}-${idx}`,
    text,
    done: doneByDefault,
  }));
}

/**
 * TAREFAS KANBAN PADRÃO DO SEMESTRE 2026.2 (CHECKLIST ACADÊMICO)
 */
export const defaultSemesterTasks: KanbanTask[] = [
  // 1. TCC I - Projeto de Pesquisa (04/09 - AV1 Arquivado)
  {
    id: 'aval-0-tcc1-projeto-pesquisa',
    assessmentId: 'aval-0-tcc1-projeto-pesquisa',
    title: 'Entrega do Projeto de Pesquisa Estruturado ABNT',
    subject: 'Trabalho de Conclusão de Curso I (TCC I)',
    professor: 'Profª Gabriela Leal',
    dueDate: '2026-09-04',
    priority: 'Máxima',
    type: 'TCC',
    status: 'archived',
    strategyNote: 'Prazo encerrado em 04/09/2026. Capa, Sumário, Objetivos, Justificativa, Referencial Teórico e Cronograma. Sem IA.',
    subtasks: buildOfficialSubtasks('aval-0-tcc1-projeto-pesquisa', true),
  },
  // 2. História do Congregacionalismo - AV1 (29/09 - Arquivado)
  {
    id: 'aval-2-congregacionalismo-av1',
    assessmentId: 'aval-2-congregacionalismo-av1',
    title: 'Prova Escrita (AV1) — Congregacionalismo Mundial',
    subject: 'História do Congregacionalismo',
    professor: 'Profº Ary Júnior',
    dueDate: '2026-09-29',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'archived',
    strategyNote: 'Prazo concluído em 29/09/2026. Prova: 8,0 | Câmera aberta: 1,0 | Leitura obrigatória autodeclarada: 1,0.',
    subtasks: buildOfficialSubtasks('aval-2-congregacionalismo-av1', true),
  },
  // 3. História do Pensamento Cristão II - AV1 (29/09 - Arquivado)
  {
    id: 'aval-3-pensamento-cristao-av1',
    assessmentId: 'aval-3-pensamento-cristao-av1',
    title: 'Trabalho Acadêmico ABNT (AV1) — Iluminismo & Modernidade',
    subject: 'História do Pensamento Cristão II',
    professor: 'Profº Hilário Bispo',
    dueDate: '2026-09-29',
    priority: 'Máxima',
    type: 'Trabalho Escrito',
    status: 'archived',
    strategyNote: 'Prazo concluído em 29/09/2026. Mínimo de 5 a 6 páginas nas normas ABNT. Individual ou grupos de até 3.',
    subtasks: buildOfficialSubtasks('aval-3-pensamento-cristao-av1', true),
  },
  // 4. Aconselhamento Bíblico II - AV1 (30/09 - Arquivado)
  {
    id: 'aval-4-aconselhamento-av1',
    assessmentId: 'aval-4-aconselhamento-av1',
    title: 'Prova Objetiva AV1 via Google Forms',
    subject: 'Aconselhamento Bíblico II',
    professor: 'Profº Uilian Santos',
    dueDate: '2026-09-30',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'archived',
    strategyNote: 'Prazo concluído em 30/09/2026. Múltipla escolha via Forms restrita aos slides 1 a 6. Sem trabalhos escritos.',
    subtasks: buildOfficialSubtasks('aval-4-aconselhamento-av1', true),
  },
  // 5. Direitos Humanos - Trabalho AV1 (30/09 - Arquivado)
  {
    id: 'aval-5-direitos-humanos-trabalho',
    assessmentId: 'aval-5-direitos-humanos-trabalho',
    title: 'Trabalho Dissertativo AV1: Desigualdade Social & Privilégios (1 lauda)',
    subject: 'Direitos Humanos',
    professor: 'Profº Cleiton Barbirato',
    dueDate: '2026-09-30',
    priority: 'Máxima',
    type: 'Trabalho Escrito',
    status: 'archived',
    strategyNote: 'Prazo encerrado em 30/09/2026 às 23:59. Máximo 1 lauda, Times 12, esp. 1,5. Envio por e-mail (cleitonpb@gmail.com). Vale 2,0 pts.',
    subtasks: buildOfficialSubtasks('aval-5-direitos-humanos-trabalho', true),
  },
  // 6. NT III — Epístolas Gerais - Prova AV1 (01/10 - Arquivado)
  {
    id: 'aval-7-nt3-epistolas-av1',
    assessmentId: 'aval-7-nt3-epistolas-av1',
    title: 'Prova Objetiva Online (AV1) — Hebreus a 2 Pedro',
    subject: 'Novo Testamento III — Epístolas Gerais',
    professor: 'Profº Marcio Leal',
    dueDate: '2026-10-01',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'archived',
    strategyNote: 'Prazo concluído em 01/10/2026. Prova Objetiva Online via formulário Google Forms sobre Hebreus, Tiago, 1 Pedro e 2 Pedro.',
    subtasks: buildOfficialSubtasks('aval-7-nt3-epistolas-av1', true),
  },
  // 7. Direitos Humanos - Prova Objetiva AV1 (04/10 - Arquivado)
  {
    id: 'aval-6-direitos-humanos-prova',
    assessmentId: 'aval-6-direitos-humanos-prova',
    title: 'Prova Objetiva AV1 via Google Forms (Concluída)',
    subject: 'Direitos Humanos',
    professor: 'Profº Cleiton Barbirato',
    dueDate: '2026-10-04',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'archived',
    strategyNote: 'Prazo concluído em 04/10/2026 às 23:59. Múltipla escolha via Google Forms, sem consulta (Peso 8,0).',
    subtasks: buildOfficialSubtasks('aval-6-direitos-humanos-prova', true),
  },
  // 8. Ética Cristã - Seminários dos Dez Mandamentos (22/10 a 19/11)
  {
    id: 'aval-8-etica-crista-seminario',
    assessmentId: 'aval-8-etica-crista-seminario',
    title: 'Seminários em Grupo — Dez Mandamentos (22/10 a 19/11)',
    subject: 'Ética Cristã',
    professor: 'Profª Karoline Evangelista',
    dueDate: '2026-10-22',
    priority: 'Máxima',
    type: 'Seminário em Grupo',
    status: 'done',
    strategyNote: 'Apresentações concluídas entre 22/10 e 19/11 nas quintas-feiras de aula. Nota individual integralizada para AV1/AV2.',
    subtasks: buildOfficialSubtasks('aval-8-etica-crista-seminario', true),
  },
  // 9. Exame DAM / UIECB (07/11)
  {
    id: 'aval-dam-exame-presencial',
    assessmentId: 'aval-dam-exame-presencial',
    title: 'Exame DAM / UIECB — Prova Presencial (Concluído)',
    subject: 'Exame DAM / UIECB',
    professor: 'Diretoria Regional',
    dueDate: '2026-11-07',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'done',
    strategyNote: '07/11/2026 (Sábado) das 09:00 às 12:00. Avaliação denominacional presencial realizada.',
    subtasks: buildOfficialSubtasks('aval-dam-exame-presencial', true),
  },
  // 10. História do Congregacionalismo - AV2 (24/11)
  {
    id: 'aval-his-av2-brasil',
    assessmentId: 'aval-his-av2-brasil',
    title: 'AV2: Prova V/F (10 Afirmações) — Congregacionalismo no Brasil',
    subject: 'História do Congregacionalismo',
    professor: 'Profº Ary Júnior',
    dueDate: '2026-11-24',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: '24/11/2026 às 19:00–20:25 BRT (17:00–18:25 Tabatinga). 10 afirmações V/F: 2 de autodeclaração (participação/leitura = 2,0 pts) + 8 de conteúdo (8,0 pts). Sem consulta, câmeras abertas.',
    subtasks: buildOfficialSubtasks('aval-his-av2-brasil', false),
  },
  // 11. História do Pensamento Cristão II - AV2 (24/11)
  {
    id: 'aval-hpc-av2-liberalismo',
    assessmentId: 'aval-hpc-av2-liberalismo',
    title: 'AV2: Prova Objetiva 10 Questões — Teologia Liberal e Séc. XX',
    subject: 'História do Pensamento Cristão II',
    professor: 'Profº Hilário Bispo',
    dueDate: '2026-11-24',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: '24/11/2026 às 20:35–22:00 BRT (18:35–20:00 Tabatinga). 10 questões objetivas via Google Forms (1,0 pt cada), sem consulta e correção imediata.',
    subtasks: buildOfficialSubtasks('aval-hpc-av2-liberalismo', false),
  },
  // 12. Aconselhamento Bíblico II - AV2 (25/11)
  {
    id: 'aval-aco-av2-final',
    assessmentId: 'aval-aco-av2-final',
    title: 'AV2: Prova Objetiva Final via Google Forms (Slides U2)',
    subject: 'Aconselhamento Bíblico II',
    professor: 'Profº Uilian Santos',
    dueDate: '2026-11-25',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: '25/11/2026 às 19:00–20:25 BRT (17:00–18:25 Tabatinga). Prova via Forms baseada estritamente nos slides do Drive, correção automática, sem trabalho escrito.',
    subtasks: buildOfficialSubtasks('aval-aco-av2-final', false),
  },
  // 13. Direitos Humanos - AV2 (25/11)
  {
    id: 'aval-dir-av2-prova-trabalho',
    assessmentId: 'aval-dir-av2-prova-trabalho',
    title: 'AV2: Prova Forms Peso 10 (Trabalho Cancelado • 52 Slides)',
    subject: 'Direitos Humanos',
    professor: 'Profº Cleiton Barbirato',
    dueDate: '2026-11-25',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: '25/11/2026, janela 19:00–23:59 BRT (17:00–21:59 Tabatinga). ATENÇÃO: Trabalho complementar de 2 pts CANCELADO; 10 questões valem 10,0 pts integrais, 100% dos 52 slides pós-AV1, sem consulta.',
    subtasks: buildOfficialSubtasks('aval-dir-av2-prova-trabalho', false),
  },
  // 13b. Ética Cristã - Encerramento (26/11)
  {
    id: 'aval-etc-av2-encerramento',
    assessmentId: 'aval-etc-av2-encerramento',
    title: 'AV2: Encerramento & Conferência de Notas (Sem Prova Escrita)',
    subject: 'Ética Cristã',
    professor: 'Profª Karoline Evangelista',
    dueDate: '2026-11-26',
    priority: 'Normal',
    type: 'Seminário em Grupo',
    status: 'todo',
    strategyNote: '26/11/2026 às 19:00–20:25 BRT. NÃO haverá prova escrita na AV2; nota semestral 100% integralizada nos Seminários dos Dez Mandamentos.',
    subtasks: buildOfficialSubtasks('aval-etc-av2-encerramento', false),
  },
  // 13c. NT III — Epístolas Gerais - AV2 (26/11)
  {
    id: 'aval-nt3-av2-epistolas',
    assessmentId: 'aval-nt3-av2-epistolas',
    title: 'AV2: Prova Objetiva 10 Questões — Epístolas Gerais',
    subject: 'Novo Testamento III — Epístolas Gerais',
    professor: 'Profº Marcio Leal',
    dueDate: '2026-11-26',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: '26/11/2026 às 20:35–22:00 BRT (18:35–20:00 Tabatinga). 10 questões via Forms (1,0 pt cada), sem consulta, slides + Carson/Moo/Morris.',
    subtasks: buildOfficialSubtasks('aval-nt3-av2-epistolas', false),
  },
  // 14. Plantação e Revitalização II - Prova Consulta Livre + Resumo 12 pág (27/11)
  {
    id: 'aval-9-plantacao-resumo-livro',
    assessmentId: 'aval-9-plantacao-resumo-livro',
    title: 'AV2: Prova com Consulta Livre (19h) + Resumo 12 pág (até 23:59)',
    subject: 'Plantação e Revitalização de Igrejas II',
    professor: 'Profº Thácyto Lessa',
    dueDate: '2026-11-27',
    priority: 'Máxima',
    type: 'Resumo Crítico',
    status: 'todo',
    strategyNote: '27/11/2026: Prova AV2 às 19:00 BRT com CONSULTA LIVRE aos slides, anotações e PDF consolidado + envio do Resumo digitado de 12 páginas (PDF ou Word) de "A Treliça e a Videira" para thacyto@gmail.com até 23:59.',
    subtasks: buildOfficialSubtasks('aval-9-plantacao-resumo-livro', false),
  },
  // 14b. Cultura Afro-Brasileira e Indígena (AFR-101) - Trabalho Final Aplicado (28/11)
  {
    id: 'aval-afro-av2-trabalho',
    assessmentId: 'aval-afro-av2-trabalho',
    title: 'AV2 (Única): Trabalho Final Aplicado — 2 Laudas (Sem Prova)',
    subject: 'História e Cultura Afro-Brasileira e Indígena (AFR-101)',
    professor: 'Profº Alexsandro de Oliveira Silva',
    dueDate: '2026-11-28',
    priority: 'Máxima',
    type: 'Trabalho Escrito',
    status: 'todo',
    strategyNote: '28/11/2026 (Sábado) até 23:59 BRT: SEM prova escrita. Assistir às 4 videoaulas (~1h20 cada) e enviar trabalho individual de EXATAMENTE 2 laudas (3 partes: situação-problema, Bíblia + mínimo 2 autores do curso, proposta concreta) para prof.alexsandro@gmail.com.',
    subtasks: buildOfficialSubtasks('aval-afro-av2-trabalho', false),
  },
  // 15. TCC I - Entrega Final do Artigo Monográfico (04/12)
  {
    id: 'aval-12-tcc1-artigo-final',
    assessmentId: 'aval-12-tcc1-artigo-final',
    title: 'Entrega Final: Artigo Monográfico Completo ABNT (20 a 25 pág)',
    subject: 'Trabalho de Conclusão de Curso I (TCC I)',
    professor: 'Profª Gabriela Leal',
    dueDate: '2026-12-04',
    priority: 'Máxima',
    type: 'TCC',
    status: 'todo',
    strategyNote: '04/12/2026 até 23:59 BRT: Artigo científico completo (20 a 25 páginas, PDF e Word) conforme ABNT e Manual FMB. Linguagem impessoal (3ª pessoa). Proibido uso de IA e plágio.',
    subtasks: buildOfficialSubtasks('aval-12-tcc1-artigo-final', false),
  },
];
