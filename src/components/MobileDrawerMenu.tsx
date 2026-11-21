'use client';

import React, { useState, useEffect } from 'react';
import { UserRole } from '@/types';
import {
  X,
  LogOut,
  RefreshCw,
  Edit3,
  Camera,
  Moon,
  Sun,
  Sparkles,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  FlaskConical,
  ExternalLink,
} from 'lucide-react';
import { getNavItemsForRole, NavItemConfig } from '@/config/navigationConfig';

interface MobileDrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  userEmail: string;
  userName: string;
  userAvatar: string;
  activeTab: string;
  availableRoles: UserRole[];
  onRoleChange: (role: UserRole) => void;
  onTabChange: (tabId: string) => void;
  onOpenProfile: () => void;
  onLogout?: () => void;
  onManualSync?: () => void;
  isSyncing?: boolean;
}

export const MobileDrawerMenu: React.FC<MobileDrawerMenuProps> = ({
  isOpen,
  onClose,
  currentRole,
  userEmail,
  userName,
  userAvatar,
  activeTab,
  availableRoles,
  onRoleChange,
  onTabChange,
  onOpenProfile,
  onLogout,
  onManualSync,
  isSyncing = false,
}) => {
  const normalizedEmail = (userEmail || 'sacrasub@gmail.com').toLowerCase().trim();

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

    const handleModeChange = (e: Event) => {
      const detail = (e as CustomEvent<'simple' | 'advanced'>).detail;
      if (detail === 'simple' || detail === 'advanced') {
        setExperienceMode(detail);
      }
    };

    window.addEventListener('lms_experience_mode_changed', handleModeChange);
    return () => window.removeEventListener('lms_experience_mode_changed', handleModeChange);
  }, [normalizedEmail]);

  const isSacramentoUser =
    normalizedEmail.includes('sacra') ||
    normalizedEmail.includes('cristiano') ||
    currentRole === 'admin';

  const allNavItems = getNavItemsForRole(currentRole, isSacramentoUser);
  const primaryItems = allNavItems.filter((item) => item.group === 'primary');
  const secondaryItems = allNavItems.filter((item) => item.group === 'secondary');
  const labItems = allNavItems.filter((item) => item.group === 'labs');

  useEffect(() => {
    if (secondaryItems.some((item) => item.id === activeTab)) {
      setIsMoreOpen(true);
    }
    if (labItems.some((item) => item.id === activeTab)) {
      setIsLabsOpen(true);
    }
  }, [activeTab, currentRole]);

  if (!isOpen) return null;

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

  const renderDrawerItem = (item: NavItemConfig) => {
    const Icon = item.icon;
    const isActive =
      activeTab === item.id ||
      (item.id === 'admin-dashboard' && activeTab.startsWith('admin-'));

    return (
      <button
        key={item.id}
        onClick={() => {
          onTabChange(item.id);
          onClose();
        }}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 border border-blue-200/80 dark:border-blue-800 shadow-xs'
            : 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`} />
          <span className="truncate">{item.label}</span>
        </div>
        {item.badge && (
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
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop Escurecido */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      {/* Drawer Deslizante Lateral */}
      <div className="relative w-4/5 max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300 overflow-hidden">
        {/* Cabeçalho do Drawer: Usuário e Botão Fechar */}
        <div className="p-4 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
                ✝
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white block">Koinonia LMS</span>
                <span className="text-[10px] text-blue-200 block">Modo Mobile • 2026.2</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Card do Usuário */}
          <div
            onClick={() => {
              onClose();
              onOpenProfile();
            }}
            className="p-3 bg-white/10 hover:bg-white/15 rounded-2xl border border-white/10 flex items-center gap-3 cursor-pointer transition"
          >
            <div className="relative">
              <img
                src={userAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'}
                alt={userName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-400 shadow-sm"
              />
              <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                <span>{userName || userEmail}</span>
                <Edit3 className="w-3 h-3 text-blue-300 shrink-0" />
              </div>
              <div className="text-[10px] text-blue-200 truncate">{userEmail}</div>
              <div className="text-[9px] font-black uppercase tracking-wider text-amber-300 mt-0.5">
                Visão Atual: {currentRole}
              </div>
            </div>
          </div>

          {/* Seletor de Papéis / Visão no Mobile */}
          {availableRoles.length > 1 && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Alternar Visão:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {availableRoles.map((r) => {
                  const isSel = currentRole === r;
                  const label =
                    r === 'aluno'
                      ? '🎓 Aluno'
                      : r === 'monitor'
                      ? '👑 Monitor'
                      : r === 'professor'
                      ? '👨‍🏫 Professor'
                      : '🛡️ Admin';
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        onRoleChange(r);
                        onClose();
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition text-center ${
                        isSel
                          ? 'bg-blue-500 text-white shadow-sm border border-blue-400'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Lista de Navegação com Scroll */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <span className="text-[10px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-2 block mb-1">
            Menu Principal
          </span>

          {primaryItems.map(renderDrawerItem)}

          {secondaryItems.length > 0 && (
            <div className="pt-2 mt-2 border-t border-gray-100 dark:border-slate-800 space-y-1">
              <button
                type="button"
                onClick={() => setIsMoreOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <span>Mais ferramentas</span>
                {isMoreOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {isMoreOpen && <div className="space-y-1">{secondaryItems.map(renderDrawerItem)}</div>}
            </div>
          )}

          {labItems.length > 0 && currentRole === 'aluno' && experienceMode === 'advanced' && (
            <div className="pt-2 mt-2 border-t border-violet-200 dark:border-violet-900/50 space-y-1">
              <div className="px-3 py-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
                <FlaskConical className="w-3 h-3" />
                <span>Laboratórios / Modo Avançado</span>
              </div>
              <div className="space-y-1">{labItems.map(renderDrawerItem)}</div>
            </div>
          )}

          {labItems.length > 0 && currentRole !== 'aluno' && (
            <div className="pt-2 mt-2 border-t border-gray-100 dark:border-slate-800 space-y-1">
              <button
                type="button"
                onClick={() => setIsLabsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <FlaskConical className="w-3 h-3" />
                  <span>Laboratórios & TCC</span>
                </span>
                {isLabsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {isLabsOpen && <div className="space-y-1">{labItems.map(renderDrawerItem)}</div>}
            </div>
          )}

          <div className="pt-2 mt-2 border-t border-gray-100 dark:border-slate-800">
            <a
              href="https://estagiosupervisionado.vercel.app/"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
            >
              <ExternalLink className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Estágio Supervisionado</span>
            </a>
          </div>
        </div>

        {/* Rodapé: Modo Avançado, Tour, Tema, Sincronização e Logout */}
        <div className="p-3 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 space-y-2">
          {currentRole === 'aluno' && (
            <button
              type="button"
              onClick={toggleExperienceMode}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                experienceMode === 'advanced'
                  ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-800 dark:text-violet-200 border-violet-200 dark:border-violet-800'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700'
              }`}
            >
              <span className="flex items-center gap-2">
                {experienceMode === 'advanced' ? (
                  <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                ) : (
                  <LayoutGrid className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                )}
                <span>
                  {experienceMode === 'advanced' ? 'Laboratórios / Avançado' : 'Modo Essencial'}
                </span>
              </span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-900">
                {experienceMode === 'advanced' ? 'ON' : 'OFF'}
              </span>
            </button>
          )}

          {/* Botão de Iniciar Tour Guiado no Celular */}
          <button
            onClick={() => {
              onClose();
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('koinonia_start_tour', { detail: { force: true, role: currentRole } }));
              }, 250);
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition active:scale-98 shadow-md border border-amber-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Iniciar Tour Guiado</span>
          </button>

          {/* Alternador Modo Escuro (Mobile) */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                const isCurrentlyDark = document.documentElement.classList.contains('dark');
                if (isCurrentlyDark) {
                  document.documentElement.classList.remove('dark');
                  localStorage.setItem('lms_theme_mode', 'light');
                } else {
                  document.documentElement.classList.add('dark');
                  localStorage.setItem('lms_theme_mode', 'dark');
                }
                window.dispatchEvent(new CustomEvent('lms_theme_changed', { detail: { isDark: !isCurrentlyDark } }));
              }
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 border border-gray-200 dark:border-slate-700 text-xs font-bold transition active:scale-98 shadow-2xs"
          >
            <Moon className="w-3.5 h-3.5 block dark:hidden" />
            <Sun className="w-3.5 h-3.5 hidden dark:block text-amber-400" />
            <span className="dark:hidden">Ativar Modo Escuro (Dark Mode)</span>
            <span className="hidden dark:inline">Ativar Modo Claro (Light Mode)</span>
          </button>

          {onManualSync && (
            <button
              onClick={() => {
                onManualSync();
                onClose();
              }}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-slate-700 text-xs font-bold transition active:scale-98 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando Nuvem...' : 'Sincronizar Dados com Supabase'}</span>
            </button>
          )}

          {onLogout && (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 text-xs font-bold transition active:scale-98"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da Conta (Logout)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
