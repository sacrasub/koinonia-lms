'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Flame,
  HelpCircle,
  Layers,
  Lightbulb,
  Loader2,
  MessageSquare,
  PenTool,
  Printer,
  RefreshCw,
  Search,
  Sparkles,
  User,
  Video,
} from 'lucide-react';
import { buildCornellDeepLinkUrl } from '@/data/geminiAulasCornell';
import { ReadAloudButton } from '@/components/ReadAloudButton';
import { useVoiceStudio } from '@/contexts/VoiceStudioContext';
import {
  LessonAiRefinement,
  LessonDossierData,
  LessonNavSibling,
  LessonTimelineCategory,
  buildLessonDossierUrl,
} from '@/types/lessonDossier';

interface LessonDossierPageProps {
  dossier: LessonDossierData;
  siblings: LessonNavSibling[];
}

const CATEGORY_STYLES: Record<
  LessonTimelineCategory,
  { badge: string; dot: string; label: string }
> = {
  'Ensino Central': {
    badge:
      'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800',
    dot: 'bg-indigo-600 text-white',
    label: 'Ensino Central',
  },
  'Estudo de Caso': {
    badge:
      'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500 text-slate-950',
    label: 'Estudo de Caso',
  },
  'Exegese Bíblica': {
    badge:
      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-600 text-white',
    label: 'Exegese Bíblica',
  },
  'Debate em Turma': {
    badge:
      'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-600 text-white',
    label: 'Debate em Turma',
  },
  'Aplicação Pastoral': {
    badge:
      'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-600 text-white',
    label: 'Aplicação Pastoral',
  },
  'Contexto Histórico': {
    badge:
      'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-800',
    dot: 'bg-sky-600 text-white',
    label: 'Contexto Histórico',
  },
};

export const LessonDossierPage: React.FC<LessonDossierPageProps> = ({
  dossier,
  siblings,
}) => {
  const router = useRouter();
  const { openSettings: openVoiceSettings } = useVoiceStudio();

  const [selectedCategory, setSelectedCategory] = useState<'ALL' | LessonTimelineCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>({});
  const [aiRefinement, setAiRefinement] = useState<LessonAiRefinement | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const aiCacheKey = `lms_ai_lesson_refinement_v1_${dossier.disciplinaId}_${dossier.aulaNum}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const cached = localStorage.getItem(aiCacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as LessonAiRefinement;
        if (parsed && parsed.sinteseDidatica) {
          setAiRefinement(parsed);
        }
      } else {
        setAiRefinement(null);
      }
    } catch {
      setAiRefinement(null);
    }
  }, [aiCacheKey]);

  const sortedSiblings = useMemo(
    () => [...siblings].sort((a, b) => a.aulaNum - b.aulaNum),
    [siblings]
  );

  const currentIdx = sortedSiblings.findIndex((s) => s.aulaNum === dossier.aulaNum);
  const prevSibling = currentIdx > 0 ? sortedSiblings[currentIdx - 1] : null;
  const nextSibling =
    currentIdx >= 0 && currentIdx < sortedSiblings.length - 1
      ? sortedSiblings[currentIdx + 1]
      : null;

  const availableCategories = useMemo(() => {
    const counts = new Map<LessonTimelineCategory, number>();
    for (const m of dossier.linhaDoTempo) {
      counts.set(m.categoria, (counts.get(m.categoria) || 0) + 1);
    }
    return Array.from(counts.entries());
  }, [dossier.linhaDoTempo]);

  const filteredMoments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return dossier.linhaDoTempo.filter((m) => {
      if (selectedCategory !== 'ALL' && m.categoria !== selectedCategory) return false;
      if (!q) return true;
      return (
        m.titulo.toLowerCase().includes(q) ||
        m.detalhamento.toLowerCase().includes(q) ||
        m.referenciasNoBloco.some((r) => r.toLowerCase().includes(q))
      );
    });
  }, [dossier.linhaDoTempo, searchQuery, selectedCategory]);

  const fullLessonSpeechText = useMemo(() => {
    return [
      `Disciplina: ${dossier.disciplinaShortName}. Aula ${dossier.aulaNum}, ${dossier.dateBr}. ${dossier.professor}.`,
      `Tema: ${dossier.theme}.`,
      `Panorama da aula: ${dossier.panorama.resumoCurado}`,
      dossier.panorama.sinteseGeral !== dossier.panorama.resumoCurado
        ? dossier.panorama.sinteseGeral
        : '',
      ...dossier.linhaDoTempo.map(
        (m) => `Momento ${m.ordem}, ${m.categoria}: ${m.titulo}. ${m.detalhamento}`
      ),
    ]
      .filter(Boolean)
      .join('\n\n');
  }, [dossier]);

  const cornellHref = buildCornellDeepLinkUrl(
    dossier.disciplinaId,
    dossier.dateIso,
    dossier.aulaNum
  );
  const av2Href = `/?tab=operacao-av2&disciplina=${encodeURIComponent(dossier.disciplinaId)}`;
  const discHubHref = `/?disciplina=${encodeURIComponent(dossier.disciplinaId)}`;

  const handleGenerateAiRefinement = async (forceNative = false) => {
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const geminiKey =
        typeof window !== 'undefined' ? localStorage.getItem('lms_gemini_api_key') || '' : '';
      const openAiKey =
        typeof window !== 'undefined' ? localStorage.getItem('lms_openai_api_key') || '' : '';
      const openAiModel =
        typeof window !== 'undefined' ? localStorage.getItem('lms_openai_model') || 'gpt-4o-mini' : 'gpt-4o-mini';

      const res = await fetch('/api/ai/lesson-dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dossier,
          provider: forceNative ? 'native' : 'auto',
          gemini_api_key: geminiKey.trim() || undefined,
          openai_api_key: openAiKey.trim() || undefined,
          openai_model: openAiModel,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Falha ao organizar a aula com IA.');
      }
      setAiRefinement(json.data);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(aiCacheKey, JSON.stringify(json.data));
        } catch {}
      }
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Erro ao organizar aula com IA.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#090d16] text-gray-900 dark:text-slate-100 pb-24">
      {/* BARRA SUPERIOR STICKY */}
      <header className="no-print sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={av2Href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Operação AV2</span>
            </Link>

            <Link
              href={discHubHref}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hub: {dossier.disciplinaShortName}</span>
              <span className="sm:hidden">Hub Matéria</span>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Seletor rápido de aula */}
            {sortedSiblings.length > 0 && (
              <select
                aria-label="Selecionar aula da disciplina"
                value={dossier.aulaNum}
                onChange={(e) =>
                  router.push(buildLessonDossierUrl(dossier.disciplinaId, Number(e.target.value)))
                }
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 max-w-[210px] cursor-pointer"
              >
                {sortedSiblings.map((s) => (
                  <option key={s.aulaNum} value={s.aulaNum}>
                    Aula {s.aulaNum} ({s.dateBr}) • {s.totalBlocos} tópicos
                  </option>
                ))}
              </select>
            )}

            <ReadAloudButton
              variant="pill"
              size="xs"
              label="Ouvir Aula"
              sourceId={`lesson-full-${dossier.id}`}
              title={`Aula ${dossier.aulaNum}: ${dossier.theme}`}
              text={fullLessonSpeechText}
            />

            <button
              type="button"
              onClick={openVoiceSettings}
              title="Ajustar configurações de voz (VoiceStudio)"
              className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 cursor-pointer"
            >
              <AudioLines className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              title="Imprimir ou Salvar em PDF"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">PDF</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-5 space-y-6">
        {/* HERO CARD DA AULA */}
        <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-indigo-800/40 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-indigo-500/30 border border-indigo-400/40 text-indigo-100 text-xs font-black uppercase tracking-wider">
                Aula {dossier.aulaNum} • Unidade {dossier.unidade}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/10 text-slate-200 text-xs font-bold inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>{dossier.dateBr}</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/10 text-slate-200 text-xs font-bold inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-300" />
                <span>{dossier.professor}</span>
              </span>
              {dossier.panorama.duracaoEstimada && (
                <span className="px-2.5 py-1 rounded-xl bg-white/10 text-slate-200 text-xs font-bold inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{dossier.panorama.duracaoEstimada}</span>
                </span>
              )}
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold">
                {dossier.panorama.totalBlocos} momentos detalhados
              </span>
            </div>

            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wide">
              {dossier.disciplinaShortName} ({dossier.disciplinaCode})
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight text-white">
            {dossier.theme}
          </h1>

          {/* BARRA DE AÇÕES DO HERO */}
          <div className="no-print flex flex-wrap items-center gap-2 pt-1">
            <ReadAloudButton
              variant="dark"
              size="sm"
              label="Ouvir Aula Completa"
              sourceId={`lesson-hero-${dossier.id}`}
              title={`Aula ${dossier.aulaNum}: ${dossier.theme}`}
              text={fullLessonSpeechText}
            />

            <button
              type="button"
              onClick={() => void handleGenerateAiRefinement(false)}
              disabled={isGeneratingAi}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 font-black text-xs shadow-md transition cursor-pointer active:scale-95"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Organizando com IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {aiRefinement ? 'Atualizar Organização IA' : 'Aprofundar & Organizar com IA'}
                  </span>
                </>
              )}
            </button>

            <a
              href={cornellHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/25 hover:bg-purple-500/40 text-purple-100 border border-purple-400/40 text-xs font-bold transition"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Abrir no Caderno Cornell (Gemini)</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>

            {dossier.geminiUrl && (
              <a
                href={dossier.geminiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition"
              >
                <FileText className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {dossier.geminiUrl.endsWith('.pdf') ? 'PDF Original' : 'Transcrição Google Docs'}
                </span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            )}

            {dossier.videoUrl && (
              <a
                href={dossier.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-100 border border-emerald-400/40 text-xs font-bold transition"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Videoaula (Drive)</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            )}
          </div>

          {aiError && (
            <p className="text-xs text-rose-200 bg-rose-950/60 border border-rose-500/40 px-3 py-2 rounded-xl">
              {aiError}
            </p>
          )}
        </section>

        {/* PAINEL DE APROFUNDAMENTO POR IA (SOB DEMANDA / CACHE LOCAL) */}
        {aiRefinement && (
          <section className="bg-gradient-to-br from-amber-50 via-white to-indigo-50/40 dark:from-amber-950/25 dark:via-slate-900 dark:to-indigo-950/20 rounded-3xl p-5 sm:p-6 border border-amber-300/80 dark:border-amber-800/60 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 dark:border-amber-800/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
                    Síntese Didática Organizada por IA
                  </h2>
                  <p className="text-[11px] text-amber-900/75 dark:text-amber-200/80 font-medium">
                    Motor: {aiRefinement.usedModel} ({aiRefinement.usedProvider})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ReadAloudButton
                  variant="pill"
                  size="xs"
                  label="Ouvir Síntese IA"
                  sourceId={`lesson-ai-${dossier.id}`}
                  title={`Síntese IA: ${dossier.theme}`}
                  text={[
                    aiRefinement.sinteseDidatica,
                    'Fio condutor da aula:',
                    ...aiRefinement.fioCondutor,
                    aiRefinement.aplicacaoMinisterial,
                  ].join('\n\n')}
                />
                <button
                  type="button"
                  onClick={() => void handleGenerateAiRefinement(false)}
                  disabled={isGeneratingAi}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  <span>Regenerar</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-gray-800 dark:text-slate-100 leading-relaxed whitespace-pre-line font-medium">
                {aiRefinement.sinteseDidatica}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-indigo-200/80 dark:border-indigo-900/50 space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Fio Condutor da Aula</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-gray-700 dark:text-slate-300">
                    {aiRefinement.fioCondutor.map((step, i) => (
                      <li key={i} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-emerald-200/80 dark:border-emerald-900/50 space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Glossário & Conceitos-Chave</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    {aiRefinement.glossarioConceitos.map((g, i) => (
                      <div key={i}>
                        <strong className="text-gray-900 dark:text-white">{g.termo}:</strong>{' '}
                        <span className="text-gray-700 dark:text-slate-300">{g.definicao}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    <span>O que observar para a Prova</span>
                  </h3>
                  <ul className="space-y-1 text-xs text-amber-950 dark:text-amber-100 list-disc pl-4">
                    {aiRefinement.dicasDeProva.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 space-y-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Aplicação Ministerial</span>
                  </h3>
                  <p className="text-xs text-indigo-950 dark:text-indigo-100 leading-relaxed">
                    {aiRefinement.aplicacaoMinisterial}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* BLOCO 1: PANORAMA & MAPA RÁPIDO DA AULA */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-gray-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>1. Panorama — O que aconteceu nesta aula</span>
            </h2>
            <ReadAloudButton
              variant="pill"
              size="xs"
              label="Ouvir Panorama"
              sourceId={`lesson-panorama-${dossier.id}`}
              title={`Panorama da Aula ${dossier.aulaNum}`}
              text={`${dossier.panorama.resumoCurado}\n\n${dossier.panorama.sinteseGeral}`}
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 leading-relaxed">
              {dossier.panorama.resumoCurado}
            </p>
            {dossier.panorama.sinteseGeral &&
              dossier.panorama.sinteseGeral !== dossier.panorama.resumoCurado && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 text-xs sm:text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                  <strong className="text-indigo-700 dark:text-indigo-300">Síntese Gemini do Encontro: </strong>
                  {dossier.panorama.sinteseGeral}
                </div>
              )}
          </div>

          {dossier.panorama.mapaRapido.length > 0 && (
            <div className="pt-2 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Mapa Rápido da Aula (Em 60 segundos)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {dossier.panorama.mapaRapido.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/25 border border-indigo-100 dark:border-indigo-900/50 text-xs text-gray-700 dark:text-slate-200 leading-relaxed flex items-start gap-2"
                  >
                    <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* BLOCO 2: LINHA DO TEMPO DETALHADA DA AULA (MOMENTO A MOMENTO) */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-gray-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>2. Linha do Tempo Detalhada da Aula (Momento a Momento)</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Desenvolvimento completo de cada tema, exemplo e discussão conduzida na aula.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-full">
              Exibindo {filteredMoments.length} de {dossier.linhaDoTempo.length} momentos
            </span>
          </div>

          {/* Filtros e Busca */}
          <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                Todos ({dossier.linhaDoTempo.length})
              </button>
              {availableCategories.map(([cat, count]) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  {cat} ({count})
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar palavra ou versículo..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Timeline vertical */}
          {filteredMoments.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-gray-500 dark:text-slate-400">
              Nenhum momento encontrado para este filtro. Limpe a busca para visualizar toda a aula.
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 border-l-2 border-indigo-200 dark:border-indigo-900/70 space-y-5 ml-2">
              {filteredMoments.map((m) => {
                const style = CATEGORY_STYLES[m.categoria] || CATEGORY_STYLES['Ensino Central'];
                return (
                  <article
                    key={m.ordem}
                    className="relative p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/80 space-y-3"
                  >
                    {/* Marcador numerado na linha do tempo */}
                    <span
                      className={`absolute -left-[35px] sm:-left-[43px] top-4 w-7 h-7 rounded-full font-black text-[11px] flex items-center justify-center shadow-sm ring-4 ring-white dark:ring-slate-900 ${style.dot}`}
                    >
                      {String(m.ordem).padStart(2, '0')}
                    </span>

                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${style.badge}`}
                          >
                            {style.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {m.fase}
                          </span>
                          {m.timestamp && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                              ⏱ {m.timestamp}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-snug">
                          {m.titulo}
                        </h3>
                      </div>

                      <ReadAloudButton
                        variant="pill"
                        size="xs"
                        label="Ouvir"
                        sourceId={`moment-${dossier.id}-${m.ordem}`}
                        title={`Momento ${m.ordem}: ${m.titulo}`}
                        text={`${m.titulo}. ${m.detalhamento}`}
                      />
                    </div>

                    <p className="text-xs sm:text-sm text-gray-800 dark:text-slate-200 leading-relaxed">
                      {m.detalhamento}
                    </p>

                    {m.pontosChave.length > 1 && (
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
                          Pontos-Chave para Fixar
                        </span>
                        <ul className="space-y-1 text-xs text-gray-700 dark:text-slate-300 list-disc pl-4">
                          {m.pontosChave.map((pk, pIdx) => (
                            <li key={pIdx} className="leading-relaxed">
                              {pk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {m.referenciasNoBloco.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {m.referenciasNoBloco.map((ref, rIdx) => (
                          <span
                            key={rIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-800 dark:text-amber-300"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>{ref}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* BLOCO 3: CASOS PRÁTICOS & DEBATES EM TURMA */}
        {dossier.casosEDebates.length > 0 && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-amber-200/80 dark:border-amber-900/50 shadow-xs space-y-4">
            <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>3. Estudos de Caso, Testemunhos & Debates da Turma</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {dossier.casosEDebates.map((c, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200 leading-snug">
                      {c.titulo}
                    </h3>
                    {c.timestamp && (
                      <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 shrink-0">
                        ⏱ {c.timestamp}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
                    {c.relato}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BLOCO 4: BASE BÍBLICA DA AULA COM CONTEXTO */}
        {dossier.referenciasBiblicas.length > 0 && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs space-y-4">
            <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>4. Base Bíblica Citada na Aula & Contexto</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dossier.referenciasBiblicas.map((ref, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 space-y-1"
                >
                  <span className="inline-block px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-black text-xs">
                    {ref.referencia}
                  </span>
                  <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
                    {ref.contexto}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BLOCO 5: CONEXÃO COM A PROVA + AUTO-TESTE (ACTIVE RECALL) */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-gray-200/80 dark:border-slate-800 shadow-xs space-y-5">
          {dossier.pontosDeProva.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>5. Pontos de Maior Incidência na Prova (AV2)</span>
                </h2>
                <Link
                  href={av2Href}
                  className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Praticar no Simulado da Disciplina</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {dossier.pontosDeProva.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 space-y-1"
                  >
                    <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                      {p.titulo}
                    </h3>
                    <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
                      {p.detalhe}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dossier.perguntasRevisao.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Auto-Teste Rápido (Active Recall)</span>
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    const allOpen = dossier.perguntasRevisao.every((_, i) => revealedQuestions[i]);
                    const next: Record<number, boolean> = {};
                    dossier.perguntasRevisao.forEach((_, i) => {
                      next[i] = !allOpen;
                    });
                    setRevealedQuestions(next);
                  }}
                  className="no-print text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline cursor-pointer"
                >
                  {dossier.perguntasRevisao.every((_, i) => revealedQuestions[i])
                    ? 'Ocultar todas'
                    : 'Revelar todas'}
                </button>
              </div>

              <div className="space-y-2.5">
                {dossier.perguntasRevisao.map((q, idx) => {
                  const isOpen = Boolean(revealedQuestions[idx]);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-snug">
                          {idx + 1}. {q.pergunta}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setRevealedQuestions((prev) => ({ ...prev, [idx]: !prev[idx] }))
                          }
                          className="no-print inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/60 dark:hover:bg-purple-900/70 text-purple-900 dark:text-purple-200 text-[11px] font-bold shrink-0 cursor-pointer"
                        >
                          {isOpen ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{isOpen ? 'Ocultar' : 'Ver Síntese'}</span>
                        </button>
                      </div>
                      {isOpen && (
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/50 text-xs text-gray-700 dark:text-slate-300 leading-relaxed animate-in fade-in duration-150">
                          {q.dicaResposta}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {dossier.encaminhamentos.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Encaminhamentos de Estudo & Leituras</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-gray-700 dark:text-slate-300 list-disc pl-5">
                {dossier.encaminhamentos.map((e, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* RODAPÉ DE NAVEGAÇÃO ENTRE AULAS */}
        {(prevSibling || nextSibling) && (
          <nav
            aria-label="Navegação entre aulas"
            className="no-print grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {prevSibling ? (
              <Link
                href={buildLessonDossierUrl(dossier.disciplinaId, prevSibling.aulaNum)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition flex items-center gap-3 group shadow-2xs"
              >
                <ArrowLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
                    Aula Anterior • {prevSibling.dateBr}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate block">
                    {prevSibling.theme}
                  </span>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextSibling && (
              <Link
                href={buildLessonDossierUrl(dossier.disciplinaId, nextSibling.aulaNum)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition flex items-center justify-end gap-3 text-right group shadow-2xs"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
                    Próxima Aula • {nextSibling.dateBr}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate block">
                    {nextSibling.theme}
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </nav>
        )}
      </main>
    </div>
  );
};
