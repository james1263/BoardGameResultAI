import { useEffect, useRef, useState } from 'react'
import { NEW_GAME_DAYS, type ViewMode } from '../lib/libraryTypes'
import {
  LIST_COLUMN_KEYS,
  LIST_COLUMN_LABELS,
  type ListColumnKey,
  type ListColumnsState,
} from '../lib/listColumns'
import { EyeIcon } from './Icons'
import ViewToggle from './ViewToggle'
import '../styles/display-control.css'
import '../styles/properties-control.css'

// 「屬性」面板（取代原本的「顯示」）：版面、新遊戲、卡片文字，以及清單欄位的顯示／隱藏與順序
export default function PropertiesControl({
  showNew,
  onShowNewChange,
  showCardInfo,
  onShowCardInfoChange,
  viewMode,
  onViewModeChange,
  columns,
  onColumnsChange,
}: {
  showNew: boolean
  onShowNewChange: (value: boolean) => void
  showCardInfo: boolean
  onShowCardInfoChange: (value: boolean) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  columns: ListColumnsState
  onColumnsChange: (next: ListColumnsState) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const columnsUsable = viewMode === 'list' && showCardInfo
  const keyword = query.trim()
  const matches = (key: ListColumnKey) =>
    keyword === '' || LIST_COLUMN_LABELS[key].includes(keyword)

  const shownKeys = columns.order.filter((key) => !columns.hidden.includes(key))
  const hiddenKeys = columns.order.filter((key) => columns.hidden.includes(key))

  function toggle(key: ListColumnKey) {
    onColumnsChange({
      order: columns.order,
      hidden: columns.hidden.includes(key)
        ? columns.hidden.filter((k) => k !== key)
        : [...columns.hidden, key],
    })
  }

  // 只和「顯示中」的鄰居交換位置
  function move(key: ListColumnKey, direction: -1 | 1) {
    const at = shownKeys.indexOf(key)
    const neighbor = shownKeys[at + direction]
    if (neighbor === undefined) return
    const order = [...columns.order]
    const i = order.indexOf(key)
    const j = order.indexOf(neighbor)
    order[i] = neighbor
    order[j] = key
    onColumnsChange({ order, hidden: columns.hidden })
  }

  function renderRow(key: ListColumnKey, isShown: boolean) {
    const at = shownKeys.indexOf(key)
    return (
      <li className="prop-row" key={key}>
        <button
          type="button"
          className="prop-eye"
          aria-label={`${isShown ? '隱藏' : '顯示'}${LIST_COLUMN_LABELS[key]}`}
          aria-pressed={isShown}
          onClick={() => toggle(key)}
        >
          <EyeIcon off={!isShown} />
        </button>
        <span className="prop-name">{LIST_COLUMN_LABELS[key]}</span>
        {isShown && (
          <span className="prop-move">
            <button
              type="button"
              aria-label={`${LIST_COLUMN_LABELS[key]}往前移`}
              disabled={at <= 0}
              onClick={() => move(key, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={`${LIST_COLUMN_LABELS[key]}往後移`}
              disabled={at < 0 || at >= shownKeys.length - 1}
              onClick={() => move(key, 1)}
            >
              ↓
            </button>
          </span>
        )}
      </li>
    )
  }

  const shownRows = shownKeys.filter(matches)
  const hiddenRows = hiddenKeys.filter(matches)

  return (
    <div className="display-control" ref={rootRef}>
      <button
        type="button"
        className={`display-btn ${open ? 'open' : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((current) => !current)}
      >
        屬性
      </button>
      {open && (
        <div className="display-panel prop-panel" role="group" aria-label="屬性">
          <div className="display-view">
            <span>版面</span>
            <ViewToggle viewMode={viewMode} onChange={onViewModeChange} />
          </div>
          <label className="display-option">
            <input
              type="checkbox"
              checked={showNew}
              onChange={(event) => onShowNewChange(event.target.checked)}
            />
            <span>顯示新遊戲（{NEW_GAME_DAYS} 天內加入）</span>
          </label>
          <label className="display-option">
            <input
              type="checkbox"
              checked={showCardInfo}
              onChange={(event) => onShowCardInfoChange(event.target.checked)}
            />
            <span>顯示卡片文字</span>
          </label>

          <div className="prop-section">
            <div className="prop-head">
              <strong>清單欄位</strong>
              <span className="prop-bulk">
                <button
                  type="button"
                  disabled={!columnsUsable || hiddenKeys.length === 0}
                  onClick={() =>
                    onColumnsChange({ order: columns.order, hidden: [] })
                  }
                >
                  全部顯示
                </button>
                <button
                  type="button"
                  disabled={!columnsUsable || shownKeys.length === 0}
                  onClick={() =>
                    onColumnsChange({
                      order: columns.order,
                      hidden: [...LIST_COLUMN_KEYS],
                    })
                  }
                >
                  全部隱藏
                </button>
              </span>
            </div>
            {!columnsUsable && (
              <p className="prop-hint">
                只在「清單」版面且開啟卡片文字時才會套用。
              </p>
            )}
            <input
              type="search"
              className="prop-search"
              placeholder="搜尋屬性"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className={columnsUsable ? '' : 'prop-dim'}>
              {shownRows.length > 0 && (
                <>
                  <p className="prop-sub">已在表格中顯示</p>
                  <ul className="prop-list">
                    {shownRows.map((key) => renderRow(key, true))}
                  </ul>
                </>
              )}
              {hiddenRows.length > 0 && (
                <>
                  <p className="prop-sub">已在表格中隱藏</p>
                  <ul className="prop-list">
                    {hiddenRows.map((key) => renderRow(key, false))}
                  </ul>
                </>
              )}
              {shownRows.length === 0 && hiddenRows.length === 0 && (
                <p className="prop-hint">找不到符合的屬性。</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
