<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const selectedTemplate = ref(null);
const selectedPhotos = ref([]);
const photoAdjustments = ref([]);
const isLoading = ref(true);
const error = ref(null);

const fetchFilePath = async (fileName) => {
  try {
    console.log('Fetching file for:', fileName);
    const response = await fetch(`/api/files/${encodeURIComponent(fileName)}`);
    console.log('API response status:', response.status);
    if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
    
    // Create a blob URL from the response
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    return { name: fileName, url };
  } catch (error) {
    console.error('Error fetching file:', error);
    return null;
  }
};

const frameContainerStyle = computed(() => ({
  backgroundImage: `url(${selectedTemplate.value?.frameSrc})`,
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
  left: `${(slot.x / selectedTemplate.value.width) * 100}%`,
  top: `${(slot.y / selectedTemplate.value.height) * 100}%`,
  width: `${(slot.width / selectedTemplate.value.width) * 100}%`,
  height: `${(slot.height / selectedTemplate.value.height) * 100}%`,
  overflow: 'hidden',
});

const getPhotoStyle = (index) => {
  const adjustment = photoAdjustments.value[index];
  return {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `translate(${adjustment.x}px, ${adjustment.y}px) scale(${adjustment.scale}) rotate(${adjustment.rotation}deg)`,
    transition: 'transform 0.3s ease',
  };
};

const adjustPhoto = (index, type, value) => {
  const adjustment = photoAdjustments.value[index];
  switch (type) {
    case 'moveX':
      adjustment.x += value;
      break;
    case 'moveY':
      adjustment.y += value;
      break;
    case 'zoom':
      adjustment.scale = Math.max(0.1, adjustment.scale + value);
      break;
    case 'rotate':
      adjustment.rotation += value;
      break;
  }
};

const fitToSlot = (index) => {
  photoAdjustments.value[index] = { x: 0, y: 0, scale: 1, rotation: 0 };
};

const saveArrangement = () => {
  // Implement save functionality here
  console.log('Saving arrangement:', { template: selectedTemplate.value, photos: selectedPhotos.value, adjustments: photoAdjustments.value });
  // You might want to send this data to your backend or store it locally
};

onMounted(async () => {
  const templateId = route.query.templateId;
  const photosJson = route.query.photos;

  console.log('Route query:', route.query);

  if (!templateId || !photosJson) {
    console.error('Missing template ID or photos');
    router.push('/select-photo');
    return;
  }

  try {
    const response = await fetch(`/api/templates/${templateId}`);
    if (!response.ok) throw new Error('Failed to fetch template');
    selectedTemplate.value = await response.json();
    
    const parsedPhotos = JSON.parse(photosJson);
    console.log('Parsed photos:', parsedPhotos);
    
    // Fetch actual files for each photo
    const photoPromises = parsedPhotos.map(async (photo) => {
      console.log('Processing photo:', photo);
      const fileData = await fetchFilePath(photo.name);
      console.log('Fetched file data:', fileData);
      return fileData;
    });
    
    selectedPhotos.value = await Promise.all(photoPromises);
    console.log('Selected photos with fetched data:', selectedPhotos.value);
    
    photoAdjustments.value = selectedPhotos.value.map(() => ({ x: 0, y: 0, scale: 1, rotation: 0 }));
    isLoading.value = false;
  } catch (error) {
    console.error('Error setting up frame editor:', error);
    error.value = error.message;
    router.push('/select-photo');
  }
});
</script>

<template>
  <div class="frame-editor">
    <h1>Adjust Your Photos</h1>
    <div v-if="selectedTemplate" class="frame-container" :style="frameContainerStyle">
      <div v-for="(slot, index) in selectedTemplate.slots" :key="index" class="photo-slot" :style="getSlotStyle(slot)">
        <img 
          v-if="selectedPhotos[index] && selectedPhotos[index].url"
          :src="selectedPhotos[index].url" 
          :alt="selectedPhotos[index].name" 
          class="photo" 
          :style="getPhotoStyle(index)"
        />
        <div v-else class="placeholder">
          Image not found
        </div>
      </div>
    </div>
    <div class="controls">
      <div v-for="(photo, index) in selectedPhotos" :key="index" class="photo-control">
        <img :src="photo.path" :alt="photo.name" class="thumbnail" />
        <div class="adjustment-controls">
          <button @click="adjustPhoto(index, 'moveX', -10)">←</button>
          <button @click="adjustPhoto(index, 'moveX', 10)">→</button>
          <button @click="adjustPhoto(index, 'moveY', -10)">↑</button>
          <button @click="adjustPhoto(index, 'moveY', 10)">��</button>
          <button @click="adjustPhoto(index, 'zoom', 0.1)">Zoom +</button>
          <button @click="adjustPhoto(index, 'zoom', -0.1)">Zoom -</button>
          <button @click="adjustPhoto(index, 'rotate', 90)">Rotate</button>
          <button @click="fitToSlot(index)">Fit to Slot</button>
        </div>
      </div>
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