import { useEffect, useRef, useState } from 'react'
import { NEW_GAME_DAYS, type ViewMode } from '../lib/libraryTypes'
import ViewToggle from './ViewToggle'
import '../styles/display-control.css'

export default function DisplayControl({
  showNew,
  onShowNewChange,
  showCardInfo,
  onShowCardInfoChange,
  viewMode,
  onViewModeChange,
  canHideDiscussions = false,
  showDiscussions = true,
  onShowDiscussionsChange,
}: {
  showNew: boolean
  onShowNewChange: (value: boolean) => void
  showCardInfo: boolean
  onShowCardInfoChange: (value: boolean) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  // 只有 VIP／管理者看得到「最新桌遊討論」，所以也只有他們會看到這個選項
  canHideDiscussions?: boolean
  showDiscussions?: boolean
  onShowDiscussionsChange?: (value: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  // 點外面或按 Esc 就收起來
  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="display-control" ref={rootRef}>
      <button
        type="button"
        className={`display-btn ${open ? 'open' : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((current) => !current)}
      >
        顯示
      </button>
      {open && (
        <div className="display-panel" role="group" aria-label="顯示設定">
          <label className="display-option">
            <input
              type="checkbox"
              checked={showNew}
              onChange={(event) => onShowNewChange(event.target.checked)}
            />
            <span>顯示新遊戲（{NEW_GAME_DAYS} 天內加入）</span>
          </label>
          {canHideDiscussions && onShowDiscussionsChange && (
            <label className="display-option">
              <input
                type="checkbox"
                checked={showDiscussions}
                onChange={(event) => onShowDiscussionsChange(event.target.checked)}
              />
              <span>顯示最新桌遊討論</span>
            </label>
          )}
          <label className="display-option">
            <input
              type="checkbox"
              checked={showCardInfo}
              onChange={(event) => onShowCardInfoChange(event.target.checked)}
            />
            <span>顯示卡片下方文字</span>
          </label>
          <div className="display-view">
            <span>檢視</span>
            <ViewToggle viewMode={viewMode} onChange={onViewModeChange} />
          </div>
        </div>
      )}
    </div>
  )
}
