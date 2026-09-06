'use client';

import React, { useState, useEffect } from 'react';
import {
  SprintManager
} from './SprintManager';
import {
  CornellNotebook
} from './CornellNotebook';
import {
  QuotesDatabase
} from './QuotesDatabase';
import {
  DialecticMatrix
} from './DialecticMatrix';
import {
  DefenseSimulator
} from './DefenseSimulator';
import {
  oficinaEstudosService
} from '@/services/oficinaEstudosService';
import {
  EixoTematicoId
} from '@/types/oficinaEstudos';
import {
  GraduationCap,
  BookOpen,
  Quote,
  Scale,
  Mic,
  Calendar,
  Clock,
  Sparkles,
  Download,
  Upload,
  ArrowRight,
  Layers,
  Award,
  CheckCircle2,
  Bookmark,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type OficinaEtapa = 'sprints' | 'cornell' | 'citacoes' | 'dialetica' | 'simulador';

interface OficinaEstudosHubProps {
  userEmail?: string;
  initialEtapa?: OficinaEtapa;
  onTabChange?: (tab: string) => void;
}

export const OficinaEstudosHub: React.FC<OficinaEstudosHubProps> = ({
  userEmail = '',
  initialEtapa = 'sprints',
  onTabChange,
}) => {
  const [activeEtapa, setActiveEtapa] = useState<OficinaEtapa>(initialEtapa);

  // Estados compartilhados entre etapas (ex: abrir Cornell a partir do Sprint)
  const [cornellPreload, setCornellPreload] = useState<{
    autor?: string;
    obra?: string;
    eixo?: EixoTematicoId;
  }>({});

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Cálculo de Métricas Globais de Imersão
  const [metrics, setMetrics] = useState({
    totalHoras: 0,
    leiturasConcluidas: 0,
    leiturasTotal: 0,
    cornellCount: 0,
    citacoesCount: 0,
    dialeticaCount: 0,
    treinosBancaCount: 0,
  });

  const refreshMetrics = () => {
    const sprints = oficinaEstudosService.getSprints();
    let totalSecs = 0;
    let lDone = 0;
    let lTotal = 0;
    sprints.forEach((s) => {
      totalSecs += s.tempo_estudado_segundos || 0;
      s.checklist.forEach((c) => {
        lTotal++;
        if (c.lido) lDone++;
      });
    });

    const cornell = oficinaEstudosService.getCornellNotes();
    const citacoes = oficinaEstudosService.getCitacoes();
    const dialetica = oficinaEstudosService.getMatrizDialetica();
    const defesa = oficinaEstudosService.getHistoricoDefesa();

    setMetrics({
      totalHoras: Number((totalSecs / 3600).toFixed(1)),
      leiturasConcluidas: lDone,
      leiturasTotal: lTotal,
      cornellCount: cornell.length,
      citacoesCount: citacoes.length,
      dialeticaCount: dialetica.length,
      treinosBancaCount: defesa.length,
    });
  };

  useEffect(() => {
    refreshMetrics();
  }, [activeEtapa]);

  const handleOpenCornellWithBook = (autor: string, obra: string, eixo: EixoTematicoId) => {
    setCornellPreload({ autor, obra, eixo });
    setActiveEtapa('cornell');
    showToast(`Carregando "${obra}" no Caderno Cornell...`);
  };

  // Exportação / Backup Integral
  const handleExportBackup = () => {
    const allData = oficinaEstudosService.getAllData();
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Oficina_Estudos_TCC_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup completo em JSON exportado com sucesso!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const ok = oficinaEstudosService.restoreAllData(json);
        if (ok) {
          refreshMetrics();
          showToast('✓ Dados da Oficina de Estudos restaurados com sucesso!');
        } else {
          showToast('Erro ao restaurar arquivo de backup.');
        }
      } catch (err) {
        showToast('Arquivo JSON inválido para restauração.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. HEADER DO MÓDULO — PALETA SÓBRIA E ACADÊMICA */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Oficina de Estudos • 2026.2
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Zero-Egress • Local-First
              </span>
              {userEmail && (
                <span className="text-[11px] text-slate-400 font-mono">
                  Pesquisador: {userEmail}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Trilha de Estudos: Laboratório de Imersão e Metacognição do TCC
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Espaço de alta performance acadêmica desenhado para o formando de Teologia processar leituras densas, estruturar o Caderno Cornell, catalogar citações ABNT, articular debates dialéticos e treinar a oratória para a banca examinadora.
            </p>
          </div>

          {/* AÇÕES DE BACKUP / RESTAURAÇÃO */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              onClick={handleExportBackup}
              variant="outline"
              size="sm"
              className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5"
              title="Baixar backup completo de suas anotações em JSON"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Backup JSON</span>
            </Button>

            <label className="border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Restaurar</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* BARRA DE MÉTRICAS GLOBAIS DE IMERSÃO */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Tempo Estudado</span>
            </div>
            <div className="text-xl font-black text-white mt-1">
              {metrics.totalHoras} horas
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Sessões Pomodoro</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Leituras Concluídas</span>
            </div>
            <div className="text-xl font-black text-emerald-400 mt-1">
              {metrics.leiturasConcluidas} / {metrics.leiturasTotal}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Checklist Semanal</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <BookOpen className="w-3 h-3 text-blue-400" />
              <span>Folhas Cornell</span>
            </div>
            <div className="text-xl font-black text-blue-400 mt-1">
              {metrics.cornellCount} fichamentos
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Metacognição ativa</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <Quote className="w-3 h-3 text-amber-400" />
              <span>Citações ABNT</span>
            </div>
            <div className="text-xl font-black text-amber-400 mt-1">
              {metrics.citacoesCount} prontas
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Capítulos I a IV</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <Mic className="w-3 h-3 text-rose-400" />
              <span>Treinos da Banca</span>
            </div>
            <div className="text-xl font-black text-rose-400 mt-1">
              {metrics.treinosBancaCount} simulações
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Arguição com voz</div>
          </div>
        </div>
      </div>

      {/* 2. NAVEGAÇÃO ENTRE AS 5 ETAPAS FUNCIONAIS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-xl flex items-center gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveEtapa('sprints')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap cursor-pointer ${
            activeEtapa === 'sprints'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>1. Sprints Semanais & Eixos</span>
        </button>

        <button
          onClick={() => setActiveEtapa('cornell')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap cursor-pointer ${
            activeEtapa === 'cornell'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>2. Caderno Digital Cornell</span>
          {metrics.cornellCount > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeEtapa === 'cornell' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-300'
            }`}>
              {metrics.cornellCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveEtapa('citacoes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap cursor-pointer ${
            activeEtapa === 'citacoes'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Quote className="w-4 h-4" />
          <span>3. Citações Prontas (ABNT Hub)</span>
          {metrics.citacoesCount > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeEtapa === 'citacoes' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-300'
            }`}>
              {metrics.citacoesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveEtapa('dialetica')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap cursor-pointer ${
            activeEtapa === 'dialetica'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>4. Matriz Dialética de Autores</span>
        </button>

        <button
          onClick={() => setActiveEtapa('simulador')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap cursor-pointer ${
            activeEtapa === 'simulador'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>5. Simulador Socrático da Banca</span>
          {metrics.treinosBancaCount > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeEtapa === 'simulador' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-300'
            }`}>
              {metrics.treinosBancaCount}
            </span>
          )}
        </button>
      </div>

      {/* 3. CONTEÚDO DA ETAPA ATIVA */}
      <div className="animate-in fade-in duration-300">
        {activeEtapa === 'sprints' && (
          <SprintManager
            onOpenCornellWithBook={handleOpenCornellWithBook}
            onShowToast={showToast}
          />
        )}

        {activeEtapa === 'cornell' && (
          <CornellNotebook
            initialAutor={cornellPreload.autor}
            initialObra={cornellPreload.obra}
            initialEixo={cornellPreload.eixo}
            onShowToast={showToast}
          />
        )}

        {activeEtapa === 'citacoes' && (
          <QuotesDatabase onShowToast={showToast} />
        )}

        {activeEtapa === 'dialetica' && (
          <DialecticMatrix onShowToast={showToast} />
        )}

        {activeEtapa === 'simulador' && (
          <DefenseSimulator onShowToast={showToast} />
        )}
      </div>

      {/* 4. TOAST NOTIFICATION FLUTUANTE */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-amber-400/80 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 flex items-center gap-2 max-w-md">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
