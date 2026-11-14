import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useBackClose } from '../lib/useBackClose'

// 管理中心「上傳檔案」各分頁共用的新增視窗（＋ 按鈕開啟）
export default function UploadModal({
  title,
  locked = false,
  onClose,
  children,
}: {
  title: string
  locked?: boolean
  onClose: () => void
  children: ReactNode
}) {
  useBackClose(() => {
    if (!locked) onClose()
  })
  return createPortal(
    <div
      className="rb rbu-backdrop"
      onClick={() => {
        if (!locked) onClose()
      }}
    >
      <div
        className="rbu-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="rbu-head">
          <h3>{title}</h3>
          <button type="button" className="rbu-close" aria-label="關閉" disabled={locked} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="rbu-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
