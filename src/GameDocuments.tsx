import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from './lib/supabase'

type DocType = 'rulebook' | 'faq' | 'errata' | 'other'
type DocLanguage = 'zh' | 'en' | 'other'

type GameDocument = {
  id: string
  bgg_name: string
  doc_type: DocType
  language: DocLanguage
  title: string
  source_type: 'external' | 'upload'
  external_url: string
  storage_path: string
}

const DOC_TYPE_LABELS: Record<DocType, string> = {
  rulebook: '規則書',
  faq: 'FAQ',
  errata: '勘誤',
  other: '其他',
}

const LANGUAGE_LABELS: Record<DocLanguage, string> = {
  zh: '中文',
  en: '英文',
  other: '其他語言',
}

function isSafeUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

export default function GameDocuments({
  bggName,
  isAdmin,
}: {
  bggName: string
  isAdmin: boolean
}) {
  const [docs, setDocs] = useState<GameDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [docType, setDocType] = useState<DocType>('rulebook')
  const [language, setLanguage] = useState<DocLanguage>('zh')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    let cancelled = false

    supabase
      .from('game_documents')
      .select('*')
      .eq('bgg_name', bggName)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setLoadError('讀取文件失敗：' + error.message)
        } else {
          setLoadError('')
          setDocs((data ?? []) as GameDocument[])
        }
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [bggName, reloadKey])

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    setFormError('')

    const trimmedUrl = url.trim()
    if (!isSafeUrl(trimmedUrl)) {
      setFormError('網址必須以 http:// 或 https:// 開頭。')
      return
    }

    setIsSaving(true)

    const { error } = await supabase.from('game_documents').insert({
      bgg_name: bggName,
      doc_type: docType,
      language,
      title: title.trim(),
      source_type: 'external',
      external_url: trimmedUrl,
      storage_path: '',
    })

    setIsSaving(false)

    if (error) {
      setFormError('新增失敗：' + error.message)
      return
    }

    setTitle('')
    setUrl('')
    setReloadKey((current) => current + 1)
  }

  async function handleDelete(doc: GameDocument) {
    if (!window.confirm('確定要刪除這份文件連結嗎？')) return

    setFormError('')

    const { error } = await supabase
      .from('game_documents')
      .delete()
      .eq('id', doc.id)

    if (error) {
      setFormError('刪除失敗：' + error.message)
      return
    }

    setReloadKey((current) => current + 1)
  }

  return (
    <div className="game-docs">
      <p className="eyebrow">RULEBOOKS &amp; FAQ</p>

      {isLoading && <p>載入文件中…</p>}
      {loadError && <p className="admin-error">{loadError}</p>}

      {!isLoading && !loadError && docs.length === 0 && (
        <p className="game-docs-empty">尚未提供規則書或 FAQ 連結。</p>
      )}

      {docs.length > 0 && (
        <ul>
          {docs.map((doc) => {
            const label = `${DOC_TYPE_LABELS[doc.doc_type]}（${LANGUAGE_LABELS[doc.language]}）${doc.title ? '：' + doc.title : ''}`

            return (
              <li className="game-docs-item" key={doc.id}>
                {doc.source_type === 'external' &&
                isSafeUrl(doc.external_url) ? (
                  <a
                    className="bgg-link"
                    href={doc.external_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {label} ↗
                  </a>
                ) : (
                  <span>{label}</span>
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
            )
          })}
        </ul>
      )}

      {isAdmin && (
        <form className="doc-form" onSubmit={handleAdd}>
          <strong>新增文件連結</strong>

          <label className="admin-field">
            <span>類型</span>
            <select
              value={docType}
              onChange={(event) => setDocType(event.target.value as DocType)}
            >
              <option value="rulebook">規則書</option>
              <option value="faq">FAQ</option>
              <option value="errata">勘誤</option>
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
            <span>標題（可不填，例如：第二版、擴充）</span>
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