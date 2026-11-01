import type { BoardGame } from '../data/boardGames.generated'

// Ranking engine 是整數＝管理者玩過；以 .5 結尾＝還沒玩過（沒有分數可以統計）
export function isUnplayedGame(game: BoardGame): boolean {
    const raw = (game as unknown as { rankingEngine?: unknown }).rankingEngine
    if (raw == null || raw === '') return false
    const value = Number(raw)
    return Number.isFinite(value) && !Number.isInteger(value)
}
