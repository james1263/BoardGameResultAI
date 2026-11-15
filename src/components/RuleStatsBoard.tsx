import { useState } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import { supabase } from '../lib/supabase'
import { askConfirm, showNotice } from '../lib/askConfirm'
import { useRuleStats, type RuleStatPeriod } from '../lib/useRuleSearchStats'

const PERIODS: { key: RuleStatPeriod; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'month', label: '本月' },
  { key: 'quarter', label: '本季' },
  { key: 'year', label: '本年' },
]

// 統計中心「規則助手」頁：只有關鍵字與次數，不含帳號與完整問題
// 樣式在 styles/club-leaderboard.css（.rsb-*，只在統計中心抽屜內生效）
export default function RuleStatsBoard({
  enabled,
  isAdmin = false,
  boardGames,
  onOpenGame,
}: {
  enabled: boolean
  isAdmin?: boolean
  boardGames: BoardGame[]
  onOpenGame: (game: BoardGame) => void
}) {
  const [period, setPeriod] = useState<RuleStatPeriod>('all')
  const stats = useRuleStats(period, enabled)
  const byName = new Map(boardGames.map((game) => [game.bggName, game]))

  // 管理者手動刪除：整款遊戲的統計，或單一關鍵字（所有遊戲、所有日期）
  const removeGame = async (bggName: string, label: string) => {
    if (!(await askConfirm(`確定要刪除「${label}」的所有搜尋統計嗎？刪除後無法復原。`))) return
    const { error } = await supabase.rpc('admin_delete_rule_stats', { p_bgg_name: bggName })
    if (error) {
      await showNotice('刪除失敗：' + error.message)
      return
    }
    stats.reload()
  }
  const removeKeyword = async (keyword: string) => {
    if (!(await askConfirm(`確定要刪除關鍵字「${keyword}」的所有統計嗎？（所有遊戲、所有日期，無法復原）`))) return
    const { error } = await supabase.rpc('admin_delete_rule_keyword', { p_keyword: keyword })
    if (error) {
      await showNotice('刪除失敗：' + error.message)
      return
    }
    stats.reload()
  }

  return (
    <div className="rsb">
      <div className="lbc-pageset rsb-periods">
        {PERIODS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`lbc-page ${period === item.key ? 'active' : ''}`}
            onClick={() => setPeriod(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {stats.status === 'loading' && <p className="rsb-empty">載入中…</p>}
      {stats.status === 'error' && <p className="rsb-empty">讀取失敗，請稍後再試。</p>}

      {stats.status === 'ready' && (
        <>
          <h3 className="rsb-h">最常被查的桌遊</h3>
          {stats.games.length === 0 ? (
            <p className="rsb-empty">這段期間還沒有紀錄。</p>
          ) : (
            <ol className="rsb-list">
              {stats.games.map((row, index) => {
                const game = byName.get(row.bggName)
                return (
                  <li key={row.bggName} className="rsb-row">
                    <span className={`rsb-rank ${index < 3 ? 'top' : ''}`}>{index + 1}</span>
                    {game ? (
                      <button type="button" className="rsb-link" onClick={() => onOpenGame(game)}>
                        {game.name}
                      </button>
                    ) : (
                      <span className="rsb-text">{row.bggName}</span>
                    )}
                    <span className="rsb-count">{row.count} 次</span>
                    {isAdmin && (
                      <button
                        type="button"
                        className="rsb-del"
                        aria-label={`刪除 ${game ? game.name : row.bggName} 的統計`}
                        onClick={() => removeGame(row.bggName, game ? game.name : row.bggName)}
                      >
                        刪除
                      </button>
                    )}
                  </li>
                )
              })}
            </ol>
          )}

          <h3 className="rsb-h rsb-h2">最熱門的關鍵字</h3>
          {stats.keywords.length === 0 ? (
            <p className="rsb-empty">這段期間還沒有紀錄。</p>
          ) : (
            <ol className="rsb-list">
              {stats.keywords.map((row, index) => (
                <li key={row.keyword} className="rsb-row">
                  <span className={`rsb-rank ${index < 3 ? 'top' : ''}`}>{index + 1}</span>
                  <span className="rsb-text">
                    {row.keyword}
                    {row.games > 1 && <small className="rsb-games">{row.games} 款遊戲</small>}
                  </span>
                  <span className="rsb-count">{row.count} 次</span>
                  {isAdmin && (
                    <button
                      type="button"
                      className="rsb-del"
                      aria-label={`刪除關鍵字 ${row.keyword}`}
                      onClick={() => removeKeyword(row.keyword)}
                    >
                      刪除
                    </button>
                  )}
                </li>
              ))}
            </ol>
          )}

          <p className="rsb-foot">
            只統計 VIP 一般成員找到結果的搜尋（管理者不計）；只記關鍵字與次數，不記帳號與完整問題。搜尋次數代表大家感興趣，不代表答案正確。
          </p>
        </>
      )}
    </div>
  )
}
