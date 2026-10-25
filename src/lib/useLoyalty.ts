import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useSession } from './useSession'

export type LoyaltySummary = {
  totalPoints: number
  monthPoints: number
  earnedVouchers: number
  redeemed: number
  availableVouchers: number
  overRedeemed: boolean
}

export type LoyaltyDay = {
  date: string
  gameCount: number
  ratedCount: number
  hasSession: boolean
  qualified: boolean
}

export type Redemption = { id: string; redeemedAt: string }

// 玩家被列入的聚會日：當天的遊戲清單，以及自己勾了「我玩了」的遊戲
export type MyGathering = {
  id: string
  date: string
  games: string[]
  played: string[]
}

type SummaryRow = {
  total_points: number
  month_points: number
  earned_vouchers: number
  redeemed: number
  available_vouchers: number
  over_redeemed: boolean
}

type DayRow = {
  day_date: string
  game_count: number
  rated_count: number
  has_session: boolean
  qualified: boolean
}

type RedemptionRow = { id: string; redeemed_at: string }
type GatheringRow = { id: string; gathered_on: string }
type PairRow = { gathering_id: string; bgg_name: string }

export function toSummary(row: SummaryRow): LoyaltySummary {
  return {
    totalPoints: row.total_points,
    monthPoints: row.month_points,
    earnedVouchers: row.earned_vouchers,
    redeemed: row.redeemed,
    availableVouchers: row.available_vouchers,
    overRedeemed: row.over_redeemed,
  }
}

export function toDay(row: DayRow): LoyaltyDay {
  return {
    date: row.day_date,
    gameCount: row.game_count,
    ratedCount: row.rated_count,
    hasSession: row.has_session,
    qualified: row.qualified,
  }
}

export function toRedemption(row: RedemptionRow): Redemption {
  return { id: row.id, redeemedAt: row.redeemed_at }
}

export function formatDay(date: string): string {
  return date.replaceAll('-', '/')
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    hour12: false,
  })
}

export function todayLocal(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function buildGatherings(
  gatherings: GatheringRow[],
  games: PairRow[],
  plays: PairRow[],
): MyGathering[] {
  return gatherings.map((row) => ({
    id: row.id,
    date: row.gathered_on,
    games: games
      .filter((item) => item.gathering_id === row.id)
      .map((item) => item.bgg_name),
    played: plays
      .filter((item) => item.gathering_id === row.id)
      .map((item) => item.bgg_name),
  }))
}

type MyState = {
  userId: string
  summary: LoyaltySummary | null
  days: LoyaltyDay[]
  redemptions: Redemption[]
  gatherings: MyGathering[]
  error: string
}

// 玩家自己的集點資料（只在「集點卡」分頁開啟時才會讀取）
export function useMyLoyalty() {
  const session = useSession()
  const userId = session?.user?.id ?? null
  const [state, setState] = useState<MyState | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load(id: string) {
      try {
        const [s, d, r, g, gg, gp] = await Promise.all([
          supabase.rpc('get_my_loyalty_summary'),
          supabase.rpc('get_my_loyalty_days'),
          supabase
            .from('loyalty_redemptions')
            .select('id, redeemed_at')
            .eq('user_id', id)
            .order('redeemed_at', { ascending: false }),
          supabase.from('gatherings').select('id, gathered_on'),
          supabase.from('gathering_games').select('gathering_id, bgg_name'),
          supabase
            .from('gathering_plays')
            .select('gathering_id, bgg_name')
            .eq('user_id', id),
        ])
        if (cancelled) return

        const message =
          s.error?.message ??
          d.error?.message ??
          r.error?.message ??
          g.error?.message ??
          gg.error?.message ??
          gp.error?.message ??
          ''
        const summaryRow = (s.data as SummaryRow[] | null)?.[0]

        setState({
          userId: id,
          summary: summaryRow ? toSummary(summaryRow) : null,
          days: ((d.data ?? []) as DayRow[]).map(toDay),
          redemptions: ((r.data ?? []) as RedemptionRow[]).map(toRedemption),
          gatherings: buildGatherings(
            (g.data ?? []) as GatheringRow[],
            (gg.data ?? []) as PairRow[],
            (gp.data ?? []) as PairRow[],
          ),
          error: message,
        })
      } catch (error) {
        if (cancelled) return
        setState({
          userId: id,
          summary: null,
          days: [],
          redemptions: [],
          gatherings: [],
          error: error instanceof Error ? error.message : '讀取失敗',
        })
      }
    }

    void load(userId)
    return () => {
      cancelled = true
    }
  }, [userId, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  // 勾選／取消「我玩了」
  const setPlayed = useCallback(
    async (
      gatheringId: string,
      bggName: string,
      played: boolean,
    ): Promise<boolean> => {
      if (!userId) return false

      const result = played
        ? await supabase.from('gathering_plays').insert({
            gathering_id: gatheringId,
            user_id: userId,
            bgg_name: bggName,
          })
        : await supabase
            .from('gathering_plays')
            .delete()
            .eq('gathering_id', gatheringId)
            .eq('user_id', userId)
            .eq('bgg_name', bggName)

      // 23505＝已經勾過了，當作成功
      if (result.error && result.error.code !== '23505') {
        window.alert('更新失敗：' + result.error.message)
        return false
      }

      setState((current) => {
        if (!current || current.userId !== userId) return current
        return {
          ...current,
          gatherings: current.gatherings.map((item) => {
            if (item.id !== gatheringId) return item
            const without = item.played.filter((name) => name !== bggName)
            return { ...item, played: played ? [...without, bggName] : without }
          }),
        }
      })
      return true
    },
    [userId],
  )

  const current = state && state.userId === userId ? state : null

  return {
    isLoggedIn: userId !== null,
    loading: userId !== null && current === null,
    summary: current?.summary ?? null,
    days: current?.days ?? [],
    redemptions: current?.redemptions ?? [],
    gatherings: current?.gatherings ?? [],
    error: current?.error ?? '',
    reload,
    setPlayed,
  }
}
