import { useMemo, useState } from 'react'
import type { CategoryMode, LibraryGame } from '../lib/libraryTypes'

// 三個主體類型固定排最前面，其餘是副類型
const MAIN_CATEGORIES = ['策略', '派對', '陣營']

export default function CategoryFilter({
  games,
  selected,
  mode,
  onToggle,
  onModeChange,
  onClear,
}: {
  games: LibraryGame[]
  selected: string[]
  mode: CategoryMode
  onToggle: (category: string) => void
  onModeChange: (mode: CategoryMode) => void
  onClear: () => void
}) {
  const [showMore, setShowMore] = useState(false)
  const [query, setQuery] = useState('')

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const game of games) {
      for (const category of game.category) {
        map.set(category, (map.get(category) ?? 0) + 1)
      }
    }
    return map
  }, [games])

  const otherCategories = useMemo(
    () =>
      Array.from(counts.entries())
        .filter(([name]) => !MAIN_CATEGORIES.includes(name))
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant')),
    [counts],
  )

  const selectedOthers = selected.filter((c) => !MAIN_CATEGORIES.includes(c))
  const keyword = query.trim().toLocaleLowerCase()
  const visibleOthers = otherCategories.filter(([name]) =>
    name.toLocaleLowerCase().includes(keyword),
  )

  function pill(name: string) {
    const on = selected.includes(name)
    return (
      <button
        key={name}
        type="button"
        className={`filter-pill ${on ? 'on' : ''}`}
        aria-pressed={on}
        onClick={() => onToggle(name)}
      >
        {name}
        <small>{counts.get(name) ?? 0}</small>
      </button>
    )
  }

  return (
    <div className="filter-group cat-filter">
      <div className="filter-group-title">
        <span>類型</span>
        {selected.length > 0 && (
          <button type="button" className="cat-filter-clear" onClick={onClear}>
            清除類型
          </button>
        )}
      </div>

      <div className="cat-mode" role="group" aria-label="類型比對方式">
        <button
          type="button"
          className={`cat-mode-btn ${mode === 'or' ? 'on' : ''}`}
          aria-pressed={mode === 'or'}
          onClick={() => onModeChange('or')}
        >
          包含任一
        </button>
        <button
          type="button"
          className={`cat-mode-btn ${mode === 'and' ? 'on' : ''}`}
          aria-pressed={mode === 'and'}
          onClick={() => onModeChange('and')}
        >
          包含全部
        </button>
      </div>
      <p className="filter-group-hint cat-mode-hint">
        {mode === 'or'
          ? '符合所選類型中任何一個就會列出。'
          : '必須同時符合所有已選類型才會列出。'}
      </p>

      <div className="filter-pills">
        {MAIN_CATEGORIES.filter((name) => counts.has(name)).map(pill)}
        {selectedOthers.map(pill)}
        <button
          type="button"
          className="filter-pill cat-more"
          aria-expanded={showMore}
          onClick={() => setShowMore((v) => !v)}
        >
          更多類型 {showMore ? '▴' : '▾'}
          <small>{otherCategories.length}</small>
        </button>
      </div>

      {showMore && (
        <div className="cat-more-panel">
          <input
            className="cat-more-search"
            type="search"
            placeholder="搜尋類型，例如：合作"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="filter-pills cat-more-list">
            {visibleOthers.length === 0 ? (
              <p className="category-empty">找不到這個類型。</p>
            ) : (
              visibleOthers.map(([name]) => pill(name))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
