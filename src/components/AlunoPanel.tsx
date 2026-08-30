'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { mockAulas, datasAvaliacoesMap, getAulasByTurma } from '@/lib/mockData';
import { INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';
import { 
  Video, FolderOpen, Clock, User, CheckCircle2, 
  FileText, Sparkles, Check, Copy, AlertCircle, 
  BookOpen, Calendar, Globe, Info, CheckSquare, Edit3, Save, ChevronLeft, ChevronRight,
  Cloud, Settings, GraduationCap, X, Compass, PhoneCall, Archive, ArchiveRestore, CheckCircle,
  Layers, Flame, ArrowRight, Mic, Box, Ban, RefreshCw, ChevronDown, ChevronUp,
  AlertTriangle, ExternalLink, Link as LinkIcon
} from 'lucide-react';
import { Aula, AvisoLeituraPreAula } from '@/types';
import { 
  getAulaCanceladaStatus, 
  getAllAulasCanceladas, 
  fetchAulasCanceladasFromCloud, 
  AulaCanceladaItem 
} from '@/services/aulaCanceladaService';
import { 
  getLocalTimeZoneInfo, 
  convertBRTToLocalTime, 
  getCurrentBrasiliaMinutes, 
  TimeZoneInfo 
} from '@/lib/timeUtils';
import { 
  getSemester2026Weeks, 
  getCurrentWeekIndex, 
  getDateForLesson 
} from '@/lib/semesterUtils';
import { 
  subscribeToStudentSync, 
  saveCompletedLessons, 
  saveStudentNotes,
  savePortalProfile,
  saveLessonAttendanceStatus,
  LessonAttendanceStatus
} from '@/services/studentSyncService';
import { 
  getAnnouncements, 
  getReadAnnouncementIds,
  markAnnouncementAsRead,
  unmarkAnnouncementAsRead,
  formatAnnouncementForWhatsApp,
  fetchAnnouncementsFromCloud
} from '@/services/announcementsService';
import { getAllGravacoes, fetchGravacoesFromCloud, sortGravacoesChronologicalDesc } from '@/services/gravacoesService';
import { VideoPlayerModal } from '@/components/VideoPlayerModal';
import { UserProfileModal } from '@/components/UserProfileModal';
import { trackEvent } from '@/services/telemetryService';

interface AlunoPanelProps {
  userEmail?: string;
  onTabChange?: (tab: string) => void;
}

export const AlunoPanel: React.FC<AlunoPanelProps> = ({ userEmail, onTabChange }) => {
  const normalizedEmail = (userEmail || 'sacrasub@gmail.com').toLowerCase().trim();

  const semesterWeeks = getSemester2026Weeks();
  const currentWeekIdx = getCurrentWeekIndex();

  // Estado do Seletor de Semana Letiva
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(currentWeekIdx);

  // Estados de Controle de Perfil & Onboarding do Aluno
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isFirstAccessModal, setIsFirstAccessModal] = useState<boolean>(false);
  const [isProfileConfirmed, setIsProfileConfirmed] = useState<boolean>(true);
  const [isRemindLater, setIsRemindLater] = useState<boolean>(false);

  const [selectedAvaliacao, setSelectedAvaliacao] = useState<{ title: string; tipo: 'AV1' | 'AV2'; data: string; disciplina: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAvisoId, setCopiedAvisoId] = useState<string | null>(null);
  const [openNotesId, setOpenNotesId] = useState<string | null>(null);

  const [announcements, setAnnouncements] = useState<AvisoLeituraPreAula[]>([]);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<string[]>([]);
  const [studentAnnouncementsTab, setStudentAnnouncementsTab] = useState<'pending' | 'archived' | 'read'>('pending');
  const [showAllLeituras, setShowAllLeituras] = useState<boolean>(false);
  // Gravações Salvas & Player de Vídeo Seguro
  const [gravacoes, setGravacoes] = useState(() => getAllGravacoes());
  const [showAllGravacoes, setShowAllGravacoes] = useState<boolean>(false);
  const [isSyncingGravacoes, setIsSyncingGravacoes] = useState<boolean>(false);
  const [activeVideoModal, setActiveVideoModal] = useState<{
    isOpen: boolean;
    title: string;
    videoUrl: string;
    disciplinaName: string;
    aulaNum?: number;
  }>({
    isOpen: false,
    title: '',
    videoUrl: '',
    disciplinaName: '',
  });

  const handleForceSyncGravacoes = async () => {
    setIsSyncingGravacoes(true);
    try {
      const freshList = await fetchGravacoesFromCloud();
      setGravacoes(freshList);
    } catch (e) {
      console.warn('Erro ao sincronizar gravações:', e);
    } finally {
      setTimeout(() => setIsSyncingGravacoes(false), 500);
    }
  };

  useEffect(() => {
    setAnnouncements(getAnnouncements());
    setReadAnnouncementIds(getReadAnnouncementIds(normalizedEmail));
    setGravacoes(getAllGravacoes());

    // Sincronização inicial da nuvem
    fetchAnnouncementsFromCloud().then((cloudList) => setAnnouncements(cloudList));
    fetchGravacoesFromCloud().then((cloudGravs) => setGravacoes(sortGravacoesChronologicalDesc(cloudGravs)));

    const handleUpd = (e: any) => {
      if (e.detail) setAnnouncements(e.detail);
      else setAnnouncements(getAnnouncements());
    };

    const handleReadUpd = (e: any) => {
      if (e.detail && e.detail.email === normalizedEmail) {
        setReadAnnouncementIds(e.detail.readIds);
      } else {
        setReadAnnouncementIds(getReadAnnouncementIds(normalizedEmail));
      }
    };

    const handleGravUpd = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setGravacoes(sortGravacoesChronologicalDesc(e.detail));
      } else {
        setGravacoes(getAllGravacoes());
      }
    };

    const handleCanceladasUpd = () => {
      setAulasCanceladasList(getAllAulasCanceladas());
    };

    fetchAulasCanceladasFromCloud().then(handleCanceladasUpd);

    window.addEventListener('lms_announcements_updated', handleUpd);
    window.addEventListener('lms_read_announcements_updated', handleReadUpd);
    window.addEventListener('lms_gravacoes_updated', handleGravUpd);
    window.addEventListener('lms_aula_cancelada_updated', handleCanceladasUpd);

    return () => {
      window.removeEventListener('lms_announcements_updated', handleUpd);
      window.removeEventListener('lms_read_announcements_updated', handleReadUpd);
      window.removeEventListener('lms_gravacoes_updated', handleGravUpd);
      window.removeEventListener('lms_aula_cancelada_updated', handleCanceladasUpd);
    };
  }, [normalizedEmail]);

  // Aulas canceladas
  const [aulasCanceladasList, setAulasCanceladasList] = useState<AulaCanceladaItem[]>(() => getAllAulasCanceladas());

  // Estados com Escopo do Aluno Logado e Data Específica (Per-User & Per-Date Storage)
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({});
  const [savedNotesMessage, setSavedNotesMessage] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [attendanceStatusMap, setAttendanceStatusMap] = useState<Record<string, LessonAttendanceStatus>>({});
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);

  // Estado da Situação Acadêmica do Aluno (Sincronizado do Perfil Acadêmico)
  const [studentProfile, setStudentProfile] = useState<{
    periodoNum: number;
    turmaIdx: number;
    autoMarkPrevious: boolean;
    completedSubjects: string[];
  }>(() => {
    let initialP = 7;
    let initialT = 1;
    const authUser = INITIAL_AUTHORIZED_USERS[normalizedEmail];
    if (authUser) {
      if (authUser.turmaIdx !== undefined) initialT = authUser.turmaIdx;
      if (authUser.periodoNum !== undefined) initialP = authUser.periodoNum;
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`lms_profile_${normalizedEmail}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          const p = parsed.periodoNum !== undefined ? Number(parsed.periodoNum) : initialP;
          const t = parsed.turmaIdx !== undefined ? Number(parsed.turmaIdx) : initialT;
          return {
            periodoNum: p,
            turmaIdx: t,
            autoMarkPrevious: parsed.autoMarkPrevious !== undefined ? parsed.autoMarkPrevious : true,
            completedSubjects: parsed.completedSubjects || [],
          };
        }
      } catch (e) {}
    }
    return {
      periodoNum: initialP,
      turmaIdx: initialT,
      autoMarkPrevious: true,
      completedSubjects: [],
    };
  });

  // Aulas dinâmicas correspondentes à turma do aluno logado
  const studentAulas = useMemo(() => {
    return getAulasByTurma(studentProfile.turmaIdx ?? 1);
  }, [studentProfile.turmaIdx]);

  // Informações de Fuso Horário do Aluno
  const [tzInfo, setTzInfo] = useState<TimeZoneInfo>({
    timeZone: 'Detectando...',
    gmtOffset: 'GMT-3',
    isBRT: true
  });

  // Identificação 100% Real da Aula Ativa e Status de Hoje
  const [activeLiveAula, setActiveLiveAula] = useState<Aula | null>(null);
  const [nextAulaToday, setNextAulaToday] = useState<Aula | null>(null);
  const [classesFinishedToday, setClassesFinishedToday] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentDayName, setCurrentDayName] = useState<string>('');

  // Carregar anotações, conclusões e situação do aluno via Supabase DB + Realtime + Cache Local
  useEffect(() => {
    const unsubscribe = subscribeToStudentSync(normalizedEmail, (data) => {
      setStudentNotes(data.studentNotes || {});
      setCompletedLessons(data.completedLessons || {});
      setAttendanceStatusMap(data.lessonAttendanceStatus || {});

      if (data.portalProfile) {
        const prof = data.portalProfile;
        const pNum = prof.periodoNum !== undefined ? Number(prof.periodoNum) : 7;
        const tIdx = prof.turmaIdx !== undefined ? Number(prof.turmaIdx) : (pNum === 5 ? 0 : pNum === 7 ? 1 : pNum === 3 ? 2 : 1);
        const autoM = prof.autoMarkPrevious !== undefined ? prof.autoMarkPrevious : true;
        const compS = prof.completedSubjects || [];

        setStudentProfile({
          periodoNum: pNum,
          turmaIdx: tIdx,
          autoMarkPrevious: autoM,
          completedSubjects: compS,
        });
      }
      setIsCloudSynced(true);
    });

    return () => unsubscribe();
  }, [normalizedEmail]);

  // Verificação de Primeiro Acesso do Aluno (Onboarding de Perfil & Situação Acadêmica)
  useEffect(() => {
    if (typeof window !== 'undefined' && normalizedEmail) {
      const confirmed = localStorage.getItem(`lms_profile_confirmed_${normalizedEmail}`) === 'true';
      const remind = localStorage.getItem(`lms_remind_profile_later_${normalizedEmail}`) === 'true';
      setIsProfileConfirmed(confirmed);
      setIsRemindLater(remind);

      // Se o aluno nunca confirmou o perfil e ainda não clicou em lembrar depois, abre no primeiro acesso
      if (!confirmed && !remind) {
        setIsFirstAccessModal(true);
        setIsProfileModalOpen(true);
      }
    }
  }, [normalizedEmail]);

  // Mapeamento completo dos 8 Períodos de disciplinas
  const subjectPeriodMap: Record<string, number> = {
    // 1º Período
    'Introdução à Teologia': 1,
    'Bibliologia': 1,
    'Antigo Testamento I - Pentateuco': 1,
    'Novo Testamento I - Evangelhos': 1,
    'Metodologia Científica': 1,
    // 2º Período
    'Teontologia e Hamartologia': 2,
    'Hermenêutica Bíblica': 2,
    'Antigo Testamento II - Livros Históricos': 2,
    'Novo Testamento II - Atos e Epístolas Paulinas': 2,
    'História da Igreja I': 2,
    // 3º Período
    'Cristologia e Soteriologia': 3,
    'Pneumatologia': 3,
    'História da Igreja II': 3,
    'Homilética I': 3,
    'Grego Instrumental I': 3,
    // 4º Período
    'Eclesiologia e Angelologia': 4,
    'Homilética II': 4,
    'Hebraico Instrumental I': 4,
    'Teologia Pastoral': 4,
    // 5º Período
    'Escatologia Bíblica': 5,
    'Aconselhamento Bíblico I': 5,
    'História do Pensamento Cristão I': 5,
    'Hebraico Instrumental II': 5,
    'Missiologia Teórica': 5,
    // 6º Período
    'Apologética Cristã': 6,
    'Liturgia e Cânticos da Igreja': 6,
    'Exegese do Antigo Testamento': 6,
    'Exegese do Novo Testamento': 6,
    // 7º Período (Disciplinas Ativas 2026.2)
    '01 - História do Congregacionalismo - Ary Júnior': 7,
    'História do Congregacionalismo': 7,
    '02 - História do Pensamento Cristão II - Hilário Bispo': 7,
    'História do Pensamento Cristão II': 7,
    '03 - Aconselhamento Bíblico II - Uilian Santos': 7,
    'Aconselhamento Bíblico II': 7,
    '04 - Direitos Humanos - Cleiton Barbirato': 7,
    'Direitos Humanos': 7,
    '05 - Ética Cristã - Karoline Evangelista': 7,
    'Ética Cristã': 7,
    '06 - Novo Testamento III - Epístolas Gerais - Marcio Leal': 7,
    'Novo Testamento III - Epístolas Gerais': 7,
    '07 - Plantação e Revitalização de Igrejas II - Thácyto Lessa': 7,
    'Plantação e Revitalização de Igrejas II': 7,
    '08 - TCC I - Gabriela Leal': 7,
    'TCC I': 7,
    '09 - História da Cultura Afro Brasileira e Indígena - Emerson Silva': 7,
    'História da Cultura Afro Brasileira e Indígena': 7,
    // 8º Período
    'TCC II': 8,
    'Estágio Pastoral Supervisado': 8,
    'Teologia Contemporânea': 8,
  };

  const getSubjectPeriodNum = (subjectName: string): number => {
    if (subjectPeriodMap[subjectName]) return subjectPeriodMap[subjectName];
    // Fallback: busca por substring caso a string tenha "01 - " ou "Ary Júnior"
    for (const [k, v] of Object.entries(subjectPeriodMap)) {
      if (subjectName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(subjectName.toLowerCase())) {
        return v;
      }
    }
    return 7;
  };

  const isLessonAutoCompletedPrevious = (aula: Aula) => {
    if (studentProfile.completedSubjects.includes(aula.disciplina_name)) {
      return true;
    }
    const pNum = getSubjectPeriodNum(aula.disciplina_name);
    if (studentProfile.autoMarkPrevious && pNum < studentProfile.periodoNum) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    const updateLiveStatus = () => {
      const info = getLocalTimeZoneInfo();
      setTzInfo(info);

      const now = new Date();
      const daysMap = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const currentDay = daysMap[now.getDay()];
      setCurrentDayName(currentDay);
      const currentBrtMinutes = getCurrentBrasiliaMinutes();

      const currentTurmaAulas = getAulasByTurma(studentProfile.turmaIdx ?? 1);
      const todayClasses = currentTurmaAulas.filter(a => a.day_of_week && a.day_of_week.includes(currentDay));

      if (todayClasses.length === 0) {
        setActiveLiveAula(null);
        setNextAulaToday(null);
        setClassesFinishedToday(false);
        return;
      }

      const liveNow = todayClasses.find((a) => {
        if (a.start_time && a.end_time) {
          const [sh, sm] = a.start_time.split(':').map(Number);
          const [eh, em] = a.end_time.split(':').map(Number);
          const startM = sh * 60 + sm;
          const endM = eh * 60 + em;
          return currentBrtMinutes >= startM && currentBrtMinutes <= endM;
        }
        return false;
      });

      if (liveNow && liveNow.start_time && liveNow.end_time) {
        setActiveLiveAula(liveNow);
        setNextAulaToday(null);
        setClassesFinishedToday(false);

        const [sh, sm] = liveNow.start_time.split(':').map(Number);
        const [eh, em] = liveNow.end_time.split(':').map(Number);
        const startM = sh * 60 + sm;
        const endM = eh * 60 + em;
        const totalDuration = endM - startM;
        const elapsed = currentBrtMinutes - startM;
        const pct = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
        setProgressPercent(pct);
        return;
      }

      const upcoming = todayClasses.find((a) => {
        if (a.start_time) {
          const [sh, sm] = a.start_time.split(':').map(Number);
          const startM = sh * 60 + sm;
          return currentBrtMinutes < startM;
        }
        return false;
      });

      if (upcoming) {
        setActiveLiveAula(null);
        setNextAulaToday(upcoming);
        setClassesFinishedToday(false);
        return;
      }

      setActiveLiveAula(null);
      setNextAulaToday(null);
      setClassesFinishedToday(true);
    };

    updateLiveStatus();
    // Atualização matemática local a cada 10 segundos (0 requisições de rede, 0 sobrecarga de servidor)
    const interval = setInterval(updateLiveStatus, 10000);
    return () => clearInterval(interval);
  }, [studentProfile.turmaIdx]);

  // Atualiza estado local e agenda gravação em nuvem com debounce interno (1.5s)
  const handleNoteChange = (itemKey: string, text: string) => {
    const updated = { ...studentNotes, [itemKey]: text };
    setStudentNotes(updated);
    // saveStudentNotes grava no cache local e agenda envio à nuvem sem re-fetch interruptivo
    saveStudentNotes(normalizedEmail, updated, false);
  };

  // Salva a anotação imediatamente ao clicar em "Salvar Anotação"
  const handleSaveNoteForDate = (noteKey: string, text: string) => {
    const updated = { ...studentNotes, [noteKey]: text };
    setStudentNotes(updated);
    // Força persistência imediata na nuvem (immediate = true)
    saveStudentNotes(normalizedEmail, updated, true);
    setSavedNotesMessage(noteKey);
    setTimeout(() => setSavedNotesMessage(null), 2500);
  };

  // Alterna a conclusão para a chave composta (Código da Aula + Data Específica)
  const handleToggleLessonCompleteForDate = (progressKey: string) => {
    const updated = { ...completedLessons, [progressKey]: !completedLessons[progressKey] };
    setCompletedLessons(updated);
    saveCompletedLessons(normalizedEmail, updated);
  };

  const handleSetAttendanceStatus = (itemKey: string, status: LessonAttendanceStatus) => {
    const updated = { ...attendanceStatusMap, [itemKey]: status };
    setAttendanceStatusMap(updated);
    saveLessonAttendanceStatus(normalizedEmail, itemKey, status);

    if (status === 'presente' || status === 'nao_houve') {
      const compUpdated = { ...completedLessons, [itemKey]: true };
      setCompletedLessons(compUpdated);
      saveCompletedLessons(normalizedEmail, compUpdated);
    } else if (status === 'pendente') {
      const compUpdated = { ...completedLessons, [itemKey]: false };
      setCompletedLessons(compUpdated);
      saveCompletedLessons(normalizedEmail, compUpdated);
    }
  };

  const handleOpenOrCreateCornellForLesson = (aula: Aula, dateForDay: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lms_change_tab', { detail: 'aluno-anotacoes' }));
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('lms_create_cornell_from_lesson', {
            detail: {
              subject: aula.disciplina_name,
              lessonDate: dateForDay,
              topic: `${aula.code || aula.id} - ${aula.disciplina_name} (${dateForDay})`,
              professor: aula.professor_name || (aula as any).professor || '',
            },
          })
        );
      }, 80);
    }
  };

  const handleCreateReposicaoRelatorio = (aula: Aula, dateForDay: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lms_change_tab', { detail: 'aluno-reposicao' }));
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('lms_start_reposicao_relatorio', {
            detail: {
              aulaId: aula.id,
              aulaCode: aula.code || aula.id,
              disciplinaName: aula.disciplina_name,
              dateForDay: dateForDay,
              professor: aula.professor_name || (aula as any).professor || '',
            },
          })
        );
      }, 80);
    }
  };

  const is50PercentReached = progressPercent >= 50;

  const handleCopyLink = (url: string, id: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const baseDays = ['Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];

  const currentDayOfWeekName = useMemo(() => {
    const dayNum = new Date().getDay();
    if (dayNum === 2) return 'Terça-feira';
    if (dayNum === 3) return 'Quarta-feira';
    if (dayNum === 4) return 'Quinta-feira';
    if (dayNum === 5) return 'Sexta-feira';
    return null;
  }, []);

  const orderedDaysOfWeek = useMemo(() => {
    // Se estiver na semana vigente e o dia de hoje for um dia de aula (Terça a Sexta)
    if (selectedWeekIndex === currentWeekIdx && currentDayOfWeekName) {
      const todayIdx = baseDays.indexOf(currentDayOfWeekName);
      if (todayIdx !== -1) {
        // Dias de hoje em diante primeiro, depois dias anteriores da semana (passados)
        const upcomingAndToday = baseDays.slice(todayIdx);
        const pastDays = baseDays.slice(0, todayIdx);
        return [...upcomingAndToday, ...pastDays];
      }
    }
    return baseDays;
  }, [selectedWeekIndex, currentWeekIdx, currentDayOfWeekName]);

  const daysOfWeek = orderedDaysOfWeek;
  const activeWeek = semesterWeeks[selectedWeekIndex] || semesterWeeks[0];

  // Cálculo do Progresso Geral na Semana Selecionada
  let totalLessonsInWeek = 0;
  let completedLessonsInWeek = 0;

  studentAulas.forEach((aula) => {
    if (aula.day_of_week) {
      const lessonDate = getDateForLesson(selectedWeekIndex, aula.day_of_week);
      const key = `${aula.code || aula.id}_${lessonDate}`;
      totalLessonsInWeek++;
      if (completedLessons[key] || isLessonAutoCompletedPrevious(aula)) completedLessonsInWeek++;
    }
  });

  const weekProgressPercent = totalLessonsInWeek > 0 ? Math.round((completedLessonsInWeek / totalLessonsInWeek) * 100) : 0;

  const handleQuickChangeTurma = (newT: number) => {
    const newP = newT === 0 ? 5 : newT === 1 ? 7 : newT === 2 ? 3 : 0;
    const updated = {
      ...studentProfile,
      turmaIdx: newT,
      periodoNum: newP
    };
    setStudentProfile(updated);
    savePortalProfile(normalizedEmail, updated);
  };

  const turmaOptions = [
    { idx: 1, label: 'Turma A (7º Período - Veteranos)', tag: 'Turma A' },
    { idx: 2, label: 'Turma B (3º Período - Noturno)', tag: 'Turma B' },
    { idx: 0, label: 'Fim de Semana (5º Período)', tag: 'FDS' },
    { idx: 3, label: 'Curso Básico', tag: 'Básico' },
  ];

  const aulasCanceladasHoje = useMemo(() => {
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    return aulasCanceladasList.filter((c) => {
      if (!c.ativo) return false;
      if (c.data_aula !== dataHoje) return false;
      return studentAulas.some(
        (a) =>
          a.disciplina_name.toLowerCase().trim() === c.disciplina_name.toLowerCase().trim() ||
          a.id === c.disciplina_id ||
          a.code === c.disciplina_id
      );
    });
  }, [aulasCanceladasList, studentAulas]);

  // Renderizador dos Cartões de Metodologias & Laboratórios de Prática Pastoral
  const renderCardsMetodologias = (isModoAula: boolean) => (
    <div className={`space-y-4 ${isModoAula ? 'pt-6 border-t border-gray-200/80' : ''}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/20 text-amber-950 rounded-xl">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              {isModoAula
                ? 'Laboratórios & Metodologias Práticas (Para Praticar Fora do Horário de Aula)'
                : 'Modo de Estudo Entre as Aulas Online (Laboratórios de Prática Pastoral, Homilética & 3D)'}
            </h4>
            <p className="text-xs text-gray-500">
              {isModoAula
                ? 'Após o término da transmissão ao vivo, pratique nos laboratórios interativos do seminário.'
                : 'Aproveite os intervalos e dias livres para gravar sermões no Estúdio, navegar no Metaverso Bíblico 3D e avançar nas Trilhas 4Ds.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* 0. CARD DESTAQUE PRINCIPAL: FLUXO DE ESTUDOS & ECOSSISTEMA TEOLÓGICO (6 FASES / 11 PASTAS) */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-5 sm:p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden border border-indigo-500/30">
          <div className="space-y-2 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/30 text-blue-200 border border-blue-400/30 flex items-center gap-1.5 backdrop-blur-md">
                <Compass className="w-3.5 h-3.5 text-blue-300" />
                Pipeline Metodológico Semanal • Koinonia LMS
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                📁 11 Pastas · 📅 Agenda · 🎙️ NotebookLM · 🤖 9 Personas Gemini
              </span>
            </div>
            <h3 className="text-xl font-black text-white">Fluxo de Estudos & Ecossistema Teológico (6 Fases)</h3>
            <p className="text-xs text-indigo-100/90 max-w-2xl leading-relaxed">
              Acesse o ciclo de estudo integrado conectando os horários da Google Agenda, salas Google Meet, Caderno Cornell, prompts de mentoria do Gemini e fontes do NotebookLM.
            </p>
          </div>
          <button
            onClick={() => onTabChange?.('fluxo-estudos')}
            className="relative z-10 flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-xs shadow-md hover:from-blue-400 hover:to-indigo-500 hover:shadow-xl transition-all scale-100 hover:scale-105 cursor-pointer whitespace-nowrap"
          >
            <span>Acessar Fluxo de Estudos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 1. CARD DESTAQUE: TRILHA DE ENSINAGEM SOCRÁTICA (OS QUATRO Ds DE JESUS) */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-600 to-orange-700 p-5 sm:p-6 rounded-3xl text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white/20 text-white border border-white/30 flex items-center gap-1.5 backdrop-blur-md">
                <Flame className="w-3.5 h-3.5 text-yellow-200" />
                Metodologia Inov-Ativa · Método de Jesus
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/40 text-amber-200 border border-amber-300/30">
                🔥 Desejo · 🌀 Desestruturação · ⚡ Desafio · ✅ Decisão
              </span>
            </div>
            <h3 className="text-xl font-black text-white">Trilha de Ensinagem Socrática (4Ds)</h3>
            <p className="text-xs text-orange-100/90 max-w-2xl leading-relaxed">
              Experimente o ciclo de reflexão profunda e andragógica: responda às indagações provocativas, encare os paradoxos ministeriais e registre suas decisões vocacionais.
            </p>
          </div>
          <button
            onClick={() => onTabChange?.('quatro-ds')}
            className="relative z-10 flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-orange-900 font-extrabold text-xs shadow-md hover:bg-orange-50 hover:shadow-xl transition-all scale-100 hover:scale-105 cursor-pointer whitespace-nowrap"
          >
            <span>Acessar Minhas Trilhas</span>
            <ArrowRight className="w-4 h-4 text-orange-600" />
          </button>
        </div>

        {/* 2. CARD DESTAQUE: ESTÚDIO DE PRÁTICA HOMILÉTICA & INSTRUÇÃO POR PARES */}
        <div className="bg-gradient-to-r from-rose-800 via-stone-900 to-amber-900 p-5 sm:p-6 rounded-3xl text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden border border-rose-700/40">
          <div className="space-y-2 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/30 text-rose-200 border border-rose-400/30 flex items-center gap-1.5 backdrop-blur-md">
                <Mic className="w-3.5 h-3.5 text-rose-300" />
                Microaprendizagem & Instrução por Pares
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                🎙️ Sermões · 🤝 Aconselhamento · 🌟 Feedback dos Colegas
              </span>
            </div>
            <h3 className="text-xl font-black text-white">Estúdio de Prática Homilética & Aconselhamento</h3>
            <p className="text-xs text-rose-100/90 max-w-2xl leading-relaxed">
              Grave sermões expositivos e simulações de aconselhamento, avalie os sermões dos seus colegas de turma e receba feedbacks construtivos focados no seu crescimento ministerial.
            </p>
          </div>
          <button
            onClick={() => onTabChange?.('homiletica')}
            className="relative z-10 flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 text-stone-950 font-black text-xs shadow-md hover:bg-amber-400 hover:shadow-xl transition-all scale-100 hover:scale-105 cursor-pointer whitespace-nowrap"
          >
            <span>Entrar no Estúdio</span>
            <ArrowRight className="w-4 h-4 text-stone-950" />
          </button>
        </div>

        {/* 3. CARD DESTAQUE: METAVERSO TEOLÓGICO & AMBIENTES IMERSIVOS 3D */}
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 p-5 sm:p-6 rounded-3xl text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden border border-cyan-800/50">
          <div className="space-y-2 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 flex items-center gap-1.5 backdrop-blur-md">
                <Box className="w-3.5 h-3.5 text-cyan-300" />
                Tele-Presença Espacial · Arqueologia 3D
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                ⛺ Tabernáculo · 🏛️ Templo de Salomão · 🧱 Jerusalém Século I
              </span>
            </div>
            <h3 className="text-xl font-black text-white">Metaverso Teológico & Exploração 3D</h3>
            <p className="text-xs text-cyan-100/90 max-w-2xl leading-relaxed">
              Navegue tridimensionalmente por reconstituições históricas sagradas, acesse hotspots exegéticos e conclua missões de exploração conectando a arqueologia à teologia bíblica.
            </p>
          </div>
          <button
            onClick={() => onTabChange?.('metaverso')}
            className="relative z-10 flex items-center gap-2 px-5 py-3 rounded-2xl bg-cyan-500 text-stone-950 font-black text-xs shadow-md hover:bg-cyan-400 hover:shadow-xl transition-all scale-100 hover:scale-105 cursor-pointer whitespace-nowrap"
          >
            <span>Explorar em 3D</span>
            <ArrowRight className="w-4 h-4 text-stone-950" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* BANNER DE AVISO OFICIAL: AULAS CANCELADAS HOJE */}
      {aulasCanceladasHoje.length > 0 && (
        <div className="bg-gradient-to-r from-red-950 via-rose-900 to-slate-900 border-2 border-red-500 rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600 text-white rounded-2xl animate-pulse">
              <Ban className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-red-500 text-white px-2.5 py-0.5 rounded-full">
                  🚫 Aviso Acadêmico Oficial
                </span>
                <span className="text-xs text-rose-200 font-mono">
                  Data: {new Date().toLocaleDateString('pt-BR')}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Atenção: Não Haverá Aula Hoje
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {aulasCanceladasHoje.map((canc) => (
              <div key={canc.id} className="bg-black/30 border border-red-400/40 rounded-2xl p-3.5 space-y-1.5">
                <h4 className="font-extrabold text-sm text-red-200 flex items-center gap-1.5">
                  <span>📖 {canc.disciplina_name}</span>
                </h4>
                <p className="text-xs text-slate-100 bg-red-950/60 p-2.5 rounded-xl border border-red-500/30 leading-relaxed">
                  <strong>Motivo informado:</strong> "{canc.motivo}"
                </p>
                <div className="flex items-center justify-between text-[10px] text-rose-300 pt-1">
                  <span>Registrado por: <strong>{canc.autor_nome}</strong></span>
                  <span>Koinonia LMS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. PRIMEIRO CARD: BANNER DE FUSO HORÁRIO & PAINEL ACADÊMICO DO ALUNO (TOPO ABSOLUTO) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" /> Semestre Letivo 2026.2 (Turma A)
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              👤 Perfil Pessoal: <strong>{normalizedEmail}</strong>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200" title="Horários convertidos automaticamente para seu fuso">
              <Globe className="w-3.5 h-3.5 text-gray-500" /> Fuso: <strong>{tzInfo.gmtOffset}</strong>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs" title="Seus dados de aulas e caderno são sincronizados em tempo real entre PC e Celular">
              <Cloud className="w-3.5 h-3.5 text-indigo-600" /> Sincronizado (PC & Celular)
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Painel Acadêmico do Aluno</h2>
          <p className="text-sm text-gray-500">
            Navegue pelas semanas letivas do semestre e gerencie suas anotações e conclusões por data de aula.
          </p>
        </div>

        {/* Card de Progresso da Semana Selecionada */}
        <div className="w-full md:w-64 bg-gray-50 p-4 rounded-2xl border border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-bold text-gray-700">Progresso da {activeWeek.formattedStart} a {activeWeek.formattedEnd}</span>
            <span className="font-extrabold text-blue-600">{weekProgressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${weekProgressPercent}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            {completedLessonsInWeek} de {totalLessonsInWeek} aulas concluídas nesta semana
          </span>
        </div>
      </div>

      {/* 2. BARRA COMPACTA: SITUAÇÃO ACADÊMICA CONFIGURADA (LOGO ABAIXO DO CABEÇALHO) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border border-indigo-900/60">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-500/30 text-blue-200 border border-blue-400/30 flex items-center gap-1.5 shrink-0 shadow-xs">
            <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
            {studentProfile.periodoNum === 0 ? 'Curso Básico de Teologia' : `${studentProfile.periodoNum}º Período (${studentProfile.turmaIdx === 2 ? 'Turma B' : 'Turma A'})`}
          </span>

          <div className="text-xs text-blue-100/90 flex items-center gap-1.5 flex-wrap">
            <span className="text-blue-300 font-medium">Turma Ativa:</span>
            <strong className="text-amber-300 font-extrabold">{
              ['Fim de Semana (5º)', 'Semanal Noturno A (7º)', 'Semanal Noturno B (3º)', 'Curso Básico'][studentProfile.turmaIdx ?? 1] || 'Semanal Noturno A'
            }</strong>
          </div>
        </div>

        {/* Botão de Configuração Oficial / Edição de Dados Acadêmicos */}
        <button
          type="button"
          onClick={() => {
            setIsFirstAccessModal(false);
            setIsProfileModalOpen(true);
          }}
          className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-blue-600/30 hover:bg-blue-600 text-white border border-blue-400/40 hover:border-blue-300 transition flex items-center gap-2 shadow-xs cursor-pointer shrink-0 self-stretch sm:self-auto justify-center"
          title="Modificar seu período, turma oficial, foto e dados de cadastro"
        >
          <Settings className="w-3.5 h-3.5 text-amber-300" />
          <span>Configuração Oficial & Perfil</span>
        </button>
      </div>

      {/* 2.1 LEMBRETE DE ATUALIZAÇÃO CADASTRO (CASO O ALUNO TENHA CLICADO EM 'LEMBRAR DEPOIS') */}
      {!isProfileConfirmed && (
        <div className="p-3.5 sm:p-4 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <span className="p-1.5 bg-amber-500 text-slate-950 rounded-lg shrink-0">
              <AlertCircle className="w-4 h-4" />
            </span>
            <div>
              <strong className="block text-amber-950">Lembrete de Atualização de Perfil</strong>
              <span className="text-amber-800 text-[11px]">Você ainda não confirmou seu período e turma no Seminário UIECB.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsFirstAccessModal(true);
              setIsProfileModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 self-end sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Confirmar Meu Perfil Agora</span>
          </button>
        </div>
      )}

      {/* 3. QUADRO DE AULA ATIVA OU PRÓXIMA AULA (DESTAQUE MÁXIMO EM PRIMEIRO LUGAR) */}
      {activeLiveAula ? (
        <div className={`p-4 sm:p-6 rounded-3xl border transition-all duration-300 shadow-md max-w-full overflow-hidden animate-in fade-in slide-in-from-top-3 ${
          is50PercentReached 
            ? 'bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/90 border-emerald-300 ring-2 ring-emerald-500/20' 
            : 'bg-gradient-to-br from-blue-50/95 via-white to-indigo-50/90 border-blue-300 ring-2 ring-blue-500/20'
        }`}>
          <div className="mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex h-3 w-3 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${is50PercentReached ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${is50PercentReached ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-600 text-white shadow-xs animate-pulse">
                🔴 Aula Ao Vivo em Andamento
              </span>
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 leading-tight">
                Aula Ativa: <span className="text-blue-700 font-black">{activeLiveAula.disciplina_name}</span>
              </h3>
            </div>

            <div className="text-xs text-gray-600 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Professor(a): <strong>{activeLiveAula.professor_name || 'Corpo Docente'}</strong></span>
              <span>•</span>
              <span>Monitor(a): <strong>{activeLiveAula.monitor_name || 'Monitoria'}</strong></span>
              <span>•</span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                ⏰ Seu Horário: {activeLiveAula.start_time ? convertBRTToLocalTime(activeLiveAula.start_time) : ''} – {activeLiveAula.end_time ? convertBRTToLocalTime(activeLiveAula.end_time) : ''}
              </span>
              <span className="text-gray-500">
                (Base Brasília: {activeLiveAula.start_time} – {activeLiveAula.end_time} BRT)
              </span>
            </div>
          </div>

          {/* Barra de Progresso do Tempo da Aula */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Progresso de Duração da Aula em Andamento
              </span>
              <span className={`font-black px-2.5 py-0.5 rounded-md ${
                is50PercentReached ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
              }`}>
                {progressPercent}% da aula percorrida
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3.5 overflow-hidden p-0.5 border border-gray-300/60 shadow-inner relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400/80 z-10" title="Gatilho de 50% de Presença"></div>
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ${
                  is50PercentReached 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                    : 'bg-gradient-to-r from-amber-400 to-blue-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* BOTÃO DA SALA AO VIVO DO GOOGLE MEET & AVISO AUTOMÁTICO DE PRESENÇA */}
          <div className="space-y-3">
            {activeLiveAula.google_meet_url && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-red-950 font-medium">
                  <span className="p-2 bg-red-600 text-white rounded-lg shrink-0">
                    <Video className="w-4 h-4" />
                  </span>
                  <div>
                    <strong className="block text-red-900">Transmissão do Google Meet em Andamento</strong>
                    <span>Clique ao lado para ingressar na sala da aula ao vivo com o docente e a turma.</span>
                    {activeLiveAula.google_meet_phone && (
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-red-800 font-mono">
                        <span>📞 Telefone: <strong>{activeLiveAula.google_meet_phone}</strong> • PIN: <strong>{activeLiveAula.google_meet_pin}</strong></span>
                        {activeLiveAula.google_meet_tel_url && (
                          <a
                            href={activeLiveAula.google_meet_tel_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-700 underline font-bold"
                          >
                            (Discagem Direta)
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <a
                    href={activeLiveAula.google_meet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackEvent('meet', 'join_live_class', activeLiveAula.disciplina_name || activeLiveAula.title, { url: activeLiveAula.google_meet_url }, normalizedEmail, 'aluno');
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 shrink-0"
                  >
                    <Video className="w-4 h-4" />
                    <span>Entrar na Aula ao Vivo (Google Meet)</span>
                  </a>
                </div>
              </div>
            )}

            {is50PercentReached ? (
              <div className="p-4 bg-emerald-100/90 border border-emerald-300 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-full overflow-hidden">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-emerald-950 text-xs sm:text-sm">
                      Lista de Presença Liberada!
                    </div>
                    <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                      Confirme sua presença no formulário da aula de {activeLiveAula.disciplina_name}.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                  {activeLiveAula.attendance_form_url ? (
                    <>
                      <a
                        href={activeLiveAula.attendance_form_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          trackEvent('meet', 'attendance_form_click', activeLiveAula.disciplina_name || activeLiveAula.title, {}, normalizedEmail, 'aluno');
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 text-center"
                      >
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span>Preencher Lista de Presença (Google Forms)</span>
                      </a>
                      <button
                        onClick={() => handleCopyLink(activeLiveAula.attendance_form_url!, activeLiveAula.id)}
                        className="p-2.5 bg-emerald-200 hover:bg-emerald-300 text-emerald-900 font-bold text-xs rounded-xl transition flex items-center justify-center flex-shrink-0"
                        title="Copiar Link de Presença"
                      >
                        {copiedId === activeLiveAula.id ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-3 py-2 rounded-xl">
                      Sem formulário de chamada
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-center justify-between text-amber-900 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>A lista de presença será liberada automaticamente na metade da aula.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : nextAulaToday ? (
        <div className="p-5 bg-blue-50/90 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-blue-900 text-xs shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <strong>Próxima aula de hoje ({currentDayName}):</strong> {nextAulaToday.disciplina_name} ({nextAulaToday.professor_name}) às <strong>{nextAulaToday.start_time ? convertBRTToLocalTime(nextAulaToday.start_time) : ''} (Seu Horário)</strong> / {nextAulaToday.start_time} BRT. O link de presença será liberado 50% após o início da transmissão.
            </div>
          </div>
          {nextAulaToday.google_meet_url && (
            <a
              href={nextAulaToday.google_meet_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackEvent('meet', 'join_live_class', nextAulaToday.disciplina_name || nextAulaToday.title, { url: nextAulaToday.google_meet_url }, normalizedEmail, 'aluno');
              }}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Sala do Meet</span>
            </a>
          )}
        </div>
      ) : null}

      {/* 3. SEÇÃO DE LEITURAS PRÉ-AULA & ARTIGOS RECOMENDADOS PELOS DOCENTES */}
      {(() => {
        const pendingCount = announcements.filter((a) => !a.is_archived && !readAnnouncementIds.includes(a.id)).length;
        const archivedCount = announcements.filter((a) => a.is_archived).length;
        const readCount = announcements.filter((a) => readAnnouncementIds.includes(a.id)).length;
        const hasPending = pendingCount > 0;

        // Se houver leituras pendentes ou o aluno clicou para ver o acervo/lidas
        if (hasPending || showAllLeituras) {
          return (
            <div data-tour="dashboard-mural" className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-blue-800/60 space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-400/20 text-amber-300 rounded-2xl border border-amber-400/30 backdrop-blur-md">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md">
                        Mural de Recursos
                      </span>
                      <span className="text-xs text-blue-200">Links compartilhados em aula e leituras recomendadas</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                      Links, Leituras e Recursos das Aulas
                    </h3>
                  </div>
                </div>

                {/* Abas de Navegação das Leituras para o Aluno */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center bg-black/30 p-1 rounded-2xl border border-white/15 text-xs font-bold self-start sm:self-auto overflow-x-auto max-w-full">
                    <button
                      type="button"
                      onClick={() => setStudentAnnouncementsTab('pending')}
                      className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        studentAnnouncementsTab === 'pending'
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                          : 'text-blue-200 hover:text-white'
                      }`}
                    >
                      <span>📖 Pendentes</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        studentAnnouncementsTab === 'pending' ? 'bg-slate-950 text-amber-400' : 'bg-white/20 text-white'
                      }`}>
                        {pendingCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStudentAnnouncementsTab('archived')}
                      className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        studentAnnouncementsTab === 'archived'
                          ? 'bg-white text-slate-950 font-black shadow-xs'
                          : 'text-blue-200 hover:text-white'
                      }`}
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Acervo Arquivado</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        studentAnnouncementsTab === 'archived' ? 'bg-slate-950 text-white' : 'bg-white/20 text-white'
                      }`}>
                        {archivedCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStudentAnnouncementsTab('read')}
                      className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        studentAnnouncementsTab === 'read'
                          ? 'bg-emerald-400 text-slate-950 font-black shadow-xs'
                          : 'text-blue-200 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Já Lidas</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        studentAnnouncementsTab === 'read' ? 'bg-slate-950 text-emerald-400' : 'bg-white/20 text-white'
                      }`}>
                        {readCount}
                      </span>
                    </button>
                  </div>

                  {!hasPending && showAllLeituras && (
                    <button
                      type="button"
                      onClick={() => setShowAllLeituras(false)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/15 transition cursor-pointer"
                      title="Recolher visualização de leituras"
                    >
                      🗕 Recolher
                    </button>
                  )}
                </div>
              </div>

              {(() => {
                const currentList = announcements.filter((a) => {
                  if (studentAnnouncementsTab === 'pending') {
                    return !a.is_archived && !readAnnouncementIds.includes(a.id);
                  }
                  if (studentAnnouncementsTab === 'archived') {
                    return a.is_archived;
                  }
                  if (studentAnnouncementsTab === 'read') {
                    return readAnnouncementIds.includes(a.id);
                  }
                  return true;
                });

                if (currentList.length === 0) {
                  return (
                    <div className="p-8 bg-black/20 rounded-2xl border border-white/10 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="font-extrabold text-white text-sm">
                        {studentAnnouncementsTab === 'pending'
                          ? 'Parabéns! Todas as leituras e links recomendados estão em dia.'
                          : studentAnnouncementsTab === 'archived'
                          ? 'Nenhum recurso no acervo arquivado no momento.'
                          : 'Você ainda não marcou nenhuma leitura como concluída.'}
                      </p>
                      <p className="text-xs text-blue-200">
                        {studentAnnouncementsTab === 'pending'
                          ? 'Quando novos links ou artigos forem publicados pelos seus professores e monitores, eles aparecerão aqui.'
                          : studentAnnouncementsTab === 'archived'
                          ? 'Links e textos de aulas anteriores arquivados pelos docentes ficarão disponíveis para sua consulta aqui.'
                          : 'Clique em "Marcar como Lida" nas leituras para arquivar o que você já estudou no seu perfil.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentList.map((av) => {
                      const isRead = readAnnouncementIds.includes(av.id);

                      return (
                        <div
                          key={av.id}
                          className={`border rounded-2xl p-4 sm:p-5 transition-all flex flex-col justify-between space-y-4 backdrop-blur-md group ${
                            isRead
                              ? 'bg-emerald-950/30 border-emerald-500/30'
                              : av.is_archived
                              ? 'bg-amber-950/20 border-amber-400/30'
                              : 'bg-white/10 hover:bg-white/15 border-white/15'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] font-extrabold uppercase tracking-wide bg-blue-500/30 text-blue-200 border border-blue-400/30 px-2.5 py-0.5 rounded-lg">
                                  {av.disciplina_name}
                                </span>
                                
                                {/* Badge de Categoria / Momento */}
                                {av.category === 'durante_aula' ? (
                                  <span className="text-[10px] font-black uppercase tracking-wide bg-rose-500/30 text-rose-200 border border-rose-400/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                                    🔴 Compartilhado em Aula
                                  </span>
                                ) : av.category === 'complementar' ? (
                                  <span className="text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    📌 Material Complementar
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-extrabold uppercase tracking-wide bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    📖 Leitura Pré-Aula
                                  </span>
                                )}

                                {av.is_archived && (
                                  <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.2 rounded-md flex items-center gap-1">
                                    <Archive className="w-2.5 h-2.5" /> Arquivada
                                  </span>
                                )}
                                {isRead && (
                                  <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-2 py-0.2 rounded-md flex items-center gap-1">
                                    <Check className="w-2.5 h-2.5" /> Concluída
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-blue-200/80">
                                {av.target_date || 'Próxima Aula'}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors">
                              {av.title}
                            </h4>

                            <div className="bg-black/25 p-3 rounded-xl border border-white/10">
                              <p className="text-xs text-blue-100 italic">
                                "{av.message}"
                              </p>
                              <span className="block text-[11px] font-semibold text-amber-200 mt-1.5">
                                — {av.author_name} ({av.author_role === 'professor' ? 'Docente' : 'Monitor(a)'})
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 pt-1 border-t border-white/10">
                            {/* Botão de Marcar / Desmarcar como Lida */}
                            <div className="flex items-center gap-2">
                              {isRead ? (
                                <button
                                  onClick={() => unmarkAnnouncementAsRead(normalizedEmail, av.id)}
                                  className="w-full py-1.5 px-3 bg-white/10 hover:bg-white/20 text-blue-200 font-bold text-xs rounded-xl border border-white/20 transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                                  title="Retornar esta leitura para o feed de pendentes"
                                >
                                  <ArchiveRestore className="w-3.5 h-3.5 text-blue-300" />
                                  <span>Marcar como Não Lida (Retornar p/ Pendentes)</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => markAnnouncementAsRead(normalizedEmail, av.id)}
                                  className="w-full py-1.5 px-3 bg-emerald-600/40 hover:bg-emerald-600 text-emerald-200 hover:text-white font-bold text-xs rounded-xl border border-emerald-500/50 transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                                  title="Marcar como lida (sai do feed principal)"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                                  <span>✓ Marcar como Lida</span>
                                </button>
                              )}
                            </div>

                            {/* Ações de Leitura e Compartilhamento */}
                            <div className="flex flex-wrap items-center gap-2">
                              <a
                                href={av.link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span>Ler Artigo</span>
                              </a>

                              <button
                                onClick={() => {
                                  const msg = formatAnnouncementForWhatsApp(av);
                                  navigator.clipboard.writeText(msg);
                                  setCopiedAvisoId(av.id);
                                  setTimeout(() => setCopiedAvisoId(null), 2500);
                                }}
                                title="Copiar recado para WhatsApp"
                                className="py-2 px-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-1 active:scale-95 cursor-pointer"
                              >
                                {copiedAvisoId === av.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  if (onTabChange) onTabChange('aluno-caderno');
                                  else if (typeof window !== 'undefined') {
                                    window.dispatchEvent(new CustomEvent('lms_change_tab', { detail: 'aluno-caderno' }));
                                  }
                                }}
                                title="Abrir no Caderno Cornell com IA"
                                className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 active:scale-95 cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                                <span>Cornell IA</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          );
        }

        // Se NÃO houver leituras pendentes e houver arquivadas/lidas no acervo, exibe apenas barra compacta
        if (archivedCount > 0 || readCount > 0) {
          return (
            <div data-tour="dashboard-mural" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-100/90 hover:bg-slate-200/80 rounded-2xl border border-slate-200 text-slate-700 transition">
              <div className="flex items-center gap-2.5 text-xs font-semibold">
                <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                  <BookOpen className="w-4 h-4" />
                </span>
                <span>✨ Todas as leituras recomendadas estão em dia!</span>
                <span className="text-gray-500 hidden sm:inline">
                  ({archivedCount} arquivada{archivedCount !== 1 ? 's' : ''} • {readCount} lida{readCount !== 1 ? 's' : ''})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStudentAnnouncementsTab(archivedCount > 0 ? 'archived' : 'read');
                  setShowAllLeituras(true);
                }}
                className="px-3.5 py-1.5 bg-white hover:bg-blue-50 text-blue-900 text-xs font-bold rounded-xl border border-gray-200 shadow-2xs transition flex items-center gap-1.5 cursor-pointer self-end sm:self-auto"
              >
                <Archive className="w-3.5 h-3.5 text-blue-600" />
                <span>Acessar Acervo Arquivado / Lidas</span>
              </button>
            </div>
          );
        }

        return null;
      })()}



      {/* AVISO DE ENCERRAMENTO DE AULAS OU SEM AULAS HOJE (QUANDO NÃO HÁ AULA ATIVA) */}
      {!activeLiveAula && !nextAulaToday && (
        classesFinishedToday ? (
          <div className="p-4 sm:p-5 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <strong>As aulas de hoje ({currentDayName}) foram encerradas.</strong> O formulário oficial de presença esteve disponível durante a transmissão ao vivo. Confira a grade completa e links de apoio abaixo.
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl flex items-center gap-3 text-gray-600 text-xs shadow-sm">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <strong>Não há aulas síncronas programadas para hoje ({currentDayName}).</strong> As listas de chamada (Google Forms) ficam disponíveis exclusivamente durante a transmissão oficial das aulas ao vivo (a partir dos 50% de duração).
            </div>
          </div>
        )
      )}

      {/* SEÇÃO EM DESTAQUE: GRAVAÇÕES DE AULAS DISPONÍVEIS (ACESSO RÁPIDO MOBILE & DESKTOP) */}
      {gravacoes.length > 0 && (
        <div data-tour="aluno-gravacoes" className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 p-4 sm:p-5 rounded-2xl border border-red-900/40 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-600/30 text-red-400 border border-red-500/40 rounded-xl">
                <Video className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                  <span>Aulas Gravadas Disponíveis</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/30">
                    {gravacoes.length} {gravacoes.length === 1 ? 'aula' : 'aulas'}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Assista às aulas ministradas em alta definição diretamente no seu celular ou computador.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleForceSyncGravacoes}
                disabled={isSyncingGravacoes}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Sincronizar gravações da nuvem"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGravacoes ? 'animate-spin text-red-400' : ''}`} />
                <span className="hidden sm:inline">{isSyncingGravacoes ? 'Sincronizando...' : 'Sincronizar'}</span>
              </button>

              {gravacoes.length > 6 && (
                <button
                  onClick={() => setShowAllGravacoes(!showAllGravacoes)}
                  className="px-2.5 py-1.5 bg-red-950/80 hover:bg-red-900/80 text-red-300 hover:text-red-200 border border-red-800/60 rounded-xl text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer"
                >
                  <span>{showAllGravacoes ? 'Ver menos' : `Ver todas (${gravacoes.length})`}</span>
                  {showAllGravacoes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {(showAllGravacoes ? gravacoes : gravacoes.slice(0, 6)).map((rec) => (
              <div
                key={rec.id}
                className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-red-500/50 transition flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-red-300 font-bold">
                    <span>Aula {rec.aula_num || 1}</span>
                    {rec.data_aula && <span>• {rec.data_aula}</span>}
                  </div>
                  <h5 className="font-bold text-xs text-white truncate pt-0.5">
                    {rec.title}
                  </h5>
                  <p className="text-[10px] text-slate-400 truncate">
                    {rec.disciplina_name}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveVideoModal({
                      isOpen: true,
                      title: rec.title,
                      videoUrl: rec.video_url,
                      disciplinaName: rec.disciplina_name,
                      aulaNum: rec.aula_num,
                    });
                  }}
                  className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer"
                  title="Assistir gravação no player seguro"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Assistir HD</span>
                </button>
              </div>
            ))}
          </div>

          {gravacoes.length > 6 && !showAllGravacoes && (
            <div className="text-center pt-1">
              <button
                onClick={() => setShowAllGravacoes(true)}
                className="text-xs text-red-400 hover:text-red-300 font-bold inline-flex items-center gap-1 p-1 hover:underline cursor-pointer"
              >
                <span>Mostrar mais {gravacoes.length - 6} aulas gravadas</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SEÇÃO DA GRADE DE AULAS COM NAVEGAÇÃO POR SEMANAS LETIVAS */}
      <div data-tour="disciplinas-grid" className="space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Video className="w-6 h-6 text-red-600" /> Grade de Aulas & Meu Caderno de Estudos (2026.2)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Configurado conforme sua situação: <strong>{studentProfile.periodoNum === 0 ? 'Curso Básico' : `${studentProfile.periodoNum}º Período`}</strong>. Suas anotações pessoais de estudo e progresso por disciplina ficam salvos exclusivamente no seu perfil e vinculados à data de cada aula.
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-900 border border-blue-200 rounded-full text-xs font-bold w-fit">
              9 Disciplinas Ativas ({studentProfile.periodoNum === 0 ? 'Curso Básico' : `${studentProfile.periodoNum}º Período`} - 2026.2)
            </span>
          </div>

          {/* BARRA DE NAVEGAÇÃO DE SEMANAS LETIVAS DO SEMESTRE */}
          <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSelectedWeekIndex(Math.max(0, selectedWeekIndex - 1))}
                disabled={selectedWeekIndex === 0}
                className="p-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center gap-1 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>

              <button
                onClick={() => setSelectedWeekIndex(currentWeekIdx)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition shadow-sm ${
                  selectedWeekIndex === currentWeekIdx
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-100'
                }`}
              >
                Semana Vigente
              </button>

              <button
                onClick={() => setSelectedWeekIndex(Math.min(semesterWeeks.length - 1, selectedWeekIndex + 1))}
                disabled={selectedWeekIndex === semesterWeeks.length - 1}
                className="p-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center gap-1 shadow-sm"
              >
                Próxima <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Selector Dropdown das 16 Semanas */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <select
                value={selectedWeekIndex}
                onChange={(e) => setSelectedWeekIndex(Number(e.target.value))}
                className="w-full sm:w-auto p-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-blue-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {semesterWeeks.map((w, idx) => (
                  <option key={w.weekNumber} value={idx}>
                    {w.label} {idx === currentWeekIdx ? '★ (Vigente Hoje)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mapeamento por Dias da Semana na Semana Selecionada */}
        {daysOfWeek.map((day) => {
          const aulasDoDia = studentAulas.filter((a) => a.day_of_week === day);
          if (aulasDoDia.length === 0) return null;

          const dateForDay = getDateForLesson(selectedWeekIndex, day);
          const isToday = selectedWeekIndex === currentWeekIdx && day === currentDayOfWeekName;
          const isPastDay = selectedWeekIndex === currentWeekIdx && currentDayOfWeekName && baseDays.indexOf(day) < baseDays.indexOf(currentDayOfWeekName);

          return (
            <div key={day} className={`space-y-3 ${isToday ? 'p-3 bg-blue-50/40 rounded-3xl border-2 border-blue-400 shadow-sm' : ''}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm ${
                  isToday 
                    ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white ring-2 ring-blue-400' 
                    : isPastDay
                    ? 'bg-slate-700 text-slate-200'
                    : 'bg-blue-900 text-white'
                }`}>
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{day} — 🗓️ {dateForDay}</span>
                  {isToday && (
                    <span className="ml-1 text-[10px] bg-emerald-400 text-emerald-950 px-2 py-0.2 rounded-full font-black uppercase tracking-wider">
                      📍 Aulas de Hoje
                    </span>
                  )}
                  {isPastDay && (
                    <span className="ml-1 text-[10px] bg-slate-800 text-slate-300 px-2 py-0.2 rounded-full font-medium">
                      Dias Anteriores
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aulasDoDia.map((aula) => {
                  const isCurrentActive = activeLiveAula?.id === aula.id;
                  const startLocal = aula.start_time ? convertBRTToLocalTime(aula.start_time) : '';
                  const endLocal = aula.end_time ? convertBRTToLocalTime(aula.end_time) : '';
                  const timeLocalStr = startLocal && endLocal ? `${startLocal} – ${endLocal}` : aula.scheduled_at;

                  const datas = datasAvaliacoesMap[aula.disciplina_name] || { av1: '28/09/2026', av2: '23/11/2026' };

                  // Chave composta com escopo por Aluno, Código e Data Específica da Aula
                  const aulaCode = aula.code || aula.id;
                  const itemKey = `${aulaCode}_${dateForDay}`;
                  
                  const isAutoPaid = isLessonAutoCompletedPrevious(aula);
                  const isCompleted = isAutoPaid || !!completedLessons[itemKey];
                  const currentNote = studentNotes[itemKey] || '';

                  return (
                    <div
                      key={aula.id}
                      className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between ${
                        isCurrentActive 
                          ? 'border-blue-400 ring-2 ring-blue-500/20 shadow-md bg-gradient-to-b from-blue-50/30 to-white' 
                          : 'border-gray-200 hover:border-gray-300 shadow-sm'
                      }`}
                    >
                      <div>
                        {/* Header do Card com Data Específica da Aula */}
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              {aulaCode}
                            </span>

                            {/* SELETOR DE STATUS PESSOAL DA AULA DO ALUNO */}
                            {(() => {
                              const currentStatus: LessonAttendanceStatus = attendanceStatusMap[itemKey] || (isCompleted ? 'presente' : 'pendente');

                              return (
                                <div className="relative inline-flex items-center">
                                  <select
                                    value={currentStatus}
                                    disabled={isAutoPaid}
                                    onChange={(e) => handleSetAttendanceStatus(itemKey, e.target.value as LessonAttendanceStatus)}
                                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition border focus:outline-none focus:ring-2 cursor-pointer ${
                                      isAutoPaid
                                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                        : currentStatus === 'presente'
                                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300 ring-emerald-200'
                                        : currentStatus === 'reposicao'
                                        ? 'bg-rose-100 text-rose-950 border-rose-300 ring-rose-200 animate-pulse'
                                        : currentStatus === 'nao_houve'
                                        ? 'bg-slate-200 text-slate-900 border-slate-300'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                                    }`}
                                    title="Definir seu status pessoal de presença ou reposição nesta aula"
                                  >
                                    <option value="pendente">⏳ Pendente / Aguardando Aula</option>
                                    <option value="presente">🟢 Assisti Online (Presença Registrada)</option>
                                    <option value="reposicao">🔴 Não Assisti Online (Reposição por Gravação)</option>
                                    <option value="nao_houve">⏸️ Não Houve Aula (Suspensa / Feriado)</option>
                                  </select>
                                </div>
                              );
                            })()}
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-emerald-600" /> Seu Horário: {timeLocalStr}
                            </span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              (Brasília: {aula.start_time} – {aula.end_time} BRT)
                            </span>
                          </div>
                        </div>

                        {/* Título & Descrição */}
                        <h4 className="text-base font-bold text-gray-900 leading-snug">{aula.disciplina_name}</h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{aula.description}</p>

                        {/* BOX DE AVISO: REPOSIÇÃO OBRIGATÓRIA DA AULA (QUANDO O ALUNO MARCA QUE NÃO ASSISTIU ONLINE) */}
                        {(() => {
                          const currentStatus: LessonAttendanceStatus = attendanceStatusMap[itemKey] || (isCompleted ? 'presente' : 'pendente');
                          if (currentStatus !== 'reposicao') return null;

                          // Localiza a gravação da disciplina se houver
                          const gravacao = gravacoes.find((g) => 
                            g.disciplina_name?.toLowerCase().includes(aula.disciplina_name.toLowerCase()) ||
                            aula.disciplina_name.toLowerCase().includes((g.disciplina_name || '').toLowerCase())
                          );

                          return (
                            <div className="mt-3 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2.5 text-xs text-rose-950 animate-in fade-in">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="font-black text-rose-950 flex items-center gap-1.5 text-xs">
                                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                  <span>Reposição de Aula Necessária</span>
                                </span>
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-rose-200 text-rose-900 rounded-md">
                                  Ausente no Meet
                                </span>
                              </div>
                              <p className="text-[11px] text-rose-900 leading-relaxed font-medium">
                                Você marcou que <strong>não assistiu à transmissão ao vivo</strong> desta aula. Para cumprir os requisitos institucionais, assista à gravação oficial e elabore seu <strong>Relatório Acadêmico de Reposição</strong>.
                              </p>
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                {gravacao ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const url = gravacao.video_url || (gravacao as any).drive_file_url || (gravacao as any).drive_url || '#';
                                      if (typeof window !== 'undefined' && url !== '#') {
                                        window.open(url, '_blank', 'noopener,noreferrer');
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Video className="w-3.5 h-3.5" />
                                    <span>Assistir Gravação da Aula</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
                                    Gravação em processamento
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleCreateReposicaoRelatorio(aula, dateForDay)}
                                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5 text-slate-950" />
                                  <span>📝 Criar Relatório de Reposição (Cornell)</span>
                                </button>
                              </div>
                            </div>
                          );
                        })()}

                        {/* BOX DE AVISO: NÃO HOUVE AULA / SUSPENSÃO */}
                        {(() => {
                          const currentStatus: LessonAttendanceStatus = attendanceStatusMap[itemKey] || (isCompleted ? 'presente' : 'pendente');
                          const canceladaStatus = getAulaCanceladaStatus(aula.id || aula.code || '', aula.disciplina_name, dateForDay);

                          if (currentStatus === 'nao_houve' || canceladaStatus) {
                            return (
                              <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs">
                                <div className="flex items-center gap-1.5 font-extrabold text-amber-950">
                                  <Ban className="w-3.5 h-3.5 text-amber-600" />
                                  <span>⏸️ NÃO HOUVE AULA NESTA DATA ({dateForDay})</span>
                                </div>
                                {canceladaStatus && (
                                  <p className="text-[11px] text-amber-950 leading-relaxed bg-white/70 p-2 rounded-lg border border-amber-100 font-medium">
                                    <strong>Motivo institucional:</strong> "{canceladaStatus.motivo}"
                                  </p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {/* BOX DE LEITURA PRÉ-AULA VINCULADA À MATÉRIA (EXIBIDA EXCLUSIVAMENTE NA DATA RECOMENDADA) */}
                        {(() => {
                          const activeReading = announcements.find((a) => {
                            if (a.is_archived) return false;
                            const matchDisc =
                              a.disciplina_name.toLowerCase().trim() === aula.disciplina_name.toLowerCase().trim() ||
                              a.disciplina_id === aula.disciplina_id;
                            if (!matchDisc) return false;
                            // A leitura só aparece no card desta aula se a data prevista (target_date) ou criação (created_at) for EXATAMENTE a data desta aula (dateForDay)
                            return a.target_date === dateForDay || a.created_at === dateForDay;
                          });

                          if (!activeReading) return null;

                          return (
                            <div className="mt-3 p-3 bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200 rounded-xl space-y-2 text-xs shadow-2xs">
                              <div className="flex items-center justify-between gap-1 flex-wrap">
                                <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Leitura Pré-Aula Recomendada</span>
                                </span>
                                <span className="text-[10px] bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                                  {activeReading.author_name}
                                </span>
                              </div>
                              <strong className="block text-slate-900 font-bold text-xs">{activeReading.title}</strong>
                              <p className="text-[11px] text-amber-900/90 italic">"{activeReading.message}"</p>
                              <div className="flex gap-2 pt-1">
                                <a
                                  href={activeReading.link_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 py-1.5 px-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[11px] rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Ler Texto Recomendado</span>
                                </a>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Metadados: Professor e Monitor */}
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span>Prof: <strong>{aula.professor_name || 'Corpo Docente'}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">👑 Monitor(a)</span>
                            <span>{aula.monitor_name || 'Monitoria'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Ações Consolidadas da Disciplina */}
                      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                        {/* 1. Google Meet ou Aviso de Cancelamento */}
                        {(() => {
                          const canceladaStatus = getAulaCanceladaStatus(aula.id || aula.code || '', aula.disciplina_name, dateForDay);
                          if (canceladaStatus) {
                            return (
                              <div className="flex-1 min-w-[120px] py-2 px-3 bg-red-100/80 text-red-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-red-200 shadow-2xs">
                                <Ban className="w-3.5 h-3.5 text-red-600" />
                                <span>Aula Cancelada</span>
                              </div>
                            );
                          }
                          if (aula.google_meet_url) {
                            return (
                              <a
                                href={aula.google_meet_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 min-w-[120px] py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
                              >
                                <Video className="w-3.5 h-3.5" /> Entrar no Meet
                              </a>
                            );
                          }
                          return (
                            <span className="flex-1 min-w-[120px] py-2 px-3 bg-gray-100 text-gray-500 font-semibold text-xs rounded-xl flex items-center justify-center gap-1">
                              📹 Módulo Gravado
                            </span>
                          );
                        })()}

                        {/* 2. Pasta Virtual Drive */}
                        {aula.google_drive_url && (
                          <a
                            href={aula.google_drive_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-[120px] py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                            title="Pasta Virtual de Estudos no Google Drive"
                          >
                            <FolderOpen className="w-3.5 h-3.5" /> Pasta Drive
                          </a>
                        )}

                        {/* 2.5. Caderno Cornell Integrado da Disciplina e Data */}
                        <button
                          type="button"
                          onClick={() => handleOpenOrCreateCornellForLesson(aula, dateForDay)}
                          className="py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                          title={`Abrir Caderno Cornell de ${aula.disciplina_name} (${dateForDay})`}
                        >
                          <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Caderno Cornell</span>
                        </button>

                        {/* 2.8. Botão de Gravação de Aula se disponível */}
                        {(() => {
                          const currentLessonNum = selectedWeekIndex + 1;
                          // 1. Tenta buscar correspondência exata de matéria e número de aula
                          let matchingGravacao = gravacoes.find(
                            (g) => (g.disciplina_id === aula.disciplina_id || g.disciplina_name.toLowerCase().trim() === aula.disciplina_name.toLowerCase().trim()) &&
                                   g.aula_num === currentLessonNum
                          );
                          // 2. Se não encontrar para o número exato, busca qualquer gravação da matéria
                          if (!matchingGravacao) {
                            matchingGravacao = gravacoes.find(
                              (g) => g.disciplina_id === aula.disciplina_id || g.disciplina_name.toLowerCase().trim() === aula.disciplina_name.toLowerCase().trim()
                            );
                          }

                          if (!matchingGravacao) return null;

                          return (
                            <button
                              onClick={() => {
                                setActiveVideoModal({
                                  isOpen: true,
                                  title: matchingGravacao.title,
                                  videoUrl: matchingGravacao.video_url,
                                  disciplinaName: aula.disciplina_name,
                                  aulaNum: matchingGravacao.aula_num,
                                });
                              }}
                              className="py-2 px-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer"
                              title={`Assistir ${matchingGravacao.title} no Player Seguro do LMS`}
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Aula Gravada (HD)</span>
                            </button>
                          );
                        })()}

                        {/* 2.9. Materiais de Apoio & Gemini Notebook */}
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              window.dispatchEvent(
                                new CustomEvent('lms_open_disciplina_detail', {
                                  detail: { disciplinaId: aula.disciplina_id, subTab: 'gemini' },
                                })
                              );
                            }
                          }}
                          className="py-2 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                          title={`Ver Materiais de Apoio, Podcasts e Mapas Mentais de ${aula.disciplina_name}`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Materiais & Gemini</span>
                        </button>

                        {/* 3. Botão AV1 com Data */}
                        <button
                          onClick={() => setSelectedAvaliacao({
                            title: `AV1: ${aula.disciplina_name}`,
                            tipo: 'AV1',
                            data: datas.av1,
                            disciplina: aula.disciplina_name
                          })}
                          className="py-2 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition"
                          title={`Ver Avaliação AV1 (${datas.av1})`}
                        >
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          <span>AV1 ({datas.av1})</span>
                        </button>

                        {/* 4. Botão AV2 com Data */}
                        <button
                          onClick={() => setSelectedAvaliacao({
                            title: `AV2: ${aula.disciplina_name}`,
                            tipo: 'AV2',
                            data: datas.av2,
                            disciplina: aula.disciplina_name
                          })}
                          className="py-2 px-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition"
                          title={`Ver Avaliação AV2 (${datas.av2})`}
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
                          <span>AV2 ({datas.av2})</span>
                        </button>
                      </div>

                      {/* 5. Botão Central de Acesso à Página Dedicada da Matéria */}
                      <button
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            window.dispatchEvent(
                              new CustomEvent('lms_open_disciplina_detail', {
                                detail: { disciplinaId: aula.disciplina_id },
                              })
                            );
                          }
                        }}
                        className="mt-2.5 w-full py-2 px-3 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer border border-blue-800/40"
                      >
                        <Layers className="w-3.5 h-3.5 text-amber-300" />
                        <span>Ver Página Completa da Matéria (Livros & Gemini IA) ➔</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* RECURSOS PEDAGÓGICOS COMPLEMENTARES (EXIBIDOS NO FINAL QUANDO EM AULA AO VIVO) */}
      {activeLiveAula && renderCardsMetodologias(true)}

      {/* Modal Visualizador de Avaliação AV1 / AV2 */}
      {selectedAvaliacao && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  selectedAvaliacao.tipo === 'AV1' ? 'bg-amber-100 text-amber-900' : 'bg-purple-100 text-purple-900'
                }`}>
                  {selectedAvaliacao.tipo} - Avaliação do Semestre 2026.2
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">{selectedAvaliacao.title}</h3>
              </div>
              <button
                onClick={() => setSelectedAvaliacao(null)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 bg-white">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-2">
                <div className="flex justify-between items-center font-bold text-sm">
                  <span>Data Agendada:</span>
                  <span className="px-2.5 py-1 bg-white rounded-lg text-blue-700 shadow-sm border border-blue-200">
                    🗓️ {selectedAvaliacao.data}
                  </span>
                </div>
                <p className="text-blue-800 leading-relaxed pt-2 border-t border-blue-200/60">
                  Esta prova será disponibilizada pelo professor no portal durante a semana de avaliações acadêmicas ({selectedAvaliacao.tipo === 'AV1' ? '28/09 a 03/10/2026' : '23/11 a 28/11/2026'}).
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700">Instruções de Envio da Prova:</h4>
                <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                  <li>O formulário de questões será ativado na data <strong>{selectedAvaliacao.data}</strong>.</li>
                  <li>Mantenha as atividades e leituras do módulo em dia.</li>
                  <li>Em caso de dúvidas sobre o conteúdo, consulte a monitoria da disciplina.</li>
                </ul>
              </div>

              <button
                onClick={() => setSelectedAvaliacao(null)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Entendido / Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DO PLAYER DE VÍDEO SEGURO DO GOOGLE DRIVE */}
      <VideoPlayerModal
        isOpen={activeVideoModal.isOpen}
        onClose={() => setActiveVideoModal({ isOpen: false, title: '', videoUrl: '', disciplinaName: '' })}
        title={activeVideoModal.title}
        disciplinaName={activeVideoModal.disciplinaName}
        aulaNum={activeVideoModal.aulaNum}
        videoUrl={activeVideoModal.videoUrl}
      />

      {/* MODAL DE CADASTRO, EDIÇÃO DE PERFIL E CONFIGURAÇÃO ACADÊMICA OFICIAL DO ALUNO */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setIsFirstAccessModal(false);
        }}
        userEmail={normalizedEmail}
        isFirstAccess={isFirstAccessModal}
        onRemindLater={() => {
          setIsRemindLater(true);
          setIsProfileConfirmed(false);
          setIsProfileModalOpen(false);
          setIsFirstAccessModal(false);
        }}
        onProfileUpdated={() => {
          setIsProfileConfirmed(true);
          setIsProfileModalOpen(false);
          setIsFirstAccessModal(false);
        }}
      />
    </div>
  );
};
