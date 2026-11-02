import { useMemo, useState, type ReactNode } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import type { RatingsApi, MyRating } from '../lib/useGameRatings'
import { RATING_FIELDS } from '../lib/useGameRatings'
import '../styles/my-ratings-hub.css'

type Status = 'none' | 'partial' | 'full'
type Filter = 'all' | Status
type SortField = 'updated' | 'name'

const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'none', label: '未評分' },
    { key: 'partial', label: '待補細項' },
    { key: 'full', label: '已完整' },
]

const STATUS_LABEL: Record<Status, string> = {
    none: '未評分',
    partial: '待補細項',
    full: '已完整',
}

// 完整評分＝整體＋六項（含適合留下來）皆非空；有評分但六項有空白＝待補細項
function statusOf(mine: MyRating | null): Status {
    if (!mine) return 'none'
    const complete = RATING_FIELDS.every((field) => mine[field.key] != null)
    return complete ? 'full' : 'partial'
}

function formatDate(iso: string | null | undefined): string {
    if (!iso) return ''
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' })
}

function normalizeText(text: string): string {
    return text.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '')
}

type Row = { game: BoardGame; mine: MyRating | null; status: Status }

export default function MyRatingsHub({
    boardGames,
    ratings,
    isPlayed,
    onBack,
    onClose,
    onOpenGame,
    renderCover,
}: {
    boardGames: BoardGame[]
    ratings: RatingsApi
    isPlayed: (bggName: string) => boolean
    onBack: () => void
    onClose: () => void
    onOpenGame: (game: BoardGame, tab?: 'ratings' | 'discussion') => void
    renderCover: (game: BoardGame) => ReactNode
}) {
    const [filter, setFilter] = useState<Filter>('all')
    const [search, setSearch] = useState('')
    const [field, setField] = useState<SortField>('updated')
    const [reverse, setReverse] = useState(false)

    const ready = ratings.status === 'ready'

    // 清單＝我玩過的遊戲，加上評過分的遊戲
    const rows = useMemo<Row[]>(() => {
        if (!ready) return []
        const list: Row[] = []
        for (const game of boardGames) {
            const mine = ratings.getMine(game.bggName)
            if (!mine && !isPlayed(game.bggName)) continue
            list.push({ game, mine, status: statusOf(mine) })
        }
        return list
    }, [ready, boardGames, ratings, isPlayed])

    const counts = useMemo(() => {
        const result = { all: rows.length, none: 0, partial: 0, full: 0 }
        for (const row of rows) result[row.status] += 1
        return result
    }, [rows])

    const shown = useMemo(() => {
        const query = normalizeText(search)
        const list = rows.filter(
            (row) =>
                (filter === 'all' || row.status === filter) &&
                (!query ||
                    normalizeText(row.game.name).includes(query) ||
                    normalizeText(row.game.bggName).includes(query)),
        )
        const dir = reverse ? -1 : 1
        return [...list].sort((a, b) => {
            if (field === 'updated') {
                // 新→舊；沒有修改日期（還沒評分）永遠排最後
                const ta = a.mine?.updatedAt ? Date.parse(a.mine.updatedAt) : null
                const tb = b.mine?.updatedAt ? Date.parse(b.mine.updatedAt) : null
                if (ta == null && tb == null) {
                    return a.game.name.localeCompare(b.game.name, 'zh-Hant')
                }
                if (ta == null) return 1
                if (tb == null) return -1
                return (tb - ta) * dir || a.game.name.localeCompare(b.game.name, 'zh-Hant')
            }
            return a.game.name.localeCompare(b.game.name, 'zh-Hant') * dir
        })
    }, [rows, filter, search, field, reverse])

    const dirLabel = field === 'updated' ? (reverse ? '舊→新' : '新→舊') : reverse ? 'Z→A' : 'A→Z'

    return (
        <>
            <div className="mylist-backdrop" onClick={onClose} />
            <aside className="mylist-drawer" role="dialog" aria-label="我的評分">
                <div className="mylist-header">
                    <h2>我的評分</h2>
                    <button
                        className="mylist-close"
                        type="button"
                        aria-label="關閉"
                        onClick={onBack}
                    >
                        ×
                    </button>
                </div>

                <div className="mylist-body">
                    {ratings.status === 'loading' && <p className="mylist-empty">讀取中…</p>}
                    {ratings.status === 'error' && (
                        <p className="mylist-empty">評分讀取失敗，請稍後再試。</p>
                    )}
                    {ratings.status === 'guest' && (
                        <p className="mylist-empty">登入後才能記錄與查看自己的評分。</p>
                    )}

                    {ready && (
                        <>
                            <p className="mrh-progress">
                                已評分 <b>{counts.partial + counts.full}</b> / 清單{' '}
                                <b>{counts.all}</b> 款・已完整 <b>{counts.full}</b> 款
                            </p>
                            <p className="mystat-foot">
                                完整評分＝整體與六項（喜歡度、玩家影響性、溝通度、變化度、獨特性、適合留下來）都填。點「評分」會打開那款遊戲的評分分頁。
                            </p>

                            <div className="mrh-filters" role="tablist">
                                {FILTERS.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        role="tab"
                                        aria-selected={filter === item.key}
                                        className={`mrh-filter ${filter === item.key ? 'active' : ''}`}
                                        onClick={() => setFilter(item.key)}
                                    >
                                        {item.label} {counts[item.key]}
                                    </button>
                                ))}
                            </div>

                            <div className="cls-searchbox cls-sticky">
                                <input
                                    type="search"
                                    className="cls-search-input"
                                    placeholder="搜尋遊戲名稱"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                />
                                <select
                                    className="mrh-sort"
                                    aria-label="排序欄位"
                                    value={field}
                                    onChange={(event) => {
                                        setField(event.target.value as SortField)
                                        setReverse(false)
                                    }}
                                >
                                    <option value="updated">修改日期</option>
                                    <option value="name">名稱</option>
                                </select>
                                <button
                                    type="button"
                                    className="cls-sort-dir"
                                    onClick={() => setReverse((value) => !value)}
                                >
                                    {dirLabel}
                                </button>
                            </div>
                            {(search.trim() || filter !== 'all') && (
                                <p className="cls-count">
                                    顯示 {shown.length} / {rows.length} 款
                                </p>
                            )}

                            {rows.length === 0 ? (
                                <p className="mylist-empty">
                                    還沒有玩過的遊戲。標記「已玩」或記錄遊玩後，這裡就會出現。
                                </p>
                            ) : shown.length === 0 ? (
                                <p className="mylist-empty">這個分類沒有符合的遊戲。</p>
                            ) : (
                                <ul className="mylist-list">
                                    {shown.map((row) => {
                                        const date = formatDate(row.mine?.updatedAt)
                                        return (
                                            <li className="mylist-item" key={row.game.bggName}>
                                                <div className="mylist-thumb">
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
                                                        <span className={`mrh-badge mrh-${row.status}`}>
                                                            {STATUS_LABEL[row.status]}
                                                        </span>
                                                        {row.mine && (
                                                            <>
                                                                {' '}整體 {row.mine.overall}
                                                                {date ? `・上次修改 ${date}` : ''}
                                                            </>
                                                        )}
                                                    </small>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="mrh-go"
                                                    onClick={() => onOpenGame(row.game, 'ratings')}
                                                >
                                                    {row.status === 'none'
                                                        ? '評分'
                                                        : row.status === 'partial'
                                                            ? '補細項'
                                                            : '修改'}
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </>
                    )}
                </div>
            </aside>
        </>
    )
}
