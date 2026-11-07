import { useState } from 'react'
import type { PlaySessionsApi } from '../lib/useGamePlaySessions'

// 「我的統計」清單裡，一款遊戲的過去遊玩日期（預設摺疊、只看不改；要新增或刪除請按「補日期」）
export default function PastPlayDates({
  bggName,
  playSessions,
}: {
  bggName: string
  playSessions: PlaySessionsApi
}) {
  const [open, setOpen] = useState(false)
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
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
