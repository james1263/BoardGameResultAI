import { useState } from 'react'
import { askConfirm } from '../lib/askConfirm'

export default function DescriptionEditor({
  value,
  isAdmin,
  onSave,
}: {
  value: string
  isAdmin: boolean
  onSave: (text: string) => Promise<boolean>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [busy, setBusy] = useState(false)

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
      {value && <p className="modal-description">{value}</p>}
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