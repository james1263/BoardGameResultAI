import { useState } from 'react'
import { createPortal } from 'react-dom'
import { setRewardOff, type RewardKind } from '../lib/rewardNotice'
import '../styles/reward-dialog.css'

const CONTENT: Record<
  RewardKind,
  { icon: string; title: string; text: string; row: string }
> = {
  first: {
    icon: '🎟️',
    title: '集到 1 點了！',
    text: '這個月再來一次，就能得到免費券。',
    row: '● ○',
  },
  voucher: {
    icon: '🎟️',
    title: '恭喜獲得一張免費券！',
    text: '下次聚會可以使用，沒有使用期限。',
    row: '● ● → 🎟 +1',
  },
  used: {
    icon: '🎟️',
    title: '已使用免費券',
    text: '今天用了一張免費券，所以這次不集點。',
    row: '🎟 → ✓',
  },
}

export default function RewardDialog({
  kind,
  userId,
  onClose,
}: {
  kind: RewardKind
  userId: string
  onClose: () => void
}) {
  const [never, setNever] = useState(false)
  const content = CONTENT[kind]

  function close() {
    if (never) setRewardOff(userId)
    onClose()
  }

  return createPortal(
    <div className="rw-backdrop">
      <div className="rw-card" role="dialog" aria-modal="true" aria-label={content.title}>
        <span className="rw-icon" aria-hidden="true">
          {content.icon}
        </span>
        <h3 className="rw-title">{content.title}</h3>
        <p className="rw-text">{content.text}</p>
        <p className="rw-row" aria-hidden="true">
          {content.row}
        </p>
        <div className="rw-foot">
          <label className="rw-never">
            <input type="checkbox" checked={never} onChange={(e) => setNever(e.target.checked)} />
            以後不再顯示
          </label>
          <button type="button" className="rw-ok" onClick={close}>
            我知道了
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
