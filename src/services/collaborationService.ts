import { supabase } from '@/lib/supabaseClient';
import { 
  ForumTopico, 
  ForumResposta, 
  DirectMessage, 
  OnlinePeer, 
  PedidoOracaoCard,
  UserRole,
  ForumTipo
} from '@/types';
import { INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';

// Chaves para cache local e contingência
const STORAGE_TOPICS_KEY = 'lms_collab_topics_cache';
const STORAGE_REPLIES_KEY = 'lms_collab_replies_cache';
const STORAGE_MESSAGES_KEY = 'lms_collab_messages_cache';
const STORAGE_PRAYERS_KEY = 'lms_collab_prayers_cache';
const STORAGE_PRESENCE_KEY = 'lms_collab_presence_cache';

const MATERIALS_COLLAB_SYNC_ID = 'system_collaboration_suite_sync';

// Seeds Padrão para Demonstração Inicial
const DEFAULT_TOPICS: ForumTopico[] = [
  {
    id: 'f1111111-1111-4111-8111-111111111111',
    disciplina_id: 'global-koinonia',
    disciplina_nome: 'Espaço Comunitário Geral',
    autor_email: 'sacrasub@gmail.com',
    autor_nome: 'Cristiano (Coordenação)',
    autor_role: 'admin',
    titulo: '☕ Espaço Koinonia: Apresentações e Boas-Vindas ao Semestre 2026.2',
    conteudo: 'Irmãos seminaristas e professores, usem este espaço livre para compartilhar de onde vocês são, suas congregações locais e expectativas para este semestre acadêmico!',
    tipo: 'LIVRE_KOINONIA',
    fixado: true,
    criado_em: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    respostas_count: 2
  },
  {
    id: 'f2222222-2222-4222-8222-222222222222',
    disciplina_id: 'teologia-sistematica-1',
    disciplina_nome: 'Teologia Sistemática I',
    autor_email: 'hilario@seminario.com',
    autor_nome: 'Prof. Hilário',
    autor_role: 'professor',
    titulo: '⚖️ [Fórum P&R] O Dilema da Graça e da Responsabilidade Humana',
    conteudo: 'Poste sua reflexão autoral de até 300 palavras sobre como conciliar a soberania divina e a responsabilidade humana na soteriologia bíblica. Atenção: você só visualizará as respostas dos colegas após enviar a sua própria contribuição autoral.',
    tipo: 'P_E_R',
    fixado: false,
    criado_em: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    respostas_count: 3
  }
];

const DEFAULT_PRAYERS: PedidoOracaoCard[] = [
  {
    id: 'e1111111-1111-4111-8111-111111111111',
    autor_email: 'sacrasub@gmail.com',
    autor_nome: 'Cristiano da Silva',
    autor_cargo: 'Coordenador Acadêmico',
    categoria: 'ORACAO',
    pedido_oracao: 'Peço oração pela capacitação dos nossos professores e pela saúde de todos os seminaristas neste início de módulo intensivo.',
    intercessores: ['aluno1@uiecbead.com.br', 'hilario@seminario.com'],
    criado_em: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
  },
  {
    id: 'e2222222-2222-4222-8222-222222222222',
    autor_email: 'rosiane@seminario.com',
    autor_nome: 'Rosiane (Monitora)',
    autor_cargo: 'Monitora de Turma',
    categoria: 'GRATIDAO',
    pedido_oracao: 'Louvado seja Deus pela acolhida da turma e pelo engajamento nas primeiras aulas síncronas do Google Meet!',
    intercessores: ['sacrasub@gmail.com'],
    criado_em: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
  },
  {
    id: 'm3333333-3333-4333-8333-333333333333',
    autor_email: 'aluno1@uiecbead.com.br',
    autor_nome: 'Pr. Marcos (Aluno Turma A)',
    autor_cargo: 'Seminarista / Pastor Local',
    categoria: 'MISSAO',
    pedido_oracao: 'Nossa igreja iniciou um ponto de pregação no interior do estado. Peço que orem pela abertura de portas e conversão de famílias!',
    intercessores: ['sacrasub@gmail.com', 'rosiane@seminario.com', 'hilario@seminario.com'],
    criado_em: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  }
];

// =========================================================================
// HELPERS DE CACHE LOCAL
// =========================================================================

function getLocalData<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return defaultVal;
}

function saveLocalData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

// =========================================================================
// 1. MÓDULO DE FÓRUNS ACADÊMICOS & KOINONIA (COM REGRA P&R)
// =========================================================================

export async function getTopics(disciplinaId?: string, userEmail?: string): Promise<ForumTopico[]> {
  const normEmail = (userEmail || '').toLowerCase().trim();

  try {
    let query = supabase.from('tcc_foruns_topicos').select('*').order('criado_em', { ascending: false });
    if (disciplinaId && disciplinaId !== 'todas') {
      query = query.or(`disciplina_id.eq.${disciplinaId},disciplina_id.eq.global-koinonia`);
    }

    const { data: dbTopics, error } = await query;
    if (!error && dbTopics && dbTopics.length > 0) {
      // Busca contagem de respostas
      const { data: dbReplies } = await supabase.from('tcc_foruns_respostas').select('topico_id, autor_email');

      const topicsWithMeta: ForumTopico[] = dbTopics.map((t) => {
        const topReplies = (dbReplies || []).filter((r) => r.topico_id === t.id);
        const hasAnswered = topReplies.some((r) => r.autor_email.toLowerCase() === normEmail);
        return {
          ...t,
          respostas_count: topReplies.length,
          usuario_ja_respondeu: hasAnswered,
        };
      });

      saveLocalData(STORAGE_TOPICS_KEY, topicsWithMeta);
      return topicsWithMeta;
    }
  } catch (e) {
    console.warn('Fallback ativado em getTopics:', e);
  }

  // Fallback
  const localTopics = getLocalData<ForumTopico[]>(STORAGE_TOPICS_KEY, DEFAULT_TOPICS);
  const localReplies = getLocalData<ForumResposta[]>(STORAGE_REPLIES_KEY, []);

  return localTopics
    .filter((t) => !disciplinaId || disciplinaId === 'todas' || t.disciplina_id === disciplinaId || t.disciplina_id === 'global-koinonia')
    .map((t) => {
      const replies = localReplies.filter((r) => r.topico_id === t.id);
      return {
        ...t,
        respostas_count: Math.max(t.respostas_count || 0, replies.length),
        usuario_ja_respondeu: replies.some((r) => r.autor_email.toLowerCase() === normEmail)
      };
    });
}

export async function createTopic(
  topicData: Omit<ForumTopico, 'id' | 'criado_em'>
): Promise<ForumTopico> {
  const newTopic: ForumTopico = {
    ...topicData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `topic_${Date.now()}`,
    criado_em: new Date().toISOString(),
    respostas_count: 0,
    usuario_ja_respondeu: false,
  };

  const current = getLocalData<ForumTopico[]>(STORAGE_TOPICS_KEY, DEFAULT_TOPICS);
  const updated = [newTopic, ...current];
  saveLocalData(STORAGE_TOPICS_KEY, updated);

  try {
    await supabase.from('tcc_foruns_topicos').insert({
      id: newTopic.id,
      disciplina_id: newTopic.disciplina_id,
      autor_email: newTopic.autor_email,
      autor_nome: newTopic.autor_nome,
      autor_role: newTopic.autor_role,
      titulo: newTopic.titulo,
      conteudo: newTopic.conteudo,
      tipo: newTopic.tipo,
      fixado: Boolean(newTopic.fixado),
      criado_em: newTopic.criado_em,
    });
  } catch (e) {
    console.warn('Tópico salvo em contingência:', e);
  }

  return newTopic;
}

export async function getTopicReplies(
  topico: ForumTopico,
  userEmail: string,
  userRole: UserRole
): Promise<ForumResposta[]> {
  const normEmail = (userEmail || '').toLowerCase().trim();
  let replies: ForumResposta[] = [];

  try {
    const { data: dbReplies, error } = await supabase
      .from('tcc_foruns_respostas')
      .select('*')
      .eq('topico_id', topico.id)
      .order('criado_em', { ascending: true });

    if (!error && dbReplies) {
      replies = dbReplies;
    } else {
      const local = getLocalData<ForumResposta[]>(STORAGE_REPLIES_KEY, []);
      replies = local.filter((r) => r.topico_id === topico.id);
    }
  } catch (e) {
    const local = getLocalData<ForumResposta[]>(STORAGE_REPLIES_KEY, []);
    replies = local.filter((r) => r.topico_id === topico.id);
  }

  const userHasAnswered = replies.some((r) => r.autor_email.toLowerCase() === normEmail);
  const isPrivileged = userRole === 'professor' || userRole === 'admin' || userRole === 'monitor';

  // REGRA PEDAGÓGICA P&R (PERGUNTAS & RESPOSTAS):
  // Se o fórum for P_E_R e o aluno ainda não respondeu, ofusca o conteúdo dos outros alunos
  if (topico.tipo === 'P_E_R' && !userHasAnswered && !isPrivileged) {
    return replies.map((r) => {
      if (r.autor_email.toLowerCase() === normEmail) return r;
      return {
        ...r,
        conteudo: '🔒 [RESPOSTA PROTEGIDA]: Para visualizar as respostas dos outros colegas, você precisa enviar sua própria resposta autoral primeiro.',
      };
    });
  }

  return replies;
}

export async function addTopicReply(
  topicoId: string,
  replyData: Omit<ForumResposta, 'id' | 'topico_id' | 'criado_em'>
): Promise<ForumResposta> {
  const newReply: ForumResposta = {
    ...replyData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `reply_${Date.now()}`,
    topico_id: topicoId,
    criado_em: new Date().toISOString(),
  };

  const currentReplies = getLocalData<ForumResposta[]>(STORAGE_REPLIES_KEY, []);
  const updatedReplies = [...currentReplies, newReply];
  saveLocalData(STORAGE_REPLIES_KEY, updatedReplies);

  try {
    await supabase.from('tcc_foruns_respostas').insert({
      id: newReply.id,
      topico_id: newReply.topico_id,
      autor_email: newReply.autor_email,
      autor_nome: newReply.autor_nome,
      autor_role: newReply.autor_role,
      conteudo: newReply.conteudo,
      criado_em: newReply.criado_em,
    });
  } catch (e) {
    console.warn('Resposta salva em contingência:', e);
  }

  return newReply;
}

// =========================================================================
// 2. MÓDULO DE PRESENÇA SOCIAL & CHAT DIRETO (DM) — REAL TIME & AUDITORIA
// =========================================================================

export async function sendPresenceHeartbeat(user: { email: string; nome: string; role: UserRole }): Promise<void> {
  if (!user.email) return;
  const now = new Date().toISOString();
  const emailLower = user.email.toLowerCase().trim();

  // 1. Atualiza cache local
  const presenceMap = getLocalData<Record<string, OnlinePeer>>(STORAGE_PRESENCE_KEY, {});
  presenceMap[emailLower] = {
    email: emailLower,
    nome: user.nome,
    role: user.role,
    ultimo_heartbeat: now,
    is_online: true,
  };
  saveLocalData(STORAGE_PRESENCE_KEY, presenceMap);

  // 2. Sincroniza presença real no Supabase (lms_user_sessions)
  try {
    const sessionToken = `sess_presence_${emailLower}`;
    await supabase.from('lms_user_sessions').upsert(
      {
        session_token: sessionToken,
        user_email: emailLower,
        user_name: user.nome,
        user_role: user.role,
        is_active: true,
        last_heartbeat_at: now,
        updated_at: now,
      },
      { onConflict: 'session_token' }
    );
  } catch (e) {
    // Modo offline silencioso
  }
}

export async function getOnlinePeers(currentUserEmail: string): Promise<OnlinePeer[]> {
  const normEmail = (currentUserEmail || '').toLowerCase().trim();
  const presenceMap = getLocalData<Record<string, OnlinePeer>>(STORAGE_PRESENCE_KEY, {});
  const now = Date.now();
  const threeMinAgoTimestamp = now - 3 * 60 * 1000;
  const threeMinAgoIso = new Date(threeMinAgoTimestamp).toISOString();

  const activeOnlineEmails = new Set<string>();

  // 1. Consulta sessões realmente ativas nos últimos 3 minutos no Supabase
  try {
    const { data: dbSessions, error } = await supabase
      .from('lms_user_sessions')
      .select('user_email, user_name, user_role, last_heartbeat_at, is_active')
      .eq('is_active', true)
      .gte('last_heartbeat_at', threeMinAgoIso);

    if (!error && dbSessions) {
      dbSessions.forEach((s) => {
        if (s.user_email) {
          activeOnlineEmails.add(s.user_email.toLowerCase().trim());
        }
      });
    }
  } catch (e) {
    // Continua para fallback
  }

  // Fallback: se lms_user_sessions não existir ou estiver vazia, verifica student_sync recente em materiais
  try {
    const { data: recentStudents } = await supabase
      .from('materiais')
      .select('title, file_url, created_at')
      .ilike('title', 'student_sync_%');

    if (recentStudents) {
      recentStudents.forEach((row) => {
        try {
          const parsed = JSON.parse(row.file_url);
          const rawEmail = row.title.replace('student_sync_', '').toLowerCase().trim();
          const lastActivity = parsed.updatedAt || row.created_at;
          if (new Date(lastActivity).getTime() >= (now - 15 * 60 * 1000)) {
            activeOnlineEmails.add(rawEmail);
          }
        } catch (_) {}
      });
    }
  } catch (_) {}

  // 2. Verifica também heartbeats locais recentes
  Object.values(presenceMap).forEach((p) => {
    if (new Date(p.ultimo_heartbeat).getTime() > threeMinAgoTimestamp) {
      activeOnlineEmails.add(p.email.toLowerCase().trim());
    }
  });

  // 3. Monta a lista com os usuários cadastrados no Seminário
  const peersList: OnlinePeer[] = [];
  const processedEmails = new Set<string>();

  Object.values(INITIAL_AUTHORIZED_USERS).forEach((u) => {
    const uEmail = u.email.toLowerCase().trim();
    if (uEmail === normEmail) return; // Não exibe o próprio usuário na lista de colegas
    if (processedEmails.has(uEmail)) return;

    processedEmails.add(uEmail);
    const isOnline = activeOnlineEmails.has(uEmail);
    const cachedPeer = presenceMap[uEmail];

    peersList.push({
      email: uEmail,
      nome: u.name,
      role: u.defaultRole,
      avatar_url: u.avatarUrl,
      ultimo_heartbeat: cachedPeer?.ultimo_heartbeat || new Date(Date.now() - 86400000).toISOString(),
      is_online: isOnline,
    });
  });

  // 4. Adiciona outros usuários que possam ter enviado presença via Supabase mas não estão no authConfig inicial
  activeOnlineEmails.forEach((onlineEmail) => {
    if (onlineEmail !== normEmail && !processedEmails.has(onlineEmail)) {
      const cached = presenceMap[onlineEmail];
      peersList.push({
        email: onlineEmail,
        nome: cached?.nome || onlineEmail.split('@')[0],
        role: cached?.role || 'aluno',
        ultimo_heartbeat: cached?.ultimo_heartbeat || new Date().toISOString(),
        is_online: true,
      });
      processedEmails.add(onlineEmail);
    }
  });

  // 5. Ordena: primeiro quem está 🟢 Online agora, depois por ordem alfabética de nome
  return peersList.sort((a, b) => {
    if (a.is_online && !b.is_online) return -1;
    if (!a.is_online && b.is_online) return 1;
    return a.nome.localeCompare(b.nome);
  });
}

export async function getDirectMessages(user1Email: string, user2Email: string): Promise<DirectMessage[]> {
  const u1 = (user1Email || '').toLowerCase().trim();
  const u2 = (user2Email || '').toLowerCase().trim();

  try {
    const { data: dbMessages, error } = await supabase
      .from('tcc_mensagens')
      .select('*')
      .or(`and(remetente_email.eq.${u1},destinatario_email.eq.${u2}),and(remetente_email.eq.${u2},destinatario_email.eq.${u1})`)
      .order('criado_em', { ascending: true });

    if (!error && dbMessages) {
      return dbMessages;
    }
  } catch (e) {}

  const local = getLocalData<DirectMessage[]>(STORAGE_MESSAGES_KEY, []);
  return local
    .filter(
      (m) =>
        (m.remetente_email.toLowerCase() === u1 && m.destinatario_email.toLowerCase() === u2) ||
        (m.remetente_email.toLowerCase() === u2 && m.destinatario_email.toLowerCase() === u1)
    )
    .sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime());
}

export async function sendDirectMessage(
  msg: Omit<DirectMessage, 'id' | 'lida' | 'criado_em'>
): Promise<DirectMessage> {
  const newMsg: DirectMessage = {
    ...msg,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `msg_${Date.now()}`,
    lida: false,
    criado_em: new Date().toISOString(),
  };

  const current = getLocalData<DirectMessage[]>(STORAGE_MESSAGES_KEY, []);
  saveLocalData(STORAGE_MESSAGES_KEY, [...current, newMsg]);

  try {
    await supabase.from('tcc_mensagens').insert(newMsg);
  } catch (e) {
    console.warn('Mensagem salva em contingência:', e);
  }

  return newMsg;
}

export async function getUnreadMessagesCount(userEmail: string): Promise<number> {
  const normEmail = (userEmail || '').toLowerCase().trim();
  try {
    const { count } = await supabase
      .from('tcc_mensagens')
      .select('*', { count: 'exact', head: true })
      .eq('destinatario_email', normEmail)
      .eq('lida', false);

    if (typeof count === 'number') return count;
  } catch (e) {}

  const local = getLocalData<DirectMessage[]>(STORAGE_MESSAGES_KEY, []);
  return local.filter((m) => m.destinatario_email.toLowerCase() === normEmail && !m.lida).length;
}

export async function markMessagesAsRead(senderEmail: string, receiverEmail: string): Promise<void> {
  const sEmail = senderEmail.toLowerCase().trim();
  const rEmail = receiverEmail.toLowerCase().trim();

  const local = getLocalData<DirectMessage[]>(STORAGE_MESSAGES_KEY, []);
  const updated = local.map((m) =>
    m.remetente_email.toLowerCase() === sEmail && m.destinatario_email.toLowerCase() === rEmail ? { ...m, lida: true } : m
  );
  saveLocalData(STORAGE_MESSAGES_KEY, updated);

  try {
    await supabase
      .from('tcc_mensagens')
      .update({ lida: true })
      .eq('remetente_email', sEmail)
      .eq('destinatario_email', rEmail);
  } catch (e) {}
}

// =========================================================================
// 3. MÓDULO DE MURAL DE ORAÇÃO & KOINONIA ESPIRITUAL
// =========================================================================

export async function getPrayerCards(): Promise<PedidoOracaoCard[]> {
  try {
    const { data, error } = await supabase
      .from('tcc_mural_oracoes')
      .select('*')
      .order('criado_em', { ascending: false });

    if (!error && data && data.length > 0) {
      saveLocalData(STORAGE_PRAYERS_KEY, data);
      return data;
    }
  } catch (e) {}

  return getLocalData<PedidoOracaoCard[]>(STORAGE_PRAYERS_KEY, DEFAULT_PRAYERS);
}

export async function createPrayerCard(
  card: Omit<PedidoOracaoCard, 'id' | 'intercessores' | 'criado_em'>
): Promise<PedidoOracaoCard> {
  const newCard: PedidoOracaoCard = {
    ...card,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `prayer_${Date.now()}`,
    intercessores: [],
    criado_em: new Date().toISOString(),
  };

  const current = getLocalData<PedidoOracaoCard[]>(STORAGE_PRAYERS_KEY, DEFAULT_PRAYERS);
  const updated = [newCard, ...current];
  saveLocalData(STORAGE_PRAYERS_KEY, updated);

  try {
    await supabase.from('tcc_mural_oracoes').insert({
      id: newCard.id,
      autor_email: newCard.autor_email,
      autor_nome: newCard.autor_nome,
      autor_cargo: newCard.autor_cargo,
      categoria: newCard.categoria,
      pedido_oracao: newCard.pedido_oracao,
      intercessores: newCard.intercessores,
      criado_em: newCard.criado_em,
    });
  } catch (e) {
    console.warn('Post-it de oração salvo em contingência:', e);
  }

  return newCard;
}

export async function toggleIntercession(cardId: string, userEmail: string): Promise<PedidoOracaoCard[]> {
  const normEmail = (userEmail || '').toLowerCase().trim();
  const current = getLocalData<PedidoOracaoCard[]>(STORAGE_PRAYERS_KEY, DEFAULT_PRAYERS);

  const updated = current.map((card) => {
    if (card.id === cardId) {
      const alreadyPraying = card.intercessores.map((e) => e.toLowerCase()).includes(normEmail);
      const newIntercessores = alreadyPraying
        ? card.intercessores.filter((e) => e.toLowerCase() !== normEmail)
        : [...card.intercessores, normEmail];

      return { ...card, intercessores: newIntercessores };
    }
    return card;
  });

  saveLocalData(STORAGE_PRAYERS_KEY, updated);

  const target = updated.find((c) => c.id === cardId);
  if (target) {
    try {
      await supabase
        .from('tcc_mural_oracoes')
        .update({ intercessores: target.intercessores })
        .eq('id', cardId);
    } catch (e) {}
  }

  return updated;
}
