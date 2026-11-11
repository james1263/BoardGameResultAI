import { useState } from 'react'
import type { PlaySessionsApi } from '../lib/useGamePlaySessions'
import type { PersonalApi } from '../lib/personalApi'

// 「我的統計」清單裡，一款遊戲的過去遊玩日期（預設摺疊）
// 自己記的（manual）可以刪除，避免填錯；系統自動記的不能刪（刪了評分時又會長回來）
// 刪除走 delete_play_date：總次數不變，這次會變回「沒有日期的次數」
const SMALL_BTN = {
  padding: '2px 10px',
  font: 'inherit',
  fontSize: 12,
  color: '#6b6a5c',
  background: '#fffefa',
  border: '1px solid #d9d6c9',
  borderRadius: 999,
  cursor: 'pointer',
} as const

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
    <div style={{ margin: '2px 0 4px' }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        style={{
          padding: '2px 0',
          font: 'inherit',
          fontSize: 13,
          color: '#6b6a5c',
          background: 'none',
          border: 0,
          cursor: 'pointer',
        }}
      >
        {open ? '▾' : '▸'} 過去紀錄 {list.length} 筆
      </button>
      {open && (
        <ul
          style={{
            listStyle: 'none',
            margin: '4px 0 0',
            padding: '0 0 0 4px',
            maxHeight: 180,
            overflowY: 'auto',
          }}
        >
          {list.map((item) => (
            <li
              key={item.id}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 13 }}
            >
              <span>{item.playedOn.replaceAll('-', '/')}</span>
              {item.playerCount != null && <span style={{ color: '#7a8a80' }}>{item.playerCount} 人</span>}
              {item.source !== 'manual' && (
                <span
                  style={{
                    fontSize: 11,
                    padding: '0 7px',
                    color: '#3d6b4c',
                    background: '#e6efe8',
                    borderRadius: 999,
                  }}
                >
                  自動
                </span>
              )}
              {item.source === 'manual' &&
                (confirmId === item.id ? (
                  <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 6 }}>
                    <button
                      type="button"
                      disabled={playSessions.busy}
                      style={{ ...SMALL_BTN, color: '#fff', background: '#b5483a', borderColor: '#b5483a' }}
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
                    <button type="button" style={SMALL_BTN} onClick={() => setConfirmId(null)}>
                      取消
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-label={`刪除 ${item.playedOn} 的紀錄`}
                    disabled={playSessions.busy}
                    style={{ ...SMALL_BTN, marginLeft: 'auto', color: '#b5483a' }}
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