// 名詞長按：名詞編號 → 顯示名稱、圖片、出處。階段①只有羅倫佐（領袖 46 張＋家族 12 塊，其中 56 個有圖）。
// 名稱取自 lorenzoCards.ts（別的聊天室維護，這裡只讀 id 與 nameEn），圖片資料取自 lorenzoTerms.ts。
// 之後階段②改成讀資料庫的覆蓋表時，只要在 getTerm 裡先查覆蓋表即可。

import { LORENZO_LEADERS, LORENZO_FAMILIES } from './lorenzoCards'
import { LORENZO_TERM_IMAGES } from './lorenzoTerms'

export type TermInfo = {
  id: string
  name: string // 畫面顯示的名稱
  imagePath?: string // 私有 bucket 裡的路徑，例：lorenzo/leader-bramante.webp
  source?: string // 出處說明
}

export const TERM_BUCKET = 'term-images'

const REGISTRY = new Map<string, TermInfo>()

for (const item of [...LORENZO_LEADERS, ...LORENZO_FAMILIES]) {
  const img = LORENZO_TERM_IMAGES[item.id]
  REGISTRY.set(item.id, {
    id: item.id,
    name: item.nameEn,
    imagePath: img?.file,
    source: img ? `荷蘭文參考手冊 第 ${img.nlPage} 頁（圖片是荷蘭文版卡面，效果請看快速複習文字）` : undefined,
  })
}

export function getTerm(id: string): TermInfo | undefined {
  return REGISTRY.get(id)
}
