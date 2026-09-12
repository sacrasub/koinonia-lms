import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { AccessRequest } from '@/lib/authConfig';

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
      observacao 
    } = body;

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
      // 3. Cria nova solicitação
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
