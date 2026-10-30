import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'

// 已看過的預計聚會 id，記在這個瀏覽器（key 含帳號，換帳號不會互相影響）
const KEY_PREFIX = 'boardgame-seen-planned:'

function loadSeen(userId: string | null): Set<string> {
  if (!userId) return new Set()
  try {
    const raw = localStorage.getItem(KEY_PREFIX + userId)
    const list: unknown = raw ? JSON.parse(raw) : []
    return new Set(
      Array.isArray(list)
        ? list.filter((item): item is string => typeof item === 'string')
        : [],
    )
  } catch {
    return new Set()
  }
}

function saveSeen(userId: string, ids: Set<string>) {
  try {
    localStorage.setItem(KEY_PREFIX + userId, JSON.stringify(Array.from(ids)))
  } catch {
    // 存不了就算了
  }
}

// 目前「開放登記」的預計聚會 id（已取消、已轉正式、已過期的不算）
async function fetchOpenIds(): Promise<string[] | null> {
  const { data, error } = await supabase.rpc('get_upcoming_gatherings')
  if (error) return null
  return ((data ?? []) as { id: string; status: string }[])
    .filter((row) => row.status === 'open')
    .map((row) => row.id)
}

// 導覽列徽章用：還沒看過的新預計聚會數。只有 VIP／管理者（enabled）才會讀取。
export function usePlannedUnseen(userId: string | null, enabled: boolean) {
  const [openIds, setOpenIds] = useState<string[]>([])
  const [seenVersion, setSeenVersion] = useState(0)

  useEffect(() => {
    if (!enabled || !userId) return
    let cancelled = false
    function load() {
      void fetchOpenIds().then((ids) => {
        if (!cancelled && ids) setOpenIds(ids)
      })
    }
    load()
    // 切回網站分頁時再讀一次，才看得到新開的聚會
    function handleVisible() {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', handleVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisible)
    }
  }, [enabled, userId])

  const seen = useMemo(
    () => loadSeen(userId),
    // seenVersion 變動時重新讀 localStorage
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, seenVersion],
  )

  // 進入「近期聚會」時呼叫：重新讀一次最新清單，全部記成已看過
  const markAllSeen = useCallback(() => {
    if (!userId) return
    void fetchOpenIds().then((ids) => {
      if (!ids) return
      const next = loadSeen(userId)
      ids.forEach((id) => next.add(id))
      saveSeen(userId, next)
      setOpenIds(ids)
      setSeenVersion((value) => value + 1)
    })
  }, [userId])

  const unseenCount =
    enabled && userId ? openIds.filter((id) => !seen.has(id)).length : 0

  return { unseenCount, markAllSeen }
}
