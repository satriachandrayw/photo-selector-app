<template>
  <div v-if="!isHomePage" class="navigation-bar">
    <button @click="goToPreviousPage" :disabled="!canGoPrevious">Previous</button>
    <button @click="goToNextPage" :disabled="!canGoNext">Next</button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const routes = ['/', '/frame-selector']; // Add more routes as needed
const currentRouteIndex = computed(() => routes.indexOf(router.currentRoute.value.path));

const isHomePage = computed(() => router.currentRoute.value.path === '/');

const canGoPrevious = computed(() => currentRouteIndex.value > 0);
const canGoNext = computed(() => currentRouteIndex.value < routes.length - 1);

const goToPreviousPage = () => {
  if (canGoPrevious.value) {
    router.push(routes[currentRouteIndex.value - 1]);
  }
};

const goToNextPage = () => {
  if (canGoNext.value) {
    router.push(routes[currentRouteIndex.value + 1]);
  }
};
</script>

<style scoped>
.navigation-bar {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  font-size: 14px;
  border: 1px solid #000;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: #f0f0f0;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>