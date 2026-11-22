'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  FileText,
  Network,
  HelpCircle,
  RotateCcw,
  Share2,
  ArrowRight,
  FolderOpen,
  PenTool,
  Award,
  CheckSquare,
  Video,
  Mail,
} from 'lucide-react';
import {
  DOSSIE_AV2_2026_2,
  OFFICIAL_NOTEBOOKLM_URL,
  DiaAv2Filtro,
  DossieAv2Disciplina,
  LinkBaseAv2,
} from '@/data/dossieAv2_2026_2';

const LINK_BASE_STYLES: Record<
  LinkBaseAv2['tipo'],
  { Icon: React.ComponentType<{ className?: string }>; baseClass: string; destaqueClass: string }
> = {
  texto: {
    Icon: BookOpen,
    baseClass:
      'bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-700/70 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600',
    destaqueClass:
      'bg-sky-100 hover:bg-sky-200 dark:bg-sky-900/60 dark:hover:bg-sky-900 text-sky-900 dark:text-sky-100 border-sky-300 dark:border-sky-700',
  },
  pdf: {
    Icon: FileText,
    baseClass:
      'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/70 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800',
    destaqueClass:
      'bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/60 dark:hover:bg-rose-900 text-rose-900 dark:text-rose-100 border-rose-300 dark:border-rose-700',
  },
  meet: {
    Icon: Video,
    baseClass:
      'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
    destaqueClass:
      'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700',
  },
  drive: {
    Icon: FolderOpen,
    baseClass:
      'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/70 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    destaqueClass:
      'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/60 dark:hover:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-700',
  },
  email: {
    Icon: Mail,
    baseClass:
      'bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/60 dark:hover:bg-violet-900/70 text-violet-800 dark:text-violet-200 border-violet-200 dark:border-violet-800',
    destaqueClass:
      'bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/60 dark:hover:bg-violet-900 text-violet-900 dark:text-violet-100 border-violet-300 dark:border-violet-700',
  },
};

interface OperacaoAv2PageProps {
  userEmail?: string;
  onTabChange?: (tab: string) => void;
}

type InnerSubTab = 'regras' | 'guia' | 'mapa' | 'simulado';

const DIA_FILTERS: { id: DiaAv2Filtro; label: string; count: number }[] = [
  { id: 'all', label: 'Todas', count: DOSSIE_AV2_2026_2.length },
  { id: 'ter-24', label: 'Ter 24/11', count: DOSSIE_AV2_2026_2.filter((d) => d.diaGrupo === 'ter-24').length },
  { id: 'qua-25', label: 'Qua 25/11', count: DOSSIE_AV2_2026_2.filter((d) => d.diaGrupo === 'qua-25').length },
  { id: 'qui-26', label: 'Qui 26/11', count: DOSSIE_AV2_2026_2.filter((d) => d.diaGrupo === 'qui-26').length },
  { id: 'sex-27', label: 'Sex 27/11', count: DOSSIE_AV2_2026_2.filter((d) => d.diaGrupo === 'sex-27').length },
  { id: 'sab-28', label: 'Sáb 28/11', count: DOSSIE_AV2_2026_2.filter((d) => d.diaGrupo === 'sab-28').length },
  { id: 'tcc-04', label: 'TCC 04/12', count: DOSSIE_AV2_2026_2.filter((d) => d.diaGrupo === 'tcc-04').length },
];

export const OperacaoAv2Page: React.FC<OperacaoAv2PageProps> = ({ userEmail, onTabChange }) => {
  const normalizedEmail = (userEmail || 'aluno_padrao').toLowerCase().trim();
  const storageKey = `lms_av2_simulado_v1_${normalizedEmail}`;

  const [selectedDia, setSelectedDia] = useState<DiaAv2Filtro>('all');
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<string>(DOSSIE_AV2_2026_2[0].disciplinaId);
  const [innerTab, setInnerTab] = useState<InnerSubTab>('regras');
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [copiedMap, setCopiedMap] = useState<boolean>(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState<boolean>(false);

  // Carrega progresso do simulado localmente (Zero Egress no Supabase)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setAnswers(parsed);
        }
      }
    } catch (_) {}
  }, [storageKey]);

  // Pre-seleção direta de disciplina vinda da Home do Aluno ou deep link interno
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyPendingDisc = (targetId?: string | null, targetSubTab?: string | null) => {
      if (!targetId) return;
      const exists = DOSSIE_AV2_2026_2.some((d) => d.disciplinaId === targetId);
      if (exists) {
        setSelectedDia('all');
        setSelectedDisciplinaId(targetId);
        const validSubTab =
          targetSubTab && ['regras', 'guia', 'mapa', 'simulado'].includes(targetSubTab)
            ? (targetSubTab as InnerSubTab)
            : 'regras';
        setInnerTab(validSubTab);
        try {
          localStorage.removeItem('lms_pending_av2_disciplina');
          localStorage.removeItem('lms_pending_av2_subtab');
        } catch (_) {}
      }
    };

    try {
      const urlParams = new URLSearchParams(window.location.search);
      applyPendingDisc(
        urlParams.get('disciplina') || localStorage.getItem('lms_pending_av2_disciplina'),
        urlParams.get('subtab') || localStorage.getItem('lms_pending_av2_subtab')
      );
    } catch (_) {}

    const onOpenDisc = (e: Event) => {
      const detail = (e as CustomEvent<{ disciplinaId?: string; subTab?: string } | string>).detail;
      const id = typeof detail === 'string' ? detail : detail?.disciplinaId;
      const subTab = typeof detail === 'object' ? detail?.subTab : undefined;
      applyPendingDisc(id, subTab);
    };

    window.addEventListener('lms_open_av2_disciplina', onOpenDisc);
    return () => window.removeEventListener('lms_open_av2_disciplina', onOpenDisc);
  }, []);

  const persistAnswers = (next: Record<string, 'A' | 'B' | 'C' | 'D'>) => {
    setAnswers(next);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch (_) {}
    }
  };

  const filteredDisciplinas = useMemo(() => {
    if (selectedDia === 'all') return DOSSIE_AV2_2026_2;
    return DOSSIE_AV2_2026_2.filter((d) => d.diaGrupo === selectedDia);
  }, [selectedDia]);

  // Garante que a disciplina ativa pertence ao filtro selecionado
  useEffect(() => {
    if (filteredDisciplinas.length > 0 && !filteredDisciplinas.some((d) => d.disciplinaId === selectedDisciplinaId)) {
      setSelectedDisciplinaId(filteredDisciplinas[0].disciplinaId);
    }
  }, [filteredDisciplinas, selectedDisciplinaId]);

  const activeDisc: DossieAv2Disciplina = useMemo(() => {
    return DOSSIE_AV2_2026_2.find((d) => d.disciplinaId === selectedDisciplinaId) || DOSSIE_AV2_2026_2[0];
  }, [selectedDisciplinaId]);

  // Estatísticas globais dos simulados
  const globalStats = useMemo(() => {
    let total = 0;
    let answered = 0;
    let correct = 0;
    DOSSIE_AV2_2026_2.forEach((d) => {
      d.simulado.forEach((q) => {
        total++;
        const ans = answers[q.id];
        if (ans) {
          answered++;
          if (ans === q.gabarito) correct++;
        }
      });
    });
    return { total, answered, correct };
  }, [answers]);

  // Estatísticas por disciplina
  const getDiscSimStats = (disc: DossieAv2Disciplina) => {
    let answered = 0;
    let correct = 0;
    disc.simulado.forEach((q) => {
      const ans = answers[q.id];
      if (ans) {
        answered++;
        if (ans === q.gabarito) correct++;
      }
    });
    return { total: disc.simulado.length, answered, correct };
  };

  const activeDiscStats = getDiscSimStats(activeDisc);

  const handleSelectOption = (questionId: string, letra: 'A' | 'B' | 'C' | 'D') => {
    const next = { ...answers, [questionId]: letra };
    persistAnswers(next);
  };

  const handleResetDisciplinaSimulado = () => {
    const next = { ...answers };
    activeDisc.simulado.forEach((q) => {
      delete next[q.id];
    });
    persistAnswers(next);
  };

  const handleCopyMindmap = () => {
    const text = activeDisc.mapaMental;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedMap(true);
        setTimeout(() => setCopiedMap(false), 2500);
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedMap(true);
      setTimeout(() => setCopiedMap(false), 2500);
    }
  };

  const buildWhatsappSummary = () => {
    return (
      `🔥 *OPERAÇÃO SEMANA DA AV2 & TCC I (2026.2) — KOINONIA LMS*\n\n` +
      `Turma A (7º Período), o guia completo com regras oficiais, aulas da Unidade 2, mapas mentais e simulados comentados (${globalStats.total} questões) já está no ar!\n\n` +
      `📅 *CALENDÁRIO CONFIRMADO (Horário de Brasília):*\n` +
      `• *Ter 24/11 (19h):* Hist. Congregacionalismo (10 V/F: 2 autodecl. + 8 conteúdo, sem consulta)\n` +
      `• *Ter 24/11 (20h35):* Pensamento Cristão II (10 questões Forms, sem consulta)\n` +
      `• *Qua 25/11 (19h):* Aconselhamento Bíblico II (Forms, restrito aos slides, sem trabalho)\n` +
      `• *Qua 25/11 (19h–23h59):* Direitos Humanos (⚠️ *Trabalho cancelado!* 10 questões peso 10 integral, 52 slides pós-AV1)\n` +
      `• *Qui 26/11 (19h):* Ética Cristã (⚠️ *Sem prova escrita* — encerramento e notas dos Seminários)\n` +
      `• *Qui 26/11 (20h35):* NT III — Epístolas Gerais (10 questões Forms, sem consulta)\n` +
      `• *Sex 27/11 (19h):* Plantação II (Prova com *consulta livre* + Resumo 12 pág para thacyto@gmail.com até 23h59)\n` +
      `• *Sáb 28/11 (até 23h59):* Cultura Afro & Indígena (AFR-101) — ⚠️ *Sem prova escrita!* Assistir às 4 videoaulas + Trabalho Final Aplicado (exatamente 2 laudas, 3 partes, Bíblia + 2 autores) para prof.alexsandro@gmail.com\n` +
      `• *Sex 04/12 (até 23h59):* TCC I (Artigo 20–25 págs ABNT, PDF e Word, sem IA)\n\n` +
      `🚀 *Acesse a Central AV2 (Guias, Mapas & Simulados):*\n` +
      `https://koinonialms.vercel.app/?tab=av2\n\n` +
      `📓 *NotebookLM Oficial (Transcrições + Materiais):*\n` +
      `${OFFICIAL_NOTEBOOKLM_URL}`
    );
  };

  const handleShareWhatsapp = () => {
    const text = buildWhatsappSummary();
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => {});
      setCopiedWhatsapp(true);
      setTimeout(() => setCopiedWhatsapp(false), 3000);
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const navigateTo = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lms_change_tab', { detail: tabId }));
    }
  };

  const handleOpenDisciplinaHub = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lms_open_disciplina_detail', { detail: activeDisc.disciplinaId }));
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 border border-indigo-500/30 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-sm">
                <Flame className="w-3.5 h-3.5" />
                24/11 a 28/11/2026 • TCC I: 04/12
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-indigo-100 border border-white/15">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Simulados: {globalStats.answered}/{globalStats.total} respondidas • {globalStats.correct} acertos
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Operação Semana da AV2 &amp; TCC I (2026.2)
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/85 max-w-3xl leading-relaxed">
              Central unificada com as regras confirmadas pelos docentes, resumos das aulas da Unidade 2, guias de revisão express, mapas mentais em árvore e {globalStats.total} questões de simulado comentadas — sincronizada ao NotebookLM oficial.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <a
            href={OFFICIAL_NOTEBOOKLM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Abrir NotebookLM Oficial (Transcrições &amp; Materiais)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleShareWhatsapp}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
          >
            {copiedWhatsapp ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedWhatsapp ? 'Resumo Copiado & Aberto!' : 'Compartilhar Guia AV2 no WhatsApp'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('aluno-checklist')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold text-xs transition active:scale-95 cursor-pointer"
          >
            <CheckSquare className="w-4 h-4 text-blue-300" />
            <span>Ver Checklist &amp; Calendário</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA DE FILTRO POR DIA DA SEMANA */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {DIA_FILTERS.map((f) => {
          const isActive = selectedDia === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedDia(f.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-1.5 border cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              <span>{f.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
                }`}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. GRID DE SELEÇÃO DAS DISCIPLINAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredDisciplinas.map((disc) => {
          const isSelected = disc.disciplinaId === activeDisc.disciplinaId;
          const stats = getDiscSimStats(disc);
          return (
            <button
              key={disc.disciplinaId}
              type="button"
              onClick={() => setSelectedDisciplinaId(disc.disciplinaId)}
              className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md'
                  : 'bg-white/80 dark:bg-slate-900/70 border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${disc.cor.badge}`}>
                    {disc.diaLabel}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {disc.formatoCurto}
                  </span>
                </div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white leading-snug">
                  {disc.ordem}. {disc.nomeCurto}
                </h3>
                <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">
                  {disc.professor}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="font-bold text-gray-600 dark:text-slate-300 flex items-center gap-1 truncate">
                  <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span className="truncate">{disc.horarioBRT.replace(' (Brasília)', '')}</span>
                </span>
                <span
                  className={`font-black shrink-0 ${
                    stats.answered === stats.total
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  {stats.answered}/{stats.total}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. PAINEL DETALHADO DA DISCIPLINA SELECIONADA */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Cabeçalho da Disciplina Ativa */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${activeDisc.cor.badge}`}>
                {activeDisc.dataExtenso}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                ⏰ {activeDisc.horarioBRT} • {activeDisc.horarioTabatinga}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {activeDisc.ordem}. {activeDisc.nome}
            </h2>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400">
              Docente: {activeDisc.professor}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenDisciplinaHub}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 transition cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Abrir Pasta / Hub</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('aluno-caderno')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Caderno Cornell</span>
            </button>
          </div>
        </div>

        {/* Alerta de Regra Crítica da Disciplina */}
        {activeDisc.alertaDestaque && (
          <div className="mx-5 sm:mx-6 mt-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/70 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 leading-relaxed">
              {activeDisc.alertaDestaque}
            </p>
          </div>
        )}

        {/* Abas Internas */}
        <div className="px-5 sm:px-6 pt-5 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setInnerTab('regras')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              innerTab === 'regras'
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/40'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>1. Regras &amp; Aulas U2 ({activeDisc.aulasUnidade2.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setInnerTab('guia')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              innerTab === 'guia'
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/40'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>2. Guia de Revisão ({activeDisc.guiaRevisao.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setInnerTab('mapa')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              innerTab === 'mapa'
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/40'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>3. Mapa Mental</span>
          </button>

          <button
            type="button"
            onClick={() => setInnerTab('simulado')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              innerTab === 'simulado'
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/40'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>4. Simulado Interativo ({activeDiscStats.correct}/{activeDiscStats.total})</span>
          </button>
        </div>

        {/* Conteúdo das Abas Internas */}
        <div className="p-5 sm:p-6">
          {/* ABA 1: REGRAS E AULAS UNIDADE 2 */}
          {innerTab === 'regras' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Data &amp; Horários Oficiais
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {activeDisc.dataExtenso}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {activeDisc.horarioBRT} · {activeDisc.horarioTabatinga}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Formato &amp; Composição da Nota
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {activeDisc.formatoCompleto}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{activeDisc.peso}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Consulta &amp; Trabalho Complementar
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{activeDisc.consulta}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{activeDisc.trabalhoExtra}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Canal de Envio &amp; Base da Prova
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{activeDisc.canalEnvio}</p>
                  {activeDisc.textosBase && (
                    <p className="text-xs text-slate-600 dark:text-slate-300">{activeDisc.textosBase}</p>
                  )}
                  {activeDisc.linksBase && activeDisc.linksBase.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeDisc.linksBase.map((link) => {
                        const styleCfg = LINK_BASE_STYLES[link.tipo];
                        const IconComp = styleCfg.Icon;
                        const colorClass = link.destaque ? styleCfg.destaqueClass : styleCfg.baseClass;
                        const isEmail = link.tipo === 'email';
                        return (
                          <a
                            key={`${activeDisc.disciplinaId}-${link.url}`}
                            href={link.url}
                            target={isEmail ? undefined : '_blank'}
                            rel={isEmail ? undefined : 'noopener noreferrer'}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition ${colorClass}`}
                          >
                            <IconComp className="w-3 h-3 shrink-0" />
                            <span>{link.label}</span>
                            <ExternalLink className="w-3 h-3 opacity-70 shrink-0" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-700 dark:text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>
                      {activeDisc.disciplinaId === 'disc-9'
                        ? 'Linha do Tempo • 4 Videoaulas do Módulo Gravado'
                        : 'Linha do Tempo • Aulas da Unidade 2'}
                    </span>
                  </h3>
                  {(() => {
                    const geminiCount = activeDisc.aulasUnidade2.filter((a) => Boolean(a.geminiUrl)).length;
                    const videoCount = activeDisc.aulasUnidade2.filter((a) => Boolean(a.videoUrl)).length;
                    if (geminiCount > 0) {
                      return (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {geminiCount} {geminiCount === 1 ? 'transcrição Gemini' : 'transcrições Gemini'}
                        </span>
                      );
                    }
                    if (videoCount > 0) {
                      return (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {videoCount} {videoCount === 1 ? 'videoaula gravada (Drive)' : 'videoaulas gravadas (Drive)'}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
                <div className="space-y-2.5">
                  {activeDisc.aulasUnidade2.map((aula) => (
                    <div
                      key={aula.aulaNum}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 flex items-start gap-3"
                    >
                      <span className="px-2.5 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-200 font-black text-[11px] shrink-0">
                        Aula {aula.aulaNum}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400">
                            {aula.dataAprox}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {aula.geminiUrl && (
                              <a
                                href={aula.geminiUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold transition shrink-0"
                              >
                                <Sparkles className="w-3 h-3 shrink-0" />
                                <span>Transcrição Gemini</span>
                                <ExternalLink className="w-3 h-3 opacity-70 shrink-0" />
                              </a>
                            )}
                            {aula.videoUrl && (
                              <a
                                href={aula.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/70 text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold transition shrink-0"
                              >
                                <Video className="w-3 h-3 shrink-0" />
                                <span>Assistir Videoaula (Drive)</span>
                                <ExternalLink className="w-3 h-3 opacity-70 shrink-0" />
                              </a>
                            )}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-800 dark:text-slate-200 leading-relaxed">
                          {aula.resumo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: GUIA DE REVISÃO */}
          {innerTab === 'guia' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-700 dark:text-slate-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Pontos de Maior Incidência na Prova</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setInnerTab('simulado')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <span>Ir para o Simulado desta Matéria</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {activeDisc.guiaRevisao.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-3.5"
                  >
                    <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-gray-900 dark:text-white">{item.titulo}</h4>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                        {item.detalhe}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 3: MAPA MENTAL */}
          {innerTab === 'mapa' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-700 dark:text-slate-200 flex items-center gap-2">
                    <Network className="w-4 h-4 text-emerald-500" />
                    <span>Mapa Mental Estruturado em Árvore</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    Visão panorâmica para memorização rápida antes da avaliação.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyMindmap}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                >
                  {copiedMap ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMap ? 'Mapa Copiado!' : 'Copiar Mapa Mental'}</span>
                </button>
              </div>

              <pre className="p-5 rounded-2xl bg-slate-950 text-emerald-300 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto border border-slate-800 shadow-inner whitespace-pre">
                {activeDisc.mapaMental}
              </pre>
            </div>
          )}

          {/* ABA 4: SIMULADO INTERATIVO */}
          {innerTab === 'simulado' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-indigo-950 dark:text-indigo-100">
                    Simulado Comentado — Estilo {activeDisc.professor}
                  </h3>
                  <p className="text-xs text-indigo-800 dark:text-indigo-300">
                    Placar atual nesta matéria:{' '}
                    <strong>
                      {activeDiscStats.correct} acerto(s) de {activeDiscStats.total}
                    </strong>{' '}
                    ({activeDiscStats.answered} respondida(s))
                  </p>
                </div>

                {activeDiscStats.answered > 0 && (
                  <button
                    type="button"
                    onClick={handleResetDisciplinaSimulado}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-indigo-100 dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-700 transition cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Refazer Simulado desta Matéria</span>
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {activeDisc.simulado.map((q, qIdx) => {
                  const chosen = answers[q.id];
                  const hasAnswered = Boolean(chosen);
                  const isCorrect = chosen === q.gabarito;

                  return (
                    <div
                      key={q.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 space-y-3.5"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-black text-xs shrink-0">
                          Q{qIdx + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                          {q.enunciado}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {q.alternativas.map((alt) => {
                          const isThisChosen = chosen === alt.letra;
                          const isThisRight = alt.letra === q.gabarito;

                          let btnStyle =
                            'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-600';

                          if (hasAnswered) {
                            if (isThisRight) {
                              btnStyle =
                                'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500/40';
                            } else if (isThisChosen && !isThisRight) {
                              btnStyle =
                                'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-950 dark:text-rose-100 ring-1 ring-rose-500/40';
                            } else {
                              btnStyle =
                                'bg-white/60 dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 opacity-75';
                            }
                          }

                          return (
                            <button
                              key={alt.letra}
                              type="button"
                              onClick={() => handleSelectOption(q.id, alt.letra)}
                              className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition flex items-start gap-2.5 cursor-pointer ${btnStyle}`}
                            >
                              <span
                                className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                                  hasAnswered && isThisRight
                                    ? 'bg-emerald-600 text-white'
                                    : hasAnswered && isThisChosen && !isThisRight
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {alt.letra}
                              </span>
                              <span className="flex-1 leading-relaxed">{alt.texto}</span>
                              {hasAnswered && isThisRight && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              )}
                              {hasAnswered && isThisChosen && !isThisRight && (
                                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && (
                        <div
                          className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
                          }`}
                        >
                          <strong className="block mb-0.5">
                            {isCorrect ? '✓ Resposta correta!' : `✗ Gabarito oficial: Alternativa ${q.gabarito}`}
                          </strong>
                          <span>{q.justificativa}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
