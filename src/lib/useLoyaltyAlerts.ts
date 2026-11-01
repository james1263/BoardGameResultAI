import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'

// 集點卡紅點用：①管理者新把我加進的聚會 ②管理者移除了我出席的聚會裡的指定遊戲。
// 已看過的記在這個瀏覽器（key 含帳號）。第一次使用時，目前所有聚會一次標成已看過，避免一開始滿天紅點。
const ATTENDED_KEY = 'boardgame-seen-attended:'
const CHANGES_KEY = 'boardgame-seen-changes:'
const RECENT_DAYS = 7

export type GameChange = {
  gatheringId: string
  gatheredOn: string
  title: string
  bggName: string
  removedAt: string
}

type AttendedRow = { id: string; gathered_on: string }
type ChangeRow = {
  gathering_id: string
  gathered_on: string
  title: string | null
  bgg_name: string
  removed_at: string
}

function loadSet(key: string): Set<string> | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    const list: unknown = JSON.parse(raw)
    return new Set(
      Array.isArray(list)
        ? list.filter((item): item is string => typeof item === 'string')
        : [],
    )
  } catch {
    return null
  }
}

function saveSet(key: string, values: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(values)))
  } catch {
    // 存不了就算了
  }
}

function changeKey(change: GameChange): string {
  return `${change.gatheringId}|${change.bggName}|${change.removedAt}`
}

function daysAgo(count: number): string {
  const date = new Date()
  date.setDate(date.getDate() - count)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

async function fetchAlerts(): Promise<{
  attended: AttendedRow[]
  changes: GameChange[]
} | null> {
  const [g, c] = await Promise.all([
    supabase.rpc('get_my_gatherings'),
    supabase.rpc('get_my_game_changes'),
  ])
  if (g.error && c.error) return null
  return {
    attended: g.error ? [] : ((g.data ?? []) as AttendedRow[]),
    changes: c.error
      ? []
      : ((c.data ?? []) as ChangeRow[]).map((row) => ({
          gatheringId: row.gathering_id,
          gatheredOn: row.gathered_on,
          title: row.title ?? '',
          bggName: row.bgg_name,
          removedAt: row.removed_at,
        })),
  }
}

export function useLoyaltyAlerts(userId: string | null, enabled: boolean) {
  const [attended, setAttended] = useState<AttendedRow[]>([])
  const [changes, setChanges] = useState<GameChange[]>([])
  const [seenVersion, setSeenVersion] = useState(0)

  const apply = useCallback(
    (data: { attended: AttendedRow[]; changes: GameChange[] }) => {
      setAttended(data.attended)
      setChanges(data.changes)
      if (!userId) return
      // 第一次使用：現有的聚會全部當成已看過
      if (loadSet(ATTENDED_KEY + userId) === null) {
        saveSet(ATTENDED_KEY + userId, new Set(data.attended.map((row) => row.id)))
        setSeenVersion((value) => value + 1)
      }
      if (loadSet(CHANGES_KEY + userId) === null) {
        saveSet(CHANGES_KEY + userId, new Set(data.changes.map(changeKey)))
        setSeenVersion((value) => value + 1)
      }
    },
    [userId],
  )

  useEffect(() => {
    if (!enabled || !userId) return
    let cancelled = false
    function load() {
      void fetchAlerts().then((data) => {
        if (!cancelled && data) apply(data)
      })
    }
    load()
    // 切回網站分頁時再讀一次，才看得到管理者剛做的調整
    function handleVisible() {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', handleVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisible)
    }
  }, [enabled, userId, apply])

  const recentChanges = useMemo(() => {
    const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000
    return changes.filter((change) => new Date(change.removedAt).getTime() >= cutoff)
  }, [changes])

  const count = useMemo(() => {
    if (!enabled || !userId) return 0
    const seenAttended = loadSet(ATTENDED_KEY + userId)
    const seenChanges = loadSet(CHANGES_KEY + userId)
    const cutoff = daysAgo(RECENT_DAYS)
    const newAttended = seenAttended
      ? attended.filter((row) => row.gathered_on >= cutoff && !seenAttended.has(row.id))
          .length
      : 0
    const newChanges = seenChanges
      ? recentChanges.filter((change) => !seenChanges.has(changeKey(change))).length
      : 0
    return newAttended + newChanges
    // seenVersion 變動時重新讀 localStorage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, userId, attended, recentChanges, seenVersion])

  // 看到集點卡就全部記成已看過
  const markAllSeen = useCallback(() => {
    if (!userId) return
    void fetchAlerts().then((data) => {
      if (!data) return
      const seenAttended = loadSet(ATTENDED_KEY + userId) ?? new Set<string>()
      data.attended.forEach((row) => seenAttended.add(row.id))
      saveSet(ATTENDED_KEY + userId, seenAttended)
      const seenChanges = loadSet(CHANGES_KEY + userId) ?? new Set<string>()
      data.changes.forEach((change) => seenChanges.add(changeKey(change)))
      saveSet(CHANGES_KEY + userId, seenChanges)
      setAttended(data.attended)
      setChanges(data.changes)
      setSeenVersion((value) => value + 1)
    })
  }, [userId])

  return { count, changes: recentChanges, markAllSeen }
}
