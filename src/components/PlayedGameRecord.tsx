import { useState, type ComponentProps } from 'react'
import { createPortal } from 'react-dom'
import PlaySessions from './PlaySessions'
import { useBackClose } from '../lib/useBackClose'
import '../styles/played-record.css'

type PersonalProp = ComponentProps<typeof PlaySessions>['personal']
type SessionsProp = ComponentProps<typeof PlaySessions>['api']

type Props = {
  bggName: string
  gameName: string
  personal: PersonalProp
  playSessions: SessionsProp
}

// 一款遊戲的「補日期」視窗：只管遊玩次數與日期（心得統一在俱樂部「我的心得」）
function RecordSheet({
  bggName,
  gameName,
  personal,
  playSessions,
  onClose,
}: Props & { onClose: () => void }) {
  useBackClose(onClose)

  const entry = personal.entries[bggName]
  const total = (entry?.playCount ?? 0) + playSessions.getSummary(bggName).count

  return createPortal(
    <div className="pgr-backdrop" onClick={onClose}>
      <section
        className="pgr-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`${gameName}的遊玩日期`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pgr-head">
          <h3>{gameName}</h3>
          <button
            type="button"
            className="pgr-close"
            aria-label="關閉"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <p className="pgr-total">目前累計 {total} 次</p>

        <div className="pgr-section">
          <PlaySessions key={bggName} bggName={bggName} personal={personal} api={playSessions} />
        </div>
      </section>
    </div>,
    document.body,
  )
}

export default function PlayedGameRecord(props: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className="pgr-open" onClick={() => setOpen(true)}>
        補日期 ›
      </button>
      {open && <RecordSheet {...props} onClose={() => setOpen(false)} />}
    </>
  )
}
