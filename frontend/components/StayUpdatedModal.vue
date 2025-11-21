<template>
  <div v-if="show" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <h2 class="modal-title">Stay Updated</h2>
      <p class="modal-text">
        Keep track of your activity with updates for every transfer and purchase you make.
      </p>
      <button class="btn btn-primary modal-btn" @click="keepUpdated">
        Keep Me Updated
      </button>
      <button class="btn btn-outline modal-btn" @click="notNow">
        Not Now
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'keepUpdated', 'notNow'])

const close = () => {
  emit('close')
}

const keepUpdated = () => {
  emit('keepUpdated')
  close()
}

const notNow = () => {
  emit('notNow')
  close()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
}

.modal-content {
  background-color: var(--bg-card);
  border-radius: var(--border-radius);
  padding: 32px 24px;
  max-width: 320px;
  width: 100%;
  text-align: center;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.modal-text {
  font-size: 16px;
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 24px;
}

.modal-btn {
  width: 100%;
  margin-bottom: 12px;
}

.modal-btn:last-child {
  margin-bottom: 0;
}
</style>

