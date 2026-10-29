import { useEffect, useRef, useState } from 'react'

// 名稱旁的小「ⓘ」：電腦滑鼠移上去就顯示，手機點一下顯示，點別處收起
export default function InfoHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  return (
    <span className={`info-hint${open ? ' is-open' : ''}`} ref={ref}>
      <button
        type="button"
        className="info-hint-btn"
        aria-label="說明"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
      >
        i
      </button>
      <span className="info-hint-bubble" role="tooltip">
        {text}
      </span>
    </span>
  )
}