import { useState } from 'react'
import PlayerPanel from '../PlayerPanel'
import AdminCenter from './AdminCenter'
import VipJoinDialog from './VipJoinDialog'
import { supabase } from '../lib/supabase'
import { useIsAdmin } from '../lib/useIsAdmin'
import { useVip } from '../lib/useVip'
import { useAdminPending } from '../lib/useAdminPending'

// 導覽列對應的頁面：一次只會開一個，點另一顆會直接取代，再點同一顆就關閉
export type NavPage = 'leaderboard' | 'rules' | 'admin' | 'loyalty' | 'mylist'

export default function TopBar({
  loyaltyBadge,
  clubCount = 0,
  activePage,
  onGoPage,
  onGoHome,
  loyaltyAlert,
  canUseRules,
  onCloseAdmin,
}: {
  // 集點聚會圖示上的小數字：還沒看過的新預計聚會、新加入的聚會、被移除的指定遊戲（0 就不顯示）
  loyaltyBadge: number
  // 俱樂部圖示上的小數字：想玩＋已玩的款數（0 就不顯示）
  clubCount?: number
  activePage: NavPage | null
  onGoPage: (page: NavPage) => void
  onGoHome: () => void
  loyaltyAlert: boolean
  canUseRules: boolean
  onCloseAdmin: () => void
}) {
  const isAdmin = useIsAdmin()
  const vip = useVip()
  const pendingCount = useAdminPending(isAdmin)
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
            onGoHome()
            scrollToTop()
          }}
        >
          <span className="sb-logo" aria-hidden="true">
            🎲
          </span>
          <span className="sb-brand-text">
            <strong>桌遊規則助手</strong>
          </span>
        </a>

        <nav className="sb-nav" aria-label="主要導覽">
          <button
            type="button"
            className={`sb-item ${activePage === null ? 'active' : ''}`}
            onClick={onGoHome}
          >
            <span className="sb-ico" aria-hidden="true">
              📚
            </span>
            <span>桌遊收藏</span>
          </button>
          <button
            type="button"
            className={`sb-item ${activePage === 'leaderboard' ? 'active' : ''}`}
            onClick={() => onGoPage('leaderboard')}
          >
            <span className="sb-ico" aria-hidden="true">
              🏆
            </span>
            <span>統計中心</span>
          </button>
          {canUseRules && (
            <button
              type="button"
              className={`sb-item ${activePage === 'rules' ? 'active' : ''}`}
              onClick={() => onGoPage('rules')}
            >
              <span className="sb-ico" aria-hidden="true">
                ✦
              </span>
              <span>規則助手</span>
            </button>
          )}
          {isAdmin ? (
            <AdminCenter
              isOpen={activePage === 'admin'}
              onToggle={() => onGoPage('admin')}
              onClose={onCloseAdmin}
              pendingCount={pendingCount}
            />
          ) : (
            <button
              type="button"
              className={`sb-item ${activePage === 'loyalty' ? 'active' : ''}`}
              onClick={() => onGoPage('loyalty')}
            >
              <span className="sb-ico" aria-hidden="true">
                🎟
              </span>
              <span>集點聚會</span>
              {loyaltyAlert && (
                <span className="sb-dot" aria-label="今天有遊戲要評分" />
              )}
              {loyaltyBadge > 0 && (
                <span className="sb-count" aria-label={`${loyaltyBadge} 則新通知`}>
                  {loyaltyBadge}
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            className={`sb-item ${activePage === 'mylist' ? 'active' : ''}`}
            onClick={() => onGoPage('mylist')}
          >
            <span className="sb-ico" aria-hidden="true">
              ♥
            </span>
            <span>俱樂部</span>
            {clubCount > 0 && (
              <span className="sb-count" aria-label={`想玩與已玩共 ${clubCount} 款`}>
                {clubCount}
              </span>
            )}
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
