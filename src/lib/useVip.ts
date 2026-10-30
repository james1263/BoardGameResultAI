import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useSession } from './useSession'

export const VIP_CHANGED_EVENT = 'vip-changed'

// 記住上一次查到的結果：切換分頁、重新開視窗時，不用從「不是 VIP」重新開始
let cache: { userId: string; isVip: boolean } | null = null

// 目前登入者是不是 VIP（管理者也算）。資料庫的 is_vip() 才是真正的判斷。
export function useVip() {
  const session = useSession()
  const userId = session?.user?.id ?? null
  const [isVip, setIsVip] = useState(cache?.isVip ?? false)
  const [checked, setChecked] = useState(cache !== null)

  const refresh = useCallback(async () => {
    if (!userId) {
      // session 可能只是還沒讀完：問 supabase 本機有沒有登入資料，有的話先不下結論
      const { data } = await supabase.auth.getSession()
      if (data.session) return
      cache = null
      setIsVip(false)
      setChecked(true)
      return
    }
    const { data, error } = await supabase.rpc('is_vip')
    const value = !error && data === true
    cache = { userId, isVip: value }
    setIsVip(value)
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