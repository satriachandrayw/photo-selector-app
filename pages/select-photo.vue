<template>
  <div class="select-photo">
    <h1>Select Photos</h1>
    <FileExplorer @select-image="addPhoto" />
    <div class="selected-photos">
      <div v-for="photo in selectedPhotos" :key="photo.id" class="photo-item">
        <img :src="photo.url" :alt="photo.name">
        <button @click="removePhoto(photo.id)">Remove</button>
      </div>
    </div>
    <button 
      @click="goToFrameEditor" 
      :disabled="!isProjectComplete"
    >
      Next
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePhotoEditorStore } from '~/stores/photoEditorStore';
import FileExplorer from '~/components/FileExplorer.vue';

const router = useRouter();
const photoEditorStore = usePhotoEditorStore();

const selectedPhotos = computed(() => photoEditorStore.selectedPhotos);
const isProjectComplete = computed(() => photoEditorStore.isProjectComplete);

const addPhoto = (photo) => {
  photoEditorStore.addPhoto(photo);
};

const removePhoto = (photoId) => {
  photoEditorStore.removePhoto(photoId);
};

const goToFrameEditor = () => {
  router.push('/frame-editor');
};
</script>