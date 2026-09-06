'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OficinaEstudosHub } from '@/components/oficina-estudos/OficinaEstudosHub';
import { ArrowLeft, GraduationCap, Compass, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OficinaEstudosPageClient() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('lms_active_user_email') || '';
      setUserEmail(email);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* BARRA SUPERIOR DE NAVEGAÇÃO RÁPIDA */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
            className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs rounded-xl flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao LMS</span>
          </Button>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-black text-amber-300">
              Modo Imersão & Metacognição Ativado
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/tcc-sacramento')}
            className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs rounded-xl flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Painel do TCC</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/pesquisa-tcc')}
            className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs rounded-xl flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Pesquisa de Campo</span>
          </Button>
        </div>
      </header>

      {/* ÁREA PRINCIPAL DO HUB */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8">
        <OficinaEstudosHub userEmail={userEmail} onTabChange={(tab) => router.push(`/?tab=${tab}`)} />
      </main>
    </div>
  );
}
