/**
 * Web Push Subscription Client Service for CAVDAX PWA
 * Interacts with Service Worker and server VAPID endpoints.
 */

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export async function registerServiceWorker() {
  if (!isPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return registration;
  } catch (err) {
    console.warn('[CAVDAX WebPush] SW registration failed:', err.message);
    return null;
  }
}

export async function getCurrentPushSubscription() {
  if (!isPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

export async function subscribeToPushNotifications() {
  if (!isPushSupported()) {
    return { success: false, error: 'PUSH_NOT_SUPPORTED' };
  }

  // 1. Request OS notification permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { success: false, error: 'PERMISSION_DENIED', permission };
  }

  // 2. Fetch VAPID public key from backend
  const keyRes = await fetch('/api/push/vapid-public-key');
  const keyData = await keyRes.json().catch(() => ({}));
  if (!keyData.success || !keyData.publicKey) {
    return { success: false, error: 'FAILED_TO_FETCH_VAPID_KEY' };
  }

  // 3. Register SW & subscribe via PushManager
  const registration = await registerServiceWorker();
  if (!registration) {
    return { success: false, error: 'SW_REGISTRATION_FAILED' };
  }

  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyData.publicKey)
    });
  }

  // 4. Send subscription to server
  const subRes = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ subscription })
  });
  const subData = await subRes.json().catch(() => ({}));

  return {
    success: Boolean(subData.success),
    subscription,
    permission
  };
}

export async function unsubscribeFromPushNotifications() {
  if (!isPushSupported()) return { success: false };
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
