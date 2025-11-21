<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-logo">Vantis</h2>
    </div>
    <nav class="sidebar-nav">
      <div 
        class="nav-item" 
        :class="{ active: currentRoute === 'home' }" 
        @click="navigate('home')"
      >
        <div class="nav-icon">🏠</div>
        <span class="nav-label">Home</span>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: currentRoute === 'card' }" 
        @click="navigate('card')"
      >
        <div class="nav-icon">💳</div>
        <span class="nav-label">Card</span>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: currentRoute === 'pay-mode' }" 
        @click="navigate('pay-mode')"
      >
        <div class="nav-icon">🔄</div>
        <span class="nav-label">Pay Mode</span>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: currentRoute === 'defi' }" 
        @click="navigate('defi')"
      >
        <div class="nav-icon">📦</div>
        <span class="nav-label">DeFi</span>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: currentRoute === 'activity' }" 
        @click="navigate('activity')"
      >
        <div class="nav-icon">📄</div>
        <span class="nav-label">Activity</span>
      </div>
    </nav>
    <div class="sidebar-footer">
      <ThemeToggle />
      <div class="nav-item" @click="navigate('settings')">
        <div class="nav-icon">⚙</div>
        <span class="nav-label">Settings</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()

const currentRoute = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path.includes('card')) return 'card'
  if (path.includes('pay-mode')) return 'pay-mode'
  if (path.includes('defi')) return 'defi'
  if (path.includes('activity')) return 'activity'
  if (path.includes('settings')) return 'settings'
  return ''
})

const navigate = (routeName) => {
  const routes = {
    home: '/',
    card: '/card',
    'pay-mode': '/pay-mode',
    defi: '/defi',
    activity: '/activity',
    settings: '/settings'
  }
  navigateTo(routes[routeName] || '/')
}
</script>

<style scoped>
.sidebar {
  display: none;
}

@media (min-width: 768px) {
  .sidebar {
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    width: 240px;
    height: 100vh;
    background-color: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    z-index: 1000;
    padding: var(--spacing-lg);
    transition: background-color 0.3s ease, border-color 0.3s ease;
  }
  
  .sidebar-header {
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
  }
  
  .sidebar-logo {
    font-size: 28px;
    font-weight: 700;
    color: var(--accent-teal);
    text-align: center;
  }
  
  .sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all 0.2s;
    opacity: 0.7;
  }
  
  .nav-item:hover {
    opacity: 1;
    background-color: var(--shadow-color);
  }
  
  .nav-item.active {
    opacity: 1;
    background-color: var(--accent-teal-dark);
  }
  
  .nav-item.active .nav-icon,
  .nav-item.active .nav-label {
    color: var(--accent-teal);
  }
  
  .nav-icon {
    font-size: 24px;
    width: 24px;
    text-align: center;
  }
  
  .nav-label {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
  }
  
  .sidebar-footer {
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}

@media (min-width: 1024px) {
  .sidebar {
    width: 280px;
    padding: var(--spacing-xl);
  }
  
  .sidebar-logo {
    font-size: 32px;
  }
  
  .nav-label {
    font-size: 18px;
  }
}
</style>

