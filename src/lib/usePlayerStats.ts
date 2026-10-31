import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// 玩家榜用：每位玩家的已玩款數、評過款數、每款遊戲的評分（VIP 與管理者可讀）
// 只有管理者拿得到 LINE／FB 名字；選了「隱藏暱稱」的玩家只有管理者看得到
export type PlayerRating = {
  g: string // bgg_name
  o: number | null // 整體分數（1～10）
  k: number | null // 適合留下來（1～5）
  s: number | null // 六項加總（不含整體；六項沒填完整就是 null）
}

export type PlayerStat = {
  nickname: string
  contact: string | null
  isAdminAccount: boolean
  played: number
  rated: number
  ratings: PlayerRating[]
}

type Row = Record<string, unknown>

function num(value: unknown): number | null {
  if (value == null) return null
  const result = Number(value)
  return Number.isFinite(result) ? result : null
}

export function usePlayerStats(enabled: boolean) {
  const [players, setPlayers] = useState<PlayerStat[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setStatus('loading')
    supabase.rpc('get_player_stats').then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('讀取玩家榜失敗：', error)
        setStatus('error')
        return
      }
      const next: PlayerStat[] = ((data ?? []) as Row[]).map((row) => ({
        nickname: String(row.nickname ?? '').trim() || '（未設暱稱）',
        contact: row.contact_name ? String(row.contact_name) : null,
        isAdminAccount: row.admin_account === true,
        played: num(row.played_count) ?? 0,
        rated: num(row.rated_count) ?? 0,
        ratings: ((Array.isArray(row.ratings) ? row.ratings : []) as Row[]).map((r) => ({
          g: String(r.g),
          o: num(r.o),
          k: num(r.k),
          s: num(r.s),
        })),
      }))
      setPlayers(next)
      setStatus('ready')
    })
    return () => {
      cancelled = true
    }
  }, [enabled])

  return { players, status }
}
