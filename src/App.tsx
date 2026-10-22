import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react'
import './App.css'
import {
  boardGames as fallbackGames,
  type BoardGame,
} from './data/boardGames.generated'
import { supabase } from './lib/supabase'
import AdminPanel from './AdminPanel'
import PlayerPanel from './PlayerPanel'
import { useIsAdmin } from './lib/useIsAdmin'
import { uploadCover } from './lib/uploadCover'
import GameDocuments from './GameDocuments'
import {
  usePersonalCollection,
  type PersonalEntry,
} from './lib/usePersonalCollection'
import MyList from './MyList'

type SortKey =
  | 'name'
  | 'bggScore'
  | 'bggDifficulty'
  | 'bggTime'
  | 'rankingEngine'
  | 'classicGameRanking'
  | 'scoreRank'
  | 'bestPlayers'
  | 'recommendPlayers'


type NumericFilter = number | ''

type ViewMode = 'list' | 'grid-4' | 'grid-9'

const VIEW_MODE_STORAGE_KEY = 'boardgame-view-mode'

function loadViewMode(): ViewMode {
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

const NEW_GAME_DAYS = 30

type MineGroup = 'want' | 'untouched' | 'played'

const MINE_GROUPS: MineGroup[] = ['want', 'untouched', 'played']

const MINE_GROUP_LABELS: Record<MineGroup, string> = {
  want: '想玩',
  untouched: '還沒玩過',
  played: '已玩',
}

type DisplayItem =
  | { kind: 'header'; group: MineGroup; label: string; count: number }
  | { kind: 'game'; game: LibraryGame }

function getMineGroup(entry: PersonalEntry | undefined): MineGroup {
  if (entry?.wantToPlay) return 'want'
  if (entry?.played) return 'played'
  return 'untouched'
}

const MAIN_CATEGORIES = ['策略', '陣營', '派對']

function formatPlayers(players: number[]): string {
  if (players.length === 0) return '未提供'
  if (players.length === 1) return `${players[0]} 人`

  const sortedPlayers = [...players].sort((a, b) => b - a)
  const isContinuous = sortedPlayers.every(
    (player, index) =>
      index === 0 || sortedPlayers[index - 1] - player === 1,
  )

  if (isContinuous) {
    return `${sortedPlayers[sortedPlayers.length - 1]}–${sortedPlayers[0]} 人`
  }

  return `${players.join('、')} 人`
}

function formatNumber(value: number | null | undefined): string {
  return value == null ? '未提供' : String(value)
}

function getPlayerSortValue(players: number[]): number | null {
  return players.length > 0 ? Math.min(...players) : null
}

function compareNullableNumbers(
  a: number | null,
  b: number | null,
  direction: number,
): number {
  // 缺失資料固定排最後，不受升冪或降冪影響。
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return (a - b) * direction
}

const COVER_EXTENSIONS = ['webp', 'jpg', 'png']

function getCoverSources(slug: string, version: number): string[] {
  const baseUrl = supabase.storage
    .from('covers')
    .getPublicUrl(`${slug}.webp`).data.publicUrl
  const storageUrl = version > 0 ? `${baseUrl}?v=${version}` : baseUrl

  // 順序：Supabase 上傳的圖 → 舊的本機圖 webp／jpg／png
  return [
    storageUrl,
    ...COVER_EXTENSIONS.map((ext) => `/covers/${slug}.${ext}`),
  ]
}

function CoverImage({
  slug,
  alt,
  className,
  fallback,
  version = 0,
}: {
  slug: string
  alt: string
  className: string
  fallback: ReactNode
  version?: number
}) {
  const sources = getCoverSources(slug, version)
  const [srcIndex, setSrcIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const failed = srcIndex >= sources.length

  return (
    <>
      {!loaded && fallback}
      {!failed && (
        <img
          className={className}
          src={sources[srcIndex]}
          alt={alt}
          style={{ display: loaded ? 'block' : 'none' }}
          onLoad={() => setLoaded(true)}
          onError={() => setSrcIndex((current) => current + 1)}
        />
      )}
    </>
  )
}

type LibraryGame = BoardGame & { createdAt?: string | null }

type BoardGameRow = {
  bgg_name: string
  created_at?: string | null
  name: string
  cover_slug: string
  link_bgg: string
  link_rulebook_zh: string
  link_rulebook_en: string
  link_faq: string
  category: string[]
  bgg_score: number | null
  bgg_difficulty: number | null
  bgg_time: number | null
  min_players: number | null
  max_players: number | null
  best_players: number[]
  recommend_players: number[]
  ranking_engine: number | null
  classic_game_ranking: number | null
  score_rank: number | null
  player_impact_ranking: number | null
  change_ranking: number | null
  unique_ranking: number | null
  communication_ranking: number | null
  like_degree: number | null
  change_degree: number | null
  communication_degree: number | null
  player_impact_degree: number | null
  unique_degree: number | null
  complexity_degree: number | null
  like_emoji: string
  speed_emoji: string
  communication_emoji: string
  unique_emoji: string
  player_impact_emoji: string
  complexity_emoji: string
  change_emoji: string
}

function rowToGame(row: BoardGameRow, index: number): LibraryGame {
  return {
    id: index + 1,
    name: row.name,
    bggName: row.bgg_name,
    createdAt: row.created_at,
    slug: `game-${index + 1}`,
    coverSlug: row.cover_slug,
    links: {
      bgg: row.link_bgg,
      rulebookZh: row.link_rulebook_zh,
      rulebookEn: row.link_rulebook_en,
      faq: row.link_faq,
    },
    category: row.category,
    bggScore: row.bgg_score,
    maxPlayers: row.max_players,
    minPlayers: row.min_players,
    bggTime: row.bgg_time,
    bggDifficulty: row.bgg_difficulty,
    bestPlayers: row.best_players,
    recommendPlayers: row.recommend_players,
    rankingEngine: row.ranking_engine,
    classicGameRanking: row.classic_game_ranking,
    scoreRank: row.score_rank,
    playerImpactRanking: row.player_impact_ranking,
    changeRanking: row.change_ranking,
    uniqueRanking: row.unique_ranking,
    communicationRanking: row.communication_ranking,
    likeDegree: row.like_degree,
    changeDegree: row.change_degree,
    communicationDegree: row.communication_degree,
    playerImpactDegree: row.player_impact_degree,
    uniqueDegree: row.unique_degree,
    complexityDegree: row.complexity_degree,
    likeEmoji: row.like_emoji,
    speedEmoji: row.speed_emoji,
    communicationEmoji: row.communication_emoji,
    uniqueEmoji: row.unique_emoji,
    playerImpactEmoji: row.player_impact_emoji,
    complexityEmoji: row.complexity_emoji,
    changeEmoji: row.change_emoji,
  }
}

async function fetchBoardGames(): Promise<LibraryGame[]> {
  const { data, error } = await supabase
    .from('board_games')
    .select('*')
    .order('ranking_engine', { ascending: true, nullsFirst: false })

  if (error) throw error
  return (data as BoardGameRow[]).map(rowToGame)
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

type PersonalApi = ReturnType<typeof usePersonalCollection>

function StatusButtons({
  bggName,
  personal,
  variant = 'overlay',
}: {
  bggName: string
  personal: PersonalApi
  variant?: 'overlay' | 'inline'
}) {
  const entry = personal.getEntry(bggName)
  const disabled = !personal.canEdit
  const withLabel = variant === 'inline'

  return (
    <div
      className={`status-buttons ${variant}`}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className={`status-btn want ${entry.wantToPlay ? 'on' : ''}`}
        aria-pressed={entry.wantToPlay}
        aria-label="想玩"
        title="想玩"
        disabled={disabled}
        onClick={() =>
          personal.updateEntry(bggName, { wantToPlay: !entry.wantToPlay })
        }
      >
        <HeartIcon filled={entry.wantToPlay} />
        {withLabel && <span>想玩</span>}
      </button>
      <button
        type="button"
        className={`status-btn played ${entry.played ? 'on' : ''}`}
        aria-pressed={entry.played}
        aria-label="已玩"
        title="已玩"
        disabled={disabled}
        onClick={() =>
          personal.updateEntry(bggName, { played: !entry.played })
        }
      >
        <CheckIcon />
        {withLabel && <span>已玩</span>}
      </button>
    </div>
  )
}

function PlayCounter({
  bggName,
  personal,
}: {
  bggName: string
  personal: PersonalApi
}) {
  const entry = personal.getEntry(bggName)
  const disabled = !personal.canEdit

  return (
    <div className="play-counter">
      <span>玩過</span>
      <button
        type="button"
        className="play-counter-btn"
        aria-label="減少遊玩次數"
        disabled={disabled || entry.playCount <= 0}
        onClick={() =>
          personal.updateEntry(bggName, { playCount: entry.playCount - 1 })
        }
      >
        −
      </button>
      <span className="play-counter-value">{entry.playCount}</span>
      <button
        type="button"
        className="play-counter-btn"
        aria-label="增加遊玩次數"
        disabled={disabled || entry.playCount >= 999}
        onClick={() =>
          personal.updateEntry(bggName, { playCount: entry.playCount + 1 })
        }
      >
        ＋
      </button>
      <span>次</span>
    </div>
  )
}

function PersonalNote({
  value,
  disabled,
  onSave,
}: {
  value: string
  disabled: boolean
  onSave: (text: string) => void
}) {
  const [text, setText] = useState(value)

  return (
    <label className="personal-note">
      <span>我的備註（只有你看得到）</span>
      <textarea
        value={text}
        maxLength={500}
        disabled={disabled}
        placeholder="例如：想找 4 個人一起玩"
        onChange={(event) => setText(event.target.value)}
        onBlur={() => {
          if (text !== value) onSave(text)
        }}
      />
    </label>
  )
}

function Library({ boardGames }: { boardGames: LibraryGame[] }) {
  const [searchText, setSearchText] = useState('')
  const [selectedGame, setSelectedGame] = useState<BoardGame | null>(null)
  const isAdmin = useIsAdmin()
  const personal = usePersonalCollection()
  const [isMyListOpen, setIsMyListOpen] = useState(false)
  const [nowMs] = useState(() => Date.now())

  function isNewGame(game: LibraryGame): boolean {
    if (!game.createdAt) return false
    const age = nowMs - new Date(game.createdAt).getTime()
    return age < NEW_GAME_DAYS * 24 * 60 * 60 * 1000
  }
  const myListCount = boardGames.filter((game) => {
    const entry = personal.entries[game.bggName]
    return entry !== undefined && (entry.wantToPlay || entry.played)
  }).length
  const [coverVersions, setCoverVersions] = useState<Record<string, number>>({})
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [coverMessage, setCoverMessage] = useState('')

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !selectedGame) return

    const slug = selectedGame.coverSlug
    setCoverMessage('')
    setIsUploadingCover(true)

    try {
      await uploadCover(slug, file)
      setCoverVersions((current) => ({ ...current, [slug]: Date.now() }))
      setCoverMessage('封面已更新。')
    } catch (error) {
      setCoverMessage(error instanceof Error ? error.message : '上傳失敗')
    } finally {
      setIsUploadingCover(false)
    }
  }

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [minDifficulty, setMinDifficulty] = useState<NumericFilter>('')
  const [maxDifficulty, setMaxDifficulty] = useState<NumericFilter>('')
  const [bestPlayerCount, setBestPlayerCount] = useState<NumericFilter>('')
  const [recommendPlayerCount, setRecommendPlayerCount] =
    useState<NumericFilter>('')
  const [minTime, setMinTime] = useState<NumericFilter>('')
  const [maxTime, setMaxTime] = useState<NumericFilter>('')

  const [sortBy, setSortBy] = useState<SortKey>('rankingEngine')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [groupByMine, setGroupByMine] = useState(false)
  const [hiddenGroups, setHiddenGroups] = useState<MineGroup[]>([])

  const [viewMode, setViewMode] = useState<ViewMode>(loadViewMode)

  function changeViewMode(mode: ViewMode) {
    setViewMode(mode)
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode)
    } catch {
      // 儲存失敗也不影響使用
    }
  }

  const [categorySearch, setCategorySearch] = useState('')
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false)

  const categories = useMemo(
    () =>
      Array.from(new Set(boardGames.flatMap((game) => game.category))).sort(
        (a, b) => a.localeCompare(b, 'zh-Hant'),
      ),
    [],
  )

  const difficulties = useMemo(
    () =>
      Array.from(
        new Set(
          boardGames
            .map((game) => game.bggDifficulty)
            .filter((value): value is number => value != null),
        ),
      ).sort((a, b) => a - b),
    [],
  )

  const times = useMemo(
    () =>
      Array.from(
        new Set(
          boardGames
            .map((game) => game.bggTime)
            .filter((value): value is number => value != null),
        ),
      ).sort((a, b) => a - b),
    [],
  )

  const playerCounts = useMemo(
    () =>
      Array.from(
        new Set(
          boardGames.flatMap((game) => [
            ...game.bestPlayers,
            ...game.recommendPlayers,
          ]),
        ),
      ).sort((a, b) => a - b),
    [],
  )

  const filteredGames = useMemo(() => {
    const search = searchText.trim().toLocaleLowerCase()

    const filtered = boardGames.filter((game) => {
      if (
        search &&
        !game.name.toLocaleLowerCase().includes(search)
      ) {
        return false
      }

      // 多選類型使用 AND：必須同時符合所有已選類型。
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.every((category) =>
          game.category.includes(category),
        )
      ) {
        return false
      }

      if (
        minDifficulty !== '' &&
        (game.bggDifficulty == null ||
          game.bggDifficulty < minDifficulty)
      ) {
        return false
      }

      if (
        maxDifficulty !== '' &&
        (game.bggDifficulty == null ||
          game.bggDifficulty > maxDifficulty)
      ) {
        return false
      }

      if (
        bestPlayerCount !== '' &&
        !game.bestPlayers.includes(bestPlayerCount)
      ) {
        return false
      }

      if (
        recommendPlayerCount !== '' &&
        !game.recommendPlayers.includes(recommendPlayerCount)
      ) {
        return false
      }

      if (
        minTime !== '' &&
        (game.bggTime == null || game.bggTime < minTime)
      ) {
        return false
      }

      if (
        maxTime !== '' &&
        (game.bggTime == null || game.bggTime > maxTime)
      ) {
        return false
      }

      return true
    })

    const direction = sortDirection === 'asc' ? 1 : -1

    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'zh-Hant') * direction
      }

      let aValue: number | null
      let bValue: number | null

      switch (sortBy) {
        case 'bggScore':
          aValue = a.bggScore
          bValue = b.bggScore
          break
        case 'bggDifficulty':
          aValue = a.bggDifficulty
          bValue = b.bggDifficulty
          break
        case 'bggTime':
          aValue = a.bggTime
          bValue = b.bggTime
          break
        case 'bestPlayers':
          aValue = getPlayerSortValue(a.bestPlayers)
          bValue = getPlayerSortValue(b.bestPlayers)
          break
        case 'recommendPlayers':
          aValue = getPlayerSortValue(a.recommendPlayers)
          bValue = getPlayerSortValue(b.recommendPlayers)
          break
        case 'classicGameRanking':
          aValue = a.classicGameRanking
          bValue = b.classicGameRanking
          break

        case 'scoreRank':
          aValue = a.scoreRank
          bValue = b.scoreRank
          break
        case 'rankingEngine':
        default:
          aValue = a.rankingEngine
          bValue = b.rankingEngine
          break
      }

      return compareNullableNumbers(aValue, bValue, direction)
    })
  }, [
    searchText,
    selectedCategories,
    minDifficulty,
    maxDifficulty,
    bestPlayerCount,
    recommendPlayerCount,
    minTime,
    maxTime,
    sortBy,
    sortDirection,
  ])


  const displayedItems = useMemo<DisplayItem[]>(() => {
    const visibleGroups = MINE_GROUPS.filter(
      (group) => !hiddenGroups.includes(group),
    )

    if (!groupByMine) {
      return filteredGames
        .filter((game) =>
          visibleGroups.includes(getMineGroup(personal.entries[game.bggName])),
        )
        .map((game) => ({ kind: 'game' as const, game }))
    }

    const byGroup: Record<MineGroup, BoardGame[]> = {
      want: [],
      untouched: [],
      played: [],
    }
    for (const game of filteredGames) {
      byGroup[getMineGroup(personal.entries[game.bggName])].push(game)
    }

    const items: DisplayItem[] = []
    for (const group of visibleGroups) {
      if (byGroup[group].length === 0) continue
      items.push({
        kind: 'header',
        group,
        label: MINE_GROUP_LABELS[group],
        count: byGroup[group].length,
      })
      for (const game of byGroup[group]) {
        items.push({ kind: 'game', game })
      }
    }
    return items
  }, [filteredGames, personal.entries, groupByMine, hiddenGroups])

  const displayedGameCount = displayedItems.filter(
    (item) => item.kind === 'game',
  ).length

  const missingDataCount = useMemo(() => {
    const hasDifficultyFilter = minDifficulty !== '' || maxDifficulty !== ''
    const hasTimeFilter = minTime !== '' || maxTime !== ''

    if (!hasDifficultyFilter && !hasTimeFilter) return 0

    const search = searchText.trim().toLocaleLowerCase()

    return boardGames.filter((game) => {
      const isMissing =
        (hasDifficultyFilter && game.bggDifficulty == null) ||
        (hasTimeFilter && game.bggTime == null)

      if (!isMissing) return false

      if (search && !game.name.toLocaleLowerCase().includes(search)) {
        return false
      }

      if (
        selectedCategories.length > 0 &&
        !selectedCategories.every((category) =>
          game.category.includes(category),
        )
      ) {
        return false
      }

      if (
        bestPlayerCount !== '' &&
        !game.bestPlayers.includes(bestPlayerCount)
      ) {
        return false
      }

      if (
        recommendPlayerCount !== '' &&
        !game.recommendPlayers.includes(recommendPlayerCount)
      ) {
        return false
      }

      return true
    }).length
  }, [
    searchText,
    selectedCategories,
    minDifficulty,
    maxDifficulty,
    bestPlayerCount,
    recommendPlayerCount,
    minTime,
    maxTime,
  ])

  const activeFilterCount =
    selectedCategories.length +
    Number(minDifficulty !== '') +
    Number(maxDifficulty !== '') +
    Number(bestPlayerCount !== '') +
    Number(recommendPlayerCount !== '') +
    Number(minTime !== '') +
    Number(maxTime !== '') +
    Number(groupByMine) +
    hiddenGroups.length
  const subCategories = categories.filter(
    (category) => !MAIN_CATEGORIES.includes(category),
  )

  const visibleSubCategories = subCategories.filter((category) =>
    category
      .toLocaleLowerCase()
      .includes(categorySearch.trim().toLocaleLowerCase()),
  )

  const selectedSubCount = selectedCategories.filter(
    (category) => !MAIN_CATEGORIES.includes(category),
  ).length

  const showSubCategories =
    isSubCategoryOpen || categorySearch.trim() !== ''

  function toggleCategory(category: string) {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    )
  }


  function toggleMineGroup(group: MineGroup) {
    setHiddenGroups((current) =>
      current.includes(group)
        ? current.filter((item) => item !== group)
        : [...current, group],
    )
  }

  function clearFilters() {
    setSearchText('')
    setSelectedCategories([])
    setMinDifficulty('')
    setMaxDifficulty('')
    setBestPlayerCount('')
    setRecommendPlayerCount('')
    setMinTime('')
    setMaxTime('')
    setCategorySearch('')
    setGroupByMine(false)
    setHiddenGroups([])
  }

  function resetSort() {
    setSortBy('rankingEngine')
    setSortDirection('asc')
  }

  function renderNumberOptions(values: number[]) {
    return values.map((value) => (
      <option key={value} value={value}>
        {value}
      </option>
    ))
  }

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#" aria-label="桌遊規則助手首頁">
          <span className="brand-icon" aria-hidden="true">
            🎲
          </span>
          <span>桌遊規則助手</span>
        </a>
        <span className="topbar-label">BOARD GAME COMPANION</span>
        <button
          type="button"
          className="mylist-button"
          onClick={() => setIsMyListOpen(true)}
        >
          我的清單
          {myListCount > 0 && (
            <span className="mylist-count">{myListCount}</span>
          )}
        </button>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">YOUR BOARD GAME LIBRARY</p>
          <h1>
            規則不用翻半天，
            <br />
            <span>桌遊揪夥在這邊。</span>
          </h1>
          <p className="hero-description">
            收藏你的桌遊，快速找到遊戲規則。
            <br />
            未來也能直接詢問 AI，不再為規則爭論不休。
          </p>

          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="搜尋桌遊名稱，例如：璀璨寶石"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              aria-label="搜尋桌遊名稱"
            />
            <span className="search-hint">搜尋</span>
          </label>
        </section>

        <section className="library">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MY COLLECTION</p>
              <h2>我的桌遊收藏</h2>
            </div>
            <div className="heading-actions">
              <span className="game-count">
                顯示 {displayedGameCount} / {boardGames.length} 款
              </span>
              <div className="view-toggle" role="group" aria-label="檢視模式">
                <button
                  type="button"
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => changeViewMode('list')}
                  aria-label="清單檢視"
                  title="清單"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="8" y1="6" x2="20" y2="6" />
                    <line x1="8" y1="12" x2="20" y2="12" />
                    <line x1="8" y1="18" x2="20" y2="18" />
                    <circle cx="4" cy="6" r="1" fill="currentColor" />
                    <circle cx="4" cy="12" r="1" fill="currentColor" />
                    <circle cx="4" cy="18" r="1" fill="currentColor" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`view-btn ${viewMode === 'grid-4' ? 'active' : ''}`}
                  onClick={() => changeViewMode('grid-4')}
                  aria-label="一排 4 個"
                  title="一排 4 個"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <rect x="3" y="3" width="8" height="8" rx="1.5" />
                    <rect x="13" y="3" width="8" height="8" rx="1.5" />
                    <rect x="3" y="13" width="8" height="8" rx="1.5" />
                    <rect x="13" y="13" width="8" height="8" rx="1.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`view-btn ${viewMode === 'grid-9' ? 'active' : ''}`}
                  onClick={() => changeViewMode('grid-9')}
                  aria-label="一排 9 個"
                  title="一排 9 個"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <rect x="3" y="3" width="5" height="5" rx="1" />
                    <rect x="9.5" y="3" width="5" height="5" rx="1" />
                    <rect x="16" y="3" width="5" height="5" rx="1" />
                    <rect x="3" y="9.5" width="5" height="5" rx="1" />
                    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
                    <rect x="16" y="9.5" width="5" height="5" rx="1" />
                    <rect x="3" y="16" width="5" height="5" rx="1" />
                    <rect x="9.5" y="16" width="5" height="5" rx="1" />
                    <rect x="16" y="16" width="5" height="5" rx="1" />
                  </svg>
                </button>
              </div>
              <button
                className="filter-toggle-button"
                type="button"
                onClick={() => setIsFilterOpen(true)}
              >
                ☰ 篩選與排序
                {activeFilterCount > 0 && (
                  <span className="filter-badge">{activeFilterCount}</span>
                )}
              </button>
            </div>
          </div>

          {isFilterOpen && (
            <div
              className="drawer-backdrop"
              onClick={() => setIsFilterOpen(false)}
            />
          )}

          <aside className={`filter-drawer ${isFilterOpen ? 'open' : ''}`}>
            <div className="drawer-header">
              <button
                className="drawer-close"
                type="button"
                aria-label="關閉篩選"
                onClick={() => setIsFilterOpen(false)}
              >
                ×
              </button>
            </div>

            <section className="filter-panel" aria-label="桌遊篩選與排序">
              <div className="filter-heading">
                <div>
                  <p className="eyebrow">FIND YOUR GAME</p>
                  <h3>篩選與排序</h3>
                </div>
                <button
                  className="clear-button"
                  type="button"
                  onClick={clearFilters}
                  disabled={
                    searchText === '' &&
                    activeFilterCount === 0
                  }
                >
                  清除篩選
                </button>
              </div>

              <div className="filter-grid">
                <label className="filter-field">
                  <span>最低 BGG 難度</span>
                  <select
                    value={minDifficulty}
                    onChange={(event) =>
                      setMinDifficulty(
                        event.target.value === ''
                          ? ''
                          : Number(event.target.value),
                      )
                    }
                  >
                    <option value="">不限</option>
                    {renderNumberOptions(difficulties)}
                  </select>
                </label>

                <label className="filter-field">
                  <span>最高 BGG 難度</span>
                  <select
                    value={maxDifficulty}
                    onChange={(event) =>
                      setMaxDifficulty(
                        event.target.value === ''
                          ? ''
                          : Number(event.target.value),
                      )
                    }
                  >
                    <option value="">不限</option>
                    {renderNumberOptions(difficulties)}
                  </select>
                </label>

                <label className="filter-field">
                  <span>最佳人數</span>
                  <select
                    value={bestPlayerCount}
                    onChange={(event) =>
                      setBestPlayerCount(
                        event.target.value === ''
                          ? ''
                          : Number(event.target.value),
                      )
                    }
                  >
                    <option value="">不限</option>
                    {renderNumberOptions(playerCounts)}
                  </select>
                </label>

                <label className="filter-field">
                  <span>推薦人數</span>
                  <select
                    value={recommendPlayerCount}
                    onChange={(event) =>
                      setRecommendPlayerCount(
                        event.target.value === ''
                          ? ''
                          : Number(event.target.value),
                      )
                    }
                  >
                    <option value="">不限</option>
                    {renderNumberOptions(playerCounts)}
                  </select>
                </label>

                <label className="filter-field">
                  <span>最短遊戲時間（分鐘）</span>
                  <select
                    value={minTime}
                    onChange={(event) =>
                      setMinTime(
                        event.target.value === ''
                          ? ''
                          : Number(event.target.value),
                      )
                    }
                  >
                    <option value="">不限</option>
                    {renderNumberOptions(times)}
                  </select>
                </label>

                <label className="filter-field">
                  <span>最長遊戲時間（分鐘）</span>
                  <select
                    value={maxTime}
                    onChange={(event) =>
                      setMaxTime(
                        event.target.value === ''
                          ? ''
                          : Number(event.target.value),
                      )
                    }
                  >
                    <option value="">不限</option>
                    {renderNumberOptions(times)}
                  </select>
                </label>
              </div>

              <div className="category-filter">
                <div className="category-heading">
                  <span>桌遊類型</span>
                  <span className="category-hint">
                    可複選，需同時符合所有已選類型
                  </span>
                </div>

                <div className="category-main-options">
                  {MAIN_CATEGORIES.filter((category) =>
                    categories.includes(category),
                  ).map((category) => (
                    <label
                      className={`category-chip ${selectedCategories.includes(category) ? 'selected' : ''
                        }`}
                      key={category}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>

                <button
                  className="category-sub-toggle"
                  type="button"
                  onClick={() => setIsSubCategoryOpen((current) => !current)}
                >
                  {showSubCategories ? '▾' : '▸'} 更多類型（
                  {subCategories.length}）
                  {selectedSubCount > 0 && ` · 已選 ${selectedSubCount}`}
                </button>

                {showSubCategories && (
                  <>
                    <input
                      className="category-search"
                      type="search"
                      placeholder="搜尋類型，例如：區控"
                      value={categorySearch}
                      onChange={(event) =>
                        setCategorySearch(event.target.value)
                      }
                      aria-label="搜尋桌遊類型"
                    />

                    <div className="category-options">
                      {visibleSubCategories.map((category) => (
                        <label className="category-option" key={category}>
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                          />
                          <span>{category}</span>
                        </label>
                      ))}
                      {visibleSubCategories.length === 0 && (
                        <p className="category-empty">找不到符合的類型</p>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="mine-filter">
                <div className="category-heading">
                  <span>我的紀錄</span>
                  <span className="category-hint">
                    按眼睛可隱藏該類遊戲
                  </span>
                </div>

                <div className="mine-eyes">
                  {MINE_GROUPS.map((group) => {
                    const hidden = hiddenGroups.includes(group)
                    return (
                      <button
                        key={group}
                        type="button"
                        className={`mine-eye ${hidden ? 'hidden' : ''}`}
                        aria-pressed={!hidden}
                        onClick={() => toggleMineGroup(group)}
                      >
                        <span aria-hidden="true">👁</span>
                        {MINE_GROUP_LABELS[group]}
                      </button>
                    )
                  })}
                </div>

                <label className="category-option">
                  <input
                    type="checkbox"
                    checked={groupByMine}
                    onChange={(event) => setGroupByMine(event.target.checked)}
                  />
                  <span>依我的紀錄分區顯示</span>
                </label>
                <p className="mine-note">
                  想玩的遊戲就算也玩過，仍歸在「想玩」區。
                </p>
              </div>
              <div className="sort-row">
                <label className="filter-field sort-field">
                  <span>排序依據</span>
                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value as SortKey)
                    }
                  >
                    <option value="rankingEngine">Ranking engine</option>
                    <option value="classicGameRanking">常玩遊戲排名</option>
                    <option value="scoreRank">綜合分數排名</option>
                    <option value="name">桌遊名稱</option>
                    <option value="bggScore">BGG 分數</option>
                    <option value="bggDifficulty">BGG 難度</option>
                    <option value="bggTime">遊戲時間</option>
                    <option value="bestPlayers">最佳人數</option>
                    <option value="recommendPlayers">推薦人數</option>
                  </select>
                </label>

                <button
                  className="sort-direction-button"
                  type="button"
                  onClick={() =>
                    setSortDirection((current) =>
                      current === 'asc' ? 'desc' : 'asc',
                    )
                  }
                  aria-label={
                    sortDirection === 'asc' ? '切換為降冪排序' : '切換為升冪排序'
                  }
                >
                  {sortDirection === 'asc' ? '↑ 升冪' : '↓ 降冪'}
                </button>
                <button
                  className="sort-direction-button"
                  type="button"
                  onClick={resetSort}
                  disabled={
                    sortBy === 'rankingEngine' && sortDirection === 'asc'
                  }
                >
                  重設排序
                </button>
              </div>
            </section>

            <button
              className="rule-button drawer-done"
              type="button"
              onClick={() => setIsFilterOpen(false)}
            >
              查看 {displayedGameCount} 款結果
            </button>
          </aside>

          <p className="status-legend">
            <span>
              <HeartIcon filled={false} /> 想玩
            </span>
            <span>
              <CheckIcon /> 已玩
            </span>
            <span className="status-legend-tip">
              點封面右下角的圖示即可標記；登入後可跨裝置保存
            </span>
          </p>
          {missingDataCount > 0 && (
            <p className="missing-data-note">
              有 {missingDataCount} 款因缺少難度或時間資料，未納入篩選結果。
            </p>
          )}
          {displayedGameCount > 0 ? (
            <div className={`game-grid view-${viewMode}`}>
              {displayedItems.map((item) => {
                if (item.kind === 'header') {
                  return (
                    <div
                      className="mine-group-heading"
                      key={`group-${item.group}`}
                    >
                      {item.label}（{item.count}）
                    </div>
                  )
                }
                const game = item.game
                return (
                  <article
                    className={`game-card ${isNewGame(game) ? 'is-new' : ''}`}
                    key={game.id}
                  >
                    <div className={`game-art game-art-${game.id}`}>
                      <CoverImage
                        key={`${game.coverSlug}-${coverVersions[game.coverSlug] ?? 0}`}
                        version={coverVersions[game.coverSlug] ?? 0}
                        slug={game.coverSlug}
                        alt={game.name}
                        className="cover-image"
                        fallback={
                          <span className="game-emoji" aria-hidden="true">
                            🎲
                          </span>
                        }
                      />
                      <StatusButtons
                        bggName={game.bggName}
                        personal={personal}
                      />
                      {isNewGame(game) && (
                        <span className="new-badge">NEW</span>
                      )}
                      <span className="game-category">
                        {game.category.length > 0
                          ? game.category.join('、')
                          : '尚未分類'}
                      </span>
                    </div>

                    <div className="game-info">
                      <h3>{game.name}</h3>

                      <div className="game-rankings">
                        <p className="game-ranking-engine">
                          Ranking engine：{formatNumber(game.rankingEngine)}
                        </p>

                        <p className="game-score-rank">
                          綜合分數排名：{formatNumber(game.scoreRank)}
                        </p>
                      </div>

                      <div className="game-meta">
                        <span>
                          最佳人數：{formatPlayers(game.bestPlayers)}
                        </span>
                        <span>
                          推薦人數：{formatPlayers(game.recommendPlayers)}
                        </span>
                        <span>
                          ◷ {game.bggTime == null ? '未提供時間' : `${game.bggTime} 分鐘`}
                        </span>
                        <span>
                          📊 BGG 難度：{formatNumber(game.bggDifficulty)}
                        </span>
                      </div>

                      <button
                        className="rule-button"
                        type="button"
                        onClick={() => {
                          setCoverMessage('')
                          setSelectedGame(game)
                        }}
                      >
                        查看規則 <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <span aria-hidden="true">🔎</span>
              <h3>找不到符合條件的桌遊</h3>
              <p>試著調整篩選條件，或清除篩選重新尋找。</p>
              <button
                className="rule-button empty-reset-button"
                type="button"
                onClick={clearFilters}
              >
                清除搜尋與篩選
              </button>
            </div>
          )}
        </section>

        <section className="assistant-banner">
          <div className="assistant-icon" aria-hidden="true">
            ✦
          </div>
          <div className="assistant-copy">
            <p className="eyebrow">COMING NEXT</p>
            <h2>你的桌遊規則 AI 助手</h2>
            <p>未來可以上傳規則書 PDF，直接用中文詢問遊戲規則。</p>
          </div>
          <span className="coming-soon">開發中</span>
        </section>
      </main>

      <footer className="footer">
        <span>桌遊規則助手</span>
        <span>讓每一場遊戲，都玩得更盡興。</span>
        <AdminPanel />
        <PlayerPanel />
      </footer>

      {selectedGame && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedGame(null)}
        >
          <section
            className="game-modal compact"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-topbar">
              {selectedGame.links.bgg && (
                <a
                  className="bgg-link"
                  href={selectedGame.links.bgg}
                  target="_blank"
                  rel="noreferrer"
                >
                  BGG ↗
                </a>
              )}
              <button
                className="modal-close"
                type="button"
                aria-label="關閉"
                onClick={() => setSelectedGame(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-head">
              <CoverImage
                key={`${selectedGame.coverSlug}-${coverVersions[selectedGame.coverSlug] ?? 0}`}
                version={coverVersions[selectedGame.coverSlug] ?? 0}
                slug={selectedGame.coverSlug}
                alt={selectedGame.name}
                className="modal-cover"
                fallback={
                  <div className="modal-game-icon" aria-hidden="true">
                    🎲
                  </div>
                }
              />
              <div className="modal-head-info">
                <p className="eyebrow">BGG SCORE</p>
                <div className="modal-score">
                  {selectedGame.bggScore == null
                    ? '尚無 BGG 分數'
                    : selectedGame.bggScore}
                </div>
                <h2 id="modal-title">{selectedGame.name}</h2>
                {selectedGame.category.length > 0 && (
                  <div className="modal-categories">
                    {selectedGame.category.map((category) => (
                      <span className="modal-category" key={category}>
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="cover-upload">
                <label className="admin-link" style={{ cursor: 'pointer' }}>
                  {isUploadingCover ? '上傳中…' : '上傳／更換封面'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={isUploadingCover}
                    onChange={handleCoverUpload}
                  />
                </label>
                {coverMessage && <p>{coverMessage}</p>}
              </div>
            )}

            <div className="rating-list">
              <div className="rating-item">
                <span className="rating-label">快速性</span>
                <span className="rating-content">
                  {selectedGame.speedEmoji || '未提供'}
                </span>
              </div>
              <div className="rating-item">
                <span className="rating-label">變化度</span>
                <span className="rating-content">
                  {selectedGame.changeEmoji || '未提供'}
                </span>
              </div>
              <div className="rating-item">
                <span className="rating-label">溝通度</span>
                <span className="rating-content">
                  {selectedGame.communicationEmoji || '未提供'}
                </span>
              </div>
              <div className="rating-item">
                <span className="rating-label">影響度</span>
                <span className="rating-content">
                  {selectedGame.playerImpactEmoji || '未提供'}
                </span>
              </div>
              <div className="rating-item">
                <span className="rating-label">獨特性</span>
                <span className="rating-content">
                  {selectedGame.uniqueEmoji || '未提供'}
                </span>
              </div>
              <div className="rating-item">
                <span className="rating-label">複雜度</span>
                <span className="rating-content">
                  {selectedGame.complexityEmoji || '未提供'}
                </span>
              </div>
            </div>

            <div className="personal-box">
              <div className="personal-actions">
                <StatusButtons
                  bggName={selectedGame.bggName}
                  personal={personal}
                  variant="inline"
                />
                <PlayCounter
                  bggName={selectedGame.bggName}
                  personal={personal}
                />
              </div>
              <PersonalNote
                key={`${selectedGame.bggName}-${personal.status}`}
                value={personal.getEntry(selectedGame.bggName).note}
                disabled={!personal.canEdit}
                onSave={(text) =>
                  personal.updateEntry(selectedGame.bggName, { note: text })
                }
              />
              {!personal.isLoggedIn && (
                <p className="personal-hint">
                  目前存在這個瀏覽器；用 Google 登入後可跨裝置保存。
                </p>
              )}
            </div>

            <GameDocuments
              key={selectedGame.bggName}
              bggName={selectedGame.bggName}
              isAdmin={isAdmin}
            />

            <p className="modal-dev-note">
              規則查詢功能開發中，之後會加入規則書搜尋與頁碼。
            </p>
          </section>
        </div>
      )}
      
      <MyList
        boardGames={boardGames}
        personal={personal}
        isOpen={isMyListOpen}
        onClose={() => setIsMyListOpen(false)}
        onOpenGame={(game) => {
          setCoverMessage('')
          setSelectedGame(game)
          setIsMyListOpen(false)
        }}
        renderCover={(game) => (
          <CoverImage
            key={`${game.coverSlug}-${coverVersions[game.coverSlug] ?? 0}`}
            version={coverVersions[game.coverSlug] ?? 0}
            slug={game.coverSlug}
            alt={game.name}
            className="mylist-cover"
            fallback={<span aria-hidden="true">🎲</span>}
          />
        )}
      />
      {personal.needsMerge && (
        <div className="modal-backdrop">
          <section
            className="admin-modal"
            role="dialog"
            aria-modal="true"
          >
            <h2>要把這台電腦的紀錄加進你的帳號嗎？</h2>
            <p>
              這個瀏覽器有 {personal.localCount} 筆訪客紀錄（想玩／已玩／備註）。
              加入後會和你帳號裡的紀錄合併，不會取消你已經勾選的項目。
            </p>
            <p>如果這是共用電腦，這些紀錄可能不是你的，請選「不加入」。</p>

            {personal.errorMessage && (
              <p className="admin-error">{personal.errorMessage}</p>
            )}

            <button
              className="rule-button"
              type="button"
              disabled={personal.mergeStatus === 'merging'}
              onClick={() => void personal.mergeLocalIntoCloud()}
            >
              {personal.mergeStatus === 'merging'
                ? '同步中…'
                : personal.mergeStatus === 'error'
                  ? '重試'
                  : '加入我的帳號'}
            </button>
            <button
              className="admin-cancel"
              type="button"
              disabled={personal.mergeStatus === 'merging'}
              onClick={personal.declineMerge}
            >
              不加入
            </button>
          </section>
        </div>
      )}

      {personal.errorMessage && !personal.needsMerge && (
        <div className="personal-toast" role="alert">
          <span>{personal.errorMessage}</span>
          {personal.status === 'error' && (
            <button type="button" onClick={personal.reload}>
              重試
            </button>
          )}
          <button type="button" onClick={personal.clearError}>
            關閉
          </button>
        </div>
      )}
    </div>
  )
}

function App() {
  const [games, setGames] = useState<LibraryGame[] | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchBoardGames()
      .then((data) => {
        if (!cancelled) setGames(data.length > 0 ? data : fallbackGames)
      })
      .catch((error) => {
        console.error('讀取 Supabase 失敗，改用本機資料：', error)
        if (!cancelled) setGames(fallbackGames)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (games === null) {
    return (
      <div className="app">
        <p style={{ padding: '80px 20px', textAlign: 'center' }}>
          載入桌遊中…
        </p>
      </div>
    )
  }

  return <Library boardGames={games} />
}
export default App