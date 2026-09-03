'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles, Headphones, FileText, Network, Presentation, Video, CheckSquare, 
  Plus, Edit3, Trash2, ExternalLink, Play, Pause, RotateCcw, Volume2, 
  VolumeX, Download, Copy, Check, ChevronDown, ChevronUp, Search, 
  Filter, BookOpen, Layers, Clock, Calendar, User, Tag, Sparkle
} from 'lucide-react';
import { GeminiNoteItem, SupportMaterialType, Disciplina, UserRole } from '@/types';
import { 
  getAllGeminiNotes, 
  addGeminiNote, 
  updateGeminiNote, 
  deleteGeminiNote, 
  SUPPORT_MATERIAL_CONFIG 
} from '@/services/geminiNotesService';
import { getAllDisciplinas } from '@/services/disciplinasService';
import { saveCornellNote } from '@/services/studentSyncService';

interface SupportMaterialsHubProps {
  disciplinaId?: string; // Se fornecido, restringe para a disciplina atual
  allowedDisciplinas?: Disciplina[];
  currentRole?: UserRole;
  userEmail?: string;
  onOpenDisciplina?: (disciplinaId: string) => void;
  onImportToCornellCallback?: (note: GeminiNoteItem) => void;
}

export const SupportMaterialsHub: React.FC<SupportMaterialsHubProps> = ({
  disciplinaId,
  allowedDisciplinas,
  currentRole = 'aluno',
  userEmail = '',
  onOpenDisciplina,
  onImportToCornellCallback,
}) => {
  const normalizedEmail = (userEmail || '').toLowerCase().trim();
  const isAluno = currentRole === 'aluno';
  const canManage = !isAluno;

  const [allNotes, setAllNotes] = useState<GeminiNoteItem[]>([]);
  const [allDisciplinasList, setAllDisciplinasList] = useState<Disciplina[]>([]);
  
  // Filtros
  const [selectedType, setSelectedType] = useState<SupportMaterialType | 'ALL'>('ALL');
  const [selectedAulaNum, setSelectedAulaNum] = useState<number | 'ALL'>('ALL');
  const [selectedDiscFilter, setSelectedDiscFilter] = useState<string>(disciplinaId || 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Notificações e Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [importedCornellId, setImportedCornellId] = useState<string | null>(null);

  // Estados do Player de Áudio Embutido
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Estados dos Mapas Mentais Expandidos
  const [expandedMindmaps, setExpandedMindmaps] = useState<Record<string, boolean>>({});

  // Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<GeminiNoteItem | null>(null);

  // Form State
  const [formTipo, setFormTipo] = useState<SupportMaterialType>('anotacao');
  const [formDisciplinaId, setFormDisciplinaId] = useState<string>(disciplinaId || '');
  const [formAulaNum, setFormAulaNum] = useState<number>(1);
  const [formDataAula, setFormDataAula] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formUrl, setFormUrl] = useState<string>('');
  const [formAudioUrl, setFormAudioUrl] = useState<string>('');
  const [formVideoUrl, setFormVideoUrl] = useState<string>('');
  const [formMindmapData, setFormMindmapData] = useState<string>('');
  const [formSummarySnippet, setFormSummarySnippet] = useState<string>('');
  const [formDuration, setFormDuration] = useState<string>('');
  const [formTags, setFormTags] = useState<string>('');

  // Carregar dados
  const loadData = () => {
    const notes = getAllGeminiNotes();
    setAllNotes(notes);
    const discs = getAllDisciplinas();
    setAllDisciplinasList(discs);
  };

  useEffect(() => {
    loadData();

    const handleNotesUpdate = () => loadData();
    window.addEventListener('lms_gemini_notes_updated', handleNotesUpdate);
    return () => {
      window.removeEventListener('lms_gemini_notes_updated', handleNotesUpdate);
    };
  }, []);

  useEffect(() => {
    if (disciplinaId) {
      setSelectedDiscFilter(disciplinaId);
      setFormDisciplinaId(disciplinaId);
    }
  }, [disciplinaId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Disciplinas disponíveis para o usuário
  const userDisciplinas = useMemo(() => {
    if (allowedDisciplinas && allowedDisciplinas.length > 0) return allowedDisciplinas;
    if (disciplinaId) {
      const found = allDisciplinasList.find((d) => d.id === disciplinaId);
      return found ? [found] : allDisciplinasList;
    }
    return allDisciplinasList;
  }, [allowedDisciplinas, disciplinaId, allDisciplinasList]);

  // Restrição estrita de escopo (ex: painel do professor ou disciplina específica)
  const isRestrictedScope = Boolean(disciplinaId || (allowedDisciplinas && allowedDisciplinas.length > 0));

  // Base de materiais estritamente isolada pela(s) matéria(s) autorizada(s)
  const scopedBaseNotes = useMemo(() => {
    if (!isRestrictedScope) return allNotes;

    const allowedIds = new Set(userDisciplinas.map((d) => d.id));
    const allowedNames = new Set(
      userDisciplinas.map((d) => (d.name || '').toLowerCase().trim()).filter(Boolean)
    );
    const allowedCodes = new Set(
      userDisciplinas.map((d) => (d.code || '').toLowerCase().trim()).filter(Boolean)
    );

    return allNotes.filter((note) => {
      if (disciplinaId) {
        return note.disciplina_id === disciplinaId;
      }
      const noteDiscId = note.disciplina_id;
      const noteDiscName = (note.disciplina_name || '').toLowerCase().trim();

      // Correspondência por ID, código ou nome
      return (
        allowedIds.has(noteDiscId) ||
        Array.from(allowedNames).some((name) => noteDiscName.includes(name) || name.includes(noteDiscName)) ||
        Array.from(allowedCodes).some((code) => noteDiscName.includes(code))
      );
    });
  }, [allNotes, isRestrictedScope, userDisciplinas, disciplinaId]);

  // Garante seleção padrão da matéria autorizada se for professor ou matéria única
  useEffect(() => {
    if (disciplinaId) {
      setSelectedDiscFilter(disciplinaId);
      setFormDisciplinaId(disciplinaId);
    } else if (allowedDisciplinas && allowedDisciplinas.length === 1) {
      setSelectedDiscFilter(allowedDisciplinas[0].id);
      setFormDisciplinaId(allowedDisciplinas[0].id);
    } else if (allowedDisciplinas && allowedDisciplinas.length > 1) {
      // Quando o professor possui múltiplas matérias atribuídas, o default é 'ALL' (Todas as suas matérias afetas)
      setSelectedDiscFilter('ALL');
      setFormDisciplinaId(allowedDisciplinas[0].id);
    }
  }, [disciplinaId, allowedDisciplinas]);

  // Lista Filtrada de Materiais (estritamente a partir da base com escopo do professor)
  const filteredNotes = useMemo(() => {
    return scopedBaseNotes.filter((note) => {
      // Filtro de disciplina selecionada
      if (disciplinaId && note.disciplina_id !== disciplinaId) return false;
      if (!disciplinaId && selectedDiscFilter !== 'ALL' && note.disciplina_id !== selectedDiscFilter) return false;

      // Filtro de tipo
      const noteTipo = note.tipo || 'anotacao';
      if (selectedType !== 'ALL' && noteTipo !== selectedType) return false;

      // Filtro de aula
      if (selectedAulaNum !== 'ALL' && note.aula_num !== selectedAulaNum) return false;

      // Busca textual
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = (note.title || '').toLowerCase().includes(q);
        const inSnippet = (note.summary_snippet || '').toLowerCase().includes(q);
        const inDisc = (note.disciplina_name || '').toLowerCase().includes(q);
        const inTags = (note.tags || []).some((t) => t.toLowerCase().includes(q));
        const inAuthor = (note.author_name || '').toLowerCase().includes(q);
        if (!inTitle && !inSnippet && !inDisc && !inTags && !inAuthor) return false;
      }

      return true;
    });
  }, [scopedBaseNotes, disciplinaId, selectedDiscFilter, selectedType, selectedAulaNum, searchQuery]);

  // Contadores por Tipo para as Badges (calculados exclusivamente sobre os materiais do docente)
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: scopedBaseNotes.length,
      anotacao: 0,
      audio_podcast: 0,
      mapa_mental: 0,
      slide: 0,
      video: 0,
      guia_estudo: 0,
    };

    scopedBaseNotes.forEach((n) => {
      const t = n.tipo || 'anotacao';
      counts[t] = (counts[t] || 0) + 1;
    });

    return counts;
  }, [scopedBaseNotes]);

  // Controle de Áudio
  const handleTogglePlayAudio = (note: GeminiNoteItem) => {
    const audioSrc = note.audio_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

    if (playingNoteId === note.id) {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingNoteId(note.id);
      setIsPlaying(true);
      setCurrentTime(0);

      const audio = new Audio(audioSrc);
      audio.playbackRate = playbackRate;
      audioRef.current = audio;

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.play().catch((err) => {
        console.warn('Erro ao reproduzir áudio:', err);
        setIsPlaying(false);
      });
    }
  };

  const handleChangeSpeed = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Toggle Mapa Mental Expandido
  const toggleMindmap = (id: string) => {
    setExpandedMindmaps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Importar para o Caderno Cornell
  const handleImportToCornell = (note: GeminiNoteItem) => {
    const defaultStudentEmail = normalizedEmail || 'sacrasub@gmail.com';
    const disc = allDisciplinasList.find((d) => d.id === note.disciplina_id);
    const noteId = `note-${disc?.code?.toLowerCase() || 'disc'}-${(note.data_aula || '').replace(/[^0-9]/g, '-') || Date.now()}`;

    const config = SUPPORT_MATERIAL_CONFIG[note.tipo || 'anotacao'];

    saveCornellNote(defaultStudentEmail, {
      id: noteId,
      user_email: defaultStudentEmail,
      date: note.data_aula || new Date().toISOString().slice(0, 10),
      disciplina_code: disc?.code || 'MAT',
      disciplina_name: note.disciplina_name || disc?.name || 'Disciplina',
      theme: note.title || `Material de Apoio • Aula ${note.aula_num || 1}`,
      professor_name: disc?.professor_name || 'Corpo Docente',
      biblical_references: 'Consulte o plano de ensino da disciplina',
      cues: `• Quais as teses e conceitos centrais deste material (${config.label})?
• Como este conteúdo se relaciona com o ministério pastoral e a hermenêutica?
• Principais desdobramentos práticos e perguntas para auto-teste.`,
      notes: `${note.summary_snippet || 'Síntese do material de apoio gerado via Gemini/NotebookLM.'}\n\n${
        note.mindmap_data ? `ESQUEMA DO MAPA MENTAL:\n${note.mindmap_data}` : ''
      }`,
      summary: `Síntese ${config.label} • Aula ${note.aula_num || 1}: ${
        note.summary_snippet ? note.summary_snippet.slice(0, 200) + '...' : 'Material registrado no LMS.'
      }`,
      ai_summary_url: note.gemini_url,
      ai_summary_text: note.summary_snippet,
      tags: [note.disciplina_name || 'Matéria', `Aula ${note.aula_num || 1}`, config.label, 'NotebookLM'],
    });

    setImportedCornellId(note.id);
    showToast('Material importado com sucesso para o seu Caderno Cornell!');
    setTimeout(() => setImportedCornellId(null), 3000);

    if (onImportToCornellCallback) {
      onImportToCornellCallback(note);
    }
  };

  // Copiar Formato WhatsApp
  const handleCopyWhatsApp = (note: GeminiNoteItem) => {
    const config = SUPPORT_MATERIAL_CONFIG[note.tipo || 'anotacao'];
    const text = `📚 *MATERIAL DE APOIO & FIXAÇÃO — KOINONIA-LMS*
📖 *Matéria:* ${note.disciplina_name}
🎯 *${config.emoji} Tipo:* ${config.label}
🗓️ *Aula:* ${note.aula_num || 1} • ${note.data_aula || 'Semestre 2026.2'}
📌 *Título:* ${note.title}

📝 *Síntese dos Tópicos:*
${note.summary_snippet || 'Acesse o material completo no link abaixo.'}

🔗 *Link do Material:* ${note.gemini_url}
${note.audio_url ? `🎙️ *Link do Áudio:* ${note.audio_url}\n` : ''}
${note.tags && note.tags.length > 0 ? `🏷️ *Tags:* ${note.tags.map((t) => '#' + t.replace(/\s+/g, '')).join(' ')}\n` : ''}
_Disponível no Portal do Aluno do Seminário UIECB_`;

    navigator.clipboard.writeText(text);
    setCopiedId(note.id);
    showToast('Mensagem formatada para WhatsApp copiada com sucesso!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Abrir Modal de Criação
  const handleOpenAddModal = (defaultType: SupportMaterialType = 'anotacao') => {
    setEditingItem(null);
    setFormTipo(defaultType);
    setFormDisciplinaId(disciplinaId || (userDisciplinas[0]?.id || ''));
    setFormAulaNum(1);
    setFormDataAula('');
    setFormTitle('');
    setFormUrl('');
    setFormAudioUrl('');
    setFormVideoUrl('');
    setFormMindmapData('');
    setFormSummarySnippet('');
    setFormDuration('');
    setFormTags('');
    setIsModalOpen(true);
  };

  // Abrir Modal de Edição
  const handleOpenEditModal = (note: GeminiNoteItem) => {
    setEditingItem(note);
    setFormTipo(note.tipo || 'anotacao');
    setFormDisciplinaId(note.disciplina_id);
    setFormAulaNum(note.aula_num || 1);
    setFormDataAula(note.data_aula || '');
    setFormTitle(note.title);
    setFormUrl(note.gemini_url);
    setFormAudioUrl(note.audio_url || '');
    setFormVideoUrl(note.video_url || '');
    setFormMindmapData(note.mindmap_data || '');
    setFormSummarySnippet(note.summary_snippet || '');
    setFormDuration(note.duration_formatted || '');
    setFormTags((note.tags || []).join(', '));
    setIsModalOpen(true);
  };

  // Salvar Criação ou Edição
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUrl.trim() || !formDisciplinaId) {
      showToast('Preencha os campos obrigatórios (*).');
      return;
    }

    const disc = allDisciplinasList.find((d) => d.id === formDisciplinaId);
    const discName = disc ? disc.name : 'Disciplina';

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      disciplina_id: formDisciplinaId,
      disciplina_name: discName,
      aula_num: formAulaNum,
      data_aula: formDataAula.trim() || undefined,
      title: formTitle.trim(),
      gemini_url: formUrl.trim(),
      tipo: formTipo,
      summary_snippet: formSummarySnippet.trim() || undefined,
      audio_url: formAudioUrl.trim() || undefined,
      video_url: formVideoUrl.trim() || undefined,
      mindmap_data: formMindmapData.trim() || undefined,
      duration_formatted: formDuration.trim() || undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      author_name: canManage ? (currentRole === 'professor' ? 'Corpo Docente' : 'Monitoria Oficial') : 'Seminário UIECB',
      author_role: (currentRole === 'professor' || currentRole === 'monitor' || currentRole === 'admin') ? currentRole : 'monitor',
      author_email: normalizedEmail,
    };

    if (editingItem) {
      updateGeminiNote(editingItem.id, payload);
      showToast('Material de apoio atualizado com sucesso!');
    } else {
      addGeminiNote(payload);
      showToast('Novo material de apoio publicado com sucesso!');
    }

    setIsModalOpen(false);
    loadData();
  };

  // Excluir Material
  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover este material de apoio?')) {
      deleteGeminiNote(id);
      showToast('Material removido com sucesso.');
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Gemini Notebook & NotebookLM</span>
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-[11px] font-bold">
                {filteredNotes.length} {filteredNotes.length === 1 ? 'Material de Apoio' : 'Materiais de Apoio'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Materiais de Apoio, Podcasts & Mapas Mentais</span>
            </h2>

            <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed">
              Recursos inteligentes gerados a partir das transcrições, anotações de aula e debates teológicos.
              Ouça podcasts do NotebookLM, explore mapas conceituais e importe sínteses com 1 clique para o seu Caderno Cornell.
            </p>
          </div>

          {canManage && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => handleOpenAddModal('anotacao')}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Cadastrar Material de Apoio</span>
              </button>
            </div>
          )}
        </div>

        {/* PÍLULAS DE FILTRO POR TIPO DE MATERIAL */}
        <div className="mt-6 pt-5 border-t border-indigo-800/40 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              selectedType === 'ALL'
                ? 'bg-white text-indigo-950 font-black shadow-sm'
                : 'bg-white/10 text-indigo-200 hover:bg-white/20'
            }`}
          >
            <span>🌐 Todos</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-950/40 text-indigo-200 font-extrabold">
              {typeCounts.ALL}
            </span>
          </button>

          {(Object.keys(SUPPORT_MATERIAL_CONFIG) as SupportMaterialType[]).map((typeKey) => {
            const cfg = SUPPORT_MATERIAL_CONFIG[typeKey];
            const isSelected = selectedType === typeKey;
            const count = typeCounts[typeKey] || 0;

            return (
              <button
                key={typeKey}
                onClick={() => setSelectedType(typeKey)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-indigo-950 font-black shadow-sm'
                    : 'bg-white/10 text-indigo-200 hover:bg-white/20'
                }`}
              >
                <span>{cfg.emoji}</span>
                <span>{cfg.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isSelected ? 'bg-indigo-950/40 text-indigo-950' : 'bg-indigo-950/40 text-indigo-200'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BARRA DE PESQUISA E FILTROS SECUNDÁRIOS */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por tema, autor, tag ou síntese..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Seletor de Disciplina (quando em visão global) */}
          {!disciplinaId && (
            <select
              value={selectedDiscFilter}
              onChange={(e) => setSelectedDiscFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 shrink-0"
            >
              <option value="ALL">
                {allowedDisciplinas && allowedDisciplinas.length > 1
                  ? `Minhas Matérias (${allowedDisciplinas.length}) - Todas`
                  : 'Todas as Matérias'}
              </option>
              {userDisciplinas.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}

          {/* Seletor de Aula */}
          <select
            value={selectedAulaNum}
            onChange={(e) => setSelectedAulaNum(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 shrink-0"
          >
            <option value="ALL">Todas as Aulas (1 a 18)</option>
            {Array.from({ length: 18 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Aula {n}
              </option>
            ))}
          </select>

          {(searchQuery || selectedType !== 'ALL' || selectedAulaNum !== 'ALL' || (!disciplinaId && selectedDiscFilter !== 'ALL')) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('ALL');
                setSelectedAulaNum('ALL');
                setSelectedDiscFilter('ALL');
              }}
              className="text-xs text-rose-600 hover:underline font-bold px-2 whitespace-nowrap cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* LISTAGEM DE MATERIAIS DE APOIO */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-gray-300 space-y-3">
          <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
          <h4 className="font-extrabold text-slate-800 text-base">Nenhum material de apoio encontrado</h4>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {searchQuery || selectedType !== 'ALL' || selectedAulaNum !== 'ALL'
              ? 'Tente remover os filtros ou buscar por outro termo para localizar os materiais.'
              : 'Novos resumos do Gemini, podcasts do NotebookLM e mapas mentais serão disponibilizados aqui pelos professores e monitores.'}
          </p>
          {canManage && (
            <button
              onClick={() => handleOpenAddModal()}
              className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              + Publicar Primeiro Material
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredNotes.map((note) => {
            const noteTipo = note.tipo || 'anotacao';
            const config = SUPPORT_MATERIAL_CONFIG[noteTipo];
            const isAudioPlaying = playingNoteId === note.id && isPlaying;
            const isMindmapExpanded = !!expandedMindmaps[note.id];

            return (
              <div
                key={note.id}
                className="bg-white rounded-3xl border border-gray-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* CABEÇALHO DO CARD */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${config.badgeColor} flex items-center gap-1`}>
                          <span>{config.emoji}</span>
                          <span>{config.label}</span>
                        </span>

                        <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          Aula {note.aula_num || 1} {note.data_aula ? `• ${note.data_aula}` : ''}
                        </span>

                        {note.duration_formatted && (
                          <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{note.duration_formatted}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-indigo-950 transition-colors">
                        {note.title}
                      </h4>

                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
                        <span>📖 {note.disciplina_name}</span>
                        {onOpenDisciplina && (
                          <button
                            onClick={() => onOpenDisciplina(note.disciplina_id)}
                            className="text-[11px] text-gray-400 hover:text-indigo-600 underline cursor-pointer"
                          >
                            (Ver Hub)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* AÇÕES DE GESTÃO (PROFESSOR / MONITOR / ADMIN) */}
                    {canManage && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditModal(note)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          title="Editar Material de Apoio"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Excluir Material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* SÍNTESE DO MATERIAL */}
                  {note.summary_snippet && (
                    <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium">
                      {note.summary_snippet}
                    </div>
                  )}

                  {/* PLAYER DE ÁUDIO EMBUTIDO (PARA PODCASTS DO NOTEBOOKLM) */}
                  {noteTipo === 'audio_podcast' && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-2xl border border-purple-200/80 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleTogglePlayAudio(note)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md transition active:scale-95 cursor-pointer ${
                              isAudioPlaying ? 'bg-purple-700 hover:bg-purple-800' : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                            title={isAudioPlaying ? 'Pausar Áudio' : 'Ouvir Podcast'}
                          >
                            {isAudioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </button>

                          <div>
                            <span className="text-xs font-black text-purple-950 block">
                              {isAudioPlaying ? 'Reproduzindo Podcast NotebookLM...' : 'Ouvir Resumo em Áudio'}
                            </span>
                            <span className="text-[11px] font-mono text-purple-700">
                              {playingNoteId === note.id
                                ? `${formatSeconds(currentTime)} / ${formatSeconds(duration || 0)}`
                                : note.duration_formatted || 'Áudio Interativo'}
                            </span>
                          </div>
                        </div>

                        {/* Seletor de Velocidade */}
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-purple-200">
                          {[1, 1.25, 1.5, 2].map((spd) => (
                            <button
                              key={spd}
                              onClick={() => handleChangeSpeed(spd)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-black transition cursor-pointer ${
                                playbackRate === spd
                                  ? 'bg-purple-600 text-white'
                                  : 'text-purple-700 hover:bg-purple-50'
                              }`}
                            >
                              {spd}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Slider da Linha do Tempo */}
                      {playingNoteId === note.id && (
                        <div className="space-y-1">
                          <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-purple-200 rounded-lg appearance-none"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* VISUALIZADOR DE MAPA MENTAL ESQUEMÁTICO */}
                  {noteTipo === 'mapa_mental' && note.mindmap_data && (
                    <div className="space-y-2">
                      <button
                        onClick={() => toggleMindmap(note.id)}
                        className="w-full p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Network className="w-4 h-4 text-emerald-600" />
                          <span>{isMindmapExpanded ? 'Ocultar Esquema Conceitual' : 'Ver Esquema do Mapa Mental'}</span>
                        </span>
                        {isMindmapExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isMindmapExpanded && (
                        <div className="p-3.5 bg-slate-900 text-emerald-300 font-mono text-xs rounded-2xl whitespace-pre-wrap leading-relaxed border border-slate-800 animate-in fade-in duration-200">
                          {note.mindmap_data}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAGS DO MATERIAL */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {note.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* RODAPÉ DO CARD: AUTORIA E BOTÕES DE AÇÃO */}
                <div className="pt-3 border-t border-gray-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{note.author_name}</span>
                    </span>
                    <span className="text-gray-400">
                      {new Date(note.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Introduzir no Caderno Cornell (1-Clique) */}
                    <button
                      onClick={() => handleImportToCornell(note)}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs border transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                        importedCornellId === note.id
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-black'
                          : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900'
                      }`}
                      title="Salvar resumo estruturado no seu Caderno Cornell"
                    >
                      {importedCornellId === note.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Importado no Caderno!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>Caderno Cornell</span>
                        </>
                      )}
                    </button>

                    {/* Copiar Formato WhatsApp */}
                    <button
                      onClick={() => handleCopyWhatsApp(note)}
                      className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                      title="Copiar texto pronto para o grupo do WhatsApp"
                    >
                      {copiedId === note.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </>
                      )}
                    </button>

                    {/* Link Externo / Google Docs / NotebookLM */}
                    <a
                      href={note.gemini_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-200" />
                      <span>
                        {noteTipo === 'audio_podcast'
                          ? 'NotebookLM'
                          : noteTipo === 'slide'
                          ? 'Ver Slides'
                          : noteTipo === 'video'
                          ? 'Assistir'
                          : 'Abrir Docs'}
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE MATERIAL DE APOIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">
                    {editingItem ? 'Editar Material de Apoio' : 'Publicar Material de Apoio (Gemini Notebook)'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Cadastre resumos, podcasts do NotebookLM, mapas mentais ou slides para estudo dos alunos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* TIPO DE MATERIAL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Tipo do Material de Apoio <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(SUPPORT_MATERIAL_CONFIG) as SupportMaterialType[]).map((typeKey) => {
                    const cfg = SUPPORT_MATERIAL_CONFIG[typeKey];
                    const isSelected = formTipo === typeKey;

                    return (
                      <button
                        key={typeKey}
                        type="button"
                        onClick={() => setFormTipo(typeKey)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-2xs font-extrabold'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-base">{cfg.emoji}</span>
                        <span className="text-left leading-tight text-[11px]">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DISCIPLINA E AULA */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Matéria / Disciplina <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formDisciplinaId}
                    onChange={(e) => setFormDisciplinaId(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  >
                    <option value="">Selecione a disciplina</option>
                    {userDisciplinas.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code || 'MAT'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Número da Aula <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={18}
                    value={formAulaNum}
                    onChange={(e) => setFormAulaNum(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              {/* TÍTULO E DATA DA AULA */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Título do Material <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Podcast NotebookLM • Aula 2 • Robert Kalley & A Eclesiologia"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Data da Aula
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 18/08/2026"
                    value={formDataAula}
                    onChange={(e) => setFormDataAula(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              {/* LINK PRINCIPAL (DOCS / NOTEBOOKLM / DRIVE / YOUTUBE) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link Principal (Google Docs, NotebookLM, YouTube ou Drive) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/... ou https://notebooklm.google.com/..."
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              {/* CAMPOS ESPECÍFICOS DE ÁUDIO / PODCAST */}
              {formTipo === 'audio_podcast' && (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 bg-purple-50 rounded-2xl border border-purple-200">
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-bold text-purple-950 mb-1">
                      URL Direta do Áudio / MP3 (para Player Embutido)
                    </label>
                    <input
                      type="url"
                      placeholder="https://.../podcast.mp3 (ou deixe vazio para link externo)"
                      value={formAudioUrl}
                      onChange={(e) => setFormAudioUrl(e.target.value)}
                      className="w-full p-2 border border-purple-300 rounded-xl text-xs font-semibold bg-white"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-purple-950 mb-1">
                      Duração (Ex: 14:30)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 12:45"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full p-2 border border-purple-300 rounded-xl text-xs font-semibold bg-white"
                    />
                  </div>
                </div>
              )}

              {/* CAMPOS ESPECÍFICOS DE MAPA MENTAL */}
              {formTipo === 'mapa_mental' && (
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5">
                  <label className="block text-xs font-bold text-emerald-950">
                    Esquema / Estrutura do Mapa Mental (Texto Hierárquico)
                  </label>
                  <textarea
                    rows={4}
                    placeholder={`• Tese Principal\n  ├── Tópico 1\n  │     └── Sub-ponto\n  └── Tópico 2`}
                    value={formMindmapData}
                    onChange={(e) => setFormMindmapData(e.target.value)}
                    className="w-full p-2 border border-emerald-300 rounded-xl text-xs font-mono bg-white"
                  />
                </div>
              )}

              {/* SÍNTESE E TÓPICOS-CHAVE */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Síntese dos Tópicos-Chave / Sinopse
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva os principais pontos abordados nesta aula ou as diretrizes para estudo e fixação do aluno..."
                  value={formSummarySnippet}
                  onChange={(e) => setFormSummarySnippet(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium"
                />
              </div>

              {/* TAGS */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tags de Fixação (separadas por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Eclesiologia, Robert Kalley, 1855, Podcast"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                />
              </div>

              {/* BOTÕES DE SUBMIT */}
              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  {editingItem ? 'Salvar Alterações' : 'Publicar Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
