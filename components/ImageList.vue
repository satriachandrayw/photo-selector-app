<template>
  <div class="image-list">
    <h2>Select an Image</h2>
    <FileExplorer @image-selected="handleImageSelected" />
    <div v-if="selectedImage" class="selected-image">
      <h3>Selected Image:</h3>
      <img :src="selectedImage" alt="Selected Image" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FileExplorer from './FileExplorer.vue';

const selectedImage = ref(null);

const handleImageSelected = (imagePath) => {
  selectedImage.value = imagePath;
  // You can emit this selected image to a parent component if needed
  // emit('image-selected', imagePath);
};
</script>

<style scoped>
.image-list {
  max-width: 800px;
  margin: 0 auto;
}

.selected-image {
  margin-top: 20px;
  text-align: center;
}

.selected-image img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}
</style>