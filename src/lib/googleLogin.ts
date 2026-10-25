import { supabase } from './supabase'

// 登入前發出這個事件，由 InAppBrowserNotice 接手顯示提示
export const IN_APP_EVENT = 'boardgame-inapp-browser'

const CHECKIN_KEY = 'boardgame-checkin-token'

// LINE、Facebook、Instagram 等 App 的內建瀏覽器：Google 不允許在裡面登入
export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Line\/|FBAN|FBAV|FB_IAB|Instagram|MicroMessenger|Messenger|TikTok|Snapchat|Twitter|; wv\)/i.test(
    navigator.userAgent,
  )
}

// 要請玩家複製到 Chrome／Safari 的網址（報到碼已被移出網址列，所以要補回去）
export function currentShareLink(): string {
  const origin = window.location.origin
  try {
    const token = localStorage.getItem(CHECKIN_KEY)
    if (token) return `${origin}/?join=${token}`
  } catch {
    // 讀不到就退回首頁網址
  }
  return origin
}

export async function signInWithGoogle() {
  if (isInAppBrowser()) {
    window.dispatchEvent(new Event(IN_APP_EVENT))
    return
  }
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
}
