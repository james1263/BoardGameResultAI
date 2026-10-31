import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

// 每款遊戲的遊玩次數（只統計 VIP 與管理者；只有彙總，沒有任何人的資料）
// total＝沒有日期的歷史次數＋有日期的紀錄；month／quarter／year 只算有日期的紀錄
export type PlayTotals = { total: number; month: number; quarter: number; year: number }

const EMPTY: PlayTotals = { total: 0, month: 0, quarter: 0, year: 0 }

type Row = Record<string, unknown>

function n(value: unknown): number {
  const result = Number(value)
  return Number.isFinite(result) ? result : 0
}

export function usePlayTotals(enabled: boolean) {
  const [map, setMap] = useState<Record<string, PlayTotals>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setStatus('loading')
    supabase.rpc('get_play_totals').then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('讀取遊玩次數失敗：', error)
        setStatus('error')
        return
      }
      const next: Record<string, PlayTotals> = {}
      for (const row of (data ?? []) as Row[]) {
        next[String(row.bgg_name)] = {
          total: n(row.play_total),
          month: n(row.play_month),
          quarter: n(row.play_quarter),
          year: n(row.play_year),
        }
      }
      setMap(next)
      setStatus('ready')
    })
    return () => {
      cancelled = true
    }
  }, [enabled])

  const get = useCallback((bggName: string): PlayTotals => map[bggName] ?? EMPTY, [map])

  return { get, status }
}
