<template>
  <div class="result-preview">
    <h1>Your Arranged Photos</h1>
    <div class="frame-container" :style="frameContainerStyle">
      <div 
        v-for="(slot, index) in selectedTemplate.slots" 
        :key="index" 
        class="photo-slot" 
        :style="getSlotStyle(slot)"
      >
        <img 
          v-if="selectedPhotos[index]"
          :src="selectedPhotos[index].url" 
          :alt="selectedPhotos[index].name" 
          class="photo" 
          :style="getPhotoStyle(selectedPhotos[index].id)"
        />
      </div>
    </div>
    <div class="metadata">
      <p>Template: {{ selectedTemplate.name }}</p>
      <p>Created: {{ creationDate }}</p>
    </div>
    <div class="share-options">
      <button @click="shareOnSocialMedia('facebook')">Share on Facebook</button>
      <button @click="shareOnSocialMedia('twitter')">Share on Twitter</button>
      <button @click="shareViaEmail">Share via Email</button>
    </div>
    <div class="actions">
      <button @click="goBack">Edit Arrangement</button>
      <button @click="finalize">Finalize and Download</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePhotoEditorStore } from '~/stores/photoEditorStore';

const router = useRouter();
const route = useRoute();
const photoEditorStore = usePhotoEditorStore();

const selectedTemplate = computed(() => photoEditorStore.selectedTemplate);
const selectedPhotos = computed(() => photoEditorStore.selectedPhotos);
const creationDate = computed(() => new Date().toLocaleString());

const frameContainerStyle = computed(() => {
  const maxX = Math.max(...selectedTemplate.value.slots.map(slot => slot.x + slot.width));
  const maxY = Math.max(...selectedTemplate.value.slots.map(slot => slot.y + slot.height));
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${maxX}, 1fr)`,
    gridTemplateRows: `repeat(${maxY}, 1fr)`,
    aspectRatio: `${maxX} / ${maxY}`,
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    gap: '4px',
    backgroundColor: '#ccc',
    padding: '4px',
  };
});

const getSlotStyle = (slot) => ({
  position: 'absolute',
  left: `${slot.x}%`,
  top: `${slot.y}%`,
  width: `${slot.width}%`,
  height: `${slot.height}%`,
});

const getPhotoStyle = (photoId) => {
  const adjustment = photoEditorStore.photoAdjustments[photoId];
  return {
    transform: `translate(${adjustment.x}px, ${adjustment.y}px) scale(${adjustment.scale}) rotate(${adjustment.rotation}deg)`,
  };
};

const goBack = () => {
  router.push('/frame-editor');
};

const finalize = () => {
  // Implement download functionality
  console.log('Downloading final image...');
};

const shareOnSocialMedia = (platform) => {
  // Implement sharing logic for different platforms
  console.log(`Sharing on ${platform}`);
};

const shareViaEmail = () => {
  // Implement email sharing
  console.log('Sharing via email...');
};

onMounted(() => {
  const arrangementData = JSON.parse(route.query.arrangement || '{}');
  
  if (!arrangementData.photos || !arrangementData.styles || !arrangementData.layout) {
    console.error('Missing arrangement data');
    router.push('/template-selection');
    return;
  }

  photoEditorStore.selectedPhotos = arrangementData.photos;
  photoEditorStore.photoAdjustments = arrangementData.styles;
  photoEditorStore.selectedTemplate = arrangementData.layout;
});
</script>

<style scoped>
.result-preview {
  padding: 20px;
}

.metadata {
  margin-top: 20px;
  text-align: center;
  font-style: italic;
}

.share-options {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.share-options button {
  padding: 5px 10px;
  font-size: 0.9em;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>