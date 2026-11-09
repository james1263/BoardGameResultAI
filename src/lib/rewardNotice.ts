import { supabase } from './supabase'

// 集點獎勵視窗：第一點、拿到免費券、使用免費券
export type RewardKind = 'first' | 'voucher' | 'used'

export type LoyaltySnap = { total: number; month: number; earned: number }

const OFF_KEY = 'boardgame-reward-off:'
const SEEN_KEY = 'boardgame-reward-seen:'

type SummaryRow = {
  total_points: number
  month_points: number
  earned_vouchers: number
}

export async function fetchLoyaltySnap(): Promise<LoyaltySnap | null> {
  try {
    const { data, error } = await supabase.rpc('get_my_loyalty_summary')
    if (error) return null
    const row = (data as SummaryRow[] | null)?.[0]
    if (!row) return null
    return {
      total: row.total_points,
      month: row.month_points,
      earned: row.earned_vouchers,
    }
  } catch {
    return null
  }
}

// 比較評分前後：拿到新的券優先，其次是多了一點
export function detectReward(before: LoyaltySnap, after: LoyaltySnap): RewardKind | null {
  if (after.earned > before.earned) return 'voucher'
  if (after.total > before.total) return 'first'
  return null
}

export function isRewardOff(userId: string): boolean {
  try {
    return localStorage.getItem(OFF_KEY + userId) === '1'
  } catch {
    return false
  }
}

export function setRewardOff(userId: string) {
  try {
    localStorage.setItem(OFF_KEY + userId, '1')
  } catch {
    // 存不了就算了
  }
}

function loadSeen(userId: string): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY + userId)
    const list: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function wasRewardSeen(userId: string, key: string): boolean {
  return loadSeen(userId).includes(key)
}

export function markRewardSeen(userId: string, key: string) {
  try {
    const list = loadSeen(userId)
    if (!list.includes(key)) list.push(key)
    localStorage.setItem(SEEN_KEY + userId, JSON.stringify(list.slice(-50)))
  } catch {
    // 存不了就算了
  }
}
