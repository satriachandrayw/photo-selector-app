<template>
  <div class="template-preview" :style="gridStyle">
    <div v-for="(cell, index) in layout" :key="index" class="grid-cell" :style="cellStyle(cell)"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  layout: {
    type: Array,
    required: true
  },
  id: {
    type: Number,
    required: true
  }
});

const gridStyle = computed(() => {
  const maxX = Math.max(...props.layout.map(cell => cell.x + cell.w));
  const maxY = Math.max(...props.layout.map(cell => cell.y + cell.h));
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${maxX}, 1fr)`,
    gridTemplateRows: `repeat(${maxY}, 1fr)`,
    aspectRatio: `${maxX} / ${maxY}`,
    gap: '2px',
    backgroundColor: '#ccc',
    padding: '2px',
  };
});

const cellStyle = (cell) => ({
  gridColumn: `${cell.x + 1} / span ${cell.w}`,
  gridRow: `${cell.y + 1} / span ${cell.h}`,
  backgroundColor: 'white',
});
</script>

<style scoped>
.template-preview {
  width: 100%;
  max-width: 200px;
  margin: 0 auto;
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
}

.template-preview:hover {
  border-color: #007bff;
}

.template-preview.selected {
  border-color: #007bff;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
}

.grid-cell {
  background-color: #f0f0f0;
  transition: background-color 0.3s ease;
}

.grid-cell:hover {
  background-color: #e0e0e0;
}
</style>
