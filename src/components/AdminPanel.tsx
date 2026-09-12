'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, UserCheck, BookOpen, GraduationCap, 
  UserPlus, Trash2, CheckCircle2, XCircle, Search, 
  Mail, User, Clock, AlertCircle, Plus, Edit3, Video, FolderOpen,
  Phone, Send, Copy, Check, ExternalLink, MessageCircle,
  Activity, Zap, BarChart3
} from 'lucide-react';
import { UserRole, Disciplina } from '@/types';
import { 
  getAuthorizedUsersList, 
  addOrUpdateAuthorizedUser, 
  removeAuthorizedUser, 
  getPendingRequests, 
  approveAccessRequest, 
  rejectAccessRequest, 
  syncRbacFromCloud,
  formatApprovalEmail,
  UserRoleMapping, 
  AccessRequest,
  INITIAL_AUTHORIZED_USERS 
} from '@/lib/authConfig';
import { formatPhone, cleanPhoneNumber, getWhatsAppUrl } from '@/lib/phoneUtils';
import { getAllDisciplinas, updateDisciplina } from '@/services/disciplinasService';
import { AdminAnalyticsView } from '@/components/AdminAnalyticsView';
import { AdminTCCResearchView } from '@/components/AdminTCCResearchView';
import { InviteUserModal } from '@/components/InviteUserModal';

export interface AdminPanelProps {
  initialSubTab?: 'analytics' | 'tcc' | 'requests' | 'users' | 'disciplinas';
  onSubTabChange?: (tab: 'analytics' | 'tcc' | 'requests' | 'users' | 'disciplinas') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  initialSubTab = 'analytics', 
  onSubTabChange 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'tcc' | 'requests' | 'users' | 'disciplinas'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSubTabChange = (tab: 'analytics' | 'tcc' | 'requests' | 'users' | 'disciplinas') => {
    setActiveSubTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };


  const [usersList, setUsersList] = useState<Record<string, UserRoleMapping>>({});

  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [disciplinasList, setDisciplinasList] = useState<Disciplina[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  // Modal State para Adicionar Usuário
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('aluno');
  const [newWhatsapp, setNewWhatsapp] = useState<string>('');
  const [newTurma, setNewTurma] = useState<number>(1);

  // Modal State para Editar Usuário
  const [editingUser, setEditingUser] = useState<UserRoleMapping | null>(null);
  const [editUserName, setEditUserName] = useState<string>('');
  const [editUserEmail, setEditUserEmail] = useState<string>('');
  const [editUserDefaultRole, setEditUserDefaultRole] = useState<UserRole>('aluno');
  const [editUserRoles, setEditUserRoles] = useState<UserRole[]>(['aluno']);
  const [editUserTurma, setEditUserTurma] = useState<number>(1);
  const [editUserPeriodo, setEditUserPeriodo] = useState<number>(7);
  const [editUserWhatsapp, setEditUserWhatsapp] = useState<string>('');

  // Modal de E-mail de Aprovação e Boas-Vindas
  const [approvalModalData, setApprovalModalData] = useState<{
    name: string;
    email: string;
    role: UserRole;
    subject: string;
    body: string;
    mailtoUrl: string;
    gmailUrl: string;
    whatsappUrl: string;
    copied: boolean;
  } | null>(null);

  // Modal de Envio Rápido de Convite para Usuários
  const [inviteModalUser, setInviteModalUser] = useState<UserRoleMapping | null>(null);

  // Modal State para Editar Disciplina
  const [editingDisc, setEditingDisc] = useState<Disciplina | null>(null);
  const [editProfName, setEditProfName] = useState('');
  const [editProfEmail, setEditProfEmail] = useState('');
  const [editMeetUrl, setEditMeetUrl] = useState('');
  const [editDriveUrl, setEditDriveUrl] = useState('');
  const [editTurmaIdx, setEditTurmaIdx] = useState<number>(1);
  const [discTurmaFilter, setDiscTurmaFilter] = useState<number | 'all'>('all');

  // Mapeamento e estilo dos badges de turmas
  const getTurmaBadgeInfo = (idx?: number) => {
    switch (idx) {
      case 1:
        return { 
          label: 'Turma A (7º)', 
          fullName: 'Turma A • 7º Período (Veteranos)', 
          badgeCls: 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' 
        };
      case 2:
        return { 
          label: 'Turma B (3º)', 
          fullName: 'Turma B • 3º Período (Ingressantes)', 
          badgeCls: 'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' 
        };
      case 0:
        return { 
          label: 'Fim de Semana (5º)', 
          fullName: 'Turma Fim de Semana • 5º Período (Modular)', 
          badgeCls: 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' 
        };
      case 3:
        return { 
          label: 'Curso Básico', 
          fullName: 'Curso Básico de Teologia', 
          badgeCls: 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' 
        };
      default:
        return { 
          label: 'Geral', 
          fullName: 'Geral / Outra Turma', 
          badgeCls: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' 
        };
    }
  };

  const reloadData = async () => {
    await syncRbacFromCloud(true);
    const users = getAuthorizedUsersList();
    setUsersList(users);
    const pending = getPendingRequests().filter((p) => p.email && !users[p.email.toLowerCase().trim()]);
    setPendingRequests(pending);
    setDisciplinasList(getAllDisciplinas());
  };

  useEffect(() => {
    reloadData();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        reloadData();
      }
    }, 300000); // 5 minutos

    const handleDiscUpd = () => setDisciplinasList(getAllDisciplinas());
    const handleRbacUpd = () => {
      const users = getAuthorizedUsersList();
      setUsersList(users);
      const pending = getPendingRequests().filter((p) => p.email && !users[p.email.toLowerCase().trim()]);
      setPendingRequests(pending);
    };

    window.addEventListener('lms_disciplinas_updated', handleDiscUpd);
    window.addEventListener('lms_rbac_updated', handleRbacUpd);

    return () => {
      clearInterval(interval);
      window.removeEventListener('lms_disciplinas_updated', handleDiscUpd);
      window.removeEventListener('lms_rbac_updated', handleRbacUpd);
    };
  }, []);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApprove = async (req: AccessRequest, role: UserRole) => {
    // Atualização otimista imediata na UI para não travar na tela do celular
    const reqEmailNorm = req.email.toLowerCase().trim();
    setPendingRequests((prev) => prev.filter((p) => p.id !== req.id && p.email.toLowerCase().trim() !== reqEmailNorm));

    const emailInfo = formatApprovalEmail(req.name, req.email, role, req.whatsapp);
    setApprovalModalData({
      name: req.name,
      email: req.email,
      role,
      subject: emailInfo.subject,
      body: emailInfo.body,
      mailtoUrl: emailInfo.mailtoUrl,
      gmailUrl: emailInfo.gmailUrl,
      whatsappUrl: emailInfo.whatsappUrl,
      copied: false,
    });
    showNotify(`Solicitação de ${req.name} aprovada no perfil de ${role.toUpperCase()}!`);

    await approveAccessRequest(req.id, role);
    await reloadData();
  };

  const handleReject = async (id: string) => {
    setPendingRequests((prev) => prev.filter((p) => p.id !== id));
    await rejectAccessRequest(id);
    await reloadData();
    showNotify('Solicitação de acesso rejeitada.');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      showNotify('Por favor informe um e-mail válido.');
      return;
    }

    addOrUpdateAuthorizedUser({
      email: newEmail.trim(),
      name: newName.trim() || newEmail.trim(),
      roles: newRole === 'aluno' ? ['aluno'] : [newRole, 'aluno'],
      defaultRole: newRole,
      whatsapp: formatPhone(newWhatsapp.trim()) || undefined,
      turmaIdx: newTurma,
      periodoNum: newTurma === 2 ? 3 : 7,
    });

    reloadData();
    setIsModalOpen(false);
    setNewEmail('');
    setNewName('');
    setNewRole('aluno');
    setNewWhatsapp('');
    setNewTurma(1);
    showNotify(`E-mail ${newEmail} cadastrado e autorizado como ${newRole.toUpperCase()}!`);
  };

  const handleOpenEditUser = (u: UserRoleMapping) => {
    setEditingUser(u);
    setEditUserName(u.name);
    setEditUserEmail(u.email);
    setEditUserDefaultRole(u.defaultRole);
    setEditUserRoles(u.roles || [u.defaultRole]);
    setEditUserTurma(u.turmaIdx || 1);
    setEditUserPeriodo(u.periodoNum || (u.turmaIdx === 2 ? 3 : 7));
    setEditUserWhatsapp(formatPhone(u.whatsapp || ''));
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const finalRoles = editUserRoles.length > 0 ? editUserRoles : [editUserDefaultRole];
    if (!finalRoles.includes(editUserDefaultRole)) {
      finalRoles.push(editUserDefaultRole);
    }

    addOrUpdateAuthorizedUser({
      ...editingUser,
      name: editUserName.trim() || editingUser.email,
      defaultRole: editUserDefaultRole,
      roles: finalRoles,
      turmaIdx: editUserTurma,
      periodoNum: editUserPeriodo,
      whatsapp: formatPhone(editUserWhatsapp.trim()) || undefined,
    });

    reloadData();
    setEditingUser(null);
    showNotify(`Perfil de ${editUserName || editingUser.email} atualizado com sucesso!`);
  };

  const handleToggleRole = (role: UserRole) => {
    if (editUserRoles.includes(role)) {
      if (editUserRoles.length === 1) return; // precisa ter ao menos um papel
      const next = editUserRoles.filter((r) => r !== role);
      setEditUserRoles(next);
      if (editUserDefaultRole === role) {
        setEditUserDefaultRole(next[0]);
      }
    } else {
      setEditUserRoles([...editUserRoles, role]);
    }
  };

  const handleRemoveUser = async (email: string) => {
    const normalized = email.toLowerCase().trim();
    if (confirm(`Tem certeza que deseja revogar o acesso do e-mail ${email}?`)) {
      // 1. Remoção otimista instantânea na UI para sumir imediatamente da tela
      setUsersList((prev) => {
        const next = { ...prev };
        delete next[normalized];
        return next;
      });
      // 2. Persistir revogação definitiva no storage, na nuvem e tabela users
      removeAuthorizedUser(normalized);
      await reloadData();
      showNotify(`Acesso do e-mail ${email} revogado com sucesso.`);
    }
  };

  const handleOpenEditDisc = (d: Disciplina) => {
    setEditingDisc(d);
    setEditProfName(d.professor_name || '');
    setEditProfEmail(d.professor_email || '');
    setEditMeetUrl(d.google_meet_url || '');
    setEditDriveUrl(d.google_drive_url || '');
    setEditTurmaIdx(d.turma_idx ?? 1);
  };

  const handleSaveDisc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDisc) return;

    const updated: Disciplina = {
      ...editingDisc,
      professor_name: editProfName.trim(),
      professor_email: editProfEmail.trim() || undefined,
      google_meet_url: editMeetUrl.trim() || undefined,
      google_drive_url: editDriveUrl.trim() || undefined,
      turma_idx: editTurmaIdx,
    };

    updateDisciplina(updated);
    setEditingDisc(null);
    showNotify(`Atribuição e dados da disciplina "${updated.name}" salvos com sucesso!`);
  };

  const filteredUsers = Object.values(usersList).filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) || 
      u.name.toLowerCase().includes(q) || 
      u.defaultRole.toLowerCase().includes(q) ||
      (u.whatsapp && u.whatsapp.includes(q))
    );
  });

  const filteredDisciplinas = disciplinasList.filter((d) => {
    // Filtro por turma
    if (discTurmaFilter !== 'all' && d.turma_idx !== discTurmaFilter) {
      return false;
    }
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.code?.toLowerCase().includes(q) ||
      d.professor_name?.toLowerCase().includes(q) ||
      d.day_of_week.toLowerCase().includes(q) ||
      d.professor_email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 animate-in fade-in">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-gray-700 flex items-center gap-3 text-xs font-bold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Banner Principal de Administração */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-400/30">
            <ShieldCheck className="w-4 h-4" /> Gestão Global RBAC & Coordenação
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Painel do Administrador UIECB</h1>
          <p className="text-sm text-purple-200/80 max-w-2xl leading-relaxed">
            Controle centralizado de permissões, aprovação de e-mails, contatos via WhatsApp, atribuição docente e links oficiais das disciplinas.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="z-10 px-5 py-3 bg-white text-purple-950 font-bold text-xs rounded-2xl shadow-lg hover:bg-purple-50 transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4 text-purple-700" />
          <span>Cadastrar E-mail Autorizado</span>
        </button>
      </div>

      {/* Cards de Métricas */}
      <div data-tour="admin-metrics" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
          <span className="text-2xl font-black text-purple-900">{Object.keys(usersList).length}</span>
          <span className="block text-xs font-bold text-purple-700 mt-0.5">Total Autorizados</span>
        </div>
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <span className="text-2xl font-black text-amber-900">{pendingRequests.length}</span>
          <span className="block text-xs font-bold text-amber-700 mt-0.5">Pedidos Pendentes</span>
        </div>
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <span className="text-2xl font-black text-blue-900">
            {Object.values(usersList).filter((u) => u.roles.includes('professor')).length}
          </span>
          <span className="block text-xs font-bold text-blue-700 mt-0.5">Professores Cadastrados</span>
        </div>
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
          <span className="text-2xl font-black text-emerald-900">
            {disciplinasList.length}
          </span>
          <span className="block text-xs font-bold text-emerald-700 mt-0.5">Matérias Oficiais</span>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="flex border-b border-gray-200 gap-4 overflow-x-auto">
        <button
          data-tour="admin-analytics"
          onClick={() => handleSubTabChange('analytics')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeSubTab === 'analytics'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Activity className="w-4 h-4 text-purple-600" />
          <span>Acessos & Telemetria (Uso do LMS)</span>
          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-[10px] font-black">
            Live
          </span>
        </button>

        <button
          data-tour="admin-requests"
          onClick={() => handleSubTabChange('requests')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeSubTab === 'requests'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Solicitações Pendentes</span>
          {pendingRequests.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-black">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          data-tour="admin-usuarios"
          onClick={() => handleSubTabChange('users')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeSubTab === 'users'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Lista de E-mails Autorizados ({Object.keys(usersList).length})</span>
        </button>

        <button
          data-tour="admin-disciplinas-tab"
          onClick={() => handleSubTabChange('disciplinas')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeSubTab === 'disciplinas'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Disciplinas & Docentes ({disciplinasList.length})</span>
        </button>

        <button
          data-tour="admin-tcc-tab"
          onClick={() => handleSubTabChange('tcc')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeSubTab === 'tcc'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-violet-600" />
          <span>Pesquisa Empírica TCC</span>
          <span className="px-2 py-0.5 bg-violet-100 text-violet-800 rounded-full text-[10px] font-black">
            TCC 2026.2
          </span>
        </button>
      </div>

      {/* CONTEÚDO 0: ACESSOS & TELEMETRIA */}
      {activeSubTab === 'analytics' && (
        <AdminAnalyticsView />
      )}

      {/* CONTEÚDO TCC: PESQUISA EMPÍRICA & MÉTRICAS CIENTÍFICAS */}
      {activeSubTab === 'tcc' && (
        <AdminTCCResearchView />
      )}


      {/* CONTEÚDO 1: SOLICITAÇÕES PENDENTES */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 text-center text-gray-500 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="font-bold text-gray-700 dark:text-slate-300">Nenhuma solicitação pendente no momento.</div>
              <p className="dark:text-slate-400">Quando um novo usuário tentar entrar pelo Google e enviar seu pedido com turma e período, o registro aparecerá aqui para análise e aprovação.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => {
                const turmaInfo = getTurmaBadgeInfo(req.turmaIdx);
                const hasCustomName = req.googleName && req.googleName.toLowerCase().trim() !== req.name.toLowerCase().trim();

                return (
                  <div key={req.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-sm space-y-3.5 text-left">
                    {/* Header do Solicitante */}
                    <div className="flex items-start gap-3">
                      <img
                        src={req.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={req.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-400/40 shrink-0 mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                          <span>{req.name}</span>
                          {hasCustomName && (
                            <span className="text-[10px] font-normal text-gray-500 dark:text-slate-400">
                              (Google: {req.googleName})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 truncate">{req.email}</div>
                        <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Solicitado em: {req.requestedAt}
                        </div>
                      </div>
                    </div>

                    {/* Dados Acadêmicos Informados */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Dados Informados no Pedido:
                      </div>

                      <div className="flex flex-wrap gap-1.5 items-center">
                        {/* Turma */}
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${turmaInfo.badgeCls}`}>
                          <GraduationCap className="w-3 h-3 shrink-0" />
                          <span>{req.turmaNome || turmaInfo.label}</span>
                        </span>

                        {/* Período */}
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{req.periodoNome || (req.periodoNum ? `${req.periodoNum}º Período` : 'Período não informado')}</span>
                        </span>

                        {/* Perfil Pretendido */}
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 capitalize flex items-center gap-1">
                          <BookOpen className="w-3 h-3 shrink-0" />
                          <span>{req.perfilSolicitado ? `Perfil: ${req.perfilSolicitado}` : 'Aluno Regular'}</span>
                        </span>

                        {/* WhatsApp Direto */}
                        {req.whatsapp && (
                          <a
                            href={getWhatsAppUrl(cleanPhoneNumber(req.whatsapp), `Olá, *${req.name}*! Sou da coordenação do *Koinonia LMS*. Recebemos sua solicitação de autorização para o Semestre 2026.2.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition flex items-center gap-1"
                            title="Conversar no WhatsApp"
                          >
                            <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{formatPhone(req.whatsapp)}</span>
                          </a>
                        )}
                      </div>

                      {/* Observações do Solicitante */}
                      {req.observacao && (
                        <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 italic">
                          "{req.observacao}"
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleApprove(req, 'aluno')}
                        className="flex-1 py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
                        title={`Aprovar Aluno na ${turmaInfo.label}`}
                      >
                        <GraduationCap className="w-3.5 h-3.5" /> Aprovar Aluno
                      </button>
                      <button
                        onClick={() => handleApprove(req, 'professor')}
                        className="flex-1 py-2 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Aprovar como Docente / Professor"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Aprovar Professor
                      </button>
                      <button
                        onClick={() => handleApprove(req, 'monitor')}
                        className="py-2 px-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Aprovar como Monitor da Turma"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Monitor
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                        title="Rejeitar Solicitação"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO 2: LISTA DE E-MAILS AUTORIZADOS */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail, perfil ou WhatsApp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold text-gray-800 outline-none bg-transparent"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Usuário / E-mail</th>
                    <th className="p-3.5">Contato / WhatsApp</th>
                    <th className="p-3.5">Turma & Período</th>
                    <th className="p-3.5">Perfil Padrão</th>
                    <th className="p-3.5">Perfis Permitidos</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((u) => {
                    const normEmail = (u.email || '').toLowerCase().trim();
                    const initUser = INITIAL_AUTHORIZED_USERS[normEmail];
                    const effectiveWhatsapp = u.whatsapp || initUser?.whatsapp;
                    const cleanPhone = cleanPhoneNumber(effectiveWhatsapp);
                    const formattedPhone = formatPhone(effectiveWhatsapp);
                    const mailtoUrl = `mailto:${encodeURIComponent(u.email)}?subject=${encodeURIComponent('LMS Seminário UIECB')}`;

                    return (
                      <tr key={u.email} className="hover:bg-gray-50/60 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-gray-900">{u.name}</div>
                          <div className="text-gray-400 text-[11px]">{u.email}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            {cleanPhone ? (
                              <a
                                href={getWhatsAppUrl(effectiveWhatsapp)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200 transition"
                                title="Conversar no WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{formattedPhone}</span>
                              </a>
                            ) : (
                              <span className="text-gray-300 text-[10px] italic">Sem WhatsApp</span>
                            )}
                            <a
                              href={mailtoUrl}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                              title={`Enviar e-mail para ${u.email}`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[10px]">
                            {u.turmaIdx === 2 ? 'Turma B (3º Período)' : 'Turma A (7º Período)'}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize border ${
                            u.defaultRole === 'admin' 
                              ? 'bg-purple-100 text-purple-900 border-purple-200'
                              : u.defaultRole === 'professor'
                              ? 'bg-blue-100 text-blue-900 border-blue-200'
                              : u.defaultRole === 'monitor'
                              ? 'bg-amber-100 text-amber-900 border-amber-200'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                          }`}>
                            {u.defaultRole}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {u.roles.map((r) => (
                              <span key={r} className="px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded text-[10px] uppercase font-bold">
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setInviteModalUser(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-[11px] rounded-lg shadow-2xs transition active:scale-95 cursor-pointer"
                              title={`Enviar convite de acesso para ${u.name}`}
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Convidar</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                              title="Editar Perfil, Turma e Papéis"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {u.email !== 'sacrasub@gmail.com' && (
                              <button
                                onClick={() => handleRemoveUser(u.email)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Revogar Acesso"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO 3: DISCIPLINAS & DOCENTES */}
      {activeSubTab === 'disciplinas' && (
        <div className="space-y-4">
          {/* Seletor / Filtro por Turma */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setDiscTurmaFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                discTurmaFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Todas as Turmas</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-200 dark:bg-slate-800 font-extrabold">
                {disciplinasList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDiscTurmaFilter(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                discTurmaFilter === 1
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <span>Turma A (7º Período)</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 font-extrabold">
                {disciplinasList.filter((d) => d.turma_idx === 1).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDiscTurmaFilter(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                discTurmaFilter === 2
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              <span>Turma B (3º Período)</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 font-extrabold">
                {disciplinasList.filter((d) => d.turma_idx === 2).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDiscTurmaFilter(0)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                discTurmaFilter === 0
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <span>Fim de Semana (5º Período)</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-extrabold">
                {disciplinasList.filter((d) => d.turma_idx === 0).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDiscTurmaFilter(3)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                discTurmaFilter === 3
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <span>Curso Básico Teológico</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold">
                {disciplinasList.filter((d) => d.turma_idx === 3).length}
              </span>
            </button>
          </div>

          {/* Campo de Busca */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-800">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar matéria por nome, código, docente, dia ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold text-gray-800 dark:text-slate-200 outline-none bg-transparent"
            />
          </div>

          {/* Tabela de Disciplinas */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Disciplina / Código</th>
                    <th className="p-3.5">Turma Oficial</th>
                    <th className="p-3.5">Horário</th>
                    <th className="p-3.5">Docente Responsável</th>
                    <th className="p-3.5">E-mail do Professor</th>
                    <th className="p-3.5">Meet & Drive</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {filteredDisciplinas.map((d) => {
                    const badge = getTurmaBadgeInfo(d.turma_idx);

                    return (
                      <tr key={d.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-gray-900 dark:text-white">{d.name}</div>
                          <div className="text-gray-400 dark:text-slate-500 text-[10px] font-mono mt-0.5">
                            {d.code}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${badge.badgeCls}`}>
                            <GraduationCap className="w-3 h-3" />
                            <span>{badge.label}</span>
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded text-[10px] font-bold whitespace-nowrap">
                            {d.day_of_week} ({d.start_time} - {d.end_time})
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{d.professor_name}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            {d.professor_email || <span className="text-amber-600 dark:text-amber-400 font-bold">Não vinculado</span>}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            {d.google_meet_url ? (
                              <a
                                href={d.google_meet_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-600 dark:text-red-400 hover:text-red-700 p-1"
                                title="Link Google Meet"
                              >
                                <Video className="w-4 h-4" />
                              </a>
                            ) : (
                              <span className="text-gray-300 dark:text-slate-600 text-[10px]">—</span>
                            )}
                            {d.google_drive_url && (
                              <a
                                href={d.google_drive_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 p-1"
                                title="Pasta Google Drive"
                              >
                                <FolderOpen className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleOpenEditDisc(d)}
                            className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR E-MAIL AUTORIZADO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" /> Cadastrar Usuário
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 font-bold flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">E-mail da Conta Google (Obrigatório):</label>
                <input
                  type="email"
                  required
                  placeholder="aluno@gmail.com ou uicb.edu.br"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nome Completo (Opcional):</label>
                <input
                  type="text"
                  placeholder="Nome do Aluno / Professor"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Perfil Inicial:</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="aluno">🎓 Aluno</option>
                    <option value="professor">📚 Professor</option>
                    <option value="monitor">👑 Monitor</option>
                    <option value="admin">🛡️ Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Turma:</label>
                  <select
                    value={newTurma}
                    onChange={(e) => setNewTurma(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value={1}>Turma A (7º)</option>
                    <option value={2}>Turma B (3º)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp / Celular (Opcional):</label>
                <input
                  type="tel"
                  placeholder="(82) 99999-8888"
                  maxLength={15}
                  value={newWhatsapp}
                  onChange={(e) => setNewWhatsapp(formatPhone(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  Salvar E-mail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR USUÁRIO & PERFIS PERMITIDOS */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-600" /> Editar Perfil do Usuário
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 font-bold flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nome Completo:</label>
                <input
                  type="text"
                  required
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">E-mail Cadastrado:</label>
                <input
                  type="email"
                  disabled
                  value={editUserEmail}
                  className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Perfil Principal (Padrão):</label>
                  <select
                    value={editUserDefaultRole}
                    onChange={(e) => setEditUserDefaultRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="aluno">🎓 Aluno</option>
                    <option value="professor">📚 Professor</option>
                    <option value="monitor">👑 Monitor</option>
                    <option value="admin">🛡️ Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Turma Matriculada:</label>
                  <select
                    value={editUserTurma}
                    onChange={(e) => {
                      const t = Number(e.target.value);
                      setEditUserTurma(t);
                      setEditUserPeriodo(t === 2 ? 3 : 7);
                    }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value={1}>Turma A (7º Período)</option>
                    <option value={2}>Turma B (3º Período)</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes de Perfis Permitidos */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Perfis Permitidos (Para alternar na barra superior):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['aluno', 'professor', 'monitor', 'admin'] as UserRole[]).map((r) => {
                    const isChecked = editUserRoles.includes(r);
                    return (
                      <label
                        key={r}
                        onClick={() => handleToggleRole(r)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition ${
                          isChecked
                            ? 'bg-purple-50 border-purple-400 text-purple-950 shadow-2xs'
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <span className="capitalize">{r}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-purple-700" />}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp / Celular:</label>
                <input
                  type="tel"
                  placeholder="(82) 99999-8888"
                  maxLength={15}
                  value={editUserWhatsapp}
                  onChange={(e) => setEditUserWhatsapp(formatPhone(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL E-MAIL DE APROVAÇÃO & CONFIRMAÇÃO */}
      {approvalModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-lg text-gray-900">Acesso Aprovado com Sucesso!</h3>
                <p className="text-xs text-gray-500">Envie o e-mail de confirmação para {approvalModalData.name}.</p>
              </div>
              <button
                onClick={() => setApprovalModalData(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl space-y-2">
              <div className="text-xs font-bold text-gray-700">Assunto: <span className="text-gray-900 font-semibold">{approvalModalData.subject}</span></div>
              <div className="text-xs font-bold text-gray-700">Destinatário: <span className="text-blue-700 font-mono font-semibold">{approvalModalData.email}</span></div>
              <div className="pt-2 border-t border-gray-200">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Prévia da Mensagem:</label>
                <pre className="text-xs text-gray-800 whitespace-pre-wrap font-sans bg-white p-3 rounded-xl border border-gray-200 leading-relaxed max-h-48 overflow-y-auto">
                  {approvalModalData.body}
                </pre>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {/* Opção 1: Enviar direto pelo Gmail Web (100% garantido em PC e Celular) */}
              <a
                href={approvalModalData.gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Mail className="w-4 h-4" /> Abrir no Gmail (Web / Celular)
              </a>

              {/* Opção 2: Enviar pelo WhatsApp */}
              <a
                href={approvalModalData.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <MessageCircle className="w-4 h-4" /> Enviar Mensagem no WhatsApp
              </a>

              {/* Opção 3: Outros apps de e-mail nativos sem abrir aba em branco */}
              <button
                type="button"
                onClick={() => {
                  window.location.href = approvalModalData.mailtoUrl;
                }}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Abrir no App de E-mail Nativo (Outlook / Apple Mail)
              </button>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(approvalModalData.body);
                    setApprovalModalData({ ...approvalModalData, copied: true });
                    setTimeout(() => setApprovalModalData((prev) => prev ? { ...prev, copied: false } : null), 2500);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {approvalModalData.copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                  <span>{approvalModalData.copied ? 'Copiado para Área de Transferência!' : 'Copiar Texto da Mensagem'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setApprovalModalData(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR DISCIPLINA & ATRIBUIÇÃO DE DOCENTE */}
      {editingDisc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 border border-gray-200 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Atribuição de Disciplina: {editingDisc.name}
                </h3>
                <span className="text-[11px] text-gray-500 dark:text-slate-400">{editingDisc.code} • {editingDisc.day_of_week} ({editingDisc.start_time} - {editingDisc.end_time})</span>
              </div>
              <button
                onClick={() => setEditingDisc(null)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-bold flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDisc} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Turma da Disciplina:</label>
                <select
                  value={editTurmaIdx}
                  onChange={(e) => setEditTurmaIdx(Number(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value={1}>Turma A • 7º Período (Veteranos - Semanal Noturno)</option>
                  <option value={2}>Turma B • 3º Período (Ingressantes - Semanal Noturno)</option>
                  <option value={0}>Turma Fim de Semana • 5º Período (Modular)</option>
                  <option value={3}>Curso Básico Teológico</option>
                </select>
                <span className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 block">
                  Define a qual turma esta disciplina pertencerá na grade e no portal acadêmico dos alunos.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Nome do Docente Responsável:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Profº Ary Júnior"
                  value={editProfName}
                  onChange={(e) => setEditProfName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  E-mail do Professor (Para Login & Acesso Restrito):
                </label>
                <input
                  type="email"
                  placeholder="professor@uicb.edu.br ou gmail.com"
                  value={editProfEmail}
                  onChange={(e) => setEditProfEmail(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <span className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 block">
                  O professor logado com este e-mail terá acesso exclusivo para gerenciar esta matéria.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Link do Google Meet:</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={editMeetUrl}
                  onChange={(e) => setEditMeetUrl(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Link da Pasta no Google Drive:</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/open?id=..."
                  value={editDriveUrl}
                  onChange={(e) => setEditDriveUrl(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDisc(null)}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  Salvar Atribuição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ENVIO RÁPIDO DE CONVITE */}
      <InviteUserModal
        isOpen={!!inviteModalUser}
        onClose={() => setInviteModalUser(null)}
        user={inviteModalUser}
      />
    </div>
  );
};
