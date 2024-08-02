<template>
  <div class="template-selection">
    <h1>Choose a Template</h1>
    <div class="templates-grid">
      <div v-for="template in templates" :key="template.id" class="template-item">
        <TemplatePreview 
          :layout="template.layout" 
          :id="template.id"
          @click="selectTemplate(template)"
          :class="{ selected: selectedTemplate === template.id }"
        />
        <p>{{ template.name }}</p>
      </div>
    </div>
    <button @click="goToPhotoSelection" :disabled="!selectedTemplate">Next</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import TemplatePreview from '~/components/TemplatePreview.vue';

const router = useRouter();
const selectedTemplate = ref(null);

const templates = [
  { id: 1, name: '2x2 Grid', layout: [
    { x: 0, y: 0, w: 1, h: 1 },
    { x: 1, y: 0, w: 1, h: 1 },
    { x: 0, y: 1, w: 1, h: 1 },
    { x: 1, y: 1, w: 1, h: 1 },
  ]},
  { id: 2, name: '3x3 Grid', layout: [
    { x: 0, y: 0, w: 1, h: 1 }, { x: 1, y: 0, w: 1, h: 1 }, { x: 2, y: 0, w: 1, h: 1 },
    { x: 0, y: 1, w: 1, h: 1 }, { x: 1, y: 1, w: 1, h: 1 }, { x: 2, y: 1, w: 1, h: 1 },
    { x: 0, y: 2, w: 1, h: 1 }, { x: 1, y: 2, w: 1, h: 1 }, { x: 2, y: 2, w: 1, h: 1 },
  ]},
  { id: 3, name: 'Mixed Layout', layout: [
    { x: 0, y: 0, w: 2, h: 2 },
    { x: 2, y: 0, w: 1, h: 1 },
    { x: 2, y: 1, w: 1, h: 1 },
    { x: 0, y: 2, w: 1, h: 1 },
    { x: 1, y: 2, w: 1, h: 1 },
    { x: 2, y: 2, w: 1, h: 1 },
  ]},
];

const selectTemplate = (template) => {
  selectedTemplate.value = template.id;
};

const goToPhotoSelection = () => {
  if (selectedTemplate.value) {
    router.push({
      path: '/select-photo',
      query: { templateId: selectedTemplate.value }
    });
  } else {
    console.error('No template selected');
    // Optionally, show an error message to the user
  }
};
</script>

<style scoped>
.template-selection {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.template-item {
  text-align: center;
}

button {
  display: block;
  margin: 0 auto;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>