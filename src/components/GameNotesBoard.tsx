import { useState } from 'react'
import { useGameNotesBoard, type BoardNote } from '../lib/useGameNotesBoard'

function NoteItem({
  note,
  actionLabel,
  danger,
  busy,
  onAction,
}: {
  note: BoardNote
  actionLabel?: string
  danger?: boolean
  busy?: boolean
  onAction?: () => void
}) {
  return (
    <li className="gb-item">
      <div className="gb-meta">
        <b className="gb-name">{note.nickname}</b>
        {note.isMine && <span className="gb-mine">我的</span>}
        {actionLabel && onAction && (
          <button
            type="button"
            className={`gb-action${danger ? ' gb-danger' : ''}`}
            disabled={busy}
            onClick={onAction}
          >
            {busy ? '處理中…' : actionLabel}
          </button>
        )}
      </div>
      <p className="gb-content">{note.content}</p>
    </li>
  )
}

function MyNoteEditor({
  initial,
  hidden,
  saving,
  onSave,
}: {
  initial: string
  hidden: boolean
  saving: boolean
  onSave: (text: string) => Promise<string>
}) {
  const [text, setText] = useState(initial)
  const [message, setMessage] = useState('')
  const dirty = text.trim() !== initial

  async function handleSave() {
    setMessage('')
    const result = await onSave(text)
    setMessage(result || (text.trim() === '' ? '已刪除。' : '已儲存。'))
  }

  return (
    <div className="gb-mine-box">
      <p className="gb-mine-title">我的留言（公開給 VIP，最多 200 字）</p>
      {hidden && (
        <p className="gb-warn">這則留言目前被管理者隱藏，其他人看不到。</p>
      )}
      <textarea
        className="gb-textarea"
        maxLength={200}
        rows={3}
        value={text}
        placeholder="這款遊戲你想跟大家說什麼？留空儲存就是刪除。"
        onChange={(event) => setText(event.target.value)}
      />
      <div className="gb-mine-actions">
        <span className="gb-count">{text.length} / 200</span>
        <button
          type="button"
          className="gb-save"
          disabled={saving || !dirty}
          onClick={() => void handleSave()}
        >
          {saving ? '儲存中…' : text.trim() === '' && initial ? '刪除留言' : '儲存'}
        </button>
      </div>
      {message && <p className="gb-empty">{message}</p>}
    </div>
  )
}

export default function GameNotesBoard({
  bggName,
  isAdmin,
  enabled,
  canWrite,
}: {
  bggName: string
  isAdmin: boolean
  enabled: boolean
  canWrite: boolean
}) {
  const api = useGameNotesBoard(bggName, enabled, isAdmin)
  const [open, setOpen] = useState(false)
  const [showHidden, setShowHidden] = useState(false)
  const [message, setMessage] = useState('')

  if (!enabled) return null

  async function hide(note: BoardNote) {
    if (!window.confirm(`確定要隱藏「${note.nickname}」的這則留言嗎？之後可以恢復。`)) {
      return
    }
    setMessage(await api.setHidden(note.id, true))
  }

  async function restore(note: BoardNote) {
    setMessage(await api.setHidden(note.id, false))
  }

  async function removeMine(note: BoardNote) {
    if (!window.confirm('確定要刪除這則留言嗎？刪除後無法復原。')) return
    setMessage(await api.deleteMine(note.id))
  }

  // 自己的留言一律可以直接刪除；管理者對別人的留言是「隱藏」
  function actionFor(note: BoardNote) {
    if (note.isMine) {
      return { label: '刪除', danger: true, run: () => void removeMine(note) }
    }
    if (isAdmin) {
      return { label: '隱藏', danger: false, run: () => void hide(note) }
    }
    return null
  }

  return (
    <div className="gb-board">
      <button
        type="button"
        className="gb-toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>大家的留言{api.loading ? '' : `（${api.notes.length}）`}</span>
        <span aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="gb-body">
          {api.loading && <p className="gb-empty">讀取中…</p>}
          {api.error && <p className="gb-empty">{api.error}</p>}

          {!api.loading &&
            (canWrite ? (
              <MyNoteEditor
                key={`${api.myContent}-${api.myHidden}`}
                initial={api.myContent}
                hidden={api.myHidden}
                saving={api.saving}
                onSave={api.saveMine}
              />
            ) : (
              <p className="gb-empty">標記已玩或評分過這款，就能留言。</p>
            ))}

          {!api.loading && !api.error && api.notes.length === 0 && (
            <p className="gb-empty">還沒有人留言。</p>
          )}
          {api.notes.length > 0 && (
            <ul className="gb-list">
              {api.notes.map((note) => {
                const action = actionFor(note)
                return (
                  <NoteItem
                    key={note.id}
                    note={note}
                    actionLabel={action?.label}
                    danger={action?.danger}
                    busy={api.busyId === note.id}
                    onAction={action?.run}
                  />
                )
              })}
            </ul>
          )}

          {isAdmin && api.hiddenNotes.length > 0 && (
            <>
              <button
                type="button"
                className="gb-hidden-toggle"
                onClick={() => setShowHidden((value) => !value)}
              >
                已隱藏的留言（{api.hiddenNotes.length}）{showHidden ? ' ▴' : ' ▾'}
              </button>
              {showHidden && (
                <ul className="gb-list">
                  {api.hiddenNotes.map((note) => (
                    <NoteItem
                      key={note.id}
                      note={note}
                      actionLabel="恢復顯示"
                      busy={api.busyId === note.id}
                      onAction={() => void restore(note)}
                    />
                  ))}
                </ul>
              )}
            </>
          )}
          {message && <p className="gb-empty">{message}</p>}
        </div>
      )}
    </div>
  )
}
