import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import type { PersonalApi } from '../lib/personalApi'
import { todayLocal, type PlaySessionsApi } from '../lib/useGamePlaySessions'
import { useAllMyNotes, useMyGatheringNotes, useNoteStatus } from '../lib/useGatheringNotes'
import { useMyGatheringGames } from '../lib/useMyGatheringGames'
import type { RatingsApi } from '../lib/useGameRatings'
import {
  useGatheringDetail,
  useMyGatherings,
  type GatheringAttendee,
  type MyGathering,
} from '../lib/useMyGatherings'
import GatheringNotePanel, { type NoteGame } from './GatheringNotePanel'
import { useBackClose } from '../lib/useBackClose'
import '../styles/my-gatherings-write.css'
import '../styles/my-gatherings-cards.css'
import '../styles/my-gatherings-v2.css'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function dateParts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) {
    return { month: '', day: iso, weekday: '', full: iso }
  }
  const dd = String(d).padStart(2, '0')
  return {
    month: `${m} 月`,
    day: dd,
    weekday: `週${WEEKDAYS[new Date(y, m - 1, d).getDay()]}`,
    full: `${y}/${String(m).padStart(2, '0')}/${dd}`,
  }
}

function sourceLabel(person: GatheringAttendee): string | null {
  if (person.s === 'self') return '自己報到'
  if (person.s === 'admin') return '手動加入'
  return null
}

const PEOPLE_PREVIEW = 6

function GatheringPeople({
  gatheringId,
  isAdmin,
  count,
}: {
  gatheringId: string
  isAdmin: boolean
  count: number
}) {
  const d = useGatheringDetail(gatheringId)
  const [expanded, setExpanded] = useState(false)
  const people = d.detail?.attendees ?? []
  const shown = expanded ? people : people.slice(0, PEOPLE_PREVIEW)
  const hidden = people.length - shown.length
  return (
    <div className="mgv-people">
      <b className="mgv-people-title">出席（{d.detail ? people.length : count}）</b>
      {d.loading ? (
        <small>讀取中…</small>
      ) : d.error || !d.detail ? (
        <small>—</small>
      ) : (
        <ul className="mgv-chips">
          {shown.map((person, index) => (
            <li key={index} className={person.me ? 'me' : ''}>
              {person.n}
              {isAdmin && person.c && person.c !== person.n ? <small>{person.c}</small> : null}
            </li>
          ))}
          {hidden > 0 && (
            <li className="more">
              <button type="button" onClick={() => setExpanded(true)}>
                ＋{hidden}
              </button>
            </li>
          )}
          {expanded && people.length > PEOPLE_PREVIEW && (
            <li className="more">
              <button type="button" onClick={() => setExpanded(false)}>
                收起
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

export default function MyGatherings({
  boardGames,
  personal,
  playSessions,
  ratings,
  isAdmin,
  initialGatheringId,
  onWriteGathering,
  onBack,
  onClose,
  onOpenGame,
  renderCover,
}: {
  boardGames: BoardGame[]
  personal: PersonalApi
  playSessions: PlaySessionsApi
  // 有傳才會把「還沒評分」的遊戲封面變淡
  ratings?: RatingsApi
  isAdmin: boolean
  initialGatheringId?: string | null
  // 點整張場次卡片：到「我的心得」寫這場的心得（有傳才會用；沒傳就進聚會詳情）
  onWriteGathering?: (gatheringId: string, bggName?: string) => void
  onBack: () => void
  onClose: () => void
  onOpenGame: (game: BoardGame) => void
  renderCover: (game: BoardGame) => ReactNode
}) {
  const list = useMyGatherings()
  const [selectedId, setSelectedId] = useState<string | null>(initialGatheringId ?? null)
  // 從清單的「補寫心得」進來時，詳情讀好後要捲到心得區
  const [scrollToNotes, setScrollToNotes] = useState(false)
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({})
  const detail = useGatheringDetail(selectedId)
  const notes = useMyGatheringNotes(selectedId)
  const noteStatus = useNoteStatus()
  // 每場聚會的全部指定遊戲、我在每款遊戲寫過的心得（卡片用）
  const gamesByGathering = useMyGatheringGames()
  const allNotes = useAllMyNotes()
  const noteByKey = useMemo(() => {
    const map = new Map<string, { privateNote: string; publicNote: string }>()
    for (const row of allNotes.rows) map.set(`${row.gatheringId}|${row.bggName}`, row)
    return map
  }, [allNotes.rows])
  const selected = list.rows.find((row) => row.id === selectedId) ?? null
  // 心得區會把「有未存變更」的檢查函式放進來
  const guardRef = useRef<(() => boolean) | null>(null)
  const notesRef = useRef<HTMLDivElement | null>(null)

  const gameByName = useMemo(() => {
    const map = new Map<string, BoardGame>()
    for (const game of boardGames) map.set(game.bggName, game)
    return map
  }, [boardGames])

  const noteGames = useMemo<NoteGame[]>(
    () =>
      (detail.detail?.games ?? []).map((g) => ({
        bggName: g.b,
        name: g.n || g.b,
        game: gameByName.get(g.b) ?? null,
      })),
    [detail.detail, gameByName],
  )

  // 依月份分組：月份新到舊、月份內也是新到舊；沒有場次的月份不會出現
  const groups = useMemo(() => {
    const map = new Map<string, MyGathering[]>()
    for (const row of list.rows) {
      const key = row.gatheredOn.slice(0, 7)
      const rows = map.get(key)
      if (rows) rows.push(row)
      else map.set(key, [row])
    }
    return Array.from(map, ([key, rows]) => ({ key, rows })).sort((a, b) =>
      b.key.localeCompare(a.key),
    )
  }, [list.rows])

  const today = todayLocal()
  const currentMonth = today.slice(0, 7)

  // 預設展開最新一個月與本月，其餘摺疊；點月份標題可切換
  function isMonthOpen(key: string, index: number): boolean {
    return openMonths[key] ?? (index === 0 || key === currentMonth)
  }

  function toggleMonth(key: string, index: number) {
    setOpenMonths((current) => ({
      ...current,
      [key]: !(current[key] ?? (index === 0 || key === currentMonth)),
    }))
  }

  // 詳情 → 清單：有未存的心得會先跳出確認，不直接離開
  function leaveDetail() {
    if (guardRef.current?.()) return
    setSelectedId(null)
    setScrollToNotes(false)
  }

  function handleBack() {
    if (selectedId) leaveDetail()
    else onBack()
  }
  useBackClose(leaveDetail, selectedId !== null)

  const gatheredOn = selected?.gatheredOn ?? ''
  const isFuture = gatheredOn !== '' && gatheredOn > today
  // 管理者可以看全部場次，但只有真的在出席名單上的人才能記錄心得
  const iAmAttendee = detail.detail?.attendees.some((person) => person.me) ?? false
  const blockedReason: string | null = isFuture
    ? '聚會還沒到，聚會當天或之後才能記錄心得。'
    : !iAmAttendee
      ? '你不在這場聚會的出席名單上，所以不能記錄這場的心得。想對這款遊戲留言，請到俱樂部的「留言板」。'
      : notes.error
        ? '心得讀取失敗，請稍後再試。'
        : notes.loading
          ? '心得讀取中…'
          : null

  // 詳情與心得都讀好後，捲到心得區（只捲一次）
  const detailReady = !detail.loading && !detail.error && detail.detail !== null
  useEffect(() => {
    if (!scrollToNotes || !detailReady) return
    const timer = window.setTimeout(() => {
      notesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setScrollToNotes(false)
    }, 60)
    return () => window.clearTimeout(timer)
  }, [scrollToNotes, detailReady])

  return (
    <>
      <div
        className="mylist-backdrop"
        onClick={() => {
          if (selectedId && guardRef.current?.()) return
          onClose()
        }}
      />
      <aside className="mylist-drawer" role="dialog" aria-label="我的聚會">
        <div className="mylist-header">
          <h2>{selectedId ? '聚會詳情' : '我的聚會'}</h2>
          <button
            className="mylist-close"
            type="button"
            aria-label="關閉"
            onClick={handleBack}
          >
            ×
          </button>
        </div>

        <div className="mylist-body">
          {/* ---------- 場次清單（依月份摺疊） ---------- */}
          {!selectedId && (
            <>
              {ratings && (
                <p className="mg-muted">封面變淡的遊戲，代表你還沒評分。</p>
              )}
              {list.loading ? (
                <p className="mylist-empty">讀取中…</p>
              ) : list.error ? (
                <div className="mylist-empty">
                  <p>讀取失敗，請稍後再試。</p>
                  <button
                    type="button"
                    className="mylist-browse"
                    onClick={list.reload}
                  >
                    重新讀取
                  </button>
                </div>
              ) : groups.length === 0 ? (
                <p className="mylist-empty">
                  {isAdmin ? '還沒有任何聚會。' : '還沒有出席過的聚會。'}
                </p>
              ) : (
                <>
                  {groups.map((group, index) => {
                    const open = isMonthOpen(group.key, index)
                    return (
                      <section key={group.key}>
                        <button
                          type="button"
                          className="mg-month"
                          aria-expanded={open}
                          onClick={() => toggleMonth(group.key, index)}
                        >
                          <span>
                            {group.key.replace('-', '/')}：{group.rows.length}場
                          </span>
                          <span aria-hidden="true">{open ? '▾' : '▸'}</span>
                        </button>
                        {open && (
                          <ul className="mg-list">
                            {group.rows.map((row) => {
                              const canWrite = row.gatheredOn <= today
                              const gameNames = gamesByGathering.games.get(row.id) ?? []
                              const parts = dateParts(row.gatheredOn)
                              return (
                                <li key={row.id}>
                                  <div className="mgc-card mgv-card">
                                    <span className="mgc-head">
                                      <b className="mgc-title">
                                        {parts.full}（{parts.weekday.replace('週', '')}）
                                      </b>
                                    </span>
                                    <span className="mgc-sub">{row.title}</span>
                                    <div className="mgv-body">
                                      <div className="mgv-games">
                                        {gameNames.length > 0 ? (
                                          gameNames.map((bggName) => {
                                            const game = gameByName.get(bggName) ?? null
                                            const note = noteByKey.get(`${row.id}|${bggName}`)
                                            const privateDone = (note?.privateNote ?? '').trim() !== ''
                                            const publicDone = (note?.publicNote ?? '').trim() !== ''
                                            const rated = ratings ? ratings.getMine(bggName) !== null : true
                                            const showChip = canWrite && (!isAdmin || privateDone)
                                            const inner = (
                                              <span className={`mgc-game${rated ? '' : ' mgc-dim'}`}>
                                                <span className="mgc-cover">
                                                  {game ? renderCover(game) : '🎲'}
                                                </span>
                                                <span className="mgc-info">
                                                  <b>{game?.name ?? bggName}</b>
                                                  {showChip && (
                                                    <small>
                                                      私人心得：{privateDone ? '已填寫' : '尚未填寫'}
                                                      {publicDone ? '・公開留言：已填寫' : ''}
                                                    </small>
                                                  )}
                                                </span>
                                              </span>
                                            )
                                            return canWrite ? (
                                              <button
                                                type="button"
                                                className="mgv-gamebtn"
                                                key={bggName}
                                                aria-label={`寫「${game?.name ?? bggName}」的心得`}
                                                onClick={() => {
                                                  if (onWriteGathering) {
                                                    onWriteGathering(row.id, bggName)
                                                    return
                                                  }
                                                  setScrollToNotes(true)
                                                  setSelectedId(row.id)
                                                }}
                                              >
                                                {inner}
                                              </button>
                                            ) : (
                                              <span className="mgv-gamebtn static" key={bggName}>
                                                {inner}
                                              </span>
                                            )
                                          })
                                        ) : (
                                          <span className="mgc-sub">
                                            {gamesByGathering.loading
                                              ? '讀取遊戲中…'
                                              : '這場沒有指定遊戲。'}
                                          </span>
                                        )}
                                      </div>
                                      <GatheringPeople
                                        gatheringId={row.id}
                                        isAdmin={isAdmin}
                                        count={row.attendeeCount}
                                      />
                                    </div>
                                    {!canWrite && (
                                      <span className="mgc-sub">聚會還沒到，當天之後才能寫心得。</span>
                                    )}
                                  </div>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </section>
                    )
                  })}
                </>
              )}
            </>
          )}

          {/* ---------- 聚會詳情（資訊＋遊戲＋心得合在同一個畫面） ---------- */}
          {selectedId && (
            <>
              {selected && (
                <div className="gn3-summary">
                  <h3>{selected.title}</h3>
                  <p>
                    {dateParts(selected.gatheredOn).full}（
                    {dateParts(selected.gatheredOn).weekday}）・
                    {detail.detail?.attendees.length ?? selected.attendeeCount} 人出席
                  </p>
                </div>
              )}
              {selected?.note && <p className="mg-note">{selected.note}</p>}

              {detail.loading ? (
                <p className="mylist-empty">讀取中…</p>
              ) : detail.error ? (
                <div className="mylist-empty">
                  <p>讀取失敗，請稍後再試。</p>
                  <button
                    type="button"
                    className="mylist-browse"
                    onClick={detail.reload}
                  >
                    重新讀取
                  </button>
                </div>
              ) : !detail.detail ? (
                <p className="mylist-empty">看不到這場聚會的資料。</p>
              ) : (
                <>
                  <details className="gn3-people">
                    <summary>出席者（{detail.detail.attendees.length}）</summary>
                    {detail.detail.attendees.length === 0 ? (
                      <p className="mg-muted">還沒有人。</p>
                    ) : (
                      <ul className="mg-people">
                        {detail.detail.attendees.map((person, index) => {
                          const source = isAdmin ? sourceLabel(person) : null
                          return (
                            <li
                              key={index}
                              className={`mg-chip${person.me ? ' me' : ''}`}
                            >
                              <span className="mg-chip-name">
                                {person.n}
                                {person.me && '（你）'}
                              </span>
                              {isAdmin && person.c && (
                                <span className="mg-chip-sub">（{person.c}）</span>
                              )}
                              {isAdmin && (
                                <span className="mg-chip-tags">
                                  {source && <em>{source}</em>}
                                  {person.e && <em>免評分</em>}
                                  {person.h && <em>隱藏暱稱</em>}
                                </span>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </details>

                  <div ref={notesRef}>
                    {noteGames.length === 0 ? (
                      <p className="mg-muted">管理者還沒有指定遊戲。</p>
                    ) : (
                      <GatheringNotePanel
                        key={selectedId}
                        gatheringId={selectedId}
                        gatheredOn={gatheredOn}
                        games={noteGames}
                        blockedReason={blockedReason}
                        getNote={notes.get}
                        personal={personal}
                        playSessions={playSessions}
                        renderCover={renderCover}
                        onOpenGame={onOpenGame}
                        onChanged={() => {
                          notes.reload()
                          noteStatus.reload()
                          allNotes.reload()
                        }}
                        guardRef={guardRef}
                        onLeave={() => setSelectedId(null)}
                      />
                    )}
                  </div>
                  {!isAdmin && noteGames.length > 0 && (
                    <p className="mg-muted">
                      沒看到遊戲？請管理者把它加進當天指定遊戲。
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  )
}
