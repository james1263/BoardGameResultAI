import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { BoardGame } from './data/boardGames.generated'
import { usePersonalCollection } from './lib/usePersonalCollection'
import type { PlaySessionsApi } from './lib/useGamePlaySessions'
import type { RatingsApi } from './lib/useGameRatings'
import LoyaltyCard from './components/LoyaltyCard'
import { supabase } from './lib/supabase'
import { useSession } from './lib/useSession'
import { useMyLoyalty } from './lib/useLoyalty'
import { PROFILE_SAVED_EVENT, signInWithGoogle } from './lib/googleLogin'
import MyGatherings from './components/MyGatherings'
import AddPlayLog from './components/AddPlayLog'
import { useBackClose } from './lib/useBackClose'

type PersonalApi = ReturnType<typeof usePersonalCollection>
type ListedGame = BoardGame & { removedAt?: string | null }
export type Tab = 'want' | 'played'
export type MyListMode = 'list' | 'loyalty'
type View = 'home' | 'stats' | 'gatherings' | 'addplay'
type StatsTab = 'overview' | 'want' | 'played'
type SortKey =
    | 'added'
    | 'added-rev'
    | 'name'
    | 'name-rev'
    | 'count'
    | 'count-rev'
    | 'recent'
    | 'recent-rev'

const SORT_FIELDS: { key: 'added' | 'name' | 'count' | 'recent'; label: string }[] = [
    { key: 'added', label: '加入時間' },
    { key: 'name', label: '名稱' },
    { key: 'count', label: '遊玩次數' },
    { key: 'recent', label: '最近遊玩' },
]

// 方向按鈕上的字：第一個是預設方向，第二個是反向
const SORT_DIRECTIONS: Record<'added' | 'name' | 'count' | 'recent', [string, string]> = {
    added: ['新→舊', '舊→新'],
    name: ['A→Z', 'Z→A'],
    count: ['多→少', '少→多'],
    recent: ['新→舊', '舊→新'],
}

// 最常玩要顯示前幾名（只記在這個瀏覽器）
type TopN = 3 | 5 | 10
const TOP_CHOICES: TopN[] = [3, 5, 10]
const TOP_KEY = 'boardgame-stats-top-n'
function loadTopN(): TopN {
    try {
        const value = Number(localStorage.getItem(TOP_KEY))
        if (value === 5 || value === 10) return value
    } catch {
        // 讀不到就用預設
    }
    return 3
}

function splitSort(key: SortKey): { field: 'added' | 'name' | 'count' | 'recent'; reversed: boolean } {
    const reversed = key.endsWith('-rev')
    const field = (reversed ? key.slice(0, -4) : key) as 'added' | 'name' | 'count' | 'recent'
    return { field, reversed }
}

// 搜尋時忽略大小寫、空白與標點
function normalizeText(text: string): string {
    return text.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '')
}

function toTime(value?: string | null): number | null {
    if (!value) return null
    const time = Date.parse(value)
    return Number.isNaN(time) ? null : time
}

// 預設數字大的排前面、reversed 時小的排前面；沒有資料（null）的永遠排最後
function compareMissingLast(
    a: number | null,
    b: number | null,
    reversed: boolean,
): number {
    if (a === null && b === null) return 0
    if (a === null) return 1
    if (b === null) return -1
    return reversed ? a - b : b - a
}

// 讀自己的暱稱（只在抽屜打開時才會執行）
function useMyNickname(userId: string | null): string {
    const [result, setResult] = useState<{ id: string; name: string } | null>(
        null,
    )
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        function handleSaved() {
            setReloadKey((key) => key + 1)
        }
        window.addEventListener(PROFILE_SAVED_EVENT, handleSaved)
        return () => window.removeEventListener(PROFILE_SAVED_EVENT, handleSaved)
    }, [])

    useEffect(() => {
        if (!userId) return
        let cancelled = false
        void supabase
            .from('player_profiles')
            .select('nickname')
            .eq('id', userId)
            .maybeSingle()
            .then(({ data }) => {
                if (cancelled) return
                const row = data as { nickname?: string | null } | null
                setResult({ id: userId, name: row?.nickname ?? '' })
            })
        return () => {
            cancelled = true
        }
    }, [userId, reloadKey])

    return result && result.id === userId ? result.name : ''
}

// 暱稱旁的集點小字（只有 VIP、且不是管理者才會顯示這個元件，所以只有他們會讀取集點資料）
function ClubPointsLine() {
    const loyalty = useMyLoyalty()
    const summary = loyalty.summary

    if (loyalty.loading && !summary) {
        return <p className="club-pts-line">集點資料讀取中…</p>
    }

    const total = summary?.totalPoints ?? 0
    const held = summary?.availableVouchers ?? 0
    const usable = summary?.usableVouchers ?? 0
    const later = Math.max(held - usable, 0)

    return (
        <p className="club-pts-line">
            累計 {total} 點・免費券 {held} 張
            {later > 0 ? `（${later} 張明天起可用）` : ''}
        </p>
    )
}

function ClubHeader({
    isAdmin,
    isVip,
    onClose,
}: {
    isAdmin: boolean
    isVip: boolean
    onClose: () => void
}) {
    const session = useSession()
    const userId = session?.user?.id ?? null
    const loggedIn = userId !== null
    const nickname = useMyNickname(userId)

    const name = loggedIn ? nickname || '玩家' : '訪客'
    const badge = isAdmin
        ? '管理者'
        : isVip
            ? 'VIP 會員'
            : loggedIn
                ? '一般會員'
                : '尚未登入'
    const showPoints = loggedIn && isVip && !isAdmin

    return (
        <div className="club-card">
            <div className="club-top">
                <div>
                    <h2>我的俱樂部</h2>
                </div>
                <button
                    className="club-close"
                    type="button"
                    aria-label="關閉"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>

            <div className="club-who">
                <span className="club-avatar" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                        <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.8" />
                        <path
                            d="M4.5 20c.9-3.6 3.8-5.6 7.5-5.6s6.6 2 7.5 5.6"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                </span>
                <div>
                    <p className="club-name">{name}</p>
                    <p className={`club-badge ${isVip || isAdmin ? 'vip' : ''}`}>{badge}</p>
                    {showPoints && <ClubPointsLine />}
                </div>
            </div>

            {!loggedIn && (
                <div className="club-login">
                    <p>
                        目前的想玩、已玩只存在這個瀏覽器。用 Google 登入後可以跨裝置保存；
                        成為 VIP 還能評分、集點、看大家的名單。
                    </p>
                    <button
                        type="button"
                        className="club-login-btn"
                        onClick={() => void signInWithGoogle()}
                    >
                        用 Google 登入
                    </button>
                </div>
            )}

            {loggedIn && !isVip && !isAdmin && (
                <p className="club-note">
                    成為 VIP 後可以評分、集點、看大家的名單。向管理者索取通關密碼，或參加聚會報到即可。
                </p>
            )}
        </div>
    )
}

export default function MyList({
    boardGames,
    personal,
    playSessions,
    ratings,
    isOpen,
    mode,
    focusDate,
    isAdmin,
    isVip,
    todayPending,
    onClose,
    onBrowse,
    onOpenGame,
    onOpenLoyalty,
    renderCover,
}: {
    boardGames: ListedGame[]
    personal: PersonalApi
    playSessions: PlaySessionsApi
    ratings: RatingsApi
    isOpen: boolean
    mode: MyListMode
    focusDate?: string | null
    isAdmin: boolean
    isVip: boolean
    todayPending: boolean
    onClose: () => void
    onBrowse: () => void
    onOpenGame: (game: BoardGame, tab?: 'ratings') => void
    onOpenLoyalty: () => void
    renderCover: (game: BoardGame) => ReactNode
}) {
    const [view, setView] = useState<View>('home')
    const [statsTab, setStatsTab] = useState<StatsTab>('overview')
    const [search, setSearch] = useState('')
    // 想玩、已玩各自記住排序；切換分頁只清空搜尋
    const [sortWant, setSortWant] = useState<SortKey>('added')
    const [sortPlayed, setSortPlayed] = useState<SortKey>('added')
    const [topN, setTopN] = useState<TopN>(loadTopN)
    const [showHoursNote, setShowHoursNote] = useState(false)
    // 分頁切換不另建瀏覽歷史：返回鍵與 ✕ 一律回「我的俱樂部」首頁
    useBackClose(() => setView('home'), isOpen && mode !== 'loyalty' && view !== 'home')

    // 每次打開都回到首頁，統計頁預設「概況」
    useEffect(() => {
        if (isOpen) {
            setView('home')
            setStatsTab('overview')
            setSearch('')
            setSortWant('added')
            setSortPlayed('added')
            setShowHoursNote(false)
        }
    }, [isOpen, mode])

    function changeTopN(next: TopN) {
        setTopN(next)
        try {
            localStorage.setItem(TOP_KEY, String(next))
        } catch {
            // 存不了就算了
        }
    }

    function openStats() {
        setStatsTab('overview')
        setSearch('')
        setView('stats')
    }

    function switchStatsTab(next: StatsTab) {
        setStatsTab(next)
        setSearch('')
    }

    // 目前清單是哪一份（概況分頁不用清單）
    const tab: Tab = statsTab === 'want' ? 'want' : 'played'
    const sortKey = tab === 'want' ? sortWant : sortPlayed
    function setSortKey(next: SortKey) {
        if (tab === 'want') setSortWant(next)
        else setSortPlayed(next)
    }

    const wantGames = useMemo(
        () => boardGames.filter((game) => personal.entries[game.bggName]?.wantToPlay),
        [boardGames, personal.entries],
    )
    const playedGames = useMemo(
        () => boardGames.filter((game) => personal.entries[game.bggName]?.played),
        [boardGames, personal.entries],
    )

    // 清單：搜尋＋排序；沒有資料的（沒加入時間、沒次數、沒最近日期）一律排最後
    const shown = useMemo(() => {
        const source = tab === 'want' ? wantGames : playedGames
        const query = normalizeText(search)

        const rows = source
            .filter(
                (game) =>
                    !query ||
                    normalizeText(game.name).includes(query) ||
                    normalizeText(game.bggName).includes(query),
            )
            .map((game) => {
                const entry = personal.entries[game.bggName]
                const summary = playSessions.getSummary(game.bggName)
                return {
                    game,
                    total: (entry?.playCount ?? 0) + summary.count,
                    last: toTime(summary.lastPlayedOn),
                    added: toTime(
                        tab === 'want' ? entry?.wantFirstAt : entry?.playedFirstAt,
                    ),
                }
            })

        const { field, reversed } = splitSort(sortKey)
        rows.sort((a, b) => {
            const byName = a.game.name.localeCompare(b.game.name, 'zh-Hant')
            if (field === 'name') return reversed ? -byName : byName
            let result = 0
            if (field === 'added') {
                result = compareMissingLast(a.added, b.added, reversed)
            } else if (field === 'count') {
                result = compareMissingLast(
                    a.total > 0 ? a.total : null,
                    b.total > 0 ? b.total : null,
                    reversed,
                )
            } else if (field === 'recent') {
                result = compareMissingLast(a.last, b.last, reversed)
            }
            return result || byName
        })

        return rows.map((row) => row.game)
    }, [tab, wantGames, playedGames, search, sortKey, personal.entries, playSessions])

    // 我的統計：次數＝沒日期的次數＋有日期的紀錄筆數；時數是用 BGG 標示時間估算
    const stats = useMemo(() => {
        const rows: { game: BoardGame; total: number }[] = []
        let totalPlays = 0
        let totalMinutes = 0
        for (const game of boardGames) {
            const entry = personal.entries[game.bggName]
            const total =
                (entry?.playCount ?? 0) + playSessions.getSummary(game.bggName).count
            if (total <= 0) continue
            rows.push({ game, total })
            totalPlays += total
            if (game.bggTime) totalMinutes += total * game.bggTime
        }
        rows.sort(
            (a, b) =>
                b.total - a.total || a.game.name.localeCompare(b.game.name, 'zh-Hant'),
        )
        return {
            totalPlays,
            hours: Math.round(totalMinutes / 6) / 10,
            top: rows.slice(0, 10),
        }
    }, [boardGames, personal.entries, playSessions])

    if (!isOpen) return null

    const isLoyalty = mode === 'loyalty'
    const isLoading = personal.isLoggedIn && personal.status === 'loading'
    const sourceCount = tab === 'want' ? wantGames.length : playedGames.length

    // ---------- 集點卡（維持原樣） ----------
    if (isLoyalty) {
        return (
            <>
                <div className="mylist-backdrop" onClick={onClose} />
                <aside className="mylist-drawer" role="dialog" aria-label="集點卡">
                    <div className="mylist-header">
                        <h2>集點卡</h2>
                        <button
                            className="mylist-close"
                            type="button"
                            aria-label="關閉"
                            onClick={onClose}
                        >
                            ×
                        </button>
                    </div>
                    <div className="mylist-body">
                        <LoyaltyCard
                            boardGames={boardGames}
                            ratings={ratings}
                            personal={personal}
                            playSessions={playSessions}
                            focusDate={focusDate}
                            onOpenGame={onOpenGame}
                        />
                    </div>
                </aside>
            </>
        )
    }

    // ---------- 我的場次 ----------
    if (view === 'gatherings') {
        return (
            <MyGatherings
                boardGames={boardGames}
                personal={personal}
                playSessions={playSessions}
                isAdmin={isAdmin}
                onBack={() => setView('home')}
                onClose={onClose}
                onOpenGame={onOpenGame}
                renderCover={renderCover}
            />
        )
    }

    // ---------- 補記遊玩 ----------
    if (view === 'addplay') {
        return (
            <AddPlayLog
                boardGames={boardGames}
                personal={personal}
                playSessions={playSessions}
                onBack={() => setView('home')}
                onClose={onClose}
            />
        )
    }

    // ---------- 我的統計（概況｜想玩｜已玩） ----------
    if (view === 'stats') {
        return (
            <>
                <div className="mylist-backdrop" onClick={onClose} />
                <aside className="mylist-drawer" role="dialog" aria-label="我的統計">
                    <div className="mylist-header">
                        <h2>我的統計</h2>
                        <button
                            className="mylist-close"
                            type="button"
                            aria-label="關閉"
                            onClick={() => setView('home')}
                        >
                            ×
                        </button>
                    </div>

                    <div className="lb-tabs">
                        <button
                            type="button"
                            className={`lb-tab ${statsTab === 'overview' ? 'active' : ''}`}
                            onClick={() => switchStatsTab('overview')}
                        >
                            概況
                        </button>
                        <button
                            type="button"
                            className={`lb-tab ${statsTab === 'want' ? 'active' : ''}`}
                            onClick={() => switchStatsTab('want')}
                        >
                            想玩 {wantGames.length}
                        </button>
                        <button
                            type="button"
                            className={`lb-tab ${statsTab === 'played' ? 'active' : ''}`}
                            onClick={() => switchStatsTab('played')}
                        >
                            已玩 {playedGames.length}
                        </button>
                    </div>

                    <div className="mylist-body">
                        {statsTab === 'overview' ? (
                            <>
                            <div className="mystat-grid">
                                <div className="mystat-box">
                                    <span>玩過</span>
                                    <strong>{playedGames.length}</strong>
                                    <small>款</small>
                                </div>
                                <div className="mystat-box">
                                    <span>總遊玩次數</span>
                                    <strong>{stats.totalPlays}</strong>
                                    <small>次</small>
                                </div>
                                <button
                                    type="button"
                                    className="mystat-box mystat-box-btn"
                                    aria-expanded={showHoursNote}
                                    onClick={() => setShowHoursNote((value) => !value)}
                                >
                                    <span>
                                        總時數（約）
                                        <i className="mystat-i" aria-hidden="true">i</i>
                                    </span>
                                    <strong>{stats.totalPlays > 0 ? stats.hours : 0}</strong>
                                    <small>小時</small>
                                </button>
                            </div>

                            {showHoursNote && (
                                <p className="mystat-foot">
                                    總時數是用「次數 × BGG 標示的遊戲時間」估算，沒有時間資料的遊戲不計入，僅供參考。
                                </p>
                            )}

                            <div className="mystat-title-row">
                                <h3 className="mystat-title">最常玩 TOP {topN}</h3>
                                <div className="mystat-topn" role="group" aria-label="顯示名次數量">
                                    {TOP_CHOICES.map((choice) => (
                                        <button
                                            key={choice}
                                            type="button"
                                            className={`mystat-topn-btn ${topN === choice ? 'active' : ''}`}
                                            aria-pressed={topN === choice}
                                            onClick={() => changeTopN(choice)}
                                        >
                                            {choice}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {stats.top.length === 0 ? (
                                <p className="mylist-empty">
                                    還沒有遊玩次數。在「已玩」分頁調整次數，或在遊戲視窗記錄一次遊玩，這裡就會統計。
                                </p>
                            ) : (
                                <ol className="mystat-top">
                                    {stats.top.slice(0, topN).map(({ game, total }, index) => (
                                        <li key={game.bggName}>
                                            <span className="mystat-rank">{index + 1}</span>
                                            <div className="mylist-thumb">{renderCover(game)}</div>
                                            <button
                                                type="button"
                                                className="mylist-name"
                                                onClick={() => onOpenGame(game)}
                                            >
                                                {game.name}
                                            </button>
                                            <b className="mystat-count">{total} 次</b>
                                        </li>
                                    ))}
                                </ol>
                            )}

                            </>
                        ) : (
                            <>
                            {isLoading ? (
                                <p className="mylist-empty">讀取中…</p>
                            ) : sourceCount === 0 ? (
                                <div className="mylist-empty">
                                    <p>
                                        {tab === 'want'
                                            ? '還沒有想玩的遊戲。在遊戲封面按 ♥，就會出現在這裡。'
                                            : '還沒有已玩的遊戲。在遊戲封面按 ✓，就會出現在這裡。'}
                                    </p>
                                    <button
                                        type="button"
                                        className="mylist-browse"
                                        onClick={onBrowse}
                                    >
                                        去逛收藏
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="cls-searchbox">
                                        <input
                                            type="search"
                                            className="cls-search-input"
                                            placeholder="搜尋遊戲名稱"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                        />
                                        <select
                                            className="cls-sort-field"
                                            aria-label="排序欄位"
                                            value={splitSort(sortKey).field}
                                            onChange={(event) =>
                                                setSortKey(event.target.value as SortKey)
                                            }
                                        >
                                            {SORT_FIELDS.map((item) => (
                                                <option key={item.key} value={item.key}>
                                                    {item.label}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            className="cls-sort-dir"
                                            onClick={() => {
                                                const { field, reversed } = splitSort(sortKey)
                                                setSortKey((reversed ? field : `${field}-rev`) as SortKey)
                                            }}
                                        >
                                            {splitSort(sortKey).reversed ? '↑' : '↓'}{' '}
                                            {SORT_DIRECTIONS[splitSort(sortKey).field][splitSort(sortKey).reversed ? 1 : 0]}
                                        </button>
                                    </div>
                                    {search.trim() && (
                                        <p className="cls-count">
                                            找到 {shown.length} / {sourceCount} 款
                                        </p>
                                    )}

                                    {shown.length === 0 ? (
                                        <p className="mylist-empty">找不到符合的遊戲。</p>
                                    ) : (
                                        <ul className="mylist-list">
                                            {shown.map((game) => {
                                                const entry = personal.entries[game.bggName]
                                                const summary = playSessions.getSummary(game.bggName)
                                                const total = (entry?.playCount ?? 0) + summary.count
                                                return (
                                                    <li className="mylist-item" key={game.bggName}>
                                                        <div className="mylist-thumb">{renderCover(game)}</div>
                                                        <div className="mylist-info">
                                                            <button
                                                                type="button"
                                                                className="mylist-name"
                                                                onClick={() => onOpenGame(game)}
                                                            >
                                                                {game.name}
                                                            </button>
                                                            {tab === 'played' ? (
                                                                <div className="mylist-counter">
                                                                    <button
                                                                        type="button"
                                                                        className="mylist-counter-btn"
                                                                        aria-label="減少遊玩次數"
                                                                        title={
                                                                            (entry?.playCount ?? 0) <= 0 && summary.count > 0
                                                                                ? '有日期的紀錄請在遊戲視窗「我的桌遊」分頁刪除'
                                                                                : undefined
                                                                        }
                                                                        disabled={!personal.canEdit || (entry?.playCount ?? 0) <= 0}
                                                                        onClick={() =>
                                                                            personal.updateEntry(
                                                                                game.bggName,
                                                                                { playCount: (entry?.playCount ?? 0) - 1 },
                                                                                { skipPlayedRule: true },
                                                                            )
                                                                        }
                                                                    >
                                                                        −
                                                                    </button>
                                                                    <span className="mylist-counter-value">{total} 次</span>
                                                                    <button
                                                                        type="button"
                                                                        className="mylist-counter-btn"
                                                                        aria-label="增加遊玩次數"
                                                                        disabled={!personal.canEdit || (entry?.playCount ?? 0) >= 999}
                                                                        onClick={() =>
                                                                            personal.updateEntry(
                                                                                game.bggName,
                                                                                { playCount: (entry?.playCount ?? 0) + 1 },
                                                                                { skipPlayedRule: true },
                                                                            )
                                                                        }
                                                                    >
                                                                        ＋
                                                                    </button>
                                                                    {summary.lastPlayedOn && (
                                                                        <span className="mylist-counter-last">
                                                                            最近：{summary.lastPlayedOn.replaceAll('-', '/')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                total > 0 && (
                                                                    <p className="mylist-meta">
                                                                        玩過 {total} 次
                                                                        {summary.lastPlayedOn &&
                                                                            ` · 最近：${summary.lastPlayedOn.replaceAll('-', '/')}`}
                                                                    </p>
                                                                )
                                                            )}
                                                            {entry?.note && (
                                                                <p className="mylist-note">{entry.note}</p>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="mylist-remove"
                                                            disabled={!personal.canEdit}
                                                            onClick={() =>
                                                                personal.updateEntry(
                                                                    game.bggName,
                                                                    tab === 'want'
                                                                        ? { wantToPlay: false }
                                                                        : { played: false },
                                                                )
                                                            }
                                                        >
                                                            移除
                                                        </button>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    )}
                                </>
                            )}
                            </>
                        )}
                    </div>
                </aside>
            </>
        )
    }

    // ---------- 我的桌遊（首頁） ----------
    return (
        <>
            <div className="mylist-backdrop" onClick={onClose} />
            <aside className="mylist-drawer" role="dialog" aria-label="我的桌遊">
                <div className="mylist-body club-body">
                    <ClubHeader isAdmin={isAdmin} isVip={isVip} onClose={onClose} />
                    {todayPending && (
                        <div className="club-today">
                            <div>
                                <b>今天有聚會，還沒評分</b>
                                <p>評完當天遊戲就能得 1 點</p>
                            </div>
                            <button type="button" onClick={onOpenLoyalty}>
                                去評分
                            </button>
                        </div>
                    )}
                    <div className="club-list club-more">
                        <button
                            type="button"
                            className="club-menu-item club-menu-single"
                            onClick={openStats}
                        >
                            <span className="club-menu-icon" aria-hidden="true">▤</span>
                            <span className="club-menu-text">
                                <b>我的統計</b>
                            </span>
                            <span className="club-menu-count">
                                想玩 {wantGames.length}・已玩 {playedGames.length}
                            </span>
                            <span className="club-menu-arrow" aria-hidden="true">›</span>
                        </button>
                    </div>
                    {personal.isLoggedIn && (
                        <>
                            <div className="club-list club-more">
                                <button
                                    type="button"
                                    className="club-menu-item club-menu-single"
                                    onClick={() => setView('gatherings')}
                                >
                                    <span className="club-menu-icon" aria-hidden="true">📅</span>
                                    <span className="club-menu-text">
                                        <b>我的場次</b>
                                    </span>
                                    <span className="club-menu-arrow" aria-hidden="true">›</span>
                                </button>
                            </div>
                            <div className="club-list club-more">
                                <button
                                    type="button"
                                    className="club-menu-item club-menu-single"
                                    onClick={() => setView('addplay')}
                                >
                                    <span className="club-menu-icon" aria-hidden="true">📝</span>
                                    <span className="club-menu-text">
                                        <b>補記遊玩</b>
                                    </span>
                                    <span className="club-menu-arrow" aria-hidden="true">›</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </aside>
        </>
    )
}