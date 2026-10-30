import { useMemo, useRef, useState } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import type { usePersonalCollection } from '../lib/usePersonalCollection'
import {
  useMyLoyalty,
  formatDay,
  formatDateTime,
  todayLocal,
  type LoyaltyDay,
  type MyGathering,
} from '../lib/useLoyalty'
import { RATING_FIELDS, type RatingsApi } from '../lib/useGameRatings'
import type { PlaySessionsApi } from '../lib/useGamePlaySessions'
import { useVip } from '../lib/useVip'
import VipLock from './VipLock'

type PersonalApi = ReturnType<typeof usePersonalCollection>

function splitDate(date: string): { month: string; day: string } {
  const [, month = '', day = ''] = date.split('-')
  return { month: String(Number(month)), day: String(Number(day)) }
}

export default function LoyaltyCard({
  boardGames,
  ratings,
  focusDate,
  onOpenGame,
}: {
  boardGames: BoardGame[]
  ratings: RatingsApi
  personal?: PersonalApi
  playSessions?: PlaySessionsApi
  focusDate?: string | null
  onOpenGame: (game: BoardGame, tab?: 'ratings') => void
}) {
  const loyalty = useMyLoyalty()
  const vip = useVip()
  const scrolledRef = useRef(false)
  const [showAllDays, setShowAllDays] = useState(false)
  const RECENT_DAYS = 5

  const gameMap = useMemo(
    () => new Map(boardGames.map((game) => [game.bggName, game])),
    [boardGames],
  )

  if (!loyalty.isLoggedIn) {
    return (
      <p className="mylist-hint">
        集點卡是 VIP 專屬功能：請先用 Google 登入，再成為 VIP。點數會記在你的帳號上。
      </p>
    )
  }

  if (vip.checked && !vip.isVip) {
    return <VipLock feature="集點卡" />
  }

  if (loyalty.loading) return <p className="mylist-empty">讀取中…</p>

  const summary = loyalty.summary
  const ratingsReady = ratings.status === 'ready'
  // 玩家自己用過免費券的聚會日（那天不集點）
  const usedDates = new Set(
    loyalty.redemptions.flatMap((item) => (item.usedOn ? [item.usedOn] : [])),
  )

  // 七項評分都填了才算完整（overall 沒填時資料會是 0）
  function isComplete(bggName: string): boolean {
    const mine = ratings.getMine(bggName)
    if (!mine || !(mine.overall > 0)) return false
    return RATING_FIELDS.every((field) => mine[field.key] != null)
  }

  // 從邀請連結進來時，自動捲到連結指定的那一天
  function focusRef(date: string) {
    return (element: HTMLLIElement | null) => {
      if (element && focusDate === date && !scrolledRef.current) {
        scrolledRef.current = true
        element.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
  }

  function renderStamp(date: string, done: boolean) {
    const { month, day } = splitDate(date)
    const used = usedDates.has(date)
    return (
      <div className="lc-stamp" aria-hidden="true">
        <span className="lc-stamp-month">{month} 月</span>
        <span className="lc-stamp-day">{day}</span>
        <span className="lc-stamp-text">
          {used ? '已用券' : done ? '已蓋章' : '待蓋章'}
        </span>
      </div>
    )
  }

  function renderLegacyDay(day: LoyaltyDay) {
    const isUpcoming = day.date >= todayLocal() && !day.qualified
    const text = usedDates.has(day.date)
      ? '這天使用了 1 張免費券，不集點'
      : day.qualified
      ? `已得 1 點（${day.gameCount} 款都評分完整）`
      : isUpcoming
        ? '你已經在這天的出席名單上。管理者還沒指定要評分的遊戲，指定後這裡會出現遊戲，評完分就蓋章。'
        : !day.hasSession
          ? '還沒有這天的遊玩紀錄：到遊戲的「我的紀錄」分頁新增，日期選這一天'
          : `評分完整 ${day.ratedCount} / ${day.gameCount} 款，每款都填完七項才算`
    return (
      <li
        key={day.date}
        ref={focusRef(day.date)}
        className={`lc-day ${day.qualified ? 'done' : ''} ${focusDate === day.date ? 'focus' : ''
          }`}
      >
        {renderStamp(day.date, day.qualified)}
        <div className="lc-day-main">
          <p className="lc-day-date">{formatDay(day.date)}</p>
          <p className="lc-day-status">{text}</p>
        </div>
      </li>
    )
  }

  // 同一天可能有好幾場：合併成一張印章，點數仍然一天 1 點
  function renderGatheringDay(day: LoyaltyDay, sessions: MyGathering[]) {
    const completeCount = sessions
      .flatMap((session) => session.games)
      .filter((name) => isComplete(name)).length
    const qualified = day.qualified || (ratingsReady && completeCount > 0)

    let text: string
    if (!ratingsReady) {
      text = '評分讀取中…'
    } else if (usedDates.has(day.date)) {
      text = '這天使用了 1 張免費券，不集點'
    } else if (qualified) {
      text = '已得 1 點'
    } else {
      text = '你有來！把下面任一款你玩過的遊戲，七項評分填完就會蓋章'
    }

    return (
      <li
        key={day.date}
        ref={focusRef(day.date)}
        className={`lc-day ${qualified ? 'done' : ''} ${focusDate === day.date ? 'focus' : ''
          }`}
      >
        {renderStamp(day.date, qualified)}
        <div className="lc-day-main">
          <p className="lc-day-date">{formatDay(day.date)}</p>
          <p className="lc-day-status">{text}</p>

          {sessions.map((session) => (
            <div className="lc-session" key={session.id}>
              {sessions.length > 1 && (
                <p className="lc-session-title">{session.title || '聚會'}</p>
              )}
              {session.games.length === 0 ? (
                <p className="lc-day-status">這一場沒有指定遊戲</p>
              ) : (
                <ul className="lc-games">
                  {session.games.map((bggName) => {
                    const game = gameMap.get(bggName)
                    const done = ratingsReady && isComplete(bggName)
                    return (
                      <li className="lc-game" key={bggName}>
                        <span className="lc-game-name">
                          {game?.name ?? bggName}
                        </span>
                        {ratingsReady && (
                          <span className="lc-game-actions">
                            <span
                              className={`lc-game-state ${done ? 'done' : ''}`}
                            >
                              {done ? '✓ 已評分' : '未評分'}
                            </span>
                            {game && (
                              <button
                                type="button"
                                className="lc-btn"
                                onClick={() => onOpenGame(game, 'ratings')}
                              >
                                {done ? '查看／修改' : '去評分'}
                              </button>
                            )}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      </li>
    )
  }

  // 今天有被列入、有指定遊戲、還沒得點：顯示「今天要評分」
  const todayDate = todayLocal()
  const todayGames = Array.from(
    new Set(
      loyalty.gatherings
        .filter((item) => item.date === todayDate)
        .flatMap((item) => item.games),
    ),
  )
  const attendingToday = loyalty.days.some((day) => day.date === todayDate)
  const todayQualified =
    loyalty.days.some((day) => day.date === todayDate && day.qualified) ||
    todayGames.some((name) => isComplete(name))
  const showTodayTask =
    ratingsReady && attendingToday && todayGames.length > 0 && !todayQualified
  const monthPoints = summary?.monthPoints ?? 0
  const usableVouchers = summary?.usableVouchers ?? 0
  const pendingVouchers = Math.max(
    0,
    (summary?.availableVouchers ?? 0) - usableVouchers,
  )
  const usedToday = usedDates.has(todayDate)

  // 近期紀錄預設只顯示最近幾筆；從連結指定的那一天若在被收起的部分，就自動全部展開
  const focusHidden = focusDate
    ? loyalty.days.findIndex((day) => day.date === focusDate) >= RECENT_DAYS
    : false
  const daysExpanded = showAllDays || focusHidden
  const visibleDays = daysExpanded
    ? loyalty.days
    : loyalty.days.slice(0, RECENT_DAYS)

  // 有可用的券、今天有來、還沒評分：提醒評完分會自動用券
  const voucherWaiting =
    ratingsReady && attendingToday && !todayQualified && !usedToday && usableVouchers > 0

  return (
    <div className="lc">
      {loyalty.error && <p className="lc-error">讀取失敗：{loyalty.error}</p>}


      <header className="lc-banner">
        <span className="lc-banner-kicker">BOARD GAME NIGHT</span>
        <h3 className="lc-banner-title">桌遊聚會集點卡</h3>
        <p className="lc-banner-sub">一起玩，一起蓋印章！</p>
        <span className="lc-banner-mark" aria-hidden="true">
          ♟
        </span>
      </header>

      {usedToday && (
        <section className="lc-today lc-today-ticket">
          <p className="lc-today-kicker">🎟 免費券</p>
          <h4 className="lc-today-title">今天已自動使用 1 張免費券</h4>
          <p className="lc-today-sub">
            有券又有來的人，評分完成後系統會自動用券，今天不集點。
          </p>
        </section>
      )}
      {voucherWaiting && (
        <section className="lc-today lc-today-ticket">
          <p className="lc-today-kicker">🎟 免費券</p>
          <h4 className="lc-today-title">你有 {usableVouchers} 張免費券可以用</h4>
          <p className="lc-today-sub">
            評分完成後會自動使用 1 張，今天就不集點了。
          </p>
        </section>
      )}
      {showTodayTask && (
        <section className="lc-today">
          <p className="lc-today-kicker">今天要做的事</p>
          <h4 className="lc-today-title">評一款今天玩的遊戲，就能蓋章</h4>
          <p className="lc-today-sub">七項評分填完整就得 1 點。</p>
          <ul className="lc-games">
            {todayGames.map((bggName) => {
              const game = gameMap.get(bggName)
              return (
                <li className="lc-game" key={bggName}>
                  <span className="lc-game-name">{game?.name ?? bggName}</span>
                  {game && (
                    <button
                      type="button"
                      className="lc-btn"
                      onClick={() => onOpenGame(game, 'ratings')}
                    >
                      去評分
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {summary && (
        <div className="lc-wallet">
          <div className="lc-stats">
            <div className="lc-stat">
              <span className="lc-stat-label">本月點數</span>
              <strong className="lc-stat-num">
                {summary.monthPoints}
                <small>點</small>
              </strong>
            </div>
            <div className="lc-stat lc-stat-ticket">
              <span className="lc-stat-label">可用免費券</span>
              <strong className="lc-stat-num">
                {summary.availableVouchers}
                <small>張</small>
              </strong>
              {pendingVouchers > 0 && (
                <small className="lc-stat-sub">
                  其中 {pendingVouchers} 張明天起才能用
                </small>
              )}
            </div>
          </div>

          <div className="lc-progress">
            <div className="lc-slots">
              {[0, 1].map((index) => (
                <span
                  key={index}
                  className={`lc-slot ${monthPoints > index ? 'filled' : ''}`}
                >
                  {monthPoints > index ? '✓' : index + 1}
                </span>
              ))}
            </div>
            <span className="lc-progress-arrow" aria-hidden="true">
              →
            </span>
            <span
              className={`lc-reward ${summary.availableVouchers > 0 ? 'ready' : ''}`}
            >
              免費券 1 張
            </span>
          </div>
          <p className="lc-progress-note">
            同一個月集滿 2 點，自動變成 1 張免費券，點數歸零。累積券{' '}
            {summary.earnedVouchers} 張・已使用 {summary.redeemed} 張。
          </p>
        </div>
      )}

      {summary?.overRedeemed && (
        <p className="lc-warning">
          已兌換的張數比目前累積的多（可能是後來修改了評分），請聯絡管理者核對。
        </p>
      )}

      <details className="lc-fold">
        <summary>如何取得點數？規則說明</summary>
        <ol className="lc-steps">
          <li>
            <b>1</b>
            <span>
              點管理者傳的聚會連結，登入並報到（報到後就是 VIP）；管理者直接幫你加入名單的人，不用點連結。
            </span>
          </li>
          <li>
            <b>2</b>
            <span>
              在下方聚會日，把當天任一款你玩過的遊戲，七項評分填完整，就蓋章得 1 點。
            </span>
          </li>
          <li>
            <b>3</b>
            <span>評分可以在家補、隨時修改；以前評分過的遊戲不用重填。</span>
          </li>
        </ol>
        <ul className="lc-rules">
          <li>一天不管玩幾款、參加幾場，只算 1 點。</li>
          <li>當月只集到 1 點，到下個月 1 日就不再計入。</li>
          <li>免費券沒有期限，但要拿到的隔天起才會自動使用。</li>
          <li>
            有可用的免費券時，報到並評分後系統會自動用券（不能累積）；用券那天不集點。
          </li>
          <li>事後修改或刪除評分，不會退回已使用的點數或免費券。</li>
          <li>點數依你目前的紀錄即時計算；免費券使用紀錄會永久保留。</li>
          <li>只有你本人和管理者看得到你的出席與點數，其他玩家看不到。</li>
        </ul>
      </details>

      <section className="lc-section">
        <h4 className="lc-heading">近期紀錄</h4>
        {loyalty.days.length === 0 ? (
          <p className="lc-empty">還沒有被列入任何一天的聚會名單。</p>
        ) : (
          <>
            <ul className="lc-days">
              {visibleDays.map((day) => {
                const sessions = loyalty.gatherings
                  .filter((item) => item.date === day.date)
                  .sort((a, b) => a.title.localeCompare(b.title, 'zh-Hant'))
                return sessions.some((item) => item.games.length > 0)
                  ? renderGatheringDay(day, sessions)
                  : renderLegacyDay(day)
              })}
            </ul>
            {loyalty.days.length > RECENT_DAYS && !focusHidden && (
              <button
                type="button"
                className="lc-more"
                onClick={() => setShowAllDays((value) => !value)}
              >
                {showAllDays
                  ? '收起較早的紀錄 ▴'
                  : `顯示全部 ${loyalty.days.length} 筆 ▾`}
              </button>
            )}
          </>
        )}
      </section>

      <section className="lc-section">
        <h4 className="lc-heading">免費券使用紀錄</h4>
        {loyalty.redemptions.length === 0 ? (
          <p className="lc-empty">還沒有兌換過。</p>
        ) : (
          <ul className="lc-tickets">
            {loyalty.redemptions.map((item) => (
              <li className="lc-ticket" key={item.id}>
                <span className="lc-ticket-title">
                  {item.usedOn
                    ? `${formatDay(item.usedOn)} 使用 1 張免費券`
                    : '兌換 1 張免費券（管理者補登）'}
                </span>
                <span className="lc-ticket-date">
                  {formatDateTime(item.redeemedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button className="lc-refresh" type="button" onClick={loyalty.reload}>
        重新整理
      </button>
    </div>
  )
}
