<template>
  <div class="frame-editor">
    <h1>Arrange Your Photos</h1>
    <div class="frame-container" :style="frameContainerStyle">
      <div v-for="(cell, index) in layout" :key="index" class="frame-cell" :style="getCellStyle(cell)">
        <div v-if="selectedPhotos[index]" class="photo-container" :style="getPhotoContainerStyle(index)">
          <img :src="selectedPhotos[index].path" :alt="selectedPhotos[index].name" class="photo" :style="getPhotoStyle(index)" @mousedown="startDrag(index, $event)" />
        </div>
      </div>
    </div>
    <div class="controls">
      <div v-for="(photo, index) in selectedPhotos" :key="index" class="photo-control">
        <img :src="photo.path" :alt="photo.name" class="thumbnail" />
        <div class="sliders">
          <label>
            Scale:
            <input type="range" min="0.1" max="2" step="0.1" v-model="photoStyles[index].scale" />
          </label>
        </div>
      </div>
    </div>
    <button @click="saveArrangement">Save Arrangement</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const selectedPhotos = ref([]);
const layout = ref([]);
const photoStyles = ref([]);
const selectedTemplate = ref(null);

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
  cursor: 'move',
});

const startDrag = (index, event) => {
  event.preventDefault();
  const cell = event.target.closest('.frame-cell');
  const cellRect = cell.getBoundingClientRect();
  const photoStyle = photoStyles.value[index];

  const moveHandler = (moveEvent) => {
    const x = ((moveEvent.clientX - cellRect.left) / cellRect.width) * 100;
    const y = ((moveEvent.clientY - cellRect.top) / cellRect.height) * 100;
    photoStyle.x = Math.max(0, Math.min(100, x));
    photoStyle.y = Math.max(0, Math.min(100, y));
  };

  const upHandler = () => {
    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('mouseup', upHandler);
  };

  document.addEventListener('mousemove', moveHandler);
  document.addEventListener('mouseup', upHandler);
};

const saveArrangement = () => {
  const arrangementData = {
    photos: selectedPhotos.value,
    styles: photoStyles.value,
    layout: layout.value,
    templateName: selectedTemplate.value ? selectedTemplate.value.name : 'Custom Template'
  };
  
  router.push({
    path: '/result-preview',
    query: { arrangement: JSON.stringify(arrangementData) }
  });
};

onMounted(() => {
  const templateId = parseInt(route.query.templateId);
  const photosJson = route.query.photos;

  if (!templateId || !photosJson) {
    console.error('Missing template ID or photos');
    router.push('/template-selection');
    return;
  }

  // Fetch the template layout based on the templateId
  // This is a placeholder. You should replace it with actual data fetching logic.
  const templates = [
    { id: 1, name: '2x2 Grid', layout: [
      { x: 0, y: 0, w: 1, h: 1 },
      { x: 1, y: 0, w: 1, h: 1 },
      { x: 0, y: 1, w: 1, h: 1 },
      { x: 1, y: 1, w: 1, h: 1 },
    ]},
    // ... other templates ...
  ];

  selectedTemplate.value = templates.find(t => t.id === templateId);
  if (!selectedTemplate.value) {
    console.error('Invalid template ID');
    router.push('/template-selection');
    return;
  }

  layout.value = selectedTemplate.value.layout;
  selectedPhotos.value = JSON.parse(photosJson);

  // Initialize photoStyles
  photoStyles.value = selectedPhotos.value.map(() => ({
    x: 50,
    y: 50,
    scale: 1,
  }));
});
</script>

<style scoped>
.frame-editor {
  padding: 20px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.photo-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
}

.sliders {
  display: flex;
  flex-direction: column;
}

button {
  margin-top: 20px;
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