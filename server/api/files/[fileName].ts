import { defineEventHandler } from 'h3'
import path from 'path'
import { promises as fsPromises } from 'fs'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const BASE_DIR = config.baseDir

  const fileName = event.context.params?.fileName

  if (!fileName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File name is required'
    })
  }

  try {
    const filePath = await searchFile(BASE_DIR, fileName);
    
    if (filePath) {
      // Get the file extension
      const ext = path.extname(filePath).toLowerCase();
      
      // Set the appropriate Content-Type
      let contentType = 'image/jpeg'; // default to JPEG
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';
      
      event.node.res.setHeader('Content-Type', contentType);
      event.node.res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      
      // Read the file and send it as a buffer
      const fileBuffer = await fsPromises.readFile(filePath);
      console.log('File size:', fileBuffer.length, 'bytes');
      
      return fileBuffer;
    } else {
      console.log('File not found');
      throw createError({
        statusCode: 404,
        statusMessage: 'File not found'
      });
    }
  } catch (error) {
    console.error('Error processing file:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
})

async function searchFile(dir: string, fileName: string): Promise<string | null> {
  console.log('Searching in directory:', dir);
  const files = await fsPromises.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      const found = await searchFile(path.join(dir, file.name), fileName);
      if (found) return found;
    } else if (file.name === fileName) {
      console.log('File found:', path.join(dir, file.name));
      return path.join(dir, file.name);
    }
  }
  return null;
}