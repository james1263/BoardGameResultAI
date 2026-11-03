// 主畫面排序用：使用者自己的評分 → 數字（沒評或沒填完＝0）
// 欄位名稱同時容許駝峰與底線寫法；若排序結果不對，先檢查 useGameRatings.ts 的 MyRating 欄位名

type Mine = object | null | undefined

function pick(mine: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = mine[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
  }
  return null
}

// 整體分數（1～10）
export function getMyOverall(mine: Mine): number {
  if (!mine) return 0
  return pick(mine as Record<string, unknown>, ['overall']) ?? 0
}

// 綜合評分：喜歡度＋影響度＋溝通度＋變化度＋獨特性＋適合留下來（不含整體），最高 30；任一項沒填就當 0
const COMPOSITE_KEYS: string[][] = [
  ['like', 'likeScore'],
  ['playerImpact', 'player_impact'],
  ['communication'],
  ['change'],
  ['unique'],
  ['keepScore', 'keep_score', 'keep'],
]

export function getMyComposite(mine: Mine): number {
  if (!mine) return 0
  const record = mine as Record<string, unknown>
  let total = 0
  for (const keys of COMPOSITE_KEYS) {
    const value = pick(record, keys)
    if (value === null) return 0
    total += value
  }
  return total
}
