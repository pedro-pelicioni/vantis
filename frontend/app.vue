<template>
  <div class="app-wrapper">
    <Sidebar />
    <div class="container">
      <NuxtPage />
      <NavigationBar />
    </div>
  </div>
</template>

<script setup>
// Initialize theme on app mount
const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<style>
.app-wrapper {
  min-height: 100vh;
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease;
}
</style>

