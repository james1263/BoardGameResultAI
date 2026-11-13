import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { BoardGame } from '../data/boardGames.generated'
import { supabase } from '../lib/supabase'
import { useBackClose } from '../lib/useBackClose'
import type { RatingsApi } from '../lib/useGameRatings'
import type { AdminScores } from '../lib/libraryTypes'
import { buildMyScoreRows } from './MyRatingsPanel'
import '../styles/favorites.css'

// 「僅供參考」的遊戲不能當本命桌遊（資料庫也會擋）；欄位名稱兩種寫法都認
function isReferenceGame(game: BoardGame) {
  const g = game as unknown as { referenceOnly?: boolean; reference_only?: boolean }
  return Boolean(g.referenceOnly ?? g.reference_only)
}

const MEDALS = ['🥇', '🥈', '🥉']
const SLOT_LABELS = ['冠軍', '亞軍', '季軍']

// ---------- 我的本命桌遊（最多 3 款，依序＝冠軍、亞軍、季軍） ----------
export function useMyFavorites(enabled: boolean) {
  const [names, setNames] = useState<string[]>([])

  useEffect(() => {
    if (!enabled) {
      setNames([])
      return
    }
    let cancelled = false
    supabase.rpc('get_my_favorite_games').then(({ data, error }) => {
      if (cancelled || error) return
      setNames(Array.isArray(data) ? (data as unknown[]).map(String) : [])
    })
    return () => {
      cancelled = true
    }
  }, [enabled])

  const save = useCallback(async (next: string[]) => {
    const { error } = await supabase.rpc('set_my_favorite_games', { p_names: next })
    if (error) {
      console.error('儲存本命桌遊失敗：', error)
      return false
    }
    setNames(next)
    return true
  }, [])

  return { names, save }
}

// ---------- 頒獎台（亞軍｜冠軍｜季軍），點一下開設定視窗 ----------
export function FavoritePodium({
  names,
  gameByName,
  renderCover,
  onClick,
}: {
  names: string[]
  gameByName: Map<string, BoardGame>
  renderCover: (game: BoardGame) => ReactNode
  onClick: () => void
}) {
  return (
    <button type="button" className="fv-podium" aria-label="設定我的本命桌遊" onClick={onClick}>
      {[1, 0, 2].map((index) => {
        const game = names[index] ? gameByName.get(names[index]) : undefined
        return (
          <span key={index} className={`fv-pod fv-pod-${index + 1}`}>
            <span className="fv-pod-cover">
              {game ? renderCover(game) : <i className="fv-pod-plus">＋</i>}
            </span>
            <span className="fv-pod-step">{index + 1}</span>
          </span>
        )
      })}
    </button>
  )
}

// ---------- 設定視窗：選 3 款，下方列出「自己的」評分前五名當參考 ----------
export function FavoritePicker({
  current,
  boardGames,
  ratings,
  isAdmin = false,
  adminScores,
  renderCover,
  onSave,
  onClose,
}: {
  current: string[]
  boardGames: BoardGame[]
  ratings: RatingsApi
  isAdmin?: boolean
  adminScores?: Map<string, AdminScores>
  renderCover: (game: BoardGame) => ReactNode
  onSave: (names: string[]) => Promise<boolean>
  onClose: () => void
}) {
  useBackClose(onClose, true)
  const [slots, setSlots] = useState<(string | null)[]>([
    current[0] ?? null,
    current[1] ?? null,
    current[2] ?? null,
  ])
  const [active, setActive] = useState(() => {
    const empty = [current[0], current[1], current[2]].findIndex((v) => !v)
    return empty === -1 ? 0 : empty
  })
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const gameByName = useMemo(() => {
    const map = new Map<string, BoardGame>()
    for (const game of boardGames) map.set(game.bggName, game)
    return map
  }, [boardGames])

  const keyword = query.trim().toLowerCase()
  const matches = useMemo(() => {
    if (!keyword) return []
    return boardGames
      .filter(
        (game) =>
          !isReferenceGame(game) &&
          (game.name.toLowerCase().includes(keyword) || game.bggName.toLowerCase().includes(keyword)),
      )
      .slice(0, 8)
  }, [boardGames, keyword])

  const boards = useMemo(() => {
    const useCsv = isAdmin && !!adminScores
    if (!useCsv && ratings.status !== 'ready') return []
    const all = buildMyScoreRows(boardGames, ratings, isAdmin, adminScores).filter(
      (row) => !isReferenceGame(row.game),
    )
    const calc = (key: 'overall' | 'keep' | 'composite') => {
      const rows: { game: BoardGame; value: number }[] = []
      for (const row of all) {
        const value = row[key]
        if (value != null) rows.push({ game: row.game, value })
      }
      rows.sort(
        (a, b) => b.value - a.value || a.game.name.localeCompare(b.game.name, 'zh-Hant'),
      )
      return rows.slice(0, 5)
    }
    return [
      { key: 'overall', title: '整體評分', suffix: '', rows: calc('overall') },
      { key: 'keep', title: '適合留下來', suffix: '', rows: calc('keep') },
      { key: 'combo', title: '綜合分數', suffix: '／30', rows: calc('composite') },
    ]
  }, [boardGames, ratings, isAdmin, adminScores])

  function assign(bggName: string) {
    const next = [...slots]
    const old = next.indexOf(bggName)
    if (old !== -1) next[old] = null
    next[active] = bggName
    setSlots(next)
    const empty = next.findIndex((v) => !v)
    setActive(empty === -1 ? active : empty)
    setQuery('')
    setError('')
  }

  function clearSlot(index: number) {
    const next = [...slots]
    next[index] = null
    setSlots(next)
    setActive(index)
  }

  async function handleSave() {
    if (saving) return
    setSaving(true)
    setError('')
    const ok = await onSave(slots.filter((v): v is string => Boolean(v)))
    setSaving(false)
    if (ok) onClose()
    else setError('儲存失敗，請稍後再試。')
  }

  return createPortal(
    <div className="fv-backdrop" onClick={onClose}>
      <div
        className="fv-sheet"
        role="dialog"
        aria-label="我的本命桌遊"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="fv-head">
          <h3>我的本命桌遊</h3>
          <button type="button" className="fv-x" aria-label="關閉" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="fv-body">
          <p className="fv-sub">最多選 3 款，點一格再從下面挑遊戲。VIP 與管理者看得到你的本命桌遊。</p>

          <div className="fv-slots">
            {[0, 1, 2].map((index) => {
              const name = slots[index]
              const game = name ? gameByName.get(name) : undefined
              return (
                <div
                  key={index}
                  className={`fv-slot ${active === index ? 'active' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActive(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') setActive(index)
                  }}
                >
                  <span className="fv-slot-label">
                    {MEDALS[index]} {SLOT_LABELS[index]}
                  </span>
                  <span className="fv-slot-cover">
                    {game ? renderCover(game) : <i className="fv-pod-plus">＋</i>}
                  </span>
                  <span className="fv-slot-name">{game ? game.name : '尚未選擇'}</span>
                  {game && (
                    <button
                      type="button"
                      className="fv-slot-clear"
                      aria-label={`移除${SLOT_LABELS[index]}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        clearSlot(index)
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <input
            type="search"
            className="fv-search"
            placeholder={`搜尋遊戲，放進${SLOT_LABELS[active]}`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {keyword && (
            <ul className="fv-list">
              {matches.length === 0 ? (
                <li className="fv-empty">找不到「{query.trim()}」</li>
              ) : (
                matches.map((game) => (
                  <li key={game.bggName}>
                    <button type="button" className="fv-row" onClick={() => assign(game.bggName)}>
                      <span className="fv-thumb">{renderCover(game)}</span>
                      <span className="fv-row-name">{game.name}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}

          {boards.length > 0 && (
            <div className="fv-ref">
              <p className="fv-ref-title">我的評分前五名（點一下放進{SLOT_LABELS[active]}）</p>
              {boards.map((board) => (
                <div className="fv-board" key={board.key}>
                  <h4>{board.title}</h4>
                  {board.rows.length === 0 ? (
                    <p className="fv-empty">還沒有資料</p>
                  ) : (
                    <ol className="fv-list">
                      {board.rows.map((row, index) => (
                        <li key={row.game.bggName}>
                          <button type="button" className="fv-row" onClick={() => assign(row.game.bggName)}>
                            <span className="fv-rank">{index + 1}</span>
                            <span className="fv-thumb">{renderCover(row.game)}</span>
                            <span className="fv-row-name">{row.game.name}</span>
                            <span className="fv-score">
                              {row.value}
                              {board.suffix}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </div>
          )}
          {error && <p className="fv-error">{error}</p>}
        </div>
        <div className="fv-foot">
          <button type="button" className="fv-cancel" onClick={onClose}>
            取消
          </button>
          <button type="button" className="fv-save" disabled={saving} onClick={() => void handleSave()}>
            {saving ? '儲存中…' : '儲存'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ---------- 玩家榜「本命桌遊」分頁的資料 ----------
export type FavoriteRow = {
  label: string
  contact: string | null
  hidden: boolean // 只有管理者會收到 true：這位玩家隱藏了暱稱
  isAdminAccount: boolean
  games: string[]
}

export function useFavoriteBoards(enabled: boolean) {
  const [rows, setRows] = useState<FavoriteRow[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setStatus('loading')
    supabase.rpc('get_favorite_boards').then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('讀取本命桌遊失敗：', error)
        setStatus('error')
        return
      }
      type Raw = Record<string, unknown>
      setRows(
        ((data ?? []) as Raw[]).map((row) => ({
          label: String(row.nickname ?? '').trim() || '（未設暱稱）',
          contact: row.contact_name ? String(row.contact_name) : null,
          hidden: row.is_hidden === true,
          isAdminAccount: row.admin_account === true,
          games: Array.isArray(row.games) ? (row.games as unknown[]).map(String) : [],
        })),
      )
      setStatus('ready')
    })
    return () => {
      cancelled = true
    }
  }, [enabled])

  return { rows, status }
}

export const FAVORITE_MEDALS = MEDALS
