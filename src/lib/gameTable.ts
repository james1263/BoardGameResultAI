import { MAX_VALUE, rowPoints, type SheetRow } from './scoreSheet'

// 聚會房間「遊戲桌」（4a：資料只存這支手機的瀏覽器，不寫資料庫）
// 結構照「一場聚會可有多桌」設計，4b 同步版會把同一份結構搬到資料庫。
// 每桌有自己的遊戲、玩家、要用的工具（資源計數器、計分表、骰子、計時器）。

export type TableTool = 'resource' | 'score' | 'dice' | 'timer'

export const ALL_TOOLS: TableTool[] = ['resource', 'score', 'dice', 'timer']

// 圖示一律用 Emoji 11（2018）以前的符號
export const TOOL_INFO: Record<TableTool, { label: string; icon: string; hint: string }> = {
  resource: { label: '資源計數器', icon: '📦', hint: '記每個人的資源數量' },
  score: { label: '計分表', icon: '🧮', hint: '終局算分、看排名' },
  dice: { label: '骰子', icon: '🎲', hint: '多組自訂骰面' },
  timer: { label: '計時器', icon: '⏳', hint: '輪流計時（同步）' },
}

export const MAX_PLAYERS = 12
export const MAX_DICE_GROUPS = 6
export const MAX_FACES = 20
export const MAX_DICE = 10
export const MAX_LABEL = 6

export type TablePlayer = { id: string; name: string; left: boolean }
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
  dice: DiceGroup[]
  diceLog: string[]
  holdings: ValueMap
  holdSets: string[]
}

export type RoomStore = { v: 1; left: string[]; tables: GameTableData[] }

const KEY = 'boardgame-room-tables|'

export function emptyStore(): RoomStore {
  return { v: 1, left: [], tables: [] }
}

export function loadStore(gatheringId: string): RoomStore {
  try {
    const raw = window.localStorage.getItem(KEY + gatheringId)
    if (!raw) return emptyStore()
    const data = JSON.parse(raw) as Partial<RoomStore>
    if (data.v !== 1 || !Array.isArray(data.tables)) return emptyStore()
    return {
      v: 1,
      left: Array.isArray(data.left) ? data.left.filter((x) => typeof x === 'string') : [],
      tables: data.tables.map((t) => ({ ...t, holdings: t.holdings ?? {}, holdSets: t.holdSets ?? [] })),
    }
  } catch {
    return emptyStore()
  }
}

export function saveStore(gatheringId: string, store: RoomStore): void {
  try {
    window.localStorage.setItem(KEY + gatheringId, JSON.stringify(store))
  } catch {
    // 空間不足或被瀏覽器擋住：這次就不保留，不影響使用
  }
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 8)
}

export function newTable(title: string, bggName: string | null): GameTableData {
  return {
    id: uid(),
    title,
    bggName,
    createdAt: Date.now(),
    phase: 'setup',
    closed: false,
    tools: ['resource', 'score'],
    disabled: [],
    players: [],
    resRows: [],
    scoreRows: [],
    res: {},
    scores: {},
    dice: [],
    diceLog: [],
    holdings: {},
    holdSets: [],
  }
}

export function clampValue(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(MAX_VALUE, Math.round(n)))
}

export function toolActive(t: GameTableData, tool: TableTool): boolean {
  return t.tools.includes(tool) && !t.disabled.includes(tool)
}

// 補齊新增的資源列／計分項目的數字（資源＝起始數量，計分＝0），不動已有的數字
export function fillValues(t: GameTableData): GameTableData {
  const res: ValueMap = {}
  const scores: ValueMap = {}
  for (const p of t.players) {
    res[p.id] = { ...(t.res[p.id] ?? {}) }
    scores[p.id] = { ...(t.scores[p.id] ?? {}) }
    for (const r of t.resRows) if (res[p.id][r.id] === undefined) res[p.id][r.id] = clampValue(r.init)
    for (const r of t.scoreRows) if (scores[p.id][r.id] === undefined) scores[p.id][r.id] = 0
  }
  return { ...t, res, scores }
}

// 計分表的列若「取自資源」，找出對應的資源列
export function linkedResource(t: GameTableData, row: SheetRow): SheetRow | null {
  if (!row.from) return null
  const name = row.from.trim()
  return t.resRows.find((r) => r.name.trim() === name) ?? null
}

// 這一格的數字：取自資源的列自動換算（每 per 個算 1，無條件捨去），其他用手動輸入
export function cellValue(t: GameTableData, row: SheetRow, pid: string): number {
  const link = linkedResource(t, row)
  if (link) {
    const v = t.res[pid]?.[link.id] ?? 0
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
