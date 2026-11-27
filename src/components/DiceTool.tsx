import { useEffect, useRef, useState } from 'react'
import { diceSummaryText, rollGroup, summarize } from '../lib/gameTable'
import { type DiceConfig } from '../lib/toolWorkspace'

const DICE_KEY = 'boardgame-dice-settings'
const ROLL_MS = 2000
// 搖晃靈敏度：數字越小越容易觸發（太敏感就調大，例如 20）
const SHAKE_DELTA = 16

export function clampInt(value: unknown, lo: number, hi: number, fallback: number) {
  const n = typeof value === 'number' ? Math.round(value) : NaN
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback
}

export function loadDice() {
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

export default function DiceTool({
  config,
  history,
  onRecord,
}: {
  config: DiceConfig
  history: string[]
  onRecord: (text: string) => void
}) {
  const custom = config.group
  const [count, setCount] = useState(custom ? custom.count : config.count)
  const [sides, setSides] = useState(config.sides)
  const [values, setValues] = useState<Array<number | string>>([])
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
    // 自訂骰面：從骰面袋抽；一般骰：1 到面數
    const draw = (): Array<number | string> =>
      custom ? rollGroup({ ...custom, count: n }) : Array.from({ length: n }, () => randInt(s))
    // 數字結果從小排到大；自訂骰面照抽出的順序
    const finalValues = custom
      ? draw()
      : (draw() as number[]).sort((x, y) => x - y)
    intervalRef.current = window.setInterval(() => {
      setValues(draw())
    }, 80)
    timeoutRef.current = window.setTimeout(() => {
      clearTimers()
      setValues(finalValues)
      setRolling(false)
      if (custom) {
        onRecord(`${custom.name || '自訂骰'}：${summarize(finalValues.map(String))}`)
      } else {
        const nums = finalValues as number[]
        const sum = nums.reduce((x, y) => x + y, 0)
        onRecord(n === 1 ? `1d${s}：${nums[0] ?? ''}` : `${n}d${s}：${nums.join(' + ')} = ${sum}`)
      }
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
  const numeric = values.filter((v): v is number => typeof v === 'number')
  const total = numeric.reduce((a, b) => a + b, 0)
  const done = values.length === count && !rolling
  // 每個點數各出現幾顆（1 到面數）
  const faceCounts = Array.from(
    { length: sides },
    (_, i) => numeric.filter((v) => v === i + 1).length,
  )

  return (
    <div className="gt-dice">
      {custom ? (
        <div className="gt-settings">
          <span className="gt-formula">
            {custom.name ? `${custom.name}・` : ''}
            {count} 顆
          </span>
          <span className="gt-hint">骰面：{diceSummaryText(custom)}</span>
        </div>
      ) : (
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
      )}

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
              ? custom
                ? `${summarize(values.map(String))}（再點一下重骰）`
                : count > 1
                  ? `合計 ${total}（再點一下重骰）`
                  : '再點一下重骰'
              : '點一下投骰'}
        </span>
      </button>

      {done && !custom && (
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
