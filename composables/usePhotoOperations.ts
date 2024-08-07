import { usePhotoEditorStore } from '~/stores/photoEditorStore'

export function usePhotoOperations() {
  const photoEditorStore = usePhotoEditorStore()

  const rotatePhoto = (photoId: string, angle: number) => {
    photoEditorStore.applyAdjustment(photoId, {
      rotation: (photoEditorStore.photoAdjustments[photoId].rotation + angle) % 360
    })
  }

  const zoomPhoto = (photoId: string, factor: number) => {
    photoEditorStore.applyAdjustment(photoId, {
      scale: Math.max(0.1, photoEditorStore.photoAdjustments[photoId].scale * factor)
    })
  }

  const movePhoto = (photoId: string, dx: number, dy: number) => {
    const currentAdjustment = photoEditorStore.photoAdjustments[photoId]
    photoEditorStore.applyAdjustment(photoId, {
      x: currentAdjustment.x + dx,
      y: currentAdjustment.y + dy
    })
  }

  return {
    rotatePhoto,
    zoomPhoto,
    movePhoto
  }
}
