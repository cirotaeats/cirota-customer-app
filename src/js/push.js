/**
 * Web Push Notification Registration Module (§7.2)
 */
import { api } from './api.js';

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.info('Web Push not supported on this browser/environment.');
    return { success: false, reason: 'unsupported' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, reason: 'denied' };
    }

    const registration = await navigator.serviceWorker.ready;
    const { vapidPublicKey } = await api.getVapidPublicKey();
    
    if (!vapidPublicKey) {
      throw new Error('Could not retrieve VAPID Public Key');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    await api.registerPushSubscription(subscription.toJSON());
    return { success: true };
  } catch (error) {
    console.warn('Push subscription failed:', error);
    return { success: false, error };
  }
}

/**
 * Contextual prompt for Web Push (shown after a first successful user interaction)
 */
export function promptPushPermissionContextual(onSuccess = null) {
  if (!('Notification' in window) || Notification.permission === 'granted') {
    return;
  }

  const existingToast = document.querySelector('.push-permission-toast');
  if (existingToast) return;

  const toast = document.createElement('div');
  toast.className = 'toast toast-info push-permission-toast';
  toast.innerHTML = `
    <div style="flex: 1;">
      <div style="font-weight: 700; color: var(--color-primary); margin-bottom: 2px;">🔔 Enable Meal Alerts?</div>
      <div style="font-size: 0.8rem; color: var(--color-text-muted);">Get daily meal dispatch & delivery ETA notifications.</div>
      <div style="margin-top: 6px; display: flex; gap: 8px;">
        <button class="btn btn-primary btn-sm" id="btn-allow-push">Enable</button>
        <button class="btn btn-outline btn-sm" id="btn-dismiss-push">Later</button>
      </div>
    </div>
  `;

  document.body.appendChild(toast);

  toast.querySelector('#btn-allow-push').addEventListener('click', async () => {
    toast.remove();
    const result = await subscribeToPush();
    if (result.success && onSuccess) onSuccess();
  });

  toast.querySelector('#btn-dismiss-push').addEventListener('click', () => {
    toast.remove();
  });
}
