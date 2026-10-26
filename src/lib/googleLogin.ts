import { supabase } from './supabase'

// 登入前發出這個事件，由 InAppBrowserNotice 接手顯示提示
export const IN_APP_EVENT = 'boardgame-inapp-browser'

// 玩家存好暱稱與聯絡方式後發出這個事件，報到視窗收到就會自動幫他報到
export const PROFILE_SAVED_EVENT = 'boardgame-profile-saved'

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
    options: {
      redirectTo: window.location.origin,
      // 每次都讓玩家選擇要用哪個 Google 帳號（也可以選「使用其他帳號」）
      queryParams: { prompt: 'select_account' },
    },
  })
}
