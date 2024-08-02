import { defineEventHandler } from 'h3'
import { promises as fsPromises } from 'fs'
import path from 'path'
import { createReadStream } from 'fs'
import sharp from 'sharp'

const BASE_DIR = '/home/satria/Downloads' // Set this to the directory you want to allow access to
const THUMBNAIL_SIZE = 100 // Size of the thumbnail in pixels

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const relativePath = (query.path as string || '/').replace(/^\/+/, '')
  const fullPath = path.join(BASE_DIR, relativePath)

  console.log('BASE_DIR:', BASE_DIR)
  console.log('relativePath:', relativePath)
  console.log('fullPath:', fullPath)

  // Ensure the path is within the allowed directory
  if (!fullPath.startsWith(BASE_DIR)) {
    event.res.statusCode = 403
    return { error: 'Access denied' }
  }

  if (query.thumbnail) {
    // Handle thumbnail request
    try {
      const imagePath = path.join(BASE_DIR, query.thumbnail as string)
      console.log('Attempting to generate thumbnail for:', imagePath)
      
      // Check if file exists
      if (!await fsPromises.access(imagePath).then(() => true).catch(() => false)) {
        throw new Error(`File does not exist: ${imagePath}`)
      }

      const stats = await fsPromises.stat(imagePath)
      console.log('File stats:', stats)
      const readStream = createReadStream(imagePath)
      console.log('Created read stream for:', imagePath)

      const imageBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        readStream.on('data', (chunk) => chunks.push(chunk));
        readStream.on('end', () => resolve(Buffer.concat(chunks)));
        readStream.on('error', reject);
      });

      const buffer = await sharp(imageBuffer)
        .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: 'cover' })
        .toFormat('jpeg')
        .toBuffer()

      console.log('Thumbnail generated successfully')
      event.res.setHeader('Content-Type', 'image/jpeg')
      event.res.end(buffer)
      return
    } catch (error) {
      console.error('Error generating thumbnail:', error)
      event.res.statusCode = 500
      return { error: 'Error generating thumbnail', details: error.message }
    }
  }

  try {
    const stats = await fsPromises.stat(fullPath)
    
    if (stats.isDirectory()) {
      const files = await fsPromises.readdir(fullPath)
      const fileList = await Promise.all(files.map(async (file) => {
        const filePath = path.join(fullPath, file)
        const fileStats = await fsPromises.stat(filePath)
        const isImage = file.match(/\.(jpg|jpeg|png|gif)$/i)
        if (fileStats.isDirectory() || isImage) {
          return {
            name: file,
            type: fileStats.isDirectory() ? 'directory' : 'file',
            size: fileStats.size,
            modifiedDate: fileStats.mtime,
            isImage: isImage ? true : false,
            thumbnailUrl: isImage ? `/api/files?thumbnail=${encodeURIComponent(path.relative(BASE_DIR, filePath))}` : null
          }
        }
        return null
      }))
      return fileList.filter(item => item !== null)
    } else if (stats.isFile()) {
      // If it's a file, serve it
      const fileStream = createReadStream(fullPath)
      event.res.setHeader('Content-Type', `image/${path.extname(fullPath).substring(1)}`)
      
      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        fileStream.on('data', (chunk) => chunks.push(chunk));
        fileStream.on('end', () => {
          const buffer = Buffer.concat(chunks);
          event.res.end(buffer);
          resolve(buffer);
        });
        fileStream.on('error', reject);
      });
    }
  } catch (error) {
    console.error('Error accessing file system:', error)
    event.res.statusCode = 500
    return { error: 'Error accessing file system' }
  }
})