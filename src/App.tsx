import CategoryChips from './components/CategoryChips'
import SortControl from './components/SortControl'
import RulebookPage from './components/RulebookPage'
import {
  useCallback,
  useRef,
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
import MyList, { type MyListMode } from './MyList'
import Leaderboard from './components/Leaderboard'
import { useIsAdmin } from './lib/useIsAdmin'
import { uploadCover } from './lib/uploadCover'
import { usePersonalCollection } from './lib/usePersonalCollection'
import { useGamePlaySessions } from './lib/useGamePlaySessions'
import { useGameRatings } from './lib/useGameRatings'
import { useCommunityStats } from './lib/useCommunityStats'
import { useInviteLink } from './lib/useInviteLink'
import { useCheckinLink } from './lib/useCheckinLink'
import { useTodayTask } from './lib/useTodayTask'
import { useSession } from './lib/useSession'
import { VIP_CHANGED_EVENT, useVip } from './lib/useVip'
import { useGamePeople, useAdminRatings } from './lib/useGamePeople'
import InAppBrowserNotice from './components/InAppBrowserNotice'
import CheckInDialog from './components/CheckInDialog'
import { fetchBoardGames } from './lib/fetchBoardGames'
import {
  type LibraryGame,
  type SortKey,
  type NumericFilter,
  type ViewMode,
  type MineGroup,
  type DisplayItem,
  type DifficultyLevel,
  type RatingFilter,
  getDifficultyLevel,
  getGroupRange,
  fitsGroupRange,
  isNewGameAt,
  VIEW_MODE_STORAGE_KEY,
  loadViewMode,
  NEW_GAME_DAYS,
  MINE_GROUPS,
  MINE_GROUP_LABELS,
  getMineGroup,
  computeAdminScores,
} from './lib/libraryTypes'
import { getPlayerSortValue, compareNullableNumbers } from './lib/gameFormat'
import { HeartIcon, CheckIcon } from './components/Icons'
import CoverImage from './components/CoverImage'
import TopBar, { type NavPage } from './components/TopBar'
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
  const adminScores = useMemo(() => computeAdminScores(boardGames), [boardGames])
  const [searchText, setSearchText] = useState('')
  const [selectedGame, setSelectedGame] = useState<LibraryGame | null>(null)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'ratings' | 'mine' | 'rules'>('overview')
  const isAdmin = useIsAdmin()
  const personal = usePersonalCollection()
  const playSessions = useGamePlaySessions()
  const ratings = useGameRatings()
  const session = useSession()
  const canFilterByRating = !!session && ratings.status === 'ready'
  const communityStats = useCommunityStats()
  const todayTask = useTodayTask(ratings)
  const vip = useVip()
  const people = useGamePeople(vip.isVip)
  const adminRatings = useAdminRatings(isAdmin)
  // 導覽列的頁面一次只開一個：點另一顆直接取代，再點同一顆就關閉
  const [activePage, setActivePage] = useState<NavPage | null>(null)
  const [myListMode, setMyListMode] = useState<MyListMode>('list')
  const isMyListOpen = activePage === 'mylist' || activePage === 'loyalty'
  const isLeaderboardOpen = activePage === 'leaderboard'
  const isRulesOpen = activePage === 'rules'
  // 管理者傳的集點卡連結：登入後自動打開自己的集點卡
  const {
    pending: invitePending,
    focusDate: inviteDate,
    isLoggedIn: inviteLoggedIn,
    consume: consumeInvite,
    login: inviteLogin,
  } = useInviteLink()
  const [inviteKey, setInviteKey] = useState(0)
  const [inviteFocus, setInviteFocus] = useState<string | null>(null)

  useEffect(() => {
    if (!invitePending || !inviteLoggedIn) return
    setInviteFocus(inviteDate)
    setInviteKey((count) => count + 1)
    setMyListMode('loyalty')
    setActivePage('loyalty')
    consumeInvite()
  }, [invitePending, inviteLoggedIn, inviteDate, consumeInvite])

  // 管理者傳的報到連結：登入後按「我來了」就列入出席名單
  const {
    token: checkinToken,
    isLoggedIn: checkinLoggedIn,
    clear: clearCheckin,
    login: checkinLogin,
  } = useCheckinLink()

  function handleCheckedIn(date: string | null) {
    clearCheckin()
    if (!date) return
    setInviteFocus(date)
    setInviteKey((count) => count + 1)
    setMyListMode('loyalty')
    setActivePage('loyalty')
  }
  const hadCheckinRef = useRef(false)
  useEffect(() => {
    if (checkinToken) {
      hadCheckinRef.current = true
      return
    }
    if (hadCheckinRef.current) {
      hadCheckinRef.current = false
      window.dispatchEvent(new Event(VIP_CHANGED_EVENT))
    }
  }, [checkinToken])
  // 剛評完分的遊戲自動算「已玩」（資料庫已先標好，這裡讓畫面即時更新）
  const ratedBeforeRef = useRef<Set<string> | null>(null)
  useEffect(() => {
    if (ratings.status !== 'ready') {
      ratedBeforeRef.current = null
      return
    }
    const rated = new Set(
      boardGames
        .filter((game) => ratings.getMine(game.bggName) !== null)
        .map((game) => game.bggName),
    )
    const before = ratedBeforeRef.current
    ratedBeforeRef.current = rated
    if (before === null || personal.status !== 'ready') return
    for (const name of rated) {
      if (!before.has(name) && !personal.getEntry(name).played) {
        personal.updateEntry(name, { played: true }, { skipPlayedRule: true })
      }
    }
  }, [
    ratings.status,
    ratings.getMine,
    boardGames,
    personal.status,
    personal.getEntry,
    personal.updateEntry,
  ])

  // 頂端導覽「集點卡」：直接打開我的桌遊的集點卡分頁
  function openMyLoyalty() {
    setInviteFocus(null)
    setInviteKey((count) => count + 1)
    setMyListMode('loyalty')
    setActivePage('loyalty')
  }

  // 底部／頂端導覽：點另一顆直接取代目前的頁面，再點同一顆＝關閉
  function goPage(page: NavPage) {
    if (activePage === page) {
      setActivePage(null)
      return
    }
    if (page === 'loyalty') {
      openMyLoyalty()
      return
    }
    if (page === 'mylist') {
      setInviteFocus(null)
      setInviteKey((count) => count + 1)
      setMyListMode('list')
    }
    setActivePage(page)
  }
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
  const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>(
    [],
  )
  const [groupSize, setGroupSize] = useState<NumericFilter>('')
  const [groupSizeMax, setGroupSizeMax] = useState<NumericFilter>('')
  const [bestPlayerCount, setBestPlayerCount] = useState<NumericFilter>('')
  const [recommendPlayerCount, setRecommendPlayerCount] =
    useState<NumericFilter>('')
  const [timeLimit, setTimeLimit] = useState<NumericFilter>('')
  const [onlyNew, setOnlyNew] = useState(false)
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all')
  // 登出或評分還沒讀完時，評分狀態篩選不生效
  const ratingFilterActive = ratingFilter !== 'all' && canFilterByRating

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

  // 「我們有幾個人」下拉選單：從所有遊戲的人數下限到上限（最多 12 人）
  const groupSizes = useMemo(() => {
    const mins = boardGames
      .map((game) => game.minPlayers)
      .filter((value): value is number => value != null)
    const maxs = boardGames
      .map((game) => game.maxPlayers)
      .filter((value): value is number => value != null)
    if (mins.length === 0 || maxs.length === 0) return []
    const low = Math.min(...mins)
    const high = Math.min(Math.max(...maxs), 12)
    if (high < low) return []
    return Array.from({ length: high - low + 1 }, (_, index) => low + index)
  }, [boardGames])

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
  const groupRange = useMemo(
    () => getGroupRange(groupSize, groupSizeMax),
    [groupSize, groupSizeMax],
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

      if (difficultyLevels.length > 0) {
        const level = getDifficultyLevel(game.bggDifficulty)
        if (level === null || !difficultyLevels.includes(level)) return false
      }

      if (!fitsGroupRange(game, groupRange)) {
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
        timeLimit !== '' &&
        (game.bggTime == null || game.bggTime > timeLimit)
      ) {
        return false
      }

      if (onlyNew && !isNewGameAt(game.createdAt, nowMs)) {
        return false
      }

      if (ratingFilterActive) {
        const rated = ratings.getMine(game.bggName) !== null
        if (ratingFilter === 'rated' ? !rated : rated) return false
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
    difficultyLevels,
    groupRange,
    bestPlayerCount,
    recommendPlayerCount,
    timeLimit,
    onlyNew,
    nowMs,
    ratingFilter,
    ratingFilterActive,
    ratings.getMine,
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
    const hasDifficultyFilter = difficultyLevels.length > 0
    const hasTimeFilter = timeLimit !== ''

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

      if (!fitsGroupRange(game, groupRange)) {
        return false
      }

      if (onlyNew && !isNewGameAt(game.createdAt, nowMs)) {
        return false
      }

      if (ratingFilterActive) {
        const rated = ratings.getMine(game.bggName) !== null
        if (ratingFilter === 'rated' ? !rated : rated) return false
      }

      return true
    }).length
  }, [
    searchText,
    selectedCategories,
    difficultyLevels,
    groupRange,
    bestPlayerCount,
    recommendPlayerCount,
    timeLimit,
    onlyNew,
    nowMs,
    ratingFilter,
    ratingFilterActive,
    ratings.getMine,
    boardGames,
  ])

  const activeFilterCount =
    selectedCategories.length +
    difficultyLevels.length +
    Number(groupRange !== null) + +
    Number(bestPlayerCount !== '') +
    Number(recommendPlayerCount !== '') +
    Number(timeLimit !== '') +
    Number(onlyNew) +
    Number(ratingFilterActive) +
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

  function toggleDifficultyLevel(level: DifficultyLevel) {
    setDifficultyLevels((current) =>
      current.includes(level)
        ? current.filter((item) => item !== level)
        : [...current, level],
    )
  }

  function clearFilters() {
    setSearchText('')
    setSelectedCategories([])
    setDifficultyLevels([])
    setGroupSize('')
    setGroupSizeMax('')
    setBestPlayerCount('')
    setRecommendPlayerCount('')
    setTimeLimit('')
    setOnlyNew(false)
    setRatingFilter('all')
    setGroupByMine(false)
    setHiddenGroups([])
  }

  function resetSort() {
    setSortBy('rankingEngine')
    setSortDirection('asc')
  }

  return (
    <div className="app">
      {invitePending && !inviteLoggedIn && (
        <div className="invite-banner">
          <span>你收到了集點卡連結，登入後會直接打開你的集點卡。</span>
          <button
            type="button"
            className="invite-banner-btn"
            onClick={() => void inviteLogin()}
          >
            用 Google 登入
          </button>
        </div>
      )}
      {checkinToken && !checkinLoggedIn && (
        <div className="invite-banner">
          <span>你收到了聚會報到連結，請先用 Google 登入，登入後會自動幫你報到。</span>
          <button
            type="button"
            className="invite-banner-btn"
            onClick={() => void checkinLogin()}
          >
            用 Google 登入
          </button>
        </div>
      )}
      {checkinToken && checkinLoggedIn && (
        <CheckInDialog
          token={checkinToken}
          boardGames={boardGames}
          ratings={ratings}
          onRate={(game) => {
            setCoverMessage('')
            setSelectedTab('ratings')
            setSelectedGame(game)
          }}
          onDone={handleCheckedIn}
          onClose={clearCheckin}
        />
      )}
      <InAppBrowserNotice />
      <TopBar
        myListCount={myListCount}
        activePage={activePage}
        onGoPage={goPage}
        onGoHome={() => setActivePage(null)}
        loyaltyAlert={todayTask.pending}
        canUseRules={vip.isVip || isAdmin}
        onCloseAdmin={() => setActivePage(null)}
      />

      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">YOUR BOARD GAME LIBRARY</p>
              <h1>
                今天，想玩<span>哪一款？</span>
              </h1>
            </div>
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
          </div>
          <CategoryChips
            games={boardGames}
            selected={selectedCategories}
            onToggle={toggleCategory}
            onClear={() => setSelectedCategories([])}
            resultCount={displayedGameCount}
          />
        </section>

        <section className="library">
          <div className="section-heading">
            <div className="heading-actions">
              <span className="game-count">
                顯示 {displayedGameCount} / {boardGames.length} 款
              </span>
              <SortControl
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortDirection={sortDirection}
                onToggleDirection={() =>
                  setSortDirection((current) =>
                    current === 'asc' ? 'desc' : 'asc',
                  )
                }
                onReset={resetSort}
              />
              <ViewToggle viewMode={viewMode} onChange={changeViewMode} />
              <button
                className="filter-toggle-button"
                type="button"
                onClick={() => setIsFilterOpen(true)}
              >
                ☰ 更多篩選
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
            playerCounts={playerCounts}
            groupSizes={groupSizes}
            groupSize={groupSize}
            setGroupSize={setGroupSize}
            groupSizeMax={groupSizeMax}
            setGroupSizeMax={setGroupSizeMax}
            bestPlayerCount={bestPlayerCount}
            setBestPlayerCount={setBestPlayerCount}
            recommendPlayerCount={recommendPlayerCount}
            setRecommendPlayerCount={setRecommendPlayerCount}
            timeLimit={timeLimit}
            setTimeLimit={setTimeLimit}
            difficultyLevels={difficultyLevels}
            toggleDifficultyLevel={toggleDifficultyLevel}
            onlyNew={onlyNew}
            setOnlyNew={setOnlyNew}
            ratingFilter={ratingFilter}
            setRatingFilter={setRatingFilter}
            canFilterByRating={canFilterByRating}
            hiddenGroups={hiddenGroups}
            toggleMineGroup={toggleMineGroup}
            groupByMine={groupByMine}
            setGroupByMine={setGroupByMine}
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
          initialTab={selectedTab}
          isAdmin={isAdmin}
          adminScores={adminScores.get(selectedGame.bggName) ?? null}
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
          onClose={() => {
            setSelectedGame(null)
            setSelectedTab('overview')
          }}
        />
      )}

      <MyList
        key={inviteKey}
        mode={myListMode}
        todayPending={todayTask.pending}
        onOpenLoyalty={openMyLoyalty}
        isAdmin={isAdmin}
        isVip={vip.isVip}
        onBrowse={() => {
          setActivePage(null)
          window.setTimeout(() => {
            document
              .querySelector('.library')
              ?.scrollIntoView({ behavior: 'smooth' })
          }, 50)
        }}
        focusDate={inviteFocus}
        boardGames={boardGames}
        personal={personal}
        playSessions={playSessions}
        ratings={ratings}
        isOpen={isMyListOpen}
        onClose={() => setActivePage(null)}
        onOpenGame={(game, tab) => {
          setCoverMessage('')
          setSelectedTab(tab ?? 'overview')
          setSelectedGame(game)
          setActivePage(null)
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
      <Leaderboard
        canSeePeople={vip.isVip}
        isAdmin={isAdmin}
        people={people}
        adminRatings={adminRatings}
        boardGames={boardGames}
        communityStats={communityStats}
        ratings={ratings}
        isOpen={isLeaderboardOpen}
        onClose={() => setActivePage(null)}
        onOpenGame={(game) => {
          setCoverMessage('')
          setSelectedGame(game)
          setActivePage(null)
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
      {isRulesOpen && (vip.isVip || isAdmin) && (
        <RulebookPage
          boardGames={boardGames}
          onClose={() => setActivePage(null)}
        />
      )}
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
