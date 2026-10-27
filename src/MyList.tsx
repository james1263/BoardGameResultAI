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

type PersonalApi = ReturnType<typeof usePersonalCollection>
export type Tab = 'want' | 'played'
export type MyListMode = 'list' | 'loyalty'
type View = 'home' | 'stats'

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

// 本月點數與免費券（只有 VIP、且不是管理者才會顯示這個元件，所以只有他們會讀取集點資料）
function ClubPoints() {
    const loyalty = useMyLoyalty()
    const summary = loyalty.summary
    const usable = summary?.usableVouchers ?? 0
    const later = Math.max((summary?.availableVouchers ?? 0) - usable, 0)

    return (
        <>
            <div className="club-points">
                <span className="club-points-label">本月點數</span>
                <strong className="club-points-value">
                    {loyalty.loading ? '…' : `${summary?.monthPoints ?? 0} 點`}
                </strong>
                <span className="club-points-hint">
                    同月滿 2 點會自動變成 1 張免費券（點數歸零），隔天起來聚會評分時自動使用
                </span>
            </div>

            {(usable > 0 || later > 0) && (
                <div className="club-voucher">
                    <span className="club-voucher-icon" aria-hidden="true">🎟</span>
                    <div>
                        {usable > 0 && (
                            <p>
                                你有 <b>{usable}</b> 張免費券可以用，下次聚會評分完成後會自動使用
                            </p>
                        )}
                        {later > 0 && <p className="club-voucher-sub">另有 {later} 張明天起才能用</p>}
                    </div>
                </div>
            )}
        </>
    )
}

function ClubHeader({
    wantCount,
    playedCount,
    activeTab,
    isAdmin,
    isVip,
    onClose,
    onSelectTab,
}: {
    wantCount: number
    playedCount: number
    activeTab: Tab
    isAdmin: boolean
    isVip: boolean
    onClose: () => void
    onSelectTab: (tab: Tab) => void
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
                    <p className="club-kicker">MY CLUB</p>
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
            </div>

            <div className="club-stats" role="tablist" aria-label="想玩與已玩">
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'want'}
                    className={`club-stat ${activeTab === 'want' ? 'active' : ''}`}
                    onClick={() => onSelectTab('want')}
                >
                    <span>想玩</span>
                    <strong>{wantCount} 款</strong>
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'played'}
                    className={`club-stat ${activeTab === 'played' ? 'active' : ''}`}
                    onClick={() => onSelectTab('played')}
                >
                    <span>已玩</span>
                    <strong>{playedCount} 款</strong>
                </button>
            </div>

            {showPoints && <ClubPoints />}

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
    boardGames: BoardGame[]
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
    const [tab, setTab] = useState<Tab>('want')

    // 每次打開都回到首頁、想玩分頁
    useEffect(() => {
        if (isOpen) {
            setView('home')
            setTab('want')
        }
    }, [isOpen, mode])

    const wantGames = useMemo(
        () => boardGames.filter((game) => personal.entries[game.bggName]?.wantToPlay),
        [boardGames, personal.entries],
    )
    const playedGames = useMemo(
        () => boardGames.filter((game) => personal.entries[game.bggName]?.played),
        [boardGames, personal.entries],
    )

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
            top: rows.slice(0, 3),
        }
    }, [boardGames, personal.entries, playSessions])

    if (!isOpen) return null

    const isLoyalty = mode === 'loyalty'
    const isLoading = personal.isLoggedIn && personal.status === 'loading'
    const shown = tab === 'want' ? wantGames : playedGames

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

    // ---------- 我的統計 ----------
    if (view === 'stats') {
        return (
            <>
                <div className="mylist-backdrop" onClick={onClose} />
                <aside className="mylist-drawer" role="dialog" aria-label="我的統計">
                    <div className="mylist-header">
                        <button
                            className="mylist-back"
                            type="button"
                            onClick={() => setView('home')}
                        >
                            ‹ 返回
                        </button>
                        <h2>我的統計</h2>
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
                        {!personal.isLoggedIn && (
                            <p className="mylist-hint">
                                目前存在這個瀏覽器；用 Google 登入後可跨裝置保存。
                            </p>
                        )}

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
                            <div className="mystat-box">
                                <span>總時數（約）</span>
                                <strong>{stats.totalPlays > 0 ? stats.hours : 0}</strong>
                                <small>小時</small>
                            </div>
                        </div>

                        <h3 className="mystat-title">最常玩 TOP 3</h3>
                        {stats.top.length === 0 ? (
                            <p className="mylist-empty">
                                還沒有遊玩次數。在遊戲的「我的桌遊」分頁記錄次數，這裡就會統計。
                            </p>
                        ) : (
                            <ol className="mystat-top">
                                {stats.top.map(({ game, total }, index) => (
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

                        <p className="mystat-foot">
                            總時數是用「次數 × BGG 標示的遊戲時間」估算，沒有時間資料的遊戲不計入，僅供參考。
                        </p>
                    </div>
                </aside>
            </>
        )
    }

    // ---------- 我的桌遊 ----------
    return (
        <>
            <div className="mylist-backdrop" onClick={onClose} />
            <aside className="mylist-drawer" role="dialog" aria-label="我的桌遊">
                <div className="mylist-body club-body">
                    <ClubHeader
                        wantCount={wantGames.length}
                        playedCount={playedGames.length}
                        activeTab={tab}
                        isAdmin={isAdmin}
                        isVip={isVip}
                        onClose={onClose}
                        onSelectTab={setTab}
                    />
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
                            onClick={() => setView('stats')}
                        >
                            <span className="club-menu-icon" aria-hidden="true">▤</span>
                            <span className="club-menu-text">
                                <b>我的統計</b>
                                <small>玩過幾款、總次數、最常玩的遊戲</small>
                            </span>
                            <span className="club-menu-arrow" aria-hidden="true">›</span>
                        </button>
                    </div>
                    <div className="club-list">
                        <h3 className="club-section-title">
                            {tab === 'want' ? '想玩清單' : '已玩清單'}
                        </h3>

                        {!personal.isLoggedIn && (
                            <p className="mylist-hint">
                                目前存在這個瀏覽器；用 Google 登入後可跨裝置保存。
                            </p>
                        )}

                        {isLoading ? (
                            <p className="mylist-empty">讀取中…</p>
                        ) : shown.length === 0 ? (
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
                                                {total > 0 && (
                                                    <p className="mylist-meta">
                                                        玩過 {total} 次
                                                        {summary.lastPlayedOn &&
                                                            ` · 最近：${summary.lastPlayedOn.replaceAll('-', '/')}`}
                                                    </p>
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
                    </div>
                </div>
            </aside>
        </>
    )
}