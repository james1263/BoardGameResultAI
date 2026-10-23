import type { PersonalApi } from '../lib/personalApi'
import { CheckIcon, HeartIcon } from './Icons'

export default function StatusButtons({
  bggName,
  personal,
  variant = 'overlay',
}: {
  bggName: string
  personal: PersonalApi
  variant?: 'overlay' | 'inline'
}) {
  const entry = personal.getEntry(bggName)
  const disabled = !personal.canEdit
  const withLabel = variant === 'inline'

  return (
    <div
      className={`status-buttons ${variant}`}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className={`status-btn want ${entry.wantToPlay ? 'on' : ''}`}
        aria-pressed={entry.wantToPlay}
        aria-label="想玩"
        title="想玩"
        disabled={disabled}
        onClick={() =>
          personal.updateEntry(bggName, { wantToPlay: !entry.wantToPlay })
        }
      >
        <HeartIcon filled={entry.wantToPlay} />
        {withLabel && <span>想玩</span>}
      </button>
      <button
        type="button"
        className={`status-btn played ${entry.played ? 'on' : ''}`}
        aria-pressed={entry.played}
        aria-label="已玩"
        title="已玩"
        disabled={disabled}
        onClick={() =>
          personal.updateEntry(bggName, { played: !entry.played })
        }
      >
        <CheckIcon />
        {withLabel && <span>已玩</span>}
      </button>
    </div>
  )
}
