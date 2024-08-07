import { defineStore } from 'pinia'
import { shallowRef } from 'vue'
import { useStack } from '@vueuse/core'

interface Photo {
  id: number;
  name: string;
  url: string;
}

interface Template {
  id: string;
  name: string;
  frameSrc: string;
  width: number;
  height: number;
  slots: Array<{ x: number, y: number, width: number, height: number }>;
}

interface PhotoAdjustment {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export const usePhotoEditorStore = defineStore('photoEditor', {
  state: () => ({
    selectedTemplate: shallowRef(null as Template | null),
    selectedPhotos: shallowRef([] as Photo[]),
    photoAdjustments: {} as Record<number, PhotoAdjustment>,
    photoUrls: {} as Record<string, string>,
    isLoading: false,
    error: null as string | null,
    history: useStack([]),
    nextPhotoId: 1,
  }),

  actions: {
    setTemplate(template: Template) {
      this.selectedTemplate = template;
    },

    addPhoto(photo: Omit<Photo, 'id'>) {
      const newPhoto: Photo = { ...photo, id: this.nextPhotoId };
      this.selectedPhotos.push(newPhoto);
      this.photoAdjustments[this.nextPhotoId] = { x: 0, y: 0, scale: 1, rotation: 0 };
      this.nextPhotoId++;
    },

    removePhoto(photoId: number) {
      this.selectedPhotos = this.selectedPhotos.filter(p => p.id !== photoId);
      delete this.photoAdjustments[photoId];
    },

    updatePhotoAdjustment(photoId: number, adjustment: Partial<PhotoAdjustment>) {
      if (this.photoAdjustments[photoId]) {
        this.photoAdjustments[photoId] = { ...this.photoAdjustments[photoId], ...adjustment };
      }
    },

    resetPhotoAdjustment(photoId: number) {
      if (this.photoAdjustments[photoId]) {
        this.photoAdjustments[photoId] = { x: 0, y: 0, scale: 1, rotation: 0 };
      }
    },

    applyAdjustment(photoId: number, adjustment: Partial<PhotoAdjustment>) {
      const oldAdjustment = { ...this.photoAdjustments[photoId] };
      this.updatePhotoAdjustment(photoId, adjustment);
      this.history.push({ photoId, oldAdjustment });
    },

    undo() {
      const lastAction = this.history.pop();
      if (lastAction) {
        this.updatePhotoAdjustment(lastAction.photoId, lastAction.oldAdjustment);
      }
    },

    async loadPhotoUrls() {
      for (const photo of this.selectedPhotos) {
        if (!this.photoUrls[photo.name]) {
          try {
            const response = await fetch(`/api/files/${encodeURIComponent(photo.name)}`)
            if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`)
            
            const blob = await response.blob()
            this.photoUrls[photo.name] = URL.createObjectURL(blob)
          } catch (error) {
            console.error('Error loading photo URL:', error)
            this.photoUrls[photo.name] = '' // Set to empty string or an error placeholder image URL
          }
        }
      }
    },

    clearPhotoUrls() {
      Object.values(this.photoUrls).forEach(url => URL.revokeObjectURL(url))
      this.photoUrls = {}
    },

    setLoading(status: boolean) {
      this.isLoading = status;
    },

    setError(message: string | null) {
      this.error = message;
    },

    saveToLocalStorage() {
      localStorage.setItem('photoEditorState', JSON.stringify({
        selectedTemplate: this.selectedTemplate,
        selectedPhotos: this.selectedPhotos,
        photoAdjustments: this.photoAdjustments,
        nextPhotoId: this.nextPhotoId,
      }));
    },

    loadFromLocalStorage() {
      const savedState = localStorage.getItem('photoEditorState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.selectedTemplate = parsedState.selectedTemplate;
        this.selectedPhotos = parsedState.selectedPhotos;
        this.photoAdjustments = parsedState.photoAdjustments;
        this.nextPhotoId = parsedState.nextPhotoId;
      } else {
        this.resetSession();
      }
    },

    resetSession() {
      this.selectedTemplate = null;
      this.selectedPhotos = [];
      this.photoAdjustments = {};
      this.nextPhotoId = 1;
      localStorage.removeItem('photoEditorState');
    },
  },

  getters: {
    frameImageSrc(): string | null {
      return this.selectedTemplate?.frameSrc || null;
    },
    isProjectComplete(): boolean {
      return this.selectedTemplate !== null && 
             this.selectedPhotos.length === this.selectedTemplate.slots.length;
    },
  },
});