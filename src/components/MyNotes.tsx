import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import {
  saveGatheringNote,
  useAllMyNotes,
} from '../lib/useGatheringNotes'
import { useMyGatherings } from '../lib/useMyGatherings'
import { supabase } from '../lib/supabase'
import '../styles/my-notes.css'
import { askConfirm } from '../lib/askConfirm'

type ListedGame = BoardGame & { removedAt?: string | null }

type GameNoteRow = {
  id: string
  bgg_name: string
  content: string | null
  status: string | null
  created_at: string
}

type Filter = 'all' | 'public' | 'private' | 'gathering'

// game：遊戲公開留言；gpublic／gprivate：場次心得的公開欄／私人欄（各自一張卡）
type Item = {
  key: string
  kind: 'game' | 'gpublic' | 'gprivate'
  bggName: string
  date: string // YYYY-MM-DD，沒有日期是空字串
  content: string
  hidden: boolean
  noteId?: string
  gatheringId?: string
  gatheringTitle?: string
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'public', label: '公開留言' },
  { id: 'private', label: '私人心得' },
  { id: 'gathering', label: '來自聚會' },
]

function taipeiDate(iso: string): string {
  const time = new Date(iso)
  if (Number.isNaN(time.getTime())) return ''
  return time.toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' })
}

// 我所有的遊戲公開留言（含被隱藏的）
function useMyAllGameNotes() {
  const [state, setState] = useState<{ rows: GameNoteRow[]; error: boolean } | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    supabase.rpc('get_my_all_game_notes').then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('讀取我的遊戲留言失敗：', error)
        setState({ rows: [], error: true })
        return
      }
      setState({ rows: (data ?? []) as GameNoteRow[], error: false })
    })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])
  return {
    loading: state === null,
    error: state?.error ?? false,
    rows: state?.rows ?? [],
    reload,
  }
}

function explain(message: string): string {
  if (message.includes('too long')) return '留言最多 200 字。'
  if (message.includes('empty')) return '請先輸入留言內容。'
  if (message.includes('not found')) return '找不到這則留言，可能已被刪除。'
  return '操作失敗：' + message
}

// 俱樂部「我的心得」：我留下的公開留言、私人心得與聚會心得（只讀原紀錄，不另存副本）
export default function MyNotes({
  boardGames,
  renderCover,
  onBack,
  onClose,
  onOpenGathering,
  onOpenAddPlay,
  onOpenWriteGathering,
}: {
  boardGames: ListedGame[]
  renderCover: (game: BoardGame) => ReactNode
  onBack: () => void
  onClose: () => void
  onOpenGathering: (gatheringId: string) => void
  onOpenAddPlay: () => void
  onOpenWriteGathering: () => void
}) {
  const gatheringNotes = useAllMyNotes()
  const gameNotes = useMyAllGameNotes()
  const gatherings = useMyGatherings()
  const [filter, setFilter] = useState<Filter>('all')
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [editKey, setEditKey] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [message, setMessage] = useState('')

  const gameByName = useMemo(() => {
    const map = new Map<string, ListedGame>()
    for (const game of boardGames) map.set(game.bggName, game)
    return map
  }, [boardGames])

  const items = useMemo(() => {
    const gatheringById = new Map(gatherings.rows.map((row) => [row.id, row]))
    const list: Item[] = []

    for (const row of gameNotes.rows) {
      const content = (row.content ?? '').trim()
      if (!content) continue
      list.push({
        key: `game|${row.id}`,
        kind: 'game',
        bggName: row.bgg_name,
        date: taipeiDate(row.created_at),
        content: row.content ?? '',
        hidden: row.status === 'hidden',
        noteId: row.id,
      })
    }

    for (const row of gatheringNotes.rows) {
      const gathering = gatheringById.get(row.gatheringId)
      const base = {
        bggName: row.bggName,
        date: gathering?.gatheredOn ?? '',
        gatheringId: row.gatheringId,
        gatheringTitle: gathering?.title ?? '聚會',
      }
      if (row.privateNote.trim() !== '') {
        list.push({
          ...base,
          key: `gprivate|${row.gatheringId}|${row.bggName}`,
          kind: 'gprivate',
          content: row.privateNote,
          hidden: false,
        })
      }
      if (row.publicNote.trim() !== '') {
        list.push({
          ...base,
          key: `gpublic|${row.gatheringId}|${row.bggName}`,
          kind: 'gpublic',
          content: row.publicNote,
          hidden: row.publicStatus === 'hidden',
        })
      }
    }

    // 日期新到舊；沒有日期的排最後
    return list.sort((a, b) => {
      if (a.date === b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return b.date.localeCompare(a.date)
    })
  }, [gameNotes.rows, gatheringNotes.rows, gatherings.rows])

  const shown = useMemo(() => {
    if (filter === 'public') return items.filter((i) => i.kind !== 'gprivate')
    if (filter === 'private') return items.filter((i) => i.kind === 'gprivate')
    if (filter === 'gathering') return items.filter((i) => i.kind !== 'game')
    return items
  }, [items, filter])

  const loading = gatheringNotes.loading || gameNotes.loading || gatherings.loading
  const failed = gatheringNotes.error || gameNotes.error || gatherings.error

  function reloadAll() {
    gatheringNotes.reload()
    gameNotes.reload()
    gatherings.reload()
  }

  async function removeItem(item: Item) {
    const question =
      item.kind === 'gprivate' ? '要刪除這則私人心得嗎？' : '要刪除這則公開留言嗎？刪除後無法復原。'
    if (!(await askConfirm(question))) return
    setBusyKey(item.key)
    setMessage('')

    if (item.kind === 'game') {
      const { error } = await supabase.rpc('delete_my_public_note', { p_note: item.noteId })
      setBusyKey(null)
      if (error) {
        setMessage(explain(error.message))
        return
      }
      gameNotes.reload()
      return
    }

    // 場次心得：只清掉這一欄，另一欄原樣傳回；兩欄都空會整則刪除
    const row = gatheringNotes.rows.find(
      (r) => r.gatheringId === item.gatheringId && r.bggName === item.bggName,
    )
    if (!row || !item.gatheringId) {
      setBusyKey(null)
      setMessage('找不到這則心得，請重新讀取。')
      return
    }
    const result = await saveGatheringNote(
      item.gatheringId,
      item.bggName,
      item.kind === 'gprivate' ? '' : row.privateNote,
      item.kind === 'gpublic' ? '' : row.publicNote,
    )
    setBusyKey(null)
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    gatheringNotes.reload()
  }

  async function saveEdit(item: Item) {
    if (item.kind !== 'game') return
    const text = draft.trim()
    if (!text) {
      setMessage('請先輸入留言內容。')
      return
    }
    setBusyKey(item.key)
    setMessage('')
    const { error } = await supabase.rpc('update_my_game_note', {
      p_note: item.noteId,
      p_content: text,
    })
    setBusyKey(null)
    if (error) {
      setMessage(explain(error.message))
      return
    }
    setEditKey(null)
    gameNotes.reload()
  }

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
          <div className="mh-top">
            <button type="button" className="mh-add" onClick={onOpenWriteGathering}>
              ＋ 寫聚會心得
            </button>
            <button type="button" className="mh-add" onClick={onOpenAddPlay}>
              ＋ 新增遊玩紀錄
            </button>
          </div>

          <div className="mh-filters" role="tablist" aria-label="心得分類">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                className={`mh-chip ${filter === item.id ? 'on' : ''}`}
                onClick={() => {
                  setFilter(item.id)
                  setEditKey(null)
                  setMessage('')
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {message && <p className="mh-error">{message}</p>}

          {loading ? (
            <p className="mylist-empty">讀取中…</p>
          ) : (
            <>
              {failed && (
                <div className="mh-fail">
                  <p>有部分心得讀取失敗，下面的清單可能不完整。</p>
                  <button type="button" className="mylist-browse" onClick={reloadAll}>
                    重新讀取
                  </button>
                </div>
              )}
              {shown.length === 0 ? (
                <p className="mylist-empty">
                  {items.length === 0 ? '還沒有心得。' : '這個分類還沒有內容。'}
                </p>
              ) : (
                <ul className="mh-list">
                  {shown.map((item) => {
                    const game = gameByName.get(item.bggName) ?? null
                    const isPublic = item.kind !== 'gprivate'
                    const editing = editKey === item.key
                    const busy = busyKey === item.key
                    return (
                      <li className="mh-item" key={item.key}>
                        <div className="mh-head">
                          <div className="mylist-thumb mh-thumb">
                            {game ? renderCover(game) : <span aria-hidden="true">🎲</span>}
                          </div>
                          <div className="mh-headtext">
                            <b className="mh-title">《{game?.name ?? item.bggName}》</b>
                            <span className="mh-date">
                              {item.date ? item.date.replace(/-/g, '/') : '日期不明'}
                            </span>
                          </div>
                          <span className={`mh-badge ${isPublic ? 'pub' : 'pri'}`}>
                            {isPublic ? '公開留言' : '私人心得'}
                          </span>
                        </div>

                        {editing ? (
                          <>
                            <textarea
                              className="mh-textarea"
                              rows={3}
                              maxLength={200}
                              value={draft}
                              onChange={(event) => setDraft(event.target.value)}
                            />
                            <div className="mh-actions">
                              <span className="mh-count">{draft.length} / 200</span>
                              <button
                                type="button"
                                className="mh-link"
                                disabled={busy}
                                onClick={() => setEditKey(null)}
                              >
                                取消
                              </button>
                              <button
                                type="button"
                                className="mh-save"
                                disabled={busy || draft.trim() === ''}
                                onClick={() => void saveEdit(item)}
                              >
                                {busy ? '儲存中…' : '儲存'}
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="mh-content">{item.content}</p>
                            {item.hidden && (
                              <p className="mh-hidden">
                                這則留言已被管理者隱藏，只有你和管理者看得到。
                              </p>
                            )}
                            <p className="mh-source">
                              {item.kind === 'game' && '發布於：遊戲詳細資料 → 討論'}
                              {item.kind === 'gpublic' &&
                                `發布於：遊戲討論（寫於聚會「${item.gatheringTitle}」）`}
                              {item.kind === 'gprivate' &&
                                `關聯場次：${item.gatheringTitle}`}
                            </p>
                            <div className="mh-actions">
                              {item.kind === 'game' ? (
                                <button
                                  type="button"
                                  className="mh-link"
                                  disabled={busy}
                                  onClick={() => {
                                    setMessage('')
                                    setDraft(item.content)
                                    setEditKey(item.key)
                                  }}
                                >
                                  編輯
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="mh-link"
                                  onClick={() => onOpenGathering(item.gatheringId ?? '')}
                                >
                                  到這場聚會編輯 ›
                                </button>
                              )}
                              <button
                                type="button"
                                className="mh-link mh-danger"
                                disabled={busy}
                                onClick={() => void removeItem(item)}
                              >
                                {busy ? '處理中…' : '刪除'}
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  )
}
