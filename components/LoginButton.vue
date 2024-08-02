<template>
  <button class="login-button" @click="$emit('open-modal')">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  </button>
</template>

<script setup>
// The button emits an 'open-modal' event when clicked
</script>

<style scoped>
.login-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
}

.login-button svg {
  width: 24px;
  height: 24px;
}
</style>
