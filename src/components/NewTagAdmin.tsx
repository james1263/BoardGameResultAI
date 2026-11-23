import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { LibraryGame } from '../lib/libraryTypes'
import { isNewUntilActive } from '../lib/libraryTypes'
import '../styles/new-tag-admin.css'

const FORCE_DAYS = 30

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

type Props = {
  games: LibraryGame[]
  onChange: (
    bggName: string,
    value: boolean | null,
    newUntil: string | null,
  ) => void
}

function newActive(game: LibraryGame): boolean {
  return isNewUntilActive(game.newUntil, Date.now())
}

export default function NewTagAdmin({ games, onChange }: Props) {
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const rows = useMemo(() => {
    const key = search.trim().toLocaleLowerCase()
    if (!key) {
      return games.filter((g) => g.newOverride != null || g.newUntil != null)
    }
    return games
      .filter(
        (g) =>
          g.name.toLocaleLowerCase().includes(key) ||
          g.bggName.toLocaleLowerCase().includes(key),
      )
      .slice(0, 30)
  }, [games, search])

  async function setOverride(
    game: LibraryGame,
    value: boolean | null,
    days: number | null,
  ) {
    const newUntil =
      days == null
        ? null
        : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    setBusy(game.bggName)
    setMessage('')
    const { data, error } = await supabase
      .from('board_games')
      .update({ new_override: value, new_until: newUntil })
      .eq('bgg_name', game.bggName)
      .select('bgg_name')
    setBusy(null)
    if (error) {
      setMessage(`儲存失敗：${error.message}`)
      return
    }
    if (!data || data.length === 0) {
      setMessage('沒有更新到資料（可能沒有管理者權限）。')
      return
    }
    onChange(game.bggName, value, newUntil)
  }

  return (
    <details className="nta">
      <summary>NEW 標籤管理</summary>
      <p className="nta-hint">
        預設依上架 30 天自動判斷。「強制 NEW 30 天」從今天起算，到期後自動回到自動判斷；「強制移除」不會過期。
      </p>
      <input
        type="search"
        className="nta-search"
        placeholder="搜尋遊戲名稱"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="搜尋要設定 NEW 的遊戲"
      />
      {message && <p className="nta-msg">{message}</p>}
      {rows.length === 0 ? (
        <p className="nta-hint">
          {search.trim() ? '找不到符合的遊戲。' : '目前沒有手動設定的遊戲，搜尋後可新增。'}
        </p>
      ) : (
        <ul className="nta-list">
          {rows.map((game) => (
            <li key={game.bggName} className="nta-row">
              <span className="nta-name">{game.name}</span>
              <span className="nta-btns">
                <button
                  type="button"
                  aria-pressed={game.newOverride == null && !newActive(game)}
                  disabled={busy === game.bggName}
                  onClick={() => void setOverride(game, null, null)}
                >
                  自動
                </button>
                <button
                  type="button"
                  aria-pressed={newActive(game) || game.newOverride === true}
                  disabled={busy === game.bggName}
                  onClick={() => void setOverride(game, null, FORCE_DAYS)}
                >
                  強制 NEW 30 天
                  {newActive(game) && game.newUntil
                    ? `（到 ${formatDate(game.newUntil)}）`
                    : game.newOverride === true
                      ? '（舊設定，不過期）'
                      : ''}
                </button>
                <button
                  type="button"
                  aria-pressed={game.newOverride === false}
                  disabled={busy === game.bggName}
                  onClick={() => void setOverride(game, false, null)}
                >
                  強制移除
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </details>
  )
}