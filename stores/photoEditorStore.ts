import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Photo {
  id: number;
  name: string;
  url: string;
  blobUrl?: string;
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
    selectedTemplate: ref(null as Template | null),
    selectedPhotos: ref([] as Photo[]),
    photoAdjustments: {} as Record<number, PhotoAdjustment>,
    isLoading: false,
    error: null as string | null,
    nextPhotoId: 1,
  }),

  actions: {
    setTemplate(template: Template) {
      this.selectedTemplate = template;
    },

    async addPhoto(photo: Omit<Photo, 'id' | 'blobUrl'>) {
      const newPhoto: Photo = { ...photo, id: this.nextPhotoId, blobUrl: undefined };
      this.selectedPhotos.push(newPhoto);
      this.photoAdjustments[this.nextPhotoId] = { x: 0, y: 0, scale: 1, rotation: 0 };
      this.nextPhotoId++;
      await this.loadPhotoUrl(newPhoto);
    },

    removePhoto(photoId: number) {
      const index = this.selectedPhotos.findIndex(photo => photo.id === photoId);
      if (index !== -1) {
        // Remove the photo from the array
        this.selectedPhotos.splice(index, 1);
        // If the photo had a blobUrl, revoke it to free up memory
        if (this.selectedPhotos[index].blobUrl) {
          URL.revokeObjectURL(this.selectedPhotos[index].blobUrl);
        }
        // Remove the photo adjustment
        delete this.photoAdjustments[photoId];
        // Trigger reactivity
        this.selectedPhotos = [...this.selectedPhotos];
      }
    },

    async loadPhotoUrl(photo: Photo) {
      if (!photo.blobUrl) {
        try {
          this.isLoading = true;
          const response = await fetch(`/api/files/${encodeURIComponent(photo.name)}`);
          if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
          
          // Get the content type from the response headers
          const contentType = response.headers.get('content-type') || 'image/jpeg';
          
          // Create a blob from the response with the correct content type
          const blob = await response.blob();
          const typedBlob = new Blob([blob], { type: contentType });
          
          photo.blobUrl = URL.createObjectURL(typedBlob);
          // Trigger reactivity
          this.selectedPhotos = [...this.selectedPhotos];
        } catch (error) {
          console.error('Error loading photo URL:', error);
          this.error = error.message;
          photo.blobUrl = ''; // Set to empty string or an error placeholder image URL
        } finally {
          this.isLoading = false;
        }
      }
    },

    async loadPhotoUrls() {
      for (const photo of this.selectedPhotos) {
        await this.loadPhotoUrl(photo);
      }
    },

    clearPhotoUrls() {
      this.selectedPhotos.forEach(photo => {
        if (photo.blobUrl) {
          URL.revokeObjectURL(photo.blobUrl);
          photo.blobUrl = undefined;
        }
      });
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
      this.updatePhotoAdjustment(photoId, adjustment);
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
        selectedPhotos: this.selectedPhotos.map(photo => ({
          ...photo,
          blobUrl: undefined // Don't save blob URLs to localStorage
        })),
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
        // Reload blob URLs after loading from localStorage
        this.loadPhotoUrls();
      } else {
        this.resetSession();
      }
    },

    resetSession() {
      this.clearPhotoUrls(); // Clear existing blob URLs
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