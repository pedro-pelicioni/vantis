<template>
  <div class="select-amount-page">
    <StatusBar />
    <Header title="Select amount" @back="$router.back()" @help="showHelp" />

    <div class="content">
      <div class="funding-info">
        <span class="text-secondary">Available funding: </span>
        <span class="text-primary">11,68</span>
        <span class="help-icon" @click="showFundingInfo">?</span>
      </div>

      <div class="amount-card">
        <div class="currency-icon">
          <div class="icon-circle">
            <span class="dollar">$</span>
            <span class="native-text">NATIVE</span>
          </div>
        </div>
        <div class="amount-display">
          <input 
            v-model="amount" 
            type="text" 
            class="amount-input"
            placeholder="0"
          />
          <div class="amount-underline"></div>
        </div>
      </div>

      <div class="percentage-buttons">
        <button 
          v-for="percent in percentages" 
          :key="percent"
          :class="['percent-btn', { active: selectedPercent === percent }]"
          @click="selectPercent(percent)"
        >
          {{ percent }}%
        </button>
      </div>

      <div class="acknowledgment">
        <input 
          type="checkbox" 
          id="acknowledge" 
          v-model="acknowledged"
          class="checkbox"
        />
        <label for="acknowledge" class="text-primary">
          I acknowledge the risks of borrowing this much against my collateral.
        </label>
      </div>

      <button 
        class="btn btn-primary continue-btn"
        :disabled="!acknowledged || !amount"
        @click="continueAction"
      >
        Continue
        <span>→</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const amount = ref('8.756664')
const selectedPercent = ref('75')
const acknowledged = ref(false)
const availableFunding = 11.68

const percentages = ['5', '25', '50', '75']

const selectPercent = (percent) => {
  selectedPercent.value = percent
  const calculatedAmount = (availableFunding * parseInt(percent)) / 100
  amount.value = calculatedAmount.toFixed(6)
}

const showHelp = () => {
  alert('Help information')
}

const showFundingInfo = () => {
  alert('Available funding information')
}

const continueAction = () => {
  if (acknowledged.value && amount.value) {
    // Navigate to next step
    console.log('Continue with amount:', amount.value)
  }
}
</script>

<style scoped>
.select-amount-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding-bottom: 80px;
}

.content {
  padding: 16px;
}

.funding-info {
  margin-bottom: 24px;
  font-size: 14px;
}

.help-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--shadow-color);
  margin-left: 8px;
  cursor: pointer;
  font-size: 12px;
}

.amount-card {
  background-color: var(--bg-card);
  border-radius: var(--border-radius);
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.currency-icon {
  flex-shrink: 0;
}

.icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--accent-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.dollar {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.native-text {
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%) rotate(-90deg);
  font-size: 10px;
  color: var(--text-primary);
  white-space: nowrap;
}

.amount-display {
  flex: 1;
}

.amount-input {
  width: 100%;
  background: none;
  border: none;
  color: var(--accent-red);
  font-size: 32px;
  font-weight: 700;
  outline: none;
}

.amount-underline {
  height: 2px;
  background-color: var(--accent-red);
  margin-top: 4px;
}

.percentage-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.percent-btn {
  flex: 1;
  padding: 12px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.percent-btn.active {
  background-color: var(--accent-teal);
  border-color: var(--accent-teal);
  color: var(--bg-primary);
}

.acknowledgment {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--bg-card);
  border-radius: var(--border-radius);
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

.continue-btn {
  width: 100%;
  justify-content: space-between;
}

.continue-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Tablet */
@media (min-width: 768px) {
  .select-amount-page {
    padding-bottom: 0;
  }
  
  .content {
    padding: 32px;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .amount-card {
    padding: 32px;
  }
  
  .amount-input {
    font-size: 48px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .content {
    max-width: 800px;
    padding: 48px;
  }
  
  .amount-card {
    padding: 48px;
  }
  
  .amount-input {
    font-size: 64px;
  }
  
  .percentage-buttons {
    max-width: 600px;
    margin: 0 auto 48px;
  }
  
  .continue-btn {
    max-width: 400px;
    margin: 0 auto;
  }
}
</style>

