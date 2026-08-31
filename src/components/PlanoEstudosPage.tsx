'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Calendar, AlertTriangle,
  ChevronDown, ChevronUp, Target,
  FileText, GraduationCap,
  Info, MessageSquare, Check, Plus, Edit3, Trash2, X, Sparkles, ShieldCheck, UserCheck, Layers
} from 'lucide-react';
import { UserRole } from '@/types';
import { INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';
import {
  Entregavel, LivroRecomendado, RequisitosDisciplina,
  getPlanoEstudosForTurma, savePlanoEstudosForTurma,
  addOrUpdateEntregavel, deleteEntregavel, updateRequisitosDisciplina
} from '@/services/planoEstudosService';
import { getDisciplinasForUser } from '@/services/disciplinasService';

interface PlanoEstudosPageProps {
  userEmail?: string;
  currentRole?: UserRole;
  onTabChange?: (tab: string) => void;
}

// ── Helpers ──
function getDiasRestantes(dataISO: string): number {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(dataISO); alvo.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

function getBadgeTipo(tipo: Entregavel['tipo']) {
  const map: Record<Entregavel['tipo'], { label: string; cls: string }> = {
    prova: { label: '📝 Prova', cls: 'bg-red-100 text-red-700 border border-red-200' },
    trabalho: { label: '📄 Trabalho', cls: 'bg-blue-100 text-blue-700 border border-blue-200' },
    resumo: { label: '📖 Resumo', cls: 'bg-orange-100 text-orange-700 border border-orange-200' },
    apresentacao: { label: '🎤 Seminário', cls: 'bg-violet-100 text-violet-700 border border-violet-200' },
    entrega: { label: '📤 Entrega', cls: 'bg-teal-100 text-teal-700 border border-teal-200' },
  };
  return map[tipo] || { label: tipo, cls: 'bg-gray-100 text-gray-700' };
}

export const PlanoEstudosPage: React.FC<PlanoEstudosPageProps> = ({
  userEmail,
  currentRole = 'aluno',
  onTabChange,
}) => {
  const normalizedEmail = (userEmail || '').toLowerCase().trim();
  const authUser = INITIAL_AUTHORIZED_USERS[normalizedEmail];
  const isSuperAdmin = (authUser && authUser.roles && authUser.roles.includes('admin')) || normalizedEmail.includes('sacra') || normalizedEmail.includes('admin') || normalizedEmail.includes('tondedez') || normalizedEmail.includes('ead@');

  // Permissões RBAC
  const isMonitorOrAdmin = currentRole === 'monitor' || currentRole === 'admin' || isSuperAdmin;
  const isProfessor = currentRole === 'professor';

  // Determina o perfil acadêmico do aluno (Turma e Período)
  const studentDefaultTurmaIdx = useMemo(() => {
    let initialT = 1;
    if (authUser && authUser.turmaIdx !== undefined) initialT = authUser.turmaIdx;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`lms_profile_${normalizedEmail}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.turmaIdx !== undefined) return Number(parsed.turmaIdx);
        }
      } catch (e) {}
    }
    return initialT;
  }, [authUser, normalizedEmail]);

  // Turma atualmente selecionada para visualização/edição
  const [selectedTurmaIdx, setSelectedTurmaIdx] = useState<number>(studentDefaultTurmaIdx);

  // Dados carregados da turma
  const [planoData, setPlanoData] = useState(() => getPlanoEstudosForTurma(selectedTurmaIdx));

  // Recarrega dados quando a turma muda ou quando ocorre evento customizado
  useEffect(() => {
    setPlanoData(getPlanoEstudosForTurma(selectedTurmaIdx));

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ turmaIdx: number }>;
      if (customEvent.detail && customEvent.detail.turmaIdx === selectedTurmaIdx) {
        setPlanoData(getPlanoEstudosForTurma(selectedTurmaIdx));
      } else {
        setPlanoData(getPlanoEstudosForTurma(selectedTurmaIdx));
      }
    };

    window.addEventListener('lms_plano_estudos_updated', handleUpdate);
    return () => window.removeEventListener('lms_plano_estudos_updated', handleUpdate);
  }, [selectedTurmaIdx]);

  // Matérias sob responsabilidade do professor autenticado
  const professorDisciplinas = useMemo(() => {
    if (!isProfessor && !isMonitorOrAdmin) return [];
    return getDisciplinasForUser(normalizedEmail, 'professor');
  }, [isProfessor, isMonitorOrAdmin, normalizedEmail]);

  const professorDisciplinaNames = useMemo(() => {
    return new Set(professorDisciplinas.map((d) => d.name.toLowerCase().trim()));
  }, [professorDisciplinas]);

  // Verifica se o usuário atual tem permissão para editar um entregável específico
  const canEditEntregavel = (item: Entregavel) => {
    if (isMonitorOrAdmin) return true;
    if (isProfessor) {
      const dName = item.disciplina.toLowerCase().trim();
      const profName = authUser?.name?.toLowerCase() || '';
      return professorDisciplinaNames.has(dName) || (item.disciplinaId && professorDisciplinas.some(d => d.id === item.disciplinaId));
    }
    return false;
  };

  // Verifica se o usuário atual tem permissão para editar uma disciplina específica
  const canEditDisciplina = (disc: RequisitosDisciplina) => {
    if (isMonitorOrAdmin) return true;
    if (isProfessor) {
      const dProfEmail = (disc.professorEmail || '').toLowerCase().trim();
      const dProfName = disc.professor.toLowerCase().trim();
      const authName = authUser?.name?.toLowerCase() || '';
      const isEmailMatch = dProfEmail && dProfEmail === normalizedEmail;
      const isNameMatch = authName && (authName.includes(dProfName) || dProfName.includes(authName));
      return isEmailMatch || isNameMatch || professorDisciplinaNames.has(disc.nome.toLowerCase().trim());
    }
    return false;
  };

  // Nome formatado da turma
  const turmaNome = useMemo(() => {
    switch (selectedTurmaIdx) {
      case 0:
        return 'Fim de Semana (5º Período)';
      case 1:
        return 'Turma A — 7º Período';
      case 2:
        return 'Turma B — 3º Período';
      case 3:
        return 'Curso Básico de Teologia';
      default:
        return `Turma ${selectedTurmaIdx}`;
    }
  }, [selectedTurmaIdx]);

  // Checklist de progresso individual
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem(`lms_plano_checklist_${normalizedEmail}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const [expandedDisciplina, setExpandedDisciplina] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'cronograma' | 'requisitos' | 'livros'>('cronograma');

  // Estado dos Modais de Edição
  const [editingEntregavel, setEditingEntregavel] = useState<Entregavel | null>(null);
  const [isNewEntregavelModalOpen, setIsNewEntregavelModalOpen] = useState(false);
  const [editingDisciplina, setEditingDisciplina] = useState<RequisitosDisciplina | null>(null);

  // Estados dos formulários de entregável
  const [formDisciplina, setFormDisciplina] = useState('');
  const [formTitulo, setFormTitulo] = useState('');
  const [formTipo, setFormTipo] = useState<Entregavel['tipo']>('prova');
  const [formDataLimite, setFormDataLimite] = useState('');
  const [formDataISO, setFormDataISO] = useState('');
  const [formDescricao, setFormDescricao] = useState('');

  // Estados dos formulários de disciplina
  const [formRegrasGerais, setFormRegrasGerais] = useState('');
  const [formCriteriosAvaliacao, setFormCriteriosAvaliacao] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formInfoExtra, setFormInfoExtra] = useState('');
  const [formLivros, setFormLivros] = useState<LivroRecomendado[]>([]);

  // Novo livro temporário dentro do modal de disciplina
  const [newLivroTitulo, setNewLivroTitulo] = useState('');
  const [newLivroAutor, setNewLivroAutor] = useState('');
  const [newLivroTipo, setNewLivroTipo] = useState<'obrigatorio' | 'base' | 'recomendado'>('obrigatorio');

  const toggleCheck = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem(`lms_plano_checklist_${normalizedEmail}`, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const entregaveisOrdenados = useMemo(() => {
    return [...planoData.entregaveis].sort(
      (a, b) => new Date(a.dataISO).getTime() - new Date(b.dataISO).getTime()
    );
  }, [planoData.entregaveis]);

  const completados = planoData.entregaveis.filter(e => checkedIds.has(e.id)).length;
  const totalEntregaveis = planoData.entregaveis.length;
  const progresso = totalEntregaveis > 0 ? Math.round((completados / totalEntregaveis) * 100) : 0;

  // Abertura do Modal de Novo Entregável
  const handleOpenNewEntregavel = (presetDisciplina?: string) => {
    const defaultDisc = presetDisciplina || (isProfessor && professorDisciplinas.length > 0 ? professorDisciplinas[0].name : (planoData.requisitos[0]?.nome || ''));
    setEditingEntregavel(null);
    setFormDisciplina(defaultDisc);
    setFormTitulo('');
    setFormTipo('prova');
    setFormDataLimite('');
    setFormDataISO(new Date().toISOString().split('T')[0]);
    setFormDescricao('');
    setIsNewEntregavelModalOpen(true);
  };

  // Abertura do Modal de Edição de Entregável
  const handleOpenEditEntregavel = (item: Entregavel) => {
    setEditingEntregavel(item);
    setFormDisciplina(item.disciplina);
    setFormTitulo(item.titulo);
    setFormTipo(item.tipo);
    setFormDataLimite(item.dataLimite);
    setFormDataISO(item.dataISO);
    setFormDescricao(item.descricao);
    setIsNewEntregavelModalOpen(true);
  };

  // Salvar Entregável
  const handleSaveEntregavel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim() || !formDisciplina.trim()) return;

    const matchedReq = planoData.requisitos.find(r => r.nome.toLowerCase().trim() === formDisciplina.toLowerCase().trim());

    const itemToSave: Entregavel = {
      id: editingEntregavel ? editingEntregavel.id : `e-${Date.now()}`,
      disciplina: formDisciplina,
      disciplinaId: matchedReq ? matchedReq.id : editingEntregavel?.disciplinaId,
      titulo: formTitulo.trim(),
      tipo: formTipo,
      dataLimite: formDataLimite.trim() || formDataISO,
      dataISO: formDataISO || new Date().toISOString().split('T')[0],
      descricao: formDescricao.trim(),
    };

    addOrUpdateEntregavel(selectedTurmaIdx, itemToSave);
    setIsNewEntregavelModalOpen(false);
    setEditingEntregavel(null);
  };

  // Excluir Entregável
  const handleDeleteEntregavel = (id: string) => {
    if (confirm('Tem certeza que deseja remover este entregável do plano de estudos?')) {
      deleteEntregavel(selectedTurmaIdx, id);
    }
  };

  // Abertura do Modal de Edição de Disciplina
  const handleOpenEditDisciplina = (disc: RequisitosDisciplina) => {
    setEditingDisciplina(disc);
    setFormRegrasGerais(disc.regrasGerais.join('\n'));
    setFormCriteriosAvaliacao(disc.criteriosAvaliacao.join('\n'));
    setFormWhatsapp(disc.whatsapp || '');
    setFormInfoExtra(disc.infoExtra || '');
    setFormLivros(disc.livros ? [...disc.livros] : []);
  };

  // Salvar Edição da Disciplina
  const handleSaveDisciplina = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDisciplina) return;

    const patch: Partial<RequisitosDisciplina> = {
      regrasGerais: formRegrasGerais.split('\n').map(s => s.trim()).filter(Boolean),
      criteriosAvaliacao: formCriteriosAvaliacao.split('\n').map(s => s.trim()).filter(Boolean),
      whatsapp: formWhatsapp.trim() || undefined,
      infoExtra: formInfoExtra.trim() || undefined,
      livros: formLivros,
    };

    updateRequisitosDisciplina(selectedTurmaIdx, editingDisciplina.id, patch);
    setEditingDisciplina(null);
  };

  // Adicionar Livro na lista da disciplina
  const handleAddLivroToDisciplina = () => {
    if (!newLivroTitulo.trim()) return;
    setFormLivros(prev => [
      ...prev,
      {
        id: `liv-${Date.now()}`,
        titulo: newLivroTitulo.trim(),
        autor: newLivroAutor.trim() || 'A definir',
        tipo: newLivroTipo,
      }
    ]);
    setNewLivroTitulo('');
    setNewLivroAutor('');
  };

  // Remover Livro da lista da disciplina
  const handleRemoveLivro = (idx: number) => {
    setFormLivros(prev => prev.filter((_, i) => i !== idx));
  };

  // Extração consolidada de livros para a aba Livros
  const livrosObrigatorios = useMemo(() => {
    const list: { t: string; a: string; d: string; n?: string }[] = [];
    planoData.requisitos.forEach(r => {
      (r.livros || []).filter(l => l.tipo === 'obrigatorio').forEach(l => {
        list.push({ t: l.titulo, a: l.autor, d: r.nome, n: `Leitura obrigatória indicada na disciplina de ${r.nome}.` });
      });
    });
    return list;
  }, [planoData.requisitos]);

  const livrosBase = useMemo(() => {
    const list: { t: string; a: string; d: string; n?: string }[] = [];
    planoData.requisitos.forEach(r => {
      (r.livros || []).filter(l => l.tipo === 'base').forEach(l => {
        list.push({ t: l.titulo, a: l.autor, d: r.nome, n: `Livro-texto base adotado para acompanhamento das aulas de ${r.nome}.` });
      });
    });
    return list;
  }, [planoData.requisitos]);

  const livrosRecomendados = useMemo(() => {
    const list: { t: string; a: string; d: string }[] = [];
    planoData.requisitos.forEach(r => {
      (r.livros || []).filter(l => l.tipo === 'recomendado').forEach(l => {
        list.push({ t: l.titulo, a: l.autor, d: r.nome });
      });
    });
    return list;
  }, [planoData.requisitos]);

  return (
    <div className="space-y-5 px-1 pb-8">
      {/* BARRA DE CONTROLE DE GESTÃO PARA MONITORES E PROFESSORES */}
      {(isMonitorOrAdmin || isProfessor) && (
        <div className="p-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-purple-400/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/30">
              {isMonitorOrAdmin ? <ShieldCheck className="w-5 h-5 text-purple-300" /> : <UserCheck className="w-5 h-5 text-amber-300" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-200">
                  {isMonitorOrAdmin ? '👑 Gestão Total do Monitor / Coordenação' : '👨‍🏫 Gestão Docente da Disciplina'}
                </span>
              </div>
              <p className="text-xs text-purple-100/80">
                {isMonitorOrAdmin
                  ? 'Você tem permissão para editar todo o plano de estudos, requisitos e cronogramas de qualquer turma.'
                  : 'Você pode adicionar e editar os entregáveis, regras e livros afetos às suas disciplinas.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {isMonitorOrAdmin && (
              <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10 text-xs">
                <span className="text-[10px] text-gray-300 font-bold px-1.5">Turma:</span>
                <select
                  value={selectedTurmaIdx}
                  onChange={(e) => setSelectedTurmaIdx(Number(e.target.value))}
                  className="bg-purple-950 text-white rounded-lg px-2 py-1 font-bold text-xs border border-purple-500/40 focus:outline-none cursor-pointer"
                >
                  <option value={1}>Turma A (7º Período)</option>
                  <option value={2}>Turma B (3º Período)</option>
                  <option value={0}>Fim de Semana (5º Período)</option>
                  <option value={3}>Curso Básico de Teologia</option>
                </select>
              </div>
            )}

            <button
              onClick={() => handleOpenNewEntregavel()}
              className="py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Novo Entregável</span>
            </button>
          </div>
        </div>
      )}

      {/* HEADER DINÂMICO CONFORME A TURMA E PERÍODO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-5 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-amber-400 blur-3xl" />
          <div className="absolute bottom-2 left-12 w-24 h-24 rounded-full bg-blue-400 blur-2xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-white/10"><Target className="w-6 h-6 text-amber-300" /></div>
            <div>
              <h1 className="text-lg font-bold">Plano de Estudos 2026.2</h1>
              <p className="text-slate-300 text-xs">Seminário Teológico Congregacional • {turmaNome}</p>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>{completados} de {totalEntregaveis} entregáveis marcados</span>
            <span className="font-bold text-amber-300">{progresso}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${progresso}%` }} />
          </div>
        </div>
      </div>

      {/* SELETOR DE SEÇÃO */}
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
        {[
          { id: 'cronograma', emoji: '📅', label: `Cronograma (${planoData.entregaveis.length})` },
          { id: 'requisitos', emoji: '📋', label: `Requisitos (${planoData.requisitos.length})` },
          { id: 'livros', emoji: '📚', label: 'Livros' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id as any)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSection === s.id ? 'bg-white text-slate-800 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* ── SEÇÃO: CRONOGRAMA & CHECKLIST ── */}
      {activeSection === 'cronograma' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-slate-500 text-xs">
              Marque os itens conforme for concluindo. O progresso é salvo automaticamente para a sua turma ({turmaNome}).
            </p>
            {(isMonitorOrAdmin || isProfessor) && (
              <button
                onClick={() => handleOpenNewEntregavel()}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Avaliação / Trabalho
              </button>
            )}
          </div>

          {entregaveisOrdenados.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
              Nenhum entregável cadastrado para esta turma até o momento.
            </div>
          ) : (
            entregaveisOrdenados.map(e => {
              const dias = getDiasRestantes(e.dataISO);
              const done = checkedIds.has(e.id);
              const badge = getBadgeTipo(e.tipo);
              const urgente = !done && dias >= 0 && dias <= 14;
              const vencido = !done && dias < 0;
              const userCanEdit = canEditEntregavel(e);

              return (
                <div key={e.id} className={`rounded-xl border p-4 transition-all shadow-sm group ${done ? 'bg-green-50 border-green-200 opacity-70' : vencido ? 'bg-red-50 border-red-200' : urgente ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleCheck(e.id)}
                      className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                        done ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300 hover:border-green-400'
                      }`}
                    >
                      {done && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                          {urgente && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 border border-amber-300">⚡ {dias === 0 ? 'Hoje!' : `${dias}d restantes`}</span>}
                          {vencido && <span className="text-xs px-2 py-0.5 rounded-full bg-red-200 text-red-800 border border-red-300">⚠️ Vencido</span>}
                          {!urgente && !vencido && !done && dias > 0 && <span className="text-xs text-slate-400">{dias}d restantes</span>}
                        </div>

                        {/* Botões de Ação de Edição / Exclusão */}
                        {userCanEdit && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditEntregavel(e)}
                              title="Editar este entregável"
                              className="p-1.5 text-gray-500 hover:text-blue-700 bg-gray-100 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntregavel(e.id)}
                              title="Excluir este entregável"
                              className="p-1.5 text-gray-500 hover:text-red-700 bg-gray-100 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-slate-500">{e.disciplina}</p>
                      <p className={`text-sm font-bold ${done ? 'line-through text-slate-400' : 'text-slate-800'}`}>{e.titulo}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{e.descricao}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-medium text-slate-600">{e.dataLimite}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── SEÇÃO: REQUISITOS POR MATÉRIA ── */}
      {activeSection === 'requisitos' && (
        <div className="space-y-3">
          <p className="text-slate-500 text-xs">
            Diretrizes oficiais informadas pelos professores para {turmaNome}. Clique para expandir cada matéria.
          </p>

          {planoData.requisitos.map(disc => {
            const expanded = expandedDisciplina === disc.id;
            const userCanEdit = canEditDisciplina(disc);

            return (
              <div key={disc.id} className={`rounded-xl border ${disc.corBorda} ${disc.corFundo} shadow-sm overflow-hidden`}>
                <div className="flex items-center justify-between p-4 gap-3">
                  <button
                    onClick={() => setExpandedDisciplina(prev => prev === disc.id ? null : disc.id)}
                    className="flex-1 flex items-center gap-3 text-left hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 ${disc.cor}`}>{disc.num}</span>
                      </div>
                      <p className={`font-bold text-sm ${disc.cor}`}>{disc.nome}</p>
                      <p className="text-xs text-slate-500">{disc.professor}</p>
                    </div>
                    {expanded ? <ChevronUp className={`w-4 h-4 ${disc.cor}`} /> : <ChevronDown className={`w-4 h-4 ${disc.cor}`} />}
                  </button>

                  {/* Botão de Edição Rápida da Disciplina */}
                  {userCanEdit && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenNewEntregavel(disc.nome)}
                        title="Adicionar avaliação para esta matéria"
                        className="p-1.5 bg-white/80 hover:bg-white text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold border border-slate-200 shadow-2xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Nova Prova</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditDisciplina(disc)}
                        title="Editar diretrizes, critérios e livros desta matéria"
                        className="p-1.5 bg-white/80 hover:bg-white text-slate-700 hover:text-purple-700 rounded-lg text-xs font-bold border border-slate-200 shadow-2xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Editar Matéria</span>
                      </button>
                    </div>
                  )}
                </div>

                {expanded && (
                  <div className="border-t border-white/40 bg-white/70 p-4 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1"><Info className="w-3 h-3" /> Diretrizes</h3>
                      <ul className="space-y-1.5">
                        {disc.regrasGerais.map((r, i) => <li key={i} className="text-xs text-slate-700 bg-white/80 rounded-lg px-3 py-2 leading-relaxed">{r}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Avaliação</h3>
                      <ul className="space-y-1.5">
                        {disc.criteriosAvaliacao.map((c, i) => <li key={i} className="text-xs text-slate-700 bg-white/80 rounded-lg px-3 py-2 leading-relaxed">{c}</li>)}
                      </ul>
                    </div>
                    {disc.infoExtra && (
                      <div className="bg-white/80 rounded-lg p-3 border border-white/60">
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{disc.infoExtra}</p>
                      </div>
                    )}
                    {disc.whatsapp && (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                        <MessageSquare className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-green-800">Grupo WhatsApp Oficial</p>
                          <p className="text-xs text-green-700">"{disc.whatsapp}"</p>
                        </div>
                      </div>
                    )}
                    {disc.livros && disc.livros.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Leituras</h3>
                        <div className="space-y-1.5">
                          {disc.livros.map((l, i) => (
                            <div key={i} className="flex items-start gap-2 bg-white/80 rounded-lg px-3 py-2">
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0 ${l.tipo === 'obrigatorio' ? 'bg-red-100 text-red-700' : l.tipo === 'base' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {l.tipo === 'obrigatorio' ? 'OBRIG.' : l.tipo === 'base' ? 'BASE' : 'REC.'}
                              </span>
                              <div><p className="text-xs font-semibold text-slate-800">{l.titulo}</p><p className="text-xs text-slate-500">{l.autor}</p></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── SEÇÃO: LIVROS ── */}
      {activeSection === 'livros' && (
        <div className="space-y-5">
          {/* Obrigatórios */}
          {livrosObrigatorios.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><h3 className="text-sm font-bold text-red-700">📕 Leitura Obrigatória ({turmaNome})</h3></div>
              <div className="space-y-2">
                {livrosObrigatorios.map((l, i) => (
                  <div key={i} className="rounded-xl border border-red-200 p-4 bg-white shadow-sm flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">📕</span>
                    <div><p className="font-bold text-slate-800 text-sm">{l.t}</p><p className="text-xs text-slate-500 mb-1">{l.a}</p><span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">{l.d}</span><p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{l.n}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Base */}
          {livrosBase.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><h3 className="text-sm font-bold text-blue-700">📘 Livro-Texto (Base das Aulas)</h3></div>
              <div className="space-y-2">
                {livrosBase.map((l, i) => (
                  <div key={i} className="rounded-xl border border-blue-200 p-4 bg-white shadow-sm flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">📘</span>
                    <div><p className="font-bold text-slate-800 text-sm">{l.t}</p><p className="text-xs text-slate-500 mb-1">{l.a}</p><span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{l.d}</span><p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{l.n}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recomendados */}
          {livrosRecomendados.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><h3 className="text-sm font-bold text-green-700">📗 Leituras Recomendadas</h3></div>
              <div className="space-y-2">
                {livrosRecomendados.map((l, i) => (
                  <div key={i} className="rounded-xl border border-green-200 p-3 bg-white shadow-sm flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">📗</span>
                    <div><p className="font-bold text-slate-800 text-sm">{l.t}</p><p className="text-xs text-slate-500 mb-1">{l.a}</p><span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{l.d}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: ADICIONAR / EDITAR ENTREGÁVEL */}
      {/* ============================================================ */}
      {isNewEntregavelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>{editingEntregavel ? 'Editar Entregável / Avaliação' : 'Novo Entregável / Avaliação'}</span>
              </h3>
              <button
                onClick={() => setIsNewEntregavelModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntregavel} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Disciplina</label>
                {isProfessor && !isMonitorOrAdmin ? (
                  <select
                    value={formDisciplina}
                    onChange={(e) => setFormDisciplina(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    {professorDisciplinas.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={formDisciplina}
                    onChange={(e) => setFormDisciplina(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    {planoData.requisitos.map((r) => (
                      <option key={r.id} value={r.nome}>
                        {r.nome} ({r.professor})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título da Atividade</label>
                <input
                  type="text"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  placeholder="Ex: AV1: Prova Escrita — Unidade 1"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Entrega</label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="prova">📝 Prova Escrita / Forms</option>
                    <option value="trabalho">📄 Trabalho Acadêmico</option>
                    <option value="resumo">📖 Resumo Manuscrito</option>
                    <option value="apresentacao">🎤 Seminário / Apresentação</option>
                    <option value="entrega">📤 Entrega de Projeto / Artigo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data Limite (ISO)</label>
                  <input
                    type="date"
                    value={formDataISO}
                    onChange={(e) => {
                      setFormDataISO(e.target.value);
                      if (e.target.value) {
                        const parts = e.target.value.split('-');
                        if (parts.length === 3) {
                          setFormDataLimite(`${parts[2]}/${parts[1]}/${parts[0]}`);
                        }
                      }
                    }}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data Formatada (Texto)</label>
                <input
                  type="text"
                  value={formDataLimite}
                  onChange={(e) => setFormDataLimite(e.target.value)}
                  placeholder="Ex: 29/09/2026 (Ter)"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição / Instruções aos Alunos</label>
                <textarea
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Detalhes sobre a prova, critérios de correção, formato e regras..."
                  rows={3}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewEntregavelModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs transition cursor-pointer"
                >
                  {editingEntregavel ? 'Salvar Alterações' : 'Criar Entregável'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: EDITAR DIRETRIZES & LIVROS DA DISCIPLINA */}
      {/* ============================================================ */}
      {editingDisciplina && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-purple-600" />
                  <span>Diretrizes & Livros: {editingDisciplina.nome}</span>
                </h3>
                <p className="text-xs text-gray-500">Docente: {editingDisciplina.professor}</p>
              </div>
              <button
                onClick={() => setEditingDisciplina(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDisciplina} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Regras Gerais da Matéria (1 por linha)
                </label>
                <textarea
                  value={formRegrasGerais}
                  onChange={(e) => setFormRegrasGerais(e.target.value)}
                  placeholder="Ex: Câmeras abertas durante toda a aula&#10;16 encontros no semestre&#10;Pontualidade rígida às 19h"
                  rows={3}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Critérios de Avaliação (1 por linha)
                </label>
                <textarea
                  value={formCriteriosAvaliacao}
                  onChange={(e) => setFormCriteriosAvaliacao(e.target.value)}
                  placeholder="Ex: AV1: Prova escrita até 8 pontos&#10;+1 ponto de frequência ativa&#10;+1 ponto de leitura obrigatória"
                  rows={3}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grupo Oficial WhatsApp</label>
                  <input
                    type="text"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    placeholder='Ex: "TCC1 - segundo semestre 2026"'
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Observações / Dicas Extras</label>
                  <input
                    type="text"
                    value={formInfoExtra}
                    onChange={(e) => setFormInfoExtra(e.target.value)}
                    placeholder="Ex: Textos e apostilas gratuitos na pasta virtual do Drive"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Seção de Gestão de Livros da Matéria */}
              <div className="border border-purple-200 bg-purple-50/50 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-700" />
                    <span>Livros e Bibliografia ({formLivros.length})</span>
                  </h4>
                </div>

                {/* Lista de Livros Cadastrados */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {formLivros.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">Nenhum livro adicionado.</p>
                  ) : (
                    formLivros.map((liv, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-purple-100 text-xs">
                        <div className="min-w-0">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded mr-1.5 ${
                            liv.tipo === 'obrigatorio' ? 'bg-red-100 text-red-800' : liv.tipo === 'base' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {liv.tipo.toUpperCase()}
                          </span>
                          <strong className="text-slate-800">{liv.titulo}</strong>
                          <span className="text-slate-500 ml-1">({liv.autor})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLivro(idx)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulário de Adicionar Livro */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 border-t border-purple-200">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder="Título do Livro..."
                      value={newLivroTitulo}
                      onChange={(e) => setNewLivroTitulo(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded-xl text-xs"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Autor..."
                      value={newLivroAutor}
                      onChange={(e) => setNewLivroAutor(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded-xl text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-center gap-1">
                    <select
                      value={newLivroTipo}
                      onChange={(e) => setNewLivroTipo(e.target.value as any)}
                      className="w-full p-2 bg-white border border-gray-300 rounded-xl text-xs"
                    >
                      <option value="obrigatorio">Obrigatório</option>
                      <option value="base">Livro-Base</option>
                      <option value="recomendado">Recomendado</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddLivroToDisciplina}
                      className="p-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingDisciplina(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-900 hover:bg-purple-800 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Salvar Diretrizes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanoEstudosPage;
