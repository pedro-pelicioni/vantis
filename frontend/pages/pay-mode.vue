<template>
  <div class="pay-mode-page">
    <StatusBar />
    <div class="header">
      <h1 class="header-title">Pay Mode</h1>
      <button class="header-btn" @click="showHelp">?</button>
    </div>

    <div class="content">
      <div class="intro-text">
        <p>Choose <strong>Pay Now</strong> to pay from your USDC balance, or <strong>Pay Later</strong> to split your purchase into up to 9 fixed-rate USDC installments, powered by Exactly Protocol.*</p>
      </div>

      <div class="purchase-simulator">
        <span class="simulator-label">Simulate a purchase of</span>
        <div class="simulator-input">
          <span class="currency-label">USDC</span>
          <input type="number" v-model="purchaseAmount" class="amount-field" />
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h3 class="section-title">INSTANT PAY (USDC)</h3>
          <span class="section-limit">Available limit: USDC 14,80</span>
        </div>
        <div class="payment-option" :class="{ selected: selectedOption === 'instant' }" @click="selectOption('instant')">
          <div class="radio-button" :class="{ checked: selectedOption === 'instant' }"></div>
          <div class="option-content">
            <span class="option-label">Pay Now</span>
            <span class="option-amount">USDC {{ formatAmount(purchaseAmount) }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h3 class="section-title">INSTALLMENT PLANS</h3>
          <span class="section-limit">Credit limit: USDC 11,68</span>
        </div>
        <div 
          v-for="plan in installmentPlans" 
          :key="plan.installments"
          class="payment-option" 
          :class="{ selected: selectedOption === plan.installments }"
          @click="selectOption(plan.installments)"
        >
          <div class="radio-button" :class="{ checked: selectedOption === plan.installments }"></div>
          <div class="option-content">
            <div class="option-main">
              <span class="installment-count">{{ plan.installments }}x</span>
              <span class="currency-icon">$</span>
              <span class="installment-amount">{{ plan.amount }}</span>
            </div>
            <div class="option-apr">{{ plan.apr }}% APR</div>
          </div>
          <div class="option-total">USDC {{ plan.total }}</div>
        </div>
      </div>

      <div class="due-date-info">
        <p class="text-secondary">First due date: Dec 17, 2025 - then every 28 days.</p>
      </div>

      <div class="card">
        <h3 class="card-title">Upcoming payments</h3>
        <div class="empty-state">
          <div class="emoji">🎉</div>
          <p class="text-accent">You're all set!</p>
          <p class="text-secondary">Any funding or purchases will show up here.</p>
        </div>
      </div>

      <div class="footer-text">
        <p>Onchain credit is powered by Exactly Protocol and is subject to separate Terms and conditions. The Vantis App does not issue or guarantee any funding.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const purchaseAmount = ref(100)
const selectedOption = ref('4x')

const installmentPlans = [
  { installments: '1x', amount: '100,42', apr: '5,52', total: '100,42' },
  { installments: '2x', amount: '50,32', apr: '5,57', total: '100,64' },
  { installments: '3x', amount: '33,62', apr: '5,67', total: '100,87' },
  { installments: '4x', amount: '25,27', apr: '5,58', total: '101,07' },
  { installments: '5x', amount: '20,25', apr: '5,37', total: '101,23' },
  { installments: '6x', amount: '16,91', apr: '5,44', total: '101,46' },
  { installments: '7x', amount: '14,53', apr: '5,51', total: '101,68' },
  { installments: '8x', amount: '12,74', apr: '5,54', total: '101,90' },
  { installments: '9x', amount: '11,34', apr: '5,50', total: '102,10' }
]

const selectOption = (option) => {
  selectedOption.value = option
}

const formatAmount = (amount) => {
  return amount.toFixed(2).replace('.', ',')
}

const showHelp = () => {
  alert('Pay Mode help information')
}
</script>

<style scoped>
.pay-mode-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding-bottom: 80px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
}

.header-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
}

.content {
  padding: 16px;
}

.intro-text {
  margin-bottom: 24px;
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 14px;
}

.purchase-simulator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--bg-card);
  border-radius: var(--border-radius);
}

.simulator-label {
  color: var(--text-primary);
  font-size: 14px;
}

.simulator-input {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--bg-primary);
  padding: 8px 12px;
  border-radius: 8px;
}

.currency-label {
  color: var(--text-secondary);
  font-size: 14px;
}

.amount-field {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  width: 80px;
  outline: none;
}

.section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-limit {
  font-size: 12px;
  color: var(--text-secondary);
}

.payment-option {
  background-color: var(--bg-card);
  border-radius: var(--border-radius);
  padding: 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-option.selected {
  background-color: var(--accent-teal-dark);
}

.radio-button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--text-secondary);
  flex-shrink: 0;
  position: relative;
}

.radio-button.checked {
  border-color: var(--accent-teal);
  background-color: var(--accent-teal);
}

.radio-button.checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--bg-primary);
  font-size: 14px;
  font-weight: 700;
}

.option-content {
  flex: 1;
}

.option-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.option-amount {
  display: block;
  font-size: 18px;
  font-weight: 700;
}

.option-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.installment-count {
  font-size: 16px;
  font-weight: 700;
}

.currency-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--accent-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
}

.installment-amount {
  font-size: 16px;
  font-weight: 600;
}

.option-apr {
  font-size: 12px;
  color: var(--text-secondary);
}

.option-total {
  font-size: 16px;
  font-weight: 700;
  text-align: right;
}

.due-date-info {
  margin-bottom: 24px;
  padding: 0 4px;
}

.due-date-info p {
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
}

.emoji {
  font-size: 48px;
  margin-bottom: 16px;
}

.footer-text {
  padding: 16px 0;
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
}

/* Tablet */
@media (min-width: 768px) {
  .pay-mode-page {
    padding-bottom: 0;
  }
  
  .content {
    padding: 32px;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .purchase-simulator {
    padding: 24px;
  }
  
  .payment-option {
    padding: 20px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .content {
    max-width: 1000px;
    padding: 48px;
  }
  
  .section {
    margin-bottom: 32px;
  }
  
  .payment-option {
    padding: 24px;
    font-size: 18px;
  }
  
  .installment-amount {
    font-size: 20px;
  }
  
  .option-total {
    font-size: 20px;
  }
}
</style>

