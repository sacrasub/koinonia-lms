'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TccSacramentoPage } from '@/components/TccSacramentoPage';
import { ShieldAlert, ArrowLeft, HelpCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TccAuthGuard() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const email = (localStorage.getItem('lms_active_user_email') || '').toLowerCase().trim();
      const role = (localStorage.getItem('lms_active_user_role') || '').toLowerCase().trim();
      setUserEmail(email);

      // Critério de autorização estrito:
      // Apenas Cristiano do Sacramento Soares, o orientador Pr. Alexsandro Silva ou Administrador do LMS
      const isAllowed = 
        email.includes('sacra') || 
        email.includes('cristiano') || 
        email.includes('alexsandro') ||
        role === 'admin';

      setIsAuthorized(isAllowed);
    } catch (_) {
      setIsAuthorized(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-400 font-bold">Verificando credenciais de pesquisa...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 text-slate-100">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Acesso Restrito ao Pesquisador
            </span>
            <h2 className="text-xl font-black text-white">Painel Exclusivo do TCC</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Este painel de resultados, microdados estatísticos e diário de bordo metodológico é de acesso reservado e exclusivo de <strong>Cristiano do Sacramento Soares</strong> e de seu orientador <strong>Pr. Alexsandro Silva</strong> (UNIMB & UIECB).
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Button
              onClick={() => router.push('/')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para a Plataforma Koinonia LMS</span>
            </Button>

            <Button
              onClick={() => router.push('/pesquisa-tcc')}
              variant="outline"
              className="w-full border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Ir para a Pesquisa de Campo do TCC</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <TccSacramentoPage />;
}
