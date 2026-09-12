/**
 * Cirota Customer App Configuration
 */
export const CONFIG = {
  USE_MOCKS: true,                        // Set to false when connecting to deployed backend
  BASE_URL: 'http://localhost:3000/api',  // Backend API URL (override for deployed Railway URL)
  RAZORPAY_KEY_ID: 'rzp_test_cirota12345',// Razorpay Key ID (safe for client-side)

  // How often the tracking screen re-checks the rider's live location (ms)
  TRACKING_POLL_INTERVAL_MS: 15000,

  MEAL_TIMES: {
    breakfast: { time: '08:30', cutoffHours: 3 },
    lunch:     { time: '13:00', cutoffHours: 3 },
    dinner:    { time: '20:00', cutoffHours: 3 },
  },

  STORAGE_KEYS: {
    CUSTOMER_TOKEN: 'cirota_customer_token',
    CUSTOMER_USER:  'cirota_customer_user',
  }
};
