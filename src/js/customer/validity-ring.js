/**
 * Circular Validity Countdown Ring (§4a Right Column item 1)
 * Animated SVG circle showing validity days left with dynamic urgency color shifts.
 */

export function renderValidityRing(daysRemaining = 0, totalDays = 30, containerElement) {
  if (!containerElement) return;

  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.82
  const safeTotal = totalDays > 0 ? totalDays : 30;
  const clampedRemaining = Math.max(0, Math.min(daysRemaining, safeTotal));
  
  // Calculate percentage and stroke-dashoffset
  const progressRatio = clampedRemaining / safeTotal;
  const dashOffset = circumference * (1 - progressRatio);

  // Determine urgency color class
  let urgencyClass = '';
  let urgencyNote = 'Subscription Active';

  if (clampedRemaining <= 0) {
    urgencyClass = 'urgency-low';
    urgencyNote = 'Subscription Expired — Please Renew';
  } else if (clampedRemaining <= 3) {
    urgencyClass = 'urgency-low';
    urgencyNote = '⚠️ Plan expiring very soon!';
  } else if (clampedRemaining <= 7) {
    urgencyClass = 'urgency-medium';
    urgencyNote = 'Plan renewal approaching';
  }

  containerElement.innerHTML = `
    <div class="validity-card">
      <div class="card-header" style="width: 100%; margin-bottom: 0;">
        <span class="card-title" style="font-size: 1.1rem;">
          <span>⏳</span>
          <span>Plan Validity</span>
        </span>
        <a href="#/plan" class="btn btn-outline-accent btn-sm">Manage</a>
      </div>

      <div class="ring-container">
        <svg class="ring-svg" viewBox="0 0 170 170">
          <!-- Background Track -->
          <circle
            class="ring-track"
            cx="85"
            cy="85"
            r="${radius}"
          />
          <!-- Progress Stroke -->
          <circle
            class="ring-progress ${urgencyClass}"
            cx="85"
            cy="85"
            r="${radius}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${dashOffset}"
          />
        </svg>

        <div class="ring-center-content">
          <span class="ring-number">${clampedRemaining}</span>
          <span class="ring-label">Days Left</span>
        </div>
      </div>

      <div class="validity-info-sub" style="font-weight: 600; color: ${clampedRemaining <= 3 ? 'var(--color-danger)' : 'var(--color-text-muted)'};">
        ${urgencyNote}
      </div>
    </div>
  `;
}
