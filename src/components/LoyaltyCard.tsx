import { useMemo, useState } from 'react'
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

type PersonalApi = ReturnType<typeof usePersonalCollection>

function splitDate(date: string): { month: string; day: string } {
  const [, month = '', day = ''] = date.split('-')
  return { month: String(Number(month)), day: String(Number(day)) }
}

export default function LoyaltyCard({
  boardGames,
  ratings,
  personal,
  playSessions,
  onOpenGame,
}: {
  boardGames: BoardGame[]
  ratings: RatingsApi
  personal: PersonalApi
  playSessions: PlaySessionsApi
  onOpenGame: (game: BoardGame, tab?: 'ratings') => void
}) {
  const loyalty = useMyLoyalty()
  const [busyKey, setBusyKey] = useState<string | null>(null)

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

  if (loyalty.loading) return <p className="mylist-empty">讀取中…</p>

  const summary = loyalty.summary
  const ratingsReady = ratings.status === 'ready'

  // 七項評分都填了才算完整（overall 沒填時資料會是 0）
  function isComplete(bggName: string): boolean {
    const mine = ratings.getMine(bggName)
    if (!mine || !(mine.overall > 0)) return false
    return RATING_FIELDS.every((field) => mine[field.key] != null)
  }

  async function togglePlayed(
    gathering: MyGathering,
    bggName: string,
    checked: boolean,
  ) {
    setBusyKey(`${gathering.id}:${bggName}`)
    const ok = await loyalty.setPlayed(gathering.id, bggName, checked)

    if (ok && checked) {
      // 當天還沒有這款的遊玩紀錄，就補一筆
      if (playSessions.status === 'ready') {
        const exists = playSessions
          .getSessions(bggName)
          .some((item) => item.playedOn === gathering.date)
        if (!exists) {
          await playSessions.addSession(bggName, {
            playedOn: gathering.date,
            playerCount: null,
            note: '',
          })
        }
      }
      // 順便標成「已玩」（不動遊玩次數，次數由遊玩紀錄計算）
      if (!personal.getEntry(bggName).played) {
        personal.updateEntry(bggName, { played: true }, { skipPlayedRule: true })
      }
    }

    if (ok) loyalty.reload()
    setBusyKey(null)
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
      <li key={day.date} className={`lc-day ${day.qualified ? 'done' : ''}`}>
        {renderStamp(day.date, day.qualified)}
        <div className="lc-day-main">
          <p className="lc-day-date">{formatDay(day.date)}</p>
          <p className="lc-day-status">{text}</p>
        </div>
      </li>
    )
  }

  function renderGatheringDay(day: LoyaltyDay, gathering: MyGathering) {
    const marked = gathering.games.filter((name) =>
      gathering.played.includes(name),
    )
    const ratedCount = marked.filter(isComplete).length
    const qualified = ratingsReady
      ? marked.length > 0 && ratedCount === marked.length
      : day.qualified

    let text: string
    if (marked.length === 0) {
      text = '請勾選你今天實際玩了哪些遊戲'
    } else if (!ratingsReady) {
      text = '評分讀取中…'
    } else if (qualified) {
      text = `已得 1 點（${marked.length} 款都評分完整）`
    } else {
      text = `評分完整 ${ratedCount} / ${marked.length} 款，每款都填完七項才算`
    }

    return (
      <li key={day.date} className={`lc-day ${qualified ? 'done' : ''}`}>
        {renderStamp(day.date, qualified)}
        <div className="lc-day-main">
          <p className="lc-day-date">{formatDay(day.date)}</p>
          <p className="lc-day-status">{text}</p>

          <ul className="lc-games">
            {gathering.games.map((bggName) => {
              const game = gameMap.get(bggName)
              const isPlayed = gathering.played.includes(bggName)
              const done = isPlayed && ratingsReady && isComplete(bggName)
              return (
                <li className="lc-game" key={bggName}>
                  <span className="lc-game-name">{game?.name ?? bggName}</span>
                  <label className="lc-played">
                    <input
                      type="checkbox"
                      checked={isPlayed}
                      disabled={busyKey !== null}
                      onChange={(event) =>
                        void togglePlayed(
                          gathering,
                          bggName,
                          event.target.checked,
                        )
                      }
                    />
                    我玩了
                  </label>
                  {isPlayed && ratingsReady && (
                    <span className="lc-game-actions">
                      <span className={`lc-game-state ${done ? 'done' : ''}`}>
                        {done ? '✓ 已評分，不用再填' : '未評分'}
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
          已兌換的張數比目前累積的多（可能是後來修改了評分或取消了標記），請聯絡管理者核對。
        </p>
      )}

      <section className="lc-section">
        <h4 className="lc-heading">如何取得 1 點？</h4>
        <ol className="lc-steps">
          <li>
            <b>1</b>
            <span>聚會當天，管理者把你列入出席名單，並設定當天的遊戲。</span>
          </li>
          <li>
            <b>2</b>
            <span>在下方聚會日，勾選你實際玩了哪幾款（「我玩了」）。</span>
          </li>
          <li>
            <b>3</b>
            <span>
              把這幾款的七項評分填完整；以前評分過的遊戲不用重填，評分隨時可修改。
            </span>
          </li>
        </ol>
        <ul className="lc-rules">
          <li>一天不管玩幾款，只算 1 點。</li>
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
              const gathering = loyalty.gatherings.find(
                (item) => item.date === day.date,
              )
              return gathering && gathering.games.length > 0
                ? renderGatheringDay(day, gathering)
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
