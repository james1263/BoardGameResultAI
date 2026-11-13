import { useMemo, useState, type ReactNode } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import type { PlayerStat } from '../lib/usePlayerStats'
import { rankGames } from '../lib/leaderboards'
import { isUnplayedGame } from '../lib/playedStatus'
import InfoHint from './InfoHint'
import { FAVORITE_MEDALS, useFavoriteBoards } from './FavoriteGames'
import '../styles/players-board-games.css'

type Tab = 'played' | 'rated' | 'score' | 'combo' | 'fav'

const TABS: { key: Tab; label: string }[] = [
  { key: 'played', label: '玩過最多' },
  { key: 'rated', label: '評過最多' },
  { key: 'score', label: '評分' },
  { key: 'combo', label: '綜合分數' },
  { key: 'fav', label: '本命桌遊' },
]

const TOP_COUNT = 10 // 款數榜：前 10 名（同分並列）

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
  const favBoards = useFavoriteBoards(tab === 'fav')

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

  // 評分榜（評分、綜合分數）：以玩家為主、不排名；每位玩家列出他分數最高（或最低）的遊戲，同分就列多款
  const scoreRows = useMemo(() => {
    if (tab !== 'score' && tab !== 'combo') return []
    const result: { label: string; value: number; games: BoardGame[] }[] = []
    for (const player of visible) {
      let best: number | null = null
      let games: BoardGame[] = []
      for (const rating of player.ratings) {
        const value = tab === 'score' ? rating.o : rating.s
        const game = gameByName.get(rating.g)
        if (value == null || !game || isUnplayedGame(game)) continue
        if (best == null || (highest ? value > best : value < best)) {
          best = value
          games = [game]
        } else if (value === best) {
          games.push(game)
        }
      }
      if (best == null) continue
      games.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
      result.push({ label: labelOf(player), value: best, games })
    }
    const matched = keyword
      ? result.filter(
        (row) =>
          row.label.toLowerCase().includes(keyword) ||
          row.games.some(
            (game) =>
              game.name.toLowerCase().includes(keyword) ||
              game.bggName.toLowerCase().includes(keyword),
          ),
      )
      : result
    return matched.sort((a, b) => a.label.localeCompare(b.label, 'zh-Hant'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, visible, keyword, highest, gameByName, isAdmin])

  // 名稱太長只顯示前 5 個字，完整名稱放在 title
  const shortName = (name: string) => {
    const chars = Array.from(name)
    return chars.length > 5 ? chars.slice(0, 5).join('') + '…' : name
  }

  const isCount = tab === 'played' || tab === 'rated'
  const isFav = tab === 'fav'

  // 本命桌遊：每位玩家一列，依序冠軍、亞軍、季軍；隱藏暱稱者一律顯示「匿名玩家」（管理者另看得到本人）
  const favRows = useMemo(() => {
    if (!isFav) return []
    return favBoards.rows
      .filter((row) => !(hideAdmin && row.isAdminAccount))
      .map((row) => ({
        ...row,
        list: row.games.flatMap((name, index) => {
          const game = gameByName.get(name)
          return game ? [{ game, medal: FAVORITE_MEDALS[index] ?? '' }] : []
        }),
      }))
      .filter((row) => row.list.length > 0)
      .filter(
        (row) =>
          !keyword ||
          row.label.toLowerCase().includes(keyword) ||
          row.list.some(({ game }) => game.name.toLowerCase().includes(keyword)),
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFav, favBoards.rows, hideAdmin, keyword, gameByName])

  const hint =
    tab === 'played'
      ? '依已玩的遊戲款數排名（只統計 VIP 玩家與管理者）。選擇隱藏暱稱的玩家仍會列入，但一律顯示「匿名玩家」，只有管理者看得到本人。'
      : tab === 'fav'
        ? '每位玩家自己選的本命桌遊，依序是冠軍、亞軍、季軍（最多 3 款）。選擇隱藏暱稱的玩家一律顯示「匿名玩家」，只有管理者看得到本人。'
        : tab === 'rated'
          ? '依評過分的遊戲款數排名。管理者的分數是從 CSV 換算，算法和一般玩家的評分一樣。'
          : tab === 'score'
            ? '以玩家為主，不排名。每位玩家顯示他給過整體分數（1～10）最高的遊戲，同分就列出多款；切到「最低」顯示他給最低分的遊戲。還沒玩過的遊戲不列入。'
            : '以玩家為主，不排名。綜合分數＝喜歡度、玩家影響性、溝通度、變化度、獨特性、適合留下來這六項（各 1～5）加起來，最高 30 分，不含整體分數。每位玩家顯示最高（或最低）的遊戲，同分列多款；六項沒填完整的評分、還沒玩過的遊戲不列入。'

  if (status === 'loading' || status === 'idle') return <p className="mylist-empty">讀取中…</p>
  if (status === 'error') {
    return (
      <p className="mylist-empty">讀取玩家榜失敗，請稍後再試，或重新整理網頁。</p>
    )
  }

  return (
    <>
      <div className="lbc-boards" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            className={`lbc-board ${tab === item.key ? 'active' : ''}`}
            onClick={(event) => {
              setTab(item.key)
              event.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
            }}
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
        {!isCount && !isFav && (
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

      {isFav ? (
        favBoards.status === 'loading' || favBoards.status === 'idle' ? (
          <p className="mylist-empty">讀取中…</p>
        ) : favBoards.status === 'error' ? (
          <p className="mylist-empty">讀取本命桌遊失敗，請稍後再試。</p>
        ) : favRows.length === 0 ? (
          <p className="mylist-empty">
            {keyword ? `找不到「${query.trim()}」。` : '還沒有人設定本命桌遊。'}
          </p>
        ) : (
          <>
            <ul className="mylist-list pbg-list">
              {favRows.map((row, index) => (
                <li className="pbg-row" key={`${row.label}-${index}`}>
                  <div className="pbg-head">
                    <span className="pbg-who">
                      {row.label}
                      {row.hidden && <span className="fv-tag">（隱藏暱稱）</span>}
                    </span>
                  </div>
                  <div className="fv-games">
                    {row.list.map(({ game, medal }) => (
                      <button
                        type="button"
                        className="fv-game"
                        key={game.bggName}
                        title={game.name}
                        onClick={() => onOpenGame(game)}
                      >
                        <span className="fv-thumb">{renderCover(game)}</span>
                        <span className="fv-game-name">
                          {medal} {shortName(game.name)}
                        </span>
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <p className="sc-note">共 {favRows.length} 位玩家。</p>
          </>
        )
      ) : isCount ? (
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
      ) : scoreRows.length === 0 ? (
        <p className="mylist-empty">
          {keyword ? `找不到「${query.trim()}」。` : '還沒有資料。'}
        </p>
      ) : (
        <>
          <ul className="mylist-list pbg-list">
            {scoreRows.map((row, index) => (
              <li className="pbg-row" key={`${row.label}-${index}`}>
                <div className="pbg-head">
                  <span className="pbg-who">{row.label}</span>
                  <strong className="pbg-score">
                    {tab === 'combo' ? `${row.value}／30` : `${row.value} 分`}
                  </strong>
                </div>
                <div className="pbg-games">
                  {row.games.map((game) => (
                    <button
                      type="button"
                      className="pbg-game"
                      key={game.bggName}
                      title={game.name}
                      onClick={() => onOpenGame(game)}
                    >
                      <span className="pbg-thumb">{renderCover(game)}</span>
                      <span className="pbg-name">{shortName(game.name)}</span>
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <p className="sc-note">共 {scoreRows.length} 位玩家，依暱稱排序。</p>
        </>
      )}
    </>
  )
}
