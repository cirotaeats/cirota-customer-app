/**
 * Customer Dashboard View (§4a)
 * Assembles the two-column layout:
 * - Left column: Swipeable Meal Carousel card with upcoming details & "Modify Order" CTA
 * - Right column: Animated Validity Countdown Ring & Cutoff-Aware Pause/Resume Controls
 */
import { api } from '../api.js';
import { renderMealCarousel } from './meal-carousel.js';
import { renderValidityRing } from './validity-ring.js';
import { renderPauseControls } from './pause.js';

export async function renderCustomerDashboard(containerElement) {
  if (!containerElement) return;

  // Render initial loading skeleton
  containerElement.innerHTML = `
    <div class="dashboard-grid">
      <div class="skeleton" style="height: 380px;"></div>
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div class="skeleton" style="height: 220px;"></div>
        <div class="skeleton" style="height: 140px;"></div>
      </div>
    </div>
  `;

  try {
    const [{ customer, plan }, { meals }] = await Promise.all([
      api.getCustomerMe(),
      api.getUpcomingMeals()
    ]);

    // Build the container HTML shell
    containerElement.innerHTML = `
      <div class="dashboard-user-header">
        <div>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-accent);">Welcome back 👋</span>
          <h1 class="user-greeting-title">${customer.name}</h1>
          <p style="font-size: 0.85rem; color: var(--color-text-muted);">
            ${plan.name} • ${customer.area}, Ranchi
          </p>
        </div>
        <div style="text-align: right; flex-shrink: 0;">
          <span class="status-pill ${customer.status === 'active' ? 'status-active' : (customer.status === 'paused_indefinite' ? 'status-paused' : 'status-stopped')}">
            ${customer.status === 'active' ? '● Active' : (customer.status === 'paused_indefinite' ? '⏸ Paused' : '✕ Inactive')}
          </span>
        </div>
      </div>

      <!-- Two-Column Dashboard Grid (§4a) -->
      <div class="dashboard-grid">
        <!-- Left Column: Meal Carousel -->
        <div id="dashboard-left-col"></div>

        <!-- Right Column: Validity Ring & Pause Controls -->
        <div class="controls-column" id="dashboard-right-col">
          <div id="validity-ring-container"></div>
          <div id="pause-controls-container"></div>
        </div>
      </div>
    `;

    // Render Sub-components
    const leftCol = containerElement.querySelector('#dashboard-left-col');
    const ringCol = containerElement.querySelector('#validity-ring-container');
    const pauseCol = containerElement.querySelector('#pause-controls-container');

    const refreshDashboard = () => renderCustomerDashboard(containerElement);

    renderMealCarousel(meals, leftCol);
    renderValidityRing(customer.validity_days_remaining, customer.validity_days_total || 30, ringCol);
    renderPauseControls(customer, pauseCol, refreshDashboard);

  } catch (err) {
    containerElement.innerHTML = `
      <div class="cirota-card" style="text-align: center; margin: 2rem auto; max-width: 500px;">
        <h3 style="color: var(--color-danger);">Failed to Load Dashboard</h3>
        <p style="margin: 0.5rem 0 1rem 0; color: var(--color-text-muted);">${err.message}</p>
        <button class="btn btn-primary btn-sm" onclick="window.location.reload()">Retry</button>
      </div>
    `;
  }
}
