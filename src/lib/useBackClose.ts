import { useEffect, useRef } from 'react'

// 視窗開著時，手機的「返回」會關閉視窗，而不是離開網站。
export function useBackClose(onClose: () => void) {
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    let pushed = false
    let closedByBack = false
    function onPop() {
      closedByBack = true
      closeRef.current()
    }
    // 延遲一下再註冊，避免開發模式（StrictMode）重複執行時誤關視窗
    const timer = window.setTimeout(() => {
      window.history.pushState({ backClose: true }, '')
      window.addEventListener('popstate', onPop)
      pushed = true
    }, 0)

    return () => {
      window.clearTimeout(timer)
      if (!pushed) return
      window.removeEventListener('popstate', onPop)
      // 用 ✕ 或 Esc 關閉時，把多記的那一筆歷史收回去
      if (!closedByBack && window.history.state?.backClose) {
        window.history.back()
      }
    }
  }, [])
}