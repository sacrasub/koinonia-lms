'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Disciplina, Aula, UserRole } from '@/types';
import { getAllDisciplinas } from '@/services/disciplinasService';
import { 
  Folder, Video, Clock, Calendar, Search, 
  ExternalLink, Sparkles, User, Info, BookOpen, Library, List, Check, Copy, Layers, Compass
} from 'lucide-react';
import { getLocalTimeZoneInfo, convertBRTToLocalTime, TimeZoneInfo } from '@/lib/timeUtils';
import { INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';

interface PastasVirtuaisPageProps {
  userEmail?: string;
  currentRole?: UserRole;
  onTabChange?: (tab: string) => void;
}

export const PastasVirtuaisPage: React.FC<PastasVirtuaisPageProps> = ({
  userEmail,
  currentRole = 'aluno',
  onTabChange,
}) => {
  const normalizedEmail = (userEmail || '').toLowerCase().trim();

  // Aba ativa: 'tab-lista' (Lista Simples) ou 'tab-dias' (Visão por Dias)
  const [activeTab, setActiveTab] = useState<'tab-lista' | 'tab-dias'>('tab-lista');

  // Turma selecionada: 1 = Turma A (7º Período), 2 = Turma B (3º Período)
  const [selectedTurmaIdx, setSelectedTurmaIdx] = useState<number>(() => {
    const authUser = INITIAL_AUTHORIZED_USERS[normalizedEmail];
    if (authUser && authUser.turmaIdx !== undefined) {
      return authUser.turmaIdx;
    }
    return 1;
  });

  const [disciplinasList, setDisciplinasList] = useState<Disciplina[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Informações de Fuso Horário Local
  const [tzInfo, setTzInfo] = useState<TimeZoneInfo>({
    timeZone: 'America/Sao_Paulo',
    gmtOffset: 'GMT-3',
    isBRT: true,
  });

  useEffect(() => {
    setTzInfo(getLocalTimeZoneInfo());
    const list = getAllDisciplinas();
    setDisciplinasList(list);

    const handleUpdate = () => {
      setDisciplinasList(getAllDisciplinas());
    };
    window.addEventListener('lms_disciplinas_updated', handleUpdate);
    return () => window.removeEventListener('lms_disciplinas_updated', handleUpdate);
  }, []);

  // Filtra as disciplinas pela turma e termo de busca
  const filteredDisciplinas = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return disciplinasList.filter((d) => {
      const matchTurma = (d.turma_idx ?? 1) === selectedTurmaIdx;
      if (!matchTurma) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.professor_name.toLowerCase().includes(q) ||
        d.day_of_week.toLowerCase().includes(q) ||
        (d.code && d.code.toLowerCase().includes(q))
      );
    });
  }, [disciplinasList, selectedTurmaIdx, searchQuery]);

  // Agrupamento de disciplinas por dia da semana para a Visão por Dias
  const groupedByDay = useMemo(() => {
    const daysOrder = ['Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Segunda-feira'];
    const groups: { day: string; items: Disciplina[] }[] = [];

    daysOrder.forEach((day) => {
      const items = filteredDisciplinas.filter((d) => d.day_of_week.toLowerCase().trim() === day.toLowerCase().trim());
      if (items.length > 0) {
        groups.push({ day, items });
      }
    });

    // Itens que não bateram na ordem
    const others = filteredDisciplinas.filter(
      (d) => !daysOrder.some((day) => day.toLowerCase().trim() === d.day_of_week.toLowerCase().trim())
    );
    if (others.length > 0) {
      groups.push({ day: 'Outros Horários', items: others });
    }

    return groups;
  }, [filteredDisciplinas]);

  const handleCopyLink = (url: string, id: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* CABEÇALHO DO PROJETO PASTAS VIRTUAIS */}
      <header className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm text-center space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 shadow-xs mb-1">
          <Folder className="w-7 h-7" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Pastas Virtuais & Aulas
        </h1>

        <div className="text-sm font-semibold text-slate-500 flex flex-wrap items-center justify-center gap-2">
          <span>Semanal Noturno</span>
          <span>•</span>
          <span className="text-blue-700 font-bold">
            {selectedTurmaIdx === 1 ? 'Turma A - Veteranos (7º Período)' : 'Turma B (3º Período)'}
          </span>
          <span>•</span>
          <span>Semestre 2026.2</span>
        </div>

        {/* Notificação de Fuso Horário */}
        {!tzInfo.isBRT && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200/80 mt-2">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>
              Horários convertidos automaticamente para seu fuso local (<strong>{tzInfo.timeZone}</strong> • {tzInfo.gmtOffset})
            </span>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={() => onTabChange && onTabChange('fluxo-estudos')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Ver Modo Fluxo de Estudos Integrado (6 Fases & 11 Pastas)</span>
          </button>
        </div>
      </header>

      {/* SELETOR DE TURMA & BARRA DE FERRAMENTAS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Seletor de Turma A / B */}
        <div className="flex items-center bg-gray-200/80 p-1.5 rounded-2xl shadow-inner w-full sm:w-auto">
          <button
            onClick={() => setSelectedTurmaIdx(1)}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              selectedTurmaIdx === 1
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏛️ Turma A (7º Período)
          </button>
          <button
            onClick={() => setSelectedTurmaIdx(2)}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              selectedTurmaIdx === 2
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📖 Turma B (3º Período)
          </button>
        </div>

        {/* Navegação por Abas (Lista Simples vs Visão por Dias) */}
        <nav className="flex items-center bg-gray-200/80 p-1.5 rounded-2xl shadow-inner w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('tab-lista')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'tab-lista'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4 text-blue-600" />
            <span>Lista Simples</span>
          </button>
          <button
            onClick={() => setActiveTab('tab-dias')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'tab-dias'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Visão por Dias</span>
          </button>
        </nav>
      </div>

      {/* BARRA DE PESQUISA RÁPIDA */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-gray-200 shadow-xs">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar por nome da disciplina, professor ou dia da semana..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-gray-400 hover:text-gray-700 font-bold px-2"
          >
            Limpar
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* ABA 1: LISTA SIMPLES (TABELA LIMPA NO ESTILO DO PASTAS VIRTUAIS) */}
      {/* ======================================================== */}
      {activeTab === 'tab-lista' && (
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden p-3 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-separate border-spacing-0">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="pb-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Dia / Horário
                  </th>
                  <th className="pb-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Disciplina
                  </th>
                  <th className="pb-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Professor(a)
                  </th>
                  <th className="pb-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
                    Links da Aula
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDisciplinas.map((disc) => {
                  const localStart = convertBRTToLocalTime(disc.start_time);
                  const localEnd = convertBRTToLocalTime(disc.end_time);
                  const isRecordedModule = !disc.google_meet_url;

                  return (
                    <tr key={disc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-3 align-middle">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">{disc.day_of_week}</span>
                          <span 
                            className="text-xs text-blue-700 font-semibold cursor-help"
                            title={`Horário de Brasília: ${disc.start_time} às ${disc.end_time}`}
                          >
                            {localStart} – {localEnd}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-3 align-middle">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-slate-900 block text-sm sm:text-base leading-snug">
                            {disc.name}
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-400 font-mono">
                              {disc.code}
                            </span>
                            {isRecordedModule && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.2 rounded-md">
                                📹 Módulo Gravado
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-3 align-middle">
                        <span className="text-slate-600 font-medium text-xs sm:text-sm">
                          {disc.professor_name}
                        </span>
                      </td>

                      <td className="py-4 px-3 align-middle">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              if (typeof window !== 'undefined') {
                                window.dispatchEvent(
                                  new CustomEvent('lms_open_disciplina_detail', {
                                    detail: { disciplinaId: disc.id },
                                  })
                                );
                              }
                            }}
                            className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            title="Abrir Hub da Matéria com Livros Recomendados e Anotações Gemini"
                          >
                            <Layers className="w-3.5 h-3.5 text-amber-300" />
                            <span>Hub da Matéria</span>
                          </button>

                          {disc.google_drive_url ? (
                            <a
                              href={disc.google_drive_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-blue-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                              title="Acessar Pasta de Materiais no Google Drive"
                            >
                              <Folder className="w-3.5 h-3.5 text-blue-600" />
                              <span>Material</span>
                            </a>
                          ) : null}

                          {disc.google_meet_url ? (
                            <a
                              href={disc.google_meet_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                              title="Entrar na Reunião do Google Meet"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Ao Vivo</span>
                            </a>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Linha Extra da Biblioteca Virtual */}
                <tr className="bg-blue-50/40 hover:bg-blue-50/80 transition-colors">
                  <td className="py-4 px-3 align-middle">
                    <div className="flex flex-col">
                      <span className="font-bold text-blue-900 text-sm">Geral</span>
                      <span className="text-xs text-blue-600 font-semibold">Acesso Livre 24/7</span>
                    </div>
                  </td>
                  <td className="py-4 px-3 align-middle">
                    <span className="font-extrabold text-blue-950 block text-sm sm:text-base">
                      Biblioteca Digital
                    </span>
                    <span className="text-[11px] text-blue-700 font-medium">
                      Acervo Teológico Integrado & Comentários Exegéticos
                    </span>
                  </td>
                  <td className="py-4 px-3 align-middle">
                    <span className="text-slate-600 font-medium text-xs">Acervo Compartilhado</span>
                  </td>
                  <td className="py-4 px-3 align-middle text-center">
                    {onTabChange ? (
                      <button
                        onClick={() => onTabChange('aluno-biblioteca')}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <Library className="w-3.5 h-3.5" />
                        <span>Acessar Acervo</span>
                      </button>
                    ) : (
                      <a
                        href="https://bibliotecafmb.netlify.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <Library className="w-3.5 h-3.5" />
                        <span>Acessar Acervo</span>
                      </a>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ABA 2: VISÃO POR DIAS (CARDS AGRUPADOS POR DIA) */}
      {/* ======================================================== */}
      {activeTab === 'tab-dias' && (
        <div className="space-y-8">
          {groupedByDay.map((group) => (
            <section key={group.day} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
                <Calendar className="w-5 h-5 text-slate-500" />
                <h2 className="text-xl font-extrabold text-slate-900">{group.day}</h2>
                <span className="text-xs font-bold text-slate-400 bg-gray-100 px-2 py-0.5 rounded-full ml-auto">
                  {group.items.length} {group.items.length === 1 ? 'aula' : 'aulas'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((disc) => {
                  const localStart = convertBRTToLocalTime(disc.start_time);
                  const localEnd = convertBRTToLocalTime(disc.end_time);
                  const isRecordedModule = !disc.google_meet_url;

                  return (
                    <div
                      key={disc.id}
                      className="p-5 rounded-3xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-black text-slate-900 text-base leading-snug">
                            {disc.name}
                          </h3>
                        </div>

                        <p className="text-xs font-semibold text-slate-600">
                          👨‍🏫 {disc.professor_name}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          {isRecordedModule ? (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                              📹 Módulo Gravado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-900 border border-blue-100 px-2.5 py-1 rounded-lg text-xs font-bold">
                              👑 Monitor(a): {disc.monitor_name || 'Monitoria UIECB'}
                            </span>
                          )}
                        </div>

                        <div 
                          className="flex items-center gap-1.5 text-xs text-slate-500 pt-1 cursor-help"
                          title={`Horário oficial de Brasília: ${disc.start_time} às ${disc.end_time}`}
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold">{localStart} – {localEnd}</span>
                          {!tzInfo.isBRT && (
                            <span className="text-[10px] text-blue-600 font-bold">(Local)</span>
                          )}
                        </div>
                      </div>

                      {/* Ações do Card */}
                      <div className="space-y-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              window.dispatchEvent(
                                new CustomEvent('lms_open_disciplina_detail', {
                                  detail: { disciplinaId: disc.id },
                                })
                              );
                            }
                          }}
                          className="w-full py-2.5 px-3 bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Layers className="w-4 h-4 text-amber-300" />
                          <span>Hub da Matéria (Livros & Gemini IA) ➔</span>
                        </button>

                        <div className="flex gap-2">
                          {disc.google_drive_url ? (
                            <a
                              href={disc.google_drive_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-blue-700 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                            >
                              <Folder className="w-3.5 h-3.5 text-blue-600" />
                              <span>Material</span>
                            </a>
                          ) : null}

                          {disc.google_meet_url ? (
                            <a
                              href={disc.google_meet_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Aula ao Vivo</span>
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* CARD DESTAQUE: BIBLIOTECA VIRTUAL (GRADIENTE AZUL) */}
      {/* ======================================================== */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#0071e3] to-[#00a0ff] text-white shadow-lg text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm mx-auto">
          <Library className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white">
          Biblioteca Virtual do Seminário
        </h3>

        <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto">
          Acesse centenas de títulos digitalizados, comentários bíblicos e acervos acadêmicos para apoiar seus estudos no semestre 2026.2.
        </p>

        <div className="pt-2">
          {onTabChange ? (
            <button
              onClick={() => onTabChange('aluno-biblioteca')}
              className="px-6 py-3 bg-white text-[#0071e3] hover:bg-blue-50 font-black text-sm rounded-2xl shadow-md transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              <Library className="w-4 h-4" />
              <span>Acessar Acervo Completo</span>
            </button>
          ) : (
            <a
              href="https://bibliotecafmb.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-[#0071e3] hover:bg-blue-50 font-black text-sm rounded-2xl shadow-md transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              <Library className="w-4 h-4" />
              <span>Acessar Acervo Completo</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
