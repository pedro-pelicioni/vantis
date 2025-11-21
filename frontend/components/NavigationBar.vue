<template>
  <div class="nav-bar">
    <div class="nav-item" :class="{ active: currentRoute === 'home' }" @click="navigate('home')">
      <div class="nav-icon">🏠</div>
      <span class="nav-label">Home</span>
    </div>
    <div class="nav-item" :class="{ active: currentRoute === 'card' }" @click="navigate('card')">
      <div class="nav-icon">💳</div>
      <span class="nav-label">Card</span>
    </div>
    <div class="nav-item" :class="{ active: currentRoute === 'pay-mode' }" @click="navigate('pay-mode')">
      <div class="nav-icon">🔄</div>
      <span class="nav-label">Pay Mode</span>
    </div>
    <div class="nav-item" :class="{ active: currentRoute === 'defi' }" @click="navigate('defi')">
      <div class="nav-icon">📦</div>
      <span class="nav-label">DeFi</span>
    </div>
    <div class="nav-item" :class="{ active: currentRoute === 'activity' }" @click="navigate('activity')">
      <div class="nav-icon">📄</div>
      <span class="nav-label">Activity</span>
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
  return ''
})

const navigate = (routeName) => {
  const routes = {
    home: '/',
    card: '/card',
    'pay-mode': '/pay-mode',
    defi: '/defi',
    activity: '/activity'
  }
  navigateTo(routes[routeName] || '/')
}
</script>

<style scoped>
.nav-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  max-width: 428px;
  width: 100%;
  background-color: var(--bg-secondary);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid var(--border-color);
  z-index: 1000;
}

/* Hide bottom nav on tablet and desktop */
@media (min-width: 768px) {
  .nav-bar {
    display: none;
  }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.nav-item.active {
  opacity: 1;
}

.nav-item.active .nav-icon,
.nav-item.active .nav-label {
  color: var(--accent-teal);
}

.nav-icon {
  font-size: 24px;
}

.nav-label {
  font-size: 12px;
  color: var(--text-primary);
}

.nav-item:active {
  opacity: 0.8;
}
</style>

