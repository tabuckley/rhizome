// Uploads recorded clips to a Supabase Storage bucket and records each one in a table.
// Fill these in from Supabase dashboard > Project Settings > API (see README "Video uploads").
import {getLocation} from './location'

const SUPABASE_URL = 'https://YOUR-PROJECT-ID.supabase.co'
const SUPABASE_KEY = 'YOUR-ANON-OR-PUBLISHABLE-KEY'
const BUCKET = 'potato-videos'
const TABLE = 'potato_videos'

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
}

const slugify = (text: string) => text
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 40)

const uploadVideo = async (blob: Blob, label: string) => {
  const extension = blob.type.includes('mp4') ? 'mp4' : 'webm'
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const random = Math.random().toString(36).slice(2, 8)
  const name = slugify(label) || 'anonymous'
  const path = `${timestamp}_${name}_${random}.${extension}`

  const videoResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {...HEADERS, 'Content-Type': blob.type, 'x-upsert': 'false'},
    body: blob,
  })

  if (!videoResponse.ok) {
    throw new Error(`Upload failed (${videoResponse.status}): ${await videoResponse.text()}`)
  }

  // The video is already saved at this point, so a failure here is logged rather than shown
  const location = getLocation()
  try {
    const rowResponse = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: {...HEADERS, 'Content-Type': 'application/json', 'Prefer': 'return=minimal'},
      body: JSON.stringify({
        name: label.trim().slice(0, 40) || null,
        video_path: path,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
      }),
    })
    if (!rowResponse.ok) {
      console.error(`Saving details failed (${rowResponse.status}):`, await rowResponse.text())
    }
  } catch (err) {
    console.error('Saving details failed', err)
  }
}

export {
  uploadVideo,
}
