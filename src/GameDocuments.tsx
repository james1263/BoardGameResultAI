import { useEffect, useRef, useState } from 'react'
import { supabase } from './lib/supabase'
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
import UploadModal from './components/UploadModal'
import GamePdfUpload from './components/GamePdfUpload'
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
  const [titleLoading, setTitleLoading] = useState(false)
  const [titleHint, setTitleHint] = useState('')
  // 記住自動帶入的標題：換貼別的連結時可覆蓋，自己改過的標題則不動
  const autoTitleRef = useRef('')

  // 貼 YouTube／Bilibili 連結時自動帶入影片名稱（Bilibili 要管理者，走 Edge Function video-title）
  useEffect(() => {
    if (!open) return
    const raw = url.trim()
    const isYoutube = /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(raw)
    const isBilibili = /^https?:\/\/([a-z0-9-]+\.)*(bilibili\.com|b23\.tv)\//i.test(raw)
    // Bilibili 會封鎖伺服器抓標題（-412），只提示自己填；YouTube 仍可自動帶入
    setTitleHint(isBilibili ? 'Bilibili 不開放自動抓標題，請自己填標題。' : '')
    if (!isYoutube) {
      setTitleLoading(false)
      return
    }
    let cleanUrl = raw
    if (isBilibili && !/b23\.tv/i.test(raw)) {
      try {
        const parsed = new URL(raw)
        const part = parsed.searchParams.get('p')
        cleanUrl = parsed.origin + parsed.pathname + (part ? `?p=${part}` : '')
      } catch {
        cleanUrl = raw
      }
    }
    let cancelled = false
    setTitleLoading(true)
    const timer = window.setTimeout(() => {
      const request: Promise<string> = isYoutube
        ? fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(raw))
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => (data && typeof data.title === 'string' ? data.title : ''))
        : supabase.functions.invoke('video-title', { body: { url: cleanUrl } }).then(({ data, error }) => {
            if (error) throw new Error(error.message || '呼叫失敗')
            return data && typeof data.title === 'string' ? data.title : ''
          })
      request
        .then((found) => {
          if (cancelled) return
          if (!found) {
            setTitleHint('抓不到影片名稱，請自己填標題。')
            return
          }
          const clipped = found.slice(0, SUB_LIMITS.linkTitle)
          setTitle((current) => (!current || current === autoTitleRef.current ? clipped : current))
          autoTitleRef.current = clipped
        })
        .catch((err: unknown) => {
          if (cancelled) return
          setTitleHint(`抓不到影片名稱（${err instanceof Error ? err.message : '未知錯誤'}），請自己填標題。`)
        })
        .finally(() => {
          if (!cancelled) setTitleLoading(false)
        })
    }, 250)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [url, open, isAdmin])

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
    autoTitleRef.current = ''
    setOpen(false)
  }

  return (
    <div className="er-form">
      {message && <p className="er-note">{message}</p>}
      <button
        type="button"
        className="ma-btn"
        style={{ width: '100%', padding: '12px' }}
        onClick={() => {
          setMessage('')
          setError('')
          setOpen(true)
        }}
      >
        {isAdmin ? '＋ 新增連結' : '＋ 投稿規則連結／影片'}
      </button>
      {open && (
        <UploadModal
          title={isAdmin ? '新增連結' : '投稿規則連結／影片'}
          locked={busy}
          onClose={() => setOpen(false)}
        >
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
          {titleLoading && <p className="rb-hint">正在抓影片名稱…</p>}
          {titleHint && <p className="rb-hint">{titleHint}</p>}
          {error && <p className="admin-error">{error}</p>}
          <div className="rb-actions">
            <button type="button" className="ma-btn" disabled={busy} onClick={() => void send()}>
              {busy ? '送出中…' : isAdmin ? '新增連結' : '送出投稿'}
            </button>
            <button type="button" className="admin-link" disabled={busy} onClick={() => setOpen(false)}>
              取消
            </button>
          </div>
        </UploadModal>
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
  const [pdfOpen, setPdfOpen] = useState(false)

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
      {isAdmin && (
        <div className="er-form">
          <button
            type="button"
            className="ma-btn"
            style={{ width: '100%', padding: '12px' }}
            onClick={() => setPdfOpen(true)}
          >
            ＋ 上傳 PDF
          </button>
        </div>
      )}
      {pdfOpen && (
        <GamePdfUpload
          bggName={bggName}
          onClose={() => setPdfOpen(false)}
          upload={api.uploadDoc}
        />
      )}
    </div>
  )
}
