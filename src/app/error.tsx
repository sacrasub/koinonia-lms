'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Sparkles, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isReloading, setIsReloading] = useState(false);

  const isChunkError = Boolean(
    error?.name === 'ChunkLoadError' ||
    error?.message?.includes('Loading chunk') ||
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Load chunk failed') ||
    (typeof error?.message === 'string' && /chunk/i.test(error.message))
  );

  useEffect(() => {
    console.error('[Koinonia LMS] Erro capturado pelo Error Boundary:', error);

    // Auto-recuperação transparente em caso de ChunkLoadError (novo deploy)
    if (isChunkError && typeof window !== 'undefined') {
      const retryKey = 'lms_chunk_reload_ts';
      const lastRetry = sessionStorage.getItem(retryKey);
      const now = Date.now();

      // Se ainda não tentou nos últimos 15 segundos, recarrega automaticamente
      if (!lastRetry || now - Number(lastRetry) > 15000) {
        sessionStorage.setItem(retryKey, String(now));
        setIsReloading(true);

        // Limpa o CacheStorage de assets do Service Worker para forçar download do novo build
        if ('caches' in window) {
          caches.keys().then((names) => {
            return Promise.all(names.map((name) => caches.delete(name)));
          }).finally(() => {
            window.location.reload();
          });
        } else {
          window.location.reload();
        }
      }
    }
  }, [error, isChunkError]);

  const handleReloadLatest = async () => {
    setIsReloading(true);
    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
      }
    } catch (_) {}
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-blue-500/30 p-6 sm:p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border ${
          isChunkError 
            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        }`}>
          {isChunkError ? (
            <Sparkles className="w-7 h-7 animate-pulse" />
          ) : (
            <AlertTriangle className="w-7 h-7" />
          )}
        </div>
        
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white">
            {isChunkError ? 'Nova Versão da Plataforma' : 'Instabilidade Temporária'}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {isChunkError
              ? 'Uma nova atualização do Koinonia LMS foi publicada com melhorias. Clique abaixo para carregar a versão mais recente.'
              : 'Ocorreu um imprevisto ao processar a página. Seus dados e anotações continuam salvos com segurança.'}
          </p>
        </div>

        {error?.message && (
          <div className="p-3 bg-black/40 border border-white/10 rounded-xl text-[11px] text-slate-300 text-left font-mono break-all max-h-24 overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            disabled={isReloading}
            onClick={handleReloadLatest}
            className={`w-full py-3.5 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              isReloading
                ? 'bg-blue-800 cursor-not-allowed opacity-80'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-98'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
            {isReloading 
              ? 'Atualizando plataforma...' 
              : (isChunkError ? 'Atualizar Plataforma Agora' : 'Recarregar Página')}
          </button>

          <button
            type="button"
            onClick={handleGoHome}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" /> Ir para a Página Inicial
          </button>
        </div>
      </div>
    </div>
  );
}
