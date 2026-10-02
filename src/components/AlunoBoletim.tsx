'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  GraduationCap, Printer, Award, CheckCircle2, 
  AlertCircle, BookOpen, Clock, Calendar, RefreshCw, 
  MessageSquare, ShieldCheck, ChevronRight, Sparkles, ArrowRight,
  SlidersHorizontal, Check, X, Filter, Settings, BookCheck, RotateCcw
} from 'lucide-react';
import { 
  getDisciplinasForStudent, 
  getAllDisciplinas, 
  getDisciplinaTurmaIdx,
  getDisciplinasByTurmaFromService 
} from '@/services/disciplinasService';
import { 
  getGradesForStudent, 
  calculateGradeResult, 
  normalizeEmail 
} from '@/services/gradesService';
import { savePortalProfile } from '@/services/studentSyncService';
import { Disciplina, StudentGradeRecord } from '@/types';
import { getAuthorizedUserInfo, INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';

interface AlunoBoletimProps {
  userEmail?: string;
  onTabChange?: (tab: string) => void;
}

interface StudentProfileState {
  turmaIdx: number;
  periodoNum: number;
  turmaNome?: string;
  name?: string;
  customDisciplinas?: string[];
}

const TURMA_LABELS: Record<number, string> = {
  0: 'Fim de Semana (5º Período)',
  1: 'Turma A (7º Período)',
  2: 'Turma B (3º Período)',
  3: 'Curso Básico de Teologia',
};

const TURMA_DESCRIPTIONS: Record<number, string> = {
  0: 'Aulas Sexta (19h-22h) e Sábado (07h-16h) • 5º Período',
  1: 'Semanal Noturno (Terça a Sexta 19h-22h) • 7º Período',
  2: 'Semanal Noturno (Terça a Sexta 19h-22h) • 3º Período',
  3: 'Semanal Noturno (Segunda e Quarta 19h-22h) • Formação Básica',
};

function getStoredStudentProfile(normalizedEmail: string): StudentProfileState {
  let initialT = 1;
  let initialP = 7;
  let turmaNome = 'Turma A (7º Período)';
  let customDisciplinas: string[] | undefined = undefined;

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
        if (parsed.turmaIdx !== undefined) initialT = Number(parsed.turmaIdx);
        if (parsed.periodoNum !== undefined) initialP = Number(parsed.periodoNum);
        if (parsed.turmaNome) turmaNome = parsed.turmaNome;
        if (Array.isArray(parsed.customDisciplinas) && parsed.customDisciplinas.length > 0) {
          customDisciplinas = parsed.customDisciplinas;
        } else if (Array.isArray(parsed.enrolledDisciplinas) && parsed.enrolledDisciplinas.length > 0) {
          customDisciplinas = parsed.enrolledDisciplinas;
        }
      }
      const portalStored = localStorage.getItem(`lms_user_portal_profile_${normalizedEmail}`);
      if (portalStored) {
        const parsed = JSON.parse(portalStored);
        if (parsed.turmaIdx !== undefined && stored === null) initialT = Number(parsed.turmaIdx);
        if (!customDisciplinas) {
          if (Array.isArray(parsed.customDisciplinas) && parsed.customDisciplinas.length > 0) {
            customDisciplinas = parsed.customDisciplinas;
          } else if (Array.isArray(parsed.enrolledDisciplinas) && parsed.enrolledDisciplinas.length > 0) {
            customDisciplinas = parsed.enrolledDisciplinas;
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao ler perfil do aluno:', e);
    }
  }

  return {
    turmaIdx: initialT,
    periodoNum: initialP,
    turmaNome,
    name: authUser?.name,
    customDisciplinas,
  };
}

export const AlunoBoletim: React.FC<AlunoBoletimProps> = ({ userEmail, onTabChange }) => {
  const normalizedEmail = normalizeEmail(userEmail || 'sacrasub@gmail.com');
  const userInfo = useMemo(() => getAuthorizedUserInfo(normalizedEmail), [normalizedEmail]);

  const [studentProfile, setStudentProfile] = useState<StudentProfileState>(() => getStoredStudentProfile(normalizedEmail));
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [allSystemDisciplinas, setAllSystemDisciplinas] = useState<Disciplina[]>([]);
  const [gradesMap, setGradesMap] = useState<Record<string, StudentGradeRecord>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados do Modal de Configuração Individual de Matérias
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [modalTurmaIdx, setModalTurmaIdx] = useState<number>(studentProfile.turmaIdx);
  const [modalSelectedDiscIds, setModalSelectedDiscIds] = useState<string[]>([]);
  const [showOtherTurmasDisciplinas, setShowOtherTurmasDisciplinas] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Carrega lista de disciplinas e notas do aluno respeitando o perfil individual
  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const allDisc = getAllDisciplinas();
      setAllSystemDisciplinas(allDisc);

      const profile = getStoredStudentProfile(normalizedEmail);
      setStudentProfile(profile);

      // Carrega estritamente as matérias configuradas no perfil individual do aluno
      const studentDisc = getDisciplinasForStudent(normalizedEmail);
      setDisciplinas(studentDisc);

      const grades = await getGradesForStudent(normalizedEmail);
      setGradesMap(grades);
    } catch (e) {
      console.warn('Erro ao carregar dados do boletim:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [normalizedEmail]);

  useEffect(() => {
    loadData();

    // Listener para atualização de notas em tempo real
    const handleGradesUpdate = () => {
      getGradesForStudent(normalizedEmail).then(setGradesMap);
    };

    // Listener para atualizações de perfil (troca de turma ou matérias)
    const handleProfileUpdate = () => {
      loadData();
    };

    // Listener para atualização nas disciplinas globais do sistema
    const handleDiscUpdate = () => {
      loadData();
    };

    window.addEventListener('lms_grades_updated', handleGradesUpdate);
    window.addEventListener('lms_student_sync_updated', handleProfileUpdate);
    window.addEventListener('lms_profile_confirmed', handleProfileUpdate);
    window.addEventListener('lms_disciplinas_updated', handleDiscUpdate);

    return () => {
      window.removeEventListener('lms_grades_updated', handleGradesUpdate);
      window.removeEventListener('lms_student_sync_updated', handleProfileUpdate);
      window.removeEventListener('lms_profile_confirmed', handleProfileUpdate);
      window.removeEventListener('lms_disciplinas_updated', handleDiscUpdate);
    };
  }, [loadData, normalizedEmail]);

  // Abre modal de configuração com os dados atuais do perfil
  const handleOpenConfigModal = () => {
    const profile = getStoredStudentProfile(normalizedEmail);
    setModalTurmaIdx(profile.turmaIdx);
    
    if (profile.customDisciplinas && profile.customDisciplinas.length > 0) {
      setModalSelectedDiscIds([...profile.customDisciplinas]);
    } else {
      // Se não há personalização estrita, seleciona todas as matérias da turma configurada
      const turmaDiscs = getDisciplinasByTurmaFromService(profile.turmaIdx);
      setModalSelectedDiscIds(turmaDiscs.map((d) => d.id));
    }
    setShowOtherTurmasDisciplinas(false);
    setIsConfigModalOpen(true);
  };

  // Ao trocar de turma no modal, atualiza a seleção padrão
  const handleModalTurmaChange = (newTurma: number) => {
    setModalTurmaIdx(newTurma);
    const turmaDiscs = getDisciplinasByTurmaFromService(newTurma);
    setModalSelectedDiscIds(turmaDiscs.map((d) => d.id));
  };

  // Alterna uma disciplina específica no modal
  const handleToggleDiscSelection = (discId: string) => {
    setModalSelectedDiscIds((prev) => {
      if (prev.includes(discId)) {
        return prev.filter((id) => id !== discId);
      } else {
        return [...prev, discId];
      }
    });
  };

  // Restaura padrão oficial da turma
  const handleRestoreTurmaDefaults = () => {
    const turmaDiscs = getDisciplinasByTurmaFromService(modalTurmaIdx);
    setModalSelectedDiscIds(turmaDiscs.map((d) => d.id));
  };

  // Salva configuração de matérias no perfil do aluno
  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const turmaDiscs = getDisciplinasByTurmaFromService(modalTurmaIdx);
      const isDefaultSelection = 
        modalSelectedDiscIds.length === turmaDiscs.length &&
        modalSelectedDiscIds.every((id) => turmaDiscs.some((d) => d.id === id));

      // Se for a seleção padrão completa da turma, limpamos customDisciplinas para herdar diretamente
      const customDisciplinas = isDefaultSelection ? undefined : modalSelectedDiscIds;

      const pNum = modalTurmaIdx === 0 ? 5 : modalTurmaIdx === 1 ? 7 : modalTurmaIdx === 2 ? 3 : 0;
      const turmaNome = TURMA_LABELS[modalTurmaIdx] || `Turma ${modalTurmaIdx}`;

      let existingProfile: any = {};
      try {
        const stored = localStorage.getItem(`lms_profile_${normalizedEmail}`);
        if (stored) existingProfile = JSON.parse(stored);
      } catch (e) {}

      const updatedProfile = {
        ...existingProfile,
        turmaIdx: modalTurmaIdx,
        periodoNum: pNum,
        turmaNome,
        customDisciplinas,
      };

      if (!customDisciplinas) {
        delete updatedProfile.customDisciplinas;
      }

      // Salva no localStorage e nuvem via studentSyncService
      await savePortalProfile(normalizedEmail, updatedProfile);

      setStudentProfile({
        turmaIdx: modalTurmaIdx,
        periodoNum: pNum,
        turmaNome,
        name: userInfo.user?.name,
        customDisciplinas,
      });

      setIsConfigModalOpen(false);
      await loadData();
    } catch (e) {
      console.error('Erro ao salvar configuração de matérias:', e);
    } finally {
      setSavingConfig(false);
    }
  };

  // Estatísticas Globais do Boletim (computadas estritamente com base nas matérias do aluno)
  const studentMetrics = useMemo(() => {
    const totalDisc = disciplinas.length;
    let sumMedia = 0;
    let countComMedia = 0;
    let aprovadas = 0;
    let emRecuperacao = 0;
    let reprovadas = 0;
    let totalFaltas = 0;

    disciplinas.forEach((d) => {
      const g = gradesMap[d.id];
      const res = calculateGradeResult(g);
      totalFaltas += Number(g?.faltas || 0);

      if (res.media !== null) {
        sumMedia += res.media;
        countComMedia++;
      }

      if (res.situacao === 'Aprovado') aprovadas++;
      else if (res.situacao === 'Em Recuperação') emRecuperacao++;
      else if (res.situacao === 'Reprovado' || res.situacao === 'Reprovado por Faltas') reprovadas++;
    });

    const mediaGeral = countComMedia > 0 ? (sumMedia / countComMedia).toFixed(1) : '-';
    // Frequência global estimada (16 aulas por matéria)
    const totalAulasSemestre = totalDisc * 16;
    const frequenciaPerc = totalAulasSemestre > 0 
      ? Math.max(0, Math.round(((totalAulasSemestre - totalFaltas) / totalAulasSemestre) * 100))
      : 100;

    return {
      totalDisc,
      mediaGeral,
      aprovadas,
      emRecuperacao,
      reprovadas,
      totalFaltas,
      frequenciaPerc,
      countComMedia,
    };
  }, [disciplinas, gradesMap]);

  const handlePrint = () => {
    window.print();
  };

  const studentTurmaLabel = TURMA_LABELS[studentProfile.turmaIdx] || studentProfile.turmaNome || 'Turma A (7º Período)';

  return (
    <div className="space-y-6">
      {/* CABEÇALHO DO BOLETIM */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:border-none print:shadow-none print:p-0">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/20 print:hidden">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Boletim Acadêmico Oficial
              </h2>
              <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Semestre 2026.2
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Seminário Teológico Koinonia • Curso Básico / Bacharelado em Teologia
            </p>
          </div>
        </div>

        {/* Ações / Botões */}
        <div className="flex items-center gap-2 flex-wrap print:hidden">
          {/* Botão de Configurar Matérias do Perfil */}
          <button
            onClick={handleOpenConfigModal}
            className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Personalizar matérias e turma configuradas no perfil"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Matérias do Perfil</span>
          </button>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            title="Atualizar notas da nuvem"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5 cursor-pointer"
            title="Imprimir boletim oficial ou salvar em PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Boletim</span>
          </button>
        </div>
      </div>

      {/* DADOS INSTITUCIONAIS DO ALUNO (Visível na impressão e na tela) */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg print:bg-white print:text-black print:border print:border-slate-300 print:shadow-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 print:text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              Aluno Matriculado
            </span>
            <div className="text-sm font-extrabold text-white print:text-black mt-0.5">
              {userInfo.user?.name || studentProfile.name || 'Aluno Koinonia'}
            </div>
          </div>
          <div>
            <span className="text-slate-400 print:text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              E-mail Institucional
            </span>
            <div className="text-sm font-medium text-slate-200 print:text-black mt-0.5 truncate">
              {normalizedEmail}
            </div>
          </div>
          <div>
            <span className="text-slate-400 print:text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              Turma & Período
            </span>
            <div className="text-sm font-extrabold text-white print:text-black mt-0.5">
              {studentTurmaLabel} • Semestre 2026.2
            </div>
            {studentProfile.customDisciplinas && studentProfile.customDisciplinas.length > 0 && (
              <span className="text-[10px] text-indigo-300 font-medium block mt-0.5 print:hidden">
                Personalizado ({disciplinas.length} matérias no perfil)
              </span>
            )}
          </div>
          <div>
            <span className="text-slate-400 print:text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              Situação da Matrícula
            </span>
            <div className="text-sm font-bold text-emerald-400 print:text-emerald-700 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Matrícula Ativa & Regular</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI CARDS (MÉTRICAS DO SEMESTRE) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500">Média Geral</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {studentMetrics.mediaGeral}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {studentMetrics.countComMedia > 0 ? `${studentMetrics.countComMedia} de ${studentMetrics.totalDisc} avaliadas` : 'Em andamento'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-700">Aprovadas</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {studentMetrics.aprovadas}
          </div>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">
            Média $\ge$ 7.0
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] uppercase font-bold text-amber-700">Em Recuperação</span>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {studentMetrics.emRecuperacao}
          </div>
          <span className="text-[10px] text-amber-600 mt-0.5 block">
            Média entre 5.0 e 6.9
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500">Frequência Geral</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {studentMetrics.frequenciaPerc}%
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {studentMetrics.totalFaltas} faltas registradas
          </span>
        </div>
      </div>

      {/* TABELA DETALHADA DAS DISCIPLINAS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Extrato de Notas & Frequência por Matéria
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Exibindo <strong>{disciplinas.length} matérias</strong> configuradas no perfil individual do aluno ({studentTurmaLabel})
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Critério: Média $\ge$ 7.0 e máx. 4 faltas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="p-3.5">Disciplina & Docente</th>
                <th className="p-3.5 w-20 text-center">AV1</th>
                <th className="p-3.5 w-20 text-center">AV2</th>
                <th className="p-3.5 w-20 text-center">Trabalho</th>
                <th className="p-3.5 w-20 text-center">Recup.</th>
                <th className="p-3.5 w-28 text-center">Faltas (Máx 4)</th>
                <th className="p-3.5 w-24 text-center">Média Final</th>
                <th className="p-3.5 w-36 text-center">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {disciplinas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium space-y-3">
                    <p>Nenhuma disciplina configurada para o seu perfil no semestre.</p>
                    <button
                      onClick={handleOpenConfigModal}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                    >
                      Configurar Matérias do Meu Perfil
                    </button>
                  </td>
                </tr>
              ) : (
                disciplinas.map((disc) => {
                  const grade = gradesMap[disc.id];
                  const res = calculateGradeResult(grade);
                  const faltas = Number(grade?.faltas || 0);

                  return (
                    <React.Fragment key={disc.id}>
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 text-xs">{disc.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Profº {disc.professor_name || 'Corpo Docente'} • {disc.day_of_week}
                          </div>
                        </td>

                        {/* AV1 */}
                        <td className="p-3.5 text-center font-bold text-slate-800">
                          {grade?.av1 !== null && grade?.av1 !== undefined ? Number(grade.av1).toFixed(1) : '-'}
                        </td>

                        {/* AV2 */}
                        <td className="p-3.5 text-center font-bold text-slate-800">
                          {grade?.av2 !== null && grade?.av2 !== undefined ? Number(grade.av2).toFixed(1) : '-'}
                        </td>

                        {/* Trabalho */}
                        <td className="p-3.5 text-center font-bold text-slate-800">
                          {grade?.trabalho !== null && grade?.trabalho !== undefined ? Number(grade.trabalho).toFixed(1) : '-'}
                        </td>

                        {/* Recuperação */}
                        <td className="p-3.5 text-center font-bold text-amber-800">
                          {grade?.recuperacao !== null && grade?.recuperacao !== undefined ? Number(grade.recuperacao).toFixed(1) : '-'}
                        </td>

                        {/* Faltas com barra visual */}
                        <td className="p-3.5 text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className={`font-bold text-xs ${faltas > 4 ? 'text-rose-600' : 'text-slate-700'}`}>
                              {faltas} de 4
                            </span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  faltas > 4 ? 'bg-rose-500' : faltas >= 3 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, (faltas / 4) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Média */}
                        <td className="p-3.5 text-center font-black text-slate-900 text-sm">
                          {res.mediaDisplay}
                        </td>

                        {/* Situação */}
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] border inline-block ${res.badgeBg}`}>
                            {res.situacao}
                          </span>
                        </td>
                      </tr>

                      {/* Observação / Feedback do Professor (se existir) */}
                      {grade?.observacoes && (
                        <tr className="bg-indigo-50/40 border-b border-indigo-100/60">
                          <td colSpan={8} className="p-3 pl-6 text-xs text-indigo-950">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                              <div>
                                <span className="font-bold text-indigo-900">Feedback do Professor: </span>
                                <span className="italic text-indigo-800">"{grade.observacoes}"</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGRAS & CRITÉRIOS DE AVALIAÇÃO */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 text-xs text-slate-600 space-y-2 print:border-none">
        <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
          <AlertCircle className="w-4 h-4 text-slate-500" />
          Critérios do Regimento Acadêmico do Seminário Koinonia
        </h4>
        <ul className="list-disc list-inside space-y-1 text-slate-500 text-[11px] pl-1">
          <li><strong>Aprovação Direta</strong>: Média semestral igual ou superior a 7.0 (sete vírgula zero).</li>
          <li><strong>Exame de Recuperação</strong>: Alunos com média entre 5.0 e 6.9 têm direito à prova de recuperação.</li>
          <li><strong>Limite de Faltas</strong>: Permitido o máximo de 4 faltas por matéria durante as 16 semanas do semestre letivo (frequência mínima de 75%).</li>
        </ul>
      </div>

      {/* RODAPÉ INSTITUCIONAL DE IMPRESSÃO */}
      <div className="hidden print:block pt-12 border-t border-slate-300 mt-8 text-center text-xs text-slate-600">
        <div className="flex justify-between items-center px-12 pt-8">
          <div className="text-center w-64 border-t border-slate-400 pt-1">
            <p className="font-bold text-slate-800">Coordenação Pedagógica</p>
            <p className="text-[10px] text-slate-500">Seminário Teológico Koinonia</p>
          </div>
          <div className="text-center w-64 border-t border-slate-400 pt-1">
            <p className="font-bold text-slate-800">Secretaria Acadêmica</p>
            <p className="text-[10px] text-slate-500">Documento Oficial Expedido</p>
          </div>
        </div>
        <p className="text-[9px] text-slate-400 mt-6">
          Emitido via Sistema Koinonia LMS em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}.
        </p>
      </div>

      {/* ======================================================== */}
      {/* MODAL: CONFIGURAÇÃO INDIVIDUAL DE MATÉRIAS DO PERFIL */}
      {/* ======================================================== */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho do Modal */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/20">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Configurar Matérias do Aluno
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Defina a turma principal e selecione quais matérias compõem o seu boletim oficial
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
              {/* Seletor de Turma Principal */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Turma Oficial Vinculada
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { idx: 1, title: 'Turma A (7º Período)', sub: 'Semanal Noturno • 9 matérias' },
                    { idx: 2, title: 'Turma B (3º Período)', sub: 'Semanal Noturno • 9 matérias' },
                    { idx: 0, title: 'Fim de Semana (5º Período)', sub: 'Sexta e Sábado • 5 matérias' },
                    { idx: 3, title: 'Curso Básico de Teologia', sub: 'Segunda e Quarta • 4 matérias' },
                  ].map((t) => (
                    <button
                      key={t.idx}
                      type="button"
                      onClick={() => handleModalTurmaChange(t.idx)}
                      className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                        modalTurmaIdx === t.idx
                          ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className={`text-xs font-extrabold ${modalTurmaIdx === t.idx ? 'text-indigo-950' : 'text-slate-800'}`}>
                          {t.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{t.sub}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        modalTurmaIdx === t.idx
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}>
                        {modalTurmaIdx === t.idx && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Matérias Selecionadas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                      Matérias Matriculadas no Boletim
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {modalSelectedDiscIds.length} matéria(s) selecionada(s)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRestoreTurmaDefaults}
                      className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-50 rounded-lg transition border border-indigo-200 flex items-center gap-1 cursor-pointer"
                      title="Selecionar todas as matérias padrão da turma"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Padrão da Turma</span>
                    </button>
                  </div>
                </div>

                {/* Grid com Matérias da Turma Atual */}
                <div className="space-y-2 max-h-64 overflow-y-auto p-1 pr-2">
                  {allSystemDisciplinas
                    .filter((d) => getDisciplinaTurmaIdx(d) === modalTurmaIdx)
                    .map((disc) => {
                      const isSelected = modalSelectedDiscIds.includes(disc.id);
                      return (
                        <div
                          key={disc.id}
                          onClick={() => handleToggleDiscSelection(disc.id)}
                          className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50/50 border-indigo-300'
                              : 'bg-white border-slate-200 hover:border-slate-300 opacity-70'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">{disc.name}</div>
                              <div className="text-[11px] text-slate-500">
                                {disc.code} • Profº {disc.professor_name} • {disc.day_of_week}
                              </div>
                            </div>
                          </div>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            isSelected ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {isSelected ? 'No Boletim' : 'Não Selecionada'}
                          </span>
                        </div>
                      );
                    })}
                </div>

                {/* Opção para incluir matérias de outras turmas (caso seja dependência ou eletiva) */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowOtherTurmasDisciplinas(!showOtherTurmasDisciplinas)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showOtherTurmasDisciplinas ? 'Ocultar matérias de outros períodos' : '+ Adicionar matérias avulsas / dependências de outras turmas'}</span>
                  </button>

                  {showOtherTurmasDisciplinas && (
                    <div className="mt-3 space-y-2 max-h-48 overflow-y-auto p-1 pr-2 bg-slate-50/50 rounded-2xl p-3 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Outras matérias do seminário (Todas as turmas):
                      </span>
                      {allSystemDisciplinas
                        .filter((d) => getDisciplinaTurmaIdx(d) !== modalTurmaIdx)
                        .map((disc) => {
                          const isSelected = modalSelectedDiscIds.includes(disc.id);
                          const discTurmaLabel = TURMA_LABELS[getDisciplinaTurmaIdx(disc)] || 'Outra Turma';
                          return (
                            <div
                              key={disc.id}
                              onClick={() => handleToggleDiscSelection(disc.id)}
                              className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2 cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-50/80 border-indigo-400'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}>
                                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-800">{disc.name}</div>
                                  <div className="text-[10px] text-slate-500">
                                    {discTurmaLabel} • Profº {disc.professor_name}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {disc.code}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rodapé de Ações do Modal */}
            <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={savingConfig || modalSelectedDiscIds.length === 0}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {savingConfig ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Salvar no Meu Perfil</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
