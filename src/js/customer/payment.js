/**
 * Razorpay Checkout & Payment History Module (§7.1)
 * Full client-side Razorpay flow with server-side polling verification.
 */
import { CONFIG } from '../config.js';
import { api } from '../api.js';
import { promptPushPermissionContextual } from '../push.js';

export async function startCheckout(planId, frequency = 'times_2', durationDays = 30, customer = null, onComplete = null) {
  try {
    // 1. Create order on backend (server defines price)
    const order = await api.createPaymentOrder(planId, frequency, durationDays);

    const custName = customer?.name || 'Cirota Subscriber';
    const custPhone = customer?.phone || '9876543210';

    // 2. Open Razorpay Checkout
    const options = {
      key: CONFIG.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'Cirota Tiffin Service',
      description: `Tiffin Subscription (${durationDays} Days)`,
      order_id: order.id,
      prefill: {
        name: custName,
        contact: custPhone
      },
      theme: {
        color: '#4A1D6E' // matches --color-primary
      },
      handler: async function (response) {
        // UX signal received from client -> Start server polling loop (§7.1)
        showPaymentProcessingModal();
        await pollForConfirmation(customer?.id || 'cust_active_1', onComplete);
      },
      modal: {
        ondismiss: function () {
          console.info('Razorpay checkout modal closed by user');
        }
      }
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description || 'Transaction unsuccessful'}`);
      });
      rzp.open();
    } else {
      // Fallback in case Razorpay SDK is blocked / offline simulation
      console.warn('Razorpay script not loaded, running simulated checkout verification');
      showPaymentProcessingModal();
      await api.verifyPayment({ order_id: order.id, payment_id: 'pay_simulated_123' });
      await pollForConfirmation(customer?.id || 'cust_active_1', onComplete);
    }
  } catch (err) {
    console.error('Checkout error:', err);
    alert(err.message || 'Failed to initiate checkout');
  }
}

function showPaymentProcessingModal() {
  let modal = document.getElementById('payment-processing-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'payment-processing-modal';
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal-card" style="text-align: center; padding: 2.5rem;">
        <div style="font-size: 3rem; animation: spin 1s infinite linear; display: inline-block;">⏳</div>
        <h3 style="color: var(--color-primary); margin: 1rem 0 0.5rem 0;">Verifying Payment...</h3>
        <p style="font-size: 0.9rem; color: var(--color-text-muted);">
          Please wait while we confirm your transaction with your bank.
        </p>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }
}

function hidePaymentProcessingModal() {
  const modal = document.getElementById('payment-processing-modal');
  if (modal) modal.classList.remove('active');
}

/**
 * Polling loop verifying server state after payment callback (§7.1)
 */
async function pollForConfirmation(customerId, onComplete, attempts = 0) {
  if (attempts > 10) {
    hidePaymentProcessingModal();
    alert('Payment is still processing with your bank. Your subscription balance will update shortly.');
    if (onComplete) onComplete();
    return;
  }

  try {
    const { customer } = await api.getCustomerMe();
    if (customer && customer.status === 'active') {
      hidePaymentProcessingModal();
      showPaymentSuccessModal(onComplete);
      promptPushPermissionContextual();
      return;
    }
  } catch (e) {
    console.warn('Polling check error:', e);
  }

  setTimeout(() => pollForConfirmation(customerId, onComplete, attempts + 1), 1500);
}

function showPaymentSuccessModal(onComplete) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal-card" style="text-align: center; padding: 2.5rem;">
      <div style="font-size: 3.5rem; color: var(--color-success); margin-bottom: 0.5rem;">🎉</div>
      <h3 style="color: var(--color-primary); font-size: 1.5rem; margin-bottom: 0.5rem;">Payment Confirmed!</h3>
      <p style="font-size: 0.95rem; color: var(--color-text-muted); margin-bottom: 1.5rem;">
        Your Cirota tiffin subscription is now active. Fresh meals will be delivered right on time!
      </p>
      <button class="btn btn-primary btn-full" id="btn-success-dashboard">Go to Dashboard</button>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#btn-success-dashboard').addEventListener('click', () => {
    modal.remove();
    if (onComplete) {
      onComplete();
    } else {
      window.location.hash = '#/dashboard';
    }
  });
}

/**
 * Render Payment History View (§4 item 6)
 */
export async function renderPaymentHistoryView(containerElement) {
  if (!containerElement) return;

  containerElement.innerHTML = `
    <div style="text-align: center; padding: 3rem;">
      <div class="skeleton" style="height: 250px; width: 100%; max-width: 700px; margin: 0 auto;"></div>
    </div>
  `;

  try {
    const { payments } = await api.getPaymentHistory();

    let rowsHtml = '';
    payments.forEach(p => {
      rowsHtml += `
        <tr>
          <td style="font-weight: 700; color: var(--color-primary);">${p.id}</td>
          <td>${p.date}</td>
          <td>${p.plan_name}</td>
          <td style="font-weight: 700;">₹${p.amount}</td>
          <td>${p.method}</td>
          <td>
            <span class="status-pill ${p.status === 'success' ? 'status-active' : 'status-stopped'}">
              ${p.status === 'success' ? '✓ Successful' : '✕ Failed'}
            </span>
          </td>
        </tr>
      `;
    });

    containerElement.innerHTML = `
      <div style="max-width: 850px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <a href="#/dashboard" class="btn btn-outline btn-sm">← Back to Dashboard</a>
          <h2 style="font-size: 1.4rem;">Payment History</h2>
        </div>

        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Date & Time</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    containerElement.innerHTML = `
      <div class="cirota-card" style="text-align: center; margin: 2rem auto; max-width: 500px;">
        <h3 style="color: var(--color-danger);">Error Loading Payments</h3>
        <p>${err.message}</p>
        <a href="#/dashboard" class="btn btn-primary" style="margin-top: 1rem;">Back</a>
      </div>
    `;
  }
}
