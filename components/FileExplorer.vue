<template>
  <div class="border border-gray-300 p-4 max-h-96 overflow-y-auto">
    <div class="mb-4 flex items-center">
      <button @click="navigateUp" class="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600 transition-colors">Up</button>
      <span class="text-gray-600">{{ currentPath }}</span>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div v-for="item in fileList" 
           :key="item.name" 
           @click="handleItemClick(item)" 
           class="aspect-square cursor-pointer p-2 rounded-lg transition-colors hover:bg-gray-100"
           :class="{ 'bg-blue-100 border-2 border-blue-500': isSelected(item) }"
           :title="item.name">
        <div class="w-full h-full flex justify-center items-center">
          <img v-if="item.isImage" 
               :src="item.thumbnailUrl" 
               :alt="item.name" 
               class="w-full h-full object-cover rounded"
               @error="handleImageError(item)">
          <span v-else class="text-4xl text-gray-400">
            {{ item.type === 'directory' ? '📁' : '📄' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  selectedPhotos: {
    type: Array,
    default: () => []
  }
});

const currentPath = ref('/');
const fileList = ref([]);
const error = ref(null);

const emit = defineEmits(['select-image']);

const fetchFileList = async (path = '/') => {
  try {
    error.value = null;
    const encodedPath = encodeURIComponent(path);
    const response = await fetch(`/api/files?path=${encodedPath}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    fileList.value = data;
    currentPath.value = path;
  } catch (err) {
    console.error('Error fetching file list:', err);
    error.value = 'Failed to fetch file list. Please try again.';
  }
};

const joinPaths = (...parts) => {
  return parts.map(part => part.replace(/^\/|\/$/g, '')).filter(Boolean).join('/');
};

const handleItemClick = (item) => {
  if (item.type === 'directory') {
    currentPath.value = joinPaths(currentPath.value, item.name);
    fetchFileList(currentPath.value);
  } else if (item.isImage) {
    console.log('Selected image:', item);
    const imagePath = joinPaths(currentPath.value, item.name);
    const imageData = {
      path: `/api/files?path=${encodeURIComponent(imagePath)}`,
      name: item.name,
      size: item.size,
      modifiedDate: item.modifiedDate
    };
    emit('select-image', imageData);
  }
};

const navigateUp = () => {
  if (currentPath.value !== '/') {
    const parts = currentPath.value.split('/');
    parts.pop();
    currentPath.value = parts.join('/') || '/';
    fetchFileList(currentPath.value);
  }
};

const handleImageError = (item) => {
  console.error('Failed to load thumbnail for:', item.name);
  // You could set a default image or handle the error in some other way
};

const isSelected = (item) => {
  return props.selectedPhotos.some(photo => photo.name === item.name);
};

onMounted(() => {
  fetchFileList(currentPath.value);
});
</script>