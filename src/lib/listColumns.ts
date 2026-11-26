// 清單檢視的欄位（屬性）：顯示／隱藏與順序，存在這支瀏覽器
// 注意：不放任何綜合分數欄位（算法不對外揭露）；管理者的 RE／綜合欄固定在最右邊，不在這裡設定

export type ListColumnKey = 'best' | 'recommend' | 'time' | 'difficulty'

export const LIST_COLUMN_KEYS: ListColumnKey[] = [
  'best',
  'recommend',
  'time',
  'difficulty',
]

export const LIST_COLUMN_LABELS: Record<ListColumnKey, string> = {
  best: '最佳人數',
  recommend: '推薦人數',
  time: '時間',
  difficulty: '難度',
}

// 與 card-list.css 預設欄寬一致
export const LIST_COLUMN_WIDTHS: Record<ListColumnKey, string> = {
  best: '76px',
  recommend: '76px',
  time: '64px',
  difficulty: '60px',
}

export type ListColumnsState = {
  order: ListColumnKey[]
  hidden: ListColumnKey[]
}

export const LIST_COLUMNS_STORAGE_KEY = 'boardgame-list-columns'

export const DEFAULT_LIST_COLUMNS: ListColumnsState = {
  order: [...LIST_COLUMN_KEYS],
  hidden: [],
}

export function loadListColumns(): ListColumnsState {
  try {
    const raw = localStorage.getItem(LIST_COLUMNS_STORAGE_KEY)
    if (!raw) return DEFAULT_LIST_COLUMNS
    const parsed = JSON.parse(raw) as Partial<ListColumnsState>
    const savedOrder = Array.isArray(parsed.order)
      ? parsed.order.filter((k): k is ListColumnKey =>
          LIST_COLUMN_KEYS.includes(k as ListColumnKey),
        )
      : []
    // 缺的欄位補回最後，重複的去掉
    const order = [...new Set(savedOrder)]
    for (const key of LIST_COLUMN_KEYS) {
      if (!order.includes(key)) order.push(key)
    }
    const hidden = Array.isArray(parsed.hidden)
      ? [
          ...new Set(
            parsed.hidden.filter((k): k is ListColumnKey =>
              LIST_COLUMN_KEYS.includes(k as ListColumnKey),
            ),
          ),
        ]
      : []
    return { order, hidden }
  } catch {
    return DEFAULT_LIST_COLUMNS
  }
}

export function saveListColumns(state: ListColumnsState) {
  try {
    localStorage.setItem(LIST_COLUMNS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // 儲存失敗也不影響使用
  }
}
