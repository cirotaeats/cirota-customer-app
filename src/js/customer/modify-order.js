/**
 * Modify Order Page View (§4b)
 * Allows item-level quantity steppers, incremental add prices, and removal credits.
 */
import { api } from '../api.js';

export async function renderModifyOrderView(containerElement, orderId = null) {
  if (!containerElement) return;

  containerElement.innerHTML = `
    <div style="text-align: center; padding: 3rem;">
      <div class="skeleton" style="height: 120px; width: 100%; max-width: 600px; margin: 0 auto 1.5rem auto;"></div>
      <div class="skeleton" style="height: 300px; width: 100%; max-width: 600px; margin: 0 auto;"></div>
    </div>
  `;

  try {
    const { meals } = await api.getUpcomingMeals();
    // Find the requested meal or default to first upcoming meal
    const meal = meals.find(m => m.order_id === orderId || m.id === orderId) || meals.find(m => m.status === 'upcoming') || meals[0];

    if (!meal) {
      containerElement.innerHTML = `
        <div class="cirota-card" style="text-align: center; max-width: 500px; margin: 2rem auto;">
          <h3>No Active Order Found</h3>
          <p style="color: var(--color-text-muted); margin: 1rem 0;">This order is either delivered or no longer modifiable.</p>
          <a href="#/dashboard" class="btn btn-primary">Return to Home</a>
        </div>
      `;
      return;
    }

    // Clone components for live editing
    const currentComponents = JSON.parse(JSON.stringify(meal.components || []));

    function calculateDelta() {
      let delta = 0;
      currentComponents.forEach(c => {
        const qtyDiff = c.quantity - c.base_qty;
        if (qtyDiff > 0) {
          delta += qtyDiff * (c.extra_unit_price || 15);
        } else if (qtyDiff < 0) {
          delta += qtyDiff * (c.credit_price || 10);
        }
      });
      return delta;
    }

    function renderView() {
      const runningDelta = calculateDelta();
      const deltaFormatted = runningDelta > 0 
        ? `+₹${runningDelta}` 
        : (runningDelta < 0 ? `-₹${Math.abs(runningDelta)} credit` : '₹0 (Included in plan)');

      let rowsHtml = '';
      currentComponents.forEach((comp, idx) => {
        const qtyDiff = comp.quantity - comp.base_qty;
        let pricingNote = '';
        if (qtyDiff > 0) {
          pricingNote = `<span class="order-item-pricing pricing-extra">+₹${comp.extra_unit_price} each extra</span>`;
        } else if (qtyDiff < 0) {
          pricingNote = `<span class="order-item-pricing pricing-credit">−₹${comp.credit_price} deducted from bill</span>`;
        } else {
          pricingNote = `<span class="order-item-pricing" style="color: var(--color-text-muted);">Included in plan</span>`;
        }

        const canDecrease = comp.is_removable ? comp.quantity > 0 : comp.quantity > 1;

        rowsHtml += `
          <div class="order-item-row" data-index="${idx}">
            <div class="order-item-info">
              <span class="order-item-name">${comp.name}</span>
              ${pricingNote}
            </div>
            <div class="quantity-stepper">
              <button class="stepper-btn btn-step-minus" data-index="${idx}" ${!canDecrease ? 'disabled' : ''}>−</button>
              <span class="stepper-count">${comp.quantity}</span>
              <button class="stepper-btn btn-step-plus" data-index="${idx}">+</button>
            </div>
          </div>
        `;
      });

      containerElement.innerHTML = `
        <div class="modify-order-container">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <a href="#/dashboard" class="btn btn-outline btn-sm">← Back to Dashboard</a>
            <span class="star-badge">✨ Meal Customization</span>
          </div>

          <!-- Header Summary Banner -->
          <div class="meal-summary-banner">
            <img src="${meal.image_url}" alt="${meal.dish_name}" class="meal-summary-img" />
            <div class="meal-summary-info">
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">
                ${meal.meal_type} • ${meal.date}
              </span>
              <h2 style="color: var(--color-primary); margin: 4px 0;">${meal.dish_name}</h2>
              <div style="font-size: 0.85rem; color: var(--color-text-muted);">
                Scheduled for ${meal.estimated_delivery}
              </div>
            </div>
          </div>

          <!-- Component Steppers List -->
          <div>
            <h3 style="font-size: 1.1rem; color: var(--color-primary); margin-bottom: 0.75rem;">
              Adjust Items for this Meal:
            </h3>
            <div class="order-items-list">
              ${rowsHtml}
            </div>
          </div>

          <!-- Running Delta Bottom Bar -->
          <div class="modify-bottom-bar">
            <div>
              <div class="running-delta-label">Price Adjustment:</div>
              <div class="running-delta-amount" style="color: ${runningDelta > 0 ? 'var(--color-accent)' : (runningDelta < 0 ? 'var(--color-success)' : 'var(--color-primary)')};">
                ${deltaFormatted}
              </div>
            </div>
            <button class="btn btn-primary" id="btn-save-order-modifications">
              <span>✓ Save Changes</span>
            </button>
          </div>
        </div>
      `;

      // Attach Stepper Listeners
      containerElement.querySelectorAll('.btn-step-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.index, 10);
          if (currentComponents[idx].quantity > 0) {
            currentComponents[idx].quantity -= 1;
            renderView();
          }
        });
      });

      containerElement.querySelectorAll('.btn-step-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.index, 10);
          currentComponents[idx].quantity += 1;
          renderView();
        });
      });

      // Save Button Listener
      const saveBtn = containerElement.querySelector('#btn-save-order-modifications');
      saveBtn.addEventListener('click', async () => {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span>Saving...</span>';
        try {
          const delta = calculateDelta();
          await api.modifyDailyOrder(meal.order_id || meal.id, currentComponents, delta);
          window.location.hash = '#/dashboard';
        } catch (err) {
          alert(err.message || 'Failed to save modifications');
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<span>✓ Save Changes</span>';
        }
      });
    }

    renderView();
  } catch (err) {
    containerElement.innerHTML = `
      <div class="cirota-card" style="text-align: center; margin: 2rem auto; max-width: 500px;">
        <h3 style="color: var(--color-danger);">Error Loading Order</h3>
        <p>${err.message}</p>
        <a href="#/dashboard" class="btn btn-primary" style="margin-top: 1rem;">Back</a>
      </div>
    `;
  }
}
