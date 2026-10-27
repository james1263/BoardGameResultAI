import type { ReactNode } from 'react'
import {
  DIFFICULTY_LEVELS,
  DIFFICULTY_LEVEL_INFO,
  MINE_GROUPS,
  MINE_GROUP_LABELS,
  NEW_GAME_DAYS,
  RATING_FILTERS,
  RATING_FILTER_LABELS,
  TIME_LIMITS,
  type DifficultyLevel,
  type MineGroup,
  type NumericFilter,
  type RatingFilter,
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

  playerCounts: number[]
  groupSizes: number[]

  groupSize: NumericFilter
  setGroupSize: (value: NumericFilter) => void
  bestPlayerCount: NumericFilter
  setBestPlayerCount: (value: NumericFilter) => void
  recommendPlayerCount: NumericFilter
  setRecommendPlayerCount: (value: NumericFilter) => void

  timeLimit: NumericFilter
  setTimeLimit: (value: NumericFilter) => void

  difficultyLevels: DifficultyLevel[]
  toggleDifficultyLevel: (level: DifficultyLevel) => void

  onlyNew: boolean
  setOnlyNew: (value: boolean) => void

  ratingFilter: RatingFilter
  setRatingFilter: (value: RatingFilter) => void
  canFilterByRating: boolean

  hiddenGroups: MineGroup[]
  toggleMineGroup: (group: MineGroup) => void
  groupByMine: boolean
  setGroupByMine: (value: boolean) => void
}

export default function FilterDrawer(props: FilterDrawerProps) {
  const {
    isOpen,
    onClose,
    displayedGameCount,
    clearDisabled,
    onClear,
    playerCounts,
    groupSizes,
    timeLimit,
    setTimeLimit,
    difficultyLevels,
    toggleDifficultyLevel,
    onlyNew,
    setOnlyNew,
    ratingFilter,
    setRatingFilter,
    canFilterByRating,
    hiddenGroups,
    toggleMineGroup,
    groupByMine,
    setGroupByMine,
  } = props

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

        <section className="filter-panel" aria-label="桌遊進階篩選">
          <div className="filter-heading">
            <div>
              <p className="eyebrow">FIND YOUR GAME</p>
              <h3>進階篩選</h3>
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

          <div className="filter-group">
            <NumberSelect
              label="我們有幾個人？"
              value={props.groupSize}
              options={groupSizes}
              onChange={props.setGroupSize}
            />
            <p className="filter-group-hint">
              只列出這個人數玩得起來的遊戲。
            </p>
          </div>

          <div className="filter-grid filter-grid-spaced">
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
          </div>

          <div className="filter-group">
            <div className="filter-group-title">
              <span>遊戲時間</span>
              <span className="filter-group-hint">不超過幾分鐘（再按一次取消）</span>
            </div>
            <div className="filter-pills">
              {TIME_LIMITS.map((limit) => {
                const on = timeLimit === limit
                return (
                  <button
                    key={limit}
                    type="button"
                    className={`filter-pill ${on ? 'on' : ''}`}
                    aria-pressed={on}
                    onClick={() => setTimeLimit(on ? '' : limit)}
                  >
                    {limit} 分鐘
                  </button>
                )
              })}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-group-title">
              <span>BGG 難度</span>
              <span className="filter-group-hint">可複選</span>
            </div>
            <div className="filter-pills">
              {DIFFICULTY_LEVELS.map((level) => {
                const on = difficultyLevels.includes(level)
                const info = DIFFICULTY_LEVEL_INFO[level]
                return (
                  <button
                    key={level}
                    type="button"
                    className={`filter-pill ${on ? 'on' : ''}`}
                    aria-pressed={on}
                    onClick={() => toggleDifficultyLevel(level)}
                  >
                    {info.name}
                    <small>{info.range}</small>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="filter-group">
            <label className="category-option">
              <input
                type="checkbox"
                checked={onlyNew}
                onChange={(event) => setOnlyNew(event.target.checked)}
              />
              <span>只看新遊戲（{NEW_GAME_DAYS} 天內加入）</span>
            </label>
          </div>

          <p className="drawer-tip">桌遊類型請在首頁上方的膠囊選擇。</p>

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

            <div className="filter-group">
              <div className="filter-group-title">
                <span>評分狀態</span>
                {!canFilterByRating && (
                  <span className="filter-group-hint">登入後才能使用</span>
                )}
              </div>
              <div className="filter-pills">
                {RATING_FILTERS.map((value) => {
                  const on = ratingFilter === value
                  return (
                    <button
                      key={value}
                      type="button"
                      className={`filter-pill ${on ? 'on' : ''}`}
                      aria-pressed={on}
                      disabled={!canFilterByRating && value !== 'all'}
                      onClick={() => setRatingFilter(value)}
                    >
                      {RATING_FILTER_LABELS[value]}
                    </button>
                  )
                })}
              </div>
            </div>
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
