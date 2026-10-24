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

function docLabel(doc: GameDocument): string {
  // 中文介紹：直接用標題，沒填標題就顯示「中文介紹」
  if (doc.doc_type === 'intro') return doc.title || '中文介紹'
  if (doc.doc_type === 'video') return doc.title || '影片'
  return `${DOC_TYPE_LABELS[doc.doc_type]}（${LANGUAGE_LABELS[doc.language]}）${doc.title ? '：' + doc.title : ''}`
}

export default function GameDocuments({
  api,
  isAdmin,
}: {
  api: GameDocumentsApi
  isAdmin: boolean
}) {
  const { docs, isLoading, loadError, addDoc, deleteDoc } = api

  const [docType, setDocType] = useState<DocType>('rulebook')
  const [language, setLanguage] = useState<DocLanguage>('zh')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // 中文介紹顯示在視窗頂部；訪客這裡只列規則書等文件，管理者全部都列（才能刪除）
  const otherDocs = docs.filter(
    (doc) => doc.doc_type !== 'intro' && doc.doc_type !== 'video',
  )
  const listedDocs = isAdmin ? docs : otherDocs

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

  async function handleDelete(doc: GameDocument) {
    if (!window.confirm('確定要刪除這份文件連結嗎？')) return
    setFormError('')

    const message = await deleteDoc(doc)
    if (message) setFormError(message)
  }

  return (
    <div className="game-docs">
      <p className="eyebrow">RULEBOOKS &amp; FAQ</p>

      {isLoading && <p>載入文件中…</p>}
      {loadError && <p className="admin-error">{loadError}</p>}

      {!isLoading && !loadError && otherDocs.length === 0 && (
        <p className="game-docs-empty">尚未提供規則書或 FAQ 連結。</p>
      )}

      {listedDocs.length > 0 && (
        <ul>
          {listedDocs.map((doc) => (
            <li className="game-docs-item" key={doc.id}>
              {doc.source_type === 'external' && isSafeUrl(doc.external_url) ? (
                <a
                  className="bgg-link"
                  href={doc.external_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {docLabel(doc)} ↗
                </a>
              ) : (
                <span>{docLabel(doc)}</span>
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
      )}

      {isAdmin && (
        <form className="doc-form" onSubmit={handleAdd}>
          <strong>新增文件連結</strong>

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
              <option value="intro">中文介紹（顯示在視窗頂部）</option>
              <option value="video">影片（顯示在視窗頂部，AI 不會參考）</option>
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
            <span>
              標題（可不填；中文介紹會直接顯示這個標題，例如：巴哈介紹）
            </span>
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
    </div>
  )
}