import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useSession } from './useSession'

// 回傳是否為管理者，以及管理者身分是否已檢查完成
export function useAdminCheck(): { isAdmin: boolean; checked: boolean } {
  const session = useSession()
  const userId = session?.user?.id ?? null
  const [state, setState] = useState<{
    userId: string | null
    isAdmin: boolean
  }>({ userId: null, isAdmin: false })

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        setState({ userId, isAdmin: !error && data !== null })
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  const checked = userId === null || state.userId === userId
  const isAdmin = userId !== null && state.userId === userId && state.isAdmin

  return { isAdmin, checked }
}

export function useIsAdmin(): boolean {
  return useAdminCheck().isAdmin
}