/**
 * New Subscriber Onboarding Wizard (§4 item 2)
 * Features 4 plan tiers, times-per-day frequency selection, short-term validity options, address input, and Razorpay checkout.
 */
import { api } from '../api.js';
import { startCheckout } from './payment.js';

export async function renderSubscribeView(containerElement) {
  if (!containerElement) return;

  containerElement.innerHTML = `
    <div style="text-align: center; padding: 3rem;">
      <div class="skeleton" style="height: 400px; width: 100%; max-width: 900px; margin: 0 auto;"></div>
    </div>
  `;

  try {
    const { plans } = await api.getPlans();

    let selectedPlanId = 'plan_veg_prime';
    let selectedFrequency = 'times_2'; // 2 times/day
    let selectedDurationDays = 30; // 30 days default

    function renderWizard() {
      const activePlan = plans.find(p => p.id === selectedPlanId) || plans[0];
      const isTrial = selectedDurationDays === 1;

      // Compute price based on duration and frequency
      let currentPrice = 3299;
      if (isTrial) {
        currentPrice = activePlan.trial_price || 50;
      } else if (selectedDurationDays === 30) {
        currentPrice = activePlan.pricing[selectedFrequency]?.monthly || 3299;
      } else {
        const shortOption = activePlan.short_term_options.find(s => s.days === selectedDurationDays);
        if (shortOption) {
          if (selectedFrequency === 'times_3') currentPrice = shortOption.price_3_times;
          else if (selectedFrequency === 'times_2') currentPrice = shortOption.price_2_times;
          else currentPrice = shortOption.price_1_time;
        }
      }

      let plansGridHtml = '';
      plans.forEach(p => {
        const isSelected = p.id === selectedPlanId;
        const baseMonthly = p.pricing[selectedFrequency]?.monthly || 3299;

        plansGridHtml += `
          <div class="plan-card ${isSelected ? 'selected' : ''}" data-plan-id="${p.id}">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span class="plan-type-badge ${p.category === 'veg' ? 'badge-veg' : 'badge-nonveg'}">
                  ${p.category === 'veg' ? '🌱 Pure Veg' : '🍗 Non-Veg'}
                </span>
                ${p.popular ? '<span class="star-badge">⭐ Most Popular</span>' : ''}
              </div>

              <h3 style="color: var(--color-primary); font-size: 1.25rem;">${p.name}</h3>
              <p style="font-size: 0.82rem; color: var(--color-text-muted); margin: 0.35rem 0 0.75rem 0;">${p.description}</p>
              
              <div class="plan-price-block">
                <span class="plan-price-val">₹${baseMonthly}</span>
                <span class="plan-price-period">/ 30 days</span>
              </div>
            </div>

            <button class="btn ${isSelected ? 'btn-accent' : 'btn-outline'} btn-sm btn-full select-plan-btn" data-plan-id="${p.id}">
              ${isSelected ? '✓ Selected' : 'Choose Plan'}
            </button>
          </div>
        `;
      });

      containerElement.innerHTML = `
        <div style="max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
          <!-- Wizard Header -->
          <div style="text-align: center;">
            <span class="star-badge" style="margin-bottom: 0.5rem;">✨ Start Your Subscription</span>
            <h1 style="font-size: 2rem; color: var(--color-primary);">Choose Your Perfect Tiffin</h1>
            <p style="color: var(--color-text-muted); font-size: 0.95rem; margin-top: 0.25rem;">
              Fresh, homely, chef-prepared meals delivered hot across Ranchi.
            </p>
          </div>

          <!-- Step 1: Meal Frequency -->
          <div class="cirota-card">
            <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem;">Step 1: Select Meals Per Day</h3>
            ${isTrial ? `
              <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">
                A single-tiffin trial is one meal only. Pick a subscription duration in Step 3 to unlock 2x/3x per day.
              </p>
            ` : ''}
            <div class="frequency-selector" style="${isTrial ? 'opacity:0.45; pointer-events:none;' : ''}">
              <div class="freq-pill ${selectedFrequency === 'times_1' ? 'active' : ''}" data-freq="times_1">
                1 Meal/Day<br><small style="font-weight:400;">Lunch or Dinner</small>
              </div>
              <div class="freq-pill ${selectedFrequency === 'times_2' ? 'active' : ''}" data-freq="times_2">
                2 Meals/Day ⭐<br><small style="font-weight:400;">Lunch + Dinner</small>
              </div>
              <div class="freq-pill ${selectedFrequency === 'times_3' ? 'active' : ''}" data-freq="times_3">
                3 Meals/Day<br><small style="font-weight:400;">Bfast + Lunch + Dinner</small>
              </div>
            </div>
          </div>

          <!-- Step 2: Plan Type -->
          <div>
            <h3 style="font-size: 1.15rem; margin-bottom: 0.75rem;">Step 2: Choose Plan Tier</h3>
            <div class="plan-grid">
              ${plansGridHtml}
            </div>
          </div>

          <!-- Step 3: Subscription Duration & Short Term Options -->
          <div class="cirota-card">
            <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem;">Step 3: Plan Validity & Duration</h3>
            <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 0.75rem;">
              Choose a monthly plan or a short-term trial variant.
            </p>
            <div class="frequency-selector">
              <div class="freq-pill ${selectedDurationDays === 1 ? 'active' : ''}" data-duration="1">
                Single Tiffin<br><small style="font-weight:400;">Try once, no subscription</small>
              </div>
              <div class="freq-pill ${selectedDurationDays === 7 ? 'active' : ''}" data-duration="7">
                7 Days Trial
              </div>
              <div class="freq-pill ${selectedDurationDays === 15 ? 'active' : ''}" data-duration="15">
                15 Days
              </div>
              <div class="freq-pill ${selectedDurationDays === 30 ? 'active' : ''}" data-duration="30">
                30 Days (Best Value)
              </div>
            </div>
          </div>

          <!-- Step 4: Delivery Area & Address -->
          <div class="cirota-card">
            <h3 style="font-size: 1.15rem; margin-bottom: 1rem;">Step 4: Delivery Details (Ranchi)</h3>
            <form id="subscriber-details-form">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label">Full Name</label>
                  <input type="text" class="form-input" id="sub-name" placeholder="e.g. Amit Sharma" value="Amit Sharma" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input type="tel" class="form-input" id="sub-phone" placeholder="10-digit mobile" value="9876543210" required />
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label">Delivery Area (Ranchi)</label>
                  <select class="form-select" id="sub-area" required>
                    <option value="Lalpur">Lalpur / Circular Road</option>
                    <option value="Kanke Road">Kanke Road / CMPDI</option>
                    <option value="Morabadi">Morabadi / Tagore Hill</option>
                    <option value="Doranda">Doranda / Hinoo</option>
                    <option value="Bariatu">Bariatu / RIMS</option>
                    <option value="Ratu Road">Ratu Road / Piska More</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Start Date</label>
                  <input type="date" class="form-input" id="sub-start-date" value="2026-08-28" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Delivery Address & Flat/Colony</label>
                <textarea class="form-textarea" id="sub-address" rows="2" placeholder="Full address with landmark" required>Flat 302, Green Valley Apartments, Lalpur, Ranchi</textarea>
              </div>
            </form>
          </div>

          <!-- Summary & Razorpay Trigger -->
          <div class="modify-bottom-bar" style="position: static; margin-bottom: 2rem;">
            <div>
              <div class="running-delta-label">Total Subscription Payable:</div>
              <div class="running-delta-amount" style="color: var(--color-primary); font-size: 1.6rem;">
                ₹${currentPrice} <small style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 500;">${isTrial ? '(Single Tiffin)' : `(${selectedDurationDays} Days)`}</small>
              </div>
            </div>
            <button class="btn btn-accent" id="btn-proceed-razorpay" style="padding: 0.9rem 2rem; font-size: 1.05rem;">
              <span>🔒 Proceed to Pay</span>
            </button>
          </div>
        </div>
      `;

      // Frequency pills
      containerElement.querySelectorAll('[data-freq]').forEach(pill => {
        pill.addEventListener('click', () => {
          selectedFrequency = pill.dataset.freq;
          renderWizard();
        });
      });

      // Duration pills
      containerElement.querySelectorAll('[data-duration]').forEach(pill => {
        pill.addEventListener('click', () => {
          selectedDurationDays = parseInt(pill.dataset.duration, 10);
          if (selectedDurationDays === 1) selectedFrequency = 'times_1';
          renderWizard();
        });
      });

      // Plan select cards
      containerElement.querySelectorAll('.plan-card, .select-plan-btn').forEach(elem => {
        elem.addEventListener('click', (e) => {
          selectedPlanId = elem.dataset.planId;
          renderWizard();
        });
      });

      // Razorpay Checkout Button
      const btnPay = containerElement.querySelector('#btn-proceed-razorpay');
      btnPay.addEventListener('click', () => {
        const name = containerElement.querySelector('#sub-name').value;
        const phone = containerElement.querySelector('#sub-phone').value;
        const address = containerElement.querySelector('#sub-address').value;
        const area = containerElement.querySelector('#sub-area').value;

        if (!name || !phone || !address) {
          alert('Please fill in your name, phone number, and address');
          return;
        }

        const customer = { name, phone, address, area };
        startCheckout(selectedPlanId, selectedFrequency, selectedDurationDays, customer, () => {
          window.location.hash = '#/dashboard';
        });
      });
    }

    renderWizard();
  } catch (err) {
    containerElement.innerHTML = `
      <div class="cirota-card" style="text-align: center; margin: 2rem auto; max-width: 500px;">
        <h3 style="color: var(--color-danger);">Error Loading Plans</h3>
        <p>${err.message}</p>
      </div>
    `;
  }
}
