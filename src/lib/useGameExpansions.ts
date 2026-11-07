import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { uploadCover } from './uploadCover'

export type ExpansionLink = { label: string; url: string }

export type GameExpansion = {
  id: string
  name: string
  imagePath: string | null
  sortOrder: number
  links: ExpansionLink[]
  note: string
}

type Row = {
  id: string
  name: string
  image_path: string | null
  sort_order: number
  links: unknown
  note: string | null
}

export const MAX_LINKS = 5
export const MAX_NOTE = 100
const MAX_LABEL = 60
const MAX_URL = 300

// ---------- 連結：解析與防呆（只接受 http／https） ----------

export function isSafeUrl(url: string): boolean {
  return /^https?:\/\/\S+$/i.test(url)
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

// 讀資料庫時一律再過濾一次，不信任資料內容
export function cleanLinks(raw: unknown): ExpansionLink[] {
  if (!Array.isArray(raw)) return []
  const out: ExpansionLink[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const { label, url } = item as { label?: unknown; url?: unknown }
    if (typeof url !== 'string' || !isSafeUrl(url)) continue
    const named = typeof label === 'string' ? label.trim() : ''
    // 沒填名字時資料庫存的是網站名稱，這裡還原成「沒有名字」（空字串）
    const text = named === hostOf(url) ? '' : named
    out.push({ label: text, url })
  }
  return out
}

// 顯示用：有名字秀名字，沒有名字秀網址
export function linkLabel(link: ExpansionLink): string {
  return link.label !== '' ? link.label : link.url
}

// 寫入資料庫用：沒有名字時沿用舊格式（存網站名稱），讀回來會還原成沒有名字
export function toStoredLinks(links: ExpansionLink[]): ExpansionLink[] {
  return links.map((l) => ({ label: l.label !== '' ? l.label : hostOf(l.url), url: l.url }))
}

export function linksToLines(links: ExpansionLink[]): string {
  return links.map((l) => (l.label !== '' ? `${l.label} ${l.url}` : l.url)).join('\n')
}

// 每行：標籤 網址（網址放最後；標籤可省略，省略就直接顯示網址）
export function parseLinkLines(text: string, max: number = MAX_LINKS): {
  links: ExpansionLink[]
  error: string
} {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== '')
  if (lines.length > max) {
    return { links: [], error: `最多 ${max} 個連結。` }
  }
  const links: ExpansionLink[] = []
  for (const line of lines) {
    const m = line.match(/^(.*?)\s*(https?:\/\/\S+)$/i)
    if (!m) {
      return {
        links: [],
        error: `這行找不到網址（要以 https:// 開頭，且網址放在最後）：${line}`,
      }
    }
    const url = m[2]
    const label = m[1].trim()
    if (label.length > MAX_LABEL) {
      return { links: [], error: `標籤最多 ${MAX_LABEL} 字：${label}` }
    }
    if (url.length > MAX_URL) {
      return { links: [], error: `網址最多 ${MAX_URL} 字。` }
    }
    links.push({ label, url })
  }
  return { links, error: '' }
}

// ---------- 給卡片用：哪些遊戲有擴充（全站共用一份，只讀一次） ----------

let expansionSet: Set<string> = new Set()
let setLoaded = false
let setLoading = false
const listeners = new Set<() => void>()

async function loadSet(): Promise<void> {
  const { data, error } = await supabase
    .from('game_expansions')
    .select('bgg_name')
  if (error || !data) return
  expansionSet = new Set((data as { bgg_name: string }[]).map((r) => r.bgg_name))
  setLoaded = true
  listeners.forEach((fn) => fn())
}

export function refreshExpansionSet(): Promise<void> {
  return loadSet()
}

export function useHasExpansion(bggName: string): boolean {
  const [, setTick] = useState(0)

  useEffect(() => {
    const fn = () => setTick((t) => t + 1)
    listeners.add(fn)
    if (!setLoaded && !setLoading) {
      setLoading = true
      void loadSet().finally(() => {
        setLoading = false
      })
    }
    return () => {
      listeners.delete(fn)
    }
  }, [])

  return expansionSet.has(bggName)
}

// ---------- 圖片網址（covers 是公開 bucket） ----------

export function expansionImageUrl(path: string, tick: number): string {
  const { data } = supabase.storage.from('covers').getPublicUrl(path)
  return tick > 0 ? `${data.publicUrl}?v=${tick}` : data.publicUrl
}

// ---------- 單一遊戲的擴充清單與管理 ----------

function toExpansion(row: Row): GameExpansion {
  return {
    id: row.id,
    name: row.name,
    imagePath: row.image_path,
    sortOrder: row.sort_order,
    links: cleanLinks(row.links),
    note: row.note ?? '',
  }
}

function msgOf(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

export function useGameExpansions(bggName: string) {
  const [rows, setRows] = useState<GameExpansion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imgTick, setImgTick] = useState(0)

  const reload = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('game_expansions')
      .select('id, name, image_path, sort_order, links, note')
      .eq('bgg_name', bggName)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (err) {
      setError('擴充資料讀取失敗：' + err.message)
    } else {
      setError('')
      setRows(((data ?? []) as Row[]).map(toExpansion))
    }
    setLoading(false)
  }, [bggName])

  useEffect(() => {
    setLoading(true)
    void reload()
  }, [reload])

  // 回傳空字串＝成功，否則是錯誤訊息
  async function add(
    name: string,
    file: File | null,
    links: ExpansionLink[] = [],
  ): Promise<string> {
    const next = rows.reduce((max, r) => Math.max(max, r.sortOrder), 0) + 1
    const { data, error: err } = await supabase
      .from('game_expansions')
      .insert({
        bgg_name: bggName,
        name,
        sort_order: next,
        links: toStoredLinks(links),
      })
      .select('id')
      .single()
    if (err || !data) return '新增失敗：' + (err?.message ?? '')

    const id = (data as { id: string }).id
    let result = ''
    if (file) {
      try {
        await uploadCover(`expansions/${id}`, file)
        const { error: upErr } = await supabase
          .from('game_expansions')
          .update({ image_path: `expansions/${id}.webp` })
          .eq('id', id)
        if (upErr) throw upErr
      } catch (e) {
        result = '擴充已新增，但圖片上傳失敗：' + msgOf(e)
      }
    }
    setImgTick((t) => t + 1)
    await reload()
    void refreshExpansionSet()
    return result
  }

  async function rename(id: string, name: string): Promise<string> {
    const { error: err } = await supabase
      .from('game_expansions')
      .update({ name })
      .eq('id', id)
    if (err) return '改名失敗：' + err.message
    await reload()
    return ''
  }

  async function updateDetails(
    id: string,
    links: ExpansionLink[],
    note: string,
  ): Promise<string> {
    const { error: err } = await supabase
      .from('game_expansions')
      .update({ links: toStoredLinks(links), note })
      .eq('id', id)
    if (err) return '儲存失敗：' + err.message
    await reload()
    return ''
  }

  async function replaceImage(id: string, file: File): Promise<string> {
    try {
      await uploadCover(`expansions/${id}`, file)
      const { error: err } = await supabase
        .from('game_expansions')
        .update({ image_path: `expansions/${id}.webp` })
        .eq('id', id)
      if (err) throw err
    } catch (e) {
      return '圖片上傳失敗：' + msgOf(e)
    }
    setImgTick((t) => t + 1)
    await reload()
    return ''
  }

  async function remove(id: string): Promise<string> {
    const target = rows.find((r) => r.id === id)
    const { error: err } = await supabase
      .from('game_expansions')
      .delete()
      .eq('id', id)
    if (err) return '刪除失敗：' + err.message
    if (target?.imagePath) {
      // 圖檔刪不掉不影響結果，忽略錯誤
      await supabase.storage.from('covers').remove([target.imagePath])
    }
    await reload()
    void refreshExpansionSet()
    return ''
  }

  return {
    rows,
    loading,
    error,
    imgTick,
    add,
    rename,
    updateDetails,
    replaceImage,
    remove,
  }
}
