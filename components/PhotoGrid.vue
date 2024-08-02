<template>
  <div class="photo-grid">
    <div v-for="photo in photos" :key="photo.id" class="photo-item">
      <img 
        :src="photo.thumbnailUrl" 
        :alt="photo.title" 
        @click="selectPhoto(photo)"
        :class="{ selected: selectedPhotoId === photo.id }"
      >
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  photos: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['select']);

const selectedPhotoId = ref(null);

const selectPhoto = (photo) => {
  selectedPhotoId.value = photo.id;
  emit('select', photo);
};
</script>

<style scoped>
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.photo-item {
  position: relative;
}

.photo-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.photo-item img:hover {
  transform: scale(1.05);
}

.photo-item img.selected {
  border: 3px solid #007bff;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
}
</style>
