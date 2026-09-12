import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de Keep-Alive / Anti-Inatividade do Supabase
 * Realiza uma consulta pontual ultra-leve (1 registro com projeção mínima)
 * para impedir a pausa automática de 7 dias do plano gratuito do Supabase.
 * Zero impacto no egress.
 */
export async function GET() {
  try {
    const startedAt = Date.now();
    // Executa uma consulta mínima com projeção estrita de apenas 1 ID
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    const latencyMs = Date.now() - startedAt;

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: 'online',
      latency_ms: latencyMs,
      message: 'Supabase mantido ativo com sucesso (Zero-Waste Anti-Inatividade).',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Erro ao executar keep-alive.',
      },
      { status: 500 }
    );
  }
}
