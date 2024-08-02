<template>
  <div>
    <h2>Photo Frame Selector</h2>
    <input type="file" @change="onFileChange" accept="image/*" ref="fileInput" style="display: none;">
    <button @click="$refs.fileInput.click()">Select Photo</button>
    <div class="frame-options">
      <button v-for="frame in frames" :key="frame.id" @click="selectFrame(frame)">
        {{ frame.name }}
      </button>
    </div>
    <div v-if="photoUrl" class="preview" :style="{ border: selectedFrame.style }">
      <img :src="photoUrl" alt="Selected photo" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const frames = [
  { id: 1, name: 'Simple Black', style: '5px solid black' },
  { id: 2, name: 'Golden Edge', style: '5px solid gold' },
  { id: 3, name: 'Wooden Look', style: '10px ridge brown' },
]

const selectedFrame = ref(frames[0])
const photoUrl = ref(null)

const selectFrame = (frame) => {
  selectedFrame.value = frame
}

const onFileChange = (e) => {
  const file = e.target.files[0]
  photoUrl.value = URL.createObjectURL(file)
}
</script>

<style scoped>
.frame-options {
  margin-bottom: 20px;
}
.preview {
  max-width: 300px;
  padding: 10px;
}
.preview img {
  max-width: 100%;
  height: auto;
}
</style>