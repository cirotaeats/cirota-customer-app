/**
 * Meal Carousel Component (§4a Left Column)
 * Swipeable filmstrip featuring:
 * - Center: Current upcoming meal with dish image, caption, and estimated arrival time
 * - Right of center: Next 3 upcoming meals scaled down (100% -> 75% -> 55% -> 40%)
 * - Left of center: One previous delivered meal (desaturated + delivered badge)
 * - Modify Order CTA targeting the active meal
 */

export function renderMealCarousel(meals = [], containerElement) {
  if (!containerElement) return;

  if (!meals || meals.length === 0) {
    containerElement.innerHTML = `
      <div class="meal-carousel-card">
        <p style="text-align: center; color: var(--color-text-muted); padding: 2rem;">No upcoming meals scheduled.</p>
      </div>
    `;
    return;
  }

  // Identify previous delivered meal, current active upcoming meal, and subsequent future meals
  let currentIdx = meals.findIndex(m => m.status === 'upcoming');
  if (currentIdx === -1) currentIdx = 0;

  const prevMeal = currentIdx > 0 ? meals[currentIdx - 1] : null;
  const currentMeal = meals[currentIdx];
  const nextMeals = meals.slice(currentIdx + 1, currentIdx + 4);

  // Build the filmstrip HTML
  let trackHtml = '';

  // 1. Previous Delivered Meal (Left of Center)
  if (prevMeal) {
    trackHtml += `
      <div class="carousel-item prev-meal" data-meal-id="${prevMeal.id}" title="Previously Delivered">
        <div class="meal-img-box">
          <img src="${prevMeal.image_url}" alt="${prevMeal.dish_name}" loading="lazy" />
          <span class="delivered-badge">✓ Delivered</span>
        </div>
      </div>
    `;
  }

  // 2. Current Active Upcoming Meal (Center)
  trackHtml += `
    <div class="carousel-item center-meal" data-meal-id="${currentMeal.id}">
      <div class="meal-img-box">
        <img src="${currentMeal.image_url}" alt="${currentMeal.dish_name}" />
      </div>
      <div class="meal-details-center">
        <div class="meal-title-main">${currentMeal.dish_name}</div>
        <div class="meal-delivery-time">
          <span>🕒</span>
          <span>${currentMeal.estimated_delivery}</span>
        </div>
      </div>
    </div>
  `;

  // 3. Next 3 Upcoming Meals (Right of Center filmstrip)
  nextMeals.forEach((meal, idx) => {
    const scaleClass = `next-${idx + 1}`;
    trackHtml += `
      <div class="carousel-item ${scaleClass}" data-meal-id="${meal.id}" title="${meal.dish_name} (${meal.meal_type})">
        <div class="meal-img-box">
          <img src="${meal.image_url}" alt="${meal.dish_name}" loading="lazy" />
        </div>
      </div>
    `;
  });

  containerElement.innerHTML = `
    <div class="meal-carousel-card">
      <div class="carousel-header">
        <span class="carousel-badge">✨ Today's Tiffin Schedule</span>
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted);">Swipe for upcoming</span>
      </div>

      <div class="carousel-viewport">
        <div class="carousel-track" id="meal-carousel-track">
          ${trackHtml}
        </div>
      </div>

      <div class="carousel-controls">
        <button class="carousel-nav-btn" id="carousel-btn-prev" aria-label="Previous meal">‹</button>
        <button class="carousel-nav-btn" id="carousel-btn-next" aria-label="Next meal">›</button>
      </div>

      <div style="display:flex; gap:0.6rem; margin-top: 0.5rem;">
        <a href="#/modify-order?orderId=${currentMeal.order_id || currentMeal.id}" class="btn btn-primary btn-full">
          <span>✏️</span>
          <span>Modify</span>
        </a>
        <a href="#/track?orderId=${currentMeal.order_id || currentMeal.id}" class="btn btn-accent btn-full">
          <span>📍</span>
          <span>Track Delivery</span>
        </a>
      </div>
    </div>
  `;

  // Setup Carousel Nav Buttons
  const track = containerElement.querySelector('#meal-carousel-track');
  const btnPrev = containerElement.querySelector('#carousel-btn-prev');
  const btnNext = containerElement.querySelector('#carousel-btn-next');

  if (btnPrev && btnNext && track) {
    btnPrev.addEventListener('click', () => {
      track.scrollBy({ left: -220, behavior: 'smooth' });
    });
    btnNext.addEventListener('click', () => {
      track.scrollBy({ left: 220, behavior: 'smooth' });
    });
  }
}
