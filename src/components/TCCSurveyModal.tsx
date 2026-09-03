'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, Sparkles, CheckCircle2, X, Send, 
  ChevronRight, ChevronLeft, Award, HelpCircle, MessageSquare,
  Info, Lightbulb
} from 'lucide-react';
import { UserRole, TCCPesquisa } from '@/types';
import { 
  getActiveSurveyForRole, 
  submitSurveyAnswers, 
  TCC_GLOSSARY, 
  TCCGlossaryEntry,
  cleanQuestionText 
} from '@/services/tccResearchService';

interface TCCSurveyModalProps {
  currentRole: UserRole;
  userEmail: string;
}

// Níveis de escala Likert verticais (5 no TOPO, 1 na BASE)
const LIKERT_LEVELS = [
  { 
    val: 5, 
    label: '5 — Concordo Totalmente', 
    desc: 'Total concordância com o impacto positivo na aprendizagem', 
    color: 'hover:border-emerald-500 hover:text-emerald-300', 
    active: 'bg-emerald-600/30 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/60 shadow-emerald-950/50' 
  },
  { 
    val: 4, 
    label: '4 — Concordo Parcialmente', 
    desc: 'Concordância na maior parte das situações práticas', 
    color: 'hover:border-blue-500 hover:text-blue-300', 
    active: 'bg-blue-600/30 border-blue-500 text-blue-200 ring-2 ring-blue-500/60 shadow-blue-950/50' 
  },
  { 
    val: 3, 
    label: '3 — Neutro / Indiferente', 
    desc: 'Não percebi impacto relevante ou tenho posição neutra', 
    color: 'hover:border-slate-500 hover:text-slate-200', 
    active: 'bg-slate-700/60 border-slate-400 text-slate-100 ring-2 ring-slate-400/60 shadow-slate-950/50' 
  },
  { 
    val: 2, 
    label: '2 — Discordo Parcialmente', 
    desc: 'Pouco perceptível ou necessita de ajustes pedagógicos', 
    color: 'hover:border-amber-500 hover:text-amber-300', 
    active: 'bg-amber-600/30 border-amber-500 text-amber-200 ring-2 ring-amber-500/60 shadow-amber-950/50' 
  },
  { 
    val: 1, 
    label: '1 — Discordo Totalmente', 
    desc: 'Nenhum impacto ou discordância plena em relação ao item', 
    color: 'hover:border-red-500 hover:text-red-300', 
    active: 'bg-red-600/30 border-red-500 text-red-200 ring-2 ring-red-500/60 shadow-red-950/50' 
  },
];

// Componente para renderizar o texto da pergunta destacando termos não usuais com Tooltips
const QuestionTextWithGlossary: React.FC<{ text: string }> = ({ text }) => {
  const [activeTooltip, setActiveTooltip] = useState<{ term: string; entry: TCCGlossaryEntry } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const cleanedText = cleanQuestionText(text);

  // Lista de termos ordenada por tamanho decrescente para não quebrar compostos
  const glossaryKeys = Object.keys(TCC_GLOSSARY).sort((a, b) => b.length - a.length);

  // Expressão regular com todos os termos do glossário
  const regex = new RegExp(`(${glossaryKeys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');

  const parts = cleanedText.split(regex);

  // Fecha o tooltip ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveTooltip(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <h4 className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed">
        {parts.map((part, index) => {
          const lower = part.toLowerCase();
          const matchEntry = TCC_GLOSSARY[lower];

          if (matchEntry) {
            const isOpened = activeTooltip?.entry.term === matchEntry.term;
            return (
              <span key={index} className="inline-block relative">
                <button
                  type="button"
                  onClick={() => setActiveTooltip(isOpened ? null : { term: part, entry: matchEntry })}
                  onMouseEnter={() => setActiveTooltip({ term: part, entry: matchEntry })}
                  className="text-violet-300 font-extrabold underline decoration-dotted decoration-violet-400 underline-offset-4 hover:bg-violet-950/80 hover:text-violet-200 px-1 py-0.5 rounded cursor-pointer transition-colors inline-flex items-center gap-1"
                  title="Clique ou passe o mouse para ver a explicação acadêmica deste termo"
                >
                  <span>{part}</span>
                  <Lightbulb className="w-3 h-3 text-amber-400 inline" />
                </button>
              </span>
            );
          }

          return <span key={index}>{part}</span>;
        })}
      </h4>

      {/* Popover flutuante explicativo do termo */}
      {activeTooltip && (
        <div 
          onMouseLeave={() => setActiveTooltip(null)}
          className="mt-2.5 p-3.5 bg-slate-900 text-slate-100 rounded-2xl border border-violet-500/50 shadow-2xl shadow-violet-950/80 text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-200 z-30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-black text-violet-300 text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Conceito Teórico: {activeTooltip.entry.term}</span>
            </div>
            <button
              onClick={() => setActiveTooltip(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
            {activeTooltip.entry.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export const TCCSurveyModal: React.FC<TCCSurveyModalProps> = ({ currentRole, userEmail }) => {
  const [activeSurvey, setActiveSurvey] = useState<TCCPesquisa | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Armazena as respostas do usuário { [perguntaId]: { escala?: number, texto?: string } }
  const [answers, setAnswers] = useState<Record<string, { escala?: number; texto?: string }>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const normalizedEmail = (userEmail || '').toLowerCase().trim();

  useEffect(() => {
    if (!normalizedEmail) return;

    try {
      const isDismissedLocal = localStorage.getItem(`lms_tcc_dismissed_${normalizedEmail}`) === 'true';
      const isOptOut = localStorage.getItem('lms_tcc_survey_optout') === 'true';
      const isDismissedSession = sessionStorage.getItem(`lms_tcc_dismissed_${normalizedEmail}`) === 'true';
      if (isDismissedLocal || isOptOut || isDismissedSession) {
        return;
      }
    } catch (_) {}

    async function checkSurvey() {
      try {
        const res = await getActiveSurveyForRole(currentRole, normalizedEmail);
        if (res.survey && res.survey.ativa === true && !res.alreadyAnswered) {
          setActiveSurvey(res.survey);
          setTimeout(() => setIsBannerVisible(true), 2500);
        } else {
          setActiveSurvey(null);
          setIsBannerVisible(false);
        }
      } catch (e) {
        console.warn('Erro ao verificar pesquisa TCC:', e);
      }
    }

    checkSurvey();

    const handleStatusChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.ativa) {
        setActiveSurvey(null);
        setIsBannerVisible(false);
        setIsOpen(false);
      }
    };
    window.addEventListener('lms_tcc_survey_status_changed', handleStatusChange);
    return () => window.removeEventListener('lms_tcc_survey_status_changed', handleStatusChange);
  }, [currentRole, normalizedEmail]);

  if (!activeSurvey || !activeSurvey.ativa || (!isBannerVisible && !isOpen)) return null;

  const perguntas = activeSurvey.perguntas || [];
  const currentQuestion = perguntas[currentStepIndex];
  const totalQuestions = perguntas.length;

  const handleSelectLikert = (perguntaId: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [perguntaId]: { ...prev[perguntaId], escala: value }
    }));

    // Auto-avanço para a próxima pergunta após breve confirmação visual (260ms)
    if (currentStepIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentStepIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
      }, 260);
    }
  };

  const handleTextChange = (perguntaId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [perguntaId]: { ...prev[perguntaId], texto: text }
    }));
  };

  const handleDismissBanner = () => {
    setIsBannerVisible(false);
    setIsOpen(false);
    try {
      localStorage.setItem(`lms_tcc_dismissed_${normalizedEmail}`, 'true');
      localStorage.setItem('lms_tcc_survey_optout', 'true');
      sessionStorage.setItem(`lms_tcc_dismissed_${normalizedEmail}`, 'true');
    } catch (_) {}
  };

  const handleSubmit = async () => {
    if (!activeSurvey) return;

    setSubmitting(true);
    try {
      const payloadAnswers = Object.entries(answers).map(([perguntaId, data]) => ({
        pergunta_id: perguntaId,
        resposta_escala: data.escala,
        resposta_texto: data.texto,
      }));

      await submitSurveyAnswers({
        pesquisa_id: activeSurvey.id,
        usuario_email: userEmail,
        usuario_role: currentRole,
        respostas: payloadAnswers,
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsBannerVisible(false);
      }, 3000);
    } catch (e) {
      console.error('Erro ao enviar respostas do TCC:', e);
      alert('Ocorreu um erro ao registrar as respostas. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const isCurrentQuestionAnswered = () => {
    if (!currentQuestion) return false;
    if (!currentQuestion.obrigatoria) return true;
    const ans = answers[currentQuestion.id];
    if (currentQuestion.tipo === 'LIKERT_5') {
      return typeof ans?.escala === 'number';
    }
    if (currentQuestion.tipo === 'DISCURSIVA') {
      return Boolean(ans?.texto && ans.texto.trim().length > 0);
    }
    return true;
  };

  return (
    <>
      {/* 1. BANNER FLUTUANTE DISCRETO DE CONVITE */}
      {isBannerVisible && !isOpen && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-950 text-white p-4 rounded-2xl border border-violet-500/40 shadow-2xl shadow-violet-950/50 animate-in fade-in slide-in-from-bottom duration-500">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl text-white shadow-md">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-violet-400 tracking-wider block">Avaliação Pedagógica UIECB</span>
                <h4 className="text-xs font-bold text-slate-100">Sua Opinião Acadêmica Importa!</h4>
              </div>
            </div>
            <button
              onClick={handleDismissBanner}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-900 cursor-pointer"
              title="Lembrar mais tarde"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
            Ajude a coordenação a avaliar o impacto do <strong>LMS, RPG Pastoral e Caderno Cornell</strong> respondendo a um questionário rápido de 2 minutos.
          </p>

          <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-800">
            <button
              onClick={handleDismissBanner}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
              title="Não exibir novamente este questionário"
            >
              Depois / Não exibir mais
            </button>
            <button
              onClick={() => {
                setIsBannerVisible(false);
                setIsOpen(true);
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer"
            >
              Responder Agora →
            </button>
          </div>
        </div>
      )}

      {/* 2. MODAL INTERATIVO COMPLETO DE PESQUISA */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 text-white w-full max-w-xl p-5 sm:p-7 rounded-3xl border border-slate-800 shadow-2xl space-y-5 text-left my-8 relative animate-in zoom-in-95 duration-300">
            
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl text-white">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-violet-400 tracking-wider block">
                    Pesquisa Pedagógica do Seminário UIECB
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-white">{activeSurvey.titulo}</h3>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-900 cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tela de Sucesso */}
            {isSubmitted ? (
              <div className="py-12 text-center space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-3xl">
                  ✓
                </div>
                <h4 className="text-lg font-black text-white">Obrigado pela sua Contribuição!</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Suas respostas foram registradas com sucesso e fundamentarão empiricamente as análises sobre metodologias ativas e redução da distância transacional no Seminário Teológico.
                </p>
              </div>
            ) : (
              <>
                {/* Barra de Progresso */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>Questão {currentStepIndex + 1} de {totalQuestions}</span>
                    <span>{Math.round(((currentStepIndex + 1) / totalQuestions) * 100)}% concluído</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-300"
                      style={{ width: `${((currentStepIndex + 1) / totalQuestions) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Pergunta Atual */}
                {currentQuestion && (
                  <div className="space-y-4 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          {currentQuestion.pilar_tcc.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          💡 Dica: termos destacados possuem explicação
                        </span>
                      </div>

                      {/* Texto da Pergunta com Glossário Interativo */}
                      <QuestionTextWithGlossary text={currentQuestion.texto_pergunta} />
                    </div>

                    {/* Opções Likert VERTICAIS (5 no TOPO, 1 na BASE com auto-avanço) */}
                    {currentQuestion.tipo === 'LIKERT_5' && (
                      <div className="space-y-2 pt-1">
                        <div className="flex flex-col gap-2">
                          {LIKERT_LEVELS.map((item) => {
                            const isSelected = answers[currentQuestion.id]?.escala === item.val;
                            return (
                              <button
                                key={item.val}
                                type="button"
                                onClick={() => handleSelectLikert(currentQuestion.id, item.val)}
                                className={`w-full p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                                  isSelected
                                    ? `${item.active} shadow-lg scale-[1.01]`
                                    : `bg-slate-900/90 border-slate-800 text-slate-300 ${item.color}`
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black shrink-0 transition-transform group-hover:scale-110 ${
                                    isSelected 
                                      ? 'bg-white/20 text-white' 
                                      : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                                  }`}>
                                    {item.val}
                                  </span>
                                  <div>
                                    <span className="text-xs sm:text-sm font-bold block">{item.label}</span>
                                    <span className="text-[10px] text-slate-400 block leading-tight">{item.desc}</span>
                                  </div>
                                </div>
                                {isSelected ? (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white/20 text-white shrink-0">
                                    ✓ Selecionado
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition shrink-0 hidden sm:inline">
                                    Avançar →
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Campo de Texto para Pergunta Discursiva */}
                    {currentQuestion.tipo === 'DISCURSIVA' && (
                      <textarea
                        rows={3}
                        value={answers[currentQuestion.id]?.texto || ''}
                        onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
                        placeholder="Escreva livremente sua opinião, sugestão ou reflexão acadêmica..."
                        className="w-full bg-slate-950 text-white text-xs font-medium p-3 rounded-xl border border-slate-700 focus:outline-hidden focus:border-violet-500"
                      />
                    )}
                  </div>
                )}

                {/* Botões de Navegação Entre Perguntas */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    disabled={currentStepIndex === 0}
                    onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Anterior</span>
                  </button>

                  {currentStepIndex < totalQuestions - 1 ? (
                    <button
                      type="button"
                      disabled={!isCurrentQuestionAnswered()}
                      onClick={() => setCurrentStepIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                      className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-30 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Próxima</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={submitting || !isCurrentQuestionAnswered()}
                      onClick={handleSubmit}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-950/50 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Enviando...' : 'Finalizar e Enviar Respostas'}</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
