import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { AccessRequest } from '@/lib/authConfig';
import { getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      email, 
      name, 
      googleName, 
      avatarUrl, 
      whatsapp, 
      turmaIdx, 
      turmaNome, 
      periodoNum, 
      periodoNome, 
      perfilSolicitado, 
      observacao,
      // Campos de Segurança Anti-Bot (Honeypot & CAPTCHA)
      b_security_code,
      website_hp,
      turnstileToken
    } = body;

    // ========================================================================
    // 1. VERIFICAÇÃO DE HONEYPOT (Detecta bots que preenchem inputs invisíveis)
    // ========================================================================
    if (b_security_code || website_hp) {
      console.warn(`[Anti-Bot Honeypot] Requisição automatizada barrada para o e-mail: ${email}`);
      return NextResponse.json(
        { error: 'Requisição inválida ou detectada como preenchimento automatizado.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();

    // ========================================================================
    // 2. VERIFICAÇÃO DE BLACKLIST DE CONTAS REVOGADAS / BANIDAS
    // ========================================================================
    try {
      const { data: revRow } = await supabase
        .from('materiais')
        .select('file_url')
        .eq('title', 'system_rbac_revoked_users')
        .limit(1);

      if (revRow && revRow.length > 0 && revRow[0].file_url) {
        const revokedList: string[] = JSON.parse(revRow[0].file_url);
        if (Array.isArray(revokedList) && revokedList.includes(normalized)) {
          return NextResponse.json(
            { error: 'Este e-mail foi desativado ou banido pela administração.' },
            { status: 403 }
          );
        }
      }
    } catch (_) {}

    // ========================================================================
    // 3. VERIFICAÇÃO DE CAPTCHA INVISÍVEL (Cloudflare Turnstile)
    // ========================================================================
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: 'Validação de segurança (CAPTCHA) obrigatória ausente.' },
          { status: 422 }
        );
      }

      try {
        const ip = getClientIp(req);
        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=${encodeURIComponent(turnstileSecret)}&response=${encodeURIComponent(turnstileToken)}&remoteip=${encodeURIComponent(ip)}`,
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          return NextResponse.json(
            { error: 'Falha na verificação de segurança do CAPTCHA. Tente novamente.' },
            { status: 400 }
          );
        }
      } catch (captchaErr) {
        console.warn('[CAPTCHA] Erro na validação com Cloudflare:', captchaErr);
      }
    }

    // ========================================================================
    // 4. PROCESSAMENTO DA SOLICITAÇÃO DE ACESSO
    // ========================================================================
    // 4.1 Busca solicitações pendentes atuais na nuvem
    const { data: reqRow, error: fetchErr } = await supabase
      .from('materiais')
      .select('id, file_url')
      .eq('title', 'system_rbac_pending_requests')
      .limit(1);

    let currentList: AccessRequest[] = [];
    let rowId: string | null = null;

    if (!fetchErr && reqRow && reqRow.length > 0) {
      rowId = reqRow[0].id;
      if (reqRow[0].file_url) {
        try {
          currentList = JSON.parse(reqRow[0].file_url);
        } catch (e) {}
      }
    }

    // 4.2 Verifica se já existe solicitação
    const existingIndex = currentList.findIndex((r) => r.email === normalized);
    let targetReq: AccessRequest;

    if (existingIndex >= 0) {
      // Atualiza a solicitação existente com os dados mais recentes
      currentList[existingIndex] = {
        ...currentList[existingIndex],
        name: name || currentList[existingIndex].name || normalized,
        googleName: googleName || currentList[existingIndex].googleName,
        avatarUrl: avatarUrl || currentList[existingIndex].avatarUrl,
        whatsapp: whatsapp || currentList[existingIndex].whatsapp,
        turmaIdx: turmaIdx !== undefined ? Number(turmaIdx) : currentList[existingIndex].turmaIdx,
        turmaNome: turmaNome || currentList[existingIndex].turmaNome,
        periodoNum: periodoNum !== undefined ? Number(periodoNum) : currentList[existingIndex].periodoNum,
        periodoNome: periodoNome || currentList[existingIndex].periodoNome,
        perfilSolicitado: perfilSolicitado || currentList[existingIndex].perfilSolicitado || 'aluno',
        observacao: observacao || currentList[existingIndex].observacao,
      };
      targetReq = currentList[existingIndex];
    } else {
      // 4.3 Cria nova solicitação com status pendente estrito
      targetReq = {
        id: `req_${Date.now()}`,
        email: normalized,
        name: name || normalized,
        googleName: googleName || undefined,
        avatarUrl: avatarUrl || undefined,
        requestedAt: new Date().toLocaleString('pt-BR'),
        status: 'pending',
        whatsapp: whatsapp || undefined,
        turmaIdx: turmaIdx !== undefined ? Number(turmaIdx) : undefined,
        turmaNome: turmaNome || undefined,
        periodoNum: periodoNum !== undefined ? Number(periodoNum) : undefined,
        periodoNome: periodoNome || undefined,
        perfilSolicitado: perfilSolicitado || 'aluno',
        observacao: observacao || undefined,
      };
      currentList.push(targetReq);
    }

    const payloadStr = JSON.stringify(currentList);

    if (rowId) {
      await supabase
        .from('materiais')
        .update({ file_url: payloadStr })
        .eq('id', rowId);
    } else {
      await supabase
        .from('materiais')
        .insert({ title: 'system_rbac_pending_requests', file_url: payloadStr, is_native_upload: false });
    }

    return NextResponse.json({ success: true, request: targetReq });
  } catch (error: any) {
    console.error('[API Request Access] Erro:', error);
    return NextResponse.json({ error: error?.message || 'Erro interno' }, { status: 500 });
  }
}

