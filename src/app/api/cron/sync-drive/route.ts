import { NextResponse } from 'next/server';
import { fetchRestrictedDriveMaterials } from '@/services/googleDriveServiceAccount';

export const dynamic = 'force-dynamic';

/**
 * Route Handler para Cron Job no Backend
 * Executa a sincronização segura da pasta restrita do Google Drive (via Service Account)
 * e faz o upsert dos metadados na tabela 'Drive_Materials' do Supabase.
 */
export async function GET() {
  try {
    const materials = await fetchRestrictedDriveMaterials();

    return NextResponse.json({
      success: true,
      message: 'Sincronização da pasta restrita do Google Drive via Service Account concluída!',
      synced_count: materials.length,
      materials,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Falha ao sincronizar pasta restrita do Google Drive.',
      },
      { status: 500 }
    );
  }
}
