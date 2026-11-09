import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMyLoyalty, todayLocal, type LoyaltySummary } from './useLoyalty'
import { RATING_FIELDS, type RatingsApi } from './useGameRatings'
import { supabase } from './supabase'

// 玩家跑完評分流程、已向資料庫確認出席後送出，讓紅點與集點資料立刻更新
export const ATTENDANCE_CONFIRMED_EVENT = 'boardgame-attendance-confirmed'

// 今天有沒有「該去評分」的事：
// ①被列入今天的聚會、有指定遊戲、還沒得點
// ②被管理者手動加入今天的聚會、還沒跑完評分流程（就算以前評過分也一樣）
export function useTodayTask(ratings: RatingsApi): {
  pending: boolean
  // 導覽列「俱樂部」的點數數字用（跟集點卡同一份資料，不另外多讀）
  summary: LoyaltySummary | null
  reload: () => void
} {
  const loyalty = useMyLoyalty()
  const { reload } = loyalty
  const isLoggedIn = loyalty.isLoggedIn
  const [needConfirm, setNeedConfirm] = useState(false)

  const loadConfirm = useCallback(async () => {
    if (!isLoggedIn) {
      setNeedConfirm(false)
      return
    }
    const { data, error } = await supabase.rpc('get_my_pending_confirm')
    setNeedConfirm(!error && data === true)
  }, [isLoggedIn])

  // 切回網頁時重新讀一次（管理者可能剛把你加進名單）；評分流程確認後也重讀
  useEffect(() => {
    void loadConfirm()
    function handleVisible() {
      if (document.visibilityState === 'visible') {
        reload()
        void loadConfirm()
      }
    }
    function handleConfirmed() {
      reload()
      void loadConfirm()
    }
    document.addEventListener('visibilitychange', handleVisible)
    window.addEventListener(ATTENDANCE_CONFIRMED_EVENT, handleConfirmed)
    return () => {
      document.removeEventListener('visibilitychange', handleVisible)
      window.removeEventListener(ATTENDANCE_CONFIRMED_EVENT, handleConfirmed)
    }
  }, [reload, loadConfirm])

  const basePending = useMemo(() => {
    if (!loyalty.isLoggedIn || loyalty.loading || ratings.status !== 'ready') {
      return false
    }
    const today = todayLocal()
    const day = loyalty.days.find((item) => item.date === today)
    if (!day || day.qualified) return false

    const games = Array.from(
      new Set(
        loyalty.gatherings
          .filter((item) => item.date === today)
          .flatMap((item) => item.games),
      ),
    )
    if (games.length === 0) return false

    const anyComplete = games.some((bggName) => {
      const mine = ratings.getMine(bggName)
      if (!mine || !(mine.overall > 0)) return false
      return RATING_FIELDS.every((field) => mine[field.key] != null)
    })
    return !anyComplete
  }, [
    loyalty.isLoggedIn,
    loyalty.loading,
    loyalty.days,
    loyalty.gatherings,
    ratings.status,
    ratings.getMine,
  ])

  return { pending: basePending || needConfirm, summary: loyalty.summary, reload }
}
