import { useMemo, useState, type ReactNode } from 'react'
import type { BoardGame } from './data/boardGames.generated'
import { usePersonalCollection } from './lib/usePersonalCollection'
import type { PlaySessionsApi } from './lib/useGamePlaySessions'

type PersonalApi = ReturnType<typeof usePersonalCollection>
type Tab = 'want' | 'played'

export default function MyList({
  boardGames,
  personal,
  playSessions,
  isOpen,
  onClose,
  onOpenGame,
  renderCover,
}: {
  boardGames: BoardGame[]
  personal: PersonalApi
  playSessions: PlaySessionsApi
  isOpen: boolean
  onClose: () => void
  onOpenGame: (game: BoardGame) => void
  renderCover: (game: BoardGame) => ReactNode
}) {
  const [tab, setTab] = useState<Tab>('want')

  const wantGames = useMemo(
    () => boardGames.filter((game) => personal.entries[game.bggName]?.wantToPlay),
    [boardGames, personal.entries],
  )
  const playedGames = useMemo(
    () => boardGames.filter((game) => personal.entries[game.bggName]?.played),
    [boardGames, personal.entries],
  )

  if (!isOpen) return null

  const shown = tab === 'want' ? wantGames : playedGames
  const isLoading = personal.isLoggedIn && personal.status === 'loading'

  return (
    <>
      <div className="mylist-backdrop" onClick={onClose} />
      <aside className="mylist-drawer" role="dialog" aria-label="我的桌遊">
        <div className="mylist-header">
          <h2>我的桌遊</h2>
          <button
            className="mylist-close"
            type="button"
            aria-label="關閉"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="mylist-tabs">
          <button
            type="button"
            className={`mylist-tab ${tab === 'want' ? 'active' : ''}`}
            onClick={() => setTab('want')}
          >
            ♥ 想玩（{wantGames.length}）
          </button>
          <button
            type="button"
            className={`mylist-tab ${tab === 'played' ? 'active' : ''}`}
            onClick={() => setTab('played')}
          >
            ✓ 已玩（{playedGames.length}）
          </button>
        </div>

        <div className="mylist-body">
          {!personal.isLoggedIn && (
            <p className="mylist-hint">
              目前存在這個瀏覽器；用 Google 登入後可跨裝置保存。
            </p>
          )}

          {isLoading ? (
            <p className="mylist-empty">讀取中…</p>
          ) : shown.length === 0 ? (
            <p className="mylist-empty">
              {tab === 'want'
                ? '還沒有想玩的遊戲。在遊戲封面按 ♥，就會出現在這裡。'
                : '還沒有已玩的遊戲。在遊戲封面按 ✓，就會出現在這裡。'}
            </p>
          ) : (
            <ul className="mylist-list">
              {shown.map((game) => {
                const entry = personal.entries[game.bggName]
                const summary = playSessions.getSummary(game.bggName)
                const total = (entry?.playCount ?? 0) + summary.count
                return (
                  <li className="mylist-item" key={game.bggName}>
                    <div className="mylist-thumb">{renderCover(game)}</div>
                    <div className="mylist-info">
                      <button
                        type="button"
                        className="mylist-name"
                        onClick={() => onOpenGame(game)}
                      >
                        {game.name}
                      </button>
                      {total > 0 && (
                        <p className="mylist-meta">
                          玩過 {total} 次
                          {summary.lastPlayedOn &&
                            ` · 最近：${summary.lastPlayedOn.replaceAll('-', '/')}`}
                        </p>
                      )}
                      {entry?.note && (
                        <p className="mylist-note">{entry.note}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="mylist-remove"
                      disabled={!personal.canEdit}
                      onClick={() =>
                        personal.updateEntry(
                          game.bggName,
                          tab === 'want'
                            ? { wantToPlay: false }
                            : { played: false },
                        )
                      }
                    >
                      移除
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}