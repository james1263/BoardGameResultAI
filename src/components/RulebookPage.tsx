import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { LibraryGame } from '../lib/libraryTypes'
import RulebookAssistant from './RulebookAssistant'
import { getIndexedGames } from '../lib/useRulebookSearch'
import { useBackClose } from '../lib/useBackClose'

export default function RulebookPage({
  boardGames,
  onClose,
  onOpenGame,
}: {
  boardGames: LibraryGame[]
  onClose: () => void
  onOpenGame: (game: LibraryGame) => void
}) {
  useBackClose(onClose)
  const [indexed, setIndexed] = useState<string[] | null>(null)
  const [search, setSearch] = useState('')
  const [picked, setPicked] = useState<LibraryGame | null>(null)

  useEffect(() => {
    let cancelled = false
    getIndexedGames().then((names) => {
      if (!cancelled) setIndexed(names)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const games = useMemo(() => {
    if (!indexed) return []
    const set = new Set(indexed)
    const text = search.trim().toLocaleLowerCase()
    return boardGames
      .filter((game) => set.has(game.bggName))
      .filter(
        (game) =>
          !text ||
          game.name.toLocaleLowerCase().includes(text) ||
          game.bggName.toLocaleLowerCase().includes(text),
      )
  }, [indexed, boardGames, search])

  return createPortal(
    <div className="ra-backdrop" onClick={onClose}>
      <section
        className="ra-page"
        role="dialog"
        aria-modal="true"
        aria-label="規則助手"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ra-page-head">
          {picked && (
            <button type="button" className="ra-back" onClick={() => setPicked(null)}>
              ‹ 換遊戲
            </button>
          )}
          <h2>{picked ? picked.name : '規則助手'}</h2>
          <button type="button" className="ra-x" aria-label="關閉" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="ra-page-body">
          {picked ? (
            <>
              <button
                type="button"
                className="ra-btn ra-btn-small ra-rules-link"
                onClick={() => onOpenGame(picked)}
              >
                📖 這款的規則連結與影片
              </button>
              <RulebookAssistant
                key={picked.bggName}
                bggName={picked.bggName}
                gameName={picked.name}
              />
            </>
          ) : indexed === null ? (
            <p className="ra-notice">讀取中…</p>
          ) : indexed.length === 0 ? (
            <p className="ra-notice">
              目前沒有已建立索引的規則書。管理者上傳規則書後，這裡就會出現遊戲。
            </p>
          ) : (
            <>
              <input
                className="ra-search"
                type="search"
                placeholder="搜尋遊戲名稱"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <ul className="ra-game-list">
                {games.map((game) => (
                  <li key={game.bggName}>
                    <button type="button" onClick={() => setPicked(game)}>
                      {game.name}
                    </button>
                  </li>
                ))}
                {games.length === 0 && <li className="ra-notice">沒有符合的遊戲。</li>}
              </ul>
            </>
          )}
        </div>
      </section>
    </div>,
    document.body,
  )
}