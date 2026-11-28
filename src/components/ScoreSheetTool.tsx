import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MAX_ROWS,
  MAX_VALUE,
  checkVip,
  deleteTemplate,
  fmt,
  getResourceSnapshot,
  liveAmount,
  loadTemplates,
  newRowId,
  resourceNames,
  rowPoints,
  saveTemplate,
  setResourceSnapshot,
  subscribeResourceSnapshot,
  toolOf,
  type SheetRow,
  type SheetTemplate,
  type ToolKind,
} from '../lib/scoreSheet'
import IconPresetPicker from './IconPresetPicker'
import IconView from './IconView'
import { HelpNote } from './HelpNote'
import { WS_MAX_NAME, WS_MAX_PLAYERS, WS_MIN_PLAYERS, resizeNames } from '../lib/toolWorkspace'
import '../styles/score-sheet.css'

// 兩個小工具共用這支元件：
//   tool="resource"＝資源計數器：每人每項資源用 ＋／− 記數量，不計分。
//   tool="score"   ＝計分表：每一列是算分項目（符號、每個算幾分），輸入數字後算總分與排名。
// 單機使用：數字只存這支手機的瀏覽器（已儲存的範本才會記），不寫資料庫；範本本身才存資料庫。
// 在小工具工作區裡：設定（範本清單與編輯）按「下一步」交給工作區；玩家名單由工作區共用；
// 計分表「取自資源」的列即時讀資源計數器的數字（資源被移除就顯示「資源已不存在」，改手動輸入）。

type Mode =
  | { name: 'list' }
  | { name: 'edit'; draft: SheetTemplate }

const RUN_KEY = 'boardgame-sheet-run|'

/* ───────────── 編輯範本 ───────────── */

type EditRow = {
  id: string
  name: string
  icon: string
  sign: 1 | -1
  multStr: string
  initStr: string
  linked: boolean
  fromStr: string
  perStr: string
}

function newEditRow(): EditRow {
  return {
    id: newRowId(),
    name: '',
    icon: '⭐',
    sign: 1,
    multStr: '1',
    initStr: '0',
    linked: false,
    fromStr: '',
    perStr: '1',
  }
}

function toEdit(rows: SheetRow[]): EditRow[] {
  if (rows.length === 0) return [newEditRow()]
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    icon: r.icon,
    sign: r.sign,
    multStr: fmt(r.mult),
    initStr: String(r.init),
    linked: Boolean(r.from),
    fromStr: r.from ?? '',
    perStr: String(r.per ?? 1),
  }))
}

// 資源計數器的列一律是「計數」、不計分；計分表的列一律是「只算分」
function fromEdit(rows: EditRow[], tool: ToolKind): SheetRow[] {
  return rows.map((r): SheetRow => {
    const m = parseFloat(r.multStr)
    const i = parseInt(r.initStr, 10)
    if (tool === 'resource') {
      return {
        id: r.id,
        name: r.name.trim(),
        icon: r.icon || '⭐',
        kind: 'count',
        sign: 1,
        mult: 1,
        init: Number.isFinite(i) ? Math.max(0, Math.min(MAX_VALUE, i)) : 0,
      }
    }
    const out: SheetRow = {
      id: r.id,
      name: r.name.trim(),
      icon: r.icon || '⭐',
      kind: 'score',
      sign: r.sign,
      mult: Number.isFinite(m) ? Math.max(-1000, Math.min(1000, m)) : 1,
      init: 0,
    }
    const from = r.linked ? r.fromStr.trim() : ''
    if (from) {
      const per = parseInt(r.perStr, 10)
      out.from = from
      out.per = Number.isFinite(per) ? Math.max(1, Math.min(MAX_VALUE, per)) : 1
    }
    return out
  })
}

function SheetEditor({
  initial,
  tool,
  isVip,
  onBack,
  onUse,
  useLabel,
  onChanged,
}: {
  initial: SheetTemplate
  tool: ToolKind
  isVip: boolean
  onBack: () => void
  onUse: (tpl: SheetTemplate) => void
  useLabel: string
  onChanged: () => void
}) {
  const isRes = tool === 'resource'
  // 資源計數器還沒用過（沒有資料可帶入）就不顯示「取自資源計數器」；已經勾過的列照常顯示
  const hasSnap = getResourceSnapshot() !== null
  const [title, setTitle] = useState(initial.title)
  const [rows, setRows] = useState<EditRow[]>(() => toEdit(initial.rows))
  const [shared, setShared] = useState(initial.isShared)
  const [savedId, setSavedId] = useState<string | null>(initial.id)
  const [pickerFor, setPickerFor] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  function update(id: string, patch: Partial<EditRow>) {
    setRows((cur) => cur.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function move(index: number, delta: number) {
    setRows((cur) => {
      const to = index + delta
      if (to < 0 || to >= cur.length) return cur
      const next = [...cur]
      const a = next[index]
      const b = next[to]
      if (!a || !b) return cur
      next[index] = b
      next[to] = a
      return next
    })
  }

  function check(): string {
    if (rows.length === 0) return '至少要有一列。'
    if (!rows.every((r) => r.name.trim().length > 0)) return '每一列都要填名稱。'
    if (tool === 'score' && rows.some((r) => r.linked && r.fromStr.trim() === '')) {
      return '勾了「取自資源」的列，要填資源名稱。'
    }
    return ''
  }

  function build(): SheetTemplate {
    return {
      id: savedId,
      title: title.trim() || '未命名表單',
      bggName: initial.bggName,
      isOfficial: initial.isOfficial,
      isShared: shared,
      mine: true,
      rows: fromEdit(rows, tool),
      tool,
    }
  }

  async function handleSave() {
    if (!isVip) return
    const problem = check() || (title.trim() ? '' : '請先填表單名稱。')
    if (problem) {
      setMsg(problem)
      return
    }
    setBusy(true)
    setMsg('')
    const res = await saveTemplate(build())
    setBusy(false)
    if (res.id) {
      setSavedId(res.id)
      setMsg('已儲存。')
      onChanged()
    } else {
      setMsg(res.message)
    }
  }

  function handleUse() {
    const problem = check()
    if (problem) {
      setMsg(problem)
      return
    }
    onUse(build())
  }

  return (
    <div className="ss-root">
      <div className="ss-bar">
        <button type="button" className="ss-link" onClick={onBack}>
          ‹ 返回
        </button>
        <span className="ss-bar-title">{savedId ? '編輯表單' : '新增表單'}</span>
        <span className="ss-bar-space" />
      </div>
      <datalist id="ss-res-names">
        {resourceNames().map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <div className="ss-scroll">
        <label className="gt-field ss-title-field">
          名稱
          <input
            className="gt-input ss-grow"
            value={title}
            maxLength={40}
            placeholder={isRes ? '例：星河交匯 資源' : '例：星河交匯 終局'}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <HelpNote
          text={
            isRes
              ? '資源計數器：遊戲中用 ＋／− 記每個人的資源數量，不計分。「起始」是開局時的數量。'
              : '計分表：每一列是一個算分項目，設好符號與「每個算幾分」，使用時只要輸入數字。'
          }
        />

        <ul className="ss-edit-list">
          {rows.map((row, index) => (
            <li key={row.id} className="ss-edit-row">
              <div className="ss-edit-line">
                <button
                  type="button"
                  className="ss-icon-btn"
                  aria-label="選擇圖示"
                  onClick={() => setPickerFor(pickerFor === row.id ? null : row.id)}
                >
                  <IconView icon={row.icon} />
                </button>
                <input
                  className="gt-input ss-grow"
                  value={row.name}
                  maxLength={20}
                  placeholder={isRes ? '名稱（例：金幣）' : '項目（例：建築）'}
                  onChange={(event) => update(row.id, { name: event.target.value })}
                />
                <button type="button" className="ss-mini" aria-label="上移" onClick={() => move(index, -1)}>
                  ↑
                </button>
                <button type="button" className="ss-mini" aria-label="下移" onClick={() => move(index, 1)}>
                  ↓
                </button>
                <button
                  type="button"
                  className="ss-mini ss-danger"
                  aria-label="刪除這列"
                  onClick={() => setRows((cur) => cur.filter((r) => r.id !== row.id))}
                >
                  ✕
                </button>
              </div>

              {pickerFor === row.id && (
                <IconPresetPicker
                  onPreset={
                    isRes
                      ? (it) => {
                          update(row.id, { name: it.name, icon: it.icon })
                          setPickerFor(null)
                        }
                      : undefined
                  }
                  isUsed={(name) => rows.some((r) => r.id !== row.id && r.name === name)}
                  onIcon={(icon) => {
                    update(row.id, { icon })
                    setPickerFor(null)
                  }}
                />
              )}

              {isRes ? (
                <div className="ss-edit-line ss-wrap">
                  <label className="gt-field">
                    起始
                    <input
                      className="gt-input ss-num"
                      inputMode="numeric"
                      value={row.initStr}
                      onChange={(event) => update(row.id, { initStr: event.target.value })}
                    />
                  </label>
                </div>
              ) : (
                <>
                <div className="ss-edit-line ss-wrap">
                  <div className="ss-seg" role="group" aria-label="加分或扣分">
                    <button
                      type="button"
                      className={row.sign === 1 ? 'on' : ''}
                      onClick={() => update(row.id, { sign: 1 })}
                    >
                      ＋
                    </button>
                    <button
                      type="button"
                      className={row.sign === -1 ? 'on neg' : ''}
                      onClick={() => update(row.id, { sign: -1 })}
                    >
                      −
                    </button>
                  </div>
                  <label className="gt-field">
                    {row.linked ? '算' : '每個'}
                    <input
                      className="gt-input ss-num"
                      inputMode="decimal"
                      value={row.multStr}
                      onChange={(event) => update(row.id, { multStr: event.target.value })}
                    />
                    分
                  </label>
                </div>
                {(hasSnap || row.linked) && (
                  <div className="ss-edit-line ss-wrap">
                    <label className="gt-check">
                      <input
                        type="checkbox"
                        checked={row.linked}
                        onChange={(event) => update(row.id, { linked: event.target.checked })}
                      />
                      取自資源計數器（選填，資源數字改了這裡會即時跟著變）
                    </label>
                  </div>
                )}
                {row.linked && (
                  <div className="ss-edit-line ss-wrap">
                    <label className="gt-field">
                      資源名稱
                      <input
                        className="gt-input ss-from"
                        value={row.fromStr}
                        maxLength={20}
                        placeholder="例：木頭"
                        list="ss-res-names"
                        onChange={(event) => update(row.id, { fromStr: event.target.value })}
                      />
                    </label>
                    <label className="gt-field">
                      每
                      <input
                        className="gt-input ss-num"
                        inputMode="numeric"
                        value={row.perStr}
                        onChange={(event) => update(row.id, { perStr: event.target.value })}
                      />
                      個
                    </label>
                  </div>
                )}
                </>
              )}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="gt-secondary ss-add"
          disabled={rows.length >= MAX_ROWS}
          onClick={() => setRows((cur) => [...cur, newEditRow()])}
        >
          ＋ 新增一列（{rows.length}／{MAX_ROWS}）
        </button>

        {isVip && (
          <label className="gt-check ss-share">
            <input
              type="checkbox"
              checked={shared}
              onChange={(event) => setShared(event.target.checked)}
            />
            分享給其他 VIP（只分享表單，不含任何人填的數字）
          </label>
        )}

        {msg && <p className="gt-msg ss-msg">{msg}</p>}

        <div className="gt-actions ss-actions">
          <button type="button" className="gt-primary" onClick={handleUse}>
            {useLabel}
          </button>
          {isVip ? (
            <button type="button" className="gt-secondary" disabled={busy} onClick={() => void handleSave()}>
              {busy ? '儲存中…' : '儲存表單'}
            </button>
          ) : (
            <HelpNote text="儲存與分享需要 VIP；現在可以直接使用，但關掉後不會保留表單。" />
          )}
        </div>
      </div>
    </div>
  )
}

/* ───────────── 使用：輸入與總分 ───────────── */

type Run = { values: Array<Record<string, number>> }

function makeValues(tpl: SheetTemplate): Record<string, number> {
  const v: Record<string, number> = {}
  for (const r of tpl.rows) if (r.kind === 'count') v[r.id] = r.init
  return v
}

function defaultRun(tpl: SheetTemplate, np: number): Run {
  return { values: Array.from({ length: np }, () => makeValues(tpl)) }
}

// 只讀回每位玩家的數字；玩家名單由工作區共用，不存在這裡
function loadRun(tpl: SheetTemplate, np: number): Run {
  const run = defaultRun(tpl, np)
  if (!tpl.id) return run
  try {
    const raw = localStorage.getItem(RUN_KEY + tpl.id)
    if (!raw) return run
    const p = JSON.parse(raw) as Partial<Run>
    if (!Array.isArray(p.values)) return run
    for (let i = 0; i < np; i += 1) {
      const saved = p.values[i] as Record<string, unknown> | undefined
      const target = run.values[i]
      if (saved && typeof saved === 'object' && target) {
        for (const r of tpl.rows) {
          const x = saved[r.id]
          if (typeof x === 'number' && Number.isFinite(x)) target[r.id] = x
        }
      }
    }
    return run
  } catch {
    return run
  }
}

export function PlayView({
  tpl,
  names,
  onNames,
  active,
}: {
  tpl: SheetTemplate
  names: string[]
  onNames: (names: string[]) => void
  active: boolean
}) {
  const rows = tpl.rows
  // 資源計數器不計分：沒有總分分頁、沒有每列分數
  const isRes = toolOf(tpl) === 'resource'
  const np = names.length
  const [run, setRun] = useState<Run>(() => loadRun(tpl, np))
  const [tab, setTab] = useState<'input' | 'total'>('input')
  const [sel, setSel] = useState({ p: 0, i: 0 })
  const [open, setOpen] = useState<number | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const fresh = useRef(true)
  const resetTimer = useRef<number | null>(null)
  const [, setTick] = useState(0)

  // 資源計數器的數字一變，連動的計分列就重新算
  useEffect(() => subscribeResourceSnapshot(() => setTick((n) => n + 1)), [])

  useEffect(() => {
    if (!tpl.id) return
    try {
      localStorage.setItem(RUN_KEY + tpl.id, JSON.stringify(run))
    } catch {
      // 存不了就算了
    }
  }, [run, tpl.id])

  // 玩家人數（工作區共用）變了：這個表的數字跟著補齊或截掉
  useEffect(() => {
    setRun((prev) => {
      if (prev.values.length === np) return prev
      const values = prev.values.slice(0, np)
      while (values.length < np) values.push(makeValues(tpl))
      return { values }
    })
    setSel((cur) => (cur.p > np - 1 ? { p: np - 1, i: 0 } : cur))
  }, [np, tpl])

  // 資源計數器：把目前數量放進記憶體，計分表「取自資源」的列即時讀
  useEffect(() => {
    if (!isRes) return
    setResourceSnapshot(tpl.title, rows, names, run.values)
  }, [isRes, tpl.title, rows, names, run])

  useEffect(
    () => () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current)
    },
    [],
  )

  useEffect(() => {
    if (!active || tab !== 'input') return
    document.querySelector('[data-ss-active="1"]')?.scrollIntoView({ block: 'nearest' })
  }, [sel, tab, active])

  // 連動的列：資源還在 → 用資源換算的數字（不能手動改）；資源不在 → 手動輸入
  function isLive(row: SheetRow, p: number): boolean {
    return !isRes && liveAmount(row, p).state === 'ok'
  }

  function valueOf(p: number, id: string): number | undefined {
    const row = rows.find((r) => r.id === id)
    if (row && !isRes) {
      const live = liveAmount(row, p)
      if (live.state === 'ok') return live.value
    }
    return run.values[p]?.[id]
  }

  function totalOf(p: number): number {
    let sum = 0
    for (const r of rows) sum += rowPoints(r, valueOf(p, r.id) ?? 0)
    return sum
  }

  function setVal(p: number, id: string, n: number) {
    setRun((prev) => ({
      ...prev,
      values: prev.values.map((v, k) => (k === p ? { ...v, [id]: n } : v)),
    }))
  }

  function goto(p: number, i: number) {
    setSel({ p, i })
    fresh.current = true
  }

  function press(d: number) {
    const row = rows[sel.i]
    if (!row || isLive(row, sel.p)) return
    const base = fresh.current ? 0 : (valueOf(sel.p, row.id) ?? 0)
    fresh.current = false
    setVal(sel.p, row.id, Math.min(MAX_VALUE, base * 10 + d))
  }

  function backspace() {
    const row = rows[sel.i]
    if (!row || isLive(row, sel.p)) return
    const base = fresh.current ? 0 : (valueOf(sel.p, row.id) ?? 0)
    fresh.current = false
    setVal(sel.p, row.id, Math.floor(base / 10))
  }

  function clearCell() {
    const row = rows[sel.i]
    if (!row || isLive(row, sel.p)) return
    fresh.current = false
    setVal(sel.p, row.id, 0)
  }

  function next() {
    if (sel.i < rows.length - 1) goto(sel.p, sel.i + 1)
    else if (sel.p < np - 1) goto(sel.p + 1, 0)
    else if (!isRes) setTab('total')
  }

  function prev() {
    if (sel.i > 0) goto(sel.p, sel.i - 1)
    else if (sel.p > 0) goto(sel.p - 1, rows.length - 1)
  }

  function bump(i: number, d: number) {
    const row = rows[i]
    if (!row) return
    const v = valueOf(sel.p, row.id) ?? 0
    setVal(sel.p, row.id, Math.max(0, Math.min(MAX_VALUE, v + d)))
    goto(sel.p, i)
  }

  function setPlayers(n: number) {
    const target = Math.max(WS_MIN_PLAYERS, Math.min(WS_MAX_PLAYERS, n))
    if (target === np) return
    onNames(resizeNames(names, target))
    if (sel.p > target - 1) goto(target - 1, 0)
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true)
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current)
      resetTimer.current = window.setTimeout(() => setConfirmReset(false), 3000)
      return
    }
    setConfirmReset(false)
    setRun((prev) => ({ ...prev, values: prev.values.map(() => makeValues(tpl)) }))
    setTab('input')
    goto(0, 0)
  }

  // 電腦版：直接打數字、Backspace、Enter（下一格）、上下鍵
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const t = event.target as HTMLElement | null
      if (t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return
      if (!active || tab !== 'input') return
      if (event.key.length === 1 && event.key >= '0' && event.key <= '9') {
        press(Number(event.key))
        event.preventDefault()
      } else if (event.key === 'Backspace') {
        backspace()
        event.preventDefault()
      } else if (event.key === 'Enter' || event.key === 'ArrowDown') {
        next()
        event.preventDefault()
      } else if (event.key === 'ArrowUp') {
        prev()
        event.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function liveText(row: SheetRow, p: number): string {
    if (!row.from) return ''
    const per = (row.per ?? 1) > 1 ? `，每 ${row.per} 個` : ''
    return liveAmount(row, p).state === 'ok'
      ? `・即時取自「${row.from}」${per}`
      : `・資源「${row.from}」已不存在，請手動輸入`
  }

  const noFocus = (event: { preventDefault: () => void }) => event.preventDefault()

  // 總分排行（同分同名次）
  const ranked = names
    .map((name, p) => ({ p, name, total: totalOf(p) }))
    .sort((a, b) => b.total - a.total)
  const rankNo = ranked.map((item, k) => {
    let r = k + 1
    while (r > 1 && ranked[r - 2] && ranked[r - 2]?.total === item.total) r -= 1
    return r
  })

  const currentName = names[sel.p] ?? ''

  return (
    <div className="ss-root">
      <div className="ss-bar">
        <span className="ss-bar-title">{tpl.title}</span>
        {!isRes && (
          <div className="ss-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'input'}
              className={tab === 'input' ? 'on' : ''}
              onClick={() => setTab('input')}
            >
              輸入
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'total'}
              className={tab === 'total' ? 'on' : ''}
              onClick={() => setTab('total')}
            >
              總分
            </button>
          </div>
        )}
      </div>

      {tab === 'input' || isRes ? (
        <>
          <div className="ss-chips">
            {names.map((name, p) => (
              <button
                key={p}
                type="button"
                className={`ss-chip${p === sel.p ? ' on' : ''}`}
                onClick={() => goto(p, 0)}
              >
                <span>{name}</span>
                {!isRes && <b>{fmt(totalOf(p))}</b>}
              </button>
            ))}
          </div>

          <div className="ss-player-bar">
            <input
              className="gt-input ss-pname"
              value={currentName}
              maxLength={WS_MAX_NAME}
              aria-label="玩家名稱"
              onChange={(event) => {
                const v = event.target.value
                onNames(names.map((n, k) => (k === sel.p ? v : n)))
              }}
            />
            <span className="ss-count">
              人數
              <button type="button" className="ss-mini" onClick={() => setPlayers(np - 1)}>
                −
              </button>
              <b>{np}</b>
              <button type="button" className="ss-mini" onClick={() => setPlayers(np + 1)}>
                ＋
              </button>
            </span>
          </div>

          <div className="ss-scroll ss-play-scroll">
            <ul className="ss-rows">
              {rows.map((row, i) => {
                const v = valueOf(sel.p, row.id)
                const active = i === sel.i
                return (
                  <li
                    key={row.id}
                    className={`ss-row${active ? ' on' : ''}`}
                    data-ss-active={active ? '1' : undefined}
                    onClick={() => goto(sel.p, i)}
                  >
                    <span className="ss-ico" aria-hidden="true">
                      <IconView icon={row.icon} />
                    </span>
                    <span className="ss-name">
                      {row.name}
                      {!isRes && (
                        <small className={row.sign === -1 ? 'neg' : ''}>
                          {row.sign === -1 ? '−' : '＋'}
                          {fmt(row.mult)} 分
                          {liveText(row, sel.p)}
                        </small>
                      )}
                    </span>
                    {row.kind === 'count' && (
                      <button
                        type="button"
                        className="ss-step"
                        aria-label={`${row.name}減 1`}
                        onMouseDown={noFocus}
                        onClick={(event) => {
                          event.stopPropagation()
                          bump(i, -1)
                        }}
                      >
                        −
                      </button>
                    )}
                    <span className={`ss-val${isLive(row, sel.p) ? ' ss-live' : ''}`}>{v === undefined ? '–' : v}</span>
                    {row.kind === 'count' && (
                      <button
                        type="button"
                        className="ss-step"
                        aria-label={`${row.name}加 1`}
                        onMouseDown={noFocus}
                        onClick={(event) => {
                          event.stopPropagation()
                          bump(i, 1)
                        }}
                      >
                        ＋
                      </button>
                    )}
                    {!isRes && <span className="ss-sub">{fmt(rowPoints(row, v ?? 0))}</span>}
                  </li>
                )
              })}
            </ul>
            <button type="button" className="ss-link ss-reset" onClick={handleReset}>
              {confirmReset ? '再按一次確定清空所有數字' : '清空所有數字'}
            </button>
          </div>

          <div className="ss-keypad" onMouseDown={noFocus}>
            {[7, 8, 9].map((d) => (
              <button key={d} type="button" onClick={() => press(d)}>
                {d}
              </button>
            ))}
            <button type="button" className="ss-key-side ss-key-prev" onClick={prev}>
              上一格
            </button>
            {[4, 5, 6].map((d) => (
              <button key={d} type="button" onClick={() => press(d)}>
                {d}
              </button>
            ))}
            {[1, 2, 3].map((d) => (
              <button key={d} type="button" onClick={() => press(d)}>
                {d}
              </button>
            ))}
            <button type="button" className="ss-key-side" aria-label="退格" onClick={backspace}>
              ⌫
            </button>
            <button type="button" onClick={() => press(0)}>
              0
            </button>
            <button type="button" className="ss-key-side" onClick={clearCell}>
              清除
            </button>
            <button type="button" className="ss-key-next" onClick={next}>
              下一格
            </button>
          </div>
        </>
      ) : (
        <div className="ss-scroll">
          <ul className="ss-rank">
            {ranked.map((item, k) => (
              <li key={item.p}>
                <button
                  type="button"
                  className="ss-rank-head"
                  onClick={() => setOpen(open === item.p ? null : item.p)}
                >
                  <span className="gt-rank-no">{rankNo[k]}</span>
                  <span className="ss-rank-name">{item.name}</span>
                  <b className="ss-rank-total">{fmt(item.total)}</b>
                </button>
                {open === item.p && (
                  <ul className="ss-detail">
                    {rows.map((row) => {
                      const v = valueOf(item.p, row.id) ?? 0
                      return (
                        <li key={row.id}>
                          <span>
                            <IconView icon={row.icon} /> {row.name}
                          </span>
                          <span>
                            {v} × {row.sign === -1 ? '−' : ''}
                            {fmt(row.mult)}
                          </span>
                          <b>{fmt(rowPoints(row, v))}</b>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <HelpNote text="點玩家可看分數是從哪幾列來的。" />
          <button type="button" className="gt-secondary ss-back-input" onClick={() => setTab('input')}>
            回去修改
          </button>
        </div>
      )}
    </div>
  )
}

/* ───────────── 主畫面：範本清單 ───────────── */

export default function ScoreSheetTool({
  tool = 'score',
  onPick,
  pickLabel,
  onExit,
}: {
  tool?: ToolKind
  // 選好（或剛設定好）表單：交給工作區，由它加進工具並顯示工作畫面
  onPick: (tpl: SheetTemplate) => void
  pickLabel: string
  onExit?: () => void
}) {
  const [mode, setMode] = useState<Mode>({ name: 'list' })
  const [list, setList] = useState<SheetTemplate[]>([])
  const [isVip, setIsVip] = useState(false)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [delId, setDelId] = useState<string | null>(null)
  const delTimer = useRef<number | null>(null)
  const alive = useRef(true)

  const refresh = useCallback(async () => {
    const vip = await checkVip()
    if (!alive.current) return
    setIsVip(vip)
    if (!vip) {
      setList([])
      setStatus('ready')
      return
    }
    const res = await loadTemplates(tool)
    if (!alive.current) return
    if (res === null) {
      setStatus('error')
    } else {
      setList(res)
      setStatus('ready')
    }
  }, [tool])

  useEffect(() => {
    alive.current = true
    void refresh()
    return () => {
      alive.current = false
      if (delTimer.current !== null) window.clearTimeout(delTimer.current)
    }
  }, [refresh])

  function blank(): SheetTemplate {
    return {
      id: null,
      title: '',
      bggName: null,
      isOfficial: false,
      isShared: false,
      mine: true,
      rows: [],
      tool,
    }
  }

  // 還沒有任何表單：不顯示空清單，直接進新增表單畫面（只自動跳一次）
  const autoOpened = useRef(false)
  useEffect(() => {
    if (autoOpened.current || status !== 'ready' || list.length > 0) return
    autoOpened.current = true
    setMode({ name: 'edit', draft: blank() })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, list.length])

  function copyOf(t: SheetTemplate): SheetTemplate {
    return {
      ...t,
      id: null,
      title: `${t.title}（複製）`.slice(0, 40),
      isOfficial: false,
      isShared: false,
      mine: true,
    }
  }

  async function handleDelete(id: string) {
    if (delId !== id) {
      setDelId(id)
      if (delTimer.current !== null) window.clearTimeout(delTimer.current)
      delTimer.current = window.setTimeout(() => setDelId(null), 3000)
      return
    }
    setDelId(null)
    await deleteTemplate(id)
    void refresh()
  }

  if (mode.name === 'edit') {
    return (
      <SheetEditor
        key={mode.draft.id ?? 'new'}
        initial={mode.draft}
        tool={tool}
        isVip={isVip}
        onBack={() => (list.length === 0 && onExit ? onExit() : setMode({ name: 'list' }))}
        onUse={onPick}
        useLabel={pickLabel}
        onChanged={() => void refresh()}
      />
    )
  }

  if (status === 'loading') {
    return (
      <div className="ss-root">
        <div className="ss-scroll">
          <p className="gt-hint">讀取中…</p>
        </div>
      </div>
    )
  }

  const mine = list.filter((t) => t.mine)
  const official = list.filter((t) => !t.mine && t.isOfficial)
  const sharedByOthers = list.filter((t) => !t.mine && !t.isOfficial)

  function renderItem(t: SheetTemplate) {
    const id = t.id
    return (
      <li key={id ?? t.title} className="ss-item">
        <div className="ss-item-main">
          <b>{t.title}</b>
          <span className="gt-hint">
            {t.rows.length} 列{t.mine && t.isShared ? '・已分享' : ''}
          </span>
        </div>
        <div className="ss-item-btns">
          <button type="button" className="gt-primary ss-sm" onClick={() => onPick(t)}>
            {pickLabel}
          </button>
          {t.mine ? (
            <>
              <button type="button" className="gt-secondary ss-sm" onClick={() => setMode({ name: 'edit', draft: t })}>
                編輯
              </button>
              <button
                type="button"
                className="gt-secondary ss-sm ss-del"
                onClick={() => id && void handleDelete(id)}
              >
                {delId === id ? '確定刪除？' : '刪除'}
              </button>
            </>
          ) : (
            <button type="button" className="gt-secondary ss-sm" onClick={() => setMode({ name: 'edit', draft: copyOf(t) })}>
              複製
            </button>
          )}
        </div>
      </li>
    )
  }

  return (
    <div className="ss-root">
      <div className="ss-scroll">
        <button
          type="button"
          className="gt-primary ss-new"
          onClick={() => setMode({ name: 'edit', draft: blank() })}
        >
          ＋ 新增表單
        </button>

        {status === 'error' && (
          <p className="gt-msg">
            讀不到範本清單。
            <button type="button" className="ss-link" onClick={() => void refresh()}>
              重試
            </button>
          </p>
        )}
        {status === 'ready' && !isVip && (
          <HelpNote text="儲存與分享範本需要 VIP。你現在可以新增表單直接使用，關掉後不會保留表單。" />
        )}

        {mine.length > 0 && (
          <>
            <p className="ss-section">我的表單</p>
            <ul className="ss-list">{mine.map(renderItem)}</ul>
          </>
        )}
        {official.length > 0 && (
          <>
            <p className="ss-section">官方表單</p>
            <ul className="ss-list">{official.map(renderItem)}</ul>
          </>
        )}
        {sharedByOthers.length > 0 && (
          <>
            <p className="ss-section">VIP 分享的表單</p>
            <ul className="ss-list">{sharedByOthers.map(renderItem)}</ul>
          </>
        )}
        {status === 'ready' && isVip && list.length === 0 && (
          <HelpNote text="還沒有表單。按上面的「新增表單」建立第一份。" />
        )}
      </div>
    </div>
  )
}
