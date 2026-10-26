import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useSession } from './useSession'

export const VIP_CHANGED_EVENT = 'vip-changed'

// 目前登入者是不是 VIP（管理者也算）。資料庫的 is_vip() 才是真正的判斷。
export function useVip() {
  const session = useSession()
  const userId = session?.user?.id ?? null
  const [isVip, setIsVip] = useState(false)
  const [checked, setChecked] = useState(false)

  const refresh = useCallback(async () => {
    if (!userId) {
      setIsVip(false)
      setChecked(true)
      return
    }
    const { data, error } = await supabase.rpc('is_vip')
    setIsVip(!error && data === true)
    setChecked(true)
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const handler = () => void refresh()
    window.addEventListener(VIP_CHANGED_EVENT, handler)
    return () => window.removeEventListener(VIP_CHANGED_EVENT, handler)
  }, [refresh])

  return { isVip, checked, loggedIn: userId !== null, refresh }
}