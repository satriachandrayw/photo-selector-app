<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const selectedTemplate = ref(null);
const selectedPhotos = ref([]);
const photoAdjustments = ref([]);

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

  if (!templateId || !photosJson) {
    console.error('Missing template ID or photos');
    router.push('/photo-selection');
    return;
  }

  try {
    const response = await fetch(`/api/templates/${templateId}`);
    if (!response.ok) throw new Error('Failed to fetch template');
    selectedTemplate.value = await response.json();
    selectedPhotos.value = JSON.parse(photosJson);
    photoAdjustments.value = selectedPhotos.value.map(() => ({ x: 0, y: 0, scale: 1, rotation: 0 }));
  } catch (error) {
    console.error('Error setting up frame editor:', error);
    router.push('/photo-selection');
  }
});
</script>

<template>
  <div class="frame-editor">
    <h1>Adjust Your Photos</h1>
    <div v-if="selectedTemplate" class="frame-container" :style="frameContainerStyle">
      <div v-for="(slot, index) in selectedTemplate.slots" :key="index" class="photo-slot" :style="getSlotStyle(slot)">
        <img 
          :src="selectedPhotos[index].path" 
          :alt="selectedPhotos[index].name" 
          class="photo" 
          :style="getPhotoStyle(index)"
        />
      </div>
    </div>
    <div class="controls">
      <div v-for="(photo, index) in selectedPhotos" :key="index" class="photo-control">
        <img :src="photo.path" :alt="photo.name" class="thumbnail" />
        <div class="adjustment-controls">
          <button @click="adjustPhoto(index, 'moveX', -10)">←</button>
          <button @click="adjustPhoto(index, 'moveX', 10)">→</button>
          <button @click="adjustPhoto(index, 'moveY', -10)">↑</button>
          <button @click="adjustPhoto(index, 'moveY', 10)">↓</button>
          <button @click="adjustPhoto(index, 'zoom', 0.1)">Zoom +</button>
          <button @click="adjustPhoto(index, 'zoom', -0.1)">Zoom -</button>
          <button @click="adjustPhoto(index, 'rotate', 90)">Rotate</button>
          <button @click="fitToSlot(index)">Fit to Slot</button>
        </div>
      </div>
    </div>
    <button @click="saveArrangement" class="save-button">Save Arrangement</button>
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
</style>