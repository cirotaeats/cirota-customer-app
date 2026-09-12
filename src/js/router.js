/**
 * Cirota Customer App — Router (single-role app, no hostname switching needed)
 */
import { CONFIG } from './config.js';
import { auth } from './auth.js';
import { api } from './api.js';

import { renderCustomerDashboard } from './customer/dashboard.js';
import { renderSubscribeView } from './customer/subscribe.js';
import { renderModifyOrderView } from './customer/modify-order.js';
import { renderPlanView } from './customer/plan.js';
import { renderPaymentHistoryView } from './customer/payment.js';
import { renderTrackingView, stopPolling } from './customer/tracking.js';

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('DOMContentLoaded', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || '#/dashboard';
  const appContainer = document.getElementById('app-content');
  const headerContainer = document.getElementById('app-header-container');
  const [routePath, queryString] = hash.split('?');
  const params = new URLSearchParams(queryString || '');

  // Stop any live-tracking polling/map when navigating away from that screen
  if (routePath !== '#/track') stopPolling();

  renderHeader(headerContainer);
  renderMobileNav();

  const isAuthed = auth.isCustomerAuthenticated() || CONFIG.USE_MOCKS;

  if (routePath === '#/login') {
    renderCustomerLogin(appContainer);
    return;
  }

  if (routePath === '#/subscribe') {
    renderSubscribeView(appContainer);
    return;
  }

  if (!isAuthed) {
    renderCustomerLogin(appContainer);
    return;
  }

  switch (routePath) {
    case '#/':
    case '#/dashboard':
      renderCustomerDashboard(appContainer);
      break;
    case '#/modify-order':
      renderModifyOrderView(appContainer, params.get('orderId'));
      break;
    case '#/track':
      renderTrackingView(appContainer, params.get('orderId'));
      break;
    case '#/plan':
      renderPlanView(appContainer);
      break;
    case '#/payments':
      renderPaymentHistoryView(appContainer);
      break;
    default:
      renderCustomerDashboard(appContainer);
      break;
  }
}

function renderHeader(container) {
  if (!container) return;
  const hash = window.location.hash || '#/dashboard';

  container.innerHTML = `
    <div class="header-container">
      <a href="#/dashboard" class="brand-logo">
        <div class="logo-mark">
          <svg viewBox="0 0 24 24">
            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-title">CIROTA</span>
          <span class="brand-tagline">cirota.sleep.repeat</span>
        </div>
      </a>
      <nav class="nav-actions">
        <a href="#/dashboard" class="nav-link ${hash.includes('dashboard') || hash === '#/' ? 'active' : ''}">Home</a>
        <a href="#/plan" class="nav-link ${hash.includes('plan') ? 'active' : ''}">My Plan</a>
        <a href="#/payments" class="nav-link ${hash.includes('payments') ? 'active' : ''}">Payments</a>
        <a href="#/subscribe" class="btn btn-accent btn-sm" style="margin-left:6px;">+ New Plan</a>
      </nav>
    </div>
  `;
}

function renderMobileNav() {
  const mobileNavContainer = document.getElementById('app-mobile-nav');
  if (!mobileNavContainer) return;
  const hash = window.location.hash || '#/dashboard';

  if (hash.includes('login')) {
    mobileNavContainer.style.display = 'none';
    return;
  }
  mobileNavContainer.style.display = '';

  const isHome = hash.includes('dashboard') || hash === '#/' || hash.includes('modify-order') || hash.includes('track');
  const isPlan = hash.includes('plan');
  const isPay = hash.includes('payments');
  const isSub = hash.includes('subscribe');

  mobileNavContainer.innerHTML = `
    <a href="#/dashboard" class="mobile-nav-item ${isHome ? 'active' : ''}">
      <span class="mobile-nav-icon">🏠</span><span>Home</span>
    </a>
    <a href="#/plan" class="mobile-nav-item ${isPlan ? 'active' : ''}">
      <span class="mobile-nav-icon">🍱</span><span>My Plan</span>
    </a>
    <a href="#/payments" class="mobile-nav-item ${isPay ? 'active' : ''}">
      <span class="mobile-nav-icon">💳</span><span>Payments</span>
    </a>
    <a href="#/subscribe" class="mobile-nav-item ${isSub ? 'active' : ''}">
      <span class="mobile-nav-icon">➕</span><span>New Plan</span>
    </a>
  `;
}

function renderCustomerLogin(container) {
  let step = 1;
  let enteredPhone = '';

  function renderForm() {
    container.innerHTML = `
      <div class="cirota-card" style="max-width: 420px; margin: 3rem auto; text-align: center; padding: 2.5rem 2rem;">
        <div class="logo-mark" style="margin: 0 auto 1.25rem auto; width: 56px; height: 56px;">
          <svg viewBox="0 0 24 24" style="width: 32px; height: 32px;">
            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
          </svg>
        </div>

        <h1 style="font-size: 1.6rem; color: var(--color-primary); margin-bottom: 0.25rem;">
          ${step === 1 ? 'Customer Login' : 'Enter Verification Code'}
        </h1>
        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 1.5rem;">
          ${step === 1 ? 'Enter your mobile number to access your daily tiffin plan.' : `We sent an OTP to +91 ${enteredPhone}`}
        </p>

        ${step === 1 ? `
          <form id="otp-phone-form">
            <div class="form-group" style="text-align: left;">
              <label class="form-label">Mobile Number (Ranchi)</label>
              <input type="tel" class="form-input" id="login-phone-input" placeholder="e.g. 9876543210" value="9876543210" required />
            </div>
            <button type="submit" class="btn btn-primary btn-full" id="btn-request-otp" style="margin-top: 1rem;">
              Send OTP Code
            </button>
          </form>
        ` : `
          <form id="otp-verify-form">
            <div class="form-group" style="text-align: left;">
              <label class="form-label">4-Digit OTP</label>
              <input type="text" class="form-input" id="login-otp-input" placeholder="e.g. 1234" value="1234" maxlength="6" style="text-align:center;letter-spacing:6px;font-size:1.4rem;font-weight:700;" required />
            </div>
            <button type="submit" class="btn btn-accent btn-full" id="btn-verify-otp" style="margin-top: 1rem;">
              Verify & Login
            </button>
            <div style="margin-top: 1rem;">
              <button type="button" class="btn btn-outline btn-sm" id="btn-back-phone">← Change Phone</button>
            </div>
          </form>
        `}

        <div style="margin-top: 2rem; border-top: 1px dashed var(--color-border); padding-top: 1rem;">
          <p style="font-size: 0.82rem; color: var(--color-text-muted);">
            New to Cirota? <a href="#/subscribe" style="font-weight:700;">Subscribe to a Plan</a>
          </p>
        </div>
      </div>
    `;

    if (step === 1) {
      container.querySelector('#otp-phone-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = container.querySelector('#login-phone-input').value;
        const btn = container.querySelector('#btn-request-otp');
        btn.disabled = true;
        btn.textContent = 'Sending OTP...';
        try {
          await api.requestOtp(phone);
          enteredPhone = phone;
          step = 2;
          renderForm();
        } catch (err) {
          alert(err.message || 'Failed to send OTP');
          btn.disabled = false;
          btn.textContent = 'Send OTP Code';
        }
      });
    } else {
      container.querySelector('#otp-verify-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = container.querySelector('#login-otp-input').value;
        const btn = container.querySelector('#btn-verify-otp');
        btn.disabled = true;
        btn.textContent = 'Verifying...';
        try {
          await auth.loginCustomerWithOtp(enteredPhone, otp);
          window.location.hash = '#/dashboard';
        } catch (err) {
          alert(err.message || 'Invalid OTP');
          btn.disabled = false;
          btn.textContent = 'Verify & Login';
        }
      });

      container.querySelector('#btn-back-phone').addEventListener('click', () => {
        step = 1;
        renderForm();
      });
    }
  }

  renderForm();
}
