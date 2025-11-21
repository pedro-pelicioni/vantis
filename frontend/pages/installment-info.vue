<template>
  <div class="installment-info-page">
    <StatusBar />
    <div class="content">
      <div class="installment-list">
        <div class="installment-item" v-for="plan in installmentPlans" :key="plan.installments">
          <div class="radio-button"></div>
          <div class="installment-details">
            <div class="installment-header">
              <span class="installment-count">{{ plan.installments }}</span>
              <span class="currency-icon">$</span>
              <span class="installment-amount">{{ plan.amount }}</span>
            </div>
            <div class="installment-apr">{{ plan.apr }}% APR</div>
          </div>
          <div class="installment-total">USDC {{ plan.total }}</div>
        </div>
      </div>

      <div class="info-section">
        <h3 class="info-title">How installment repayment works</h3>
        <p class="info-text">
          When you make a purchase using an installment plan, <span class="highlight">you must repay each installment manually before its due date</span>. If not, a 0.45% penalty is added every day the payment is late.
        </p>
        <div class="acknowledgment">
          <input type="checkbox" id="understand" v-model="understood" class="checkbox" />
          <label for="understand" class="text-primary">
            I understand I have to repay each installment before the due date to avoid daily penalties.
          </label>
        </div>
        <button class="btn btn-secondary close-btn" @click="$router.back()">
          Close
          <span>→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const understood = ref(false)

const installmentPlans = [
  { installments: '2x', amount: '50,32', apr: '5,57', total: '100,64' },
  { installments: '3x', amount: '33,62', apr: '5,67', total: '100,87' },
  { installments: '4x', amount: '25,27', apr: '5,58', total: '101,07' },
  { installments: '5x', amount: '20,25', apr: '5,37', total: '101,23' },
  { installments: '6x', amount: '16,91', apr: '5,44', total: '101,46' }
]
</script>

<style scoped>
.installment-info-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding-bottom: 80px;
}

.content {
  padding: 16px;
}

.installment-list {
  margin-bottom: 24px;
}

.installment-item {
  background-color: var(--bg-card);
  border-radius: var(--border-radius);
  padding: 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.radio-button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--text-secondary);
  flex-shrink: 0;
}

.installment-details {
  flex: 1;
}

.installment-header {
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

.installment-apr {
  font-size: 12px;
  color: var(--text-secondary);
}

.installment-total {
  font-size: 16px;
  font-weight: 700;
  text-align: right;
}

.info-section {
  background-color: var(--bg-card);
  border-radius: var(--border-radius);
  padding: 24px;
}

.info-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}

.info-text {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 24px;
}

.highlight {
  color: var(--accent-blue);
}

.acknowledgment {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--bg-primary);
  border-radius: 8px;
}

.checkbox {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  cursor: pointer;
}

.acknowledgment label {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
}

.close-btn {
  width: 100%;
  justify-content: space-between;
}
</style>

