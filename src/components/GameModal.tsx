import { useEffect, useState, type ChangeEvent } from 'react'
import type { LibraryGame } from '../lib/libraryTypes'
import type { PersonalApi } from '../lib/personalApi'
import GameDocuments from '../GameDocuments'
import CoverImage from './CoverImage'
import StatusButtons from './StatusButtons'
import RatingDots from './RatingDots'
import PlayCounter from './PlayCounter'
import PersonalNote from './PersonalNote'
import PlaySessions from './PlaySessions'
import DescriptionEditor from './DescriptionEditor'
import RatingSection, { CommunitySummary } from './RatingSection'
import { useGameDocuments } from '../lib/useGameDocuments'
import type { PlaySessionsApi } from '../lib/useGamePlaySessions'
import type { RatingsApi } from '../lib/useGameRatings'

const TABS = [
  { key: 'overview', label: '概覽' },
  { key: 'ratings', label: '評分' },
  { key: 'mine', label: '我的桌遊' },
  { key: 'rules', label: '規則' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function GameModal({
  game,
  coverVersion,
  isAdmin,
  personal,
  playSessions,
  ratings,
  onSaveDescription,
  isUploadingCover,
  coverMessage,
  onCoverUpload,
  onTrash,
  isTrashing,
  onClose,
}: {
  game: LibraryGame
  coverVersion: number
  isAdmin: boolean
  personal: PersonalApi
  playSessions: PlaySessionsApi
  ratings: RatingsApi
  onSaveDescription: (text: string) => Promise<boolean>
  isUploadingCover: boolean
  coverMessage: string
  onCoverUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onTrash: () => void
  isTrashing: boolean
  onClose: () => void
}) {
  const [tab, setTab] = useState<TabKey>('overview')
  const docsApi = useGameDocuments(game.bggName)

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
            <h3 className="modal-section-title">GAME PROFILE</h3>
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
                    <span className="modal-score-label">BGG SCORE</span>
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
                <h3 className="modal-section-title">GAME ATTRIBUTES</h3>
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
                <h3 className="modal-section-title">COMMUNITY RATING</h3>
                <CommunitySummary
                  bggName={game.bggName}
                  api={ratings}
                  detailed={false}
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
            <div className="modal-section">
              <RatingSection
                key={`${game.bggName}-${ratings.status}`}
                bggName={game.bggName}
                api={ratings}
              />
            </div>
          )}

          {tab === 'mine' && (
            <>
              <div className="modal-section">
                <h3 className="modal-section-title">MY COLLECTION</h3>
                <StatusButtons
                  bggName={game.bggName}
                  personal={personal}
                  variant="inline"
                />
                <PlayCounter
                  bggName={game.bggName}
                  personal={personal}
                  datedCount={playSessions.getSummary(game.bggName).count}
                />
                <PlaySessions
                  key={game.bggName}
                  bggName={game.bggName}
                  personal={personal}
                  api={playSessions}
                />
              </div>

              <div className="modal-section">
                <h3 className="modal-section-title">PERSONAL NOTES</h3>
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