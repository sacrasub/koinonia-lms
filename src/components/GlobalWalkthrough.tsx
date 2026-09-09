'use client';

import { useEffect, useRef, useMemo } from 'react';
import { driver, DriveStep, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useDeviceMode } from '@/hooks/useDeviceMode';
import { UserRole } from '@/types';

interface GlobalWalkthroughProps {
  userEmail?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  currentRole?: UserRole;
}

interface TourStepDefinition {
  element: string;
  fallbackElement?: string;
  title: string;
  description: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  requiredTab?: string;
  nextTabAction?: string;
}

export function GlobalWalkthrough({ 
  userEmail, 
  activeTab, 
  onTabChange,
  currentRole = 'aluno'
}: GlobalWalkthroughProps) {
  const { isMobile } = useDeviceMode();
  const driverInstanceRef = useRef<Driver | null>(null);
  const isTransitioningRef = useRef(false);
  const activeTabRef = useRef<string>(activeTab || '');

  // Mantém a referência da aba atual sempre atualizada para callbacks assíncronos
  useEffect(() => {
    activeTabRef.current = activeTab || '';
  }, [activeTab]);

  // Normalização do e-mail para chave única no localStorage
  const normalizedEmail = (userEmail || 'aluno')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '_');

  const effectiveRole = currentRole || 'aluno';
  const activeTourKey = `koinonia_tour_active_${effectiveRole}_${normalizedEmail}`;
  const stepIndexKey = `koinonia_tour_step_index_${effectiveRole}_${normalizedEmail}`;
  const completedTourKey = `koinonia_tour_completed_${effectiveRole}_${normalizedEmail}`;

  // =========================================================================
  // 1. PASSOS DO TOUR PARA ALUNO (DISCENTE)
  // =========================================================================
  const alunoDesktopSteps: TourStepDefinition[] = [
    {
      element: '[data-tour="role-selector"]',
      fallbackElement: 'header',
      title: '🎓 Bem-vindo(a) ao Koinonia LMS • Painel do Aluno',
      description: 'Este é o seu ecossistema acadêmico completo para o Seminário Teológico Congregacional! Acompanhe suas aulas síncronas, presenças, notas e biblioteca digital.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="dark-mode-toggle"]',
      fallbackElement: 'header',
      title: '🌓 Modo Escuro Nativo (Dark Mode)',
      description: 'Conforto visual absoluto para suas leituras noturnas e estudos bíblicos prolongados! Alterne entre tema claro e escuro a qualquer momento com apenas 1 clique.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="live-banner"]',
      fallbackElement: '[data-tour="disciplinas-grid"]',
      title: '🔴 Aulas Ao Vivo & Google Meet',
      description: 'Em noites de aula síncrona (Terça a Sexta às 19:30 BRT), o banner da aula abre em destaque no topo com link oficial do Meet e lista de presença liberada com 1 clique aos 50% do horário.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="dashboard-mural"]',
      fallbackElement: 'main',
      title: '📖 Mural de Recursos & Leituras Pré-Aula',
      description: 'Consulte os artigos, textos complementares e links disponibilizados pelos professores. Marque como lidas e compartilhe facilmente no WhatsApp da turma.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="aluno-gravacoes"]',
      fallbackElement: 'main',
      title: '🎬 Hub de Aulas Gravadas em HD',
      description: 'Perdeu uma aula ou deseja revisar? Assista a todas as transmissões passadas gravadas em alta definição diretamente no player seguro da plataforma.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="disciplinas-grid"]',
      fallbackElement: 'main',
      title: '📚 Grade Curricular da Semana (2026.2)',
      description: 'Acompanhe as 16 aulas de cada disciplina do semestre (de Terça a Sexta), registre sua presença, notas de estudo e gere relatórios de reposição.',
      side: 'top',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="card-fluxo-estudos"]',
      fallbackElement: 'main',
      title: '🧭 Fluxo de Estudos & Ecossistema Teológico',
      description: 'Conecte suas 11 pastas do Google Drive, Google Agenda, salas do Meet, Caderno Cornell, prompts do Gemini e cadernos do NotebookLM em 6 fases de estudo.',
      side: 'top',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="card-quatro-ds"]',
      fallbackElement: 'main',
      title: '🔥 Trilha dos Quatro Ds (Método de Jesus)',
      description: 'Metodologia andragógica inov-ativa: vivencie o ciclo de Desejo, Desestruturação, Desafio e Decisão para reflexão ministerial profunda.',
      side: 'top',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="card-homiletica"]',
      fallbackElement: 'main',
      title: '🎙️ Estúdio de Prática Homilética & Pares',
      description: 'Grave seus sermões com timer litúrgico integrado, pratique aconselhamento pastoral e troque feedbacks construtivos com os colegas.',
      side: 'top',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="card-metaverso"]',
      fallbackElement: 'main',
      title: '🏛️ Metaverso Teológico 3D',
      description: 'Explore reconstituições históricas sagradas em 3D (Tabernáculo no Deserto, Templo de Salomão, Jerusalém Bíblica) conectando arqueologia à teologia.',
      side: 'top',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="nav-biblioteca"]',
      fallbackElement: 'aside',
      title: '🏛️ Biblioteca Digital Teológica',
      description: 'Vamos conhecer o acervo com mais de 3.000 livros teológicos, comentários bíblicos, leitor de PDF embutido e citação bibliográfica no padrão ABNT com 1 clique.',
      side: 'right',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
      nextTabAction: 'aluno-biblioteca',
    },
    {
      element: '[data-tour="biblioteca-search"]',
      fallbackElement: 'main',
      title: '🔍 Busca Inteligente no Acervo',
      description: 'Pesquise obras rapidamente por título, autor, assunto ou pelas matérias com leitura recomendada no semestre letivo.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'aluno-biblioteca',
    },
    {
      element: '[data-tour="btn-ajuda"]',
      fallbackElement: 'header',
      title: '💡 Central de Ajuda & Tutoriais em Vídeo',
      description: 'Precisa de orientação? Acesse tutoriais curtos em vídeo ensinando cada recurso da plataforma ou reinicie este tour quando quiser. Bons estudos e excelente semestre acadêmico! 🎉',
      side: 'bottom',
      align: 'end',
      requiredTab: 'aluno-biblioteca',
      nextTabAction: 'aluno-disciplinas',
    },
  ];

  const alunoMobileSteps: TourStepDefinition[] = [
    {
      element: '[data-tour="btn-mobile-menu"]',
      fallbackElement: 'header',
      title: '📱 Menu Lateral Completo',
      description: 'Toque neste botão a qualquer momento para abrir todas as matérias, fóruns, laboratórios práticos, pastas e sua biblioteca.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="dark-mode-toggle"]',
      fallbackElement: 'header',
      title: '🌓 Modo Escuro Nativo',
      description: 'Toque para alternar para o tema escuro, perfeito para leituras e aulas ao vivo no celular sem cansar a visão.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="live-banner"]',
      fallbackElement: '[data-tour="disciplinas-grid"]',
      title: '🔴 Aula Ao Vivo & Frequência',
      description: 'Acesse o Google Meet direto pelo smartphone e assine a lista de presença com 1 toque durante a transmissão síncrona.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="disciplinas-grid"]',
      fallbackElement: 'main',
      title: '📚 Grade Semanal & Caderno Cornell',
      description: 'Acompanhe as 16 aulas do semestre, marque presença e faça anotações no seu Caderno Cornell estruturado com IA.',
      side: 'top',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="btn-mobile-menu"]',
      fallbackElement: 'header',
      title: '🏛️ Biblioteca Digital (3.000+ Livros)',
      description: 'Abra o menu para acessar o acervo com mais de 3.000 obras teológicas e leitor de PDF embutido otimizado para celular.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="btn-ajuda"]',
      fallbackElement: 'header',
      title: '💡 Central de Ajuda & Tutoriais',
      description: 'Assista a vídeos rápidos de demonstração ou reinicie este tour quando quiser pelo menu. Tenha um excelente aprendizado! 🎉',
      side: 'bottom',
      align: 'end',
      requiredTab: 'aluno-disciplinas',
    },
  ];

  // =========================================================================
  // 2. PASSOS DO TOUR PARA PROFESSOR (DOCENTE)
  // =========================================================================
  const professorDesktopSteps: TourStepDefinition[] = [
    {
      element: '[data-tour="role-selector"]',
      fallbackElement: 'header',
      title: '👨‍🏫 Bem-vindo, Professor • Painel Pedagógico',
      description: 'Este é o seu centro de gestão docente no Seminário Teológico Congregacional! Aqui você gerencia suas turmas, publica materiais e conduz o acompanhamento mediador.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'prof-disciplinas',
    },
    {
      element: '[data-tour="prof-materias-salas"]',
      fallbackElement: '[data-tour="nav-prof-disciplinas"]',
      title: '🎥 Salas Virtuais do Meet & Manejo de Disciplinas',
      description: 'Visualize as disciplinas sob sua regência docente: acesse a sala oficial do Meet, inicie gravação da aula, insira slides e use "Manejar Matéria" para personalizar links da sala e pasta do Google Drive.',
      side: 'top',
      align: 'center',
      requiredTab: 'prof-disciplinas',
    },
    {
      element: '[data-tour="prof-publicar-leituras"]',
      fallbackElement: 'main',
      title: '📢 Publicar Leituras & Avisos Pré-Aula',
      description: 'Envie artigos didáticos, textos e links para os alunos antes de cada aula. Os avisos surgem no mural dos alunos e contam com botão de disparo direto no WhatsApp da turma!',
      side: 'bottom',
      align: 'start',
      requiredTab: 'prof-disciplinas',
    },
    {
      element: '[data-tour="prof-materiais-avaliacoes"]',
      fallbackElement: 'main',
      title: '📝 Materiais Didáticos & Avaliações (Google Forms)',
      description: 'Publique apostilas em PDF ou links do Google Drive e crie avaliações formativas. É possível incorporar questionários do Google Forms com rubricas diagnósticas e feedback contínuo.',
      side: 'top',
      align: 'center',
      requiredTab: 'prof-disciplinas',
    },
    {
      element: '[data-tour="nav-tele-proximidade"]',
      fallbackElement: 'aside',
      title: '📡 Radar de Tele-Proximidade Docente',
      description: 'Monitore em tempo real a distância transacional dos alunos: frequência síncrona, ritmo de estudo autônomo e alertas de desengajamento para intervenção pedagógica preventiva.',
      side: 'right',
      align: 'center',
      requiredTab: 'prof-disciplinas',
      nextTabAction: 'tele-proximidade',
    },
    {
      element: '[data-tour="nav-portfolios"]',
      fallbackElement: 'aside',
      title: '🗂️ Portfólios Reflexivos dos Seminaristas',
      description: 'Acompanhe as sínteses teológicas, memoriais e tarefas dos alunos ao longo das 16 semanas com critérios de avaliação mediadora (Jussara Hoffmann).',
      side: 'right',
      align: 'center',
      requiredTab: 'tele-proximidade',
      nextTabAction: 'portfolios',
    },
    {
      element: '[data-tour="nav-biblioteca"]',
      fallbackElement: 'aside',
      title: '🏛️ Curadoria Bibliográfica Teológica',
      description: 'Indique capítulos e obras do acervo digital institucional (3.000+ títulos) diretamente como bibliografia recomendada para suas matérias.',
      side: 'right',
      align: 'center',
      requiredTab: 'portfolios',
      nextTabAction: 'aluno-biblioteca',
    },
    {
      element: '[data-tour="btn-ajuda"]',
      fallbackElement: 'header',
      title: '💡 Gravador de Vídeo-Aulas & Ajuda Docente',
      description: 'Grave vídeo-aulas diretamente pelo navegador com corte de início e fim ou consulte a Central de Ajuda sempre que precisar. Excelente semestre letivo! 🎉',
      side: 'bottom',
      align: 'end',
      requiredTab: 'aluno-biblioteca',
      nextTabAction: 'prof-disciplinas',
    },
  ];

  const professorMobileSteps: TourStepDefinition[] = [
    {
      element: '[data-tour="btn-mobile-menu"]',
      fallbackElement: 'header',
      title: '📱 Menu de Ferramentas Docentes',
      description: 'Toque para acessar suas disciplinas, radar de tele-proximidade, avaliações, portfólios e a biblioteca institucional.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'prof-disciplinas',
    },
    {
      element: '[data-tour="dark-mode-toggle"]',
      fallbackElement: 'header',
      title: '🌓 Modo Escuro Nativo',
      description: 'Alternância rápida para visual noturno confortável durante o planejamento pedagógico no celular.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'prof-disciplinas',
    },
    {
      element: '[data-tour="prof-publicar-leituras"]',
      fallbackElement: 'main',
      title: '📢 Publicar Avisos Rápidos (WhatsApp)',
      description: 'Envie links e avisos para a turma direto do celular com formatação pronta para o grupo de WhatsApp.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'prof-disciplinas',
    },
    {
      element: '[data-tour="prof-materias-salas"]',
      fallbackElement: 'main',
      title: '🎥 Salas do Meet & Disciplinas',
      description: 'Abra a sala do Meet da aula ou ajuste links de materiais e presenças com facilidade.',
      side: 'top',
      align: 'center',
      requiredTab: 'prof-disciplinas',
    },
    {
      element: '[data-tour="btn-ajuda"]',
      fallbackElement: 'header',
      title: '💡 Central de Ajuda & Tutoriais',
      description: 'Acesse tutoriais em vídeo e orientações pedagógicas para condução das aulas síncronas.',
      side: 'bottom',
      align: 'end',
      requiredTab: 'prof-disciplinas',
    },
  ];

  // =========================================================================
  // 3. PASSOS DO TOUR PARA MONITOR (APOIO SÍNCRONO)
  // =========================================================================
  const monitorDesktopSteps: TourStepDefinition[] = [
    {
      element: '[data-tour="role-selector"]',
      fallbackElement: 'header',
      title: '🤝 Bem-vindo, Monitor • Central de Monitoria',
      description: 'Você é o ponto de apoio fundamental da comunidade e das aulas síncronas! Seu painel organiza a escala semanal, formulários de presença e gravações de aulas.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'monitor-escala',
    },
    {
      element: '[data-tour="monitor-header"]',
      fallbackElement: '[data-tour="nav-monitor-escala"]',
      title: '⚡ Painel Central do Monitor & Sincronização',
      description: 'Dashboard unificado com status da monitoria, contagem de tarefas e botão de sincronização em nuvem leve para manter todos os dados atualizados.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'monitor-escala',
    },
    {
      element: '[data-tour="monitor-grade-dia"]',
      fallbackElement: 'main',
      title: '📋 Grade do Dia & Links de Presença',
      description: 'Acompanhe as aulas síncronas de Terça a Sexta e utilize os botões rápidos para copiar o link da lista de presença (Google Forms) e colar no chat do Meet aos 50% da aula.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'monitor-escala',
    },
    {
      element: '[data-tour="monitor-acoes-rapidas"]',
      fallbackElement: 'main',
      title: '🚀 Ações Rápidas da Monitoria',
      description: 'Atalhos diretos para abrir a Escala Completa, ativar o Gravador em Piloto Automático, moderar os Fóruns Koinonia, acessar as Pastas Virtuais e a Grade Semanal.',
      side: 'top',
      align: 'center',
      requiredTab: 'monitor-escala',
    },
    {
      element: '[data-tour="monitor-gravacoes-card"]',
      fallbackElement: 'main',
      title: '🎬 Hub de Gravações das Aulas',
      description: 'Consulte e registre os links das transmissões passadas gravadas em HD para atender prontamente seminaristas que necessitam de reposição.',
      side: 'top',
      align: 'center',
      requiredTab: 'monitor-escala',
    },
    {
      element: '[data-tour="monitor-avisos-card"]',
      fallbackElement: 'main',
      title: '📢 Mural de Avisos & Recursos Recentes',
      description: 'Acompanhe os avisos e textos postados pelos docentes para reforçar as orientações pedagógicas nos grupos de WhatsApp dos alunos.',
      side: 'top',
      align: 'center',
      requiredTab: 'monitor-escala',
    },
    {
      element: '[data-tour="nav-tele-proximidade"]',
      fallbackElement: 'aside',
      title: '📡 Radar de Acolhimento & Tele-Proximidade',
      description: 'Localize alunos ausentes ou com dificuldades de conexão para envio de mensagem pastoral de suporte e encorajamento no WhatsApp.',
      side: 'right',
      align: 'center',
      requiredTab: 'monitor-escala',
      nextTabAction: 'tele-proximidade',
    },
    {
      element: '[data-tour="nav-comunidade-forum"]',
      fallbackElement: 'aside',
      title: '💬 Fóruns Comunitários & Mural de Oração',
      description: 'Participe ativamente da moderação e acolhimento nos tópicos de debate e nos pedidos de oração dos irmãos.',
      side: 'right',
      align: 'center',
      requiredTab: 'tele-proximidade',
      nextTabAction: 'comunidade-forum',
    },
    {
      element: '[data-tour="btn-ajuda"]',
      fallbackElement: 'header',
      title: '💡 Manual de Monitoria & Checklist',
      description: 'Consulte diretrizes operacionais, checklist da transmissão e tutoriais sempre que necessário. Bom trabalho de monitoria! 🎉',
      side: 'bottom',
      align: 'end',
      requiredTab: 'comunidade-forum',
      nextTabAction: 'monitor-escala',
    },
  ];

  const monitorMobileSteps: TourStepDefinition[] = [
    {
      element: '[data-tour="btn-mobile-menu"]',
      fallbackElement: 'header',
      title: '📱 Menu de Monitoria',
      description: 'Toque para acessar a escala semanal, controle de presenças, fóruns e tele-proximidade.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'monitor-escala',
    },
    {
      element: '[data-tour="monitor-grade-dia"]',
      fallbackElement: 'main',
      title: '📋 Grade do Dia & Links de Presença',
      description: 'Abra o Google Meet pelo celular ou copie o link da lista de presença com 1 toque para enviar no chat da aula.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'monitor-escala',
    },
    {
      element: '[data-tour="monitor-acoes-rapidas"]',
      fallbackElement: 'main',
      title: '🚀 Ações Rápidas (Meet & Gravação)',
      description: 'Atalhos de 1 toque para gerenciar a monitoria e acionar o gravador de transmissão.',
      side: 'top',
      align: 'center',
      requiredTab: 'monitor-escala',
    },
    {
      element: '[data-tour="monitor-gravacoes-card"]',
      fallbackElement: 'main',
      title: '🎬 Registro de Gravações',
      description: 'Consulte os links das aulas passadas para apoiar os seminaristas em reposição.',
      side: 'top',
      align: 'center',
      requiredTab: 'monitor-escala',
    },
    {
      element: '[data-tour="btn-ajuda"]',
      fallbackElement: 'header',
      title: '💡 Orientações & Checklist',
      description: 'Acesse manuais rápidos e tutoriais em vídeo para o suporte às aulas síncronas.',
      side: 'bottom',
      align: 'end',
      requiredTab: 'monitor-escala',
    },
  ];

  // =========================================================================
  // 4. PASSOS DO TOUR PARA ADMIN (ADMINISTRADOR)
  // =========================================================================
  const adminDesktopSteps: TourStepDefinition[] = [
    {
      element: '[data-tour="role-selector"]',
      fallbackElement: 'header',
      title: '👑 Bem-vindo, Administrador • Gestão Geral',
      description: 'Controle global do Koinonia LMS para o Seminário Teológico Congregacional: gestão de usuários, papéis RBAC, turmas, disciplinas, auditoria de acessos e custos.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'admin-dashboard',
    },
    {
      element: '[data-tour="admin-metrics"]',
      fallbackElement: '[data-tour="nav-admin-dashboard"]',
      title: '📈 Métricas Consolidadas em Tempo Real',
      description: 'Acompanhe em tempo real o total de usuários autorizados, solicitações de acesso aguardando resposta, número de professores cadastrados e matérias oficiais ativas.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'admin-dashboard',
    },
    {
      element: '[data-tour="admin-analytics"]',
      fallbackElement: 'main',
      title: '📊 Auditoria de Acessos & Telemetria em Tempo Real',
      description: 'Monitore em tempo real quem está conectado, tempo ativo de estudos, dispositivos utilizados (computador/celular) e exporte datasets em CSV ou JSON.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'admin-dashboard',
    },
    {
      element: '[data-tour="admin-requests"]',
      fallbackElement: 'main',
      title: '📋 Fila de Solicitações Pendentes de Acesso',
      description: 'Analise novos cadastros solicitados por alunos e aprove com 1 clique, disparando instantaneamente as credenciais com mensagem de boas-vindas pelo WhatsApp e Gmail.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'admin-dashboard',
    },
    {
      element: '[data-tour="admin-usuarios"]',
      fallbackElement: 'main',
      title: '👥 Gestão de Usuários & Papéis (RBAC)',
      description: 'Gerencie permissões (Aluno, Professor, Monitor, Admin), aloque seminaristas em turmas, altere senhas e dispare mensagens institucionais em lote.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'admin-dashboard',
    },
    {
      element: '[data-tour="admin-disciplinas-tab"]',
      fallbackElement: 'main',
      title: '📚 Gestão Curricular de Disciplinas & Docentes',
      description: 'Cadastre novas disciplinas, vincule professores titulares, defina dias da semana, horários das aulas síncronas e pastas oficiais do Google Drive.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'admin-dashboard',
    },
    {
      element: '[data-tour="nav-tcc-sacramento"]',
      fallbackElement: 'aside',
      title: '🔬 Módulo de Pesquisa Empírica do TCC (Sacramento)',
      description: 'Instrumento científico para mensurar a redução da Distância Transacional, engajamento em RPG, Autodeterminação e Avaliação Mediadora, com exportação SPSS/Excel.',
      side: 'right',
      align: 'center',
      requiredTab: 'admin-dashboard',
      nextTabAction: 'tcc-sacramento',
    },
    {
      element: '[data-tour="btn-sincronizar"]',
      fallbackElement: 'header',
      title: '⚡ Blindagem de Egress (Supabase Free Plan)',
      description: 'Arquitetura Zero-Waste Egress com delta-sync local-first e batching para manter o consumo real < 200 MB/mês, operando com folga absoluta no plano gratuito.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'tcc-sacramento',
      nextTabAction: 'admin-dashboard',
    },
    {
      element: '[data-tour="btn-atualizacoes"]',
      fallbackElement: 'header',
      title: '🔔 Central de Comunicados Oficiais',
      description: 'Envie avisos institucionais em massa que aparecem em destaque para toda a comunidade acadêmica no momento do login.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'admin-dashboard',
    },
    {
      element: '[data-tour="btn-ajuda"]',
      fallbackElement: 'header',
      title: '💡 Central de Ajuda & Alternância de Visões',
      description: 'Você pode utilizar o seletor de perfis superior a qualquer momento para visualizar a plataforma com a ótica de Aluno, Professor ou Monitor. Bom trabalho! 🎉',
      side: 'bottom',
      align: 'end',
      requiredTab: 'admin-dashboard',
    },
  ];

  const adminMobileSteps: TourStepDefinition[] = [
    {
      element: '[data-tour="btn-mobile-menu"]',
      fallbackElement: 'header',
      title: '📱 Menu de Gestão Administrativa',
      description: 'Acesse o painel do administrador, auditoria de acessos, módulo do TCC e ferramentas globais do sistema.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'admin-dashboard',
    },
    {
      element: '[data-tour="admin-metrics"]',
      fallbackElement: 'main',
      title: '📈 Métricas Consolidadas',
      description: 'Verifique contagem de usuários cadastrados, pendências e matérias oficiais pelo celular.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'admin-dashboard',
    },
    {
      element: '[data-tour="admin-analytics"]',
      fallbackElement: 'main',
      title: '📊 Telemetria & Acessos em Tempo Real',
      description: 'Verifique quantos alunos e professores estão online e audite as sessões ativas diretamente pelo smartphone.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'admin-dashboard',
    },
    {
      element: '[data-tour="btn-sincronizar"]',
      fallbackElement: 'header',
      title: '⚡ Blindagem de Egress & Sync',
      description: 'Sincronização em nuvem ultra-leve delta-sync para economizar dados móveis.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'admin-dashboard',
    },
    {
      element: '[data-tour="btn-ajuda"]',
      fallbackElement: 'header',
      title: '💡 Central de Ajuda & Configurações',
      description: 'Acesse manuais administrativos e tutoriais da plataforma.',
      side: 'bottom',
      align: 'end',
      requiredTab: 'admin-dashboard',
    },
  ];

  // =========================================================================
  // SELEÇÃO DINÂMICA DE PASSOS CONFORME O PERFIL E DISPOSITIVO
  // =========================================================================
  const tourSteps = useMemo(() => {
    switch (effectiveRole) {
      case 'professor':
        return isMobile ? professorMobileSteps : professorDesktopSteps;
      case 'monitor':
        return isMobile ? monitorMobileSteps : monitorDesktopSteps;
      case 'admin':
        return isMobile ? adminMobileSteps : adminDesktopSteps;
      case 'aluno':
      default:
        return isMobile ? alunoMobileSteps : alunoDesktopSteps;
    }
  }, [effectiveRole, isMobile]);

  const navigateToTab = (tabId: string) => {
    activeTabRef.current = tabId;
    if (onTabChange) {
      onTabChange(tabId);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lms_change_tab', { detail: tabId }));
    }
  };

  const getActiveStepIndex = (): number => {
    try {
      const saved = localStorage.getItem(stepIndexKey);
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  };

  const setStepIndex = (idx: number) => {
    try {
      localStorage.setItem(stepIndexKey, String(idx));
    } catch (e) {}
  };

  const setTourActive = (active: boolean) => {
    try {
      localStorage.setItem(activeTourKey, active ? 'true' : 'false');
      if (!active) {
        localStorage.setItem(stepIndexKey, '0');
      }
    } catch (e) {}
  };

  const isTourActive = (): boolean => {
    try {
      return localStorage.getItem(activeTourKey) === 'true';
    } catch (e) {
      return false;
    }
  };

  const markTourCompleted = () => {
    try {
      localStorage.setItem(completedTourKey, 'true');
      setTourActive(false);
    } catch (e) {}
  };

  const isTourCompleted = (): boolean => {
    try {
      return localStorage.getItem(completedTourKey) === 'true';
    } catch (e) {
      return false;
    }
  };

  /**
   * Aguarda um elemento aparecer no DOM e rola suavemente até ele
   */
  const waitForElement = (selector: string, fallback?: string, maxWaitMs = 1800): Promise<Element | null> => {
    return new Promise((resolve) => {
      const start = Date.now();

      const check = () => {
        const el = document.querySelector(selector);
        if (el) {
          try {
            el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          } catch (e) {}
          resolve(el);
          return;
        }

        if (Date.now() - start >= maxWaitMs) {
          if (fallback) {
            const fbEl = document.querySelector(fallback);
            if (fbEl) {
              try {
                fbEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
              } catch (e) {}
              resolve(fbEl);
              return;
            }
          }
          resolve(null);
          return;
        }

        setTimeout(check, 50);
      };

      check();
    });
  };

  const runTourFromCurrentStep = async () => {
    if (typeof window === 'undefined') return;

    let currentIndex = getActiveStepIndex();
    if (currentIndex >= tourSteps.length) {
      markTourCompleted();
      return;
    }

    const currentDef = tourSteps[currentIndex];

    // Se o passo requer uma aba diferente da aba ativa, muda primeiro
    if (currentDef.requiredTab && activeTabRef.current && activeTabRef.current !== currentDef.requiredTab) {
      navigateToTab(currentDef.requiredTab);
      setTimeout(() => {
        runTourFromCurrentStep();
      }, 400);
      return;
    }

    // Aguarda o elemento estar presente no DOM
    const el = await waitForElement(currentDef.element, currentDef.fallbackElement, 1800);
    if (!el) {
      if (currentIndex + 1 < tourSteps.length) {
        setStepIndex(currentIndex + 1);
        runTourFromCurrentStep();
      } else {
        markTourCompleted();
      }
      return;
    }

    executeStep(currentIndex, el);
  };

  const executeStep = (stepIdx: number, targetElement: Element) => {
    const stepDef = tourSteps[stepIdx];
    if (!stepDef) return;

    // Destrói instância anterior se houver
    if (driverInstanceRef.current) {
      try {
        driverInstanceRef.current.destroy();
      } catch (e) {}
    }

    const isLastStep = stepIdx === tourSteps.length - 1;

    const driveStep: DriveStep = {
      element: targetElement as HTMLElement,
      popover: {
        title: stepDef.title,
        description: stepDef.description,
        side: stepDef.side || 'bottom',
        align: stepDef.align || 'center',
        progressText: `Passo ${stepIdx + 1} de ${tourSteps.length}`,
        nextBtnText: isLastStep ? 'Concluir 🎉' : 'Próximo →',
        prevBtnText: stepIdx > 0 ? '← Anterior' : undefined,
      },
    };

    const d = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(15, 23, 42, 0.82)',
      nextBtnText: isLastStep ? 'Concluir 🎉' : 'Próximo →',
      prevBtnText: '← Anterior',
      doneBtnText: 'Concluir 🎉',
      progressText: `Passo ${stepIdx + 1} de ${tourSteps.length}`,
      steps: [driveStep],
      onDestroyed: () => {
        if (!isTransitioningRef.current) {
          // Usuário fechou ou pulou o tour intencionalmente
          setTourActive(false);
          markTourCompleted();
        }
      },
      onNextClick: () => {
        isTransitioningRef.current = true;
        try {
          d.destroy();
        } catch (e) {}

        if (isLastStep) {
          markTourCompleted();
          isTransitioningRef.current = false;
          return;
        }

        const nextIdx = stepIdx + 1;
        setStepIndex(nextIdx);

        const nextDef = tourSteps[nextIdx];

        // Verifica se há transição de aba necessária
        if (stepDef.nextTabAction || (nextDef.requiredTab && nextDef.requiredTab !== activeTabRef.current)) {
          const targetTab = stepDef.nextTabAction || nextDef.requiredTab || 'aluno-disciplinas';
          navigateToTab(targetTab);
          setTimeout(() => {
            isTransitioningRef.current = false;
            runTourFromCurrentStep();
          }, 450);
        } else {
          setTimeout(() => {
            isTransitioningRef.current = false;
            runTourFromCurrentStep();
          }, 100);
        }
      },
      onPrevClick: () => {
        if (stepIdx <= 0) return;
        isTransitioningRef.current = true;
        try {
          d.destroy();
        } catch (e) {}

        const prevIdx = stepIdx - 1;
        setStepIndex(prevIdx);
        const prevDef = tourSteps[prevIdx];

        if (prevDef.requiredTab && prevDef.requiredTab !== activeTabRef.current) {
          navigateToTab(prevDef.requiredTab);
          setTimeout(() => {
            isTransitioningRef.current = false;
            runTourFromCurrentStep();
          }, 450);
        } else {
          setTimeout(() => {
            isTransitioningRef.current = false;
            runTourFromCurrentStep();
          }, 100);
        }
      },
    });

    driverInstanceRef.current = d;

    // Aguarda rolagem suave estabilizar antes de exibir o popover
    setTimeout(() => {
      try {
        d.drive();
      } catch (e) {}
    }, 120);
  };

  const startTourFromBeginning = (targetRole?: UserRole) => {
    const role = targetRole || effectiveRole;
    const initialTab = role === 'professor' 
      ? 'prof-disciplinas' 
      : role === 'monitor' 
      ? 'monitor-escala' 
      : role === 'admin' 
      ? 'admin-dashboard' 
      : 'aluno-disciplinas';

    setStepIndex(0);
    setTourActive(true);
    isTransitioningRef.current = true;
    navigateToTab(initialTab);
    setTimeout(() => {
      isTransitioningRef.current = false;
      runTourFromCurrentStep();
    }, 400);
  };

  // Inicialização no Primeiro Acesso do usuário para o perfil ativo
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Se já foi concluído para este perfil, NÃO roda automaticamente
    if (isTourCompleted()) return;

    const timer = setTimeout(() => {
      if (!isTourCompleted() && !isTourActive()) {
        startTourFromBeginning(effectiveRole);
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [normalizedEmail, effectiveRole]);

  // Listeners para disparo manual do Onboarding via Central de Ajuda ou Mobile Drawer
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStartTour = (e?: Event) => {
      const customDetail = (e as CustomEvent)?.detail;
      const requestedRole = customDetail?.role || effectiveRole;
      startTourFromBeginning(requestedRole);
    };

    window.addEventListener('koinonia_start_tour', handleStartTour);
    window.addEventListener('lms_start_tutorial', handleStartTour);

    return () => {
      window.removeEventListener('koinonia_start_tour', handleStartTour);
      window.removeEventListener('lms_start_tutorial', handleStartTour);
      if (driverInstanceRef.current) {
        try {
          driverInstanceRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [normalizedEmail, effectiveRole, isMobile]);

  return null;
}
