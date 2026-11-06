import { useState } from 'react'
import type { LibraryGame } from '../lib/libraryTypes'
import CoverImage from './CoverImage'
import { askConfirm } from '../lib/askConfirm'
import { cleanupGameData } from '../lib/gameCleanup'

export default function TrashSection({
  games,
  isAdmin,
  coverVersions,
  busyName,
  onRestore,
  onDelete,
  onEditReason,
}: {
  games: LibraryGame[]
  isAdmin: boolean
  coverVersions: Record<string, number>
  busyName: string | null
  onRestore: (game: LibraryGame) => void
  onDelete: (game: LibraryGame) => void
  onEditReason: (game: LibraryGame) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cleaning, setCleaning] = useState(false)
  const [cleanMsg, setCleanMsg] = useState('')
  const [progress, setProgress] = useState(0)

  if (games.length === 0) return null

  const norm = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '')
  const q = norm(query)
  const shown = q
    ? games.filter(
        (game) =>
          norm(game.name).includes(q) ||
          norm(game.bggName).includes(q) ||
          norm(game.removedReason ?? '').includes(q),
      )
    : games

  // 以前丟進垃圾桶的遊戲，附屬資料（規則書、擴充、背景、詞庫）可能還在，一次清掉
  async function cleanAll() {
    const ok = await askConfirm(
      `要清掉垃圾桶裡 ${games.length} 款遊戲的附屬資料嗎？\n規則書 PDF 與索引、擴充（含圖片）、背景介紹、詞庫都會刪除，只留封面與基本資料，無法復原。`,
    )
    if (!ok) return
    setCleaning(true)
    setCleanMsg('')
    setProgress(0)
    const problems: string[] = []
    for (const game of games) {
      const result = await cleanupGameData(game.bggName)
      if (result.errors.length > 0 || result.warnings.length > 0) {
        problems.push(`${game.name}：` + [...result.errors, ...result.warnings].join('；'))
      }
      setProgress((current) => current + 1)
    }
    setCleaning(false)
    setCleanMsg(
      problems.length === 0
        ? `已清理 ${games.length} 款遊戲的附屬資料。`
        : `清理完成，但有 ${problems.length} 款沒有完全清乾淨：\n` + problems.join('\n'),
    )
  }

  const sorted = [...shown].sort(
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
        <input
          type="search"
          className="rb-search"
          placeholder="搜尋垃圾桶裡的遊戲（名稱、英文名或原因）"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          style={{ width: '100%', margin: '8px 0' }}
        />
      )}
      {isOpen && isAdmin && (
        <p style={{ fontSize: 13, margin: '4px 0 8px' }}>
          <button
            type="button"
            className="trash-restore"
            disabled={cleaning}
            onClick={() => void cleanAll()}
          >
            {cleaning
              ? `清理中 ${progress} / ${games.length}`
              : '清掉全部垃圾桶遊戲的附屬資料'}
          </button>
          {cleanMsg && (
            <span style={{ display: 'block', whiteSpace: 'pre-wrap', marginTop: 4 }}>
              {cleanMsg}
            </span>
          )}
        </p>
      )}
      {isOpen && q && sorted.length === 0 && (
        <p style={{ fontSize: 13, margin: '8px 0' }}>垃圾桶裡沒有符合的遊戲。</p>
      )}
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
                      onClick={() => onEditReason(game)}
                    >
                      編輯原因
                    </button>
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
