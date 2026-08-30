import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET /api/rpg/sessoes?disciplina_id=&role=&user_email=
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const disciplina_id = searchParams.get('disciplina_id');
  const role = searchParams.get('role') || 'aluno';
  const user_email = searchParams.get('user_email');

  try {
    let query = supabase
      .from('rpg_sessoes')
      .select(`
        *,
        papeis:rpg_papeis (
          id,
          nome_papel,
          stakeholder_tipo,
          descricao_publica,
          objetivos_conflito,
          dicas_de_postura,
          atribuido_a_email,
          atribuido_a_nome
        )
      `)
      .order('created_at', { ascending: false });

    if (disciplina_id) {
      query = query.eq('disciplina_id', disciplina_id);
    }

    const { data: sessoes, error } = await query;

    if (error) throw error;

    // Para alunos: filtra instrucoes_secretas dos papeis (nunca exposto)
    // Para professor/admin/monitor: retorna tudo
    const isPrivileged = ['professor', 'admin', 'monitor'].includes(role);

    const sessoesFiltradas = (sessoes || []).map((sessao: any) => ({
      ...sessao,
      papeis: (sessao.papeis || []).map((papel: any) => {
        if (isPrivileged) return papel;
        // Aluno vê apenas informações públicas, nunca instrucoes_secretas dos outros
        return {
          id: papel.id,
          sessao_id: papel.sessao_id,
          nome_papel: papel.nome_papel,
          stakeholder_tipo: papel.stakeholder_tipo,
          descricao_publica: papel.descricao_publica,
          dicas_de_postura: papel.dicas_de_postura,
          atribuido_a_email: papel.atribuido_a_email,
          atribuido_a_nome: papel.atribuido_a_nome,
        };
      }),
    }));

    return NextResponse.json({ sessoes: sessoesFiltradas });
  } catch (error: any) {
    console.error('Erro ao buscar sessões RPG:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/rpg/sessoes — Criar nova sessão (professor/admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { titulo, descricao_contexto, disciplina_id, disciplina_name, sala_meet_id, etiqueta_digital, created_by_email, created_by_name, papeis } = body;

    if (!titulo || !descricao_contexto || !disciplina_id || !created_by_email) {
      return NextResponse.json({ error: 'Campos obrigatórios: titulo, descricao_contexto, disciplina_id, created_by_email' }, { status: 400 });
    }

    // Criar sessão
    const { data: sessao, error: sessaoError } = await supabase
      .from('rpg_sessoes')
      .insert({
        titulo,
        descricao_contexto,
        disciplina_id,
        disciplina_name: disciplina_name || '',
        sala_meet_id,
        etiqueta_digital,
        created_by_email,
        created_by_name,
        status: 'ativa',
      })
      .select()
      .single();

    if (sessaoError) throw sessaoError;

    // Criar papéis associados
    let papeisData: any[] = [];
    if (papeis && Array.isArray(papeis) && papeis.length > 0) {
      const papeisParaInserir = papeis.map((papel: any) => ({
        sessao_id: sessao.id,
        nome_papel: papel.nome_papel,
        stakeholder_tipo: papel.stakeholder_tipo || 'personagem',
        descricao_publica: papel.descricao_publica,
        instrucoes_secretas: papel.instrucoes_secretas,
        objetivos_conflito: papel.objetivos_conflito,
        dicas_de_postura: papel.dicas_de_postura,
        atribuido_a_email: papel.atribuido_a_email,
        atribuido_a_nome: papel.atribuido_a_nome,
      }));

      const { data, error: papeisError } = await supabase
        .from('rpg_papeis')
        .insert(papeisParaInserir)
        .select();

      if (papeisError) throw papeisError;
      papeisData = data || [];
    }

    return NextResponse.json({ sessao: { ...sessao, papeis: papeisData } }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar sessão RPG:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
