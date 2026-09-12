/**
 * Cirota Customer App — API Client
 */
import { CONFIG } from './config.js';
import { delay } from './mocks/mock-delay.js';
import {
  MOCK_PLANS,
  MOCK_ADDONS,
  MOCK_CUSTOMERS,
  MOCK_MEALS_SEQUENCE,
  MOCK_PAYMENTS
} from './mocks/mock-data.js';

// In-Memory mutable copies for interactive Mock Session
let currentMockUserKey = 'cust_active_1'; // Active persona by default
let localCustomers = JSON.parse(JSON.stringify(MOCK_CUSTOMERS));
let localMeals = JSON.parse(JSON.stringify(MOCK_MEALS_SEQUENCE));

export function setMockActivePersona(personaKey) {
  if (localCustomers[personaKey]) {
    currentMockUserKey = personaKey;
  }
}

export function getMockActivePersonaKey() {
  return currentMockUserKey;
}

function getToken() {
  return localStorage.getItem(CONFIG.STORAGE_KEYS.CUSTOMER_TOKEN);
}

async function httpFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const url = `${CONFIG.BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.CUSTOMER_TOKEN);
      localStorage.removeItem(CONFIG.STORAGE_KEYS.CUSTOMER_USER);
      window.location.hash = '#/login';
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || errData.message || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.data !== undefined ? data.data : data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // ==========================================
  // CUSTOMER AUTH & PROFILE
  // ==========================================
  async requestOtp(phone) {
    if (CONFIG.USE_MOCKS) {
      await delay(400);
      return { success: true, message: `OTP 1234 sent to +91 ${phone}` };
    }
    return httpFetch('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  },

  async verifyOtp(phone, otp) {
    if (CONFIG.USE_MOCKS) {
      await delay(500);
      const user = localCustomers[currentMockUserKey] || localCustomers['cust_active_1'];
      return {
        token: 'mock_jwt_customer_token_xyz',
        customer: user
      };
    }
    return httpFetch('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp })
    });
  },

  async getCustomerMe() {
    if (CONFIG.USE_MOCKS) {
      await delay(250);
      const user = localCustomers[currentMockUserKey] || localCustomers['cust_active_1'];
      const plan = MOCK_PLANS.find(p => p.id === user.plan_id) || MOCK_PLANS[0];
      return {
        customer: { ...user },
        plan: { ...plan }
      };
    }
    return httpFetch('/customer/me', { method: 'GET' });
  },

  // ==========================================
  // PLANS & CATALOG
  // ==========================================
  async getPlans() {
    if (CONFIG.USE_MOCKS) {
      await delay(200);
      return { plans: MOCK_PLANS };
    }
    return httpFetch('/menu/plans', { method: 'GET' });
  },

  async getAddOns() {
    if (CONFIG.USE_MOCKS) {
      await delay(200);
      return { addons: MOCK_ADDONS };
    }
    return httpFetch('/menu/add-ons', { method: 'GET' });
  },

  // ==========================================
  // MEALS CAROUSEL & ACTIONS
  // ==========================================
  async getUpcomingMeals() {
    if (CONFIG.USE_MOCKS) {
      await delay(300);
      return { meals: [...localMeals] };
    }
    return httpFetch('/customer/orders/upcoming', { method: 'GET' });
  },

  async pauseNextMeal(mealId) {
    if (CONFIG.USE_MOCKS) {
      await delay(400);
      // Mark meal paused in mock
      const target = localMeals.find(m => m.id === mealId || m.status === 'upcoming');
      if (target) {
        target.is_paused = true;
      }
      return { success: true, message: `Successfully paused meal.` };
    }
    return httpFetch('/customer/pause/next-meal', { method: 'POST' });
  },

  async toggleIndefinitePause(shouldPause) {
    if (CONFIG.USE_MOCKS) {
      await delay(450);
      const user = localCustomers[currentMockUserKey];
      if (user) {
        user.status = shouldPause ? 'paused_indefinite' : 'active';
      }
      return {
        success: true,
        status: user ? user.status : (shouldPause ? 'paused_indefinite' : 'active')
      };
    }
    return httpFetch(shouldPause ? '/customer/pause/indefinite' : '/customer/resume', {
      method: 'POST'
    });
  },

  async modifyDailyOrder(orderId, updatedComponents, priceDelta) {
    if (CONFIG.USE_MOCKS) {
      await delay(500);
      const meal = localMeals.find(m => m.order_id === orderId || m.id === orderId);
      if (meal) {
        meal.components = updatedComponents;
        meal.price_delta = priceDelta;
        meal.is_modified = true;
      }
      return { success: true, order: meal };
    }
    // The live backend currently only persists the roti/paratha count per tiffin
    // (fine-grained add-on line items are mock-only for now — see backend README).
    const rotiComponent = (updatedComponents || []).find(c => /roti|paratha/i.test(c.name || ''));
    return httpFetch(`/customer/orders/${orderId}/modify`, {
      method: 'PATCH',
      body: JSON.stringify({ roti_paratha_count: rotiComponent ? rotiComponent.quantity : 0 })
    });
  },

  async cancelSubscription() {
    if (CONFIG.USE_MOCKS) {
      await delay(600);
      const user = localCustomers[currentMockUserKey];
      if (user) {
        user.status = 'stopped_no_balance';
        user.validity_days_remaining = 0;
        user.meals_remaining_count = 0;
      }
      return { success: true, message: 'Subscription cancelled.' };
    }
    return httpFetch('/customer/plan/cancel', { method: 'POST' });
  },

  async changePlan(newPlanId, frequency) {
    if (CONFIG.USE_MOCKS) {
      await delay(600);
      const user = localCustomers[currentMockUserKey];
      if (user) {
        user.plan_id = newPlanId;
        user.frequency = frequency;
      }
      return { success: true, message: 'Plan updated successfully.' };
    }
    return httpFetch('/customer/plan/change', {
      method: 'POST',
      body: JSON.stringify({ new_plan_id: newPlanId, frequency })
    });
  },

  // ==========================================
  // PAYMENTS & RAZORPAY
  // ==========================================
  async createPaymentOrder(planId, frequency = 'times_2', durationDays = 30) {
    if (CONFIG.USE_MOCKS) {
      await delay(350);
      const plan = MOCK_PLANS.find(p => p.id === planId) || MOCK_PLANS[0];
      let rupees;
      if (durationDays === 1) {
        rupees = plan.trial_price || 50;
      } else if (durationDays === 30) {
        rupees = plan.pricing[frequency]?.monthly || 3299;
      } else {
        const shortOption = plan.short_term_options.find(s => s.days === durationDays);
        rupees = shortOption
          ? (frequency === 'times_3' ? shortOption.price_3_times : frequency === 'times_2' ? shortOption.price_2_times : shortOption.price_1_time)
          : 3299;
      }
      return {
        id: `order_rzp_${Date.now()}`,
        amount: rupees * 100, // paise
        currency: 'INR',
        plan_id: planId,
        frequency: frequency
      };
    }
    return httpFetch('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId, frequency, duration_days: durationDays })
    });
  },

  async verifyPayment(paymentPayload) {
    if (CONFIG.USE_MOCKS) {
      await delay(500);
      // Activate the user in mock
      const user = localCustomers[currentMockUserKey];
      if (user) {
        user.status = 'active';
        user.validity_days_remaining = 30;
        user.meals_remaining_count = 60;
      }
      return { success: true, status: 'confirmed' };
    }
    // The live backend deliberately has no client-side "verify" endpoint —
    // Razorpay payment confirmation is done server-to-server via a signed webhook
    // (see backend/src/routes/payments.js `/webhook`), which is the secure pattern.
    // This call only fires from the offline/simulated-checkout fallback, so it's a no-op here;
    // real confirmation is picked up by pollForConfirmation() polling /customer/me.
    return { success: true, status: 'pending_webhook' };
  },

  async getPaymentHistory() {
    if (CONFIG.USE_MOCKS) {
      await delay(300);
      return { payments: MOCK_PAYMENTS };
    }
    return httpFetch('/payments/history', { method: 'GET' });
  },

  // ==========================================
  // PUSH NOTIFICATIONS
  // ==========================================
  async getVapidPublicKey() {
    if (CONFIG.USE_MOCKS) {
      await delay(150);
      // Mock VAPID public key (URL-safe base64)
      return { vapidPublicKey: 'BCv_1vN5yU4c2pG1y_n8V1P8oJk4N3U_d7f9s0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6' };
    }
    return httpFetch('/push/vapid-public-key', { method: 'GET' });
  },

  async registerPushSubscription(subscriptionJson) {
    if (CONFIG.USE_MOCKS) {
      await delay(200);
      console.log('Mock: Push subscription stored on mock backend:', subscriptionJson);
      return { success: true };
    }
    return httpFetch('/customer/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscriptionJson)
    });
  },

  // ==========================================
  // LIVE DELIVERY TRACKING
  // ==========================================
  async getOrderTracking(orderId) {
    if (CONFIG.USE_MOCKS) {
      await delay(300);
      // Simulate a rider ~1.2km away, slowly approaching, for demo purposes
      const now = Date.now();
      const wobble = Math.sin(now / 4000) * 0.002;
      return {
        tracking: true,
        partner: { name: 'Ramesh Kumar', phone: '9876543210' },
        rider_location: { lat: 23.3745 + wobble, lng: 85.3312 + wobble },
        customer_location: { lat: 23.3695, lng: 85.3260 },
        distance_km: 1.2,
        eta_minutes: 9,
        updated_at: new Date().toISOString()
      };
    }
    return httpFetch(`/customer/orders/${orderId}/tracking`, { method: 'GET' });
  }
};
