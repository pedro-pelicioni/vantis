<template>
  <div class="welcome-page">
    <StatusBar />
    <div class="content">
      <div class="illustration-section">
        <div class="illustration-bg"></div>
        <div class="illustration-elements">
          <div class="calendar-icon">📅</div>
          <div class="clock-icon">🕐</div>
          <div class="coins">💰</div>
        </div>
      </div>

      <div class="text-section">
        <h1 class="title">
          Pay later in installments<br />
          and hold your crypto
        </h1>
        <div class="carousel-indicators">
          <span class="indicator"></span>
          <span class="indicator active"></span>
          <span class="indicator"></span>
        </div>
        <button class="btn btn-primary create-btn" @click="createAccount">
          Create an account
          <span>🔑</span>
        </button>
        <div class="login-link">
          <span class="text-secondary">Already have an account? </span>
          <a href="/login" class="text-accent">Log in</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const createAccount = () => {
  // Navigate to onboarding
  navigateTo('/onboarding')
}
</script>

<style scoped>
.welcome-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.illustration-section {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-teal-dark) 100%);
  opacity: 0.3;
  border-radius: 0 0 50% 50%;
  transform: scale(1.5);
}

.illustration-elements {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  z-index: 1;
}

.calendar-icon {
  font-size: 100px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.clock-icon {
  font-size: 80px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.coins {
  position: absolute;
  font-size: 40px;
  top: 10%;
  right: 10%;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.text-section {
  padding: 32px 24px;
  text-align: center;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent-teal);
  margin-bottom: 24px;
  line-height: 1.3;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 32px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
}

.indicator.active {
  background-color: var(--accent-teal);
}

.create-btn {
  width: 100%;
  justify-content: space-between;
  margin-bottom: 16px;
}

.login-link {
  font-size: 14px;
}

.login-link a {
  text-decoration: none;
}
</style>

