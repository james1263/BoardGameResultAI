import { useEffect, useRef, useState, type ReactNode } from 'react'

// 遊戲詳細視窗的底部彈窗（Bottom Sheet）：蓋在 .game-modal 裡面，一次只開一個
// 關閉方式：✕、點上方暗處；返回鍵與 Esc 由 GameModal 處理（useBackClose）
// 內容往下捲超過一段距離，右下角會出現「回到最上面」按鈕（所有彈窗共用）
export default function GameInfoSheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const onScroll = () => setShowTop(el.scrollTop > 240)
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="gm-sheet-layer">
      <div className="gm-sheet-dim" onClick={onClose} aria-hidden="true" />
      <section className="gm-sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="gm-sheet-head">
          <h3>{title}</h3>
          <button type="button" className="gm-sheet-close" aria-label="關閉" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="gm-sheet-body" ref={bodyRef}>
          {children}
          <div className="gm-totop-wrap">
            {showTop && (
              <button
                type="button"
                className="gm-totop"
                aria-label="回到最上面"
                onClick={() => bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                ↑
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
