<template>
  <div class="select-photo-page">
    <h1>Select Photos for Your Template</h1>
    <p v-if="selectedTemplate">Template: {{ templateName }}</p>
    <p v-else>Loading template...</p>
    <div v-if="selectedTemplate" class="template-preview">
      <TemplatePreview :layout="selectedTemplate.layout" :id="selectedTemplate.id" />
    </div>
    <FileExplorer 
      @toggle-image="handleImageToggle"
      :selectedPhotos="selectedPhotos"
    />
    <div class="selected-photos">
      <div v-for="(photo, index) in selectedPhotos" :key="index" class="selected-photo">
        <img :src="photo.path" :alt="photo.name" />
        <button @click="removePhoto(index)" class="remove-button" title="Remove photo">×</button>
      </div>
    </div>
    <div class="navigation">
      <button 
        @click="goToFrameEditor" 
        :disabled="!selectedTemplate || selectedPhotos.length !== selectedTemplate.layout.length"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import FileExplorer from '~/components/FileExplorer.vue';
import TemplatePreview from '~/components/TemplatePreview.vue';

const router = useRouter();
const route = useRoute();

const templates = [
  { id: 1, name: '2x2 Grid', layout: [
    { x: 0, y: 0, w: 1, h: 1 },
    { x: 1, y: 0, w: 1, h: 1 },
    { x: 0, y: 1, w: 1, h: 1 },
    { x: 1, y: 1, w: 1, h: 1 },
  ]},
  { id: 2, name: '3x3 Grid', layout: [
    { x: 0, y: 0, w: 1, h: 1 }, { x: 1, y: 0, w: 1, h: 1 }, { x: 2, y: 0, w: 1, h: 1 },
    { x: 0, y: 1, w: 1, h: 1 }, { x: 1, y: 1, w: 1, h: 1 }, { x: 2, y: 1, w: 1, h: 1 },
    { x: 0, y: 2, w: 1, h: 1 }, { x: 1, y: 2, w: 1, h: 1 }, { x: 2, y: 2, w: 1, h: 1 },
  ]},
  { id: 3, name: 'Mixed Layout', layout: [
    { x: 0, y: 0, w: 2, h: 2 },
    { x: 2, y: 0, w: 1, h: 1 },
    { x: 2, y: 1, w: 1, h: 1 },
    { x: 0, y: 2, w: 1, h: 1 },
    { x: 1, y: 2, w: 1, h: 1 },
    { x: 2, y: 2, w: 1, h: 1 },
  ]},
];

const selectedTemplate = ref(null);
const selectedPhotos = ref([]);

const templateName = computed(() => selectedTemplate.value ? selectedTemplate.value.name : 'No template selected');

const handleImageToggle = (image) => {
  const index = selectedPhotos.value.findIndex(photo => photo.name === image.name);
  if (index !== -1) {
    // If the image is already selected, remove it
    selectedPhotos.value.splice(index, 1);
  } else if (selectedTemplate.value && selectedPhotos.value.length < selectedTemplate.value.layout.length) {
    // If the image is not selected and there's room for more photos, add it
    selectedPhotos.value.push(image);
  }
};

const removePhoto = (index) => {
  selectedPhotos.value.splice(index, 1);
};

const goToFrameEditor = () => {
  if (selectedTemplate.value) {
    router.push({
      path: '/frame-editor',
      query: { 
        templateId: selectedTemplate.value.id,
        photos: JSON.stringify(selectedPhotos.value)
      }
    });
  }
};

onMounted(() => {
  const templateId = parseInt(route.query.templateId);
  selectedTemplate.value = templates.find(t => t.id === templateId) || null;
  if (!selectedTemplate.value) {
    console.error('Invalid template ID:', templateId);
    router.push('/template-selection');
  }
});
</script>

<style scoped>
.select-photo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.template-preview {
  max-width: 300px;
  margin: 0 auto 2rem;
}

.selected-photos {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.selected-photo {
  position: relative;
  width: 100px;
  height: 100px;
}

.selected-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.remove-button:hover {
  background-color: rgba(255, 0, 0, 0.9);
}

.navigation {
  margin-top: 2rem;
  text-align: center;
}

button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>