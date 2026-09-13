import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Carrega .env.local caso não esteja injetado
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val.replace(/\\n/g, '\n');
      }
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('ERRO: Credenciais SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL ausentes no .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const MALICIOUS_EMAIL = 'pu1mpf@gmail.com';

async function banAndPurgeMaliciousUser() {
  console.log(`[BAN & PURGE] Iniciando banimento da conta maliciosa: ${MALICIOUS_EMAIL}`);

  // 1. Localiza e Remove no Supabase Auth (Revoga todos os tokens e sessões imediatamente)
  try {
    const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) {
      console.error('[Supabase Auth] Erro ao listar usuários:', listErr);
    } else {
      const targetUser = listData?.users?.find(u => u.email?.toLowerCase().trim() === MALICIOUS_EMAIL);
      if (targetUser) {
        console.log(`[Supabase Auth] Usuário encontrado: ID ${targetUser.id}. Excluindo e invalidando tokens...`);
        const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(targetUser.id);
        if (delErr) {
          console.error('[Supabase Auth] Erro ao excluir usuário:', delErr);
        } else {
          console.log(`[Supabase Auth] ✓ Usuário ${MALICIOUS_EMAIL} excluído do Auth com sucesso! Todos os tokens foram revogados.`);
        }
      } else {
        console.log(`[Supabase Auth] Usuário não encontrado na lista de Auth (já excluído ou inexistente).`);
      }
    }
  } catch (authErr) {
    console.error('[Supabase Auth] Exceção ao processar Auth:', authErr);
  }

  // 2. Remove de public.users
  try {
    const { data: delUsers, error: uErr } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('email', MALICIOUS_EMAIL)
      .select();
    console.log(`[public.users] Registros removidos:`, delUsers?.length || 0, uErr || '');
  } catch (uErr) {
    console.error('[public.users] Erro ao remover de users:', uErr);
  }

  // 3. Expurga sessões anômalas de lms_user_sessions
  try {
    const { data: delSessions, error: sErr } = await supabaseAdmin
      .from('lms_user_sessions')
      .delete()
      .eq('user_email', MALICIOUS_EMAIL)
      .select('id, session_token');
    console.log(`[lms_user_sessions] ✓ ${delSessions?.length || 0} sessões anômalas expurgadas com sucesso:`, delSessions?.map(s => s.session_token));
    if (sErr) console.error('[lms_user_sessions] Erro ao deletar sessões:', sErr);
  } catch (sErr) {
    console.error('[lms_user_sessions] Erro:', sErr);
  }

  // 4. Expurga eventos anômalos de lms_analytics_events
  try {
    const { data: delEvents, error: eErr } = await supabaseAdmin
      .from('lms_analytics_events')
      .delete()
      .eq('user_email', MALICIOUS_EMAIL)
      .select('id, category, action');
    console.log(`[lms_analytics_events] ✓ ${delEvents?.length || 0} eventos anômalos expurgados:`, delEvents?.map(e => e.action));
    if (eErr) console.error('[lms_analytics_events] Erro ao deletar eventos:', eErr);
  } catch (eErr) {
    console.error('[lms_analytics_events] Erro:', eErr);
  }

  // 5. Adiciona pu1mpf@gmail.com à lista de revogados permanentes (system_rbac_revoked_users)
  try {
    const { data: revRow } = await supabaseAdmin
      .from('materiais')
      .select('id, file_url')
      .eq('title', 'system_rbac_revoked_users')
      .limit(1);

    let revokedList = [];
    let rowId = null;

    if (revRow && revRow.length > 0) {
      rowId = revRow[0].id;
      if (revRow[0].file_url) {
        try {
          revokedList = JSON.parse(revRow[0].file_url);
        } catch (_) {}
      }
    }

    if (!Array.isArray(revokedList)) revokedList = [];
    if (!revokedList.includes(MALICIOUS_EMAIL)) {
      revokedList.push(MALICIOUS_EMAIL);
      const payloadStr = JSON.stringify(revokedList);
      if (rowId) {
        await supabaseAdmin.from('materiais').update({ file_url: payloadStr }).eq('id', rowId);
      } else {
        await supabaseAdmin.from('materiais').insert({
          title: 'system_rbac_revoked_users',
          file_url: payloadStr,
          is_native_upload: false
        });
      }
      console.log(`[system_rbac_revoked_users] ✓ ${MALICIOUS_EMAIL} adicionado à Blacklist Permanente da nuvem.`);
    } else {
      console.log(`[system_rbac_revoked_users] ${MALICIOUS_EMAIL} já constava na Blacklist.`);
    }
  } catch (revErr) {
    console.error('[system_rbac_revoked_users] Erro ao atualizar blacklist:', revErr);
  }

  // 6. Remove de system_rbac_pending_requests e system_rbac_users caso conste
  try {
    const { data: pendRow } = await supabaseAdmin
      .from('materiais')
      .select('id, file_url')
      .eq('title', 'system_rbac_pending_requests')
      .limit(1);

    if (pendRow && pendRow.length > 0 && pendRow[0].file_url) {
      let reqs = JSON.parse(pendRow[0].file_url);
      if (Array.isArray(reqs)) {
        const filtered = reqs.filter(r => r.email?.toLowerCase().trim() !== MALICIOUS_EMAIL);
        if (filtered.length !== reqs.length) {
          await supabaseAdmin.from('materiais').update({ file_url: JSON.stringify(filtered) }).eq('id', pendRow[0].id);
          console.log(`[system_rbac_pending_requests] ✓ Solicitação pendente do invasor expurgada.`);
        }
      }
    }
  } catch (_) {}

  console.log('[BAN & PURGE] Operação finalizada com sucesso absoluto.');
}

banAndPurgeMaliciousUser().catch(console.error);
