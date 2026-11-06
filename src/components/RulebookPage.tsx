import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { LibraryGame } from '../lib/libraryTypes'
import RulebookAssistant from './RulebookAssistant'
import GameErrata from './GameErrata'
import { getIndexedGames } from '../lib/useRulebookSearch'
import { errataTag, useErrataFeed } from '../lib/useGameErrata'
import { getErrataLastSeen, markErrataSeen } from '../lib/useErrataUnseen'
import { useBackClose } from '../lib/useBackClose'
import { useIsAdmin } from '../lib/useIsAdmin'
import { useSession } from '../lib/useSession'
import '../styles/ra-large.css'
import '../styles/errata.css'

// 規則助手：搜尋優先的單一頁面。搜尋遊戲 → 規則連結、玩錯紀錄、直接問問題
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
  const isAdmin = useIsAdmin()
  const session = useSession()
  const uid = session?.user?.id
  const [indexed, setIndexed] = useState<string[] | null>(null)
  const [search, setSearch] = useState('')
  const [picked, setPicked] = useState<LibraryGame | null>(null)
  const [since, setSince] = useState<number | null>(null)
  const marked = useRef(false)
  const feed = useErrataFeed(picked === null)

  useEffect(() => {
    let cancelled = false
    getIndexedGames().then((names) => {
      if (!cancelled) setIndexed(names)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // 進來時記下「上次看到哪」（用來標「新」），再標成已看過（導覽列數字歸零）
  useEffect(() => {
    if (!uid || marked.current) return
    marked.current = true
    const last = getErrataLastSeen(uid)
    setSince(last ? Date.parse(last) : null)
    markErrataSeen(uid)
  }, [uid])

  const candidates = useMemo(() => {
    const text = search.trim().toLocaleLowerCase()
    if (!text) return []
    return boardGames
      .filter((game) => !game.referenceOnly)
      .filter(
        (game) =>
          game.name.toLocaleLowerCase().includes(text) ||
          game.bggName.toLocaleLowerCase().includes(text),
      )
      .slice(0, 8)
  }, [boardGames, search])

  const hasIndex = picked && indexed ? indexed.includes(picked.bggName) : false
  const newCount = feed.items.filter((row) => since !== null && Date.parse(row.changed_at) > since).length

  function pick(bggName: string) {
    const game = boardGames.find((g) => g.bggName === bggName)
    if (game) {
      setPicked(game)
      setSearch('')
    }
  }

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
              <GameErrata bggName={picked.bggName} isAdmin={isAdmin} hideSubmit />
              {indexed === null ? (
                <p className="ra-notice">讀取中…</p>
              ) : hasIndex ? (
                <RulebookAssistant key={picked.bggName} bggName={picked.bggName} gameName={picked.name} />
              ) : (
                <p className="ra-notice">
                  這款還沒有可搜尋的規則書，可以先看上面的規則連結與玩錯紀錄。
                </p>
              )}
            </>
          ) : (
            <>
              <input
                className="ra-search"
                type="search"
                placeholder="搜尋桌遊名稱，例如：旭日戰魂"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search.trim() && candidates.length === 0 && <p className="ra-notice">沒有符合的遊戲。</p>}
              {candidates.length > 0 && (
                <ul className="ra-game-list">
                  {candidates.map((game) => (
                    <li key={game.bggName}>
                      <button type="button" onClick={() => setPicked(game)}>
                        {game.name}
                        {indexed && !indexed.includes(game.bggName) && (
                          <small style={{ marginLeft: 8, opacity: 0.6 }}>（無規則書搜尋）</small>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!search.trim() && (
                <>
                  <p className="er-note">
                    選一款遊戲後，可以看規則連結、管理者認證的玩錯紀錄，或直接問規則問題。
                  </p>
                  <details className="ov-fold er-fold" open={newCount > 0 || undefined}>
                    <summary>
                      最近更新的玩錯紀錄
                      {newCount > 0 && (
                        <span
                          style={{
                            marginLeft: 6,
                            padding: '1px 7px',
                            borderRadius: 999,
                            background: '#c0392b',
                            color: '#fff',
                            fontSize: 12,
                          }}
                        >
                          {newCount} 則新
                        </span>
                      )}
                    </summary>
                    <div className="ov-fold-body">
                      {feed.loading && <p className="er-note">載入中…</p>}
                      {feed.error && <p className="er-note">{feed.error}</p>}
                      {!feed.loading && !feed.error && feed.items.length === 0 && (
                        <p className="er-note">目前還沒有玩錯紀錄。</p>
                      )}
                      <ul className="er-list">
                        {feed.items.slice(0, 6).map((row) => {
                          const isNew = since !== null && Date.parse(row.changed_at) > since
                          return (
                            <li key={row.id}>
                              <div className="er-title">
                                《
                                <button type="button" className="admin-link" onClick={() => pick(row.bgg_name)}>
                                  {row.game_name || row.bgg_name}
                                </button>
                                》{row.title}
                                {isNew && (
                                  <small className="er-src" style={{ color: '#c0392b', fontWeight: 700 }}>
                                    {' '}・新
                                  </small>
                                )}
                                {row.from_player && <small className="er-src"> ・{errataTag(row)}</small>}
                              </div>
                              <p className="er-body">{row.content}</p>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </details>
                  {!isAdmin && (
                    <p className="er-note">想分享玩錯的規則？到「俱樂部 → 我的投稿」投稿。</p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>
    </div>,
    document.body,
  )
}
