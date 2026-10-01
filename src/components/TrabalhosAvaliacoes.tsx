'use client';

import React from 'react';
import { ChecklistAV2Page } from './ChecklistAV2Page';
import { 
  AVALIACOES_2026_2, 
  defaultSemesterTasks,
  CRONOGRAMA_OFICIAL_2026_2 
} from '@/data/avaliacoes2026_2';
import type { 
  AvaliacaoEvento, 
  KanbanTask, 
  CronogramaConsolidadoItem 
} from '@/data/avaliacoes2026_2';

export interface TrabalhosAvaliacoesProps {
  userEmail?: string;
  onBack?: () => void;
}

/**
 * Componente TrabalhosAvaliacoes (Koinonia LMS 2026.2)
 * 
 * Centraliza a gestão visual de trabalhos, prazos, critérios e checklists do semestre.
 * Consome obrigatoriamente a Fonte Única de Verdade (SSOT) em `@/data/avaliacoes2026_2`.
 */
export const TrabalhosAvaliacoes: React.FC<TrabalhosAvaliacoesProps> = ({ userEmail, onBack }) => {
  return (
    <div className="w-full">
      <ChecklistAV2Page userEmail={userEmail} />
    </div>
  );
};

export default TrabalhosAvaliacoes;
export { AVALIACOES_2026_2, defaultSemesterTasks, CRONOGRAMA_OFICIAL_2026_2 };
export type { AvaliacaoEvento, KanbanTask, CronogramaConsolidadoItem };
