'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { mockAulas, datasAvaliacoesMap, getAulasByTurma } from '@/lib/mockData';
import { INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';
import { 
  Video, FolderOpen, Clock, User, CheckCircle2, 
  FileText, Sparkles, Check, Copy, AlertCircle, 
  BookOpen, Calendar, Globe, Info, CheckSquare, Edit3, Save, ChevronLeft, ChevronRight,
  Cloud, Settings, GraduationCap, X, Compass, PhoneCall, Archive, ArchiveRestore, CheckCircle,
  Layers, Flame, ArrowRight, Mic, Box, Ban, RefreshCw, ChevronDown, ChevronUp,
  AlertTriangle, ExternalLink, Link as LinkIcon, Mail, Zap, Play, Download, ClipboardList
} from 'lucide-react';
import { Aula, AvisoLeituraPreAula } from '@/types';
import { 
  getAulaCanceladaStatus, 
  isAulaCanceladaHoje,
  cancelarAula,
  getAllAulasCanceladas, 
  fetchAulasCanceladasFromCloud, 
  AulaCanceladaItem,
  parseProvidenciaMotivo
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
  
  // Identifica se hoje é dia de aula síncrona (Terça a Sexta)
  const isClassDay = useMemo(() => {
    const d = new Date().getDay();
    return d >= 2 && d <= 5; // Terça-feira (2) a Sexta-feira (5)
  }, []);

  // Estado de recolhimento das Gravações: recolhido por padrão
  const [isGravacoesCollapsed, setIsGravacoesCollapsed] = useState<boolean>(true);

  // Estado de recolhimento do Mural de Recursos:
  // Recolhido por padrão (true) caso não tenha leituras pendentes
  const [isMuralCollapsed, setIsMuralCollapsed] = useState<boolean>(true);

  const handleMarkAnnouncementRead = (id: string) => {
    markAnnouncementAsRead(normalizedEmail, id);
    setReadAnnouncementIds((prev) => Array.from(new Set([...prev, id])));
  };

  const handleUnmarkAnnouncementRead = (id: string) => {
    unmarkAnnouncementAsRead(normalizedEmail, id);
    setReadAnnouncementIds((prev) => prev.filter((item) => item !== id));
  };

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
    allAulas?: { aulaNum?: number; title: string; videoUrl: string }[];
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

  // Avisos e leituras filtrados para a turma do aluno
  const studentTurmaAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      return studentAulas.some(
        (sa) => sa.disciplina_id === a.disciplina_id || sa.disciplina_name.toLowerCase().trim() === a.disciplina_name.toLowerCase().trim()
      );
    });
  }, [announcements, studentAulas]);

  const pendingAnnouncementsCount = useMemo(() => {
    return studentTurmaAnnouncements.filter((a) => !a.is_archived && !readAnnouncementIds.includes(a.id)).length;
  }, [studentTurmaAnnouncements, readAnnouncementIds]);

  const archivedAnnouncementsCount = useMemo(() => {
    return studentTurmaAnnouncements.filter((a) => a.is_archived).length;
  }, [studentTurmaAnnouncements]);

  const readAnnouncementsCount = useMemo(() => {
    return studentTurmaAnnouncements.filter((a) => readAnnouncementIds.includes(a.id)).length;
  }, [studentTurmaAnnouncements, readAnnouncementIds]);

  // Garante que o mural venha recolhido de default caso não haja leituras pendentes
  const hasInitializedMuralRef = useRef(false);
  useEffect(() => {
    if (!hasInitializedMuralRef.current) {
      hasInitializedMuralRef.current = true;
      setIsMuralCollapsed(pendingAnnouncementsCount === 0);
    }
  }, [pendingAnnouncementsCount]);

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
  const [isPreLive, setIsPreLive] = useState<boolean>(false);
  const [minutesToStart, setMinutesToStart] = useState<number>(0);
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
    '09 - História da Cultura Afro Brasileira e Indígena - Alexsandro': 7,
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
        setIsPreLive(false);
        setMinutesToStart(0);
        return;
      }

      // Identifica aula ativa (incluindo janela de 15 minutos de antecedência para liberação do Google Meet)
      const liveNow = todayClasses.find((a) => {
        if (a.start_time && a.end_time) {
          const [sh, sm] = a.start_time.split(':').map(Number);
          const [eh, em] = a.end_time.split(':').map(Number);
          const startM = sh * 60 + sm;
          const endM = eh * 60 + em;
          return currentBrtMinutes >= (startM - 15) && currentBrtMinutes <= endM;
        }
        return false;
      });

      // Se houver aula ativa no horário, verifica primeiro se não foi configurado cancelamento ou providência
      if (liveNow && liveNow.start_time && liveNow.end_time) {
        const canceladaHoje = isAulaCanceladaHoje(liveNow.disciplina_id || liveNow.id, liveNow.disciplina_name, normalizedEmail);
        if (canceladaHoje) {
          const parsed = parseProvidenciaMotivo(canceladaHoje.motivo || '');
          const tipo = canceladaHoje.tipo_providencia || parsed.tipoProvidencia || 'cancelamento';

          if (tipo === 'aula_dupla' || tipo === 'substituicao') {
            // PROVIÊNCIA ATIVA (AULA DUPLA / SUBSTITUIÇÃO):
            // Não suprime a aula! Adapta o professor, disciplina, meetUrl e forms
            const aulaAdaptada: Aula = {
              ...liveNow,
              disciplina_name: parsed.substitutoDisciplinaName || canceladaHoje.substituto_disciplina_name || liveNow.disciplina_name,
              professor_name: parsed.substitutoProfessorName || canceladaHoje.substituto_professor_name || liveNow.professor_name,
              google_meet_url: parsed.substitutoMeetUrl || canceladaHoje.substituto_meet_url || liveNow.google_meet_url,
              attendance_form_url: parsed.substitutoPresencaUrl || canceladaHoje.substituto_presenca_url || (liveNow as any).attendance_form_url,
            };
            setActiveLiveAula(aulaAdaptada);
            setNextAulaToday(null);
            setClassesFinishedToday(false);
          } else {
            // AULA CANCELADA HOJE (Suspensão pura): Suprime o card
            setActiveLiveAula(null);
            setNextAulaToday(null);
            setClassesFinishedToday(false);
            setIsPreLive(false);
            setMinutesToStart(0);
            return;
          }
        } else {
          setActiveLiveAula(liveNow);
          setNextAulaToday(null);
          setClassesFinishedToday(false);
        }

        const [sh, sm] = liveNow.start_time.split(':').map(Number);
        const [eh, em] = liveNow.end_time.split(':').map(Number);
        const startM = sh * 60 + sm;
        const endM = eh * 60 + em;

        if (currentBrtMinutes < startM) {
          // Janela de 15 minutos de antecedência (Google Meet liberado para preparação e acolhimento)
          setIsPreLive(true);
          setMinutesToStart(Math.max(1, startM - currentBrtMinutes));
          setProgressPercent(0);
        } else {
          // Aula em andamento oficial
          setIsPreLive(false);
          setMinutesToStart(0);
          const totalDuration = endM - startM;
          const elapsed = currentBrtMinutes - startM;
          const pct = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
          setProgressPercent(pct);
        }
        return;
      }

      setIsPreLive(false);
      setMinutesToStart(0);

      // Próximas aulas de hoje que ainda não entraram na janela de 15 minutos de antecedência
      const upcoming = todayClasses.find((a) => {
        if (a.start_time) {
          const [sh, sm] = a.start_time.split(':').map(Number);
          const startM = sh * 60 + sm;
          return currentBrtMinutes < (startM - 15);
        }
        return false;
      });

      if (upcoming) {
        const isUpcomingCancelada = isAulaCanceladaHoje(upcoming.disciplina_id || upcoming.id, upcoming.disciplina_name, normalizedEmail);
        if (!isUpcomingCancelada) {
          setActiveLiveAula(null);
          setNextAulaToday(upcoming);
          setClassesFinishedToday(false);
          return;
        }
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

    if (status === 'nao_houve') {
      const datePart = itemKey.split('_')[1] || new Date().toLocaleDateString('pt-BR');
      const aulaMatch = studentAulas.find(a => itemKey.startsWith(a.code || a.id));
      if (aulaMatch) {
        const authUser = INITIAL_AUTHORIZED_USERS[normalizedEmail];
        cancelarAula({
          disciplinaId: aulaMatch.disciplina_id || aulaMatch.id,
          disciplinaName: aulaMatch.disciplina_name,
          dataAula: datePart,
          motivo: 'Registrado que não houve aula nesta data.',
          autorNome: authUser?.name || 'Aluno',
          autorEmail: normalizedEmail,
          autorRole: 'aluno',
        });
      }
    }
  };

  const handleOpenOrCreateCornellForLesson = (aula: Aula, dateForDay: string) => {
    const payload = {
      disciplina_name: aula.disciplina_name,
      disciplina_code: aula.code || aula.id,
      professor_name: aula.professor_name || (aula as any).professor || '',
      date: dateForDay,
      dateFormatted: dateForDay,
      theme: `${aula.code || aula.id} - ${aula.disciplina_name} (${dateForDay})`,
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lms_cornell_pending_open', JSON.stringify(payload));
      } catch (e) {}
    }

    if (onTabChange) {
      onTabChange('aluno-caderno');
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lms_change_tab', { detail: 'aluno-caderno' }));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('lms_open_cornell_note', { detail: payload }));
      }, 100);
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
    return studentAulas
      .map((a) => isAulaCanceladaHoje(a.disciplina_id || a.id, a.disciplina_name, normalizedEmail))
      .filter((c): c is AulaCanceladaItem => c !== null);
  }, [aulasCanceladasList, studentAulas, normalizedEmail]);

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
        <div data-tour="card-fluxo-estudos" className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-5 sm:p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden border border-indigo-500/30">
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
        <div data-tour="card-quatro-ds" className="bg-gradient-to-r from-orange-500 via-amber-600 to-orange-700 p-5 sm:p-6 rounded-3xl text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
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
        <div data-tour="card-homiletica" className="bg-gradient-to-r from-rose-800 via-stone-900 to-amber-900 p-5 sm:p-6 rounded-3xl text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden border border-rose-700/40">
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
        <div data-tour="card-metaverso" className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 p-5 sm:p-6 rounded-3xl text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden border border-cyan-800/50">
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

  const renderUnifiedHeader = () => (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
      <div className="space-y-2 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5" /> Semestre Letivo 2026.2
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            {studentProfile.periodoNum === 0 ? 'Curso Básico de Teologia' : `${studentProfile.periodoNum}º Período`}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Turma: <strong className="text-blue-900">{
              ['Fim de Semana (5º)', 'Semanal Noturno A (7º)', 'Semanal Noturno B (3º)', 'Curso Básico'][studentProfile.turmaIdx ?? 1] || 'Semanal Noturno A'
            }</strong>
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200" title="Horários convertidos automaticamente para seu fuso">
            <Globe className="w-3.5 h-3.5 text-gray-500" /> Fuso: <strong>{tzInfo.gmtOffset}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              setIsFirstAccessModal(false);
              setIsProfileModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
            title="Modificar seu período, turma oficial, foto e dados de cadastro"
          >
            <Settings className="w-3 h-3 text-amber-300" />
            <span>Configuração Oficial & Perfil</span>
          </button>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Painel Acadêmico do Aluno</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Navegue pelas semanas letivas do semestre e gerencie suas anotações e conclusões por data de aula.
          </p>
        </div>
      </div>
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
  );

  const renderAulasCanceladas = () => {
    if (aulasCanceladasHoje.length === 0) return null;
    return (
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
              Atenção: Não Haverá Aula Ao Vivo Hoje
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {aulasCanceladasHoje.map((canc) => {
            const parsed = canc.motivo?.startsWith('[PROVIDENCIA_JSON]:')
              ? parseProvidenciaMotivo(canc.motivo)
              : null;
            const motivoLimpo = parsed ? parsed.motivoLimpo : canc.motivo;
            const videoUrl = canc.video_url || parsed?.videoUrl || '';
            const arquivoUrl = canc.arquivo_url || parsed?.arquivoUrl || '';
            const arquivoNome = canc.arquivo_nome || parsed?.arquivoNome || 'Trabalho_Atividade.pdf';
            const trabalhoInstrucoes = canc.trabalho_instrucoes || parsed?.trabalhoInstrucoes || '';
            const trabalhoPrazo = canc.trabalho_prazo || parsed?.trabalhoPrazo || '';
            const hasExtra = Boolean(videoUrl || arquivoUrl || trabalhoInstrucoes);

            return (
              <div key={canc.id} className={`border rounded-2xl p-4 space-y-2.5 ${
                hasExtra ? 'bg-purple-950/40 border-purple-400/50' : 'bg-black/30 border-red-400/40'
              }`}>
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <h4 className="font-extrabold text-sm text-red-200 flex items-center gap-1.5">
                    <span>📖 {canc.disciplina_name}</span>
                  </h4>
                  {hasExtra && (
                    <span className="text-[10px] font-black uppercase tracking-wide bg-purple-600/60 text-purple-200 px-2 py-0.5 rounded-md border border-purple-400/40 flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      <span>Aula Gravada / Trabalho</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-100 bg-red-950/60 p-2.5 rounded-xl border border-red-500/30 leading-relaxed">
                  <strong>Recado oficial:</strong> "{motivoLimpo}"
                </p>

                {trabalhoInstrucoes && (
                  <div className="bg-amber-950/50 border border-amber-500/40 p-2.5 rounded-xl text-amber-200 text-xs space-y-1">
                    <span className="font-bold flex items-center gap-1 text-[11px] text-amber-300">
                      <ClipboardList className="w-3 h-3 text-amber-400" />
                      Instruções do Trabalho & Chamada {trabalhoPrazo ? `(Prazo: ${trabalhoPrazo})` : ''}
                    </span>
                    <p className="text-[11px] text-amber-100 leading-relaxed">
                      {trabalhoInstrucoes}
                    </p>
                  </div>
                )}

                {/* Botões de Ação para o Aluno */}
                {(videoUrl || arquivoUrl) && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {videoUrl && (
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Assistir Vídeo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {arquivoUrl && (
                      <a
                        href={arquivoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={arquivoNome}
                        className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar PDF ({arquivoNome})</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-rose-300 pt-1 border-t border-white/10">
                  <span>Registrado por: <strong>{canc.autor_nome}</strong></span>
                  <span>Koinonia LMS</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderProfileReminder = () => {
    if (isProfileConfirmed) return null;
    return (
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
    );
  };

  const renderAulaAoVivoOuProxima = () => {
    if (activeLiveAula) {
      // Bloqueio rigoroso: se a aula ativa estiver com cancelamento puro (suspensão), não exibe Google Meet nem Presença
      const isCanc = isAulaCanceladaHoje(activeLiveAula.disciplina_id || activeLiveAula.id, activeLiveAula.disciplina_name, normalizedEmail);
      let providenciaAtiva = false;
      let providenciaTipo = '';
      if (isCanc) {
        const parsed = parseProvidenciaMotivo(isCanc.motivo || '');
        const tipo = isCanc.tipo_providencia || parsed.tipoProvidencia || 'cancelamento';
        if (tipo === 'cancelamento') {
          return null;
        }
        providenciaAtiva = true;
        providenciaTipo = tipo;
      }

      return (
        <div className={`p-4 sm:p-6 rounded-3xl border transition-all duration-300 shadow-md max-w-full overflow-hidden animate-in fade-in slide-in-from-top-3 ${
          providenciaAtiva
            ? 'bg-gradient-to-br from-amber-50/95 via-white to-blue-50/90 border-amber-400 ring-2 ring-amber-500/20 shadow-lg'
            : is50PercentReached 
            ? 'bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/90 border-emerald-300 ring-2 ring-emerald-500/20' 
            : isPreLive
            ? 'bg-gradient-to-br from-blue-50/95 via-white to-indigo-50/90 border-blue-300 ring-2 ring-blue-500/20'
            : 'bg-gradient-to-br from-blue-50/95 via-white to-indigo-50/90 border-blue-300 ring-2 ring-blue-500/20'
        }`}>
          <div className="mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex h-3 w-3 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  providenciaAtiva ? 'bg-amber-400' : is50PercentReached ? 'bg-emerald-400' : 'bg-red-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  providenciaAtiva ? 'bg-amber-500' : is50PercentReached ? 'bg-emerald-500' : 'bg-red-500'
                }`}></span>
              </span>
              {providenciaAtiva ? (
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white bg-amber-500 shadow-xs flex items-center gap-1 animate-pulse">
                  <Zap className="w-3 h-3" />
                  {providenciaTipo === 'aula_dupla' ? '⚡ Aula Dupla • 2 Tempos' : '🔄 Substituição Docente'}
                </span>
              ) : (
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white shadow-xs ${
                  isPreLive ? 'bg-red-600 animate-pulse' : 'bg-red-600 animate-pulse'
                }`}>
                  {isPreLive ? `🔴 Sala Aberta • Inicia em ${minutesToStart} min` : '🔴 Aula Ao Vivo em Andamento'}
                </span>
              )}
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
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> {isPreLive ? 'Sala aberta com 15 min de antecedência' : 'Progresso de Duração da Aula em Andamento'}
              </span>
              <span className={`font-black px-2.5 py-0.5 rounded-md ${
                is50PercentReached 
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' 
                  : isPreLive
                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                  : 'bg-amber-100 text-amber-900 border border-amber-200'
              }`}>
                {isPreLive ? `Início oficial em ${minutesToStart} min` : `${progressPercent}% da aula percorrida`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3.5 overflow-hidden p-0.5 border border-gray-300/60 shadow-inner relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400/80 z-10"></div>
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ${
                  is50PercentReached 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                    : isPreLive
                    ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                    : 'bg-gradient-to-r from-amber-400 to-blue-500'
                }`}
                style={{ width: `${isPreLive ? 100 : progressPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="space-y-3">
            {activeLiveAula.google_meet_url && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-red-950 font-medium">
                  <span className="p-2 bg-red-600 text-white rounded-lg shrink-0">
                    <Video className="w-4 h-4" />
                  </span>
                  <div>
                    <strong className="block text-red-900">
                      {isPreLive ? 'Transmissão do Google Meet Liberada (15 min de antecedência)' : 'Transmissão do Google Meet em Andamento'}
                    </strong>
                    <span>
                      {isPreLive
                        ? 'Clique ao lado para ingressar na sala com antecedência para testar seu áudio/vídeo e aguardar a turma.'
                        : 'Clique ao lado para ingressar na sala da aula ao vivo com o docente e a turma.'}
                    </span>
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
                    className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
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
                        className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 text-center cursor-pointer"
                      >
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span>Preencher Lista de Presença (Google Forms)</span>
                      </a>
                      <button
                        onClick={() => handleCopyLink(activeLiveAula.attendance_form_url!, activeLiveAula.id)}
                        className="p-2.5 bg-emerald-200 hover:bg-emerald-300 text-emerald-900 font-bold text-xs rounded-xl transition flex items-center justify-center flex-shrink-0 cursor-pointer"
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
      );
    }
    if (nextAulaToday) {
      const isCancNext = isAulaCanceladaHoje(nextAulaToday.disciplina_id || nextAulaToday.id, nextAulaToday.disciplina_name, normalizedEmail);
      if (isCancNext) {
        return null;
      }

      return (
        <div className="p-5 bg-blue-50/90 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-blue-900 text-xs shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <strong>Próxima aula de hoje ({currentDayName}):</strong> {nextAulaToday.disciplina_name} ({nextAulaToday.professor_name}) às <strong>{nextAulaToday.start_time ? convertBRTToLocalTime(nextAulaToday.start_time) : ''} (Seu Horário)</strong>.
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
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Sala do Meet</span>
            </a>
          )}
        </div>
      );
    }

    if (classesFinishedToday) {
      return (
        <div className="p-4 sm:p-5 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <strong>As aulas de hoje ({currentDayName}) foram encerradas.</strong> O formulário oficial de presença esteve disponível durante a transmissão ao vivo. Confira a grade completa e links de apoio abaixo.
          </div>
        </div>
      );
    }

    if (!isClassDay) {
      return (
        <div className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl flex items-center gap-3 text-gray-600 text-xs shadow-sm">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <strong>Não há aulas síncronas programadas para hoje ({currentDayName}).</strong> Aproveite para revisar anotações no Caderno Cornell, assistir às gravações disponíveis e explorar os laboratórios práticos.
          </div>
        </div>
      );
    }

    return null;
  };

  // 5. Mural de Recursos e Leituras Pré-Aula (Accordion Inteligente & Destaque Dinâmico)
  const renderMuralRecursos = (isEmEvidencia: boolean = false) => {
    if (studentTurmaAnnouncements.length === 0) return null;

    // Se estiver no seu lugar normal (sem pendências) e estiver recolhido
    if (!isEmEvidencia && isMuralCollapsed) {
      return (
        <div data-tour="dashboard-mural" className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                  <span>Mural de Recursos & Leituras</span>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    ✨ Todas as leituras em dia
                  </span>
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {readAnnouncementsCount > 0
                  ? `Você já concluiu todas as ${readAnnouncementsCount} leituras indicadas. Clique para consultar o acervo arquivado ou rever textos.`
                  : 'Nenhuma leitura pendente no momento. Quando novos links forem publicados, eles aparecerão em destaque no topo.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setIsMuralCollapsed(false)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Ver Acervo & Concluídas ({studentTurmaAnnouncements.length})</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );
    }

    // Se estiver em evidência no topo mas o usuário clicou em recolher
    if (isEmEvidencia && isMuralCollapsed) {
      return (
        <div data-tour="dashboard-mural" className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 p-4 sm:p-5 rounded-2xl border-2 border-amber-400/80 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl font-black">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-600" />
                  📖 Leituras em Aberto ({pendingAnnouncementsCount})
                </span>
                <span className="text-xs text-amber-200 font-bold">
                  Você possui {pendingAnnouncementsCount} {pendingAnnouncementsCount === 1 ? 'leitura recomendada pendente' : 'leituras recomendadas pendentes'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Clique no botão ao lado para abrir e estudar os links indicados pelos professores.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMuralCollapsed(false)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
          >
            <span>Abrir Leituras Pendentes ({pendingAnnouncementsCount})</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div 
        data-tour="dashboard-mural" 
        className={`rounded-3xl p-5 sm:p-7 text-white shadow-xl transition-all space-y-4 animate-in fade-in duration-300 ${
          isEmEvidencia 
            ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border-2 border-amber-400/80 shadow-2xl ring-4 ring-amber-400/15'
            : 'bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 border border-blue-800/60'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl backdrop-blur-md ${
              isEmEvidencia 
                ? 'bg-amber-400 text-slate-950 shadow-md font-black' 
                : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
            }`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {isEmEvidencia ? (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                    Leituras em Aberto ({pendingAnnouncementsCount})
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold uppercase tracking-wide bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md">
                    Mural de Recursos
                  </span>
                )}
                <span className="text-xs text-blue-200">
                  {isEmEvidencia
                    ? 'Recomendado pelos seus professores para as próximas aulas'
                    : 'Links compartilhados em aula e leituras de apoio'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                {isEmEvidencia ? '📖 Links & Leituras Recomendadas para Estudo' : 'Links, Leituras e Recursos das Aulas'}
              </h3>
            </div>
          </div>

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
                  {pendingAnnouncementsCount}
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
                  {archivedAnnouncementsCount}
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
                  {readAnnouncementsCount}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsMuralCollapsed(true)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/15 transition flex items-center gap-1 cursor-pointer"
              title="Recolher visualização do mural"
            >
              <span>Recolher</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {(() => {
          const currentList = studentTurmaAnnouncements.filter((a) => {
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
                    ? 'Quando novos links ou artigos forem publicados pelos seus professores e monitores, eles aparecerão aqui em evidência no topo.'
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
                      <div className="flex items-center gap-2">
                        {isRead ? (
                          <button
                            onClick={() => handleUnmarkAnnouncementRead(av.id)}
                            className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-blue-200 font-bold text-xs rounded-xl border border-white/20 transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                            title="Retornar esta leitura para o feed de pendentes"
                          >
                            <ArchiveRestore className="w-3.5 h-3.5 text-blue-300" />
                            <span>Marcar como Não Lida (Retornar p/ Pendentes)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkAnnouncementRead(av.id)}
                            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                            title="Marcar como lida (sai do feed principal)"
                          >
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            <span>✓ Marcar como Lida</span>
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={av.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Ler Artigo / Acessar Link</span>
                        </a>

                        {av.file_url && (
                          <a
                            href={av.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={av.file_name || 'Arquivo_Complementar.pdf'}
                            className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                            title="Baixar arquivo / PDF anexo"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{av.file_name || 'Baixar PDF'}</span>
                          </a>
                        )}

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
  };

  const renderAulasGravadas = () => {
    if (gravacoes.length === 0) return null;

    if (isGravacoesCollapsed) {
      return (
        <div data-tour="aluno-gravacoes" className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 p-4 sm:p-5 rounded-2xl border border-red-900/40 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/30 text-red-400 border border-red-500/40 rounded-xl">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                  <span>Aulas Gravadas Disponíveis</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/30">
                    {gravacoes.length} {gravacoes.length === 1 ? 'aula' : 'aulas'}
                  </span>
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeLiveAula ? 'Recolhido para foco na aula ao vivo de hoje • Clique para assistir gravações anteriores.' : 'Assista às aulas ministradas em alta definição diretamente no seu dispositivo.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              onClick={handleForceSyncGravacoes}
              disabled={isSyncingGravacoes}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Sincronizar gravações da nuvem"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGravacoes ? 'animate-spin text-red-400' : ''}`} />
              <span className="hidden sm:inline">{isSyncingGravacoes ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsGravacoesCollapsed(false)}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Ver Gravações ({gravacoes.length})</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div data-tour="aluno-gravacoes" className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 p-4 sm:p-5 rounded-2xl border border-red-900/40 text-white shadow-md space-y-3 animate-in fade-in duration-200">
        <div className="flex items-center justify-between gap-2 flex-wrap border-b border-red-900/40 pb-3">
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

            <button
              type="button"
              onClick={() => setIsGravacoesCollapsed(true)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-white/15 transition flex items-center gap-1 cursor-pointer"
              title="Recolher gravações"
            >
              <span>Recolher</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
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
    );
  };

  // Card de Destaque da Biblioteca Digital Teológica
  const renderCardBibliotecaDigital = () => (
    <div
      data-tour="aluno-card-biblioteca"
      className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-4 sm:p-5 rounded-2xl border border-emerald-800/50 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition hover:border-emerald-500/60 animate-in fade-in"
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-xl shrink-0 shadow-xs">
          <BookOpen className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
              <span>Biblioteca Digital Teológica</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Acervo Completo
              </span>
            </h4>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Consulte livros teológicos, comentários exegéticos, léxicos e obras recomendadas pelos professores do seminário.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <button
          type="button"
          onClick={() => {
            if (onTabChange) {
              onTabChange('aluno-biblioteca');
            } else if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('lms_change_tab', { detail: { tab: 'aluno-biblioteca' } }));
              window.dispatchEvent(new CustomEvent('lms_change_tab', { detail: 'aluno-biblioteca' }));
            }
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
          title="Acessar o acervo de livros da Biblioteca Digital"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Acessar Biblioteca</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  const renderGradeAulas = () => (
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

        <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedWeekIndex(Math.max(0, selectedWeekIndex - 1))}
              disabled={selectedWeekIndex === 0}
              className="p-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            <button
              onClick={() => setSelectedWeekIndex(currentWeekIdx)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition shadow-sm cursor-pointer ${
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
              className="p-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center gap-1 shadow-sm cursor-pointer"
            >
              Próxima <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <select
              value={selectedWeekIndex}
              onChange={(e) => setSelectedWeekIndex(Number(e.target.value))}
              className="w-full sm:w-auto p-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-blue-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
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

      {daysOfWeek.map((day) => {
        const aulasDoDia = studentAulas.filter((a) => a.day_of_week === day);
        if (aulasDoDia.length === 0) return null;

        const dateForDay = getDateForLesson(selectedWeekIndex, day);
        const isToday = selectedWeekIndex === currentWeekIdx && day === currentDayOfWeekName;
        const isPastDay = selectedWeekIndex === currentWeekIdx && currentDayOfWeekName && baseDays.indexOf(day) < baseDays.indexOf(currentDayOfWeekName);

        return (
          <div key={day} className={`space-y-3 ${isToday ? 'p-3.5 bg-blue-50/50 rounded-3xl border-2 border-blue-400 shadow-md' : ''}`}>
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
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            {aulaCode}
                          </span>

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
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : currentStatus === 'reposicao'
                                      ? 'bg-purple-100 text-purple-900 border-purple-300'
                                      : currentStatus === 'nao_houve'
                                      ? 'bg-gray-200 text-gray-800 border-gray-300'
                                      : 'bg-amber-100 text-amber-900 border-amber-300'
                                  }`}
                                >
                                  <option value="presente">🟢 Presente na Aula</option>
                                  <option value="reposicao">🟣 Reposição de Aula</option>
                                  <option value="nao_houve">⚪ Não Houve Aula</option>
                                  <option value="pendente">🟡 Pendente</option>
                                </select>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Botão de Reposição */}
                        <button
                          type="button"
                          onClick={() => handleCreateReposicaoRelatorio(aula, dateForDay)}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Registrar Relatório de Reposição para esta aula"
                        >
                          <FileText className="w-3 h-3 text-purple-600" />
                          <span>Reposição</span>
                        </button>
                      </div>

                      <h4 className="font-black text-base text-gray-900 leading-snug">
                        {aula.disciplina_name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Professor(a): <strong>{aula.professor_name || (aula as any).professor || 'Corpo Docente'}</strong>
                      </p>

                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 flex-wrap">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {timeLocalStr}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          (Base Brasília: {aula.start_time} – {aula.end_time} BRT)
                        </span>
                      </div>
                    </div>

                    {/* Botões de Ação do Card */}
                    <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* 1. Caderno Cornell com IA */}
                        <button
                          type="button"
                          onClick={() => handleOpenOrCreateCornellForLesson(aula, dateForDay)}
                          className="py-2 px-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
                          title="Abrir ou criar anotação no método Cornell com inteligência artificial"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Caderno Cornell IA</span>
                        </button>

                        {/* 2. Gravação de Aula se disponível */}
                        {(() => {
                          const cleanTarget = (aula.disciplina_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                          const isDisc9 = aula.disciplina_id === 'disc-9' || cleanTarget.includes('afro') || cleanTarget.includes('culturaafro');

                          // Gravações da disciplina
                          const discGravacoes = gravacoes.filter(
                            (g) =>
                              (g.disciplina_id && aula.disciplina_id && g.disciplina_id === aula.disciplina_id) ||
                              g.disciplina_name.toLowerCase().trim() === aula.disciplina_name.toLowerCase().trim() ||
                              (cleanTarget && g.disciplina_name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanTarget)) ||
                              (isDisc9 && (g.disciplina_id === 'disc-9' || g.disciplina_name.toLowerCase().includes('afro')))
                          );

                          // Busca por data exata
                          let matchingGravacao = discGravacoes.find((g) => g.data_aula === dateForDay);

                          // Lógica especial modular para História Afro (4 aulas distribuídas nas sextas do semestre)
                          if (!matchingGravacao && isDisc9 && discGravacoes.length > 0) {
                            if (dateForDay === '14/08/2026') matchingGravacao = discGravacoes.find((g) => g.aula_num === 1);
                            else if (dateForDay === '21/08/2026') matchingGravacao = discGravacoes.find((g) => g.aula_num === 2);
                            else if (dateForDay === '28/08/2026') matchingGravacao = discGravacoes.find((g) => g.aula_num === 3);
                            else if (dateForDay === '04/09/2026') matchingGravacao = discGravacoes.find((g) => g.aula_num === 4);
                            else {
                              // Semana 5 (11/09/2026) em diante: módulo completo disponível (mostra Aula 4 com avaliação)
                              matchingGravacao = discGravacoes.find((g) => g.aula_num === 4) || discGravacoes[discGravacoes.length - 1];
                            }
                          }

                          if (!matchingGravacao && discGravacoes.length > 0) {
                            matchingGravacao = discGravacoes[0];
                          }

                          if (!matchingGravacao) {
                            return (
                              <button
                                type="button"
                                disabled
                                className="py-2 px-2.5 bg-gray-100 text-gray-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 cursor-not-allowed"
                                title="Gravação desta aula ainda não disponível"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Sem Gravação</span>
                              </button>
                            );
                          }

                          const buttonLabel = matchingGravacao.aula_num
                            ? `Aula ${matchingGravacao.aula_num} (HD)`
                            : 'Aula Gravada (HD)';

                          return (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveVideoModal({
                                  isOpen: true,
                                  title: matchingGravacao.title,
                                  videoUrl: matchingGravacao.video_url,
                                  disciplinaName: aula.disciplina_name,
                                  aulaNum: matchingGravacao.aula_num,
                                  allAulas: discGravacoes.length > 1
                                    ? discGravacoes.map((g) => ({
                                        aulaNum: g.aula_num,
                                        title: g.title,
                                        videoUrl: g.video_url,
                                      }))
                                    : undefined,
                                });
                              }}
                              className="py-2 px-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer"
                              title={`Assistir ${matchingGravacao.title} no Player Seguro do LMS`}
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>{buttonLabel}</span>
                            </button>
                          );
                        })()}

                        {/* 3. Materiais de Apoio & Gemini */}
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

                        {/* 4. Botão AV1 com Data */}
                        <button
                          onClick={() => setSelectedAvaliacao({
                            title: `AV1: ${aula.disciplina_name}`,
                            tipo: 'AV1',
                            data: datas.av1,
                            disciplina: aula.disciplina_name
                          })}
                          className="py-2 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition cursor-pointer"
                          title={`Ver Avaliação AV1 (${datas.av1})`}
                        >
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          <span>AV1 ({datas.av1})</span>
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
                        className="mt-2 w-full py-2 px-3 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer border border-blue-800/40"
                      >
                        <Layers className="w-3.5 h-3.5 text-amber-300" />
                        <span>Ver Página Completa da Matéria (Livros & Gemini IA) ➔</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* BANNER DE AVISO OFICIAL: AULAS CANCELADAS HOJE */}
      {renderAulasCanceladas()}

      {/* 1. CARD PRINCIPAL UNIFICADO: PAINEL ACADÊMICO DO ALUNO (COM PERÍODO, TURMA, SEMESTRE E FUSO) */}
      {renderUnifiedHeader()}

      {/* 2. LEMBRETE DE ATUALIZAÇÃO CADASTRO (CASO O ALUNO TENHA CLICADO EM 'LEMBRAR DEPOIS') */}
      {renderProfileReminder()}

      {/* 3. QUADRO DE AULA AO VIVO OU PRÓXIMA AULA (DESTAQUE MÁXIMO EM PRIMEIRO LUGAR) */}
      {renderAulaAoVivoOuProxima()}

      {/* 4. SE HOUVER LEITURAS EM ABERTO: CARD EM EVIDÊNCIA MÁXIMA NO TOPO (LOGO APÓS AULA AO VIVO) */}
      {pendingAnnouncementsCount > 0 && (
        <div className="animate-in fade-in slide-in-from-top-3 duration-300">
          {renderMuralRecursos(true)}
        </div>
      )}

      {/* 5. SEÇÕES PRINCIPAIS (REORDENAÇÃO INTELIGENTE CONFORME HORÁRIO DE AULA) */}
      {activeLiveAula ? (
        <>
          {/* GRADE DE AULAS NO TOPO DURANTE A AULA OU 15 MIN ANTES */}
          {renderGradeAulas()}

          {/* MURAL QUANDO TODAS ESTIVEREM LIDAS FICA APÓS A GRADE */}
          {pendingAnnouncementsCount === 0 && renderMuralRecursos(false)}

          {renderAulasGravadas()}

          {/* CARD DA BIBLIOTECA DIGITAL TEOLÓGICA */}
          {renderCardBibliotecaDigital()}

          {renderCardsMetodologias(true)}
        </>
      ) : (
        <>
          {/* FORA DA AULA AO VIVO (QUANDO AS AULAS TERMINAREM NO DIA, INTERVALOS OU DIAS SEM AULA):
              OS CARDS VOLTAM A SER APRESENTADOS NO TOPO, ANTES DA GRADE DE AULAS! */}

          {/* MURAL DE RECURSOS (SOMENTE QUANDO TODAS ESTIVEREM LIDAS OU RECOLHIDO, POIS SE HOUVER PENDENTES JÁ ESTÁ NO TOPO NO ITEM 4) */}
          {pendingAnnouncementsCount === 0 && renderMuralRecursos(false)}

          {/* 2. AULAS GRAVADAS DISPONÍVEIS */}
          {renderAulasGravadas()}

          {/* CARD DA BIBLIOTECA DIGITAL TEOLÓGICA */}
          {renderCardBibliotecaDigital()}

          {/* 3. MODO DE ESTUDO ENTRE AS AULAS ONLINE (LABORATÓRIOS DE PRÁTICA PASTORAL, HOMILÉTICA & 3D) */}
          {renderCardsMetodologias(false)}

          {/* 4. GRADE DE AULAS & MEU CADERNO DE ESTUDOS */}
          {renderGradeAulas()}
        </>
      )}

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

            <div className="p-6 space-y-4 bg-white max-h-[80vh] overflow-y-auto">
              {selectedAvaliacao.disciplina.toLowerCase().includes('direitos humanos') && selectedAvaliacao.tipo === 'AV1' ? (
                <div className="space-y-4">
                  {/* Banner de Destaque com Valor e Prazo */}
                  <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs space-y-2">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="font-extrabold text-sm text-amber-900 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-amber-600" />
                        Trabalho para Composição de Nota (AV1)
                      </span>
                      <span className="px-2.5 py-1 bg-amber-600 text-white font-black text-xs rounded-lg shadow-xs">
                        Valor: 02 Pontos na AV01
                      </span>
                    </div>
                    <p className="text-amber-900 leading-relaxed font-medium">
                      A nota da AV1 é composta por: <strong>Prova Objetiva Forms (08 pontos)</strong> + <strong>Trabalho de Dissertação Individual (02 pontos)</strong>.
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-amber-200 text-xs font-bold text-amber-950">
                      <span>Data Final Improrrogável:</span>
                      <span className="px-2 py-0.5 bg-white border border-amber-300 rounded text-red-700 font-black">
                        🗓️ 30/09/2026
                      </span>
                    </div>
                  </div>

                  {/* Diretrizes Oficiais do Trabalho (Slide 15 - Aula 3) */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                      Regras de Elaboração da Dissertação
                    </h4>

                    <div className="space-y-2 text-xs text-slate-800">
                      <p className="p-2.5 bg-white rounded-lg border border-slate-200 leading-relaxed">
                        ✍️ <strong>Extensão Máxima:</strong> Redigir uma dissertação de, <strong>no máximo, uma lauda</strong>.
                      </p>

                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5">
                        <p className="font-bold text-slate-900">
                          🎯 Tema:
                        </p>
                        <p className="text-slate-700 italic">
                          "Desigualdade social e privilégios conforme trabalhado no vídeo da aula do dia 26/09/2026."
                        </p>
                        <p className="font-semibold text-blue-900 pt-1">
                          Discutir no texto a importância da igreja como agente de transformação social.
                        </p>
                      </div>

                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
                        <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                          <span className="block text-slate-500 text-[10px]">Fonte</span>
                          Times New Roman
                        </div>
                        <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                          <span className="block text-slate-500 text-[10px]">Tamanho</span>
                          12
                        </div>
                        <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                          <span className="block text-slate-500 text-[10px]">Espaçamento</span>
                          1,5
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instruções de Envio por E-mail */}
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 space-y-2.5 text-xs">
                    <h5 className="font-bold text-blue-950 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      Instruções de Envio por E-mail
                    </h5>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-200">
                        <div>
                          <span className="text-[10px] text-gray-500 block">Enviar para o endereço de e-mail:</span>
                          <span className="font-mono font-bold text-blue-900">cleitonpb@gmail.com</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('cleitonpb@gmail.com');
                            setCopiedId('email-cleiton');
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === 'email-cleiton' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === 'email-cleiton' ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-200">
                        <div>
                          <span className="text-[10px] text-gray-500 block">Preencher no campo Assunto:</span>
                          <span className="font-semibold text-gray-900">“Trabalho para composição de nota”</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('Trabalho para composição de nota');
                            setCopiedId('assunto-trabalho');
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === 'assunto-trabalho' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === 'assunto-trabalho' ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    <a
                      href="mailto:cleitonpb@gmail.com?subject=Trabalho%20para%20composi%C3%A7%C3%A3o%20de%20nota"
                      className="mt-2 w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Abrir E-mail Pré-Formatado para o Professor</span>
                    </a>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}

              <button
                onClick={() => setSelectedAvaliacao(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
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
        allAulas={activeVideoModal.allAulas}
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
