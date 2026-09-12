'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  GraduationCap, Download, Printer, Save, Check, Search, 
  Sparkles, Award, AlertCircle, RefreshCw, UserCheck, ShieldCheck 
} from 'lucide-react';
import { Disciplina } from '@/types';
import { getAuthorizedUsersList, UserRoleMapping } from '@/lib/authConfig';

export interface StudentGrade {
  email: string;
  name: string;
  av1?: number | null;
  av2?: number | null;
  trabalho?: number | null;
  faltas?: number;
  observacoes?: string;
  updatedAt?: string;
}

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
  const [gradesMap, setGradesMap] = useState<Record<string, StudentGrade>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

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

  // Chave de armazenamento local por disciplina
  const storageKey = `lms_gradebook_v1_${selectedDiscId}`;

  // Carrega notas salvas localmente
  useEffect(() => {
    if (!selectedDiscId) return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setGradesMap(JSON.parse(stored));
      } else {
        setGradesMap({});
      }
    } catch (e) {
      setGradesMap({});
    }
  }, [selectedDiscId, storageKey]);

  // Atualização inline de uma nota de aluno
  const handleUpdateGrade = (
    studentEmail: string,
    studentName: string,
    field: keyof StudentGrade,
    value: any
  ) => {
    const normEmail = studentEmail.toLowerCase().trim();
    setGradesMap((prev) => {
      const current = prev[normEmail] || { email: normEmail, name: studentName, faltas: 0 };
      const updated = {
        ...current,
        [field]: value === '' ? null : value,
        updatedAt: new Date().toISOString(),
      };
      const nextMap = { ...prev, [normEmail]: updated };

      // Auto-save local com debounce
      setAutoSaving(true);
      try {
        localStorage.setItem(storageKey, JSON.stringify(nextMap));
        setTimeout(() => setAutoSaving(false), 600);
      } catch (err) {}

      return nextMap;
    });
  };

  const handleManualSave = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(gradesMap));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {}
  };

  // Cálculo de Média e Situação
  const calculateResult = (grade?: StudentGrade) => {
    if (!grade) return { media: null, situacao: 'Pendente', color: 'text-gray-400' };

    const av1 = grade.av1 !== null && grade.av1 !== undefined ? Number(grade.av1) : null;
    const av2 = grade.av2 !== null && grade.av2 !== undefined ? Number(grade.av2) : null;
    const trab = grade.trabalho !== null && grade.trabalho !== undefined ? Number(grade.trabalho) : null;
    const faltas = Number(grade.faltas || 0);

    const values = [av1, av2, trab].filter((v): v is number => v !== null && !isNaN(v));
    if (values.length === 0) {
      return { media: null, situacao: 'Sem Notas', color: 'text-gray-400' };
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    const media = parseFloat((sum / values.length).toFixed(1));

    if (faltas > 4) {
      return { media, situacao: 'Reprovado por Faltas', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    }

    if (media >= 7.0) {
      return { media, situacao: 'Aprovado', color: 'text-emerald-700 bg-emerald-50 border-emerald-200 font-extrabold' };
    } else if (media >= 5.0) {
      return { media, situacao: 'Em Recuperação', color: 'text-amber-700 bg-amber-50 border-amber-200 font-bold' };
    } else {
      return { media, situacao: 'Reprovado', color: 'text-rose-700 bg-rose-50 border-rose-200 font-bold' };
    }
  };

  // Filtragem de alunos por busca
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return studentsList;
    const q = searchTerm.toLowerCase().trim();
    return studentsList.filter(
      (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [studentsList, searchTerm]);

  // Exportar para CSV
  const handleExportCSV = () => {
    if (!selectedDisciplina) return;
    const headers = ['Nome', 'E-mail', 'AV1', 'AV2', 'Trabalho', 'Faltas', 'Média Final', 'Situação'];
    const rows = filteredStudents.map((s) => {
      const g = gradesMap[s.email.toLowerCase().trim()];
      const res = calculateResult(g);
      return [
        `"${s.name}"`,
        `"${s.email}"`,
        g?.av1 ?? '',
        g?.av2 ?? '',
        g?.trabalho ?? '',
        g?.faltas ?? 0,
        res.media ?? '',
        `"${res.situacao}"`,
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

  // Imprimir Boletim Oficial
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
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              Livro de Notas & Desempenho Acadêmico
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                Semestre 2026.2
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Lance notas de avaliações, trabalhos e controle de faltas com cálculo instantâneo de médias e situação final.
            </p>
          </div>
        </div>

        {/* Ações do Topo */}
        <div className="flex flex-wrap items-center gap-2">
          {autoSaving && (
            <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
              <span>Salvando...</span>
            </span>
          )}

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
            title="Imprimir boletim oficial ou salvar em PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={handleManualSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-300 stroke-[3]" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Notas Salvas!' : 'Salvar Boletim'}</span>
          </button>
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
              <th className="p-3 w-24 text-center">AV1 (0-10)</th>
              <th className="p-3 w-24 text-center">AV2 (0-10)</th>
              <th className="p-3 w-24 text-center">Trabalho (0-10)</th>
              <th className="p-3 w-20 text-center">Faltas</th>
              <th className="p-3 w-24 text-center">Média Final</th>
              <th className="p-3 w-36 text-center">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                  Nenhum aluno encontrado para este filtro.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const normEmail = student.email.toLowerCase().trim();
                const grade = gradesMap[normEmail] || { email: normEmail, name: student.name };
                const res = calculateResult(grade);

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

                    {/* Faltas */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="16"
                        value={grade.faltas ?? 0}
                        onChange={(e) => handleUpdateGrade(student.email, student.name, 'faltas', parseInt(e.target.value || '0', 10))}
                        className="w-14 p-1.5 text-center font-bold bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </td>

                    {/* Média */}
                    <td className="p-3 text-center font-extrabold text-slate-800 text-sm">
                      {res.media !== null ? res.media.toFixed(1) : '-'}
                    </td>

                    {/* Situação */}
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] border inline-block ${res.color}`}>
                        {res.situacao}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
