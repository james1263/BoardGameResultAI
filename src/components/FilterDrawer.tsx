import type { ReactNode } from 'react'
import {
  MINE_GROUPS,
  MINE_GROUP_LABELS,
  type MineGroup,
  type NumericFilter,
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
    difficulties,
    times,
    playerCounts,
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