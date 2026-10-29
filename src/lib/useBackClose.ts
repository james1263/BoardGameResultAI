import { useEffect, useRef } from 'react'

// 返回鍵／iPhone 右滑／✕：一律只回「上一層」。
//
// 做法：每一層視窗各佔一筆歷史紀錄（堆疊）。
// - 視窗開啟 → 記一筆；按返回 → 只關最上面那一層
// - 用 ✕ 或程式關閉某一層 → 自己把那一筆收回，不會多留
// - 同一瞬間一個關、一個開（例如換頁）→ 沿用舊的那一筆，不多記也不少記

type Entry = { close: () => void; pushed: boolean }

const stack: Entry[] = []
let depth = 0 // 歷史紀錄裡目前有幾筆是我們記的
let pendingBack = 0 // 已經不需要、等著收回的筆數
let expectedPops = 0 // 我們自己呼叫 history.go 造成的 popstate 還要略過幾次
let timer: number | undefined
let guard: number | undefined
let listening = false

function onPop(event: PopStateEvent) {
  if (expectedPops > 0) {
    // 自己收回歷史造成的，略過
    expectedPops -= 1
    window.clearTimeout(guard)
    sync()
    return
  }

  const raw = (event.state as { backDepth?: number } | null)?.backDepth
  const target = typeof raw === 'number' ? raw : 0

  if (target < depth) {
    // 使用者按了返回／右滑：只關最上面的層（一次退多步就關多層）
    let steps = depth - target
    depth = target
    const fromPending = Math.min(pendingBack, steps)
    pendingBack -= fromPending
    steps -= fromPending
    const closing: Entry[] = []
    for (let i = stack.length - 1; i >= 0 && steps > 0; i -= 1) {
      if (stack[i].pushed) {
        closing.push(stack[i])
        stack.splice(i, 1)
        steps -= 1
      }
    }
    closing.forEach((entry) => entry.close())
  } else if (target > depth) {
    // 使用者按了「前進」：我們沒有對應的視窗，退回去
    expectedPops += 1
    const gap = target - depth
    guard = window.setTimeout(() => {
      expectedPops = 0
      sync()
    }, 800)
    window.history.go(-gap)
  }
}

function sync() {
  window.clearTimeout(timer)
  timer = window.setTimeout(flush, 0)
}

function flush() {
  if (expectedPops > 0) return // 等上一次收回歷史完成再處理

  const fresh = stack.filter((entry) => !entry.pushed)

  // 同一瞬間一關一開：直接沿用舊的那一筆
  const reuse = Math.min(pendingBack, fresh.length)
  for (let i = 0; i < reuse; i += 1) fresh[i].pushed = true
  pendingBack -= reuse

  const toPush = fresh.slice(reuse)
  if (toPush.length > 0) {
    if (!listening) {
      window.addEventListener('popstate', onPop)
      listening = true
    }
    toPush.forEach((entry) => {
      depth += 1
      window.history.pushState({ backDepth: depth }, '')
      entry.pushed = true
    })
  }

  if (pendingBack > 0) {
    const steps = pendingBack
    pendingBack = 0
    depth -= steps
    expectedPops += 1
    guard = window.setTimeout(() => {
      expectedPops = 0
      sync()
    }, 800)
    window.history.go(-steps)
  }
}

// enabled 預設為 true；導覽頁面這種「一直存在、只是有時開著」的元件，用 enabled 控制
export function useBackClose(onClose: () => void, enabled = true) {
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!enabled) return
    const entry: Entry = { close: () => closeRef.current(), pushed: false }
    stack.push(entry)
    sync()
    return () => {
      const index = stack.indexOf(entry)
      if (index === -1) return // 已經被返回鍵移除，不用再收
      stack.splice(index, 1)
      if (entry.pushed) pendingBack += 1
      sync()
    }
  }, [enabled])
}