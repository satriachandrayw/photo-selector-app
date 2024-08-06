import { defineEventHandler, getQuery } from 'h3'
import path from 'path'
import { promises as fsPromises } from 'fs'
import sharp from 'sharp'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const BASE_DIR = config.baseDir
  const THUMBNAIL_SIZE = config.thumbnailSize

  try {
    const query = getQuery(event)
    const requestedPath = query.path as string || ''

    const fullPath = path.join(BASE_DIR, requestedPath)
    console.log("fullPath", fullPath);
    console.log('Listing directory:', fullPath);

    // Ensure the path is within the allowed directory
    if (!fullPath.startsWith(BASE_DIR)) {
      event.res.statusCode = 403
      return { error: 'Access denied' }
    }

    const stats = await fsPromises.stat(fullPath)
    
    if (stats.isDirectory()) {
      const files = await fsPromises.readdir(fullPath)
      console.log('Files in directory:', files)

      const fileList = await Promise.all(files.map(async (file) => {
        const filePath = path.join(fullPath, file)
        const fileStats = await fsPromises.stat(filePath)
        const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file)
        return {
          name: file,
          path: path.relative(BASE_DIR, filePath),
          type: fileStats.isDirectory() ? 'directory' : 'file',
          size: fileStats.size,
          modifiedDate: fileStats.mtime,
          isImage,
          thumbnailUrl: isImage ? `/api/files?thumbnail=true&path=${encodeURIComponent(path.relative(BASE_DIR, filePath))}` : null
        }
      }))

      console.log('File list:', fileList);

      return {
        files: fileList.filter(item => item !== null),
        currentPath: path.relative(BASE_DIR, fullPath)
      }
    } else if (stats.isFile()) {
      // Handle file serving logic
      if (query.thumbnail) {
        // Thumbnail generation logic
        const imageBuffer = await fsPromises.readFile(fullPath)
        const thumbnail = await sharp(imageBuffer)
          .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: 'inside' })
          .toFormat('jpeg')
          .toBuffer()

        event.res.setHeader('Content-Type', 'image/jpeg')
        return thumbnail
      } else {
        // Serve the full file
        const fileBuffer = await fsPromises.readFile(fullPath)
        event.res.setHeader('Content-Type', `image/${path.extname(fullPath).substring(1)}`)
        return fileBuffer
      }
    }
  } catch (error) {
    console.error('Error in file handler:', error)
    event.res.statusCode = 500
    return { error: 'Internal server error', details: error.message }
  }
})