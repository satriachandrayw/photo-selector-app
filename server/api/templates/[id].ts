import { defineEventHandler, createError } from 'h3'

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

  console.log(`API: Returning template:`, template)
  return template
})