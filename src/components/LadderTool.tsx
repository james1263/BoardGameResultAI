import { useEffect, useMemo, useRef, useState } from 'react'

// 🪜 是 2020 年才有的表情符號，舊系統會顯示成方框，所以梯子改用自己畫的圖示
export function LadderIcon() {
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

const ROWS = 14
const ROW_H = 22
const TOP = 36
const BOTTOM = 36
const RUN_MS = 5000

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

export default function LadderTool({ names }: { names: string[] }) {
  // 玩家由工作區共用（在「玩家」那裡改）；人數變了，工作區會用 key 讓這個元件重新建立（重新排梯子）
  const count = names.length
  const [ladder, setLadder] = useState<Ladder>(() => makeLadder(count))
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
      <p className="gt-hint">玩家名單與人數在上方「玩家」修改。</p>

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
