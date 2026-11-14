import { useState } from 'react'
import '../styles/errata.css'

// 玩錯紀錄的內容：預設只顯示前幾個字，點一下才展開，再點一下收起
// 管理中心與遊戲詳細資料共用
export const ERRATA_PREVIEW_CHARS = 40

export default function ErrataBody({
  content,
  limit = ERRATA_PREVIEW_CHARS,
}: {
  content: string
  limit?: number
}) {
  const [open, setOpen] = useState(false)
  const flat = content.replace(/\s+/g, ' ').trim()
  const long = flat.length > limit

  if (!long) return <p className="er-body">{content}</p>

  return (
    <button
      type="button"
      className={`er-body er-toggle ${open ? 'open' : ''}`}
      aria-expanded={open}
      onClick={() => setOpen((v) => !v)}
    >
      {open ? content : `${flat.slice(0, limit)}…`}
      <span className="er-more">{open ? ' 收起 ▴' : ' 展開 ▾'}</span>
    </button>
  )
}
