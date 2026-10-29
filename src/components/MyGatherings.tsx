import { useMemo, useRef, useState, type ReactNode } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import type { PersonalApi } from '../lib/personalApi'
import { todayLocal, type PlaySessionsApi } from '../lib/useGamePlaySessions'
import { useMyGatheringNotes, useNoteStatus } from '../lib/useGatheringNotes'
import {
  useGatheringDetail,
  useMyGatherings,
  type GatheringAttendee,
  type MyGathering,
} from '../lib/useMyGatherings'
import GatheringNotePanel, { type NoteGame } from './GatheringNotePanel'
import { useBackClose } from '../lib/useBackClose'

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

function DateBadge({ iso }: { iso: string }) {
  const p = dateParts(iso)
  return (
    <div className="mg-date" aria-hidden="true">
      <small>{p.month}</small>
      <strong>{p.day}</strong>
      <small>{p.weekday}</small>
    </div>
  )
}

function sourceLabel(person: GatheringAttendee): string | null {
  if (person.s === 'self') return '自己報到'
  if (person.s === 'admin') return '手動加入'
  return null
}

export default function MyGatherings({
  boardGames,
  personal,
  playSessions,
  isAdmin,
  initialGatheringId,
  onBack,
  onClose,
  onOpenGame,
  renderCover,
}: {
  boardGames: BoardGame[]
  personal: PersonalApi
  playSessions: PlaySessionsApi
  isAdmin: boolean
  initialGatheringId?: string | null
  onBack: () => void
  onClose: () => void
  onOpenGame: (game: BoardGame) => void
  renderCover: (game: BoardGame) => ReactNode
}) {
  const list = useMyGatherings()
  const [selectedId, setSelectedId] = useState<string | null>(initialGatheringId ?? null)
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({})
  const detail = useGatheringDetail(selectedId)
  const notes = useMyGatheringNotes(selectedId)
  const noteStatus = useNoteStatus()
  const selected = list.rows.find((row) => row.id === selectedId) ?? null
  // 心得區會把「有未存變更」的檢查函式放進來
  const guardRef = useRef<(() => boolean) | null>(null)

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

  const currentMonth = todayLocal().slice(0, 7)

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
  }

  function handleBack() {
    if (selectedId) leaveDetail()
    else onBack()
  }
  useBackClose(leaveDetail, selectedId !== null)

  const gatheredOn = selected?.gatheredOn ?? ''
  const isFuture = gatheredOn !== '' && gatheredOn > todayLocal()
  // 管理者可以看全部場次，但只有真的在出席名單上的人才能記錄心得
  const iAmAttendee = detail.detail?.attendees.some((person) => person.me) ?? false
  const blockedReason: string | null = isFuture
    ? '聚會還沒到，聚會當天或之後才能記錄心得。'
    : !iAmAttendee
      ? '你不在這場聚會的出席名單上，所以不能記錄心得。'
      : notes.error
        ? '心得讀取失敗，請稍後再試。'
        : notes.loading
          ? '心得讀取中…'
          : null

  return (
    <>
      <div
        className="mylist-backdrop"
        onClick={() => {
          if (selectedId && guardRef.current?.()) return
          onClose()
        }}
      />
      <aside className="mylist-drawer" role="dialog" aria-label="我的場次">
        <div className="mylist-header">
          <h2>{selectedId ? '聚會詳情' : '我的場次'}</h2>
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
              ) : list.rows.length === 0 ? (
                <p className="mylist-empty">
                  {isAdmin
                    ? '還沒有任何聚會。'
                    : '還沒有出席過的聚會。'}
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
                              const status = noteStatus.get(row.id)
                              const pending =
                                status !== null &&
                                status.gameCount > 0 &&
                                status.doneCount < status.gameCount
                              return (
                                <li key={row.id}>
                                  <button
                                    type="button"
                                    className="mg-item"
                                    onClick={() => setSelectedId(row.id)}
                                  >
                                    <DateBadge iso={row.gatheredOn} />
                                    <span className="mg-info">
                                      <b className="mg-title">
                                        {row.title}
                                        {pending && status && (
                                          <span className="mg-quiet">
                                            已記錄心得 {status.doneCount}/{status.gameCount}
                                          </span>
                                        )}
                                      </b>
                                      <span className="mg-sub">
                                        {dateParts(row.gatheredOn).full}・
                                        {row.attendeeCount} 人出席
                                      </span>
                                    </span>
                                    <span className="mg-arrow" aria-hidden="true">
                                      ›
                                    </span>
                                  </button>
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
                      }}
                      guardRef={guardRef}
                      onLeave={() => setSelectedId(null)}
                    />
                  )}
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