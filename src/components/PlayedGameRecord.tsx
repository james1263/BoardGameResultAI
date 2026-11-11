import { useEffect, useState, type ComponentProps } from 'react'
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
  // 補完日期後選「好」：帶著遊戲、日期、日期紀錄 id 去寫這天的心得
  onWriteNote?: (info: { bggName: string; playedOn: string; sessionId: string }) => void
  // 從寫心得畫面返回時，自動重新打開這款的補日期視窗
  autoOpen?: boolean
}

// 一款遊戲的「補日期」視窗：只管遊玩次數與日期（心得統一在俱樂部「我的心得」）
function RecordSheet({
  bggName,
  gameName,
  personal,
  playSessions,
  onWriteNote,
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
          <PlaySessions
            key={bggName}
            bggName={bggName}
            personal={personal}
            api={playSessions}
            onWriteNote={
              onWriteNote
                ? (info) => {
                    onClose()
                    onWriteNote(info)
                  }
                : undefined
            }
          />
        </div>
      </section>
    </div>,
    document.body,
  )
}

export default function PlayedGameRecord(props: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (props.autoOpen) setOpen(true)
  }, [props.autoOpen])

  return (
    <>
      <button type="button" className="pgr-open" onClick={() => setOpen(true)}>
        補日期 ›
      </button>
      {open && <RecordSheet {...props} onClose={() => setOpen(false)} />}
    </>
  )
}
