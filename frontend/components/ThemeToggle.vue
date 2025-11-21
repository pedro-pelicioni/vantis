<template>
  <button class="theme-toggle" @click="toggleTheme" :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`">
    <span class="theme-icon">{{ isDark ? '☀️' : '🌙' }}</span>
    <span class="theme-label">{{ isDark ? 'Light' : 'Dark' }}</span>
  </button>
</template>

<script setup>
const { isDark, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 8px 12px;
  border-radius: var(--border-radius);
  transition: background-color 0.2s;
  font-size: 14px;
}

.theme-toggle:hover {
  background-color: var(--shadow-color);
}

.light-mode .theme-toggle:hover {
  background-color: var(--shadow-color);
}

.theme-icon {
  font-size: 20px;
}

.theme-label {
  font-weight: 500;
}

/* Hide label on mobile */
@media (max-width: 767px) {
  .theme-label {
    display: none;
  }
  
  .theme-toggle {
    padding: 8px;
    min-width: 40px;
    justify-content: center;
  }
}
</style>

