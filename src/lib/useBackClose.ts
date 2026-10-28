import { useEffect, useRef } from 'react'

// 手機的「返回」／iPhone 右滑：只要有視窗或抽屜開著，就先關視窗，而不是離開網站。
//
// 做法：所有開著的視窗共用「一筆」歷史紀錄。
// - 第一個視窗開啟 → 記一筆；全部都關了 → 收回那一筆（用 ✕ 關閉時）
// - 按返回 → 這一筆被消耗，所有已登記的視窗一起關閉
// - 從一個視窗直接換成另一個（例如排行榜 → 遊戲詳細視窗）不會多記也不會少記

type Closer = () => void

const closers = new Set<Closer>()
let hasEntry = false
let timer: number | undefined
let listening = false

function onPop() {
  if (!hasEntry) return // 自己收回那一筆時也會觸發，直接略過
  hasEntry = false
  Array.from(closers).forEach((close) => close())
}

// 延遲一下再判斷，視窗互相切換（同一瞬間一個關、一個開）時就不會誤動歷史紀錄
function sync() {
  window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    if (closers.size > 0 && !hasEntry) {
      if (!listening) {
        window.addEventListener('popstate', onPop)
        listening = true
      }
      window.history.pushState({ backClose: true }, '')
      hasEntry = true
    } else if (closers.size === 0 && hasEntry) {
      hasEntry = false
      if (window.history.state?.backClose) window.history.back()
    }
  }, 0)
}

// enabled 預設為 true；導覽頁面這種「一直存在、只是有時開著」的元件，用 enabled 控制
export function useBackClose(onClose: () => void, enabled = true) {
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!enabled) return
    const closer: Closer = () => closeRef.current()
    closers.add(closer)
    sync()
    return () => {
      closers.delete(closer)
      sync()
    }
  }, [enabled])
}
