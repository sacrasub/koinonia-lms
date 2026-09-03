import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { AccessRequest } from '@/lib/authConfig';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, avatarUrl } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();

    // 1. Busca solicitações pendentes atuais na nuvem
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

    // 2. Verifica se já existe solicitação
    const existing = currentList.find((r) => r.email === normalized);
    if (existing) {
      return NextResponse.json({ success: true, request: existing, message: 'Solicitação já registrada.' });
    }

    // 3. Cria nova solicitação
    const newReq: AccessRequest = {
      id: `req_${Date.now()}`,
      email: normalized,
      name: name || normalized,
      avatarUrl: avatarUrl || undefined,
      requestedAt: new Date().toLocaleString('pt-BR'),
      status: 'pending',
    };

    currentList.push(newReq);
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

    return NextResponse.json({ success: true, request: newReq });
  } catch (error: any) {
    console.error('[API Request Access] Erro:', error);
    return NextResponse.json({ error: error?.message || 'Erro interno' }, { status: 500 });
  }
}
