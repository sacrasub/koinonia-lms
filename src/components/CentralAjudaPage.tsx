'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  HelpCircle, Video, Play, Search, Plus, Edit3, Trash2, CheckCircle2, 
  ExternalLink, Sparkles, BookOpen, UserCheck, GraduationCap, ShieldCheck, 
  Layers, Clock, Copy, Check, Filter, RefreshCw, Smartphone, ChevronRight, X
} from 'lucide-react';
import { TutorialVideoItem, TutorialAudience, UserRole } from '@/types';
import { 
  getAllTutorials, 
  saveTutorial, 
  deleteTutorial, 
  resetToDefaultTutorials, 
  syncTutorialsFromSupabase 
} from '@/services/ajudaService';
import { VideoPlayerModal } from '@/components/VideoPlayerModal';
import { TutorialRecorderModal } from '@/components/TutorialRecorderModal';
import { 
  getEmbedVideoUrl, 
  getNativeAppOrDirectLink, 
  isDirectVideoUrl, 
  getVideoSourceType 
} from '@/lib/videoUtils';

interface CentralAjudaPageProps {
  userEmail?: string;
  currentRole?: UserRole;
  onTabChange?: (tab: string) => void;
}

export const CentralAjudaPage: React.FC<CentralAjudaPageProps> = ({
  userEmail = 'sacrasub@gmail.com',
  currentRole = 'aluno',
  onTabChange,
}) => {
  const normalizedEmail = (userEmail || '').toLowerCase().trim();
  const isAdmin = currentRole === 'admin';
  const isMonitor = currentRole === 'monitor';
  const canManage = currentRole === 'admin' || currentRole === 'monitor';

  const [tutorials, setTutorials] = useState<TutorialVideoItem[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<TutorialAudience | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal de Gravação & Recorte (Trimmer) do Tutorial
  const [activeRecorderTutorial, setActiveRecorderTutorial] = useState<TutorialVideoItem | null>(null);

  // Modal de Vídeo Player
  const [activeVideoPlayer, setActiveVideoPlayer] = useState<{
    isOpen: boolean;
    tutorial: TutorialVideoItem | null;
  }>({
    isOpen: false,
    tutorial: null,
  });

  // Modal de Edição / Criação
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingTutorial, setEditingTutorial] = useState<TutorialVideoItem | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formAudience, setFormAudience] = useState<TutorialAudience>('aluno');
  const [formCategory, setFormCategory] = useState<string>('Primeiros Passos');
  const [formDuration, setFormDuration] = useState<string>('01:30');
  const [formVideoUrl, setFormVideoUrl] = useState<string>('');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState<string>('');
  const [formTopicsText, setFormTopicsText] = useState<string>('');
  const [formScriptSummary, setFormScriptSummary] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = () => {
    const list = getAllTutorials();
    setTutorials(list);
  };

  useEffect(() => {
    loadData();
    syncTutorialsFromSupabase().then((list) => {
      if (list && list.length > 0) setTutorials(list);
    });

    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<TutorialVideoItem[]>;
      if (custom.detail) setTutorials(custom.detail);
      else loadData();
    };

    window.addEventListener('lms_tutoriais_updated', handleUpdate);
    return () => window.removeEventListener('lms_tutoriais_updated', handleUpdate);
  }, []);

  // Filtros com RBAC Estrito (Alunos só veem vídeos de alunos)
  const filteredTutorials = useMemo(() => {
    return tutorials.filter((tut) => {
      // 1. Regra Supremamente Estrita de Audiência por Perfil
      if (currentRole === 'aluno') {
        if (tut.audience !== 'aluno' && tut.audience !== 'todos') {
          return false; // Aluno NUNCA vê vídeos de monitor ou professor
        }
      } else if (currentRole === 'professor') {
        if (tut.audience !== 'professor' && tut.audience !== 'todos') {
          return false;
        }
      } else if (currentRole === 'monitor') {
        if (tut.audience !== 'monitor' && tut.audience !== 'aluno' && tut.audience !== 'todos') {
          return false;
        }
      }

      // 2. Filtro da Aba Selecionada (se admin ou monitor)
      const matchesAudience = 
        selectedAudience === 'todos' 
          ? true 
          : tut.audience === selectedAudience || tut.audience === 'todos';

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = 
        !q ||
        tut.title.toLowerCase().includes(q) ||
        tut.description.toLowerCase().includes(q) ||
        tut.category.toLowerCase().includes(q) ||
        (tut.topics && tut.topics.some((t) => t.toLowerCase().includes(q)));

      return matchesAudience && matchesQuery;
    });
  }, [tutorials, selectedAudience, searchQuery, currentRole]);

  // Contagens por perfil
  const countTodos = tutorials.length;
  const countAlunos = tutorials.filter((t) => t.audience === 'aluno' || t.audience === 'todos').length;
  const countMonitores = tutorials.filter((t) => t.audience === 'monitor' || t.audience === 'todos').length;
  const countProfessores = tutorials.filter((t) => t.audience === 'professor' || t.audience === 'todos').length;

  const handleOpenAddModal = () => {
    setEditingTutorial(null);
    setFormTitle('');
    setFormDescription('');
    setFormAudience(currentRole === 'professor' ? 'professor' : currentRole === 'monitor' ? 'monitor' : 'aluno');
    setFormCategory('Primeiros Passos');
    setFormDuration('01:30');
    setFormVideoUrl('');
    setFormThumbnailUrl('');
    setFormTopicsText('');
    setFormScriptSummary('');
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (tut: TutorialVideoItem) => {
    setEditingTutorial(tut);
    setFormTitle(tut.title);
    setFormDescription(tut.description);
    setFormAudience(tut.audience);
    setFormCategory(tut.category);
    setFormDuration(tut.duration);
    setFormVideoUrl(tut.video_url);
    setFormThumbnailUrl(tut.thumbnail_url || '');
    setFormTopicsText(tut.topics ? tut.topics.join('\n') : '');
    setFormScriptSummary(tut.script_summary || '');
    setIsEditModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Informe o título do tutorial.');
      return;
    }

    const topicsArray = formTopicsText
      .split('\n')
      .map((t) => t.trim().replace(/^[•\-\*]\s*/, ''))
      .filter((t) => t.length > 0);

    const item: TutorialVideoItem = {
      id: editingTutorial ? editingTutorial.id : `tut-${Date.now()}`,
      title: formTitle.trim(),
      description: formDescription.trim(),
      audience: formAudience,
      category: formCategory.trim() || 'Geral',
      duration: formDuration.trim() || '01:30',
      video_url: formVideoUrl.trim() || 'https://drive.google.com/file/d/1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO/view',
      thumbnail_url: formThumbnailUrl.trim() || undefined,
      topics: topicsArray.length > 0 ? topicsArray : ['Visão geral do recurso'],
      script_summary: formScriptSummary.trim() || undefined,
      order: editingTutorial ? editingTutorial.order : tutorials.length + 1,
      author_name: editingTutorial?.author_name || (currentRole === 'admin' ? 'Administração' : 'Coordenação'),
      updated_at: new Date().toISOString().slice(0, 10),
    };

    saveTutorial(item);
    setIsEditModalOpen(false);
    showToast(editingTutorial ? 'Tutorial atualizado com sucesso!' : 'Novo tutorial cadastrado com sucesso!');
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza de que deseja remover este vídeo tutorial?')) {
      deleteTutorial(id);
      showToast('Tutorial removido com sucesso.');
      loadData();
    }
  };

  const handleOpenRecorder = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lms_open_recorder'));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700/60 backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 font-medium text-sm">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            ✓
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BANNER PRINCIPAL COM GRADIENTE PREMIUM */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest bg-blue-500/30 text-blue-200 border border-blue-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Central de Ajuda & Onboarding</span>
              </span>
              <span className="text-[10px] font-bold text-blue-300/80">• Vídeos Curtos em HD</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Como Utilizar a Plataforma Koinonia LMS
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Assista a tutoriais rápidos e objetivos (1 a 3 minutos) ensinando cada funcionalidade da plataforma para <strong>Alunos</strong>, <strong>Monitores</strong> e <strong>Professores</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const initialTab = currentRole === 'professor' 
                  ? 'prof-disciplinas' 
                  : currentRole === 'monitor' 
                  ? 'monitor-escala' 
                  : currentRole === 'admin' 
                  ? 'admin-dashboard' 
                  : 'aluno-disciplinas';
                if (onTabChange) onTabChange(initialTab);
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('koinonia_start_tour', { detail: { force: true, role: currentRole } }));
                  window.dispatchEvent(new CustomEvent('lms_start_tutorial', { detail: { force: true, role: currentRole } }));
                }, 100);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95 border border-amber-300"
              title="Iniciar passo a passo explicativo interativo da plataforma"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>✨ Iniciar Tour Guiado</span>
            </button>

            {canManage && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveRecorderTutorial(tutorials[0] || null)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer border border-red-400"
                  title="Gravar a tela do computador diretamente pelo gravador LMS com recorte de início e fim"
                >
                  <Video className="w-4 h-4" />
                  <span>🔴 Gravar & Recortar Vídeo</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer border border-blue-400"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Novo Tutorial</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS POR PERFIL E BUSCA */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Abas de Perfil Condicionais ao RBAC */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {currentRole === 'aluno' && (
              <div className="px-3.5 py-2 rounded-xl text-xs font-black bg-blue-700 text-white shadow-xs flex items-center gap-2 shrink-0">
                <GraduationCap className="w-4 h-4" />
                <span>Tutoriais em Vídeo para Alunos ({countAlunos})</span>
              </div>
            )}

            {currentRole === 'professor' && (
              <div className="px-3.5 py-2 rounded-xl text-xs font-black bg-purple-800 text-white shadow-xs flex items-center gap-2 shrink-0">
                <BookOpen className="w-4 h-4" />
                <span>Tutoriais para Professores ({countProfessores})</span>
              </div>
            )}

            {currentRole === 'monitor' && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedAudience('monitor')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                    selectedAudience === 'monitor'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Para Monitores ({countMonitores})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAudience('aluno')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                    selectedAudience === 'aluno'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Para Alunos ({countAlunos})</span>
                </button>
              </>
            )}

            {currentRole === 'admin' && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedAudience('todos')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                    selectedAudience === 'todos'
                      ? 'bg-blue-950 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Todos os Tutoriais ({countTodos})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAudience('aluno')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                    selectedAudience === 'aluno'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Para Alunos ({countAlunos})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAudience('monitor')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                    selectedAudience === 'monitor'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Para Monitores ({countMonitores})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAudience('professor')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                    selectedAudience === 'professor'
                      ? 'bg-purple-800 text-white shadow-xs'
                      : 'bg-purple-50 text-purple-900 hover:bg-purple-100'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Para Professores ({countProfessores})</span>
                </button>
              </>
            )}
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por tema (Meet, Cornell, Presença...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* GRID DE VÍDEOS TUTORIAIS */}
      {filteredTutorials.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 space-y-3">
          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-extrabold text-gray-800 text-sm">Nenhum tutorial encontrado</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Tente buscar por outros termos ou limpe o filtro para ver todos os vídeos disponíveis.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedAudience('todos');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold"
          >
            Ver Todos os Tutoriais
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTutorials.map((tut, index) => {
            const audienceBadge = 
              tut.audience === 'aluno' ? { bg: 'bg-blue-100 text-blue-900 border-blue-200', label: 'Aluno', icon: GraduationCap } :
              tut.audience === 'monitor' ? { bg: 'bg-emerald-100 text-emerald-900 border-emerald-200', label: 'Monitor', icon: UserCheck } :
              tut.audience === 'professor' ? { bg: 'bg-purple-100 text-purple-900 border-purple-200', label: 'Professor', icon: BookOpen } :
              { bg: 'bg-slate-100 text-slate-900 border-slate-200', label: 'Geral', icon: Layers };

            const AudienceIcon = audienceBadge.icon;

            return (
              <div
                key={tut.id}
                className="bg-white rounded-3xl border border-gray-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Cabeçalho do Card com Miniatura */}
                <div>
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={tut.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'}
                      alt={tut.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                    {/* Botão Play Central */}
                    <button
                      type="button"
                      onClick={() => setActiveVideoPlayer({ isOpen: true, tutorial: tut })}
                      className="absolute inset-0 flex items-center justify-center group/btn cursor-pointer"
                      title="Assistir Tutorial"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/90 group-hover/btn:bg-blue-500 group-hover/btn:scale-110 text-white flex items-center justify-center shadow-xl backdrop-blur-sm transition-all duration-200">
                        <Play className="w-6 h-6 fill-current translate-x-0.5" />
                      </div>
                    </button>

                    {/* Badges do Topo */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 shadow-xs ${audienceBadge.bg}`}>
                        <AudienceIcon className="w-3 h-3" />
                        <span>{audienceBadge.label}</span>
                      </span>
                      <span className="text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700/80 px-2 py-0.5 rounded-full">
                        {tut.category}
                      </span>
                    </div>

                    {/* Duração no Rodapé da Imagem */}
                    <div className="absolute bottom-3 right-3">
                      <span className="text-[11px] font-mono font-bold bg-slate-950/90 text-white border border-slate-700/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{tut.duration}</span>
                      </span>
                    </div>
                  </div>

                  {/* Corpo do Card */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-900 transition leading-snug">
                      {tut.title}
                    </h3>

                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {tut.description}
                    </p>

                    {/* Lista de Tópicos */}
                    {tut.topics && tut.topics.length > 0 && (
                      <div className="pt-2 border-t border-gray-100 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          O que você vai aprender:
                        </span>
                        <ul className="space-y-1">
                          {tut.topics.slice(0, 3).map((topic, i) => (
                            <li key={i} className="text-[11px] text-slate-700 flex items-start gap-1.5 leading-tight">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{topic}</span>
                            </li>
                          ))}
                          {tut.topics.length > 3 && (
                            <li className="text-[10px] font-bold text-blue-600 pl-5">
                              +{tut.topics.length - 3} tópicos detalhados...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rodapé de Ações do Card */}
                <div className="p-4 bg-slate-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveVideoPlayer({ isOpen: true, tutorial: tut })}
                    className="py-2 px-3.5 bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer flex-1 justify-center"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Assistir Tutorial</span>
                  </button>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveRecorderTutorial(tut)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition cursor-pointer"
                        title="Gravar Tela e Recortar Início/Fim para Este Tutorial"
                      >
                        <Video className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(tut)}
                        className="p-2 bg-white hover:bg-gray-100 text-slate-700 border border-gray-200 rounded-xl transition cursor-pointer"
                        title="Editar Informações ou Substituir Vídeo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDelete(tut.id)}
                          className="p-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl transition cursor-pointer"
                          title="Remover Tutorial"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE PLAYER DE VÍDEO & ROTEIRO COMPLETO */}
      {activeVideoPlayer.isOpen && activeVideoPlayer.tutorial && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            {/* Header do Player */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/40">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    {activeVideoPlayer.tutorial.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Trilha: {activeVideoPlayer.tutorial.audience.toUpperCase()} • {activeVideoPlayer.tutorial.category} ({activeVideoPlayer.tutorial.duration})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveVideoPlayer({ isOpen: false, tutorial: null })}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo: Player + Roteiro */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
              {/* Iframe ou Player de Vídeo */}
              <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-800">
                {isDirectVideoUrl(activeVideoPlayer.tutorial.video_url) ? (
                  <video
                    src={activeVideoPlayer.tutorial.video_url}
                    controls
                    playsInline
                    webkit-playsinline="true"
                    preload="metadata"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <iframe
                    src={getEmbedVideoUrl(activeVideoPlayer.tutorial.video_url)}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                  />
                )}
              </div>

              {/* Informações e Checklist de Tópicos */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 space-y-4">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Sobre este Tutorial</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {activeVideoPlayer.tutorial.description}
                  </p>
                </div>

                {activeVideoPlayer.tutorial.topics && activeVideoPlayer.tutorial.topics.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                      Passo a Passo / Tópicos Abordados:
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeVideoPlayer.tutorial.topics.map((t, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-50 rounded-xl border border-gray-200/70 text-xs font-semibold text-slate-800 flex items-start gap-2"
                        >
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeVideoPlayer.tutorial.script_summary && (
                  <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/70 text-xs space-y-1">
                    <span className="font-extrabold text-blue-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Guia de Gravação / Roteiro Sugerido:</span>
                    </span>
                    <p className="text-blue-900 leading-relaxed text-[11px]">
                      {activeVideoPlayer.tutorial.script_summary}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé do Modal com Fallback para Celular */}
            <div className="p-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={getNativeAppOrDirectLink(activeVideoPlayer.tutorial.video_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 underline"
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>
                  {getVideoSourceType(activeVideoPlayer.tutorial.video_url) === 'drive'
                    ? '📱 Abrir no Google Drive / App (Recomendado no Celular)'
                    : '📱 Abrir em Nova Guia / Aplicativo'}
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setActiveVideoPlayer({ isOpen: false, tutorial: null })}
                className="w-full sm:w-auto px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE TUTORIAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-base">
                  {editingTutorial ? 'Editar Vídeo Tutorial' : 'Cadastrar Novo Vídeo Tutorial'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Título do Tutorial *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Como Entrar na Aula Ao Vivo no Google Meet"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Trilha / Público *
                  </label>
                  <select
                    value={formAudience}
                    onChange={(e) => setFormAudience(e.target.value as TutorialAudience)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold bg-white"
                  >
                    <option value="aluno">Alunos (Estudantes)</option>
                    <option value="monitor">Monitores (Plantão)</option>
                    <option value="professor">Professores (Docentes)</option>
                    <option value="todos">Todos (Geral)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Primeiros Passos, Aulas..."
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Duração (MM:SS)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 01:30"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Descrição Curta
                </label>
                <textarea
                  rows={2}
                  placeholder="Explique o objetivo deste vídeo..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Link do Vídeo (Google Drive / YouTube / MP4) *
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    placeholder="https://drive.google.com/file/d/.../view"
                    value={formVideoUrl}
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <p className="text-[11px] text-gray-500">
                      Cole o link do Google Drive ou grave a tela agora com corte.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        const tempTut: TutorialVideoItem = {
                          id: editingTutorial ? editingTutorial.id : `tut-${Date.now()}`,
                          title: formTitle.trim() || 'Novo Vídeo Tutorial',
                          description: formDescription.trim(),
                          audience: formAudience,
                          category: formCategory.trim() || 'Geral',
                          duration: formDuration.trim() || '01:30',
                          video_url: formVideoUrl.trim() || 'https://drive.google.com/file/d/1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO/view',
                          thumbnail_url: formThumbnailUrl.trim() || undefined,
                          topics: formTopicsText.split('\n').map((t) => t.trim()).filter(Boolean),
                          script_summary: formScriptSummary.trim() || undefined,
                          order: editingTutorial ? editingTutorial.order : tutorials.length + 1,
                          updated_at: new Date().toISOString().slice(0, 10),
                        };
                        setIsEditModalOpen(false);
                        setActiveRecorderTutorial(tempTut);
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer border border-red-400 shrink-0"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>🔴 Gravar Tela & Recortar Agora</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  URL da Imagem de Capa (Miniatura)
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formThumbnailUrl}
                  onChange={(e) => setFormThumbnailUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Tópicos / Passo a Passo (1 por linha)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex:&#10;• Login com conta autorizada&#10;• Localizar botão do Meet&#10;• Câmeras ligadas"
                  value={formTopicsText}
                  onChange={(e) => setFormTopicsText(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Roteiro de Gravação / O que Falar (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Texto orientativo de apoio para quem for gravar..."
                  value={formScriptSummary}
                  onChange={(e) => setFormScriptSummary(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-md transition"
                >
                  Salvar Tutorial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE GRAVAÇÃO & RECORTE DE TELA / ABA (Restrito a Monitores e Administradores) */}
      {canManage && activeRecorderTutorial && (
        <TutorialRecorderModal
          isOpen={!!activeRecorderTutorial}
          onClose={() => setActiveRecorderTutorial(null)}
          tutorial={activeRecorderTutorial}
          onSaved={(updated) => {
            loadData();
            showToast(`Vídeo gravado e publicado com sucesso no card "${updated.title}"!`);
          }}
        />
      )}
    </div>
  );
};
