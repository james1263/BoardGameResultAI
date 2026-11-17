// 規則助手用：在前端直接搜尋官方 FAQ 的中文翻譯（不呼叫資料庫、不扣每日次數）
// 之後新增別款遊戲的 FAQ：在下面的 FAQ_BY_GAME 登記一行（key＝bggName）。
// 注意：GameFaq.tsx 也有一份自己的登記表，兩邊都要登記。

import type { GameFaqData } from '../data/faq/types'
import { RISING_SUN_FAQ } from '../data/faq/risingSunFaq'

const FAQ_BY_GAME: Record<string, GameFaqData> = {
  'Rising Sun': RISING_SUN_FAQ,
}

export type FaqHit = {
  key: string
  group: string
  topic: string
  q?: string
  a: string
}

export function faqSubtitle(bggName: string): string {
  return FAQ_BY_GAME[bggName]?.sub ?? ''
}

// terms：與規則書搜尋共用的關鍵詞（含同義詞展開）。回傳最相關的前 8 則
export function searchFaq(bggName: string, terms: string[]): FaqHit[] {
  const data = FAQ_BY_GAME[bggName]
  if (!data || terms.length === 0) return []
  const lowered = terms.map((t) => t.toLowerCase())
  const need = Math.max(1, Math.ceil(lowered.length * 0.4))
  const hits: { hit: FaqHit; score: number }[] = []
  data.groups.forEach((group, gi) => {
    group.topics.forEach((topic, ti) => {
      const topicLower = topic.name.toLowerCase()
      topic.items.forEach((item, ii) => {
        const text = `${topic.name} ${item.q ?? ''} ${item.a}`.toLowerCase()
        let score = 0
        for (const t of lowered) {
          if (text.includes(t)) score += topicLower.includes(t) ? 3 : 1
        }
        if (score >= need) {
          hits.push({
            hit: { key: `${gi}-${ti}-${ii}`, group: group.title, topic: topic.name, q: item.q, a: item.a },
            score,
          })
        }
      })
    })
  })
  return hits
    .sort((x, y) => y.score - x.score)
    .slice(0, 8)
    .map((x) => x.hit)
}
