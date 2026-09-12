import { createClient } from '@supabase/supabase-js';

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseUrl = envUrl;
export const supabaseAnonKey = envKey;

// Garante que o cliente seja instanciado com as variáveis de ambiente oficiais sem vazar credenciais no código-fonte
export const supabase = createClient(
  supabaseUrl || 'https://lbljtnbyhruubnsqzabt.supabase.co',
  supabaseAnonKey || 'sb_publishable_placeholder'
);

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
