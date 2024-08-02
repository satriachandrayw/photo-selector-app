<template>
  <div class="frame-selector">
    <h1>Photo Frame Selector</h1>
    <FileExplorer @select-image="handleImageSelect" />
    <FrameEditor v-if="selectedImage" :imageSrc="selectedImage" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FileExplorer from '~/components/FileExplorer.vue';
import FrameEditor from '~/components/FrameEditor.vue';

const selectedImage = ref(null);

const handleImageSelect = (imagePath) => {
  selectedImage.value = imagePath;
};
</script>

<style scoped>
.frame-selector {
  padding: 20px;
}
</style>