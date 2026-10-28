import { useState, type FormEvent } from 'react'
import {
  isSafeUrl,
  type DocLanguage,
  type DocType,
  type GameDocument,
  type GameDocumentsApi,
} from './lib/useGameDocuments'

const DOC_TYPE_LABELS: Record<DocType, string> = {
  rulebook: '規則書',
  faq: 'FAQ',
  errata: '勘誤',
  intro: '中文介紹',
  video: '影片',
  other: '其他',
}

const LANGUAGE_LABELS: Record<DocLanguage, string> = {
  zh: '中文',
  en: '英文',
  other: '其他語言',
}

const GROUPS: { title: string; types: DocType[] }[] = [
  { title: 'RULEBOOKS & FAQ', types: ['rulebook', 'faq', 'errata', 'other'] },
  { title: '中文介紹', types: ['intro'] },
  { title: '影片', types: ['video'] },
]

function docLabel(doc: GameDocument): string {
  if (doc.doc_type === 'intro') return doc.title || '中文介紹'
  if (doc.doc_type === 'video') return '▶ ' + (doc.title || '影片')
  return `${DOC_TYPE_LABELS[doc.doc_type]}（${LANGUAGE_LABELS[doc.language]}）${doc.title ? '：' + doc.title : ''}`
}

// 只給管理者看：上傳文件的索引狀態
function indexSuffix(doc: GameDocument): string {
  if (doc.source_type !== 'upload') return ''
  const edition = doc.edition ? `・${doc.edition}` : ''
  if (doc.index_status === 'completed') {
    return `｜PDF 已索引 ${doc.page_count ?? '?'} 頁${edition}`
  }
  if (doc.index_status === 'failed') {
    return `｜索引失敗${doc.index_error_code ? '（' + doc.index_error_code + '）' : ''}`
  }
  return '｜索引處理中'
}

export default function GameDocuments({
  api,
  isAdmin,
}: {
  api: GameDocumentsApi
  isAdmin: boolean
}) {
  const { docs, isLoading, loadError, addDoc, uploadDoc, deleteDoc } = api

  // 一般人只看得到外部連結；上傳的 PDF 是私有的，只有管理者看得到
  const visibleDocs = isAdmin
    ? docs
    : docs.filter((doc) => doc.source_type === 'external')

  const [docType, setDocType] = useState<DocType>('rulebook')
  const [language, setLanguage] = useState<DocLanguage>('zh')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [upType, setUpType] = useState<'rulebook' | 'faq' | 'errata'>('rulebook')
  const [upLang, setUpLang] = useState<'zh' | 'en'>('zh')
  const [upTitle, setUpTitle] = useState('')
  const [upEdition, setUpEdition] = useState('')
  const [upSource, setUpSource] = useState('')
  const [upFile, setUpFile] = useState<File | null>(null)
  const [fileKey, setFileKey] = useState(0)
  const [upBusy, setUpBusy] = useState(false)
  const [upProgress, setUpProgress] = useState('')
  const [upError, setUpError] = useState('')
  const [upDone, setUpDone] = useState('')

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    setFormError('')
    setIsSaving(true)

    const message = await addDoc({ docType, language, title, url })

    setIsSaving(false)

    if (message) {
      setFormError(message)
      return
    }

    setTitle('')
    setUrl('')
  }

  async function handleUpload(event: FormEvent) {
    event.preventDefault()
    if (!upFile) {
      setUpError('請先選擇 PDF 檔。')
      return
    }
    setUpError('')
    setUpDone('')
    setUpBusy(true)
    setUpProgress('準備中…')

    const message = await uploadDoc({
      file: upFile,
      docType: upType,
      language: upLang,
      title: upTitle,
      edition: upEdition,
      sourceNote: upSource,
      onProgress: setUpProgress,
    })

    setUpBusy(false)
    setUpProgress('')

    if (message) {
      setUpError(message)
      return
    }

    setUpTitle('')
    setUpEdition('')
    setUpFile(null)
    setFileKey((current) => current + 1)
    setUpDone('已上傳並建立索引。')
  }

  async function handleDelete(doc: GameDocument) {
    const text =
      doc.source_type === 'upload'
        ? '確定要刪除這份文件嗎？PDF 原檔與搜尋索引都會一起刪除，無法復原。'
        : '確定要刪除這份文件連結嗎？'
    if (!window.confirm(text)) return
    setFormError('')

    const message = await deleteDoc(doc)
    if (message) setFormError(message)
  }

  return (
    <div className="game-docs">
      {isLoading && <p>載入文件中…</p>}
      {loadError && <p className="admin-error">{loadError}</p>}

      {!isLoading && !loadError && visibleDocs.length === 0 && (
        <p className="game-docs-empty">
          尚未提供規則書、中文介紹或影片連結。
        </p>
      )}

      {GROUPS.map((group) => {
        const items = visibleDocs.filter((doc) =>
          group.types.includes(doc.doc_type),
        )
        if (items.length === 0) return null

        return (
          <div className="docs-group" key={group.title}>
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
                      {docLabel(doc)} ↗
                    </a>
                  ) : (
                    <span>
                      {docLabel(doc)}
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
        <form className="doc-form" onSubmit={handleAdd}>
          <strong>新增連結</strong>

          <label className="admin-field">
            <span>類型</span>
            <select
              value={docType}
              onChange={(event) => {
                const next = event.target.value as DocType
                setDocType(next)
                if (next === 'intro') setLanguage('zh')
              }}
            >
              <option value="rulebook">規則書</option>
              <option value="faq">FAQ</option>
              <option value="errata">勘誤</option>
              <option value="intro">中文介紹</option>
              <option value="video">影片（AI 不會參考）</option>
              <option value="other">其他</option>
            </select>
          </label>

          <label className="admin-field">
            <span>語言</span>
            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as DocLanguage)
              }
            >
              <option value="zh">中文</option>
              <option value="en">英文</option>
              <option value="other">其他語言</option>
            </select>
          </label>

          <label className="admin-field">
            <span>標題（可不填；中文介紹與影片會直接顯示這個標題）</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label className="admin-field">
            <span>網址</span>
            <input
              type="url"
              placeholder="https://"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
            />
          </label>

          {formError && <p className="admin-error">{formError}</p>}

          <button className="rule-button" type="submit" disabled={isSaving}>
            {isSaving ? '新增中…' : '新增'}
          </button>
        </form>
      )}

      {isAdmin && (
        <form className="doc-form" onSubmit={handleUpload}>
          <strong>上傳 PDF（供規則助手檢索，只有管理者看得到檔案）</strong>

          <label className="admin-field">
            <span>類型</span>
            <select
              value={upType}
              onChange={(event) =>
                setUpType(event.target.value as 'rulebook' | 'faq' | 'errata')
              }
            >
              <option value="rulebook">規則書</option>
              <option value="faq">FAQ</option>
              <option value="errata">勘誤</option>
            </select>
          </label>

          <label className="admin-field">
            <span>語言</span>
            <select
              value={upLang}
              onChange={(event) => setUpLang(event.target.value as 'zh' | 'en')}
            >
              <option value="zh">中文</option>
              <option value="en">英文</option>
            </select>
          </label>

          <label className="admin-field">
            <span>標題（可不填，會用檔名）</span>
            <input
              type="text"
              value={upTitle}
              onChange={(event) => setUpTitle(event.target.value)}
            />
          </label>

          <label className="admin-field">
            <span>版次說明（可不填，例如 2nd Edition）</span>
            <input
              type="text"
              value={upEdition}
              onChange={(event) => setUpEdition(event.target.value)}
            />
          </label>

          <label className="admin-field">
            <span>來源說明（可不填，例如 BGG、出版社官網、網頁另存成 PDF）</span>
            <input
              type="text"
              maxLength={200}
              value={upSource}
              onChange={(event) => setUpSource(event.target.value)}
            />
          </label>

          <label className="admin-field">
            <span>PDF 檔（文字版，最大 50 MB）</span>
            <input
              key={fileKey}
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => setUpFile(event.target.files?.[0] ?? null)}
            />
          </label>

          {upProgress && <p>{upProgress}</p>}
          {upError && <p className="admin-error">{upError}</p>}
          {upDone && <p>{upDone}</p>}

          <button className="rule-button" type="submit" disabled={upBusy}>
            {upBusy ? '處理中…' : '上傳並建立索引'}
          </button>
        </form>
      )}
    </div>
  )
}