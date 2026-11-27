import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  MINE_GROUPS,
  MINE_GROUP_LABELS,
  NEW_GAME_DAYS,
  isSortKeyAllowed,
  type ExtraSort,
  type MineGroup,
  type SortKey,
  type ViewMode,
} from '../lib/libraryTypes'
import { useBackClose } from '../lib/useBackClose'
import ViewToggle from './ViewToggle'
import '../styles/home-toolbar.css'

const MAX_EXTRA_SORTS = 2

function optionList(isAdmin: boolean, showMyScores: boolean) {
  const list: { value: SortKey; label: string }[] = []
  if (isAdmin) {
    list.push(
      { value: 'rankingEngine', label: 'Ranking engine' },
      { value: 'classicGameRanking', label: '常玩遊戲排名' },
      { value: 'scoreRank', label: '綜合分數' },
    )
  } else {
    list.push({ value: 'rankingEngine', label: '預設排序' })
    if (showMyScores) {
      list.push(
        { value: 'myOverall', label: '我的整體分數' },
        { value: 'myComposite', label: '我的綜合評分' },
      )
    }
  }
  list.push(
    { value: 'name', label: '桌遊名稱' },
    { value: 'bggScore', label: 'BGG 分數' },
    { value: 'bggDifficulty', label: 'BGG 難度' },
    { value: 'bggTime', label: '遊戲時間' },
  )
  return list
}

const svgProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function SearchIcon() {
  return (
    <svg {...svgProps}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  )
}

function SortIcon() {
  return (
    <svg {...svgProps}>
      <path d="M8 5v14M8 19l-3-3M8 19l3-3" />
      <path d="M16 19V5M16 5l-3 3M16 5l3 3" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg {...svgProps}>
      <path d="M4 7h16M7 12h10M10 17h4" />
    </svg>
  )
}

function SlidersIcon() {
  return (
    <svg {...svgProps}>
      <path d="M4 8h9M17 8h3M4 16h3M11 16h9" />
      <circle cx="15" cy="8" r="2" />
      <circle cx="9" cy="16" r="2" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg {...svgProps}>
      <path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-4.5 3.5V16H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
    </svg>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg {...svgProps} width={20} height={20} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg {...svgProps} width={20} height={20} strokeWidth={2.4}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useBackClose(onClose, true)
  return createPortal(
    <div className="ht-backdrop" onClick={onClose}>
      <div
        className="ht-sheet"
        role="dialog"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ht-grip" aria-hidden="true" />
        <div className="ht-sheet-head">
          <strong>{title}</strong>
          <button type="button" className="ht-done" onClick={onClose}>
            完成
          </button>
        </div>
        <div className="ht-sheet-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export default function HomeToolbar({
  searchText,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortDirection,
  onToggleDirection,
  extraSorts,
  onExtraSortsChange,
  isAdmin,
  hasSession,
  filterCount,
  onOpenFilter,
  showNew,
  onShowNewChange,
  showCardInfo,
  onShowCardInfoChange,
  viewMode,
  onViewModeChange,
  hiddenGroups,
  onHiddenGroupsChange,
  groupByMine,
  onGroupByMineChange,
  showBoard,
  boardBadge,
  onOpenBoard,
  rightSlot,
}: {
  searchText: string
  onSearchChange: (value: string) => void
  sortBy: SortKey
  onSortByChange: (value: SortKey) => void
  sortDirection: 'asc' | 'desc'
  onToggleDirection: () => void
  extraSorts: ExtraSort[]
  onExtraSortsChange: (next: ExtraSort[]) => void
  isAdmin: boolean
  hasSession: boolean
  filterCount: number
  onOpenFilter: () => void
  showNew: boolean
  onShowNewChange: (value: boolean) => void
  showCardInfo: boolean
  onShowCardInfoChange: (value: boolean) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  hiddenGroups: MineGroup[]
  onHiddenGroupsChange: (next: MineGroup[]) => void
  groupByMine: boolean
  onGroupByMineChange: (value: boolean) => void
  // 留言板圖示（VIP／管理者才有）
  showBoard?: boolean
  boardBadge?: string | number | null
  onOpenBoard?: () => void
  // 靠右的其他按鈕（小工具）
  rightSlot?: ReactNode
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [panel, setPanel] = useState<'sort' | 'props' | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const searching = searchOpen || searchText !== ''
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  const options = optionList(isAdmin, hasSession)
  const activeExtras = extraSorts.filter(
    (s) => s.key !== sortBy && isSortKeyAllowed(s.key, isAdmin, hasSession),
  )
  const usedKeys = [sortBy, ...activeExtras.map((s) => s.key)]
  const sortCount = 1 + activeExtras.length

  function shownDir(key: SortKey, dir: 'asc' | 'desc'): 'asc' | 'desc' {
    // 綜合分數內部由小到大等於畫面上由大到小，標示要反過來
    if (key !== 'scoreRank') return dir
    return dir === 'asc' ? 'desc' : 'asc'
  }
  function dirLabel(key: SortKey, dir: 'asc' | 'desc') {
    return shownDir(key, dir) === 'asc' ? '升冪 ↑' : '降冪 ↓'
  }

  // 「只看想玩／只看已玩」：就是把其他分類都隱藏（和「屬性」裡的「隱藏」勾選是同一份狀態）
  function onlyGroupHidden(group: MineGroup): MineGroup[] {
    return MINE_GROUPS.filter((g) => g !== group)
  }
  function isOnly(group: MineGroup) {
    const hidden = onlyGroupHidden(group)
    return (
      hiddenGroups.length === hidden.length &&
      hidden.every((g) => hiddenGroups.includes(g))
    )
  }
  function toggleOnly(group: MineGroup) {
    onHiddenGroupsChange(isOnly(group) ? [] : onlyGroupHidden(group))
  }
  function toggleHidden(group: MineGroup) {
    onHiddenGroupsChange(
      hiddenGroups.includes(group)
        ? hiddenGroups.filter((g) => g !== group)
        : [...hiddenGroups, group],
    )
  }

  function updateExtra(index: number, patch: Partial<ExtraSort>) {
    onExtraSortsChange(
      activeExtras.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    )
  }

  function addSort() {
    const next = options.find((o) => !usedKeys.includes(o.value))
    if (!next) return
    onExtraSortsChange([...activeExtras, { key: next.value, direction: 'asc' }])
  }

  return (
    <div className="ht-wrap">
      <div className="ht-bar" role="toolbar" aria-label="搜尋、排序與篩選">
        <div className="ht-icons">
          <button
            type="button"
            className={`ht-btn ${searching ? 'on' : ''}`}
            aria-label="搜尋"
            aria-expanded={searching}
            onClick={() => setSearchOpen((v) => !v)}
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            className={`ht-btn ${sortCount > 1 || sortBy !== 'rankingEngine' ? 'on' : ''}`}
            aria-label="排序"
            onClick={() => setPanel('sort')}
          >
            <SortIcon />
            {sortCount > 1 && <span className="ht-badge">{sortCount}</span>}
          </button>
          <button
            type="button"
            className={`ht-btn ${filterCount > 0 ? 'on' : ''}`}
            aria-label={filterCount > 0 ? `篩選，已套用 ${filterCount} 項` : '篩選'}
            onClick={onOpenFilter}
          >
            <FilterIcon />
            {filterCount > 0 && <span className="ht-badge">{filterCount}</span>}
          </button>
          <button
            type="button"
            className="ht-btn"
            aria-label="屬性"
            onClick={() => setPanel('props')}
          >
            <SlidersIcon />
          </button>
        </div>

        {hasSession && (
          <div className="ht-mine" role="group" aria-label="只看想玩或已玩">
            <button
              type="button"
              className={`ht-btn ht-mini ${isOnly('want') ? 'on' : ''}`}
              aria-label="只看想玩"
              aria-pressed={isOnly('want')}
              onClick={() => toggleOnly('want')}
            >
              <HeartIcon filled={isOnly('want')} />
            </button>
            <button
              type="button"
              className={`ht-btn ht-mini ${isOnly('played') ? 'on' : ''}`}
              aria-label="只看已玩"
              aria-pressed={isOnly('played')}
              onClick={() => toggleOnly('played')}
            >
              <CheckIcon />
            </button>
          </div>
        )}

        <div className="ht-right">
          {showBoard && (
            <button
              type="button"
              className="ht-btn"
              aria-label={boardBadge ? `留言板，${boardBadge} 則新討論` : '留言板'}
              onClick={onOpenBoard}
            >
              <ChatIcon />
              {boardBadge ? <span className="ht-badge">{boardBadge}</span> : null}
            </button>
          )}
          {rightSlot}
        </div>

        {searching && (
          <label className="ht-search">
            <input
              ref={inputRef}
              type="search"
              placeholder="搜尋桌遊名稱，例如：璀璨寶石"
              value={searchText}
              onChange={(event) => onSearchChange(event.target.value)}
              aria-label="搜尋桌遊名稱"
            />
            <button
              type="button"
              className="ht-search-x"
              aria-label="清除並收起搜尋"
              onClick={() => {
                onSearchChange('')
                setSearchOpen(false)
              }}
            >
              ×
            </button>
          </label>
        )}
      </div>

      {panel === 'sort' && (
        <Sheet title="排序" onClose={() => setPanel(null)}>
          <p className="ht-tip">上一層相同時，才看下一層。</p>

          <div className="ht-row">
            <span className="ht-step">先依</span>
            <select
              value={sortBy}
              aria-label="第 1 層排序依據"
              onChange={(event) => onSortByChange(event.target.value as SortKey)}
            >
              {options
                .filter((o) => o.value === sortBy || !usedKeys.includes(o.value))
                .map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
            </select>
            <button type="button" className="ht-dir" onClick={onToggleDirection}>
              {dirLabel(sortBy, sortDirection)}
            </button>
          </div>

          {activeExtras.map((level, index) => (
            <div className="ht-row" key={index}>
              <span className="ht-step">然後</span>
              <select
                value={level.key}
                aria-label={`第 ${index + 2} 層排序依據`}
                onChange={(event) =>
                  updateExtra(index, { key: event.target.value as SortKey })
                }
              >
                {options
                  .filter((o) => o.value === level.key || !usedKeys.includes(o.value))
                  .map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className="ht-dir"
                onClick={() =>
                  updateExtra(index, {
                    direction: level.direction === 'asc' ? 'desc' : 'asc',
                  })
                }
              >
                {dirLabel(level.key, level.direction)}
              </button>
              <button
                type="button"
                className="ht-x"
                aria-label="移除這層排序"
                onClick={() =>
                  onExtraSortsChange(activeExtras.filter((_, i) => i !== index))
                }
              >
                ×
              </button>
            </div>
          ))}

          {activeExtras.length < MAX_EXTRA_SORTS && (
            <button type="button" className="ht-add" onClick={addSort}>
              ＋ 新增排序
            </button>
          )}
        </Sheet>
      )}

      {panel === 'props' && (
        <Sheet title="屬性" onClose={() => setPanel(null)}>
          <div className="ht-prop-row">
            <span>版面</span>
            <ViewToggle viewMode={viewMode} onChange={onViewModeChange} />
          </div>
          <label className="ht-prop-row">
            <span>顯示新遊戲（{NEW_GAME_DAYS} 天內加入）</span>
            <input
              type="checkbox"
              checked={showNew}
              onChange={(event) => onShowNewChange(event.target.checked)}
            />
          </label>
          <label className="ht-prop-row">
            <span>顯示卡片文字</span>
            <input
              type="checkbox"
              checked={showCardInfo}
              onChange={(event) => onShowCardInfoChange(event.target.checked)}
            />
          </label>

          {hasSession && (
            <>
              <p className="ht-tip ht-tip-gap">我的紀錄</p>
              <label className="ht-prop-row">
                <span>依我的紀錄分區</span>
                <input
                  type="checkbox"
                  checked={groupByMine}
                  onChange={(event) => onGroupByMineChange(event.target.checked)}
                />
              </label>
              {MINE_GROUPS.map((group) => (
                <label className="ht-prop-row" key={group}>
                  <span>隱藏「{MINE_GROUP_LABELS[group]}」</span>
                  <input
                    type="checkbox"
                    checked={hiddenGroups.includes(group)}
                    onChange={() => toggleHidden(group)}
                  />
                </label>
              ))}
            </>
          )}
        </Sheet>
      )}
    </div>
  )
}
