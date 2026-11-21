'use client';

import React, { useState, useEffect } from 'react';
import { UserRole } from '@/types';
import {
  Pin,
  Sparkles,
  LayoutGrid,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  FlaskConical,
} from 'lucide-react';
import { getNavItemsForRole, NavItemConfig } from '@/config/navigationConfig';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRole, activeTab, onTabChange, userEmail = '' }) => {
  const normalizedEmail = (userEmail || 'sacrasub@gmail.com').toLowerCase().trim();

  // Estado de fixação (persistido no localStorage)
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lms_sidebar_pinned');
      if (stored !== null) return stored === 'true';
    }
    return true;
  });

  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Modo de experiência: 'simple' (Essencial, padrão) ou 'advanced' (Laboratórios / Modo Avançado)
  const [experienceMode, setExperienceMode] = useState<'simple' | 'advanced'>(() => {
    if (typeof window === 'undefined') return 'simple';
    const saved = localStorage.getItem(`lms_experience_mode_${normalizedEmail}`);
    return saved === 'advanced' ? 'advanced' : 'simple';
  });

  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const [isLabsOpen, setIsLabsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(`lms_experience_mode_${normalizedEmail}`);
    setExperienceMode(saved === 'advanced' ? 'advanced' : 'simple');
  }, [normalizedEmail]);

  // Listeners de tour guiado e mudança de modo
  useEffect(() => {
    const handleOpen = () => {
      setIsPinned(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lms_sidebar_pinned', 'true');
      }
    };
    const handleClose = () => {
      setIsPinned(false);
      setIsHovered(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lms_sidebar_pinned', 'false');
      }
    };

    const handleModeChange = (e: Event) => {
      const detail = (e as CustomEvent<'simple' | 'advanced'>).detail;
      if (detail === 'simple' || detail === 'advanced') {
        setExperienceMode(detail);
      }
    };

    window.addEventListener('lms_open_sidebar', handleOpen);
    window.addEventListener('lms_close_sidebar', handleClose);
    window.addEventListener('lms_experience_mode_changed', handleModeChange);

    return () => {
      window.removeEventListener('lms_open_sidebar', handleOpen);
      window.removeEventListener('lms_close_sidebar', handleClose);
      window.removeEventListener('lms_experience_mode_changed', handleModeChange);
    };
  }, []);

  const isExpanded = isPinned || isHovered;

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isPinned;
    setIsPinned(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lms_sidebar_pinned', String(nextState));
    }
  };

  const toggleExperienceMode = () => {
    const next: 'simple' | 'advanced' = experienceMode === 'simple' ? 'advanced' : 'simple';
    setExperienceMode(next);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`lms_experience_mode_${normalizedEmail}`, next);
        window.dispatchEvent(new CustomEvent('lms_experience_mode_changed', { detail: next }));
      } catch (e) {
        console.error('Erro ao salvar modo de experiência:', e);
      }
    }
  };

  const isSacramentoUser =
    normalizedEmail.includes('sacra') ||
    normalizedEmail.includes('cristiano') ||
    currentRole === 'admin';

  const allNavItems = getNavItemsForRole(currentRole, isSacramentoUser);
  const primaryItems = allNavItems.filter((item) => item.group === 'primary');
  const secondaryItems = allNavItems.filter((item) => item.group === 'secondary');
  const labItems = allNavItems.filter((item) => item.group === 'labs');

  // Auto-expande o grupo correspondente se uma aba secundária ou de laboratório estiver ativa
  useEffect(() => {
    if (secondaryItems.some((item) => item.id === activeTab)) {
      setIsMoreOpen(true);
    }
    if (labItems.some((item) => item.id === activeTab)) {
      setIsLabsOpen(true);
    }
  }, [activeTab, currentRole]);

  const renderNavButton = (item: NavItemConfig) => {
    const Icon = item.icon;
    const isActive =
      activeTab === item.id ||
      (item.id === 'admin-dashboard' && activeTab.startsWith('admin-'));

    return (
      <button
        key={item.id}
        data-tour={item.dataTour}
        onClick={() => onTabChange(item.id)}
        title={!isExpanded ? item.label : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group cursor-pointer overflow-hidden ${
          !isExpanded ? 'justify-center' : 'justify-between'
        } ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/80 dark:border-blue-900/50 shadow-xs'
            : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100/80 dark:hover:bg-slate-800/80 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon
            className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'
            }`}
          />
          {isExpanded && (
            <span className="truncate text-left whitespace-nowrap animate-in fade-in duration-200">
              {item.label}
            </span>
          )}
        </div>
        {isExpanded && item.badge && (
          <span
            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md shrink-0 ${
              item.badge === 'AV2'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      data-tour="sidebar-nav"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-gray-200/80 dark:border-slate-800/80 p-3 flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out min-h-[calc(100vh-65px)] z-30 select-none ${
        isExpanded ? 'w-64 shadow-xl md:shadow-none' : 'w-20'
      }`}
    >
      <div className="space-y-4 overflow-y-auto pr-0.5">
        {/* Cabeçalho com Título e Botão de Fixar/Desafixar */}
        <div className="flex items-center justify-between px-1.5 h-7">
          {isExpanded ? (
            <>
              <h2 className="text-[11px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-wider truncate">
                NAVEGAÇÃO ({currentRole.toUpperCase()})
              </h2>
              <button
                onClick={togglePin}
                className={`p-1.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                  isPinned
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 shadow-2xs'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200'
                }`}
                title={
                  isPinned
                    ? 'Barra lateral fixada. Clique para ativar auto-contração no mouse.'
                    : 'Clique para fixar a barra lateral aberta'
                }
              >
                {isPinned ? (
                  <Pin className="w-3.5 h-3.5 fill-blue-600 dark:fill-blue-400 text-blue-600 dark:text-blue-400 rotate-45" />
                ) : (
                  <Pin className="w-3.5 h-3.5" />
                )}
              </button>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <button
                onClick={togglePin}
                className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                title="Fixar barra lateral aberta"
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Lista de Itens de Navegação */}
        <nav className="space-y-1">
          {/* 1. Principais */}
          {primaryItems.map(renderNavButton)}

          {/* 2. Mais ferramentas (Secundários recolhíveis) */}
          {secondaryItems.length > 0 && (
            <div className="pt-2 mt-2 border-t border-gray-100 dark:border-slate-800/80 space-y-1">
              {isExpanded ? (
                <button
                  type="button"
                  onClick={() => setIsMoreOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <span>Mais ferramentas</span>
                  {isMoreOpen ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              ) : (
                <div className="h-px bg-gray-200 dark:bg-slate-800 my-1" />
              )}

              {(isMoreOpen || !isExpanded) && (
                <div className="space-y-1">{secondaryItems.map(renderNavButton)}</div>
              )}
            </div>
          )}

          {/* 3. Laboratórios / Modo Avançado */}
          {labItems.length > 0 && currentRole === 'aluno' && experienceMode === 'advanced' && (
            <div className="pt-2 mt-2 border-t border-violet-200/70 dark:border-violet-900/50 space-y-1">
              {isExpanded && (
                <div className="px-3 py-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  <FlaskConical className="w-3 h-3" />
                  <span>Laboratórios / Avançado</span>
                </div>
              )}
              <div className="space-y-1">{labItems.map(renderNavButton)}</div>
            </div>
          )}

          {labItems.length > 0 && currentRole !== 'aluno' && (
            <div className="pt-2 mt-2 border-t border-gray-100 dark:border-slate-800/80 space-y-1">
              {isExpanded ? (
                <button
                  type="button"
                  onClick={() => setIsLabsOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <FlaskConical className="w-3 h-3" />
                    <span>Laboratórios & TCC</span>
                  </span>
                  {isLabsOpen ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              ) : (
                <div className="h-px bg-gray-200 dark:bg-slate-800 my-1" />
              )}

              {(isLabsOpen || !isExpanded) && (
                <div className="space-y-1">{labItems.map(renderNavButton)}</div>
              )}
            </div>
          )}

          {/* Link Externo Estágio Supervisionado */}
          <div className="pt-2 mt-2 border-t border-gray-100 dark:border-slate-800/80">
            <a
              href="https://estagiosupervisionado.vercel.app/"
              title={!isExpanded ? 'Estágio Supervisionado' : 'Alternar para o Portal do Estágio Supervisionado'}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group overflow-hidden text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 ${
                !isExpanded ? 'justify-center' : 'justify-start'
              }`}
            >
              <ExternalLink className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 text-emerald-600 dark:text-emerald-400" />
              {isExpanded && (
                <span className="truncate text-left whitespace-nowrap">
                  Estágio Supervisionado
                </span>
              )}
            </a>
          </div>
        </nav>
      </div>

      {/* Rodapé Discreto + Alternador Único de Modo Avançado para o Aluno */}
      <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2">
        {currentRole === 'aluno' && (
          <button
            type="button"
            onClick={toggleExperienceMode}
            title={
              experienceMode === 'advanced'
                ? 'Laboratórios ativos — clique para voltar ao Modo Essencial'
                : 'Exibir Laboratórios / Modo Avançado (Metaverso 3D, RPG, Homilética, TCC)'
            }
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
              !isExpanded ? 'justify-center' : 'justify-between'
            } ${
              experienceMode === 'advanced'
                ? 'bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800'
                : 'bg-gray-50 hover:bg-gray-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200/80 dark:border-slate-700'
            }`}
          >
            <span className="flex items-center gap-2 min-w-0">
              {experienceMode === 'advanced' ? (
                <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
              ) : (
                <LayoutGrid className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400 shrink-0" />
              )}
              {isExpanded && (
                <span className="truncate">
                  {experienceMode === 'advanced' ? 'Modo Avançado' : 'Modo Essencial'}
                </span>
              )}
            </span>
            {isExpanded && (
              <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/60 border border-black/5 dark:border-white/10 shrink-0">
                {experienceMode === 'advanced' ? 'ON' : 'Labs'}
              </span>
            )}
          </button>
        )}

        <div
          className={`text-[11px] text-gray-400 dark:text-slate-500 text-center transition-all ${
            !isExpanded ? 'px-0' : 'px-2'
          }`}
        >
          {isExpanded ? 'Koinonia-LMS • Seminário Teológico' : 'v1.0'}
        </div>
      </div>
    </aside>
  );
};
