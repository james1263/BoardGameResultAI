import { useBackClose } from '../lib/useBackClose'
import { askConfirm } from '../lib/askConfirm'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import type { AdminScores, LibraryGame } from '../lib/libraryTypes'
import type { PersonalApi } from '../lib/personalApi'
import GameDocuments from '../GameDocuments'
import CoverImage from './CoverImage'
import RatingDots from './RatingDots'
import DescriptionEditor from './DescriptionEditor'
import type { CommunityStatsApi } from '../lib/useCommunityStats'
import RatingSection, { CommunitySummary } from './RatingSection'
import { useGameDocuments } from '../lib/useGameDocuments'
import type { PlaySessionsApi } from '../lib/useGamePlaySessions'
import type { RatingsApi } from '../lib/useGameRatings'
import GameNotesBoard from './GameNotesBoard'
import '../styles/discussion-links.css'
import GamePlayHistory from './GamePlayHistory'
import GameExpansions from './GameExpansions'
import GameBackground from './GameBackground'
import GameInfoSheet from './GameInfoSheet'
import QuickReview from './QuickReview'
import { getQuickReview } from '../data/quickReview'
import GameQa from './GameQa'
import { getGameFaq, getUnofficialFaq, countFaqItems } from './GameFaq'
import { BrainIcon, PairIcon, PersonIcon } from './Icons'
import { useGameExpansions } from '../lib/useGameExpansions'
import { useGameBackground } from '../lib/useGameBackground'
import { useGameErrata } from '../lib/useGameErrata'
import { useVip } from '../lib/useVip'
import { useAdminRatings } from '../lib/useGamePeople'
import { RATING_FIELDS } from '../lib/useGameRatings'
import '../styles/overview.css'
import '../styles/game-modal-v2.css'
import '../styles/game-rate-sheet.css'
import '../styles/game-modal-rules.css'

const TABS = [
  { key: 'overview', label: '概覽' },
  { key: 'rules', label: '規則' },
  { key: 'ratings', label: '評分' },
  { key: 'discussion', label: '討論' },
  { key: 'history', label: '紀錄' },
] as const

type TabKey = (typeof TABS)[number]['key']

// 「規則」分頁放規則相關入口（規則連結與影片、開桌前快速複習、FAQ・玩錯紀錄・AI 回饋）。
// 外部傳 initialTab='rules' 會開到規則分頁，並直接開「規則連結」彈窗。
// 僅供參考的遊戲只有「概覽」與「規則」兩個分頁
const REFERENCE_TABS: readonly TabKey[] = ['overview', 'rules']
const WALL_PREVIEW = 12

// 預留：之後的「新手上手小遊戲」可新增 'tutorial'，再到下面 ruleEntries 接一張卡
type SheetKey = 'rules' | 'background' | 'expansions' | 'errata' | 'rating' | 'review'

type SheetEntry = { key: SheetKey; icon: string; sub: string; title?: string }

const SHEET_TITLES: Record<SheetKey, string> = {
  rules: '規則連結與影片',
  background: '遊戲背景',
  expansions: '擴充',
  errata: '玩錯紀錄・AI 回饋',
  rating: '我的評分',
  review: '開桌前快速複習',
}

function difficultyText(value: number | null | undefined): string {
  if (value == null) return '—'
  const name =
    value < 1.8 ? '入門' : value < 2.6 ? '輕度' : value < 3.2 ? '中度' : value < 3.8 ? '中重' : '重度'
  return `${value.toFixed(2)}・${name}`
}

function bestText(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) return '—'
  return `${value.join('、')} 人`
}

export default function GameModal({
  game,
  coverVersion,
  isAdmin,
  adminScores,
  personal,
  ratings,
  onSaveDescription,
  communityStats,
  isUploadingCover,
  coverMessage,
  onCoverUpload,
  onTrash,
  isTrashing,
  initialTab,
  allGames,
  onSwitchGame,
  fullRatingForm = false,
  onOpenMyRatings,
  onOpenWrite,
  onClose,
}: {
  game: LibraryGame
  coverVersion: number
  isAdmin: boolean
  adminScores: AdminScores | null
  personal: PersonalApi
  playSessions: PlaySessionsApi
  ratings: RatingsApi
  communityStats: CommunityStatsApi
  onSaveDescription: (text: string) => Promise<boolean>
  isUploadingCover: boolean
  coverMessage: string
  onCoverUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onTrash: () => void
  isTrashing: boolean
  initialTab?: TabKey | 'mine'
  onOpenGathering?: (gatheringId: string) => void
  allGames?: LibraryGame[]
  onSwitchGame?: (game: LibraryGame) => void
  // true＝一定要顯示完整評分表單（聚會報到後評分走這條）
  fullRatingForm?: boolean
  // 有傳才會把評分分頁換成「摘要＋前往我的評分」
  onOpenMyRatings?: () => void
  // 討論分頁的「寫心得／留言」：跳到俱樂部「我的心得」的寫作畫面，帶入這款遊戲
  onOpenWrite?: () => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<TabKey>(
    initialTab === undefined || initialTab === 'mine' ? 'overview' : initialTab,
  )
  // 僅供參考的遊戲只有概覽與規則，沒有評分、討論、紀錄
  const visibleTabs: readonly { key: TabKey; label: string }[] = game.referenceOnly
    ? TABS.filter((item) => REFERENCE_TABS.includes(item.key))
    : TABS
  const activeTab: TabKey = visibleTabs.some((item) => item.key === tab) ? tab : 'overview'
  const [sheet, setSheet] = useState<SheetKey | null>(initialTab === 'rules' ? 'rules' : null)
  const [openType, setOpenType] = useState<string | null>(null)
  const [showAllWall, setShowAllWall] = useState(false)
  const docsApi = useGameDocuments(game.bggName)
  const vip = useVip()
  // 入口卡片的數量與底部彈窗共用同一份資料（只讀一次）
  const expApi = useGameExpansions(game.bggName)
  const bgApi = useGameBackground(game.bggName)
  const errataApi = useGameErrata(game.bggName, (vip.isVip || isAdmin) && !game.referenceOnly)
  // 只有管理者會讀：每個人各自的評分
  const adminRatings = useAdminRatings(isAdmin)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const lastGameRef = useRef(game.bggName)
  const closeSheet = useCallback(() => setSheet(null), [])
  useBackClose(onClose)
  // 宣告在上面那行之後，彈窗才會在返回鍵堆疊的最上面（一次只退一層）
  useBackClose(closeSheet, sheet !== null)

  // 從小封面切換到另一款遊戲時，回到概覽最上面、收起類型與規則
  useEffect(() => {
    if (lastGameRef.current === game.bggName) return
    lastGameRef.current = game.bggName
    setTab('overview')
    setSheet(null)
    setOpenType(null)
    setShowAllWall(false)
    bodyRef.current?.scrollTo({ top: 0 })
  }, [game.bggName])

  // 每個類型底下「其他」同類型的遊戲
  const relatedByType = useMemo(() => {
    const result: Record<string, LibraryGame[]> = {}
    for (const type of game.category) {
      result[type] = (allGames ?? []).filter(
        (item) =>
          item.bggName !== game.bggName && item.category.includes(type),
      )
    }
    return result
  }, [allGames, game.bggName, game.category])

  const community = communityStats.getStats(game.bggName)
  const wallGames = openType ? (relatedByType[openType] ?? []) : []
  const shownWall = showAllWall ? wallGames : wallGames.slice(0, WALL_PREVIEW)

  // 入口卡片：只顯示原本就有權限、且有資料（或管理者本來就看得到）的入口
  const bgHasData =
    !!bgApi.data && (bgApi.data.content !== '' || bgApi.data.links.length > 0)
  const errataCount = errataApi.items.filter(
    (item) => !item.status || item.status === 'approved',
  ).length
  const faq = getGameFaq(game.bggName)
  // BGG 討論・非官方 FAQ：玩家整理的設計師回覆／討論，和官方 FAQ 分開標示
  const unofficial = getUnofficialFaq(game.bggName)
  const canSeeErrata = (vip.isVip || isAdmin) && !game.referenceOnly

  // 概覽分頁的入口：遊戲本身的資料
  const overviewEntries: SheetEntry[] = []
  if (isAdmin || (!bgApi.loading && bgHasData)) {
    overviewEntries.push({ key: 'background', icon: '🏛', sub: bgHasData ? '背景科普' : '尚未填寫' })
  }
  if (isAdmin || (!expApi.loading && expApi.rows.length > 0)) {
    overviewEntries.push({
      key: 'expansions',
      icon: '🧩',
      sub: expApi.rows.length > 0 ? `${expApi.rows.length} 個擴充` : '尚未登錄',
    })
  }

  // 規則分頁的入口：規則相關。之後要新增入口（例如新手上手小遊戲）就接在這個陣列最後面
  const ruleEntries: SheetEntry[] = [
    {
      key: 'rules',
      icon: '📖',
      sub: isAdmin ? '規則書・連結・教學影片' : '連結・教學影片',
    },
  ]
  if (getQuickReview(game.bggName) && (vip.isVip || isAdmin) && !game.referenceOnly) {
    ruleEntries.push({ key: 'review', icon: '⚡', sub: '目標・流程・行動・得分' })
  }
  // FAQ、BGG 討論・非官方 FAQ、玩錯紀錄、AI 回饋合併成一張卡，進去後每一區都有標籤註明類型
  const hasAnyFaq = !!faq || !!unofficial
  const titleParts: string[] = []
  if (faq) titleParts.push('FAQ')
  if (canSeeErrata) titleParts.push('玩錯紀錄', 'AI回饋')
  if (unofficial) titleParts.push('BGG討論')
  const errataTitle = titleParts.length > 0 ? titleParts.join('．') : SHEET_TITLES.errata
  if (hasAnyFaq || canSeeErrata) {
    const parts: string[] = []
    if (faq) parts.push(`FAQ ${countFaqItems(faq)} 則`)
    if (unofficial) parts.push(`非官方 ${countFaqItems(unofficial)} 則`)
    if (canSeeErrata) parts.push(`玩錯紀錄 ${errataCount} 則`)
    ruleEntries.push({ key: 'errata', icon: '💡', sub: parts.join('・'), title: errataTitle })
  }
  // 預留：新手上手小遊戲
  // ruleEntries.push({ key: 'tutorial', icon: '🎓', sub: '邊玩邊學規則' })

  const renderEntries = (list: SheetEntry[]) => (
    <div className="gm-entries">
      {list.map((entry) => (
        <button
          key={entry.key}
          type="button"
          className="gm-entry"
          onClick={() => setSheet(entry.key)}
        >
          <span className="gm-entry-icon" aria-hidden="true">
            {entry.icon}
          </span>
          <span className="gm-entry-text">
            <b>{entry.title ?? SHEET_TITLES[entry.key]}</b>
            <small>{entry.sub}</small>
          </span>
          <span className="gm-entry-go" aria-hidden="true">
            ›
          </span>
        </button>
      ))}
    </div>
  )

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="game-modal compact has-tabs gm-v2"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-fixed">
          <div className="modal-topbar">
            {game.referenceOnly ? (
              <span className="ov-counts">僅供參考</span>
            ) : (
              <span className="ov-counts">
                想玩 {community.wantCount}・已玩 {community.playedCount}
              </span>
            )}
            <button
              className="modal-close"
              type="button"
              aria-label="關閉"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className="modal-head gm-hero">
            <CoverImage
              key={`bg-${game.coverSlug}-${coverVersion}`}
              version={coverVersion}
              slug={game.coverSlug}
              alt=""
              className="gm-hero-bg"
              fallback={<span />}
            />
            <div className="gm-hero-shade" aria-hidden="true" />
            <CoverImage
              key={`${game.coverSlug}-${coverVersion}`}
              version={coverVersion}
              slug={game.coverSlug}
              alt={game.name}
              className="modal-cover"
              fallback={
                <div className="modal-game-icon" aria-hidden="true">
                  🎲
                </div>
              }
            />
            <div className="modal-head-info">
              <h2 id="modal-title">
                {game.links.bgg ? (
                  <a
                    className="ge-title-link"
                    href={game.links.bgg}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {game.name} <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  game.name
                )}
              </h2>
              <div className="modal-score-line">
                {game.bggScore == null ? (
                  <span className="modal-score-empty">尚無 BGG 分數</span>
                ) : (
                  <>
                    <span className="modal-score-star" aria-hidden="true">
                      ☆
                    </span>
                    <span className="modal-score">{game.bggScore}</span>
                    <span className="modal-score-label">BGG 分數</span>
                  </>
                )}
              </div>
              <ul className="gm-facts" aria-label="基本資訊">
                <li>
                  <BrainIcon />
                  <span>難度</span>
                  <b>{difficultyText(game.bggDifficulty)}</b>
                </li>
                <li>
                  <i aria-hidden="true">◷</i>
                  <span>時間</span>
                  <b>{game.bggTime == null ? '—' : `${game.bggTime} 分`}</b>
                </li>
                <li>
                  <PairIcon />
                  <span>最佳</span>
                  <b>{bestText(game.bestPlayers)}</b>
                </li>
                <li>
                  <PersonIcon />
                  <span>推薦</span>
                  <b>{bestText(game.recommendPlayers)}</b>
                </li>
              </ul>
            </div>
          </div>

          <div className="modal-tabs" role="tablist">
            {visibleTabs.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={activeTab === item.key}
                className={`modal-tab${activeTab === item.key ? ' is-active' : ''}`}
                onClick={() => {
                  setTab(item.key)
                  bodyRef.current?.scrollTo({ top: 0 })
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-body" role="tabpanel" ref={bodyRef}>
          {activeTab === 'overview' && (
            <>
              <DescriptionEditor
                key={game.bggName}
                value={game.description ?? ''}
                isAdmin={isAdmin}
                onSave={onSaveDescription}
                clamp
              />

              <div className="modal-section">
                <div className="rating-list">
                  <RatingDots label="快速性" value={game.speedEmoji} />
                  <RatingDots label="變化度" value={game.changeEmoji} />
                  <RatingDots label="溝通度" value={game.communicationEmoji} />
                  <RatingDots label="影響度" value={game.playerImpactEmoji} />
                  <RatingDots label="獨特性" value={game.uniqueEmoji} />
                  <RatingDots label="複雜度" value={game.complexityEmoji} />
                </div>
              </div>

              {game.category.length > 0 && (
                <div className="modal-section ov-types-section">
                  <div className="ov-types" role="group" aria-label="遊戲類型">
                    {game.category.map((type) => {
                      const count = relatedByType[type]?.length ?? 0
                      const active = openType === type
                      return (
                        <button
                          key={type}
                          type="button"
                          className={`ov-type${active ? ' is-active' : ''}`}
                          aria-pressed={active}
                          disabled={count === 0}
                          onClick={() => {
                            setShowAllWall(false)
                            setOpenType(active ? null : type)
                          }}
                        >
                          {type}
                          <span className="ov-type-count">{count}</span>
                        </button>
                      )
                    })}
                  </div>

                  {openType && (
                    <>
                      <p className="ov-wall-title">
                        同是「{openType}」的其他桌遊（{wallGames.length} 款）
                      </p>
                      <div className="ov-wall">
                        {shownWall.map((item) => (
                          <button
                            key={item.bggName}
                            type="button"
                            className="ov-wall-item"
                            onClick={() => onSwitchGame?.(item)}
                          >
                            <CoverImage
                              version={0}
                              slug={item.coverSlug}
                              alt={item.name}
                              className="ov-cover-img"
                              fallback={
                                <span className="ov-cover-fallback" aria-hidden="true">
                                  🎲
                                </span>
                              }
                            />
                            <span className="ov-wall-name">{item.name}</span>
                          </button>
                        ))}
                      </div>
                      {wallGames.length > WALL_PREVIEW && (
                        <button
                          type="button"
                          className="ov-more"
                          onClick={() => setShowAllWall((value) => !value)}
                        >
                          {showAllWall
                            ? '收起'
                            : `看更多（還有 ${wallGames.length - WALL_PREVIEW} 款）`}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {overviewEntries.length > 0 && (
                <div className="modal-section">{renderEntries(overviewEntries)}</div>
              )}

              {isAdmin && (
                <div className="cover-upload">
                  <label className="admin-link" style={{ cursor: 'pointer' }}>
                    {isUploadingCover ? '上傳中…' : '上傳／更換封面'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={isUploadingCover}
                      onChange={onCoverUpload}
                    />
                  </label>
                  {coverMessage && <p>{coverMessage}</p>}
                </div>
              )}

              {isAdmin && (
                <div className="modal-trash-row">
                  <button
                    className="modal-trash-btn"
                    type="button"
                    disabled={isTrashing}
                    onClick={onTrash}
                  >
                    {isTrashing ? '處理中…' : '移到垃圾桶'}
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'rules' && (
            <div className="modal-section">{renderEntries(ruleEntries)}</div>
          )}

          {activeTab === 'ratings' && (
            isAdmin ? (
              <div className="modal-section">
                <h3 className="modal-section-title">管理者評分（來自 CSV）</h3>
                {adminScores == null ? (
                  <div className="rate-grid" style={{ marginTop: 12 }}>
                    {[
                      '喜歡度',
                      '溝通度',
                      '獨特性',
                      '影響度',
                      '變化度',
                      '整體',
                      '適合留下來',
                    ].map((label) => (
                      <div className="rate-grid-item" key={label}>
                        <span>{label}</span>
                        <strong>未玩過</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="rating-list">
                      <RatingDots label="喜歡度" value={game.likeEmoji} />
                      <RatingDots label="溝通度" value={game.communicationEmoji} />
                      <RatingDots label="獨特性" value={game.uniqueEmoji} />
                      <RatingDots label="影響度" value={game.playerImpactEmoji} />
                      <RatingDots label="變化度" value={game.changeEmoji} />
                    </div>
                    <div className="rate-grid" style={{ marginTop: 12 }}>
                      <div className="rate-grid-item">
                        <span>整體</span>
                        <strong>{adminScores.overall} / 10</strong>
                      </div>
                      <div className="rate-grid-item">
                        <span>適合留下來</span>
                        <strong>
                          {adminScores.keep == null
                            ? '未提供'
                            : `${adminScores.keep} / 5`}
                        </strong>
                      </div>
                    </div>
                  </>
                )}
                <p className="rate-note">
                  這是你在 Notion 的評分，重新匯入 CSV 就會自動更新。整體由 Ranking
                  engine、適合留下來由分數排名換算；還沒玩過的遊戲（Ranking engine
                  以 .5 結尾）七項都不計入大家的評分。
                </p>
                <p className="rate-subtitle" style={{ marginTop: 14 }}>大家的評分</p>
                <CommunitySummary
                  bggName={game.bggName}
                  api={ratings}
                  detailed
                  raters={adminRatings.get(game.bggName)}
                />
              </div>
            ) : !fullRatingForm && onOpenMyRatings && personal.isLoggedIn ? (
              <div className="modal-section">
                <h3 className="modal-section-title">我的評分</h3>
                {(() => {
                  const mine = ratings.getMine(game.bggName)
                  if (ratings.status !== 'ready') {
                    return <p className="rate-note">讀取中…</p>
                  }
                  if (!mine) {
                    return <p className="rate-note">你還沒有評分這款遊戲。</p>
                  }
                  const filled = RATING_FIELDS.filter((field) => mine[field.key] != null).length
                  return (
                    <div className="rate-grid" style={{ marginTop: 12 }}>
                      <div className="rate-grid-item">
                        <span>整體</span>
                        <strong>{mine.overall} / 10</strong>
                      </div>
                      <div className="rate-grid-item">
                        <span>細項</span>
                        <strong>
                          {filled} / {RATING_FIELDS.length}
                        </strong>
                      </div>
                    </div>
                  )
                })()}
                <button
                  type="button"
                  className="ma-btn"
                  style={{ marginTop: 12 }}
                  onClick={() => setSheet('rating')}
                >
                  前往我的評分 ›
                </button>
                <p className="rate-subtitle" style={{ marginTop: 14 }}>大家的評分</p>
                <CommunitySummary
                  bggName={game.bggName}
                  api={ratings}
                  detailed
                />
              </div>
            ) : (
              <div className="modal-section">
                <RatingSection
                  key={`${game.bggName}-${ratings.status}`}
                  bggName={game.bggName}
                  api={ratings}
                />
              </div>
            )
          )}

          {activeTab === 'discussion' && (
            <div className="modal-section">
              {vip.isVip || isAdmin ? (
                <>
                  {onOpenWrite && (
                    <div className="gdl-row">
                      <button type="button" className="gdl-btn" onClick={onOpenWrite}>
                        寫心得／留言 ›
                      </button>
                    </div>
                  )}
                  <GameNotesBoard
                    key={game.bggName}
                    bggName={game.bggName}
                    isAdmin={isAdmin}
                    enabled
                    hideCompose={!!onOpenWrite}
                    canWrite={
                      isAdmin ||
                      personal.getEntry(game.bggName).played ||
                      ratings.getMine(game.bggName) !== null
                    }
                  />
                </>
              ) : (
                <p className="personal-hint">只有 VIP 可以看到大家的留言。</p>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="modal-section">
              <GamePlayHistory
                key={game.bggName}
                bggName={game.bggName}
                enabled={vip.isVip || isAdmin}
                isAdmin={isAdmin}
              />
            </div>
          )}
        </div>

        {sheet && (
          <GameInfoSheet
            title={sheet === 'errata' ? errataTitle : SHEET_TITLES[sheet]}
            onClose={closeSheet}
          >
            {sheet === 'rules' && (
              <GameDocuments
                key={game.bggName}
                api={docsApi}
                isAdmin={isAdmin}
                bggName={game.bggName}
                canSubmit={vip.isVip && !isAdmin && !game.referenceOnly}
              />
            )}
            {sheet === 'background' && (
              <GameBackground
                key={game.bggName}
                bggName={game.bggName}
                isAdmin={isAdmin}
                embedded
                api={bgApi}
              />
            )}
            {sheet === 'expansions' && (
              <GameExpansions
                key={game.bggName}
                bggName={game.bggName}
                isAdmin={isAdmin}
                embedded
                api={expApi}
              />
            )}
            {sheet === 'rating' && (
              <div className="grs">
                <div className="grs-head">
                  <CoverImage
                    key={`grs-${game.coverSlug}-${coverVersion}`}
                    version={coverVersion}
                    slug={game.coverSlug}
                    alt={game.name}
                    className="grs-cover"
                    fallback={
                      <div className="grs-fallback" aria-hidden="true">
                        🎲
                      </div>
                    }
                  />
                  <strong className="grs-name">{game.name}</strong>
                </div>
              <RatingSection
                key={`${game.bggName}-${ratings.status}`}
                bggName={game.bggName}
                api={ratings}
                hideCommunity
                beforeSave={
                  personal.getEntry(game.bggName).played || ratings.getMine(game.bggName)
                    ? undefined
                    : () =>
                        askConfirm('這款你還沒標為「已玩」。儲存評分會同時把它標為已玩，確定要儲存嗎？')
                }
              />
              </div>
            )}
            {sheet === 'errata' && (
              <GameQa
                key={game.bggName}
                bggName={game.bggName}
                isAdmin={isAdmin}
                errataApi={errataApi}
                showErrata={canSeeErrata}
                includeUnofficial
              />
            )}
            {sheet === 'review' && <QuickReview bggName={game.bggName} />}
          </GameInfoSheet>
        )}
      </section>
    </div>
  )
}
