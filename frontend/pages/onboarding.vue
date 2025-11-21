<template>
  <div class="onboarding-page">
    <StatusBar />
    <div class="content">
      <div class="illustration-section">
        <div class="illustration-bg"></div>
        <div class="illustration-elements">
          <div class="key-icon">🔑</div>
          <div class="biometric-icon">👤</div>
          <div class="lock-icon">🔒</div>
        </div>
      </div>

      <div class="text-section">
        <h1 class="title">A secure and easy way to access your account</h1>
        <p class="description">
          To keep your account secure, Vantis App uses passkeys, a passwordless authentication method protected by your device biometric verification.
        </p>
        <div class="terms">
          <p>By continuing, I accept the <a href="#">Terms & Conditions</a>.</p>
        </div>
        <button class="btn btn-primary create-btn" @click="createAccount">
          Set passkey and create account
          <span>🔑</span>
        </button>
        <a href="#" class="learn-more">Learn more about passkeys</a>
      </div>
    </div>
  </div>
</template>

<script setup>
const createAccount = () => {
  // Handle account creation
  console.log('Creating account with passkey...')
}
</script>

<style scoped>
.onboarding-page {
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
  z-index: 1;
}

.key-icon {
  font-size: 80px;
  transform: rotate(-15deg);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.biometric-icon,
.lock-icon {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(255, 215, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
}

.biometric-icon {
  top: 20%;
  left: 10%;
}

.lock-icon {
  bottom: 20%;
  right: 10%;
}

.text-section {
  padding: 32px 24px;
  text-align: center;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: var(--accent-teal);
  margin-bottom: 16px;
  line-height: 1.3;
}

.description {
  font-size: 16px;
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 24px;
}

.terms {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.terms a {
  color: var(--accent-teal);
  text-decoration: underline;
}

.create-btn {
  width: 100%;
  justify-content: space-between;
  margin-bottom: 16px;
}

.learn-more {
  color: var(--accent-teal);
  font-size: 14px;
  text-decoration: none;
}
</style>

