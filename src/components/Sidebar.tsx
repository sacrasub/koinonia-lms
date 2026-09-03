'use client';

import React, { useState } from 'react';
import { UserRole } from '@/types';
import { 
  LayoutDashboard, GraduationCap, BookOpen, UserCheck, 
  ShieldCheck, Library, CheckSquare, FolderOpen, Compass, 
  Calendar, Layers, HelpCircle, Drama, Archive, SlidersHorizontal, 
  Pin, MessageSquare, Heart, Radio, Flame, Mic, Box, Target
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
    return false; // Padrão: auto-expansível no hover
  });

  const [isHovered, setIsHovered] = useState<boolean>(false);

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

  const getNavItems = () => {
    switch (currentRole) {
      case 'aluno':
        return [
          { id: 'aluno-disciplinas', label: 'Minhas Disciplinas (Estudos)', icon: GraduationCap },
          { id: 'google-agenda', label: 'Google Agenda & Meet (Grade)', icon: Calendar },
          { id: 'plano-estudos', label: 'Plano de Estudos 2026.2', icon: Target },
          { id: 'fluxo-estudos', label: 'Fluxo de Estudos (6 Fases)', icon: Compass },
          { id: 'disciplina-detalhe', label: 'Hub da Disciplina (Matéria)', icon: Layers },
          { id: 'quatro-ds', label: 'Trilha dos Quatro Ds (Jesus)', icon: Flame },
          ...(isSacramentoUser ? [{ id: 'tcc-sacramento', label: 'Painel do TCC (Sacramento)', icon: Target }] : []),
          { id: 'pesquisa-tcc', label: 'Pesquisa de Campo (TCC)', icon: HelpCircle },
          { id: 'homiletica', label: 'Estúdio de Homilética (Pares)', icon: Mic },
          { id: 'metaverso', label: 'Metaverso Teológico (3D)', icon: Box },
          { id: 'aluno-materiais', label: 'Pastas Virtuais & Aulas', icon: FolderOpen },
          { id: 'aluno-caderno', label: 'Caderno Cornell (Notas)', icon: BookOpen },
          { id: 'aluno-checklist', label: 'Checklist & Dashboard AV', icon: CheckSquare },
          { id: 'aluno-portal-2026', label: 'Portal & Calendário 2026.2', icon: Calendar },
          { id: 'rpg-simulador', label: 'Simulador Pastoral RPG', icon: Drama },
          { id: 'comunidade-forum', label: 'Fóruns & Koinonia', icon: MessageSquare },
          { id: 'mural-oracao', label: 'Mural de Oração', icon: Heart },
          { id: 'meu-portfolio', label: 'Meu Portfólio Reflexivo', icon: Archive },
          { id: 'seletor-avaliacao', label: 'Trilha de Avaliação', icon: SlidersHorizontal },
          { id: 'aluno-biblioteca', label: 'Biblioteca Digital', icon: Library },
          { id: 'central-ajuda', label: 'Central de Ajuda (Vídeos)', icon: HelpCircle },
        ];
      case 'professor':
        return [
          { id: 'prof-disciplinas', label: 'Gerenciar Minhas Matérias', icon: BookOpen },
          { id: 'google-agenda', label: 'Google Agenda & Meet (Grade)', icon: Calendar },
          { id: 'plano-estudos', label: 'Plano de Estudos 2026.2', icon: Target },
          { id: 'fluxo-estudos', label: 'Fluxo de Estudos (6 Fases)', icon: Compass },
          { id: 'disciplina-detalhe', label: 'Hub da Disciplina (Visão)', icon: Layers },
          { id: 'quatro-ds', label: 'Trilha dos Quatro Ds (Jesus)', icon: Flame },
          ...(isSacramentoUser ? [{ id: 'tcc-sacramento', label: 'Painel do TCC (Sacramento)', icon: Target }] : []),
          { id: 'pesquisa-tcc', label: 'Pesquisa de Campo (TCC)', icon: HelpCircle },
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
          { id: 'monitor-escala', label: 'Grade & Links de Presença', icon: UserCheck },
          { id: 'google-agenda', label: 'Google Agenda & Meet (Grade)', icon: Calendar },
          { id: 'plano-estudos', label: 'Plano de Estudos 2026.2', icon: Target },
          { id: 'fluxo-estudos', label: 'Fluxo de Estudos (6 Fases)', icon: Compass },
          { id: 'disciplina-detalhe', label: 'Hub da Disciplina', icon: Layers },
          { id: 'quatro-ds', label: 'Trilha dos Quatro Ds (Jesus)', icon: Flame },
          ...(isSacramentoUser ? [{ id: 'tcc-sacramento', label: 'Painel do TCC (Sacramento)', icon: Target }] : []),
          { id: 'pesquisa-tcc', label: 'Pesquisa de Campo (TCC)', icon: HelpCircle },
          { id: 'homiletica', label: 'Estúdio de Homilética (Pares)', icon: Mic },
          { id: 'metaverso', label: 'Metaverso Teológico (3D)', icon: Box },
          { id: 'aluno-materiais', label: 'Pastas Virtuais & Aulas', icon: FolderOpen },
          { id: 'comunidade-forum', label: 'Fóruns & Koinonia', icon: MessageSquare },
          { id: 'mural-oracao', label: 'Mural de Oração', icon: Heart },
          { id: 'portfolios', label: 'Portfólios (Avaliar)', icon: Archive },
          { id: 'tele-proximidade', label: 'Radar de Tele-Proximidade', icon: Radio },
          { id: 'aluno-biblioteca', label: 'Biblioteca Digital', icon: Library },
          { id: 'central-ajuda', label: 'Central de Ajuda (Vídeos)', icon: HelpCircle },
        ];
      case 'admin':
        return [
          { id: 'admin-dashboard', label: 'Painel do Administrador', icon: ShieldCheck },
          { id: 'google-agenda', label: 'Google Agenda & Meet (Grade)', icon: Calendar },
          { id: 'plano-estudos', label: 'Plano de Estudos 2026.2', icon: Target },
          { id: 'fluxo-estudos', label: 'Fluxo de Estudos (6 Fases)', icon: Compass },
          { id: 'disciplina-detalhe', label: 'Hub da Disciplina', icon: Layers },
          { id: 'quatro-ds', label: 'Trilha dos Quatro Ds (Jesus)', icon: Flame },
          ...(isSacramentoUser ? [{ id: 'tcc-sacramento', label: 'Painel do TCC (Sacramento)', icon: Target }] : []),
          { id: 'pesquisa-tcc', label: 'Pesquisa de Campo (TCC)', icon: HelpCircle },
          { id: 'homiletica', label: 'Estúdio de Homilética (Pares)', icon: Mic },
          { id: 'metaverso', label: 'Metaverso Teológico (3D)', icon: Box },
          { id: 'aluno-materiais', label: 'Pastas Virtuais & Aulas', icon: FolderOpen },
          { id: 'comunidade-forum', label: 'Fóruns & Koinonia', icon: MessageSquare },
          { id: 'mural-oracao', label: 'Mural de Oração', icon: Heart },
          { id: 'monitor-escala', label: 'Escala de Monitores 2026.2', icon: Calendar },
          { id: 'aluno-caderno', label: 'Caderno Cornell (Notas)', icon: BookOpen },
          { id: 'aluno-checklist', label: 'Checklist & Dashboard AV', icon: CheckSquare },
          { id: 'aluno-portal-2026', label: 'Portal Acadêmico (Consulta)', icon: Calendar },
          { id: 'aluno-biblioteca', label: 'Biblioteca Digital', icon: Library },
          { id: 'central-ajuda', label: 'Central de Ajuda (Vídeos)', icon: HelpCircle },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside 
      data-tour="sidebar-nav"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white/95 backdrop-blur-md border-r border-gray-200/80 p-3 flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out min-h-[calc(100vh-65px)] z-30 select-none ${
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
              <h2 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider truncate">
                NAVEGAÇÃO ({currentRole.toUpperCase()})
              </h2>
              <button
                onClick={togglePin}
                className={`p-1.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                  isPinned 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-2xs' 
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                }`}
                title={isPinned ? 'Barra lateral fixada. Clique para ativar auto-contração no mouse.' : 'Clique para fixar a barra lateral aberta'}
              >
                {isPinned ? (
                  <Pin className="w-3.5 h-3.5 fill-blue-600 rotate-45" />
                ) : (
                  <Pin className="w-3.5 h-3.5" />
                )}
              </button>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <button
                onClick={togglePin}
                className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition cursor-pointer"
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
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
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

      <div className={`pt-3 border-t border-gray-100 text-[11px] text-gray-400 text-center transition-all ${!isExpanded ? 'px-0' : 'px-2'}`}>
        {isExpanded ? 'Koinonia-LMS • Seminário Teológico' : 'v1.0'}
      </div>
    </aside>
  );
};
