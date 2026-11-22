import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';
import {
  DEFAULT_VOICESTUDIO_SETTINGS,
  VoiceStudioPlatformDefaults,
  getFactoryPlatformDefaults,
  sanitizePlatformVoiceDefaults,
} from '@/services/voiceStudioService';

export const dynamic = 'force-dynamic';

const PLATFORM_DEFAULTS_TITLE = 'system_voicestudio_platform_defaults';
const MASTER_ADMINS = new Set([
  'sacrasub@gmail.com',
  'sacrasub03@gmail.com',
  'riffocristianmision@gmail.com',
]);

function getSupabaseClients() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const adminClient: SupabaseClient | null =
    url && serviceKey
      ? createClient(url, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : null;

  const readClient: SupabaseClient | null =
    adminClient ||
    (url && anonKey
      ? createClient(url, anonKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : null);

  return { adminClient, readClient };
}

async function isVerifiedAdmin(supabaseAdmin: SupabaseClient, email: string): Promise<boolean> {
  const norm = email.toLowerCase().trim();
  if (!norm) return false;
  if (MASTER_ADMINS.has(norm)) return true;
  if (INITIAL_AUTHORIZED_USERS[norm]?.roles?.includes('admin')) return true;

  try {
    const { data: userRow } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('email', norm)
      .limit(1);
    if (userRow && userRow.length > 0 && userRow[0].role === 'admin') {
      return true;
    }
  } catch {
    // continua para verificar lista RBAC
  }

  try {
    const { data: rbacRow } = await supabaseAdmin
      .from('materiais')
      .select('file_url')
      .eq('title', 'system_rbac_users')
      .limit(1);
    if (rbacRow && rbacRow.length > 0 && rbacRow[0].file_url) {
      const parsed = JSON.parse(rbacRow[0].file_url) as Record<string, { roles?: string[]; defaultRole?: string }>;
      const entry = parsed?.[norm];
      if (entry && (entry.roles?.includes('admin') || entry.defaultRole === 'admin')) {
        return true;
      }
    }
  } catch {
    // ignora
  }

  return false;
}

export async function GET(req: NextRequest) {
  const fresh = req.nextUrl.searchParams.get('fresh') === '1';
  const cacheHeader = fresh
    ? 'no-store'
    : 'public, s-maxage=300, stale-while-revalidate=3600';

  const factory = getFactoryPlatformDefaults();
  const { readClient } = getSupabaseClients();

  if (!readClient) {
    return NextResponse.json(
      { ok: true, source: 'factory', defaults: factory },
      { headers: { 'Cache-Control': cacheHeader } }
    );
  }

  try {
    const { data, error } = await readClient
      .from('materiais')
      .select('file_url')
      .eq('title', PLATFORM_DEFAULTS_TITLE)
      .limit(1);

    if (!error && data && data.length > 0 && data[0].file_url) {
      const parsed = JSON.parse(data[0].file_url) as Partial<VoiceStudioPlatformDefaults>;
      if (parsed && typeof parsed === 'object') {
        const defaults: VoiceStudioPlatformDefaults = {
          version: Number(parsed.version) || 1,
          updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
          updatedBy:
            typeof parsed.updatedBy === 'string'
              ? parsed.updatedBy
              : 'Administração Koinonia',
          settings: sanitizePlatformVoiceDefaults(parsed.settings || parsed),
        };
        return NextResponse.json(
          { ok: true, source: 'cloud', defaults },
          { headers: { 'Cache-Control': cacheHeader } }
        );
      }
    }
  } catch (err) {
    console.warn('[VoiceStudio Defaults] Erro ao consultar padrão global:', err);
  }

  return NextResponse.json(
    {
      ok: true,
      source: 'factory',
      defaults: {
        ...factory,
        settings: sanitizePlatformVoiceDefaults(DEFAULT_VOICESTUDIO_SETTINGS),
      },
    },
    { headers: { 'Cache-Control': cacheHeader } }
  );
}

export async function PUT(req: NextRequest) {
  try {
    const { adminClient } = getSupabaseClients();
    if (!adminClient) {
      return NextResponse.json(
        { error: 'Configuração de servidor Supabase indisponível.' },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) {
      return NextResponse.json(
        { error: 'Autenticação obrigatória para alterar o padrão global.' },
        { status: 401 }
      );
    }

    const { data: authData, error: authError } = await adminClient.auth.getUser(token);
    const verifiedEmail = authData?.user?.email?.toLowerCase().trim() || '';
    if (authError || !verifiedEmail) {
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada. Faça login novamente.' },
        { status: 401 }
      );
    }

    const admin = await isVerifiedAdmin(adminClient, verifiedEmail);
    if (!admin) {
      return NextResponse.json(
        { error: 'Apenas administradores podem atualizar o padrão global da plataforma.' },
        { status: 403 }
      );
    }

    const body = (await req.json().catch(() => null)) as {
      settings?: unknown;
      updatedByName?: string;
    } | null;

    if (!body || !body.settings || typeof body.settings !== 'object') {
      return NextResponse.json(
        { error: 'Objeto settings inválido para padrão global.' },
        { status: 400 }
      );
    }

    // Sanitiza e remove explicitamente credenciais locais (apiKey / sharePin nunca vão para o global)
    const sanitizedSettings = sanitizePlatformVoiceDefaults(body.settings);
    const record: VoiceStudioPlatformDefaults = {
      version: Date.now(),
      updatedAt: new Date().toISOString(),
      updatedBy: (typeof body.updatedByName === 'string' && body.updatedByName.trim()
        ? body.updatedByName.trim()
        : verifiedEmail
      ).slice(0, 120),
      settings: sanitizedSettings,
    };

    const serialized = JSON.stringify(record);
    const { data: existing, error: selectErr } = await adminClient
      .from('materiais')
      .select('id')
      .eq('title', PLATFORM_DEFAULTS_TITLE)
      .limit(1);

    if (selectErr) {
      throw selectErr;
    }

    if (existing && existing.length > 0) {
      const { error: updErr } = await adminClient
        .from('materiais')
        .update({ file_url: serialized })
        .eq('id', existing[0].id);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await adminClient.from('materiais').insert({
        title: PLATFORM_DEFAULTS_TITLE,
        file_url: serialized,
        is_native_upload: false,
      });
      if (insErr) throw insErr;
    }

    return NextResponse.json(
      { ok: true, defaults: record },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: unknown) {
    console.error('[VoiceStudio Defaults PUT] Erro:', err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Erro ao gravar padrão global do VoiceStudio.',
      },
      { status: 500 }
    );
  }
}
