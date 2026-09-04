'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  GraduationCap, CheckCircle2, ShieldCheck, Heart, 
  HelpCircle, ArrowRight, ArrowLeft, Share2, Copy, 
  Check, Sparkles, AlertCircle, BookOpen, Send, RefreshCw, 
  MessageSquare, Lock, LogIn, ExternalLink, Info, X, Lightbulb,
  Edit3, CheckCircle, UserCheck, BarChart3, Square, CheckSquare
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
  COORDENADORA_TCC_NOME,
  METODOLOGIA_PROF,
  CIDADE_ESTADO,
  TCC_TITULO_PRINCIPAL,
  TCC_SUBTITULO,
  TCC_TEMA,
  TCC_PROBLEMA_PESQUISA,
  TCC_HIPOTESE,
  TCC_OBJETIVO_GERAL,
  TCC_OBJETIVOS_ESPECIFICOS,
  TCC_CAPITULOS_ESTRUTURA,
  PLATAFORMA_NOME,
  PLATAFORMA_DESCRICAO,
  getEnqueteById,
  normalizeEnqueteSecoes,
  EnquetePersonalizada,
  SecaoEnqueteCustom,
  PerguntaEnqueteCustom
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
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [copiedFullMessage, setCopiedFullMessage] = useState<boolean>(false);
  
  // Mapa de estados de todos os perfis já preenchidos neste navegador
  const [allProfileStates, setAllProfileStates] = useState<Record<string, PerfilResponseState>>({});
  const [isEditingExistingProfile, setIsEditingExistingProfile] = useState<boolean>(false);
  const [cloudLoadedNotice, setCloudLoadedNotice] = useState<string | null>(null);
  const [isLoadingRemoteResponses, setIsLoadingRemoteResponses] = useState<boolean>(false);

  // Enquete Personalizada (quando acessada por link /pesquisa-tcc?enquete=<id>)
  const [customEnquete, setCustomEnquete] = useState<EnquetePersonalizada | null>(null);
  const [customSecoes, setCustomSecoes] = useState<SecaoEnqueteCustom[]>([]);
  const [isLoadingEnquete, setIsLoadingEnquete] = useState<boolean>(false);
  const [secaoDicaModal, setSecaoDicaModal] = useState<{ titulo: string; conteudo: string } | null>(null);

  // Sessão e Autenticação
  const [userAuthEmail, setUserAuthEmail] = useState<string | null>(null);
  const [userAuthName, setUserAuthName] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  
  // Modal de Explicação de Termos & Ficha do Pré-Projeto
  const [termoAtivo, setTermoAtivo] = useState<TermoExplicativo | null>(null);
  const [isGlossarioGeralAberto, setIsGlossarioGeralAberto] = useState<boolean>(false);
  const [isPreProjetoModalOpen, setIsPreProjetoModalOpen] = useState<boolean>(false);
  const [preProjetoActiveTab, setPreProjetoActiveTab] = useState<'apresentacao' | 'objetivos' | 'capitulos' | 'metodologia'>('apresentacao');

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

    const enqueteParam = params.get('enquete');
    if (enqueteParam) {
      setIsLoadingEnquete(true);
      getEnqueteById(enqueteParam).then((enq) => {
        setIsLoadingEnquete(false);
        if (enq) {
          setCustomEnquete(enq);
          const normalized = normalizeEnqueteSecoes(enq);
          setCustomSecoes(normalized);
          if (enq.publicoAlvo && enq.publicoAlvo !== 'todos' && TIPO_PUBLICO_LABELS[enq.publicoAlvo]) {
            setTipoPublico(enq.publicoAlvo as TipoPublico);
          }
        }
      }).catch(() => setIsLoadingEnquete(false));
    }

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

    const loadRemoteResponsesIfAny = async (emailToSearch: string) => {
      if (!emailToSearch || !emailToSearch.includes('@')) return;
      setIsLoadingRemoteResponses(true);
      try {
        const res = await fetch(`/api/tcc/pesquisa-campo?email=${encodeURIComponent(emailToSearch.toLowerCase().trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.found && data.data) {
            const rec = data.data;
            if (rec.respostas && Object.keys(rec.respostas).length > 0) {
              setRespostas(rec.respostas);
              if (rec.tipo_publico) {
                setTipoPublico(rec.tipo_publico);
              }
              if (rec.dados_identificacao) {
                setDadosIdentificacao((prev) => ({
                  ...prev,
                  ...rec.dados_identificacao,
                  email: emailToSearch.toLowerCase().trim(),
                }));
              }
              setAutorizouTcle(true);
              setIsEditingExistingProfile(true);
              setCloudLoadedNotice(`✨ Respostas de ${rec.dados_identificacao?.nome || emailToSearch} recuperadas da nuvem! Você pode alterá-las livremente.`);
            }
          }
        }
      } catch (e) {
        console.warn('Aviso ao carregar respostas remotas:', e);
      } finally {
        setIsLoadingRemoteResponses(false);
      }
    };

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
        if (email) {
          loadRemoteResponsesIfAny(email);
        }
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
        if (email) {
          loadRemoteResponsesIfAny(email);
        }
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

  const handleToggleCheckbox = (perguntaId: string, val: string) => {
    setRespostas((prev) => {
      const currentList: string[] = Array.isArray(prev[perguntaId]) ? prev[perguntaId] : [];
      if (currentList.includes(val)) {
        return { ...prev, [perguntaId]: currentList.filter((item) => item !== val) };
      } else {
        return { ...prev, [perguntaId]: [...currentList, val] };
      }
    });
  };

  const handleTextChange = (perguntaId: string, text: string) => {
    setRespostas((prev) => ({ ...prev, [perguntaId]: text }));
  };

  const getFormattedWhatsappMessage = () => {
    return (
      `🎓 *Pesquisa de Campo • TCC em Teologia (UNIMB & UIECB)*\n` +
      `🏛️ *${SEMINARIO_NOME} & Plataforma ${PLATAFORMA_NOME}*\n\n` +
      `Prezado(a) irmão(ã), pastor, docente ou seminarista,\n\n` +
      `Gostaria de convidá-lo(a) a participar da pesquisa de campo do Trabalho de Conclusão de Curso (TCC) em Teologia no *${INSTITUICAO_NOME}*:\n\n` +
      `📖 *Título:* "${customEnquete ? customEnquete.titulo : TCC_TITULO_PRINCIPAL}"\n` +
      `📜 *Subtítulo:* "${customEnquete ? customEnquete.descricao : TCC_SUBTITULO}"\n\n` +
      `👤 *Pesquisador:* ${PESQUISADOR_NOME}\n` +
      `✝️ *Orientador:* ${ORIENTADOR_NOME}\n` +
      `📐 *Coordenadora de TCC I:* ${COORDENADORA_TCC_NOME}\n` +
      `📍 *Local:* ${CIDADE_ESTADO}\n\n` +
      `O questionário é rápido, intuitivo e conta com *perguntas estruturadas e personalizadas*.\n\n` +
      `👉 *Acesse e participe pelo link:*\n` +
      `${typeof window !== 'undefined' ? window.location.href : 'https://koinonialms.vercel.app/pesquisa-tcc'}\n\n` +
      `Sua contribuição científica e pastoral é fundamental para a formação teológica no Brasil! Deus abençoe!`
    );
  };

  const handleOpenWhatsappDirect = () => {
    if (typeof window === 'undefined') return;
    const text = getFormattedWhatsappMessage();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyFullMessage = () => {
    if (typeof window === 'undefined') return;
    const text = getFormattedWhatsappMessage();
    navigator.clipboard.writeText(text);
    setCopiedFullMessage(true);
    setTimeout(() => setCopiedFullMessage(false), 3000);
  };

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    const url = customEnquete
      ? `${window.location.origin}/pesquisa-tcc?enquete=${customEnquete.id}`
      : `${window.location.origin}/pesquisa-tcc?origem=whatsapp_externo`;
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

    const isExigeLoginGoogle = !customEnquete 
      ? isComunidadeInterna 
      : (customEnquete.publicoAlvo !== 'todos' && isComunidadeInterna);

    if (isExigeLoginGoogle && !userAuthEmail) {
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
      origem: customEnquete ? (`enquete_${customEnquete.id}` as any) : origem,
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

  const totalSteps = customEnquete ? (2 + Math.max(customSecoes.length, 1)) : 6;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  // Filtra perguntas personalizadas por dimensão para renderização por etapas (questionário canônico)
  const dim1Questions = useMemo(() => perguntasAtuais.filter((p) => p.dimensao === 'distancia_transacional'), [perguntasAtuais]);
  const dim2Questions = useMemo(() => perguntasAtuais.filter((p) => p.dimensao === 'koinonia'), [perguntasAtuais]);
  const dim3Questions = useMemo(() => perguntasAtuais.filter((p) => p.dimensao === 'transicao_internato'), [perguntasAtuais]);
  const dim4And5Questions = useMemo(() => perguntasAtuais.filter((p) => p.dimensao === 'metodologias_ativas' || p.dimensao === 'qualitativa'), [perguntasAtuais]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* CABEÇALHO SUPERIOR */}
      <header className="border-b border-indigo-900/40 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md shrink-0 border border-indigo-400/30 bg-slate-900 flex items-center justify-center">
              <img src="/logo-koinonia-lms.png" alt="Logo Oficial Koinonia LMS" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  TCC Teologia • {INSTITUICAO_NOME} & {SEMINARIO_NOME}
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
              <h1 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                Pesquisa de Campo & Diagnóstico do TCC
              </h1>
              <p className="text-[11px] text-slate-400 truncate max-w-md hidden sm:block">
                {TCC_TITULO_PRINCIPAL}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreProjetoModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 transition cursor-pointer shadow-xs active:scale-95"
              title="Ver Ficha Técnica do Pré-Projeto Aprovado (Problema, Hipótese, Objetivos e Capítulos)"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Pré-Projeto Aprovado</span>
              <span className="sm:hidden">Pré-Projeto</span>
            </button>


            <button
              onClick={() => setIsGlossarioGeralAberto(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition cursor-pointer"
              title="Ver glossário de inovações pedagógicas e termos do TCC"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Glossário</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition cursor-pointer shadow-xs active:scale-95"
              title="Compartilhar pesquisa com convite completo no WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Convidar</span>
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
                {customEnquete 
                  ? `Enquete "${customEnquete.titulo}" Respondida com Sucesso!` 
                  : (isEditingExistingProfile ? 'Respostas Atualizadas com Sucesso!' : 'Diagnóstico Registrado com Sucesso!')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Muito Obrigado por sua Contribuição!</h2>
              <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                {customEnquete ? (
                  <>Suas respostas foram gravadas e fundamentarão a coleta empírica da pesquisa do TCC de <strong>{PESQUISADOR_NOME}</strong> ({INSTITUICAO_NOME} & {SEMINARIO_NOME}).</>
                ) : (
                  <>Suas respostas foram salvas com sucesso para o perfil <strong>{TIPO_PUBLICO_LABELS[tipoPublico]?.label}</strong> e fundamentarão a triangulação metodológica do TCC de <strong>{PESQUISADOR_NOME}</strong>, sob orientação do <strong>{ORIENTADOR_NOME}</strong> ({INSTITUICAO_NOME} & {SEMINARIO_NOME}).</>
                )}
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 flex-wrap">
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
                onClick={() => setIsShareModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Convidar no WhatsApp</span>
              </button>
            </div>
          </div>
        ) : customEnquete ? (
          <div className="space-y-6">
            {/* ETAPA 1 CUSTOM: APRESENTAÇÃO E TCLE DA ENQUETE PERSONALIZADA */}
            {currentStep === 1 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
                <div className="space-y-2 border-b border-slate-800 pb-5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-400/30">
                      Etapa 1 de {totalSteps} • Instrumento Empírico de Campo
                    </span>
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${customEnquete.status === 'aberta' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' : 'bg-rose-950/60 text-rose-400 border-rose-500/30'}`}>
                      {customEnquete.status === 'aberta' ? '🟢 Coleta Aberta' : '🔒 Enquete Encerrada'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {customEnquete.titulo}
                  </h2>
                  {customEnquete.descricao && (
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      {customEnquete.descricao}
                    </p>
                  )}
                </div>

                {/* Ficha da Enquete Customizada */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Público-Alvo</span>
                    <span className="font-extrabold text-white block">
                      {customEnquete.publicoAlvo === 'todos' ? 'Todos os Públicos (Geral)' : (TIPO_PUBLICO_LABELS[customEnquete.publicoAlvo]?.label || customEnquete.publicoAlvo)}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Responsável</span>
                    <span className="font-extrabold text-white block">{customEnquete.created_by || PESQUISADOR_NOME}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Estrutura</span>
                    <span className="font-extrabold text-indigo-300 block">{customSecoes.length} {customSecoes.length === 1 ? 'Seção Temática' : 'Seções Temáticas'}</span>
                  </div>
                </div>

                {/* Termo de Consentimento Livre e Esclarecido (TCLE) */}
                <div className="prose prose-invert max-w-none text-xs text-slate-300 space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 max-h-72 overflow-y-auto leading-relaxed">
                  <p>
                    Você está sendo convidado(a) a participar voluntariamente desta coleta empírica vinculada ao Trabalho de Conclusão de Curso em Teologia ({INSTITUICAO_NOME} & {SEMINARIO_NOME}), conduzida por <strong>{PESQUISADOR_NOME}</strong> sob orientação de <strong>{ORIENTADOR_NOME}</strong>.
                  </p>
                  <p>
                    <strong>Garantias Éticas e Legais (Resoluções CNS 466/2012 e 510/2016):</strong> A sua participação nesta pesquisa é estritamente voluntária e anônima para fins de tabulação estatística. Não há qualquer ônus financeiro nem riscos aos respondentes. Suas respostas serão tratadas com absoluto sigilo científico.
                  </p>
                </div>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 cursor-pointer hover:bg-purple-950/50 transition">
                  <input
                    type="checkbox"
                    checked={autorizouTcle}
                    onChange={(e) => setAutorizouTcle(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-slate-700 text-purple-600 focus:ring-purple-500 shrink-0 cursor-pointer"
                  />
                  <div className="text-xs text-slate-200">
                    <strong className="text-white block font-bold">Declaração de Consentimento Livre e Esclarecido (TCLE)</strong>
                    Li e concordo voluntariamente em participar desta pesquisa acadêmica, autorizando o tratamento científico das minhas respostas.
                  </div>
                </label>

                <div className="flex justify-end pt-4">
                  <button
                    disabled={!autorizouTcle || customEnquete.status === 'encerrada'}
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>{customEnquete.status === 'encerrada' ? 'Enquete Encerrada' : 'Avançar para Identificação'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 2 CUSTOM: IDENTIFICAÇÃO DO PARTICIPANTE */}
            {currentStep === 2 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
                <div className="space-y-2 border-b border-slate-800 pb-5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      Etapa 2 de {totalSteps} • Identificação do Participante
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Caracterização & Perfil de Atuação
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Seus dados pessoais são protegidos e opcionais. Eles nos auxiliam na categorização dos dados empíricos do TCC:
                  </p>
                </div>

                {/* Se o público for 'todos', permite selecionar o perfil */}
                {customEnquete.publicoAlvo === 'todos' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-indigo-300">Qual é a sua relação com o Seminário ou Igreja?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(Object.keys(TIPO_PUBLICO_LABELS) as TipoPublico[])
                        .filter((key) => !key.includes('_unib'))
                        .map((key) => {
                          const cfg = TIPO_PUBLICO_LABELS[key];
                          const isSelected = tipoPublico === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setTipoPublico(key)}
                              className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-600/25 border-purple-500 text-white ring-2 ring-purple-500/30 font-bold'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span className="text-xl">{cfg.emoji}</span>
                              <span className="truncate">{cfg.label}</span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Campos de Identificação Complementares */}
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
                        placeholder="Para receber os resultados da pesquisa"
                        value={dadosIdentificacao.whatsapp || dadosIdentificacao.email || ''}
                        onChange={(e) => setDadosIdentificacao({ ...dadosIdentificacao, whatsapp: e.target.value, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Igreja / Denominação:</label>
                      <input
                        type="text"
                        placeholder="Ex: Igreja Evangélica Congregacional..."
                        value={dadosIdentificacao.igreja || ''}
                        onChange={(e) => setDadosIdentificacao({ ...dadosIdentificacao, igreja: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Cidade / Estado (UF):</label>
                      <input
                        type="text"
                        placeholder="Ex: Fortaleza/CE, Salvador/BA..."
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
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Iniciar Questionário</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPAS 3 EM DIANTE: SEÇÕES DE PERGUNTAS CUSTOMIZADAS */}
            {currentStep >= 3 && currentStep <= 2 + customSecoes.length && (() => {
              const secIdx = currentStep - 3;
              const sec = customSecoes[secIdx];
              if (!sec) return null;
              const isUltimaSecao = currentStep === 2 + customSecoes.length;

              return (
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
                  {/* CABEÇALHO DA SEÇÃO (IDÊNTICO À DIMENSÃO 2) */}
                  <div className="space-y-2 border-b border-slate-800 pb-5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-400/30">
                        {sec.badge ? `ETAPA ${currentStep} DE ${totalSteps} • ${sec.badge}` : `ETAPA ${currentStep} DE ${totalSteps} • SEÇÃO ${secIdx + 1}`}
                      </span>
                      {sec.dicaAjuda && (
                        <button
                          type="button"
                          onClick={() => setSecaoDicaModal({
                            titulo: sec.dicaAjuda || 'Ajuda Conceitual',
                            conteudo: sec.dicaConteudo || 'Esta dimensão investiga a vivência e percepções no modelo de formação teológica e ministerial.'
                          })}
                          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition active:scale-95"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>{sec.dicaAjuda}</span>
                        </button>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {sec.titulo}
                    </h2>
                    {sec.descricao && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {sec.descricao}
                      </p>
                    )}
                  </div>

                  {/* LISTA DE PERGUNTAS DA SEÇÃO */}
                  <div className="space-y-6">
                    {sec.perguntas.map((q, pIdx) => {
                      const perguntaId = q.id || `sec_${secIdx + 1}_q_${pIdx + 1}`;
                      const valorAtual = respostas[perguntaId];

                      return (
                        <div key={perguntaId} className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                              {pIdx + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-xs sm:text-sm font-extrabold text-white leading-relaxed">
                                {q.enunciado}
                                {q.obrigatoria && <span className="text-rose-400 ml-1 font-bold" title="Pergunta obrigatória">*</span>}
                              </p>
                              {q.dica && (
                                <button
                                  type="button"
                                  onClick={() => setSecaoDicaModal({
                                    titulo: 'Conceito da Questão',
                                    conteudo: q.dica || ''
                                  })}
                                  className="mt-1.5 text-[10px] font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 cursor-pointer"
                                >
                                  <Info className="w-3 h-3 text-amber-400" />
                                  <span>{q.dica}</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 1. TIPO: ESCALA LIKERT (1 a 5) - IDÊNTICO À CAPTURA 2 */}
                          {q.tipo === 'likert_5' && (
                            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-2">
                              {[1, 2, 3, 4, 5].map((val) => {
                                const isSelected = valorAtual === val;
                                const info = LIKERT_LABELS[val];
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleSelectLikert(perguntaId, val)}
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
                          )}

                          {/* 2. TIPO: MÚLTIPLA ESCOLHA - IDÊNTICO À CAPTURA 3 */}
                          {q.tipo === 'multipla_escolha' && (
                            <div className="space-y-2 pt-2">
                              {(q.opcoes || ['Opção 1', 'Opção 2']).map((opt, optIdx) => {
                                const isSelected = valorAtual === opt;
                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => handleSelectOption(perguntaId, opt)}
                                    className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-3 cursor-pointer ${
                                      isSelected
                                        ? 'bg-amber-600/20 border-amber-500 text-amber-200 ring-2 ring-amber-500/30'
                                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                    }`}
                                  >
                                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-amber-400 bg-amber-500 text-slate-950' : 'border-slate-600'}`}>
                                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </span>
                                    <span>{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* 3. TIPO: CAIXAS DE SELEÇÃO (CHECKBOXES MÚLTIPLOS) */}
                          {q.tipo === 'caixas_selecao' && (
                            <div className="space-y-2 pt-2">
                              {(q.opcoes || ['Opção 1', 'Opção 2']).map((opt, optIdx) => {
                                const currentArr: string[] = Array.isArray(valorAtual) ? valorAtual : [];
                                const isChecked = currentArr.includes(opt);
                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => handleToggleCheckbox(perguntaId, opt)}
                                    className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-3 cursor-pointer ${
                                      isChecked
                                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-2 ring-indigo-500/30'
                                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                    }`}
                                  >
                                    <span className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${isChecked ? 'border-indigo-400 bg-indigo-600 text-white' : 'border-slate-600 bg-slate-950'}`}>
                                      {isChecked && <Check className="w-3 h-3 text-white" />}
                                    </span>
                                    <span>{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* 4. TIPO: TEXTO LONGO / PARÁGRAFO - IDÊNTICO À CAPTURA 4 */}
                          {(q.tipo === 'texto_longo' || q.tipo === 'texto') && (
                            <div className="pt-2">
                              <textarea
                                rows={4}
                                placeholder="Sua reflexão sincera com suas próprias palavras..."
                                value={valorAtual || ''}
                                onChange={(e) => handleTextChange(perguntaId, e.target.value)}
                                className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                              />
                            </div>
                          )}

                          {/* 5. TIPO: TEXTO CURTO */}
                          {q.tipo === 'texto_curto' && (
                            <div className="pt-2">
                              <input
                                type="text"
                                placeholder="Digite sua resposta curta..."
                                value={valorAtual || ''}
                                onChange={(e) => handleTextChange(perguntaId, e.target.value)}
                                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          )}

                          {/* 6. TIPO: ESCALA LINEAR (0 a 10) */}
                          {q.tipo === 'escala_10' && (
                            <div className="space-y-1.5 pt-2">
                              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-semibold">
                                <span>0 - Menor / Discordo</span>
                                <span>10 - Máximo / Excelente</span>
                              </div>
                              <div className="grid grid-cols-11 gap-1">
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                                  const isSelected = valorAtual === num;
                                  return (
                                    <button
                                      key={num}
                                      type="button"
                                      onClick={() => handleSelectLikert(perguntaId, num)}
                                      className={`py-2 text-center rounded-lg border text-xs font-bold transition cursor-pointer ${
                                        isSelected
                                          ? 'bg-purple-600 border-purple-400 text-white shadow-md ring-2 ring-purple-400/30'
                                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                                      }`}
                                    >
                                      {num}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* 7. TIPO: SIM / NÃO / EM PARTE */}
                          {q.tipo === 'sim_nao' && (
                            <div className="grid grid-cols-3 gap-2 pt-2">
                              {[
                                { val: 'sim', label: 'Sim' },
                                { val: 'em_parte', label: 'Em Parte' },
                                { val: 'nao', label: 'Não' },
                              ].map((item) => {
                                const isSelected = valorAtual === item.val;
                                return (
                                  <button
                                    key={item.val}
                                    type="button"
                                    onClick={() => handleSelectOption(perguntaId, item.val)}
                                    className={`py-3 px-2 rounded-xl border text-center text-xs font-extrabold transition cursor-pointer ${
                                      isSelected
                                        ? 'bg-purple-600 border-purple-400 text-white ring-2 ring-purple-400/30 shadow-md'
                                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                    }`}
                                  >
                                    {item.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* RODAPÉ DE NAVEGAÇÃO DA SEÇÃO */}
                  <div className="flex justify-between pt-6 border-t border-slate-800">
                    <button
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar</span>
                    </button>

                    {isUltimaSecao ? (
                      <button
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                        className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-xl transition flex items-center gap-2.5 cursor-pointer active:scale-95"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Gravando Respostas...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Concluir & Enviar Enquete 🎉</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <span>Avançar Seção</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="space-y-6">
            {/* ETAPA 1: TERMO DE CONSENTIMENTO (TCLE) */}
            {currentStep === 1 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
                <div className="space-y-2 border-b border-slate-800 pb-5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      Etapa 1 de 6 • Apresentação do TCC & Consentimento Livre (TCLE)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPreProjetoModalOpen(true)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ver Ficha Técnica do Pré-Projeto</span>
                    </button>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {TCC_TITULO_PRINCIPAL}
                  </h2>
                  <p className="text-xs text-indigo-300 font-medium leading-relaxed italic">
                    {TCC_SUBTITULO}
                  </p>
                </div>

                {/* Card de Ficha Acadêmica Institucional */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Instituição & Seminário</span>
                    <span className="font-extrabold text-white block">{INSTITUICAO_NOME}</span>
                    <span className="text-[11px] text-indigo-300">{SEMINARIO_NOME}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pesquisador / Autor</span>
                    <span className="font-extrabold text-white block">{PESQUISADOR_NOME}</span>
                    <span className="text-[11px] text-slate-300">{CURSO_NOME}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Orientação Acadêmica</span>
                    <span className="font-extrabold text-white block">{ORIENTADOR_NOME}</span>
                    <span className="text-[11px] text-slate-300">Coord. TCC I: {COORDENADORA_TCC_NOME}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Local & Ano</span>
                    <span className="font-extrabold text-white block">{CIDADE_ESTADO}</span>
                    <span className="text-[11px] text-emerald-400 font-semibold">Bacharelado em Teologia</span>
                  </div>
                </div>

                {/* Texto Formal do TCLE e Ética Científica */}
                <div className="prose prose-invert max-w-none text-xs text-slate-300 space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 max-h-72 overflow-y-auto leading-relaxed">
                  <p>
                    Você está sendo convidado(a) a participar como voluntário(a) da pesquisa de campo do Trabalho de Conclusão do Curso Bacharel em Teologia, apresentado no <strong>{INSTITUICAO_NOME}</strong>, pelo pesquisador <strong>{PESQUISADOR_NOME}</strong>, sob orientação do <strong>{ORIENTADOR_NOME}</strong> e coordenação metodológica da <strong>{COORDENADORA_TCC_NOME}</strong>, no âmbito acadêmico do <strong>{SEMINARIO_NOME}</strong>.
                  </p>
                  
                  <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-900/50 space-y-1">
                    <strong className="text-white block font-bold text-[11px] uppercase tracking-wider text-indigo-300">
                      Problema de Pesquisa & Hipótese Investigada:
                    </strong>
                    <p className="italic text-slate-200">"{TCC_PROBLEMA_PESQUISA}"</p>
                  </div>

                  <p>
                    <strong>Objetivo Geral da Investigação:</strong> {TCC_OBJETIVO_GERAL}
                  </p>

                  <p>
                    <strong>Sobre o Laboratório Instrumental ({PLATAFORMA_NOME}):</strong> {PLATAFORMA_DESCRICAO} A ferramenta atua como sandbox pedagógico andragógico, integrando o Simulador Pastoral RPG, Mural Interativo de Oração (Mural Koinonia) e Caderno Metacognitivo Cornell assistido por IA.
                  </p>

                  <p>
                    <strong>Garantias Éticas e Legais (Resoluções CNS 466/2012 e 510/2016):</strong> A participação nesta pesquisa é estritamente voluntária e anônima para fins de tabulação estatística (IBM SPSS e Excel). Não há nenhum ônus financeiro, comercial ou risco de qualquer natureza aos participantes. As respostas serão tratadas com absoluto sigilo acadêmico.
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
                    <strong className="text-white block font-bold">Declaração de Concordância e Consentimento (TCLE)</strong>
                    Li e concordo voluntariamente em participar desta pesquisa acadêmica, autorizando o tratamento científico e estatístico das minhas respostas para o Trabalho de Conclusão de Curso em Teologia de {PESQUISADOR_NOME} ({INSTITUICAO_NOME} / {SEMINARIO_NOME}).
                  </div>
                </label>

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={() => setIsPreProjetoModalOpen(true)}
                    className="text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1.5 underline cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Conhecer a estrutura dos 4 capítulos do TCC</span>
                  </button>

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

                {cloudLoadedNotice && (
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                    <div>
                      <strong className="block text-emerald-300 font-bold">Respostas Recuperadas da Nuvem:</strong>
                      {cloudLoadedNotice}
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-400">WhatsApp ou E-mail (Opcional):</label>
                        {(dadosIdentificacao.whatsapp || dadosIdentificacao.email) && (
                          <button
                            type="button"
                            onClick={async () => {
                              const emailToSearch = (dadosIdentificacao.email || dadosIdentificacao.whatsapp || '').trim().toLowerCase();
                              if (!emailToSearch.includes('@')) {
                                setErrorMessage('Por favor, informe um endereço de e-mail válido para buscar respostas anteriores.');
                                return;
                              }
                              setIsLoadingRemoteResponses(true);
                              try {
                                const res = await fetch(`/api/tcc/pesquisa-campo?email=${encodeURIComponent(emailToSearch)}`);
                                const data = await res.json();
                                if (data.success && data.found && data.data) {
                                  const rec = data.data;
                                  setRespostas(rec.respostas || {});
                                  if (rec.tipo_publico) setTipoPublico(rec.tipo_publico);
                                  if (rec.dados_identificacao) {
                                    setDadosIdentificacao((prev) => ({
                                      ...prev,
                                      ...rec.dados_identificacao,
                                      email: emailToSearch,
                                    }));
                                  }
                                  setAutorizouTcle(true);
                                  setIsEditingExistingProfile(true);
                                  setCloudLoadedNotice(`✨ Respostas de ${rec.dados_identificacao?.nome || emailToSearch} carregadas! Você pode alterá-las livremente.`);
                                } else {
                                  setErrorMessage('Nenhuma resposta prévia encontrada para este e-mail. Você pode responder agora!');
                                }
                              } catch (_) {
                                setErrorMessage('Erro ao consultar respostas na nuvem.');
                              } finally {
                                setIsLoadingRemoteResponses(false);
                              }
                            }}
                            disabled={isLoadingRemoteResponses}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold underline flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className={`w-3 h-3 ${isLoadingRemoteResponses ? 'animate-spin' : ''}`} />
                            <span>{isLoadingRemoteResponses ? 'Buscando...' : 'Carregar Minhas Respostas da Nuvem'}</span>
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Para receber o artigo do TCC ou carregar respostas para alterar"
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

      {/* MODAL DA FICHA COMPLETA DO PRÉ-PROJETO DE TCC (APROVADO) */}
      {isPreProjetoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header do Modal */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/80 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      Pré-Projeto de TCC Aprovado • UNIMB & UIECB
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">2026</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white leading-tight mt-0.5">
                    {TCC_TITULO_PRINCIPAL}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsPreProjetoModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Abas Internas do Pré-Projeto */}
            <div className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-950/50 border-b border-slate-800 overflow-x-auto shrink-0 text-xs font-bold">
              <button
                onClick={() => setPreProjetoActiveTab('apresentacao')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  preProjetoActiveTab === 'apresentacao'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                1. Identificação & Tema
              </button>
              <button
                onClick={() => setPreProjetoActiveTab('objetivos')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  preProjetoActiveTab === 'objetivos'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                2. Problema, Hipótese & Objetivos
              </button>
              <button
                onClick={() => setPreProjetoActiveTab('capitulos')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  preProjetoActiveTab === 'capitulos'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                3. Estrutura dos 4 Capítulos
              </button>
              <button
                onClick={() => setPreProjetoActiveTab('metodologia')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  preProjetoActiveTab === 'metodologia'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                4. Procedimentos Metodológicos
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-300 flex-1 leading-relaxed">
              {preProjetoActiveTab === 'apresentacao' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400">Instituição Acadêmica</span>
                      <p className="font-extrabold text-white text-sm">{INSTITUICAO_NOME}</p>
                      <p className="text-slate-400 text-[11px]">{CURSO_NOME}</p>
                    </div>

                    <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400">Seminário Vinculado</span>
                      <p className="font-extrabold text-white text-sm">{SEMINARIO_NOME}</p>
                      <p className="text-slate-400 text-[11px]">União das Igrejas Evangélicas Congregacionais do Brasil</p>
                    </div>

                    <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400">Pesquisador / Autor</span>
                      <p className="font-extrabold text-white text-sm">{PESQUISADOR_NOME}</p>
                      <p className="text-slate-400 text-[11px]">Bacharelando em Teologia</p>
                    </div>

                    <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400">Corpo Docente Orientador</span>
                      <p className="font-extrabold text-white text-sm">Orientador: {ORIENTADOR_NOME}</p>
                      <p className="text-slate-400 text-[11px]">Coord. TCC I: {COORDENADORA_TCC_NOME}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                    <span className="text-[10px] uppercase font-black tracking-wider text-indigo-400 block">
                      Título & Subtítulo Oficiais Registrados
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-white">{TCC_TITULO_PRINCIPAL}</h4>
                    <p className="text-xs text-indigo-300 italic">{TCC_SUBTITULO}</p>
                  </div>

                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block">
                      Justificativa & Relevância da Investigação
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      A pesquisa justifica-se pela superação de uma dicotomia histórica que polariza a educação teológica no Brasil: de um lado, a crença nostálgica de que apenas o internato presencial residencial fechado molda o caráter pastoral; de outro, a instrumentalização massificada da EaD tecnicista sem comunhão. O estudo demonstra a viabilidade de uma formação teológica síncrona que preserva a <strong>koinonia</strong> e capacita o obreiro sem desvinculá-lo de sua congregação local e de sua família.
                    </p>
                  </div>
                </div>
              )}

              {preProjetoActiveTab === 'objetivos' && (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl space-y-1.5">
                    <span className="text-[10px] uppercase font-black tracking-wider text-indigo-300 block flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                      Problema de Pesquisa
                    </span>
                    <p className="text-sm font-bold text-white italic">
                      "{TCC_PROBLEMA_PESQUISA}"
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-1.5">
                    <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300 block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Hipótese de Trabalho
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {TCC_HIPOTESE}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                      Objetivo Geral
                    </span>
                    <p className="text-xs font-bold text-white leading-relaxed">
                      {TCC_OBJETIVO_GERAL}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2.5">
                    <span className="text-[10px] uppercase font-black tracking-wider text-indigo-400 block">
                      Objetivos Específicos
                    </span>
                    <ul className="space-y-2 text-xs">
                      {TCC_OBJETIVOS_ESPECIFICOS.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300">
                          <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 text-[10px] font-bold border border-indigo-400/30">
                            {i + 1}
                          </span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {preProjetoActiveTab === 'capitulos' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Estrutura teórico-metodológica dos 4 capítulos que compõem o corpo da monografia:
                  </p>
                  {TCC_CAPITULOS_ESTRUTURA.map((cap, i) => (
                    <div key={i} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30">
                          {cap.capitulo}
                        </span>
                        <h4 className="text-xs font-black text-white">{cap.titulo}</h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pl-1">
                        {cap.descricao}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {preProjetoActiveTab === 'metodologia' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block">
                      Abordagem Metodológica & Triangulação Científica
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      A consecução dos objetivos pauta-se em uma abordagem metodológica qualitativa de cunho teórico, bibliográfico, documental e estudo de caso instrumental (LAKATOS; MARCONI, 2017). A investigação estrutura-se em 3 etapas integradas:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                      <span className="text-indigo-400 font-bold text-xs block">1. Pesquisa Bibliográfica</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Teóricos clássicos da EaD (Moore, Garrison, Rovai) e autores da educação teológica virtual (Modes, Gandra & Baade, Souza, Reblin, Eliseu Roque).
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                      <span className="text-indigo-400 font-bold text-xs block">2. Pesquisa Documental</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Análise de PPCs (ex: FABAPAR), planos históricos do seminário UIECB e diretrizes curriculares do MEC (Parecer CNE/CES nº 241/1999).
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                      <span className="text-indigo-400 font-bold text-xs block">3. Estudo Instrumental LMS</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Apresentação das decisões técnicas de engenharia pedagógica do Koinonia LMS (RPG Pastoral, Mural de Oração, Cornell com IA).
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-[11px] text-slate-300 leading-relaxed flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-300 block font-bold">Conformidade Ética:</strong>
                      Pesquisa com dados agregados e desidentificados, em conformidade com as Resoluções CNS 466/2012 e 510/2016, com exportação para tabulação estatística no IBM SPSS e Microsoft Excel.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-950/80 rounded-b-3xl">
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                {CURSO_NOME} • {INSTITUICAO_NOME} ({CIDADE_ESTADO})
              </span>
              <button
                onClick={() => setIsPreProjetoModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
              >
                Fechar Ficha do Pré-Projeto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EXPLICATIVO INDIVIDUAL DE TERMO */}
      {termoAtivo && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{termoAtivo.icone}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-white">{termoAtivo.titulo}</h3>
                    {termoAtivo.capituloRef && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                        {termoAtivo.capituloRef}
                      </span>
                    )}
                  </div>
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

              {termoAtivo.fundamentacaoTeorica && (
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
                  <strong className="text-slate-300 block mb-0.5 font-semibold">Fundamentação Teórica:</strong>
                  <p className="italic">{termoAtivo.fundamentacaoTeorica}</p>
                </div>
              )}
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

      {/* MODAL DE DICA DA SEÇÃO OU PERGUNTA DA ENQUETE CUSTOMIZADA */}
      {secaoDicaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">{secaoDicaModal.titulo}</h3>
                  <p className="text-[11px] text-purple-300 font-medium">Fundamentação conceitual e pedagógica</p>
                </div>
              </div>
              <button
                onClick={() => setSecaoDicaModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
              <p className="whitespace-pre-line">{secaoDicaModal.conteudo}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSecaoDicaModal(null)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition cursor-pointer"
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
                  <p className="text-[11px] text-slate-400">Conceitos fundamentados nos Capítulos I a IV do Pré-Projeto de TCC</p>
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
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-white font-extrabold text-sm">
                      <span className="text-xl">{item.icone}</span>
                      <span>{item.titulo}</span>
                    </div>
                    {item.capituloRef && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                        {item.capituloRef}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 leading-relaxed">{item.explicacaoSimples}</p>
                  <p className="text-indigo-300 text-[11px] bg-indigo-950/30 p-2 rounded-lg border border-indigo-900/40 leading-relaxed">
                    <strong>Na prática do LMS:</strong> {item.comoFuncionaNoLms}
                  </p>
                  {item.fundamentacaoTeorica && (
                    <p className="text-[10px] text-slate-500 italic pl-1">
                      Referência: {item.fundamentacaoTeorica}
                    </p>
                  )}
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

      {/* MODAL DE COMPARTILHAMENTO EXPLICITO PARA WHATSAPP */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">Convidar no WhatsApp</h3>
                  <p className="text-[11px] text-emerald-400 font-medium">Mensagem explicativa oficial pronta para envio</p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prévia da mensagem no estilo balão do WhatsApp */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Prévia da Mensagem que será Enviada:
              </span>
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-slate-200 font-mono whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto select-all">
                {getFormattedWhatsappMessage()}
              </div>
            </div>

            {/* Ações de Compartilhamento */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleOpenWhatsappDirect}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Abrir Diretamente no WhatsApp 🚀</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyFullMessage}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedFullMessage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFullMessage ? 'Texto Copiado!' : 'Copiar Texto'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>
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
