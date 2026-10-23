import type { ReactNode } from 'react'
import {
  MAIN_CATEGORIES,
  MINE_GROUPS,
  MINE_GROUP_LABELS,
  type MineGroup,
  type NumericFilter,
  type SortKey,
} from '../lib/libraryTypes'
import { EyeIcon } from './Icons'

function NumberSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: ReactNode
  value: NumericFilter
  options: number[]
  onChange: (value: NumericFilter) => void
}) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value === '' ? '' : Number(event.target.value))
        }
      >
        <option value="">不限</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export type FilterDrawerProps = {
  isOpen: boolean
  onClose: () => void
  displayedGameCount: number
  clearDisabled: boolean
  onClear: () => void

  difficulties: number[]
  times: number[]
  playerCounts: number[]
  categories: string[]

  minDifficulty: NumericFilter
  setMinDifficulty: (value: NumericFilter) => void
  maxDifficulty: NumericFilter
  setMaxDifficulty: (value: NumericFilter) => void
  bestPlayerCount: NumericFilter
  setBestPlayerCount: (value: NumericFilter) => void
  recommendPlayerCount: NumericFilter
  setRecommendPlayerCount: (value: NumericFilter) => void
  minTime: NumericFilter
  setMinTime: (value: NumericFilter) => void
  maxTime: NumericFilter
  setMaxTime: (value: NumericFilter) => void

  selectedCategories: string[]
  toggleCategory: (category: string) => void
  categorySearch: string
  setCategorySearch: (value: string) => void
  isSubCategoryOpen: boolean
  setIsSubCategoryOpen: (updater: (current: boolean) => boolean) => void

  hiddenGroups: MineGroup[]
  toggleMineGroup: (group: MineGroup) => void
  groupByMine: boolean
  setGroupByMine: (value: boolean) => void

  sortBy: SortKey
  setSortBy: (value: SortKey) => void
  sortDirection: 'asc' | 'desc'
  setSortDirection: (updater: (current: 'asc' | 'desc') => 'asc' | 'desc') => void
  resetSort: () => void
}

export default function FilterDrawer(props: FilterDrawerProps) {
  const {
    isOpen,
    onClose,
    displayedGameCount,
    clearDisabled,
    onClear,
    difficulties,
    times,
    playerCounts,
    categories,
    selectedCategories,
    toggleCategory,
    categorySearch,
    setCategorySearch,
    isSubCategoryOpen,
    setIsSubCategoryOpen,
    hiddenGroups,
    toggleMineGroup,
    groupByMine,
    setGroupByMine,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    resetSort,
  } = props

  const subCategories = categories.filter(
    (category) => !MAIN_CATEGORIES.includes(category),
  )

  const visibleSubCategories = subCategories.filter((category) =>
    category
      .toLocaleLowerCase()
      .includes(categorySearch.trim().toLocaleLowerCase()),
  )

  const selectedSubCount = selectedCategories.filter(
    (category) => !MAIN_CATEGORIES.includes(category),
  ).length

  const showSubCategories = isSubCategoryOpen || categorySearch.trim() !== ''

  return (
    <>
      {isOpen && <div className="drawer-backdrop" onClick={onClose} />}

      <aside className={`filter-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <button
            className="drawer-close"
            type="button"
            aria-label="關閉篩選"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <section className="filter-panel" aria-label="桌遊篩選與排序">
          <div className="filter-heading">
            <div>
              <p className="eyebrow">FIND YOUR GAME</p>
              <h3>篩選與排序</h3>
            </div>
            <button
              className="clear-button"
              type="button"
              onClick={onClear}
              disabled={clearDisabled}
            >
              清除篩選
            </button>
          </div>

          <div className="filter-grid">
            <NumberSelect
              label="最低 BGG 難度"
              value={props.minDifficulty}
              options={difficulties}
              onChange={props.setMinDifficulty}
            />
            <NumberSelect
              label="最高 BGG 難度"
              value={props.maxDifficulty}
              options={difficulties}
              onChange={props.setMaxDifficulty}
            />
            <NumberSelect
              label="最佳人數"
              value={props.bestPlayerCount}
              options={playerCounts}
              onChange={props.setBestPlayerCount}
            />
            <NumberSelect
              label="推薦人數"
              value={props.recommendPlayerCount}
              options={playerCounts}
              onChange={props.setRecommendPlayerCount}
            />
            <NumberSelect
              label="最短遊戲時間（分鐘）"
              value={props.minTime}
              options={times}
              onChange={props.setMinTime}
            />
            <NumberSelect
              label="最長遊戲時間（分鐘）"
              value={props.maxTime}
              options={times}
              onChange={props.setMaxTime}
            />
          </div>

          <div className="category-filter">
            <div className="category-heading">
              <span>桌遊類型</span>
              <span className="category-hint">
                可複選，需同時符合所有已選類型
              </span>
            </div>

            <div className="category-main-options">
              {MAIN_CATEGORIES.filter((category) =>
                categories.includes(category),
              ).map((category) => (
                <label
                  className={`category-chip ${
                    selectedCategories.includes(category) ? 'selected' : ''
                  }`}
                  key={category}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>

            <button
              className="category-sub-toggle"
              type="button"
              onClick={() => setIsSubCategoryOpen((current) => !current)}
            >
              {showSubCategories ? '▾' : '▸'} 更多類型（
              {subCategories.length}）
              {selectedSubCount > 0 && ` · 已選 ${selectedSubCount}`}
            </button>

            {showSubCategories && (
              <>
                <input
                  className="category-search"
                  type="search"
                  placeholder="搜尋類型，例如：區控"
                  value={categorySearch}
                  onChange={(event) => setCategorySearch(event.target.value)}
                  aria-label="搜尋桌遊類型"
                />

                <div className="category-options">
                  {visibleSubCategories.map((category) => (
                    <label className="category-option" key={category}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                  {visibleSubCategories.length === 0 && (
                    <p className="category-empty">找不到符合的類型</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="mine-filter">
            <div className="category-heading">
              <span>我的紀錄</span>
              <span className="category-hint">按眼睛可隱藏該類遊戲</span>
            </div>

            <div className="mine-eyes">
              {MINE_GROUPS.map((group) => {
                const hidden = hiddenGroups.includes(group)
                return (
                  <button
                    key={group}
                    type="button"
                    className={`mine-eye ${hidden ? 'hidden' : ''}`}
                    aria-pressed={!hidden}
                    onClick={() => toggleMineGroup(group)}
                  >
                    <EyeIcon off={hidden} />
                    {MINE_GROUP_LABELS[group]}
                  </button>
                )
              })}
            </div>

            <label className="category-option">
              <input
                type="checkbox"
                checked={groupByMine}
                onChange={(event) => setGroupByMine(event.target.checked)}
              />
              <span>依我的紀錄分區顯示</span>
            </label>
            <p className="mine-note">
              想玩的遊戲就算也玩過，仍歸在「想玩」區。
            </p>
          </div>

          <div className="sort-row">
            <label className="filter-field sort-field">
              <span>排序依據</span>
              <select
                value={sortBy}
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
            </label>

            <button
              className="sort-direction-button"
              type="button"
              onClick={() =>
                setSortDirection((current) =>
                  current === 'asc' ? 'desc' : 'asc',
                )
              }
              aria-label={
                sortDirection === 'asc' ? '切換為降冪排序' : '切換為升冪排序'
              }
            >
              {sortDirection === 'asc' ? '↑ 升冪' : '↓ 降冪'}
            </button>
            <button
              className="sort-direction-button"
              type="button"
              onClick={resetSort}
              disabled={sortBy === 'rankingEngine' && sortDirection === 'asc'}
            >
              重設排序
            </button>
          </div>
        </section>

        <button
          className="rule-button drawer-done"
          type="button"
          onClick={onClose}
        >
          查看 {displayedGameCount} 款結果
        </button>
      </aside>
    </>
  )
}
