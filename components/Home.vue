<template>
  <div class="choose-path">
    <LoginButton @open-modal="showModal = true" />
    <h1>{{ title }}</h1>
    <p>{{ subtitle }}</p>
    <StartButton />
    <LoginModal v-if="showModal" @close="showModal = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import StartButton from './StartButton.vue';
import LoginButton from './LoginButton.vue';
import LoginModal from './LoginModal.vue';

const title = ref('CHOOSE YOUR PATH');
const subtitle = ref('Are you ready to begin the journey?');
const showModal = ref(false);
</script>

<style scoped>
.choose-path {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: Arial, sans-serif;
  background-color: #ffffff;
}

h1 {
  font-size: 4rem;
  font-weight: 300;
  letter-spacing: 2px;
  margin-bottom: 0;
}

p {
  font-style: italic;
  margin-bottom: 2rem;
}
</style>