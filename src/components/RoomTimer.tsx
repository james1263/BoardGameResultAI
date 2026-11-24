import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/room-timer.css'

// 房間計時器：三種模式（每回合倒數／每人總時間／總時間＋讀秒）
// 資料表 room_timers（一場聚會一列），用 Supabase Realtime 同步；
// 只在狀態改變（開始、暫停、換人、設定）時才有訊息，倒數由每支手機自己用本地時鐘算。
// 設定只有管理者（admin_room_timer_setup）；開始／暫停／結束回合由「現在輪到的人」或管理者呼叫（room_timer_act）。

type Mode = 'turn' | 'pool' | 'pool_byoyomi'
type Remain = { pool: number; periods: number }
type TimerRow = {
  gathering_id: string
  mode: Mode
  turn_seconds: number
  pool_seconds: number
  byoyomi_seconds: number
  byoyomi_periods: number
  order_user_ids: string[]
  current_index: number
  running: boolean
  turn_started_at: string | null
  remaining: Record<string, Remain> | null
}
type Player = { out_user_id: string; out_name: string; out_me: boolean }
type OrderItem = { id: string; name: string; on: boolean }
type View = { left: number; over: boolean; note: string; idle: string }

const MODE_LABEL: Record<Mode, string> = {
  turn: '每回合倒數',
  pool: '每人總時間',
  pool_byoyomi: '總時間＋讀秒',
}
const MODES: Mode[] = ['turn', 'pool', 'pool_byoyomi']

function fmt(sec: number): string {
  const s = Math.max(0, Math.ceil(sec))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

function elapsedSec(t: TimerRow, nowMs: number): number {
  if (!t.running || !t.turn_started_at) return 0
  return Math.max(0, (nowMs - new Date(t.turn_started_at).getTime()) / 1000)
}

function entryOf(t: TimerRow, uid: string): Remain {
  return t.remaining?.[uid] ?? { pool: t.pool_seconds, periods: t.byoyomi_periods }
}

// 顯示規則與資料庫 room_timer_act 的結算一致：
// 基本時間還有剩 → 只扣基本時間；基本時間 0 → 每手限時，超過才扣一次讀秒
function calc(t: TimerRow, uid: string, current: boolean, nowMs: number): View {
  const el = current ? elapsedSec(t, nowMs) : 0
  const e = entryOf(t, uid)
  if (t.mode === 'turn') {
    const left = t.turn_seconds - el
    return { left, over: left <= 0, note: left <= 0 ? '時間到' : '', idle: '' }
  }
  if (t.mode === 'pool') {
    const left = e.pool - el
    return { left, over: left <= 0, note: left <= 0 ? '總時間用完' : '', idle: fmt(e.pool) }
  }
  if (e.pool > 0) {
    const left = e.pool - el
    return {
      left,
      over: left <= 0,
      note: left <= 0 ? '基本時間用完，下一手進入讀秒' : '基本時間',
      idle: fmt(e.pool),
    }
  }
  const left = t.byoyomi_seconds - el
  let note = `讀秒，剩 ${e.periods} 次`
  if (left <= 0) note = e.periods > 0 ? '超時，結束回合會扣 1 次讀秒' : '讀秒用完'
  return { left, over: left <= 0, note, idle: `讀秒 ${e.periods} 次` }
}

export default function RoomTimer({
  gatheringId,
  isAdmin,
}: {
  gatheringId: string
  isAdmin: boolean
}) {
  const [timer, setTimer] = useState<TimerRow | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [editing, setEditing] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [mode, setMode] = useState<Mode>('turn')
  const [turnSec, setTurnSec] = useState('60')
  const [poolMin, setPoolMin] = useState('20')
  const [byoSec, setByoSec] = useState('30')
  const [periods, setPeriods] = useState('3')
  const [order, setOrder] = useState<OrderItem[]>([])
  const buzzKey = useRef('')

  const load = useCallback(async () => {
    const [tr, pr] = await Promise.all([
      supabase.from('room_timers').select('*').eq('gathering_id', gatheringId).maybeSingle(),
      supabase.rpc('get_room_players', { p_gathering: gatheringId }),
    ])
    if (tr.error || pr.error) {
      setError('讀取計時器失敗，請稍後再試。')
      setLoaded(true)
      return
    }
    setError('')
    setTimer((tr.data as TimerRow | null) ?? null)
    setPlayers((pr.data as Player[] | null) ?? [])
    setLoaded(true)
  }, [gatheringId])

  useEffect(() => {
    void load()
    const channel = supabase
      .channel(`room-timer-${gatheringId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_timers',
          filter: `gathering_id=eq.${gatheringId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') setTimer(null)
          else setTimer(payload.new as unknown as TimerRow)
        },
      )
      .subscribe()
    function handleVisible() {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', handleVisible)
    return () => {
      document.removeEventListener('visibilitychange', handleVisible)
      void supabase.removeChannel(channel)
    }
  }, [gatheringId, load])

  const running = timer?.running ?? false
  const startedAt = timer?.turn_started_at ?? null
  useEffect(() => {
    if (!running) return
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [running, startedAt])

  const nameOf = useMemo(() => {
    const map = new Map<string, Player>()
    for (const p of players) map.set(p.out_user_id, p)
    return map
  }, [players])

  const curId = timer ? (timer.order_user_ids[timer.current_index] ?? null) : null
  const curPlayer = curId ? nameOf.get(curId) : undefined
  const curIsMe = !!curPlayer?.out_me
  const cur = timer && curId ? calc(timer, curId, true, now) : null
  const curOver = !!cur?.over

  // 輪到我而且時間到：震動一次（不支援震動的手機就只有畫面變紅）
  useEffect(() => {
    if (!running || !curIsMe || !curOver || !startedAt) return
    if (buzzKey.current === startedAt) return
    buzzKey.current = startedAt
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([300, 100, 300])
    }
  }, [running, curIsMe, curOver, startedAt])

  async function act(action: 'start' | 'pause' | 'next') {
    setBusy(true)
    setError('')
    const res = await supabase.rpc('room_timer_act', {
      p_gathering: gatheringId,
      p_action: action,
    })
    setBusy(false)
    if (res.error) {
      setError(
        res.error.message.includes('not allowed')
          ? '現在不是你的回合。'
          : '操作失敗，請再試一次。',
      )
      void load()
      return
    }
    if (res.data) setTimer(res.data as TimerRow)
  }

  function openEditor() {
    const base: Player[] = players
    const ids = timer?.order_user_ids ?? []
    const items: OrderItem[] = []
    for (const id of ids) {
      const p = nameOf.get(id)
      if (p) items.push({ id, name: p.out_name, on: true })
    }
    for (const p of base) {
      if (!ids.includes(p.out_user_id)) {
        items.push({ id: p.out_user_id, name: p.out_name, on: !timer })
      }
    }
    setOrder(items)
    if (timer) {
      setMode(timer.mode)
      setTurnSec(String(timer.turn_seconds))
      setPoolMin(String(Math.round(timer.pool_seconds / 60)))
      setByoSec(String(timer.byoyomi_seconds))
      setPeriods(String(timer.byoyomi_periods))
    }
    setConfirmReset(false)
    setError('')
    setEditing(true)
  }

  function closeEditor() {
    setEditing(false)
    setConfirmReset(false)
  }

  function move(index: number, dir: -1 | 1) {
    const to = index + dir
    if (to < 0 || to >= order.length) return
    const next = order.slice()
    const tmp = next[index]
    next[index] = next[to]
    next[to] = tmp
    setOrder(next)
  }

  function toggle(index: number) {
    setOrder(order.map((item, i) => (i === index ? { ...item, on: !item.on } : item)))
  }

  async function save() {
    const t = Number(turnSec)
    const pm = Number(poolMin)
    const b = Number(byoSec)
    const pe = Number(periods)
    const ids = order.filter((o) => o.on).map((o) => o.id)
    if (!Number.isInteger(t) || t < 5 || t > 3600) return setError('每回合秒數請填 5～3600。')
    if (!Number.isInteger(pm) || pm < 1 || pm > 240) return setError('總時間請填 1～240 分鐘。')
    if (!Number.isInteger(b) || b < 5 || b > 300) return setError('讀秒請填 5～300 秒。')
    if (!Number.isInteger(pe) || pe < 0 || pe > 10) return setError('讀秒次數請填 0～10。')
    if (ids.length < 2) return setError('至少選 2 位玩家。')
    if (timer && !confirmReset) {
      setError('')
      setConfirmReset(true)
      return
    }
    setBusy(true)
    setError('')
    const res = await supabase.rpc('admin_room_timer_setup', {
      p_gathering: gatheringId,
      p_mode: mode,
      p_turn: t,
      p_pool: pm * 60,
      p_byo: b,
      p_periods: pe,
      p_order: ids,
    })
    setBusy(false)
    if (res.error) {
      setError('儲存失敗，請再試一次。')
      return
    }
    if (res.data) setTimer(res.data as TimerRow)
    closeEditor()
  }

  const canAct = !!timer && !!curId && (isAdmin || curIsMe)
  const warn = !!cur && !cur.over && cur.left <= 10 && running

  return (
    <div className="rt-root rt-root-x">
      <div className="rt-head">
        <p className="rt-title">計時器</p>
        {timer && <span className="rt-mode">{MODE_LABEL[timer.mode]}</span>}
        {isAdmin && loaded && !editing && (
          <button type="button" className="rt-link" onClick={openEditor}>
            {timer ? '設定' : '建立'}
          </button>
        )}
      </div>

      {!loaded && <p className="rt-muted">讀取中…</p>}
      {loaded && !timer && !editing && (
        <p className="rt-muted">
          {isAdmin ? '還沒有計時器，按「建立」設定。' : '管理者還沒有開啟計時器。'}
        </p>
      )}

      {timer && cur && !editing && (
        <>
          <div className={`rt-clock${cur.over ? ' over' : warn ? ' warn' : ''}`}>
            <p className="rt-who">
              輪到：{curPlayer?.out_name ?? '（已離開）'}
              {curIsMe ? '（你）' : ''}
            </p>
            <p className="rt-time">{cur.over ? '0:00' : fmt(cur.left)}</p>
            <p className="rt-note">{running ? cur.note : '暫停中，按「開始」繼續'}</p>
          </div>

          {canAct && (
            <div className="rt-actions">
              {running ? (
                <>
                  <button type="button" disabled={busy} onClick={() => void act('pause')}>
                    暫停
                  </button>
                  <button
                    type="button"
                    className="rt-main"
                    disabled={busy}
                    onClick={() => void act('next')}
                  >
                    結束回合
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="rt-main"
                  disabled={busy}
                  onClick={() => void act('start')}
                >
                  開始
                </button>
              )}
            </div>
          )}

          <ul className="rt-list">
            {timer.order_user_ids.map((id, index) => {
              const p = nameOf.get(id)
              const isCur = index === timer.current_index
              const v = calc(timer, id, isCur, now)
              return (
                <li key={id} className={isCur ? 'cur' : ''}>
                  <span className="rt-n">{index + 1}</span>
                  <span className="rt-name">
                    {p?.out_name ?? '（已離開）'}
                    {p?.out_me ? '（你）' : ''}
                  </span>
                  <span className="rt-val">
                    {isCur ? (timer.mode === 'turn' ? '' : v.over ? '0:00' : fmt(v.left)) : v.idle}
                  </span>
                </li>
              )
            })}
          </ul>
        </>
      )}

      {isAdmin && editing && (
        <div className="rt-edit">
          <div className="rt-modes">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                className={mode === m ? 'on' : ''}
                onClick={() => setMode(m)}
              >
                {MODE_LABEL[m]}
              </button>
            ))}
          </div>

          {mode === 'turn' && (
            <div className="rt-field">
              <span>每回合（秒）</span>
              <input
                inputMode="numeric"
                value={turnSec}
                onChange={(e) => setTurnSec(e.target.value)}
              />
            </div>
          )}
          {mode !== 'turn' && (
            <div className="rt-field">
              <span>每人總時間（分鐘）</span>
              <input
                inputMode="numeric"
                value={poolMin}
                onChange={(e) => setPoolMin(e.target.value)}
              />
            </div>
          )}
          {mode === 'pool_byoyomi' && (
            <>
              <div className="rt-field">
                <span>讀秒（每手秒數）</span>
                <input
                  inputMode="numeric"
                  value={byoSec}
                  onChange={(e) => setByoSec(e.target.value)}
                />
              </div>
              <div className="rt-field">
                <span>讀秒次數</span>
                <input
                  inputMode="numeric"
                  value={periods}
                  onChange={(e) => setPeriods(e.target.value)}
                />
              </div>
            </>
          )}

          <p className="rt-sub">輪流順序（勾選的人才會參加）</p>
          <ul className="rt-order">
            {order.map((item, index) => (
              <li key={item.id} className={item.on ? '' : 'off'}>
                <input
                  type="checkbox"
                  checked={item.on}
                  aria-label={`${item.name} 參加`}
                  onChange={() => toggle(index)}
                />
                <span className="rt-name">{item.name}</span>
                <button
                  type="button"
                  aria-label="上移"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  ▲
                </button>
                <button
                  type="button"
                  aria-label="下移"
                  disabled={index === order.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ▼
                </button>
              </li>
            ))}
          </ul>

          <div className="rt-actions">
            <button type="button" disabled={busy} onClick={closeEditor}>
              取消
            </button>
            <button
              type="button"
              className="rt-main"
              disabled={busy}
              onClick={() => void save()}
            >
              {timer ? (confirmReset ? '再按一次，確定重設' : '儲存並重設') : '建立計時器'}
            </button>
          </div>
          {timer && <p className="rt-muted">儲存會重設目前進度與每人剩餘時間。</p>}
        </div>
      )}

      {error && <p className="rt-error">{error}</p>}
    </div>
  )
}
