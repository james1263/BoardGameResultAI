import type { KeyboardEvent, MouseEvent } from 'react'
import type { PersonalApi } from '../lib/personalApi'
import { getDisplayScore, type LibraryGame } from '../lib/libraryTypes'
import { formatNumber, formatPlayers } from '../lib/gameFormat'
import CoverImage from './CoverImage'
import StatusButtons from './StatusButtons'
import '../styles/card-compact.css'

function stop(event: MouseEvent | KeyboardEvent) {
  event.stopPropagation()
}

// 人數只留數字（拿掉結尾的「人」），沒資料顯示 —
function shortPlayers(players: number[]): string {
  const text = formatPlayers(players).replace(/\s*人\s*$/, '')
  return text.includes('未') || text === '' ? '—' : text
}

export default function GameCard({
  game,
  isNew,
  coverVersion,
  personal,
  isAdmin = false,
  onOpen,
}: {
  game: LibraryGame
  isNew: boolean
  coverVersion: number
  personal: PersonalApi
  isAdmin?: boolean
  onOpen: (game: LibraryGame) => void
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    // 只處理卡片本身的按鍵；愛心／勾勾按鈕自己的 Enter 不要被搶走
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen(game)
    }
  }

  const timeText = game.bggTime == null ? '—' : `${game.bggTime}分`
  const difficultyText =
    game.bggDifficulty == null ? '—' : formatNumber(game.bggDifficulty)

  return (
    <article
      className={`game-card ${isNew ? 'is-new' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`開啟 ${game.name} 的詳細資料`}
      onClick={() => onOpen(game)}
      onKeyDown={handleKeyDown}
    >
      <div className={`game-art game-art-${game.id}`}>
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
        {!game.referenceOnly && (
          <span
            style={{ display: 'contents' }}
            onClick={stop}
            onKeyDown={stop}
          >
            <StatusButtons bggName={game.bggName} personal={personal} />
          </span>
        )}
        {game.referenceOnly ? (
          <span className="new-badge" style={{ background: '#7a7f75' }}>
            僅供參考
          </span>
        ) : (
          isNew && <span className="new-badge">NEW</span>
        )}
        <span className="game-category">
          {game.category.length > 0 ? game.category.join('、') : '尚未分類'}
        </span>
      </div>

      <div className="game-info">
        <h3>{game.name}</h3>

        <div className="game-facts">
          <span>
            <span title="最佳人數">🎯 {shortPlayers(game.bestPlayers)}</span>
            <span title="推薦人數">👥 {shortPlayers(game.recommendPlayers)}</span>
          </span>
          <span>
            <span title="遊戲時間（分鐘）">◷ {timeText}</span>
            <span title="BGG 難度">📊 {difficultyText}</span>
          </span>
        </div>

        {isAdmin && (
          <p className="game-admin-line">
            RE {formatNumber(game.rankingEngine)}｜綜合{' '}
            {formatNumber(getDisplayScore(game.scoreRank))}
          </p>
        )}
      </div>
    </article>
  )
}

