import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export const ERRATA_MAX_TITLE = 60
export const ERRATA_MAX_CONTENT = 1200
export const ERRATA_MAX_SOURCE = 100

export type Errata = {
  id: string
  title: string
  content: string
  source_note: string
  updated_at: string
}

// 讀取某款遊戲的玩錯紀錄（VIP／管理者）
export function useGameErrata(bggName: string, enabled: boolean) {
  const [items, setItems] = useState<Errata[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!enabled || !bggName) {
      setItems([])
      setError('')
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .rpc('get_game_errata', { p_bgg_name: bggName })
      .then(({ data, error: rpcError }) => {
        if (cancelled) return
        setLoading(false)
        if (rpcError) {
          setError('讀取玩錯紀錄失敗')
          setItems([])
          return
        }
        setError('')
        setItems((data ?? []) as Errata[])
      })
    return () => {
      cancelled = true
    }
  }, [bggName, enabled, tick])

  const reload = useCallback(() => setTick((n) => n + 1), [])
  return { items, loading, error, reload }
}

// 規則助手：搜尋玩錯紀錄（不扣每日次數，失敗就當作沒有）
export async function searchErrata(
  bggName: string,
  query: string,
): Promise<{ items: Errata[]; error: string }> {
  const { data, error } = await supabase.rpc('search_game_errata', {
    p_bgg_name: bggName,
    p_query: query,
  })
  if (error) return { items: [], error: '搜尋玩錯紀錄失敗' }
  return { items: (data ?? []) as Errata[], error: '' }
}

// 管理者：新增或修改（id 為 null＝新增）。成功回傳空字串，失敗回傳說明
export async function saveErrata(input: {
  id: string | null
  bggName: string
  title: string
  content: string
  sourceNote: string
}): Promise<string> {
  const { error } = await supabase.rpc('admin_save_game_errata', {
    p_id: input.id,
    p_bgg_name: input.bggName,
    p_title: input.title,
    p_content: input.content,
    p_source: input.sourceNote,
  })
  if (!error) return ''
  const text = error.message ?? ''
  if (text.includes('too long')) return '標題、內容或來源說明太長。'
  if (text.includes('empty')) return '請填寫遊戲、標題與內容。'
  if (text.includes('not found')) return '找不到這筆紀錄，可能已被刪除。'
  if (text.includes('not admin')) return '只有管理者可以儲存。'
  return '儲存失敗：' + text
}

export async function deleteErrata(id: string): Promise<string> {
  const { error } = await supabase.rpc('admin_delete_game_errata', {
    p_id: id,
  })
  if (!error) return ''
  return '刪除失敗：' + (error.message ?? '')
}
