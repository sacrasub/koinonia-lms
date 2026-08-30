'use client';

import { useState, useEffect, useRef } from 'react';
import { PortfolioItem, RubricaFeedback, NivelDesempenho, TipoArtefato, UserRole } from '@/types';

interface Props {
  userEmail: string;
  userName: string;
  userRole: UserRole;
  disciplinaId?: string;
  disciplinaName?: string;
}

const TIPO_ARTEFATO_CONFIG: Record<TipoArtefato, { label: string; icone: string; cor: string }> = {
  ensaio: { label: 'Ensaio Teológico', icone: '📄', cor: 'bg-blue-900/40 border-blue-700 text-blue-300' },
  esboco_sermao: { label: 'Esboço de Sermão', icone: '📖', cor: 'bg-purple-900/40 border-purple-700 text-purple-300' },
  audio: { label: 'Gravação de Áudio', icone: '🎙️', cor: 'bg-rose-900/40 border-rose-700 text-rose-300' },
  video: { label: 'Vídeo Reflexivo', icone: '🎥', cor: 'bg-amber-900/40 border-amber-700 text-amber-300' },
  mapa_mental: { label: 'Mapa Mental', icone: '🧠', cor: 'bg-cyan-900/40 border-cyan-700 text-cyan-300' },
  projeto: { label: 'Projeto Pastoral', icone: '🏗️', cor: 'bg-emerald-900/40 border-emerald-700 text-emerald-300' },
  reflexao: { label: 'Reflexão Escrita', icone: '💭', cor: 'bg-indigo-900/40 border-indigo-700 text-indigo-300' },
  outro: { label: 'Outro', icone: '📎', cor: 'bg-slate-800 border-slate-700 text-slate-300' },
};

const NIVEL_CONFIG: Record<NivelDesempenho, { label: string; cor: string; barra: string; icone: string }> = {
  insatisfatorio: { label: 'Insatisfatório', cor: 'text-red-400', barra: 'bg-red-500', icone: '❌' },
  em_desenvolvimento: { label: 'Em Desenvolvimento', cor: 'text-amber-400', barra: 'bg-amber-500', icone: '🔄' },
  proficiente: { label: 'Proficiente', cor: 'text-blue-400', barra: 'bg-blue-500', icone: '✅' },
  excelente: { label: 'Excelente', cor: 'text-emerald-400', barra: 'bg-emerald-500', icone: '⭐' },
};

const NIVEL_BARRA_LARGURA: Record<NivelDesempenho, string> = {
  insatisfatorio: 'w-1/4',
  em_desenvolvimento: 'w-2/4',
  proficiente: 'w-3/4',
  excelente: 'w-full',
};

const STATUS_BADGE: Record<string, { label: string; cor: string }> = {
  rascunho: { label: 'Rascunho', cor: 'bg-slate-700 text-slate-300' },
  enviado: { label: 'Enviado', cor: 'bg-blue-900/50 text-blue-300 border border-blue-700' },
  avaliado: { label: 'Avaliado', cor: 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' },
  revisao: { label: 'Em Revisão', cor: 'bg-amber-900/50 text-amber-300 border border-amber-700' },
};

const CRITERIOS_PADRAO = [
  { nome: 'Fundamentação Teológica', descricao: 'Uso adequado das fontes bíblicas, patrísticas e sistemáticas' },
  { nome: 'Clareza e Coerência', descricao: 'Estrutura lógica, clareza da argumentação e coesão textual' },
  { nome: 'Reflexão Crítica', descricao: 'Capacidade de análise crítica e contextualização contemporânea' },
  { nome: 'Aplicação Pastoral', descricao: 'Relevância prática para o exercício do ministério pastoral' },
];

export default function PortfolioMediador({ userEmail, userName, userRole, disciplinaId, disciplinaName }: Props) {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lista' | 'enviar' | 'avaliar'>('lista');
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  const isPrivileged = ['professor', 'admin', 'monitor'].includes(userRole);

  // Formulário de envio
  const [novoForm, setNovoForm] = useState({
    titulo_artefato: '',
    descricao_artefato: '',
    tipo_artefato: 'ensaio' as TipoArtefato,
    url_artefato_drive: '',
    autoavaliacao_texto: '',
    semana_referencia: '',
    avaliacao_tipo: 'AV1' as 'AV1' | 'AV2' | 'formativa' | 'recuperacao',
  });

  // Formulário de rubrica
  const [rubricas, setRubricas] = useState(CRITERIOS_PADRAO.map((c) => ({
    criterio_nome: c.nome,
    criterio_descricao: c.descricao,
    nivel_desempenho: '' as NivelDesempenho | '',
    nota_atribuida: '',
    feedback_qualitativo_tutor: '',
  })));

  useEffect(() => { carregarPortfolios(); }, [disciplinaId, userRole]);

  async function carregarPortfolios() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: userRole });
      if (disciplinaId) params.set('disciplina_id', disciplinaId);
      if (userRole === 'aluno') params.set('aluno_email', userEmail);
      const res = await fetch(`/api/portfolio?${params}`);
      const data = await res.json();
      setPortfolios(data.portfolios || []);
    } catch (err) {
      console.error('Erro ao carregar portfólios:', err);
    } finally {
      setLoading(false);
    }
  }

  async function enviarPortfolio() {
    setSalvando(true);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aluno_email: userEmail,
          aluno_nome: userName,
          disciplina_id: disciplinaId || '',
          disciplina_name: disciplinaName || '',
          ...novoForm,
          semana_referencia: novoForm.semana_referencia ? parseInt(novoForm.semana_referencia) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMensagem('✅ Artefato enviado para o portfólio!');
      setActiveTab('lista');
      carregarPortfolios();
    } catch (err: any) {
      setMensagem(`❌ Erro: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  }

  async function enviarRubrica() {
    if (!selectedPortfolio) return;
    setSalvando(true);
    try {
      const rubricasValidas = rubricas.filter((r) => r.nivel_desempenho && r.nota_atribuida && r.feedback_qualitativo_tutor);
      if (rubricasValidas.length === 0) {
        setMensagem('❌ Preencha ao menos um critério de rubrica completamente.');
        setSalvando(false);
        return;
      }
      for (const rubrica of rubricasValidas) {
        await fetch('/api/portfolio/rubrica', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            portfolio_id: selectedPortfolio.id,
            ...rubrica,
            nota_atribuida: parseFloat(rubrica.nota_atribuida),
            monitor_email: userEmail,
            monitor_nome: userName,
          }),
        });
      }
      setMensagem('✅ Avaliação registrada com sucesso!');
      setSelectedPortfolio(null);
      setActiveTab('lista');
      carregarPortfolios();
    } catch (err: any) {
      setMensagem(`❌ Erro: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  }

  function atualizarRubrica(idx: number, campo: string, valor: string) {
    const atualizadas = [...rubricas];
    (atualizadas[idx] as any)[campo] = valor;
    setRubricas(atualizadas);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-slate-400">Carregando Portfólios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white/5 text-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-2xl">🗂️</div>
          <div>
            <h1 className="text-2xl font-bold text-white">Portfólio Mediador</h1>
            <p className="text-slate-400 text-sm">Avaliação qualitativa por rubricas e trilha reflexiva</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4 border-b border-slate-800">
          <button onClick={() => setActiveTab('lista')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'lista' ? 'bg-indigo-500/20 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}>
            📁 Portfólios
          </button>
          {userRole === 'aluno' && (
            <button onClick={() => setActiveTab('enviar')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'enviar' ? 'bg-indigo-500/20 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}>
              ➕ Enviar Artefato
            </button>
          )}
          {isPrivileged && (
            <button onClick={() => setActiveTab('avaliar')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'avaliar' ? 'bg-indigo-500/20 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}>
              ✅ Avaliar
            </button>
          )}
        </div>
      </div>

      {mensagem && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${mensagem.startsWith('✅') ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700' : 'bg-red-900/40 text-red-300 border border-red-700'}`}>
          {mensagem}
          <button onClick={() => setMensagem('')} className="ml-3 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* === ABA: LISTA DE PORTFÓLIOS === */}
      {activeTab === 'lista' && (
        <div className="space-y-4">
          {portfolios.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <div className="text-6xl mb-4">🗂️</div>
              <p className="text-lg font-medium text-slate-400">Nenhum artefato no portfólio ainda</p>
              {userRole === 'aluno' && (
                <button onClick={() => setActiveTab('enviar')} className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors">
                  Enviar Primeiro Artefato
                </button>
              )}
            </div>
          ) : (
            portfolios.map((p) => {
              const tipoCfg = TIPO_ARTEFATO_CONFIG[p.tipo_artefato] || TIPO_ARTEFATO_CONFIG.outro;
              const statusCfg = STATUS_BADGE[p.status] || STATUS_BADGE.enviado;

              return (
                <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
                  <div className="p-5">
                    <div className="flex items-start gap-4 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${tipoCfg.cor}`}>
                        {tipoCfg.icone}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.cor}`}>{statusCfg.label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${tipoCfg.cor}`}>{tipoCfg.label}</span>
                          {p.avaliacao_tipo && <span className="text-xs text-slate-500">• {p.avaliacao_tipo}</span>}
                          {p.semana_referencia && <span className="text-xs text-slate-500">Semana {p.semana_referencia}</span>}
                        </div>
                        <h3 className="font-bold text-white">{p.titulo_artefato}</h3>
                        {p.aluno_nome && isPrivileged && <p className="text-xs text-slate-400">por {p.aluno_nome}</p>}
                        {p.descricao_artefato && <p className="text-slate-400 text-sm mt-1">{p.descricao_artefato}</p>}
                      </div>
                      {p.nota_final !== undefined && p.nota_final !== null && (
                        <div className="text-center bg-slate-800 rounded-xl px-4 py-2 min-w-16">
                          <p className="text-2xl font-bold text-emerald-400">{p.nota_final.toFixed(1)}</p>
                          <p className="text-xs text-slate-500">nota final</p>
                        </div>
                      )}
                    </div>

                    {/* Autoavaliação */}
                    {p.autoavaliacao_texto && (
                      <div className="bg-slate-800/60 rounded-xl p-3 mb-3 border border-slate-700">
                        <p className="text-xs text-indigo-400 font-semibold mb-1">💭 Autoavaliação do Aluno</p>
                        <p className="text-slate-300 text-sm">{p.autoavaliacao_texto}</p>
                      </div>
                    )}

                    {/* Rubricas */}
                    {p.rubricas && p.rubricas.length > 0 && (
                      <div className="space-y-2 mb-3">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Avaliação por Rubricas</p>
                        {p.rubricas.map((r) => {
                          const nivelCfg = r.nivel_desempenho ? NIVEL_CONFIG[r.nivel_desempenho] : null;
                          return (
                            <div key={r.id} className="bg-slate-800/40 rounded-lg p-3 border border-slate-700">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-white">{r.criterio_nome}</span>
                                <div className="flex items-center gap-2">
                                  {nivelCfg && <span className={`text-xs font-medium ${nivelCfg.cor}`}>{nivelCfg.icone} {nivelCfg.label}</span>}
                                  <span className="text-sm font-bold text-emerald-400">{r.nota_atribuida}/10</span>
                                </div>
                              </div>
                              {/* Barra de nível */}
                              {r.nivel_desempenho && (
                                <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                                  <div className={`h-1.5 rounded-full transition-all ${nivelCfg?.barra || 'bg-slate-500'} ${NIVEL_BARRA_LARGURA[r.nivel_desempenho]}`}></div>
                                </div>
                              )}
                              <p className="text-slate-400 text-xs">{r.feedback_qualitativo_tutor}</p>
                              {r.monitor_nome && <p className="text-slate-600 text-xs mt-1">— {r.monitor_nome}</p>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {p.url_artefato_drive && (
                        <a href={p.url_artefato_drive} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700 text-blue-300 rounded-lg text-xs transition-colors">
                          📁 Abrir no Drive
                        </a>
                      )}
                      {isPrivileged && p.status !== 'avaliado' && (
                        <button
                          onClick={() => { setSelectedPortfolio(p); setActiveTab('avaliar'); }}
                          className="px-3 py-1.5 bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-700 text-indigo-300 rounded-lg text-xs transition-colors"
                        >
                          ✅ Avaliar com Rubrica
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* === ABA: ENVIAR ARTEFATO (aluno) === */}
      {activeTab === 'enviar' && userRole === 'aluno' && (
        <div className="max-w-xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-indigo-400">➕ Enviar Artefato para o Portfólio</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Título do Artefato*</label>
                <input
                  value={novoForm.titulo_artefato}
                  onChange={(e) => setNovoForm({ ...novoForm, titulo_artefato: e.target.value })}
                  placeholder="Ex: Ensaio sobre Cristologia Reformada"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tipo de Artefato*</label>
                <select
                  value={novoForm.tipo_artefato}
                  onChange={(e) => setNovoForm({ ...novoForm, tipo_artefato: e.target.value as TipoArtefato })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  {Object.entries(TIPO_ARTEFATO_CONFIG).map(([val, cfg]) => (
                    <option key={val} value={val}>{cfg.icone} {cfg.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Avaliação</label>
                <select
                  value={novoForm.avaliacao_tipo}
                  onChange={(e) => setNovoForm({ ...novoForm, avaliacao_tipo: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="AV1">AV1</option>
                  <option value="AV2">AV2</option>
                  <option value="formativa">Formativa</option>
                  <option value="recuperacao">Recuperação</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Descrição (opcional)</label>
                <textarea
                  value={novoForm.descricao_artefato}
                  onChange={(e) => setNovoForm({ ...novoForm, descricao_artefato: e.target.value })}
                  rows={2}
                  placeholder="Breve descrição do artefato..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Link do Google Drive</label>
                <input
                  value={novoForm.url_artefato_drive}
                  onChange={(e) => setNovoForm({ ...novoForm, url_artefato_drive: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">💭 Autoavaliação Metacognitiva</label>
                <textarea
                  value={novoForm.autoavaliacao_texto}
                  onChange={(e) => setNovoForm({ ...novoForm, autoavaliacao_texto: e.target.value })}
                  rows={3}
                  placeholder="O que aprendi ao produzir este artefato? Quais foram os desafios? Como isso se conecta com minha vocação pastoral?"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            <button
              onClick={enviarPortfolio}
              disabled={salvando || !novoForm.titulo_artefato}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all"
            >
              {salvando ? '⏳ Enviando...' : '➕ Adicionar ao Portfólio'}
            </button>
          </div>
        </div>
      )}

      {/* === ABA: AVALIAR COM RUBRICA (monitor/professor) === */}
      {activeTab === 'avaliar' && isPrivileged && (
        <div className="max-w-2xl mx-auto">
          {!selectedPortfolio ? (
            <div>
              <p className="text-slate-400 text-sm mb-4">Selecione um portfólio para avaliar:</p>
              <div className="space-y-3">
                {portfolios.filter((p) => p.status !== 'avaliado').map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPortfolio(p)}
                    className="w-full text-left bg-slate-900 border border-slate-800 hover:border-indigo-700 rounded-xl p-4 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{TIPO_ARTEFATO_CONFIG[p.tipo_artefato]?.icone || '📄'}</span>
                      <div>
                        <p className="font-medium text-white">{p.titulo_artefato}</p>
                        <p className="text-xs text-slate-400">{p.aluno_nome} • {p.disciplina_name} • {p.avaliacao_tipo}</p>
                      </div>
                    </div>
                  </button>
                ))}
                {portfolios.filter((p) => p.status !== 'avaliado').length === 0 && (
                  <p className="text-slate-500 text-center py-8">Todos os portfólios já foram avaliados 🎉</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-indigo-400">✅ Avaliar Portfólio</h2>
                  <p className="text-slate-400 text-sm">{selectedPortfolio.titulo_artefato} • {selectedPortfolio.aluno_nome}</p>
                </div>
                <button onClick={() => setSelectedPortfolio(null)} className="text-slate-500 hover:text-white">✕</button>
              </div>

              {selectedPortfolio.autoavaliacao_texto && (
                <div className="bg-indigo-950/30 border border-indigo-800/30 rounded-xl p-3">
                  <p className="text-xs text-indigo-400 font-semibold mb-1">💭 Autoavaliação do Aluno</p>
                  <p className="text-slate-300 text-sm">{selectedPortfolio.autoavaliacao_texto}</p>
                </div>
              )}

              <div className="space-y-4">
                {rubricas.map((r, idx) => (
                  <div key={idx} className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 space-y-3">
                    <div>
                      <p className="font-medium text-white text-sm">{r.criterio_nome}</p>
                      <p className="text-xs text-slate-400">{r.criterio_descricao}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Nível de Desempenho</label>
                        <select
                          value={r.nivel_desempenho}
                          onChange={(e) => atualizarRubrica(idx, 'nivel_desempenho', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Selecionar...</option>
                          {Object.entries(NIVEL_CONFIG).map(([val, cfg]) => (
                            <option key={val} value={val}>{cfg.icone} {cfg.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Nota (0–10)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={r.nota_atribuida}
                          onChange={(e) => atualizarRubrica(idx, 'nota_atribuida', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Feedback Qualitativo*</label>
                      <textarea
                        value={r.feedback_qualitativo_tutor}
                        onChange={(e) => atualizarRubrica(idx, 'feedback_qualitativo_tutor', e.target.value)}
                        rows={2}
                        placeholder="Descreva pontos positivos e sugestões de melhoria..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={enviarRubrica}
                disabled={salvando}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all"
              >
                {salvando ? '⏳ Salvando...' : '✅ Registrar Avaliação por Rubrica'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
