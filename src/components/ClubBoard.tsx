import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import { supabase } from '../lib/supabase'
import NoteListItem from './NoteListItem'
import NoteLikersButton from './NoteLikersButton'
import { likeErrorText, toggleNoteLike } from '../lib/noteLikes'
import { formatNoteTag } from '../lib/noteTag'
import '../styles/club-board.css'
import { askConfirm } from '../lib/askConfirm'

type ListedGame = BoardGame & { removedAt?: string | null }

type NoteRow = {
  id: string
  bgg_name: string
  game_name: string | null
  nickname: string
  content: string
  is_mine: boolean
  posted_on: string | null
  like_point?: string | null
  dislike_point?: string | null
  like_count?: number | null
  i_liked?: boolean | null
  gathering_date?: string | null
  gathering_title?: string | null
}

// 搜尋時忽略大小寫、空白與標點
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '')
}

export default function ClubBoard({
  boardGames,
  isAdmin,
  isVip,
  onBack,
  onClose,
  onOpenGame,
  initialSearch = '',
  embedded = false,
  onWrite,
}: {
  boardGames: ListedGame[]
  isAdmin: boolean
  isVip: boolean
  onBack: () => void
  onClose: () => void
  onOpenGame: (game: BoardGame, tab?: 'discussion') => void
  // 從遊戲視窗「前往留言板」進來時，預先填入遊戲名稱
  initialSearch?: string
  // 放在集點聚會頁的分頁裡時只畫內容（不自己開抽屜與標題）
  embedded?: boolean
  // 「＋ 發表留言」：跳到俱樂部「我的心得」的寫心得／留言畫面
  onWrite: () => void
}) {
  const enabled = isVip || isAdmin
  const [rows, setRows] = useState<NoteRow[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')
  const [search, setSearch] = useState(initialSearch)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [likeBusyId, setLikeBusyId] = useState<string | null>(null)

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

  // 按讚／取消讚：先在畫面上更新，失敗再還原
  async function toggleLike(row: NoteRow) {
    if (likeBusyId) return
    const was = !!row.i_liked
    const before = row.like_count ?? 0
    const patch = (liked: boolean, count: number) =>
      setRows((current) =>
        current.map((item) =>
          item.id === row.id ? { ...item, i_liked: liked, like_count: count } : item,
        ),
      )
    setLikeBusyId(row.id)
    setMessage('')
    patch(!was, Math.max(0, before + (was ? -1 : 1)))
    try {
      const result = await toggleNoteLike(row.id)
      patch(result.liked, result.count)
    } catch (error) {
      patch(was, before)
      setMessage(likeErrorText(error instanceof Error ? error.message : String(error)))
    } finally {
      setLikeBusyId(null)
    }
  }

  // 管理者隱藏別人的留言（可在遊戲視窗討論分頁的「已隱藏的留言」恢復）
  async function hideNote(row: NoteRow) {
    if (!(await askConfirm('確定要隱藏這則留言嗎？之後可以在遊戲視窗的討論分頁恢復。'))) return
    setBusyId(row.id)
    setMessage('')
    const { error: rpcError } = await supabase.rpc('admin_hide_gathering_note', {
      p_note: row.id,
      p_hide: true,
    })
    setBusyId(null)
    if (rpcError) {
      setMessage('隱藏失敗：' + rpcError.message)
      return
    }
    await load()
  }

  async function removeMine(row: NoteRow) {
    if (!(await askConfirm('確定要刪除這則留言嗎？刪除後無法復原。'))) return
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

  const body = (
    <>
          {enabled && (
            <div className="cb-actions">
              <button
                type="button"
                className="cb-btn"
                onClick={onWrite}
              >
                ＋ 發表留言
              </button>
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
                      <NoteListItem
                        key={row.id}
                        name={row.nickname}
                        mine={row.is_mine}
                        date={row.posted_on ? row.posted_on.replaceAll('-', '/') : ''}
                        gameName={gameName}
                        tag={formatNoteTag(row.gathering_date, row.gathering_title)}
                        onOpenGame={game ? () => onOpenGame(game, 'discussion') : undefined}
                        content={row.content}
                        like={row.like_point ?? ''}
                        dislike={row.dislike_point ?? ''}
                        likeCount={row.like_count ?? 0}
                        iLiked={!!row.i_liked}
                        canLike={!row.is_mine}
                        likeBusy={likeBusyId === row.id}
                        onLike={() => void toggleLike(row)}
                        open={openId === row.id}
                        onToggle={() => setOpenId(openId === row.id ? null : row.id)}
                      >
                        {row.is_mine || isAdmin ? (
                          <>
                            {row.is_mine ? (
                              <div className="nl-btnrow">
                                <button
                                  type="button"
                                  className="cb-link cb-danger"
                                  disabled={busyId === row.id}
                                  onClick={() => void removeMine(row)}
                                >
                                  {busyId === row.id ? '處理中…' : '刪除'}
                                </button>
                              </div>
                            ) : (
                              <div className="nl-btnrow">
                                <button
                                  type="button"
                                  className="cb-link"
                                  disabled={busyId === row.id}
                                  onClick={() => void hideNote(row)}
                                >
                                  {busyId === row.id ? '處理中…' : '隱藏'}
                                </button>
                              </div>
                            )}
                            {isAdmin && (row.like_count ?? 0) > 0 ? (
                              <NoteLikersButton noteId={row.id} count={row.like_count ?? 0} />
                            ) : null}
                          </>
                        ) : null}
                      </NoteListItem>
                    )
                  })}
                </ul>
              )}
            </>
          )}
    </>
  )

  if (embedded) return body

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
          {body}
        </div>
      </aside>
    </>
  )
}
