<template>
  <div class="defi-page">
    <StatusBar />
    <div class="header">
      <button class="header-btn" @click="$router.back()">←</button>
      <h1 class="header-title">DeFi</h1>
      <button class="header-btn" @click="showHelp">?</button>
    </div>

    <div class="content">
      <div class="intro-text">
        <p>Get fixed-interest funding using your assets as collateral, no credit check needed. Choose an amount and repayment plan to receive USDC.</p>
      </div>

      <div class="card funding-card">
        <h3 class="card-title">Available funding</h3>
        <div class="funding-amount">
          <div class="currency-icon-small">
            <div class="icon-circle-small">
              <span class="dollar-small">$</span>
              <span class="native-small">NATIVE</span>
            </div>
          </div>
          <div class="amount-value">11,68</div>
        </div>
        <div class="due-dates">
          <p class="text-secondary">Next due date: Dec 17, 2025</p>
          <p class="text-secondary">Installments due: Every 28 days</p>
        </div>
        <button class="btn btn-primary explore-btn">
          Explore funding options
          <span>→</span>
        </button>
      </div>

      <div class="card">
        <h3 class="card-title">Upcoming payments</h3>
        <div class="empty-state">
          <div class="emoji">🎉</div>
          <p class="text-accent">You're all set!</p>
          <p class="text-secondary">Any funding or purchases will show up here.</p>
        </div>
      </div>

      <div class="defi-options">
        <div class="defi-card" @click="connectWallet('exactly')">
          <div class="defi-icon">☰</div>
          <div class="defi-content">
            <h4 class="defi-title">USDC funding</h4>
            <p class="defi-desc">Connect your wallet to Exactly Protocol</p>
          </div>
          <div class="defi-link">🔗</div>
        </div>

        <div class="defi-card" @click="connectWallet('lifi')">
          <div class="defi-icon">⇄</div>
          <div class="defi-content">
            <h4 class="defi-title">Swap tokens</h4>
            <p class="defi-desc">Connect your wallet to LI.FI</p>
          </div>
          <div class="defi-link">🔗</div>
        </div>
      </div>

      <div class="footer-text">
        <p>You are accessing a decentralized protocol using your crypto as collateral. The Vantis App does not issue funding or provide credit. No credit checks or intermediaries are involved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const showHelp = () => {
  alert('DeFi help information')
}

const connectWallet = (protocol) => {
  alert(`Connecting to ${protocol}`)
}
</script>

<style scoped>
.defi-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding-bottom: 80px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  position: relative;
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

.header-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  font-weight: 700;
}

.content {
  padding: 16px;
}

.intro-text {
  margin-bottom: 24px;
  color: var(--text-primary);
  line-height: 1.6;
}

.funding-card {
  margin-bottom: 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}

.funding-amount {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.currency-icon-small {
  flex-shrink: 0;
}

.icon-circle-small {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--accent-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.dollar-small {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.native-small {
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%) rotate(-90deg);
  font-size: 8px;
  color: var(--text-primary);
  white-space: nowrap;
}

.amount-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
}

.due-dates {
  margin-bottom: 16px;
}

.due-dates p {
  font-size: 14px;
  margin-bottom: 4px;
}

.explore-btn {
  width: 100%;
  justify-content: space-between;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
}

.emoji {
  font-size: 48px;
  margin-bottom: 16px;
}

.defi-options {
  margin-bottom: 24px;
}

.defi-card {
  background-color: var(--bg-card);
  border-radius: var(--border-radius);
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.defi-card:active {
  background-color: var(--shadow-color);
}

.defi-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: var(--accent-teal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.defi-content {
  flex: 1;
}

.defi-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.defi-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

.defi-link {
  font-size: 24px;
  color: var(--accent-teal);
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
  .defi-page {
    padding-bottom: 0;
  }
  
  .content {
    padding: 32px;
    max-width: 900px;
    margin: 0 auto;
  }
  
  .funding-card {
    padding: 32px;
  }
  
  .defi-card {
    padding: 24px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .content {
    max-width: 1200px;
    padding: 48px;
  }
  
  .funding-card {
    padding: 48px;
  }
  
  .amount-value {
    font-size: 48px;
  }
  
  .defi-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  
  .defi-card {
    padding: 32px;
  }
  
  .defi-title {
    font-size: 20px;
  }
  
  .defi-desc {
    font-size: 16px;
  }
}
</style>

