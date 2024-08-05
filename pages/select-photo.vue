<template>
  <div class="select-photo-page">
    <h1>Select Photos for Your Template</h1>
    <p v-if="selectedTemplate">Template: {{ selectedTemplate.name }}</p>
    <p v-else>Loading template...</p>
    <div v-if="selectedTemplate" class="template-preview">
      <img :src="selectedTemplate.frameSrc" :alt="selectedTemplate.name" class="frame-overlay-preview" />
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
        :disabled="!selectedTemplate || selectedPhotos.length !== selectedTemplate.photoSlots"
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

const router = useRouter();
const route = useRoute();

const selectedTemplate = ref(null);
const selectedPhotos = ref([]);
const error = ref(null);

const fetchTemplate = async (templateId) => {
  try {
    const response = await fetch(`/api/templates/${templateId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    selectedTemplate.value = await response.json();
    console.log('Fetched template:', selectedTemplate.value);
  } catch (e) {
    console.error('Error fetching template:', e);
    error.value = 'Failed to load template. Please try again.';
  }
};

const handleImageToggle = (image) => {
  const index = selectedPhotos.value.findIndex(photo => photo.name === image.name);
  if (index !== -1) {
    // If the image is already selected, remove it
    selectedPhotos.value.splice(index, 1);
  } else if (selectedTemplate.value && selectedPhotos.value.length < selectedTemplate.value.photoSlots) {
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

onMounted(async () => {
  const templateId = route.query.templateId;
  if (templateId) {
    await fetchTemplate(templateId);
  } else {
    console.error('No template ID provided');
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

.frame-overlay-preview {
  width: 100%;
  height: auto;
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

.error-message {
  color: red;
  font-weight: bold;
  margin-bottom: 1rem;
}
</style>