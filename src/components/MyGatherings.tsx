import { useMemo, useState } from 'react'
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
import GatheringNoteDialog from './GatheringNoteDialog'

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
}: {
  boardGames: BoardGame[]
  personal: PersonalApi
  playSessions: PlaySessionsApi
  isAdmin: boolean
  onBack: () => void
  onClose: () => void
  onOpenGame: (game: BoardGame) => void
}) {
  const list = useMyGatherings()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({})
  const [noteTarget, setNoteTarget] = useState<{
    bggName: string
    name: string
  } | null>(null)
  const detail = useGatheringDetail(selectedId)
  const notes = useMyGatheringNotes(selectedId)
  const noteStatus = useNoteStatus()
  const selected = list.rows.find((row) => row.id === selectedId) ?? null

  const gameByName = useMemo(() => {
    const map = new Map<string, BoardGame>()
    for (const game of boardGames) map.set(game.bggName, game)
    return map
  }, [boardGames])

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

  // 出席不會自動算玩過；玩家按「我玩了這款」才記一筆（日期＝聚會日、人數＝出席人數）
  async function markPlayed(
    bggName: string,
    date: string,
    players: number | null,
  ) {
    const ok = await playSessions.addSession(bggName, {
      playedOn: date,
      playerCount: players,
      note: '',
    })
    if (!ok) return
    // 有紀錄就一定玩過；略過「次數 0 時設為 1」的規則，避免總次數多算
    if (!personal.getEntry(bggName).played) {
      personal.updateEntry(bggName, { played: true }, { skipPlayedRule: true })
    }
  }

  const gatheredOn = selected?.gatheredOn ?? ''
  const isFuture = gatheredOn !== '' && gatheredOn > todayLocal()
  const defaultPlayers = detail.detail
    ? Math.min(Math.max(detail.detail.attendees.length, 1), 99)
    : null
  const canRecord = personal.canEdit && playSessions.status === 'ready'
  // 管理者可以看全部場次，但只有真的在出席名單上的人才能寫心得
  const iAmAttendee = detail.detail?.attendees.some((person) => person.me) ?? false

  return (
    <>
      <div className="mylist-backdrop" onClick={onClose} />
      <aside className="mylist-drawer" role="dialog" aria-label="我的場次">
        <div className="mylist-header">
          <button className="mylist-back" type="button" onClick={handleBack}>
            ‹ 返回
          </button>
          <h2>{selectedId ? '場次詳情' : '我的場次'}</h2>
          <button
            className="mylist-close"
            type="button"
            aria-label="關閉"
            onClick={onClose}
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
                                          <span className="mg-todo">
                                            待填 {status.doneCount}/{status.gameCount}
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
                        const recorded = playSessions
                          .getSessions(g.b)
                          .some((item) => item.playedOn === gatheredOn)
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
                              {recorded ? (
                                <span className="mg-play-btn done">✓ 已記錄</span>
                              ) : isFuture ? (
                                <span className="mg-future">聚會還沒到</span>
                              ) : (
                                <button
                                  type="button"
                                  className="mg-play-btn"
                                  disabled={!canRecord || playSessions.busy}
                                  onClick={() =>
                                    void markPlayed(g.b, gatheredOn, defaultPlayers)
                                  }
                                >
                                  我玩了這款
                                </button>
                              )}
                            </div>
                            {iAmAttendee && !isFuture && (
                              <div className="mg-note-line">
                                <button
                                  type="button"
                                  className="mg-note-btn"
                                  disabled={notes.loading || notes.error}
                                  onClick={() =>
                                    setNoteTarget({ bggName: g.b, name: label })
                                  }
                                >
                                  {note ? '編輯心得' : '✎ 寫心得'}
                                </button>
                                {note && (
                                  <span className="mg-note-state">
                                    已寫心得
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
                  <p className="mg-muted">
                    按「我玩了這款」會記一筆遊玩（日期＝這場聚會、人數＝出席人數），
                    並標成已玩。
                    {!isAdmin &&
                      '沒看到你玩的遊戲？請聯絡管理者把它加進當天指定遊戲，才能寫這場的心得。'}
                  </p>

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

      {noteTarget && selected && (
        <GatheringNoteDialog
          key={`${selected.id}:${noteTarget.bggName}`}
          gatheringId={selected.id}
          bggName={noteTarget.bggName}
          gameName={noteTarget.name}
          gatheringTitle={selected.title}
          initial={notes.get(noteTarget.bggName)}
          onClose={() => setNoteTarget(null)}
          onSaved={() => {
            setNoteTarget(null)
            notes.reload()
            noteStatus.reload()
          }}
        />
      )}
    </>
  )
}
