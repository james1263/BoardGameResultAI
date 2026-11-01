import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'
import { useSession } from './useSession'

export type PlaySession = {
  id: string
  bggName: string
  playedOn: string // YYYY-MM-DD
  playerCount: number | null
  note: string
  // 來源：'manual'＝自己記的；其他（'rating'、'admin_gathering'、'admin_backfill'）都是系統自動記的
  source: string
}

export type PlaySummary = {
  count: number
  lastPlayedOn: string | null
}

type SessionRow = {
  id: string
  bgg_name: string
  played_on: string
  player_count: number | null
  note: string
  source?: string | null
}

export type SessionsStatus = 'guest' | 'loading' | 'ready' | 'error'

// 別的地方（例如評分後自動記了一次已玩）通知這裡重新讀取
export const SESSIONS_CHANGED_EVENT = 'boardgame-sessions-changed'
export const PLAYED_SYNC_EVENT = 'boardgame-played-sync'

// 系統自動記了已玩（評分得點、管理者建立聚會）：通知遊玩紀錄重讀，也讓畫面上的「已玩」打勾同步
export function announcePlayed(games: string[]) {
  window.dispatchEvent(new Event(SESSIONS_CHANGED_EVENT))
  window.dispatchEvent(new CustomEvent(PLAYED_SYNC_EVENT, { detail: { games } }))
}

const TABLE = 'game_play_sessions'
// 用 * 讀：資料庫有 source 欄位就帶出來，沒有也不會壞
const COLUMNS = '*'
const EMPTY_LIST: PlaySession[] = []
const EMPTY_SUMMARY: PlaySummary = { count: 0, lastPlayedOn: null }

// 用使用者本機的日期（台灣早上不會被算成前一天）
export function todayLocal(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function rowToSession(row: SessionRow): PlaySession {
  return {
    id: row.id,
    bggName: row.bgg_name,
    playedOn: row.played_on,
    playerCount: row.player_count,
    note: row.note,
    source: row.source ?? 'manual',
  }
}

// 登入後一次讀取「全部遊戲」的遊玩紀錄，在 Library 呼叫一次、各處共用
export function useGamePlaySessions() {
  const session = useSession()
  const userId = session?.user?.id ?? null
  const [sessions, setSessions] = useState<PlaySession[]>([])
  const [status, setStatus] = useState<SessionsStatus>('guest')
  const [reloadKey, setReloadKey] = useState(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setSessions([])
    if (!userId) {
      setStatus('guest')
      return
    }

    let cancelled = false
    setStatus('loading')

    supabase
      .from(TABLE)
      .select(COLUMNS)
      .eq('user_id', userId)
      .order('played_on', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setStatus('error')
          return
        }
        setSessions(((data ?? []) as SessionRow[]).map(rowToSession))
        setStatus('ready')
      })

    return () => {
      cancelled = true
    }
  }, [userId, reloadKey])

  useEffect(() => {
    const handler = () => setReloadKey((current) => current + 1)
    window.addEventListener(SESSIONS_CHANGED_EVENT, handler)
    return () => window.removeEventListener(SESSIONS_CHANGED_EVENT, handler)
  }, [])

  // 依遊戲分組（每組已是「最新在前」）
  const byGame = useMemo(() => {
    const map = new Map<string, PlaySession[]>()
    for (const item of sessions) {
      const list = map.get(item.bggName)
      if (list) list.push(item)
      else map.set(item.bggName, [item])
    }
    return map
  }, [sessions])

  const getSessions = useCallback(
    (bggName: string): PlaySession[] => byGame.get(bggName) ?? EMPTY_LIST,
    [byGame],
  )

  const getSummary = useCallback(
    (bggName: string): PlaySummary => {
      const list = byGame.get(bggName)
      if (!list || list.length === 0) return EMPTY_SUMMARY
      return { count: list.length, lastPlayedOn: list[0].playedOn }
    },
    [byGame],
  )

  const addSession = useCallback(
    async (
      bggName: string,
      input: { playedOn: string; playerCount: number | null; note: string },
    ): Promise<boolean> => {
      if (!userId || status !== 'ready') return false
      setBusy(true)
      const { data, error } = await supabase
        .from(TABLE)
        .insert({
          user_id: userId,
          bgg_name: bggName,
          played_on: input.playedOn,
          player_count: input.playerCount,
          note: input.note.slice(0, 200),
        })
        .select(COLUMNS)
        .single()
      setBusy(false)

      if (error || !data) {
        window.alert('儲存失敗：' + (error?.message ?? '請稍後再試。'))
        return false
      }

      const created = rowToSession(data as SessionRow)
      setSessions((current) =>
        [created, ...current].sort((a, b) =>
          b.playedOn.localeCompare(a.playedOn),
        ),
      )
      return true
    },
    [userId, status],
  )

  const deleteSession = useCallback(
    async (id: string): Promise<boolean> => {
      if (!userId) return false
      setBusy(true)
      const { data, error } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select('id')
      setBusy(false)

      if (error || !data || data.length === 0) {
        window.alert('刪除失敗：' + (error?.message ?? '找不到這筆紀錄。'))
        return false
      }

      setSessions((current) => current.filter((item) => item.id !== id))
      return true
    },
    [userId],
  )

  const reload = useCallback(() => setReloadKey((current) => current + 1), [])

  return {
    status,
    busy,
    getSessions,
    getSummary,
    addSession,
    deleteSession,
    reload,
  }
}

export type PlaySessionsApi = ReturnType<typeof useGamePlaySessions>