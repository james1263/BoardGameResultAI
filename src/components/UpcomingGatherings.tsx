import { useMemo, useState, type ReactNode } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import {
  formatPlannedWhen,
  plannedStatusLabel,
  useUpcomingGatherings,
  type PlannedGathering,
} from '../lib/usePlannedGatherings'
import '../styles/planned.css'

export default function UpcomingGatherings({
  boardGames,
  isVip,
  isAdmin,
  renderCover,
  onBack,
  onClose,
  onOpenGame,
}: {
  boardGames: BoardGame[]
  isVip: boolean
  isAdmin: boolean
  renderCover: (game: BoardGame) => ReactNode
  onBack: () => void
  onClose: () => void
  onOpenGame: (game: BoardGame) => void
}) {
  const allowed = isVip || isAdmin
  const planned = useUpcomingGatherings(allowed)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const gameByName = useMemo(() => {
    const map = new Map<string, BoardGame>()
    for (const game of boardGames) map.set(game.bggName, game)
    return map
  }, [boardGames])

  async function toggle(row: PlannedGathering) {
    setBusyId(row.id)
    setMessage('')
    const problem = await planned.setGoing(row.id, !row.iAmGoing)
    if (problem) setMessage(problem)
    setBusyId(null)
  }

  return (
    <>
      <div className="mylist-backdrop" onClick={onClose} />
      <aside className="mylist-drawer" role="dialog" aria-label="近期聚會">
        <div className="mylist-header">
          <h2>近期聚會</h2>
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
          {!allowed ? (
            <p className="mylist-empty">只有 VIP 可以看到近期聚會。</p>
          ) : planned.loading ? (
            <p className="mylist-empty">讀取中…</p>
          ) : planned.error ? (
            <div className="mylist-empty">
              <p>讀取失敗，請稍後再試。</p>
              <button type="button" className="mylist-browse" onClick={planned.reload}>
                重新讀取
              </button>
            </div>
          ) : planned.rows.length === 0 ? (
            <p className="mylist-empty">目前沒有預計的聚會。</p>
          ) : (
            <>
              <p className="pg-hint">
                「我可以去」只是表示有意願，不等於正式報名；實際報到以聚會當天的連結為準。
              </p>
              {message && <p className="pg-msg">{message}</p>}
              <ul className="pg-list">
                {planned.rows.map((row) => (
                  <li
                    key={row.id}
                    className={`pg-card${row.status === 'cancelled' ? ' cancelled' : ''}`}
                  >
                    <div className="pg-head">
                      <div>
                        <p className="pg-when">
                          {formatPlannedWhen(row.plannedOn, row.startTime)}
                        </p>
                        <h3 className="pg-title">{row.title}</h3>
                      </div>
                      {row.status !== 'open' && (
                        <span
                          className={`pg-badge${row.status === 'converted' ? ' ok' : ''}`}
                        >
                          {plannedStatusLabel(row.status)}
                        </span>
                      )}
                    </div>

                    {row.note && <p className="pg-note">{row.note}</p>}

                    {row.games.length === 0 ? (
                      <p className="pg-note">預計遊戲還沒決定。</p>
                    ) : (
                      <ul className="pg-games">
                        {row.games.map((bggName) => {
                          const game = gameByName.get(bggName)
                          return (
                            <li key={bggName}>
                              {game ? (
                                <button
                                  type="button"
                                  className="pg-game"
                                  onClick={() => onOpenGame(game)}
                                >
                                  <span className="pg-thumb">{renderCover(game)}</span>
                                  <span>{game.name}</span>
                                </button>
                              ) : (
                                <span className="pg-game plain">{bggName}</span>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}

                    <div className="pg-foot">
                      <span className="pg-count">{row.goingCount} 人可以去</span>
                      {row.status === 'open' ? (
                        <button
                          type="button"
                          className={`pg-go${row.iAmGoing ? ' on' : ''}`}
                          disabled={busyId === row.id}
                          aria-pressed={row.iAmGoing}
                          onClick={() => void toggle(row)}
                        >
                          {row.iAmGoing ? '取消意願' : '我可以去'}
                        </button>
                      ) : (
                        <span className="pg-closed">
                          {row.status === 'cancelled'
                            ? '此聚會已取消'
                            : '已轉為正式聚會'}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
