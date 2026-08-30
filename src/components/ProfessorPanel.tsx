'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TeleProximidadeDashboard } from '@/components/TeleProximidadeDashboard';
import { QuatrodsDsPage } from '@/components/QuatrodsDsPage';
import { HomileticaEstudioPage } from '@/components/HomileticaEstudioPage';
import { MetaversoTeologicoPage } from '@/components/MetaversoTeologicoPage';
import { 
  Upload, Link as LinkIcon, PlusCircle, FileText, Check, AlertCircle, 
  ToggleLeft, ToggleRight, Sparkles, Video, FolderOpen, Copy, ExternalLink, 
  Clock, Calendar, BookOpen, Settings, Edit3, Trash2, ShieldCheck, UserCheck, RefreshCw,
  Archive, ArchiveRestore, Layers, Presentation, UploadCloud, Activity, Flame, Mic, Box
} from 'lucide-react';
import { Disciplina, Material, Avaliacao, AvisoLeituraPreAula, UserRole } from '@/types';
import { 
  getAllDisciplinas, 
  getDisciplinasForUser, 
  updateDisciplina, 
  getMateriaisForDisciplinas, 
  addMaterial, 
  deleteMaterial, 
  getAvaliacoesForDisciplinas, 
  addAvaliacao, 
  deleteAvaliacao 
} from '@/services/disciplinasService';
import { 
  getAnnouncements, 
  getAnnouncementsForDisciplinas,
  addAnnouncement, 
  updateAnnouncement,
  deleteAnnouncement, 
  archiveAnnouncement,
  unarchiveAnnouncement,
  formatAnnouncementForWhatsApp 
} from '@/services/announcementsService';
import { INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';
import { 
  getSlidesForDisciplina, 
  addSlideItem, 
  deleteSlideItem, 
  SlideItem 
} from '@/services/slidesService';
import { SupportMaterialsHub } from '@/components/SupportMaterialsHub';

interface ProfessorPanelProps {
  userEmail?: string;
  currentRole?: UserRole;
}

export const ProfessorPanel: React.FC<ProfessorPanelProps> = ({ 
  userEmail = 'sacrasub@gmail.com',
  currentRole = 'professor'
}) => {
  const normalizedEmail = (userEmail || '').toLowerCase().trim();
  const isAdmin = currentRole === 'admin' || normalizedEmail === 'sacrasub@gmail.com' || normalizedEmail === 'sacrasub03@gmail.com' || normalizedEmail === 'tondedez@gmail.com' || normalizedEmail === 'ead@uiecbead.com.br';

  // Lista de todas as disciplinas carregadas do storage/serviço
  const [allDisciplinasList, setAllDisciplinasList] = useState<Disciplina[]>([]);
  // Seleção de Professor Ativo para Administrador ('ALL' ou chave de e-mail/nome do professor)
  const [selectedProfessorKey, setSelectedProfessorKey] = useState<string>('ALL');

  // Estado de dados gerenciados
  const [materials, setMaterials] = useState<Material[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [announcements, setAnnouncements] = useState<AvisoLeituraPreAula[]>([]);

  const [copiedMeetId, setCopiedMeetId] = useState<string | null>(null);
  const [copiedAvisoId, setCopiedAvisoId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form State Material Upload
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDisciplinaId, setMaterialDisciplinaId] = useState<string>('');
  const [isNative, setIsNative] = useState(false);
  const [driveUrl, setDriveUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form State Avaliação
  const [avaliacaoTitle, setAvaliacaoTitle] = useState('');
  const [avaliacaoDesc, setAvaliacaoDesc] = useState('');
  const [avaliacaoDisciplinaId, setAvaliacaoDisciplinaId] = useState<string>('');
  const [isLegacy, setIsLegacy] = useState(true);
  const [formsUrl, setFormsUrl] = useState('');

  // Form State Leitura Pré-Aula / Link / Recurso Rápido
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<string>('');
  const [authorName, setAuthorName] = useState('');
  const [leituraTitle, setLeituraTitle] = useState('');
  const [leituraUrl, setLeituraUrl] = useState('');
  const [leituraMessage, setLeituraMessage] = useState('');
  const [leituraData, setLeituraData] = useState('Próxima Aula');
  const [leituraCategory, setLeituraCategory] = useState<'pre_aula' | 'durante_aula' | 'complementar'>('durante_aula');
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);

  // Modal / Edição de Dados da Matéria
  const [editingDisciplina, setEditingDisciplina] = useState<Disciplina | null>(null);
  const [editMeetUrl, setEditMeetUrl] = useState('');
  const [editMeetPhone, setEditMeetPhone] = useState('');
  const [editMeetPin, setEditMeetPin] = useState('');
  const [editDriveUrl, setEditDriveUrl] = useState('');
  const [editAttendanceUrl, setEditAttendanceUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Modal de Slides / Apresentações da Matéria
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [selectedDisciplinaForSlide, setSelectedDisciplinaForSlide] = useState<Disciplina | null>(null);
  const [slideTabMode, setSlideTabMode] = useState<'link' | 'file'>('link');
  const [slideAulaNum, setSlideAulaNum] = useState<number>(1);
  const [slideDataAula, setSlideDataAula] = useState<string>('');
  const [slideTitle, setSlideTitle] = useState<string>('');
  const [slideUrl, setSlideUrl] = useState<string>('');
  const [slideFile, setSlideFile] = useState<File | null>(null);
  const [slideNotes, setSlideNotes] = useState<string>('');
  const [disciplinaSlides, setDisciplinaSlides] = useState<SlideItem[]>([]);

  // Gravador de Aulas
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [recorderDisciplinaId, setRecorderDisciplinaId] = useState<string>('');

  // Carrega e recarrega disciplinas
  const loadDisciplinas = () => {
    const list = getAllDisciplinas();
    setAllDisciplinasList(list);
  };

  useEffect(() => {
    loadDisciplinas();

    const handleDiscUpd = () => loadDisciplinas();
    const handleMatUpd = () => refreshScopedData();
    const handleAvUpd = () => refreshScopedData();
    const handleAnnUpd = () => refreshScopedData();

    window.addEventListener('lms_disciplinas_updated', handleDiscUpd);
    window.addEventListener('lms_materials_updated', handleMatUpd);
    window.addEventListener('lms_avaliacoes_updated', handleAvUpd);
    window.addEventListener('lms_announcements_updated', handleAnnUpd);

    return () => {
      window.removeEventListener('lms_disciplinas_updated', handleDiscUpd);
      window.removeEventListener('lms_materials_updated', handleMatUpd);
      window.removeEventListener('lms_avaliacoes_updated', handleAvUpd);
      window.removeEventListener('lms_announcements_updated', handleAnnUpd);
    };
  }, []);

  // Lista consolidada de Professores disponíveis para simulação do Admin
  const availableProfessors = useMemo(() => {
    const map = new Map<string, { key: string; email: string; name: string; avatarUrl?: string; count: number; disciplinas: Disciplina[] }>();

    allDisciplinasList.forEach((d) => {
      const profEmail = (d.professor_email || '').toLowerCase().trim();
      const profKey = profEmail || d.professor_name.toLowerCase().trim();
      const authUser = profEmail ? INITIAL_AUTHORIZED_USERS[profEmail] : null;

      const current = map.get(profKey) || {
        key: profKey,
        email: profEmail,
        name: authUser?.name || d.professor_name,
        avatarUrl: authUser?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        count: 0,
        disciplinas: [],
      };

      current.count += 1;
      current.disciplinas.push(d);
      map.set(profKey, current);
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allDisciplinasList]);

  // Professor atualmente selecionado pelo Admin (se houver)
  const currentSelectedProfessor = useMemo(() => {
    if (!isAdmin || selectedProfessorKey === 'ALL') return null;
    return availableProfessors.find((p) => p.key === selectedProfessorKey) || null;
  }, [isAdmin, selectedProfessorKey, availableProfessors]);

  // Determina as disciplinas ativas sob responsabilidade do usuário
  const userDisciplinas = useMemo(() => {
    if (isAdmin) {
      if (selectedProfessorKey === 'ALL' || !currentSelectedProfessor) {
        return allDisciplinasList;
      }
      // Filtra apenas as matérias do professor selecionado
      return allDisciplinasList.filter((d) => {
        const dEmail = (d.professor_email || '').toLowerCase().trim();
        const dKey = dEmail || d.professor_name.toLowerCase().trim();
        return dKey === selectedProfessorKey || (currentSelectedProfessor.email && dEmail === currentSelectedProfessor.email);
      });
    }
    return getDisciplinasForUser(normalizedEmail, currentRole);
  }, [allDisciplinasList, normalizedEmail, currentRole, isAdmin, selectedProfessorKey, currentSelectedProfessor]);

  const activeDisciplinaIds = useMemo(() => {
    return userDisciplinas.map((d) => d.id);
  }, [userDisciplinas]);

  // Recarrega materiais, avaliações e anúncios com escopo nas disciplinas ativas
  const refreshScopedData = () => {
    const ids = activeDisciplinaIds;
    setMaterials(getMateriaisForDisciplinas(ids));
    setAvaliacoes(getAvaliacoesForDisciplinas(ids));
    setAnnouncements(getAnnouncementsForDisciplinas(ids));
  };

  useEffect(() => {
    refreshScopedData();
    if (userDisciplinas.length > 0) {
      const firstId = userDisciplinas[0].id;
      if (!selectedDisciplinaId || !userDisciplinas.some(d => d.id === selectedDisciplinaId)) {
        setSelectedDisciplinaId(firstId);
      }
      if (!materialDisciplinaId || !userDisciplinas.some(d => d.id === materialDisciplinaId)) {
        setMaterialDisciplinaId(firstId);
      }
      if (!avaliacaoDisciplinaId || !userDisciplinas.some(d => d.id === avaliacaoDisciplinaId)) {
        setAvaliacaoDisciplinaId(firstId);
      }
    }
  }, [userDisciplinas]);

  // Inicializa o nome do autor com o perfil do professor logado ou selecionado
  useEffect(() => {
    if (currentSelectedProfessor) {
      setAuthorName(currentSelectedProfessor.name);
    } else {
      const profile = INITIAL_AUTHORIZED_USERS[normalizedEmail];
      if (profile && profile.name) {
        setAuthorName(profile.name);
      } else if (userDisciplinas.length > 0) {
        setAuthorName(userDisciplinas[0].professor_name);
      }
    }
  }, [normalizedEmail, userDisciplinas, currentSelectedProfessor]);

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3500);
  };

  const handleCopyMeet = (url: string, id: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedMeetId(id);
    showNotification('Link do Google Meet copiado com sucesso!');
    setTimeout(() => setCopiedMeetId(null), 2500);
  };

  // Abrir Modal de Edição de Dados da Matéria
  const handleOpenEditDisciplina = (disc: Disciplina) => {
    setEditingDisciplina(disc);
    setEditMeetUrl(disc.google_meet_url || '');
    setEditMeetPhone(disc.google_meet_phone || '');
    setEditMeetPin(disc.google_meet_pin || '');
    setEditDriveUrl(disc.google_drive_url || '');
    setEditAttendanceUrl(disc.attendance_form_url || '');
    setEditDescription(disc.description || '');
  };

  // Salvar Alterações na Matéria
  const handleSaveDisciplina = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDisciplina) return;

    const updated: Disciplina = {
      ...editingDisciplina,
      google_meet_url: editMeetUrl.trim() || undefined,
      google_meet_phone: editMeetPhone.trim() || undefined,
      google_meet_pin: editMeetPin.trim() || undefined,
      google_drive_url: editDriveUrl.trim() || undefined,
      attendance_form_url: editAttendanceUrl.trim() || undefined,
      description: editDescription.trim(),
    };

    updateDisciplina(updated);
    setEditingDisciplina(null);
    showNotification(`Dados da disciplina "${updated.name}" atualizados com sucesso!`);
  };

  // Iniciar e Cancelar Edição de Anúncio / Link
  const handleStartEditAnnouncement = (av: AvisoLeituraPreAula) => {
    setEditingAnnouncementId(av.id);
    setSelectedDisciplinaId(av.disciplina_id);
    setAuthorName(av.author_name);
    setLeituraTitle(av.title);
    setLeituraUrl(av.link_url);
    setLeituraMessage(av.message || '');
    setLeituraData(av.target_date || 'Próxima Aula');
    setLeituraCategory(av.category || 'pre_aula');
    showNotification(`✏️ Editando: "${av.title}"`);
  };

  const handleCancelEditAnnouncement = () => {
    setEditingAnnouncementId(null);
    setLeituraTitle('');
    setLeituraUrl('');
    setLeituraMessage('');
    setLeituraCategory('durante_aula');
    setLeituraData('Próxima Aula');
  };

  // Adicionar ou Atualizar Leitura / Link de Aula
  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leituraTitle || !leituraUrl) {
      showNotification('Preencha o título e o link de acesso.');
      return;
    }

    const discObj = userDisciplinas.find((d) => d.id === selectedDisciplinaId) || userDisciplinas[0];
    if (!discObj) return;

    if (editingAnnouncementId) {
      const existing = announcements.find((a) => a.id === editingAnnouncementId);
      if (existing) {
        updateAnnouncement({
          ...existing,
          disciplina_id: discObj.id,
          disciplina_name: discObj.name,
          author_name: authorName || discObj.professor_name,
          title: leituraTitle,
          link_url: leituraUrl,
          message: leituraMessage || 'Link / material de apoio compartilhado com a turma.',
          category: leituraCategory,
          target_date: leituraData,
        });
        handleCancelEditAnnouncement();
        refreshScopedData();
        showNotification('Leitura / Link atualizado com sucesso no LMS!');
        return;
      }
    }

    addAnnouncement({
      disciplina_id: discObj.id,
      disciplina_name: discObj.name,
      author_name: authorName || discObj.professor_name,
      author_role: 'professor',
      author_email: normalizedEmail,
      title: leituraTitle,
      link_url: leituraUrl,
      message: leituraMessage || (leituraCategory === 'durante_aula' ? 'Link compartilhado pelo professor durante a aula ao vivo.' : 'Textinho complementar e leitura pré-aula recomendada para nosso próximo encontro.'),
      category: leituraCategory,
      target_date: leituraData,
      is_pinned: true,
      avatar_url: INITIAL_AUTHORIZED_USERS[normalizedEmail]?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    handleCancelEditAnnouncement();
    refreshScopedData();
    showNotification(leituraCategory === 'durante_aula' ? 'Link da aula ao vivo publicado com sucesso!' : 'Leitura pré-aula publicada com sucesso!');
  };

  // Estado de Sub-aba para Leituras: 'active' ou 'archived'
  const [announcementsSubTab, setAnnouncementsSubTab] = useState<'active' | 'archived'>('active');

  const handleCopyAvisoWhatsApp = (aviso: AvisoLeituraPreAula) => {
    const text = formatAnnouncementForWhatsApp(aviso);
    navigator.clipboard.writeText(text);
    setCopiedAvisoId(aviso.id);
    showNotification('Mensagem formatada copiada! Pronto para colar no grupo do WhatsApp.');
    setTimeout(() => setCopiedAvisoId(null), 3000);
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (confirm('Deseja realmente remover definitivamente este item?')) {
      deleteAnnouncement(id);
      if (editingAnnouncementId === id) handleCancelEditAnnouncement();
      refreshScopedData();
      showNotification('Item excluído com sucesso.');
    }
  };

  const handleArchiveAnnouncement = (id: string) => {
    archiveAnnouncement(id);
    refreshScopedData();
    showNotification('Leitura arquivada com sucesso! Ela foi movida para o acervo arquivado.');
  };

  const handleUnarchiveAnnouncement = (id: string) => {
    unarchiveAnnouncement(id);
    refreshScopedData();
    showNotification('Leitura restaurada com sucesso para o painel ativo dos alunos!');
  };

  // Adicionar Material
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle) return;

    const discObj = userDisciplinas.find((d) => d.id === materialDisciplinaId) || userDisciplinas[0];
    if (!discObj) return;

    addMaterial({
      disciplina_id: discObj.id,
      disciplina_name: discObj.name,
      title: materialTitle,
      google_drive_url: !isNative ? driveUrl : undefined,
      file_url: isNative && selectedFile ? `/uploads/${selectedFile.name}` : undefined,
      is_native_upload: isNative,
    });

    setMaterialTitle('');
    setDriveUrl('');
    setSelectedFile(null);
    refreshScopedData();
    showNotification('Material publicado com sucesso para os alunos!');
  };

  const handleDeleteMaterial = (id: string) => {
    if (confirm('Deseja realmente excluir este material?')) {
      deleteMaterial(id);
      refreshScopedData();
      showNotification('Material excluído com sucesso.');
    }
  };

  // Adicionar Avaliação
  const handleAddAvaliacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!avaliacaoTitle) return;

    const discObj = userDisciplinas.find((d) => d.id === avaliacaoDisciplinaId) || userDisciplinas[0];
    if (!discObj) return;

    addAvaliacao({
      disciplina_id: discObj.id,
      disciplina_name: discObj.name,
      title: avaliacaoTitle,
      description: avaliacaoDesc,
      due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      google_forms_url: isLegacy ? formsUrl : undefined,
      is_legacy: isLegacy,
      max_score: 10,
    });

    setAvaliacaoTitle('');
    setAvaliacaoDesc('');
    setFormsUrl('');
    refreshScopedData();
    showNotification('Avaliação cadastrada com sucesso!');
  };

  const handleDeleteAvaliacao = (id: string) => {
    if (confirm('Deseja realmente excluir esta avaliação?')) {
      deleteAvaliacao(id);
      refreshScopedData();
      showNotification('Avaliação excluída com sucesso.');
    }
  };

  // Handlers para Slides e Apresentações da Disciplina
  const handleOpenSlideModal = (disc: Disciplina) => {
    setSelectedDisciplinaForSlide(disc);
    const existing = getSlidesForDisciplina(disc.id);
    setDisciplinaSlides(existing);
    setSlideAulaNum(existing.length + 1);
    setSlideTitle(`Slides • Aula ${existing.length + 1} • ${disc.name}`);
    setSlideDataAula(new Date().toLocaleDateString('pt-BR'));
    setSlideUrl('');
    setSlideFile(null);
    setSlideNotes('');
    setSlideTabMode('link');
    setIsSlideModalOpen(true);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDisciplinaForSlide) return;

    let finalSlideUrl = slideUrl.trim();
    if (slideTabMode === 'file') {
      if (!slideFile) {
        alert('Selecione um arquivo de slide.');
        return;
      }
      finalSlideUrl = URL.createObjectURL(slideFile);
    } else {
      if (!finalSlideUrl) {
        alert('Informe o link do Google Slides ou PDF do Drive.');
        return;
      }
    }

    addSlideItem({
      disciplina_id: selectedDisciplinaForSlide.id,
      aula_num: Number(slideAulaNum),
      data_aula: slideDataAula.trim() || undefined,
      title: slideTitle.trim() || `Slides • Aula ${slideAulaNum} • ${selectedDisciplinaForSlide.name}`,
      slide_url: finalSlideUrl,
      notes: slideNotes.trim() || undefined,
      author_name: selectedDisciplinaForSlide.professor_name || 'Corpo Docente',
    });

    const updated = getSlidesForDisciplina(selectedDisciplinaForSlide.id);
    setDisciplinaSlides(updated);
    showNotification(`Slides da Aula ${slideAulaNum} cadastrados com sucesso para ${selectedDisciplinaForSlide.name}!`);
    setSlideUrl('');
    setSlideFile(null);
    setSlideNotes('');
    setIsSlideModalOpen(false);
  };

  const handleDeleteSlide = (slideId: string, title: string) => {
    if (confirm(`Deseja remover a apresentação "${title}"?`)) {
      deleteSlideItem(slideId);
      if (selectedDisciplinaForSlide) {
        setDisciplinaSlides(getSlidesForDisciplina(selectedDisciplinaForSlide.id));
      }
      showNotification('Apresentação de slides removida.');
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER DO DOCENTE / ADMINISTRADOR */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" /> Modo Administrador • Gestão de Docência
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                  <Sparkles className="w-3.5 h-3.5 text-blue-700" /> Área de Docência Individual • Semestre 2026.2
                </span>
              )}

              {currentSelectedProfessor ? (
                <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  👤 Atuando como: {currentSelectedProfessor.name}
                </span>
              ) : (
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  {userDisciplinas.length} {userDisciplinas.length === 1 ? 'Matéria Atribuída' : 'Matérias Atribuídas'}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black text-slate-900">
              {currentSelectedProfessor
                ? `Painel de ${currentSelectedProfessor.name}`
                : isAdmin
                ? 'Gestão Acadêmica de Professores & Matérias'
                : `Painel do Docente • ${authorName || 'Professor'}`}
            </h2>

            <p className="text-xs sm:text-sm text-slate-500">
              {currentSelectedProfessor
                ? `Visualizando e configurando o LMS sob a perspectiva exclusiva de ${currentSelectedProfessor.name} (${currentSelectedProfessor.email || 'Sem e-mail cadastrado'}).`
                : isAdmin
                ? 'Selecione abaixo como qual professor você deseja visualizar a navegação, links do Meet, Drive e avaliações.'
                : 'Gerencie exclusivamente suas matérias: configure links do Meet e Drive, publique leituras pré-aula, materiais e avaliações.'}
            </p>
          </div>

          {/* Seletor Dropdown para Administrador */}
          {isAdmin && (
            <div className="w-full md:w-auto bg-gradient-to-br from-purple-50 to-indigo-50 p-3.5 rounded-2xl border border-purple-200 shadow-xs flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-purple-700" />
                  <span>Visualizar LMS como o Professor:</span>
                </label>
                {selectedProfessorKey !== 'ALL' && (
                  <button
                    onClick={() => setSelectedProfessorKey('ALL')}
                    className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline"
                  >
                    Ver Todos
                  </button>
                )}
              </div>

              <select
                value={selectedProfessorKey}
                onChange={(e) => setSelectedProfessorKey(e.target.value)}
                className="w-full bg-white border border-purple-300 rounded-xl px-3 py-2 text-xs font-bold text-purple-950 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-xs"
              >
                <option value="ALL">🌐 Todos os Professores (Visão Geral de Admin)</option>
                {availableProfessors.map((p) => (
                  <option key={p.key} value={p.key}>
                    👨‍🏫 {p.name} {p.email ? `(${p.email})` : ''} • {p.count} {p.count === 1 ? 'matéria' : 'matérias'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Atalhos Rápidos de Professores (Pílulas) quando for Admin */}
        {isAdmin && (
          <div className="pt-2 border-t border-gray-100">
            <div className="text-[11px] font-bold text-gray-500 mb-2">Troca Rápida de Docente:</div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedProfessorKey('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedProfessorKey === 'ALL'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🌐 Todos ({allDisciplinasList.length})
              </button>
              {availableProfessors.map((p) => {
                const isSelected = selectedProfessorKey === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => setSelectedProfessorKey(p.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-purple-700 text-white shadow-xs scale-102'
                        : 'bg-purple-50/70 text-purple-900 hover:bg-purple-100 border border-purple-100'
                    }`}
                  >
                    <span>👨‍🏫 {p.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected ? 'bg-purple-900 text-white' : 'bg-purple-200/80 text-purple-900'
                    }`}>
                      {p.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Banner de Aviso quando Simulação de Docente estiver Ativa */}
        {isAdmin && currentSelectedProfessor && (
          <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-black text-sm shrink-0">
                {currentSelectedProfessor.name.charAt(0)}
              </div>
              <div className="text-xs">
                <span className="font-extrabold block text-sm">
                  Atuando como: {currentSelectedProfessor.name}
                </span>
                <span className="text-amber-800 font-medium">
                  {currentSelectedProfessor.email || 'Sem e-mail'} • {userDisciplinas.length} matéria(s) sob sua responsabilidade
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedProfessorKey('ALL')}
              className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold shadow-2xs transition"
            >
              ✕ Restaurar Visão Global
            </button>
          </div>
        )}
      </div>

      {/* Notificação Temporária */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* SEÇÃO 1: PUBLICAR LEITURAS, LINKS E RECURSOS DA AULA (DESTAQUE PRIORITÁRIO) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-blue-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Publicar Leituras, Links e Recursos da Aula</h3>
              <p className="text-xs text-gray-500">
                Envie textos pré-aula, links compartilhados durante a transmissão ao vivo ou materiais complementares com 1 clique para WhatsApp e portal do aluno.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 w-fit">
            {announcements.length} {announcements.length === 1 ? 'Link / Leitura Ativa' : 'Links / Leituras Ativas'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulário de Envio / Edição Rápida */}
          <form onSubmit={handleAddAnnouncement} className="lg:col-span-6 space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                {editingAnnouncementId ? (
                  <>
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Editar Link ou Leitura</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                    <span>Novo Link ou Leitura</span>
                  </>
                )}
              </h4>

              {editingAnnouncementId && (
                <button
                  type="button"
                  onClick={handleCancelEditAnnouncement}
                  className="text-xs font-bold text-gray-500 hover:text-red-600 transition flex items-center gap-1 cursor-pointer"
                >
                  ✕ Cancelar Edição
                </button>
              )}
            </div>

            {/* Banner de Edição */}
            {editingAnnouncementId && (
              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 font-medium">
                Editando: <strong>{leituraTitle || 'Item selecionado'}</strong>
              </div>
            )}

            {/* Seletor de Categoria / Momento do Link */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Momento / Categoria do Recurso
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLeituraCategory('durante_aula')}
                  className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    leituraCategory === 'durante_aula'
                      ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-2xs font-extrabold'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>🔴 Em Aula</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeituraCategory('pre_aula')}
                  className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    leituraCategory === 'pre_aula'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs font-extrabold'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>📖 Pré-Aula</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeituraCategory('complementar')}
                  className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    leituraCategory === 'complementar'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs font-extrabold'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>📌 Complementar</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Disciplina</label>
                <select
                  value={selectedDisciplinaId}
                  onChange={(e) => setSelectedDisciplinaId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  {userDisciplinas.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.day_of_week})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Docente Responsável</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Ex: Profº Cleiton Barbirato"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Título do Link / Artigo / Recurso</label>
              <input
                type="text"
                value={leituraTitle}
                onChange={(e) => setLeituraTitle(e.target.value)}
                placeholder="Ex: Slide da Apresentação, Artigo do IBGE, Vídeo..."
                className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Link de Acesso (URL Completa)</label>
              <div className="relative">
                <input
                  type="url"
                  value={leituraUrl}
                  onChange={(e) => setLeituraUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 pl-8 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data / Referência da Aula</label>
                <input
                  type="text"
                  value={leituraData}
                  onChange={(e) => setLeituraData(e.target.value)}
                  placeholder="Ex: Aula de Hoje ou 26/08/2026"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recado / Contexto aos Alunos</label>
                <input
                  type="text"
                  value={leituraMessage}
                  onChange={(e) => setLeituraMessage(e.target.value)}
                  placeholder="Ex: Link citado na aula para leitura complementar..."
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                editingAnnouncementId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-900 hover:bg-blue-800'
              }`}
            >
              {editingAnnouncementId ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 text-blue-300" />
                  <span>{leituraCategory === 'durante_aula' ? 'Publicar Link da Aula Ao Vivo' : 'Publicar no LMS'}</span>
                </>
              )}
            </button>
          </form>

          {/* Lista de Leituras Ativas & Arquivadas */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Links & Leituras das Matérias</span>
              </h4>

              {/* Seletor de Aba: Ativas vs Arquivadas */}
              <div className="flex items-center bg-gray-100 p-0.5 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAnnouncementsSubTab('active')}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                    announcementsSubTab === 'active'
                      ? 'bg-white text-blue-900 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Ativos ({announcements.filter((a) => !a.is_archived).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAnnouncementsSubTab('archived')}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                    announcementsSubTab === 'archived'
                      ? 'bg-white text-amber-900 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Archive className="w-3 h-3 text-amber-600" />
                  <span>Arquivados ({announcements.filter((a) => a.is_archived).length})</span>
                </button>
              </div>
            </div>

            {(() => {
              const displayedList = announcements.filter((a) =>
                announcementsSubTab === 'active' ? !a.is_archived : a.is_archived
              );

              if (displayedList.length === 0) {
                return (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-gray-200 text-center text-xs text-gray-500 space-y-1">
                    <p className="font-semibold text-gray-700">
                      {announcementsSubTab === 'active'
                        ? 'Nenhum link ou leitura ativa no momento para as matérias selecionadas.'
                        : 'Nenhum item no acervo arquivado.'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {announcementsSubTab === 'active'
                        ? 'Use o formulário ao lado para compartilhar um novo link ou leitura para os alunos.'
                        : 'Ao arquivar um link ou leitura ativa, ele é guardado aqui para consulta histórica.'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {displayedList.map((av) => (
                    <div
                      key={av.id}
                      className={`p-4 rounded-2xl bg-white border shadow-2xs space-y-3 transition ${
                        editingAnnouncementId === av.id
                          ? 'border-2 border-amber-400 bg-amber-50/30 ring-2 ring-amber-300/40'
                          : av.is_archived
                          ? 'border-amber-200 bg-amber-50/30 hover:border-amber-400'
                          : 'border-gray-200/90 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md">
                              {av.disciplina_name}
                            </span>

                            {/* Badge de Categoria / Momento */}
                            {av.category === 'durante_aula' ? (
                              <span className="text-[10px] font-black uppercase tracking-wide bg-rose-100 text-rose-900 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                                🔴 Em Aula (Ao Vivo)
                              </span>
                            ) : av.category === 'complementar' ? (
                              <span className="text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                📌 Complementar
                              </span>
                            ) : (
                              <span className="text-[10px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                📖 Leitura Pré-Aula
                              </span>
                            )}

                            {av.is_archived && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Archive className="w-2.5 h-2.5" /> Arquivada
                              </span>
                            )}
                          </div>
                          <h5 className="font-extrabold text-sm text-slate-900">{av.title}</h5>
                          {av.message && (
                            <p className="text-xs text-slate-600 italic">"{av.message}"</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Botão de Editar */}
                          <button
                            onClick={() => handleStartEditAnnouncement(av)}
                            title="Editar este link ou leitura"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {av.is_archived ? (
                            <button
                              onClick={() => handleUnarchiveAnnouncement(av.id)}
                              title="Restaurar leitura para o feed ativo dos alunos"
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            >
                              <ArchiveRestore className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleArchiveAnnouncement(av.id)}
                              title="Arquivar leitura (sair do feed principal do aluno)"
                              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAnnouncement(av.id)}
                            title="Excluir link definitivamente"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                        <span>Por: <strong>{av.author_name}</strong></span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-bold">{av.target_date || 'Data da Aula'}</span>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <a
                          href={av.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl border border-blue-200 transition flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir Link</span>
                        </a>
                        <button
                          onClick={() => handleCopyAvisoWhatsApp(av)}
                          className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          {copiedAvisoId === av.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-200" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: SALAS VIRTUAIS & MANEJO DAS SUAS MATÉRIAS */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-red-600" />
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
              {isAdmin ? 'Salas de Aula Ao Vivo (Google Meet)' : 'Suas Salas de Aula Ao Vivo & Links da Matéria'}
            </h3>
          </div>
          <span className="text-xs font-semibold text-gray-500">
            Clique em "Manejar Matéria" para alterar links do Meet, Drive ou presença
          </span>
        </div>

        {userDisciplinas.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-500 space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <div className="font-bold text-gray-800 text-sm">Nenhuma disciplina vinculada ao seu e-mail ({normalizedEmail})</div>
            <p className="text-xs">Entre em contato com a secretaria administrativa para associar suas matérias ao seu e-mail.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userDisciplinas.map((disc) => (
              <div 
                key={disc.id} 
                className="p-5 rounded-2xl border border-gray-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-md">
                      {disc.day_of_week} • {disc.start_time} às {disc.end_time}
                    </span>
                    <button
                      onClick={() => handleOpenEditDisciplina(disc)}
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                      title="Manejar Dados e Links da Matéria"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-sm mt-2.5 leading-snug">{disc.name}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">👨‍🏫 {disc.professor_name}</p>
                  
                  {disc.description && (
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 italic">
                      "{disc.description}"
                    </p>
                  )}

                  {disc.google_meet_phone && (
                    <p className="text-[10px] text-slate-400 mt-2 font-mono">
                      📞 {disc.google_meet_phone} (PIN: {disc.google_meet_pin})
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <div className="flex gap-2">
                    {disc.google_meet_url ? (
                      <a
                        href={disc.google_meet_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Abrir Meet</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => handleOpenEditDisciplina(disc)}
                        className="flex-1 py-2 px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl transition"
                      >
                        + Inserir Link Meet
                      </button>
                    )}

                    {disc.google_meet_url && (
                      <button
                        onClick={() => handleCopyMeet(disc.google_meet_url!, disc.id)}
                        className="px-3 py-2 bg-white hover:bg-gray-100 text-slate-700 border border-gray-300 font-bold text-xs rounded-xl transition"
                        title="Copiar link da reunião"
                      >
                        {copiedMeetId === disc.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                    {disc.google_drive_url ? (
                      <a
                        href={disc.google_drive_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <FolderOpen className="w-3.5 h-3.5" /> Pasta no Drive
                      </a>
                    ) : (
                      <span className="text-gray-400">Sem pasta Drive</span>
                    )}

                    <button
                      onClick={() => handleOpenEditDisciplina(disc)}
                      className="text-slate-600 hover:text-blue-700 font-bold flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" /> Manejar Matéria
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenSlideModal(disc)}
                      className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-extrabold text-xs rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                      title="Introduzir o link dos slides ou o arquivo diretamente por aqui"
                    >
                      <Presentation className="w-3.5 h-3.5 text-purple-600" />
                      <span>📑 Inserir Slides da Aula (Link ou Arquivo)</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(
                            new CustomEvent('lms_open_recorder', {
                              detail: { disciplinaId: disc.id, aulaNum: 1 },
                            })
                          );
                        }
                      }}
                      className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                      title="Gravar a aula do Meet em 2º plano enquanto navega e utiliza o LMS livremente"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>🔴 Gravar Aula</span>
                    </button>

                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(
                            new CustomEvent('lms_open_disciplina_detail', {
                              detail: { disciplinaId: disc.id },
                            })
                          );
                        }
                      }}
                      className="flex-1 py-2 px-3 bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-300" />
                      <span>Página da Matéria ➔</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEÇÃO 3: MATERIAIS DE ESTUDO & AVALIAÇÕES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário e Lista de Materiais de Estudo */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Upload className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900 text-base">Publicar Novo Material de Estudo</h3>
          </div>

          <form onSubmit={handleAddMaterial} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Disciplina</label>
              <select
                value={materialDisciplinaId}
                onChange={(e) => setMaterialDisciplinaId(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                {userDisciplinas.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Título do Material</label>
              <input
                type="text"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                placeholder="Ex: Apostila Aula 2 - A Patrística.pdf"
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Toggle Tipo de Upload */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 block">Tipo de Publicação:</span>
                <span className="text-xs text-gray-500">
                  {isNative ? 'Upload Arquivo Nativo (PDF/Doc)' : 'Link Externo Google Drive (Fallback)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsNative(!isNative)}
                className="text-blue-600 hover:text-blue-800"
              >
                {isNative ? <ToggleRight className="w-8 h-8 text-blue-600" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
              </button>
            </div>

            {isNative ? (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Arquivo Nativo</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full p-2 border border-gray-300 rounded-xl text-xs text-gray-600 bg-white"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">URL da Pasta/Arquivo no Google Drive</label>
                <input
                  type="url"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/open?id=..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Publicar Material
            </button>
          </form>

          {/* Lista de Materiais Cadastrados */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Materiais das Suas Matérias ({materials.length})
            </h4>
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {materials.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">Nenhum material publicado ainda.</div>
              ) : (
                materials.map((mat) => (
                  <div key={mat.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">{mat.title}</span>
                      <span className="text-[11px] text-blue-700 font-semibold">{mat.disciplina_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${mat.is_native_upload ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {mat.is_native_upload ? 'Nativo' : 'Drive'}
                      </span>
                      <button
                        onClick={() => handleDeleteMaterial(mat.id)}
                        className="text-gray-400 hover:text-red-600 p-1 transition"
                        title="Excluir material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Formulário e Lista de Avaliações */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900 text-base">Cadastrar Nova Avaliação</h3>
          </div>

          <form onSubmit={handleAddAvaliacao} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Disciplina</label>
              <select
                value={avaliacaoDisciplinaId}
                onChange={(e) => setAvaliacaoDisciplinaId(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              >
                {userDisciplinas.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Título da Avaliação</label>
              <input
                type="text"
                value={avaliacaoTitle}
                onChange={(e) => setAvaliacaoTitle(e.target.value)}
                placeholder="Ex: Prova Regimental Concílios Ecumênicos"
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Instruções / Descrição</label>
              <textarea
                rows={2}
                value={avaliacaoDesc}
                onChange={(e) => setAvaliacaoDesc(e.target.value)}
                placeholder="Instruções para os alunos..."
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              ></textarea>
            </div>

            {/* Toggle is_legacy */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-900 block">Modo da Avaliação (is_legacy):</span>
                <span className="text-xs text-emerald-700">
                  {isLegacy ? 'Google Forms Incorporado via Iframe (Legado)' : 'Prova Nativa do LMS'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsLegacy(!isLegacy)}
                className="text-emerald-700 hover:text-emerald-900"
              >
                {isLegacy ? <ToggleRight className="w-8 h-8 text-emerald-600" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
              </button>
            </div>

            {isLegacy && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Link do Google Forms (para Iframe)</label>
                <input
                  type="url"
                  value={formsUrl}
                  onChange={(e) => setFormsUrl(e.target.value)}
                  placeholder="https://forms.gle/..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required={isLegacy}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Criar Avaliação
            </button>
          </form>

          {/* Lista de Avaliações */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Avaliações das Suas Matérias ({avaliacoes.length})
            </h4>
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {avaliacoes.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">Nenhuma avaliação cadastrada ainda.</div>
              ) : (
                avaliacoes.map((av) => (
                  <div key={av.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">{av.title}</span>
                      <span className="text-[11px] text-emerald-700 font-semibold">{av.disciplina_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${av.is_legacy ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                        {av.is_legacy ? 'Google Forms' : 'Nativo'}
                      </span>
                      <button
                        onClick={() => handleDeleteAvaliacao(av.id)}
                        className="text-gray-400 hover:text-red-600 p-1 transition"
                        title="Excluir avaliação"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 4: MATERIAIS DE APOIO & GEMINI NOTEBOOK (NOTEBOOKLM) */}
      <div className="space-y-4">
        <SupportMaterialsHub
          allowedDisciplinas={userDisciplinas}
          currentRole={currentRole}
          userEmail={userEmail}
          onOpenDisciplina={(discId) => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('lms_open_disciplina_detail', {
                  detail: { disciplinaId: discId },
                })
              );
            }
          }}
        />
      </div>

      {/* MODAL PARA MANEJAR INDIVIDUALMENTE OS DADOS DA MATÉRIA */}
      {editingDisciplina && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 border border-gray-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {editingDisciplina.code} • {editingDisciplina.day_of_week}
                </span>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 mt-1">
                  Manejar Dados da Matéria: {editingDisciplina.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingDisciplina(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold flex items-center justify-center text-xs hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDisciplina} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link Oficial do Google Meet:
                </label>
                <input
                  type="url"
                  value={editMeetUrl}
                  onChange={(e) => setEditMeetUrl(e.target.value)}
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefone de Discagem (Opcional):
                  </label>
                  <input
                    type="text"
                    value={editMeetPhone}
                    onChange={(e) => setEditMeetPhone(e.target.value)}
                    placeholder="(BR) +55 11 4933-5763"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PIN do Meet:
                  </label>
                  <input
                    type="text"
                    value={editMeetPin}
                    onChange={(e) => setEditMeetPin(e.target.value)}
                    placeholder="788 555 787#"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link da Pasta no Google Drive:
                </label>
                <input
                  type="url"
                  value={editDriveUrl}
                  onChange={(e) => setEditDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/open?id=..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link do Formulário de Presença Padrão (Google Forms):
                </label>
                <input
                  type="url"
                  value={editAttendanceUrl}
                  onChange={(e) => setEditAttendanceUrl(e.target.value)}
                  placeholder="https://forms.gle/..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ementa / Descrição da Disciplina:
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Descrição da disciplina..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDisciplina(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GERENCIAR E INSERIR SLIDES DA AULA (LINK OU ARQUIVO) */}
      {isSlideModalOpen && selectedDisciplinaForSlide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl border border-purple-200">
                  <Presentation className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg sm:text-xl">
                    Slides & Apresentações das Aulas
                  </h3>
                  <p className="text-xs text-purple-900 font-bold mt-0.5">
                    {selectedDisciplinaForSlide.name} • 👨‍🏫 {selectedDisciplinaForSlide.professor_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSlideModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Formulário de Cadastro de Novo Slide */}
            <form onSubmit={handleSaveSlide} className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-purple-100">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-purple-600" />
                  <span>Cadastrar Nova Apresentação</span>
                </h4>

                {/* Abas: Link vs Arquivo */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSlideTabMode('link')}
                    className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                      slideTabMode === 'link'
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>Link do Drive/Slides</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlideTabMode('file')}
                    className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                      slideTabMode === 'file'
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <UploadCloud className="w-3 h-3" />
                    <span>Upload de Arquivo (PDF/PPT)</span>
                  </button>
                </div>
              </div>

              {/* Seletor de Disciplina (se quiser alternar) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Aula nº <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={18}
                    value={slideAulaNum}
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      setSlideAulaNum(num);
                      setSlideTitle(`Slides • Aula ${num} • ${selectedDisciplinaForSlide.name}`);
                    }}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Data da Aula
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 25/08/2026"
                    value={slideDataAula}
                    onChange={(e) => setSlideDataAula(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Docente
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedDisciplinaForSlide.professor_name}
                    className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Título dos Slides <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  placeholder={`Ex: Slides • Aula ${slideAulaNum} • ${selectedDisciplinaForSlide.name}`}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>

              {/* Entrada de URL ou Arquivo de acordo com a aba selecionada */}
              {slideTabMode === 'link' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Link do Google Slides / PDF no Drive <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={slideUrl}
                      onChange={(e) => setSlideUrl(e.target.value)}
                      placeholder="https://docs.google.com/presentation/d/... ou https://drive.google.com/..."
                      className="w-full p-2.5 pl-8 bg-white border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      required={slideTabMode === 'link'}
                    />
                    <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
                  </div>
                  <p className="text-[11px] text-purple-800 mt-1 font-medium">
                    💡 O LMS integrará a apresentação de slides diretamente na aba interativa do aluno com modo foco e recursos de estudo.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Selecionar Arquivo de Apresentação (PDF ou PPTX) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx"
                    onChange={(e) => setSlideFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required={slideTabMode === 'file'}
                  />
                  {slideFile && (
                    <p className="text-[11px] text-emerald-700 font-bold mt-1">
                      ✓ Arquivo selecionado: {slideFile.name} ({Math.round(slideFile.size / 1024)} KB)
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tópicos e Guia de Estudo da Aula (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={slideNotes}
                  onChange={(e) => setSlideNotes(e.target.value)}
                  placeholder="Ex: Tópicos abordados: 1. Reforma Inglesa, 2. Puritanismo, 3. Confissão de Fé de Savoy..."
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar e Publicar Slides</span>
                </button>
              </div>
            </form>

            {/* Listagem de Slides já Cadastrados nesta Matéria */}
            <div className="pt-2 space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-600 flex items-center justify-between">
                <span>Slides Cadastrados para esta Disciplina ({disciplinaSlides.length})</span>
                <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold">
                  Sincronizado com o Hub da Disciplina
                </span>
              </h4>

              {disciplinaSlides.length === 0 ? (
                <div className="p-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-500">
                  Nenhum slide cadastrado ainda para esta matéria. Use o formulário acima para adicionar o link ou arquivo.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {disciplinaSlides.map((slide) => (
                    <div
                      key={slide.id}
                      className="p-3.5 bg-white rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-xs transition flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md">
                            Aula {slide.aula_num} • {slide.data_aula || 'Semestre 2026.2'}
                          </span>
                        </div>
                        <h5 className="font-bold text-gray-900">{slide.title}</h5>
                        {slide.notes && (
                          <p className="text-[11px] text-gray-500 line-clamp-1 italic">
                            "{slide.notes}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={slide.slide_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition"
                          title="Abrir Apresentação"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteSlide(slide.id, slide.title)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Remover Slides"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== SEÇÃO 5: RADAR DE TELE-PROXIMIDADE (Learning Analytics Anti-Evasão) ===== */}
      <div className="bg-white rounded-3xl border border-violet-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-violet-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-md">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Radar de Tele-Proximidade</h3>
              <p className="text-[11px] text-violet-600 font-medium">Learning Analytics Anti-Evasão · TSP Score por Aluno</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-violet-700 bg-violet-100 border border-violet-200 px-2.5 py-1 rounded-full">📊 Analytics</span>
        </div>
        <div className="p-6">
          <TeleProximidadeDashboard userEmail={normalizedEmail} currentRole={currentRole} />
        </div>
      </div>

      {/* ===== SEÇÃO 6: TRILHA SOCRÁTICA DOS QUATRO Ds DE JESUS (Metodologia Inov-Ativa) ===== */}
      <div className="bg-white rounded-3xl border border-orange-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-orange-100 flex items-center justify-between gap-4 bg-orange-50/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Trilha de Ensinagem Socrática (4Ds de Jesus)</h3>
              <p className="text-[11px] text-orange-600 font-medium">Criação & Acompanhamento de Trilhas Socráticas por Disciplina</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-orange-700 bg-orange-100 border border-orange-200 px-2.5 py-1 rounded-full">🔥 Inov-Ativa</span>
        </div>
        <div className="p-6">
          <QuatrodsDsPage userEmail={normalizedEmail} userName="" currentRole={currentRole} />
        </div>
      </div>

      {/* ===== SEÇÃO 7: ESTÚDIO DE HOMILÉTICA & AVALIAÇÃO MEDIADORA (Peer Instruction) ===== */}
      <div className="bg-white rounded-3xl border border-rose-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-rose-100 flex items-center justify-between gap-4 bg-rose-50/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-700 flex items-center justify-center shadow-md">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Estúdio de Prática Homilética & Aconselhamento</h3>
              <p className="text-[11px] text-rose-700 font-medium">Instrução por Pares, Avaliações Mediadoras e Feedback Ministerial</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-full">🎙️ Homilética</span>
        </div>
        <div className="p-6">
          <HomileticaEstudioPage userEmail={normalizedEmail} userName="" currentRole={currentRole} />
        </div>
      </div>

      {/* ===== SEÇÃO 8: METAVERSO TEOLÓGICO & AMBIENTES DE IMERSÃO 3D (Arqueologia Bíblica) ===== */}
      <div className="bg-white rounded-3xl border border-cyan-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-cyan-100 flex items-center justify-between gap-4 bg-cyan-50/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-600 to-indigo-800 flex items-center justify-center shadow-md">
              <Box className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Metaverso Teológico & Exploração 3D</h3>
              <p className="text-[11px] text-cyan-800 font-medium">Reconstituições Históricas, Hotspots Exegéticos e Missões Imersivas</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100 border border-cyan-200 px-2.5 py-1 rounded-full">🏛️ 3D Imersivo</span>
        </div>
        <div className="p-6">
          <MetaversoTeologicoPage userEmail={normalizedEmail} userName="" currentRole={currentRole} />
        </div>
      </div>
    </div>
  );
};


