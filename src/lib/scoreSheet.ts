import { supabase } from './supabase'

// 範本（資料表 score_templates，只走函式）。同一張表放兩種工具的範本：
// resource＝資源計數器（count 計數、hold 持有）；score＝計分表（score 只算分）。
// tool 沒指定（舊資料、舊程式）一律視為 score。
// 持有（hold）的畫面還沒做，先保留型別。

export type ToolKind = 'resource' | 'score'
export type RowKind = 'count' | 'hold' | 'score'

export type SheetRow = {
  id: string
  name: string
  icon: string
  kind: RowKind
  sign: 1 | -1
  mult: number
  init: number
}

export type SheetTemplate = {
  id: string | null
  title: string
  bggName: string | null
  isOfficial: boolean
  isShared: boolean
  mine: boolean
  rows: SheetRow[]
  tool?: ToolKind
}

export const TOOL_INFO: Record<ToolKind, { label: string; icon: string }> = {
  resource: { label: '資源計數器', icon: '📦' },
  score: { label: '計分表', icon: '🧮' },
}

export function toolOf(t: { tool?: ToolKind | null }): ToolKind {
  return t.tool === 'resource' ? 'resource' : 'score'
}

export const MAX_ROWS = 30
export const MAX_VALUE = 9999

// 圖示一律用 2018 年（Emoji 11）以前的符號，電腦與舊手機都不會顯示成方框
export const ICONS: string[] = [
  '💰', '🥇', '🌲', '⛰️', '🌳', '🌾', '🍞', '🍺', '🐟', '🍎',
  '🔥', '💎', '⚔️', '🛡️', '🏹', '🏠', '🏰', '⛪', '🔨', '⚒️',
  '📜', '🃏', '🎲', '⭐', '🏆', '❤️', '⚡', '🚂', '🚢', '🧱',
  '🧪', '👑', '🔔', '🐎', '🌍', '🚀', '💡', '📦', '🧭', '🎯',
]

export type PresetItem = { name: string; icon: string }
export type PresetGroup = { label: string; items: PresetItem[] }

// 通用常用資源（依 BGG 前 300 名常見資源分類，不綁特定遊戲；名稱在所有分組中不重複）
// 遊戲專屬的資源與範本之後再做成綁定遊戲的官方範本
export const PRESET_GROUPS: PresetGroup[] = [
  {
    label: '貨幣與財富',
    items: [
      { name: '金幣', icon: '💰' },
      { name: '銀幣', icon: '🥈' },
      { name: '銅幣', icon: '🥉' },
      { name: '信用點', icon: '💳' },
      { name: '黃金', icon: '🥇' },
      { name: '寶石', icon: '💎' },
      { name: '水晶', icon: '🔮' },
    ],
  },
  {
    label: '建材與礦物',
    items: [
      { name: '木頭', icon: '🌳' },
      { name: '石頭', icon: '⛰️' },
      { name: '磚塊', icon: '🧱' },
      { name: '鐵', icon: '🔩' },
      { name: '鋼', icon: '⚙️' },
      { name: '煤炭', icon: '🌑' },
      { name: '礦石', icon: '⛏️' },
    ],
  },
  {
    label: '民生與農業',
    items: [
      { name: '食物', icon: '🍞' },
      { name: '小麥', icon: '🌾' },
      { name: '蔬菜', icon: '🥕' },
      { name: '肉', icon: '🍖' },
      { name: '水', icon: '💧' },
      { name: '布料', icon: '🧵' },
      { name: '羊毛', icon: '🧶' },
      { name: '香料', icon: '🌶️' },
      { name: '葡萄酒', icon: '🍷' },
      { name: '咖啡', icon: '☕' },
      { name: '糖', icon: '🍬' },
      { name: '菸草', icon: '🚬' },
    ],
  },
  {
    label: '牲畜',
    items: [
      { name: '綿羊', icon: '🐑' },
      { name: '牛', icon: '🐄' },
      { name: '豬', icon: '🐖' },
      { name: '馬', icon: '🐎' },
      { name: '雞', icon: '🐔' },
    ],
  },
  {
    label: '科幻與能量',
    items: [
      { name: '能源', icon: '⚡' },
      { name: '知識', icon: '💡' },
      { name: '科學', icon: '🧪' },
      { name: '燃料', icon: '🔥' },
      { name: '魔力', icon: '✨' },
      { name: '暗物質', icon: '🌌' },
    ],
  },
  {
    label: '抽象與無形',
    items: [
      { name: '影響力', icon: '📣' },
      { name: '聲望', icon: '🎖️' },
      { name: '軍力', icon: '⚔️' },
      { name: '行動點', icon: '⏳' },
      { name: '時間', icon: '🕒' },
      { name: '士氣', icon: '🚩' },
      { name: '幸福度', icon: '😊' },
    ],
  },
  {
    label: '特殊與百搭',
    items: [
      { name: '萬能資源', icon: '🌈' },
      { name: '工人', icon: '👷' },
      { name: '人口', icon: '👥' },
      { name: '米寶', icon: '♟️' },
    ],
  },
  {
    label: '顏色方塊',
    items: [
      { name: '白色', icon: '⚪' },
      { name: '黑色', icon: '⚫' },
      { name: '紅色', icon: '🔴' },
      { name: '藍色', icon: '🔵' },
      { name: '綠色', icon: '🍀' },
      { name: '黃色', icon: '🌕' },
    ],
  },
]

export function newRowId(): string {
  return Math.random().toString(36).slice(2, 8)
}

export function rowPoints(row: SheetRow, value: number): number {
  return row.sign * row.mult * value
}

export function fmt(n: number): string {
  return String(Math.round(n * 100) / 100)
}

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

export function parseRows(raw: unknown): SheetRow[] {
  if (!Array.isArray(raw)) return []
  const out: SheetRow[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const r = item as Record<string, unknown>
    const kind: RowKind = r.kind === 'hold' ? 'hold' : r.kind === 'score' ? 'score' : 'count'
    out.push({
      id: typeof r.id === 'string' && r.id ? r.id : newRowId(),
      name: typeof r.name === 'string' ? r.name : '',
      icon: typeof r.icon === 'string' && r.icon ? r.icon : '⭐',
      kind,
      sign: r.sign === -1 ? -1 : 1,
      mult: num(r.mult, 1),
      init: num(r.init, 0),
    })
  }
  return out.slice(0, MAX_ROWS)
}

type TemplateRpc = {
  out_id: string
  out_title: string
  out_bgg_name: string | null
  out_is_official: boolean
  out_is_shared: boolean
  out_mine: boolean
  out_rows: unknown
  out_tool?: string | null
}

// 讀取失敗回傳 null（和「沒有範本」分開）。指定 tool 時只回傳該工具的範本。
export async function loadTemplates(tool?: ToolKind): Promise<SheetTemplate[] | null> {
  const { data, error } = await supabase.rpc('get_score_templates')
  if (error) return null
  const all = ((data ?? []) as TemplateRpc[]).map(
    (t): SheetTemplate => ({
      id: t.out_id,
      title: t.out_title,
      bggName: t.out_bgg_name,
      isOfficial: t.out_is_official,
      isShared: t.out_is_shared,
      mine: t.out_mine,
      rows: parseRows(t.out_rows),
      tool: t.out_tool === 'resource' ? 'resource' : 'score',
    }),
  )
  return tool ? all.filter((t) => toolOf(t) === tool) : all
}

function explain(message: string): string {
  if (message.includes('template limit')) return '範本已達 20 份上限，請先刪掉不用的。'
  if (message.includes('vip only')) return '只有 VIP 可以儲存範本。'
  if (message.includes('not signed in')) return '請先登入。'
  return '儲存失敗，請稍後再試。'
}

export async function saveTemplate(
  t: SheetTemplate,
): Promise<{ id: string | null; message: string }> {
  const { data, error } = await supabase.rpc('save_score_template', {
    p_id: t.id,
    p_title: t.title,
    p_bgg_name: t.bggName,
    p_rows: t.rows,
    p_shared: t.isShared,
    p_official: t.isOfficial,
    p_tool: toolOf(t),
  })
  if (error) return { id: null, message: explain(error.message) }
  return { id: typeof data === 'string' ? data : null, message: '' }
}

export async function deleteTemplate(id: string): Promise<boolean> {
  const { error } = await supabase.rpc('delete_score_template', { p_id: id })
  return !error
}

// VIP 或管理者才能用範本（讀取失敗當成不是）
export async function checkVip(): Promise<boolean> {
  const [a, b] = await Promise.all([supabase.rpc('is_vip'), supabase.rpc('is_admin')])
  return a.data === true || b.data === true
}
