import { useBackClose } from '../lib/useBackClose'
import {
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
import PersonalNote from './PersonalNote'
import PlaySessions from './PlaySessions'
import DescriptionEditor from './DescriptionEditor'
import GameGatheringNotes from './GameGatheringNotes'
import InfoHint from './InfoHint'
import type { CommunityStatsApi } from '../lib/useCommunityStats'
import RatingSection, { CommunitySummary } from './RatingSection'
import { useGameDocuments } from '../lib/useGameDocuments'
import type { PlaySessionsApi } from '../lib/useGamePlaySessions'
import type { RatingsApi } from '../lib/useGameRatings'
import GameNotesBoard from './GameNotesBoard'
import { useVip } from '../lib/useVip'
import '../styles/overview.css'

const TABS = [
  { key: 'overview', label: '概覽' },
  { key: 'ratings', label: '評分' },
  { key: 'mine', label: '我的紀錄' },
] as const

type TabKey = (typeof TABS)[number]['key']

// 舊的「規則」分頁已併進概覽；外部仍可傳 'rules'，會開到概覽並展開規則區
const WALL_PREVIEW = 12

export default function GameModal({
  game,
  coverVersion,
  isAdmin,
  adminScores,
  personal,
  playSessions,
  ratings,
  onSaveDescription,
  communityStats,
  isUploadingCover,
  coverMessage,
  onCoverUpload,
  onTrash,
  isTrashing,
  initialTab,
  onOpenGathering,
  allGames,
  onSwitchGame,
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
  initialTab?: TabKey | 'rules'
  onOpenGathering?: (gatheringId: string) => void
  allGames?: LibraryGame[]
  onSwitchGame?: (game: LibraryGame) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<TabKey>(
    initialTab === undefined || initialTab === 'rules' ? 'overview' : initialTab,
  )
  const [rulesOpen, setRulesOpen] = useState(initialTab === 'rules')
  const [openType, setOpenType] = useState<string | null>(null)
  const [showAllWall, setShowAllWall] = useState(false)
  const docsApi = useGameDocuments(game.bggName)
  const vip = useVip()
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const lastGameRef = useRef(game.bggName)
  useBackClose(onClose)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // 從小封面切換到另一款遊戲時，回到概覽最上面、收起類型與規則
  useEffect(() => {
    if (lastGameRef.current === game.bggName) return
    lastGameRef.current = game.bggName
    setTab('overview')
    setRulesOpen(false)
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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="game-modal compact has-tabs"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-fixed">
          <div className="modal-topbar">
            <span className="ov-counts">
              想玩 {community.wantCount}・已玩 {community.playedCount}
            </span>
            <button
              className="modal-close"
              type="button"
              aria-label="關閉"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className="modal-head">
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
              {game.links.bgg && (
                <a
                  className="bgg-link"
                  href={game.links.bgg}
                  target="_blank"
                  rel="noreferrer"
                >
                  BoardGameGeek ↗
                </a>
              )}
              <h2 id="modal-title">{game.name}</h2>
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
            </div>
          </div>

          <div className="modal-tabs" role="tablist">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={tab === item.key}
                className={`modal-tab${tab === item.key ? ' is-active' : ''}`}
                onClick={() => setTab(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-body" role="tabpanel" ref={bodyRef}>
          {tab === 'overview' && (
            <>
              <DescriptionEditor
                key={game.bggName}
                value={game.description ?? ''}
                isAdmin={isAdmin}
                onSave={onSaveDescription}
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

              <div className="modal-section">
                <details
                  className="ov-fold"
                  open={rulesOpen}
                  onToggle={(event) => setRulesOpen(event.currentTarget.open)}
                >
                  <summary>規則連結與影片</summary>
                  <div className="ov-fold-body">
                    <GameDocuments
                      key={game.bggName}
                      api={docsApi}
                      isAdmin={isAdmin}
                    />
                  </div>
                </details>
              </div>

              <div className="modal-section">
                <GameNotesBoard
                  key={game.bggName}
                  bggName={game.bggName}
                  isAdmin={isAdmin}
                  enabled={vip.isVip || isAdmin}
                  canWrite={
                    isAdmin ||
                    personal.getEntry(game.bggName).played ||
                    ratings.getMine(game.bggName) !== null
                  }
                />
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

          {tab === 'ratings' && (
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

          {tab === 'mine' && (
            <>
              <div className="modal-section">
                <p className="personal-hint">
                  目前累計{' '}
                  {personal.getEntry(game.bggName).playCount +
                    playSessions.getSummary(game.bggName).count}{' '}
                  次
                  <InfoHint text="要標記想玩／已玩或直接改次數，請到「俱樂部」→「我的統計」。" />
                </p>
                <PlaySessions
                  key={game.bggName}
                  bggName={game.bggName}
                  personal={personal}
                  api={playSessions}
                />
              </div>

              <div className="modal-section">
                <PersonalNote
                  key={`${game.bggName}-${personal.status}`}
                  value={personal.getEntry(game.bggName).note}
                  disabled={!personal.canEdit}
                  onSave={(text) =>
                    personal.updateEntry(game.bggName, { note: text })
                  }
                />
                {!personal.isLoggedIn && (
                  <p className="personal-hint">登入後即可跨裝置保存</p>
                )}
                {personal.isLoggedIn && (
                  <GameGatheringNotes
                    bggName={game.bggName}
                    onOpenGathering={onOpenGathering}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
