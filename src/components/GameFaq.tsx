import { useMemo, useState } from 'react'
import type { GameFaqData } from '../data/faq/types'
import { RISING_SUN_FAQ } from '../data/faq/risingSunFaq'
import { GAIA_PROJECT_FAQ } from '../data/faq/gaiaProjectFaq'
import { BRASS_BIRMINGHAM_FAQ } from '../data/faq/brassBirminghamFaq'
import { FEAST_FOR_ODIN_FAQ } from '../data/faq/feastForOdinFaq'
import { ALCHEMISTS_FAQ } from '../data/faq/alchemistsFaq'
import { TILETUM_FAQ } from '../data/faq/tiletumFaq'
import { PULSAR_2849_FAQ } from '../data/faq/pulsar2849Faq'
import { FURUYONI_NEW_ACT_FAQ } from '../data/faq/furuyoniNewActFaq'
import { getUnofficialFaq } from '../data/faq/unofficialRegistry'
import { isSafeUrl } from '../lib/useGameDocuments'
import '../styles/game-faq-cards.css'

// 有 FAQ 的遊戲在這裡登記（key 是資料庫裡的 bggName）
const FAQ_BY_GAME: Record<string, GameFaqData> = {
  'Rising Sun': RISING_SUN_FAQ,
  'Gaia Project': GAIA_PROJECT_FAQ,
  'Brass: Birmingham': BRASS_BIRMINGHAM_FAQ,
  'A Feast for Odin': FEAST_FOR_ODIN_FAQ,
  'Alchemists': ALCHEMISTS_FAQ,
  'Tiletum': TILETUM_FAQ,
  'Pulsar 2849': PULSAR_2849_FAQ,
  '新幕 桜降る代に決闘を 基本セット (A Duel for Falling Cherry Blossoms: New Act – Basic Set)': FURUYONI_NEW_ACT_FAQ,
}

export function getGameFaq(bggName: string): GameFaqData | null {
  return FAQ_BY_GAME[bggName] ?? null
}

// BGG 討論・非官方 FAQ（登記表在 data/faq/unofficialRegistry.ts，網頁與規則助手共用）
export { getUnofficialFaq }

// 這款 FAQ 的說明文字（GameQa 的長按／滑過提示用）；沒有資料回空字串
export function getFaqNote(bggName: string, kind: 'official' | 'unofficial' = 'official'): string {
  const data = kind === 'unofficial' ? getUnofficialFaq(bggName) : getGameFaq(bggName)
  return data?.note ?? ''
}

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
  hideSearch = false,
  externalQuery,
  leadNote,
  foldNotes = false,
  hideNotes = false,
}: {
  bggName: string
  // official＝官方 FAQ；unofficial＝BGG 討論・非官方 FAQ（玩家整理，會標示來源）
  kind?: 'official' | 'unofficial'
  // 規則助手頁已有主搜尋欄（會一起搜 FAQ），這裡不要再多一個
  hideSearch?: boolean
  // 有值＝搜尋字由外面（GameQa 的統一搜尋）控制，這裡不顯示自己的搜尋欄
  externalQuery?: string
  // 說明文字最前面再加一段（GameQa 放各分頁原本的一行小字）
  leadNote?: string
  // true＝說明與來源收進一個預設收起的「說明」
  foldNotes?: boolean
  // true＝說明文字不顯示（由外面用長按／滑過提示），只在最下面留一行來源
  hideNotes?: boolean
}) {
  const data = kind === 'unofficial' ? getUnofficialFaq(bggName) : getGameFaq(bggName)
  const [query, setQuery] = useState('')
  const keyword = (externalQuery ?? query).trim().toLowerCase()

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

  const sourcesLine =
    data.sources && data.sources.length > 0 ? (
      <p className="gfaq-note gfaq-sources">
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
    ) : null

  const notes = (
    <>
      {leadNote && <p className="gfaq-note">{leadNote}</p>}
      <p className="gfaq-note">{data.note}</p>
      {sourcesLine}
    </>
  )

  return (
    <div className={`gfaq ${kind === 'unofficial' ? 'gfaq-u' : ''}`}>
      {hideNotes ? null : foldNotes ? (
        <details className="gqa-desc">
          <summary>說明</summary>
          {notes}
        </details>
      ) : (
        notes
      )}
      {!hideSearch && externalQuery === undefined && (
        <input
          type="search"
          className="gfaq-search"
          placeholder={kind === 'unofficial' ? '搜尋非官方 FAQ（例如：太陽能板、維護費）' : '搜尋 FAQ（例如：忠誠、切腹、福祿壽）'}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={kind === 'unofficial' ? '搜尋非官方 FAQ' : '搜尋 FAQ'}
        />
      )}
      {(externalQuery !== undefined || !hideSearch) && keyword !== '' && (
        <p className="gfaq-count">
          {topicCount > 0 ? `找到 ${topicCount} 個主題` : '沒有找到相關的 FAQ'}
        </p>
      )}

      {groups.map((group) => (
        <section className="gfaq-group" key={group.title}>
          {kind === 'unofficial' ? (
            <h4 className="gfaq-group-title">
              <span className="gfaq-tag">{group.title}</span>
            </h4>
          ) : (
            <h4 className="gfaq-group-title">{group.title}</h4>
          )}
          {group.topics.map((topic) => {
            const items = topic.items.map((item, index) => (
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
            ))
            // 非官方：每則直接攤開成卡片（像快速複習），不用一則一則點開
            if (kind === 'unofficial') {
              return (
                <article className="gfaq-card" key={topic.name}>
                  <h5 className="gfaq-card-title">{topic.name}</h5>
                  {items}
                </article>
              )
            }
            return (
              <details className="gfaq-topic" key={topic.name} open={keyword !== ''}>
                <summary>{topic.name}</summary>
                <div className="gfaq-body">{items}</div>
              </details>
            )
          })}
        </section>
      ))}
      {hideNotes && sourcesLine}
    </div>
  )
}
