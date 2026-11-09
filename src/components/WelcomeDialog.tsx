import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { currentShareLink, isInAppBrowser, signInWithGoogle } from '../lib/googleLogin'
import { showNotice } from '../lib/askConfirm'
import { FROM_WELCOME_KEY } from './VipGate'
import '../styles/welcome.css'

// 「先逛逛」按過就記住（同一個瀏覽器不再跳）；登出後清掉，下次會再問
const SKIP_KEY = 'boardgame-welcome-skip'
const CHECKIN_KEY = 'boardgame-checkin-token'

function readFlag(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

// 第一次打開網站、還沒登入時跳出的歡迎視窗：Google 登入，或先逛逛（不建帳號）
export default function WelcomeDialog() {
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [skipped, setSkipped] = useState(() => readFlag(SKIP_KEY) === '1')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setAuthed(data.session !== null)
      setReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        try {
          localStorage.removeItem(SKIP_KEY)
        } catch {
          // 清不掉也沒關係
        }
        setSkipped(false)
        setAuthed(false)
      } else if (session) {
        setAuthed(true)
      }
    })
    return () => {
      cancelled = true
      data.subscription.unsubscribe()
    }
  }, [])

  if (!ready || authed || skipped) return null

  const hasCheckin = readFlag(CHECKIN_KEY) !== null
  const inApp = isInAppBrowser()

  function loginWithGoogle() {
    // 登入會整頁跳轉，先記下「是從歡迎視窗登入的」，回來後才知道要不要問升級 VIP
    try {
      localStorage.setItem(FROM_WELCOME_KEY, '1')
    } catch {
      // 存不了就不會跳升級視窗
    }
    void signInWithGoogle()
  }

  function browse() {
    try {
      localStorage.setItem(SKIP_KEY, '1')
      localStorage.removeItem(FROM_WELCOME_KEY)
    } catch {
      // 存不了就只在這次有效
    }
    setSkipped(true)
  }

  async function copyLink() {
    const link = currentShareLink()
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      void showNotice('請長按複製這個網址，貼到 Chrome 或 Safari 開啟：\n' + link)
    }
  }

  return createPortal(
    <div className="wd-backdrop">
      <div className="wd-card" role="dialog" aria-modal="true" aria-label="歡迎來到玩桌遊">
        <div className="wd-logo" aria-hidden="true">
          🎲
        </div>
        <h1 className="wd-brand">玩桌遊｜BoardGame</h1>
        <p className="wd-tag">探索桌遊・分享樂趣・連結玩家</p>

        <h2 className="wd-title">今天，想玩哪一款？</h2>
        <p className="wd-sub">
          {hasCheckin
            ? '你收到了聚會報到連結，請先用 Google 登入，登入後會自動幫你報到。'
            : '用 Google 登入，可以保存你的想玩、已玩、評分與集點；也可以先逛逛，不用登入。'}
        </p>

        {inApp && (
          <div className="wd-warn">
            <p>
              你現在在 LINE／Facebook 這類 App 的內建瀏覽器裡，Google 不允許在這裡登入。
              請複製連結，用 Chrome 或 Safari 開啟。
            </p>
            <button type="button" className="wd-copy" onClick={() => void copyLink()}>
              {copied ? '已複製連結 ✓' : '複製連結'}
            </button>
          </div>
        )}

        <button type="button" className="wd-primary" onClick={loginWithGoogle}>
          用 Google 登入
        </button>
        {!hasCheckin && (
          <button type="button" className="wd-secondary" onClick={browse}>
            先逛逛
          </button>
        )}
        <p className="wd-foot">先逛逛不會建立帳號；想玩與已玩只會存在這個瀏覽器。</p>
      </div>
    </div>,
    document.body,
  )
}
