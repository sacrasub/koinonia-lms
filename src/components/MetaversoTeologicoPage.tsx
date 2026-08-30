'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Compass, Box, Sparkles, BookOpen, Layers, Maximize2,
  CheckCircle2, Clock, Award, Download, RefreshCw, Search,
  ExternalLink, ChevronRight, ChevronLeft, ShieldCheck,
  Send, Target, MapPin, Eye, Info, Play, Check, Flame,
  Plus, Edit3, Trash2, RotateCcw
} from 'lucide-react';
import {
  Cenario3D,
  Hotspot3D,
  Missao3D,
  ProgressoExploracao3D,
  UserRole,
} from '@/types';
import {
  getCenarios3D,
  getProgressoDoAluno,
  salvarProgressoExploracao,
  getResumoMetaversoTCC,
  exportarPesquisaMetaversoCSV,
  excluirCenario3D,
  restaurarCenariosPadrao,
} from '@/services/metaverso3dService';
import { Cenario3DFormModal } from '@/components/Cenario3DFormModal';
import { NativoViewer3D } from '@/components/NativoViewer3D';

interface Props {
  userEmail: string;
  userName: string;
  currentRole: UserRole;
  disciplinaId?: string;
}

export const MetaversoTeologicoPage: React.FC<Props> = ({
  userEmail,
  userName,
  currentRole,
  disciplinaId,
}) => {
  const isPrivileged = ['professor', 'admin', 'monitor'].includes(currentRole);

  const [cenarios, setCenarios] = useState<Cenario3D[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');
  const [periodoFiltro, setPeriodoFiltro] = useState<string>('todos');

  // Modal de Criação e Edição de Cenários 3D (Docentes e Monitores)
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [cenarioEmEdicao, setCenarioEmEdicao] = useState<Cenario3D | null>(null);

  // Cenário ativo na Sala Imersiva
  const [cenarioAtivo, setCenarioAtivo] = useState<Cenario3D | null>(null);
  const [hotspotAtivo, setHotspotAtivo] = useState<Hotspot3D | null>(null);
  const [progressoAluno, setProgressoAluno] = useState<ProgressoExploracao3D | null>(null);
  const [modoRender, setModoRender] = useState<'nativo' | 'sketchfab'>('nativo');

  // Reflexão e tempo de sessão
  const [tempoSessaoSegundos, setTempoSessaoSegundos] = useState<number>(0);
  const [textoReflexao, setTextoReflexao] = useState<string>('');
  const [salvandoReflexao, setSalvandoReflexao] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Carrega os cenários
  const carregarCenarios = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const lista = await getCenarios3D(disciplinaId, force);
      setCenarios(lista);
    } catch (e) {
      showToast('Erro ao carregar cenários 3D.');
    } finally {
      setLoading(false);
    }
  }, [disciplinaId]);

  useEffect(() => {
    carregarCenarios();
    const handleUpd = () => carregarCenarios(true);
    window.addEventListener('lms_metaverso_updated', handleUpd);
    return () => window.removeEventListener('lms_metaverso_updated', handleUpd);
  }, [carregarCenarios]);

  // Gestão da Sala Imersiva (Inicia contador de tempo)
  const entrarNoCenario = async (cenario: Cenario3D) => {
    setCenarioAtivo(cenario);
    setHotspotAtivo(cenario.hotspots[0] || null);
    setTempoSessaoSegundos(0);

    const prog = await getProgressoDoAluno(cenario.id, userEmail);
    setProgressoAluno(prog);
    setTextoReflexao(prog?.reflexao_aluno || '');

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTempoSessaoSegundos((prev) => prev + 1);
    }, 1000);
  };

  const sairDoCenario = async () => {
    if (cenarioAtivo && tempoSessaoSegundos > 5) {
      await salvarProgressoExploracao(
        cenarioAtivo.id,
        userEmail,
        userName || userEmail.split('@')[0],
        undefined,
        undefined,
        tempoSessaoSegundos,
        textoReflexao
      );
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setCenarioAtivo(null);
    setHotspotAtivo(null);
    carregarCenarios(true);
  };

  // Clicar em Hotspot
  const handleSelecionarHotspot = async (hotspot: Hotspot3D) => {
    setHotspotAtivo(hotspot);
    if (cenarioAtivo) {
      const atualizado = await salvarProgressoExploracao(
        cenarioAtivo.id,
        userEmail,
        userName || userEmail.split('@')[0],
        hotspot.id,
        undefined,
        5
      );
      setProgressoAluno(atualizado);
      showToast(`📍 Ponto de interesse visitado: ${hotspot.titulo}`);
    }
  };

  // Completar Missão
  const handleConcluirMissao = async (missao: Missao3D) => {
    if (!cenarioAtivo) return;
    const atualizado = await salvarProgressoExploracao(
      cenarioAtivo.id,
      userEmail,
      userName || userEmail.split('@')[0],
      missao.hotspot_alvo_id,
      missao.id,
      10
    );
    setProgressoAluno(atualizado);
    showToast(`🏆 Missão Concluída: ${missao.titulo} (+${missao.recompensa_pontos} pts)!`);
  };

  // Salvar Reflexão Pastoral
  const handleSalvarReflexao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cenarioAtivo || !textoReflexao.trim()) return;

    setSalvandoReflexao(true);
    try {
      const atualizado = await salvarProgressoExploracao(
        cenarioAtivo.id,
        userEmail,
        userName || userEmail.split('@')[0],
        undefined,
        undefined,
        tempoSessaoSegundos,
        textoReflexao.trim()
      );
      setProgressoAluno(atualizado);
      showToast('📖 Reflexão pastoral gravada com sucesso!');
    } catch {
      showToast('Erro ao gravar reflexão.');
    } finally {
      setSalvandoReflexao(false);
    }
  };

  // Filtros
  const cenariosFiltrados = cenarios.filter((c) => {
    if (periodoFiltro !== 'todos' && !c.periodo_historico.toLowerCase().includes(periodoFiltro.toLowerCase())) {
      return false;
    }
    if (busca.trim()) {
      const b = busca.toLowerCase();
      return (
        c.titulo.toLowerCase().includes(b) ||
        c.descricao.toLowerCase().includes(b) ||
        c.periodo_historico.toLowerCase().includes(b)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-950 text-white text-xs sm:text-sm px-5 py-3.5 rounded-2xl shadow-2xl border border-cyan-500/30 flex items-center gap-2.5 animate-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* HEADER DO METAVERSO TEOLÓGICO */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl border border-cyan-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 backdrop-blur-md">
                <Box className="w-3.5 h-3.5 text-cyan-300" />
                Metaverso Teológico & Arqueologia 3D
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                🌐 Tele-Presença Espacial (Dede, 2009)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                🏛️ Reconstituições Bíblicas Interativas
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ambientes Imersivos de Aprendizagem Bíblica
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
              Explore o Tabernáculo no Sinai, o Templo de Salomão, a Jerusalém do Século I e as Catacumbas de Roma em 3D. Descubra hotspots exegéticos, conclua missões de exploração e conecte a geografia sagrada à teologia prática.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {isPrivileged && (
              <button
                onClick={() => {
                  setCenarioEmEdicao(null);
                  setIsFormModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-lg hover:shadow-cyan-500/20 cursor-pointer"
                title="Criar novo ambiente bíblico tridimensional"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Adicionar Exploração 3D</span>
              </button>
            )}

            <button
              onClick={() => carregarCenarios(true)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 transition-all flex items-center justify-center cursor-pointer"
              title="Atualizar Cenários"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {isPrivileged && (
              <button
                onClick={() => exportarPesquisaMetaversoCSV(cenarios)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-stone-950 font-black text-xs transition-all shadow-md cursor-pointer"
                title="Exportar Métricas Imersivas em formato CSV"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Métricas (CSV)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODO 1: SALA IMERSIVA 3D (QUANDO UM CENÁRIO ESTÁ ABERTO)                  */}
      {/* ========================================================================= */}
      {cenarioAtivo ? (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          {/* Barra Superior da Sala Imersiva */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center gap-3">
              <button
                onClick={sairDoCenario}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar ao Catálogo</span>
              </button>
              <div>
                <h3 className="text-sm font-black text-white">{cenarioAtivo.titulo}</h3>
                <p className="text-[10px] text-cyan-300">{cenarioAtivo.periodo_historico}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-cyan-400 font-bold bg-cyan-950/60 px-3 py-1 rounded-xl border border-cyan-800/60">
                <Clock className="w-3.5 h-3.5" />
                <span>Tempo de Imersão: {Math.floor(tempoSessaoSegundos / 60)}:{(tempoSessaoSegundos % 60).toString().padStart(2, '0')}</span>
              </span>
              <span className="flex items-center gap-1 text-amber-300 font-bold bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-800/60">
                <Target className="w-3.5 h-3.5" />
                <span>Missões: {progressoAluno?.missoes_completadas.length || 0}/{cenarioAtivo.missoes.length}</span>
              </span>
            </div>
          </div>

          {/* Grid Principal do Explorador: Visualizador 3D + Painel de Hotspots */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visualizador 3D Interativo */}
            <div className="lg:col-span-2 space-y-4">
              {/* Seletor de Renderizador 3D */}
              <div className="flex items-center justify-between gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setModoRender('nativo')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      modoRender === 'nativo'
                        ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-white bg-slate-800/50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>🎮 Maquete 3D Nativa (LMS WebGL)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModoRender('sketchfab')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      modoRender === 'sketchfab'
                        ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-white bg-slate-800/50'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>🌐 Embed Externo (Sketchfab)</span>
                  </button>
                </div>

                <span className="text-[10px] text-slate-400 px-2 font-mono">
                  {modoRender === 'nativo' ? '✓ Render 60 FPS Ativo' : 'URL Externa'}
                </span>
              </div>

              {/* Viewport 3D */}
              {modoRender === 'nativo' ? (
                <NativoViewer3D
                  cenario={cenarioAtivo}
                  hotspotAtivo={hotspotAtivo}
                  onSelecionarHotspot={handleSelecionarHotspot}
                />
              ) : (
                <div className="space-y-2">
                  <div className="relative w-full h-[450px] sm:h-[550px] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                    <iframe
                      title={cenarioAtivo.titulo}
                      src={cenarioAtivo.modelo_url}
                      className="w-full h-full border-0"
                      allow="autoplay; fullscreen; xr-spatial-tracking"
                      allowFullScreen
                    />

                    {/* Badge Overlay */}
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-[11px] font-bold text-white flex items-center gap-1.5 pointer-events-none">
                      <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                      <span>Controles: Clique e arraste para orbitar · Role para zoom</span>
                    </div>
                  </div>

                  <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-2xl flex items-center justify-between gap-2 text-xs text-cyan-200">
                    <span className="text-[11px]">
                      💡 Se o link do Sketchfab der erro 404, use a <strong>Maquete 3D Nativa</strong> que funciona sem depender da internet externa.
                    </span>
                    <button
                      type="button"
                      onClick={() => setModoRender('nativo')}
                      className="px-3 py-1 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-cyan-400 shrink-0 cursor-pointer"
                    >
                      Abrir Maquete Nativa
                    </button>
                  </div>
                </div>
              )}

              {/* Caderno de Campo & Reflexão Pastoral do Aluno */}
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-700" />
                  <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                    Caderno de Campo Arqueológico & Reflexão Pastoral
                  </h4>
                </div>
                <form onSubmit={handleSalvarReflexao} className="space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Registre suas impressões teológicas, exegéticas e pastorais ao explorar este cenário sagrado..."
                    value={textoReflexao}
                    onChange={(e) => setTextoReflexao(e.target.value)}
                    className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-stone-400">Suas reflexões são salvas e enriquecem o seu portfólio acadêmico.</span>
                    <button
                      type="submit"
                      disabled={salvandoReflexao}
                      className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{salvandoReflexao ? 'Salvando...' : 'Salvar no Caderno'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Painel Lateral: Hotspots Exegéticos & Missões */}
            <div className="space-y-5">
              {/* Hotspots de Interesse */}
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                  <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Hotspots Exegéticos ({cenarioAtivo.hotspots.length})</span>
                  </h4>
                  <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md">
                    {progressoAluno?.hotspots_visitados.length || 0} visitados
                  </span>
                </div>

                <div className="space-y-2">
                  {cenarioAtivo.hotspots.map((h, idx) => {
                    const isVisitado = progressoAluno?.hotspots_visitados.includes(h.id);
                    const isSelecionado = hotspotAtivo?.id === h.id;
                    return (
                      <button
                        key={h.id}
                        onClick={() => handleSelecionarHotspot(h)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start justify-between gap-2 cursor-pointer ${
                          isSelecionado
                            ? 'bg-cyan-50 border-cyan-300 shadow-xs'
                            : 'bg-stone-50 border-stone-200/80 hover:bg-stone-100'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black w-4 h-4 rounded-full bg-cyan-700 text-white flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-stone-900">{h.titulo}</span>
                          </div>
                          {h.texto_biblico && (
                            <span className="text-[10px] font-semibold text-cyan-800 block pl-5.5">
                              📖 {h.texto_biblico}
                            </span>
                          )}
                        </div>
                        {isVisitado && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>

                {/* Detalhe do Hotspot Ativo */}
                {hotspotAtivo && (
                  <div className="p-4 bg-gradient-to-br from-cyan-50 to-indigo-50/50 rounded-2xl border border-cyan-200/80 space-y-2 animate-in fade-in">
                    <span className="text-[10px] font-black text-cyan-900 uppercase tracking-wider block">
                      Nota Arqueológica & Exegética:
                    </span>
                    <p className="text-xs text-stone-800 leading-relaxed">{hotspotAtivo.nota_exegetica}</p>
                    {hotspotAtivo.texto_biblico && (
                      <div className="pt-2 border-t border-cyan-200/60 text-[11px] font-bold text-cyan-900">
                        Referência: {hotspotAtivo.texto_biblico}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Missões de Exploração */}
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                  <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-600" />
                    <span>Missões Arqueológicas</span>
                  </h4>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                    +{cenarioAtivo.missoes.reduce((acc, m) => acc + m.recompensa_pontos, 0)} pts total
                  </span>
                </div>

                <div className="space-y-2.5">
                  {cenarioAtivo.missoes.map((m) => {
                    const isConcluida = progressoAluno?.missoes_completadas.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        className={`p-3 rounded-2xl border space-y-2 ${
                          isConcluida ? 'bg-emerald-50/60 border-emerald-200' : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-bold text-stone-900">{m.titulo}</span>
                          <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">
                            +{m.recompensa_pontos} pts
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 leading-snug">{m.pergunta_desafio}</p>
                        <div className="flex justify-end">
                          {isConcluida ? (
                            <span className="text-[10px] font-black text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Missão Cumprida!
                            </span>
                          ) : (
                            <button
                              onClick={() => handleConcluirMissao(m)}
                              className="px-3 py-1 bg-stone-900 hover:bg-black text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                            >
                              Validar Localização
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* MODO 2: CATÁLOGO DE CENÁRIOS 3D                                           */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Filtros e Busca */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'todos', label: 'Todos os Períodos' },
                { id: 'antigo', label: '⛺ Antigo Testamento' },
                { id: 'monarquia', label: '👑 Templo de Salomão' },
                { id: 'novo', label: '✝️ Século I (Jesus)' },
                { id: 'igreja', label: '🏛️ Igreja Primitiva' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setPeriodoFiltro(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    periodoFiltro === f.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por santuário, período..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Grid de Cenários */}
          {cenariosFiltrados.length === 0 ? (
            <div className="bg-stone-50 p-12 rounded-3xl border border-dashed border-stone-200 text-center space-y-2">
              <Box className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-600">Nenhum cenário 3D encontrado para os filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cenariosFiltrados.map((cenario) => (
                <div
                  key={cenario.id}
                  className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Imagem de Capa com Badge e Ações de Gestão */}
                    <div className="relative h-48 w-full overflow-hidden bg-stone-950">
                      <img
                        src={cenario.imagem_capa}
                        alt={cenario.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500 text-stone-950">
                          {cenario.periodo_historico}
                        </span>
                      </div>

                      {/* Botões de Ação para Professores e Monitores */}
                      {isPrivileged && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCenarioEmEdicao(cenario);
                              setIsFormModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-slate-900/85 hover:bg-cyan-600 text-white text-[11px] font-extrabold shadow-md backdrop-blur-md flex items-center gap-1 border border-white/20 transition cursor-pointer"
                            title="Editar este cenário e hotspots 3D"
                          >
                            <Edit3 className="w-3 h-3 text-cyan-300" />
                            <span>Editar 3D</span>
                          </button>

                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm(`Deseja realmente excluir o ambiente "${cenario.titulo}"?`)) {
                                await excluirCenario3D(cenario.id);
                                showToast(`🗑️ Cenário "${cenario.titulo}" removido.`);
                                carregarCenarios(true);
                              }
                            }}
                            className="p-1.5 rounded-xl bg-slate-900/85 hover:bg-red-600 text-slate-300 hover:text-white shadow-md backdrop-blur-md transition border border-white/20 cursor-pointer"
                            title="Excluir este ambiente 3D"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="text-[10px] font-bold text-cyan-300 block uppercase tracking-wider">
                          {cenario.disciplina_name}
                        </span>
                        <h3 className="text-lg font-black text-white leading-tight">{cenario.titulo}</h3>
                      </div>
                    </div>

                    {/* Descrição e Hotspots */}
                    <div className="p-5 space-y-3">
                      <p className="text-xs text-stone-600 leading-relaxed">{cenario.descricao}</p>

                      <div className="flex items-center gap-3 pt-2 border-t border-stone-100 text-xs">
                        <span className="flex items-center gap-1 font-bold text-stone-700">
                          <MapPin className="w-3.5 h-3.5 text-rose-600" />
                          <span>{cenario.hotspots.length} Hotspots Exegéticos</span>
                        </span>
                        <span className="flex items-center gap-1 font-bold text-stone-700">
                          <Target className="w-3.5 h-3.5 text-amber-600" />
                          <span>{cenario.missoes.length} Missões</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Exploração */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => entrarNoCenario(cenario)}
                      className="w-full py-3 bg-gradient-to-r from-cyan-700 to-indigo-800 hover:from-cyan-800 hover:to-indigo-900 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-101"
                    >
                      <Play className="w-3.5 h-3.5 text-cyan-300 fill-cyan-300" />
                      <span>Iniciar Exploração 3D & Metaverso</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE CRIAÇÃO E EDIÇÃO DE CENÁRIOS 3D */}
      <Cenario3DFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setCenarioEmEdicao(null);
        }}
        cenarioParaEditar={cenarioEmEdicao}
        onSuccess={(cenarioSalvo) => {
          showToast(`✓ Ambiente 3D "${cenarioSalvo.titulo}" salvo com sucesso!`);
          carregarCenarios(true);
        }}
      />
    </div>
  );
};
