import { useMemo, useState, type ReactNode } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import type { RatingsApi, RatingKey } from '../lib/useGameRatings'
import { RATING_FIELDS } from '../lib/useGameRatings'
import { isUnplayedGame } from '../lib/playedStatus'
import '../styles/stats-chart.css'

type Metric = 'overall' | 'composite' | RatingKey

const METRICS: { key: Metric; label: string; decimals: number }[] = [
    { key: 'composite', label: '綜合分數（六項加總）', decimals: 0 },
    { key: 'overall', label: '整體評分', decimals: 0 },
    ...RATING_FIELDS.map((field) => ({
        key: field.key as Metric,
        label: field.label,
        decimals: 0,
    })),
]

type Row = { game: BoardGame; values: Record<Metric, number | null> }

// 綜合分數：喜歡度、玩家影響性、溝通度、變化度、獨特性、適合留下來，六項加總（不含整體分數，最高 30）
// 六項有任何一項沒填就沒有綜合分數；還沒玩過的遊戲（ranking engine 以 .5 結尾）不列入
function buildRows(boardGames: BoardGame[], ratings: RatingsApi): Row[] {
    const rows: Row[] = []
    for (const game of boardGames) {
        if (isUnplayedGame(game)) continue
        const mine = ratings.getMine(game.bggName)
        if (!mine) continue
        const parts = RATING_FIELDS.map((field) => mine[field.key])
        const composite = parts.every((value) => value != null)
            ? (parts as number[]).reduce((sum, value) => sum + value, 0)
            : null
        rows.push({
            game,
            values: {
                composite,
                overall: mine.overall,
                like: mine.like,
                playerImpact: mine.playerImpact,
                communication: mine.communication,
                change: mine.change,
                unique: mine.unique,
                keep: mine.keep,
            },
        })
    }
    return rows
}

function normalizeText(text: string): string {
    return text.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '')
}

function niceScale(max: number): { top: number; ticks: number[] } {
    if (!(max > 0)) return { top: 1, ticks: [0, 1] }
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)))
    const step =
        [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((value) => max / value <= 5) ??
        10 * magnitude
    const top = Math.ceil(max / step) * step
    const ticks: number[] = []
    for (let v = 0; v <= top + step / 1000; v += step) ticks.push(Math.round(v * 100) / 100)
    return { top, ticks }
}

export default function MyRatingsPanel({
    mode,
    boardGames,
    ratings,
    onOpenGame,
    renderCover,
}: {
    mode: 'score' | 'chart'
    boardGames: BoardGame[]
    ratings: RatingsApi
    onOpenGame: (game: BoardGame) => void
    renderCover: (game: BoardGame) => ReactNode
}) {
    const rows = useMemo(() => buildRows(boardGames, ratings), [boardGames, ratings])

    if (ratings.status === 'loading') return <p className="mylist-empty">讀取中…</p>
    if (ratings.status !== 'ready' || rows.length === 0) {
        return (
            <p className="mylist-empty">
                還沒有可統計的評分。在遊戲視窗的「評分」分頁評分後，這裡就會出現（還沒玩過的遊戲不列入）。
            </p>
        )
    }
    return mode === 'score' ? (
        <ScoreList rows={rows} onOpenGame={onOpenGame} renderCover={renderCover} />
    ) : (
        <ScatterMine rows={rows} onOpenGame={onOpenGame} />
    )
}

function ScoreList({
    rows,
    onOpenGame,
    renderCover,
}: {
    rows: Row[]
    onOpenGame: (game: BoardGame) => void
    renderCover: (game: BoardGame) => ReactNode
}) {
    const [search, setSearch] = useState('')
    const [low, setLow] = useState(false)

    const scored = useMemo(() => rows.filter((row) => row.values.composite != null), [rows])
    const unscoredCount = rows.length - scored.length

    const shown = useMemo(() => {
        const query = normalizeText(search)
        const list = scored.filter(
            (row) =>
                !query ||
                normalizeText(row.game.name).includes(query) ||
                normalizeText(row.game.bggName).includes(query),
        )
        return [...list].sort((a, b) => {
            const diff = (b.values.composite ?? 0) - (a.values.composite ?? 0)
            return (low ? -diff : diff) || a.game.name.localeCompare(b.game.name, 'zh-Hant')
        })
    }, [scored, search, low])

    return (
        <>
            <p className="mystat-foot">
                綜合分數＝喜歡度、玩家影響性、溝通度、變化度、獨特性、適合留下來，六項加總（最高 30 分，不含整體分數）。只算你自己的評分。
            </p>
            <div className="cls-searchbox cls-sticky">
                <input
                    type="search"
                    className="cls-search-input"
                    placeholder="搜尋遊戲名稱"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
                <button type="button" className="cls-sort-dir" onClick={() => setLow((v) => !v)}>
                    {low ? '↑ 低→高' : '↓ 高→低'}
                </button>
            </div>
            {search.trim() && (
                <p className="cls-count">
                    找到 {shown.length} / {scored.length} 款
                </p>
            )}
            {scored.length === 0 ? (
                <p className="mylist-empty">
                    還沒有六項都填的評分。補齊「適合留下來」以外的細項評分，就會有綜合分數。
                </p>
            ) : shown.length === 0 ? (
                <p className="mylist-empty">找不到符合的遊戲。</p>
            ) : (
                <ul className="mylist-list">
                    {shown.map((row) => (
                        <li className="mylist-item" key={row.game.bggName}>
                            <div className="mylist-thumb">{renderCover(row.game)}</div>
                            <div className="mylist-info">
                                <button
                                    type="button"
                                    className="mylist-name"
                                    onClick={() => onOpenGame(row.game)}
                                >
                                    {row.game.name}
                                </button>
                                <small>整體 {row.values.overall}</small>
                            </div>
                            <b className="mystat-count">{row.values.composite} / 30</b>
                        </li>
                    ))}
                </ul>
            )}
            {unscoredCount > 0 && (
                <p className="mystat-foot">
                    另有 {unscoredCount} 款評分的六項沒有填滿，沒有綜合分數。
                </p>
            )}
        </>
    )
}

function ScatterMine({
    rows,
    onOpenGame,
}: {
    rows: Row[]
    onOpenGame: (game: BoardGame) => void
}) {
    const [xKey, setXKey] = useState<Metric>('overall')
    const [yKey, setYKey] = useState<Metric>('composite')
    const [picked, setPicked] = useState('')

    const xInfo = METRICS.find((m) => m.key === xKey)!
    const yInfo = METRICS.find((m) => m.key === yKey)!

    const { groups, excluded, xScale, yScale } = useMemo(() => {
        const byPos = new Map<string, { x: number; y: number; games: BoardGame[] }>()
        let skipped = 0
        for (const row of rows) {
            const x = row.values[xKey]
            const y = row.values[yKey]
            if (x == null || y == null) {
                skipped += 1
                continue
            }
            const key = `${x}|${y}`
            const found = byPos.get(key)
            if (found) found.games.push(row.game)
            else byPos.set(key, { x, y, games: [row.game] })
        }
        const list = [...byPos.entries()].map(([key, value]) => ({ key, ...value }))
        return {
            groups: list,
            excluded: skipped,
            xScale: niceScale(Math.max(0, ...list.map((g) => g.x))),
            yScale: niceScale(Math.max(0, ...list.map((g) => g.y))),
        }
    }, [rows, xKey, yKey])

    const W = 360
    const H = 300
    const left = 44
    const right = 14
    const top = 12
    const bottom = 42
    const px = (v: number) => left + (v / xScale.top) * (W - left - right)
    const py = (v: number) => H - bottom - (v / yScale.top) * (H - top - bottom)
    const pickedGroup = groups.find((g) => g.key === picked) ?? null

    return (
        <>
            <p className="ma-note">
                每個點是一款你評過分的遊戲；點一下看遊戲名稱與分數。只算你自己的評分，還沒玩過的遊戲不會畫出。
            </p>
            <div className="sc-controls">
                <label>
                    X 軸（橫軸）
                    <select
                        value={xKey}
                        onChange={(event) => {
                            setXKey(event.target.value as Metric)
                            setPicked('')
                        }}
                    >
                        {METRICS.map((m) => (
                            <option key={m.key} value={m.key}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Y 軸（縱軸）
                    <select
                        value={yKey}
                        onChange={(event) => {
                            setYKey(event.target.value as Metric)
                            setPicked('')
                        }}
                    >
                        {METRICS.map((m) => (
                            <option key={m.key} value={m.key}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="sc-box">
                <svg
                    className="sc-svg"
                    viewBox={`0 0 ${W} ${H}`}
                    role="img"
                    aria-label={`${xInfo.label}與${yInfo.label}的分布圖`}
                >
                    {yScale.ticks.map((tick) => (
                        <g key={`y${tick}`}>
                            <line x1={left} x2={W - right} y1={py(tick)} y2={py(tick)} stroke="#e3d9c4" />
                            <text x={left - 6} y={py(tick) + 3} textAnchor="end">
                                {tick}
                            </text>
                        </g>
                    ))}
                    {xScale.ticks.map((tick) => (
                        <g key={`x${tick}`}>
                            <line x1={px(tick)} x2={px(tick)} y1={top} y2={H - bottom} stroke="#efe6d2" />
                            <text x={px(tick)} y={H - bottom + 14} textAnchor="middle">
                                {tick}
                            </text>
                        </g>
                    ))}
                    <line x1={left} x2={left} y1={top} y2={H - bottom} stroke="#8a998f" />
                    <line x1={left} x2={W - right} y1={H - bottom} y2={H - bottom} stroke="#8a998f" />
                    <text
                        className="sc-axis-title"
                        x={(left + W - right) / 2}
                        y={H - 8}
                        textAnchor="middle"
                    >
                        {xInfo.label} →
                    </text>
                    <text
                        className="sc-axis-title"
                        transform={`translate(12 ${(top + H - bottom) / 2}) rotate(-90)`}
                        textAnchor="middle"
                    >
                        {yInfo.label} →
                    </text>
                    {groups.map((group) => (
                        <g
                            key={group.key}
                            className={`sc-dot ${picked === group.key ? 'on' : ''}`}
                            onClick={() => setPicked(picked === group.key ? '' : group.key)}
                        >
                            <circle className="sc-hit" cx={px(group.x)} cy={py(group.y)} r={14} />
                            <circle
                                className="sc-vis"
                                cx={px(group.x)}
                                cy={py(group.y)}
                                r={group.games.length > 1 ? 8 : 6}
                            />
                        </g>
                    ))}
                </svg>
                {groups.length === 0 && <p className="sc-note">沒有同時有這兩項資料的遊戲。</p>}
                <p className="sc-note">
                    畫出 {groups.reduce((sum, g) => sum + g.games.length, 0)} 款
                    {excluded > 0 && `；${excluded} 款因資料不足未顯示`}。較大的點代表同一位置有多款遊戲。
                </p>
            </div>

            {pickedGroup && (
                <div className="sc-pick">
                    <h4>
                        {xInfo.label}：{pickedGroup.x}　{yInfo.label}：{pickedGroup.y}
                    </h4>
                    <ul>
                        {pickedGroup.games.map((game) => (
                            <li key={game.bggName}>
                                <span>{game.name}</span>
                                <button type="button" onClick={() => onOpenGame(game)}>
                                    查看遊戲
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    )
}
