// 規則助手用：在前端直接搜尋 FAQ 的中文內容（不呼叫資料庫、不扣每日次數）
// 兩種來源：
//   ① 官方 FAQ：在下面的 FAQ_BY_GAME 登記一行（key＝bggName）。注意：GameFaq.tsx 也有一份自己的登記表，兩邊都要登記。
//   ② BGG 討論・非官方 FAQ：登記在 data/faq/unofficialRegistry.ts（只有一份，網頁與這裡共用）。
// 搜尋結果裡，非官方的命中會在 group 前面加上「【非官方】」，讓玩家一眼分得出來，且排在官方之後。

import type { GameFaqData } from '../data/faq/types'
import { RISING_SUN_FAQ } from '../data/faq/risingSunFaq'
import { GAIA_PROJECT_FAQ } from '../data/faq/gaiaProjectFaq'
import { getUnofficialFaq } from '../data/faq/unofficialRegistry'
import { BRASS_BIRMINGHAM_FAQ } from '../data/faq/brassBirminghamFaq'
import { FEAST_FOR_ODIN_FAQ } from '../data/faq/feastForOdinFaq'
import { ALCHEMISTS_FAQ } from '../data/faq/alchemistsFaq'
import { TILETUM_FAQ } from '../data/faq/tiletumFaq'
import { PULSAR_2849_FAQ } from '../data/faq/pulsar2849Faq'

const FAQ_BY_GAME: Record<string, GameFaqData> = {
  'Rising Sun': RISING_SUN_FAQ,
  'Gaia Project': GAIA_PROJECT_FAQ,
  'Brass: Birmingham': BRASS_BIRMINGHAM_FAQ,
  'A Feast for Odin': FEAST_FOR_ODIN_FAQ,
  'Alchemists': ALCHEMISTS_FAQ,
  'Tiletum': TILETUM_FAQ,
  'Pulsar 2849': PULSAR_2849_FAQ,
}

export type FaqHit = {
  key: string
  group: string
  topic: string
  q?: string
  a: string
  // true＝BGG 討論・非官方 FAQ（玩家整理，不是官方）
  unofficial?: boolean
}

const UNOFFICIAL_LABEL = '【非官方】'
const MAX_HITS = 8
// 兩種來源都有命中時，至少保留幾則非官方（避免被官方命中擠掉）
const MIN_UNOFFICIAL = 3

export function faqSubtitle(bggName: string): string {
  const official = FAQ_BY_GAME[bggName]?.sub ?? ''
  const unofficial = getUnofficialFaq(bggName)
  if (!unofficial) return official
  return official ? `${official}＋非官方 BGG 討論整理` : `非官方・${unofficial.sub}`
}

function rankHits(
  data: GameFaqData | null | undefined,
  terms: string[],
  unofficial: boolean,
): { hit: FaqHit; score: number }[] {
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
            hit: {
              key: `${unofficial ? 'u-' : ''}${gi}-${ti}-${ii}`,
              group: unofficial ? `${UNOFFICIAL_LABEL}${group.title}` : group.title,
              topic: topic.name,
              q: item.q,
              a: item.a,
              unofficial: unofficial || undefined,
            },
            score,
          })
        }
      })
    })
  })
  return hits.sort((x, y) => y.score - x.score)
}

// terms：與規則書搜尋共用的關鍵詞（含同義詞展開）。回傳最相關的前 8 則（官方在前，非官方在後）
export function searchFaq(bggName: string, terms: string[]): FaqHit[] {
  const official = rankHits(FAQ_BY_GAME[bggName], terms, false)
  const unofficial = rankHits(getUnofficialFaq(bggName), terms, true)
  const takeUnofficial = Math.min(unofficial.length, Math.max(MIN_UNOFFICIAL, MAX_HITS - official.length))
  const takeOfficial = Math.min(official.length, MAX_HITS - takeUnofficial)
  return [
    ...official.slice(0, takeOfficial).map((x) => x.hit),
    ...unofficial.slice(0, takeUnofficial).map((x) => x.hit),
  ]
}
