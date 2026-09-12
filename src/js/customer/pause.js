/**
 * Pause & Resume Controls Component (§4a Right Column items 2 & 3)
 * Features:
 * - 3-hour delivery cutoff logic with live subtitle computation
 * - Single transforming "Pause Indefinitely" / "Resume" button
 * - Confirmation modals for destructive/kitchen-affecting operations
 */
import { CONFIG } from '../config.js';
import { api } from '../api.js';
import { promptPushPermissionContextual } from '../push.js';

let intervalTimer = null;

/**
 * Compute the next pausable meal based on 3-hour cutoff rule
 */
export function calculateNextPausableMeal(customTime = null) {
  const now = customTime ? new Date(customTime) : new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const timeInMinutes = currentHour * 60 + currentMinute;

  // Cutoff points in minutes from midnight (Delivery time minus 3 hours)
  // Breakfast (8:30 AM) - 3h = 5:30 AM (330 mins)
  // Lunch (1:00 PM / 13:00) - 3h = 10:00 AM (600 mins)
  // Dinner (8:00 PM / 20:00) - 3h = 5:00 PM (1020 mins)
  const CUTOFFS = {
    breakfast: 5 * 60 + 30, // 330
    lunch:     10 * 60,     // 600
    dinner:    17 * 60      // 1020
  };

  const todayStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  if (timeInMinutes < CUTOFFS.breakfast) {
    return {
      mealType: 'Breakfast',
      dateLabel: `Today, ${todayStr}`,
      cutoffPassed: false,
      deliveryTime: '8:30 AM'
    };
  } else if (timeInMinutes < CUTOFFS.lunch) {
    return {
      mealType: 'Lunch',
      dateLabel: `Today, ${todayStr}`,
      cutoffPassed: false,
      deliveryTime: '1:00 PM'
    };
  } else if (timeInMinutes < CUTOFFS.dinner) {
    return {
      mealType: 'Dinner',
      dateLabel: `Today, ${todayStr}`,
      cutoffPassed: false,
      deliveryTime: '8:00 PM'
    };
  } else {
    // All of today's cutoffs passed -> roll to tomorrow's breakfast
    return {
      mealType: 'Breakfast',
      dateLabel: `Tomorrow, ${tomorrowStr}`,
      cutoffPassed: false,
      deliveryTime: '8:30 AM'
    };
  }
}

export function renderPauseControls(customer, containerElement, onStateChange = null) {
  if (!containerElement) return;

  const isIndefinitelyPaused = customer.status === 'paused_indefinite';
  const targetMeal = calculateNextPausableMeal();

  containerElement.innerHTML = `
    <div class="pause-controls-card">
      <div style="font-weight: 700; color: var(--color-primary); font-size: 0.95rem; display: flex; align-items: center; gap: 0.35rem;">
        <span>⏸️</span>
        <span>Meal Delivery Controls</span>
      </div>

      <!-- 1. Pause Next Meal Button with Live Subtitle -->
      <button class="btn-pause-meal" id="btn-pause-next-meal" ${isIndefinitelyPaused ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
        <span class="btn-pause-main-text">
          <span>⏸</span>
          <span>Pause Next Meal</span>
        </span>
        <span class="btn-pause-subtitle" id="pause-next-subtitle">
          ${targetMeal.mealType} • ${targetMeal.dateLabel}
        </span>
      </button>

      <!-- 2. Single Transforming Pause Indefinitely / Resume Button -->
      <button
        class="btn-indefinite-toggle ${isIndefinitelyPaused ? 'state-paused' : 'state-active'}"
        id="btn-indefinite-toggle"
      >
        <span>${isIndefinitelyPaused ? '▶️ Resume Deliveries' : '🛑 Pause Indefinitely'}</span>
      </button>
    </div>

    <!-- Confirmation Modal Container -->
    <div class="modal-overlay" id="pause-confirm-modal">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title" id="pause-modal-title">Confirm Action</h3>
          <button class="btn-icon" id="pause-modal-close" style="background:none;font-size:1.4rem;">✕</button>
        </div>
        <div class="modal-body" id="pause-modal-body">
          <!-- Injected dynamically -->
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" id="pause-modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="pause-modal-confirm">Confirm</button>
        </div>
      </div>
    </div>
  `;

  // Start periodic 60s subtitle updater
  if (intervalTimer) clearInterval(intervalTimer);
  intervalTimer = setInterval(() => {
    const subtitle = containerElement.querySelector('#pause-next-subtitle');
    if (subtitle) {
      const updated = calculateNextPausableMeal();
      subtitle.textContent = `${updated.mealType} • ${updated.dateLabel}`;
    }
  }, 60000);

  // Setup Modal Triggers
  const modal = containerElement.querySelector('#pause-confirm-modal');
  const modalTitle = containerElement.querySelector('#pause-modal-title');
  const modalBody = containerElement.querySelector('#pause-modal-body');
  const btnConfirm = containerElement.querySelector('#pause-modal-confirm');
  const btnCancel = containerElement.querySelector('#pause-modal-cancel');
  const btnClose = containerElement.querySelector('#pause-modal-close');

  const closeModal = () => modal.classList.remove('active');
  btnCancel.addEventListener('click', closeModal);
  btnClose.addEventListener('click', closeModal);

  // Pause Next Meal Handler
  const btnPauseNext = containerElement.querySelector('#btn-pause-next-meal');
  btnPauseNext.addEventListener('click', () => {
    const currentTarget = calculateNextPausableMeal();
    modalTitle.textContent = `Pause ${currentTarget.mealType}?`;
    modalBody.innerHTML = `
      <p style="margin-bottom: 0.75rem;">Are you sure you want to pause your <strong>${currentTarget.mealType}</strong> for <strong>${currentTarget.dateLabel}</strong>?</p>
      <div style="background: var(--color-bg); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.85rem; border: 1px solid var(--color-border);">
        ℹ️ The kitchen will not prepare this meal, and your plan validity will not be deducted for this meal.
      </div>
    `;
    btnConfirm.textContent = 'Yes, Pause Meal';
    btnConfirm.className = 'btn btn-primary';

    btnConfirm.onclick = async () => {
      btnConfirm.textContent = 'Pausing...';
      btnConfirm.disabled = true;
      try {
        await api.pauseNextMeal('meal_current_2');
        closeModal();
        if (onStateChange) onStateChange();
        promptPushPermissionContextual();
      } catch (err) {
        alert(err.message || 'Failed to pause meal');
      } finally {
        btnConfirm.disabled = false;
      }
    };

    modal.classList.add('active');
  });

  // Pause Indefinitely / Resume Handler
  const btnToggleIndefinite = containerElement.querySelector('#btn-indefinite-toggle');
  btnToggleIndefinite.addEventListener('click', () => {
    if (isIndefinitelyPaused) {
      // RESUME ACTION
      modalTitle.textContent = 'Resume Deliveries?';
      modalBody.innerHTML = `
        <p style="margin-bottom: 0.75rem;">Deliveries will resume starting with your next scheduled meal according to standard delivery cutoffs.</p>
        <p style="font-weight: 600; color: var(--color-success);">Ready to enjoy fresh Cirota meals again?</p>
      `;
      btnConfirm.textContent = 'Yes, Resume Now';
      btnConfirm.className = 'btn btn-success';

      btnConfirm.onclick = async () => {
        btnConfirm.textContent = 'Resuming...';
        btnConfirm.disabled = true;
        try {
          await api.toggleIndefinitePause(false);
          closeModal();
          if (onStateChange) onStateChange();
        } catch (err) {
          alert(err.message || 'Failed to resume');
        } finally {
          btnConfirm.disabled = false;
        }
      };
    } else {
      // PAUSE INDEFINITELY ACTION
      modalTitle.textContent = 'Pause Deliveries Indefinitely?';
      modalBody.innerHTML = `
        <p style="margin-bottom: 0.75rem;">Are you travelling or need a break? Pausing indefinitely will halt all upcoming deliveries until you manually hit Resume.</p>
        <div style="background: var(--color-danger-soft); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--color-danger); border: 1px solid var(--color-danger);">
          ⚠️ Your remaining balance stays completely preserved and will freeze until you resume.
        </div>
      `;
      btnConfirm.textContent = 'Pause All Deliveries';
      btnConfirm.className = 'btn btn-danger';

      btnConfirm.onclick = async () => {
        btnConfirm.textContent = 'Pausing...';
        btnConfirm.disabled = true;
        try {
          await api.toggleIndefinitePause(true);
          closeModal();
          if (onStateChange) onStateChange();
        } catch (err) {
          alert(err.message || 'Failed to pause indefinitely');
        } finally {
          btnConfirm.disabled = false;
        }
      };
    }

    modal.classList.add('active');
  });
}
