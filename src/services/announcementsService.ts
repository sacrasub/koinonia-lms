import { AvisoLeituraPreAula } from '@/types';
import { supabase } from '@/lib/supabaseClient';

const STORAGE_KEY = 'lms_leituras_preaula_v1';
const READ_STORAGE_PREFIX = 'lms_read_announcements_';
const CLOUD_TITLE_KEY = 'lms_leituras_preaula_cloud';

export const INITIAL_ANNOUNCEMENTS: AvisoLeituraPreAula[] = [
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
