import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import type { usePersonalCollection } from '../lib/usePersonalCollection'
import type { RatingsApi } from '../lib/useGameRatings'
import { supabase } from '../lib/supabase'
import { MAX_NOTES_PER_GAME } from '../lib/useGameNotesBoard'
import '../styles/club-board.css'

type PersonalApi = ReturnType<typeof usePersonalCollection>
type ListedGame = BoardGame & { removedAt?: string | null }

type NoteRow = {
  id: string
  bgg_name: string
  game_name: string | null
  nickname: string
  content: string
  is_mine: boolean
  posted_on: string | null
}

// 搜尋時忽略大小寫、空白與標點
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '')
}

function explain(message: string): string {
  if (message.includes('not played')) return '請先標記已玩或評分這款，才能留言。'
  if (message.includes('too long')) return '留言最多 200 字。'
  if (message.includes('too many'))
    return `這款你最多只能留 ${MAX_NOTES_PER_GAME} 則，請先刪除舊的。`
  if (message.includes('empty')) return '請先輸入留言內容。'
  if (message.includes('not vip')) return '只有 VIP 可以留言。'
  return '操作失敗：' + message
}

export default function ClubBoard({
  boardGames,
  personal,
  ratings,
  isAdmin,
  isVip,
  onBack,
  onClose,
  onOpenGame,
  onOpenAddPlay,
  onOpenMyNotes,
}: {
  boardGames: ListedGame[]
  personal: PersonalApi
  ratings: RatingsApi
  isAdmin: boolean
  isVip: boolean
  onBack: () => void
  onClose: () => void
  onOpenGame: (game: BoardGame, tab?: 'discussion') => void
  onOpenAddPlay: () => void
  onOpenMyNotes: () => void
}) {
  const enabled = isVip || isAdmin
  const [rows, setRows] = useState<NoteRow[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [pickSearch, setPickSearch] = useState('')
  const [picked, setPicked] = useState<ListedGame | null>(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    if (!enabled) return
    const { data, error: rpcError } = await supabase.rpc('get_public_gathering_notes', {
      p_bgg_name: null,
      p_limit: 200,
    })
    if (rpcError) {
      setError('讀取留言失敗，請稍後再試。')
    } else {
      setError('')
      setRows((data ?? []) as NoteRow[])
    }
    setLoading(false)
  }, [enabled])

  useEffect(() => {
    void load()
  }, [load])

  const gameByName = useMemo(
    () => new Map(boardGames.map((game) => [game.bggName, game])),
    [boardGames],
  )

  const shown = useMemo(() => {
    const query = normalizeText(search)
    if (!query) return rows
    return rows.filter(
      (row) =>
        normalizeText(row.game_name ?? '').includes(query) ||
        normalizeText(row.content).includes(query) ||
        normalizeText(row.nickname).includes(query),
    )
  }, [rows, search])

  // 可以留言的遊戲：管理者不限，其他人要已玩或評分過
  const pickMatches = useMemo(() => {
    const query = normalizeText(pickSearch)
    if (!query) return []
    return boardGames
      .filter(
        (game) =>
          !game.removedAt &&
          (isAdmin ||
            personal.entries[game.bggName]?.played ||
            ratings.getMine(game.bggName) !== null) &&
          (normalizeText(game.name).includes(query) ||
            normalizeText(game.bggName).includes(query)),
      )
      .slice(0, 8)
  }, [boardGames, pickSearch, isAdmin, personal.entries, ratings])

  async function publish() {
    if (!picked) return
    setSaving(true)
    setMessage('')
    const { error: rpcError } = await supabase.rpc('add_game_note', {
      p_bgg_name: picked.bggName,
      p_content: draft,
    })
    setSaving(false)
    if (rpcError) {
      setMessage(explain(rpcError.message))
      return
    }
    setDraft('')
    setPicked(null)
    setPickSearch('')
    setComposeOpen(false)
    setMessage('已發表。')
    await load()
  }

  async function removeMine(row: NoteRow) {
    if (!window.confirm('確定要刪除這則留言嗎？刪除後無法復原。')) return
    setBusyId(row.id)
    setMessage('')
    const { error: rpcError } = await supabase.rpc('delete_my_public_note', {
      p_note: row.id,
    })
    setBusyId(null)
    if (rpcError) {
      setMessage('刪除失敗：' + rpcError.message)
      return
    }
    await load()
  }

  return (
    <>
      <div className="mylist-backdrop" onClick={onClose} />
      <aside className="mylist-drawer" role="dialog" aria-label="留言板">
        <div className="mylist-header">
          <h2>留言板</h2>
          <button
            className="mylist-close"
            type="button"
            aria-label="關閉"
            onClick={onBack}
          >
            ×
          </button>
        </div>

        <div className="mylist-body">
          <div className="cb-actions">
            {enabled && (
              <button
                type="button"
                className="cb-btn"
                aria-expanded={composeOpen}
                onClick={() => setComposeOpen((value) => !value)}
              >
                ＋ 發表留言
              </button>
            )}
            <button type="button" className="cb-btn" onClick={onOpenAddPlay}>
              新增遊玩紀錄
            </button>
            <button type="button" className="cb-btn" onClick={onOpenMyNotes}>
              我的心得
            </button>
          </div>

          {composeOpen && enabled && (
            <div className="cb-compose">
              {picked ? (
                <p className="cb-picked">
                  <b>{picked.name}</b>
                  <button
                    type="button"
                    className="cb-link"
                    onClick={() => setPicked(null)}
                  >
                    換一款
                  </button>
                </p>
              ) : (
                <>
                  <input
                    type="search"
                    className="cb-input"
                    placeholder="輸入遊戲名稱（只能選你玩過或評分過的）"
                    value={pickSearch}
                    onChange={(event) => setPickSearch(event.target.value)}
                  />
                  {pickMatches.length > 0 && (
                    <ul className="cb-pick-list">
                      {pickMatches.map((game) => (
                        <li key={game.bggName}>
                          <button type="button" onClick={() => setPicked(game)}>
                            {game.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {pickSearch.trim() && pickMatches.length === 0 && (
                    <p className="gb-empty">找不到符合的遊戲（要標記已玩或評分過才能留言）。</p>
                  )}
                </>
              )}
              <textarea
                className="gb-textarea"
                maxLength={200}
                rows={3}
                value={draft}
                placeholder="想跟大家說什麼？（公開給 VIP，最多 200 字）"
                onChange={(event) => setDraft(event.target.value)}
              />
              <div className="gb-mine-actions">
                <span className="gb-count">{draft.length} / 200</span>
                <button
                  type="button"
                  className="gb-save"
                  disabled={saving || !picked || draft.trim() === ''}
                  onClick={() => void publish()}
                >
                  {saving ? '發表中…' : '發表'}
                </button>
              </div>
            </div>
          )}

          {message && <p className="gb-empty">{message}</p>}

          {!enabled ? (
            <p className="mylist-empty">只有 VIP 可以看到大家的留言。</p>
          ) : (
            <>
              <div className="cls-searchbox">
                <input
                  type="search"
                  className="cls-search-input"
                  placeholder="搜尋遊戲、留言內容或暱稱"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              {search.trim() && (
                <p className="cls-count">
                  找到 {shown.length} / {rows.length} 則
                </p>
              )}

              {loading && <p className="mylist-empty">讀取中…</p>}
              {error && <p className="mylist-empty">{error}</p>}
              {!loading && !error && rows.length === 0 && (
                <p className="mylist-empty">還沒有人留言。</p>
              )}
              {!loading && !error && rows.length > 0 && shown.length === 0 && (
                <p className="mylist-empty">找不到符合的留言。</p>
              )}

              {shown.length > 0 && (
                <ul className="cb-list">
                  {shown.map((row) => {
                    const game = gameByName.get(row.bgg_name)
                    const gameName = row.game_name ?? game?.name ?? row.bgg_name
                    return (
                      <li className="cb-item" key={row.id}>
                        <div className="cb-meta">
                          <b>{row.nickname}</b>
                          {row.is_mine && <span className="gb-mine">我的</span>}
                          {row.posted_on && (
                            <span className="cb-date">
                              {row.posted_on.replaceAll('-', '/')}
                            </span>
                          )}
                        </div>
                        <p className="cb-content">{row.content}</p>
                        <div className="cb-foot">
                          {game ? (
                            <button
                              type="button"
                              className="cb-chip"
                              onClick={() => onOpenGame(game, 'discussion')}
                            >
                              {gameName} ›
                            </button>
                          ) : (
                            <span className="cb-chip cb-chip-off">{gameName}</span>
                          )}
                          {row.is_mine && (
                            <button
                              type="button"
                              className="cb-link cb-danger"
                              disabled={busyId === row.id}
                              onClick={() => void removeMine(row)}
                            >
                              {busyId === row.id ? '處理中…' : '刪除'}
                            </button>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  )
}
