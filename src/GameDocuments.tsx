import { useState } from 'react'
import {
  isSafeUrl,
  type GameDocument,
  type GameDocumentsApi,
} from './lib/useGameDocuments'
import {
  docIcon,
  docKind,
  docLabel,
  indexSuffix,
  type DocKind3,
} from './lib/docLabels'

const GROUPS: { kind: DocKind3; title: string; adminOnly?: boolean }[] = [
  { kind: 'web', title: '🔗 網頁與規則連結' },
  { kind: 'video', title: '▶ 教學影片' },
  { kind: 'pdf', title: '📄 規則書 PDF（只有管理者看得到，供搜尋用）', adminOnly: true },
]

export default function GameDocuments({
  api,
  isAdmin,
}: {
  api: GameDocumentsApi
  isAdmin: boolean
}) {
  const { docs, isLoading, loadError, deleteDoc } = api
  const [error, setError] = useState('')

  // 一般人只看得到外部連結；上傳的 PDF 是私有的，只有管理者看得到
  const visibleDocs = isAdmin
    ? docs
    : docs.filter((doc) => doc.source_type === 'external')

  async function handleDelete(doc: GameDocument) {
    const text =
      doc.source_type === 'upload'
        ? '確定要刪除這份文件嗎？PDF 原檔與搜尋索引都會一起刪除，無法復原。'
        : '確定要刪除這份文件連結嗎？'
    if (!window.confirm(text)) return
    setError('')

    const message = await deleteDoc(doc)
    if (message) setError(message)
  }

  return (
    <div className="game-docs">
      {isLoading && <p>載入文件中…</p>}
      {loadError && <p className="admin-error">{loadError}</p>}
      {error && <p className="admin-error">{error}</p>}

      {!isLoading && !loadError && visibleDocs.length === 0 && (
        <p className="game-docs-empty">
          這款還沒有教學影片或規則連結。
        </p>
      )}

      {GROUPS.map((group) => {
        if (group.adminOnly && !isAdmin) return null
        const items = visibleDocs.filter((doc) => docKind(doc) === group.kind)
        if (items.length === 0) return null

        return (
          <div className="docs-group" key={group.kind}>
            <h4 className="docs-group-title">{group.title}</h4>
            <ul>
              {items.map((doc) => (
                <li className="game-docs-item" key={doc.id}>
                  {doc.source_type === 'external' &&
                  isSafeUrl(doc.external_url) ? (
                    <a
                      className="bgg-link"
                      href={doc.external_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {docIcon(doc)} {docLabel(doc)} ↗
                    </a>
                  ) : (
                    <span>
                      {docIcon(doc)} {docLabel(doc)}
                      {isAdmin && indexSuffix(doc)}
                    </span>
                  )}

                  {isAdmin && (
                    <button
                      className="admin-link"
                      type="button"
                      onClick={() => handleDelete(doc)}
                    >
                      刪除
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      })}

      {isAdmin && (
        <p className="game-docs-empty">
          要新增規則書 PDF 或貼連結，請到「管理」→「規則書」。
        </p>
      )}
    </div>
  )
}