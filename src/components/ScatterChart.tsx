import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import '../styles/stats-chart.css'
import '../styles/scatter-list.css'

export type ScatterPoint = { x: number; y: number; game: BoardGame }
type Domain = { x0: number; x1: number; y0: number; y1: number }

const W = 360
const H = 250
const LEFT = 44
const RIGHT = 14
const TOP = 12
const BOTTOM = 42
const PLOT_W = W - LEFT - RIGHT
const PLOT_H = H - TOP - BOTTOM

function niceTicks(lo: number, hi: number): number[] {
  const span = hi - lo
  if (!(span > 0)) return [lo]
  const raw = span / 5
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)))
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((value) => value >= raw) ??
    10 * magnitude
  const ticks: number[] = []
  const start = Math.ceil(lo / step - 1e-9) * step
  for (let v = start; v <= hi + step / 1000; v += step) {
    ticks.push(Math.round(v * 1000) / 1000)
  }
  return ticks
}

function tickText(value: number): string {
  return String(Number(value.toFixed(2)))
}

function formatValue(value: number, decimals: number): string {
  return decimals === 0 ? String(Math.round(value)) : value.toFixed(decimals)
}

// 預設範圍：剛好框住所有的點（不再強制從 0 開始）
function autoDomain(points: ScatterPoint[]): Domain {
  if (points.length === 0) return { x0: 0, x1: 1, y0: 0, y1: 1 }
  let x0 = Infinity
  let x1 = -Infinity
  let y0 = Infinity
  let y1 = -Infinity
  for (const p of points) {
    if (p.x < x0) x0 = p.x
    if (p.x > x1) x1 = p.x
    if (p.y < y0) y0 = p.y
    if (p.y > y1) y1 = p.y
  }
  const padX = x1 > x0 ? (x1 - x0) * 0.12 : 1
  const padY = y1 > y0 ? (y1 - y0) * 0.12 : 1
  return { x0: x0 - padX, x1: x1 + padX, y0: y0 - padY, y1: y1 + padY }
}

export default function ScatterChart({
  points,
  excluded = 0,
  xLabel,
  yLabel,
  xDecimals = 0,
  yDecimals = 0,
  onOpenGame,
}: {
  points: ScatterPoint[]
  excluded?: number
  xLabel: string
  yLabel: string
  xDecimals?: number
  yDecimals?: number
  onOpenGame?: (game: BoardGame) => void
}) {
  // 換 X／Y 軸時，父層用 key 讓整個圖重來（縮放與選取一起重設）
  const clipId = 'scclip' + useId().replace(/:/g, '')
  const [view, setView] = useState<Domain | null>(null)
  const [picked, setPicked] = useState('')
  const svgRef = useRef<SVGSVGElement>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const moved = useRef(false)
  const start = useRef({ x: 0, y: 0 })

  const groups = useMemo(() => {
    const byPos = new Map<string, { key: string; x: number; y: number; games: BoardGame[] }>()
    for (const p of points) {
      const key = `${p.x}|${p.y}`
      const found = byPos.get(key)
      if (found) found.games.push(p.game)
      else byPos.set(key, { key, x: p.x, y: p.y, games: [p.game] })
    }
    // 編號：由右到左、由上到下，圖上的點和下方清單用同一組編號
    return [...byPos.values()]
      .sort((a, b) => b.x - a.x || b.y - a.y)
      .map((g, index) => ({ ...g, no: index + 1 }))
  }, [points])

  const auto = useMemo(() => autoDomain(points), [points])
  const domain = view ?? auto
  const domainRef = useRef(domain)
  domainRef.current = domain
  const autoRef = useRef(auto)
  autoRef.current = auto

  const px = (v: number) => LEFT + ((v - domain.x0) / (domain.x1 - domain.x0)) * PLOT_W
  const py = (v: number) => TOP + (1 - (v - domain.y0) / (domain.y1 - domain.y0)) * PLOT_H
  const xTicks = niceTicks(domain.x0, domain.x1)
  const yTicks = niceTicks(domain.y0, domain.y1)

  // 縮放＋平移：以 (vbX, vbY)（svg 座標）為錨點，factor < 1 放大；pan 是平移量（svg 座標）
  function transform(factor: number, vbX: number, vbY: number, panX: number, panY: number) {
    const d = domainRef.current
    const a = autoRef.current
    const spanX = d.x1 - d.x0
    const spanY = d.y1 - d.y0
    const autoX = a.x1 - a.x0
    const autoY = a.y1 - a.y0
    const newX = Math.min(Math.max(spanX * factor, autoX * 0.03), autoX * 3)
    const newY = Math.min(Math.max(spanY * factor, autoY * 0.03), autoY * 3)
    const fx = (vbX - LEFT) / PLOT_W
    const fy = 1 - (vbY - TOP) / PLOT_H
    const ax = d.x0 + fx * spanX
    const ay = d.y0 + fy * spanY
    const fx2 = (vbX + panX - LEFT) / PLOT_W
    const fy2 = 1 - (vbY + panY - TOP) / PLOT_H
    const x0 = ax - fx2 * newX
    const y0 = ay - fy2 * newY
    const next = { x0, x1: x0 + newX, y0, y1: y0 + newY }
    domainRef.current = next
    setView(next)
  }

  function toVb(clientX: number, clientY: number) {
    const rect = svgRef.current!.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) * W) / rect.width,
      y: ((clientY - rect.top) * H) / rect.height,
    }
  }

  // 滑鼠滾輪縮放（要 non-passive 才能擋住頁面捲動）
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    function handleWheel(event: WheelEvent) {
      event.preventDefault()
      const p = toVb(event.clientX, event.clientY)
      transform(Math.exp(event.deltaY * 0.0015), p.x, p.y, 0, 0)
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handlePointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.current.size === 1) {
      moved.current = false
      start.current = { x: event.clientX, y: event.clientY }
    } else {
      moved.current = true
    }
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const prev = pointers.current.get(event.pointerId)
    const el = svgRef.current
    if (!prev || !el) return
    const cur = { x: event.clientX, y: event.clientY }
    const rect = el.getBoundingClientRect()
    const sx = W / rect.width
    const sy = H / rect.height

    if (pointers.current.size === 1) {
      if (!moved.current) {
        if (Math.hypot(cur.x - start.current.x, cur.y - start.current.y) < 6) return
        moved.current = true
        try {
          el.setPointerCapture(event.pointerId)
        } catch {
          // 抓不到也沒關係
        }
      }
      transform(1, 0, 0, (cur.x - prev.x) * sx, (cur.y - prev.y) * sy)
    } else if (pointers.current.size === 2) {
      const entry = [...pointers.current.entries()].find(([id]) => id !== event.pointerId)
      if (entry) {
        const other = entry[1]
        const prevDist = Math.hypot(prev.x - other.x, prev.y - other.y)
        const curDist = Math.hypot(cur.x - other.x, cur.y - other.y)
        if (curDist >= 1 && prevDist >= 1) {
          const prevMid = { x: (prev.x + other.x) / 2, y: (prev.y + other.y) / 2 }
          const curMid = { x: (cur.x + other.x) / 2, y: (cur.y + other.y) / 2 }
          const anchor = toVb(prevMid.x, prevMid.y)
          transform(prevDist / curDist, anchor.x, anchor.y, (curMid.x - prevMid.x) * sx, (curMid.y - prevMid.y) * sy)
        }
      }
    }
    pointers.current.set(event.pointerId, cur)
  }

  function handlePointerEnd(event: ReactPointerEvent<SVGSVGElement>) {
    pointers.current.delete(event.pointerId)
    try {
      svgRef.current?.releasePointerCapture(event.pointerId)
    } catch {
      // 沒抓過就算了
    }
  }

  function zoomButton(factor: number) {
    transform(factor, LEFT + PLOT_W / 2, TOP + PLOT_H / 2, 0, 0)
  }

  function reset() {
    setView(null)
    setPicked('')
  }

  const pickedGroup = groups.find((g) => g.key === picked) ?? null
  const shownCount = groups
    .filter((g) => g.x >= domain.x0 && g.x <= domain.x1 && g.y >= domain.y0 && g.y <= domain.y1)
    .reduce((sum, g) => sum + g.games.length, 0)
  function inView(g: { x: number; y: number }): boolean {
    return g.x >= domain.x0 && g.x <= domain.x1 && g.y >= domain.y0 && g.y <= domain.y1
  }

  return (
    <>
      <div className="sc-box">
        <div className="sc-tools">
          <button type="button" aria-label="縮小" onClick={() => zoomButton(1 / 0.6)}>
            －
          </button>
          <button type="button" aria-label="放大" onClick={() => zoomButton(0.6)}>
            ＋
          </button>
          <button type="button" onClick={reset} disabled={view === null && picked === ''}>
            重設範圍
          </button>
        </div>
        <div className="sc-plot">
        {pickedGroup && (
          <div className="sc-pick sc-pick-float">
            <h4>
              {xLabel}：{formatValue(pickedGroup.x, xDecimals)}　{yLabel}：
              {formatValue(pickedGroup.y, yDecimals)}
            </h4>
            <ul>
              {pickedGroup.games.map((game) => (
                <li key={game.bggName}>
                  <span>{game.name}</span>
                  {onOpenGame && (
                    <button type="button" onClick={() => onOpenGame(game)}>
                      查看遊戲
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <svg
          ref={svgRef}
          className="sc-svg sc-zoomable"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`${xLabel}與${yLabel}的分布圖`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <defs>
            <clipPath id={clipId}>
              <rect x={LEFT} y={TOP} width={PLOT_W} height={PLOT_H} />
            </clipPath>
          </defs>
          {yTicks.map((tick) => (
            <g key={`y${tick}`}>
              <line x1={LEFT} x2={W - RIGHT} y1={py(tick)} y2={py(tick)} stroke="#e3d9c4" />
              <text x={LEFT - 6} y={py(tick) + 3} textAnchor="end">
                {tickText(tick)}
              </text>
            </g>
          ))}
          {xTicks.map((tick) => (
            <g key={`x${tick}`}>
              <line x1={px(tick)} x2={px(tick)} y1={TOP} y2={H - BOTTOM} stroke="#efe6d2" />
              <text x={px(tick)} y={H - BOTTOM + 14} textAnchor="middle">
                {tickText(tick)}
              </text>
            </g>
          ))}
          <line x1={LEFT} x2={LEFT} y1={TOP} y2={H - BOTTOM} stroke="#8a998f" />
          <line x1={LEFT} x2={W - RIGHT} y1={H - BOTTOM} y2={H - BOTTOM} stroke="#8a998f" />
          <text
            className="sc-axis-title"
            x={(LEFT + W - RIGHT) / 2}
            y={H - 8}
            textAnchor="middle"
          >
            {xLabel} →
          </text>
          <text
            className="sc-axis-title"
            transform={`translate(12 ${(TOP + H - BOTTOM) / 2}) rotate(-90)`}
            textAnchor="middle"
          >
            {yLabel} →
          </text>
          <g clipPath={`url(#${clipId})`}>
            {groups.map((group) => (
              <g
                key={group.key}
                className={`sc-dot ${picked === group.key ? 'on' : ''}`}
                onClick={() => {
                  if (moved.current) return
                  setPicked(picked === group.key ? '' : group.key)
                }}
              >
                <circle className="sc-hit" cx={px(group.x)} cy={py(group.y)} r={14} />
                <circle
                  className="sc-vis"
                  cx={px(group.x)}
                  cy={py(group.y)}
                  r={group.games.length > 1 ? 9 : 8}
                />
                <text
                  className="sc-num"
                  x={px(group.x)}
                  y={py(group.y) + 3}
                  textAnchor="middle"
                >
                  {group.no}
                </text>
              </g>
            ))}
          </g>
        </svg>
        </div>
        {groups.length === 0 && <p className="sc-note">沒有同時有這兩項資料的遊戲。</p>}
        {groups.length > 0 && (
          <ol className={`sc-names ${groups.length > 24 ? 'sc-names-scroll' : ''}`}>
            {[...groups]
              .sort((a, b) => a.no - b.no)
              .map((group) => (
                <li key={group.key}>
                  <button
                    type="button"
                    className={`${picked === group.key ? 'on' : ''} ${inView(group) ? '' : 'out'}`}
                    onClick={() => setPicked(picked === group.key ? '' : group.key)}
                  >
                    <b>{group.no}</b>
                    <span>{group.games.map((game) => game.name).join('、')}</span>
                  </button>
                </li>
              ))}
          </ol>
        )}
        <p className="sc-note">
          共 {points.length} 款
          {view && `，目前範圍內 ${shownCount} 款`}
          {excluded > 0 && `；${excluded} 款因資料不足未顯示`}。較大的點＝同位置多款。
        </p>
      </div>

    </>
  )
}
