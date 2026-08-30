'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BibliotecaRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      localStorage.setItem('lms_active_tab', 'aluno-biblioteca');
    } catch (e) {}
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Carregando Biblioteca Digital...</p>
      </div>
    </div>
  );
}
