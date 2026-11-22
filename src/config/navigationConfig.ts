import type React from 'react';
import { UserRole } from '@/types';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Library,
  CheckSquare,
  FolderOpen,
  Compass,
  Calendar,
  Layers,
  HelpCircle,
  Drama,
  Archive,
  SlidersHorizontal,
  MessageSquare,
  Heart,
  Radio,
  Flame,
  Mic,
  Box,
  Target,
  Bookmark,
  Award,
  FileText,
} from 'lucide-react';

export type NavGroup = 'primary' | 'secondary' | 'labs';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  group: NavGroup;
  badge?: string;
  dataTour?: string;
  sacramentoOnly?: boolean;
}

const TAB_LABEL_MAP: Record<string, string> = {
  // Aluno
  'aluno-disciplinas': 'Início & Aulas Ao Vivo',
  'operacao-av2': 'Operação AV2 & Simulados',
  'av2': 'Operação AV2 & Simulados',
  'revisao-av2': 'Operação AV2 & Simulados',
  'dossie-av2': 'Operação AV2 & Simulados',
  'aluno-checklist': 'Trabalhos & Prazos',
  'checklist': 'Trabalhos & Prazos',
  'artigos-abnt': 'Criador de Artigos ABNT',
  'criador-abnt': 'Criador de Artigos ABNT',
  'abnt': 'Criador de Artigos ABNT',
  'artigos': 'Criador de Artigos ABNT',
  'disciplina-detalhe': 'Disciplinas & Materiais',
  'aluno-caderno': 'Caderno Cornell',
  'caderno': 'Caderno Cornell',
  'aluno-anotacoes': 'Caderno Cornell',
  'anotacoes': 'Caderno Cornell',
  'cornell': 'Caderno Cornell',
  'aluno-boletim': 'Meu Boletim',
  'boletim': 'Meu Boletim',
  'notas': 'Meu Boletim',
  'meu-boletim': 'Meu Boletim',
  'aluno-biblioteca': 'Biblioteca Digital',
  'biblioteca': 'Biblioteca Digital',
  'google-agenda': 'Agenda Semanal',
  'agenda': 'Agenda Semanal',
  'grade-horaria': 'Agenda Semanal',
  'aluno-materiais': 'Pastas Virtuais (Drive)',
  'prof-materiais': 'Pastas Virtuais & Aulas',
  'admin-materiais': 'Pastas Virtuais & Aulas',
  'materiais': 'Pastas Virtuais',
  'aluno-portal-2026': 'Portal Acadêmico',
  'comunidade-forum': 'Koinonia & Fórum',
  'forum': 'Koinonia & Fórum',
  'koinonia': 'Koinonia & Fórum',
  'mural-oracao': 'Mural de Oração',
  'oracao': 'Mural de Oração',
  'central-ajuda': 'Central de Ajuda',
  'ajuda': 'Central de Ajuda',
  'tutoriais': 'Central de Ajuda',
  // Laboratórios & Avançado
  'plano-estudos': 'Plano de Estudos 2026.2',
  'plano-2026': 'Plano de Estudos 2026.2',
  'cronograma-semestre': 'Plano de Estudos 2026.2',
  'fluxo-estudos': 'Fluxo de Estudos (6 Fases)',
  'estudos': 'Fluxo de Estudos (6 Fases)',
  'ecossistema': 'Fluxo de Estudos (6 Fases)',
  'quatro-ds': 'Trilha dos Quatro Ds (Jesus)',
  '4ds': 'Trilha dos Quatro Ds (Jesus)',
  'quatro_ds': 'Trilha dos Quatro Ds (Jesus)',
  'tcc-sacramento': 'Painel do TCC (Sacramento)',
  'tcc-painel': 'Painel do TCC',
  'pesquisa-tcc': 'Pesquisa de Campo (TCC)',
  'oficina-estudos': 'Oficina de Estudos (TCC)',
  'laboratorio-tcc': 'Oficina de Estudos (TCC)',
  'trilha-estudos': 'Oficina de Estudos (TCC)',
  'oficina-tcc': 'Oficina de Estudos (TCC)',
  'imersao-tcc': 'Oficina de Estudos (TCC)',
  'homiletica': 'Estúdio de Homilética (Pares)',
  'estudio-homiletica': 'Estúdio de Homilética (Pares)',
  'peer-instruction': 'Estúdio de Homilética (Pares)',
  'metaverso': 'Metaverso Teológico (3D)',
  'imersao-3d': 'Metaverso Teológico (3D)',
  'cenarios-3d': 'Metaverso Teológico (3D)',
  'rpg-simulador': 'Simulador Pastoral RPG',
  'rpg': 'Simulador Pastoral RPG',
  'meu-portfolio': 'Meu Portfólio Reflexivo',
  'portfolio': 'Portfólio Reflexivo',
  'portfolios': 'Portfólios (Avaliar)',
  'seletor-avaliacao': 'Trilha de Avaliação',
  'trilha-avaliacao': 'Trilha de Avaliação',
  'tele-proximidade': 'Radar de Tele-Proximidade',
  'radar-tsp': 'Radar de Tele-Proximidade',
  // Professor
  'prof-disciplinas': 'Minhas Matérias',
  'prof-avaliacoes': 'Avaliações (Nativas/Forms)',
  'livro-notas': 'Livro de Notas & Diário',
  'gradebook': 'Livro de Notas & Diário',
  'prof-notas': 'Livro de Notas',
  // Monitor
  'monitor-escala': 'Central do Monitor',
  'monitor-presenca': 'Central do Monitor',
  'monitor-gravador': 'Gravador de Aulas',
  'monitor-incidentes': 'Incidentes',
  // Admin
  'admin-dashboard': 'Painel do Administrador',
  'admin-analytics': 'Painel do Administrador',
  'telemetria': 'Analytics & Telemetria',
  'analytics': 'Analytics & Telemetria',
  'admin-painel': 'Painel Geral',
  'admin-usuarios': 'Gerenciar Usuários & Perfis',
  'usuarios': 'Gerenciar Usuários & Perfis',
  'admin-disciplinas': 'Gerenciar Disciplinas',
  'disciplinas': 'Gerenciar Disciplinas',
  'admin-solicitacoes': 'Solicitações de Acesso',
  'solicitacoes': 'Solicitações de Acesso',
  'admin-tcc': 'Gestão TCC',
  'tcc': 'Gestão TCC',
  // Aliases legados
  'aluno-plano': 'Plano de Estudos',
  'aluno-agenda': 'Grade Semanal',
  'aluno-ia': 'Hub de IA',
  'aluno-homiletica': 'Estúdio de Homilética',
  'aluno-pesquisa': 'Pesquisa de Campo',
  'aluno-tcc': 'Banca de TCC',
  'aluno-metaverso': 'Metaverso Bíblico',
};

export function getTabLabel(tabId: string): string {
  return TAB_LABEL_MAP[tabId] || 'Painel';
}

export function getNavItemsForRole(
  role: UserRole,
  isSacramentoUser: boolean
): NavItemConfig[] {
  const filterSacramento = (items: NavItemConfig[]) =>
    items.filter((item) => !item.sacramentoOnly || isSacramentoUser);

  switch (role) {
    case 'aluno':
      return filterSacramento([
        // Grupo Principal (7 itens essenciais focados no uso real)
        { id: 'aluno-disciplinas', label: 'Início & Aulas Ao Vivo', icon: GraduationCap, group: 'primary', badge: 'Hoje', dataTour: 'nav-disciplinas' },
        { id: 'operacao-av2', label: 'Operação AV2 & Simulados', icon: Flame, group: 'primary', badge: 'AV2' },
        { id: 'aluno-checklist', label: 'Trabalhos & Prazos', icon: CheckSquare, group: 'primary' },
        { id: 'artigos-abnt', label: 'Criador de Artigos ABNT', icon: FileText, group: 'primary', badge: 'ABNT' },
        { id: 'disciplina-detalhe', label: 'Disciplinas & Materiais', icon: Layers, group: 'primary' },
        { id: 'aluno-caderno', label: 'Caderno Cornell', icon: BookOpen, group: 'primary', dataTour: 'nav-caderno' },
        { id: 'aluno-boletim', label: 'Meu Boletim', icon: Award, group: 'primary' },
        { id: 'aluno-biblioteca', label: 'Biblioteca Digital', icon: Library, group: 'primary', dataTour: 'nav-biblioteca' },

        // Grupo Secundário (Mais ferramentas)
        { id: 'google-agenda', label: 'Agenda Semanal', icon: Calendar, group: 'secondary', dataTour: 'nav-agenda' },
        { id: 'aluno-materiais', label: 'Pastas Virtuais (Drive)', icon: FolderOpen, group: 'secondary' },
        { id: 'aluno-portal-2026', label: 'Portal Acadêmico', icon: Compass, group: 'secondary' },
        { id: 'comunidade-forum', label: 'Koinonia & Fórum', icon: MessageSquare, group: 'secondary', dataTour: 'nav-comunidade-forum' },
        { id: 'mural-oracao', label: 'Mural de Oração', icon: Heart, group: 'secondary' },
        { id: 'central-ajuda', label: 'Central de Ajuda', icon: HelpCircle, group: 'secondary' },

        // Grupo Laboratórios / Modo Avançado (0% de uso real — preservado sob demanda)
        { id: 'plano-estudos', label: 'Plano de Estudos 2026.2', icon: Target, group: 'labs' },
        { id: 'fluxo-estudos', label: 'Fluxo de Estudos (6 Fases)', icon: Compass, group: 'labs', dataTour: 'nav-fluxo-estudos' },
        { id: 'quatro-ds', label: 'Trilha dos Quatro Ds (Jesus)', icon: Flame, group: 'labs', dataTour: 'nav-quatro-ds' },
        { id: 'tcc-sacramento', label: 'Painel do TCC (Sacramento)', icon: Target, group: 'labs', sacramentoOnly: true, badge: 'TCC', dataTour: 'nav-tcc-sacramento' },
        { id: 'pesquisa-tcc', label: 'Pesquisa de Campo (TCC)', icon: HelpCircle, group: 'labs' },
        { id: 'oficina-estudos', label: 'Oficina de Estudos (TCC)', icon: Bookmark, group: 'labs' },
        { id: 'homiletica', label: 'Estúdio de Homilética (Pares)', icon: Mic, group: 'labs', dataTour: 'nav-homiletica' },
        { id: 'metaverso', label: 'Metaverso Teológico (3D)', icon: Box, group: 'labs', dataTour: 'nav-metaverso' },
        { id: 'rpg-simulador', label: 'Simulador Pastoral RPG', icon: Drama, group: 'labs' },
        { id: 'meu-portfolio', label: 'Meu Portfólio Reflexivo', icon: Archive, group: 'labs' },
        { id: 'seletor-avaliacao', label: 'Trilha de Avaliação', icon: SlidersHorizontal, group: 'labs' },
      ]);

    case 'professor':
      return filterSacramento([
        { id: 'prof-disciplinas', label: 'Gerenciar Minhas Matérias', icon: BookOpen, group: 'primary', badge: 'Principal', dataTour: 'nav-prof-disciplinas' },
        { id: 'operacao-av2', label: 'Operação AV2 & Simulados', icon: Flame, group: 'primary', badge: 'AV2' },
        { id: 'livro-notas', label: 'Livro de Notas & Diário', icon: GraduationCap, group: 'primary' },
        { id: 'prof-avaliacoes', label: 'Avaliações (Nativas/Forms)', icon: LayoutDashboard, group: 'primary', dataTour: 'nav-prof-avaliacoes' },
        { id: 'disciplina-detalhe', label: 'Hub da Disciplina (Visão)', icon: Layers, group: 'primary' },
        { id: 'aluno-materiais', label: 'Pastas Virtuais & Aulas', icon: FolderOpen, group: 'primary' },

        { id: 'google-agenda', label: 'Agenda & Meet (Grade)', icon: Calendar, group: 'secondary', dataTour: 'nav-agenda' },
        { id: 'aluno-checklist', label: 'Trabalhos e Avaliações', icon: CheckSquare, group: 'secondary' },
        { id: 'artigos-abnt', label: 'Criador de Artigos ABNT', icon: FileText, group: 'secondary', badge: 'ABNT' },
        { id: 'comunidade-forum', label: 'Fóruns & Koinonia', icon: MessageSquare, group: 'secondary', dataTour: 'nav-comunidade-forum' },
        { id: 'mural-oracao', label: 'Mural de Oração', icon: Heart, group: 'secondary' },
        { id: 'aluno-biblioteca', label: 'Biblioteca Digital', icon: Library, group: 'secondary', dataTour: 'nav-biblioteca' },
        { id: 'central-ajuda', label: 'Central de Ajuda (Vídeos)', icon: HelpCircle, group: 'secondary' },

        { id: 'plano-estudos', label: 'Plano de Estudos 2026.2', icon: Target, group: 'labs' },
        { id: 'fluxo-estudos', label: 'Fluxo de Estudos (6 Fases)', icon: Compass, group: 'labs', dataTour: 'nav-fluxo-estudos' },
        { id: 'quatro-ds', label: 'Trilha dos Quatro Ds (Jesus)', icon: Flame, group: 'labs', dataTour: 'nav-quatro-ds' },
        { id: 'tcc-sacramento', label: 'Painel do TCC (Sacramento)', icon: Target, group: 'labs', sacramentoOnly: true, dataTour: 'nav-tcc-sacramento' },
        { id: 'pesquisa-tcc', label: 'Pesquisa de Campo (TCC)', icon: HelpCircle, group: 'labs' },
        { id: 'oficina-estudos', label: 'Oficina de Estudos (TCC)', icon: Bookmark, group: 'labs' },
        { id: 'homiletica', label: 'Estúdio de Homilética (Pares)', icon: Mic, group: 'labs', dataTour: 'nav-homiletica' },
        { id: 'metaverso', label: 'Metaverso Teológico (3D)', icon: Box, group: 'labs', dataTour: 'nav-metaverso' },
        { id: 'rpg-simulador', label: 'Simulador Pastoral RPG', icon: Drama, group: 'labs' },
        { id: 'portfolios', label: 'Portfólios (Avaliar)', icon: Archive, group: 'labs', dataTour: 'nav-portfolios' },
        { id: 'tele-proximidade', label: 'Radar de Tele-Proximidade', icon: Radio, group: 'labs', dataTour: 'nav-tele-proximidade' },
      ]);

    case 'monitor':
      return [
        { id: 'monitor-escala', label: 'Central do Monitor', icon: UserCheck, group: 'primary', badge: 'Principal', dataTour: 'nav-monitor-escala' },
        { id: 'operacao-av2', label: 'Operação AV2 & Simulados', icon: Flame, group: 'primary', badge: 'AV2' },
        { id: 'livro-notas', label: 'Consulta de Diários & Faltas', icon: GraduationCap, group: 'primary' },
        { id: 'aluno-materiais', label: 'Pastas Virtuais & Aulas', icon: FolderOpen, group: 'primary' },
        { id: 'disciplina-detalhe', label: 'Hub da Disciplina', icon: Layers, group: 'primary' },
        { id: 'artigos-abnt', label: 'Criador de Artigos ABNT', icon: FileText, group: 'secondary', badge: 'ABNT' },

        { id: 'google-agenda', label: 'Agenda & Meet (Grade)', icon: Calendar, group: 'secondary', dataTour: 'nav-agenda' },
        { id: 'comunidade-forum', label: 'Fóruns & Koinonia', icon: MessageSquare, group: 'secondary', dataTour: 'nav-comunidade-forum' },
        { id: 'mural-oracao', label: 'Mural de Oração', icon: Heart, group: 'secondary' },
        { id: 'aluno-biblioteca', label: 'Biblioteca Digital', icon: Library, group: 'secondary', dataTour: 'nav-biblioteca' },
        { id: 'central-ajuda', label: 'Central de Ajuda (Vídeos)', icon: HelpCircle, group: 'secondary' },

        { id: 'plano-estudos', label: 'Plano de Estudos 2026.2', icon: Target, group: 'labs' },
        { id: 'fluxo-estudos', label: 'Fluxo de Estudos (6 Fases)', icon: Compass, group: 'labs', dataTour: 'nav-fluxo-estudos' },
        { id: 'quatro-ds', label: 'Trilha dos Quatro Ds (Jesus)', icon: Flame, group: 'labs', dataTour: 'nav-quatro-ds' },
        { id: 'tcc-sacramento', label: 'Painel do TCC', icon: Target, group: 'labs', dataTour: 'nav-tcc-sacramento' },
        { id: 'pesquisa-tcc', label: 'Pesquisa de Campo (TCC)', icon: HelpCircle, group: 'labs' },
        { id: 'oficina-estudos', label: 'Oficina de Estudos (TCC)', icon: Bookmark, group: 'labs' },
        { id: 'homiletica', label: 'Estúdio de Homilética (Pares)', icon: Mic, group: 'labs', dataTour: 'nav-homiletica' },
        { id: 'metaverso', label: 'Metaverso Teológico (3D)', icon: Box, group: 'labs', dataTour: 'nav-metaverso' },
        { id: 'portfolios', label: 'Portfólios (Avaliar)', icon: Archive, group: 'labs', dataTour: 'nav-portfolios' },
        { id: 'tele-proximidade', label: 'Radar de Tele-Proximidade', icon: Radio, group: 'labs', dataTour: 'nav-tele-proximidade' },
      ];

    case 'admin':
      return [
        { id: 'admin-dashboard', label: 'Painel do Administrador', icon: ShieldCheck, group: 'primary', badge: 'Admin', dataTour: 'nav-admin-dashboard' },
        { id: 'operacao-av2', label: 'Operação AV2 & Simulados', icon: Flame, group: 'primary', badge: 'AV2' },
        { id: 'livro-notas', label: 'Livro de Notas & Diário Geral', icon: GraduationCap, group: 'primary' },
        { id: 'admin-usuarios', label: 'Gerenciar Usuários & Perfis', icon: UserCheck, group: 'primary', dataTour: 'nav-admin-usuarios' },
        { id: 'admin-disciplinas', label: 'Gerenciar Disciplinas', icon: GraduationCap, group: 'primary', dataTour: 'nav-admin-disciplinas' },
        { id: 'admin-solicitacoes', label: 'Solicitações de Acesso', icon: CheckSquare, group: 'primary', dataTour: 'nav-admin-solicitacoes' },
        { id: 'monitor-escala', label: 'Escala de Monitores 2026.2', icon: Calendar, group: 'primary' },

        { id: 'google-agenda', label: 'Agenda & Meet (Grade)', icon: Calendar, group: 'secondary', dataTour: 'nav-agenda' },
        { id: 'disciplina-detalhe', label: 'Hub da Disciplina', icon: Layers, group: 'secondary' },
        { id: 'aluno-materiais', label: 'Pastas Virtuais & Aulas', icon: FolderOpen, group: 'secondary' },
        { id: 'aluno-caderno', label: 'Caderno Cornell (Notas)', icon: BookOpen, group: 'secondary', dataTour: 'nav-caderno' },
        { id: 'aluno-checklist', label: 'Trabalhos e Avaliações', icon: CheckSquare, group: 'secondary' },
        { id: 'artigos-abnt', label: 'Criador de Artigos ABNT', icon: FileText, group: 'secondary', badge: 'ABNT' },
        { id: 'aluno-portal-2026', label: 'Portal Acadêmico (Consulta)', icon: Calendar, group: 'secondary' },
        { id: 'comunidade-forum', label: 'Fóruns & Koinonia', icon: MessageSquare, group: 'secondary', dataTour: 'nav-comunidade-forum' },
        { id: 'mural-oracao', label: 'Mural de Oração', icon: Heart, group: 'secondary' },
        { id: 'aluno-biblioteca', label: 'Biblioteca Digital', icon: Library, group: 'secondary', dataTour: 'nav-biblioteca' },
        { id: 'central-ajuda', label: 'Central de Ajuda (Vídeos)', icon: HelpCircle, group: 'secondary' },

        { id: 'tele-proximidade', label: 'Radar de Tele-Proximidade', icon: Radio, group: 'labs', dataTour: 'nav-tele-proximidade' },
        { id: 'plano-estudos', label: 'Plano de Estudos 2026.2', icon: Target, group: 'labs' },
        { id: 'fluxo-estudos', label: 'Fluxo de Estudos (6 Fases)', icon: Compass, group: 'labs', dataTour: 'nav-fluxo-estudos' },
        { id: 'quatro-ds', label: 'Trilha dos Quatro Ds (Jesus)', icon: Flame, group: 'labs', dataTour: 'nav-quatro-ds' },
        { id: 'tcc-sacramento', label: 'Painel do TCC (Coordenação)', icon: Target, group: 'labs', dataTour: 'nav-tcc-sacramento' },
        { id: 'pesquisa-tcc', label: 'Pesquisa de Campo (TCC)', icon: HelpCircle, group: 'labs' },
        { id: 'oficina-estudos', label: 'Oficina de Estudos (TCC)', icon: Bookmark, group: 'labs' },
        { id: 'homiletica', label: 'Estúdio de Homilética (Pares)', icon: Mic, group: 'labs', dataTour: 'nav-homiletica' },
        { id: 'metaverso', label: 'Metaverso Teológico (3D)', icon: Box, group: 'labs', dataTour: 'nav-metaverso' },
        { id: 'portfolios', label: 'Portfólios (Avaliar)', icon: Archive, group: 'labs', dataTour: 'nav-portfolios' },
      ];
  }
}
