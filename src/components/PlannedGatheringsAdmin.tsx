import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { todayLocal } from '../lib/useGamePlaySessions'
import {
  formatPlannedWhen,
  plannedStatusLabel,
  toPlanned,
  type PlannedGathering,
  type PlannedRaw,
} from '../lib/usePlannedGatherings'
import '../styles/planned.css'

type GameOption = { bggName: string; name: string }
type GatheringOption = { id: string; label: string; gatheredOn: string }
type Voter = { user_id: string; nickname: string; contact_name: string | null }
type WantPerson = { userId: string; nickname: string; contact: string }

type Form = {
  id: string | null
  date: string
  time: string
  title: string
  note: string
  games: string[]
}

function emptyForm(): Form {
  return { id: null, date: todayLocal(), time: '', title: '', note: '', games: [] }
}

export default function PlannedGatheringsAdmin({
  allGames,
  gatherings,
}: {
  allGames: GameOption[]
  gatherings: GatheringOption[]
}) {
  const [rows, setRows] = useState<PlannedGathering[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState<Form>(emptyForm)
  const [search, setSearch] = useState('')
  const [convertId, setConvertId] = useState<string | null>(null)
  const [convertTarget, setConvertTarget] = useState('')
  const [voters, setVoters] = useState<{ id: string; list: Voter[] } | null>(null)

  const today = todayLocal()

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('admin_get_planned_gatherings')
    if (error) {
      setMessage('讀取預計聚會失敗：' + error.message)
    } else {
      setRows(((data ?? []) as PlannedRaw[]).map(toPlanned))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // 管理者專用：每位 VIP／管理者想玩的遊戲，只用來算「社群有 N 人想玩」
  const [wantMap, setWantMap] = useState<Map<string, Set<string>> | null>(null)
  useEffect(() => {
    let cancelled = false
    void supabase.rpc('admin_get_want_to_play').then(({ data, error }) => {
      if (cancelled || error || !data) return
      setWantMap(
        new Map(
          (data as { user_id: string; games: string[] | null }[]).map(
            (row) => [row.user_id, new Set(row.games ?? [])] as [string, Set<string>],
          ),
        ),
      )
    })
    return () => {
      cancelled = true
    }
  }, [])

  // 管理者專用：每款遊戲有哪些人想玩（暱稱＋LINE／FB）。失敗時只是沒有「▾」，不影響其他功能
  const [peopleMap, setPeopleMap] = useState<Map<string, WantPerson[]> | null>(null)
  const [openWant, setOpenWant] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    void supabase.rpc('admin_get_want_to_play_people').then(({ data, error }) => {
      if (cancelled || error || !data) return
      const map = new Map<string, WantPerson[]>()
      for (const row of data as {
        bgg_name: string
        user_id: string
        nickname: string | null
        contact_name: string | null
      }[]) {
        const list = map.get(row.bgg_name) ?? []
        if (list.some((person) => person.userId === row.user_id)) continue
        list.push({
          userId: row.user_id,
          nickname: (row.nickname ?? '').trim(),
          contact: (row.contact_name ?? '').trim(),
        })
        map.set(row.bgg_name, list)
      }
      setPeopleMap(map)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const wantCount = (bggName: string): number =>
    wantMap
      ? [...wantMap.values()].filter((set) => set.has(bggName)).length
      : (peopleMap?.get(bggName)?.length ?? 0)
  const hasWantData = wantMap !== null || peopleMap !== null
  const wantHintStyle = { marginLeft: 8, fontSize: '0.8em', color: '#8a6d46' }

  function renderWant(bggName: string) {
    if (!hasWantData) return null
    const count = wantCount(bggName)
    const people = peopleMap?.get(bggName) ?? []
    const canOpen = people.length > 0
    const isOpen = openWant === bggName
    return (
      <>
        <small style={wantHintStyle}>社群有 {count} 人想玩</small>
        {canOpen && (
          <button
            type="button"
            aria-expanded={isOpen}
            onClick={() => setOpenWant(isOpen ? null : bggName)}
            style={{
              marginLeft: 4,
              padding: '0 4px',
              border: 'none',
              background: 'none',
              color: '#8a6d46',
              fontSize: '0.8em',
              cursor: 'pointer',
            }}
          >
            {isOpen ? '▴' : '▾'}
          </button>
        )}
        {canOpen && isOpen && (
          <small
            style={{ display: 'block', marginTop: 4, color: '#6b5a3c', lineHeight: 1.6 }}
          >
            {people
              .map(
                (person) =>
                  `${person.nickname || '（未設暱稱）'}${
                    person.contact ? `（${person.contact}）` : ''
                  }`,
              )
              .join('、')}
          </small>
        )}
      </>
    )
  }

  const gameNameMap = useMemo(
    () => new Map(allGames.map((game) => [game.bggName, game.name])),
    [allGames],
  )

  const query = search.trim().toLocaleLowerCase()
  const matches = query
    ? allGames
        .filter(
          (game) =>
            !form.games.includes(game.bggName) &&
            (game.name.toLocaleLowerCase().includes(query) ||
              game.bggName.toLocaleLowerCase().includes(query)),
        )
        .slice(0, 8)
    : []

  const activeCount = rows.filter((row) => row.plannedOn >= today).length

  async function save() {
    const title = form.title.trim()
    if (!form.date) {
      setMessage('請選日期。')
      return
    }
    if (!title) {
      setMessage('請填標題（例如：週六下午場），同一天有多場時用來分辨。')
      return
    }
    setBusy(true)
    setMessage('')
    const { error } = await supabase.rpc('admin_save_planned_gathering', {
      p_id: form.id,
      p_planned_on: form.date,
      p_start_time: form.time || null,
      p_title: title,
      p_note: form.note.trim(),
      p_games: form.games,
    })
    if (error) {
      setMessage('儲存失敗：' + error.message)
    } else {
      setMessage(form.id ? '已儲存修改。' : '已新增預計聚會。')
      setForm(emptyForm())
      setSearch('')
      await load()
    }
    setBusy(false)
  }

  function startEdit(row: PlannedGathering) {
    setForm({
      id: row.id,
      date: row.plannedOn,
      time: row.startTime ? row.startTime.slice(0, 5) : '',
      title: row.title,
      note: row.note,
      games: row.games,
    })
    setSearch('')
    setMessage('')
  }

  async function changeStatus(
    row: PlannedGathering,
    status: 'open' | 'cancelled' | 'converted',
    gatheringId: string | null = null,
  ) {
    setBusy(true)
    setMessage('')
    const { error } = await supabase.rpc('admin_set_planned_status', {
      p_planned: row.id,
      p_status: status,
      p_gathering: gatheringId,
    })
    if (error) {
      setMessage('更新狀態失敗：' + error.message)
    } else {
      setConvertId(null)
      await load()
    }
    setBusy(false)
  }

  async function remove(row: PlannedGathering) {
    if (
      !window.confirm(
        `確定刪除「${formatPlannedWhen(row.plannedOn, row.startTime)} ${row.title}」嗎？這場的遊戲清單與大家的意願登記都會一起刪除。\n\n如果只是不開了，請改按「取消聚會」，會員才看得到「已取消」。`,
      )
    )
      return
    setBusy(true)
    setMessage('')
    const { error } = await supabase.rpc('admin_delete_planned_gathering', {
      p_planned: row.id,
    })
    if (error) {
      setMessage('刪除失敗：' + error.message)
    } else {
      if (form.id === row.id) setForm(emptyForm())
      await load()
    }
    setBusy(false)
  }

  async function toggleVoters(row: PlannedGathering) {
    if (voters?.id === row.id) {
      setVoters(null)
      return
    }
    setBusy(true)
    setMessage('')
    const { data, error } = await supabase.rpc('admin_get_planned_voters', {
      p_planned: row.id,
    })
    if (error) {
      setMessage('讀取意願名單失敗：' + error.message)
    } else {
      setVoters({ id: row.id, list: (data ?? []) as Voter[] })
    }
    setBusy(false)
  }

  return (
    <details className="pg-fold">
      <summary>
        預計聚會{activeCount > 0 ? `（${activeCount} 場）` : ''}
      </summary>

      <section className="lga-card">
        {message && <p className="loy-admin-message">{message}</p>}
        <p className="loy-admin-note">
          預計聚會只給 VIP 看，會員按「我可以去」表示有意願，不等於正式報名。同一天可以建多場，用開始時間和標題分辨。
        </p>

        <h4 className="lga-sub">{form.id ? '修改預計聚會' : '新增預計聚會'}</h4>
        <div className="pg-form">
          <div className="pg-form-row">
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
            />
            <input
              type="time"
              aria-label="開始時間（選填）"
              value={form.time}
              onChange={(event) => setForm({ ...form, time: event.target.value })}
            />
          </div>
          <input
            type="text"
            placeholder="標題（必填，例如：週六下午場）"
            maxLength={40}
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
          <input
            type="text"
            placeholder="備註（選填，200 字內）"
            maxLength={200}
            value={form.note}
            onChange={(event) => setForm({ ...form, note: event.target.value })}
          />
          <input
            type="search"
            placeholder="搜尋要加入的預計遊戲…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {matches.length > 0 && (
          <ul className="loy-picker-results">
            {matches.map((game) => (
              <li key={game.bggName}>
                <span>
                  {game.name}
                  {renderWant(game.bggName)}
                </span>
                <button
                  type="button"
                  className="loy-mini-btn"
                  onClick={() => {
                    setForm({ ...form, games: [...form.games, game.bggName] })
                    setSearch('')
                  }}
                >
                  ＋ 加入
                </button>
              </li>
            ))}
          </ul>
        )}
        {query && matches.length === 0 && (
          <p className="loy-admin-note">找不到符合的遊戲。</p>
        )}
        {form.games.length > 0 && (
          <ul className="loy-picked">
            {form.games.map((bggName) => (
              <li key={bggName}>
                <span>
                  {gameNameMap.get(bggName) ?? bggName}
                  {renderWant(bggName)}
                </span>
                <button
                  type="button"
                  className="loy-mini-btn"
                  onClick={() =>
                    setForm({
                      ...form,
                      games: form.games.filter((item) => item !== bggName),
                    })
                  }
                >
                  移除
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="pg-actions">
          <button
            type="button"
            className="lga-primary"
            disabled={busy}
            onClick={() => void save()}
          >
            {form.id ? '儲存修改' : '＋ 新增預計聚會'}
          </button>
          {form.id && (
            <button
              type="button"
              className="lga-outline"
              disabled={busy}
              onClick={() => {
                setForm(emptyForm())
                setSearch('')
              }}
            >
              取消編輯
            </button>
          )}
        </div>

        <h4 className="lga-sub">目前的預計聚會（含最近 30 天內）</h4>
        {loading ? (
          <p className="loy-admin-note">讀取中…</p>
        ) : rows.length === 0 ? (
          <p className="loy-admin-note">還沒有預計聚會。</p>
        ) : (
          <ul className="pg-admin-list">
            {rows.map((row) => {
              const off = row.plannedOn < today || row.status !== 'open'
              const sameDayFirst = [...gatherings].sort(
                (a, b) =>
                  Number(b.gatheredOn === row.plannedOn) -
                    Number(a.gatheredOn === row.plannedOn) ||
                  b.gatheredOn.localeCompare(a.gatheredOn),
              )
              return (
                <li key={row.id} className={`pg-admin-item${off ? ' off' : ''}`}>
                  <div className="pg-head">
                    <div>
                      <p className="pg-when">
                        {formatPlannedWhen(row.plannedOn, row.startTime)}
                        {row.plannedOn < today ? '（已過）' : ''}
                      </p>
                      <b className="pg-title-sm">{row.title}</b>
                    </div>
                    <span
                      className={`pg-badge${row.status === 'converted' ? ' ok' : ''}`}
                    >
                      {plannedStatusLabel(row.status)}
                    </span>
                  </div>
                  <small className="pg-sub">
                    {row.games.length} 款・{row.goingCount} 人可以去
                    {row.games.length > 0 &&
                      `：${row.games
                        .map((name) => gameNameMap.get(name) ?? name)
                        .join('、')}`}
                  </small>
                  {row.note && <small className="pg-sub">備註：{row.note}</small>}

                  <div className="pg-admin-actions">
                    <button
                      type="button"
                      className="loy-mini-btn"
                      disabled={busy}
                      onClick={() => startEdit(row)}
                    >
                      編輯
                    </button>
                    <button
                      type="button"
                      className="loy-mini-btn"
                      disabled={busy}
                      onClick={() => void toggleVoters(row)}
                    >
                      {voters?.id === row.id ? '收起名單' : `意願名單（${row.goingCount}）`}
                    </button>
                    {row.status === 'open' && (
                      <button
                        type="button"
                        className="loy-mini-btn"
                        disabled={busy}
                        onClick={() => void changeStatus(row, 'cancelled')}
                      >
                        取消聚會
                      </button>
                    )}
                    {row.status !== 'open' && (
                      <button
                        type="button"
                        className="loy-mini-btn"
                        disabled={busy}
                        onClick={() => void changeStatus(row, 'open')}
                      >
                        恢復開放
                      </button>
                    )}
                    {row.status !== 'converted' && (
                      <button
                        type="button"
                        className="loy-mini-btn"
                        disabled={busy}
                        onClick={() => {
                          setConvertId(convertId === row.id ? null : row.id)
                          setConvertTarget('')
                        }}
                      >
                        標示已轉正式
                      </button>
                    )}
                    <button
                      type="button"
                      className="loy-mini-btn"
                      disabled={busy}
                      onClick={() => void remove(row)}
                    >
                      刪除
                    </button>
                  </div>

                  {convertId === row.id && (
                    <div className="pg-convert">
                      <select
                        value={convertTarget}
                        onChange={(event) => setConvertTarget(event.target.value)}
                      >
                        <option value="">不連結正式聚會（只標示）</option>
                        {sameDayFirst.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="lga-outline"
                        disabled={busy}
                        onClick={() =>
                          void changeStatus(row, 'converted', convertTarget || null)
                        }
                      >
                        確定
                      </button>
                    </div>
                  )}

                  {voters?.id === row.id && (
                    <ul className="pg-voters">
                      {voters.list.length === 0 ? (
                        <li>還沒有人登記。</li>
                      ) : (
                        voters.list.map((voter) => (
                          <li key={voter.user_id}>
                            {voter.nickname || '（未設定暱稱）'}
                            {voter.contact_name ? `（${voter.contact_name}）` : ''}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </details>
  )
}
