import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export type MyGathering = {
  id: string
  gatheredOn: string // YYYY-MM-DD
  title: string
  note: string | null
  attendeeCount: number
}

// n：暱稱（隱藏者已由資料庫換成「匿名玩家」）；me：是不是自己
// c／h／s／e：只有管理者會有值（LINE／FB 名字、是否隱藏暱稱、來源、免評分）
export type GatheringAttendee = {
  n: string
  me: boolean
  c: string | null
  h: boolean | null
  s: string | null
  e: boolean | null
}

// b：bgg_name；n：中文名（遊戲被刪除時可能是 null）
export type GatheringGame = { b: string; n: string | null }

export type GatheringDetail = {
  attendees: GatheringAttendee[]
  games: GatheringGame[]
}

type ListRow = {
  id: string
  gathered_on: string
  title: string | null
  note: string | null
  attendee_count: number | string | null
}

const EMPTY_ROWS: MyGathering[] = []

// 一般玩家：自己出席過的場次；管理者：全部場次
export function useMyGatherings() {
  const [state, setState] = useState<{
    rows: MyGathering[]
    error: boolean
  } | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    supabase.rpc('get_my_gatherings').then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('讀取我的場次失敗：', error)
        setState({ rows: [], error: true })
        return
      }
      const rows = ((data ?? []) as ListRow[]).map((row) => ({
        id: row.id,
        gatheredOn: row.gathered_on,
        title: row.title?.trim() || '聚會',
        note: row.note?.trim() ? row.note : null,
        attendeeCount: Number(row.attendee_count ?? 0),
      }))
      setState({ rows, error: false })
    })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const reload = useCallback(() => {
    setState(null)
    setReloadKey((key) => key + 1)
  }, [])

  return {
    loading: state === null,
    error: state?.error ?? false,
    rows: state?.rows ?? EMPTY_ROWS,
    reload,
  }
}

// 單一場次的出席者與當天指定遊戲；不是出席者（也不是管理者）會得到 null
export function useGatheringDetail(id: string | null) {
  const [state, setState] = useState<{
    id: string
    detail: GatheringDetail | null
    error: boolean
  } | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    supabase
      .rpc('get_gathering_detail', { p_gathering: id })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('讀取場次詳情失敗：', error)
          setState({ id, detail: null, error: true })
          return
        }
        const detail = data as GatheringDetail | null
        setState({
          id,
          detail: detail
            ? {
                attendees: detail.attendees ?? [],
                games: detail.games ?? [],
              }
            : null,
          error: false,
        })
      })
    return () => {
      cancelled = true
    }
  }, [id, reloadKey])

  const reload = useCallback(() => {
    setState(null)
    setReloadKey((key) => key + 1)
  }, [])

  // 切換場次時，舊場次的結果不會被當成新場次的
  const current = id !== null && state && state.id === id ? state : null

  return {
    loading: id !== null && current === null,
    error: current?.error ?? false,
    detail: current?.detail ?? null,
    reload,
  }
}
