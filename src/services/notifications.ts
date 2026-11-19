import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const REST_TIMER_NOTIFICATION_ID = 1001;
const COACH_NOTIFICATION_ID = 1002;
const TEST_NOTIFICATION_ID = 1003;

const REST_TIMER_CHANNEL_ID = 'kora_rest_timer';
const COACH_CHANNEL_ID = 'kora_coach';

export type NotificationPermissionState = 'granted' | 'denied' | 'prompt';

function isNativePlatform(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

function getWebNotificationApi(): typeof Notification | null {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification) {
      return window.Notification;
    }
    if (typeof Notification !== 'undefined') {
      return Notification;
    }
  } catch {
    // Restricted browser / WebView context
  }
  return null;
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  try {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator) || !navigator.serviceWorker) {
      return null;
    }
    const sw = navigator.serviceWorker;
    if (typeof sw.getRegistration === 'function') {
      const reg = await sw.getRegistration();
      if (!reg) {
        return null;
      }
      if (reg.active) {
        return reg;
      }
    }
    const readyReg = await Promise.race([
      sw.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500))
    ]);
    return readyReg ?? null;
  } catch {
    return null;
  }
}

async function getActiveServiceWorker(): Promise<ServiceWorker | null> {
  try {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator) || !navigator.serviceWorker) {
      return null;
    }
    if (navigator.serviceWorker.controller) {
      return navigator.serviceWorker.controller;
    }
    const reg = await getServiceWorkerRegistration();
    return reg?.active ?? null;
  } catch {
    return null;
  }
}

export async function initNotificationChannels(): Promise<void> {
  if (!isNativePlatform()) {
    return;
  }

  try {
    await LocalNotifications.createChannel({
      id: REST_TIMER_CHANNEL_ID,
      name: 'Satzpausen-Timer',
      description: 'Benachrichtigung wenn die Satzpause im Hintergrund endet',
      importance: 5,
      visibility: 1,
      vibration: true,
      lights: true,
      lightColor: '#fa2d48'
    });

    await LocalNotifications.createChannel({
      id: COACH_CHANNEL_ID,
      name: 'Kora KI-Coach',
      description: 'Proaktive Check-ins & Erinnerungen',
      importance: 4,
      visibility: 1,
      vibration: true
    });
  } catch {
    // No-op on platforms without notification channels (e.g. iOS/Web)
  }
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionState> {
  try {
    if (isNativePlatform()) {
      const status = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') return 'granted';
      if (status.display === 'denied') return 'denied';
      return 'prompt';
    }

    const NotificationApi = getWebNotificationApi();
    if (!NotificationApi) {
      return 'denied';
    }
    if (NotificationApi.permission === 'granted') return 'granted';
    if (NotificationApi.permission === 'denied') return 'denied';
    return 'prompt';
  } catch {
    return 'denied';
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (isNativePlatform()) {
      const current = await LocalNotifications.checkPermissions();
      if (current.display === 'granted') {
        return true;
      }
      const requested = await LocalNotifications.requestPermissions();
      return requested.display === 'granted';
    }

    const NotificationApi = getWebNotificationApi();
    if (!NotificationApi) {
      return false;
    }
    if (NotificationApi.permission === 'granted') {
      return true;
    }
    if (NotificationApi.permission === 'denied' || typeof NotificationApi.requestPermission !== 'function') {
      return false;
    }
    const perm = await NotificationApi.requestPermission();
    return perm === 'granted';
  } catch {
    return false;
  }
}

export async function cancelRestTimerNotification(): Promise<void> {
  try {
    if (isNativePlatform()) {
      await LocalNotifications.cancel({
        notifications: [{ id: REST_TIMER_NOTIFICATION_ID }]
      });
      return;
    }

    const activeSw = await getActiveServiceWorker();
    activeSw?.postMessage({ type: 'CANCEL_TIMER' });
  } catch {
    // Non-fatal in headless / restricted environments
  }
}

export async function scheduleRestTimerNotification(
  targetEndTimeMs: number,
  exerciseName?: string,
  enabled: boolean = true
): Promise<void> {
  await cancelRestTimerNotification();

  if (!enabled || !Number.isFinite(targetEndTimeMs) || targetEndTimeMs <= Date.now()) {
    return;
  }

  const cleanExercise = exerciseName?.trim();
  const title = 'Satzpause beendet 💪';
  const body = cleanExercise
    ? `Weiter geht's mit ${cleanExercise} — nächster Satz!`
    : 'Deine Pause ist um — bereit für den nächsten Satz!';

  try {
    if (isNativePlatform()) {
      const permission = await LocalNotifications.checkPermissions();
      if (permission.display !== 'granted') {
        return;
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id: REST_TIMER_NOTIFICATION_ID,
            title,
            body,
            schedule: {
              at: new Date(targetEndTimeMs),
              allowWhileIdle: true
            },
            channelId: REST_TIMER_CHANNEL_ID,
            smallIcon: 'ic_stat_kora',
            iconColor: '#fa2d48'
          }
        ]
      });
      return;
    }

    const activeSw = await getActiveServiceWorker();
    activeSw?.postMessage({
      type: 'SCHEDULE_TIMER',
      targetEndTime: targetEndTimeMs,
      title,
      body
    });
  } catch {
    // Non-fatal fallback
  }
}

export async function sendImmediateNotification(
  title: string,
  body: string,
  tag: string = 'kora-alert'
): Promise<boolean> {
  try {
    if (isNativePlatform()) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        return false;
      }

      const channelId = tag.includes('timer') ? REST_TIMER_CHANNEL_ID : COACH_CHANNEL_ID;
      const notificationId = tag.includes('timer')
        ? REST_TIMER_NOTIFICATION_ID
        : tag.includes('test')
          ? TEST_NOTIFICATION_ID
          : COACH_NOTIFICATION_ID;

      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title,
            body,
            schedule: {
              at: new Date(Date.now() + 250),
              allowWhileIdle: true
            },
            channelId,
            smallIcon: 'ic_stat_kora',
            iconColor: '#fa2d48'
          }
        ]
      });
      return true;
    }

    const granted = await requestNotificationPermission();
    if (!granted) {
      return false;
    }

    const reg = await getServiceWorkerRegistration();
    if (reg && typeof reg.showNotification === 'function') {
      try {
        await reg.showNotification(title, {
          body,
          icon: '/kora-icon.svg',
          badge: '/kora-icon.svg',
          tag,
          renotify: true
        } as NotificationOptions);
        return true;
      } catch {
        // Fallback to window.Notification
      }
    }

    const NotificationApi = getWebNotificationApi();
    if (NotificationApi) {
      new NotificationApi(title, {
        body,
        icon: '/kora-icon.svg',
        tag
      });
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
