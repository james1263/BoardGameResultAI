import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { LibraryGame } from '../lib/libraryTypes'
import { useBackClose } from '../lib/useBackClose'

// 三個主體類型固定排最前面，其餘是副類型
const MAIN_CATEGORIES = ['策略', '派對', '陣營']

export default function CategoryChips({
  games,
  selected,
  onToggle,
  onClear,
  resultCount,
}: {
  games: LibraryGame[]
  selected: string[]
  onToggle: (category: string) => void
  onClear: () => void
  resultCount: number
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  useBackClose(() => setOpen(false), open)

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

  function chip(name: string) {
    const on = selected.includes(name)
    return (
      <button
        key={name}
        type="button"
        className={`quick-chip ${on ? 'on' : ''}`}
        aria-pressed={on}
        onClick={() => onToggle(name)}
      >
        {name}
        <small>{counts.get(name) ?? 0}</small>
      </button>
    )
  }

  return (
    <>
      <div className="quick-chips" role="group" aria-label="類型篩選">
        {MAIN_CATEGORIES.filter((name) => counts.has(name)).map(chip)}
        {selectedOthers.map(chip)}
        <button
          type="button"
          className="quick-chip more"
          onClick={() => setOpen(true)}
        >
          更多類型 ▾<small>{otherCategories.length}</small>
        </button>
        {selected.length > 0 && (
          <button type="button" className="quick-chip clear" onClick={onClear}>
            清除類型
          </button>
        )}
      </div>

      {open &&
        createPortal(
          <div className="cat-backdrop" onClick={() => setOpen(false)}>
            <div
              className="cat-dialog"
              role="dialog"
              aria-label="更多類型"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="cat-head">
                <h3>更多類型</h3>
                <button
                  type="button"
                  className="cat-close"
                  aria-label="關閉"
                  onClick={() => setOpen(false)}
                >
                  ×
                </button>
              </div>
              <input
                className="cat-search"
                type="search"
                placeholder="搜尋類型，例如：合作"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <p className="cat-tip">可複選，需同時符合所有已選類型。</p>
              <div className="cat-list">
                {visibleOthers.length === 0 ? (
                  <p className="cat-empty">找不到這個類型。</p>
                ) : (
                  visibleOthers.map(([name]) => chip(name))
                )}
              </div>
              <div className="cat-foot">
                <button
                  type="button"
                  className="cat-clear"
                  disabled={selected.length === 0}
                  onClick={onClear}
                >
                  清除類型
                </button>
                <button
                  type="button"
                  className="cat-done"
                  onClick={() => setOpen(false)}
                >
                  查看 {resultCount} 款結果
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}