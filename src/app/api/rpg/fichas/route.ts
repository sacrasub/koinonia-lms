import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET /api/rpg/fichas?aluno_email=&sessao_id=
// Retorna a ficha PRIVADA do aluno incluindo instrucoes_secretas do SEU papel
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const aluno_email = searchParams.get('aluno_email');
  const sessao_id = searchParams.get('sessao_id');

  if (!aluno_email) {
    return NextResponse.json({ error: 'aluno_email é obrigatório' }, { status: 400 });
  }

  try {
    let query = supabase
      .from('rpg_fichas_aluno')
      .select(`
        *,
        papel:rpg_papeis (
          id,
          nome_papel,
          stakeholder_tipo,
          descricao_publica,
          instrucoes_secretas,
          objetivos_conflito,
          dicas_de_postura
        ),
        sessao:rpg_sessoes (
          id,
          titulo,
          descricao_contexto,
          disciplina_id,
          etiqueta_digital,
          status
        )
      `)
      .eq('aluno_email', aluno_email);

    if (sessao_id) {
      query = query.eq('sessao_id', sessao_id);
    }

    const { data: fichas, error } = await query;

    if (error) throw error;

    return NextResponse.json({ fichas: fichas || [] });
  } catch (error: any) {
    console.error('Erro ao buscar ficha do aluno:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/rpg/fichas — Aluno registra reflexão pós-simulação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessao_id, aluno_email, aluno_nome, reflexao_pos_simulacao, auto_avaliacao_empatia, auto_avaliacao_argumentacao } = body;

    if (!sessao_id || !aluno_email) {
      return NextResponse.json({ error: 'sessao_id e aluno_email são obrigatórios' }, { status: 400 });
    }

    // Upsert: criar ou atualizar a ficha existente
    const { data, error } = await supabase
      .from('rpg_fichas_aluno')
      .upsert({
        sessao_id,
        papel_id: body.papel_id || null,
        aluno_email,
        aluno_nome,
        reflexao_pos_simulacao,
        auto_avaliacao_empatia,
        auto_avaliacao_argumentacao,
        status_participacao: reflexao_pos_simulacao ? 'concluido' : 'em_andamento',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'sessao_id,aluno_email' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ficha: data }, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao salvar ficha RPG:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
