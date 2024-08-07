import { defineNitroPlugin } from 'nitropack/runtime/plugin'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

const cacheDir = path.join(process.cwd(), '.cache')
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir)
}

async function analyzeFrame(framePath: string) {
  const fullPath = path.join(process.cwd(), 'public', framePath)

  try {
    const image = sharp(fullPath)
    const metadata = await image.metadata()
    const { data, info } = await extractAlphaChannel(image)
    const slots = detectSlots(data, info.width, info.height)

    await generateDebugImage(data, slots, info.width, info.height, framePath)

    return {
      photoSlots: slots.length,
      slots: slots,
      width: info.width,
      height: info.height
    }
  } catch (error) {
    throw error
  }
}

async function extractAlphaChannel(image) {
  return await image
    .extractChannel('alpha')
    .raw()
    .toBuffer({ resolveWithObject: true })
}

function detectSlots(data, width, height) {
  const alphaThreshold = 10
  const slots = []
  const visited = new Uint8Array(width * height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (data[idx] < alphaThreshold && !visited[idx]) {
        const slot = floodFill(data, visited, width, height, x, y, alphaThreshold)
        if (slot.width > 20 && slot.height > 20) {
          slots.push(slot)
        }
      }
    }
  }

  slots.sort((a, b) => {
    if (Math.abs(a.y - b.y) < 10) {
      return a.x - b.x
    }
    return a.y - b.y
  })

  return slots
}

async function generateDebugImage(data, slots, width, height, framePath) {
  const debugImage = sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 255 }
    }
  })
  .composite([
    { input: Buffer.from(data), raw: { width, height, channels: 1 } },
    ...slots.map((slot, index) => ({
      input: {
        create: {
          width: slot.width,
          height: slot.height,
          channels: 4,
          background: { r: 255, g: 0, b: 0, alpha: 128 }
        }
      },
      top: slot.y,
      left: slot.x
    }))
  ])
  .png()

  await debugImage.toFile(path.join(cacheDir, `debug_${path.basename(framePath)}`))
}

function floodFill(data: Uint8Array, visited: Uint8Array, width: number, height: number, startX: number, startY: number, threshold: number) {
  const stack = [{x: startX, y: startY}]
  let minX = startX, maxX = startX, minY = startY, maxY = startY

  while (stack.length > 0) {
    const {x, y} = stack.pop()!
    const idx = y * width + x
    if (visited[idx]) continue
    visited[idx] = 1

    if (data[idx] >= threshold) continue

    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y) 

    if (x > 0) stack.push({x: x-1, y})
    if (x < width-1) stack.push({x: x+1, y})
    if (y > 0) stack.push({x, y: y-1})
    if (y < height-1) stack.push({x, y: y+1})
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  }
}

interface Template {
  id: number;
  name: string;
  frameSrc: string;
  photoSlots?: number;
  slots?: Array<{ x: number; y: number; width: number; height: number }>;
  width?: number;
  height?: number;
}

const templates: Template[] = [
  {
    id: 1,
    name: 'Pop and Go Frame',
    frameSrc: '/assets/frames/1.png',
  },
  {
    id: 2,
    name: 'Classic Frame',
    frameSrc: '/assets/frames/2.png',
  },
  {
    id: 3,
    name: 'Red Quad Frame',
    frameSrc: '/assets/frames/3.png',
  },
  {
    id: 4,
    name: 'Red Dual Frame',
    frameSrc: '/assets/frames/4.png',
  }
];

export default defineNitroPlugin(async (nitroApp) => {
  for (const template of templates) {
    try {
      const result = await analyzeFrame(template.frameSrc)
      template.photoSlots = result.photoSlots
      template.slots = result.slots
      template.width = result.width
      template.height = result.height
    } catch (error) {
      console.error(`Error analyzing frame for template ${template.id}:`, error)
      template.photoSlots = 0
      template.slots = []
      template.width = 0
      template.height = 0
    }
  }

  await useStorage().setItem('templates', templates)
})