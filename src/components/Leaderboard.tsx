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
import { isUnplayedGame } from '../lib/playedStatus'
import {
  DIFFICULTY_LEVELS,
  DIFFICULTY_LEVEL_INFO,
  getDifficultyLevel,
} from '../lib/libraryTypes'
import { usePlayerStats } from '../lib/usePlayerStats'
import { useCommunityStats } from '../lib/useCommunityStats'
import StatsTables from './StatsTables'
import PlayersBoard from './PlayersBoard'
import '../styles/stats-chart.css'
import InfoHint from './InfoHint'
import '../styles/leaderboard-filter.css'
import '../styles/leaderboard-search.css'

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

type Filters = {
  category: string // '' = 不限
  players: string // 'all' | '1' | '2' | '3-4' | '5-6' | '7+'
  time: string // 'all' | '30' | '60' | '120' | '120+'
  difficulty: string // 'all' | '1'～'5'（與主畫面同一套五級）
}

const NO_FILTERS: Filters = { category: '', players: 'all', time: 'all', difficulty: 'all' }

const PLAYER_OPTIONS: { key: string; label: string; lo: number; hi: number }[] = [
  { key: 'all', label: '不限', lo: 0, hi: 0 },
  { key: '1', label: '1 人', lo: 1, hi: 1 },
  { key: '2', label: '2 人', lo: 2, hi: 2 },
  { key: '3-4', label: '3–4 人', lo: 3, hi: 4 },
  { key: '5-6', label: '5–6 人', lo: 5, hi: 6 },
  { key: '7+', label: '7 人以上', lo: 7, hi: 99 },
]

const TIME_OPTIONS = [
  { key: 'all', label: '不限' },
  { key: '30', label: '30 分鐘內' },
  { key: '60', label: '31–60 分鐘' },
  { key: '120', label: '61–120 分鐘' },
  { key: '120+', label: '120 分鐘以上' },
]

// 難度五級：沿用主畫面的分級（libraryTypes 的 getDifficultyLevel）
const DIFFICULTY_OPTIONS = [
  { key: 'all', label: '不限' },
  ...DIFFICULTY_LEVELS.map((level) => ({
    key: String(level),
    label: `${DIFFICULTY_LEVEL_INFO[level].name}（${DIFFICULTY_LEVEL_INFO[level].range}）`,
  })),
]

function matchesFilters(game: BoardGame, f: Filters): boolean {
  if (f.category && !(game.category ?? []).includes(f.category)) return false

  if (f.players !== 'all') {
    const opt = PLAYER_OPTIONS.find((item) => item.key === f.players)
    if (opt) {
      // 優先看推薦人數；沒有資料就用人數上下限
      let counts: number[] = Array.isArray(game.recommendPlayers)
        ? game.recommendPlayers.map(Number)
        : []
      if (counts.length === 0) {
        const lo = Number(game.minPlayers)
        const hi = Number(game.maxPlayers)
        if (Number.isFinite(lo) && Number.isFinite(hi) && lo > 0 && hi >= lo) {
          counts = Array.from({ length: Math.min(hi, 20) - lo + 1 }, (_, i) => lo + i)
        }
      }
      if (!counts.some((count) => count >= opt.lo && count <= opt.hi)) return false
    }
  }

  if (f.time !== 'all') {
    const t = Number(game.bggTime)
    if (!Number.isFinite(t) || t <= 0) return false
    if (f.time === '30' && t > 30) return false
    if (f.time === '60' && !(t > 30 && t <= 60)) return false
    if (f.time === '120' && !(t > 60 && t <= 120)) return false
    if (f.time === '120+' && t <= 120) return false
  }

  if (f.difficulty !== 'all') {
    const d = Number(game.bggDifficulty)
    if (!Number.isFinite(d) || d <= 0) return false
    if (String(getDifficultyLevel(d)) !== f.difficulty) return false
  }
  return true
}

export default function Leaderboard({
  boardGames,
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
  const [page, setPage] = useState<'games' | 'players' | 'stats'>('games')
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')

  // 排行榜自己讀一份人數：打開時才讀、每次打開都重讀，不影響主畫面
  const communityStats = useCommunityStats(isOpen)

  // 關掉排行榜時清掉搜尋文字
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setPage('games')
    }
  }, [isOpen])

  // 期間只對想玩、已玩有意義
  const periodApplies = board === 'want' || board === 'played'

  // 資料篩選（類型、人數、時間、難度）的數量；空結果的提示文字用
  const dataFilterCount =
    (filters.category ? 1 : 0) +
    (filters.players !== 'all' ? 1 : 0) +
    (filters.time !== 'all' ? 1 : 0) +
    (filters.difficulty !== 'all' ? 1 : 0)

  // 「篩選」鈕上的角標：資料篩選＋期間＋排序方向
  const activeFilterCount =
    dataFilterCount +
    (periodApplies && period !== 'all' ? 1 : 0) +
    (sortDir === 'asc' ? 1 : 0)

  function resetAll() {
    setFilters(NO_FILTERS)
    setPeriod('all')
    setSortDir('desc')
  }

  // 類型選單：依遊戲數由多到少
  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const game of boardGames) {
      for (const name of game.category ?? []) counts.set(name, (counts.get(name) ?? 0) + 1)
    }
    return [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant'),
    )
  }, [boardGames])

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
  const boards = BOARDS
  // 玩家榜資料：切到玩家榜才讀（資料庫函式會再驗證 VIP／管理者）
  const playerStats = usePlayerStats(isOpen && (canSeePeople || isAdmin) && page === 'players')

  const rankedAll = useMemo(() => {
    const pool = boardGames.filter((game) => matchesFilters(game, filters))
    const entries = pool.flatMap((game) => {
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
            extra:
              period === 'all'
                ? byPeriod.month > 0
                  ? `本月 +${byPeriod.month}`
                  : ''
                : `目前共 ${total} 人`,
          },
        ]
      }

      // Ranking engine 以 .5 結尾＝還沒玩過，不列入評分榜
      if (isUnplayedGame(game)) return []

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
  }, [boardGames, board, period, communityStats, ratings, filters])

  // 搜尋：只留下符合的，名次維持原樣；排序方向只翻轉顯示順序
  const ranked = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    const matched = keyword
      ? rankedAll.filter(
          (entry) =>
            entry.game.name.toLowerCase().includes(keyword) ||
            entry.game.bggName.toLowerCase().includes(keyword),
        )
      : rankedAll
    return sortDir === 'asc' ? [...matched].reverse() : matched
  }, [rankedAll, query, sortDir])

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
    : '每款遊戲需滿 5 位玩家評分才會上榜；還沒玩過的遊戲不列入。'
  function renderEmpty(): ReactNode {
    if (query.trim() && rankedAll.length > 0) {
      return (
        <div className="lb-empty">
          <span className="lb-empty-icon" aria-hidden="true">🔍</span>
          <b>榜上找不到「{query.trim()}」</b>
          <button type="button" className="lb-empty-btn" onClick={() => setQuery('')}>
            清除搜尋
          </button>
        </div>
      )
    }
    if (dataFilterCount > 0) {
      return (
        <div className="lb-empty">
          <span className="lb-empty-icon" aria-hidden="true">🔍</span>
          <b>沒有符合篩選的遊戲</b>
          <button type="button" className="lb-empty-btn" onClick={resetAll}>
            清除篩選
          </button>
        </div>
      )
    }
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
      {(
        <>
          <div className="mylist-backdrop" onClick={onClose} />
          <aside className="mylist-drawer" role="dialog" aria-label="統計中心">
            <div className="mylist-header">
              <h2>統計中心</h2>
              <button
                className="mylist-close"
                type="button"
                aria-label="關閉"
                onClick={onClose}
              >
                ×
              </button>
            </div>

            {(canSeePeople || isAdmin) && (
              <div className="lb-pages">
                <button
                  type="button"
                  className={page === 'games' ? 'active' : ''}
                  onClick={() => setPage('games')}
                >
                  遊戲榜
                </button>
                <button
                  type="button"
                  className={page === 'players' ? 'active' : ''}
                  onClick={() => setPage('players')}
                >
                  玩家榜
                </button>
                <button
                  type="button"
                  className={page === 'stats' ? 'active' : ''}
                  onClick={() => setPage('stats')}
                >
                  統計表
                </button>
              </div>
            )}

            {page === 'players' && (canSeePeople || isAdmin) ? (
              <div className="mylist-body">
                <PlayersBoard
                  players={playerStats.players}
                  status={playerStats.status}
                  isAdmin={isAdmin}
                  boardGames={boardGames}
                  renderCover={renderCover}
                  onOpenGame={onOpenGame}
                />
              </div>
            ) : page === 'stats' && (canSeePeople || isAdmin) ? (
              <div className="mylist-body">
                <StatsTables
                  embedded
                  boardGames={boardGames}
                  communityStats={communityStats}
                  ratings={ratings}
                  people={people}
                  adminRatings={adminRatings}
                  isAdmin={isAdmin}
                  onOpenGame={onOpenGame}
                />
              </div>
            ) : (
              <>
            <div className={`lb-tabs${boards.length > 4 ? ' lb-tabs-5' : ''}`}>
              {boards.map((item) => (
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

            <div className="lbs">
              <div className="lbs-bar">
                <span className="lbs-icon" aria-hidden="true">🔍</span>
                <input
                  type="search"
                  className="lbs-input"
                  placeholder="搜尋遊戲名稱"
                  aria-label="搜尋遊戲名稱"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query && (
                  <button
                    type="button"
                    className="lbs-clear"
                    aria-label="清除搜尋"
                    onClick={() => setQuery('')}
                  >
                    ×
                  </button>
                )}
                <button
                  type="button"
                  className={`lbs-filter ${filterOpen || activeFilterCount > 0 ? 'on' : ''}`}
                  aria-expanded={filterOpen}
                  onClick={() => setFilterOpen((value) => !value)}
                >
                  篩選
                  {activeFilterCount > 0 && (
                    <span className="lbs-badge">{activeFilterCount}</span>
                  )}
                </button>
              </div>

              {filterOpen && (
                <div className="lbs-panel">
                  {periodApplies && (
                    <div className="lbs-group">
                      <span className="lbs-label">統計期間</span>
                      <div className="lbs-chips">
                        {PERIODS.map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            className={period === item.key ? 'active' : ''}
                            onClick={() => setPeriod(item.key)}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="lbs-group">
                    <span className="lbs-label">排序方式</span>
                    <div className="lbs-seg">
                      <button
                        type="button"
                        className={sortDir === 'desc' ? 'active' : ''}
                        onClick={() => setSortDir('desc')}
                      >
                        由高到低
                      </button>
                      <button
                        type="button"
                        className={sortDir === 'asc' ? 'active' : ''}
                        onClick={() => setSortDir('asc')}
                      >
                        由低到高
                      </button>
                    </div>
                  </div>

                  <div className="lbs-fields">
                    <label className="lbs-field">
                      <span className="lbs-label">類型</span>
                      <select
                        value={filters.category}
                        onChange={(event) =>
                          setFilters((f) => ({ ...f, category: event.target.value }))
                        }
                      >
                        <option value="">不限</option>
                        {categoryOptions.map(([name, count]) => (
                          <option key={name} value={name}>
                            {name}（{count}）
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="lbs-field">
                      <span className="lbs-label">推薦人數</span>
                      <select
                        value={filters.players}
                        onChange={(event) =>
                          setFilters((f) => ({ ...f, players: event.target.value }))
                        }
                      >
                        {PLAYER_OPTIONS.map((item) => (
                          <option key={item.key} value={item.key}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="lbs-field">
                      <span className="lbs-label">遊戲時間</span>
                      <select
                        value={filters.time}
                        onChange={(event) =>
                          setFilters((f) => ({ ...f, time: event.target.value }))
                        }
                      >
                        {TIME_OPTIONS.map((item) => (
                          <option key={item.key} value={item.key}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="lbs-field">
                      <span className="lbs-label">難度</span>
                      <select
                        value={filters.difficulty}
                        onChange={(event) =>
                          setFilters((f) => ({ ...f, difficulty: event.target.value }))
                        }
                      >
                        {DIFFICULTY_OPTIONS.map((item) => (
                          <option key={item.key} value={item.key}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {activeFilterCount > 0 && (
                    <button type="button" className="lbs-reset" onClick={resetAll}>
                      重設全部
                    </button>
                  )}
                </div>
              )}
            </div>

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
              </>
            )}
          </aside>
        </>
      )}
    </>
  )
}
