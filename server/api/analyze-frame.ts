import { defineEventHandler } from 'h3'
import path from 'path'
import fs from 'fs'

const cacheDir = path.join(process.cwd(), '.cache')

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const framePath = query.framePath as string

  if (!framePath) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Frame path is required',
    })
  }

  const cacheFile = path.join(cacheDir, `${path.basename(framePath)}.json`)

  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
  }

  throw createError({
    statusCode: 404,
    statusMessage: 'Frame analysis not found',
  })
})