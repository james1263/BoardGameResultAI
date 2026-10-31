import { useMemo, useState, type ReactNode } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import type { PlayerStat } from '../lib/usePlayerStats'
import { rankGames } from '../lib/leaderboards'
import InfoHint from './InfoHint'

type Tab = 'played' | 'rated' | 'score' | 'combo'

const TABS: { key: Tab; label: string }[] = [
  { key: 'played', label: '玩過最多' },
  { key: 'rated', label: '評過最多' },
  { key: 'score', label: '評分' },
  { key: 'combo', label: '綜合分數' },
]

const TOP_COUNT = 10 // 款數榜：前 10 名（同分並列）
const TOP_ROWS = 20 // 評分榜：最多顯示 20 筆

type Props = {
  players: PlayerStat[]
  status: 'idle' | 'loading' | 'ready' | 'error'
  isAdmin: boolean
  boardGames: BoardGame[]
  renderCover: (game: BoardGame) => ReactNode
  onOpenGame: (game: BoardGame) => void
}

export default function PlayersBoard({
  players,
  status,
  isAdmin,
  boardGames,
  renderCover,
  onOpenGame,
}: Props) {
  const [tab, setTab] = useState<Tab>('played')
  const [highest, setHighest] = useState(true)
  const [hideAdmin, setHideAdmin] = useState(false)
  const [query, setQuery] = useState('')

  const gameByName = useMemo(() => {
    const map = new Map<string, BoardGame>()
    for (const game of boardGames) map.set(game.bggName, game)
    return map
  }, [boardGames])

  const labelOf = (player: PlayerStat) =>
    isAdmin && player.contact ? `${player.nickname}（${player.contact}）` : player.nickname

  const visible = useMemo(
    () => players.filter((player) => !(hideAdmin && player.isAdminAccount)),
    [players, hideAdmin],
  )
  const keyword = query.trim().toLowerCase()

  // 款數榜（玩過最多、評過最多）
  const countRows = useMemo(() => {
    if (tab !== 'played' && tab !== 'rated') return []
    const entries = visible
      .map((player) => ({
        name: player.nickname,
        label: labelOf(player),
        value: tab === 'played' ? player.played : player.rated,
      }))
      .filter((entry) => entry.value > 0)
    const ranked = rankGames(entries, 99999)
    return keyword
      ? ranked.filter((entry) => entry.label.toLowerCase().includes(keyword))
      : ranked.filter((entry) => entry.rank <= TOP_COUNT)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, visible, keyword, isAdmin])

  // 評分榜（評分、綜合分數）：每一筆是「玩家給某款遊戲的分數」
  const scoreRows = useMemo(() => {
    if (tab !== 'score' && tab !== 'combo') return { rows: [], total: 0 }
    const all: { label: string; game: BoardGame; value: number }[] = []
    for (const player of visible) {
      for (const rating of player.ratings) {
        const value = tab === 'score' ? rating.o : rating.s
        const game = gameByName.get(rating.g)
        if (value == null || !game) continue
        all.push({ label: labelOf(player), game, value })
      }
    }
    const matched = keyword
      ? all.filter(
          (row) =>
            row.label.toLowerCase().includes(keyword) ||
            row.game.name.toLowerCase().includes(keyword) ||
            row.game.bggName.toLowerCase().includes(keyword),
        )
      : all
    const direction = highest ? -1 : 1
    matched.sort(
      (a, b) =>
        (a.value - b.value) * direction ||
        a.game.name.localeCompare(b.game.name, 'zh-Hant') ||
        a.label.localeCompare(b.label, 'zh-Hant'),
    )
    let rank = 0
    const ranked = matched.map((row, index) => {
      if (index === 0 || row.value !== matched[index - 1].value) rank = index + 1
      return { ...row, rank }
    })
    return { rows: ranked.slice(0, TOP_ROWS), total: ranked.length }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, visible, keyword, highest, gameByName, isAdmin])

  const isCount = tab === 'played' || tab === 'rated'

  const hint =
    tab === 'played'
      ? '依已玩的遊戲款數排名（只統計 VIP 玩家與管理者）。選擇不公開暱稱的玩家不會列入，管理者看得到全部。'
      : tab === 'rated'
        ? '依評過分的遊戲款數排名。管理者的分數是從 CSV 換算，算法和一般玩家的評分一樣。'
        : tab === 'score'
          ? '每一筆是一位玩家給某款遊戲的整體分數（1～10）。同分並列，同分時依遊戲名稱排序。'
          : '綜合分數＝喜歡度、影響度、溝通度、變化度、獨特性、適合留下來這六項（各 1～5）加起來，最高 30 分，不含整體分數。六項沒有填完整的評分不列入。'

  if (status === 'loading' || status === 'idle') return <p className="mylist-empty">讀取中…</p>
  if (status === 'error') {
    return (
      <p className="mylist-empty">讀取玩家榜失敗，請稍後再試，或重新整理網頁。</p>
    )
  }

  return (
    <>
      <div className="lb-tabs">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`lb-tab ${tab === item.key ? 'active' : ''}`}
            onClick={() => setTab(item.key)}
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
            placeholder={isCount ? '搜尋玩家暱稱' : '搜尋玩家或遊戲名稱'}
            aria-label="搜尋"
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
        </div>
      </div>

      <div className="lb-hintrow">
        <InfoHint text={hint} />
        <label className="st-check" style={{ marginLeft: 'auto' }}>
          <input
            type="checkbox"
            checked={hideAdmin}
            onChange={(event) => setHideAdmin(event.target.checked)}
          />
          隱藏管理者
        </label>
        {!isCount && (
          <span className="lb-pages pb-toggle">
            <button
              type="button"
              className={highest ? 'active' : ''}
              onClick={() => setHighest(true)}
            >
              最高
            </button>
            <button
              type="button"
              className={!highest ? 'active' : ''}
              onClick={() => setHighest(false)}
            >
              最低
            </button>
          </span>
        )}
      </div>

      {isCount ? (
        countRows.length === 0 ? (
          <p className="mylist-empty">
            {keyword ? `找不到「${query.trim()}」。` : '還沒有資料。'}
          </p>
        ) : (
          <ul className="mylist-list">
            {countRows.map((entry, index) => (
              <li className="mylist-item" key={`${entry.label}-${index}`}>
                <span className={`lb-rank ${entry.rank <= 3 ? 'top' : ''}`}>{entry.rank}</span>
                <div className="mylist-info">
                  <span className="mylist-name">{entry.label}</span>
                </div>
                <div className="lb-value">
                  <strong>{entry.value} 款</strong>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : scoreRows.rows.length === 0 ? (
        <p className="mylist-empty">
          {keyword ? `找不到「${query.trim()}」。` : '還沒有資料。'}
        </p>
      ) : (
        <>
          <ul className="mylist-list">
            {scoreRows.rows.map((row, index) => (
              <li className="mylist-item" key={`${row.label}-${row.game.bggName}-${index}`}>
                <span className={`lb-rank ${row.rank <= 3 ? 'top' : ''}`}>{row.rank}</span>
                <div className="mylist-thumb">{renderCover(row.game)}</div>
                <div className="mylist-info">
                  <button
                    type="button"
                    className="mylist-name"
                    onClick={() => onOpenGame(row.game)}
                  >
                    {row.game.name}
                  </button>
                  <span className="pb-who">{row.label}</span>
                </div>
                <div className="lb-value">
                  <strong>{tab === 'combo' ? `${row.value}／30` : `${row.value} 分`}</strong>
                </div>
              </li>
            ))}
          </ul>
          {scoreRows.total > TOP_ROWS && (
            <p className="sc-note">共 {scoreRows.total} 筆，只顯示前 {TOP_ROWS} 筆。</p>
          )}
        </>
      )}
    </>
  )
}
