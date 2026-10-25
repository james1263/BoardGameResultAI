import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from './lib/supabase'
import {
  toDay,
  toRedemption,
  formatDay,
  formatDateTime,
  todayLocal,
  type LoyaltyDay,
  type Redemption,
} from './lib/useLoyalty'

type Gathering = { id: string; gatheredOn: string; note: string }
type Player = { id: string; nickname: string }
type GameOption = { bggName: string; name: string }
type OverviewRow = {
  userId: string
  nickname: string
  totalPoints: number
  monthPoints: number
  earnedVouchers: number
  redeemed: number
  availableVouchers: number
  overRedeemed: boolean
}
type Detail = {
  userId: string
  nickname: string
  days: LoyaltyDay[]
  redemptions: Redemption[]
}
type AdminTab = 'setup' | 'status'

type OverviewRaw = {
  user_id: string
  nickname: string
  total_points: number
  month_points: number
  earned_vouchers: number
  redeemed: number
  available_vouchers: number
  over_redeemed: boolean
}

function toOverview(row: OverviewRaw): OverviewRow {
  return {
    userId: row.user_id,
    nickname: row.nickname,
    totalPoints: row.total_points,
    monthPoints: row.month_points,
    earnedVouchers: row.earned_vouchers,
    redeemed: row.redeemed,
    availableVouchers: row.available_vouchers,
    overRedeemed: row.over_redeemed,
  }
}

function initialOf(name: string): string {
  return Array.from(name.trim())[0] ?? '?'
}

function dayStatus(date: string): string {
  const today = todayLocal()
  if (date === today) return '進行中'
  return date > today ? '尚未開始' : '已結束'
}

export default function LoyaltyAdmin() {
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<AdminTab>('setup')
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [gatherings, setGatherings] = useState<Gathering[]>([])
  const [attendees, setAttendees] = useState<Record<string, string[]>>({})
  const [exempts, setExempts] = useState<Record<string, string[]>>({})
  const [gatheringGames, setGatheringGames] = useState<
    Record<string, string[]>
  >({})
  const [players, setPlayers] = useState<Player[]>([])
  const [allGames, setAllGames] = useState<GameOption[]>([])
  const [overview, setOverview] = useState<OverviewRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newDate, setNewDate] = useState(todayLocal)
  const [newNote, setNewNote] = useState('')
  const [gameSearch, setGameSearch] = useState('')
  const [detail, setDetail] = useState<Detail | null>(null)

  const gameNameMap = useMemo(
    () => new Map(allGames.map((game) => [game.bggName, game.name])),
    [allGames],
  )

  async function loadAll() {
    setLoading(true)
    const [g, a, p, o, gg, bg] = await Promise.all([
      supabase
        .from('gatherings')
        .select('id, gathered_on, note')
        .order('gathered_on', { ascending: false }),
      supabase
        .from('gathering_attendees')
        .select('gathering_id, user_id, exempt'),
      supabase.from('player_profiles').select('id, nickname').order('nickname'),
      supabase.rpc('admin_get_loyalty_overview'),
      supabase.from('gathering_games').select('gathering_id, bgg_name'),
      supabase
        .from('board_games')
        .select('bgg_name, name')
        .is('removed_at', null)
        .order('name'),
    ])

    const failed = g.error ?? a.error ?? p.error ?? o.error ?? gg.error ?? bg.error
    setMessage(failed ? '讀取失敗：' + failed.message : '')

    setGatherings(
      ((g.data ?? []) as { id: string; gathered_on: string; note: string }[]).map(
        (row) => ({ id: row.id, gatheredOn: row.gathered_on, note: row.note }),
      ),
    )

    const attendeeMap: Record<string, string[]> = {}
    const exemptMap: Record<string, string[]> = {}
    for (const row of (a.data ?? []) as {
      gathering_id: string
      user_id: string
      exempt: boolean
    }[]) {
      ;(attendeeMap[row.gathering_id] ??= []).push(row.user_id)
      if (row.exempt) (exemptMap[row.gathering_id] ??= []).push(row.user_id)
    }
    setAttendees(attendeeMap)
    setExempts(exemptMap)

    const gameMap: Record<string, string[]> = {}
    for (const row of (gg.data ?? []) as {
      gathering_id: string
      bgg_name: string
    }[]) {
      ;(gameMap[row.gathering_id] ??= []).push(row.bgg_name)
    }
    setGatheringGames(gameMap)

    setAllGames(
      ((bg.data ?? []) as { bgg_name: string; name: string }[]).map((row) => ({
        bggName: row.bgg_name,
        name: row.name,
      })),
    )
    setPlayers((p.data ?? []) as Player[])
    setOverview(((o.data ?? []) as OverviewRaw[]).map(toOverview))
    setLoading(false)
  }

  async function refreshOverview() {
    const { data, error } = await supabase.rpc('admin_get_loyalty_overview')
    if (error) {
      setMessage('更新總表失敗：' + error.message)
      return
    }
    setOverview(((data ?? []) as OverviewRaw[]).map(toOverview))
  }

  function openModal() {
    setIsOpen(true)
    setTab('setup')
    setDetail(null)
    void loadAll()
  }

  async function addGathering() {
    if (!newDate) return
    setBusy(true)
    setMessage('')
    const { data, error } = await supabase
      .from('gatherings')
      .insert({ gathered_on: newDate, note: newNote.trim() })
      .select('id, gathered_on, note')
      .single()

    if (error) {
      setMessage(
        error.code === '23505'
          ? '這一天已經有聚會了，請直接選它。'
          : '新增失敗：' + error.message,
      )
    } else if (data) {
      const created: Gathering = {
        id: data.id,
        gatheredOn: data.gathered_on,
        note: data.note,
      }
      setGatherings((current) =>
        [created, ...current].sort((x, y) =>
          y.gatheredOn.localeCompare(x.gatheredOn),
        ),
      )
      setSelectedId(created.id)
      setNewNote('')
    }
    setBusy(false)
  }

  async function deleteGathering(gathering: Gathering) {
    if (
      !window.confirm(
        `確定刪除 ${formatDay(gathering.gatheredOn)} 的聚會嗎？這天的參加名單、遊戲清單與玩家的「我玩了」標記都會一起刪除，玩家的點數會跟著重新計算。`,
      )
    )
      return

    setBusy(true)
    setMessage('')
    const { error } = await supabase
      .from('gatherings')
      .delete()
      .eq('id', gathering.id)

    if (error) {
      setMessage('刪除失敗：' + error.message)
    } else {
      setGatherings((current) => current.filter((g) => g.id !== gathering.id))
      setSelectedId(null)
      await refreshOverview()
    }
    setBusy(false)
  }

  async function toggleAttendee(
    gatheringId: string,
    userId: string,
    checked: boolean,
  ) {
    setBusy(true)
    setMessage('')

    const result = checked
      ? await supabase
          .from('gathering_attendees')
          .insert({ gathering_id: gatheringId, user_id: userId })
      : await supabase
          .from('gathering_attendees')
          .delete()
          .eq('gathering_id', gatheringId)
          .eq('user_id', userId)

    if (result.error) {
      setMessage('更新名單失敗：' + result.error.message)
    } else {
      setAttendees((current) => {
        const list = current[gatheringId] ?? []
        return {
          ...current,
          [gatheringId]: checked
            ? [...list, userId]
            : list.filter((id) => id !== userId),
        }
      })
      if (!checked) {
        setExempts((current) => ({
          ...current,
          [gatheringId]: (current[gatheringId] ?? []).filter(
            (id) => id !== userId,
          ),
        }))
      }
      await refreshOverview()
    }
    setBusy(false)
  }

  // 例外：玩家有出席，但不用評分，直接算 1 點
  async function toggleExempt(
    gatheringId: string,
    userId: string,
    exempt: boolean,
  ) {
    setBusy(true)
    setMessage('')

    const { data, error } = await supabase
      .from('gathering_attendees')
      .update({ exempt })
      .eq('gathering_id', gatheringId)
      .eq('user_id', userId)
      .select('user_id')

    if (error) {
      setMessage('更新例外失敗：' + error.message)
    } else if (!data || data.length === 0) {
      setMessage('更新例外失敗：沒有權限或找不到這筆出席紀錄。')
    } else {
      setExempts((current) => {
        const list = current[gatheringId] ?? []
        return {
          ...current,
          [gatheringId]: exempt
            ? [...list.filter((id) => id !== userId), userId]
            : list.filter((id) => id !== userId),
        }
      })
      await refreshOverview()
    }
    setBusy(false)
  }

  // 產生連結：玩家打開後，登入就會直接看到自己的集點卡
  async function copyLink(date: string) {
    const link = `${window.location.origin}/?card=${date}`
    try {
      await navigator.clipboard.writeText(link)
      setMessage(`已複製連結，可以直接傳給玩家：${link}`)
    } catch {
      window.prompt('請複製這個連結：', link)
    }
  }

  async function addGame(gatheringId: string, bggName: string) {
    setBusy(true)
    setMessage('')
    const { error } = await supabase
      .from('gathering_games')
      .insert({ gathering_id: gatheringId, bgg_name: bggName })

    if (error) {
      setMessage('新增遊戲失敗：' + error.message)
    } else {
      setGatheringGames((current) => ({
        ...current,
        [gatheringId]: [...(current[gatheringId] ?? []), bggName],
      }))
      setGameSearch('')
      await refreshOverview()
    }
    setBusy(false)
  }

  async function removeGame(gatheringId: string, bggName: string) {
    const name = gameNameMap.get(bggName) ?? bggName
    if (
      !window.confirm(
        `確定從這一天移除「${name}」嗎？玩家對它的「我玩了」標記會失效，點數會重新計算。`,
      )
    )
      return

    setBusy(true)
    setMessage('')
    const { error } = await supabase
      .from('gathering_games')
      .delete()
      .eq('gathering_id', gatheringId)
      .eq('bgg_name', bggName)

    if (error) {
      setMessage('移除遊戲失敗：' + error.message)
    } else {
      setGatheringGames((current) => ({
        ...current,
        [gatheringId]: (current[gatheringId] ?? []).filter(
          (item) => item !== bggName,
        ),
      }))
      await refreshOverview()
    }
    setBusy(false)
  }

  async function showDetail(row: OverviewRow) {
    setBusy(true)
    setMessage('')
    const [d, r] = await Promise.all([
      supabase.rpc('admin_get_loyalty_days', { p_user: row.userId }),
      supabase
        .from('loyalty_redemptions')
        .select('id, redeemed_at')
        .eq('user_id', row.userId)
        .order('redeemed_at', { ascending: false }),
    ])

    const failed = d.error ?? r.error
    if (failed) {
      setMessage('讀取明細失敗：' + failed.message)
    } else {
      setDetail({
        userId: row.userId,
        nickname: row.nickname,
        days: (
          (d.data ?? []) as {
            day_date: string
            game_count: number
            rated_count: number
            has_session: boolean
            qualified: boolean
          }[]
        ).map(toDay),
        redemptions: (
          (r.data ?? []) as { id: string; redeemed_at: string }[]
        ).map(toRedemption),
      })
    }
    setBusy(false)
  }

  async function redeem(row: OverviewRow) {
    if (
      !window.confirm(
        `確定為「${row.nickname}」兌換 1 張免費券嗎？\n目前可用 ${row.availableVouchers} 張，兌換後無法復原。`,
      )
    )
      return

    setBusy(true)
    setMessage('')
    const { data, error } = await supabase.rpc('admin_redeem_voucher', {
      p_user: row.userId,
    })

    if (error) {
      setMessage('兌換失敗：' + error.message)
    } else {
      setMessage(`已為「${row.nickname}」兌換 1 張，剩下 ${data ?? 0} 張可用。`)
      await refreshOverview()
      if (detail?.userId === row.userId) await showDetail(row)
    }
    setBusy(false)
  }

  const selected = gatherings.find((g) => g.id === selectedId) ?? null
  const selectedAttendees = selected ? (attendees[selected.id] ?? []) : []
  const selectedExempts = selected ? (exempts[selected.id] ?? []) : []
  const selectedGames = selected ? (gatheringGames[selected.id] ?? []) : []

  const searchText = gameSearch.trim().toLocaleLowerCase()
  const gameMatches = searchText
    ? allGames
        .filter(
          (game) =>
            !selectedGames.includes(game.bggName) &&
            (game.name.toLocaleLowerCase().includes(searchText) ||
              game.bggName.toLocaleLowerCase().includes(searchText)),
        )
        .slice(0, 8)
    : []

  return (
    <>
      <button className="mylist-button" type="button" onClick={openModal}>
        聚會與集點
      </button>

      {isOpen &&
        createPortal(
          <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
            <div
              className="admin-modal loy-admin"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="lga-head">
                <span className="lga-head-icon" aria-hidden="true">
                  🎴
                </span>
                <div className="lga-head-text">
                  <h2>聚會與集點</h2>
                  <p>GATHERINGS &amp; REWARDS</p>
                </div>
                <span className="lga-badge">管理者</span>
                <button
                  type="button"
                  className="lga-close"
                  aria-label="關閉"
                  onClick={() => setIsOpen(false)}
                >
                  ✕
                </button>
              </div>

              {loading && <p className="loy-admin-note">讀取中…</p>}
              {message && <p className="loy-admin-message">{message}</p>}

              <div className="loy-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'setup'}
                  className={`loy-tab ${tab === 'setup' ? 'active' : ''}`}
                  onClick={() => setTab('setup')}
                >
                  聚會設定
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'status'}
                  className={`loy-tab ${tab === 'status' ? 'active' : ''}`}
                  onClick={() => setTab('status')}
                >
                  集點狀況
                </button>
              </div>

              {tab === 'setup' && (
                <>
                  <section className="lga-card">
                    <h3 className="lga-step">
                      <span>1</span>新增聚會日
                    </h3>
                    <div className="lga-new">
                      <input
                        type="date"
                        value={newDate}
                        onChange={(event) => setNewDate(event.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="備註（選填，200 字內）"
                        maxLength={200}
                        value={newNote}
                        onChange={(event) => setNewNote(event.target.value)}
                      />
                      <button
                        className="lga-primary"
                        type="button"
                        disabled={busy || !newDate}
                        onClick={addGathering}
                      >
                        ＋ 新增聚會
                      </button>
                    </div>
                  </section>

                  <section className="lga-section">
                    <h3 className="lga-step">
                      <span>2</span>近期聚會
                    </h3>
                    {gatherings.length === 0 ? (
                      <p className="loy-admin-note">還沒有聚會日。</p>
                    ) : (
                      <ul className="lga-list">
                        {gatherings.map((g) => {
                          const [, month, day] = g.gatheredOn.split('-')
                          const status = dayStatus(g.gatheredOn)
                          return (
                            <li key={g.id}>
                              <button
                                type="button"
                                className={`lga-row ${
                                  g.id === selectedId ? 'active' : ''
                                }`}
                                onClick={() =>
                                  setSelectedId(g.id === selectedId ? null : g.id)
                                }
                              >
                                <span className="lga-date">
                                  <small>{Number(month)} 月</small>
                                  <strong>{Number(day)}</strong>
                                </span>
                                <span className="lga-row-main">
                                  <strong>{g.note || '桌遊聚會'}</strong>
                                  <small>
                                    {formatDay(g.gatheredOn)}・
                                    {(attendees[g.id] ?? []).length} 人・
                                    {(gatheringGames[g.id] ?? []).length} 款
                                  </small>
                                </span>
                                <span
                                  className={`lga-status ${
                                    status === '已結束' ? 'done' : ''
                                  }`}
                                >
                                  {status}
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </section>

                  {selected && (
                    <section className="lga-card lga-detail">
                      <div className="lga-detail-head">
                        <h3>
                          聚會詳情 — {formatDay(selected.gatheredOn)}
                        </h3>
                        <div className="lga-detail-actions">
                          <button
                            type="button"
                            className="lga-outline"
                            disabled={busy}
                            onClick={() => copyLink(selected.gatheredOn)}
                          >
                            🔗 複製集點卡連結
                          </button>
                          <button
                            type="button"
                            className="lga-danger"
                            disabled={busy}
                            onClick={() => deleteGathering(selected)}
                          >
                            刪除這一天
                          </button>
                        </div>
                      </div>

                      <h4 className="lga-sub">
                        參加者（{selectedAttendees.length} / {players.length}）
                      </h4>
                      <p className="loy-admin-note">
                        點名字即可勾選出席，立即儲存。出席的人下方有「免評分」：
                        適合中途離開、來不及評分的玩家，開啟後這一天直接算 1 點。
                        玩家只看得到自己的出席。
                      </p>
                      {players.length === 0 ? (
                        <p className="loy-admin-note">
                          還沒有玩家設定暱稱。
                        </p>
                      ) : (
                        <ul className="lga-chips">
                          {players.map((player) => {
                            const attending = selectedAttendees.includes(
                              player.id,
                            )
                            const exempt = selectedExempts.includes(player.id)
                            return (
                              <li
                                key={player.id}
                                className={`lga-chip ${
                                  attending ? 'on' : ''
                                }`}
                              >
                                <button
                                  type="button"
                                  className="lga-chip-main"
                                  disabled={busy}
                                  aria-pressed={attending}
                                  onClick={() =>
                                    toggleAttendee(
                                      selected.id,
                                      player.id,
                                      !attending,
                                    )
                                  }
                                >
                                  <span className="lga-avatar">
                                    {initialOf(player.nickname)}
                                  </span>
                                  <span className="lga-chip-name">
                                    {player.nickname}
                                  </span>
                                  {attending && (
                                    <span className="lga-check">✓</span>
                                  )}
                                </button>
                                {attending && (
                                  <button
                                    type="button"
                                    className={`lga-exempt ${
                                      exempt ? 'on' : ''
                                    }`}
                                    disabled={busy}
                                    aria-pressed={exempt}
                                    onClick={() =>
                                      toggleExempt(
                                        selected.id,
                                        player.id,
                                        !exempt,
                                      )
                                    }
                                  >
                                    {exempt ? '✓ 免評分（已給點）' : '免評分'}
                                  </button>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      )}

                      <h4 className="lga-sub">
                        指定遊戲（{selectedGames.length} 款）
                      </h4>
                      <p className="loy-admin-note">
                        玩家會在集點卡看到這份清單，自己勾「我玩了」並評分。
                        加入第一款遊戲後，這一天就改用新規則；沒有加遊戲的舊聚會日，維持舊規則。
                      </p>
                      <div className="lga-new lga-search">
                        <input
                          type="text"
                          placeholder="搜尋遊戲名稱…"
                          value={gameSearch}
                          onChange={(event) => setGameSearch(event.target.value)}
                        />
                      </div>
                      {gameMatches.length > 0 && (
                        <ul className="loy-picker-results">
                          {gameMatches.map((game) => (
                            <li key={game.bggName}>
                              <span>{game.name}</span>
                              <button
                                type="button"
                                className="loy-mini-btn"
                                disabled={busy}
                                onClick={() => addGame(selected.id, game.bggName)}
                              >
                                ＋ 加入
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {searchText && gameMatches.length === 0 && (
                        <p className="loy-admin-note">找不到符合的遊戲。</p>
                      )}

                      {selectedGames.length === 0 ? (
                        <p className="loy-admin-note">還沒有選遊戲。</p>
                      ) : (
                        <ul className="loy-picked">
                          {selectedGames.map((bggName) => (
                            <li key={bggName}>
                              <span>{gameNameMap.get(bggName) ?? bggName}</span>
                              <button
                                type="button"
                                className="loy-mini-btn"
                                disabled={busy}
                                onClick={() => removeGame(selected.id, bggName)}
                              >
                                移除
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  )}
                </>
              )}

              {tab === 'status' && (
                <>
                  <h3 className="lga-step">
                    <span>★</span>大家的集點狀況（對帳用）
                  </h3>
                  {overview.length === 0 ? (
                    <p>還沒有任何人被列入聚會名單。</p>
                  ) : (
                    <div className="loy-admin-tablewrap">
                      <table className="loy-admin-table">
                        <thead>
                          <tr>
                            <th>暱稱</th>
                            <th>本月</th>
                            <th>總點數</th>
                            <th>累積券</th>
                            <th>已兌換</th>
                            <th>可用</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {overview.map((row) => (
                            <tr key={row.userId}>
                              <td>
                                {row.nickname}
                                {row.overRedeemed && (
                                  <span
                                    className="loy-flag"
                                    title="已兌換超過目前累積"
                                  >
                                    ⚠
                                  </span>
                                )}
                              </td>
                              <td>{row.monthPoints}</td>
                              <td>{row.totalPoints}</td>
                              <td>{row.earnedVouchers}</td>
                              <td>{row.redeemed}</td>
                              <td>{row.availableVouchers}</td>
                              <td className="loy-admin-actions">
                                <button
                                  type="button"
                                  className="admin-link"
                                  disabled={busy}
                                  onClick={() => showDetail(row)}
                                >
                                  明細
                                </button>
                                <button
                                  type="button"
                                  className="admin-link"
                                  disabled={busy || row.availableVouchers < 1}
                                  onClick={() => redeem(row)}
                                >
                                  兌換
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <p className="loy-admin-note">
                    ⚠ 代表「已兌換的張數 &gt; 目前累積」，通常是玩家領券後改了評分或取消了標記。
                  </p>
                  <button
                    className="loy-refresh"
                    type="button"
                    disabled={busy}
                    onClick={refreshOverview}
                  >
                    重新整理
                  </button>

                  {detail && (
                    <div className="loy-admin-detail">
                      <h3>{detail.nickname} 的明細</h3>
                      {detail.days.length === 0 ? (
                        <p>沒有被列入任何聚會日。</p>
                      ) : (
                        <ul>
                          {detail.days.map((day) => (
                            <li key={day.date}>
                              {formatDay(day.date)}：
                              {day.qualified
                                ? '✓ 得 1 點'
                                : !day.hasSession
                                  ? '還沒有標記玩過的遊戲（或沒有當天遊玩紀錄）'
                                  : `評分完整 ${day.ratedCount} / ${day.gameCount} 款`}
                            </li>
                          ))}
                        </ul>
                      )}
                      <p>
                        兌換紀錄：
                        {detail.redemptions.length === 0
                          ? '無'
                          : detail.redemptions
                              .map((item) => formatDateTime(item.redeemedAt))
                              .join('、')}
                      </p>
                    </div>
                  )}
                </>
              )}

              <button
                className="admin-cancel"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                關閉
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
