import { useState } from 'react'
import GameErrata from './GameErrata'
import GameFaq, { getGameFaq } from './GameFaq'
import type { useGameErrata } from '../lib/useGameErrata'

type Filter = 'all' | 'faq' | 'errata'

// 「FAQ・玩錯紀錄・AI 回饋」合併頁：
// 每一區的標題前都有彩色標籤，一眼看出這段是官方 FAQ，還是玩家的玩錯紀錄／AI 回饋。
export default function GameQa({
  bggName,
  isAdmin,
  errataApi,
  showErrata,
}: {
  bggName: string
  isAdmin: boolean
  errataApi: ReturnType<typeof useGameErrata>
  // 玩錯紀錄・AI 回饋只有 VIP／管理者看得到（和原本的權限相同）
  showErrata: boolean
}) {
  const hasFaq = getGameFaq(bggName) !== null
  const [filter, setFilter] = useState<Filter>('all')
  const canFilter = hasFaq && showErrata
  const activeFilter: Filter = canFilter ? filter : 'all'

  return (
    <div className="gqa">
      <p className="gqa-hint">
        {hasFaq && '官方 FAQ＝出版商的官方解答。'}
        {showErrata && '玩錯紀錄＝玩家實際玩錯後整理的常見錯誤；AI 回饋＝規則助手裡被認可的好答案。'}
      </p>

      {canFilter && (
        <div className="gqa-filters" role="group" aria-label="篩選類型">
          {(
            [
              { key: 'all', label: '全部' },
              { key: 'faq', label: '官方 FAQ' },
              { key: 'errata', label: '玩錯紀錄・AI 回饋' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              className={`gqa-chip${activeFilter === item.key ? ' is-active' : ''}`}
              aria-pressed={activeFilter === item.key}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {hasFaq && activeFilter !== 'errata' && (
        <section className="gqa-section">
          <h4 className="gqa-title">
            <span className="gqa-badge is-faq">官方 FAQ</span>
            出版商發布的官方問答
          </h4>
          <GameFaq key={bggName} bggName={bggName} />
        </section>
      )}

      {showErrata && activeFilter !== 'faq' && (
        <section className="gqa-section">
          <h4 className="gqa-title">
            <span className="gqa-badge is-errata">玩錯紀錄・AI 回饋</span>
            玩家整理的常見錯誤與好的 AI 回答
          </h4>
          <GameErrata
            key={bggName}
            bggName={bggName}
            isAdmin={isAdmin}
            embedded
            api={errataApi}
          />
        </section>
      )}
    </div>
  )
}
