import type { PersonalApi } from '../lib/personalApi'

export default function PlayCounter({
  bggName,
  personal,
}: {
  bggName: string
  personal: PersonalApi
}) {
  const entry = personal.getEntry(bggName)
  const disabled = !personal.canEdit

  return (
    <div className="play-counter">
      <div className="play-counter-info">
        <span className="play-counter-title">遊玩次數</span>
        <span className="play-counter-sub">記錄你的桌遊歷程</span>
      </div>
      <div className="play-counter-controls">
        <button
          type="button"
          className="play-counter-btn"
          aria-label="減少遊玩次數"
          disabled={disabled || entry.playCount <= 0}
          onClick={() =>
            personal.updateEntry(bggName, { playCount: entry.playCount - 1 })
          }
        >
          −
        </button>
        <span className="play-counter-value">{entry.playCount}</span>
        <button
          type="button"
          className="play-counter-btn plus"
          aria-label="增加遊玩次數"
          disabled={disabled || entry.playCount >= 999}
          onClick={() =>
            personal.updateEntry(bggName, { playCount: entry.playCount + 1 })
          }
        >
          ＋
        </button>
      </div>
    </div>
  )
}
