import { useLayoutEffect, useRef, useState } from 'react'
import { askConfirm } from '../lib/askConfirm'

export default function DescriptionEditor({
  value,
  isAdmin,
  onSave,
  clamp = false,
}: {
  value: string
  isAdmin: boolean
  onSave: (text: string) => Promise<boolean>
  // true＝簡介預設只顯示三行，可展開（遊戲詳細視窗概覽用）
  clamp?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [overflow, setOverflow] = useState(false)
  const textRef = useRef<HTMLParagraphElement | null>(null)

  // 只在收起狀態量一次：文字被截掉才顯示展開鈕
  useLayoutEffect(() => {
    const el = textRef.current
    if (!clamp || !el || expanded) return
    setOverflow(el.scrollHeight > el.clientHeight + 1)
  }, [clamp, expanded, value, editing])

  if (!isAdmin && !value) return null

  async function handleSave() {
    setBusy(true)
    const ok = await onSave(draft)
    setBusy(false)
    if (ok) setEditing(false)
  }

  async function handleDelete() {
    if (!(await askConfirm('確定要刪除這款遊戲的簡介嗎？'))) return
    setBusy(true)
    const ok = await onSave('')
    setBusy(false)
    if (ok) setEditing(false)
  }

  if (editing) {
    return (
      <div className="desc-editor">
        <textarea
          value={draft}
          maxLength={300}
          rows={4}
          disabled={busy}
          onChange={(event) => setDraft(event.target.value)}
        />
        <p className="desc-count">{draft.length} / 300</p>
        <div className="desc-actions">
          <button type="button" disabled={busy} onClick={handleSave}>
            {busy ? '儲存中…' : '儲存'}
          </button>
          <button
            type="button"
            className="secondary"
            disabled={busy}
            onClick={() => setEditing(false)}
          >
            取消
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="desc-block">
      {value && (
        <p
          ref={textRef}
          className={`modal-description${clamp ? ' is-clamp' : ''}${expanded ? ' is-open' : ''}`}
        >
          {value}
        </p>
      )}
      {value && clamp && (overflow || expanded) && (
        <button
          type="button"
          className="desc-toggle"
          aria-expanded={expanded}
          aria-label={expanded ? '收合簡介' : '展開簡介'}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? '▴' : '▾'}
        </button>
      )}
      {isAdmin && (
        <div className="desc-admin-row">
          <button
            type="button"
            className="desc-link"
            onClick={() => {
              setDraft(value)
              setEditing(true)
            }}
          >
            {value ? '編輯簡介' : '＋ 新增簡介'}
          </button>
          {value && (
            <button
              type="button"
              className="desc-link danger"
              disabled={busy}
              onClick={handleDelete}
            >
              刪除簡介
            </button>
          )}
        </div>
      )}
    </div>
  )
}