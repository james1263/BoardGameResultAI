import type { SortKey } from '../lib/libraryTypes'

export default function SortControl({
  sortBy,
  setSortBy,
  sortDirection,
  onToggleDirection,
  onReset,
}: {
  sortBy: SortKey
  setSortBy: (value: SortKey) => void
  sortDirection: 'asc' | 'desc'
  onToggleDirection: () => void
  onReset: () => void
}) {
  const isDefault = sortBy === 'rankingEngine' && sortDirection === 'asc'

  return (
    <div className="sort-control">
      <select
        value={sortBy}
        aria-label="排序依據"
        onChange={(event) => setSortBy(event.target.value as SortKey)}
      >
        <option value="rankingEngine">Ranking engine</option>
        <option value="classicGameRanking">常玩遊戲排名</option>
        <option value="scoreRank">綜合分數排名</option>
        <option value="name">桌遊名稱</option>
        <option value="bggScore">BGG 分數</option>
        <option value="bggDifficulty">BGG 難度</option>
        <option value="bggTime">遊戲時間</option>
        <option value="bestPlayers">最佳人數</option>
        <option value="recommendPlayers">推薦人數</option>
      </select>
      <button
        type="button"
        className="sort-dir"
        onClick={onToggleDirection}
        aria-label={
          sortDirection === 'asc' ? '切換為降冪排序' : '切換為升冪排序'
        }
      >
        {sortDirection === 'asc' ? '↑ 升冪' : '↓ 降冪'}
      </button>
      {!isDefault && (
        <button type="button" className="sort-reset" onClick={onReset}>
          重設
        </button>
      )}
    </div>
  )
}