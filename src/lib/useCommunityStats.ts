import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export type CommunityStats = {
  wantCount: number
  playedCount: number
  wantMonth: number
  wantQuarter: number
  wantYear: number
  playedMonth: number
  playedQuarter: number
  playedYear: number
}

const EMPTY: CommunityStats = {
  wantCount: 0,
  playedCount: 0,
  wantMonth: 0,
  wantQuarter: 0,
  wantYear: 0,
  playedMonth: 0,
  playedQuarter: 0,
  playedYear: 0,
}

type Row = Record<string, unknown>

function n(value: unknown): number {
  const result = Number(value)
  return Number.isFinite(result) ? result : 0
}

// 在 Library 呼叫一次；訪客也讀得到（只有彙總人數）
export function useCommunityStats(enabled = true) {
  const [stats, setStats] = useState<Record<string, CommunityStats>>({})
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    supabase.rpc('get_community_stats').then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('讀取社群統計失敗：', error)
        return
      }
      const map: Record<string, CommunityStats> = {}
      for (const row of (data ?? []) as Row[]) {
        map[String(row.bgg_name)] = {
          wantCount: n(row.want_count),
          playedCount: n(row.played_count),
          wantMonth: n(row.want_month),
          wantQuarter: n(row.want_quarter),
          wantYear: n(row.want_year),
          playedMonth: n(row.played_month),
          playedQuarter: n(row.played_quarter),
          playedYear: n(row.played_year),
        }
      }
      setStats(map)
    })

    return () => {
      cancelled = true
    }
  }, [enabled, reloadKey])

  const getStats = useCallback(
    (bggName: string): CommunityStats => stats[bggName] ?? EMPTY,
    [stats],
  )

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { getStats, reload }
}

export type CommunityStatsApi = ReturnType<typeof useCommunityStats>