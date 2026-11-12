import { useMemo, useState, type ReactNode } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import type { RatingsApi, RatingKey } from '../lib/useGameRatings'
import { RATING_FIELDS } from '../lib/useGameRatings'
import { isUnplayedGame } from '../lib/playedStatus'
import type { AdminScores } from '../lib/libraryTypes'
import ScatterChart, { type ScatterPoint } from './ScatterChart'
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
// 管理者的五個「度」：取 CSV 的 emoji 字元數（去掉 U+FE0F 與空白，上限 5；0 視為沒有）
function emojiDegree(text: string | null | undefined): number | null {
    if (!text) return null
    const count = Array.from(text.replace(/[\uFE0F\s]/g, '')).length
    return count > 0 ? Math.min(count, 5) : null
}

// 管理者：完全用 CSV 換算，不看手動評分
function buildAdminRows(
    boardGames: BoardGame[],
    adminScores: Map<string, AdminScores>,
): Row[] {
    const rows: Row[] = []
    for (const game of boardGames) {
        if (isUnplayedGame(game)) continue
        const scores = adminScores.get(game.bggName)
        if (!scores) continue
        const values: Record<Metric, number | null> = {
            composite: null,
            overall: scores.overall,
            like: emojiDegree(game.likeEmoji),
            playerImpact: emojiDegree(game.playerImpactEmoji),
            communication: emojiDegree(game.communicationEmoji),
            change: emojiDegree(game.changeEmoji),
            unique: emojiDegree(game.uniqueEmoji),
            keep: scores.keep,
        }
        const parts = RATING_FIELDS.map((field) => values[field.key])
        values.composite = parts.every((value) => value != null)
            ? (parts as number[]).reduce((sum, value) => sum + value, 0)
            : null
        rows.push({ game, values })
    }
    return rows
}

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

export default function MyRatingsPanel({
    mode,
    boardGames,
    ratings,
    isAdmin = false,
    adminScores,
    onOpenGame,
    renderCover,
}: {
    mode: 'score' | 'chart'
    boardGames: BoardGame[]
    ratings: RatingsApi
    isAdmin?: boolean
    adminScores?: Map<string, AdminScores>
    onOpenGame: (game: BoardGame) => void
    renderCover: (game: BoardGame) => ReactNode
}) {
    const useCsv = isAdmin && !!adminScores
    const rows = useMemo(
        () =>
            useCsv
                ? buildAdminRows(boardGames, adminScores!)
                : buildRows(boardGames, ratings),
        [useCsv, boardGames, adminScores, ratings],
    )

    if (!useCsv && ratings.status === 'loading') return <p className="mylist-empty">讀取中…</p>
    if ((!useCsv && ratings.status !== 'ready') || rows.length === 0) {
        return (
            <p className="mylist-empty">
                還沒有可統計的評分。在遊戲視窗的「評分」分頁評分後，這裡就會出現（還沒玩過的遊戲不列入）。
            </p>
        )
    }
    return mode === 'score' ? (
        <ScoreList rows={rows} csv={useCsv} onOpenGame={onOpenGame} renderCover={renderCover} />
    ) : (
        <ScatterMine rows={rows} onOpenGame={onOpenGame} />
    )
}

function ScoreList({
    rows,
    csv,
    onOpenGame,
    renderCover,
}: {
    rows: Row[]
    csv: boolean
    onOpenGame: (game: BoardGame) => void
    renderCover: (game: BoardGame) => ReactNode
}) {
    const [search, setSearch] = useState('')
    const [low, setLow] = useState(false)
    const [base, setBase] = useState<'composite' | 'overall'>('composite')
    const [showInfo, setShowInfo] = useState(false)

    const scored = useMemo(() => rows.filter((row) => row.values[base] != null), [rows, base])
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
            const diff = (b.values[base] ?? 0) - (a.values[base] ?? 0)
            return (low ? -diff : diff) || a.game.name.localeCompare(b.game.name, 'zh-Hant')
        })
    }, [scored, search, low, base])

    return (
        <>
            <div className="ms-head">
                <div className="lb-pages pb-toggle">
                    <button type="button" className={base === 'composite' ? 'active' : ''} onClick={() => setBase('composite')}>
                        綜合評分
                    </button>
                    <button type="button" className={base === 'overall' ? 'active' : ''} onClick={() => setBase('overall')}>
                        整體評分
                    </button>
                </div>
                <button type="button" className="ms-info" aria-label="說明" aria-expanded={showInfo} onClick={() => setShowInfo((v) => !v)}>
                    ⓘ
                </button>
            </div>
            {showInfo && (
                <p className="st-tip">
                    綜合分數＝喜歡度、玩家影響性、溝通度、變化度、獨特性、適合留下來，六項加總（最高 30 分，不含整體分數）；整體評分＝你給的 1～10 分。{csv ? '管理者以 CSV 換算分數為準，不看手動評分。' : '只算你自己的評分。'}
                </p>
            )}
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
                    {base === 'composite'
                        ? '還沒有六項都填的評分。補齊「適合留下來」以外的細項評分，就會有綜合分數。'
                        : '還沒有整體評分。'}
                </p>
            ) : shown.length === 0 ? (
                <p className="mylist-empty">找不到符合的遊戲。</p>
            ) : (
                <ul className="mylist-list">
                    {shown.map((row) => (
                        <li className="mylist-item" key={row.game.bggName}>
                            <div
                                className="mylist-thumb"
                                role="button"
                                tabIndex={0}
                                style={{ cursor: 'pointer' }}
                                onClick={() => onOpenGame(row.game)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') onOpenGame(row.game)
                                }}
                            >
                                {renderCover(row.game)}
                            </div>
                            <div className="mylist-info">
                                <button
                                    type="button"
                                    className="mylist-name"
                                    onClick={() => onOpenGame(row.game)}
                                >
                                    {row.game.name}
                                </button>
                                <small>
                                    {base === 'composite'
                                        ? `整體 ${row.values.overall ?? '—'}`
                                        : `綜合 ${row.values.composite ?? '—'}`}
                                </small>
                            </div>
                            <b className="mystat-count">
                                {base === 'composite' ? `${row.values.composite} / 30` : `${row.values.overall} / 10`}
                            </b>
                        </li>
                    ))}
                </ul>
            )}
            {unscoredCount > 0 && (
                <p className="mystat-foot">
                    另有 {unscoredCount} 款{base === 'composite' ? '評分的六項沒有填滿，沒有綜合分數' : '沒有整體評分'}。
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

    const xInfo = METRICS.find((m) => m.key === xKey)!
    const yInfo = METRICS.find((m) => m.key === yKey)!

    const { points, excluded } = useMemo(() => {
        const list: ScatterPoint[] = []
        let skipped = 0
        for (const row of rows) {
            const x = row.values[xKey]
            const y = row.values[yKey]
            if (x == null || y == null) {
                skipped += 1
                continue
            }
            list.push({ x, y, game: row.game })
        }
        return { points: list, excluded: skipped }
    }, [rows, xKey, yKey])

    return (
        <>
            <div className="sc-controls">
                <label>
                    X 軸（橫軸）
                    <select value={xKey} onChange={(event) => setXKey(event.target.value as Metric)}>
                        {METRICS.map((m) => (
                            <option key={m.key} value={m.key}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Y 軸（縱軸）
                    <select value={yKey} onChange={(event) => setYKey(event.target.value as Metric)}>
                        {METRICS.map((m) => (
                            <option key={m.key} value={m.key}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <ScatterChart
                key={`${xKey}|${yKey}`}
                points={points}
                excluded={excluded}
                xLabel={xInfo.label}
                yLabel={yInfo.label}
                onOpenGame={onOpenGame}
            />
        </>
    )
}
