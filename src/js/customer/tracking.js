/**
 * Live Delivery Tracking View
 * Shows the assigned rider's live position + a simple ETA, using free
 * OpenStreetMap tiles via Leaflet.js (no API key / billing needed).
 */
import { api } from '../api.js';
import { CONFIG } from '../config.js';

let pollTimer = null;
let leafletMap = null;
let riderMarker = null;
let customerMarker = null;

export async function renderTrackingView(containerElement, orderId) {
  if (!containerElement) return;
  stopPolling();

  if (!orderId) {
    containerElement.innerHTML = `
      <div class="cirota-card" style="max-width: 500px; margin: 2rem auto; text-align:center;">
        <p>No order selected to track. <a href="#/dashboard">Go back home</a>.</p>
      </div>
    `;
    return;
  }

  containerElement.innerHTML = `
    <div style="max-width: 600px; margin: 0 auto;">
      <div class="cirota-card" style="margin-bottom: 1rem;">
        <h2 style="font-size: 1.25rem; color: var(--color-primary); margin-bottom: 0.25rem;">📍 Track Your Tiffin</h2>
        <p id="track-status-line" style="font-size: 0.85rem; color: var(--color-text-muted);">Checking your rider's location…</p>
      </div>
      <div id="track-map" style="height: 320px; border-radius: 16px; overflow: hidden; margin-bottom: 1rem; background: #eee;"></div>
      <div id="track-info-card"></div>
      <div style="text-align:center; margin-top: 1rem;">
        <a href="#/dashboard" class="btn btn-outline btn-sm">← Back to Home</a>
      </div>
    </div>
  `;

  async function refresh() {
    try {
      const data = await api.getOrderTracking(orderId);
      renderState(data);
    } catch (err) {
      const statusLine = containerElement.querySelector('#track-status-line');
      if (statusLine) statusLine.textContent = err.message || 'Could not load tracking info.';
    }
  }

  function renderState(data) {
    const statusLine = containerElement.querySelector('#track-status-line');
    const infoCard = containerElement.querySelector('#track-info-card');
    const mapEl = containerElement.querySelector('#track-map');

    if (!data || !data.tracking) {
      const reasonText = {
        partner_not_live: "Your delivery partner hasn't started their route yet. Check back closer to meal time!",
        location_stale: 'Location signal lost — your rider may be in a low-network area. Please try again shortly.',
        already_delivered: 'This tiffin has already been delivered. ✅',
      }[data?.reason] || 'Live tracking isn\'t available for this tiffin yet.';

      if (statusLine) statusLine.textContent = reasonText;
      if (mapEl) mapEl.style.display = 'none';
      if (infoCard) infoCard.innerHTML = '';
      return;
    }

    if (mapEl) mapEl.style.display = '';
    if (statusLine) {
      statusLine.textContent = `${data.partner.name} is on the way${data.eta_minutes != null ? ` — about ${data.eta_minutes} min away` : ''}.`;
    }

    if (infoCard) {
      infoCard.innerHTML = `
        <div class="cirota-card" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
          <div>
            <div style="font-weight:700;">${data.partner.name}</div>
            <div style="font-size:0.78rem; color: var(--color-text-muted);">Your delivery partner</div>
          </div>
          <div style="text-align:right;">
            ${data.eta_minutes != null ? `<div style="font-size:1.4rem; font-weight:800; color: var(--color-primary);">${data.eta_minutes} min</div>` : ''}
            ${data.distance_km != null ? `<div style="font-size:0.78rem; color: var(--color-text-muted);">${data.distance_km} km away</div>` : ''}
          </div>
          <a href="tel:${data.partner.phone}" class="btn btn-outline btn-sm btn-full">📞 Call ${data.partner.name.split(' ')[0]}</a>
        </div>
      `;
    }

    updateMap(data);
  }

  function updateMap(data) {
    if (typeof L === 'undefined') return; // Leaflet failed to load (e.g. offline) — degrade gracefully

    const riderPos = [data.rider_location.lat, data.rider_location.lng];
    const custPos = data.customer_location ? [data.customer_location.lat, data.customer_location.lng] : null;

    if (!leafletMap) {
      leafletMap = L.map('track-map', { zoomControl: true, attributionControl: true }).setView(riderPos, 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(leafletMap);

      const riderIcon = L.divIcon({ className: '', html: '<div style="font-size:26px;">🛵</div>', iconSize: [30, 30], iconAnchor: [15, 15] });
      riderMarker = L.marker(riderPos, { icon: riderIcon }).addTo(leafletMap);

      if (custPos) {
        const homeIcon = L.divIcon({ className: '', html: '<div style="font-size:26px;">🏠</div>', iconSize: [30, 30], iconAnchor: [15, 15] });
        customerMarker = L.marker(custPos, { icon: homeIcon }).addTo(leafletMap);
        leafletMap.fitBounds([riderPos, custPos], { padding: [40, 40] });
      }
    } else {
      riderMarker.setLatLng(riderPos);
      if (custPos && customerMarker) customerMarker.setLatLng(custPos);
    }
  }

  await refresh();
  pollTimer = setInterval(refresh, CONFIG.TRACKING_POLL_INTERVAL_MS);
}

export function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
    riderMarker = null;
    customerMarker = null;
  }
}
