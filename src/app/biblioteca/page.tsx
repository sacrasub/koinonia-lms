'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BibliotecaPage } from '@/components/BibliotecaPage';
import { ArrowLeft, Library, ExternalLink } from 'lucide-react';
import { UserRole } from '@/types';
import { BIBLIOTECA_ROOT_DRIVE_FOLDER_URL } from '@/services/bibliotecaService';

export default function BibliotecaRoutePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');
  const [currentRole, setCurrentRole] = useState<UserRole>('aluno');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('lms_active_user_email') || '';
      const role = (localStorage.getItem('lms_active_user_role') as UserRole) || 'aluno';
      setUserEmail(email);
      setCurrentRole(role);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* BARRA SUPERIOR DE NAVEGAÇÃO RÁPIDA */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-3 py-1.5 border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao LMS</span>
          </button>

          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <Library className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-200">
              Biblioteca Digital Koinonia
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={BIBLIOTECA_ROOT_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Google Drive</span>
          </a>
        </div>
      </header>

      {/* CONTEÚDO INTEGRAL DA BIBLIOTECA */}
      <main className="flex-1 p-3 sm:p-6 max-w-7xl mx-auto w-full">
        <BibliotecaPage userEmail={userEmail} currentRole={currentRole} />
      </main>
    </div>
  );
}
