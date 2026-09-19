'use client';

import React, { useState, useEffect } from 'react';
import { UserRole } from '@/types';
import { 
  LayoutDashboard, GraduationCap, BookOpen, UserCheck, 
  ShieldCheck, Library, CheckSquare, FolderOpen, Compass, 
  Calendar, Layers, HelpCircle, Drama, Archive, SlidersHorizontal, 
  Pin, MessageSquare, Heart, Radio, Flame, Mic, Box, Target, Bookmark,
  Sparkles, LayoutGrid
} from 'lucide-react';


interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRole, activeTab, onTabChange, userEmail = '' }) => {
  // Estado de fixação (persistido no localStorage)
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lms_sidebar_pinned');
      if (stored !== null) return stored === 'true';
    }
    // A navegação deve iniciar aberta e ser fechada após o tour guiado
    return true;
  });

  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Modo de experiência: 'simple' (Essencial) ou 'advanced' (Imersivo)
  // Lido do localStorage e atualizado via evento customizado disparado pelo AlunoPanel
  const [experienceMode, setExperienceMode] = useState<'simple' | 'advanced'>(() => {
    if (typeof window === 'undefined') return 'simple';
    const normalizedEmail = userEmail.toLowerCase().trim() || 'sacrasub@gmail.com';
    const saved = localStorage.getItem(`lms_experience_mode_${normalizedEmail}`);
    return saved === 'advanced' ? 'advanced' : 'simple';
  });

  // Listener para controle dinâmico do tour guiado (abre no início do tour e fecha ao concluir)
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

    // Listener para mudança de modo (disparado pelo AlunoPanel ao alternar)
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

  // A barra fica expandida se estiver fixada OU se o mouse estiver sobre ela
  const isExpanded = isPinned || isHovered;

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isPinned;
    setIsPinned(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lms_sidebar_pinned', String(nextState));
    }
  };

  const isSacramentoUser = userEmail.toLowerCase().includes('sacra') || 
                           userEmail.toLowerCase().includes('cristiano') || 
                           currentRole === 'admin';

  const getNavItems = (): { id: string; label: string; icon: React.ElementType; essential?: boolean }[] => {
    switch (currentRole) {
      case 'aluno':
        return [
          { id: 'aluno-disciplinas', label: 'Painel Acadêmico', icon: GraduationCap, essential: true },
          { id: 'disciplina-detalhe', label: 'Minhas Disciplinas', icon: Layers, essential: true },
          { id: 'google-agenda', label: 'Agenda', icon: Calendar, essential: true },
          { id: 'aluno-materiais', label: 'Pastas Virtuais', icon: FolderOpen, essential: true },
          { id: 'aluno-caderno', label: 'Caderno de Anotações', icon: BookOpen, essential: true },
          { id: 'aluno-checklist', label: 'Trabalhos e Avaliações', icon: CheckSquare, essential: true },
          { id: 'aluno-portal-2026', label: 'Portal Acadêmico', icon: Calendar, essential: true },
          { id: 'comunidade-forum', label: 'Koinonia', icon: MessageSquare, essential: true },
          { id: 'aluno-biblioteca', label: 'Biblioteca Digital', icon: Library, essential: true },
          { id: 'central-ajuda', label: 'Central de Ajuda (Vídeos)', icon: HelpCircle, essential: true },
          // --- Modo Imersivo ---
          { id: 'plano-estudos', label: 'Plano de Estudos 2026.2', icon: Target, essential: false },
          { id: 'fluxo-estudos', label: 'Fluxo de Estudos (6 Fases)', icon: Compass, essential: false },
          { id: 'quatro-ds', label: 'Trilha dos Quatro Ds (Jesus)', icon: Flame, essential: false },
          ...(isSacramentoUser ? [{ id: 'tcc-sacramento', label: 'Painel do TCC (Sacramento)', icon: Target, essential: false }] : []),
          { id: 'pesquisa-tcc', label: 'Pesquisa de Campo (TCC)', icon: HelpCircle, essential: false },
          { id: 'oficina-estudos', label: 'Oficina de Estudos (TCC)', icon: Bookmark, essential: false },
          { id: 'homiletica', label: 'Estúdio de Homilética (Pares)', icon: Mic, essential: false },
          { id: 'metaverso', label: 'Metaverso Teológico (3D)', icon: Box, essential: false },
          { id: 'rpg-simulador', label: 'Simulador Pastoral RPG', icon: Drama, essential: false },
          { id: 'mural-oracao', label: 'Mural de Oração', icon: Heart, essential: false },
          { id: 'meu-portfolio', label: 'Meu Portfólio Reflexivo', icon: Archive, essential: false },
          { id: 'seletor-avaliacao', label: 'Trilha de Avaliação', icon: SlidersHorizontal, essential: false },
        ];
      case 'professor':
        return [
          { id: 'prof-disciplinas', label: 'Gerenciar Minhas Matérias', icon: BookOpen },
          { id: 'google-agenda', label: 'Agenda & Meet (Grade)', icon: Calendar },
          { id: 'plano-estudos', label: 'Plano de Estudos 2026.2', icon: Target },
          { id: 'fluxo-estudos', label: 'Fluxo de Estudos (6 Fases)', icon: Compass },
          { id: 'disciplina-detalhe', label: 'Hub da Disciplina (Visão)', icon: Layers },
          { id: 'quatro-ds', label: 'Trilha dos Quatro Ds (Jesus)', icon: Flame },
          ...(isSacramentoUser ? [{ id: 'tcc-sacramento', label: 'Painel do TCC (Sacramento)', icon: Target }] : []),
          { id: 'pesquisa-tcc', label: 'Pesquisa de Campo (TCC)', icon: HelpCircle },
          { id: 'oficina-estudos', label: 'Oficina de Estudos (TCC)', icon: Bookmark },
          { id: 'homiletica', label: 'Estúdio de Homilética (Pares)', icon: Mic },
          { id: 'metaverso', label: 'Metaverso Teológico (3D)', icon: Box },
          { id: 'aluno-materiais', label: 'Pastas Virtuais & Aulas', icon: FolderOpen },
          { id: 'comunidade-forum', label: 'Fóruns & Koinonia', icon: MessageSquare },
          { id: 'mural-oracao', label: 'Mural de Oração', icon: Heart },
          { id: 'prof-avaliacoes', label: 'Avaliações (Nativas/Forms)', icon: LayoutDashboard },
          { id: 'aluno-checklist', label: 'Checklist & Dashboard AV Pessoal', icon: CheckSquare },
          { id: 'rpg-simulador', label: 'Simulador Pastoral RPG', icon: Drama },
          { id: 'portfolios', label: 'Portfólios (Avaliar)', icon: Archive },
          { id: 'tele-proximidade', label: 'Radar de Tele-Proximidade', icon: Radio },
          { id: 'aluno-biblioteca', label: 'Biblioteca Digital', icon: Library },
          { id: 'central-ajuda', label: 'Central de Ajuda (Vídeos)', icon: HelpCircle },
        ];
      case 'monitor':
        return [
          { id: 'monitor-escala', label: '⚡ Central do Monitor', icon: UserCheck },
          { id: 'aluno-materiais', label: 'Pastas Virtuais & Aulas', icon: FolderOpen },
          { id: 'google-agenda', label: 'Agenda & Meet (Grade)', icon: Calendar },
          { id: 'plano-estudos', label: 'Plano de Estudos 2026.2', icon: Target },
          { id: 'fluxo-estudos', label: 'Fluxo de Estudos (6 Fases)', icon: Compass },
          { id: 'disciplina-detalhe', label: 'Hub da Disciplina', icon: Layers },
          { id: 'quatro-ds', label: 'Trilha dos Quatro Ds (Jesus)', icon: Flame },
          { id: 'tcc-sacramento', label: 'Painel do TCC', icon: Target },
          { id: 'pesquisa-tcc', label: 'Pesquisa de Campo (TCC)', icon: HelpCircle },
          { id: 'oficina-estudos', label: 'Oficina de Estudos (TCC)', icon: Bookmark },
          { id: 'homiletica', label: 'Estúdio de Homilética (Pares)', icon: Mic },
          { id: 'metaverso', label: 'Metaverso Teológico (3D)', icon: Box },
          { id: 'comunidade-forum', label: 'Fóruns & Koinonia', icon: MessageSquare },
          { id: 'mural-oracao', label: 'Mural de Oração', icon: Heart },
          { id: 'portfolios', label: 'Portfólios (Avaliar)', icon: Archive },
          { id: 'tele-proximidade', label: 'Radar de Tele-Proximidade', icon: Radio },
          { id: 'aluno-biblioteca', label: 'Biblioteca Digital', icon: Library },
          { id: 'central-ajuda', label: 'Central de Ajuda (Vídeos)', icon: HelpCircle },
        ];
      case 'admin':
        return [
          // --- GESTÃO DO SISTEMA (ADMIN) ---
          { id: 'admin-dashboard', label: '🛡 Painel do Administrador (Analytics)', icon: ShieldCheck },
          { id: 'admin-usuarios', label: '👥 Gerenciar Usuários & Perfis', icon: UserCheck },
          { id: 'admin-disciplinas', label: '📚 Gerenciar Disciplinas', icon: GraduationCap },
          { id: 'admin-solicitacoes', label: '📋 Solicitações de Acesso', icon: CheckSquare },
          { id: 'monitor-escala', label: '📅 Escala de Monitores 2026.2', icon: Calendar },
          { id: 'tele-proximidade', label: '📡 Radar de Tele-Proximidade', icon: Radio },
          // --- RECURSOS PEDAGÓGICOS ---
          { id: 'google-agenda', label: 'Agenda & Meet (Grade)', icon: Calendar },
          { id: 'plano-estudos', label: 'Plano de Estudos 2026.2', icon: Target },
          { id: 'fluxo-estudos', label: 'Fluxo de Estudos (6 Fases)', icon: Compass },
          { id: 'disciplina-detalhe', label: 'Hub da Disciplina', icon: Layers },
          { id: 'quatro-ds', label: 'Trilha dos Quatro Ds (Jesus)', icon: Flame },
          { id: 'tcc-sacramento', label: 'Painel do TCC (Coordenação)', icon: Target },
          { id: 'pesquisa-tcc', label: 'Pesquisa de Campo (TCC)', icon: HelpCircle },
          { id: 'oficina-estudos', label: 'Oficina de Estudos (TCC)', icon: Bookmark },
          { id: 'homiletica', label: 'Estúdio de Homilética (Pares)', icon: Mic },
          { id: 'metaverso', label: 'Metaverso Teológico (3D)', icon: Box },
          { id: 'aluno-materiais', label: 'Pastas Virtuais & Aulas', icon: FolderOpen },
          { id: 'comunidade-forum', label: 'Fóruns & Koinonia', icon: MessageSquare },
          { id: 'mural-oracao', label: 'Mural de Oração', icon: Heart },
          { id: 'aluno-caderno', label: 'Caderno Cornell (Notas)', icon: BookOpen },
          { id: 'aluno-checklist', label: 'Checklist & Dashboard AV', icon: CheckSquare },
          { id: 'aluno-portal-2026', label: 'Portal Acadêmico (Consulta)', icon: Calendar },
          { id: 'aluno-biblioteca', label: 'Biblioteca Digital', icon: Library },
          { id: 'portfolios', label: 'Portfólios (Avaliar)', icon: Archive },
          { id: 'central-ajuda', label: 'Central de Ajuda (Vídeos)', icon: HelpCircle },
        ];
    }
  };

  const allNavItems = getNavItems() ?? [];

  // Filtra itens com base no modo de experiência (apenas para o perfil 'aluno')
  const navItems = currentRole === 'aluno' && experienceMode === 'simple'
    ? allNavItems.filter((item) => item.essential !== false)
    : allNavItems;

  return (
    <aside 
      data-tour="sidebar-nav"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-gray-200/80 dark:border-slate-800/80 p-3 flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out min-h-[calc(100vh-65px)] z-30 select-none ${
        isExpanded 
          ? 'w-64 shadow-xl md:shadow-none' 
          : 'w-20'
      }`}
    >
      <div className="space-y-4">
        {/* Cabeçalho com Título e Botão de Fixar/Desafixar */}
        <div className="flex items-center justify-between px-1.5 h-7">
          {isExpanded ? (
            <>
              <h2 className="text-[11px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-wider truncate">
                NAVEGAÇÃO ({currentRole.toUpperCase()})
              </h2>
              <div className="flex items-center gap-1">
                {/* Indicador visual do modo ativo (só para o aluno) */}
                {currentRole === 'aluno' && (
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black border transition-all ${
                      experienceMode === 'advanced'
                        ? 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800'
                        : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                    title={experienceMode === 'advanced' ? 'Modo Imersivo ativo' : 'Modo Essencial ativo'}
                  >
                    {experienceMode === 'advanced'
                      ? <><Sparkles className="w-2.5 h-2.5" /><span>Imersivo</span></>
                      : <><LayoutGrid className="w-2.5 h-2.5" /><span>Essencial</span></>
                    }
                  </span>
                )}
                <button
                  onClick={togglePin}
                  className={`p-1.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                    isPinned 
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 shadow-2xs' 
                      : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200'
                  }`}
                  title={isPinned ? 'Barra lateral fixada. Clique para ativar auto-contração no mouse.' : 'Clique para fixar a barra lateral aberta'}
                >
                  {isPinned ? (
                    <Pin className="w-3.5 h-3.5 fill-blue-600 dark:fill-blue-400 text-blue-600 dark:text-blue-400 rotate-45" />
                  ) : (
                    <Pin className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'admin-dashboard' && activeTab.startsWith('admin-'));
            const dataTourAttr = item.id === 'aluno-biblioteca'
              ? 'nav-biblioteca'
              : (item.id === 'disciplina-detalhe' || item.id === 'aluno-disciplinas')
              ? 'nav-disciplinas'
              : item.id === 'prof-disciplinas'
              ? 'nav-prof-disciplinas'
              : item.id === 'prof-avaliacoes'
              ? 'nav-prof-avaliacoes'
              : item.id === 'monitor-escala'
              ? 'nav-monitor-escala'
              : item.id === 'admin-dashboard'
              ? 'nav-admin-dashboard'
              : item.id === 'admin-usuarios'
              ? 'nav-admin-usuarios'
              : item.id === 'admin-disciplinas'
              ? 'nav-admin-disciplinas'
              : item.id === 'admin-solicitacoes'
              ? 'nav-admin-solicitacoes'
              : item.id === 'tcc-sacramento'
              ? 'nav-tcc-sacramento'
              : item.id === 'tele-proximidade'
              ? 'nav-tele-proximidade'
              : item.id === 'portfolios'
              ? 'nav-portfolios'
              : item.id === 'comunidade-forum'
              ? 'nav-comunidade-forum'
              : item.id === 'fluxo-estudos'
              ? 'nav-fluxo-estudos'
              : item.id === 'quatro-ds'
              ? 'nav-quatro-ds'
              : item.id === 'homiletica'
              ? 'nav-homiletica'
              : item.id === 'metaverso'
              ? 'nav-metaverso'
              : item.id === 'aluno-caderno'
              ? 'nav-caderno'
              : item.id === 'google-agenda'
              ? 'nav-agenda'
              : undefined;

            return (
              <button
                key={item.id}
                data-tour={dataTourAttr}
                onClick={() => onTabChange(item.id)}
                title={!isExpanded ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer overflow-hidden ${
                  !isExpanded ? 'justify-center' : 'justify-start'
                } ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/80 dark:border-blue-900/50 shadow-xs'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100/80 dark:hover:bg-slate-800/80 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'}`} />
                {isExpanded && (
                  <span className="truncate text-left whitespace-nowrap animate-in fade-in duration-200">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={`pt-3 border-t border-gray-100 dark:border-slate-800 text-[11px] text-gray-400 dark:text-slate-500 text-center transition-all ${!isExpanded ? 'px-0' : 'px-2'}`}>
        {isExpanded ? 'Koinonia-LMS • Seminário Teológico' : 'v1.0'}
      </div>
    </aside>
  );
};
