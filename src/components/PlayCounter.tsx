import type { PersonalApi } from '../lib/personalApi'

export default function PlayCounter({
  bggName,
  personal,
  datedCount,
}: {
  bggName: string
  personal: PersonalApi
  datedCount: number
}) {
  const entry = personal.getEntry(bggName)
  const disabled = !personal.canEdit
  const total = entry.playCount + datedCount

  let subText = '記錄你的桌遊歷程'
  if (datedCount > 0) {
    subText =
      entry.playCount === 0
        ? `共 ${datedCount} 次，都有日期紀錄（要減少請在下方刪除）`
        : `其中 ${datedCount} 次有日期紀錄`
  }

  return (
    <div className="play-counter">
      <div className="play-counter-info">
        <span className="play-counter-title">遊玩次數</span>
        <span className="play-counter-sub">{subText}</span>
      </div>
      <div className="play-counter-controls">
        <button
          type="button"
          className="play-counter-btn"
          aria-label="減少遊玩次數"
          title={
            entry.playCount <= 0 && datedCount > 0
              ? '有日期的紀錄請在下方刪除'
              : undefined
          }
          disabled={disabled || entry.playCount <= 0}
          onClick={() =>
            personal.updateEntry(bggName, { playCount: entry.playCount - 1 })
          }
        >
          −
        </button>
        <span className="play-counter-value">{total}</span>
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