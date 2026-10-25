import { useMemo, useState, type ReactNode } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import type { CommunityStatsApi } from '../lib/useCommunityStats'
import type { RatingsApi } from '../lib/useGameRatings'
import { rankGames } from '../lib/leaderboards'

type BoardKey = 'want' | 'played' | 'overall' | 'keep'
type Period = 'all' | 'month' | 'quarter' | 'year'

const BOARDS: { key: BoardKey; label: string }[] = [
  { key: 'want', label: '想玩' },
  { key: 'played', label: '已玩' },
  { key: 'overall', label: '整體評分' },
  { key: 'keep', label: '留下來' },
]

const PERIODS: { key: Period; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'month', label: '本月' },
  { key: 'quarter', label: '本季' },
  { key: 'year', label: '本年' },
]

export default function Leaderboard({
  boardGames,
  communityStats,
  ratings,
  isOpen,
  onClose,
  onOpenGame,
  renderCover,
}: {
  boardGames: BoardGame[]
  communityStats: CommunityStatsApi
  ratings: RatingsApi
  isOpen: boolean
  onClose: () => void
  onOpenGame: (game: BoardGame) => void
  renderCover: (game: BoardGame) => ReactNode
}) {
  const [board, setBoard] = useState<BoardKey>('want')
  const [period, setPeriod] = useState<Period>('all')

  const isCountBoard = board === 'want' || board === 'played'

  const ranked = useMemo(() => {
    const entries = boardGames.flatMap((game) => {
      if (board === 'want' || board === 'played') {
        const s = communityStats.getStats(game.bggName)
        const total = board === 'want' ? s.wantCount : s.playedCount
        const byPeriod: Record<Period, number> =
          board === 'want'
            ? {
                all: s.wantCount,
                month: s.wantMonth,
                quarter: s.wantQuarter,
                year: s.wantYear,
              }
            : {
                all: s.playedCount,
                month: s.playedMonth,
                quarter: s.playedQuarter,
                year: s.playedYear,
              }
        const value = byPeriod[period]
        if (value <= 0) return []
        return [
          {
            game,
            name: game.name,
            value,
            display: `${value} 人`,
            extra: period === 'all' ? '' : `目前共 ${total} 人`,
          },
        ]
      }

      const summary = ratings.getSummary(game.bggName)
      const average =
        board === 'overall' ? summary.overallAvg : summary.avgs.keep
      if (average == null) return []
      const value = Math.round(average * 10) / 10
      return [
        {
          game,
          name: game.name,
          value,
          display: value.toFixed(1),
          extra: `${summary.count} 人評分`,
        },
      ]
    })

    return rankGames(entries)
  }, [boardGames, board, period, communityStats, ratings])

  if (!isOpen) return null

  const note = isCountBoard
    ? period === 'all'
      ? '依目前的總人數排名，只統計已登入的玩家。'
      : '依該期間「新增」的人數排名（下方小字是目前總人數）。'
    : '需滿 5 位玩家評分才會上榜。'

  return (
    <>
      <div className="mylist-backdrop" onClick={onClose} />
      <aside className="mylist-drawer" role="dialog" aria-label="排行榜">
        <div className="mylist-header">
          <h2>排行榜</h2>
          <button
            className="mylist-close"
            type="button"
            aria-label="關閉"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="lb-tabs">
          {BOARDS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`lb-tab ${board === item.key ? 'active' : ''}`}
              onClick={() => setBoard(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {isCountBoard && (
          <div className="lb-periods">
            {PERIODS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`lb-period ${period === item.key ? 'active' : ''}`}
                onClick={() => setPeriod(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        <div className="mylist-body">
          <p className="lb-note">{note}</p>

          {ranked.length === 0 ? (
            <p className="mylist-empty">
              {isCountBoard
                ? '這個期間還沒有人標記。'
                : '評分累積中，滿 5 位玩家才會上榜。'}
            </p>
          ) : (
            <ul className="mylist-list">
              {ranked.map((entry) => (
                <li className="mylist-item" key={entry.game.bggName}>
                  <span className={`lb-rank ${entry.rank <= 3 ? 'top' : ''}`}>
                    {entry.rank}
                  </span>
                  <div className="mylist-thumb">{renderCover(entry.game)}</div>
                  <div className="mylist-info">
                    <button
                      type="button"
                      className="mylist-name"
                      onClick={() => onOpenGame(entry.game)}
                    >
                      {entry.game.name}
                    </button>
                  </div>
                  <div className="lb-value">
                    <strong>{entry.display}</strong>
                    {entry.extra && <span>{entry.extra}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}