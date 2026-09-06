'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, BookOpen, Video, FolderOpen, UserCheck, Calendar, Clock, 
  Sparkles, ExternalLink, Download, Plus, Trash2, CheckCircle2, Copy, Check, 
  FileText, Link as LinkIcon, AlertCircle, Quote, ShieldCheck, GraduationCap,
  Layers, MessageSquare, PhoneCall, Globe, Compass, Edit3, Library,
  Presentation, Maximize2, Minimize2, PenTool, ChevronLeft, ChevronRight, Settings, Play,
  Mic
} from 'lucide-react';
import { Disciplina, Aula, LivroRecomendadoDisciplina, GeminiNoteItem, GravacaoAulaItem, Material, AvisoLeituraPreAula, UserRole } from '@/types';
import { getAllDisciplinas, updateDisciplina, getDisciplinasForUser } from '@/services/disciplinasService';
import { INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';
import { 
  getLivrosRecomendadosForDisciplina, 
  addLivroRecomendado, 
  updateLivroRecomendado,
  deleteLivroRecomendado 
} from '@/services/livrosRecomendadosService';
import { 
  getGeminiNotesForDisciplina, 
  addGeminiNote, 
  deleteGeminiNote,
  updateGeminiNote
} from '@/services/geminiNotesService';
import { 
  getGravacoesForDisciplina, 
  getGravacaoForAula, 
  deleteGravacao,
  updateGravacao,
  addGravacao,
  fetchGravacoesFromCloud
} from '@/services/gravacoesService';
import { 
  getMateriaisForDisciplinas, 
  addMaterial, 
  updateMaterial,
  deleteMaterial 
} from '@/services/disciplinasService';
import { 
  getAnnouncementsForDisciplinas, 
  getReadAnnouncementIds, 
  markAnnouncementAsRead, 
  unmarkAnnouncementAsRead, 
  formatAnnouncementForWhatsApp,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '@/services/announcementsService';
import { getAllBibliotecaBooks } from '@/services/bibliotecaService';
import { getAulasByTurma, getDisciplinasByTurma } from '@/lib/mockData';
import { getDateForLesson, getShortDateForLesson } from '@/lib/semesterUtils';
import { VideoPlayerModal } from '@/components/VideoPlayerModal';
import { 
  getSlidesForDisciplina, 
  addSlideItem, 
  deleteSlideItem, 
  updateSlideItem,
  SlideItem 
} from '@/services/slidesService';
import { saveCornellNote } from '@/services/studentSyncService';
import { SupportMaterialsHub } from '@/components/SupportMaterialsHub';
import { MobilePdfReaderModal } from '@/components/MobilePdfReaderModal';
import { trackEvent } from '@/services/telemetryService';

interface DisciplinaDetailPageProps {
  disciplinaId: string;
  userEmail?: string;
  currentRole?: UserRole;
  onBack: () => void;
  onTabChange?: (tab: string) => void;
}

export const DisciplinaDetailPage: React.FC<DisciplinaDetailPageProps> = ({
  disciplinaId,
  userEmail = 'sacrasub@gmail.com',
  currentRole = 'aluno',
  onBack,
  onTabChange
}) => {
  const normalizedEmail = (userEmail || '').toLowerCase().trim();
  const isAluno = currentRole === 'aluno';
  const canRecord = (currentRole === 'monitor' || currentRole === 'admin') && !isAluno;
  const canManageContent = (currentRole === 'admin' || currentRole === 'professor' || currentRole === 'monitor') && !isAluno;
  const canManage = canManageContent;

  // Obtém turma do aluno a partir do perfil salvo / cadastro
  const studentTurmaIdx = useMemo(() => {
    let initialT = 1;
    const authUser = INITIAL_AUTHORIZED_USERS[normalizedEmail];
    if (authUser && authUser.turmaIdx !== undefined) initialT = authUser.turmaIdx;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`lms_profile_${normalizedEmail}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.turmaIdx !== undefined) return Number(parsed.turmaIdx);
        }
        const portalStored = localStorage.getItem(`lms_user_portal_profile_${normalizedEmail}`);
        if (portalStored) {
          const parsed = JSON.parse(portalStored);
          if (parsed.turmaIdx !== undefined) return Number(parsed.turmaIdx);
        }
      } catch (e) {}
    }
    return initialT;
  }, [normalizedEmail]);

  // Lista de matérias correspondentes à configuração de período/turma do aluno ou perfil ativo
  const availableDisciplinas = useMemo(() => {
    if (currentRole === 'aluno') {
      const turmaDiscs = getDisciplinasByTurma(studentTurmaIdx);
      return turmaDiscs.length > 0 ? turmaDiscs : getAllDisciplinas();
    }
    if (currentRole === 'professor') {
      const profDiscs = getDisciplinasForUser(normalizedEmail, 'professor');
      return profDiscs.length > 0 ? profDiscs : getAllDisciplinas();
    }
    return getAllDisciplinas();
  }, [currentRole, studentTurmaIdx, normalizedEmail]);

  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'slides' | 'livros' | 'gemini' | 'gravacoes' | 'aulas' | 'materiais' | 'leituras'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lms_pending_disciplina_subtab');
        if (saved) {
          localStorage.removeItem('lms_pending_disciplina_subtab');
          return saved as any;
        }
      } catch (err) {}
    }
    return 'geral';
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Estados de dados da matéria
  const [disciplina, setDisciplina] = useState<Disciplina | null>(null);
  const [livrosRecomendados, setLivrosRecomendados] = useState<LivroRecomendadoDisciplina[]>([]);
  const [geminiNotes, setGeminiNotes] = useState<GeminiNoteItem[]>([]);
  const [gravacoes, setGravacoes] = useState<GravacaoAulaItem[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [announcements, setAnnouncements] = useState<AvisoLeituraPreAula[]>([]);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<string[]>([]);
  
  // Estados de Slides das Aulas e Navegação
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [selectedSlide, setSelectedSlide] = useState<SlideItem | null>(null);
  const [selectedSlideAulaNum, setSelectedSlideAulaNum] = useState<number>(1);
  const [isAddSlideModalOpen, setIsAddSlideModalOpen] = useState<boolean>(false);
  const [newSlideTitle, setNewSlideTitle] = useState<string>('');
  const [newSlideAulaNum, setNewSlideAulaNum] = useState<number>(1);
  const [newSlideDataAula, setNewSlideDataAula] = useState<string>('');
  const [newSlideUrl, setNewSlideUrl] = useState<string>('');
  const [newSlideNotes, setNewSlideNotes] = useState<string>('');
  const [isFocusSlideMode, setIsFocusSlideMode] = useState<boolean>(false);

  // Modal de Edição de Slide
  const [isEditSlideModalOpen, setIsEditSlideModalOpen] = useState<boolean>(false);
  const [editingSlideId, setEditingSlideId] = useState<string>('');
  const [editSlideAulaNum, setEditSlideAulaNum] = useState<number>(1);
  const [editSlideDataAula, setEditSlideDataAula] = useState<string>('');
  const [editSlideTitle, setEditSlideTitle] = useState<string>('');
  const [editSlideUrl, setEditSlideUrl] = useState<string>('');
  const [editSlideNotes, setEditSlideNotes] = useState<string>('');

  // Navegação de Gravações de Aulas
  const [selectedGravacaoAulaNum, setSelectedGravacaoAulaNum] = useState<number>(1);
  const [gravacoesViewMode, setGravacoesViewMode] = useState<'aula' | 'grid'>('aula');

  // Modal de Edição dos Dados da Matéria pelo Hub
  const [isEditDisciplinaHubModalOpen, setIsEditDisciplinaHubModalOpen] = useState<boolean>(false);
  const [editHubMeetUrl, setEditHubMeetUrl] = useState<string>('');
  const [editHubMeetPhone, setEditHubMeetPhone] = useState<string>('');
  const [editHubMeetPin, setEditHubMeetPin] = useState<string>('');
  const [editHubDriveUrl, setEditHubDriveUrl] = useState<string>('');
  const [editHubAttendanceUrl, setEditHubAttendanceUrl] = useState<string>('');
  const [editHubDescription, setEditHubDescription] = useState<string>('');

  // Modais de Adição e Edição de Livros Recomendados
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookUrl, setBookUrl] = useState('');
  const [bookNotes, setBookNotes] = useState('');
  const [bookCategory, setBookCategory] = useState('Bibliografia Recomendada');
  const [isMandatoryBook, setIsMandatoryBook] = useState(false);
  const [selectedBiblioBookId, setSelectedBiblioBookId] = useState('');
  const [biblioSearchQuery, setBiblioSearchQuery] = useState('');

  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState('');
  const [editBookTitle, setEditBookTitle] = useState('');
  const [editBookAuthor, setEditBookAuthor] = useState('');
  const [editBookUrl, setEditBookUrl] = useState('');
  const [editBookNotes, setEditBookNotes] = useState('');
  const [editBookCategory, setEditBookCategory] = useState('Bibliografia Recomendada');
  const [editIsMandatoryBook, setEditIsMandatoryBook] = useState(false);
  const [editSelectedBiblioBookId, setEditSelectedBiblioBookId] = useState('');
  const [editBiblioSearchQuery, setEditBiblioSearchQuery] = useState('');

  // Modais de Gestão de Leituras Pré-Aula
  const [isAddLeituraModalOpen, setIsAddLeituraModalOpen] = useState(false);
  const [leituraTitle, setLeituraTitle] = useState('');
  const [leituraLinkUrl, setLeituraLinkUrl] = useState('');
  const [leituraMessage, setLeituraMessage] = useState('');
  const [leituraCategory, setLeituraCategory] = useState<'pre_aula' | 'durante_aula' | 'complementar'>('pre_aula');
  const [leituraTargetDate, setLeituraTargetDate] = useState('');

  const [isEditLeituraModalOpen, setIsEditLeituraModalOpen] = useState(false);
  const [editingLeituraId, setEditingLeituraId] = useState('');
  const [editLeituraTitle, setEditLeituraTitle] = useState('');
  const [editLeituraLinkUrl, setEditLeituraLinkUrl] = useState('');
  const [editLeituraMessage, setEditLeituraMessage] = useState('');
  const [editLeituraCategory, setEditLeituraCategory] = useState<'pre_aula' | 'durante_aula' | 'complementar'>('pre_aula');
  const [editLeituraTargetDate, setEditLeituraTargetDate] = useState('');

  const [isAddGeminiModalOpen, setIsAddGeminiModalOpen] = useState(false);
  const [geminiAulaNum, setGeminiAulaNum] = useState<number>(1);
  const [geminiDataAula, setGeminiDataAula] = useState('');
  const [geminiTitle, setGeminiTitle] = useState('');
  const [geminiUrl, setGeminiUrl] = useState('');
  const [geminiSnippet, setGeminiSnippet] = useState('');

  // Modal de Edição de Anotação Gemini
  const [isEditGeminiModalOpen, setIsEditGeminiModalOpen] = useState(false);
  const [editingGeminiId, setEditingGeminiId] = useState('');
  const [editGeminiDisciplinaId, setEditGeminiDisciplinaId] = useState('');
  const [editGeminiAulaNum, setEditGeminiAulaNum] = useState<number>(1);
  const [editGeminiDataAula, setEditGeminiDataAula] = useState('');
  const [editGeminiTitle, setEditGeminiTitle] = useState('');
  const [editGeminiUrl, setEditGeminiUrl] = useState('');
  const [editGeminiSnippet, setEditGeminiSnippet] = useState('');

  // Modal de Adição Manual de Gravação (Link do Drive)
  const [isAddGravacaoModalOpen, setIsAddGravacaoModalOpen] = useState(false);
  const [newGravacaoDisciplinaId, setNewGravacaoDisciplinaId] = useState('');
  const [newGravacaoAulaNum, setNewGravacaoAulaNum] = useState<number>(1);
  const [newGravacaoDataAula, setNewGravacaoDataAula] = useState('');
  const [newGravacaoTitle, setNewGravacaoTitle] = useState('');
  const [newGravacaoVideoUrl, setNewGravacaoVideoUrl] = useState('');
  const [newGravacaoDuration, setNewGravacaoDuration] = useState('');

  // Modal de Edição de Gravação
  const [isEditGravacaoModalOpen, setIsEditGravacaoModalOpen] = useState(false);
  const [editingGravacaoId, setEditingGravacaoId] = useState('');
  const [editDisciplinaId, setEditDisciplinaId] = useState('');
  const [editAulaNum, setEditAulaNum] = useState<number>(1);
  const [editDataAula, setEditDataAula] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editDurationFormatted, setEditDurationFormatted] = useState('');

  // Modais de Player de Vídeo Seguro
  const [activeVideoModal, setActiveVideoModal] = useState<{
    isOpen: boolean;
    title: string;
    videoUrl: string;
    aulaNum?: number;
  }>({
    isOpen: false,
    title: '',
    videoUrl: '',
  });

  // Modais de Gestão de Materiais de Estudo & Apostilas
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialDriveUrl, setNewMaterialDriveUrl] = useState('');
  const [newMaterialType, setNewMaterialType] = useState('pdf');

  const [isEditMaterialModalOpen, setIsEditMaterialModalOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState('');
  const [editMaterialTitle, setEditMaterialTitle] = useState('');
  const [editMaterialDriveUrl, setEditMaterialDriveUrl] = useState('');
  const [editMaterialType, setEditMaterialType] = useState('pdf');

  // Modal do Leitor de PDF Embutido (Mobile & Desktop)
  const [mobilePdfModal, setMobilePdfModal] = useState<{ isOpen: boolean; title: string; pdfUrl: string } | null>(null);

  // Carregar dados da disciplina
  const refreshData = () => {
    const allDisc = getAllDisciplinas();
    let found = allDisc.find((d) => d.id === disciplinaId);

    // Se for aluno, garante que a matéria selecionada pertence à sua turma configurada
    if (currentRole === 'aluno') {
      const turmaDiscs = getDisciplinasByTurma(studentTurmaIdx);
      if (turmaDiscs.length > 0 && (!found || !turmaDiscs.some((td) => td.id === found?.id))) {
        found = turmaDiscs[0];
      }
    } else if (!found) {
      found = allDisc[0];
    }

    if (found) {
      setDisciplina(found);
      setLivrosRecomendados(getLivrosRecomendadosForDisciplina(found.id));
      setGeminiNotes(getGeminiNotesForDisciplina(found.id));
      setGravacoes(getGravacoesForDisciplina(found.id, found.name));
      setMateriais(getMateriaisForDisciplinas([found.id]));
      setAnnouncements(getAnnouncementsForDisciplinas([found.id], true));
      setReadAnnouncementIds(getReadAnnouncementIds(normalizedEmail));
      const discSlides = getSlidesForDisciplina(found.id);
      setSlides(discSlides);
      setSelectedSlide((prev) => prev && discSlides.some((s) => s.id === prev.id) ? prev : (discSlides[0] || null));
    }
  };

  useEffect(() => {
    refreshData();

    // Sincroniza dados frescos de gravações da nuvem
    fetchGravacoesFromCloud().then(() => refreshData());

    const handleUpd = () => refreshData();
    const handleVisibilitySync = () => {
      if (document.visibilityState === 'visible') {
        fetchGravacoesFromCloud().then(() => refreshData());
      }
    };

    window.addEventListener('lms_disciplinas_updated', handleUpd);
    window.addEventListener('lms_livros_recomendados_updated', handleUpd);
    window.addEventListener('lms_gemini_notes_updated', handleUpd);
    window.addEventListener('lms_gravacoes_updated', handleUpd);
    window.addEventListener('lms_materials_updated', handleUpd);
    window.addEventListener('lms_announcements_updated', handleUpd);
    window.addEventListener('lms_read_announcements_updated', handleUpd);
    window.addEventListener('lms_slides_updated', handleUpd);
    document.addEventListener('visibilitychange', handleVisibilitySync);

    return () => {
      window.removeEventListener('lms_disciplinas_updated', handleUpd);
      window.removeEventListener('lms_livros_recomendados_updated', handleUpd);
      window.removeEventListener('lms_gemini_notes_updated', handleUpd);
      window.removeEventListener('lms_gravacoes_updated', handleUpd);
      window.removeEventListener('lms_materials_updated', handleUpd);
      window.removeEventListener('lms_announcements_updated', handleUpd);
      window.removeEventListener('lms_read_announcements_updated', handleUpd);
      window.removeEventListener('lms_slides_updated', handleUpd);
      document.removeEventListener('visibilitychange', handleVisibilitySync);
    };
  }, [disciplinaId, normalizedEmail]);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Lista de livros de referência do acervo para seleção rápida
  const bibliotecaBooks = useMemo(() => {
    return getAllBibliotecaBooks();
  }, []);

  const handleSelectBiblioBook = (bookId: string) => {
    setSelectedBiblioBookId(bookId);
    if (!bookId) return;
    const found = bibliotecaBooks.find((b) => b.id === bookId);
    if (found) {
      setBookTitle(found.title);
      setBookAuthor(found.author || '');
      setBookCategory(found.category || 'Bibliografia Recomendada');
      setBookUrl(found.drive_url || `https://drive.google.com/file/d/${found.id}/view`);
    }
  };

  const handleAddLivroRecomendado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disciplina || !bookTitle.trim() || !bookUrl.trim()) return;

    addLivroRecomendado({
      disciplina_id: disciplina.id,
      disciplina_name: disciplina.name,
      book_title: bookTitle.trim(),
      book_author: bookAuthor.trim(),
      book_url: bookUrl.trim(),
      biblioteca_book_id: selectedBiblioBookId || undefined,
      is_mandatory: isMandatoryBook,
      category: bookCategory.trim() || 'Bibliografia Recomendada',
      notes: bookNotes.trim(),
      added_by_name: normalizedEmail.includes('sacra') || normalizedEmail.includes('cristiano') || normalizedEmail.includes('riffocristianmision') ? 'Cristiano Sacramento' : normalizedEmail.includes('ary') ? 'Profº Ary Júnior' : normalizedEmail.includes('camila') ? 'Monitora Camila' : 'Docente / Coordenação',
      added_by_role: currentRole === 'admin' ? 'admin' : currentRole === 'monitor' ? 'monitor' : 'professor',
      added_by_email: normalizedEmail,
    });

    showToast(`Livro "${bookTitle}" adicionado à bibliografia da matéria!`);
    setIsAddBookModalOpen(false);
    setBookTitle('');
    setBookAuthor('');
    setBookUrl('');
    setBookNotes('');
    setIsMandatoryBook(false);
    setSelectedBiblioBookId('');
    setBiblioSearchQuery('');
    refreshData();
  };

  const handleDeleteLivro = (id: string, title: string) => {
    if (confirm(`Deseja remover o livro "${title}" da bibliografia recomendada?`)) {
      deleteLivroRecomendado(id);
      showToast(`Livro removido da bibliografia.`);
      refreshData();
    }
  };

  const handleOpenEditLivro = (livro: LivroRecomendadoDisciplina) => {
    setEditingBookId(livro.id);
    setEditBookTitle(livro.book_title);
    setEditBookAuthor(livro.book_author || '');
    setEditBookUrl(livro.book_url || '');
    setEditBookNotes(livro.notes || '');
    setEditBookCategory(livro.category || 'Bibliografia Recomendada');
    setEditIsMandatoryBook(livro.is_mandatory || false);
    setEditSelectedBiblioBookId(livro.biblioteca_book_id || '');
    setEditBiblioSearchQuery('');
    setIsEditBookModalOpen(true);
  };

  const handleSaveEditLivro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disciplina || !editBookTitle.trim() || !editBookUrl.trim()) return;

    updateLivroRecomendado({
      id: editingBookId,
      disciplina_id: disciplina.id,
      disciplina_name: disciplina.name,
      book_title: editBookTitle.trim(),
      book_author: editBookAuthor.trim(),
      book_url: editBookUrl.trim(),
      biblioteca_book_id: editSelectedBiblioBookId || undefined,
      is_mandatory: editIsMandatoryBook,
      category: editBookCategory.trim() || 'Bibliografia Recomendada',
      notes: editBookNotes.trim(),
      added_by_name: normalizedEmail.includes('sacra') || normalizedEmail.includes('cristiano') || normalizedEmail.includes('riffocristianmision') ? 'Cristiano Sacramento' : normalizedEmail.includes('ary') ? 'Profº Ary Júnior' : normalizedEmail.includes('camila') ? 'Monitora Camila' : 'Docente / Coordenação',
      added_by_role: currentRole === 'admin' ? 'admin' : currentRole === 'monitor' ? 'monitor' : 'professor',
      added_by_email: normalizedEmail,
      created_at: new Date().toISOString(),
    });

    showToast(`Livro "${editBookTitle}" atualizado com sucesso!`);
    setIsEditBookModalOpen(false);
    refreshData();
  };

  const handleAddLeitura = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disciplina || !leituraTitle.trim() || !leituraLinkUrl.trim()) return;

    addAnnouncement({
      disciplina_id: disciplina.id,
      disciplina_name: disciplina.name,
      title: leituraTitle.trim(),
      link_url: leituraLinkUrl.trim(),
      message: leituraMessage.trim(),
      category: leituraCategory,
      target_date: leituraTargetDate.trim() || undefined,
      author_name: normalizedEmail.includes('sacra') || normalizedEmail.includes('cristiano') || normalizedEmail.includes('riffocristianmision') ? 'Cristiano Sacramento' : normalizedEmail.includes('ary') ? 'Profº Ary Júnior' : normalizedEmail.includes('camila') ? 'Monitora Camila' : 'Docente / Coordenação',
      author_role: currentRole === 'admin' ? 'admin' : currentRole === 'monitor' ? 'monitor' : 'professor',
      author_email: normalizedEmail,
      is_pinned: true,
    });

    showToast(`Leitura/Link "${leituraTitle}" cadastrado com sucesso!`);
    setIsAddLeituraModalOpen(false);
    setLeituraTitle('');
    setLeituraLinkUrl('');
    setLeituraMessage('');
    setLeituraCategory('pre_aula');
    setLeituraTargetDate('');
    refreshData();
  };

  const handleOpenEditLeitura = (aviso: AvisoLeituraPreAula) => {
    setEditingLeituraId(aviso.id);
    setEditLeituraTitle(aviso.title);
    setEditLeituraLinkUrl(aviso.link_url || '');
    setEditLeituraMessage(aviso.message || '');
    setEditLeituraCategory((aviso.category as any) || 'pre_aula');
    setEditLeituraTargetDate(aviso.target_date || '');
    setIsEditLeituraModalOpen(true);
  };

  const handleSaveEditLeitura = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disciplina || !editLeituraTitle.trim() || !editLeituraLinkUrl.trim()) return;

    const existing = announcements.find((a) => a.id === editingLeituraId);
    if (!existing) return;

    updateAnnouncement({
      ...existing,
      title: editLeituraTitle.trim(),
      link_url: editLeituraLinkUrl.trim(),
      message: editLeituraMessage.trim(),
      category: editLeituraCategory,
      target_date: editLeituraTargetDate.trim() || undefined,
    });

    showToast(`Leitura "${editLeituraTitle}" atualizada com sucesso!`);
    setIsEditLeituraModalOpen(false);
    refreshData();
  };

  const handleDeleteLeitura = (id: string, title: string) => {
    if (confirm(`Deseja remover a leitura "${title}" da matéria?`)) {
      deleteAnnouncement(id);
      showToast(`Leitura removida.`);
      refreshData();
    }
  };

  const handleAddGeminiNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disciplina || !geminiTitle.trim() || !geminiUrl.trim()) return;

    addGeminiNote({
      disciplina_id: disciplina.id,
      disciplina_name: disciplina.name,
      aula_num: Number(geminiAulaNum),
      data_aula: geminiDataAula.trim() || 'Semestre 2026.2',
      title: geminiTitle.trim(),
      gemini_url: geminiUrl.trim(),
      summary_snippet: geminiSnippet.trim(),
      author_name: normalizedEmail.includes('sacra') || normalizedEmail.includes('cristiano') || normalizedEmail.includes('riffocristianmision') ? 'Cristiano Sacramento' : normalizedEmail.includes('camila') ? 'Monitora Camila' : normalizedEmail.includes('ary') ? 'Profº Ary Júnior' : 'Monitoria / Docente',
      author_role: currentRole === 'admin' ? 'admin' : currentRole === 'monitor' ? 'monitor' : 'professor',
      author_email: normalizedEmail,
    });

    showToast(`Anotação do Gemini adicionada com sucesso à matéria!`);
    setIsAddGeminiModalOpen(false);
    setGeminiTitle('');
    setGeminiUrl('');
    setGeminiSnippet('');
    setGeminiDataAula('');
    refreshData();
  };

  const handleDeleteGemini = (id: string) => {
    if (confirm('Deseja remover este link de anotação do Gemini?')) {
      deleteGeminiNote(id);
      showToast('Anotação removida.');
      refreshData();
    }
  };

  const handleOpenEditGemini = (note: GeminiNoteItem) => {
    setEditingGeminiId(note.id);
    setEditGeminiDisciplinaId(note.disciplina_id || disciplina?.id || 'disc-1');
    setEditGeminiAulaNum(note.aula_num || 1);
    setEditGeminiDataAula(note.data_aula || '');
    setEditGeminiTitle(note.title || '');
    setEditGeminiUrl(note.gemini_url || '');
    setEditGeminiSnippet(note.summary_snippet || '');
    setIsEditGeminiModalOpen(true);
  };

  const handleSaveEditGemini = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGeminiId || !editGeminiUrl.trim()) return;

    const allDisc = getAllDisciplinas();
    const targetDisc = allDisc.find((d) => d.id === editGeminiDisciplinaId) || disciplina;

    updateGeminiNote(editingGeminiId, {
      disciplina_id: editGeminiDisciplinaId,
      disciplina_name: targetDisc?.name || disciplina?.name || 'Matéria',
      aula_num: Number(editGeminiAulaNum),
      data_aula: editGeminiDataAula.trim() || 'Semestre 2026.2',
      title: editGeminiTitle.trim() || `Anotações Gemini • Aula ${editGeminiAulaNum} • ${targetDisc?.name}`,
      gemini_url: editGeminiUrl.trim(),
      summary_snippet: editGeminiSnippet.trim(),
    });

    showToast(`Anotações do Gemini da Aula ${editGeminiAulaNum} atualizadas com sucesso!`);
    setIsEditGeminiModalOpen(false);
    refreshData();
  };

  const handleOpenEditGravacao = (rec: GravacaoAulaItem) => {
    setEditingGravacaoId(rec.id);
    setEditDisciplinaId(rec.disciplina_id || disciplina?.id || 'disc-1');
    setEditAulaNum(rec.aula_num || 1);
    setEditDataAula(rec.data_aula || '');
    setEditTitle(rec.title || '');
    setEditVideoUrl(rec.video_url || '');
    setEditDurationFormatted(rec.duration_formatted || '');
    setIsEditGravacaoModalOpen(true);
  };

  const handleSaveEditGravacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGravacaoId || !editVideoUrl.trim()) return;

    const allDisc = getAllDisciplinas();
    const targetDisc = allDisc.find((d) => d.id === editDisciplinaId) || disciplina;

    updateGravacao(editingGravacaoId, {
      disciplina_id: editDisciplinaId,
      disciplina_name: targetDisc?.name || disciplina?.name || 'Matéria',
      aula_num: Number(editAulaNum),
      data_aula: editDataAula.trim() || 'Semestre 2026.2',
      title: editTitle.trim() || `Aula ${editAulaNum} • ${targetDisc?.name}`,
      video_url: editVideoUrl.trim(),
      duration_formatted: editDurationFormatted.trim() || undefined,
    });

    showToast(`Gravação da Aula ${editAulaNum} atualizada com sucesso!`);
    setIsEditGravacaoModalOpen(false);
    refreshData();
  };

  const handleAddGravacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGravacaoVideoUrl.trim() || !disciplina) return;

    const allDisc = getAllDisciplinas();
    const targetDisc = allDisc.find((d) => d.id === (newGravacaoDisciplinaId || disciplina.id)) || disciplina;

    const finalTitle = newGravacaoTitle.trim() || `Aula ${newGravacaoAulaNum} • ${targetDisc.name} (Gravação HD)`;

    addGravacao({
      disciplina_id: targetDisc.id,
      disciplina_name: targetDisc.name,
      aula_num: Number(newGravacaoAulaNum),
      data_aula: newGravacaoDataAula.trim() || new Date().toLocaleDateString('pt-BR'),
      title: finalTitle,
      video_url: newGravacaoVideoUrl.trim(),
      duration_formatted: newGravacaoDuration.trim() || 'Aula Gravada',
      duration_seconds: 0,
      recorded_by_name: normalizedEmail.includes('ary') ? 'Profº Ary Júnior' : normalizedEmail.includes('robson') || normalizedEmail.includes('sacra') ? 'Cristiano Sacramento' : normalizedEmail.includes('camila') ? 'Monitora Camila' : 'Monitoria / Coordenação',
      recorded_by_role: currentRole === 'admin' ? 'admin' : currentRole === 'professor' ? 'professor' : 'monitor',
      recorded_by_email: normalizedEmail,
      is_restricted_lms: true,
    });

    showToast(`Gravação da Aula ${newGravacaoAulaNum} adicionada com sucesso!`);
    setIsAddGravacaoModalOpen(false);
    setNewGravacaoTitle('');
    setNewGravacaoVideoUrl('');
    setNewGravacaoDuration('');
    setNewGravacaoDataAula('');
    refreshData();
  };

  // Handlers de Gestão de Materiais & Apostilas
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialTitle.trim() || !disciplina) return;

    addMaterial({
      disciplina_id: disciplina.id,
      disciplina_name: disciplina.name,
      title: newMaterialTitle.trim(),
      google_drive_url: newMaterialDriveUrl.trim() || undefined,
      file_url: newMaterialDriveUrl.trim() || undefined,
      file_type: newMaterialType || 'pdf',
    });

    showToast(`Material "${newMaterialTitle.trim()}" adicionado com sucesso!`);
    setIsAddMaterialModalOpen(false);
    setNewMaterialTitle('');
    setNewMaterialDriveUrl('');
    setNewMaterialType('pdf');
    refreshData();
  };

  const handleOpenEditMaterial = (mat: Material) => {
    setEditingMaterialId(mat.id);
    setEditMaterialTitle(mat.title);
    setEditMaterialDriveUrl(mat.google_drive_url || mat.file_url || '');
    setEditMaterialType(mat.file_type || 'pdf');
    setIsEditMaterialModalOpen(true);
  };

  const handleSaveEditMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterialId || !editMaterialTitle.trim()) return;

    updateMaterial(editingMaterialId, {
      title: editMaterialTitle.trim(),
      google_drive_url: editMaterialDriveUrl.trim() || undefined,
      file_url: editMaterialDriveUrl.trim() || undefined,
      file_type: editMaterialType || 'pdf',
    });

    showToast(`Material "${editMaterialTitle.trim()}" atualizado com sucesso!`);
    setIsEditMaterialModalOpen(false);
    refreshData();
  };

  const handleDeleteMaterial = (id: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o material "${title}" desta matéria?`)) {
      deleteMaterial(id);
      showToast(`Material "${title}" excluído com sucesso!`);
      refreshData();
    }
  };

  // Helper para conversão de link de apresentação para embed seguro
  const getSlideEmbedUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('docs.google.com/presentation/d/')) {
      return url.replace(/\/edit.*$/, '/embed?start=false&loop=false&delayms=3000')
                .replace(/\/view.*$/, '/embed?start=false&loop=false&delayms=3000');
    }
    if (url.includes('drive.google.com/file/d/')) {
      return url.replace(/\/view.*$/, '/preview');
    }
    return url;
  };

  // Cadastro de Novo Slide
  const handleAddSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disciplina || !newSlideUrl.trim()) return;

    const item = addSlideItem({
      disciplina_id: disciplina.id,
      aula_num: Number(newSlideAulaNum),
      data_aula: newSlideDataAula.trim() || undefined,
      title: newSlideTitle.trim() || `Slides • Aula ${newSlideAulaNum} • ${disciplina.name}`,
      slide_url: newSlideUrl.trim(),
      notes: newSlideNotes.trim() || undefined,
      author_name: normalizedEmail.includes('ary') ? 'Profº Ary Júnior' : normalizedEmail.includes('cleiton') ? 'Profº Cleiton Barbirato' : normalizedEmail.includes('hilario') ? 'Profº Hilário Bispo' : 'Docente / Monitoria',
    });

    showToast(`Slides da Aula ${newSlideAulaNum} cadastrados com sucesso!`);
    setIsAddSlideModalOpen(false);
    setNewSlideTitle('');
    setNewSlideUrl('');
    setNewSlideNotes('');
    setSelectedSlide(item);
    refreshData();
  };

  // Exclusão de Slide
  const handleDeleteSlide = (id: string, title: string) => {
    if (confirm(`Deseja remover a apresentação "${title}"?`)) {
      deleteSlideItem(id);
      showToast('Apresentação de slides removida.');
      refreshData();
    }
  };

  // Edição de Slide
  const handleOpenEditSlide = (slide: SlideItem) => {
    setEditingSlideId(slide.id);
    setEditSlideAulaNum(slide.aula_num || 1);
    setEditSlideDataAula(slide.data_aula || '');
    setEditSlideTitle(slide.title || '');
    setEditSlideUrl(slide.slide_url || '');
    setEditSlideNotes(slide.notes || '');
    setIsEditSlideModalOpen(true);
  };

  const handleSaveEditSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlideId || !editSlideUrl.trim() || !disciplina) return;

    updateSlideItem(editingSlideId, {
      aula_num: Number(editSlideAulaNum),
      data_aula: editSlideDataAula.trim() || undefined,
      title: editSlideTitle.trim() || `Slides • Aula ${editSlideAulaNum} • ${disciplina.name}`,
      slide_url: editSlideUrl.trim(),
      notes: editSlideNotes.trim() || undefined,
    });

    showToast(`Slides da Aula ${editSlideAulaNum} atualizados com sucesso!`);
    setIsEditSlideModalOpen(false);
    refreshData();
  };

  // Edição dos Dados da Matéria / Links das Aulas diretamente pelo Hub
  const handleOpenEditDisciplinaHub = (d: Disciplina) => {
    setEditHubMeetUrl(d.google_meet_url || '');
    setEditHubMeetPhone(d.google_meet_phone || '');
    setEditHubMeetPin(d.google_meet_pin || '');
    setEditHubDriveUrl(d.google_drive_url || '');
    setEditHubAttendanceUrl(d.attendance_form_url || '');
    setEditHubDescription(d.description || '');
    setIsEditDisciplinaHubModalOpen(true);
  };

  const handleSaveEditDisciplinaHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disciplina) return;

    const updatedDisc: Disciplina = {
      ...disciplina,
      google_meet_url: editHubMeetUrl.trim() || undefined,
      google_meet_phone: editHubMeetPhone.trim() || undefined,
      google_meet_pin: editHubMeetPin.trim() || undefined,
      google_drive_url: editHubDriveUrl.trim() || undefined,
      attendance_form_url: editHubAttendanceUrl.trim() || undefined,
      description: editHubDescription.trim() || '',
    };

    updateDisciplina(updatedDisc);
    setDisciplina(updatedDisc);
    showToast('Dados da matéria e links das aulas atualizados com sucesso!');
    setIsEditDisciplinaHubModalOpen(false);
    refreshData();
  };

  // Importar Resumo do Gemini diretamente para o Caderno Cornell do Aluno
  const handleImportGeminiToCornell = (note: GeminiNoteItem) => {
    const defaultStudentEmail = normalizedEmail || 'sacrasub@gmail.com';
    const noteId = `note-${disciplina?.code?.toLowerCase() || 'disc'}-${(note.data_aula || '').replace(/[^0-9]/g, '-') || Date.now()}`;
    
    saveCornellNote(defaultStudentEmail, {
      id: noteId,
      user_email: defaultStudentEmail,
      date: note.data_aula || new Date().toISOString().slice(0, 10),
      disciplina_code: disciplina?.code || 'MAT',
      disciplina_name: disciplina?.name || 'Disciplina',
      theme: note.title || `Anotações Gemini • Aula ${note.aula_num || 1} • ${disciplina?.name}`,
      professor_name: disciplina?.professor_name || 'Corpo Docente',
      biblical_references: 'Consulte as referências da matéria no plano de ensino',
      cues: `• Quais os conceitos fundamentais da Aula ${note.aula_num || 1} de ${disciplina?.name}?
• Síntese da discussão teológica e exegética
• Aplicação prática e ministerial`,
      notes: note.summary_snippet || `Resumo estruturado gerado pelo Gemini na aula:\n${note.title}`,
      summary: `Síntese da Aula ${note.aula_num || 1}: ${note.summary_snippet ? note.summary_snippet.slice(0, 180) + '...' : 'Anotações da aula vinculadas com sucesso.'}`,
      ai_summary_url: note.gemini_url,
      ai_summary_text: note.summary_snippet,
      tags: [disciplina?.name || 'Matéria', `Aula ${note.aula_num || 1}`, 'Gemini IA'],
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lms_student_sync_updated', { detail: { email: defaultStudentEmail } }));
      window.dispatchEvent(new CustomEvent('lms_cornell_updated'));
    }

    showToast(`✨ Resumo Gemini da Aula ${note.aula_num || 1} introduzido com sucesso no seu Caderno Cornell!`);
  };

  // Importar Conteúdo de Slides diretamente para o Caderno Cornell
  const handleImportSlideToCornell = (slide: SlideItem) => {
    const defaultStudentEmail = normalizedEmail || 'sacrasub@gmail.com';
    const noteId = `note-${disciplina?.code?.toLowerCase() || 'disc'}-slide-${slide.aula_num}-${Date.now()}`;
    
    saveCornellNote(defaultStudentEmail, {
      id: noteId,
      user_email: defaultStudentEmail,
      date: slide.data_aula || new Date().toISOString().slice(0, 10),
      disciplina_code: disciplina?.code || 'MAT',
      disciplina_name: disciplina?.name || 'Disciplina',
      theme: slide.title || `Slides • Aula ${slide.aula_num} • ${disciplina?.name}`,
      professor_name: disciplina?.professor_name || 'Corpo Docente',
      biblical_references: 'Tópicos baseados nos slides da disciplina',
      cues: `• Estrutura temática e tópicos da Aula ${slide.aula_num}
• Pontos centrais da apresentação de slides`,
      notes: slide.notes || `Conteúdo do slide: ${slide.title}\nLink da apresentação: ${slide.slide_url}`,
      summary: `Síntese dos tópicos dos slides da Aula ${slide.aula_num} de ${disciplina?.name}.`,
      tags: [disciplina?.name || 'Matéria', `Slides Aula ${slide.aula_num}`],
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lms_student_sync_updated', { detail: { email: defaultStudentEmail } }));
      window.dispatchEvent(new CustomEvent('lms_cornell_updated'));
    }

    showToast(`✨ Tópicos do Slide da Aula ${slide.aula_num} introduzidos com sucesso no Caderno Cornell!`);
  };

  if (!disciplina) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-gray-200">
        <p className="text-gray-500 font-bold text-sm">Disciplina não encontrada.</p>
        <button
          onClick={onBack}
          className="mt-3 px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold"
        >
          Voltar
        </button>
      </div>
    );
  }

  // Aulas do semestre para o cronograma
  const turmaIdx = disciplina.turma_idx ?? 1;
  const cronogramaAulas = getAulasByTurma(turmaIdx).filter((a) => a.disciplina_name === disciplina.name || a.disciplina_id === disciplina.id);

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

      {/* Barra de Navegação e Seletor de Disciplinas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold text-xs border border-gray-200 transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para as Matérias</span>
          </button>

          <span className="text-gray-300 hidden sm:inline">|</span>

            {/* Seletor Rápido de Matéria */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-semibold">Matéria:</span>
              <select
                value={disciplina.id}
                onChange={(e) => {
                  const newId = e.target.value;
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('lms_open_disciplina_detail', { detail: { disciplinaId: newId } }));
                  }
                }}
                aria-label="Selecionar Disciplina"
                className="bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xs rounded-xl px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer max-w-[240px] sm:max-w-md truncate"
              >
                {availableDisciplinas.map((d, idx) => {
                  const cleanName = d.name.replace(/^\d{1,2}\s*[-–.]\s*/, '');
                  const numStr = String(idx + 1).padStart(2, '0');
                  return (
                    <option key={d.id} value={d.id}>
                      {numStr} - {cleanName} ({d.code || 'MAT'})
                    </option>
                  );
                })}
              </select>
            </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-gray-500 font-semibold hidden md:inline">Hub da Disciplina</span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-900 border border-blue-200">
            {disciplina.code || 'MAT-2026'}
          </span>
        </div>
      </div>

      {/* BANNER PRINCIPAL DO HUB DA MATÉRIA */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div className="space-y-3 max-w-3xl relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/30 text-blue-200 border border-blue-400/30 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
              {disciplina.turma_idx === 2 ? 'Turma B (3º Período)' : disciplina.turma_idx === 0 ? 'Fim de Semana' : 'Turma A (7º Período)'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              {disciplina.day_of_week} • {disciplina.start_time} às {disciplina.end_time}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            {disciplina.name}
          </h1>

          <p className="text-xs sm:text-sm text-blue-200 leading-relaxed max-w-2xl">
            {disciplina.description || 'Página de gestão acadêmica, bibliografia recomendada, anotações de aula do Gemini IA e materiais de estudo.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-blue-100 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-300 font-bold">Docente:</span>
              <span>{disciplina.professor_name}</span>
            </div>
            {disciplina.monitor_name && (
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-300 font-bold">Monitor(a):</span>
                <span>{disciplina.monitor_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Barra de Ações Rápidas do Cabeçalho */}
        <div className="flex flex-wrap items-center gap-2.5 pt-5 border-t border-white/10 mt-5">
          {disciplina.google_meet_url ? (
            <a
              data-tour="btn-google-meet"
              href={disciplina.google_meet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 active:scale-95"
            >
              <Video className="w-4 h-4" />
              <span>Entrar no Google Meet</span>
            </a>
          ) : (
            <span className="text-xs text-gray-400 bg-white/10 px-3 py-2 rounded-xl">Sem link Meet</span>
          )}

          {/* Botão Transcrever ao Vivo */}
          <button
            onClick={() => {
              if (onTabChange) onTabChange('aluno-caderno');
              setTimeout(() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('lms_open_transcriber', {
                    detail: {
                      disciplina_name: disciplina.name,
                      disciplina_code: disciplina.code,
                      date: new Date().toISOString().split('T')[0],
                    }
                  }));
                }
              }, 150);
            }}
            className="py-2.5 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-100 hover:text-white font-bold text-xs rounded-xl border border-red-400/30 transition flex items-center gap-2 active:scale-95 cursor-pointer shadow-xs"
            title="Abrir transcritor em tempo real para captar o áudio desta matéria"
          >
            <Mic className="w-4 h-4 text-red-400 animate-pulse" />
            <span>Transcrever ao Vivo</span>
          </button>

          {disciplina.google_drive_url && (
            <a
              href={disciplina.google_drive_url}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-2 active:scale-95"
            >
              <FolderOpen className="w-4 h-4 text-amber-300" />
              <span>Pasta no Drive</span>
            </a>
          )}

          {!isAluno && disciplina.attendance_form_url && (
            <a
              href={disciplina.attendance_form_url}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-2 active:scale-95"
            >
              <UserCheck className="w-4 h-4 text-emerald-300" />
              <span>Lista de Presença</span>
            </a>
          )}

          {canManage && (
            <button
              onClick={() => handleOpenEditDisciplinaHub(disciplina)}
              className="py-2.5 px-4 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-2 active:scale-95 cursor-pointer"
              title="Editar dados da matéria, link do Meet, Drive e presença"
            >
              <Settings className="w-4 h-4 text-cyan-300" />
              <span>Manejar Matéria</span>
            </button>
          )}

          {canRecord && (
            <button
              data-tour="btn-record-meet"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('lms_open_recorder', {
                    detail: { disciplinaId: disciplina.id, aulaNum: 1 }
                  }));
                }
              }}
              className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer animate-pulse"
              title="Gravar a aba do Meet em 2º plano enquanto usa o computador livremente"
            >
              <Video className="w-4 h-4" />
              <span>🔴 Gravar Aula ao Vivo (HD)</span>
            </button>
          )}


          {currentRole !== 'professor' && (
            <button
              onClick={() => {
                if (onTabChange) onTabChange('aluno-caderno');
                else if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('lms_change_tab', { detail: 'aluno-caderno' }));
                }
              }}
              className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 active:scale-95 ml-auto cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Caderno Cornell IA</span>
            </button>
          )}
        </div>
      </div>

      {/* ABAS DE NAVEGAÇÃO DA MATÉRIA */}
      <div data-tour="hub-subtabs" className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-gray-200/80 shadow-2xs text-xs font-bold no-scrollbar">
        <button
          onClick={() => setActiveSubTab('geral')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'geral'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Visão Geral & Hub</span>
        </button>

        <button
          onClick={() => setActiveSubTab('slides')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'slides'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Presentation className="w-4 h-4 text-purple-500" />
          <span>Slides das Aulas ({slides.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gravacoes')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'gravacoes'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Video className="w-4 h-4 text-red-500" />
          <span>Gravações ({gravacoes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('livros')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'livros'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span>Livros Recomendados ({livrosRecomendados.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gemini')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'gemini'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Materiais & Gemini Notebook ({geminiNotes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('aulas')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'aulas'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Cronograma de Aulas</span>
        </button>

        <button
          onClick={() => setActiveSubTab('materiais')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'materiais'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-blue-600" />
          <span>Materiais ({materiais.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('leituras')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'leituras'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4 text-orange-500" />
          <span>Leituras Pré-Aula ({announcements.length})</span>
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}

      {/* ABA 1: VISÃO GERAL (RESUMO DAS SEÇÕES) */}
      {activeSubTab === 'geral' && (
        <div className="space-y-6">
          {/* SEÇÃO 1: LIVROS RECOMENDADOS EM DESTAQUE */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Bibliografia & Livros Recomendados</h3>
                  <p className="text-xs text-gray-500">Obras e livros fundamentais indicados pelo professor para esta matéria.</p>
                </div>
              </div>

              {canManage && (
                <button
                  onClick={() => setIsAddBookModalOpen(true)}
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Indicar Livro</span>
                </button>
              )}
            </div>

            {livrosRecomendados.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-gray-200 text-xs text-gray-500 space-y-2">
                <BookOpen className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="font-semibold text-gray-700">Nenhum livro recomendado adicionado até o momento.</p>
                {canManage && (
                  <button
                    onClick={() => setIsAddBookModalOpen(true)}
                    className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold"
                  >
                    + Adicionar Livro Recomendado
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {livrosRecomendados.map((livro) => (
                  <div
                    key={livro.id}
                    className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                      livro.is_mandatory 
                        ? 'border-amber-400 bg-amber-50/40 hover:border-amber-500 shadow-sm' 
                        : 'border-amber-200/90 bg-amber-50/20 hover:bg-white hover:border-amber-400 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md">
                            {livro.category || 'Bibliografia Recomendada'}
                          </span>
                          {livro.is_mandatory && (
                            <span className="text-[9px] font-black uppercase tracking-wide bg-rose-500 text-white px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                              ⭐ Obrigatória
                            </span>
                          )}
                          {livro.biblioteca_book_id && (
                            <span className="text-[9px] font-bold bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Library className="w-3 h-3 text-blue-700" /> Acervo Digital
                            </span>
                          )}
                        </div>
                        {canManage && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditLivro(livro)}
                              className="px-2 py-1 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                              title="Editar Livro Recomendado"
                            >
                              <Edit3 className="w-3 h-3 text-amber-700" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLivro(livro.id, livro.book_title)}
                              className="text-gray-400 hover:text-red-600 p-1 transition cursor-pointer"
                              title="Remover recomendação"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                        {livro.book_title}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        Autor: <strong>{livro.book_author || 'Não especificado'}</strong>
                      </p>

                      {livro.notes && (
                        <p className="text-xs text-amber-900/90 bg-amber-100/70 p-2.5 rounded-xl border border-amber-200/60 italic mt-2">
                          📌 "{livro.notes}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] text-gray-500">Por: {livro.added_by_name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (onTabChange) {
                              onTabChange('aluno-biblioteca');
                            } else {
                              window.dispatchEvent(new CustomEvent('lms_change_tab', { detail: 'aluno-biblioteca' }));
                            }
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent('lms_search_biblioteca', { detail: livro.book_title }));
                            }, 60);
                          }}
                          className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                          title="Consultar e ler na Biblioteca Digital"
                        >
                          <Library className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Biblioteca Digital</span>
                        </button>
                        <a
                          href={livro.book_url && !livro.book_url.includes('1Xl2x4f-default-book') ? livro.book_url : (disciplina.google_drive_url || 'https://drive.google.com')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Acessar Obra</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEÇÃO 2: ANOTAÇÕES DA IA GEMINI EM DESTAQUE */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-900 rounded-xl">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Anotações & Resumos da IA Gemini</h3>
                  <p className="text-xs text-gray-500">Resumos estruturados das aulas e debates gravados.</p>
                </div>
              </div>

              {canManage && (
                <button
                  onClick={() => setIsAddGeminiModalOpen(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Link Gemini</span>
                </button>
              )}
            </div>

            {geminiNotes.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-gray-200 text-xs text-gray-500 space-y-2">
                <Sparkles className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="font-semibold text-gray-700">Nenhum resumo do Gemini anexado a esta matéria.</p>
                {canManage && (
                  <button
                    onClick={() => setIsAddGeminiModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                  >
                    + Inserir Link do Gemini Docs
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {geminiNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-5 rounded-2xl border border-indigo-200/90 bg-indigo-50/20 hover:bg-white hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-md">
                          Aula {note.aula_num || 1} • {note.data_aula}
                        </span>
                        {canManage && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditGemini(note)}
                              className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                              title="Editar Aula / Matéria da Nota"
                            >
                              <Edit3 className="w-3 h-3 text-indigo-600" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => handleDeleteGemini(note.id)}
                              className="text-gray-400 hover:text-red-600 p-1 transition cursor-pointer"
                              title="Remover nota"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                        {note.title}
                      </h4>

                      {note.summary_snippet && (
                        <p className="text-xs text-slate-600 line-clamp-3 bg-white p-3 rounded-xl border border-indigo-100 font-medium">
                          {note.summary_snippet}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] text-gray-500">Por: {note.author_name}</span>
                      <div className="flex items-center gap-2">
                        {currentRole !== 'professor' && (
                          <button
                            onClick={() => handleImportGeminiToCornell(note)}
                            className="py-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                            title="Introduzir este resumo no seu Caderno Cornell"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>Introduzir no Caderno Cornell</span>
                          </button>
                        )}
                        <a
                          href={note.gemini_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                          <span>Abrir Documento Gemini</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 2: APENAS LIVROS RECOMENDADOS */}
      {activeSubTab === 'livros' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-gray-900 text-base">Livros Recomendados ({livrosRecomendados.length})</h3>
            {canManage && (
              <button
                onClick={() => setIsAddBookModalOpen(true)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Indicar Novo Livro</span>
              </button>
            )}
          </div>

          {livrosRecomendados.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-gray-200 text-xs text-gray-500">
              Nenhuma indicação cadastrada para esta matéria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {livrosRecomendados.map((livro) => (
                <div
                  key={livro.id}
                  className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                    livro.is_mandatory 
                      ? 'border-amber-400 bg-amber-50/40 hover:border-amber-500 shadow-sm' 
                      : 'border-amber-200/90 bg-amber-50/20 hover:bg-white hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md">
                          {livro.category || 'Bibliografia'}
                        </span>
                        {livro.is_mandatory && (
                          <span className="text-[9px] font-black uppercase tracking-wide bg-rose-500 text-white px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                            ⭐ Obrigatória
                          </span>
                        )}
                        {livro.biblioteca_book_id && (
                          <span className="text-[9px] font-bold bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Library className="w-3 h-3 text-blue-700" /> Acervo Digital
                          </span>
                        )}
                      </div>
                      {canManage && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditLivro(livro)}
                            className="px-2 py-1 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                            title="Editar Livro Recomendado"
                          >
                            <Edit3 className="w-3 h-3 text-amber-700" />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLivro(livro.id, livro.book_title)}
                            className="text-gray-400 hover:text-red-600 p-1 transition cursor-pointer"
                            title="Remover recomendação"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base mt-1">{livro.book_title}</h4>
                    <p className="text-xs text-slate-600">Autor: <strong>{livro.book_author || '—'}</strong></p>

                    {livro.notes && (
                      <p className="text-xs text-amber-900/90 bg-amber-100/70 p-2.5 rounded-xl border border-amber-200/60 italic mt-2">
                        📌 "{livro.notes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] text-gray-500">Por: {livro.added_by_name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onTabChange) {
                            onTabChange('aluno-biblioteca');
                          } else {
                            window.dispatchEvent(new CustomEvent('lms_change_tab', { detail: 'aluno-biblioteca' }));
                          }
                          setTimeout(() => {
                            window.dispatchEvent(new CustomEvent('lms_search_biblioteca', { detail: livro.book_title }));
                          }, 60);
                        }}
                        className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        title="Consultar e ler na Biblioteca Digital"
                      >
                        <Library className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Biblioteca Digital</span>
                      </button>
                      <a
                        href={livro.book_url && !livro.book_url.includes('1Xl2x4f-default-book') ? livro.book_url : (disciplina.google_drive_url || 'https://drive.google.com')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Acessar Obra</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 3: MATERIAIS DE APOIO & GEMINI NOTEBOOK */}
      {activeSubTab === 'gemini' && (
        <SupportMaterialsHub
          disciplinaId={disciplina.id}
          currentRole={currentRole}
          userEmail={userEmail}
          onImportToCornellCallback={handleImportGeminiToCornell}
        />
      )}

      {/* ABA DE SLIDES DAS AULAS */}
      {activeSubTab === 'slides' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                <Presentation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">Slides & Apresentações das Aulas ({slides.length})</h3>
                <p className="text-xs text-gray-500">Navegue pelas aulas do semestre para acompanhamento em tempo real, estudo e revisão.</p>
              </div>
            </div>

            {canManage && (
              <button
                onClick={() => {
                  setNewSlideAulaNum(selectedSlideAulaNum || slides.length + 1);
                  setNewSlideTitle(`Slides • Aula ${selectedSlideAulaNum || slides.length + 1} • ${disciplina.name}`);
                  setIsAddSlideModalOpen(true);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Cadastrar Apresentação de Slide</span>
              </button>
            )}
          </div>

          {/* BARRA DE NAVEGAÇÃO ENTRE TODAS AS AULAS DO SEMESTRE (AULAS 1 A 18) */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-gray-200/80 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-purple-600" />
                  <span>Navegar entre as Aulas:</span>
                </span>
                <span className="text-[11px] font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>Aula {selectedSlideAulaNum} de 18</span>
                  <span className="text-purple-400">•</span>
                  <span className="font-mono text-purple-800 text-[10px]">
                    {getShortDateForLesson(selectedSlideAulaNum - 1, disciplina.day_of_week)}
                  </span>
                </span>
              </div>

              {/* Botões Anterior e Próxima */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={selectedSlideAulaNum <= 1}
                  onClick={() => setSelectedSlideAulaNum((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 border border-gray-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Aula Anterior</span>
                </button>
                <button
                  type="button"
                  disabled={selectedSlideAulaNum >= 18}
                  onClick={() => setSelectedSlideAulaNum((prev) => Math.min(18, prev + 1))}
                  className="px-3 py-1.5 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 border border-gray-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                >
                  <span>Próxima Aula</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pílulas de Seleção Direta de Aula (1 a 18) com Data Curta */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-0.5 no-scrollbar">
              {Array.from({ length: 18 }, (_, i) => i + 1).map((aulaNum) => {
                const isSelected = selectedSlideAulaNum === aulaNum;
                const hasSlide = slides.some((s) => s.aula_num === aulaNum);
                const shortDate = getShortDateForLesson(aulaNum - 1, disciplina.day_of_week);

                return (
                  <button
                    key={aulaNum}
                    type="button"
                    onClick={() => setSelectedSlideAulaNum(aulaNum)}
                    className={`py-1 px-2.5 rounded-xl font-bold transition flex flex-col items-center justify-center shrink-0 border cursor-pointer min-w-[58px] ${
                      isSelected
                        ? 'bg-purple-900 text-white border-purple-900 shadow-sm scale-102 ring-2 ring-purple-500/30'
                        : hasSlide
                        ? 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-[11px] leading-tight">Aula {aulaNum}</span>
                      {hasSlide && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-purple-600'}`} />
                      )}
                    </div>
                    <span className={`text-[9px] font-mono leading-none tracking-tight mt-0.5 ${isSelected ? 'text-purple-200 font-bold' : 'text-gray-400'}`}>
                      {shortDate}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* VISUALIZADOR DA AULA SELECIONADA */}
          {(() => {
            const activeSlide = slides.find((s) => s.aula_num === selectedSlideAulaNum);

            if (!activeSlide) {
              return (
                <div className="p-10 sm:p-14 text-center bg-slate-50 rounded-2xl border border-gray-200 text-xs text-gray-500 space-y-3 animate-in fade-in duration-200">
                  <Presentation className="w-12 h-12 text-gray-300 mx-auto" />
                  <div>
                    <h4 className="font-extrabold text-gray-800 text-sm">
                      Nenhum slide cadastrado para a Aula {selectedSlideAulaNum} ({getShortDateForLesson(selectedSlideAulaNum - 1, disciplina.day_of_week)})
                    </h4>
                    <p className="text-gray-500 text-xs mt-1 max-w-md mx-auto">
                      Os slides e apresentações serão disponibilizados pelo professor ou monitoria no decorrer do cronograma.
                    </p>
                  </div>

                  {canManage && (
                    <button
                      onClick={() => {
                        setNewSlideAulaNum(selectedSlideAulaNum);
                        setNewSlideTitle(`Slides • Aula ${selectedSlideAulaNum} • ${disciplina.name}`);
                        setNewSlideDataAula(new Date().toLocaleDateString('pt-BR'));
                        setIsAddSlideModalOpen(true);
                      }}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Cadastrar Slides da Aula {selectedSlideAulaNum}</span>
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className={`space-y-4 ${isFocusSlideMode ? 'fixed inset-0 z-50 bg-slate-950 p-4 sm:p-8 flex flex-col justify-between overflow-y-auto' : ''}`}>
                  {/* Cabeçalho do Visualizador */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide bg-purple-600 text-white px-2.5 py-0.5 rounded-md">
                          Aula {activeSlide.aula_num}
                        </span>
                        {activeSlide.data_aula && (
                          <span className="text-[10px] text-slate-300 font-mono">
                            {activeSlide.data_aula}
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-sm sm:text-base text-white mt-1">
                        {activeSlide.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                      {/* Botão Modo Foco / Expandir */}
                      <button
                        onClick={() => setIsFocusSlideMode(!isFocusSlideMode)}
                        className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                        title={isFocusSlideMode ? "Sair do Modo Foco" : "Modo Foco / Tela Cheia"}
                      >
                        {isFocusSlideMode ? (
                          <>
                            <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Reduzir</span>
                          </>
                        ) : (
                          <>
                            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Modo Foco</span>
                          </>
                        )}
                      </button>

                      {/* Botão Abrir na Aba Original */}
                      <a
                        href={activeSlide.slide_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Apresentação</span>
                      </a>

                      {/* Botão Enviar Tópicos para o Caderno Cornell */}
                      {currentRole !== 'professor' && (
                        <button
                          onClick={() => handleImportSlideToCornell(activeSlide)}
                          className="py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                          title="Importar tópicos e notas deste slide para seu Caderno Cornell"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                          <span>Caderno Cornell</span>
                        </button>
                      )}

                      {/* Botão Editar Slide (Professores, Monitores e Admin) */}
                      {canManage && (
                        <button
                          onClick={() => handleOpenEditSlide(activeSlide)}
                          className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                          title="Editar link ou dados da apresentação de slide"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar Slide</span>
                        </button>
                      )}

                      {/* Excluir se admin/monitor/professor */}
                      {canManage && (
                        <button
                          onClick={() => handleDeleteSlide(activeSlide.id, activeSlide.title)}
                          className="p-2 bg-red-900/60 hover:bg-red-800 text-red-300 rounded-xl transition cursor-pointer"
                          title="Remover apresentação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Container do Slide (Embed Iframe) & Guia de Estudo */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Embed Iframe Interativo do Slide */}
                    <div className="lg:col-span-3 bg-slate-900 rounded-2xl overflow-hidden border border-gray-200 shadow-inner flex flex-col min-h-[420px] sm:min-h-[520px]">
                      <iframe
                        src={getSlideEmbedUrl(activeSlide.slide_url)}
                        title={activeSlide.title}
                        className="w-full flex-1 border-0 min-h-[420px] sm:min-h-[520px]"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>

                    {/* Guia de Estudo e Anotações da Apresentação */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-3">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 border-b border-gray-200 pb-2">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                          <span>Guia de Estudo do Slide</span>
                        </div>

                        <div className="text-xs text-slate-700 leading-relaxed space-y-2">
                          <p className="font-semibold text-slate-900">
                            {activeSlide.title}
                          </p>
                          {activeSlide.notes ? (
                            <p className="p-3 bg-white rounded-xl border border-gray-200 text-[11px] text-slate-600 whitespace-pre-wrap">
                              {activeSlide.notes}
                            </p>
                          ) : (
                            <p className="text-[11px] text-gray-500 italic">
                              Acompanhe os slides junto com as anotações do Gemini e leituras pré-aula para melhor fixação.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Atalhos Rápidos */}
                      <div className="space-y-2 pt-2 border-t border-gray-200">
                        {currentRole !== 'professor' && (
                          <button
                            onClick={() => handleImportSlideToCornell(activeSlide)}
                            className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>Introduzir no Cornell</span>
                          </button>
                        )}
                        <a
                          href={activeSlide.slide_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 bg-white hover:bg-gray-100 text-slate-700 border border-gray-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                          <span>Baixar / Visualizar Tela Cheia</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ABA DE GRAVAÇÕES DE AULAS */}
      {activeSubTab === 'gravacoes' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-red-100 text-red-700 rounded-xl">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">Gravações das Aulas em HD ({gravacoes.length})</h3>
                <p className="text-xs text-gray-500">Vídeos armazenados no Google Drive restrito e acessíveis exclusivamente pelo LMS.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Seletor de Modo de Visualização */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setGravacoesViewMode('aula')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    gravacoesViewMode === 'aula'
                      ? 'bg-white text-red-700 shadow-2xs font-extrabold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🎬 Por Aula
                </button>
                <button
                  type="button"
                  onClick={() => setGravacoesViewMode('grid')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    gravacoesViewMode === 'grid'
                      ? 'bg-white text-red-700 shadow-2xs font-extrabold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📋 Grade Completa ({gravacoes.length})
                </button>
              </div>

              {canManageContent && (
                <>
                  <button
                    onClick={() => {
                      setNewGravacaoDisciplinaId(disciplina.id);
                      setNewGravacaoAulaNum(selectedGravacaoAulaNum || gravacoes.length + 1);
                      setNewGravacaoDataAula(new Date().toLocaleDateString('pt-BR'));
                      setNewGravacaoTitle(`Aula ${selectedGravacaoAulaNum || gravacoes.length + 1} • ${disciplina.name} (Gravação HD)`);
                      setIsAddGravacaoModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Cadastrar link direto do Google Drive ou vídeo gravado"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>+ Inserir Link do Drive</span>
                  </button>

                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(
                          new CustomEvent('lms_open_recorder', {
                            detail: {
                              disciplinaId: disciplina.id,
                              disciplina: disciplina.name,
                              aulaNum: selectedGravacaoAulaNum || gravacoes.length + 1,
                            },
                          })
                        );
                      }
                    }}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                    title="Gravar aula ao vivo com persistência em segundo plano"
                  >
                    <Video className="w-4 h-4" />
                    <span>🔴 Gravar Aula ao Vivo</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* BARRA DE NAVEGAÇÃO DE AULAS GRAVADAS QUANDO NO MODO 'POR AULA' */}
          {gravacoesViewMode === 'aula' && (
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-gray-200/80 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-red-600" />
                    <span>Navegar entre as Gravações:</span>
                  </span>
                  <span className="text-[11px] font-bold bg-red-100 text-red-900 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span>Aula {selectedGravacaoAulaNum} de 18</span>
                    <span className="text-red-400">•</span>
                    <span className="font-mono text-red-800 text-[10px]">
                      {getShortDateForLesson(selectedGravacaoAulaNum - 1, disciplina.day_of_week)}
                    </span>
                  </span>
                </div>

                {/* Botões Anterior e Próxima */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={selectedGravacaoAulaNum <= 1}
                    onClick={() => setSelectedGravacaoAulaNum((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 border border-gray-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Aula Anterior</span>
                  </button>
                  <button
                    type="button"
                    disabled={selectedGravacaoAulaNum >= 18}
                    onClick={() => setSelectedGravacaoAulaNum((prev) => Math.min(18, prev + 1))}
                    className="px-3 py-1.5 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 border border-gray-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                  >
                    <span>Próxima Aula</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Pílulas de Seleção Direta de Aula (1 a 18) com Data Curta */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-0.5 no-scrollbar">
                {Array.from({ length: 18 }, (_, i) => i + 1).map((aulaNum) => {
                  const isSelected = selectedGravacaoAulaNum === aulaNum;
                  const hasGravacao = gravacoes.some((g) => g.aula_num === aulaNum);
                  const shortDate = getShortDateForLesson(aulaNum - 1, disciplina.day_of_week);

                  return (
                    <button
                      key={aulaNum}
                      type="button"
                      onClick={() => setSelectedGravacaoAulaNum(aulaNum)}
                      className={`py-1 px-2.5 rounded-xl font-bold transition flex flex-col items-center justify-center shrink-0 border cursor-pointer min-w-[58px] ${
                        isSelected
                          ? 'bg-red-700 text-white border-red-700 shadow-sm scale-102 ring-2 ring-red-500/30'
                          : hasGravacao
                          ? 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100'
                          : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-[11px] leading-tight">Aula {aulaNum}</span>
                        {hasGravacao && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-red-600'}`} />
                        )}
                      </div>
                      <span className={`text-[9px] font-mono leading-none tracking-tight mt-0.5 ${isSelected ? 'text-red-200 font-bold' : 'text-gray-400'}`}>
                        {shortDate}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* EXIBIÇÃO: MODO 'POR AULA' */}
          {gravacoesViewMode === 'aula' && (() => {
            const activeGravacao = gravacoes.find((g) => g.aula_num === selectedGravacaoAulaNum);

            if (!activeGravacao) {
              return (
                <div className="p-10 sm:p-14 text-center bg-slate-50/90 rounded-2xl border border-gray-200 text-xs text-gray-500 space-y-4 animate-in fade-in duration-200">
                  <Video className="w-12 h-12 text-gray-300 mx-auto" />
                  <div>
                    <h4 className="font-extrabold text-gray-800 text-sm">
                      Nenhuma gravação cadastrada para a Aula {selectedGravacaoAulaNum} ({getShortDateForLesson(selectedGravacaoAulaNum - 1, disciplina.day_of_week)})
                    </h4>
                    <p className="text-gray-500 text-xs mt-1 max-w-md mx-auto">
                      As gravações das aulas são salvas no Google Drive e disponibilizadas logo após o término da aula ao vivo no Meet.
                    </p>
                  </div>

                  {canManageContent && (
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setNewGravacaoDisciplinaId(disciplina.id);
                          setNewGravacaoAulaNum(selectedGravacaoAulaNum);
                          setNewGravacaoDataAula(new Date().toLocaleDateString('pt-BR'));
                          setNewGravacaoTitle(`Aula ${selectedGravacaoAulaNum} • ${disciplina.name} (Gravação HD)`);
                          setIsAddGravacaoModalOpen(true);
                        }}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-xs cursor-pointer"
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span>🔗 Inserir Link do Drive (Aula {selectedGravacaoAulaNum})</span>
                      </button>

                      <button
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('lms_open_recorder', {
                              detail: { disciplinaId: disciplina.id, aulaNum: selectedGravacaoAulaNum }
                            }));
                          }
                        }}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                        <span>🔴 Iniciar Gravação ao Vivo (Aula {selectedGravacaoAulaNum})</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div className="p-6 sm:p-7 rounded-3xl border border-red-200 bg-red-50/20 hover:bg-white transition space-y-4 shadow-sm animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-red-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wide bg-red-600 text-white px-3 py-1 rounded-lg">
                      Aula {activeGravacao.aula_num || selectedGravacaoAulaNum}
                    </span>
                    <span className="text-xs text-red-950 font-bold bg-red-100 px-2.5 py-0.5 rounded-md">
                      📅 {activeGravacao.data_aula || 'Semestre 2026.2'}
                    </span>
                    {activeGravacao.duration_formatted && (
                      <span className="text-xs text-slate-700 font-mono bg-white border border-gray-200 px-2.5 py-0.5 rounded-md">
                        ⏱ Duração: <strong>{activeGravacao.duration_formatted}</strong>
                      </span>
                    )}
                  </div>

                  {canManageContent && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleOpenEditGravacao(activeGravacao)}
                        className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                        title="Editar Matéria, Aula ou Detalhes da Gravação"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Editar Gravação</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja remover a gravação da Aula ${activeGravacao.aula_num}?`)) {
                            deleteGravacao(activeGravacao.id);
                            setGravacoes((prev) => prev.filter((g) => g.id !== activeGravacao.id));
                            showToast('Gravação removida com sucesso.');
                            refreshData();
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                        title="Remover vídeo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                    {activeGravacao.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Gravado por: <strong className="text-slate-700">{activeGravacao.recorded_by_name}</strong> ({activeGravacao.recorded_by_role})
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setActiveVideoModal({
                        isOpen: true,
                        title: activeGravacao.title,
                        videoUrl: activeGravacao.video_url,
                        aulaNum: activeGravacao.aula_num,
                      });
                    }}
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>Assistir Gravação em HD</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* EXIBIÇÃO: MODO 'GRADE COMPLETA' */}
          {gravacoesViewMode === 'grid' && (
            <div>
              {gravacoes.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-gray-200 text-xs text-gray-500">
                  Nenhuma gravação cadastrada para esta matéria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gravacoes.map((rec) => (
                    <div key={rec.id} className="p-5 rounded-2xl border border-red-200/80 bg-red-50/15 hover:bg-white hover:border-red-400 hover:shadow-md transition flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wide bg-red-100 text-red-900 px-2.5 py-0.5 rounded-md">
                            Aula {rec.aula_num || 1} • {rec.data_aula}
                          </span>
                          {canManageContent && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditGravacao(rec)}
                                className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer"
                                title="Editar Dados da Gravação"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Editar</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Deseja remover a gravação da Aula ${rec.aula_num}?`)) {
                                    deleteGravacao(rec.id);
                                    setGravacoes((prev) => prev.filter((g) => g.id !== rec.id));
                                    showToast('Gravação removida com sucesso.');
                                    refreshData();
                                  }
                                }}
                                className="text-gray-400 hover:text-red-600 p-1 transition cursor-pointer"
                                title="Remover vídeo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                          {rec.title}
                        </h4>

                        {rec.duration_formatted && (
                          <p className="text-xs text-slate-500 font-mono">
                            ⏱ Duração: <strong>{rec.duration_formatted}</strong>
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] text-gray-500">Por: {rec.recorded_by_name}</span>
                        <button
                          onClick={() => {
                            setActiveVideoModal({
                              isOpen: true,
                              title: rec.title,
                              videoUrl: rec.video_url,
                              aulaNum: rec.aula_num,
                            });
                          }}
                          className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Assistir</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ABA 4: CRONOGRAMA DE AULAS */}
      {activeSubTab === 'aulas' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-3">
            Cronograma das 18 Aulas do Semestre Letivo 2026.2
          </h3>

          <div className="space-y-3">
            {Array.from({ length: 18 }, (_, idx) => {
              const aulaNum = idx + 1;
              const lessonDate = getDateForLesson(idx, disciplina.day_of_week);
              const matchingGemini = geminiNotes.find((g) => g.aula_num === aulaNum);
              const matchingGravacao = gravacoes.find((g) => g.aula_num === aulaNum);

              return (
                <div
                  key={aulaNum}
                  className="p-4 rounded-2xl border border-gray-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-xs transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-blue-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      {aulaNum}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        Aula {aulaNum} • {disciplina.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Data prevista: <strong>{lessonDate}</strong> • {disciplina.day_of_week} ({disciplina.start_time})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                    {/* Botão de Assistir Vídeo Gravado */}
                    {matchingGravacao ? (
                      <button
                        onClick={() => {
                          setActiveVideoModal({
                            isOpen: true,
                            title: matchingGravacao.title,
                            videoUrl: matchingGravacao.video_url,
                            aulaNum: matchingGravacao.aula_num,
                          });
                        }}
                        className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                        title="Assistir Gravação da Aula no Player Seguro"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Assistir Aula HD</span>
                      </button>
                    ) : (
                      canRecord && (
                        <button
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              window.dispatchEvent(new CustomEvent('lms_open_recorder', {
                                detail: { disciplinaId: disciplina.id, aulaNum }
                              }));
                            }
                          }}
                          className="py-1.5 px-2.5 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>+ Gravar</span>
                        </button>
                      )
                    )}

                    {matchingGemini ? (
                      <a
                        href={matchingGemini.gemini_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs rounded-xl transition flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Resumo Gemini</span>
                      </a>
                    ) : (
                      canManageContent && (
                        <button
                          onClick={() => {
                            setGeminiAulaNum(aulaNum);
                            setGeminiDataAula(lessonDate);
                            setGeminiTitle(`Resumo Gemini • Aula ${aulaNum}: ${disciplina.name}`);
                            setIsAddGeminiModalOpen(true);
                          }}
                          className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          + Link Gemini
                        </button>
                      )
                    )}

                    {disciplina.google_meet_url && (
                      <a
                        href={disciplina.google_meet_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-xl transition flex items-center gap-1"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Meet</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 5: MATERIAIS DE ESTUDO */}
      {activeSubTab === 'materiais' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">
                Materiais de Estudo & Apostilas ({materiais.length})
              </h3>
              <p className="text-xs text-gray-500">
                Apostilas, PDFs, roteiros e documentos oficiais da matéria {disciplina.name}.
              </p>
            </div>

            {canManage && (
              <button
                onClick={() => {
                  setNewMaterialTitle('');
                  setNewMaterialDriveUrl('');
                  setNewMaterialType('pdf');
                  setIsAddMaterialModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Material</span>
              </button>
            )}
          </div>

          {materiais.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-gray-200 text-xs text-gray-500 space-y-3">
              <FolderOpen className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="font-bold text-gray-700">Nenhum material publicado nesta disciplina.</p>
              {canManage && (
                <button
                  onClick={() => {
                    setNewMaterialTitle('');
                    setNewMaterialDriveUrl('');
                    setNewMaterialType('pdf');
                    setIsAddMaterialModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Primeiro Material</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materiais.map((mat) => (
                <div 
                  key={mat.id} 
                  className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-slate-50 hover:bg-white hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 inline-block mb-1">
                          {mat.file_type ? mat.file_type.toUpperCase() : 'DOCUMENTO'}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug break-words">
                          {mat.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          Publicado em {mat.created_at || '2026'}
                        </span>
                      </div>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditMaterial(mat)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Editar material"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMaterial(mat.id, mat.title)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Excluir material"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-gray-500 truncate max-w-[140px] sm:max-w-xs">
                      {mat.google_drive_url ? 'Google Drive / Nuvem' : 'Arquivo Interno'}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {mat.google_drive_url && (
                        <button
                          onClick={() => {
                            trackEvent('drive', 'open_material_reader', mat.title, { disciplina: disciplina.name }, userEmail, currentRole);
                            setMobilePdfModal({ isOpen: true, title: mat.title, pdfUrl: mat.google_drive_url! });
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
                          title="Ler PDF diretamente na plataforma"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Ler no App</span>
                        </button>
                      )}
                      {mat.google_drive_url && (
                        <a
                          href={mat.google_drive_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                          title="Abrir no Google Drive Externo ou Baixar"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 6: LEITURAS PRÉ-AULA */}
      {activeSubTab === 'leituras' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">
                Links & Leituras da Disciplina ({announcements.length})
              </h3>
              <p className="text-xs text-gray-500">Textos, artigos e leituras recomendadas antes e durante as aulas.</p>
            </div>

            {canManage && (
              <button
                type="button"
                onClick={() => setIsAddLeituraModalOpen(true)}
                className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Indicar Link / Leitura Pré-Aula</span>
              </button>
            )}
          </div>

          {announcements.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-gray-200 text-xs text-gray-500 space-y-3">
              <FileText className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="font-semibold text-gray-700">Nenhum link ou leitura cadastrada para esta matéria.</p>
              {canManage && (
                <button
                  type="button"
                  onClick={() => setIsAddLeituraModalOpen(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  + Indicar Novo Link / Leitura Pré-Aula
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((av) => {
                const isRead = readAnnouncementIds.includes(av.id);

                return (
                  <div key={av.id} className={`p-4 sm:p-5 rounded-2xl border ${isRead ? 'bg-emerald-50/30 border-emerald-300' : 'bg-white border-gray-200 shadow-2xs'} space-y-3`}>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Badge de Categoria / Momento */}
                          {av.category === 'durante_aula' ? (
                            <span className="text-[10px] font-black uppercase tracking-wide bg-rose-100 text-rose-900 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                              🔴 Compartilhado em Aula
                            </span>
                          ) : av.category === 'complementar' ? (
                            <span className="text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              📌 Material Complementar
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              📖 Leitura Pré-Aula
                            </span>
                          )}

                          {av.target_date && (
                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold">
                              {av.target_date}
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{av.title}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {isRead ? (
                          <button
                            onClick={() => unmarkAnnouncementAsRead(normalizedEmail, av.id)}
                            className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                          >
                            ✓ Lida (Desmarcar)
                          </button>
                        ) : (
                          <button
                            onClick={() => markAnnouncementAsRead(normalizedEmail, av.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs transition cursor-pointer"
                          >
                            Marcar como Lida
                          </button>
                        )}

                        {canManage && (
                          <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditLeitura(av)}
                              className="px-2 py-1 bg-white hover:bg-orange-50 text-orange-900 border border-orange-200 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                              title="Editar Leitura / Link"
                            >
                              <Edit3 className="w-3 h-3 text-orange-600" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLeitura(av.id, av.title)}
                              className="text-gray-400 hover:text-red-600 p-1 transition cursor-pointer"
                              title="Remover leitura"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {av.message && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        "{av.message}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                      <span className="text-gray-500">Por: <strong>{av.author_name}</strong></span>
                      <a
                        href={av.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-xl border border-blue-200 transition flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Link</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADICIONAR LIVRO RECOMENDADO */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-base">
                Indicar Livro para {disciplina.name}
              </h3>
              <button
                onClick={() => setIsAddBookModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLivroRecomendado} className="space-y-3">
              {/* Seleção Rápida do Acervo da Biblioteca Digital */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-blue-50/60 border border-blue-200">
                <label className="block text-xs font-bold text-blue-950">
                  📚 Puxar do Acervo da Biblioteca Digital ({bibliotecaBooks.length} obras)
                </label>
                <input
                  type="text"
                  placeholder="Digite para filtrar por título ou autor..."
                  value={biblioSearchQuery}
                  onChange={(e) => setBiblioSearchQuery(e.target.value)}
                  className="w-full p-2 border border-blue-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={selectedBiblioBookId}
                  onChange={(e) => handleSelectBiblioBook(e.target.value)}
                  className="w-full p-2 border border-blue-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Selecionar Obra Encontrada --</option>
                  {bibliotecaBooks
                    .filter((b) => {
                      if (!biblioSearchQuery.trim()) return true;
                      const q = biblioSearchQuery.toLowerCase();
                      return (
                        b.title?.toLowerCase().includes(q) ||
                        b.author?.toLowerCase().includes(q) ||
                        b.category?.toLowerCase().includes(q)
                      );
                    })
                    .slice(0, 100)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.author || 'Sem Autor'})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Título do Livro / Obra <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Teologia Sistemática"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nome do Autor
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Louis Berkhof"
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 04 - Teologia Sistemática"
                    value={bookCategory}
                    onChange={(e) => setBookCategory(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link do Arquivo / Drive / Biblioteca <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={bookUrl}
                  onChange={(e) => setBookUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  id="chk-mandatory"
                  checked={isMandatoryBook}
                  onChange={(e) => setIsMandatoryBook(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                />
                <label htmlFor="chk-mandatory" className="text-xs font-bold text-amber-950 cursor-pointer select-none">
                  ⭐ Marcar como Leitura Obrigatória da Disciplina
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Observações / Orientação de Leitura
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Leitura obrigatória dos capítulos 1 e 2 para a AV1..."
                  value={bookNotes}
                  onChange={(e) => setBookNotes(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs"
                >
                  Salvar Recomendação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1.1: EDITAR LIVRO RECOMENDADO */}
      {isEditBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">
                    Editar Livro Recomendado
                  </h3>
                  <p className="text-xs text-gray-500">{disciplina.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditBookModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditLivro} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Título do Livro / Obra <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editBookTitle}
                  onChange={(e) => setEditBookTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nome do Autor
                  </label>
                  <input
                    type="text"
                    value={editBookAuthor}
                    onChange={(e) => setEditBookAuthor(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={editBookCategory}
                    onChange={(e) => setEditBookCategory(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link do Arquivo / Drive / Biblioteca <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={editBookUrl}
                  onChange={(e) => setEditBookUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  id="chk-edit-mandatory"
                  checked={editIsMandatoryBook}
                  onChange={(e) => setEditIsMandatoryBook(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                />
                <label htmlFor="chk-edit-mandatory" className="text-xs font-bold text-amber-950 cursor-pointer select-none">
                  ⭐ Marcar como Leitura Obrigatória da Disciplina
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Observações / Orientação de Leitura
                </label>
                <textarea
                  rows={2}
                  value={editBookNotes}
                  onChange={(e) => setEditBookNotes(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditBookModalOpen(false)}
                  className="px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1.2: ADICIONAR LINK / LEITURA PRÉ-AULA */}
      {isAddLeituraModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 text-orange-800 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Indicar Leitura Pré-Aula / Artigo
                  </h3>
                  <p className="text-xs text-gray-500">{disciplina.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddLeituraModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs cursor-pointer hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLeitura} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Título da Leitura / Artigo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Igreja, Estado e Autonomia"
                  value={leituraTitle}
                  onChange={(e) => setLeituraTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link de Acesso (URL Externa, Google Docs ou PDF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={leituraLinkUrl}
                  onChange={(e) => setLeituraLinkUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Categoria / Momento
                  </label>
                  <select
                    value={leituraCategory}
                    onChange={(e) => setLeituraCategory(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  >
                    <option value="pre_aula">📖 Leitura Pré-Aula Recomendada</option>
                    <option value="durante_aula">🔴 Compartilhado em Aula</option>
                    <option value="complementar">📌 Material Complementar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Data da Aula Vinculada (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 18/08/2026 (Terça-feira)"
                    value={leituraTargetDate}
                    onChange={(e) => setLeituraTargetDate(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mensagem / Orientação aos Alunos
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Boa noite, nobres. Textinho para nossa aula de logo mais, leiam os tópicos 1 e 2..."
                  value={leituraMessage}
                  onChange={(e) => setLeituraMessage(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLeituraModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
                >
                  Publicar Leitura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1.3: EDITAR LINK / LEITURA PRÉ-AULA */}
      {isEditLeituraModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 text-orange-800 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Editar Leitura Pré-Aula / Link
                  </h3>
                  <p className="text-xs text-gray-500">{disciplina.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditLeituraModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs cursor-pointer hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditLeitura} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Título da Leitura / Artigo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editLeituraTitle}
                  onChange={(e) => setEditLeituraTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link de Acesso (URL Externa, Google Docs ou PDF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={editLeituraLinkUrl}
                  onChange={(e) => setEditLeituraLinkUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Categoria / Momento
                  </label>
                  <select
                    value={editLeituraCategory}
                    onChange={(e) => setEditLeituraCategory(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  >
                    <option value="pre_aula">📖 Leitura Pré-Aula Recomendada</option>
                    <option value="durante_aula">🔴 Compartilhado em Aula</option>
                    <option value="complementar">📌 Material Complementar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Data da Aula Vinculada (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 18/08/2026 (Terça-feira)"
                    value={editLeituraTargetDate}
                    onChange={(e) => setEditLeituraTargetDate(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mensagem / Orientação aos Alunos
                </label>
                <textarea
                  rows={3}
                  value={editLeituraMessage}
                  onChange={(e) => setEditLeituraMessage(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditLeituraModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADICIONAR ANOTAÇÃO DO GEMINI IA */}
      {isAddGeminiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Anexar Resumo Gemini IA
              </h3>
              <button
                onClick={() => setIsAddGeminiModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGeminiNote} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Aula nº
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={18}
                    value={geminiAulaNum}
                    onChange={(e) => setGeminiAulaNum(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Data da Aula
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 18/08/2026"
                    value={geminiDataAula}
                    onChange={(e) => setGeminiDataAula(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Título do Resumo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Resumo Gemini • Patrística & Agostinho"
                  value={geminiTitle}
                  onChange={(e) => setGeminiTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link do Google Docs / Gemini / Notion <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/document/d/..."
                  value={geminiUrl}
                  onChange={(e) => setGeminiUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tópicos Principais / Sinopse
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Síntese dos principais pontos debatidos, referências teológicas..."
                  value={geminiSnippet}
                  onChange={(e) => setGeminiSnippet(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGeminiModalOpen(false)}
                  className="px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs"
                >
                  Salvar Resumo Gemini
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2.5: CADASTRAR NOVA GRAVAÇÃO DA AULA (LINK DO DRIVE) */}
      {isAddGravacaoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Cadastrar Gravação de Aula</h3>
                  <p className="text-xs text-gray-500">Vincular link de vídeo salvo no Google Drive.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddGravacaoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGravacao} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Matéria / Disciplina <span className="text-red-500">*</span>
                </label>
                <select
                  value={newGravacaoDisciplinaId || disciplina.id}
                  onChange={(e) => setNewGravacaoDisciplinaId(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold bg-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                >
                  {getAllDisciplinas().map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code || 'MAT'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Número da Aula <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={18}
                    value={newGravacaoAulaNum}
                    onChange={(e) => setNewGravacaoAulaNum(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Data da Gravação
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 25/08/2026"
                    value={newGravacaoDataAula}
                    onChange={(e) => setNewGravacaoDataAula(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link do Vídeo no Google Drive <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={newGravacaoVideoUrl}
                  onChange={(e) => setNewGravacaoVideoUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Cole o link do vídeo salvo na pasta oficial do Google Drive.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Título da Gravação (Opcional)
                </label>
                <input
                  type="text"
                  placeholder={`Ex: Aula ${newGravacaoAulaNum} • ${disciplina.name} (Gravação HD)`}
                  value={newGravacaoTitle}
                  onChange={(e) => setNewGravacaoTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Duração Estimada (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 01:25:00 ou 85 min"
                  value={newGravacaoDuration}
                  onChange={(e) => setNewGravacaoDuration(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGravacaoModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Salvar Gravação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDITAR DETALHES DA GRAVAÇÃO / MOVER DE MATÉRIA */}
      {isEditGravacaoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" /> Editar Detalhes da Gravação
              </h3>
              <button
                onClick={() => setIsEditGravacaoModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditGravacao} className="space-y-3">
              {/* Seleção de Disciplina / Mover de Hub */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Matéria / Hub da Disciplina <span className="text-red-500">*</span>
                </label>
                <select
                  value={editDisciplinaId}
                  onChange={(e) => setEditDisciplinaId(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  {getAllDisciplinas().map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code || 'MAT'})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  Permite mover esta gravação para a matéria correta caso tenha sido gravada em outra.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Aula nº <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={18}
                    value={editAulaNum}
                    onChange={(e) => setEditAulaNum(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Data da Aula
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 25/08/2026"
                    value={editDataAula}
                    onChange={(e) => setEditDataAula(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Título da Gravação <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aula 3 • História do Congregacionalismo"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link do Vídeo no Google Drive <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Duração da Gravação (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 01:25:00 ou 85 min"
                  value={editDurationFormatted}
                  onChange={(e) => setEditDurationFormatted(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditGravacaoModalOpen(false)}
                  className="px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDITAR DETALHES DA ANOTAÇÃO GEMINI / MOVER DE MATÉRIA */}
      {isEditGeminiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" /> Editar Resumo / Anotação Gemini
              </h3>
              <button
                onClick={() => setIsEditGeminiModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditGemini} className="space-y-3">
              {/* Seleção de Disciplina / Mover de Hub */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Matéria / Hub da Disciplina <span className="text-red-500">*</span>
                </label>
                <select
                  value={editGeminiDisciplinaId}
                  onChange={(e) => setEditGeminiDisciplinaId(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                >
                  {getAllDisciplinas().map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code || 'MAT'})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  Permite mover esta anotação do Gemini para a matéria correta no sistema.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Aula nº <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={18}
                    value={editGeminiAulaNum}
                    onChange={(e) => setEditGeminiAulaNum(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Data da Aula
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 25/08/2026"
                    value={editGeminiDataAula}
                    onChange={(e) => setEditGeminiDataAula(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Título da Anotação Gemini <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Anotações Gemini • Aula 3 • História do Congregacionalismo"
                  value={editGeminiTitle}
                  onChange={(e) => setEditGeminiTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link do Google Docs (Gemini) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/document/d/..."
                  value={editGeminiUrl}
                  onChange={(e) => setEditGeminiUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tópicos Principais / Sinopse
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Registro de transcrição e tópicos-chave gerados pelo Gemini durante a aula ao vivo..."
                  value={editGeminiSnippet}
                  onChange={(e) => setEditGeminiSnippet(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditGeminiModalOpen(false)}
                  className="px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO DE SLIDE DA AULA */}
      {isAddSlideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Presentation className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Cadastrar Slides da Aula
                </h3>
              </div>
              <button
                onClick={() => setIsAddSlideModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSlide} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Número da Aula <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={18}
                    value={newSlideAulaNum}
                    onChange={(e) => setNewSlideAulaNum(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Data da Aula (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 25/08/2026"
                    value={newSlideDataAula}
                    onChange={(e) => setNewSlideDataAula(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Título da Apresentação
                </label>
                <input
                  type="text"
                  placeholder={`Ex: Slides • Aula ${newSlideAulaNum} • ${disciplina.name}`}
                  value={newSlideTitle}
                  onChange={(e) => setNewSlideTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link do Google Slides ou PDF no Google Drive <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/presentation/d/... ou https://drive.google.com/file/d/.../view"
                  value={newSlideUrl}
                  onChange={(e) => setNewSlideUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                  required
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Insira o link de visualização ou edição da apresentação. O sistema converterá automaticamente para exibição embutida no LMS.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tópicos / Notas de Estudo (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Tópicos principais: 1. A Reforma Magisterial, 2. A Confissão de Fé de 1658, 3. Princípios Eclesiológicos..."
                  value={newSlideNotes}
                  onChange={(e) => setNewSlideNotes(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSlideModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Salvar Apresentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE SLIDE DA AULA */}
      {isEditSlideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Editar Apresentação de Slide
                </h3>
              </div>
              <button
                onClick={() => setIsEditSlideModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditSlide} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Número da Aula <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={18}
                    value={editSlideAulaNum}
                    onChange={(e) => setEditSlideAulaNum(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Data da Aula (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 25/08/2026"
                    value={editSlideDataAula}
                    onChange={(e) => setEditSlideDataAula(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Título da Apresentação <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={`Ex: Slides • Aula ${editSlideAulaNum} • ${disciplina.name}`}
                  value={editSlideTitle}
                  onChange={(e) => setEditSlideTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link do Google Slides ou PDF no Google Drive <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/presentation/d/... ou https://drive.google.com/file/d/.../view"
                  value={editSlideUrl}
                  onChange={(e) => setEditSlideUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tópicos / Notas de Estudo (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Tópicos abordados nesta apresentação..."
                  value={editSlideNotes}
                  onChange={(e) => setEditSlideNotes(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditSlideModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DOS DADOS DA DISCIPLINA PELO HUB */}
      {isEditDisciplinaHubModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-100 text-cyan-800 rounded-xl">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Manejar Dados da Matéria
                  </h3>
                  <p className="text-xs text-gray-500">{disciplina.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditDisciplinaHubModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditDisciplinaHub} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link da Reunião Google Meet
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={editHubMeetUrl}
                  onChange={(e) => setEditHubMeetUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Telefone Google Meet (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: (88) +55 11 4933-5763"
                    value={editHubMeetPhone}
                    onChange={(e) => setEditHubMeetPhone(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    PIN do Meet
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 788 555 787#"
                    value={editHubMeetPin}
                    onChange={(e) => setEditHubMeetPin(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link da Pasta no Google Drive
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={editHubDriveUrl}
                  onChange={(e) => setEditHubDriveUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link do Formulário de Presença Padrão (Google Forms)
                </label>
                <input
                  type="url"
                  placeholder="https://forms.gle/..."
                  value={editHubAttendanceUrl}
                  onChange={(e) => setEditHubAttendanceUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Ementa / Descrição da Matéria
                </label>
                <textarea
                  rows={2}
                  placeholder="Descrição da disciplina..."
                  value={editHubDescription}
                  onChange={(e) => setEditHubDescription(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditDisciplinaHubModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ADICIONAR MATERIAL DE ESTUDO & APOSTILA */}
      {isAddMaterialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Adicionar Material de Estudo
                  </h3>
                  <p className="text-xs text-gray-500">{disciplina.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddMaterialModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMaterial} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Título do Material ou Apostila <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Apostila Unidade 1 - Direitos Humanos (Prof. Cleiton)"
                  value={newMaterialTitle}
                  onChange={(e) => setNewMaterialTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link no Google Drive ou URL do Documento / PDF <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/... ou link do arquivo"
                  value={newMaterialDriveUrl}
                  onChange={(e) => setNewMaterialDriveUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Insira o link compartilhável do Google Drive ou link direto do material.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tipo de Formato
                </label>
                <select
                  value={newMaterialType}
                  onChange={(e) => setNewMaterialType(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="pdf">PDF / Apostila Oficial</option>
                  <option value="doc">Documento Word / Texto</option>
                  <option value="slide">Apresentação / Slides</option>
                  <option value="link">Link de Artigo / Leitura</option>
                  <option value="outro">Outro Formato</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMaterialModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
                >
                  Publicar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE MATERIAL DE ESTUDO & APOSTILA */}
      {isEditMaterialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Editar Material de Estudo
                  </h3>
                  <p className="text-xs text-gray-500">{disciplina.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditMaterialModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditMaterial} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Título do Material ou Apostila <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editMaterialTitle}
                  onChange={(e) => setEditMaterialTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link no Google Drive ou URL do Documento / PDF <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={editMaterialDriveUrl}
                  onChange={(e) => setEditMaterialDriveUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tipo de Formato
                </label>
                <select
                  value={editMaterialType}
                  onChange={(e) => setEditMaterialType(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                >
                  <option value="pdf">PDF / Apostila Oficial</option>
                  <option value="doc">Documento Word / Texto</option>
                  <option value="slide">Apresentação / Slides</option>
                  <option value="link">Link de Artigo / Leitura</option>
                  <option value="outro">Outro Formato</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditMaterialModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DO PLAYER DE VÍDEO SEGURO */}
      <VideoPlayerModal
        isOpen={activeVideoModal.isOpen}
        onClose={() => setActiveVideoModal({ isOpen: false, title: '', videoUrl: '' })}
        title={activeVideoModal.title}
        disciplinaName={disciplina.name}
        aulaNum={activeVideoModal.aulaNum}
        videoUrl={activeVideoModal.videoUrl}
      />

      {/* MODAL DO LEITOR DE PDF EMBUTIDO (MOBILE & DESKTOP) */}
      {mobilePdfModal?.isOpen && (
        <MobilePdfReaderModal
          isOpen={mobilePdfModal.isOpen}
          onClose={() => setMobilePdfModal(null)}
          title={mobilePdfModal.title}
          pdfUrl={mobilePdfModal.pdfUrl}
          disciplinaName={disciplina.name}
        />
      )}
    </div>
  );
};
