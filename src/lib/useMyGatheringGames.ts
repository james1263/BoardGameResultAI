import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

type Row = { gathering_id: string; bgg_name: string }

const EMPTY = new Map<string, string[]>()

// 我出席的每場聚會，各有哪些指定遊戲（已移除的不含；管理者是全部場次）
export function useMyGatheringGames() {
  const [state, setState] = useState<{ map: Map<string, string[]>; error: boolean } | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    supabase.rpc('get_my_gathering_games').then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('讀取聚會指定遊戲失敗：', error)
        setState({ map: EMPTY, error: true })
        return
      }
      const map = new Map<string, string[]>()
      for (const row of (data ?? []) as Row[]) {
        const list = map.get(row.gathering_id)
        if (list) list.push(row.bgg_name)
        else map.set(row.gathering_id, [row.bgg_name])
      }
      setState({ map, error: false })
    })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])
  return {
    loading: state === null,
    error: state?.error ?? false,
    games: state?.map ?? EMPTY,
    reload,
  }
}
