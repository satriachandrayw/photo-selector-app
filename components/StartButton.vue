<template>
  <button class="start-button" @click="navigateToFrameSelector">
    Start
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToFrameSelector = () => {
  router.push('/frame-selector');
};
</script>

<style scoped>
.start-button {
  padding: 10px 40px;
  font-size: 1.2rem;
  border: 2px solid #000;
  border-radius: 25px;
  background-color: #fff;
  cursor: pointer;
  transition: background-color 0.3s;
}

.start-button:hover {
  background-color: #f0f0f0;
}
</style>