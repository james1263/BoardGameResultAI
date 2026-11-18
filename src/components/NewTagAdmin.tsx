import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { LibraryGame } from '../lib/libraryTypes'
import '../styles/new-tag-admin.css'

type Props = {
  games: LibraryGame[]
  onChange: (bggName: string, value: boolean | null) => void
}

export default function NewTagAdmin({ games, onChange }: Props) {
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const rows = useMemo(() => {
    const key = search.trim().toLocaleLowerCase()
    if (!key) return games.filter((g) => g.newOverride != null)
    return games
      .filter(
        (g) =>
          g.name.toLocaleLowerCase().includes(key) ||
          g.bggName.toLocaleLowerCase().includes(key),
      )
      .slice(0, 30)
  }, [games, search])

  async function setOverride(game: LibraryGame, value: boolean | null) {
    setBusy(game.bggName)
    setMessage('')
    const { data, error } = await supabase
      .from('board_games')
      .update({ new_override: value })
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
    onChange(game.bggName, value)
  }

  return (
    <details className="nta">
      <summary>NEW 標籤管理</summary>
      <p className="nta-hint">
        預設依上架 30 天自動判斷。這裡可以強制顯示 NEW，或強制移除。
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
                  aria-pressed={game.newOverride == null}
                  disabled={busy === game.bggName}
                  onClick={() => void setOverride(game, null)}
                >
                  自動
                </button>
                <button
                  type="button"
                  aria-pressed={game.newOverride === true}
                  disabled={busy === game.bggName}
                  onClick={() => void setOverride(game, true)}
                >
                  強制 NEW
                </button>
                <button
                  type="button"
                  aria-pressed={game.newOverride === false}
                  disabled={busy === game.bggName}
                  onClick={() => void setOverride(game, false)}
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