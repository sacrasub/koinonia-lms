import { supabase } from '@/lib/supabaseClient';
import { AbntArticleDocument, AbntArticleSummary } from '@/types/abntArticle';
import { auditAbntArticle } from '@/lib/abntFormatter';

const STORAGE_PREFIX = 'lms_abnt_articles_v1_';

export function normalizeAbntUserEmail(userEmail?: string): string {
  const clean = (userEmail || '').toLowerCase().trim();
  return clean || 'aluno_padrao';
}

function getStorageKey(userEmail?: string): string {
  return `${STORAGE_PREFIX}${normalizeAbntUserEmail(userEmail)}`;
}

export function getLocalAbntArticles(userEmail?: string): AbntArticleDocument[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userEmail));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item === 'object' && typeof item.id === 'string')
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
  } catch (err) {
    console.warn('[ABNT Service] Erro ao ler artigos locais:', err);
    return [];
  }
}

export function saveLocalAbntArticles(userEmail: string | undefined, list: AbntArticleDocument[]): void {
  if (typeof window === 'undefined') return;
  try {
    const sorted = [...list].sort(
      (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );
    localStorage.setItem(getStorageKey(userEmail), JSON.stringify(sorted));
  } catch (err) {
    console.warn('[ABNT Service] Erro ao salvar artigos no localStorage:', err);
  }
}

export function upsertLocalAbntArticle(
  userEmail: string | undefined,
  doc: AbntArticleDocument
): AbntArticleDocument[] {
  const current = getLocalAbntArticles(userEmail);
  const exists = current.some((item) => item.id === doc.id);
  const next = exists
    ? current.map((item) => (item.id === doc.id ? doc : item))
    : [doc, ...current];
  saveLocalAbntArticles(userEmail, next);
  return next;
}

export function deleteLocalAbntArticle(
  userEmail: string | undefined,
  articleId: string
): AbntArticleDocument[] {
  const current = getLocalAbntArticles(userEmail);
  const next = current.filter((item) => item.id !== articleId);
  saveLocalAbntArticles(userEmail, next);
  return next;
}

function isMissingTableError(error: any): boolean {
  if (!error) return false;
  const msg = String(error.message || error.details || error.hint || '').toLowerCase();
  const code = String(error.code || '');
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table') ||
    msg.includes('relation')
  );
}

/**
 * Fallback seguro em `student_sync.portal_profile.abntArticles` quando a migration
 * dedicada `lms_abnt_articles` ainda não foi executada no painel do Supabase.
 */
async function syncFromStudentSyncFallback(
  email: string,
  localList: AbntArticleDocument[]
): Promise<{ articles: AbntArticleDocument[]; source: 'fallback' | 'local'; updatedCount: number }> {
  try {
    const { data, error } = await supabase
      .from('student_sync')
      .select('portal_profile')
      .eq('email', email)
      .limit(1);

    if (error || !data || data.length === 0) {
      return { articles: localList, source: 'local', updatedCount: 0 };
    }

    const remoteProfile = data[0]?.portal_profile || {};
    const remoteArticles: AbntArticleDocument[] = Array.isArray(remoteProfile.abntArticles)
      ? remoteProfile.abntArticles
      : [];

    if (remoteArticles.length === 0) {
      return { articles: localList, source: 'fallback', updatedCount: 0 };
    }

    const mergedMap = new Map<string, AbntArticleDocument>();
    for (const item of localList) mergedMap.set(item.id, item);

    let updatedCount = 0;
    for (const remote of remoteArticles) {
      if (!remote?.id) continue;
      const local = mergedMap.get(remote.id);
      const remoteTs = new Date(remote.updatedAt || 0).getTime();
      const localTs = new Date(local?.updatedAt || 0).getTime();
      if (!local || remoteTs > localTs) {
        mergedMap.set(remote.id, { ...remote, lastCloudSyncAt: new Date().toISOString() });
        updatedCount++;
      }
    }

    const merged = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );
    saveLocalAbntArticles(email, merged);
    return { articles: merged, source: 'fallback', updatedCount };
  } catch {
    return { articles: localList, source: 'local', updatedCount: 0 };
  }
}

async function saveToStudentSyncFallback(
  email: string,
  allArticles: AbntArticleDocument[]
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('student_sync')
      .select('portal_profile')
      .eq('email', email)
      .limit(1);

    const existingProfile = (data && data[0]?.portal_profile) || {};
    const trimmedArticles = allArticles.slice(0, 12);

    const { error } = await supabase.from('student_sync').upsert(
      {
        email,
        portal_profile: {
          ...existingProfile,
          abntArticles: trimmedArticles,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );

    return !error;
  } catch {
    return false;
  }
}

/**
 * Sincroniza artigos do usuário com Zero-Waste Egress:
 * 1) Lê somente metadados na tabela `lms_abnt_articles` (projeção estrita sem `content_json`);
 * 2) Baixa `content_json` pontualmente apenas para itens ausentes localmente ou mais recentes na nuvem.
 */
export async function syncAbntArticlesFromCloud(userEmail?: string): Promise<{
  articles: AbntArticleDocument[];
  source: 'table' | 'fallback' | 'local';
  updatedCount: number;
}> {
  const email = normalizeAbntUserEmail(userEmail);
  const localList = getLocalAbntArticles(email);
  if (!email || email === 'aluno_padrao') {
    return { articles: localList, source: 'local', updatedCount: 0 };
  }

  try {
    const { data: summaries, error } = await supabase
      .from('lms_abnt_articles')
      .select('id, user_email, title, template_type, disciplina_id, disciplina_name, is_locked, word_count, estimated_pages, updated_at')
      .eq('user_email', email)
      .order('updated_at', { ascending: false });

    if (error) {
      if (isMissingTableError(error)) {
        return await syncFromStudentSyncFallback(email, localList);
      }
      return { articles: localList, source: 'local', updatedCount: 0 };
    }

    const remoteSummaries = (summaries || []) as AbntArticleSummary[];
    if (remoteSummaries.length === 0) {
      return { articles: localList, source: 'table', updatedCount: 0 };
    }

    const localMap = new Map<string, AbntArticleDocument>(localList.map((a) => [a.id, a]));
    const staleIds = remoteSummaries
      .filter((sum) => {
        const local = localMap.get(sum.id);
        if (!local) return true;
        return new Date(sum.updated_at).getTime() > new Date(local.updatedAt || 0).getTime() + 1000;
      })
      .map((s) => s.id);

    let updatedCount = 0;
    if (staleIds.length > 0) {
      const { data: fullRows, error: fetchErr } = await supabase
        .from('lms_abnt_articles')
        .select('id, content_json, updated_at')
        .eq('user_email', email)
        .in('id', staleIds);

      if (!fetchErr && Array.isArray(fullRows)) {
        for (const row of fullRows) {
          const parsed = row.content_json as AbntArticleDocument | null;
          if (parsed && parsed.id) {
            localMap.set(parsed.id, {
              ...parsed,
              updatedAt: row.updated_at || parsed.updatedAt,
              lastCloudSyncAt: new Date().toISOString(),
            });
            updatedCount++;
          }
        }
      }
    }

    const merged = Array.from(localMap.values()).sort(
      (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );
    saveLocalAbntArticles(email, merged);
    return { articles: merged, source: 'table', updatedCount };
  } catch (err) {
    console.warn('[ABNT Service] Falha ao sincronizar artigos da nuvem:', err);
    return { articles: localList, source: 'local', updatedCount: 0 };
  }
}

/**
 * Grava pontualmente na nuvem sem retorno de payload (0 bytes de Egress).
 */
export async function saveAbntArticleToCloud(
  userEmail: string | undefined,
  doc: AbntArticleDocument
): Promise<{ ok: boolean; source: 'table' | 'fallback' | 'local'; error?: string }> {
  const email = normalizeAbntUserEmail(userEmail || doc.userEmail);
  const allLocal = upsertLocalAbntArticle(email, doc);

  if (!email || email === 'aluno_padrao') {
    return { ok: true, source: 'local' };
  }

  const audit = auditAbntArticle(doc);
  const cleanDoc: AbntArticleDocument = {
    ...doc,
    userEmail: email,
    lastCloudSyncAt: new Date().toISOString(),
  };

  try {
    const { error } = await supabase.from('lms_abnt_articles').upsert(
      {
        id: cleanDoc.id,
        user_email: email,
        title: cleanDoc.title || 'Sem título',
        template_type: cleanDoc.templateType,
        disciplina_id: cleanDoc.disciplinaId || null,
        disciplina_name: cleanDoc.disciplinaName || null,
        is_locked: Boolean(cleanDoc.isLocked),
        word_count: audit.wordCount,
        estimated_pages: audit.estimatedPages,
        content_json: cleanDoc,
        updated_at: cleanDoc.updatedAt || new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (!error) {
      upsertLocalAbntArticle(email, cleanDoc);
      return { ok: true, source: 'table' };
    }

    if (isMissingTableError(error)) {
      const ok = await saveToStudentSyncFallback(email, allLocal);
      if (ok) upsertLocalAbntArticle(email, cleanDoc);
      return { ok, source: ok ? 'fallback' : 'local', error: ok ? undefined : error.message };
    }

    return { ok: false, source: 'local', error: error.message };
  } catch (err: any) {
    return { ok: false, source: 'local', error: err?.message || 'Erro ao salvar na nuvem' };
  }
}

export async function deleteAbntArticleEverywhere(
  userEmail: string | undefined,
  articleId: string
): Promise<AbntArticleDocument[]> {
  const email = normalizeAbntUserEmail(userEmail);
  const nextLocal = deleteLocalAbntArticle(email, articleId);

  if (!email || email === 'aluno_padrao') return nextLocal;

  try {
    const { error } = await supabase
      .from('lms_abnt_articles')
      .delete()
      .eq('id', articleId)
      .eq('user_email', email);

    if (error && isMissingTableError(error)) {
      await saveToStudentSyncFallback(email, nextLocal);
    }
  } catch {
    // Mantém remoção local garantida
  }

  return nextLocal;
}

export function exportAbntArticleBackupJson(doc: AbntArticleDocument): string {
  return JSON.stringify(
    {
      schema: 'koinonia-lms-abnt-v1',
      exportedAt: new Date().toISOString(),
      article: doc,
    },
    null,
    2
  );
}

export function parseImportedAbntArticleJson(
  rawText: string,
  userEmail: string
): AbntArticleDocument {
  const parsed = JSON.parse(rawText);
  const candidate: AbntArticleDocument = parsed?.article || parsed;
  if (!candidate || typeof candidate !== 'object' || !Array.isArray(candidate.sections)) {
    throw new Error('Arquivo JSON inválido: estrutura de artigo ABNT não reconhecida.');
  }
  const now = new Date().toISOString();
  return {
    ...candidate,
    id: `abnt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    userEmail: normalizeAbntUserEmail(userEmail),
    isLocked: false,
    updatedAt: now,
    createdAt: candidate.createdAt || now,
  };
}
