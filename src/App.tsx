import { useMemo, useState, type ReactNode } from 'react'
import './App.css'
import { boardGames, type BoardGame } from './data/boardGames.generated'


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

function CoverImage({
  slug,
  alt,
  className,
  fallback,
}: {
  slug: string
  alt: string
  className: string
  fallback: ReactNode
}) {
  const [extIndex, setExtIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const failed = extIndex >= COVER_EXTENSIONS.length

  return (
    <>
      {!loaded && fallback}
      {!failed && (
        <img
          className={className}
          src={`/covers/${slug}.${COVER_EXTENSIONS[extIndex]}`}
          alt={alt}
          style={{ display: loaded ? 'block' : 'none' }}
          onLoad={() => setLoaded(true)}
          onError={() => setExtIndex((current) => current + 1)}
        />
      )}
    </>
  )
}

function App() {
  const [searchText, setSearchText] = useState('')
  const [selectedGame, setSelectedGame] = useState<BoardGame | null>(null)

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
    Number(maxTime !== '')

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
                顯示 {filteredGames.length} / {boardGames.length} 款
              </span>
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
                    可複選，符合任一類型即可
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
              查看 {filteredGames.length} 款結果
            </button>
          </aside>

          {missingDataCount > 0 && (
            <p className="missing-data-note">
              有 {missingDataCount} 款因缺少難度或時間資料，未納入篩選結果。
            </p>
          )}
          {filteredGames.length > 0 ? (
            <div className="game-grid">
              {filteredGames.map((game) => (
                <article className="game-card" key={game.id}>
                  <div className={`game-art game-art-${game.id}`}>
                    <CoverImage
                      slug={game.coverSlug}
                      alt={game.name}
                      className="cover-image"
                      fallback={
                        <span className="game-emoji" aria-hidden="true">
                          🎲
                        </span>
                      }
                    />
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
                      onClick={() => setSelectedGame(game)}
                    >
                      查看規則 <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </article>
              ))}
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
      </footer>

      {selectedGame && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedGame(null)}
        >
          <section
            className="game-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="關閉"
              onClick={() => setSelectedGame(null)}
            >
              ×
            </button>

            <CoverImage
              slug={selectedGame.coverSlug}
              alt={selectedGame.name}
              className="modal-cover"
              fallback={
                <div className="modal-game-icon" aria-hidden="true">
                  🎲
                </div>
              }
            />

            <p className="eyebrow">BGG SCORE</p>
            <div className="modal-score">
              {selectedGame.bggScore == null
                ? '尚無 BGG 分數'
                : selectedGame.bggScore}
            </div>
            <h2 id="modal-title">{selectedGame.name}</h2>

            {selectedGame.links.bgg && (
              <a
                className="bgg-link"
                href={selectedGame.links.bgg}
                target="_blank"
                rel="noreferrer"
              >
                在 BoardGameGeek 查看 ↗
              </a>
            )}

            <div className="rating-list">
              <div className="rating-item">
                <span className="rating-label">喜歡度</span>
                <span className="rating-content">
                  {selectedGame.likeEmoji || '未提供'}
                </span>
              </div>

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


            <div className="notice">
              <strong>規則查詢功能開發中</strong>
              <p>
                目前這是介面展示。下一階段我們會加入規則書匯入與搜尋，
                讓你能查到實際規則和對應頁碼。
              </p>
            </div>

            <button
              className="rule-button"
              type="button"
              onClick={() => setSelectedGame(null)}
            >
              知道了
            </button>
          </section>
        </div>
      )}
    </div>
  )
}

export default App