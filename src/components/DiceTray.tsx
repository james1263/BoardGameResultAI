import { useEffect, useRef, useState } from 'react'
import { MAX_DICE, diceSummaryText, summarize, type DiceGroup } from '../lib/gameTable'
import '../styles/dice-tray.css'

// 遊戲桌的骰子分頁：骰子庫（左右滑動的圖示列）＋這次要擲的組合＋結果
// 點圖示加 1 顆；長按（電腦按右鍵）顯示名字；可混搭多組骰子一起擲

function Chip({
  g,
  index,
  n,
  onAdd,
}: {
  g: DiceGroup
  index: number
  n: number
  onAdd: () => void
}) {
  const [tip, setTip] = useState(false)
  const timer = useRef<number | null>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const shown = useRef(false)
  const hide = useRef<number | null>(null)
  const name = g.name || `骰子 ${index + 1}`

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
      if (hide.current !== null) window.clearTimeout(hide.current)
    },
    [],
  )

  function cancel() {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }

  function showTip() {
    shown.current = true
    setTip(true)
    if (hide.current !== null) window.clearTimeout(hide.current)
    hide.current = window.setTimeout(() => setTip(false), 1600)
  }

  return (
    <span className="dt-chipwrap">
      {tip && <span className="dt-tip">{name}</span>}
      <button
        type="button"
        className={`dt-chip${n > 0 ? ' on' : ''}`}
        aria-label={`${name}，點一下加一顆`}
        onPointerDown={(event) => {
          shown.current = false
          start.current = { x: event.clientX, y: event.clientY }
          cancel()
          timer.current = window.setTimeout(showTip, 450)
        }}
        onPointerMove={(event) => {
          const s = start.current
          if (s && Math.hypot(event.clientX - s.x, event.clientY - s.y) > 10) cancel()
        }}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onContextMenu={(event) => {
          event.preventDefault()
          showTip()
        }}
        onClick={() => {
          if (shown.current) {
            shown.current = false
            return
          }
          onAdd()
        }}
      >
        <span className="dt-ic" aria-hidden="true">
          {g.icon ?? '🎲'}
        </span>
        {n > 0 && <span className="dt-badge">{n}</span>}
      </button>
    </span>
  )
}

export default function DiceTray({
  groups,
  pick,
  log,
  maxGroups,
  onPick,
  onRoll,
  onReroll,
  onEdit,
  onDelete,
  onAdd,
}: {
  groups: DiceGroup[]
  pick: Record<string, number>
  log: string[]
  maxGroups: number
  onPick: (next: Record<string, number>) => void
  onRoll: () => void
  onReroll: (gid: string, index: number) => void
  onEdit: (g: DiceGroup) => void
  onDelete: (id: string) => void
  onAdd: () => void
}) {
  const [armed, setArmed] = useState<string | null>(null)
  const armTimer = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (armTimer.current !== null) window.clearTimeout(armTimer.current)
    },
    [],
  )

  const picked = groups.filter((g) => (pick[g.id] ?? 0) > 0)
  const totalPicked = picked.reduce((s, g) => s + (pick[g.id] ?? 0), 0)

  function change(id: string, delta: number) {
    const n = Math.max(0, Math.min(MAX_DICE, (pick[id] ?? 0) + delta))
    onPick({ ...pick, [id]: n })
  }

  function press(id: string, fn: () => void) {
    if (armed === id) {
      setArmed(null)
      fn()
      return
    }
    setArmed(id)
    if (armTimer.current !== null) window.clearTimeout(armTimer.current)
    armTimer.current = window.setTimeout(() => setArmed(null), 3000)
  }

  return (
    <div className="dt-root">
      <p className="dt-muted">骰子只存在這支手機，別人看不到你的結果。</p>

      <p className="dt-sub">骰子庫（左右滑動；點一下加 1 顆；長按看名字）</p>
      <div className="dt-strip">
        {groups.map((g, i) => (
          <Chip key={g.id} g={g} index={i} n={pick[g.id] ?? 0} onAdd={() => change(g.id, 1)} />
        ))}
        <button
          type="button"
          className="dt-chip dt-add"
          aria-label="新增骰子組"
          disabled={groups.length >= maxGroups}
          onClick={onAdd}
        >
          <span className="dt-ic" aria-hidden="true">
            ＋
          </span>
        </button>
      </div>
      {groups.length === 0 && <p className="dt-muted">還沒有骰子，按右邊的「＋」新增。</p>}

      {groups.length > 0 && (
        <>
          <p className="dt-sub">這次要擲</p>
          {picked.length === 0 ? (
            <p className="dt-muted">點上面的圖示選骰子；同一組可以點多次。</p>
          ) : (
            <ul className="dt-picked">
              {picked.map((g) => (
                <li key={g.id}>
                  <span className="dt-ic" aria-hidden="true">
                    {g.icon ?? '🎲'}
                  </span>
                  <span className="dt-pname">{g.name || '骰子'}</span>
                  <button type="button" className="dt-step" aria-label="少一顆" onClick={() => change(g.id, -1)}>
                    −
                  </button>
                  <b className="dt-n">{pick[g.id]}</b>
                  <button type="button" className="dt-step" aria-label="多一顆" onClick={() => change(g.id, 1)}>
                    ＋
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="dt-btns">
            <button type="button" className="dt-btn main" disabled={totalPicked === 0} onClick={onRoll}>
              🎲 擲 {totalPicked} 顆
            </button>
            <button type="button" className="dt-btn" disabled={totalPicked === 0} onClick={() => onPick({})}>
              清空選擇
            </button>
          </div>

          {groups.some((g) => g.results.length > 0) && (
            <div className="dt-results">
              {groups
                .filter((g) => g.results.length > 0)
                .map((g) => (
                  <div key={g.id} className="dt-res">
                    <p className="dt-rname">
                      <span aria-hidden="true">{g.icon ?? '🎲'}</span> {g.name || '骰子'}
                    </p>
                    <div className="dt-faces">
                      {g.results.map((r, i) => (
                        <button key={i} type="button" aria-label="重擲這一顆" onClick={() => onReroll(g.id, i)}>
                          {r}
                        </button>
                      ))}
                    </div>
                    <p className="dt-result">{summarize(g.results)}</p>
                  </div>
                ))}
              <p className="dt-muted">點單顆可重擲</p>
            </div>
          )}
        </>
      )}

      {groups.length > 0 && (
        <details className="dt-manage">
          <summary>管理骰子（{groups.length}／{maxGroups}）</summary>
          <ul>
            {groups.map((g, i) => (
              <li key={g.id}>
                <span className="dt-ic" aria-hidden="true">
                  {g.icon ?? '🎲'}
                </span>
                <span className="dt-mname">
                  <b>{g.name || `骰子 ${i + 1}`}</b>
                  <small>{diceSummaryText(g)}</small>
                </span>
                <button type="button" className="dt-link" onClick={() => onEdit(g)}>
                  編輯
                </button>
                <button type="button" className="dt-link" onClick={() => press(g.id, () => onDelete(g.id))}>
                  {armed === g.id ? '再按一次刪除' : '刪除'}
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}

      {log.length > 0 && (
        <>
          <p className="dt-sub">最近 5 次</p>
          <ul className="dt-log">
            {log.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
