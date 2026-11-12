import { useState } from 'react'
import type { PlaySessionsApi } from '../lib/useGamePlaySessions'
import type { PersonalApi } from '../lib/personalApi'

// 「我的統計」清單裡，一款遊戲的過去遊玩日期（預設摺疊）
// 自己記的（manual）可以刪除，避免填錯；系統自動記的不能刪（刪了評分時又會長回來）
// 刪除走 delete_play_date：總次數不變，這次會變回「沒有日期的次數」
// 樣式在 styles/club-stats.css（.ppd-*，只在「我的統計」抽屜內生效）

export default function PastPlayDates({
  bggName,
  playSessions,
  personal,
}: {
  bggName: string
  playSessions: PlaySessionsApi
  personal: PersonalApi
}) {
  const [open, setOpen] = useState(false)
  // 點「刪除」後先變成「確定？」，避免誤觸
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const list = [...playSessions.getSessions(bggName)].sort((a, b) =>
    a.playedOn < b.playedOn ? 1 : a.playedOn > b.playedOn ? -1 : 0,
  )
  if (list.length === 0) return null

  return (
    <div className="ppd">
      <button
        type="button"
        className="ppd-toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? '▾' : '▸'} 過去紀錄 {list.length} 筆
      </button>
      {open && (
        <ul className="ppd-list">
          {list.map((item) => (
            <li key={item.id} className="ppd-item">
              <span>{item.playedOn.replaceAll('-', '/')}</span>
              {item.playerCount != null && <span className="ppd-who">{item.playerCount} 人</span>}
              {item.source !== 'manual' && (
                <span className="ppd-tag">自動</span>
              )}
              {item.source === 'manual' &&
                (confirmId === item.id ? (
                  <span className="ppd-confirm">
                    <button
                      type="button"
                      className="ppd-btn solid"
                      disabled={playSessions.busy}
                      onClick={async () => {
                        const count = await playSessions.deletePlayDate(item.id)
                        if (count !== null) {
                          personal.updateEntry(bggName, { playCount: count }, { skipPlayedRule: true })
                        }
                        setConfirmId(null)
                      }}
                    >
                      確定刪除
                    </button>
                    <button type="button" className="ppd-btn" onClick={() => setConfirmId(null)}>
                      取消
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-label={`刪除 ${item.playedOn} 的紀錄`}
                    className="ppd-btn danger"
                    disabled={playSessions.busy}
                    onClick={() => setConfirmId(item.id)}
                  >
                    刪除
                  </button>
                ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}