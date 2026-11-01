import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useBackClose } from '../lib/useBackClose'
import '../styles/fullscreen-page.css'

// 全螢幕頁面：疊在抽屜上方（z-index 1210，仍低於遊戲視窗 1220，所以可以從裡面開遊戲）
// 返回鍵與 ✕ 只關這一頁。請讓父層一直掛著它、用 open 控制顯示（useBackClose 才會正確收回歷史）。
export default function FullScreenPage({
  open,
  title,
  tag,
  onClose,
  children,
}: {
  open: boolean
  title: string
  tag?: string
  onClose: () => void
  children: ReactNode
}) {
  useBackClose(onClose, open)
  if (!open) return null

  return createPortal(
    <div className="fsp" role="dialog" aria-label={title}>
      <div className="fsp-head">
        <h2>{title}</h2>
        {tag && <span className="vip-tag">{tag}</span>}
        <button type="button" className="fsp-close" aria-label="關閉" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="fsp-body">{children}</div>
    </div>,
    document.body,
  )
}
