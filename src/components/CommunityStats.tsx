import type { CommunityStatsApi } from '../lib/useCommunityStats'

export default function CommunityStats({
  bggName,
  api,
}: {
  bggName: string
  api: CommunityStatsApi
}) {
  const s = api.getStats(bggName)

  return (
    <div className="stats-block">
      <div className="stats-row">
        <span className="stats-label">想玩</span>
        <strong className="stats-count">{s.wantCount} 人</strong>
        <span className="stats-new">
          新增 本月 {s.wantMonth} · 本季 {s.wantQuarter} · 本年 {s.wantYear}
        </span>
      </div>
      <div className="stats-row">
        <span className="stats-label">已玩</span>
        <strong className="stats-count">{s.playedCount} 人</strong>
        <span className="stats-new">
          新增 本月 {s.playedMonth} · 本季 {s.playedQuarter} · 本年{' '}
          {s.playedYear}
        </span>
      </div>
      <p className="rate-note">只統計 VIP 玩家，只顯示人數。</p>
    </div>
  )
}