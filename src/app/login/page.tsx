'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, supabase } from '@/lib/supabaseClient';
import { Lock, AlertCircle, Laptop, Zap, ShieldCheck, BookOpen, UserCheck, GraduationCap } from 'lucide-react';
import { INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocalhost, setIsLocalhost] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      setIsLocalhost(isLocal);
    }

    async function checkExistingSession() {
      // Se o usuário já está logado no Supabase Auth ou possui e-mail persistido, vai direto para a home
      const { data: { session } } = await supabase.auth.getSession();
      const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('lms_active_user_email') : null;

      if (session?.user?.email || storedEmail) {
        router.push('/');
      }
    }
    checkExistingSession();
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao autenticar com a conta do Google.');
      setLoading(false);
    }
  };

  const handleQuickLocalLogin = (email: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lms_active_user_email', email);
      const user = INITIAL_AUTHORIZED_USERS[email];
      if (user) {
        localStorage.setItem('lms_active_user_role', user.defaultRole);
      }
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-2xl space-y-6 text-center">
        {/* Logo Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-lg">
          ✝
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Koinonia LMS</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Portal Acadêmico • Seminário Teológico (2026.2)</p>
        </div>

        {/* Banner Informativo */}
        <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl text-left space-y-1.5">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
            <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" /> Autenticação via Google
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            Utilize sua conta do Google para acessar a plataforma oficial Koinonia LMS.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold text-left flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Botão Oficial de Login Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm rounded-2xl border border-gray-300 shadow flex items-center justify-center gap-3 transition-all hover:shadow-md disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {loading ? 'Redirecionando para o Google...' : 'Entrar com a Conta do Google'}
        </button>

        {/* MODO TESTE LOCAL (Apenas exibido quando rodando no localhost) */}
        {isLocalhost && (
          <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl text-left space-y-3">
            <div className="flex items-center gap-2 text-purple-950 font-bold text-xs">
              <Laptop className="w-4 h-4 text-purple-700" />
              <span>Ambiente Local: Acesso Rápido de Teste (1-Clique)</span>
            </div>
            <p className="text-[11px] text-purple-800">
              Escolha um perfil para entrar instantaneamente no <strong>localhost:3000</strong> sem precisar de redirecionamento externo:
            </p>

            <div className="grid grid-cols-1 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleQuickLocalLogin('sacrasub@gmail.com')}
                className="w-full py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-between shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>Admin / Criador (Cristiano)</span>
                </div>
                <span className="text-[10px] bg-purple-900/60 px-2 py-0.5 rounded">Total</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLocalLogin('sacrasub03@gmail.com')}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-between shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Aluno Turma A (7º Período)</span>
                </div>
                <span className="text-[10px] bg-emerald-800/60 px-2 py-0.5 rounded">Estudos</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLocalLogin('hilario.graca@catolica.edu.br')}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-between shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-blue-200" />
                  <span>Professor (Profº Hilário Bispo)</span>
                </div>
                <span className="text-[10px] bg-blue-800/60 px-2 py-0.5 rounded">Docente</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLocalLogin('rosianelcs73@gmail.com')}
                className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-between shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-amber-200" />
                  <span>Monitora (Rosiane)</span>
                </div>
                <span className="text-[10px] bg-amber-800/60 px-2 py-0.5 rounded">Escala</span>
              </button>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-400">
          Koinonia LMS • Autenticação RBAC Protegida por Supabase Auth & Google OAuth 2.0
        </div>
      </div>
    </div>
  );
}

