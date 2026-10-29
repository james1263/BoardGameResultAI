import { useMemo, useState } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import {
  useGatheringDetail,
  useMyGatherings,
  type GatheringAttendee,
} from '../lib/useMyGatherings'

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
  isAdmin,
  onBack,
  onClose,
  onOpenGame,
}: {
  boardGames: BoardGame[]
  isAdmin: boolean
  onBack: () => void
  onClose: () => void
  onOpenGame: (game: BoardGame) => void
}) {
  const list = useMyGatherings()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const detail = useGatheringDetail(selectedId)
  const selected = list.rows.find((row) => row.id === selectedId) ?? null

  const gameByName = useMemo(() => {
    const map = new Map<string, BoardGame>()
    for (const game of boardGames) map.set(game.bggName, game)
    return map
  }, [boardGames])

  function handleBack() {
    if (selectedId) setSelectedId(null)
    else onBack()
  }

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
          {/* ---------- 場次清單 ---------- */}
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
                      ? '你是管理者，這裡列出全部場次。'
                      : '只列出你出席過的場次。'}
                  </p>
                  <ul className="mg-list">
                    {list.rows.map((row) => (
                      <li key={row.id}>
                        <button
                          type="button"
                          className="mg-item"
                          onClick={() => setSelectedId(row.id)}
                        >
                          <DateBadge iso={row.gatheredOn} />
                          <span className="mg-info">
                            <b className="mg-title">{row.title}</b>
                            <span className="mg-sub">
                              {dateParts(row.gatheredOn).full}・{row.attendeeCount} 人出席
                            </span>
                          </span>
                          <span className="mg-arrow" aria-hidden="true">›</span>
                        </button>
                      </li>
                    ))}
                  </ul>
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
                    <ul className="mg-games">
                      {detail.detail.games.map((g) => {
                        const game = gameByName.get(g.b)
                        const label = g.n || g.b
                        return (
                          <li key={g.b}>
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
                          </li>
                        )
                      })}
                    </ul>
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
    </>
  )
}
