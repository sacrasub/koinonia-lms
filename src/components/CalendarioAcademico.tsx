'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, User, BookOpen, 
  CheckCircle2, Circle, AlertTriangle, FileText, 
  ChevronLeft, ChevronRight, X, ExternalLink, 
  Mail, Copy, Check, Sparkles, Filter, List, 
  Grid, ArrowRight, Share2, Award, Info, AlertCircle
} from 'lucide-react';

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

export const AVALIACOES_2026_2: AvaliacaoEvento[] = [
  {
    id: 'aval-1-plantacao-freq',
    disciplina: 'Plantação e Revitalização de Igrejas II',
    disciplinaShort: 'Plantação de Igrejas II',
    professor: 'Profº Thácyto Lessa',
    tipo: 'Atividade Prática / Exercício de Fixação (Aula Gravada)',
    tipoBadge: 'ATIVIDADE',
    dataLimite: '2026-09-18',
    dataTexto: '18 de Setembro de 2026 (Sexta-feira)',
    horario: 'Até às 23:59',
    peso: 'Pontuação na nota de participação e frequência',
    regras: [
      'Texto digitado em folha única com cabeçalho simples.',
      'Sem necessidade de capa ou folha de rosto ABNT.',
      'Entregas após as 23:59 não serão contabilizadas.'
    ],
    passoAPasso: [
      'Assistir ao vídeo da aula gravada disponibilizado pelo professor (~1h20 de duração).',
      'Responder às questões propostas sobre a aula no caderno ou bloco de notas.',
      'Digitar as respostas em um documento simples contendo apenas o cabeçalho (Nome, Disciplina e Data).',
      'Salvar e enviar o arquivo por e-mail para o docente impreterivelmente até às 23:59.'
    ],
    bibliografia: {
      obrigatoria: [
        'Vídeoaula gravada da disciplina',
        'Slides oficiais de aula do Profº Thácyto Lessa'
      ]
    },
    canalEnvio: {
      tipo: 'email',
      destinatario: 'thacyto@gmail.com',
      assunto: 'Atividade Prática de Frequência - Plantação II - [Seu Nome]',
      observacao: 'Envio por e-mail até às 23:59 do dia 18/09/2026.'
    },
    cor: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-300',
      border: 'border-emerald-500/30',
      pillBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      dot: 'bg-emerald-400',
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-300'
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
    peso: 'Nota total da 1ª Unidade = 10,0 pontos (Prova: 8,0 | Câmera aberta: 1,0 | Leitura: 1,0)',
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
    tipo: 'Trabalho Escrito de Pesquisa Acadêmica (AV1)',
    tipoBadge: 'TRABALHO',
    dataLimite: '2026-09-29',
    dataTexto: '29 de Setembro de 2026 (Terça-feira)',
    horario: '20:30 (Data da Prova AV1)',
    peso: 'Nota integral da AV1 (0,0 a 10,0). Não entrega exige avaliação substitutiva (AV3)',
    regras: [
      'Formato: Individual ou em grupo de no máximo 2 a 3 integrantes.',
      'Extensão obrigatória: Mínimo de 5 a 6 páginas de conteúdo.',
      'Normas formais: Formatação rigorosa nas normas da ABNT.',
      'Exigência de delimitação: O tema deve ser devidamente delimitado, evitando dispersão teórica.'
    ],
    passoAPasso: [
      'Definir a composição do trabalho (individual ou grupo de até 3 alunos).',
      'Revisar os slides fornecidos na primeira aula sobre a estrutura e os requisitos do trabalho.',
      'Estruturar a pesquisa cobrindo o tema Iluminismo e Modernidade: Racionalismo (Descartes), Empirismo (Locke, Kant), autonomia da razão vs. revelação, crítica à Bíblia/milagres e liberalismo teológico.',
      'Redigir o texto com no mínimo 5 a 6 páginas no padrão ABNT.',
      'Entregar o trabalho na data da prova (29/09/2026).'
    ],
    bibliografia: {
      obrigatoria: [
        'Slides e anotações das aulas do Profº Hilário Bispo',
        'Obras de René Descartes (Discurso do Método), John Locke, Immanuel Kant e David Hume'
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
      observacao: 'Submissão por e-mail ou upload na plataforma até o dia 29/09/2026.'
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
    tipo: 'Prova Objetiva Online (Sem Trabalho Escrito)',
    tipoBadge: 'PROVA',
    dataLimite: '2026-09-30',
    dataTexto: '30 de Setembro de 2026 (Quarta-feira)',
    horario: '19:00 às 20:25 (Durante a aula)',
    peso: 'Nota integral da AV1 (0,0 a 10,0)',
    regras: [
      'Prova composta exclusivamente por questões objetivas de múltipla escolha via Google Forms.',
      'Rigorosamente SEM CONSULTA a materiais externos durante a realização.',
      'Conteúdo cobrado estritamente restrito às informações contidas nos slides apresentados.',
      'A correção e a nota são geradas automaticamente após o envio do formulário.'
    ],
    passoAPasso: [
      'Estudar os slides das aulas 1 a 6 disponibilizados na pasta da disciplina.',
      'Fixar os tópicos centrais: Suficiência das Escrituras vs. Terapias/Psicologia, Aconselhamento no Livro de Jó, Pecado e Ídolos do Coração, e as 5 Áreas do Inventário (Físico/Sono, Recursos, Emoções, Ações e Crenças).',
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
    tipo: 'Trabalho Escrito Dissertativo / Pesquisa Individual (AV1)',
    tipoBadge: 'TRABALHO',
    dataLimite: '2026-09-30',
    dataTexto: '30 de Setembro de 2026 (Quarta-feira)',
    horario: 'Até às 23:59 (Prazo Improrrogável)',
    peso: 'Vale até 2,0 pontos na AV1 (soma aos 8,0 pontos da prova objetiva)',
    regras: [
      'Extensão máxima: Exatamente até 1 lauda (1 página A4).',
      'Fonte: Times New Roman, tamanho 12.',
      'Espaçamento: 1,5 entre linhas.',
      'Estrutura: Texto dissertativo autoral individual (3 parágrafos: introdução, desenvolvimento e conclusão) sobre "Desigualdade Social e Privilégios" com base no vídeo da corrida da vida e o papel da Igreja.',
      'Proibição estrita: Proibido uso de Inteligência Artificial (ChatGPT) ou cópias.'
    ],
    passoAPasso: [
      'Assistir ao vídeo indicado pelo professor ("A corrida da vida / Pergunta aos jovens sobre privilégios").',
      'Refletir sobre a desigualdade social, a distribuição de oportunidades e o papel da Igreja como agente de transformação e promoção da dignidade humana.',
      'Redigir um texto dissertativo autoral de até 1 página em Times New Roman 12, espaçamento 1,5.',
      'Enviar o arquivo (PDF ou Word) para o e-mail do professor com o assunto obrigatório: "Trabalho para composição de notas".',
      'Enviar antes das 23:59 do dia 30/09/2026.'
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
      assunto: 'Trabalho para composição de notas',
      observacao: 'O assunto do e-mail DEVE ser exatamente "Trabalho para composição de notas".'
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
    id: 'aval-6-direitos-humanos-prova',
    disciplina: 'Direitos Humanos',
    disciplinaShort: 'Direitos Humanos (Prova)',
    professor: 'Profº Cleiton Barbirato',
    tipo: 'Prova Objetiva de Múltipla Escolha (AV1)',
    tipoBadge: 'PROVA',
    dataLimite: '2026-09-30',
    dataTexto: '30 de Setembro de 2026 (Quarta-feira)',
    horario: '20:30 (Horário da aula)',
    peso: 'Peso 8,0 (Vale até 8,0 pontos da nota da AV1)',
    regras: [
      'Prova objetiva de múltipla escolha realizada via Google Forms.',
      'Rigorosamente SEM CONSULTA a materiais, livros, constituição ou Inteligência Artificial.'
    ],
    passoAPasso: [
      'Estudar a apostila digital composta por todos os slides disponibilizados na pasta do curso.',
      'Revisar os conteúdos: Conceito de Direitos Humanos, Dignidade da Pessoa Humana, Mínimo Existencial, Declaração Universal de 1948, Gerações/Dimensões dos Direitos, Jusnaturalismo, Positivismo, Pirâmide de Kelsen e Cláusulas Pétreas.',
      'Acessar o formulário do Google Forms no dia 30/09/2026 no horário de aula.',
      'Responder às questões sem consulta e submeter.'
    ],
    bibliografia: {
      obrigatoria: [
        'Slides oficiais do curso (disponíveis na pasta do Google Drive da disciplina)'
      ]
    },
    canalEnvio: {
      tipo: 'forms',
      observacao: 'Link do Google Forms liberado no horário de início da aula.'
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
    id: 'aval-7-nt3-epistolas-av1',
    disciplina: 'Novo Testamento III - Epístolas Gerais',
    disciplinaShort: 'Novo Testamento III',
    professor: 'Profº Marcio Leal',
    tipo: 'Prova Objetiva (AV1)',
    tipoBadge: 'PROVA',
    dataLimite: '2026-10-01',
    dataTexto: '01 de Outubro de 2026 (Quinta-feira)',
    horario: '20:25 (Durante o horário da aula)',
    peso: 'Nota integral da AV1 (0,0 a 10,0)',
    regras: [
      'Prova objetiva via formulário Google Forms cobrindo o conteúdo de aula e bibliografia.'
    ],
    passoAPasso: [
      'Revisar as anotações feitas em aula e os slides sobre Hebreus, Tiago, 1 Pedro e 2 Pedro.',
      'Estudar as introduções especiais, autoria, destinatários e propósitos das epístolas.',
      'Acessar o formulário no dia 01/10/2026 no horário da aula.',
      'Preencher o exame e enviar.'
    ],
    bibliografia: {
      obrigatoria: [
        '"Introdução ao Novo Testamento" (D. A. Carson, Douglas J. Moo e Leon L. Morris)',
        'Texto bíblico das Epístolas Gerais (Hebreus, Tiago, 1 Pedro, 2 Pedro)'
      ]
    },
    canalEnvio: {
      tipo: 'forms',
      observacao: 'Link do Google Forms disponibilizado pelo docente no chat da aula.'
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
    id: 'aval-8-etica-crista-seminario',
    disciplina: 'Ética Cristã',
    disciplinaShort: 'Ética Cristã (Tribuna)',
    professor: 'Profª Karoline Evangelista',
    tipo: 'Seminário em Grupo + Apresentação Oral Individual na Tribuna',
    tipoBadge: 'SEMINÁRIO',
    dataLimite: '2026-10-22',
    dataTexto: '22 de Outubro a 19 de Novembro de 2026 (Quintas-feiras)',
    horario: '18:45 às 20:25 (30 min por grupo / 10 min por orador)',
    peso: 'Nota unificada de AV1 (Grupo: pesquisa e slides) e AV2 (Individual: oratória na tribuna)',
    regras: [
      'Formação de equipes: Duplas, trios ou quartetos organizados para abordar um dos Dez Mandamentos.',
      'Tempo de apresentação: Rigorosamente 30 minutos por grupo (controlado por cronômetro). Em trios/quartetos, cada integrante tem exatamente 10 minutos de fala individual.',
      'Conteúdo obrigatório: Eclesiologia e doutrina do mandamento a partir do Catecismo Maior de Westminster + aplicações práticas contemporâneas para a Ética Cristã.'
    ],
    passoAPasso: [
      'Reunir-se com a equipe definida em sala e confirmar o mandamento sorteado (1º ao 10º Mandamento).',
      'Estudar o trecho correspondente do Catecismo Maior de Westminster (deveres exigidos e pecados proibidos).',
      'Consultar a obra "Ética Cristã" de Norman Geisler para enriquecer com os conceitos de Absolutismo Graduado e dilemas morais contemporâneos.',
      'Montar os slides da apresentação em conjunto.',
      'Treinar a exposição individual com cronômetro para não ultrapassar 10 minutos por orador no dia agendado.'
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
      observacao: 'Envio prévio dos slides no grupo da turma e apresentação oral ao vivo via Google Meet no dia agendado do grupo.'
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
    id: 'aval-9-plantacao-resumo-livro',
    disciplina: 'Plantação e Revitalização de Igrejas II',
    disciplinaShort: 'Plantação (Resumo Livro)',
    professor: 'Profº Thácyto Lessa',
    tipo: 'Trabalho Escrito de Resumo de Livro Capítulo por Capítulo (AV1)',
    tipoBadge: 'RESUMO',
    dataLimite: '2026-11-27',
    dataTexto: '27 de Novembro de 2026 (Sexta-feira)',
    horario: 'Até às 19:00 (Horário da Prova)',
    peso: 'Nota integral da AV1 (0,0 a 10,0)',
    regras: [
      'Obra exigida: Livro "A Treliça e a Videira".',
      'Estrutura: Resumo capítulo por capítulo dos 12 capítulos do livro.',
      'Limite rígido de extensão: Exatamente 1 folha (1 página) por capítulo, totalizando no máximo 12 folhas (12 páginas) no documento final.',
      'Entregas com atraso acarretarão perda proporcional de pontos.'
    ],
    passoAPasso: [
      'Realizar a leitura atenta dos 12 capítulos do livro "A Treliça e a Videira".',
      'Sintetizar a ideia central de cada capítulo (analogia da treliça/estrutura e videira/pessoas, priorização do crescimento orgânico e formação de obreiros).',
      'Redigir o resumo respeitando rigorosamente o limite de 1 página para cada capítulo.',
      'Formatar o trabalho e enviá-lo em formato PDF/Word por e-mail até o dia 27/11/2026 (pode ser enviado antecipadamente).'
    ],
    bibliografia: {
      obrigatoria: [
        '"A Treliça e a Videira" (Colin Marshall e Tony Payne)'
      ]
    },
    canalEnvio: {
      tipo: 'email',
      destinatario: 'thacyto@gmail.com',
      assunto: 'Resumo Treliça e a Videira - Plantação II - [Seu Nome]',
      observacao: 'Envio por e-mail para thacyto@gmail.com em PDF ou Word.'
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
    id: 'aval-10-plantacao-prova-av2',
    disciplina: 'Plantação e Revitalização de Igrejas II',
    disciplinaShort: 'Plantação (Prova AV2)',
    professor: 'Profº Thácyto Lessa',
    tipo: 'Prova Objetiva Online (AV2)',
    tipoBadge: 'PROVA',
    dataLimite: '2026-11-27',
    dataTexto: '27 de Novembro de 2026 (Sexta-feira)',
    horario: '19:00 (Horário da aula)',
    peso: 'Nota integral da AV2 (0,0 a 10,0)',
    regras: [
      'Prova objetiva online realizada através do link enviado pelo professor.',
      'Conteúdo cobrado com base nos slides de todas as aulas do semestre.'
    ],
    passoAPasso: [
      'Revisar todos os slides fornecidos durante o semestre.',
      'Estudar os tópicos centrais: 9 marcas de uma igreja saudável, distinção entre plantação/manutenção/revitalização/revivamento, os 4 Ps da revitalização (Pregar, Piedade, Pastorear, Perseverar) e os tipos de igreja.',
      'Acessar o link do formulário disponibilizado no dia 27/11/2026 às 19:00.',
      'Responder às questões objetivas e submeter.'
    ],
    bibliografia: {
      obrigatoria: [
        'Slides das aulas e anotações do Profº Thácyto Lessa'
      ]
    },
    canalEnvio: {
      tipo: 'forms',
      observacao: 'Formulário online disponibilizado no horário da aula.'
    },
    cor: {
      bg: 'bg-teal-500/10',
      text: 'text-teal-300',
      border: 'border-teal-500/30',
      pillBg: 'bg-teal-600 hover:bg-teal-500 text-white',
      dot: 'bg-teal-300',
      badgeBg: 'bg-teal-500/20',
      badgeText: 'text-teal-300'
    }
  },
  {
    id: 'aval-11-afro-indigena-final',
    disciplina: 'História e Cultura Afro-Brasileira e Indígena',
    disciplinaShort: 'Afro-Brasileira e Indígena',
    professor: 'Profº Alexsandro de Oliveira Silva',
    tipo: 'Trabalho Escrito / Produção Individual Final Aplicada',
    tipoBadge: 'TRABALHO',
    dataLimite: '2026-11-28',
    dataTexto: '28 de Novembro de 2026 (Encerramento do Módulo EAD)',
    horario: 'Submissão assíncrona até o encerramento do semestre letivo',
    peso: 'Nota Final da disciplina (0,0 a 10,0)',
    regras: [
      'Extensão obrigatória: Exatamente 2 laudas (2 páginas).',
      'Estrutura interna obrigatória em 3 partes:',
      '1. Descrição da situação e explicação do problema étnico-racial/indígena para a igreja ou missão.',
      '2. Análise fundamentada em passagens bíblicas e em pelo menos dois (2) autores estudados.',
      '3. Proposta de uma ação concreta e responsável a ser realizada por pastores, igrejas ou missionários.'
    ],
    passoAPasso: [
      'Assistir às 4 videoaulas gravadas do curso EAD.',
      'Selecionar uma situação real ou caso prático envolvendo questões étnico-raciais ou indígenas no contexto da igreja/missão.',
      'Redigir o texto de 2 laudas contendo a descrição do problema, a análise bíblico-teológica citando no mínimo 2 autores do curso (ex: Silvio Almeida, Gersem Baniwa, Ailton Krenak, Esau McCaulley) e a proposta de ação concreta.',
      'Submeter o arquivo no ambiente virtual da UIECB.'
    ],
    bibliografia: {
      obrigatoria: [
        '"O índio brasileiro: o que você precisa saber sobre os povos indígenas no Brasil de hoje" (Gersem Baniwa)',
        '"Racismo Estrutural" (Silvio Luiz de Almeida)',
        '"Ideias para adiar o fim do mundo" (Ailton Krenak)',
        '"Uma leitura negra" (Esau McCaulley)',
        'Legislação: LDB Art. 26-A (Leis 10.639/03 e 11.645/08), Resolução CNE/CES 4/2016 e Art. 231 da CF'
      ]
    },
    canalEnvio: {
      tipo: 'plataforma',
      observacao: 'Submissão no ambiente virtual EAD do Seminário Teológico Congregacional (UIECB).'
    },
    cor: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-300',
      border: 'border-cyan-500/30',
      pillBg: 'bg-cyan-600 hover:bg-cyan-500 text-white',
      dot: 'bg-cyan-400',
      badgeBg: 'bg-cyan-500/20',
      badgeText: 'text-cyan-300'
    }
  },
  {
    id: 'aval-12-tcc1-artigo-final',
    disciplina: 'TCC I - Trabalho de Conclusão de Curso I',
    disciplinaShort: 'TCC I (Artigo Científico)',
    professor: 'Profª Gabriela Leal (Márcio Leal)',
    tipo: 'Projeto de Pesquisa & Artigo Científico Final',
    tipoBadge: 'ARTIGO',
    dataLimite: '2026-12-04',
    dataTexto: '04 de Dezembro de 2026 (Encerramento de TCC I)',
    horario: 'Acompanhamento contínuo às sextas-feiras (19:50) até a entrega final',
    peso: 'Nota de TCC1 com base nas etapas de escrita e adequação às normas ABNT/FMB',
    regras: [
      'Entregável final: Artigo Científico individual.',
      'Extensão estrita: De 20 a 25 páginas no máximo (contando capa, pré-textuais e referências).',
      'Normas formais: Normas rígidas da ABNT e Manual da Faculdade Maciço do Baturité (FMB).',
      'Linguagem: Científica e impessoal (terceira pessoa ou apassivada: "percebe-se", "observa-se"). Proibido uso de primeira pessoa ("eu acho", "meu trabalho").',
      'Elementos do Artigo: Capa, Título, Resumo de 15 a 20 linhas (escrito ao final) em PT/EN com 3 palavras-chave, Introdução, Metodologia, Resultados e Discussão, Considerações Finais e Referências Bibliográficas em ordem alfabética.',
      'Ética: Estritamente proibido o uso de Inteligência Artificial para escrita de conteúdo ou redação por terceiros.'
    ],
    passoAPasso: [
      'Confirmar o convite ao orientador docente com afinidade temática.',
      'Estruturar o Projeto de Pesquisa (Tema, Problema, Justificativa, Objetivo Geral e Específicos).',
      'Redigir as seções do Artigo na ordem metodológica recomendada: Metodologia, Resultados e Discussão (diálogo com os autores) e Considerações Finais.',
      'Redigir ao final a Introdução e o Resumo (15-20 linhas com palavras-chave em PT/EN).',
      'Formatar as referências em ordem alfabética segundo o padrão ABNT/FMB e ajustar numeração de página no canto superior direito a partir da introdução.',
      'Submeter o artigo finalizado à coordenação/orientação até o encerramento do semestre.'
    ],
    bibliografia: {
      obrigatoria: [
        'Obras e autores específicos escolhidos para o referencial teórico do artigo',
        'Manual de Trabalhos Acadêmicos da Faculdade Maciço do Baturité (FMB)',
        'Resolução 4 MEC 2016 e Normas ABNT vigentes'
      ]
    },
    canalEnvio: {
      tipo: 'email',
      destinatario: 'gabriela.leal@koinonia.edu.br',
      assunto: 'Artigo Científico Final - TCC I - [Nome do Aluno]',
      observacao: 'Submissão por e-mail/plataforma para a Profa Gabriela Leal e coordenação acadêmica.'
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

interface CalendarioAcademicoProps {
  userEmail?: string;
  onBack?: () => void;
}

const MESES_SEMESTRE = [
  { index: 7, nome: 'Agosto', ano: 2026 },
  { index: 8, nome: 'Setembro', ano: 2026 },
  { index: 9, nome: 'Outubro', ano: 2026 },
  { index: 10, nome: 'Novembro', ano: 2026 },
  { index: 11, nome: 'Dezembro', ano: 2026 }
];

const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

export const CalendarioAcademico: React.FC<CalendarioAcademicoProps> = ({
  userEmail,
  onBack
}) => {
  const normalizedEmail = (userEmail || 'aluno@koinonia.edu.br').toLowerCase().trim();

  // Estado do mês ativo: Default para Setembro 2026 (mês com maior concentração inicial de provas)
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(8); // Setembro (0-indexed = 8)
  const [currentYear] = useState<number>(2026);
  const [viewMode, setViewMode] = useState<'grade' | 'lista'>('grade');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');

  // Clique 1: Modal Compacto (Popup Resumo)
  const [popupEvento, setPopupEvento] = useState<AvaliacaoEvento | null>(null);

  // Clique 2: Painel Lateral / Drawer (Passo a Passo Completo)
  const [drawerEvento, setDrawerEvento] = useState<AvaliacaoEvento | null>(null);

  // Checklists persistidos no localStorage: record de booleans por evento e índice de passo
  const [checklistMap, setChecklistMap] = useState<Record<string, Record<number, boolean>>>({});
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedResumo, setCopiedResumo] = useState<boolean>(false);

  // Carregar checklists do localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initialChecklists: Record<string, Record<number, boolean>> = {};
    AVALIACOES_2026_2.forEach((ev) => {
      const storageKey = `koinonia_checklist_${normalizedEmail}_${ev.id}`;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          initialChecklists[ev.id] = JSON.parse(raw);
        } else {
          initialChecklists[ev.id] = {};
        }
      } catch (_) {
        initialChecklists[ev.id] = {};
      }
    });
    setChecklistMap(initialChecklists);
  }, [normalizedEmail]);

  // Alternar checkbox do passo a passo
  const toggleChecklistStep = (eventoId: string, stepIdx: number) => {
    setChecklistMap((prev) => {
      const currentEvChecks = { ...(prev[eventoId] || {}) };
      currentEvChecks[stepIdx] = !currentEvChecks[stepIdx];
      const updated = { ...prev, [eventoId]: currentEvChecks };
      
      if (typeof window !== 'undefined') {
        const storageKey = `koinonia_checklist_${normalizedEmail}_${eventoId}`;
        try {
          localStorage.setItem(storageKey, JSON.stringify(currentEvChecks));
        } catch (_) {}
      }
      return updated;
    });
  };

  const getEventProgress = (evento: AvaliacaoEvento) => {
    const checks = checklistMap[evento.id] || {};
    const total = evento.passoAPasso.length;
    if (total === 0) return { completed: 0, total: 0, percent: 0 };
    let completed = 0;
    for (let i = 0; i < total; i++) {
      if (checks[i]) completed++;
    }
    const percent = Math.round((completed / total) * 100);
    return { completed, total, percent };
  };

  // Lista única de disciplinas para filtro
  const disciplinasList = useMemo(() => {
    const map = new Map<string, string>();
    AVALIACOES_2026_2.forEach((ev) => {
      map.set(ev.disciplina, ev.disciplinaShort);
    });
    return Array.from(map.entries()).map(([full, short]) => ({ full, short }));
  }, []);

  // Eventos filtrados
  const filteredEvents = useMemo(() => {
    if (selectedDiscipline === 'all') return AVALIACOES_2026_2;
    return AVALIACOES_2026_2.filter((ev) => ev.disciplina === selectedDiscipline);
  }, [selectedDiscipline]);

  // Navegação entre meses
  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => (prev > 7 ? prev - 1 : 7));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev < 11 ? prev + 1 : 11));
  };

  const handleGoToday = () => {
    const today = new Date();
    const m = today.getMonth();
    if (m >= 7 && m <= 11) {
      setCurrentMonthIndex(m);
    } else {
      setCurrentMonthIndex(8); // Default Setembro
    }
  };

  // Matriz de Dias do Mês (Grade do Google Agenda: 7 colunas)
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonthIndex, 1);
    const lastDay = new Date(currentYear, currentMonthIndex + 1, 0);

    const startingDayOfWeek = firstDay.getDay(); // 0 = Domingo, 1 = Segunda...
    const totalDaysInMonth = lastDay.getDate();

    // Dias do mês anterior para completar a primeira linha
    const prevMonthLastDay = new Date(currentYear, currentMonthIndex, 0).getDate();
    const days: {
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      dateString: string; // YYYY-MM-DD
      events: AvaliacaoEvento[];
    }[] = [];

    // Preenchimento dos dias anteriores
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(currentYear, currentMonthIndex - 1, d);
      const str = `${currentYear}-${String(currentMonthIndex).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const evs = filteredEvents.filter((e) => e.dataLimite === str);
      days.push({
        date: prevDate,
        dayNumber: d,
        isCurrentMonth: false,
        dateString: str,
        events: evs
      });
    }

    // Dias do mês atual
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const currDate = new Date(currentYear, currentMonthIndex, d);
      const str = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      // Tratamento especial para o Seminário de Ética Cristã que abrange quintas-feiras de 22/10 a 19/11
      const evs = filteredEvents.filter((e) => {
        if (e.id === 'aval-8-etica-crista-seminario') {
          // Quintas-feiras entre 22/10/2026 e 19/11/2026
          const dayOfWeek = currDate.getDay();
          const isQuinta = dayOfWeek === 4;
          const time = currDate.getTime();
          const startRange = new Date(2026, 9, 22).getTime();
          const endRange = new Date(2026, 10, 19).getTime();
          return isQuinta && time >= startRange && time <= endRange;
        }
        return e.dataLimite === str;
      });

      days.push({
        date: currDate,
        dayNumber: d,
        isCurrentMonth: true,
        dateString: str,
        events: evs
      });
    }

    // Dias do próximo mês para completar os blocos de 7 (35 ou 42 células)
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remainingDays; d++) {
      const nextDate = new Date(currentYear, currentMonthIndex + 1, d);
      const str = `${currentYear}-${String(currentMonthIndex + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const evs = filteredEvents.filter((e) => e.dataLimite === str);
      days.push({
        date: nextDate,
        dayNumber: d,
        isCurrentMonth: false,
        dateString: str,
        events: evs
      });
    }

    return days;
  }, [currentYear, currentMonthIndex, filteredEvents]);

  const activeMonthData = MESES_SEMESTRE.find((m) => m.index === currentMonthIndex) || MESES_SEMESTRE[1];

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const handleCopyResumo = (evento: AvaliacaoEvento) => {
    const texto = `📋 *${evento.disciplina}*\n` +
      `👤 Professor: ${evento.professor}\n` +
      `📅 Prazo: ${evento.dataTexto} — ${evento.horario}\n` +
      `🎯 Tipo: ${evento.tipo}\n` +
      `⚖️ Peso: ${evento.peso}\n\n` +
      `📝 *Passo a Passo de Execução:*\n` +
      evento.passoAPasso.map((p, idx) => `${idx + 1}. ${p}`).join('\n') +
      `\n\n📌 *Regras Principais:*\n` +
      evento.regras.map((r) => `• ${r}`).join('\n') +
      (evento.canalEnvio.destinatario ? `\n\n✉️ Envio: ${evento.canalEnvio.destinatario}` : '');

    navigator.clipboard.writeText(texto);
    setCopiedResumo(true);
    setTimeout(() => setCopiedResumo(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. BARRA DE CABEÇALHO ESTILO GOOGLE AGENDA */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl text-white space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Voltar ao Painel Geral"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
            )}
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                  Google Agenda Acadêmica
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Semestre 2026.2
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Calendário de Trabalhos e Avaliações
              </h2>
            </div>
          </div>

          {/* CONTROLES DE NAVEGAÇÃO ENTRE MESES */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleGoToday}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer active:scale-95"
            >
              Hoje
            </button>
            
            <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={currentMonthIndex <= 7}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs sm:text-sm font-black px-3 min-w-[120px] text-center text-white">
                {activeMonthData.nome} {activeMonthData.ano}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                disabled={currentMonthIndex >= 11}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* SELETOR DE MODO GRADE / LISTA */}
            <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('grade')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'grade'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" /> Grade
              </button>
              <button
                type="button"
                onClick={() => setViewMode('lista')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'lista'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" /> Linha do Tempo
              </button>
            </div>
          </div>
        </div>

        {/* 2. ATALHOS DIRETOS PARA CADA MÊS (AGOSTO A DEZEMBRO) & FILTRO POR DISCIPLINA */}
        <div className="pt-2 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              Meses:
            </span>
            {MESES_SEMESTRE.map((m) => {
              const isActive = m.index === currentMonthIndex;
              return (
                <button
                  key={m.index}
                  type="button"
                  onClick={() => setCurrentMonthIndex(m.index)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  {m.nome}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Todas as Disciplinas (12 Avaliações)</option>
              {disciplinasList.map((d) => (
                <option key={d.full} value={d.full}>
                  {d.short}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. VISÃO 1: GRADE MENSAL ESTILO GOOGLE AGENDA */}
      {viewMode === 'grade' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-5 shadow-2xl overflow-hidden">
          {/* DIAS DA SEMANA */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
            {DIAS_SEMANA.map((dia, idx) => (
              <div
                key={dia}
                className={`py-2 text-[10px] sm:text-xs font-black tracking-wider uppercase ${
                  idx === 0 || idx === 6 ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {dia}
              </div>
            ))}
          </div>

          {/* DIAS DO CALENDÁRIO */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((cDay, idx) => {
              const hasEvents = cDay.events.length > 0;
              const isToday = (() => {
                const now = new Date();
                return (
                  cDay.date.getDate() === now.getDate() &&
                  cDay.date.getMonth() === now.getMonth() &&
                  cDay.date.getFullYear() === now.getFullYear()
                );
              })();

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (hasEvents) {
                      setPopupEvento(cDay.events[0]);
                    }
                  }}
                  className={`min-h-[85px] sm:min-h-[125px] rounded-2xl p-1.5 sm:p-2.5 flex flex-col justify-between border transition relative ${
                    !cDay.isCurrentMonth
                      ? 'bg-slate-950/40 border-slate-800/40 text-slate-600 opacity-60'
                      : isToday
                      ? 'bg-blue-950/20 border-blue-500/50 shadow-inner'
                      : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                  } ${hasEvents ? 'cursor-pointer hover:bg-slate-800/80 hover:shadow-lg' : ''}`}
                >
                  {/* CABEÇALHO DO DIA */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-black rounded-lg w-6 h-6 flex items-center justify-center ${
                        isToday
                          ? 'bg-blue-600 text-white font-black shadow-md'
                          : cDay.isCurrentMonth
                          ? 'text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {cDay.dayNumber}
                    </span>

                    {hasEvents && (
                      <span className="hidden sm:inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {cDay.events.length} {cDay.events.length === 1 ? 'prazo' : 'prazos'}
                      </span>
                    )}
                  </div>

                  {/* PÍLULAS DE EVENTOS (ESTILO GOOGLE AGENDA) */}
                  <div className="space-y-1 sm:space-y-1.5 mt-1 overflow-hidden">
                    {cDay.events.slice(0, 2).map((ev) => {
                      const prog = getEventProgress(ev);
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPopupEvento(ev);
                          }}
                          className={`w-full text-left px-1.5 sm:px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-between gap-1 shadow-xs truncate cursor-pointer ${ev.cor.pillBg}`}
                        >
                          <span className="truncate">
                            <strong className="font-extrabold mr-1">[{ev.tipoBadge}]</strong>
                            {ev.disciplinaShort}
                          </span>
                          {prog.total > 0 && prog.percent === 100 && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-200 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}

                    {cDay.events.length > 2 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPopupEvento(cDay.events[0]);
                        }}
                        className="text-[10px] font-extrabold text-blue-400 hover:text-blue-300 pl-1 block text-left"
                      >
                        +{cDay.events.length - 2} mais...
                      </button>
                    )}
                  </div>

                  {/* INDICADOR INFERIOR EM DISPOSITIVOS MÓVEIS */}
                  {hasEvents && (
                    <div className="sm:hidden flex items-center justify-center gap-1 mt-1">
                      {cDay.events.map((ev) => (
                        <span key={ev.id} className={`w-1.5 h-1.5 rounded-full ${ev.cor.dot}`} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. VISÃO 2: LINHA DO TEMPO CRONOLÓGICA (LISTA DETALHADA) */}
      {viewMode === 'lista' && (
        <div className="space-y-3">
          {filteredEvents.map((evento, index) => {
            const prog = getEventProgress(evento);
            return (
              <div
                key={evento.id}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-3xl p-5 shadow-xl transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center flex-shrink-0 text-white font-black">
                    <span className="text-[10px] text-blue-400 uppercase font-mono">
                      {evento.dataLimite.split('-')[1] === '09' ? 'SET' : evento.dataLimite.split('-')[1] === '10' ? 'OUT' : evento.dataLimite.split('-')[1] === '11' ? 'NOV' : 'DEZ'}
                    </span>
                    <span className="text-lg leading-none mt-0.5">
                      {evento.dataLimite.split('-')[2]}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${evento.cor.badgeBg} ${evento.cor.badgeText}`}>
                        {evento.tipoBadge}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {evento.dataTexto} • {evento.horario}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white">
                      {evento.disciplina}
                    </h3>
                    <p className="text-xs text-slate-400">
                      <strong className="text-slate-300">Docente:</strong> {evento.professor} • <strong className="text-slate-300">Tipo:</strong> {evento.tipo}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {/* MINI PROGRESSO */}
                  <div className="bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700 flex items-center justify-between sm:justify-start gap-3">
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-slate-400 block">Progresso</span>
                      <span className="text-xs font-black text-blue-300">
                        {prog.completed}/{prog.total} passos
                      </span>
                    </div>
                    <div className="w-12 bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${prog.percent}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPopupEvento(evento)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold rounded-xl border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Resumo Rápido
                  </button>

                  <button
                    type="button"
                    onClick={() => setDrawerEvento(evento)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Passo a Passo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLIQUE 1: POPUP RESUMO (MODAL COMPACTO AO CLICAR NO DIA OU EVENTO)        */}
      {/* ========================================================================= */}
      {popupEvento && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-white space-y-0">
            {/* TOPO COM IDENTIFICAÇÃO DA DISCIPLINA */}
            <div className={`p-5 border-b border-slate-800 flex items-start justify-between gap-3 ${popupEvento.cor.bg}`}>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${popupEvento.cor.badgeBg} ${popupEvento.cor.badgeText}`}>
                    {popupEvento.tipoBadge}
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    Semestre 2026.2
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {popupEvento.disciplina}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ministrada por: <strong className="text-white">{popupEvento.professor}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPopupEvento(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* CONTEÚDO PRINCIPAL DO RESUMO */}
            <div className="p-5 sm:p-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                  <span className="text-[11px] font-bold text-slate-400 block flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> Prazo e Horário
                  </span>
                  <p className="text-xs font-extrabold text-white mt-1">
                    {popupEvento.dataTexto}
                  </p>
                  <p className="text-[11px] text-blue-300 font-mono mt-0.5">
                    {popupEvento.horario}
                  </p>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                  <span className="text-[11px] font-bold text-slate-400 block flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" /> Peso / Pontuação
                  </span>
                  <p className="text-xs font-bold text-slate-200 mt-1">
                    {popupEvento.peso}
                  </p>
                </div>
              </div>

              {/* TIPO E DESCRIÇÃO SINTÉTICA */}
              <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/60 space-y-1.5">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Tipo da Avaliação
                </span>
                <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                  {popupEvento.tipo}
                </p>
              </div>

              {/* PROGRESSO NO CHECKLIST */}
              {(() => {
                const prog = getEventProgress(popupEvento);
                return (
                  <div className="bg-blue-950/30 border border-blue-500/30 p-3.5 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-black text-blue-200 block">
                        Seu Checklist de Preparação
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {prog.completed} de {prog.total} etapas concluídas ({prog.percent}%)
                      </span>
                    </div>
                    <div className="w-24 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${prog.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="p-5 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const ev = popupEvento;
                  setPopupEvento(null);
                  setDrawerEvento(ev);
                }}
                className="w-full sm:flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Ver Passo a Passo Completo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setPopupEvento(null)}
                className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLIQUE 2: PAINEL LATERAL / DRAWER (SLIDE-OVER COM GUIA COMPLETO)          */}
      {/* ========================================================================= */}
      {drawerEvento && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex justify-end animate-in fade-in duration-300">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full flex flex-col shadow-2xl text-white animate-in slide-in-from-right duration-300">
            {/* TOPO DO DRAWER */}
            <div className={`p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 ${drawerEvento.cor.bg}`}>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${drawerEvento.cor.badgeBg} ${drawerEvento.cor.badgeText}`}>
                    {drawerEvento.tipoBadge}
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    Guia Oficial de Execução
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {drawerEvento.disciplina}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Profº <strong className="text-white">{drawerEvento.professor}</strong> • {drawerEvento.tipo}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDrawerEvento(null)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-base transition cursor-pointer"
                title="Fechar painel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CORPO DO DRAWER COM SCROLL */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* BANNER DE PRAZO E PONTUAÇÃO */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> Data Limite e Horário:
                  </span>
                  <p className="text-sm font-black text-white mt-0.5">
                    {drawerEvento.dataTexto}
                  </p>
                  <p className="text-xs text-blue-300 font-mono mt-0.5">
                    {drawerEvento.horario}
                  </p>
                </div>

                <div className="sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700">
                  <span className="text-[11px] font-bold text-slate-400 block flex items-center sm:justify-end gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" /> Peso na Média:
                  </span>
                  <p className="text-xs font-extrabold text-amber-300 mt-0.5">
                    {drawerEvento.peso}
                  </p>
                </div>
              </div>

              {/* 1. GUIA PASSO A PASSO COM CHECKLIST INTERATIVO */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Passo a Passo de Execução (Checklist)
                  </h3>
                  {(() => {
                    const prog = getEventProgress(drawerEvento);
                    return (
                      <span className="text-xs font-extrabold text-blue-400">
                        {prog.completed}/{prog.total} ({prog.percent}%)
                      </span>
                    );
                  })()}
                </div>

                <div className="space-y-2">
                  {drawerEvento.passoAPasso.map((passo, sIdx) => {
                    const isChecked = Boolean(checklistMap[drawerEvento.id]?.[sIdx]);
                    return (
                      <div
                        key={sIdx}
                        onClick={() => toggleChecklistStep(drawerEvento.id, sIdx)}
                        className={`p-3.5 rounded-2xl border transition flex items-start gap-3 cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                            : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 text-slate-200'
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 flex-shrink-0 cursor-pointer"
                        >
                          {isChecked ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                          )}
                        </button>
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-black uppercase text-slate-400 block">
                            Etapa {sIdx + 1}
                          </span>
                          <p className={`text-xs sm:text-sm leading-relaxed ${isChecked ? 'line-through opacity-80' : 'font-medium'}`}>
                            {passo}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. REGRAS RÍGIDAS DE FORMATAÇÃO E CRITÉRIOS */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Regras Rígidas de Formatação e Critérios
                </h3>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2 text-xs">
                  {drawerEvento.regras.map((regra, rIdx) => (
                    <div key={rIdx} className="flex items-start gap-2 text-amber-200">
                      <span className="text-amber-400 font-black">•</span>
                      <p className="leading-relaxed">{regra}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. BIBLIOGRAFIA E LIVROS EXIGIDOS */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  Bibliografia e Livros Exigidos
                </h3>
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 space-y-3 text-xs">
                  {drawerEvento.bibliografia.obrigatoria && drawerEvento.bibliografia.obrigatoria.length > 0 && (
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block mb-1.5">
                        Leitura Obrigatória:
                      </span>
                      <ul className="space-y-1 text-slate-200">
                        {drawerEvento.bibliografia.obrigatoria.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-1.5">
                            <span className="text-blue-400 font-bold">➔</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {drawerEvento.bibliografia.recomendada && drawerEvento.bibliografia.recomendada.length > 0 && (
                    <div className="pt-2 border-t border-slate-700">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1.5">
                        Leitura Recomendada / Complementar:
                      </span>
                      <ul className="space-y-1 text-slate-300">
                        {drawerEvento.bibliografia.recomendada.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">➔</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. CANAL E INSTRUÇÕES DE ENVIO */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  Canal e Instruções de Envio
                </h3>
                <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-2xl p-4 space-y-3 text-xs">
                  {drawerEvento.canalEnvio.destinatario && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-900 rounded-xl border border-indigo-500/30">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">E-mail para Submissão:</span>
                        <span className="font-mono text-xs font-black text-indigo-300">
                          {drawerEvento.canalEnvio.destinatario}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyEmail(drawerEvento.canalEnvio.destinatario!)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        {copiedEmail === drawerEvento.canalEnvio.destinatario ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" /> E-mail Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copiar E-mail
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {drawerEvento.canalEnvio.assunto && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 block">Assunto Obrigatório do E-mail:</span>
                      <span className="font-mono text-xs font-black text-amber-300">
                        "{drawerEvento.canalEnvio.assunto}"
                      </span>
                    </div>
                  )}

                  {drawerEvento.canalEnvio.observacao && (
                    <p className="text-slate-300 leading-relaxed">
                      {drawerEvento.canalEnvio.observacao}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* RODAPÉ DO DRAWER COM AÇÕES */}
            <div className="p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleCopyResumo(drawerEvento)}
                className="w-full sm:flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                {copiedResumo ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" /> Resumo Copiado para a Área de Transferência!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" /> Copiar Resumo para WhatsApp / Bloco de Notas
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setDrawerEvento(null)}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition cursor-pointer"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
