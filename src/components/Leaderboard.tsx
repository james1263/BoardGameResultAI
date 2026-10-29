import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import type { CommunityStatsApi } from '../lib/useCommunityStats'
import type { RatingsApi } from '../lib/useGameRatings'
import {
  personLabel,
  type AdminRatingsApi,
  type PeopleApi,
} from '../lib/useGamePeople'
import { rankGames } from '../lib/leaderboards'
import StatsTables from './StatsTables'
import InfoHint from './InfoHint'

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
  canSeePeople,
  isAdmin,
  people,
  adminRatings,
  isOpen,
  onClose,
  onOpenGame,
  renderCover,
}: {
  boardGames: BoardGame[]
  communityStats: CommunityStatsApi
  ratings: RatingsApi
  canSeePeople: boolean
  isAdmin: boolean
  people: PeopleApi
  adminRatings: AdminRatingsApi
  isOpen: boolean
  onClose: () => void
  onOpenGame: (game: BoardGame) => void
  renderCover: (game: BoardGame) => ReactNode
}) {
  const [board, setBoard] = useState<BoardKey>('want')
  const [period, setPeriod] = useState<Period>('all')
  const [openNames, setOpenNames] = useState<string[]>([])
  const [isTableOpen, setIsTableOpen] = useState(false)

  const reloadPeople = people.reload
  const reloadAdminRatings = adminRatings.reload

  // 每次打開排行榜都重新讀一次名單，才會是最新的
  useEffect(() => {
    if (!isOpen) return
    if (canSeePeople) reloadPeople()
    if (isAdmin) reloadAdminRatings()
  }, [isOpen, canSeePeople, isAdmin, reloadPeople, reloadAdminRatings])

  const isCountBoard = board === 'want' || board === 'played'
  const canExpand = isCountBoard ? canSeePeople : isAdmin

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

  function toggleNames(bggName: string) {
    setOpenNames((current) =>
      current.includes(bggName)
        ? current.filter((name) => name !== bggName)
        : [...current, bggName],
    )
  }

  function renderNames(bggName: string): ReactNode {
    if (isCountBoard) {
      const list = people.get(bggName)[board as 'want' | 'played']
      const stats = communityStats.getStats(bggName)
      const total = board === 'want' ? stats.wantCount : stats.playedCount
      const hidden = isAdmin ? 0 : Math.max(0, total - list.length)
      return (
        <>
          {people.status === 'loading' && <p>讀取中…</p>}
          {list.length === 0 && people.status !== 'loading' && (
            <p>沒有可以顯示的名字。</p>
          )}
          {list.length > 0 && (
            <ul className="lb-people">
              {list.map((person) => (
                <li key={person.n}>{personLabel(person, isAdmin)}</li>
              ))}
            </ul>
          )}
          {hidden > 0 && <p>另有 {hidden} 位不公開名字。</p>}
          {period !== 'all' && <p>名單是目前全部的人，不分期間。</p>}
        </>
      )
    }

    const list = adminRatings.get(bggName)
    return (
      <>
        {adminRatings.status === 'loading' && <p>讀取中…</p>}
        {list.length === 0 && adminRatings.status !== 'loading' && (
          <p>還沒有人評分。</p>
        )}
        {list.length > 0 && (
          <ul className="lb-people">
            {list.map((person) => (
              <li key={person.n}>
                {personLabel(person, true)}：整體 {person.o ?? '—'}・留下來{' '}
                {person.k ?? '—'}
              </li>
            ))}
          </ul>
        )}
      </>
    )
  }

  const note = isCountBoard
    ? period === 'all'
      ? '依目前的總人數排名，只統計 VIP 玩家。'
      : '依該期間「新增」的人數排名（下方小字是目前總人數），只統計 VIP 玩家。'
    : '每款遊戲需滿 5 位玩家評分才會上榜。'
  function renderEmpty(): ReactNode {
    if (isCountBoard) {
      const label = board === 'want' ? '想玩' : '已玩'
      if (period !== 'all') {
        const periodLabel = PERIODS.find((item) => item.key === period)?.label ?? ''
        return (
          <div className="lb-empty">
            <span className="lb-empty-icon" aria-hidden="true">🗓</span>
            <b>{periodLabel}還沒有新增的{label}</b>
            <button
              type="button"
              className="lb-empty-btn"
              onClick={() => setPeriod('all')}
            >
              看全部期間
            </button>
          </div>
        )
      }
      return (
        <div className="lb-empty">
          <span className="lb-empty-icon" aria-hidden="true">🎲</span>
          <b>還沒有人標記{label}</b>
          <p>VIP 玩家在遊戲封面按 {board === 'want' ? '♥' : '✓'} 後會出現在這裡。</p>
          <button type="button" className="lb-empty-btn" onClick={onClose}>
            去逛收藏
          </button>
        </div>
      )
    }

    if (ratings.status !== 'ready') {
      return (
        <div className="lb-empty">
          <b>讀取中…</b>
          <p>如果一直沒有出現，請重新整理網頁。</p>
        </div>
      )
    }

    return (
      <div className="lb-empty">
        <span className="lb-empty-icon" aria-hidden="true">⭐</span>
        <b>評分累積中</b>
        <p>每款遊戲滿 5 位玩家評分才會上榜。</p>
        <button
          type="button"
          className="lb-empty-btn"
          onClick={() => setBoard('want')}
        >
          先看想玩榜
        </button>
      </div>
    )
  }
  return (
    <>
      {!isTableOpen && (
        <>
          <div className="mylist-backdrop" onClick={onClose} />
          <aside className="mylist-drawer" role="dialog" aria-label="排行榜">
            <div className="mylist-header">
              <h2>排行榜</h2>
              {canSeePeople && (
                <button
                  type="button"
                  className="lb-table-btn"
                  onClick={() => setIsTableOpen(true)}
                >
                  📊 統計表
                </button>
              )}
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
              <div className="lb-hintrow">
                <InfoHint text={note} />
              </div>

              {ranked.length === 0 ? (
                renderEmpty()
              ) : (
                <ul className="mylist-list">
                  {ranked.map((entry) => {
                    const bggName = entry.game.bggName
                    const expanded = openNames.includes(bggName)
                    return (
                      <Fragment key={bggName}>
                        <li className="mylist-item">
                          <span
                            className={`lb-rank ${entry.rank <= 3 ? 'top' : ''}`}
                          >
                            {entry.rank}
                          </span>
                          <div className="mylist-thumb">
                            {renderCover(entry.game)}
                          </div>
                          <div className="mylist-info">
                            <button
                              type="button"
                              className="mylist-name"
                              onClick={() => onOpenGame(entry.game)}
                            >
                              {entry.game.name}
                            </button>
                            {canExpand && (
                              <button
                                type="button"
                                className="lb-people-btn"
                                onClick={() => toggleNames(bggName)}
                              >
                                {expanded
                                  ? '收起名單 ▴'
                                  : isCountBoard
                                    ? '顯示名單 ▾'
                                    : '顯示評分者 ▾'}
                              </button>
                            )}
                          </div>
                          <div className="lb-value">
                            <strong>{entry.display}</strong>
                            {entry.extra && <span>{entry.extra}</span>}
                          </div>
                        </li>
                        {canExpand && expanded && (
                          <li className="lb-people-row">
                            {renderNames(bggName)}
                          </li>
                        )}
                      </Fragment>
                    )
                  })}
                </ul>
              )}
            </div>
          </aside>
        </>
      )}

      {isTableOpen && (
        <StatsTables
          boardGames={boardGames}
          communityStats={communityStats}
          ratings={ratings}
          people={people}
          adminRatings={adminRatings}
          isAdmin={isAdmin}
          onClose={() => setIsTableOpen(false)}
        />
      )}
    </>
  )
}
