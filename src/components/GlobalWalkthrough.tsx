'use client';

import { useEffect, useRef } from 'react';
import { driver, DriveStep, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useDeviceMode } from '@/hooks/useDeviceMode';

interface GlobalWalkthroughProps {
  userEmail?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
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

export function GlobalWalkthrough({ userEmail, activeTab, onTabChange }: GlobalWalkthroughProps) {
  const { isMobile } = useDeviceMode();
  const driverInstanceRef = useRef<Driver | null>(null);
  const isTransitioningRef = useRef(false);

  // Normalização do e-mail para chave única no localStorage
  const normalizedEmail = (userEmail || 'aluno')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '_');

  const activeTourKey = `koinonia_tour_active_${normalizedEmail}`;
  const stepIndexKey = `koinonia_tour_step_index_${normalizedEmail}`;
  const completedTourKey = `koinonia_tour_completed_${normalizedEmail}`;

  // ── PASSOS ABRANGENTES PARA COMPUTADOR (DESKTOP) ──
  const desktopSteps: TourStepDefinition[] = [
    {
      element: '[data-tour="role-selector"]',
      fallbackElement: 'header',
      title: '👑 Seletor de Perfis e Visões (RBAC)',
      description: 'Alterne instantaneamente entre as visões de Aluno, Monitor, Professor e Administrador para acessar seus painéis de controle e permissões acadêmicas dedicadas.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="dark-mode-toggle"]',
      fallbackElement: 'header',
      title: '🌓 Modo Escuro Nativo (Dark Mode)',
      description: 'Conforto visual absoluto para suas leituras noturnas! Alterne entre tema claro e escuro a qualquer momento com apenas 1 clique.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="btn-atualizacoes"]',
      fallbackElement: 'header',
      title: '🔔 Central de Novidades & Avisos',
      description: 'Fique sempre informado sobre novos recursos, atualizações de sistema e comunicados oficiais da coordenação pedagógica do Seminário.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="btn-sincronizar"]',
      fallbackElement: 'header',
      title: '⚡ Sincronização em Nuvem (Zero-Egress)',
      description: 'Suas notas, presenças e progresso ficam salvos localmente e são sincronizados com a Nuvem Supabase de forma instantânea e econômica.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="live-banner"]',
      fallbackElement: 'main',
      title: '🔴 Aulas Ao Vivo & Google Meet',
      description: 'Em dias de aula síncrona, a sala oficial do Meet abre com 15 minutos de antecedência e a Lista de Presença é liberada automaticamente no horário.',
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
      title: '🏛️ Metaverso Teológico & Exploração 3D',
      description: 'Navegue tridimensionalmente por reconstituições históricas sagradas como o Tabernáculo e o Templo de Salomão, com hotspots arqueológicos exegéticos.',
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
      element: '[data-tour="biblioteca-grid"]',
      fallbackElement: 'main',
      title: '📖 Leitura em PDF Embutida & Citações',
      description: 'Abra os livros e apostilas diretamente na tela com zoom, modo noturno e cópia de referências bibliográficas com 1 clique!',
      side: 'top',
      align: 'center',
      requiredTab: 'aluno-biblioteca',
      nextTabAction: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="btn-ajuda"]',
      fallbackElement: 'header',
      title: '💡 Central de Ajuda & Tutoriais em Vídeo',
      description: 'Precisa de orientação? Acesse tutoriais curtos em vídeo ensinando cada recurso da plataforma ou reinicie este tour quando quiser. Bons estudos e excelente semestre acadêmico! 🎉',
      side: 'bottom',
      align: 'end',
      requiredTab: 'aluno-disciplinas',
    },
  ];

  // ── PASSOS ABRANGENTES PARA DISPOSITIVOS MÓVEIS (SMARTPHONES E TABLETS) ──
  const mobileSteps: TourStepDefinition[] = [
    {
      element: '[data-tour="btn-mobile-menu"]',
      fallbackElement: 'header',
      title: '📱 Menu Lateral Completo',
      description: 'Toque neste botão a qualquer momento para abrir todas as 16 ferramentas, matérias, laboratórios práticos e alternar perfis acadêmicos.',
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
      fallbackElement: 'main',
      title: '🔴 Aula Ao Vivo & Frequência',
      description: 'Acesse o Google Meet direto pelo smartphone e assine a lista de presença com 1 toque durante a transmissão.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="dashboard-mural"]',
      fallbackElement: 'main',
      title: '📖 Mural de Leituras e Avisos',
      description: 'Fique em dia com as leituras pré-aula indicadas pelos professores e envie links úteis para o WhatsApp.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="aluno-gravacoes"]',
      fallbackElement: 'main',
      title: '🎬 Gravações das Aulas em HD',
      description: 'Assista a todas as aulas ministradas no seu celular com player integrado em tela cheia e controle de velocidade.',
      side: 'top',
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
      element: '[data-tour="card-fluxo-estudos"]',
      fallbackElement: 'main',
      title: '🧭 Fluxo de Estudos & Pastas Virtuais',
      description: 'Acesse os links da Google Agenda, pastas do Drive 01 a 11 e os cadernos inteligentes do NotebookLM.',
      side: 'top',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="card-homiletica"]',
      fallbackElement: 'main',
      title: '🎙️ Estúdio de Pregação & RPG Pastoral',
      description: 'Grave seus sermões, treine aconselhamento e explore o simulador de casos pastorais com metodologias ativas.',
      side: 'top',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="nav-biblioteca"]',
      fallbackElement: '.fixed.bottom-0',
      title: '🏛️ Biblioteca Digital (3.000+ Livros)',
      description: 'Toque para abrir o acervo com mais de 3.000 obras teológicas e leitor de PDF embutido otimizado para celulares.',
      side: 'top',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
      nextTabAction: 'aluno-biblioteca',
    },
    {
      element: '[data-tour="biblioteca-search"]',
      fallbackElement: 'main',
      title: '🔍 Busca Rápida no Smartphone',
      description: 'Pesquise livros por autor ou matéria recomendada e abra os textos sem depender de aplicativos externos.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'aluno-biblioteca',
      nextTabAction: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="btn-ajuda"]',
      fallbackElement: 'header',
      title: '💡 Central de Ajuda & Tutoriais',
      description: 'Assista a vídeos rápidos de demonstração ou reinicie este tour quando quiser. Tenha um excelente aprendizado no Koinonia LMS! 🎉',
      side: 'bottom',
      align: 'end',
      requiredTab: 'aluno-disciplinas',
    },
  ];

  const tourSteps = isMobile ? mobileSteps : desktopSteps;

  const navigateToTab = (tabId: string) => {
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
   * Aguarda um elemento aparecer no DOM antes de executar o passo
   */
  const waitForElement = (selector: string, fallback?: string, maxWaitMs = 1800): Promise<Element | null> => {
    return new Promise((resolve) => {
      const start = Date.now();

      const check = () => {
        const el = document.querySelector(selector);
        if (el) {
          resolve(el);
          return;
        }

        if (Date.now() - start >= maxWaitMs) {
          if (fallback) {
            const fbEl = document.querySelector(fallback);
            if (fbEl) {
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

    // Se o passo requer uma aba diferente e estamos em transição controlada
    if (currentDef.requiredTab && activeTab && activeTab !== currentDef.requiredTab && isTransitioningRef.current) {
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
      overlayColor: 'rgba(15, 23, 42, 0.85)',
      nextBtnText: isLastStep ? 'Concluir 🎉' : 'Próximo →',
      prevBtnText: '← Anterior',
      doneBtnText: 'Concluir 🎉',
      progressText: `Passo ${stepIdx + 1} de ${tourSteps.length}`,
      steps: [driveStep],
      onDestroyed: () => {
        if (!isTransitioningRef.current) {
          // Usuário fechou ou pulou o tour intencionalmente: finaliza permanentemente
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
        if (stepDef.nextTabAction || (nextDef.requiredTab && nextDef.requiredTab !== activeTab)) {
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

        if (prevDef.requiredTab && prevDef.requiredTab !== activeTab) {
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
    d.drive();
  };

  const startTourFromBeginning = () => {
    setStepIndex(0);
    setTourActive(true);
    isTransitioningRef.current = true;
    navigateToTab('aluno-disciplinas');
    setTimeout(() => {
      isTransitioningRef.current = false;
      runTourFromCurrentStep();
    }, 400);
  };

  // Inicialização no Primeiro Acesso (se nunca tiver completado)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Se já foi concluído, NÃO roda automaticamente
    if (isTourCompleted()) return;

    // Se é o primeiro acesso, aguarda a interface carregar e inicia o tour
    const timer = setTimeout(() => {
      if (!isTourCompleted() && !isTourActive()) {
        startTourFromBeginning();
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [normalizedEmail]);

  // Listeners para disparo manual do Onboarding via Central de Ajuda
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStartTour = () => {
      startTourFromBeginning();
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
  }, [normalizedEmail, isMobile]);

  return null;
}
