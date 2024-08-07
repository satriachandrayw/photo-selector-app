import { defineEventHandler, createError } from 'h3'
import fs from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Template ID is required'
    })
  }

  console.log('API: Fetching templates from storage')
  const templates = await useStorage().getItem('templates')

  if (!templates) {
    console.log('API: No templates found in storage')
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve templates'
    })
  }

  console.log(`API: Searching for template with ID: ${id}`)
  const template = templates.find((t: any) => t.id === parseInt(id))

  if (!template) {
    console.log(`API: Template with ID ${id} not found`)
    throw createError({
      statusCode: 404,
      statusMessage: 'Template not found'
    })
  }

  // Read the frame image file
  try {
    const imagePath = path.join(process.cwd(), 'assets', 'templates', template.frameSrc)
    const imageBuffer = await fs.readFile(imagePath)
    const base64Image = imageBuffer.toString('base64')
    
    // Add the image data to the template object
    template.frameImageData = `data:image/png;base64,${base64Image}`
  } catch (error) {
    console.error('Error reading frame image:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to read frame image'
    })
  }

  console.log(`API: Returning template:`, template)
  return template
})