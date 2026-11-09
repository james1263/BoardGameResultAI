import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

// 名稱旁的小「ⓘ」：電腦滑鼠移上去就顯示，手機點一下顯示，點別處收起
// 點開時氣泡改用「固定在視窗內」的位置，不會被切到視窗外
export default function InfoHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<CSSProperties | null>(null)
  const ref = useRef<HTMLSpanElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
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

  return (
    <span className={`info-hint${open ? ' is-open' : ''}`} ref={ref}>
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
      <span className="info-hint-bubble" role="tooltip" style={open && pos ? pos : undefined}>
        {text}
      </span>
    </span>
  )
}
