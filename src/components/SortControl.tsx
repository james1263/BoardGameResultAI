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

  // 綜合分數＝700 減 score_rank，內部由小到大等於畫面上由大到小，所以標示要反過來
  const flip = sortBy === 'scoreRank'
  const shownDirection: 'asc' | 'desc' = flip
    ? sortDirection === 'asc'
      ? 'desc'
      : 'asc'
    : sortDirection

  return (
    <div className="sort-control">
      <select
        value={sortBy}
        aria-label="排序依據"
        onChange={(event) => setSortBy(event.target.value as SortKey)}
      >
        <option value="rankingEngine">Ranking engine</option>
        <option value="classicGameRanking">常玩遊戲排名</option>
        <option value="scoreRank">綜合分數</option>
        <option value="name">桌遊名稱</option>
        <option value="bggScore">BGG 分數</option>
        <option value="bggDifficulty">BGG 難度</option>
        <option value="bggTime">遊戲時間</option>
      </select>
      <button
        type="button"
        className="sort-dir"
        onClick={onToggleDirection}
        aria-label={
          shownDirection === 'asc' ? '切換為降冪排序' : '切換為升冪排序'
        }
      >
        {shownDirection === 'asc' ? '↑ 升冪' : '↓ 降冪'}
      </button>
      <button
        type="button"
        className={`sort-reset ${isDefault ? 'is-hidden' : ''}`}
        onClick={onReset}
        disabled={isDefault}
        tabIndex={isDefault ? -1 : 0}
        aria-hidden={isDefault}
      >
        重設
      </button>
    </div>
  )
}