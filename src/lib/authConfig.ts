import { UserRole } from '@/types';
import { supabase } from '@/lib/supabaseClient';

export interface UserRoleMapping {
  email: string;
  name: string;
  roles: UserRole[];
  defaultRole: UserRole;
  avatarUrl?: string;
  addedAt?: string;
  turmaIdx?: number;
  periodoNum?: number;
  whatsapp?: string;
}

export interface AccessRequest {
  id: string;
  email: string;
  name: string;
  googleName?: string;
  avatarUrl?: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  whatsapp?: string;
  turmaIdx?: number;
  turmaNome?: string;
  periodoNum?: number;
  periodoNome?: string;
  perfilSolicitado?: 'aluno' | 'professor' | 'monitor' | 'ouvinte';
  observacao?: string;
}

export interface RequestAccessPayload {
  email: string;
  name?: string;
  googleName?: string;
  avatarUrl?: string;
  whatsapp?: string;
  turmaIdx?: number;
  turmaNome?: string;
  periodoNum?: number;
  periodoNome?: string;
  perfilSolicitado?: 'aluno' | 'professor' | 'monitor' | 'ouvinte';
  observacao?: string;
}


// Lista inicial de emergência (Superadministrador e contingência offline)
// Todos os demais alunos e professores são carregados dinamicamente da nuvem (Supabase / users / RBAC)
export const INITIAL_AUTHORIZED_USERS: Record<string, UserRoleMapping> = {
  // Criador & Administradores Principais (acesso total a todos os perfis)
  'sacrasub@gmail.com': {
    email: 'sacrasub@gmail.com',
    name: 'Cristiano Sacramento (Admin/Criador)',
    roles: ['admin', 'aluno', 'monitor', 'professor'],
    defaultRole: 'admin',
    avatarUrl: '/cristiano_sacramento.jpg',
  },
  'sacrasub03@gmail.com': {
    email: 'sacrasub03@gmail.com',
    name: 'Cristiano Sacramento (Aluno Turma A / Admin)',
    roles: ['admin', 'aluno', 'monitor', 'professor'],
    defaultRole: 'admin',
    turmaIdx: 1,
    periodoNum: 7,
    avatarUrl: '/cristiano_sacramento.jpg',
  },
  'riffocristianmision@gmail.com': {
    email: 'riffocristianmision@gmail.com',
    name: 'Pr. Cristian Riffo (Reitor)',
    roles: ['professor', 'admin', 'aluno'],
    defaultRole: 'professor',
  },
};

/**
 * Decodifica o payload de um token JWT (Supabase access_token) para extrair e-mail, nome e foto
 */
export function parseJwtEmailAndUser(token: string): { email?: string; name?: string; avatar?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    const email = parsed.email || parsed.user_metadata?.email;
    const name = parsed.user_metadata?.full_name || parsed.user_metadata?.name || parsed.name || email;
    const avatar = parsed.user_metadata?.avatar_url || parsed.user_metadata?.picture || parsed.picture || '';
    return { email, name, avatar };
  } catch (e) {
    console.error('Erro ao decodificar token JWT:', e);
    return null;
  }
}

const RBAC_LAST_FETCH_KEY = 'lms_rbac_last_fetch_ts';
const RBAC_CACHE_TTL_MS = 60 * 1000; // 1 minuto de cache inteligente para refletir novos usuários rapidamente

/**
 * Busca da nuvem (Supabase) as permissões personalizadas e solicitações pendentes
 * para garantir que qualquer e-mail adicionado por um admin em outro PC/navegador
 * seja reconhecido instantaneamente por todos os dispositivos.
 */
export async function syncRbacFromCloud(force: boolean = false): Promise<void> {
  if (typeof window === 'undefined') return;

  const lastFetch = Number(localStorage.getItem(RBAC_LAST_FETCH_KEY) || 0);
  const now = Date.now();
  if (!force && now - lastFetch < RBAC_CACHE_TTL_MS) {
    return;
  }

  try {
    localStorage.setItem(RBAC_LAST_FETCH_KEY, String(Date.now()));

    // 0. Sincroniza lista de usuários revogados/excluídos na nuvem
    try {
      const { data: revData } = await supabase
        .from('materiais')
        .select('file_url')
        .eq('title', 'system_rbac_revoked_users')
        .limit(1);

      if (revData && revData.length > 0 && revData[0].file_url) {
        const cloudRevoked: string[] = JSON.parse(revData[0].file_url);
        if (Array.isArray(cloudRevoked)) {
          const localRevoked = getRevokedUsersList();
          const mergedRevoked = Array.from(new Set([...localRevoked, ...cloudRevoked.map((e) => String(e).toLowerCase().trim())]));
          localStorage.setItem(REVOKED_USERS_KEY, JSON.stringify(mergedRevoked));
        }
      }
    } catch (_) {}

    const activeRevokedSet = new Set(getRevokedUsersList());

    // 1. Busca lista de usuários autorizados na nuvem
    const { data: usersData } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', 'system_rbac_users')
      .limit(1);

    const local = getAuthorizedUsersList();
    const mergedUsers: Record<string, UserRoleMapping> = { ...INITIAL_AUTHORIZED_USERS, ...local };

    if (usersData && usersData.length > 0 && usersData[0].file_url) {
      try {
        const parsed: Record<string, UserRoleMapping> = JSON.parse(usersData[0].file_url);
        for (const [key, user] of Object.entries(parsed)) {
          const normKey = key.toLowerCase().trim();
          if (activeRevokedSet.has(normKey)) continue;
          mergedUsers[normKey] = {
            ...(mergedUsers[normKey] || {}),
            ...user,
          };
        }
      } catch (e) {}
    }

    // 1.1 Também busca registros novos da tabela oficial 'users' do Supabase
    try {
      const { data: dbUsers } = await supabase
        .from('users')
        .select('email, full_name, role, avatar_url');

      if (dbUsers && dbUsers.length > 0) {
        dbUsers.forEach((u) => {
          if (u.email && !activeRevokedSet.has(u.email.toLowerCase().trim())) {
            const norm = u.email.toLowerCase().trim();
            if (!mergedUsers[norm]) {
              mergedUsers[norm] = {
                email: norm,
                name: u.full_name || norm,
                roles: [u.role as UserRole || 'aluno'],
                defaultRole: u.role as UserRole || 'aluno',
                avatarUrl: u.avatar_url || undefined,
              };
            }
          }
        });
      }
    } catch (_) {}

    // Expurgar qualquer revogado
    for (const rev of activeRevokedSet) {
      delete mergedUsers[rev];
      delete INITIAL_AUTHORIZED_USERS[rev];
    }

    try {
      localStorage.setItem('lms_authorized_users_db', JSON.stringify(mergedUsers));
    } catch (storageErr) {
      try {
        localStorage.removeItem('lms_telemetry_events_cache');
        localStorage.removeItem('lms_events_history');
        localStorage.setItem('lms_authorized_users_db', JSON.stringify(mergedUsers));
      } catch (_) {}
    }

    // 2. Busca solicitações pendentes na nuvem
    const { data: reqData } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', 'system_rbac_pending_requests')
      .limit(1);

    if (reqData && reqData.length > 0 && reqData[0].file_url) {
      try {
        const parsed: AccessRequest[] = JSON.parse(reqData[0].file_url);
        const localReqs = getPendingRequests();
        const reqMap = new Map<string, AccessRequest>();
        if (Array.isArray(parsed)) {
          parsed.forEach((r) => reqMap.set(r.email.toLowerCase().trim(), r));
        }
        localReqs.forEach((r) => {
          const norm = r.email.toLowerCase().trim();
          if (!reqMap.has(norm)) {
            reqMap.set(norm, r);
          }
        });
        const mergedReqs = Array.from(reqMap.values());
        try {
          localStorage.setItem('lms_pending_access_requests', JSON.stringify(mergedReqs));
        } catch (_) {}
      } catch (e) {}
    }

    // Dispara evento global para que componentes (Navbar, AdminPanel) atualizem a UI imediatamente
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lms_rbac_updated'));
    }
  } catch (e) {
    console.warn('[RBAC] Exceção ao ler RBAC da nuvem:', e);
  }
}

const REVOKED_USERS_KEY = 'lms_revoked_users_db';

/**
 * Obtém a lista de e-mails revogados/excluídos permanentemente
 */
export function getRevokedUsersList(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REVOKED_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((e) => String(e).toLowerCase().trim());
    }
  } catch (e) {}
  return [];
}

/**
 * Salva a lista de e-mails revogados no localStorage e na nuvem
 */
export function saveRevokedUsersList(revoked: string[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(REVOKED_USERS_KEY, JSON.stringify(revoked));
    } catch (_) {}
    (async () => {
      try {
        const payloadStr = JSON.stringify(revoked);
        const { data: existing } = await supabase
          .from('materiais')
          .select('id')
          .eq('title', 'system_rbac_revoked_users')
          .limit(1);

        if (existing && existing.length > 0) {
          await supabase.from('materiais').update({ file_url: payloadStr }).eq('title', 'system_rbac_revoked_users');
        } else {
          await supabase.from('materiais').insert({ title: 'system_rbac_revoked_users', file_url: payloadStr, is_native_upload: false });
        }
      } catch (_) {}
    })();
  }
}

/**
 * Obtém a lista dinâmica de e-mails autorizados (sincronizado com localStorage)
 */
export function getAuthorizedUsersList(): Record<string, UserRoleMapping> {
  const revokedSet = new Set(getRevokedUsersList());

  if (typeof window === 'undefined') {
    const cleanInitial: Record<string, UserRoleMapping> = { ...INITIAL_AUTHORIZED_USERS };
    for (const rev of revokedSet) {
      delete cleanInitial[rev];
    }
    return cleanInitial;
  }

  try {
    const stored = localStorage.getItem('lms_authorized_users_db');
    if (stored) {
      const parsed: Record<string, UserRoleMapping> = JSON.parse(stored);
      const merged: Record<string, UserRoleMapping> = { ...INITIAL_AUTHORIZED_USERS };

      for (const [key, cachedUser] of Object.entries(parsed)) {
        if (revokedSet.has(key)) continue;
        const initial = INITIAL_AUTHORIZED_USERS[key];
        if (initial) {
          merged[key] = {
            ...cachedUser,
            name: initial.name || cachedUser.name,
            whatsapp: cachedUser.whatsapp || initial.whatsapp,
            avatarUrl: cachedUser.avatarUrl || initial.avatarUrl,
            roles: Array.from(new Set([...(cachedUser.roles || []), ...(initial.roles || [])])),
          };
        } else {
          merged[key] = cachedUser;
        }
      }

      for (const revEmail of revokedSet) {
        delete merged[revEmail];
        delete INITIAL_AUTHORIZED_USERS[revEmail];
      }

      return merged;
    }
  } catch (e) {
    console.error('Erro ao ler lista de e-mails do localStorage:', e);
  }

  const fallback: Record<string, UserRoleMapping> = { ...INITIAL_AUTHORIZED_USERS };
  for (const revEmail of revokedSet) {
    delete fallback[revEmail];
  }
  return fallback;
}

/**
 * Salva a lista de e-mails autorizados no localStorage e na nuvem (Supabase)
 */
export function saveAuthorizedUsersList(users: Record<string, UserRoleMapping>) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('lms_authorized_users_db', JSON.stringify(users));
    } catch (err) {
      try {
        localStorage.removeItem('lms_telemetry_events_cache');
        localStorage.removeItem('lms_events_history');
        localStorage.setItem('lms_authorized_users_db', JSON.stringify(users));
      } catch (_) {}
    }

    (async () => {
      try {
        const payloadStr = JSON.stringify(users);
        const { data: existing } = await supabase
          .from('materiais')
          .select('id')
          .eq('title', 'system_rbac_users');

        if (existing && existing.length > 0) {
          await supabase.from('materiais').update({ file_url: payloadStr }).eq('title', 'system_rbac_users');
        } else {
          await supabase.from('materiais').insert({ title: 'system_rbac_users', file_url: payloadStr, is_native_upload: false });
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('lms_rbac_updated'));
        }
      } catch (err) {
        console.warn('[RBAC] Exceção ao salvar autorizações na nuvem:', err);
      }
    })();
  }
}

/**
 * Retorna se um e-mail está autorizados e os metadados do perfil
 */
export function getAuthorizedUserInfo(email: string): { isAuthorized: boolean; user?: UserRoleMapping } {
  if (!email) return { isAuthorized: false };
  const normalized = email.toLowerCase().trim();
  const currentList = getAuthorizedUsersList();
  const found = currentList[normalized];

  if (!found) {
    return { isAuthorized: false };
  }

  return { isAuthorized: true, user: found };
}

/**
 * Adiciona ou Atualiza um e-mail na lista de autorizados
 */
export function addOrUpdateAuthorizedUser(user: UserRoleMapping) {
  const normalized = user.email.toLowerCase().trim();

  // Remove da lista de revogados caso estivesse revogado
  const currentRevoked = getRevokedUsersList();
  if (currentRevoked.includes(normalized)) {
    const nextRevoked = currentRevoked.filter((e) => e !== normalized);
    saveRevokedUsersList(nextRevoked);
  }

  const current = getAuthorizedUsersList();
  const updatedUser: UserRoleMapping = {
    ...(current[normalized] || {}),
    ...user,
    email: normalized,
    addedAt: user.addedAt || new Date().toLocaleDateString('pt-BR'),
  };
  current[normalized] = updatedUser;
  INITIAL_AUTHORIZED_USERS[normalized] = updatedUser;
  saveAuthorizedUsersList(current);

  // Também grava na tabela 'users'
  (async () => {
    try {
      await supabase.from('users').upsert({
        email: normalized,
        full_name: updatedUser.name,
        role: updatedUser.defaultRole,
        avatar_url: updatedUser.avatarUrl || null,
      }, { onConflict: 'email' });
    } catch (e) {}
  })();
}

/**
 * Revoga autorização de um e-mail permanentemente
 */
export function removeAuthorizedUser(email: string) {
  const normalized = email.toLowerCase().trim();

  // 1. Marca como revogado no storage persistente local e na nuvem
  const currentRevoked = getRevokedUsersList();
  if (!currentRevoked.includes(normalized)) {
    const nextRevoked = [...currentRevoked, normalized];
    saveRevokedUsersList(nextRevoked);
  }

  // 2. Remove de INITIAL_AUTHORIZED_USERS em memória
  delete INITIAL_AUTHORIZED_USERS[normalized];

  // 3. Remove de authorized_users_db
  const current = getAuthorizedUsersList();
  delete current[normalized];
  saveAuthorizedUsersList(current);

  // 4. Remove da tabela 'users' no Supabase
  (async () => {
    try {
      await supabase.from('users').delete().eq('email', normalized);
    } catch (e) {
      console.warn('Erro ao deletar usuário do Supabase:', e);
    }
  })();
}

// ==========================================
// SOLICITAÇÕES DE ACESSO PENDENTES
// ==========================================

export function getPendingRequests(): AccessRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('lms_pending_access_requests');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Erro ao ler solicitações de acesso:', e);
  }
  return [];
}

export async function savePendingRequests(requests: AccessRequest[]): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lms_pending_access_requests', JSON.stringify(requests));
  }

  try {
    const payloadStr = JSON.stringify(requests);
    const { data: existing } = await supabase
      .from('materiais')
      .select('id')
      .eq('title', 'system_rbac_pending_requests');

    if (existing && existing.length > 0) {
      await supabase.from('materiais').update({ file_url: payloadStr }).eq('title', 'system_rbac_pending_requests');
    } else {
      await supabase.from('materiais').insert({ title: 'system_rbac_pending_requests', file_url: payloadStr, is_native_upload: false });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lms_rbac_updated'));
    }
  } catch (err) {
    console.warn('[RBAC] Exceção ao salvar solicitações na nuvem:', err);
  }
}

export async function requestAccess(
  payloadOrEmail: string | RequestAccessPayload,
  nameArg?: string,
  avatarUrlArg?: string
): Promise<AccessRequest> {
  const payload: RequestAccessPayload =
    typeof payloadOrEmail === 'string'
      ? {
          email: payloadOrEmail,
          name: nameArg,
          avatarUrl: avatarUrlArg,
        }
      : payloadOrEmail;

  const normalized = payload.email.toLowerCase().trim();
  
  // Busca as requisições mais recentes diretamente da nuvem
  let cloudRequests: AccessRequest[] = [];
  try {
    const { data } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', 'system_rbac_pending_requests')
      .limit(1);

    if (data && data.length > 0 && data[0].file_url) {
      cloudRequests = JSON.parse(data[0].file_url);
    }
  } catch (e) {}

  const localRequests = getPendingRequests();
  const reqMap = new Map<string, AccessRequest>();
  if (Array.isArray(cloudRequests)) {
    cloudRequests.forEach((r) => reqMap.set(r.email.toLowerCase().trim(), r));
  }
  localRequests.forEach((r) => {
    const norm = r.email.toLowerCase().trim();
    if (!reqMap.has(norm)) {
      reqMap.set(norm, r);
    }
  });

  const existing = reqMap.get(normalized);
  if (existing) {
    // Se já existia, atualiza com os dados complementares mais recentes caso fornecidos
    const updated: AccessRequest = {
      ...existing,
      name: payload.name || existing.name || normalized,
      googleName: payload.googleName || existing.googleName,
      avatarUrl: payload.avatarUrl || existing.avatarUrl,
      whatsapp: payload.whatsapp || existing.whatsapp,
      turmaIdx: payload.turmaIdx !== undefined ? payload.turmaIdx : existing.turmaIdx,
      turmaNome: payload.turmaNome || existing.turmaNome,
      periodoNum: payload.periodoNum !== undefined ? payload.periodoNum : existing.periodoNum,
      periodoNome: payload.periodoNome || existing.periodoNome,
      perfilSolicitado: payload.perfilSolicitado || existing.perfilSolicitado,
      observacao: payload.observacao || existing.observacao,
    };
    reqMap.set(normalized, updated);
    const updatedList = Array.from(reqMap.values());
    await savePendingRequests(updatedList);
    return updated;
  }

  const newReq: AccessRequest = {
    id: `req_${Date.now()}`,
    email: normalized,
    name: payload.name || normalized,
    googleName: payload.googleName,
    avatarUrl: payload.avatarUrl,
    requestedAt: new Date().toLocaleString('pt-BR'),
    status: 'pending',
    whatsapp: payload.whatsapp,
    turmaIdx: payload.turmaIdx,
    turmaNome: payload.turmaNome,
    periodoNum: payload.periodoNum,
    periodoNome: payload.periodoNome,
    perfilSolicitado: payload.perfilSolicitado || 'aluno',
    observacao: payload.observacao,
  };

  reqMap.set(normalized, newReq);
  const updatedList = Array.from(reqMap.values());
  await savePendingRequests(updatedList);

  // Dupla garantia: dispara também via API Route do servidor Next.js
  try {
    fetch('/api/auth/request-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReq),
    }).catch(() => {});
  } catch (e) {}

  return newReq;
}

export async function approveAccessRequest(requestId: string, role: UserRole = 'aluno'): Promise<void> {
  let requests = getPendingRequests();
  try {
    const { data } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', 'system_rbac_pending_requests')
      .limit(1);

    if (data && data.length > 0 && data[0].file_url) {
      requests = JSON.parse(data[0].file_url);
    }
  } catch (e) {}

  const req = requests.find((r) => r.id === requestId);

  if (req) {
    req.status = 'approved';
    const remaining = requests.filter((r) => r.id !== requestId);
    await savePendingRequests(remaining);

    // Adiciona à lista de autorizados com turma, período, whatsapp e nome oficiais
    addOrUpdateAuthorizedUser({
      email: req.email,
      name: req.name,
      roles: role === 'aluno' ? ['aluno'] : [role, 'aluno'],
      defaultRole: role,
      avatarUrl: req.avatarUrl,
      whatsapp: req.whatsapp,
      turmaIdx: req.turmaIdx,
      periodoNum: req.periodoNum,
    });
  }
}

export async function rejectAccessRequest(requestId: string): Promise<void> {
  let requests = getPendingRequests();
  try {
    const { data } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', 'system_rbac_pending_requests')
      .limit(1);

    if (data && data.length > 0 && data[0].file_url) {
      requests = JSON.parse(data[0].file_url);
    }
  } catch (e) {}

  const remaining = requests.filter((r) => r.id !== requestId);
  await savePendingRequests(remaining);
}

/**
 * Gera os dados de e-mail de confirmação de aprovação de acesso (com links diretos para Gmail Web, WhatsApp e mailto)
 */
export function formatApprovalEmail(name: string, email: string, role: UserRole, whatsapp?: string): {
  subject: string;
  body: string;
  mailtoUrl: string;
  gmailUrl: string;
  whatsappUrl: string;
} {
  const roleName = role === 'admin' ? 'Administrador(a)' : role === 'professor' ? 'Professor(a)' : role === 'monitor' ? 'Monitor(a)' : 'Aluno(a)';
  const subject = `Acesso Aprovado ao Koinonia LMS • Projeto TCC Cristiano do Sacramento Soares`;
  const body = `Olá, ${name || 'Estudante'}! ✨

Sua solicitação de acesso ao Koinonia LMS (Plataforma Acadêmica do Seminário Teológico Congregacional) foi APROVADA com sucesso no perfil de ${roleName}!
Esta plataforma é fruto do Projeto de TCC do Seminarista Cristiano do Sacramento Soares (UNIMB).

► Acesse a plataforma agora pelo link oficial:
https://koinonialms.vercel.app

Instruções de Acesso:
1. Acesse o link acima no seu computador ou celular.
2. Clique no botão "Continuar com Google" e selecione o seu e-mail cadastrado: ${email}.
3. Você terá acesso imediato à grade semanal de aulas, links do Google Meet, pastas virtuais do Google Drive, biblioteca digital e Caderno Cornell com inteligência artificial.

Dúvidas ou suporte? Estamos à disposição!

Atenciosamente,
Coordenação Acadêmica & Tecnologia
Koinonia LMS • Semestre 2026.2
Projeto de TCC do Seminarista Cristiano do Sacramento Soares`;

  const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const whatsappText = `Olá, *${name || 'Estudante'}*! ✨ Sua solicitação de acesso ao *Koinonia LMS* foi APROVADA com sucesso no perfil de *${roleName}*!\n\nEsta plataforma é fruto do *Projeto de TCC do Seminarista Cristiano do Sacramento Soares (UNIMB / Seminário Teológico Congregacional)*.\n\n► *Link Oficial de Acesso:*\nhttps://koinonialms.vercel.app\n\n✔ *Como acessar:*\nBasta entrar com sua conta Google cadastrada (${email}) para ter acesso completo. Seja bem-vindo(a)!`;
  
  const cleanPhone = whatsapp ? whatsapp.replace(/\D/g, '') : '';
  const phoneParam = cleanPhone ? (cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`) : '';
  const whatsappUrl = phoneParam
    ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(whatsappText)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;

  return { subject, body, mailtoUrl, gmailUrl, whatsappUrl };
}

