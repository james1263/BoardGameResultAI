import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import { saveGatheringNote, useAllMyNotes } from '../lib/useGatheringNotes'
import { askConfirm } from '../lib/askConfirm'
import { useMyGatherings } from '../lib/useMyGatherings'
import { supabase } from '../lib/supabase'
import NoteListItem from './NoteListItem'
import '../styles/my-notes.css'
import '../styles/my-notes-manage.css'
import NoteForm, { type MyGameNote, type NoteKind } from './NoteForm'
import type { PersonalApi } from '../lib/personalApi'
import type { RatingsApi } from '../lib/useGameRatings'

type ListedGame = BoardGame & { removedAt?: string | null }

type GameNoteRow = MyGameNote & {
  status: string | null
  like_count?: number | null
}

type Filter = 'all' | 'public' | 'private' | 'gathering'
type Tab = 'games' | 'records'
type GFilter = 'all' | 'noteDone' | 'noteTodo' | 'pubDone' | 'pubTodo'
type GScope = 'played' | 'all'

const G_FILTERS: { id: GFilter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'noteDone', label: '已寫心得' },
  { id: 'noteTodo', label: '未寫心得' },
  { id: 'pubDone', label: '已留言' },
  { id: 'pubTodo', label: '未留言' },
]

function normalizeName(text: string): string {
  return text.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '')
}

// game：遊戲公開留言（沒標場次）；gathering：某場聚會的心得（私人＋公開兩欄合成一列）；
// overall：這款的整體心得（沒標場次的私人心得）
type Item = {
  key: string
  kind: 'game' | 'gathering' | 'overall'
  bggName: string
  date: string // YYYY-MM-DD，沒有日期是空字串
  sortKey: string // 排序用的時間（越新越大）；沒有時間是空字串
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

type ComposeState = {
  game: string | null
  gid: string | null
  kind: NoteKind
  noteId: string | null
  overall: boolean
  nonce: number
}

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

// 每款遊戲「我的整體心得」的最後更新時間（排序用；user_game_status 只讀得到自己的列）
function useStatusTimes() {
  const [map, setMap] = useState<Record<string, string>>({})
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('user_game_status')
      .select('bgg_name, updated_at')
      .then(({ data, error }) => {
        if (cancelled || error) return
        const next: Record<string, string> = {}
        for (const row of (data ?? []) as { bgg_name: string; updated_at: string | null }[]) {
          if (row.updated_at) next[row.bgg_name] = row.updated_at
        }
        setMap(next)
      })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])
  return { map, reload }
}

// 俱樂部「我的心得」：寫心得／留言的唯一入口。
// 兩個分頁：遊戲管理（每款遊戲一列，看哪些還沒寫）、發表紀錄（我寫過的，點一則回到寫作畫面修改）
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
  const statusTimes = useStatusTimes()
  const gatherings = useMyGatherings()
  const [filter, setFilter] = useState<Filter>('all')
  // 有 composer 才有「遊戲管理」；從遊戲視窗或我的場次進來時先看「發表紀錄」
  const [tab, setTab] = useState<Tab>(composer && !focusGame && !writeRequest ? 'games' : 'records')
  const [gFilter, setGFilter] = useState<GFilter>('all')
  const [gScope, setGScope] = useState<GScope>('played')
  const [gSearch, setGSearch] = useState('')
  const [rSearch, setRSearch] = useState('')
  const [newestFirst, setNewestFirst] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [focus, setFocus] = useState<string | null>(focusGame)
  const [compose, setCompose] = useState<ComposeState | null>(
    writeRequest
      ? {
          game: writeRequest.bggName,
          gid: writeRequest.gatheringId,
          kind: 'private',
          noteId: null,
          overall: false,
          nonce: 0,
        }
      : null,
  )
  const [deletingKey, setDeletingKey] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')
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
        sortKey: row.created_at ?? '',
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
      const gDate = gathering?.gatheredOn ?? ''
      list.push({
        key: `gathering|${row.gatheringId}|${row.bggName}`,
        kind: 'gathering',
        bggName: row.bggName,
        date: gDate,
        sortKey: row.updatedAt || (gDate ? `${gDate}T00:00:00` : ''),
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
          sortKey: statusTimes.map[bggName] ?? '',
          pubText: '',
          privText: entry?.note ?? '',
          hidden: false,
        })
      }
    }

    return list
  }, [gameNotes.rows, gatheringNotes.rows, gatherings.rows, personalEntries, statusTimes.map])

  // 發表紀錄：搜尋遊戲、類型、指定遊戲，最後依時間排序（預設新到舊）
  const shown = useMemo(() => {
    const query = normalizeName(rSearch)
    let list = focus ? items.filter((i) => i.bggName === focus) : items
    if (filter === 'public') list = list.filter((i) => i.pubText !== '')
    if (filter === 'private') list = list.filter((i) => i.privText !== '')
    if (filter === 'gathering') list = list.filter((i) => i.kind === 'gathering')
    if (query) {
      list = list.filter(
        (i) =>
          normalizeName(gameByName.get(i.bggName)?.name ?? '').includes(query) ||
          normalizeName(i.bggName).includes(query),
      )
    }
    return [...list].sort((a, b) => {
      if (a.sortKey === b.sortKey) return 0
      if (!a.sortKey) return 1
      if (!b.sortKey) return -1
      return newestFirst ? b.sortKey.localeCompare(a.sortKey) : a.sortKey.localeCompare(b.sortKey)
    })
  }, [items, filter, focus, rSearch, newestFirst, gameByName])

  // 篩選面板裡「有寫過心得／留言的遊戲」
  const recordGames = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of items) counts.set(item.bggName, (counts.get(item.bggName) ?? 0) + 1)
    return Array.from(counts.entries())
      .map(([bggName, count]) => ({
        bggName,
        count,
        name: gameByName.get(bggName)?.name ?? bggName,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
  }, [items, gameByName])

  const activeFilterCount = (filter !== 'all' ? 1 : 0) + (focus ? 1 : 0)

  // 遊戲管理：每款遊戲一列。心得 ✓＝有整體心得或任一場聚會的私人心得；
  // 留言 ✓＝有任何公開留言（標不標場次都算）；沒玩過、沒評分過的遊戲不能留言（管理者例外）
  const gameRows = useMemo(() => {
    if (!composer) return []
    const hasPriv = new Set<string>()
    const hasPub = new Set<string>()
    for (const item of items) {
      if (item.privText !== '') hasPriv.add(item.bggName)
      if (item.pubText !== '') hasPub.add(item.bggName)
    }
    return boardGames
      .filter((game) => !game.removedAt && !(game as { referenceOnly?: boolean }).referenceOnly)
      .map((game) => {
        const played =
          composer.personal.getEntry(game.bggName).played ||
          composer.ratings.getMine(game.bggName) !== null
        const note = hasPriv.has(game.bggName)
        const pub = hasPub.has(game.bggName)
        const canPub = played || composer.isAdmin
        return { game, played, note, pub, canPub, touched: note || pub }
      })
      .sort((a, b) => a.game.name.localeCompare(b.game.name, 'zh-Hant'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composer, items, boardGames, composer?.personal.entries, composer?.ratings])

  const scopedGameRows = useMemo(
    () => (gScope === 'played' ? gameRows.filter((row) => row.played || row.touched) : gameRows),
    [gameRows, gScope],
  )

  const gCounts = useMemo(
    () => ({
      all: scopedGameRows.length,
      noteDone: scopedGameRows.filter((row) => row.note).length,
      noteTodo: scopedGameRows.filter((row) => !row.note).length,
      pubDone: scopedGameRows.filter((row) => row.pub).length,
      pubTodo: scopedGameRows.filter((row) => !row.pub && row.canPub).length,
    }),
    [scopedGameRows],
  )

  const shownGameRows = useMemo(() => {
    const query = normalizeName(gSearch)
    return scopedGameRows.filter((row) => {
      if (gFilter === 'noteDone' && !row.note) return false
      if (gFilter === 'noteTodo' && row.note) return false
      if (gFilter === 'pubDone' && !row.pub) return false
      if (gFilter === 'pubTodo' && (row.pub || !row.canPub)) return false
      if (!query) return true
      return (
        normalizeName(row.game.name).includes(query) ||
        normalizeName(row.game.bggName).includes(query)
      )
    })
  }, [scopedGameRows, gFilter, gSearch])

  const loading = gatheringNotes.loading || gameNotes.loading || gatherings.loading
  const failed = gatheringNotes.error || gameNotes.error || gatherings.error

  function reloadAll() {
    gatheringNotes.reload()
    gameNotes.reload()
    gatherings.reload()
    statusTimes.reload()
  }

  // 直接在清單上刪除一則紀錄（不用點進去）
  async function deleteItem(item: Item) {
    if (!composer || deletingKey) return
    const both = item.pubText !== '' && item.privText !== ''
    const message =
      item.kind === 'gathering' && both
        ? '要刪除這場聚會的留言和心得嗎？兩則都會刪除，無法復原。'
        : item.kind === 'overall'
          ? '要刪除這款的整體心得嗎？刪除後無法復原。'
          : item.pubText !== ''
            ? '要刪除這則公開留言嗎？刪除後無法復原。'
            : '要刪除這則心得嗎？刪除後無法復原。'
    if (!(await askConfirm(message))) return
    setDeletingKey(item.key)
    setDeleteError('')
    try {
      if (item.kind === 'game' && item.noteId) {
        const { error } = await supabase.rpc('delete_my_public_note', { p_note: item.noteId })
        if (error) {
          setDeleteError('刪除失敗：' + error.message)
          return
        }
      } else if (item.kind === 'gathering' && item.gatheringId) {
        const result = await saveGatheringNote(item.gatheringId, item.bggName, '', '', '', '')
        if (!result.ok) {
          setDeleteError(result.message)
          return
        }
      } else if (item.kind === 'overall') {
        if (!composer.personal.canEdit) {
          setDeleteError('目前無法刪除，請稍後再試。')
          return
        }
        composer.personal.updateEntry(item.bggName, { note: '' })
      }
      // 如果正在編輯的就是這一則，一併收起寫作畫面
      setCompose((current) =>
        current &&
        current.game === item.bggName &&
        (current.noteId === (item.noteId ?? null) || current.gid === (item.gatheringId ?? null))
          ? null
          : current,
      )
      reloadAll()
    } finally {
      setDeletingKey(null)
    }
  }

  function openCompose(next: Omit<ComposeState, 'nonce'>) {
    setCompose((current) => ({ ...next, nonce: (current?.nonce ?? 0) + 1 }))
    window.setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  return (
    <>
      <div className="mylist-backdrop" onClick={onClose} />
      <aside className="mylist-drawer" role="dialog" aria-label="我的心得">
        <div className="mylist-header mn-header">
          <h2>我的心得</h2>
          {composer && (
            <button
              type="button"
              className="mh-add mh-add-head"
              aria-expanded={compose !== null}
              onClick={() =>
                compose
                  ? setCompose(null)
                  : openCompose({
                      game: focus,
                      gid: null,
                      kind: 'private',
                      noteId: null,
                      overall: false,
                    })
              }
            >
              ＋ 寫心得／留言
            </button>
          )}
          <button className="mylist-close" type="button" aria-label="關閉" onClick={onBack}>
            ×
          </button>
        </div>

        <div className="mylist-body">
          <div ref={topRef} />

          {composer && compose && (
            <NoteForm
              key={`${compose.game ?? ''}|${compose.gid ?? ''}|${compose.noteId ?? ''}|${compose.overall ? 1 : 0}|${compose.nonce}`}
              games={boardGames}
              personal={composer.personal}
              ratings={composer.ratings}
              isAdmin={composer.isAdmin}
              canPublic={composer.canPublic}
              initialGame={compose.game ? (gameByName.get(compose.game) ?? null) : null}
              initialGatheringId={compose.gid}
              initialKind={compose.kind}
              initialNoteId={compose.noteId}
              initialOverall={compose.overall}
              myGameNotes={{ loading: gameNotes.loading, rows: gameNotes.rows }}
              renderCover={renderCover}
              onSaved={reloadAll}
              onCancel={() => setCompose(null)}
            />
          )}

          {composer && (
            <div className="mg-tabs" role="tablist" aria-label="我的心得分頁">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'games'}
                className={tab === 'games' ? 'on' : ''}
                onClick={() => setTab('games')}
              >
                遊戲管理
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'records'}
                className={tab === 'records' ? 'on' : ''}
                onClick={() => setTab('records')}
              >
                發表紀錄
              </button>
            </div>
          )}

          {composer && tab === 'games' && (
            <div className="mg-games">
              {loading ? (
                <p className="mylist-empty">讀取中…</p>
              ) : (
                <>
                  <input
                    type="search"
                    className="mg-search"
                    placeholder="搜尋遊戲名稱（中文或英文）"
                    value={gSearch}
                    onChange={(event) => setGSearch(event.target.value)}
                  />
                  <div className="mg-chips" role="tablist" aria-label="遊戲篩選">
                    {G_FILTERS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={gFilter === item.id}
                        className={`mg-chip ${gFilter === item.id ? 'on' : ''}`}
                        onClick={() => setGFilter(item.id)}
                      >
                        <span>{item.label}</span>
                        <small>{gCounts[item.id]}</small>
                      </button>
                    ))}
                  </div>
                  <div className="mg-scope">
                    <span>顯示 {shownGameRows.length} 款</span>
                    <span className="mg-scope-btns">
                      <button
                        type="button"
                        className={gScope === 'played' ? 'on' : ''}
                        onClick={() => setGScope('played')}
                      >
                        已玩的遊戲
                      </button>
                      <button
                        type="button"
                        className={gScope === 'all' ? 'on' : ''}
                        onClick={() => setGScope('all')}
                      >
                        全部桌遊
                      </button>
                    </span>
                  </div>
                  {shownGameRows.length === 0 ? (
                    <p className="mylist-empty">
                      {gScope === 'played' && gameRows.length > 0 && scopedGameRows.length === 0
                        ? '還沒有標為已玩的遊戲。切到「全部桌遊」就能直接寫心得。'
                        : '這個分類沒有符合的遊戲。'}
                    </p>
                  ) : (
                    <ul className="mg-list">
                      {shownGameRows.map((row) => (
                        <li key={row.game.bggName}>
                          <button
                            type="button"
                            className="mg-row"
                            onClick={() =>
                              openCompose({
                                game: row.game.bggName,
                                gid: null,
                                kind: 'private',
                                noteId: null,
                                overall: false,
                              })
                            }
                          >
                            <span className="mg-thumb">{renderCover(row.game)}</span>
                            <span className="mg-main">
                              <span className="mg-name">{row.game.name}</span>
                              <span className="mg-tags">
                                <span className={`mg-tag ${row.note ? 'ok' : 'todo'}`}>
                                  {row.note ? '心得 ✓' : '心得未填'}
                                </span>
                                <span
                                  className={`mg-tag ${row.pub ? 'ok' : row.canPub ? 'todo' : 'off'}`}
                                >
                                  {row.pub ? '留言 ✓' : row.canPub ? '留言未填' : '不可留言'}
                                </span>
                              </span>
                            </span>
                            <span className="mg-go" aria-hidden="true">
                              ›
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mg-hint">
                    點一款遊戲就能寫新的心得或留言；要看或修改以前寫的，請到「發表紀錄」。沒玩過的遊戲只能寫私人心得。
                  </p>
                </>
              )}
            </div>
          )}

          {(!composer || tab === 'records') && (
            <>
              <div className="mr-bar">
                <div className="mr-search">
                  <input
                    type="search"
                    placeholder="搜尋遊戲名稱"
                    value={rSearch}
                    onChange={(event) => setRSearch(event.target.value)}
                  />
                  <button
                    type="button"
                    className={`mr-filterbtn ${filterOpen ? 'on' : ''}`}
                    aria-expanded={filterOpen}
                    onClick={() => setFilterOpen((value) => !value)}
                  >
                    ☰ 篩選{activeFilterCount > 0 && <b>{activeFilterCount}</b>}
                  </button>
                </div>
                <button
                  type="button"
                  className="mr-sort"
                  onClick={() => setNewestFirst((value) => !value)}
                >
                  {newestFirst ? '新→舊' : '舊→新'}
                </button>
              </div>

              {filterOpen && (
                <div className="mr-panel">
                  <p className="mr-panel-title">類型</p>
                  <div className="mr-panel-chips" role="tablist" aria-label="心得分類">
                    {FILTERS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={filter === item.id}
                        className={`mr-pchip ${filter === item.id ? 'on' : ''}`}
                        onClick={() => setFilter(item.id)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <p className="mr-panel-title">遊戲（寫過心得或留言的）</p>
                  <div className="mr-panel-chips">
                    {recordGames.length === 0 ? (
                      <span className="mr-panel-empty">還沒有紀錄</span>
                    ) : (
                      recordGames.map((item) => (
                        <button
                          key={item.bggName}
                          type="button"
                          className={`mr-pchip ${focus === item.bggName ? 'on' : ''}`}
                          onClick={() => setFocus(focus === item.bggName ? null : item.bggName)}
                        >
                          {item.name} {item.count}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {focus && (
                <p className="mr-active">
                  只看《{gameByName.get(focus)?.name ?? focus}》的紀錄{' '}
                  <button type="button" aria-label="看全部紀錄" onClick={() => setFocus(null)}>
                    ×
                  </button>
                </p>
              )}

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
                  {deleteError && <p className="mh-fail">{deleteError}</p>}
                  {shown.length === 0 ? (
                    <p className="mylist-empty">
                      {items.length === 0
                        ? '還沒有紀錄。按右上角的「寫心得／留言」開始寫。'
                        : '沒有符合的紀錄。'}
                    </p>
                  ) : (
                    <ul className="nl-list">
                      {shown.map((item) => {
                        const game = gameByName.get(item.bggName) ?? null
                        const primary = item.pubText !== '' ? item.pubText : item.privText
                        const thisYear = String(new Date().getFullYear())
                        const gatheringLabel = item.date
                          ? `聚會 ${item.date.startsWith(thisYear) ? item.date.slice(5) : item.date}`.replace(
                              /-/g,
                              '/',
                            )
                          : '聚會'
                        return (
                          <NoteListItem
                            key={item.key}
                            name={`《${game?.name ?? item.bggName}》`}
                            date={item.kind === 'gathering' ? gatheringLabel : '整體'}
                            badge={
                              <>
                                {item.pubText !== '' && <span className="mh-badge pub">留言</span>}
                                {item.privText !== '' && <span className="mh-badge pri">心得</span>}
                                {item.hidden && <span className="mh-badge pri">已隱藏</span>}
                              </>
                            }
                            thumb={game ? renderCover(game) : <span aria-hidden="true">🎲</span>}
                            content={primary}
                            hideText={false}
                            like={item.pubText !== '' ? item.like : undefined}
                            dislike={item.pubText !== '' ? item.dislike : undefined}
                            likeCount={
                              item.kind === 'game' && !item.hidden ? item.likeCount : undefined
                            }
                            open={false}
                            onDelete={composer ? () => void deleteItem(item) : undefined}
                            deleteBusy={deletingKey === item.key}
                            onToggle={() => {
                              if (!composer) return
                              openCompose({
                                game: item.bggName,
                                gid: item.gatheringId ?? null,
                                kind: item.pubText !== '' ? 'public' : 'private',
                                noteId: item.noteId ?? null,
                                overall: item.kind === 'overall',
                              })
                            }}
                          >
                            {null}
                          </NoteListItem>
                        )
                      })}
                    </ul>
                  )}
                  <p className="mg-hint">
                    點一則紀錄，會載入當時的遊戲、場次和內容，可以修改；也可以直接按每則底下的「刪除」。
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  )
}
