import { useState } from 'react'
import {
  MAX_NOTES_PER_GAME,
  useGameNotesBoard,
  type BoardNote,
} from '../lib/useGameNotesBoard'
import NoteListItem from './NoteListItem'
import '../styles/game-tabs.css'

function formatDate(day: string): string {
  return day ? day.replaceAll('-', '/') : ''
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
  const [showHidden, setShowHidden] = useState(false)
  const [message, setMessage] = useState('')
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  // 頁面內確認（Google App 等內建瀏覽器不支援 window.confirm）
  const [pending, setPending] = useState<{ id: string; kind: 'delete' | 'hide' } | null>(null)

  if (!enabled) return null

  const myCount = api.myNotes.length
  const full = myCount >= MAX_NOTES_PER_GAME
  const myHiddenNotes = api.myNotes.filter((note) => note.hidden)
  const editableIds = new Set(api.myNotes.map((note) => note.id))

  async function publish() {
    setMessage('')
    const result = await api.addNote(draft)
    if (result) {
      setMessage(result)
      return
    }
    setDraft('')
  }

  async function saveEdit(noteId: string) {
    setMessage('')
    const result = await api.updateNote(noteId, editText)
    if (result) {
      setMessage(result)
      return
    }
    setEditingId(null)
  }

  async function removeMine(noteId: string) {
    setPending(null)
    setMessage(await api.deleteMine(noteId))
    if (editingId === noteId) setEditingId(null)
  }

  async function hide(note: BoardNote) {
    setPending(null)
    setMessage(await api.setHidden(note.id, true))
  }

  function renderConfirm(kind: 'delete' | 'hide', onYes: () => void) {
    return (
      <div className="gb-btn-row">
        <span className="gb-count">
          {kind === 'delete' ? '確定刪除？無法復原' : '確定隱藏？之後可恢復'}
        </span>
        <button type="button" className="gb-action" onClick={() => setPending(null)}>
          取消
        </button>
        <button type="button" className="gb-action gb-danger" onClick={onYes}>
          {kind === 'delete' ? '確定刪除' : '確定隱藏'}
        </button>
      </div>
    )
  }

  return (
    <div className="gb-board">
      <p className="gb-head">
        {api.loading ? '讀取中…' : `共 ${api.notes.length} 則留言`}
      </p>
      {api.error && <p className="gb-empty">{api.error}</p>}

      {!api.loading &&
        (canWrite ? (
          <div className="gb-mine-box">
            <textarea
              className="gb-textarea nl-short"
              maxLength={200}
              rows={2}
              value={draft}
              placeholder="這款遊戲你想跟大家說什麼？（公開給 VIP，最多 200 字）"
              onChange={(event) => setDraft(event.target.value)}
            />
            <div className="gb-mine-actions">
              <span className="gb-count">
                {draft.length} / 200・你在這款已留 {myCount} / {MAX_NOTES_PER_GAME} 則
              </span>
              <button
                type="button"
                className="gb-save"
                disabled={api.saving || draft.trim() === '' || full}
                onClick={() => void publish()}
              >
                {api.saving ? '發表中…' : '發表'}
              </button>
            </div>
            {full && (
              <p className="gb-warn">
                這款你已經留了 {MAX_NOTES_PER_GAME} 則，刪掉舊的才能再發表。
              </p>
            )}
          </div>
        ) : (
          <p className="gb-empty">標記已玩或評分過這款，就能留言。</p>
        ))}

      {myHiddenNotes.length > 0 && (
        <div className="gb-mine-box">
          <p className="gb-warn">
            你有 {myHiddenNotes.length} 則留言被管理者隱藏，其他人看不到。
          </p>
          <ul className="gb-list">
            {myHiddenNotes.map((note) => (
              <li className="gb-item" key={note.id}>
                <p className="gb-content">{note.content}</p>
                {pending?.id === note.id && pending.kind === 'delete' ? (
                  renderConfirm('delete', () => void removeMine(note.id))
                ) : (
                  <div className="gb-meta">
                    <button
                      type="button"
                      className="gb-action gb-danger"
                      disabled={api.busyId === note.id}
                      onClick={() => setPending({ id: note.id, kind: 'delete' })}
                    >
                      刪除
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!api.loading && !api.error && api.notes.length === 0 && (
        <p className="gb-empty">還沒有人留言。</p>
      )}

      {api.notes.length > 0 && (
        <ul className="gb-list">
          {api.notes.map((note) => {
            const busy = api.busyId === note.id
            const editable = note.isMine && editableIds.has(note.id)

            if (editingId === note.id) {
              return (
                <li className="nl-item is-open" key={note.id}>
                  <div className="nl-edit">
                    <div className="nl-top">
                      <b className="nl-name">{note.nickname}</b>
                      <span className="gb-mine">我的</span>
                    </div>
                    <textarea
                      className="gb-textarea nl-short"
                      maxLength={200}
                      rows={2}
                      value={editText}
                      onChange={(event) => setEditText(event.target.value)}
                    />
                    <div className="gb-mine-actions">
                      <span className="gb-count">{editText.length} / 200</span>
                      <span className="gb-btn-row">
                        <button
                          type="button"
                          className="gb-action"
                          disabled={busy}
                          onClick={() => setEditingId(null)}
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          className="gb-save"
                          disabled={busy || editText.trim() === ''}
                          onClick={() => void saveEdit(note.id)}
                        >
                          {busy ? '儲存中…' : '儲存'}
                        </button>
                      </span>
                    </div>
                  </div>
                </li>
              )
            }

            const open = openId === note.id
            return (
              <NoteListItem
                key={note.id}
                name={note.nickname}
                mine={note.isMine}
                date={note.postedOn ? formatDate(note.postedOn) : ''}
                content={note.content}
                open={open}
                onToggle={() => setOpenId(open ? null : note.id)}
              >
                {pending?.id === note.id ? (
                  note.isMine ? (
                    renderConfirm('delete', () => void removeMine(note.id))
                  ) : (
                    renderConfirm('hide', () => void hide(note))
                  )
                ) : note.isMine || isAdmin ? (
                  <div className="gb-btn-row">
                    {editable && (
                      <button
                        type="button"
                        className="gb-action"
                        disabled={busy}
                        onClick={() => {
                          setEditingId(note.id)
                          setEditText(note.content)
                          setMessage('')
                        }}
                      >
                        編輯
                      </button>
                    )}
                    {note.isMine ? (
                      <button
                        type="button"
                        className="gb-action gb-danger"
                        disabled={busy}
                        onClick={() => setPending({ id: note.id, kind: 'delete' })}
                      >
                        {busy ? '處理中…' : '刪除'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="gb-action"
                        disabled={busy}
                        onClick={() => setPending({ id: note.id, kind: 'hide' })}
                      >
                        {busy ? '處理中…' : '隱藏'}
                      </button>
                    )}
                  </div>
                ) : null}
              </NoteListItem>
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
                <li className="gb-item" key={note.id}>
                  <div className="gb-meta">
                    <b className="gb-name">{note.nickname}</b>
                  </div>
                  <p className="gb-content">{note.content}</p>
                  <div className="gb-btn-row">
                    <button
                      type="button"
                      className="gb-action"
                      disabled={api.busyId === note.id}
                      onClick={() =>
                        void api.setHidden(note.id, false).then(setMessage)
                      }
                    >
                      恢復顯示
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {message && <p className="gb-empty">{message}</p>}
    </div>
  )
}
