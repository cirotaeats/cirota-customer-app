/**
 * Plan Management & Remaining Meals View (§4 item 5)
 * Displays active plan details, meals remaining count, plan comparisons, and cancellation flow.
 */
import { api } from '../api.js';

export async function renderPlanView(containerElement) {
  if (!containerElement) return;

  containerElement.innerHTML = `
    <div style="text-align: center; padding: 3rem;">
      <div class="skeleton" style="height: 150px; width: 100%; max-width: 800px; margin: 0 auto 1.5rem auto;"></div>
      <div class="skeleton" style="height: 350px; width: 100%; max-width: 800px; margin: 0 auto;"></div>
    </div>
  `;

  try {
    const [{ customer, plan: currentPlan }, { plans }] = await Promise.all([
      api.getCustomerMe(),
      api.getPlans()
    ]);

    const freqLabel = {
      'times_3': '3 Meals/Day (Breakfast + Lunch + Dinner)',
      'times_2': '2 Meals/Day (Lunch + Dinner)',
      'times_1': '1 Meal/Day (Lunch or Dinner)'
    }[customer.frequency] || '2 Meals/Day';

    const currentMonthlyPrice = currentPlan.pricing[customer.frequency]?.monthly || 3299;

    let plansHtml = '';
    plans.forEach(p => {
      const isCurrent = p.id === customer.plan_id;
      const price2x = p.pricing.times_2?.monthly || 3299;
      const price3x = p.pricing.times_3?.monthly || 4499;

      plansHtml += `
        <div class="plan-card ${isCurrent ? 'selected' : ''}">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <span class="plan-type-badge ${p.category === 'veg' ? 'badge-veg' : 'badge-nonveg'}">
                ${p.category === 'veg' ? '🌱 Pure Veg' : '🍗 Non-Veg'} • ${p.tier.toUpperCase()}
              </span>
              ${isCurrent ? '<span class="star-badge">Current Plan</span>' : ''}
            </div>

            <h3 style="font-size: 1.25rem; color: var(--color-primary); margin: 0.25rem 0;">${p.name}</h3>
            <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 1rem;">${p.description}</p>

            <div class="plan-price-block">
              <span class="plan-price-val">₹${price2x}</span>
              <span class="plan-price-period">/ month (2x daily)</span>
            </div>

            <div style="font-size: 0.8rem; font-weight: 600; color: var(--color-primary); margin-bottom: 0.5rem;">Includes:</div>
            <ul style="font-size: 0.8rem; color: var(--color-text-muted); list-style: none; padding-left: 0; line-height: 1.6;">
              ${p.includes.map(item => `<li>✓ ${item}</li>`).join('')}
            </ul>
          </div>

          <div style="margin-top: 1.25rem;">
            ${isCurrent 
              ? `<button class="btn btn-outline-accent btn-full" disabled>Active</button>`
              : `<button class="btn btn-primary btn-full btn-switch-plan" data-plan-id="${p.id}">Switch to this Plan</button>`
            }
          </div>
        </div>
      `;
    });

    containerElement.innerHTML = `
      <div style="max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <a href="#/dashboard" class="btn btn-outline btn-sm">← Back to Dashboard</a>
          <h2 style="font-size: 1.4rem;">Subscription & Plan</h2>
        </div>

        <!-- Active Plan Banner & Meals Remaining Count -->
        <div class="cirota-card" style="background: linear-gradient(135deg, #FFFFFF 0%, #FAF2FC 100%);">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1.5rem;">
            <div>
              <span class="star-badge" style="margin-bottom: 0.5rem;">Your Active Membership</span>
              <h2 style="font-size: 1.6rem; color: var(--color-primary);">${currentPlan.name}</h2>
              <div style="font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.25rem;">
                ${freqLabel} • ₹${currentMonthlyPrice}/mo
              </div>
              <div style="font-size: 0.85rem; color: var(--color-accent); font-weight: 600; margin-top: 0.35rem;">
                Renewal Date: ${customer.next_renewal_date || 'In 19 days'}
              </div>
            </div>

            <!-- Meals Remaining Counter (Moved here per §4a) -->
            <div style="background: var(--color-surface); padding: 1.25rem 2rem; border-radius: var(--radius-card); border: 2px dashed var(--color-primary); text-align: center; box-shadow: var(--shadow-sm);">
              <div style="font-size: 2.2rem; font-weight: 800; color: var(--color-accent); font-family: var(--font-heading); line-height: 1;">
                ${customer.meals_remaining_count}
              </div>
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">
                Meals Remaining
              </div>
            </div>
          </div>
        </div>

        <!-- Compare & Change Plans -->
        <div>
          <div style="margin-bottom: 0.75rem;">
            <h3 style="font-size: 1.3rem;">Compare & Switch Plans</h3>
            <p style="font-size: 0.9rem; color: var(--color-text-muted);">Upgrade or switch your dietary preference anytime. Prorated balance applies automatically.</p>
          </div>

          <div class="plan-grid">
            ${plansHtml}
          </div>
        </div>

        <!-- Danger Zone: Cancel Subscription -->
        <div class="cirota-card" style="border-color: var(--color-danger); background: var(--color-danger-soft);">
          <h3 style="color: var(--color-danger); font-size: 1.1rem;">Cancel Subscription</h3>
          <p style="font-size: 0.85rem; color: var(--color-text); margin: 0.5rem 0 1rem 0;">
            Cancelling your subscription will stop future automated billing and clear your active validity balance.
          </p>
          <button class="btn btn-danger btn-sm" id="btn-cancel-subscription">Cancel My Membership</button>
        </div>
      </div>

      <!-- Cancel Confirmation Modal -->
      <div class="modal-overlay" id="cancel-sub-modal">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title" style="color: var(--color-danger);">Cancel Subscription?</h3>
            <button class="btn-icon" id="cancel-modal-close" style="background:none;font-size:1.4rem;">✕</button>
          </div>
          <div class="modal-body">
            <p style="margin-bottom: 0.75rem;">Are you sure you want to cancel your Cirota subscription?</p>
            <div style="background: var(--color-danger-soft); color: var(--color-danger); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.85rem; border: 1px solid var(--color-danger); font-weight: 600;">
              ⚠️ Warning: You will forfeit remaining ${customer.validity_days_remaining} days of validity and all unscheduled meals.
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline" id="cancel-modal-dismiss">Keep Subscription</button>
            <button class="btn btn-danger" id="cancel-modal-confirm">Confirm Cancellation</button>
          </div>
        </div>
      </div>
    `;

    // Attach Switch Plan buttons
    containerElement.querySelectorAll('.btn-switch-plan').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const newPlanId = e.target.dataset.planId;
        btn.disabled = true;
        btn.textContent = 'Switching...';
        try {
          await api.changePlan(newPlanId, customer.frequency);
          alert('Plan updated successfully!');
          renderPlanView(containerElement);
        } catch (err) {
          alert(err.message || 'Failed to switch plan');
          btn.disabled = false;
        }
      });
    });

    // Attach Cancel Modal
    const cancelModal = containerElement.querySelector('#cancel-sub-modal');
    const btnOpenCancel = containerElement.querySelector('#btn-cancel-subscription');
    const btnDismissCancel = containerElement.querySelector('#cancel-modal-dismiss');
    const btnCloseModal = containerElement.querySelector('#cancel-modal-close');
    const btnConfirmCancel = containerElement.querySelector('#cancel-modal-confirm');

    const closeCancel = () => cancelModal.classList.remove('active');
    btnOpenCancel.addEventListener('click', () => cancelModal.classList.add('active'));
    btnDismissCancel.addEventListener('click', closeCancel);
    btnCloseModal.addEventListener('click', closeCancel);

    btnConfirmCancel.addEventListener('click', async () => {
      btnConfirmCancel.disabled = true;
      btnConfirmCancel.textContent = 'Cancelling...';
      try {
        await api.cancelSubscription();
        closeCancel();
        window.location.hash = '#/dashboard';
      } catch (err) {
        alert(err.message || 'Failed to cancel subscription');
      } finally {
        btnConfirmCancel.disabled = false;
      }
    });

  } catch (err) {
    containerElement.innerHTML = `
      <div class="cirota-card" style="text-align: center; margin: 2rem auto; max-width: 500px;">
        <h3 style="color: var(--color-danger);">Error Loading Plan</h3>
        <p>${err.message}</p>
        <a href="#/dashboard" class="btn btn-primary" style="margin-top: 1rem;">Back</a>
      </div>
    `;
  }
}
