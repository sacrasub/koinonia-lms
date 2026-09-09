'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, PenTool, AlertCircle, Zap, CheckCircle2, Clock, 
  Sparkles, Plus, Trash2, BookOpen, User, Calendar, Filter, X, RotateCcw
} from 'lucide-react';
import { subscribeToStudentSync, saveChecklistTasks } from '@/services/studentSyncService';

export interface KanbanTask {
  id: string;
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
  {
    id: 'LMS-003',
    title: 'Entrega Final do Projeto de Pesquisa (ABNT)',
    subject: 'Trabalho de Conclusão de Curso I (TCC I)',
    professor: 'Profª Gabriela Leal',
    dueDate: '2026-09-04',
    priority: 'Máxima',
    type: 'TCC',
    status: 'doing',
    strategyNote: 'Prazo rígido de duas semanas: Capa, Sumário, Objetivos (Geral e 2-3 Específicos no infinitivo), Justificativa, Referencial Teórico e Cronograma em tabela. Introdução por último. Linguagem impessoal (3ª pessoa) e sem IA.',
    subtasks: [
      { id: 'st-003-1', text: 'Definir título provisório, justificativa e objetivos no infinitivo', done: true },
      { id: 'st-003-2', text: 'Construir referencial teórico com normas ABNT e cronograma em tabela', done: false },
      { id: 'st-003-3', text: 'Revisar impessoalidade (3ª pessoa), ausência de IA e anexos de pesquisa de campo', done: false },
    ],
  },
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
  {
    id: 'LMS-005',
    title: 'Abertura dos Seminários: Os Dez Mandamentos',
    subject: 'Ética Cristã',
    professor: 'Profª Karoline Evangelista',
    dueDate: '2026-10-22',
    priority: 'Máxima',
    type: 'Seminário em Grupo',
    status: 'todo',
    strategyNote: 'Início das apresentações em equipes (duplas/trios) sobre os Dez Mandamentos com fundamentação no Catecismo Maior de Westminster e Norman Geisler (30 min por equipe, 10 min por orador no cronômetro).',
    subtasks: [
      { id: 'st-005-1', text: 'Organização da equipe e divisão do tema dos mandamentos', done: false },
      { id: 'st-005-2', text: 'Estudo do Catecismo Maior de Westminster e confecção dos slides', done: false },
      { id: 'st-005-3', text: 'Ensaio cronometrado de oratória e desenvoltura no púlpito (10 min)', done: false },
    ],
  },
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
  {
    id: 'LMS-007',
    title: 'Encerramento dos Seminários: Os Dez Mandamentos',
    subject: 'Ética Cristã',
    professor: 'Profª Karoline Evangelista',
    dueDate: '2026-11-19',
    priority: 'Máxima',
    type: 'Seminário em Grupo',
    status: 'todo',
    strategyNote: 'Conclusão das bancas de apresentações sobre os Dez Mandamentos e consolidação das notas individuais (V1 + V2).',
    subtasks: [
      { id: 'st-007-1', text: 'Envio final dos slides e consolidação das notas individuais', done: false },
    ],
  },
  {
    id: 'LMS-008',
    title: 'Entrega do Resumo de "A Treliça e a Videira" (AV1)',
    subject: 'Plantação e Revitalização de Igrejas II',
    professor: 'Profº Thácyto Lessa',
    dueDate: '2026-11-27',
    priority: 'Máxima',
    type: 'Resumo Crítico',
    status: 'todo',
    strategyNote: 'Envio do resumo detalhado capítulo por capítulo do livro "A Treliça e a Videira" (Marshall & Payne). Limite rígido de 1 página por capítulo (12 capítulos = 12 folhas). Enviar para thacyto@gmail.com.',
    subtasks: [
      { id: 'st-008-1', text: 'Leitura completa dos 12 capítulos da obra', done: false },
      { id: 'st-008-2', text: 'Redação sintética de 1 página por capítulo (total de 12 páginas)', done: false },
      { id: 'st-008-3', text: 'Envio em PDF/DOCX para thacyto@gmail.com', done: false },
    ],
  },
  {
    id: 'LMS-009',
    title: 'Realização da Prova Teórica Online (AV2)',
    subject: 'Plantação e Revitalização de Igrejas II',
    professor: 'Profº Thácyto Lessa',
    dueDate: '2026-11-27',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: 'Prova por link de formulário abordando os Quatro Ps da Revitalização (Pregar, Piedade, Pastorear, Perseverar) e Treliça/Videira. Consulta 100% autorizada a anotações e slides.',
    subtasks: [
      { id: 'st-009-1', text: 'Revisar conceitos dos Quatro Ps e slides unificados', done: false },
      { id: 'st-009-2', text: 'Preencher o formulário oficial da AV2', done: false },
    ],
  },
  {
    id: 'LMS-010',
    title: 'Encerramento das Provas AV1 e AV2 (Google Forms)',
    subject: 'Aconselhamento Bíblico II',
    professor: 'Profº Uilian Santos',
    dueDate: '2026-12-15',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: 'Aplicação de 2 avaliações teóricas no Google Forms com correção e notas instantâneas. Aborda suficiência bíblica, Jó, teodiceia e "Ego Transformado" (Keller). Sem trabalhos escritos; focado nos slides.',
    subtasks: [
      { id: 'st-010-1', text: 'Leitura atenta do livreto "Ego Transformado" (Timothy Keller)', done: false },
      { id: 'st-010-2', text: 'Revisão minuciosa dos slides de aula para AV1 e AV2', done: false },
      { id: 'st-010-3', text: 'Preenchimento e envio dos formulários das provas', done: false },
    ],
  },
  {
    id: 'LMS-011',
    title: 'Consolidação das Avaliações V1 e V2',
    subject: 'Direitos Humanos',
    professor: 'Profº Cleiton Barbirato',
    dueDate: '2026-12-15',
    priority: 'Máxima',
    type: 'Trabalho Escrito',
    status: 'todo',
    strategyNote: 'V1 (30/09/2026): Dissertação de até 1 lauda sobre Desigualdade Social e Privilégios (peso 2,0) + Prova Forms (peso 8,0). V2 (25/11/2026): Prova Forms (peso 8,0) + Pesquisa escrita (peso 2,0). Média >= 7,0 para aprovação.',
    subtasks: [
      { id: 'st-011-1', text: 'Redigir dissertação de até 1 lauda sobre "Desigualdade Social e Privilégios" e a Igreja como agente transformador (Times New Roman 12, esp. 1,5)', done: false },
      { id: 'st-011-2', text: 'Enviar dissertação da AV1 para cleitonpb@gmail.com com assunto "Trabalho para composição de nota" até 30/09/2026 (Valor: 2,0 pts)', done: false },
      { id: 'st-011-3', text: 'Realizar prova objetiva no Google Forms sem consulta na data da AV1 (Valor: 8,0 pts)', done: false },
      { id: 'st-011-4', text: 'Preparação para as etapas da V2 (Prova Forms peso 8 + Trabalho peso 2 em 25/11)', done: false },
    ],
  },
  {
    id: 'LMS-012',
    title: 'Fechamento de Notas da Unidade I e II',
    subject: 'História do Congregacionalismo',
    professor: 'Profº Ary Júnior',
    dueDate: '2026-12-15',
    priority: 'Máxima',
    type: 'Provas e Participação',
    status: 'todo',
    strategyNote: 'Fechamento das duas unidades: Prova escrita (0 a 8 pts) + Frequência e participação ativa com câmeras ligadas (1 pt) + Confirmação ética de leitura obrigatória (1 pt).',
    subtasks: [
      { id: 'st-012-1', text: 'Leitura dos textos obrigatórios e da obra de Hidauro Campos', done: false },
      { id: 'st-012-2', text: 'Participação ativa com câmeras ligadas em todas as transmissões', done: false },
      { id: 'st-012-3', text: 'Realização das provas escritas da Unidade 1 e Unidade 2', done: false },
    ],
  },
  {
    id: 'LMS-013',
    title: 'Entrega da AV1 (Trabalho ABNT) e AV2 (Prova 10 Questões)',
    subject: 'História do Pensamento Cristão II',
    professor: 'Profº Hilário Bispo',
    dueDate: '2026-12-15',
    priority: 'Máxima',
    type: 'Trabalho Escrito',
    status: 'todo',
    strategyNote: 'Entrega de trabalho acadêmico de pesquisa sobre "Iluminismo e a Modernidade" em ABNT (AV1 - individual/trio). Prova objetiva de 10 questões no Google Forms com resultado automático (AV2).',
    subtasks: [
      { id: 'st-013-1', text: 'Pesquisa sobre conflito razão/revelação e redação nas normas ABNT', done: false },
      { id: 'st-013-2', text: 'Envio da pesquisa acadêmica da AV1', done: false },
      { id: 'st-013-3', text: 'Realização da prova objetiva de 10 questões no Google Forms (AV2)', done: false },
    ],
  },
  {
    id: 'LMS-014',
    title: 'Avaliação de 150 Questões Discursivas e Orais',
    subject: 'Novo Testamento III - Epístolas Gerais',
    professor: 'Profº Marcio Leal',
    dueDate: '2026-12-15',
    priority: 'Máxima',
    type: 'Prova Objetiva',
    status: 'todo',
    strategyNote: 'Formulário contendo 150 questões de natureza teológica e exegética sobre Epístolas Gerais (foco em Hebreus e livro de Carson). Câmeras ligadas e anotações ricas das aulas verbais.',
    subtasks: [
      { id: 'st-014-1', text: 'Manter anotações ricas e ativas durante as transmissões ao vivo', done: false },
      { id: 'st-014-2', text: 'Estudo do livro "Introdução ao Novo Testamento" (Carson/Moo/Morris)', done: false },
      { id: 'st-014-3', text: 'Preenchimento da bateria de 150 questões no Google Forms', done: false },
    ],
  },
  {
    id: 'LMS-015',
    title: 'Entrega Final do Artigo Científico Redigido',
    subject: 'Trabalho de Conclusão de Curso I (TCC I)',
    professor: 'Profª Gabriela Leal',
    dueDate: '2026-12-15',
    priority: 'Máxima',
    type: 'TCC',
    status: 'todo',
    strategyNote: 'Fechamento da redação final do projeto de pesquisa estruturado e texto integral do artigo científico. Sem provas tradicionais; nota por progresso contínuo e envio final.',
    subtasks: [
      { id: 'st-015-1', text: 'Desenvolvimento do artigo sob orientação docente especializada', done: false },
      { id: 'st-015-2', text: 'Redação científica impessoal (3ª pessoa) e revisão final ABNT', done: false },
      { id: 'st-015-3', text: 'Entrega do artigo completo e anexos de pesquisa de campo', done: false },
    ],
  },
  {
    id: 'LMS-016',
    title: 'Produção e Envio da Atividade Modular (4ª Aula)',
    subject: 'História da Cultura Afro Brasileira e Indígena',
    professor: 'Profº Alexsandro',
    dueDate: '2026-11-28',
    priority: 'Máxima',
    type: 'Atividade Modular',
    status: 'todo',
    strategyNote: 'Matéria modular com 4 aulas gravadas na pasta oficial do Google Drive. Na 4ª aula, o Profº Alexsandro apresenta e explica a atividade que deve ser produzida e enviada para o seu e-mail até o final do período (28/11/2026).',
    subtasks: [
      { id: 'st-016-1', text: 'Assistir às 4 aulas gravadas na pasta oficial do Google Drive', done: false },
      { id: 'st-016-2', text: 'Anotar as orientações da atividade avaliativa explicadas na 4ª aula', done: false },
      { id: 'st-016-3', text: 'Produzir a atividade e enviar para o e-mail do Profº Alexsandro até 28/11/2026', done: false },
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

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    const unsubscribe = subscribeToStudentSync(normalizedEmail, (data) => {
      if (data.checklistTasks && Array.isArray(data.checklistTasks) && data.checklistTasks.length > 0) {
        setTasks(data.checklistTasks);
      } else {
        // Se a nuvem não tiver tarefas gravadas para este aluno, inicializa com o padrão oficial e grava na nuvem
        saveChecklistTasks(normalizedEmail, defaultSemesterTasks);
      }
    });

    return () => unsubscribe();
  }, [normalizedEmail]);

  const saveTasks = (newTasks: KanbanTask[]) => {
    setTasks(newTasks);
    saveChecklistTasks(normalizedEmail, newTasks);
  };

  const handleResetToOfficialSemester = () => {
    if (confirm('Deseja sincronizar e restaurar a lista oficial de 15 marcos acadêmicos e avaliações do semestre 2026.2? Suas tarefas personalizadas serão preservadas.')) {
      // Mescla tarefas personalizadas com a lista oficial
      const customTasks = tasks.filter((t) => !defaultSemesterTasks.some((dt) => dt.id === t.id));
      const merged = [...defaultSemesterTasks, ...customTasks];
      saveTasks(merged);
      showNotification('✓ Lista oficial do semestre 2026.2 sincronizada com a Nuvem e seu perfil!');
    }
  };

  const handleStatusChange = (taskId: string, newStatus: 'todo' | 'doing' | 'done') => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
    saveTasks(updated);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, done: !st.done } : st
        );
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    });
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
    <div className="space-y-8">
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
            Checklist & Dashboard AV Pessoal
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
