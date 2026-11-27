import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  DIFFICULTY_LEVELS,
  DIFFICULTY_LEVEL_INFO,
  MAIN_CATEGORIES,
  RATING_FILTER_LABELS,
  TIME_LIMITS,
  type CategoryMode,
  type DifficultyLevel,
  type LibraryGame,
  type MineGroup,
  type NumericFilter,
  type RatingFilter,
} from '../lib/libraryTypes'
import '../styles/home-toolbar.css'
import '../styles/filter-sheet.css'

// 篩選面板（仿 Notion）：已套用的條件一條一列，點開改值，「＋ 新增篩選」挑屬性。
// 篩選邏輯與狀態都在 App.tsx，這裡只是換一個操作畫面，props 與舊的 FilterDrawer 相同。
export type FilterDrawerProps = {
  isOpen: boolean
  onClose: () => void
  displayedGameCount: number
  clearDisabled: boolean
  onClear: () => void

  playerCounts: number[]
  groupSizes: number[]

  games: LibraryGame[]
  selectedCategories: string[]
  categoryMode: CategoryMode
  onToggleCategory: (category: string) => void
  onCategoryModeChange: (mode: CategoryMode) => void
  onClearCategories: () => void

  groupSize: NumericFilter
  setGroupSize: (value: NumericFilter) => void
  groupSizeMax: NumericFilter
  setGroupSizeMax: (value: NumericFilter) => void
  bestPlayerCount: NumericFilter
  setBestPlayerCount: (value: NumericFilter) => void
  recommendPlayerCount: NumericFilter
  setRecommendPlayerCount: (value: NumericFilter) => void

  timeLimit: NumericFilter
  setTimeLimit: (value: NumericFilter) => void

  difficultyLevels: DifficultyLevel[]
  toggleDifficultyLevel: (level: DifficultyLevel) => void

  ratingFilter: RatingFilter
  setRatingFilter: (value: RatingFilter) => void
  canFilterByRating: boolean

  hiddenGroups: MineGroup[]
  toggleMineGroup: (group: MineGroup) => void
  groupByMine: boolean
  setGroupByMine: (value: boolean) => void
}

type PropKey =
  | 'cat'
  | 'people'
  | 'best'
  | 'recommend'
  | 'time'
  | 'difficulty'
  | 'rating'

const PROPS: { key: PropKey; label: string; icon: string }[] = [
  { key: 'cat', label: '類型', icon: '≡' },
  { key: 'people', label: '我們有幾個人', icon: '#' },
  { key: 'best', label: '最佳人數', icon: '#' },
  { key: 'recommend', label: '推薦人數', icon: '#' },
  { key: 'time', label: '遊戲時間', icon: '◷' },
  { key: 'difficulty', label: 'BGG 難度', icon: '#' },
  { key: 'rating', label: '評分狀態', icon: '★' },
]

type Page = { kind: 'pick' } | { kind: 'edit'; prop: PropKey }

function CheckRow({
  label,
  sub,
  checked,
  radio = false,
  disabled = false,
  onClick,
}: {
  label: ReactNode
  sub?: ReactNode
  checked: boolean
  radio?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="fs-row"
      role={radio ? 'radio' : 'checkbox'}
      aria-checked={checked}
      disabled={disabled}
      onClick={onClick}
    >
      <span className={`fs-box ${radio ? 'radio' : ''} ${checked ? 'on' : ''}`}>
        {checked ? '✓' : ''}
      </span>
      <span className="fs-row-label">{label}</span>
      {sub !== undefined && <span className="fs-row-sub">{sub}</span>}
    </button>
  )
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
    games,
    selectedCategories,
    categoryMode,
    groupSize,
    groupSizeMax,
    bestPlayerCount,
    recommendPlayerCount,
    timeLimit,
    difficultyLevels,
    ratingFilter,
    canFilterByRating,
  } = props

  const [page, setPage] = useState<Page>({ kind: 'pick' })
  const [catQuery, setCatQuery] = useState('')
  const [propQuery, setPropQuery] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setPage({ kind: 'pick' })
      setCatQuery('')
      setPropQuery('')
    }
  }, [isOpen])

  const categoryList = useMemo(() => {
    const counts = new Map<string, number>()
    for (const game of games) {
      for (const category of game.category) {
        counts.set(category, (counts.get(category) ?? 0) + 1)
      }
    }
    const main = MAIN_CATEGORIES.filter((name) => counts.has(name))
    const others = Array.from(counts.entries())
      .filter(([name]) => !MAIN_CATEGORIES.includes(name))
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant'))
      .map(([name]) => name)
    return [...main, ...others].map((name) => ({
      name,
      count: counts.get(name) ?? 0,
    }))
  }, [games])

  const active: Record<PropKey, boolean> = {
    cat: selectedCategories.length > 0,
    people: groupSize !== '' || groupSizeMax !== '',
    best: bestPlayerCount !== '',
    recommend: recommendPlayerCount !== '',
    time: timeLimit !== '',
    difficulty: difficultyLevels.length > 0,
    rating: ratingFilter !== 'all',
  }
  const activeProps = PROPS.filter((p) => active[p.key])

  function summary(key: PropKey): string {
    switch (key) {
      case 'cat':
        return `${categoryMode === 'or' ? '包含任一' : '包含全部'}：${selectedCategories.join('、')}`
      case 'people':
        return groupSize !== '' && groupSizeMax !== ''
          ? `${groupSize}～${groupSizeMax} 人`
          : `${groupSize !== '' ? groupSize : groupSizeMax} 人`
      case 'best':
        return `= ${bestPlayerCount} 人`
      case 'recommend':
        return `= ${recommendPlayerCount} 人`
      case 'time':
        return `≤ ${timeLimit} 分鐘`
      case 'difficulty':
        return DIFFICULTY_LEVELS.filter((l) => difficultyLevels.includes(l))
          .map((l) => DIFFICULTY_LEVEL_INFO[l].name)
          .join('、')
      case 'rating':
        return RATING_FILTER_LABELS[ratingFilter]
    }
  }

  function clearProp(key: PropKey) {
    switch (key) {
      case 'cat':
        props.onClearCategories()
        break
      case 'people':
        props.setGroupSize('')
        props.setGroupSizeMax('')
        break
      case 'best':
        props.setBestPlayerCount('')
        break
      case 'recommend':
        props.setRecommendPlayerCount('')
        break
      case 'time':
        props.setTimeLimit('')
        break
      case 'difficulty':
        for (const level of difficultyLevels) props.toggleDifficultyLevel(level)
        break
      case 'rating':
        props.setRatingFilter('all')
        break
    }
  }

  if (!isOpen) return null

  const propLabel = (key: PropKey) => PROPS.find((p) => p.key === key)?.label ?? ''

  function numberSelect(
    label: string,
    value: NumericFilter,
    options: number[],
    onChange: (v: NumericFilter) => void,
  ) {
    return (
      <label className="fs-field">
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

  function renderEdit(key: PropKey) {
    switch (key) {
      case 'cat': {
        const keyword = catQuery.trim().toLocaleLowerCase()
        const shown = categoryList.filter((c) =>
          c.name.toLocaleLowerCase().includes(keyword),
        )
        return (
          <>
            <div className="fs-seg" role="radiogroup" aria-label="類型比對方式">
              <button
                type="button"
                role="radio"
                aria-checked={categoryMode === 'or'}
                className={categoryMode === 'or' ? 'on' : ''}
                onClick={() => props.onCategoryModeChange('or')}
              >
                包含任一
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={categoryMode === 'and'}
                className={categoryMode === 'and' ? 'on' : ''}
                onClick={() => props.onCategoryModeChange('and')}
              >
                包含全部
              </button>
            </div>
            <input
              type="search"
              className="fs-search"
              placeholder="搜尋一或多個選項…"
              value={catQuery}
              onChange={(event) => setCatQuery(event.target.value)}
            />
            <div className="fs-list">
              {shown.length === 0 ? (
                <p className="fs-empty">找不到這個類型。</p>
              ) : (
                shown.map((c) => (
                  <CheckRow
                    key={c.name}
                    label={c.name}
                    sub={c.count}
                    checked={selectedCategories.includes(c.name)}
                    onClick={() => props.onToggleCategory(c.name)}
                  />
                ))
              )}
            </div>
          </>
        )
      }
      case 'people':
        return (
          <>
            <p className="fs-tip">
              只列出整個人數區間都玩得起來的遊戲；只選一邊，就是剛好這個人數。
            </p>
            <div className="fs-fields">
              {numberSelect('最少', groupSize, groupSizes, props.setGroupSize)}
              {numberSelect('最多', groupSizeMax, groupSizes, props.setGroupSizeMax)}
            </div>
          </>
        )
      case 'best':
      case 'recommend': {
        const value = key === 'best' ? bestPlayerCount : recommendPlayerCount
        const set = key === 'best' ? props.setBestPlayerCount : props.setRecommendPlayerCount
        return (
          <div className="fs-list">
            {playerCounts.map((n) => (
              <CheckRow
                key={n}
                radio
                label={`${n} 人`}
                checked={value === n}
                onClick={() => set(value === n ? '' : n)}
              />
            ))}
          </div>
        )
      }
      case 'time':
        return (
          <>
            <p className="fs-tip">不超過幾分鐘；再按一次可取消。</p>
            <div className="fs-list">
              {TIME_LIMITS.map((limit) => (
                <CheckRow
                  key={limit}
                  radio
                  label={`${limit} 分鐘以內`}
                  checked={timeLimit === limit}
                  onClick={() => props.setTimeLimit(timeLimit === limit ? '' : limit)}
                />
              ))}
            </div>
          </>
        )
      case 'difficulty':
        return (
          <div className="fs-list">
            {DIFFICULTY_LEVELS.map((level) => (
              <CheckRow
                key={level}
                label={DIFFICULTY_LEVEL_INFO[level].name}
                sub={DIFFICULTY_LEVEL_INFO[level].range}
                checked={difficultyLevels.includes(level)}
                onClick={() => props.toggleDifficultyLevel(level)}
              />
            ))}
          </div>
        )
      case 'rating':
        return (
          <>
            {!canFilterByRating && <p className="fs-tip">登入後才能使用。</p>}
            <div className="fs-list">
              {(['rated', 'unrated'] as const).map((value) => (
                <CheckRow
                  key={value}
                  radio
                  disabled={!canFilterByRating}
                  label={RATING_FILTER_LABELS[value]}
                  checked={ratingFilter === value}
                  onClick={() =>
                    props.setRatingFilter(ratingFilter === value ? 'all' : value)
                  }
                />
              ))}
            </div>
          </>
        )
    }
  }

  let title = ''
  let body: ReactNode = null
  let showBack = false

  if (page.kind === 'pick') {
    title = activeProps.length === 0 ? '篩選' : `篩選（${activeProps.length}）`
    const keyword = propQuery.trim()
    body = (
      <>
        <input
          type="search"
          className="fs-search"
          placeholder="搜尋屬性…"
          value={propQuery}
          onChange={(event) => setPropQuery(event.target.value)}
        />
        <div className="fs-list">
          {PROPS.filter((p) => keyword === '' || p.label.includes(keyword)).map((p) => (
            <div className="fs-rule" key={p.key}>
              <button
                type="button"
                className="fs-row fs-pick"
                onClick={() => setPage({ kind: 'edit', prop: p.key })}
              >
                <span className="fs-ico" aria-hidden="true">
                  {p.icon}
                </span>
                <span className="fs-row-label">{p.label}</span>
                {active[p.key] && <span className="fs-row-sub fs-sum">{summary(p.key)}</span>}
                {!active[p.key] && (
                  <span className="fs-chev" aria-hidden="true">
                    ›
                  </span>
                )}
              </button>
              {active[p.key] && (
                <button
                  type="button"
                  className="fs-x"
                  aria-label={`移除篩選：${p.label}`}
                  onClick={() => clearProp(p.key)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="fs-foot">
          <button
            type="button"
            className="fs-clear"
            disabled={clearDisabled}
            onClick={onClear}
          >
            清除全部
          </button>
          <button type="button" className="fs-view" onClick={onClose}>
            查看 {displayedGameCount} 款結果
          </button>
        </div>
      </>
    )
  } else {
    title = propLabel(page.prop)
    showBack = true
    body = (
      <>
        {renderEdit(page.prop)}
        {active[page.prop] && (
          <button
            type="button"
            className="fs-remove"
            onClick={() => {
              clearProp(page.prop)
              setPage({ kind: 'pick' })
            }}
          >
            刪除這個篩選
          </button>
        )}
      </>
    )
  }

  return createPortal(
    <div className="ht-backdrop" onClick={onClose}>
      <div
        className="ht-sheet fs-sheet"
        role="dialog"
        aria-label="篩選"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ht-grip" aria-hidden="true" />
        <div className="ht-sheet-head fs-head">
          {showBack ? (
            <button
              type="button"
              className="fs-back"
              aria-label="返回"
              onClick={() => setPage({ kind: 'pick' })}
            >
              ‹
            </button>
          ) : (
            <span className="fs-back" />
          )}
          <strong>{title}</strong>
          <button type="button" className="ht-done" onClick={onClose}>
            完成
          </button>
        </div>
        <div className="fs-body">{body}</div>
      </div>
    </div>,
    document.body,
  )
}
