import PlayerPanel from '../PlayerPanel'
import LoyaltyAdmin from '../LoyaltyAdmin'
import { supabase } from '../lib/supabase'
import { useIsAdmin } from '../lib/useIsAdmin'

export default function TopBar({
  myListCount,
  onOpenMyList,
  onOpenLeaderboard,
}: {
  myListCount: number
  onOpenMyList: () => void
  onOpenLeaderboard: () => void
}) {
  const isAdmin = useIsAdmin()

  return (
    <header className="topbar">
      <a className="brand" href="#" aria-label="桌遊規則助手首頁">
        <span className="brand-icon" aria-hidden="true">
          🎲
        </span>
        <span>桌遊規則助手</span>
      </a>
      <span className="topbar-label">BOARD GAME COMPANION</span>
      <div className="topbar-actions">
        <PlayerPanel />
        {isAdmin && <LoyaltyAdmin />}
        <button
          type="button"
          className="mylist-button"
          onClick={onOpenLeaderboard}
        >
          排行榜
        </button>
        <button
          type="button"
          className="mylist-button"
          onClick={onOpenMyList}
        >
          我的桌遊
          {myListCount > 0 && (
            <span className="mylist-count">{myListCount}</span>
          )}
        </button>
        {isAdmin && (
          <button
            type="button"
            className="mylist-button"
            onClick={() => void supabase.auth.signOut()}
          >
            登出
          </button>
        )}
      </div>
    </header>
  )
}
