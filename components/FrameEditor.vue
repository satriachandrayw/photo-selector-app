<template>
  <div class="frame-editor">
    <div class="frame-container" :style="frameContainerStyle">
      <div class="image-container">
        <img :src="imageSrc" alt="Selected Image" class="selected-image" />
        <div class="frame" :style="frameStyle"></div>
      </div>
      <img class="frame-overlay" :src="'assets/frames/1.png'" alt="Frame Overlay" />
    </div>
    <div class="controls">
      <label>
        Frame Color:
        <input type="color" v-model="frameColor" />
      </label>
      <label>
        Frame Width:
        <input type="range" v-model="frameWidth" min="0" max="50" />
        {{ frameWidth }}px
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  imageSrc: {
    type: String,
    required: true
  }
});

const frameColor = ref('#000000');
const frameWidth = ref(10);

const frameStyle = computed(() => ({
  borderColor: frameColor.value,
  borderWidth: `${frameWidth.value}px`,
}));

const frameContainerStyle = computed(() => ({
  position: 'relative',
  width: '100%',
  height: '0',
  paddingBottom: '100%',
  overflow: 'hidden',
}));
</script>

<style scoped>
.frame-editor {
  max-width: 600px;
  margin: 0 auto;
}

.image-container {
  position: relative;
  display: inline-block;
}

.selected-image {
  max-width: 100%;
  display: block;
}

.frame {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-style: solid;
  pointer-events: none;
}

.frame-container {
  position: relative;
}

.frame-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.controls {
  margin-top: 20px;
}

label {
  display: block;
  margin-bottom: 10px;
}

input[type="range"] {
  width: 200px;
}
</style>