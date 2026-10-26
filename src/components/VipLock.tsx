import { useState } from 'react'
import { useVip } from '../lib/useVip'
import { signInWithGoogle } from '../lib/googleLogin'
import VipJoinDialog from './VipJoinDialog'

export default function VipLock({
  feature,
  compact = false,
}: {
  feature: string
  compact?: boolean
}) {
  const vip = useVip()
  const [open, setOpen] = useState(false)

  return (
    <div className={`vip-lock ${compact ? 'compact' : ''}`}>
      <span className="vip-lock-icon" aria-hidden="true">
        🔒
      </span>
      <p>{feature}是 VIP 朋友專屬功能。</p>
      {vip.loggedIn ? (
        <button type="button" className="ma-btn" onClick={() => setOpen(true)}>
          輸入密碼加入 VIP
        </button>
      ) : (
        <button
          type="button"
          className="ma-btn"
          onClick={() => void signInWithGoogle()}
        >
          先用 Google 登入
        </button>
      )}
      {open && <VipJoinDialog onClose={() => setOpen(false)} />}
    </div>
  )
}