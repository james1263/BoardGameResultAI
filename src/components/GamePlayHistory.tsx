import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/game-tabs.css'

type Row = { gathered_on: string; status: 'played' | 'planned' }

const WEEK = ['日', '一', '二', '三', '四', '五', '六']

function formatDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  if (!y || !m || !d) return day
  const weekday = WEEK[new Date(y, m - 1, d).getDay()]
  return `${y}/${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}（${weekday}）`
}

// 這款遊戲在俱樂部的開團紀錄（只有日期與狀態，不顯示成員）
export default function GamePlayHistory({
  bggName,
  enabled,
  isAdmin,
}: {
  bggName: string
  enabled: boolean
  isAdmin: boolean
}) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    void supabase
      .rpc('get_game_play_history', { p_bgg_name: bggName })
      .then(({ data, error: rpcError }) => {
        if (cancelled) return
        if (rpcError) {
          setError('讀取開團紀錄失敗，請稍後再試。')
        } else {
          setError('')
          setRows((data ?? []) as Row[])
        }
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [bggName, enabled])

  if (!enabled) {
    return <p className="gb-empty">只有 VIP 可以看到俱樂部的開團紀錄。</p>
  }

  const playedCount = rows.filter((row) => row.status === 'played').length

  return (
    <div className="gh-board">
      <div className="gh-head">
        <h3>曾經開團紀錄</h3>
        {!loading && !error && <span className="gh-total">共 {playedCount} 次</span>}
      </div>

      {loading && <p className="gb-empty">讀取中…</p>}
      {error && <p className="gb-empty">{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <p className="gb-empty">俱樂部還沒有這款的開團紀錄。</p>
      )}

      {rows.length > 0 && (
        <ul className="gh-list">
          {rows.map((row) => (
            <li className="gh-item" key={`${row.gathered_on}-${row.status}`}>
              <span className="gh-date">{formatDay(row.gathered_on)}</span>
              <span className={`gh-badge ${row.status}`}>
                {row.status === 'played' ? '已開團' : '預計開團'}
              </span>
            </li>
          ))}
        </ul>
      )}

      {isAdmin ? (
        <p className="gb-empty">
          成員名單與開團狀態，請到「管理」→「聚會集點」該場聚會查看與確認。
        </p>
      ) : (
        <p className="gb-empty">只顯示日期，不顯示參加的成員。預計開團不計入次數。</p>
      )}
    </div>
  )
}
