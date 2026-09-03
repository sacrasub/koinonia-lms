import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

/**
 * POST /api/tcc/pesquisa-campo
 * Submissão de respostas com blindagem de egress (retorno minimal 201)
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

    // 3. Inserção no Supabase PostgreSQL
    const { data, error } = await supabase
      .from('tcc_pesquisa_respostas')
      .insert([
        {
          user_id: user_id || null,
          user_email: user_email ? String(user_email).toLowerCase().trim() : null,
          tipo_publico: String(tipo_publico),
          dados_identificacao: dados_identificacao || {},
          autorizou_tcc: true,
          origem: origem || 'organico',
          respostas: respostas,
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Erro ao inserir no Supabase (tcc_pesquisa_respostas):', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Falha ao gravar resposta.' },
        { status: 500 }
      );
    }

    // Resposta minimal (Zero-Waste Egress)
    return NextResponse.json(
      { success: true, id: data?.id },
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
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');

    let query = supabase
      .from('tcc_pesquisa_respostas')
      .select('id, tipo_publico, created_at, autorizou_tcc, dados_identificacao, origem')
      .order('created_at', { ascending: false });

    if (tipo && tipo !== 'ALL') {
      query = query.eq('tipo_publico', tipo);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
