'use client';

import React, { useState, useEffect } from 'react';
import { UserRole } from '@/types';
import { 
  BookOpen, UserCheck, ShieldCheck, GraduationCap, LogOut, 
  RefreshCw, Check, Camera, Edit3, HelpCircle, Menu, Bell, Moon, Sun
} from 'lucide-react';
import { getAuthorizedUserInfo, syncRbacFromCloud } from '@/lib/authConfig';
import { fetchStudentData, subscribeToStudentSync } from '@/services/studentSyncService';
import { fetchGravacoesFromCloud } from '@/services/gravacoesService';
import { uploadLocalSessionsToCloud } from '@/services/telemetryService';
import { getUnreadUpdatesCount } from '@/services/systemUpdatesService';
import { UserProfileModal } from '@/components/UserProfileModal';
import { SystemUpdatesModal } from '@/components/SystemUpdatesModal';
import { MobileDrawerMenu } from '@/components/MobileDrawerMenu';
import { useDeviceMode } from '@/hooks/useDeviceMode';

interface NavbarProps {
  currentRole: UserRole;
  userEmail: string;
  onRoleChange: (role: UserRole) => void;
  onLogout?: () => void;
  onProfileUpdated?: () => void;
  onTabChange?: (tabId: string) => void;
  activeTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentRole, 
  userEmail, 
  onRoleChange, 
  onLogout, 
  onProfileUpdated,
  onTabChange,
  activeTab = 'aluno-disciplinas'
}) => {
  const { isMobile, isTablet } = useDeviceMode();

  const normalizedEmail = (userEmail || 'sacrasub@gmail.com').toLowerCase().trim();
  const authInfo = getAuthorizedUserInfo(normalizedEmail);
  const userConfig = authInfo.user;
  
  const availableRoles: UserRole[] = userConfig?.roles || ['aluno'];

  const [syncing, setSyncing] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUpdatesModalOpen, setIsUpdatesModalOpen] = useState(false);
  const [unreadUpdatesCount, setUnreadUpdatesCount] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('lms_theme_mode') === 'dark';
    }
    return false;
  });

  const toggleDarkMode = () => {
    if (typeof window === 'undefined') return;
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('lms_theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lms_theme_mode', 'light');
    }
    window.dispatchEvent(new CustomEvent('lms_theme_changed', { detail: { isDark: nextMode } }));
  };

  useEffect(() => {
    const updateUnread = () => {
      setUnreadUpdatesCount(getUnreadUpdatesCount(normalizedEmail));
    };
    updateUnread();

    const handleUpdatesUpdated = () => updateUnread();
    window.addEventListener('lms_system_updates_updated', handleUpdatesUpdated);
    window.addEventListener('lms_read_updates_updated', handleUpdatesUpdated);

    return () => {
      window.removeEventListener('lms_system_updates_updated', handleUpdatesUpdated);
      window.removeEventListener('lms_read_updates_updated', handleUpdatesUpdated);
    };
  }, [normalizedEmail]);

  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`lms_profile_${normalizedEmail}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.avatarUrl) return parsed.avatarUrl;
        }
      } catch (e) {}
    }
    return userConfig?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80';
  });

  const [displayName, setDisplayName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`lms_profile_${normalizedEmail}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.name) return parsed.name;
        }
      } catch (e) {}
    }
    return userConfig?.name || normalizedEmail;
  });

  useEffect(() => {
    const unsubscribe = subscribeToStudentSync(normalizedEmail, (data) => {
      const prof = data.portalProfile || {};
      const latestAuth = getAuthorizedUserInfo(normalizedEmail).user;
      
      const bestAvatar = prof.avatarUrl || latestAuth?.avatarUrl;
      const bestName = prof.name || latestAuth?.name;
      
      if (bestAvatar) setAvatarUrl(bestAvatar);
      if (bestName) setDisplayName(bestName);
    });

    return () => {
      unsubscribe();
    };
  }, [normalizedEmail]);

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      await Promise.allSettled([
        fetchStudentData(normalizedEmail, true),
        fetchGravacoesFromCloud(true),
        syncRbacFromCloud(true),
        uploadLocalSessionsToCloud(),
      ]);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lms_student_sync_updated', { detail: { email: normalizedEmail } }));
        window.dispatchEvent(new CustomEvent('lms_rbac_updated'));
      }
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 2500);
    } catch (e) {
      console.error('Erro na sincronização manual:', e);
    } finally {
      setSyncing(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200"><ShieldCheck className="w-3 h-3"/> Admin</span>;
      case 'professor':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200"><BookOpen className="w-3 h-3"/> Professor</span>;
      case 'monitor':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200"><UserCheck className="w-3 h-3"/> Monitor</span>;
      case 'aluno':
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200"><GraduationCap className="w-3 h-3"/> Aluno</span>;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass-header px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between shadow-sm border-b border-gray-200/80 dark:border-slate-800/80 transition-colors">
        
        {/* LADO ESQUERDO: Botão Menu (Mobile) + Logotipo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botão Menu Hambúrguer no Mobile / Tablet */}
          <button
            data-tour="btn-mobile-menu"
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 -ml-1 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 md:hidden transition cursor-pointer"
            title="Abrir Menu Lateral de Navegação"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-md shrink-0 border border-indigo-300/40 bg-slate-900 flex items-center justify-center">
            <img src="/logo-koinonia-lms.png" alt="Logo Oficial Koinonia LMS" className="w-full h-full object-cover" />
          </div>

          <div>
            <h1 className="text-sm sm:text-lg font-extrabold text-gray-900 dark:text-white leading-tight flex items-center gap-1.5">
              <span>Koinonia LMS</span>
              {isMobile && (
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 md:hidden">
                  {currentRole}
                </span>
              )}
            </h1>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium hidden sm:block">Seminário Teológico Congregacional • Semestre 2026.2</p>
          </div>
        </div>

        {/* LADO DIREITO: Ações Rápidas Adaptativas */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Botão do Sininho de Atualizações do Sistema */}
          <button
            data-tour="btn-atualizacoes"
            onClick={() => setIsUpdatesModalOpen(true)}
            className={`relative p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs border flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              unreadUpdatesCount > 0
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-900 dark:from-blue-950/40 dark:to-indigo-950/40 dark:text-blue-200 border-blue-300 dark:border-blue-800 ring-2 ring-blue-400/20'
                : 'bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700 hover:border-gray-300'
            }`}
            title={unreadUpdatesCount > 0 ? `${unreadUpdatesCount} novas atualizações do LMS!` : 'Atualizações e Novidades do LMS'}
          >
            <div className="relative flex items-center justify-center">
              <Bell className={`w-4 h-4 ${unreadUpdatesCount > 0 ? 'text-blue-600 animate-bounce' : 'text-gray-500 dark:text-slate-400'}`} />
              {unreadUpdatesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-black shadow-xs animate-pulse">
                  {unreadUpdatesCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline font-bold">
              {unreadUpdatesCount > 0 ? 'Novidades' : 'Atualizações'}
            </span>
          </button>

          {/* Botão de Ajuda & Tutoriais */}
          <button
            data-tour="btn-ajuda"
            onClick={() => {
              if (onTabChange) {
                onTabChange('central-ajuda');
              } else if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('lms_change_tab', { detail: 'central-ajuda' }));
              }
            }}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs border bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800/50 hover:border-purple-300 cursor-pointer"
            title="Central de Ajuda & Tutoriais em Vídeo"
          >
            <HelpCircle className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0" />
            <span className="hidden md:inline">Ajuda & Vídeos</span>
          </button>

          {/* Botão de Sincronização em Nuvem (Compacto no Mobile) */}
          <button
            data-tour="btn-sincronizar"
            onClick={handleManualSync}
            disabled={syncing}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs border cursor-pointer active:scale-95 ${
              syncing
                ? 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700 ring-2 ring-blue-200 animate-pulse'
                : showSyncSuccess
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-200'
                : 'bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-slate-700 hover:border-blue-300'
            }`}
            title={syncing ? 'Sincronizando dados com a nuvem (Supabase)...' : showSyncSuccess ? 'Nuvem Atualizada!' : 'Sincronizar Dados'}
          >
            {syncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
            ) : showSyncSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            )}
            <span className="hidden md:inline">
              {syncing ? 'Sincronizando...' : showSyncSuccess ? 'Nuvem Atualizada!' : 'Sincronizar'}
            </span>
          </button>

          {/* Botão Alternar Modo Escuro / Dark Mode */}
          <button
            data-tour="dark-mode-toggle"
            onClick={toggleDarkMode}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs border bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95 flex items-center gap-1.5"
            title={isDarkMode ? 'Mudar para Modo Claro (Light)' : 'Mudar para Modo Escuro (Dark Mode)'}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline text-[11px] font-bold">
              {isDarkMode ? 'Claro' : 'Escuro'}
            </span>
          </button>

          {/* Seletor de Perfil do Usuário Autenticado (Visível apenas em Desktop) */}
          {availableRoles.length > 1 && (
            <div data-tour="role-selector" className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase text-gray-400 dark:text-slate-400 px-1.5 hidden lg:inline">Visão:</span>
              {availableRoles.map((r: UserRole) => {
                const isSelected = currentRole === r;
                const getRoleLabel = () => {
                  switch (r) {
                    case 'aluno': return '🎓 Aluno';
                    case 'monitor': return '👑 Monitor';
                    case 'professor': return '👨‍🏫 Professor';
                    case 'admin': return '🛡️ Admin';
                  }
                };
                return (
                  <button
                    key={r}
                    onClick={() => onRoleChange(r)}
                    className={`px-2.5 sm:px-3 py-1 text-[11px] font-extrabold rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-900 text-white shadow-xs border border-blue-900 dark:bg-blue-600 dark:border-blue-600'
                        : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-slate-700'
                    }`}
                    title={`Alternar para visão de ${r}`}
                  >
                    <span>{getRoleLabel()}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Informações do Usuário Ativo - Clique na Foto/Nome para Editar Perfil */}
          <div className="flex items-center gap-2 sm:gap-3 border-l border-gray-200 dark:border-slate-800 pl-1.5 sm:pl-3">
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 cursor-pointer group p-1 rounded-xl hover:bg-blue-50/80 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-blue-200 dark:hover:border-slate-700"
              title="Clique para editar seu cadastro e foto de perfil"
            >
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-600 shadow-sm transition"
                />
                <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition">
                  <Camera className="w-3 h-3" />
                </div>
              </div>

              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-gray-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition truncate max-w-[150px] flex items-center gap-1">
                  <span>{displayName}</span>
                  <Edit3 className="w-3 h-3 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition" />
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {getRoleBadge(currentRole)}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 sm:p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                title="Encerrar Sessão / Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Drawer Deslizante Lateral Mobile / Tablet */}
      <MobileDrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentRole={currentRole}
        userEmail={normalizedEmail}
        userName={displayName}
        userAvatar={avatarUrl}
        activeTab={activeTab}
        availableRoles={availableRoles}
        onRoleChange={onRoleChange}
        onTabChange={(tab) => {
          if (onTabChange) onTabChange(tab);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={onLogout}
        onManualSync={handleManualSync}
        isSyncing={syncing}
      />

      {/* Modal de Cadastro/Edição de Perfil */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userEmail={normalizedEmail}
        onProfileUpdated={() => {
          if (onProfileUpdated) onProfileUpdated();
        }}
      />

      {/* Modal de Atualizações & Novidades do LMS (Sininho) */}
      <SystemUpdatesModal
        isOpen={isUpdatesModalOpen}
        onClose={() => setIsUpdatesModalOpen(false)}
        userEmail={normalizedEmail}
      />
    </>
  );
};
