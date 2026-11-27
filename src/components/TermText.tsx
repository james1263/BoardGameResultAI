import { createContext, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getTerm, type TermInfo } from '../data/component/termRegistry'
import { getTermImageUrl } from '../lib/termImage'
import { useBackClose } from '../lib/useBackClose'
import '../styles/term-image.css'

// 文字裡的名詞標記是 {{名詞編號}}；畫面上換成目前的名稱。
// VIP／管理者可以點一下（或長按）名詞看圖；其他人只看到名稱，不能點。
const MARK = /\{\{([a-z0-9-]+)\}\}/g

// 名詞檢視權限由外層一次查好（不要每個名詞各問一次資料庫）
const TermViewContext = createContext(false)
export const TermViewProvider = TermViewContext.Provider

// 搜尋用：把標記換成名稱
export function stripTerms(text: string): string {
  return text.replace(MARK, (_m, id: string) => getTerm(id)?.name ?? '')
}

function TermDialog({ term, onClose }: { term: TermInfo; onClose: () => void }) {
  useBackClose(onClose)
  const [url, setUrl] = useState<string | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(
    term.imagePath ? 'loading' : 'error',
  )

  useEffect(() => {
    let alive = true
    if (!term.imagePath) return
    void getTermImageUrl(term.imagePath).then((u) => {
      if (!alive) return
      setUrl(u)
      setState(u ? 'ok' : 'error')
    })
    return () => {
      alive = false
    }
  }, [term.imagePath])

  return createPortal(
    <div className="term-backdrop" onClick={onClose}>
      <div
        className="term-box"
        role="dialog"
        aria-label={term.name}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="term-head">
          <strong>{term.name}</strong>
          <button type="button" className="term-x" aria-label="關閉" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="term-img">
          {state === 'loading' && <p className="term-msg">載入中…</p>}
          {state === 'ok' && url && <img src={url} alt={term.name} />}
          {state === 'error' && (
            <p className="term-msg">{term.imagePath ? '圖片載入失敗。' : '這個名詞沒有圖片。'}</p>
          )}
        </div>
        {term.source && <p className="term-src">{term.source}</p>}
      </div>
    </div>,
    document.body,
  )
}

export default function TermText({ text }: { text: string }) {
  const canView = useContext(TermViewContext)
  const [open, setOpen] = useState<TermInfo | null>(null)

  if (!text.includes('{{')) return <>{text}</>

  const parts: (string | TermInfo)[] = []
  let last = 0
  for (const m of text.matchAll(MARK)) {
    const index = m.index ?? 0
    if (index > last) parts.push(text.slice(last, index))
    const term = getTerm(m[1])
    parts.push(term ?? text.slice(index, index + m[0].length))
    last = index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))

  return (
    <>
      {parts.map((part, i) => {
        if (typeof part === 'string') return part
        if (!canView || !part.imagePath) return part.name
        return (
          <button
            key={i}
            type="button"
            className="term-link"
            onClick={() => setOpen(part)}
            onContextMenu={(event) => {
              event.preventDefault()
              setOpen(part)
            }}
          >
            {part.name}
          </button>
        )
      })}
      {open && <TermDialog term={open} onClose={() => setOpen(null)} />}
    </>
  )
}
