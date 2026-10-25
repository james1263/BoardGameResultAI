import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react'
import './App.css'
import {
  boardGames as fallbackGames,
} from './data/boardGames.generated'
import AdminPanel from './AdminPanel'
import MyList from './MyList'
import { useIsAdmin } from './lib/useIsAdmin'
import { uploadCover } from './lib/uploadCover'
import { usePersonalCollection } from './lib/usePersonalCollection'
import { useGamePlaySessions } from './lib/useGamePlaySessions'
import { useGameRatings } from './lib/useGameRatings'
import { useCommunityStats } from './lib/useCommunityStats'
import { fetchBoardGames } from './lib/fetchBoardGames'
import {
  type LibraryGame,
  type SortKey,
  type NumericFilter,
  type ViewMode,
  type MineGroup,
  type DisplayItem,
  VIEW_MODE_STORAGE_KEY,
  loadViewMode,
  NEW_GAME_DAYS,
  MINE_GROUPS,
  MINE_GROUP_LABELS,
  getMineGroup,
} from './lib/libraryTypes'
import { getPlayerSortValue, compareNullableNumbers } from './lib/gameFormat'
import { HeartIcon, CheckIcon } from './components/Icons'
import CoverImage from './components/CoverImage'
import TopBar from './components/TopBar'
import ViewToggle from './components/ViewToggle'
import FilterDrawer from './components/FilterDrawer'
import GameCard from './components/GameCard'
import GameModal from './components/GameModal'
import MergeDialog from './components/MergeDialog'
import PersonalToast from './components/PersonalToast'
import TrashSection from './components/TrashSection'
import BackToTop from './components/BackToTop'
import { useTrashActions } from './lib/useTrashActions'
import { updateDescription } from './lib/saveDescription'

function Library({
  allGames,
  onGamesChange,
}: {
  allGames: LibraryGame[]
  onGamesChange: (updater: (games: LibraryGame[]) => LibraryGame[]) => void
}) {
  const boardGames = useMemo(
    () => allGames.filter((game) => !game.removedAt),
    [allGames],
  )
  const trashedGames = useMemo(
    () => allGames.filter((game) => game.removedAt),
    [allGames],
  )
  const trash = useTrashActions(allGames, onGamesChange)
  const [searchText, setSearchText] = useState('')
  const [selectedGame, setSelectedGame] = useState<LibraryGame | null>(null)
  const isAdmin = useIsAdmin()
  const personal = usePersonalCollection()
  const playSessions = useGamePlaySessions()
  const ratings = useGameRatings()
  const communityStats = useCommunityStats()
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

  function openGame(game: LibraryGame) {
    setCoverMessage('')
    setSelectedGame(game)
  }

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
    [boardGames],
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
    [boardGames],
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
    [boardGames],
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
    [boardGames],
  )

  const filteredGames = useMemo(() => {
    const search = searchText.trim().toLocaleLowerCase()

    const filtered = boardGames.filter((game) => {
      if (search && !game.name.toLocaleLowerCase().includes(search)) {
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
        (game.bggDifficulty == null || game.bggDifficulty < minDifficulty)
      ) {
        return false
      }

      if (
        maxDifficulty !== '' &&
        (game.bggDifficulty == null || game.bggDifficulty > maxDifficulty)
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

      if (minTime !== '' && (game.bggTime == null || game.bggTime < minTime)) {
        return false
      }

      if (maxTime !== '' && (game.bggTime == null || game.bggTime > maxTime)) {
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
    boardGames,
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

    const byGroup: Record<MineGroup, LibraryGame[]> = {
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
    boardGames,
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

  return (
    <div className="app">
      <TopBar
        myListCount={myListCount}
        onOpenMyList={() => setIsMyListOpen(true)}
      />

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
              <ViewToggle viewMode={viewMode} onChange={changeViewMode} />
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

          <FilterDrawer
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            displayedGameCount={displayedGameCount}
            clearDisabled={searchText === '' && activeFilterCount === 0}
            onClear={clearFilters}
            difficulties={difficulties}
            times={times}
            playerCounts={playerCounts}
            categories={categories}
            minDifficulty={minDifficulty}
            setMinDifficulty={setMinDifficulty}
            maxDifficulty={maxDifficulty}
            setMaxDifficulty={setMaxDifficulty}
            bestPlayerCount={bestPlayerCount}
            setBestPlayerCount={setBestPlayerCount}
            recommendPlayerCount={recommendPlayerCount}
            setRecommendPlayerCount={setRecommendPlayerCount}
            minTime={minTime}
            setMinTime={setMinTime}
            maxTime={maxTime}
            setMaxTime={setMaxTime}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            categorySearch={categorySearch}
            setCategorySearch={setCategorySearch}
            isSubCategoryOpen={isSubCategoryOpen}
            setIsSubCategoryOpen={setIsSubCategoryOpen}
            hiddenGroups={hiddenGroups}
            toggleMineGroup={toggleMineGroup}
            groupByMine={groupByMine}
            setGroupByMine={setGroupByMine}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            resetSort={resetSort}
          />

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
                return (
                  <GameCard
                    key={item.game.id}
                    game={item.game}
                    isNew={isNewGame(item.game)}
                    coverVersion={coverVersions[item.game.coverSlug] ?? 0}
                    personal={personal}
                    onOpen={openGame}
                  />
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

        <TrashSection
          games={trashedGames}
          isAdmin={isAdmin}
          coverVersions={coverVersions}
          busyName={trash.busyName}
          onRestore={trash.restoreGame}
          onDelete={trash.deleteForever}
          onEditReason={trash.editReason}
        />
      </main>

      <footer className="footer">
        <span>桌遊規則助手</span>
        <span>讓每一場遊戲，都玩得更盡興。</span>
        <AdminPanel />
      </footer>

      {selectedGame && (
        <GameModal
          game={selectedGame}
          coverVersion={coverVersions[selectedGame.coverSlug] ?? 0}
          isAdmin={isAdmin}
          personal={personal}
          playSessions={playSessions}
          ratings={ratings}
          communityStats={communityStats}
          isUploadingCover={isUploadingCover}
          coverMessage={coverMessage}
          onCoverUpload={handleCoverUpload}
          onSaveDescription={async (text) => {
            const clean = text.trim()
            if (!(await updateDescription(selectedGame.bggName, clean))) {
              return false
            }
            onGamesChange((current) =>
              current.map((item) =>
                item.bggName === selectedGame.bggName
                  ? { ...item, description: clean }
                  : item,
              ),
            )
            setSelectedGame((current) =>
              current && current.bggName === selectedGame.bggName
                ? { ...current, description: clean }
                : current,
            )
            return true
          }}
          isTrashing={trash.busyName === selectedGame.bggName}
          onTrash={async () => {
            if (await trash.trashGame(selectedGame)) setSelectedGame(null)
          }}
          onClose={() => setSelectedGame(null)}
        />
      )}

      <MyList
        boardGames={boardGames}
        personal={personal}
        playSessions={playSessions}
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

      <BackToTop />
      {personal.needsMerge && <MergeDialog personal={personal} />}

      {personal.errorMessage && !personal.needsMerge && (
        <PersonalToast personal={personal} />
      )}
    </div>
  )
}

function App() {
  const [games, setGames] = useState<LibraryGame[] | null>(null)

  const updateGames = useCallback(
    (updater: (current: LibraryGame[]) => LibraryGame[]) => {
      setGames((current) => (current ? updater(current) : current))
    },
    [],
  )

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

  return <Library allGames={games} onGamesChange={updateGames} />
}

export default App
