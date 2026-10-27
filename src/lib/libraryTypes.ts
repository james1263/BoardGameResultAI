import type { BoardGame } from '../data/boardGames.generated'
import type { PersonalEntry } from './usePersonalCollection'

export type LibraryGame = BoardGame & {
  createdAt?: string | null
  removedAt?: string | null
  removedReason?: string | null
  description?: string | null
}

export type SortKey =
  | 'name'
  | 'bggScore'
  | 'bggDifficulty'
  | 'bggTime'
  | 'rankingEngine'
  | 'classicGameRanking'
  | 'scoreRank'
  | 'bestPlayers'
  | 'recommendPlayers'

export type NumericFilter = number | ''

export type ViewMode = 'list' | 'grid-4' | 'grid-9'

export const VIEW_MODE_STORAGE_KEY = 'boardgame-view-mode'

export function loadViewMode(): ViewMode {
  try {
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY)
    if (saved === 'list' || saved === 'grid-4' || saved === 'grid-9') {
      return saved
    }
  } catch {
    // 讀取失敗就用預設值
  }
  return 'grid-4'
}

export const NEW_GAME_DAYS = 30

export type MineGroup = 'want' | 'untouched' | 'played'

export const MINE_GROUPS: MineGroup[] = ['want', 'untouched', 'played']

export const MINE_GROUP_LABELS: Record<MineGroup, string> = {
  want: '想玩',
  untouched: '還沒玩過',
  played: '已玩',
}

export type DisplayItem =
  | { kind: 'header'; group: MineGroup; label: string; count: number }
  | { kind: 'game'; game: LibraryGame }

export function getMineGroup(entry: PersonalEntry | undefined): MineGroup {
  if (entry?.wantToPlay) return 'want'
  if (entry?.played) return 'played'
  return 'untouched'
}

export const MAIN_CATEGORIES = ['策略', '陣營', '派對']

// ---- 進階篩選用 ----

// 難度五級（2026-10-27 使用者決定）：<1.8／<2.6／<3.2／<3.8／>=3.8
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [1, 2, 3, 4, 5]

export const DIFFICULTY_LEVEL_INFO: Record<
  DifficultyLevel,
  { name: string; range: string }
> = {
  1: { name: '入門', range: '1.8 以下' },
  2: { name: '輕度', range: '1.8–2.6' },
  3: { name: '中度', range: '2.6–3.2' },
  4: { name: '中重', range: '3.2–3.8' },
  5: { name: '重度', range: '3.8 以上' },
}

export function getDifficultyLevel(
  difficulty: number | null | undefined,
): DifficultyLevel | null {
  if (difficulty == null) return null
  if (difficulty < 1.8) return 1
  if (difficulty < 2.6) return 2
  if (difficulty < 3.2) return 3
  if (difficulty < 3.8) return 4
  return 5
}

export const TIME_LIMITS = [30, 60, 90, 120]

export type RatingFilter = 'all' | 'rated' | 'unrated'

export const RATING_FILTERS: RatingFilter[] = ['all', 'rated', 'unrated']

export const RATING_FILTER_LABELS: Record<RatingFilter, string> = {
  all: '全部',
  rated: '我評過',
  unrated: '我還沒評',
}

export function isNewGameAt(
  createdAt: string | null | undefined,
  nowMs: number,
): boolean {
  if (!createdAt) return false
  return (
    nowMs - new Date(createdAt).getTime() < NEW_GAME_DAYS * 24 * 60 * 60 * 1000
  )
}

// ---- 人數區間篩選 ----

export type PlayerRange = [number, number]

// 只填一個＝剛好這個人數；兩個都填＝區間（前後顛倒會自動對調）
export function getGroupRange(
  a: NumericFilter,
  b: NumericFilter,
): PlayerRange | null {
  if (a === '' && b === '') return null
  const lo = a === '' ? (b as number) : a
  const hi = b === '' ? (a as number) : b
  return lo <= hi ? [lo, hi] : [hi, lo]
}

// 整個區間都玩得起來才算符合（人數資料缺值的遊戲不排除，和以前一樣）
export function fitsGroupRange(
  game: { minPlayers?: number | null; maxPlayers?: number | null },
  range: PlayerRange | null,
): boolean {
  if (!range) return true
  const [lo, hi] = range
  if (game.minPlayers != null && lo < game.minPlayers) return false
  if (game.maxPlayers != null && hi > game.maxPlayers) return false
  return true
}

// ---- 綜合分數（畫面顯示）----

// 畫面顯示「綜合分數」＝700 減 score_rank，越大越好（資料庫欄位不變）
export function getDisplayScore(
  scoreRank: number | null | undefined,
): number | null {
  if (scoreRank == null) return null
  return Math.round((700 - scoreRank) * 10) / 10
}

// ---- 管理者 CSV 換算分數（與資料庫函式 get_rating_summaries 同一套規則）----

export type AdminScores = { overall: number | null; keep: number | null }

// 玩過的遊戲＝ranking_engine 是整數（.5 結尾代表還沒玩過）
export function computeAdminScores(
  games: LibraryGame[],
): Map<string, AdminScores> {
  const result = new Map<string, AdminScores>()
  const played = games.filter(
    (g) => g.rankingEngine != null && Number.isInteger(g.rankingEngine),
  )
  const scoreRanks: number[] = []
  for (const g of played) {
    if (g.scoreRank != null) scoreRanks.push(g.scoreRank)
  }

  for (const g of played) {
    const re = g.rankingEngine as number
    const overall =
      re <= 25 ? 10 : re <= 50 ? 9 : re <= 65 ? 8 : re <= 80 ? 7 : 6

    let keep: number | null = null
    const sr = g.scoreRank
    if (sr != null) {
      // 同分並列：名次＝比自己小的有幾款＋1
      const rank = scoreRanks.filter((v) => v < sr).length + 1
      keep = rank <= 30 ? 5 : rank <= 60 ? 4 : rank <= 90 ? 3 : 2
    }
    result.set(g.bggName, { overall, keep })
  }
  return result
}