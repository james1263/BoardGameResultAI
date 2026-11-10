import { useMemo, useState, type ReactNode } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import type { RatingsApi, MyRating } from '../lib/useGameRatings'
import { RATING_FIELDS } from '../lib/useGameRatings'
import { askConfirm } from '../lib/askConfirm'
import RatingSection from './RatingSection'
import '../styles/my-ratings-hub.css'

type Status = 'none' | 'partial' | 'full'
type Filter = 'all' | Status
type Scope = 'played' | 'all'
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

type Row = {
    game: BoardGame
    mine: MyRating | null
    status: Status
    played: boolean
}

export default function MyRatingsHub({
    boardGames,
    ratings,
    isPlayed,
    onBack,
    onClose,
    onOpenGame,
    renderCover,
    focusName = null,
}: {
    boardGames: BoardGame[]
    ratings: RatingsApi
    isPlayed: (bggName: string) => boolean
    onBack: () => void
    onClose: () => void
    onOpenGame: (game: BoardGame, tab?: 'ratings' | 'discussion') => void
    renderCover: (game: BoardGame) => ReactNode
    // 從遊戲視窗「前往我的評分」跳來：直接搜尋並展開這一款
    focusName?: string | null
}) {
    const focusGame = focusName ? boardGames.find((g) => g.bggName === focusName) : undefined
    const [scope, setScope] = useState<Scope>(
        focusGame && !isPlayed(focusGame.bggName) ? 'all' : 'played',
    )
    const [filter, setFilter] = useState<Filter>('all')
    const [search, setSearch] = useState(focusGame ? focusGame.name : '')
    const [field, setField] = useState<SortField>('updated')
    const [reverse, setReverse] = useState(false)
    // 一次只展開一款
    const [openName, setOpenName] = useState<string | null>(focusGame ? focusGame.bggName : null)

    const ready = ratings.status === 'ready'

    // 所有桌遊（不含僅供參考）＋每款的評分狀態與是否玩過
    const allRows = useMemo<Row[]>(() => {
        if (!ready) return []
        return boardGames.map((game) => {
            const mine = ratings.getMine(game.bggName)
            return {
                game,
                mine,
                status: statusOf(mine),
                played: isPlayed(game.bggName),
            }
        })
    }, [ready, boardGames, ratings, isPlayed])

    // 「已玩」範圍＝標過已玩的，加上評過分的
    const playedRows = useMemo(
        () => allRows.filter((row) => row.played || row.mine),
        [allRows],
    )
    const rows = scope === 'played' ? playedRows : allRows

    const counts = useMemo(() => {
        const result = { all: rows.length, none: 0, partial: 0, full: 0 }
        for (const row of rows) result[row.status] += 1
        return result
    }, [rows])

    const ratedTotal = useMemo(() => allRows.filter((row) => row.mine).length, [allRows])
    const fullTotal = useMemo(
        () => allRows.filter((row) => row.status === 'full').length,
        [allRows],
    )

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
        const byName = (a: Row, b: Row) => a.game.name.localeCompare(b.game.name, 'zh-Hant')
        return [...list].sort((a, b) => {
            if (field === 'updated') {
                // 新→舊；沒有修改日期（還沒評分）永遠排最後
                const ta = a.mine?.updatedAt ? Date.parse(a.mine.updatedAt) : null
                const tb = b.mine?.updatedAt ? Date.parse(b.mine.updatedAt) : null
                if (ta == null && tb == null) return byName(a, b)
                if (ta == null) return 1
                if (tb == null) return -1
                return (tb - ta) * dir || byName(a, b)
            }
            return byName(a, b) * dir
        })
    }, [rows, filter, search, field, reverse])

    const dirLabel = field === 'updated' ? (reverse ? '舊→新' : '新→舊') : reverse ? 'Z→A' : 'A→Z'

    // 沒玩過的遊戲存檔前確認：評分會同時把它標成已玩
    function makeBeforeSave(row: Row) {
        if (row.played || row.mine) return undefined
        return () =>
            askConfirm('這款你還沒標為「已玩」。儲存評分會同時把它標為已玩，確定要儲存嗎？')
    }

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

                <div className="mylist-body mrh-body">
                    {ratings.status === 'loading' && <p className="mylist-empty">讀取中…</p>}
                    {ratings.status === 'error' && (
                        <p className="mylist-empty">評分讀取失敗，請稍後再試。</p>
                    )}
                    {ratings.status === 'guest' && (
                        <p className="mylist-empty">登入後才能記錄與查看自己的評分。</p>
                    )}

                    {ready && (
                        <>
                            <div className="mrh-summary">
                                <div>
                                    <strong>{ratedTotal}</strong>
                                    <span>已評分</span>
                                </div>
                                <div>
                                    <strong>{fullTotal}</strong>
                                    <span>已完整</span>
                                </div>
                                <div>
                                    <strong>{playedRows.filter((row) => row.played).length}</strong>
                                    <span>已玩</span>
                                </div>
                            </div>
                            <details className="mrh-helpfold">
                                <summary>ⓘ 評分說明</summary>
                                <p className="mrh-help">
                                    完整評分＝整體與六項（喜歡度、玩家影響性、溝通度、變化度、獨特性、適合留下來）都填。點一款遊戲就能直接評分。
                                </p>
                            </details>

                            <div className="mrh-seg" role="tablist" aria-label="清單範圍">
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={scope === 'played'}
                                    className={scope === 'played' ? 'active' : ''}
                                    onClick={() => setScope('played')}
                                >
                                    已玩的遊戲 {playedRows.length}
                                </button>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={scope === 'all'}
                                    className={scope === 'all' ? 'active' : ''}
                                    onClick={() => setScope('all')}
                                >
                                    全部桌遊 {allRows.length}
                                </button>
                            </div>

                            <div className="mrh-filters" role="tablist" aria-label="評分狀態">
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

                            <div className="mrh-tools">
                                <input
                                    type="search"
                                    className="mrh-search"
                                    placeholder="搜尋遊戲名稱"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                />
                                <div className="mrh-sortrow">
                                    <select
                                        className="mrh-sort"
                                        aria-label="排序欄位"
                                        value={field}
                                        onChange={(event) => {
                                            setField(event.target.value as SortField)
                                            setReverse(false)
                                        }}
                                    >
                                        <option value="updated">依修改日期</option>
                                        <option value="name">依名稱</option>
                                    </select>
                                    <button
                                        type="button"
                                        className="mrh-dir"
                                        onClick={() => setReverse((value) => !value)}
                                    >
                                        {dirLabel}
                                    </button>
                                </div>
                            </div>

                            {(search.trim() || filter !== 'all') && (
                                <p className="mrh-count">
                                    顯示 {shown.length} / {rows.length} 款
                                </p>
                            )}

                            {rows.length === 0 ? (
                                <p className="mylist-empty">
                                    還沒有標為已玩的遊戲。切到「全部桌遊」就能直接評分。
                                </p>
                            ) : shown.length === 0 ? (
                                <p className="mylist-empty">這個分類沒有符合的遊戲。</p>
                            ) : (
                                <ul className="mrh-list">
                                    {shown.map((row) => {
                                        const open = openName === row.game.bggName
                                        const date = formatDate(row.mine?.updatedAt)
                                        return (
                                            <li
                                                className={`mrh-item ${open ? 'open' : ''}`}
                                                key={row.game.bggName}
                                            >
                                                <button
                                                    type="button"
                                                    className="mrh-head"
                                                    aria-expanded={open}
                                                    onClick={() =>
                                                        setOpenName(open ? null : row.game.bggName)
                                                    }
                                                >
                                                    <span className="mylist-thumb mrh-thumb">
                                                        {renderCover(row.game)}
                                                    </span>
                                                    <span className="mrh-main">
                                                        <span className="mrh-name">{row.game.name}</span>
                                                        <span className="mrh-meta">
                                                            <span className={`mrh-badge mrh-${row.status}`}>
                                                                {STATUS_LABEL[row.status]}
                                                            </span>
                                                            {row.mine && (
                                                                <span className="mrh-score">
                                                                    整體 {row.mine.overall}
                                                                </span>
                                                            )}
                                                            {!row.played && !row.mine && (
                                                                <span className="mrh-unplayed">還沒玩過</span>
                                                            )}
                                                            {date && <span className="mrh-date">{date}</span>}
                                                        </span>
                                                    </span>
                                                    <span className="mrh-chev" aria-hidden="true">
                                                        {open ? '▲' : '▼'}
                                                    </span>
                                                </button>

                                                {open && (
                                                    <div className="mrh-detail">
                                                        {!row.played && !row.mine && (
                                                            <p className="mrh-note">
                                                                這款你還沒標為「已玩」。儲存評分時會一併標為已玩。
                                                            </p>
                                                        )}
                                                        <RatingSection
                                                            key={row.game.bggName}
                                                            bggName={row.game.bggName}
                                                            api={ratings}
                                                            beforeSave={makeBeforeSave(row)}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="mrh-link"
                                                            onClick={() => onOpenGame(row.game)}
                                                        >
                                                            查看這款遊戲的詳細資料 ›
                                                        </button>
                                                    </div>
                                                )}
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
