import { useCallback, useState } from 'react'
import { supabase } from './supabase'
import { useSession } from './useSession'

const KEY = 'boardgame-checkin-token'

// 管理者傳的報到連結長這樣：https://網站網址/?join=一長串隨機碼
// 登入會跳轉頁面，所以先存在 localStorage，登入回來還找得到
function isValidToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{8,100}$/.test(value)
}

function readToken(): string | null {
  try {
    const params = new URLSearchParams(window.location.search)
    const fromUrl = params.get('join')
    if (fromUrl) {
      params.delete('join')
      const query = params.toString()
      window.history.replaceState(
        null,
        '',
        window.location.pathname + (query ? `?${query}` : '') + window.location.hash,
      )
      if (isValidToken(fromUrl)) {
        localStorage.setItem(KEY, fromUrl)
        return fromUrl
      }
      return null
    }
    const stored = localStorage.getItem(KEY)
    return stored && isValidToken(stored) ? stored : null
  } catch {
    return null
  }
}

export function useCheckinLink() {
  const session = useSession()
  const [token, setToken] = useState<string | null>(readToken)

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      // 清除失敗也不影響使用
    }
    setToken(null)
  }, [])

  const login = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }, [])

  return { token, isLoggedIn: session !== null, clear, login }
}
