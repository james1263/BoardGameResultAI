import { useMemo } from 'react'
import type { LibraryGame } from '../lib/libraryTypes'
import { NEW_GAME_DAYS } from '../lib/libraryTypes'
import { formatNumber } from '../lib/gameFormat'
import CoverImage from './CoverImage'
import '../styles/explore-home.css'

const MAX_ITEMS = 8
const DAY_MS = 24 * 60 * 60 * 1000

// 新加入桌遊：預設看 createdAt（不看 seenNew），最近 NEW_GAME_DAYS 天、最多 8 款、最新優先；
// 管理者可手動指定（newOverride）：true＝強制出現並排最前面、false＝強制不出現；
// 排除僅供參考、無效日期與未來日期；沒有符合的就整區不顯示
export default function NewArrivals({
  games,
  coverVersions,
  nowMs,
  onOpen,
}: {
  games: LibraryGame[]
  coverVersions: Record<string, number>
  nowMs: number
  onOpen: (game: LibraryGame) => void
}) {
  const items = useMemo(() => {
    const list: { game: LibraryGame; time: number; forced: boolean }[] = []
    for (const game of games) {
      if (game.referenceOnly) continue
      if (game.newOverride === false) continue
      const parsed = game.createdAt ? new Date(game.createdAt).getTime() : NaN
      const time = Number.isFinite(parsed) ? parsed : 0
      if (game.newOverride === true) {
        list.push({ game, time, forced: true })
        continue
      }
      if (!game.createdAt || !Number.isFinite(parsed)) continue
      const age = nowMs - parsed
      if (age < 0 || age >= NEW_GAME_DAYS * DAY_MS) continue
      list.push({ game, time, forced: false })
    }
    list.sort((a, b) => {
      if (a.forced !== b.forced) return a.forced ? -1 : 1
      return b.time - a.time
    })
    return list.slice(0, MAX_ITEMS).map((item) => item.game)
  }, [games, nowMs])

  if (items.length === 0) return null

  return (
    <section className="explore-home explore-new" aria-label="新加入桌遊">
      <div className="explore-new-inner">
        <h2 className="explore-title">新加入桌遊</h2>
        <ul className="explore-new-list">
          {items.map((game) => (
            <li key={game.id}>
              <button
                type="button"
                className="explore-new-card"
                aria-label={`開啟 ${game.name} 的詳細資料`}
                onClick={() => onOpen(game)}
              >
                <span className="explore-new-art">
                  <CoverImage
                    key={`${game.coverSlug}-${coverVersions[game.coverSlug] ?? 0}`}
                    version={coverVersions[game.coverSlug] ?? 0}
                    slug={game.coverSlug}
                    alt={game.name}
                    className="explore-new-img"
                    fallback={
                      <span className="explore-new-emoji" aria-hidden="true">
                        🎲
                      </span>
                    }
                  />
                  <span className="explore-new-badge">NEW</span>
                </span>
                <span className="explore-new-name">{game.name}</span>
                <span className="explore-new-score">
                  BGG {game.bggScore == null ? '—' : formatNumber(game.bggScore)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}