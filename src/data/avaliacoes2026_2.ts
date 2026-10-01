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

export interface AvaliacaoEvento {
  id: string;
  disciplina: string;
  disciplinaShort: string;
  professor: string;
  tipo: string;
  tipoBadge: 'PROVA' | 'TRABALHO' | 'SEMINÁRIO' | 'RESUMO' | 'ATIVIDADE' | 'ARTIGO';
  dataLimite: string; // YYYY-MM-DD
  dataTexto: string;
  horario: string;
  peso: string;
  regras: string[];
  passoAPasso: string[];
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

export interface KanbanTask {
  id: string;
  assessmentId?: string;
  title: string;
  subject: string;
  professor: string;
  dueDate: string; // YYYY-MM-DD
  priority: 'Máxima' | 'Média' | 'Normal';
  type: 'Trabalho Escrito' | 'Portfólio' | 'Prova Objetiva' | 'Resumo Crítico' | 'Estudo de Caso' | 'TCC' | 'Seminário em Grupo' | 'Atividade Modular' | string;
  status: 'todo' | 'doing' | 'done';
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
  isHoje?: boolean;
  isProrrogado?: boolean;
}

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
  },
  {
    id: 'cron-06-nt3-av1',
    dataLimite: '01/10/2026 (Qui)',
    dataISO: '2026-10-01',
    disciplina: 'NT III — Epístolas Gerais',
    disciplinaId: 'disc-6',
    docente: 'Profº Marcio Leal',
    tipoAtividade: 'Prova Objetiva AV1 (Hebreus a 2 Pedro)',
    statusPeso: 'Prazo Hoje (23:59)',
    isHoje: true,
  },
  {
    id: 'cron-07-dir-prova-av1',
    dataLimite: '04/10/2026 (Dom)',
    dataISO: '2026-10-04',
    disciplina: 'Direitos Humanos',
    disciplinaId: 'disc-4',
    docente: 'Profº Cleiton Barbirato',
    tipoAtividade: 'Prova Objetiva AV1 (Google Forms)',
    statusPeso: 'Prorrogado até 23:59 (Peso 8,0)',
    isProrrogado: true,
  },
  {
    id: 'cron-08-etc-seminarios',
    dataLimite: '22/10 a 19/11/2026',
    dataISO: '2026-10-22',
    disciplina: 'Ética Cristã',
    disciplinaId: 'disc-5',
    docente: 'Profª Karoline Evangelista',
    tipoAtividade: 'Seminários dos Dez Mandamentos',
    statusPeso: 'Em Breve (Individual)',
  },
  {
    id: 'cron-09-dam-exame',
    dataLimite: '07/11/2026 (Sáb)',
    dataISO: '2026-11-07',
    disciplina: 'Exame DAM / UIECB',
    disciplinaId: 'disc-dam',
    docente: 'Diretoria Regional',
    tipoAtividade: 'Prova Objetiva Presencial (09:00 - 12:00)',
    statusPeso: 'Avaliação Denominacional',
  },
  {
    id: 'cron-10-his-av2',
    dataLimite: '24/11/2026 (Ter)',
    dataISO: '2026-11-24',
    disciplina: 'Hist. do Congregacionalismo',
    disciplinaId: 'disc-1',
    docente: 'Profº Ary Júnior',
    tipoAtividade: 'Prova Escrita AV2 (Brasil)',
    statusPeso: 'Prova Final (Peso 8,0)',
  },
  {
    id: 'cron-11-hpc-av2',
    dataLimite: '24/11/2026 (Ter)',
    dataISO: '2026-11-24',
    disciplina: 'Hist. do Pensamento Cristão II',
    disciplinaId: 'disc-2',
    docente: 'Profº Hilário Bispo',
    tipoAtividade: 'Prova AV2 (Teologia Liberal e Século XX)',
    statusPeso: 'Prova Final',
  },
  {
    id: 'cron-12-aco-av2',
    dataLimite: '25/11/2026 (Qua)',
    dataISO: '2026-11-25',
    disciplina: 'Aconselhamento Bíblico II',
    disciplinaId: 'disc-3',
    docente: 'Profº Uilian Santos',
    tipoAtividade: 'Prova Objetiva AV2 (Google Forms)',
    statusPeso: 'Prova Final',
  },
  {
    id: 'cron-13-dir-av2',
    dataLimite: '25/11/2026 (Qua)',
    dataISO: '2026-11-25',
    disciplina: 'Direitos Humanos',
    disciplinaId: 'disc-4',
    docente: 'Profº Cleiton Barbirato',
    tipoAtividade: 'Prova Objetiva AV2 + Trabalho AV2',
    statusPeso: 'Prova Final (8,0 + 2,0)',
  },
  {
    id: 'cron-14-pla-resumo-av2',
    dataLimite: '27/11/2026 (Sex)',
    dataISO: '2026-11-27',
    disciplina: 'Plantação e Revitalização II',
    disciplinaId: 'disc-7',
    docente: 'Profº Thácyto Lessa',
    tipoAtividade: 'Entrega Resumo (12 pág) + Prova AV2',
    statusPeso: 'AV1 (Resumo) + AV2 (Prova)',
  },
  {
    id: 'cron-15-tcc-artigo',
    dataLimite: '04/12/2026 (Sex)',
    dataISO: '2026-12-04',
    disciplina: 'TCC I',
    disciplinaId: 'disc-8',
    docente: 'Profª Gabriela Leal',
    tipoAtividade: 'Entrega Final do Artigo (20 a 25 pág)',
    statusPeso: 'Artigo Monográfico ABNT',
  },
];

/**
 * AVALIACOES OFICIAIS COM METADADOS COMPLETOS PARA O CALENDÁRIO VISUAL, MODAIS E DRAWERS
 */
export const AVALIACOES_2026_2: AvaliacaoEvento[] = [
  {
    id: 'aval-0-tcc1-projeto-pesquisa',
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
    disciplina: 'História do Congregacionalismo',
    disciplinaShort: 'Hist. Congregacionalismo (AV2)',
    professor: 'Profº Ary Júnior',
    tipo: 'Prova Escrita AV2: Congregacionalismo no Brasil',
    tipoBadge: 'PROVA',
    dataLimite: '2026-11-24',
    dataTexto: '24 de Novembro de 2026 (Terça-feira)',
    horario: '18:30 às 20:25 (Durante a aula)',
    peso: 'Prova Final da 2ª Unidade (Peso 8,0 + 1,0 Frequência + 1,0 Leitura)',
    regras: [
      'Prova escrita final da segunda unidade sobre a vertente brasileira (Kalley, Igreja Fluminense e expansão).',
      'Câmeras abertas durante a realização.',
      'Autodeclaração de leitura obrigatória (+1 ponto).'
    ],
    passoAPasso: [
      'Revisar os textos sobre a chegada de Robert Kalley, Fundação da Igreja Evangélica Fluminense e desenvolvimento do congregacionalismo no Brasil.',
      'Conectar-se com câmera aberta no horário da aula no dia 24/11/2026.',
      'Preencher e submeter o formulário de avaliação.'
    ],
    bibliografia: {
      obrigatoria: [
        'Textos da Unidade 2 em PDF disponibilizados pelo docente',
        'Livro sobre Congregacionalismo no Brasil'
      ]
    },
    canalEnvio: {
      tipo: 'forms',
      observacao: 'Link liberado no início da aula síncrona.'
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
    disciplina: 'História do Pensamento Cristão II',
    disciplinaShort: 'Pensamento Cristão II (AV2)',
    professor: 'Profº Hilário Bispo',
    tipo: 'Prova Objetiva AV2: Teologia Liberal e Século XX',
    tipoBadge: 'PROVA',
    dataLimite: '2026-11-24',
    dataTexto: '24 de Novembro de 2026 (Terça-feira)',
    horario: '20:30 (Horário da aula)',
    peso: 'Prova Final (0,0 a 10,0) — Resultado instantâneo',
    regras: [
      'Prova objetiva contendo 10 questões via Google Forms.',
      'Conteúdo: Liberalismo Teológico (Schleiermacher, Ritschl), Ortodoxia e Teologia Contemporânea.',
      'Resultado e correção instantâneos.'
    ],
    passoAPasso: [
      'Estudar os slides e a apostila da segunda unidade.',
      'Acessar o link do Google Forms disponibilizado no dia 24/11/2026 às 20:30.',
      'Responder às 10 questões objetivas e submeter.'
    ],
    bibliografia: {
      obrigatoria: [
        'Apostila oficial do Profº Hilário Bispo',
        'Slides das aulas sobre Liberalismo e Século XX'
      ]
    },
    canalEnvio: {
      tipo: 'forms',
      observacao: 'Formulário online com 10 questões de correção imediata.'
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
    disciplina: 'Aconselhamento Bíblico II',
    disciplinaShort: 'Aconselhamento Bíblico II (AV2)',
    professor: 'Profº Uilian Santos',
    tipo: 'Prova Objetiva AV2 via Google Forms',
    tipoBadge: 'PROVA',
    dataLimite: '2026-11-25',
    dataTexto: '25 de Novembro de 2026 (Quarta-feira)',
    horario: '19:00 às 20:25 (Durante a aula)',
    peso: 'Prova Final (0,0 a 10,0) — Sem trabalhos escritos',
    regras: [
      'Segunda prova objetiva semestral via Google Forms.',
      'Conteúdo restrito aos slides da segunda metade do semestre.',
      'Sem exigência de trabalhos escritos; correção automática.'
    ],
    passoAPasso: [
      'Revisar os slides das aulas da 2ª unidade.',
      'Acessar o Google Forms no dia 25/11/2026 às 19:00.',
      'Submeter as respostas para obter a nota.'
    ],
    bibliografia: {
      obrigatoria: [
        'Slides de aula do Profº Uilian Santos'
      ]
    },
    canalEnvio: {
      tipo: 'forms',
      observacao: 'Link disponibilizado no Meet e grupo da turma.'
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
    disciplina: 'Direitos Humanos',
    disciplinaShort: 'Direitos Humanos (AV2)',
    professor: 'Profº Cleiton Barbirato',
    tipo: 'Prova Objetiva AV2 (Peso 8,0) + Trabalho AV2 (Peso 2,0)',
    tipoBadge: 'PROVA',
    dataLimite: '2026-11-25',
    dataTexto: '25 de Novembro de 2026 (Quarta-feira)',
    horario: '20:30 (Horário da aula)',
    peso: 'Composição Final da V2: Prova (8,0) + Trabalho (2,0) = 10,0 pts',
    regras: [
      'Prova objetiva via Google Forms sem consulta (peso 8,0) + pesquisa escrita individual (peso 2,0).',
      'Média semestral final >= 7,0 para aprovação direta.'
    ],
    passoAPasso: [
      'Revisar a apostila completa de Direitos Humanos da segunda unidade.',
      'Elaborar e enviar a pesquisa individual para cleitonpb@gmail.com.',
      'Realizar a prova objetiva no horário da aula em 25/11/2026.'
    ],
    bibliografia: {
      obrigatoria: [
        'Slides oficiais da disciplina de Direitos Humanos'
      ]
    },
    canalEnvio: {
      tipo: 'forms',
      destinatario: 'cleitonpb@gmail.com',
      observacao: 'Prova no Forms e envio da pesquisa por e-mail.'
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
    id: 'aval-9-plantacao-resumo-livro',
    disciplina: 'Plantação e Revitalização de Igrejas II',
    disciplinaShort: 'Plantação (Resumo Digitado + AV2)',
    professor: 'Profº Thácyto Lessa',
    tipo: 'Entrega do Resumo Digitado (12 pág) + Prova AV2 com consulta',
    tipoBadge: 'RESUMO',
    dataLimite: '2026-11-27',
    dataTexto: '27 de Novembro de 2026 (Sexta-feira)',
    horario: 'Até às 19:00 (Envio do Resumo) / 19:00 (Prova AV2)',
    peso: 'AV1 (Resumo de 12 páginas, 0-10) + AV2 (Prova Online com consulta, 0-10)',
    regras: [
      'FORMATO OBRIGATÓRIO DO RESUMO: Documento DIGITADO em editor de texto (Word, Docs), convertido em PDF (NÃO manuscrito).',
      'Obra exigida: Livro "A Treliça e a Videira" (Colin Marshall e Tony Payne).',
      'Estrutura e extensão: Exatamente 1 folha digitada por capítulo, cobrindo os 12 capítulos do livro (total de 12 páginas no documento final).',
      'Canal de Envio do Resumo: E-mail do docente (thacyto@gmail.com) impreterivelmente até 27/11/2026 às 19:00.',
      'Prova AV2: Prova online aplicada por formulário no dia 27/11/2026 às 19:00 com 100% de consulta autorizada aos slides e anotações pessoais.'
    ],
    passoAPasso: [
      'Realizar a leitura atenta dos 12 capítulos do livro "A Treliça e a Videira".',
      'Sintetizar a ideia central de cada capítulo em editor de texto, respeitando o limite exato de 1 página digitada por capítulo.',
      'Salvar e exportar o arquivo em formato PDF (documento digitado, sem páginas manuscritas).',
      'Enviar o arquivo por e-mail para thacyto@gmail.com com assunto "Resumo Treliça e a Videira - Plantação II - [Seu Nome]" até 27/11 às 19:00.',
      'Acessar o link do formulário da Prova AV2 às 19:00 e responder com consulta às suas anotações e aos slides.'
    ],
    bibliografia: {
      obrigatoria: [
        '"A Treliça e a Videira" (Colin Marshall e Tony Payne)',
        'Slides completos do curso do Profº Thácyto Lessa'
      ]
    },
    canalEnvio: {
      tipo: 'email',
      destinatario: 'thacyto@gmail.com',
      assunto: 'Resumo Treliça e a Videira - Plantação II - [Seu Nome]',
      observacao: 'Envio em PDF digitado para thacyto@gmail.com até 27/11/2026. Prova online com consulta no mesmo dia.'
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
    id: 'aval-12-tcc1-artigo-final',
    disciplina: 'TCC I - Trabalho de Conclusão de Curso I',
    disciplinaShort: 'TCC I (Artigo Científico ABNT)',
    professor: 'Profª Gabriela Leal',
    tipo: 'Entrega Final do Artigo Científico Completo (20 a 25 páginas)',
    tipoBadge: 'ARTIGO',
    dataLimite: '2026-12-04',
    dataTexto: '04 de Dezembro de 2026 (Sexta-feira)',
    horario: 'Até às 23:59 (Encerramento de TCC I)',
    peso: 'Artigo Monográfico ABNT / Nota Final de Conclusão de TCC I',
    regras: [
      'EXTENSÃO OBRIGATÓRIA: Artigo científico final com extensão de 20 a 25 páginas no total (contemplando capa, folha de rosto, elementos pré e pós-textuais).',
      'Estrutura completa: Capa, Folha de Rosto, Resumo bilíngue de 10-15 linhas com 3-4 palavras-chave, Introdução, Metodologia, Resultados/Discussão, Considerações Finais e Referências em ordem alfabética.',
      'Normas formais: Normas rígidas da ABNT e Manual da Faculdade Maciço do Baturité (FMB).',
      'Linguagem: Científica e impessoal (3ª pessoa: "observa-se", "analisa-se"). Proibido uso de 1ª pessoa.',
      'Ética: Rigorosamente PROIBIDO o uso de Inteligência Artificial para geração de texto ou redação por terceiros.'
    ],
    passoAPasso: [
      'Revisar o referencial teórico e dados metodológicos desenvolvidos com o professor orientador.',
      'Redigir o desenvolvimento do artigo na ordem recomendada: Metodologia → Resultados/Discussão → Considerações Finais.',
      'Escrever por último a Introdução e o Resumo bilíngue (10 a 15 linhas) com 3 a 4 palavras-chave.',
      'Verificar a extensão total do documento garantindo que esteja entre 20 e 25 páginas.',
      'Formatar as referências em ordem alfabética segundo o padrão ABNT / FMB.',
      'Exportar o artigo completo em PDF e enviar para a orientadora Profa Gabriela Leal até 04/12/2026.'
    ],
    bibliografia: {
      obrigatoria: [
        'Manual de Trabalhos Acadêmicos da Faculdade Maciço do Baturité (FMB)',
        'Normas ABNT vigentes para Artigos Científicos (NBR 6022 e correlatas)',
        'Obras selecionadas para a fundamentação teórica'
      ]
    },
    canalEnvio: {
      tipo: 'email',
      destinatario: 'gabriela.lealg7757@gmail.com',
      assunto: 'Artigo Científico Final - TCC I - [Nome do Aluno]',
      observacao: 'Envio em PDF para a Profa Gabriela Leal até 04/12/2026.'
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
 * TAREFAS KANBAN PADRÃO DO SEMESTRE 2026.2 (CHECKLIST ACADÊMICO)
 */
export const defaultSemesterTasks: KanbanTask[] = [
  // 1. TCC I - Projeto de Pesquisa (04/09)
  {
    id: 'aval-0-tcc1-projeto-pesquisa',
    assessmentId: 'aval-0-tcc1-projeto-pesquisa',
    title: 'Entrega do Projeto de Pesquisa Estruturado ABNT',
    subject: 'Trabalho de Conclusão de Curso I (TCC I)',
    professor: 'Profª Gabriela Leal',
    dueDate: '2026-09-04',
    priority: 'Máxima',
    type: 'TCC',
    status: 'done',
    strategyNote: 'Prazo encerrado em 04/09/2026. Capa, Sumário, Objetivos, Justificativa, Referencial Teórico e Cronograma. Sem IA.',
    subtasks: [
      { id: 'st-aval-0-0', text: 'Definir título provisório, justificativa e objetivos no infinitivo.', done: true },
      { id: 'st-aval-0-1', text: 'Construir referencial teórico com normas ABNT e cronograma em tabela.', done: true },
      { id: 'st-aval-0-2', text: 'Revisar impessoalidade (3ª pessoa), ausência de IA e anexos.', done: true },
    ],
  },
  // 2. História do Congregacionalismo - AV1 (29/09)
  {
    id: 'aval-2-congregacionalismo-av1',
    assessmentId: 'aval-2-congregacionalismo-av1',
    title: 'Prova Escrita (AV1) — Congregacionalismo Mundial',
    subject: 'História do Congregacionalismo',
    professor: 'Profº Ary Júnior',
    dueDate: '2026-09-29',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'done',
    strategyNote: 'Prazo concluído em 29/09/2026. Prova: 8,0 | Câmera aberta: 1,0 | Leitura obrigatória autodeclarada: 1,0.',
    subtasks: [
      { id: 'st-aval-2-0', text: 'Acessar os textos em PDF compartilhados pelo professor.', done: true },
      { id: 'st-aval-2-1', text: 'Realizar a leitura integral sobre Reforma Inglesa e Puritanos.', done: true },
      { id: 'st-aval-2-2', text: 'Conectar-se com câmera aberta na aula de 29/09/2026.', done: true },
      { id: 'st-aval-2-3', text: 'Preencher a avaliação escrita e confirmação de leitura.', done: true },
    ],
  },
  // 3. História do Pensamento Cristão II - AV1 (29/09)
  {
    id: 'aval-3-pensamento-cristao-av1',
    assessmentId: 'aval-3-pensamento-cristao-av1',
    title: 'Trabalho Acadêmico ABNT (AV1) — Iluminismo & Modernidade',
    subject: 'História do Pensamento Cristão II',
    professor: 'Profº Hilário Bispo',
    dueDate: '2026-09-29',
    priority: 'Máxima',
    type: 'Trabalho Escrito',
    status: 'done',
    strategyNote: 'Prazo concluído em 29/09/2026. Mínimo de 5 a 6 páginas nas normas ABNT. Individual ou grupos de até 3.',
    subtasks: [
      { id: 'st-aval-3-0', text: 'Definir a composição do trabalho (individual ou grupo até 3).', done: true },
      { id: 'st-aval-3-1', text: 'Revisar os slides sobre Iluminismo e Modernidade.', done: true },
      { id: 'st-aval-3-2', text: 'Redigir a pesquisa de 5-6 páginas no padrão ABNT.', done: true },
      { id: 'st-aval-3-3', text: 'Entregar o trabalho por e-mail para hilario.graca@catolica.edu.br.', done: true },
    ],
  },
  // 4. Aconselhamento Bíblico II - AV1 (30/09)
  {
    id: 'aval-4-aconselhamento-av1',
    assessmentId: 'aval-4-aconselhamento-av1',
    title: 'Prova Objetiva AV1 via Google Forms',
    subject: 'Aconselhamento Bíblico II',
    professor: 'Profº Uilian Santos',
    dueDate: '2026-09-30',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'done',
    strategyNote: 'Prazo concluído em 30/09/2026. Múltipla escolha via Forms restrita aos slides 1 a 6. Sem trabalhos escritos.',
    subtasks: [
      { id: 'st-aval-4-0', text: 'Estudar os slides das aulas 1 a 6 da disciplina.', done: true },
      { id: 'st-aval-4-1', text: 'Fixar tópicos: Suficiência Bíblica, Jó, Pecado/Ídolos e Inventário.', done: true },
      { id: 'st-aval-4-2', text: 'Acessar o link do Google Forms e responder às questões.', done: true },
    ],
  },
  // 5. Direitos Humanos - Trabalho AV1 (30/09)
  {
    id: 'aval-5-direitos-humanos-trabalho',
    assessmentId: 'aval-5-direitos-humanos-trabalho',
    title: 'Trabalho Dissertativo AV1: Desigualdade Social & Privilégios (1 lauda)',
    subject: 'Direitos Humanos',
    professor: 'Profº Cleiton Barbirato',
    dueDate: '2026-09-30',
    priority: 'Máxima',
    type: 'Trabalho Escrito',
    status: 'done',
    strategyNote: 'Prazo encerrado em 30/09/2026 às 23:59. Máximo 1 lauda, Times 12, esp. 1,5. Envio por e-mail (cleitonpb@gmail.com). Vale 2,0 pts.',
    subtasks: [
      { id: 'st-aval-5-0', text: 'Assistir ao vídeo da aula de 26/09 sobre desigualdade social e privilégios.', done: true },
      { id: 'st-aval-5-1', text: 'Redigir dissertação de até 1 lauda em Times New Roman 12, esp. 1,5.', done: true },
      { id: 'st-aval-5-2', text: 'Enviar arquivo para cleitonpb@gmail.com com assunto "Trabalho para composição de nota".', done: true },
    ],
  },
  // 6. NT III — Epístolas Gerais - Prova AV1 (01/10)
  {
    id: 'aval-7-nt3-epistolas-av1',
    assessmentId: 'aval-7-nt3-epistolas-av1',
    title: 'Prova Objetiva Online (AV1) — Hebreus a 2 Pedro',
    subject: 'Novo Testamento III — Epístolas Gerais',
    professor: 'Profº Marcio Leal',
    dueDate: '2026-10-01',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: 'Prazo Hoje (01/10/2026 às 23:59). Prova Objetiva Online via formulário Google Forms sobre Hebreus, Tiago, 1 Pedro e 2 Pedro.',
    subtasks: [
      { id: 'st-aval-7-0', text: 'Revisar anotações de aula e slides sobre Hebreus, Tiago, 1 Pedro e 2 Pedro.', done: false },
      { id: 'st-aval-7-1', text: 'Estudar introduções especiais e propósitos das epístolas no livro de Carson/Moo/Morris.', done: false },
      { id: 'st-aval-7-2', text: 'Acessar o formulário Google Forms disponibilizado pelo docente no dia 01/10/2026.', done: false },
      { id: 'st-aval-7-3', text: 'Preencher a avaliação objetiva e submeter antes das 23:59.', done: false },
    ],
  },
  // 7. Direitos Humanos - Prova Objetiva AV1 (04/10 - Prorrogado)
  {
    id: 'aval-6-direitos-humanos-prova',
    assessmentId: 'aval-6-direitos-humanos-prova',
    title: 'Prova Objetiva AV1 via Google Forms (Prorrogada para 04/10)',
    subject: 'Direitos Humanos',
    professor: 'Profº Cleiton Barbirato',
    dueDate: '2026-10-04',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: 'Prazo prorrogado até domingo, 04/10/2026 às 23:59. Múltipla escolha via Google Forms, sem consulta (Peso 8,0).',
    subtasks: [
      { id: 'st-aval-6-0', text: 'Estudar a apostila digital completa da disciplina.', done: false },
      { id: 'st-aval-6-1', text: 'Revisar Dignidade da Pessoa Humana, Declaração de 1948, Gerações de Direitos e Kelsen.', done: false },
      { id: 'st-aval-6-2', text: 'Acessar o formulário do Google Forms ativo até 04/10/2026 às 23:59.', done: false },
      { id: 'st-aval-6-3', text: 'Responder às questões sem consulta e submeter.', done: false },
    ],
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
    status: 'todo',
    strategyNote: 'Apresentações de 22/10 a 19/11 nas quintas-feiras de aula. 30 min por grupo (quartetos com 10 min por orador cronometrados). Nota estritamente individual. No dia 01/10 não há entrega.',
    subtasks: [
      { id: 'st-aval-8-0', text: 'Reunir o quarteto e confirmar o mandamento sorteado para apresentação.', done: false },
      { id: 'st-aval-8-1', text: 'Estudar o Catecismo Maior de Westminster e Norman Geisler.', done: false },
      { id: 'st-aval-8-2', text: 'Montar os slides da apresentação em conjunto com o grupo.', done: false },
      { id: 'st-aval-8-3', text: 'Treinar exposição oral com cronômetro para respeitar os 10 minutos por orador.', done: false },
    ],
  },
  // 9. Exame DAM / UIECB (07/11)
  {
    id: 'aval-dam-exame-presencial',
    assessmentId: 'aval-dam-exame-presencial',
    title: 'Exame DAM / UIECB — Prova Presencial (09:00 - 12:00)',
    subject: 'Exame DAM / UIECB',
    professor: 'Diretoria Regional',
    dueDate: '2026-11-07',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: '07/11/2026 (Sábado) das 09:00 às 12:00. Avaliação denominacional presencial obrigatória.',
    subtasks: [
      { id: 'st-dam-0', text: 'Revisar matérias de Teologia Sistemática, Bíblia e História Congregacional.', done: false },
      { id: 'st-dam-1', text: 'Confirmar local de realização do exame junto à Diretoria Regional.', done: false },
      { id: 'st-dam-2', text: 'Comparecer com 30 min de antecedência portando documento com foto.', done: false },
    ],
  },
  // 10. História do Congregacionalismo - AV2 (24/11)
  {
    id: 'aval-his-av2-brasil',
    assessmentId: 'aval-his-av2-brasil',
    title: 'AV2: Prova Escrita — Unidade 2 (Congregacionalismo no Brasil)',
    subject: 'História do Congregacionalismo',
    professor: 'Profº Ary Júnior',
    dueDate: '2026-11-24',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: '24/11/2026 às 18:30. Prova final da 2ª unidade (Peso 8,0 + 1,0 frequência + 1,0 leitura obrigatória). Câmeras abertas.',
    subtasks: [
      { id: 'st-his2-0', text: 'Revisar os textos sobre a história do Congregacionalismo no Brasil.', done: false },
      { id: 'st-his2-1', text: 'Acessar a avaliação escrita no horário da aula com câmera aberta.', done: false },
    ],
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
    strategyNote: '24/11/2026 às 20:30. 10 questões de múltipla escolha via Google Forms com resultado instantâneo.',
    subtasks: [
      { id: 'st-hpc2-0', text: 'Estudar a apostila oficial sobre Liberalismo e Século XX.', done: false },
      { id: 'st-hpc2-1', text: 'Acessar o link do Google Forms no horário da aula.', done: false },
    ],
  },
  // 12. Aconselhamento Bíblico II - AV2 (25/11)
  {
    id: 'aval-aco-av2-final',
    assessmentId: 'aval-aco-av2-final',
    title: 'AV2: Prova Objetiva Final via Google Forms',
    subject: 'Aconselhamento Bíblico II',
    professor: 'Profº Uilian Santos',
    dueDate: '2026-11-25',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: '25/11/2026 às 19:00. Prova final 100% objetiva via Google Forms cobrindo os slides da 2ª unidade.',
    subtasks: [
      { id: 'st-aco2-0', text: 'Revisar todos os slides da segunda metade do semestre.', done: false },
      { id: 'st-aco2-1', text: 'Responder à prova objetiva via link do formulário.', done: false },
    ],
  },
  // 13. Direitos Humanos - AV2 (25/11)
  {
    id: 'aval-dir-av2-prova-trabalho',
    assessmentId: 'aval-dir-av2-prova-trabalho',
    title: 'AV2: Prova Objetiva Forms (peso 8) + Pesquisa Escrita (peso 2)',
    subject: 'Direitos Humanos',
    professor: 'Profº Cleiton Barbirato',
    dueDate: '2026-11-25',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: '25/11/2026 às 20:30. Prova objetiva (peso 8,0) + trabalho de pesquisa escrito individual (peso 2,0). Média final >= 7,0.',
    subtasks: [
      { id: 'st-dir2-0', text: 'Elaborar a pesquisa escrita e enviar para cleitonpb@gmail.com.', done: false },
      { id: 'st-dir2-1', text: 'Fazer a prova objetiva no horário da aula.', done: false },
    ],
  },
  // 14. Plantação e Revitalização II - Resumo Digitado + Prova AV2 (27/11)
  {
    id: 'aval-9-plantacao-resumo-livro',
    assessmentId: 'aval-9-plantacao-resumo-livro',
    title: 'AV1: Resumo Digitado (12 pág) + AV2: Prova com Consulta',
    subject: 'Plantação e Revitalização de Igrejas II',
    professor: 'Profº Thácyto Lessa',
    dueDate: '2026-11-27',
    priority: 'Máxima',
    type: 'Resumo Crítico',
    status: 'todo',
    strategyNote: '27/11/2026: Resumo DIGITADO em editor de texto (Word/Docs) convertido em PDF de "A Treliça e a Videira" (exatamente 1 folha digitada por capítulo, 12 páginas) enviado para thacyto@gmail.com até 19:00. Prova AV2 online com consulta às 19:00.',
    subtasks: [
      { id: 'st-aval-9-0', text: 'Ler atentamente os 12 capítulos do livro "A Treliça e a Videira".', done: false },
      { id: 'st-aval-9-1', text: 'Digitar o resumo em editor de texto (1 página digitada por capítulo, totalizando 12 páginas).', done: false },
      { id: 'st-aval-9-2', text: 'Exportar o arquivo em PDF e enviar para thacyto@gmail.com até 27/11 às 19:00.', done: false },
      { id: 'st-aval-9-3', text: 'Realizar a Prova AV2 online às 19:00 com consulta aos slides e anotações.', done: false },
    ],
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
    strategyNote: '04/12/2026: Artigo científico final com extensão de 20 a 25 páginas no total conforme Normas ABNT e Manual da FMB. Capa até Referências. Proibido uso de IA.',
    subtasks: [
      { id: 'st-aval-12-0', text: 'Estruturar o corpo do artigo: Metodologia, Resultados/Discussão e Considerações Finais.', done: false },
      { id: 'st-aval-12-1', text: 'Redigir a Introdução e Resumo bilíngue (10-15 linhas) com 3-4 palavras-chave.', done: false },
      { id: 'st-aval-12-2', text: 'Verificar a extensão exigida de 20 a 25 páginas no total.', done: false },
      { id: 'st-aval-12-3', text: 'Formatar as referências em ordem alfabética no padrão ABNT / FMB.', done: false },
      { id: 'st-aval-12-4', text: 'Submeter o arquivo em PDF para gabriela.lealg7757@gmail.com até 04/12/2026.', done: false },
    ],
  },
];
