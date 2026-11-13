import type {
  DifficultyLevel,
  MineGroup,
  NumericFilter,
  RatingFilter,
  SortKey,
} from './libraryTypes'

// 主畫面篩選記憶：只存在這支瀏覽器的 localStorage，換裝置不同步
export const FILTERS_STORAGE_KEY = 'boardgame-filters'
const FILTERS_VERSION = 1

export type SavedFilters = {
  selectedCategories: string[]
  difficultyLevels: DifficultyLevel[]
  groupSize: NumericFilter
  groupSizeMax: NumericFilter
  bestPlayerCount: NumericFilter
  recommendPlayerCount: NumericFilter
  timeLimit: NumericFilter
  ratingFilter: RatingFilter
  groupByMine: boolean
  hiddenGroups: MineGroup[]
  sortBy: SortKey
  sortDirection: 'asc' | 'desc'
  // 顯示設定（不算篩選條件，清除篩選不會重設）
  showCardInfo: boolean
  // 顯示「新加入桌遊」那一排（預設打勾；舊的「只看新遊戲」值已不使用）
  showNew: boolean
}

export const DEFAULT_FILTERS: SavedFilters = {
  selectedCategories: [],
  difficultyLevels: [],
  groupSize: '',
  groupSizeMax: '',
  bestPlayerCount: '',
  recommendPlayerCount: '',
  timeLimit: '',
  ratingFilter: 'all',
  groupByMine: false,
  hiddenGroups: [],
  sortBy: 'rankingEngine',
  sortDirection: 'asc',
  showCardInfo: true,
  showNew: true,
}

const SORT_KEYS: SortKey[] = [
  'name',
  'bggScore',
  'bggDifficulty',
  'bggTime',
  'rankingEngine',
  'classicGameRanking',
  'scoreRank',
  'bestPlayers',
  'recommendPlayers',
  'myOverall',
  'myComposite',
]
const MINE_GROUP_VALUES: MineGroup[] = ['want', 'untouched', 'played']
const RATING_VALUES: RatingFilter[] = ['all', 'rated', 'unrated']

function asNumeric(value: unknown): NumericFilter {
  return typeof value === 'number' && Number.isFinite(value) ? value : ''
}

function asBool(value: unknown): boolean {
  return value === true
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

// 讀取失敗、版本不對、欄位不合，都退回預設值，不影響使用
export function loadFilters(): SavedFilters {
  try {
    const text = localStorage.getItem(FILTERS_STORAGE_KEY)
    if (!text) return DEFAULT_FILTERS
    const raw = JSON.parse(text) as Record<string, unknown> | null
    if (!raw || raw.version !== FILTERS_VERSION) return DEFAULT_FILTERS
    const f = raw.filters as Record<string, unknown> | null
    if (!f || typeof f !== 'object') return DEFAULT_FILTERS

    return {
      selectedCategories: asStringArray(f.selectedCategories),
      difficultyLevels: (Array.isArray(f.difficultyLevels)
        ? f.difficultyLevels
        : []
      ).filter(
        (v): v is DifficultyLevel =>
          v === 1 || v === 2 || v === 3 || v === 4 || v === 5,
      ),
      groupSize: asNumeric(f.groupSize),
      groupSizeMax: asNumeric(f.groupSizeMax),
      bestPlayerCount: asNumeric(f.bestPlayerCount),
      recommendPlayerCount: asNumeric(f.recommendPlayerCount),
      timeLimit: asNumeric(f.timeLimit),
      ratingFilter: RATING_VALUES.includes(f.ratingFilter as RatingFilter)
        ? (f.ratingFilter as RatingFilter)
        : 'all',
      groupByMine: asBool(f.groupByMine),
      hiddenGroups: asStringArray(f.hiddenGroups).filter(
        (v): v is MineGroup => MINE_GROUP_VALUES.includes(v as MineGroup),
      ),
      sortBy:
        SORT_KEYS.includes(f.sortBy as SortKey) &&
        f.sortBy !== 'bestPlayers' &&
        f.sortBy !== 'recommendPlayers'
          ? (f.sortBy as SortKey)
          : 'rankingEngine',
      sortDirection: f.sortDirection === 'desc' ? 'desc' : 'asc',
      showCardInfo: f.showCardInfo !== false,
      showNew: f.showNew !== false,
    }
  } catch {
    return DEFAULT_FILTERS
  }
}

export function saveFilters(filters: SavedFilters) {
  try {
    localStorage.setItem(
      FILTERS_STORAGE_KEY,
      JSON.stringify({ version: FILTERS_VERSION, filters }),
    )
  } catch {
    // 儲存失敗也不影響使用
  }
}