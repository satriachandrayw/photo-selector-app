<template>
  <div class="border border-gray-300 p-4 max-h-96 overflow-y-auto">
    <div class="mb-4 flex items-center">
      <button @click="navigateUp" class="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600 transition-colors">Up</button>
      <span class="text-gray-600">{{ currentPath }}</span>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div v-for="file in files" :key="file.path" class="mb-2">
        <div 
          :class="['flex items-center p-2 rounded', isSelected(file) ? 'bg-blue-100' : 'hover:bg-gray-100']"
          @click="selectFile(file)"
        >
          <div class="w-full h-full flex justify-center items-center">
            <img 
              v-if="file.isImage" 
              :src="file.thumbnailData || file.thumbnailUrl" 
              :alt="file.name"
              @error="handleImageError(file)"
              class="w-full h-full object-cover rounded"
            />
            <span v-else class="text-4xl text-gray-400">
              {{ file.type === 'directory' ? '📁' : '📄' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  selectedPhotos: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select-image']);

const files = ref([]);
const currentPath = ref('');

const fetchFileList = async (path = '') => {
  try {
    const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    files.value = data.files;
    currentPath.value = data.currentPath;
    console.log('Fetched files:', files.value);
  } catch (error) {
    console.error('Error fetching file list:', error);
  }
};

const navigateTo = (folderName) => {
  fetchFileList(folderName);
};

const navigateUp = () => {
  fetchFileList('..');
};

const selectFile = (file) => {
  console.log('File selected:', file);
  if (file.type === 'directory') {
    navigateTo(file.name);
  } else if (file.isImage) {
    emit('select-image', file);
  }
};

const handleImageError = async (file) => {
  console.error('Error loading image:', file.thumbnailUrl);
  try {
    const response = await fetch(file.thumbnailUrl);
    if (!response.ok) throw new Error('Failed to fetch thumbnail');
    const data = await response.text();
    file.thumbnailData = data;
  } catch (error) {
    console.error('Error fetching thumbnail:', error);
    file.thumbnailData = '/path/to/fallback-image.png'; // Replace with a path to a default image
  }
};

const isSelected = computed(() => (file) => {
  return Array.isArray(props.selectedPhotos) && props.selectedPhotos.some(photo => photo && photo.name === file.name);
});

onMounted(() => {
  fetchFileList();
});
</script>