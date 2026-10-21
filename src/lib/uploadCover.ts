import { supabase } from './supabase'

const MAX_WIDTH = 600
const QUALITY = 0.85

async function compressToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_WIDTH / bitmap.width)
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) throw new Error('瀏覽器不支援圖片處理。')

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('圖片轉換失敗。')),
      'image/webp',
      QUALITY,
    )
  })
}

export async function uploadCover(slug: string, file: File): Promise<void> {
  if (!file.type.startsWith('image/')) {
    throw new Error('請選擇圖片檔案（jpg、png、webp 都可以）。')
  }

  const blob = await compressToWebp(file)

  const { error } = await supabase.storage
    .from('covers')
    .upload(`${slug}.webp`, blob, {
      upsert: true,
      contentType: 'image/webp',
      cacheControl: '60',
    })

  if (error) throw new Error('上傳失敗：' + error.message)
}