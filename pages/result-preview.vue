<template>
  <div class="result-preview">
    <h1>Your Arranged Photos</h1>
    <div class="frame-container" :style="frameContainerStyle">
      <div v-for="(cell, index) in layout" :key="index" class="frame-cell" :style="getCellStyle(cell)">
        <div v-if="photos[index]" class="photo-container" :style="getPhotoContainerStyle(index)">
          <img :src="photos[index].path" :alt="photos[index].name" class="photo" :style="getPhotoStyle(index)" />
        </div>
      </div>
    </div>
    <div class="metadata">
      <p>Template: {{ templateName }}</p>
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

const router = useRouter();
const route = useRoute();

const photos = ref([]);
const layout = ref([]);
const photoStyles = ref([]);
const templateName = ref('');
const creationDate = computed(() => new Date().toLocaleString());

const frameContainerStyle = computed(() => {
  const maxX = Math.max(...layout.value.map(cell => cell.x + cell.w));
  const maxY = Math.max(...layout.value.map(cell => cell.y + cell.h));
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

const getCellStyle = (cell) => ({
  gridColumn: `${cell.x + 1} / span ${cell.w}`,
  gridRow: `${cell.y + 1} / span ${cell.h}`,
  backgroundColor: 'white',
  overflow: 'hidden',
  position: 'relative',
});

const getPhotoContainerStyle = (index) => ({
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
});

const getPhotoStyle = (index) => ({
  position: 'absolute',
  left: `${photoStyles.value[index].x}%`,
  top: `${photoStyles.value[index].y}%`,
  width: `${photoStyles.value[index].scale * 100}%`,
  height: `${photoStyles.value[index].scale * 100}%`,
  objectFit: 'cover',
  transform: 'translate(-50%, -50%)',
});

const goBack = () => {
  router.back();
};

const finalize = () => {
  // Here you would typically implement the logic to generate and download the final image
  console.log('Finalizing and downloading...');
  // For now, we'll just show an alert
  alert('Your arranged photos would be downloaded here!');
};

const shareOnSocialMedia = (platform) => {
  // Implement sharing logic for different platforms
  console.log(`Sharing on ${platform}`);
};

const shareViaEmail = () => {
  // Implement email sharing logic
  console.log('Sharing via email');
};

onMounted(() => {
  const arrangementData = JSON.parse(route.query.arrangement || '{}');
  
  if (!arrangementData.photos || !arrangementData.styles || !arrangementData.layout) {
    console.error('Missing arrangement data');
    router.push('/template-selection');
    return;
  }

  photos.value = arrangementData.photos;
  photoStyles.value = arrangementData.styles;
  layout.value = arrangementData.layout;
  templateName.value = arrangementData.templateName || 'Custom Template';
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