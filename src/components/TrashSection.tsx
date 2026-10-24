import { useState } from 'react'
import type { LibraryGame } from '../lib/libraryTypes'
import CoverImage from './CoverImage'

export default function TrashSection({
  games,
  isAdmin,
  coverVersions,
  busyName,
  onRestore,
  onDelete,
}: {
  games: LibraryGame[]
  isAdmin: boolean
  coverVersions: Record<string, number>
  busyName: string | null
  onRestore: (game: LibraryGame) => void
  onDelete: (game: LibraryGame) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  if (games.length === 0) return null

  const sorted = [...games].sort(
    (a, b) =>
      new Date(b.removedAt ?? 0).getTime() -
      new Date(a.removedAt ?? 0).getTime(),
  )

  return (
    <section className="trash-section" aria-label="垃圾桶">
      <button
        className="trash-toggle"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>
          {isOpen ? '▾' : '▸'} 垃圾桶（{games.length}）
        </span>
        <small>{isAdmin ? '可還原或永久刪除' : '已從收藏移除的遊戲'}</small>
      </button>

      {isOpen && (
        <ul className="trash-list">
          {sorted.map((game) => {
            const busy = busyName === game.bggName
            return (
              <li className="trash-item" key={game.bggName}>
                <div className="trash-cover-wrap">
                  <CoverImage
                    key={`${game.coverSlug}-${coverVersions[game.coverSlug] ?? 0}`}
                    version={coverVersions[game.coverSlug] ?? 0}
                    slug={game.coverSlug}
                    alt={game.name}
                    className="trash-cover"
                    fallback={<span aria-hidden="true">🎲</span>}
                  />
                </div>
                <div className="trash-info">
                  <span className="trash-name">{game.name}</span>
                  <small>
                    移除於{' '}
                    {game.removedAt
                      ? new Date(game.removedAt).toLocaleDateString('zh-TW')
                      : '—'}
                  </small>
                  {game.removedReason && (
                    <small className="trash-reason">
                      原因：{game.removedReason}
                    </small>
                  )}
                </div>
                {isAdmin && (
                  <div className="trash-actions">
                    <button
                      type="button"
                      className="trash-restore"
                      disabled={busy}
                      onClick={() => onRestore(game)}
                    >
                      還原
                    </button>
                    <button
                      type="button"
                      className="trash-delete"
                      disabled={busy}
                      onClick={() => onDelete(game)}
                    >
                      永久刪除
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
