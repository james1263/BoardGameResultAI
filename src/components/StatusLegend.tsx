import { useState } from 'react'
import { CheckIcon, HeartIcon } from './Icons'
import '../styles/status-legend.css'

// 想玩／已玩圖例：平常只顯示符號，點一下才顯示文字，再點收起
export default function StatusLegend() {
  const [open, setOpen] = useState(false)

  return (
    <button
      type="button"
      className={`sl-legend ${open ? 'is-open' : ''}`}
      aria-expanded={open}
      aria-label="想玩、已玩符號說明"
      onClick={() => setOpen((current) => !current)}
    >
      <span className="sl-item">
        <HeartIcon filled={false} />
        {open && <span>想玩</span>}
      </span>
      <span className="sl-item">
        <CheckIcon />
        {open && <span>已玩</span>}
      </span>
    </button>
  )
}
