import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useSession } from './useSession'

export type PlaySession = {
  id: string
  playedOn: string // YYYY-MM-DD
  playerCount: number | null
  note: string
}

type SessionRow = {
  id: string
  played_on: string
  player_count: number | null
  note: string
}

export type SessionsStatus = 'guest' | 'loading' | 'ready' | 'error'

const TABLE = 'game_play_sessions'
const COLUMNS = 'id, played_on, player_count, note'

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
    playedOn: row.played_on,
    playerCount: row.player_count,
    note: row.note,
  }
}

export function useGamePlaySessions(bggName: string) {
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
      .eq('bgg_name', bggName)
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
  }, [userId, bggName, reloadKey])

  const addSession = useCallback(
    async (input: {
      playedOn: string
      playerCount: number | null
      note: string
    }): Promise<boolean> => {
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
    [userId, bggName, status],
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

  return { sessions, status, busy, addSession, deleteSession, reload }
}

export type PlaySessionsApi = ReturnType<typeof useGamePlaySessions>