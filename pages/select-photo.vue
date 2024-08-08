<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-4">Select Photos for Your Template</h1>
    
    <p v-if="isLoading" class="text-gray-600">Loading template...</p>
    <p v-else-if="error" class="text-red-600 font-semibold mb-4">{{ error }}</p>
    
    <div v-else-if="selectedTemplate" class="mb-8">
      <div class="relative" ref="containerRef">
        <img 
          :src="frameImageSrc" 
          :alt="selectedTemplate.name"
          @load="onImageLoad"
          class="w-full"
          ref="imageRef"
        />
        <div 
          v-for="(slot, index) in selectedTemplate.slots" 
          :key="index" 
          class="absolute border-2 border-dashed border-blue-400 overflow-hidden"
          :style="getSlotStyle(slot)"
        >
          <div v-if="selectedPhotos[index]" class="w-full h-full relative">
            <img 
              :src="selectedPhotos[index].url"
              :alt="selectedPhotos[index].name" 
              class="w-full h-full object-cover"
            />
          </div>
          <div v-else 
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
      class="mb-8"
    />
    
    <div class="text-center">
      <button 
        @click="goToFrameEditor" 
        :disabled="!isProjectComplete"
        class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        Next: Adjust Photos
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePhotoEditorStore } from '~/stores/photoEditorStore';
import FileExplorer from '~/components/FileExplorer.vue';

const router = useRouter();
const route = useRoute();
const photoEditorStore = usePhotoEditorStore();

const showFileExplorer = ref(false);
const currentSlotIndex = ref(null);
const containerRef = ref(null);
const imageRef = ref(null);
const imageDimensions = ref({ width: 0, height: 0 });

const selectedTemplate = computed(() => photoEditorStore.selectedTemplate);
const selectedPhotos = computed(() => photoEditorStore.selectedPhotos);
const isProjectComplete = computed(() => photoEditorStore.isProjectComplete);
const frameImageSrc = computed(() => photoEditorStore.frameImageSrc);
const isLoading = computed(() => photoEditorStore.isLoading);
const error = computed(() => photoEditorStore.error);

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
    photoEditorStore.addPhoto({
      name: image.name,
      url: image.path
    });
    currentSlotIndex.value = null;
    showFileExplorer.value = false;
  }
};

const openFileExplorer = (index) => {
  currentSlotIndex.value = index;
  showFileExplorer.value = true;
};

const goToFrameEditor = () => {
  if (isProjectComplete.value) {
    router.push('/frame-editor');
  }
};

const onImageLoad = () => {
  if (imageRef.value) {
    imageDimensions.value = {
      width: imageRef.value.naturalWidth,
      height: imageRef.value.naturalHeight
    };
  }
};

onMounted(async () => {
  const templateId = route.query.templateId;
  if (templateId) {
    photoEditorStore.setLoading(true);
    try {
      const response = await fetch(`/api/templates/${templateId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const template = await response.json();
      photoEditorStore.setTemplate(template);
    } catch (error) {
      photoEditorStore.setError('Failed to load template. Please try again.');
    } finally {
      photoEditorStore.setLoading(false);
    }
  } else {
    photoEditorStore.setError('No template selected. Please choose a template first.');
    setTimeout(() => router.push('/template-selection'), 3000);
  }
});
</script>