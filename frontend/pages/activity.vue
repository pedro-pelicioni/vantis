<template>
  <div class="activity-page">
    <StatusBar />
    <div class="header">
      <button class="header-btn" @click="$router.back()">←</button>
      <h1 class="header-title">Activity</h1>
      <button class="header-btn" @click="showHelp">?</button>
    </div>

    <div class="content">
      <div class="card">
        <h3 class="card-title">Latest activity</h3>
        <div class="empty-state">
          <div class="emoji">📋</div>
          <p class="text-accent">No activity yet</p>
          <p class="text-secondary">Your transactions will show up here once you get started. Add funds to begin!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const showHelp = () => {
  alert('Activity help information')
}
</script>

<style scoped>
.activity-page {
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

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
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
</style>

