import { supabase } from './supabase'
import { TERM_BUCKET } from '../data/component/termRegistry'

// 私有 bucket 的圖片用「簽名網址」顯示（有效 1 小時）。同一張圖只要一次，過期前沿用。
const TTL_SECONDS = 3600
const cache = new Map<string, { url: string; expires: number }>()

export async function getTermImageUrl(path: string): Promise<string | null> {
  const hit = cache.get(path)
  if (hit && hit.expires > Date.now() + 60_000) return hit.url
  const { data, error } = await supabase.storage
    .from(TERM_BUCKET)
    .createSignedUrl(path, TTL_SECONDS)
  if (error || !data?.signedUrl) return null
  cache.set(path, { url: data.signedUrl, expires: Date.now() + TTL_SECONDS * 1000 })
  return data.signedUrl
}
