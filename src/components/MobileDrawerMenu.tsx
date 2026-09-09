'use client';

import React from 'react';
import { UserRole } from '@/types';
import { 
  X, GraduationCap, Layers, Flame, Mic, Box, FolderOpen, 
  BookOpen, CheckSquare, Compass, Drama, MessageSquare, 
  Heart, Archive, SlidersHorizontal, Library, HelpCircle, 
  UserCheck, ShieldCheck, Calendar, LayoutDashboard, Radio, 
  LogOut, RefreshCw, Edit3, Camera, Target, Moon, Sun, Sparkles
} from 'lucide-react';

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
  if (!isOpen) return null;

  const isSacramentoUser = userEmail.toLowerCase().includes('sacra') || 
                           userEmail.toLowerCase().includes('cristiano') || 
                           currentRole === 'admin';

  const getNavItems = () => {
    switch (currentRole) {
      case 'aluno':
        return [
          { id: 'aluno-disciplinas', label: 'Minhas Disciplinas (Estudos)', icon: GraduationCap, badge: 'Principal' },
          { id: 'fluxo-estudos', label: 'Fluxo de Estudos (6 Fases)', icon: Compass, badge: 'Semanal' },
          { id: 'disciplina-detalhe', label: 'Hub da Disciplina (Matéria)', icon: Layers },
          { id: 'quatro-ds', label: 'Trilha dos Quatro Ds (Jesus)', icon: Flame },
          ...(isSacramentoUser ? [{ id: 'tcc-sacramento', label: 'Painel do TCC (Sacramento)', icon: Target, badge: 'TCC' }] : []),
          { id: 'aluno-materiais', label: 'Pastas Virtuais & Aulas', icon: FolderOpen },
          { id: 'aluno-biblioteca', label: 'Biblioteca Digital Teológica', icon: Library },
          { id: 'aluno-caderno', label: 'Caderno Cornell (Notas)', icon: BookOpen },
          { id: 'aluno-checklist', label: 'Checklist & Dashboard AV', icon: CheckSquare },
          { id: 'aluno-portal-2026', label: 'Portal & Calendário 2026.2', icon: Calendar },
          { id: 'central-ajuda', label: 'Central de Ajuda & Tutoriais', icon: HelpCircle, badge: 'Vídeos' },
          { id: 'homiletica', label: 'Estúdio de Homilética (Pares)', icon: Mic },
          { id: 'metaverso', label: 'Metaverso Teológico (3D)', icon: Box },
          { id: 'rpg-simulador', label: 'Simulador Pastoral RPG', icon: Drama },
          { id: 'comunidade-forum', label: 'Fóruns & Koinonia', icon: MessageSquare },
          { id: 'mural-oracao', label: 'Mural de Oração', icon: Heart },
          { id: 'meu-portfolio', label: 'Meu Portfólio Reflexivo', icon: Archive },
          { id: 'seletor-avaliacao', label: 'Trilha de Avaliação', icon: SlidersHorizontal },
        ];
      case 'professor':
        return [
          { id: 'prof-disciplinas', label: 'Gerenciar Minhas Matérias', icon: BookOpen, badge: 'Principal' },
          { id: 'fluxo-estudos', label: 'Fluxo de Estudos (6 Fases)', icon: Compass, badge: 'Semanal' },
          { id: 'disciplina-detalhe', label: 'Hub da Disciplina', icon: Layers },
          { id: 'prof-avaliacoes', label: 'Avaliações (Nativas/Forms)', icon: LayoutDashboard },
          { id: 'aluno-materiais', label: 'Pastas Virtuais & Aulas', icon: FolderOpen },
          { id: 'aluno-biblioteca', label: 'Biblioteca Digital', icon: Library },
          { id: 'central-ajuda', label: 'Central de Ajuda (Vídeos)', icon: HelpCircle },
          { id: 'portfolios', label: 'Portfólios (Avaliar)', icon: Archive },
          { id: 'tele-proximidade', label: 'Radar de Tele-Proximidade', icon: Radio },
          { id: 'quatro-ds', label: 'Trilha dos Quatro Ds (Jesus)', icon: Flame },
          { id: 'homiletica', label: 'Estúdio de Homilética (Pares)', icon: Mic },
          { id: 'metaverso', label: 'Metaverso Teológico (3D)', icon: Box },
          { id: 'aluno-checklist', label: 'Checklist AV Pessoal', icon: CheckSquare },
          { id: 'comunidade-forum', label: 'Fóruns & Koinonia', icon: MessageSquare },
          { id: 'mural-oracao', label: 'Mural de Oração', icon: Heart },
        ];
      case 'monitor':
        return [
          { id: 'monitor-escala', label: 'Grade & Links de Presença', icon: UserCheck, badge: 'Principal' },
          { id: 'fluxo-estudos', label: 'Fluxo de Estudos (6 Fases)', icon: Compass, badge: 'Semanal' },
          { id: 'disciplina-detalhe', label: 'Hub da Disciplina', icon: Layers },
          { id: 'aluno-materiais', label: 'Pastas Virtuais & Aulas', icon: FolderOpen },
          { id: 'aluno-biblioteca', label: 'Biblioteca Digital', icon: Library },
          { id: 'central-ajuda', label: 'Central de Ajuda (Vídeos)', icon: HelpCircle },
          { id: 'portfolios', label: 'Portfólios (Avaliar)', icon: Archive },
          { id: 'tele-proximidade', label: 'Radar de Tele-Proximidade', icon: Radio },
          { id: 'comunidade-forum', label: 'Fóruns & Koinonia', icon: MessageSquare },
          { id: 'mural-oracao', label: 'Mural de Oração', icon: Heart },
        ];
      case 'admin':
        return [
          { id: 'admin-dashboard', label: 'Painel do Administrador', icon: ShieldCheck, badge: 'Admin' },
          { id: 'fluxo-estudos', label: 'Fluxo de Estudos (6 Fases)', icon: Compass, badge: 'Semanal' },
          { id: 'disciplina-detalhe', label: 'Hub da Disciplina', icon: Layers },
          { id: 'monitor-escala', label: 'Escala de Monitores 2026.2', icon: Calendar },
          { id: 'aluno-materiais', label: 'Pastas Virtuais & Aulas', icon: FolderOpen },
          { id: 'aluno-biblioteca', label: 'Biblioteca Digital', icon: Library },
          { id: 'central-ajuda', label: 'Central de Ajuda (Vídeos)', icon: HelpCircle },
          { id: 'aluno-portal-2026', label: 'Portal Acadêmico', icon: Compass },
          { id: 'aluno-caderno', label: 'Caderno Cornell', icon: BookOpen },
          { id: 'aluno-checklist', label: 'Checklist AV', icon: CheckSquare },
          { id: 'comunidade-forum', label: 'Fóruns & Koinonia', icon: MessageSquare },
          { id: 'mural-oracao', label: 'Mural de Oração', icon: Heart },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop Escurecido */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity cursor-pointer" 
      />

      {/* Drawer Deslizante Lateral */}
      <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300 overflow-hidden">
        
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
                    r === 'aluno' ? '🎓 Aluno' :
                    r === 'monitor' ? '👑 Monitor' :
                    r === 'professor' ? '👨‍🏫 Professor' : '🛡️ Admin';
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
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-2 block mb-1">
            Menu Acadêmico
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'admin-dashboard' && activeTab.startsWith('admin-'));

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-900 border border-blue-200/80 shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Rodapé: Tema, Sincronização e Logout */}
        <div className="p-3 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 space-y-2">
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
            <span>✨ Iniciar Tour Guiado</span>
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
