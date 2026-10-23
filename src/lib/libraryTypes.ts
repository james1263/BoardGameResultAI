import type { BoardGame } from '../data/boardGames.generated'
import type { PersonalEntry } from './usePersonalCollection'

export type LibraryGame = BoardGame & { createdAt?: string | null }

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
