<template>
  <div class="template-selection">
    <h1>Select a Photo Layout</h1>
    <p>Debug: Component is rendered</p>
    <div v-if="isLoading" class="loading">
      Loading templates, please wait...
    </div>
    <div v-else>
      <p>Number of templates: {{ templates.length }}</p>
      <div class="templates-grid">
        <div v-for="template in templates" :key="template.id" class="template-item" 
             :class="{ 'selected': selectedTemplate === template }"
             @click="selectTemplate(template)">
          <h3>{{ template.name }} (ID: {{ template.id }})</h3>
          <div class="frame-preview">
            <img :src="template.frameSrc" :alt="template.name" class="frame-overlay-preview" />
            <div v-if="selectedTemplate === template" class="selected-marker">
              <span class="checkmark">✓</span>
            </div>
          </div>
          <p>Photo slots: {{ template.photoSlots }}</p>
        </div>
      </div>
    </div>
    <button @click="proceedToPhotoSelection" :disabled="!selectedTemplate || isLoading">Next</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const templates = ref([])
const selectedTemplate = ref(null)
const isLoading = ref(true)

const fetchTemplates = async () => {
  try {
    console.log('Client: Fetching templates')
    const response = await fetch('/api/templates')
    if (!response.ok) throw new Error('Failed to fetch templates')
    const data = await response.json()
    console.log('Client: Received templates:', JSON.stringify(data, null, 2))
    templates.value = data
    console.log('Client: Templates after assignment:', JSON.stringify(templates.value, null, 2))
  } catch (error) {
    console.error('Error fetching templates:', error)
  } finally {
    isLoading.value = false
  }
}

const selectTemplate = (template) => {
  selectedTemplate.value = template
}

const proceedToPhotoSelection = () => {
  if (selectedTemplate.value) {
    router.push({
      path: '/select-photo',
      query: { 
        templateId: selectedTemplate.value.id,
        photoSlots: selectedTemplate.value.photoSlots
      }
    })
  }
}

onMounted(() => {
  console.log('Client: Component mounted, calling fetchTemplates')
  fetchTemplates()
})
</script>

<style scoped>
.template-selection {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.template-item {
  text-align: center;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-item.selected {
  border-color: #28a745;
  background-color: rgba(40, 167, 69, 0.1);
}

.frame-preview {
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* Maintain aspect ratio */
  margin-bottom: 10px;
}

.selected-marker {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #28a745;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkmark {
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.frame-overlay-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button.selected {
  background-color: #28a745;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 20px;
  font-style: italic;
}
</style>