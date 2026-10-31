import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

// 每款遊戲有幾位 VIP 玩家評過分（只有彙總人數，沒有任何人的資料）
// 管理者的 CSV 評分不在這裡，由前端另外加 1
type Row = Record<string, unknown>

export function useRatingCounts(enabled: boolean) {
  const [map, setMap] = useState<Record<string, number>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setStatus('loading')
    supabase.rpc('get_rating_counts').then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('讀取評分人數失敗：', error)
        setStatus('error')
        return
      }
      const next: Record<string, number> = {}
      for (const row of (data ?? []) as Row[]) {
        const count = Number(row.rating_count)
        next[String(row.bgg_name)] = Number.isFinite(count) ? count : 0
      }
      setMap(next)
      setStatus('ready')
    })
    return () => {
      cancelled = true
    }
  }, [enabled])

  const get = useCallback((bggName: string): number => map[bggName] ?? 0, [map])

  return { get, status }
}
