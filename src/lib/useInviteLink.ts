import { useCallback, useState } from 'react'
import { signInWithGoogle } from './googleLogin'
import { useSession } from './useSession'

const KEY = 'boardgame-invite-card'

// 管理者傳的連結長這樣：https://網站網址/?card=2026-10-25
// 連結本身不含任何密碼，只是「登入後直接打開自己的集點卡」
function readPending(): string | null {
  try {
    const params = new URLSearchParams(window.location.search)
    const fromUrl = params.get('card')
    if (fromUrl) {
      localStorage.setItem(KEY, fromUrl)
      params.delete('card')
      const query = params.toString()
      window.history.replaceState(
        null,
        '',
        window.location.pathname + (query ? `?${query}` : '') + window.location.hash,
      )
      return fromUrl
    }
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function useInviteLink() {
  const session = useSession()
  // Google 登入會跳轉頁面，所以先存在 localStorage，登入回來還找得到
  const [pending, setPending] = useState<string | null>(readPending)

  const consume = useCallback(() => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      // 清除失敗也不影響使用
    }
    setPending(null)
  }, [])

  const login = useCallback(async () => {
    await signInWithGoogle()
  }, [])

  const focusDate =
    pending && /^\d{4}-\d{2}-\d{2}$/.test(pending) ? pending : null

  return {
    pending,
    focusDate,
    isLoggedIn: session !== null,
    consume,
    login,
  }
}
