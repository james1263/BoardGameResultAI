import type { PersonalApi } from '../lib/personalApi'
import type { LibraryGame } from '../lib/libraryTypes'
import { formatNumber, formatPlayers } from '../lib/gameFormat'
import CoverImage from './CoverImage'
import StatusButtons from './StatusButtons'

export default function GameCard({
  game,
  isNew,
  coverVersion,
  personal,
  onOpen,
}: {
  game: LibraryGame
  isNew: boolean
  coverVersion: number
  personal: PersonalApi
  onOpen: (game: LibraryGame) => void
}) {
  return (
    <article className={`game-card ${isNew ? 'is-new' : ''}`}>
      <div
        className={`game-art game-art-${game.id}`}
        onClick={() => onOpen(game)}
      >
        <CoverImage
          key={`${game.coverSlug}-${coverVersion}`}
          version={coverVersion}
          slug={game.coverSlug}
          alt={game.name}
          className="cover-image"
          fallback={
            <span className="game-emoji" aria-hidden="true">
              🎲
            </span>
          }
        />
        <StatusButtons bggName={game.bggName} personal={personal} />
        {isNew && <span className="new-badge">NEW</span>}
        <span className="game-category">
          {game.category.length > 0 ? game.category.join('、') : '尚未分類'}
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
          <span>最佳人數：{formatPlayers(game.bestPlayers)}</span>
          <span>推薦人數：{formatPlayers(game.recommendPlayers)}</span>
          <span>
            ◷ {game.bggTime == null ? '未提供時間' : `${game.bggTime} 分鐘`}
          </span>
          <span>📊 BGG 難度：{formatNumber(game.bggDifficulty)}</span>
        </div>

        <button
          className="rule-button"
          type="button"
          onClick={() => onOpen(game)}
        >
          詳細資料 <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  )
}
