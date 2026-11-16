import type { LibraryGame } from './libraryTypes'
import type { PersonalApi } from './personalApi'
import type { RatingsApi } from './useGameRatings'
import type { PlaySessionsApi } from './useGamePlaySessions'
import { getMyOverall } from './myScores'

// 難度五級（門檻與主畫面篩選相同：<1.8／<2.6／<3.2／<3.8／其餘）
export const LEVEL_LABELS = ['入門', '輕度', '中度', '中重', '重度']

export function levelIndex(difficulty: number | null): number | null {
  if (difficulty == null) return null
  if (difficulty < 1.8) return 0
  if (difficulty < 2.6) return 1
  if (difficulty < 3.2) return 2
  if (difficulty < 3.8) return 3
  return 4
}

export type PickFilters = {
  players: number | null
  maxTime: number | null
  levels: number[]
  categories: string[]
}

// 登入且資料讀完才有；訪客傳 null（只用篩選條件）
export type PickContext = {
  personal: PersonalApi
  ratings: RatingsApi | null
  playSessions: PlaySessionsApi
  nowMs: number
} | null

export type PickResult = { game: LibraryGame; reason: string }

// 通過篩選的候選：人數只看範圍，最佳人數不當排除條件
export function filterCandidates(
  games: LibraryGame[],
  filters: PickFilters,
): LibraryGame[] {
  return games.filter((game) => {
    if (game.referenceOnly || game.removedAt) return false
    if (filters.players !== null) {
      if (game.minPlayers == null || game.maxPlayers == null) return false
      if (filters.players < game.minPlayers || filters.players > game.maxPlayers) {
        return false
      }
    }
    if (
      filters.maxTime !== null &&
      (game.bggTime == null || game.bggTime > filters.maxTime)
    ) {
      return false
    }
    if (
      filters.categories.length > 0 &&
      !game.category.some((item) => filters.categories.includes(item))
    ) {
      return false
    }
    if (filters.levels.length > 0) {
      const level = levelIndex(game.bggDifficulty)
      if (level === null || !filters.levels.includes(level)) return false
    }
    return true
  })
}

function scoreGame(
  game: LibraryGame,
  filters: PickFilters,
  ctx: PickContext,
): { score: number; reason: string } {
  let score = 0
  const reasons: string[] = []

  if (filters.players !== null) {
    if (game.bestPlayers.includes(filters.players)) {
      score += 5
      reasons.push(`${filters.players} 人是最佳人數`)
    } else if (game.recommendPlayers.includes(filters.players)) {
      score += 3
      reasons.push(`${filters.players} 人是推薦人數`)
    }
  }

  if (ctx) {
    const entry = ctx.personal.getEntry(game.bggName)
    if (entry.wantToPlay) {
      score += 30
      reasons.unshift('在你的想玩清單中')
    }
    if (!entry.played) {
      score += 12
      if (!entry.wantToPlay) reasons.push('你還沒玩過')
    }
    // 沒評分不等於低分：給中間值
    const mine = ctx.ratings ? getMyOverall(ctx.ratings.getMine(game.bggName)) : null
    if (mine !== null) {
      score += mine
      if (mine >= 8) reasons.push('你給過高分')
    } else {
      score += 5
    }
    // 最近玩過才略扣分，玩過本身不扣
    const last = ctx.playSessions.getSummary(game.bggName).lastPlayedOn
    if (last) {
      const time = Date.parse(last)
      if (!Number.isNaN(time)) {
        const days = (ctx.nowMs - time) / 86400000
        if (days < 14) score -= 6
        else if (days < 30) score -= 3
      }
    }
  }

  const reason = reasons.length > 0 ? reasons.slice(0, 2).join('，') : '符合你選的條件'
  return { score, reason }
}

// 挑一批：排除這一輪已推薦過的；剩下不夠就開新一輪（wrapped）
export function pickBatch(
  candidates: LibraryGame[],
  filters: PickFilters,
  ctx: PickContext,
  excluded: Set<string>,
  count = 3,
): { picks: PickResult[]; wrapped: boolean } {
  const scored = candidates.map((game) => {
    const { score, reason } = scoreGame(game, filters, ctx)
    // 有隨機成分，但不是完全隨機
    return { game, reason, total: score + Math.random() * 8 }
  })

  let pool = scored.filter((item) => !excluded.has(item.game.bggName))
  let wrapped = false
  if (pool.length < count && scored.length > pool.length) {
    pool = scored
    wrapped = true
  }

  pool.sort((a, b) => b.total - a.total)
  return {
    picks: pool.slice(0, count).map((item) => ({ game: item.game, reason: item.reason })),
    wrapped,
  }
}