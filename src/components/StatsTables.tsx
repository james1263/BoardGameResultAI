import { useMemo, useState } from 'react'
import ScatterChart, { type ScatterPoint } from './ScatterChart'
import FullScreenPage from './FullScreenPage'
import type { BoardGame } from '../data/boardGames.generated'
import type { CommunityStatsApi } from '../lib/useCommunityStats'
import type { RatingsApi } from '../lib/useGameRatings'
import '../styles/stats-chart.css'
import { isUnplayedGame } from '../lib/playedStatus'
import {
    personLabel,
    type AdminRatingsApi,
    type PeopleApi,
    type Person,
} from '../lib/useGamePeople'

type Tab = 'games' | 'chart' | 'matrix'
type SortKey = 'name' | 'want' | 'played' | 'overall' | 'keep' | 'count'
type Cell = { want: boolean; played: boolean; rating: number | null }

// 名單欄：固定欄寬並自動換行，避免文字疊在一起
const NAME_COL_STYLE = {
    width: 220,
    minWidth: 220,
    maxWidth: 220,
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    overflow: 'visible',
    verticalAlign: 'top',
} as const

function downloadCsv(filename: string, rows: string[][]) {
    const quote = (value: string) => `"${value.replaceAll('"', '""')}"`
    const text =
        '\uFEFF' + rows.map((row) => row.map(quote).join(',')).join('\r\n')
    const url = URL.createObjectURL(
        new Blob([text], { type: 'text/csv;charset=utf-8' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}

function cellText(cell: Cell | undefined): string {
    if (!cell) return ''
    const parts: string[] = []
    if (cell.played) parts.push('✓')
    else if (cell.want) parts.push('♥')
    if (cell.rating != null) parts.push(`★${cell.rating}`)
    return parts.join(' ')
}

function cellCsv(cell: Cell | undefined): string {
    if (!cell) return ''
    const parts: string[] = []
    if (cell.played) parts.push('已玩')
    if (cell.want) parts.push('想玩')
    if (cell.rating != null) parts.push(`評分${cell.rating}`)
    return parts.join(' ')
}

type Metric = 'want' | 'played' | 'overall' | 'keep' | 'count'

const METRICS: { key: Metric; label: string; decimals: number }[] = [
    { key: 'want', label: '想玩人數', decimals: 0 },
    { key: 'played', label: '已玩人數', decimals: 0 },
    { key: 'overall', label: '整體評分', decimals: 1 },
    { key: 'keep', label: '留下來評分', decimals: 1 },
    { key: 'count', label: '評分人數', decimals: 0 },
]

type ChartRow = {
    game: BoardGame
    want: number
    played: number
    overall: number | null
    keep: number | null
    count: number
}

function ScatterPanel({
    rows,
    onOpenGame,
}: {
    rows: ChartRow[]
    onOpenGame?: (game: BoardGame) => void
}) {
    const [xKey, setXKey] = useState<Metric>('overall')
    const [yKey, setYKey] = useState<Metric>('keep')

    const xInfo = METRICS.find((m) => m.key === xKey)!
    const yInfo = METRICS.find((m) => m.key === yKey)!

    const { points, excluded } = useMemo(() => {
        const list: ScatterPoint[] = []
        let skipped = 0
        for (const row of rows) {
            const x = row[xKey]
            const y = row[yKey]
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
            <p className="ma-note">每個點是一款遊戲；點一下看遊戲名稱與數值。評分需滿 5 人才有平均，不足的遊戲不會畫出；還沒玩過的遊戲也不會畫出。</p>
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
                xDecimals={xInfo.decimals}
                yDecimals={yInfo.decimals}
                onOpenGame={onOpenGame}
            />
        </>
    )
}

export default function StatsTables({
    boardGames,
    communityStats,
    ratings,
    people,
    adminRatings,
    isAdmin,
    embedded = false,
    open = true,
    onOpenGame,
    onClose,
}: {
    boardGames: BoardGame[]
    communityStats: CommunityStatsApi
    ratings: RatingsApi
    people: PeopleApi
    adminRatings: AdminRatingsApi
    isAdmin: boolean
    // 嵌在排行榜頁面裡：不開視窗、不畫標題列
    embedded?: boolean
    // 全螢幕頁面是否顯示（父層一直掛著，用它開關）
    open?: boolean
    onOpenGame?: (game: BoardGame) => void
    onClose?: () => void
}) {
    const [tab, setTab] = useState<Tab>('games')
    const [search, setSearch] = useState('')
    const [showNames, setShowNames] = useState(false)
    const [showAllGames, setShowAllGames] = useState(false)
    const [matrixGameSearch, setMatrixGameSearch] = useState('')
    const [matrixMember, setMatrixMember] = useState('')
    const [sortKey, setSortKey] = useState<SortKey>('want')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

    const rows = useMemo(
        () =>
            boardGames.map((game) => {
                const stats = communityStats.getStats(game.bggName)
                const summary = ratings.getSummary(game.bggName)
                const p = people.get(game.bggName)
                return {
                    game,
                    want: stats.wantCount,
                    played: stats.playedCount,
                    overall: summary.overallAvg,
                    keep: summary.avgs.keep,
                    count: summary.count,
                    wantNames: p.want.map((x) => personLabel(x, isAdmin)).join('、'),
                    playedNames: p.played.map((x) => personLabel(x, isAdmin)).join('、'),
                    raters: isAdmin
                        ? adminRatings
                            .get(game.bggName)
                            .map((x) => `${personLabel(x, true)}（${x.o ?? '—'}／${x.k ?? '—'}）`)
                            .join('、')
                        : '',
                }
            }),
        [boardGames, communityStats, ratings, people, adminRatings, isAdmin],
    )

    // 分布圖：Ranking engine 以 .5 結尾（還沒玩過）的遊戲不畫
    const chartRows = useMemo(
        () => rows.filter((row) => !isUnplayedGame(row.game)),
        [rows],
    )

    const shownRows = useMemo(() => {
        const keyword = search.trim().toLocaleLowerCase()
        const filtered = rows.filter(
            (row) => !keyword || row.game.name.toLocaleLowerCase().includes(keyword),
        )
        const direction = sortDir === 'asc' ? 1 : -1
        return filtered.sort((a, b) => {
            if (sortKey === 'name') {
                return a.game.name.localeCompare(b.game.name, 'zh-Hant') * direction
            }
            const av = a[sortKey]
            const bv = b[sortKey]
            if (av == null && bv == null) return 0
            if (av == null) return 1
            if (bv == null) return -1
            return (av - bv) * direction
        })
    }, [rows, search, sortKey, sortDir])

    function toggleSort(key: SortKey) {
        if (sortKey === key) {
            setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortKey(key)
            setSortDir(key === 'name' ? 'asc' : 'desc')
        }
    }

    function arrow(key: SortKey): string {
        if (sortKey !== key) return ''
        return sortDir === 'asc' ? ' ▲' : ' ▼'
    }

    function exportGames() {
        const header = [
            '遊戲',
            '想玩人數',
            '已玩人數',
            '整體評分',
            '留下來',
            '評分人數',
            '想玩的人',
            '已玩的人',
            '評分者（整體／留下來）',
        ]
        const body = shownRows.map((row) => [
            row.game.name,
            String(row.want),
            String(row.played),
            row.overall == null ? '' : row.overall.toFixed(1),
            row.keep == null ? '' : row.keep.toFixed(1),
            String(row.count),
            row.wantNames,
            row.playedNames,
            row.raters,
        ])
        downloadCsv('遊戲總表.csv', [header, ...body])
    }

    // 管理者：成員 × 遊戲矩陣
    const matrix = useMemo(() => {
        const memberMap = new Map<string, Person>()
        const cells = new Map<string, Map<string, Cell>>()

        function cell(bggName: string, person: Person): Cell {
            if (!memberMap.has(person.n)) memberMap.set(person.n, person)
            let row = cells.get(bggName)
            if (!row) {
                row = new Map()
                cells.set(bggName, row)
            }
            let found = row.get(person.n)
            if (!found) {
                found = { want: false, played: false, rating: null }
                row.set(person.n, found)
            }
            return found
        }

        if (isAdmin) {
            for (const game of boardGames) {
                const p = people.get(game.bggName)
                p.want.forEach((x) => {
                    cell(game.bggName, x).want = true
                })
                p.played.forEach((x) => {
                    cell(game.bggName, x).played = true
                })
                adminRatings.get(game.bggName).forEach((x) => {
                    cell(game.bggName, x).rating = x.o
                })
            }
        }

        const members = [...memberMap.values()].sort((a, b) =>
            a.n.localeCompare(b.n, 'zh-Hant'),
        )
        return { members, cells }
    }, [boardGames, people, adminRatings, isAdmin])

    const visibleMembers = matrix.members.filter(
        (m) => !matrixMember || m.n === matrixMember,
    )
    const matrixKeyword = matrixGameSearch.trim().toLocaleLowerCase()
    const matrixGames = boardGames.filter((game) => {
        if (matrixKeyword && !game.name.toLocaleLowerCase().includes(matrixKeyword)) {
            return false
        }
        if (showAllGames) return true
        if (matrixMember) return matrix.cells.get(game.bggName)?.has(matrixMember) ?? false
        return matrix.cells.has(game.bggName)
    })

    function memberTotals(nickname: string) {
        let played = 0
        let want = 0
        let rated = 0
        for (const game of matrixGames) {
            const found = matrix.cells.get(game.bggName)?.get(nickname)
            if (!found) continue
            if (found.played) played++
            else if (found.want) want++
            if (found.rating != null) rated++
        }
        return { played, want, rated }
    }

    function exportMatrix() {
        const header = [
            '遊戲',
            ...visibleMembers.map((m) => personLabel(m, true)),
        ]
        const body = matrixGames.map((game) => [
            game.name,
            ...visibleMembers.map((m) =>
                cellCsv(matrix.cells.get(game.bggName)?.get(m.n)),
            ),
        ])
        downloadCsv('成員遊戲矩陣.csv', [header, ...body])
    }

    const loading =
        people.status === 'loading' || (isAdmin && adminRatings.status === 'loading')

    const inner = (
        <>
                <div className="ac-tabs" role="tablist">
                    <button
                        type="button"
                        className={`ac-tab ${tab === 'games' ? 'active' : ''}`}
                        onClick={() => setTab('games')}
                    >
                        遊戲總表
                    </button>
                    <button
                        type="button"
                        className={`ac-tab ${tab === 'chart' ? 'active' : ''}`}
                        onClick={() => setTab('chart')}
                    >
                        分布圖
                    </button>
                    {isAdmin && (
                        <button
                            type="button"
                            className={`ac-tab ${tab === 'matrix' ? 'active' : ''}`}
                            onClick={() => setTab('matrix')}
                        >
                            成員 × 遊戲矩陣
                        </button>
                    )}
                </div>

                {loading && <p className="ma-note">讀取中…</p>}

                {tab === 'games' && (
                    <>
                        <div className="ma-tools">
                            <input
                                type="search"
                                placeholder="搜尋遊戲名稱"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                            <label className="st-check">
                                <input
                                    type="checkbox"
                                    checked={showNames}
                                    onChange={(event) => setShowNames(event.target.checked)}
                                />
                                顯示名單
                            </label>
                            {isAdmin && (
                                <button type="button" className="ma-btn" onClick={exportGames}>
                                    匯出 CSV
                                </button>
                            )}
                        </div>
                        <p className="ma-note">
                            點欄位標題可以排序。評分需滿 5 人才會顯示平均。
                            {!isAdmin && '選擇不公開暱稱的玩家只算人數，不會列名。'}
                        </p>
                        <div className="st-wrap">
                            <table className="st-table">
                                <thead>
                                    <tr>
                                        <th className="st-sticky">
                                            <button type="button" className="st-sort" onClick={() => toggleSort('name')}>
                                                遊戲{arrow('name')}
                                            </button>
                                        </th>
                                        <th>
                                            <button type="button" className="st-sort" onClick={() => toggleSort('want')}>
                                                想玩{arrow('want')}
                                            </button>
                                        </th>
                                        <th>
                                            <button type="button" className="st-sort" onClick={() => toggleSort('played')}>
                                                已玩{arrow('played')}
                                            </button>
                                        </th>
                                        <th>
                                            <button type="button" className="st-sort" onClick={() => toggleSort('overall')}>
                                                整體評分{arrow('overall')}
                                            </button>
                                        </th>
                                        <th>
                                            <button type="button" className="st-sort" onClick={() => toggleSort('keep')}>
                                                留下來{arrow('keep')}
                                            </button>
                                        </th>
                                        <th>
                                            <button type="button" className="st-sort" onClick={() => toggleSort('count')}>
                                                評分人數{arrow('count')}
                                            </button>
                                        </th>
                                        {showNames && <th style={NAME_COL_STYLE}>想玩的人</th>}
                                        {showNames && <th style={NAME_COL_STYLE}>已玩的人</th>}
                                        {showNames && isAdmin && (
                                            <th style={NAME_COL_STYLE}>評分者（整體／留下來）</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {shownRows.map((row) => (
                                        <tr key={row.game.bggName}>
                                            <td className="st-sticky">{row.game.name}</td>
                                            <td>{row.want}</td>
                                            <td>{row.played}</td>
                                            <td>{row.overall == null ? '—' : row.overall.toFixed(1)}</td>
                                            <td>{row.keep == null ? '—' : row.keep.toFixed(1)}</td>
                                            <td>{row.count}</td>
                                            {showNames && (
                                                <td className="st-names" style={NAME_COL_STYLE}>
                                                    {row.wantNames}
                                                </td>
                                            )}
                                            {showNames && (
                                                <td className="st-names" style={NAME_COL_STYLE}>
                                                    {row.playedNames}
                                                </td>
                                            )}
                                            {showNames && isAdmin && (
                                                <td className="st-names" style={NAME_COL_STYLE}>
                                                    {row.raters}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {tab === 'chart' && (
                    <ScatterPanel rows={chartRows} onOpenGame={onOpenGame} />
                )}

                {tab === 'matrix' && isAdmin && (
                    <>
                        <div className="ma-tools">
                            <input
                                type="search"
                                placeholder="搜尋遊戲名稱"
                                value={matrixGameSearch}
                                onChange={(event) => setMatrixGameSearch(event.target.value)}
                            />
                            <select
                                value={matrixMember}
                                onChange={(event) => setMatrixMember(event.target.value)}
                            >
                                <option value="">全部玩家</option>
                                {matrix.members.map((m) => (
                                    <option key={m.n} value={m.n}>
                                        {m.n}
                                    </option>
                                ))}
                            </select>
                            <label className="st-check">
                                <input
                                    type="checkbox"
                                    checked={showAllGames}
                                    onChange={(event) => setShowAllGames(event.target.checked)}
                                />
                                顯示全部遊戲（預設只列有人標記或評分的）
                            </label>
                            <button type="button" className="ma-btn" onClick={exportMatrix}>
                                匯出 CSV
                            </button>
                        </div>
                        <p className="ma-note">
                            ✓ 已玩　♥ 想玩　★ 整體評分。最下面是每位成員的合計。
                        </p>
                        {matrix.members.length === 0 ? (
                            <p className="ma-note">目前還沒有任何玩家的紀錄。</p>
                        ) : (
                            <div className="st-wrap">
                                <table className="st-table st-matrix">
                                    <thead>
                                        <tr>
                                            <th className="st-sticky">遊戲</th>
                                            {visibleMembers.map((m) => (
                                                <th key={m.n}>
                                                    {m.n}
                                                    {m.c && <small>{m.c}</small>}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {matrixGames.map((game) => (
                                            <tr key={game.bggName}>
                                                <td className="st-sticky">{game.name}</td>
                                                {visibleMembers.map((m) => (
                                                    <td key={m.n}>
                                                        {cellText(matrix.cells.get(game.bggName)?.get(m.n))}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td className="st-sticky">合計（已玩／想玩／評分）</td>
                                            {visibleMembers.map((m) => {
                                                const t = memberTotals(m.n)
                                                return (
                                                    <td key={m.n}>
                                                        {t.played}／{t.want}／{t.rated}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </>
                )}
        </>
    )

    if (embedded) return <div className="st-modal st-embedded">{inner}</div>

    return (
        <FullScreenPage
            open={open}
            title="統計表"
            tag={isAdmin ? '管理者' : 'VIP'}
            onClose={onClose ?? (() => {})}
        >
            <div className="st-modal st-embedded">{inner}</div>
        </FullScreenPage>
    )
}
