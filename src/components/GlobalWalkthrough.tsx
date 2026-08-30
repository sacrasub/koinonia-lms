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

  // Passos para Computador (Desktop)
  const desktopSteps: TourStepDefinition[] = [
    {
      element: '[data-tour="role-selector"]',
      fallbackElement: 'header',
      title: '👑 Seletor de Perfil / Visão',
      description: 'Alterne instantaneamente sua visão entre Aluno, Monitor, Professor ou Admin para acessar painéis e permissões dedicadas.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="dashboard-mural"]',
      fallbackElement: 'main',
      title: '📖 Mural de Recursos & Avisos',
      description: 'Acesse comunicados acadêmicos, leituras pré-aula e links úteis compartilhados pelos seus professores e monitores.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="aluno-gravacoes"]',
      fallbackElement: 'main',
      title: '🎬 Aulas Gravadas em HD',
      description: 'Assista às gravações oficiais de todas as 15 aulas transmitidas, organizadas por matéria com player rápido e seguro.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="disciplinas-grid"]',
      fallbackElement: 'main',
      title: '📚 Grade Curricular da Semana',
      description: 'Navegue pelo cronograma de matérias ativas, acompanhe as datas de cada aula e acesse seu Caderno de Estudos pessoal.',
      side: 'top',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="nav-biblioteca"]',
      fallbackElement: 'aside',
      title: '🏛️ Biblioteca Digital Teológica',
      description: 'Vamos agora conhecer o acervo com mais de 3.000 obras teológicas, comentários bíblicos e materiais didáticos.',
      side: 'right',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
      nextTabAction: 'aluno-biblioteca',
    },
    {
      element: '[data-tour="biblioteca-search"]',
      fallbackElement: 'main',
      title: '🔍 Busca Rápida no Acervo',
      description: 'Pesquise obras instantaneamente por título, autor, assunto ou pelas matérias com leitura recomendada no semestre.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'aluno-biblioteca',
    },
    {
      element: '[data-tour="biblioteca-grid"]',
      fallbackElement: 'main',
      title: '📖 Leitura Online e Citações ABNT',
      description: 'Abra os livros e apostilas em PDF em alta resolução, copie referências bibliográficas no padrão ABNT e estude com praticidade.',
      side: 'top',
      align: 'center',
      requiredTab: 'aluno-biblioteca',
      nextTabAction: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="btn-ajuda"]',
      fallbackElement: 'header',
      title: '💡 Central de Ajuda & Tutoriais',
      description: 'Precisa de suporte? Acesse vídeos curtos ensinando cada função do LMS ou reative este tour a qualquer momento. Bons estudos! 🎉',
      side: 'bottom',
      align: 'end',
      requiredTab: 'aluno-disciplinas',
    },
  ];

  // Passos para Smartphones e Tablets (Mobile-friendly)
  const mobileSteps: TourStepDefinition[] = [
    {
      element: '[data-tour="btn-mobile-menu"]',
      fallbackElement: 'header',
      title: '📱 Menu Lateral Completo',
      description: 'Toque neste botão a qualquer momento para abrir o menu com todas as 16 ferramentas, matérias e alternar sua visão acadêmica.',
      side: 'bottom',
      align: 'start',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="dashboard-mural"]',
      fallbackElement: 'main',
      title: '📖 Mural & Comunicados',
      description: 'Acompanhe as leituras pré-aula e comunicados acadêmicos da coordenação e dos seus professores.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="aluno-gravacoes"]',
      fallbackElement: 'main',
      title: '🎬 Aulas Gravadas em HD',
      description: 'Assista às 15 gravações oficiais das aulas transmitidas direto pelo celular, com player em tela cheia.',
      side: 'top',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="nav-biblioteca"]',
      fallbackElement: '.fixed.bottom-0',
      title: '🏛️ Biblioteca Digital Teológica',
      description: 'Toque para acessar o acervo com mais de 3.000 livros teológicos e apostilas em PDF.',
      side: 'top',
      align: 'center',
      requiredTab: 'aluno-disciplinas',
      nextTabAction: 'aluno-biblioteca',
    },
    {
      element: '[data-tour="biblioteca-search"]',
      fallbackElement: 'main',
      title: '🔍 Busca no Acervo',
      description: 'Pesquise obras rapidamente por título ou autor direto do seu smartphone.',
      side: 'bottom',
      align: 'center',
      requiredTab: 'aluno-biblioteca',
      nextTabAction: 'aluno-disciplinas',
    },
    {
      element: '[data-tour="btn-ajuda"]',
      fallbackElement: 'header',
      title: '💡 Central de Ajuda & Tutoriais',
      description: 'Assista aos vídeos explicativos de cada recurso ou reinicie este tour quando quiser. Ótimos estudos! 🎉',
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

  /**
   * Aguarda um elemento aparecer no DOM antes de executar o passo
   */
  const waitForElement = (selector: string, fallback?: string, maxWaitMs = 2000): Promise<Element | null> => {
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

        setTimeout(check, 60);
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

    // Se o passo requer uma aba diferente da que está aberta, transiciona primeiro
    if (currentDef.requiredTab && activeTab && activeTab !== currentDef.requiredTab) {
      navigateToTab(currentDef.requiredTab);
      setTimeout(() => {
        runTourFromCurrentStep();
      }, 400);
      return;
    }

    // Aguarda o elemento estar presente no DOM
    const el = await waitForElement(currentDef.element, currentDef.fallbackElement, 2200);
    if (!el) {
      // Se não encontrou o elemento nem o fallback, tenta avançar para o próximo passo sem quebrar
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
          // Usuário fechou o tour intencionalmente
          setTourActive(false);
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

        // Verifica se há transição de aba
        if (stepDef.nextTabAction || (nextDef.requiredTab && nextDef.requiredTab !== activeTab)) {
          const targetTab = stepDef.nextTabAction || nextDef.requiredTab || 'aluno-disciplinas';
          navigateToTab(targetTab);
          setTimeout(() => {
            isTransitioningRef.current = false;
            runTourFromCurrentStep();
          }, 500);
        } else {
          setTimeout(() => {
            isTransitioningRef.current = false;
            runTourFromCurrentStep();
          }, 150);
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
          }, 500);
        } else {
          setTimeout(() => {
            isTransitioningRef.current = false;
            runTourFromCurrentStep();
          }, 150);
        }
      },
    });

    driverInstanceRef.current = d;
    d.drive();
  };

  const startTourFromBeginning = () => {
    setStepIndex(0);
    setTourActive(true);
    navigateToTab('aluno-disciplinas');
    setTimeout(() => {
      runTourFromCurrentStep();
    }, 450);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Se houver tour ativo em andamento (ex: após transição de tela durante o tour)
    if (isTourActive()) {
      const timer = setTimeout(() => {
        runTourFromCurrentStep();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [activeTab, normalizedEmail, isMobile]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Listeners para disparo manual do Onboarding
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
