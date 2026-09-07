import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://lbljtnbyhruubnsqzabt.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_ptEmz7I2XJGnhFwhekrobA_oXiPKVrZ';

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Garante que a chave completa seja sempre usada, evitando truncamento em builds da Vercel
export const supabaseUrl = (envUrl && envUrl.includes('supabase.co')) ? envUrl : DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = (envKey && envKey.length > 30) ? envKey : DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Inicia o fluxo de login via Google OAuth no Supabase Auth
 */
export async function signInWithGoogle() {
  const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    console.error('Erro ao autenticar com Google OAuth:', error.message);
    throw error;
  }

  return data;
}

/**
 * Realiza logout da sessão ativa
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Erro ao encerrar sessão:', error.message);
  } catch (e) {
    console.warn('Sessão encerrada localmente.');
  }
}
