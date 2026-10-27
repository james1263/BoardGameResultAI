import { useEffect, useMemo } from 'react'
import { useMyLoyalty, todayLocal } from './useLoyalty'
import { RATING_FIELDS, type RatingsApi } from './useGameRatings'

// 今天有沒有「該去評分」的事：被列入今天的聚會、有指定遊戲、還沒得點
export function useTodayTask(ratings: RatingsApi): { pending: boolean } {
  const loyalty = useMyLoyalty()
  const { reload } = loyalty

  // 切回網頁時重新讀一次（管理者可能剛把你加進名單）
  useEffect(() => {
    function handleVisible() {
      if (document.visibilityState === 'visible') reload()
    }
    document.addEventListener('visibilitychange', handleVisible)
    return () => document.removeEventListener('visibilitychange', handleVisible)
  }, [reload])

  const pending = useMemo(() => {
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

  return { pending }
}