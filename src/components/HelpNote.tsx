import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'

// 說明文字集中放：在小工具視窗裡，說明不再散在畫面各處，而是收在標題旁的「！」。
// 用法：在任何元件裡寫 <HelpNote text="…" />。
//   - 在 HelpScope 裡：文字交給標題旁的「！」顯示，畫面上不出現。
//   - 在 HelpBlock 裡（被藏起來的分頁）：不登記。
//   - 兩者都不在（例如聚會遊戲桌）：照原樣顯示成一行說明。

export type HelpApi = { set: (id: string, text: string | null) => void }

const HelpCtx = createContext<HelpApi | null | undefined>(undefined)

export function HelpScope({ api, children }: { api: HelpApi; children: ReactNode }) {
  return <HelpCtx.Provider value={api}>{children}</HelpCtx.Provider>
}

export function HelpBlock({ children }: { children: ReactNode }) {
  return <HelpCtx.Provider value={null}>{children}</HelpCtx.Provider>
}

let seq = 0

export function HelpNote({ text }: { text: string }) {
  const api = useContext(HelpCtx)
  const idRef = useRef('')
  if (!idRef.current) {
    seq += 1
    idRef.current = `h${seq}`
  }
  useEffect(() => {
    if (!api) return
    const id = idRef.current
    api.set(id, text)
    return () => api.set(id, null)
  }, [api, text])
  if (api === undefined) return <p className="gt-hint">{text}</p>
  return null
}
