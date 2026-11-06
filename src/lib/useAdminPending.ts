import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

// 管理者審核完（核准、退回、刪除）後發出這個事件，紅點數字會立刻重讀
export const PENDING_CHANGED_EVENT = 'boardgame-pending-changed'

// 管理者：待審核的玩家投稿總數（非管理者不呼叫，固定 0）
export function useAdminPending(enabled: boolean): number {
  const [count, setCount] = useState(0)

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('admin_pending_count')
    if (!error) setCount(Number(data ?? 0))
  }, [])

  useEffect(() => {
    if (!enabled) {
      setCount(0)
      return
    }
    void load()
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load()
    }
    const onChanged = () => void load()
    window.addEventListener('focus', onChanged)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener(PENDING_CHANGED_EVENT, onChanged)
    const timer = window.setInterval(() => void load(), 120000)
    return () => {
      window.removeEventListener('focus', onChanged)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener(PENDING_CHANGED_EVENT, onChanged)
      window.clearInterval(timer)
    }
  }, [enabled, load])

  return count
}
