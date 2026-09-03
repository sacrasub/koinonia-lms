'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Trash2, ArrowLeft } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Koinonia LMS] Erro capturado pelo Error Boundary:', error);
  }, [error]);

  const handleClearCacheAndReload = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch (_) {}
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/30 p-6 sm:p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white">Sincronização de Dados</h2>
          <p className="text-xs text-slate-400 mt-1">
            Detectamos dados residuais antigos no navegador do seu dispositivo que precisam ser renovados.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 bg-black/40 border border-white/10 rounded-xl text-[11px] text-red-300 text-left font-mono break-all max-h-24 overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={handleClearCacheAndReload}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Limpar Cache do Aparelho & Recarregar
          </button>

          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Tentar Novamente
          </button>
        </div>
      </div>
    </div>
  );
}
