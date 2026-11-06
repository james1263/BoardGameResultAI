import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useSession } from './useSession'

// 規則助手「玩錯紀錄・投稿」的更新數字：自上次看過之後新核准或新增的筆數（不含自己投稿的）
export const ERRATA_SEEN_EVENT = 'boardgame-errata-seen'
const KEY_PREFIX = 'boardgame-seen-errata:'

export function getErrataLastSeen(uid: string): string | null {
  try {
    return localStorage.getItem(KEY_PREFIX + uid)
  } catch {
    return null
  }
}

export function markErrataSeen(uid: string | undefined) {
  if (!uid) return
  try {
    localStorage.setItem(KEY_PREFIX + uid, new Date().toISOString())
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(ERRATA_SEEN_EVENT))
}

export function useErrataUnseen(enabled: boolean): number {
  const session = useSession()
  const uid = session?.user?.id
  const [count, setCount] = useState(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!enabled) return
    const reload = () => setTick((n) => n + 1)
    const onVisible = () => {
      if (document.visibilityState === 'visible') reload()
    }
    window.addEventListener('focus', reload)
    window.addEventListener(ERRATA_SEEN_EVENT, reload)
    document.addEventListener('visibilitychange', onVisible)
    const timer = window.setInterval(reload, 120000)
    return () => {
      window.removeEventListener('focus', reload)
      window.removeEventListener(ERRATA_SEEN_EVENT, reload)
      document.removeEventListener('visibilitychange', onVisible)
      window.clearInterval(timer)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || !uid) {
      setCount(0)
      return
    }
    let since = getErrataLastSeen(uid)
    if (!since) {
      // 第一次使用：現有的紀錄都當成已看過
      markErrataSeen(uid)
      setCount(0)
      return
    }
    let cancelled = false
    supabase.rpc('get_errata_unseen_count', { p_since: since }).then(({ data, error }) => {
      if (cancelled) return
      setCount(error ? 0 : Number(data ?? 0))
    })
    since = null
    return () => {
      cancelled = true
    }
  }, [enabled, uid, tick])

  return count
}
