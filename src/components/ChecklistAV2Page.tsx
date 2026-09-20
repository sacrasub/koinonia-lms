'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, PenTool, AlertCircle, Zap, CheckCircle2, Clock, 
  Sparkles, Plus, Trash2, BookOpen, User, Calendar, Filter, X, RotateCcw,
  MessageCircle, Share2, Copy, Check, ExternalLink, ArrowRight
} from 'lucide-react';
import { CalendarioAcademico } from './CalendarioAcademico';
import { subscribeToStudentSync, saveChecklistTasks } from '@/services/studentSyncService';

export interface KanbanTask {
  id: string;
  assessmentId?: string;
  title: string;
  subject: string;
  professor: string;
  dueDate: string;
  priority: 'Máxima' | 'Média' | 'Normal';
  type: 'Trabalho Escrito' | 'Portfólio' | 'Prova Objetiva' | 'Resumo Crítico' | 'Estudo de Caso' | 'TCC' | string;
  status: 'todo' | 'doing' | 'done';
  strategyNote: string;
  subtasks: { id: string; text: string; done: boolean }[];
}

const defaultSemesterTasks: KanbanTask[] = [
  // 1. Marco Inicial: Estágio Básico (Concluído)
  {
    id: 'LMS-001',
    title: 'Início das Aulas Semanais de Estágio Básico',
    subject: 'Estágio Básico I e II (Bacharelado)',
    professor: 'Prof. Antônio Carlos',
    dueDate: '2026-08-17',
    priority: 'Normal',
    type: 'Aulas / Encontros',
    status: 'done',
    strategyNote: 'Aulas regulares presenciais/virtuais todas as segundas-feiras para estudantes de 5º e 8º períodos do Bacharelado em Teologia.',
    subtasks: [
      { id: 'st-001-1', text: 'Participação ativa nos encontros de segunda-feira', done: true },
      { id: 'st-001-2', text: 'Elaboração e registro das atividades práticas propostas', done: true },
    ],
  },
  // 2. Marco Inicial: Alinhamento TCC I (Concluído)
  {
    id: 'LMS-002',
    title: 'Início do Prazo para Elaboração do Projeto',
    subject: 'Trabalho de Conclusão de Curso I (TCC I)',
    professor: 'Profª Gabriela Leal',
    dueDate: '2026-08-21',
    priority: 'Máxima',
    type: 'Marco Metodológico',
    status: 'done',
    strategyNote: 'Sessão de alinhamento metodológico inicial. Cronômetro rígido de duas semanas para a entrega estruturada.',
    subtasks: [
      { id: 'st-002-1', text: 'Presença na aula inaugural de metodologia do TCC', done: true },
      { id: 'st-002-2', text: 'Início de contato com orientadores específicos por afinidade temática', done: true },
    ],
  },
  // 3. Avaliação 1 Oficial: Plantação e Revitalização II (18/09)
  {
    id: 'aval-1-plantacao-freq',
    assessmentId: 'aval-1-plantacao-freq',
    title: 'Atividade Prática / Exercício de Fixação (Aula Gravada)',
    subject: 'Plantação e Revitalização de Igrejas II',
    professor: 'Profº Thácyto Lessa',
    dueDate: '2026-09-18',
    priority: 'Normal',
    type: 'Atividade Modular',
    status: 'todo',
    strategyNote: 'Texto digitado em folha única com cabeçalho simples. Sem necessidade de capa ou folha de rosto ABNT. Envio por e-mail para thacyto@gmail.com até às 23:59.',
    subtasks: [
      { id: 'st-aval-1-0', text: 'Assistir ao vídeo da aula gravada disponibilizado pelo professor (~1h20 de duração).', done: false },
      { id: 'st-aval-1-1', text: 'Responder às questões propostas sobre a aula no caderno ou bloco de notas.', done: false },
      { id: 'st-aval-1-2', text: 'Digitar as respostas em um documento simples contendo apenas o cabeçalho (Nome, Disciplina e Data).', done: false },
      { id: 'st-aval-1-3', text: 'Salvar e enviar o arquivo por e-mail para o docente impreterivelmente até às 23:59.', done: false },
    ],
  },
  // 4. Avaliação 2 Oficial: História do Congregacionalismo (29/09)
  {
    id: 'aval-2-congregacionalismo-av1',
    assessmentId: 'aval-2-congregacionalismo-av1',
    title: 'Prova Escrita (AV1) + Leitura Obrigatória + Frequência',
    subject: 'História do Congregacionalismo',
    professor: 'Profº Ary Júnior',
    dueDate: '2026-09-29',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: 'Uso obrigatório de câmera ligada durante toda a aula e na prova (18:30 às 20:25). Questão declaratória direta sobre leitura dos textos em PDF.',
    subtasks: [
      { id: 'st-aval-2-0', text: 'Acessar os links dos 4 a 6 textos em PDF compartilhados pelo professor no chat/drive da turma.', done: false },
      { id: 'st-aval-2-1', text: 'Realizar a leitura integral dos textos abordando a Reforma Inglesa, Puritans, Separatistas e Westminster.', done: false },
      { id: 'st-aval-2-2', text: 'Conectar-se no horário da aula no dia 29/09/2026 com a câmera aberta.', done: false },
      { id: 'st-aval-2-3', text: 'Preencher a avaliação escrita e marcar a confirmação de leitura dos textos indicados.', done: false },
    ],
  },
  // 5. Avaliação 3 Oficial: História do Pensamento Cristão II (29/09)
  {
    id: 'aval-3-pensamento-cristao-av1',
    assessmentId: 'aval-3-pensamento-cristao-av1',
    title: 'Trabalho Escrito de Pesquisa Acadêmica (AV1)',
    subject: 'História do Pensamento Cristão II',
    professor: 'Profº Hilário Bispo',
    dueDate: '2026-09-29',
    priority: 'Máxima',
    type: 'Trabalho Escrito',
    status: 'todo',
    strategyNote: 'Tema: Iluminismo e Modernidade (Racionalismo, Empirismo, Razão vs Revelação). Mínimo 5 a 6 páginas nas normas ABNT. Individual ou grupo até 3.',
    subtasks: [
      { id: 'st-aval-3-0', text: 'Definir a composição do trabalho (individual ou grupo de até 3 alunos).', done: false },
      { id: 'st-aval-3-1', text: 'Revisar os slides fornecidos na primeira aula sobre a estrutura e os requisitos do trabalho.', done: false },
      { id: 'st-aval-3-2', text: 'Estruturar a pesquisa cobrindo o tema Iluminismo e Modernidade (Descartes, Locke, Kant).', done: false },
      { id: 'st-aval-3-3', text: 'Redigir o texto com no mínimo 5 a 6 páginas no padrão ABNT.', done: false },
      { id: 'st-aval-3-4', text: 'Entregar o trabalho na data da prova (29/09/2026).', done: false },
    ],
  },
  // 6. Avaliação 4 Oficial: Aconselhamento Bíblico II (30/09)
  {
    id: 'aval-4-aconselhamento-av1',
    assessmentId: 'aval-4-aconselhamento-av1',
    title: 'Prova Objetiva Online (Sem Trabalho Escrito)',
    subject: 'Aconselhamento Bíblico II',
    professor: 'Profº Uilian Santos',
    dueDate: '2026-09-30',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: '19:00 às 20:25 via Google Forms. Rigorosamente SEM CONSULTA. Restrito às informações dos slides 1 a 6 (Suficiência Bíblica, Jó, Ídolos e 5 Áreas). Correção automática.',
    subtasks: [
      { id: 'st-aval-4-0', text: 'Estudar os slides das aulas 1 a 6 disponibilizados na pasta da disciplina.', done: false },
      { id: 'st-aval-4-1', text: 'Fixar tópicos centrais: Suficiência das Escrituras, Jó, Pecado e Ídolos, e 5 Áreas do Inventário.', done: false },
      { id: 'st-aval-4-2', text: 'Acessar o link do Google Forms disponibilizado no dia 30/09/2026 no horário de aula.', done: false },
      { id: 'st-aval-4-3', text: 'Preencher as questões objetivas e clicar em enviar para receber a nota automática.', done: false },
    ],
  },
  // 7. Avaliação 5 Oficial: Direitos Humanos - Trabalho (30/09)
  {
    id: 'aval-5-direitos-humanos-trabalho',
    assessmentId: 'aval-5-direitos-humanos-trabalho',
    title: 'Trabalho Escrito Dissertativo / Pesquisa Individual (AV1)',
    subject: 'Direitos Humanos',
    professor: 'Profº Cleiton Barbirato',
    dueDate: '2026-09-30',
    priority: 'Máxima',
    type: 'Trabalho Escrito',
    status: 'todo',
    strategyNote: 'Até 1 lauda sobre "Desigualdade Social e Privilégios" e a Igreja (Times New Roman 12, esp. 1,5). Enviar para cleitonpb@gmail.com com assunto "Trabalho para composição de notas" até 23:59. Vale 2,0 pts.',
    subtasks: [
      { id: 'st-aval-5-0', text: 'Assistir ao vídeo indicado pelo professor ("A corrida da vida / Pergunta aos jovens sobre privilégios").', done: false },
      { id: 'st-aval-5-1', text: 'Refletir sobre desigualdade social e o papel da Igreja como agente de transformação.', done: false },
      { id: 'st-aval-5-2', text: 'Redigir texto dissertativo autoral de até 1 página em Times New Roman 12, espaçamento 1,5.', done: false },
      { id: 'st-aval-5-3', text: 'Enviar arquivo para cleitonpb@gmail.com com assunto "Trabalho para composição de notas".', done: false },
      { id: 'st-aval-5-4', text: 'Enviar antes das 23:59 do dia 30/09/2026.', done: false },
    ],
  },
  // 8. Avaliação 6 Oficial: Direitos Humanos - Prova (30/09)
  {
    id: 'aval-6-direitos-humanos-prova',
    assessmentId: 'aval-6-direitos-humanos-prova',
    title: 'Prova Objetiva de Múltipla Escolha (AV1)',
    subject: 'Direitos Humanos',
    professor: 'Profº Cleiton Barbirato',
    dueDate: '2026-09-30',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: '20:30 no horário da aula. Vale 8,0 pontos. Múltipla escolha via Google Forms sem consulta a materiais ou IA.',
    subtasks: [
      { id: 'st-aval-6-0', text: 'Estudar a apostila digital composta por todos os slides da disciplina.', done: false },
      { id: 'st-aval-6-1', text: 'Revisar: Dignidade da Pessoa Humana, Declaração de 1948, Gerações de Direitos e Pirâmide de Kelsen.', done: false },
      { id: 'st-aval-6-2', text: 'Acessar o formulário do Google Forms no dia 30/09/2026 às 20:30.', done: false },
      { id: 'st-aval-6-3', text: 'Responder às questões sem consulta e submeter.', done: false },
    ],
  },
  // 9. Avaliação 7 Oficial: Novo Testamento III (01/10)
  {
    id: 'aval-7-nt3-epistolas-av1',
    assessmentId: 'aval-7-nt3-epistolas-av1',
    title: 'Prova Objetiva (AV1)',
    subject: 'Novo Testamento III - Epístolas Gerais',
    professor: 'Profº Marcio Leal',
    dueDate: '2026-10-01',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: '20:25 durante a aula via Google Forms. Conteúdo: anotações de aula e "Introdução ao Novo Testamento" (Carson/Moo/Morris) sobre Hebreus, Tiago, 1 e 2 Pedro.',
    subtasks: [
      { id: 'st-aval-7-0', text: 'Revisar anotações de aula e slides sobre Hebreus, Tiago, 1 Pedro e 2 Pedro.', done: false },
      { id: 'st-aval-7-1', text: 'Estudar as introduções especiais, autoria, destinatários e propósitos das epístolas no Carson.', done: false },
      { id: 'st-aval-7-2', text: 'Acessar o formulário no dia 01/10/2026 no horário da aula (20:25).', done: false },
      { id: 'st-aval-7-3', text: 'Preencher o exame e enviar.', done: false },
    ],
  },
  // 10. Marco Eclesiástico: Posse Pastoral Pr. Uilian Santos (17/10)
  {
    id: 'LMS-004',
    title: 'Cerimônia de Posse Pastoral do Pr. Uilian Santos',
    subject: 'Geral / Vida Comunitária',
    professor: 'Pr. Uilian Santos / Pr. Márcio Leal',
    dueDate: '2026-10-17',
    priority: 'Normal',
    type: 'Evento Eclesiástico',
    status: 'todo',
    strategyNote: 'Culto de posse oficial do Pr. Uilian Santos na Igreja Congregacional de Sete Pontes (São Gonçalo). Pregação do Profº Márcio Leal.',
    subtasks: [
      { id: 'st-004-1', text: 'Intercessão e comunhão eclesiástica da comunidade acadêmica', done: false },
    ],
  },
  // 11. Avaliação 8 Oficial: Ética Cristã - Seminário (22/10)
  {
    id: 'aval-8-etica-crista-seminario',
    assessmentId: 'aval-8-etica-crista-seminario',
    title: 'Seminário em Grupo + Apresentação Oral Individual na Tribuna',
    subject: 'Ética Cristã',
    professor: 'Profª Karoline Evangelista',
    dueDate: '2026-10-22',
    priority: 'Máxima',
    type: 'Seminário em Grupo',
    status: 'todo',
    strategyNote: '22/10 a 19/11 nas quintas-feiras (18:45 às 20:25). 30 min por equipe / 10 min por orador com cronômetro. Tema: Dez Mandamentos (Catecismo Maior de Westminster + Norman Geisler).',
    subtasks: [
      { id: 'st-aval-8-0', text: 'Reunir-se com a equipe definida em sala e confirmar o mandamento sorteado (1º ao 10º Mandamento).', done: false },
      { id: 'st-aval-8-1', text: 'Estudar o trecho correspondente do Catecismo Maior de Westminster (deveres e pecados proibidos).', done: false },
      { id: 'st-aval-8-2', text: 'Consultar "Ética Cristã" de Norman Geisler para enriquecer com dilemas morais contemporâneos.', done: false },
      { id: 'st-aval-8-3', text: 'Montar os slides da apresentação em conjunto.', done: false },
      { id: 'st-aval-8-4', text: 'Treinar a exposição individual com cronômetro para não ultrapassar 10 minutos por orador.', done: false },
    ],
  },
  // 12. Marco: Viagem Pr. Márcio Leal para Malásia (24/10)
  {
    id: 'LMS-006',
    title: 'Viagem do Pr. Márcio Leal para a Malásia',
    subject: 'Geral / Viagem Docente',
    professor: 'Profº Marcio Leal',
    dueDate: '2026-10-24',
    priority: 'Normal',
    type: 'Interrupção / Evento',
    status: 'todo',
    strategyNote: 'Viagem internacional do docente para o Encontro Global de Líderes (Saf City na Malásia). Ficar atento a compensações no cronograma síncrono.',
    subtasks: [
      { id: 'st-006-1', text: 'Acompanhar comunicados oficiais e atividades compensatórias', done: false },
    ],
  },
  // 13. Avaliação 9 Oficial: Plantação II - Resumo Treliça e Videira (27/11)
  {
    id: 'aval-9-plantacao-resumo-livro',
    assessmentId: 'aval-9-plantacao-resumo-livro',
    title: 'Trabalho Escrito de Resumo de Livro Capítulo por Capítulo (AV1)',
    subject: 'Plantação e Revitalização de Igrejas II',
    professor: 'Profº Thácyto Lessa',
    dueDate: '2026-11-27',
    priority: 'Máxima',
    type: 'Resumo Crítico',
    status: 'todo',
    strategyNote: 'Envio do resumo detalhado capítulo por capítulo do livro "A Treliça e a Videira" (Marshall & Payne). Limite rígido de 1 página por capítulo (12 capítulos = 12 folhas). Enviar para thacyto@gmail.com até 19:00.',
    subtasks: [
      { id: 'st-aval-9-0', text: 'Realizar a leitura atenta dos 12 capítulos do livro "A Treliça e a Videira".', done: false },
      { id: 'st-aval-9-1', text: 'Sintetizar a ideia central de cada capítulo (treliça/estrutura vs videira/pessoas e crescimento orgânico).', done: false },
      { id: 'st-aval-9-2', text: 'Redigir o resumo respeitando rigorosamente o limite de 1 página para cada capítulo (12 páginas).', done: false },
      { id: 'st-aval-9-3', text: 'Formatar o trabalho e enviá-lo em formato PDF/Word por e-mail para thacyto@gmail.com.', done: false },
    ],
  },
  // 14. Avaliação 10 Oficial: Plantação II - Prova AV2 (27/11)
  {
    id: 'aval-10-plantacao-prova-av2',
    assessmentId: 'aval-10-plantacao-prova-av2',
    title: 'Prova Objetiva Online (AV2)',
    subject: 'Plantação e Revitalização de Igrejas II',
    professor: 'Profº Thácyto Lessa',
    dueDate: '2026-11-27',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: '19:00 (horário da aula). Prova por link de formulário abordando os Quatro Ps da Revitalização (Pregar, Piedade, Pastorear, Perseverar) e Treliça/Videira. Consulta autorizada a anotações e slides.',
    subtasks: [
      { id: 'st-aval-10-0', text: 'Revisar todos os slides fornecidos durante o semestre.', done: false },
      { id: 'st-aval-10-1', text: 'Estudar os tópicos centrais: 9 marcas de uma igreja saudável, 4 Ps e tipos de igreja.', done: false },
      { id: 'st-aval-10-2', text: 'Acessar o link do formulário disponibilizado no dia 27/11/2026 às 19:00.', done: false },
      { id: 'st-aval-10-3', text: 'Responder às questões objetivas e submeter.', done: false },
    ],
  },
  // 15. Avaliação 11 Oficial: Afro-Brasileira e Indígena (28/11)
  {
    id: 'aval-11-afro-indigena-final',
    assessmentId: 'aval-11-afro-indigena-final',
    title: 'Trabalho Escrito / Produção Individual Final Aplicada',
    subject: 'História e Cultura Afro-Brasileira e Indígena',
    professor: 'Profº Alexsandro de Oliveira Silva',
    dueDate: '2026-11-28',
    priority: 'Máxima',
    type: 'Trabalho Escrito',
    status: 'todo',
    strategyNote: 'Extensão: 2 laudas em 3 partes (descrição do problema na igreja/missão, análise bíblico-teológica com 2 autores e proposta concreta de ação). Submeter no AVA até 28/11/2026.',
    subtasks: [
      { id: 'st-aval-11-0', text: 'Assistir às 4 videoaulas gravadas do curso EAD na pasta oficial.', done: false },
      { id: 'st-aval-11-1', text: 'Selecionar uma situação real ou caso prático envolvendo questões étnico-raciais ou indígenas.', done: false },
      { id: 'st-aval-11-2', text: 'Redigir texto de 2 laudas com fundamentação bíblica citando no mínimo 2 autores e proposta prática.', done: false },
      { id: 'st-aval-11-3', text: 'Submeter o arquivo no ambiente virtual da UIECB até 28/11/2026.', done: false },
    ],
  },
  // 16. Avaliação 12 Oficial: TCC I - Artigo Científico Final (04/12)
  {
    id: 'aval-12-tcc1-artigo-final',
    assessmentId: 'aval-12-tcc1-artigo-final',
    title: 'Projeto de Pesquisa & Artigo Científico Final',
    subject: 'TCC I - Trabalho de Conclusão de Curso I',
    professor: 'Profª Gabriela Leal (Márcio Leal)',
    dueDate: '2026-12-04',
    priority: 'Máxima',
    type: 'TCC',
    status: 'todo',
    strategyNote: 'Artigo Científico individual (20 a 25 páginas ABNT/FMB). Linguagem impessoal na 3ª pessoa. Estrutura completa: Capa, Resumo PT/EN, Introdução, Metodologia, Discussão, Considerações e Referências. Sem IA.',
    subtasks: [
      { id: 'st-aval-12-0', text: 'Confirmar o convite ao orientador docente com afinidade temática.', done: false },
      { id: 'st-aval-12-1', text: 'Estruturar o Projeto de Pesquisa (Tema, Problema, Justificativa, Objetivo Geral e Específicos).', done: false },
      { id: 'st-aval-12-2', text: 'Redigir as seções do Artigo na ordem metodológica: Metodologia, Resultados e Discussão e Considerações Finais.', done: false },
      { id: 'st-aval-12-3', text: 'Redigir ao final a Introdução e o Resumo (15-20 linhas com palavras-chave em PT/EN).', done: false },
      { id: 'st-aval-12-4', text: 'Formatar as referências em ordem alfabética segundo o padrão ABNT/FMB e ajustar paginação.', done: false },
      { id: 'st-aval-12-5', text: 'Submeter o artigo finalizado à coordenação/orientação até o encerramento do semestre.', done: false },
    ],
  },
];

interface ChecklistAV2PageProps {
  userEmail?: string;
}

export const ChecklistAV2Page: React.FC<ChecklistAV2PageProps> = ({ userEmail }) => {
  const normalizedEmail = (userEmail || 'default_student').toLowerCase().trim();

  const [tasks, setTasks] = useState<KanbanTask[]>(defaultSemesterTasks);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'kanban' | 'calendario'>('kanban');

  // Form State para Nova Tarefa
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('História do Congregacionalismo');
  const [newProfessor, setNewProfessor] = useState('Profº Ary Júnior');
  const [newDueDate, setNewDueDate] = useState('2026-11-25');
  const [newPriority, setNewPriority] = useState<'Máxima' | 'Média' | 'Normal'>('Média');
  const [newType, setNewType] = useState('Trabalho Escrito');
  const [newStrategyNote, setNewStrategyNote] = useState('');
  const [newSubtasksText, setNewSubtasksText] = useState('');

  const [notification, setNotification] = useState<string | null>(null);
  const [isShareWhatsAppModalOpen, setIsShareWhatsAppModalOpen] = useState(false);
  const [copiedWhatsAppText, setCopiedWhatsAppText] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Helper para sincronizar um array de KanbanTask com os checklists do localStorage
  const syncTasksWithLocalChecklists = (taskList: KanbanTask[]): KanbanTask[] => {
    if (typeof window === 'undefined') return taskList;
    return taskList.map((task) => {
      if (!task.assessmentId) return task;
      const storageKey = `koinonia_checklist_${normalizedEmail}_${task.assessmentId}`;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const checks: Record<number, boolean> = JSON.parse(raw);
          const updatedSubtasks = task.subtasks.map((st, idx) => ({
            ...st,
            done: checks[idx] !== undefined ? !!checks[idx] : st.done,
          }));
          const doneCount = updatedSubtasks.filter((st) => st.done).length;
          const status: 'todo' | 'doing' | 'done' =
            doneCount === updatedSubtasks.length && updatedSubtasks.length > 0
              ? 'done'
              : doneCount > 0
              ? 'doing'
              : 'todo';
          return { ...task, subtasks: updatedSubtasks, status };
        } else {
          // Se não há dados no localStorage, grava o estado atual das subtasks
          const initialChecks: Record<number, boolean> = {};
          task.subtasks.forEach((st, idx) => {
            initialChecks[idx] = st.done;
          });
          localStorage.setItem(storageKey, JSON.stringify(initialChecks));
        }
      } catch (_) {}
      return task;
    });
  };

  const generateWhatsAppAssessmentsText = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://koinonialms.vercel.app';
    const checklistUrl = `${origin}/?tab=checklist`;

    // Ordena cronologicamente por prazo
    const sorted = [...tasks].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    let text = `📚 *SEMINÁRIO KOINONIA - CALENDÁRIO DE AVALIAÇÕES E TRABALHOS 2026.2*\n\n` +
      `Olá, irmãos e colegas de turma! Segue o cronograma oficial de trabalhos acadêmicos, seminários e avaliações previstos para este semestre:\n\n` +
      `🗓️ *CRONOGRAMA DE TRABALHOS E PRAZOS:*\n\n`;

    sorted.forEach((task, index) => {
      let formattedDate = 'A definir';
      if (task.dueDate) {
        const parts = task.dueDate.split('-');
        if (parts.length === 3) {
          formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      }
      const statusIcon = task.status === 'done' ? '✅' : task.status === 'doing' ? '⏳' : '📌';

      text += `${statusIcon} *${formattedDate}* - ${task.subject}\n` +
        `📝 *${task.title}* (${task.type})\n` +
        `👤 *Docente:* ${task.professor}\n`;

      if (task.strategyNote) {
        const shortNote = task.strategyNote.length > 130 ? `${task.strategyNote.slice(0, 130)}...` : task.strategyNote;
        text += `💡 _${shortNote}_\n`;
      }
      text += `\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔗 *Acompanhe seu progresso e marque suas etapas no LMS:*\n` +
      `${checklistUrl}\n\n` +
      `📲 *Como acessar seu checklist na plataforma:*\n` +
      `1. Toque no link acima (ou acesse pelo computador).\n` +
      `2. Faça login com seu e-mail do Seminário.\n` +
      `3. No menu, acesse a aba *Checklist*.\n` +
      `4. Você poderá marcar etapas concluídas, criar seus próprios prazos de estudo e acompanhar sua evolução em tempo real!\n`;

    return text;
  };

  const handleShareWhatsApp = () => {
    const text = generateWhatsAppAssessmentsText();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyWhatsAppText = () => {
    const text = generateWhatsAppAssessmentsText();
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedWhatsAppText(true);
        showNotification('✓ Texto do cronograma copiado para o WhatsApp!');
        setTimeout(() => setCopiedWhatsAppText(false), 2500);
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedWhatsAppText(true);
      showNotification('✓ Texto do cronograma copiado para o WhatsApp!');
      setTimeout(() => setCopiedWhatsAppText(false), 2500);
    }
  };

  const handleNativeShareAssessments = async () => {
    const text = generateWhatsAppAssessmentsText();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Calendário de Avaliações 2026.2 - Seminário Koinonia',
          text,
        });
        showNotification('✓ Cronograma compartilhado com sucesso!');
        return;
      } catch (e) {}
    }
    handleCopyWhatsAppText();
  };

  useEffect(() => {
    const unsubscribe = subscribeToStudentSync(normalizedEmail, (data) => {
      if (data.checklistTasks && Array.isArray(data.checklistTasks) && data.checklistTasks.length > 0) {
        // Verifica se a lista salva na nuvem é legada (sem assessmentId nas avaliações oficiais)
        const hasAssessmentIds = data.checklistTasks.some((t: any) => !!t.assessmentId);
        if (!hasAssessmentIds) {
          // Atualiza para a lista oficial vinculada aos 12 prazos, mantendo tarefas personalizadas do aluno
          const customTasks = data.checklistTasks.filter((t: any) => !t.id.startsWith('LMS-'));
          const upgraded = [...defaultSemesterTasks, ...customTasks];
          const synced = syncTasksWithLocalChecklists(upgraded);
          setTasks(synced);
          saveChecklistTasks(normalizedEmail, synced);
        } else {
          const synced = syncTasksWithLocalChecklists(data.checklistTasks);
          setTasks(synced);
        }
      } else {
        // Se a nuvem não tiver tarefas gravadas para este aluno, inicializa com o padrão oficial e grava na nuvem
        const synced = syncTasksWithLocalChecklists(defaultSemesterTasks);
        setTasks(synced);
        saveChecklistTasks(normalizedEmail, synced);
      }
    });

    return () => unsubscribe();
  }, [normalizedEmail]);

  // Listener para sincronização bidirecional em tempo real com o CalendarioAcademico
  useEffect(() => {
    const handleAssessmentSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail || customEvent.detail.source === 'kanban') return;
      const { assessmentId } = customEvent.detail;
      if (!assessmentId) return;

      setTasks((prev) => {
        const storageKey = `koinonia_checklist_${normalizedEmail}_${assessmentId}`;
        let checks: Record<number, boolean> = {};
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) checks = JSON.parse(raw);
        } catch (_) {}

        return prev.map((t) => {
          if (t.assessmentId === assessmentId) {
            const updatedSubtasks = t.subtasks.map((st, idx) => ({
              ...st,
              done: checks[idx] !== undefined ? !!checks[idx] : st.done,
            }));
            const doneCount = updatedSubtasks.filter((st) => st.done).length;
            const status: 'todo' | 'doing' | 'done' =
              doneCount === updatedSubtasks.length && updatedSubtasks.length > 0
                ? 'done'
                : doneCount > 0
                ? 'doing'
                : 'todo';
            return { ...t, subtasks: updatedSubtasks, status };
          }
          return t;
        });
      });
    };

    window.addEventListener('koinonia_assessment_progress_updated', handleAssessmentSync);
    return () => {
      window.removeEventListener('koinonia_assessment_progress_updated', handleAssessmentSync);
    };
  }, [normalizedEmail]);

  const saveTasks = (newTasks: KanbanTask[]) => {
    setTasks(newTasks);
    saveChecklistTasks(normalizedEmail, newTasks);
  };

  const handleResetToOfficialSemester = () => {
    if (confirm('Deseja sincronizar e restaurar a lista oficial de 16 marcos acadêmicos e avaliações do semestre 2026.2? Suas tarefas personalizadas serão preservadas.')) {
      // Mescla tarefas personalizadas com a lista oficial
      const customTasks = tasks.filter((t) => !defaultSemesterTasks.some((dt) => dt.id === t.id));
      const merged = [...defaultSemesterTasks, ...customTasks];
      const synced = syncTasksWithLocalChecklists(merged);
      saveTasks(synced);
      showNotification('✓ Lista oficial do semestre 2026.2 sincronizada com a Nuvem e o Calendário!');
    }
  };

  const handleStatusChange = (taskId: string, newStatus: 'todo' | 'doing' | 'done') => {
    let affectedAssessmentId: string | undefined;
    let affectedChecks: Record<number, boolean> | null = null;

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        let updatedSubtasks = t.subtasks;
        if (newStatus === 'done') {
          updatedSubtasks = t.subtasks.map((st) => ({ ...st, done: true }));
        } else if (newStatus === 'todo') {
          updatedSubtasks = t.subtasks.map((st) => ({ ...st, done: false }));
        }

        if (t.assessmentId) {
          affectedAssessmentId = t.assessmentId;
          const checks: Record<number, boolean> = {};
          updatedSubtasks.forEach((st, idx) => {
            checks[idx] = st.done;
          });
          affectedChecks = checks;
        }

        return { ...t, status: newStatus, subtasks: updatedSubtasks };
      }
      return t;
    });

    if (affectedAssessmentId && affectedChecks) {
      const storageKey = `koinonia_checklist_${normalizedEmail}_${affectedAssessmentId}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(affectedChecks));
      } catch (_) {}

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('koinonia_assessment_progress_updated', {
            detail: {
              source: 'kanban',
              assessmentId: affectedAssessmentId,
              status: newStatus,
              allSteps: affectedChecks,
            },
          })
        );
      }
    }

    saveTasks(updated);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    let affectedAssessmentId: string | undefined;
    let affectedStepIdx = -1;
    let affectedNewDone = false;

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const stepIdx = t.subtasks.findIndex((st) => st.id === subtaskId);
        const updatedSubtasks = t.subtasks.map((st, idx) =>
          idx === stepIdx ? { ...st, done: !st.done } : st
        );
        const doneCount = updatedSubtasks.filter((st) => st.done).length;
        const newStatus: 'todo' | 'doing' | 'done' =
          doneCount === updatedSubtasks.length && updatedSubtasks.length > 0
            ? 'done'
            : doneCount > 0
            ? 'doing'
            : 'todo';

        if (t.assessmentId && stepIdx !== -1) {
          affectedAssessmentId = t.assessmentId;
          affectedStepIdx = stepIdx;
          affectedNewDone = updatedSubtasks[stepIdx].done;
        }

        return { ...t, subtasks: updatedSubtasks, status: newStatus };
      }
      return t;
    });

    // Se pertence a uma avaliação oficial, sincroniza com localStorage e dispara evento para o CalendarioAcademico
    if (affectedAssessmentId && affectedStepIdx !== -1) {
      const storageKey = `koinonia_checklist_${normalizedEmail}_${affectedAssessmentId}`;
      try {
        const raw = localStorage.getItem(storageKey);
        const checks = raw ? JSON.parse(raw) : {};
        checks[affectedStepIdx] = affectedNewDone;
        localStorage.setItem(storageKey, JSON.stringify(checks));
      } catch (_) {}

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('koinonia_assessment_progress_updated', {
            detail: {
              source: 'kanban',
              assessmentId: affectedAssessmentId,
              stepIdx: affectedStepIdx,
              done: affectedNewDone,
            },
          })
        );
      }
    }

    saveTasks(updated);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const subtasksList = newSubtasksText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((text, idx) => ({ id: `st-${Date.now()}-${idx}`, text, done: false }));

    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      professor: newProfessor,
      dueDate: newDueDate,
      priority: newPriority,
      type: newType,
      status: 'todo',
      strategyNote: newStrategyNote.trim(),
      subtasks: subtasksList,
    };

    const next = [newTask, ...tasks];
    saveTasks(next);
    setIsModalOpen(false);
    setNewTitle('');
    setNewStrategyNote('');
    setNewSubtasksText('');
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Deseja realmente excluir esta atividade do seu checklist?')) {
      const next = tasks.filter((t) => t.id !== taskId);
      saveTasks(next);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedTypeFilter === 'all') return true;
    return t.type === selectedTypeFilter;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const subjectProfMap: Record<string, string> = {
    'História do Congregacionalismo': 'Profº Ary Júnior',
    'História do Pensamento Cristão II': 'Profº Hilário Bispo',
    'Aconselhamento Bíblico II': 'Profº Uilian Santos',
    'Direitos Humanos': 'Profº Cleiton Barbirato',
    'Ética Cristã': 'Profª Karoline Evangelista',
    'Novo Testamento III - Epístolas Gerais': 'Profº Marcio Leal',
    'Plantação e Revitalização de Igrejas II': 'Profº Thácyto Lessa',
    'TCC I': 'Profª Gabriela Leal',
    'Trabalho de Conclusão de Curso I (TCC I)': 'Profª Gabriela Leal',
    'Estágio Básico I e II (Bacharelado)': 'Prof. Antônio Carlos',
    'História da Cultura Afro Brasileira e Indígena': 'Profº Alexsandro',
    'Geral / Vida Comunitária': 'Pr. Uilian Santos / Pr. Márcio Leal',
    'Geral / Viagem Docente': 'Profº Marcio Leal',
    'Outra Disciplina / Atividade': 'Corpo Docente',
  };

  return (
    <div className="space-y-6">
      {/* 1. BANNER DESTAQUE: AGENDA 2026.2 / TRABALHOS E AVALIAÇÕES */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/25 flex-shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                Agenda 2026.2
              </span>
              <span className="text-xs text-amber-300 font-bold">12 Prazos Oficiais</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Trabalhos e Avaliações
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Consulte a grade mensal de Agosto a Dezembro com popups de resumo, normas ABNT e checklists passo a passo para cada matéria.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setActiveViewTab('kanban')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
              activeViewTab === 'kanban'
                ? 'bg-blue-600 hover:bg-blue-500 text-white ring-2 ring-blue-400 font-black'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Quadro Kanban ({tasks.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewTab('calendario')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
              activeViewTab === 'calendario'
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 ring-2 ring-amber-300 font-black'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>Grade & Calendário Mensal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {activeViewTab === 'calendario' ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          <CalendarioAcademico 
            userEmail={normalizedEmail} 
            onBack={() => setActiveViewTab('kanban')} 
          />
        </div>
      ) : (
        <>
          {/* Header Principal: Checklist & Dashboard AV Pessoal */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
              <CheckSquare className="w-3.5 h-3.5 text-amber-700" />
              Gestão de Avaliações 2026.2
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              👤 Aluno: {normalizedEmail}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Trabalhos e Avaliações
          </h2>
          <p className="text-sm text-gray-600 font-medium">
            Acompanhamento individual de trabalhos escritos, portfólios e provas objetivas finais.
          </p>
        </div>

        {/* Card de Progresso Geral & Botão de Nova Avaliação */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 min-w-[220px]">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold text-gray-700">Progresso Geral</span>
              <span className="font-black text-blue-600">{progressPercent}% ({completedTasks}/{totalTasks})</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <button
            onClick={() => setIsShareWhatsAppModalOpen(true)}
            title="Compartilhar lista de trabalhos e avaliações formatada para o WhatsApp"
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>Compartilhar no WhatsApp</span>
          </button>

          <button
            onClick={handleResetToOfficialSemester}
            title="Sincroniza e restaura todos os 15 prazos e marcos oficiais do semestre 2026.2"
            className="px-3.5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl border border-gray-300 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Restaurar Grade Oficial 2026.2</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Avaliação</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-900 font-black">✕</button>
        </div>
      )}

      {/* Callout Oficial de Atualização Dinâmica */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 rounded-2xl text-amber-950 text-xs sm:text-sm font-medium flex items-start gap-3 shadow-xs">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="block text-amber-900 font-bold">Acompanhamento e Atualização Contínua:</strong>
          <p className="text-amber-800">
            Este checklist será atualizado conforme os professores anunciarem ou adicionarem no projeto as avaliações.
            Você também pode cadastrar seus próprios prazos, metas de leitura e etapas de trabalhos escritos.
          </p>
        </div>
      </div>

      {/* Filtros Rápidos por Categoria */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-gray-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filtrar por Tipo:
          </span>
          {[
            { id: 'all', label: `Todos (${totalTasks})` },
            { id: 'Trabalho Escrito', label: '📝 Trabalhos Escritos' },
            { id: 'Resumo Crítico', label: '📖 Resumos Críticos' },
            { id: 'Portfólio', label: '📁 Portfólios' },
            { id: 'Estudo de Caso', label: '🔍 Estudos de Caso' },
            { id: 'Prova Objetiva', label: '🎯 Provas Objetivas' },
            { id: 'TCC', label: '🎓 TCC' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedTypeFilter(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedTypeFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quadro Kanban de Colunas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna 1: A Fazer */}
        <div className="bg-gray-100/70 p-4 rounded-3xl border border-gray-200/80 space-y-4">
          <div className="flex items-center justify-between font-bold text-sm text-gray-700 border-b border-gray-200 pb-2.5">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" /> A Fazer (Pendentes)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-700 text-xs font-black">
              {filteredTasks.filter((t) => t.status === 'todo').length}
            </span>
          </div>

          <div className="space-y-4">
            {filteredTasks
              .filter((t) => t.status === 'todo')
              .map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onToggleSubtask={handleToggleSubtask}
                  onDeleteTask={handleDeleteTask}
                />
              ))}
            {filteredTasks.filter((t) => t.status === 'todo').length === 0 && (
              <div className="p-8 text-center text-xs text-gray-400 italic">
                Nenhuma avaliação pendente nesta coluna.
              </div>
            )}
          </div>
        </div>

        {/* Coluna 2: Em Andamento */}
        <div className="bg-blue-50/40 p-4 rounded-3xl border border-blue-200/60 space-y-4">
          <div className="flex items-center justify-between font-bold text-sm text-blue-900 border-b border-blue-200 pb-2.5">
            <span className="flex items-center gap-2">
              <PenTool className="w-4 h-4 text-blue-600" /> Em Andamento (Produção)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-black">
              {filteredTasks.filter((t) => t.status === 'doing').length}
            </span>
          </div>

          <div className="space-y-4">
            {filteredTasks
              .filter((t) => t.status === 'doing')
              .map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onToggleSubtask={handleToggleSubtask}
                  onDeleteTask={handleDeleteTask}
                />
              ))}
            {filteredTasks.filter((t) => t.status === 'doing').length === 0 && (
              <div className="p-8 text-center text-xs text-gray-400 italic">
                Nenhuma avaliação em andamento nesta coluna.
              </div>
            )}
          </div>
        </div>

        {/* Coluna 3: Concluídos */}
        <div className="bg-emerald-50/40 p-4 rounded-3xl border border-emerald-200/60 space-y-4">
          <div className="flex items-center justify-between font-bold text-sm text-emerald-900 border-b border-emerald-200 pb-2.5">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Concluídos com Êxito
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              {filteredTasks.filter((t) => t.status === 'done').length}
            </span>
          </div>

          <div className="space-y-4">
            {filteredTasks
              .filter((t) => t.status === 'done')
              .map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onToggleSubtask={handleToggleSubtask}
                  onDeleteTask={handleDeleteTask}
                />
              ))}
            {filteredTasks.filter((t) => t.status === 'done').length === 0 && (
              <div className="p-8 text-center text-xs text-gray-400 italic">
                Nenhuma avaliação concluída nesta coluna.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Adicionar Nova Avaliação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">Adicionar Avaliação ao Checklist</h3>
                  <p className="text-xs text-gray-500">Cadastre trabalhos, portfólios ou provas anunciadas pelos professores.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Título do Trabalho / Avaliação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Artigo sobre Reforma Protestante ou Portfólio Missionário"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Disciplina</label>
                  <select
                    value={newSubject}
                    onChange={(e) => {
                      setNewSubject(e.target.value);
                      if (subjectProfMap[e.target.value]) {
                        setNewProfessor(subjectProfMap[e.target.value]);
                      }
                    }}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white outline-none focus:border-blue-500 text-xs"
                  >
                    {Object.keys(subjectProfMap).map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Professor(a) Responsável</label>
                  <input
                    type="text"
                    value={newProfessor}
                    onChange={(e) => setNewProfessor(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tipo</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white outline-none focus:border-blue-500 text-xs"
                  >
                    <option value="Trabalho Escrito">📝 Trabalho Escrito</option>
                    <option value="Resumo Crítico">📖 Resumo Crítico</option>
                    <option value="Portfólio">📁 Portfólio</option>
                    <option value="Estudo de Caso">🔍 Estudo de Caso</option>
                    <option value="Prova Objetiva">🎯 Prova Objetiva</option>
                    <option value="TCC">🎓 TCC</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Prazo / Entrega</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Prioridade</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white outline-none focus:border-blue-500 text-xs font-semibold"
                  >
                    <option value="Máxima">🔴 Máxima</option>
                    <option value="Média">🟡 Média</option>
                    <option value="Normal">⚪ Normal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Dica Estratégica / Instruções do Professor</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Seguir rigorosamente as normas ABNT e focar nos tópicos abordados na aula 3..."
                  value={newStrategyNote}
                  onChange={(e) => setNewStrategyNote(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Etapas / Sub-tarefas (1 por linha)</label>
                <textarea
                  rows={3}
                  placeholder="Ex:&#10;Fazer fichamento da leitura&#10;Escrever rascunho&#10;Revisão final e envio"
                  value={newSubtasksText}
                  onChange={(e) => setNewSubtasksText(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-md transition"
                >
                  Salvar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE COMPARTILHAMENTO DE AVALIAÇÕES PARA O WHATSAPP */}
      {isShareWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in zoom-in-95 duration-150 max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-emerald-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900">Compartilhar Avaliações no WhatsApp</h3>
                  <p className="text-[11px] text-gray-500">Texto simplificado e otimizado com link direto</p>
                </div>
              </div>
              <button
                onClick={() => setIsShareWhatsAppModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center border border-gray-200 transition cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo: Prévia do Texto */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-700 block">Prévia da Mensagem Formatada:</span>
                <p className="text-[11px] text-gray-500">
                  O texto abaixo já contém todos os prazos, links e orientações de acesso para enviar nos grupos de alunos e turmas.
                </p>
              </div>

              <div className="bg-slate-900 text-slate-100 font-mono text-xs p-3.5 rounded-2xl border border-slate-800 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto shadow-inner select-all">
                {generateWhatsAppAssessmentsText()}
              </div>

              {/* Botões de Ação */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Agora pelo WhatsApp</span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyWhatsAppText}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedWhatsAppText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                    <span>{copiedWhatsAppText ? 'Texto Copiado!' : 'Copiar Texto'}</span>
                  </button>

                  <button
                    onClick={handleNativeShareAssessments}
                    className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl border border-blue-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span>Outros Aplicativos</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsShareWhatsAppModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

interface KanbanCardProps {
  task: KanbanTask;
  onStatusChange: (id: string, status: 'todo' | 'doing' | 'done') => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  onStatusChange,
  onToggleSubtask,
  onDeleteTask,
}) => {
  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Máxima':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200">🔴 Máxima</span>;
      case 'Média':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">🟡 Média</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">⚪ Normal</span>;
    }
  };

  const totalSub = task.subtasks.length;
  const doneSub = task.subtasks.filter((s) => s.done).length;

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3 transition-all hover:shadow-md">
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-bold text-sm text-gray-900 leading-snug">{task.title}</h4>
        <button
          onClick={() => onDeleteTask(task.id)}
          className="text-gray-300 hover:text-red-600 transition p-1"
          title="Remover avaliação"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 items-center">
        {getPriorityBadge(task.priority)}
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
          {task.type}
        </span>
      </div>

      <div className="text-xs text-gray-500 font-medium space-y-0.5">
        <p className="font-semibold text-gray-700">{task.subject}</p>
        <p className="text-[11px] text-gray-400">{task.professor}</p>
      </div>

      <div className="p-2.5 bg-gray-50 rounded-xl text-xs text-gray-600 border border-gray-100 flex items-start gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span>Prazo: <strong>{task.dueDate}</strong></span>
          <p className="text-[11px] text-gray-500 leading-tight">{task.strategyNote}</p>
        </div>
      </div>

      {/* Lista de Checkbox Interno */}
      {task.subtasks.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-gray-100">
          <div className="flex justify-between text-[11px] text-gray-400 font-bold mb-1">
            <span>Etapas do Trabalho</span>
            <span>{doneSub}/{totalSub}</span>
          </div>
          {task.subtasks.map((st) => (
            <label key={st.id} className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer hover:text-blue-700">
              <input
                type="checkbox"
                checked={st.done}
                onChange={() => onToggleSubtask(task.id, st.id)}
                className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className={st.done ? 'line-through text-gray-400' : 'font-medium'}>{st.text}</span>
            </label>
          ))}
        </div>
      )}

      <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
        <span className="text-gray-400 font-semibold text-[11px]">Mover de Coluna:</span>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as any)}
          className="p-1.5 border border-gray-200 rounded-xl text-xs bg-gray-50 font-bold text-gray-700 outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="todo">⏳ A Fazer</option>
          <option value="doing">✍️ Em Andamento</option>
          <option value="done">✅ Concluído</option>
        </select>
      </div>
    </div>
  );
};
