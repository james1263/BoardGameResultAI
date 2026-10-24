import { useEffect, type ChangeEvent } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import type { PersonalApi } from '../lib/personalApi'
import GameDocuments from '../GameDocuments'
import CoverImage from './CoverImage'
import StatusButtons from './StatusButtons'
import RatingDots from './RatingDots'
import PlayCounter from './PlayCounter'
import PersonalNote from './PersonalNote'
import PlaySessions from './PlaySessions'
import type { PlaySessionsApi } from '../lib/useGamePlaySessions'

export default function GameModal({
  game,
  coverVersion,
  isAdmin,
  personal,
  playSessions,
  isUploadingCover,
  coverMessage,
  onCoverUpload,
  onTrash,
  isTrashing,
  onClose,
}: {
  game: BoardGame
  coverVersion: number
  isAdmin: boolean
  personal: PersonalApi
  playSessions: PlaySessionsApi
  isUploadingCover: boolean
  coverMessage: string
  onCoverUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onTrash: () => void
  isTrashing: boolean
  onClose: () => void
}) {
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
        className="game-modal compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-topbar">
          <h3 className="modal-section-title">01 / GAME PROFILE</h3>
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

        <div className="modal-section">
          <h3 className="modal-section-title">02 / GAME ATTRIBUTES</h3>
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
          <h3 className="modal-section-title">03 / MY COLLECTION</h3>
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
          <h3 className="modal-section-title">04 / PERSONAL NOTES</h3>
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

        <div className="modal-section">
          <h3 className="modal-section-title">05 / GAME RESOURCES</h3>
          <GameDocuments
            key={game.bggName}
            bggName={game.bggName}
            isAdmin={isAdmin}
          />
        </div>

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
      </section>
    </div>
  )
}
