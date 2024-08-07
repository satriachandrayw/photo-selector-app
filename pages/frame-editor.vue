<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia'
import { usePhotoEditorStore } from '~/stores/photoEditorStore';
import { usePhotoOperations } from '~/composables/usePhotoOperations'

const router = useRouter();
const photoEditorStore = usePhotoEditorStore();
const { selectedPhotos, photoUrls } = storeToRefs(photoEditorStore)

const selectedTemplate = computed(() => photoEditorStore.selectedTemplate);
const photoAdjustments = computed(() => photoEditorStore.photoAdjustments);
const frameImageSrc = computed(() => photoEditorStore.frameImageSrc);

const isLoading = ref(true);
const error = ref(null);

const { rotatePhoto, zoomPhoto, movePhoto } = usePhotoOperations()

const frameContainerStyle = computed(() => ({
  backgroundImage: `url(${frameImageSrc.value})`,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  width: '100%',
  maxWidth: '800px',
  aspectRatio: selectedTemplate.value ? `${selectedTemplate.value.width} / ${selectedTemplate.value.height}` : '1',
  margin: '0 auto',
  position: 'relative',
}));

const getSlotStyle = (slot) => ({
  position: 'absolute',
  left: `${slot.x}%`,
  top: `${slot.y}%`,
  width: `${slot.width}%`,
  height: `${slot.height}%`,
  overflow: 'hidden',
});

const getPhotoStyle = (photoId) => {
  const adjustment = photoAdjustments.value[photoId];
  return {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `translate(${adjustment.x}px, ${adjustment.y}px) scale(${adjustment.scale}) rotate(${adjustment.rotation}deg)`,
    transition: 'transform 0.3s ease',
  };
};

onMounted(async () => {
  photoEditorStore.loadFromLocalStorage();
  await photoEditorStore.loadPhotoUrls();
  isLoading.value = false;
});

onUnmounted(() => {
  photoEditorStore.saveToLocalStorage();
  photoEditorStore.clearPhotoUrls();
});

// Example usage in methods:
const handleRotate = (photoId, angle) => {
  rotatePhoto(photoId, angle)
}

const handleZoom = (photoId, factor) => {
  zoomPhoto(photoId, factor)
}

const handleMove = (photoId, dx, dy) => {
  movePhoto(photoId, dx, dy)
}

const saveArrangement = () => {
  // Implement save functionality here
  console.log('Saving arrangement:', { template: selectedTemplate.value, photos: selectedPhotos.value, adjustments: photoAdjustments.value });
  // You might want to send this data to your backend or store it locally
};

</script>

<template>
  <div class="frame-editor">
    <h1>Adjust Your Photos</h1>
    <div v-if="selectedTemplate" class="frame-container" :style="frameContainerStyle">
      <div v-for="(slot, index) in selectedTemplate.slots" :key="index" class="photo-slot" :style="getSlotStyle(slot)">
        <img 
          v-if="selectedPhotos[index] && photoUrls[selectedPhotos[index].name]"
          :src="photoUrls[selectedPhotos[index].name]"
          :alt="selectedPhotos[index].name"
          :style="getPhotoStyle(selectedPhotos[index].id)"
        />
      </div>
    </div>
    <div class="controls">
      <div v-for="(photo, index) in selectedPhotos" :key="index" class="photo-control">
        <img :src="photo.path" :alt="photo.name" class="thumbnail" />
        <div class="adjustment-controls">
          <button @click="adjustPhoto(photo.name, 'moveX', -10)">←</button>
          <button @click="adjustPhoto(photo.name, 'moveX', 10)">→</button>
          <button @click="adjustPhoto(photo.name, 'moveY', -10)">↑</button>
          <button @click="adjustPhoto(photo.name, 'moveY', 10)"></button>
          <button @click="adjustPhoto(photo.name, 'zoom', 0.1)">Zoom +</button>
          <button @click="adjustPhoto(photo.name, 'zoom', -0.1)">Zoom -</button>
          <button @click="adjustPhoto(photo.name, 'rotate', 90)">Rotate</button>
          <button @click="fitToSlot(photo.name)">Fit to Slot</button>
        </div>
      </div>
      <button @click="handleRotate(selectedPhotoId, 90)">Rotate 90°</button>
      <button @click="handleZoom(selectedPhotoId, 1.1)">Zoom In</button>
      <button @click="handleZoom(selectedPhotoId, 0.9)">Zoom Out</button>
      <!-- Add move controls as needed -->
    </div>
    <button @click="saveArrangement" class="save-button">Save Arrangement</button>
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<style scoped>
.frame-editor {
  padding: 20px;
}

.frame-container {
  border: 1px solid #ccc;
  margin-bottom: 20px;
}

.photo-slot {
  position: absolute;
}

.photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.photo-control {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.thumbnail {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-bottom: 10px;
}

.adjustment-controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}

button {
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
}

.save-button {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.save-button:hover {
  background-color: #0056b3;
}

.loading {
  color: #333;
  font-size: 18px;
  font-weight: bold;
  margin-top: 20px;
}

.error {
  color: #cc0000;
  font-size: 18px;
  font-weight: bold;
  margin-top: 20px;
}
</style>