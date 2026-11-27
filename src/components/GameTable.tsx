import { useEffect, useMemo, useRef, useState } from 'react'
import RoomTimer from './RoomTimer'
import TableHoldings from './TableHoldings'
import DiceEditor from './DiceEditor'
import IconPresetPicker from './IconPresetPicker'
import { supabase } from '../lib/supabase'
import { useSession } from '../lib/useSession'
import {
  MAX_ROWS,
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
  MAX_DICE_GROUPS,
  MAX_PLAYERS,
  TOOL_INFO,
  cellValue,
  clampValue,
  diceSummaryText,
  emptyDice,
  linkedResource,
  loadStore,
  newDiceGroup,
  newDraft,
  resValue,
  rollDie,
  rollGroup,
  saveStore,
  summarize,
  toolActive,
  totalOf,
  uid,
  type DiceBox,
  type DiceGroup,
  type Draft,
  type GameTableData,
  type LocalStore,
  type TablePlayer,
  type TableTool,
} from '../lib/gameTable'
import { useRoomTables, type RoomTablesApi } from '../lib/gameTableSync'
import '../styles/game-table.css'
import '../styles/game-table-sync.css'

// 聚會房間的「遊戲桌」（4b-1 同步版）
// 桌子、玩家、數字存在資料庫，同一場聚會的人即時看到同一桌。
// 管理者：開桌、設定、改所有數字；玩家：只能改「綁定給自己的那一格」；沒綁定的只能看。
// 流程：開桌（遊戲、工具、玩家）→ 資源設定 → 計分表設定 → 開始（這時才寫進資料庫）→ 進行畫面
// 這支手機自己留的：離場名單、設定到一半的草稿、骰子。

type Member = { userId: string | null; name: string }
type RosterRow = { out_user_id: string; out_name: string; out_me: boolean }

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

  function addPresets(items: PresetItem[]) {
    const next = [...rows]
    for (const it of items) {
      if (next.length >= MAX_ROWS) break
      if (next.some((r) => r.name.trim() === it.name)) continue
      next.push(blankRow(it.name, it.icon))
    }
    onChange(next)
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
                <IconPresetPicker
                  onPreset={
                    isRes
                      ? (it) => {
                          patch(r.id, { name: it.name, icon: it.icon })
                          setPickFor(null)
                        }
                      : undefined
                  }
                  isUsed={(name) => rows.some((x) => x.id !== r.id && x.name.trim() === name)}
                  onIcon={(ic) => {
                    patch(r.id, { icon: ic })
                    setPickFor(null)
                  }}
                />
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
        <IconPresetPicker
          showIcons={false}
          onPreset={(it) => addPresets([it])}
          onGroup={addPresets}
          isUsed={(name) => rows.some((r) => r.name.trim() === name)}
        />
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

/* ───────────── 開桌設定（第 1 步：遊戲、工具、玩家；第 2、3 步：資源、計分表） ───────────── */
// 設定只存在這支手機（草稿），按「開始這桌」才一次寫進資料庫，別人才看得到。

type Step = 'basic' | 'resource' | 'score'

function Setup({
  draft,
  update,
  games,
  members,
  leftNames,
  busy,
  message,
  onBack,
  onStart,
}: {
  draft: Draft
  update: (fn: (d: Draft) => Draft) => void
  games: Array<{ b: string; name: string }>
  members: Member[]
  leftNames: string[]
  busy: boolean
  message: string
  onBack: () => void
  onStart: () => void
}) {
  const steps: Step[] = useMemo(() => {
    const s: Step[] = ['basic']
    if (draft.tools.includes('resource')) s.push('resource')
    if (draft.tools.includes('score')) s.push('score')
    return s
  }, [draft.tools])
  const [index, setIndex] = useState(0)
  const [guest, setGuest] = useState('')
  const [msg, setMsg] = useState('')
  const step = steps[Math.min(index, steps.length - 1)]
  const takenNames = new Set(draft.players.map((p) => p.name.trim()))
  const takenIds = new Set(draft.players.map((p) => p.userId).filter((x): x is string => !!x))
  const free = members.filter((m) => !takenNames.has(m.name) && !(m.userId && takenIds.has(m.userId)))

  function addPlayer(name: string, userId: string | null) {
    const n = name.trim().slice(0, 12)
    if (!n) return
    update((d) => {
      if (d.players.length >= MAX_PLAYERS) return d
      if (d.players.some((p) => p.name.trim() === n || (userId !== null && p.userId === userId))) return d
      return { ...d, players: [...d.players, { id: uid(), name: n, userId }] }
    })
  }

  function importAll() {
    update((d) => {
      const haveNames = new Set(d.players.map((p) => p.name.trim()))
      const haveIds = new Set(d.players.map((p) => p.userId).filter((x): x is string => !!x))
      const add = members
        .filter((m) => !haveNames.has(m.name) && !(m.userId && haveIds.has(m.userId)) && !leftNames.includes(m.name))
        .slice(0, Math.max(0, MAX_PLAYERS - d.players.length))
        .map((m) => ({ id: uid(), name: m.name.slice(0, 12), userId: m.userId }))
      return { ...d, players: [...d.players, ...add] }
    })
  }

  function toggleTool(tool: TableTool) {
    update((d) => ({
      ...d,
      tools: d.tools.includes(tool) ? d.tools.filter((x) => x !== tool) : [...d.tools, tool],
    }))
  }

  function problem(): string {
    if (step === 'basic') {
      if (!draft.title.trim()) return '請選擇遊戲或輸入名稱。'
      if (draft.tools.length === 0) return '至少選一個工具。'
      if (draft.players.length < 2) return '至少 2 位玩家。'
      if (draft.players.some((p) => !p.name.trim())) return '玩家名稱不能空白。'
      if (new Set(draft.players.map((p) => p.name.trim())).size !== draft.players.length) return '玩家名稱不能重複。'
      if (members.length > 0 && draft.players.length > members.length) {
        return `這桌人數不能超過聚會出席人數（${members.length} 人）。`
      }
    }
    if (step === 'resource') {
      if (draft.resRows.length === 0) return '至少 1 種資源。'
      if (draft.resRows.some((r) => !r.name.trim())) return '資源名稱不能空白。'
    }
    if (step === 'score') {
      if (draft.scoreRows.length === 0) return '至少 1 個計分項目。'
      if (draft.scoreRows.some((r) => !r.name.trim())) return '計分項目名稱不能空白。'
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
    onStart()
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
              value={draft.bggName ?? ''}
              onChange={(e) => {
                const g = games.find((x) => x.b === e.target.value)
                update((d) => ({ ...d, bggName: g ? g.b : null, title: g ? g.name : d.title }))
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
            value={draft.title}
            maxLength={30}
            placeholder="這桌的名稱（例：旭日）"
            onChange={(e) => update((d) => ({ ...d, title: e.target.value, bggName: null }))}
          />

          <p className="gtb-sub">要用的工具（中途也能再加）</p>
          <div className="gtb-tools">
            {ALL_TOOLS.map((tool) => (
              <label key={tool} className={draft.tools.includes(tool) ? 'on' : ''}>
                <input type="checkbox" checked={draft.tools.includes(tool)} onChange={() => toggleTool(tool)} />
                <span>
                  {TOOL_INFO[tool].icon} {TOOL_INFO[tool].label}
                  <small>{TOOL_INFO[tool].hint}</small>
                </span>
              </label>
            ))}
          </div>

          <p className="gtb-sub">
            玩家（{draft.players.length}／{MAX_PLAYERS}）：從聚會成員帶入的玩家會綁定帳號，本人就能自己改自己的數字
          </p>
          <ul className="gtb-list">
            {draft.players.map((p) => (
              <li key={p.id} className="gtb-line">
                <input
                  className="gtb-in gtb-grow"
                  value={p.name}
                  maxLength={12}
                  onChange={(e) => update((d) => ({ ...d, players: d.players.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)) }))}
                />
                {p.userId && (
                  <span className="gtb-bound" title="已綁定帳號" aria-label="已綁定帳號">
                    🔗
                  </span>
                )}
                <button type="button" className="gtb-sq" aria-label="移除玩家" onClick={() => update((d) => ({ ...d, players: d.players.filter((x) => x.id !== p.id) }))}>
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
              {free.map((m) => (
                <button key={m.userId ?? m.name} type="button" onClick={() => addPlayer(m.name, m.userId)}>
                  ＋ {m.name}
                  {leftNames.includes(m.name) ? '（已離場）' : ''}
                </button>
              ))}
            </div>
          )}
          <div className="gtb-line">
            <input className="gtb-in gtb-grow" value={guest} maxLength={12} placeholder="手動加入訪客或家族名（不綁帳號）" onChange={(e) => setGuest(e.target.value)} />
            <button
              type="button"
              className="gtb-btn"
              onClick={() => {
                addPlayer(guest, null)
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
          <RowsEditor kind="resource" rows={draft.resRows} onChange={(rows) => update((d) => ({ ...d, resRows: rows }))} locked={new Set()} resNames={[]} />
        </>
      )}

      {step === 'score' && (
        <>
          <p className="gtb-muted">設定終局計分項目。有設定資源時，項目可以「取自資源」自動換算。</p>
          <RowsEditor
            kind="score"
            rows={draft.scoreRows}
            onChange={(rows) => update((d) => ({ ...d, scoreRows: rows }))}
            locked={new Set()}
            resNames={draft.resRows.map((r) => r.name.trim()).filter(Boolean)}
          />
        </>
      )}

      {msg && <p className="gtb-error">{msg}</p>}
      {message && <p className="gtb-error">{message}</p>}
      <div className="gtb-btnrow">
        <button type="button" className="gtb-btn" disabled={busy} onClick={index === 0 ? onBack : () => setIndex(index - 1)}>
          {index === 0 ? '‹ 回房間（草稿會保留）' : '上一步'}
        </button>
        <button type="button" className="gtb-btn main" disabled={busy} onClick={next}>
          {busy ? '建立中…' : last ? '開始這桌' : '下一步'}
        </button>
      </div>
    </div>
  )
}

/* ───────────── 進行畫面 ───────────── */

type Tab = 'players' | 'dice' | 'score' | 'hold'

function Play({
  table,
  api,
  gatheringId,
  isAdmin,
  myId,
  box,
  onBox,
  members,
  onLeft,
  onBack,
}: {
  table: GameTableData
  api: RoomTablesApi
  gatheringId: string
  isAdmin: boolean
  myId: string | null
  box: DiceBox
  onBox: (fn: (b: DiceBox) => DiceBox) => void
  members: Member[]
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
  const [saving, setSaving] = useState(false)
  const [guest, setGuest] = useState('')
  const [manageMsg, setManageMsg] = useState('')

  const resOn = toolActive(table, 'resource')
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

  // 誰能改：桌子沒結束，而且是管理者，或這一格綁定的就是我
  function canEdit(p: TablePlayer): boolean {
    return !table.closed && (isAdmin || (myId !== null && p.userId === myId))
  }
  const hasMine = myId !== null && table.players.some((p) => p.userId === myId)

  function startEdit(kind: 'resource' | 'score') {
    setDraftRows(kind === 'resource' ? table.resRows : table.scoreRows)
    setEditing(kind)
  }

  async function finishEdit() {
    if (!editing || saving) return
    if (draftRows.some((r) => !r.name.trim())) return
    const rows = draftRows.map((r) => ({ ...r, name: r.name.trim() }))
    setSaving(true)
    const ok = await api.saveSetup(table, editing === 'resource' ? { resRows: rows } : { scoreRows: rows })
    setSaving(false)
    if (ok) setEditing(null)
  }

  function addTool(tool: TableTool) {
    if (!table.tools.includes(tool)) void api.saveSetup(table, { tools: [...table.tools, tool] })
    if (tool === 'resource') startEdit('resource')
    if (tool === 'score') startEdit('score')
    if (tool === 'dice') {
      setTab('dice')
      setDiceEdit(newDiceGroup())
    }
  }

  function toggleDisabled(tool: TableTool) {
    void api.saveSetup(table, {
      disabled: table.disabled.includes(tool) ? table.disabled.filter((x) => x !== tool) : [...table.disabled, tool],
    })
  }

  function saveDice(g: DiceGroup) {
    onBox((b) => {
      const exists = b.groups.some((x) => x.id === g.id)
      return { ...b, groups: exists ? b.groups.map((x) => (x.id === g.id ? g : x)) : [...b.groups, g] }
    })
    setDiceEdit(null)
  }

  function logRoll(b: DiceBox, g: DiceGroup, results: string[]): string[] {
    const name = g.name || `骰子 ${b.groups.findIndex((x) => x.id === g.id) + 1}`
    return [`${name}：${summarize(results)}`, ...b.log].slice(0, 5)
  }

  function roll(g: DiceGroup) {
    const results = rollGroup(g)
    onBox((b) => ({
      groups: b.groups.map((x) => (x.id === g.id ? { ...x, results } : x)),
      log: logRoll(b, g, results),
    }))
  }

  function reroll(g: DiceGroup, index: number) {
    const results = g.results.map((r, i) => (i === index ? rollDie(g.faces) : r))
    onBox((b) => ({
      groups: b.groups.map((x) => (x.id === g.id ? { ...x, results } : x)),
      log: logRoll(b, g, results),
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

  // 玩家管理（管理者）
  const boundIds = new Set(table.players.map((p) => p.userId).filter((x): x is string => !!x))
  const takenNames = new Set(table.players.map((p) => p.name.trim()))
  const freeMembers = members.filter((m) => !takenNames.has(m.name) && !(m.userId && boundIds.has(m.userId)))

  async function addMember(name: string, userId: string | null) {
    const n = name.trim().slice(0, 12)
    if (!n) return
    if (takenNames.has(n)) return setManageMsg('這桌已經有同名的玩家。')
    if (table.players.length >= MAX_PLAYERS) return setManageMsg(`最多 ${MAX_PLAYERS} 位玩家。`)
    setManageMsg('')
    await api.addPlayer(table.id, n, userId)
  }

  function rename(p: TablePlayer, value: string) {
    const n = value.trim().slice(0, 12)
    if (!n || n === p.name) return
    if (table.players.some((x) => x.id !== p.id && x.name.trim() === n)) {
      setManageMsg('這桌已經有同名的玩家。')
      return
    }
    setManageMsg('')
    void api.updatePlayer(p, { name: n })
  }

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
          <button type="button" className="gtb-btn" disabled={saving} onClick={() => setEditing(null)}>
            取消
          </button>
          <button type="button" className="gtb-btn main" disabled={saving} onClick={() => void finishEdit()}>
            {saving ? '儲存中…' : '完成'}
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

      {table.closed && <p className="gtb-muted">這桌已結束，只能看不能改。</p>}
      {!table.closed && !isAdmin && !hasMine && (
        <p className="gtb-muted">你還沒有被綁定到這桌的玩家格，目前只能看；需要編輯請找管理者幫你綁定。</p>
      )}

      {shownTab === 'players' && (
        <>
          <ul className="gtb-players">
            {table.players.map((p) => {
              const open = openPlayer === p.id
              const mine = myId !== null && p.userId === myId
              return (
                <li key={p.id} className={`${p.left ? 'left' : ''}${open ? ' open' : ''}`}>
                  <div className="gtb-phead">
                    <button type="button" className="gtb-pname" onClick={() => setOpenPlayer(open ? null : p.id)} aria-expanded={open}>
                      <b>{p.name}</b>
                      {mine && <span className="gtb-me">你</span>}
                      {p.left && <small>已離場</small>}
                    </button>
                    {isAdmin && (
                      <button type="button" className="gtb-link" onClick={() => onLeft(p.name, !p.left)}>
                        {p.left ? '取消離場' : '離場'}
                      </button>
                    )}
                  </div>
                  {resOn && !open && (
                    <p className="gtb-sumline">
                      {table.resRows.map((r) => (
                        <span key={r.id}>
                          {r.icon}
                          {resValue(table, p.id, r)}
                        </span>
                      ))}
                    </p>
                  )}
                  {resOn && open && canEdit(p) && (
                    <ul className="gtb-resedit">
                      {table.resRows.map((r) => {
                        const v = resValue(table, p.id, r)
                        return (
                          <li key={r.id}>
                            <span className="gtb-rname">
                              {r.icon} {r.name}
                            </span>
                            <button type="button" className="gtb-sq" aria-label={`${r.name} 減 1`} onClick={() => api.setValue(p.id, 'res', r.id, v - 1)}>
                              －
                            </button>
                            <input className="gtb-in gtb-num" type="number" min={0} value={v} onChange={(e) => api.setValue(p.id, 'res', r.id, Number(e.target.value))} />
                            <button type="button" className="gtb-sq" aria-label={`${r.name} 加 1`} onClick={() => api.setValue(p.id, 'res', r.id, v + 1)}>
                              ＋
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                  {resOn && open && !canEdit(p) && (
                    <ul className="gtb-resedit">
                      {table.resRows.map((r) => (
                        <li key={r.id}>
                          <span className="gtb-rname">
                            {r.icon} {r.name}
                          </span>
                          <span className="gtb-rovalue">{resValue(table, p.id, r)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
          {!resOn && <p className="gtb-muted">這桌沒有用資源計數器{isAdmin ? '；可在下方「工具與設定」加入。' : '。'}</p>}
        </>
      )}

      {shownTab === 'dice' && (
        <>
          {diceEdit ? (
            <DiceEditor initial={diceEdit} onSave={saveDice} onCancel={() => setDiceEdit(null)} />
          ) : (
            <>
              <p className="gtb-muted">骰子只存在這支手機，別人看不到你的結果。</p>
              {box.groups.length === 0 && <p className="gtb-muted">還沒有骰子組，按「＋ 新增骰子組」。</p>}
              {box.groups.map((g, gi) => (
                <div key={g.id} className="gtb-card">
                  <div className="gtb-line">
                    <b className="gtb-grow">{g.name || `骰子 ${gi + 1}`}</b>
                    <button type="button" className="gtb-link" onClick={() => setDiceEdit(g)}>
                      編輯
                    </button>
                    <button
                      type="button"
                      className="gtb-link"
                      onClick={() => press(`dd-${g.id}`, () => onBox((b) => ({ ...b, groups: b.groups.filter((x) => x.id !== g.id) })))}
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
              <button type="button" className="gtb-btn" disabled={box.groups.length >= MAX_DICE_GROUPS} onClick={() => setDiceEdit(newDiceGroup())}>
                ＋ 新增骰子組（{box.groups.length}／{MAX_DICE_GROUPS}）
              </button>
              {box.log.length > 0 && (
                <>
                  <p className="gtb-sub">最近 5 次</p>
                  <ul className="gtb-log">
                    {box.log.map((x, i) => (
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
                            {link || !canEdit(p) ? (
                              <span className="gtb-auto">{cellValue(table, row, p.id)}</span>
                            ) : (
                              <input
                                className="gtb-in gtb-cell"
                                type="number"
                                min={0}
                                value={table.scores[p.id]?.[row.id] ?? 0}
                                onChange={(e) => api.setValue(p.id, 'score', row.id, Number(e.target.value))}
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

      {shownTab === 'hold' && (
        <TableHoldings
          table={table}
          isAdmin={isAdmin}
          canEdit={(pid) => {
            const p = table.players.find((x) => x.id === pid)
            return !!p && canEdit(p)
          }}
          onCount={(pid, itemId, count) => api.setValue(pid, 'hold', itemId, count)}
          onSets={(sets) => void api.saveSetup(table, { holdSets: sets })}
        />
      )}

      {isAdmin && (
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

              <p className="gtb-sub">玩家與帳號綁定（綁定的人可以自己改自己的數字；移除玩家會一併刪掉他的數字）</p>
              <ul className="gtb-list">
                {table.players.map((p) => (
                  <li key={`${p.id}-${p.name}`} className="gtb-line gtb-wrap">
                    <input
                      className="gtb-in gtb-grow"
                      defaultValue={p.name}
                      maxLength={12}
                      aria-label="玩家名稱"
                      onBlur={(e) => rename(p, e.target.value)}
                    />
                    <select
                      className="gtb-in gtb-bind"
                      aria-label="綁定帳號"
                      value={p.userId ?? ''}
                      onChange={(e) => void api.updatePlayer(p, { userId: e.target.value || null })}
                    >
                      <option value="">未綁定（訪客）</option>
                      {members
                        .filter((m) => m.userId && (m.userId === p.userId || !boundIds.has(m.userId)))
                        .map((m) => (
                          <option key={m.userId} value={m.userId ?? ''}>
                            {m.name}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      className="gtb-link"
                      onClick={() => press(`rp-${p.id}`, () => void api.removePlayer(p.id))}
                    >
                      {armed === `rp-${p.id}` ? '再按一次移除' : '移除'}
                    </button>
                  </li>
                ))}
              </ul>
              {freeMembers.length > 0 && table.players.length < MAX_PLAYERS && (
                <div className="gtb-chips">
                  {freeMembers.map((m) => (
                    <button key={m.userId ?? m.name} type="button" onClick={() => void addMember(m.name, m.userId)}>
                      ＋ {m.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="gtb-line">
                <input className="gtb-in gtb-grow" value={guest} maxLength={12} placeholder="加入訪客（不綁帳號）" onChange={(e) => setGuest(e.target.value)} />
                <button
                  type="button"
                  className="gtb-btn"
                  onClick={() => {
                    void addMember(guest, null)
                    setGuest('')
                  }}
                >
                  加入
                </button>
              </div>
              {manageMsg && <p className="gtb-error">{manageMsg}</p>}
            </div>
          )}
        </div>
      )}

      <div className="gtb-btnrow">
        <button type="button" className="gtb-btn" onClick={onBack}>
          ‹ 回房間
        </button>
        {isAdmin && (
          <button
            type="button"
            className="gtb-btn"
            onClick={() => press('close', () => void api.saveSetup(table, { closed: !table.closed }))}
          >
            {table.closed ? '重新開啟這桌' : armed === 'close' ? '再按一次，結束這桌' : '結束這桌'}
          </button>
        )}
      </div>
    </div>
  )
}

/* ───────────── 入口：房間視窗裡的「遊戲桌」區塊 ───────────── */

type View = { kind: 'list' } | { kind: 'setup' } | { kind: 'table'; id: string }

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
  const session = useSession()
  const myId = session?.user?.id ?? null
  const api = useRoomTables(gatheringId)
  const [local, setLocal] = useState<LocalStore>(() => loadStore(gatheringId))
  const [view, setView] = useState<View>({ kind: 'list' })
  const [roster, setRoster] = useState<Member[]>([])
  const [busy, setBusy] = useState(false)
  const [startMsg, setStartMsg] = useState('')
  const { armed, press } = useArm()

  useEffect(() => {
    saveStore(gatheringId, local)
  }, [gatheringId, local])

  useEffect(() => {
    onActiveChange(view.kind !== 'list')
  }, [view.kind, onActiveChange])

  // 聚會成員（含帳號 id），給管理者帶入玩家、綁定帳號用
  useEffect(() => {
    if (!isAdmin) return
    let alive = true
    void supabase.rpc('get_room_players', { p_gathering: gatheringId }).then((res) => {
      if (!alive || res.error) return
      const rows = (res.data ?? []) as RosterRow[]
      setRoster(rows.map((r) => ({ userId: r.out_user_id, name: r.out_name })))
    })
    return () => {
      alive = false
    }
  }, [gatheringId, isAdmin])

  const members = useMemo<Member[]>(
    () => (roster.length > 0 ? roster : attendees.map((n) => ({ userId: null, name: n }))),
    [roster, attendees],
  )

  // 離場名單只存在管理者這支手機，套到每桌的玩家上
  const tables = useMemo(
    () =>
      api.tables.map((t) => ({
        ...t,
        players: t.players.map((p) => ({ ...p, left: local.left.includes(p.name) })),
      })),
    [api.tables, local.left],
  )
  const shown = tables.filter((t) => isAdmin || t.phase === 'play')
  const table = view.kind === 'table' ? (tables.find((t) => t.id === view.id) ?? null) : null

  // 開著的那桌被刪掉（例如管理者刪了）就回到清單
  useEffect(() => {
    if (view.kind === 'table' && api.loaded && !table) setView({ kind: 'list' })
  }, [view, api.loaded, table])

  function setLeft(name: string, left: boolean) {
    setLocal((cur) => ({
      ...cur,
      left: left ? (cur.left.includes(name) ? cur.left : [...cur.left, name]) : cur.left.filter((x) => x !== name),
    }))
  }

  function updateDraft(fn: (d: Draft) => Draft) {
    setLocal((cur) => (cur.draft ? { ...cur, draft: fn(cur.draft) } : cur))
  }

  function openSetup() {
    setStartMsg('')
    setLocal((cur) => (cur.draft ? cur : { ...cur, draft: newDraft() }))
    setView({ kind: 'setup' })
  }

  async function startDraft() {
    if (!local.draft || busy) return
    setBusy(true)
    setStartMsg('')
    const r = await api.createFromDraft(local.draft)
    setBusy(false)
    if (!r.id) {
      setStartMsg(r.message || '建立失敗，請再試一次。')
      return
    }
    setLocal((cur) => ({ ...cur, draft: null }))
    setView({ kind: 'table', id: r.id })
  }

  async function removeTable(id: string) {
    const ok = await api.deleteTable(id)
    if (!ok) return
    setLocal((cur) => {
      const dice = { ...cur.dice }
      delete dice[id]
      return { ...cur, dice }
    })
  }

  const errorLine = api.error ? (
    <p className="gtb-error">
      {api.error}{' '}
      <button type="button" className="gtb-link" onClick={api.clearError}>
        知道了
      </button>
    </p>
  ) : null

  // 一般出席者：沒有桌就不顯示這個區塊
  if (!isAdmin && (!api.loaded || shown.length === 0)) return null

  if (view.kind === 'setup' && isAdmin && local.draft) {
    return (
      <div className="gtb-root gtb-root-x">
        <div className="gtb-head">
          <p className="gtb-title">{local.draft.title.trim() || '新的一桌'}</p>
          <span className="gtb-badge">設定中</span>
        </div>
        {errorLine}
        <Setup
          draft={local.draft}
          update={updateDraft}
          games={games}
          members={members}
          leftNames={local.left}
          busy={busy}
          message={startMsg}
          onBack={() => setView({ kind: 'list' })}
          onStart={() => void startDraft()}
        />
      </div>
    )
  }

  if (table) {
    const box = local.dice[table.id] ?? emptyDice()
    return (
      <div className="gtb-root gtb-root-x">
        <div className="gtb-head">
          <p className="gtb-title">{table.title.trim() || '未命名的一桌'}</p>
          <span className="gtb-badge">{table.phase === 'setup' ? '未完成' : table.closed ? '已結束' : '進行中'}</span>
        </div>
        {errorLine}
        {table.phase === 'setup' ? (
          <div className="gtb-body">
            <p className="gtb-muted">這桌沒有設定完成（可能是中途斷線），請刪除後重新開一桌。</p>
            <div className="gtb-btnrow">
              <button type="button" className="gtb-btn" onClick={() => setView({ kind: 'list' })}>
                ‹ 回房間
              </button>
              {isAdmin && (
                <button
                  type="button"
                  className="gtb-btn"
                  onClick={() =>
                    press(`del-${table.id}`, () => {
                      setView({ kind: 'list' })
                      void removeTable(table.id)
                    })
                  }
                >
                  {armed === `del-${table.id}` ? '再按一次刪除' : '刪除這桌'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <Play
            key={table.id}
            table={table}
            api={api}
            gatheringId={gatheringId}
            isAdmin={isAdmin}
            myId={myId}
            box={box}
            onBox={(fn) =>
              setLocal((cur) => ({ ...cur, dice: { ...cur.dice, [table.id]: fn(cur.dice[table.id] ?? emptyDice()) } }))
            }
            members={members}
            onLeft={setLeft}
            onBack={() => setView({ kind: 'list' })}
          />
        )}
      </div>
    )
  }

  return (
    <div className="gtb-root gtb-root-x">
      <div className="gtb-head">
        <p className="gtb-title">遊戲桌</p>
        {isAdmin && (
          <button type="button" className="gtb-link gtb-right" onClick={openSetup}>
            ＋ 開新桌
          </button>
        )}
      </div>
      {errorLine}
      {!api.loaded ? (
        <p className="gtb-muted">讀取中…</p>
      ) : shown.length === 0 && !local.draft ? (
        <p className="gtb-muted">還沒有開桌。按「開新桌」選遊戲、工具與玩家，開桌後這場聚會的人都看得到。</p>
      ) : (
        <ul className="gtb-tablelist">
          {isAdmin && local.draft && (
            <li>
              <button type="button" className="gtb-tbtn" onClick={openSetup}>
                <b>{local.draft.title.trim() || '未命名的一桌'}</b>
                <span>設定到一半（只在這支手機）・繼續</span>
              </button>
              <button
                type="button"
                className="gtb-link"
                onClick={() => press('draft', () => setLocal((cur) => ({ ...cur, draft: null })))}
              >
                {armed === 'draft' ? '再按一次放棄' : '放棄'}
              </button>
            </li>
          )}
          {shown.map((t) => (
            <li key={t.id}>
              <button type="button" className="gtb-tbtn" onClick={() => setView({ kind: 'table', id: t.id })}>
                <b>{t.title.trim() || '未命名的一桌'}</b>
                <span>
                  {t.players.length} 人・{t.phase === 'setup' ? '未完成' : t.closed ? '已結束' : '進行中'}
                </span>
              </button>
              {isAdmin && (
                <button type="button" className="gtb-link" onClick={() => press(`del-${t.id}`, () => void removeTable(t.id))}>
                  {armed === `del-${t.id}` ? '再按一次刪除' : '刪除'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {isAdmin && members.length > 0 && (
        <details className="gtb-leave">
          <summary>出席者離場（離場的人不會被一鍵帶入新桌；只記在這支手機）</summary>
          <div className="gtb-chips">
            {members.map((m) => {
              const left = local.left.includes(m.name)
              return (
                <button key={m.userId ?? m.name} type="button" className={left ? 'on' : ''} onClick={() => setLeft(m.name, !left)}>
                  {m.name}
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
