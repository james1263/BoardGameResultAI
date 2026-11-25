import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useBackClose } from '../lib/useBackClose'
import { supabase } from '../lib/supabase'
import ScoreSheetTool from './ScoreSheetTool'
import { clearResourceSnapshot } from '../lib/scoreSheet'
import '../styles/game-tools.css'
import '../styles/tools-float.css'

export type ToolView = 'grid' | 'dice' | 'ladder' | 'sheet' | 'counter'
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

// 「＋ 工具」圖示：自畫 SVG（不用表情符號，舊電腦不會變方框）
function ToolPlusIcon() {
  return (
    <svg
      width="1.2em"
      height="1.2em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

// 在目前工具裡用浮動視窗打開的小工具（不離開目前畫面）
type FloatKind = 'dice' | 'counter' | 'sheet'
const FLOAT_INFO: Record<FloatKind, { name: string; icon: string }> = {
  dice: { name: '擲骰', icon: '🎲' },
  counter: { name: '資源計數器', icon: '📦' },
  sheet: { name: '計分表', icon: '🧮' },
}
const FLOAT_KINDS: FloatKind[] = ['dice', 'sheet', 'counter']

const MENU_ITEMS: { id: ToolChoice; icon: ReactNode; name: string }[] = [
  { id: 'dice', icon: '🎲', name: '擲骰' },
  { id: 'ladder', icon: <LadderIcon />, name: '爬梯子' },
  { id: 'picker', icon: '🎰', name: '挑三款' },
  { id: 'sheet', icon: '🧮', name: '計分表' },
  { id: 'counter', icon: '📦', name: '資源計數器' },
]

const GRID_SLOTS = 9
const LONG_PRESS_MS = 500
const ORDER_KEY = 'boardgame-tools-order'

// 小工具順序只存在這支手機的瀏覽器；之後新增的工具會自動排在最後
function loadOrder(): ToolChoice[] {
  const ids = MENU_ITEMS.map((item) => item.id)
  try {
    const raw = localStorage.getItem(ORDER_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const kept: ToolChoice[] = []
        for (const x of parsed) {
          const id = ids.find((i) => i === x)
          if (id && !kept.includes(id)) kept.push(id)
        }
        return [...kept, ...ids.filter((i) => !kept.includes(i))]
      }
    }
  } catch {
    // 讀不到就用預設順序
  }
  return ids
}

function saveOrder(order: ToolChoice[]) {
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order))
  } catch {
    // 存不了就算了
  }
}

/* ───────────── 首頁按鈕：短按開小工具，長按跳出快捷清單（手指不放可滑動選取；電腦右鍵） ───────────── */

export function ToolsButton({
  onSelect,
}: {
  onSelect: (choice: ToolChoice) => void
}) {
  const [menu, setMenu] = useState<{
    left: number
    top: number
    items: ToolChoice[]
  } | null>(null)
  const [hoverId, setHoverId] = useState<ToolChoice | null>(null)
  const timerRef = useRef<number | null>(null)
  const longRef = useRef(false)
  // 手指（或觸控筆）還按著，而且可以滑動選取；滑鼠不走這條路
  const slideRef = useRef(false)
  const startRef = useRef({ x: 0, y: 0 })
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

  // 手指現在壓在哪一個清單項目上（沒壓在項目上就是 null）
  function itemAt(x: number, y: number): ToolChoice | null {
    const el = document.elementFromPoint(x, y)
    const id = el?.closest('[data-gt-id]')?.getAttribute('data-gt-id')
    return MENU_ITEMS.find((item) => item.id === id)?.id ?? null
  }

  function openMenu() {
    const rect = btnRef.current?.getBoundingClientRect()
    if (!rect) return
    longRef.current = true
    const width = 168
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))
    // 主畫面長按只顯示九格最前面的 3 個
    setMenu({ left, top: rect.bottom + 6, items: loadOrder().slice(0, 3) })
  }

  function pick(choice: ToolChoice) {
    setMenu(null)
    setHoverId(null)
    onSelect(choice)
  }

  const menuItems = (menu?.items ?? []).flatMap((id) => {
    const item = MENU_ITEMS.find((m) => m.id === id)
    return item ? [item] : []
  })

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="explore-mine-btn gt-launch"
        onPointerDown={(event) => {
          longRef.current = false
          slideRef.current = event.pointerType !== 'mouse'
          startRef.current = { x: event.clientX, y: event.clientY }
          setHoverId(null)
          clearTimer()
          timerRef.current = window.setTimeout(() => {
            timerRef.current = null
            openMenu()
          }, LONG_PRESS_MS)
        }}
        onPointerMove={(event) => {
          if (timerRef.current !== null) {
            // 還沒長按成功就先移動太多，代表不是長按，取消
            const dx = event.clientX - startRef.current.x
            const dy = event.clientY - startRef.current.y
            if (dx * dx + dy * dy > 100) clearTimer()
            return
          }
          if (slideRef.current && longRef.current) {
            setHoverId(itemAt(event.clientX, event.clientY))
          }
        }}
        onPointerUp={(event) => {
          clearTimer()
          // 清單已經跳出、手指在項目上放開：直接進入該工具
          if (slideRef.current && longRef.current) {
            const id = itemAt(event.clientX, event.clientY)
            if (id) pick(id)
          }
          slideRef.current = false
          setHoverId(null)
        }}
        onPointerLeave={clearTimer}
        onPointerCancel={() => {
          clearTimer()
          slideRef.current = false
          setHoverId(null)
        }}
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
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  data-gt-id={item.id}
                  className={`gt-menu-item${hoverId === item.id ? ' active' : ''}`}
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

type RosterGathering = { id: string; gathered_on: string; title: string }
type RosterPerson = { name: string; checked: boolean }

function taipeiToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(
    new Date(),
  )
}

function LadderTool() {
  // 代入聚會參加者：只有 VIP／管理者查得到資料，訪客會被資料庫擋下
  const [rosterOpen, setRosterOpen] = useState(false)
  const [rosterBusy, setRosterBusy] = useState(false)
  const [rosterMsg, setRosterMsg] = useState('')
  const [gatherings, setGatherings] = useState<RosterGathering[] | null>(null)
  const [people, setPeople] = useState<RosterPerson[] | null>(null)

  async function openRoster() {
    setRosterOpen(true)
    setPeople(null)
    setRosterMsg('')
    setRosterBusy(true)
    const { data, error } = await supabase.rpc('get_my_gatherings')
    setRosterBusy(false)
    if (error) {
      setRosterMsg('請先登入 VIP 帳號才能代入聚會參加者。')
      setGatherings([])
      return
    }
    const today = taipeiToday()
    const rows = ((data ?? []) as RosterGathering[]).filter(
      (g) => g.gathered_on <= today,
    )
    setGatherings(rows)
    if (rows.length === 0) setRosterMsg('沒有已開團的聚會可以選。')
  }

  async function pickGathering(id: string) {
    setRosterBusy(true)
    setRosterMsg('')
    const { data, error } = await supabase.rpc('get_gathering_detail', {
      p_gathering: id,
    })
    setRosterBusy(false)
    const detail = data as {
      attendees?: { n?: string; me?: boolean; h?: boolean | null }[]
    } | null
    if (error || !detail || !Array.isArray(detail.attendees)) {
      setRosterMsg('讀不到這場聚會的名單。')
      return
    }
    const list = detail.attendees
    // 只有管理者拿得到 h 欄位；管理者本人若不在名單內，補上 James
    const isAdminView = list.some((a) => a.h !== undefined && a.h !== null)
    const names = list.map((a) => (a.n ?? '').trim() || '（未命名）')
    if (isAdminView && !list.some((a) => a.me)) names.unshift('James')
    setPeople(names.map((name) => ({ name, checked: true })))
  }

  function applyRoster() {
    if (!people) return
    const chosen = people
      .filter((p) => p.checked)
      .map((p) => p.name)
      .slice(0, MAX_PLAYERS)
    if (chosen.length < 2) {
      setRosterMsg('至少要勾選 2 人。')
      return
    }
    setNames(() =>
      Array.from({ length: MAX_PLAYERS }, (_, i) => chosen[i] ?? ''),
    )
    changeCount(chosen.length)
    setRosterOpen(false)
    setPeople(null)
  }

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

      <div className="gt-roster">
        <button
          type="button"
          className="gt-secondary gt-roster-btn"
          disabled={running}
          onClick={() => void openRoster()}
        >
          代入聚會參加者
        </button>
        {rosterOpen && (
          <div className="gt-roster-panel">
            {rosterBusy && <p className="gt-hint">讀取中…</p>}
            {rosterMsg && <p className="gt-msg">{rosterMsg}</p>}
            {!people && gatherings && gatherings.length > 0 && (
              <>
                <div className="gt-hint">先選一場聚會（最新在上）</div>
                {gatherings.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className="gt-roster-item"
                    onClick={() => void pickGathering(g.id)}
                  >
                    {g.gathered_on}　{g.title}
                  </button>
                ))}
              </>
            )}
            {people && (
              <>
                <div className="gt-hint">
                  取消勾選不玩的人，最多帶入 {MAX_PLAYERS} 人
                </div>
                {people.map((p, i) => (
                  <label key={i} className="gt-check">
                    <input
                      type="checkbox"
                      checked={p.checked}
                      onChange={(event) => {
                        const on = event.target.checked
                        setPeople((cur) =>
                          cur
                            ? cur.map((x, k) =>
                                k === i ? { ...x, checked: on } : x,
                              )
                            : cur,
                        )
                      }}
                    />
                    <span>{p.name}</span>
                  </label>
                ))}
                <div className="gt-actions">
                  <button
                    type="button"
                    className="gt-primary"
                    onClick={applyRoster}
                  >
                    帶入
                  </button>
                  <button
                    type="button"
                    className="gt-secondary"
                    onClick={() => setPeople(null)}
                  >
                    重選場次
                  </button>
                </div>
              </>
            )}
            <button
              type="button"
              className="gt-secondary gt-roster-close"
              onClick={() => setRosterOpen(false)}
            >
              關閉
            </button>
          </div>
        )}
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

/* ───────────── 九格：長按工具進入調整位置，拖曳換位置 ───────────── */

function ToolGrid({ onChoose }: { onChoose: (id: ToolChoice) => void }) {
  const [order, setOrder] = useState<ToolChoice[]>(loadOrder)
  const [editing, setEditing] = useState(false)
  const [drag, setDrag] = useState<{
    id: ToolChoice
    dx: number
    dy: number
    over: ToolChoice | null
  } | null>(null)
  const timerRef = useRef<number | null>(null)
  const suppressRef = useRef(false)
  const startRef = useRef({ x: 0, y: 0 })

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => clearTimer, [])

  // 手指現在在哪一格工具上（排除自己）
  function tileAt(x: number, y: number, exclude: ToolChoice): ToolChoice | null {
    const tiles = document.querySelectorAll<HTMLElement>('[data-gt-tile]')
    for (const el of Array.from(tiles)) {
      const id = el.getAttribute('data-gt-tile')
      if (id === exclude) continue
      const r = el.getBoundingClientRect()
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return MENU_ITEMS.find((m) => m.id === id)?.id ?? null
      }
    }
    return null
  }

  function finishDrag() {
    if (drag && drag.over && drag.over !== drag.id) {
      const next = order.filter((i) => i !== drag.id)
      const at = next.indexOf(drag.over)
      // 往後拖放在目標後面，往前拖放在目標前面
      const from = order.indexOf(drag.id)
      const to = order.indexOf(drag.over)
      next.splice(from < to ? at + 1 : at, 0, drag.id)
      setOrder(next)
      saveOrder(next)
    }
    setDrag(null)
  }

  return (
    <>
      {editing && (
        <div className="gt-edit-bar">
          <span>拖曳工具調整位置，主畫面長按只會顯示最前面 3 個</span>
          <button
            type="button"
            className="gt-secondary gt-edit-done"
            onClick={() => {
              setEditing(false)
              setDrag(null)
            }}
          >
            完成
          </button>
        </div>
      )}
      <div className="gt-grid">
        {order.map((id, index) => {
          const item = MENU_ITEMS.find((m) => m.id === id)
          if (!item) return null
          const dragging = drag?.id === id
          const cls = [
            'gt-tile',
            editing && !dragging ? 'wiggle' : '',
            dragging ? 'dragging' : '',
            drag && drag.over === id ? 'drop' : '',
            index < 3 ? 'fav' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button
              key={id}
              type="button"
              data-gt-tile={id}
              className={cls}
              style={
                dragging && drag
                  ? { transform: `translate(${drag.dx}px, ${drag.dy}px) scale(1.06)` }
                  : undefined
              }
              onPointerDown={(event) => {
                suppressRef.current = false
                startRef.current = { x: event.clientX, y: event.clientY }
                try {
                  event.currentTarget.setPointerCapture(event.pointerId)
                } catch {
                  // 不能抓取就算了
                }
                if (editing) {
                  setDrag({ id, dx: 0, dy: 0, over: null })
                  return
                }
                clearTimer()
                timerRef.current = window.setTimeout(() => {
                  timerRef.current = null
                  suppressRef.current = true
                  setEditing(true)
                  // 長按後手指不放，可以直接拖
                  setDrag({ id, dx: 0, dy: 0, over: null })
                }, LONG_PRESS_MS)
              }}
              onPointerMove={(event) => {
                const dx = event.clientX - startRef.current.x
                const dy = event.clientY - startRef.current.y
                if (drag && drag.id === id) {
                  setDrag({
                    id,
                    dx,
                    dy,
                    over: tileAt(event.clientX, event.clientY, id),
                  })
                } else if (timerRef.current !== null && dx * dx + dy * dy > 100) {
                  clearTimer()
                }
              }}
              onPointerUp={() => {
                clearTimer()
                finishDrag()
              }}
              onPointerCancel={() => {
                clearTimer()
                setDrag(null)
              }}
              onContextMenu={(event) => event.preventDefault()}
              onClick={() => {
                if (suppressRef.current) {
                  suppressRef.current = false
                  return
                }
                if (editing) return
                onChoose(id)
              }}
            >
              <span className="gt-tile-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="gt-tile-name">{item.name}</span>
            </button>
          )
        })}
        {Array.from({ length: GRID_SLOTS - order.length }, (_, i) => (
          <div key={`empty-${i}`} className="gt-tile gt-tile-empty">
            <span className="gt-tile-icon" aria-hidden="true">
              ＋
            </span>
            <span className="gt-tile-name">待加入</span>
          </div>
        ))}
      </div>
    </>
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
  const [plusMenu, setPlusMenu] = useState<{ left: number; top: number } | null>(null)
  const [floatKind, setFloatKind] = useState<FloatKind | null>(null)
  // 開過的浮動視窗一直掛著（只是藏起來），這樣關掉再開，裡面輸入的數字還在
  const [floatUsed, setFloatUsed] = useState<FloatKind[]>([])
  const plusRef = useRef<HTMLButtonElement>(null)
  useBackClose(onClose, view !== null)

  // 換畫面就收起選單；關掉小工具視窗就清掉浮動視窗與資源數量（只放記憶體）
  useEffect(() => {
    setPlusMenu(null)
    if (view === null) {
      clearResourceSnapshot()
      setFloatKind(null)
      setFloatUsed([])
    }
  }, [view])

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
    ) : view === 'counter' ? (
      '📦 資源計數器'
    ) : view === 'sheet' ? (
      '🧮 計分表'
    ) : (
      '🧰 小工具'
    )

  const plusKinds = FLOAT_KINDS.filter((k) => k !== view)
  const showPlus = view !== 'grid' && plusKinds.length > 0

  function togglePlusMenu() {
    if (plusMenu) {
      setPlusMenu(null)
      return
    }
    const rect = plusRef.current?.getBoundingClientRect()
    if (!rect) return
    const width = 168
    const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8))
    setPlusMenu({ left, top: rect.bottom + 6 })
  }

  function openFloat(kind: FloatKind) {
    setPlusMenu(null)
    setFloatKind(kind)
    setFloatUsed((cur) => (cur.includes(kind) ? cur : [...cur, kind]))
  }

  // ✕：在擲骰、爬梯子裡回到小工具九格，在九格才關閉；點視窗外面直接回主畫面
  function handleX() {
    if (view === 'grid') onClose()
    else onViewChange('grid')
  }

  return (
    <>
    <div className="gt-root gt-backdrop" onClick={onClose}>
    <div
      className="gt-sheet"
      role="dialog"
      aria-label="小工具"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="gt-head">
        <span className="gt-title">{title}</span>
        <span className="gt-head-actions">
          {showPlus && (
            <button
              ref={plusRef}
              type="button"
              className="gt-plus"
              aria-label="開啟其他工具"
              aria-expanded={plusMenu !== null}
              title="開啟其他工具"
              onClick={togglePlusMenu}
            >
              <ToolPlusIcon />
            </button>
          )}
          <button
            type="button"
            className="gt-close"
            aria-label={view === 'grid' ? '關閉' : '回到小工具'}
            onClick={handleX}
          >
            ×
          </button>
        </span>
      </div>

            <div className={view === 'sheet' || view === 'counter' ? 'gt-body gt-body-sheet' : 'gt-body'}>
        {view === 'grid' && (
          <ToolGrid
            onChoose={(id) => (id === 'picker' ? openPicker() : onViewChange(id))}
          />
        )}
        {view === 'dice' && <DiceTool history={history} onRecord={record} />}
        {view === 'ladder' && <LadderTool />}
        {view === 'sheet' && <ScoreSheetTool key="sheet" tool="score" onExit={() => onViewChange('grid')} />}
        {view === 'counter' && <ScoreSheetTool key="counter" tool="resource" onExit={() => onViewChange('grid')} />}
      </div>
    </div>
    </div>

    {plusMenu &&
      createPortal(
        <div
          className="gt-root gt-menu-backdrop gt-plus-backdrop"
          onClick={() => setPlusMenu(null)}
        >
          <div
            className="gt-menu"
            role="menu"
            style={{ left: plusMenu.left, top: plusMenu.top }}
            onClick={(event) => event.stopPropagation()}
          >
            {plusKinds.map((k) => (
              <button
                key={k}
                type="button"
                role="menuitem"
                className="gt-menu-item"
                onClick={() => openFloat(k)}
              >
                <span aria-hidden="true">{FLOAT_INFO[k].icon}</span>
                <span>{FLOAT_INFO[k].name}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body,
      )}

    {floatUsed.map((kind) => (
      <div
        key={kind}
        className="gt-root gt-float-backdrop"
        style={floatKind === kind ? undefined : { display: 'none' }}
        onClick={() => setFloatKind(null)}
      >
        <div
          className="gt-sheet gt-float-sheet"
          role="dialog"
          aria-label={FLOAT_INFO[kind].name}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="gt-head">
            <span className="gt-title">
              {FLOAT_INFO[kind].icon} {FLOAT_INFO[kind].name}
            </span>
            <button
              type="button"
              className="gt-close"
              aria-label="關閉浮動視窗"
              onClick={() => setFloatKind(null)}
            >
              ×
            </button>
          </div>
          <div className={kind !== 'dice' ? 'gt-body gt-body-sheet' : 'gt-body'}>
            {kind === 'dice' ? (
              <DiceTool history={history} onRecord={record} />
            ) : kind === 'sheet' ? (
              <ScoreSheetTool key="float-sheet" tool="score" />
            ) : (
              <ScoreSheetTool key="float-counter" tool="resource" />
            )}
          </div>
        </div>
      </div>
    ))}
    </>
  )
}
