// Edge Function：video-title
// 管理者貼 Bilibili 連結時，幫忙查影片標題。只有管理者能用，只查 bilibili.com／b23.tv。
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

function allowedHost(host: string): boolean {
  const h = host.toLowerCase()
  return h === 'b23.tv' || h === 'bilibili.com' || h.endsWith('.bilibili.com')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  // 1) 只有管理者能用
  const supa = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
  )
  const { data: isAdmin, error: adminError } = await supa.rpc('is_admin')
  if (adminError || isAdmin !== true) return json({ error: 'forbidden' }, 403)

  // 2) 檢查網址只能是 Bilibili
  let target = ''
  try {
    const body = await req.json()
    target = typeof body?.url === 'string' ? body.url.trim() : ''
  } catch {
    return json({ error: 'bad request' }, 400)
  }
  let current: URL
  try {
    current = new URL(target)
  } catch {
    return json({ title: '' })
  }

  // 3) 短網址 b23.tv：最多跟 3 次轉址，每一次都檢查網域
  for (let i = 0; i < 3 && current.hostname.toLowerCase() === 'b23.tv'; i++) {
    if (!allowedHost(current.hostname) || current.protocol !== 'https:') return json({ title: '' })
    const res = await fetch(current.toString(), { redirect: 'manual' })
    const location = res.headers.get('location')
    if (!location) break
    try {
      current = new URL(location, current)
    } catch {
      return json({ title: '' })
    }
  }
  if (!allowedHost(current.hostname)) return json({ title: '' })

  // 4) 取 BV 或 av 編號，查標題：先問 Bilibili API，失敗再讀網頁標題
  const bv = current.pathname.match(/BV[0-9A-Za-z]{10}/)?.[0]
  const av = current.pathname.match(/\/av(\d+)/i)?.[1]
  const query = bv ? `bvid=${bv}` : av ? `aid=${av}` : ''
  if (!query) {
    console.log('video-title: 網址裡找不到 BV 或 av 編號', current.toString())
    return json({ title: '', reason: 'no-id' })
  }
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    Referer: 'https://www.bilibili.com/',
    Accept: 'application/json, text/html;q=0.9, */*;q=0.8',
    'Accept-Language': 'zh-TW,zh;q=0.9',
  }

  let reason = ''
  try {
    const res = await fetch(`https://api.bilibili.com/x/web-interface/view?${query}`, { headers })
    const data = await res.json()
    const title = typeof data?.data?.title === 'string' ? data.data.title : ''
    if (title) return json({ title })
    reason = `api http ${res.status} code ${data?.code} ${data?.message ?? ''}`
  } catch (error) {
    reason = 'api error ' + (error instanceof Error ? error.message : String(error))
  }
  console.log('video-title: API 沒拿到標題 →', reason)

  try {
    const page = bv ? `https://www.bilibili.com/video/${bv}/` : `https://www.bilibili.com/video/av${av}/`
    const res = await fetch(page, { headers })
    const html = await res.text()
    const raw =
      html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1] ??
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ??
      ''
    const title = raw
      .replace(/_哔哩哔哩.*$/u, '')
      .replace(/_bilibili.*$/i, '')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim()
    if (title) return json({ title })
    console.log('video-title: 網頁也沒拿到標題，http', res.status)
    return json({ title: '', reason: reason + ' / html http ' + res.status })
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error)
    console.log('video-title: 網頁讀取失敗 →', text)
    return json({ title: '', reason: reason + ' / html error ' + text })
  }
})
