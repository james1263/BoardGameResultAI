import { useEffect, useState } from 'react'
import { useVip } from '../lib/useVip'
import { useIsAdmin } from '../lib/useIsAdmin'
import VipUpgradeDialog from './VipUpgradeDialog'

// 歡迎視窗按「用 Google 登入」前會先記下這個旗標；登入回來後，如果還不是 VIP 就跳出升級視窗
export const FROM_WELCOME_KEY = 'boardgame-from-welcome'
const CHECKIN_KEY = 'boardgame-checkin-token'

function readFlag(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function removeFlag(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // 清不掉也沒關係
  }
}

export default function VipGate() {
  const vip = useVip()
  const isAdmin = useIsAdmin()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!vip.loggedIn || !vip.checked) return
    if (readFlag(FROM_WELCOME_KEY) !== '1') return
    // 已經是 VIP、管理者、或正在用聚會連結報到（報到會自動升 VIP）：不用問，旗標清掉
    if (isAdmin || vip.isVip || readFlag(CHECKIN_KEY) !== null) {
      removeFlag(FROM_WELCOME_KEY)
      return
    }
    setOpen(true)
  }, [vip.loggedIn, vip.checked, vip.isVip, isAdmin])

  if (!open) return null
  return (
    <VipUpgradeDialog
      mode="offer"
      onClose={() => {
        removeFlag(FROM_WELCOME_KEY)
        setOpen(false)
      }}
    />
  )
}
