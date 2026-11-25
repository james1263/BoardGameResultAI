import { useEffect, useMemo, useRef, useState } from 'react'
import RoomTimer from './RoomTimer'
import TableHoldings from './TableHoldings'
import {
  ICONS,
  MAX_ROWS,
  PRESET_GROUPS,
  fmt,
  loadTemplates,
  newRowId,
  rowPoints,
  type PresetItem,
  type SheetRow,
  type SheetTemplate,
} from '../lib/scoreSheet'
import {
  ALL_TOOLS,
  MAX_DICE,
  MAX_DICE_GROUPS,
  MAX_FACES,
  MAX_LABEL,
  MAX_PLAYERS,
  TOOL_INFO,
  cellValue,
  clampValue,
  diceSummaryText,
  diceTemplate,
  faceTotal,
  fillValues,
  linkedResource,
  loadStore,
  newDiceGroup,
  newTable,
  rollDie,
  rollGroup,
  saveStore,
  summarize,
  toolActive,
  totalOf,
  uid,
  type DiceGroup,
  type GameTableData,
  type RoomStore,
  type TableTool,
} from '../lib/gameTable'
import '../styles/game-table.css'

// 聚會房間的「遊戲桌」（4a：只存這支手機；只有管理者能開桌與設定）
// 流程：開桌（遊戲、工具、玩家）→ 資源設定 → 計分表設定 → 進行畫面（玩家、骰子、計分、計時器）
// 同步（多支手機看同一桌）是 4b。

type Update = (fn: (t: GameTableData) => GameTableData) => void

function useArm() {
  const [armed, setArmed] = useState<string | null>(null)
  const timer = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )
  function press(key: string, run: () => void) {
    if (armed === key) {
      setArmed(null)
      run()
      return
    }
    setArmed(key)
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setArmed(null), 3000)
  }
  return { armed, press }
}

/* ───────────── 資源列／計分項目編輯 ───────────── */

function RowsEditor({
  kind,
  rows,
  onChange,
  locked,
  resNames,
}: {
  kind: 'resource' | 'score'
  rows: SheetRow[]
  onChange: (rows: SheetRow[]) => void
  locked: Set<string>
  resNames: string[]
}) {
  const isRes = kind === 'resource'
  const [pickFor, setPickFor] = useState<string | null>(null)
  const [showPreset, setShowPreset] = useState(false)
  const [showTpl, setShowTpl] = useState(false)
  const [tpls, setTpls] = useState<SheetTemplate[] | null>(null)
  const [tplMsg, setTplMsg] = useState('')

  function patch(id: string, p: Partial<SheetRow>) {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...p } : r)))
  }

  function move(index: number, dir: -1 | 1) {
    const to = index + dir
    if (to < 0 || to >= rows.length) return
    const next = rows.slice()
    const tmp = next[index]
    next[index] = next[to]
    next[to] = tmp
    onChange(next)
  }

  function blankRow(name: string, icon: string): SheetRow {
    return {
      id: newRowId(),
      name,
      icon,
      kind: isRes ? 'count' : 'score',
      sign: 1,
      mult: 1,
      init: 0,
    }
  }

  function addPreset(item: PresetItem) {
    if (rows.length >= MAX_ROWS) return
    if (rows.some((r) => r.name.trim() === item.name)) return
    onChange([...rows, blankRow(item.name, item.icon)])
  }

  async function openTemplates() {
    setShowTpl((v) => !v)
    if (tpls !== null) return
    const res = await loadTemplates(isRes ? 'resource' : 'score')
    if (res === null) {
      setTplMsg('讀不到表單清單。')
      return
    }
    setTpls(res)
    if (res.length === 0) setTplMsg('還沒有可以載入的表單。')
  }

  function useTemplate(t: SheetTemplate) {
    onChange(
      t.rows.map((r) => ({
        ...r,
        id: newRowId(),
        kind: isRes ? 'count' : 'score',
      })),
    )
    setShowTpl(false)
  }

  return (
    <div className="gtb-rows">
      <ul className="gtb-list">
        {rows.map((r, index) => {
          const isLocked = locked.has(r.id)
          return (
            <li key={r.id} className="gtb-rowcard">
              <div className="gtb-line">
                <button
                  type="button"
                  className="gtb-ico"
                  aria-label="選擇圖示"
                  disabled={isLocked}
                  onClick={() => setPickFor(pickFor === r.id ? null : r.id)}
                >
                  {r.icon}
                </button>
                <input
                  className="gtb-in gtb-grow"
                  value={r.name}
                  maxLength={20}
                  disabled={isLocked}
                  placeholder={isRes ? '資源（例：木頭）' : '項目（例：建築）'}
                  onChange={(e) => patch(r.id, { name: e.target.value })}
                />
                {!isLocked && (
                  <>
                    <button type="button" className="gtb-sq" aria-label="上移" disabled={index === 0} onClick={() => move(index, -1)}>
                      ↑
                    </button>
                    <button type="button" className="gtb-sq" aria-label="下移" disabled={index === rows.length - 1} onClick={() => move(index, 1)}>
                      ↓
                    </button>
                    <button type="button" className="gtb-sq" aria-label="刪除這一列" onClick={() => onChange(rows.filter((x) => x.id !== r.id))}>
                      ✕
                    </button>
                  </>
                )}
              </div>
              {pickFor === r.id && (
                <div className="gtb-icons">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => {
                        patch(r.id, { icon: ic })
                        setPickFor(null)
                      }}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              )}
              <div className="gtb-line gtb-wrap">
                {isRes ? (
                  <label className="gtb-lab">
                    起始數量
                    <input
                      className="gtb-in gtb-num"
                      type="number"
                      min={0}
                      disabled={isLocked}
                      value={r.init}
                      onChange={(e) => patch(r.id, { init: clampValue(Number(e.target.value)) })}
                    />
                  </label>
                ) : (
                  <>
                    <span className="gtb-seg">
                      <button type="button" className={r.sign === 1 ? 'on' : ''} disabled={isLocked} onClick={() => patch(r.id, { sign: 1 })}>
                        ＋
                      </button>
                      <button type="button" className={r.sign === -1 ? 'on' : ''} disabled={isLocked} onClick={() => patch(r.id, { sign: -1 })}>
                        －
                      </button>
                    </span>
                    <label className="gtb-lab">
                      每個
                      <input
                        className="gtb-in gtb-num"
                        type="number"
                        step="any"
                        disabled={isLocked}
                        value={r.mult}
                        onChange={(e) => patch(r.id, { mult: Number(e.target.value) || 0 })}
                      />
                      分
                    </label>
                  </>
                )}
              </div>
              {!isRes && resNames.length > 0 && (
                <div className="gtb-line gtb-wrap">
                  <label className="gtb-lab">
                    取自資源（選填）
                    <select
                      className="gtb-in"
                      disabled={isLocked}
                      value={r.from ?? ''}
                      onChange={(e) => patch(r.id, { from: e.target.value || undefined, per: r.per ?? 1 })}
                    >
                      <option value="">手動輸入</option>
                      {resNames.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  {r.from && (
                    <label className="gtb-lab">
                      每
                      <input
                        className="gtb-in gtb-num"
                        type="number"
                        min={1}
                        disabled={isLocked}
                        value={r.per ?? 1}
                        onChange={(e) => patch(r.id, { per: Math.max(1, Math.round(Number(e.target.value) || 1)) })}
                      />
                      個
                    </label>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="gtb-btnrow">
        <button type="button" className="gtb-btn" disabled={rows.length >= MAX_ROWS} onClick={() => onChange([...rows, blankRow('', '⭐')])}>
          ＋ 新增一列（{rows.length}／{MAX_ROWS}）
        </button>
        {isRes && (
          <button type="button" className="gtb-btn" onClick={() => setShowPreset((v) => !v)}>
            {showPreset ? '收起常用資源' : '＋ 常用資源'}
          </button>
        )}
        {locked.size === 0 && (
          <button type="button" className="gtb-btn" onClick={() => void openTemplates()}>
            {showTpl ? '收起我的表單' : '載入我的表單'}
          </button>
        )}
      </div>

      {isRes && showPreset && (
        <div className="gtb-presets">
          {PRESET_GROUPS.map((g) => (
            <div key={g.label}>
              <p className="gtb-sub">{g.label}</p>
              <div className="gtb-chips">
                {g.items.map((it) => {
                  const used = rows.some((r) => r.name.trim() === it.name)
                  return (
                    <button key={it.name} type="button" disabled={used} onClick={() => addPreset(it)}>
                      {it.icon} {it.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showTpl && (
        <div className="gtb-presets">
          {tpls === null && !tplMsg && <p className="gtb-muted">讀取中…</p>}
          {tplMsg && <p className="gtb-muted">{tplMsg}</p>}
          {tpls?.map((t) => (
            <button key={t.id ?? t.title} type="button" className="gtb-tpl" onClick={() => useTemplate(t)}>
              {t.title}（{t.rows.length} 列）
            </button>
          ))}
          <p className="gtb-muted">載入會取代目前列出的項目。</p>
        </div>
      )}
    </div>
  )
}

/* ───────────── 骰子設定 ───────────── */

function DiceEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: DiceGroup
  onSave: (g: DiceGroup) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial.name)
  const [count, setCount] = useState(initial.count)
  const [faces, setFaces] = useState(initial.faces)
  const [msg, setMsg] = useState('')
  const total = faceTotal(faces)

  function patchFace(index: number, p: Partial<{ label: string; qty: number }>) {
    setFaces(faces.map((f, i) => (i === index ? { ...f, ...p } : f)))
  }

  function save() {
    const clean = faces.map((f) => ({ label: f.label.trim(), qty: f.qty }))
    if (clean.some((f) => !f.label)) return setMsg('每個骰面都要填文字或符號。')
    if (clean.some((f) => f.qty < 1)) return setMsg('每個骰面至少 1 面。')
    if (faceTotal(clean) < 2) return setMsg('骰子至少要有 2 面。')
    if (faceTotal(clean) > MAX_FACES) return setMsg(`骰面總數最多 ${MAX_FACES} 面。`)
    onSave({ ...initial, name: name.trim(), count, faces: clean, results: [] })
  }

  return (
    <div className="gtb-card">
      <div className="gtb-line">
        <input className="gtb-in gtb-grow" value={name} maxLength={12} placeholder="骰子組名稱（選填，例：戰鬥骰）" onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="gtb-line gtb-wrap">
        <label className="gtb-lab">
          顆數
          <input
            className="gtb-in gtb-num"
            type="number"
            min={1}
            max={MAX_DICE}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(MAX_DICE, Math.round(Number(e.target.value) || 1))))}
          />
        </label>
        <span className="gtb-muted">骰面共 {total}／{MAX_FACES} 面</span>
      </div>
      <p className="gtb-sub">快速模板（會取代下面的骰面）</p>
      <div className="gtb-chips">
        {[3, 4, 6, 8, 10, 12, 20].map((n) => (
          <button key={n} type="button" onClick={() => setFaces(diceTemplate(n))}>
            d{n}
          </button>
        ))}
      </div>
      <p className="gtb-sub">骰面：符號或文字 × 面數（例：「3點」×3、「必中」×1）</p>
      <ul className="gtb-list">
        {faces.map((f, index) => (
          <li key={index} className="gtb-line">
            <input
              className="gtb-in gtb-grow"
              value={f.label}
              maxLength={MAX_LABEL}
              placeholder="文字或符號"
              onChange={(e) => patchFace(index, { label: e.target.value })}
            />
            <span className="gtb-x">×</span>
            <input
              className="gtb-in gtb-num"
              type="number"
              min={1}
              value={f.qty}
              onChange={(e) => patchFace(index, { qty: Math.max(1, Math.round(Number(e.target.value) || 1)) })}
            />
            <button type="button" className="gtb-sq" aria-label="刪除這個骰面" disabled={faces.length <= 1} onClick={() => setFaces(faces.filter((_, i) => i !== index))}>
              ✕
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="gtb-btn" disabled={total >= MAX_FACES} onClick={() => setFaces([...faces, { label: '', qty: 1 }])}>
        ＋ 新增骰面
      </button>
      {msg && <p className="gtb-error">{msg}</p>}
      <div className="gtb-btnrow">
        <button type="button" className="gtb-btn" onClick={onCancel}>
          取消
        </button>
        <button type="button" className="gtb-btn main" onClick={save}>
          完成
        </button>
      </div>
    </div>
  )
}

/* ───────────── 開桌設定（第 1 步：遊戲、工具、玩家；第 2、3 步：資源、計分表） ───────────── */

type Step = 'basic' | 'resource' | 'score'

function Setup({
  table,
  update,
  games,
  attendees,
  leftNames,
  onBack,
}: {
  table: GameTableData
  update: Update
  games: Array<{ b: string; name: string }>
  attendees: string[]
  leftNames: string[]
  onBack: () => void
}) {
  const steps: Step[] = useMemo(() => {
    const s: Step[] = ['basic']
    if (table.tools.includes('resource')) s.push('resource')
    if (table.tools.includes('score')) s.push('score')
    return s
  }, [table.tools])
  const [index, setIndex] = useState(0)
  const [guest, setGuest] = useState('')
  const [msg, setMsg] = useState('')
  const step = steps[Math.min(index, steps.length - 1)]
  const taken = new Set(table.players.map((p) => p.name.trim()))
  const free = attendees.filter((n) => !taken.has(n))

  function addPlayer(name: string) {
    const n = name.trim().slice(0, 12)
    if (!n) return
    update((t) => {
      if (t.players.length >= MAX_PLAYERS) return t
      if (t.players.some((p) => p.name.trim() === n)) return t
      return { ...t, players: [...t.players, { id: uid(), name: n, left: leftNames.includes(n) }] }
    })
  }

  function importAll() {
    update((t) => {
      const have = new Set(t.players.map((p) => p.name.trim()))
      const add = attendees
        .filter((n) => !have.has(n) && !leftNames.includes(n))
        .slice(0, Math.max(0, MAX_PLAYERS - t.players.length))
        .map((n) => ({ id: uid(), name: n, left: false }))
      return { ...t, players: [...t.players, ...add] }
    })
  }

  function toggleTool(tool: TableTool) {
    update((t) => ({
      ...t,
      tools: t.tools.includes(tool) ? t.tools.filter((x) => x !== tool) : [...t.tools, tool],
    }))
  }

  function problem(): string {
    if (step === 'basic') {
      if (!table.title.trim()) return '請選擇遊戲或輸入名稱。'
      if (table.tools.length === 0) return '至少選一個工具。'
      if (table.players.length < 2) return '至少 2 位玩家。'
      if (table.players.some((p) => !p.name.trim())) return '玩家名稱不能空白。'
      if (new Set(table.players.map((p) => p.name.trim())).size !== table.players.length) return '玩家名稱不能重複。'
      if (attendees.length > 0 && table.players.length > attendees.length) {
        return `這桌人數不能超過聚會出席人數（${attendees.length} 人）。`
      }
    }
    if (step === 'resource') {
      if (table.resRows.length === 0) return '至少 1 種資源。'
      if (table.resRows.some((r) => !r.name.trim())) return '資源名稱不能空白。'
    }
    if (step === 'score') {
      if (table.scoreRows.length === 0) return '至少 1 個計分項目。'
      if (table.scoreRows.some((r) => !r.name.trim())) return '計分項目名稱不能空白。'
    }
    return ''
  }

  function next() {
    const p = problem()
    setMsg(p)
    if (p) return
    if (index < steps.length - 1) {
      setIndex(index + 1)
      return
    }
    update((t) => fillValues({ ...t, phase: 'play' }))
  }

  const last = index >= steps.length - 1

  return (
    <div className="gtb-body">
      <p className="gtb-steps">
        設定 {Math.min(index, steps.length - 1) + 1}／{steps.length}：
        {step === 'basic' ? '遊戲、工具、玩家' : step === 'resource' ? '資源種類' : '計分項目'}
      </p>

      {step === 'basic' && (
        <>
          <p className="gtb-sub">遊戲</p>
          {games.length > 0 && (
            <select
              className="gtb-in gtb-full"
              value={table.bggName ?? ''}
              onChange={(e) => {
                const g = games.find((x) => x.b === e.target.value)
                update((t) => ({ ...t, bggName: g ? g.b : null, title: g ? g.name : t.title }))
              }}
            >
              <option value="">其他（自己輸入名稱）</option>
              {games.map((g) => (
                <option key={g.b} value={g.b}>
                  {g.name}
                </option>
              ))}
            </select>
          )}
          <input
            className="gtb-in gtb-full"
            value={table.title}
            maxLength={30}
            placeholder="這桌的名稱（例：旭日）"
            onChange={(e) => update((t) => ({ ...t, title: e.target.value, bggName: null }))}
          />

          <p className="gtb-sub">要用的工具（中途也能再加）</p>
          <div className="gtb-tools">
            {ALL_TOOLS.map((tool) => (
              <label key={tool} className={table.tools.includes(tool) ? 'on' : ''}>
                <input type="checkbox" checked={table.tools.includes(tool)} onChange={() => toggleTool(tool)} />
                <span>
                  {TOOL_INFO[tool].icon} {TOOL_INFO[tool].label}
                  <small>{TOOL_INFO[tool].hint}</small>
                </span>
              </label>
            ))}
          </div>

          <p className="gtb-sub">
            玩家（{table.players.length}／{MAX_PLAYERS}）：請輸入遊戲裡用的暱稱，例如家族名
          </p>
          <ul className="gtb-list">
            {table.players.map((p) => (
              <li key={p.id} className="gtb-line">
                <input
                  className="gtb-in gtb-grow"
                  value={p.name}
                  maxLength={12}
                  onChange={(e) => update((t) => ({ ...t, players: t.players.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)) }))}
                />
                <button type="button" className="gtb-sq" aria-label="移除玩家" onClick={() => update((t) => ({ ...t, players: t.players.filter((x) => x.id !== p.id) }))}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <div className="gtb-btnrow">
            <button type="button" className="gtb-btn" onClick={importAll}>
              一鍵帶入聚會成員
            </button>
          </div>
          {free.length > 0 && (
            <div className="gtb-chips">
              {free.map((n) => (
                <button key={n} type="button" onClick={() => addPlayer(n)}>
                  ＋ {n}
                  {leftNames.includes(n) ? '（已離場）' : ''}
                </button>
              ))}
            </div>
          )}
          <div className="gtb-line">
            <input className="gtb-in gtb-grow" value={guest} maxLength={12} placeholder="手動加入訪客或家族名" onChange={(e) => setGuest(e.target.value)} />
            <button
              type="button"
              className="gtb-btn"
              onClick={() => {
                addPlayer(guest)
                setGuest('')
              }}
            >
              加入
            </button>
          </div>
        </>
      )}

      {step === 'resource' && (
        <>
          <p className="gtb-muted">設定這桌有哪些資源與起始數量。開始後只能新增，不能刪除。</p>
          <RowsEditor kind="resource" rows={table.resRows} onChange={(rows) => update((t) => ({ ...t, resRows: rows }))} locked={new Set()} resNames={[]} />
        </>
      )}

      {step === 'score' && (
        <>
          <p className="gtb-muted">設定終局計分項目。有設定資源時，項目可以「取自資源」自動換算。</p>
          <RowsEditor
            kind="score"
            rows={table.scoreRows}
            onChange={(rows) => update((t) => ({ ...t, scoreRows: rows }))}
            locked={new Set()}
            resNames={table.resRows.map((r) => r.name.trim()).filter(Boolean)}
          />
        </>
      )}

      {msg && <p className="gtb-error">{msg}</p>}
      <div className="gtb-btnrow">
        <button type="button" className="gtb-btn" onClick={index === 0 ? onBack : () => setIndex(index - 1)}>
          {index === 0 ? '‹ 回房間' : '上一步'}
        </button>
        <button type="button" className="gtb-btn main" onClick={next}>
          {last ? '開始這桌' : '下一步'}
        </button>
      </div>
    </div>
  )
}

/* ───────────── 進行畫面 ───────────── */

type Tab = 'players' | 'dice' | 'score' | 'hold'

function Play({
  table,
  update,
  gatheringId,
  isAdmin,
  onLeft,
  onBack,
}: {
  table: GameTableData
  update: Update
  gatheringId: string
  isAdmin: boolean
  onLeft: (name: string, left: boolean) => void
  onBack: () => void
}) {
  const { armed, press } = useArm()
  const [tab, setTab] = useState<Tab>('players')
  const [openPlayer, setOpenPlayer] = useState<string | null>(null)
  const [editing, setEditing] = useState<'resource' | 'score' | null>(null)
  const [draftRows, setDraftRows] = useState<SheetRow[]>([])
  const [diceEdit, setDiceEdit] = useState<DiceGroup | null>(null)
  const [showTools, setShowTools] = useState(false)

  const resOn = table.tools.includes('resource') && !table.disabled.includes('resource')
  const scoreOn = toolActive(table, 'score')
  const diceOn = toolActive(table, 'dice')
  const timerOn = toolActive(table, 'timer')
  const holdOn = table.bggName === 'Rising Sun'
  const tabs: Tab[] = ['players']
  if (diceOn) tabs.push('dice')
  if (scoreOn) tabs.push('score')
  if (holdOn) tabs.push('hold')
  const shownTab: Tab = tabs.includes(tab) ? tab : 'players'
  const TAB_LABEL: Record<Tab, string> = { players: '玩家', dice: '骰子', score: '計分', hold: '持有' }

  function setRes(pid: string, rowId: string, value: number) {
    update((t) => ({
      ...t,
      res: { ...t.res, [pid]: { ...(t.res[pid] ?? {}), [rowId]: clampValue(value) } },
    }))
  }

  function setScore(pid: string, rowId: string, value: number) {
    update((t) => ({
      ...t,
      scores: { ...t.scores, [pid]: { ...(t.scores[pid] ?? {}), [rowId]: clampValue(value) } },
    }))
  }

  function startEdit(kind: 'resource' | 'score') {
    setDraftRows(kind === 'resource' ? table.resRows : table.scoreRows)
    setEditing(kind)
  }

  function finishEdit() {
    if (!editing) return
    if (draftRows.some((r) => !r.name.trim())) return
    update((t) => fillValues(editing === 'resource' ? { ...t, resRows: draftRows } : { ...t, scoreRows: draftRows }))
    setEditing(null)
  }

  function addTool(tool: TableTool) {
    update((t) => ({ ...t, tools: t.tools.includes(tool) ? t.tools : [...t.tools, tool] }))
    if (tool === 'resource') startEdit('resource')
    if (tool === 'score') startEdit('score')
    if (tool === 'dice') setDiceEdit(newDiceGroup())
  }

  function toggleDisabled(tool: TableTool) {
    update((t) => ({
      ...t,
      disabled: t.disabled.includes(tool) ? t.disabled.filter((x) => x !== tool) : [...t.disabled, tool],
    }))
  }

  function saveDice(g: DiceGroup) {
    update((t) => {
      const exists = t.dice.some((x) => x.id === g.id)
      return { ...t, dice: exists ? t.dice.map((x) => (x.id === g.id ? g : x)) : [...t.dice, g] }
    })
    setDiceEdit(null)
  }

  function logRoll(t: GameTableData, g: DiceGroup, results: string[]): string[] {
    const name = g.name || `骰子 ${t.dice.findIndex((x) => x.id === g.id) + 1}`
    return [`${name}：${summarize(results)}`, ...t.diceLog].slice(0, 5)
  }

  function roll(g: DiceGroup) {
    const results = rollGroup(g)
    update((t) => ({
      ...t,
      dice: t.dice.map((x) => (x.id === g.id ? { ...x, results } : x)),
      diceLog: logRoll(t, g, results),
    }))
  }

  function reroll(g: DiceGroup, index: number) {
    const results = g.results.map((r, i) => (i === index ? rollDie(g.faces) : r))
    update((t) => ({
      ...t,
      dice: t.dice.map((x) => (x.id === g.id ? { ...x, results } : x)),
      diceLog: logRoll(t, g, results),
    }))
  }

  const ranking = useMemo(() => {
    const totals = table.players.map((p) => ({ id: p.id, total: totalOf(table, p.id) }))
    const sorted = totals.slice().sort((a, b) => b.total - a.total)
    const rank = new Map<string, number>()
    sorted.forEach((x, i) => {
      rank.set(x.id, i > 0 && sorted[i - 1].total === x.total ? (rank.get(sorted[i - 1].id) ?? i + 1) : i + 1)
    })
    return { totals, rank }
  }, [table])

  if (editing) {
    const locked = new Set((editing === 'resource' ? table.resRows : table.scoreRows).map((r) => r.id))
    return (
      <div className="gtb-body">
        <p className="gtb-steps">{editing === 'resource' ? '新增資源種類' : '新增計分項目'}（原有的不能刪）</p>
        <RowsEditor
          kind={editing}
          rows={draftRows}
          onChange={setDraftRows}
          locked={locked}
          resNames={table.resRows.map((r) => r.name.trim()).filter(Boolean)}
        />
        {draftRows.some((r) => !r.name.trim()) && <p className="gtb-error">名稱不能空白。</p>}
        <p className="gtb-muted">
          {editing === 'resource' ? '新增的資源，每位玩家從起始數量開始。' : '新增的計分項目，所有人先是 0。'}
        </p>
        <div className="gtb-btnrow">
          <button type="button" className="gtb-btn" onClick={() => setEditing(null)}>
            取消
          </button>
          <button type="button" className="gtb-btn main" onClick={finishEdit}>
            完成
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="gtb-body">
      {timerOn && <RoomTimer gatheringId={gatheringId} isAdmin={isAdmin} />}

      <div className="gtb-tabs">
        {tabs.map((k) => (
          <button key={k} type="button" className={shownTab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {TAB_LABEL[k]}
          </button>
        ))}
      </div>

      {shownTab === 'players' && (
        <>
          <ul className="gtb-players">
            {table.players.map((p) => {
              const open = openPlayer === p.id
              return (
                <li key={p.id} className={`${p.left ? 'left' : ''}${open ? ' open' : ''}`}>
                  <div className="gtb-phead">
                    <button type="button" className="gtb-pname" onClick={() => setOpenPlayer(open ? null : p.id)} aria-expanded={open}>
                      <b>{p.name}</b>
                      {p.left && <small>已離場</small>}
                    </button>
                    <button type="button" className="gtb-link" onClick={() => onLeft(p.name, !p.left)}>
                      {p.left ? '取消離場' : '離場'}
                    </button>
                  </div>
                  {resOn && !open && (
                    <p className="gtb-sumline">
                      {table.resRows.map((r) => (
                        <span key={r.id}>
                          {r.icon}
                          {table.res[p.id]?.[r.id] ?? 0}
                        </span>
                      ))}
                    </p>
                  )}
                  {resOn && open && (
                    <ul className="gtb-resedit">
                      {table.resRows.map((r) => {
                        const v = table.res[p.id]?.[r.id] ?? 0
                        return (
                          <li key={r.id}>
                            <span className="gtb-rname">
                              {r.icon} {r.name}
                            </span>
                            <button type="button" className="gtb-sq" aria-label={`${r.name} 減 1`} onClick={() => setRes(p.id, r.id, v - 1)}>
                              －
                            </button>
                            <input className="gtb-in gtb-num" type="number" min={0} value={v} onChange={(e) => setRes(p.id, r.id, Number(e.target.value))} />
                            <button type="button" className="gtb-sq" aria-label={`${r.name} 加 1`} onClick={() => setRes(p.id, r.id, v + 1)}>
                              ＋
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
          {!resOn && <p className="gtb-muted">這桌沒有用資源計數器；可在下方「工具」加入。</p>}
        </>
      )}

      {shownTab === 'dice' && (
        <>
          {diceEdit ? (
            <DiceEditor initial={diceEdit} onSave={saveDice} onCancel={() => setDiceEdit(null)} />
          ) : (
            <>
              {table.dice.length === 0 && <p className="gtb-muted">還沒有骰子組，按「＋ 新增骰子組」。</p>}
              {table.dice.map((g, gi) => (
                <div key={g.id} className="gtb-card">
                  <div className="gtb-line">
                    <b className="gtb-grow">{g.name || `骰子 ${gi + 1}`}</b>
                    <button type="button" className="gtb-link" onClick={() => setDiceEdit(g)}>
                      編輯
                    </button>
                    <button
                      type="button"
                      className="gtb-link"
                      onClick={() => press(`dd-${g.id}`, () => update((t) => ({ ...t, dice: t.dice.filter((x) => x.id !== g.id) })))}
                    >
                      {armed === `dd-${g.id}` ? '再按一次刪除' : '刪除'}
                    </button>
                  </div>
                  <p className="gtb-muted">
                    {g.count} 顆・{diceSummaryText(g)}
                  </p>
                  <button type="button" className="gtb-btn main gtb-roll" onClick={() => roll(g)}>
                    🎲 擲 {g.count} 顆
                  </button>
                  {g.results.length > 0 && (
                    <>
                      <div className="gtb-dice">
                        {g.results.map((r, i) => (
                          <button key={i} type="button" aria-label="重擲這一顆" onClick={() => reroll(g, i)}>
                            {r}
                          </button>
                        ))}
                      </div>
                      <p className="gtb-result">{summarize(g.results)}</p>
                      <p className="gtb-muted">點單顆可重擲</p>
                    </>
                  )}
                </div>
              ))}
              <button type="button" className="gtb-btn" disabled={table.dice.length >= MAX_DICE_GROUPS} onClick={() => setDiceEdit(newDiceGroup())}>
                ＋ 新增骰子組（{table.dice.length}／{MAX_DICE_GROUPS}）
              </button>
              {table.diceLog.length > 0 && (
                <>
                  <p className="gtb-sub">最近 5 次</p>
                  <ul className="gtb-log">
                    {table.diceLog.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </>
      )}

      {shownTab === 'score' && (
        <>
          {table.scoreRows.length === 0 ? (
            <p className="gtb-muted">還沒有計分項目。</p>
          ) : (
            <div className="gtb-scroll">
              <table className="gtb-table">
                <thead>
                  <tr>
                    <th />
                    {table.players.map((p) => (
                      <th key={p.id} className={p.left ? 'left' : ''}>
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.scoreRows.map((row) => {
                    const link = linkedResource(table, row)
                    return (
                      <tr key={row.id}>
                        <th>
                          {row.icon} {row.name}
                          <small>
                            {row.sign === -1 ? '－' : '＋'}
                            {fmt(row.mult)}
                            {link ? `・取自${link.name}` : ''}
                          </small>
                        </th>
                        {table.players.map((p) => (
                          <td key={p.id}>
                            {link ? (
                              <span className="gtb-auto">{cellValue(table, row, p.id)}</span>
                            ) : (
                              <input
                                className="gtb-in gtb-cell"
                                type="number"
                                min={0}
                                value={table.scores[p.id]?.[row.id] ?? 0}
                                onChange={(e) => setScore(p.id, row.id, Number(e.target.value))}
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                  <tr className="gtb-total">
                    <th>總分</th>
                    {table.players.map((p) => (
                      <td key={p.id}>{fmt(ranking.totals.find((x) => x.id === p.id)?.total ?? 0)}</td>
                    ))}
                  </tr>
                  <tr className="gtb-rank">
                    <th>名次</th>
                    {table.players.map((p) => (
                      <td key={p.id}>{ranking.rank.get(p.id) ?? '-'}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <p className="gtb-muted">
            每項分數＝數字 × 每個算幾分（{table.scoreRows.length > 0 ? `例：${table.scoreRows[0].name} ${rowPoints(table.scoreRows[0], 3) >= 0 ? '＋' : ''}${fmt(rowPoints(table.scoreRows[0], 3))}／3 個` : '尚無項目'}）。
          </p>
        </>
      )}

      {shownTab === 'hold' && <TableHoldings table={table} update={update} />}

      <div className="gtb-manage">
        <button type="button" className="gtb-link" onClick={() => setShowTools((v) => !v)}>
          {showTools ? '收起工具與設定' : '工具與設定'}
        </button>
        {showTools && (
          <div className="gtb-card">
            <p className="gtb-sub">工具（只能加入或停用，不能刪除）</p>
            <ul className="gtb-toollist">
              {ALL_TOOLS.map((tool) => {
                const has = table.tools.includes(tool)
                const off = table.disabled.includes(tool)
                return (
                  <li key={tool}>
                    <span>
                      {TOOL_INFO[tool].icon} {TOOL_INFO[tool].label}
                      {has && off ? '（已停用）' : ''}
                    </span>
                    {!has ? (
                      <button type="button" className="gtb-btn" onClick={() => addTool(tool)}>
                        加入
                      </button>
                    ) : off ? (
                      <button type="button" className="gtb-btn" onClick={() => toggleDisabled(tool)}>
                        重新啟用
                      </button>
                    ) : (
                      <button type="button" className="gtb-btn" onClick={() => press(`off-${tool}`, () => toggleDisabled(tool))}>
                        {armed === `off-${tool}` ? '再按一次停用' : '停用'}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
            <div className="gtb-btnrow">
              {table.tools.includes('resource') && (
                <button type="button" className="gtb-btn" onClick={() => startEdit('resource')}>
                  ＋ 新增資源種類
                </button>
              )}
              {table.tools.includes('score') && (
                <button type="button" className="gtb-btn" onClick={() => startEdit('score')}>
                  ＋ 新增計分項目
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="gtb-btnrow">
        <button type="button" className="gtb-btn" onClick={onBack}>
          ‹ 回房間
        </button>
        <button
          type="button"
          className="gtb-btn"
          onClick={() => press('close', () => update((t) => ({ ...t, closed: !t.closed })))}
        >
          {table.closed ? '重新開啟這桌' : armed === 'close' ? '再按一次，結束這桌' : '結束這桌'}
        </button>
      </div>
    </div>
  )
}

/* ───────────── 入口：房間視窗裡的「遊戲桌」區塊 ───────────── */

export default function GameTable({
  gatheringId,
  isAdmin,
  games,
  attendees,
  onActiveChange,
}: {
  gatheringId: string
  isAdmin: boolean
  games: Array<{ b: string; name: string }>
  attendees: string[]
  onActiveChange: (active: boolean) => void
}) {
  const [store, setStore] = useState<RoomStore>(() => loadStore(gatheringId))
  const [openId, setOpenId] = useState<string | null>(null)
  const { armed, press } = useArm()

  useEffect(() => {
    saveStore(gatheringId, store)
  }, [gatheringId, store])

  useEffect(() => {
    onActiveChange(openId !== null)
  }, [openId, onActiveChange])

  const table = openId ? (store.tables.find((t) => t.id === openId) ?? null) : null

  function updateTable(id: string, fn: (t: GameTableData) => GameTableData) {
    setStore((cur) => ({ ...cur, tables: cur.tables.map((t) => (t.id === id ? fn(t) : t)) }))
  }

  // 離場是聚會層級：記在這場聚會，也同步標到所有還沒結束的桌子
  function setLeft(name: string, left: boolean) {
    setStore((cur) => ({
      ...cur,
      left: left ? (cur.left.includes(name) ? cur.left : [...cur.left, name]) : cur.left.filter((x) => x !== name),
      tables: cur.tables.map((t) =>
        t.closed ? t : { ...t, players: t.players.map((p) => (p.name === name ? { ...p, left } : p)) },
      ),
    }))
  }

  function openNew() {
    const t = newTable('', null)
    setStore((cur) => ({ ...cur, tables: [...cur.tables, t] }))
    setOpenId(t.id)
  }

  function deleteTable(id: string) {
    setStore((cur) => ({ ...cur, tables: cur.tables.filter((t) => t.id !== id) }))
  }

  if (!isAdmin) return null

  if (table) {
    return (
      <div className="gtb-root gtb-root-x">
        <div className="gtb-head">
          <p className="gtb-title">{table.title.trim() || '新的一桌'}</p>
          <span className="gtb-badge">{table.phase === 'setup' ? '設定中' : table.closed ? '已結束' : '進行中'}</span>
        </div>
        {table.phase === 'setup' ? (
          <Setup
            table={table}
            update={(fn) => updateTable(table.id, fn)}
            games={games}
            attendees={attendees}
            leftNames={store.left}
            onBack={() => setOpenId(null)}
          />
        ) : (
          <Play
            table={table}
            update={(fn) => updateTable(table.id, fn)}
            gatheringId={gatheringId}
            isAdmin={isAdmin}
            onLeft={setLeft}
            onBack={() => setOpenId(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="gtb-root gtb-root-x">
      <div className="gtb-head">
        <p className="gtb-title">遊戲桌</p>
        <button type="button" className="gtb-link gtb-right" onClick={openNew}>
          ＋ 開新桌
        </button>
      </div>
      {store.tables.length === 0 ? (
        <p className="gtb-muted">還沒有開桌。按「開新桌」選遊戲、工具與玩家。資料只存在這支手機。</p>
      ) : (
        <ul className="gtb-tablelist">
          {store.tables.map((t) => (
            <li key={t.id}>
              <button type="button" className="gtb-tbtn" onClick={() => setOpenId(t.id)}>
                <b>{t.title.trim() || '未命名的一桌'}</b>
                <span>
                  {t.players.length} 人・{t.phase === 'setup' ? '設定中' : t.closed ? '已結束' : '進行中'}
                </span>
              </button>
              <button type="button" className="gtb-link" onClick={() => press(`del-${t.id}`, () => deleteTable(t.id))}>
                {armed === `del-${t.id}` ? '再按一次刪除' : '刪除'}
              </button>
            </li>
          ))}
        </ul>
      )}
      {attendees.length > 0 && (
        <details className="gtb-leave">
          <summary>出席者離場（離場的人不會被一鍵帶入新桌）</summary>
          <div className="gtb-chips">
            {attendees.map((n) => {
              const left = store.left.includes(n)
              return (
                <button key={n} type="button" className={left ? 'on' : ''} onClick={() => setLeft(n, !left)}>
                  {n}
                  {left ? '・已離場' : ''}
                </button>
              )
            })}
          </div>
        </details>
      )}
    </div>
  )
}

