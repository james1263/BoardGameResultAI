import { supabase } from './supabase'

// 計分表範本（資料表 score_templates，只走函式）。rows 的每一列：
// 計數（count，有 ＋／−）、只算分（score）；持有（hold）第二批才用，先保留型別。

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
}

export const MAX_ROWS = 30
export const MAX_VALUE = 9999

export const ICONS: string[] = [
  '💰', '🪙', '🌲', '🪨', '🪵', '🌾', '🍞', '🍺', '🐟', '🍎',
  '🔥', '💎', '⚔️', '🛡️', '🏹', '🏠', '🏰', '⛪', '🔨', '🪓',
  '📜', '🃏', '🎲', '⭐', '🏆', '❤️', '⚡', '🚂', '🚢', '🧱',
  '🧪', '👑', '🔔', '🐎', '🌍', '🚀', '💡', '📦', '🧭', '🎯',
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
}

// 讀取失敗回傳 null（和「沒有範本」分開）
export async function loadTemplates(): Promise<SheetTemplate[] | null> {
  const { data, error } = await supabase.rpc('get_score_templates')
  if (error) return null
  return ((data ?? []) as TemplateRpc[]).map((t) => ({
    id: t.out_id,
    title: t.out_title,
    bggName: t.out_bgg_name,
    isOfficial: t.out_is_official,
    isShared: t.out_is_shared,
    mine: t.out_mine,
    rows: parseRows(t.out_rows),
  }))
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
