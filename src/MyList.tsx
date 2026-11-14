import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { BoardGame } from './data/boardGames.generated'
import { usePersonalCollection } from './lib/usePersonalCollection'
import type { PlaySessionsApi } from './lib/useGamePlaySessions'
import type { RatingsApi } from './lib/useGameRatings'
import type { AdminScores } from './lib/libraryTypes'
import LoyaltyCard from './components/LoyaltyCard'
import type { GameChange } from './lib/useLoyaltyAlerts'
import { supabase } from './lib/supabase'
import { runUnplayFlow } from './lib/unplayFlow'
import { useSession } from './lib/useSession'
import { useMyLoyalty, todayLocal } from './lib/useLoyalty'
import { TodayRatingModal } from './components/TodayRatingFlow'
import { PROFILE_SAVED_EVENT, signInWithGoogle } from './lib/googleLogin'
import MyGatherings from './components/MyGatherings'
import MyNotes from './components/MyNotes'
import PlayedGameRecord from './components/PlayedGameRecord'
import PastPlayDates from './components/PastPlayDates'
import ClubBoard from './components/ClubBoard'
import MySubmissions from './components/MySubmissions'
import MyRatingsPanel from './components/MyRatingsPanel'
import MyRatingsHub from './components/MyRatingsHub'
import UpcomingGatherings from './components/UpcomingGatherings'
import { useBackClose } from './lib/useBackClose'
import DrawerToTop from './components/DrawerToTop'
import FullScreenPage from './components/FullScreenPage'
import ClubIcon from './components/ClubIcons'
import { FavoritePicker, FavoritePodium, useMyFavorites } from './components/FavoriteGames'
import './styles/club-home.css'
import './styles/club-stats.css'

type PersonalApi = ReturnType<typeof usePersonalCollection>
type ListedGame = BoardGame & { removedAt?: string | null }
export type Tab = 'want' | 'played'
export type MyListMode = 'list' | 'loyalty'
type View = 'home' | 'stats' | 'ratings' | 'gatherings' | 'notes' | 'board' | 'submissions' | 'card'
// 「聚會．留言」頁的分頁按鈕：放大，才不容易沒注意到
const BIG_TAB: CSSProperties = { flex: 1, fontSize: 17, padding: '14px 10px' }
type StatsTab = 'overview' | 'want' | 'played' | 'score' | 'chart'
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
// 想玩、已玩的排序也記在這個瀏覽器（分頁不記，每次都從「概況」開始）
const STATS_VIEW_KEY = 'boardgame-stats-view'
function loadStatsView(): { sortWant: SortKey; sortPlayed: SortKey } {
    const fallback = { sortWant: 'added' as SortKey, sortPlayed: 'added' as SortKey }
    try {
        const raw = localStorage.getItem(STATS_VIEW_KEY)
        if (!raw) return fallback
        const data = JSON.parse(raw)
        const sorts = ['added', 'added-rev', 'name', 'name-rev', 'count', 'count-rev', 'recent', 'recent-rev']
        return {
            sortWant: sorts.includes(data.sortWant) ? data.sortWant : 'added',
            sortPlayed: sorts.includes(data.sortPlayed) ? data.sortPlayed : 'added',
        }
    } catch {
        return fallback
    }
}
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

// 俱樂部最上面的大卡：免費券與本月點數（只有 VIP、非管理者）
// 今天有聚會待確認時：整張卡直接開「今日遊戲評分」視窗，不用再進集點卡
function ClubPointsCard({
    onOpen,
    pending = false,
    boardGames,
    ratings,
}: {
    onOpen: () => void
    pending?: boolean
    boardGames: BoardGame[]
    ratings: RatingsApi
}) {
    const loyalty = useMyLoyalty()
    const summary = loyalty.summary
    const held = summary?.availableVouchers ?? 0
    const usable = summary?.usableVouchers ?? 0
    const later = Math.max(held - usable, 0)
    const month = summary?.monthPoints ?? 0
    const loading = loyalty.loading && !summary
    const [flowOpen, setFlowOpen] = useState(false)
    const today = todayLocal()
    const todayGames = useMemo(
        () =>
            Array.from(
                new Set(
                    loyalty.gatherings
                        .filter((item) => item.date === today)
                        .flatMap((item) => item.games),
                ),
            ),
        [loyalty.gatherings, today],
    )
    // 評分流程走完後 pending 會變 false，但視窗要留到使用者自己關掉
    const canFlow = pending && todayGames.length > 0

    return (
        <>
            <button
                type="button"
                className="ch-pts"
                onClick={() => (canFlow ? setFlowOpen(true) : onOpen())}
                aria-label={canFlow ? '開始今日遊戲評分' : '打開集點卡'}
            >
                {loading ? (
                    <span className="ch-pts-loading">集點資料讀取中…</span>
                ) : (
                    <>
                        <span className="ch-pts-col">
                            <span className="ch-pts-label">免費券</span>
                            <span className="ch-pts-num">
                                <ClubIcon name="ticket" size={22} /> {held} 張
                            </span>
                            {later > 0 && (
                                <span className="ch-pts-sub">{later} 張明天起可用</span>
                            )}
                        </span>
                        <span className="ch-pts-col">
                            <span className="ch-pts-label">本月點數</span>
                            <span className="ch-pts-num">{month} / 2</span>
                        </span>
                    </>
                )}
                {canFlow ? (
                    <span className="ch-pts-go" aria-hidden="true">
                        去評分
                        <span className="ch-pts-dot" />
                    </span>
                ) : (
                    <span className="ch-pts-arrow" aria-hidden="true">›</span>
                )}
                {pending && (
                    <span className="ch-pts-warn">
                        今天的聚會待確認：評分流程走完前不會得點，也不會使用免費券
                    </span>
                )}
            </button>
            {flowOpen && (
                <TodayRatingModal
                    games={todayGames}
                    boardGames={boardGames}
                    ratings={ratings}
                    onClose={() => {
                        setFlowOpen(false)
                        loyalty.reload()
                    }}
                    onFinished={() => {
                        // 評分完按「回到集點卡」：真的切到集點卡（聚會後的心得詢問卡會疊在上面）
                        setFlowOpen(false)
                        loyalty.reload()
                        onOpen()
                    }}
                />
            )}
        </>
    )
}

function ClubHeader({
    isAdmin,
    isVip,
    onClose,
    favorites,
    gameByName,
    renderCover,
    onOpenFavorites,
}: {
    isAdmin: boolean
    isVip: boolean
    onClose: () => void
    favorites: string[]
    gameByName: Map<string, BoardGame>
    renderCover: (game: BoardGame) => ReactNode
    onOpenFavorites: () => void
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
                </div>
                {loggedIn && (
                    <FavoritePodium
                        names={favorites}
                        gameByName={gameByName}
                        renderCover={renderCover}
                        onClick={onOpenFavorites}
                    />
                )}
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
    trashedGames = [],
    personal,
    playSessions,
    ratings,
    adminScores,
    isOpen,
    mode,
    focusDate,
    openGatheringId,
    openRatings = null,
    openView = null,
    openCard = false,
    isAdmin,
    isVip,
    todayPending,
    plannedUnseen = 0,
    onPlannedSeen,
    alertCount = 0,
    gameChanges = [],
    onAlertsSeen,
    notesUnseen = 0,
    onNotesSeen,
    onClose,
    onBrowse,
    onOpenGame,
    onOpenWrite,
    writeFromBoard = false,
    onReturnToBoard,
    returnToGame = false,
    onReturnToGame,
    onOpenRules,
    renderCover,
}: {
    boardGames: ListedGame[]
    // 垃圾桶裡的遊戲：只用來查封面與名稱（我的場次、我的心得），不進清單與統計
    trashedGames?: ListedGame[]
    personal: PersonalApi
    playSessions: PlaySessionsApi
    ratings: RatingsApi
    // 管理者的 CSV 換算分數（整體、適合留下來；其餘五項由遊戲本身的 emoji 欄位算）
    adminScores?: Map<string, AdminScores>
    isOpen: boolean
    mode: MyListMode
    focusDate?: string | null
    openGatheringId?: string | null
    // 從遊戲視窗「前往我的評分」進來，直接開在我的評分頁
    openRatings?: string | null
    // 從遊戲視窗「前往留言板／我的心得」進來：直接開在那個子畫面，並帶入遊戲
    openView?: { view: 'board' | 'notes' | 'stats'; bggName: string | null; write?: boolean } | null
    // 從報到、集點卡連結、「去評分」進來：直接開在集點卡
    openCard?: boolean
    isAdmin: boolean
    isVip: boolean
    todayPending: boolean
    plannedUnseen?: number
    onPlannedSeen?: () => void
    // 新加入的聚會、被移除的指定遊戲（還沒看過的數量、最近的移除清單、看過了通知）
    alertCount?: number
    gameChanges?: GameChange[]
    onAlertsSeen?: () => void
    // 集點聚會頁「留言板」分頁上的新留言數（灰褐色小數字，不計入導覽列紅點）
    notesUnseen?: number
    onNotesSeen?: () => void
    onClose: () => void
    onBrowse: () => void
    onOpenGame: (game: BoardGame, tab?: 'ratings' | 'discussion') => void
    onOpenLoyalty: () => void
    // 從集點聚會頁的留言板「發表留言」跳到俱樂部的寫心得／留言（App 傳入）
    onOpenWrite?: (bggName: string | null, from?: 'board' | 'game') => void
    // 從「聚會．留言」留言板進寫心得畫面時，✕ 與返回要回到留言板
    writeFromBoard?: boolean
    onReturnToBoard?: () => void
    // 從遊戲詳細資料跳來的寫心得／我的評分：✕ 與返回要回到那款遊戲
    returnToGame?: boolean
    onReturnToGame?: () => void
    // 從「我的投稿 → AI 回答」跳到規則助手（App 傳入；沒傳就不顯示按鈕）
    onOpenRules?: () => void
    renderCover: (game: BoardGame) => ReactNode
}) {
    const [view, setView] = useState<View>(
        openCard ? 'card' : openGatheringId ? 'gatherings' : openRatings ? 'ratings' : openView ? openView.view : 'home',
    )
    // 從遊戲視窗跳來時，我的評分頁直接展開那一款（只用一次）
    const [ratingsFocus, setRatingsFocus] = useState<string | null>(openRatings)
    // 留言板預填、我的心得只看這款（回到首頁就清掉）
    const [viewFocus, setViewFocus] = useState<string | null>(openView?.bggName ?? null)
    // 一進「我的心得」就打開寫作畫面：帶遊戲（遊戲視窗）或帶場次（我的場次），回首頁就清掉
    const [writeReq, setWriteReq] = useState<{ bggName: string | null; gatheringId: string | null; sessionId?: string | null } | null>(
        openView?.write ? { bggName: openView.bggName, gatheringId: null } : null,
    )
    // 要直接打開的聚會詳情（從遊戲視窗或「我的心得」跳過來）
    const [gatheringTarget, setGatheringTarget] = useState<string | null>(openGatheringId ?? null)
    const [statsTab, setStatsTab] = useState<StatsTab>('overview')
    // 本命桌遊（最多 3 款）：俱樂部頂部頒獎台與「我的統計」概況按鈕都開同一個設定視窗
    const favs = useMyFavorites(personal.isLoggedIn)
    const [favOpen, setFavOpen] = useState(false)
    const favGameByName = useMemo(() => {
        const map = new Map<string, BoardGame>()
        for (const game of boardGames) map.set(game.bggName, game)
        return map
    }, [boardGames])
    const favPicker = favOpen ? (
        <FavoritePicker
            current={favs.names}
            boardGames={boardGames}
            ratings={ratings}
            isAdmin={isAdmin}
            adminScores={adminScores}
            renderCover={renderCover}
            onSave={favs.save}
            onClose={() => setFavOpen(false)}
        />
    ) : null
    // 「聚會．留言」頁（VIP）的兩個分頁：未來聚會｜留言板（集點卡已搬到俱樂部）
    function defaultLoyaltyTab(): 'upcoming' | 'board' {
        if (mode === 'loyalty' && openView?.view === 'board' && isVip && !isAdmin) return 'board'
        return 'upcoming'
    }
    const [loyaltyTab, setLoyaltyTab] = useState<'upcoming' | 'board'>(defaultLoyaltyTab)
    const [search, setSearch] = useState('')
    // 想玩、已玩各自記住排序（也記在這個瀏覽器）；切換分頁只清空搜尋
    const [sortWant, setSortWant] = useState<SortKey>(() => loadStatsView().sortWant)
    const [sortPlayed, setSortPlayed] = useState<SortKey>(() => loadStatsView().sortPlayed)
    const statsBodyRef = useRef<HTMLDivElement>(null)
    const [topN, setTopN] = useState<TopN>(loadTopN)
    const [showHoursNote, setShowHoursNote] = useState(false)
    // 分布圖用全螢幕頁面開啟
    const [chartOpen, setChartOpen] = useState(false)
    // 分頁切換不另建瀏覽歷史：返回鍵與 ✕ 一律回「我的俱樂部」首頁
    // 從留言板進來的寫心得畫面，返回要回到留言板；其他一律回俱樂部首頁
    // 只在「這次是從遊戲詳細資料跳進來」時才回遊戲（一開始就記下來，之後在俱樂部裡自己走動不受影響）
    const cameFromGame = useRef(returnToGame && !!(openView?.write || openRatings))
    // 從「已玩 → 補日期」補完選「好」進寫作畫面：✕／返回要回到「我的統計→已玩」並重新打開那款的補日期視窗
    const [recordReturn, setRecordReturn] = useState<string | null>(null)
    // 從「我的聚會」點遊戲進寫作畫面：✕／返回要回到「我的聚會」清單
    const [fromGatherings, setFromGatherings] = useState(false)
    const [reopenRecord, setReopenRecord] = useState<string | null>(null)
    // 回到統計時讓返回鍵的歷史紀錄重新登記一次（先關再開），避免之後多退一層
    const [backPaused, setBackPaused] = useState(false)
    function leaveView() {
        if (view === 'notes' && recordReturn) {
            setStatsTab('played')
            setSearch('')
            setBackPaused(true)
            setView('stats')
        } else if (view === 'notes' && fromGatherings) {
            setFromGatherings(false)
            setGatheringTarget(null)
            setBackPaused(true)
            setView('gatherings')
        } else if (view === 'notes' && writeFromBoard && onReturnToBoard) {
            onReturnToBoard()
        } else if ((view === 'notes' || view === 'ratings') && cameFromGame.current && onReturnToGame) {
            cameFromGame.current = false
            onReturnToGame()
        } else if (view === 'stats' && openView?.view === 'stats') {
            // 從主畫面「我的統計」直接進來：回主畫面，不經過俱樂部首頁
            onClose()
        } else {
            setView('home')
        }
    }
    useBackClose(
        leaveView,
        isOpen && mode !== 'loyalty' && view !== 'home' && !backPaused,
    )

    // 返回鍵登記好之後，才打開補日期視窗（先後順序不能反，否則返回鍵會先關掉整個統計）
    useEffect(() => {
        if (backPaused) {
            setBackPaused(false)
            return
        }
        if (recordReturn && view === 'stats') {
            setReopenRecord(recordReturn)
            setRecordReturn(null)
        }
    }, [backPaused, recordReturn, view])

    // 離開統計就清掉「要重開的補日期視窗」
    useEffect(() => {
        if (view !== 'stats' && !(view === 'notes' && recordReturn)) setReopenRecord(null)
    }, [view, recordReturn])

    // 回到首頁就清掉「前往留言板／我的心得」帶來的遊戲
    useEffect(() => {
        if (view === 'home') {
            setViewFocus(null)
            setWriteReq(null)
            setRecordReturn(null)
        }
    }, [view])

    // 每次打開都回到首頁；統計預設「概況」、搜尋清空，排序沿用上次的選擇
    useEffect(() => {
        if (isOpen) {
            // 從遊戲視窗「前往我的評分」進來時，開在我的評分頁；其他情況回首頁
            setView(openCard ? 'card' : openRatings ? 'ratings' : openView ? openView.view : 'home')
            setStatsTab('overview')
            setLoyaltyTab(defaultLoyaltyTab())
            setSearch('')
            setShowHoursNote(false)
            setChartOpen(false)
        }
    }, [isOpen, mode])

    // 看到「未來聚會」分頁就把目前的預計聚會記成已看過
    const showUpcomingTab = isVip && !isAdmin
    useEffect(() => {
        if (isOpen && mode === 'loyalty' && showUpcomingTab && loyaltyTab === 'upcoming') {
            onPlannedSeen?.()
        }
    }, [isOpen, mode, showUpcomingTab, loyaltyTab, onPlannedSeen])

    // 看到留言板分頁就把新留言記成已看過；離開留言板分頁就清掉「前往留言板」帶來的遊戲名稱
    useEffect(() => {
        if (isOpen && mode === 'loyalty' && showUpcomingTab && loyaltyTab === 'board') {
            onNotesSeen?.()
        }
    }, [isOpen, mode, showUpcomingTab, loyaltyTab, onNotesSeen])
    useEffect(() => {
        if (mode === 'loyalty' && loyaltyTab !== 'board') setViewFocus(null)
    }, [mode, loyaltyTab])

    // 打開集點卡就把新加入的聚會、被移除的指定遊戲通知記成已看過
    useEffect(() => {
        if (isOpen && mode !== 'loyalty' && view === 'card' && showUpcomingTab && alertCount > 0) {
            onAlertsSeen?.()
        }
    }, [isOpen, mode, view, showUpcomingTab, alertCount, onAlertsSeen])

    // 只記住排序
    useEffect(() => {
        try {
            localStorage.setItem(STATS_VIEW_KEY, JSON.stringify({ sortWant, sortPlayed }))
        } catch {
            // 存不了就算了
        }
    }, [sortWant, sortPlayed])

    function changeTopN(next: TopN) {
        setTopN(next)
        try {
            localStorage.setItem(TOP_KEY, String(next))
        } catch {
            // 存不了就算了
        }
    }

    // 寫心得／留言：在俱樂部裡直接切到「我的心得」並打開寫作畫面
    function openWrite(bggName: string | null, gatheringId: string | null = null, sessionId: string | null = null) {
        setViewFocus(bggName)
        setWriteReq({ bggName, gatheringId, sessionId })
        setRecordReturn(null)
        setFromGatherings(false)
        setView('notes')
    }

    function openStats() {
        setStatsTab('overview')
        setSearch('')
        setView('stats')
    }

    function switchStatsTab(next: StatsTab) {
        setStatsTab(next)
        setSearch('')
        statsBodyRef.current?.scrollTo({ top: 0 })
    }

    // 目前清單是哪一份（概況分頁不用清單）
    const tab: Tab = statsTab === 'want' ? 'want' : 'played'
    const sortKey = tab === 'want' ? sortWant : sortPlayed
    function setSortKey(next: SortKey) {
        if (tab === 'want') setSortWant(next)
        else setSortPlayed(next)
    }

    const lookupGames = useMemo(
        () => [...boardGames, ...trashedGames],
        [boardGames, trashedGames],
    )

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
    // 只統計「已玩」的遊戲（按過「移除」的遊戲，次數還在但不計入）
    const stats = useMemo(() => {
        const rows: { game: BoardGame; total: number }[] = []
        let totalPlays = 0
        let totalMinutes = 0
        for (const game of boardGames) {
            const entry = personal.entries[game.bggName]
            if (!entry?.played) continue
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

    // 已玩次數按「−」：總次數會變 0 時，走共用的取消已玩流程（見 unplayFlow.ts）
    async function decrementPlayed(bggName: string) {
        const entry = personal.entries[bggName]
        const count = entry?.playCount ?? 0
        if (count <= 0) return
        const sessionCount = playSessions.getSummary(bggName).count
        if (count - 1 + sessionCount > 0) {
            personal.updateEntry(bggName, { playCount: count - 1 }, { skipPlayedRule: true })
            return
        }
        await runUnplayFlow(bggName, personal)
    }

    if (!isOpen) return null

    const isLoyalty = mode === 'loyalty'
    const isLoading = personal.isLoggedIn && personal.status === 'loading'
    const sourceCount = tab === 'want' ? wantGames.length : playedGames.length

    // ---------- 聚會．留言（未來聚會、留言板） ----------
    if (isLoyalty) {
        return (
            <>
                <div className="mylist-backdrop" onClick={onClose} />
                <aside className="mylist-drawer" role="dialog" aria-label="聚會．留言">
                    <div className="mylist-header">
                        <h2>聚會．留言</h2>
                        <button
                            className="mylist-close"
                            type="button"
                            aria-label="關閉"
                            onClick={onClose}
                        >
                            ×
                        </button>
                    </div>
                    {showUpcomingTab && (
                        <div className="lb-tabs">
                            <button
                                type="button"
                                className={`lb-tab ${loyaltyTab === 'upcoming' ? 'active' : ''}`}
                                style={BIG_TAB}
                                onClick={() => setLoyaltyTab('upcoming')}
                            >
                                未來聚會
                                {plannedUnseen > 0 && (
                                    <span
                                        style={{
                                            marginLeft: 6,
                                            background: '#b5483a',
                                            color: '#fff',
                                            borderRadius: 999,
                                            padding: '1px 7px',
                                            fontSize: 12,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {plannedUnseen}
                                    </span>
                                )}
                            </button>
                            <button
                                type="button"
                                className={`lb-tab ${loyaltyTab === 'board' ? 'active' : ''}`}
                                style={BIG_TAB}
                                onClick={() => setLoyaltyTab('board')}
                            >
                                留言板
                                {notesUnseen > 0 && loyaltyTab !== 'board' && (
                                    <span
                                        style={{
                                            marginLeft: 6,
                                            background: '#a89478',
                                            color: '#fff',
                                            borderRadius: 999,
                                            padding: '1px 7px',
                                            fontSize: 12,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {notesUnseen}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                    <div className="mylist-body">
                        {showUpcomingTab && loyaltyTab === 'board' ? (
                            <ClubBoard
                                embedded
                                boardGames={boardGames}
                                isAdmin={isAdmin}
                                isVip={isVip}
                                onBack={() => setLoyaltyTab('upcoming')}
                                onClose={onClose}
                                onOpenGame={onOpenGame}
                                onWrite={() => onOpenWrite?.(null, 'board')}
                                initialSearch={
                                    viewFocus ? (lookupGames.find((g) => g.bggName === viewFocus)?.name ?? '') : ''
                                }
                            />
                        ) : showUpcomingTab && loyaltyTab === 'upcoming' ? (
                            <UpcomingGatherings
                                embedded
                                boardGames={boardGames}
                                isVip={isVip}
                                isAdmin={isAdmin}
                                renderCover={renderCover}
                                onOpenGame={onOpenGame}
                            />
                        ) : (
                            <p className="club-note" style={{ margin: 16 }}>
                                「未來聚會」和「留言板」是 VIP 專屬。向管理者索取通關密碼，或參加聚會報到就能成為 VIP。
                            </p>
                        )}
                    </div>
                </aside>
            </>
        )
    }

    // ---------- 集點卡（俱樂部裡的子畫面） ----------
    if (view === 'card') {
        return (
            <>
                <div className="mylist-backdrop" onClick={onClose} />
                <aside className="mylist-drawer" role="dialog" aria-label="集點卡">
                    <div className="mylist-header">
                        <h2>集點卡</h2>
                        <button
                            className="mylist-close"
                            type="button"
                            aria-label="回俱樂部"
                            onClick={() => setView('home')}
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
                            gameChanges={gameChanges}
                            onOpenGame={onOpenGame}
                        />
                    </div>
                </aside>
            </>
        )
    }

    // ---------- 留言板 ----------
    if (view === 'board') {
        return (
            <ClubBoard
                boardGames={boardGames}
                isAdmin={isAdmin}
                isVip={isVip}
                onBack={() => setView('home')}
                onClose={onClose}
                onOpenGame={onOpenGame}
                onWrite={() => openWrite(null)}
                initialSearch={
                    viewFocus ? (lookupGames.find((g) => g.bggName === viewFocus)?.name ?? '') : ''
                }
            />
        )
    }

    // ---------- 我的心得 ----------
    if (view === 'notes') {
        return (
            <MyNotes
                boardGames={lookupGames}
                renderCover={renderCover}
                onBack={leaveView}
                onClose={onClose}
                focusGame={viewFocus}
                writeRequest={writeReq}
                composer={{ personal, ratings, isAdmin, canPublic: isVip || isAdmin, playSessions }}
            />
        )
    }

    // ---------- 我的聚會 ----------
    if (view === 'gatherings') {
        return (
            <MyGatherings
                boardGames={lookupGames}
                personal={personal}
                playSessions={playSessions}
                ratings={ratings}
                isAdmin={isAdmin}
                initialGatheringId={gatheringTarget}
                onWriteGathering={(id, bggName) => {
                    openWrite(bggName ?? null, id)
                    setFromGatherings(true)
                }}
                onBack={() => setView('home')}
                onClose={onClose}
                onOpenGame={onOpenGame}
                renderCover={renderCover}
            />
        )
    }

    // ---------- 我的投稿 ----------
    if (view === 'submissions') {
        return (
            <MySubmissions
                boardGames={boardGames}
                onBack={() => setView('home')}
                onClose={onClose}
                onOpenRules={onOpenRules}
            />
        )
    }

    // ---------- 我的評分 ----------
    if (view === 'ratings') {
        return (
            <MyRatingsHub
                boardGames={boardGames}
                ratings={ratings}
                isPlayed={(bggName) => !!personal.entries[bggName]?.played}
                onBack={leaveView}
                onClose={onClose}
                onOpenGame={onOpenGame}
                renderCover={renderCover}
                focusName={ratingsFocus}
            />
        )
    }

    // ---------- 我的統計（概況｜想玩｜已玩） ----------
    if (view === 'stats') {
        return (
            <>
                <div className="mylist-backdrop" onClick={onClose} />
                <aside className="mylist-drawer club-stats" role="dialog" aria-label="我的統計">
                    {favPicker}
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

                    <div className="cs-tabs">
                        <div className="cs-tabset">
                            <button
                                type="button"
                                className={`cs-tab ${statsTab === 'overview' ? 'active' : ''}`}
                                onClick={() => switchStatsTab('overview')}
                            >
                                概況
                            </button>
                            <button
                                type="button"
                                className={`cs-tab ${statsTab === 'want' ? 'active' : ''}`}
                                onClick={() => switchStatsTab('want')}
                            >
                                想玩 {wantGames.length}
                            </button>
                            <button
                                type="button"
                                className={`cs-tab ${statsTab === 'played' ? 'active' : ''}`}
                                onClick={() => switchStatsTab('played')}
                            >
                                已玩 {playedGames.length}
                            </button>
                            <button
                                type="button"
                                className={`cs-tab ${statsTab === 'score' ? 'active' : ''}`}
                                onClick={() => switchStatsTab('score')}
                            >
                                評分
                            </button>
                        </div>
                        <button
                            type="button"
                            className={`cs-chart-btn ${chartOpen ? 'active' : ''}`}
                            aria-label="開啟分布圖"
                            title="分布圖"
                            onClick={() => setChartOpen(true)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                                <circle cx="8" cy="15" r="1.2" />
                                <circle cx="12" cy="9" r="1.2" />
                                <circle cx="16" cy="13" r="1.2" />
                                <circle cx="19" cy="6" r="1.2" />
                            </svg>
                        </button>
                    </div>

                    <div className="mylist-body" ref={statsBodyRef}>
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
                                                <div
                                                    className="mylist-thumb"
                                                    role="button"
                                                    tabIndex={0}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => onOpenGame(game)}
                                                    onKeyDown={(event) => {
                                                        if (event.key === 'Enter') onOpenGame(game)
                                                    }}
                                                >
                                                    {renderCover(game)}
                                                </div>
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

                                {personal.isLoggedIn && (
                                    <button type="button" className="fv-open-btn" onClick={() => setFavOpen(true)}>
                                        前往我的本命桌遊 ›
                                    </button>
                                )}
                            </>
                        ) : statsTab === 'score' ? (
                            <MyRatingsPanel
                                mode="score"
                                boardGames={boardGames}
                                ratings={ratings}
                                isAdmin={isAdmin}
                                adminScores={adminScores}
                                onOpenGame={(game) => onOpenGame(game)}
                                renderCover={renderCover}
                            />
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
                                        <div className="cls-searchbox cls-sticky">
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
                                            <ul className="cs-list">
                                                {shown.map((game) => {
                                                    const entry = personal.entries[game.bggName]
                                                    const summary = playSessions.getSummary(game.bggName)
                                                    const total = (entry?.playCount ?? 0) + summary.count
                                                    const lastOn = summary.lastPlayedOn
                                                        ? summary.lastPlayedOn.replaceAll('-', '/')
                                                        : null
                                                    return (
                                                        <li className="cs-row" key={game.bggName}>
                                                            <div className="cs-top">
                                                                <div
                                                                    className="mylist-thumb cs-thumb"
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => onOpenGame(game)}
                                                                    onKeyDown={(event) => {
                                                                        if (event.key === 'Enter') onOpenGame(game)
                                                                    }}
                                                                >
                                                                    {renderCover(game)}
                                                                </div>
                                                                <div className="cs-title">
                                                                    <button
                                                                        type="button"
                                                                        className="cs-name"
                                                                        onClick={() => onOpenGame(game)}
                                                                    >
                                                                        {game.name}
                                                                    </button>
                                                                    {tab === 'played'
                                                                        ? lastOn && <small className="cs-sub">最近：{lastOn}</small>
                                                                        : total > 0 && (
                                                                              <small className="cs-sub">
                                                                                  玩過 {total} 次{lastOn && ` · 最近：${lastOn}`}
                                                                              </small>
                                                                          )}
                                                                </div>
                                                                {tab === 'want' && (
                                                                    <button
                                                                        type="button"
                                                                        className="cs-remove"
                                                                        disabled={!personal.canEdit}
                                                                        onClick={() =>
                                                                            personal.updateEntry(game.bggName, {
                                                                                wantToPlay: false,
                                                                            })
                                                                        }
                                                                    >
                                                                        移除
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="cs-ctrl">
                                                                {tab === 'played' && (
                                                                    <div className="cs-counter">
                                                                        <button
                                                                            type="button"
                                                                            className="cs-step"
                                                                            aria-label="減少遊玩次數"
                                                                            title={
                                                                                (entry?.playCount ?? 0) <= 0 && summary.count > 0
                                                                                    ? '有日期的紀錄請點「補日期」按鈕，在「所有已玩日期」裡刪除'
                                                                                    : undefined
                                                                            }
                                                                            disabled={!personal.canEdit || (entry?.playCount ?? 0) <= 0}
                                                                            onClick={() => void decrementPlayed(game.bggName)}
                                                                        >
                                                                            −
                                                                        </button>
                                                                        <span className="cs-count">{total} 次</span>
                                                                        <button
                                                                            type="button"
                                                                            className="cs-step"
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
                                                                    </div>
                                                                )}
                                                                {tab === 'played' && (
                                                                    <PlayedGameRecord
                                                                        bggName={game.bggName}
                                                                        gameName={game.name}
                                                                        personal={personal}
                                                                        playSessions={playSessions}
                                                                        autoOpen={reopenRecord === game.bggName}
                                                                        onWriteNote={(info) => {
                                                                            openWrite(info.bggName, null, info.sessionId)
                                                                            setRecordReturn(info.bggName)
                                                                        }}
                                                                    />
                                                                )}
                                                                <PastPlayDates bggName={game.bggName} playSessions={playSessions} personal={personal} />
                                                            </div>
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
                    <DrawerToTop targetRef={statsBodyRef} />
                </aside>
                <FullScreenPage
                    open={chartOpen}
                    title="分布圖"
                    onClose={() => setChartOpen(false)}
                >
                    <MyRatingsPanel
                        mode="chart"
                        boardGames={boardGames}
                        ratings={ratings}
                        isAdmin={isAdmin}
                        adminScores={adminScores}
                        onOpenGame={(game) => onOpenGame(game)}
                        renderCover={renderCover}
                    />
                </FullScreenPage>
            </>
        )
    }

    // ---------- 我的桌遊（首頁） ----------
    // 顯示條件與原本完全相同：我的評分＝已登入且非管理者
    const showRatingsEntry = personal.isLoggedIn && !isAdmin
    return (
        <>
            <div className="mylist-backdrop" onClick={onClose} />
            <aside className="mylist-drawer club-home" role="dialog" aria-label="我的俱樂部">
                {favPicker}
                <div className="mylist-body club-body">
                    <ClubHeader
                        isAdmin={isAdmin}
                        isVip={isVip}
                        onClose={onClose}
                        favorites={favs.names}
                        gameByName={favGameByName}
                        renderCover={renderCover}
                        onOpenFavorites={() => setFavOpen(true)}
                    />
                    {personal.isLoggedIn && isVip && !isAdmin && (
                        <ClubPointsCard
                            onOpen={() => setView('card')}
                            pending={todayPending}
                            boardGames={boardGames}
                            ratings={ratings}
                        />
                    )}
                    <div className={`ch-records${showRatingsEntry ? '' : ' is-single'}`}>
                        <button
                            type="button"
                            className="ch-card ch-record"
                            onClick={openStats}
                        >
                            <span className="ch-icon" aria-hidden="true">
                                <ClubIcon name="stats" />
                            </span>
                            <span className="ch-text">
                                <b>我的統計</b>
                                <span className="ch-sub">想玩、已玩與遊玩次數</span>
                            </span>
                            <span className="ch-count">
                                想玩 {wantGames.length}・已玩 {playedGames.length}
                            </span>
                        </button>
                        {showRatingsEntry && (
                            <button
                                type="button"
                                className="ch-card ch-record"
                                onClick={() => {
                                    setRatingsFocus(null)
                                    setView('ratings')
                                }}
                            >
                                <span className="ch-icon" aria-hidden="true">
                                    <ClubIcon name="star" />
                                </span>
                                <span className="ch-text">
                                    <b>我的評分</b>
                                    <span className="ch-sub">把玩過的遊戲逐款評完</span>
                                </span>
                                {ratings.status === 'ready' && (
                                    <span className="ch-count">
                                        已評分 {playedGames.filter((game) => ratings.getMine(game.bggName)).length}・已玩 {playedGames.length}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                    {personal.isLoggedIn && (
                        <div className="ch-menu">
                            {isAdmin && (
                                <button
                                    type="button"
                                    className="ch-card ch-entry"
                                    onClick={() => setView('board')}
                                >
                                    <span className="ch-icon" aria-hidden="true">
                                        <ClubIcon name="message" />
                                    </span>
                                    <span className="ch-text">
                                        <b>留言板</b>
                                        <span className="ch-sub">大家的留言、發表留言</span>
                                    </span>
                                    <span className="ch-arrow" aria-hidden="true">›</span>
                                </button>
                            )}
                            <button
                                type="button"
                                className="ch-card ch-entry"
                                onClick={() => setView('notes')}
                            >
                                <span className="ch-icon" aria-hidden="true">
                                    <ClubIcon name="notes" />
                                </span>
                                <span className="ch-text">
                                    <b>我的心得</b>
                                    <span className="ch-sub">寫心得／留言、我寫過的紀錄</span>
                                </span>
                                <span className="ch-arrow" aria-hidden="true">›</span>
                            </button>
                            <button
                                type="button"
                                className="ch-card ch-entry"
                                onClick={() => {
                                    setGatheringTarget(null)
                                    setView('gatherings')
                                }}
                            >
                                <span className="ch-icon" aria-hidden="true">
                                    <ClubIcon name="calendar" />
                                </span>
                                <span className="ch-text">
                                    <b>我的聚會</b>
                                    <span className="ch-sub">參加過的聚會與心得</span>
                                </span>
                                <span className="ch-arrow" aria-hidden="true">›</span>
                            </button>
                            {isVip && !isAdmin && (
                                <button
                                    type="button"
                                    className="ch-card ch-entry"
                                    onClick={() => setView('submissions')}
                                >
                                    <span className="ch-icon" aria-hidden="true">
                                        <ClubIcon name="submit" />
                                    </span>
                                    <span className="ch-text">
                                        <b>我的投稿</b>
                                        <span className="ch-sub">玩錯紀錄、規則連結、詞庫</span>
                                    </span>
                                    <span className="ch-arrow" aria-hidden="true">›</span>
                                </button>
                            )}
                            {!isAdmin && !isVip && (
                                <button
                                    type="button"
                                    className="ch-card ch-entry"
                                    onClick={() => setView('card')}
                                >
                                    <span className="ch-icon" aria-hidden="true">
                                        <ClubIcon name="ticket" />
                                    </span>
                                    <span className="ch-text">
                                        <b>集點卡</b>
                                        <span className="ch-sub">點數、免費券、近期紀錄</span>
                                    </span>
                                    <span className="ch-arrow" aria-hidden="true">›</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        </>
    )
}
