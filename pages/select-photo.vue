<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-4">Select Photos for Your Template</h1>
    
    <p v-if="loading" class="text-gray-600">Loading template...</p>
    <p v-else-if="error" class="text-red-600 font-semibold mb-4">{{ error }}</p>
    
    <div v-else-if="selectedTemplate" class="mb-8">
      <div class="relative" ref="containerRef">
        <img 
          :src="selectedTemplate.frameSrc" 
          :alt="selectedTemplate.name"
          @load="onImageLoad"
          @error="onImageError"
          class="w-full transition-opacity duration-300"
          :class="{ 'opacity-0': !imageLoaded, 'opacity-100': imageLoaded }"
          ref="imageRef"
        />
        <div 
          v-for="(slot, index) in selectedTemplate.slots" 
          :key="index" 
          class="absolute border-2 border-dashed border-blue-400 overflow-hidden"
          :style="getSlotStyle(slot)"
        >
          <img 
            v-if="selectedPhotos[index]" 
            :src="selectedPhotos[index].path" 
            :alt="selectedPhotos[index].name" 
            class="w-full h-full object-cover"
          />
          <div 
            v-else 
            class="w-full h-full flex items-center justify-center bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors duration-200"
            @click="openFileExplorer(index)"
          >
            <span class="text-sm text-gray-600">Click to select photo (Slot {{ index + 1 }})</span>
          </div>
        </div>
      </div>
    </div>
    
    <FileExplorer 
      v-if="showFileExplorer"
      @select-image="handleImageSelect"
      :selectedPhotos="selectedPhotos"
      class="mb-8"
    />
    
    <div class="text-center">
      <button 
        @click="goToFrameEditor" 
        :disabled="!allPhotosSelected"
        class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        Next: Adjust Photos
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import FileExplorer from '~/components/FileExplorer.vue';

const router = useRouter();
const route = useRoute();

const selectedTemplate = ref(null);
const selectedPhotos = ref([]);
const currentSlotIndex = ref(null);
const showFileExplorer = ref(false);
const loading = ref(true);
const error = ref(null);
const imageLoaded = ref(false);
const containerRef = ref(null);
const imageRef = ref(null);
const imageDimensions = ref({ width: 0, height: 0 });

const getSlotStyle = (slot) => {
  if (!imageDimensions.value.width || !imageDimensions.value.height) return {};
  return {
    left: `${(slot.x / imageDimensions.value.width) * 100}%`,
    top: `${(slot.y / imageDimensions.value.height) * 100}%`,
    width: `${(slot.width / imageDimensions.value.width) * 100}%`,
    height: `${(slot.height / imageDimensions.value.height) * 100}%`,
  };
};

const handleImageSelect = (image) => {
  if (currentSlotIndex.value !== null) {
    selectedPhotos.value[currentSlotIndex.value] = image;
    currentSlotIndex.value = null;
    showFileExplorer.value = false;
  }
};

const openFileExplorer = (index) => {
  currentSlotIndex.value = index;
  showFileExplorer.value = true;
};

const allPhotosSelected = computed(() => {
  return selectedTemplate.value && 
         selectedPhotos.value.length === selectedTemplate.value.slots.length && 
         selectedPhotos.value.every(photo => photo !== null && photo !== undefined);
});

const goToFrameEditor = () => {
  if (allPhotosSelected.value) {
    router.push({
      name: 'frame-editor',
      query: { 
        templateId: selectedTemplate.value.id,
        photos: JSON.stringify(selectedPhotos.value.map(photo => photo.path))
      }
    });
  }
};

const fetchTemplate = async (templateId) => {
  try {
    loading.value = true;
    error.value = null;
    const response = await fetch(`/api/templates/${templateId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    selectedTemplate.value = data;
    selectedPhotos.value = new Array(data.slots.length).fill(null);
  } catch (error) {
    console.error('Error fetching template:', error);
    error.value = 'Failed to load template. Please try again.';
  } finally {
    loading.value = false;
  }
};

const onImageLoad = () => {
  imageLoaded.value = true;
  if (imageRef.value) {
    imageDimensions.value = {
      width: imageRef.value.naturalWidth,
      height: imageRef.value.naturalHeight
    };
  }
};

const onImageError = () => {
  error.value = 'Failed to load template image. Please try again.';
};

onMounted(async () => {
  const templateId = route.query.templateId;
  if (templateId) {
    await fetchTemplate(templateId);
  } else {
    console.error('No template ID provided');
    error.value = 'No template selected. Please choose a template first.';
    setTimeout(() => router.push('/template-selection'), 3000);
  }
});
</script>