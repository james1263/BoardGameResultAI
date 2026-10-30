import { useBackClose } from '../lib/useBackClose'
import { useEffect, useState, type ChangeEvent } from 'react'
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
import CommunityStats from './CommunityStats'
import type { CommunityStatsApi } from '../lib/useCommunityStats'
import RatingSection, { CommunitySummary } from './RatingSection'
import { useGameDocuments } from '../lib/useGameDocuments'
import type { PlaySessionsApi } from '../lib/useGamePlaySessions'
import type { RatingsApi } from '../lib/useGameRatings'
import GameNotesBoard from './GameNotesBoard'
import { useVip } from '../lib/useVip'

const TABS = [
  { key: 'overview', label: '概覽' },
  { key: 'ratings', label: '評分' },
  { key: 'mine', label: '我的紀錄' },
  { key: 'rules', label: '規則' },
] as const

type TabKey = (typeof TABS)[number]['key']

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
  initialTab?: TabKey
  onOpenGathering?: (gatheringId: string) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<TabKey>(initialTab ?? 'overview')
  const docsApi = useGameDocuments(game.bggName)
  const vip = useVip()
  useBackClose(onClose)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

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
              {game.category.length > 0 && (
                <div className="modal-categories">
                  {game.category.map((category) => (
                    <span className="modal-category" key={category}>
                      {category}
                    </span>
                  ))}
                </div>
              )}
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

        <div className="modal-body" role="tabpanel">
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

              <div className="modal-section">
                <CommunitySummary
                  bggName={game.bggName}
                  api={ratings}
                  detailed={false}
                />
              </div>
              <div className="modal-section">
                <CommunityStats
                  bggName={game.bggName}
                  api={communityStats}
                />
              </div>
              <div className="modal-section">
                <GameNotesBoard
                  key={game.bggName}
                  bggName={game.bggName}
                  isAdmin={isAdmin}
                  enabled={vip.isVip || isAdmin}
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
                {personal.isLoggedIn && <GameGatheringNotes
                  bggName={game.bggName}
                  onOpenGathering={onOpenGathering}
                />}
              </div>
            </>
          )}

          {tab === 'rules' && (
            <div className="modal-section">
              <GameDocuments
                key={game.bggName}
                api={docsApi}
                isAdmin={isAdmin}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}