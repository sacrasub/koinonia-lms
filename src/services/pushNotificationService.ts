// Serviço de Notificações Web Push e PWA do Koinonia LMS (100% Nativo, Zero Egress)

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
}

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    return registration;
  } catch (err) {
    console.warn('[PWA] Erro ao registrar Service Worker:', err);
    return null;
  }
};

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) return false;

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.error('[PWA] Erro ao solicitar permissão de notificações:', err);
    return false;
  }
};

export const sendLmsNotification = async (payload: PushNotificationPayload): Promise<boolean> => {
  if (!isNotificationSupported()) return false;

  if (Notification.permission !== 'granted') {
    const granted = await requestNotificationPermission();
    if (!granted) return false;
  }

  const { title, body, icon = '/icon-192.png', url = '/' } = payload;

  try {
    // Tenta exibir via Service Worker se ativo
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon,
          badge: '/icon-192.png',
          data: { url },
        } as NotificationOptions);
        return true;
      }
    }

    // Fallback para Notification API direta do browser
    new Notification(title, {
      body,
      icon,
    });
    return true;
  } catch (err) {
    console.error('[PWA] Falha ao enviar notificação local:', err);
    return false;
  }
};
