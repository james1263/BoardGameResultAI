import { useState } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import { useRuleStats, type RuleStatPeriod } from '../lib/useRuleSearchStats'

const PERIODS: { key: RuleStatPeriod; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'month', label: '本月' },
  { key: 'quarter', label: '本季' },
  { key: 'year', label: '本年' },
]

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 0',
  borderBottom: '1px solid #e3d9c4',
} as const

// 統計中心「規則助手」頁：只有關鍵字與次數，不含帳號與完整問題
export default function RuleStatsBoard({
  enabled,
  boardGames,
  onOpenGame,
}: {
  enabled: boolean
  boardGames: BoardGame[]
  onOpenGame: (game: BoardGame) => void
}) {
  const [period, setPeriod] = useState<RuleStatPeriod>('all')
  const stats = useRuleStats(period, enabled)
  const byName = new Map(boardGames.map((game) => [game.bggName, game]))

  return (
    <div>
      <div className="lb-tabs" style={{ marginBottom: 12 }}>
        {PERIODS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`lb-tab ${period === item.key ? 'active' : ''}`}
            onClick={() => setPeriod(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {stats.status === 'loading' && <p>載入中…</p>}
      {stats.status === 'error' && <p>讀取失敗，請稍後再試。</p>}

      {stats.status === 'ready' && (
        <>
          <h3 style={{ margin: '4px 0' }}>最常被查的桌遊</h3>
          {stats.games.length === 0 ? (
            <p style={{ fontSize: 13 }}>這段期間還沒有紀錄。</p>
          ) : (
            <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {stats.games.map((row, index) => {
                const game = byName.get(row.bggName)
                return (
                  <li key={row.bggName} style={rowStyle}>
                    <span style={{ width: 24 }}>{index + 1}</span>
                    {game ? (
                      <button
                        type="button"
                        className="admin-link"
                        style={{ flex: 1, textAlign: 'left' }}
                        onClick={() => onOpenGame(game)}
                      >
                        {game.name}
                      </button>
                    ) : (
                      <span style={{ flex: 1 }}>{row.bggName}</span>
                    )}
                    <span>{row.count} 次</span>
                  </li>
                )
              })}
            </ol>
          )}

          <h3 style={{ margin: '16px 0 4px' }}>最熱門的關鍵字</h3>
          {stats.keywords.length === 0 ? (
            <p style={{ fontSize: 13 }}>這段期間還沒有紀錄。</p>
          ) : (
            <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {stats.keywords.map((row, index) => (
                <li key={row.keyword} style={rowStyle}>
                  <span style={{ width: 24 }}>{index + 1}</span>
                  <span style={{ flex: 1 }}>
                    {row.keyword}
                    {row.games > 1 && (
                      <small style={{ marginLeft: 6, opacity: 0.7 }}>{row.games} 款遊戲</small>
                    )}
                  </span>
                  <span>{row.count} 次</span>
                </li>
              ))}
            </ol>
          )}

          <p style={{ fontSize: 12, opacity: 0.75, marginTop: 14 }}>
            只統計 VIP 一般成員找到結果的搜尋（管理者不計）；只記關鍵字與次數，不記帳號與完整問題。搜尋次數代表大家感興趣，不代表答案正確。
          </p>
        </>
      )}
    </div>
  )
}
