import { useState } from 'react'
import { useGameNotesBoard, type BoardNote } from '../lib/useGameNotesBoard'

function NoteItem({
  note,
  actionLabel,
  busy,
  onAction,
}: {
  note: BoardNote
  actionLabel?: string
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
            className="gb-action"
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

export default function GameNotesBoard({
  bggName,
  isAdmin,
  enabled,
}: {
  bggName: string
  isAdmin: boolean
  enabled: boolean
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
          {!api.loading && !api.error && api.notes.length === 0 && (
            <p className="gb-empty">還沒有人留言。</p>
          )}
          {api.notes.length > 0 && (
            <ul className="gb-list">
              {api.notes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  actionLabel={isAdmin ? '隱藏' : undefined}
                  busy={api.busyId === note.id}
                  onAction={isAdmin ? () => void hide(note) : undefined}
                />
              ))}
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