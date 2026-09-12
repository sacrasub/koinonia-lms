import { AvisoLeituraPreAula } from '@/types';
import { supabase } from '@/lib/supabaseClient';

const STORAGE_KEY = 'lms_leituras_preaula_v1';
const READ_STORAGE_PREFIX = 'lms_read_announcements_';
const CLOUD_TITLE_KEY = 'lms_leituras_preaula_cloud';

export const INITIAL_ANNOUNCEMENTS: AvisoLeituraPreAula[] = [
  {
    id: 'aviso-diretoria-afro-1',
    disciplina_id: 'disc-9',
    disciplina_name: 'História da Cultura Afro Brasileira e Indígena',
    author_name: 'STC Diretora Karla (Direção)',
    author_role: 'admin',
    author_email: 'diretoria@koinonia.edu.br',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'Aulas e Materiais: Matéria Modular de Cultura Afro-brasileira e Indígena',
    message: 'Queridos, segue a pasta com as aulas e demais materiais da matéria História da Cultura Afro-brasileira e Indígena. Conforme combinamos, a matéria será modular, contendo quatro aulas. Na quarta aula, o Prof. Alexsandro apresenta e explica a atividade que deve ser produzida e enviada para o seu e-mail, como forma de avaliação. Vocês terão até o final do período (28 de novembro) para assistir às aulas, produzir e enviar a atividade.',
    link_url: 'https://drive.google.com/drive/folders/1mCp4ZCawhIekLJl3_bcoPiThAqwdzlty?usp=drive_link',
    created_at: '2026-09-09T13:29:00Z',
    target_date: 'Entrega da Atividade até 28/11/2026',
    is_pinned: true,
    is_archived: false,
    category: 'complementar',
  },
  {
    id: 'aviso-ary-1',
    disciplina_id: 'disc-1',
    disciplina_name: 'História do Congregacionalismo',
    author_name: 'Profº Ary Júnior',
    author_role: 'professor',
    author_email: 'queiroz.aryjr@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Igreja, Estado e Autonomia',
    message: 'Boa noite, nobres. Textinho pra nossa aula de logo mais',
    link_url: 'https://aryqueirozjr.com.br/igreja-estado-e-autonomia/',
    created_at: '2026-08-18T16:04:00Z',
    target_date: '18/08/2026 (Terça-feira)',
    is_pinned: true,
    is_archived: false,
    category: 'pre_aula',
  },
  {
    id: 'aviso-hilario-1',
    disciplina_id: 'disc-2',
    disciplina_name: 'História do Pensamento Cristão II',
    author_name: 'Profº Hilário Bispo',
    author_role: 'professor',
    author_email: 'hilario.graca@catolica.edu.br',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    title: 'A Missão de Deus: Revelando o Plano Redentor das Escrituras',
    message: 'Leitura preliminar para compreensão do Iluminismo, razão vs. revelação e as raízes do pensamento reformado.',
    link_url: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy',
    created_at: '2026-08-18T18:00:00Z',
    target_date: 'Terça-feira às 20:35',
    is_pinned: false,
    is_archived: false,
    category: 'pre_aula',
  },
  {
    id: 'aviso-uilian-1',
    disciplina_id: 'disc-3',
    disciplina_name: 'Aconselhamento Bíblico II',
    author_name: 'Profº Uilian Santos',
    author_role: 'professor',
    author_email: 'santosuilian093@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    title: 'Leitura Obrigatória: O Ego Transformado (Timothy Keller)',
    message: 'Texto-base essencial para o exercício do aconselhamento bíblico e preparação para a primeira avaliação objetiva.',
    link_url: 'https://drive.google.com/open?id=1BUr0R4pLQjTt01ID8XjYKIBlZhAtaWcx&usp=drive_copy',
    created_at: '2026-08-19T17:30:00Z',
    target_date: 'Quarta-feira às 19:00',
    is_pinned: false,
    is_archived: false,
    category: 'pre_aula',
  },
  {
    id: 'aviso-cleiton-1',
    disciplina_id: 'disc-4',
    disciplina_name: 'Direitos Humanos',
    author_name: 'Profº Cleiton Barbirato',
    author_role: 'professor',
    author_email: 'cleitonpb@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Declaração Universal dos Direitos Humanos e Ética Cristã',
    message: 'Artigos doutrinários e análise dos tratados de direitos fundamentais para a nossa próxima sessão.',
    link_url: 'https://drive.google.com/open?id=1fPSmFUBNzrzK--n3NDKOdMR5HWk25AV7&usp=drive_copy',
    created_at: '2026-08-19T19:00:00Z',
    target_date: 'Quarta-feira às 20:35',
    is_pinned: false,
    is_archived: false,
    category: 'pre_aula',
  },
  {
    id: 'aviso-karol-1',
    disciplina_id: 'disc-5',
    disciplina_name: 'Ética Cristã',
    author_name: 'Profª Karoline Evangelista',
    author_role: 'professor',
    author_email: 'karolteologia@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    title: 'Ética Cristã e Mandamentos: Catecismo Maior de Westminster',
    message: 'Texto orientador dos seminários práticos sobre os Dez Mandamentos e dilemas éticos contemporâneos.',
    link_url: 'https://drive.google.com/open?id=1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC&usp=drive_copy',
    created_at: '2026-08-20T17:00:00Z',
    target_date: 'Quinta-feira às 19:00',
    is_pinned: false,
    is_archived: false,
    category: 'pre_aula',
  },
  {
    id: 'aviso-marcio-1',
    disciplina_id: 'disc-6',
    disciplina_name: 'Novo Testamento III - Epístolas Gerais',
    author_name: 'Profº Marcio Leal',
    author_role: 'professor',
    author_email: 'pr.marcioleal@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    title: 'Síntese Exegética e Introdução às Epístolas Gerais',
    message: 'Notas e slides preparatórios para acompanhamento das discussões e elaboração das 150 questões discursivas.',
    link_url: 'https://drive.google.com/open?id=1ppsv5caJVbHw-1RwhHu8nxBmqFT9Wm9P&usp=drive_copy',
    created_at: '2026-08-20T19:00:00Z',
    target_date: 'Quinta-feira às 20:35',
    is_pinned: false,
    is_archived: false,
    category: 'pre_aula',
  },
  {
    id: 'aviso-thacyto-1',
    disciplina_id: 'disc-7',
    disciplina_name: 'Plantação e Revitalização de Igrejas II',
    author_name: 'Profº Thácyto Lessa',
    author_role: 'professor',
    author_email: 'thacyto@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    title: 'Leitura Obrigatória: A Treliça e a Videira (Colin Marshall & Tony Payne)',
    message: 'Base da AV1: leitura dos 12 capítulos para elaboração do resumo reflexivo com entrega até 27/11.',
    link_url: 'https://drive.google.com/open?id=1nzXIDnWvvrxSgXQULaSvDGdVr32L_xP8&usp=drive_copy',
    created_at: '2026-08-21T17:00:00Z',
    target_date: 'Sexta-feira às 19:00',
    is_pinned: false,
    is_archived: false,
    category: 'pre_aula',
  },
  {
    id: 'aviso-gabriela-1',
    disciplina_id: 'disc-8',
    disciplina_name: 'TCC I',
    author_name: 'Profª Gabriela Leal',
    author_role: 'professor',
    author_email: 'gabriela.lealg7757@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Manual Metodológico e Normas ABNT para TCC',
    message: 'Diretrizes completas para o projeto de pesquisa, objetivos, justificativa e cronograma acadêmico.',
    link_url: 'https://drive.google.com/open?id=1f-9i-TpqaZhzoLyrxg6flM6CHTsAOWPj&usp=drive_copy',
    created_at: '2026-08-21T18:30:00Z',
    target_date: 'Sexta-feira às 20:00',
    is_pinned: false,
    is_archived: false,
    category: 'complementar',
  },
  {
    id: 'aviso-betania-1',
    disciplina_id: 'disc-b-4',
    disciplina_name: 'Teologia do Culto e Liturgia',
    author_name: 'Profª Betânia Barbosa',
    author_role: 'professor',
    author_email: 'betania@uicb.edu.br',
    avatar_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    title: 'Princípios Bíblicos e Históricos da Liturgia Cristã',
    message: 'Textos orientadores sobre a ordenança dos sacramentos e a condução do louvor na tradição evangélica.',
    link_url: 'https://drive.google.com/open?id=19Y8Nv2Yvx1V-m4E5y5fUWOo5e8DZzeji&usp=drive_copy',
    created_at: '2026-08-22T10:00:00Z',
    target_date: 'Segunda-feira às 19:00',
    is_pinned: false,
    is_archived: false,
    category: 'pre_aula',
  },
  {
    id: 'aviso-sylvia-1',
    disciplina_id: 'disc-c-2',
    disciplina_name: 'História Eclesiástica I',
    author_name: 'Profª Sylvia Maia',
    author_role: 'professor',
    author_email: 'sylvia@uicb.edu.br',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    title: 'Os Pais da Igreja e os Primeiros Concílios Ecumênicos',
    message: 'Leituras da Patrística sobre a defesa da fé cristã diante dos desafios filosóficos greco-romanos.',
    link_url: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy',
    created_at: '2026-08-22T14:00:00Z',
    target_date: 'Quarta-feira às 19:00',
    is_pinned: false,
    is_archived: false,
    category: 'pre_aula',
  }
];

export function getAnnouncements(): AvisoLeituraPreAula[] {
  if (typeof window === 'undefined') {
    return INITIAL_ANNOUNCEMENTS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ANNOUNCEMENTS));
      return INITIAL_ANNOUNCEMENTS;
    }
    const parsed: AvisoLeituraPreAula[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ANNOUNCEMENTS));
      return INITIAL_ANNOUNCEMENTS;
    }

    // Auto-merge inteligente: garante que as leituras oficiais de todas as matérias/professores estejam presentes
    // mesmo que o localStorage local tenha sido salvo previamente com apenas 2 registros
    const existingIds = new Set(parsed.map((item) => item.id));
    let hasNewSeeds = false;
    const merged = [...parsed];

    for (const seed of INITIAL_ANNOUNCEMENTS) {
      if (!existingIds.has(seed.id)) {
        merged.push(seed);
        hasNewSeeds = true;
      }
    }

    if (hasNewSeeds) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }

    return parsed;
  } catch (err) {
    console.error('Erro ao ler avisos de leituras pré-aula:', err);
    return INITIAL_ANNOUNCEMENTS;
  }
}

export function saveAnnouncements(list: AvisoLeituraPreAula[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // Dispara evento customizado para reatividade imediata em todos os componentes abertos
    window.dispatchEvent(new CustomEvent('lms_announcements_updated', { detail: list }));
    // Sincroniza em background com o Supabase para refletir instantaneamente no celular
    syncAnnouncementsToCloud(list);
  } catch (err) {
    console.error('Erro ao salvar avisos de leituras pré-aula:', err);
  }
}

/**
 * Persiste as leituras pré-aula na nuvem (Supabase)
 */
export async function syncAnnouncementsToCloud(list: AvisoLeituraPreAula[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const jsonStr = JSON.stringify(list);
    const { data: existing } = await supabase
      .from('materiais')
      .select('id')
      .eq('title', CLOUD_TITLE_KEY)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('materiais')
        .update({ file_url: jsonStr, updated_at: new Date().toISOString() })
        .eq('id', existing[0].id);
    } else {
      await supabase.from('materiais').insert([
        {
          disciplina_id: 'global-cloud',
          title: CLOUD_TITLE_KEY,
          file_url: jsonStr,
          file_type: 'json',
        },
      ]);
    }
  } catch (err) {
    console.warn('Erro ao salvar leituras pré-aula no Supabase:', err);
  }
}

const ANNOUNCEMENTS_LAST_FETCH_KEY = 'lms_announcements_last_fetch_ts';
const ANNOUNCEMENTS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos de cache

/**
 * Busca leituras pré-aula na nuvem (Supabase) e atualiza o estado local
 */
export async function fetchAnnouncementsFromCloud(force: boolean = false): Promise<AvisoLeituraPreAula[]> {
  if (typeof window === 'undefined') return INITIAL_ANNOUNCEMENTS;

  const lastFetch = Number(localStorage.getItem(ANNOUNCEMENTS_LAST_FETCH_KEY) || 0);
  const now = Date.now();
  if (!force && now - lastFetch < ANNOUNCEMENTS_CACHE_TTL_MS) {
    return getAnnouncements();
  }

  try {
    const { data, error } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', CLOUD_TITLE_KEY)
      .limit(1);

    localStorage.setItem(ANNOUNCEMENTS_LAST_FETCH_KEY, String(Date.now()));

    if (!error && data && data.length > 0 && data[0].file_url) {
      try {
        const cloudList: AvisoLeituraPreAula[] = JSON.parse(data[0].file_url);
        if (Array.isArray(cloudList) && cloudList.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudList));
          window.dispatchEvent(new CustomEvent('lms_announcements_updated', { detail: cloudList }));
          return cloudList;
        }
      } catch (e) {}
    }
  } catch (err) {
    console.warn('Erro ao buscar leituras pré-aula da nuvem:', err);
  }
  return getAnnouncements();
}

// Configura listeners automáticos para sincronização entre abas
if (typeof window !== 'undefined') {
  // Sincronização entre abas do mesmo navegador
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        window.dispatchEvent(new CustomEvent('lms_announcements_updated', { detail: parsed }));
      } catch (err) {}
    }
  });

  // 4. Polling inteligente a cada 10 minutos com economia máxima de tráfego
  setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      fetchAnnouncementsFromCloud();
    }
  }, 600000); // 10 minutos
}

export function addAnnouncement(
  newAviso: Omit<AvisoLeituraPreAula, 'id' | 'created_at'>
): AvisoLeituraPreAula {
  const fullAviso: AvisoLeituraPreAula = {
    ...newAviso,
    id: `aviso-${Date.now()}`,
    created_at: new Date().toISOString(),
    is_archived: false,
  };

  const current = getAnnouncements();
  const updated = [fullAviso, ...current];
  saveAnnouncements(updated);
  return fullAviso;
}

export function deleteAnnouncement(id: string): void {
  const current = getAnnouncements();
  const updated = current.filter((item) => item.id !== id);
  saveAnnouncements(updated);
}

export function archiveAnnouncement(id: string): void {
  const current = getAnnouncements();
  const updated = current.map((item) =>
    item.id === id
      ? { ...item, is_archived: true, archived_at: new Date().toISOString() }
      : item
  );
  saveAnnouncements(updated);
}

export function unarchiveAnnouncement(id: string): void {
  const current = getAnnouncements();
  const updated = current.map((item) =>
    item.id === id
      ? { ...item, is_archived: false, archived_at: undefined }
      : item
  );
  saveAnnouncements(updated);
}

export function getAnnouncementsForDisciplinas(
  disciplinaIds?: string[],
  includeArchived: boolean = true
): AvisoLeituraPreAula[] {
  const all = getAnnouncements();
  let filtered = all;

  if (disciplinaIds !== undefined) {
    if (disciplinaIds.length === 0) return [];
    const set = new Set(disciplinaIds);
    filtered = filtered.filter((a) => set.has(a.disciplina_id));
  }

  if (!includeArchived) {
    filtered = filtered.filter((a) => !a.is_archived);
  }

  return filtered;
}

export function updateAnnouncement(updated: AvisoLeituraPreAula): void {
  const current = getAnnouncements();
  const next = current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item));
  saveAnnouncements(next);
}

export function togglePinAnnouncement(id: string): void {
  const current = getAnnouncements();
  const updated = current.map((item) =>
    item.id === id ? { ...item, is_pinned: !item.is_pinned } : item
  );
  saveAnnouncements(updated);
}

// ==========================================
// CONTROLE DE LEITURAS LIDAS PELO ALUNO (PER-USER)
// ==========================================

export function getReadAnnouncementIds(userEmail: string): string[] {
  if (typeof window === 'undefined' || !userEmail) return [];
  try {
    const key = `${READ_STORAGE_PREFIX}${userEmail.toLowerCase().trim()}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function markAnnouncementAsRead(userEmail: string, announcementId: string): void {
  if (typeof window === 'undefined' || !userEmail || !announcementId) return;
  try {
    const current = getReadAnnouncementIds(userEmail);
    if (!current.includes(announcementId)) {
      const updated = [...current, announcementId];
      const key = `${READ_STORAGE_PREFIX}${userEmail.toLowerCase().trim()}`;
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('lms_read_announcements_updated', {
          detail: { email: userEmail, readIds: updated },
        })
      );
    }
  } catch (e) {
    console.error('Erro ao marcar anúncio como lido:', e);
  }
}

export function unmarkAnnouncementAsRead(userEmail: string, announcementId: string): void {
  if (typeof window === 'undefined' || !userEmail || !announcementId) return;
  try {
    const current = getReadAnnouncementIds(userEmail);
    const updated = current.filter((id) => id !== announcementId);
    const key = `${READ_STORAGE_PREFIX}${userEmail.toLowerCase().trim()}`;
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent('lms_read_announcements_updated', {
        detail: { email: userEmail, readIds: updated },
      })
    );
  } catch (e) {
    console.error('Erro ao desmarcar anúncio lido:', e);
  }
}

export function formatAnnouncementForWhatsApp(aviso: AvisoLeituraPreAula): string {
  const roleLabel = aviso.author_role === 'professor' ? 'Docente' : aviso.author_role === 'monitor' ? 'Monitor(a)' : 'Coordenação';
  
  let headerLabel = 'LEITURA PRÉ-AULA';
  let icon = '📖';
  if (aviso.category === 'durante_aula') {
    headerLabel = 'LINK COMPARTILHADO EM AULA AO VIVO';
    icon = '🔴';
  } else if (aviso.category === 'complementar') {
    headerLabel = 'MATERIAL COMPLEMENTAR';
    icon = '📌';
  }

  const messageBlock = aviso.message ? `💬 "${aviso.message}"\n\n` : '';
  const dateBlock = aviso.target_date ? `🗓️ *Referência:* ${aviso.target_date}\n` : '';

  return `${icon} *${headerLabel} • ${aviso.disciplina_name.toUpperCase()}*\n` +
    `👨‍🏫 *${aviso.author_name}* (${roleLabel})\n\n` +
    messageBlock +
    `🔗 *Título / Recurso:* ${aviso.title}\n` +
    dateBlock +
    `🌐 *Link de Acesso:* ${aviso.link_url}\n\n` +
    `🏛️ *Koinonia LMS • Seminário Teológico*\n` +
    `📍 Acessar no LMS: https://koinonialms.vercel.app`;
}
