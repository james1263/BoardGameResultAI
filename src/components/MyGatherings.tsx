import { useMemo, useState, type ReactNode } from 'react'
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
import GatheringNoteDialog, { type NoteGame } from './GatheringNoteDialog'
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
  onBack,
  onClose,
  onOpenGame,
  renderCover,
}: {
  boardGames: BoardGame[]
  personal: PersonalApi
  playSessions: PlaySessionsApi
  isAdmin: boolean
  onBack: () => void
  onClose: () => void
  onOpenGame: (game: BoardGame) => void
  renderCover: (game: BoardGame) => ReactNode
}) {
  const list = useMyGatherings()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({})
  const [noteGameName, setNoteGameName] = useState<string | null>(null)
  const detail = useGatheringDetail(selectedId)
  const notes = useMyGatheringNotes(selectedId)
  const noteStatus = useNoteStatus()
  const selected = list.rows.find((row) => row.id === selectedId) ?? null

  const gameByName = useMemo(() => {
    const map = new Map<string, BoardGame>()
    for (const game of boardGames) map.set(game.bggName, game)
    return map
  }, [boardGames])

  // 心得頁用的當天遊戲清單（含封面所需的遊戲資料）
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

  function handleBack() {
    if (selectedId) setSelectedId(null)
    else onBack()
  }
  useBackClose(() => setSelectedId(null), selectedId !== null)

  const gatheredOn = selected?.gatheredOn ?? ''
  const isFuture = gatheredOn !== '' && gatheredOn > todayLocal()
  // 管理者可以看全部場次，但只有真的在出席名單上的人才能記錄心得
  const iAmAttendee = detail.detail?.attendees.some((person) => person.me) ?? false

  return (
    <>
      <div className="mylist-backdrop" onClick={onClose} />
      <aside className="mylist-drawer" role="dialog" aria-label="我的場次">
        <div className="mylist-header">
          <h2>{selectedId ? '場次詳情' : '我的場次'}</h2>
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
                    : '還沒有出席過的聚會。用聚會連結報到，或由管理者把你加入名單後，這裡就會出現。'}
                </p>
              ) : (
                <>
                  <p className="mg-muted">
                    {isAdmin
                      ? '你是管理者，這裡列出全部場次，最新的在最上面。'
                      : '只列出你出席過的場次，最新的在最上面。'}
                  </p>
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

          {/* ---------- 場次詳情 ---------- */}
          {selectedId && (
            <>
              {selected && (
                <div className="mg-detail-head">
                  <DateBadge iso={selected.gatheredOn} />
                  <div className="mg-info">
                    <h3 className="mg-title">{selected.title}</h3>
                    <p className="mg-sub">{dateParts(selected.gatheredOn).full}</p>
                  </div>
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
                  <h3 className="mg-section-title">
                    當天指定遊戲（{detail.detail.games.length}）
                  </h3>
                  {detail.detail.games.length === 0 ? (
                    <p className="mg-muted">管理者還沒有指定遊戲。</p>
                  ) : (
                    <ul className="mg-game-list">
                      {detail.detail.games.map((g) => {
                        const game = gameByName.get(g.b)
                        const label = g.n || g.b
                        const note = notes.get(g.b)
                        return (
                          <li className="mg-game-row" key={g.b}>
                            <div className="mg-game-main">
                              {game ? (
                                <button
                                  type="button"
                                  className="mg-game"
                                  onClick={() => onOpenGame(game)}
                                >
                                  {label}
                                </button>
                              ) : (
                                <span className="mg-game plain">{label}</span>
                              )}
                              {isFuture && (
                                <span className="mg-future">聚會還沒到</span>
                              )}
                            </div>
                            {iAmAttendee && !isFuture && (
                              <div className="mg-note-line">
                                <button
                                  type="button"
                                  className="mg-note-btn"
                                  disabled={notes.loading || notes.error}
                                  onClick={() => setNoteGameName(g.b)}
                                >
                                  {note ? '編輯心得' : '✎ 記錄心得'}
                                </button>
                                {note && (
                                  <span className="mg-note-state">
                                    已記錄心得
                                    {note.publicNote !== '' &&
                                      (note.publicStatus === 'hidden'
                                        ? '・公開留言已被管理者隱藏'
                                        : '・公開中')}
                                  </span>
                                )}
                              </div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                  {!isAdmin && (
                    <p className="mg-muted">
                      沒看到你玩的遊戲？請聯絡管理者把它加進當天指定遊戲，才能記錄這場的心得。
                    </p>
                  )}

                  <h3 className="mg-section-title">
                    出席者（{detail.detail.attendees.length}）
                  </h3>
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

                  <p className="mg-muted">
                    {isAdmin
                      ? '你是管理者，看得到聯絡方式與報到來源；其他人看不到。'
                      : '選擇隱藏暱稱的玩家會顯示為「匿名玩家」。'}
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </aside>

      {noteGameName && selected && noteGames.length > 0 && (
        <GatheringNoteDialog
          key={selected.id}
          gatheringId={selected.id}
          gatheringTitle={selected.title}
          gatheredOn={selected.gatheredOn}
          attendeeCount={detail.detail?.attendees.length ?? selected.attendeeCount}
          games={noteGames}
          initialBggName={noteGameName}
          getNote={notes.get}
          personal={personal}
          playSessions={playSessions}
          renderCover={renderCover}
          onChanged={() => {
            notes.reload()
            noteStatus.reload()
          }}
          onClose={() => setNoteGameName(null)}
        />
      )}
    </>
  )
}