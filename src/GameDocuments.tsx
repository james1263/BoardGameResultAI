import { useState } from 'react'
import {
  isSafeUrl,
  type DocLanguage,
  type DocType,
  type GameDocument,
  type GameDocumentsApi,
} from './lib/useGameDocuments'
import { submitRuleSubmission, SUB_LIMITS } from './lib/useRuleSubmissions'
import {
  docIcon,
  docKind,
  docLabel,
  indexSuffix,
  type DocKind3,
} from './lib/docLabels'
import { askConfirm } from './lib/askConfirm'
import './styles/game-docs.css'

// 組標題只是小標籤，不是按鈕；每份文件自己一列
const GROUPS: { kind: DocKind3; title: string; adminOnly?: boolean }[] = [
  { kind: 'web', title: '網頁與規則連結' },
  { kind: 'video', title: '教學影片' },
  { kind: 'pdf', title: '規則書 PDF（只有管理者看得到，供搜尋用）', adminOnly: true },
]

function isVideoUrl(url: string): boolean {
  return /^https?:\/\/([a-z0-9-]+\.)*(youtube\.com|youtu\.be|bilibili\.com|b23\.tv|vimeo\.com)\//i.test(
    url.trim(),
  )
}

// 在彈窗內直接新增連結：管理者直接新增；VIP 送出投稿（管理者審核後才採用）
function LinkAdd({
  api,
  bggName,
  isAdmin,
}: {
  api: GameDocumentsApi
  bggName: string
  isAdmin: boolean
}) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function send() {
    setError('')
    setMessage('')
    if (!url.trim()) {
      setError('請貼上網址。')
      return
    }
    setBusy(true)
    let result: string | null
    if (isAdmin) {
      const type: DocType = isVideoUrl(url) ? 'video' : 'other'
      const lang: DocLanguage =
        type === 'video' ? 'other' : /[\u4e00-\u9fff]/.test(title) ? 'zh' : 'en'
      result = (await api.addDoc({ docType: type, language: lang, title: title.trim(), url: url.trim() })) || null
    } else {
      result = await submitRuleSubmission({
        id: null,
        kind: 'link',
        bggName,
        title: title.trim(),
        value: url.trim(),
        note: '',
      })
    }
    setBusy(false)
    if (result) {
      setError(result)
      return
    }
    setMessage(isAdmin ? '已新增連結。' : '已送出，管理者審核通過後才會出現在這裡。')
    setUrl('')
    setTitle('')
    setOpen(false)
  }

  return (
    <div className="er-form">
      {message && <p className="er-note">{message}</p>}
      {!open ? (
        <button
          type="button"
          className="ma-btn"
          style={{ width: '100%', padding: '12px' }}
          onClick={() => {
            setMessage('')
            setOpen(true)
          }}
        >
          {isAdmin ? '＋ 新增連結' : '＋ 投稿規則連結／影片'}
        </button>
      ) : (
        <>
          <label className="admin-field">
            <span>網址</span>
            <input
              type="url"
              value={url}
              maxLength={SUB_LIMITS.url}
              placeholder="https://…"
              onChange={(e) => setUrl(e.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>標題（{isAdmin ? '選填' : '建議填寫'}，{title.length}/{SUB_LIMITS.linkTitle}）</span>
            <input
              type="text"
              value={title}
              maxLength={SUB_LIMITS.linkTitle}
              placeholder="例如：官方 FAQ、教學影片"
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          {error && <p className="admin-error">{error}</p>}
          <div className="rb-actions">
            <button type="button" className="ma-btn" disabled={busy} onClick={() => void send()}>
              {busy ? '送出中…' : isAdmin ? '新增連結' : '送出投稿'}
            </button>
            <button type="button" className="admin-link" onClick={() => setOpen(false)}>
              取消
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function GameDocuments({
  api,
  isAdmin,
  bggName,
  canSubmit = false,
}: {
  api: GameDocumentsApi
  isAdmin: boolean
  bggName: string
  // VIP（非管理者）可投稿連結
  canSubmit?: boolean
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
    if (!(await askConfirm(text))) return
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
          <div className="gd-group" key={group.kind}>
            <p className="gd-label">{group.title}</p>
            <ul className="gd-list">
              {items.map((doc) => (
                <li className="gd-row" key={doc.id}>
                  {doc.source_type === 'external' &&
                  isSafeUrl(doc.external_url) ? (
                    <a
                      className="gd-link"
                      href={doc.external_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="gd-icon" aria-hidden="true">
                        {docIcon(doc)}
                      </span>
                      <span className="gd-name">{docLabel(doc)}</span>
                      <span className="gd-go" aria-hidden="true">
                        ↗
                      </span>
                    </a>
                  ) : (
                    <span className="gd-link gd-plain">
                      <span className="gd-icon" aria-hidden="true">
                        {docIcon(doc)}
                      </span>
                      <span className="gd-name">
                        {docLabel(doc)}
                        {isAdmin && indexSuffix(doc)}
                      </span>
                    </span>
                  )}

                  {isAdmin && (
                    <button
                      className="gd-del"
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

      {(isAdmin || canSubmit) && <LinkAdd api={api} bggName={bggName} isAdmin={isAdmin} />}
    </div>
  )
}
