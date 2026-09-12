/**
 * Application Entrypoint — Cirota Customer App (standalone)
 */
import { initRouter } from './router.js';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Cirota Service Worker registered:', reg.scope))
      .catch(err => console.warn('Service Worker registration failed:', err));
  });
}

initRouter();
