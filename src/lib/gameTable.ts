import { MAX_VALUE, parseRows, rowPoints, type SheetRow } from './scoreSheet'

// 聚會房間「遊戲桌」的資料結構與計算（4b-1 同步版）
// 桌子、玩家、數字都存在資料庫（見 gameTableSync.ts），多支手機即時看到同一桌。
// 這支手機的瀏覽器只留三樣東西：離場名單、還沒開始的設定草稿、骰子（骰子不同步）。
// 每桌有自己的遊戲、玩家、要用的工具（資源計數器、計分表、骰子、計時器）。

export type TableTool = 'resource' | 'score' | 'dice' | 'timer'

export const ALL_TOOLS: TableTool[] = ['resource', 'score', 'dice', 'timer']

// 圖示一律用 Emoji 11（2018）以前的符號
export const TOOL_INFO: Record<TableTool, { label: string; icon: string; hint: string }> = {
  resource: { label: '資源計數器', icon: '📦', hint: '記每個人的資源數量' },
  score: { label: '計分表', icon: '🧮', hint: '終局算分、看排名' },
  dice: { label: '骰子', icon: '🎲', hint: '多組自訂骰面（只存在這支手機）' },
  timer: { label: '計時器', icon: '⏳', hint: '輪流計時（同步）' },
}

export const MAX_PLAYERS = 12
export const MAX_DICE_GROUPS = 6
export const MAX_FACES = 20
export const MAX_DICE = 10
export const MAX_LABEL = 6

// userId：這一格綁定的出席者帳號（綁定的人可以自己改自己的數字）；訪客沒有帳號就是 null
export type TablePlayer = { id: string; name: string; left: boolean; userId: string | null; sort: number }
export type DiceFace = { label: string; qty: number }
export type DiceGroup = {
  id: string
  name: string
  count: number
  faces: DiceFace[]
  results: string[]
}
export type ValueMap = Record<string, Record<string, number>>

export type GameTableData = {
  id: string
  title: string
  bggName: string | null
  createdAt: number
  phase: 'setup' | 'play'
  closed: boolean
  tools: TableTool[]
  disabled: TableTool[]
  players: TablePlayer[]
  resRows: SheetRow[]
  scoreRows: SheetRow[]
  res: ValueMap
  scores: ValueMap
  holdings: ValueMap
  holdSets: string[]
}

// ───────────── 這支手機自己留的資料 ─────────────

export type DraftPlayer = { id: string; name: string; userId: string | null }
// 開桌設定做到一半的草稿：按「開始這桌」才會真的寫進資料庫
export type Draft = {
  title: string
  bggName: string | null
  tools: TableTool[]
  players: DraftPlayer[]
  resRows: SheetRow[]
  scoreRows: SheetRow[]
}
export type DiceBox = { groups: DiceGroup[]; log: string[] }
export type LocalStore = {
  v: 2
  left: string[]
  draft: Draft | null
  dice: Record<string, DiceBox>
}

const KEY = 'boardgame-room-local|'

export function emptyStore(): LocalStore {
  return { v: 2, left: [], draft: null, dice: {} }
}

export function emptyDice(): DiceBox {
  return { groups: [], log: [] }
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 8)
}

export function newDraft(): Draft {
  return { title: '', bggName: null, tools: ['resource', 'score'], players: [], resRows: [], scoreRows: [] }
}

function cleanDraft(raw: unknown): Draft | null {
  if (typeof raw !== 'object' || raw === null) return null
  const d = raw as Partial<Draft>
  if (!Array.isArray(d.players) || !Array.isArray(d.tools)) return null
  const players: DraftPlayer[] = []
  for (const p of d.players) {
    if (typeof p !== 'object' || p === null || typeof p.name !== 'string') continue
    players.push({
      id: typeof p.id === 'string' && p.id ? p.id : uid(),
      name: p.name,
      userId: typeof p.userId === 'string' ? p.userId : null,
    })
  }
  return {
    title: typeof d.title === 'string' ? d.title : '',
    bggName: typeof d.bggName === 'string' ? d.bggName : null,
    tools: d.tools.filter((x): x is TableTool => ALL_TOOLS.includes(x as TableTool)),
    players,
    resRows: parseRows(d.resRows),
    scoreRows: parseRows(d.scoreRows),
  }
}

export function loadStore(gatheringId: string): LocalStore {
  try {
    const raw = window.localStorage.getItem(KEY + gatheringId)
    if (!raw) return emptyStore()
    const data = JSON.parse(raw) as Partial<LocalStore>
    if (data.v !== 2) return emptyStore()
    const dice: Record<string, DiceBox> = {}
    if (data.dice && typeof data.dice === 'object') {
      for (const [id, box] of Object.entries(data.dice)) {
        if (box && Array.isArray(box.groups)) {
          dice[id] = {
            groups: box.groups,
            log: Array.isArray(box.log) ? box.log.filter((x) => typeof x === 'string') : [],
          }
        }
      }
    }
    return {
      v: 2,
      left: Array.isArray(data.left) ? data.left.filter((x) => typeof x === 'string') : [],
      draft: cleanDraft(data.draft),
      dice,
    }
  } catch {
    return emptyStore()
  }
}

export function saveStore(gatheringId: string, store: LocalStore): void {
  try {
    window.localStorage.setItem(KEY + gatheringId, JSON.stringify(store))
  } catch {
    // 空間不足或被瀏覽器擋住：這次就不保留，不影響使用
  }
}

// ───────────── 數字與計分 ─────────────

export function clampValue(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(MAX_VALUE, Math.round(n)))
}

export function toolActive(t: GameTableData, tool: TableTool): boolean {
  return t.tools.includes(tool) && !t.disabled.includes(tool)
}

// 資源這一格的數字：資料庫沒有記錄就是「起始數量」（不用替每個人先寫一堆起始值）
export function resValue(t: GameTableData, pid: string, row: SheetRow): number {
  return t.res[pid]?.[row.id] ?? clampValue(row.init)
}

// 計分表的列若「取自資源」，找出對應的資源列
export function linkedResource(t: GameTableData, row: SheetRow): SheetRow | null {
  if (!row.from) return null
  const name = row.from.trim()
  return t.resRows.find((r) => r.name.trim() === name) ?? null
}

// 這一格的數字：取自資源的列自動換算（每 per 個算 1，無條件捨去），其他用手動輸入（沒記錄＝0）
export function cellValue(t: GameTableData, row: SheetRow, pid: string): number {
  const link = linkedResource(t, row)
  if (link) {
    const v = resValue(t, pid, link)
    return Math.max(0, Math.floor(v / Math.max(1, row.per ?? 1)))
  }
  return t.scores[pid]?.[row.id] ?? 0
}

export function totalOf(t: GameTableData, pid: string): number {
  let sum = 0
  for (const row of t.scoreRows) sum += rowPoints(row, cellValue(t, row, pid))
  return sum
}

// ───────────── 骰子 ─────────────

export function diceTemplate(n: number): DiceFace[] {
  return Array.from({ length: n }, (_, i) => ({ label: String(i + 1), qty: 1 }))
}

export function newDiceGroup(): DiceGroup {
  return { id: uid(), name: '', count: 1, faces: diceTemplate(6), results: [] }
}

export function faceTotal(faces: DiceFace[]): number {
  return faces.reduce((sum, f) => sum + f.qty, 0)
}

function bag(faces: DiceFace[]): string[] {
  const out: string[] = []
  for (const f of faces) for (let i = 0; i < f.qty; i += 1) out.push(f.label)
  return out
}

export function rollDie(faces: DiceFace[]): string {
  const b = bag(faces)
  if (b.length === 0) return '?'
  return b[Math.floor(Math.random() * b.length)]
}

export function rollGroup(g: DiceGroup): string[] {
  return Array.from({ length: g.count }, () => rollDie(g.faces))
}

function isNum(s: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(s)
}

// 全部是數字面 → 合計；有文字面 → 統計各面出現幾顆
export function summarize(results: string[]): string {
  if (results.length === 0) return ''
  if (results.every(isNum)) {
    const sum = results.reduce((s, x) => s + Number(x), 0)
    return results.length === 1 ? `${sum}` : `合計 ${Math.round(sum * 100) / 100}（${results.join('＋')}）`
  }
  const order: string[] = []
  const count = new Map<string, number>()
  for (const r of results) {
    if (!count.has(r)) order.push(r)
    count.set(r, (count.get(r) ?? 0) + 1)
  }
  return order.map((k) => `${k}×${count.get(k)}`).join('、')
}

export function diceSummaryText(g: DiceGroup): string {
  return g.faces.map((f) => (f.qty > 1 ? `${f.label}×${f.qty}` : f.label)).join(' ')
}
