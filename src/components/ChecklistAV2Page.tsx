'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, PenTool, AlertCircle, Zap, CheckCircle2, Clock, 
  Sparkles, Plus, Trash2, BookOpen, User, Calendar, Filter, X, RotateCcw,
  MessageCircle, Share2, Copy, Check, ExternalLink, ArrowRight, Flame,
  Archive, GripVertical, FolderOpen, Video, Layers, Mail
} from 'lucide-react';
import { 
  CalendarioAcademico,
  AVALIACOES_2026_2,
  AvaliacaoEvento,
  DrawerAvaliacao,
  PopupResumoAvaliacao,
  KanbanTask,
  defaultSemesterTasks
} from './CalendarioAcademico';
import { resolvePassoAcaoHref } from '@/data/avaliacoes2026_2';
import type { KanbanStatus, PassoAcao } from '@/data/avaliacoes2026_2';
import { subscribeToStudentSync, saveChecklistTasks, isLegacyChecklistTasks, mirrorChecklistTasksToLegacyKeys } from '@/services/studentSyncService';

export type { KanbanTask, KanbanStatus };
export { defaultSemesterTasks };

interface ChecklistAV2PageProps {
  userEmail?: string;
}

export const ChecklistAV2Page: React.FC<ChecklistAV2PageProps> = ({ userEmail }) => {
  const normalizedEmail = (userEmail || 'default_student').toLowerCase().trim();

  const [tasks, setTasks] = useState<KanbanTask[]>(defaultSemesterTasks);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'kanban' | 'calendario'>('kanban');
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanStatus | null>(null);

  // Estados para os Modais Compartilhados com o Calendário Acadêmico (Dual-View)
  const [drawerEvento, setDrawerEvento] = useState<AvaliacaoEvento | null>(null);
  const [popupEvento, setPopupEvento] = useState<AvaliacaoEvento | null>(null);
  const [checklistMap, setChecklistMap] = useState<Record<string, Record<number, boolean>>>({});

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

  const resolveTaskStatus = (
    subtasks: { id: string; text: string; done: boolean }[],
    currentStatus: KanbanStatus,
    manualStatus?: KanbanStatus
  ): KanbanStatus => {
    if (manualStatus) return manualStatus;
    if (currentStatus === 'archived') return 'archived';
    const doneCount = subtasks.filter((st) => st.done).length;
    if (doneCount === subtasks.length && subtasks.length > 0) {
      return currentStatus === 'doing' ? 'doing' : 'done';
    }
    if (doneCount > 0 || currentStatus === 'doing') {
      return 'doing';
    }
    return 'todo';
  };

  // Garante que todas as avaliações oficiais da grade estejam no Kanban com metadados atualizados
  const ensureAllOfficialAssessments = (taskList: KanbanTask[]): KanbanTask[] => {
    const officialTaskMap = new Map(
      defaultSemesterTasks.map((dt) => [dt.assessmentId || dt.id, dt])
    );

    // Atualiza metadados oficiais (título, prazo, estratégia e itens já encerrados/arquivados) preservando marcações manuais do aluno
    const result: KanbanTask[] = taskList.map((task) => {
      const key = task.assessmentId || task.id;
      const official = officialTaskMap.get(key);
      if (!official) return task;

      if (official.status === 'archived' && !task.manualStatus) {
        return {
          ...task,
          assessmentId: official.assessmentId,
          title: official.title,
          subject: official.subject,
          professor: official.professor,
          dueDate: official.dueDate,
          type: official.type,
          strategyNote: official.strategyNote,
          status: 'archived',
          subtasks: official.subtasks.map((st) => ({ ...st, done: true })),
        };
      }

      if (official.status === 'done' && !task.manualStatus && task.status !== 'archived') {
        return {
          ...task,
          assessmentId: official.assessmentId,
          title: official.title,
          subject: official.subject,
          professor: official.professor,
          dueDate: official.dueDate,
          type: official.type,
          strategyNote: official.strategyNote,
          status: 'done',
          subtasks: official.subtasks.map((st) => ({ ...st, done: true })),
        };
      }

      const existingDoneByText = new Map(task.subtasks.map((st) => [st.id, st.done]));
      const mergedSubtasks = official.subtasks.map((st, idx) => ({
        ...st,
        done: existingDoneByText.get(st.id) ?? task.subtasks[idx]?.done ?? st.done,
      }));
      const nextStatus = resolveTaskStatus(mergedSubtasks, task.status, task.manualStatus);

      return {
        ...task,
        assessmentId: official.assessmentId,
        title: official.title,
        subject: official.subject,
        professor: official.professor,
        dueDate: official.dueDate,
        type: official.type,
        strategyNote: official.strategyNote,
        subtasks: mergedSubtasks,
        status: nextStatus,
        manualStatus: task.manualStatus,
      };
    });

    AVALIACOES_2026_2.forEach((ev) => {
      const exists = result.some((t) => t.assessmentId === ev.id || t.id === ev.id);
      if (!exists) {
        const official = officialTaskMap.get(ev.id);
        if (official) {
          result.push(official);
        } else {
          result.push({
            id: ev.id,
            assessmentId: ev.id,
            title: ev.tipo,
            subject: ev.disciplina,
            professor: ev.professor,
            dueDate: ev.dataLimite,
            priority: 'Máxima',
            type: ev.tipoBadge === 'PROVA' ? 'Prova Objetiva' : ev.tipoBadge === 'TRABALHO' ? 'Trabalho Escrito' : ev.tipoBadge === 'SEMINÁRIO' ? 'Seminário em Grupo' : ev.tipoBadge === 'RESUMO' ? 'Resumo Crítico' : ev.tipoBadge === 'ARTIGO' ? 'TCC' : 'Atividade Modular',
            status: 'todo',
            strategyNote: `${ev.dataTexto} • ${ev.horario}. ${ev.peso}`,
            subtasks: ev.passoAPasso.map((p, idx) => ({ id: `st-${ev.id}-${idx}`, text: p, done: false })),
          });
        }
      }
    });
    return result;
  };

  // Normaliza avaliações oficiais preservando o estado recebido da nuvem e espelha nas chaves de etapas locais
  const normalizeOfficialTasksAndMirror = (taskList: KanbanTask[]): KanbanTask[] => {
    const withOfficials = ensureAllOfficialAssessments(taskList);
    if (typeof window !== 'undefined') {
      mirrorChecklistTasksToLegacyKeys(normalizedEmail, withOfficials);
    }
    return withOfficials;
  };

  // Usado apenas quando a nuvem ainda não possui lista moderna com assessmentId (migração inicial)
  const mergeLegacyLocalChecklistsOnce = (taskList: KanbanTask[]): KanbanTask[] => {
    if (typeof window === 'undefined') return taskList;
    const withOfficials = ensureAllOfficialAssessments(taskList);
    const merged = withOfficials.map((task) => {
      const assessmentId = task.assessmentId || (task.id.startsWith('aval-') ? task.id : undefined);
      if (!assessmentId) return task;
      const storageKey = `koinonia_checklist_${normalizedEmail}_${assessmentId}`;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const checks: Record<number, boolean> = JSON.parse(raw);
          const updatedSubtasks = task.subtasks.map((st, idx) => ({
            ...st,
            done: checks[idx] !== undefined ? !!checks[idx] : st.done,
          }));
          const status = resolveTaskStatus(updatedSubtasks, task.status, task.manualStatus);
          return { ...task, assessmentId, subtasks: updatedSubtasks, status, manualStatus: task.manualStatus };
        }
      } catch (_) {}
      return { ...task, assessmentId };
    });
    mirrorChecklistTasksToLegacyKeys(normalizedEmail, merged);
    return merged;
  };

  const generateWhatsAppAssessmentsText = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://koinonialms.vercel.app';
    const checklistUrl = `${origin}/?tab=checklist`;

    // Ordena cronologicamente por prazo, enviando apenas avaliações ativas (AV2 & TCC I)
    const sorted = tasks
      .filter((t) => t.status !== 'archived')
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

    let text = `📚 *SEMINÁRIO KOINONIA - CRONOGRAMA AV2 & TCC I (2026.2)*\n\n` +
      `Olá, irmãos e colegas de turma! Segue o cronograma ativo da AV2 e TCC I para este semestre:\n\n` +
      `🗓️ *CRONOGRAMA ATIVO DE PROVAS E ENTREGAS:*\n\n`;

    sorted.forEach((task, index) => {
      let formattedDate = 'A definir';
      if (task.dueDate) {
        const parts = task.dueDate.split('-');
        if (parts.length === 3) {
          formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      }
      const statusIcon =
        task.status === 'done'
          ? '✅'
          : task.status === 'doing'
          ? '⏳'
          : task.status === 'archived'
          ? '📦'
          : '📌';

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
        if (isLegacyChecklistTasks(data.checklistTasks)) {
          // Atualiza para a lista oficial vinculada às avaliações 2026.2, mantendo tarefas personalizadas do aluno
          const customTasks = data.checklistTasks.filter((t: any) => !String(t.id || '').startsWith('LMS-'));
          const upgraded = [...defaultSemesterTasks, ...customTasks];
          const synced = mergeLegacyLocalChecklistsOnce(upgraded);
          setTasks(synced);
          saveChecklistTasks(normalizedEmail, synced);
        } else {
          const normalized = normalizeOfficialTasksAndMirror(data.checklistTasks);
          setTasks((prev) =>
            JSON.stringify(prev) === JSON.stringify(normalized) ? prev : normalized
          );
          if (normalized.length !== data.checklistTasks.length) {
            saveChecklistTasks(normalizedEmail, normalized);
          }
        }
      } else {
        // Se a nuvem não tiver tarefas gravadas para este aluno, inicializa com o padrão oficial e grava na nuvem
        const synced = mergeLegacyLocalChecklistsOnce(defaultSemesterTasks);
        setTasks(synced);
        saveChecklistTasks(normalizedEmail, synced);
      }
    });

    return () => unsubscribe();
  }, [normalizedEmail]);

  // Carrega checklistMap para sincronização com os modais
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initialChecklists: Record<string, Record<number, boolean>> = {};
    tasks.forEach((t) => {
      const key = t.assessmentId || t.id;
      const storageKey = `koinonia_checklist_${normalizedEmail}_${key}`;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) initialChecklists[key] = JSON.parse(raw);
      } catch (_) {}
    });
    setChecklistMap(initialChecklists);
  }, [normalizedEmail, tasks]);

  // Listener para sincronização bidirecional em tempo real com o CalendarioAcademico
  useEffect(() => {
    const handleAssessmentSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail || customEvent.detail.source === 'kanban') return;
      const { assessmentId } = customEvent.detail;
      if (!assessmentId) return;

      const storageKey = `koinonia_checklist_${normalizedEmail}_${assessmentId}`;
      let checks: Record<number, boolean> = {};
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) checks = JSON.parse(raw);
      } catch (_) {}

      setChecklistMap((prev) => ({
        ...prev,
        [assessmentId]: checks,
      }));

      setTasks((prev) => {
        return prev.map((t) => {
          if (t.assessmentId === assessmentId || t.id === assessmentId) {
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
            return { ...t, subtasks: updatedSubtasks, status, manualStatus: undefined };
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

  // Alternar etapa do passo a passo a partir do Drawer aberto no Kanban
  const handleToggleStepFromDrawer = (eventoId: string, stepIdx: number) => {
    const storageKey = `koinonia_checklist_${normalizedEmail}_${eventoId}`;
    let currentEvChecks: Record<number, boolean> = {};
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) currentEvChecks = JSON.parse(raw);
    } catch (_) {}

    const newDone = !currentEvChecks[stepIdx];
    currentEvChecks[stepIdx] = newDone;

    setChecklistMap((prev) => ({
      ...prev,
      [eventoId]: currentEvChecks,
    }));

    try {
      localStorage.setItem(storageKey, JSON.stringify(currentEvChecks));
    } catch (_) {}

    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.assessmentId === eventoId || t.id === eventoId) {
          const updatedSubtasks = t.subtasks.map((st, idx) =>
            idx === stepIdx ? { ...st, done: newDone } : st
          );
          const doneCount = updatedSubtasks.filter((st) => st.done).length;
          const status: 'todo' | 'doing' | 'done' =
            doneCount === updatedSubtasks.length && updatedSubtasks.length > 0
              ? 'done'
              : doneCount > 0
              ? 'doing'
              : 'todo';
          return { ...t, subtasks: updatedSubtasks, status, manualStatus: undefined };
        }
        return t;
      });
      localStorage.setItem(`lms_checklist_${normalizedEmail}`, JSON.stringify(updated));
      saveChecklistTasks(normalizedEmail, updated);
      return updated;
    });

    window.dispatchEvent(
      new CustomEvent('koinonia_assessment_progress_updated', {
        detail: {
          source: 'kanban',
          assessmentId: eventoId,
          stepIdx,
          done: newDone,
          allSteps: currentEvChecks,
        },
      })
    );
  };

  // Concluir toda a avaliação a partir do Drawer aberto no Kanban
  const handleCompleteAssessmentFromDrawer = (evento: AvaliacaoEvento) => {
    const allChecks: Record<number, boolean> = {};
    evento.passoAPasso.forEach((_, idx) => {
      allChecks[idx] = true;
    });

    setChecklistMap((prev) => ({
      ...prev,
      [evento.id]: allChecks,
    }));

    const storageKey = `koinonia_checklist_${normalizedEmail}_${evento.id}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(allChecks));
    } catch (_) {}

    setTasks((prev) => {
      let found = false;
      const updated = prev.map((t) => {
        if (t.assessmentId === evento.id || t.id === evento.id) {
          found = true;
          const updatedSubtasks = t.subtasks.map((st) => ({ ...st, done: true }));
          return { ...t, status: 'done' as const, manualStatus: undefined, subtasks: updatedSubtasks };
        }
        return t;
      });

      if (!found) {
        updated.push({
          id: evento.id,
          assessmentId: evento.id,
          title: evento.tipo,
          subject: evento.disciplina,
          professor: evento.professor,
          dueDate: evento.dataLimite,
          priority: 'Máxima',
          type: evento.tipoBadge === 'PROVA' ? 'Prova Objetiva' : evento.tipoBadge === 'TRABALHO' ? 'Trabalho Escrito' : evento.tipoBadge === 'SEMINÁRIO' ? 'Seminário em Grupo' : evento.tipoBadge === 'RESUMO' ? 'Resumo Crítico' : evento.tipoBadge === 'ARTIGO' ? 'TCC' : 'Atividade Modular',
          status: 'done',
          strategyNote: `${evento.dataTexto} • ${evento.horario}. ${evento.peso}`,
          subtasks: evento.passoAPasso.map((p, idx) => ({ id: `st-${evento.id}-${idx}`, text: p, done: true })),
        });
      }

      localStorage.setItem(`lms_checklist_${normalizedEmail}`, JSON.stringify(updated));
      saveChecklistTasks(normalizedEmail, updated);
      return updated;
    });

    window.dispatchEvent(
      new CustomEvent('koinonia_assessment_progress_updated', {
        detail: {
          source: 'kanban',
          assessmentId: evento.id,
          status: 'done',
          allSteps: allChecks,
        },
      })
    );

    setDrawerEvento(null);
    showNotification(`✓ Avaliação "${evento.tipo}" concluída com êxito!`);
  };

  // Obtém ou constrói o AvaliacaoEvento correspondente a uma KanbanTask
  const getEventoForTask = (task: KanbanTask): AvaliacaoEvento => {
    const found = AVALIACOES_2026_2.find((ev) => ev.id === task.assessmentId || ev.id === task.id);
    if (found) return found;

    const badge: 'PROVA' | 'TRABALHO' | 'SEMINÁRIO' | 'RESUMO' | 'ATIVIDADE' | 'ARTIGO' =
      task.type?.includes('Prova') ? 'PROVA'
      : task.type?.includes('Seminário') ? 'SEMINÁRIO'
      : task.type?.includes('Resumo') ? 'RESUMO'
      : task.type?.includes('TCC') ? 'ARTIGO'
      : task.type?.includes('Atividade') ? 'ATIVIDADE'
      : 'TRABALHO';

    return {
      id: task.id,
      disciplina: task.subject,
      disciplinaShort: task.subject.length > 25 ? task.subject.slice(0, 22) + '...' : task.subject,
      professor: task.professor,
      tipo: task.title,
      tipoBadge: badge,
      dataLimite: task.dueDate,
      dataTexto: task.dueDate,
      horario: 'Consulte orientações da disciplina',
      peso: task.priority === 'Máxima' ? 'Prioridade Máxima' : 'Prioridade Normal',
      regras: task.strategyNote ? [task.strategyNote] : ['Seguir orientações docentes.'],
      passoAPasso: task.subtasks.length > 0 ? task.subtasks.map((st) => st.text) : ['Planejamento', 'Execução', 'Revisão', 'Entrega'],
      bibliografia: {},
      canalEnvio: { tipo: 'plataforma' },
      cor: {
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-300',
        border: 'border-indigo-500/30',
        pillBg: 'bg-indigo-600 hover:bg-indigo-500 text-white',
        dot: 'bg-indigo-400',
        badgeBg: 'bg-indigo-500/20',
        badgeText: 'text-indigo-300'
      }
    };
  };

  const saveTasks = (newTasks: KanbanTask[]) => {
    setTasks(newTasks);
    saveChecklistTasks(normalizedEmail, newTasks);
  };

  const handleResetToOfficialSemester = () => {
    if (confirm('Deseja sincronizar e restaurar a lista oficial de 16 marcos acadêmicos e avaliações do semestre 2026.2? Suas tarefas personalizadas serão preservadas.')) {
      // Mescla tarefas personalizadas com a lista oficial
      const customTasks = tasks.filter((t) => !defaultSemesterTasks.some((dt) => dt.id === t.id));
      const merged = [...defaultSemesterTasks, ...customTasks];
      const synced = normalizeOfficialTasksAndMirror(merged);
      saveTasks(synced);
      showNotification('✓ Lista oficial do semestre 2026.2 sincronizada com a Nuvem e o Calendário!');
    }
  };

  const handleStatusChange = (taskId: string, newStatus: KanbanStatus) => {
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

        return { ...t, status: newStatus, manualStatus: newStatus, subtasks: updatedSubtasks };
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
    const colLabels: Record<KanbanStatus, string> = {
      todo: 'A Fazer (Pendentes)',
      doing: 'Em Andamento (Produção)',
      done: 'Concluídos com Êxito',
      archived: 'Arquivados',
    };
    showNotification(`✓ Card movido para "${colLabels[newStatus]}"!`);
  };

  const handleCardDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(taskId);
  };

  const handleCardDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverColumn(null);
  };

  const handleColumnDragOver = (e: React.DragEvent<HTMLDivElement>, status: KanbanStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleColumnDragLeave = (e: React.DragEvent<HTMLDivElement>, status: KanbanStatus) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (dragOverColumn === status) {
        setDragOverColumn(null);
      }
    }
  };

  const handleColumnDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: KanbanStatus) => {
    e.preventDefault();
    const droppedId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    setDraggingTaskId(null);
    setDragOverColumn(null);
    if (!droppedId) return;
    const targetTask = tasks.find((t) => t.id === droppedId);
    if (targetTask && targetTask.status !== targetStatus) {
      handleStatusChange(droppedId, targetStatus);
    }
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

        return { ...t, subtasks: updatedSubtasks, status: newStatus, manualStatus: undefined };
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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('koinonia_assessment_progress_updated', {
          detail: {
            source: 'kanban',
            taskId: newTask.id,
          },
        })
      );
    }
    setIsModalOpen(false);
    setNewTitle('');
    setNewStrategyNote('');
    setNewSubtasksText('');
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Deseja realmente excluir esta atividade do seu checklist?')) {
      const next = tasks.filter((t) => t.id !== taskId);
      saveTasks(next);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('koinonia_assessment_progress_updated', {
            detail: {
              source: 'kanban',
              taskId,
            },
          })
        );
      }
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedTypeFilter === 'all') return true;
    return t.type === selectedTypeFilter;
  });

  const activeTasks = tasks.filter((t) => t.status !== 'archived');
  const archivedTasksCount = tasks.filter((t) => t.status === 'archived').length;
  const totalTasks = activeTasks.length;
  const completedTasks = activeTasks.filter((t) => t.status === 'done').length;
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
              <span className="text-xs text-amber-300 font-bold">
                {activeTasks.length} Ativos (AV2 &amp; TCC) · {archivedTasksCount} Arquivados (AV1)
              </span>
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
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('lms_change_tab', { detail: 'operacao-av2' }));
              }
            }}
            className="px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950"
          >
            <Flame className="w-4 h-4" />
            <span>Operação AV2 (Guias, Mapas &amp; Simulados)</span>
          </button>
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
            <span>Quadro Kanban ({activeTasks.length} ativos)</span>
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
              <span className="font-bold text-gray-700">Progresso AV2 &amp; TCC</span>
              <span className="font-black text-blue-600">{progressPercent}% ({completedTasks}/{totalTasks})</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-gray-500 mt-1 block">
              {archivedTasksCount} itens da AV1 arquivados
            </span>
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
            title="Sincroniza e restaura os prazos oficiais do semestre 2026.2 (AV2 ativa e AV1 arquivada)"
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
            { id: 'all', label: `Todos (${tasks.length})` },
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

      {/* Quadro Kanban de Colunas (Drag & Drop + 4 Colunas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {(
          [
            {
              status: 'todo',
              title: 'A Fazer (Pendentes)',
              Icon: Clock,
              containerClass: 'bg-gray-100/70 border-gray-200/80',
              dragOverClass: 'ring-2 ring-blue-500 border-blue-400 bg-blue-50/40',
              headerClass: 'text-gray-700 border-gray-200',
              iconClass: 'text-gray-500',
              badgeClass: 'bg-gray-200 text-gray-700',
              dropHintClass: 'border-blue-300 bg-blue-50/70 text-blue-700',
              emptyText: 'Nenhuma avaliação pendente nesta coluna.',
            },
            {
              status: 'doing',
              title: 'Em Andamento (Produção)',
              Icon: PenTool,
              containerClass: 'bg-blue-50/40 border-blue-200/60',
              dragOverClass: 'ring-2 ring-blue-500 border-blue-400 bg-blue-100/50',
              headerClass: 'text-blue-900 border-blue-200',
              iconClass: 'text-blue-600',
              badgeClass: 'bg-blue-100 text-blue-800',
              dropHintClass: 'border-blue-300 bg-blue-100/70 text-blue-800',
              emptyText: 'Nenhuma avaliação em andamento nesta coluna.',
            },
            {
              status: 'done',
              title: 'Concluídos com Êxito',
              Icon: CheckCircle2,
              containerClass: 'bg-emerald-50/40 border-emerald-200/60',
              dragOverClass: 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-100/50',
              headerClass: 'text-emerald-900 border-emerald-200',
              iconClass: 'text-emerald-600',
              badgeClass: 'bg-emerald-100 text-emerald-800',
              dropHintClass: 'border-emerald-300 bg-emerald-100/70 text-emerald-800',
              emptyText: 'Nenhuma avaliação concluída nesta coluna.',
            },
            {
              status: 'archived',
              title: 'Arquivados',
              Icon: Archive,
              containerClass: 'bg-slate-100/80 border-slate-300/80',
              dragOverClass: 'ring-2 ring-slate-500 border-slate-400 bg-slate-200/60',
              headerClass: 'text-slate-700 border-slate-300',
              iconClass: 'text-slate-600',
              badgeClass: 'bg-slate-200 text-slate-700',
              dropHintClass: 'border-slate-400 bg-slate-200/70 text-slate-700',
              emptyText: 'Arraste ou mova avaliações antigas/concluídas para arquivar.',
            },
          ] as const
        ).map((col) => {
          const ColIcon = col.Icon;
          const colTasks = filteredTasks.filter((t) => t.status === col.status);
          const isDropActive = dragOverColumn === col.status;

          return (
            <div
              key={col.status}
              onDragOver={(e) => handleColumnDragOver(e, col.status)}
              onDragEnter={(e) => handleColumnDragOver(e, col.status)}
              onDragLeave={(e) => handleColumnDragLeave(e, col.status)}
              onDrop={(e) => handleColumnDrop(e, col.status)}
              className={`p-4 rounded-3xl border space-y-4 transition-all min-h-[260px] min-w-0 ${
                isDropActive ? col.dragOverClass : col.containerClass
              }`}
            >
              <div className={`flex items-center justify-between gap-2 font-bold text-sm border-b pb-2.5 ${col.headerClass}`}>
                <span className="flex items-center gap-2 min-w-0">
                  <ColIcon className={`w-4 h-4 shrink-0 ${col.iconClass}`} />
                  <span className="truncate">{col.title}</span>
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isDropActive && (
                    <span className="px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-black shadow-2xs">
                      Solte aqui
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${col.badgeClass}`}>
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {isDropActive && (
                <div className={`px-3 py-2 rounded-xl border border-dashed text-[11px] font-bold text-center ${col.dropHintClass}`}>
                  Solte o card aqui para mover para {col.title}
                </div>
              )}

              <div className="space-y-4">
                {colTasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    isDragging={draggingTaskId === task.id}
                    onDragStart={handleCardDragStart}
                    onDragEnd={handleCardDragEnd}
                    onStatusChange={handleStatusChange}
                    onToggleSubtask={handleToggleSubtask}
                    onDeleteTask={handleDeleteTask}
                    onOpenDrawer={() => setDrawerEvento(getEventoForTask(task))}
                    onOpenResumo={() => setPopupEvento(getEventoForTask(task))}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="p-8 text-center text-xs text-gray-400 italic">
                    {col.emptyText}
                  </div>
                )}
              </div>
            </div>
          );
        })}
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

      {/* MODAIS COMPARTILHADOS DUAL-VIEW (CALENDÁRIO & KANBAN) */}
      <PopupResumoAvaliacao
        evento={popupEvento}
        checklistMap={checklistMap}
        onClose={() => setPopupEvento(null)}
        onOpenDrawer={(ev) => {
          setPopupEvento(null);
          setDrawerEvento(ev);
        }}
      />

      <DrawerAvaliacao
        evento={drawerEvento}
        checklistMap={checklistMap}
        onToggleStep={handleToggleStepFromDrawer}
        onCompleteAssessment={handleCompleteAssessmentFromDrawer}
        onClose={() => setDrawerEvento(null)}
      />
    </div>
  );
};

interface KanbanCardProps {
  task: KanbanTask;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragEnd: () => void;
  onStatusChange: (id: string, status: KanbanStatus) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenDrawer: () => void;
  onOpenResumo: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  isDragging,
  onDragStart,
  onDragEnd,
  onStatusChange,
  onToggleSubtask,
  onDeleteTask,
  onOpenDrawer,
  onOpenResumo,
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
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={`bg-white p-4 rounded-2xl border shadow-sm space-y-3 transition-all cursor-grab active:cursor-grabbing select-none sm:select-auto ${
        isDragging
          ? 'opacity-50 scale-[0.98] border-blue-400 ring-2 ring-blue-300 shadow-lg'
          : 'border-gray-200 hover:shadow-md hover:border-gray-300'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-1.5 min-w-0">
          <span
            className="mt-0.5 text-gray-300 hover:text-gray-500 transition shrink-0"
            title="Arraste para mover entre colunas"
          >
            <GripVertical className="w-4 h-4" />
          </span>
          <h4 className="font-bold text-sm text-gray-900 leading-snug">{task.title}</h4>
        </div>
        <button
          onClick={() => onDeleteTask(task.id)}
          onMouseDown={(e) => e.stopPropagation()}
          className="text-gray-300 hover:text-red-600 transition p-1 shrink-0 cursor-pointer"
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

      {/* Ações Rápidas: Passo a Passo & Resumo */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={onOpenResumo}
          className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl border border-slate-200 transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>Resumo</span>
        </button>
        <button
          type="button"
          onClick={onOpenDrawer}
          className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-extrabold text-[11px] rounded-xl border border-blue-200 transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <BookOpen className="w-3 h-3 text-blue-600" />
          <span>Passo a Passo</span>
        </button>
      </div>

      {/* Lista de Checkbox Interno (SSOT idêntica ao Passo a Passo + Ações Diretas) */}
      {task.subtasks.length > 0 && (() => {
        const officialEv = AVALIACOES_2026_2.find((ev) => ev.id === (task.assessmentId || task.id));

        const getChipMeta = (variant?: PassoAcao['variant']) => {
          switch (variant) {
            case 'pdf':
              return { Icon: BookOpen, cls: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200' };
            case 'drive':
              return { Icon: FolderOpen, cls: 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200' };
            case 'meet':
              return { Icon: Video, cls: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' };
            case 'av2':
              return { Icon: Flame, cls: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300' };
            case 'hub':
              return { Icon: Layers, cls: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' };
            case 'abnt':
              return { Icon: PenTool, cls: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200' };
            case 'email':
              return { Icon: Mail, cls: 'bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200' };
            default:
              return { Icon: BookOpen, cls: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' };
          }
        };

        return (
          <div className="space-y-2 pt-1 border-t border-gray-100">
            <div className="flex justify-between text-[11px] text-gray-400 font-bold mb-1">
              <span>Etapas do Trabalho</span>
              <span>{doneSub}/{totalSub}</span>
            </div>
            {task.subtasks.map((st, sIdx) => {
              const stepActions = officialEv?.passoAcoes?.[sIdx];
              return (
                <div key={st.id} className="space-y-1">
                  <label className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer hover:text-blue-700">
                    <input
                      type="checkbox"
                      checked={st.done}
                      onChange={() => onToggleSubtask(task.id, st.id)}
                      className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={st.done ? 'line-through text-gray-400' : 'font-medium'}>{st.text}</span>
                  </label>
                  {stepActions && stepActions.length > 0 && (
                    <div className="pl-5 flex flex-wrap gap-1">
                      {stepActions.map((acao, aIdx) => {
                        const href = resolvePassoAcaoHref(acao, officialEv?.disciplinaId);
                        if (!href) return null;
                        const { Icon, cls } = getChipMeta(acao.variant);
                        const isMailto = acao.kind === 'email' || href.startsWith('mailto:');
                        return (
                          <a
                            key={aIdx}
                            href={href}
                            target={isMailto ? undefined : '_blank'}
                            rel={isMailto ? undefined : 'noopener noreferrer'}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            title={isMailto ? acao.label : 'Abrir em nova aba'}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold transition ${cls}`}
                          >
                            <Icon className="w-2.5 h-2.5 shrink-0" />
                            <span>{acao.label}</span>
                            {!isMailto && <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs gap-2">
        <span className="text-gray-400 font-semibold text-[11px]">Mover de Coluna:</span>
        <select
          value={task.status}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => onStatusChange(task.id, e.target.value as KanbanStatus)}
          className="p-1.5 border border-gray-200 rounded-xl text-xs bg-gray-50 font-bold text-gray-700 outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="todo">⏳ A Fazer</option>
          <option value="doing">✍️ Em Andamento</option>
          <option value="done">✅ Concluído</option>
          <option value="archived">📦 Arquivado</option>
        </select>
      </div>
    </div>
  );
};
