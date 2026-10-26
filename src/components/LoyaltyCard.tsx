import { useMemo, useRef } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import type { usePersonalCollection } from '../lib/usePersonalCollection'
import {
  useMyLoyalty,
  formatDay,
  formatDateTime,
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

  const gameMap = useMemo(
    () => new Map(boardGames.map((game) => [game.bggName, game])),
    [boardGames],
  )

  if (!loyalty.isLoggedIn) {
    return (
      <p className="mylist-hint">
        集點卡需要用 Google 登入才能使用，點數會記在你的帳號上。
      </p>
    )
  }

  if (vip.checked && !vip.isVip) {
    return <VipLock feature="集點卡" />
  }

  if (loyalty.loading) return <p className="mylist-empty">讀取中…</p>

  const summary = loyalty.summary
  const ratingsReady = ratings.status === 'ready'

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
    return (
      <div className="lc-stamp" aria-hidden="true">
        <span className="lc-stamp-month">{month} 月</span>
        <span className="lc-stamp-day">{day}</span>
        <span className="lc-stamp-text">{done ? '已蓋章' : '待蓋章'}</span>
      </div>
    )
  }

  function renderLegacyDay(day: LoyaltyDay) {
    const text = day.qualified
      ? `已得 1 點（${day.gameCount} 款都評分完整）`
      : !day.hasSession
        ? '還沒有這天的遊玩紀錄：到遊戲的「我的桌遊」分頁新增，日期選這一天'
        : `評分完整 ${day.ratedCount} / ${day.gameCount} 款，每款都填完七項才算`
    return (
      <li
        key={day.date}
        ref={focusRef(day.date)}
        className={`lc-day ${day.qualified ? 'done' : ''} ${
          focusDate === day.date ? 'focus' : ''
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
    } else if (qualified) {
      text = '已得 1 點'
    } else {
      text = '你有來！把下面任一款你玩過的遊戲，七項評分填完就會蓋章'
    }

    return (
      <li
        key={day.date}
        ref={focusRef(day.date)}
        className={`lc-day ${qualified ? 'done' : ''} ${
          focusDate === day.date ? 'focus' : ''
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

  const monthPoints = summary?.monthPoints ?? 0

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

      {summary && (
        <>
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
            <span className={`lc-reward ${monthPoints >= 2 ? 'ready' : ''}`}>
              免費券 1 張
            </span>
          </div>
          <p className="lc-progress-note">
            同一個月集滿 2 點換 1 張，券沒有期限。累積券 {summary.earnedVouchers}{' '}
            張、已兌換 {summary.redeemed} 張。
          </p>
        </>
      )}

      {summary?.overRedeemed && (
        <p className="lc-warning">
          已兌換的張數比目前累積的多（可能是後來修改了評分），請聯絡管理者核對。
        </p>
      )}

      <section className="lc-section">
        <h4 className="lc-heading">如何取得 1 點？</h4>
        <ol className="lc-steps">
          <li>
            <b>1</b>
            <span>點管理者傳的聚會連結，登入、報到，還不是 VIP 的人要輸入通關密碼。</span>
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
          <li>點數依你目前的紀錄即時計算；兌換紀錄會永久保留。</li>
          <li>只有你本人和管理者看得到你的出席與點數，其他玩家看不到。</li>
        </ul>
      </section>

      <section className="lc-section">
        <h4 className="lc-heading">近期紀錄</h4>
        {loyalty.days.length === 0 ? (
          <p className="lc-empty">還沒有被列入任何一天的聚會名單。</p>
        ) : (
          <ul className="lc-days">
            {loyalty.days.map((day) => {
              const sessions = loyalty.gatherings
                .filter((item) => item.date === day.date)
                .sort((a, b) => a.title.localeCompare(b.title, 'zh-Hant'))
              return sessions.some((item) => item.games.length > 0)
                ? renderGatheringDay(day, sessions)
                : renderLegacyDay(day)
            })}
          </ul>
        )}
      </section>

      <section className="lc-section">
        <h4 className="lc-heading">兌換歷史</h4>
        {loyalty.redemptions.length === 0 ? (
          <p className="lc-empty">還沒有兌換過。</p>
        ) : (
          <ul className="lc-tickets">
            {loyalty.redemptions.map((item) => (
              <li className="lc-ticket" key={item.id}>
                <span className="lc-ticket-title">兌換 1 張免費券</span>
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