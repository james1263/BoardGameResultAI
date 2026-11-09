import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'

// 名稱旁的小「ⓘ」：電腦滑鼠移上去就顯示，手機點一下顯示，點別處收起
// 氣泡用 createPortal 掛到 <body>，位置固定在視窗內：
// 外層視窗若有 transform／filter，position: fixed 會相對那一層而不是螢幕，氣泡就會跑出畫面，
// 所以不能把氣泡留在視窗裡面。
export default function InfoHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<CSSProperties | null>(null)
  const ref = useRef<HTMLSpanElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const bubbleRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: PointerEvent) {
      const t = e.target as Node
      if (ref.current?.contains(t) || bubbleRef.current?.contains(t)) return
      setOpen(false)
    }
    function onScroll() {
      setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  useLayoutEffect(() => {
    if (!open || !btnRef.current) {
      setPos(null)
      return
    }
    const rect = btnRef.current.getBoundingClientRect()
    const margin = 12
    const width = Math.min(260, window.innerWidth - margin * 2)
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - width / 2, margin),
      window.innerWidth - width - margin,
    )
    const below = window.innerHeight - rect.bottom
    const style: CSSProperties = {
      display: 'block',
      position: 'fixed',
      left,
      width,
      right: 'auto',
      transform: 'none',
      maxWidth: 'none',
      zIndex: 100001,
    }
    if (below >= 140 || below >= rect.top) style.top = rect.bottom + 6
    else style.bottom = window.innerHeight - rect.top + 6
    setPos(style)
  }, [open])

  // 電腦（有滑鼠）：移上去顯示、移開收起
  const canHover = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches

  return (
    <span
      className={`info-hint${open ? ' is-open' : ''}`}
      ref={ref}
      onMouseEnter={() => {
        if (canHover()) setOpen(true)
      }}
      onMouseLeave={() => {
        if (canHover()) setOpen(false)
      }}
    >
      <button
        type="button"
        className="info-hint-btn"
        aria-label="說明"
        aria-expanded={open}
        ref={btnRef}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
      >
        i
      </button>
      {open &&
        createPortal(
          <span className="info-hint-bubble" role="tooltip" ref={bubbleRef} style={pos ?? { display: 'none' }}>
            {text}
          </span>,
          document.body,
        )}
    </span>
  )
}
