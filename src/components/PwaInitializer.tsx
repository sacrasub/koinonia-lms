'use client';

import { useEffect } from 'react';
import { registerServiceWorker, sendLmsNotification } from '@/services/pushNotificationService';

export const PwaInitializer = () => {
  useEffect(() => {
    // 1. Registrar o Service Worker ao inicializar o app
    registerServiceWorker().then((reg) => {
      if (reg) {
        console.log('[PWA] Service Worker registrado com sucesso:', reg.scope);

        // Se houver uma atualização pendente de Service Worker, atualiza
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] Nova versão do LMS detectada em segundo plano.');
              }
            };
          }
        };
      }
    });

    // 2. Interceptar erros globais de carregamento de chunk (ChunkLoadError após novos deploys na Vercel)
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const err = 'error' in event ? event.error : ('reason' in event ? event.reason : null);
      const message = String(err?.message || ('message' in event ? event.message : '') || '');

      const isChunk =
        err?.name === 'ChunkLoadError' ||
        message.includes('Loading chunk') ||
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('Load chunk failed');

      if (isChunk && typeof window !== 'undefined') {
        console.warn('[LMS Auto-Update] Chunk defasado detectado pós-deploy. Tentando auto-recuperação:', message);
        const retryKey = 'lms_chunk_reload_ts';
        const lastRetry = sessionStorage.getItem(retryKey);
        const now = Date.now();

        // Throttle de 15 segundos para evitar loops de reload se estiver sem internet
        if (!lastRetry || now - Number(lastRetry) > 15000) {
          sessionStorage.setItem(retryKey, String(now));
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
    };

    window.addEventListener('error', handleChunkError);
    window.addEventListener('unhandledrejection', handleChunkError);

    // 3. Escutar eventos globais de notificação disparados por ações do LMS
    const handleLmsNotificationEvent = (e: Event) => {
      const customEvt = e as CustomEvent<{ title: string; body: string; url?: string }>;
      if (customEvt.detail) {
        sendLmsNotification(customEvt.detail);
      }
    };

    window.addEventListener('lms_send_notification', handleLmsNotificationEvent);
    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleChunkError);
      window.removeEventListener('lms_send_notification', handleLmsNotificationEvent);
    };
  }, []);

  return null;
};
