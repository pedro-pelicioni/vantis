<template>
  <div class="settings-page">
    <StatusBar />
    <div class="header">
      <button class="header-btn" @click="$router.back()">←</button>
      <h1 class="header-title">Settings</h1>
    </div>

    <div class="content">
      <div class="settings-card">
        <div class="settings-item theme-settings">
          <div class="settings-icon theme-icon">🎨</div>
          <div class="theme-control">
            <span class="settings-label">Theme</span>
            <ThemeToggle />
          </div>
        </div>
        <div class="settings-item" @click="openSupport">
          <div class="settings-icon support-icon">?</div>
          <span class="settings-label">Support</span>
        </div>
        <div class="settings-item" @click="handleLogout">
          <div class="settings-icon logout-icon">→</div>
          <span class="settings-label">Logout</span>
        </div>
      </div>

      <div class="version-info">
        mobile@1.0.34
      </div>
    </div>
  </div>
</template>

<script setup>
const openSupport = () => {
  alert('Support information')
}

const handleLogout = () => {
  if (confirm('Are you sure you want to logout?')) {
    // Handle logout logic
    console.log('Logging out...')
  }
}
</script>

<style scoped>
.settings-page {
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

.settings-card {
  background-color: var(--bg-card);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.settings-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--border-color);
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item:active {
  background-color: var(--shadow-color);
}

.theme-settings {
  justify-content: space-between;
}

.theme-control {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  justify-content: space-between;
}

.theme-icon {
  border: 2px solid var(--accent-teal);
  color: var(--accent-teal);
}

.light-mode .settings-item:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.settings-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}

.support-icon {
  border: 2px solid var(--accent-teal);
  color: var(--accent-teal);
}

.logout-icon {
  border: 2px solid var(--accent-red);
  color: var(--accent-red);
}

.settings-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.version-info {
  text-align: center;
  margin-top: 32px;
  color: var(--text-secondary);
  font-size: 12px;
}

/* Tablet */
@media (min-width: 768px) {
  .settings-page {
    padding-bottom: 0;
  }
  
  .content {
    padding: 32px;
    max-width: 600px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .content {
    max-width: 800px;
    padding: 48px;
  }
  
  .settings-card {
    padding: 32px;
  }
  
  .settings-item {
    padding: 20px;
    font-size: 18px;
  }
}
</style>

