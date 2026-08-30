'use client';

import { useEffect, useRef } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

interface WalkthroughProps {
  userEmail?: string;
}

export function InteractiveWalkthrough({ userEmail }: WalkthroughProps) {
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Normalização do e-mail para chave única no localStorage
    const normalizedEmail = userEmail
      ? userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_')
      : 'guest';
    const storageKey = `lms_tutorial_completed_${normalizedEmail}_v1`;

    const startTour = () => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;

      // Definição dos passos oficiais do Walkthrough
      const allSteps: DriveStep[] = [
        {
          element: '[data-tour="role-selector"]',
          popover: {
            title: '👑 Seletor de Perfil / Visão',
            description: 'Alterne instantaneamente sua visão entre Aluno, Monitor, Professor ou Admin para gerenciar ou visualizar as disciplinas do LMS.',
            side: 'bottom',
            align: 'start',
          }
        },
        {
          element: '[data-tour="btn-ajuda"]',
          popover: {
            title: '💡 Central de Ajuda & Tutoriais',
            description: 'Acesse tutoriais em vídeo, manuais rápidos em PDF e reative este tour guiado a qualquer momento com um clique.',
            side: 'bottom',
            align: 'end',
          }
        },
        {
          element: '[data-tour="sidebar-nav"]',
          popover: {
            title: '📑 Menu de Navegação Global',
            description: 'Navegue de forma prática entre suas disciplinas, cronograma de aulas, biblioteca digital, fóruns e portfólio acadêmico.',
            side: 'right',
            align: 'start',
          }
        },
        {
          element: '[data-tour="aluno-gravacoes"]',
          popover: {
            title: '🎬 Aulas Gravadas Disponíveis',
            description: 'Assista às gravações em alta definição de todas as aulas ministradas, diretamente do seu computador ou celular sem travar.',
            side: 'bottom',
            align: 'center',
          }
        },
        {
          element: '[data-tour="disciplinas-grid"]',
          popover: {
            title: '📚 Grade de Disciplinas',
            description: 'Clique em qualquer matéria para abrir o Hub da Disciplina com slides, materiais de apoio, links do Google Meet e presenças.',
            side: 'top',
            align: 'center',
          }
        },
        {
          element: '[data-tour="btn-google-meet"]',
          popover: {
            title: '🔴 Sala de Aula ao Vivo',
            description: 'Acesse diretamente com apenas 1 clique a sala oficial da sua aula ao vivo no Google Meet no horário programado.',
            side: 'bottom',
            align: 'center',
          }
        },
        {
          element: '[data-tour="hub-subtabs"]',
          popover: {
            title: '📂 Conteúdo & Abas da Disciplina',
            description: 'Navegue de forma organizada entre slides, gravações anteriores, apostilas em PDF e anotações inteligentes geradas com IA.',
            side: 'bottom',
            align: 'center',
          }
        },
        {
          element: '[data-tour="btn-record-meet"]',
          popover: {
            title: '📹 Gravação de Aulas ao Vivo',
            description: 'Exclusivo para monitores e administradores. Permite gravar a transmissão do Google Meet em segundo plano com upload automático.',
            side: 'top',
            align: 'center',
          }
        }
      ];

      // Filtra apenas os passos cujos elementos estão presentes no DOM na visualização atual
      const activeSteps = allSteps.filter((step) => {
        if (typeof step.element === 'string') {
          return document.querySelector(step.element) !== null;
        }
        return true;
      });

      if (activeSteps.length === 0) {
        isRunningRef.current = false;
        return;
      }

      const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        overlayColor: 'rgba(15, 23, 42, 0.82)',
        progressText: 'Passo {{current}} de {{total}}',
        nextBtnText: 'Próximo →',
        prevBtnText: '← Anterior',
        doneBtnText: 'Concluir 🎉',
        steps: activeSteps,
        onDestroyed: () => {
          isRunningRef.current = false;
          try {
            localStorage.setItem(storageKey, 'true');
          } catch (e) {}
        }
      });

      driverObj.drive();
    };

    // Auto-start suave no primeiro acesso
    let timer: NodeJS.Timeout | null = null;
    try {
      const isCompleted = localStorage.getItem(storageKey);
      if (!isCompleted) {
        timer = setTimeout(() => {
          startTour();
        }, 1500);
      }
    } catch (e) {}

    // Listener para o evento customizado disparado a partir da Central de Ajuda
    const handleStartTutorial = (e: Event) => {
      startTour();
    };

    window.addEventListener('lms_start_tutorial', handleStartTutorial);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('lms_start_tutorial', handleStartTutorial);
    };
  }, [userEmail]);

  return null;
}

export default InteractiveWalkthrough;
