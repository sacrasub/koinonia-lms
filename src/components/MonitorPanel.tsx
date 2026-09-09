'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Video, Copy, Check, ExternalLink, Calendar, UserCheck, Bell, 
  RefreshCw, Mic, Clock, AlertCircle, CheckCircle2, FolderOpen,
  ArrowRight, Play, Layers, Send, PhoneCall, ChevronDown, ChevronUp,
  MessageSquare, Shield
} from 'lucide-react';
import { EscalaMonitoriaPage, ESCALA_DATA, EscalaItem } from '@/components/EscalaMonitoriaPage';
import { getAuthorizedUserInfo } from '@/lib/authConfig';
import { getAllGravacoes, fetchGravacoesFromCloud, getActiveRecordings } from '@/services/gravacoesService';
import { getAnnouncements, fetchAnnouncementsFromCloud } from '@/services/announcementsService';
import { convertBRTToLocalTime, getCurrentBrasiliaMinutes } from '@/lib/timeUtils';
import { GravacaoAulaItem, AvisoLeituraPreAula, UserRole } from '@/types';
import { getAulaEmAndamentoHoje } from '@/lib/semesterUtils';
import { getAllDisciplinas } from '@/services/disciplinasService';

interface MonitorPanelProps {
  userEmail?: string;
  onTabChange?: (tab: string) => void;
}

export const MonitorPanel: React.FC<MonitorPanelProps> = ({ userEmail = '', onTabChange }) => {
  const normalizedEmail = (userEmail || '').toLowerCase().trim();
  const authInfo = getAuthorizedUserInfo(normalizedEmail);
  const monitorName = authInfo.user?.name || 'Monitor';

  const [activeSubView, setActiveSubView] = useState<'dashboard' | 'escala'>('dashboard');
  const [copied, setCopied] = useState<string | null>(null);
  const [gravacoes, setGravacoes] = useState<GravacaoAulaItem[]>([]);
  const [announcements, setAnnouncements] = useState<AvisoLeituraPreAula[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAllGrav, setShowAllGrav] = useState(false);
  const [showAllAvisos, setShowAllAvisos] = useState(false);

  // Determina as aulas de hoje na escala (baseado no dia da semana BRT)
  const todayEscala = useMemo<EscalaItem[]>(() => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const brtNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const todayName = days[brtNow.getDay()];
    return ESCALA_DATA.filter(e => e.dayOfWeek === todayName);
  }, []);

  // Identifica aula em andamento agora
  const aulaAgora = useMemo(() => {
    const currentMin = getCurrentBrasiliaMinutes();
    return todayEscala.find(e => {
      const [sh, sm] = e.startBRT.split(':').map(Number);
      const [eh, em] = e.endBRT.split(':').map(Number);
      const start = sh * 60 + sm - 10; // 10 min antes
      const end = eh * 60 + em + 10;   // 10 min depois
      return currentMin >= start && currentMin <= end;
    }) || null;
  }, [todayEscala]);

  const handleCopy = useCallback((text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const [grav, avs] = await Promise.all([
        fetchGravacoesFromCloud(),
        fetchAnnouncementsFromCloud(),
      ]);
      setGravacoes(grav);
      setAnnouncements(avs);
    } catch (e) {
      console.warn('Erro ao sincronizar dados do monitor:', e);
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  useEffect(() => {
    setGravacoes(getAllGravacoes());
    setAnnouncements(getAnnouncements());
    // Sync inicial leve em background
    fetchGravacoesFromCloud().then(setGravacoes).catch(() => {});
    fetchAnnouncementsFromCloud().then(setAnnouncements).catch(() => {});

    const handleGravUpd = () => setGravacoes(getAllGravacoes());
    const handleAvsUpd = () => setAnnouncements(getAnnouncements());
    window.addEventListener('lms_gravacoes_updated', handleGravUpd);
    window.addEventListener('lms_announcements_updated', handleAvsUpd);
    return () => {
      window.removeEventListener('lms_gravacoes_updated', handleGravUpd);
      window.removeEventListener('lms_announcements_updated', handleAvsUpd);
    };
  }, []);

  const recentGravacoes = gravacoes
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, showAllGrav ? 10 : 3);

  const recentAvisos = announcements
    .filter(a => !a.is_archived)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, showAllAvisos ? 10 : 3);

  if (activeSubView === 'escala') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveSubView('dashboard')}
          className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition"
        >
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          Voltar ao Dashboard do Monitor
        </button>
        <EscalaMonitoriaPage userEmail={userEmail} currentRole="monitor" onTabChange={onTabChange} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div data-tour="monitor-header" className="bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-900 dark:to-indigo-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-5 h-5 text-blue-200" />
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight">Central do Monitor</h1>
            </div>
            <p className="text-xs text-blue-200 font-medium">
              Olá, <strong className="text-white">{monitorName.split(' ')[0]}</strong> — suas ferramentas de monitoria em um só lugar
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* AULA EM ANDAMENTO AGORA */}
      {aulaAgora && (
        <div data-tour="monitor-aula-agora" className="bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-700 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600"></span>
            </span>
            <p className="text-xs font-extrabold text-green-800 dark:text-green-300 uppercase tracking-wide">
              Aula Em Andamento Agora
            </p>
          </div>
          <p className="text-sm font-bold text-green-900 dark:text-green-200 mb-1">{aulaAgora.title}</p>
          <p className="text-xs text-green-700 dark:text-green-400 mb-3">
            {aulaAgora.professor} · {aulaAgora.startBRT} – {aulaAgora.endBRT} BRT · {aulaAgora.turma}
          </p>
          <div className="flex flex-wrap gap-2">
            {aulaAgora.meetUrl && (
              <a
                href={aulaAgora.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition"
              >
                <Video className="w-3.5 h-3.5" />
                Entrar no Meet
              </a>
            )}
            {aulaAgora.presencaUrl && (
              <button
                onClick={() => handleCopy(aulaAgora.presencaUrl, `pres-${aulaAgora.id}`)}
                className="flex items-center gap-1.5 bg-white dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-green-50 dark:hover:bg-green-800 transition cursor-pointer"
              >
                {copied === `pres-${aulaAgora.id}` ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === `pres-${aulaAgora.id}` ? 'Copiado!' : 'Copiar Link de Presença'}
              </button>
            )}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('lms_open_recorder', { 
                detail: { disciplinaId: aulaAgora.id, initialMode: 'autopilot' }
              }))}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              Gravar Aula
            </button>
          </div>
        </div>
      )}

      {/* GRADE RÁPIDA DO DIA */}
      {todayEscala.length > 0 && (
        <div data-tour="monitor-grade-dia" className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xs font-extrabold text-gray-700 dark:text-slate-200 uppercase tracking-wide">
              Aulas de Hoje ({todayEscala[0].dayOfWeek.split('-')[0]})
            </h2>
          </div>
          <div className="space-y-2">
            {todayEscala.map(item => (
              <div
                key={item.id}
                className={`rounded-xl border p-3 flex items-center justify-between gap-3 transition ${
                  aulaAgora?.id === item.id
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">{item.title}</p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">{item.startBRT}–{item.endBRT} BRT · {item.turma}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.presencaUrl && (
                    <button
                      onClick={() => handleCopy(item.presencaUrl, `p-${item.id}`)}
                      title="Copiar link de presença"
                      className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 transition cursor-pointer"
                    >
                      {copied === `p-${item.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  {item.meetUrl && (
                    <a
                      href={item.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir Google Meet"
                      className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/40 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300 transition"
                    >
                      <Video className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          {todayEscala.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-slate-400 text-center py-2">Sem aulas programadas hoje.</p>
          )}
        </div>
      )}

      {/* AÇÕES RÁPIDAS */}
      <div data-tour="monitor-acoes-rapidas" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveSubView('escala')}
          className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-slate-600 transition group cursor-pointer"
        >
          <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-gray-700 dark:text-slate-200 text-center">Grade & Presença</span>
        </button>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('lms_open_recorder', { detail: { initialMode: 'autopilot' } }))}
          className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 hover:bg-red-50 dark:hover:bg-slate-800 hover:border-red-300 dark:hover:border-slate-600 transition group cursor-pointer"
        >
          <Mic className="w-6 h-6 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-gray-700 dark:text-slate-200 text-center">Gravar Aula</span>
        </button>
        <button
          onClick={() => onTabChange?.('comunidade-forum')}
          className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 hover:bg-purple-50 dark:hover:bg-slate-800 hover:border-purple-300 dark:hover:border-slate-600 transition group cursor-pointer"
        >
          <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-gray-700 dark:text-slate-200 text-center">Fórum Koinonia</span>
        </button>
        <button
          onClick={() => onTabChange?.('aluno-materiais')}
          className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 hover:bg-amber-50 dark:hover:bg-slate-800 hover:border-amber-300 dark:hover:border-slate-600 transition group cursor-pointer"
        >
          <FolderOpen className="w-6 h-6 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-gray-700 dark:text-slate-200 text-center">Pastas & Materiais</span>
        </button>
        <button
          onClick={() => onTabChange?.('google-agenda')}
          className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 hover:bg-green-50 dark:hover:bg-slate-800 hover:border-green-300 dark:hover:border-slate-600 transition group cursor-pointer"
        >
          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-gray-700 dark:text-slate-200 text-center">Agenda & Meet</span>
        </button>
        <button
          onClick={() => onTabChange?.('portfolios')}
          className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-slate-600 transition group cursor-pointer"
        >
          <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-gray-700 dark:text-slate-200 text-center">Portfólios</span>
        </button>
      </div>

      {/* ÚLTIMAS GRAVAÇÕES */}
      <div data-tour="monitor-gravacoes-card" className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <h2 className="text-xs font-extrabold text-gray-700 dark:text-slate-200 uppercase tracking-wide">
              Últimas Gravações
            </h2>
          </div>
          <button
            onClick={() => setShowAllGrav(v => !v)}
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-bold transition cursor-pointer"
          >
            {showAllGrav ? 'Ver menos' : `Ver todas (${gravacoes.length})`}
          </button>
        </div>
        {recentGravacoes.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-3">Nenhuma gravação salva ainda.</p>
        ) : (
          <div className="space-y-2">
            {recentGravacoes.map(g => (
              <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
                  <Play className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">{g.title}</p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">{g.disciplina_name} · {g.data_aula}</p>
                </div>
                <a
                  href={g.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 transition shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AVISOS & LEITURAS RECENTES */}
      <div data-tour="monitor-avisos-card" className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-xs font-extrabold text-gray-700 dark:text-slate-200 uppercase tracking-wide">
              Avisos & Recursos Recentes
            </h2>
          </div>
          <button
            onClick={() => setShowAllAvisos(v => !v)}
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-bold transition cursor-pointer"
          >
            {showAllAvisos ? 'Ver menos' : `Ver todos (${announcements.filter(a => !a.is_archived).length})`}
          </button>
        </div>
        {recentAvisos.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-3">Nenhum aviso publicado ainda.</p>
        ) : (
          <div className="space-y-2">
            {recentAvisos.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                  <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">{a.title}</p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">{a.disciplina_name} · {a.author_name}</p>
                </div>
                {a.link_url && (
                  <a
                    href={a.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-800 text-amber-700 dark:text-amber-300 transition shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link para Escala Completa */}
      <button
        data-tour="monitor-btn-escala"
        onClick={() => setActiveSubView('escala')}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold text-sm py-3 rounded-2xl transition shadow-md cursor-pointer"
      >
        <UserCheck className="w-4 h-4" />
        Abrir Escala Completa & Links de Presença
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

