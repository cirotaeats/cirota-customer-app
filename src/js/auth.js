/**
 * Customer Authentication (standalone app — one role only)
 */
import { CONFIG } from './config.js';
import { api } from './api.js';

export const auth = {
  isCustomerAuthenticated() {
    return !!localStorage.getItem(CONFIG.STORAGE_KEYS.CUSTOMER_TOKEN);
  },

  getCustomerToken() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.CUSTOMER_TOKEN);
  },

  getCustomerUser() {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.CUSTOMER_USER);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async loginCustomerWithOtp(phone, otp) {
    const res = await api.verifyOtp(phone, otp);
    if (res.token) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.CUSTOMER_TOKEN, res.token);
      if (res.customer) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.CUSTOMER_USER, JSON.stringify(res.customer));
      }
      return res;
    }
    throw new Error('Invalid OTP verification');
  },

  logoutCustomer() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.CUSTOMER_TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.CUSTOMER_USER);
    window.location.hash = '#/login';
  }
};
