import PlayerPanel from '../PlayerPanel'
import LoyaltyAdmin from '../LoyaltyAdmin'
import { supabase } from '../lib/supabase'
import { useIsAdmin } from '../lib/useIsAdmin'

export default function TopBar({
  myListCount,
  onOpenMyList,
  onOpenLeaderboard,
  onOpenLoyalty,
}: {
  myListCount: number
  onOpenMyList: () => void
  onOpenLeaderboard: () => void
  onOpenLoyalty: () => void
}) {
  const isAdmin = useIsAdmin()

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="sitebar">
      <div className="sb-inner">
        <a
          className="sb-brand"
          href="#"
          aria-label="桌遊規則助手首頁"
          onClick={(event) => {
            event.preventDefault()
            scrollToTop()
          }}
        >
          <span className="sb-logo" aria-hidden="true">
            🎲
          </span>
          <span className="sb-brand-text">
            <strong>桌遊規則助手</strong>
            <small>BOARD GAME COMPANION</small>
          </span>
        </a>

        <nav className="sb-nav" aria-label="主要導覽">
          <button type="button" className="sb-item active" onClick={scrollToTop}>
            <span className="sb-ico" aria-hidden="true">
              📚
            </span>
            <span>桌遊收藏</span>
          </button>
          <button type="button" className="sb-item" onClick={onOpenLeaderboard}>
            <span className="sb-ico" aria-hidden="true">
              🏆
            </span>
            <span>排行榜</span>
          </button>
          {isAdmin ? (
            <LoyaltyAdmin />
          ) : (
            <button type="button" className="sb-item" onClick={onOpenLoyalty}>
              <span className="sb-ico" aria-hidden="true">
                🎟
              </span>
              <span>集點卡</span>
            </button>
          )}
          <button type="button" className="sb-item" onClick={onOpenMyList}>
            <span className="sb-ico" aria-hidden="true">
              ♥
            </span>
            <span>我的桌遊</span>
            {myListCount > 0 && <span className="sb-count">{myListCount}</span>}
          </button>
        </nav>

        <div className="sb-account">
          <PlayerPanel />
          {isAdmin && (
            <button
              type="button"
              className="sb-logout"
              onClick={() => void supabase.auth.signOut()}
            >
              登出
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
