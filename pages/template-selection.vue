<template>
  <div class="template-selection">
    <h1>Select a Photo Layout</h1>
    <p v-if="isLoading">Loading templates...</p>
    <p v-if="error" class="error-message">{{ error }}</p>
    <div v-else>
      <p>Number of templates: {{ templates.length }}</p>
      <div class="templates-grid">
        <div v-for="template in templates" :key="template.id" class="template-item" 
             :class="{ 'selected': selectedTemplate?.id === template.id }"
             @click="selectTemplate(template)">
          <h3>{{ template.name }} (ID: {{ template.id }})</h3>
          <div class="frame-preview">
            <img :src="template.frameSrc" :alt="template.name" class="frame-overlay-preview" />
            <div v-if="selectedTemplate?.id === template.id" class="selected-marker">
              <span class="checkmark">✓</span>
            </div>
          </div>
          <p>Photo slots: {{ template.slots.length }}</p>
        </div>
      </div>
    </div>
    <button @click="proceedToPhotoSelection" :disabled="!selectedTemplate || isLoading">Next</button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePhotoEditorStore } from '~/stores/photoEditorStore'

const router = useRouter()
const photoEditorStore = usePhotoEditorStore()

const templates = ref([])
const selectedTemplate = computed(() => photoEditorStore.selectedTemplate)
const isLoading = computed(() => photoEditorStore.isLoading)
const error = computed(() => photoEditorStore.error)

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
    photoEditorStore.setError('Failed to load templates. Please try again.')
  } finally {
    photoEditorStore.setLoading(false)
  }
}

const selectTemplate = (template) => {
  photoEditorStore.setTemplate(template)
  photoEditorStore.saveToLocalStorage()
}

const proceedToPhotoSelection = () => {
  if (selectedTemplate.value) {
    router.push({
      path: '/select-photo',
      query: { 
        templateId: selectedTemplate.value.id,
        photoSlots: selectedTemplate.value.slots.length
      }
    })
  }
}

onMounted(() => {
  console.log('Client: Component mounted, calling fetchTemplates')
  if (!photoEditorStore.selectedTemplate) {
    fetchTemplates()
  } else {
    templates.value = [photoEditorStore.selectedTemplate]
  }
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