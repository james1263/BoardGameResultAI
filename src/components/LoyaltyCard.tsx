import { useMyLoyalty, formatDay, formatDateTime } from '../lib/useLoyalty'

export default function LoyaltyCard() {
  const loyalty = useMyLoyalty()

  if (!loyalty.isLoggedIn) {
    return (
      <p className="mylist-hint">
        集點卡需要用 Google 登入才能使用，點數會記在你的帳號上。
      </p>
    )
  }

  if (loyalty.loading) return <p className="mylist-empty">讀取中…</p>

  const summary = loyalty.summary

  return (
    <div className="loy-card">
      {loyalty.error && <p className="loy-error">讀取失敗：{loyalty.error}</p>}

      {summary && (
        <div className="loy-stats">
          <div className="loy-stat">
            <strong>{summary.monthPoints}</strong>
            <span>本月點數</span>
          </div>
          <div className="loy-stat">
            <strong>{summary.availableVouchers}</strong>
            <span>可用免費券</span>
          </div>
          <div className="loy-stat">
            <strong>{summary.earnedVouchers}</strong>
            <span>累積券</span>
          </div>
          <div className="loy-stat">
            <strong>{summary.redeemed}</strong>
            <span>已兌換</span>
          </div>
        </div>
      )}

      {summary?.overRedeemed && (
        <p className="loy-warning">
          已兌換的張數比目前累積的多（可能是後來修改了評分或遊玩紀錄），請聯絡管理者核對。
        </p>
      )}

      <div className="loy-rules">
        <h3>集點規則</h3>
        <ul>
          <li>管理者會在聚會當天，把到場的人列入名單。</li>
          <li>
            當天要有「遊玩紀錄」（日期要填聚會當天），而且當天玩過的每一款遊戲，你都要把七項評分填完整。
          </li>
          <li>一天不管玩幾款，只算 1 點。</li>
          <li>同一個月集滿 2 點，得到 1 張免費券，券沒有期限。</li>
          <li>當月只集到 1 點，到下個月 1 日就不再計入。</li>
          <li>
            點數依你目前的紀錄即時計算：修改評分或刪除遊玩紀錄，點數可能跟著變動；兌換紀錄會永久保留。
          </li>
        </ul>
      </div>

      <h3 className="loy-title">我的聚會日</h3>
      {loyalty.days.length === 0 ? (
        <p className="mylist-empty">還沒有被列入任何一天的聚會名單。</p>
      ) : (
        <ul className="loy-days">
          {loyalty.days.map((day) => (
            <li
              key={day.date}
              className={`loy-day ${day.qualified ? 'loy-day-ok' : ''}`}
            >
              <span className="loy-day-date">{formatDay(day.date)}</span>
              <span className="loy-day-text">
                {day.qualified
                  ? `✓ 已得 1 點（${day.gameCount} 款都評分完整）`
                  : !day.hasSession
                    ? '還沒有這天的遊玩紀錄：到遊戲的「我的桌遊」分頁新增，日期選這一天'
                    : `評分完整 ${day.ratedCount} / ${day.gameCount} 款，每款都填完七項才算`}
              </span>
            </li>
          ))}
        </ul>
      )}

      <h3 className="loy-title">兌換紀錄</h3>
      {loyalty.redemptions.length === 0 ? (
        <p className="mylist-empty">還沒有兌換過。</p>
      ) : (
        <ul className="loy-days">
          {loyalty.redemptions.map((item) => (
            <li className="loy-day" key={item.id}>
              <span className="loy-day-date">
                {formatDateTime(item.redeemedAt)}
              </span>
              <span className="loy-day-text">兌換 1 張免費券</span>
            </li>
          ))}
        </ul>
      )}

      <button className="loy-refresh" type="button" onClick={loyalty.reload}>
        重新整理
      </button>
    </div>
  )
}