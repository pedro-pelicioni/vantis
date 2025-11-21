<template>
  <div class="home-page">
    <StatusBar />
    <div class="home-header">
      <div class="menu-icon">☰</div>
      <div class="wallet-address">0x670a...31e9</div>
      <div class="header-actions">
        <ThemeToggle />
        <span class="icon">👁</span>
        <span class="icon" @click="navigateTo('/settings')">⚙</span>
      </div>
    </div>

    <div class="content">
      <div class="portfolio-section">
        <div class="portfolio-link">Your portfolio ></div>
        <div class="balance">US$ 0,00</div>
      </div>

      <div class="action-buttons">
        <button class="btn btn-primary">
          Add funds
          <span>↓</span>
        </button>
        <button class="btn btn-secondary">
          Send
          <span>↑</span>
        </button>
      </div>

      <div class="cards-grid">
        <div class="card getting-started-card">
          <div class="card-header">
            <h3 class="text-accent">Getting Started</h3>
            <a href="#" class="text-accent">View all steps ></a>
          </div>
          <div class="step-item">
            <span class="step-icon">👤</span>
            <span>Add funds to account</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 33%"></div>
            <div class="progress-empty"></div>
            <div class="progress-empty"></div>
          </div>
          <div class="progress-text">1/3</div>
          <button class="step-button">→</button>
        </div>

        <div class="card">
          <h3 class="card-title">Upcoming payments</h3>
          <div class="empty-state">
            <div class="emoji">🎉</div>
            <p class="text-accent">You're all set!</p>
            <p class="text-secondary">Any funding or purchases will show up here.</p>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">Latest activity</h3>
          <div class="empty-state">
            <div class="emoji">📋</div>
            <p class="text-accent">No activity yet</p>
            <p class="text-secondary">Your transactions will show up here once you get started. Add funds to begin!</p>
          </div>
        </div>
      </div>

      <div class="footer-text">
        <p>The Vantis App is a self-custodial smart wallet. All borrowing and lending features are decentralized and powered by Exactly Protocol. <a href="#">Terms and conditions</a>.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

@media (min-width: 768px) {
  .home-header {
    padding: 24px 32px;
  }
  
  .menu-icon {
    display: none;
  }
}

@media (min-width: 1024px) {
  .home-header {
    padding: 32px 48px;
  }
}

.menu-icon {
  font-size: 24px;
  position: relative;
}

.menu-icon::after {
  content: '';
  position: absolute;
  top: 0;
  right: -8px;
  width: 8px;
  height: 8px;
  background-color: var(--accent-green);
  border-radius: 50%;
}

.wallet-address {
  font-size: 14px;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: 16px;
}

.icon {
  font-size: 20px;
  cursor: pointer;
}

.content {
  padding: 16px;
}

.portfolio-section {
  text-align: center;
  margin: 24px 0;
}

.portfolio-link {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 8px;
}

.balance {
  font-size: 48px;
  font-weight: 700;
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.action-buttons .btn {
  flex: 1;
  justify-content: space-between;
}

.getting-started-card {
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--accent-teal-dark) 100%);
  position: relative;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.step-icon {
  font-size: 24px;
}

.progress-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.progress-fill {
  height: 4px;
  background-color: var(--accent-teal);
  border-radius: 2px;
  flex: 1;
}

.progress-empty {
  height: 4px;
  background-color: var(--shadow-color);
  border-radius: 2px;
  flex: 1;
}

.progress-text {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.step-button {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background-color: var(--accent-teal);
  border: none;
  border-radius: 8px;
  color: var(--bg-primary);
  font-size: 20px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
}

.emoji {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  margin-bottom: 8px;
}

.footer-text {
  padding: 16px;
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
}

.footer-text a {
  color: var(--accent-teal);
  text-decoration: underline;
}

/* Tablet */
@media (min-width: 768px) {
  .home-header {
    padding: 24px 32px;
  }
  
  .content {
    padding: 24px 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .balance {
    font-size: 64px;
  }
  
  .action-buttons {
    max-width: 500px;
    margin: 0 auto 32px;
  }
  
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-top: 32px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .home-header {
    padding: 32px 48px;
  }
  
  .content {
    padding: 32px 48px;
  }
  
  .balance {
    font-size: 80px;
  }
  
  .portfolio-section {
    margin: 48px 0;
  }
  
  .action-buttons {
    max-width: 600px;
    gap: 16px;
  }
  
  .action-buttons .btn {
    padding: 20px 32px;
    font-size: 18px;
  }
  
  .cards-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
  
  .getting-started-card {
    grid-column: span 2;
  }
}
</style>

