'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  GraduationCap, CheckCircle2, ShieldCheck, Heart, 
  HelpCircle, ArrowRight, ArrowLeft, Share2, Copy, 
  Check, Sparkles, AlertCircle, BookOpen, Send, RefreshCw, 
  MessageSquare, Lock, LogIn, ExternalLink, Info, X, Lightbulb,
  Edit3, CheckCircle, UserCheck
} from 'lucide-react';
import { 
  TipoPublico, 
  OrigemPesquisa,
  DadosIdentificacao,
  TIPO_PUBLICO_LABELS,
  GLOSSARIO_PEDAGOGICO_TCC,
  TermoExplicativo,
  getPerguntasParaPublico,
  PerguntaDiagnostico,
  saveProfileResponsesState,
  getProfileResponseState,
  getAllProfileResponseStates,
  submitPesquisaCampo,
  PerfilResponseState,
  SEMINARIO_NOME,
  INSTITUICAO_NOME,
  CURSO_NOME,
  PESQUISADOR_NOME,
  ORIENTADOR_NOME,
  TCC_TEMA,
  PLATAFORMA_NOME,
  PLATAFORMA_DESCRICAO
} from '@/services/pesquisaCampoService';
import { supabase } from '@/lib/supabaseClient';

const LIKERT_LABELS: Record<number, { text: string; emoji: string; color: string }> = {
  1: { text: 'Discordo Totalmente', emoji: '🔴', color: 'border-rose-300 hover:bg-rose-50 text-rose-900' },
  2: { text: 'Discordo Parcialmente', emoji: '🟠', color: 'border-amber-300 hover:bg-amber-50 text-amber-900' },
  3: { text: 'Neutro / Indiferente', emoji: '⚪', color: 'border-slate-300 hover:bg-slate-50 text-slate-900' },
  4: { text: 'Concordo Parcialmente', emoji: '🟢', color: 'border-emerald-300 hover:bg-emerald-50 text-emerald-900' },
  5: { text: 'Concordo Totalmente', emoji: '🌟', color: 'border-blue-400 hover:bg-blue-50 text-blue-900' },
};

export default function PesquisaTCCPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [autorizouTcle, setAutorizouTcle] = useState<boolean>(false);
  const [tipoPublico, setTipoPublico] = useState<TipoPublico>('aluno_unimb');
  const [origem, setOrigem] = useState<OrigemPesquisa>('link_direto');
  const [dadosIdentificacao, setDadosIdentificacao] = useState<DadosIdentificacao>({
    nome: '',
    email: '',
    whatsapp: '',
    igreja: '',
    cidade_uf: '',
    funcao: '',
  });
  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  
  // Mapa de estados de todos os perfis já preenchidos neste navegador
  const [allProfileStates, setAllProfileStates] = useState<Record<string, PerfilResponseState>>({});
  const [isEditingExistingProfile, setIsEditingExistingProfile] = useState<boolean>(false);

  // Sessão e Autenticação
  const [userAuthEmail, setUserAuthEmail] = useState<string | null>(null);
  const [userAuthName, setUserAuthName] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  
  // Modal de Explicação de Termos
  const [termoAtivo, setTermoAtivo] = useState<TermoExplicativo | null>(null);
  const [isGlossarioGeralAberto, setIsGlossarioGeralAberto] = useState<boolean>(false);

  // Verifica se o público atual pertence à comunidade interna (exige login)
  const isComunidadeInterna = useMemo(() => {
    return (
      tipoPublico === 'aluno_unimb' ||
      tipoPublico === 'professor_unimb' ||
      tipoPublico === 'monitor_unimb' ||
      tipoPublico === 'aluno_unib' ||
      tipoPublico === 'professor_unib' ||
      tipoPublico === 'monitor_unib'
    );
  }, [tipoPublico]);

  // Perguntas dinâmicas e personalizadas para o perfil selecionado (Triangulação Metodológica)
  const perguntasAtuais = useMemo(() => {
    return getPerguntasParaPublico(tipoPublico);
  }, [tipoPublico]);

  // Carrega parâmetros de URL, estados multi-perfil e sessão Supabase
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const origParam = params.get('origem') as OrigemPesquisa;
    if (origParam) setOrigem(origParam);

    const pubParam = params.get('publico') as TipoPublico;
    const initialPub: TipoPublico = (pubParam && TIPO_PUBLICO_LABELS[pubParam]) ? pubParam : 'aluno_unimb';
    setTipoPublico(initialPub);

    // Carrega todos os perfis já iniciados/respondidos
    const savedStates = getAllProfileResponseStates();
    setAllProfileStates(savedStates);

    // Se o perfil inicial já tiver estado salvo, carrega suas respostas
    if (savedStates[initialPub]) {
      const pState = savedStates[initialPub];
      setRespostas(pState.respostas || {});
      if (pState.dados_identificacao) {
        setDadosIdentificacao(pState.dados_identificacao);
      }
      setIsEditingExistingProfile(pState.status === 'enviado');
    }

    // Checa sessão Supabase
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthLoading(false);
      if (data?.session?.user) {
        const u = data.session.user;
        const email = u.email || '';
        const name = u.user_metadata?.full_name || u.user_metadata?.name || '';
        setUserAuthEmail(email);
        setUserAuthName(name);
        setDadosIdentificacao((prev) => ({
          ...prev,
          email: prev.email || email,
          nome: prev.nome || name,
        }));
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
        setUserAuthEmail(email);
        setUserAuthName(name);
        setDadosIdentificacao((prev) => ({
          ...prev,
          email: prev.email || email,
          nome: prev.nome || name,
        }));
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Transição de Perfil: Salva o anterior e carrega o novo de forma independente
  const handleSelectTipoPublico = (novoPerfil: TipoPublico) => {
    if (novoPerfil === tipoPublico) return;

    // 1. Salva o rascunho do perfil atual antes de mudar
    if (Object.keys(respostas).length > 0) {
      saveProfileResponsesState({
        tipo_publico: tipoPublico,
        respostas: respostas,
        dados_identificacao: dadosIdentificacao,
        status: allProfileStates[tipoPublico]?.status || 'rascunho',
        updated_at: new Date().toISOString(),
      });
    }

    // 2. Atualiza o perfil ativo
    setTipoPublico(novoPerfil);

    // 3. Atualiza mapa local de perfis
    const updatedMap = getAllProfileResponseStates();
    setAllProfileStates(updatedMap);

    // 4. Carrega respostas salvas do novo perfil (ou reinicia limpo)
    if (updatedMap[novoPerfil]) {
      const targetState = updatedMap[novoPerfil];
      setRespostas(targetState.respostas || {});
      if (targetState.dados_identificacao) {
        setDadosIdentificacao(targetState.dados_identificacao);
      }
      setIsEditingExistingProfile(targetState.status === 'enviado');
    } else {
      // Inicia uma nova pesquisa para este perfil!
      setRespostas({});
      setIsEditingExistingProfile(false);
    }
  };

  // Salva periodicamente o estado do perfil ativo
  useEffect(() => {
    if (isSuccess || Object.keys(respostas).length === 0) return;
    saveProfileResponsesState({
      tipo_publico: tipoPublico,
      respostas: respostas,
      dados_identificacao: dadosIdentificacao,
      status: allProfileStates[tipoPublico]?.status || 'rascunho',
      updated_at: new Date().toISOString(),
    });
  }, [tipoPublico, respostas, dadosIdentificacao, isSuccess]);

  const handleSelectLikert = (perguntaId: string, val: number) => {
    setRespostas((prev) => ({ ...prev, [perguntaId]: val }));
  };

  const handleSelectOption = (perguntaId: string, val: string) => {
    setRespostas((prev) => ({ ...prev, [perguntaId]: val }));
  };

  const handleTextChange = (perguntaId: string, text: string) => {
    setRespostas((prev) => ({ ...prev, [perguntaId]: text }));
  };

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/pesquisa-tcc?origem=whatsapp_externo`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Login com Google OAuth para a Comunidade Interna
  const handleGoogleLogin = async () => {
    try {
      saveProfileResponsesState({
        tipo_publico: tipoPublico,
        respostas: respostas,
        dados_identificacao: dadosIdentificacao,
        status: 'rascunho',
        updated_at: new Date().toISOString(),
      });

      const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: currentUrl },
      });
    } catch (err: any) {
      setErrorMessage('Erro ao iniciar login com Google: ' + (err.message || 'Tente novamente'));
    }
  };

  // Submissão final do questionário do perfil ativo
  const handleSubmit = async () => {
    if (!autorizouTcle) {
      setErrorMessage('É obrigatório aceitar o Termo de Consentimento Livre e Esclarecido (TCLE).');
      setCurrentStep(1);
      return;
    }

    if (isComunidadeInterna && !userAuthEmail) {
      setErrorMessage('Para a comunidade interna do Seminário, é obrigatório conectar-se com sua conta Google acadêmica.');
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await submitPesquisaCampo({
      tipo_publico: tipoPublico,
      dados_identificacao: dadosIdentificacao,
      autorizou_tcc: true,
      origem: origem,
      respostas: respostas,
      user_email: userAuthEmail || dadosIdentificacao.email,
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      // Atualiza mapa de estados com o perfil marcado como enviado
      const nextStates = getAllProfileResponseStates();
      setAllProfileStates(nextStates);
    } else {
      setErrorMessage(res.error || 'Erro ao enviar respostas. Tente novamente.');
    }
  };

  // Preencher outro questionário ou editar outro perfil
  const handlePreencherOutroPerfil = () => {
    setIsSuccess(false);
    setCurrentStep(2); // Retorna para a tela de perfis
  };

  const totalSteps = 6;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  // Filtra perguntas personalizadas por dimensão para renderização por etapas
  const dim1Questions = useMemo(() => perguntasAtuais.filter((p) => p.dimensao === 'distancia_transacional'), [perguntasAtuais]);
  const dim2Questions = useMemo(() => perguntasAtuais.filter((p) => p.dimensao === 'koinonia'), [perguntasAtuais]);
  const dim3Questions = useMemo(() => perguntasAtuais.filter((p) => p.dimensao === 'transicao_internato'), [perguntasAtuais]);
  const dim4And5Questions = useMemo(() => perguntasAtuais.filter((p) => p.dimensao === 'metodologias_ativas' || p.dimensao === 'qualitativa'), [perguntasAtuais]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* CABEÇALHO SUPERIOR */}
      <header className="border-b border-indigo-900/40 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black shadow-md shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  TCC Teologia • UNIMB & {SEMINARIO_NOME}
                </span>
                {userAuthEmail && (
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Logado: {userAuthEmail}
                  </span>
                )}
                {isEditingExistingProfile && !isSuccess && (
                  <span className="text-[9px] font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <Edit3 className="w-3 h-3" /> Modo Edição ({TIPO_PUBLICO_LABELS[tipoPublico]?.label.split('(')[0].trim()})
                  </span>
                )}
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-white">
                Pesquisa de Campo & Diagnóstico do TCC
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGlossarioGeralAberto(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition cursor-pointer"
              title="Ver glossário de inovações pedagógicas e termos do TCC"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Explicar Termos</span>
            </button>

            <button
              onClick={handleCopyShareLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-indigo-200 border border-indigo-400/30 transition cursor-pointer"
              title="Copiar link para WhatsApp"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copiado!' : 'Compartilhar'}</span>
            </button>
          </div>
        </div>

        {/* BARRA DE PROGRESSO */}
        {!isSuccess && (
          <div className="w-full bg-slate-900 h-1.5">
            <div 
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-1.5 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-3xl w-full mx-auto px-4 py-8 flex-1">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TELA DE SUCESSO & ENTRADA NA PLATAFORMA */}
        {isSuccess ? (
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {isEditingExistingProfile ? 'Respostas Atualizadas com Sucesso!' : 'Diagnóstico Registrado com Sucesso!'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Muito Obrigado por sua Contribuição!</h2>
              <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Suas respostas foram salvas com sucesso para o perfil <strong>{TIPO_PUBLICO_LABELS[tipoPublico]?.label}</strong> e fundamentarão a triangulação metodológica do TCC de <strong>{PESQUISADOR_NOME}</strong>, sob orientação do <strong>{ORIENTADOR_NOME}</strong> ({INSTITUICAO_NOME} & {SEMINARIO_NOME}).
              </p>
            </div>

            {/* Resumo de outros perfis disponíveis para responder */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-indigo-950 text-left space-y-3 max-w-lg mx-auto">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Seus Questionários neste Dispositivo:</span>
                </h4>
                <span className="text-[10px] text-slate-400">Dados salvos independentemente</span>
              </div>
              
              <div className="space-y-1.5">
                {(Object.keys(TIPO_PUBLICO_LABELS) as TipoPublico[])
                  .filter((k) => !k.includes('_unib'))
                  .map((k) => {
                    const st = allProfileStates[k];
                    const isCurrent = k === tipoPublico;
                    const hasSubmitted = st?.status === 'enviado';
                    return (
                      <div key={k} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <span>{TIPO_PUBLICO_LABELS[k]?.emoji}</span>
                          <span className="font-semibold">{TIPO_PUBLICO_LABELS[k]?.label.split('(')[0].trim()}</span>
                          {isCurrent && <span className="text-[10px] text-emerald-400 font-bold">(Recém-enviado)</span>}
                        </span>
                        <span className="text-[10px] font-bold">
                          {hasSubmitted ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Registrado
                            </span>
                          ) : (
                            <span className="text-slate-500">Pendente</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* AÇÕES PÓS-RESPOSTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <a
                href="/"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-white" />
                <span>Entrar na Plataforma Koinonia LMS →</span>
              </a>

              <button
                onClick={handlePreencherOutroPerfil}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 font-extrabold text-xs border border-indigo-500/40 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4 text-indigo-400" />
                <span>Preencher / Editar Outro Perfil</span>
              </button>

              <button
                onClick={handleCopyShareLink}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>{copiedLink ? 'Link Copiado!' : 'Convidar Colegas'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ETAPA 1: TERMO DE CONSENTIMENTO (TCLE) */}
            {currentStep === 1 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
                <div className="space-y-2 border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      Etapa 1 de 6 • Consentimento Livre e Esclarecido
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Termo de Consentimento Livre e Esclarecido (TCLE)
                  </h2>
                  <p className="text-xs text-indigo-300 font-medium leading-relaxed">
                    Pesquisa Acadêmica em Teologia • <strong>{INSTITUICAO_NOME}</strong> & <strong>{SEMINARIO_NOME}</strong>
                  </p>
                </div>

                <div className="prose prose-invert max-w-none text-xs text-slate-300 space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 max-h-72 overflow-y-auto leading-relaxed">
                  <p>
                    Você está sendo convidado(a) a participar como voluntário(a) da pesquisa de campo do Trabalho de Conclusão do Curso Bacharel em Teologia, apresentado no <strong>{INSTITUICAO_NOME}</strong>, pelo pesquisador <strong>{PESQUISADOR_NOME}</strong>, sob orientação do <strong>{ORIENTADOR_NOME}</strong>, no âmbito acadêmico do <strong>{SEMINARIO_NOME}</strong>.
                  </p>
                  <p>
                    <strong>Título do Trabalho:</strong> <em>"{TCC_TEMA}"</em>.
                  </p>
                  <p>
                    <strong>Sobre a Plataforma {PLATAFORMA_NOME}:</strong> Trata-se do projeto de plataforma educacional integrada concebido para a modernização do ensino teológico no ambiente virtual, projetada para utilização em qualquer seminário ou instituição de formação pastoral e teológica.
                  </p>
                  <p>
                    <strong>Objetivos:</strong> Identificar a percepção de seminaristas, docentes, monitores, pastores e líderes eclesiásticos sobre a eficácia pedagógica, o acolhimento comunitário e a formação integral do caráter pastoral proporcionada pelas metodologias ativas e aulas síncronas remotas.
                  </p>
                  <p>
                    <strong>Garantias Éticas:</strong> A participação é inteiramente voluntária, sem quaisquer custos ou riscos aos respondentes. Seus dados e percepções serão processados estatisticamente com garantia absoluta de anonimato e sigilo profissional.
                  </p>
                </div>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 cursor-pointer hover:bg-indigo-950/50 transition">
                  <input
                    type="checkbox"
                    checked={autorizouTcle}
                    onChange={(e) => setAutorizouTcle(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 shrink-0 cursor-pointer"
                  />
                  <div className="text-xs text-slate-200">
                    <strong className="text-white block font-bold">Declaração de Concordância</strong>
                    Li e concordo voluntariamente em participar desta pesquisa acadêmica, autorizando o uso científico e estatístico das minhas respostas para o Trabalho de Conclusão de Curso em Teologia de {PESQUISADOR_NOME} ({INSTITUICAO_NOME} / {SEMINARIO_NOME}).
                  </div>
                </label>

                <div className="flex justify-end pt-4">
                  <button
                    disabled={!autorizouTcle}
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Avançar para Caracterização</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 2: CARACTERIZAÇÃO DO RESPONDENTE & SELEÇÃO DE PERFIL */}
            {currentStep === 2 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
                <div className="space-y-2 border-b border-slate-800 pb-5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      Etapa 2 de 6 • Caracterização do Público & Triangulação
                    </span>
                    <span className="text-[11px] text-amber-300 font-bold bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-500/30">
                      Perguntas personalizadas por ator
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Qual é o seu perfil de atuação?
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ao alternar o perfil, uma nova pesquisa adaptada ao seu papel é iniciada. Suas respostas anteriores são salvas e podem ser editadas quando quiser:
                  </p>
                </div>

                {/* Seleção do Tipo de Público com indicador de status salvo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(TIPO_PUBLICO_LABELS) as TipoPublico[])
                    .filter((key) => !key.includes('_unib'))
                    .map((key) => {
                      const cfg = TIPO_PUBLICO_LABELS[key];
                      const isSelected = tipoPublico === key;
                      const savedProfile = allProfileStates[key];
                      const isSubmitted = savedProfile?.status === 'enviado';
                      const isDraft = savedProfile?.status === 'rascunho' && Object.keys(savedProfile.respostas || {}).length > 0;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectTipoPublico(key)}
                          className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-2.5 cursor-pointer relative ${
                            isSelected
                              ? 'bg-indigo-600/25 border-indigo-500 ring-2 ring-indigo-500/40 text-white shadow-lg'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl shrink-0">{cfg.emoji}</span>
                            <div className="flex-1">
                              <span className="font-extrabold text-xs block leading-tight text-white">{cfg.label}</span>
                              <span className="text-[10px] text-indigo-300 font-medium block mt-0.5">
                                {cfg.papelAcademico}
                              </span>
                              <span className="text-[9px] text-slate-400 capitalize mt-1 inline-block">
                                {cfg.grupo === 'interno' ? 'Comunidade Interna (Exige Login Google)' : 'Público Externo / Eclesiástico'}
                              </span>
                            </div>
                          </div>

                          {/* Badge de status das respostas deste perfil */}
                          <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-bold">
                            {isSubmitted ? (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Resposta Registrada (Clique p/ editar)
                              </span>
                            ) : isDraft ? (
                              <span className="text-amber-400 flex items-center gap-1">
                                <Edit3 className="w-3 h-3" /> Rascunho Salvo
                              </span>
                            ) : (
                              <span className="text-slate-500">Novo Questionário</span>
                            )}
                            {isSelected && (
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                                Ativo
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>

                {/* Banner de perfil com respostas salvas */}
                {isEditingExistingProfile && (
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-3">
                    <Edit3 className="w-5 h-5 shrink-0 text-amber-400" />
                    <div>
                      <strong>Modo de Edição Ativo:</strong> Você já possui respostas salvas para este perfil. Suas respostas anteriores foram carregadas nas próximas etapas para que você possa revisá-las e atualizá-las.
                    </div>
                  </div>
                )}

                {/* EXIGÊNCIA DE AUTENTICAÇÃO PARA COMUNIDADE INTERNA */}
                {isComunidadeInterna && (
                  <div className="p-5 rounded-2xl bg-indigo-950/50 border border-indigo-500/40 space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-indigo-200">
                        Autenticação Institucional Obrigatória
                      </h4>
                    </div>

                    {userAuthEmail ? (
                      <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-slate-200">
                            Conectado como: <strong className="text-white">{userAuthEmail}</strong> {userAuthName ? `(${userAuthName})` : ''}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Autenticado
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Para a <strong>Comunidade Interna</strong> (Alunos, Professores e Monitores), é necessária a autenticação com sua conta Google acadêmica para validar seu vínculo e liberar o acesso direto à plataforma pós-pesquisa.
                        </p>
                        <button
                          type="button"
                          onClick={handleGoogleLogin}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Entrar com Conta Google</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Dados de Identificação */}
                <div className="border-t border-slate-800 pt-5 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300">
                    Dados Complementares (Identificação Opcional)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Nome Completo (Opcional):</label>
                      <input
                        type="text"
                        placeholder="Seu nome ou deixe em branco"
                        value={dadosIdentificacao.nome || ''}
                        onChange={(e) => setDadosIdentificacao({ ...dadosIdentificacao, nome: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">WhatsApp ou E-mail (Opcional):</label>
                      <input
                        type="text"
                        placeholder="Para receber o artigo final do TCC"
                        value={dadosIdentificacao.whatsapp || dadosIdentificacao.email || ''}
                        onChange={(e) => setDadosIdentificacao({ ...dadosIdentificacao, whatsapp: e.target.value, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Igreja / Denominação:</label>
                      <input
                        type="text"
                        placeholder="Ex: Igreja Evangélica Congregacional, Batista, Presbiteriana..."
                        value={dadosIdentificacao.igreja || ''}
                        onChange={(e) => setDadosIdentificacao({ ...dadosIdentificacao, igreja: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Cidade / Estado (UF):</label>
                      <input
                        type="text"
                        placeholder="Ex: Baturité/CE, Salvador/BA, Fortaleza/CE..."
                        value={dadosIdentificacao.cidade_uf || ''}
                        onChange={(e) => setDadosIdentificacao({ ...dadosIdentificacao, cidade_uf: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                  <button
                    disabled={isComunidadeInterna && !userAuthEmail}
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>{isComunidadeInterna && !userAuthEmail ? 'Faça login para avançar' : 'Iniciar Diagnóstico'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3: DIMENSÃO 1 — DISTÂNCIA TRANSACIONAL (MOORE) PERSONALIZADA */}
            {currentStep === 3 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
                <div className="space-y-2 border-b border-slate-800 pb-5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      Etapa 3 de 6 • Dimensão 1 • {TIPO_PUBLICO_LABELS[tipoPublico]?.papelAcademico}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTermoAtivo(GLOSSARIO_PEDAGOGICO_TCC['distancia_transacional'])}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5" /> O que é Distância Transacional?
                    </button>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Diálogo, Estrutura e Distância Transacional
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Avalie cada assertiva personalizada para o seu papel na escala de 1 a 5:
                  </p>
                </div>

                <div className="space-y-6">
                  {dim1Questions.map((q, idx) => {
                    const termo = q.termoExplicativoId ? GLOSSARIO_PEDAGOGICO_TCC[q.termoExplicativoId] : null;
                    return (
                      <div key={q.id} className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm font-extrabold text-white leading-relaxed">
                              {q.enunciado}
                            </p>
                            {q.descricao && (
                              <p className="text-[11px] text-slate-400 mt-1 italic leading-relaxed">
                                {q.descricao}
                              </p>
                            )}
                            {termo && (
                              <button
                                type="button"
                                onClick={() => setTermoAtivo(termo)}
                                className="mt-1.5 text-[10px] font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 cursor-pointer"
                              >
                                <Info className="w-3 h-3 text-amber-400" />
                                <span>Entender este conceito ({termo.titulo.split('(')[0].trim()})</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Escala Likert de 1 a 5 */}
                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-2">
                          {[1, 2, 3, 4, 5].map((val) => {
                            const isSelected = respostas[q.id] === val;
                            const info = LIKERT_LABELS[val];
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleSelectLikert(q.id, val)}
                                className={`py-2 px-1 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-400 text-white font-black ring-2 ring-blue-400/30 shadow-md'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                                }`}
                              >
                                <span className="text-base">{info.emoji}</span>
                                <span className="text-xs font-bold">{val}</span>
                                <span className="text-[9px] leading-tight hidden sm:block truncate px-1 opacity-80">
                                  {info.text}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Avançar para Koinonia</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 4: DIMENSÃO 2 — PRESERVAÇÃO DA KOINONIA PERSONALIZADA */}
            {currentStep === 4 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
                <div className="space-y-2 border-b border-slate-800 pb-5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-400/30">
                      Etapa 4 de 6 • Dimensão 2 • Comunhão Bíblica (Koinonia)
                    </span>
                    <button
                      type="button"
                      onClick={() => setTermoAtivo(GLOSSARIO_PEDAGOGICO_TCC['koinonia'])}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5" /> O que é Koinonia no LMS?
                    </button>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Comunhão, Mutualidade e Vida Espiritual
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Avalie como o modelo virtual acolhe ou desafia a dimensão comunitária da formação pastoral:
                  </p>
                </div>

                <div className="space-y-6">
                  {dim2Questions.map((q, idx) => {
                    const termo = q.termoExplicativoId ? GLOSSARIO_PEDAGOGICO_TCC[q.termoExplicativoId] : null;
                    return (
                      <div key={q.id} className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm font-extrabold text-white leading-relaxed">
                              {q.enunciado}
                            </p>
                            {q.descricao && (
                              <p className="text-[11px] text-slate-400 mt-1 italic leading-relaxed">
                                {q.descricao}
                              </p>
                            )}
                            {termo && (
                              <button
                                type="button"
                                onClick={() => setTermoAtivo(termo)}
                                className="mt-1.5 text-[10px] font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 cursor-pointer"
                              >
                                <Info className="w-3 h-3 text-amber-400" />
                                <span>Entender este termo ({termo.titulo.split('(')[0].trim()})</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Escala Likert */}
                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-2">
                          {[1, 2, 3, 4, 5].map((val) => {
                            const isSelected = respostas[q.id] === val;
                            const info = LIKERT_LABELS[val];
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleSelectLikert(q.id, val)}
                                className={`py-2 px-1 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                  isSelected
                                    ? 'bg-purple-600 border-purple-400 text-white font-black ring-2 ring-purple-400/30 shadow-md'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                                }`}
                              >
                                <span className="text-base">{info.emoji}</span>
                                <span className="text-xs font-bold">{val}</span>
                                <span className="text-[9px] leading-tight hidden sm:block truncate px-1 opacity-80">
                                  {info.text}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Avançar para Transição Histórica</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 5: DIMENSÃO 3 — TRANSIÇÃO DO INTERNATO PERSONALIZADA */}
            {currentStep === 5 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
                <div className="space-y-2 border-b border-slate-800 pb-5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      Etapa 5 de 6 • Dimensão 3 • Transição Histórica
                    </span>
                    <button
                      type="button"
                      onClick={() => setTermoAtivo(GLOSSARIO_PEDAGOGICO_TCC['transicao_internato'])}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5" /> Internato vs. Remoto Síncrono
                    </button>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Do Internato Presencial ao Modelo Remoto Síncrono
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Reflexão comparativa sobre a formação teológica clássica e o modelo atual:
                  </p>
                </div>

                <div className="space-y-6">
                  {dim3Questions.map((q, idx) => (
                    <div key={q.id} className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-extrabold text-white leading-relaxed">
                          {q.enunciado}
                        </p>
                      </div>

                      {q.tipo === 'likert_5' && (
                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-2">
                          {[1, 2, 3, 4, 5].map((val) => {
                            const isSelected = respostas[q.id] === val;
                            const info = LIKERT_LABELS[val];
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleSelectLikert(q.id, val)}
                                className={`py-2 px-1 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-600 border-amber-400 text-white font-black ring-2 ring-amber-400/30 shadow-md'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                                }`}
                              >
                                <span className="text-base">{info.emoji}</span>
                                <span className="text-xs font-bold">{val}</span>
                                <span className="text-[9px] leading-tight hidden sm:block truncate px-1 opacity-80">
                                  {info.text}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {q.tipo === 'multipla_escolha' && q.opcoes && (
                        <div className="space-y-2 pt-2">
                          {q.opcoes.map((opt) => {
                            const isSelected = respostas[q.id] === opt.valor;
                            return (
                              <button
                                key={opt.valor}
                                type="button"
                                onClick={() => handleSelectOption(q.id, opt.valor)}
                                className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-3 cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-600/20 border-amber-500 text-amber-200 ring-2 ring-amber-500/30'
                                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                }`}
                              >
                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-amber-400 bg-amber-500 text-slate-950' : 'border-slate-600'}`}>
                                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </span>
                                <span>{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep(6)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Avançar para Metodologias & Síntese</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 6: METODOLOGIAS ATIVAS & CONSIDERAÇÕES DISCURSIVAS */}
            {currentStep === 6 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
                <div className="space-y-2 border-b border-slate-800 pb-5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Etapa 6 de 6 • Metodologias Ativas & Conclusão
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsGlossarioGeralAberto(true)}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5" /> Dúvidas sobre as ferramentas?
                    </button>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Inovações Pedagógicas e Avaliação Aberta
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Últimas questões adaptadas ao seu perfil e espaço aberto para suas considerações discursivas:
                  </p>
                </div>

                <div className="space-y-6">
                  {dim4And5Questions.map((q, idx) => {
                    const termo = q.termoExplicativoId ? GLOSSARIO_PEDAGOGICO_TCC[q.termoExplicativoId] : null;
                    return (
                      <div key={q.id} className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm font-extrabold text-white leading-relaxed">
                              {q.enunciado}
                            </p>
                            {q.descricao && (
                              <p className="text-[11px] text-slate-400 mt-1 italic leading-relaxed">
                                {q.descricao}
                              </p>
                            )}
                            {termo && (
                              <button
                                type="button"
                                onClick={() => setTermoAtivo(termo)}
                                className="mt-1.5 text-[10px] font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 cursor-pointer"
                              >
                                <Info className="w-3 h-3 text-amber-400" />
                                <span>O que é isso? (Explicar {termo.titulo.split('(')[0].trim()})</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {q.tipo === 'likert_5' && (
                          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-2">
                            {[1, 2, 3, 4, 5].map((val) => {
                              const isSelected = respostas[q.id] === val;
                              const info = LIKERT_LABELS[val];
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleSelectLikert(q.id, val)}
                                  className={`py-2 px-1 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-600 border-emerald-400 text-white font-black ring-2 ring-emerald-400/30 shadow-md'
                                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                                  }`}
                                >
                                  <span className="text-base">{info.emoji}</span>
                                  <span className="text-xs font-bold">{val}</span>
                                  <span className="text-[9px] leading-tight hidden sm:block truncate px-1 opacity-80">
                                    {info.text}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {q.tipo === 'multipla_escolha' && q.opcoes && (
                          <div className="space-y-2 pt-2">
                            {q.opcoes.map((opt) => {
                              const isSelected = respostas[q.id] === opt.valor;
                              return (
                                <button
                                  key={opt.valor}
                                  type="button"
                                  onClick={() => handleSelectOption(q.id, opt.valor)}
                                  className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-3 cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30'
                                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                  }`}
                                >
                                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-emerald-400 bg-emerald-500 text-slate-950' : 'border-slate-600'}`}>
                                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </span>
                                  <span>{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {q.tipo === 'texto' && (
                          <div className="pt-2">
                            <textarea
                              rows={4}
                              placeholder="Sua reflexão sincera com suas próprias palavras..."
                              value={respostas[q.id] || ''}
                              onChange={(e) => handleTextChange(q.id, e.target.value)}
                              className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-6 border-t border-slate-800">
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-xl transition flex items-center gap-2.5 cursor-pointer active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Gravando Respostas...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{isEditingExistingProfile ? 'Atualizar Diagnóstico ✨' : 'Concluir & Enviar Diagnóstico 🎉'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL EXPLICATIVO INDIVIDUAL DE TERMO */}
      {termoAtivo && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{termoAtivo.icone}</span>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">{termoAtivo.titulo}</h3>
                  <p className="text-[11px] text-indigo-300 font-medium">{termoAtivo.subtitulo}</p>
                </div>
              </div>
              <button
                onClick={() => setTermoAtivo(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800">
                <strong className="text-white block mb-1 font-bold text-[11px] uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> O que é (em linguagem simples):
                </strong>
                <p>{termoAtivo.explicacaoSimples}</p>
              </div>

              <div className="p-3.5 bg-indigo-950/40 rounded-2xl border border-indigo-900/50">
                <strong className="text-white block mb-1 font-bold text-[11px] uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Como funciona na prática do Koinonia LMS:
                </strong>
                <p>{termoAtivo.comoFuncionaNoLms}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setTermoAtivo(null)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition cursor-pointer"
              >
                Entendi, continuar respondendo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GLOSSÁRIO GERAL */}
      {isGlossarioGeralAberto && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60 rounded-t-3xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Guia Rápido de Inovações Pedagógicas do TCC</h3>
                  <p className="text-[11px] text-slate-400">Conceitos investigados na pesquisa de campo do Koinonia LMS</p>
                </div>
              </div>
              <button
                onClick={() => setIsGlossarioGeralAberto(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
              {Object.values(GLOSSARIO_PEDAGOGICO_TCC).map((item) => (
                <div key={item.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-white font-extrabold text-sm">
                    <span className="text-xl">{item.icone}</span>
                    <span>{item.titulo}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{item.explicacaoSimples}</p>
                  <p className="text-indigo-300 text-[11px] bg-indigo-950/30 p-2 rounded-lg border border-indigo-900/40 leading-relaxed">
                    <strong>Na prática do LMS:</strong> {item.comoFuncionaNoLms}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/60 rounded-b-3xl">
              <button
                onClick={() => setIsGlossarioGeralAberto(false)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition cursor-pointer"
              >
                Fechar Glossário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RODAPÉ INSTITUCIONAL */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 px-4 text-center text-xs text-slate-500 space-y-2">
        <p className="max-w-2xl mx-auto font-medium">
          <strong>{INSTITUICAO_NOME}</strong> • {CURSO_NOME} • <strong>{SEMINARIO_NOME}</strong>
        </p>
        <p className="text-[11px] text-slate-400">
          Pesquisador: <strong>{PESQUISADOR_NOME}</strong> • Orientador: <strong>{ORIENTADOR_NOME}</strong>
        </p>
        <p className="text-[10px] text-slate-600 max-w-xl mx-auto">
          {PLATAFORMA_DESCRICAO}
        </p>
      </footer>
    </div>
  );
}
