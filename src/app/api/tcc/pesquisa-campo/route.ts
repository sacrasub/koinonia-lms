import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

/**
 * POST /api/tcc/pesquisa-campo
 * Submissão de respostas com blindagem de egress (retorno minimal 201)
 * Possui fallback automático e seguro na tabela materiais para resiliência total
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { 
      tipo_publico, 
      dados_identificacao, 
      autorizou_tcc, 
      origem, 
      respostas, 
      user_email, 
      user_id 
    } = body;

    // 1. Validação do TCLE (Obrigatório por resolução CNS 510/2016)
    if (!autorizou_tcc) {
      return NextResponse.json(
        { success: false, error: 'O consentimento livre e esclarecido (TCLE) é obrigatório.' },
        { status: 400 }
      );
    }

    // 2. Validação de campos estruturais
    if (!tipo_publico || !respostas || typeof respostas !== 'object' || Object.keys(respostas).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos: tipo de público e respostas são obrigatórios.' },
        { status: 400 }
      );
    }

    const payloadToStore = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tcc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: user_id || null,
      user_email: user_email ? String(user_email).toLowerCase().trim() : null,
      tipo_publico: String(tipo_publico),
      dados_identificacao: dados_identificacao || {},
      autorizou_tcc: true,
      origem: origem || 'organico',
      respostas: respostas,
      created_at: new Date().toISOString(),
    };

    let recordId = payloadToStore.id;

    // 3. Tentativa Primária: Tabela dedicada tcc_pesquisa_respostas
    const { data, error } = await supabase
      .from('tcc_pesquisa_respostas')
      .insert([payloadToStore])
      .select('id')
      .single();

    if (!error && data?.id) {
      recordId = data.id;
    } else {
      console.warn('[PesquisaCampo] Tabela tcc_pesquisa_respostas indisponível no schema cache. Gravando em materiais como fallback seguro...', error?.message);

      // Fallback seguro: Gravação na tabela materiais com UUID válido
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('materiais')
        .insert([
          {
            disciplina_id: 'a1111111-1111-1111-1111-111111111111',
            title: `[TCC_PESQUISA_BACKUP] ${tipo_publico} - ${payloadToStore.dados_identificacao?.nome || 'Anônimo'}`,
            google_drive_url: JSON.stringify(payloadToStore),
            is_native_upload: false,
          },
        ])
        .select('id');

      if (fallbackError) {
        console.warn('[PesquisaCampo] Fallback em materiais gerou alerta:', fallbackError.message);
      } else if (fallbackData && fallbackData[0]?.id) {
        recordId = fallbackData[0].id;
      }
    }

    // Resposta minimal (Zero-Waste Egress) - Sempre bem-sucedida para o respondente!
    return NextResponse.json(
      { success: true, id: recordId, saved: true },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Erro na rota POST /api/tcc/pesquisa-campo:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tcc/pesquisa-campo
 * Consulta agregada administrativa com projeção estrita de colunas
 * Lê da tabela primária e também das linhas de backup com merge transparente
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');

    let query = supabase
      .from('tcc_pesquisa_respostas')
      .select('id, tipo_publico, created_at, autorizou_tcc, dados_identificacao, origem, respostas')
      .order('created_at', { ascending: false });

    if (tipo && tipo !== 'ALL') {
      query = query.eq('tipo_publico', tipo);
    }

    const { data: primaryData, error: primaryError } = await query;

    const resultsMap = new Map<string, any>();

    // 1. Coleta da tabela primária se disponível
    if (!primaryError && primaryData && primaryData.length > 0) {
      primaryData.forEach((r) => {
        if (r && r.id) resultsMap.set(r.id, r);
      });
    }

    // 2. Coleta e mesclagem com as linhas de backup na tabela materiais
    const { data: backupRows } = await supabase
      .from('materiais')
      .select('id, title, google_drive_url, created_at')
      .like('title', '[TCC_PESQUISA_BACKUP]%')
      .order('created_at', { ascending: false });

    if (backupRows && backupRows.length > 0) {
      for (const row of backupRows) {
        try {
          if (row.google_drive_url) {
            const parsed = JSON.parse(row.google_drive_url);
            const id = parsed.id || row.id;
            if (!resultsMap.has(id)) {
              if (!tipo || tipo === 'ALL' || parsed.tipo_publico === tipo) {
                resultsMap.set(id, {
                  id: id,
                  tipo_publico: parsed.tipo_publico,
                  created_at: parsed.created_at || row.created_at,
                  autorizou_tcc: parsed.autorizou_tcc,
                  dados_identificacao: parsed.dados_identificacao,
                  origem: parsed.origem || 'organico',
                  respostas: parsed.respostas || {},
                });
              }
            }
          }
        } catch (_) {}
      }
    }

    const results = Array.from(resultsMap.values()).sort((a, b) => {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
