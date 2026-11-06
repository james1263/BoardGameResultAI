import { useEffect, useMemo, useRef, useState } from 'react'
import type { LibraryGame } from '../lib/libraryTypes'
import GameErrata from './GameErrata'
import { errataTag, useErrataFeed } from '../lib/useGameErrata'
import { getErrataLastSeen, markErrataSeen } from '../lib/useErrataUnseen'
import { useSession } from '../lib/useSession'
import '../styles/errata.css'

// 規則助手第二個分頁：看每款遊戲的玩錯紀錄／AI 回饋（已審核或管理者新增），也可以在這裡投稿玩錯紀錄
export default function ErrataBoard({
  boardGames,
  isAdmin,
  initialBggName,
}: {
  boardGames: LibraryGame[]
  isAdmin: boolean
  initialBggName?: string | null
}) {
  const session = useSession()
  const uid = session?.user?.id
  const [bggName, setBggName] = useState<string | null>(initialBggName ?? null)
  const [search, setSearch] = useState('')
  const [since, setSince] = useState<number | null>(null)
  const marked = useRef(false)
  const feed = useErrataFeed(bggName === null)

  // 進來時先記下「上次看到哪」（用來標「新」），再標成已看過（導覽列數字歸零）
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

  const picked = bggName ? boardGames.find((game) => game.bggName === bggName) : undefined

  return (
    <div className="er-board">
      <p className="er-note">
        這裡收錄管理者記錄與玩家整理（已審核）的玩錯紀錄和 AI 回饋，不是官方規則；與規則書衝突時，以規則書為準。
      </p>

      <input
        className="ra-search"
        type="search"
        placeholder="搜尋遊戲，看這款的玩錯紀錄或投稿"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      {candidates.length > 0 && (
        <ul className="ra-game-list">
          {candidates.map((game) => (
            <li key={game.bggName}>
              <button
                type="button"
                onClick={() => {
                  setBggName(game.bggName)
                  setSearch('')
                }}
              >
                {game.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {bggName ? (
        <>
          <p className="er-note">
            目前看的是《{picked?.name ?? bggName}》
            <button
              type="button"
              className="admin-link"
              style={{ marginLeft: 10 }}
              onClick={() => setBggName(null)}
            >
              ← 看所有遊戲的最新更新
            </button>
          </p>
          <GameErrata key={bggName} bggName={bggName} isAdmin={isAdmin} defaultOpen bigSubmit />
        </>
      ) : (
        <>
          <h4 className="er-list-title">最近更新</h4>
          {feed.loading && <p className="er-note">載入中…</p>}
          {feed.error && <p className="er-note">{feed.error}</p>}
          {!feed.loading && !feed.error && feed.items.length === 0 && (
            <p className="er-note">目前還沒有玩錯紀錄。搜尋上面的遊戲，看看有沒有想分享的。</p>
          )}
          <ul className="er-list">
            {feed.items.map((row) => {
              const isNew = since !== null && Date.parse(row.changed_at) > since
              return (
                <li key={row.id}>
                  <div className="er-title">
                    《
                    <button
                      type="button"
                      className="admin-link"
                      onClick={() => setBggName(row.bgg_name)}
                    >
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
                  {row.page_ref && <small className="er-src">參考頁碼：{row.page_ref}　</small>}
                  {row.source_note && <small className="er-src">來源：{row.source_note}</small>}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
