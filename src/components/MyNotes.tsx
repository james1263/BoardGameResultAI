import { useMemo, useState, type ReactNode } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import {
  saveGatheringNote,
  useAllMyNotes,
  type MyNoteRow,
} from '../lib/useGatheringNotes'
import { useMyGatherings } from '../lib/useMyGatherings'

type ListedGame = BoardGame & { removedAt?: string | null }

function preview(row: MyNoteRow): string {
  const text = (row.privateNote.trim() || row.publicNote.trim()).replace(/\s+/g, ' ')
  return text.length > 50 ? `${text.slice(0, 50)}…` : text
}

// 俱樂部「我的心得」：我在各場聚會、各款遊戲寫過的心得（只讀原紀錄，不另存副本）
export default function MyNotes({
  boardGames,
  renderCover,
  onBack,
  onClose,
  onOpenGathering,
}: {
  boardGames: ListedGame[]
  renderCover: (game: BoardGame) => ReactNode
  onBack: () => void
  onClose: () => void
  onOpenGathering: (gatheringId: string) => void
}) {
  const notes = useAllMyNotes()
  const gatherings = useMyGatherings()
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const items = useMemo(() => {
    const gameByName = new Map<string, ListedGame>()
    for (const game of boardGames) gameByName.set(game.bggName, game)
    const gatheringById = new Map(gatherings.rows.map((row) => [row.id, row]))
    return notes.rows
      .filter((row) => row.privateNote.trim() !== '' || row.publicNote.trim() !== '')
      .map((row) => {
        const gathering = gatheringById.get(row.gatheringId)
        return {
          row,
          key: `${row.gatheringId}|${row.bggName}`,
          game: gameByName.get(row.bggName) ?? null,
          date: gathering?.gatheredOn ?? '',
        }
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [notes.rows, gatherings.rows, boardGames])

  async function removeField(row: MyNoteRow, field: 'private' | 'public') {
    const question =
      field === 'private' ? '要刪除這則私人心得嗎？' : '要刪除這則公開留言嗎？'
    if (!window.confirm(question)) return
    setBusy(true)
    setMessage('')
    const result = await saveGatheringNote(
      row.gatheringId,
      row.bggName,
      field === 'private' ? '' : row.privateNote,
      field === 'public' ? '' : row.publicNote,
    )
    setBusy(false)
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    notes.reload()
  }

  const loading = notes.loading || gatherings.loading

  return (
    <>
      <div className="mylist-backdrop" onClick={onClose} />
      <aside className="mylist-drawer" role="dialog" aria-label="我的心得">
        <div className="mylist-header">
          <h2>我的心得</h2>
          <button
            className="mylist-close"
            type="button"
            aria-label="關閉"
            onClick={onBack}
          >
            ×
          </button>
        </div>

        <div className="mylist-body">
          {loading ? (
            <p className="mylist-empty">讀取中…</p>
          ) : notes.error ? (
            <div className="mylist-empty">
              <p>讀取失敗，請稍後再試。</p>
              <button type="button" className="mylist-browse" onClick={notes.reload}>
                重新讀取
              </button>
            </div>
          ) : items.length === 0 ? (
            <p className="mylist-empty">還沒有心得。</p>
          ) : (
            <ul className="mn-list">
              {items.map(({ row, key, game, date }) => {
                const open = openKey === key
                return (
                  <li key={key} className="mn-item">
                    <button
                      type="button"
                      className="mn-row"
                      aria-expanded={open}
                      onClick={() => {
                        setMessage('')
                        setOpenKey(open ? null : key)
                      }}
                    >
                      <div className="mylist-thumb">
                        {game ? renderCover(game) : <span aria-hidden="true">🎲</span>}
                      </div>
                      <span className="mn-info">
                        <b className="mn-title">
                          {game?.name ?? row.bggName}
                          <span>{date ? date.replace(/-/g, '/') : ''}</span>
                        </b>
                        <span className="mn-preview">
                          {row.privateNote.trim() ? '🔒 ' : '👥 '}
                          {preview(row)}
                        </span>
                      </span>
                      <span className="mn-arrow" aria-hidden="true">
                        {open ? '▴' : '▾'}
                      </span>
                    </button>

                    {open && (
                      <div className="mn-detail">
                        {row.privateNote.trim() !== '' && (
                          <div className="mn-field">
                            <div className="mn-field-head">
                              <span>🔒 私人</span>
                              <button
                                type="button"
                                className="mn-del"
                                disabled={busy}
                                onClick={() => void removeField(row, 'private')}
                              >
                                刪除
                              </button>
                            </div>
                            <p>{row.privateNote}</p>
                          </div>
                        )}
                        {row.publicNote.trim() !== '' && (
                          <div className="mn-field">
                            <div className="mn-field-head">
                              <span>
                                👥 公開
                                {row.publicStatus === 'hidden' && '（已被管理者隱藏）'}
                              </span>
                              <button
                                type="button"
                                className="mn-del"
                                disabled={busy}
                                onClick={() => void removeField(row, 'public')}
                              >
                                刪除
                              </button>
                            </div>
                            <p>{row.publicNote}</p>
                          </div>
                        )}
                        {message && <p className="mn-error">{message}</p>}
                        <button
                          type="button"
                          className="mn-go"
                          onClick={() => onOpenGathering(row.gatheringId)}
                        >
                          到這場聚會編輯 ›
                        </button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
