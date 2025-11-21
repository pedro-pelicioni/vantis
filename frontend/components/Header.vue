<template>
  <div class="header">
    <button class="header-btn" @click="$emit('back')">
      <span>←</span>
    </button>
    <h1 class="header-title">{{ title }}</h1>
    <button class="header-btn" @click="$emit('help')">
      <span>?</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})

defineEmits(['back', 'help'])
</script>

<style scoped>
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
  transition: background-color 0.2s;
}

.header-btn:active {
  background-color: var(--shadow-color);
}

.header-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

/* Tablet */
@media (min-width: 768px) {
  .header {
    padding: 24px 32px;
  }
  
  .header-title {
    font-size: 24px;
  }
  
  .header-btn {
    width: 48px;
    height: 48px;
    font-size: 28px;
  }
  
  .header-btn:hover {
    background-color: var(--shadow-color);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .header {
    padding: 32px 48px;
  }
  
  .header-title {
    font-size: 28px;
  }
}
</style>

