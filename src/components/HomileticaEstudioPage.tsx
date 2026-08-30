'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, Video, Play, Pause, Square, Upload, Star, MessageSquare,
  Award, BookOpen, Sparkles, CheckCircle2, AlertCircle, RefreshCw,
  Download, Filter, Search, ChevronDown, ChevronUp, User, Clock,
  ExternalLink, Layers, ShieldCheck, Heart, Trash2, Send, BarChart3,
  ThumbsUp, Lightbulb
} from 'lucide-react';
import {
  PraticaHomiletica,
  PeerReviewHomiletica,
  TipoPraticaHomiletica,
  TipoMidiaPratica,
  UserRole,
} from '@/types';
import {
  getPraticas,
  getPeerReviewsDaPratica,
  publicarPratica,
  salvarPeerReview,
  salvarAvaliacaoDocente,
  getResumoEstatisticoHomiletica,
  exportarPesquisaHomileticaCSV,
} from '@/services/homileticaEstudioService';

interface Props {
  userEmail: string;
  userName: string;
  currentRole: UserRole;
  disciplinaId?: string;
}

export const HomileticaEstudioPage: React.FC<Props> = ({
  userEmail,
  userName,
  currentRole,
  disciplinaId,
}) => {
  const isPrivileged = ['professor', 'admin', 'monitor'].includes(currentRole);
  const [activeTab, setActiveTab] = useState<'galeria' | 'estudio' | 'docente'>('galeria');

  // Listagem de práticas
  const [praticas, setPraticas] = useState<PraticaHomiletica[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [busca, setBusca] = useState<string>('');

  // Notificações
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modal de Peer Review
  const [praticaAvaliada, setPraticaAvaliada] = useState<PraticaHomiletica | null>(null);
  const [reviewsPraticaAtiva, setReviewsPraticaAtiva] = useState<PeerReviewHomiletica[]>([]);
  const [notaFidelidade, setNotaFidelidade] = useState<number>(5);
  const [notaComunicacao, setNotaComunicacao] = useState<number>(5);
  const [notaAplicacao, setNotaAplicacao] = useState<number>(5);
  const [pontoForte, setPontoForte] = useState<string>('');
  const [oportunidadeMelhoria, setOportunidadeMelhoria] = useState<string>('');
  const [comentarioGeral, setComentarioGeral] = useState<string>('');
  const [enviandoReview, setEnviandoReview] = useState<boolean>(false);

  // Modal / Formulário de Avaliação Docente
  const [praticaDocenteModal, setPraticaDocenteModal] = useState<PraticaHomiletica | null>(null);
  const [notaExegese, setNotaExegese] = useState<number>(9.0);
  const [notaEstrutura, setNotaEstrutura] = useState<number>(8.5);
  const [notaPostura, setNotaPostura] = useState<number>(9.0);
  const [feedbackMediador, setFeedbackMediador] = useState<string>('');
  const [enviandoDocente, setEnviandoDocente] = useState<boolean>(false);

  // Estados do Estúdio de Gravação
  const [modoGravacao, setModoGravacao] = useState<TipoMidiaPratica>('audio');
  const [novoTitulo, setNovoTitulo] = useState<string>('');
  const [novoTipo, setNovoTipo] = useState<TipoPraticaHomiletica>('homiletica');
  const [novoTextoBiblico, setNovoTextoBiblico] = useState<string>('');
  const [novoEsboco, setNovoEsboco] = useState<string>('');
  const [novoLinkExterno, setNovoLinkExterno] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isSavingPratica, setIsSavingPratica] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Carregamento de dados
  const carregarDados = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const lista = await getPraticas(disciplinaId, force);
      setPraticas(lista);
    } catch (e) {
      showToast('Erro ao sincronizar práticas.');
    } finally {
      setLoading(false);
    }
  }, [disciplinaId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Controle de Gravação de Áudio no Navegador
  const iniciarGravacao = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Permissão de microfone negada ou microfone indisponível.');
    }
  };

  const pararGravacao = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Envio de Nova Prática
  const handlePublicarPratica = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) {
      showToast('Preencha o título do sermão ou prática.');
      return;
    }

    let finalMidiaUrl = '';
    if (modoGravacao === 'audio') {
      finalMidiaUrl = recordedAudioUrl || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-10781.mp3';
    } else {
      finalMidiaUrl = novoLinkExterno.trim();
    }

    setIsSavingPratica(true);
    try {
      await publicarPratica({
        aluno_email: userEmail,
        aluno_nome: userName || userEmail.split('@')[0],
        disciplina_id: disciplinaId || 'disc-homiletica-1',
        disciplina_name: 'Homilética e Oratória Sacra',
        titulo: novoTitulo.trim(),
        tipo_pratica: novoTipo,
        texto_biblico: novoTextoBiblico.trim(),
        esboco_resumo: novoEsboco.trim(),
        midia_tipo: modoGravacao,
        midia_url: finalMidiaUrl,
        duracao_segundos: recordingSeconds > 0 ? recordingSeconds : 300,
      });

      showToast('🎉 Prática publicada no Estúdio com sucesso!');
      setNovoTitulo('');
      setNovoTextoBiblico('');
      setNovoEsboco('');
      setNovoLinkExterno('');
      setRecordedAudioUrl(null);
      setRecordingSeconds(0);
      setActiveTab('galeria');
      carregarDados(true);
    } catch (err) {
      showToast('Erro ao publicar prática.');
    } finally {
      setIsSavingPratica(false);
    }
  };

  // Envio de Peer Review
  const abrirModalReview = async (pratica: PraticaHomiletica) => {
    setPraticaAvaliada(pratica);
    setNotaFidelidade(5);
    setNotaComunicacao(5);
    setNotaAplicacao(5);
    setPontoForte('');
    setOportunidadeMelhoria('');
    setComentarioGeral('');
    const revs = await getPeerReviewsDaPratica(pratica.id);
    setReviewsPraticaAtiva(revs);
  };

  const handleSalvarReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!praticaAvaliada) return;
    if (!comentarioGeral.trim()) {
      showToast('Por favor, escreva um comentário formativo.');
      return;
    }

    setEnviandoReview(true);
    try {
      await salvarPeerReview({
        pratica_id: praticaAvaliada.id,
        revisor_email: userEmail,
        revisor_nome: userName || userEmail.split('@')[0],
        nota_fidelidade: notaFidelidade,
        nota_comunicacao: notaComunicacao,
        nota_aplicacao: notaAplicacao,
        ponto_forte: pontoForte.trim(),
        oportunidade_melhoria: oportunidadeMelhoria.trim(),
        comentario_geral: comentarioGeral.trim(),
      });

      showToast('🌟 Avaliação por pares enviada com sucesso!');
      setPraticaAvaliada(null);
      carregarDados(true);
    } catch (err) {
      showToast('Erro ao enviar avaliação.');
    } finally {
      setEnviandoReview(false);
    }
  };

  // Envio de Avaliação Docente
  const handleSalvarDocente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!praticaDocenteModal) return;
    if (!feedbackMediador.trim()) {
      showToast('Por favor, registre o feedback mediador.');
      return;
    }

    setEnviandoDocente(true);
    try {
      await salvarAvaliacaoDocente({
        pratica_id: praticaDocenteModal.id,
        avaliador_email: userEmail,
        avaliador_nome: userName || userEmail.split('@')[0],
        avaliador_role: currentRole,
        nota_exegese: Number(notaExegese),
        nota_estrutura: Number(notaEstrutura),
        nota_postura: Number(notaPostura),
        feedback_mediador: feedbackMediador.trim(),
      });

      showToast('✅ Rubrica docente salva com sucesso!');
      setPraticaDocenteModal(null);
      carregarDados(true);
    } catch (err) {
      showToast('Erro ao salvar avaliação docente.');
    } finally {
      setEnviandoDocente(false);
    }
  };

  // Filtros
  const praticasFiltradas = praticas.filter((p) => {
    if (filtroTipo !== 'todos' && p.tipo_pratica !== filtroTipo) return false;
    if (busca.trim()) {
      const b = busca.toLowerCase();
      return (
        p.titulo.toLowerCase().includes(b) ||
        p.aluno_nome.toLowerCase().includes(b) ||
        (p.texto_biblico && p.texto_biblico.toLowerCase().includes(b))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-950 text-white text-xs sm:text-sm px-5 py-3.5 rounded-2xl shadow-2xl border border-rose-500/30 flex items-center gap-2.5 animate-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER DO ESTÚDIO HOMILÉTICO */}
      <div className="bg-gradient-to-r from-rose-900 via-stone-900 to-amber-950 p-6 rounded-3xl text-white shadow-xl border border-rose-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/30 text-rose-200 border border-rose-400/30 backdrop-blur-md">
                <Mic className="w-3.5 h-3.5 text-rose-300" />
                Estúdio de Prática Homilética & Aconselhamento
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                👥 Instrução por Pares (Eric Mazur)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                📝 Avaliação Mediadora (Hoffmann)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Estúdio de Oratória Sacra & Cuidado da Alma
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
              Grave sermões expositivos e simulações de aconselhamento, receba feedbacks construtivos de seus colegas de turma e acompanhe sua evolução ministerial com base em rubricas formativas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => carregarDados(true)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 transition-all flex items-center justify-center cursor-pointer"
              title="Atualizar Práticas"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {isPrivileged && (
              <button
                onClick={() => exportarPesquisaHomileticaCSV(praticas)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs transition-all shadow-md cursor-pointer"
                title="Exportar Dados de Práticas Ministeriais em CSV"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Relatório (CSV)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TABS DE NAVEGAÇÃO */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('galeria')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'galeria'
              ? 'bg-rose-700 text-white shadow-md'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Galeria de Sermões & Práticas ({praticas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('estudio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'estudio'
              ? 'bg-rose-700 text-white shadow-md'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Mic className="w-4 h-4 text-amber-400" />
          <span>Gravar / Enviar Minha Prática</span>
        </button>

        {isPrivileged && (
          <button
            onClick={() => setActiveTab('docente')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'docente'
                ? 'bg-amber-600 text-stone-950 shadow-md font-black'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Mesa Docente & Rubricas ({praticas.length})</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: GALERIA DE PRÁTICAS & PEER REVIEWS                                 */}
      {/* ========================================================================= */}
      {activeTab === 'galeria' && (
        <div className="space-y-6">
          {/* Filtros e Busca */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'homiletica', label: '🎙️ Sermões Homiléticos' },
                { id: 'aconselhamento', label: '🤝 Aconselhamento' },
                { id: 'devocional', label: '📖 Devocionais' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFiltroTipo(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filtroTipo === f.id
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
                placeholder="Buscar por título, texto bíblico..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Grid de Práticas */}
          {praticasFiltradas.length === 0 ? (
            <div className="bg-stone-50 p-12 rounded-3xl border border-dashed border-stone-200 text-center space-y-3">
              <Mic className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-600">Nenhuma prática encontrada para os filtros selecionados.</p>
              <p className="text-xs text-stone-400">Seja o primeiro a gravar ou enviar um sermão no estúdio!</p>
              <button
                onClick={() => setActiveTab('estudio')}
                className="px-4 py-2 rounded-xl bg-rose-700 text-white text-xs font-bold shadow-md hover:bg-rose-800 transition"
              >
                Gravar Minha Prática Agora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {praticasFiltradas.map((pratica) => {
                const isAuthor = pratica.aluno_email.toLowerCase() === userEmail.toLowerCase();
                return (
                  <div
                    key={pratica.id}
                    className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Topo do Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-700 flex items-center justify-center text-white font-bold text-xs overflow-hidden shadow-xs">
                            {pratica.aluno_avatar ? (
                              <img src={pratica.aluno_avatar} alt={pratica.aluno_nome} className="w-full h-full object-cover" />
                            ) : (
                              pratica.aluno_nome.charAt(0)
                            )}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm">{pratica.aluno_nome}</h4>
                            <p className="text-[10px] text-stone-500">{new Date(pratica.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          pratica.tipo_pratica === 'homiletica'
                            ? 'bg-rose-100 text-rose-800'
                            : pratica.tipo_pratica === 'aconselhamento'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {pratica.tipo_pratica === 'homiletica' ? '🎙️ Homilética' : pratica.tipo_pratica === 'aconselhamento' ? '🤝 Aconselhamento' : '📖 Devocional'}
                        </span>
                      </div>

                      {/* Título e Texto Bíblico */}
                      <div>
                        <h3 className="font-black text-stone-900 text-base leading-snug">{pratica.titulo}</h3>
                        {pratica.texto_biblico && (
                          <p className="text-xs font-bold text-rose-700 mt-1 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Texto Base: {pratica.texto_biblico}</span>
                          </p>
                        )}
                      </div>

                      {/* Esboço */}
                      {pratica.esboco_resumo && (
                        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-xs text-stone-700 space-y-1">
                          <span className="font-bold text-[11px] text-stone-500 uppercase">Esboço Resumido:</span>
                          <p className="whitespace-pre-line text-[11px] leading-relaxed">{pratica.esboco_resumo}</p>
                        </div>
                      )}

                      {/* Player de Mídia */}
                      {pratica.midia_tipo === 'audio' && pratica.midia_url && (
                        <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-2xl space-y-1.5">
                          <span className="text-[10px] font-bold text-rose-800 uppercase flex items-center gap-1">
                            <Mic className="w-3 h-3 text-rose-600" /> Áudio Gravado da Prática
                          </span>
                          <audio controls className="w-full h-8" src={pratica.midia_url}>
                            Seu navegador não suporta áudio.
                          </audio>
                        </div>
                      )}

                      {pratica.midia_tipo === 'link_externo' && pratica.midia_url && (
                        <div className="p-3 bg-stone-100 rounded-2xl flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-stone-700 truncate">{pratica.midia_url}</span>
                          <a
                            href={pratica.midia_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-stone-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 flex-shrink-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Abrir Mídia</span>
                          </a>
                        </div>
                      )}

                      {/* Métricas de Peer Review */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-center">
                        <div className="p-2 bg-stone-50 rounded-xl">
                          <span className="text-[10px] text-stone-500 font-bold block">Fidelidade</span>
                          <span className="text-xs font-black text-rose-700">★ {pratica.media_fidelidade ? pratica.media_fidelidade.toFixed(1) : '—'}</span>
                        </div>
                        <div className="p-2 bg-stone-50 rounded-xl">
                          <span className="text-[10px] text-stone-500 font-bold block">Comunicação</span>
                          <span className="text-xs font-black text-amber-700">★ {pratica.media_comunicacao ? pratica.media_comunicacao.toFixed(1) : '—'}</span>
                        </div>
                        <div className="p-2 bg-stone-50 rounded-xl">
                          <span className="text-[10px] text-stone-500 font-bold block">Aplicação</span>
                          <span className="text-xs font-black text-emerald-700">★ {pratica.media_aplicacao ? pratica.media_aplicacao.toFixed(1) : '—'}</span>
                        </div>
                      </div>

                      {/* Avaliação Docente se houver */}
                      {pratica.avaliacao_docente && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-amber-900 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                              Nota Docente: <strong>{pratica.avaliacao_docente.nota_final}/10</strong>
                            </span>
                            <span className="text-[10px] text-amber-700">{pratica.avaliacao_docente.avaliador_nome}</span>
                          </div>
                          <p className="text-[11px] text-amber-800 italic">"{pratica.avaliacao_docente.feedback_mediador}"</p>
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação do Card */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => abrirModalReview(pratica)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isAuthor ? 'Ver Feedbacks dos Colegas' : 'Avaliar / Dar Feedback'}</span>
                        <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                          {pratica.peer_reviews_count || 0}
                        </span>
                      </button>

                      {isPrivileged && (
                        <button
                          onClick={() => {
                            setPraticaDocenteModal(pratica);
                            setFeedbackMediador(pratica.avaliacao_docente?.feedback_mediador || '');
                            setNotaExegese(pratica.avaliacao_docente?.nota_exegese || 9.0);
                            setNotaEstrutura(pratica.avaliacao_docente?.nota_estrutura || 8.5);
                            setNotaPostura(pratica.avaliacao_docente?.nota_postura || 9.0);
                          }}
                          className="py-2.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs flex items-center justify-center gap-1 border border-amber-300 transition-all cursor-pointer"
                          title="Avaliação Mediadora Docente"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-700" />
                          <span>Rubrica</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: ESTÚDIO DE GRAVAÇÃO E ENVIO                                        */}
      {/* ========================================================================= */}
      {activeTab === 'estudio' && (
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-stone-900">Novo Envio de Prática Ministerial</h3>
            <p className="text-xs text-stone-500">
              Preencha os detalhes do seu sermão ou aconselhamento pastoral e grave diretamente ou envie o link.
            </p>
          </div>

          <form onSubmit={handlePublicarPratica} className="space-y-5">
            {/* Escolha do Tipo de Prática */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">Tipo de Prática:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'homiletica', label: '🎙️ Sermão Homilético' },
                  { id: 'aconselhamento', label: '🤝 Aconselhamento' },
                  { id: 'devocional', label: '📖 Leitura / Devocional' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setNovoTipo(t.id as TipoPraticaHomiletica)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                      novoTipo === t.id
                        ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Título e Texto Bíblico */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">Título da Prática / Sermão *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: A Graça Incondicional de Cristo"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">Texto Bíblico Base</label>
                <input
                  type="text"
                  placeholder="Ex: Efésios 2:1-10"
                  value={novoTextoBiblico}
                  onChange={(e) => setNovoTextoBiblico(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Esboço Homilético */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">Esboço Resumido dos Tópicos</label>
              <textarea
                rows={3}
                placeholder="1. Introdução e Contextualização&#10;2. Tópico Principal&#10;3. Aplicação Ministerial"
                value={novoEsboco}
                onChange={(e) => setNovoEsboco(e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Modalidade de Mídia */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-700 block">Como deseja anexar sua prática?</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModoGravacao('audio')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    modoGravacao === 'audio'
                      ? 'bg-rose-50 text-rose-800 border-rose-300 font-black'
                      : 'bg-stone-50 text-stone-600 border-stone-200'
                  }`}
                >
                  🎙️ Gravar Áudio no Navegador
                </button>
                <button
                  type="button"
                  onClick={() => setModoGravacao('link_externo')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    modoGravacao === 'link_externo'
                      ? 'bg-rose-50 text-rose-800 border-rose-300 font-black'
                      : 'bg-stone-50 text-stone-600 border-stone-200'
                  }`}
                >
                  🔗 Link (Google Drive / YouTube)
                </button>
              </div>

              {/* Gravador Web */}
              {modoGravacao === 'audio' && (
                <div className="p-5 bg-gradient-to-br from-rose-50 to-amber-50 rounded-2xl border border-rose-200/80 text-center space-y-4">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                      isRecording ? 'bg-rose-600 text-white animate-pulse shadow-lg' : 'bg-white text-rose-700 border-2 border-rose-300'
                    }`}>
                      <Mic className="w-8 h-8" />
                    </div>
                    {isRecording ? (
                      <span className="text-xs font-black text-rose-700 animate-pulse">
                        GRAVANDO: {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                      </span>
                    ) : recordedAudioUrl ? (
                      <span className="text-xs font-bold text-emerald-700">✓ Áudio Gravado com Sucesso!</span>
                    ) : (
                      <span className="text-xs text-stone-600">Clique para iniciar a gravação do seu sermão (3 a 10 min)</span>
                    )}
                  </div>

                  <div className="flex justify-center gap-3">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={iniciarGravacao}
                        className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
                      >
                        {recordedAudioUrl ? 'Gravar Novamente' : 'Iniciar Gravação de Áudio'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={pararGravacao}
                        className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Square className="w-3.5 h-3.5 text-rose-400" />
                        <span>Parar e Salvar Gravação</span>
                      </button>
                    )}
                  </div>

                  {recordedAudioUrl && !isRecording && (
                    <div className="pt-2">
                      <audio controls className="w-full max-w-md mx-auto" src={recordedAudioUrl} />
                    </div>
                  )}
                </div>
              )}

              {/* Link Externo */}
              {modoGravacao === 'link_externo' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">Link Compartilhável do Google Drive ou YouTube</label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/... ou https://youtube.com/watch?v=..."
                    value={novoLinkExterno}
                    onChange={(e) => setNovoLinkExterno(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={isSavingPratica || isRecording}
              className="w-full py-3 bg-gradient-to-r from-rose-700 to-amber-700 hover:from-rose-800 hover:to-amber-800 text-white font-black text-sm rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSavingPratica ? 'Publicando...' : 'Publicar Prática no Estúdio'}</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: MESA DOCENTE & RUBRICAS (PROFESSORES E MONITORES)                   */}
      {/* ========================================================================= */}
      {activeTab === 'docente' && isPrivileged && (
        <div className="space-y-6">
          <div className="bg-amber-50/70 p-5 rounded-3xl border border-amber-200 text-stone-900 space-y-2">
            <h3 className="text-base font-black text-amber-950 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-700" />
              Mesa Docente de Avaliação Mediadora
            </h3>
            <p className="text-xs text-amber-900 leading-relaxed">
              Atribua notas formativas e orientações de desenvolvimento ministerial aos sermões enviados pelos alunos. As avaliações docentes são integradas com os relatórios pedagógicos da coordenação.
            </p>
          </div>

          <div className="divide-y divide-stone-200 bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            {praticas.map((pratica) => (
              <div key={pratica.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-stone-900">{pratica.aluno_nome}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-bold">
                      {pratica.tipo_pratica}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-stone-800">{pratica.titulo}</h4>
                  <p className="text-xs text-stone-500">Texto: {pratica.texto_biblico || 'N/A'}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <span className="text-stone-400 block text-[10px]">Nota Docente</span>
                    <span className="font-black text-sm text-amber-700">
                      {pratica.avaliacao_docente ? `${pratica.avaliacao_docente.nota_final}/10` : 'Pendente'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setPraticaDocenteModal(pratica);
                      setFeedbackMediador(pratica.avaliacao_docente?.feedback_mediador || '');
                      setNotaExegese(pratica.avaliacao_docente?.nota_exegese || 9.0);
                      setNotaEstrutura(pratica.avaliacao_docente?.nota_estrutura || 8.5);
                      setNotaPostura(pratica.avaliacao_docente?.nota_postura || 9.0);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-stone-950 font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    {pratica.avaliacao_docente ? 'Editar Rubrica' : 'Avaliar Prática'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE PEER REVIEW                                                      */}
      {/* ========================================================================= */}
      {praticaAvaliada && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-stone-200 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-rose-700 uppercase">Instrução por Pares</span>
                <h3 className="text-lg font-black text-stone-900">{praticaAvaliada.titulo}</h3>
                <p className="text-xs text-stone-500">Autor: {praticaAvaliada.aluno_nome}</p>
              </div>
              <button
                onClick={() => setPraticaAvaliada(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Formulário de Review se não for o autor */}
            {praticaAvaliada.aluno_email.toLowerCase() !== userEmail.toLowerCase() ? (
              <form onSubmit={handleSalvarReview} className="space-y-4">
                <div className="space-y-3 p-4 bg-stone-50 rounded-2xl">
                  <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider">Avaliação Formativa (1 a 5 Estrelas)</h4>
                  
                  {/* Fidelidade */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-stone-700">📜 Fidelidade Bíblica / Exegese:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNotaFidelidade(n)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold ${notaFidelidade >= n ? 'bg-amber-400 text-stone-950' : 'bg-stone-200 text-stone-400'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comunicação */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-stone-700">🗣️ Oratória & Comunicação:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNotaComunicacao(n)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold ${notaComunicacao >= n ? 'bg-amber-400 text-stone-950' : 'bg-stone-200 text-stone-400'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aplicação */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-stone-700">🎯 Aplicação Pastoral Prática:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNotaAplicacao(n)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold ${notaAplicacao >= n ? 'bg-amber-400 text-stone-950' : 'bg-stone-200 text-stone-400'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 block flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ponto Forte que Você Notou:</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Excelente ilustração bíblica no início..."
                      value={pontoForte}
                      onChange={(e) => setPontoForte(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 block flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      <span>Oportunidade de Crescimento / Sugestão:</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Pode aprofundar um pouco mais a aplicação pastoral..."
                      value={oportunidadeMelhoria}
                      onChange={(e) => setOportunidadeMelhoria(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 block">Comentário Geral Formativo *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Deixe uma palavra de encorajamento para seu colega de ministério..."
                      value={comentarioGeral}
                      onChange={(e) => setComentarioGeral(e.target.value)}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={enviandoReview}
                  className="w-full py-3 bg-rose-700 hover:bg-rose-800 text-white font-black text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {enviandoReview ? 'Enviando...' : 'Registrar Feedback por Pares'}
                </button>
              </form>
            ) : (
              <p className="text-xs font-bold text-stone-500 bg-stone-50 p-3 rounded-xl text-center">
                Você é o autor desta prática. Veja abaixo os feedbacks dos seus colegas:
              </p>
            )}

            {/* Lista de Feedbacks Existentes */}
            <div className="space-y-3 pt-3 border-t border-stone-100 max-h-48 overflow-y-auto">
              <h4 className="text-xs font-bold text-stone-700">Feedbacks Recebidos ({reviewsPraticaAtiva.length}):</h4>
              {reviewsPraticaAtiva.length === 0 ? (
                <p className="text-xs text-stone-400 italic">Nenhum feedback registrado ainda.</p>
              ) : (
                reviewsPraticaAtiva.map((r) => (
                  <div key={r.id} className="p-3 bg-stone-50 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold text-stone-800">
                      <span>{r.revisor_nome}</span>
                      <span className="text-amber-600">★ Média: {((r.nota_fidelidade + r.nota_comunicacao + r.nota_aplicacao) / 3).toFixed(1)}</span>
                    </div>
                    <p className="text-stone-700">{r.comentario_geral}</p>
                    {r.ponto_forte && <p className="text-emerald-700 font-medium">✓ Ponto forte: {r.ponto_forte}</p>}
                    {r.oportunidade_melhoria && <p className="text-amber-700 font-medium">💡 Sugestão: {r.oportunidade_melhoria}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE AVALIAÇÃO DOCENTE (RUBRICA MEDIADORA)                            */}
      {/* ========================================================================= */}
      {praticaDocenteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-stone-200 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase">Rubrica Mediadora Docente</span>
                <h3 className="text-lg font-black text-stone-900">{praticaDocenteModal.titulo}</h3>
                <p className="text-xs text-stone-500">Aluno: {praticaDocenteModal.aluno_nome}</p>
              </div>
              <button
                onClick={() => setPraticaDocenteModal(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarDocente} className="space-y-4">
              <div className="grid grid-cols-3 gap-3 p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80">
                <div className="space-y-1 text-center">
                  <label className="text-[11px] font-bold text-amber-900 block">Exegese (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={notaExegese}
                    onChange={(e) => setNotaExegese(Number(e.target.value))}
                    className="w-full text-center py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-black text-stone-900"
                  />
                </div>

                <div className="space-y-1 text-center">
                  <label className="text-[11px] font-bold text-amber-900 block">Estrutura (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={notaEstrutura}
                    onChange={(e) => setNotaEstrutura(Number(e.target.value))}
                    className="w-full text-center py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-black text-stone-900"
                  />
                </div>

                <div className="space-y-1 text-center">
                  <label className="text-[11px] font-bold text-amber-900 block">Postura (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={notaPostura}
                    onChange={(e) => setNotaPostura(Number(e.target.value))}
                    className="w-full text-center py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-black text-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">Feedback Mediador Personalizado *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Orientações e apontamentos pedagógicos para o crescimento ministerial do aluno..."
                  value={feedbackMediador}
                  onChange={(e) => setFeedbackMediador(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={enviandoDocente}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-stone-950 font-black text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {enviandoDocente ? 'Salvando Rubrica...' : 'Salvar Avaliação Docente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
