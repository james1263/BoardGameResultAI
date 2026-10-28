import { useState } from 'react'
import PlayerPanel from '../PlayerPanel'
import AdminCenter from './AdminCenter'
import VipJoinDialog from './VipJoinDialog'
import { supabase } from '../lib/supabase'
import { useIsAdmin } from '../lib/useIsAdmin'
import { useVip } from '../lib/useVip'

export default function TopBar({
  myListCount,
  onOpenMyList,
  onOpenLeaderboard,
  onOpenLoyalty,
  loyaltyAlert,
  onOpenRules,
  canUseRules,
}: {
  myListCount: number
  onOpenMyList: () => void
  onOpenLeaderboard: () => void
  onOpenLoyalty: () => void
  loyaltyAlert: boolean
  onOpenRules: () => void
  canUseRules: boolean
}) {
  const isAdmin = useIsAdmin()
  const vip = useVip()
  const [isVipDialogOpen, setIsVipDialogOpen] = useState(false)

  const showJoinVip = vip.loggedIn && vip.checked && !vip.isVip && !isAdmin
  const showVipTag = vip.isVip && !isAdmin

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
          {canUseRules && (
            <button type="button" className="sb-item" onClick={onOpenRules}>
              <span className="sb-ico" aria-hidden="true">
                ✦
              </span>
              <span>規則助手</span>
            </button>
          )} 
          {isAdmin ? (
            <>
              <AdminCenter />
            </>
          ) : (
            <button type="button" className="sb-item" onClick={onOpenLoyalty}>
              <span className="sb-ico" aria-hidden="true">
                🎟
              </span>
              <span>集點卡</span>
              {loyaltyAlert && (
                <span className="sb-dot" aria-label="今天有遊戲要評分" />
              )}
            </button>
          )}
          <button type="button" className="sb-item" onClick={onOpenMyList}>
            <span className="sb-ico" aria-hidden="true">
              ♥
            </span>
            <span>我的桌遊</span>
            {myListCount > 0 && <span className="sb-count">{myListCount}</span>}
          </button>
          {showJoinVip && (
            <button
              type="button"
              className="sb-item"
              onClick={() => setIsVipDialogOpen(true)}
            >
              <span className="sb-ico" aria-hidden="true">
                🔑
              </span>
              <span>加入 VIP</span>
            </button>
          )}
        </nav>

        <div className="sb-account">
          {showVipTag && <span className="vip-tag">VIP</span>}
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

      {isVipDialogOpen && (
        <VipJoinDialog onClose={() => setIsVipDialogOpen(false)} />
      )}
    </header>
  )
}