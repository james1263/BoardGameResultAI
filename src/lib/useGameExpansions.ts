import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { uploadCover } from './uploadCover'

export type GameExpansion = {
  id: string
  name: string
  imagePath: string | null
  sortOrder: number
}

type Row = {
  id: string
  name: string
  image_path: string | null
  sort_order: number
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
      .select('id, name, image_path, sort_order')
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
  async function add(name: string, file: File | null): Promise<string> {
    const next = rows.reduce((max, r) => Math.max(max, r.sortOrder), 0) + 1
    const { data, error: err } = await supabase
      .from('game_expansions')
      .insert({ bgg_name: bggName, name, sort_order: next })
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

  return { rows, loading, error, imgTick, add, rename, replaceImage, remove }
}
