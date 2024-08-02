<template>
  <div class="file-explorer">
    <div class="path-navigation">
      <button @click="navigateUp">Up</button>
      <span>{{ currentPath }}</span>
    </div>
    <div class="file-list">
      <div v-for="item in fileList" 
           :key="item.name" 
           @click="handleItemClick(item)" 
           class="file-item"
           :class="{ 'selected': isSelected(item) }"
           :title="item.name">
        <div class="file-item-content">
          <img v-if="item.isImage" 
               :src="item.thumbnailUrl" 
               :alt="item.name" 
               class="thumbnail"
               @error="handleImageError(item)">
          <span v-else class="material-icons">{{ item.type === 'directory' ? 'folder' : 'insert_drive_file' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  selectedPhotos: {
    type: Array,
    default: () => []
  }
});

const currentPath = ref('/');
const fileList = ref([]);

const emit = defineEmits(['toggle-image']);

const fetchFileList = async (path) => {
  try {
    const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch file list');
    }
    const data = await response.json();
    console.log('Fetched file list:', data);
    fileList.value = data;
  } catch (error) {
    console.error('Error fetching file list:', error);
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
    console.log('Toggled image:', item);
    const imagePath = joinPaths(currentPath.value, item.name);
    const imageData = {
      path: `/api/files?path=${encodeURIComponent(imagePath)}`,
      name: item.name,
      size: item.size,
      modifiedDate: item.modifiedDate
    };
    emit('toggle-image', imageData);
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

fetchFileList(currentPath.value);
</script>

<style scoped>
.file-explorer {
  border: 1px solid #ccc;
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.path-navigation {
  margin-bottom: 10px;
}

.file-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

.file-item {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  aspect-ratio: 1 / 1;
}

.file-item:hover {
  background-color: #f0f0f0;
}

.file-item.selected {
  border-color: #007bff;
  background-color: #e6f2ff;
}

.file-item-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.material-icons {
  font-size: 48px;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>