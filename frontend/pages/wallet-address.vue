<template>
  <div class="wallet-address-page">
    <StatusBar />
    <div class="content">
      <div class="card address-card">
        <div class="success-message">
          <span class="check-icon">✓</span>
          <span class="success-text">Address copied</span>
        </div>
        <p class="warning-text">Double-check your address before sending funds to avoid losing them.</p>
        <div class="address-display">
          <code class="address-code">0x670af7dfFbeE6015618580591B96b48d0C8831e9</code>
        </div>
        <div class="address-info">
          <div class="info-item">
            <span class="info-label">Network</span>
            <div class="network-info">
              <div class="network-icon">💎</div>
              <span>Optimism (OP Mainnet)</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-label">Supported Assets</span>
            <div class="assets-list">
              <span class="asset-icon">N</span>
              <span class="asset-icon">Ξ</span>
              <span class="asset-icon">OP</span>
              <span class="asset-icon">₿</span>
            </div>
          </div>
        </div>
      </div>
      <button class="btn btn-primary close-btn" @click="$router.back()">
        Close
        <span>✕</span>
      </button>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.wallet-address-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 80px;
}

.address-card {
  margin-bottom: 24px;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--accent-green);
}

.check-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--accent-green);
  color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
}

.success-text {
  font-size: 14px;
  font-weight: 600;
}

.warning-text {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 24px;
  line-height: 1.5;
}

.address-display {
  background-color: var(--bg-primary);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  word-break: break-all;
}

.address-code {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
}

.address-info {
  display: flex;
  justify-content: space-between;
  gap: 24px;
}

.info-item {
  flex: 1;
}

.info-label {
  display: block;
  color: var(--text-secondary);
  font-size: 12px;
  margin-bottom: 8px;
}

.network-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.network-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--accent-red);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.assets-list {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.asset-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--border-color);
}

.close-btn {
  width: 100%;
  justify-content: space-between;
}

/* Tablet */
@media (min-width: 768px) {
  .wallet-address-page {
    padding: 32px;
    padding-bottom: 0;
  }
  
  .address-card {
    max-width: 600px;
    margin: 0 auto 32px;
  }
  
  .close-btn {
    max-width: 400px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .wallet-address-page {
    padding: 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .address-card {
    max-width: 100%;
    padding: 48px;
  }
  
  .address-code {
    font-size: 16px;
  }
}
</style>

