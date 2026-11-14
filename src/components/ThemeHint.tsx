import { useEffect, useState } from 'react'
import { THEME_KEY, saveThemePref } from '../lib/theme'
import '../styles/theme-hint.css'

// 第一次用 LINE／FB／Instagram／Google App 內建瀏覽器進站的人，網站預設是深色，
// 可能以為壞掉：顯示一次小提示，告訴他可以切淺色，也可以之後在玩家選單「外觀」改。
const SEEN_KEY = 'boardgame-theme-hint-seen'

function isInApp(): boolean {
  return /Line\/|FBAN|FBAV|FB_IAB|Instagram|\bGSA\//i.test(navigator.userAgent)
}

function shouldShow(): boolean {
  try {
    if (localStorage.getItem(THEME_KEY)) return false
    if (localStorage.getItem(SEEN_KEY)) return false
  } catch {
    return false
  }
  return isInApp()
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1')
  } catch {
    // 存不了就算了，下次可能再出現一次
  }
}

export default function ThemeHint() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!shouldShow()) return
    const open = window.setTimeout(() => setShow(true), 1500)
    return () => window.clearTimeout(open)
  }, [])

  // 沒按也會在 15 秒後自己收起，並記為已看過
  useEffect(() => {
    if (!show) return
    const close = window.setTimeout(() => {
      markSeen()
      setShow(false)
    }, 15000)
    return () => window.clearTimeout(close)
  }, [show])

  if (!show) return null

  return (
    <div className="theme-hint" role="status">
      <p>網站目前是深色外觀。想改成淺色，可以按下面的按鈕，之後也能在上方暱稱選單的「外觀」切換。</p>
      <div className="theme-hint-actions">
        <button
          type="button"
          onClick={() => {
            saveThemePref('light')
            markSeen()
            setShow(false)
          }}
        >
          改成淺色
        </button>
        <button
          type="button"
          className="plain"
          onClick={() => {
            markSeen()
            setShow(false)
          }}
        >
          知道了
        </button>
      </div>
    </div>
  )
}
