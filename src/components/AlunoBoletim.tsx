'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  GraduationCap, Download, Printer, Award, CheckCircle2, 
  AlertCircle, BookOpen, Clock, Calendar, RefreshCw, 
  MessageSquare, ShieldCheck, ChevronRight, Sparkles, ArrowRight
} from 'lucide-react';
import { getAllDisciplinas } from '@/services/disciplinasService';
import { 
  getGradesForStudent, 
  calculateGradeResult, 
  normalizeEmail 
} from '@/services/gradesService';
import { Disciplina, StudentGradeRecord } from '@/types';
import { getAuthorizedUserInfo } from '@/lib/authConfig';

interface AlunoBoletimProps {
  userEmail?: string;
  onTabChange?: (tab: string) => void;
}

export const AlunoBoletim: React.FC<AlunoBoletimProps> = ({ userEmail, onTabChange }) => {
  const normalizedEmail = normalizeEmail(userEmail || 'sacrasub@gmail.com');
  const userInfo = useMemo(() => getAuthorizedUserInfo(normalizedEmail), [normalizedEmail]);

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [gradesMap, setGradesMap] = useState<Record<string, StudentGradeRecord>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carrega lista de disciplinas e notas do aluno
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const allDisc = getAllDisciplinas();
      setDisciplinas(allDisc);

      const grades = await getGradesForStudent(normalizedEmail);
      setGradesMap(grades);
    } catch (e) {
      console.warn('Erro ao carregar dados do boletim:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listener para atualização de notas em tempo real
    const handleUpdate = () => {
      getGradesForStudent(normalizedEmail).then(setGradesMap);
    };

    window.addEventListener('lms_grades_updated', handleUpdate);
    return () => {
      window.removeEventListener('lms_grades_updated', handleUpdate);
    };
  }, [normalizedEmail]);

  // Estatísticas Globais do Boletim
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
        <div className="flex items-center gap-2.5 print:hidden">
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
              {userInfo.user?.name || 'Aluno Koinonia'}
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
              Turma 01 • Semestre 2026.2
            </div>
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
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Extrato de Notas & Frequência por Matéria
          </h3>
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
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    Nenhuma disciplina cadastrada para o semestre.
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
    </div>
  );
};
