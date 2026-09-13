import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetEmail, adminEmail, reason } = body;

    if (!targetEmail || typeof targetEmail !== 'string' || !targetEmail.includes('@')) {
      return NextResponse.json({ error: 'E-mail de destino inválido' }, { status: 400 });
    }

    const normTarget = targetEmail.toLowerCase().trim();
    const normAdmin = (adminEmail || '').toLowerCase().trim();

    // 1. Proteção de Administradores Principais (Imunidade)
    if (normTarget === 'sacrasub@gmail.com' || normTarget === 'riffocristianmision@gmail.com') {
      return NextResponse.json(
        { error: 'Não é permitido banir administradores do sistema.' },
        { status: 403 }
      );
    }

    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: 'Configuração do Supabase Service Role não disponível.' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 2. Validação simples de permissão do solicitante
    const isMasterAdmin = normAdmin === 'sacrasub@gmail.com' || normAdmin === 'riffocristianmision@gmail.com' || normAdmin === 'sacrasub03@gmail.com';
    const isConfigAdmin = INITIAL_AUTHORIZED_USERS[normAdmin]?.roles?.includes('admin');

    if (!isMasterAdmin && !isConfigAdmin) {
      return NextResponse.json({ error: 'Acesso não autorizado para esta operação.' }, { status: 403 });
    }

    // 3. Exclui do Supabase Auth (invalida instantaneamente todos os tokens e sessões do Google OAuth)
    let authDeleted = false;
    try {
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const authUser = listData?.users?.find((u) => u.email?.toLowerCase().trim() === normTarget);
      if (authUser) {
        await supabaseAdmin.auth.admin.deleteUser(authUser.id);
        authDeleted = true;
      }
    } catch (authErr) {
      console.warn('[Admin Ban] Falha ao excluir do Auth:', authErr);
    }

    // 4. Remove de public.users
    try {
      await supabaseAdmin.from('users').delete().eq('email', normTarget);
    } catch (_) {}

    // 5. Expurga sessões anômalas da telemetria
    let sessionsRemoved = 0;
    try {
      const { data: delSess } = await supabaseAdmin
        .from('lms_user_sessions')
        .delete()
        .eq('user_email', normTarget)
        .select('id');
      sessionsRemoved = delSess?.length || 0;
    } catch (_) {}

    // 6. Expurga eventos da telemetria
    try {
      await supabaseAdmin.from('lms_analytics_events').delete().eq('user_email', normTarget);
    } catch (_) {}

    // 7. Adiciona à Blacklist Permanente da nuvem (system_rbac_revoked_users)
    try {
      const { data: revRow } = await supabaseAdmin
        .from('materiais')
        .select('id, file_url')
        .eq('title', 'system_rbac_revoked_users')
        .limit(1);

      let revokedList: string[] = [];
      let rowId: string | null = null;

      if (revRow && revRow.length > 0) {
        rowId = revRow[0].id;
        if (revRow[0].file_url) {
          try {
            revokedList = JSON.parse(revRow[0].file_url);
          } catch (_) {}
        }
      }

      if (!Array.isArray(revokedList)) revokedList = [];
      if (!revokedList.includes(normTarget)) {
        revokedList.push(normTarget);
        const payloadStr = JSON.stringify(revokedList);
        if (rowId) {
          await supabaseAdmin.from('materiais').update({ file_url: payloadStr }).eq('id', rowId);
        } else {
          await supabaseAdmin.from('materiais').insert({
            title: 'system_rbac_revoked_users',
            file_url: payloadStr,
            is_native_upload: false,
          });
        }
      }
    } catch (e) {
      console.warn('[Admin Ban] Erro ao gravar blacklist:', e);
    }

    // 8. Remove de system_rbac_users e system_rbac_pending_requests
    try {
      // Remove de pendentes
      const { data: pendRow } = await supabaseAdmin
        .from('materiais')
        .select('id, file_url')
        .eq('title', 'system_rbac_pending_requests')
        .limit(1);

      if (pendRow && pendRow.length > 0 && pendRow[0].file_url) {
        let reqs = JSON.parse(pendRow[0].file_url);
        if (Array.isArray(reqs)) {
          const filtered = reqs.filter((r: any) => r.email?.toLowerCase().trim() !== normTarget);
          await supabaseAdmin.from('materiais').update({ file_url: JSON.stringify(filtered) }).eq('id', pendRow[0].id);
        }
      }

      // Remove de autorizados na nuvem
      const { data: usersRow } = await supabaseAdmin
        .from('materiais')
        .select('id, file_url')
        .eq('title', 'system_rbac_users')
        .limit(1);

      if (usersRow && usersRow.length > 0 && usersRow[0].file_url) {
        let uMap = JSON.parse(usersRow[0].file_url);
        if (uMap && typeof uMap === 'object') {
          delete uMap[normTarget];
          await supabaseAdmin.from('materiais').update({ file_url: JSON.stringify(uMap) }).eq('id', usersRow[0].id);
        }
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `Conta ${normTarget} banida com sucesso. Sessões e tokens invalidados.`,
      authDeleted,
      sessionsRemoved,
    });
  } catch (err: any) {
    console.error('[API Ban User] Erro:', err);
    return NextResponse.json({ error: err?.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
