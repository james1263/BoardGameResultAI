import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

// 集點聚會頁「留言板」分頁上的新留言數（不計入導覽列紅點）。
// 「看過的時間」記在這個瀏覽器（key 含帳號）；第一次使用時現有留言全部當成已看過。
const SEEN_KEY = 'boardgame-seen-notes:'
const POLL_MS = 120_000

function readSince(userId: string): string | null {
  try {
    return localStorage.getItem(SEEN_KEY + userId)
  } catch {
    return null
  }
}

function writeSince(userId: string, value: string) {
  try {
    localStorage.setItem(SEEN_KEY + userId, value)
  } catch {
    // 存不了就算了
  }
}

export function useNotesUnseen(userId: string | null, enabled: boolean) {
  const [count, setCount] = useState(0)

  const refresh = useCallback(async () => {
    if (!enabled || !userId) return
    const since = readSince(userId)
    if (since === null) {
      writeSince(userId, new Date().toISOString())
      setCount(0)
      return
    }
    const { data, error } = await supabase.rpc('get_notes_unseen_count', {
      p_since: since,
    })
    if (!error) setCount(Number(data) || 0)
  }, [enabled, userId])

  useEffect(() => {
    void refresh()
    function handleVisible() {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', handleVisible)
    const timer = window.setInterval(() => void refresh(), POLL_MS)
    return () => {
      document.removeEventListener('visibilitychange', handleVisible)
      window.clearInterval(timer)
    }
  }, [refresh])

  const markSeen = useCallback(() => {
    if (!userId) return
    writeSince(userId, new Date().toISOString())
    setCount(0)
  }, [userId])

  return { count: enabled ? count : 0, markSeen }
}
