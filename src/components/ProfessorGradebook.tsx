'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  GraduationCap, Download, Printer, Save, Check, Search, 
  Sparkles, Award, AlertCircle, RefreshCw, UserCheck, ShieldCheck,
  CloudCheck, MessageSquare, Edit3, X, HelpCircle
} from 'lucide-react';
import { Disciplina, StudentGradeRecord } from '@/types';
import { getAuthorizedUsersList } from '@/lib/authConfig';
import { 
  getGradesForDisciplina, 
  saveStudentGrade, 
  saveBatchGrades, 
  calculateGradeResult,
  normalizeEmail
} from '@/services/gradesService';

interface ProfessorGradebookProps {
  disciplinas: Disciplina[];
  userEmail?: string;
  isAdmin?: boolean;
}

export const ProfessorGradebook: React.FC<ProfessorGradebookProps> = ({
  disciplinas,
  userEmail,
  isAdmin,
}) => {
  const [selectedDiscId, setSelectedDiscId] = useState<string>(() => {
    return disciplinas.length > 0 ? disciplinas[0].id : '';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [gradesMap, setGradesMap] = useState<Record<string, StudentGradeRecord>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');
  const [loading, setLoading] = useState(false);

  // Modal de Feedback / Observação Pedagógica
  const [activeFeedbackModal, setActiveFeedbackModal] = useState<{
    email: string;
    name: string;
    text: string;
  } | null>(null);

  const selectedDisciplina = useMemo(() => {
    return disciplinas.find((d) => d.id === selectedDiscId) || disciplinas[0];
  }, [disciplinas, selectedDiscId]);

  // Carrega lista de alunos autorizados
  const studentsList = useMemo(() => {
    const allUsers = getAuthorizedUsersList();
    return Object.values(allUsers).filter(
      (u) => u.roles && u.roles.includes('aluno') && u.email
    );
  }, []);

  // Carrega notas da disciplina (Local-First + Nuvem em segundo plano)
  useEffect(() => {
    if (!selectedDiscId) return;
    let isMounted = true;
    setLoading(true);

    getGradesForDisciplina(selectedDiscId)
      .then((data) => {
        if (isMounted) {
          setGradesMap(data);
          setLoading(false);
          setSyncStatus('synced');
        }
      })
      .catch((err) => {
        console.warn('Erro ao carregar notas:', err);
        if (isMounted) {
          setLoading(false);
          setSyncStatus('offline');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDiscId]);

  // Atualização inline de uma nota de aluno
  const handleUpdateGrade = (
    studentEmail: string,
    studentName: string,
    field: keyof StudentGradeRecord,
    value: any
  ) => {
    const normEmail = normalizeEmail(studentEmail);
    const current = gradesMap[normEmail] || {
      disciplina_id: selectedDiscId,
      student_email: normEmail,
      student_name: studentName,
      faltas: 0,
    };

    const updated: StudentGradeRecord = {
      ...current,
      disciplina_id: selectedDiscId,
      student_name: studentName,
      [field]: value === '' ? null : value,
      updated_at: new Date().toISOString(),
      updated_by: userEmail || 'professor',
    };

    const nextMap = { ...gradesMap, [normEmail]: updated };
    setGradesMap(nextMap);

    // Auto-save debounced no gradesService com { returning: 'minimal' }
    setAutoSaving(true);
    setSyncStatus('saving');

    saveStudentGrade(updated, false).then(() => {
      setAutoSaving(false);
      setSyncStatus('synced');
    }).catch(() => {
      setAutoSaving(false);
      setSyncStatus('offline');
    });
  };

  // Salvamento manual em lote (dispara feedback visual imediato)
  const handleManualSave = async () => {
    if (!selectedDiscId) return;
    setAutoSaving(true);
    setSyncStatus('saving');

    const records = Object.values(gradesMap);
    const result = await saveBatchGrades(selectedDiscId, records);

    setAutoSaving(false);
    if (result.success) {
      setSyncStatus('synced');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } else {
      setSyncStatus('offline');
    }
  };

  // Salvar observação pedagógica
  const handleSaveFeedback = () => {
    if (!activeFeedbackModal) return;
    handleUpdateGrade(
      activeFeedbackModal.email,
      activeFeedbackModal.name,
      'observacoes',
      activeFeedbackModal.text
    );
    setActiveFeedbackModal(null);
  };

  // Filtragem de alunos por busca
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return studentsList;
    const q = searchTerm.toLowerCase().trim();
    return studentsList.filter(
      (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [studentsList, searchTerm]);

  // Estatísticas Rápidas da Turma
  const classStats = useMemo(() => {
    const total = filteredStudents.length;
    let aprovados = 0;
    let recuperacao = 0;
    let reprovados = 0;
    let faltosos = 0;
    let notasValidasSum = 0;
    let notasValidasCount = 0;

    filteredStudents.forEach((s) => {
      const g = gradesMap[normalizeEmail(s.email)];
      const res = calculateGradeResult(g);
      if (res.situacao === 'Aprovado') aprovados++;
      else if (res.situacao === 'Em Recuperação') recuperacao++;
      else if (res.situacao === 'Reprovado') reprovados++;
      else if (res.situacao === 'Reprovado por Faltas') faltosos++;

      if (res.media !== null) {
        notasValidasSum += res.media;
        notasValidasCount++;
      }
    });

    const mediaGeral = notasValidasCount > 0 ? (notasValidasSum / notasValidasCount).toFixed(1) : '-';

    return { total, aprovados, recuperacao, reprovados, faltosos, mediaGeral };
  }, [filteredStudents, gradesMap]);

  // Exportar para CSV com suporte a todos os campos
  const handleExportCSV = () => {
    if (!selectedDisciplina) return;
    const headers = ['Nome', 'E-mail', 'AV1', 'AV2', 'Trabalho', 'Recuperação', 'Faltas', 'Média Final', 'Situação', 'Observações'];
    const rows = filteredStudents.map((s) => {
      const g = gradesMap[normalizeEmail(s.email)];
      const res = calculateGradeResult(g);
      return [
        `"${s.name}"`,
        `"${s.email}"`,
        g?.av1 ?? '',
        g?.av2 ?? '',
        g?.trabalho ?? '',
        g?.recuperacao ?? '',
        g?.faltas ?? 0,
        res.media ?? '',
        `"${res.situacao}"`,
        `"${(g?.observacoes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Boletim_${selectedDisciplina.name.replace(/[^a-zA-Z0-9]/g, '_')}_2026_2.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Imprimir Diário Oficial
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
      {/* Cabeçalho do Livro de Notas */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-extrabold text-slate-900">
                Livro de Notas & Diário de Classe
              </h3>
              <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                Semestre 2026.2
              </span>
              {/* Badge de Sincronização em Nuvem (Zero Waste Egress) */}
              {syncStatus === 'synced' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Nuvem Sincronizada
                </span>
              )}
              {syncStatus === 'saving' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                  Salvando (0 Bytes)...
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Lance notas de AV1, AV2, Trabalhos, Exame Final e controle de faltas. As notas são refletidas instantaneamente no portal do aluno.
            </p>
          </div>
        </div>

        {/* Ações do Topo */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Exportar dados para planilha Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Imprimir diário oficial ou salvar em PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={handleManualSave}
            disabled={autoSaving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {savedSuccess ? (
              <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
            ) : autoSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{savedSuccess ? 'Notas Salvas na Nuvem!' : autoSaving ? 'Sincronizando...' : 'Salvar Boletim'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Rápidos da Turma */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-500">Total Alunos</span>
          <div className="text-lg font-black text-slate-900 mt-0.5">{classStats.total}</div>
        </div>
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-bold uppercase text-emerald-700">Aprovados</span>
          <div className="text-lg font-black text-emerald-800 mt-0.5">{classStats.aprovados}</div>
        </div>
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-bold uppercase text-amber-700">Recuperação</span>
          <div className="text-lg font-black text-amber-800 mt-0.5">{classStats.recuperacao}</div>
        </div>
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-bold uppercase text-rose-700">Reprovados</span>
          <div className="text-lg font-black text-rose-800 mt-0.5">{classStats.reprovados}</div>
        </div>
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-bold uppercase text-rose-700">Rep. Faltas</span>
          <div className="text-lg font-black text-rose-800 mt-0.5">{classStats.faltosos}</div>
        </div>
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-bold uppercase text-indigo-700">Média da Turma</span>
          <div className="text-lg font-black text-indigo-900 mt-0.5">{classStats.mediaGeral}</div>
        </div>
      </div>

      {/* Barra de Filtro e Seleção de Disciplina */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Disciplina Atribuída</label>
          <select
            value={selectedDiscId}
            onChange={(e) => setSelectedDiscId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            {disciplinas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.day_of_week} • Profº {d.professor_name || 'Corpo Docente'})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Pesquisar Aluno</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por nome ou e-mail..."
              className="w-full p-2.5 pl-8 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
          </div>
        </div>
      </div>

      {/* Tabela de Notas */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <th className="p-3">Aluno</th>
              <th className="p-3 w-20 text-center">AV1 (0-10)</th>
              <th className="p-3 w-20 text-center">AV2 (0-10)</th>
              <th className="p-3 w-20 text-center">Trab. (0-10)</th>
              <th className="p-3 w-20 text-center">Recup.</th>
              <th className="p-3 w-16 text-center">Faltas</th>
              <th className="p-3 w-20 text-center">Média Final</th>
              <th className="p-3 w-32 text-center">Situação</th>
              <th className="p-3 w-20 text-center">Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400 font-medium">
                  Nenhum aluno encontrado para este filtro.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const normEmail = normalizeEmail(student.email);
                const grade = gradesMap[normEmail] || {
                  disciplina_id: selectedDiscId,
                  student_email: normEmail,
                  student_name: student.name,
                  faltas: 0,
                };
                const res = calculateGradeResult(grade);

                return (
                  <tr key={student.email} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        {student.avatarUrl ? (
                          <img
                            src={student.avatarUrl}
                            alt={student.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800">{student.name}</div>
                          <div className="text-[10px] text-gray-400">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* AV1 */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={grade.av1 ?? ''}
                        onChange={(e) => handleUpdateGrade(student.email, student.name, 'av1', e.target.value === '' ? null : parseFloat(e.target.value))}
                        placeholder="-"
                        className="w-16 p-1.5 text-center font-bold bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </td>

                    {/* AV2 */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={grade.av2 ?? ''}
                        onChange={(e) => handleUpdateGrade(student.email, student.name, 'av2', e.target.value === '' ? null : parseFloat(e.target.value))}
                        placeholder="-"
                        className="w-16 p-1.5 text-center font-bold bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </td>

                    {/* Trabalho */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={grade.trabalho ?? ''}
                        onChange={(e) => handleUpdateGrade(student.email, student.name, 'trabalho', e.target.value === '' ? null : parseFloat(e.target.value))}
                        placeholder="-"
                        className="w-16 p-1.5 text-center font-bold bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </td>

                    {/* Recuperação */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={grade.recuperacao ?? ''}
                        onChange={(e) => handleUpdateGrade(student.email, student.name, 'recuperacao', e.target.value === '' ? null : parseFloat(e.target.value))}
                        placeholder="-"
                        title="Nota de Exame Final ou Recuperação (se aplicável)"
                        className="w-16 p-1.5 text-center font-bold bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none text-amber-900"
                      />
                    </td>

                    {/* Faltas */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="16"
                        value={grade.faltas ?? 0}
                        onChange={(e) => handleUpdateGrade(student.email, student.name, 'faltas', parseInt(e.target.value || '0', 10))}
                        className={`w-14 p-1.5 text-center font-bold bg-white border rounded-lg text-xs focus:ring-2 focus:outline-none ${
                          (grade.faltas || 0) > 4
                            ? 'border-rose-400 text-rose-700 bg-rose-50/50'
                            : 'border-slate-200 text-slate-800'
                        }`}
                        title="Limite: 4 faltas em 16 aulas"
                      />
                    </td>

                    {/* Média */}
                    <td className="p-3 text-center font-extrabold text-slate-800 text-sm">
                      {res.mediaDisplay}
                    </td>

                    {/* Situação */}
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] border inline-block ${res.badgeBg}`}>
                        {res.situacao}
                      </span>
                    </td>

                    {/* Feedback / Observações */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setActiveFeedbackModal({
                          email: student.email,
                          name: student.name,
                          text: grade.observacoes || '',
                        })}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          grade.observacoes
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                        }`}
                        title={grade.observacoes ? `Observação: ${grade.observacoes}` : 'Adicionar observação pedagógica'}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Feedback Pedagógico ao Aluno */}
      {activeFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Feedback Pedagógico do Aluno
                </h4>
              </div>
              <button
                onClick={() => setActiveFeedbackModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-800">{activeFeedbackModal.name}</div>
              <div className="text-[11px] text-slate-400">{activeFeedbackModal.email}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Comentário ou Orientação Formativa
              </label>
              <textarea
                rows={4}
                value={activeFeedbackModal.text}
                onChange={(e) => setActiveFeedbackModal({ ...activeFeedbackModal, text: e.target.value })}
                placeholder="Ex: Excelente participação nos debates de sala. Atenção especial à fundamentação bíblica no trabalho final..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Este comentário será visível pelo próprio aluno em seu Boletim Acadêmico.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveFeedbackModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveFeedback}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Observação</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
