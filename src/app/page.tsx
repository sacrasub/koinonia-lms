'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { AlunoPanel } from '@/components/AlunoPanel';
import { ProfessorPanel } from '@/components/ProfessorPanel';
import { MonitorPanel } from '@/components/MonitorPanel';
import { AdminPanel } from '@/components/AdminPanel';
import { PendingAccessPage } from '@/components/PendingAccessPage';
import { BibliotecaPage } from '@/components/BibliotecaPage';
import { ChecklistAV2Page } from '@/components/ChecklistAV2Page';
import { PortalAcademicoPage } from '@/components/PortalAcademicoPage';
import { CadernoCornellPage } from '@/components/CadernoCornellPage';
import { EscalaMonitoriaPage } from '@/components/EscalaMonitoriaPage';
import { PastasVirtuaisPage } from '@/components/PastasVirtuaisPage';
import { DisciplinaDetailPage } from '@/components/DisciplinaDetailPage';
import { CentralAjudaPage } from '@/components/CentralAjudaPage';
import { AulaRecorderModal } from '@/components/AulaRecorderModal';
import { GlobalWalkthrough } from '@/components/GlobalWalkthrough';
import RPGPastoralSimulador from '@/components/RPGPastoralSimulador';
import PortfolioMediador from '@/components/PortfolioMediador';
import SeletorMetacognitivoAvaliacao from '@/components/SeletorMetacognitivoAvaliacao';
import { getAllDisciplinas } from '@/services/disciplinasService';
import { GraduationCap, Library, CheckSquare, FolderOpen, Compass, RefreshCw, BookOpen, Activity } from 'lucide-react';
import { getAuthorizedUserInfo, parseJwtEmailAndUser, syncRbacFromCloud } from '@/lib/authConfig';
import { supabase, signOut as supabaseSignOut } from '@/lib/supabaseClient';
import { onSessionRestored, cleanupBulkyLocalStorage } from '@/services/studentSyncService';
import { startUserSession, endCurrentSession, trackEvent } from '@/services/telemetryService';
import { AdminAnalyticsView } from '@/components/AdminAnalyticsView';
import { TCCSurveyModal } from '@/components/TCCSurveyModal';
import { ForumColaborativo } from '@/components/ForumColaborativo';
import { PresencaChat } from '@/components/PresencaChat';
import { MuralKoinonia } from '@/components/MuralKoinonia';
import { TeleProximidadeDashboard } from '@/components/TeleProximidadeDashboard';
import { QuatrodsDsPage } from '@/components/QuatrodsDsPage';
import { HomileticaEstudioPage } from '@/components/HomileticaEstudioPage';
import { MetaversoTeologicoPage } from '@/components/MetaversoTeologicoPage';
import { TccSacramentoPage } from '@/components/TccSacramentoPage';
import { FluxoEstudosPage } from '@/components/FluxoEstudosPage';
import { GoogleAgendaView } from '@/components/GoogleAgendaView';
import { PlanoEstudosPage } from '@/components/PlanoEstudosPage';
import { LiveAulaGlobalBanner } from '@/components/LiveAulaGlobalBanner';
import { AttendanceAlarmModal } from '@/components/AttendanceAlarmModal';
import PesquisaTCCPage from '@/app/pesquisa-tcc/page';
import { OficinaEstudosHub } from '@/components/oficina-estudos/OficinaEstudosHub';

export default function Home() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [currentRole, setCurrentRole] = useState<UserRole>('aluno');
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('lms_active_tab');
      if (savedTab) return savedTab;
    }
    return 'aluno-disciplinas';
  });
  const [loadingSession, setLoadingSession] = useState<boolean>(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  // Pull-to-refresh em dispositivos móveis / iOS PWA
  const [pulling, setPulling] = useState<boolean>(false);
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const touchStartY = React.useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY;
      } else {
        touchStartY.current = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current > 0 && window.scrollY === 0) {
        const distance = e.touches[0].clientY - touchStartY.current;
        if (distance > 0) {
          setPulling(true);
          setPullDistance(Math.min(distance * 0.4, 70));
        }
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > 50) {
        setRefreshing(true);
        if (userEmail) {
          syncRbacFromCloud(true).then(() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('lms_student_sync_updated', { detail: { email: userEmail } }));
              window.dispatchEvent(new CustomEvent('lms_rbac_updated'));
            }
            setTimeout(() => {
              setRefreshing(false);
              setPulling(false);
              setPullDistance(0);
            }, 800);
          }).catch(() => {
            setRefreshing(false);
            setPulling(false);
            setPullDistance(0);
          });
        } else {
          setRefreshing(false);
          setPulling(false);
          setPullDistance(0);
        }
      } else {
        setPulling(false);
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [userEmail, pullDistance]);

  useEffect(() => {
    let isSubscribed = true;

    async function initAuth() {
      // 1. Tenta recuperar sessão persistida localmente (Zero Latência)
      let storedEmail: string | null = null;
      if (typeof window !== 'undefined') {
        storedEmail = localStorage.getItem('lms_active_user_email');
      }

      if (storedEmail) {
        const authInfo = getAuthorizedUserInfo(storedEmail);
        if (authInfo.isAuthorized && authInfo.user) {
          setUserEmail(storedEmail);
          setUserName(authInfo.user.name);
          setUserAvatar(authInfo.user.avatarUrl || '');
          setIsAuthorized(true);
          const storedRole = typeof window !== 'undefined' ? (localStorage.getItem('lms_active_user_role') as UserRole) : null;
          const initialRole = storedRole && authInfo.user.roles.includes(storedRole) ? storedRole : authInfo.user.defaultRole;
          setCurrentRole(initialRole);
          if (initialRole === 'professor') setActiveTab('prof-disciplinas');
          else if (initialRole === 'monitor') setActiveTab('monitor-escala');
          else setActiveTab('aluno-disciplinas');
        }
      }

      // Sincroniza RBAC global da nuvem em background
      syncRbacFromCloud().catch(() => {});

      // 2. Verifica se o Supabase tem uma sessão ativa real
      const { data: { session } } = await supabase.auth.getSession();

      // 3. Fallback: Se não houver session mas houver hash com token no redirect do Google OAuth
      let fallbackEmail: string | null = null;
      if (!session && typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        const parsed = parseJwtEmailAndUser(window.location.hash);
        if (parsed && parsed.email) fallbackEmail = parsed.email;
      }

      const email = session?.user?.email || fallbackEmail || storedEmail;

      if (!email) {
        setLoadingSession(false);
        router.push('/login');
        return;
      }

      if (isSubscribed) {
        const name = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || email;
        const avatar = session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture || '';

        if (typeof window !== 'undefined') {
          localStorage.setItem('lms_active_user_email', email);
        }

        const authInfo = getAuthorizedUserInfo(email);
        setUserEmail(email);
        setUserName(name);
        setUserAvatar(avatar);

        if (authInfo.isAuthorized && authInfo.user) {
          setIsAuthorized(true);
          const storedRole = typeof window !== 'undefined' ? (localStorage.getItem('lms_active_user_role') as UserRole) : null;
          const initialRole = storedRole && authInfo.user.roles.includes(storedRole) ? storedRole : authInfo.user.defaultRole;
          setCurrentRole(initialRole);
          if (initialRole === 'professor') setActiveTab('prof-disciplinas');
          else if (initialRole === 'monitor') setActiveTab('monitor-escala');
          else setActiveTab('aluno-disciplinas');

          // Rastreia início da sessão de usuário autorizado
          startUserSession(email, name, initialRole, avatar);
        } else {
          setIsAuthorized(false);
          // Rastreia início de sessão de usuário visitante / aguardando autorização
          startUserSession(email, name, 'aluno', avatar);
        }
        setLoadingSession(false);

        // Sincroniza RBAC global da nuvem em background e revalida autorização reativa
        syncRbacFromCloud().then(() => {
          if (isSubscribed && email) {
            const freshAuth = getAuthorizedUserInfo(email);
            if (freshAuth.isAuthorized && freshAuth.user) {
              setIsAuthorized(true);
              const storedRole = typeof window !== 'undefined' ? (localStorage.getItem('lms_active_user_role') as UserRole) : null;
              const role = storedRole && freshAuth.user.roles.includes(storedRole) ? storedRole : freshAuth.user.defaultRole;
              setCurrentRole(role);
            }
          }
        }).catch(() => {});
      }
    }

    initAuth();

    const handleRbacUpdate = () => {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('lms_active_user_email') : null;
      if (stored && isSubscribed) {
        const fresh = getAuthorizedUserInfo(stored);
        if (fresh.isAuthorized && fresh.user) {
          setIsAuthorized(true);
        }
      }
    };
    window.addEventListener('lms_rbac_updated', handleRbacUpdate);

    // 5. Listener de estado de autenticação do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email && isSubscribed) {
        const email = session.user.email;
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email;
        const avatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '';

        if (typeof window !== 'undefined') {
          localStorage.setItem('lms_active_user_email', email);
        }

        const authInfo = getAuthorizedUserInfo(email);
        setUserEmail(email);
        setUserName(name);
        setUserAvatar(avatar);

        if (authInfo.isAuthorized && authInfo.user) {
          setIsAuthorized(true);
          const storedRole = typeof window !== 'undefined' ? (localStorage.getItem('lms_active_user_role') as UserRole) : null;
          const initialRole = storedRole && authInfo.user.roles.includes(storedRole) ? storedRole : authInfo.user.defaultRole;
          setCurrentRole(initialRole);

          // Rastreia sessão ativa
          startUserSession(email, name, initialRole, avatar);
        } else {
          setIsAuthorized(false);
          startUserSession(email, name, 'aluno', avatar);
        }
        setLoadingSession(false);

        // CORREÇÃO CELULAR: Quando a sessão é restaurada (após redirect OAuth),
        // drena upserts pendentes e notifica componentes de sync para re-buscar dados.
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          onSessionRestored(email);
        }
      }
    });

    return () => {
      isSubscribed = false;
      window.removeEventListener('lms_rbac_updated', handleRbacUpdate);
      subscription.unsubscribe();
    };
  }, [router]);

  // Limpeza preventiva de cota de armazenamento no mount
  useEffect(() => {
    cleanupBulkyLocalStorage();
  }, []);

  const handleTabChange = useCallback((newTab: string) => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lms_active_tab', newTab);
      } catch (e) {
        cleanupBulkyLocalStorage();
        try {
          localStorage.setItem('lms_active_tab', newTab);
        } catch (_) {}
      }
    }
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lms_active_user_role', newRole);
    }
    switch (newRole) {
      case 'aluno':
        handleTabChange('aluno-disciplinas');
        break;
      case 'professor':
        handleTabChange('prof-disciplinas');
        break;
      case 'monitor':
        handleTabChange('monitor-escala');
        break;
      case 'admin':
        handleTabChange('admin-dashboard');
        break;
    }
  };

  const handleLogout = async () => {
    endCurrentSession();
    try {
      await supabaseSignOut();
    } catch (e) {
      console.warn('Erro ao sair do Supabase:', e);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lms_active_user_email');
      localStorage.removeItem('lms_active_user_role');
      localStorage.removeItem('lms_active_tab');
    }
    router.push('/login');
  };


  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<string>('disc-1');
  const [globalRecorder, setGlobalRecorder] = useState<{
    isOpen: boolean;
    disciplinaId?: string;
    aulaNum?: number;
    initialMode?: 'screen' | 'file' | 'link' | 'autopilot';
  }>({ isOpen: false });

  useEffect(() => {
    const handleTabEvent = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const targetTab = typeof customEvent.detail === 'string' 
        ? customEvent.detail 
        : (customEvent.detail?.tab || customEvent.detail?.tabId);
      if (targetTab) {
        handleTabChange(targetTab);
      }
    };

    const handleOpenDisciplinaEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ disciplinaId: string; subTab?: string } | string>;
      if (customEvent.detail) {
        const id = typeof customEvent.detail === 'string' ? customEvent.detail : customEvent.detail.disciplinaId;
        if (typeof customEvent.detail === 'object' && customEvent.detail.subTab) {
          try {
            localStorage.setItem('lms_pending_disciplina_subtab', customEvent.detail.subTab);
          } catch (err) {}
        }
        if (id) {
          setSelectedDisciplinaId(id);
          handleTabChange('disciplina-detalhe');
        }
      }
    };

    const handleOpenRecorderEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ disciplinaId?: string; disciplina?: string; aulaNum?: number; aulaNumero?: string; initialMode?: 'screen' | 'file' | 'link' | 'autopilot' } | undefined>;
      const detail = customEvent.detail;
      let targetId = detail?.disciplinaId;
      if (!targetId && detail?.disciplina) {
        const allDiscs = getAllDisciplinas();
        const norm = detail.disciplina.toLowerCase().replace(/[^a-z0-9]/g, '');
        const found = allDiscs.find((d) => {
          const dNorm = d.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          return dNorm.includes(norm) || norm.includes(dNorm);
        });
        if (found) targetId = found.id;
      }
      const num = detail?.aulaNum || (detail?.aulaNumero ? Number(detail.aulaNumero) : 1);

      // Se o usuário estiver em perfil de aluno mas tiver permissão de monitor/admin, eleva para monitor
      if (currentRole === 'aluno') {
        const isSacramento = userEmail.includes('sacrasub') || userEmail.includes('riffocristianmision');
        const auth = getAuthorizedUserInfo(userEmail);
        const canElevate = isSacramento || auth.user?.roles.some(r => ['admin', 'monitor', 'professor'].includes(r));
        if (canElevate) {
          setCurrentRole('monitor');
        }
      }

      setGlobalRecorder({
        isOpen: true,
        disciplinaId: targetId,
        aulaNum: num,
        initialMode: detail?.initialMode || 'autopilot',
      });
    };

    window.addEventListener('lms_change_tab', handleTabEvent);
    window.addEventListener('lms_open_disciplina_detail', handleOpenDisciplinaEvent);
    window.addEventListener('lms_open_recorder', handleOpenRecorderEvent);

    return () => {
      window.removeEventListener('lms_change_tab', handleTabEvent);
      window.removeEventListener('lms_open_disciplina_detail', handleOpenDisciplinaEvent);
      window.removeEventListener('lms_open_recorder', handleOpenRecorderEvent);
    };
  }, [handleTabChange, currentRole, userEmail]);

  const renderContent = () => {
    if (activeTab === 'disciplina-detalhe') {
      return (
        <DisciplinaDetailPage
          disciplinaId={selectedDisciplinaId}
          userEmail={userEmail}
          currentRole={currentRole}
          onBack={() => handleTabChange(currentRole === 'professor' ? 'prof-disciplinas' : 'aluno-disciplinas')}
          onTabChange={handleTabChange}
        />
      );
    }
    if (activeTab === 'monitor-escala' || activeTab === 'monitor-presenca') {
      return <EscalaMonitoriaPage userEmail={userEmail} currentRole={currentRole} onTabChange={handleTabChange} />;
    }
    if (activeTab === 'aluno-portal-2026') {
      return <PortalAcademicoPage userEmail={userEmail} currentRole={currentRole} onTabChange={handleTabChange} />;
    }
    if (activeTab === 'aluno-caderno' || activeTab === 'caderno' || activeTab === 'aluno-anotacoes' || activeTab === 'anotacoes' || activeTab === 'cornell') {
      return <CadernoCornellPage userEmail={userEmail} />;
    }
    if (activeTab === 'aluno-biblioteca' || activeTab === 'biblioteca') {
      return <BibliotecaPage userEmail={userEmail} currentRole={currentRole} />;
    }
    if (activeTab === 'aluno-checklist' || activeTab === 'checklist') {
      return <ChecklistAV2Page userEmail={userEmail} />;
    }
    if (activeTab === 'aluno-materiais' || activeTab === 'prof-materiais' || activeTab === 'admin-materiais' || activeTab === 'materiais') {
      return <PastasVirtuaisPage userEmail={userEmail} currentRole={currentRole} onTabChange={handleTabChange} />;
    }
    if (activeTab === 'central-ajuda' || activeTab === 'ajuda' || activeTab === 'tutoriais') {
      return <CentralAjudaPage userEmail={userEmail} currentRole={currentRole} onTabChange={handleTabChange} />;
    }
    if (activeTab === 'rpg-simulador' || activeTab === 'rpg') {
      return <RPGPastoralSimulador userEmail={userEmail} userName={userName} userRole={currentRole} />;
    }
    if (activeTab === 'portfolio' || activeTab === 'meu-portfolio' || activeTab === 'portfolios') {
      return <PortfolioMediador userEmail={userEmail} userName={userName} userRole={currentRole} />;
    }
    if (activeTab === 'comunidade-forum' || activeTab === 'forum' || activeTab === 'koinonia') {
      return <ForumColaborativo userEmail={userEmail} userName={userName} currentRole={currentRole} />;
    }
    if (activeTab === 'mural-oracao' || activeTab === 'oracao') {
      return <MuralKoinonia userEmail={userEmail} userName={userName} currentUserRole={currentRole} />;
    }
    if (activeTab === 'tele-proximidade' || activeTab === 'radar-tsp') {
      return (
        <div className="bg-white rounded-3xl border border-violet-100 shadow-sm p-6">
          <TeleProximidadeDashboard userEmail={userEmail} currentRole={currentRole} />
        </div>
      );
    }
    if (activeTab === 'quatro-ds' || activeTab === '4ds' || activeTab === 'quatro_ds') {
      return (
        <div className="bg-white rounded-3xl border border-orange-100 shadow-sm p-6">
          <QuatrodsDsPage userEmail={userEmail} userName={userName} currentRole={currentRole} />
        </div>
      );
    }
    if (activeTab === 'homiletica' || activeTab === 'estudio-homiletica' || activeTab === 'peer-instruction') {
      return (
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6">
          <HomileticaEstudioPage userEmail={userEmail} userName={userName} currentRole={currentRole} />
        </div>
      );
    }
    if (activeTab === 'metaverso' || activeTab === 'imersao-3d' || activeTab === 'cenarios-3d') {
      return (
        <div className="bg-white rounded-3xl border border-cyan-100 shadow-sm p-6">
          <MetaversoTeologicoPage userEmail={userEmail} userName={userName} currentRole={currentRole} />
        </div>
      );
    }
    if (activeTab === 'seletor-avaliacao' || activeTab === 'trilha-avaliacao') {
      return <SeletorMetacognitivoAvaliacao userEmail={userEmail} userName={userName} userRole={currentRole} />;
    }

    // Rotas Dedicadas do Painel do Administrador (Elimina redundância)
    if (activeTab === 'admin-usuarios' || activeTab === 'usuarios') {
      return (
        <AdminPanel 
          initialSubTab="users" 
          onSubTabChange={(sub) => {
            if (sub === 'users') handleTabChange('admin-usuarios');
            else if (sub === 'disciplinas') handleTabChange('admin-disciplinas');
            else if (sub === 'requests') handleTabChange('admin-solicitacoes');
            else handleTabChange('admin-dashboard');
          }} 
        />
      );
    }
    if (activeTab === 'admin-disciplinas' || activeTab === 'disciplinas') {
      return (
        <AdminPanel 
          initialSubTab="disciplinas" 
          onSubTabChange={(sub) => {
            if (sub === 'users') handleTabChange('admin-usuarios');
            else if (sub === 'disciplinas') handleTabChange('admin-disciplinas');
            else if (sub === 'requests') handleTabChange('admin-solicitacoes');
            else handleTabChange('admin-dashboard');
          }} 
        />
      );
    }
    if (activeTab === 'admin-solicitacoes' || activeTab === 'solicitacoes') {
      return (
        <AdminPanel 
          initialSubTab="requests" 
          onSubTabChange={(sub) => {
            if (sub === 'users') handleTabChange('admin-usuarios');
            else if (sub === 'disciplinas') handleTabChange('admin-disciplinas');
            else if (sub === 'requests') handleTabChange('admin-solicitacoes');
            else handleTabChange('admin-dashboard');
          }} 
        />
      );
    }
    if (activeTab === 'admin-tcc' || activeTab === 'tcc') {
      return (
        <AdminPanel 
          initialSubTab="tcc" 
          onSubTabChange={(sub) => {
            if (sub === 'tcc') handleTabChange('admin-tcc');
            else if (sub === 'users') handleTabChange('admin-usuarios');
            else if (sub === 'disciplinas') handleTabChange('admin-disciplinas');
            else if (sub === 'requests') handleTabChange('admin-solicitacoes');
            else handleTabChange('admin-dashboard');
          }} 
        />
      );
    }
    if (activeTab === 'google-agenda' || activeTab === 'agenda' || activeTab === 'grade-horaria') {
      return <GoogleAgendaView userEmail={userEmail} onTabChange={handleTabChange} currentRole={currentRole} />;
    }

    if (activeTab === 'fluxo-estudos' || activeTab === 'estudos' || activeTab === 'ecossistema') {
      return <FluxoEstudosPage userEmail={userEmail} onTabChange={handleTabChange} currentRole={currentRole} />;
    }

    if (activeTab === 'plano-estudos' || activeTab === 'plano-2026' || activeTab === 'cronograma-semestre') {
      return (
        <div className="bg-white rounded-3xl border border-amber-100 shadow-sm p-4 sm:p-6">
          <PlanoEstudosPage userEmail={userEmail} currentRole={currentRole} onTabChange={handleTabChange} />
        </div>
      );
    }

    if (activeTab === 'tcc-sacramento' || activeTab === 'tcc-painel') {
      return <TccSacramentoPage onTabChange={handleTabChange} />;
    }

    if (activeTab === 'oficina-estudos' || activeTab === 'laboratorio-tcc' || activeTab === 'trilha-estudos' || activeTab === 'oficina-tcc' || activeTab === 'imersao-tcc') {
      return <OficinaEstudosHub userEmail={userEmail} onTabChange={handleTabChange} />;
    }

    if (activeTab === 'pesquisa-tcc') {
      return (
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-indigo-900/40">
          <PesquisaTCCPage />
        </div>
      );
    }

    if (activeTab === 'admin-dashboard' || activeTab === 'admin-analytics' || activeTab === 'telemetria' || activeTab === 'analytics') {
      return (
        <AdminPanel 
          initialSubTab="analytics" 
          onSubTabChange={(sub) => {
            if (sub === 'tcc') handleTabChange('admin-tcc');
            else if (sub === 'users') handleTabChange('admin-usuarios');
            else if (sub === 'disciplinas') handleTabChange('admin-disciplinas');
            else if (sub === 'requests') handleTabChange('admin-solicitacoes');
            else handleTabChange('admin-dashboard');
          }} 
        />
      );
    }

    switch (currentRole) {
      case 'aluno':
        return <AlunoPanel userEmail={userEmail} onTabChange={handleTabChange} />;
      case 'professor':
        return <ProfessorPanel userEmail={userEmail} currentRole={currentRole} onTabChange={handleTabChange} />;
      case 'monitor':
        return <MonitorPanel userEmail={userEmail} onTabChange={handleTabChange} />;
      case 'admin':
        return (
          <AdminPanel 
            initialSubTab="analytics" 
            onSubTabChange={(sub) => {
              if (sub === 'users') handleTabChange('admin-usuarios');
              else if (sub === 'disciplinas') handleTabChange('admin-disciplinas');
              else if (sub === 'requests') handleTabChange('admin-solicitacoes');
              else handleTabChange('admin-dashboard');
            }} 
          />
        );
      default:
        return <AlunoPanel userEmail={userEmail} onTabChange={handleTabChange} />;
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#090d16] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 animate-pulse flex items-center justify-center text-white text-2xl font-bold mx-auto">
            ✝
          </div>
          <p className="text-xs font-bold text-gray-500">Validando autenticação e permissões de acesso...</p>
        </div>
      </div>
    );
  }

  // Se logado no Google mas NÃO AUTORIZADO -> Exibe Tela de Solicitação de Acesso
  if (!isAuthorized && userEmail) {
    return (
      <PendingAccessPage
        userEmail={userEmail}
        userName={userName}
        userAvatar={userAvatar}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#090d16] text-gray-900 dark:text-slate-100 flex flex-col pb-20 md:pb-0 transition-colors duration-200">
      <Navbar 
        currentRole={currentRole} 
        userEmail={userEmail}
        activeTab={activeTab}
        onRoleChange={handleRoleChange} 
        onLogout={handleLogout}
        onTabChange={handleTabChange}
        onProfileUpdated={() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lms_student_sync_updated', { detail: { email: userEmail } }));
          }
        }}
      />

      {/* Indicador de Pull-to-Refresh para iOS PWA / Mobile */}
      {(pulling || refreshing) && (
        <div 
          className="w-full flex items-center justify-center transition-all overflow-hidden bg-blue-50/90 border-b border-blue-200"
          style={{ height: refreshing ? '44px' : `${pullDistance}px` }}
        >
          <div className="flex items-center gap-2 text-blue-700 text-xs font-bold py-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Atualizando dados da nuvem...' : pullDistance > 45 ? 'Solte para atualizar' : 'Puxe para atualizar'}</span>
          </div>
        </div>
      )}
      
      <div className="flex flex-1">
        <Sidebar currentRole={currentRole} activeTab={activeTab} onTabChange={handleTabChange} userEmail={userEmail} />
        
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* Card de Aula Ao Vivo Global — visível para Alunos, Monitores e Professores (exceto na tela principal de cada perfil) */}
          {(currentRole === 'aluno' && activeTab !== 'aluno-disciplinas') ||
           (currentRole === 'monitor' && activeTab !== 'monitor-escala') ||
           (currentRole === 'professor' && activeTab !== 'prof-disciplinas') ? (
            <LiveAulaGlobalBanner 
              userEmail={userEmail} 
              onTabChange={handleTabChange} 
            />
          ) : null}
          {renderContent()}
        </main>
      </div>

      {/* Barra de Navegação Inferior Nativa — Role-Aware para Smartphones */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200/80 dark:border-slate-700/80 px-1 py-1.5 flex justify-around items-center shadow-lg">
        {/* === TABS DO ALUNO === */}
        {currentRole === 'aluno' && (
          <>
            <button
              data-tour="nav-disciplinas"
              onClick={() => handleTabChange('aluno-disciplinas')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'aluno-disciplinas' ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span>Disciplinas</span>
            </button>
            <button
              onClick={() => handleTabChange('aluno-caderno')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'aluno-caderno' ? 'text-amber-600 bg-amber-50/80 dark:text-amber-400 dark:bg-amber-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Caderno</span>
            </button>
            <button
              data-tour="nav-biblioteca"
              onClick={() => handleTabChange('aluno-biblioteca')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'aluno-biblioteca' ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <Library className="w-5 h-5" />
              <span>Biblioteca</span>
            </button>
            <button
              onClick={() => handleTabChange('aluno-checklist')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'aluno-checklist' ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <CheckSquare className="w-5 h-5" />
              <span>Checklist</span>
            </button>
            <button
              onClick={() => handleTabChange('aluno-materiais')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'aluno-materiais' ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <FolderOpen className="w-5 h-5" />
              <span>Pastas</span>
            </button>
          </>
        )}

        {/* === TABS DO PROFESSOR === */}
        {currentRole === 'professor' && (
          <>
            <button
              onClick={() => handleTabChange('prof-disciplinas')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'prof-disciplinas' ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Matérias</span>
            </button>
            <button
              onClick={() => handleTabChange('disciplina-detalhe')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'disciplina-detalhe' ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span>Hub Disc.</span>
            </button>
            <button
              onClick={() => handleTabChange('aluno-materiais')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'aluno-materiais' ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <FolderOpen className="w-5 h-5" />
              <span>Pastas</span>
            </button>
            <button
              onClick={() => handleTabChange('google-agenda')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'google-agenda' ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span>Agenda</span>
            </button>
            <button
              onClick={() => handleTabChange('central-ajuda')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'central-ajuda' ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span>Ajuda</span>
            </button>
          </>
        )}

        {/* === TABS DO MONITOR === */}
        {currentRole === 'monitor' && (
          <>
            <button
              onClick={() => handleTabChange('monitor-escala')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'monitor-escala' ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span>Escala</span>
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('lms_open_recorder', { detail: { initialMode: 'autopilot' } }))}
              className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-gray-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50/80"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Gravar</span>
            </button>
            <button
              onClick={() => handleTabChange('aluno-materiais')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'aluno-materiais' ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <FolderOpen className="w-5 h-5" />
              <span>Pastas</span>
            </button>
            <button
              onClick={() => handleTabChange('comunidade-forum')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'comunidade-forum' ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <CheckSquare className="w-5 h-5" />
              <span>Fórum</span>
            </button>
            <button
              onClick={() => handleTabChange('google-agenda')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'google-agenda' ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span>Agenda</span>
            </button>
          </>
        )}

        {/* === TABS DO ADMIN === */}
        {currentRole === 'admin' && (
          <>
            <button
              onClick={() => handleTabChange('admin-dashboard')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab.startsWith('admin-') ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => handleTabChange('admin-usuarios')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'admin-usuarios' ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Usuários</span>
            </button>
            <button
              onClick={() => handleTabChange('admin-disciplinas')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'admin-disciplinas' ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span>Matérias</span>
            </button>
            <button
              onClick={() => handleTabChange('admin-solicitacoes')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'admin-solicitacoes' ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <CheckSquare className="w-5 h-5" />
              <span>Pedidos</span>
            </button>
            <button
              onClick={() => handleTabChange('monitor-escala')}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'monitor-escala' ? 'text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span>Monitoria</span>
            </button>
          </>
        )}
      </div>

      {/* COORDENADOR GLOBAL DE ONBOARDING MULTI-PÁGINAS COM DRIVER.JS */}
      <GlobalWalkthrough 
        userEmail={userEmail} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        currentRole={currentRole}
      />

      {/* SUÍTE DE COMUNICAÇÃO: PRESENÇA SOCIAL (🟢) E CHAT PRIVADO DM */}
      <PresencaChat 
        currentUserEmail={userEmail} 
        currentUserName={userName} 
        currentUserRole={currentRole} 
      />

      {/* MODAL E BANNER DE PESQUISA CIENTÍFICA DO TCC (ALUNOS E PROFESSORES) */}
      <TCCSurveyModal currentRole={currentRole} userEmail={userEmail} />

      {/* ALARME SONORO E VISUAL DA LISTA DE PRESENÇA AOS 50% DA AULA */}
      <AttendanceAlarmModal 
        userEmail={userEmail} 
        currentRole={currentRole} 
      />

      {/* GRAVADOR GLOBAL DE AULAS COM SUPORTE A MINIMIZAÇÃO (PICTURE-IN-PICTURE) */}
      <AulaRecorderModal
        isOpen={globalRecorder.isOpen}
        onClose={() => setGlobalRecorder((prev) => ({ ...prev, isOpen: false }))}
        defaultDisciplinaId={globalRecorder.disciplinaId}
        defaultAulaNum={globalRecorder.aulaNum}
        initialMode={globalRecorder.initialMode}
        userEmail={userEmail}
        currentRole={currentRole}
        onRecordingSaved={() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lms_gravacoes_updated'));
          }
        }}
      />
    </div>
  );
}
