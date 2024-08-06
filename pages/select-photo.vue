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
          <div v-if="selectedPhotos[index] && selectedPhotos[index].path" class="w-full h-full relative">
            <img 
              :src="getImageSrc(selectedPhotos[index])"
              :alt="selectedPhotos[index].name" 
              class="w-full h-full object-cover"
              @load="onSlotImageLoad(index, $event)"
              @error="onSlotImageError(index, $event)"
            />
            <div class="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white p-1 text-xs">
              {{ selectedPhotos[index].name }} ({{ getImageSrc(selectedPhotos[index]) }})
            </div>
          </div>
          <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors duration-200"
            @click="openFileExplorer(index)"
          >
            <span class="text-sm text-gray-600">Click to select photo (Slot {{ index + 1 }})</span>
          </div>
        </div>
      </div>
    </div>
    
    <FileExplorer 
      v-if="showFileExplorer"
      :selected-photos="selectedPhotos"
      @select-image="(image) => handleImageSelect(image, currentSlotIndex)"
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
import { ref, computed, onMounted, watch, nextTick } from 'vue';
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
const slotImageDimensions = ref([]);

const getSlotStyle = (slot) => {
  if (!imageDimensions.value.width || !imageDimensions.value.height) return {};
  return {
    left: `${(slot.x / imageDimensions.value.width) * 100}%`,
    top: `${(slot.y / imageDimensions.value.height) * 100}%`,
    width: `${(slot.width / imageDimensions.value.width) * 100}%`,
    height: `${(slot.height / imageDimensions.value.height) * 100}%`,
  };
};

const onSlotImageLoad = (index, event) => {
  console.log(`Image loaded for slot ${index}:`, event.target.src);
};

const onSlotImageError = (index, event) => {
  console.error(`Error loading image for slot ${index}:`, event.target.src);
  // Set a fallback image or handle the error as needed
  selectedPhotos.value[index].path = '/path/to/fallback-image.jpg';
};

const getImageSrc = (photo) => {
  if (!photo || typeof photo !== 'object') {
    console.error('Invalid photo object:', photo);
    return '';
  }
  if (!photo.path) {
    console.error('Photo object has no path:', photo);
    return '';
  }
  if (photo.path.startsWith('http') || photo.path.startsWith('data:')) {
    return photo.path;
  }
  return `/api/files?path=${encodeURIComponent(photo.path)}`;
};

const handleImageSelect = (image) => {
  console.log('handleImageSelect called with:', image);
  console.log('Current slot index:', currentSlotIndex.value);
  if (currentSlotIndex.value !== null && currentSlotIndex.value >= 0 && currentSlotIndex.value < selectedPhotos.value.length) {
    selectedPhotos.value = [...selectedPhotos.value];
    selectedPhotos.value[currentSlotIndex.value] = {
      ...image,
      path: image.path || ''  // Ensure path is always a string
    };
    console.log('Updated selectedPhotos:', selectedPhotos.value);
    currentSlotIndex.value = null;
    showFileExplorer.value = false;
  } else {
    console.error('Invalid current slot index:', currentSlotIndex.value);
  }
};

const openFileExplorer = (index) => {
  console.log('Opening file explorer for slot:', index);
  currentSlotIndex.value = index;
  nextTick(() => {
    showFileExplorer.value = true;
    console.log('FileExplorer should now be visible');
  });
};

const allPhotosSelected = computed(() => {
  return selectedTemplate.value && 
         selectedPhotos.value.length === selectedTemplate.value.slots.length && 
         selectedPhotos.value.every(photo => photo !== null && photo !== undefined);
});

const goToFrameEditor = () => {
  if (allPhotosSelected.value) {
    console.log('Selected photos before navigation:', selectedPhotos.value);
    const queryParams = {
      templateId: selectedTemplate.value.id,
      photos: JSON.stringify(selectedPhotos.value.map(photo => ({
        name: photo.name, // Make sure this is the correct file name
        path: photo.path
      })))
    };
    console.log('Query params for navigation:', queryParams);
    router.push({ 
      path: '/frame-editor',
      query: queryParams
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

watch(() => showFileExplorer.value, (newValue) => {
  console.log('showFileExplorer changed:', newValue);
});

watch(() => currentSlotIndex.value, (newValue) => {
  console.log('currentSlotIndex changed:', newValue);
});
</script>