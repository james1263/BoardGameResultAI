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
type View = 'home' | Tab

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

// 本月點數（只有 VIP、且不是管理者才會顯示這個元件，所以只有他們會讀取集點資料）
function ClubPoints() {
  const loyalty = useMyLoyalty()
  const summary = loyalty.summary

  return (
    <div className="club-points">
      <span className="club-points-label">本月點數</span>
      <strong className="club-points-value">
        {loyalty.loading ? '…' : `${summary?.monthPoints ?? 0} 點`}
      </strong>
      <span className="club-points-hint">
        同月累積 2 點，可換 1 張免費券
        {summary && summary.availableVouchers > 0
          ? `・你有 ${summary.availableVouchers} 張可用的免費券`
          : ''}
      </span>
    </div>
  )
}

function ClubHeader({
  wantCount,
  playedCount,
  isAdmin,
  isVip,
  onClose,
  onShow,
}: {
  wantCount: number
  playedCount: number
  isAdmin: boolean
  isVip: boolean
  onClose: () => void
  onShow: (tab: Tab) => void
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

      <div className="club-stats">
        <button type="button" className="club-stat" onClick={() => onShow('want')}>
          <span>想玩</span>
          <strong>{wantCount} 款</strong>
        </button>
        <button
          type="button"
          className="club-stat"
          onClick={() => onShow('played')}
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
  onClose,
  onBrowse,
  onOpenGame,
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
  onClose: () => void
  onBrowse: () => void
  onOpenGame: (game: BoardGame, tab?: 'ratings') => void
  renderCover: (game: BoardGame) => ReactNode
}) {
  const [view, setView] = useState<View>('home')

  // 每次打開都回到首頁
  useEffect(() => {
    if (isOpen) setView('home')
  }, [isOpen, mode])

  const wantGames = useMemo(
    () => boardGames.filter((game) => personal.entries[game.bggName]?.wantToPlay),
    [boardGames, personal.entries],
  )
  const playedGames = useMemo(
    () => boardGames.filter((game) => personal.entries[game.bggName]?.played),
    [boardGames, personal.entries],
  )

  if (!isOpen) return null

  const isLoyalty = mode === 'loyalty'
  const isLoading = personal.isLoggedIn && personal.status === 'loading'
  const tab: Tab = view === 'played' ? 'played' : 'want'
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

  // ---------- 我的桌遊 ----------
  return (
    <>
      <div className="mylist-backdrop" onClick={onClose} />
      <aside className="mylist-drawer" role="dialog" aria-label="我的桌遊">
        {view === 'home' ? (
          <div className="mylist-body club-body">
            <ClubHeader
              wantCount={wantGames.length}
              playedCount={playedGames.length}
              isAdmin={isAdmin}
              isVip={isVip}
              onClose={onClose}
              onShow={setView}
            />

            <h3 className="club-section-title">我的桌遊</h3>
            <div className="club-menu">
              <button
                type="button"
                className="club-menu-item"
                onClick={() => setView('want')}
              >
                <span className="club-menu-icon" aria-hidden="true">♥</span>
                <span className="club-menu-text">
                  <b>想玩清單</b>
                  <small>收藏想玩的遊戲，安排下一場聚會</small>
                </span>
                <span className="club-menu-arrow" aria-hidden="true">›</span>
              </button>
              <button
                type="button"
                className="club-menu-item"
                onClick={() => setView('played')}
              >
                <span className="club-menu-icon" aria-hidden="true">✓</span>
                <span className="club-menu-text">
                  <b>已玩清單</b>
                  <small>回顧玩過的遊戲與個人紀錄</small>
                </span>
                <span className="club-menu-arrow" aria-hidden="true">›</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mylist-header">
              <button
                className="mylist-back"
                type="button"
                onClick={() => setView('home')}
              >
                ‹ 返回
              </button>
              <h2>{tab === 'want' ? '想玩清單' : '已玩清單'}</h2>
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
          </>
        )}
      </aside>
    </>
  )
}
