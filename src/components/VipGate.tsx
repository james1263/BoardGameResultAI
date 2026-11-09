import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useSession } from '../lib/useSession'
import { PROFILE_SAVED_EVENT } from '../lib/googleLogin'
import { useVip } from '../lib/useVip'
import { useIsAdmin } from '../lib/useIsAdmin'
import VipUpgradeDialog from './VipUpgradeDialog'

// 歡迎視窗按「用 Google 登入」前會先記下這個旗標；登入回來後，
// 先設好暱稱與聯絡方式，再問要不要升級 VIP（同一時間只開一個視窗）
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

// 暱稱視窗用：是不是「從歡迎視窗登入、之後會問升級 VIP」
export function hasWelcomeFlag(): boolean {
  return readFlag(FROM_WELCOME_KEY) === '1'
}

export default function VipGate() {
  const vip = useVip()
  const isAdmin = useIsAdmin()
  const session = useSession()
  const userId = session?.user?.id ?? null
  const [open, setOpen] = useState(false)
  const [tick, setTick] = useState(0)

  // 登出就清掉旗標，下次從別的入口登入不會被問
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        removeFlag(FROM_WELCOME_KEY)
        setOpen(false)
      }
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // 暱稱與聯絡方式剛存好：重新判斷
  useEffect(() => {
    function handleSaved() {
      setTick((value) => value + 1)
    }
    window.addEventListener(PROFILE_SAVED_EVENT, handleSaved)
    return () => window.removeEventListener(PROFILE_SAVED_EVENT, handleSaved)
  }, [])

  useEffect(() => {
    if (!vip.loggedIn || !vip.checked || !userId) return
    if (readFlag(FROM_WELCOME_KEY) !== '1') return
    // 已經是 VIP、管理者、或正在用聚會連結報到（報到會自動升 VIP）：不用問，旗標清掉
    if (isAdmin || vip.isVip || readFlag(CHECKIN_KEY) !== null) {
      removeFlag(FROM_WELCOME_KEY)
      return
    }

    let cancelled = false
    void (async () => {
      const [p, c] = await Promise.all([
        supabase.from('player_profiles').select('nickname').eq('id', userId).maybeSingle(),
        supabase.from('player_contacts').select('contact_name').eq('user_id', userId).maybeSingle(),
      ])
      if (cancelled || p.error) return
      const hasNickname = !!(p.data as { nickname: string } | null)?.nickname
      // 讀不到聯絡方式的表時不擋（暱稱視窗也是這樣處理）
      const hasContact =
        !!c.error || !!(c.data as { contact_name: string } | null)?.contact_name
      // 還沒設好暱稱：先等暱稱視窗處理，存好後會再判斷；選「稍後再說」就不問升級
      if (hasNickname && hasContact) setOpen(true)
    })()
    return () => {
      cancelled = true
    }
  }, [vip.loggedIn, vip.checked, vip.isVip, isAdmin, userId, tick])

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
