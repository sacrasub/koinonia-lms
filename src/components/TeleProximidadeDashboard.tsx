'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Rss, AlertTriangle, AlertCircle, CheckCircle2, Users, TrendingDown,
  TrendingUp, Minus, MessageSquare, Heart, Video, RefreshCw, Download,
  Send, ChevronDown, ChevronUp, Info, Clock, Wifi, AlertOctagon,
  Shield, BookOpen, Search, SlidersHorizontal, XCircle, BarChart3
} from 'lucide-react';
import {
  PerfilEngajamentoAluno,
  AlertaIsolamento,
  TeleProximidadeSummary,
  NivelRiscoIsolamento,
  UserRole,
} from '@/types';
import {
  getTeleProximidadeSummary,
  registrarAcaoPedagogica,
  downloadTSPCsv,
} from '@/services/teleProximidadeService';

// ============================================================================
// HELPERS DE VISUAL
// ============================================================================

const NIVEL_CONFIG: Record<
  NivelRiscoIsolamento,
  { label: string; cor: string; badge: string; bg: string; border: string; icon: React.ElementType }
> = {
  critico: {
    label: 'Crítico',
    cor: 'text-red-700',
    badge: 'bg-red-100 text-red-700 border-red-200',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertCircle,
  },
  atencao: {
    label: 'Atenção',
    cor: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: AlertTriangle,
  },
  monitorar: {
    label: 'Monitorar',
    cor: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: Info,
  },
  engajado: {
    label: 'Engajado',
    cor: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: CheckCircle2,
  },
};

function ScoreBar({ score }: { score: number }) {
  const color =
    score <= 20 ? 'bg-red-500' :
    score <= 45 ? 'bg-amber-500' :
    score <= 70 ? 'bg-blue-500' :
    'bg-emerald-500';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 w-8 text-right">{score}</span>
    </div>
  );
}

function TendenciaIcon({ tendencia }: { tendencia: string }) {
  if (tendencia === 'melhorando') return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />;
  if (tendencia === 'piorando') return <TrendingDown className="w-3.5 h-3.5 text-red-600" />;
  return <Minus className="w-3.5 h-3.5 text-gray-400" />;
}

function getRelativeTime(isoDate?: string): string {
  if (!isoDate) return 'Sem registro';
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 60) return `Há ${diffMin} min`;
  if (diffHours < 24) return `Há ${diffHours}h`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 30) return `Há ${diffDays} dias`;
  return `Há ${Math.floor(diffDays / 30)} meses`;
}

// ============================================================================
// COMPONENTE: CARD DE ALUNO EM RISCO
// ============================================================================

interface CardAlunoProps {
  perfil: PerfilEngajamentoAluno;
  alerta?: AlertaIsolamento;
  professorEmail: string;
  onAcaoRegistrada: () => void;
}

const CardAluno: React.FC<CardAlunoProps> = ({
  perfil,
  alerta,
  professorEmail,
  onAcaoRegistrada,
}) => {
  const [expandido, setExpandido] = useState(false);
  const [acaoTexto, setAcaoTexto] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const config = NIVEL_CONFIG[perfil.nivel_risco];
  const Icon = config.icon;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSalvarAcao = async (marcarResolvido: boolean) => {
    if (!alerta || !acaoTexto.trim()) {
      showToast('Por favor, descreva a ação tomada antes de salvar.');
      return;
    }
    setSalvando(true);
    try {
      await registrarAcaoPedagogica(alerta.id, professorEmail, acaoTexto.trim(), marcarResolvido);
      showToast(marcarResolvido ? '✅ Aluno marcado como reengajado!' : '💾 Ação registrada com sucesso.');
      setAcaoTexto('');
      setExpandido(false);
      onAcaoRegistrada();
    } catch (e) {
      showToast('Erro ao registrar ação. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  // Não mostra alunos totalmente engajados nesta listagem
  if (perfil.nivel_risco === 'engajado' && !expandido) return null;

  return (
    <div className={`rounded-2xl border ${config.border} ${config.bg} overflow-hidden transition-all duration-300`}>
      {/* Toast local */}
      {toast && (
        <div className="bg-gray-900 text-white text-xs px-4 py-2 text-center font-medium">
          {toast}
        </div>
      )}

      {/* Cabeçalho do Card */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white ${
              perfil.nivel_risco === 'critico' ? 'bg-red-500' :
              perfil.nivel_risco === 'atencao' ? 'bg-amber-500' :
              perfil.nivel_risco === 'monitorar' ? 'bg-blue-500' :
              'bg-emerald-500'
            }`}>
              {perfil.aluno_nome.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-gray-900 truncate">{perfil.aluno_nome}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.badge}`}>
                  <Icon className="w-3 h-3" />
                  {config.label}
                </span>
                <TendenciaIcon tendencia={perfil.tendencia} />
              </div>
              <p className="text-[11px] text-gray-500 truncate mt-0.5">{perfil.aluno_email}</p>
            </div>
          </div>

          {/* Score e expandir */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 font-medium">Score TSP</p>
              <p className={`text-xl font-black ${config.cor}`}>{perfil.score_engajamento}</p>
              <p className="text-[9px] text-gray-400">/ 100</p>
            </div>
            <button
              onClick={() => setExpandido(!expandido)}
              className="p-1.5 rounded-lg hover:bg-white/60 text-gray-400 transition-colors"
            >
              {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Barra de score */}
        <div className="mt-3">
          <ScoreBar score={perfil.score_engajamento} />
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="text-center">
            <div className={`text-xs font-bold ${perfil.dias_sem_login >= 7 ? 'text-red-600' : perfil.dias_sem_login >= 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {perfil.dias_sem_login >= 999 ? '—' : `${perfil.dias_sem_login}d`}
            </div>
            <div className="text-[9px] text-gray-500 mt-0.5">Sem login</div>
          </div>
          <div className="text-center">
            <div className={`text-xs font-bold ${perfil.total_forum_7d === 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {perfil.total_forum_7d}
            </div>
            <div className="text-[9px] text-gray-500 mt-0.5">Fórum 7d</div>
          </div>
          <div className="text-center">
            <div className={`text-xs font-bold ${perfil.total_oracoes_7d === 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {perfil.total_oracoes_7d}
            </div>
            <div className="text-[9px] text-gray-500 mt-0.5">Oração 7d</div>
          </div>
          <div className="text-center">
            <div className={`text-xs font-bold ${perfil.total_meet_joins_7d === 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {perfil.total_meet_joins_7d}
            </div>
            <div className="text-[9px] text-gray-500 mt-0.5">Meet/Drive</div>
          </div>
        </div>
      </div>

      {/* Painel Expandido */}
      {expandido && (
        <div className="border-t border-current/10 p-4 bg-white/50 space-y-4">
          {/* Última atividade */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>Última atividade detectada: <strong>{getRelativeTime(perfil.ultima_atividade)}</strong></span>
          </div>

          {/* Diagnóstico pedagógico */}
          <div className="rounded-xl bg-white border border-gray-200 p-3">
            <p className="text-[11px] font-bold text-gray-700 mb-2">🔍 Diagnóstico TSP</p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2 text-[11px] text-gray-600">
                <Wifi className={`w-3.5 h-3.5 ${perfil.dias_sem_login <= 2 ? 'text-emerald-500' : perfil.dias_sem_login <= 6 ? 'text-amber-500' : 'text-red-500'}`} />
                Login: {perfil.dias_sem_login >= 999 ? 'nunca registrado' : `há ${perfil.dias_sem_login} dias`}
                {' '}(peso: 40pts)
              </li>
              <li className="flex items-center gap-2 text-[11px] text-gray-600">
                <MessageSquare className={`w-3.5 h-3.5 ${perfil.total_forum_7d >= 3 ? 'text-emerald-500' : perfil.total_forum_7d >= 1 ? 'text-amber-500' : 'text-red-500'}`} />
                Fórum: {perfil.total_forum_7d} interação(ões) em 7 dias (peso: 25pts)
              </li>
              <li className="flex items-center gap-2 text-[11px] text-gray-600">
                <Heart className={`w-3.5 h-3.5 ${perfil.total_oracoes_7d >= 2 ? 'text-emerald-500' : perfil.total_oracoes_7d >= 1 ? 'text-amber-500' : 'text-red-500'}`} />
                Mural de Oração: {perfil.total_oracoes_7d} interação(ões) em 7 dias (peso: 15pts)
              </li>
              <li className="flex items-center gap-2 text-[11px] text-gray-600">
                <Video className={`w-3.5 h-3.5 ${perfil.total_meet_joins_7d >= 2 ? 'text-emerald-500' : perfil.total_meet_joins_7d >= 1 ? 'text-amber-500' : 'text-red-500'}`} />
                Meet/Drive: {perfil.total_meet_joins_7d} acesso(s) em 7 dias (peso: 20pts)
              </li>
            </ul>
          </div>

          {/* Ação pedagógica — só para alertas existentes */}
          {alerta && !alerta.resolvido && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-gray-700">
                ✉️ Registrar Ação como Conector Carismático
              </p>
              <textarea
                value={acaoTexto}
                onChange={(e) => setAcaoTexto(e.target.value)}
                placeholder="Ex: Enviei mensagem no WhatsApp. Aluno relatou dificuldades técnicas e retomará os estudos na próxima semana."
                className="w-full text-xs border border-gray-200 rounded-xl p-3 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSalvarAcao(false)}
                  disabled={salvando || !acaoTexto.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  {salvando ? 'Salvando...' : 'Registrar Contato'}
                </button>
                <button
                  onClick={() => handleSalvarAcao(true)}
                  disabled={salvando || !acaoTexto.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {salvando ? 'Salvando...' : 'Marcar Reengajado'}
                </button>
              </div>
            </div>
          )}

          {/* Ação já registrada */}
          {alerta?.acao_tomada && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
              <p className="text-[10px] font-bold text-emerald-700 mb-1">✅ Ação Registrada</p>
              <p className="text-[11px] text-emerald-800">{alerta.acao_tomada}</p>
              {alerta.professor_email && (
                <p className="text-[10px] text-emerald-600 mt-1">Por: {alerta.professor_email}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL: DASHBOARD DE TELE-PROXIMIDADE
// ============================================================================

interface TeleProximidadeDashboardProps {
  userEmail: string;
  currentRole: UserRole;
}

export const TeleProximidadeDashboard: React.FC<TeleProximidadeDashboardProps> = ({
  userEmail,
  currentRole,
}) => {
  const [summary, setSummary] = useState<TeleProximidadeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState<'todos' | NivelRiscoIsolamento>('todos');
  const [busca, setBusca] = useState('');
  const [mostrarEngajados, setMostrarEngajados] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const data = await getTeleProximidadeSummary(manual);
      setSummary(data);
    } catch (e) {
      showToast('Erro ao carregar dados de engajamento. Verifique a conexão.');
    } finally {
      setLoading(false);
      if (manual) setTimeout(() => setRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') loadData();
    }, 5 * 60 * 1000); // Atualiza a cada 5 minutos
    return () => clearInterval(interval);
  }, [loadData]);

  // Perfis filtrados e buscados
  const perfisFiltrados = (summary?.perfis || []).filter((p) => {
    const matchFiltro = filtro === 'todos' || p.nivel_risco === filtro;
    const matchBusca =
      !busca ||
      p.aluno_nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.aluno_email.toLowerCase().includes(busca.toLowerCase());
    const matchVisibilidade = mostrarEngajados || p.nivel_risco !== 'engajado';
    return matchFiltro && matchBusca && matchVisibilidade;
  });

  // Mapeia alertas por email para lookup rápido
  const alertasPorEmail = new Map<string, AlertaIsolamento>(
    (summary?.alertas_abertos || []).map((a) => [a.aluno_email.toLowerCase(), a]),
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700">Calculando Tele-Proximidade...</p>
          <p className="text-xs text-gray-500 mt-1">
            Analisando sessões, fórum e mural de oração
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Toast global */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top-2 duration-300 max-w-sm">
          {notification}
        </div>
      )}

      {/* ===== CABEÇALHO ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-md">
              <Rss className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-black text-gray-900">Radar de Tele-Proximidade</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-10">
            Fundamentação: <em>Tele-Social Presença (TSP)</em> — Themelis, 2022 · Atualiza a cada 5 min
          </p>
        </div>
        <div className="flex items-center gap-2 ml-10 sm:ml-0">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          {summary && (
            <button
              onClick={() => downloadTSPCsv(summary.perfis)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar TSP (CSV)
            </button>
          )}
        </div>
      </div>

      {/* ===== AVISO METODOLÓGICO ===== */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-violet-800">Como funciona o Score de Engajamento TSP</p>
            <p className="text-[11px] text-violet-700 mt-1">
              O sistema analisa silenciosamente 4 indicadores de presença social:
              <strong> Login (40pts)</strong> + <strong>Fórum (25pts)</strong> + <strong>Mural de Oração (15pts)</strong> + <strong>Meet/Drive (20pts)</strong>.
              Alunos sem login há +7 dias ou com score ≤ 20 recebem alerta <strong>Crítico</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ===== CARDS DE RESUMO ===== */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Críticos',
              value: summary.alunos_criticos,
              icon: AlertCircle,
              color: 'text-red-700',
              bg: 'bg-red-50',
              border: 'border-red-200',
              filtroId: 'critico' as const,
            },
            {
              label: 'Atenção',
              value: summary.alunos_atencao,
              icon: AlertTriangle,
              color: 'text-amber-700',
              bg: 'bg-amber-50',
              border: 'border-amber-200',
              filtroId: 'atencao' as const,
            },
            {
              label: 'Monitorar',
              value: summary.alunos_monitorar,
              icon: Info,
              color: 'text-blue-700',
              bg: 'bg-blue-50',
              border: 'border-blue-200',
              filtroId: 'monitorar' as const,
            },
            {
              label: 'Engajados',
              value: summary.alunos_engajados,
              icon: CheckCircle2,
              color: 'text-emerald-700',
              bg: 'bg-emerald-50',
              border: 'border-emerald-200',
              filtroId: 'engajado' as const,
            },
          ].map((card) => {
            const Icon = card.icon;
            const isActive = filtro === card.filtroId;
            return (
              <button
                key={card.filtroId}
                onClick={() => setFiltro(isActive ? 'todos' : card.filtroId)}
                className={`rounded-2xl border p-4 text-left transition-all ${card.bg} ${card.border} ${isActive ? 'ring-2 ring-offset-1 ring-violet-400 shadow-md' : 'hover:shadow-md'}`}
              >
                <Icon className={`w-5 h-5 ${card.color} mb-2`} />
                <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                <p className="text-[11px] font-semibold text-gray-600 mt-0.5">{card.label}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Taxa geral */}
      {summary && (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <BarChart3 className="w-8 h-8 text-violet-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-600">Taxa de Engajamento Geral (TSP Score Médio)</p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    summary.taxa_engajamento_geral <= 30 ? 'bg-red-500' :
                    summary.taxa_engajamento_geral <= 55 ? 'bg-amber-500' :
                    summary.taxa_engajamento_geral <= 75 ? 'bg-blue-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${summary.taxa_engajamento_geral}%` }}
                />
              </div>
              <span className="text-xl font-black text-gray-800 w-16 text-right">
                {summary.taxa_engajamento_geral}%
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-gray-800">{summary.total_alunos_monitorados}</p>
            <p className="text-[10px] text-gray-500">alunos monitorados</p>
          </div>
        </div>
      )}

      {/* ===== FILTROS E BUSCA ===== */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar aluno por nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
          />
          {busca && (
            <button onClick={() => setBusca('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <XCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro('todos')}
            className={`text-xs font-semibold px-3 py-2 rounded-xl transition-all ${filtro === 'todos' ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setMostrarEngajados(!mostrarEngajados)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${mostrarEngajados ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {mostrarEngajados ? 'Ocultar Engajados' : 'Ver Engajados'}
          </button>
        </div>
      </div>

      {/* ===== LISTA DE ALUNOS ===== */}
      <div className="space-y-3">
        {perfisFiltrados.length === 0 && (
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-10 text-center">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-600">
              {busca ? 'Nenhum aluno encontrado para esta busca.' : 'Todos os alunos estão engajados! 🎉'}
            </p>
            {!mostrarEngajados && !busca && (
              <button
                onClick={() => setMostrarEngajados(true)}
                className="mt-2 text-xs text-violet-600 hover:underline"
              >
                Ver alunos engajados
              </button>
            )}
          </div>
        )}

        {perfisFiltrados.map((perfil) => (
          <CardAluno
            key={perfil.aluno_email}
            perfil={perfil}
            alerta={alertasPorEmail.get(perfil.aluno_email.toLowerCase())}
            professorEmail={userEmail}
            onAcaoRegistrada={() => loadData(true)}
          />
        ))}
      </div>

      {/* ===== RODAPÉ ACADÊMICO ===== */}
      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
        <div className="flex items-start gap-2">
          <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-gray-600">Referência Teórica</p>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
              THEMELIS, C. <em>Tele-Social Presence and the Fostering of Sociality in Virtual Learning Environments</em>.
              In: <em>New Approaches to Distance Learning for Industrial and Business Training</em>.
              IGI Global, 2022. · Implementado como estudo de caso no Koinonia-LMS (Seminário Teológico UIECB), 2026.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeleProximidadeDashboard;
