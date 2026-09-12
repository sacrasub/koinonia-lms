'use client';

import { useEffect } from 'react';
import { registerServiceWorker, sendLmsNotification } from '@/services/pushNotificationService';

export const PwaInitializer = () => {
  useEffect(() => {
    // Registrar o Service Worker ao inicializar o app
    registerServiceWorker().then((reg) => {
      if (reg) {
        console.log('[PWA] Service Worker registrado com sucesso:', reg.scope);
      }
    });

    // Escutar eventos globais de notificação disparados por ações do LMS
    const handleLmsNotificationEvent = (e: Event) => {
      const customEvt = e as CustomEvent<{ title: string; body: string; url?: string }>;
      if (customEvt.detail) {
        sendLmsNotification(customEvt.detail);
      }
    };

    window.addEventListener('lms_send_notification', handleLmsNotificationEvent);
    return () => {
      window.removeEventListener('lms_send_notification', handleLmsNotificationEvent);
    };
  }, []);

  return null;
};
