'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Plus, Lock, Unlock, Pin, Coffee, 
  HelpCircle, CheckCircle2, ChevronRight, Send, User, 
  Sparkles, Filter, Search, ShieldCheck, Award, GraduationCap,
  ArrowLeft, RefreshCw
} from 'lucide-react';
import { ForumTopico, ForumResposta, UserRole, ForumTipo } from '@/types';
import { 
  getTopics, 
  createTopic, 
  getTopicReplies, 
  addTopicReply 
} from '@/services/collaborationService';
import { getAllDisciplinas } from '@/services/disciplinasService';

interface ForumColaborativoProps {
  userEmail: string;
  userName?: string;
  currentRole: UserRole;
  defaultDisciplinaId?: string;
}

export const ForumColaborativo: React.FC<ForumColaborativoProps> = ({
  userEmail,
  userName = 'Seminarista',
  currentRole,
  defaultDisciplinaId
}) => {
  const [topics, setTopics] = useState<ForumTopico[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopico | null>(null);
  const [replies, setReplies] = useState<ForumResposta[]>([]);
  const [loadingReplies, setLoadingReplies] = useState<boolean>(false);

  // Filtros
  const [selectedFilter, setSelectedFilter] = useState<'TODOS' | ForumTipo>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [disciplinas, setDisciplinas] = useState<Array<{ id: string; nome: string }>>([]);
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>(defaultDisciplinaId || 'todas');

  // Modal Novo Tópico
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newTipo, setNewTipo] = useState<ForumTipo>(currentRole === 'aluno' ? 'LIVRE_KOINONIA' : 'TEMATICO');
  const [newDisciplinaId, setNewDisciplinaId] = useState<string>(defaultDisciplinaId || 'global-koinonia');

  // Input de Nova Resposta
  const [replyText, setReplyText] = useState<string>('');
  const [submittingReply, setSubmittingReply] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const loadDisciplinas = async () => {
    try {
      const list = await getAllDisciplinas();
      setDisciplinas(list.map((d) => ({ id: d.id, nome: d.name })));
    } catch (e) {}
  };

  const loadTopicsList = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getTopics(selectedDisciplina, userEmail);
      setTopics(data);
    } catch (e) {
      console.error('Erro ao carregar fóruns:', e);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 300);
    }
  };

  const loadRepliesForTopic = async (topic: ForumTopico) => {
    setLoadingReplies(true);
    try {
      const data = await getTopicReplies(topic, userEmail, currentRole);
      setReplies(data);
    } catch (e) {
      console.error('Erro ao carregar respostas do tópico:', e);
    } finally {
      setLoadingReplies(false);
    }
  };

  useEffect(() => {
    loadDisciplinas();
  }, []);

  useEffect(() => {
    loadTopicsList();
  }, [selectedDisciplina, userEmail]);

  useEffect(() => {
    if (selectedTopic) {
      loadRepliesForTopic(selectedTopic);
    }
  }, [selectedTopic]);

  const handleCreateTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Preencha o título e o conteúdo do tópico.');
      return;
    }

    const discObj = disciplinas.find((d) => d.id === newDisciplinaId);
    const discNome = newDisciplinaId === 'global-koinonia' ? 'Espaço Comunitário Geral' : discObj?.nome || 'Disciplina';

    const created = await createTopic({
      disciplina_id: newDisciplinaId,
      disciplina_nome: discNome,
      autor_email: userEmail,
      autor_nome: userName,
      autor_role: currentRole,
      titulo: newTitle.trim(),
      conteudo: newContent.trim(),
      tipo: newTipo,
      fixado: false,
    });

    setIsModalOpen(false);
    setNewTitle('');
    setNewContent('');
    showToast('Tópico publicado com sucesso!');
    loadTopicsList(true);
    setSelectedTopic(created);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic || !replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const added = await addTopicReply(selectedTopic.id, {
        autor_email: userEmail,
        autor_nome: userName,
        autor_role: currentRole,
        conteudo: replyText.trim(),
      });

      setReplyText('');
      showToast('Sua resposta foi publicada no fórum!');

      // Atualiza o estado do tópico para desbloquear as respostas se for P&R
      const updatedTopic = { ...selectedTopic, usuario_ja_respondeu: true };
      setSelectedTopic(updatedTopic);
      loadRepliesForTopic(updatedTopic);
      loadTopicsList();
    } catch (e) {
      console.error('Erro ao enviar resposta:', e);
    } finally {
      setSubmittingReply(false);
    }
  };

  const getTipoBadge = (tipo: ForumTipo) => {
    switch (tipo) {
      case 'P_E_R':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-600" /> Fórum P&R (Anti-Plágio)
          </span>
        );
      case 'LIVRE_KOINONIA':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <Coffee className="w-3 h-3 text-emerald-600" /> Hora do Café (Koinonia)
          </span>
        );
      case 'TEMATICO':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-blue-600" /> Debate Temático
          </span>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md text-[9px] font-black uppercase">Coordenação</span>;
      case 'professor':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[9px] font-black uppercase">Professor</span>;
      case 'monitor':
        return <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded-md text-[9px] font-black uppercase">Monitor</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[9px] font-bold uppercase">Seminarista</span>;
    }
  };

  const filteredTopics = topics.filter((t) => {
    const matchesType = selectedFilter === 'TODOS' || t.tipo === selectedFilter;
    const matchesSearch = 
      t.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.conteudo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.autor_nome.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* HEADER DA COMUNIDADE ACADÊMICA & KOINONIA */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-black uppercase tracking-wider">
              Comunidade & Interação
            </span>
            <span className="text-xs text-gray-400 font-medium">Koinonia-LMS 2026.2</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Fórum Acadêmico & Espaço Koinonia</span>
            <Coffee className="w-5 h-5 text-amber-600" />
          </h1>
          <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
            Espaço síncrono e assíncrono para debates teológicos, debates por <strong>Fórum P&R (Perguntas & Respostas autorais)</strong> e socialização comunitária informal.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => loadTopicsList(true)}
            disabled={refreshing}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-xl transition cursor-pointer"
            title="Atualizar tópicos"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Tópico</span>
          </button>
        </div>
      </div>

      {/* VISÃO 1: DETALHE DO TÓPICO SELECIONADO COM RESPOSTAS */}
      {selectedTopic ? (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <button
            onClick={() => setSelectedTopic(null)}
            className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Lista de Tópicos</span>
          </button>

          {/* Card Principal do Tópico */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                {getTipoBadge(selectedTopic.tipo)}
                <span className="text-xs font-bold text-gray-500">{selectedTopic.disciplina_nome}</span>
              </div>
              <span className="text-[11px] text-gray-400">
                Publicado em {new Date(selectedTopic.criado_em).toLocaleDateString('pt-BR')} às {new Date(selectedTopic.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-base sm:text-lg font-black text-gray-900">{selectedTopic.titulo}</h2>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">{selectedTopic.conteudo}</p>
            </div>

            <div className="flex items-center gap-2 pt-2 text-xs text-gray-500 border-t border-gray-100">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                {selectedTopic.autor_nome.charAt(0)}
              </div>
              <div>
                <span className="font-bold text-gray-900">{selectedTopic.autor_nome}</span>
                <span className="ml-2">{getRoleBadge(selectedTopic.autor_role)}</span>
              </div>
            </div>
          </div>

          {/* Banner Pedagógico se for Fórum P&R */}
          {selectedTopic.tipo === 'P_E_R' && (
            <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
              selectedTopic.usuario_ja_respondeu || currentRole === 'professor' || currentRole === 'admin'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                : 'bg-amber-50/80 border-amber-200 text-amber-800'
            }`}>
              {selectedTopic.usuario_ja_respondeu || currentRole === 'professor' || currentRole === 'admin' ? (
                <>
                  <Unlock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Fórum P&R Desbloqueado!</strong>
                    <span>Você já enviou sua resposta autoral. Todas as contribuições dos outros seminaristas estão visíveis para leitura e réplica.</span>
                  </div>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Regra Pedagógica P&R (Perguntas & Respostas):</strong>
                    <span>Para estimular a reflexão individual e mitigar o plágio, as respostas dos outros colegas estão ocultas. <strong>Publique sua resposta abaixo para desbloquear o debate.</strong></span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Lista de Respostas / Comentários */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">
              Contribuições e Respostas ({replies.length})
            </h3>

            {loadingReplies ? (
              <div className="p-8 text-center text-xs text-gray-400">Carregando respostas da turma...</div>
            ) : replies.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-xs text-gray-500">
                Seja o primeiro a responder a este tópico!
              </div>
            ) : (
              replies.map((reply) => {
                const isLocked = reply.conteudo.includes('🔒');
                return (
                  <div 
                    key={reply.id} 
                    className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all space-y-2.5 ${
                      isLocked ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-[10px]">
                          {reply.autor_nome.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900">{reply.autor_nome}</span>
                        {getRoleBadge(reply.autor_role)}
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(reply.criado_em).toLocaleDateString('pt-BR')} às {new Date(reply.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed whitespace-pre-line ${
                      isLocked ? 'text-amber-800 font-medium italic' : 'text-gray-700'
                    }`}>
                      {reply.conteudo}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Formulário de Envio de Resposta */}
          <form onSubmit={handleSendReply} className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
            <label className="text-xs font-bold text-gray-700 block">Sua Contribuição no Fórum:</label>
            <textarea
              rows={3}
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Digite sua reflexão teológica, dúvida ou contribuição comunitária..."
              className="w-full text-xs text-gray-900 p-3.5 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingReply || !replyText.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingReply ? 'Publicando...' : 'Publicar Resposta'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* VISÃO 2: LISTA GERAL DE TÓPICOS E FILTROS */
        <div className="space-y-4">
          {/* Barra de Filtros e Busca */}
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'TODOS', label: 'Todos os Tópicos' },
                { id: 'TEMATICO', label: 'Temáticos' },
                { id: 'P_E_R', label: 'Fóruns P&R (Perguntas)' },
                { id: 'LIVRE_KOINONIA', label: '☕ Hora do Café (Livre)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedFilter === f.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar tópicos ou autores..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-gray-50/50"
                />
              </div>

              <select
                value={selectedDisciplina}
                onChange={(e) => setSelectedDisciplina(e.target.value)}
                className="text-xs font-bold bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-1.5 focus:outline-hidden"
              >
                <option value="todas">Todas as Disciplinas</option>
                <option value="global-koinonia">☕ Espaço Geral Koinonia</option>
                {disciplinas.map((d) => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards de Tópicos */}
          <div className="space-y-3">
            {loading ? (
              <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-xs text-gray-400">
                Carregando fóruns acadêmicos...
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-2">
                <Coffee className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs font-bold text-gray-500">Nenhum tópico encontrado para os filtros selecionados.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Criar o primeiro tópico agora →
                </button>
              </div>
            ) : (
              filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className="bg-white p-5 rounded-3xl border border-gray-200/80 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {topic.fixado && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[9px] font-black flex items-center gap-0.5">
                          <Pin className="w-2.5 h-2.5" /> Fixado
                        </span>
                      )}
                      {getTipoBadge(topic.tipo)}
                      <span className="text-xs font-bold text-gray-500">{topic.disciplina_nome}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {new Date(topic.criado_em).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-black text-gray-900 group-hover:text-blue-600 transition">
                      {topic.titulo}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {topic.conteudo}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                        {topic.autor_nome.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-700">{topic.autor_nome}</span>
                      {getRoleBadge(topic.autor_role)}
                    </div>

                    <div className="flex items-center gap-1 text-blue-600 font-bold group-hover:translate-x-1 transition">
                      <span>{topic.respostas_count || 0} respostas</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL PARA CRIAR NOVO TÓPICO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-2xl space-y-4 text-left my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">Criar Novo Tópico de Debate</h3>
                <p className="text-xs text-gray-500">Inicie uma discussão temática ou compartilhe no espaço livre</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTopicSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Título do Tópico *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Como interpretar o termo Logos no Evangelho de João?"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Disciplina / Espaço</label>
                  <select
                    value={newDisciplinaId}
                    onChange={(e) => setNewDisciplinaId(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:outline-hidden"
                  >
                    <option value="global-koinonia">☕ Espaço Geral Koinonia (Livre)</option>
                    {disciplinas.map((d) => (
                      <option key={d.id} value={d.id}>{d.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Tipo de Fórum</label>
                  <select
                    value={newTipo}
                    onChange={(e) => setNewTipo(e.target.value as any)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:outline-hidden"
                  >
                    <option value="TEMATICO">Debate Temático Aberto</option>
                    <option value="P_E_R">Fórum P&R (Respostas Ocultas até Postar)</option>
                    <option value="LIVRE_KOINONIA">☕ Hora do Café (Socialização)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Conteúdo ou Pergunta Disparadora *</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Apresente a questão, texto de apoio ou reflexão para os colegas..."
                  className="w-full text-xs font-medium p-3 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow transition cursor-pointer"
                >
                  Publicar Tópico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
