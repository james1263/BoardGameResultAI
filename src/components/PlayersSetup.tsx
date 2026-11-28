import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { HelpNote } from './HelpNote'
import { WS_MAX_NAME, WS_MAX_PLAYERS, WS_MIN_PLAYERS, resizeNames } from '../lib/toolWorkspace'

// 共用玩家設定：資源計數器、計分表、爬梯子共用同一份名單，第一次設定、之後的工具直接沿用。
// 可以手動調人數與名字，也可以「代入聚會參加者」。

type RosterGathering = { id: string; gathered_on: string; title: string }
type RosterPerson = { name: string; checked: boolean }

function taipeiToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date())
}

export default function PlayersSetup({
  names,
  onChange,
}: {
  names: string[]
  onChange: (names: string[]) => void
}) {
  const [rosterOpen, setRosterOpen] = useState(false)
  const [rosterBusy, setRosterBusy] = useState(false)
  const [rosterMsg, setRosterMsg] = useState('')
  const [gatherings, setGatherings] = useState<RosterGathering[] | null>(null)
  const [people, setPeople] = useState<RosterPerson[] | null>(null)

  async function openRoster() {
    setRosterOpen(true)
    setPeople(null)
    setRosterMsg('')
    setRosterBusy(true)
    const { data, error } = await supabase.rpc('get_my_gatherings')
    setRosterBusy(false)
    if (error) {
      setRosterMsg('請先登入 VIP 帳號才能代入聚會參加者。')
      setGatherings([])
      return
    }
    const today = taipeiToday()
    const rows = ((data ?? []) as RosterGathering[]).filter((g) => g.gathered_on <= today)
    setGatherings(rows)
    if (rows.length === 0) setRosterMsg('沒有已開團的聚會可以選。')
  }

  async function pickGathering(id: string) {
    setRosterBusy(true)
    setRosterMsg('')
    const { data, error } = await supabase.rpc('get_gathering_detail', { p_gathering: id })
    setRosterBusy(false)
    const detail = data as { attendees?: { n?: string; me?: boolean; h?: boolean | null }[] } | null
    if (error || !detail || !Array.isArray(detail.attendees)) {
      setRosterMsg('讀不到這場聚會的名單。')
      return
    }
    const list = detail.attendees
    // 只有管理者拿得到 h 欄位；管理者本人若不在名單內，補上 James
    const isAdminView = list.some((a) => a.h !== undefined && a.h !== null)
    const found = list.map((a) => (a.n ?? '').trim() || '（未命名）')
    if (isAdminView && !list.some((a) => a.me)) found.unshift('James')
    setPeople(found.map((name) => ({ name, checked: true })))
  }

  function applyRoster() {
    if (!people) return
    const chosen = people
      .filter((p) => p.checked)
      .map((p) => p.name)
      .slice(0, WS_MAX_PLAYERS)
    if (chosen.length < WS_MIN_PLAYERS) {
      setRosterMsg(`至少要勾選 ${WS_MIN_PLAYERS} 人。`)
      return
    }
    onChange(chosen)
    setRosterOpen(false)
    setPeople(null)
  }

  return (
    <div className="tw-players">
      <div className="gt-settings">
        <span className="gt-field">
          <span>人數</span>
          <select
            className="gt-input"
            value={names.length}
            onChange={(event) => onChange(resizeNames(names, Number(event.target.value)))}
          >
            {Array.from({ length: WS_MAX_PLAYERS - WS_MIN_PLAYERS + 1 }, (_, i) => i + WS_MIN_PLAYERS).map(
              (n) => (
                <option key={n} value={n}>
                  {n} 人
                </option>
              ),
            )}
          </select>
        </span>
        <HelpNote text="名字可以改，之後加入的工具都沿用這份名單。" />
      </div>

      <div className="gt-roster">
        <button type="button" className="gt-secondary gt-roster-btn" onClick={() => void openRoster()}>
          代入聚會參加者
        </button>
        {rosterOpen && (
          <div className="gt-roster-panel">
            {rosterBusy && <p className="gt-hint">讀取中…</p>}
            {rosterMsg && <p className="gt-msg">{rosterMsg}</p>}
            {!people && gatherings && gatherings.length > 0 && (
              <>
                <HelpNote text="先選一場聚會（最新在上），再勾選要帶入的人。" />
                {gatherings.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className="gt-roster-item"
                    onClick={() => void pickGathering(g.id)}
                  >
                    {g.gathered_on}　{g.title}
                  </button>
                ))}
              </>
            )}
            {people && (
              <>
                <HelpNote text={`取消勾選不玩的人，最多帶入 ${WS_MAX_PLAYERS} 人。`} />
                {people.map((p, i) => (
                  <label key={i} className="gt-check">
                    <input
                      type="checkbox"
                      checked={p.checked}
                      onChange={(event) => {
                        const on = event.target.checked
                        setPeople((cur) =>
                          cur ? cur.map((x, k) => (k === i ? { ...x, checked: on } : x)) : cur,
                        )
                      }}
                    />
                    <span>{p.name}</span>
                  </label>
                ))}
                <div className="gt-actions">
                  <button type="button" className="gt-primary" onClick={applyRoster}>
                    帶入
                  </button>
                  <button type="button" className="gt-secondary" onClick={() => setPeople(null)}>
                    重選場次
                  </button>
                </div>
              </>
            )}
            <button type="button" className="gt-secondary gt-roster-close" onClick={() => setRosterOpen(false)}>
              關閉
            </button>
          </div>
        )}
      </div>

      <div className="gt-names">
        {names.map((name, i) => (
          <span key={i} className="gt-name-row">
            <input
              type="text"
              className="gt-input gt-name-input"
              maxLength={WS_MAX_NAME}
              placeholder={`玩家 ${i + 1}`}
              value={name}
              onChange={(event) => {
                const value = event.target.value
                onChange(names.map((v, k) => (k === i ? value : v)))
              }}
            />
          </span>
        ))}
      </div>
    </div>
  )
}
