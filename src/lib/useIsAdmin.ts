import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useSession } from './useSession'

// 回傳目前登入者是不是管理者（查 admin_users 表，政策只讓人讀到自己那一列）
export function useIsAdmin(): boolean {
  const session = useSession()
  const userId = session?.user?.id ?? null
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!userId) {
      setIsAdmin(false)
      return
    }

    let cancelled = false

    supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        setIsAdmin(!error && data !== null)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  return isAdmin
}