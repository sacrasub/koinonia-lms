'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Users, Clock, Smartphone, Monitor, Tablet, 
  Search, Filter, Download, RefreshCw, CheckCircle2, 
  Flame, TrendingUp, Sparkles, BookOpen, Library, Video, 
  FolderOpen, Film, Archive, CheckSquare, Drama, HelpCircle, 
  Compass, SlidersHorizontal, Layers, ShieldCheck, UserCheck, 
  GraduationCap, AlertCircle, ArrowUpRight, ArrowDownRight, 
  Calendar, BarChart3, PieChart, Zap, Radio, ChevronDown, ChevronUp, ChevronRight,
  User, ExternalLink, Eye, X, CalendarDays, ListFilter, Sliders,
  Clock3, Globe, Sparkle, ArrowRight
} from 'lucide-react';
import { 
  AnalyticsSummary, 
  UserSessionLog, 
  AnalyticsEvent, 
  UserRole, 
  DeviceType,
  AnalyticsCategory 
} from '@/types';
import { 
  getAnalyticsSummary, 
  exportSessionsCSV, 
  exportEventsCSV, 
  downloadFile,
  getUserDetailedHistory,
  UserDossierHistory,
  uploadLocalSessionsToCloud
} from '@/services/telemetryService';
import { INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';
import { TeleProximidadeDashboard } from '@/components/TeleProximidadeDashboard';

export const AdminAnalyticsView: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'modules' | 'insights' | 'events' | 'tele-proximidade'>('sessions');

  // =========================================================================
  // ESTADOS DE FILTRO TEMPORAL (VISÃO DEFAULT: HOJE)
  // =========================================================================
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('today');
  const [customDateInput, setCustomDateInput] = useState<string>('');

  // Filtro de Pessoa / Usuário Específico
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [searchUser, setSearchUser] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterDevice, setFilterDevice] = useState<string>('all');
  const [onlyActiveNow, setOnlyActiveNow] = useState<boolean>(false);
  const [expandedUserEmails, setExpandedUserEmails] = useState<Set<string>>(new Set());

  // Modal de Dossiê Detalhado do Usuário (Histórico Completo por Pessoa)
  const [dossierUserEmail, setDossierUserEmail] = useState<string | null>(null);
  const [dossierActiveTab, setDossierActiveTab] = useState<'sessions' | 'events'>('sessions');

  // Filtros e Visualização do Feed de Atividades
  const [feedViewMode, setFeedViewMode] = useState<'grouped' | 'stream'>('stream');
  const [searchEventUser, setSearchEventUser] = useState<string>('');
  const [filterEventRole, setFilterEventRole] = useState<string>('all');
  const [onlyActiveNowEvents, setOnlyActiveNowEvents] = useState<boolean>(false);
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>('all');
  const [expandedEventUserEmails, setExpandedEventUserEmails] = useState<Set<string>>(new Set());

  const toggleExpandUser = (email: string) => {
    setExpandedUserEmails((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const toggleExpandAll = () => {
    if (expandedUserEmails.size > 0) {
      setExpandedUserEmails(new Set());
    } else {
      const all = new Set(groupedUserSessions.map((g) => g.user_email));
      setExpandedUserEmails(all);
    }
  };

  const toggleExpandEventUser = (email: string) => {
    setExpandedEventUserEmails((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const toggleExpandAllEvents = () => {
    if (expandedEventUserEmails.size > 0) {
      setExpandedEventUserEmails(new Set());
    } else {
      const all = new Set(groupedUserEvents.map((g) => g.user_email));
      setExpandedEventUserEmails(all);
    }
  };

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      if (isManual) {
        await uploadLocalSessionsToCloud();
      }
      const data = await getAnalyticsSummary(isManual);
      setSummary(data);
    } catch (err) {
      console.error('Erro ao carregar telemetria:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 400);
    }
  };

  useEffect(() => {
    // Limpeza de contingência de dados mockados/seeds antigos no localStorage
    if (typeof window !== 'undefined') {
      try {
        const rawSessions = localStorage.getItem('lms_user_sessions_cache');
        if (rawSessions && rawSessions.includes('sess_seed_')) {
          const parsed = JSON.parse(rawSessions);
          const clean = parsed.filter((s: any) => s && s.id && !s.id.startsWith('sess_seed_'));
          localStorage.setItem('lms_user_sessions_cache', JSON.stringify(clean));
        }
        const rawEvents = localStorage.getItem('lms_analytics_events_cache');
        if (rawEvents && rawEvents.includes('evt_seed_')) {
          const parsed = JSON.parse(rawEvents);
          const clean = parsed.filter((e: any) => e && e.id && !e.id.startsWith('evt_seed_'));
          localStorage.setItem('lms_analytics_events_cache', JSON.stringify(clean));
        }
      } catch (e) {}
    }

    // Unifica sessões acumuladas deste dispositivo na nuvem e puxa o resumo global consolidado
    uploadLocalSessionsToCloud()
      .then(() => loadData(true))
      .catch(() => loadData(false));

    // Revalidação inteligente: atualiza apenas se a aba voltar ao foco e após 1 minuto de inatividade
    let lastFocusRefresh = Date.now();
    const handleFocus = () => {
      if (Date.now() - lastFocusRefresh > 60000) {
        lastFocusRefresh = Date.now();
        loadData(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleExportSessions = () => {
    if (!summary) return;
    const csv = exportSessionsCSV(sessionsFilteredByDayAndUser);
    downloadFile(csv, `lms_acessos_${selectedDayFilter}_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportEvents = () => {
    if (!summary) return;
    const csv = exportEventsCSV(eventsFilteredByDayAndUser);
    downloadFile(csv, `lms_eventos_telemetria_${selectedDayFilter}_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportJSON = () => {
    if (!summary) return;
    const jsonStr = JSON.stringify({
      selected_period: selectedDayFilter,
      summary_metrics: daySummaryMetrics,
      sessions: sessionsFilteredByDayAndUser,
      events: eventsFilteredByDayAndUser,
    }, null, 2);
    downloadFile(jsonStr, `lms_relatorio_completo_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  };

  const getRelativeTime = (dateStr: string) => {
    const now = new Date().getTime();
    const past = new Date(dateStr).getTime();
    const diffSec = Math.max(0, Math.floor((now - past) / 1000));

    if (diffSec < 60) return 'Agora mesmo';
    if (diffSec < 3600) return `Há ${Math.floor(diffSec / 60)} min`;
    if (diffSec < 86400) return `Há ${Math.floor(diffSec / 3600)}h`;
    return `Há ${Math.floor(diffSec / 86400)} dias`;
  };

  const getCategoryIcon = (category: AnalyticsCategory) => {
    switch (category) {
      case 'cornell_notes': return <BookOpen className="w-4 h-4 text-purple-600" />;
      case 'biblioteca': return <Library className="w-4 h-4 text-blue-600" />;
      case 'meet': return <Video className="w-4 h-4 text-rose-600" />;
      case 'drive': return <FolderOpen className="w-4 h-4 text-amber-600" />;
      case 'gravacoes': return <Film className="w-4 h-4 text-emerald-600" />;
      case 'portfolio': return <Archive className="w-4 h-4 text-indigo-600" />;
      case 'checklist': return <CheckSquare className="w-4 h-4 text-teal-600" />;
      case 'rpg': return <Drama className="w-4 h-4 text-pink-600" />;
      case 'portal_academico': return <Compass className="w-4 h-4 text-cyan-600" />;
      case 'ajuda': return <HelpCircle className="w-4 h-4 text-orange-600" />;
      case 'metacognitivo': return <SlidersHorizontal className="w-4 h-4 text-fuchsia-600" />;
      case 'session': return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'navigation': return <Layers className="w-4 h-4 text-slate-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200"><ShieldCheck className="w-3 h-3"/> Admin</span>;
      case 'professor':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200"><BookOpen className="w-3 h-3"/> Professor</span>;
      case 'monitor':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200"><UserCheck className="w-3 h-3"/> Monitor</span>;
      case 'aluno':
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200"><GraduationCap className="w-3 h-3"/> Aluno</span>;
    }
  };

  const getDeviceIcon = (device: DeviceType) => {
    switch (device) {
      case 'mobile':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"><Smartphone className="w-3 h-3 text-amber-600"/> Celular</span>;
      case 'tablet':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200"><Tablet className="w-3 h-3 text-purple-600"/> Tablet</span>;
      case 'desktop':
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200"><Monitor className="w-3 h-3 text-slate-600"/> Computador</span>;
    }
  };

  // Lista de todos os usuários únicos cadastrados/detectados nas sessões e auth
  const allKnownUsersList = useMemo(() => {
    const userMap = new Map<string, { email: string; name: string; role: UserRole; avatarUrl?: string }>();

    // Inicializa com autorizados
    Object.values(INITIAL_AUTHORIZED_USERS).forEach((u) => {
      userMap.set(u.email.toLowerCase(), {
        email: u.email.toLowerCase(),
        name: u.name,
        role: u.defaultRole,
        avatarUrl: u.avatarUrl,
      });
    });

    // Enriquece com sessões reais
    (summary?.recent_sessions || []).forEach((s) => {
      const email = (s.user_email || '').toLowerCase().trim();
      if (email && !userMap.has(email)) {
        userMap.set(email, {
          email,
          name: s.user_name || email.split('@')[0],
          role: s.user_role || 'aluno',
          avatarUrl: s.avatar_url,
        });
      }
    });

    return Array.from(userMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [summary?.recent_sessions]);

  // Extração e Agrupamento dos Dias Disponíveis no Histórico Geral
  const availableDays = useMemo(() => {
    const daysMap = new Map<string, { dateKey: string; label: string; count: number; usersCount: number; userEmails: Set<string> }>();
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    (summary?.recent_sessions || []).forEach((s) => {
      const dKey = s.started_at ? s.started_at.slice(0, 10) : todayStr;
      if (!daysMap.has(dKey)) {
        let label = new Date(dKey + 'T12:00:00Z').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        if (dKey === todayStr) label = `Hoje (${label})`;
        else if (dKey === yesterdayStr) label = `Ontem (${label})`;

        daysMap.set(dKey, { dateKey: dKey, label, count: 0, usersCount: 0, userEmails: new Set() });
      }
      const item = daysMap.get(dKey)!;
      item.count += 1;
      item.userEmails.add((s.user_email || 'anonimo').toLowerCase().trim());
      item.usersCount = item.userEmails.size;
    });

    return Array.from(daysMap.values()).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [summary?.recent_sessions]);

  // Filtragem Temporal de Sessões
  const todayKey = new Date().toISOString().slice(0, 10);
  const yesterdayKey = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const thirtyDaysAgo = Date.now() - 30 * 86400000;

  const sessionsFilteredByDayAndUser = useMemo(() => {
    let list = summary?.recent_sessions || [];

    // Filtro por Data
    if (selectedDayFilter === 'today') {
      list = list.filter((s) => (s.started_at ? s.started_at.slice(0, 10) === todayKey : true));
    } else if (selectedDayFilter === 'yesterday') {
      list = list.filter((s) => s.started_at && s.started_at.slice(0, 10) === yesterdayKey);
    } else if (selectedDayFilter === '7d') {
      list = list.filter((s) => new Date(s.started_at).getTime() >= sevenDaysAgo);
    } else if (selectedDayFilter === '30d') {
      list = list.filter((s) => new Date(s.started_at).getTime() >= thirtyDaysAgo);
    } else if (selectedDayFilter === 'custom' && customDateInput) {
      list = list.filter((s) => s.started_at && s.started_at.slice(0, 10) === customDateInput);
    } else if (selectedDayFilter !== 'all') {
      list = list.filter((s) => s.started_at && s.started_at.slice(0, 10) === selectedDayFilter);
    }

    // Filtro por Pessoa Específica
    if (selectedUserFilter !== 'all') {
      list = list.filter((s) => (s.user_email || '').toLowerCase().trim() === selectedUserFilter.toLowerCase().trim());
    }

    return list;
  }, [summary?.recent_sessions, selectedDayFilter, customDateInput, selectedUserFilter, todayKey, yesterdayKey, sevenDaysAgo, thirtyDaysAgo]);

  // Filtragem Temporal de Eventos (Feed de Atividades)
  const eventsFilteredByDayAndUser = useMemo(() => {
    let list = summary?.recent_events || [];

    // Filtro por Data
    if (selectedDayFilter === 'today') {
      list = list.filter((e) => (e.timestamp ? e.timestamp.slice(0, 10) === todayKey : true));
    } else if (selectedDayFilter === 'yesterday') {
      list = list.filter((e) => e.timestamp && e.timestamp.slice(0, 10) === yesterdayKey);
    } else if (selectedDayFilter === '7d') {
      list = list.filter((e) => new Date(e.timestamp).getTime() >= sevenDaysAgo);
    } else if (selectedDayFilter === '30d') {
      list = list.filter((e) => new Date(e.timestamp).getTime() >= thirtyDaysAgo);
    } else if (selectedDayFilter === 'custom' && customDateInput) {
      list = list.filter((e) => e.timestamp && e.timestamp.slice(0, 10) === customDateInput);
    } else if (selectedDayFilter !== 'all') {
      list = list.filter((e) => e.timestamp && e.timestamp.slice(0, 10) === selectedDayFilter);
    }

    // Filtro por Pessoa Específica
    if (selectedUserFilter !== 'all') {
      list = list.filter((e) => (e.user_email || '').toLowerCase().trim() === selectedUserFilter.toLowerCase().trim());
    }

    return list;
  }, [summary?.recent_events, selectedDayFilter, customDateInput, selectedUserFilter, todayKey, yesterdayKey, sevenDaysAgo, thirtyDaysAgo]);

  // Métricas do Período Selecionado
  const daySummaryMetrics = useMemo(() => {
    const userEmails = new Set<string>();
    const devices = new Set<string>();
    let totalSec = 0;
    let onlineCount = 0;
    const now = Date.now();
    const threeMinutesAgo = now - 3 * 60 * 1000;

    sessionsFilteredByDayAndUser.forEach((s) => {
      userEmails.add((s.user_email || '').toLowerCase().trim());
      devices.add(`${s.device_type} • ${s.os}`);
      totalSec += s.duration_seconds || 0;
      const sHeartbeatTime = new Date(s.last_heartbeat_at || s.started_at).getTime();
      if (s.is_active && sHeartbeatTime >= threeMinutesAgo) {
        onlineCount += 1;
      }
    });

    let currentDayLabel = 'Hoje';
    if (selectedDayFilter === 'all') {
      currentDayLabel = 'Todo o Histórico Acumulado';
    } else if (selectedDayFilter === 'today') {
      currentDayLabel = `Hoje (${new Date().toLocaleDateString('pt-BR')})`;
    } else if (selectedDayFilter === 'yesterday') {
      currentDayLabel = `Ontem (${new Date(Date.now() - 86400000).toLocaleDateString('pt-BR')})`;
    } else if (selectedDayFilter === '7d') {
      currentDayLabel = 'Últimos 7 dias';
    } else if (selectedDayFilter === '30d') {
      currentDayLabel = 'Últimos 30 dias';
    } else if (selectedDayFilter === 'custom' && customDateInput) {
      currentDayLabel = `Data: ${new Date(customDateInput + 'T12:00:00Z').toLocaleDateString('pt-BR')}`;
    } else {
      const match = availableDays.find((d) => d.dateKey === selectedDayFilter);
      currentDayLabel = match ? match.label : selectedDayFilter;
    }

    if (selectedUserFilter !== 'all') {
      currentDayLabel += ` — Usuário: ${selectedUserFilter}`;
    }

    return {
      currentDayLabel,
      totalUsers: userEmails.size,
      totalSessions: sessionsFilteredByDayAndUser.length,
      totalEvents: eventsFilteredByDayAndUser.length,
      totalDurationMinutes: Math.round(totalSec / 60),
      devicesList: Array.from(devices),
      onlineNowCount: onlineCount,
    };
  }, [sessionsFilteredByDayAndUser, eventsFilteredByDayAndUser, selectedDayFilter, customDateInput, selectedUserFilter, availableDays]);

  // Agrupamento de Sessões por Usuário Único no Período Selecionado
  const groupedUserSessions = useMemo(() => {
    const groupsMap = new Map<string, {
      user_email: string;
      user_name: string;
      user_role: UserRole;
      avatar_url?: string;
      is_online_now: boolean;
      latest_started_at: string;
      latest_heartbeat_at: string;
      latest_device: DeviceType;
      latest_os: string;
      latest_browser: string;
      latest_screen_resolution?: string;
      total_sessions_count: number;
      total_duration_seconds: number;
      total_page_views: number;
      total_events: number;
      sessions: UserSessionLog[];
    }>();

    const now = Date.now();
    const threeMinutesAgo = now - 3 * 60 * 1000;

    sessionsFilteredByDayAndUser.forEach((s) => {
      if (!s || !s.id || s.id.startsWith('sess_seed_')) return;
      const email = (s.user_email || 'anonimo').toLowerCase().trim();
      const avatar = s.avatar_url || INITIAL_AUTHORIZED_USERS[email]?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

      if (!groupsMap.has(email)) {
        groupsMap.set(email, {
          user_email: email,
          user_name: s.user_name || email.split('@')[0],
          user_role: s.user_role || 'aluno',
          avatar_url: avatar,
          is_online_now: false,
          latest_started_at: s.started_at,
          latest_heartbeat_at: s.last_heartbeat_at || s.started_at,
          latest_device: s.device_type,
          latest_os: s.os,
          latest_browser: s.browser,
          latest_screen_resolution: s.screen_resolution,
          total_sessions_count: 1,
          total_duration_seconds: s.duration_seconds || 0,
          total_page_views: s.page_views_count || 1,
          total_events: s.events_count || 0,
          sessions: [s],
        });
      } else {
        const g = groupsMap.get(email)!;
        g.total_sessions_count += 1;
        g.total_duration_seconds += s.duration_seconds || 0;
        g.total_page_views += s.page_views_count || 0;
        g.total_events += s.events_count || 0;
        g.sessions.push(s);
        if (s.avatar_url) g.avatar_url = s.avatar_url;
      }
    });

    groupsMap.forEach((g) => {
      g.sessions.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
      const mostRecentSession = g.sessions[0];
      if (mostRecentSession) {
        const hbTime = new Date(mostRecentSession.last_heartbeat_at || mostRecentSession.started_at).getTime();
        // Está online unicamente se a sessão mais recente for ativa e tiver heartbeat nos últimos 4 minutos
        g.is_online_now = Boolean(mostRecentSession.is_active && (now - hbTime < 4 * 60 * 1000));
        g.latest_started_at = mostRecentSession.started_at;
        g.latest_heartbeat_at = mostRecentSession.last_heartbeat_at || mostRecentSession.started_at;
        g.latest_device = mostRecentSession.device_type;
        g.latest_os = mostRecentSession.os;
        g.latest_browser = mostRecentSession.browser;
        g.latest_screen_resolution = mostRecentSession.screen_resolution;
        g.user_name = mostRecentSession.user_name || g.user_name;
      }
    });

    return Array.from(groupsMap.values())
      .filter((g) => {
        const q = searchUser.toLowerCase();
        const matchQuery =
          g.user_name.toLowerCase().includes(q) ||
          g.user_email.toLowerCase().includes(q) ||
          g.latest_browser.toLowerCase().includes(q) ||
          g.latest_os.toLowerCase().includes(q);
        const matchRole = filterRole === 'all' || g.user_role === filterRole;
        const matchDevice = filterDevice === 'all' || g.latest_device === filterDevice;
        const matchActive = !onlyActiveNow || g.is_online_now;
        return matchQuery && matchRole && matchDevice && matchActive;
      })
      .sort((a, b) => {
        if (a.is_online_now && !b.is_online_now) return -1;
        if (!a.is_online_now && b.is_online_now) return 1;
        return new Date(b.latest_started_at).getTime() - new Date(a.latest_started_at).getTime();
      });
  }, [sessionsFilteredByDayAndUser, searchUser, filterRole, filterDevice, onlyActiveNow]);

  // Agrupamento de Eventos / Feed por Usuário Único no Período Selecionado
  const groupedUserEvents = useMemo(() => {
    const groupsMap = new Map<string, {
      user_email: string;
      user_name: string;
      user_role: UserRole;
      avatar_url?: string;
      is_online_now: boolean;
      latest_event_at: string;
      latest_event: AnalyticsEvent;
      total_events_count: number;
      categories_used: AnalyticsCategory[];
      events: AnalyticsEvent[];
    }>();

    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    eventsFilteredByDayAndUser.forEach((evt) => {
      if (!evt || !evt.id || evt.id.startsWith('evt_seed_')) return;
      const email = (evt.user_email || 'anonimo@lms.local').toLowerCase().trim();
      const userAvatar = INITIAL_AUTHORIZED_USERS[email]?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

      if (!groupsMap.has(email)) {
        groupsMap.set(email, {
          user_email: email,
          user_name: evt.user_name || email.split('@')[0],
          user_role: evt.user_role || 'aluno',
          avatar_url: userAvatar,
          is_online_now: false,
          latest_event_at: evt.timestamp,
          latest_event: evt,
          total_events_count: 1,
          categories_used: [evt.category],
          events: [evt],
        });
      } else {
        const g = groupsMap.get(email)!;
        g.total_events_count += 1;
        if (!g.categories_used.includes(evt.category)) {
          g.categories_used.push(evt.category);
        }
        g.events.push(evt);
      }
    });

    groupsMap.forEach((g) => {
      g.events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const mostRecentEvt = g.events[0];
      if (mostRecentEvt) {
        const evtTime = new Date(mostRecentEvt.timestamp).getTime();
        g.is_online_now = (now - evtTime < 4 * 60 * 1000);
        g.latest_event_at = mostRecentEvt.timestamp;
        g.latest_event = mostRecentEvt;
        g.user_name = mostRecentEvt.user_name || g.user_name;
      }
    });

    return Array.from(groupsMap.values())
      .filter((g) => {
        const q = searchEventUser.toLowerCase();
        const matchQuery =
          g.user_name.toLowerCase().includes(q) ||
          g.user_email.toLowerCase().includes(q);
        const matchRole = filterEventRole === 'all' || g.user_role === filterEventRole;
        const matchCategory =
          eventCategoryFilter === 'all' || g.categories_used.includes(eventCategoryFilter as AnalyticsCategory);
        const matchActive = !onlyActiveNowEvents || g.is_online_now;
        return matchQuery && matchRole && matchCategory && matchActive;
      })
      .sort((a, b) => {
        if (a.is_online_now && !b.is_online_now) return -1;
        if (!a.is_online_now && b.is_online_now) return 1;
        return new Date(b.latest_event_at).getTime() - new Date(a.latest_event_at).getTime();
      });
  }, [eventsFilteredByDayAndUser, searchEventUser, filterEventRole, eventCategoryFilter, onlyActiveNowEvents]);

  // Linha do tempo cronológica global (Live Stream)
  const chronologicalEventStream = useMemo(() => {
    return eventsFilteredByDayAndUser
      .filter((evt) => {
        const q = searchEventUser.toLowerCase();
        const matchQuery =
          evt.user_name.toLowerCase().includes(q) ||
          evt.user_email.toLowerCase().includes(q) ||
          (evt.label && evt.label.toLowerCase().includes(q)) ||
          evt.action.toLowerCase().includes(q);
        const matchRole = filterEventRole === 'all' || evt.user_role === filterEventRole;
        const matchCategory =
          eventCategoryFilter === 'all' || evt.category === eventCategoryFilter;
        return matchQuery && matchRole && matchCategory;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [eventsFilteredByDayAndUser, searchEventUser, filterEventRole, eventCategoryFilter]);

  // Dados do Dossiê do Usuário Selecionado
  const userDossierData: UserDossierHistory | null = useMemo(() => {
    if (!dossierUserEmail || !summary) return null;
    return getUserDetailedHistory(dossierUserEmail, summary.recent_sessions, summary.recent_events);
  }, [dossierUserEmail, summary]);

  if (loading && !summary) {
    return (
      <div className="p-12 bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-xs font-bold text-gray-500">Compilando dados de acesso e telemetria da nuvem...</p>
      </div>
    );
  }

  const topModule = summary?.top_modules?.[0];
  const totalDev = (summary?.device_breakdown.desktop || 0) + (summary?.device_breakdown.mobile || 0) + (summary?.device_breakdown.tablet || 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Banner Principal de Telemetria e Analytics */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-400/30">
            <Zap className="w-4 h-4 text-amber-400" /> Inteligência de Produto & Auditoria de Acessos
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
            <span>Telemetria & Quem Acessou</span>
            {summary?.active_users_now ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                {summary.active_users_now} online agora
              </span>
            ) : null}
          </h2>
          <p className="text-sm text-purple-200/80 max-w-3xl leading-relaxed">
            Todos os acessos e interações dos estudantes e docentes gravados de forma persistente. Analise o fluxo do dia atual, navegue pelo histórico de datas ou examine o dossiê detalhado por pessoa.
          </p>
        </div>

        {/* Ações de Exportação e Atualização */}
        <div className="flex flex-wrap items-center gap-2 z-10 shrink-0">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-white/10 cursor-pointer"
            title="Recarregar Dados em Tempo Real"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>

          <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
            <button
              onClick={handleExportSessions}
              className="px-3 py-1.5 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Exportar tabela de acessos do período em formato CSV"
            >
              <Download className="w-3.5 h-3.5 text-purple-300" />
              <span>Acessos (CSV)</span>
            </button>
            <button
              onClick={handleExportEvents}
              className="px-3 py-1.5 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Exportar eventos de telemetria em formato CSV"
            >
              <Download className="w-3.5 h-3.5 text-blue-300" />
              <span>Feed (CSV)</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Exportar relatório completo em JSON"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Métricas Gerais de Alto Impacto */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Ativos Hoje (DAU)</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{summary?.dau || 0}</div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> {summary?.wau || 0} ativos na semana (WAU)
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total de Sessões</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{summary?.total_sessions || 0}</div>
          <div className="text-[10px] text-gray-500 font-medium">
            {summary?.mau || 0} usuários no mês (MAU)
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Duração Média</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{summary?.avg_session_duration_minutes || 0} min</div>
          <div className="text-[10px] text-gray-500 font-medium">Tempo ativo por sessão</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Módulo Campeão</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-sm font-black text-gray-900 truncate" title={topModule?.label}>
            {topModule ? topModule.label.split('(')[0] : '—'}
          </div>
          <div className="text-[10px] text-rose-600 font-bold">
            {topModule ? `${topModule.percentage}% do uso total` : '—'}
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Acesso Mobile</span>
            <Smartphone className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">
            {totalDev > 0 ? Math.round((((summary?.device_breakdown.mobile || 0) + (summary?.device_breakdown.tablet || 0)) / totalDev) * 100) : 0}%
          </div>
          <div className="text-[10px] text-gray-500 font-medium">Smartphones & Tablets</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BARRA MESTRA DE FILTROS TEMPORAIS & SELEÇÃO DE PESSOA                      */}
      {/* ========================================================================= */}
      <div className="p-4 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl border border-purple-800/40 text-white shadow-lg space-y-4">
        {/* Cabeçalho da Barra de Filtro */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-purple-800/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-purple-200 block">
                Navegação Temporal & Filtro por Usuário
              </span>
              <span className="text-[11px] text-purple-300/80">
                Visualizando: <strong className="text-white font-bold">{daySummaryMetrics.currentDayLabel}</strong>
              </span>
            </div>
          </div>

          {/* Filtro Dropdown de Pessoa / Usuário Específico */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-purple-500/30 text-xs">
              <User className="w-3.5 h-3.5 text-purple-300" />
              <select
                value={selectedUserFilter}
                onChange={(e) => setSelectedUserFilter(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs max-w-[220px]"
              >
                <option value="all" className="bg-slate-900 text-white">Todos os Usuários</option>
                {allKnownUsersList.map((u) => (
                  <option key={u.email} value={u.email} className="bg-slate-900 text-white">
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {selectedUserFilter !== 'all' && (
              <button
                onClick={() => {
                  setDossierUserEmail(selectedUserFilter);
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Abrir Dossiê Completo desta Pessoa"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ver Dossiê</span>
              </button>
            )}
          </div>
        </div>

        {/* Pílulas de Navegação por Dia / Período */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-wrap">
          {/* Pílula: HOJE (DEFAULT) */}
          <button
            type="button"
            onClick={() => {
              setSelectedDayFilter('today');
              setCustomDateInput('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              selectedDayFilter === 'today'
                ? 'bg-purple-500 text-slate-950 font-black shadow-md ring-2 ring-purple-300'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <span>📅 Hoje (Padrão)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              selectedDayFilter === 'today' ? 'bg-slate-950 text-purple-300' : 'bg-slate-700 text-slate-300'
            }`}>
              {availableDays.find(d => d.dateKey === todayKey)?.count || 0}
            </span>
          </button>

          {/* Pílula: ONTEM */}
          <button
            type="button"
            onClick={() => {
              setSelectedDayFilter('yesterday');
              setCustomDateInput('');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              selectedDayFilter === 'yesterday'
                ? 'bg-purple-500 text-slate-950 font-black shadow-md ring-2 ring-purple-300'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <span>Ontem</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              selectedDayFilter === 'yesterday' ? 'bg-slate-950 text-purple-300' : 'bg-slate-700 text-slate-300'
            }`}>
              {availableDays.find(d => d.dateKey === yesterdayKey)?.count || 0}
            </span>
          </button>

          {/* Pílula: ÚLTIMOS 7 DIAS */}
          <button
            type="button"
            onClick={() => {
              setSelectedDayFilter('7d');
              setCustomDateInput('');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              selectedDayFilter === '7d'
                ? 'bg-purple-500 text-slate-950 font-black shadow-md ring-2 ring-purple-300'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <span>Últimos 7 dias</span>
          </button>

          {/* Pílula: ÚLTIMOS 30 DIAS */}
          <button
            type="button"
            onClick={() => {
              setSelectedDayFilter('30d');
              setCustomDateInput('');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              selectedDayFilter === '30d'
                ? 'bg-purple-500 text-slate-950 font-black shadow-md ring-2 ring-purple-300'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <span>Últimos 30 dias</span>
          </button>

          {/* Pílula: TODO O HISTÓRICO */}
          <button
            type="button"
            onClick={() => {
              setSelectedDayFilter('all');
              setCustomDateInput('');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              selectedDayFilter === 'all'
                ? 'bg-purple-500 text-slate-950 font-black shadow-md ring-2 ring-purple-300'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Todo o Histórico</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              selectedDayFilter === 'all' ? 'bg-slate-950 text-purple-300' : 'bg-slate-700 text-slate-300'
            }`}>
              {summary?.recent_sessions.length || 0}
            </span>
          </button>

          {/* Seletor de Data Específica no Calendário */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 shrink-0">
            <CalendarDays className="w-3.5 h-3.5 text-purple-300" />
            <input
              type="date"
              value={customDateInput}
              onChange={(e) => {
                setCustomDateInput(e.target.value);
                if (e.target.value) {
                  setSelectedDayFilter('custom');
                }
              }}
              className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer"
              title="Escolha uma data específica no calendário"
            />
          </div>
        </div>
      </div>

      {/* Sub-navegação do Módulo de Analytics */}
      <div className="flex items-center border-b border-gray-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'sessions'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Quem Acessou (Auditoria de Sessões)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'sessions' ? 'bg-purple-800 text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {sessionsFilteredByDayAndUser.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'events'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-500" />
          <span>Feed de Atividades em Tempo Real</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'events' ? 'bg-purple-800 text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {eventsFilteredByDayAndUser.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Visão Geral & Rankings</span>
        </button>

        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'modules'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Adoção de Funcionalidades</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'insights'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Insights para o Desenvolvimento</span>
          <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-black">
            {summary?.insights.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tele-proximidade')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'tele-proximidade'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Radio className="w-4 h-4 text-violet-500" />
          <span>Tele-Proximidade (TSP)</span>
          <span className="px-1.5 py-0.5 bg-violet-500 text-white rounded-full text-[10px] font-black">TCC</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: QUEM ACESSOU (AUDITORIA DE SESSÕES & LOGINS)                       */}
      {/* ========================================================================= */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {/* Card de Resumo do Período Selecionado */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-extrabold text-gray-400">Usuários Ativos no Período</span>
              <div className="text-xl font-black text-purple-900">{daySummaryMetrics.totalUsers}</div>
              <span className="text-[11px] text-gray-500">
                {daySummaryMetrics.onlineNowCount > 0 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {daySummaryMetrics.onlineNowCount} online agora
                  </span>
                ) : 'Nenhum online agora'}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-extrabold text-gray-400">Sessões Registradas</span>
              <div className="text-xl font-black text-purple-900">{daySummaryMetrics.totalSessions}</div>
              <span className="text-[11px] text-gray-500">entradas na plataforma</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-extrabold text-gray-400">Tempo Ativo Total</span>
              <div className="text-xl font-black text-purple-900">{daySummaryMetrics.totalDurationMinutes} min</div>
              <span className="text-[11px] text-gray-500">acumulado no LMS</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-extrabold text-gray-400">Dispositivos Utilizados</span>
              <div className="text-xs font-bold text-gray-800 truncate" title={daySummaryMetrics.devicesList.join(', ')}>
                {daySummaryMetrics.devicesList.length > 0 ? daySummaryMetrics.devicesList.slice(0, 2).join(', ') : 'PC / Mobile'}
              </div>
              <span className="text-[10px] text-emerald-700 font-bold">✓ Sincronia Multi-Aparelho</span>
            </div>
          </div>

          {/* Barra de Filtros e Busca */}
          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-200">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail, navegador ou sistema operacional..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 outline-none bg-transparent"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer"
              >
                <option value="all">Todos os Perfis</option>
                <option value="aluno">Apenas Alunos</option>
                <option value="professor">Apenas Professores</option>
                <option value="monitor">Apenas Monitores</option>
                <option value="admin">Apenas Administradores</option>
              </select>

              <select
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer"
              >
                <option value="all">Todos os Dispositivos</option>
                <option value="desktop">Apenas Desktop</option>
                <option value="mobile">Apenas Celular</option>
                <option value="tablet">Apenas Tablet</option>
              </select>

              <button
                onClick={() => setOnlyActiveNow(!onlyActiveNow)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  onlyActiveNow
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${onlyActiveNow ? 'bg-white animate-pulse' : 'bg-emerald-500'}`}></span>
                <span>Online Agora</span>
              </button>
            </div>
          </div>

          {/* Tabela de Usuários Agrupados com Histórico Expansível */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-black text-gray-800 uppercase tracking-wider">
                  Usuários com Acesso no Período ({groupedUserSessions.length})
                </span>
              </div>
              <button
                onClick={toggleExpandAll}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 transition flex items-center gap-1 cursor-pointer"
              >
                <span>{expandedUserEmails.size > 0 ? 'Recolher Todos' : 'Expandir Todos'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Usuário / E-mail</th>
                    <th className="p-4">Perfil</th>
                    <th className="p-4">Status de Atividade</th>
                    <th className="p-4">Dispositivo & SO</th>
                    <th className="p-4">Navegador</th>
                    <th className="p-4">Último Acesso</th>
                    <th className="p-4 text-right">Acessos & Tempo</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {groupedUserSessions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400 font-semibold">
                        Nenhum acesso registrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    groupedUserSessions.map((group) => {
                      const isExpanded = expandedUserEmails.has(group.user_email);
                      return (
                        <React.Fragment key={group.user_email}>
                          <tr
                            onClick={() => toggleExpandUser(group.user_email)}
                            className={`hover:bg-purple-50/40 transition cursor-pointer ${
                              isExpanded ? 'bg-purple-50/30' : ''
                            }`}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={group.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                  alt={group.user_name}
                                  className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-100 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-gray-900 truncate max-w-[200px]">{group.user_name}</div>
                                  <div className="text-gray-400 text-[11px] truncate max-w-[200px]">{group.user_email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              {getRoleBadge(group.user_role)}
                            </td>

                            <td className="p-4">
                              {group.is_online_now ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200 animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  Online agora
                                </span>
                              ) : (
                                <span className="text-[11px] text-gray-500 font-medium">
                                  {getRelativeTime(group.latest_heartbeat_at || group.latest_started_at)}
                                </span>
                              )}
                            </td>

                            <td className="p-4">
                              <div className="space-y-0.5">
                                <div>{getDeviceIcon(group.latest_device)}</div>
                                <div className="text-[11px] text-gray-500 font-medium">{group.latest_os}</div>
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="font-semibold text-gray-800">{group.latest_browser}</div>
                              {group.latest_screen_resolution && (
                                <div className="text-[10px] text-gray-400 font-mono">{group.latest_screen_resolution}</div>
                              )}
                            </td>

                            <td className="p-4">
                              <div className="font-bold text-gray-800">
                                {new Date(group.latest_started_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {new Date(group.latest_started_at).toLocaleDateString('pt-BR')}
                              </div>
                            </td>

                            <td className="p-4 text-right">
                              <div className="font-bold text-purple-900">
                                {Math.round(group.total_duration_seconds / 60)} min total
                              </div>
                              <div className="text-[10px] text-gray-500 font-medium">
                                {group.total_sessions_count} {group.total_sessions_count === 1 ? 'sessão' : 'sessões'} • {group.total_page_views} telas
                              </div>
                            </td>

                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => setDossierUserEmail(group.user_email)}
                                  className="px-2.5 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Ver Dossiê e Histórico Completo de Todos os Dias"
                                >
                                  <User className="w-3.5 h-3.5 text-purple-700" />
                                  <span>Dossiê</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => toggleExpandUser(group.user_email)}
                                  className="p-1.5 rounded-xl bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-900 transition cursor-pointer"
                                  title={isExpanded ? 'Recolher sessões' : 'Expandir sessões deste dia'}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-purple-700" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* LINHA EXPANDIDA COM AS SESSÕES DO USUÁRIO NO PERÍODO */}
                          {isExpanded && (
                            <tr className="bg-purple-50/20">
                              <td colSpan={8} className="p-4 sm:p-5">
                                <div className="bg-white rounded-2xl border border-purple-200/80 p-4 shadow-xs space-y-3">
                                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                                      <span className="text-xs font-black text-gray-800">
                                        Sessões de {group.user_name} no Período ({group.sessions.length} registros)
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => setDossierUserEmail(group.user_email)}
                                      className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer underline"
                                    >
                                      <span>Ver histórico completo de todos os dias da pessoa</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left text-[11px]">
                                      <thead className="text-gray-400 uppercase text-[9px] font-black border-b border-gray-100">
                                        <tr>
                                          <th className="pb-2">Data & Hora de Entrada</th>
                                          <th className="pb-2">Duração</th>
                                          <th className="pb-2">Dispositivo / SO</th>
                                          <th className="pb-2">Navegador</th>
                                          <th className="pb-2">Telas & Ações</th>
                                          <th className="pb-2 text-right">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-50">
                                        {group.sessions.map((sess, sIdx) => {
                                          const sessHeartbeat = new Date(sess.last_heartbeat_at || sess.started_at).getTime();
                                          const isSessOnline = Boolean(sess.is_active && sessHeartbeat >= Date.now() - 3 * 60 * 1000);
                                          return (
                                            <tr key={sess.id || sIdx} className="hover:bg-gray-50/80">
                                              <td className="py-2.5 font-bold text-gray-800">
                                                {new Date(sess.started_at).toLocaleDateString('pt-BR')} às{' '}
                                                {new Date(sess.started_at).toLocaleTimeString('pt-BR', {
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                })}
                                              </td>
                                              <td className="py-2.5 font-semibold text-purple-800">
                                                {Math.round((sess.duration_seconds || 0) / 60)} min ({sess.duration_seconds || 0}s)
                                              </td>
                                              <td className="py-2.5 text-gray-600">
                                                {sess.device_type} • {sess.os}
                                              </td>
                                              <td className="py-2.5 text-gray-600">
                                                {sess.browser} {sess.screen_resolution ? `(${sess.screen_resolution})` : ''}
                                              </td>
                                              <td className="py-2.5 text-gray-600">
                                                {sess.page_views_count || 1} telas • {sess.events_count || 0} ações
                                              </td>
                                              <td className="py-2.5 text-right">
                                                {isSessOnline ? (
                                                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                    🟢 Ativa
                                                  </span>
                                                ) : (
                                                  <span className="text-[10px] font-medium text-gray-400">
                                                    Finalizada
                                                  </span>
                                                )}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: FEED DE ATIVIDADES EM TEMPO REAL                                   */}
      {/* ========================================================================= */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {/* Barra de Filtros e Alternância de Visualização */}
          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-200">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar atividades por nome, ação ou disciplina..."
                value={searchEventUser}
                onChange={(e) => setSearchEventUser(e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 outline-none bg-transparent"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Alternador de Modo (Live Stream vs Agrupado) */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setFeedViewMode('stream')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    feedViewMode === 'stream'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Live Stream</span>
                </button>
                <button
                  onClick={() => setFeedViewMode('grouped')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    feedViewMode === 'grouped'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Agrupado por Pessoa</span>
                </button>
              </div>

              <select
                value={eventCategoryFilter}
                onChange={(e) => setEventCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer"
              >
                <option value="all">Todas as Categorias</option>
                <option value="cornell_notes">Caderno Cornell</option>
                <option value="biblioteca">Biblioteca Digital</option>
                <option value="meet">Google Meet</option>
                <option value="drive">Google Drive</option>
                <option value="gravacoes">Gravações de Aula</option>
                <option value="portfolio">Portfólio Mediador</option>
                <option value="rpg">RPG Pastoral</option>
                <option value="checklist">Checklist AV2</option>
                <option value="portal_academico">Portal Acadêmico</option>
                <option value="metacognitivo">Metacognição</option>
              </select>

              <select
                value={filterEventRole}
                onChange={(e) => setFilterEventRole(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer"
              >
                <option value="all">Todos os Perfis</option>
                <option value="aluno">Apenas Alunos</option>
                <option value="professor">Apenas Professores</option>
                <option value="monitor">Apenas Monitores</option>
                <option value="admin">Apenas Administradores</option>
              </select>
            </div>
          </div>

          {/* MODO 1: LIVE STREAM CRONOLÓGICO UNIFICADO */}
          {feedViewMode === 'stream' && (
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-gray-800 uppercase tracking-wider">
                    Linha do Tempo de Atividades em Tempo Real ({chronologicalEventStream.length})
                  </span>
                </div>
                <span className="text-[11px] text-gray-500 font-semibold">
                  Ordenado por instante de execução
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {chronologicalEventStream.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 font-semibold">
                    Nenhuma atividade encontrada com os filtros selecionados.
                  </div>
                ) : (
                  chronologicalEventStream.map((evt, idx) => (
                    <div
                      key={evt.id || idx}
                      className="p-4 hover:bg-purple-50/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <img
                          src={INITIAL_AUTHORIZED_USERS[evt.user_email]?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={evt.user_name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-100 shrink-0 mt-0.5 sm:mt-0"
                        />
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => setDossierUserEmail(evt.user_email)}
                              className="font-bold text-gray-900 hover:text-purple-700 transition truncate max-w-[200px] cursor-pointer text-left"
                            >
                              {evt.user_name}
                            </button>
                            {getRoleBadge(evt.user_role)}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                              {getCategoryIcon(evt.category)}
                              <span className="capitalize">{evt.category.replace('_', ' ')}</span>
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-gray-800">
                            {evt.label || evt.action}
                          </div>

                          {evt.action && evt.action !== evt.label && (
                            <div className="text-[10px] text-gray-400 font-mono">
                              Ação: {evt.action} {evt.metadata && Object.keys(evt.metadata).length > 0 ? `• ${JSON.stringify(evt.metadata)}` : ''}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center sm:flex-col sm:items-end justify-between shrink-0 text-right">
                        <div className="text-xs font-bold text-gray-700">
                          {getRelativeTime(evt.timestamp)}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {new Date(evt.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {new Date(evt.timestamp).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* MODO 2: AGRUPADO POR USUÁRIO */}
          {feedViewMode === 'grouped' && (
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-gray-800 uppercase tracking-wider">
                    Usuários com Atividades Recentes ({groupedUserEvents.length})
                  </span>
                </div>
                <button
                  onClick={toggleExpandAllEvents}
                  className="text-[11px] font-bold text-purple-700 hover:text-purple-900 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>{expandedEventUserEmails.size > 0 ? 'Recolher Todos' : 'Expandir Todos'}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Usuário / E-mail</th>
                      <th className="p-4">Perfil</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Última Atividade</th>
                      <th className="p-4">Módulos Acessados</th>
                      <th className="p-4">Último Registro</th>
                      <th className="p-4 text-right">Total de Ações</th>
                      <th className="p-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {groupedUserEvents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-400 font-semibold">
                          Nenhuma atividade recente encontrada com os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      groupedUserEvents.map((group) => {
                        const isExpanded = expandedEventUserEmails.has(group.user_email);
                        return (
                          <React.Fragment key={group.user_email}>
                            <tr
                              onClick={() => toggleExpandEventUser(group.user_email)}
                              className={`hover:bg-purple-50/40 transition cursor-pointer ${
                                isExpanded ? 'bg-purple-50/30' : ''
                              }`}
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={group.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                    alt={group.user_name}
                                    className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-100 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-bold text-gray-900 truncate max-w-[200px]">{group.user_name}</div>
                                    <div className="text-gray-400 text-[11px] truncate max-w-[200px]">{group.user_email}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="p-4">
                                {getRoleBadge(group.user_role)}
                              </td>

                              <td className="p-4">
                                {group.is_online_now ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Online agora
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-gray-500 font-medium">
                                    {getRelativeTime(group.latest_event_at)}
                                  </span>
                                )}
                              </td>

                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-gray-100 border border-gray-200 shrink-0">
                                    {getCategoryIcon(group.latest_event.category)}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-gray-900 truncate max-w-[180px]">
                                      {group.latest_event.label || group.latest_event.action}
                                    </div>
                                    <div className="text-[10px] text-gray-400 capitalize">
                                      {group.latest_event.category.replace('_', ' ')}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="p-4">
                                <div className="flex items-center gap-1 flex-wrap">
                                  {group.categories_used.map((cat) => (
                                    <div
                                      key={cat}
                                      className="p-1 rounded-md bg-gray-50 border border-gray-200"
                                      title={cat}
                                    >
                                      {getCategoryIcon(cat)}
                                    </div>
                                  ))}
                                </div>
                              </td>

                              <td className="p-4">
                                <div className="font-bold text-gray-800">
                                  {new Date(group.latest_event_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  {new Date(group.latest_event_at).toLocaleDateString('pt-BR')}
                                </div>
                              </td>

                              <td className="p-4 text-right">
                                <div className="font-bold text-purple-900">
                                  {group.total_events_count} {group.total_events_count === 1 ? 'interação' : 'interações'}
                                </div>
                                <div className="text-[10px] text-gray-500 font-medium">
                                  {getRelativeTime(group.latest_event_at)}
                                </div>
                              </td>

                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => setDossierUserEmail(group.user_email)}
                                    className="px-2.5 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                    title="Ver Dossiê e Histórico Completo de Todos os Dias"
                                  >
                                    <User className="w-3.5 h-3.5 text-purple-700" />
                                    <span>Dossiê</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggleExpandEventUser(group.user_email)}
                                    className="p-1.5 rounded-xl bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-900 transition cursor-pointer"
                                    title={isExpanded ? 'Recolher atividades' : 'Expandir atividades'}
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-purple-700" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-500" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* LINHA EXPANDIDA COM TODAS AS ATIVIDADES DETALHADAS DO USUÁRIO */}
                            {isExpanded && (
                              <tr className="bg-purple-50/20">
                                <td colSpan={8} className="p-4 sm:p-5">
                                  <div className="bg-white rounded-2xl border border-purple-200/80 p-4 shadow-xs space-y-3">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                      <div className="flex items-center gap-2">
                                        <Activity className="w-3.5 h-3.5 text-purple-600" />
                                        <span className="text-xs font-black text-gray-800">
                                          Linha do Tempo de {group.user_name} ({group.events.length} registros)
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => setDossierUserEmail(group.user_email)}
                                        className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer underline"
                                      >
                                        <span>Abrir Dossiê da Pessoa</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    <div className="divide-y divide-gray-50">
                                      {group.events.map((evt, eIdx) => (
                                        <div key={evt.id || eIdx} className="py-2.5 flex items-start justify-between gap-3 hover:bg-gray-50/80 px-2 rounded-xl transition">
                                          <div className="flex items-start gap-2.5 min-w-0">
                                            <div className="p-1.5 rounded-lg bg-gray-100 border border-gray-200 shrink-0 mt-0.5">
                                              {getCategoryIcon(evt.category)}
                                            </div>
                                            <div className="space-y-0.5 min-w-0">
                                              <div className="font-bold text-xs text-gray-900 truncate">
                                                {evt.label || evt.action}
                                              </div>
                                              <div className="text-[10px] text-gray-500 flex items-center gap-2 flex-wrap">
                                                <span className="px-1.5 py-0.2 bg-gray-100 rounded text-gray-600 font-medium">
                                                  {evt.category}
                                                </span>
                                                {evt.action && evt.action !== evt.label && (
                                                  <span className="text-gray-400 font-mono">
                                                    ação: {evt.action}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          <div className="text-right shrink-0">
                                            <div className="text-[11px] font-bold text-gray-700">
                                              {getRelativeTime(evt.timestamp)}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-mono">
                                              {new Date(evt.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {new Date(evt.timestamp).toLocaleDateString('pt-BR')}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: VISÃO GERAL & RANKINGS                                             */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span>Adoção por Módulo / Recurso do LMS</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Quais ferramentas do sistema têm gerado maior engajamento entre os alunos e professores
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                {summary?.top_modules.map((mod, idx) => (
                  <div key={mod.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-gray-800">
                        <span className="w-5 h-5 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-mono">
                          {idx + 1}
                        </span>
                        {getCategoryIcon(mod.category)}
                        <span>{mod.label}</span>
                      </div>
                      <div className="flex items-center gap-3 font-semibold text-gray-500">
                        <span>{mod.total_events} interações</span>
                        <span className="font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          {mod.percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                            : idx === 1
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500'
                            : idx === 2
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${Math.max(mod.percentage, 4)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <span>Distribuição de Acessos por Horário do Dia</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Momentos de maior tráfego para agendamento de aulas e monitorias</p>
              </div>

              <div className="grid grid-cols-12 gap-1.5 pt-3 items-end h-32">
                {summary?.peak_hours.filter((_, i) => i % 2 === 0).map((h) => {
                  const maxPeak = Math.max(1, ...summary.peak_hours.map((p) => p.count));
                  const heightPct = Math.round((h.count / maxPeak) * 100);
                  const isNight = h.hour >= 18 && h.hour <= 22;

                  return (
                    <div key={h.hour} className="flex flex-col items-center gap-1.5 h-full justify-end group relative">
                      <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap z-20 pointer-events-none">
                        {h.label}: {h.count} acessos
                      </div>

                      <div className="w-full bg-gray-100 rounded-t-md h-full flex items-end">
                        <div
                          className={`w-full rounded-t-md transition-all ${
                            isNight ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-400 hover:bg-blue-500'
                          }`}
                          style={{ height: `${Math.max(heightPct, 8)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-900">{h.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-600" />
                <span>Dispositivos Utilizados</span>
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Monitor className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-800">Computador / Desktop</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    {summary?.device_breakdown.desktop || 0} ({totalDev > 0 ? Math.round(((summary?.device_breakdown.desktop || 0) / totalDev) * 100) : 0}%)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-900">Celular / Smartphone</span>
                  </div>
                  <span className="text-xs font-black text-amber-950">
                    {summary?.device_breakdown.mobile || 0} ({totalDev > 0 ? Math.round(((summary?.device_breakdown.mobile || 0) / totalDev) * 100) : 0}%)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/70 border border-purple-100">
                  <div className="flex items-center gap-2.5">
                    <Tablet className="w-4 h-4 text-purple-700" />
                    <span className="text-xs font-bold text-purple-900">Tablet / iPad</span>
                  </div>
                  <span className="text-xs font-black text-purple-950">
                    {summary?.device_breakdown.tablet || 0} ({totalDev > 0 ? Math.round(((summary?.device_breakdown.tablet || 0) / totalDev) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Acessos por Perfil de Usuário</span>
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[11px] font-bold text-emerald-800">Alunos</div>
                  <div className="text-xl font-black text-emerald-950 mt-1">{summary?.role_breakdown.aluno || 0}</div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
                  <div className="text-[11px] font-bold text-blue-800">Professores</div>
                  <div className="text-xl font-black text-blue-950 mt-1">{summary?.role_breakdown.professor || 0}</div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-[11px] font-bold text-amber-800">Monitores</div>
                  <div className="text-xl font-black text-amber-950 mt-1">{summary?.role_breakdown.monitor || 0}</div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                  <div className="text-[11px] font-bold text-purple-800">Admins</div>
                  <div className="text-xl font-black text-purple-950 mt-1">{summary?.role_breakdown.admin || 0}</div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Dias com Maior Volume</span>
              </h4>

              <div className="space-y-2">
                {summary?.peak_weekdays.map((d) => (
                  <div key={d.day_name} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">{d.day_name}</span>
                    <span className="font-bold text-gray-900">{d.count} acessos</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: ADOÇÃO DE FUNCIONALIDADES                                          */}
      {/* ========================================================================= */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary?.top_modules.map((mod) => (
            <div key={mod.category} className="p-5 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
                  {getCategoryIcon(mod.category)}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                  mod.trend === 'up'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : mod.trend === 'stable'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {mod.trend === 'up' ? '🔥 Alta Adesão' : mod.trend === 'stable' ? '✨ Estável' : '⚡ Oportunidade'}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-900">{mod.label}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{mod.unique_users} estudantes e docentes únicos</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">Participação no LMS:</span>
                  <span className="font-black text-purple-900">{mod.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${Math.max(mod.percentage, 5)}%` }}
                  ></div>
                </div>
                <div className="text-[11px] text-gray-400 text-right pt-0.5">
                  {mod.total_events} eventos registrados
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 5: INSIGHTS PARA O DESENVOLVIMENTO DO LMS                             */}
      {/* ========================================================================= */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="p-5 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 rounded-3xl border border-amber-200/60 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-gray-900">Motor de Diagnóstico & Recomendações Automáticas</h4>
              <p className="text-xs text-gray-600 mt-0.5">
                Diagnósticos a partir do comportamento real dos usuários para orientar o desenvolvimento contínuo do LMS.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary?.insights.map((ins) => (
              <div key={ins.id} className="p-6 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-3.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      ins.priority === 'high'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : ins.priority === 'medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      Prioridade {ins.priority.toUpperCase()}
                    </span>

                    {ins.metric_value && (
                      <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {ins.metric_value}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-black text-gray-900">{ins.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{ins.description}</p>
                </div>

                <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 space-y-1">
                  <div className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-purple-700" />
                    <span>Recomendação Técnica / Pedagógica:</span>
                  </div>
                  <p className="text-xs text-purple-950 font-medium leading-relaxed">
                    {ins.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 6: TELE-PROXIMIDADE (TSP)                                             */}
      {/* ========================================================================= */}
      {activeTab === 'tele-proximidade' && (
        <div className="bg-white rounded-3xl border border-violet-100 shadow-sm p-6">
          <TeleProximidadeDashboard userEmail="" currentRole="admin" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL / DRAWER: DOSSIÊ COMPLETO DE HISTÓRICO POR PESSOA                   */}
      {/* ========================================================================= */}
      {dossierUserEmail && userDossierData && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-purple-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Cabeçalho do Dossiê */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={userDossierData.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={userDossierData.user_name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-400 shadow-md shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black">{userDossierData.user_name}</h3>
                    {getRoleBadge(userDossierData.user_role)}
                    {userDossierData.is_online_now ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Online agora
                      </span>
                    ) : (
                      <span className="text-[10px] text-purple-200/80 font-medium">
                        Último acesso: {getRelativeTime(userDossierData.latest_access_at)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-purple-200/80 font-medium">{userDossierData.user_email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const csv = exportSessionsCSV(userDossierData.all_sessions);
                    downloadFile(csv, `dossie_acessos_${userDossierData.user_email}.csv`, 'text/csv;charset=utf-8;');
                  }}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/10"
                  title="Exportar dados individuais em CSV"
                >
                  <Download className="w-3.5 h-3.5 text-purple-300" />
                  <span className="hidden sm:inline">Exportar CSV</span>
                </button>

                <button
                  onClick={() => setDossierUserEmail(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="Fechar Dossiê"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Corpo do Dossiê com Scroll */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              {/* Cards de Métricas do Usuário */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Total de Acessos</span>
                  <div className="text-xl font-black text-purple-900">{userDossierData.total_sessions_count}</div>
                  <span className="text-[10px] text-gray-500 font-medium">em {userDossierData.days_accessed_count} dias diferentes</span>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Tempo Total</span>
                  <div className="text-xl font-black text-purple-900">{Math.round(userDossierData.total_duration_seconds / 60)} min</div>
                  <span className="text-[10px] text-gray-500 font-medium">
                    média de {userDossierData.total_sessions_count > 0 ? Math.round(userDossierData.total_duration_seconds / userDossierData.total_sessions_count / 60) : 0} min / sessão
                  </span>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Total de Ações</span>
                  <div className="text-xl font-black text-purple-900">{userDossierData.all_events.length}</div>
                  <span className="text-[10px] text-gray-500 font-medium">interações no LMS</span>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Primeiro Acesso</span>
                  <div className="text-xs font-bold text-gray-800">
                    {new Date(userDossierData.first_access_at).toLocaleDateString('pt-BR')}
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {new Date(userDossierData.first_access_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Módulos Favoritos da Pessoa */}
              {userDossierData.favorite_categories.length > 0 && (
                <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
                  <h4 className="text-xs font-black uppercase text-gray-800 tracking-wider flex items-center gap-1.5">
                    <Sparkle className="w-3.5 h-3.5 text-purple-600" />
                    <span>Módulos Mais Utilizados por Este Usuário</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {userDossierData.favorite_categories.slice(0, 4).map((fav) => (
                      <div key={fav.category} className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-gray-800 truncate">
                            {getCategoryIcon(fav.category)}
                            <span className="capitalize">{fav.category.replace('_', ' ')}</span>
                          </div>
                          <span className="font-black text-purple-900">{fav.percentage}%</span>
                        </div>
                        <div className="text-[10px] text-gray-500">{fav.count} ações registradas</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Abas Internas do Dossiê */}
              <div className="flex items-center border-b border-gray-200 gap-2">
                <button
                  onClick={() => setDossierActiveTab('sessions')}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                    dossierActiveTab === 'sessions'
                      ? 'border-purple-600 text-purple-900 bg-purple-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Histórico de Sessões Dia a Dia ({userDossierData.all_sessions.length})</span>
                </button>

                <button
                  onClick={() => setDossierActiveTab('events')}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                    dossierActiveTab === 'events'
                      ? 'border-purple-600 text-purple-900 bg-purple-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Linha do Tempo de Atividades ({userDossierData.all_events.length})</span>
                </button>
              </div>

              {/* ABA 1 DO DOSSIÊ: HISTÓRICO DE SESSÕES POR DIA */}
              {dossierActiveTab === 'sessions' && (
                <div className="space-y-4">
                  {Object.entries(userDossierData.sessions_by_day)
                    .sort(([dayA], [dayB]) => dayB.localeCompare(dayA))
                    .map(([dayKey, daySessions]) => {
                      const dayLabel = new Date(dayKey + 'T12:00:00Z').toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      });
                      const daySec = daySessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);

                      return (
                        <div key={dayKey} className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 space-y-3">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-purple-600" />
                              <span className="text-xs font-black text-gray-800 capitalize">{dayLabel}</span>
                            </div>
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                              {daySessions.length} {daySessions.length === 1 ? 'acesso' : 'acessos'} • {Math.round(daySec / 60)} min total
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="text-gray-400 uppercase text-[9px] font-black border-b border-gray-100">
                                <tr>
                                  <th className="pb-2">Hora de Entrada</th>
                                  <th className="pb-2">Duração</th>
                                  <th className="pb-2">Dispositivo / SO</th>
                                  <th className="pb-2">Navegador</th>
                                  <th className="pb-2">Telas & Ações</th>
                                  <th className="pb-2 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {daySessions.map((sess, idx) => {
                                  const sessHeartbeat = new Date(sess.last_heartbeat_at || sess.started_at).getTime();
                                  const isSessOnline = Boolean(sess.is_active && sessHeartbeat >= Date.now() - 3 * 60 * 1000);
                                  return (
                                    <tr key={sess.id || idx} className="hover:bg-gray-50">
                                      <td className="py-2 font-bold text-gray-800">
                                        {new Date(sess.started_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                      </td>
                                      <td className="py-2 font-semibold text-purple-800">
                                        {Math.round((sess.duration_seconds || 0) / 60)} min ({sess.duration_seconds || 0}s)
                                      </td>
                                      <td className="py-2 text-gray-600">
                                        {sess.device_type} • {sess.os}
                                      </td>
                                      <td className="py-2 text-gray-600">
                                        {sess.browser} {sess.screen_resolution ? `(${sess.screen_resolution})` : ''}
                                      </td>
                                      <td className="py-2 text-gray-600">
                                        {sess.page_views_count || 1} telas • {sess.events_count || 0} ações
                                      </td>
                                      <td className="py-2 text-right">
                                        {isSessOnline ? (
                                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                            🟢 Ativa
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-medium text-gray-400">Finalizada</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* ABA 2 DO DOSSIÊ: LINHA DO TEMPO DE TODAS AS ATIVIDADES */}
              {dossierActiveTab === 'events' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
                  <div className="divide-y divide-gray-100">
                    {userDossierData.all_events.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-xs">
                        Nenhuma atividade registrada para este usuário.
                      </div>
                    ) : (
                      userDossierData.all_events.map((evt, idx) => (
                        <div key={evt.id || idx} className="py-3 flex items-start justify-between gap-3 hover:bg-gray-50 px-2 rounded-xl transition">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="p-2 rounded-lg bg-gray-100 border border-gray-200 shrink-0 mt-0.5">
                              {getCategoryIcon(evt.category)}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-bold text-xs text-gray-900 truncate">
                                {evt.label || evt.action}
                              </div>
                              <div className="text-[10px] text-gray-500 flex items-center gap-2 flex-wrap">
                                <span className="px-1.5 py-0.2 bg-gray-100 rounded text-gray-600 font-medium capitalize">
                                  {evt.category.replace('_', ' ')}
                                </span>
                                {evt.action && evt.action !== evt.label && (
                                  <span className="text-gray-400 font-mono">
                                    ação: {evt.action}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-[11px] font-bold text-gray-700">
                              {getRelativeTime(evt.timestamp)}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {new Date(evt.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {new Date(evt.timestamp).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
