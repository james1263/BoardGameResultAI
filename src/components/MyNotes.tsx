import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import { saveGatheringNote, useAllMyNotes } from '../lib/useGatheringNotes'
import { useMyGatherings } from '../lib/useMyGatherings'
import { supabase } from '../lib/supabase'
import NoteListItem from './NoteListItem'
import NotePointsFields from './NotePointsFields'
import '../styles/my-notes.css'
import { askConfirm } from '../lib/askConfirm'
import NoteForm, { type NoteKind } from './NoteForm'
import type { PersonalApi } from '../lib/personalApi'
import type { RatingsApi } from '../lib/useGameRatings'

type ListedGame = BoardGame & { removedAt?: string | null }

type GameNoteRow = {
  id: string
  bgg_name: string
  content: string | null
  status: string | null
  created_at: string
  like_point: string | null
  dislike_point: string | null
  like_count?: number | null
}

type Filter = 'all' | 'public' | 'private' | 'gathering'

// game：遊戲公開留言（沒標場次）；gathering：某場聚會的心得（私人＋公開兩欄合成一列）；
// overall：這款的整體心得（沒標場次的私人心得）
type Item = {
  key: string
  kind: 'game' | 'gathering' | 'overall'
  bggName: string
  date: string // YYYY-MM-DD，沒有日期是空字串
  pubText: string
  privText: string
  hidden: boolean
  noteId?: string
  like?: string
  dislike?: string
  likeCount?: number
  gatheringId?: string
  gatheringTitle?: string
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'public', label: '公開留言' },
  { id: 'private', label: '私人心得' },
  { id: 'gathering', label: '來自聚會' },
]

type ComposeState = { game: string | null; gid: string | null; kind: NoteKind; nonce: number }

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
  if (message.includes('too long')) return '留言最多 200 字，喜歡／不喜歡的點各最多 100 字。'
  if (message.includes('empty')) return '請先輸入留言內容。'
  if (message.includes('not found')) return '找不到這則留言，可能已被刪除。'
  return '操作失敗：' + message
}

// 俱樂部「我的心得」：寫心得／留言的唯一入口，下面列出我寫過的留言與心得
export default function MyNotes({
  boardGames,
  renderCover,
  onBack,
  onClose,
  focusGame = null,
  writeRequest = null,
  composer,
}: {
  boardGames: ListedGame[]
  renderCover: (game: BoardGame) => ReactNode
  onBack: () => void
  onClose: () => void
  // 從遊戲視窗進來：只看這一款（可按 × 取消）
  focusGame?: string | null
  // 一進來就打開寫作畫面：帶遊戲（遊戲視窗）或帶場次（我的場次）
  writeRequest?: { bggName: string | null; gatheringId: string | null } | null
  composer?: { personal: PersonalApi; ratings: RatingsApi; isAdmin: boolean; canPublic: boolean }
}) {
  const gatheringNotes = useAllMyNotes()
  const gameNotes = useMyAllGameNotes()
  const gatherings = useMyGatherings()
  const [filter, setFilter] = useState<Filter>('all')
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [editKey, setEditKey] = useState<string | null>(null)
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [draftLike, setDraftLike] = useState('')
  const [draftDislike, setDraftDislike] = useState('')
  const [message, setMessage] = useState('')
  const [focus, setFocus] = useState<string | null>(focusGame)
  const [compose, setCompose] = useState<ComposeState | null>(
    writeRequest
      ? {
          game: writeRequest.bggName,
          gid: writeRequest.gatheringId,
          kind: 'private',
          nonce: 0,
        }
      : null,
  )
  const topRef = useRef<HTMLDivElement | null>(null)

  const gameByName = useMemo(() => {
    const map = new Map<string, ListedGame>()
    for (const game of boardGames) map.set(game.bggName, game)
    return map
  }, [boardGames])

  const personalEntries = composer?.personal.entries

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
        pubText: row.content ?? '',
        privText: '',
        hidden: row.status === 'hidden',
        noteId: row.id,
        like: row.like_point ?? '',
        dislike: row.dislike_point ?? '',
        likeCount: Number(row.like_count ?? 0),
      })
    }

    for (const row of gatheringNotes.rows) {
      const pubText = row.publicNote.trim() !== '' ? row.publicNote : ''
      const privText = row.privateNote.trim() !== '' ? row.privateNote : ''
      if (!pubText && !privText) continue
      const gathering = gatheringById.get(row.gatheringId)
      list.push({
        key: `gathering|${row.gatheringId}|${row.bggName}`,
        kind: 'gathering',
        bggName: row.bggName,
        date: gathering?.gatheredOn ?? '',
        gatheringId: row.gatheringId,
        gatheringTitle: gathering?.title ?? '聚會',
        pubText,
        privText,
        hidden: pubText !== '' && row.publicStatus === 'hidden',
        like: row.likePoint,
        dislike: row.dislikePoint,
      })
    }

    if (personalEntries) {
      for (const [bggName, entry] of Object.entries(personalEntries)) {
        const note = (entry?.note ?? '').trim()
        if (!note) continue
        list.push({
          key: `overall|${bggName}`,
          kind: 'overall',
          bggName,
          date: '',
          pubText: '',
          privText: entry?.note ?? '',
          hidden: false,
        })
      }
    }

    // 日期新到舊；沒有日期的（整體心得）排最後
    return list.sort((a, b) => {
      if (a.date === b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return b.date.localeCompare(a.date)
    })
  }, [gameNotes.rows, gatheringNotes.rows, gatherings.rows, personalEntries])

  const shown = useMemo(() => {
    const base = focus ? items.filter((i) => i.bggName === focus) : items
    if (filter === 'public') return base.filter((i) => i.pubText !== '')
    if (filter === 'private') return base.filter((i) => i.privText !== '')
    if (filter === 'gathering') return base.filter((i) => i.kind === 'gathering')
    return base
  }, [items, filter, focus])

  const loading = gatheringNotes.loading || gameNotes.loading || gatherings.loading
  const failed = gatheringNotes.error || gameNotes.error || gatherings.error

  function reloadAll() {
    gatheringNotes.reload()
    gameNotes.reload()
    gatherings.reload()
  }

  function openCompose(next: Omit<ComposeState, 'nonce'>) {
    setCompose((current) => ({ ...next, nonce: (current?.nonce ?? 0) + 1 }))
    window.setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  async function removeItem(item: Item, part: 'pub' | 'priv') {
    const question =
      part === 'priv' ? '要刪除這則私人心得嗎？' : '要刪除這則公開留言嗎？刪除後無法復原。'
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

    if (item.kind === 'overall') {
      if (!composer?.personal.canEdit) {
        setBusyKey(null)
        setMessage('目前無法刪除，請稍後再試。')
        return
      }
      composer.personal.updateEntry(item.bggName, { note: '' })
      setBusyKey(null)
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
      part === 'priv' ? '' : row.privateNote,
      part === 'pub' ? '' : row.publicNote,
      part === 'pub' ? '' : row.likePoint,
      part === 'pub' ? '' : row.dislikePoint,
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
      p_like: draftLike.trim(),
      p_dislike: draftDislike.trim(),
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
          <div className="mh-top" ref={topRef}>
            {composer && (
              <button
                type="button"
                className="mh-add"
                aria-expanded={compose !== null}
                onClick={() =>
                  compose
                    ? setCompose(null)
                    : openCompose({ game: focus, gid: null, kind: 'private' })
                }
              >
                ＋ 寫心得／留言
              </button>
            )}
          </div>

          {composer && compose && (
            <NoteForm
              key={`${compose.game ?? ''}|${compose.gid ?? ''}|${compose.nonce}`}
              games={boardGames}
              personal={composer.personal}
              ratings={composer.ratings}
              isAdmin={composer.isAdmin}
              canPublic={composer.canPublic}
              initialGame={compose.game ? (gameByName.get(compose.game) ?? null) : null}
              initialGatheringId={compose.gid}
              initialKind={compose.kind}
              renderCover={renderCover}
              onSaved={reloadAll}
              onCancel={() => setCompose(null)}
            />
          )}

          {focus && (
            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#34463c' }}>
              只看《{gameByName.get(focus)?.name ?? focus}》的心得{' '}
              <button
                type="button"
                aria-label="看全部心得"
                style={{
                  border: '1px solid #cdbf9f',
                  borderRadius: 999,
                  background: '#fbf7ec',
                  color: '#34463c',
                  padding: '0 8px',
                  cursor: 'pointer',
                }}
                onClick={() => setFocus(null)}
              >
                ×
              </button>
            </p>
          )}
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
                  {items.length === 0
                    ? '還沒有心得。按上面的「寫心得／留言」開始寫。'
                    : focus && !items.some((i) => i.bggName === focus)
                      ? '這款還沒有心得。按上面的「寫心得／留言」來寫。'
                      : '這個分類還沒有內容。'}
                </p>
              ) : (
                <ul className="nl-list">
                  {shown.map((item) => {
                    const game = gameByName.get(item.bggName) ?? null
                    const editing = editKey === item.key
                    const busy = busyKey === item.key
                    const both = item.pubText !== '' && item.privText !== ''
                    const primary = item.pubText !== '' ? item.pubText : item.privText
                    const dateText =
                      item.kind === 'overall'
                        ? '整體心得'
                        : item.date
                          ? item.date.replace(/-/g, '/')
                          : '日期不明'
                    return (
                      <NoteListItem
                        key={item.key}
                        name={`《${game?.name ?? item.bggName}》`}
                        date={dateText}
                        badge={
                          <>
                            {item.pubText !== '' && <span className="mh-badge pub">留言</span>}
                            {item.privText !== '' && <span className="mh-badge pri">心得</span>}
                          </>
                        }
                        thumb={game ? renderCover(game) : <span aria-hidden="true">🎲</span>}
                        content={primary}
                        hideText={editing}
                        like={item.pubText !== '' ? item.like : undefined}
                        dislike={item.pubText !== '' ? item.dislike : undefined}
                        likeCount={
                          item.kind === 'game' && !item.hidden ? item.likeCount : undefined
                        }
                        open={editing || openKey === item.key}
                        onToggle={() => {
                          if (editing) return
                          setOpenKey(openKey === item.key ? null : item.key)
                        }}
                      >
                        {editing ? (
                          <>
                            <textarea
                              className="mh-textarea"
                              rows={3}
                              maxLength={200}
                              value={draft}
                              onChange={(event) => setDraft(event.target.value)}
                            />
                            <NotePointsFields
                              like={draftLike}
                              dislike={draftDislike}
                              onLike={setDraftLike}
                              onDislike={setDraftDislike}
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
                            {item.hidden && (
                              <p className="mh-hidden">
                                這則留言已被管理者隱藏，只有你和管理者看得到。
                              </p>
                            )}
                            {both && (
                              <p className="mh-source">🔒 私人心得：{item.privText}</p>
                            )}
                            <p className="mh-source">
                              {item.kind === 'game' && '一般留言（沒有標場次）'}
                              {item.kind === 'gathering' && `🏷 場次：${item.gatheringTitle}`}
                              {item.kind === 'overall' && '這款的整體心得（沒有標場次）'}
                            </p>
                            <div className="mh-actions">
                              {item.kind === 'game' ? (
                                <button
                                  type="button"
                                  className="mh-link"
                                  disabled={busy}
                                  onClick={() => {
                                    setMessage('')
                                    setDraft(item.pubText)
                                    setDraftLike(item.like ?? '')
                                    setDraftDislike(item.dislike ?? '')
                                    setEditKey(item.key)
                                  }}
                                >
                                  編輯
                                </button>
                              ) : composer ? (
                                <button
                                  type="button"
                                  className="mh-link"
                                  onClick={() =>
                                    openCompose({
                                      game: item.bggName,
                                      gid: item.gatheringId ?? null,
                                      kind: item.pubText !== '' ? 'public' : 'private',
                                    })
                                  }
                                >
                                  編輯
                                </button>
                              ) : null}
                              {item.pubText !== '' && (
                                <button
                                  type="button"
                                  className="mh-link mh-danger"
                                  disabled={busy}
                                  onClick={() => void removeItem(item, 'pub')}
                                >
                                  {busy ? '處理中…' : both ? '刪除留言' : '刪除'}
                                </button>
                              )}
                              {item.privText !== '' && (
                                <button
                                  type="button"
                                  className="mh-link mh-danger"
                                  disabled={busy}
                                  onClick={() => void removeItem(item, 'priv')}
                                >
                                  {busy ? '處理中…' : both ? '刪除心得' : '刪除'}
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </NoteListItem>
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
