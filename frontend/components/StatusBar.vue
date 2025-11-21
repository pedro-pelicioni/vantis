<template>
  <div class="status-bar">
    <div class="status-left">
      <span class="time">{{ currentTime }}</span>
      <span class="moon-icon">🌙</span>
    </div>
    <div class="status-right">
      <span class="signal">📶</span>
      <span class="wifi">📶</span>
      <span class="battery">{{ battery }}%</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref('20:05')
const battery = ref(78)

const updateTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}`
}

let timeInterval

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})
</script>

<style scoped>
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  font-size: 14px;
  color: var(--text-primary);
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.moon-icon {
  font-size: 16px;
}

/* Hide status bar on tablet and desktop */
@media (min-width: 768px) {
  .status-bar {
    display: none;
  }
}
</style>

