import { useMemo, useState } from 'react'
import type { GameFaqData } from '../data/faq/types'
import { RISING_SUN_FAQ } from '../data/faq/risingSunFaq'
import { GAIA_PROJECT_FAQ } from '../data/faq/gaiaProjectFaq'
import { getUnofficialFaq } from '../data/faq/unofficialRegistry'
import { isSafeUrl } from '../lib/useGameDocuments'

// 有 FAQ 的遊戲在這裡登記（key 是資料庫裡的 bggName）
const FAQ_BY_GAME: Record<string, GameFaqData> = {
  'Rising Sun': RISING_SUN_FAQ,
  'Gaia Project': GAIA_PROJECT_FAQ,
}

export function getGameFaq(bggName: string): GameFaqData | null {
  return FAQ_BY_GAME[bggName] ?? null
}

// BGG 討論・非官方 FAQ（登記表在 data/faq/unofficialRegistry.ts，網頁與規則助手共用）
export { getUnofficialFaq }

// 規則分頁入口卡片上顯示的「N 則」
export function countFaqItems(data: GameFaqData): number {
  return data.groups.reduce(
    (sum, group) =>
      sum + group.topics.reduce((inner, topic) => inner + topic.items.length, 0),
    0,
  )
}

export default function GameFaq({
  bggName,
  kind = 'official',
}: {
  bggName: string
  // official＝官方 FAQ；unofficial＝BGG 討論・非官方 FAQ（玩家整理，會標示來源）
  kind?: 'official' | 'unofficial'
}) {
  const data = kind === 'unofficial' ? getUnofficialFaq(bggName) : getGameFaq(bggName)
  const [query, setQuery] = useState('')
  const keyword = query.trim().toLowerCase()

  const groups = useMemo(() => {
    if (!data) return []
    if (keyword === '') return data.groups
    return data.groups
      .map((group) => ({
        ...group,
        topics: group.topics.filter(
          (topic) =>
            topic.name.toLowerCase().includes(keyword) ||
            topic.items.some(
              (item) =>
                (item.q ?? '').toLowerCase().includes(keyword) ||
                item.a.toLowerCase().includes(keyword),
            ),
        ),
      }))
      .filter((group) => group.topics.length > 0)
  }, [data, keyword])

  if (!data) return <p className="gfaq-note">這款遊戲還沒有 FAQ。</p>

  const topicCount = groups.reduce((sum, group) => sum + group.topics.length, 0)

  return (
    <div className="gfaq">
      <p className="gfaq-note">{data.note}</p>
      {data.sources && data.sources.length > 0 && (
        <p className="gfaq-note">
          來源：
          {data.sources.map((source, index) => (
            <span key={index}>
              {index > 0 && '、'}
              {source.url && isSafeUrl(source.url) ? (
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.label} ↗
                </a>
              ) : (
                source.label
              )}
            </span>
          ))}
        </p>
      )}
      <input
        type="search"
        className="gfaq-search"
        placeholder={kind === 'unofficial' ? '搜尋非官方 FAQ（例如：太陽能板、維護費）' : '搜尋 FAQ（例如：忠誠、切腹、福祿壽）'}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label={kind === 'unofficial' ? '搜尋非官方 FAQ' : '搜尋 FAQ'}
      />
      {keyword !== '' && (
        <p className="gfaq-count">
          {topicCount > 0 ? `找到 ${topicCount} 個主題` : '沒有找到相關的 FAQ'}
        </p>
      )}

      {groups.map((group) => (
        <section className="gfaq-group" key={group.title}>
          <h4 className="gfaq-group-title">{group.title}</h4>
          {group.topics.map((topic) => (
            <details className="gfaq-topic" key={topic.name} open={keyword !== ''}>
              <summary>{topic.name}</summary>
              <div className="gfaq-body">
                {topic.items.map((item, index) => (
                  <div className="gfaq-item" key={index}>
                    {item.q && (
                      <p className="gfaq-q">
                        <b>Q</b>
                        <span>{item.q}</span>
                      </p>
                    )}
                    <p className="gfaq-a">
                      {item.q && <b>A</b>}
                      <span>{item.a}</span>
                    </p>
                    {item.src && <small className="gfaq-src">來源：{item.src}</small>}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </section>
      ))}
    </div>
  )
}
