import { useEffect, useRef, useState } from 'react'
import {
  isSortKeyAllowed,
  type ExtraSort,
  type SortKey,
} from '../lib/libraryTypes'
import '../styles/sort-levels.css'

export const MAX_EXTRA_SORTS = 2

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

export default function SortLevels({
  primaryKey,
  extraSorts,
  onChange,
  isAdmin,
  hasSession,
}: {
  primaryKey: SortKey
  extraSorts: ExtraSort[]
  onChange: (next: ExtraSort[]) => void
  isAdmin: boolean
  hasSession: boolean
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    function onDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const options = optionList(isAdmin, hasSession)
  const usedKeys = [primaryKey, ...extraSorts.map((s) => s.key)]

  function addLevel() {
    const next = options.find((o) => !usedKeys.includes(o.value))
    if (!next) return
    onChange([...extraSorts, { key: next.value, direction: 'asc' }])
  }

  function update(index: number, patch: Partial<ExtraSort>) {
    onChange(extraSorts.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  function remove(index: number) {
    onChange(extraSorts.filter((_, i) => i !== index))
  }

  const activeCount = extraSorts.filter(
    (s) => isSortKeyAllowed(s.key, isAdmin, hasSession) && s.key !== primaryKey,
  ).length

  return (
    <div className="sort-levels" ref={rootRef}>
      <button
        type="button"
        className={`sort-levels-btn ${open ? 'open' : ''} ${activeCount > 0 ? 'active' : ''}`}
        aria-expanded={open}
        aria-label={
          activeCount > 0
            ? `次要排序，已設定 ${activeCount} 層`
            : '新增次要排序'
        }
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">＋</span>
        {activeCount > 0 ? <span>{activeCount}</span> : <span>排序</span>}
      </button>

      {open && (
        <div className="sort-levels-panel" role="dialog" aria-label="次要排序">
          <p className="sort-levels-tip">
            第一層相同時，才依下面的順序再排。
          </p>

          {extraSorts.map((level, index) => {
            const flip = level.key === 'scoreRank'
            const shown: 'asc' | 'desc' = flip
              ? level.direction === 'asc'
                ? 'desc'
                : 'asc'
              : level.direction
            return (
              <div className="sort-levels-row" key={index}>
                <span className="sort-levels-step">然後</span>
                <select
                  value={level.key}
                  aria-label={`第 ${index + 2} 層排序依據`}
                  onChange={(event) =>
                    update(index, { key: event.target.value as SortKey })
                  }
                >
                  {options
                    .filter(
                      (o) =>
                        o.value === level.key || !usedKeys.includes(o.value),
                    )
                    .map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  className="sort-levels-dir"
                  aria-label={
                    shown === 'asc' ? '切換為降冪排序' : '切換為升冪排序'
                  }
                  onClick={() =>
                    update(index, {
                      direction: level.direction === 'asc' ? 'desc' : 'asc',
                    })
                  }
                >
                  {shown === 'asc' ? '↑' : '↓'}
                </button>
                <button
                  type="button"
                  className="sort-levels-remove"
                  aria-label="移除這層排序"
                  onClick={() => remove(index)}
                >
                  ×
                </button>
              </div>
            )
          })}

          {extraSorts.length < MAX_EXTRA_SORTS && (
            <button type="button" className="sort-levels-add" onClick={addLevel}>
              ＋ 新增排序
            </button>
          )}
        </div>
      )}
    </div>
  )
}
