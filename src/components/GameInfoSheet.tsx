import type { ReactNode } from 'react'

// 遊戲詳細視窗的底部彈窗（Bottom Sheet）：蓋在 .game-modal 裡面，一次只開一個
// 關閉方式：✕、點上方暗處；返回鍵與 Esc 由 GameModal 處理（useBackClose）
export default function GameInfoSheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
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
        <div className="gm-sheet-body">{children}</div>
      </section>
    </div>
  )
}
