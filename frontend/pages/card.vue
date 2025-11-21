<template>
  <div class="card-page">
    <StatusBar />
    <div class="header">
      <button class="header-btn" @click="$router.back()">←</button>
      <h1 class="header-title">Card</h1>
      <button class="header-btn" @click="showHelp">?</button>
    </div>

    <div class="content">
      <div class="card-info">
        <p class="text-secondary">Card features coming soon</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const showHelp = () => {
  alert('Card help information')
}
</script>

<style scoped>
.card-page {
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
  text-align: center;
  margin-top: 100px;
}
</style>

