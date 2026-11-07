import { useState } from 'react'
import PlayerPanel from '../PlayerPanel'
import AdminCenter from './AdminCenter'
import VipJoinDialog from './VipJoinDialog'
import { supabase } from '../lib/supabase'
import { useIsAdmin } from '../lib/useIsAdmin'
import { useVip } from '../lib/useVip'
import { useAdminPending } from '../lib/useAdminPending'
import { useErrataUnseen } from '../lib/useErrataUnseen'

// 導覽列對應的頁面：一次只會開一個，點另一顆會直接取代，再點同一顆就關閉
export type NavPage = 'leaderboard' | 'rules' | 'admin' | 'loyalty' | 'mylist'

export default function TopBar({
  loyaltyBadge,
  clubCount = 0,
  clubPoints = null,
  activePage,
  onGoPage,
  onGoHome,
  clubAlert,
  canUseRules,
  onCloseAdmin,
}: {
  // 「聚會．留言」圖示上的紅色數字：還沒看過的新未來聚會（0 就不顯示）
  loyaltyBadge: number
  // 俱樂部圖示上的小數字（管理者與非 VIP）：想玩＋已玩的款數（0 就不顯示）
  clubCount?: number
  // 俱樂部圖示上的咖啡色數字（VIP）：本月點數 ＋ 2 × 免費券張數；null＝不是 VIP，改用 clubCount
  clubPoints?: number | null
  activePage: NavPage | null
  onGoPage: (page: NavPage) => void
  onGoHome: () => void
  // 俱樂部紅點：今天有聚會、還沒評分
  clubAlert: boolean
  canUseRules: boolean
  onCloseAdmin: () => void
}) {
  const isAdmin = useIsAdmin()
  const vip = useVip()
  const pendingCount = useAdminPending(isAdmin)
  const errataUnseen = useErrataUnseen(canUseRules && !isAdmin)
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
              {errataUnseen > 0 && (
                <span className="sb-count" aria-label={`${errataUnseen} 則玩錯紀錄更新`}>
                  {errataUnseen}
                </span>
              )}
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
              <span>聚會．留言</span>
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
            {clubAlert && (
              <span className="sb-dot" aria-label="今天有遊戲要評分" />
            )}
            {clubPoints !== null ? (
              clubPoints > 0 && (
                <span
                  className="sb-count"
                  aria-label={`本月點數與免費券共 ${clubPoints} 點`}
                  style={{ background: '#a89478', color: '#fff', whiteSpace: 'nowrap' }}
                >
                  本月 {clubPoints}
                </span>
              )
            ) : (
              clubCount > 0 && (
                <span className="sb-count" aria-label={`想玩與已玩共 ${clubCount} 款`}>
                  {clubCount}
                </span>
              )
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
