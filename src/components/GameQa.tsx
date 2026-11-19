import { useState } from 'react'
import GameErrata from './GameErrata'
import GameFaq, { countFaqItems, getGameFaq, getUnofficialFaq } from './GameFaq'
import type { useGameErrata } from '../lib/useGameErrata'
import '../styles/gqa-tabs.css'

type Tab = 'faq' | 'errata' | 'bgg'

// 「FAQ・玩錯紀錄・AI 回饋・BGG 討論」：三個分頁，一次只看一種資料。
// 官方 FAQ＝簡潔問題列表；玩錯紀錄・AI 回饋＝資訊卡片；BGG 討論＝非官方來源卡片。
export default function GameQa({
  bggName,
  isAdmin,
  errataApi,
  showErrata,
  includeUnofficial = false,
}: {
  bggName: string
  isAdmin: boolean
  errataApi: ReturnType<typeof useGameErrata>
  // 玩錯紀錄・AI 回饋只有 VIP／管理者看得到（和原本的權限相同）
  showErrata: boolean
  // true＝BGG 討論也放在這裡的分頁（GameModal 要同時拿掉自己另外掛的那一區，否則會出現兩次）
  includeUnofficial?: boolean
}) {
  const faqData = getGameFaq(bggName)
  const unofficialData = includeUnofficial ? getUnofficialFaq(bggName) : null

  const tabs: { key: Tab; label: string; count: number | null }[] = []
  if (faqData) tabs.push({ key: 'faq', label: '官方 FAQ', count: countFaqItems(faqData) })
  if (showErrata) {
    const approved = errataApi.items.filter((i) => !i.status || i.status === 'approved')
    tabs.push({
      key: 'errata',
      label: '玩錯紀錄・AI 回饋',
      count: errataApi.loading ? null : approved.length,
    })
  }
  if (unofficialData) {
    tabs.push({ key: 'bgg', label: 'BGG 討論', count: countFaqItems(unofficialData) })
  }

  const [tab, setTab] = useState<Tab | null>(null)
  const active: Tab | null = tabs.some((t) => t.key === tab) ? tab : (tabs[0]?.key ?? null)

  return (
    <div className="gqa">
      {tabs.length > 1 && (
        <div className="gqa-tabs" role="tablist" aria-label="資料類型">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              className={`gqa-tab${active === t.key ? ' is-active' : ''}`}
              aria-selected={active === t.key}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.count !== null && <span className="gqa-tab-n">{t.count}</span>}
            </button>
          ))}
        </div>
      )}

      {active === 'faq' && faqData && (
        <section className="gqa-panel gqa-panel-faq">
          <p className="gqa-sub">出版商發布的官方問答，與規則書衝突時以官方為準。</p>
          <GameFaq key={`${bggName}-faq`} bggName={bggName} />
        </section>
      )}

      {active === 'errata' && showErrata && (
        <section className="gqa-panel gqa-panel-errata">
          <p className="gqa-sub">玩家實際玩錯後整理的常見錯誤，以及規則助手裡被認可的好答案。</p>
          <GameErrata
            key={`${bggName}-errata`}
            bggName={bggName}
            isAdmin={isAdmin}
            embedded
            api={errataApi}
          />
        </section>
      )}

      {active === 'bgg' && unofficialData && (
        <section className="gqa-panel gqa-panel-bgg">
          <p className="gqa-sub">非官方：玩家製作的教學筆記與 BGG 討論整理，與官方衝突時以官方為準。</p>
          <GameFaq key={`${bggName}-bgg`} bggName={bggName} kind="unofficial" />
        </section>
      )}
    </div>
  )
}
