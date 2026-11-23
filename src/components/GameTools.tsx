import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useBackClose } from '../lib/useBackClose'
import '../styles/game-tools.css'

export type ToolView = 'grid' | 'dice' | 'ladder'
export type ToolChoice = ToolView | 'picker'

// 🪜 是 2020 年才有的表情符號，舊系統會顯示成方框，所以梯子改用自己畫的圖示
function LadderIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      style={{ verticalAlign: '-0.12em' }}
      aria-hidden="true"
    >
      <path d="M7 2v20M17 2v20M7 7h10M7 12h10M7 17h10" />
    </svg>
  )
}

const MENU_ITEMS: { id: ToolChoice; icon: ReactNode; name: string }[] = [
  { id: 'dice', icon: '🎲', name: '擲骰' },
  { id: 'ladder', icon: <LadderIcon />, name: '爬梯子' },
  { id: 'picker', icon: '🎰', name: '挑三款' },
]

const GRID_SLOTS = 9
const LONG_PRESS_MS = 500

/* ───────────── 首頁按鈕：短按開小工具，長按（電腦右鍵）跳出快捷清單 ───────────── */

export function ToolsButton({
  onSelect,
}: {
  onSelect: (choice: ToolChoice) => void
}) {
  const [menu, setMenu] = useState<{ left: number; top: number } | null>(null)
  const timerRef = useRef<number | null>(null)
  const longRef = useRef(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  function openMenu() {
    const rect = btnRef.current?.getBoundingClientRect()
    if (!rect) return
    longRef.current = true
    const width = 168
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))
    setMenu({ left, top: rect.bottom + 6 })
  }

  function pick(choice: ToolChoice) {
    setMenu(null)
    onSelect(choice)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="explore-mine-btn gt-launch"
        onPointerDown={() => {
          longRef.current = false
          clearTimer()
          timerRef.current = window.setTimeout(() => {
            timerRef.current = null
            openMenu()
          }, LONG_PRESS_MS)
        }}
        onPointerUp={clearTimer}
        onPointerLeave={clearTimer}
        onPointerCancel={clearTimer}
        onContextMenu={(event) => {
          event.preventDefault()
          clearTimer()
          openMenu()
        }}
        onClick={() => {
          if (longRef.current) {
            longRef.current = false
            return
          }
          onSelect('grid')
        }}
      >
        🧰 小工具
      </button>
      {menu &&
        createPortal(
          <div
            className="gt-root gt-menu-backdrop"
            onClick={() => setMenu(null)}
            onContextMenu={(event) => {
              event.preventDefault()
              setMenu(null)
            }}
          >
            <div
              className="gt-menu"
              role="menu"
              style={{ left: menu.left, top: menu.top }}
              onClick={(event) => event.stopPropagation()}
            >
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  className="gt-menu-item"
                  onClick={() => pick(item.id)}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

/* ───────────── 擲骰 ───────────── */

const DICE_KEY = 'boardgame-dice-settings'
const ROLL_MS = 2000
// 搖晃靈敏度：數字越小越容易觸發（太敏感就調大，例如 20）
const SHAKE_DELTA = 16

function clampInt(value: unknown, lo: number, hi: number, fallback: number) {
  const n = typeof value === 'number' ? Math.round(value) : NaN
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback
}

function loadDice() {
  try {
    const raw = localStorage.getItem(DICE_KEY)
    if (raw) {
      const p = JSON.parse(raw) as { count?: unknown; sides?: unknown }
      return {
        count: clampInt(p.count, 1, 10, 2),
        sides: clampInt(p.sides, 3, 20, 6),
      }
    }
  } catch {
    // 讀不到就用預設
  }
  return { count: 2, sides: 6 }
}

function randInt(sides: number) {
  return Math.floor(Math.random() * sides) + 1
}

function DiceTool({
  history,
  onRecord,
}: {
  history: string[]
  onRecord: (text: string) => void
}) {
  const [init] = useState(loadDice)
  const [count, setCount] = useState(init.count)
  const [sides, setSides] = useState(init.sides)
  const [values, setValues] = useState<number[]>([])
  const [rolling, setRolling] = useState(false)
  const [locked, setLocked] = useState(false)
  const [shakeOn, setShakeOn] = useState(false)
  const [needOk, setNeedOk] = useState(true)
  const [shakeMsg, setShakeMsg] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [canShake] = useState(
    () =>
      typeof window !== 'undefined' &&
      'DeviceMotionEvent' in window &&
      window.matchMedia('(pointer: coarse)').matches,
  )
  const intervalRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const rollRef = useRef<(source: 'tap' | 'shake') => void>(() => undefined)

  function clearTimers() {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    intervalRef.current = null
    timeoutRef.current = null
  }

  useEffect(() => clearTimers, [])

  function changeSettings(nextCount: number, nextSides: number) {
    setCount(nextCount)
    setSides(nextSides)
    setValues([])
    setLocked(false)
    try {
      localStorage.setItem(
        DICE_KEY,
        JSON.stringify({ count: nextCount, sides: nextSides }),
      )
    } catch {
      // 存不了就算了
    }
  }

  function roll(source: 'tap' | 'shake') {
    if (rolling) return
    if (source === 'shake' && locked) return
    clearTimers()
    setRolling(true)
    setLocked(false)
    const n = count
    const s = sides
    // 結果從小排到大
    const finalValues = Array.from({ length: n }, () => randInt(s)).sort(
      (a, b) => a - b,
    )
    intervalRef.current = window.setInterval(() => {
      setValues(Array.from({ length: n }, () => randInt(s)))
    }, 80)
    timeoutRef.current = window.setTimeout(() => {
      clearTimers()
      setValues(finalValues)
      setRolling(false)
      const sum = finalValues.reduce((a, b) => a + b, 0)
      onRecord(
        n === 1
          ? `1d${s}：${finalValues[0] ?? ''}`
          : `${n}d${s}：${finalValues.join(' + ')} = ${sum}`,
      )
      if (source === 'shake' && needOk) setLocked(true)
    }, ROLL_MS)
  }

  useEffect(() => {
    rollRef.current = roll
  })

  useEffect(() => {
    if (!shakeOn) return
    let last = 0
    let lastTime = 0
    function onMotion(event: DeviceMotionEvent) {
      const a = event.accelerationIncludingGravity
      if (!a) return
      const mag = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2)
      const now = Date.now()
      if (last && Math.abs(mag - last) > SHAKE_DELTA && now - lastTime > 1200) {
        lastTime = now
        rollRef.current('shake')
      }
      last = mag
    }
    window.addEventListener('devicemotion', onMotion)
    return () => window.removeEventListener('devicemotion', onMotion)
  }, [shakeOn])

  async function toggleShake(on: boolean) {
    setShakeMsg('')
    if (!on) {
      setShakeOn(false)
      setLocked(false)
      return
    }
    const dm = (
      window as unknown as {
        DeviceMotionEvent?: { requestPermission?: () => Promise<string> }
      }
    ).DeviceMotionEvent
    try {
      if (dm && typeof dm.requestPermission === 'function') {
        const result = await dm.requestPermission()
        if (result !== 'granted') {
          setShakeMsg('沒有取得動作感應的權限，無法使用搖晃。')
          return
        }
      }
      setShakeOn(true)
    } catch {
      setShakeMsg('這個瀏覽器無法使用搖晃。')
    }
  }

  const shown = Array.from({ length: count }, (_, i) => values[i] ?? 0)
  const total = values.reduce((a, b) => a + b, 0)
  const done = values.length === count && !rolling
  // 每個點數各出現幾顆（1 到面數）
  const faceCounts = Array.from(
    { length: sides },
    (_, i) => values.filter((v) => v === i + 1).length,
  )

  return (
    <div className="gt-dice">
      <div className="gt-settings">
        <span className="gt-field">
          <span>骰子數</span>
          <select
            className="gt-input"
            value={count}
            disabled={rolling}
            onChange={(event) => changeSettings(Number(event.target.value), sides)}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} 顆
              </option>
            ))}
          </select>
        </span>
        <span className="gt-field">
          <span>面數</span>
          <select
            className="gt-input"
            value={sides}
            disabled={rolling}
            onChange={(event) => changeSettings(count, Number(event.target.value))}
          >
            {Array.from({ length: 18 }, (_, i) => i + 3).map((n) => (
              <option key={n} value={n}>
                d{n}
              </option>
            ))}
          </select>
        </span>
        <span className="gt-formula">
          {count}d{sides}
        </span>
      </div>

      <button
        type="button"
        className="gt-dice-area"
        aria-label="投骰"
        disabled={rolling}
        onClick={() => roll('tap')}
      >
        <span className="gt-dice-row">
          {shown.map((value, i) => (
            <span
              key={i}
              className={`gt-die${rolling ? ' rolling' : ''}`}
              style={{ animationDelay: `${(i % 5) * 0.06}s` }}
            >
              {value === 0 ? '?' : value}
            </span>
          ))}
        </span>
        <span className="gt-dice-tip">
          {rolling
            ? '骰子滾動中…'
            : done
              ? count > 1
                ? `合計 ${total}（再點一下重骰）`
                : '再點一下重骰'
              : '點一下投骰'}
        </span>
      </button>

      {done && (
        <div className="gt-counts">
          <div className="gt-counts-title">各點數出現幾顆</div>
          <div className="gt-counts-grid">
            {faceCounts.map((n, i) => (
              <span key={i} className={`gt-count${n > 0 ? ' has' : ''}`}>
                <span className="gt-count-face">{i + 1}</span>
                <span className="gt-count-n">{n}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {locked && (
        <div className="gt-lock">
          <span>已鎖定，按 OK 之後才能再搖。</span>
          <button type="button" className="gt-ok" onClick={() => setLocked(false)}>
            OK
          </button>
        </div>
      )}

      {canShake && (
        <div className="gt-options">
          <label className="gt-check">
            <input
              type="checkbox"
              checked={shakeOn}
              onChange={(event) => void toggleShake(event.target.checked)}
            />
            <span>搖晃手機投骰</span>
          </label>
          {shakeOn && (
            <label className="gt-check">
              <input
                type="checkbox"
                checked={needOk}
                onChange={(event) => {
                  setNeedOk(event.target.checked)
                  if (!event.target.checked) setLocked(false)
                }}
              />
              <span>搖晃投完要按 OK 才能再投（防誤搖）</span>
            </label>
          )}
          {shakeMsg && <p className="gt-msg">{shakeMsg}</p>}
        </div>
      )}

      <div className="gt-history">
        {showHistory && (
          <div className="gt-history-panel">
            {history.length === 0 ? (
              <p>還沒有紀錄</p>
            ) : (
              <ol>
                {history.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            )}
          </div>
        )}
        <button
          type="button"
          className="gt-history-btn"
          aria-expanded={showHistory}
          onClick={() => setShowHistory((v) => !v)}
        >
          🕘 最近 5 次
        </button>
      </div>
    </div>
  )
}

/* ───────────── 爬梯子 ───────────── */

const ROWS = 14
const ROW_H = 22
const TOP = 36
const BOTTOM = 36
const RUN_MS = 5000
const MAX_PLAYERS = 15

type Ladder = { bars: number[][]; ranks: number[] }

function shuffle(list: number[]) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i] as number
    a[i] = a[j] as number
    a[j] = tmp
  }
  return a
}

// 底部的順位先洗牌，所以每個人拿到每個順位的機會一樣
function makeLadder(n: number): Ladder {
  const bars: number[][] = []
  for (let r = 0; r < ROWS; r++) {
    const row: number[] = []
    let prev = -2
    for (let i = 0; i < n - 1; i++) {
      if (prev !== i - 1 && Math.random() < 0.5) {
        row.push(i)
        prev = i
      }
    }
    bars.push(row)
  }
  return { bars, ranks: shuffle(Array.from({ length: n }, (_, i) => i + 1)) }
}

function trace(start: number, ladder: Ladder, colW: number) {
  const x = (c: number) => colW * c + colW / 2
  let col = start
  let d = `M${x(col)} ${TOP}`
  for (let r = 0; r < ROWS; r++) {
    const row = ladder.bars[r] ?? []
    const y = TOP + (r + 0.5) * ROW_H
    let next = col
    if (row.includes(col)) next = col + 1
    else if (row.includes(col - 1)) next = col - 1
    d += ` L${x(col)} ${y}`
    if (next !== col) d += ` L${x(next)} ${y}`
    col = next
  }
  d += ` L${x(col)} ${TOP + ROWS * ROW_H}`
  return { end: col, d }
}

function playerColor(i: number, n: number) {
  return `hsl(${Math.round((i * 360) / n)} 68% 42%)`
}

function shortName(name: string) {
  return Array.from(name).slice(0, 4).join('')
}

function LadderTool() {
  const [count, setCount] = useState(4)
  const [names, setNames] = useState<string[]>(() =>
    Array.from({ length: MAX_PLAYERS }, () => ''),
  )
  const [ladder, setLadder] = useState<Ladder>(() => makeLadder(4))
  const [t, setT] = useState(0)
  const [running, setRunning] = useState(false)
  const rafRef = useRef<number | null>(null)

  function stopRaf() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }

  useEffect(() => stopRaf, [])

  const colW = count <= 6 ? 64 : count <= 10 ? 52 : 44
  const width = colW * count
  const height = TOP + ROWS * ROW_H + BOTTOM

  const paths = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        start: i,
        ...trace(i, ladder, colW),
      })),
    [count, ladder, colW],
  )

  const results = useMemo(
    () =>
      paths
        .map((p) => ({ player: p.start, rank: ladder.ranks[p.end] ?? 0 }))
        .sort((a, b) => a.rank - b.rank),
    [paths, ladder],
  )

  function displayName(i: number) {
    const name = (names[i] ?? '').trim()
    return name === '' ? `玩家 ${i + 1}` : name
  }

  function reshuffle(n: number) {
    stopRaf()
    setRunning(false)
    setT(0)
    setLadder(makeLadder(n))
  }

  function changeCount(n: number) {
    setCount(n)
    reshuffle(n)
  }

  function start() {
    stopRaf()
    setRunning(true)
    setT(0)
    const began = performance.now()
    const step = (now: number) => {
      const p = Math.min(1, (now - began) / RUN_MS)
      setT(p)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        rafRef.current = null
        setRunning(false)
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }

  function reveal() {
    stopRaf()
    setRunning(false)
    setT(1)
  }

  const finished = t >= 1

  return (
    <div className="gt-ladder">
      <div className="gt-settings">
        <span className="gt-field">
          <span>人數</span>
          <select
            className="gt-input"
            value={count}
            disabled={running}
            onChange={(event) => changeCount(Number(event.target.value))}
          >
            {Array.from({ length: MAX_PLAYERS - 1 }, (_, i) => i + 2).map((n) => (
              <option key={n} value={n}>
                {n} 人
              </option>
            ))}
          </select>
        </span>
        <span className="gt-hint">名字可以不填</span>
      </div>

      <div className="gt-names">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className="gt-name-row">
            <span
              className="gt-dot"
              style={{ background: playerColor(i, count) }}
            />
            <input
              type="text"
              className="gt-input gt-name-input"
              maxLength={12}
              placeholder={`玩家 ${i + 1}`}
              value={names[i] ?? ''}
              onChange={(event) => {
                const value = event.target.value
                setNames((cur) => cur.map((v, k) => (k === i ? value : v)))
              }}
            />
          </span>
        ))}
      </div>

      <div className="gt-actions">
        {!running && !finished && (
          <button type="button" className="gt-primary" onClick={start}>
            開始（約 5 秒）
          </button>
        )}
        {!finished && (
          <button type="button" className="gt-secondary" onClick={reveal}>
            直接看結果
          </button>
        )}
        {finished && (
          <button
            type="button"
            className="gt-primary"
            onClick={() => reshuffle(count)}
          >
            重新抽
          </button>
        )}
      </div>

      <div
        className="gt-ladder-scroll"
        onClick={running ? reveal : undefined}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="爬梯子"
        >
          {Array.from({ length: count }, (_, c) => (
            <line
              key={`rail-${c}`}
              x1={colW * c + colW / 2}
              x2={colW * c + colW / 2}
              y1={TOP}
              y2={TOP + ROWS * ROW_H}
              stroke="#9aa08a"
              strokeWidth={3}
            />
          ))}
          {ladder.bars.flatMap((row, r) =>
            row.map((i) => (
              <line
                key={`bar-${r}-${i}`}
                x1={colW * i + colW / 2}
                x2={colW * (i + 1) + colW / 2}
                y1={TOP + (r + 0.5) * ROW_H}
                y2={TOP + (r + 0.5) * ROW_H}
                stroke="#9aa08a"
                strokeWidth={3}
              />
            )),
          )}
          {paths.map((p) => (
            <path
              key={`path-${p.start}`}
              d={p.d}
              fill="none"
              stroke={playerColor(p.start, count)}
              strokeWidth={4}
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - t}
            />
          ))}
          {Array.from({ length: count }, (_, c) => (
            <text
              key={`top-${c}`}
              x={colW * c + colW / 2}
              y={TOP - 12}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill={playerColor(c, count)}
            >
              {shortName(displayName(c))}
            </text>
          ))}
          {Array.from({ length: count }, (_, c) => (
            <text
              key={`bottom-${c}`}
              x={colW * c + colW / 2}
              y={height - 12}
              textAnchor="middle"
              fontSize={15}
              fontWeight={700}
              fill="#26331f"
            >
              {finished ? (ladder.ranks[c] ?? '') : '?'}
            </text>
          ))}
        </svg>
      </div>

      {finished && (
        <ol className="gt-rank-list">
          {results.map((r) => (
            <li key={r.player}>
              <span className="gt-rank-no">{r.rank}</span>
              <span
                className="gt-dot"
                style={{ background: playerColor(r.player, count) }}
              />
              <span className="gt-rank-name">{displayName(r.player)}</span>
              {r.rank === 1 && <span className="gt-first">起始玩家</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

/* ───────────── 小工具視窗（全螢幕） ───────────── */

export default function GameTools({
  view,
  onViewChange,
  onClose,
  onOpenPicker,
}: {
  view: ToolView | null
  onViewChange: (view: ToolView) => void
  onClose: () => void
  onOpenPicker: () => void
}) {
  const [history, setHistory] = useState<string[]>([])
  useBackClose(onClose, view !== null)

  if (view === null) return null

  function record(text: string) {
    setHistory((cur) => [text, ...cur].slice(0, 5))
  }

  // 先關掉小工具，稍等再開挑三款，避免兩個視窗同時改瀏覽紀錄
  function openPicker() {
    onClose()
    window.setTimeout(onOpenPicker, 350)
  }

  const title: ReactNode =
    view === 'dice' ? (
      '🎲 擲骰'
    ) : view === 'ladder' ? (
      <>
        <LadderIcon /> 爬梯子
      </>
    ) : (
      '🧰 小工具'
    )

  // ✕：在擲骰、爬梯子裡回到小工具九格，在九格才關閉；點視窗外面直接回主畫面
  function handleX() {
    if (view === 'grid') onClose()
    else onViewChange('grid')
  }

  return (
    <div className="gt-root gt-backdrop" onClick={onClose}>
    <div
      className="gt-sheet"
      role="dialog"
      aria-label="小工具"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="gt-head">
        <span className="gt-title">{title}</span>
        <button
          type="button"
          className="gt-close"
          aria-label={view === 'grid' ? '關閉' : '回到小工具'}
          onClick={handleX}
        >
          ×
        </button>
      </div>

      <div className="gt-body">
        {view === 'grid' && (
          <div className="gt-grid">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="gt-tile"
                onClick={() =>
                  item.id === 'picker' ? openPicker() : onViewChange(item.id)
                }
              >
                <span className="gt-tile-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="gt-tile-name">{item.name}</span>
              </button>
            ))}
            {Array.from({ length: GRID_SLOTS - MENU_ITEMS.length }, (_, i) => (
              <div key={`empty-${i}`} className="gt-tile gt-tile-empty">
                <span className="gt-tile-icon" aria-hidden="true">
                  ＋
                </span>
                <span className="gt-tile-name">待加入</span>
              </div>
            ))}
          </div>
        )}
        {view === 'dice' && <DiceTool history={history} onRecord={record} />}
        {view === 'ladder' && <LadderTool />}
      </div>
    </div>
    </div>
  )
}
