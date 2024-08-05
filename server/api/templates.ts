import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  console.log('API: Fetching templates from storage')
  const templates = await useStorage().getItem('templates')
  console.log('API: Retrieved templates:', JSON.stringify(templates, null, 2))
  if (!templates) {
    throw createError({
      statusCode: 500,
      message: 'Templates not available',
    })
  }
  return templates
})